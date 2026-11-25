// Package eclcrater re-reduces the visual crater timings of 94 lunar eclipses (Herald & Sinnott, Catalogue of Lunar
// Eclipse Crater Timings, 1842-2011, VizieR VI/140) into the angular radius σ of the Earth's shadow at the Moon, seen
// from the Earth's centre, at every timing, and from it the SHAPE of the shadow and, through Aristarchus' relation,
// the radius of the body that casts it (moon tab, 2026-10-28).
//
// An eclipse is the same for every observer: the instant at which the umbra's edge crosses a crater does not depend on
// where it was watched from. A timing therefore puts one point on the edge of the shadow. We place it with directions
// only:
//
//   - the instant at the Moon is the observed UT minus the light time from the Moon (1.3 s), converted to TDB with
//     ΔT (Espenak & Meeus polynomials, NASA Five Millennium Canon, 2006);
//   - the crater is placed on the Moon from its selenographic latitude and longitude (IAU Gazetteer of Planetary
//     Nomenclature, mean-Earth frame) and the Moon's orientation (IAU WGCCRE model, Archinal et al. 2011, Celest.
//     Mech. Dyn. Astr. 109:101, Table 2), on a sphere of 1737.4 km;
//   - the shadow's axis is the line from the Sun through the Earth's centre at the instant the light that reaches the
//     Moon passed the Earth (Moon time minus the light time Earth-Moon: in 1.3 s the Earth moves 40 km, 20″ at the
//     Moon), the Sun taken one light time earlier still;
//   - Sun, Earth and Moon from JPL DE440 (Park et al. 2021, package spk).
//
// σ is the angle, at the Earth's centre, between the anti-Sun axis and the crater. The Moon's distance in km and its
// radius in km enter only as their ratio, the Moon's angular size: σ is an angle made of angles. The limb contacts
// (events 0, 4, 5, 9) give σ from the Moon's centre: the shadow touches the limb from outside (first and fourth
// contact, σ = d − s☾) or from inside (second and third, σ = d + s☾).
//
// Shape (measure). The latitude β of the point on the shadow is counted from the projection of the Earth's pole of
// date (precession, Lieske et al. 1977, A&A 58:1) on the plane across the axis. Each timing's σ is divided by the median
// σ of its eclipse (no radius enters), and the ratio is studied against β. A sphere casts a round shadow (an
// oblate Earth: ~0.3 % smaller across the poles). A flat disc with the Earth's axis as normal, lit from the
// direction of the Sun, casts an ellipse whose polar semi-axis is |sin δ☉| of the equatorial one (δ☉ the Sun's
// declination); steel-manned with its best radius for each eclipse, it is fitted to the same points.
//
// Radius (check). Aristarchus: σ = π☾ + π☉ − s☉ for a solid ball without air, π = R/D the parallaxes, s☉ the Sun's
// angular radius. Solving with the DE440 distances gives R_s = (σ + s☉)/(1/D☾ + 1/D☉), the radius of whatever casts
// the edge of the umbra: the Earth plus the lowest, opaque layer of its air. The catalogue kept only timings whose
// layer height, computed by its authors from the Earth's radius, lies between −50 and +250 km: a selection that
// touched the radius, and the reason this part is a check.
package eclcrater

import (
	"archive/zip"
	"bufio"
	"encoding/binary"
	"fmt"
	"io"
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

// Raw inputs, relative to the repository root.
const (
	RawDir    = "data/moon/eclcraters/raw"
	Catalogue = RawDir + "/crater_t.dat"
	Gazetteer = RawDir + "/MOON_nomenclature_center_pts.zip"
	DE440     = RawDir + "/de440.bsp"
	Out       = "src/data/presets/moon-eclcraters.js"
)

const (
	d2r      = math.Pi / 180
	arcmin   = math.Pi / 180 / 60
	cKmS     = 299792.458
	rMoonKm  = 1737.4   // IAU mean radius of the Moon (Archinal et al. 2011)
	rSunKm   = 695700.0 // IAU 2015 nominal solar radius (Prša et al. 2016, AJ 152:41)
	rEqKm    = 6378.137 // only for the geometric umbra the enlargement is counted from (check, never in σ)
	flatten  = 1 / 298.257223563
	j2000JD  = 2451545.0
	secDay   = 86400.0
	minPerEc = 20 // eclipses with fewer usable timings are left out of the per-eclipse statistics
)

// Timing is one line of the catalogue, reduced.
type Timing struct {
	Ecl     int // index in Eclipses
	Feature string
	Ev      int
	JDUT    float64
	Nobs    int
	Herald  struct {
		Height, ULat int
		Uenl         float64
	}
	Sigma   float64 // rad, from the Earth's centre
	Beta    float64 // rad, latitude on the shadow (north = towards the Earth's pole of date)
	Ratio   float64 // Sigma / median Sigma of its eclipse
	Enl     float64 // Sigma / geometric umbra (oblate Earth, no air) − 1 (check)
	Outlier bool
}

// Eclipse sums one eclipse.
type Eclipse struct {
	Y, M, D   int
	N         int
	Median    float64 // σ, rad
	DecSun    float64 // rad
	SunSd     float64 // rad, mean over the timings
	MoonDist  float64 // km, mean
	SunDist   float64 // km, mean
	Rs        float64 // km, radius of the occulting body from the median σ
	Enl       float64 // median enlargement over the geometric umbra (check)
	DiscScat  float64 // rms of the ratio around the best flat disc
	BallScat  float64 // rms of the ratio around a round shadow
	DiscRatio float64 // |sin δ☉|: the disc's predicted polar/equatorial axis ratio
	E         float64 // fitted flattening of the shadow: ratio = 1 − E sin²β (+ const), E ± ESig
	ESig      float64
}

// Result is the whole reduction.
type Result struct {
	Timings    []Timing
	Eclipses   []Eclipse
	Unmatched  map[string]int // feature names not found in the Gazetteer
	Used       int
	Limb       int
	Skipped    map[string]int
	BinBeta    []float64 // centres, deg
	BinRatio   []float64
	BinSig     []float64
	BinN       []int
	E, ESig    float64 // global flattening of the shadow
	Rs, RsSig  float64 // km
	Enl        float64 // median enlargement (check)
	HeraldCorr float64 // correlation of our enlargement with the catalogue's
	HeraldRMS  float64 // rms difference, percent
}

// ---- time --------------------------------------------------------------------------------------------------------

func jdFromUT(y, m, d, hh, mm, ss int) float64 {
	if m <= 2 {
		y--
		m += 12
	}
	a := y / 100
	b := 2 - a + a/4
	return math.Floor(365.25*float64(y+4716)) + math.Floor(30.6001*float64(m+1)) + float64(d+b) - 1524.5 +
		(float64(hh)+float64(mm)/60+float64(ss)/3600)/24
}

// deltaT (TT − UT, s): Espenak & Meeus, "Polynomial expressions for Delta T", NASA Five Millennium Canon of Solar
// Eclipses (NASA/TP-2006-214141), for 1800-2050.
func deltaT(year float64) float64 {
	switch {
	case year < 1860:
		t := year - 1860
		return 13.72 - 0.332447*t + 0.0068612*t*t + 0.0041116*t*t*t - 0.00037436*math.Pow(t, 4) +
			0.0000121272*math.Pow(t, 5) - 0.0000001699*math.Pow(t, 6) + 0.000000000875*math.Pow(t, 7)
	case year < 1900:
		t := year - 1860
		return 7.62 + 0.5737*t - 0.251754*t*t + 0.01680668*t*t*t - 0.0004473624*math.Pow(t, 4) + math.Pow(t, 5)/233174
	case year < 1920:
		t := year - 1900
		return -2.79 + 1.494119*t - 0.0598939*t*t + 0.0061966*t*t*t - 0.000197*math.Pow(t, 4)
	case year < 1941:
		t := year - 1920
		return 21.20 + 0.84493*t - 0.076100*t*t + 0.0020936*t*t*t
	case year < 1961:
		t := year - 1950
		return 29.07 + 0.407*t - t*t/233 + t*t*t/2547
	case year < 1986:
		t := year - 1975
		return 45.45 + 1.067*t - t*t/260 - t*t*t/718
	case year < 2005:
		t := year - 2000
		return 63.86 + 0.3345*t - 0.060374*t*t + 0.0017275*t*t*t + 0.000651814*math.Pow(t, 4) + 0.00002373599*math.Pow(t, 5)
	}
	t := year - 2000
	return 62.92 + 0.32217*t + 0.005589*t*t
}

// ---- vectors -----------------------------------------------------------------------------------------------------

type v3 = [3]float64

func sub(a, b v3) v3         { return v3{a[0] - b[0], a[1] - b[1], a[2] - b[2]} }
func add(a, b v3) v3         { return v3{a[0] + b[0], a[1] + b[1], a[2] + b[2]} }
func scl(a v3, k float64) v3 { return v3{a[0] * k, a[1] * k, a[2] * k} }
func dot(a, b v3) float64    { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
func norm3(a v3) float64     { return math.Sqrt(dot(a, a)) }
func unit(a v3) v3           { return scl(a, 1/norm3(a)) }
func cross(a, b v3) v3 {
	return v3{a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]}
}
func angle(a, b v3) float64 { return math.Atan2(norm3(cross(a, b)), dot(a, b)) }

type m3 [3][3]float64

func (m m3) mul(v v3) v3 {
	return v3{m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2], m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2], m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2]}
}
func (m m3) t() m3 {
	var r m3
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			r[i][j] = m[j][i]
		}
	}
	return r
}
func (m m3) dot(n m3) m3 {
	var r m3
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			for k := 0; k < 3; k++ {
				r[i][j] += m[i][k] * n[k][j]
			}
		}
	}
	return r
}

// frame rotations (the coordinate frame turns by a): R1, R2, R3 of the astronomical literature
func r1(a float64) m3 { c, s := math.Cos(a), math.Sin(a); return m3{{1, 0, 0}, {0, c, s}, {0, -s, c}} }
func r2(a float64) m3 { c, s := math.Cos(a), math.Sin(a); return m3{{c, 0, -s}, {0, 1, 0}, {s, 0, c}} }
func r3(a float64) m3 { c, s := math.Cos(a), math.Sin(a); return m3{{c, s, 0}, {-s, c, 0}, {0, 0, 1}} }

// poleOfDate is the Earth's mean pole of date in ICRF coordinates (IAU 1976 precession, Lieske et al. 1977).
func poleOfDate(tdbJD float64) v3 {
	T := (tdbJD - j2000JD) / 36525
	as := d2r / 3600
	zeta := (2306.2181*T + 0.30188*T*T + 0.017998*T*T*T) * as
	z := (2306.2181*T + 1.09468*T*T + 0.018203*T*T*T) * as
	theta := (2004.3109*T - 0.42665*T*T - 0.041833*T*T*T) * as
	P := r3(-z).dot(r2(theta)).dot(r3(-zeta)) // J2000 -> mean of date
	return P.t().mul(v3{0, 0, 1})
}

// moonToICRF turns mean-Earth selenographic vectors into ICRF ones (IAU WGCCRE 2009 model of the Moon's orientation,
// Archinal et al. 2011, Table 2; ~150 m from the mean-Earth frame, 0.1″ at the Moon's distance).
func moonToICRF(tdbJD float64) m3 {
	d := tdbJD - j2000JD
	T := d / 36525
	E := func(a, b float64) float64 { return (a + b*d) * d2r }
	E1, E2, E3, E4 := E(125.045, -0.0529921), E(250.089, -0.1059842), E(260.008, 13.0120009), E(176.625, 13.3407154)
	E5, E6, E7, E8 := E(357.529, 0.9856003), E(311.589, 26.4057084), E(134.963, 13.0649930), E(276.617, 0.3287146)
	E9, E10, E11, E12, E13 := E(34.226, 1.7484877), E(15.134, -0.1589763), E(119.743, 0.0036096), E(239.961, 0.1643573), E(25.053, 12.9590088)
	s, c := math.Sin, math.Cos
	a0 := 269.9949 + 0.0031*T - 3.8787*s(E1) - 0.1204*s(E2) + 0.0700*s(E3) - 0.0172*s(E4) + 0.0072*s(E6) - 0.0052*s(E10) + 0.0043*s(E13)
	d0 := 66.5392 + 0.0130*T + 1.5419*c(E1) + 0.0239*c(E2) - 0.0278*c(E3) + 0.0068*c(E4) - 0.0029*c(E6) + 0.0009*c(E7) + 0.0008*c(E10) - 0.0009*c(E13)
	W := 38.3213 + 13.17635815*d - 1.4e-12*d*d + 3.5610*s(E1) + 0.1208*s(E2) - 0.0642*s(E3) + 0.0158*s(E4) + 0.0252*s(E5) -
		0.0066*s(E6) - 0.0047*s(E7) - 0.0046*s(E8) + 0.0028*s(E9) + 0.0052*s(E10) + 0.0040*s(E11) + 0.0019*s(E12) - 0.0044*s(E13)
	M := r3(W * d2r).dot(r1((90 - d0) * d2r)).dot(r3((90 + a0) * d2r)) // ICRF -> body-fixed
	return M.t()
}

// ---- inputs ------------------------------------------------------------------------------------------------------

type feature struct{ lat, lon float64 }

// fold drops diacritics and case: the catalogue writes "Mosting", the Gazetteer "Mösting".
func fold(s string) string {
	plain := strings.NewReplacer("ä", "a", "à", "a", "á", "a", "â", "a", "å", "a", "ã", "a", "é", "e", "è", "e", "ê", "e", "ë", "e",
		"í", "i", "ì", "i", "î", "i", "ï", "i", "ó", "o", "ò", "o", "ô", "o", "ö", "o", "õ", "o", "ø", "o", "ú", "u", "ù", "u",
		"û", "u", "ü", "u", "ý", "y", "ç", "c", "ñ", "n", "š", "s", "ž", "z", "č", "c", "ř", "r", "ě", "e", "ł", "l")
	return strings.Join(strings.Fields(plain.Replace(strings.ToLower(s))), " ")
}

// readGazetteer reads the DBF of the IAU Gazetteer shapefile (dBASE III: header, 32-byte field descriptors, fixed
// records) inside its zip, keeping name -> (center_lat, center_lon east).
func readGazetteer(path string) (map[string]feature, error) {
	zr, err := zip.OpenReader(path)
	if err != nil {
		return nil, err
	}
	defer zr.Close()
	var rc io.ReadCloser
	for _, f := range zr.File {
		if strings.HasSuffix(strings.ToLower(f.Name), ".dbf") {
			if rc, err = f.Open(); err != nil {
				return nil, err
			}
			break
		}
	}
	if rc == nil {
		return nil, fmt.Errorf("%s: no .dbf inside", path)
	}
	defer rc.Close()
	b, err := io.ReadAll(rc)
	if err != nil {
		return nil, err
	}
	le := binary.LittleEndian
	n, hl, rl := int(le.Uint32(b[4:])), int(le.Uint16(b[8:])), int(le.Uint16(b[10:]))
	type fld struct {
		name    string
		off, ln int
	}
	var fl []fld
	off := 1
	for p := 32; b[p] != 0x0d; p += 32 {
		nm := strings.TrimRight(string(b[p:p+11]), "\x00")
		ln := int(b[p+16])
		fl = append(fl, fld{nm, off, ln})
		off += ln
	}
	get := func(rec []byte, name string) string {
		for _, f := range fl {
			if f.name == name {
				return strings.TrimSpace(string(rec[f.off : f.off+f.ln]))
			}
		}
		return ""
	}
	out := map[string]feature{}
	for i := 0; i < n; i++ {
		rec := b[hl+i*rl : hl+(i+1)*rl]
		if rec[0] == '*' { // deleted
			continue
		}
		lat, e1 := strconv.ParseFloat(get(rec, "center_lat"), 64)
		lon, e2 := strconv.ParseFloat(get(rec, "center_lon"), 64)
		if e1 != nil || e2 != nil {
			continue
		}
		for _, k := range []string{get(rec, "name"), get(rec, "clean_name")} {
			if k != "" {
				out[fold(k)] = feature{lat, lon}
			}
		}
	}
	return out, nil
}

// alias maps a catalogue name to the Gazetteer's.
func alias(name string) string {
	f := fold(name)
	if strings.HasPrefix(f, "prom. ") {
		return "promontorium " + f[6:]
	}
	return f
}

// ---- reduction ---------------------------------------------------------------------------------------------------

type geom struct {
	E, S, M v3 // barycentric Earth (at the shadow-casting instant), Sun (one light time earlier), Moon (at the Moon time)
	tdbJD   float64
}

func at(eph *spk.File, jdUT float64) (geom, error) {
	year := 2000 + (jdUT-j2000JD)/365.25
	tdb := jdUT + deltaT(year)/secDay
	// the Moon time: one light time before the observation (geocentric observer)
	tm := tdb
	var g geom
	for it := 0; it < 3; it++ {
		m, err := eph.Bary(spk.Moon, (tm-j2000JD)*secDay)
		if err != nil {
			return g, err
		}
		e, err := eph.Bary(spk.Earth, (tdb-j2000JD)*secDay)
		if err != nil {
			return g, err
		}
		tm = tdb - norm3(sub(m, e))/cKmS/secDay
		g.M = m
	}
	m, _ := eph.Bary(spk.Moon, (tm-j2000JD)*secDay)
	g.M = m
	// the light that makes the shadow at the Moon passed the Earth one light time earlier still
	te := tm
	for it := 0; it < 3; it++ {
		e, err := eph.Bary(spk.Earth, (te-j2000JD)*secDay)
		if err != nil {
			return g, err
		}
		te = tm - norm3(sub(g.M, e))/cKmS/secDay
		g.E = e
	}
	ts := te
	for it := 0; it < 3; it++ {
		s, err := eph.Bary(spk.Sun, (ts-j2000JD)*secDay)
		if err != nil {
			return g, err
		}
		ts = te - norm3(sub(g.E, s))/cKmS/secDay
		g.S = s
	}
	g.tdbJD = tm
	return g, nil
}

// Compute reads the catalogue, the Gazetteer and DE440 and reduces every timing.
func Compute(root string) (*Result, error) {
	gaz, err := readGazetteer(filepath.Join(root, Gazetteer))
	if err != nil {
		return nil, err
	}
	eph, err := spk.Open(filepath.Join(root, DE440))
	if err != nil {
		return nil, err
	}
	defer eph.Close()
	f, err := os.Open(filepath.Join(root, Catalogue))
	if err != nil {
		return nil, err
	}
	defer f.Close()

	r := &Result{Unmatched: map[string]int{}, Skipped: map[string]int{}}
	ecIdx := map[string]int{}
	sc := bufio.NewScanner(f)
	atoi := func(s string) int { v, _ := strconv.Atoi(strings.TrimSpace(s)); return v }
	for sc.Scan() {
		ln := sc.Text()
		if len(ln) < 59 {
			continue
		}
		y, mo, dy := atoi(ln[0:4]), atoi(ln[5:7]), atoi(ln[8:10])
		key := ln[0:10]
		ei, ok := ecIdx[key]
		if !ok {
			ei = len(r.Eclipses)
			ecIdx[key] = ei
			r.Eclipses = append(r.Eclipses, Eclipse{Y: y, M: mo, D: dy})
		}
		t := Timing{Ecl: ei, Feature: strings.TrimSpace(ln[11:31]), Ev: atoi(ln[31:32]), Nobs: atoi(ln[43:45])}
		t.Herald.Height, t.Herald.ULat = atoi(ln[46:50]), atoi(ln[51:54])
		t.Herald.Uenl, _ = strconv.ParseFloat(strings.TrimSpace(ln[55:59]), 64)
		day := 0.0
		switch ln[33] {
		case 'p':
			day = -1
		case 'f':
			day = 1
		}
		t.JDUT = jdFromUT(y, mo, dy, atoi(ln[34:36]), atoi(ln[37:39]), atoi(ln[40:42])) + day
		limb := t.Ev == 0 || t.Ev == 4 || t.Ev == 5 || t.Ev == 9
		if !limb && t.Ev != 2 && t.Ev != 7 {
			r.Skipped["edge of a feature (events 1, 3, 6, 8): the crater's centre is not on the shadow"]++
			continue
		}
		var feat feature
		if !limb {
			if feat, ok = gaz[alias(t.Feature)]; !ok {
				r.Unmatched[t.Feature]++
				continue
			}
		}
		g, err := at(eph, t.JDUT)
		if err != nil {
			return nil, fmt.Errorf("%s %s: %w", key, t.Feature, err)
		}
		u := unit(sub(g.E, g.S)) // the anti-Sun axis
		mc := sub(g.M, g.E)
		if limb {
			sMoon := math.Asin(rMoonKm / norm3(mc))
			d := angle(mc, u)
			if t.Ev == 0 || t.Ev == 9 {
				t.Sigma = d - sMoon
			} else {
				t.Sigma = d + sMoon
			}
			t.Beta = latOnShadow(mc, u, poleOfDate(g.tdbJD))
			r.Limb++
		} else {
			la, lo := feat.lat*d2r, feat.lon*d2r
			bf := v3{rMoonKm * math.Cos(la) * math.Cos(lo), rMoonKm * math.Cos(la) * math.Sin(lo), rMoonKm * math.Sin(la)}
			p := add(g.M, moonToICRF(g.tdbJD).mul(bf))
			if dot(sub(p, g.M), sub(g.E, g.M)) <= 0 {
				r.Skipped["feature on the far side at that instant (misidentified)"]++
				continue
			}
			w := sub(p, g.E)
			t.Sigma = angle(w, u)
			t.Beta = latOnShadow(w, u, poleOfDate(g.tdbJD))
		}
		// geometric umbra of an airless oblate Earth (check only): σg = π☾ + π☉ − s☉, Earth radius at that latitude
		dS := norm3(sub(g.S, g.E))
		rho := rEqKm * (1 - flatten*math.Pow(math.Sin(t.Beta), 2))
		sg := math.Asin(rho/norm3(mc)) + math.Asin(rho/dS) - math.Asin(rSunKm/dS)
		t.Enl = t.Sigma/sg - 1
		ec := &r.Eclipses[ei]
		ec.N++
		ec.SunSd += math.Asin(rSunKm / dS)
		ec.MoonDist += norm3(mc)
		ec.SunDist += dS
		ec.DecSun += math.Asin(-dot(u, poleOfDate(g.tdbJD))) // the Sun's declination of date
		r.Timings = append(r.Timings, t)
	}
	if err := sc.Err(); err != nil {
		return nil, err
	}
	r.Used = len(r.Timings)
	r.finish(eph)
	return r, nil
}

// latOnShadow is the latitude of w around the axis u, north towards the projection of the pole p.
func latOnShadow(w, u, p v3) float64 {
	pn := unit(sub(p, scl(u, dot(p, u))))
	wp := sub(w, scl(u, dot(w, u)))
	return math.Asin(math.Max(-1, math.Min(1, dot(wp, pn)/norm3(wp))))
}

func median(x []float64) float64 {
	if len(x) == 0 {
		return math.NaN()
	}
	y := append([]float64(nil), x...)
	sort.Float64s(y)
	if len(y)%2 == 1 {
		return y[len(y)/2]
	}
	return (y[len(y)/2-1] + y[len(y)/2]) / 2
}

// fitFlat fits ratio = a (1 − E sin²β) by least squares in (a, aE); returns E and its standard error.
func fitFlat(beta, ratio []float64) (float64, float64, float64) {
	n := float64(len(beta))
	var sx, sy, sxx, sxy float64
	for i := range beta {
		x := math.Pow(math.Sin(beta[i]), 2)
		sx += x
		sy += ratio[i]
		sxx += x * x
		sxy += x * ratio[i]
	}
	den := n*sxx - sx*sx
	if den <= 0 || n < 3 {
		return math.NaN(), math.NaN(), math.NaN()
	}
	b := (n*sxy - sx*sy) / den
	a := (sy - b*sx) / n
	var rss float64
	for i := range beta {
		e := ratio[i] - a - b*math.Pow(math.Sin(beta[i]), 2)
		rss += e * e
	}
	sb := math.Sqrt(rss / (n - 2) * n / den)
	return -b / a, sb / a, math.Sqrt(rss / n)
}

func (r *Result) finish(eph *spk.File) {
	byE := make([][]int, len(r.Eclipses))
	for i, t := range r.Timings {
		byE[t.Ecl] = append(byE[t.Ecl], i)
	}
	// per eclipse: median σ, ratio, outliers (> 3 SD of the others, leave-one-out: the site's rule)
	var allB, allR []float64
	var rsList, enlList []float64
	for ei := range r.Eclipses {
		ec := &r.Eclipses[ei]
		ids := byE[ei]
		if len(ids) == 0 {
			continue
		}
		n := float64(ec.N)
		ec.SunSd /= n
		ec.MoonDist /= n
		ec.SunDist /= n
		ec.DecSun /= n
		sig := make([]float64, len(ids))
		for k, i := range ids {
			sig[k] = r.Timings[i].Sigma
		}
		ec.Median = median(sig)
		for _, i := range ids {
			r.Timings[i].Ratio = r.Timings[i].Sigma / ec.Median
		}
		// leave-one-out 3 SD on the ratio
		var s1, s2 float64
		for _, i := range ids {
			x := r.Timings[i].Ratio
			s1 += x
			s2 += x * x
		}
		for _, i := range ids {
			x := r.Timings[i].Ratio
			m := (s1 - x) / (n - 1)
			sd := math.Sqrt(math.Max(0, ((s2-x*x)-(n-1)*m*m)/(n-2)))
			if n > 3 && math.Abs(x-m) > 3*sd {
				r.Timings[i].Outlier = true
			}
		}
		var B, R, enl []float64
		for _, i := range ids {
			t := r.Timings[i]
			if t.Outlier {
				continue
			}
			B = append(B, t.Beta)
			R = append(R, t.Ratio)
			enl = append(enl, t.Enl)
		}
		ec.Enl = median(enl)
		// a round shadow: the ratio around 1; the best flat disc for this eclipse (free radius, the Earth's axis as
		// its normal): r(β) = ρ / sqrt(cos²β + sin²β/q²), q = |sin δ☉|
		var ball float64
		for _, x := range R {
			ball += (x - 1) * (x - 1)
		}
		ec.BallScat = math.Sqrt(ball / float64(len(R)))
		q := math.Abs(math.Sin(ec.DecSun))
		ec.DiscRatio = q
		shape := make([]float64, len(B))
		var num, den float64
		for k, b := range B {
			shape[k] = 1 / math.Sqrt(math.Pow(math.Cos(b), 2)+math.Pow(math.Sin(b), 2)/math.Max(q*q, 1e-6))
			num += shape[k] * R[k]
			den += shape[k] * shape[k]
		}
		rho := num / den
		var disc float64
		for k := range B {
			e := R[k] - rho*shape[k]
			disc += e * e
		}
		ec.DiscScat = math.Sqrt(disc / float64(len(R)))
		ec.E, ec.ESig, _ = fitFlat(B, R)
		// R_s = (σ + s☉) / (1/D☾ + 1/D☉)
		ec.Rs = (ec.Median + ec.SunSd) / (1/ec.MoonDist + 1/ec.SunDist)
		if len(R) >= minPerEc {
			allB = append(allB, B...)
			allR = append(allR, R...)
			rsList = append(rsList, ec.Rs)
			enlList = append(enlList, ec.Enl)
		}
	}
	r.E, r.ESig, _ = fitFlat(allB, allR)
	r.Rs = median(rsList)
	{ // spread of the eclipse values: standard error of the mean
		var m, s float64
		for _, x := range rsList {
			m += x
		}
		m /= float64(len(rsList))
		for _, x := range rsList {
			s += (x - m) * (x - m)
		}
		r.RsSig = math.Sqrt(s/float64(len(rsList)-1)) / math.Sqrt(float64(len(rsList)))
	}
	r.Enl = median(enlList)
	// bins of β, 10° wide
	for b := -85.0; b <= 85; b += 10 {
		var xs []float64
		for k := range allB {
			if allB[k]/d2r >= b-5 && allB[k]/d2r < b+5 {
				xs = append(xs, allR[k])
			}
		}
		if len(xs) < 5 {
			continue
		}
		var m, s float64
		for _, x := range xs {
			m += x
		}
		m /= float64(len(xs))
		for _, x := range xs {
			s += (x - m) * (x - m)
		}
		r.BinBeta = append(r.BinBeta, b)
		r.BinRatio = append(r.BinRatio, m)
		r.BinSig = append(r.BinSig, math.Sqrt(s/float64(len(xs)-1)/float64(len(xs))))
		r.BinN = append(r.BinN, len(xs))
	}
	// our enlargement against the catalogue's (validation of the reduction)
	var sx, sy, sxx, syy, sxy, d2 float64
	var n float64
	for _, t := range r.Timings {
		if t.Outlier {
			continue
		}
		x, y := t.Enl*100, t.Herald.Uenl
		sx += x
		sy += y
		sxx += x * x
		syy += y * y
		sxy += x * y
		d2 += (x - y) * (x - y)
		n++
	}
	r.HeraldCorr = (n*sxy - sx*sy) / math.Sqrt((n*sxx-sx*sx)*(n*syy-sy*sy))
	r.HeraldRMS = math.Sqrt(d2 / n)
}

// Summary is the one-line report of fog build.
func (r *Result) Summary() string {
	um := 0
	for _, v := range r.Unmatched {
		um += v
	}
	return fmt.Sprintf("%d timings reduced (%d limb contacts), %d unmatched names; shadow flattening %.4f ± %.4f; R_s %.0f ± %.0f km; enlargement %.2f %% (catalogue: r = %.3f, rms %.2f %%)",
		r.Used, r.Limb, um, r.E, r.ESig, r.Rs, r.RsSig, r.Enl*100, r.HeraldCorr, r.HeraldRMS)
}

// File writes the preset: per eclipse sums, β bins, and the timings (σ in arcmin, β in degrees) for the figures.
func (r *Result) File() preset.File {
	ecl := []any{}
	for _, e := range r.Eclipses {
		if e.N == 0 {
			continue
		}
		ecl = append(ecl, pyjson.Obj{
			{K: "d", V: fmt.Sprintf("%04d-%02d-%02d", e.Y, e.M, e.D)}, {K: "n", V: e.N},
			{K: "sigma", V: pyjson.Round(e.Median/arcmin, 3)}, {K: "dec", V: pyjson.Round(e.DecSun/d2r, 2)},
			{K: "rs", V: pyjson.Round(e.Rs, 0)}, {K: "enl", V: pyjson.Round(e.Enl*100, 2)},
			{K: "ball", V: pyjson.Round(e.BallScat*100, 3)}, {K: "disc", V: pyjson.Round(e.DiscScat*100, 3)},
			{K: "q", V: pyjson.Round(e.DiscRatio, 3)}, {K: "E", V: pyjson.Round(e.E, 4)}, {K: "Esig", V: pyjson.Round(e.ESig, 4)},
		})
	}
	tim := []any{}
	for _, t := range r.Timings {
		ol := 0
		if t.Outlier {
			ol = 1
		}
		tim = append(tim, []any{t.Ecl, pyjson.Round(t.Beta/d2r, 1), pyjson.Round(t.Ratio, 4), pyjson.Round(t.Sigma/arcmin, 2), ol})
	}
	bins := []any{}
	for k := range r.BinBeta {
		bins = append(bins, []any{r.BinBeta[k], pyjson.Round(r.BinRatio[k], 5), pyjson.Round(r.BinSig[k], 5), r.BinN[k]})
	}
	obj := pyjson.Obj{
		{K: "used", V: r.Used}, {K: "limb", V: r.Limb}, {K: "eclipses", V: ecl}, {K: "bins", V: bins},
		{K: "E", V: pyjson.Round(r.E, 5)}, {K: "Esig", V: pyjson.Round(r.ESig, 5)},
		{K: "rs", V: pyjson.Round(r.Rs, 0)}, {K: "rsSig", V: pyjson.Round(r.RsSig, 0)}, {K: "enl", V: pyjson.Round(r.Enl*100, 2)},
		{K: "heraldCorr", V: pyjson.Round(r.HeraldCorr, 3)}, {K: "heraldRms", V: pyjson.Round(r.HeraldRMS, 2)},
	}
	var b strings.Builder
	b.WriteString("export const ECL_CRATERS = " + pyjson.Dumps(obj, pyjson.Indented(1)) + ";\n")
	b.WriteString("export const ECL_CRATERS_T = [\n")
	for _, row := range tim {
		b.WriteString(" " + pyjson.Dumps(row, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{
		Out:     Out,
		Command: "build moon-eclcraters",
		Inputs:  []string{Catalogue, Gazetteer, DE440},
		Notes: []string{
			"Lunar eclipse crater timings (Herald & Sinnott 2014, VizieR VI/140), reduced by fog: sigma = angular radius",
			"of the Earth's shadow at the Moon, from the Earth's centre (arcmin); beta = latitude on the shadow (deg);",
			"ratio = sigma / median sigma of its eclipse. timings: [eclipse index, beta, ratio, sigma, outlier].",
		},
		Body: b.String(),
	}
}
