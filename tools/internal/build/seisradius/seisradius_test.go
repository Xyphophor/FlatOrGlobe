package seisradius

import (
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/*.python.gz: what scripts/build_seis_radius.py wrote on
// 2026-09-19 (the committed state). The land polygons it downloaded that
// day were not kept; raw/ne_50m_land.geojson was downloaded on 2026-10-14
// from the same URL. sin, cos, acos, asin and atan2 differ in the last ulp
// between glibc (CPython) and Go: pinnedFlips counts the last-digit
// differences this leaves, and the test fails on any other difference.
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if last := r.Log[len(r.Log)-1]; last != "total 479 rows" {
		t.Errorf("%s; Python had 479", last)
	}
	total := 0
	for _, f := range r.Files() {
		b, err := f.Render(root)
		if err != nil {
			t.Fatal(err)
		}
		name := map[string]string{Out: "seis-radius.js", OutJSON: "lr_arrivals.json", OutCSV: "lr_arrivals.csv"}[f.Out]
		want, err := parity.ReadGolden("testdata/" + name + ".python.gz")
		if err != nil {
			t.Fatal(err)
		}
		flips, err := parity.Compare(string(b), want)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		for _, fl := range flips {
			t.Logf("%s %s", name, fl)
		}
		total += len(flips)
	}
	if total != pinnedFlips {
		t.Errorf("%d last-digit flips, pinned %d", total, pinnedFlips)
	}
}

func TestGreatCircle(t *testing.T) {
	if d := GreatCircleDeg(0, 0, 0, 90); d != 90 {
		t.Errorf("quarter of the equator: %v", d)
	}
	if d := GreatCircleDeg(90, 0, -90, 0); d != 180 {
		t.Errorf("pole to pole: %v", d)
	}
	if d := GreatCircleDeg(10, 20, 10, 20); d != 0 {
		t.Errorf("same point: %v", d)
	}
}

func TestOceanFractionOnASquareIsland(t *testing.T) {
	li := &LandIndex{buckets: map[[2]int][]int{}}
	li.add([][][2]float64{{{-5, -5}, {5, -5}, {5, 5}, {-5, 5}, {-5, -5}}})
	for idx, p := range li.polys {
		for gx := floorDiv(p.x0); gx <= floorDiv(p.x1); gx++ {
			for gy := floorDiv(p.y0); gy <= floorDiv(p.y1); gy++ {
				li.buckets[[2]int{gx, gy}] = append(li.buckets[[2]int{gx, gy}], idx)
			}
		}
	}
	if !li.IsLand(0, 0) || li.IsLand(6, 0) || li.IsLand(0, -6) {
		t.Fatal("point in polygon")
	}
	// along the equator from -20 to +20: 40 degrees, 80 steps, island = 10 degrees
	of := li.OceanFraction(0, -20, 0, 20, 40)
	if of < 0.70 || of > 0.76 {
		t.Errorf("ocean fraction %v, about 3/4 expected", of)
	}
}
