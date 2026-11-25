package eclcrater

import (
	"math"
	"testing"
)

func TestDeltaT(t *testing.T) {
	for _, c := range []struct{ y, want, tol float64 }{{1900, -2.79, 0.01}, {1950, 29.07, 0.01}, {2000, 63.86, 0.01}, {1860, 7.62, 0.1}} {
		if v := deltaT(c.y); math.Abs(v-c.want) > c.tol {
			t.Errorf("ΔT(%v) = %v, want %v", c.y, v, c.want)
		}
	}
}

func TestPoleAndMoon(t *testing.T) {
	if p := poleOfDate(j2000JD); math.Abs(p[2]-1) > 1e-12 {
		t.Errorf("pole at J2000 = %v", p)
	}
	// a century later the pole has moved by ~0.56° (precession: 2004″ per century in θ)
	if p := poleOfDate(j2000JD + 36525); math.Abs(math.Acos(p[2])/d2r-2004.3109/3600) > 0.001 {
		t.Errorf("pole moved by %v°", math.Acos(p[2])/d2r)
	}
	// the Moon's pole (body z) points to α ≈ 270°, δ ≈ 66.5° at J2000
	z := moonToICRF(j2000JD).mul(v3{0, 0, 1})
	if dec := math.Asin(z[2]) / d2r; math.Abs(dec-66.54-1.54) > 0.5 && math.Abs(dec-66.54) > 2 {
		t.Errorf("Moon pole declination %v", dec)
	}
}

func TestFold(t *testing.T) {
	if alias("Prom. Laplace") != "promontorium laplace" || fold("Mösting  A") != "mosting a" {
		t.Error(alias("Prom. Laplace"), fold("Mösting  A"))
	}
}

// fitFlat recovers a known flattening.
func TestFitFlat(t *testing.T) {
	var b, r []float64
	for k := -90.0; k <= 90; k += 5 {
		b = append(b, k*d2r)
		r = append(r, 1.001*(1-0.003*math.Pow(math.Sin(k*d2r), 2)))
	}
	if e, _, _ := fitFlat(b, r); math.Abs(e-0.003) > 1e-9 {
		t.Errorf("E = %v", e)
	}
}
