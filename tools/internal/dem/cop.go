package dem

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
)

// CopName is the Copernicus GLO-30 tile of the 1°×1° cell with south-west
// corner (lat0, lon0).
func CopName(lat0, lon0 int) string { return copName(lat0, lon0, 10) }

// CopName90 is the GLO-90 tile (3 arc-second cells) of the same cell.
func CopName90(lat0, lon0 int) string { return copName(lat0, lon0, 30) }

// CopURL90 is where a GLO-90 tile is published (open bucket, no account).
func CopURL90(lat0, lon0 int) string {
	n := CopName90(lat0, lon0)
	return "https://copernicus-dem-90m.s3.amazonaws.com/" + n + "/" + n + ".tif"
}

func copName(lat0, lon0, arc int) string {
	ns := fmt.Sprintf("N%02d", lat0)
	if lat0 < 0 {
		ns = fmt.Sprintf("S%02d", -lat0)
	}
	ew := fmt.Sprintf("E%03d", lon0)
	if lon0 < 0 {
		ew = fmt.Sprintf("W%03d", -lon0)
	}
	return fmt.Sprintf("Copernicus_DSM_COG_%d_%s_00_%s_00_DEM", arc, ns, ew)
}

// CopURL is where a tile is published (open bucket, no account).
func CopURL(lat0, lon0 int) string {
	n := CopName(lat0, lon0)
	return "https://copernicus-dem-30m.s3.amazonaws.com/" + n + "/" + n + ".tif"
}

// Cop reads Copernicus tiles from a directory: <name>.tif, or an empty
// <name>.tif.none marker for a cell without a tile (open sea: height 0).
// Decoded tiles stay in memory.
type Cop struct {
	Dir   string
	GLO90 bool // GLO-90 tiles (CopName90) instead of GLO-30
	tiles map[[2]int]*Raster
}

func (c *Cop) tile(a, b int) (*Raster, error) {
	if c.tiles == nil {
		c.tiles = map[[2]int]*Raster{}
	}
	k := [2]int{a, b}
	if r, ok := c.tiles[k]; ok {
		return r, nil
	}
	name := CopName(a, b)
	if c.GLO90 {
		name = CopName90(a, b)
	}
	p := filepath.Join(c.Dir, name+".tif")
	var r *Raster
	if data, err := os.ReadFile(p); err == nil {
		if r, err = DecodeTIFF(data); err != nil {
			return nil, fmt.Errorf("%s: %w", filepath.Base(p), err)
		}
	} else if _, err2 := os.Stat(p + ".none"); err2 != nil {
		return nil, fmt.Errorf("%s: no tile and no .none marker (fog fetch)", filepath.Base(p))
	}
	c.tiles[k] = r
	return r, nil
}

// Grid is cop_dem.grid: bilinear height (m) at WGS84 points, pixel
// centres, 0 where there is no tile; NaN where the tile has no data.
// The arithmetic is numpy's (float32 values promoted, products rounded
// before each sum).
func (c *Cop) Grid(lat, lon []float64) ([]float64, error) {
	out := make([]float64, len(lat))
	for i := range lat {
		a, b := int(math.Floor(lat[i])), int(math.Floor(lon[i]))
		v, err := c.tile(a, b)
		if err != nil {
			return nil, err
		}
		if v == nil {
			out[i] = 0
			continue
		}
		H, W := v.H, v.W
		r := float64((float64(a+1)-lat[i])*float64(H)) - 0.5
		cc := float64((lon[i]-float64(b))*float64(W)) - 0.5
		r0 := min(max(int(math.Floor(r)), 0), H-2)
		c0 := min(max(int(math.Floor(cc)), 0), W-2)
		fr := math.Min(math.Max(r-float64(r0), 0), 1)
		fc := math.Min(math.Max(cc-float64(c0), 0), 1)
		v00, v10 := float64(v.At(r0, c0)), float64(v.At(r0+1, c0))
		v01, v11 := float64(v.At(r0, c0+1)), float64(v.At(r0+1, c0+1))
		t1 := float64(float64(v00*(1-fr)) * (1 - fc))
		t2 := float64(float64(v10*fr) * (1 - fc))
		t3 := float64(float64(v01*(1-fr)) * fc)
		t4 := float64(float64(v11*fr) * fc)
		out[i] = ((t1 + t2) + t3) + t4
	}
	return out, nil
}
