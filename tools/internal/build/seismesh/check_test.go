package seismesh

import (
	"fmt"
	"testing"
)

func TestAlignSanity(t *testing.T) {
	loc := [][2]float64{{10, 20}, {-30, 100}, {50, -80}, {0, 0}, {-60, 170}, {20, -150}}
	X := make([][]float64, len(loc))
	for i, l := range loc {
		u := unit(l[0], l[1])
		X[i] = []float64{3 * u[1], -3 * u[2], 3 * u[0]} // a rotation (cyclic) of the true points, scaled
	}
	e, m := AlignError(X, loc)
	fmt.Println("rotated copy:", e, m)
	for i, l := range loc {
		u := unit(l[0], l[1])
		X[i] = []float64{3 * u[1], 3 * u[2], 3 * u[0]} // odd permutation = mirror
	}
	e, m = AlignError(X, loc)
	fmt.Println("mirrored copy:", e, m)
}
