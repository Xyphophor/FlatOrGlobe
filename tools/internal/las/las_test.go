package las

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"hash"
	"math"
	"os"
	"path/filepath"
	"testing"

	"flatorglobe/tools/internal/repo"
)

// The digests are laspy 2.7.0 + lazrs 0.8.2 on the same files: SHA-256 of
// x, y, z (float64), classification (uint8), gps_time (float64), each
// array whole, in that order.
var laspyDigests = []struct {
	file string
	n    int
	sum  string
}{
	{"AdelaideMetro2022-C2-AHD_2726122_54_0001_0001.laz", 2211521, "33cae3776292b84b981a973ec776109e43361e04edbe26df87286567ef2ee0ef"},
	{"AdelaideMetro2026-C3-AHD_2726122_54_0001_0001.laz", 6846632, "d9c3476492eea268655a105febf230a1afd0ec74bf79b56ec29d88c2a8ea44ed"},
}

const dir = "data/contrib/adelaide/raw/elvis/SA Government/Point Clouds/AHD"

func TestSameAsLaspy(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, Bin)); err != nil {
		t.Skip("laz2pts not built: make laz2pts")
	}
	for _, c := range laspyDigests {
		p := filepath.Join(root, dir, c.file)
		if _, err := os.Stat(p); err != nil {
			t.Skipf("%s not on this machine (gitignored)", c.file)
		}
		all := &Points{}
		if err := Read(root, p, 1<<20, func(q *Points) error { all.Concat(q); return nil }); err != nil {
			t.Fatal(err)
		}
		h := sha256.New()
		f64 := func(h hash.Hash, a []float64) {
			b := make([]byte, 8*len(a))
			for i, v := range a {
				binary.LittleEndian.PutUint64(b[8*i:], math.Float64bits(v))
			}
			h.Write(b)
		}
		f64(h, all.X)
		f64(h, all.Y)
		f64(h, all.Z)
		h.Write(all.Class)
		f64(h, all.GPS)
		if all.Len() != c.n || hex.EncodeToString(h.Sum(nil)) != c.sum {
			t.Errorf("%s: %d points, digest differs from laspy's", c.file, all.Len())
		}
	}
}
