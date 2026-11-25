// Package seismesh builds src/data/presets/seis-mesh.js (2026-11-24): does a SHAPE emerge from earthquake travel times
// alone, with no coordinates, no radius and no Earth model?
//
// The mesh (the idea of the airline mesh of the avia tab, with another pure measure): the 262 shallow Mw >= 7 quakes of
// the seisbulk sample (ISC Bulletin, 2000-2023) and the stations that read P at least MinQuakes times of them. Every P
// reading is one edge, a time. Positions of all the nodes (quakes and stations) are FREE, in k = 2 (a plane) or k = 3
// dimensions, and are placed so that the times fit
//
//	T_qs / 100 s = c0_q + g(u_qs),  g(u) = u + c2 u² + c3 u³,  u_qs = |x_q - x_s|,
//
// c0_q a free origin time per quake (the bulletin's origin is a globe solution, not used), g one common law for every
// quake (the time of a P wave grows with the chord, not linearly: the faster deep rock; the law is free). The unit of
// length is fixed by g'(0) = 1: one unit is the distance covered in 100 s at the speed the law starts with. A kilometre
// never enters; km = 100 s x v0 x u, v0 the speed at the start of the law, the one number that ties the mesh to the
// Earth (and the quantity the original radius measurement used).
//
// Start (the same for k = 2 and k = 3, no coordinates): distances u from the times with a straight law, the missing
// station-to-station and quake-to-quake distances by shortest paths through the mesh (Isomap, Tenenbaum, de Silva &
// Langford 2000), classical MDS (Torgerson 1952) in k dimensions; then Adam descent on positions, origins and the law.
// Random starts stick in local minima (stress 40-50 s); this one does not.
//
// Reading: the stress (rms of the time residuals, seconds) of the plane against the 3D cloud, and how spherical the 3D
// cloud is (radial scatter of the stations about their best sphere). A check only, after the fit: the stations'
// published latitudes and longitudes, aligned by the best rotation and scale, give the rms angular distance to the
// fitted positions. The speed experiment: from the converged cloud, other speed laws (c2 shifted, or c2 = c3 = 0: a
// constant speed) are refitted with the law held, and a uniform change of v0 only scales every length.
package seismesh

import (
	"fmt"
	"math"
	"math/rand"
	"sort"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	MinQuakes = 120 // a station enters the mesh if it read P for this many quakes
	Out       = "src/data/presets/seis-mesh.js"
	frameStep = 250
	iters     = 8000
	hubs      = 8
)

// Result of Compute.
type Result struct {
	NQ, NS, NE   int
	Lat, Lon     []float64 // check only
	Init2, Init3 float64
	Frames       map[int][]Frame // k -> frames
	Final        map[int]*State
	Stress       map[int]float64
	Sphere       struct{ R, Rel, Vs float64 }
	Plane        struct{ R, Rel float64 }
	Variants     []Variant
	Centre       []float64     // the 3D cloud's sphere centre: every frame (plane ones too) is drawn about it
	Mirror       bool          // the 3D cloud is the mirror image of the Earth: z is flipped in the file (a mirror fits as well)
	AllNE        int           // readings of the full mesh, before the 3-sigma rule
	Rot          [3][3]float64 // best rotation of the (unmirrored) 3D cloud onto the real positions: drawing only
	HubS         [][]float64   // the hubs of the final 3D cloud slid radially onto its sphere (their radial place is free)
	Hub          []int         // quake indices of the hubs
	HubSt        [][]int       // the stations each hub read
	All          map[int]*Full // k -> every station that read MinAll quakes
	AllLatAll    []float64     // check only: every station's published position (core first)
	AllLonAll    []float64
	Log          []string
}

// Frame is one recorded step of a descent: stations' positions (centred on the final cloud's centre) and the hubs'.
type Frame struct {
	It     int
	Stress float64
	St     [][]float64
	Hub    [][]float64
}

// Variant is a speed law refitted from the converged 3D cloud.
type Variant struct {
	Tag      string
	C2, C3   float64
	Stress   float64
	R, Rel   float64
	Vs       float64
	Positons [][]float64
	Hub      [][]float64
}

func Compute(root string, progress func(string)) (*Result, error) {
	_, sta, loc, edges, err := Load(root)
	if err != nil {
		return nil, err
	}
	nq := 0
	for _, e := range edges {
		if e.Q+1 > nq {
			nq = e.Q + 1
		}
	}
	progress(fmt.Sprintf("%d readings, %d stations", len(edges), len(sta)))
	c := cache{Sta: sta, Loc: loc, Edge: edges, NQ: nq}
	g, keep := subgraph(c, MinQuakes)
	r := &Result{NQ: g.NQ, NS: g.NS, NE: len(g.E), Frames: map[int][]Frame{}, Final: map[int]*State{}, Stress: map[int]float64{}}
	sloc := make([][2]float64, len(keep))
	for i, ks := range keep {
		sloc[i] = loc[ks]
		r.Lat = append(r.Lat, loc[ks][0])
		r.Lon = append(r.Lon, loc[ks][1])
	}
	// the quakes with the most readings are drawn
	cnt := make([]int, g.NQ)
	for _, e := range g.E {
		cnt[e.Q]++
	}
	ord := make([]int, g.NQ)
	for i := range ord {
		ord[i] = i
	}
	sort.SliceStable(ord, func(a, b int) bool { return cnt[ord[a]] > cnt[ord[b]] })
	r.Hub = ord[:hubs]
	r.HubSt = make([][]int, hubs)
	for hi, h := range r.Hub {
		for _, e := range g.E {
			if e.Q == h {
				r.HubSt[hi] = append(r.HubSt[hi], e.S)
			}
		}
	}
	for _, k := range []int{2, 3} {
		rng := rand.New(rand.NewSource(1))
		s := g.Init(k, rng)
		if k == 2 {
			r.Init2 = g.Stress(s)
		} else {
			r.Init3 = g.Stress(s)
		}
		var raw []Frame
		snap := func(it int) {
			f := Frame{It: it, Stress: g.Stress(s)}
			for i := 0; i < g.NS; i++ {
				f.St = append(f.St, append([]float64(nil), s.X[g.NQ+i]...))
			}
			for _, h := range r.Hub {
				f.Hub = append(f.Hub, append([]float64(nil), s.X[h]...))
			}
			raw = append(raw, f)
		}
		snap(0)
		g.Descend(s, iters, 0.02, true, frameStep, snap)
		r.Final[k] = s
		r.Stress[k] = g.Stress(s)
		cen, R, rel := SphereFit(s.X[g.NQ:])
		r.Frames[k] = raw
		if k == 3 {
			vs, mir := AlignError(s.X[g.NQ:], sloc)
			r.Sphere.R, r.Sphere.Rel, r.Sphere.Vs = R, rel, vs
			r.Centre, r.Mirror = cen, mir
			sg := 1.0
			if mir {
				sg = -1
			}
			_, r.Rot = AlignRot(s.X[g.NQ:], sloc, sg)
			for _, h := range r.Hub {
				p := sub(s.X[h], cen)
				l := math.Sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2])
				r.HubS = append(r.HubS, []float64{p[0] / l * R, p[1] / l * R, p[2] / l * R})
			}
		} else {
			r.Plane.R, r.Plane.Rel = R, rel
		}
		progress(fmt.Sprintf("k=%d: start %.1f s, final %.2f s, c2 %.4f c3 %.4f", k, map[int]float64{2: r.Init2, 3: r.Init3}[k], r.Stress[k], s.M.C2, s.M.C3))
	}
	base := r.Final[3]
	vary := func(tag string, c2, c3 float64) {
		w := &State{K: 3, M: Model{C0: append([]float64(nil), base.M.C0...), C2: c2, C3: c3}}
		for _, x := range base.X {
			w.X = append(w.X, append([]float64(nil), x...))
		}
		g.Descend(w, 3000, 0.01, false, 3000, nil)
		_, R, rel := SphereFit(w.X[g.NQ:])
		vs, _ := AlignError(w.X[g.NQ:], sloc)
		wc, _, _ := SphereFit(w.X[g.NQ:])
		v := Variant{Tag: tag, C2: c2, C3: c3, Stress: g.Stress(w), R: R, Rel: rel, Vs: vs}
		for i := 0; i < g.NS; i++ {
			v.Positons = append(v.Positons, sub(w.X[g.NQ+i], wc))
		}
		for _, h := range r.Hub {
			p := sub(w.X[h], wc)
			l := math.Sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2])
			for t := range p {
				p[t] = p[t] / l * R
			}
			v.Hub = append(v.Hub, p)
		}
		r.Variants = append(r.Variants, v)
		progress(fmt.Sprintf("law %s: stress %.2f s, R %.3f u, radial %.4f, %.2f deg", tag, v.Stress, R, rel, vs))
	}
	for _, d := range []float64{-0.04, -0.02, 0, 0.02, 0.04} {
		vary(fmt.Sprintf("%+.2f", d), base.M.C2+d, base.M.C3)
	}
	vary("linear", 0, 0)
	r.Log = []string{fmt.Sprintf("%d quakes, %d stations, %d readings; plane %.1f s, 3D %.2f s; sphere R %.3f u radial %.4f; %.2f deg to the real positions",
		r.NQ, r.NS, r.NE, r.Stress[2], r.Stress[3], r.Sphere.R, r.Sphere.Rel, r.Sphere.Vs)}
	r.All = map[int]*Full{}
	G, order := fullGraph(c, keep, MinAll)
	for _, ks := range order {
		r.AllLatAll = append(r.AllLatAll, loc[ks][0])
		r.AllLonAll = append(r.AllLonAll, loc[ks][1])
	}
	aloc := make([][2]float64, len(order))
	for i, ks := range order {
		aloc[i] = loc[ks]
	}
	for _, k := range []int{3, 2} {
		f := extendFit(G, r.Final[k], g.NS)
		if k == 3 {
			// the joint refit may turn and slide the whole cloud (a gauge): put it back onto the core's own place
			X := Procrustes(f.S.X[G.NQ:G.NQ+g.NS], r.Final[3].X[g.NQ:], f.S.X)
			f.S.X = X
			_, f.R, f.Rel = SphereFit(X[G.NQ:])
			f.Vs, _ = AlignError(X[G.NQ:], aloc)
		}
		r.All[k] = f
		progress(fmt.Sprintf("all readings, k=%d: %d stations, %d of %d readings kept, %.2f s", k, G.NS, f.Kept, len(G.E), f.Stress))
	}
	r.Log = append(r.Log, fmt.Sprintf("all: %d stations, plane %.1f s (%d kept), 3D %.2f s (%d kept), radial %.4f, %.2f deg",
		G.NS, r.All[2].Stress, r.All[2].Kept, r.All[3].Stress, r.All[3].Kept, r.All[3].Rel, r.All[3].Vs))
	r.AllNE = len(G.E)
	return r, nil
}

// Full is the mesh of every station: the core's fit extended (Extend), refitted jointly, the readings more than three
// standard deviations from the fit set aside (the site's rule, applied to each surface with its own residuals), refitted.
type Full struct {
	S          *State
	Stress     float64
	Kept       int
	R, Rel, Vs float64
}

func extendFit(G *Graph, core *State, nc int) *Full {
	S := Extend(G, core, nc, nc)
	G.Descend(S, 2000, 0.005, true, 2000, nil)
	H := &Graph{NQ: G.NQ, NS: G.NS, E: G.E}
	for round := 0; round < 3; round++ {
		res := make([]float64, len(H.E))
		var sq float64
		for i, e := range H.E {
			a, b := H.node(e)
			res[i] = (e.T/100 - S.M.C0[e.Q] - S.M.g(dist(S.X[a], S.X[b]))) * 100
			sq += res[i] * res[i]
		}
		sd := math.Sqrt(sq / float64(len(res)))
		var keep []Edge
		for i, e := range H.E {
			if math.Abs(res[i]) <= 3*sd {
				keep = append(keep, e)
			}
		}
		if len(keep) == len(H.E) {
			break
		}
		H = &Graph{NQ: G.NQ, NS: G.NS, E: keep}
		H.Descend(S, 1500, 0.004, true, 1500, nil)
	}
	return &Full{S: S, Stress: H.Stress(S), Kept: len(H.E)}
}

func sub(x, c []float64) []float64 {
	o := make([]float64, len(x))
	for i := range x {
		o[i] = x[i] - c[i]
	}
	return o
}

// common puts the frames of the plane (k = 2, drawn as the sheet z = 0 of the shared start) and of space in ONE frame
// about the 3D cloud's sphere centre c, z flipped when the cloud is a mirror image. The plane's start is the first two
// coordinates of the 3D start (the same classical MDS), so the sheet and the start of space line up point for point.
func common(fr []Frame, c []float64, mir bool) []Frame {
	sg := 1.0
	if mir {
		sg = -1
	}
	to3 := func(x []float64) []float64 {
		z := 0.0
		if len(x) == 3 {
			z = x[2]
		}
		return []float64{x[0] - c[0], x[1] - c[1], sg * (z - c[2])}
	}
	out := make([]Frame, len(fr))
	for i, f := range fr {
		o := Frame{It: f.It, Stress: f.Stress}
		for _, x := range f.St {
			o.St = append(o.St, to3(x))
		}
		for _, x := range f.Hub {
			o.Hub = append(o.Hub, to3(x))
		}
		out[i] = o
	}
	return out
}

func mirrorZ(p [][]float64, mir bool) [][]float64 {
	if !mir {
		return p
	}
	o := make([][]float64, len(p))
	for i, x := range p {
		o[i] = []float64{x[0], x[1], -x[2]}
	}
	return o
}

func r2(x float64) float64 { return pyjson.Round(x, 2) }
func r3(x float64) float64 { return pyjson.Round(x, 3) }
func r4(x float64) float64 { return pyjson.Round(x, 4) }

func flat(p [][]float64) []any {
	var o []any
	for _, v := range p {
		for _, x := range v {
			o = append(o, r2(x))
		}
	}
	return o
}

// File is the preset: SEIS_MESH.
func (r *Result) File() preset.File {
	fr := func(k int) []any {
		var o []any
		for _, f := range common(r.Frames[k], r.Centre, r.Mirror) {
			o = append(o, pyjson.Obj{{K: "it", V: f.It}, {K: "stress", V: r2(f.Stress)}, {K: "st", V: flat(f.St)}, {K: "hub", V: flat(f.Hub)}})
		}
		return o
	}
	var vars []any
	for _, v := range r.Variants {
		vars = append(vars, pyjson.Obj{{K: "tag", V: v.Tag}, {K: "c2", V: r4(v.C2)}, {K: "c3", V: r4(v.C3)}, {K: "stress", V: r2(v.Stress)},
			{K: "R", V: r3(v.R)}, {K: "rel", V: r4(v.Rel)}, {K: "vs", V: r2(v.Vs)}, {K: "st", V: flat(mirrorZ(v.Positons, r.Mirror))}, {K: "hub", V: flat(mirrorZ(v.Hub, r.Mirror))}})
	}
	var lat, lon []any
	for i := range r.Lat {
		lat = append(lat, pyjson.Round(r.Lat[i], 1))
		lon = append(lon, pyjson.Round(r.Lon[i], 1))
	}
	var rot []any
	for a := 0; a < 3; a++ {
		for b := 0; b < 3; b++ {
			rot = append(rot, pyjson.Round(r.Rot[a][b], 6)) // 6 places: at 4, the angles of 0.5° the page recomputes would be off by 0.2°
		}
	}
	s3 := r.Final[3]
	var hubSt []any
	for _, l := range r.HubSt {
		var row []any
		for _, i := range l {
			row = append(row, i)
		}
		hubSt = append(hubSt, row)
	}
	M := pyjson.Obj{
		{K: "quakes", V: r.NQ}, {K: "stations", V: r.NS}, {K: "readings", V: r.NE}, {K: "minQuakes", V: MinQuakes},
		{K: "lat", V: lat}, {K: "lon", V: lon}, {K: "hubs", V: hubs}, {K: "hubSt", V: hubSt},
		{K: "plane", V: pyjson.Obj{{K: "start", V: r2(r.Init2)}, {K: "stress", V: r2(r.Stress[2])}, {K: "frames", V: fr(2)}}},
		{K: "space", V: pyjson.Obj{{K: "start", V: r2(r.Init3)}, {K: "stress", V: r2(r.Stress[3])}, {K: "R", V: r3(r.Sphere.R)}, {K: "rel", V: r4(r.Sphere.Rel)},
			{K: "vs", V: r2(r.Sphere.Vs)}, {K: "c2", V: r4(s3.M.C2)}, {K: "c3", V: r4(s3.M.C3)}, {K: "mirror", V: r.Mirror}, {K: "rot", V: rot},
			{K: "hubS", V: flat(mirrorZ(r.HubS, r.Mirror))}, {K: "frames", V: fr(3)}}},
		{K: "variants", V: vars},
		{K: "all", V: r.allObj()},
	}
	body := "export const SEIS_MESH = " + pyjson.Dumps(M, pyjson.Opts{Item: ",", Key: ":", ASCII: true}) + ";\n"
	return preset.File{
		Out: Out, Command: "build seis-mesh", Inputs: []string{"data/seis/inputs.lock"},
		Notes: []string{
			"Shape from earthquake travel times alone: P readings of the stations that read at least MinQuakes of the 262 shallow Mw >= 7 quakes,",
			"positions free in 2 and 3 dimensions, one common speed law, one free origin time per quake. Unit of length: the distance covered in 100 s",
			"at the speed the law starts with (no km in the fit). Every frame in one 3D frame about the 3D cloud's centre (the plane = the sheet z = -c_z).",
			"lat/lon = stations' published positions and rot = the best rotation onto them: a check and the drawing only. Method: go doc ./internal/build/seismesh.",
		},
		Body: body,
	}
}

// allObj: the full mesh in numbers only (2026-11-25, owner: the extra stations hardly change anything and weigh on
// the page): counts, both surfaces' stress, the sphere and the check (angular error of every station after the core's
// rotation: median and nine in ten).
func (r *Result) allObj() pyjson.Obj {
	f, p := r.All[3], r.All[2]
	nq := len(f.S.M.C0)
	ns := len(f.S.X) - nq
	sg := 1.0
	if r.Mirror {
		sg = -1
	}
	var errs []float64
	for i := 0; i < ns; i++ {
		v := sub(f.S.X[nq+i], r.Centre)
		v[2] *= sg
		l := math.Sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
		var w [3]float64
		for a := 0; a < 3; a++ {
			for b := 0; b < 3; b++ {
				w[b] += v[a] / l * r.Rot[a][b]
			}
		}
		t := unit(r.AllLatAll[i], r.AllLonAll[i])
		errs = append(errs, math.Acos(math.Max(-1, math.Min(1, w[0]*t[0]+w[1]*t[1]+w[2]*t[2])))*180/math.Pi)
	}
	sort.Float64s(errs)
	return pyjson.Obj{
		{K: "stations", V: ns}, {K: "minQuakes", V: MinAll}, {K: "readings", V: r.AllNE},
		{K: "plane", V: pyjson.Obj{{K: "stress", V: r2(p.Stress)}, {K: "kept", V: p.Kept}}},
		{K: "space", V: pyjson.Obj{{K: "stress", V: r2(f.Stress)}, {K: "kept", V: f.Kept}, {K: "R", V: r3(f.R)}, {K: "rel", V: r4(f.Rel)}, {K: "vs", V: r2(f.Vs)},
			{K: "med", V: r2(errs[len(errs)/2])}, {K: "p90", V: r2(errs[len(errs)*9/10])}}},
	}
}
