// Package tonga builds the seis tab's Hunga Tonga pressure-wave dataset
// (epic05, 2026-10-03) from the US ASOS one-minute pressures served by the
// Iowa Environmental Mesonet, cached in data/seis/tonga/raw/ (gitignored):
// the station list of each state (net_XX.json) and each station's pressure
// from 2022-01-15 00:00 to 2022-01-18 00:00 UTC (<id>.csv). Port of
// scripts/build_tonga_lamb.py (epic24/UC03); fetch.go downloads.
//
// Per station: band-pass the pressure (5-min mean minus 121-min mean,
// glitches and gaps > 3 min masked) and pick two arrivals WITHOUT any Earth
// model: A1 = largest positive peak 2-20 h after the eruption, A2 = largest
// positive peak between A1 + 6 h and 40 h. The great-circle angle from the
// vent is computed from the coordinates only after picking. The numpy
// arithmetic is reproduced bit for bit by internal/npy.
package tonga

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/npy"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
	"flatorglobe/tools/internal/stats"
)

const (
	Dir       = "data/seis/tonga"
	RawDir    = Dir + "/raw"
	Out       = "src/data/presets/seis-tonga.js"
	OutJSON   = Dir + "/picks.json"
	OutCSV    = Dir + "/picks.csv"
	VentLat   = -20.546
	VentLon   = -175.390
	InHgToHPa = 33.8639
	PerState  = 2
	TraceStep = 10 // minutes
	TraceFrom = -2 // hours
	TraceTo   = 66
)

// T0 is the start of the main explosion (USGS: 04:14:45 UTC).
var T0 = time.Date(2022, 1, 15, 4, 14, 45, 0, time.UTC)

// States in the script's order.
var States = strings.Fields("AK AL AR AZ CA CO CT DE FL GA HI IA ID IL IN KS KY LA MA MD ME MI MN MO " +
	"MS MT NC ND NE NH NJ NM NV NY OH OK OR PA RI SC SD TN TX UT VA VT WA WI WV WY PR")

// Grid is np.arange(-4, 67, 1/60): hours after T0, one minute apart.
var Grid = npy.Arange(-4, 67, pymath.Div(1, 60))

// Station is one selected ASOS station.
type Station struct {
	ID, State, Name string
	Lat, Lon        float64
}

type feature struct {
	ID         string `json:"id"`
	Properties struct {
		Online       any     `json:"online"`
		ArchiveBegin *string `json:"archive_begin"`
		Sname        string  `json:"sname"`
	} `json:"properties"`
	Geometry struct {
		Coordinates []float64 `json:"coordinates"`
	} `json:"geometry"`
}

func truthy(v any) bool {
	switch x := v.(type) {
	case nil:
		return false
	case bool:
		return x
	case float64:
		return x != 0
	case string:
		return x != ""
	}
	return true
}

// candidates: online stations with an archive begun before 2000, in IEM's order.
func candidates(root, st string) ([]feature, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, "net_"+st+".json"))
	if err != nil {
		return nil, err
	}
	var d struct {
		Features []feature `json:"features"`
	}
	if err := json.Unmarshal(b, &d); err != nil {
		return nil, nil // the script printed "bad station list" and went on
	}
	var out []feature
	for _, f := range d.Features {
		begin := "9"
		if f.Properties.ArchiveBegin != nil && *f.Properties.ArchiveBegin != "" {
			begin = *f.Properties.ArchiveBegin
		}
		if truthy(f.Properties.Online) && begin < "2000" {
			out = append(out, f)
		}
	}
	return out, nil
}

// Select replays the script's choice: per state, the first PerState
// candidates whose file has more than 3,000 lines. A candidate reached
// whose file is missing stops the build (fog fetch seis-tonga).
func Select(root string) ([]Station, error) {
	var got []Station
	for _, st := range States {
		cands, err := candidates(root, st)
		if err != nil {
			return nil, fmt.Errorf("%w (fog fetch seis-tonga)", err)
		}
		n := 0
		for _, f := range cands {
			if n >= PerState {
				break
			}
			b, err := os.ReadFile(filepath.Join(root, RawDir, f.ID+".csv"))
			if err != nil {
				return nil, fmt.Errorf("%w (fog fetch seis-tonga)", err)
			}
			if bytes.Count(b, []byte("\n")) > 3000 {
				n++
				if len(f.Geometry.Coordinates) < 2 {
					return nil, fmt.Errorf("station %s: no coordinates", f.ID)
				}
				got = append(got, Station{ID: f.ID, State: st, Name: f.Properties.Sname,
					Lat: pyjson.Round(f.Geometry.Coordinates[1], 4), Lon: pyjson.Round(f.Geometry.Coordinates[0], 4)})
			}
		}
	}
	return got, nil
}

// Bandpass reads one station and returns the band-passed pressure on Grid
// (NaN where masked).
func Bandpass(root, id string) ([]float64, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, id+".csv"))
	if err != nil {
		return nil, err
	}
	recs, err := csv.NewReader(bytes.NewReader(b)).ReadAll()
	if err != nil || len(recs) < 2 {
		return nil, fmt.Errorf("%s.csv: %v", id, err)
	}
	col := map[string]int{}
	for i, h := range recs[0] {
		col[h] = i
	}
	vi, vok := col["valid(UTC)"]
	pi, pok := col["pres1"]
	if !vok {
		return nil, fmt.Errorf("%s.csv: no valid(UTC) column", id)
	}
	var t, p []float64
	for n, r := range recs[1:] {
		v := ""
		if pok && pi < len(r) {
			v = r[pi]
		}
		if v == "" || v == "M" {
			continue
		}
		tm, err := time.Parse("2006-01-02 15:04", r[vi])
		if err != nil {
			return nil, fmt.Errorf("%s.csv row %d: %w", id, n+2, err)
		}
		pv, err := strconv.ParseFloat(pymath.Strip(v), 64)
		if err != nil {
			return nil, fmt.Errorf("%s.csv row %d: %w", id, n+2, err)
		}
		t = append(t, tm.Sub(T0).Seconds()/3600)
		p = append(p, pv*InHgToHPa)
	}
	if len(t) < 2 {
		return nil, fmt.Errorf("%s.csv: no pressure", id)
	}
	// glitches: a sample more than 3 hPa away from its 31-min median
	var tk, pk []float64
	for i := range p {
		lo, hi := max(0, i-15), min(len(p), i+16)
		if math.Abs(p[i]-stats.Median(p[lo:hi])) < 3 {
			tk, pk = append(tk, t[i]), append(pk, p[i])
		}
	}
	t, p = tk, pk
	pg := npy.Interp(Grid, t, p)
	idx := npy.SearchSorted(t, Grid)
	r5, r121 := npy.RunningMean(pg, 5), npy.RunningMean(pg, 121)
	bp := make([]float64, len(Grid))
	for i, g := range Grid {
		j := min(max(idx[i], 1), len(t)-1)
		near := math.Min(math.Abs(t[j]-g), math.Abs(t[j-1]-g))
		bp[i] = r5[i] - r121[i]
		if near > pymath.Div(3, 60) || g < t[0]+1 || g > t[len(t)-1]-1 || i < 61 || i >= len(Grid)-61 {
			bp[i] = math.NaN() // the 121-min mean is not defined at the grid ends
		}
	}
	return bp, nil
}

// pick: the largest band-passed value strictly between lo and hi hours,
// if at least 80 % of the minutes there are valid.
func pick(bp []float64, lo, hi float64) (*float64, *float64) {
	var g, v []float64
	for i, x := range Grid {
		if x > lo && x < hi && !math.IsNaN(bp[i]) {
			g, v = append(g, x), append(v, bp[i])
		}
	}
	if float64(len(g)) < float64(float64(0.8*(hi-lo))*60) {
		return nil, nil
	}
	i := npy.Argmax(v)
	a, b := pyjson.Round(g[i], 3), pyjson.Round(v[i], 3)
	return &a, &b
}

func greatCircle(la1, lo1, la2, lo2 float64) float64 {
	a, b, c, d := pymath.Radians(la1), pymath.Radians(lo1), pymath.Radians(la2), pymath.Radians(lo2)
	x := float64(math.Sin(a)*math.Sin(c)) + float64(float64(math.Cos(a)*math.Cos(c))*math.Cos(d-b))
	return math.Acos(math.Max(-1, math.Min(1, x)))
}

// Row is one station's result.
type Row struct {
	Station
	Theta              float64
	A1, Amp1, A2, Amp2 *float64
	Noise              *float64
	Trace              []*int
}

// Compute selects, band-passes and picks every station.
func Compute(root string) ([]Row, error) {
	sts, err := Select(root)
	if err != nil {
		return nil, err
	}
	var rows []Row
	for _, s := range sts {
		bp, err := Bandpass(root, s.ID)
		if err != nil {
			return nil, err
		}
		r := Row{Station: s}
		r.A1, r.Amp1 = pick(bp, 2, 20)
		if r.A1 != nil {
			r.A2, r.Amp2 = pick(bp, *r.A1+6, 40)
		}
		var pre []float64
		for i, g := range Grid {
			if g > -3 && g < 2 {
				pre = append(pre, bp[i])
			}
		}
		if sd, ok := npy.NanStd(pre); ok {
			v := pyjson.Round(sd, 3)
			r.Noise = &v
		}
		var sel []float64
		for i, g := range Grid {
			if g >= TraceFrom-1e-9 && g <= TraceTo+1e-9 {
				sel = append(sel, bp[i])
			}
		}
		for i := 0; i < len(sel); i += TraceStep {
			if math.IsNaN(sel[i]) || math.IsInf(sel[i], 0) {
				r.Trace = append(r.Trace, nil)
				continue
			}
			v := pymath.RoundInt(sel[i] * 100)
			r.Trace = append(r.Trace, &v)
		}
		r.Theta = pyjson.Round(pymath.Degrees(greatCircle(VentLat, VentLon, s.Lat, s.Lon)), 3)
		rows = append(rows, r)
	}
	sort.SliceStable(rows, func(i, j int) bool { return rows[i].Theta < rows[j].Theta })
	return rows, nil
}

func opt(p *float64) any {
	if p == nil {
		return nil
	}
	return *p
}

func (r Row) obj(withTrace bool) pyjson.Obj {
	o := pyjson.Obj{{K: "id", V: r.ID}, {K: "state", V: r.State}, {K: "name", V: r.Name}, {K: "lat", V: r.Lat}, {K: "lon", V: r.Lon},
		{K: "theta", V: r.Theta}, {K: "a1", V: opt(r.A1)}, {K: "amp1", V: opt(r.Amp1)}, {K: "a2", V: opt(r.A2)},
		{K: "amp2", V: opt(r.Amp2)}, {K: "noise", V: opt(r.Noise)}}
	if withTrace {
		tr := make([]any, len(r.Trace))
		for i, v := range r.Trace {
			if v != nil {
				tr[i] = *v
			}
		}
		o = append(o, pyjson.KV{K: "trace", V: tr})
	}
	return o
}

func csvField(s string) string {
	if strings.ContainsAny(s, ",\"\r\n") {
		return `"` + strings.ReplaceAll(s, `"`, `""`) + `"`
	}
	return s
}

// Files renders the three outputs (same bodies as the script).
func Files(rows []Row) []preset.File {
	var b strings.Builder
	ev := pyjson.Obj{{K: "vent", V: []float64{VentLat, VentLon}}, {K: "t0", V: "2022-01-15T04:14:45Z"},
		{K: "trace", V: pyjson.Obj{{K: "from", V: TraceFrom}, {K: "step", V: pymath.Div(TraceStep, 60)}}}}
	b.WriteString("export const TONGA_EVENT = " + pyjson.Dumps(ev, pyjson.Default) + ";\nexport const TONGA_STATIONS = [\n")
	picks := make([]any, len(rows))
	var c strings.Builder
	c.WriteString("id,state,name,lat,lon,theta,a1,amp1,a2,amp2,noise\r\n")
	str := func(p *float64) string {
		if p == nil {
			return ""
		}
		return pyjson.Float(*p)
	}
	for i, r := range rows {
		b.WriteString("  " + pyjson.Dumps(r.obj(true), pyjson.Compact) + ",\n")
		picks[i] = r.obj(false)
		cells := []string{r.ID, r.State, r.Name, pyjson.Float(r.Lat), pyjson.Float(r.Lon), pyjson.Float(r.Theta),
			str(r.A1), str(r.Amp1), str(r.A2), str(r.Amp2), str(r.Noise)}
		for k := range cells {
			cells[k] = csvField(cells[k])
		}
		c.WriteString(strings.Join(cells, ",") + "\r\n")
	}
	b.WriteString("];\n")
	return []preset.File{
		{Out: Out, Command: "build seis-tonga", Inputs: []string{Dir + "/inputs.lock"}, Body: b.String(), Notes: []string{
			"Hunga Tonga 2022-01-15 pressure wave at US ASOS stations (IEM one-minute data).",
			"Times in hours after 04:14:45 UTC; theta = great-circle angle from the vent, degrees;",
			"amp/noise in hPa; trace = band-passed pressure in 0.01 hPa, null = gap.",
		}},
		{Out: OutJSON, Command: "build seis-tonga", NoHeader: true, Body: pyjson.Dumps(picks, pyjson.Indented(1))},
		{Out: OutCSV, Command: "build seis-tonga", NoHeader: true, Body: c.String()},
	}
}
