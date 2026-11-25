package aviaflights

import (
	"archive/tar"
	"compress/gzip"
	"io"
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/parity"
)

// untar unpacks testdata/flights-2026-09-28.tar.gz (routes.json,
// inputs.lock and the 115 raw files as Python read them, frozen
// 2026-11-07 before routes and windows were added) into a fresh root.
func untar(t *testing.T) string {
	t.Helper()
	f, err := os.Open("testdata/flights-2026-09-28.tar.gz")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	z, err := gzip.NewReader(f)
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	tr := tar.NewReader(z)
	for {
		h, err := tr.Next()
		if err == io.EOF {
			return root
		}
		if err != nil {
			t.Fatal(err)
		}
		p := filepath.Join(root, Dir, filepath.Clean(h.Name))
		if h.Typeflag == tar.TypeDir {
			os.MkdirAll(p, 0o755)
			continue
		}
		os.MkdirAll(filepath.Dir(p), 0o755)
		b, err := io.ReadAll(tr)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, b, 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// testdata/avia-flights.python.js.gz: what scripts/build_avia_flights.py
// wrote on 2026-10-14 from the cached raw files (identical to the preset
// then committed), replayed on those raw files (testdata/flights-2026-09-28.tar.gz). Statistics are exact (stats), no transcendental
// function: the body must be byte-identical.
func TestParityWithPython(t *testing.T) {
	root := untar(t)
	r, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Recs) != 55 || len(r.Airports) != 17 {
		t.Errorf("%d routes, %d airports; Python wrote 55 and 17", len(r.Recs), len(r.Airports))
	}
	if last := r.Lines[len(r.Lines)-1]; last != "JFK-LAX: 24 + 22 flights (dropped 0/1)" {
		t.Errorf("last report line %q; Python printed JFK-LAX: 24 + 22 flights (dropped 0/1)", last)
	}
	f, err := r.File()
	if err != nil {
		t.Fatal(err)
	}
	b, err := f.Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/avia-flights.python.js.gz")
	if err != nil {
		t.Fatal(err)
	}
	flips, err := parity.Compare(string(b), want)
	if err != nil {
		t.Fatal(err)
	}
	if len(flips) != 0 {
		t.Errorf("%d flips: %v", len(flips), flips)
	}
}

func TestWaypoints(t *testing.T) {
	got := Waypoints("DCT 3706S15803E 59S150W/N0474F370 7500N/13000W NOPE 5030N00500W")
	want := [][2]float64{{-37.1, 158.05}, {-59, -150}, {75, -130}, {50.5, -5}}
	if len(got) != len(want) {
		t.Fatalf("%v", got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("%d: %v, want %v", i, got[i], want[i])
		}
	}
	if len(Waypoints("")) != 0 {
		t.Error("empty route")
	}
}
