// Package tongalaps builds src/data/presets/atmo-tonga-laps.js (2026-11-21, owner: "more passages for Tonga"): every
// passage of the Hunga Tonga Lamb wave that the 102 US barometers of seis-tonga recorded over seven days, picked
// WITHOUT any Earth model, so that the time of a lap can be read at one station, as Strachey did for Krakatoa.
//
// Raw data: the same stations' one-minute pressure (Iowa Environmental Mesonet ASOS archive) from 2022-01-15 00:00 to
// 2022-01-22 00:00 UTC, cached in data/atmo/tonga-laps/raw/<id>.csv (gitignored, fog fetch atmo-tonga-laps); the
// station list is seis-tonga's (tonga.Select). The band-pass is seis-tonga's (5-min mean minus 121-min mean, glitches
// more than 3 hPa from the 31-min median and gaps longer than 3 min masked), on a longer grid.
//
// Picks: A1 = largest band-passed peak 2-20 h after the eruption and A2 = largest between A1 + 6 h and 40 h (seis-tonga's
// rules, unchanged); then each passage's return after one lap, A(n+2) = largest peak 24 to 48 h after A(n) (a sphere of
// 4,260 to 8,520 km at 310 m/s: the window is wide, and the picks must still cluster inside it to count). A lap is
// A(n+2) - A(n) at the same station: no position, no distance, no explosion time.
//
// What the data gave (2026-11-21): the long-way laps A4 - A2 cluster within minutes at most stations; the short-way
// returns A3, A5 and the later long-way ones do not stand out of the weather with this picker (their laps spread over
// the whole window). The page uses A4 - A2 and says why the others are left out.
package tongalaps

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/build/tonga"
	"flatorglobe/tools/internal/npy"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
	"flatorglobe/tools/internal/stats"
)

const (
	Dir    = "data/atmo/tonga-laps"
	RawDir = Dir + "/raw"
	Out    = "src/data/presets/atmo-tonga-laps.js"
	// MaxPass caps the passages looked for (Matoza et al. 2022 report four outbound and three antipodal passages).
	MaxPass = 8
	GridEnd = 164 // hours after T0 (the files end 2022-01-22 00:00 UTC, 163.75 h)
	// LapLo, LapHi: where a passage's return after one lap is looked for, hours after it. At 310 m/s that is a sphere of
	// 4,260 to 8,520 km: a window, not the answer (the picks must still cluster inside it).
	LapLo, LapHi = 24.0, 48.0
	// Excl: hours ignored around passages already picked.
	Excl = 4.0
)

// Grid: hours after T0, one minute apart, from -4 h.
var Grid = npy.Arange(-4, GridEnd, pymath.Div(1, 60))

// Bandpass is tonga.Bandpass on the seven-day file and the long grid (NaN where masked).
func Bandpass(root, id string) ([]float64, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, id+".csv"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch atmo-tonga-laps)", err)
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
		t = append(t, tm.Sub(tonga.T0).Seconds()/3600)
		p = append(p, pv*tonga.InHgToHPa)
	}
	if len(t) < 2 {
		return nil, fmt.Errorf("%s.csv: no pressure", id)
	}
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
			bp[i] = math.NaN()
		}
	}
	return bp, nil
}

// pick: the largest band-passed value strictly between lo and hi hours, ignoring the minutes within Excl hours of
// any time in ex, if at least 80 % of the window's minutes are valid.
func pick(bp []float64, lo, hi float64, ex ...float64) (float64, float64, bool) {
	best, bv, n, tot := 0.0, math.Inf(-1), 0, 0
	for i, x := range Grid {
		if x <= lo || x >= hi {
			continue
		}
		tot++
		if math.IsNaN(bp[i]) {
			continue
		}
		n++
		skip := false
		for _, e := range ex {
			if math.Abs(x-e) < Excl {
				skip = true
			}
		}
		if !skip && bp[i] > bv {
			best, bv = x, bp[i]
		}
	}
	if tot == 0 || float64(n) < 0.8*float64(tot) || math.IsInf(bv, -1) {
		return 0, 0, false
	}
	return pyjson.Round(best, 3), pyjson.Round(bv, 3), true
}

// Picks returns the passages A1, A2, ... (hours after T0, NaN = not picked) and their band-passed amplitudes (hPa).
// A1 and A2 are seis-tonga's. Then each passage's return after one lap is looked for LapLo to LapHi hours after it:
// first the long-way chain (A4 after A2, A6 after A4, ...), then the short-way chain (A3 after A1, ...), which ignores
// the minutes within Excl hours of the passages already picked so as not to take one passage for another.
func Picks(bp []float64) (a, amp []float64) {
	a, amp = make([]float64, MaxPass), make([]float64, MaxPass)
	for i := range a {
		a[i], amp[i] = math.NaN(), math.NaN()
	}
	t, v, ok := pick(bp, 2, 20)
	if !ok {
		return a, amp
	}
	a[0], amp[0] = t, v
	if t, v, ok = pick(bp, a[0]+6, 40); ok {
		a[1], amp[1] = t, v
	}
	chain := func(first int, ex func() []float64) {
		for n := first; n+2 < MaxPass && !math.IsNaN(a[n]); n += 2 {
			t, v, ok := pick(bp, a[n]+LapLo, a[n]+LapHi, ex()...)
			if !ok {
				return
			}
			a[n+2], amp[n+2] = t, v
		}
	}
	chain(1, func() []float64 { return nil })
	chain(0, func() []float64 {
		var ex []float64
		for i := 1; i < MaxPass; i += 2 {
			if !math.IsNaN(a[i]) {
				ex = append(ex, a[i])
			}
		}
		return ex
	})
	return a, amp
}

// Row is one station.
type Row struct {
	tonga.Station
	Theta  float64
	Noise  float64 // standard deviation of the band-passed pressure from 3 h before to 2 h after the eruption, hPa
	A, Amp []float64
}

// Compute picks every station's passages.
func Compute(root string) ([]Row, error) {
	sts, err := tonga.Select(root)
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
		r.A, r.Amp = Picks(bp)
		var pre []float64
		for i, g := range Grid {
			if g > -3 && g < 2 {
				pre = append(pre, bp[i])
			}
		}
		if sd, ok := npy.NanStd(pre); ok {
			r.Noise = pyjson.Round(sd, 3)
		}
		r.Theta = pyjson.Round(pymath.Degrees(gc(tonga.VentLat, tonga.VentLon, s.Lat, s.Lon)), 3)
		rows = append(rows, r)
	}
	return rows, nil
}

func gc(la1, lo1, la2, lo2 float64) float64 {
	a, b, c, d := pymath.Radians(la1), pymath.Radians(lo1), pymath.Radians(la2), pymath.Radians(lo2)
	return math.Acos(math.Max(-1, math.Min(1, math.Sin(a)*math.Sin(c)+math.Cos(a)*math.Cos(c)*math.Cos(d-b))))
}

// File renders the preset.
func File(rows []Row) preset.File {
	var b strings.Builder
	b.WriteString("export const TONGA_LAPS_T0 = \"2022-01-15T04:14:45Z\";\n")
	b.WriteString("export const TONGA_LAPS = [\n")
	for _, r := range rows {
		o := pyjson.Obj{{K: "id", V: r.ID}, {K: "lat", V: r.Lat}, {K: "lon", V: r.Lon}, {K: "theta", V: r.Theta},
			{K: "noise", V: r.Noise}, {K: "a", V: nulls(r.A)}, {K: "amp", V: nulls(r.Amp)}}
		b.WriteString("  " + pyjson.Dumps(o, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{
		Out:     Out,
		Command: "build atmo-tonga-laps",
		Inputs:  inputs(rows),
		Notes: []string{
			"Hunga Tonga 2022-01-15: every passage of the pressure wave at the 102 US ASOS barometers of seis-tonga, seven days",
			"of one-minute pressure (IEM). a = passages A1, A2, ... in hours after 04:14:45 UTC, picked without any Earth model",
			"(A1: 2-20 h; A2: A1+6 h to 40 h; then each next one 6 to 30 h after the previous); amp = band-passed peak, hPa;",
			"noise = band-passed standard deviation before the wave, hPa. A lap = A(n+2) - A(n) at the same station.",
		},
		Body: b.String(),
	}
}

func inputs(rows []Row) []string {
	var in []string
	for _, r := range rows {
		in = append(in, RawDir+"/"+r.ID+".csv")
	}
	return in
}

func nulls(x []float64) []any {
	out := make([]any, len(x))
	for i, v := range x {
		if !math.IsNaN(v) {
			out[i] = v
		}
	}
	return out
}
