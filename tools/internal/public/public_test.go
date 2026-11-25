package public

import "testing"

func TestGlob(t *testing.T) {
	for _, c := range []struct {
		g, p string
		ok   bool
	}{{"tasks/**", "tasks/epic1/UC01.org", true}, {"LOG.md", "LOG.md", true}, {"LOG.md", "data/LOG.md", false},
		{"public/photos/contrib-x-*", "public/photos/contrib-x-1.jpg", true}, {"src/data/presets/contrib-x.js*", "src/data/presets/contrib-x.js.explain", true}} {
		if match([]string{c.g}, c.p) != c.ok {
			t.Errorf("%s ~ %s: want %v", c.g, c.p, c.ok)
		}
	}
}

func TestDropLine(t *testing.T) {
	for _, l := range []string{"\t\"x/adelaide\" // public:drop adelaide", "// public:drop adelaide begin", "| row | <!-- public:drop adelaide -->"} {
		if m := dropLine.FindStringSubmatch(l); m == nil || m[1] != "adelaide" {
			t.Errorf("%q not matched", l)
		}
	}
	if dropLine.MatchString("public:drop adelaide in the middle of a line, then more") {
		t.Error("matched a line that does not end with the marker")
	}
}
