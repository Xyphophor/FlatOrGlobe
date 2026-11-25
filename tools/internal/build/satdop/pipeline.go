package satdop

import (
	"fmt"
	"math"
	"sort"
)

// Run is one complete solution and what was dropped on the way.
type Run struct {
	M        *Model
	RMS      float64
	NObs     int
	DropSta  []string // stations excluded (rms > 3 SD of the others)
	DropSat  []string
	Rejected int // single points excluded (> 3 rms of the others)
	Log      []string
}

// looOutliers: indices whose value lies more than k SD from the mean of the others.
func looOutliers(v []float64, k float64) []int {
	var out []int
	for i := range v {
		var o []float64
		for j, x := range v {
			if j != i {
				o = append(o, x)
			}
		}
		m, s := meanSD(o)
		if math.Abs(v[i]-m) > k*s {
			out = append(out, i)
		}
	}
	return out
}

func meanSD(v []float64) (float64, float64) {
	m := 0.0
	for _, x := range v {
		m += x
	}
	m /= float64(len(v))
	s := 0.0
	for _, x := range v {
		s += (x - m) * (x - m)
	}
	return m, math.Sqrt(s / float64(len(v)-1))
}

// rmsBy: rms of the clock-free residuals per station and per satellite.
func (p *Problem) rmsBy(m *Model) ([]float64, []float64) {
	c := p.Clean(p.Residuals(m))
	st, sa := make([]float64, len(p.Sta)), make([]float64, len(p.Sats))
	nt, na := make([]int, len(p.Sta)), make([]int, len(p.Sats))
	for i, v := range c {
		if math.IsNaN(v) {
			continue
		}
		o := p.Obs[i]
		st[o.Sta] += v * v
		nt[o.Sta]++
		sa[o.Sat] += v * v
		na[o.Sat]++
	}
	for k := range st {
		st[k] = math.Sqrt(st[k] / float64(max(1, nt[k])))
	}
	for j := range sa {
		sa[j] = math.Sqrt(sa[j] / float64(max(1, na[j])))
	}
	return st, sa
}

// Solve runs the whole solution from model m: a first fit on every point,
// then the stations and satellites whose rms lies more than 3 SD from the
// others are dropped, the points below 10° (seen from the fitted geometry)
// are dropped, and single points beyond 3 rms of the others, until none is.
func (p *Problem) Solve(m *Model, log func(string)) *Run {
	R := &Run{}
	say := func(f string, a ...any) {
		s := fmt.Sprintf(f, a...)
		R.Log = append(R.Log, s)
		if log != nil {
			log(s)
		}
	}
	for i := range p.Obs {
		p.Obs[i].Use = true
	}
	p.Index()
	m, rms := p.Fit(m, 80, nil)
	say("first fit, every point: rms %.4f m/s, GM %.7e", rms, m.gm(0))
	st, sa := p.rmsBy(m)
	dropSta := map[int]bool{}
	for _, k := range looOutliers(st, 3) {
		dropSta[k] = true
		R.DropSta = append(R.DropSta, p.Sta[k])
	}
	dropSat := map[int]bool{}
	for _, j := range looOutliers(sa, 3) {
		dropSat[j] = true
		R.DropSat = append(R.DropSat, p.Sats[j])
	}
	say("dropped stations %v, satellites %v (rms > 3 SD of the others)", R.DropSta, R.DropSat)
	n := p.Mask(m, 10)
	for i := range p.Obs {
		if dropSta[p.Obs[i].Sta] || dropSat[p.Obs[i].Sat] {
			p.Obs[i].Use = false
		}
	}
	p.Index()
	_ = n
	m, rms = p.Fit(m, 80, nil)
	say("above 10°: rms %.4f m/s, GM %.7e", rms, m.gm(0))
	for pass := 0; pass < 12; pass++ {
		d := p.Reject(m, 3)
		R.Rejected += d
		if d == 0 {
			break
		}
		m, rms = p.Fit(m, 80, nil)
		say("pass %d: %d points rejected, rms %.4f m/s, GM %.7e", pass+1, d, rms, m.gm(0))
	}
	R.M, R.RMS = m, rms
	for _, o := range p.Obs {
		if o.Use {
			R.NObs++
		}
	}
	return R
}

// UseSet / SetUse save and restore which points are used.
func (p *Problem) UseSet() []bool {
	u := make([]bool, len(p.Obs))
	for i, o := range p.Obs {
		u[i] = o.Use
	}
	return u
}

func (p *Problem) SetUse(u []bool) {
	for i := range p.Obs {
		p.Obs[i].Use = u[i]
	}
	p.Index()
}

// FitPlane: the best plane through points (least squares on the normal
// distance), as normal n and offset d with n·x = d, and the rms distance.
func FitPlane(pts [][3]float64) ([3]float64, float64, float64) {
	var c [3]float64
	for _, q := range pts {
		for i := range c {
			c[i] += q[i] / float64(len(pts))
		}
	}
	var S [3][3]float64
	for _, q := range pts {
		for i := 0; i < 3; i++ {
			for j := 0; j < 3; j++ {
				S[i][j] += (q[i] - c[i]) * (q[j] - c[j])
			}
		}
	}
	// smallest eigenvector by inverse iteration on S
	n := [3]float64{0, 0, 1}
	for it := 0; it < 200; it++ {
		x := solve3(S, n)
		l := math.Sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2])
		n = [3]float64{x[0] / l, x[1] / l, x[2] / l}
	}
	d := n[0]*c[0] + n[1]*c[1] + n[2]*c[2]
	s := 0.0
	for _, q := range pts {
		e := n[0]*q[0] + n[1]*q[1] + n[2]*q[2] - d
		s += e * e
	}
	return n, d, math.Sqrt(s / float64(len(pts)))
}

func solve3(A [3][3]float64, b [3]float64) [3]float64 {
	det := A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1]) - A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0]) + A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0])
	det += 1e-30
	var x [3]float64
	for k := 0; k < 3; k++ {
		M := A
		for i := 0; i < 3; i++ {
			M[i][k] = b[i]
		}
		x[k] = (M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1]) - M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0]) + M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0])) / det
	}
	return x
}

// FlatStart turns a globe model into the flat model's start: the stations
// projected on their best plane (azimuth of its tilt turned to 0 by the
// gauge), everything else kept.
func FlatStart(m *Model) *Model {
	n, d, _ := FitPlane(m.Sta)
	if n[0]*m.Sta[0][0]+n[1]*m.Sta[0][1]+n[2]*m.Sta[0][2] < 0 {
		n, d = [3]float64{-n[0], -n[1], -n[2]}, -d
	}
	az := math.Atan2(n[1], n[0])
	// turn everything by −az about z so the normal has no y component
	f := &Model{GM: m.GM, GMs: m.GMs, MuJ: m.MuJ, Omega: m.Omega, Bias: m.Bias, Ztd: m.Ztd}
	for _, x := range m.Sat {
		r, v := rotz([3]float64{x[0], x[1], x[2]}, -az), rotz([3]float64{x[3], x[4], x[5]}, -az)
		f.Sat = append(f.Sat, [6]float64{r[0], r[1], r[2], v[0], v[1], v[2]})
	}
	nn := rotz(n, -az)
	pl := &Plane{Theta: math.Atan2(nn[0], nn[2]), Z: d}
	_, e1, e2 := pl.basis()
	for _, s := range m.Sta {
		q := rotz(s, -az)
		pl.XY = append(pl.XY, [2]float64{q[0]*e1[0] + q[1]*e1[1] + q[2]*e1[2], q[0]*e2[0] + q[1]*e2[1] + q[2]*e2[2]})
	}
	f.Plane = pl
	f.Sta = pl.positions()
	return f
}

// Radii: each station's distance from the force centre and its geocentric latitude.
func Radii(m *Model) ([]float64, []float64) {
	r, la := make([]float64, len(m.Sta)), make([]float64, len(m.Sta))
	for k, s := range m.Sta {
		r[k] = math.Sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2])
		la[k] = math.Asin(s[2]/r[k]) * 180 / math.Pi
	}
	return r, la
}

// Ellipse: least squares r = a (1 − f sin²φ) over the stations.
func Ellipse(r, lat []float64) (a, f, rms float64) {
	var sxx, sx, sy, sxy float64
	n := float64(len(r))
	for k := range r {
		x := math.Pow(math.Sin(lat[k]*math.Pi/180), 2)
		sx += x
		sy += r[k]
		sxx += x * x
		sxy += x * r[k]
	}
	b := (n*sxy - sx*sy) / (n*sxx - sx*sx)
	a = (sy - b*sx) / n
	f = -b / a
	s := 0.0
	for k := range r {
		x := math.Pow(math.Sin(lat[k]*math.Pi/180), 2)
		e := r[k] - a*(1-f*x)
		s += e * e
	}
	return a, f, math.Sqrt(s / n)
}

func sortedCopy(v []float64) []float64 {
	c := append([]float64(nil), v...)
	sort.Float64s(c)
	return c
}

// DiscStart: the flat model's other start, the classic disc: the plane
// perpendicular to the rotation axis through the North Pole, each station
// at its distance from the pole along the ground (colatitude × its
// distance from the centre) in the direction of its longitude.
func DiscStart(m *Model) *Model {
	f := &Model{GM: m.GM, GMs: m.GMs, MuJ: m.MuJ, Omega: m.Omega, Bias: m.Bias, Ztd: m.Ztd, Sat: m.Sat}
	r, la := Radii(m)
	pl := &Plane{Theta: 0, Z: 0}
	for k, s := range m.Sta {
		pl.Z += r[k] / float64(len(m.Sta))
		d := (90 - la[k]) * math.Pi / 180 * r[k]
		lon := math.Atan2(s[1], s[0])
		pl.XY = append(pl.XY, [2]float64{d * math.Cos(lon), d * math.Sin(lon)})
	}
	f.Plane = pl
	f.Sta = pl.positions()
	return f
}
