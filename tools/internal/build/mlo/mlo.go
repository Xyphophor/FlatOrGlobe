// Package mlo builds the dip tab's Mauna Loa Observatory presets (epic05/
// UC07): src/data/presets/dip-mlo.js, the last direct sunlight of every
// evening of 2016 (NOAA GML one-minute pyrheliometer, data/dip/mlo/raw/),
// and dip-mlo-profile.js, the observatory's horizon towards the setting Sun
// from the Copernicus DEM GLO-30. Port of scripts/build_mlo_sunset.py and
// scripts/build_mlo_horizon.py (epic24/UC04).
//
// Last light = the moment the direct-normal irradiance falls through
// 5 W/m² for good (interpolated between two minutes); an evening is clear
// when DNI exceeded 300 W/m² in the 40 minutes before. Every clear evening
// is kept; the page keeps those whose Sun sets where the horizon is the
// sea. One evening is stored minute by minute, by a rule fixed in advance:
// among the clear sea-horizon evenings, the one whose last light came
// closest to the median solar altitude (NOAA low-precision formula, ~0.05°,
// used for this choice only).
package mlo

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/dem"
	"flatorglobe/tools/internal/npy"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Dir        = "data/dip/mlo"
	RawDir     = Dir + "/raw"
	OutSunset  = "src/data/presets/dip-mlo.js"
	OutProfile = "src/data/presets/dip-mlo-profile.js"
	Year       = 2016
	TH, Clear  = 5.0, 300.0
	LAT, LON   = 19.536, -155.576
	H          = 3397.0
	R, K       = 6371e3, 0.13
)

// ---- horizon (build_mlo_horizon.py) ----------------------------------------

// oneMinusK is 1 - 0.13 computed at run time as Python does (a constant
// expression would be folded exactly by Go: pymath, trap 1).
var oneMinusK = 1 - pymath.Div(13, 100)

func dest(az float64, d []float64) ([]float64, []float64) {
	p1, l1 := pymath.Radians(LAT), pymath.Radians(LON)
	a := pymath.Radians(az)
	sp1, cp1 := math.Sin(p1), math.Cos(p1)
	sa, ca := math.Sin(a), math.Cos(a)
	la := make([]float64, len(d))
	lo := make([]float64, len(d))
	for i, x := range d {
		dd := x / R
		sdd, cdd := math.Sin(dd), math.Cos(dd)
		p2 := math.Asin(float64(sp1*cdd) + float64(float64(cp1*sdd)*ca))
		l2 := l1 + math.Atan2(float64(float64(sa*sdd)*cp1), cdd-float64(sp1*math.Sin(p2)))
		la[i], lo[i] = pymath.Degrees(p2), pymath.Degrees(l2)
	}
	return la, lo
}

func angles(cop *dem.Cop, az float64, d []float64) (z, geo, app []float64, err error) {
	la, lo := dest(az, d)
	if z, err = cop.Grid(la, lo); err != nil {
		return nil, nil, nil, err
	}
	geo = make([]float64, len(d))
	app = make([]float64, len(d))
	twoR := 2 * R
	for i := range z {
		if math.IsNaN(z[i]) { // np.nan_to_num
			z[i] = 0
		}
		z[i] = math.Max(z[i], 0)
		at := math.Atan2(z[i]-H, d[i])
		geo[i] = pymath.Degrees(at - d[i]/twoR)
		app[i] = pymath.Degrees(at - float64(d[i]*oneMinusK)/twoR)
	}
	return z, geo, app, nil
}

// Row is one azimuth of MLO_HORIZON.
type Row struct {
	Az, Geo, App float64
	Dist         *float64 // km of the terrain that sets the horizon, nil = the sea
}

func horizonTable(cop *dem.Cop) ([]Row, float64, float64, error) {
	d := npy.Arange(200, 150001, 100.0)
	seaGeo := -pymath.Degrees(math.Acos(R / (R + H)))
	Re := R / oneMinusK
	seaApp := -pymath.Degrees(math.Acos(Re / (Re + H)))
	var hor []Row
	for _, az := range npy.Arange(230, 310.01, 0.5) {
		_, geo, app, err := angles(cop, az, d)
		if err != nil {
			return nil, 0, 0, err
		}
		i, j := npy.Argmax(geo), npy.Argmax(app)
		row := Row{Az: pyjson.Round(az, 1), Geo: pyjson.Round(math.Max(geo[i], seaGeo), 3), App: pyjson.Round(math.Max(app[j], seaApp), 3)}
		if geo[i] > seaGeo {
			v := pyjson.Round(d[i]/1000, 1)
			row.Dist = &v
		}
		hor = append(hor, row)
	}
	return hor, seaGeo, seaApp, nil
}

func seaAt(hor []Row, az float64) bool {
	if az < hor[0].Az-0.25 || az > hor[len(hor)-1].Az+0.25 {
		return false
	}
	best := 0
	for i, h := range hor {
		if math.Abs(h.Az-az) < math.Abs(hor[best].Az-az) {
			best = i
		}
	}
	return hor[best].Dist == nil
}

// pyMod is Python's float %, result with the sign of the divisor.
func pyMod(a, b float64) float64 {
	m := math.Mod(a, b)
	if m != 0 && (m < 0) != (b < 0) {
		m += b
	}
	return m
}

// sunAltAz is the NOAA low-precision solar position (true altitude of the
// centre, azimuth from north), ~0.05°: selection only.
func sunAltAz(date string, minute float64) (float64, float64) {
	t, _ := time.Parse("2006-01-02", date)
	doy := float64(t.YearDay())
	hr := minute / 60
	g := float64(pymath.Div(2*math.Pi, 365) * float64(doy-1+(hr-12)/24))
	cg, sg, c2, s2, c3, s3 := math.Cos(g), math.Sin(g), math.Cos(2*g), math.Sin(2*g), math.Cos(3*g), math.Sin(3*g)
	eqt := 229.18 * (float64(float64(float64(0.000075+float64(0.001868*cg))-float64(0.032077*sg))-float64(0.014615*c2)) - float64(0.040849*s2))
	dec := float64(float64(float64(float64(float64(float64(0.006918-float64(0.399912*cg))+float64(0.070257*sg))-float64(0.006758*c2))+float64(0.000907*s2))-float64(0.002697*c3))) + float64(0.00148*s3)
	ha := pymath.Radians(float64(float64(hr*60)+eqt+float64(4*LON))/4 - 180)
	la := pymath.Radians(LAT)
	alt := pymath.Degrees(math.Asin(float64(math.Sin(la)*math.Sin(dec)) + float64(float64(math.Cos(la)*math.Cos(dec))*math.Cos(ha))))
	az := pymath.Degrees(math.Atan2(math.Sin(ha), float64(math.Cos(ha)*math.Sin(la))-float64(math.Tan(dec)*math.Cos(la)))) + 180
	return alt, pyMod(az, 360)
}

// ---- sunsets (build_mlo_sunset.py) ------------------------------------------

type minute struct {
	t   int
	dni *float64
}

func rows(p string) ([]minute, error) {
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	lines := pymath.SplitLines(string(b))
	var out []minute
	for _, l := range lines[min(2, len(lines)):] {
		a := pymath.Fields(l)
		if len(a) < 14 {
			continue
		}
		h, e1 := strconv.Atoi(a[4])
		m, e2 := strconv.Atoi(a[5])
		dni, e3 := strconv.ParseFloat(a[12], 64)
		if e1 != nil || e2 != nil || e3 != nil {
			return nil, fmt.Errorf("%s: %q", filepath.Base(p), l)
		}
		mi := minute{t: h*60 + m}
		if dni > -999 {
			mi.dni = &dni
		}
		out = append(out, mi)
	}
	return out, nil
}

// Evening is one day's last light.
type Evening struct {
	Date  string
	T     float64
	Clear bool
}

// evening: the last fall of DNI through TH in the UTC morning (the Hawaii
// evening, 03-07 UTC).
func evening(r []minute) (float64, bool, bool) {
	found := false
	var t0, t1 int
	var v0, v1 float64
	for k := 0; k+1 < len(r); k++ {
		a, b := r[k], r[k+1]
		if a.dni == nil || b.dni == nil || !(180 <= a.t && a.t <= 420) {
			continue
		}
		if *a.dni >= TH && TH > *b.dni {
			found, t0, v0, t1, v1 = true, a.t, *a.dni, b.t, *b.dni
		}
	}
	if !found {
		return 0, false, false
	}
	tl := float64(t0) + float64(float64(t1-t0)*(v0-TH))/(v0-v1)
	clear, seen := false, false
	for _, m := range r {
		if tl-40 <= float64(m.t) && float64(m.t) <= tl && m.dni != nil {
			seen = true
			clear = clear || *m.dni >= Clear
		}
	}
	return pyjson.Round(tl, 2), seen && clear, true
}

// Result of a build.
type Result struct {
	Evenings            []Evening
	Featured            Evening
	Curve               []minute
	Hor                 []Row
	SeaGeo, SeaApp, Az0 float64
	Profile             [][2]float64
	Log                 []string
}

// Compute replays build_mlo_sunset.py (which calls the horizon).
func Compute(root string) (*Result, error) {
	cop := &dem.Cop{Dir: filepath.Join(root, RawDir, "cop")}
	res := &Result{}
	curves := map[string][]minute{}
	days := 365
	if Year%4 == 0 {
		days = 366
	}
	jan1 := time.Date(Year, 1, 1, 0, 0, 0, 0, time.UTC)
	for doy := 1; doy <= days; doy++ {
		p := filepath.Join(root, RawDir, fmt.Sprintf("mlo%02d%03d.dat", Year%100, doy))
		if _, err := os.Stat(p); err != nil {
			continue // no file that day (the script skipped it too)
		}
		r, err := rows(p)
		if err != nil {
			return nil, err
		}
		t, clear, ok := evening(r)
		if !ok {
			continue
		}
		d := jan1.AddDate(0, 0, doy-1).Format("2006-01-02")
		res.Evenings = append(res.Evenings, Evening{d, t, clear})
		curves[d] = r
	}
	var clear []Evening
	for _, e := range res.Evenings {
		if e.Clear {
			clear = append(clear, e)
		}
	}
	hor, seaGeo, seaApp, err := horizonTable(cop)
	if err != nil {
		return nil, err
	}
	res.Hor, res.SeaGeo, res.SeaApp = hor, seaGeo, seaApp
	type pos struct{ alt, az float64 }
	ps := map[string]pos{}
	for _, e := range clear {
		a, z := sunAltAz(e.Date, e.T)
		ps[e.Date] = pos{a, z}
	}
	var sea []Evening
	var alts []float64
	for _, e := range clear {
		if seaAt(hor, ps[e.Date].az) {
			sea = append(sea, e)
			alts = append(alts, ps[e.Date].alt)
		}
	}
	if len(sea) == 0 {
		return nil, fmt.Errorf("no clear evening with a sea horizon")
	}
	sort.Float64s(alts)
	n := len(alts)
	med := alts[n/2]
	if n%2 == 0 {
		med = (alts[n/2-1] + alts[n/2]) / 2
	}
	feat := sea[0]
	for _, e := range sea[1:] {
		if math.Abs(ps[e.Date].alt-med) < math.Abs(ps[feat.Date].alt-med) {
			feat = e
		}
	}
	res.Featured = feat
	t0 := int(feat.T) - 30
	for _, m := range curves[feat.Date] {
		if t0 <= m.t && m.t <= t0+45 {
			res.Curve = append(res.Curve, m)
		}
	}
	res.Log = append(res.Log, fmt.Sprintf("%d clear evenings with a sea horizon; median altitude at last light %.3f°; featured %s (%.3f°)",
		len(sea), med, feat.Date, ps[feat.Date].alt))
	res.Az0 = pyjson.Round(ps[feat.Date].az, 1)
	// the terrain on both sides of the observatory: towards the Sun (d > 0) and away (d < 0)
	dp := npy.Arange(-40000, 80001, 500.0)
	var pos_, neg []float64
	for _, x := range dp {
		if x > 0 {
			pos_ = append(pos_, x)
		} else if x < 0 {
			neg = append(neg, -x)
		}
	}
	zp, _, _, err := angles(cop, res.Az0, pos_)
	if err != nil {
		return nil, err
	}
	zn, _, _, err := angles(cop, pyMod(res.Az0+180, 360), neg)
	if err != nil {
		return nil, err
	}
	ip, in := 0, 0
	for _, x := range dp {
		z := H
		if x > 0 {
			z = zp[ip]
			ip++
		} else if x < 0 {
			z = zn[in]
			in++
		}
		res.Profile = append(res.Profile, [2]float64{pyjson.Round(x/1000, 1), float64(pymath.RoundInt(z))})
	}
	return res, nil
}

var compact = pyjson.Opts{Item: ",", Key: ":", ASCII: true}

// Files renders both presets (same bodies as the scripts).
func (r *Result) Files() []preset.File {
	var s strings.Builder
	fmt.Fprintf(&s, "export const MLO_SITE = {\"lat\": 19.536, \"lon\": -155.576, \"h\": 3397, \"year\": %d, \"threshold\": %s};\n", Year, strconv.FormatFloat(TH, 'g', -1, 64))
	s.WriteString("export const MLO_EVENINGS = [\n")
	for _, e := range r.Evenings {
		s.WriteString("  " + pyjson.Dumps(pyjson.Obj{{K: "date", V: e.Date}, {K: "t", V: e.T}, {K: "clear", V: e.Clear}}, compact) + ",\n")
	}
	s.WriteString("];\n// the featured evening, minute by minute: [minute after 0 h UTC, DNI W/m2]\n")
	curve := make([]any, len(r.Curve))
	for i, m := range r.Curve {
		var v any
		if m.dni != nil {
			v = *m.dni
		}
		curve[i] = []any{m.t, v}
	}
	s.WriteString("export const MLO_FEATURED = " + pyjson.Dumps(pyjson.Obj{{K: "date", V: r.Featured.Date}, {K: "t", V: r.Featured.T}, {K: "curve", V: curve}}, compact) + ";\n")

	var p strings.Builder
	fmt.Fprintf(&p, "export const MLO_SEA = {\"geo\": %.4f, \"app\": %.4f};\n", r.SeaGeo, r.SeaApp)
	hor := make([]any, len(r.Hor))
	for i, h := range r.Hor {
		var d any
		if h.Dist != nil {
			d = *h.Dist
		}
		hor[i] = []any{h.Az, h.Geo, h.App, d}
	}
	p.WriteString("export const MLO_HORIZON = " + pyjson.Dumps(hor, compact) + ";\n")
	fmt.Fprintf(&p, "// terrain along azimuth %s° (the Sun at the featured evening's last light): [km from MLO towards the Sun\n", pyjson.Float(r.Az0))
	p.WriteString("// (negative: the opposite way), m]\n")
	p.WriteString("export const MLO_PROFILE_AZ = " + pyjson.Float(r.Az0) + ";\n")
	prof := make([]any, len(r.Profile))
	for i, x := range r.Profile {
		prof[i] = []any{x[0], int(x[1])}
	}
	p.WriteString("export const MLO_PROFILE = " + pyjson.Dumps(prof, compact) + ";\n")
	return []preset.File{
		{Out: OutSunset, Command: "build dip-mlo", Inputs: []string{Dir + "/inputs.lock"}, Body: s.String(), Notes: []string{
			"Mauna Loa Observatory (NOAA GML, 19.536 N 155.576 W, 3397 m): last direct sunlight of each evening,",
			"DNI falling through 5 W/m2 (tracking pyrheliometer, one-minute means), in minutes after 0 h UTC of the",
			"date (the Hawaii evening of the previous day). clear = DNI above 300 W/m2 in the 40 min before.",
		}},
		{Out: OutProfile, Command: "build dip-mlo", Inputs: []string{Dir + "/inputs.lock"}, Body: p.String(), Notes: []string{
			"Copernicus DEM GLO-30 around Mauna Loa Observatory (3,397 m). MLO_HORIZON: [azimuth°, highest true angle°,",
			"highest apparent angle° (k = 0.13), distance km of the terrain that sets it (null = the sea horizon)].",
			fmt.Sprintf("Sea horizon: true %.3f°, apparent %.3f°.", r.SeaGeo, r.SeaApp),
		}},
	}
}
