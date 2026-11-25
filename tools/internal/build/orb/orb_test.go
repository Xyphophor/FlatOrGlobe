package orb

import (
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// testdata/*.python.gz: what scripts/build_orb.py wrote from the cached raw
// files (identical to the committed presets, 2026-10-14).
func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, SunTGZ)); err != nil {
		t.Skip("raw files not on this machine (gitignored): fog fetch orb")
	}
	files, summary, err := Files(root)
	if err != nil {
		t.Fatal(err)
	}
	if summary != "sun days 462 10562; tau Ceti nights 561; sdo 53" {
		t.Errorf("summary %q", summary)
	}
	for _, f := range files {
		b, err := f.Render(root)
		if err != nil {
			t.Fatal(err)
		}
		want, err := parity.ReadGolden("testdata/" + filepath.Base(f.Out) + ".python.gz")
		if err != nil {
			t.Fatal(err)
		}
		if flips, err := parity.Compare(string(b), want); err != nil || len(flips) != 0 {
			t.Fatalf("%s: %v %v", f.Out, flips, err)
		}
	}
}
