package satdop

import (
	"fmt"
	"math"
	"runtime"
	"sort"
	"sync"
)

// O is one observation used by the fit.
type O struct {
	Sat, Sta int
	T, Rate  float64
	Use      bool
}

// Problem: the observations and the shape of the model fitted to them.
type Problem struct {
	Sats []string
	Sta  []string
	Obs  []O
	// PerSatGM gives every satellite its own GM: Kepler's third law is then
	// tested (n²a³ the same for all) instead of assumed.
	PerSatGM bool
	// Flat holds every station on one plane (orientation, height and
	// in-plane positions free): the flat model, steel-manned.
	Flat bool
	// OnIter, if set, sees every accepted iteration of Fit.
	OnIter func(m *Model, rms float64)

	bySat  [][]int
	groups [][]int // observations sharing one station and one epoch: one clock-rate unknown each
	np     int
	// column offsets
	cGM, cJ, cOm, cSta, cSat, cZtd, cBias int
}

// Index the observations (per satellite, per station-epoch group) and lay out the parameters.
func (p *Problem) Index() {
	p.bySat = make([][]int, len(p.Sats))
	gk := map[[2]int][]int{}
	for i, o := range p.Obs {
		if !o.Use {
			continue
		}
		p.bySat[o.Sat] = append(p.bySat[o.Sat], i)
		k := [2]int{o.Sta, int(math.Round(o.T))}
		gk[k] = append(gk[k], i)
	}
	keys := make([][2]int, 0, len(gk))
	for k := range gk {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(a, b int) bool {
		if keys[a][0] != keys[b][0] {
			return keys[a][0] < keys[b][0]
		}
		return keys[a][1] < keys[b][1]
	})
	p.groups = p.groups[:0]
	for _, k := range keys {
		if len(gk[k]) >= 2 {
			p.groups = append(p.groups, gk[k])
		}
	}
	ns, nt := len(p.Sats), len(p.Sta)
	c := 0
	p.cGM = c
	if p.PerSatGM {
		c += ns
	} else {
		c++
	}
	p.cJ, p.cOm = c, c+1
	c += 2
	p.cSta = c
	if p.Flat {
		c += 2 + 2*nt // plane tilt θ and height Z, then (x, y) in the plane
	} else {
		c += 3*nt - 1 // the first station's y is the frame's gauge
	}
	p.cSat = c
	c += 6 * ns
	p.cZtd = c
	c += nt
	p.cBias = c
	c += ns - 1
	p.np = c
}

func (p *Problem) gmCol(j int) int {
	if p.PerSatGM {
		return p.cGM + j
	}
	return p.cGM
}

func (p *Problem) satCol(j int) int { return p.cSat + 6*j }
func (p *Problem) ztdCol(k int) int { return p.cZtd + k }

// biasCol: the first satellite's clock is the reference (a common offset belongs to the receivers' clocks).
func (p *Problem) biasCol(j int) int {
	if j == 0 {
		return -1
	}
	return p.cBias + j - 1
}

// globe station columns (x, y, z); -1 = held
func (p *Problem) staCol(k int) [3]int {
	if k == 0 {
		return [3]int{p.cSta, -1, p.cSta + 1}
	}
	b := p.cSta + 2 + 3*(k-1)
	return [3]int{b, b + 1, b + 2}
}

// Plane is the flat model's ground: normal n = (sin θ, 0, cos θ) (the
// azimuth of the tilt is the frame's gauge), at height Z along n; station
// k at Z·n + x_k·e1 + y_k·e2.
type Plane struct {
	Theta, Z float64
	XY       [][2]float64
}

func (pl *Plane) basis() (n, e1, e2 [3]float64) {
	s, c := math.Sin(pl.Theta), math.Cos(pl.Theta)
	return [3]float64{s, 0, c}, [3]float64{c, 0, -s}, [3]float64{0, 1, 0}
}

func (pl *Plane) positions() [][3]float64 {
	n, e1, e2 := pl.basis()
	out := make([][3]float64, len(pl.XY))
	for k, q := range pl.XY {
		for i := 0; i < 3; i++ {
			out[k][i] = pl.Z*n[i] + q[0]*e1[i] + q[1]*e2[i]
		}
	}
	return out
}

func (m *Model) gm(j int) float64 {
	if len(m.GMs) > 0 {
		return m.GMs[j]
	}
	return m.GM
}

func (m *Model) bias(j int) float64 {
	if j < len(m.Bias) {
		return m.Bias[j]
	}
	return 0
}

func (m *Model) ztd(k int) float64 {
	if k < len(m.Ztd) {
		return m.Ztd[k]
	}
	return 0
}

// up is the local vertical of station k: away from the force centre on the
// globe, the plane's normal on the flat model.
func (m *Model) up(k int) [3]float64 {
	if m.Plane != nil {
		n, _, _ := m.Plane.basis()
		return n
	}
	s := m.Sta[k]
	r := math.Sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2])
	return [3]float64{s[0] / r, s[1] / r, s[2] / r}
}

func (p *Problem) apply(m *Model, d []float64) *Model {
	n := &Model{GM: m.GM, MuJ: m.MuJ + d[p.cJ], Omega: m.Omega + d[p.cOm]}
	if p.PerSatGM {
		n.GMs = make([]float64, len(p.Sats))
		for j := range n.GMs {
			n.GMs[j] = m.gm(j) + d[p.cGM+j]
		}
	} else {
		n.GM = m.GM + d[p.cGM]
	}
	if p.Flat {
		pl := &Plane{Theta: m.Plane.Theta + d[p.cSta], Z: m.Plane.Z + d[p.cSta+1]}
		pl.XY = make([][2]float64, len(m.Plane.XY))
		for k, q := range m.Plane.XY {
			pl.XY[k] = [2]float64{q[0] + d[p.cSta+2+2*k], q[1] + d[p.cSta+3+2*k]}
		}
		n.Plane = pl
		n.Sta = pl.positions()
	} else {
		n.Sta = make([][3]float64, len(m.Sta))
		for k := range m.Sta {
			c := p.staCol(k)
			for i := 0; i < 3; i++ {
				n.Sta[k][i] = m.Sta[k][i]
				if c[i] >= 0 {
					n.Sta[k][i] += d[c[i]]
				}
			}
		}
	}
	n.Sat = make([][6]float64, len(m.Sat))
	for j := range m.Sat {
		c := p.satCol(j)
		for i := 0; i < 6; i++ {
			n.Sat[j][i] = m.Sat[j][i] + d[c+i]
		}
	}
	n.Ztd = make([]float64, len(m.Sta))
	for k := range n.Ztd {
		n.Ztd[k] = m.ztd(k) + d[p.ztdCol(k)]
	}
	n.Bias = make([]float64, len(p.Sats))
	for j := range n.Bias {
		n.Bias[j] = m.bias(j)
		if c := p.biasCol(j); c >= 0 {
			n.Bias[j] += d[c]
		}
	}
	return n
}

type row struct {
	idx []int32
	val []float64
	res float64
}

func (p *Problem) trajs(m *Model) []Traj {
	tr := make([]Traj, len(p.Sats))
	parallel(len(p.Sats), func(j int) { tr[j] = propagate(m.Sat[j], Tep, m.gm(j), m.MuJ) })
	return tr
}

func parallel(n int, f func(int)) {
	w := runtime.NumCPU()
	var wg sync.WaitGroup
	ch := make(chan int)
	for k := 0; k < w; k++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := range ch {
				f(j)
			}
		}()
	}
	for j := 0; j < n; j++ {
		ch <- j
	}
	close(ch)
	wg.Wait()
}

// pred: the predicted observable, the slant air delay's rate included.
func (m *Model) pred(tr Traj, j, k int, t float64) float64 {
	gm := m.gm(j)
	return rate(tr, gm, m.MuJ, m.Omega, m.Sta[k], t) + m.bias(j) + m.ztd(k)*tropoRate(tr, gm, m.MuJ, m.Omega, m.Sta[k], m.up(k), t)
}

// Residuals (observed − predicted) of every used observation, before the clock elimination.
func (p *Problem) Residuals(m *Model) []float64 {
	tr := p.trajs(m)
	res := make([]float64, len(p.Obs))
	parallel(len(p.Sats), func(j int) {
		for _, i := range p.bySat[j] {
			o := p.Obs[i]
			res[i] = o.Rate - m.pred(tr[j], j, o.Sta, o.T)
		}
	})
	return res
}

// Clean removes each group's mean (the receiver's clock rate at that epoch); NaN = not used.
func (p *Problem) Clean(res []float64) []float64 {
	out := make([]float64, len(res))
	for i := range out {
		out[i] = math.NaN()
	}
	for _, g := range p.groups {
		s := 0.0
		for _, i := range g {
			s += res[i]
		}
		s /= float64(len(g))
		for _, i := range g {
			out[i] = res[i] - s
		}
	}
	return out
}

func (p *Problem) Cost(m *Model) (float64, int) {
	c := p.Clean(p.Residuals(m))
	s, n := 0.0, 0
	for _, v := range c {
		if !math.IsNaN(v) {
			s += v * v
			n++
		}
	}
	return s, n
}

// rows: the Jacobian of every used observation (numerical differences).
func (p *Problem) rows(m *Model) []row {
	rs := make([]row, len(p.Obs))
	scale := [6]float64{10, 10, 10, 1e-3, 1e-3, 1e-3}
	var n, e1, e2, dn [3]float64
	if p.Flat {
		n, e1, e2 = m.Plane.basis()
		// ∂(station)/∂θ = Z ∂n/∂θ + x ∂e1/∂θ (e2 does not turn)
		dn = [3]float64{math.Cos(m.Plane.Theta), 0, -math.Sin(m.Plane.Theta)}
	}
	parallel(len(p.Sats), func(j int) {
		gm := m.gm(j)
		base := propagate(m.Sat[j], Tep, gm, m.MuJ)
		var pert [6]Traj
		for q := 0; q < 6; q++ {
			x := m.Sat[j]
			x[q] += scale[q]
			pert[q] = propagate(x, Tep, gm, m.MuJ)
		}
		dGM, dJ := gm*1e-9, 1e21
		tGM := propagate(m.Sat[j], Tep, gm+dGM, m.MuJ)
		tJ := propagate(m.Sat[j], Tep, gm, m.MuJ+dJ)
		sc := p.satCol(j)
		for _, i := range p.bySat[j] {
			o := p.Obs[i]
			st := m.Sta[o.Sta]
			up := m.up(o.Sta)
			tz := tropoRate(base, gm, m.MuJ, m.Omega, st, up, o.T)
			r0 := rate(base, gm, m.MuJ, m.Omega, st, o.T)
			var R row
			R.res = o.Rate - r0 - m.bias(j) - m.ztd(o.Sta)*tz
			add := func(c int, v float64) {
				if c >= 0 {
					R.idx = append(R.idx, int32(c))
					R.val = append(R.val, v)
				}
			}
			add(p.gmCol(j), (rate(tGM, gm+dGM, m.MuJ, m.Omega, st, o.T)-r0)/dGM)
			add(p.cJ, (rate(tJ, gm, m.MuJ+dJ, m.Omega, st, o.T)-r0)/dJ)
			dO := 1e-11
			add(p.cOm, (rate(base, gm, m.MuJ, m.Omega+dO, st, o.T)-r0)/dO)
			add(p.biasCol(j), 1)
			var g [3]float64 // ∂rate/∂(station position), per metre
			for k := 0; k < 3; k++ {
				s2 := st
				s2[k] += 1
				g[k] = rate(base, gm, m.MuJ, m.Omega, s2, o.T) - r0
			}
			if p.Flat {
				dot := func(a [3]float64) float64 { return g[0]*a[0] + g[1]*a[1] + g[2]*a[2] }
				x := m.Plane.XY[o.Sta][0]
				de1 := [3]float64{-math.Sin(m.Plane.Theta), 0, -math.Cos(m.Plane.Theta)}
				add(p.cSta, m.Plane.Z*dot(dn)+x*dot(de1))
				add(p.cSta+1, dot(n))
				add(p.cSta+2+2*o.Sta, dot(e1))
				add(p.cSta+3+2*o.Sta, dot(e2))
			} else {
				cc := p.staCol(o.Sta)
				for k := 0; k < 3; k++ {
					add(cc[k], g[k])
				}
			}
			for q := 0; q < 6; q++ {
				add(sc+q, (rate(pert[q], gm, m.MuJ, m.Omega, st, o.T)-r0)/scale[q])
			}
			add(p.ztdCol(o.Sta), tz)
			rs[i] = R
		}
	})
	return rs
}

// normal: Jᵀ J and Jᵀ r after removing each group's mean row (clock elimination).
func (p *Problem) normal(rs []row) ([]float64, []float64) {
	n := p.np
	N := make([]float64, n*n)
	b := make([]float64, n)
	sum := make([]float64, n)
	touched := make([]bool, n)
	var list []int
	for _, g := range p.groups {
		sr := 0.0
		list = list[:0]
		for _, i := range g {
			R := rs[i]
			for a, ia := range R.idx {
				va := R.val[a]
				b[ia] += va * R.res
				row := N[int(ia)*n:]
				for c, ic := range R.idx {
					row[ic] += va * R.val[c]
				}
				sum[ia] += va
				if !touched[ia] {
					touched[ia] = true
					list = append(list, int(ia))
				}
			}
			sr += R.res
		}
		f := 1 / float64(len(g))
		for _, a := range list {
			b[a] -= f * sum[a] * sr
			row := N[a*n:]
			for _, c := range list {
				row[c] -= f * sum[a] * sum[c]
			}
		}
		for _, a := range list {
			sum[a] = 0
			touched[a] = false
		}
	}
	return N, b
}

// solve (N + λ D) x = b by Cholesky after Jacobi scaling; frozen columns (zero diagonal) stay 0.
// Also returns the scaled inverse's diagonal when wantCov (for formal sigmas).
func solve(N, b []float64, n int, lam float64) ([]float64, bool) {
	A, d, ok := chol(N, n, lam)
	if !ok {
		return nil, false
	}
	return cholSolve(A, d, b, n), true
}

func chol(N []float64, n int, lam float64) ([]float64, []float64, bool) {
	d := make([]float64, n)
	for i := 0; i < n; i++ {
		if N[i*n+i] > 0 {
			d[i] = 1 / math.Sqrt(N[i*n+i])
		}
	}
	A := make([]float64, n*n)
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			A[i*n+j] = N[i*n+j] * d[i] * d[j]
		}
		if d[i] == 0 {
			A[i*n+i] = 1
		} else {
			A[i*n+i] += lam
		}
	}
	for j := 0; j < n; j++ {
		s := A[j*n+j]
		for k := 0; k < j; k++ {
			s -= A[j*n+k] * A[j*n+k]
		}
		if s <= 0 {
			return nil, nil, false
		}
		A[j*n+j] = math.Sqrt(s)
		for i := j + 1; i < n; i++ {
			s := A[i*n+j]
			for k := 0; k < j; k++ {
				s -= A[i*n+k] * A[j*n+k]
			}
			A[i*n+j] = s / A[j*n+j]
		}
	}
	return A, d, true
}

func cholSolve(A, d, b []float64, n int) []float64 {
	y := make([]float64, n)
	for i := 0; i < n; i++ {
		s := b[i] * d[i]
		for k := 0; k < i; k++ {
			s -= A[i*n+k] * y[k]
		}
		y[i] = s / A[i*n+i]
	}
	x := make([]float64, n)
	for i := n - 1; i >= 0; i-- {
		s := y[i]
		for k := i + 1; k < n; k++ {
			s -= A[k*n+i] * x[k]
		}
		x[i] = s / A[i*n+i]
	}
	for i := range x {
		x[i] *= d[i]
	}
	return x
}

// Sigma: formal standard deviations of the parameters (inverse normal
// matrix × residual variance), for the columns asked.
func (p *Problem) Sigma(m *Model, cols []int) []float64 {
	N, _ := p.normal(p.rows(m))
	cost, nobs := p.Cost(m)
	s2 := cost / float64(nobs-p.np)
	A, d, ok := chol(N, p.np, 0)
	out := make([]float64, len(cols))
	if !ok {
		return out
	}
	for q, c := range cols {
		e := make([]float64, p.np)
		e[c] = 1 // cholSolve applies the Jacobi scaling itself: x = N⁻¹ e
		x := cholSolve(A, d, e, p.np)
		out[q] = math.Sqrt(x[c] * s2)
	}
	return out
}

// Fit: Levenberg–Marquardt from the model m. Returns the fitted model and the final rms (m/s).
func (p *Problem) Fit(m *Model, iters int, log func(string)) (*Model, float64) {
	lam := 1e-3
	cost, nobs := p.Cost(m)
	for it := 0; it < iters; it++ {
		N, b := p.normal(p.rows(m))
		improved := false
		for try := 0; try < 10; try++ {
			d, ok := solve(N, b, p.np, lam)
			if !ok {
				lam *= 10
				continue
			}
			m2 := p.apply(m, d)
			c2, _ := p.Cost(m2)
			if c2 < cost {
				rel := (cost - c2) / cost
				m, cost = m2, c2
				lam = math.Max(lam/10, 1e-9)
				improved = true
				if log != nil {
					log(fmt.Sprintf("it %d rms %.4f m/s GM %.6e Ω %.8e λ %.0e", it, math.Sqrt(cost/float64(nobs)), m.gm(0), m.Omega, lam))
				}
				if p.OnIter != nil {
					p.OnIter(m, math.Sqrt(cost/float64(nobs)))
				}
				if rel < 1e-10 {
					return m, math.Sqrt(cost / float64(nobs))
				}
				break
			}
			lam *= 10
		}
		if !improved {
			break
		}
	}
	return m, math.Sqrt(cost / float64(nobs))
}

// Mask drops the observations below el degrees, as seen from the model's own geometry.
func (p *Problem) Mask(m *Model, el float64) int {
	tr := p.trajs(m)
	n := 0
	for i := range p.Obs {
		o := &p.Obs[i]
		o.Use = elevation(tr[o.Sat], m.gm(o.Sat), m.MuJ, m.Omega, m.Sta[o.Sta], m.up(o.Sta), o.T) >= el
		if o.Use {
			n++
		}
	}
	p.Index()
	return n
}

// Reject drops the used observations whose clock-free residual exceeds k
// times the rms of the others (one pass); returns how many were dropped.
func (p *Problem) Reject(m *Model, k float64) int {
	c := p.Clean(p.Residuals(m))
	s, n := 0.0, 0
	for _, v := range c {
		if !math.IsNaN(v) {
			s += v * v
			n++
		}
	}
	drop := 0
	for i, v := range c {
		if math.IsNaN(v) || !p.Obs[i].Use {
			continue
		}
		others := math.Sqrt((s - v*v) / float64(n-1))
		if math.Abs(v) > k*others {
			p.Obs[i].Use = false
			drop++
		}
	}
	p.Index()
	return drop
}
