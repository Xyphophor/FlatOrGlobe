// Package orbtransit reduces contact timings of transits of Venus (orb tab, epic37/UC04: 1769 on 2026-11-18, 1761 and 2012
// added on 2026-11-19) into the astronomical unit, in the manner of Delisle: stations far apart on the Earth see Venus touch the Sun's edge at
// different instants, because each looks along a different line; the size of those differences, against the size of the
// Earth, gives the distance.
//
// Data: S. Newcomb, "Discussion of observations of the transits of Venus in 1761 and 1769", Astronomical Papers prepared
// for the use of the American Ephemeris and Nautical Almanac, vol. II, part V (Washington, 1891): chapter VI, the tabular
// summary of every observation of 1769 (contact, station, observer, local and Greenwich mean times, Newcomb's tabular time,
// phase, class, telescope), and chapter IV, the adopted positions of the stations (latitude, log ρ sin φ′, log ρ cos φ′ in
// equatorial radii, longitude); our transcription in data/orb/transits/transcription/, 1769 (pp. 364-371) and 1761 (pp. 357-364).
// Checks (the build fails on any): every printed residual equals observed − tabular, and every local − Greenwich time equals
// the station's printed longitude (seven lines of 1761 contact IV whose printed residuals disagree with Newcomb's own times are
// flagged "res" in the transcription and pass). Where Newcomb prints no tabular time for a new station (Paris and its suburbs, 1761), the
// one above is carried over, and the residual check confirms it.
//
// 2012: the contact III timings sent by amateurs to the project "Contact times" of www.venus2012.de (U. Backhaus, Universität
// Duisburg-Essen), the only file of that project that survives (participants/daten3.txt, Internet Archive, 19 May 2024): name,
// place, latitude, longitude (geodetic, deg) and UT, as sent (one line has latitude and longitude swapped; nothing corrected).
// The observer is put on the WGS84 ellipsoid at height 0 (the file gives no height: up to a few hundred metres, under 0.1 s).
// 2004: the 4,550 timings of ESO's VT-2004 campaign are no longer online (IMCCE databases gone, not in the Internet Archive);
// only their published result is quoted on the page.
//
// Model. At a Greenwich mean time t (UT1 = GMT, or = UTC in 2012; TT = UT + ΔT: 15.1 s in 1761 and 16.2 s in 1769 from the
// polynomial of Espenak & Meeus 2006 for 1700-1800, 66.9 s in 2012, IERS), the Sun and Venus
// are taken from JPL DE440 (package spk) in units of its astronomical unit A_DE, with the light time from each, and scaled
// by a trial unit A (km). The observer is at ρ·a⊕ from the Earth's centre, a⊕ = 6378.137 km (GRS80), at geocentric
// latitude φ′ (from the printed logarithms) and at the local sidereal time GMST(t) − longitude (IAU 1982), turned from the
// mean equator of date to the ICRF by the IAU 1976 precession (Lieske et al. 1977). A contact is the instant at which the
// apparent separation of the centres equals s☉ + s♀ (I, IV, exterior) or s☉ − s♀ (II, III, interior), with the angular
// semi-diameters at one unit s☉ = 959.63″ (Auwers) and s♀ = 8.34″ (6051.8 km / A_DE), each divided by the distance in
// units. Solved for t by Newton's method from the observed time.
//
// Fit, for each transit apart and for the three together (one A, one offset per transit and contact). Each observation's
// residual o − c(A) is modelled as δ_k + noise, with one free offset δ_k per contact (it takes up
// the errors of the semi-diameters, the black drop and the observers' habits, which Newcomb discusses at length), and A
// free. c(A) is computed at A_DE and at 1.1·A_DE and interpolated linearly in 1/A (the parallax shift is proportional to
// 1/A; the error of the interpolation is under 0.1 s). Observations of the phase G at the interior contacts (an earlier
// appearance than the thread of light) are left out, as a different phenomenon; then any observation more than 3σ from
// the fit of the others (leave-one-out) is excluded, repeatedly. The error of A comes from a bootstrap over stations.
//
// Rule 10: a check. The baseline between the stations is in units of the Earth's radius, and the result is A in Earth
// radii (equivalently the solar parallax a⊕/A); its value in km uses a⊕. DE440 supplies the shape of the orbits.
package orbtransit

import (
	"encoding/csv"
	"fmt"
	"math"
	"math/rand"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/spk"
)

const (
	Obs      = "data/orb/transits/transcription/newcomb1891-1769.csv"
	Obs1761  = "data/orb/transits/transcription/newcomb1891-1761.csv"
	V2012    = "data/orb/transits/v2012/daten3.txt"
	Stations = "data/orb/transits/transcription/newcomb1891-stations.csv"
	DE440    = "data/moon/eclcraters/raw/de440.bsp"
	Out      = "src/data/presets/orb-transit.js"

	AUkm    = 149597870.700
	C       = 299792.458
	aEarth  = 6378.137
	sSun    = 959.63 // ″ at one unit
	sVenus  = 8.344  // ″ at one unit (6051.8 km)
	j2000   = 2451545.0
	secDay  = 86400.0
	d2r     = math.Pi / 180
	arcsec  = d2r / 3600
	jd1769  = 2367328.0 // 1769 June 3, 12h UT = 0h of Newcomb's astronomical day (Julian Day number at noon)
	jd1761  = 2364408.0 // 1761 June 5, 12h UT
	jd2012  = 2456084.5 // 2012 June 6, 0h UT
	wgsF    = 1 / 298.257223563
	nBoot   = 400
	sigClip = 3.0
)

// epoch: the Julian date of t = 0 (UT) and TT − UT (s).
type epoch struct{ jd0, dt float64 }

// Transit is one transit's timings.
type Transit struct {
	Year string
	File string
	Ep   epoch
}

// Transits, in order.
var Transits = []Transit{{"1761", Obs1761, epoch{jd1761, 15.1}}, {"1769", Obs, epoch{jd1769, 16.2}}, {"2012", V2012, epoch{jd2012, 66.9}}}

// Station is one line of Newcomb's table of positions.
type Station struct {
	Name           string
	Lat            float64 // deg
	RhoSin, RhoCos float64 // equatorial radii
	Lon            float64 // seconds of time, + west
}

// Row is one observation.
type Row struct {
	Transit                                             string
	Ep                                                  epoch
	Contact, Station, Observer, Phase, Class, Telescope string
	LMT, GMT, Tab                                       float64 // s from Newcomb's astronomical 0h of June 3 (LMT NaN if not printed)
	Resid                                               float64
	St                                                  *Station
	C0, C1                                              float64 // computed contact (s), at A_DE and at 1.1·A_DE
	DX, DY                                              float64 // the station on the Earth's disc seen from the Sun (equatorial radii; y towards the ecliptic north)
	Used                                                bool
	Why                                                 string // reason for leaving it out
}

// Result is the whole build.
type Result struct {
	Rows     []*Row
	Stations map[string]*Station
	Fits     map[string]*Fit // "1761", "1769", "2012", "all"
	Bad      []string
	Inputs   []string
}

// Fit is the unit fitted on a set of timings.
type Fit struct {
	A, SA, RMS float64
	Off        map[string]float64 // "<transit> <contact>" -> s
	N, Used    int
	Boot       []float64
}

func num(s string) float64 {
	v, err := strconv.ParseFloat(strings.TrimSpace(s), 64)
	if err != nil {
		return math.NaN()
	}
	return v
}

// hms reads "h:m:s" (sign allowed) into seconds.
func hms(s string) float64 {
	s = strings.TrimSpace(s)
	if s == "" {
		return math.NaN()
	}
	sign := 1.0
	if s[0] == '-' {
		sign, s = -1, s[1:]
	} else if s[0] == '+' {
		s = s[1:]
	}
	p := strings.Split(s, ":")
	return sign * (num(p[0])*3600 + num(p[1])*60 + num(p[2]))
}

func logv(s string) float64 { // "9.4749n" = −10^(9.4749−10)
	neg := strings.HasSuffix(s, "n")
	v := math.Pow(10, num(strings.TrimSuffix(s, "n"))-10)
	if neg {
		return -v
	}
	return v
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
		return nil, err
	}
	return rows[1:], nil
}

// alias: the observation table's station names that the table of positions writes differently.
var alias = map[string]string{"Wanhallinna": "Abo (Wanhalinna)", "Paris (Coll. Le Grand)": "Paris (Coll. de Louis le Gd.)", "Paris (Royal Obs.)": "Paris (Royal Observatory)",
	"Colombes": "Colombe", "Abo": "Abo (the town)", "Vienna": "Vienna Observatory (old)", "Paris (Hôtel de Clugny)": "Hôtel de Clugny",
	"Paris (Collège)": "Paris (Coll. de Louis le Gd.)", "Paris (Coll. L. le Grand)": "Paris (Coll. de Louis le Gd.)", "St. Généviève": "Paris (St. Généviève)",
	"Luxemburg": "Paris (Luxemburg)", "Royal Observatory": "Paris (Royal Observatory)", "Spital Square": "London (Spital Square)", "Clerkenwell": "London (Clerkenwell)",
	"Savile House": "London (Savile House)", "London (Savil House)": "London (Savile House)", "London": "London (Middle Temple)", "London (Mid. Temple)": "London (Middle Temple)", "Hudson's Bay": "Hudson Bay", "San José": "St. José"}

type v3 [3]float64

func (a v3) sub(b v3) v3      { return v3{a[0] - b[0], a[1] - b[1], a[2] - b[2]} }
func (a v3) add(b v3) v3      { return v3{a[0] + b[0], a[1] + b[1], a[2] + b[2]} }
func (a v3) mul(k float64) v3 { return v3{a[0] * k, a[1] * k, a[2] * k} }
func (a v3) dot(b v3) float64 { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
func (a v3) norm() float64    { return math.Sqrt(a.dot(a)) }
func (a v3) cross(b v3) v3 {
	return v3{a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]}
}
func rot3(a float64, v v3) v3 {
	c, s := math.Cos(a), math.Sin(a)
	return v3{c*v[0] + s*v[1], -s*v[0] + c*v[1], v[2]}
}
func rot2(a float64, v v3) v3 {
	c, s := math.Cos(a), math.Sin(a)
	return v3{c*v[0] - s*v[2], v[1], s*v[0] + c*v[2]}
}

// toICRF turns a vector in the mean equator of date into ICRF (inverse IAU 1976 precession, Lieske et al. 1977).
func toICRF(tdbJD float64, v v3) v3 {
	T := (tdbJD - j2000) / 36525
	as := arcsec
	zeta := (2306.2181*T + 0.30188*T*T + 0.017998*T*T*T) * as
	z := (2306.2181*T + 1.09468*T*T + 0.018203*T*T*T) * as
	theta := (2004.3109*T - 0.42665*T*T - 0.041833*T*T*T) * as
	return rot3(zeta, rot2(-theta, rot3(z, v)))
}

// gmst (rad) at a UT Julian date (IAU 1982, Aoki et al. 1982).
func gmst(jd float64) float64 {
	d0 := math.Floor(jd-0.5) + 0.5
	T := (d0 - j2000) / 36525
	s := 24110.54841 + 8640184.812866*T + 0.093104*T*T - 6.2e-6*T*T*T + 1.00273790935*(jd-d0)*secDay
	return math.Mod(s, secDay) / secDay * 2 * math.Pi
}

type model struct{ eph *spk.File }

// sep is the apparent separation (″) of the centres of Venus and the Sun, minus the contact value, seen from station st at t
// (seconds after June 3, 12h UT), with the unit A (km).
func (m model) sep(ep epoch, st *Station, contact string, t, A float64) (float64, error) {
	jd := ep.jd0 + t/secDay
	tdb := func(lt float64) float64 { return (jd + ep.dt/secDay - j2000 - lt/secDay) * secDay }
	E, err := m.eph.Bary(spk.Earth, tdb(0))
	if err != nil {
		return 0, err
	}
	// observer
	th := gmst(jd) - st.Lon/secDay*2*math.Pi // west longitude in seconds of time
	o := v3{aEarth * st.RhoCos * math.Cos(th), aEarth * st.RhoCos * math.Sin(th), aEarth * st.RhoSin}
	O := v3(E).mul(A / AUkm).add(toICRF(jd, o))
	look := func(body int) (v3, float64, error) {
		lt := 0.0
		var P v3
		for i := 0; i < 3; i++ {
			p, err := m.eph.Bary(body, tdb(lt))
			if err != nil {
				return P, 0, err
			}
			P = v3(p).mul(A / AUkm)
			lt = P.sub(O).norm() / A * AUkm / C // light time with DE440's unit
		}
		d := P.sub(O)
		return d.mul(1 / d.norm()), d.norm() / A, nil
	}
	us, ds, err := look(spk.Sun)
	if err != nil {
		return 0, err
	}
	uv, dv, err := look(spk.Venus)
	if err != nil {
		return 0, err
	}
	s := math.Acos(math.Max(-1, math.Min(1, us.dot(uv)))) / arcsec
	want := sSun/ds + sVenus/dv
	if contact == "II" || contact == "III" {
		want = sSun/ds - sVenus/dv
	}
	return s - want, nil
}

// disc places the station on the Earth's disc as seen from the Sun at t: x towards the ecliptic east, y towards its north
// (equatorial radii); only for the drawing.
func (m model) disc(ep epoch, st *Station, t float64) (float64, float64, error) {
	jd := ep.jd0 + t/secDay
	tt := (jd + ep.dt/secDay - j2000) * secDay
	E, err := m.eph.Bary(spk.Earth, tt)
	if err != nil {
		return 0, 0, err
	}
	S, err := m.eph.Bary(spk.Sun, tt)
	if err != nil {
		return 0, 0, err
	}
	th := gmst(jd) - st.Lon/secDay*2*math.Pi
	o := toICRF(jd, v3{st.RhoCos * math.Cos(th), st.RhoCos * math.Sin(th), st.RhoSin})
	s := v3(S).sub(v3(E))
	s = s.mul(1 / s.norm())
	eps := 84381.406 * arcsec
	n := v3{0, -math.Sin(eps), math.Cos(eps)} // ecliptic pole in ICRF
	ex := n.cross(s)
	ex = ex.mul(1 / ex.norm())
	ey := s.cross(ex)
	return o.dot(ex), o.dot(ey), nil
}

// contactTime solves sep = 0 near t0 (secant method).
func (m model) contactTime(ep epoch, st *Station, contact string, t0, A float64) (float64, error) {
	t1, t2 := t0-60, t0+60
	f1, err := m.sep(ep, st, contact, t1, A)
	if err != nil {
		return 0, err
	}
	f2, err := m.sep(ep, st, contact, t2, A)
	if err != nil {
		return 0, err
	}
	for i := 0; i < 30 && math.Abs(t2-t1) > 1e-3; i++ {
		t3 := t2 - f2*(t2-t1)/(f2-f1)
		t1, f1 = t2, f2
		t2 = t3
		if f2, err = m.sep(ep, st, contact, t2, A); err != nil {
			return 0, err
		}
	}
	return t2, nil
}

// key names the offset a row takes: one per transit and contact.
func (r *Row) key() string { return r.Transit + " " + r.Contact }

// pred is the computed contact time at unit A, interpolated in 1/A.
func (r *Row) pred(A float64) float64 {
	x := (AUkm/A - 1) / (1/1.1 - 1)
	return r.C0 + (r.C1-r.C0)*x
}

// fitOffsets: for a unit A and a set of rows, the mean residual per contact and the residual sum of squares.
func fitOffsets(rows []*Row, A float64) (map[string]float64, float64) {
	sum, n := map[string]float64{}, map[string]float64{}
	for _, r := range rows {
		sum[r.key()] += r.GMT - r.pred(A)
		n[r.key()]++
	}
	off := map[string]float64{}
	for k := range sum {
		off[k] = sum[k] / n[k]
	}
	ss := 0.0
	for _, r := range rows {
		d := r.GMT - r.pred(A) - off[r.key()]
		ss += d * d
	}
	return off, ss
}

// bestA minimises the residual sum over A (golden section between 0.7 and 1.4 A_DE).
func bestA(rows []*Row) float64 {
	lo, hi := 0.7*AUkm, 1.4*AUkm
	g := (math.Sqrt(5) - 1) / 2
	a, b := hi-g*(hi-lo), lo+g*(hi-lo)
	_, fa := fitOffsets(rows, a)
	_, fb := fitOffsets(rows, b)
	for i := 0; i < 80; i++ {
		if fa < fb {
			hi, b, fb = b, a, fa
			a = hi - g*(hi-lo)
			_, fa = fitOffsets(rows, a)
		} else {
			lo, a, fa = a, b, fb
			b = lo + g*(hi-lo)
			_, fb = fitOffsets(rows, b)
		}
	}
	return (a + b) / 2
}

// Compute reads the transcriptions and DE440, checks them, computes every contact and fits the unit.
func Compute(root string) (*Result, error) {
	r := &Result{Stations: map[string]*Station{}, Fits: map[string]*Fit{}, Inputs: []string{Obs1761, Obs, Stations, V2012, DE440}}
	srows, err := readCSV(filepath.Join(root, Stations))
	if err != nil {
		return nil, err
	}
	for _, s := range srows {
		lat := num(s[2])
		if lat < 0 || strings.HasPrefix(s[2], "-") {
			lat -= num(s[3]) / 60
		} else {
			lat += num(s[3]) / 60
		}
		r.Stations[s[0]] = &Station{Name: s[0], Lat: lat, RhoSin: logv(s[4]), RhoCos: logv(s[5]), Lon: hms(s[6])}
	}
	eph, err := spk.Open(filepath.Join(root, DE440))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch moon-eclcraters downloads it)", err)
	}
	defer eph.Close()
	m := model{eph}
	for _, tr := range Transits {
		var rows []*Row
		if tr.Year == "2012" {
			rows, err = r.read2012(root, tr)
		} else {
			rows, err = r.readNewcomb(root, tr)
		}
		if err != nil {
			return nil, err
		}
		for _, row := range rows {
			if row.C0, err = m.contactTime(tr.Ep, row.St, row.Contact, row.GMT, AUkm); err != nil {
				return nil, err
			}
			if row.C1, err = m.contactTime(tr.Ep, row.St, row.Contact, row.C0, 1.1*AUkm); err != nil {
				return nil, err
			}
			if row.DX, row.DY, err = m.disc(tr.Ep, row.St, row.GMT); err != nil {
				return nil, err
			}
			row.Used = true
			if (row.Contact == "II" || row.Contact == "III") && row.Phase == "G" {
				row.Used, row.Why = false, "phase G"
			}
		}
		clip(rows)
		r.Fits[tr.Year] = fitSet(rows)
		r.Rows = append(r.Rows, rows...)
	}
	r.Fits["all"] = fitSet(r.Rows)
	return r, nil
}

// readNewcomb reads one of Newcomb's tables (1761, 1769).
func (r *Result) readNewcomb(root string, tr Transit) ([]*Row, error) {
	orows, err := readCSV(filepath.Join(root, tr.File))
	if err != nil {
		return nil, err
	}
	var out []*Row
	var station, observer string
	tab := math.NaN()
	for i, o := range orows {
		if o[1] != "Do." {
			station = o[1] // a new station keeps the tabular time above unless it prints its own (Newcomb's Paris lines, 1761)
		}
		if o[2] != "do" {
			observer = o[2]
		}
		if o[5] != "" {
			tab = hms(o[5])
		}
		row := &Row{Transit: tr.Year, Ep: tr.Ep, Contact: o[0], Station: station, Observer: observer, LMT: hms(o[3]), GMT: hms(o[4]), Tab: tab, Resid: num(o[6]), Phase: o[7], Class: o[8], Telescope: o[9]}
		if math.IsNaN(row.GMT) {
			continue // a line with no time printed
		}
		if d := row.GMT - row.Tab; math.Abs(d-row.Resid) > 0.5 && !strings.Contains(o[11], "res") {
			r.Bad = append(r.Bad, fmt.Sprintf("%s line %d (%s %s): observed − tabular = %.0f s, printed %.0f", tr.Year, i+2, station, observer, d, row.Resid))
		}
		name := station
		if a, ok := alias[name]; ok {
			name = a
		}
		row.St = r.Stations[name]
		if row.St == nil {
			r.Bad = append(r.Bad, fmt.Sprintf("%s line %d: station %q not in the table of positions", tr.Year, i+2, station))
			continue
		}
		if !math.IsNaN(row.LMT) && station != "London" && o[11] != "lmt" { // local − Greenwich = −longitude (mod 24 h)
			d := math.Mod(row.LMT-row.GMT+row.St.Lon+2*secDay, secDay)
			if d > secDay/2 {
				d -= secDay
			}
			if math.Abs(d) > 1.5 {
				r.Bad = append(r.Bad, fmt.Sprintf("%s line %d (%s %s): local − Greenwich %+.0f s off the printed longitude", tr.Year, i+2, station, observer, d))
			}
		}
		out = append(out, row)
	}
	return out, nil
}

// read2012 reads the venus2012.de contact III file (semicolon separated, Latin-1).
func (r *Result) read2012(root string, tr Transit) ([]*Row, error) {
	b, err := os.ReadFile(filepath.Join(root, tr.File))
	if err != nil {
		return nil, err
	}
	u := make([]rune, len(b)) // Latin-1 -> UTF-8
	for i, c := range b {
		u[i] = rune(c)
	}
	var out []*Row
	for i, line := range strings.Split(strings.ReplaceAll(string(u), "\r", ""), "\n") {
		f := strings.Split(line, ";")
		if i == 0 || len(f) < 6 {
			continue
		}
		lat, lon := num(f[3]), num(f[4])
		p := lat * d2r
		c := 1 / math.Sqrt(math.Cos(p)*math.Cos(p)+(1-wgsF)*(1-wgsF)*math.Sin(p)*math.Sin(p))
		key := fmt.Sprintf("2012 %s %.4f %.4f", f[2], lat, lon)
		st := r.Stations[key]
		if st == nil {
			st = &Station{Name: f[2], Lat: lat, RhoSin: (1 - wgsF) * (1 - wgsF) * c * math.Sin(p), RhoCos: c * math.Cos(p), Lon: -lon / 15 * 3600}
			r.Stations[key] = st
		}
		contact := strings.TrimSpace(strings.TrimPrefix(f[0], "Contact "))
		contact = map[string]string{"1": "I", "2": "II", "3": "III", "4": "IV"}[contact]
		out = append(out, &Row{Transit: tr.Year, Ep: tr.Ep, Contact: contact, Station: f[2], Observer: f[1], LMT: math.NaN(), GMT: hms(f[5]), Tab: math.NaN(), Resid: math.NaN(), St: st})
	}
	return out, nil
}

// clip leaves out, one at a time, the timing farthest from the fit of the others when it lies beyond 3σ of them (leave-one-out).
func clip(rows []*Row) {
	for {
		used := usedOf(rows)
		if len(used) < 6 {
			return
		}
		A := bestA(used)
		off, _ := fitOffsets(used, A)
		var worst *Row
		wd := 0.0
		for _, row := range used {
			if d := math.Abs(row.GMT - row.pred(A) - off[row.key()]); d > wd {
				wd, worst = d, row
			}
		}
		worst.Used = false
		rest := usedOf(rows)
		A2 := bestA(rest)
		off2, ss2 := fitOffsets(rest, A2)
		s2 := math.Sqrt(ss2 / float64(len(rest)-len(off2)-1))
		if d := worst.GMT - worst.pred(A2) - off2[worst.key()]; math.Abs(d) > sigClip*s2 {
			worst.Why = fmt.Sprintf("%.0f s from the fit of the others (> 3σ = %.0f s)", d, sigClip*s2)
			continue
		}
		worst.Used = true
		return
	}
}

// fitSet fits the unit on the used rows of a set, and bootstraps it over stations.
func fitSet(rows []*Row) *Fit {
	used := usedOf(rows)
	A := bestA(used)
	off, ss := fitOffsets(used, A)
	f := &Fit{A: A, Off: off, N: len(rows), Used: len(used), RMS: math.Sqrt(ss / float64(len(used)-len(off)-1))}
	byStation := map[string][]*Row{}
	names := []string{}
	for _, row := range used {
		k := row.Transit + " " + row.St.Name
		if _, ok := byStation[k]; !ok {
			names = append(names, k)
		}
		byStation[k] = append(byStation[k], row)
	}
	sort.Strings(names)
	rng := rand.New(rand.NewSource(1769))
	for b := 0; b < nBoot; b++ {
		var sample []*Row
		for range names {
			sample = append(sample, byStation[names[rng.Intn(len(names))]]...)
		}
		f.Boot = append(f.Boot, bestA(sample))
	}
	sort.Float64s(f.Boot)
	f.SA = (f.Boot[int(0.84*nBoot)] - f.Boot[int(0.16*nBoot)]) / 2
	return f
}

func usedOf(rows []*Row) []*Row {
	var u []*Row
	for _, row := range rows {
		if row.Used {
			u = append(u, row)
		}
	}
	return u
}

func (r *Result) used() []*Row { return usedOf(r.Rows) }

// Summary is the build's one-line report.
func (r *Result) Summary() string {
	var b []string
	for _, k := range []string{"1761", "1769", "2012", "all"} {
		f := r.Fits[k]
		b = append(b, fmt.Sprintf("%s %.2f ± %.2f M km (%d/%d, rms %.0f s)", k, f.A/1e6, f.SA/1e6, f.Used, f.N, f.RMS))
	}
	return "transits of Venus: " + strings.Join(b, "; ")
}

// File writes the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	R := func(x float64, n int) float64 { return pyjson.Round(x, n) }
	hm := func(s float64) string {
		s = math.Mod(s+secDay*10, secDay)
		return fmt.Sprintf("%02d:%02d:%02d", int(s/3600), int(math.Mod(s, 3600)/60), int(math.Mod(s, 60)+0.5))
	}
	b.WriteString("// Contact timings (Newcomb 1891 for 1761 and 1769, venus2012.de for 2012): [contact, station, observer, GMT observed (Newcomb's\n")
	b.WriteString("// astronomical day for 1761 and 1769, UT of June 6 for 2012), latitude deg, east longitude deg, phase, class, observed − computed at\n")
	b.WriteString("// the transit's fitted unit minus its contact offset (s), computed at A_DE minus computed at 1.1·A_DE (s), used (1/0), why left out,\n")
	b.WriteString("// P = the whole parallax effect at A_DE (s), D = observed minus computed with the Sun infinitely far, minus the offset (s): D = P·A_DE/A\n")
	b.WriteString("// on a distant Sun; station on the Earth's disc seen from the Sun, x east and y north of the ecliptic (equatorial radii), transit]\n")
	b.WriteString("export const TRANSIT_ROWS = [\n")
	for _, row := range r.Rows {
		u := 0
		if row.Used {
			u = 1
		}
		f := r.Fits[row.Transit]
		res := row.GMT - row.pred(f.A) - f.Off[row.key()]
		cInf := row.C0 + 11*(row.C1-row.C0) // 1/A -> 0 in the linear interpolation: x = (A_DE/A − 1)/(1/1.1 − 1) -> 11
		b.WriteString(" " + pyjson.Dumps([]any{row.Contact, row.St.Name, row.Observer, hm(row.GMT), R(row.St.Lat, 3), R(-row.St.Lon/240, 3), row.Phase, row.Class,
			R(res, 1), R(row.C0-row.C1, 1), u, row.Why, R(row.C0-cInf, 1), R(row.GMT-cInf-f.Off[row.key()], 1), R(row.DX, 3), R(row.DY, 3), row.Transit}, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	fitObj := func(f *Fit) pyjson.Obj {
		keys := []string{}
		for k := range f.Off {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		off := pyjson.Obj{}
		for _, k := range keys {
			off = append(off, pyjson.KV{K: k, V: R(f.Off[k], 1)})
		}
		return pyjson.Obj{{K: "a", V: R(f.A, 0)}, {K: "sa", V: R(f.SA, 0)}, {K: "parallax", V: R(aEarth/f.A/arcsec, 4)}, {K: "rms", V: R(f.RMS, 1)},
			{K: "off", V: off}, {K: "n", V: f.N}, {K: "used", V: f.Used}, {K: "aEarth", V: aEarth}}
	}
	b.WriteString(fmt.Sprintf("// per transit and for the three together: the fitted unit (km), its error from %d bootstrap draws over stations (half the 16-84 %%\n// range), solar parallax (″), rms (s), offsets per contact (s), timings and timings used\n", nBoot))
	b.WriteString("export const TRANSIT_FITS = " + pyjson.Dumps(pyjson.Obj{{K: "1761", V: fitObj(r.Fits["1761"])}, {K: "1769", V: fitObj(r.Fits["1769"])},
		{K: "2012", V: fitObj(r.Fits["2012"])}, {K: "all", V: fitObj(r.Fits["all"])}}, pyjson.Compact) + ";\n")
	b.WriteString("export const TRANSIT_FIT = TRANSIT_FITS[\"1769\"];\n")
	return preset.File{
		Out: Out, Command: "build orb-transit",
		Inputs: r.Inputs,
		Notes: []string{"Transits of Venus, 1761 and 1769 (Newcomb's tabular summary, Astronomical Papers II part V, 1891, our transcription) and 2012",
			"(venus2012.de, contact III), each contact computed again with JPL DE440 for a trial unit; go doc -all ./internal/build/orbtransit."},
		Body: b.String(),
	}
}
