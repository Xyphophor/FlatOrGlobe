package lomond

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"

	"flatorglobe/tools/internal/refrac"
)

// Wx is the air of the photograph's instant at one point (or their mean):
// the reanalysis' surface (ERA5), the model's surface and column (GFS), the
// sea (marine).
type Wx struct {
	SST, Hs           float64 // °C, m
	T2, Td, U, P, Dir float64 // ERA5: °C, °C, m/s, hPa, degrees
	GT2, GTd, GU, GP  float64 // GFS: °C, °C, m/s, hPa
	Lev               []refrac.Level
}

// ZTop is the top of the surface layer (m): above it the column follows the
// model's levels.
var ZTop = 20.0

// weather reads weather.json at the photograph's instant (04:28 UTC: 28/60
// of the way from the 04 h to the 05 h values).
func weather(root string) ([]Wx, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, "weather.json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch contrib-lomond)", err)
	}
	var rows []map[string]map[string]json.RawMessage
	if err := json.Unmarshal(b, &rows); err != nil {
		return nil, err
	}
	hh, frac := When.Hour(), float64(When.Minute())/60
	var out []Wx
	for _, r := range rows {
		var bad error
		at := func(src, k string) float64 {
			var v []*float64
			if err := json.Unmarshal(r[src][k], &v); err != nil || len(v) < hh+2 || v[hh] == nil || v[hh+1] == nil {
				if bad == nil {
					bad = fmt.Errorf("weather.json: %s %s missing", src, k)
				}
				return math.NaN()
			}
			return *v[hh] + (*v[hh+1]-*v[hh])*frac
		}
		w := Wx{
			SST: at("marine", "sea_surface_temperature"), Hs: at("marine", "wave_height"),
			T2: at("era5", "temperature_2m"), Td: at("era5", "dew_point_2m"), U: at("era5", "wind_speed_10m") / 3.6,
			P: at("era5", "surface_pressure"), Dir: at("era5", "wind_direction_10m"),
			GT2: at("gfs", "temperature_2m"), GTd: at("gfs", "dew_point_2m"), GU: at("gfs", "wind_speed_10m") / 3.6,
			GP: at("gfs", "surface_pressure"),
		}
		for _, p := range Levels {
			w.Lev = append(w.Lev, refrac.Level{Z: at("gfs", fmt.Sprintf("geopotential_height_%dhPa", p)), T: at("gfs", fmt.Sprintf("temperature_%dhPa", p))})
		}
		if bad != nil {
			return nil, bad
		}
		out = append(out, w)
	}
	return out, nil
}

// meanWx averages the points (levels level by level).
func meanWx(ws []Wx) Wx {
	n := float64(len(ws))
	m := Wx{Lev: make([]refrac.Level, len(ws[0].Lev))}
	for _, w := range ws {
		m.SST += w.SST / n
		m.Hs += w.Hs / n
		m.T2 += w.T2 / n
		m.Td += w.Td / n
		m.U += w.U / n
		m.P += w.P / n
		m.Dir += w.Dir / n
		m.GT2 += w.GT2 / n
		m.GTd += w.GTd / n
		m.GU += w.GU / n
		m.GP += w.GP / n
		for i, l := range w.Lev {
			m.Lev[i].Z += l.Z / n
			m.Lev[i].T += l.T / n
		}
	}
	return m
}

// gfsColumn is the model's air throughout: its 2 m air, dew point and wind
// over the sea's temperature for the surface layer, its levels above.
func (w Wx) gfsColumn(shift float64) *refrac.Column {
	return &refrac.Column{S: refrac.NewProfile(w.SST, w.GT2, math.Min(w.GTd, w.GT2-0.3), w.GU, w.GP), ZTop: ZTop, Levels: w.Lev, Shift: shift}
}

// eraColumn is the reanalysis' surface layer under the model's levels moved
// by the difference of the two 2 m temperatures (the model's lapse rates,
// the reanalysis' surface).
func (w Wx) eraColumn() *refrac.Column {
	lev := make([]refrac.Level, len(w.Lev))
	for i, l := range w.Lev {
		lev[i] = refrac.Level{Z: l.Z, T: l.T + w.T2 - w.GT2}
	}
	return &refrac.Column{S: refrac.NewProfile(w.SST, w.T2, math.Min(w.Td, w.T2-0.3), w.U, w.P), ZTop: ZTop, Levels: lev}
}

// grad is the mean temperature gradient (K/m) from 2 m to the eye's height.
func grad(c *refrac.Column, e float64) float64 { return refrac.MeanGrad(c.T, 2, e) }
