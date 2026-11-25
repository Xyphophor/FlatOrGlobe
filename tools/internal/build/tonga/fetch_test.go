package tonga

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestFetchAndSelect(t *testing.T) {
	var csvHits atomic.Int32
	long := "station,station_name,valid(UTC),pres1\n" + strings.Repeat("X,Y,2022-01-15 00:00,29.9\n", 3001)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "_ASOS.geojson"):
			// online-old, offline, online-new (archive after 2000), online-old, online-old
			io.WriteString(w, `{"features":[
			 {"id":"A1","properties":{"online":true,"archive_begin":"1995-01-01","sname":"a"},"geometry":{"coordinates":[-100,40]}},
			 {"id":"A2","properties":{"online":false,"archive_begin":"1995-01-01","sname":"b"},"geometry":{"coordinates":[-100,40]}},
			 {"id":"A3","properties":{"online":true,"archive_begin":"2005-01-01","sname":"c"},"geometry":{"coordinates":[-100,40]}},
			 {"id":"A4","properties":{"online":true,"archive_begin":null,"sname":"d"},"geometry":{"coordinates":[-100,40]}},
			 {"id":"A5","properties":{"online":true,"archive_begin":"1990-01-01","sname":"e"},"geometry":{"coordinates":[-101.123456,41.98765]}},
			 {"id":"A6","properties":{"online":true,"archive_begin":"1990-01-01","sname":"f"},"geometry":{"coordinates":[-100,40]}}]}`)
		case strings.Contains(r.URL.RawQuery, "station="):
			csvHits.Add(1)
			if strings.Contains(r.URL.RawQuery, "station=A1&") {
				io.WriteString(w, "short\n") // too few lines: not selected
				return
			}
			io.WriteString(w, long)
		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()
	oldS, oldN, oldO := States, NetURL, OneMin
	States, NetURL, OneMin = []string{"ZZ"}, srv.URL+"/%s_ASOS.geojson", srv.URL+"/one?station=%s&vars=pres1"
	defer func() { States, NetURL, OneMin = oldS, oldN, oldO }()

	root := t.TempDir()
	if err := Fetch(context.Background(), root, srv.Client(), time.Millisecond, io.Discard); err != nil {
		t.Fatal(err)
	}
	// A1 (short), then A5 and A6 are fetched; A2, A3, A4 are not candidates
	if csvHits.Load() != 3 {
		t.Errorf("%d pressure downloads, want 3", csvHits.Load())
	}
	got, err := Select(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 || got[0].ID != "A5" || got[1].ID != "A6" || got[0].Lat != 41.9877 || got[0].Lon != -101.1235 {
		t.Errorf("selection %+v", got)
	}
	if err := Fetch(context.Background(), root, srv.Client(), time.Millisecond, io.Discard); err != nil || csvHits.Load() != 3 {
		t.Errorf("second run downloaded again (%d)", csvHits.Load())
	}
	if _, err := os.Stat(filepath.Join(root, RawDir, "net_ZZ.json")); err != nil {
		t.Error("station list not cached")
	}
}
