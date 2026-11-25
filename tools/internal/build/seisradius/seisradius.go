// Package seisradius builds the seis tab's real-data radius
// reconstruction (epic05/UC02) from data/seis/: events.json (the ONLY file
// to edit to add an earthquake), the raw ISC bulletins raw/<key>.isf and
// the Natural Earth 1:50m land polygons. Port of
// scripts/build_seis_radius.py (epic24/UC02). It writes
// src/data/presets/seis-radius.js, data/seis/lr_arrivals.json and .csv.
//
// Per event: every timed LR/MLR (Rayleigh) arrival, one row per station
// (median travel time across agencies), kept at 20-160 degrees (the
// validity range of the IASPEI Ms_20 standard, source n14 of the tab).
// distance_deg comes from the published epicentre and station coordinates
// with the same great-circle formula as the tab's seisDelta(), never from
// ISC's own distance column. ocean_frac is the share of the great-circle
// PATH (sampled every ~0.5 degree) that lies over sea.
package seisradius

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf8"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
	"flatorglobe/tools/internal/stats"
)

const (
	Dir     = "data/seis"
	Events  = Dir + "/events.json"
	RawDir  = Dir + "/raw"
	Land    = RawDir + "/ne_50m_land.geojson"
	Out     = "src/data/presets/seis-radius.js"
	OutJSON = Dir + "/lr_arrivals.json"
	OutCSV  = Dir + "/lr_arrivals.csv"
)

// Event is one entry of events.json; lat/lon keep their JSON spelling.
type Event struct {
	Key         string      `json:"key"`
	Name        string      `json:"name"`
	Date        string      `json:"date"`
	OTime       string      `json:"otime"`
	Lat         json.Number `json:"lat"`
	Lon         json.Number `json:"lon"`
	MinMag      json.Number `json:"min_mag"`
	SearchStart string      `json:"search_start"`
	SearchEnd   string      `json:"search_end"`
}

func (e Event) latLon() (float64, float64) {
	la, _ := e.Lat.Float64()
	lo, _ := e.Lon.Float64()
	return la, lo
}

// ReadEvents reads the manifest strictly.
func ReadEvents(root string) ([]Event, error) {
	b, err := os.ReadFile(filepath.Join(root, Events))
	if err != nil {
		return nil, err
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields()
	dec.UseNumber()
	var evs []Event
	if err := dec.Decode(&evs); err != nil {
		return nil, fmt.Errorf("%s: %w", Events, err)
	}
	for _, e := range evs {
		if _, err := toSeconds(e.OTime); err != nil || e.Key == "" {
			return nil, fmt.Errorf("%s: event %q: key and otime h:mm:ss.ss are required", Events, e.Key)
		}
		if _, err := e.Lat.Float64(); err != nil {
			return nil, fmt.Errorf("%s: event %q: lat", Events, e.Key)
		}
		if _, err := e.Lon.Float64(); err != nil {
			return nil, fmt.Errorf("%s: event %q: lon", Events, e.Key)
		}
	}
	return evs, nil
}

func toSeconds(hms string) (float64, error) {
	p := strings.Split(hms, ":")
	if len(p) != 3 {
		return 0, fmt.Errorf("time %q", hms)
	}
	h, e1 := strconv.Atoi(p[0])
	m, e2 := strconv.Atoi(p[1])
	s, e3 := strconv.ParseFloat(p[2], 64)
	if e1 != nil || e2 != nil || e3 != nil {
		return 0, fmt.Errorf("time %q", hms)
	}
	return float64(h*3600+m*60) + s, nil
}

// GreatCircleDeg is the script's (and seisDelta()'s) spherical law of
// cosines, in degrees. Products are rounded before the sum (no FMA).
func GreatCircleDeg(la1, lo1, la2, lo2 float64) float64 {
	p1, p2 := pymath.Radians(la1), pymath.Radians(la2)
	dl := pymath.Radians(lo2 - lo1)
	c := float64(math.Sin(p1)*math.Sin(p2)) + float64(float64(math.Cos(p1)*math.Cos(p2))*math.Cos(dl))
	return pymath.Degrees(math.Acos(math.Max(-1, math.Min(1, c))))
}

var (
	leadRe = regexp.MustCompile(`^([A-Za-z0-9]{2,8})\s+(\d{1,3}\.\d+)\s+(\d{1,3}\.\d+)\s+(M?LR)\s+(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)\b`)
	tailRe = regexp.MustCompile(`(-?\d{1,3}\.\d{2,6})\s+(-?\d{1,3}\.\d{2,6})\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$`)
)

// Row is one station's arrival.
type Row struct {
	Ev                   Event
	Station              string
	StaLat, StaLon       float64
	Dist, Travel, Spread float64 // rounded as written
	NPicks               int
	OceanFrac            float64
}

type pick struct{ travel, lat, lon float64 }

// ParseEvent reads raw/<key>.isf.
func ParseEvent(root string, ev Event) ([]Row, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, ev.Key+".isf"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch seis-radius)", err)
	}
	if !utf8.Valid(b) {
		return nil, fmt.Errorf("%s.isf: not UTF-8 (the script read it with errors=replace; check the file)", ev.Key)
	}
	return ParseData(b, ev), nil
}

// ParseData is ParseEvent on a bulletin already read.
func ParseData(b []byte, ev Event) []Row {
	oS, _ := toSeconds(ev.OTime)
	var order []string
	per := map[string][]pick{}
	for _, line := range pymath.SplitLines(string(b)) {
		m := leadRe.FindStringSubmatch(line)
		if m == nil || !asciiBoundary(line, len(m[0])) {
			continue
		}
		tail := tailRe.FindStringSubmatch(line)
		if tail == nil {
			continue
		}
		lat, e1 := strconv.ParseFloat(tail[1], 64)
		lon, e2 := strconv.ParseFloat(tail[2], 64)
		aS, e3 := toSeconds(m[5] + ":" + m[6] + ":" + m[7])
		if e1 != nil || e2 != nil || e3 != nil {
			continue
		}
		if aS < oS {
			aS += 86400
		}
		travel := aS - oS
		if travel <= 0 || travel > 6000 {
			continue
		}
		if _, ok := per[m[1]]; !ok {
			order = append(order, m[1])
		}
		per[m[1]] = append(per[m[1]], pick{travel, lat, lon})
	}
	eLat, eLon := ev.latLon()
	var rows []Row
	for _, sta := range order {
		ps := per[sta]
		ts := make([]float64, len(ps))
		lo, hi := ps[0].travel, ps[0].travel
		for i, p := range ps {
			ts[i] = p.travel
			lo, hi = math.Min(lo, p.travel), math.Max(hi, p.travel)
		}
		d := GreatCircleDeg(eLat, eLon, ps[0].lat, ps[0].lon)
		if !(20 <= d && d <= 160) {
			continue
		}
		spread := 0.0
		if len(ps) > 1 {
			spread = hi - lo
		}
		rows = append(rows, Row{Ev: ev, Station: sta, StaLat: ps[0].lat, StaLon: ps[0].lon,
			Dist: pyjson.Round(d, 4), Travel: pyjson.Round(stats.Median(ts), 2), NPicks: len(ps), Spread: pyjson.Round(spread, 2)})
	}
	return rows
}

// asciiBoundary: Python's \b is Unicode-aware, Go's ASCII. A non-ASCII
// letter or digit right after the seconds is a word character for Python
// (no boundary, no match): refuse the line as Python would.
func asciiBoundary(line string, end int) bool {
	if end >= len(line) {
		return true
	}
	r, _ := utf8.DecodeRuneInString(line[end:])
	return r < 0x80 || !(unicode.IsLetter(r) || unicode.IsNumber(r))
}

// Result of a build.
type Result struct {
	Events []Event
	Rows   map[string][]Row
	Log    []string
}

// Compute parses every event, then classifies every path.
func Compute(root string) (*Result, error) {
	evs, err := ReadEvents(root)
	if err != nil {
		return nil, err
	}
	land, err := LoadLand(filepath.Join(root, Land))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch seis-radius)", err)
	}
	res := &Result{Events: evs, Rows: map[string][]Row{}}
	total := 0
	for _, ev := range evs {
		rows, err := ParseEvent(root, ev)
		if err != nil {
			return nil, err
		}
		eLat, eLon := ev.latLon()
		for i := range rows {
			of := land.OceanFraction(eLat, eLon, rows[i].StaLat, rows[i].StaLon, rows[i].Dist)
			rows[i].OceanFrac = pyjson.Round(of, 3)
		}
		res.Rows[ev.Key] = rows
		total += len(rows)
		res.Log = append(res.Log, fmt.Sprintf("%s %d", ev.Key, len(rows)))
	}
	res.Log = append(res.Log, fmt.Sprintf("total %d rows", total))
	return res, nil
}

func jstr(s string) string { return pyjson.Dumps(s, pyjson.Compact) }

func num(n json.Number) string { return pyjson.Number(n) }

// Files renders the three outputs (same bodies as the script).
func (r *Result) Files() []preset.File {
	var b strings.Builder
	b.WriteString("export const SEIS_RADIUS_EVENTS = [\n")
	for _, ev := range r.Events {
		fmt.Fprintf(&b, "  { key: %s, name: %s, lat: %s, lon: %s },\n", jstr(ev.Key), jstr(ev.Name), num(ev.Lat), num(ev.Lon))
	}
	b.WriteString("];\n\n// [station, sta_lat, sta_lon, distance_deg, travel_time_s, ocean_frac] rows, grouped by event key.\n")
	b.WriteString("export const SEIS_ARRIVALS = {\n")
	f := pyjson.Float
	var all []any
	var csvb strings.Builder
	csvb.WriteString("event,event_name,event_date,origin_time_utc,epi_lat,epi_lon,station,sta_lat,sta_lon,distance_deg,travel_time_s,n_picks,pick_spread_s\r\n")
	for _, ev := range r.Events {
		var cells []string
		for _, x := range r.Rows[ev.Key] {
			cells = append(cells, fmt.Sprintf("[%s,%s,%s,%s,%s,%s]", jstr(x.Station), f(x.StaLat), f(x.StaLon), f(x.Dist), f(x.Travel), f(x.OceanFrac)))
			all = append(all, pyjson.Obj{{K: "event", V: ev.Key}, {K: "event_name", V: ev.Name}, {K: "event_date", V: ev.Date},
				{K: "origin_time_utc", V: ev.OTime}, {K: "epi_lat", V: ev.Lat}, {K: "epi_lon", V: ev.Lon},
				{K: "station", V: x.Station}, {K: "sta_lat", V: x.StaLat}, {K: "sta_lon", V: x.StaLon},
				{K: "distance_deg", V: x.Dist}, {K: "travel_time_s", V: x.Travel}, {K: "n_picks", V: x.NPicks},
				{K: "pick_spread_s", V: x.Spread}})
			row := []string{ev.Key, ev.Name, ev.Date, ev.OTime, num(ev.Lat), num(ev.Lon), x.Station, f(x.StaLat), f(x.StaLon),
				f(x.Dist), f(x.Travel), strconv.Itoa(x.NPicks), f(x.Spread)}
			for i := range row {
				row[i] = csvField(row[i])
			}
			csvb.WriteString(strings.Join(row, ",") + "\r\n")
		}
		fmt.Fprintf(&b, "  %s: [%s],\n", ev.Key, strings.Join(cells, ","))
	}
	b.WriteString("};\n")
	inputs := []string{Events, Dir + "/inputs.lock"}
	return []preset.File{
		{Out: Out, Command: "build seis-radius", Inputs: inputs, Body: b.String(), Notes: []string{
			"Real Rayleigh-wave (LR) arrival-time data for seis's radius-reconstruction box plots",
			"(data/seis/events.json -- to add an earthquake, add one entry there; fog fetch, fog lock, fog build).",
			"distance_deg is computed from the published epicentre/station coordinates",
			"with the SAME great-circle formula as seisDelta() -- never read off ISC's",
			"own distance column, so the reconstruction cannot inherit whatever radius",
			"ISC's own software assumed. travel_time_s is arrival minus origin time",
			"(median across agencies when a station has more than one reading).",
			"ocean_frac is the fraction of that same great-circle PATH (not endpoints)",
			"that crosses open ocean, sampled every ~0.5 deg and classified against",
			"Natural Earth's 1:50m land polygons (source n17) -- NOT the decorative,",
			"heavily-simplified src/data/coasts.js used for map drawing elsewhere on",
			"this site, which is explicitly unfit for this (see its own header comment).",
			"See data/seis/README.md for the query and the raw bulletins. Citation",
			"required by ISC for this data: International Seismological Centre,",
			"On-line Bulletin, https://doi.org/10.31905/D808B830",
			"Event lat/lon and each row's station code + coordinates are the real",
			"published epicentre/station positions (kept for the real-station replay",
			"in the wavefront animation and the flat-map-disagreement histograms --",
			"NOT just for the box-plot radius, which only needed distance+time).",
		}},
		{Out: OutJSON, Command: "build seis-radius", NoHeader: true,
			Body: pyjson.Dumps(all, pyjson.Opts{Item: ",", Key: ": ", Indent: 2})},
		{Out: OutCSV, Command: "build seis-radius", NoHeader: true, Body: csvb.String()},
	}
}

// csvField quotes like Python's csv.writer (QUOTE_MINIMAL).
func csvField(s string) string {
	if strings.ContainsAny(s, ",\"\r\n") {
		return `"` + strings.ReplaceAll(s, `"`, `""`) + `"`
	}
	return s
}
