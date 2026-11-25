// Package lomond builds the contrib tab's preset
// src/data/presets/contrib-lomond.js: Bass Rock seen from East Lomond Hill
// (Fife, Scotland) at 5:28 am on 9 August 2023, an annotated photograph by
// KenRDKAB (x.com/KenRDKAB, published with his permission), sent without its
// original file. Everything else comes from open
// data, in six steps.
//
// # 1. The camera and the rock (package dem)
//
// The contributor gives the camera's height (345 m) and two distances:
// 39.9 km to Bass Rock and 75.9 km to St Abb's Head. On the Copernicus
// GLO-30 surface model [Copernicus 2022] the first guess is the point of the
// 345 m contour of East Lomond whose great-circle distances to Bass Rock's
// summit (the model's highest cell on the rock) and to St Abb's Head
// [StAbbs] best match both (least squares), among the points of the contour
// from which the ground in front does not hide the sea the photograph shows
// below the rock.
//
// The photograph then places the camera across the line of sight, by
// parallax: Bass Rock is 40 km away, the coast of St Abb's Head 76 km, so a
// step of L metres sideways changes the angle between them by about
// L (1/d₁ − 1/d₂), 12 µrad per metre. The outline of St Abb's Head is read on
// the photograph (photo.go) and the model's outline, seen from the camera
// over GLO-30 at the photograph's apparent curvature, is slid along it
// (least squares) with the picture's scale from the rock's height: the
// slide is the angle by which the model misplaces St Abb's Head. Fitted with
// a free scale, the outline's own shape gives the scale too, a check on the
// rock's. The camera is then moved to the line of points (any height) where
// the angle rock → St Abb's Head is the photograph's, with a clear view of
// the sea, taking the one whose ground is closest to the contributor's
// height; it stands CamEye above the ground. The slide is measured again
// from there, and the line moved by what is left, until it is under
// 0.03 mrad. Bass Rock rises to 107 m [OS]; the
// contributor writes 112 m, and GLO-30's 30 m cells cut the summit to 96 m.
// The photograph gives its own estimate: the rock's width there, against the
// angle its outline in GLO-30 spans from the camera, gives the picture's
// scale, and its height in pixels then gives metres.
//
// # 2. The photograph (photo.go)
//
// Three edges are measured on brightness profiles: the sea horizon (bands of
// 20 columns on both sides of the rock, a straight line by least squares;
// its slope is the camera's tilt), the rock's outline above it (the summit
// is the lowest row of a 5-column running mean) and the rock's foot at the
// water (the median over 100 columns, levelled with the tilt). The
// measurement is one number free of the picture's scale:
//
//	f = (foot − horizon) / (foot − summit)
//
// the fraction of the rock, counted from the water, that stands below the
// horizon.
//
// # 3. The tide (gauge.go, package tide)
//
// The Leith tide gauge [IOC; NOC] has a gap from 03:00 to 05:30 UTC that
// morning. Four weeks of its 15-minute readings are fitted with 12 harmonic
// constituents (package tide), and the residual (the weather's surge) is
// interpolated across the gap. The same is done on every window of the same
// length over the four weeks to measure the error. Heights are given above
// the four weeks' mean level, which stands within about 0.2 m of the
// Ordnance Datum the heights of the map refer to.
//
// # 4. The air (air.go, package refrac)
//
// At three points along the line of sight, interpolated to 04:28 UTC: the
// sea's temperature [Open-Meteo marine], the ERA5 surface [Hersbach 2020],
// and the GFS model's surface and levels at 1000, 975, 950 and 925 hPa
// [NCEP GFS] through Open-Meteo. The surface layer (package refrac,
// Monin-Obukhov) runs up to 20 m, the model's levels above. The day's air is
// the model's throughout; the reanalysis' surface under the model's lapse
// rates is the alternative that sizes its uncertainty, with the three points
// taken one by one.
//
// # 5. Rays (package refrac)
//
// Rays from the camera are traced in that air over a sphere of radius R =
// 6,371 km (globe) and over a plane (flat), in 10 m steps: the horizon is
// the steepest ray that still meets the sea within 200 km, the foot and the
// summit the rays that reach them at the rock's distance, and f follows from
// the three angles. A uniform extra gradient is added to the whole column,
// from −0.24 to +0.06 K/m, to find the air each model needs for the f the
// photograph shows. Separately, the sea alone is made warmer or colder under
// the same 2 m air and the same column (air − sea from −10 to +2 K; above,
// the air ducts light along the sea and the horizon is no longer one edge):
// near the water that difference, not the column, sets where the horizon
// falls, and it is the least certain input (model cells on a coast). Both
// models get the same freedom: the column's shifts are traced again under
// the air − sea differences of the points and models and under the one most
// favourable to the plane in the grid (−10 K). In uniform air f depends on the apparent curvature c only (rays straight over
// a surface of radius R/c):
//
//	f = (d/H) [e/d + c d/(2R) − √(2 c e/R)]
//
// with c = 1 − k on the globe and c = −k on the plane, k being the
// refraction coefficient [Hirt 2010, eq. 2]: one photograph cannot tell the
// models apart, the air each needs can.
//
// # 6. The view (fan)
//
// Seen from the camera, ±2.5° around the rock (wider than the photograph), every 0.005°: the GLO-30
// heights on rings every 100 m (20 m across the rock) out to 95 km, keeping
// only the cells that can be seen for some apparent curvature between −1
// and 1.2. The rock's cells are raised in proportion to its surveyed height.
//
// Distances are great circles on a 6,371 km sphere from the coordinates:
// the radius enters there (evidence class "check", CLAUDE.md rule 10). The
// plane gets the same distances.
//
// # References
//
//   - [Copernicus 2022] Copernicus DEM GLO-30, European Space Agency, https://doi.org/10.5270/ESA-c5d3d65.
//   - [Foreman 1977] M. G. G. Foreman, Manual for Tidal Heights Analysis and Prediction, Pacific
//     Marine Science Report 77-10, Institute of Ocean Sciences, Patricia Bay (1977, rev. 2004).
//   - [Hersbach 2020] H. Hersbach et al., "The ERA5 global reanalysis", Q. J. R. Meteorol. Soc. 146 (2020) 1999-2049.
//   - [Hirt 2010] C. Hirt et al., "Monitoring of the refraction coefficient in the lower atmosphere
//     using a controlled setup of simultaneous reciprocal vertical angle measurements", J. Geophys.
//     Res. 115 (2010) D21102.
//   - [IOC] IOC Sea Level Station Monitoring Facility, station "leit" (Leith), https://www.ioc-sealevelmonitoring.org/
//   - [NCEP GFS] NOAA/NCEP Global Forecast System, through the Open-Meteo historical forecast API.
//   - [StAbbs] St Abb's Head, 55° 54′ 57.9″ N, 2° 08′ 19.0″ W (Wikipedia, "St Abb's Head"; the lighthouse on its tip).
//   - [NOC] National Oceanography Centre, UK National Tide Gauge Network (operator of the Leith gauge).
//   - [Open-Meteo] Open-Meteo historical weather, historical forecast and marine APIs, https://open-meteo.com/
//   - [OS] Bass Rock, 107 m (350 ft): Gazetteer for Scotland, https://www.scottish-places.info/features/featurefirst3875.html
//     (the Ordnance Survey's modern figure; the OS Name Book of 1853 said about 420 ft, the Ordnance Gazetteer 313 ft).
//   - [Sinnott 1984] R. W. Sinnott, "Virtues of the haversine", Sky and Telescope 68 (1984) 159.
package lomond

import (
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"math"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"flatorglobe/tools/internal/dem"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/refrac"
)

// Paths, relative to the repository root.
const (
	Dir    = "data/contrib/lomond"
	RawDir = Dir + "/raw"
	CopDir = RawDir + "/cop"
	Out    = "src/data/presets/contrib-lomond.js"
	// Day and the gauge's four weeks around it (UTC).
	Day       = "2023-08-09"
	GaugeFrom = "2023-07-26T00:00:00"
	GaugeTo   = "2023-08-23T00:00:00"
)

var (
	// R is the sphere of the distances and of the globe's rays (m).
	R = 6371e3
	// When is the photograph, 5:28 am BST (the contributor: "just after
	// sunrise, 5.26am").
	When = time.Date(2023, 8, 9, 4, 28, 0, 0, time.UTC)
	// The contributor's numbers.
	CamH, DRockGiven, DAbbsGiven, RockHGiven = 345.0, 39900.0, 75900.0, 112.0
	// CamHSd: the camera's height, from GLO-30 under it (a few metres) and
	// from where along the line of parallax it stands.
	CamHSd = 5.0
	// CamEye: the camera above the ground (m), a photographer standing.
	CamEye = 1.5
	// RockH: Bass Rock's summit [OS]; RockHSd spans the published values.
	RockH, RockHSd = 107.0, 5.0
	// St Abb's Head [StAbbs].
	AbbsLat, AbbsLon = 55.0 + 54.0/60 + 58.0/3600, -(2.0 + 8.0/60 + 19.0/3600)
	// Search boxes (lat0, lat1, lon0, lon1): Bass Rock, East Lomond.
	RockBox   = [4]float64{56.070, 56.086, -2.652, -2.628}
	LomondBox = [4]float64{56.20, 56.28, -3.28, -3.15}
	// CopTiles: the GLO-30 cells (south-west corners) of the view.
	CopTiles = [][2]int{{56, -4}, {56, -3}, {55, -3}, {55, -2}, {56, -2}}
	// WeatherPts: three sea points along the line of sight (20, 40, 60 km).
	WeatherPts = [][2]float64{{56.16, -2.93}, {56.08, -2.64}, {56.00, -2.35}}
	// Levels: the model's pressure levels (hPa).
	Levels = []int{1000, 975, 950, 925}
	// DMax: the farthest sea counted for the horizon (m); Dx: the rays' step.
	DMax, Dx = 200e3, 10.0
	// AirSea: the air − sea differences traced (K): from, to, step.
	AirSea = [3]float64{-10, 2, 0.25}
	// Shifts: the uniform gradients added to the column (K/m).
	Shifts = func() []float64 {
		var s []float64
		for i := -24; i <= 6; i++ {
			s = append(s, float64(i)/100)
		}
		return s
	}()
)

// gc is the great-circle distance (m) on the sphere R and the initial
// azimuth (degrees, 0-360): haversine [Sinnott 1984] and the forward
// azimuth of spherical trigonometry.
func gc(lat1, lon1, lat2, lon2 float64) (float64, float64) {
	r := math.Pi / 180
	p1, p2, dl := lat1*r, lat2*r, (lon2-lon1)*r
	a := math.Pow(math.Sin((p2-p1)/2), 2) + math.Cos(p1)*math.Cos(p2)*math.Pow(math.Sin(dl/2), 2)
	d := 2 * R * math.Asin(math.Sqrt(a))
	az := math.Atan2(math.Sin(dl)*math.Cos(p2), math.Cos(p1)*math.Sin(p2)-math.Sin(p1)*math.Cos(p2)*math.Cos(dl)) / r
	return d, math.Mod(az+360, 360)
}

// dest is the point at distance d (m) and azimuth az (degrees) from (lat, lon).
func dest(lat, lon, az, d float64) (float64, float64) {
	r := math.Pi / 180
	la, lo, a, dd := lat*r, lon*r, az*r, d/R
	la2 := math.Asin(math.Sin(la)*math.Cos(dd) + math.Cos(la)*math.Sin(dd)*math.Cos(a))
	lo2 := lo + math.Atan2(math.Sin(a)*math.Sin(dd)*math.Cos(la), math.Cos(dd)-math.Sin(la)*math.Sin(la2))
	return la2 / r, lo2 / r
}

func height(cop *dem.Cop, lat, lon float64) float64 {
	v, err := cop.Grid([]float64{lat}, []float64{lon})
	if err != nil {
		panic(err)
	}
	return v[0]
}

// summit is the highest GLO-30 point in a box (search every ~5 m).
func summit(cop *dem.Cop, b [4]float64) (h, lat, lon float64) {
	h = math.Inf(-1)
	for la := b[0]; la <= b[1]; la += 0.00005 {
		for lo := b[2]; lo <= b[3]; lo += 0.0001 {
			if v := height(cop, la, lo); v > h {
				h, lat, lon = v, la, lo
			}
		}
	}
	return
}

// camera is the first guess: the point of the CamH contour (±3 m) in LomondBox whose
// distances to the rock's summit and St Abb's Head best match the
// contributor's, among the points from which the ground does not hide the
// sea in front of the rock: the photograph shows the sea down to ClearMrad
// below the horizontal (the terrain toward the rock, 60 m to 12 km, must
// stay below that). The two distances point almost the same way (116.9°
// and 118.0°): they fix the camera along the line of sight, the contour and
// the clear view across it. misfit is the RMS of the two differences (m).
func camera(cop *dem.Cop, rLat, rLon float64) (lat, lon, ground, misfit float64) {
	misfit = math.Inf(1)
	for la := LomondBox[0]; la <= LomondBox[1]; la += 0.0001 {
		for lo := LomondBox[2]; lo <= LomondBox[3]; lo += 0.00015 {
			g := height(cop, la, lo)
			if math.Abs(g-CamH) > 3 {
				continue
			}
			d1, az := gc(la, lo, rLat, rLon)
			d2, _ := gc(la, lo, AbbsLat, AbbsLon)
			m := math.Sqrt(((d1-DRockGiven)*(d1-DRockGiven) + (d2-DAbbsGiven)*(d2-DAbbsGiven)) / 2)
			if m >= misfit || m > 200 || !clear(cop, la, lo, CamH, az) {
				continue
			}
			lat, lon, ground, misfit = la, lo, g, m
		}
	}
	return
}

// gap is the angle (rad) from the rock's summit to St Abb's Head seen from
// (la, lo), positive to the right.
func gap(la, lo, rLat, rLon float64) float64 {
	_, a1 := gc(la, lo, rLat, rLon)
	_, a2 := gc(la, lo, AbbsLat, AbbsLon)
	return (a2 - a1) * math.Pi / 180
}

// onLine is the point of LomondBox where gap is G (within 0.15 mrad, about
// 13 m sideways), with a clear view of the sea from CamEye above the ground,
// whose ground is closest to CamH.
func onLine(cop *dem.Cop, rLat, rLon, G float64) (lat, lon, ground float64, ok bool) {
	best := math.Inf(1)
	for la := LomondBox[0]; la <= LomondBox[1]; la += 0.0001 {
		for lo := LomondBox[2]; lo <= LomondBox[3]; lo += 0.00015 {
			if math.Abs(gap(la, lo, rLat, rLon)-G) > 0.15e-3 {
				continue
			}
			g := height(cop, la, lo)
			if math.IsNaN(g) || math.Abs(g-CamH) >= best {
				continue
			}
			_, az := gc(la, lo, rLat, rLon)
			if !clear(cop, la, lo, g+CamEye, az) {
				continue
			}
			lat, lon, ground, best, ok = la, lo, g, math.Abs(g-CamH), true
		}
	}
	return
}

// skyline is the land's outline above the sea horizon (rad; 0 where only
// sea shows), seen from (la, lo) at e m above the water w, for an apparent
// curvature c, at azimuths azRef + a (a in rad): the steepest GLO-30 point
// 45 to 95 km away, as in the fan.
func skyline(cop *dem.Cop, la, lo, e, w, c, azRef float64, as []float64) []float64 {
	hor := -math.Sqrt(2 * c * e / R)
	out := make([]float64, len(as))
	for i, a := range as {
		best := math.Inf(-1)
		for x := 45000.0; x < 95000; x += 100 {
			p, q := dest(la, lo, azRef+a*180/math.Pi, x)
			h := height(cop, p, q)
			if math.IsNaN(h) || h <= 0.5 {
				continue
			}
			if el := math.Atan((h-w-e)/x - c*x/(2*R)); el > best {
				best = el
			}
		}
		out[i] = math.Max(0, best-hor)
	}
	return out
}

// Parallax is the fit of St Abb's Head's outline (package doc, step 1).
type Parallax struct {
	// Delta: the model's angle minus the photograph's (rad; positive when
	// the model puts St Abb's Head too far right), at the rock's scale;
	// Rms: the residual (px).
	Delta, Rms float64
	// Scale, RmsFree: the scale (px/rad) and residual when the outline's
	// own shape sets the scale too.
	Scale, RmsFree float64
}

// parallax fits the photograph's outline of St Abb's Head (rd.Abbs: column
// x at angle (x − SummitX)/pxRad from the rock's summit, height in px above
// the horizon) to the model's from (la, lo), heights in px at pxRad.
func parallax(cop *dem.Cop, rd *Reading, la, lo, e, w, c, azSummit, pxRad float64) Parallax {
	const a0, da = 4e-3, 0.02e-3
	as := make([]float64, 0, 2200)
	for a := a0; a <= 48e-3; a += da {
		as = append(as, a)
	}
	sk := skyline(cop, la, lo, e, w, c, azSummit, as)
	at := func(a float64) float64 { // linear interpolation, 0 off the grid
		u := (a - a0) / da
		i := int(math.Floor(u))
		if i < 0 || i+1 >= len(sk) {
			return 0
		}
		return (sk[i] + (u-float64(i))*(sk[i+1]-sk[i])) * pxRad
	}
	misfit := func(off, s float64) float64 {
		se := 0.0
		for _, p := range rd.Abbs {
			m := at(off + (p[0]-rd.SummitX)/s)
			se += (p[1] - m) * (p[1] - m)
		}
		return math.Sqrt(se / float64(len(rd.Abbs)))
	}
	var r Parallax
	r.Rms, r.RmsFree = math.Inf(1), math.Inf(1)
	for d := -12e-3; d <= 12e-3; d += 0.01e-3 {
		if m := misfit(d, pxRad); m < r.Rms {
			r.Rms, r.Delta = m, d
		}
	}
	// free scale: the angle of the outline's first column and the scale
	x0 := rd.Abbs[0][0] - rd.SummitX
	for s := 20000.0; s <= 36000; s += 100 {
		for o := 8e-3; o <= 40e-3; o += 0.02e-3 {
			if m := misfit(o-x0/s, s); m < r.RmsFree {
				r.RmsFree, r.Scale = m, s
			}
		}
	}
	return r
}

// ClearMrad: the lowest sea the photograph shows, below the horizontal
// (13 mrad under its horizon, which is 10 mrad down).
var ClearMrad = -23.0

// clear: no ground between 60 m and 12 km along az rises above ClearMrad
// seen from height e (straight lines over the sphere).
func clear(cop *dem.Cop, la, lo, e, az float64) bool {
	for x := 60.0; x < 12000; x += 30 {
		a, b := dest(la, lo, az, x)
		if (height(cop, a, b)-e)/x-x/(2*R) > ClearMrad/1000 {
			return false
		}
	}
	return true
}

// span is the azimuth range (degrees) of the rock's GLO-30 cells above 1 m,
// seen from the camera.
func span(cop *dem.Cop, cLat, cLon float64) (lo, hi float64) {
	lo, hi = 360, 0
	for la := RockBox[0]; la <= RockBox[1]; la += 0.00005 {
		for lon := RockBox[2]; lon <= RockBox[3]; lon += 0.0001 {
			if height(cop, la, lon) > 1 {
				_, az := gc(cLat, cLon, la, lon)
				lo, hi = math.Min(lo, az), math.Max(hi, az)
			}
		}
	}
	return
}

// fUniform is f in air of uniform apparent curvature c (the formula of the
// package doc, with the horizon at the sea DMax away when c gives none
// before it).
func fUniform(c, e, H, d float64) float64 {
	el := func(dd, h float64) float64 { return math.Atan((h-e)/dd - c*dd/(2*R)) }
	hor := el(DMax, 0)
	if c > 0 && math.Sqrt(2*e*R/c) < DMax {
		hor = -math.Sqrt(2 * c * e / R)
	}
	base, top := el(d, 0), el(d, H)
	return (hor - base) / (top - base)
}

// cFor is the apparent curvature for which fUniform = f (bisection; f
// decreases as c grows).
func cFor(f, e, H, d float64) float64 {
	lo, hi := 1e-6, 5.0
	for range 100 {
		m := (lo + hi) / 2
		if fUniform(m, e, H, d) > f {
			lo = m
		} else {
			hi = m
		}
	}
	return (lo + hi) / 2
}

// traced is f for rays traced through air over the globe or the plane,
// and the three angles (rad).
func traced(air refrac.Air, P0, e, H, d float64, flat bool) (f, hor, base, top float64) {
	g := refrac.NewGradient(air, P0, refrac.ZGrid(e+200))
	cR := 1 / R
	if flat {
		cR = 0
	}
	hor = refrac.Horizon(g, e, cR, DMax, Dx)
	base, ok1 := refrac.Aim(g, e, 0, cR, d, Dx)
	top, ok2 := refrac.Aim(g, e, H, cR, d, Dx)
	if !ok1 || !ok2 {
		return math.NaN(), hor, base, top
	}
	return (hor - base) / (top - base), hor, base, top
}

// Result is what the preset holds, and a log of the steps.
type Result struct {
	Site, Photo, Tide, Air, Fan pyjson.Obj
	Traced, SeaAir              []any
	TracedAS                    pyjson.Obj
	Log                         strings.Builder
}

func (r *Result) logf(f string, a ...any) { fmt.Fprintf(&r.Log, f+"\n", a...) }

// Compute runs the six steps.
func Compute(root string) (*Result, error) {
	res := &Result{}
	cop := &dem.Cop{Dir: filepath.Join(root, CopDir)}
	for _, t := range CopTiles { // all tiles present (or marked absent) before anything else
		if _, err := cop.Grid([]float64{float64(t[0]) + 0.5}, []float64{float64(t[1]) + 0.5}); err != nil {
			return nil, err
		}
	}
	// 1. the rock, the photograph, the tide; then the camera
	hCop, rLat, rLon := summit(cop, RockBox)
	g, err := loadGray(filepath.Join(root, "public", Lomond.Src))
	if err != nil {
		return nil, err
	}
	rd, err := Lomond.Read(g)
	if err != nil {
		return nil, err
	}
	res.logf("photo: horizon %.2f + %.5f x (sd %.2f px, %d bands, tilt %.2f°); summit row %.2f at x %.0f; foot %.2f (sd %.2f); ends %.1f..%.1f; f = %.4f ± %.4f; St Abb's outline %d columns",
		rd.HorA, rd.HorB, rd.HorSd, len(rd.HorPts), math.Atan(rd.HorB)*180/math.Pi, rd.SummitRow, rd.SummitX, rd.Base, rd.BaseSd, rd.Left, rd.Right, rd.F, rd.FSd, len(rd.Abbs))
	rs, err := leith(root)
	if err != nil {
		return nil, err
	}
	td, err := tideAt(rs, float64(When.Unix()))
	if err != nil {
		return nil, err
	}
	w := td.Water
	H := RockH - w
	res.logf("tide: %d readings, gap %s..%s UTC; water %+.2f m (prediction %+.2f, surge %+.2f); held-out %d windows: %.1f cm RMS",
		td.N, time.Unix(int64(td.Gap[0]), 0).UTC().Format("15:04"), time.Unix(int64(td.Gap[1]), 0).UTC().Format("15:04"),
		w, td.Pred, td.Surge, td.CheckN, td.CheckCm)
	// the first guess, from the contributor's numbers
	gLat, gLon, gGround, misfit := camera(cop, rLat, rLon)
	fit := func(la, lo, gr float64) Parallax {
		e := gr + CamEye - w
		dd, a := gc(la, lo, rLat, rLon)
		return parallax(cop, rd, la, lo, e, w, cFor(rd.F, e, H, dd), a, (rd.Base-rd.SummitRow)/(H/dd))
	}
	px0 := fit(gLat, gLon, gGround)
	res.logf("camera, first guess: %.5f %.5f (ground %.1f m, distances misfit %.0f m); St Abb's Head misplaced by %+.2f mrad (rms %.2f px); free scale %.0f px/rad (rms %.2f px)",
		gLat, gLon, gGround, misfit, px0.Delta*1e3, px0.Rms, px0.Scale, px0.RmsFree)
	// by parallax
	G := gap(gLat, gLon, rLat, rLon) - px0.Delta
	cLat, cLon, ground, px := gLat, gLon, gGround, px0
	for it := 0; it < 4; it++ {
		la, lo, gr, ok := onLine(cop, rLat, rLon, G)
		if !ok {
			return nil, fmt.Errorf("camera: no clear point where the gap to St Abb's Head is %.2f mrad", G*1e3)
		}
		cLat, cLon, ground, px = la, lo, gr, fit(la, lo, gr)
		res.logf("camera, parallax %d: gap %.2f mrad -> %.5f %.5f (ground %.1f m); left %+.3f mrad (rms %.2f px); free scale %.0f px/rad (rms %.2f px)",
			it, G*1e3, la, lo, gr, px.Delta*1e3, px.Rms, px.Scale, px.RmsFree)
		if math.Abs(px.Delta) < 0.03e-3 {
			break
		}
		G -= px.Delta
	}
	e := ground + CamEye - w
	d, az := gc(cLat, cLon, rLat, rLon)
	dA, azA := gc(cLat, cLon, AbbsLat, AbbsLon)
	moved, azMove := gc(gLat, gLon, cLat, cLon)
	side := moved * math.Sin((az-azMove)*math.Pi/180) // to the left of the line of sight
	azLo, azHi := span(cop, cLat, cLon)
	widthRad := (azHi - azLo) * math.Pi / 180 * math.Cos(0) // azimuth difference at the horizon (elevation < 1°)
	res.logf("rock: GLO-30 summit %.1f m at %.5f %.5f; camera %.5f %.5f (ground %.1f m, eye %.1f m; %.0f m from the first guess, %.0f m to the left): rock %.0f m at %.3f°, St Abb's %.0f m at %.3f°; rock spans %.3f..%.3f° (%.2f mrad)",
		hCop, rLat, rLon, cLat, cLon, ground, ground+CamEye, moved, side, d, az, dA, azA, azLo, azHi, widthRad*1e3)

	// the picture's scale from the rock's height, and its height from its width
	pxRad := (rd.Base - rd.SummitRow) / (H / d)
	pxRadW := (rd.Right - rd.Left) / widthRad
	hPhoto := (rd.Base-rd.SummitRow)/pxRadW*d + w
	// the width's uncertainty: half a GLO-30 cell (15 m) at each end, a pixel on the photograph
	sdW := math.Hypot(30/d/widthRad, 1/(rd.Right-rd.Left))
	hPhotoSd := (hPhoto - w) * sdW
	res.logf("scale: %.0f px/rad from the height, %.0f px/rad from the width; the photograph's height for the rock %.1f ± %.1f m", pxRad, pxRadW, hPhoto, hPhotoSd)

	// uniform air: the apparent curvature the photograph needs
	c := cFor(rd.F, e, H, d)
	cLo, cHi := cFor(rd.F+rd.FSd, e, H, d), cFor(rd.F-rd.FSd, e, H, d)
	res.logf("uniform air: c = %.3f (%.3f..%.3f): k globe %+.3f, k plane %+.3f; f straight %.3f, k = 0.13 %.3f",
		c, cLo, cHi, 1-c, -c, fUniform(1, e, H, d), fUniform(0.87, e, H, d))

	// 4. air
	ws, err := weather(root)
	if err != nil {
		return nil, err
	}
	m := meanWx(ws)
	day := m.gfsColumn(0)
	era := m.eraColumn()
	gDay, gEra := grad(day, e), grad(era, e)
	lo, hi := math.Min(gDay, gEra), math.Max(gDay, gEra)
	var pts []any
	for i, p := range ws {
		g1, g2 := grad(p.gfsColumn(0), e), grad(p.eraColumn(), e)
		lo, hi = math.Min(lo, math.Min(g1, g2)), math.Max(hi, math.Max(g1, g2))
		pts = append(pts, pyjson.Obj{{K: "lat", V: WeatherPts[i][0]}, {K: "lon", V: WeatherPts[i][1]},
			{K: "sst", V: round(p.SST, 2)}, {K: "t2", V: round(p.T2, 2)}, {K: "gt2", V: round(p.GT2, 2)},
			{K: "grad", V: round(g1, 4)}, {K: "gradEra", V: round(g2, 4)}})
	}
	Tm := day.T(e/2) + 273.15
	res.logf("air: sea %.2f °C, 2 m ERA5 %.2f / GFS %.2f °C, wind %.1f / %.1f m/s, L %.1f m; mean dT/dz 2 m..%.0f m: GFS %+.4f, ERA5 surface %+.4f K/m (band %+.4f..%+.4f)",
		m.SST, m.T2, m.GT2, m.U, m.GU, day.S.L, e, gDay, gEra, lo, hi)
	var lev []any
	for _, l := range m.Lev {
		lev = append(lev, []any{round(l.Z, 1), round(l.T, 2)})
	}

	// 5. rays: the day's air, then the shifted columns
	fG, horG, baseG, topG := traced(day, m.GP, e, H, d, false)
	fF, _, _, _ := traced(day, m.GP, e, H, d, true)
	fGe, _, _, _ := traced(era, m.P, e, H, d, false)
	fFe, _, _, _ := traced(era, m.P, e, H, d, true)
	res.logf("traced, day's air: globe f %.3f (dip %.2f′), plane f %.3f; ERA5 surface: globe %.3f, plane %.3f",
		fG, -horG*180/math.Pi*60, fF, fGe, fFe)
	_ = baseG
	_ = topG
	rows := make([]pyjson.Obj, len(Shifts))
	var wg sync.WaitGroup
	sem := make(chan struct{}, 4)
	for i, s := range Shifts {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			col := m.gfsColumn(s)
			a, _, _, _ := traced(col, m.GP, e, H, d, false)
			b, _, _, _ := traced(col, m.GP, e, H, d, true)
			rows[i] = pyjson.Obj{{K: "shift", V: s}, {K: "grad", V: round(grad(col, e), 4)}, {K: "globe", V: nanNull(a, 4)}, {K: "flat", V: nanNull(b, 4)}}
		}()
	}
	wg.Wait()
	for _, r := range rows {
		res.Traced = append(res.Traced, r)
		res.logf("    %s", pyjson.Dumps(r, pyjson.Default))
	}

	// the sea-air difference: the model's column kept, the sea made warmer or
	// colder under the same 2 m air (air − sea from AirSea[0] to AirSea[1])
	nSA := int(math.Round((AirSea[1]-AirSea[0])/AirSea[2])) + 1
	sa := make([]pyjson.Obj, nSA)
	for i := range sa {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			dT := AirSea[0] + float64(i)*AirSea[2]
			col := &refrac.Column{S: refrac.NewProfile(m.GT2-dT, m.GT2, math.Min(m.GTd, m.GT2-0.3), m.GU, m.GP), ZTop: ZTop, Levels: m.Lev}
			a, _, _, _ := traced(col, m.GP, e, H, d, false)
			b, _, _, _ := traced(col, m.GP, e, H, d, true)
			sa[i] = pyjson.Obj{{K: "dT", V: round(dT, 2)}, {K: "globe", V: nanNull(a, 4)}, {K: "flat", V: nanNull(b, 4)}}
		}()
	}
	wg.Wait()
	asLo, asHi := m.GT2-m.SST, m.GT2-m.SST
	for _, p := range ws {
		for _, v := range []float64{p.GT2 - p.SST, p.T2 - p.SST} {
			asLo, asHi = math.Min(asLo, v), math.Max(asHi, v)
		}
	}
	for _, r := range sa {
		res.SeaAir = append(res.SeaAir, r)
	}
	// the column's shifts again under other air − sea differences, the same
	// freedom for both models: the most favourable to the plane in the grid,
	// the range of the points and models, GFS's and ERA5's
	asList := []float64{AirSea[0], asLo, m.GT2 - m.SST, m.T2 - m.SST, asHi}
	asG, asF := make([][]any, len(asList)), make([][]any, len(asList))
	for j, dT := range asList {
		asG[j], asF[j] = make([]any, len(Shifts)), make([]any, len(Shifts))
		for i, sh := range Shifts {
			wg.Add(1)
			go func() {
				defer wg.Done()
				sem <- struct{}{}
				defer func() { <-sem }()
				col := &refrac.Column{S: refrac.NewProfile(m.GT2-dT, m.GT2, math.Min(m.GTd, m.GT2-0.3), m.GU, m.GP), ZTop: ZTop, Levels: m.Lev, Shift: sh}
				a, _, _, _ := traced(col, m.GP, e, H, d, false)
				b, _, _, _ := traced(col, m.GP, e, H, d, true)
				asG[j][i], asF[j][i] = nanNull(a, 4), nanNull(b, 4)
			}()
		}
	}
	wg.Wait()
	rAS := make([]any, len(asList))
	for j, v := range asList {
		rAS[j] = round(v, 2)
	}
	gA, fA := make([]any, len(asList)), make([]any, len(asList))
	for j := range asList {
		gA[j], fA[j] = asG[j], asF[j]
	}
	res.TracedAS = pyjson.Obj{{K: "airSea", V: rAS}, {K: "globe", V: gA}, {K: "flat", V: fA}}
	res.logf("air − sea: GFS %+.2f K, ERA5 %+.2f K (points and models %+.2f..%+.2f); traced over %d values", m.GT2-m.SST, m.T2-m.SST, asLo, asHi, nSA)

	// 6. the view
	fan, nCells, err := buildFan(cop, cLat, cLon, ground, e, w, az, d, hCop)
	if err != nil {
		return nil, err
	}
	res.logf("fan: %d cells kept", nCells)

	res.Site = pyjson.Obj{
		{K: "when", V: "2023-08-09T04:28:00Z"}, {K: "local", V: "5:28 am BST"},
		{K: "cam", V: pyjson.Obj{{K: "lat", V: round(cLat, 5)}, {K: "lon", V: round(cLon, 5)}, {K: "ground", V: round(ground, 1)},
			{K: "h", V: round(ground+CamEye, 1)}, {K: "hSd", V: CamHSd}, {K: "moved", V: round(moved, 0)}, {K: "side", V: round(side, 0)}}},
		{K: "given", V: pyjson.Obj{{K: "h", V: CamH}, {K: "dRock", V: DRockGiven}, {K: "dAbbs", V: DAbbsGiven}, {K: "rockH", V: RockHGiven},
			{K: "lat", V: round(gLat, 5)}, {K: "lon", V: round(gLon, 5)}, {K: "misfit", V: round(misfit, 0)}}},
		{K: "parallax", V: pyjson.Obj{{K: "delta0", V: round(px0.Delta*1e3, 2)}, {K: "rms0", V: round(px0.Rms, 2)},
			{K: "delta", V: round(px.Delta*1e3, 3)}, {K: "rms", V: round(px.Rms, 2)}, {K: "scale", V: math.Round(px.Scale)}, {K: "rmsFree", V: round(px.RmsFree, 2)},
			{K: "perM", V: round((1/d-1/dA)*1e6, 2)}}},
		{K: "rock", V: pyjson.Obj{{K: "lat", V: round(rLat, 5)}, {K: "lon", V: round(rLon, 5)}, {K: "d", V: round(d, 0)}, {K: "az", V: round(az, 3)},
			{K: "H", V: RockH}, {K: "Hsd", V: RockHSd}, {K: "Hcop", V: round(hCop, 1)}, {K: "Hphoto", V: round(hPhoto, 1)}, {K: "HphotoSd", V: round(hPhotoSd, 1)},
			{K: "az0", V: round(azLo, 3)}, {K: "az1", V: round(azHi, 3)}}},
		{K: "abbs", V: pyjson.Obj{{K: "lat", V: round(AbbsLat, 5)}, {K: "lon", V: round(AbbsLon, 5)}, {K: "d", V: round(dA, 0)}, {K: "az", V: round(azA, 3)}}},
		{K: "water", V: round(w, 2)}, {K: "e", V: round(e, 2)}, {K: "Hw", V: round(H, 2)}, {K: "dMax", V: DMax},
		{K: "c", V: round(c, 4)}, {K: "cLo", V: round(cLo, 4)}, {K: "cHi", V: round(cHi, 4)},
		{K: "P", V: round(m.GP, 1)}, {K: "Tmid", V: round(Tm, 2)},
	}
	res.Photo = pyjson.Obj{
		{K: "src", V: Lomond.Src}, {K: "w", V: Lomond.W}, {K: "h", V: Lomond.H},
		{K: "horA", V: round(rd.HorA, 3)}, {K: "horB", V: round(rd.HorB, 6)}, {K: "horSd", V: round(rd.HorSd, 2)},
		{K: "summitX", V: rd.SummitX}, {K: "summitRow", V: round(rd.SummitRow, 2)}, {K: "base", V: round(rd.Base, 2)}, {K: "baseSd", V: round(rd.BaseSd, 2)},
		{K: "left", V: round(rd.Left, 1)}, {K: "right", V: round(rd.Right, 1)}, {K: "horAtSummit", V: round(rd.HorAtSummit, 2)},
		{K: "f", V: round(rd.F, 4)}, {K: "fSd", V: round(rd.FSd, 4)},
		{K: "pxRad", V: round(pxRad, 0)}, {K: "pxRadW", V: round(pxRadW, 0)},
		{K: "horPts", V: pairs(rd.HorPts)}, {K: "outline", V: pairs(rd.Outline)}, {K: "abbs", V: pairs(rd.Abbs)},
	}
	var hl []any
	for _, x := range td.HL {
		hl = append(hl, x)
	}
	res.Tide = pyjson.Obj{
		{K: "gauge", V: "Leith"}, {K: "n", V: td.N}, {K: "rmsCm", V: td.Rms},
		{K: "gap", V: []string{time.Unix(int64(td.Gap[0]), 0).UTC().Format("15:04"), time.Unix(int64(td.Gap[1]), 0).UTC().Format("15:04")}},
		{K: "water", V: round(w, 2)}, {K: "pred", V: round(td.Pred, 2)}, {K: "surge", V: round(td.Surge, 2)},
		{K: "checkN", V: td.CheckN}, {K: "checkCm", V: td.CheckCm},
		{K: "hours", V: td.Hours}, {K: "hl", V: hl}, {K: "series", V: pairs(td.Series)},
	}
	res.Air = pyjson.Obj{
		{K: "sst", V: round(m.SST, 2)}, {K: "t2", V: round(m.T2, 2)}, {K: "td", V: round(m.Td, 2)}, {K: "u", V: round(m.U, 2)},
		{K: "dir", V: math.Round(m.Dir)}, {K: "P", V: round(m.P, 1)}, {K: "hs", V: round(m.Hs, 2)},
		{K: "gt2", V: round(m.GT2, 2)}, {K: "gtd", V: round(m.GTd, 2)}, {K: "gu", V: round(m.GU, 2)}, {K: "gP", V: round(m.GP, 1)},
		{K: "levels", V: lev}, {K: "L", V: round(day.S.L, 1)},
		{K: "grad", V: round(gDay, 4)}, {K: "gradEra", V: round(gEra, 4)}, {K: "gradLo", V: round(lo, 4)}, {K: "gradHi", V: round(hi, 4)},
		{K: "fGlobe", V: nanNull(fG, 4)}, {K: "fFlat", V: nanNull(fF, 4)}, {K: "fGlobeEra", V: nanNull(fGe, 4)}, {K: "fFlatEra", V: nanNull(fFe, 4)},
		{K: "dipDay", V: round(-horG*1e3, 4)},
		{K: "airSea", V: round(m.GT2-m.SST, 2)}, {K: "airSeaEra", V: round(m.T2-m.SST, 2)}, {K: "airSeaLo", V: round(asLo, 2)}, {K: "airSeaHi", V: round(asHi, 2)},
		{K: "points", V: pts},
	}
	res.Fan = fan
	return res, nil
}

func pairs(p [][2]float64) []any {
	out := make([]any, len(p))
	for i, v := range p {
		out[i] = []float64{v[0], v[1]}
	}
	return out
}

func nanNull(x float64, n int) any {
	if math.IsNaN(x) || math.IsInf(x, 0) {
		return nil
	}
	return round(x, n)
}

// buildFan samples the view (package doc, step 6).
func buildFan(cop *dem.Cop, cLat, cLon, ground, e, w, azRock, dRock, hCop float64) (pyjson.Obj, int, error) {
	const azHalf, azStep = 2.5, 0.005
	nAz := int(math.Round(2*azHalf/azStep)) + 1
	az0 := azRock - azHalf
	var ds []float64
	for x := 300.0; x <= 95000; x += 100 {
		if x >= dRock-600 && x < dRock+600 {
			continue
		}
		ds = append(ds, x)
	}
	for x := dRock - 600; x < dRock+600; x += 20 {
		ds = append(ds, x)
	}
	sortF(ds)
	cs := []float64{-1, -0.5, 0, 0.5, 0.8, 0.87, 1, 1.2}
	scale := RockH / hCop
	var buf []uint16
	n := 0
	for j := 0; j < nAz; j++ {
		a := az0 + float64(j)*azStep
		run := make([]float64, len(cs))
		for k := range run {
			run[k] = math.Inf(-1)
		}
		var cells []uint16
		for i, x := range ds {
			la, lo := dest(cLat, cLon, a, x)
			h := height(cop, la, lo)
			if math.IsNaN(h) || h <= 0.5 {
				continue
			}
			if math.Abs(x-dRock) < 600 && math.Abs(a-azRock) < 0.5 {
				h *= scale
			}
			keep := false
			for k, c := range cs {
				v := (h-w-e)/x - c*x/(2*R)
				if v > run[k] {
					run[k] = v
					if v > -0.045 {
						keep = true
					}
				}
			}
			if keep {
				cells = append(cells, uint16(i), uint16(math.Round(h*10)))
			}
		}
		buf = append(buf, uint16(len(cells)/2))
		buf = append(buf, cells...)
		n += len(cells) / 2
	}
	b := make([]byte, 2*len(buf))
	for i, v := range buf {
		binary.LittleEndian.PutUint16(b[2*i:], v)
	}
	dsr := make([]float64, len(ds))
	for i, x := range ds {
		dsr[i] = math.Round(x)
	}
	return pyjson.Obj{{K: "az0", V: round(az0, 4)}, {K: "azStep", V: azStep}, {K: "nAz", V: nAz}, {K: "q", V: 10},
		{K: "d", V: dsr}, {K: "rockScale", V: round(scale, 4)}, {K: "b64", V: base64.StdEncoding.EncodeToString(b)}}, n, nil
}

func sortF(a []float64) {
	for i := 1; i < len(a); i++ {
		for j := i; j > 0 && a[j] < a[j-1]; j-- {
			a[j], a[j-1] = a[j-1], a[j]
		}
	}
}

var compact = pyjson.Opts{Item: ",", Key: ":", ASCII: true}

// File is the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	b.WriteString("export const LOM_SITE = " + pyjson.Dumps(r.Site, compact) + ";\n")
	b.WriteString("export const LOM_PHOTO = " + pyjson.Dumps(r.Photo, compact) + ";\n")
	b.WriteString("export const LOM_TIDE = " + pyjson.Dumps(r.Tide, compact) + ";\n")
	b.WriteString("export const LOM_AIR = " + pyjson.Dumps(r.Air, compact) + ";\n")
	b.WriteString("export const LOM_TRACED = " + pyjson.Dumps(r.Traced, compact) + ";\n")
	b.WriteString("export const LOM_SEAAIR = " + pyjson.Dumps(r.SeaAir, compact) + ";\n")
	b.WriteString("export const LOM_TRACED_AS = " + pyjson.Dumps(r.TracedAS, compact) + ";\n")
	b.WriteString("export const LOM_FAN = " + pyjson.Dumps(r.Fan, compact) + ";\n")
	return preset.File{
		Out: Out, Command: "build contrib-lomond",
		Inputs: []string{Dir + "/inputs.lock", "public/" + Lomond.Src},
		Notes: []string{
			"Bass Rock from East Lomond Hill, Fife, 9 August 2023, 5:28 am BST (contrib tab), photograph by KenRDKAB (x.com/KenRDKAB),",
			"published with his permission. Camera located on Copernicus",
			"GLO-30 by the parallax of St Abb's Head on the photograph; Bass Rock 107 m (Ordnance Survey). Tide: Leith gauge (IOC/NOC),",
			"gap filled by a 12-constituent fit. Air: ERA5, GFS levels (Open-Meteo), marine SST. Rays traced over a 6,371 km",
			"sphere and over a plane. Distances: great circle on a 6,371 km sphere (the radius enters here). Heights m above",
			"the four weeks' mean sea level; angles rad unless named; f = share of the rock below the horizon, from its foot.",
		},
		Body: b.String(),
	}
}
