package seisreloc

import (
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/seis-relocate.js.python.gz: what scripts/build_seis_relocate.py
// wrote on 2026-10-04 on the owner's machine (the committed preset).
// LAPACK's least squares (SVD) is replaced by Householder QR and glibc's
// sin/cos/atan2/pow by Go's: last-digit flips would be counted here; there
// are none (2026-10-14: byte-identical, ~7 min on the owner's machine). Any
// larger difference (another grid cell, another exclusion) fails.
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	if testing.Short() {
		t.Skip("long (relocates nine earthquakes and scans ~250 flat maps)")
	}
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root, func(s string) { t.Log(s) })
	if err != nil {
		t.Fatal(err)
	}
	b, err := r.File().Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/seis-relocate.js.python.gz")
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
		t.Errorf("%d last-digit flips, pinned %d", len(flips), pinnedFlips)
	}
}
