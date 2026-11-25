// Package parity compares a ported generator's output with the output the
// Python script wrote (epic24). The leading comment block (the generator's
// header) is ignored; below it, text must be identical and numbers either
// identical or one unit apart in their last printed digit, the trace of a
// last-ulp difference between CPython's C library and Go's math package
// (see pymath). Those flips are returned so that a test can pin their
// number and print them, never tolerate them silently.
package parity

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"math/big"
	"os"
	"regexp"
	"strings"
)

// Flip is one last-digit difference.
type Flip struct {
	Line   int
	Go, Py string
}

func (f Flip) String() string {
	return fmt.Sprintf("body line %d: go %s, python %s", f.Line, f.Go, f.Py)
}

// Body drops the leading lines that start with "//".
func Body(s string) string {
	for strings.HasPrefix(s, "//") {
		i := strings.IndexByte(s, '\n')
		if i < 0 {
			return ""
		}
		s = s[i+1:]
	}
	return s
}

var num = regexp.MustCompile(`-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?`)

// Compare returns the last-digit flips between the bodies of got and want,
// or an error describing the first real difference.
func Compare(got, want string) ([]Flip, error) {
	gl := strings.Split(Body(got), "\n")
	wl := strings.Split(Body(want), "\n")
	if len(gl) != len(wl) {
		return nil, fmt.Errorf("%d body lines, python has %d", len(gl), len(wl))
	}
	var flips []Flip
	for i := range gl {
		if gl[i] == wl[i] {
			continue
		}
		gt, gn := split(gl[i])
		wt, wn := split(wl[i])
		if len(gn) != len(wn) || strings.Join(gt, "\x00") != strings.Join(wt, "\x00") {
			return flips, fmt.Errorf("body line %d differs beyond numbers:\n go: %.300s\n py: %.300s", i+1, gl[i], wl[i])
		}
		for j := range gn {
			if gn[j] == wn[j] {
				continue
			}
			if !oneUnit(gn[j], wn[j]) {
				return flips, fmt.Errorf("body line %d: number %s, python %s (more than one unit in the last digit)", i+1, gn[j], wn[j])
			}
			flips = append(flips, Flip{i + 1, gn[j], wn[j]})
		}
	}
	return flips, nil
}

func split(s string) (text, nums []string) {
	last := 0
	for _, m := range num.FindAllStringIndex(s, -1) {
		text = append(text, s[last:m[0]])
		nums = append(nums, s[m[0]:m[1]])
		last = m[1]
	}
	return append(text, s[last:]), nums
}

// oneUnit: same printed precision (decimals and exponent form), values one
// unit of the last decimal apart. Exact decimal arithmetic, no floats.
func oneUnit(a, b string) bool {
	if strings.ContainsAny(a+b, "eE") || decimals(a) != decimals(b) {
		return false
	}
	x, ok1 := new(big.Rat).SetString(a)
	y, ok2 := new(big.Rat).SetString(b)
	if !ok1 || !ok2 {
		return false
	}
	unit := new(big.Rat).SetFrac(big.NewInt(1), new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals(a))), nil))
	d := new(big.Rat).Sub(x, y)
	return d.Abs(d).Cmp(unit) == 0
}

func decimals(s string) int {
	if i := strings.IndexByte(s, '.'); i >= 0 {
		return len(s) - i - 1
	}
	return 0
}

// ReadGolden reads a frozen Python output, gunzipping *.gz.
func ReadGolden(path string) (string, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	if strings.HasSuffix(path, ".gz") {
		r, err := gzip.NewReader(bytes.NewReader(b))
		if err != nil {
			return "", err
		}
		if b, err = io.ReadAll(r); err != nil {
			return "", err
		}
	}
	return string(b), nil
}
