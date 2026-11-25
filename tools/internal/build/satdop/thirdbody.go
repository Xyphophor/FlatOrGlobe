package satdop

import "math"

// Third bodies. The Sun and the Moon pull on the satellites (and on the
// Earth); the difference, a few 10⁻⁶ m/s² at 20,000 km, moves a GPS
// satellite by kilometres in a day. Low-precision analytic positions
// (Montenbruck & Gill, Satellite Orbits, 2000, §3.3.2: Sun to ~0.1 %,
// Moon to a few arcminutes and ~500 km), J2000 ecliptic turned to the
// equator, then into the fit's inertial frame by the sidereal angle of
// the first station's meridian at 00:00 GPS time. Their effect is small;
// these rough positions are enough for it.

const (
	gmSun  = 1.32712440018e20 // m³/s² (IERS 2010 conventions)
	gmMoon = 4.9028e12
	jd0    = 2460775.5 - 18.0/86400 // 2025-04-10 00:00 GPS time, as UT (UT1 ≈ UTC)
	d2r    = math.Pi / 180
	as2r   = d2r / 3600
	epsJ   = 23.43929111 * d2r
)

// MoonScale multiplies the Moon's distance while GM/d³ is held (test of
// how much the distance in km matters: only through r/d, second order).
var MoonScale = 1.0

// frameAngle is the right ascension of the frame's x axis (first station's
// meridian at t = 0): GMST(t = 0) + its east longitude.
var frameAngle float64

// SetFrame fixes the frame's x axis from the first station's longitude
// (rad) and tabulates the Sun and the Moon every 15 s.
func SetFrame(lon0 float64) {
	d := jd0 - 2451545.0
	frameAngle = math.Mod(280.46061837+360.98564736629*d, 360)*d2r + lon0
	n := int(DaySec/tabStep) + 3
	sunTab, moonTab = make([][3]float64, n), make([][3]float64, n)
	for k := 0; k < n; k++ {
		t := float64(k-1) * tabStep
		sunTab[k], moonTab[k] = sunPos(t), moonPos(t)
		for i := range moonTab[k] {
			moonTab[k][i] *= MoonScale
		}
	}
}

const tabStep = 15.0

var sunTab, moonTab [][3]float64

// lerp reads a table (first entry at t = −15 s) at time t.
func lerp(tab [][3]float64, t float64) [3]float64 {
	x := t/tabStep + 1
	k := int(math.Floor(x))
	k = max(0, min(len(tab)-2, k))
	f := x - float64(k)
	a, b := tab[k], tab[k+1]
	return [3]float64{a[0] + f*(b[0]-a[0]), a[1] + f*(b[1]-a[1]), a[2] + f*(b[2]-a[2])}
}

func eclToFrame(lam, beta, r float64) [3]float64 {
	x := r * math.Cos(beta) * math.Cos(lam)
	y := r * math.Cos(beta) * math.Sin(lam)
	z := r * math.Sin(beta)
	e := [3]float64{x, y*math.Cos(epsJ) - z*math.Sin(epsJ), y*math.Sin(epsJ) + z*math.Cos(epsJ)}
	return rotz(e, -frameAngle)
}

// sunPos and moonPos: positions (m) at t seconds after 00:00 GPS time.
func sunPos(t float64) [3]float64 {
	T := (jd0 + t/86400 + 69.2/86400 - 2451545.0) / 36525
	M := (357.5256 + 35999.049*T) * d2r
	lam := 282.9400*d2r + M + (6892*math.Sin(M)+72*math.Sin(2*M))*as2r
	r := (149.619 - 2.499*math.Cos(M) - 0.021*math.Cos(2*M)) * 1e9
	return eclToFrame(lam, 0, r)
}

func moonPos(t float64) [3]float64 {
	T := (jd0 + t/86400 + 69.2/86400 - 2451545.0) / 36525
	L0 := (218.31617 + 481267.88088*T - 1.3972*T) * d2r
	l := (134.96292 + 477198.86753*T) * d2r
	lp := (357.52543 + 35999.04944*T) * d2r
	F := (93.27283 + 483202.01873*T) * d2r
	D := (297.85027 + 445267.11135*T) * d2r
	dl := 22640*math.Sin(l) + 769*math.Sin(2*l) - 4586*math.Sin(l-2*D) + 2370*math.Sin(2*D) - 668*math.Sin(lp) -
		412*math.Sin(2*F) - 212*math.Sin(2*l-2*D) - 206*math.Sin(l+lp-2*D) + 192*math.Sin(l+2*D) - 165*math.Sin(lp-2*D) +
		148*math.Sin(l-lp) - 125*math.Sin(D) - 110*math.Sin(l+lp) - 55*math.Sin(2*F-2*D)
	lam := L0 + dl*as2r
	b := 18520*math.Sin(F+lam-L0+(412*math.Sin(2*F)+541*math.Sin(lp))*as2r) - 526*math.Sin(F-2*D) + 44*math.Sin(l+F-2*D) -
		31*math.Sin(-l+F-2*D) - 25*math.Sin(-2*l+F) - 23*math.Sin(lp+F-2*D) + 21*math.Sin(-l+F) + 11*math.Sin(-lp+F-2*D)
	r := (385000 - 20905*math.Cos(l) - 3699*math.Cos(2*D-l) - 2956*math.Cos(2*D) - 570*math.Cos(2*l) + 246*math.Cos(2*l-2*D) -
		205*math.Cos(lp-2*D) - 171*math.Cos(l+2*D) - 152*math.Cos(l+lp-2*D)) * 1e3
	return eclToFrame(lam, b*as2r, r)
}

// third: the tidal acceleration of a body of parameter gm at s on a satellite at r.
func third(r, s [3]float64, gm float64) [3]float64 {
	d := [3]float64{s[0] - r[0], s[1] - r[1], s[2] - r[2]}
	dn := math.Sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2])
	sn := math.Sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2])
	k1, k2 := gm/(dn*dn*dn), gm/(sn*sn*sn)
	return [3]float64{k1*d[0] - k2*s[0], k1*d[1] - k2*s[1], k1*d[2] - k2*s[2]}
}
