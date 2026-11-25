// Package dipatmos builds src/data/presets/dip-atmos.js (dip tab,
// 2026-09-29): the air at both ends of the ray that grazes the sea in the
// owner's Caussols photo (13 June 2026, 15:23:05 CEST), from four Open-Meteo
// answers kept in data/dip/atmos/raw/ (ERA5 at the eye and at the grazing
// point, the sea-surface temperature, AROME at 900/850 hPa over the sea).
// Port of scripts/fetch_dip_atmos.py (epic24/UC03), which queried the API
// at every run and kept nothing; the answers are now locked inputs.
//
// The dip depends almost only on the air's index at eye height and where
// the ray grazes the sea (Young, Dip of the Horizon). Linear interpolation
// between 15:00 and 16:00 local time.
package dipatmos

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Dir  = "data/dip/atmos"
	Out  = "src/data/presets/dip-atmos.js"
	EyeH = 1210.0 // m, Caussols
)

// Frac is 23 min 5 s past 15:00, as the script computed it.
var Frac = pymath.Div(23, 60) + pymath.Div(5, 3600)

type answer struct {
	Latitude  json.Number          `json:"latitude"`
	Longitude json.Number          `json:"longitude"`
	Hourly    map[string][]float64 `json:"hourly"`
}

func load(root, name string) (*answer, error) {
	b, err := os.ReadFile(filepath.Join(root, Dir, "raw", name+".json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch dip-atmos)", err)
	}
	var a struct {
		answer
		Hourly map[string]json.RawMessage `json:"hourly"`
	}
	if err := json.Unmarshal(b, &a); err != nil {
		return nil, fmt.Errorf("%s.json: %w", name, err)
	}
	out := &answer{Latitude: a.Latitude, Longitude: a.Longitude, Hourly: map[string][]float64{}}
	for k, v := range a.Hourly {
		if k == "time" {
			continue
		}
		var xs []float64
		if err := json.Unmarshal(v, &xs); err != nil {
			return nil, fmt.Errorf("%s.json: hourly.%s: %w", name, k, err)
		}
		out.Hourly[k] = xs
	}
	return out, nil
}

// at interpolates between the 15:00 and 16:00 values.
func (a *answer) at(key string) (float64, error) {
	v := a.Hourly[key]
	if len(v) < 17 {
		return 0, fmt.Errorf("hourly.%s: %d values, 24 expected", key, len(v))
	}
	return v[15] + float64((v[16]-v[15])*Frac), nil
}

// Compute reads the four answers.
func Compute(root string) (pyjson.Obj, error) {
	var as [4]*answer
	for i, n := range []string{"eye", "sea", "marine", "arome"} {
		a, err := load(root, n)
		if err != nil {
			return nil, err
		}
		as[i] = a
	}
	e, s, m, ar := as[0], as[1], as[2], as[3]
	var firstErr error
	at := func(a *answer, k string) float64 {
		v, err := a.at(k)
		if err != nil && firstErr == nil {
			firstErr = err
		}
		return v
	}
	z9, z8 := at(ar, "geopotential_height_900hPa"), at(ar, "geopotential_height_850hPa")
	t9, t8 := at(ar, "temperature_900hPa"), at(ar, "temperature_850hPa")
	u := (EyeH - z9) / (z8 - z9)
	site := func(a *answer) pyjson.Obj {
		return pyjson.Obj{{K: "lat", V: a.Latitude}, {K: "lon", V: a.Longitude},
			{K: "T", V: pyjson.Round(at(a, "temperature_2m"), 2)}, {K: "P", V: pyjson.Round(at(a, "surface_pressure"), 2)},
			{K: "RH", V: pyjson.Round(at(a, "relative_humidity_2m"), 1)}, {K: "src", V: "ERA5 2 m"}}
	}
	out := pyjson.Obj{
		{K: "time", V: "2026-06-13T15:23:05+02:00"},
		{K: "eye", V: site(e)},
		{K: "sea", V: site(s)},
		{K: "sst", V: pyjson.Round(at(m, "sea_surface_temperature"), 2)},
		{K: "freeAir", V: pyjson.Obj{
			{K: "T", V: pyjson.Round(t9+float64((t8-t9)*u), 2)},
			{K: "P", V: pyjson.Round(900*math.Exp(math.Log(pymath.Div(850, 900))*u), 2)},
			{K: "src", V: "AROME 900/850 hPa over the sea"}}},
	}
	return out, firstErr
}

// File renders the preset (same body as the script).
func File(out pyjson.Obj) preset.File {
	return preset.File{
		Out: Out, Command: "build dip-atmos", Inputs: []string{Dir + "/inputs.lock"},
		Notes: []string{
			"The air at both ends of the ray that grazes the sea in the owner's Caussols photo (13 June 2026, 15:23:05):",
			"T in °C, P in hPa. Sources: ERA5 reanalysis and Météo-France AROME via Open-Meteo.",
		},
		Body: "export const DIP_ATMOS = " + pyjson.Dumps(out, pyjson.Default) + ";\n",
	}
}
