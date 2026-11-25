// Package seisbulk builds src/data/presets/seis-bulk.js (2026-10-29): the
// seis tab's pooled syntheses over every shallow great earthquake of the
// reviewed ISC Bulletin, chosen by a rule fixed before looking (fetch.go):
// 2000-2023, depth at most 70 km, Global CMT moment magnitude 7.0 or more,
// then at least MinP stations with a P reading 25-95° from our own centre.
// None of these earthquakes is shown alone on the page; they give volume.
//
// Three syntheses, each one the pooled form of a section built on the nine
// named earthquakes (packages seisreloc, seisshadow, seisradius):
//
//  1. P times, no catalogue location, no radius (seisreloc). Per quake, as
//     there: a centre and a free cubic t = c0 + c1 u + c2 u² + c3 u³,
//     u = δ/100 (δ in degrees: great circle on the globe, straight distance on
//     an azimuthal equidistant map for the flat model), 25-95°, 3σ exclusion
//     of the others one at a time. Then the COMMON curve: one law for every
//     quake, only the centre and c0 (origin time) free per quake,
//
//     t_qi = c0_q + c1 u_qi + c2 u_qi² + c3 u_qi³,
//
//     fitted by alternation: each quake's centre and c0 with the shape held
//     (c0 = mean of t − S(u)), then the shape (c1, c2, c3) by least squares
//     on all quakes at once with the quake means removed, until the pooled
//     scatter stops moving. The same procedure for the globe and the flat map.
//     The depth limit is what makes one curve fair: below 70 km a quake's
//     depth mostly shifts its times by a constant, which c0 absorbs.
//     The flat map is the North Pole map, and the best single map found by
//     scanning centres with the per-quake curves (20° grid, then finer, as in
//     seisreloc; at most ScanMax stations per quake during the scan), the
//     criterion that favours the flat model most; the common curve is then
//     fitted on the TopMaps best centres of that scan and the best kept.
//
//  2. The shadow zone (seisshadow): each station's class from the ISC phase
//     names (direct P / Pdif only / PKP only), the globe at 103° without fit,
//     flat maps with their best ring (one per quake, or one for all) over
//     every map centre (5° grid, then 1°, then 0.25°).
//
//  3. The radius from Rayleigh arrivals (seisradius): R = v t / Δ, Δ the
//     great-circle angle between the ISC epicentre and the station, t the
//     arrival minus the ISC origin time, v = 3.5 km/s, or the speed weighted
//     by the ocean share of the path (3.6 / 2.97 km/s, the tab's SEIS_V_OCEAN
//     and SEIS_V_CONTINENT, Hearn 2024): the box statistics of every arrival,
//     and of the per-quake medians. A check: the epicentre, origin time and
//     the speeds come from globe models.
//
// Bulletins: ISC On-line Bulletin, https://doi.org/10.31905/D808B830 (event
// catalogue and comprehensive ISF2 bulletins by event id).
package seisbulk

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"

	"flatorglobe/tools/internal/build/seisradius"
	"flatorglobe/tools/internal/build/seisreloc"
	"flatorglobe/tools/internal/build/seisshadow"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Out = "src/data/presets/seis-bulk.js"
	// MinP is the least number of P stations 25-95° from our centre for a quake to count.
	MinP = 50
	// ScanMax thins each quake to at most this many stations while the map centres are scanned.
	ScanMax = 200
	// TopMaps is how many of the scan's best centres get the common-curve fit.
	TopMaps = 5
	// V20, VOcean, VCont are the tab's Rayleigh group speeds (km/s).
	V20, VOcean, VCont = 3.5, 3.6, 2.97
)

var tagRe = regexp.MustCompile(`<[^>]*>`)

// plain removes the HTML of a bulletin fetched by event id (links around
// station codes); the visible text keeps the ISF columns.
func Plain(b []byte) []byte {
	s := tagRe.ReplaceAllString(string(b), "")
	s = strings.NewReplacer("&amp;", "&", "&lt;", "<", "&gt;", ">").Replace(s)
	return []byte(s)
}

// asEvent is the event as the named-quake parsers want it; SearchStart is
// ten minutes before the origin (only its time of day is used).
func AsEvent(ev Event) seisradius.Event {
	t := HmsSec(ev.Time) - 600
	if t < 0 {
		t += 86400
	}
	h, m, s := int(t)/3600, int(t)%3600/60, int(t)%60
	return seisradius.Event{Key: ev.ID, Name: ev.ID, Date: ev.Date, OTime: ev.Time,
		Lat: json.Number(strconv.FormatFloat(ev.Lat, 'f', -1, 64)), Lon: json.Number(strconv.FormatFloat(ev.Lon, 'f', -1, 64)),
		SearchStart: fmt.Sprintf("%s %02d:%02d:%02d", ev.Date, h, m, s)}
}

func HmsSec(s string) float64 {
	p := strings.Split(s, ":")
	h, _ := strconv.Atoi(p[0])
	m, _ := strconv.Atoi(p[1])
	x, _ := strconv.ParseFloat(p[2], 64)
	return float64(h*3600+m*60) + x
}

// Quake is one earthquake of the sample.
type Quake struct {
	Ev    Event
	P     []seisreloc.Pick // the P picks 25-95° from our globe centre
	G     *seisreloc.Fit   // our globe fit
	FNP   *seisreloc.Fit   // the North Pole map, per-quake curve
	FBest *seisreloc.Fit   // the best single map, per-quake curve
	LR    []float64        // Rayleigh radii, v = 3.5 km/s
	LRc   []float64        // Rayleigh radii, ocean-weighted speed
	Sh    seisshadow.Quake
	Named string // the named quake's key when it is one of the nine
}

// Result of a build.
type Result struct {
	Quakes          []*Quake
	Dropped         int // fewer than MinP P stations
	Cat             int
	Scan            []scanRow
	Best            [2]float64
	PerQ, Common    map[string]*poolFit // "globe", "pole", "best"
	ShGlobe         shGlobe
	ShPole          seisshadow.Map
	ShBest, ShOwn   seisshadow.Map
	ShQ             []seisshadow.Quake
	RadAll, RadAllC boxStats
	RadMed, RadMedC boxStats
	Log             []string
}

type scanRow struct {
	C   [2]float64
	RMS float64
}

func parallel(n int, f func(i int)) {
	w := runtime.NumCPU()
	ch := make(chan int)
	var wg sync.WaitGroup
	for k := 0; k < w; k++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range ch {
				f(i)
			}
		}()
	}
	for i := 0; i < n; i++ {
		ch <- i
	}
	close(ch)
	wg.Wait()
}

// named matches a catalogue event to one of the nine (same day, origin within two minutes, within 1°).
func named(root string, ev Event) string {
	evs, err := seisradius.ReadEvents(root)
	if err != nil {
		return ""
	}
	for _, n := range evs {
		la, _ := n.Lat.Float64()
		lo, _ := n.Lon.Float64()
		if n.Date == ev.Date && math.Abs(HmsSec(n.OTime)-HmsSec(ev.Time)) < 120 && seisradius.GreatCircleDeg(la, lo, ev.Lat, ev.Lon) < 1 {
			return n.Key
		}
	}
	return ""
}

// Compute runs the three syntheses.
func Compute(root string, progress func(string)) (*Result, error) {
	evs, err := ReadCatalogue(root)
	if err != nil {
		return nil, err
	}
	land, err := seisradius.LoadLand(filepath.Join(root, seisradius.Land))
	if err != nil {
		return nil, err
	}
	res := &Result{Cat: len(evs)}
	qs := make([]*Quake, len(evs))
	errs := make([]error, len(evs))
	parallel(len(evs), func(i int) {
		qs[i], errs[i] = load(root, evs[i], land)
	})
	for i, e := range errs {
		if e != nil {
			return nil, fmt.Errorf("%s: %w", evs[i].ID, e)
		}
		if qs[i].G == nil { // kept for the shadow and the radius, not for P
			res.Dropped++
		}
		qs[i].Named = named(root, evs[i])
		res.Quakes = append(res.Quakes, qs[i])
	}
	progress(fmt.Sprintf("%d quakes kept of %d", len(res.Quakes), len(evs)))
	if err := res.scanMaps(progress); err != nil {
		return nil, err
	}
	res.pooled(progress)
	res.shadow(progress)
	res.radius()
	return res, nil
}

func load(root string, ev Event, land *seisradius.LandIndex) (*Quake, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, ev.ID+".isf"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch seis-radius)", err)
	}
	b = Plain(b)
	se := AsEvent(ev)
	q := &Quake{Ev: ev}
	// shadow and radius use every quake of the rule; P needs MinP stations
	if sh, err := seisshadow.ReadData(b, se); err == nil {
		q.Sh = sh
	}
	for _, r := range seisradius.ParseData(b, se) {
		of := land.OceanFraction(ev.Lat, ev.Lon, r.StaLat, r.StaLon, r.Dist)
		rad := r.Dist * math.Pi / 180
		q.LR = append(q.LR, V20*r.Travel/rad)
		q.LRc = append(q.LRc, (of*VOcean+(1-of)*VCont)*r.Travel/rad)
	}
	P, _ := seisreloc.PicksData(b, HmsSec(se.SearchStart[len(se.SearchStart)-8:]), "P")
	if len(P) < MinP {
		return q, nil
	}
	g, sel, err := seisreloc.RelocateGlobe(P)
	if err != nil || g.N < MinP {
		return q, nil
	}
	for i, p := range P {
		if sel[i] {
			q.P = append(q.P, p)
		}
	}
	q.G = g
	all := make([]bool, len(q.P))
	for i := range all {
		all[i] = true
	}
	if q.FNP, err = seisreloc.FlatFit(q.P, all, [2]float64{90, 0}, g.Centre, true); err != nil {
		return nil, err
	}
	return q, nil
}

// pq are the quakes with a P fit.
func (r *Result) pq() []*Quake {
	var out []*Quake
	for _, q := range r.Quakes {
		if q.G != nil {
			out = append(out, q)
		}
	}
	return out
}

// scanMaps scores each map centre by the n-weighted rms of the per-quake flat fits.
func (r *Result) scanMaps(progress func(string)) error {
	qs := r.pq()
	thin := make([][]seisreloc.Pick, len(qs))
	for i, q := range qs {
		P := q.P
		if len(P) > ScanMax {
			st := int(math.Ceil(float64(len(P)) / float64(ScanMax)))
			var t []seisreloc.Pick
			for k := 0; k < len(P); k += st {
				t = append(t, P[k])
			}
			P = t
		}
		thin[i] = P
	}
	score := func(cs [][2]float64) ([]scanRow, error) {
		rows := make([]scanRow, len(cs))
		type job struct{ c, q int }
		sd := make([][]float64, len(cs))
		ns := make([][]int, len(cs))
		for i := range cs {
			sd[i], ns[i] = make([]float64, len(qs)), make([]int, len(qs))
		}
		var mu sync.Mutex
		var first error
		parallel(len(cs)*len(qs), func(k int) {
			ci, qi := k/len(qs), k%len(qs)
			sel := make([]bool, len(thin[qi]))
			for i := range sel {
				sel[i] = true
			}
			f, err := seisreloc.FlatFit(thin[qi], sel, cs[ci], qs[qi].G.Centre, false)
			if err != nil {
				mu.Lock()
				first = err
				mu.Unlock()
				return
			}
			sd[ci][qi], ns[ci][qi] = f.SD, f.N
		})
		if first != nil {
			return nil, first
		}
		for i, c := range cs {
			num, den := 0.0, 0
			for qi := range qs {
				num += float64(ns[i][qi]) * sd[i][qi] * sd[i][qi]
				den += ns[i][qi]
			}
			rows[i] = scanRow{c, math.Sqrt(num / float64(den))}
		}
		return rows, nil
	}
	var grid [][2]float64
	for la := -80; la <= 80; la += 20 {
		for lo := -180; lo < 180; lo += 20 {
			grid = append(grid, [2]float64{float64(la), float64(lo)})
		}
	}
	grid = append(grid, [2]float64{90, 0})
	rows, err := score(grid)
	if err != nil {
		return err
	}
	progress("20° grid")
	around := func(b [2]float64, h, st float64) [][2]float64 {
		var out [][2]float64
		for a := -h; a <= h+1e-9; a += st {
			for o := -h; o <= h+1e-9; o += st {
				if math.Abs(b[0]+a) < 90 && (a != 0 || o != 0) {
					lo := math.Mod(b[1]+o+540, 360) - 180
					out = append(out, [2]float64{b[0] + a, lo})
				}
			}
		}
		return out
	}
	for _, s := range [][2]float64{{15, 5}, {4, 2}} {
		b := rows[bestRow(rows)].C
		more, err := score(around(b, s[0], s[1]))
		if err != nil {
			return err
		}
		rows = append(rows, more...)
		progress(fmt.Sprintf("fine ±%g°", s[0]))
	}
	r.Scan = rows
	r.Best = rows[bestRow(rows)].C
	qsAll := qs
	parallel(len(qsAll), func(i int) {
		q := qsAll[i]
		all := make([]bool, len(q.P))
		for k := range all {
			all[k] = true
		}
		q.FBest, _ = seisreloc.FlatFit(q.P, all, r.Best, q.G.Centre, true)
	})
	return nil
}

func bestRow(rows []scanRow) int {
	b := 0
	for i, x := range rows {
		if x.RMS < rows[b].RMS {
			b = i
		}
	}
	return b
}

// topCentres are the n best distinct centres of the scan.
func (r *Result) topCentres(n int) [][2]float64 {
	idx := make([]int, len(r.Scan))
	for i := range idx {
		idx[i] = i
	}
	sort.SliceStable(idx, func(a, b int) bool { return r.Scan[idx[a]].RMS < r.Scan[idx[b]].RMS })
	var out [][2]float64
	for _, i := range idx {
		if len(out) == n {
			break
		}
		out = append(out, r.Scan[i].C)
	}
	return out
}

// shadow scores the globe and every flat map on the pooled stations.
func (r *Result) shadow(progress func(string)) {
	for _, q := range r.Quakes {
		if len(q.Sh.St) >= MinP {
			r.ShQ = append(r.ShQ, q.Sh)
		}
	}
	r.ShGlobe = globeShadow(r.ShQ)
	r.ShPole = seisshadow.Score(r.ShQ, 90, 0)
	var cs [][2]float64
	for la := -90.0; la <= 90; la += 5 {
		for lo := -180.0; lo < 180; lo += 5 {
			cs = append(cs, [2]float64{la, lo})
			if math.Abs(la) == 90 {
				break
			}
		}
	}
	best := func(cs [][2]float64, key func(seisshadow.Map) float64, cur seisshadow.Map) seisshadow.Map {
		ms := make([]seisshadow.Map, len(cs))
		parallel(len(cs), func(i int) { ms[i] = seisshadow.Score(r.ShQ, cs[i][0], cs[i][1]) })
		b := cur
		for _, m := range ms {
			if b.Own == nil || key(m) > key(b) {
				b = m
			}
		}
		return b
	}
	refine := func(key func(seisshadow.Map) float64) seisshadow.Map {
		m := best(cs, key, seisshadow.Map{})
		for _, s := range [][2]float64{{5, 1}, {1, 0.25}} {
			var fine [][2]float64
			for a := -s[0]; a <= s[0]+1e-9; a += s[1] {
				for o := -s[0]; o <= s[0]+1e-9; o += s[1] {
					if la := m.Lat + a; la >= -90 && la <= 90 {
						fine = append(fine, [2]float64{la, math.Mod(m.Lon+o+540, 360) - 180})
					}
				}
			}
			m = best(fine, key, m)
		}
		return m
	}
	r.ShBest = refine(func(m seisshadow.Map) float64 { return m.Common })
	progress("shadow: one ring")
	r.ShOwn = refine(func(m seisshadow.Map) float64 { return m.OwnAll })
	progress("shadow: own rings")
}

type shGlobe struct {
	Fixed             []float64
	FixedAll, BestAll float64
	BestR             float64
}

func globeShadow(qs []seisshadow.Quake) shGlobe {
	var g shGlobe
	ok, n := 0, 0
	var all []float64
	var dir []bool
	for _, q := range qs {
		k := 0
		for _, s := range q.St {
			if (s.Delta < seisshadow.Edge) == (s.Cls == 0) {
				k++
			}
			all = append(all, s.Delta)
			dir = append(dir, s.Cls == 0)
		}
		g.Fixed = append(g.Fixed, float64(k)/float64(len(q.St)))
		ok += k
		n += len(q.St)
	}
	g.FixedAll = float64(ok) / float64(n)
	// the globe's best single threshold, for the symmetric margin
	idx := make([]int, len(all))
	for i := range idx {
		idx[i] = i
	}
	sort.Slice(idx, func(a, b int) bool { return all[idx[a]] < all[idx[b]] })
	out := 0
	for _, d := range dir {
		if !d {
			out++
		}
	}
	bestN, in := out, 0
	for j, i := range idx {
		if dir[i] {
			in++
		} else {
			out--
		}
		if j+1 < len(idx) && all[idx[j+1]] == all[i] {
			continue
		}
		if in+out > bestN {
			bestN = in + out
			if j+1 < len(idx) {
				g.BestR = (all[i] + all[idx[j+1]]) / 2
			}
		}
	}
	g.BestAll = float64(bestN) / float64(n)
	return g
}

// boxStats is the tab's ctStats: linear quantiles, whiskers at 1.5 IQR.
type boxStats struct {
	N                         int
	Q1, Med, Q3, Lo, Hi, Mean float64
	Out                       int
}

func box(v []float64) boxStats {
	v = append([]float64(nil), v...)
	sort.Float64s(v)
	n := len(v)
	q := func(p float64) float64 {
		i := float64(n-1) * p
		lo, hi := int(math.Floor(i)), int(math.Ceil(i))
		return v[lo] + (v[hi]-v[lo])*(i-float64(lo))
	}
	s := boxStats{N: n, Q1: q(0.25), Med: q(0.5), Q3: q(0.75)}
	iqr := s.Q3 - s.Q1
	s.Lo, s.Hi = v[n-1], v[0]
	sum := 0.0
	for _, x := range v {
		sum += x
		if x >= s.Q1-1.5*iqr && x < s.Lo {
			s.Lo = x
		}
		if x <= s.Q3+1.5*iqr && x > s.Hi {
			s.Hi = x
		}
	}
	for _, x := range v {
		if x < s.Lo || x > s.Hi {
			s.Out++
		}
	}
	s.Mean = sum / float64(n)
	return s
}

func median(v []float64) float64 { return box(v).Med }

func (r *Result) radius() {
	var all, allc, med, medc []float64
	for _, q := range r.Quakes {
		all = append(all, q.LR...)
		allc = append(allc, q.LRc...)
		if len(q.LR) >= 5 {
			med = append(med, median(q.LR))
			medc = append(medc, median(q.LRc))
		}
	}
	r.RadAll, r.RadAllC, r.RadMed, r.RadMedC = box(all), box(allc), box(med), box(medc)
	r.Log = append(r.Log, fmt.Sprintf("radius: %d arrivals, median %.0f km (corrected %.0f); %d quake medians %.0f km",
		r.RadAll.N, r.RadAll.Med, r.RadAllC.Med, r.RadMed.N, r.RadMed.Med))
}

func r1(x float64) float64 { return pyjson.Round(x, 1) }
func r2(x float64) float64 { return pyjson.Round(x, 2) }
func r4(x float64) float64 { return pyjson.Round(x, 4) }

func boxObj(s boxStats) pyjson.Obj {
	return pyjson.Obj{{K: "n", V: s.N}, {K: "q1", V: r1(s.Q1)}, {K: "med", V: r1(s.Med)}, {K: "q3", V: r1(s.Q3)},
		{K: "lo", V: r1(s.Lo)}, {K: "hi", V: r1(s.Hi)}, {K: "mean", V: r1(s.Mean)}, {K: "out", V: s.Out}}
}

func ints(v []int) []any {
	out := make([]any, len(v))
	for i, x := range v {
		out[i] = x
	}
	return out
}

func floats(v []float64, f func(float64) float64) []any {
	out := make([]any, len(v))
	for i, x := range v {
		out[i] = f(x)
	}
	return out
}

// File renders the preset.
func (r *Result) File() preset.File {
	qs := r.pq()
	years := map[string]bool{}
	for _, q := range r.Quakes {
		years[q.Ev.Date[:4]] = true
	}
	// one row per P quake: lat, lon, Mw, year, n, globe sd, pole sd, best-map sd, then the common-curve sds
	var rows []any
	for _, q := range qs {
		y, _ := strconv.Atoi(q.Ev.Date[:4])
		row := []any{r2(q.Ev.Lat), r2(q.Ev.Lon), q.Ev.Mw, y, q.G.N, r2(q.G.SD), r2(q.FNP.SD), r2(q.FBest.SD)}
		for _, k := range []string{"globe", "pole", "best"} {
			row = append(row, r2(r.Common[k].PerQ[q]))
		}
		row = append(row, q.Named)
		rows = append(rows, row)
	}
	fits := pyjson.Obj{}
	for _, k := range []string{"globe", "pole", "best"} {
		fits = append(fits, pyjson.KV{K: k, V: r.PerQ[k].obj()})
	}
	common := pyjson.Obj{}
	for _, k := range []string{"globe", "pole", "best"} {
		common = append(common, pyjson.KV{K: k, V: r.Common[k].obj()})
	}
	var scan []any
	for _, s := range r.Scan {
		scan = append(scan, []any{r2(s.C[0]), r2(s.C[1]), r2(s.RMS)})
	}
	P := pyjson.Obj{{K: "cat", V: r.Cat}, {K: "dropped", V: r.Dropped}, {K: "minP", V: MinP}, {K: "best", V: []any{r2(r.Best[0]), r2(r.Best[1])}},
		{K: "cbest", V: []any{r2(r.Common["best"].Centre[0]), r2(r.Common["best"].Centre[1])}},
		{K: "quakes", V: rows}, {K: "perq", V: fits}, {K: "common", V: common}, {K: "scan", V: scan}}

	var shq []any
	for i, q := range r.ShQ {
		shq = append(shq, []any{r2(q.Lat), r2(q.Lon), len(q.St), r4(r.ShGlobe.Fixed[i]), r4(r.ShPole.Own[i]), r4(r.ShOwn.Own[i])})
	}
	g := r.ShGlobe
	sh := pyjson.Obj{{K: "quakes", V: shq},
		{K: "globe", V: pyjson.Obj{{K: "fixedAll", V: r4(g.FixedAll)}, {K: "bestAll", V: r4(g.BestAll)}, {K: "bestR", V: r2(g.BestR)}}},
		{K: "pole", V: shMapObj(r.ShPole)}, {K: "common", V: shMapObj(r.ShBest)}, {K: "own", V: shMapObj(r.ShOwn)},
		{K: "hist", V: r.shHist()}}

	rad := pyjson.Obj{{K: "all", V: boxObj(r.RadAll)}, {K: "allc", V: boxObj(r.RadAllC)}, {K: "med", V: boxObj(r.RadMed)}, {K: "medc", V: boxObj(r.RadMedC)}}
	nq := 0
	for _, q := range r.Quakes {
		if len(q.LR) > 0 {
			nq++
		}
	}
	rad = append(rad, pyjson.KV{K: "quakes", V: nq})

	compact := pyjson.Opts{Item: ",", Key: ":", ASCII: true}
	body := "// the pooled P fits (per-quake curve, then one common curve), the shadow and the Rayleigh radius\n" +
		"export const BULK_P = " + pyjson.Dumps(P, compact) + ";\n" +
		"export const BULK_SHADOW = " + pyjson.Dumps(sh, compact) + ";\n" +
		"export const BULK_RADIUS = " + pyjson.Dumps(rad, compact) + ";\n"
	return preset.File{
		Out: Out, Command: "build seis-bulk", Inputs: []string{Cat, "data/seis/inputs.lock"},
		Notes: []string{
			"Every shallow (<= 70 km) earthquake of GCMT Mw >= 7.0, 2000-2023, in the reviewed ISC Bulletin (doi 10.31905/D808B830),",
			"pooled: P times relocated by us (globe and flat maps, a cubic per quake and one common cubic), the P shadow",
			"zone, and the Rayleigh-wave radius. BULK_P.quakes rows: [lat, lon, Mw, year, P stations, sd globe, sd North Pole",
			"map, sd best map, then the same three with the common curve, named key]. Method: go doc ./internal/build/seisbulk.",
		},
		Body: body,
	}
}

func shMapObj(m seisshadow.Map) pyjson.Obj {
	return pyjson.Obj{{K: "c", V: []any{r2(m.Lat), r2(m.Lon)}}, {K: "common", V: r4(m.Common)}, {K: "commonR", V: r2(m.CommonR)},
		{K: "ownAll", V: r4(m.OwnAll)}}
}

// shHist: per 2° bin, stations with a direct P and all stations, against the
// globe's Δ (0-180) and against the distance on the best one-ring map and the
// North Pole map (0-360).
func (r *Result) shHist() pyjson.Obj {
	g := make([][2]int, 90)
	b := make([][2]int, 180)
	p := make([][2]int, 180)
	add := func(h [][2]int, d float64, dir bool) {
		i := int(d / 2)
		if i < 0 || i >= len(h) {
			return
		}
		h[i][1]++
		if dir {
			h[i][0]++
		}
	}
	for _, q := range r.ShQ {
		bx, by := seisshadow.AE(r.ShBest.Lat, r.ShBest.Lon, q.Lat, q.Lon)
		px, py := seisshadow.AE(90, 0, q.Lat, q.Lon)
		for _, s := range q.St {
			add(g, s.Delta, s.Cls == 0)
			x, y := seisshadow.AE(r.ShBest.Lat, r.ShBest.Lon, s.Lat, s.Lon)
			add(b, math.Hypot(x-bx, y-by), s.Cls == 0)
			x, y = seisshadow.AE(90, 0, s.Lat, s.Lon)
			add(p, math.Hypot(x-px, y-py), s.Cls == 0)
		}
	}
	flat := func(h [][2]int) []any {
		out := make([]any, 0, 2*len(h))
		for _, c := range h {
			out = append(out, c[0], c[1])
		}
		return out
	}
	return pyjson.Obj{{K: "bin", V: 2}, {K: "globe", V: flat(g)}, {K: "common", V: flat(b)}, {K: "pole", V: flat(p)}}
}
