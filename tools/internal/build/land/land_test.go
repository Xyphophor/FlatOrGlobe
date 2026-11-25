package land

import (
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/land.js.python.gz: what scripts/build_land.py wrote (identical
// to the committed preset on 2026-10-14). Comparisons only: byte-identical.
func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if s := r.Summary(); s != "127 polygons, land fraction 0.332 (Earth: ~0.29)" {
		t.Errorf("summary %q", s)
	}
	b, err := r.File().Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/land.js.python.gz")
	if err != nil {
		t.Fatal(err)
	}
	if flips, err := parity.Compare(string(b), want); err != nil || len(flips) != 0 {
		t.Fatalf("%v %v", flips, err)
	}
}

func TestPackbits(t *testing.T) {
	r := &Result{Mask: []bool{true, false, false, false, false, false, false, true, true}}
	// numpy.packbits([1,0,0,0,0,0,0,1,1]) = [0x81, 0x80]
	if got := r.B64(); got != "gYA=" {
		t.Errorf("%s", got)
	}
}
