package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"flatorglobe/tools/internal/build/krakatoa"
	"flatorglobe/tools/internal/repo"
)

// fakeRoot copies the Krakatoa inputs into an empty checkout.
func fakeRoot(t *testing.T) string {
	t.Helper()
	real, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	for _, p := range []string{krakatoa.Stations, krakatoa.Table8} {
		b, err := os.ReadFile(filepath.Join(real, p))
		if err != nil {
			t.Fatal(err)
		}
		os.MkdirAll(filepath.Dir(filepath.Join(root, p)), 0o755)
		os.WriteFile(filepath.Join(root, p), b, 0o644)
	}
	os.MkdirAll(filepath.Join(root, "tools"), 0o755)
	os.WriteFile(filepath.Join(root, "tools", "go.mod"), []byte("module x\n"), 0o644)
	return root
}

func fog(args ...string) (int, string, string) {
	var o, e strings.Builder
	code := run(args, &o, &e)
	return code, o.String(), e.String()
}

func TestBuildCheckCycle(t *testing.T) {
	root := fakeRoot(t)
	if code, _, e := fog("-root", root, "build", "--check", "krakatoa"); code != 1 || !strings.Contains(e, "stale") {
		t.Fatalf("check before build: code %d, stderr %s", code, e)
	}
	code, out, e := fog("-root", root, "build", "krakatoa")
	if code != 0 || !strings.Contains(out, "47 stations, 175 intervals") || !strings.Contains(out, "written") {
		t.Fatalf("build: code %d\n%s%s", code, out, e)
	}
	if code, out, _ := fog("-root", root, "build", "--check", "krakatoa"); code != 0 || !strings.Contains(out, "unchanged") {
		t.Fatalf("check after build: code %d\n%s", code, out)
	}
}

func TestUsageErrors(t *testing.T) {
	for _, args := range [][]string{{}, {"nope"}, {"build"}, {"build", "nope"}} {
		if code, _, _ := fog(args...); code != 2 {
			t.Errorf("fog %v: exit %d, want 2", args, code)
		}
	}
	if code, out, _ := fog("list"); code != 0 || !strings.Contains(out, "krakatoa") {
		t.Errorf("list: %d %s", code, out)
	}
}

func TestBuildFailsOnBadData(t *testing.T) {
	root := fakeRoot(t)
	p := filepath.Join(root, krakatoa.Table8)
	b, _ := os.ReadFile(p)
	os.WriteFile(p, []byte(strings.Replace(string(b), "Pawlowsk,17:10,", "Pawlowsk,17:12,", 1)), 0o644)
	code, _, e := fog("-root", root, "build", "krakatoa")
	if code != 1 || !strings.Contains(e, "transcription mismatch") {
		t.Fatalf("code %d, stderr %s", code, e)
	}
	if _, err := os.Stat(filepath.Join(root, krakatoa.Out)); !os.IsNotExist(err) {
		t.Error("a failed build wrote the preset")
	}
}
