package aviamesh

import (
	"math"
	"math/rand"
	"testing"
)

// Synthetic airports on a sphere of radius 7 (hours of flight), times = 0.5 h + arc: the growth on the sphere must
// find R and fit the times; the plane must not.
func TestGrowSynthetic(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	n := 14
	P := make([][]float64, n)
	for i := range P {
		v := []float64{rng.NormFloat64(), rng.NormFloat64(), rng.NormFloat64()}
		l := math.Sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
		P[i] = []float64{v[0] / l, v[1] / l, v[2] / l}
	}
	var E []Edge
	for a := 0; a < n; a++ {
		for b := a + 1; b < n; b++ {
			if rng.Float64() < 0.5 {
				E = append(E, Edge{a, b, 0.5 + 7*angle(P[a], P[b])})
			}
		}
	}
	s := grow(E, n, true)
	if math.Abs(s.R-7) > 0.05 || s.Stress > 1 {
		t.Fatalf("sphere: R %.3f, stress %.2f min", s.R, s.Stress)
	}
	p := grow(E, n, false)
	if p.Stress < 10 {
		t.Fatalf("plane fits a sphere's times: %.2f min", p.Stress)
	}
	t.Logf("sphere R %.3f stress %.2f min; plane %.1f min", s.R, s.Stress, p.Stress)
}
