// Package romer runs Rømer's argument backwards (sun tab, 2026-11-25): Io's eclipses are a clock at Jupiter, read
// from the Earth late by the light's time of flight; with the velocity of light measured in a laboratory, the size of the
// delay's swing as the Earth-Jupiter distance changes gives the astronomical unit in kilometres.
//
// Data: J. H. Lieske's compilation of the eclipses of the Galilean satellites, 16,802 timings from 1652 to 1983 (8,822 of
// Io) from 426 observatories (J. H. Lieske, Astron. Astrophys. Suppl. 63 (1986) 143; "A collection of Galilean satellite
// eclipses 1652-1982", in Dynamical Trapping and Evolution in the Solar System, Reidel 1983, 51-59: the Delisle
// manuscripts of the Paris Observatory and Pingré's Annales célestes, Delambre's lost collection found again), raw file of
// the IMCCE Natural Satellites Data Center (data/sun/romer/raw/): UT of the mid-event (half brightness), disappearance D
// or reappearance R, visual V or photometric P (Harvard, 1878-1903), an a priori error σ. The standard file, whose O−C
// come from a satellite theory, is not used.
//
// What Lieske did to the times, and why it cannot reach the result. He reduced local apparent times to UT with each
// site's longitude and the equation of time, and corrected some longitudes from the residuals of an ephemeris (the 1983
// paper, Hoai-Ngan = Huai'an). A longitude error shifts all of a site's timings by one constant: every site (publication
// × observatory) with MinSite timings or more gets its own free offset in each era, so no such correction enters the
// light time. The semi-duration of the fading (TQ, 106-114 s for Io, from a theory) is not used.
//
// Model of one timing at UT t (TT = UT + ΔT, ΔT from F. Espenak and J. Meeus, NASA/TP-2006-214141, section 2.6). The
// eclipse happens at Jupiter at t_e = t_o − A_s d, where d is the Earth-Jupiter distance in AU and A_s = A/c the light
// time over one astronomical unit A, when Io's mean longitude reaches the edge of Jupiter's shadow:
//
//	λ₀ + n (t_e − t̄) + ½ ṅ (t_e − t̄)² + L(t_e) = ℓ(t_e) ∓ h(δ) + c_DR + c_site + v (±)(d − 5.2) + k₁ cos M + k₂ sin M
//
// ℓ is the longitude of the Sun-Jupiter line (the shadow's axis) in Jupiter's equatorial frame (pole of B. A. Archinal et
// al., Celest. Mech. Dyn. Astr. 130 (2018) 22), δ the Sun's jovicentric declination, h(δ) the half-arc of the shadow,
// flattened by Jupiter's 0.935, which Io crosses off its centre by sin δ of its orbit (− for D, + for R; the mean
// half-arc is free, c_DR); L = a sin θ + b cos θ the Laplace term, θ advancing at n_J − (2n₂ − n₁) (period 437.6 d):
// the forced eccentricity of Io, whose perijove turns with the Io-Europa conjunctions (P.-S. Laplace, Mécanique céleste
// IV; J. H. Lieske, A&A 82 (1980) 340 for n₁, n₂); v a drift of visual timings with distance, of opposite sign for D and
// R (a fainter Io is lost earlier and found later); k₁, k₂ a free term of Jupiter's year (M its mean anomaly). Moving
// n t_o to the right, the light time is −n A_s d: linear in A_s, fitted with the rest by weighted least squares (1/σ²),
// t_e and the geometry iterated with A_s. Timings more than 3 standard deviations from the fit of the others are left
// out (leave-one-out), repeatedly.
//
// The orbits, and why no distance enters them. The Earth (Earth-Moon barycentre) and Jupiter move on Keplerian orbits of
// E. M. Standish, "Keplerian Elements for Approximate Positions of the Major Planets" (JPL, Table 2a, 3000 BC - AD
// 3000): angles (L, ϖ, Ω, I), eccentricities, and Jupiter's semi-major axis in AU from Kepler's third law alone,
// a_J = (n_E/n_J)^(2/3) (1 + m_J)^(1/3) = 5.2028 (the printed a is not used). These approximate elements err by a few
// hundredths of a degree on Jupiter, with the period of its year; the free term k₁, k₂ takes that up, and with it the
// part of the light time that follows Jupiter's distance from the Sun: A_s then rests on the synodic swing alone (the
// Earth going round between Jupiter and the Sun every 399 days), which is Rømer's argument. Without the free term
// (Fixed) the eras scatter more (496-526 s). The check: the same fit on JPL DE440 (R. S. Park et al., Astron. J. 161
// (2021) 105) divided by its own unit, i.e. only the shape of its orbits; DE440 rests in part on radar ranging, hence a
// check under rule 10.
//
// Eras: six spans fitted apart (each its own clock, sites and drifts: ΔT and the secular acceleration of Io are not
// smooth over 330 years); the error of each is a bootstrap over whole oppositions (an apparition's timings share their
// weather, observers and clocks); the result is their weighted mean, its error scaled by the Birge ratio (R. T. Birge,
// Phys. Rev. 40 (1932) 207) when the eras disagree. A = A_s × c, c = 299,792.458 km/s (exact by definition since 1983,
// measured in laboratories before: Fizeau 1849, Foucault 1862, Michelson 1879-1926, Evenson 1972).
//
// The flat model's best case (rules 2 and 5). Without a distance to the Earth, nothing predicts a delay; give Io's clock
// a free curve of the synodic cycle (two harmonics, the phase being the angle Earth − Jupiter about the Sun, which the
// elongation of Jupiter shows in the sky) and of Jupiter's year: six free numbers instead of one. It fits as well as the
// globe; the test is whether its free numbers land where one astronomical unit puts them (Flat.Pred: the light time
// A_s d put through the same fit). Io's clock alone, with no curve, is the size of the effect.
//
// Rule 10: a measure. The data are times; c is a laboratory constant; the orbits are angles and a ratio of periods.
package romer

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/spk"
)

// Inputs and output, relative to the repository root.
const (
	Raw    = "data/sun/romer/raw/1652-1983_J1-4_lieske.data.txt"
	Readme = "data/sun/romer/raw/1652-1983_J1-4_lieske.readme.txt"
	DE440  = "data/moon/eclcraters/raw/de440.bsp" // the file of moon-eclcraters (fog fetch moon-eclcraters), for the check only
	Out    = "src/data/presets/sun-romer.js"
	C      = 299792.458 // km/s, exact (SI 1983)
)

// Obs is one line of the compilation.
type Obs struct {
	Year  int
	JD    float64 // UT Julian date of the mid-event, as printed
	Sigma float64 // s, Lieske's a priori uncertainty
	Mode  byte    // 'V' visual, 'P' photometric
	Sat   int
	Event byte   // 'D' disappearance (entering the shadow), 'R' reappearance
	Site  string // bibliographic + site codes
	TQ    int    // s, semi-duration of the fading (Lieske); not used by the fit
	Line  int
}

// Parse reads the 55-byte records: i4,i2,f8.5,i3,a1,i1,a1,2a2,f14.5,3a1,i6 (the file's readme).
func Parse(path string) ([]*Obs, error) {
	fh, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer fh.Close()
	var out []*Obs
	sc := bufio.NewScanner(fh)
	n := 0
	for sc.Scan() {
		n++
		l := strings.TrimRight(sc.Text(), "\r")
		if len(l) < 41 {
			continue
		}
		y, err1 := strconv.Atoi(strings.TrimSpace(l[0:4]))
		sg, err2 := strconv.Atoi(strings.TrimSpace(l[14:17]))
		jd, err3 := strconv.ParseFloat(strings.TrimSpace(l[24:38]), 64)
		sat := int(l[18] - '0')
		if err1 != nil || err2 != nil || err3 != nil || sat < 1 || sat > 4 || (l[19] != 'D' && l[19] != 'R') {
			return nil, fmt.Errorf("%s:%d: unreadable record %q", path, n, l)
		}
		tq, _ := strconv.Atoi(strings.TrimSpace(l[41:min(len(l), 47)]))
		out = append(out, &Obs{Year: y, JD: jd, Sigma: float64(sg), Mode: l[17], Sat: sat, Event: l[19], Site: l[20:24], TQ: tq, Line: n})
	}
	return out, sc.Err()
}

func load(root string) ([]*Obs, orbits, deOrbits, func(), error) {
	obs, err := Parse(filepath.Join(root, Raw))
	if err != nil {
		return nil, nil, deOrbits{}, nil, err
	}
	var de deOrbits
	closer := func() {}
	if f, err := spk.Open(filepath.Join(root, DE440)); err == nil {
		de = deOrbits{f}
		closer = func() { f.Close() }
	}
	return obs, keplerOrbits{}, de, closer, nil
}

// Era is one span of years fitted on its own (its own clock of Io, sites and drifts).
type Era struct {
	Y0, Y1 int
	Main   *Fit // Kepler orbits (angles and periods), free term of Jupiter's year: the measure
	Fixed  *Fit // the same, Jupiter's year left to the orbits (no free term)
	DE     *Fit // DE440's orbits divided by its unit, free term of Jupiter's year: the check
	Bins   []Bin
}

// Bin is the mean delay of the timings whose Earth-Jupiter distance falls in [D0, D0+BinW).
type Bin struct {
	D0, D, Delay, Sem float64
	N                 int
}

// BinW is the width of a distance bin, AU.
const BinW = 0.25

// Flat is the flat model's best free curve over the whole compilation, against Io's clock alone and the globe.
type Flat struct {
	Clock, Free, Globe *Fit
	Pred               map[string]float64 // s: the six coefficients the globe gives, from the measured light time
}

// Result is the reduction.
type Result struct {
	Inputs              []string
	Total, Io, IoSites  int // IoSites: observatory codes (Site is publication + observatory)
	Modes               map[byte]int
	Eras                []*Era
	Whole               *Fit // the whole compilation in one fit (one clock for 330 years)
	Photo               *Fit // Harvard's photometric timings alone
	Mean, MeanErr, Chi2 float64
	Flat                Flat
	Series              [][3]float64 // photometric timings: decimal year, d AU, delay s
	Curve               [][2]float64 // 1878-1904 every 10 days: decimal year, d AU (the globe's curve)
	HasDE               bool
}

// Eras of the compilation; the boundaries fall between oppositions of Jupiter in years of few timings.
var Eras = [][2]int{{1660, 1709}, {1710, 1759}, {1760, 1809}, {1810, 1869}, {1870, 1919}, {1920, 1983}}

// Compute runs the whole reduction.
func Compute(root string) (*Result, error) {
	obs, kep, de, closeDE, err := load(root)
	if err != nil {
		return nil, err
	}
	defer closeDE()
	r := &Result{Inputs: []string{Raw}, Total: len(obs), Modes: map[byte]int{}, HasDE: de.f != nil}
	sites := map[string]bool{}
	for _, o := range obs {
		if o.Sat == 1 {
			r.Io++
			r.Modes[o.Mode]++
			sites[o.Site[2:]] = true
		}
	}
	r.IoSites = len(sites)
	var sw, swx float64
	for k, e := range Eras {
		era := &Era{Y0: e[0], Y1: e[1]}
		if era.Main, err = run(kep, obs, Options{Orbits: "kepler", Sites: true, Free12: true, Y0: e[0], Y1: e[1]}); err != nil {
			return nil, err
		}
		era.Main.bootstrap(400, int64(k+1))
		if era.Fixed, err = run(kep, obs, Options{Orbits: "kepler", Sites: true, Y0: e[0], Y1: e[1]}); err != nil {
			return nil, err
		}
		if r.HasDE {
			if era.DE, err = run(de, obs, Options{Orbits: "de440", Sites: true, Free12: true, Y0: e[0], Y1: e[1]}); err != nil {
				return nil, err
			}
			era.DE.bootstrap(400, int64(k+101))
		}
		era.Bins = bins(era.Main)
		r.Eras = append(r.Eras, era)
		w := 1 / (era.Main.Boot * era.Main.Boot)
		sw += w
		swx += w * era.Main.As
	}
	r.Mean = swx / sw
	for _, era := range r.Eras {
		z := (era.Main.As - r.Mean) / era.Main.Boot
		r.Chi2 += z * z
	}
	// the error of the mean, scaled by the Birge ratio when the eras disagree more than their errors allow
	birge := math.Max(1, math.Sqrt(r.Chi2/float64(len(r.Eras)-1)))
	r.MeanErr = birge / math.Sqrt(sw)
	if r.Whole, err = run(kep, obs, Options{Orbits: "kepler", Sites: true, Free12: true, Y0: 1652, Y1: 1983}); err != nil {
		return nil, err
	}
	r.Whole.bootstrap(400, 99)
	if r.Photo, err = run(kep, obs, Options{Orbits: "kepler", Mode: 'P', Sites: true, Free12: true, Y0: 1870, Y1: 1919}); err != nil {
		return nil, err
	}
	r.Photo.bootstrap(400, 77)
	for i, ob := range r.Photo.obs {
		if r.Photo.keep[i] {
			r.Series = append(r.Series, [3]float64{2000 + (ob.JD-j2000)/365.25, r.Photo.g[i].d, r.Photo.timeless[i]})
		}
	}
	for jd := 2407000.0; jd < 2416600; jd += 10 { // 1878.0 to 1904.3
		g := geometry(kep, jd, r.Photo.As)
		r.Curve = append(r.Curve, [2]float64{2000 + (jd-j2000)/365.25, g.d})
	}
	if r.Flat.Clock, err = run(kep, obs, Options{Orbits: "kepler", Sites: true, Flat: true, Clock: true, Y0: 1652, Y1: 1983}); err != nil {
		return nil, err
	}
	if r.Flat.Free, err = run(kep, obs, Options{Orbits: "kepler", Sites: true, Flat: true, Y0: 1652, Y1: 1983}); err != nil {
		return nil, err
	}
	r.Flat.Globe = r.Whole
	// what the globe says the flat curve's six numbers must be: the light time As·d (As measured above, whole
	// compilation) put through the same fit, on the same timings, with the same weights
	f := r.Flat.Free
	yp := make([]float64, len(f.y))
	for i, g := range f.g {
		yp[i] = -r.Whole.As * g.d / secDay * nIo
	}
	beta, _, err := solve(f.X, yp, f.w, f.keep)
	if err != nil {
		return nil, err
	}
	r.Flat.Pred = map[string]float64{}
	for _, nm := range []string{"s1c", "s1s", "s2c", "s2s", "mjc", "mjs"} {
		r.Flat.Pred[nm] = beta[f.col(nm)] / nIo * secDay
	}
	// the globe was given the same free term of Jupiter's year: the prediction carries what it found there
	r.Flat.Pred["mjc"] += r.Whole.S("mjc")
	r.Flat.Pred["mjs"] += r.Whole.S("mjs")
	return r, nil
}

// bins averages the delay seen by distance (the partial residual of the light-time term).
func bins(f *Fit) []Bin {
	acc := map[int]*[3]float64{}
	accD := map[int]float64{}
	for i, g := range f.g {
		if !f.keep[i] {
			continue
		}
		k := int(math.Floor(g.d / BinW))
		if acc[k] == nil {
			acc[k] = &[3]float64{}
		}
		v := f.timeless[i]
		acc[k][0]++
		acc[k][1] += v
		acc[k][2] += v * v
		accD[k] += g.d
	}
	var ks []int
	for k := range acc {
		ks = append(ks, k)
	}
	sort.Ints(ks)
	var out []Bin
	for _, k := range ks {
		a := acc[k]
		n := a[0]
		if n < 5 {
			continue
		}
		m := a[1] / n
		sd := math.Sqrt(math.Max(0, a[2]/n-m*m) * n / (n - 1))
		out = append(out, Bin{D0: float64(k) * BinW, D: accD[k] / n, Delay: m, Sem: sd / math.Sqrt(n), N: int(n)})
	}
	return out
}

// Summary is one line for fog.
func (r *Result) Summary() string {
	return fmt.Sprintf("%d Io eclipses of %d; light time over 1 AU %.1f ± %.1f s (six eras, χ² %.1f) → AU %.2f ± %.2f million km; whole %.1f ± %.1f s; photometric %.1f ± %.1f s; rms clock %.0f s, flat curve %.0f s, globe %.0f s",
		r.Whole.N, r.Io, r.Mean, r.MeanErr, r.Chi2, r.Mean*C/1e6, r.MeanErr*C/1e6, r.Whole.As, r.Whole.Boot, r.Photo.As, r.Photo.Boot,
		r.Flat.Clock.Rms, r.Flat.Free.Rms, r.Whole.Rms)
}

func fitRow(f *Fit) []any {
	if f == nil {
		return nil
	}
	return []any{f.N, f.Drop, f.Opp, f.Sites, pyjson.Round(f.Rms, 1), pyjson.Round(f.As, 2), pyjson.Round(f.DAs, 2), pyjson.Round(f.Boot, 2),
		pyjson.Round(f.Laplace, 1), pyjson.Round(f.Vis, 1), pyjson.Round(f.S("mjc"), 1), pyjson.Round(f.S("mjs"), 1)}
}

// File writes src/data/presets/sun-romer.js.
func (r *Result) File() preset.File {
	var b strings.Builder
	b.WriteString("// One fit: [timings kept, excluded (> 3 SD of the others), oppositions, sites with their own offset, rms s,\n")
	b.WriteString("// light time over one AU s, its formal error s, its bootstrap error over oppositions s, Laplace term s,\n")
	b.WriteString("// visual drift s/AU, free term of Jupiter's year cos M s, sin M s] (null where not computed)\n")
	b.WriteString("// ROMER_ERAS: [first year, last year, the measure (Kepler orbits, free Jupiter year), the same without the free\n")
	b.WriteString("// term, the check (DE440's orbits in its unit, free Jupiter year) or null, bins [distance AU, mean delay s, its error s, n]]\n")
	b.WriteString("export const ROMER_ERAS = [\n")
	for _, e := range r.Eras {
		var bins []any
		for _, x := range e.Bins {
			bins = append(bins, []any{pyjson.Round(x.D, 3), pyjson.Round(x.Delay, 1), pyjson.Round(x.Sem, 1), x.N})
		}
		var de any
		if e.DE != nil {
			de = fitRow(e.DE)
		}
		b.WriteString(" " + pyjson.Dumps([]any{e.Y0, e.Y1, fitRow(e.Main), fitRow(e.Fixed), de, bins}, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	flat := pyjson.Obj{}
	for _, nm := range []string{"s1c", "s1s", "s2c", "s2s", "mjc", "mjs"} {
		flat = append(flat, pyjson.KV{K: nm, V: []any{pyjson.Round(r.Flat.Free.S(nm), 1), pyjson.Round(r.Flat.Free.SErr(nm), 1), pyjson.Round(r.Flat.Pred[nm], 1)}})
	}
	b.WriteString("// the whole compilation: weighted mean of the six eras (1/bootstrap²) and its error (Birge ratio when > 1), their χ²;\n")
	b.WriteString("// one fit of the 330 years; Harvard's photometric timings alone (1878-1903); c km/s; counts (ioSites: observatories)\n")
	b.WriteString("export const ROMER = " + pyjson.Dumps(pyjson.Obj{
		{K: "mean", V: pyjson.Round(r.Mean, 2)}, {K: "meanErr", V: pyjson.Round(r.MeanErr, 2)}, {K: "chi2", V: pyjson.Round(r.Chi2, 2)},
		{K: "whole", V: fitRow(r.Whole)}, {K: "photo", V: fitRow(r.Photo)}, {K: "c", V: C},
		{K: "total", V: r.Total}, {K: "io", V: r.Io}, {K: "ioSites", V: r.IoSites}, {K: "visual", V: r.Modes['V']}, {K: "photometric", V: r.Modes['P']},
		{K: "aJup", V: pyjson.Round(AJup, 5)},
	}, pyjson.Compact) + ";\n")
	b.WriteString("// the flat model's best curve, whole compilation: rms s of Io's clock alone, of the free curve (two harmonics of the\n")
	b.WriteString("// synodic cycle + Jupiter's year), of the globe; each coefficient [fitted s, its error s, what one AU predicts s (for\n")
	b.WriteString("// Jupiter's year, plus the free term the globe was given too)]\n")
	b.WriteString("export const ROMER_FLAT = " + pyjson.Dumps(pyjson.Obj{
		{K: "rmsClock", V: pyjson.Round(r.Flat.Clock.Rms, 1)}, {K: "nClock", V: r.Flat.Clock.N},
		{K: "rmsFree", V: pyjson.Round(r.Flat.Free.Rms, 1)}, {K: "nFree", V: r.Flat.Free.N},
		{K: "rmsGlobe", V: pyjson.Round(r.Whole.Rms, 1)}, {K: "coef", V: flat},
	}, pyjson.Compact) + ";\n")
	b.WriteString("// Harvard photometry, one timing per entry: [decimal year, Earth-Jupiter AU, delay s (the light-time term put back)]\n")
	b.WriteString("export const ROMER_SERIES = [")
	for i, s := range r.Series {
		if i%8 == 0 {
			b.WriteString("\n ")
		}
		b.WriteString(pyjson.Dumps([]any{pyjson.Round(s[0], 4), pyjson.Round(s[1], 4), pyjson.Round(s[2], 1)}, pyjson.Compact) + ",")
	}
	b.WriteString("\n];\n// the globe's Earth-Jupiter distance every 10 days, 1878-1904: [decimal year, AU]\nexport const ROMER_CURVE = [")
	for i, s := range r.Curve {
		if i%10 == 0 {
			b.WriteString("\n ")
		}
		b.WriteString(pyjson.Dumps([]any{pyjson.Round(s[0], 4), pyjson.Round(s[1], 4)}, pyjson.Compact) + ",")
	}
	b.WriteString("\n];\n")
	return preset.File{
		Out: Out, Command: "build sun-romer",
		Inputs: r.Inputs,
		Notes: []string{"Rømer reversed: the astronomical unit from 8,822 eclipses of Io (Lieske's compilation, 1652-1983, IMCCE NSDC),",
			"laboratory c and orbits made of angles and periods: go doc -all ./internal/build/romer."},
		Body: b.String(),
	}
}
