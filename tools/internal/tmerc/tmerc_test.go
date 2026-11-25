package tmerc

import (
	"bufio"
	"math"
	"os"
	"strconv"
	"strings"
	"testing"
)

// testdata/pyproj.txt: pyproj 3.8.0 (PROJ 9.8.1), EPSG:4326 <-> EPSG:7854,
// always_xy; "F lon lat x y" forward, "I x y lon lat" inverse.
func TestMGA54MatchesPyproj(t *testing.T) {
	f, err := os.Open("testdata/pyproj.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	p := MGA54()
	sc := bufio.NewScanner(f)
	n, bad, worst := 0, 0, uint64(0)
	for sc.Scan() {
		w := strings.Fields(sc.Text())
		v := make([]float64, 4)
		for i := range v {
			v[i], _ = strconv.ParseFloat(w[i+1], 64)
		}
		var a, b float64
		if w[0] == "F" {
			a, b = p.Fwd(v[0], v[1])
		} else {
			a, b = p.Inv(v[0], v[1])
		}
		n++
		if u := max(ulps(a, v[2]), ulps(b, v[3])); u > worst {
			worst = u
		}
		if ulps(a, v[2]) > maxULP || ulps(b, v[3]) > maxULP {
			if bad < 5 {
				t.Errorf("%s %v %v: got %v %v, pyproj %v %v", w[0], v[0], v[1], a, b, v[2], v[3])
			}
			bad++
		}
	}
	if bad > 0 {
		t.Errorf("%d of %d differ by more than %d ulp", bad, n, maxULP)
	}
	t.Logf("%d points, worst %d ulp", n, worst)
}

// maxULP: Go's sin, cos, atan2, asinh, exp are not glibc's; they differ in
// a few last bits (4 ulp at worst here) (a 1e-9 m change in an easting), never more.
const maxULP = 8

func ulps(a, b float64) uint64 {
	x, y := int64(math.Float64bits(a)), int64(math.Float64bits(b))
	if x < y {
		x, y = y, x
	}
	return uint64(x - y)
}
