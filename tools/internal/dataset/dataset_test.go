package dataset

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const goodJSON = `{
  "schema_version": 1,
  "id": "seis-test",
  "title": "Test",
  "tab": "seis",
  "build": "fog:test",
  "kind": "transcription",
  "evidence": "measure",
  "radius_enters_via": [],
  "verdict_rule": "lap times that differ by station",
  "license": "public-domain",
  "sources": [{"cite": "Strachey 1888", "url": "https://archive.org/x"}],
  "collected": "2026-10-03",
  "units": {"t": "h"},
  "inputs": [{"path": "a.csv", "how": "transcription", "origin": "Strachey 1888, table 3"}, {"glob": "raw/*.json", "how": "api", "origin": "an API"},
    {"path": "big.bin", "url": "https://example.org/big.bin", "gitignored": true, "how": "download", "origin": "example.org", "public_raw": "no", "public_raw_why": "terms"}],
  "outputs": ["src/data/presets/x.js"],
  "public_raw": "yes",
  "code": ["data"],
  "sections": ["seis/sq-h1"]
}`

func fixture(t *testing.T, manifest string) (string, *Dataset, Env) {
	t.Helper()
	root := t.TempDir()
	dir := filepath.Join(root, "data", "seis", "test")
	os.MkdirAll(filepath.Join(dir, "raw"), 0o755)
	os.MkdirAll(filepath.Join(root, "data", "seis", "test", "raw", "sub"), 0o755)
	os.WriteFile(filepath.Join(dir, "a.csv"), []byte("x\n"), 0o644)
	os.WriteFile(filepath.Join(dir, "raw", "1.json"), []byte("{}"), 0o644)
	os.WriteFile(filepath.Join(dir, "raw", "2.json"), []byte("[]"), 0o644)
	os.WriteFile(filepath.Join(dir, ManifestName), []byte(manifest), 0o644)
	d, err := Load(root, "data/seis/test/"+ManifestName)
	if err != nil {
		t.Fatal(err)
	}
	return root, d, Env{Root: root, Tabs: map[string]bool{"seis": true}, Targets: map[string]bool{"test": true}}
}

func errorsOf(ps []Problem) []string {
	var out []string
	for _, p := range ps {
		if p.Sev == Error {
			out = append(out, p.String())
		}
	}
	return out
}

func TestProvenance(t *testing.T) {
	_, d, _ := fixture(t, goodJSON)
	if ok, _ := d.Public(d.Inputs[0]); !ok {
		t.Error("a.csv should be public (dataset default)")
	}
	if ok, why := d.Public(d.Inputs[2]); ok || why != "terms" {
		t.Errorf("big.bin: public %v, why %q", ok, why)
	}
	if in, ok := d.InputOf("raw/2.json"); !ok || in.How != "api" {
		t.Errorf("InputOf(raw/2.json) = %+v %v", in, ok)
	}
}

func TestGoodDatasetAndLockCycle(t *testing.T) {
	root, d, env := fixture(t, goodJSON)
	if d.Dir != "data/seis/test" {
		t.Fatalf("Dir = %q", d.Dir)
	}
	ps := d.Validate(env)
	if e := errorsOf(ps); len(e) != 1 || !strings.Contains(e[0], "fog lock seis-test") {
		t.Fatalf("before lock: %v", e)
	}
	n, err := WriteLock(root, d)
	if err != nil || n != 3 {
		t.Fatalf("WriteLock = %d, %v", n, err)
	}
	ps = d.Validate(env)
	if e := errorsOf(ps); len(e) != 0 {
		t.Fatalf("after lock: %v", e)
	}
	// the gitignored file is absent: a warning that names fog fetch
	var warned bool
	for _, p := range ps {
		warned = warned || (p.Sev == Warning && strings.Contains(p.Msg, "fog fetch seis-test"))
	}
	if !warned {
		t.Errorf("no fetch warning for the missing gitignored input: %v", ps)
	}
	lock, _ := os.ReadFile(filepath.Join(root, d.Dir, LockName))
	if !strings.Contains(string(lock), "  raw/1.json\n") || strings.Index(string(lock), "a.csv") > strings.Index(string(lock), "raw/1.json") {
		t.Errorf("lock not sorted sha256sum format:\n%s", lock)
	}
	// a changed file and a new file are both caught
	os.WriteFile(filepath.Join(root, d.Dir, "raw", "1.json"), []byte(`{"x":1}`), 0o644)
	os.WriteFile(filepath.Join(root, d.Dir, "raw", "3.json"), []byte(`1`), 0o644)
	e := strings.Join(errorsOf(d.Validate(env)), "\n")
	if !strings.Contains(e, "raw/1.json: sha256 differs") || !strings.Contains(e, "raw/3.json: not in the lock") {
		t.Errorf("changes not caught:\n%s", e)
	}
	// a removed file too
	os.Remove(filepath.Join(root, d.Dir, "raw", "2.json"))
	if e := strings.Join(errorsOf(d.Validate(env)), "\n"); !strings.Contains(e, "raw/2.json: locked but gone") {
		t.Errorf("removal not caught:\n%s", e)
	}
}

func TestWriteLockKeepsAbsentIgnoredHashes(t *testing.T) {
	root, d, _ := fixture(t, goodJSON)
	big := filepath.Join(root, d.Dir, "big.bin")
	os.WriteFile(big, []byte("big"), 0o644)
	WriteLock(root, d)
	os.Remove(big)
	WriteLock(root, d)
	lock, _ := ReadLock(root, d)
	if _, ok := lock["big.bin"]; !ok {
		t.Error("hash of an absent gitignored input was erased")
	}
}

// Every rule, one broken field at a time.
func TestEachRule(t *testing.T) {
	cases := []struct {
		field string
		value any
		want  string
	}{
		{"schema_version", 2, "schema_version"},
		{"id", "Bad_ID", "id"},
		{"title", " ", "title"},
		{"tab", "nope", "tab"},
		{"build", "fog:nope", "no fog build target"},
		{"build", "python", "build"},
		{"build", "", "missing"},
		{"build", "fog:test fog:other", "no fog build target \"other\""},
		{"build", "script:scripts/none.py", "not found"},
		{"kind", "guess", "kind"},
		{"evidence", "proof", "evidence"},
		{"radius_enters_via", []Entry{{"d", "km from coordinates"}}, "class it check"},
		{"verdict_rule", "", "rule 5"},
		{"license", "MIT", "license"},
		{"license", "other", "license_note"},
		{"sources", []Source{}, "at least one source"},
		{"sources", []Source{{Cite: "x", URL: "ftp://x"}}, "http(s)"},
		{"collected", "Oct 2026", "collected"},
		{"units", map[string]string{}, "units"},
		{"inputs", []Input{{Path: "../escape.csv"}}, "inside the dataset"},
		{"inputs", []Input{{Path: "a.csv", Glob: "*.csv"}}, "exactly one of path and glob"},
		{"inputs", []Input{{Glob: "raw/*.json", URL: "https://x/y"}}, "single path only"},
		{"inputs", []Input{{Path: "missing.csv"}}, "missing.csv: not found"},
		{"outputs", []string{"public/x.js"}, "under src/data/"},
		{"outputs", []string{"data/seis/test/a.csv"}, "also an input"},
	}
	for _, c := range cases {
		var m map[string]any
		json.Unmarshal([]byte(goodJSON), &m)
		m[c.field] = c.value
		b, _ := json.Marshal(m)
		root, d, env := fixture(t, string(b))
		WriteLock(root, d)
		e := strings.Join(errorsOf(d.Validate(env)), "\n")
		if !strings.Contains(e, c.want) {
			t.Errorf("%s = %v: want an error containing %q, got:\n%s", c.field, c.value, c.want, e)
		}
	}
	// check without radius_enters_via
	var m map[string]any
	json.Unmarshal([]byte(goodJSON), &m)
	m["evidence"] = "check"
	b, _ := json.Marshal(m)
	_, d, env := fixture(t, string(b))
	if e := strings.Join(errorsOf(d.Validate(env)), "\n"); !strings.Contains(e, "must say where the radius enters") {
		t.Errorf("check without radius_enters_via: %s", e)
	}
}

func TestLoadIsStrict(t *testing.T) {
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "data", "x"), 0o755)
	os.WriteFile(filepath.Join(root, "data", "x", ManifestName), []byte(`{"schema_version":1,"titel":"typo"}`), 0o644)
	if _, err := Load(root, "data/x/"+ManifestName); err == nil || !strings.Contains(err.Error(), "titel") {
		t.Fatalf("unknown field accepted: %v", err)
	}
	os.WriteFile(filepath.Join(root, "data", "x", ManifestName), []byte(`{"schema_version":1} {}`), 0o644)
	if _, err := Load(root, "data/x/"+ManifestName); err == nil {
		t.Fatal("trailing data accepted")
	}
}

func TestDiscoverSkipsRaw(t *testing.T) {
	root := t.TempDir()
	for _, p := range []string{"data/a/dataset.json", "data/b/c/dataset.json", "data/a/raw/dataset.json"} {
		os.MkdirAll(filepath.Join(root, filepath.Dir(p)), 0o755)
		os.WriteFile(filepath.Join(root, p), []byte("{}"), 0o644)
	}
	got, err := Discover(root)
	if err != nil || strings.Join(got, ",") != "data/a/dataset.json,data/b/c/dataset.json" {
		t.Fatalf("Discover = %v, %v", got, err)
	}
}

func TestReadLockRejectsGarbage(t *testing.T) {
	root := t.TempDir()
	d := &Dataset{Dir: "d"}
	os.MkdirAll(filepath.Join(root, "d"), 0o755)
	for _, body := range []string{"nothex  a\n", strings.Repeat("a", 64) + " a\n",
		strings.Repeat("a", 64) + "  a\n" + strings.Repeat("b", 64) + "  a\n"} {
		os.WriteFile(filepath.Join(root, "d", LockName), []byte(body), 0o644)
		if _, err := ReadLock(root, d); err == nil {
			t.Errorf("accepted %q", body)
		}
	}
}
