package satdop

import (
	"fmt"
	"math"
	"strings"
	"testing"
)

// A tiny RINEX 3 text: one GPS satellite, phases at 0, 30, 60 s (L1C, L2W), an event record in between.
func rinexSample(slip bool) string {
	h := "     3.04           OBSERVATION DATA    M                   RINEX VERSION / TYPE\n" +
		"G    3 L1C L2W S1C                                          SYS / # / OBS TYPES\n" +
		"                                                            END OF HEADER\n"
	line := func(l1, l2 float64, lli string) string {
		return "G05" + fmt.Sprintf("%14.3f", l1) + lli + " " + fmt.Sprintf("%14.3f", l2) + "  " + fmt.Sprintf("%14.3f", 45.0) + "  \n"
	}
	// range grows by 300 m/s: L1 by 300/λ1 cycles per s, L2 by 300/λ2
	l1 := func(t float64) float64 { return 1e8 + 300*t*1575.42e6/C }
	l2 := func(t float64) float64 { return 8e7 + 300*t*1227.60e6/C }
	b := h
	b += "> 2025 04 10 00 00  0.0000000  0  1\n" + line(l1(0), l2(0), " ")
	b += ">                              4  1\nCOMMENT LINE                                                COMMENT\n"
	mid := " "
	if slip {
		mid = "1"
	}
	b += "> 2025 04 10 00 00 30.0000000  0  1\n" + line(l1(30), l2(30), mid)
	b += "> 2025 04 10 00 01  0.0000000  0  1\n" + line(l1(60), l2(60), " ")
	return b
}

func TestReadDopplerIonoFree(t *testing.T) {
	obs, err := ReadDoppler(strings.NewReader(rinexSample(false)), 30)
	if err != nil {
		t.Fatal(err)
	}
	if len(obs) != 1 || obs[0].Sat != "G05" || obs[0].T != 30 {
		t.Fatalf("got %+v", obs)
	}
	if math.Abs(obs[0].Rate-300) > 1e-3 {
		t.Fatalf("rate %v, want 300 m/s", obs[0].Rate)
	}
	obs, _ = ReadDoppler(strings.NewReader(rinexSample(true)), 30)
	if len(obs) != 0 {
		t.Fatalf("a loss of lock at the middle epoch must drop the point, got %+v", obs)
	}
}

func TestPropagateKeepsEnergy(t *testing.T) {
	ThirdBody = false
	defer func() { ThirdBody = true }()
	gm := 3.986004418e14
	r := 26560e3
	x0 := [6]float64{r, 0, 0, 0, math.Sqrt(gm/r) * 0.8, math.Sqrt(gm/r) * 0.6}
	tr := propagate(x0, Tep, gm, 0)
	en := func(s [6]float64) float64 {
		return (s[3]*s[3]+s[4]*s[4]+s[5]*s[5])/2 - gm/math.Sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2])
	}
	e0 := en(tr[int(Tep/H)])
	for _, k := range []int{0, len(tr) - 1} {
		if d := math.Abs(en(tr[k])/e0 - 1); d > 1e-9 {
			t.Fatalf("energy drift %g at %d", d, k)
		}
	}
	// one revolution of a circular orbit: back to the start
	x1 := [6]float64{r, 0, 0, 0, math.Sqrt(gm / r), 0}
	T := 2 * math.Pi * math.Sqrt(r*r*r/gm)
	tr = propagate(x1, 0, gm, 0)
	k := int(math.Round(T / H))
	p, _ := tr.at(T, gm, 0)
	_ = k
	if d := math.Hypot(p[0]-r, p[1]); d > 5 {
		t.Fatalf("after one period, %.1f m from the start", d)
	}
}

func TestEllipseAndPlane(t *testing.T) {
	var r, lat []float64
	var pts [][3]float64
	for _, la := range []float64{-80, -50, -20, 0, 10, 40, 70} {
		x := math.Pow(math.Sin(la*math.Pi/180), 2)
		r = append(r, 6378e3*(1-x/298))
		lat = append(lat, la)
		pts = append(pts, [3]float64{math.Cos(la) * 1e6, math.Sin(la) * 1e6, 5e5})
	}
	a, f, rms := Ellipse(r, lat)
	if math.Abs(a-6378e3) > 1e-3 || math.Abs(1/f-298) > 1e-6 || rms > 1e-6 {
		t.Fatalf("ellipse %v %v %v", a, 1/f, rms)
	}
	n, d, prms := FitPlane(pts)
	if math.Abs(math.Abs(n[2])-1) > 1e-9 || math.Abs(math.Abs(d)-5e5) > 1e-3 || prms > 1e-6 {
		t.Fatalf("plane %v %v %v", n, d, prms)
	}
}

func TestLooOutliers(t *testing.T) {
	v := []float64{1, 1.1, 0.9, 1.05, 0.95, 1.02, 5}
	o := looOutliers(v, 3)
	if len(o) != 1 || o[0] != 6 {
		t.Fatalf("got %v", o)
	}
}

func TestCholSolveInverse(t *testing.T) {
	N := []float64{4e10, 2e5, 2e5, 9}
	A, d, ok := chol(N, 2, 0)
	if !ok {
		t.Fatal("chol")
	}
	x := cholSolve(A, d, []float64{1, 0}, 2)
	det := 4e10*9 - 2e5*2e5
	if math.Abs(x[0]/(9/det)-1) > 1e-9 {
		t.Fatalf("(N⁻¹)₀₀ = %g, want %g", x[0], 9/det)
	}
}
