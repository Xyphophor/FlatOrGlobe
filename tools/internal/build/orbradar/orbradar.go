// Package orbradar reduces again the radar echoes from Venus of the spring of 1961 (orb tab, epic37/UC03, 2026-11-18):
// G. H. Pettengill, H. W. Briscoe, J. V. Evans, E. Gehrels, G. M. Hyde, L. G. Kraft, R. Price and W. B. Smith, "A Radar
// Investigation of Venus", Astron. J. 67 (1962) 181-190, Table II (25 two-way echo flight times measured with the
// Millstone radar of MIT Lincoln Laboratory, 6 March to 18 May 1961, each referred to the instant of reflection), our
// transcription (data/orb/radar/transcription/), with Table I (the site) and Table III (the five 1961 determinations).
//
// What an echo gives. The pulse leaves the antenna at t₁, is reflected by the nearest point of Venus at t (the printed
// instant), and comes back at t₂; the printed flight time is τ = t₂ − t₁. With the velocity of light c,
//
//	c τ = |V(t) − S(t₁)| + |V(t) − S(t₂)| − 2 R_V
//
// where V is the centre of Venus, S the antenna and R_V the radius of Venus. The orbits give V and the Earth's centre E
// in astronomical units with great precision (centuries of angles and Kepler's third law); the unknown is the size of
// that unit in kilometres. Writing V and E as A × (their positions in AU) and S = E + s, s the antenna's position from
// the Earth's centre (km), each echo is one equation for A, solved here by Newton's method, the times t₁ = t − |V − S₁|/c
// and t₂ = t + |V − S₂|/c iterated with it. This is the reduction of Pettengill et al. (p. 184: "the size of the
// astronomical unit is then obtained by dividing the product of the observed travel time and velocity of light by twice
// this distance"), done with today's orbits instead of Newcomb's and Duncombe's.
//
// Today's orbits: JPL DE440 (R. S. Park, W. M. Folkner, J. G. Williams and D. H. Boggs, Astron. J. 161 (2021) 105, read by
// package spk), divided by its astronomical unit, 149,597,870.700 km (IAU 2012 Resolution B2), to give the positions in
// AU. Time: UT as printed, TDB = UT + ΔT, ΔT(1961.3) = 33.9 s (Espenak & Meeus, NASA/TP-2006-214141; TDB − TT, under
// 2 ms, is neglected). Direction of Venus in the frame of date: IAU 1976 precession (Lieske et al., A&A 58 (1977) 1),
// nutation neglected (under 20″, under 1 km here). The antenna: Table I (42°37′03″ N, 71°29′32″ W, 156 m) on the
// International Ellipsoid that Pettengill et al. used (a = 6378.388 km, f = 1/297), turned by the mean sidereal time
// (IAU 1982, Aoki et al., A&A 105 (1982) 359) with UT1 = UT. R_V = 6051.8 km (Magellan mean radius, Archinal et al.,
// Celest. Mech. Dyn. Astr. 109 (2011) 101) and, for comparison with the printed columns, their 6123 km (Kuiper 1954).
// c = 299,792.458 km/s (exact); the 1962 reduction used 299,792.5 (Froome 1958), the difference is given.
//
// Neglected, with their size: the Shapiro delay (≈ 7 µs on the two legs near conjunction, 1.3 km on A); the troposphere
// (≈ 2.3 m at the zenith); the ionosphere and the interplanetary plasma at 440 MHz (tens of metres; Pettengill et al.
// p. 186 bound the plasma under 30 km on A).
//
// Rule 10 (evidence classes): a check. The Earth's size enters through the antenna's offset from the Earth's centre, s,
// up to 6,378 km on a distance of 42 to 67 million km (up to 1.5 × 10⁻⁴ of each distance); and today's orbits come in
// part from later radar ranging. The flight times themselves are a clock, and the 1962 reduction with Newcomb's orbits
// (angles only) is printed beside ours.
package orbradar

import (
	"encoding/csv"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/spk"
)

// Inputs, relative to the repository root.
const (
	Dir    = "data/orb/radar/transcription"
	Table2 = Dir + "/pettengill1962-table2.csv"
	Table3 = Dir + "/pettengill1962-table3.csv"
	Site   = Dir + "/pettengill1962-site.csv"
	DE440  = "data/moon/eclcraters/raw/de440.bsp" // the same file as moon-eclcraters (fog fetch moon-eclcraters)
	Out    = "src/data/presets/orb-radar.js"

	AUkm     = 149597870.700 // IAU 2012 B2, the unit of DE440's lengths
	C        = 299792.458    // km/s
	C1962    = 299792.5      // km/s, Froome 1958, the 1962 reduction
	RVenus   = 6051.8        // km, Magellan mean radius (Archinal et al. 2011)
	RV1962   = 6123.0        // km, Kuiper 1954, the 1962 reduction
	aIntl    = 6378.388      // km, International Ellipsoid (Hayford 1924)
	fIntl    = 1 / 297.0
	deltaT61 = 33.9 // s, TT − UT in 1961.3 (Espenak & Meeus)
	j2000JD  = 2451545.0
	secDay   = 86400.0
	d2r      = math.Pi / 180
)

// Echo is one line of Table II and its reduction.
type Echo struct {
	Date, UT          string
	Tau, TauErr       float64 // s (TauErr NaN when not printed)
	AUNewcomb, AUDunc float64 // km, as printed
	Err               float64 // km, as printed
	JD                float64 // UT
	A, A1962          float64 // km: our reduction (DE440, R_V 6051.8, c exact); the same with R_V 6123 km and c 1962
	DAU               float64 // Earth centre - Venus centre at t, AU
	StationKm         float64 // the antenna's offset projected on the line to Venus (km, mean of the two legs)
	Elong             float64 // deg, elongation of Venus from the Sun at t (from the Earth's centre)
	Phase             float64 // deg, Sun-Venus-Earth angle (0 = full, 180 = new)
}

// Team is one line of Table III.
type Team struct {
	Facility, Ref string
	FreqMHz       float64 // NaN when not printed
	AU, Err       float64 // Err NaN when not printed
}

// Result is the whole build.
type Result struct {
	Echoes []Echo
	Teams  []Team
	Lat    float64 // deg
	Lon    float64 // deg, east
	Alt    float64 // km
	Inputs []string
	Bad    []string
}

func readCSV(path string) ([][]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	r := csv.NewReader(f)
	r.Comment = '#'
	r.FieldsPerRecord = -1
	rows, err := r.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return rows[1:], nil
}

func num(s string) float64 {
	if strings.TrimSpace(s) == "" {
		return math.NaN()
	}
	v, err := strconv.ParseFloat(strings.TrimSpace(s), 64)
	if err != nil {
		return math.NaN()
	}
	return v
}

// dmsDeg reads "42 37 03 N".
func dmsDeg(s string) float64 {
	f := strings.Fields(s)
	v := num(f[0]) + num(f[1])/60 + num(f[2])/3600
	if f[3] == "S" || f[3] == "W" {
		v = -v
	}
	return v
}

type v3 [3]float64

func (a v3) sub(b v3) v3      { return v3{a[0] - b[0], a[1] - b[1], a[2] - b[2]} }
func (a v3) add(b v3) v3      { return v3{a[0] + b[0], a[1] + b[1], a[2] + b[2]} }
func (a v3) mul(k float64) v3 { return v3{a[0] * k, a[1] * k, a[2] * k} }
func (a v3) dot(b v3) float64 { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
func (a v3) norm() float64    { return math.Sqrt(a.dot(a)) }
func angle(a, b v3) float64 {
	return math.Acos(math.Max(-1, math.Min(1, a.dot(b)/a.norm()/b.norm()))) / d2r
}
func rot3(a float64, v v3) v3 {
	c, s := math.Cos(a), math.Sin(a)
	return v3{c*v[0] + s*v[1], -s*v[0] + c*v[1], v[2]}
}
func rot2(a float64, v v3) v3 {
	c, s := math.Cos(a), math.Sin(a)
	return v3{c*v[0] - s*v[2], v[1], s*v[0] + c*v[2]}
}
func toICRFdate(tdbJD float64) func(v3) v3 { // mean equator and equinox of date -> ICRF (inverse IAU 1976 precession)
	T := (tdbJD - j2000JD) / 36525
	as := d2r / 3600
	zeta := (2306.2181*T + 0.30188*T*T + 0.017998*T*T*T) * as
	z := (2306.2181*T + 1.09468*T*T + 0.018203*T*T*T) * as
	theta := (2004.3109*T - 0.42665*T*T - 0.041833*T*T*T) * as
	// P = R3(−z) R2(θ) R3(−ζ) takes J2000 to date; its transpose takes date to J2000
	return func(v v3) v3 { return rot3(zeta, rot2(-theta, rot3(z, v))) }
}

// gmst (rad) at a UT1 Julian date: IAU 1982 (Aoki et al. 1982), in seconds of time.
func gmst(jd float64) float64 {
	d0 := math.Floor(jd-0.5) + 0.5
	T := (d0 - j2000JD) / 36525
	s := 24110.54841 + 8640184.812866*T + 0.093104*T*T - 6.2e-6*T*T*T + 1.00273790935*(jd-d0)*secDay
	return math.Mod(s, secDay) / secDay * 2 * math.Pi
}

// station is the antenna's position from the Earth's centre (km, ICRF) at UT jd.
func (r *Result) station(jd float64) v3 {
	phi, lam := r.Lat*d2r, r.Lon*d2r
	e2 := fIntl * (2 - fIntl)
	N := aIntl / math.Sqrt(1-e2*math.Sin(phi)*math.Sin(phi))
	x := v3{(N + r.Alt) * math.Cos(phi) * math.Cos(lam), (N + r.Alt) * math.Cos(phi) * math.Sin(lam), (N*(1-e2) + r.Alt) * math.Sin(phi)}
	ofDate := rot3(-gmst(jd), x) // Earth-fixed -> mean equator of date
	return toICRFdate(jd + deltaT61/secDay)(ofDate)
}

func julian(date, ut string) (float64, error) {
	t, err := time.Parse("2006-01-02 15:04:05", date+" "+ut)
	if err != nil {
		return 0, err
	}
	return float64(t.Unix())/secDay + 2440587.5, nil
}

// pos is the barycentric position (km) of a body at UT jd.
func pos(eph *spk.File, body int, jdUT float64) (v3, error) {
	p, err := eph.Bary(body, (jdUT+deltaT61/secDay-j2000JD)*secDay)
	return v3(p), err
}

// reduce solves one echo for the astronomical unit (km), with the given Venus radius and velocity of light.
func (r *Result) reduce(eph *spk.File, e *Echo, rv, c float64) (float64, float64, error) {
	A := AUkm
	var proj float64
	for it := 0; it < 6; it++ {
		V, err := pos(eph, spk.Venus, e.JD)
		if err != nil {
			return 0, 0, err
		}
		Vu := V.mul(1 / AUkm) // AU
		t1, t2 := e.JD-e.Tau/2/secDay, e.JD+e.Tau/2/secDay
		var legs [2]v3 // Venus minus Earth centre (AU), and antenna offsets (km)
		var st [2]v3
		for k := 0; k < 3; k++ { // light time on each leg
			E1, err := pos(eph, spk.Earth, t1)
			if err != nil {
				return 0, 0, err
			}
			E2, err := pos(eph, spk.Earth, t2)
			if err != nil {
				return 0, 0, err
			}
			legs = [2]v3{Vu.sub(E1.mul(1 / AUkm)), Vu.sub(E2.mul(1 / AUkm))}
			st = [2]v3{r.station(t1), r.station(t2)}
			d1, d2 := legs[0].mul(A).sub(st[0]).norm(), legs[1].mul(A).sub(st[1]).norm()
			t1, t2 = e.JD-d1/c/secDay, e.JD+d2/c/secDay
		}
		// f(A) = |A l₁ − s₁| + |A l₂ − s₂| − 2 R_V − c τ ; f′(A) = l₁·(A l₁ − s₁)/|…| + l₂·(…)
		f, fp := -2*rv-c*e.Tau, 0.0
		proj = 0
		for k := 0; k < 2; k++ {
			w := legs[k].mul(A).sub(st[k])
			f += w.norm()
			fp += legs[k].dot(w) / w.norm()
			proj += (legs[k].mul(A).norm() - w.norm()) / 2
		}
		A -= f / fp
	}
	return A, proj, nil
}

// Compute reads the transcription and DE440 and reduces every echo.
func Compute(root string) (*Result, error) {
	r := &Result{Inputs: []string{Table2, Table3, Site, DE440}}
	site, err := readCSV(filepath.Join(root, Site))
	if err != nil {
		return nil, err
	}
	for _, s := range site {
		switch s[0] {
		case "lat_geodetic":
			r.Lat = dmsDeg(s[1])
		case "lon":
			r.Lon = dmsDeg(s[1])
		case "alt_msl_m":
			r.Alt = num(s[1]) / 1000
		}
	}
	rows, err := readCSV(filepath.Join(root, Table2))
	if err != nil {
		return nil, err
	}
	eph, err := spk.Open(filepath.Join(root, DE440))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch moon-eclcraters downloads it)", err)
	}
	defer eph.Close()
	for i, row := range rows {
		e := Echo{Date: row[0], UT: row[1], Tau: num(row[2]), TauErr: num(row[3]), AUNewcomb: num(row[4]), AUDunc: num(row[5]), Err: num(row[6])}
		if e.JD, err = julian(e.Date, e.UT); err != nil {
			return nil, err
		}
		if i > 0 && e.JD <= r.Echoes[i-1].JD {
			r.Bad = append(r.Bad, fmt.Sprintf("row %d: time not after the previous row", i+1))
		}
		if e.A, e.StationKm, err = r.reduce(eph, &e, RVenus, C); err != nil {
			return nil, err
		}
		if e.A1962, _, err = r.reduce(eph, &e, RV1962, C1962); err != nil {
			return nil, err
		}
		E, _ := pos(eph, spk.Earth, e.JD)
		V, _ := pos(eph, spk.Venus, e.JD)
		S, _ := pos(eph, spk.Sun, e.JD)
		e.DAU = V.sub(E).norm() / AUkm
		e.Elong = angle(V.sub(E), S.sub(E))
		e.Phase = angle(S.sub(V), E.sub(V))
		// the print's two reductions must stay within 1,200 km of each other (they differ by Duncombe's corrections only)
		if math.Abs(e.AUNewcomb-e.AUDunc) > 1200 || math.Abs(e.AUNewcomb-AUkm) > 3000 {
			r.Bad = append(r.Bad, fmt.Sprintf("row %d (%s): printed a.u. columns implausible", i+1, e.Date))
		}
		r.Echoes = append(r.Echoes, e)
	}
	// the delay falls to a minimum at inferior conjunction (10 April 1961) and rises after: a transcription check
	imin := 0
	for i, e := range r.Echoes {
		if e.Tau < r.Echoes[imin].Tau {
			imin = i
		}
	}
	for i := 1; i < len(r.Echoes); i++ {
		up := r.Echoes[i].Tau > r.Echoes[i-1].Tau
		if (i <= imin && up) || (i > imin && !up) {
			r.Bad = append(r.Bad, fmt.Sprintf("row %d (%s): delay %.4f s out of order around conjunction", i+1, r.Echoes[i].Date, r.Echoes[i].Tau))
		}
	}
	teams, err := readCSV(filepath.Join(root, Table3))
	if err != nil {
		return nil, err
	}
	for _, t := range teams {
		r.Teams = append(r.Teams, Team{Facility: t[0], Ref: t[1], FreqMHz: num(t[2]), AU: num(t[3]), Err: num(t[4])})
	}
	return r, nil
}

// Stats: weighted mean (weights 1/err²) and its formal error, median, and the scatter of A about the mean.
func Stats(v, err []float64) (mean, sigma, median, rms float64) {
	sw, swx := 0.0, 0.0
	for i := range v {
		w := 1 / (err[i] * err[i])
		sw += w
		swx += w * v[i]
	}
	mean, sigma = swx/sw, 1/math.Sqrt(sw)
	s := append([]float64(nil), v...)
	sort.Float64s(s)
	if n := len(s); n%2 == 1 {
		median = s[n/2]
	} else {
		median = (s[n/2-1] + s[n/2]) / 2
	}
	for _, x := range v {
		rms += (x - mean) * (x - mean)
	}
	return mean, sigma, median, math.Sqrt(rms / float64(len(v)))
}

func (r *Result) column(f func(Echo) float64) []float64 {
	out := make([]float64, len(r.Echoes))
	for i, e := range r.Echoes {
		out[i] = f(e)
	}
	return out
}

// Summary is the build's one-line report.
func (r *Result) Summary() string {
	errs := r.column(func(e Echo) float64 { return e.Err })
	m, s, med, rms := Stats(r.column(func(e Echo) float64 { return e.A }), errs)
	mn, _, _, rmsN := Stats(r.column(func(e Echo) float64 { return e.AUNewcomb }), errs)
	return fmt.Sprintf("%d echoes: a.u. %.0f ± %.0f km (median %.0f, scatter %.0f km) with DE440; Newcomb's orbits (printed) %.0f, scatter %.0f km",
		len(r.Echoes), m, s, med, rms, mn, rmsN)
}

// File writes the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	errs := r.column(func(e Echo) float64 { return e.Err })
	st := func(f func(Echo) float64) []any {
		m, s, med, rms := Stats(r.column(f), errs)
		return []any{pyjson.Round(m, 0), pyjson.Round(s, 0), pyjson.Round(med, 0), pyjson.Round(rms, 0)}
	}
	nan := func(x float64, n int) any {
		if math.IsNaN(x) {
			return nil
		}
		return pyjson.Round(x, n)
	}
	b.WriteString("// Millstone radar, spring 1961 (Pettengill et al. 1962, Table II), one echo per line: [date, UT of reflection, flight time s,\n")
	b.WriteString("// its printed error s or null, a.u. km from Newcomb's orbits (printed), from Duncombe's (printed), error km (printed),\n")
	b.WriteString("// a.u. km from DE440 (ours), the same with R_V 6123 km and c 299,792.5 (1962 constants), Earth-Venus centres AU,\n")
	b.WriteString("// antenna offset projected on the line of sight km, elongation of Venus deg, Sun-Venus-Earth angle deg (180 = new)]\n")
	b.WriteString("export const RADAR_ECHOES = [\n")
	for _, e := range r.Echoes {
		b.WriteString(" " + pyjson.Dumps([]any{e.Date, e.UT, e.Tau, nan(e.TauErr, 4), e.AUNewcomb, e.AUDunc, e.Err, pyjson.Round(e.A, 0), pyjson.Round(e.A1962, 0),
			pyjson.Round(e.DAU, 7), pyjson.Round(e.StationKm, 0), pyjson.Round(e.Elong, 2), pyjson.Round(e.Phase, 2)}, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n// [weighted mean (1/err²), its formal error, median, rms scatter about the mean], km\n")
	b.WriteString("export const RADAR_STATS = " + pyjson.Dumps(pyjson.Obj{
		{K: "ours", V: st(func(e Echo) float64 { return e.A })}, {K: "ours1962", V: st(func(e Echo) float64 { return e.A1962 })},
		{K: "newcomb", V: st(func(e Echo) float64 { return e.AUNewcomb })}, {K: "duncombe", V: st(func(e Echo) float64 { return e.AUDunc })},
	}, pyjson.Compact) + ";\n")
	teams := []any{}
	for _, t := range r.Teams {
		teams = append(teams, []any{t.Facility, t.Ref, nan(t.FreqMHz, 0), t.AU, nan(t.Err, 0)})
	}
	b.WriteString("// Table III, the 1961 determinations: [facility, reference, MHz or null, a.u. km, error km or null]\n")
	b.WriteString("export const RADAR_TEAMS = " + pyjson.Dumps(teams, pyjson.Compact) + ";\n")
	b.WriteString(fmt.Sprintf("// the antenna (Table I): geodetic latitude, east longitude (deg), height (km); DE440's unit (km)\nexport const RADAR_SITE = %s;\nexport const RADAR_AU_DE = %s;\n",
		pyjson.Dumps([]any{pyjson.Round(r.Lat, 5), pyjson.Round(r.Lon, 5), r.Alt}, pyjson.Compact), pyjson.Float(AUkm)))
	return preset.File{
		Out: Out, Command: "build orb-radar",
		Inputs: r.Inputs,
		Notes: []string{"Venus radar echoes of 1961 (Pettengill et al., Astron. J. 67 (1962) 181, Tables I-III, our transcription),",
			"reduced again with JPL DE440: go doc -all ./internal/build/orbradar."},
		Body: b.String(),
	}
}
