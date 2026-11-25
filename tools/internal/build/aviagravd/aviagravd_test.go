package aviagravd

import (
	"archive/zip"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"flatorglobe/tools/internal/parity"
	"flatorglobe/tools/internal/repo"
)

// pinnedFlips is the number of last-digit differences with the Python
// output (testdata/avia-gravd.python.js.gz, written by
// scripts/build_avia_gravd.py on 2026-10-14, identical to the preset then
// committed). Such flips would come from sin/cos/pow (CPython calls glibc,
// Go its own math package, both within one ulp); there are none today: the
// body is byte-identical. A change of this number is a change of the port.
const pinnedFlips = 0

func TestParityWithPython(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	blocks, d, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	if got := Summary(blocks); got != "EN02: 28 lines, 3743 samples kept (1 every 30 s)" {
		t.Errorf("summary %q; Python printed EN02: 28 lines, 3743 samples kept (1 every 30 s)", got)
	}
	b, err := File(blocks, d).Render(root)
	if err != nil {
		t.Fatal(err)
	}
	want, err := parity.ReadGolden("testdata/avia-gravd.python.js.gz")
	if err != nil {
		t.Fatal(err)
	}
	flips, err := parity.Compare(string(b), want)
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range flips {
		t.Log(f)
	}
	if len(flips) != pinnedFlips {
		t.Errorf("%d last-digit flips, pinned %d", len(flips), pinnedFlips)
	}
}

func writeZip(t *testing.T, p string, files map[string]string) {
	t.Helper()
	f, err := os.Create(p)
	if err != nil {
		t.Fatal(err)
	}
	w := zip.NewWriter(f)
	for name, body := range files {
		x, _ := w.Create(name)
		x.Write([]byte(body))
	}
	w.Close()
	f.Close()
}

// A synthetic line flying due east at the equator, 1 Hz: the east
// velocity is the GRS80 equatorial radius times the angular rate.
func TestThinOnSyntheticLine(t *testing.T) {
	var r []sample
	for i := 0; i < 200; i++ {
		r = append(r, sample{t: float64(1000 + i), lat: 0, lon: float64(i) * 0.002, h: 0, g: 978000})
	}
	pts := thin(r)
	// kept: t % 30 == 0 among 1001..1198 -> 1020, 1050, ..., 1170
	if len(pts) != 6 {
		t.Fatalf("%d samples kept, want 6", len(pts))
	}
	// 0.002 deg/s at the equator on GRS80: 6378137 * 0.002*pi/180 = 222.6 m/s
	if pts[0][4] != 222.6 || pts[0][5] != 0 {
		t.Errorf("ve, vn = %v, %v; want 222.6, 0", pts[0][4], pts[0][5])
	}
	// a gap of more than 4 s around a sample drops it
	r2 := append([]sample{}, r...)
	r2[21].t, r2[19].t = 1030, 1010 // around t=1020: dt = 20
	if n := len(thin(r2)); n != 5 {
		t.Errorf("sample with a gap kept: %d", n)
	}
}

func TestReadZipRejects(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "x.zip")
	writeZip(t, p, map[string]string{"readme.txt": "x"})
	if _, _, err := readZip(p); err == nil || !strings.Contains(err.Error(), "no *Gravity_Data*") {
		t.Errorf("zip without data file: %v", err)
	}
	writeZip(t, p, map[string]string{"X_Gravity_Data.txt": "L1 1 2 3 4 5\nL1 1 2 3 4 \xc3\xa9\n"})
	if _, _, err := readZip(p); err == nil || !strings.Contains(err.Error(), "not plain ASCII") {
		t.Errorf("non-ASCII accepted: %v", err)
	}
	writeZip(t, p, map[string]string{"X_Gravity_Data.txt": "L1 1 2 x 4 5\n"})
	if _, _, err := readZip(p); err == nil {
		t.Error("non-numeric field accepted")
	}
}
