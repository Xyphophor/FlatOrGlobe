package aviaflights

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"flatorglobe/tools/internal/pyjson"
)

// testdata/page.html is a made-up FlightAware page (two schedules, three
// legs: complete, cancelled with null blocks, diverted with an empty
// route); page.python.json is what the Python script's extraction code
// wrote from it (json.dumps(indent=1)).
func TestParsePageMatchesPython(t *testing.T) {
	html, _ := os.ReadFile("testdata/page.html")
	want, _ := os.ReadFile("testdata/page.python.json")
	legs, err := ParsePage(html)
	if err != nil {
		t.Fatal(err)
	}
	if got := RawJSON("QFA27", "2026-10-14", legs); got != string(want) {
		t.Errorf("raw file differs from Python:\n got %s\nwant %s", got, want)
	}
	if legs, err := ParsePage([]byte("<html>no bootstrap</html>")); err != nil || len(legs) != 0 {
		t.Errorf("page without bootstrap: %v %v", legs, err)
	}
}

func TestFetchOnlyMissing(t *testing.T) {
	page, _ := os.ReadFile("testdata/page.html")
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		if r.UserAgent() != UA {
			t.Errorf("user agent %q", r.UserAgent())
		}
		if !strings.HasPrefix(r.URL.Path, "/live/flight/") {
			t.Errorf("path %s", r.URL.Path)
		}
		w.Write(page)
	}))
	defer srv.Close()
	old := PageURL
	PageURL = srv.URL + "/live/flight/"
	defer func() { PageURL = old }()

	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, RawDir), 0o755)
	os.WriteFile(filepath.Join(root, Routes), []byte(`{"routes":[{"a":"SYD","b":"SCL","ab":["QFA27"],"ba":["QFA28"]},{"a":"SCL","b":"SYD","ab":["QFA28"],"ba":["QFA27"]}]}`), 0o644)
	os.WriteFile(filepath.Join(root, RawDir, "QFA28.json"), []byte(`{"ident":"QFA28","fetched":"2026-09-28","legs":[]}`), 0o644)
	if err := Fetch(context.Background(), root, false, srv.Client(), time.Millisecond, io.Discard); err != nil {
		t.Fatal(err)
	}
	if hits.Load() != 1 {
		t.Errorf("%d requests: only the missing QFA27, once", hits.Load())
	}
	if _, err := ReadRaw(root, "QFA27"); err != nil {
		t.Errorf("written raw file unreadable: %v", err)
	}
	if err := Fetch(context.Background(), root, true, srv.Client(), time.Millisecond, io.Discard); err != nil {
		t.Fatal(err)
	}
	if hits.Load() != 3 {
		t.Errorf("refresh: %d requests in all, want 3", hits.Load())
	}
	// a refresh adds to the file: same page again = no new leg, the
	// unflown ones dropped, the readings listed
	before, _ := ParsePage(page)
	r, err := ReadRaw(root, "QFA27")
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Legs) != len(before) {
		t.Errorf("same page read twice: %d legs, want %d", len(r.Legs), len(before))
	}
	r28, _ := ReadRaw(root, "QFA28")
	if len(r28.Windows) != 2 || r28.Windows[0] != "2026-09-28" {
		t.Errorf("windows %v, want [2026-09-28 today]", r28.Windows)
	}
}

func TestMergeKeepsEarlierFlights(t *testing.T) {
	old := &Raw{Ident: "X", Fetched: "2026-09-28"}
	mk := func(o, d string, off string) Leg {
		var p *json.Number
		if off != "" {
			n := json.Number(off)
			p = &n
		}
		return Leg{O: &o, D: &d, Off: p, OnT: p}
	}
	old.Legs = []Leg{mk("SYD", "SCL", "1790000000"), mk("SYD", "SCL", "1791000000"), mk("SYD", "SCL", "")}
	// the second earlier flight is on the new page, its time refined by 10 min
	fresh := []pyjson.Obj{{{K: "o", V: "SYD"}, {K: "d", V: "SCL"}, {K: "off", V: json.Number("1791000600")}},
		{{K: "o", V: "SYD"}, {K: "d", V: "SCL"}, {K: "off", V: json.Number("1792000000")}}}
	got := Merge(old, fresh)
	if len(got) != 3 {
		t.Fatalf("%d legs, want 2 new + 1 earlier", len(got))
	}
	if v := field(got[2], "off"); v != json.Number("1790000000") {
		t.Errorf("kept earlier leg off = %v", v)
	}
	b := rawJSON("X", "2026-11-07", []string{"2026-09-28", "2026-11-07"}, got)
	var back Raw
	if err := json.Unmarshal([]byte(b), &back); err != nil || len(back.Legs) != 3 || len(back.Windows) != 2 {
		t.Errorf("round trip: %v %v", err, back)
	}
}
