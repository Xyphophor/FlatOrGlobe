package romer

import (
	"math"
	"testing"
)

func TestDeltaT(t *testing.T) {
	// Espenak & Meeus, table of section 2.6: 1700 8.8 s, 1800 13.7 s, 1900 −2.8 s, 1950 29.1 s
	for _, c := range [][2]float64{{1700, 8.83}, {1800, 13.72}, {1900, -2.79}, {1950, 29.07}} {
		if got := DeltaT(c[0]); math.Abs(got-c[1]) > 0.01 {
			t.Errorf("ΔT(%v) = %v, want %v", c[0], got, c[1])
		}
	}
}

func TestKeplerThird(t *testing.T) {
	if math.Abs(AJup-5.2028) > 0.001 {
		t.Errorf("a_J = %v", AJup)
	}
	// opposition of 2000 Nov 28: Earth and Jupiter on the same side of the Sun, about 4.0 AU apart
	k := keplerOrbits{}
	e, j := k.earth(2451877.0), k.jupiter(2451877.0)
	if d := j.sub(e).norm(); math.Abs(d-4.03) > 0.05 {
		t.Errorf("Earth-Jupiter at the 2000 opposition %v AU", d)
	}
}

func TestHalfArc(t *testing.T) {
	if h0, h3 := halfArc(0, 9.6), halfArc(3*d2r, 9.6); math.Abs(h0-9.6) > 1e-9 || h3 >= h0 || h3 < 8.5 {
		t.Errorf("half-arc %v %v", h0, h3)
	}
}

// TestRecover fits made-up timings computed with a known light time and must find it back.
func TestRecover(t *testing.T) {
	const As = 480.0
	k := keplerOrbits{}
	var obs []*Obs
	t0 := 2378497.0 // 1800
	for i := 0; i < 2600; i++ {
		jd := t0 + float64(i)*360.0/nIo*5.3 // one eclipse in ~5
		ev, sgn := byte('D'), 1.0
		if i%2 == 1 {
			ev, sgn = 'R', -1
		}
		for it := 0; it < 3; it++ {
			g := geometry(k, jd, As)
			h := sgn * halfArc(g.dec, halfA0)
			// Io's longitude at t_e equals the shadow's edge: λ₀ + n (t_e − t0) = ℓ − h
			ph := 17 + nIo*(g.te-t0) - (g.lon - h)
			ph -= 360 * math.Round(ph/360)
			jd -= ph / nIo
		}
		g := geometry(k, jd, As)
		if g.elon < 25 { // lost in the Sun's glare
			continue
		}
		obs = append(obs, &Obs{Year: 1800 + int((jd-t0)/365.25), JD: jd, Sigma: 30, Mode: 'P', Sat: 1, Event: ev, Site: "XXAA"})
	}
	f, err := run(k, obs, Options{Free12: true, Y0: 1800, Y1: 1830})
	if err != nil {
		t.Fatal(err)
	}
	if math.Abs(f.As-As) > 0.5 || f.Rms > 1 {
		t.Errorf("recovered %v s (rms %v), want %v", f.As, f.Rms, As)
	}
}

func TestParse(t *testing.T) {
	obs, err := Parse("../../../../" + Raw)
	if err != nil {
		t.Skip(err)
	}
	if len(obs) != 16802 {
		t.Errorf("%d records", len(obs))
	}
	n := 0
	for _, o := range obs {
		if o.Sat == 1 {
			n++
		}
	}
	if n != 8822 {
		t.Errorf("%d of Io", n)
	}
}
