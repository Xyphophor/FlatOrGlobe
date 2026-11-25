package orbpulsar

import (
	"math"
	"os"
	"path/filepath"
	"testing"
)

// Ecliptic and equatorial conversions are inverse to each other (same obliquity).
func TestEclEqu(t *testing.T) {
	for _, c := range [][2]float64{{0.3, 0.2}, {4.6, -0.4}, {2.1, 1.1}} {
		lam, beta := ecl(c[0], c[1])
		ra, dec := equ(lam, beta, obliq)
		if math.Abs(ra-c[0]) > 1e-12 || math.Abs(dec-c[1]) > 1e-12 {
			t.Fatalf("%v -> %v %v", c, ra, dec)
		}
	}
}

// Every timing model (EPTA DR2 and NANOGrav 15 yr) common with MSPSRπ gives the unit within 3σ (or 2 km) of DE440's.
func TestEightPulsars(t *testing.T) {
	root, _ := filepath.Abs("../../../..")
	if _, err := os.Stat(filepath.Join(root, Zip)); err != nil {
		t.Skip("EPTA DR2 absent (fog fetch orb-pulsar)")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Pulsars) < 8 {
		t.Fatalf("%d pulsars", len(r.Pulsars))
	}
	for _, p := range r.Pulsars {
		if math.Abs(p.A-AUkm) > math.Max(2, 3*p.SA) {
			t.Errorf("%s: %.1f km", p.Name, p.A)
		}
	}
}
