package gpsraw

import (
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/gps-raw.js.python.gz: the preset scripts/build_gps_raw.py wrote
// on 2026-10-02 (rerun on 2026-10-14 from the same cache: identical values
// for these 34 stations). LAPACK's lstsq is replaced by QR, glibc's libm by
// Go's: last-digit flips would be counted; there are none (byte-identical).
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	if testing.Short() {
		t.Skip("long (34 stations, ~290 fixes each)")
	}
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "BRDC.rnx.gz")); err != nil {
		t.Skip("raw files not on this machine (gitignored): fog fetch gps-raw")
	}
	if _, err := os.Stat(filepath.Join(root, Crx2rnx)); err != nil {
		t.Skip("crx2rnx not built: make crx2rnx")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	b, err := r.File().Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/gps-raw.js.python.gz")
	if err != nil {
		t.Fatal(err)
	}
	flips, err := parity.Compare(string(b), want)
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range flips {
		t.Log(f)
	}
	if len(flips) != pinnedFlips {
		t.Errorf("%d flips, pinned %d", len(flips), pinnedFlips)
	}
}
