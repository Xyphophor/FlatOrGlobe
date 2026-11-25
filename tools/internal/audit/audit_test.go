package audit

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func write(t *testing.T, root, p, s string) {
	t.Helper()
	full := filepath.Join(root, p)
	os.MkdirAll(filepath.Dir(full), 0o755)
	if err := os.WriteFile(full, []byte(s), 0o644); err != nil {
		t.Fatal(err)
	}
}

// A two-tab site: "a" cites n1 by anchor and n2 by cite(); "b" leaves n2 orphaned
// and points at another tab's anchor; fr misses one prose key.
func fixture(t *testing.T) string {
	root := t.TempDir()
	write(t, root, "src/tabs/a/index.js", `cite(KEY, "two")`)
	write(t, root, "src/tabs/b/index.js", ``)
	write(t, root, "src/data/sources/a.js", `export const SOURCES = [ { id: "one", html: "x" }, { id: "two", html: "y" } ];`)
	write(t, root, "src/data/sources/b.js", `export const SOURCES = [ { id: "n1", html: "x" }, { id: "n2", html: "y" } ];`)
	write(t, root, "src/data/prose/a.js", `export const PROSE = [{"t":"h2","k":"a-h","html":"<a href=\"#s-a-n1\">[1]</a> 6,371 km"},{"t":"section","blocks":[{"t":"lead","k":"a-l","html":"<b>12</b> and 30"}]}];`)
	write(t, root, "src/data/prose/b.js", `export const PROSE = [{"t":"h2","k":"b-h","html":"see #s-b-n1 and #s-a-n2"}];`)
	write(t, root, "src/i18n/en/a.json", `{"x": "1"}`)
	write(t, root, "src/i18n/fr/a.json", `{}`)
	write(t, root, "src/i18n/fr/a-prose.json", `{"a-h": "<a href=\"#s-a-n1\">[1]</a> 6 371 km", "a-l": "<i>12</i> et 40"}`)
	write(t, root, "src/i18n/fr/b-prose.json", `{"b-h": {"__html": "<h2>voir</h2>"}}`)
	write(t, root, "src/core/tex-mathml.js", "const SYM = { alpha: 1 };\nconst OP = { sum: 1 };\nconst TIGHT = {};\nconst FUNC = [\"sin\"];\nconst SPACE = { quad: 1 };\nfunction f(n){ switch (n) { case \"frac\": return 1; } }\n")
	write(t, root, "src/tabs/a/fig.js", `const s = "data-tex=\"\\alpha + \\beta\"";`)
	return root
}

func TestStructure(t *testing.T) {
	var b strings.Builder
	code, err := Structure(fixture(t), &b)
	out := b.String()
	if err != nil || code != 1 {
		t.Fatalf("code %d err %v\n%s", code, err, out)
	}
	for _, want := range []string{
		`b: source "n2" (position 2) déclarée mais jamais citée`,
		`b: ancre pointant vers l'onglet "a" dans b.js`,
		"fr: 1 clé(s) sur 1 fichier(s) touché(s)",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("missing %q in\n%s", want, out)
		}
	}
	if strings.Contains(out, `a: source`) {
		t.Errorf("tab a cites both sources:\n%s", out)
	}
}

func TestTex(t *testing.T) {
	var b strings.Builder
	code, err := Tex(fixture(t), &b)
	if err != nil || code != 1 || !strings.Contains(b.String(), `\beta :`) || strings.Contains(b.String(), `\alpha :`) {
		t.Fatalf("code %d err %v\n%s", code, err, b.String())
	}
}

func TestFidelity(t *testing.T) {
	var b strings.Builder
	code, err := Fidelity(fixture(t), &b)
	out := b.String()
	if err != nil || code != 1 {
		t.Fatalf("code %d err %v\n%s", code, err, out)
	}
	// "6,371" and "6 371" are the same number; <b> vs <i> and 3 vs 4 are not
	if !strings.Contains(out, "balises différentes -- anglais {'b': 1, '/b': 1} vs traduit {'i': 1, '/i': 1}") ||
		!strings.Contains(out, "nombres différents") || strings.Contains(out, "6371") {
		t.Errorf("report:\n%s", out)
	}
	if !strings.Contains(out, "1 bloc(s) traduit(s) en objet") {
		t.Errorf("whole-block translation not counted:\n%s", out)
	}
}
