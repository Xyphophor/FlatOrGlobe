// Package gravticon builds src/data/presets/grav-ticon.js (grav tab, the
// tide globe and the small seas, epic37/UC06): the measured tidal constants
// of tide gauges the world over, for the page to predict each gauge's tide at
// any instant, and the size of the twice-daily tide in open and in enclosed
// seas.
//
// # Data
//
// TICON-3 [Hart-Davis et al. 2022]: least-squares harmonic constants of the
// GESLA-3 records, one row per gauge and constituent (latitude, longitude
// 0-360, name, amplitude cm, Greenwich phase lag deg, their standard
// deviations, % missing, number of observations, longest gap, first and last
// date, source, gauge type Coastal / Lake / River), read from the zip as
// published. Rows with fewer than 14 fields (four Great Lakes stations whose
// phase and errors are missing) are skipped and counted.
//
// # Method
//
//  1. Phase convention. TICON's lags follow Foreman's tables [Foreman 1977],
//     whose diurnal arguments carry a quarter-cycle constant; package tide
//     writes the arguments from Doodson numbers alone. On five gauges
//     analysed by fog build grav-tides the two agree for the semidiurnal
//     lines and differ by +90 deg for K1 and -90 deg for O1, P1 and Q1 (the
//     test checks it); the lags are written here in package tide's
//     convention, so that the page predicts with the same arguments as
//     grav-tides.
//  2. The globe. Coastal gauges only (rivers distort the tide), one per cell
//     of 2 x 2 degrees, the one with the most observations; eight
//     constituents, M2 S2 N2 K2 K1 O1 P1 Q1, which carry most of the tide.
//  3. Enclosed seas. The M2 amplitude of every coastal gauge inside boxes
//     drawn round each basin (quartiles): the Atlantic coast of Europe, the
//     Mediterranean (east of Gibraltar, Biscay left out), the Black Sea, the
//     Baltic east of 13 deg E, the Gulf of Mexico, the Bay of Fundy (the bay
//     itself, without the Atlantic shore and the Saint John River).
//
// # References
//
//   - [Hart-Davis et al. 2022] M. G. Hart-Davis, D. Dettmering, F. Seitz, TICON-3: Tidal Constants
//     based on GESLA-3 sea-level records from globally distributed tide gauges including gauge type
//     information (data), PANGAEA (2022), doi:10.1594/PANGAEA.951610; method in M. G. Hart-Davis
//     et al., "TICON: TIdal CONstants based on GESLA sea-level records from globally located tide
//     gauges", Geosci. Data J. 9 (2022).
//   - [Foreman 1977] M. G. G. Foreman, Manual for Tidal Heights Analysis and Prediction, Pacific
//     Marine Science Report 77-10 (1977, rev. 2004), table 1.
package gravticon

import (
	"archive/zip"
	"bufio"
	"fmt"
	"io"
	"math"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
)

const (
	Dir  = "data/grav/ticon"
	Zip  = Dir + "/raw/TICON_3.zip"
	Out  = "src/data/presets/grav-ticon.js"
	Cell = 2.0 // degrees
)

// Names are the constituents kept, in the order of the preset.
var Names = []string{"M2", "S2", "N2", "K2", "K1", "O1", "P1", "Q1"}

// Shift is added to TICON's lag to get package tide's convention (degrees).
var Shift = map[string]float64{"K1": 90, "O1": -90, "P1": -90, "Q1": -90}

// Gauge is one station of TICON-3.
type Gauge struct {
	Lat, Lon float64 // lon in -180..180
	Type     string
	NObs     int
	H, G     map[string]float64 // cm, deg (package tide's convention)
}

// Read parses the zip; it returns the gauges and the number of rows skipped.
func Read(path string) ([]*Gauge, int, error) {
	z, err := zip.OpenReader(path)
	if err != nil {
		return nil, 0, fmt.Errorf("%w (fog fetch grav-ticon)", err)
	}
	defer z.Close()
	var f io.ReadCloser
	for _, e := range z.File {
		if strings.HasSuffix(e.Name, "TICON_3.txt") {
			if f, err = e.Open(); err != nil {
				return nil, 0, err
			}
		}
	}
	if f == nil {
		return nil, 0, fmt.Errorf("%s: no TICON_3.txt", path)
	}
	defer f.Close()
	by := map[string]*Gauge{}
	var order []string
	skipped, n := 0, 0
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		n++
		c := strings.Fields(sc.Text())
		if len(c) == 0 {
			continue
		}
		if len(c) != 14 {
			skipped++
			continue
		}
		num := func(i int) (float64, error) {
			v, err := strconv.ParseFloat(c[i], 64)
			if err != nil {
				return 0, fmt.Errorf("%s:%d: column %d %q", path, n, i+1, c[i])
			}
			return v, nil
		}
		var v [5]float64
		for i, j := range []int{0, 1, 3, 4, 8} {
			if v[i], err = num(j); err != nil {
				return nil, 0, err
			}
		}
		key := c[0] + " " + c[1]
		g := by[key]
		if g == nil {
			lon := v[1]
			if lon > 180 {
				lon -= 360
			}
			g = &Gauge{Lat: v[0], Lon: lon, Type: c[13], NObs: int(v[4]), H: map[string]float64{}, G: map[string]float64{}}
			by[key] = g
			order = append(order, key)
		}
		g.H[c[2]] = v[2]
		g.G[c[2]] = math.Mod(v[3]+Shift[c[2]]+360, 360)
	}
	if err := sc.Err(); err != nil {
		return nil, 0, err
	}
	out := make([]*Gauge, 0, len(order))
	for _, k := range order {
		g := by[k]
		ok := true
		for _, nm := range Names {
			if _, has := g.H[nm]; !has {
				ok = false
			}
		}
		if ok {
			out = append(out, g)
		}
	}
	return out, skipped, nil
}

// Thin keeps one coastal gauge per cell, the one with the most observations.
func Thin(gs []*Gauge) []*Gauge {
	best := map[[2]int]*Gauge{}
	for _, g := range gs {
		if g.Type != "Coastal" {
			continue
		}
		k := [2]int{int(math.Floor(g.Lat / Cell)), int(math.Floor(g.Lon / Cell))}
		if b := best[k]; b == nil || g.NObs > b.NObs {
			best[k] = g
		}
	}
	out := make([]*Gauge, 0, len(best))
	for _, g := range best {
		out = append(out, g)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Lat != out[j].Lat {
			return out[i].Lat < out[j].Lat
		}
		return out[i].Lon < out[j].Lon
	})
	return out
}

// Basin is a box round an enclosed or open sea.
type Basin struct {
	Key, Name string
	In        func(lat, lon float64) bool
}

func black(a, o float64) bool { return a > 40.9 && a < 46.8 && o > 27.4 && o < 41.8 }

// Basins are the seas compared, open coast first.
var Basins = []Basin{
	{"atl", "Atlantic coast of Europe", func(a, o float64) bool { return a > 36 && a < 60 && o > -11 && o < -1 }},
	// the bay itself: Halifax and the Atlantic shore of Nova Scotia (east of 64.2° W) and the gauges up the
	// Saint John River, above the Reversing Falls, left out
	{"fundy", "Bay of Fundy", func(a, o float64) bool {
		return a > 44.5 && a < 45.4 && o > -66.9 && o < -64.2 && !(a > 45.26 && o > -66.5 && o < -65.8)
	}},
	{"gom", "Gulf of Mexico", func(a, o float64) bool { return a > 18 && a < 31 && o > -98 && o < -81 }},
	{"med", "Mediterranean", func(a, o float64) bool {
		return a > 30 && a < 46 && o > -5.5 && o < 36.5 && !black(a, o) && !(o < 3 && a > 42.6)
	}},
	{"black", "Black Sea", black},
	{"baltic", "Baltic, east of 13° E", func(a, o float64) bool { return a > 53.5 && a < 66 && o > 13 && o < 30.5 }},
}

// Stat is the M2 amplitude of a basin's gauges.
type Stat struct {
	Basin
	N                int
	Q1, Med, Q3, Max float64 // cm
}

func quant(v []float64, p float64) float64 {
	x := p * float64(len(v)-1)
	i := int(math.Floor(x))
	if i >= len(v)-1 {
		return v[len(v)-1]
	}
	return v[i] + (x-float64(i))*(v[i+1]-v[i])
}

// Basins returns the M2 statistics of each basin (coastal gauges).
func BasinStats(gs []*Gauge) []Stat {
	var out []Stat
	for _, b := range Basins {
		var v []float64
		for _, g := range gs {
			if g.Type == "Coastal" && b.In(g.Lat, g.Lon) {
				v = append(v, g.H["M2"])
			}
		}
		sort.Float64s(v)
		s := Stat{Basin: b, N: len(v)}
		if len(v) > 0 {
			s.Q1, s.Med, s.Q3, s.Max = quant(v, 0.25), quant(v, 0.5), quant(v, 0.75), v[len(v)-1]
		}
		out = append(out, s)
	}
	return out
}

// Result is what the preset holds.
type Result struct {
	All     []*Gauge
	Globe   []*Gauge
	Stats   []Stat
	Skipped int
}

// Compute reads TICON-3 and derives the globe and the basins.
func Compute(root string) (*Result, error) {
	gs, sk, err := Read(filepath.Join(root, Zip))
	if err != nil {
		return nil, err
	}
	if len(gs) < 3000 {
		return nil, fmt.Errorf("grav-ticon: only %d gauges", len(gs))
	}
	r := &Result{All: gs, Globe: Thin(gs), Stats: BasinStats(gs), Skipped: sk}
	for _, s := range r.Stats {
		if s.N < 3 {
			return nil, fmt.Errorf("grav-ticon: basin %s has %d gauges", s.Key, s.N)
		}
	}
	return r, nil
}

func num(v float64, prec int) string {
	s := strconv.FormatFloat(v, 'f', prec, 64)
	if strings.Contains(s, ".") {
		s = strings.TrimRight(strings.TrimRight(s, "0"), ".")
	}
	if s == "-0" {
		s = "0"
	}
	return s
}

// File renders the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	fmt.Fprintf(&b, "export const TICON_NAMES = [%s];\n", `"`+strings.Join(Names, `", "`)+`"`)
	fmt.Fprintf(&b, "export const TICON_N = { gauges: %d, globe: %d, skippedRows: %d };\n", len(r.All), len(r.Globe), r.Skipped)
	b.WriteString("export const TICON_GLOBE = [\n")
	for _, g := range r.Globe {
		fmt.Fprintf(&b, "  [%s,%s", num(g.Lat, 2), num(g.Lon, 2))
		for _, n := range Names {
			fmt.Fprintf(&b, ",%s", num(g.H[n], 1))
		}
		for _, n := range Names {
			fmt.Fprintf(&b, ",%s", num(math.Round(g.G[n]), 0))
		}
		b.WriteString("],\n")
	}
	b.WriteString("];\nexport const TICON_BASINS = [\n")
	for _, s := range r.Stats {
		fmt.Fprintf(&b, "  { key: %q, name: %q, n: %d, q1: %s, med: %s, q3: %s, max: %s },\n", s.Key, s.Name, s.N, num(s.Q1, 1), num(s.Med, 1), num(s.Q3, 1), num(s.Max, 1))
	}
	b.WriteString("];\n")
	return preset.File{
		Out: Out, Command: "build grav-ticon", Inputs: []string{Zip},
		Notes: []string{
			"TICON-3 tidal constants (Hart-Davis, Dettmering & Seitz 2022, PANGAEA, CC BY 4.0). TICON_GLOBE: one coastal gauge",
			"per 2 x 2 deg cell (most observations), [lat, lon, H of TICON_NAMES in cm..., g of TICON_NAMES in deg...]; the lags",
			"are in package tide's convention (TICON's + 90 deg for K1, - 90 deg for O1, P1, Q1). TICON_BASINS: M2 amplitude",
			"(cm, quartiles and maximum) of every coastal gauge inside a box round each sea.",
			"Method and references: go doc -all ./internal/build/gravticon (from tools/).",
		},
		Body: b.String(),
	}
}

// Summary is the report line.
func (r *Result) Summary() string {
	var p []string
	for _, s := range r.Stats {
		p = append(p, fmt.Sprintf("%s %.1f cm (%d)", s.Key, s.Med, s.N))
	}
	return fmt.Sprintf("%d gauges (%d rows skipped), %d on the globe; M2 median: %s", len(r.All), r.Skipped, len(r.Globe), strings.Join(p, ", "))
}
