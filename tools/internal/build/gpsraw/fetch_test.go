package gpsraw

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync/atomic"
	"testing"
	"time"

	"flatorglobe/tools/internal/fetch"
)

func TestFetchListedStations(t *testing.T) {
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		io.WriteString(w, "gz")
	}))
	defer srv.Close()
	old := ObsBase
	ObsBase = srv.URL + "/"
	defer func() { ObsBase = old }()
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, RawDir), 0o755)
	os.WriteFile(filepath.Join(root, Stations), []byte("# c\nAAAA A.crx.gz\nBBBB B.crx.gz\n"), 0o644)
	os.WriteFile(filepath.Join(root, RawDir, "A.crx.gz"), []byte("cached"), 0o644)
	c := &fetch.Client{HTTP: srv.Client(), Pause: time.Millisecond}
	if err := Fetch(context.Background(), root, c, io.Discard); err != nil {
		t.Fatal(err)
	}
	if hits.Load() != 1 {
		t.Errorf("%d downloads, want 1 (A is cached)", hits.Load())
	}
}
