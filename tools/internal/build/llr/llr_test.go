package llr

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// (datetime(2015,1,26) + timedelta(seconds=s)).isoformat() in CPython 3.13.
func TestAddSecondsLikeTimedelta(t *testing.T) {
	d := midnight(2015, 1, 26)
	for s, want := range map[float64]string{
		2980.0: "2015-01-26T00:49:40.000000", 2980.0000005: "2015-01-26T00:49:40.000001",
		2980.0000015: "2015-01-26T00:49:40.000002", 2.5e-06: "2015-01-26T00:00:00.000002",
		86399.9999995: "2015-01-26T23:59:59.999999", 12.3456785: "2015-01-26T00:00:12.345678",
	} {
		if got := time.UnixMicro(addSeconds(d, s)).UTC().Format("2006-01-02T15:04:05.000000"); got != want {
			t.Errorf("%v: %s, CPython %s", s, got, want)
		}
	}
}

// testdata/moon-llr.js.python.gz: what scripts/build_llr.py wrote from the
// 132 cached monthly files (identical to the committed preset, 2026-10-14).
func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if m, _ := filepath.Glob(filepath.Join(root, RawDir, "a15_*.npt")); len(m) == 0 {
		t.Skip("raw files not on this machine (gitignored): fog fetch moon-llr")
	}
	passes, _, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(passes) != 55 {
		t.Errorf("%d passes, Python wrote 55", len(passes))
	}
	b, err := File(passes).Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/moon-llr.js.python.gz")
	if err != nil {
		t.Fatal(err)
	}
	if flips, err := parity.Compare(string(b), want); err != nil || len(flips) != 0 {
		t.Fatalf("%v %v", flips, err)
	}
}

// A synthetic session: passes split on a 3 h gap and kept from 6 h / 6 points.
func TestPasses(t *testing.T) {
	var b strings.Builder
	b.WriteString("h2 APOL 7045 95 1 4\r\nh4 1 2015 1 26 0 0 0 2015 1 26 23 0 0\r\n")
	for i := 0; i < 8; i++ { // 0 h .. 7 h, one an hour: kept
		b.WriteString("11 " + itoa(3600*i) + ".0 2.43 std2\r\n")
	}
	for i := 0; i < 3; i++ { // 11 h .. 13 h: too short
		b.WriteString("11 " + itoa(3600*(11+i)) + ".0 2.44 std2\r\n")
	}
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, RawDir), 0o755)
	os.WriteFile(filepath.Join(root, RawDir, "a15_201501.npt"), []byte(b.String()), 0o644)
	passes, n, err := Compute(root)
	if err != nil || n != 11 || len(passes) != 1 || len(passes[0].Pts) != 8 || passes[0].St != "APOL" {
		t.Fatalf("passes %+v, rows %d, err %v", passes, n, err)
	}
	if passes[0].Pts[7][0] != 25200 {
		t.Errorf("last point at %v s", passes[0].Pts[7][0])
	}
}

func itoa(i int) string { return strconv.Itoa(i) }

func TestFetchSkipsMissingMonths(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "201502.npt") {
			http.NotFound(w, r)
			return
		}
		io.WriteString(w, "h1 CRD\n")
	}))
	defer srv.Close()
	oldU, oldY := URL, Years
	URL, Years = srv.URL+"/%d/apollo15_%d%02d.npt", [2]int{2015, 2015}
	defer func() { URL, Years = oldU, oldY }()
	root := t.TempDir()
	if err := Fetch(context.Background(), root, srv.Client(), io.Discard); err != nil {
		t.Fatal(err)
	}
	m, _ := filepath.Glob(filepath.Join(root, RawDir, "*.npt"))
	if len(m) != 11 {
		t.Errorf("%d files, want 11 (February missing upstream)", len(m))
	}
}
