// Package satdop builds src/data/presets/sat-doppler.js (epic27): the orbits
// of 79 navigation satellites, the positions of 34 ground stations, the
// Earth's GM and its rotation Ω, all fitted to one day of carrier-phase
// Doppler and nothing else.
//
// Data: the same IGS daily RINEX 3 files as gps-raw (2025-04-10, 30 s, BKG
// open archive), decompressed by RNXCMP's crx2rnx. For GPS, Galileo and
// GLONASS the L1 and L2/E5a carrier phases give, every 5 minutes, the
// range rate averaged over the minute around the epoch, ionosphere-free
// (rinex.go). The receiver counts carrier cycles: their rate is the
// Doppler shift, λ·dL/dt = −c·D/f.
//
// Model (model.go, fit.go): an inertial frame whose z axis is the stations'
// rotation axis. Each satellite has a position and velocity at noon, moved
// by a point mass GM, an oblateness term μJ = GM·J₂·a² and the tidal pull of
// the Sun and the Moon (Montenbruck & Gill 2000, §3.2–3.3), integrated by
// RK4 every 30 s. Each station has a position fixed on a body turning at Ω.
// The observable is the range change over a minute with light time
// (ρ̇(1 + u·v_s/c) = u·(v_s − v_r)), plus the satellite clock's relativistic
// drift (−2 r·v/c², IS-GPS-200 §20.3.3.3.3.1), a clock offset per satellite
// and the rate of the slant air delay (one zenith delay per station, flat
// layer 1/sin e). The receivers' clocks are one unknown per station and
// epoch, eliminated by removing each epoch's mean. Fitted by
// Levenberg–Marquardt with numerical derivatives: GM, μJ, Ω, 3 coordinates
// per station (the first station's y fixes the longitude origin, which
// Doppler cannot see), 6 per satellite, a zenith delay per station, a clock
// offset per satellite.
//
// No radius enters. The stations START on a plane (an azimuthal map through
// the pole) with GM 25 % too small; the satellites start from the broadcast
// message, the only globe-made input, and Compute checks that the answer
// does not depend on it (restarts from other starts). The Sun's and Moon's
// pulls enter through GM/d³, which is n² of their orbits (Kepler III) times
// a mass ratio; their distances in km do not matter at the metre level.
// Outliers: stations and satellites whose rms is beyond 3 SD of the others
// (leave-one-out), then single points beyond 3 rms of the others, repeated
// until none is; all counted in the output.
//
// Variants on the same points: every satellite with its own GM (Kepler's
// third law tested, not assumed), and the flat model steel-manned: every
// station held on one plane of free tilt, height and in-plane positions,
// everything else as free as on the globe, from two starts.
package satdop

import (
	"fmt"
	"math"
	"sort"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Example is the station whose passes the page draws (Wettzell, also home
// of the ring laser of the rot tab).
const Example = "WTZR"

// Start values: GM 25 % below the accepted 3.986 × 10¹⁴, the stations on
// a plane, Ω the sidereal day (a clock measurement, rot tab).
const (
	StartGM    = 3.0e14
	StartOmega = 2 * math.Pi / 86164.1
	StartPlane = 6371e3 // the plane's height and the map's scale; any value converges
)

type Iter struct {
	RMS, GM, Omega, PlaneRMS float64
	R                        []float64    // station distances from the force centre, m
	Pos                      [][3]float64 // station positions (Earth-fixed frame), m
}

type Restart struct {
	Name    string
	RMS     float64
	DGM     float64 // relative to the main solution
	DOmega  float64
	MaxDSta float64 // largest station displacement, m
}

type Result struct {
	Run      *Run
	P        *Problem
	Lon0     float64
	Header   [][3]float64 // catalogue positions in the fit's frame (comparison only)
	History  []Iter
	Restarts []Restart
	SigGM    float64
	SigOm    float64
	Kepler   *Model
	KepRMS   float64
	Flat     *Model
	FlatRMS  float64
	FlatTry  []Restart
	Res      []float64 // clean residuals of the main solution
	ResFlat  []float64
	NStart   int
	Log      []string
}

func (r *Result) say(log func(string), f string, a ...any) {
	s := fmt.Sprintf(f, a...)
	r.Log = append(r.Log, s)
	if log != nil {
		log(s)
	}
}

func flatStartModel(st []Station, lon0 float64, sats [][6]float64) *Model {
	m := &Model{GM: StartGM, Omega: StartOmega, Sat: append([][6]float64(nil), sats...)}
	for _, s := range st {
		h := rotz(s.Header, -lon0)
		r := math.Sqrt(h[0]*h[0] + h[1]*h[1] + h[2]*h[2])
		lat, lon := math.Asin(h[2]/r), math.Atan2(h[1], h[0])
		d := (math.Pi/2 - lat) * StartPlane
		m.Sta = append(m.Sta, [3]float64{d * math.Cos(lon), d * math.Sin(lon), StartPlane})
	}
	return m
}

// compare: relative differences of GM and Ω, and the largest displacement of a station that kept data.
func compare(a, b *Model, used []bool) (dgm, dom, dmax float64) {
	for k := range a.Sta {
		if !used[k] {
			continue
		}
		d := 0.0
		for i := 0; i < 3; i++ {
			d += (a.Sta[k][i] - b.Sta[k][i]) * (a.Sta[k][i] - b.Sta[k][i])
		}
		dmax = math.Max(dmax, math.Sqrt(d))
	}
	return b.GM/a.GM - 1, b.Omega/a.Omega - 1, dmax
}

// Compute runs everything (about half an hour on four old cores).
func Compute(root string, log func(string)) (*Result, error) {
	st, err := LoadAll(root, Step, "")
	if err != nil {
		return nil, err
	}
	return ComputeFrom(root, st, log)
}

// ComputeFrom is Compute on stations already read.
func ComputeFrom(root string, st []Station, log func(string)) (*Result, error) {
	R := &Result{}
	p := Build(st, 30)
	R.P = p
	// the first station's longitude, an angle, places the Sun and the Moon in the frame
	R.Lon0 = math.Atan2(st[0].Header[1], st[0].Header[0])
	SetFrame(R.Lon0)
	start, err := BroadcastStart(root, p, R.Lon0)
	if err != nil {
		return nil, err
	}
	p.KeepSats(start)
	R.NStart = len(p.Obs)
	var sats [][6]float64
	for _, s := range p.Sats {
		sats = append(sats, start[s])
	}
	for _, s := range st {
		R.Header = append(R.Header, rotz(s.Header, -R.Lon0))
	}
	m0 := flatStartModel(st, R.Lon0, sats)
	first := true
	p.OnIter = func(m *Model, rms float64) {
		if !first {
			return
		}
		r, _ := Radii(m)
		_, _, prms := FitPlane(m.Sta)
		R.History = append(R.History, Iter{RMS: rms, GM: m.GM, Omega: m.Omega, PlaneRMS: prms, R: r, Pos: append([][3]float64(nil), m.Sta...)})
	}
	{ // the start itself
		r, _ := Radii(m0)
		_, _, prms := FitPlane(m0.Sta)
		for i := range p.Obs {
			p.Obs[i].Use = true
		}
		p.Index()
		c, n := p.Cost(m0)
		R.History = append(R.History, Iter{RMS: math.Sqrt(c / float64(n)), GM: m0.GM, Omega: m0.Omega, PlaneRMS: prms, R: r, Pos: append([][3]float64(nil), m0.Sta...)})
	}
	solveLog := func(s string) {
		first = false
		R.say(log, "%s", s)
	}
	R.Run = p.Solve(m0, solveLog)
	p.OnIter = nil
	m := R.Run.M
	use := p.UseSet()
	staUsed := make([]bool, len(p.Sta))
	for _, o := range p.Obs {
		if o.Use {
			staUsed[o.Sta] = true
		}
	}
	R.Res = p.Clean(p.Residuals(m))
	sig := p.Sigma(m, []int{p.cGM, p.cOm})
	R.SigGM, R.SigOm = sig[0], sig[1]
	R.say(log, "main: rms %.4f m/s, %d points, GM %.7e ± %.1e, Ω %.10e ± %.1e", R.Run.RMS, R.Run.NObs, m.GM, R.SigGM, m.Omega, R.SigOm)

	// restarts on the same points: the answer must not depend on the start
	restart := func(name string, m1 *Model) {
		p.SetUse(use)
		m2, rms := p.Fit(m1, 80, nil)
		dgm, dom, dmax := compare(m, m2, staUsed)
		R.Restarts = append(R.Restarts, Restart{Name: name, RMS: rms, DGM: dgm, DOmega: dom, MaxDSta: dmax})
		R.say(log, "restart %s: rms %.4f, ΔGM %.1e, ΔΩ %.1e, max Δstation %.2f m", name, rms, dgm, dom, dmax)
	}
	{ // catalogue station positions, accepted GM and J2
		m1 := &Model{GM: 3.986004418e14, MuJ: 1.7555e25, Omega: StartOmega, Sat: append([][6]float64(nil), sats...), Sta: append([][3]float64(nil), R.Header...)}
		restart("catalogue", m1)
	}
	{ // every station on a 3,000 km ball, GM 25 % too small
		m1 := flatStartModel(st, R.Lon0, sats)
		for k, h := range R.Header {
			n := math.Sqrt(h[0]*h[0] + h[1]*h[1] + h[2]*h[2])
			m1.Sta[k] = [3]float64{h[0] / n * 3000e3, h[1] / n * 3000e3, h[2] / n * 3000e3}
		}
		restart("ball3000", m1)
	}
	{ // satellites 5 % too far out (speeds scaled to stay on orbits), stations on the plane
		m1 := flatStartModel(st, R.Lon0, sats)
		m1.GM = 3.986e14
		for j := range m1.Sat {
			for i := 0; i < 3; i++ {
				m1.Sat[j][i] *= 1.05
				m1.Sat[j][3+i] /= math.Sqrt(1.05)
			}
		}
		restart("sats+5%", m1)
	}
	{ // the same satellites 5 % too far out, receivers at their catalogue positions
		m1 := &Model{GM: 3.986e14, Omega: StartOmega, Sat: append([][6]float64(nil), sats...), Sta: append([][3]float64(nil), R.Header...)}
		for j := range m1.Sat {
			for i := 0; i < 3; i++ {
				m1.Sat[j][i] *= 1.05
				m1.Sat[j][3+i] /= math.Sqrt(1.05)
			}
		}
		restart("sats+5%cat", m1)
	}
	{ // receivers scrambled: each at a random place on the flat map (the start carries no direction of any receiver)
		m1 := flatStartModel(st, R.Lon0, sats)
		rng := uint64(20251004)
		next := func() float64 {
			rng = rng*6364136223846793005 + 1442695040888963407
			return float64(rng>>11) / (1 << 53)
		}
		for k := range m1.Sta {
			d, a := math.Sqrt(next())*math.Pi*StartPlane, 2*math.Pi*next()
			m1.Sta[k] = [3]float64{d * math.Cos(a), d * math.Sin(a), StartPlane}
		}
		restart("scrambled", m1)
	}
	{ // the Moon 10 % farther (GM/d³ held, as the periods give it): what its distance in km weighs
		MoonScale = 1.1
		SetFrame(R.Lon0)
		restart("moon+10%", m)
		MoonScale = 1
		SetFrame(R.Lon0)
	}

	// Kepler's third law tested: one GM per satellite
	p.SetUse(use)
	p.PerSatGM = true
	mk := *m
	mk.GMs = make([]float64, len(p.Sats))
	for j := range mk.GMs {
		mk.GMs[j] = m.GM
	}
	p.Index()
	R.Kepler, R.KepRMS = p.Fit(&mk, 80, nil)
	p.PerSatGM = false
	R.say(log, "kepler: rms %.4f", R.KepRMS)

	// the flat model, steel-manned, from two starts; the better one is kept
	p.Flat = true
	p.SetUse(use)
	for _, try := range []struct {
		name string
		m    *Model
	}{{"best-plane", FlatStart(m)}, {"disc", DiscStart(m)}} {
		mf, rms := p.Fit(try.m, 120, nil)
		R.FlatTry = append(R.FlatTry, Restart{Name: try.name, RMS: rms})
		R.say(log, "flat from %s: rms %.3f m/s, tilt %.2f°", try.name, rms, mf.Plane.Theta*180/math.Pi)
		if R.Flat == nil || rms < R.FlatRMS {
			R.Flat, R.FlatRMS = mf, rms
		}
	}
	R.ResFlat = p.Clean(p.Residuals(R.Flat))
	p.Flat = false
	p.SetUse(use)
	return R, nil
}

// ---- output ---------------------------------------------------------------

func rnd(x float64, n int) float64 { return pyjson.Round(x, n) }

func rnds(v []float64, n int) []float64 {
	out := make([]float64, len(v))
	for i, x := range v {
		out[i] = rnd(x, n)
	}
	return out
}

// File writes the page's data.
func (r *Result) File() preset.File {
	p, m := r.P, r.Run.M
	dropped := map[string]bool{}
	for _, s := range r.Run.DropSta {
		dropped[s] = true
	}
	nSta := make([]int, len(p.Sta))
	nSat := make([]int, len(p.Sats))
	for i, o := range p.Obs {
		if !math.IsNaN(r.Res[i]) {
			nSta[o.Sta]++
			nSat[o.Sat]++
		}
	}
	rad, lat := Radii(m)
	var kr, kl []float64 // the stations kept
	var sts []any
	for k, id := range p.Sta {
		s, h := m.Sta[k], r.Header[k]
		d := math.Sqrt((s[0]-h[0])*(s[0]-h[0]) + (s[1]-h[1])*(s[1]-h[1]) + (s[2]-h[2])*(s[2]-h[2]))
		lon := math.Mod((math.Atan2(s[1], s[0])+r.Lon0)*180/math.Pi+540, 360) - 180
		sts = append(sts, pyjson.Obj{{K: "id", V: id}, {K: "r", V: rnd(rad[k]/1e3, 3)}, {K: "lat", V: rnd(lat[k], 3)}, {K: "lon", V: rnd(lon, 3)},
			{K: "dcat", V: rnd(d, 1)}, {K: "n", V: nSta[k]}, {K: "drop", V: dropped[id]}})
		if !dropped[id] {
			kr, kl = append(kr, rad[k]), append(kl, lat[k])
		}
	}
	ea, ef, erms := Ellipse(kr, kl)
	var keep [][3]float64
	for k := range p.Sta {
		if !dropped[p.Sta[k]] {
			keep = append(keep, m.Sta[k])
		}
	}
	_, _, prms := FitPlane(keep)
	var sats []any
	for j, id := range p.Sats {
		x := r.Kepler.Sat[j]
		gm := r.Kepler.GMs[j]
		rr := math.Sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2])
		v2 := x[3]*x[3] + x[4]*x[4] + x[5]*x[5]
		a := 1 / (2/rr - v2/gm)
		hx := [3]float64{x[1]*x[5] - x[2]*x[4], x[2]*x[3] - x[0]*x[5], x[0]*x[4] - x[1]*x[3]}
		h2 := hx[0]*hx[0] + hx[1]*hx[1] + hx[2]*hx[2]
		e := math.Sqrt(math.Max(0, 1-h2/(gm*a)))
		sats = append(sats, pyjson.Obj{{K: "id", V: id}, {K: "gm", V: rnd(gm/1e14, 6)}, {K: "a", V: rnd(a/1e3, 1)}, {K: "e", V: rnd(e, 4)},
			{K: "n", V: nSat[j]}, {K: "drop", V: nSat[j] == 0}})
	}
	// residual histogram, mm/s, 1 mm/s bins from −15 to 15
	hist := make([]int, 30)
	out := 0
	for _, v := range r.Res {
		if math.IsNaN(v) {
			continue
		}
		b := int(math.Floor(v*1000)) + 15
		if b < 0 || b >= 30 {
			out++
			continue
		}
		hist[b]++
	}
	var hFlat []float64 // flat residual quantiles, m/s
	{
		var v []float64
		for _, x := range r.ResFlat {
			if !math.IsNaN(x) {
				v = append(v, math.Abs(x))
			}
		}
		sort.Float64s(v)
		for _, q := range []float64{0.5, 0.9, 0.99} {
			hFlat = append(hFlat, rnd(v[int(q*float64(len(v)-1))], 1))
		}
	}
	// the example station's passes: observed minus that epoch's clock, the globe's and the flat model's curves
	ex := -1
	for k, id := range p.Sta {
		if id == Example {
			ex = k
		}
	}
	passes := pyjson.Obj{}
	if ex >= 0 {
		resG := p.Residuals(m)
		cg := p.Clean(resG)
		var ids []int
		cnt := map[int]int{}
		for i, o := range p.Obs {
			if o.Sta == ex && !math.IsNaN(cg[i]) {
				if cnt[o.Sat] == 0 {
					ids = append(ids, o.Sat)
				}
				cnt[o.Sat]++
			}
		}
		// the GPS satellites tracked longest (the page speaks of GPS), then the others
		sort.SliceStable(ids, func(a, b int) bool {
			ga, gb := p.Sats[ids[a]][0] == 'G', p.Sats[ids[b]][0] == 'G'
			if ga != gb {
				return ga
			}
			return cnt[ids[a]] > cnt[ids[b]]
		})
		for _, j := range ids[:min(6, len(ids))] {
			var pts []any
			for i, o := range p.Obs {
				if o.Sta == ex && o.Sat == j && !math.IsNaN(cg[i]) && !math.IsNaN(r.ResFlat[i]) {
					obsG := o.Rate - (resG[i] - cg[i]) // observed minus the globe's clock estimate
					pts = append(pts, []float64{o.T / 3600, rnd(obsG, 4), rnd(obsG-cg[i], 4), rnd(obsG-r.ResFlat[i], 2)})
				}
			}
			passes = append(passes, pyjson.KV{K: p.Sats[j], V: pts})
		}
	}
	var hist2 []any
	for _, h := range r.History {
		hist2 = append(hist2, pyjson.Obj{{K: "rms", V: rnd(h.RMS, 4)}, {K: "gm", V: rnd(h.GM/1e14, 6)}, {K: "om", V: rnd(h.Omega*1e5, 7)},
			{K: "plane", V: rnd(h.PlaneRMS/1e3, 1)}, {K: "r", V: rnds(func() []float64 {
				o := make([]float64, len(h.R))
				for i, x := range h.R {
					o[i] = x / 1e3
				}
				return o
			}(), 1)}, {K: "xyz", V: func() []any {
				o := make([]any, len(h.Pos))
				for i, q := range h.Pos {
					o[i] = []float64{rnd(q[0]/1e3, 1), rnd(q[1]/1e3, 1), rnd(q[2]/1e3, 1)}
				}
				return o
			}()}})
	}
	var rs []any
	for _, x := range r.Restarts {
		rs = append(rs, pyjson.Obj{{K: "name", V: x.Name}, {K: "rms", V: rnd(x.RMS, 4)}, {K: "dgm", V: rnd(x.DGM*1e9, 1)}, {K: "dom", V: rnd(x.DOmega*1e9, 1)}, {K: "dsta", V: rnd(x.MaxDSta, 2)}})
	}
	var ft []any
	for _, x := range r.FlatTry {
		ft = append(ft, pyjson.Obj{{K: "name", V: x.Name}, {K: "rms", V: rnd(x.RMS, 2)}})
	}
	nsys := map[byte]int{}
	for j, s := range p.Sats {
		if nSat[j] > 0 {
			nsys[s[0]]++
		}
	}
	data := pyjson.Obj{
		{K: "day", V: Day}, {K: "step", V: Step},
		{K: "nStart", V: r.NStart}, {K: "n", V: r.Run.NObs}, {K: "rejected", V: r.Run.Rejected},
		{K: "dropSta", V: r.Run.DropSta}, {K: "dropSat", V: r.Run.DropSat},
		{K: "nGps", V: nsys['G']}, {K: "nGal", V: nsys['E']}, {K: "nGlo", V: nsys['R']},
		{K: "rms", V: rnd(r.Run.RMS*1000, 2)},
		{K: "gm", V: rnd(m.GM/1e14, 7)}, {K: "sgm", V: rnd(r.SigGM/m.GM*1e9, 3)},
		{K: "om", V: rnd(m.Omega*1e5, 8)}, {K: "som", V: rnd(r.SigOm/m.Omega*1e9, 3)},
		{K: "muj", V: rnd(m.MuJ/1e25, 5)},
		{K: "ellA", V: rnd(ea/1e3, 2)}, {K: "ellF", V: rnd(ef, 6)}, {K: "ellRms", V: rnd(erms/1e3, 3)},
		{K: "planeRms", V: rnd(prms/1e3, 1)},
		{K: "flatRms", V: rnd(r.FlatRMS, 2)}, {K: "flatQ", V: hFlat}, {K: "flatTilt", V: rnd(r.Flat.Plane.Theta*180/math.Pi, 2)}, {K: "flatTry", V: ft},
		{K: "kepRms", V: rnd(r.KepRMS*1000, 2)},
		{K: "restarts", V: rs},
		{K: "hist", V: hist}, {K: "histOut", V: out},
		{K: "history", V: hist2},
		{K: "example", V: Example}, {K: "passes", V: passes},
		{K: "stations", V: sts}, {K: "sats", V: sats},
	}
	body := "export const SAT_DOPPLER = " + pyjson.Dumps(data, pyjson.Opts{Item: ",", Key: ":", ASCII: false}) + ";\n"
	return preset.File{
		Out: Out, Command: "build sat-doppler", Inputs: []string{Stations, Dir + "/inputs.lock"}, Body: body,
		Notes: []string{
			fmt.Sprintf("Orbits, stations, GM and Ω fitted to carrier-phase Doppler alone: %d IGS stations, %s, one point per", len(p.Sta), Day),
			"satellite and station every 5 min (range rate over the minute, ionosphere-free). r: km from the force centre;",
			"lat: geocentric, deg; lon: deg east (frame turned by the first station's longitude); dcat: m from the RINEX header",
			"position (comparison only). gm: 1e14 m³/s² (per satellite in sats); om: 1e-5 rad/s; muj: 1e25 m⁵/s²; rms, hist: mm/s;",
			"flat*: m/s. passes: [hour, observed minus clock (m/s), globe, flat]. history: the main fit from its flat start.",
		},
	}
}
