package orbtransit

import (
	"math"
	"os"
	"path/filepath"
	"testing"
)

// 1761, 1769 and all three transits together give the unit within 3 % and within two bootstrap errors of today's; the
// transcription checks pass.
func TestTransit1769(t *testing.T) {
	root, _ := filepath.Abs("../../../..")
	if _, err := os.Stat(filepath.Join(root, DE440)); err != nil {
		t.Skip("DE440 absent (fog fetch moon-eclcraters)")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Bad) > 0 {
		t.Fatalf("checks: %v", r.Bad)
	}
	for _, k := range []string{"1761", "1769", "all"} {
		f := r.Fits[k]
		if math.Abs(f.A/AUkm-1) > 0.03 || math.Abs(f.A-AUkm) > 2*f.SA {
			t.Errorf("%s: A %.0f ± %.0f", k, f.A, f.SA)
		}
	}
	if r.Fits["1769"].N != 278 {
		t.Fatalf("1769: %d rows", r.Fits["1769"].N)
	}
}

// Newcomb's astronomical day starts at noon: 1769 June 3, 12h UT is JD 2367328.0; the sidereal time one sidereal day later
// is the same angle (a negative angle before 2000 is fine: only its sine and cosine are used).
func TestEpoch(t *testing.T) {
	if jd1769 != 2367328.0 {
		t.Fatal("epoch")
	}
	a, b := gmst(jd1769), gmst(jd1769+0.99726957)
	if math.Abs(math.Sin(a)-math.Sin(b)) > 1e-4 || math.Abs(math.Cos(a)-math.Cos(b)) > 1e-4 {
		t.Fatalf("gmst %v %v", a, b)
	}
}
