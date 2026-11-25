package stats

import (
	"bufio"
	"math/big"
	"os"
	"strconv"
	"strings"
	"testing"
)

// testdata/meanstdev.tsv: 45 lists and their statistics.mean / stdev,
// written as float.hex() by CPython 3.13 (cancellation-prone and tied
// cases included).
func TestAgainstCPython(t *testing.T) {
	f, err := os.Open("testdata/meanstdev.tsv")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	n := 0
	for sc.Scan() {
		c := strings.Split(sc.Text(), "\t")
		var xs []float64
		for _, h := range strings.Fields(c[0]) {
			x, err := strconv.ParseFloat(h, 64)
			if err != nil {
				t.Fatal(err)
			}
			xs = append(xs, x)
		}
		wm, _ := strconv.ParseFloat(c[1], 64)
		ws, _ := strconv.ParseFloat(c[2], 64)
		if m := Mean(xs); m != wm {
			t.Errorf("line %d: mean %v, CPython %v", n+1, m, wm)
		}
		if s := Stdev(xs); s != ws {
			t.Errorf("line %d: stdev %v, CPython %v", n+1, s, ws)
		}
		n++
	}
	if n != 45 {
		t.Fatalf("%d lines", n)
	}
}

func TestSqrtRatExactAndRounded(t *testing.T) {
	for _, c := range []struct {
		num, den int64
		want     float64
	}{{4, 1, 2}, {1, 4, 0.5}, {0, 1, 0}, {9, 16, 0.75}} {
		if got := SqrtRat(big.NewRat(c.num, c.den)); got != c.want {
			t.Errorf("sqrt(%d/%d) = %v", c.num, c.den, got)
		}
	}
	// sqrt(2) correctly rounded is math.Sqrt(2) (IEEE sqrt is exact-rounded)
	if got := SqrtRat(big.NewRat(2, 1)); got != 1.4142135623730951 {
		t.Errorf("sqrt(2) = %v", got)
	}
	huge := new(big.Rat).SetInt(new(big.Int).Lsh(big.NewInt(1), 300))
	if got := SqrtRat(huge); got != 1.427247692705959881058285969449495136382746624e45 {
		t.Errorf("sqrt(2^300) = %v", got)
	}
}

func TestKeepLOO(t *testing.T) {
	xs := []float64{15.7, 15.8, 15.75, 15.72, 17.9, 15.78}
	keep, dropped := KeepLOO(xs, 3, 1.0/60, 3)
	if dropped != 1 || len(keep) != 5 {
		t.Fatalf("keep %v dropped %d", keep, dropped)
	}
	for _, x := range keep {
		if x == 17.9 {
			t.Error("the outlier was kept")
		}
	}
	// too few others: everything kept
	if k, d := KeepLOO([]float64{1, 100, 1}, 3, 0, 3); d != 0 || len(k) != 3 {
		t.Errorf("small sample judged: %v %d", k, d)
	}
	// the floor protects identical values from excluding a near neighbour
	if _, d := KeepLOO([]float64{10, 10, 10, 10, 10.01}, 3, 1.0/60, 3); d != 0 {
		t.Error("floor not applied")
	}
}

func TestMedian(t *testing.T) {
	// statistics.median([3.0, 1.0, 2.0]) = 2.0; ([4.0, 1.0, 3.0, 2.0]) = 2.5; ([0.1, 0.2]) = 0.15000000000000002
	if Median([]float64{3, 1, 2}) != 2 || Median([]float64{4, 1, 3, 2}) != 2.5 || Median([]float64{0.1, 0.2}) != 0.15000000000000002 {
		t.Error("Median differs from statistics.median")
	}
}
