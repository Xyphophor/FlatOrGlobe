// Package aviamesh builds src/data/presets/avia-mesh.js (2026-11-25): the airline mesh of the avia tab redone by the
// method of the earthquake mesh (seismesh): positions FREE, no coordinate, no distance, no radius; only the airborne
// times of the round trips.
//
// Each route with flights both ways is one edge, its time h = the mean of the two directions' medians (the wind, mostly,
// cancels; the same h as the tab's routeStats). One law for every route,
//
//	h = c0 + d,
//
// c0 the time spent climbing and descending (free), d the length of the route in the mesh's own unit: the distance
// flown in one hour at the speed of the law. A kilometre never enters; km = v x d, v a speed, and the one speed that
// carries no radius is the true airspeed the airlines file (from Mach and temperature, through the air).
//
// Why not the earthquakes' method as it stands (every node free in three dimensions): 127 routes between 32 airports
// (85 until 2026-11-25), some airports with one route, do not fix 32 points in space well: the free cloud is not
// round and the search stalls. Both surfaces get two numbers per airport instead, and they differ by ONE number:
//
//	plane:   d = |x_a - x_b|, x in the plane;
//	sphere:  d = R ω_ab, ω the angle between the airports seen from the centre, R free (a sphere of any size;
//	         R -> infinity is the plane again).
//
// Both are fitted from random starts (Adam descent), the same number for each, the best kept: both have local minima
// (some airports end up folded the wrong way round). The page plays the winning start of each.
//
// Every route is kept for the result. The 3-sigma rule (clip) is run as a check of R only: on model residuals it removes
// what each model fits worst (the plane its southern routes; the sphere the Europe-Japan and Europe-Hong Kong routes,
// whose times measure the detour round Russian airspace, closed since 2022).
//
// A check only, after the fit: the airports' published coordinates, aligned by the best rotation (seismesh.AlignRot),
// give each airport's angular error. An airport whose routes another place fits almost as well (Ambiguity, from the
// times alone) is not fixed: left out of the alignment and drawn hollow (one route: a swing; EZE: a fold).
package aviamesh

import (
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"sort"
	"strconv"

	"flatorglobe/tools/internal/build/aviaflights"
	"flatorglobe/tools/internal/build/seismesh"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Out    = "src/data/presets/avia-mesh.js"
	Starts = 100  // random starts per surface
	Iters  = 4000 // descent per start
	Polish = 6000 // more steps for the winner
	every  = 100  // frame step of the replayed winner
	KSigma = 3    // the site's outlier rule
	// AmbK: an airport's place is fixed if every place more than 20° from it misfits its routes (rms, the other
	// airports held) by more than AmbK times the whole mesh's rms
	AmbK = 2
)

// Edge is one round-trip route: airports A, B, mean airborne time H (hours).
type Edge struct {
	A, B int
	H    float64
}

// Frame is one recorded step of a descent.
type Frame struct {
	It     int
	Stress float64 // rms of the time residuals, minutes
	R      float64 // sphere only
	N      int     // airports placed so far (the growth), all of them during the polish
	X      [][]float64
}

// Fit is the best of the random starts on one surface.
type Fit struct {
	Seed              int64
	Stress            float64
	C0, R             float64
	X                 [][]float64 // plane: 2D; sphere: 3D on the sphere of radius R
	Frames            []Frame
	All               []float64 // the stress of every start, sorted
	Near              int       // random starts within 1 minute of their best
	Random            float64   // the best of the random starts alone
	Order             []int     // the order in which the growth placed the airports
	Out               []bool    // routes the 3-sigma rule would set aside (clip; robustness check only)
	ClipStress, ClipR float64
	Mirror            bool
	Rot               [3][3]float64
	Vs                float64 // rms angular error after the best rotation, degrees (check)
}

// Result of Compute.
type Result struct {
	Codes    []string
	Lat, Lon []float64
	Deg      []int
	E        []Edge
	TAS      float64 // median filed true airspeed, km/h
	NTas     int
	Plane    Fit
	Sphere   Fit
	Free3    struct{ Stress, Rel float64 }
	Amb      []float64 // per airport: second-best place's misfit over the best's (Ambiguity)
	Log      []string
}

func median(v []float64) float64 {
	s := append([]float64(nil), v...)
	sort.Float64s(s)
	n := len(s)
	if n == 0 {
		return math.NaN()
	}
	if n%2 == 1 {
		return s[n/2]
	}
	return (s[n/2-1] + s[n/2]) / 2
}

func get(o pyjson.Obj, k string) any {
	for _, kv := range o {
		if kv.K == k {
			return kv.V
		}
	}
	return nil
}

// Compute reads the flights (aviaflights.Compute: the same kept flights as the tab) and fits both surfaces.
func Compute(root string) (*Result, error) {
	af, err := aviaflights.Compute(root)
	if err != nil {
		return nil, err
	}
	r := &Result{}
	idx := map[string]int{}
	node := func(c string) (int, error) {
		if i, ok := idx[c]; ok {
			return i, nil
		}
		lat, lon, err := af.Coord(c)
		if err != nil {
			return 0, err
		}
		idx[c] = len(r.Codes)
		r.Codes = append(r.Codes, c)
		r.Lat, r.Lon = append(r.Lat, lat), append(r.Lon, lon)
		r.Deg = append(r.Deg, 0)
		return idx[c], nil
	}
	var tas []float64
	for _, rec := range af.Recs {
		ab, _ := get(rec, "ab").([]float64)
		ba, _ := get(rec, "ba").([]float64)
		if len(ab) == 0 || len(ba) == 0 {
			continue
		}
		a, err := node(get(rec, "a").(string))
		if err != nil {
			return nil, err
		}
		b, err := node(get(rec, "b").(string))
		if err != nil {
			return nil, err
		}
		r.E = append(r.E, Edge{a, b, (median(ab) + median(ba)) / 2})
		r.Deg[a]++
		r.Deg[b]++
		if p, ok := get(rec, "plan").(pyjson.Obj); ok {
			if t, ok := get(p, "tas").(json.Number); ok {
				if kn, err := strconv.ParseFloat(string(t), 64); err == nil && kn > 0 {
					tas = append(tas, kn*1.852)
				}
			} else if s, ok := get(p, "tas").(string); ok {
				if kn, err := strconv.ParseFloat(s, 64); err == nil && kn > 0 {
					tas = append(tas, kn*1.852)
				}
			}
		}
	}
	r.TAS, r.NTas = median(tas), len(tas)
	n := len(r.Codes)
	loc := make([][2]float64, n)
	for i := range loc {
		loc[i] = [2]float64{r.Lat[i], r.Lon[i]}
	}
	r.Plane = best(r.E, n, false)
	r.Sphere = best(r.E, n, true)
	// the check, on the airports the times can fix: an airport with one route turns freely about its neighbour, one
	// whose routes all go one way can fold across them (EZE: Frankfurt and Amsterdam, almost one direction); they would
	// turn the alignment, so they are left out of it. Decided by the times alone (Ambiguity), not by the coordinates.
	s := &r.Sphere
	r.Amb = Ambiguity(r.E, *s)
	var fx [][]float64
	var fl [][2]float64
	for i := 0; i < n; i++ {
		if r.Amb[i] > AmbK*s.Stress {
			fx, fl = append(fx, s.X[i]), append(fl, loc[i])
		}
	}
	s.Vs, s.Mirror = seismesh.AlignError(fx, fl)
	sg := 1.0
	if s.Mirror {
		sg = -1
	}
	_, s.Rot = seismesh.AlignRot(fx, fl, sg)
	r.Free3.Stress, r.Free3.Rel = free3(r.E, n)
	r.Log = []string{fmt.Sprintf("%d airports, %d routes; plane grown %.1f min, random best %.1f (%d/%d within 1 min); sphere grown %.1f min R %.3f u = %.0f km at %.0f km/h, random best %.1f (%d/%d); free 3D %.1f min, radial %.2f; %.2f deg to the real positions",
		n, len(r.E), r.Plane.Stress, r.Plane.Random, r.Plane.Near, Starts, r.Sphere.Stress, s.R, s.R*r.TAS, r.TAS, s.Random, s.Near, Starts, r.Free3.Stress, r.Free3.Rel, s.Vs)}
	return r, nil
}

// state of a descent: positions P (n x k), c0, log R.
type state struct {
	k      int
	sphere bool
	P      [][]float64
	c0, lR float64
}

func (s *state) d(a, b int) float64 {
	if !s.sphere {
		return dist(s.P[a], s.P[b])
	}
	return math.Exp(s.lR) * angle(s.P[a], s.P[b])
}

func stress(E []Edge, s *state) float64 {
	var q float64
	for _, e := range E {
		r := e.H - s.c0 - s.d(e.A, e.B)
		q += r * r
	}
	return math.Sqrt(q/float64(len(E))) * 60
}

func dist(a, b []float64) float64 {
	var q float64
	for i := range a {
		q += (a[i] - b[i]) * (a[i] - b[i])
	}
	return math.Sqrt(q)
}

func angle(a, b []float64) float64 {
	cx := a[1]*b[2] - a[2]*b[1]
	cy := a[2]*b[0] - a[0]*b[2]
	cz := a[0]*b[1] - a[1]*b[0]
	return math.Atan2(math.Sqrt(cx*cx+cy*cy+cz*cz), a[0]*b[0]+a[1]*b[1]+a[2]*b[2])
}

func start(n int, sphere bool, rng *rand.Rand) *state {
	s := &state{sphere: sphere, c0: 0.6}
	if sphere {
		s.k = 3
		s.lR = math.Log(3 + 17*rng.Float64())
		for i := 0; i < n; i++ {
			v := []float64{rng.NormFloat64(), rng.NormFloat64(), rng.NormFloat64()}
			l := math.Sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
			s.P = append(s.P, []float64{v[0] / l, v[1] / l, v[2] / l})
		}
		return s
	}
	s.k = 2
	for i := 0; i < n; i++ {
		s.P = append(s.P, []float64{4 * rng.NormFloat64(), 4 * rng.NormFloat64()})
	}
	return s
}

// descend: Adam on positions, c0 and (sphere) log R; on the sphere the positions are put back on the unit sphere after
// every step. frame(it) every `every` steps when not nil.
func descend(E []Edge, s *state, iters int, lr float64, frame func(it int)) {
	n, k := len(s.P), s.k
	np := n*k + 2
	p := make([]float64, np)
	m1, m2 := make([]float64, np), make([]float64, np)
	for i := range s.P {
		copy(p[i*k:], s.P[i])
	}
	p[n*k], p[n*k+1] = s.c0, s.lR
	for it := 1; it <= iters; it++ {
		g := make([]float64, np)
		R := math.Exp(p[n*k+1])
		for _, e := range E {
			a, b := p[e.A*k:e.A*k+k], p[e.B*k:e.B*k+k]
			if !s.sphere {
				u := math.Max(dist(a, b), 1e-9)
				r := e.H - p[n*k] - u
				for c := 0; c < k; c++ {
					gx := -2 * r * (a[c] - b[c]) / u
					g[e.A*k+c] += gx
					g[e.B*k+c] -= gx
				}
				g[n*k] += -2 * r / float64(len(E))
				continue
			}
			w := angle(a, b)
			r := e.H - p[n*k] - R*w
			sw, cw := math.Max(math.Sin(w), 1e-9), math.Cos(w)
			for _, pr := range [][3]int{{e.A, e.B, 0}, {e.B, e.A, 0}} {
				X, O := p[pr[0]*k:pr[0]*k+k], p[pr[1]*k:pr[1]*k+k]
				var gw [3]float64
				var dt float64
				for c := 0; c < 3; c++ {
					gw[c] = -(O[c] - cw*X[c]) / sw
					dt += gw[c] * X[c]
				}
				for c := 0; c < 3; c++ {
					g[pr[0]*k+c] += -2 * r * R * (gw[c] - dt*X[c])
				}
			}
			g[n*k] += -2 * r / float64(len(E))
			g[n*k+1] += -2 * r * R * w / float64(len(E))
		}
		st := lr * math.Pow(0.9995, float64(it))
		for i := range p {
			m1[i] = 0.9*m1[i] + 0.1*g[i]
			m2[i] = 0.999*m2[i] + 0.001*g[i]*g[i]
			mh := m1[i] / (1 - math.Pow(0.9, float64(it)))
			vh := m2[i] / (1 - math.Pow(0.999, float64(it)))
			sc := st
			if i >= n*k {
				sc = st * 0.1
			}
			p[i] -= sc * mh / (math.Sqrt(vh) + 1e-9)
		}
		if s.sphere {
			for i := 0; i < n; i++ {
				v := p[i*3 : i*3+3]
				l := math.Sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
				v[0], v[1], v[2] = v[0]/l, v[1]/l, v[2]/l
			}
		}
		for i := range s.P {
			copy(s.P[i], p[i*k:i*k+k])
		}
		s.c0, s.lR = p[n*k], p[n*k+1]
		if frame != nil && it%every == 0 {
			frame(it)
		}
	}
}

func lrOf(sphere bool) float64 {
	if sphere {
		return 0.01
	}
	return 0.02
}

// randomBest: Starts random starts on one surface, each descended Iters steps; their stresses (sorted) and the best.
func randomBest(E []Edge, n int, sphere bool) ([]float64, *state) {
	all := make([]float64, Starts)
	var bs *state
	for i := 0; i < Starts; i++ {
		s := start(n, sphere, rand.New(rand.NewSource(int64(1000+i))))
		descend(E, s, Iters, lrOf(sphere), nil)
		all[i] = stress(E, s)
		if bs == nil || all[i] < stress(E, bs) {
			bs = s
		}
	}
	sort.Float64s(all)
	return all, bs
}

// best: the growth (grow), which the page plays, against the best of the random starts, each cleaned by the 3-sigma
// rule (clip); the lower stress is the surface's result, so that neither search is given to one surface only.
func best(E []Edge, n int, sphere bool) Fit {
	f := grow(E, n, sphere)
	// the 3-sigma rule, as a robustness check only: on model residuals it removes what each model fits worst (the
	// plane its southern routes, the sphere the detours round closed airspace), so the result keeps every route
	c := f
	c.Frames = append([]Frame(nil), f.Frames...)
	f.Out = clip(E, &c, sphere, false)
	f.ClipStress, f.ClipR = c.Stress, c.R
	all, bs := randomBest(E, n, sphere)
	descend(E, bs, Polish, lrOf(sphere)*0.2, nil)
	f.All, f.Random = all, stress(E, bs)
	for _, v := range all {
		if v <= stress(E, bs)+1 {
			f.Near++
		}
	}
	return f
}

func fitOf(s *state, sphere bool) Fit {
	f := Fit{C0: s.c0, R: math.Exp(s.lR)}
	for _, x := range s.P {
		v := append([]float64(nil), x...)
		if sphere {
			for c := range v {
				v[c] *= f.R
			}
		}
		f.X = append(f.X, v)
	}
	return f
}

func stateOf(f *Fit, sphere bool) *state {
	s := &state{sphere: sphere, c0: f.C0, k: 2}
	if sphere {
		s.k, s.lR = 3, math.Log(f.R)
	}
	for _, x := range f.X {
		v := append([]float64(nil), x...)
		if sphere {
			l := math.Sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
			for c := range v {
				v[c] /= l
			}
		}
		s.P = append(s.P, v)
	}
	return s
}

// clip: the site's rule for outliers, on the routes of one surface with that surface's own residuals: the route
// whose time residual is more than KSigma standard deviations (of the OTHER routes, floor 1 min) from their mean is
// set aside, the surface refitted, and again until none is. No coordinate enters (the residuals are the fit's). Routes
// whose times measure a detour rather than a distance (Europe-Japan round Russian airspace, closed since 2022) fall
// out this way. Returns the routes set aside; f is updated (and, if frames, given the refit's last frame).
func clip(E []Edge, f *Fit, sphere, frames bool) []bool {
	out := make([]bool, len(E))
	s := stateOf(f, sphere)
	kept := func() []Edge {
		var o []Edge
		for i, e := range E {
			if !out[i] {
				o = append(o, e)
			}
		}
		return o
	}
	for round := 0; round < 40; round++ {
		var idx []int
		var res []float64
		for i, e := range E {
			if !out[i] {
				idx = append(idx, i)
				res = append(res, (e.H-s.c0-s.d(e.A, e.B))*60)
			}
		}
		worst, wv := -1, 0.0
		for j, x := range res {
			var m, q float64
			for l, y := range res {
				if l != j {
					m += y
				}
			}
			m /= float64(len(res) - 1)
			for l, y := range res {
				if l != j {
					q += (y - m) * (y - m)
				}
			}
			sd := math.Max(1, math.Sqrt(q/float64(len(res)-2)))
			if z := math.Abs(x-m) / sd; z > KSigma && z > wv {
				worst, wv = idx[j], z
			}
		}
		if worst < 0 {
			break
		}
		out[worst] = true
		descend(kept(), s, Polish/3, lrOf(sphere)*0.2, nil)
	}
	g := fitOf(s, sphere)
	f.X, f.C0, f.R, f.Stress = g.X, g.C0, g.R, stress(kept(), s)
	if frames {
		last := f.Frames[len(f.Frames)-1]
		f.Frames = append(f.Frames, Frame{It: last.It + 1, Stress: f.Stress, R: f.R, N: n0(f), X: f.X})
	}
	return out
}

func n0(f *Fit) int { return len(f.X) }

// grow builds the mesh airport by airport (as a surveyor extends a triangulation): the four airports with the most
// routes first (the best of 30 random starts on their routes alone), then, again and again, the airport with the most
// routes to those already placed, put at the best of a set of candidate places (sphere: 4,000 points spread evenly
// over it; plane: a 161 x 161 grid over the placed airports and beyond) and every placed airport refitted. Then the
// whole mesh is polished. The same procedure for both surfaces; only the times enter.
func grow(E []Edge, n int, sphere bool) Fit {
	deg := make([]int, n)
	for _, e := range E {
		deg[e.A]++
		deg[e.B]++
	}
	order := make([]int, n)
	for i := range order {
		order[i] = i
	}
	sort.SliceStable(order, func(a, b int) bool { return deg[order[a]] > deg[order[b]] })
	placed := make([]bool, n)
	sub := func() []Edge {
		var o []Edge
		for _, e := range E {
			if placed[e.A] && placed[e.B] {
				o = append(o, e)
			}
		}
		return o
	}
	var f Fit
	for _, i := range order[:4] {
		placed[i] = true
		f.Order = append(f.Order, i)
	}
	var s *state
	{
		es := sub()
		for t := 0; t < 30; t++ {
			w := start(n, sphere, rand.New(rand.NewSource(int64(77+t))))
			descend(es, w, 2000, lrOf(sphere), nil)
			if s == nil || stress(es, w) < stress(es, s) {
				s = w
			}
		}
	}
	for i := range s.P { // the airports not yet placed sit at one point (no route: no force), out of the drawing
		if !placed[i] {
			if sphere {
				s.P[i] = []float64{0, 0, 1}
			} else {
				s.P[i] = []float64{0, 0}
			}
		}
	}
	snap := func(it int, N int) {
		fr := Frame{It: it, Stress: stress(sub(), s), R: math.Exp(s.lR), N: N}
		for _, x := range s.P {
			v := append([]float64(nil), x...)
			if sphere {
				for c := range v {
					v[c] *= fr.R
				}
			}
			fr.X = append(fr.X, v)
		}
		f.Frames = append(f.Frames, fr)
	}
	snap(0, 4)
	for len(f.Order) < n {
		bi, bn := -1, -1
		for i := 0; i < n; i++ {
			if placed[i] {
				continue
			}
			m := 0
			for _, e := range E {
				if (e.A == i && placed[e.B]) || (e.B == i && placed[e.A]) {
					m++
				}
			}
			if m > bn || (m == bn && deg[i] > deg[bi]) {
				bi, bn = i, m
			}
		}
		var es []Edge
		for _, e := range E {
			if (e.A == bi && placed[e.B]) || (e.B == bi && placed[e.A]) {
				es = append(es, e)
			}
		}
		s.P[bi] = placeOne(es, bi, s)
		placed[bi] = true
		f.Order = append(f.Order, bi)
		descend(sub(), s, 1500, lrOf(sphere), nil)
		snap(len(f.Order), len(f.Order))
	}
	k := 0
	descend(E, s, Polish, lrOf(sphere)*0.5, func(it int) {
		if it%(Polish/6) == 0 {
			k++
			snap(n+k, n)
		}
	})
	last := f.Frames[len(f.Frames)-1]
	f.Stress, f.C0, f.R, f.X = last.Stress, s.c0, last.R, last.X
	return f
}

// placeOne: the best candidate place for airport i given its routes es to placed airports, the law held.
func placeOne(es []Edge, i int, s *state) []float64 {
	cost := func(p []float64) float64 {
		var q float64
		for _, e := range es {
			o := e.A
			if o == i {
				o = e.B
			}
			var d float64
			if s.sphere {
				d = math.Exp(s.lR) * angle(p, s.P[o])
			} else {
				d = dist(p, s.P[o])
			}
			r := e.H - s.c0 - d
			q += r * r
		}
		return q
	}
	var bp []float64
	bc := math.Inf(1)
	try := func(p []float64) {
		if c := cost(p); c < bc {
			bc, bp = c, p
		}
	}
	if s.sphere {
		const m = 4000
		for j := 0; j < m; j++ {
			z := 1 - 2*(float64(j)+0.5)/m
			r := math.Sqrt(1 - z*z)
			a := float64(j) * 2.399963229728653
			try([]float64{r * math.Cos(a), r * math.Sin(a), z})
		}
		return bp
	}
	ext := 5.0
	for _, e := range es {
		for _, o := range []int{e.A, e.B} {
			if o != i {
				ext = math.Max(ext, math.Max(math.Abs(s.P[o][0]), math.Abs(s.P[o][1])))
			}
		}
	}
	ext = ext*1.5 + 5
	for a := -80; a <= 80; a++ {
		for b := -80; b <= 80; b++ {
			try([]float64{float64(a) / 80 * ext, float64(b) / 80 * ext})
		}
	}
	return bp
}

// free3: the earthquakes' method as it stands, for the record: every airport free in three dimensions, the straight
// distance, the same cubic law (seismesh.Model), classical-MDS start. It fits, and the cloud is not round.
func free3(E []Edge, n int) (float64, float64) {
	rng := rand.New(rand.NewSource(1))
	best := math.Inf(1)
	var rel float64
	for t := 0; t < Starts; t++ {
		X := make([][]float64, n)
		for i := range X {
			X[i] = []float64{4 * rng.NormFloat64(), 4 * rng.NormFloat64(), 4 * rng.NormFloat64()}
		}
		c0, c2, c3 := 0.6, 0.0, 0.0
		np := 3*n + 3
		p := make([]float64, np)
		m1, m2 := make([]float64, np), make([]float64, np)
		for i := range X {
			copy(p[3*i:], X[i])
		}
		p[3*n], p[3*n+1], p[3*n+2] = c0, c2, c3
		for it := 1; it <= Iters; it++ {
			gr := make([]float64, np)
			for _, e := range E {
				a, b := p[3*e.A:3*e.A+3], p[3*e.B:3*e.B+3]
				u := math.Max(dist(a, b), 1e-9)
				q2, q3 := p[3*n+1], p[3*n+2]
				r := e.H - p[3*n] - u - q2*u*u - q3*u*u*u
				dg := 1 + 2*q2*u + 3*q3*u*u
				for c := 0; c < 3; c++ {
					gx := -2 * r * dg * (a[c] - b[c]) / u
					gr[3*e.A+c] += gx
					gr[3*e.B+c] -= gx
				}
				gr[3*n] += -2 * r / float64(len(E))
				gr[3*n+1] += -2 * r * u * u / float64(len(E))
				gr[3*n+2] += -2 * r * u * u * u / float64(len(E))
			}
			st := 0.02 * math.Pow(0.9995, float64(it))
			for i := range p {
				m1[i] = 0.9*m1[i] + 0.1*gr[i]
				m2[i] = 0.999*m2[i] + 0.001*gr[i]*gr[i]
				mh := m1[i] / (1 - math.Pow(0.9, float64(it)))
				vh := m2[i] / (1 - math.Pow(0.999, float64(it)))
				sc := st
				if i >= 3*n {
					sc = st * 0.01
				}
				p[i] -= sc * mh / (math.Sqrt(vh) + 1e-9)
			}
		}
		var q float64
		for _, e := range E {
			u := dist(p[3*e.A:3*e.A+3], p[3*e.B:3*e.B+3])
			r := e.H - p[3*n] - u - p[3*n+1]*u*u - p[3*n+2]*u*u*u
			q += r * r
		}
		if v := math.Sqrt(q/float64(len(E))) * 60; v < best {
			best = v
			pts := make([][]float64, n)
			for i := range pts {
				pts[i] = append([]float64(nil), p[3*i:3*i+3]...)
			}
			_, _, rel = seismesh.SphereFit(pts)
		}
		if t >= 19 { // twenty starts are enough for the record
			break
		}
	}
	return best, rel
}

func ints(v []int) []any {
	o := make([]any, len(v))
	for i, x := range v {
		o[i] = x
	}
	return o
}

func r2(x float64) float64 { return pyjson.Round(x, 2) }
func r3(x float64) float64 { return pyjson.Round(x, 3) }

func flat(P [][]float64, mir bool) []any {
	var o []any
	for _, v := range P {
		for c, x := range v {
			if mir && c == 2 {
				x = -x
			}
			o = append(o, r3(x))
		}
	}
	return o
}

// File is the preset: AVIA_MESH. Every frame of both surfaces in ONE 3D frame: the sphere about its centre (z flipped
// if the winner is a mirror image), the plane as the sheet z = R (tangent to the final sphere at its top), centred.
func (r *Result) File() preset.File {
	pl, sp := r.Plane, r.Sphere
	var cx, cy float64
	fin := pl.Frames[len(pl.Frames)-1].X
	for _, x := range fin {
		cx += x[0] / float64(len(fin))
		cy += x[1] / float64(len(fin))
	}
	frames := func(F []Frame, plane bool) []any {
		var o []any
		for _, f := range F {
			P := f.X
			if plane {
				P = make([][]float64, len(f.X))
				for i, x := range f.X {
					P[i] = []float64{x[0] - cx, x[1] - cy, sp.R}
				}
			}
			kv := pyjson.Obj{{K: "it", V: f.It}, {K: "n", V: f.N}, {K: "stress", V: r2(f.Stress)}}
			if !plane {
				kv = append(kv, pyjson.KV{K: "R", V: r3(f.R)})
			}
			o = append(o, append(kv, pyjson.KV{K: "st", V: flat(P, !plane && sp.Mirror)}))
		}
		return o
	}
	rounded := func(v []float64) []any {
		var o []any
		for _, x := range v {
			o = append(o, r2(x))
		}
		return o
	}
	var rot []any
	for a := 0; a < 3; a++ {
		for b := 0; b < 3; b++ {
			rot = append(rot, pyjson.Round(sp.Rot[a][b], 6))
		}
	}
	var codes, lat, lon, deg, routes, hours []any
	for i, c := range r.Codes {
		codes = append(codes, c)
		lat = append(lat, pyjson.Round(r.Lat[i], 2))
		lon = append(lon, pyjson.Round(r.Lon[i], 2))
		deg = append(deg, r.Deg[i])
	}
	for _, e := range r.E {
		routes = append(routes, e.A, e.B)
		hours = append(hours, r3(e.H))
	}
	M := pyjson.Obj{
		{K: "airports", V: codes}, {K: "lat", V: lat}, {K: "lon", V: lon}, {K: "deg", V: deg}, {K: "routes", V: routes}, {K: "hours", V: hours},
		{K: "ambK", V: AmbK}, {K: "fixed", V: fixedList(r.Amb, AmbK*sp.Stress)}, {K: "tas", V: pyjson.Round(r.TAS, 1)}, {K: "nTas", V: r.NTas}, {K: "starts", V: Starts},
		{K: "plane", V: pyjson.Obj{{K: "stress", V: r2(pl.Stress)}, {K: "random", V: r2(pl.Random)}, {K: "c0", V: r3(pl.C0)}, {K: "near", V: pl.Near}, {K: "order", V: ints(pl.Order)}, {K: "out", V: outList(pl.Out)}, {K: "clip", V: r2(pl.ClipStress)}, {K: "all", V: rounded(pl.All)}, {K: "frames", V: frames(pl.Frames, true)}}},
		{K: "sphere", V: pyjson.Obj{{K: "stress", V: r2(sp.Stress)}, {K: "random", V: r2(sp.Random)}, {K: "c0", V: r3(sp.C0)}, {K: "R", V: r3(sp.R)}, {K: "near", V: sp.Near}, {K: "order", V: ints(sp.Order)}, {K: "out", V: outList(sp.Out)}, {K: "clip", V: r2(sp.ClipStress)}, {K: "clipR", V: r3(sp.ClipR)}, {K: "all", V: rounded(sp.All)},
			{K: "vs", V: r2(sp.Vs)}, {K: "mirror", V: sp.Mirror}, {K: "rot", V: rot}, {K: "frames", V: frames(sp.Frames, false)}}},
		{K: "free3", V: pyjson.Obj{{K: "stress", V: r2(r.Free3.Stress)}, {K: "rel", V: pyjson.Round(r.Free3.Rel, 3)}}},
	}
	body := "export const AVIA_MESH = " + pyjson.Dumps(M, pyjson.Opts{Item: ",", Key: ":", ASCII: true}) + ";\n"
	return preset.File{
		Out: Out, Command: "build avia-mesh", Inputs: []string{aviaflights.Routes, aviaflights.Dir + "/inputs.lock"},
		Notes: []string{
			"Shape from airborne times alone (the method of seis-mesh): every round-trip route one edge, h = c0 + d, the airports free",
			"on a plane, or on a sphere of free radius R, best of random starts each. Unit of length: the distance flown in one hour at",
			"the law's speed (no km in the fit); tas = median filed true airspeed (km/h). lat/lon and rot: the check and the drawing only.",
			"Method: go doc ./internal/build/aviamesh.",
		},
		Body: body,
	}
}

// Ambiguity: for each airport, with every other airport, c0 and R held at the final sphere, the rms misfit (minutes)
// of its routes at the best place more than 20° away from where the fit put it (4,000 places spread over the sphere).
// Small, the times allow a second place (a fold, as for EZE, whose Frankfurt and Amsterdam are almost one direction,
// or a swing about a single neighbour).
func Ambiguity(E []Edge, f Fit) []float64 {
	n := len(f.X)
	U := make([][]float64, n)
	for i, x := range f.X {
		l := math.Sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2])
		U[i] = []float64{x[0] / l, x[1] / l, x[2] / l}
	}
	const m = 4000
	C := make([][]float64, m)
	for j := 0; j < m; j++ {
		z := 1 - 2*(float64(j)+0.5)/m
		r := math.Sqrt(1 - z*z)
		a := float64(j) * 2.399963229728653
		C[j] = []float64{r * math.Cos(a), r * math.Sin(a), z}
	}
	out := make([]float64, n)
	for i := 0; i < n; i++ {
		var es []Edge
		for _, e := range E {
			if e.A == i || e.B == i {
				es = append(es, e)
			}
		}
		cost := func(p []float64) float64 {
			q := 0.0
			for _, e := range es {
				o := e.A
				if o == i {
					o = e.B
				}
				r := e.H - f.C0 - f.R*angle(p, U[o])
				q += r * r
			}
			return q
		}
		far := math.Inf(1)
		for _, p := range C {
			if angle(p, U[i]) > 20*math.Pi/180 {
				far = math.Min(far, cost(p))
			}
		}
		out[i] = math.Sqrt(far/float64(len(es))) * 60
	}
	return out
}

func outList(o []bool) []any {
	r := []any{}
	for i, v := range o {
		if v {
			r = append(r, i)
		}
	}
	return r
}

func fixedList(a []float64, lim float64) []any {
	o := make([]any, len(a))
	for i, v := range a {
		o[i] = v > lim
	}
	return o
}
