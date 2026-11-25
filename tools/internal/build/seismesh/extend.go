package seismesh

import (
	"math"
	"runtime"
	"sync"
)

// MinAll: a station outside the core enters the full mesh if it read P for this many quakes. In three dimensions a
// station is three unknowns: with three readings it fits any times exactly (and has two mirror places), so it needs a
// fourth to be tested at all; five keeps 97 % of the readings.
const MinAll = 5

// fullGraph is the mesh of every station that read at least minQ quakes, the core stations FIRST (in the core's order)
// and the quakes numbered as in the core graph (sorted by their index in the catalogue: every quake is in the core).
func fullGraph(c cache, core []int, minQ int) (*Graph, []int) {
	cnt := map[int]int{}
	for _, e := range c.Edge {
		cnt[e.S]++
	}
	in := map[int]bool{}
	order := append([]int(nil), core...)
	for _, s := range core {
		in[s] = true
	}
	for s := 0; s < len(c.Sta); s++ {
		if !in[s] && cnt[s] >= minQ {
			order = append(order, s)
		}
	}
	idx := map[int]int{}
	for i, s := range order {
		idx[s] = i
	}
	qn := map[int]int{}
	g := &Graph{NS: len(order)}
	for _, e := range c.Edge { // edges are sorted by quake: the same numbering as subgraph's
		i, ok := idx[e.S]
		if !ok {
			continue
		}
		q, ok := qn[e.Q]
		if !ok {
			q = len(qn)
			qn[e.Q] = q
		}
		g.E = append(g.E, Edge{q, i, e.T})
	}
	g.NQ = len(qn)
	return g, order
}

// Extend places the stations of the full graph g that are not in the core (the first nc stations), one by one, with
// the core's quakes, origins and law held: the best of a set of candidate places (k = 3: points spread over the
// core's sphere; k = 2: a grid over the core's plane), then a local descent. No coordinate enters: only the times. It
// returns the full state (quakes, then every station) before the joint refit.
func Extend(g *Graph, core *State, coreNS, nc int) *State {
	k := core.K
	s := &State{K: k, M: Model{C0: append([]float64(nil), core.M.C0...), C2: core.M.C2, C3: core.M.C3}}
	for q := 0; q < g.NQ; q++ {
		s.X = append(s.X, append([]float64(nil), core.X[q]...))
	}
	for i := 0; i < nc; i++ {
		s.X = append(s.X, append([]float64(nil), core.X[g.NQ+i]...))
	}
	for i := nc; i < g.NS; i++ {
		s.X = append(s.X, make([]float64, k))
	}
	by := make([][]Edge, g.NS)
	for _, e := range g.E {
		by[e.S] = append(by[e.S], e)
	}
	cands := candidates(core.X[g.NQ:g.NQ+coreNS], k)
	jobs := make(chan int)
	var wg sync.WaitGroup
	for w := 0; w < runtime.NumCPU(); w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range jobs {
				s.X[g.NQ+i] = place(by[i], s, cands)
			}
		}()
	}
	for i := nc; i < g.NS; i++ {
		jobs <- i
	}
	close(jobs)
	wg.Wait()
	return s
}

// candidates: k = 3, 4000 points spread evenly (Fibonacci) over the core's sphere and over spheres 10 % smaller and
// larger; k = 2, a 90 x 90 grid over the core's plane, 20 % beyond it.
func candidates(X [][]float64, k int) [][]float64 {
	var out [][]float64
	if k == 3 {
		c, R, _ := SphereFit(X)
		const m = 4000
		for _, f := range []float64{0.9, 1, 1.1} {
			for i := 0; i < m; i++ {
				z := 1 - 2*(float64(i)+0.5)/m
				r := math.Sqrt(1 - z*z)
				a := float64(i) * 2.399963229728653
				out = append(out, []float64{c[0] + f*R*r*math.Cos(a), c[1] + f*R*r*math.Sin(a), c[2] + f*R*z})
			}
		}
		return out
	}
	lo, hi := []float64{math.Inf(1), math.Inf(1)}, []float64{math.Inf(-1), math.Inf(-1)}
	for _, x := range X {
		for c := 0; c < 2; c++ {
			lo[c], hi[c] = math.Min(lo[c], x[c]), math.Max(hi[c], x[c])
		}
	}
	const m = 90
	for a := 0; a <= m; a++ {
		for b := 0; b <= m; b++ {
			p := []float64{lo[0] + (hi[0]-lo[0])*(-0.2+1.4*float64(a)/m), lo[1] + (hi[1]-lo[1])*(-0.2+1.4*float64(b)/m)}
			out = append(out, p)
		}
	}
	return out
}

// place: the position of one station from its readings, quakes, origins and law held.
func place(es []Edge, s *State, cands [][]float64) []float64 {
	cost := func(x []float64) float64 {
		var sq float64
		for _, e := range es {
			r := e.T/100 - s.M.C0[e.Q] - s.M.g(dist(x, s.X[e.Q]))
			sq += r * r
		}
		return sq
	}
	best, bc := cands[0], math.Inf(1)
	for _, p := range cands {
		if c := cost(p); c < bc {
			best, bc = p, c
		}
	}
	x := append([]float64(nil), best...)
	k := len(x)
	m1, m2 := make([]float64, k), make([]float64, k)
	for it := 1; it <= 400; it++ {
		gr := make([]float64, k)
		for _, e := range es {
			u := math.Max(dist(x, s.X[e.Q]), 1e-9)
			r := e.T/100 - s.M.C0[e.Q] - s.M.g(u)
			for c := 0; c < k; c++ {
				gr[c] += -2 * r * s.M.dg(u) * (x[c] - s.X[e.Q][c]) / u
			}
		}
		for c := 0; c < k; c++ {
			m1[c] = 0.9*m1[c] + 0.1*gr[c]
			m2[c] = 0.999*m2[c] + 0.001*gr[c]*gr[c]
			mh := m1[c] / (1 - math.Pow(0.9, float64(it)))
			vh := m2[c] / (1 - math.Pow(0.999, float64(it)))
			x[c] -= 0.01 * math.Pow(0.995, float64(it)) * mh / (math.Sqrt(vh) + 1e-9)
		}
	}
	return x
}

// Procrustes: the rotation (or, never here, reflection excluded) and translation that bring the points A onto B
// (least squares), applied to every point of P. Used to hold the joint refit in the core's frame (the fit is free to
// turn and slide as a whole: a gauge, not a result).
func Procrustes(A, B [][]float64, P [][]float64) [][]float64 {
	k := len(A[0])
	ca, cb := make([]float64, k), make([]float64, k)
	for i := range A {
		for c := 0; c < k; c++ {
			ca[c] += A[i][c] / float64(len(A))
			cb[c] += B[i][c] / float64(len(A))
		}
	}
	var H [3][3]float64
	for i := range A {
		for a := 0; a < k; a++ {
			for b := 0; b < k; b++ {
				H[a][b] += (A[i][a] - ca[a]) * (B[i][b] - cb[b])
			}
		}
	}
	if k == 2 {
		H[2][2] = 1
	}
	R := polar(H)
	out := make([][]float64, len(P))
	for i, p := range P {
		v := make([]float64, k)
		for b := 0; b < k; b++ {
			for a := 0; a < k; a++ {
				v[b] += (p[a] - ca[a]) * R[a][b]
			}
			v[b] += cb[b]
		}
		out[i] = v
	}
	return out
}
