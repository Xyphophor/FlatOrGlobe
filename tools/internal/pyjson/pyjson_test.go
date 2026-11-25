package pyjson

import (
	"bufio"
	"encoding/json"
	"math"
	"os"
	"strconv"
	"strings"
	"testing"
)

// testdata/floats.tsv was written by CPython 3 (float.hex, repr, round to
// 4, 2 and 0 decimals) for ~3,000 values: hand-picked edge cases, random
// uniforms, values on rounding ties, minutes/60 like the Krakatoa times,
// and random bit patterns over the whole double range.
func TestGoldenAgainstCPython(t *testing.T) {
	f, err := os.Open("testdata/floats.tsv")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	n := 0
	for sc.Scan() {
		c := strings.Split(sc.Text(), "\t")
		x, err := strconv.ParseFloat(c[0], 64)
		if err != nil {
			t.Fatalf("parse %q: %v", c[0], err)
		}
		if got := Float(x); got != c[1] {
			t.Errorf("Float(%s) = %s, CPython repr %s", c[0], got, c[1])
		}
		for i, nd := range []int{4, 2, 0} {
			if got := Float(Round(x, nd)); got != c[2+i] {
				t.Errorf("round(%s, %d) = %s, CPython %s", c[1], nd, got, c[2+i])
			}
		}
		n++
	}
	if n < 3000 {
		t.Fatalf("only %d golden lines", n)
	}
}

func TestFloatSpecials(t *testing.T) {
	for v, want := range map[float64]string{math.Inf(1): "Infinity", math.Inf(-1): "-Infinity"} {
		if got := Float(v); got != want {
			t.Errorf("Float(%v) = %s", v, got)
		}
	}
	if got := Float(math.NaN()); got != "NaN" {
		t.Errorf("NaN -> %s", got)
	}
}

// Expected strings printed by CPython's json.dumps (see the commands in
// tasks/epic24/UC01.org).
func TestDumps(t *testing.T) {
	v := []any{"a\"\\/<>&\x01\x7fé\U0001F600\n\t\b\f\r",
		Obj{{"k", nil}, {"b", true}, {"x", []any{1, 2.0}}}}
	want := `["a\"\\/<>&\u0001\u007f\u00e9\ud83d\ude00\n\t\b\f\r", {"k": null, "b": true, "x": [1, 2.0]}]`
	if got := Dumps(v, Default); got != want {
		t.Errorf("Default:\n got %s\nwant %s", got, want)
	}
	want = "[\"é😀\\u001f\"]"
	if got := Dumps([]string{"é\U0001F600\x1f"}, Compact); got != want {
		t.Errorf("Compact:\n got %s\nwant %s", got, want)
	}
	var p *float64
	q := 8.2333
	if got := Dumps([]any{p, &q, []bool{false}, []float64{}}, Compact); got != "[null,8.2333,[false],[]]" {
		t.Errorf("pointers/slices: %s", got)
	}
}

func TestDumpsPanicsOnUnknownType(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Fatal("no panic for map")
		}
	}()
	Dumps(map[string]int{"a": 1}, Default)
}

// Expected strings printed by CPython 3.13.
func TestIndentAndNumbers(t *testing.T) {
	v := Obj{{"a", []any{1, 2.0, []any{}, Obj{}}}, {"b", Obj{{"c", nil}, {"d", "S\u00e3o"}}}, {"e", []any{}}}
	want := "{\n \"a\": [\n  1,\n  2.0,\n  [],\n  {}\n ],\n \"b\": {\n  \"c\": null,\n  \"d\": \"S\\u00e3o\"\n },\n \"e\": []\n}"
	if got := Dumps(v, Indented(1)); got != want {
		t.Errorf("indent=1:\n got %q\nwant %q", got, want)
	}
	if got := Dumps(Obj{{"x", []any{[]int{1, 2}}}}, Indented(2)); got != "{\n  \"x\": [\n    [\n      1,\n      2\n    ]\n  ]\n}" {
		t.Errorf("indent=2: %q", got)
	}
	// json.loads("[385, 385.0, 1e3, 12345678901234567890, -0, -0.0, 1.5E-7]") re-dumped
	nums := []any{json.Number("385"), json.Number("385.0"), json.Number("1e3"), json.Number("12345678901234567890"),
		json.Number("-0"), json.Number("-0.0"), json.Number("1.5E-7")}
	if got := Dumps(nums, Default); got != "[385, 385.0, 1000.0, 12345678901234567890, 0, -0.0, 1.5e-07]" {
		t.Errorf("numbers: %s", got)
	}
}
