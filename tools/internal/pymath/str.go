package pymath

import (
	"strings"
	"unicode"
)

// IsSpace is Python's str.isspace() for one character (wider than Go's
// unicode.IsSpace: it includes the separators U+001C..U+001F).
func IsSpace(r rune) bool {
	switch r {
	case '\t', '\n', '\v', '\f', '\r', 0x1c, 0x1d, 0x1e, 0x1f, ' ', 0x85, 0xa0,
		0x1680, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000:
		return true
	}
	return r >= 0x2000 && r <= 0x200a
}

// Strip is str.strip() without argument.
func Strip(s string) string { return strings.TrimFunc(s, IsSpace) }

// Fields is str.split() without argument.
func Fields(s string) []string { return strings.FieldsFunc(s, IsSpace) }

func cased(r rune) bool { return unicode.IsUpper(r) || unicode.IsLower(r) || unicode.IsTitle(r) }

// Title is str.title(): a cased character following a cased one is
// lowered, any other cased character is title-cased ("ST. JOHN'S" ->
// "St. John'S", as Python does). Python's few one-to-many mappings
// (a leading "ß" -> "Ss") are not reproduced; the place names read here
// have none.
func Title(s string) string {
	var b strings.Builder
	prev := false
	for _, r := range s {
		if cased(r) {
			if prev {
				r = unicode.ToLower(r)
			} else {
				r = unicode.ToTitle(r)
			}
			prev = true
		} else {
			prev = false
		}
		b.WriteRune(r)
	}
	return b.String()
}

// SplitLines is str.splitlines(): it breaks on \n, \r, \r\n, \v, \f,
// \x1c, \x1d, \x1e, \x85, \u2028 and \u2029, and drops them.
func SplitLines(s string) []string {
	var out []string
	start := 0
	rs := []rune(s)
	b := 0 // byte offset of rs[i]
	for i := 0; i < len(rs); i++ {
		r := rs[i]
		size := len(string(r))
		switch r {
		case '\n', '\r', '\v', '\f', 0x1c, 0x1d, 0x1e, 0x85, 0x2028, 0x2029:
			out = append(out, s[start:b])
			end := b + size
			if r == '\r' && i+1 < len(rs) && rs[i+1] == '\n' {
				i++
				end++
			}
			start = end
			b = end
			continue
		}
		b += size
	}
	if start < len(s) {
		out = append(out, s[start:])
	}
	return out
}
