// Package ecl builds src/data/presets/ecl.js (eclipse tab, epic09/UC01)
// from the NASA pages (Fred Espenak, eclipse.gsfc.nasa.gov) archived in
// data/ecl/raw/: Besselian elements of 2027, the path tables of 2009,
// 2027 and 2045, the Saros 136 catalogue and the lunar months. No number
// is typed by hand. Port of scripts/build_ecl_data.py (epic24/UC02).
//
// The regular expressions are Python's, unchanged. Two differences between
// the engines do not matter here and are guarded: Go's \s, \d and \S are
// ASCII, Python's Unicode (the pages hold no Unicode space or digit:
// checkText refuses one); and unmatched optional groups are "" in Go,
// None in Python (both read as absent below).
package ecl

import (
	"fmt"
	"html"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf8"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Raw = "data/ecl/raw"
	Out = "src/data/presets/ecl.js"
)

// Inputs, in the order they are read.
var (
	BeselmFile = "SE2027Aug02Tbeselm.html"
	PathFiles  = [][2]string{{"2009", "SE2009Jul22Tpath.html"}, {"2027", "SE2027Aug02Tpath.html"}, {"2045", "SE2045Aug12Tpath.html"}}
	SarosFile  = "SEsaros136.html"
	MonthsFile = "SEsaros.html"
)

var tag = regexp.MustCompile(`<[^>]+>`)

// text is the page without tags, entities decoded.
func text(root, name string) (string, error) {
	b, err := os.ReadFile(filepath.Join(root, Raw, name))
	if err != nil {
		return "", err
	}
	if !utf8.Valid(b) {
		return "", fmt.Errorf("%s: not UTF-8", name)
	}
	s := html.UnescapeString(tag.ReplaceAllString(string(b), ""))
	return s, checkText(name, s)
}

// checkText refuses the characters on which Go's and Python's \s, \d
// would disagree.
func checkText(name, s string) error {
	for _, r := range s {
		if r > 0x7f && (unicode.IsSpace(r) || unicode.IsDigit(r)) {
			return fmt.Errorf("%s: Unicode space or digit %U: Go's regexp classes are ASCII, the port assumes none", name, r)
		}
	}
	return nil
}

func atof(s string) float64 {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		panic(err) // the regular expressions only capture numbers
	}
	return v
}

func atoi(s string) int {
	v, err := strconv.Atoi(s)
	if err != nil {
		panic(err)
	}
	return v
}

// dm: "35 44.6N" → signed decimal degrees, N and E positive.
func dm(d, m, h string) float64 {
	v := float64(atoi(d)) + atof(m)/60
	if h == "S" || h == "W" {
		v = -v
	}
	return pyjson.Round(v, 5)
}

var durRe = regexp.MustCompile(`^(\d+)m(\d+\.?\d*)s`)

// dur: "6m22.6s" → seconds, or nil.
func dur(s string) any {
	m := durRe.FindStringSubmatch(s)
	if m == nil {
		return nil
	}
	return pyjson.Round(float64(atoi(m[1])*60)+atof(m[2]), 1)
}

var rowRe = regexp.MustCompile(`(?m)^\s*(Limits|\d\d:\d\d)\s+` +
	`(\d+) (\d+\.\d)([NS]) (\d+) (\d+\.\d)([EW])\s+` +
	`(\d+) (\d+\.\d)([NS]) (\d+) (\d+\.\d)([EW])\s+` +
	`(\d+) (\d+\.\d)([NS]) (\d+) (\d+\.\d)([EW])\s+` +
	`(\d\.\d+)\s+(\d+)\s+(\d+|-)\s+(\d+)\s+(\S+)`)

// path: north/south limits and central line every 2 min.
func path(root, name string) ([]any, error) {
	t, err := text(root, name)
	if err != nil {
		return nil, err
	}
	var out []any
	for _, m := range rowRe.FindAllStringSubmatch(t, -1) {
		g := m[1:]
		var az any
		if g[21] != "-" {
			az = atoi(g[21])
		}
		out = append(out, pyjson.Obj{
			{K: "t", V: g[0]},
			{K: "n", V: []any{dm(g[1], g[2], g[3]), dm(g[4], g[5], g[6])}},
			{K: "s", V: []any{dm(g[7], g[8], g[9]), dm(g[10], g[11], g[12])}},
			{K: "c", V: []any{dm(g[13], g[14], g[15]), dm(g[16], g[17], g[18])}},
			{K: "ratio", V: atof(g[19])}, {K: "alt", V: atoi(g[20])},
			{K: "az", V: az}, {K: "width", V: atoi(g[22])}, {K: "dur", V: dur(g[23])},
		})
	}
	return out, nil
}

func must(re *regexp.Regexp, t, what string) ([]string, error) {
	m := re.FindStringSubmatch(t)
	if m == nil {
		return nil, fmt.Errorf("%s not found", what)
	}
	return m, nil
}

var (
	tanfRe = regexp.MustCompile(`Tan ƒ1 = ([\d.]+)\s+Tan ƒ2 = ([\d.]+)`)
	geRe   = regexp.MustCompile(`(?s)Greatest Eclipse:\s+Time =\s+([\d:.]+) UT\s+Lat = (\d+)°([\d.]+)'([NS])\s+Long = (\d+)°([\d.]+)'([EW]).*?` +
		`Sun Altitude =\s+([\d.]+)°\s+Path Width =\s+([\d.]+) km.*?Sun Azimuth =\s+([\d.]+)°\s+Central Duration =\s+(\S+)`)
	gdRe = regexp.MustCompile(`(?s)Greatest Duration:\s+Time =\s+([\d:]+) UT\s+Lat =\s+(\d+)°(\d+)'([NS])\s+Long =\s+(\d+)°(\d+)'([EW]).*?` +
		`Sun Altitude =\s+([\d.]+)°\s+Path Width =\s+([\d.]+) km.*?Sun Azimuth =\s+([\d.]+)°\s+Central Duration =\s+(\S+)`)
	scalars = []struct{ key, re string }{
		{"t0TDT", `t0 = ([\d.]+) TDT`}, {"deltaT", `ΔT =\s+([\d.]+) s`},
		{"gamma", `Gamma =\s+(-?[\d.]+)`}, {"magnitude", `Eclipse Magnitude =\s+([\d.]+)`},
		{"k1", `k1 = ([\d.]+)`}, {"k2", `k2 = ([\d.]+)`},
	}
)

func pack(m []string) pyjson.Obj {
	return pyjson.Obj{{K: "ut", V: m[1]}, {K: "lat", V: dm(m[2], m[3], m[4])}, {K: "lon", V: dm(m[5], m[6], m[7])},
		{K: "sunAlt", V: atof(m[8])}, {K: "width", V: atof(m[9])}, {K: "sunAz", V: atof(m[10])}, {K: "dur", V: dur(m[11])}}
}

// besselian: polynomial elements and the eclipse's characteristic points.
func besselian(root, name string) (pyjson.Obj, error) {
	t, err := text(root, name)
	if err != nil {
		return nil, err
	}
	num := `(-?\d+\.\d+)`
	opt := `(?:\s+` + num + `)?`
	var rows [4][]string
	for n := 0; n < 4; n++ {
		re := regexp.MustCompile(fmt.Sprintf(`(?m)^\s*%d\s+%s\s+%s%s%s%s%s\s*$`, n, num, num, opt, opt, opt, opt))
		m, err := must(re, t, fmt.Sprintf("%s: Besselian row %d", name, n))
		if err != nil {
			return nil, err
		}
		rows[n] = m[1:]
	}
	el := pyjson.Obj{}
	for i, k := range []string{"x", "y", "d", "l1", "l2", "mu"} {
		v := []any{}
		for n := 0; n < 4; n++ {
			if rows[n][i] != "" {
				v = append(v, atof(rows[n][i]))
			}
		}
		el = append(el, pyjson.KV{K: k, V: v})
	}
	out := pyjson.Obj{}
	for _, s := range scalars {
		m, err := must(regexp.MustCompile(s.re), t, name+": "+s.key)
		if err != nil {
			return nil, err
		}
		out = append(out, pyjson.KV{K: s.key, V: atof(m[1])})
	}
	tf, err := must(tanfRe, t, name+": tan f1/f2")
	if err != nil {
		return nil, err
	}
	saros, err := must(regexp.MustCompile(`Saros Series =\s+(\d+ \(\d+/\d+\))`), t, name+": saros")
	if err != nil {
		return nil, err
	}
	eph, err := must(regexp.MustCompile(`Ephemerides = (\S+)`), t, name+": ephemerides")
	if err != nil {
		return nil, err
	}
	ge, err := must(geRe, t, name+": greatest eclipse")
	if err != nil {
		return nil, err
	}
	gd, err := must(gdRe, t, name+": greatest duration")
	if err != nil {
		return nil, err
	}
	out = append(out,
		pyjson.KV{K: "tanf1", V: atof(tf[1])}, pyjson.KV{K: "tanf2", V: atof(tf[2])},
		pyjson.KV{K: "saros", V: saros[1]}, pyjson.KV{K: "ephemerides", V: eph[1]},
		pyjson.KV{K: "elements", V: el}, pyjson.KV{K: "greatest", V: pack(ge)}, pyjson.KV{K: "longest", V: pack(gd)})
	return out, nil
}

// partial eclipses have neither width nor duration (empty end of line)
var sarosRe = regexp.MustCompile(`(?m)^\s*(\d{5})\s+(-?\d+)\s+(-?\d{4}) ([A-Z][a-z]{2}) (\d\d)\s+([\d:]+)\s+(-?\d+)\s+(-?\d+)\s+(\w+)\s+` +
	`(-?\d\.\d+)\s+(\d\.\d+)\s+(\d+\.\d)([NS])\s+(\d+\.\d)([EW])\s+(\d+)(?:[ \t]+(\d+|-)[ \t]+(\S+))?[ \t]*$`)

func saros(root, name string) ([]any, error) {
	t, err := text(root, name)
	if err != nil {
		return nil, err
	}
	var rows []any
	for _, m := range sarosRe.FindAllStringSubmatch(t, -1) {
		g := m[1:]
		lat, lon := atof(g[11]), atof(g[13])
		if g[12] == "S" {
			lat *= -1
		}
		if g[14] == "W" {
			lon *= -1
		}
		var width, d any
		if g[16] != "" && g[16] != "-" {
			width = atoi(g[16])
		}
		if g[17] != "" {
			d = dur(g[17])
		}
		rows = append(rows, pyjson.Obj{
			{K: "seq", V: atoi(g[0])}, {K: "rel", V: atoi(g[1])}, {K: "date", V: g[2] + " " + g[3] + " " + g[4]},
			{K: "td", V: g[5]}, {K: "deltaT", V: atoi(g[6])}, {K: "luna", V: atoi(g[7])}, {K: "type", V: g[8]},
			{K: "gamma", V: atof(g[9])}, {K: "mag", V: atof(g[10])}, {K: "lat", V: lat}, {K: "lon", V: lon},
			{K: "sunAlt", V: atoi(g[15])}, {K: "width", V: width}, {K: "dur", V: d},
		})
	}
	return rows, nil
}

func months(root, name string) (pyjson.Obj, error) {
	t, err := text(root, name)
	if err != nil {
		return nil, err
	}
	out := pyjson.Obj{}
	for _, k := range [][2]string{{"synodic", "Synodic Month"}, {"anomalistic", "Anomalistic Month"}, {"draconic", "Draconic Month"},
		{"saros223syn", "223 Synodic Months"}, {"saros239anom", "239 Anomalistic Months"}, {"saros242drac", "242 Draconic Months"}} {
		m, err := must(regexp.MustCompile(k[1]+`[^=]*=\s+([\d.]+) days`), t, name+": "+k[1])
		if err != nil {
			return nil, err
		}
		out = append(out, pyjson.KV{K: k[0], V: atof(m[1])})
	}
	return out, nil
}

// Result of a build.
type Result struct {
	Data  pyjson.Obj // ECL_2027, ECL_PATHS, SAROS136, LUNAR_MONTHS, in that order
	Paths map[string]int
	Saros int
}

// Compute reads the pages and applies the script's two sanity checks.
func Compute(root string) (*Result, error) {
	bes, err := besselian(root, BeselmFile)
	if err != nil {
		return nil, err
	}
	paths := pyjson.Obj{}
	counts := map[string]int{}
	for _, p := range PathFiles {
		v, err := path(root, p[1])
		if err != nil {
			return nil, err
		}
		if len(v) <= 40 {
			return nil, fmt.Errorf("%s: only %d path rows (more than 40 expected)", p[1], len(v))
		}
		counts[p[0]] = len(v)
		paths = append(paths, pyjson.KV{K: p[0], V: v})
	}
	sr, err := saros(root, SarosFile)
	if err != nil {
		return nil, err
	}
	if len(sr) != 71 {
		return nil, fmt.Errorf("%s: %d members of Saros 136, 71 expected", SarosFile, len(sr))
	}
	mo, err := months(root, MonthsFile)
	if err != nil {
		return nil, err
	}
	return &Result{
		Data:  pyjson.Obj{{K: "ECL_2027", V: bes}, {K: "ECL_PATHS", V: paths}, {K: "SAROS136", V: sr}, {K: "LUNAR_MONTHS", V: mo}},
		Paths: counts, Saros: len(sr),
	}, nil
}

// File renders the preset (same body as build_ecl_data.py).
func (r *Result) File() preset.File {
	var b strings.Builder
	for _, kv := range r.Data {
		b.WriteString("export const " + kv.K + " = " + pyjson.Dumps(kv.V, pyjson.Compact) + ";\n")
	}
	inputs := []string{Raw + "/" + BeselmFile}
	for _, p := range PathFiles {
		inputs = append(inputs, Raw+"/"+p[1])
	}
	inputs = append(inputs, Raw+"/"+SarosFile, Raw+"/"+MonthsFile)
	return preset.File{
		Out: Out, Command: "build ecl", Inputs: inputs,
		Notes: []string{"Pages NASA (Fred Espenak) archivées dans data/ecl/raw/ ; sources et date de consultation : data/ecl/README.md."},
		Body:  b.String(),
	}
}

// Summary is the script's report line.
func (r *Result) Summary() string {
	return fmt.Sprintf("2009 %d pts, 2027 %d pts, 2045 %d pts, saros 136: %d members", r.Paths["2009"], r.Paths["2027"], r.Paths["2045"], r.Saros)
}
