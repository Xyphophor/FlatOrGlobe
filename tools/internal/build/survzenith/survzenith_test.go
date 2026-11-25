package survzenith

import (
	"math"
	"path/filepath"
	"testing"
)

// The repository's own transcription passes its checks, and every reciprocal sum is above 180°.
func TestTranscription(t *testing.T) {
	r, err := Compute(filepath.Join("..", "..", "..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Bad) > 0 {
		t.Fatalf("checks failed: %v", r.Bad)
	}
	if len(r.Pairs) < 90 {
		t.Fatalf("%d pairs", len(r.Pairs))
	}
	for _, p := range r.Pairs {
		if p.E <= 0 {
			t.Errorf("%s - %s: sum excess %v″", p.A, p.B, p.E)
		}
		if !math.IsNaN(p.SchottM) && math.Abs(p.K-2*p.SchottM) > 0.005 {
			t.Errorf("%s - %s: k %.4f against Schott's 2m %.4f", p.A, p.B, p.K, 2*p.SchottM)
		}
	}
}

func TestDMS(t *testing.T) {
	if v, _ := dms("90", "07", "58.3"); math.Abs(v-(90*3600+7*60+58.3)) > 1e-9 {
		t.Error(v)
	}
}
