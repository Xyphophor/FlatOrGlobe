package romer

import (
	"math"

	"flatorglobe/tools/internal/spk"
)

const (
	d2r     = math.Pi / 180
	j2000   = 2451545.0
	secDay  = 86400.0
	eps0    = 23.4392911 * d2r // obliquity of the ecliptic at J2000 (IAU 1976)
	ra0Jup  = 268.056595 * d2r // pole of Jupiter, ICRF, J2000 (Archinal et al. 2018)
	dec0Jup = 64.495303 * d2r
	mJup    = 1 / 1047.348644 // Jupiter system / Sun, a ratio of periods and angles (Kepler III)
	auDE    = 149597870.700   // km, the unit of DE440's lengths (IAU 2012 B2), used only to turn DE440 into AU
)

type v3 [3]float64

func (a v3) sub(b v3) v3      { return v3{a[0] - b[0], a[1] - b[1], a[2] - b[2]} }
func (a v3) dot(b v3) float64 { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
func (a v3) norm() float64    { return math.Sqrt(a.dot(a)) }
func (a v3) mul(k float64) v3 { return v3{a[0] * k, a[1] * k, a[2] * k} }
func (a v3) cross(b v3) v3 {
	return v3{a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]}
}

// DeltaT is TT − UT in seconds for a decimal year, from the polynomials of F. Espenak and J. Meeus, "Five Millennium
// Canon of Solar Eclipses: −1999 to +3000", NASA/TP-2006-214141 (2006), section 2.6, after L. V. Morrison and
// F. R. Stephenson (J. Hist. Astron. 35 (2004) 327) for the past: lunar occultations and eclipse records, no distance.
func DeltaT(y float64) float64 {
	switch {
	case y < 1700:
		t := y - 1600
		return 120 - 0.9808*t - 0.01532*t*t + t*t*t/7129
	case y < 1800:
		t := y - 1700
		return 8.83 + 0.1603*t - 0.0059285*t*t + 0.00013336*t*t*t - t*t*t*t/1174000
	case y < 1860:
		t := y - 1800
		return 13.72 - 0.332447*t + 0.0068612*t*t + 0.0041116*t*t*t - 0.00037436*math.Pow(t, 4) +
			0.0000121272*math.Pow(t, 5) - 0.0000001699*math.Pow(t, 6) + 0.000000000875*math.Pow(t, 7)
	case y < 1900:
		t := y - 1860
		return 7.62 + 0.5737*t - 0.251754*t*t + 0.01680668*t*t*t - 0.0004473624*math.Pow(t, 4) + math.Pow(t, 5)/233174
	case y < 1920:
		t := y - 1900
		return -2.79 + 1.494119*t - 0.0598939*t*t + 0.0061966*t*t*t - 0.000197*math.Pow(t, 4)
	case y < 1941:
		t := y - 1920
		return 21.20 + 0.84493*t - 0.076100*t*t + 0.0020936*t*t*t
	case y < 1961:
		t := y - 1950
		return 29.07 + 0.407*t - t*t/233 + t*t*t/2547
	case y < 1986:
		t := y - 1975
		return 45.45 + 1.067*t - t*t/260 - t*t*t/718
	}
	t := y - 2000
	return 63.86 + 0.3345*t - 0.060374*t*t + 0.0017275*t*t*t + 0.000651814*math.Pow(t, 4) + 0.00002373599*math.Pow(t, 5)
}

// elements: a (AU), e, I, L, ϖ, Ω (deg) at J2000 and their rates per Julian century; for Jupiter the extra terms b, c,
// s, f of the mean anomaly. E. M. Standish, "Keplerian Elements for Approximate Positions of the Major Planets"
// (JPL Solar System Dynamics, Table 2a, valid 3000 BC - AD 3000).
type elements struct {
	p0, rate   [6]float64
	b, c, s, f float64
}

var (
	elEMB = elements{
		p0:   [6]float64{1.00000018, 0.01673163, -0.00054346, 100.46691572, 102.93005885, -5.11260389},
		rate: [6]float64{-0.00000003, -0.00003661, -0.01337178, 35999.37306329, 0.31795260, -0.24123856},
	}
	elJup = elements{
		p0:   [6]float64{5.20248019, 0.04853590, 1.29861416, 34.33479152, 14.27495244, 100.29282654},
		rate: [6]float64{-0.00002864, 0.00018026, -0.00322699, 3034.90371757, 0.18199196, 0.13024619},
		b:    -0.00012452, c: 0.06064060, s: -0.35635438, f: 38.35125000,
	}
	// AJup is Jupiter's semi-major axis in astronomical units from Kepler's third law alone: the ratio of the two mean
	// motions (the Earth-Moon barycentre's and Jupiter's, i.e. of their periods) and Jupiter's mass in solar masses.
	// Standish's printed a (5.2025) is not used: no length enters.
	AJup = math.Pow(elEMB.rate[3]/elJup.rate[3], 2.0/3) * math.Cbrt(1+mJup)
)

// kepler returns the heliocentric position (AU, ecliptic and equinox J2000) and the mean anomaly (rad) at T Julian
// centuries of TT past J2000, the semi-major axis replaced by a.
func (el elements) kepler(T, a float64) (v3, float64) {
	var p [6]float64
	for i := range p {
		p[i] = el.p0[i] + el.rate[i]*T
	}
	e, I, L, w, O := p[1], p[2]*d2r, p[3], p[4], p[5]*d2r
	M := L - w + el.b*T*T + el.c*math.Cos(el.f*T*d2r) + el.s*math.Sin(el.f*T*d2r)
	M = math.Mod(M+180, 360)
	if M < 0 {
		M += 360
	}
	M = (M - 180) * d2r
	E := M + e*math.Sin(M)
	for k := 0; k < 12; k++ {
		E -= (E - e*math.Sin(E) - M) / (1 - e*math.Cos(E))
	}
	xp, yp := a*(math.Cos(E)-e), a*math.Sqrt(1-e*e)*math.Sin(E)
	om := w*d2r - O
	co, so, cO, sO, cI, sI := math.Cos(om), math.Sin(om), math.Cos(O), math.Sin(O), math.Cos(I), math.Sin(I)
	return v3{
		(co*cO-so*sO*cI)*xp + (-so*cO-co*sO*cI)*yp,
		(co*sO+so*cO*cI)*xp + (-so*sO+co*cO*cI)*yp,
		so*sI*xp + co*sI*yp,
	}, M
}

// icrfToEcl turns an ICRF (mean equator J2000) vector into the ecliptic of J2000.
func icrfToEcl(v v3) v3 {
	c, s := math.Cos(eps0), math.Sin(eps0)
	return v3{v[0], c*v[1] + s*v[2], -s*v[1] + c*v[2]}
}

// Jupiter's equatorial frame in ecliptic J2000 coordinates: z its pole, x the ascending node of its equator on the
// ecliptic. Io moves in Jupiter's equator (inclination 0.04°); the shadow's direction is read in this frame.
var xJ, yJ, zJ = func() (v3, v3, v3) {
	z := icrfToEcl(v3{math.Cos(dec0Jup) * math.Cos(ra0Jup), math.Cos(dec0Jup) * math.Sin(ra0Jup), math.Sin(dec0Jup)})
	x := v3{0, 0, 1}.cross(z)
	x = x.mul(1 / x.norm())
	return x, z.cross(x), z
}()

// orbits gives the heliocentric positions of the Earth and Jupiter in AU (ecliptic J2000) at a TT Julian date.
type orbits interface {
	earth(jdTT float64) v3
	jupiter(jdTT float64) v3
}

type keplerOrbits struct{}

func (keplerOrbits) earth(jd float64) v3 {
	r, _ := elEMB.kepler((jd-j2000)/36525, 1)
	return r
}
func (keplerOrbits) jupiter(jd float64) v3 {
	r, _ := elJup.kepler((jd-j2000)/36525, AJup)
	return r
}

// deOrbits reads JPL DE440 and divides its kilometres by its own unit: only the shape of the orbits is used.
type deOrbits struct{ f *spk.File }

func (d deOrbits) helio(body int, jd float64) v3 {
	t := (jd - j2000) * secDay
	b, err1 := d.f.Bary(body, t)
	s, err2 := d.f.Bary(spk.Sun, t)
	if err1 != nil || err2 != nil {
		return v3{math.NaN(), math.NaN(), math.NaN()}
	}
	return icrfToEcl(v3(b).sub(v3(s)).mul(1 / auDE))
}
func (d deOrbits) earth(jd float64) v3   { return d.helio(spk.Earth, jd) }
func (d deOrbits) jupiter(jd float64) v3 { return d.helio(spk.Jup, jd) }

// geo is the geometry of one eclipse.
type geo struct {
	te   float64 // TT Julian date of the event at Jupiter
	to   float64 // TT Julian date of the observation
	d    float64 // Earth-Jupiter distance at the light's departure and arrival, AU
	lon  float64 // longitude of the shadow's axis in Jupiter's equatorial frame, deg (continuous)
	dec  float64 // jovicentric declination of the Sun, rad (the shadow's offset from Io's orbit)
	rJ   float64 // Sun-Jupiter distance, AU
	mJ   float64 // Jupiter's mean anomaly (Standish), rad
	syn  float64 // heliocentric longitude Earth − Jupiter, rad: the phase of the synodic cycle (0 at opposition)
	elon float64 // elongation of Jupiter from the Sun seen from the Earth, deg
}

// geometry of an observation at UT Julian date jd, for a trial light time As (s per AU).
func geometry(o orbits, jd, As float64) geo {
	year := 2000 + (jd-j2000)/365.25
	to := jd + DeltaT(year)/secDay
	rE := o.earth(to)
	te := to
	var rJ v3
	var d float64
	for k := 0; k < 4; k++ {
		rJ = o.jupiter(te)
		d = rJ.sub(rE).norm()
		te = to - As*d/secDay
	}
	u := rJ.mul(1 / rJ.norm())
	g := geo{te: te, to: to, d: d, rJ: rJ.norm()}
	g.lon = math.Atan2(yJ.dot(u), xJ.dot(u)) / d2r
	g.dec = math.Asin(zJ.dot(u))
	_, g.mJ = elJup.kepler((te-j2000)/36525, AJup)
	g.syn = math.Atan2(rE[1], rE[0]) - math.Atan2(rJ[1], rJ[0])
	w := rJ.sub(rE)
	g.elon = math.Acos(rE.mul(-1).dot(w)/(rE.norm()*d)) / d2r
	return g
}

// halfArc is half the arc (deg of Io's longitude) that Io spends in the shadow, for a shadow of equatorial half-width
// a0 (deg seen from Jupiter's centre at Io's distance) flattened by Jupiter's 0.935, with the Sun at jovicentric
// declination dec: Io crosses the shadow off its centre by sin(dec) of its orbital radius.
func halfArc(dec, a0 float64) float64 {
	s0 := math.Sin(a0 * d2r)
	b := math.Sin(dec) / (s0 * 0.935)
	q := 1 - b*b
	if q < 0.2 {
		q = 0.2
	}
	return math.Asin(s0*math.Sqrt(q)) / d2r
}
