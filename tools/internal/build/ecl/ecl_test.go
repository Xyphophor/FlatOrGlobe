package ecl

import (
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/repo"
)

// testdata/ecl.python.js.gz: what scripts/build_ecl_data.py wrote on
// 2026-10-14 (identical to the preset then committed). Pure parsing, no
// transcendental function: the body must be byte-identical.
func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	// the script printed: 2009 103 pts, 2027 103 pts, 2045 102 pts, saros 136 : 71 membres
	if got := r.Summary(); got != "2009 103 pts, 2027 103 pts, 2045 102 pts, saros 136: 71 members" {
		t.Errorf("summary %q", got)
	}
	b, err := r.File().Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/ecl.python.js.gz")
	if err != nil {
		t.Fatal(err)
	}
	flips, err := parity.Compare(string(b), want)
	if err != nil {
		t.Fatal(err)
	}
	if len(flips) != 0 {
		t.Errorf("%d flips: %v", len(flips), flips)
	}
}

func TestHelpers(t *testing.T) {
	if v := dm("35", "44.6", "N"); v != 35.74333 {
		t.Errorf("dm N = %v", v)
	}
	if v := dm("33", "11.0", "W"); v != -33.18333 {
		t.Errorf("dm W = %v", v)
	}
	if v := dur("6m22.6s"); v != 382.6 {
		t.Errorf("dur = %v", v)
	}
	if v := dur("-"); v != nil {
		t.Errorf("dur(-) = %v", v)
	}
	if s := pyjson.Dumps(dur("0m05s"), pyjson.Compact); s != "5.0" {
		t.Errorf("dur 0m05s -> %s", s)
	}
	if err := checkText("x", "a b"); err == nil {
		t.Error("no-break space accepted")
	}
	if err := checkText("x", "a٣"); err == nil {
		t.Error("Arabic-Indic digit accepted")
	}
}
