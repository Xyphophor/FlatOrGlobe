package dipatmos

import (
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/dip-atmos.js.python.gz: the preset the script wrote on
// 2026-09-29 from live API answers. The answers fetched again on
// 2026-10-14 (data/dip/atmos/raw/) give the same values (checked with the
// script's own code before the port); exp and log may flip a last digit.
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	out, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	b, err := File(out).Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/dip-atmos.js.python.gz")
	if err != nil {
		t.Fatal(err)
	}
	flips, err := parity.Compare(string(b), want)
	if err != nil {
		t.Fatal(err)
	}
	if len(flips) != pinnedFlips {
		t.Errorf("%d flips: %v", len(flips), flips)
	}
}
