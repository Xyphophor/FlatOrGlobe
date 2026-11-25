// Package gravtides builds src/data/presets/grav-tides.js (grav tab,
// section "What the tide gauges record", epic37/UC01): one year of hourly
// sea level at five tide gauges, read three ways.
//
// # Data
//
// University of Hawaii Sea Level Center, research-quality hourly data
// [Caldwell et al. 2015], one CSV per station (year, month, day, hour UTC,
// level in mm, -32767 = missing), data/grav/tides/raw/h<id>a.csv: Brest
// (822), Marseille (824), Pensacola (762), Manila (370), Fremantle (175).
// The build keeps 2018, the last year every one of them has.
//
// # Method
//
//  1. Spectrum, with the clock alone. For each frequency f of a grid from
//     0.80 to 2.20 cycles per day (step 0.0002), the amplitude of the best
//     sinusoid, A(f) = (2/N) |sum (h_i - mean) exp(-2 pi i f t_i)|, the
//     classical periodogram [Munk & Cartwright 1966, section 2] over the
//     valid hours. The strongest line of the semidiurnal band (1.7-2.2 cpd)
//     and of the diurnal band (0.8-1.2 cpd) are found on that grid and
//     refined by a golden-section search of A(f) within one grid step; their
//     periods are what the page calls measured. Nothing astronomical enters.
//  2. Spring and neap, with the clock alone. The range (highest minus lowest
//     hour) of each lunar day, 24.8412 h [Schureman 1958, table 1, M1 = half
//     M2's speed], with at least 20 valid hours; the strongest period of
//     that series between 8 and 40 days (same periodogram, step 0.0005 cpd,
//     refined). Where the semidiurnal tide dominates it is the beat of M2
//     and S2, 14.77 d (half a synodic month); where the diurnal tide does,
//     the beat of K1 and O1, 13.66 d (half a tropical month, the Moon's
//     declination).
//  3. Harmonic analysis, with the Moon's and Sun's mean motions. Fourteen
//     constituents (Sa, Ssa, Mm, Mf, Q1, O1, P1, K1, N2, M2, S2, K2, M4,
//     MS4), fitted by least squares with package tide (equilibrium
//     arguments from Doodson numbers [Doodson 1921] and Meeus' mean
//     longitudes, nodal corrections [Schureman 1958; Foreman 1977]):
//     amplitude H and Greenwich phase lag g of each. From them: S2/M2 and
//     K1/O1, the form factor F = (K1 + O1)/(M2 + S2) (F < 0.25 semidiurnal,
//     0.25-1.5 mixed mainly semidiurnal, 1.5-3 mixed mainly diurnal, > 3
//     diurnal [Pugh & Woodworth 2014, section 4.2.3]), the age of the tide
//     (g_S2 - g_M2)/(speed S2 - speed M2), the lag of spring tides behind new
//     and full moon [Pugh & Woodworth 2014, section 4.2.1], and the share of
//     the year's variance the fit explains.
//
// The equilibrium values the page compares with (S2/M2 = 0.465, K1/O1 =
// 1.41) come from the coefficients of the tide-generating potential
// [Doodson 1921; Cartwright & Tayler 1971] and are written by the page, not
// here.
//
// # References
//
//   - [Caldwell et al. 2015] P. C. Caldwell, M. A. Merrifield, P. R. Thompson, Sea level measured by
//     tide gauges from global oceans — the Joint Archive for Sea Level holdings (NCEI Accession
//     0019568), Version 5.5, NOAA NCEI (2015), doi:10.7289/V5V40S7W.
//   - [Cartwright & Tayler 1971] D. E. Cartwright, R. J. Tayler, "New computations of the
//     tide-generating potential", Geophys. J. R. Astron. Soc. 23 (1971) 45-74.
//   - [Doodson 1921] A. T. Doodson, "The harmonic development of the tide-generating potential",
//     Proc. R. Soc. A 100 (1921) 305-329.
//   - [Foreman 1977] M. G. G. Foreman, Manual for Tidal Heights Analysis and Prediction, Pacific
//     Marine Science Report 77-10 (1977, rev. 2004).
//   - [Munk & Cartwright 1966] W. H. Munk, D. E. Cartwright, "Tidal spectroscopy and prediction",
//     Phil. Trans. R. Soc. A 259 (1966) 533-581.
//   - [Pugh & Woodworth 2014] D. Pugh, P. Woodworth, Sea-Level Science, Cambridge University Press
//     (2014).
//   - [Schureman 1958] P. Schureman, Manual of Harmonic Analysis and Prediction of Tides, US Coast
//     and Geodetic Survey Special Publication 98 (1958).
package gravtides

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/tide"
)

const (
	Dir  = "data/grav/tides"
	Out  = "src/data/presets/grav-tides.js"
	Year = 2018
	// LunarDay is 24.8412 h, the period of M1 = half M2's speed [Schureman 1958].
	LunarDay = 24.8412
	// excerpt kept for the page's plot: 1-31 March of Year
	exMonth = 3
)

// Station is a gauge as the page names it.
type Station struct {
	Key, Name, File string
	Lat, Lon        float64 // degrees, from the UHSLC metadata (drawing only)
}

// Stations are the five gauges, in the page's order.
var Stations = []Station{
	{"brest", "Brest", "h822a.csv", 48.3833, -4.495},
	{"marseille", "Marseille", "h824a.csv", 43.2783, 5.3533},
	{"pensacola", "Pensacola", "h762a.csv", 30.4033, -87.2133},
	{"manila", "Manila", "h370a.csv", 14.5821, 120.9715},
	{"fremantle", "Fremantle", "h175a.csv", -32.05, 115.7333},
}

// Names are the fitted constituents.
var Names = []string{"Sa", "Ssa", "Mm", "Mf", "Q1", "O1", "P1", "K1", "N2", "M2", "S2", "K2", "M4", "MS4"}

// Speed returns a constituent's speed in degrees per hour from its Doodson
// numbers and the rates of tau, s, h, p, N', p1 [Schureman 1958, table 1].
func Speed(c tide.Constituent) float64 {
	r := [6]float64{14.4920521, 0.5490165, 0.0410686, 0.0046418, 0.0022064, 0.0000020}
	v := 0.0
	for i, d := range c.Dn {
		v += d * r[i]
	}
	return v
}

// Read returns the valid hours of Year: Unix times and levels in metres.
func Read(path string) (ts, h []float64, missing int, err error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, nil, 0, fmt.Errorf("%w (fog fetch grav-tides)", err)
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	pre := strconv.Itoa(Year) + ","
	n := 0
	for sc.Scan() {
		n++
		line := sc.Text()
		if !strings.HasPrefix(line, pre) {
			continue
		}
		c := strings.Split(line, ",")
		if len(c) != 5 {
			return nil, nil, 0, fmt.Errorf("%s:%d: %d columns", path, n, len(c))
		}
		var v [5]int
		for i := range c {
			if v[i], err = strconv.Atoi(strings.TrimSpace(c[i])); err != nil {
				return nil, nil, 0, fmt.Errorf("%s:%d: %q", path, n, line)
			}
		}
		if v[4] == -32767 {
			missing++
			continue
		}
		t := time.Date(v[0], time.Month(v[1]), v[2], v[3], 0, 0, 0, time.UTC).Unix()
		if len(ts) > 0 && float64(t) <= ts[len(ts)-1] {
			return nil, nil, 0, fmt.Errorf("%s:%d: time not increasing", path, n)
		}
		ts = append(ts, float64(t))
		h = append(h, float64(v[4])/1000)
	}
	if err := sc.Err(); err != nil {
		return nil, nil, 0, err
	}
	if len(ts)+missing != 8760 {
		return nil, nil, 0, fmt.Errorf("%s: %d hours in %d, expected 8760", path, len(ts)+missing, Year)
	}
	return ts, h, missing, nil
}

// Amp is the periodogram amplitude at f cycles per day of (t days, y), y of mean zero.
func Amp(t, y []float64, f float64) float64 {
	var re, im float64
	w := 2 * math.Pi * f
	for i, ti := range t {
		s, c := math.Sincos(w * ti)
		re += y[i] * c
		im += y[i] * s
	}
	return 2 / float64(len(t)) * math.Hypot(re, im)
}

// Peak returns the frequency (cpd) and amplitude of the strongest line of
// (t, y) between f0 and f1 on a grid of step df, refined by a golden-section
// search within one step.
func Peak(t, y []float64, f0, f1, df float64) (float64, float64) {
	best, ba := f0, -1.0
	for f := f0; f <= f1+1e-12; f += df {
		if a := Amp(t, y, f); a > ba {
			best, ba = f, a
		}
	}
	a, b := best-df, best+df
	g := (math.Sqrt(5) - 1) / 2
	x1, x2 := b-g*(b-a), a+g*(b-a)
	y1, y2 := Amp(t, y, x1), Amp(t, y, x2)
	for i := 0; i < 60; i++ {
		if y1 > y2 {
			b, x2, y2 = x2, x1, y1
			x1 = b - g*(b-a)
			y1 = Amp(t, y, x1)
		} else {
			a, x1, y1 = x1, x2, y2
			x2 = a + g*(b-a)
			y2 = Amp(t, y, x2)
		}
	}
	f := (a + b) / 2
	return f, Amp(t, y, f)
}

// Const is one fitted constituent.
type Const struct {
	Name  string
	Speed float64 // deg/h
	H, G  float64 // m, deg (Greenwich phase lag, 0-360)
}

// Gauge is everything the page shows of one station.
type Gauge struct {
	Station
	N, Missing   int
	Mean         float64   // m above the station zero
	Spec         []float64 // max amplitude (m) per 0.004 cpd bin from 0.80 cpd
	FSemi, ASemi float64   // strongest semidiurnal line, cpd and m
	FDiur, ADiur float64   // strongest diurnal line
	Ranges       int       // lunar days with a range
	PRange       float64   // days, strongest period of the daily range, 8-40 d
	RangeMean    float64   // m
	Cs           []Const
	Explained    float64   // share of the variance explained by the fit
	RMS          float64   // m, residual
	Obs, Fit     []float64 // March, hourly, m about the mean (NaN = missing)
}

const (
	specF0, specF1, specStep, specBin = 0.80, 2.20, 0.0002, 0.004
)

// Analyse reads and analyses one station.
func Analyse(root string, st Station) (*Gauge, error) {
	ts, h, miss, err := Read(filepath.Join(root, Dir, "raw", st.File))
	if err != nil {
		return nil, err
	}
	g := &Gauge{Station: st, N: len(ts), Missing: miss}
	if g.N < 7000 {
		return nil, fmt.Errorf("grav-tides: %s has only %d valid hours", st.Name, g.N)
	}
	for _, v := range h {
		g.Mean += v
	}
	g.Mean /= float64(g.N)
	t0 := float64(time.Date(Year, 1, 1, 0, 0, 0, 0, time.UTC).Unix())
	td := make([]float64, g.N)
	y := make([]float64, g.N)
	for i := range ts {
		td[i] = (ts[i] - t0) / 86400
		y[i] = h[i] - g.Mean
	}
	// 1. spectrum
	nb := int(math.Round((specF1 - specF0) / specBin))
	g.Spec = make([]float64, nb)
	for f := specF0; f < specF1-1e-12; f += specStep {
		b := int((f - specF0 + 1e-9) / specBin)
		if b >= nb {
			break
		}
		if a := Amp(td, y, f); a > g.Spec[b] {
			g.Spec[b] = a
		}
	}
	g.FSemi, g.ASemi = Peak(td, y, 1.7, 2.2, specStep)
	g.FDiur, g.ADiur = Peak(td, y, 0.8, 1.2, specStep)
	// 2. range of each lunar day
	var rt, rv []float64
	L := LunarDay / 24
	for k := 0; ; k++ {
		a, b := float64(k)*L, float64(k+1)*L
		if b > 365 {
			break
		}
		lo, hi, n := math.Inf(1), math.Inf(-1), 0
		for i, t := range td {
			if t >= a && t < b {
				lo, hi, n = math.Min(lo, y[i]), math.Max(hi, y[i]), n+1
			}
		}
		if n >= 20 {
			rt = append(rt, (a+b)/2)
			rv = append(rv, hi-lo)
		}
	}
	g.Ranges = len(rv)
	for _, v := range rv {
		g.RangeMean += v
	}
	g.RangeMean /= float64(len(rv))
	for i := range rv {
		rv[i] -= g.RangeMean
	}
	fr, _ := Peak(rt, rv, 1.0/40, 1.0/8, 0.0005)
	g.PRange = 1 / fr
	// 3. harmonic analysis
	m := tide.Pick(Names...)
	x := m.FitSeries(ts, h)
	for k, c := range m {
		A, B := x[1+2*k], x[2+2*k]
		ph := math.Atan2(B, A) * 180 / math.Pi
		if ph < 0 {
			ph += 360
		}
		g.Cs = append(g.Cs, Const{c.Name, Speed(c), math.Hypot(A, B), ph})
	}
	var ss, sr float64
	for i, t := range ts {
		r := h[i] - m.At(x, t)
		ss += y[i] * y[i]
		sr += r * r
	}
	g.Explained = 1 - sr/ss
	g.RMS = math.Sqrt(sr / float64(g.N))
	// March, for the plot
	e0 := time.Date(Year, exMonth, 1, 0, 0, 0, 0, time.UTC).Unix()
	e1 := time.Date(Year, exMonth+1, 1, 0, 0, 0, 0, time.UTC).Unix()
	at := map[int64]float64{}
	for i, t := range ts {
		if int64(t) >= e0 && int64(t) < e1 {
			at[int64(t)] = h[i]
		}
	}
	for t := e0; t < e1; t += 3600 {
		if v, ok := at[t]; ok {
			g.Obs = append(g.Obs, v-g.Mean)
		} else {
			g.Obs = append(g.Obs, math.NaN())
		}
		g.Fit = append(g.Fit, m.At(x, float64(t))-g.Mean)
	}
	return g, nil
}

// C returns the named constituent.
func (g *Gauge) C(name string) Const {
	for _, c := range g.Cs {
		if c.Name == name {
			return c
		}
	}
	panic("gravtides: no " + name)
}

// Form is the form factor (K1 + O1)/(M2 + S2).
func (g *Gauge) Form() float64 {
	return (g.C("K1").H + g.C("O1").H) / (g.C("M2").H + g.C("S2").H)
}

// Age is the age of the tide in days: (g_S2 - g_M2)/(speed S2 - speed M2), the phase difference taken in (-180, 180].
func (g *Gauge) Age() float64 {
	s, m := g.C("S2"), g.C("M2")
	d := math.Mod(s.G-m.G+540, 360) - 180
	return d / (s.Speed - m.Speed) / 24
}

// Result is the five gauges.
type Result struct{ Gauges []*Gauge }

// Compute analyses every station.
func Compute(root string) (*Result, error) {
	r := &Result{}
	for _, st := range Stations {
		g, err := Analyse(root, st)
		if err != nil {
			return nil, err
		}
		r.Gauges = append(r.Gauges, g)
	}
	return r, nil
}

func num(v float64, prec int) string {
	if math.IsNaN(v) {
		return "null"
	}
	s := strconv.FormatFloat(v, 'f', prec, 64)
	if strings.Contains(s, ".") {
		s = strings.TrimRight(strings.TrimRight(s, "0"), ".")
	}
	if s == "-0" {
		s = "0"
	}
	return s
}

func list(v []float64, prec int) string {
	p := make([]string, len(v))
	for i, x := range v {
		p[i] = num(x, prec)
	}
	return "[" + strings.Join(p, ",") + "]"
}

// File renders the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	fmt.Fprintf(&b, "export const TIDE_YEAR = %d;\nexport const TIDE_SPEC = { f0: %s, step: %s };\nexport const TIDE_EXCERPT = { year: %d, month: %d };\nexport const TIDE_GAUGES = [\n", Year, num(specF0, 3), num(specBin, 4), Year, exMonth)
	for _, g := range r.Gauges {
		fmt.Fprintf(&b, "  { key: %q, name: %q, lat: %s, lon: %s, n: %d, missing: %d, mean: %s,\n", g.Key, g.Name, num(g.Lat, 4), num(g.Lon, 4), g.N, g.Missing, num(g.Mean, 3))
		fmt.Fprintf(&b, "    fSemi: %s, aSemi: %s, fDiur: %s, aDiur: %s, ranges: %d, pRange: %s, rangeMean: %s,\n", num(g.FSemi, 6), num(g.ASemi, 4), num(g.FDiur, 6), num(g.ADiur, 4), g.Ranges, num(g.PRange, 3), num(g.RangeMean, 3))
		fmt.Fprintf(&b, "    explained: %s, rms: %s, form: %s, age: %s,\n    cs: {", num(g.Explained, 4), num(g.RMS, 4), num(g.Form(), 3), num(g.Age(), 2))
		for i, c := range g.Cs {
			if i > 0 {
				b.WriteString(", ")
			}
			fmt.Fprintf(&b, "%s: [%s, %s]", c.Name, num(c.H, 4), num(c.G, 1))
		}
		fmt.Fprintf(&b, "},\n    spec: %s,\n    obs: %s,\n    fit: %s },\n", list(g.Spec, 4), list(g.Obs, 3), list(g.Fit, 3))
	}
	b.WriteString("];\n")
	return preset.File{
		Out: Out, Command: "build grav-tides", Inputs: inputs(),
		Notes: []string{
			fmt.Sprintf("Hourly sea level %d at five UHSLC tide gauges (research quality). Per gauge: n valid hours, mean (m above the", Year),
			"station zero); fSemi/fDiur = strongest line of the semidiurnal / diurnal band read off the periodogram (cycles per",
			"day, clock alone) and its amplitude (m); pRange = strongest period of the range of each lunar day, 8-40 d (days);",
			"cs = harmonic fit [H m, g deg Greenwich lag] (frequencies from the Moon's and Sun's mean motions); form =",
			"(K1+O1)/(M2+S2); age = (g_S2 - g_M2)/(speed S2 - speed M2) in days; spec = largest periodogram amplitude (m) in",
			"each bin of TIDE_SPEC.step cpd from f0; obs/fit = March, hourly from 1 March 0 h UTC, m about the mean (null = missing).",
			"Method and references: go doc -all ./internal/build/gravtides (from tools/).",
		},
		Body: b.String(),
	}
}

func inputs() []string {
	v := make([]string, len(Stations))
	for i, s := range Stations {
		v[i] = Dir + "/raw/" + s.File
	}
	return v
}

// Summary is the report line of the build.
func (r *Result) Summary() string {
	var p []string
	for _, g := range r.Gauges {
		p = append(p, fmt.Sprintf("%s %.3f h / %.2f d", g.Name, 24/g.FSemi, g.PRange))
	}
	return strings.Join(p, ", ")
}
