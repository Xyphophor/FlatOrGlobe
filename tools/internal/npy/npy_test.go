package npy

import (
	"encoding/json"
	"math"
	"os"
	"strconv"
	"testing"
)

type golden struct {
	Arange [][]json.RawMessage `json:"arange"`
	Sum    [][]json.RawMessage `json:"sum"`
	NanStd [][]json.RawMessage `json:"nanstd"`
	Interp [][]string          `json:"interp"`
	Conv   [][]string          `json:"conv"`
}

func hexes(t *testing.T, raw json.RawMessage) []float64 {
	t.Helper()
	var s []*string
	if err := json.Unmarshal(raw, &s); err != nil {
		t.Fatal(err)
	}
	out := make([]float64, len(s))
	for i, h := range s {
		if h == nil {
			out[i] = math.NaN()
			continue
		}
		v, err := strconv.ParseFloat(*h, 64)
		if err != nil {
			t.Fatal(err)
		}
		out[i] = v
	}
	return out
}

func hexList(t *testing.T, s []string) []float64 {
	b, _ := json.Marshal(s)
	return hexes(t, b)
}

func one(t *testing.T, raw json.RawMessage) float64 {
	var h string
	json.Unmarshal(raw, &h)
	v, err := strconv.ParseFloat(h, 64)
	if err != nil {
		t.Fatal(err)
	}
	return v
}

func same(t *testing.T, what string, got, want []float64) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("%s: %d values, numpy %d", what, len(got), len(want))
	}
	for i := range got {
		if got[i] != want[i] && !(math.IsNaN(got[i]) && math.IsNaN(want[i])) {
			t.Fatalf("%s[%d] = %v, numpy %v", what, i, got[i], want[i])
		}
	}
}

// testdata/numpy.json was written by numpy 2.2.4 itself (float.hex).
func TestAgainstNumpy(t *testing.T) {
	b, err := os.ReadFile("testdata/numpy.json")
	if err != nil {
		t.Fatal(err)
	}
	var g golden
	if err := json.Unmarshal(b, &g); err != nil {
		t.Fatal(err)
	}
	for _, c := range g.Arange {
		var s, e, st float64
		json.Unmarshal(c[0], &s)
		json.Unmarshal(c[1], &e)
		json.Unmarshal(c[2], &st)
		same(t, "arange", Arange(s, e, st), hexes(t, c[3]))
	}
	for i, c := range g.Sum {
		if got, want := Sum(hexes(t, c[0])), one(t, c[1]); got != want {
			t.Errorf("sum %d: %v, numpy %v", i, got, want)
		}
	}
	for i, c := range g.NanStd {
		got, _ := NanStd(hexes(t, c[0]))
		if want := one(t, c[1]); got != want {
			t.Errorf("nanstd %d: %v, numpy %v", i, got, want)
		}
	}
	same(t, "interp", Interp(hexList(t, g.Interp[0]), hexList(t, g.Interp[1]), hexList(t, g.Interp[2])), hexList(t, g.Interp[3]))
	x := hexList(t, g.Conv[0])
	same(t, "convolve k=5", RunningMean(x, 5), hexList(t, g.Conv[1]))
	same(t, "convolve k=121", RunningMean(x, 121), hexList(t, g.Conv[2]))
}

func TestArgmaxFirst(t *testing.T) {
	if Argmax([]float64{1, 3, 2, 3}) != 1 {
		t.Error("argmax must return the first maximum")
	}
}

// testdata/argsort.json: arrays full of ties and numpy 2.2.4's argsort of
// them, on this CPU (generic introsort).
func TestArgsortAgainstNumpy(t *testing.T) {
	b, err := os.ReadFile("testdata/argsort.json")
	if err != nil {
		t.Fatal(err)
	}
	var cases [][2][]float64
	if err := json.Unmarshal(b, &cases); err != nil {
		t.Fatal(err)
	}
	for k, c := range cases {
		got := Argsort(c[0])
		for i := range got {
			if float64(got[i]) != c[1][i] {
				t.Fatalf("case %d (n=%d): index %d is %d, numpy %v", k, len(c[0]), i, got[i], c[1][i])
			}
		}
	}
}

// testdata/partition.json: arrays, kth and numpy 2.2.4's np.partition
// result (full order), on this CPU (generic introselect).
func TestPartitionAgainstNumpy(t *testing.T) {
	b, err := os.ReadFile("testdata/partition.json")
	if err != nil {
		t.Fatal(err)
	}
	var cases [][]json.RawMessage
	if err := json.Unmarshal(b, &cases); err != nil {
		t.Fatal(err)
	}
	for i, c := range cases {
		var a, want []float64
		var kth int
		json.Unmarshal(c[0], &a)
		json.Unmarshal(c[1], &kth)
		json.Unmarshal(c[2], &want)
		Partition(a, kth)
		for j := range a {
			if a[j] != want[j] {
				t.Fatalf("case %d (n=%d, kth=%d): position %d is %v, numpy %v", i, len(a), kth, j, a[j], want[j])
			}
		}
	}
}
