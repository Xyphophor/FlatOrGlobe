package seisbulk

import (
	"math"
	"math/rand"
	"testing"

	"flatorglobe/tools/internal/build/seisreloc"
)

func TestBoxIsTheTabsCtStats(t *testing.T) {
	// ctStats([1..9, 40]): quartiles by linear interpolation, whiskers at 1.5 IQR
	s := box([]float64{40, 1, 2, 3, 4, 5, 6, 7, 8, 9})
	if s.Q1 != 3.25 || s.Med != 5.5 || s.Q3 != 7.75 || s.Lo != 1 || s.Hi != 9 || s.Out != 1 {
		t.Fatalf("%+v", s)
	}
}

func TestPlainKeepsTheISFColumns(t *testing.T) {
	in := `<a href=/cgi-bin/stations_iscb?stacode=IR:AFI>AFI</a>    14.80  69.7 P        01:47:23.274 -10.0`
	if got := string(Plain([]byte(in))); got[:3] != "AFI" || got[19:20] != "P" || got[28:40] != "01:47:23.274" {
		t.Fatalf("%q", got)
	}
}

func TestCommonCurveRecoversOneLaw(t *testing.T) {
	// five quakes on the globe, one true shape, their own origin times and centres; 1 s of noise
	shape := []float64{800, -200, 20}
	rng := rand.New(rand.NewSource(1))
	var qs []*Quake
	for k := 0; k < 5; k++ {
		c := [2]float64{-40 + 20*float64(k), -150 + 70*float64(k)}
		q := &Quake{G: &seisreloc.Fit{Centre: [2]float64{c[0] + 0.3, c[1] - 0.3}}}
		c0 := 100 + 10*float64(k)
		for i := 0; i < 300; i++ {
			la, lo := rng.Float64()*160-80, rng.Float64()*360-180
			d := seisreloc.GC(c[0], c[1], la, lo)
			if d < 25 || d > 95 {
				continue
			}
			q.P = append(q.P, seisreloc.Pick{Lat: la, Lon: lo, T: c0 + shapeAt(shape, d) + rng.NormFloat64()})
		}
		q.G.Keep = make([]bool, len(q.P))
		for i := range q.G.Keep {
			q.G.Keep[i] = true
		}
		qs = append(qs, q)
	}
	p := common(qs, true, [2]float64{90, 0}, func(q *Quake) ([2]float64, []bool) { return q.G.Centre, q.G.Keep })
	if p.RMS < 0.8 || p.RMS > 1.2 {
		t.Fatalf("rms %.3f, want ~1", p.RMS)
	}
	for _, d := range []float64{30, 60, 90} {
		if e := math.Abs(shapeAt(p.Shape, d) - shapeAt(p.Shape, 30) - (shapeAt(shape, d) - shapeAt(shape, 30))); e > 1 {
			t.Errorf("shape at %g°: off by %.2f s", d, e)
		}
	}
}
