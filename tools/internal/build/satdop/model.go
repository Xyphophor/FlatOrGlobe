package satdop

import (
	"math"
)

const (
	C       = 299792458.0
	Crx2rnx = "tools/bin/crx2rnx"
	DaySec  = 86400.0
	H       = 30.0    // integration step and trajectory grid, s (the phase epochs)
	Tep     = 43200.0 // epoch of the fitted satellite states: noon of the day
)

// Model is everything the Doppler is fitted with. Frames: the inertial
// frame has z along the rotation axis and coincides at 00:00 GPS time with
// the Earth-fixed frame, whose x axis is fixed by putting the first station
// at y = 0 (Doppler cannot see a common rotation of everything about the
// axis). Nothing else is fixed: the force centre is where the orbits put it.
type Model struct {
	GM    float64      // m³/s², the attracting body's gravitational parameter
	MuJ   float64      // GM·J₂·a², m⁵/s²: the oblateness term (no length is assumed)
	Omega float64      // rad/s, rotation of the stations about z
	GMs   []float64    // per-satellite GM (Kepler's third law tested), else nil
	Plane *Plane       // the flat model's plane, else nil
	Bias  []float64    // each satellite clock's frequency offset, as a range rate, m/s (the first held at 0)
	Sta   [][3]float64 // Earth-fixed station positions, m
	Sat   [][6]float64 // inertial position and velocity of each satellite at Tep
	Ztd   []float64    // zenith delay of the air above each station, m (its rate is what matters)
}

// mapping: how much longer the slant path through the air is than the
// zenith one, for a flat layer of air: 1/sin e. Published mapping functions
// (Chao 1972, Niell 1996) add small terms for the air's curvature, fitted
// on a round Earth; they are left out so that no radius enters. Above the
// 10° mask the difference is under 2 %, and only the delay's rate matters.
func mapping(el float64) float64 {
	return 1 / math.Sin(math.Max(el, 3)*math.Pi/180)
}

// tropoRate: the rate of the slant delay over the minute around t, per metre of zenith delay.
func tropoRate(tr Traj, gm, muj, om float64, p, up [3]float64, t float64) float64 {
	return (mapping(elevation(tr, gm, muj, om, p, up, t+30)) - mapping(elevation(tr, gm, muj, om, p, up, t-30))) / 60
}

// accel: point mass plus the J₂ term, a = −GM r/r³ + (3/2) μJ/r⁵ [x(5z²/r²−1), y(5z²/r²−1), z(5z²/r²−3)].
// The Sun and the Moon add their tidal pull (thirdbody.go) when ThirdBody is set.
var ThirdBody = true

func accel(r [3]float64, t, gm, muj float64) [3]float64 {
	r2 := r[0]*r[0] + r[1]*r[1] + r[2]*r[2]
	rn := math.Sqrt(r2)
	k := -gm / (r2 * rn)
	z2 := r[2] * r[2] / r2
	j := 1.5 * muj / (r2 * r2 * rn)
	a := [3]float64{
		k*r[0] + j*r[0]*(5*z2-1),
		k*r[1] + j*r[1]*(5*z2-1),
		k*r[2] + j*r[2]*(5*z2-3),
	}
	if ThirdBody {
		s, m := third(r, lerp(sunTab, t), gmSun), third(r, lerp(moonTab, t), gmMoon*MoonScale*MoonScale*MoonScale)
		for i := range a {
			a[i] += s[i] + m[i]
		}
	}
	return a
}

func deriv(s [6]float64, t, gm, muj float64) [6]float64 {
	a := accel([3]float64{s[0], s[1], s[2]}, t, gm, muj)
	return [6]float64{s[3], s[4], s[5], a[0], a[1], a[2]}
}

func rk4(s [6]float64, t, h, gm, muj float64) [6]float64 {
	add := func(a, b [6]float64, f float64) [6]float64 {
		for i := range a {
			a[i] += f * b[i]
		}
		return a
	}
	k1 := deriv(s, t, gm, muj)
	k2 := deriv(add(s, k1, h/2), t+h/2, gm, muj)
	k3 := deriv(add(s, k2, h/2), t+h/2, gm, muj)
	k4 := deriv(add(s, k3, h), t+h, gm, muj)
	for i := range s {
		s[i] += h / 6 * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i])
	}
	return s
}

// Traj is a trajectory sampled every H seconds over the day.
type Traj [][6]float64

// propagate integrates a state given at time t0 (any time of the day) over the whole day.
func propagate(x0 [6]float64, t0, gm, muj float64) Traj {
	n := int(DaySec/H) + 1
	tr := make(Traj, n)
	// first bring the state to the nearest grid point
	g := int(math.Round(t0 / H))
	g = max(0, min(n-1, g))
	s := x0
	dt := float64(g)*H - t0
	if dt != 0 {
		m := int(math.Ceil(math.Abs(dt) / H))
		for k := 0; k < m; k++ {
			s = rk4(s, t0+float64(k)*dt/float64(m), dt/float64(m), gm, muj)
		}
	}
	tr[g] = s
	for k := g + 1; k < n; k++ {
		tr[k] = rk4(tr[k-1], float64(k-1)*H, H, gm, muj)
	}
	for k := g - 1; k >= 0; k-- {
		tr[k] = rk4(tr[k+1], float64(k+1)*H, -H, gm, muj)
	}
	return tr
}

// at returns the state at time t (t must lie within H/2 of a grid point
// plus the light time: observations are taken on the grid), by a
// second-order Taylor step from the nearest grid point.
func (tr Traj) at(t, gm, muj float64) ([3]float64, [3]float64) {
	g := int(math.Round(t / H))
	g = max(0, min(len(tr)-1, g))
	s := tr[g]
	d := t - float64(g)*H
	a := accel([3]float64{s[0], s[1], s[2]}, float64(g)*H, gm, muj)
	var p, v [3]float64
	for i := 0; i < 3; i++ {
		p[i] = s[i] + s[3+i]*d + 0.5*a[i]*d*d
		v[i] = s[3+i] + a[i]*d
	}
	return p, v
}

// rng is the range (m) received at receiver time t: the station at
// Earth-fixed p turned by Ωt about z, the signal leaving the satellite one
// light time earlier.
func rng(tr Traj, gm, muj, om float64, p [3]float64, t float64) float64 {
	c, s := math.Cos(om*t), math.Sin(om*t)
	P := [3]float64{c*p[0] - s*p[1], s*p[0] + c*p[1], p[2]}
	tau := 0.075
	var rho float64
	for k := 0; k < 3; k++ {
		S, _ := tr.at(t-tau, gm, muj)
		rho = math.Sqrt((S[0]-P[0])*(S[0]-P[0]) + (S[1]-P[1])*(S[1]-P[1]) + (S[2]-P[2])*(S[2]-P[2]))
		tau = rho / C
	}
	return rho
}

// RelSign: sign of the satellite clock's periodic relativistic term (set by the tests).
var RelSign = 1.0

// rate is the predicted observable: the range change over the minute
// around t divided by 60 s, as the phase count measures it, plus the
// satellite clock's periodic relativistic drift. On an eccentric orbit the
// clock runs slower near perigee (deeper in the potential, faster):
// δt = −2 r·v/c² (IS-GPS-200 §20.3.3.3.3.1; Ashby 2003, Living Rev.
// Relativity 6, 1), whose rate is up to 0.016 m/s for Galileo E14/E18 (e = 0.16).
func rate(tr Traj, gm, muj, om float64, p [3]float64, t float64) float64 {
	rv := func(t float64) float64 {
		r, v := tr.at(t-0.08, gm, muj)
		return r[0]*v[0] + r[1]*v[1] + r[2]*v[2]
	}
	rel := RelSign * 2 * (rv(t+30) - rv(t-30)) / 60 / C
	return (rng(tr, gm, muj, om, p, t+30)-rng(tr, gm, muj, om, p, t-30))/60 + rel
}

// elevation of a satellite seen from a station whose local vertical is up
// (Earth-fixed unit vector), degrees.
func elevation(tr Traj, gm, muj, om float64, p, up [3]float64, t float64) float64 {
	c, s := math.Cos(om*t), math.Sin(om*t)
	P := [3]float64{c*p[0] - s*p[1], s*p[0] + c*p[1], p[2]}
	U := [3]float64{c*up[0] - s*up[1], s*up[0] + c*up[1], up[2]}
	S, _ := tr.at(t-0.075, gm, muj)
	d := [3]float64{S[0] - P[0], S[1] - P[1], S[2] - P[2]}
	dn := math.Sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2])
	return math.Asin((d[0]*U[0]+d[1]*U[1]+d[2]*U[2])/dn) * 180 / math.Pi
}
