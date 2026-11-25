// Package casep2p builds src/data/presets/cases-pier2pier.js (cases tab, 2026-10-31): the Worthing–Brighton laser
// test of 2 and 23 February 2019 (Dr John D., "PIER2PIER 2 – Results & Observations", YouTube), from our
// transcription of the operators' slides (data/cases/pier2pier/transcription/: their thermometer tables, their trials,
// the sites) and the two evenings' air, sea and tide (data/cases/pier2pier/raw/, fog fetch cases-pier2pier):
//
//   - ERA5 at the sea cell 50.75° N 0.25° W (Open-Meteo, cell_selection=sea), 17:00–22:00 UTC: 2 m temperature and dew
//     point, surface pressure, 10 m wind, cloud cover;
//   - the METAR of Shoreham Airport (EGKA, Iowa Environmental Mesonet), halfway along the line, while it reported;
//   - the Newhaven tide gauge (IOC SLSMF, code nhav), every 15 min, 12:00–24:00 UTC, in the gauge's own datum;
//   - NOAA OISST v2.1 at the two cells off the line (50.625° N, 0.375° and 0.125° W), daily.
//
// The distances between the sites are great-circle distances on a sphere of radius R = 6,371 km (the radius enters:
// the case is a check, not a measurement). The ray tracing itself is done by the page (src/tabs/ref/laser.js), on
// these numbers.
package casep2p

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Dir = "data/cases/pier2pier"
	Out = "src/data/presets/cases-pier2pier.js"
	R   = 6371000.0
)

// Dates are the two evenings of the presentation.
var Dates = []string{"2019-02-02", "2019-02-23"}

func readCSV(root, name string) ([][]string, error) {
	f, err := os.Open(filepath.Join(root, Dir, name))
	if err != nil {
		return nil, err
	}
	defer f.Close()
	r := csv.NewReader(f)
	r.Comment = '#'
	r.FieldsPerRecord = -1
	return r.ReadAll()
}

// num reads a cell; an empty cell is nil (the slide has no value there).
func num(s string) (any, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, nil
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return nil, err
	}
	return v, nil
}

// GC is the great-circle distance (m) on a sphere of radius R.
func GC(lat1, lon1, lat2, lon2 float64) float64 {
	r := math.Pi / 180
	c := math.Sin(lat1*r)*math.Sin(lat2*r) + math.Cos(lat1*r)*math.Cos(lat2*r)*math.Cos((lon2-lon1)*r)
	return R * math.Acos(math.Max(-1, math.Min(1, c)))
}

// Compute reads the transcription and the raw answers.
func Compute(root string) (pyjson.Obj, error) {
	// les lieux
	rows, err := readCSV(root, "transcription/sites.csv")
	if err != nil {
		return nil, err
	}
	type site struct{ lat, lon float64 }
	sites := map[string]site{}
	var siteOut []any
	for _, r := range rows {
		lat, e1 := strconv.ParseFloat(r[1], 64)
		lon, e2 := strconv.ParseFloat(r[2], 64)
		if e1 != nil || e2 != nil {
			return nil, fmt.Errorf("sites.csv: %v", r)
		}
		sites[r[0]] = site{lat, lon}
		siteOut = append(siteOut, pyjson.Obj{{K: "name", V: r[0]}, {K: "lat", V: lat}, {K: "lon", V: lon}, {K: "note", V: r[3]}})
	}
	w, b, i := sites["worthing"], sites["brighton"], sites["i360"]
	dist := pyjson.Obj{
		{K: "wb", V: pyjson.Round(GC(w.lat, w.lon, b.lat, b.lon), 0)},
		{K: "wi360", V: pyjson.Round(GC(w.lat, w.lon, i.lat, i.lon), 0)},
	}
	// leurs thermomètres
	rows, err = readCSV(root, "transcription/thermometers.csv")
	if err != nil {
		return nil, err
	}
	therm := map[string][]any{}
	for _, r := range rows {
		cells := make([]any, 0, 5)
		for _, c := range r[1:5] {
			v, err := num(c)
			if err != nil {
				return nil, fmt.Errorf("thermometers.csv %v: %w", r, err)
			}
			cells = append(cells, v)
		}
		therm[r[0]] = append(therm[r[0]], append(cells, r[5]))
	}
	// les essais
	rows, err = readCSV(root, "transcription/trials.csv")
	if err != nil {
		return nil, err
	}
	var trials []any
	for _, r := range rows {
		hs, e1 := strconv.ParseFloat(r[3], 64)
		hc, e2 := strconv.ParseFloat(r[5], 64)
		if e1 != nil || e2 != nil {
			return nil, fmt.Errorf("trials.csv: %v", r)
		}
		trials = append(trials, pyjson.Obj{{K: "date", V: r[0]}, {K: "time", V: r[1]}, {K: "from", V: r[2]}, {K: "hs", V: hs},
			{K: "to", V: r[4]}, {K: "hc", V: hc}, {K: "seen", V: r[6] == "yes"}, {K: "note", V: r[7]}})
	}
	// les soirs : ERA5, METAR, marée, OISST
	var evenings pyjson.Obj
	for _, d := range Dates {
		ev, err := evening(root, d)
		if err != nil {
			return nil, err
		}
		evenings = append(evenings, pyjson.KV{K: d, V: ev})
	}
	return pyjson.Obj{
		{K: "sites", V: siteOut}, {K: "dist", V: dist},
		{K: "therm", V: pyjson.Obj{{K: "worthing", V: therm["worthing"]}, {K: "brighton", V: therm["brighton"]}}},
		{K: "trials", V: trials}, {K: "evenings", V: evenings},
	}, nil
}

func evening(root, d string) (pyjson.Obj, error) {
	// ERA5, 17 h à 22 h UTC
	raw, err := os.ReadFile(filepath.Join(root, Dir, "raw", "era5-sea-"+d+".json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch cases-pier2pier)", err)
	}
	var e struct {
		Lat    json.Number                `json:"latitude"`
		Lon    json.Number                `json:"longitude"`
		Hourly map[string]json.RawMessage `json:"hourly"`
	}
	if err := json.Unmarshal(raw, &e); err != nil {
		return nil, err
	}
	keys := []string{"temperature_2m", "dew_point_2m", "surface_pressure", "wind_speed_10m", "wind_direction_10m", "cloud_cover"}
	cols := make([][]float64, len(keys))
	for k, key := range keys {
		if err := json.Unmarshal(e.Hourly[key], &cols[k]); err != nil {
			return nil, fmt.Errorf("era5 %s %s: %w", d, key, err)
		}
	}
	var era []any
	for h := 17; h <= 22; h++ {
		row := []float64{float64(h)}
		for k := range keys {
			if h >= len(cols[k]) {
				return nil, fmt.Errorf("era5 %s: %d values", d, len(cols[k]))
			}
			row = append(row, cols[k][h])
		}
		era = append(era, row)
	}
	// METAR (heure, T, Td, nœuds, direction ; M = absent)
	rows, err := readCSV(root, "raw/metar-egka-"+d+".csv")
	if err != nil {
		return nil, err
	}
	var metar []any
	for _, r := range rows[1:] {
		if len(r) < 9 {
			continue
		}
		cell := func(s string) any {
			v, err := strconv.ParseFloat(s, 64)
			if err != nil {
				return nil
			}
			return v
		}
		metar = append(metar, []any{r[1][11:16], cell(r[4]), cell(r[5]), cell(r[6]), cell(r[7]), r[8]})
	}
	// marée de Newhaven (niveau du marégraphe, m)
	raw, err = os.ReadFile(filepath.Join(root, Dir, "raw", "tide-nhav-"+d+".json"))
	if err != nil {
		return nil, err
	}
	var tide []struct {
		L float64 `json:"slevel"`
		T string  `json:"stime"`
	}
	if err := json.Unmarshal(raw, &tide); err != nil {
		return nil, err
	}
	var tout []any
	for _, t := range tide {
		tout = append(tout, []any{t.T[11:16], pyjson.Round(t.L, 3)})
	}
	// OISST, les deux cellules au large
	rows, err = readCSV(root, "raw/oisst.csv")
	if err != nil {
		return nil, err
	}
	var sst []any
	for _, r := range rows[2:] {
		if strings.HasPrefix(r[0], d) {
			v, err := strconv.ParseFloat(r[4], 64)
			if err != nil {
				return nil, fmt.Errorf("oisst %v", r)
			}
			sst = append(sst, v)
		}
	}
	return pyjson.Obj{{K: "era5", V: era}, {K: "era5cell", V: []any{e.Lat, e.Lon}}, {K: "metar", V: metar}, {K: "tide", V: tout}, {K: "sst", V: sst}}, nil
}

// File renders the preset.
func File(out pyjson.Obj) preset.File {
	return preset.File{
		Out: Out, Command: "build cases-pier2pier", Inputs: []string{Dir + "/inputs.lock"},
		Notes: []string{
			"The Worthing–Brighton laser test of 2 and 23 February 2019 (cases tab): our transcription of the operators' slides",
			"(Dr John D., PIER2PIER 2), and the evenings' ERA5 (17-22 h UTC: T, Td, P, wind km/h, direction, cloud %), Shoreham",
			"METAR, Newhaven tide gauge and OISST. therm rows: [height m, thermometer A °C, thermometer B °C, RH %, as printed].",
		},
		Body: "export const CASE_P2P = " + pyjson.Dumps(out, pyjson.Default) + ";\n",
	}
}
