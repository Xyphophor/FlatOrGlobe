// Package seiswaves builds src/data/presets/seis-waves.js (2026-10-30): how
// the kinds of seismic waves are told apart without a travel-time table, on
// the real three-component records of the 2011 Tōhoku earthquake at GSN
// stations all around it (IU network, EarthScope FDSN services).
//
// A seismometer records three directions of ground motion. Each kind of wave
// moves the ground its own way (Aki & Richards 2002, Quantitative Seismology,
// ch. 4-7; Shearer 2019, Introduction to Seismology, ch. 3, 8):
//
//	P         along the ray: in the vertical plane through the source, linear
//	S (SV/SH) across the ray: SH horizontal and transverse, linear
//	Love      transverse and horizontal, long period, dispersed
//	Rayleigh  an ellipse in the vertical plane through the source, retrograde
//
// so the covariance of the three components over a short window (Flinn 1965,
// Proc. IEEE 53, 1874; Jurkevics 1988, BSSA 78, 1725) tells them apart:
// eigenvalues λ1 ≥ λ2 ≥ λ3 and eigenvectors u1 (main direction), u3 (normal
// to the plane of motion); rectilinearity L = 1 − λ2/λ1. Nothing here uses
// a travel time, an origin time or an Earth model: the P onset is found by
// the ratio of a short to a long running mean of the energy (STA/LTA; Allen
// 1978, BSSA 68, 1521); the direction the P wave came from is read off its
// own motion (u1 of the first seconds, the horizontal part pointing away
// from the source when the vertical part points up), and the horizontal
// components are turned into radial R (away from the source, along that
// measured direction) and transverse T.
//
// Then the measured direction is compared, station by station, with the
// direction of the epicentre computed from latitudes and longitudes taken as
// angles: the great-circle azimuth on the sphere, and the straight line on
// an azimuthal equidistant flat map (North Pole map, and the map centre that
// fits the measured directions best, steel-man). No kilometre enters.
// Sensor orientations come from the station metadata (each channel's azimuth).
package seiswaves

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Dir    = "data/seis/waves"
	RawDir = Dir + "/raw"
	Out    = "src/data/presets/seis-waves.js"
	FS     = 4.0 // samples per second after decimation
)

// Quake is one earthquake of the section: its ISC epicentre (data/seis/events.json), used only as two angles
// for the bearings, and the data window (only a window: no origin or travel time enters the analysis).
type Quake struct {
	Key, Name  string
	Epi        [2]float64
	Start, End time.Time
	Full       bool // the whole record (traces, classes, particle motion), not only the P direction
}

var (
	Quakes = []Quake{
		{"tohoku2011", "Tōhoku 2011", [2]float64{38.2963, 142.4980}, time.Date(2011, 3, 11, 5, 41, 0, 0, time.UTC), time.Date(2011, 3, 11, 8, 16, 0, 0, time.UTC), true},
		{"maule2010", "Maule 2010", [2]float64{-36.2714, -72.9113}, time.Date(2010, 2, 27, 6, 29, 0, 0, time.UTC), time.Date(2010, 2, 27, 7, 4, 0, 0, time.UTC), false},
		{"nias2005", "Nias 2005", [2]float64{2.0998, 97.0957}, time.Date(2005, 3, 28, 16, 4, 0, 0, time.UTC), time.Date(2005, 3, 28, 16, 39, 0, 0, time.UTC), false},
	}
	// Shown are the stations whose Tōhoku traces, motion classes and particle motions are shipped (the others: directions only).
	Shown = []string{"ANMO", "KONO", "CTAO", "COLA"}
)

const d2r = math.Pi / 180

// ---- filters: Butterworth sections (RBJ biquads), run forward and backward (zero phase) ----

type biquad struct{ b0, b1, b2, a1, a2 float64 }

func lowpass(f, fs, q float64) biquad {
	w := 2 * math.Pi * f / fs
	c, al := math.Cos(w), math.Sin(w)/(2*q)
	a0 := 1 + al
	return biquad{(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0}
}

func highpass(f, fs, q float64) biquad {
	w := 2 * math.Pi * f / fs
	c, al := math.Cos(w), math.Sin(w)/(2*q)
	a0 := 1 + al
	return biquad{(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0}
}

func (q biquad) run(x []float64) {
	var x1, x2, y1, y2 float64
	for i, v := range x {
		y := q.b0*v + q.b1*x1 + q.b2*x2 - q.a1*y1 - q.a2*y2
		x2, x1, y2, y1 = x1, v, y1, y
		x[i] = y
	}
}

func reverse(x []float64) {
	for i, j := 0, len(x)-1; i < j; i, j = i+1, j-1 {
		x[i], x[j] = x[j], x[i]
	}
}

// bandpass: 4-pole Butterworth high- and low-pass (Q 0.5412, 1.3066), forward and backward.
func bandpass(x []float64, lo, hi, fs float64) []float64 {
	y := append([]float64(nil), x...)
	var qs []biquad
	for _, q := range []float64{0.5412, 1.3066} {
		qs = append(qs, highpass(lo, fs, q), lowpass(hi, fs, q))
	}
	for pass := 0; pass < 2; pass++ {
		for _, q := range qs {
			q.run(y)
		}
		reverse(y)
	}
	return y
}

// ---- 3×3 symmetric eigen (Jacobi) ----

func eig3(a [3][3]float64) ([3]float64, [3][3]float64) {
	v := [3][3]float64{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}
	for sweep := 0; sweep < 50; sweep++ {
		off := a[0][1]*a[0][1] + a[0][2]*a[0][2] + a[1][2]*a[1][2]
		if off < 1e-30*(a[0][0]*a[0][0]+a[1][1]*a[1][1]+a[2][2]*a[2][2]) {
			break
		}
		for p := 0; p < 2; p++ {
			for q := p + 1; q < 3; q++ {
				if a[p][q] == 0 {
					continue
				}
				th := (a[q][q] - a[p][p]) / (2 * a[p][q])
				t := 1 / (math.Abs(th) + math.Sqrt(th*th+1))
				if th < 0 {
					t = -t
				}
				c := 1 / math.Sqrt(t*t+1)
				s := t * c
				for k := 0; k < 3; k++ {
					akp, akq := a[k][p], a[k][q]
					a[k][p], a[k][q] = c*akp-s*akq, s*akp+c*akq
				}
				for k := 0; k < 3; k++ {
					apk, aqk := a[p][k], a[q][k]
					a[p][k], a[q][k] = c*apk-s*aqk, s*apk+c*aqk
				}
				for k := 0; k < 3; k++ {
					vkp, vkq := v[k][p], v[k][q]
					v[k][p], v[k][q] = c*vkp-s*vkq, s*vkp+c*vkq
				}
			}
		}
	}
	idx := []int{0, 1, 2}
	sort.Slice(idx, func(i, j int) bool { return a[idx[i]][idx[i]] > a[idx[j]][idx[j]] })
	var l [3]float64
	var u [3][3]float64 // u[k] = k-th eigenvector
	for k, i := range idx {
		l[k] = a[i][i]
		for r := 0; r < 3; r++ {
			u[k][r] = v[r][i]
		}
	}
	return l, u
}

func cov(c [3][]float64, i0, i1 int) [3][3]float64 {
	var m [3]float64
	n := float64(i1 - i0)
	for k := 0; k < 3; k++ {
		for i := i0; i < i1; i++ {
			m[k] += c[k][i]
		}
		m[k] /= n
	}
	var a [3][3]float64
	for p := 0; p < 3; p++ {
		for q := p; q < 3; q++ {
			s := 0.0
			for i := i0; i < i1; i++ {
				s += (c[p][i] - m[p]) * (c[q][i] - m[q])
			}
			a[p][q], a[q][p] = s/n, s/n
		}
	}
	return a
}

// ---- metadata ----

type chanMeta struct {
	Cha            string
	Lat, Lon       float64
	Az, Dip, Scale float64
	Rate           float64
	Sensor         string
}

func readMeta(b []byte) (map[string]chanMeta, error) {
	out := map[string]chanMeta{}
	for _, l := range strings.Split(string(b), "\n") {
		if l == "" || strings.HasPrefix(l, "#") {
			continue
		}
		f := strings.Split(l, "|")
		if len(f) < 15 {
			continue
		}
		var m chanMeta
		m.Cha, m.Sensor = f[3], f[10]
		var e [6]error
		m.Lat, e[0] = strconv.ParseFloat(f[4], 64)
		m.Lon, e[1] = strconv.ParseFloat(f[5], 64)
		m.Az, e[2] = strconv.ParseFloat(f[8], 64)
		m.Dip, e[3] = strconv.ParseFloat(f[9], 64)
		m.Scale, e[4] = strconv.ParseFloat(f[11], 64)
		m.Rate, e[5] = strconv.ParseFloat(f[14], 64)
		for _, x := range e {
			if x != nil {
				return nil, fmt.Errorf("metadata %q: %w", l, x)
			}
		}
		out[m.Cha] = m
	}
	return out, nil
}

// ---- one station ----

// Win is a window of particle motion: R, T, Z (velocity, scaled), its kind and dominant period.
type Win struct {
	Kind     string
	T0       float64 // s after the P onset
	Step     float64
	R, T, Z  []float64
	Period   float64
	L, Plane float64 // rectilinearity, transverse share of the main direction
	Retro    bool
}

// Station is one analysed station.
type StationRes struct {
	Quake, Sta, Sensor string
	Epi                [2]float64
	Lat, Lon, Delta    float64
	Baz, BazLo, BazHi  float64 // measured from the P motion, and its range over window lengths
	Rect, Inc          float64
	Globe, Pole, Best  float64 // bearings of the epicentre
	Onset              float64 // s after the window start
	Body, Surf         string  // motion classes, one per step
	BodyStep, SurfStep float64
	Trace              [3][]float64 // Z, R, T: min/max per bin, broad band
	TraceBin           float64
	Wins               []Win
	Peak               float64
}

func staLta(x []float64, sta, lta int, from int, thr float64) int {
	e := make([]float64, len(x)+1)
	for i, v := range x {
		e[i+1] = e[i] + v*v
	}
	for i := max(from, lta+sta); i+sta <= len(x); i++ {
		s := (e[i+sta] - e[i]) / float64(sta)
		l := (e[i] - e[i-lta]) / float64(lta)
		if l > 0 && s/l > thr {
			return i
		}
	}
	return -1
}

func zeroCrossPeriod(x []float64, fs float64) float64 {
	n := 0
	for i := 1; i < len(x); i++ {
		if (x[i-1] < 0) != (x[i] < 0) {
			n++
		}
	}
	if n == 0 {
		return 0
	}
	return 2 * float64(len(x)) / fs / float64(n)
}

// pAzimuth: the source direction (degrees from north) from the main direction of the P motion.
func pAzimuth(n, e, z []float64, i0, i1 int) (baz, rect, inc float64) {
	l, u := eig3(cov([3][]float64{n, e, z}, i0, i1))
	v := u[0]
	if v[2] < 0 {
		v = [3]float64{-v[0], -v[1], -v[2]}
	}
	baz = math.Mod(math.Atan2(-v[1], -v[0])/d2r+360, 360)
	return baz, 1 - l[1]/l[0], math.Atan2(math.Hypot(v[0], v[1]), v[2]) / d2r
}

func circDiff(a, b float64) float64 { return math.Mod(a-b+540, 360) - 180 }

// classify one window of (R, T, Z): '.', 'p' linear in the path plane, 't' linear transverse,
// 'r' retrograde ellipse in the path plane, 'm' other.
func classify(r, t, z []float64, i0, i1 int, floor float64) byte {
	a := cov([3][]float64{r, t, z}, i0, i1)
	if a[0][0]+a[1][1]+a[2][2] < floor {
		return '.'
	}
	l, u := eig3(a)
	L := 1 - l[1]/l[0]
	switch {
	case L >= 0.7 && math.Abs(u[0][1]) < 0.5:
		return 'p'
	case L >= 0.7 && math.Abs(u[0][1]) >= 0.8:
		return 't'
	case L < 0.7 && l[2]/l[1] < 0.3 && math.Abs(u[2][1]) > 0.8:
		if area(r, z, i0, i1) > 0 {
			return 'r'
		}
		return 'm'
	}
	return 'm'
}

// area is the signed area swept in the (R, Z) plane: > 0 counter-clockwise, retrograde for a wave travelling towards +R.
func area(r, z []float64, i0, i1 int) float64 {
	s := 0.0
	for i := i0; i+1 < i1; i++ {
		s += r[i]*z[i+1] - r[i+1]*z[i]
	}
	return s / 2
}

var (
	errNoData  = fmt.Errorf("no data")
	errNoOnset = fmt.Errorf("no P onset at 20 times the noise")
)

func analyse(root string, q Quake, sta string, shown bool) (*StationRes, error) {
	mb, err := os.ReadFile(filepath.Join(root, RawDir, q.Key, sta+".txt"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch seis-waves)", err)
	}
	meta, err := readMeta(mb)
	if err != nil {
		return nil, err
	}
	db, err := os.ReadFile(filepath.Join(root, RawDir, q.Key, sta+".mseed"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch seis-waves)", err)
	}
	if len(db) == 0 || len(meta) == 0 {
		return nil, errNoData
	}
	recs, err := Decode(db)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", sta, err)
	}
	var hs []string
	for c := range meta {
		if c != "BHZ" {
			hs = append(hs, c)
		}
	}
	sort.Strings(hs)
	if len(hs) != 2 {
		return nil, fmt.Errorf("%s: horizontal channels %v", sta, hs)
	}
	names := []string{"BHZ", hs[0], hs[1]}
	var tr [3]Trace
	for k, c := range names {
		if tr[k], err = Join(recs, c); err != nil {
			return nil, fmt.Errorf("%s: %w", sta, err)
		}
	}
	// a common start and length
	t0 := tr[0].Start
	for _, t := range tr[1:] {
		if t.Start.After(t0) {
			t0 = t.Start
		}
	}
	rate := tr[0].Rate
	n := math.MaxInt
	var x [3][]float64
	for k := range tr {
		skip := int(math.Round(t0.Sub(tr[k].Start).Seconds() * rate))
		x[k] = tr[k].X[skip:]
		n = min(n, len(x[k]))
	}
	for k := range x {
		x[k] = x[k][:n]
		m := 0.0
		for _, v := range x[k] {
			m += v
		}
		m /= float64(n)
		s := meta[names[k]].Scale
		for i := range x[k] {
			x[k][i] = (x[k][i] - m) / s
		}
		for i := 0; i < n/20; i++ { // cosine taper, 5 % at each end
			w := 0.5 - 0.5*math.Cos(math.Pi*float64(i)/float64(n/20))
			x[k][i] *= w
			x[k][n-1-i] *= w
		}
	}
	// north and east from the two horizontals and their azimuths
	a1, a2 := meta[names[1]].Az*d2r, meta[names[2]].Az*d2r
	N, E := make([]float64, n), make([]float64, n)
	for i := 0; i < n; i++ {
		N[i] = x[1][i]*math.Cos(a1) + x[2][i]*math.Cos(a2)
		E[i] = x[1][i]*math.Sin(a1) + x[2][i]*math.Sin(a2)
	}
	dec := int(math.Round(rate / FS))
	band := func(s []float64, lo, hi float64) []float64 {
		y := bandpass(s, lo, hi, rate)
		out := make([]float64, 0, len(y)/dec+1)
		for i := 0; i < len(y); i += dec {
			out = append(out, y[i])
		}
		return out
	}
	bz, bn, be := band(x[0], 0.05, 0.5), band(N, 0.05, 0.5), band(E, 0.05, 0.5)
	sz, sn, se := band(x[0], 0.01, 0.04), band(N, 0.01, 0.04), band(E, 0.01, 0.04)
	wz, wn, we := band(x[0], 0.01, 0.5), band(N, 0.01, 0.5), band(E, 0.01, 0.5)
	m := len(bz)
	// P onset on the vertical, short periods: STA 2 s, LTA 60 s, energy ratio 20 (the noise alone reaches about 6)
	// (searched after the 5 % taper and a full LTA, so the ramp of the taper cannot trigger it)
	on := staLta(bz, int(2*FS), int(60*FS), n/20/dec+int(60*FS), 20)
	if on < 0 {
		return nil, errNoOnset
	}
	res := &StationRes{Sta: sta, Sensor: meta["BHZ"].Sensor, Lat: meta["BHZ"].Lat, Lon: meta["BHZ"].Lon, Onset: float64(on) / FS}
	var bs []float64
	for _, w := range []float64{6, 8, 10, 12, 14, 16, 18, 20} {
		b, _, _ := pAzimuth(bn, be, bz, on-int(FS), on+int(w*FS))
		bs = append(bs, b)
	}
	res.Baz, res.Rect, res.Inc = pAzimuth(bn, be, bz, on-int(FS), on+int(12*FS))
	res.BazLo, res.BazHi = res.Baz, res.Baz
	for _, b := range bs {
		d := circDiff(b, res.Baz)
		res.BazLo, res.BazHi = math.Min(res.BazLo, res.Baz+d), math.Max(res.BazHi, res.Baz+d)
	}
	if !shown {
		return res, nil
	}
	// R (away from the source, along the measured direction) and T
	cb, sb := math.Cos(res.Baz*d2r), math.Sin(res.Baz*d2r)
	rot := func(nn, ee []float64) ([]float64, []float64) {
		r, t := make([]float64, len(nn)), make([]float64, len(nn))
		for i := range nn {
			r[i] = -nn[i]*cb - ee[i]*sb
			t[i] = nn[i]*sb - ee[i]*cb
		}
		return r, t
	}
	br, bt := rot(bn, be)
	sr, st := rot(sn, se)
	wr, wt := rot(wn, we)
	// motion classes: short periods in 20 s windows every 5 s, long periods in 120 s windows every 15 s;
	// quiet = below 30 times the energy of the minute before the P onset
	noise := func(c [3][]float64) float64 {
		a := cov(c, on-int(70*FS), on-int(10*FS))
		return a[0][0] + a[1][1] + a[2][2]
	}
	nb, ns := noise([3][]float64{br, bt, bz}), noise([3][]float64{sr, st, sz})
	strip := func(r, t, z []float64, win, step, floor float64) string {
		var s []byte
		for i := 0; i+int(win*FS) <= m; i += int(step * FS) {
			s = append(s, classify(r, t, z, i, i+int(win*FS), floor))
		}
		return string(s)
	}
	res.BodyStep, res.SurfStep = 5, 15
	res.Body = strip(br, bt, bz, 20, 5, 30*nb)
	res.Surf = strip(sr, st, sz, 120, 15, 30*ns)
	// traces: broad band, min/max per 6 s bin
	res.TraceBin = 6
	bin := int(res.TraceBin * FS)
	peak := 0.0
	for _, c := range [][]float64{wz, wr, wt} {
		for _, v := range c {
			peak = math.Max(peak, math.Abs(v))
		}
	}
	res.Peak = peak
	for k, c := range [][]float64{wz, wr, wt} {
		for i := 0; i+bin <= m; i += bin {
			lo, hi := c[i], c[i]
			for _, v := range c[i : i+bin] {
				lo, hi = math.Min(lo, v), math.Max(hi, v)
			}
			res.Trace[k] = append(res.Trace[k], lo/peak, hi/peak)
		}
	}
	// four windows of particle motion, found from the records alone
	win := func(kind string, r, t, z []float64, i0, n int, step int) Win {
		i0 = max(0, min(i0, m-n))
		w := Win{Kind: kind, T0: float64(i0-on) / FS, Step: float64(step) / FS}
		pk := 0.0
		for i := i0; i < i0+n; i++ {
			pk = math.Max(pk, math.Max(math.Abs(r[i]), math.Max(math.Abs(t[i]), math.Abs(z[i]))))
		}
		for i := i0; i < i0+n; i += step {
			w.R, w.T, w.Z = append(w.R, r[i]/pk), append(w.T, t[i]/pk), append(w.Z, z[i]/pk)
		}
		l, u := eig3(cov([3][]float64{r, t, z}, i0, i0+n))
		w.L, w.Plane = 1-l[1]/l[0], math.Abs(u[0][1])
		w.Retro = area(r, z, i0, i0+n) > 0
		main := z
		if kind == "S" || kind == "Love" {
			main = t
		}
		w.Period = zeroCrossPeriod(main[i0:i0+n], FS)
		return w
	}
	res.Wins = append(res.Wins, win("P", br, bt, bz, on-int(FS), int(15*FS), 1))
	// S: the first strong onset on the transverse component, short periods, two minutes or more after P
	if s := staLta(bt, int(4*FS), int(60*FS), on+int(120*FS), 6); s > 0 {
		res.Wins = append(res.Wins, win("S", br, bt, bz, s-int(2*FS), int(30*FS), 1))
	}
	// Love and Rayleigh: the strongest minute of the long-period transverse, then vertical, motion
	rms := func(c []float64, w int) int {
		best, bi, s := -1.0, 0, 0.0
		for i := 0; i < m; i++ {
			s += c[i] * c[i]
			if i >= w {
				s -= c[i-w] * c[i-w]
			}
			if i >= w && s > best {
				best, bi = s, i-w
			}
		}
		return bi
	}
	res.Wins = append(res.Wins, win("Love", sr, st, sz, rms(st, int(60*FS))-int(30*FS), int(120*FS), int(FS)))
	res.Wins = append(res.Wins, win("Rayleigh", sr, st, sz, rms(sz, int(60*FS))-int(30*FS), int(120*FS), int(FS)))
	return res, nil
}

// ---- bearings of the epicentre from each station ----

func vec(la, lo float64) [3]float64 {
	return [3]float64{math.Cos(la*d2r) * math.Cos(lo*d2r), math.Cos(la*d2r) * math.Sin(lo*d2r), math.Sin(la * d2r)}
}

// GlobeBearing is the initial great-circle azimuth from (la1, lo1) to (la2, lo2), degrees.
func GlobeBearing(la1, lo1, la2, lo2 float64) float64 {
	p1, p2, dl := la1*d2r, la2*d2r, (lo2-lo1)*d2r
	return math.Mod(math.Atan2(math.Sin(dl)*math.Cos(p2), math.Cos(p1)*math.Sin(p2)-math.Sin(p1)*math.Cos(p2)*math.Cos(dl))/d2r+360, 360)
}

// ae is the azimuthal equidistant map of centre (lat0, lon0) (Snyder 1987, §25), degrees of map.
func ae(lat0, lon0, la, lo float64) (float64, float64) {
	s1, c1 := math.Sin(lat0*d2r), math.Cos(lat0*d2r)
	sp, cp, dl := math.Sin(la*d2r), math.Cos(la*d2r), (lo-lon0)*d2r
	ex, ny := cp*math.Sin(dl), c1*sp-s1*cp*math.Cos(dl)
	nn := math.Hypot(ex, ny)
	c := math.Atan2(nn, s1*sp+c1*cp*math.Cos(dl))
	if nn < 1e-15 {
		return 0, 0
	}
	return c * ex / nn / d2r, c * ny / nn / d2r
}

// FlatBearing: on the flat map of centre c, the direction of the straight line from the station to the
// epicentre, measured from the map's own local north (the direction of increasing latitude on the map).
func FlatBearing(c [2]float64, la, lo, la2, lo2 float64) float64 {
	x, y := ae(c[0], c[1], la, lo)
	xn, yn := ae(c[0], c[1], math.Min(la+0.01, 89.999), lo)
	xe, ye := ae(c[0], c[1], la, lo+0.01/math.Max(0.01, math.Cos(la*d2r)))
	xt, yt := ae(c[0], c[1], la2, lo2)
	n := [2]float64{xn - x, yn - y}
	e := [2]float64{xe - x, ye - y}
	nl, el := math.Hypot(n[0], n[1]), math.Hypot(e[0], e[1])
	n, e = [2]float64{n[0] / nl, n[1] / nl}, [2]float64{e[0] / el, e[1] / el}
	v := [2]float64{xt - x, yt - y}
	// east may not be exactly 90° from north on the map: angle measured in the frame (north, east) projected
	b := math.Atan2(v[0]*e[0]+v[1]*e[1], v[0]*n[0]+v[1]*n[1]) / d2r
	return math.Mod(b+360, 360)
}

// Result of a build.
type Result struct {
	St                         []*StationRes
	Missing                    []string // quake/station without data
	BestC                      [2]float64
	RmsGlobe, RmsPole, RmsBest float64
	Own                        map[string][3]float64 // per quake: its own best map centre and rms
	PerQ                       map[string][3]float64 // per quake: rms globe, pole, the common best map
	Log                        string
}

// medOf is the median absolute difference (robust to the one unstable reading).
func medOf(st []*StationRes, f func(*StationRes) float64) float64 {
	d := make([]float64, len(st))
	for i, x := range st {
		d[i] = math.Abs(circDiff(x.Baz, f(x)))
	}
	sort.Float64s(d)
	if n := len(d); n%2 == 1 {
		return d[n/2]
	} else {
		return (d[n/2-1] + d[n/2]) / 2
	}
}

func rmsOf(st []*StationRes, f func(*StationRes) float64) float64 {
	s := 0.0
	for _, x := range st {
		d := circDiff(x.Baz, f(x))
		s += d * d
	}
	return math.Sqrt(s / float64(len(st)))
}

// bestMap: the flat map centre whose straight-line directions fit the measured ones best (5° grid, then 1°, then 0.2°).
func bestMap(st []*StationRes) ([2]float64, float64) {
	score := func(c [2]float64) float64 {
		return rmsOf(st, func(x *StationRes) float64 { return FlatBearing(c, x.Lat, x.Lon, x.Epi[0], x.Epi[1]) })
	}
	best, bv := [2]float64{90, 0}, score([2]float64{90, 0})
	try := func(c [2]float64) {
		if v := score(c); v < bv {
			best, bv = c, v
		}
	}
	for la := -85.0; la <= 85; la += 5 {
		for lo := -180.0; lo < 180; lo += 5 {
			try([2]float64{la, lo})
		}
	}
	for _, s := range [][2]float64{{5, 1}, {1, 0.2}} {
		c0 := best
		for a := -s[0]; a <= s[0]+1e-9; a += s[1] {
			for o := -s[0]; o <= s[0]+1e-9; o += s[1] {
				if la := c0[0] + a; math.Abs(la) <= 89.9 {
					try([2]float64{la, math.Mod(c0[1]+o+540, 360) - 180})
				}
			}
		}
	}
	return best, bv
}

// Compute analyses every station of stations.txt for every quake; a station without data for a quake is skipped (listed).
func Compute(root string) (*Result, error) {
	sts, err := ReadStations(root)
	if err != nil {
		return nil, err
	}
	res := &Result{Own: map[string][3]float64{}, PerQ: map[string][3]float64{}}
	for _, q := range Quakes {
		for _, s := range sts {
			shown := false
			for _, x := range Shown {
				shown = shown || (q.Full && x == s.Sta)
			}
			r, err := analyse(root, q, s.Sta, shown)
			if err == errNoData || err == errNoOnset {
				res.Missing = append(res.Missing, q.Key+"/"+s.Sta+": "+err.Error())
				continue
			}
			if err != nil {
				return nil, err
			}
			r.Quake, r.Epi = q.Key, q.Epi
			pv, ev := vec(r.Lat, r.Lon), vec(q.Epi[0], q.Epi[1])
			r.Delta = math.Acos(pv[0]*ev[0]+pv[1]*ev[1]+pv[2]*ev[2]) / d2r
			r.Globe = GlobeBearing(r.Lat, r.Lon, q.Epi[0], q.Epi[1])
			r.Pole = FlatBearing([2]float64{90, 0}, r.Lat, r.Lon, q.Epi[0], q.Epi[1])
			res.St = append(res.St, r)
		}
	}
	res.BestC, res.RmsBest = bestMap(res.St)
	for _, x := range res.St {
		x.Best = FlatBearing(res.BestC, x.Lat, x.Lon, x.Epi[0], x.Epi[1])
	}
	res.RmsGlobe = rmsOf(res.St, func(x *StationRes) float64 { return x.Globe })
	res.RmsPole = rmsOf(res.St, func(x *StationRes) float64 { return x.Pole })
	var own []string
	for _, q := range Quakes {
		var sub []*StationRes
		for _, x := range res.St {
			if x.Quake == q.Key {
				sub = append(sub, x)
			}
		}
		c, v := bestMap(sub)
		res.Own[q.Key] = [3]float64{c[0], c[1], v}
		res.PerQ[q.Key] = [3]float64{rmsOf(sub, func(x *StationRes) float64 { return x.Globe }), rmsOf(sub, func(x *StationRes) float64 { return x.Pole }),
			rmsOf(sub, func(x *StationRes) float64 { return x.Best })}
		own = append(own, fmt.Sprintf("%s %d st: globe %.1f°, own map %v %.1f°", q.Key, len(sub), res.PerQ[q.Key][0], c, v))
	}
	res.Log = fmt.Sprintf("%d records (%d missing); measured P direction vs globe %.1f°, North Pole map %.1f°, one best map %v %.1f° (rms); %s",
		len(res.St), len(res.Missing), res.RmsGlobe, res.RmsPole, res.BestC, res.RmsBest, strings.Join(own, "; "))
	return res, nil
}

func r1(x float64) float64 { return pyjson.Round(x, 1) }
func r2(x float64) float64 { return pyjson.Round(x, 2) }
func r3(x float64) float64 { return pyjson.Round(x, 3) }

func fl(v []float64, f func(float64) float64) []any {
	o := make([]any, len(v))
	for i, x := range v {
		o[i] = f(x)
	}
	return o
}

// File renders the preset.
func (res *Result) File() preset.File {
	var rows []any
	shown := pyjson.Obj{}
	for _, s := range res.St {
		rows = append(rows, []any{s.Quake, s.Sta, r2(s.Lat), r2(s.Lon), r1(s.Delta), r1(s.Baz), r1(s.BazLo), r1(s.BazHi), r2(s.Rect), r1(s.Inc), r1(s.Globe), r1(s.Pole), r1(s.Best)})
		if s.Trace[0] == nil {
			continue
		}
		var wins []any
		for _, w := range s.Wins {
			wins = append(wins, pyjson.Obj{{K: "kind", V: w.Kind}, {K: "t0", V: r1(w.T0)}, {K: "step", V: w.Step}, {K: "period", V: r1(w.Period)},
				{K: "L", V: r2(w.L)}, {K: "trans", V: r2(w.Plane)}, {K: "retro", V: w.Retro},
				{K: "R", V: fl(w.R, r2)}, {K: "T", V: fl(w.T, r2)}, {K: "Z", V: fl(w.Z, r2)}})
		}
		shown = append(shown, pyjson.KV{K: s.Sta, V: pyjson.Obj{{K: "sensor", V: s.Sensor}, {K: "onset", V: r1(s.Onset)}, {K: "bin", V: s.TraceBin},
			{K: "Z", V: fl(s.Trace[0], r3)}, {K: "R", V: fl(s.Trace[1], r3)}, {K: "T", V: fl(s.Trace[2], r3)},
			{K: "body", V: s.Body}, {K: "bodyStep", V: s.BodyStep}, {K: "surf", V: s.Surf}, {K: "surfStep", V: s.SurfStep}, {K: "wins", V: wins}}})
	}
	var qs []any
	for _, q := range Quakes {
		o, p := res.Own[q.Key], res.PerQ[q.Key]
		qs = append(qs, pyjson.Obj{{K: "key", V: q.Key}, {K: "name", V: q.Name}, {K: "epi", V: []any{q.Epi[0], q.Epi[1]}},
			{K: "globe", V: r1(p[0])}, {K: "pole", V: r1(p[1])}, {K: "best", V: r1(p[2])}, {K: "own", V: []any{r1(o[0]), r1(o[1]), r1(o[2])}}})
	}
	miss := make([]any, len(res.Missing))
	for i, m := range res.Missing {
		miss[i] = m
	}
	o := pyjson.Obj{{K: "quakes", V: qs}, {K: "best", V: []any{r1(res.BestC[0]), r1(res.BestC[1])}},
		{K: "rms", V: pyjson.Obj{{K: "globe", V: r1(res.RmsGlobe)}, {K: "pole", V: r1(res.RmsPole)}, {K: "best", V: r1(res.RmsBest)}}},
		{K: "med", V: pyjson.Obj{{K: "globe", V: r1(medOf(res.St, func(x *StationRes) float64 { return x.Globe }))},
			{K: "pole", V: r1(medOf(res.St, func(x *StationRes) float64 { return x.Pole }))},
			{K: "best", V: r1(medOf(res.St, func(x *StationRes) float64 { return x.Best }))}}},
		{K: "missing", V: miss}, {K: "stations", V: rows}, {K: "shown", V: shown}}
	compact := pyjson.Opts{Item: ",", Key: ":", ASCII: true}
	return preset.File{
		Out: Out, Command: "build seis-waves", Inputs: []string{Dir + "/stations.txt", Dir + "/inputs.lock"},
		Notes: []string{
			"Three great earthquakes at GSN stations (IU, EarthScope FDSN): three-component velocity, instrument scale only,",
			"rotated by the channel azimuths. Stations rows: [quake, sta, lat, lon, delta deg, P direction measured from its own",
			"motion, its range over 6-20 s windows, rectilinearity, incidence deg, bearing of the epicentre on the globe, on the",
			"North Pole map, on the one best flat map]. Shown (Tohoku): traces Z/R/T (min/max per bin, over the peak), motion",
			"classes (. quiet, p linear in the path plane, t linear transverse, r retrograde ellipse in the path plane, m other),",
			"and four windows of particle motion. Method: go doc ./internal/build/seiswaves.",
		},
		Body: "export const SEIS_WAVES = " + pyjson.Dumps(o, compact) + ";\n",
	}
}
