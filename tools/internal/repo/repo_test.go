package repo

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFind(t *testing.T) {
	root := t.TempDir()
	deep := filepath.Join(root, "a", "b")
	if err := os.MkdirAll(filepath.Join(root, "tools"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(deep, 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := Find(deep); err == nil {
		t.Fatal("found a root without tools/go.mod")
	}
	if err := os.WriteFile(filepath.Join(root, "tools", "go.mod"), []byte("module x\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Find(deep)
	if err != nil || got != root {
		t.Fatalf("Find = %q, %v; want %q", got, err, root)
	}
}

// The test itself runs inside the real checkout.
func TestFindReal(t *testing.T) {
	root, err := Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, "data/README.md")); err != nil {
		t.Errorf("root %s has no data/README.md", root)
	}
}
