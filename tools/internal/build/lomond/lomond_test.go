package lomond

import (
	"math"
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/refrac"
	"flatorglobe/tools/internal/repo"
)

// linearAir has dN/dz uniform: rays of uniform curvature, so the traced f
// must be the formula's.
type linearAir struct{ k float64 }

func (a linearAir) N(P0, z float64) float64 { return 280 - a.k/R*1e6*z }

func TestTracedMatchesUniformFormula(t *testing.T) {
	e, H, d := 345.0, 107.0, 39900.0
	for _, k := range []float64{0, 0.13, 0.17, -0.5} {
		for _, flat := range []bool{false, true} {
			c := 1 - k
			if flat {
				c = -k
			}
			f, _, _, _ := traced(linearAir{k}, 1013, e, H, d, flat)
			want := fUniform(c, e, H, d)
			if math.Abs(f-want) > 2e-3 {
				t.Errorf("k %v flat %v: traced %.4f, formula %.4f", k, flat, f, want)
			}
		}
	}
}

func TestKFromGradRoundTrip(t *testing.T) {
	if g := refrac.GradFromK(refrac.KFromGrad(-0.0065, 1013, 288), 1013, 288); math.Abs(g+0.0065) > 1e-12 {
		t.Fatal(g)
	}
}

func TestCompute(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "weather.json")); err != nil {
		t.Skip("raw files not on this machine (fog fetch contrib-lomond)")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	t.Log("\n" + r.Log.String())
}
