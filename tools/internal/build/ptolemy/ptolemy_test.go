package ptolemy

import (
	"math"
	"testing"

	"flatorglobe/tools/internal/repo"
)

func TestCatalogue(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if s := r.Summary(); s != "6372 places, 56 towns; lonP = 17.21 + 1.403 lon" {
		t.Errorf("summary %q", s)
	}
	// Alexandria, Ptolemy's reference meridian (Geography VIII): 60 1/2°, 31°
	for _, w := range r.Towns {
		if w.Name == "Alexandreia" && (w.LonP != 60.5 || w.LatP != 31) {
			t.Errorf("Alexandria %v %v", w.LonP, w.LatP)
		}
	}
	// the stretch is Eratosthenes' 252,000 stadia over Ptolemy's 180,000, within the scatter
	if math.Abs(r.B-1.4) > 0.05 {
		t.Errorf("slope %v", r.B)
	}
}

func TestTwelfths(t *testing.T) {
	for s, want := range map[string]int{"37.33333": 448, "61.3333333333333": 736, "-15": -180, "30.67777777": 368} {
		if got, _ := twelfths(s); got != want {
			t.Errorf("%s: %d", s, got)
		}
	}
}
