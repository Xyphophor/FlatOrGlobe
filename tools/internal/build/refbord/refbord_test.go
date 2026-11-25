package refbord

import (
	"math"
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/refrac"
	"flatorglobe/tools/internal/repo"
)

// linearAir: uniform dN/dz, rays of uniform curvature: the hidden height must be the textbook one.
type linearAir struct{ k float64 }

func (a linearAir) N(P0, z float64) float64 { return 280 - a.k/R*1e6*z }

func TestHiddenAtMatchesFormula(t *testing.T) {
	e, d := 38.6, 49073.0
	for _, k := range []float64{0, 0.13} {
		g := refrac.NewGradient(linearAir{k}, 1013, refrac.ZGrid(e+60))
		Rp := R / (1 - k)
		want := math.Pow(d-math.Sqrt(2*Rp*e), 2) / (2 * Rp)
		if got := HiddenAt(g, e, d, 1/R, Dx); math.Abs(got-want) > 0.3 {
			t.Errorf("k %v: %.2f, want %.2f", k, got, want)
		}
		if got := HiddenAt(g, e, d, 0, Dx); k == 0 && got > 0.05 {
			t.Errorf("plane, straight light: %.2f hidden", got)
		}
	}
}

func TestCompute(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "weather.json")); err != nil {
		t.Skip("raw files not on this machine (fog fetch ref-bordighera)")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	t.Log("\n" + r.Log.String())
}
