package mlo

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFetchSkipsHTMLDays(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "002.dat") {
			io.WriteString(w, "  <html>not found</html>")
			return
		}
		io.WriteString(w, "header\nheader\n")
	}))
	defer srv.Close()
	old := DayURL
	DayURL = srv.URL + "/%d/mlo%02d%03d.dat"
	defer func() { DayURL = old }()
	root := t.TempDir()
	if err := Fetch(context.Background(), root, srv.Client(), io.Discard); err != nil {
		t.Fatal(err)
	}
	m, _ := filepath.Glob(filepath.Join(root, RawDir, "*.dat"))
	if len(m) != 365 {
		t.Errorf("%d files, want 365 (day 2 is an HTML page)", len(m))
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "mlo16002.dat")); err == nil {
		t.Error("HTML page kept as data")
	}
}
