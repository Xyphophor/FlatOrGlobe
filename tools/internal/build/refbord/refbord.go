// Package refbord builds src/data/presets/ref-bordighera.js: the air of the
// Bordighera photograph of the hh tab (Nikon P900, 28 March 2026, 17:34 CET,
// from a balcony near Antibes, 49 km of sea) and the rays traced through it
// over the globe and over a plane, for the ref tab's "what air does each
// model need" example (the same question as the Caussols dip, 2026-11-13).
// First written for the hh tab on 2026-10-14 (target hh-bordighera-air,
// removed with the hh gauges the same day); port of
// research/bordighera_refraction.py's profile and rays, through package refrac.
//
// # 1. The scene (read from the hh presets)
//
// The eye height and the named buildings (distance, roof) come from
// src/data/presets/hh-bordighera.js (research/build_bordighera.py: IGN LiDAR
// HD under the balcony, OpenStreetMap and the Liguria LiDAR for the
// buildings); the roof of Villa Regina Margherita measured above the sea line
// on the photograph comes from src/data/presets/hh-bordighera-photo.js
// (research/fit_bordighera_photo.py: scale from the EXIF focal length). The
// height hidden there is H = roof − (roof seen above the sea line).
//
// # 2. The air (weather.json)
//
// At 17:34 CET, linearly between the 17 h and 18 h values (Europe/Paris), at
// three sea points south of the line of sight (43.5° N; 7.25, 7.5, 7.75° E),
// averaged: ERA5 2 m air and dew point, 10 m wind, surface pressure
// [Hersbach 2020], and the sea surface temperature [Open-Meteo marine].
//
// # 3. Rays (package refrac)
//
// The surface layer by Monin-Obukhov similarity (package refrac) for air-sea
// differences from −10 to +4 K, as for Adelaide; rays from the eye over a
// sphere of radius R = 6,371 km (globe) and over a plane (flat), in 5 m steps.
// The hidden height at a distance is the height there of the lowest ray that
// has not met the sea (bisection on its initial slope). The gauges show the
// mean temperature gradient between 0.5 m and the eye that each model needs
// for the height hidden at each moment, against the reanalysis' (±0.5 K on
// the air-sea difference, a reanalysis' usual uncertainty there).
//
// Distances are great circles on a 6,371 km sphere from the coordinates (the
// radius enters there: evidence class "check"); the plane gets the same.
//
// # References
//
//   - [Hersbach 2020] H. Hersbach et al., "The ERA5 global reanalysis", Q. J. R. Meteorol. Soc. 146 (2020) 1999-2049.
//   - [Open-Meteo] Open-Meteo historical weather (ERA5) and marine APIs, https://open-meteo.com/
//   - see package refrac for the surface layer, the refractivity and the ray tracing.
package refbord

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"flatorglobe/tools/internal/fetch"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/refrac"
)

// Paths, relative to the repository root.
const (
	Dir      = "data/ref/bordighera"
	RawDir   = Dir + "/raw"
	Out      = "src/data/presets/ref-bordighera.js"
	SitePre  = "src/data/presets/hh-bordighera.js"
	PhotoPre = "src/data/presets/hh-bordighera-photo.js"
	Day      = "2026-03-28"
)

var (
	// R is the sphere of the distances and of the globe's rays (m).
	R = 6371e3
	// Pts: three sea points south of the line of sight.
	Pts = [][2]float64{{43.5, 7.25}, {43.5, 7.5}, {43.5, 7.75}}
	// Hour, Frac: 17:34 local time = 34/60 of the way from 17 h to 18 h.
	Hour, Frac = 17, 34.0 / 60
	// AirSea: the air-sea differences traced (K).
	AirSea = airSea()
	// Dx: the rays' step (m).
	Dx = 5.0
)

// airSea: −10 to −4 K by 1 K, −4 to +1 K by 0.05 K (both models' solutions
// lie there), then 1.5, 2, 3, 4 K.
func airSea() []float64 {
	v := []float64{-10, -9, -8, -7, -6, -5}
	for i := 0; i <= 100; i++ {
		v = append(v, math.Round((-4+0.05*float64(i))*100)/100)
	}
	return append(v, 1.5, 2, 3, 4)
}

// Zs are the heights (m) at which each traced air's temperature is given, for
// the page's figure (the eye's height is added).
var Zs = []float64{0.5, 1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 35}

// HSd is the margin (m) on the height hidden at Villa Regina Margherita: the
// sea line on the photograph to 1.2 px (0.23 m at 49 km), the LiDAR roof and
// the sea level (tide, surge) to about half a metre each; rounded up to 1 m.
const HSd = 1.0

// Fetch downloads weather.json: [{"era5": hourly, "marine": hourly}, ...].
func Fetch(ctx context.Context, root string, refresh bool, c *fetch.Client, log io.Writer) error {
	if c == nil {
		c = &fetch.Client{}
	}
	dest := filepath.Join(root, RawDir, "weather.json")
	if _, err := os.Stat(dest); err == nil && !refresh {
		return nil
	}
	q := "&start_date=" + Day + "&end_date=" + Day + "&timezone=Europe%2FParis"
	var rows []map[string]json.RawMessage
	for _, p := range Pts {
		at := fmt.Sprintf("latitude=%v&longitude=%v", p[0], p[1])
		row := map[string]json.RawMessage{}
		for _, s := range []struct{ key, url string }{
			{"era5", "https://archive-api.open-meteo.com/v1/archive?" + at + "&hourly=temperature_2m,dew_point_2m,surface_pressure,wind_speed_10m&models=era5" + q},
			{"marine", "https://marine-api.open-meteo.com/v1/marine?" + at + "&hourly=sea_surface_temperature,wave_height" + q},
		} {
			tmp := dest + ".part-" + s.key
			os.Remove(tmp)
			if _, err := c.Get(ctx, s.url, tmp, ""); err != nil {
				return err
			}
			b, err := os.ReadFile(tmp)
			os.Remove(tmp)
			if err != nil {
				return err
			}
			var ans struct {
				Hourly json.RawMessage `json:"hourly"`
			}
			if err := json.Unmarshal(b, &ans); err != nil || ans.Hourly == nil {
				return fmt.Errorf("%s: no hourly block", s.url)
			}
			row[s.key] = ans.Hourly
		}
		rows = append(rows, row)
	}
	b, err := json.Marshal(rows)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}
	fmt.Fprintf(log, "  weather %s, %d points\n", Day, len(rows))
	return os.WriteFile(dest, b, 0o644)
}

// exported reads `export const name = {...};` from a generated preset.
func exported(root, file, name string, v any) error {
	b, err := os.ReadFile(filepath.Join(root, file))
	if err != nil {
		return err
	}
	for _, l := range strings.Split(string(b), "\n") {
		if p := "export const " + name + " = "; strings.HasPrefix(l, p) {
			return json.Unmarshal([]byte(strings.TrimSuffix(strings.TrimPrefix(l, p), ";")), v)
		}
	}
	return fmt.Errorf("%s: no %s", file, name)
}

type site struct {
	Eye   float64 `json:"eye"`
	Named map[string]struct {
		D    float64 `json:"d"`
		Roof float64 `json:"roof"`
	} `json:"named"`
}

type photo struct {
	S         float64 `json:"s"`
	HorizonSd float64 `json:"horizonSd"`
	Meas      map[string]struct {
		M float64 `json:"m"`
		C float64 `json:"c"`
	} `json:"meas"`
}

// HiddenAt is the height at d of the lowest ray from eye that has not met the
// sea before d (bisection on its initial slope; slopes from −0.05 to 0 rad).
func HiddenAt(g *refrac.Gradient, eye, d, cR, dx float64) float64 {
	lo, hi := -0.05, 0.0
	for range 50 {
		m := (lo + hi) / 2
		if _, ok := refrac.Ray(g, eye, m, cR, d, dx); ok {
			hi = m
		} else {
			lo = m
		}
	}
	z, _ := refrac.Ray(g, eye, hi, cR, d, dx)
	return z
}

// temps is the profile's temperature (°C, 0.01) at Zs and at the eye.
func temps(p *refrac.Profile, e float64) []float64 {
	var out []float64
	for _, z := range append(append([]float64{}, Zs...), e) {
		out = append(out, round(p.T(z), 2))
	}
	return out
}

// Result is the preset's content and a log.
type Result struct {
	Air    pyjson.Obj
	Traced []any
	Log    strings.Builder
}

func round(x float64, n int) float64 { p := math.Pow(10, float64(n)); return math.Round(x*p) / p }

// Compute reads the scene and the air and traces the rays.
func Compute(root string) (*Result, error) {
	var S site
	var P photo
	if err := exported(root, SitePre, "BORD_SITE", &S); err != nil {
		return nil, err
	}
	if err := exported(root, PhotoPre, "BORD_PHOTO", &P); err != nil {
		return nil, err
	}
	vrm, ok := S.Named["vrm"]
	mv, ok2 := P.Meas["vrm"]
	if !ok || !ok2 {
		return nil, fmt.Errorf("presets: no vrm (Villa Regina Margherita)")
	}
	b, err := os.ReadFile(filepath.Join(root, RawDir, "weather.json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch ref-bordighera)", err)
	}
	var rows []map[string]map[string]json.RawMessage
	if err := json.Unmarshal(b, &rows); err != nil {
		return nil, err
	}
	var bad error
	at := func(r map[string]map[string]json.RawMessage, src, k string) float64 {
		var v []*float64
		if err := json.Unmarshal(r[src][k], &v); err != nil || len(v) < Hour+2 || v[Hour] == nil || v[Hour+1] == nil {
			if bad == nil {
				bad = fmt.Errorf("weather.json: %s %s missing", src, k)
			}
			return 0
		}
		return *v[Hour] + (*v[Hour+1]-*v[Hour])*Frac
	}
	n := float64(len(rows))
	var sst, t2, td, u, pr, hs float64
	for _, r := range rows {
		sst += at(r, "marine", "sea_surface_temperature") / n
		hs += at(r, "marine", "wave_height") / n
		t2 += at(r, "era5", "temperature_2m") / n
		td += at(r, "era5", "dew_point_2m") / n
		u += at(r, "era5", "wind_speed_10m") / 3.6 / n
		pr += at(r, "era5", "surface_pressure") / n
	}
	if bad != nil {
		return nil, bad
	}
	e := S.Eye
	zs := refrac.ZGrid(e + 60)
	res := &Result{}
	grad := func(p *refrac.Profile) float64 { return (p.T(e) - p.T(0.5)) / (e - 0.5) }
	rowsOut := make([]pyjson.Obj, len(AirSea))
	var wg sync.WaitGroup
	sem := make(chan struct{}, 4)
	for i, dT := range AirSea {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			ta := sst + dT
			p := refrac.NewProfile(sst, ta, math.Min(td, ta-0.3), u, pr)
			g := refrac.NewGradient(p, pr, zs)
			rowsOut[i] = pyjson.Obj{{K: "dT", V: dT}, {K: "globe", V: round(HiddenAt(g, e, vrm.D, 1/R, Dx), 2)},
				{K: "flat", V: round(HiddenAt(g, e, vrm.D, 0, Dx), 2)}, {K: "L", V: round(p.L, 1)}, {K: "grad", V: round(grad(p), 5)},
				{K: "T", V: temps(p, e)}}
		}()
	}
	wg.Wait()
	for _, r := range rowsOut {
		res.Traced = append(res.Traced, r)
		fmt.Fprintf(&res.Log, "    %s\n", pyjson.Dumps(r, pyjson.Default))
	}
	p0 := refrac.NewProfile(sst, t2, td, u, pr)
	g0 := refrac.NewGradient(p0, pr, zs)
	hG, hF := HiddenAt(g0, e, vrm.D, 1/R, Dx), HiddenAt(g0, e, vrm.D, 0, Dx)
	H := vrm.Roof - mv.M
	res.Air = pyjson.Obj{
		{K: "time", V: "2026-03-28T17:34:00+01:00"}, {K: "sst", V: round(sst, 2)}, {K: "t2", V: round(t2, 2)}, {K: "td", V: round(td, 2)},
		{K: "u", V: round(u, 2)}, {K: "P", V: round(pr, 1)}, {K: "hs", V: round(hs, 2)}, {K: "airSea", V: round(t2-sst, 2)},
		{K: "grad", V: round(grad(p0), 5)}, {K: "L", V: round(p0.L, 1)}, {K: "T", V: temps(p0, e)}, {K: "zs", V: append(append([]float64{}, Zs...), e)},
		{K: "eye", V: e}, {K: "d", V: vrm.D}, {K: "roof", V: vrm.Roof}, {K: "seen", V: mv.M}, {K: "H", V: round(H, 2)}, {K: "Hsd", V: HSd},
		{K: "hiddenGlobe", V: round(hG, 2)}, {K: "hiddenFlat", V: round(hF, 2)},
	}
	fmt.Fprintf(&res.Log, "air: sea %.2f °C, 2 m %.2f °C (air - sea %+.2f K), wind %.1f m/s, L %.1f m, grad 0.5 m..eye %+.4f K/m; Villa Regina Margherita hidden: photo %.1f m, traced globe %.1f m, plane %.1f m\n",
		sst, t2, t2-sst, u, p0.L, grad(p0), H, hG, hF)
	return res, nil
}

var compact = pyjson.Opts{Item: ",", Key: ":", ASCII: true}

// File is the preset.
func (r *Result) File() preset.File {
	return preset.File{
		Out: Out, Command: "build ref-bordighera", Inputs: []string{Dir + "/inputs.lock", SitePre, PhotoPre},
		Notes: []string{
			"The air of the Bordighera photograph (28 March 2026, 17:34 CET; hh tab) and the rays traced through it, for the ref",
			"tab: ERA5 + Open-Meteo marine at three sea points, Monin-Obukhov surface layer, rays over a 6,371 km sphere (globe)",
			"and a plane. RB_TRACED: height hidden at Villa Regina Margherita (m) for each air - sea difference dT (K); grad =",
			"mean dT/dz between 0.5 m and the eye (K/m); T = temperature (°C) at RB_AIR.zs (m).",
		},
		Body: "export const RB_AIR = " + pyjson.Dumps(r.Air, compact) + ";\nexport const RB_TRACED = " + pyjson.Dumps(r.Traced, compact) + ";\n",
	}
}
