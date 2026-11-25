package spk

import (
	"math"
	"os"
	"path/filepath"
	"testing"
)

func TestCheb(t *testing.T) {
	// T0 + 2 T1 + 3 T2 at x = 0.5: 1 + 1 + 3(2·0.25 − 1) = 0.5
	if v := cheb([]float64{1, 2, 3}, 0.5); math.Abs(v-0.5) > 1e-12 {
		t.Fatalf("cheb = %v", v)
	}
}

// With DE440 on disk (fog fetch moon-eclcraters): the Earth-Sun distance at J2000 (0.98333 AU, two days before
// perihelion) and the Moon's distance then (402,449 km).
func TestDE440(t *testing.T) {
	p := filepath.Join("..", "..", "..", "data", "moon", "eclcraters", "raw", "de440.bsp")
	if _, err := os.Stat(p); err != nil {
		t.Skip("de440.bsp not on disk")
	}
	f, err := Open(p)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	e, _ := f.Bary(Earth, 0)
	m, _ := f.Bary(Moon, 0)
	s, err := f.Bary(Sun, 0)
	if err != nil {
		t.Fatal(err)
	}
	d := func(a, b [3]float64) float64 { return math.Hypot(math.Hypot(a[0]-b[0], a[1]-b[1]), a[2]-b[2]) }
	if au := d(e, s) / 149597870.7; math.Abs(au-0.98333) > 2e-5 {
		t.Errorf("Earth-Sun %v AU", au)
	}
	if km := d(e, m); math.Abs(km-402449) > 5 {
		t.Errorf("Earth-Moon %v km", km)
	}
}
