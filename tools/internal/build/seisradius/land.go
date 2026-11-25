package seisradius

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"os"

	"flatorglobe/tools/internal/pymath"
)

// LandIndex is the script's even-odd point-in-polygon test over the Natural
// Earth polygons, with 10-degree buckets of polygon bounding boxes.
type LandIndex struct {
	polys   []poly
	buckets map[[2]int][]int
}

type poly struct {
	x0, y0, x1, y1 float64
	rings          [][][2]float64
}

const grid = 10.0

// LoadLand reads a GeoJSON FeatureCollection of Polygon / MultiPolygon.
func LoadLand(path string) (*LandIndex, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var fc struct {
		Features []struct {
			Geometry struct {
				Type        string          `json:"type"`
				Coordinates json.RawMessage `json:"coordinates"`
			} `json:"geometry"`
		} `json:"features"`
	}
	if err := json.NewDecoder(bytes.NewReader(b)).Decode(&fc); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	li := &LandIndex{buckets: map[[2]int][]int{}}
	for _, f := range fc.Features {
		switch f.Geometry.Type {
		case "Polygon":
			var c [][][2]float64
			if err := json.Unmarshal(f.Geometry.Coordinates, &c); err != nil {
				return nil, err
			}
			li.add(c)
		case "MultiPolygon":
			var c [][][][2]float64
			if err := json.Unmarshal(f.Geometry.Coordinates, &c); err != nil {
				return nil, err
			}
			for _, p := range c {
				li.add(p)
			}
		}
	}
	if len(li.polys) == 0 {
		return nil, fmt.Errorf("%s: no polygon", path)
	}
	for idx, p := range li.polys {
		for gx := floorDiv(p.x0); gx <= floorDiv(p.x1); gx++ {
			for gy := floorDiv(p.y0); gy <= floorDiv(p.y1); gy++ {
				k := [2]int{gx, gy}
				li.buckets[k] = append(li.buckets[k], idx)
			}
		}
	}
	return li, nil
}

func floorDiv(v float64) int { return int(math.Floor(v / grid)) }

func (li *LandIndex) add(rings [][][2]float64) {
	p := poly{x0: math.Inf(1), y0: math.Inf(1), x1: math.Inf(-1), y1: math.Inf(-1), rings: rings}
	for _, r := range rings {
		for _, pt := range r {
			p.x0, p.x1 = math.Min(p.x0, pt[0]), math.Max(p.x1, pt[0])
			p.y0, p.y1 = math.Min(p.y0, pt[1]), math.Max(p.y1, pt[1])
		}
	}
	li.polys = append(li.polys, p)
}

func ringCrossings(x, y float64, ring [][2]float64) int {
	cnt := 0
	n := len(ring)
	for i := 0; i < n; i++ {
		x1, y1 := ring[i][0], ring[i][1]
		x2, y2 := ring[(i+1)%n][0], ring[(i+1)%n][1]
		if (y1 > y) != (y2 > y) {
			if x1+float64((y-y1)*(x2-x1))/(y2-y1) > x {
				cnt++
			}
		}
	}
	return cnt
}

// IsLand reports whether (lon, lat) lies in a land polygon.
func (li *LandIndex) IsLand(lon, lat float64) bool {
	for _, idx := range li.buckets[[2]int{floorDiv(lon), floorDiv(lat)}] {
		p := li.polys[idx]
		if !(p.x0 <= lon && lon <= p.x1 && p.y0 <= lat && lat <= p.y1) {
			continue
		}
		s := 0
		for _, r := range p.rings {
			s += ringCrossings(lon, lat, r)
		}
		if s%2 == 1 {
			return true
		}
	}
	return false
}

// slerp samples n+1 points of the great circle, as (lat, lon) degrees.
func slerp(lat1, lon1, lat2, lon2 float64, n int) [][2]float64 {
	p1, l1 := pymath.Radians(lat1), pymath.Radians(lon1)
	p2, l2 := pymath.Radians(lat2), pymath.Radians(lon2)
	A := [3]float64{float64(math.Cos(p1) * math.Cos(l1)), float64(math.Cos(p1) * math.Sin(l1)), math.Sin(p1)}
	B := [3]float64{float64(math.Cos(p2) * math.Cos(l2)), float64(math.Cos(p2) * math.Sin(l2)), math.Sin(p2)}
	dot := float64(float64(A[0]*B[0])+float64(A[1]*B[1])) + float64(A[2]*B[2])
	dot = math.Max(-1, math.Min(1, dot))
	omega := math.Acos(dot)
	pts := make([][2]float64, 0, n+1)
	for i := 0; i <= n; i++ {
		f := float64(i) / float64(n)
		v := A
		if !(omega < 1e-9) {
			so := math.Sin(omega)
			sa := math.Sin(float64((1-f)*omega)) / so
			sb := math.Sin(float64(f*omega)) / so
			for k := 0; k < 3; k++ {
				v[k] = float64(A[k]*sa) + float64(B[k]*sb)
			}
		}
		pts = append(pts, [2]float64{pymath.Degrees(math.Asin(math.Max(-1, math.Min(1, v[2])))), pymath.Degrees(math.Atan2(v[1], v[0]))})
	}
	return pts
}

// OceanFraction: share of the path's sample points that are not land.
func (li *LandIndex) OceanFraction(lat1, lon1, lat2, lon2, distDeg float64) float64 {
	n := max(20, min(240, pymath.RoundInt(distDeg*2)))
	pts := slerp(lat1, lon1, lat2, lon2, n)
	hits := 0
	for _, p := range pts {
		if li.IsLand(p[1], p[0]) {
			hits++
		}
	}
	return 1 - float64(hits)/float64(len(pts))
}
