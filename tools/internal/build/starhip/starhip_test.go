package starhip

import (
	"errors"
	"io/fs"
	"math"
	"strings"
	"testing"

	"flatorglobe/tools/internal/repo"
)

func TestCompute(t *testing.T) {
	root, err := repo.Find(".")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Compute(root)
	if errors.Is(err, fs.ErrNotExist) { // a raw file that the public repository does not carry (its .explain says why)
		t.Skip(err)
	}
	if err != nil {
		t.Fatal(err)
	}
	if s := r.Summary(); s != "960 stars brighter than V = 4.55 (2 more without a position, left out), 6 fast-moving stars" {
		t.Errorf("summary %q", s)
	}
	// Sirius, HIP 32349: the brightest star, as printed in the catalogue
	var sirius *Star
	for i := range r.Bright {
		if r.Bright[i].HIP == 32349 {
			sirius = &r.Bright[i]
		}
	}
	if sirius == nil || sirius.V != -1.44 || math.Abs(sirius.RA-101.28854) > 1e-4 || math.Abs(sirius.Dec+16.71314) > 1e-4 ||
		sirius.PMRA != -546.01 || sirius.PMDe != -1223.08 {
		t.Errorf("Sirius %+v", sirius)
	}
	// Barnard's star: the largest proper motion known, 10.4 arcseconds a year
	b := r.Fast[3]
	if b.HIP != 87937 || math.Abs(math.Hypot(b.PMRA, b.PMDe)-10357.7) > 0.5 {
		t.Errorf("Barnard %+v", b)
	}
	body := r.File().Body
	if !strings.Contains(body, "  [32349, 101.28854, -16.71314, -546, -1223.1, -1.44, 0.01],\n") {
		t.Error("Sirius row not rendered as expected")
	}
}

func TestNum(t *testing.T) {
	for _, c := range []struct {
		v    float64
		p    int
		want string
	}{{1.5, 2, "1.5"}, {-0.001, 2, "0"}, {120, 1, "120"}, {2.09653333, 5, "2.09653"}} {
		if got := num(c.v, c.p); got != c.want {
			t.Errorf("num(%v, %d) = %q, want %q", c.v, c.p, got, c.want)
		}
	}
}
