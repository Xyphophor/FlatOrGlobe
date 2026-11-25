package seiswaves

import (
	"math"
	"testing"
)

func TestBearings(t *testing.T) {
	// due north along a meridian, on the globe and on a flat map centred on the target
	if b := GlobeBearing(0, 10, 40, 10); math.Abs(b) > 1e-9 {
		t.Errorf("globe bearing %v, want 0", b)
	}
	if b := FlatBearing([2]float64{40, 10}, 0, 10, 40, 10); math.Abs(circDiff(b, 0)) > 0.05 {
		t.Errorf("flat bearing %v, want 0", b)
	}
	// on the North Pole map, a station at the equator sees the pole due north, and a point on the same
	// latitude 90° east along the straight chord: 45° east of north
	if b := FlatBearing([2]float64{90, 0}, 0, 0, 0, 90); math.Abs(circDiff(b, 45)) > 0.05 {
		t.Errorf("flat chord bearing %v, want 45", b)
	}
	// while the great circle along the equator heads due east
	if b := GlobeBearing(0, 0, 0, 90); math.Abs(b-90) > 1e-9 {
		t.Errorf("globe bearing %v, want 90", b)
	}
}

func TestPAzimuth(t *testing.T) {
	// a P wave from the south-west (baz 225°): the ground moves up and towards the north-east
	n, e, z := make([]float64, 200), make([]float64, 200), make([]float64, 200)
	for i := range z {
		a := math.Sin(float64(i) / 5)
		z[i], n[i], e[i] = a, 0.3*a*math.Cos(45*d2r), 0.3*a*math.Sin(45*d2r)
	}
	if b, l, _ := pAzimuth(n, e, z, 0, 200); math.Abs(circDiff(b, 225)) > 1e-6 || l < 0.999 {
		t.Errorf("baz %v L %v, want 225, 1", b, l)
	}
}

func TestSteimSignExtension(t *testing.T) {
	if sext(0x3f, 6) != -1 || sext(0x1f, 6) != 31 || sext(0x200, 10) != -512 {
		t.Error("sext")
	}
	if rate(20, 1) != 20 || rate(-10, 1) != 0.1 {
		t.Error("rate")
	}
}
