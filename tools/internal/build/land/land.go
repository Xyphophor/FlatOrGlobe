// Package land builds src/data/land.js, the 0.5-degree land/sea mask every
// flat map fills its land with (epic18/UC01), from the Natural Earth 1:110m
// land polygons (public domain) in data/land/raw/. Port of
// scripts/build_land.py (epic24/UC03). Decorative only: no number on the
// site depends on it.
//
// One cell = 1 bit (1 = land), rows north to south (centres 89.75 ...
// -89.75), columns west to east (-179.75 ... 179.75), bytes in base64.
// Scanline fill, even-odd rule per polygon (inner rings are holes), union
// of the polygons.
package land

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"flatorglobe/tools/internal/preset"
)

const (
	Dir   = "data/land"
	Input = Dir + "/raw/ne_110m_land.geojson"
	Out   = "src/data/land.js"
	Step  = 0.5
	NLat  = 360
	NLon  = 720
)

// Result of a build.
type Result struct {
	Mask  []bool // NLat*NLon, row-major, north first
	Polys int
}

// Compute rasterises the polygons.
func Compute(root string) (*Result, error) {
	b, err := os.ReadFile(filepath.Join(root, Input))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch land)", err)
	}
	var fc struct {
		Features []struct {
			Geometry struct {
				Type        string          `json:"type"`
				Coordinates json.RawMessage `json:"coordinates"`
			} `json:"geometry"`
		} `json:"features"`
	}
	if err := json.Unmarshal(b, &fc); err != nil {
		return nil, fmt.Errorf("%s: %w", Input, err)
	}
	var polys [][][][2]float64
	for _, f := range fc.Features {
		if f.Geometry.Type == "Polygon" {
			var p [][][2]float64
			if err := json.Unmarshal(f.Geometry.Coordinates, &p); err != nil {
				return nil, err
			}
			polys = append(polys, p)
		} else { // the script treats anything else as a MultiPolygon
			var mp [][][][2]float64
			if err := json.Unmarshal(f.Geometry.Coordinates, &mp); err != nil {
				return nil, fmt.Errorf("%s: geometry %s: %w", Input, f.Geometry.Type, err)
			}
			polys = append(polys, mp...)
		}
	}
	lats := make([]float64, NLat)
	lons := make([]float64, NLon)
	for i := range lats {
		lats[i] = (90 - Step/2) - Step*float64(i)
	}
	for j := range lons {
		lons[j] = (-180 + Step/2) + Step*float64(j)
	}
	mask := make([]bool, NLat*NLon)
	inside := make([]bool, NLat*NLon)
	var xs []float64
	for _, poly := range polys {
		clear(inside)
		for _, ring := range poly {
			for i, la := range lats {
				xs = xs[:0]
				for k := 0; k+1 < len(ring); k++ {
					x0, y0, x1, y1 := ring[k][0], ring[k][1], ring[k+1][0], ring[k+1][1]
					if (y0 > la) != (y1 > la) {
						xs = append(xs, x0+float64((la-y0)*(x1-x0))/(y1-y0))
					}
				}
				if len(xs) == 0 {
					continue
				}
				sort.Float64s(xs)
				// even-odd: a cell is inside when an odd number of edges cross its row to its left
				row := inside[i*NLon : (i+1)*NLon]
				for j, lo := range lons {
					if sort.SearchFloat64s(xs, lo)%2 == 1 {
						row[j] = !row[j]
					}
				}
			}
		}
		for k, v := range inside {
			mask[k] = mask[k] || v
		}
	}
	return &Result{Mask: mask, Polys: len(polys)}, nil
}

// B64 packs the mask MSB first (numpy.packbits) and encodes it.
func (r *Result) B64() string {
	bits := make([]byte, (len(r.Mask)+7)/8)
	for k, v := range r.Mask {
		if v {
			bits[k/8] |= 0x80 >> (k % 8)
		}
	}
	return base64.StdEncoding.EncodeToString(bits)
}

// Fraction of land cells.
func (r *Result) Fraction() float64 {
	n := 0
	for _, v := range r.Mask {
		if v {
			n++
		}
	}
	return float64(n) / float64(len(r.Mask))
}

// File renders the preset (same body as build_land.py).
func (r *Result) File() preset.File {
	return preset.File{
		Out: Out, Command: "build land", Inputs: []string{Input},
		Notes: []string{
			"Natural Earth 1:110m land (public domain), rasterised on a 0.5° grid: 1 bit per cell (1 = land),",
			"rows north to south (cell centres 89.75 ... -89.75), columns west to east (-179.75 ... 179.75), base64.",
			"Decorative only: maps use it to fill the land, no number on the site depends on it.",
		},
		Body: fmt.Sprintf("export const LAND = { step: %v, nlat: %d, nlon: %d, b64: %q };\n", Step, NLat, NLon, r.B64()),
	}
}

// Summary is the script's report line.
func (r *Result) Summary() string {
	return fmt.Sprintf("%d polygons, land fraction %.3f (Earth: ~0.29)", r.Polys, r.Fraction())
}
