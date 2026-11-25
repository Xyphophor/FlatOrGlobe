// Package seisshadow builds src/data/presets/seis-shadow.js (2026-10-25): the
// P-wave shadow zone of the nine ISC earthquakes, station by station, and how
// a flat map would have to draw it.
//
// Each station of the raw bulletin (data/seis/raw/<key>.isf) is put in one
// class from the phases the ISC reports for it:
//
//	0  direct P   (P, Pn, Pg, Pb: the wave that went straight through the mantle)
//	1  Pdif only  (P diffracted along the core-mantle boundary, weak)
//	2  core only  (PKP, PKPdf/bc/ab, PKIKP, PKiKP: refracted through the core)
//
// Stations with none of these are left out. The phase names are the ISC's:
// its analysts and its locator associate each reading to a phase with the
// ak135 travel-time tables, computed for a spherical Earth (Kennett, Engdahl
// & Buland 1995, Geophys. J. Int. 122, 108-124; ISC, "ISC Bulletin: phase
// identification", Storchak et al. 2017, Seismol. Res. Lett.). A globe model
// therefore touched the labels, and the station coordinates come from maps:
// the section is a check (rule 10), not a measurement.
//
// The globe's rule has no free parameter: direct P is seen out to Δ = 103°
// from the epicentre and not beyond, Δ the great-circle angle between the
// published epicentre and station coordinates (Oldham 1906, Q. J. Geol. Soc.
// 62, 456-475; Gutenberg 1914, Nachr. Ges. Wiss. Göttingen, 166-218; the
// 103°/143° edges as in src/tabs/seis/logic.js SEIS_SHADOW). Its score is the
// share of stations whose class it predicts (direct P inside, none outside).
// For the symmetric margin the globe also gets its best single threshold.
//
// A flat map is an azimuthal equidistant projection of centre (φ0, λ0)
// (Snyder 1987, Map Projections -- A Working Manual, USGS PP 1395, §25):
//
//	c = great-circle angle from the centre, θ = azimuth from the centre,
//	x = c sin θ, y = c cos θ (degrees of map), d_flat = |(x, y)_sta − (x, y)_epi|.
//
// On the flat model, d_flat is the true distance and the shadow is a disc of
// radius ρ around the epicentre (steel-man, rule 2: ρ is fitted, the globe's
// 103° is not). Scores, all as shares of correctly classified stations:
//
//	own    each quake on each map with its own best ρ (one parameter per quake)
//	common one ρ for the nine quakes on the same map (one physics, one map)
//
// The map centre is then free too: a 3° grid of centres, refined to 0.5°
// around the best, for the best common map (own ρ per quake, and one ρ for
// all). A map centred on an epicentre gives that quake exactly the globe's
// distances; the question is what it does to the eight others.
package seisshadow

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"flatorglobe/tools/internal/build/seisradius"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	RawDir = "data/seis/raw"
	Out    = "src/data/presets/seis-shadow.js"
	// Edge is the globe's shadow edge for direct P (degrees), Edge2 where PKP comes back.
	Edge, Edge2 = 103.0, 143.0
)

var tailRe = regexp.MustCompile(`(-?\d{1,3}\.\d{2,6})\s+(-?\d{1,3}\.\d{2,6})\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$`)

var classOf = map[string]int{
	"P": 0, "Pn": 0, "Pg": 0, "Pb": 0,
	"Pdif": 1, "Pdiff": 1,
	"PKP": 2, "PKPdf": 2, "PKPbc": 2, "PKPab": 2, "PKIKP": 2, "PKiKP": 2,
}

// Station is one station of one quake.
type Station struct {
	Sta      string
	Lat, Lon float64
	Cls      int
	Delta    float64 // great-circle angle from the published epicentre (degrees)
}

// Quake is one event with its classified stations.
type Quake struct {
	Key, Name string
	Lat, Lon  float64
	St        []Station
}

func runes(r []rune, a, b int) string {
	if a > len(r) {
		return ""
	}
	return strings.TrimSpace(string(r[a:min(b, len(r))]))
}

// Read parses raw/<key>.isf (station 0-5, phase 19-27, coordinates at the end of the line) and keeps, per station,
// its lowest class.
func Read(root string, ev seisradius.Event) (Quake, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, ev.Key+".isf"))
	if err != nil {
		return Quake{}, fmt.Errorf("%w (fog fetch seis-radius)", err)
	}
	return ReadData(b, ev)
}

// ReadData is Read on a bulletin already read.
func ReadData(b []byte, ev seisradius.Event) (Quake, error) {
	la0, _ := ev.Lat.Float64()
	lo0, _ := ev.Lon.Float64()
	q := Quake{Key: ev.Key, Name: ev.Name, Lat: la0, Lon: lo0}
	idx := map[string]int{}
	for _, line := range strings.Split(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n") {
		r := []rune(line)
		if len(r) < 60 {
			continue
		}
		cls, ok := classOf[runes(r, 19, 27)]
		if !ok {
			continue
		}
		tail := tailRe.FindStringSubmatch(line)
		sta := runes(r, 0, 5)
		if tail == nil || sta == "" {
			continue
		}
		var la, lo float64
		fmt.Sscan(tail[1], &la)
		fmt.Sscan(tail[2], &lo)
		if i, seen := idx[sta]; seen {
			q.St[i].Cls = min(q.St[i].Cls, cls)
			continue
		}
		idx[sta] = len(q.St)
		q.St = append(q.St, Station{Sta: sta, Lat: la, Lon: lo, Cls: cls, Delta: seisradius.GreatCircleDeg(la0, lo0, la, lo)})
	}
	if len(q.St) == 0 {
		return q, fmt.Errorf("%s: no P / Pdif / PKP readings", ev.Key)
	}
	return q, nil
}

// AE is the azimuthal equidistant projection of centre (lat0, lon0), in degrees of map (Snyder 1987, §25).
func AE(lat0, lon0, lat, lon float64) (x, y float64) {
	d2r := math.Pi / 180
	s1, c1 := math.Sin(lat0*d2r), math.Cos(lat0*d2r)
	sp, cp, dl := math.Sin(lat*d2r), math.Cos(lat*d2r), (lon-lon0)*d2r
	ex, ny := cp*math.Sin(dl), c1*sp-s1*cp*math.Cos(dl)
	n := math.Hypot(ex, ny)
	c := math.Atan2(n, s1*sp+c1*cp*math.Cos(dl))
	if n < 1e-15 {
		if c > 1 {
			return 0, -180
		}
		return 0, 0
	}
	return c * ex / n / d2r, c * ny / n / d2r
}

type pt struct {
	d   float64
	dir bool // direct P seen
}

// best is the threshold ρ that classifies most points (direct P at d < ρ, none at d ≥ ρ): correct count and ρ.
func best(ps []pt) (int, float64) {
	sort.Slice(ps, func(i, j int) bool { return ps[i].d < ps[j].d })
	nOut := 0 // points without direct P (all predicted right when ρ = 0)
	for _, p := range ps {
		if !p.dir {
			nOut++
		}
	}
	bestN, bestR, in := nOut, 0.0, 0
	for i, p := range ps {
		if p.dir {
			in++
		} else {
			nOut--
		}
		if i+1 < len(ps) && ps[i+1].d == p.d {
			continue
		}
		if in+nOut > bestN {
			bestN = in + nOut
			if i+1 < len(ps) {
				bestR = (p.d + ps[i+1].d) / 2
			} else {
				bestR = p.d + 1
			}
		}
	}
	return bestN, bestR
}

// Map is one flat map's scores.
type Map struct {
	Lat, Lon float64
	Own      []float64 // per quake, share right with its own best ρ
	OwnR     []float64 // that ρ (degrees of map)
	Common   float64   // all stations, one ρ for the nine
	CommonR  float64
	OwnAll   float64 // all stations, each quake with its own ρ
}

func flatPts(q Quake, lat0, lon0 float64) []pt {
	ex, ey := AE(lat0, lon0, q.Lat, q.Lon)
	ps := make([]pt, len(q.St))
	for i, s := range q.St {
		x, y := AE(lat0, lon0, s.Lat, s.Lon)
		ps[i] = pt{math.Hypot(x-ex, y-ey), s.Cls == 0}
	}
	return ps
}

// Score projects the nine quakes on the map of centre (lat0, lon0) and fits the flat rings.
func Score(qs []Quake, lat0, lon0 float64) Map {
	m := Map{Lat: lat0, Lon: lon0}
	var all []pt
	nAll, okOwn := 0, 0
	for _, q := range qs {
		ps := flatPts(q, lat0, lon0)
		all = append(all, ps...)
		n, r := best(append([]pt(nil), ps...))
		m.Own = append(m.Own, float64(n)/float64(len(ps)))
		m.OwnR = append(m.OwnR, r)
		okOwn += n
		nAll += len(ps)
	}
	n, r := best(all)
	m.Common, m.CommonR, m.OwnAll = float64(n)/float64(nAll), r, float64(okOwn)/float64(nAll)
	return m
}

// Globe scores: fixed edge (no parameter) and best single threshold, per quake and for all.
type Globe struct {
	Fixed, Fitted []float64
	FittedR       []float64
	FixedAll      float64
	FittedAll     float64
	FittedAllR    float64
}

func globeScore(qs []Quake) Globe {
	var g Globe
	var all []pt
	nAll, okAll := 0, 0
	for _, q := range qs {
		ps := make([]pt, len(q.St))
		ok := 0
		for i, s := range q.St {
			ps[i] = pt{s.Delta, s.Cls == 0}
			if (s.Delta < Edge) == (s.Cls == 0) {
				ok++
			}
		}
		all = append(all, ps...)
		g.Fixed = append(g.Fixed, float64(ok)/float64(len(ps)))
		n, r := best(append([]pt(nil), ps...))
		g.Fitted, g.FittedR = append(g.Fitted, float64(n)/float64(len(ps))), append(g.FittedR, r)
		nAll += len(ps)
		okAll += ok
	}
	n, r := best(all)
	g.FixedAll, g.FittedAll, g.FittedAllR = float64(okAll)/float64(nAll), float64(n)/float64(nAll), r
	return g
}

// Result is everything the preset holds.
type Result struct {
	Quakes              []Quake
	Globe               Globe
	Named               []Map // the nine epicentres, then the North Pole
	BestCommon, BestOwn Map   // the best map centre for one ρ, and for one ρ per quake
	Log                 string
}

// sweep finds the centre maximising key over a grid, then refines it.
func sweep(qs []Quake, key func(Map) float64) Map {
	var bestM Map
	bv := -1.0
	try := func(la, lo float64) {
		m := Score(qs, la, lo)
		if v := key(m); v > bv {
			bv, bestM = v, m
		}
	}
	for la := -90.0; la <= 90; la += 3 {
		for lo := -180.0; lo < 180; lo += 3 {
			try(la, lo)
			if la == 90 || la == -90 {
				break
			}
		}
	}
	c := bestM
	for la := c.Lat - 3; la <= c.Lat+3; la += 0.5 {
		for lo := c.Lon - 3; lo <= c.Lon+3; lo += 0.5 {
			if la >= -90 && la <= 90 {
				try(la, lo)
			}
		}
	}
	return bestM
}

// Compute reads the nine bulletins and scores the globe and the flat maps.
func Compute(root string) (*Result, error) {
	evs, err := seisradius.ReadEvents(root)
	if err != nil {
		return nil, err
	}
	res := &Result{}
	for _, ev := range evs {
		q, err := Read(root, ev)
		if err != nil {
			return nil, err
		}
		res.Quakes = append(res.Quakes, q)
	}
	res.Globe = globeScore(res.Quakes)
	for _, q := range res.Quakes {
		res.Named = append(res.Named, Score(res.Quakes, q.Lat, q.Lon))
	}
	res.Named = append(res.Named, Score(res.Quakes, 90, 0))
	res.BestCommon = sweep(res.Quakes, func(m Map) float64 { return m.Common })
	res.BestOwn = sweep(res.Quakes, func(m Map) float64 { return m.OwnAll })
	n := 0
	for _, q := range res.Quakes {
		n += len(q.St)
	}
	res.Log = fmt.Sprintf("%d stations, globe %.1f %% (103°), best flat map one ring %.1f %%, own rings %.1f %%", n,
		100*res.Globe.FixedAll, 100*res.BestCommon.Common, 100*res.BestOwn.OwnAll)
	return res, nil
}

func r4(x float64) float64 { return pyjson.Round(x, 4) }
func r2(x float64) float64 { return pyjson.Round(x, 2) }
func rs(xs []float64, f func(float64) float64) []any {
	out := make([]any, len(xs))
	for i, x := range xs {
		out[i] = f(x)
	}
	return out
}

func mapObj(m Map) pyjson.Obj {
	return pyjson.Obj{{K: "c", V: []any{r2(m.Lat), r2(m.Lon)}}, {K: "own", V: rs(m.Own, r4)}, {K: "ownR", V: rs(m.OwnR, r2)},
		{K: "ownAll", V: r4(m.OwnAll)}, {K: "common", V: r4(m.Common)}, {K: "commonR", V: r2(m.CommonR)}}
}

// File renders the preset.
func (res *Result) File() preset.File {
	qs := make([]any, len(res.Quakes))
	for i, q := range res.Quakes {
		st := make([]any, len(q.St))
		for j, s := range q.St {
			st[j] = []any{r2(s.Lat), r2(s.Lon), s.Cls}
		}
		qs[i] = pyjson.Obj{{K: "key", V: q.Key}, {K: "name", V: q.Name}, {K: "epi", V: []any{r4(q.Lat), r4(q.Lon)}}, {K: "st", V: st}}
	}
	g := res.Globe
	globe := pyjson.Obj{{K: "edge", V: Edge}, {K: "edge2", V: Edge2}, {K: "fixed", V: rs(g.Fixed, r4)}, {K: "fixedAll", V: r4(g.FixedAll)},
		{K: "fitted", V: rs(g.Fitted, r4)}, {K: "fittedR", V: rs(g.FittedR, r2)}, {K: "fittedAll", V: r4(g.FittedAll)}, {K: "fittedAllR", V: r2(g.FittedAllR)}}
	named := make([]any, len(res.Named))
	for i, m := range res.Named {
		named[i] = mapObj(m)
	}
	compact := pyjson.Opts{Item: ",", Key: ":", ASCII: true}
	body := "export const SHADOW_QUAKES = " + pyjson.Dumps(qs, compact) + ";\n" +
		"export const SHADOW_GLOBE = " + pyjson.Dumps(globe, compact) + ";\n" +
		"// flat maps: the nine epicentres in order, then the North Pole; then the best centres (one ring for all, own rings)\n" +
		"export const SHADOW_MAPS = " + pyjson.Dumps(named, compact) + ";\n" +
		"export const SHADOW_BEST = " + pyjson.Dumps(pyjson.Obj{{K: "common", V: mapObj(res.BestCommon)}, {K: "own", V: mapObj(res.BestOwn)}}, compact) + ";\n"
	return preset.File{
		Out: Out, Command: "build seis-shadow", Inputs: []string{seisradius.Events, seisradius.Dir + "/inputs.lock"},
		Notes: []string{
			"P shadow zone of the nine ISC earthquakes: per station [lat, lon, class] (0 direct P, 1 Pdif only, 2 PKP only),",
			"phase names as the ISC gives them (identified with ak135, a spherical model: a check, not a measurement).",
			"Scores = share of stations classified right: globe direct P iff Δ < 103° (no fit); flat map = azimuthal",
			"equidistant of centre c, direct P iff map distance < ρ, ρ fitted (per quake: own; one for the nine: common).",
		},
		Body: body,
	}
}
