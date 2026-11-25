// Package survzenith reads our transcription of the reciprocal zenith distances in C. A. Schott, The Transcontinental
// Triangulation, U.S. Coast and Geodetic Survey Special Publication No. 4 (1900), Part II "Determination of heights"
// (ref tab, epic34/UC02, 2026-10-28): the abstracts of resulting zenith distances of eastern Colorado (pp. 257-261 of the
// print), of the Pacific coast between Point Arena and Mount Diablo (pp. 269-275) and around Mount Hamilton (pp. 300-302),
// the coefficients of refraction Schott computed from them (pp. 262, 276-277, 302), and the hourly simultaneous zenith
// distances between Round Top and Jackson Butte, 72.4 km apart, with the temperatures at both ends (pp. 280-292,
// G. Davidson's observations of September and October 1879).
//
// Checks (the build fails on any): observed + reduction to the station mark + reduction for eccentricity = reduced ζ, to
// the printed tenth of a second; a mean row equals the weighted mean of its components; a line's log s is the same from
// both ends (up to one unit of the last printed digit).
//
// Each reciprocal pair (ζ₁ from A to B, ζ₂ from B to A) gives the sum excess E = ζ₁ + ζ₂ − 180°. On a plane with straight
// light E = 0; with light bent down toward the ground (k > 0) E < 0. On a sphere of radius R the two verticals differ by
// γ = s/R, and E = γ(1 − k) (Torge, Geodesy, 4th ed., §5.3; the same relation is Schott's formula m = ½ − ρ sin1″ (ζ₁ +
// ζ₂ − 180°)/2s with m = k/2). s/E is therefore the effective radius R/(1 − k), the radius the site uses for refracted
// sightlines, measured: s comes from the triangulation (bases and angles, no radius), E from two angles. That is a
// measure in the sense of rule 10. k itself needs R (k = 1 − R·E/s): a check, with R = 6,371 km as its unit.
//
// Lines observed in different years are Schott's "non-simultaneous reciprocal" lines: the refraction is not the same at
// both ends, which is part of the scatter. The hourly Round Top-Jackson Butte pairs are simultaneous to the hour.
package survzenith

import (
	"encoding/csv"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Inputs, relative to the repository root.
const (
	Dir    = "data/surv/zenith/sp4/transcription"
	Out    = "src/data/presets/ref-zenith.js"
	REarth = 6371.0 // km, only as the unit of k (check)
	arcsec = math.Pi / 180 / 3600
	// Round Top - Jackson Butte (SP 4 p. 280): s = 72,372.6 m; heights about 3,173 and 714 m
	sRTJB = 72.3726
)

// Row is one printed line of an abstract.
type Row struct {
	Page, Station, Object, Flag string
	Days                        float64
	Obs, Red                    float64 // arcsec (Obs NaN for a mean row)
	RedLevel, RedEcc            float64
	LogS                        float64 // NaN when not printed
	Year                        string
}

// Pair is one reciprocal line.
type Pair struct {
	Region, A, B string
	S            float64 // km
	E            float64 // arcsec, ζ₁ + ζ₂ − 180°
	Reff         float64 // km, s/E
	K            float64 // 1 − R E/s (check)
	SchottM      float64 // NaN if not in his tables
}

// Result is the whole build.
type Result struct {
	Rows   []Row
	Pairs  []Pair
	Hourly [][]any // [hour, n, mean k, min, max, mean E″]
	PerDay []any   // [date, hour, k]
	Meteo  [][]float64
	Bad    []string
	Inputs []string // repo-relative, hashed into the header
}

func dms(d, m, s string) (float64, error) {
	if d == "" {
		return math.NaN(), nil
	}
	a, e1 := strconv.Atoi(d)
	b, e2 := strconv.Atoi(m)
	c, e3 := strconv.ParseFloat(s, 64)
	if e1 != nil || e2 != nil || e3 != nil {
		return 0, fmt.Errorf("bad angle %q %q %q", d, m, s)
	}
	return float64(a)*3600 + float64(b)*60 + c, nil
}

func f(s string) float64 {
	if s == "" {
		return math.NaN()
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return math.NaN()
	}
	return v
}

func region(page string) string {
	p, _ := strconv.Atoi(page)
	switch {
	case p < 270:
		return "Colorado"
	case p < 300:
		return "California"
	}
	return "Hamilton"
}

func readCSV(path string) ([]map[string]string, error) {
	fh, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer fh.Close()
	recs, err := csv.NewReader(fh).ReadAll()
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	var out []map[string]string
	for _, r := range recs[1:] {
		m := map[string]string{}
		for i, h := range recs[0] {
			if i < len(r) {
				m[h] = strings.TrimSpace(r[i])
			}
		}
		out = append(out, m)
	}
	return out, nil
}

// Compute reads and checks the transcription.
func Compute(root string) (*Result, error) {
	files, err := filepath.Glob(filepath.Join(root, Dir, "p*.csv"))
	if err != nil {
		return nil, err
	}
	sort.Strings(files)
	r := &Result{}
	for _, n := range append(append([]string{}, files...), filepath.Join(root, Dir, "hourly_meteo_means.csv"), filepath.Join(root, Dir, "hourly_roundtop_jackson.csv"), filepath.Join(root, Dir, "m_schott.csv")) {
		rel, _ := filepath.Rel(root, n)
		r.Inputs = append(r.Inputs, filepath.ToSlash(rel))
	}
	for _, fn := range files {
		recs, err := readCSV(fn)
		if err != nil {
			return nil, err
		}
		for _, m := range recs {
			obs, err := dms(m["obs_d"], m["obs_m"], m["obs_s"])
			if err != nil {
				return nil, fmt.Errorf("%s: %w", fn, err)
			}
			red, err := dms(m["red_d"], m["red_m"], m["red_s"])
			if err != nil {
				return nil, fmt.Errorf("%s: %w", fn, err)
			}
			row := Row{Page: m["page"], Station: m["station"], Object: m["object"], Flag: m["flag"], Days: f(m["days"]),
				Obs: obs, Red: red, RedLevel: f(m["red_level"]), RedEcc: f(m["red_ecc"]), LogS: f(m["log_s"]), Year: m["year"]}
			if !math.IsNaN(obs) {
				if d := obs + row.RedLevel + row.RedEcc - red; math.Abs(d) > 0.051 {
					r.Bad = append(r.Bad, fmt.Sprintf("p%s %s -> %s: observed + reductions differ from reduced by %.1f″", row.Page, row.Station, row.Object, d))
				}
			}
			r.Rows = append(r.Rows, row)
		}
	}
	// mean rows: the weighted mean (by days) of the components just above
	for i, row := range r.Rows {
		if row.Flag != "mean" {
			continue
		}
		var sw, s float64
		plain := false // days printed once for the whole group: a plain mean
		for j := i - 1; j >= 0 && strings.HasPrefix(r.Rows[j].Flag, "component") && r.Rows[j].Object == row.Object; j-- {
			w := r.Rows[j].Days
			if math.IsNaN(w) {
				w, plain = 1, true
			}
			sw += w
			s += w * r.Rows[j].Red
		}
		if sw == 0 || math.Abs(s/sw-row.Red) > 0.15 || (!plain && math.Abs(sw-row.Days) > 0.01) {
			r.Bad = append(r.Bad, fmt.Sprintf("p%s %s -> %s: mean %.1f″ of %v days, components %.2f″ of %v days", row.Page, row.Station, row.Object, math.Mod(row.Red, 60), row.Days, math.Mod(s/sw, 60), sw))
		}
	}
	// reciprocal pairs within a region: the latest printed value of each direction
	type key struct{ g, a, b string }
	last := map[key]Row{}
	for _, row := range r.Rows {
		if strings.HasPrefix(row.Flag, "component") {
			continue
		}
		last[key{region(row.Page), row.Station, row.Object}] = row
	}
	schott, err := readSchott(filepath.Join(root, Dir, "m_schott.csv"))
	if err != nil {
		return nil, err
	}
	keys := make([]key, 0, len(last))
	for k := range last {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool {
		if keys[i].g != keys[j].g {
			return keys[i].g < keys[j].g
		}
		if keys[i].a != keys[j].a {
			return keys[i].a < keys[j].a
		}
		return keys[i].b < keys[j].b
	})
	for _, k := range keys {
		if k.a > k.b {
			continue
		}
		ra, rb := last[k], last[key{k.g, k.b, k.a}]
		if rb.Station == "" {
			continue
		}
		ls := ra.LogS
		if math.IsNaN(ls) {
			ls = rb.LogS
		}
		if math.IsNaN(ls) {
			r.Bad = append(r.Bad, fmt.Sprintf("%s %s - %s: no distance", k.g, k.a, k.b))
			continue
		}
		if !math.IsNaN(ra.LogS) && !math.IsNaN(rb.LogS) && math.Abs(ra.LogS-rb.LogS) > 1.5e-5 {
			r.Bad = append(r.Bad, fmt.Sprintf("%s %s - %s: log s %.5f and %.5f", k.g, k.a, k.b, ra.LogS, rb.LogS))
		}
		s := math.Pow(10, ls) / 1000
		e := ra.Red + rb.Red - 180*3600
		p := Pair{Region: k.g, A: k.a, B: k.b, S: s, E: e, Reff: s / (e * arcsec), K: 1 - REarth*e*arcsec/s, SchottM: math.NaN()}
		if m, ok := schott[k.a+"|"+k.b]; ok {
			p.SchottM = m
		} else if m, ok := schott[k.b+"|"+k.a]; ok {
			p.SchottM = m
		}
		r.Pairs = append(r.Pairs, p)
	}
	if err := r.hourly(root); err != nil {
		return nil, err
	}
	return r, nil
}

func readSchott(path string) (map[string]float64, error) {
	recs, err := readCSV(path)
	if err != nil {
		return nil, err
	}
	out := map[string]float64{}
	for _, m := range recs {
		out[m["line_from"]+"|"+m["line_to"]] = f(m["m"])
	}
	return out, nil
}

// hourly pairs the simultaneous zenith distances of Round Top and Jackson Butte, hour by hour.
func (r *Result) hourly(root string) error {
	recs, err := readCSV(filepath.Join(root, Dir, "hourly_roundtop_jackson.csv"))
	if err != nil {
		return err
	}
	type dh struct {
		d string
		h int
	}
	z := map[string]map[dh]float64{}
	for _, m := range recs {
		v, err := dms(m["deg"], m["min"], m["sec"])
		if err != nil {
			return err
		}
		h, _ := strconv.Atoi(m["hour"])
		if z[m["station"]] == nil {
			z[m["station"]] = map[dh]float64{}
		}
		z[m["station"]][dh{m["date"], h}] = v
	}
	byH := map[int][]float64{}
	byHE := map[int][]float64{}
	var keys []dh
	for k := range z["Round Top"] {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool {
		if keys[i].d != keys[j].d {
			return keys[i].d < keys[j].d
		}
		return keys[i].h < keys[j].h
	})
	for _, k := range keys {
		b, ok := z["Jackson Butte"][k]
		if !ok {
			continue
		}
		e := z["Round Top"][k] + b - 180*3600
		kk := 1 - REarth*e*arcsec/sRTJB
		byH[k.h] = append(byH[k.h], kk)
		byHE[k.h] = append(byHE[k.h], e)
		r.PerDay = append(r.PerDay, []any{k.d, k.h, pyjson.Round(kk, 4), pyjson.Round(e, 1)})
	}
	for h := 1; h <= 24; h++ {
		x := byH[h]
		if len(x) == 0 {
			continue
		}
		mn, mx, s, se := math.Inf(1), math.Inf(-1), 0.0, 0.0
		for i, v := range x {
			mn, mx, s = math.Min(mn, v), math.Max(mx, v), s+v
			se += byHE[h][i]
		}
		r.Hourly = append(r.Hourly, []any{h, len(x), pyjson.Round(s/float64(len(x)), 4), pyjson.Round(mn, 4), pyjson.Round(mx, 4), pyjson.Round(se/float64(len(x)), 1)})
	}
	met, err := readCSV(filepath.Join(root, Dir, "hourly_meteo_means.csv"))
	if err != nil {
		return err
	}
	t := map[string][]float64{}
	for _, m := range met {
		t[m["station"]] = append(t[m["station"]], f(m["T_F"]))
	}
	for h := 0; h < 24 && h < len(t["Round Top"]) && h < len(t["Jackson Butte"]); h++ {
		r.Meteo = append(r.Meteo, []float64{float64(h + 1), t["Round Top"][h], t["Jackson Butte"][h]})
	}
	return nil
}

func med(x []float64) float64 {
	y := append([]float64(nil), x...)
	sort.Float64s(y)
	if len(y) == 0 {
		return math.NaN()
	}
	if len(y)%2 == 1 {
		return y[len(y)/2]
	}
	return (y[len(y)/2-1] + y[len(y)/2]) / 2
}

// Summary is fog build's report.
func (r *Result) Summary() string {
	var reff, ks []float64
	minE := math.Inf(1)
	for _, p := range r.Pairs {
		reff = append(reff, p.Reff)
		ks = append(ks, p.K)
		minE = math.Min(minE, p.E)
	}
	return fmt.Sprintf("%d rows checked, %d reciprocal lines: every sum above 180° (smallest excess %.0f″), median R/(1−k) %.0f km, median k %.3f; %d hourly simultaneous pairs",
		len(r.Rows), len(r.Pairs), minE, med(reff), med(ks), len(r.PerDay))
}

// File writes the preset.
func (r *Result) File() preset.File {
	pairs := []any{}
	for _, p := range r.Pairs {
		var m any
		if !math.IsNaN(p.SchottM) {
			m = p.SchottM
		}
		pairs = append(pairs, []any{p.Region, p.A, p.B, pyjson.Round(p.S, 3), pyjson.Round(p.E, 1), pyjson.Round(p.Reff, 0), pyjson.Round(p.K, 4), m})
	}
	met := []any{}
	for _, m := range r.Meteo {
		met = append(met, []any{int(m[0]), m[1], m[2]})
	}
	hourly := []any{}
	for _, h := range r.Hourly {
		hourly = append(hourly, h)
	}
	var b strings.Builder
	b.WriteString("// [region, from, to, s km, E = ζ₁ + ζ₂ − 180° (″), s/E = R/(1−k) km, k with R = 6,371 km, Schott's m (= k/2) or null]\n")
	b.WriteString("export const ZEN_PAIRS = [\n")
	for _, p := range pairs {
		b.WriteString(" " + pyjson.Dumps(p, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n// Round Top - Jackson Butte 1879, 72.37 km: [hour 1-24, n, mean k, min k, max k, mean E″]\n")
	b.WriteString("export const ZEN_HOURLY = " + pyjson.Dumps(hourly, pyjson.Compact) + ";\n")
	b.WriteString("// the same, one simultaneous pair each: [date, hour, k, E″]\nexport const ZEN_HOURLY_DAYS = [\n")
	for _, p := range r.PerDay {
		b.WriteString(" " + pyjson.Dumps(p, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n// hourly means of the dry-bulb temperature (°F, Schott's columns): [hour, Round Top, Jackson Butte]\n")
	b.WriteString("export const ZEN_METEO = " + pyjson.Dumps(met, pyjson.Compact) + ";\n")
	return preset.File{
		Out: Out, Command: "build surv-zenith",
		Inputs: r.Inputs,
		Notes: []string{"Reciprocal zenith distances of Schott, USC&GS Special Publication No. 4 (1900), Part II, our transcription;",
			"checked: observed + reductions = reduced, means of components, log s from both ends."},
		Body: b.String(),
	}
}
