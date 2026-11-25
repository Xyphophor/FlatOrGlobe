package flightdip

import (
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"flatorglobe/tools/internal/repo"
)

func TestFitRecoversRadius(t *testing.T) {
	hs := []float64{700, 900, 1800, 3400, 3800, 4800, 8650, 9800}
	var os []obs
	for _, h := range hs {
		os = append(os, obs{d: math.Acos(6371e3 / (6371e3 + h)), h: h, q: 1})
	}
	if r := fitR(os); math.Abs(r-6371e3) > 1 {
		t.Fatal(r)
	}
}

func TestHorizonOverFlatGroundIsTheTangent(t *testing.T) {
	prof := make([]float64, 2000) // 500 km of sea level, 250 m steps
	_, _, d := horizon(prof, 8000, 1)
	if want := math.Sqrt(2 * R * 8000); math.Abs(d-want) > Step {
		t.Fatalf("%v vs %v", d, want)
	}
}

func TestCompute(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "desmos.json")); err != nil {
		t.Skip("raw files not on this machine (fog fetch contrib-flightdip)")
	}
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	t.Log("\n" + r.Log.String())
}

func TestBouguerStraightIsTheTangent(t *testing.T) {
	if d, w := Bouguer(R, 9000, 0, 1), math.Acos(R/(R+9000)); math.Abs(d-w) > 1e-12 {
		t.Fatalf("%v vs %v", d, w)
	}
	// denser air below lifts the horizon: a smaller dip
	if Bouguer(R, 9000, 0, 1+150e-6) >= Bouguer(R, 9000, 0, 1) {
		t.Fatal("refraction should reduce the dip")
	}
}

func TestPressureAltitude(t *testing.T) {
	if p := PressureAltitude(0); math.Abs(p-1013.25) > 1e-9 {
		t.Fatal(p)
	}
	if p := PressureAltitude(36089); math.Abs(p-226.32) > 0.1 { // the tropopause of the standard atmosphere
		t.Fatal(p)
	}
}

func TestTiltSign(t *testing.T) {
	// flying north at 150 m/s, slowing by 0.2 m/s²: looking forward the reading is deeper, so the tilt is negative
	s := State{VN: 150, AN: -0.2, Crs: 0}
	if tl := s.Tilt(0, 0) * 180 / math.Pi; math.Abs(tl+0.2/G*180/math.Pi) > 1e-9 {
		t.Fatal(tl)
	}
	// looking straight out of the side, a change of speed does nothing
	if tl := s.Tilt(90, 0); math.Abs(tl) > 1e-12 {
		t.Fatal(tl)
	}
}

func TestParseTrackClock(t *testing.T) {
	page := `<tr class="smallrow1 flight_event"><td>Fri 08:18:08 AM Departure (ORD) @ Friday 07:18:08 AM CDT</td></tr>` +
		strings.Repeat(`<tr class="smallrow1"><td>Fri 08:18:24 AM</td><td>41.9687</td><td>-87.9403</td><td>&larr; 269&deg;</td><td>139</td><td>160</td><td>2,425</td><td>2,813</td><td>ADS-B</td></tr>`, 10)
	fx, err := ParseTrack([]byte(page), time.Date(2025, 9, 5, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatal(err)
	}
	if got := fx[0].T.Format("15:04:05"); got != "12:18:24" || fx[0].AltFt != 2425 || fx[0].Crs != 269 || fx[0].Kt != 139 {
		t.Fatalf("%s %+v", got, fx[0])
	}
}
