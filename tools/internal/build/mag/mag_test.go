package mag

import (
	"errors"
	"io/fs"
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/pymath"
	"flatorglobe/tools/internal/repo"
)

// testdata/*.python.gz: the three files scripts/build_mag_obs.py wrote on
// 2026-09-28 (the committed state). The observatory list it read that day
// from the WDC form was not kept; raw/annual_means.html is the form as
// fetched on 2026-10-14. That this reproduces the 2026-09-28 output byte
// for byte (counts included: KLI listed but never fetched = the
// "fetch_failed" of that run, HON fetched earlier but no longer listed)
// is the evidence that the list had not changed between the two dates.
func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root)
	if errors.Is(err, fs.ErrNotExist) { // a raw file that the public repository does not carry (its .explain says why)
		t.Skip(err)
	}
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range r.Files() {
		b, err := f.Render(root)
		if err != nil {
			t.Fatal(err)
		}
		name := map[string]string{OutObs: "mag-obs.js", OutIGRF: "igrf14.js", OutCSV: "measurements.csv"}[f.Out]
		want, err := parity.ReadGolden("testdata/" + name + ".python.gz")
		if err != nil {
			t.Fatal(err)
		}
		flips, err := parity.Compare(string(b), want)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if len(flips) != 0 {
			t.Errorf("%s: %d flips: %v", name, len(flips), flips)
		}
	}
}

func TestDM(t *testing.T) {
	for _, c := range []struct {
		d, m string
		want float64
	}{{"21", "19", 21 + pymath.Div(19, 60)}, {"0", "-58.4", -pymath.Div(58.4, 60)}, {"-12", "30", -12.5}, {"201", "56", 201 + pymath.Div(56, 60)}} {
		if got, err := dm(c.d, c.m); err != nil || got != c.want {
			t.Errorf("dm(%s, %s) = %v %v", c.d, c.m, got, err)
		}
	}
	if _, err := dm("x", "1"); err == nil {
		t.Error("bad degrees accepted")
	}
}

func TestOnePerSite(t *testing.T) {
	a, b := [2]float64{1, 2}, [2]float64{3, 4}
	rows := []Row{{Code: "A1", Year: fl(2000), site: &a}, {Code: "B", Year: fl(1999), site: &b}, {Code: "A2", Year: fl(2010), site: &a}}
	got := onePerSite(rows, 0.3)
	// sorted by year: B(1999) then A1(2000) -> A's slot is second, filled by A2
	if len(got) != 2 || got[0].Code != "B" || got[1].Code != "A2" {
		t.Errorf("site merge: %+v", got)
	}
	obs := []Row{{Code: "SFS", Lat: fl(36.46), Lon: fl(-6.2), Year: fl(2010)}, {Code: "X", Lat: fl(50), Lon: fl(10), Year: fl(2012)},
		{Code: "SFS3", Lat: fl(36.5), Lon: fl(-6.21), Year: fl(2020)}}
	got = onePerSite(obs, 0.3)
	if len(got) != 2 || got[0].Code != "X" || got[1].Code != "SFS3" {
		t.Errorf("radius merge: %+v", got)
	}
}
