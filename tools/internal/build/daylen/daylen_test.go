package daylen

import (
	"math"
	"testing"
	"time"
)

func TestGlobeDay(t *testing.T) {
	eq, _ := time.Parse("2006-01-02", "2019-03-20")
	// at the equinox the day on the equator is twelve hours plus the few minutes of the Sun's radius and refraction
	if d := globeDay(0, 0, eq); math.Abs(d-727) > 4 {
		t.Errorf("equator at the equinox: %v min", d)
	}
	jun, _ := time.Parse("2006-01-02", "2019-06-21")
	if d := globeDay(79, 12, jun); d != 1440 {
		t.Errorf("Ny-Ålesund in June: %v min", d)
	}
	if d := globeDay(-69, 40, jun); d != 0 {
		t.Errorf("Syowa in June: %v min", d)
	}
}

func TestFlatDay(t *testing.T) {
	eq, _ := time.Parse("2006-01-02", "2019-03-20")
	// a spotlight reaching beyond every station lights the whole disc all day
	if d := flatDay(-60, 0, eq, 40000); d != 1440 {
		t.Errorf("all-reaching spotlight: %v", d)
	}
	// at the equinox, stations at 60° N and 60° S are not lit the same time by any finite spotlight but the trivial ones
	n, s := flatDay(60, 0, eq, 9000), flatDay(-60, 0, eq, 9000)
	if n <= s {
		t.Errorf("north %v min, south %v min: the south should be lit less", n, s)
	}
}
