package gravticon

import (
	"math"
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/build/gravtides"
)

func root() string { return filepath.Join("..", "..", "..", "..") }

func TestQuantAndThin(t *testing.T) {
	if q := quant([]float64{1, 2, 3, 4, 5}, 0.5); q != 3 {
		t.Errorf("median %g", q)
	}
	gs := []*Gauge{{Lat: 48.1, Lon: -4.1, Type: "Coastal", NObs: 10}, {Lat: 48.9, Lon: -4.9, Type: "Coastal", NObs: 20}, {Lat: 48.5, Lon: -4.5, Type: "River", NObs: 99}}
	if th := Thin(gs); len(th) != 1 || th[0].NObs != 20 {
		t.Errorf("thin %+v", th)
	}
}

// With the shift, TICON's constants agree with our own analysis of the same
// gauges (fog build grav-tides, one year): the phase convention is the only
// difference. Skipped when the raw files are absent.
func TestSameConventionAsGravTides(t *testing.T) {
	r := root()
	if _, err := os.Stat(filepath.Join(r, Zip)); err != nil {
		t.Skip("no TICON zip (fog fetch grav-ticon)")
	}
	if _, err := os.Stat(filepath.Join(r, gravtides.Dir, "raw", "h822a.csv")); err != nil {
		t.Skip("no UHSLC files (fog fetch grav-tides)")
	}
	gs, _, err := Read(filepath.Join(r, Zip))
	if err != nil {
		t.Fatal(err)
	}
	for _, st := range gravtides.Stations {
		g0, err := gravtides.Analyse(r, st)
		if err != nil {
			t.Fatal(err)
		}
		var best *Gauge
		bd := math.Inf(1)
		for _, g := range gs {
			if d := math.Hypot(g.Lat-st.Lat, g.Lon-st.Lon); d < bd {
				best, bd = g, d
			}
		}
		if bd > 0.1 {
			t.Fatalf("%s: nearest TICON gauge %.2f deg away", st.Name, bd)
		}
		for _, n := range Names {
			c := g0.C(n)
			if c.H*100 < 1.5 {
				continue
			}
			dg := math.Mod(c.G-best.G[n]+540, 360) - 180
			if math.Abs(dg) > 15 || math.Abs(c.H*100-best.H[n]) > 0.15*c.H*100+0.3 {
				t.Errorf("%s %s: ours %.1f cm %.0f deg, TICON %.1f cm %.0f deg", st.Name, n, c.H*100, c.G, best.H[n], best.G[n])
			}
		}
	}
}
