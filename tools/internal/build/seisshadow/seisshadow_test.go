package seisshadow

import (
	"math"
	"testing"

	"flatorglobe/tools/internal/build/seisradius"
)

func TestBest(t *testing.T) {
	n, r := best([]pt{{10, true}, {50, true}, {99, true}, {105, false}, {120, false}})
	if n != 5 || r != 102 {
		t.Fatalf("best = %d, %v", n, r)
	}
}

func TestAEKeepsDistanceFromCentre(t *testing.T) {
	x, y := AE(38, 142, -33, -71) // Tōhoku → Santiago: |map| = great-circle angle (152.8°)
	if d, g := math.Hypot(x, y), seisradius.GreatCircleDeg(38, 142, -33, -71); math.Abs(d-g) > 1e-9 {
		t.Fatalf("distance from centre %v, great circle %v", d, g)
	}
}
