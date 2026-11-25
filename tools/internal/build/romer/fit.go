package romer

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
)

// nIo is a trial mean motion of Io (deg/day); the fit adds its correction. Mean motions of Io and Europa
// (J. H. Lieske, A&A 82 (1980) 340): the Laplace term's period comes from them and from Jupiter's, no distance.
const (
	nIo     = 203.488955
	nEur    = 101.374724
	nJupDay = 0.0830853 // Jupiter's mean motion, deg/day (Standish, Table 2a rate / 36525)
	halfA0  = 9.6       // deg, a first value of the shadow's half-arc (only the shape of its seasonal change is used)
)

// Options selects a variant of the fit.
type Options struct {
	Orbits string // "kepler" (angles and periods: the measure) or "de440" (the check)
	Mode   byte   // 0 all, 'V' visual, 'P' photometric
	Sites  bool   // one free offset per site with at least MinSite timings
	Free12 bool   // a free term of Jupiter's year (cos M, sin M) beside the light time
	Flat   bool   // no light time: the flat model's best free curve instead
	Clock  bool   // with Flat: no curve at all, Io's clock alone (how big the effect is)
	Y0, Y1 int
}

// MinSite is the number of timings a site needs to get its own offset.
const MinSite = 30

// Fit is one adjustment.
type Fit struct {
	Opt      Options
	N, Drop  int
	Rms      float64 // s, weighted residuals' rms of the kept timings
	As, DAs  float64 // s per AU, light time over one astronomical unit and its formal error
	Boot     float64 // s per AU, bootstrap error over oppositions (0 when not computed)
	Laplace  float64 // s, amplitude of the Laplace term
	Vis      float64 // s per AU, visual disappearance/reappearance drift with distance
	Coef     map[string]float64
	Sigma    map[string]float64
	Sites    int
	Opp      int // oppositions
	obs      []*Obs
	g        []geo
	keep     []bool
	res      []float64 // s
	X        [][]float64
	y, w     []float64
	names    []string
	timeless []float64 // s: the delay seen, residual + the light-time term, per timing (globe fits)
}

func (f *Fit) col(name string) int {
	for i, n := range f.names {
		if n == name {
			return i
		}
	}
	return -1
}

// design builds the equation of every timing. The event happens at Jupiter at t_e = t_o − A_s·d (TT), when Io's mean
// longitude, plus the periodic terms, reaches the shadow's edge:
//
//	λ₀ + n·(t_e − t̄) + ½ṅ(t_e − t̄)² + L(t_e) = ℓ(t_e) ∓ h(δ) + c_D/R + c_site + v·(±)(d − 5.2)
//
// with ℓ the longitude of the shadow's axis in Jupiter's equator, h the half-arc of the shadow (− for a disappearance D,
// + for a reappearance R), δ the Sun's jovicentric declination, L the Laplace term of period 437.6 d (the forced
// eccentricity of Io, whose perijove turns with the Io-Europa conjunctions at 2n₂ − n₁), and v a drift of visual timings
// with distance, of opposite sign for D and R (a fainter Io at a greater distance is lost earlier and found later).
// Moving n·t_o to the right side, the light time appears as −n·A_s·d: linear in the unknown A_s.
func (f *Fit) design(o orbits, As float64) {
	t0 := 0.0
	for _, ob := range f.obs {
		t0 += ob.JD
	}
	t0 /= float64(len(f.obs))
	f.g = make([]geo, len(f.obs))
	f.y = make([]float64, len(f.obs))
	f.w = make([]float64, len(f.obs))
	f.X = make([][]float64, len(f.obs))
	f.names = []string{"lam0", "n", "ndot", "lapS", "lapC", "DR", "vis"}
	if f.Opt.Flat && !f.Opt.Clock {
		f.names = append(f.names, "s1c", "s1s", "s2c", "s2s", "mjc", "mjs")
	} else if f.Opt.Clock {
	} else {
		f.names = append(f.names, "p")
		if f.Opt.Free12 {
			f.names = append(f.names, "mjc", "mjs")
		}
	}
	siteIdx := map[string]int{}
	if f.Opt.Sites {
		cnt := map[string]int{}
		for i, ob := range f.obs {
			if f.keep == nil || f.keep[i] {
				cnt[ob.Site]++
			}
		}
		var big []string
		for s, n := range cnt {
			if n >= MinSite {
				big = append(big, s)
			}
		}
		sort.Strings(big)
		for _, s := range big[min(1, len(big)):] { // the first site is the reference
			siteIdx[s] = len(f.names)
			f.names = append(f.names, "site:"+s)
		}
		f.Sites = len(big)
	}
	for i, ob := range f.obs {
		g := geometry(o, ob.JD, As)
		f.g[i] = g
		sgn := 1.0
		if ob.Event == 'R' {
			sgn = -1
		}
		h := halfArc(g.dec, halfA0)
		f.y[i] = g.lon - sgn*h - nIo*(g.to-t0)
		tt := (g.to - t0) / 36525
		th := (nJupDay - (2*nEur - nIo)) * d2r * (g.te - j2000)
		vis := 0.0
		if ob.Mode == 'V' {
			vis = sgn * (g.d - 5.2)
		}
		row := []float64{1, tt, tt * tt / 10, math.Sin(th), math.Cos(th), sgn, vis}
		if f.Opt.Clock {
		} else if f.Opt.Flat {
			row = append(row, math.Cos(g.syn), math.Sin(g.syn), math.Cos(2*g.syn), math.Sin(2*g.syn), math.Cos(g.mJ), math.Sin(g.mJ))
		} else {
			row = append(row, g.d)
			if f.Opt.Free12 {
				row = append(row, math.Cos(g.mJ), math.Sin(g.mJ))
			}
		}
		for len(row) < len(f.names) {
			row = append(row, 0)
		}
		if k, ok := siteIdx[ob.Site]; ok {
			row[k] = 1
		}
		f.X[i] = row
		f.w[i] = 1 / (ob.Sigma / secDay * nIo)
	}
}

// wrap brings every phase within half a turn of ref.
func (f *Fit) wrap(ref float64) {
	for i := range f.y {
		f.y[i] -= 360 * math.Round((f.y[i]-ref)/360)
	}
}

// solve is a weighted least-squares fit by the normal equations (Cholesky), with the columns scaled to unit norm.
func solve(X [][]float64, y, w []float64, keep []bool) ([]float64, [][]float64, error) {
	p := len(X[0])
	sc := make([]float64, p)
	for i := range X {
		if keep[i] {
			for j := 0; j < p; j++ {
				sc[j] += (X[i][j] * w[i]) * (X[i][j] * w[i])
			}
		}
	}
	zero := make([]bool, p)
	for j := range sc {
		if sc[j] == 0 {
			sc[j], zero[j] = 1, true // a column with no timing (e.g. the visual drift in a photometric set): fixed at 0
		}
		sc[j] = math.Sqrt(sc[j])
	}
	A := make([][]float64, p)
	for j := range A {
		A[j] = make([]float64, p)
	}
	b := make([]float64, p)
	for i := range X {
		if !keep[i] {
			continue
		}
		ww := w[i] * w[i]
		for j := 0; j < p; j++ {
			xj := X[i][j] / sc[j]
			if xj == 0 {
				continue
			}
			b[j] += ww * xj * y[i]
			for k := 0; k <= j; k++ {
				A[j][k] += ww * xj * X[i][k] / sc[k]
			}
		}
	}
	for j := 0; j < p; j++ {
		for k := j + 1; k < p; k++ {
			A[j][k] = A[k][j]
		}
		if zero[j] {
			A[j][j] = 1
		}
	}
	inv, err := invert(A)
	if err != nil {
		return nil, nil, err
	}
	beta := make([]float64, p)
	for j := 0; j < p; j++ {
		for k := 0; k < p; k++ {
			beta[j] += inv[j][k] * b[k]
		}
	}
	for j := 0; j < p; j++ {
		beta[j] /= sc[j]
		for k := 0; k < p; k++ {
			inv[j][k] /= sc[j] * sc[k]
		}
	}
	return beta, inv, nil
}

// invert is Gauss-Jordan elimination with partial pivoting.
func invert(a [][]float64) ([][]float64, error) {
	n := len(a)
	m := make([][]float64, n)
	for i := range m {
		m[i] = make([]float64, 2*n)
		copy(m[i], a[i])
		m[i][n+i] = 1
	}
	for c := 0; c < n; c++ {
		piv := c
		for r := c + 1; r < n; r++ {
			if math.Abs(m[r][c]) > math.Abs(m[piv][c]) {
				piv = r
			}
		}
		if math.Abs(m[piv][c]) < 1e-12 {
			return nil, fmt.Errorf("singular normal matrix (column %d)", c)
		}
		m[c], m[piv] = m[piv], m[c]
		inv := 1 / m[c][c]
		for k := range m[c] {
			m[c][k] *= inv
		}
		for r := 0; r < n; r++ {
			if r != c && m[r][c] != 0 {
				f := m[r][c]
				for k := range m[r] {
					m[r][k] -= f * m[c][k]
				}
			}
		}
	}
	out := make([][]float64, n)
	for i := range out {
		out[i] = m[i][n:]
	}
	return out, nil
}

// run adjusts one variant: geometry, phases, fit, exclusions at more than 3 standard deviations of the others
// (leave-one-out), refit, until nothing moves; A_s is fed back into the geometry (the event's instant at Jupiter).
func run(o orbits, all []*Obs, opt Options) (*Fit, error) {
	f := &Fit{Opt: opt}
	for _, ob := range all {
		if ob.Sat != 1 || ob.Year < opt.Y0 || ob.Year > opt.Y1 || (opt.Mode != 0 && ob.Mode != opt.Mode) {
			continue
		}
		f.obs = append(f.obs, ob)
	}
	if len(f.obs) < 50 {
		return nil, fmt.Errorf("%d-%d: only %d timings", opt.Y0, opt.Y1, len(f.obs))
	}
	As := 499.0
	if opt.Flat {
		As = 0
	}
	f.keep = make([]bool, len(f.obs))
	for i := range f.keep {
		f.keep[i] = true
	}
	var beta []float64
	var cov [][]float64
	ref := math.NaN()
	for it := 0; it < 25; it++ {
		f.design(o, As)
		if math.IsNaN(ref) {
			// the circular mean of the phases, then a first cut at 3° (≈ 21 min) of it: grossly wrong lines
			var cs, sn float64
			for _, y := range f.y {
				cs += math.Cos(y * d2r)
				sn += math.Sin(y * d2r)
			}
			ref = math.Atan2(sn, cs) / d2r
			f.wrap(ref)
			for i, y := range f.y {
				if math.Abs(y-ref) > 3 {
					f.keep[i] = false
				}
			}
		} else {
			f.wrap(ref)
		}
		var err error
		beta, cov, err = solve(f.X, f.y, f.w, f.keep)
		if err != nil {
			return nil, err
		}
		f.res = make([]float64, len(f.obs))
		var s2 float64
		n := 0
		for i := range f.obs {
			var m float64
			for j, x := range f.X[i] {
				m += x * beta[j]
			}
			f.res[i] = (f.y[i] - m) / nIo * secDay
			if f.keep[i] {
				s2 += f.res[i] * f.res[i]
				n++
			}
		}
		changed := false
		for i := range f.obs {
			others := s2
			cnt := n
			if f.keep[i] {
				others -= f.res[i] * f.res[i]
				cnt--
			}
			k := math.Abs(f.res[i]) <= 3*math.Sqrt(others/float64(cnt))
			if k != f.keep[i] {
				f.keep[i] = k
				changed = true
			}
		}
		newAs := As
		if !opt.Flat {
			newAs = -beta[f.col("p")] / nIo * secDay
		}
		if !changed && math.Abs(newAs-As) < 0.01 {
			As = newAs
			break
		}
		As = newAs
	}
	f.coef(beta, cov)
	if !opt.Flat {
		f.As = As
		f.DAs = f.Sigma["p"] / nIo * secDay
		jp := f.col("p")
		f.timeless = make([]float64, len(f.obs))
		for i := range f.obs {
			// the delay seen: the light-time term put back, the sign of a delay (later = positive)
			f.timeless[i] = -f.res[i] - f.X[i][jp]*beta[jp]/nIo*secDay
		}
	}
	return f, nil
}

// coef stores the coefficients (deg → s of Io's motion) and their formal errors, scaled by the reduced χ².
func (f *Fit) coef(beta []float64, cov [][]float64) {
	var chi float64
	f.N, f.Drop = 0, 0
	var ss float64
	for i := range f.obs {
		if f.keep[i] {
			f.N++
			r := f.res[i] / f.obs[i].Sigma
			chi += r * r
			ss += f.res[i] * f.res[i]
		} else {
			f.Drop++
		}
	}
	f.Rms = math.Sqrt(ss / float64(f.N))
	red := chi / float64(f.N-len(beta))
	f.Coef, f.Sigma = map[string]float64{}, map[string]float64{}
	for j, nm := range f.names {
		f.Coef[nm] = beta[j]
		f.Sigma[nm] = math.Sqrt(cov[j][j] * red)
	}
	toS := func(x float64) float64 { return x / nIo * secDay }
	f.Laplace = toS(math.Hypot(beta[f.col("lapS")], beta[f.col("lapC")]))
	f.Vis = toS(beta[f.col("vis")])
	opp := map[int]bool{}
	for i, g := range f.g {
		if f.keep[i] {
			opp[oppIndex(g.te)] = true
		}
	}
	f.Opp = len(opp)
}

// S returns a coefficient in seconds of Io's motion.
func (f *Fit) S(name string) float64 { return f.Coef[name] / nIo * secDay }

// SErr returns its formal error in seconds.
func (f *Fit) SErr(name string) float64 { return f.Sigma[name] / nIo * secDay }

// oppIndex numbers the synodic cycles of Jupiter (398.88 d), counted from the opposition of 2000 Nov 28.
func oppIndex(jd float64) int {
	return int(math.Floor((jd - 2451877.0 + 199.44) / 398.884))
}

// bootstrap resamples whole oppositions (an apparition's timings share its weather, observers and clocks) and refits
// the kept timings with the final geometry; the error is the standard deviation of A_s over the replicates.
func (f *Fit) bootstrap(reps int, seed int64) {
	groups := map[int][]int{}
	var ids []int
	for i, g := range f.g {
		if !f.keep[i] {
			continue
		}
		k := oppIndex(g.te)
		if _, ok := groups[k]; !ok {
			ids = append(ids, k)
		}
		groups[k] = append(groups[k], i)
	}
	sort.Ints(ids)
	rng := rand.New(rand.NewSource(seed))
	jp := f.col("p")
	var vals []float64
	for r := 0; r < reps; r++ {
		w := make([]float64, len(f.w))
		keep := make([]bool, len(f.w))
		for range ids {
			for _, i := range groups[ids[rng.Intn(len(ids))]] {
				keep[i] = true
				w[i] += f.w[i] * f.w[i]
			}
		}
		for i := range w {
			w[i] = math.Sqrt(w[i])
		}
		beta, _, err := solve(f.X, f.y, w, keep)
		if err != nil {
			continue
		}
		vals = append(vals, -beta[jp]/nIo*secDay)
	}
	var m, s float64
	for _, v := range vals {
		m += v
	}
	m /= float64(len(vals))
	for _, v := range vals {
		s += (v - m) * (v - m)
	}
	f.Boot = math.Sqrt(s / float64(len(vals)-1))
}
