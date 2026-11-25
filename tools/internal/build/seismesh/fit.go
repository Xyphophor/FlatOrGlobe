package seismesh

import (
	"math"
	"math/rand"
	"sort"
)

// Graph is the bipartite mesh: nodes 0..NQ-1 are the quakes, NQ.. the stations; one edge per P reading.
type Graph struct {
	NQ, NS int
	E      []Edge // Q in 0..NQ-1, S in 0..NS-1 (station index inside the kept stations)
}

// Model is the common travel-time law and the per-quake origin offsets.
//
//	T/100 = C0[q] + u + C2 u² + C3 u³,   u = |x_q - x_s| in the mesh's own unit
//
// c1 = 1 fixes the unit of length (one unit = the distance covered, at the speed of the curve's start, in 100 s): the
// positions never see a kilometre. Speed v (km/s) at the start of the curve turns u into km: km = 100 v u.
type Model struct {
	C0     []float64
	C2, C3 float64
}

func (m *Model) g(u float64) float64  { return u + m.C2*u*u + m.C3*u*u*u }
func (m *Model) dg(u float64) float64 { return 1 + 2*m.C2*u + 3*m.C3*u*u }

// invert: u such that g(u) = y (g increasing on the range met), by bisection-free Newton from u = y.
func (m *Model) invert(y float64) float64 {
	u := math.Max(y, 0)
	for i := 0; i < 30; i++ {
		d := m.dg(u)
		if d < 0.05 {
			d = 0.05
		}
		nu := u - (m.g(u)-y)/d
		if nu < 0 {
			nu = u / 2
		}
		if math.Abs(nu-u) < 1e-9 {
			return nu
		}
		u = nu
	}
	return u
}

// State is an embedding in k dimensions.
type State struct {
	K int
	X [][]float64 // NQ+NS nodes
	M Model
}

func (g *Graph) node(e Edge) (int, int) { return e.Q, g.NQ + e.S }

// Stress is the rms of the time residuals (seconds) of the mesh.
func (g *Graph) Stress(s *State) float64 {
	var sq float64
	for _, e := range g.E {
		a, b := g.node(e)
		u := dist(s.X[a], s.X[b])
		r := (e.T/100 - s.M.C0[e.Q] - s.M.g(u)) * 100
		sq += r * r
	}
	return math.Sqrt(sq / float64(len(g.E)))
}

func dist(a, b []float64) float64 {
	var s float64
	for i := range a {
		d := a[i] - b[i]
		s += d * d
	}
	return math.Sqrt(s)
}

// Init: guesses u from the times with c2 = c3 = 0, completes the missing distances by paths through the quakes
// (Isomap), and takes classical MDS in k dimensions. Origin offsets start 3.3 units before each quake's first reading.
func (g *Graph) Init(k int, rng *rand.Rand) *State {
	n := g.NQ + g.NS
	min := make([]float64, g.NQ)
	for i := range min {
		min[i] = math.Inf(1)
	}
	for _, e := range g.E {
		min[e.Q] = math.Min(min[e.Q], e.T/100)
	}
	m := Model{C0: make([]float64, g.NQ)}
	for q := range m.C0 {
		m.C0[q] = min[q] - 3.3
	}
	D := make([][]float64, n)
	for i := range D {
		D[i] = make([]float64, n)
		for j := range D[i] {
			if i != j {
				D[i][j] = math.Inf(1)
			}
		}
	}
	for _, e := range g.E {
		a, b := g.node(e)
		u := math.Max(e.T/100-m.C0[e.Q], 0.1)
		D[a][b], D[b][a] = u, u
	}
	for w := 0; w < n; w++ { // Floyd-Warshall, n ~ 400
		for i := 0; i < n; i++ {
			if math.IsInf(D[i][w], 1) {
				continue
			}
			for j := 0; j < n; j++ {
				if d := D[i][w] + D[w][j]; d < D[i][j] {
					D[i][j] = d
				}
			}
		}
	}
	X := classicalMDS(D, k, rng)
	return &State{K: k, X: X, M: m}
}

func classicalMDS(D [][]float64, k int, rng *rand.Rand) [][]float64 {
	n := len(D)
	B := make([][]float64, n)
	rm := make([]float64, n)
	var gm float64
	for i := range D {
		for j := range D {
			rm[i] += D[i][j] * D[i][j]
		}
		gm += rm[i]
		rm[i] /= float64(n)
	}
	gm /= float64(n * n)
	for i := range B {
		B[i] = make([]float64, n)
		for j := range B[i] {
			B[i][j] = -0.5 * (D[i][j]*D[i][j] - rm[i] - rm[j] + gm)
		}
	}
	X := make([][]float64, n)
	for i := range X {
		X[i] = make([]float64, k)
	}
	for c := 0; c < k; c++ { // power iteration with deflation
		v := make([]float64, n)
		for i := range v {
			v[i] = rng.NormFloat64()
		}
		var lam float64
		for it := 0; it < 300; it++ {
			w := make([]float64, n)
			for i := range B {
				for j := range B[i] {
					w[i] += B[i][j] * v[j]
				}
			}
			var nn float64
			for _, x := range w {
				nn += x * x
			}
			nn = math.Sqrt(nn)
			for i := range w {
				v[i] = w[i] / nn
			}
			lam = nn
		}
		s := math.Sqrt(math.Max(lam, 0))
		for i := range X {
			X[i][c] = v[i] * s
		}
		for i := range B {
			for j := range B[i] {
				B[i][j] -= lam * v[i] * v[j]
			}
		}
	}
	return X
}

// Descend runs Adam on positions, origins and (c2, c3) until iters; frame(it) is called every `every` steps.
func (g *Graph) Descend(s *State, iters int, lr float64, free bool, every int, frame func(it int)) {
	n := len(s.X)
	k := s.K
	nP := n*k + g.NQ + 2
	p := make([]float64, nP)
	gr := make([]float64, nP)
	m1 := make([]float64, nP)
	m2 := make([]float64, nP)
	pack := func() {
		for i := range s.X {
			copy(p[i*k:], s.X[i])
		}
		copy(p[n*k:], s.M.C0)
		p[n*k+g.NQ], p[n*k+g.NQ+1] = s.M.C2, s.M.C3
	}
	unpack := func() {
		for i := range s.X {
			copy(s.X[i], p[i*k:(i+1)*k])
		}
		copy(s.M.C0, p[n*k:n*k+g.NQ])
		s.M.C2, s.M.C3 = p[n*k+g.NQ], p[n*k+g.NQ+1]
	}
	pack()
	cnt := make([]float64, g.NQ)
	for _, e := range g.E {
		cnt[e.Q]++
	}
	for it := 1; it <= iters; it++ {
		for i := range gr {
			gr[i] = 0
		}
		for _, e := range g.E {
			a, b := g.node(e)
			u := dist(s.X[a], s.X[b])
			if u < 1e-9 {
				u = 1e-9
			}
			r := e.T/100 - s.M.C0[e.Q] - s.M.g(u)
			// d(r²)/d.. = -2 r d g
			dg := s.M.dg(u)
			for c := 0; c < k; c++ {
				d := (s.X[a][c] - s.X[b][c]) / u
				gx := -2 * r * dg * d
				gr[a*k+c] += gx
				gr[b*k+c] -= gx
			}
			gr[n*k+e.Q] += -2 * r / cnt[e.Q] * 1
			if free {
				gr[n*k+g.NQ] += -2 * r * u * u / float64(len(g.E))
				gr[n*k+g.NQ+1] += -2 * r * u * u * u / float64(len(g.E))
			}
		}
		step := lr * math.Pow(0.9992, float64(it))
		for i := range p {
			m1[i] = 0.9*m1[i] + 0.1*gr[i]
			m2[i] = 0.999*m2[i] + 0.001*gr[i]*gr[i]
			mh := m1[i] / (1 - math.Pow(0.9, float64(it)))
			vh := m2[i] / (1 - math.Pow(0.999, float64(it)))
			st := step
			if i >= n*k+g.NQ {
				st = step * 0.1
			}
			p[i] -= st * mh / (math.Sqrt(vh) + 1e-9)
		}
		unpack()
		if frame != nil && it%every == 0 {
			frame(it)
		}
	}
}

// SphereFit: centre and radius of the sphere closest to the nodes (algebraic then a few Gauss-Newton steps), and the
// relative radial scatter sd(|x - c|)/R. Works for any k >= 2 (k = 2: the circle).
func SphereFit(X [][]float64) (c []float64, R, rel float64) {
	k := len(X[0])
	c = make([]float64, k)
	for _, x := range X {
		for i := range c {
			c[i] += x[i] / float64(len(X))
		}
	}
	for it := 0; it < 200; it++ {
		var rm float64
		d := make([]float64, len(X))
		for i, x := range X {
			d[i] = dist(x, c)
			rm += d[i] / float64(len(X))
		}
		gc := make([]float64, k)
		for i, x := range X {
			for j := range c {
				gc[j] += (c[j] - x[j]) / math.Max(d[i], 1e-12) * (d[i] - rm) / float64(len(X))
			}
		}
		for j := range c {
			c[j] -= 0.5 * gc[j] * 1
		}
		R = rm
	}
	var ss, rm float64
	for _, x := range X {
		rm += dist(x, c) / float64(len(X))
	}
	for _, x := range X {
		d := dist(x, c) - rm
		ss += d * d
	}
	R = rm
	return c, R, math.Sqrt(ss/float64(len(X))) / R
}

// Median of a slice (copy sorted).
func Median(v []float64) float64 {
	w := append([]float64(nil), v...)
	sort.Float64s(w)
	return w[len(w)/2]
}
