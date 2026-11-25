package tonga

import (
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/*.python.gz: what scripts/build_tonga_lamb.py wrote on
// 2026-10-14 from the cached raw files (identical to the committed files).
// numpy's arithmetic is reproduced by internal/npy; acos/sin/cos may flip a
// last digit of theta.
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "net_AK.json")); err != nil {
		t.Skip("raw files not on this machine (gitignored): fog fetch seis-tonga")
	}
	rows, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 102 {
		t.Errorf("%d stations, Python had 102", len(rows))
	}
	total := 0
	for _, f := range Files(rows) {
		b, err := f.Render(root)
		if err != nil {
			t.Fatal(err)
		}
		want, err := parity.ReadGolden("testdata/" + filepath.Base(f.Out) + ".python.gz")
		if err != nil {
			t.Fatal(err)
		}
		flips, err := parity.Compare(string(b), want)
		if err != nil {
			t.Fatalf("%s: %v", f.Out, err)
		}
		for _, fl := range flips {
			t.Logf("%s %s", f.Out, fl)
		}
		total += len(flips)
	}
	if total != pinnedFlips {
		t.Errorf("%d flips, pinned %d", total, pinnedFlips)
	}
}

func TestGrid(t *testing.T) {
	if len(Grid) != 4260 || Grid[0] != -4 || Grid[240] != Grid[240] {
		t.Fatalf("grid %d", len(Grid))
	}
}
