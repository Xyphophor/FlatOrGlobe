package seisbulk

import (
	"fmt"
	"math"

	"flatorglobe/tools/internal/build/seisreloc"
	"flatorglobe/tools/internal/pyjson"
)

// poolFit is one model over every quake: its pooled scatter, each quake's,
// and the residuals binned for the page.
type poolFit struct {
	Centre [2]float64 // the flat map's centre (unused for the globe)
	Shape  []float64  // the common curve's c1, c2, c3 (nil: one cubic per quake)
	PerQ   map[*Quake]float64
	RMS    float64 // n-weighted rms of the per-quake scatters (per-quake curve) or the pooled scatter (common curve)
	N, Ex  int     // stations kept, set aside
	Hist   []int   // residuals, 1 s bins from −60 to +60 s (ends clipped)
	Dens   map[[2]int]int
}

const (
	histHalf = 60
	densDist = 2.0 // degrees per distance bin (0-200)
	densRes  = 1.0 // s per residual bin (−30 to +30)
)

func newPool() *poolFit {
	return &poolFit{PerQ: map[*Quake]float64{}, Hist: make([]int, 2*histHalf+1), Dens: map[[2]int]int{}}
}

func (p *poolFit) add(d, res float64) {
	i := int(math.Round(res)) + histHalf
	p.Hist[max(0, min(len(p.Hist)-1, i))]++
	if res >= -30 && res < 30 && d >= 0 && d < 200 {
		p.Dens[[2]int{int(d / densDist), int(math.Floor((res + 30) / densRes))}]++
	}
}

func (p *poolFit) obj() pyjson.Obj {
	var dens []any
	for i := 0; i < 100; i++ {
		for j := 0; j < 60; j++ {
			if n := p.Dens[[2]int{i, j}]; n > 0 {
				dens = append(dens, []any{i, j, n})
			}
		}
	}
	o := pyjson.Obj{{K: "rms", V: r2(p.RMS)}, {K: "n", V: p.N}, {K: "ex", V: p.Ex}, {K: "c", V: []any{r2(p.Centre[0]), r2(p.Centre[1])}}}
	if p.Shape != nil {
		o = append(o, pyjson.KV{K: "shape", V: floats(p.Shape, r4)})
	}
	return append(o, pyjson.KV{K: "hist", V: ints(p.Hist)}, pyjson.KV{K: "dens", V: dens})
}

// geom gives a quake's station distances from a candidate centre: the great
// circle (centre = lat, lon) or the straight line on the map (centre = x, y).
type geom struct {
	globe bool
	a, b  []float64 // lat, lon or x, y
}

func newGeom(q *Quake, globe bool, mapC [2]float64) geom {
	g := geom{globe: globe, a: make([]float64, len(q.P)), b: make([]float64, len(q.P))}
	for i, p := range q.P {
		if globe {
			g.a[i], g.b[i] = p.Lat, p.Lon
		} else {
			g.a[i], g.b[i] = seisreloc.AE(mapC[0], mapC[1], p.Lat, p.Lon)
		}
	}
	return g
}

func (g geom) dist(c [2]float64, out []float64) {
	if g.globe {
		s1, c1 := math.Sincos(c[0] * math.Pi / 180)
		for i := range g.a {
			s2, c2 := math.Sincos(g.a[i] * math.Pi / 180)
			sd, cd := math.Sincos((g.b[i] - c[1]) * math.Pi / 180)
			x, y := c2*sd, c1*s2-s1*c2*cd
			out[i] = math.Atan2(math.Hypot(x, y), s1*s2+c1*c2*cd) * 180 / math.Pi
		}
		return
	}
	for i := range g.a {
		out[i] = math.Hypot(c[0]-g.a[i], c[1]-g.b[i])
	}
}

// perQuake pools the per-quake fits (their own centre, cubic and exclusions).
func perQuake(qs []*Quake, pick func(*Quake) *seisreloc.Fit, globe bool, mapC [2]float64) *poolFit {
	p := newPool()
	p.Centre = mapC
	num, den := 0.0, 0
	for _, q := range qs {
		f := pick(q)
		g := newGeom(q, globe, mapC)
		D := make([]float64, len(q.P))
		g.dist(f.Centre, D)
		for i := range q.P {
			if !f.Keep[i] {
				p.Ex++
				continue
			}
			u := D[i] / 100
			res := q.P[i].T - (f.Coef[0] + f.Coef[1]*u + f.Coef[2]*u*u + f.Coef[3]*u*u*u)
			p.add(D[i], res)
		}
		p.PerQ[q] = f.SD
		p.N += f.N
		num += float64(f.N) * f.SD * f.SD
		den += f.N
	}
	p.RMS = math.Sqrt(num / float64(den))
	return p
}

func shapeAt(s []float64, d float64) float64 {
	u := d / 100
	return s[0]*u + s[1]*u*u + s[2]*u*u*u
}

// qstate is one quake inside the common fit.
type qstate struct {
	g      geom
	t      []float64
	keep   []bool
	centre [2]float64
	c0     float64
	ss     float64
	n      int
	D      []float64
}

// ssAt is the quake's sum of squares at centre c with the shape held, c0 its best value.
func (s *qstate) ssAt(c [2]float64, shape []float64, D []float64) (float64, float64) {
	s.g.dist(c, D)
	sum, n := 0.0, 0
	for i, k := range s.keep {
		if k {
			sum += s.t[i] - shapeAt(shape, D[i])
			n++
		}
	}
	c0 := sum / float64(n)
	ss := 0.0
	for i, k := range s.keep {
		if k {
			r := s.t[i] - shapeAt(shape, D[i]) - c0
			ss += r * r
		}
	}
	return ss, c0
}

func (s *qstate) place(shape []float64, steps [][2]float64) {
	D := make([]float64, len(s.t))
	for _, st := range steps {
		best, bc, bc0 := math.Inf(1), s.centre, s.c0
		for a := -st[0]; a <= st[0]+1e-9; a += st[1] {
			for b := -st[0]; b <= st[0]+1e-9; b += st[1] {
				c := [2]float64{s.centre[0] + a, s.centre[1] + b}
				if s.g.globe && math.Abs(c[0]) >= 89.9 {
					continue
				}
				if ss, c0 := s.ssAt(c, shape, D); ss < best {
					best, bc, bc0 = ss, c, c0
				}
			}
		}
		s.centre, s.c0 = bc, bc0
	}
	// the owner's rule: one at a time beyond 3 SD of the OTHERS (dof: c0 and the centre)
	for {
		ss, c0 := s.ssAt(s.centre, shape, D)
		s.c0 = c0
		n := 0
		for _, k := range s.keep {
			if k {
				n++
			}
		}
		jmax, zmax := -1, 0.0
		for i, k := range s.keep {
			if !k {
				continue
			}
			r := s.t[i] - shapeAt(shape, D[i]) - c0
			sd := math.Sqrt(math.Max(ss-r*r, 0) / float64(max(1, n-1-3)))
			if z := math.Abs(r) / sd; sd > 0 && z > zmax {
				jmax, zmax = i, z
			}
		}
		if zmax <= seisreloc.K || n <= MinP/2 {
			s.ss, s.n, s.D = ss, n, D
			return
		}
		s.keep[jmax] = false
	}
}

// fitShape solves the common c1..c3 by least squares, quake means removed.
func fitShape(st []*qstate) []float64 {
	var A [3][3]float64
	var B [3]float64
	for _, s := range st {
		var mu [3]float64
		mt, n := 0.0, 0
		for i, k := range s.keep {
			if k {
				u := s.D[i] / 100
				mu[0] += u
				mu[1] += u * u
				mu[2] += u * u * u
				mt += s.t[i]
				n++
			}
		}
		for j := range mu {
			mu[j] /= float64(n)
		}
		mt /= float64(n)
		for i, k := range s.keep {
			if !k {
				continue
			}
			u := s.D[i] / 100
			x := [3]float64{u - mu[0], u*u - mu[1], u*u*u - mu[2]}
			y := s.t[i] - mt
			for a := 0; a < 3; a++ {
				for b := 0; b < 3; b++ {
					A[a][b] += x[a] * x[b]
				}
				B[a] += x[a] * y
			}
		}
	}
	// Gaussian elimination with partial pivoting
	for j := 0; j < 3; j++ {
		p := j
		for i := j + 1; i < 3; i++ {
			if math.Abs(A[i][j]) > math.Abs(A[p][j]) {
				p = i
			}
		}
		A[p], A[j] = A[j], A[p]
		B[p], B[j] = B[j], B[p]
		for i := j + 1; i < 3; i++ {
			f := A[i][j] / A[j][j]
			for k := j; k < 3; k++ {
				A[i][k] -= f * A[j][k]
			}
			B[i] -= f * B[j]
		}
	}
	x := make([]float64, 3)
	for j := 2; j >= 0; j-- {
		s := B[j]
		for k := j + 1; k < 3; k++ {
			s -= A[j][k] * x[k]
		}
		x[j] = s / A[j][j]
	}
	return x
}

// common fits one curve for every quake: per quake only the centre and c0.
func common(qs []*Quake, globe bool, mapC [2]float64, start func(*Quake) ([2]float64, []bool)) *poolFit {
	st := make([]*qstate, len(qs))
	for i, q := range qs {
		c, keep := start(q)
		t := make([]float64, len(q.P))
		for k, p := range q.P {
			t[k] = p.T
		}
		s := &qstate{g: newGeom(q, globe, mapC), t: t, keep: append([]bool(nil), keep...), centre: c, D: make([]float64, len(t))}
		s.g.dist(c, s.D)
		st[i] = s
	}
	shape := fitShape(st)
	first := [][2]float64{{3, 0.25}, {0.3, 0.03}}
	if !globe {
		first = [][2]float64{{10, 1}, {1, 0.1}, {0.12, 0.02}}
	}
	later := [][2]float64{{0.5, 0.05}, {0.06, 0.01}}
	prev := math.Inf(1)
	for it := 0; it < 12; it++ {
		steps := later
		if it == 0 {
			steps = first
		}
		parallel(len(st), func(i int) { st[i].place(shape, steps) })
		shape = fitShape(st)
		ss, n := 0.0, 0
		for _, s := range st {
			ss += s.ss
			n += s.n
		}
		if math.Abs(prev-ss) < 1e-4*ss {
			break
		}
		prev = ss
	}
	// final state with the final shape
	parallel(len(st), func(i int) { st[i].place(shape, [][2]float64{{0.06, 0.01}}) })
	p := newPool()
	p.Centre, p.Shape = mapC, shape
	ss := 0.0
	for i, s := range st {
		for k, keep := range s.keep {
			if !keep {
				p.Ex++
				continue
			}
			p.add(s.D[k], s.t[k]-shapeAt(shape, s.D[k])-s.c0)
		}
		p.PerQ[qs[i]] = math.Sqrt(s.ss / float64(max(1, s.n-3)))
		ss += s.ss
		p.N += s.n
	}
	p.RMS = math.Sqrt(ss / float64(p.N-3*len(st)-3))
	return p
}

// pooled runs the six pooled fits.
func (r *Result) pooled(progress func(string)) {
	qs := r.pq()
	pole := [2]float64{90, 0}
	r.PerQ = map[string]*poolFit{
		"globe": perQuake(qs, func(q *Quake) *seisreloc.Fit { return q.G }, true, pole),
		"pole":  perQuake(qs, func(q *Quake) *seisreloc.Fit { return q.FNP }, false, pole),
		"best":  perQuake(qs, func(q *Quake) *seisreloc.Fit { return q.FBest }, false, r.Best),
	}
	from := func(pick func(*Quake) *seisreloc.Fit) func(*Quake) ([2]float64, []bool) {
		return func(q *Quake) ([2]float64, []bool) { f := pick(q); return f.Centre, f.Keep }
	}
	r.Common = map[string]*poolFit{
		"globe": common(qs, true, pole, from(func(q *Quake) *seisreloc.Fit { return q.G })),
	}
	progress(fmt.Sprintf("common globe %.2f s", r.Common["globe"].RMS))
	r.Common["pole"] = common(qs, false, pole, from(func(q *Quake) *seisreloc.Fit { return q.FNP }))
	progress(fmt.Sprintf("common pole %.2f s", r.Common["pole"].RMS))
	var best *poolFit
	for _, c := range r.topCentres(TopMaps) {
		c := c
		var p *poolFit
		if c == r.Best {
			p = common(qs, false, c, from(func(q *Quake) *seisreloc.Fit { return q.FBest }))
		} else { // start from this map's own per-quake fits, as for the best map
			fs := make([]*seisreloc.Fit, len(qs))
			idx := map[*Quake]int{}
			parallel(len(qs), func(i int) {
				all := make([]bool, len(qs[i].P))
				for k := range all {
					all[k] = true
				}
				fs[i], _ = seisreloc.FlatFit(qs[i].P, all, c, qs[i].G.Centre, true)
			})
			for i, q := range qs {
				idx[q] = i
			}
			p = common(qs, false, c, from(func(q *Quake) *seisreloc.Fit { return fs[idx[q]] }))
		}
		progress(fmt.Sprintf("common map %v %.2f s", c, p.RMS))
		if best == nil || p.RMS < best.RMS {
			best = p
		}
	}
	r.Common["best"] = best
	r.Log = append(r.Log, fmt.Sprintf("P: %d quakes, %d stations; per-quake globe %.2f s, pole %.2f, best map %v %.2f; common globe %.2f, pole %.2f, best %v %.2f",
		len(qs), r.PerQ["globe"].N, r.PerQ["globe"].RMS, r.PerQ["pole"].RMS, r.Best, r.PerQ["best"].RMS,
		r.Common["globe"].RMS, r.Common["pole"].RMS, best.Centre, best.RMS))
}
