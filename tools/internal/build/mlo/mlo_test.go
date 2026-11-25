package mlo

import (
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/*.python.gz: what scripts/build_mlo_sunset.py (with
// build_mlo_horizon.py) wrote on 2026-10-14 from the cached NOAA files
// and Copernicus tiles (identical to the committed presets). sin, cos,
// asin, atan2 and tan come from Go, not glibc: last-digit flips counted.
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "mlo16001.dat")); err != nil {
		t.Skip("raw files not on this machine (gitignored): fog fetch dip-mlo")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	t.Log(r.Log)
	if len(r.Evenings) != 331 || r.Featured.Date != "2016-08-17" || r.Az0 != 284.9 {
		t.Errorf("%d evenings, featured %s, az %v; Python: 331, 2016-08-17, 284.9", len(r.Evenings), r.Featured.Date, r.Az0)
	}
	total := 0
	for _, f := range r.Files() {
		b, err := f.Render(root)
		if err != nil {
			t.Fatal(err)
		}
		want, err := parity.ReadGolden("testdata/" + filepath.Base(f.Out) + ".python.gz")
		if err != nil {
			t.Fatal(err)
		}
		flips, err := parity.Compare(string(b), want)
		if err != nil {
			t.Fatalf("%s: %v", f.Out, err)
		}
		for _, fl := range flips {
			t.Log(f.Out, fl)
		}
		total += len(flips)
	}
	if total != pinnedFlips {
		t.Errorf("%d flips, pinned %d", total, pinnedFlips)
	}
}
