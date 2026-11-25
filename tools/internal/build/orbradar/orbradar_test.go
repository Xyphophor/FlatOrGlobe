package orbradar

import (
	"math"
	"os"
	"path/filepath"
	"testing"
)

// The 25 echoes of 1961, reduced with DE440, give today's astronomical unit to within 100 km (median), every echo within
// three printed errors, and a far smaller scatter than the 1962 reduction with Newcomb's orbits.
func TestReduce1961(t *testing.T) {
	root, _ := filepath.Abs("../../../..")
	if _, err := os.Stat(filepath.Join(root, DE440)); err != nil {
		t.Skip("DE440 absent (fog fetch moon-eclcraters)")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Bad) > 0 || len(r.Echoes) != 25 {
		t.Fatalf("%d echoes, checks: %v", len(r.Echoes), r.Bad)
	}
	errs := r.column(func(e Echo) float64 { return e.Err })
	_, _, med, rms := Stats(r.column(func(e Echo) float64 { return e.A }), errs)
	_, _, _, rmsN := Stats(r.column(func(e Echo) float64 { return e.AUNewcomb }), errs)
	if math.Abs(med-AUkm) > 100 || rms > 300 || rmsN < 3*rms {
		t.Fatalf("median %.0f, scatter %.0f, Newcomb scatter %.0f", med, rms, rmsN)
	}
	for _, e := range r.Echoes {
		if math.Abs(e.A-AUkm) > 3*e.Err {
			t.Errorf("%s: %.0f km", e.Date, e.A)
		}
		if math.Abs(e.StationKm) > aIntl {
			t.Errorf("%s: antenna offset %.0f km", e.Date, e.StationKm)
		}
	}
}

// The scale needs no orbit at all: d = cτ/2 at the shortest echo (10 April 1961) is 42.4 million km.
func TestShortestEcho(t *testing.T) {
	if d := C * 283.0845 / 2; math.Abs(d-42.433e6) > 1e3 {
		t.Fatalf("c τ/2 = %.0f km", d)
	}
}
