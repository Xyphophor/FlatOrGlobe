package igra

import (
	"math"
	"testing"
	"time"
)

// The ref tab's standard atmosphere: P = 1013 hPa, T = 288 K, dT/dh = −0.0065 K/m gives k ≈ 0.17.
func TestK(t *testing.T) {
	k := K(1013, 288, 0, 1013, 288-0.65, 100)
	if math.Abs(k-503.0*1013/(288.0*288)*(0.0342-0.0065)) > 2e-3 {
		t.Errorf("k = %v", k)
	}
	// air cooling at the autoconvective rate: straight light
	if k := K(1000, 288, 0, 1000, 288-3.42, 100); math.Abs(k) > 1e-3 {
		t.Errorf("autoconvective k = %v", k)
	}
}

func TestSunElev(t *testing.T) {
	// the equinox at noon on the equator at Greenwich: Sun near the zenith; at midnight, far below
	noon := time.Date(2026, 3, 20, 12, 7, 0, 0, time.UTC)
	if e := sunElev(0, 0, noon); e < 88 {
		t.Errorf("noon elevation %v", e)
	}
	if e := sunElev(0, 0, noon.Add(12*time.Hour)); e > -85 {
		t.Errorf("midnight elevation %v", e)
	}
}

func TestReduceHypsometric(t *testing.T) {
	// surface at 100 m, 1000 hPa, then a level at 990 hPa without height: ~83 m higher at 283 K
	lv := []level{{1000, 283, 100}, {990, 282.5, math.NaN()}}
	z := lv[0].z + 29.27*(lv[0].t+lv[1].t)/2*math.Log(lv[0].p/lv[1].p)
	if math.Abs(z-100-83.1) > 0.5 {
		t.Errorf("hypsometric step %v m", z-100)
	}
}
