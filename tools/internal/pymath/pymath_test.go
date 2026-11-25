package pymath

import (
	"math"
	"os"
	"strconv"
	"strings"
	"testing"

	"flatorglobe/tools/internal/pyjson"
)

// Values printed by CPython 3.13 (repr).
func TestMatchesCPython(t *testing.T) {
	f := Div(1, 298.257223563)
	cases := map[string]float64{
		"0.017453292519943295":  Radians(1),
		"57.29577951308232":     Degrees(1),
		"0.0033528106647474805": f,
		"0.0066943799901413165": f * (2 - f),
	}
	for want, got := range cases {
		if s := pyjson.Float(got); s != want {
			t.Errorf("got %s, CPython %s", s, want)
		}
	}
}

func TestIntHelpers(t *testing.T) {
	if Mod(-7, 30) != 23 || Mod(7, -30) != -23 || Mod(60, 30) != 0 {
		t.Error("Mod differs from Python %")
	}
	if RoundInt(2.5) != 2 || RoundInt(3.5) != 4 || RoundInt(-2.5) != -2 || RoundInt(1234.49) != 1234 {
		t.Error("RoundInt is not round-half-even")
	}
	if Trunc(-2.7) != -2 || Trunc(2.7) != 2 {
		t.Error("Trunc")
	}
}

// Pairs printed by CPython 3.13 (s, s.title(), s.strip()).
func TestStrings(t *testing.T) {
	for _, c := range [][3]string{
		{"ST. JOHN'S", "St. John'S", "ST. JOHN'S"},
		{"HONOLULU 1", "Honolulu 1", "HONOLULU 1"},
		{"qaanaaq (thule)", "Qaanaaq (Thule)", "qaanaaq (thule)"},
		{"  Mc-murdo ", "  Mc-Murdo ", "Mc-murdo"},
		{"DUMONT D'URVILLE", "Dumont D'Urville", "DUMONT D'URVILLE"},
		{"o'higgins", "O'Higgins", "o'higgins"},
		{"1abc", "1Abc", "1abc"},
		{"ÉVORA", "Évora", "ÉVORA"},
		{"straße", "Straße", "straße"},
		{"ǆemal", "ǅemal", "ǆemal"},
	} {
		if got := Title(c[0]); got != c[1] {
			t.Errorf("Title(%q) = %q, CPython %q", c[0], got, c[1])
		}
		if got := Strip(c[0]); got != c[2] {
			t.Errorf("Strip(%q) = %q, CPython %q", c[0], got, c[2])
		}
	}
	// the 29 characters CPython's isspace() accepts up to U+3000
	n := 0
	for r := rune(0); r <= 0x3000; r++ {
		if IsSpace(r) {
			n++
		}
	}
	if n != 29 || !IsSpace(0x1f) || IsSpace(0x200b) {
		t.Errorf("IsSpace: %d characters", n)
	}
	if f := Fields("a\x1cb  c　"); len(f) != 3 {
		t.Errorf("Fields = %q", f)
	}
}

// "a\nb\r\nc\rd\x0be\x85f\u2028g\n".splitlines() in CPython 3.13
func TestSplitLines(t *testing.T) {
	got := SplitLines("a\nb\r\nc\rd\x0be\u0085f\u2028g\n")
	want := []string{"a", "b", "c", "d", "e", "f", "g"}
	if len(got) != len(want) {
		t.Fatalf("%q", got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("%q", got)
		}
	}
	if l := SplitLines(""); len(l) != 0 {
		t.Errorf("empty: %q", l)
	}
	if l := SplitLines("x\n\ny"); len(l) != 3 || l[1] != "" {
		t.Errorf("blank line: %q", l)
	}
}

// testdata/sum.tsv: lists and CPython 3.13's sum() of them (float.hex).
func TestSumAgainstCPython(t *testing.T) {
	b, err := os.ReadFile("testdata/sum.tsv")
	if err != nil {
		t.Fatal(err)
	}
	n := 0
	for _, l := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		c := strings.Split(l, "\t")
		var xs []float64
		for _, h := range strings.Fields(c[0]) {
			x, _ := strconv.ParseFloat(h, 64)
			xs = append(xs, x)
		}
		want, _ := strconv.ParseFloat(c[1], 64)
		if got := Sum(xs); got != want || math.Signbit(got) != math.Signbit(want) {
			t.Errorf("line %d: Sum = %v, CPython %v", n+1, got, want)
		}
		n++
	}
	if n != 206 {
		t.Fatalf("%d cases", n)
	}
}

// testdata/hypot.tsv: a, b, np.hypot(a, b) (glibc; CPython's math.hypot has its own
// algorithm), a**3 (C pow).
func TestHypotCube(t *testing.T) {
	b, _ := os.ReadFile("testdata/hypot.tsv")
	bad, badCube := 0, 0
	for _, l := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		f := strings.Fields(l)
		v := make([]float64, 5)
		for i := range v {
			v[i], _ = strconv.ParseFloat(f[i], 64)
		}
		if Hypot(v[0], v[1]) != v[2] {
			bad++
		}
		if Cube(v[0]) != v[3] {
			badCube++
		}
	}
	// glibc's pow is not correctly rounded everywhere (about 0.52 ulp):
	// 2 of these 3,000 cubes differ from the correctly rounded value (x*x*x
	// would differ on 766). Pinned, so that a change shows.
	if bad != 0 || badCube != 2 {
		t.Errorf("%d hypot and %d cube results differ from glibc out of 3000 (pinned 0 and 2)", bad, badCube)
	}
}

// testdata/npround.tsv: x, d, round(np.float64(x), d) from numpy 2.2.4.
func TestNpRound(t *testing.T) {
	b, _ := os.ReadFile("testdata/npround.tsv")
	n := 0
	for _, l := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		f := strings.Fields(l)
		x, _ := strconv.ParseFloat(f[0], 64)
		d, _ := strconv.Atoi(f[1])
		want, _ := strconv.ParseFloat(f[2], 64)
		if got := NpRound(x, d); got != want {
			t.Errorf("NpRound(%v, %d) = %v, numpy %v", x, d, got, want)
		}
		n++
	}
	if n != 4000 {
		t.Fatal(n)
	}
}

// testdata/pyhypot.tsv: a, b, CPython 3.13 math.hypot(a, b).
func TestPyHypot(t *testing.T) {
	b, _ := os.ReadFile("testdata/pyhypot.tsv")
	bad := 0
	for _, l := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		f := strings.Fields(l)
		x, _ := strconv.ParseFloat(f[0], 64)
		y, _ := strconv.ParseFloat(f[1], 64)
		want, _ := strconv.ParseFloat(f[2], 64)
		if PyHypot(x, y) != want {
			bad++
		}
	}
	if bad != 0 {
		t.Errorf("%d of 3000 differ from CPython's math.hypot", bad)
	}
}
