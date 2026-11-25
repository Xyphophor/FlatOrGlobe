// Package seisreloc builds src/data/presets/seis-relocate.js (epic18/UC03-04):
// the nine earthquakes relocated by us from the raw ISC bulletins, in
// degrees and seconds -- station angles and clock times only, no radius,
// no travel-time table; the official epicentre and origin time serve only
// to compare. Port of scripts/build_seis_relocate.py (epic24/UC03).
//
//  1. P waves (median per station of the readings the ISC names "P"; the
//     label-free check uses each station's first reported arrival): a
//     centre and the same free cubic t = t0 + a u + b u² + c u³ (u =
//     distance/100 in degrees) for the globe (great circle) and for a flat
//     map (map degrees), 25-95° from OUR centre, iterated.
//  2. Surface waves (LR/MLR), 20-160° from our P centre: t = t0 + Δ/ω, the
//     lap 360/ω in hours, no km.
//  3. One flat map for all nine: every quake refitted on each map centre
//     (the nine epicentres, the North Pole, a grid, then finer grids).
//
// Outliers: removed one at a time beyond 3 standard deviations of the
// OTHERS, then refitted (the owner's rule).
//
// Bit-level choices, all checked against numpy on this machine (see npy,
// pymath): sorts and partitions in numpy's order; einsum and matmul sums
// in numpy's order; glibc's hypot; numpy's rounding of numpy scalars. The
// linear algebra (LAPACK dgesv, dgelsd) is replaced by LU and Householder
// QR: equal to rounding, so a last digit may flip (pinned in the test).
package seisreloc

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/build/seisradius"
	"flatorglobe/tools/internal/npy"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
	"flatorglobe/tools/internal/stats"
)

const (
	RawDir = "data/seis/raw"
	Out    = "src/data/presets/seis-relocate.js"
	Deg    = 3
	K      = 3.0
)

// D2R is the script's math.pi / 180.
var D2R = pymath.Div(math.Pi, 180)

var (
	tailRe = regexp.MustCompile(`(-?\d{1,3}\.\d{2,6})\s+(-?\d{1,3}\.\d{2,6})\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$`)
	timeRe = regexp.MustCompile(`^(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)$`)
)

// Pick is one station's arrival.
type Pick struct {
	Lat, Lon, T float64
	Sta         string
}

// hms is sum(float(x) * k for x, k in zip(s.split(":"), (3600, 60, 1))).
func hms(s string) float64 {
	p := strings.Split(s, ":")
	xs := make([]float64, len(p))
	for i, k := range []float64{3600, 60, 1}[:len(p)] {
		v, _ := strconv.ParseFloat(p[i], 64)
		xs[i] = v * k
	}
	return pymath.Sum(xs)
}

type ordered struct {
	keys []string
	m    map[string][]Pick
}

func (o *ordered) add(k string, p Pick) {
	if o.m == nil {
		o.m = map[string][]Pick{}
	}
	if _, ok := o.m[k]; !ok {
		o.keys = append(o.keys, k)
	}
	o.m[k] = append(o.m[k], p)
}

func median(ps []Pick) float64 {
	ts := make([]float64, len(ps))
	for i, p := range ps {
		ts[i] = p.T
	}
	return stats.Median(ts)
}

func runes(r []rune, a, b int) string {
	if a > len(r) {
		return ""
	}
	return string(r[a:min(b, len(r))])
}

// Picks reads raw/<key>.isf by the ISF fixed columns (station 0-5, phase
// 19-27, time 28-40). mode "P": median of the readings named P; "first":
// the first reported arrival, any phase. LR: median of the LR/MLR readings.
func Picks(root string, ev seisradius.Event, mode string) (P, LR []Pick, err error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, ev.Key+".isf"))
	if err != nil {
		return nil, nil, err
	}
	P, LR = PicksData(b, hms(strings.Fields(ev.SearchStart)[1]), mode)
	return P, LR, nil
}

// PicksData is Picks on a bulletin already read; times are seconds after
// t0 (seconds of the day, the next day's readings wrapped).
func PicksData(b []byte, t0 float64, mode string) (P, LR []Pick) {
	var pp, lr ordered
	var firstKeys []string
	first := map[string]Pick{}
	for _, line := range strings.SplitAfter(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n") {
		r := []rune(line)
		if len(r) < 60 {
			continue
		}
		tail := tailRe.FindStringSubmatch(strings.TrimRight(line, "\n"))
		if tail == nil {
			continue
		}
		sta := pymath.Strip(runes(r, 0, 5))
		m := timeRe.FindStringSubmatch(pymath.Strip(runes(r, 28, 40)))
		ph := pymath.Strip(runes(r, 19, 27))
		if sta == "" || m == nil {
			continue
		}
		h, _ := strconv.Atoi(m[1])
		mi, _ := strconv.Atoi(m[2])
		s, _ := strconv.ParseFloat(m[3], 64)
		t := float64(h*3600+mi*60) + s
		if t < t0 {
			t += 86400
		}
		la, _ := strconv.ParseFloat(tail[1], 64)
		lo, _ := strconv.ParseFloat(tail[2], 64)
		t -= t0
		p := Pick{la, lo, t, sta}
		if ph == "LR" || ph == "MLR" {
			lr.add(sta, p)
		}
		if ph == "P" {
			pp.add(sta, p)
		}
		if f, ok := first[sta]; !ok || t < f.T {
			if !ok {
				firstKeys = append(firstKeys, sta)
			}
			first[sta] = p
		}
	}
	if mode == "first" {
		for _, k := range firstKeys {
			P = append(P, first[k])
		}
	} else {
		for _, k := range pp.keys {
			v := pp.m[k]
			P = append(P, Pick{v[0].Lat, v[0].Lon, median(v), k})
		}
	}
	for _, k := range lr.keys {
		v := lr.m[k]
		LR = append(LR, Pick{v[0].Lat, v[0].Lon, median(v), k})
	}
	return P, LR
}

// trig of one point, as numpy computes it elementwise.
type sc struct{ s, c float64 }

func trig(deg float64) sc { r := deg * D2R; return sc{math.Sin(r), math.Cos(r)} }

// gc is the script's gc(): great circle in degrees (atan2 form).
func gc(la1, lo1, la2, lo2 float64) float64 {
	return gcT(trig(la1), lo1, trig(la2), lo2)
}

func gcT(p1 sc, lo1 float64, p2 sc, lo2 float64) float64 {
	dl := (lo2 - lo1) * D2R
	sdl, cdl := math.Sin(dl), math.Cos(dl)
	a := p2.c * sdl
	b := float64(p1.c*p2.s) - float64(float64(p1.s*p2.c)*cdl)
	c := float64(p1.s*p2.s) + float64(float64(p1.c*p2.c)*cdl)
	return pymath.Degrees(math.Atan2(pymath.Hypot(a, b), c))
}

// ae is Snyder's azimuthal equidistant map of centre (lat0, lon0): (x
// east, y north) in degrees, as src/core/aeproj.js.
func ae(lat0, lon0, la, lo float64) (float64, float64) {
	s1, c1 := math.Sin(lat0*D2R), math.Cos(lat0*D2R)
	sp, cp, dl := math.Sin(la*D2R), math.Cos(la*D2R), (lo-lon0)*D2R
	cdl := math.Cos(dl)
	ex := cp * math.Sin(dl)
	ny := float64(c1*sp) - float64(float64(s1*cp)*cdl)
	c := math.Atan2(pymath.Hypot(ex, ny), float64(s1*sp)+float64(float64(c1*cp)*cdl))
	n := pymath.Hypot(ex, ny)
	if n < 1e-15 {
		n = 1
	}
	return pymath.Degrees(float64(c*ex) / n), pymath.Degrees(float64(c*ny) / n)
}

// powers is [U**0, U**1, U**2, U**3] as numpy computes them.
func powers(u float64) [4]float64 { return [4]float64{1, u, u * u, pymath.Cube(u)} }

// solve4 is LAPACK dgesv on a 4x4 system (partial pivoting, multipliers
// by the reciprocal of the pivot).
func solve4(a [4][4]float64, b [4]float64) [4]float64 {
	piv := [4]int{0, 1, 2, 3}
	for j := 0; j < 4; j++ {
		p := j
		for i := j + 1; i < 4; i++ {
			if math.Abs(a[i][j]) > math.Abs(a[p][j]) {
				p = i
			}
		}
		if p != j {
			a[p], a[j] = a[j], a[p]
			piv[p], piv[j] = piv[j], piv[p]
			b[p], b[j] = b[j], b[p]
		}
		if a[j][j] != 0 {
			r := 1 / a[j][j]
			for i := j + 1; i < 4; i++ {
				a[i][j] *= r
			}
		}
		for i := j + 1; i < 4; i++ {
			for k := j + 1; k < 4; k++ {
				a[i][k] -= float64(a[i][j] * a[j][k])
			}
		}
	}
	for j := 0; j < 4; j++ { // L y = P b
		for i := j + 1; i < 4; i++ {
			b[i] -= float64(b[j] * a[i][j])
		}
	}
	for k := 3; k >= 0; k-- { // U x = y
		if b[k] != 0 {
			b[k] /= a[k][k]
			for i := 0; i < k; i++ {
				b[i] -= float64(b[k] * a[i][k])
			}
		}
	}
	return b
}

// batchSS is batch_fit's ss for one candidate centre: normal equations
// (einsum sums in index order), 1e-12 on the diagonal, residuals summed
// pairwise; with trim, only the 80 % smallest squared residuals, in the
// order numpy's partition leaves them.
func batchSS(D, t []float64, trim bool, r2 []float64) float64 {
	n := len(D)
	var ata [4][4]float64
	var atb [4]float64
	us := make([][4]float64, n)
	for k := 0; k < n; k++ {
		us[k] = powers(D[k] / 100.0)
	}
	for i := 0; i < 4; i++ {
		for j := 0; j < 4; j++ {
			s := 0.0
			for k := 0; k < n; k++ {
				s += float64(us[k][i] * us[k][j])
			}
			ata[i][j] = s
		}
		s := 0.0
		for k := 0; k < n; k++ {
			s += float64(us[k][i] * t[k])
		}
		atb[i] = s
	}
	for i := 0; i < 4; i++ {
		ata[i][i] += 1e-12
	}
	c := solve4(ata, atb)
	r2 = r2[:n]
	for k := 0; k < n; k++ {
		a := us[k]
		// einsum "mni,mi->mn" adds the four products two SSE lanes at a time
		fit := float64(float64(a[0]*c[0])+float64(a[2]*c[2])) + float64(float64(a[1]*c[1])+float64(a[3]*c[3]))
		r := t[k] - fit
		r2[k] = r * r
	}
	if trim {
		k := max(Deg+2, int(0.8*float64(n)))
		npy.Partition(r2, k-1)
		return npy.Sum(r2[:k])
	}
	return npy.Sum(r2)
}

// lstsq solves min |A x - b| by Householder QR (numpy uses LAPACK dgelsd:
// the same solution to rounding).
func lstsq(A [][]float64, b []float64) []float64 {
	m, p := len(A), len(A[0])
	a := make([][]float64, m)
	for i := range A {
		a[i] = append([]float64(nil), A[i]...)
	}
	y := append([]float64(nil), b...)
	for j := 0; j < p; j++ {
		norm := 0.0
		for i := j; i < m; i++ {
			norm = math.Hypot(norm, a[i][j])
		}
		if norm == 0 {
			continue
		}
		if a[j][j] > 0 {
			norm = -norm
		}
		for i := j; i < m; i++ {
			a[i][j] /= -norm
		}
		a[j][j] += 1
		for k := j + 1; k < p; k++ {
			s := 0.0
			for i := j; i < m; i++ {
				s += a[i][j] * a[i][k]
			}
			s = -s / a[j][j]
			for i := j; i < m; i++ {
				a[i][k] += s * a[i][j]
			}
		}
		s := 0.0
		for i := j; i < m; i++ {
			s += a[i][j] * y[i]
		}
		s = -s / a[j][j]
		for i := j; i < m; i++ {
			y[i] += s * a[i][j]
		}
		a[j][j] = norm // R's diagonal
	}
	x := make([]float64, p)
	for j := p - 1; j >= 0; j-- {
		s := y[j]
		for k := j + 1; k < p; k++ {
			s -= a[j][k] * x[k]
		}
		x[j] = s / a[j][j]
	}
	return x
}

// distFn gives the distances from one candidate centre to every station.
type distFn func(c [2]float64, out []float64)

type step struct{ half, step float64 }

func gridLL(c [2]float64, half, st float64) [][2]float64 {
	la := npy.Arange(c[0]-half, c[0]+half+1e-9, st)
	lo := npy.Arange(c[1]-half, c[1]+half+1e-9, st)
	var out [][2]float64
	for _, a := range la {
		for _, o := range lo {
			if math.Abs(a) < 89.9 {
				out = append(out, [2]float64{a, o})
			}
		}
	}
	return out
}

func gridXY(c [2]float64, half, st float64) [][2]float64 {
	x := npy.Arange(c[0]-half, c[0]+half+1e-9, st)
	y := npy.Arange(c[1]-half, c[1]+half+1e-9, st)
	out := make([][2]float64, 0, len(x)*len(y))
	for _, a := range x {
		for _, b := range y {
			out = append(out, [2]float64{a, b})
		}
	}
	return out
}

// search refines a grid around start; returns the best centre.
func search(dist distFn, cands func([2]float64, float64, float64) [][2]float64, t []float64, start [2]float64, steps []step, trim bool) [2]float64 {
	best := start
	D := make([]float64, len(t))
	r2 := make([]float64, len(t))
	for _, s := range steps {
		C := cands(best, s.half, s.step)
		ss := make([]float64, len(C))
		for i, c := range C {
			dist(c, D)
			ss[i] = batchSS(D, t, trim, r2)
		}
		bi := argminNaN(ss)
		best = C[bi]
	}
	return best
}

// Fit is fit_robust's result.
type Fit struct {
	Centre [2]float64
	Coef   []float64
	SD     float64
	N, Of  int
	Keep   []bool
}

func fitRobust(dist distFn, cands func([2]float64, float64, float64) [][2]float64, tAll []float64, start [2]float64, steps []step) (*Fit, error) {
	n0 := len(tAll)
	keep := make([]bool, n0)
	for i := range keep {
		keep[i] = true
	}
	centre := start
	first := true
	p := Deg + 1 + 2
	all := make([]float64, n0)
	for it := 0; it < 50; it++ {
		var idx []int
		for i, k := range keep {
			if k {
				idx = append(idx, i)
			}
		}
		tk := make([]float64, len(idx))
		for j, i := range idx {
			tk[j] = tAll[i]
		}
		sub := func(c [2]float64, out []float64) {
			dist(c, all)
			for j, i := range idx {
				out[j] = all[i]
			}
		}
		st := steps
		if !first {
			st = steps[1:]
		}
		centre = search(sub, cands, tk, centre, st, first)
		first = false
		Dall := make([]float64, n0)
		dist(centre, Dall)
		removed := 0
		var sol []float64
		var ss float64
		var n int
		for {
			idx = idx[:0]
			for i, k := range keep {
				if k {
					idx = append(idx, i)
				}
			}
			n = len(idx)
			A := make([][]float64, n)
			b := make([]float64, n)
			for j, i := range idx {
				u := powers(Dall[i] / 100.0)
				A[j] = u[:]
				b[j] = tAll[i]
			}
			sol = lstsq(A, b)
			res := make([]float64, n)
			r2 := make([]float64, n)
			for j := range A {
				fit := 0.0 // matmul (reference BLAS dgemv): in order
				for k := 0; k <= Deg; k++ {
					fit += float64(A[j][k] * sol[k])
				}
				res[j] = b[j] - fit
				r2[j] = res[j] * res[j]
			}
			ss = npy.Sum(r2)
			den := float64(max(1, n-1-p))
			jmax, zmax := 0, math.Inf(-1)
			for j := range res {
				sd := math.Sqrt(math.Max(ss-r2[j], 0) / den)
				z := math.Abs(res[j]) / sd
				if !(sd > 0) {
					z = math.Abs(res[j]) / math.Inf(1)
				}
				if z > zmax {
					jmax, zmax = j, z
				}
			}
			if zmax <= K {
				break
			}
			keep[idx[jmax]] = false
			removed++
		}
		if removed == 0 {
			return &Fit{Centre: centre, Coef: sol, SD: math.Sqrt(ss / float64(max(1, n-p))), N: n, Of: n0, Keep: keep}, nil
		}
	}
	return nil, fmt.Errorf("exclusion did not converge")
}

var globeSteps = []step{{30, 2.0}, {3, 0.25}, {0.4, 0.04}}
var flatSteps = []step{{20, 1.5}, {2, 0.25}, {0.3, 0.05}}
var scanSteps = []step{{10, 1.0}, {1.5, 0.2}, {0.3, 0.04}}

// relocateGlobe is relocate_globe_P: start at the medoid of the 15 first
// arrivals, then up to four rounds of selection (25-95° from our centre)
// and robust fit.
// RelocateGlobe is relocateGlobe: our globe centre and cubic, and which picks lie 25-95° from it.
func RelocateGlobe(P []Pick) (*Fit, []bool, error) { return relocateGlobe(P) }

// FlatFit is flatFit: the same picks on the azimuthal equidistant map of centre mapC (fine steps when full).
func FlatFit(P []Pick, sel []bool, mapC, start [2]float64, full bool) (*Fit, error) {
	if full {
		return flatFit(P, sel, mapC, start, flatSteps)
	}
	return flatFit(P, sel, mapC, start, scanSteps)
}

// GC is the great circle (degrees) and AE the map of centre (lat0, lon0), as the fits use them.
func GC(la1, lo1, la2, lo2 float64) float64            { return gc(la1, lo1, la2, lo2) }
func AE(lat0, lon0, la, lo float64) (float64, float64) { return ae(lat0, lon0, la, lo) }

func relocateGlobe(P []Pick) (*Fit, []bool, error) {
	n := len(P)
	t := make([]float64, n)
	for i, p := range P {
		t[i] = p.T
	}
	e := npy.Argsort(t)[:min(15, n)]
	tr := make([]sc, n)
	for i, p := range P {
		tr[i] = trig(p.Lat)
	}
	sums := make([]float64, len(e))
	for a, i := range e {
		row := make([]float64, len(e))
		for b, j := range e {
			row[b] = gcT(tr[i], P[i].Lon, tr[j], P[j].Lon)
		}
		sums[a] = npy.Sum(row)
	}
	m0 := e[argmin(sums)]
	centre := [2]float64{P[m0].Lat, P[m0].Lon}
	var f *Fit
	var sel []bool
	for it := 0; it < 4; it++ {
		ct := trig(centre[0])
		sel = make([]bool, n)
		var L []Pick
		for i, p := range P {
			d := gcT(ct, centre[1], tr[i], p.Lon)
			sel[i] = d >= 25 && d <= 95
			if sel[i] {
				L = append(L, p)
			}
		}
		T := make([]float64, len(L))
		lt := make([]sc, len(L))
		for i, p := range L {
			T[i], lt[i] = p.T, trig(p.Lat)
		}
		dist := func(c [2]float64, out []float64) {
			cc := trig(c[0])
			for i, p := range L {
				out[i] = gcT(cc, c[1], lt[i], p.Lon)
			}
		}
		var err error
		if f, err = fitRobust(dist, gridLL, T, centre, globeSteps); err != nil {
			return nil, nil, err
		}
		moved := gc(centre[0], centre[1], f.Centre[0], f.Centre[1])
		centre = f.Centre
		if moved < 0.05 {
			break
		}
	}
	return f, sel, nil
}

// argminNaN is np.argmin: the first minimum, or the first NaN if any.
func argminNaN(a []float64) int {
	for i, x := range a {
		if math.IsNaN(x) {
			return i
		}
	}
	return argmin(a)
}

func argmin(a []float64) int {
	b := 0
	for i, x := range a {
		if x < a[b] {
			b = i
		}
	}
	return b
}

// flatFit is flat_fit_P: the quake's centre free in MAP coordinates.
func flatFit(P []Pick, sel []bool, mapC [2]float64, start [2]float64, steps []step) (*Fit, error) {
	var X, Y, T []float64
	for i, p := range P {
		if !sel[i] {
			continue
		}
		x, y := ae(mapC[0], mapC[1], p.Lat, p.Lon)
		X, Y, T = append(X, x), append(Y, y), append(T, p.T)
	}
	sx, sy := ae(mapC[0], mapC[1], start[0], start[1])
	dist := func(c [2]float64, out []float64) {
		for i := range X {
			out[i] = pymath.Hypot(c[0]-X[i], c[1]-Y[i])
		}
	}
	return fitRobust(dist, gridXY, T, [2]float64{sx, sy}, steps)
}

// LRFit is lr_fit's result.
type LRFit struct {
	T0, Omega, LapH, SD float64
	N, Of               int
	Sel, Keep           []bool
}

func lrFit(LR []Pick, centre [2]float64) *LRFit {
	ct := trig(centre[0])
	var Dm, T []float64
	sel := make([]bool, len(LR))
	for i, p := range LR {
		d := gcT(ct, centre[1], trig(p.Lat), p.Lon)
		if d >= 20 && d <= 160 {
			sel[i] = true
			Dm, T = append(Dm, d), append(T, p.T)
		}
	}
	keep := make([]bool, len(T))
	for i := range keep {
		keep[i] = true
	}
	for {
		var A [][]float64
		var b []float64
		var idx []int
		for i, k := range keep {
			if k {
				A = append(A, []float64{1, Dm[i]})
				b = append(b, T[i])
				idx = append(idx, i)
			}
		}
		sol := lstsq(A, b)
		n := len(b)
		res := make([]float64, n)
		r2 := make([]float64, n)
		for j := range A {
			res[j] = b[j] - (0 + float64(A[j][0]*sol[0]) + float64(A[j][1]*sol[1]))
			r2[j] = res[j] * res[j]
		}
		ss := npy.Sum(r2)
		den := float64(max(1, n-3))
		jmax, zmax, nan := 0, math.Inf(-1), -1
		for j := range res {
			z := math.Abs(res[j]) / math.Sqrt(math.Max(ss-r2[j], 0)/den)
			if math.IsNaN(z) && nan < 0 {
				nan = j
			}
			if z > zmax {
				jmax, zmax = j, z
			}
		}
		if nan >= 0 { // numpy's argmax returns the first NaN
			jmax, zmax = nan, math.NaN()
		}
		if zmax > 3 {
			keep[idx[jmax]] = false
			continue
		}
		return &LRFit{T0: sol[0], Omega: 1 / sol[1], LapH: float64(360*sol[1]) / 3600, SD: math.Sqrt(ss / float64(n-2)),
			N: n, Of: len(T), Sel: sel, Keep: keep}
	}
}

func r(x float64, d int) float64  { return pyjson.Round(x, d) }   // round() on a Python float
func nr(x float64, d int) float64 { return pymath.NpRound(x, d) } // round() on a numpy scalar

func b2i(b bool) int {
	if b {
		return 1
	}
	return 0
}

func coefs(c []float64) []any {
	out := make([]any, len(c))
	for i, v := range c {
		out[i] = r(v, 4)
	}
	return out
}

// Quake is one relocated earthquake.
type Quake struct {
	Obj  pyjson.Obj
	PLat float64 // rounded, as the scan reads them back
	PLon float64
	PN   int
	PSD  float64
	Rows []Pick // pP rows, rounded
}

// Relocate runs steps 1 and 2 for one event.
func Relocate(root string, ev seisradius.Event) (*Quake, error) {
	P, LR, err := Picks(root, ev, "P")
	if err != nil {
		return nil, err
	}
	g, sel, err := relocateGlobe(P)
	if err != nil {
		return nil, err
	}
	fp, err := flatFit(P, sel, [2]float64{90, 0}, g.Centre, flatSteps)
	if err != nil {
		return nil, err
	}
	lr := lrFit(LR, g.Centre)
	evLat, _ := ev.Lat.Float64()
	evLon, _ := ev.Lon.Float64()
	off := gc(evLat, evLon, g.Centre[0], g.Centre[1])
	t0isc := hms(ev.OTime) - hms(strings.Fields(ev.SearchStart)[1])
	q := &Quake{PLat: nr(g.Centre[0], 3), PLon: nr(g.Centre[1], 3), PN: g.N, PSD: r(g.SD, 2)}
	var pP []any
	k := 0
	for i, p := range P {
		if !sel[i] {
			continue
		}
		kept := g.Keep[k]
		k++
		row := Pick{r(p.Lat, 4), r(p.Lon, 4), r(p.T, 2), p.Sta}
		q.Rows = append(q.Rows, row)
		pP = append(pP, []any{row.Lat, row.Lon, row.T, b2i(kept)})
	}
	var pLR []any
	k = 0
	for i, p := range LR {
		if !lr.Sel[i] {
			continue
		}
		pLR = append(pLR, []any{r(p.Lat, 4), r(p.Lon, 4), r(p.T, 1), b2i(lr.Keep[k])})
		k++
	}
	q.Obj = pyjson.Obj{
		{K: "key", V: ev.Key}, {K: "name", V: ev.Name}, {K: "official", V: []any{ev.Lat, ev.Lon}},
		{K: "P", V: pyjson.Obj{{K: "lat", V: q.PLat}, {K: "lon", V: q.PLon}, {K: "coef", V: coefs(g.Coef)},
			{K: "sd", V: q.PSD}, {K: "n", V: g.N}, {K: "of", V: g.Of}, {K: "offset_deg", V: r(off, 3)},
			{K: "t0_minus_isc_s", V: r(g.Coef[0]-t0isc, 1)}}},
		{K: "Pflat", V: pyjson.Obj{{K: "x", V: nr(fp.Centre[0], 3)}, {K: "y", V: nr(fp.Centre[1], 3)}, {K: "coef", V: coefs(fp.Coef)},
			{K: "sd", V: r(fp.SD, 2)}, {K: "n", V: fp.N}, {K: "of", V: fp.Of}}},
		{K: "LR", V: pyjson.Obj{{K: "t0", V: nr(lr.T0, 4)}, {K: "omega", V: nr(lr.Omega, 4)}, {K: "lap_h", V: nr(lr.LapH, 4)},
			{K: "sd", V: r(lr.SD, 4)}, {K: "n", V: lr.N}, {K: "of", V: lr.Of}}},
		{K: "pP", V: pP}, {K: "pLR", V: pLR}, {K: "t0_isc", V: r(t0isc, 2)},
	}
	// the label-free check (first arrival), compared with the ISC only to show it
	Pf, _, err := Picks(root, ev, "first")
	if err != nil {
		return nil, err
	}
	gf, self, err := relocateGlobe(Pf)
	if err != nil {
		return nil, err
	}
	ff, err := flatFit(Pf, self, [2]float64{90, 0}, gf.Centre, flatSteps)
	if err != nil {
		return nil, err
	}
	q.Obj = append(q.Obj, pyjson.KV{K: "firstArrival", V: pyjson.Obj{
		{K: "lat", V: r(gf.Centre[0], 3)}, {K: "lon", V: r(gf.Centre[1], 3)}, {K: "sd", V: r(gf.SD, 2)},
		{K: "n", V: gf.N}, {K: "of", V: gf.Of}, {K: "flat_sd", V: r(ff.SD, 2)},
		{K: "offset_deg", V: r(gc(evLat, evLon, gf.Centre[0], gf.Centre[1]), 3)}}})
	return q, nil
}

// scan fits every quake on each map centre; maxn > 0 thins the stations.
func scan(quakes []*Quake, centres [][2]float64, maxn int, keepFits bool) ([]pyjson.Obj, []float64, error) {
	var rows []pyjson.Obj
	var rmss []float64
	for _, C := range centres {
		per := make([]float64, len(quakes))
		var fits []any
		for qi, q := range quakes {
			Pl := q.Rows
			if maxn > 0 && len(Pl) > maxn {
				st := int(math.Ceil(float64(len(Pl)) / float64(maxn)))
				var thin []Pick
				for i := 0; i < len(Pl); i += st {
					thin = append(thin, Pl[i])
				}
				Pl = thin
			}
			sel := make([]bool, len(Pl))
			for i := range sel {
				sel[i] = true
			}
			steps := flatSteps
			if maxn > 0 {
				steps = scanSteps
			}
			f, err := flatFit(Pl, sel, C, [2]float64{q.PLat, q.PLon}, steps)
			if err != nil {
				return nil, nil, err
			}
			per[qi] = r(f.SD, 2)
			if keepFits {
				row := []any{nr(f.Centre[0], 3), nr(f.Centre[1], 3)}
				row = append(row, coefs(f.Coef)...)
				fits = append(fits, append(row, f.N))
			}
		}
		rms := r(weightedRMS(quakes, per), 2)
		row := pyjson.Obj{{K: "c", V: []any{r(C[0], 2), r(C[1], 2)}}, {K: "sd", V: per}, {K: "rms", V: rms}}
		if keepFits {
			row = append(row, pyjson.KV{K: "fits", V: fits})
		}
		rows = append(rows, row)
		rmss = append(rmss, rms)
	}
	return rows, rmss, nil
}

// weightedRMS is sqrt((n * sd**2).sum() / n.sum()) in numpy.
func weightedRMS(quakes []*Quake, sd []float64) float64 {
	w := make([]float64, len(quakes))
	nsum := 0
	for i, q := range quakes {
		w[i] = float64(q.PN) * (sd[i] * sd[i])
		nsum += q.PN
	}
	return math.Sqrt(npy.Sum(w) / float64(nsum))
}

func firstMin(rms []float64) int {
	b := 0
	for i, x := range rms {
		if x < rms[b] {
			b = i
		}
	}
	return b
}

// Result of a build.
type Result struct {
	Quakes []*Quake
	Maps   pyjson.Obj
	Log    string
}

// Compute runs the whole script.
func Compute(root string, progress func(string)) (*Result, error) {
	evs, err := seisradius.ReadEvents(root)
	if err != nil {
		return nil, err
	}
	var quakes []*Quake
	for _, ev := range evs {
		q, err := Relocate(root, ev)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", ev.Key, err)
		}
		quakes = append(quakes, q)
		progress(ev.Key)
	}
	var named [][2]float64
	for _, ev := range evs {
		la, _ := ev.Lat.Float64()
		lo, _ := ev.Lon.Float64()
		named = append(named, [2]float64{la, lo})
	}
	named = append(named, [2]float64{90, 0})
	namedRows, namedRMS, err := scan(quakes, named, 0, true)
	if err != nil {
		return nil, err
	}
	progress("named centres")
	var grid [][2]float64
	for la := -80; la <= 80; la += 20 {
		for lo := -180; lo < 180; lo += 20 {
			grid = append(grid, [2]float64{float64(la), float64(lo)})
		}
	}
	gridRows, gridRMS, err := scan(quakes, grid, 300, false)
	if err != nil {
		return nil, err
	}
	progress("20° grid")
	centreOf := func(row pyjson.Obj) [2]float64 {
		c := row[0].V.([]any)
		return [2]float64{c[0].(float64), c[1].(float64)}
	}
	around := func(b [2]float64, lo, hi, st int) [][2]float64 {
		var out [][2]float64
		for a := lo; a <= hi; a += st {
			for o := lo; o <= hi; o += st {
				if math.Abs(b[0]+float64(a)) < 90 && (a != 0 || o != 0) {
					out = append(out, [2]float64{b[0] + float64(a), b[1] + float64(o)})
				}
			}
		}
		return out
	}
	b := centreOf(gridRows[firstMin(gridRMS)])
	fineRows, fineRMS, err := scan(quakes, around(b, -15, 15, 5), 300, false)
	if err != nil {
		return nil, err
	}
	allRows := append(append([]pyjson.Obj{}, gridRows...), fineRows...)
	allRMS := append(append([]float64{}, gridRMS...), fineRMS...)
	b = centreOf(allRows[firstMin(allRMS)])
	finerRows, finerRMS, err := scan(quakes, around(b, -4, 4, 2), 300, false)
	if err != nil {
		return nil, err
	}
	fineRows = append(fineRows, finerRows...)
	allRows = append(allRows, finerRows...)
	allRMS = append(allRMS, finerRMS...)
	bestC := centreOf(allRows[firstMin(allRMS)])
	bestRows, _, err := scan(quakes, [][2]float64{bestC}, 0, true)
	if err != nil {
		return nil, err
	}
	progress("fine scan")
	sds := make([]float64, len(quakes))
	for i, q := range quakes {
		sds[i] = q.PSD
	}
	globeRMS := r(weightedRMS(quakes, sds), 2)
	toAny := func(rs []pyjson.Obj) []any {
		out := make([]any, len(rs))
		for i, x := range rs {
			out[i] = x
		}
		return out
	}
	maps := pyjson.Obj{{K: "globe_rms", V: globeRMS}, {K: "named", V: toAny(namedRows)}, {K: "grid", V: toAny(gridRows)},
		{K: "fine", V: toAny(fineRows)}, {K: "best", V: bestRows[0]}}
	return &Result{Quakes: quakes, Maps: maps,
		Log: fmt.Sprintf("globe rms %v s; best single flat map %v rms %v s; pole rms %v s",
			globeRMS, bestRows[0][0].V, bestRows[0][2].V, namedRMS[len(namedRMS)-1])}, nil
}

// File renders the preset (same body as the script).
func (res *Result) File() preset.File {
	qs := make([]any, len(res.Quakes))
	for i, q := range res.Quakes {
		qs[i] = q.Obj
	}
	compact := pyjson.Opts{Item: ",", Key: ":", ASCII: true}
	body := "export const RELOC_QUAKES = " + pyjson.Dumps(qs, compact) + ";\n" +
		"// one flat map for all nine: per map centre, each quake's flat P scatter (s) and the n-weighted rms;\n" +
		"// grid/fine rows use at most 300 stations per quake (scan only), named and best rows use all of them\n" +
		"export const RELOC_MAPS = " + pyjson.Dumps(res.Maps, compact) + ";\n"
	return preset.File{
		Out: Out, Command: "build seis-relocate", Inputs: []string{seisradius.Events, seisradius.Dir + "/inputs.lock"},
		Notes: []string{
			"Earthquakes relocated from arrival times only (ISC raw bulletins: station angles + clock times), in degrees and",
			"seconds -- no radius, no travel-time table, no official epicentre or origin time used (they are kept only to compare).",
			"P: centre + free cubic t(u), u = distance/100 (degrees), same curve family for globe (great circle) and flat map.",
			"pP / pLR rows: [lat, lon, t (s after the bulletin's search start), kept 1/0].",
		},
		Body: body,
	}
}
