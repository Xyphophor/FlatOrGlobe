package gravtides

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"testing"
	"time"

	"flatorglobe/tools/internal/tide"
)

// The speeds from Doodson numbers are Schureman's table 1.
func TestSpeed(t *testing.T) {
	want := map[string]float64{"M2": 28.9841042, "S2": 30.0, "N2": 28.4397295, "K1": 15.0410686, "O1": 13.9430356, "K2": 30.0821373}
	for n, w := range want {
		if s := Speed(tide.Pick(n)[0]); math.Abs(s-w) > 2e-6 {
			t.Errorf("%s: %.7f deg/h, want %.7f", n, s, w)
		}
	}
}

// Peak finds a line far finer than the grid step (to 1e-5 cpd, 0.3 s on M2: S2 leaks into it).
func TestPeak(t *testing.T) {
	var td, y []float64
	f0 := 1.9322736 // M2 in cpd
	for i := 0; i < 8760; i++ {
		x := float64(i) / 24
		td = append(td, x)
		y = append(y, 1.5*math.Cos(2*math.Pi*f0*x+0.3)+0.6*math.Cos(2*math.Pi*2*x))
	}
	f, a := Peak(td, y, 1.7, 2.2, 0.0002)
	if math.Abs(f-f0) > 1e-5 || math.Abs(a-1.5) > 0.01 {
		t.Errorf("peak %.7f cpd, %.4f m", f, a)
	}
}

// A synthetic gauge: the fit returns its constants, the range beats at 14.77 d.
func TestAnalyseSynthetic(t *testing.T) {
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, Dir, "raw"), 0o755)
	m := tide.Pick("M2", "S2")
	x := []float64{3, 1.2 * math.Cos(0.5), 1.2 * math.Sin(0.5), 0.5 * math.Cos(1.4), 0.5 * math.Sin(1.4)}
	f, _ := os.Create(filepath.Join(root, Dir, "raw", "s.csv"))
	for d := 0; d < 365; d++ {
		for h := 0; h < 24; h++ {
			ts := float64(1514764800 + (d*24+h)*3600)
			v := int(math.Round(m.At(x, ts) * 1000))
			tm := ts2date(ts)
			f.WriteString(tm + "," + itoa(h) + "," + itoa(v) + "\n")
		}
	}
	f.Close()
	g, err := Analyse(root, Station{Key: "s", Name: "S", File: "s.csv"})
	if err != nil {
		t.Fatal(err)
	}
	if h := g.C("M2").H; math.Abs(h-1.2) > 1e-3 {
		t.Errorf("M2 %.4f", h)
	}
	if r := g.C("S2").H / g.C("M2").H; math.Abs(r-0.5/1.2) > 1e-3 {
		t.Errorf("S2/M2 %.4f", r)
	}
	if math.Abs(g.PRange-14.765) > 0.1 {
		t.Errorf("spring-neap %.3f d", g.PRange)
	}
	if math.Abs(24/g.FSemi-12.4206) > 1e-3 {
		t.Errorf("semidiurnal line %.4f h", 24/g.FSemi)
	}
}

func itoa(i int) string { return fmt.Sprint(i) }

func ts2date(ts float64) string {
	t := time.Unix(int64(ts), 0).UTC()
	return fmt.Sprintf("%d,%d,%d", t.Year(), int(t.Month()), t.Day())
}
