// Package mag builds the mag tab's measured-field dataset (epic12) from
// data/mag/: sources.json (the ONLY file to edit to add a source), the raw
// pages and API answers under raw/, and the official IGRF-14 file. Port of
// scripts/build_mag_obs.py (epic24/UC02). It writes
// src/data/presets/mag-obs.js (MAG_OBS rows + MAG_OBS_SOURCES),
// src/data/presets/igrf14.js and data/mag/measurements.csv.
//
// Per source (adapter named by its "kind"), every record becomes one row:
// site code, name, geodetic lat, lon (E+, -180..180), decimal year,
// measured I (deg, down +), measured F (nT or none) and a quality tag (the
// WDC mean code for observatories, R / O for repeat / one-off survey
// stations, C for a CSV). One row per site and source is kept: the latest
// inside the source's "years" window. The globe side is never fitted: its
// numbers all come from IGRF-14. Raw files are read, never fetched, here:
// that is fetch.go (fog fetch mag-obs).
package mag

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"html"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Dir       = "data/mag"
	Manifest  = Dir + "/sources.json"
	RawDir    = Dir + "/raw"
	FormPage  = RawDir + "/annual_means.html" // the WDC form: the list of observatories
	IGRFFile  = Dir + "/igrf14coeffs.txt"
	IGRFURL   = "https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf14coeffs.txt"
	OutObs    = "src/data/presets/mag-obs.js"
	OutIGRF   = "src/data/presets/igrf14.js"
	OutCSV    = Dir + "/measurements.csv"
	defRadius = 0.3
)

// Source is one entry of sources.json.
type Source struct {
	Key         string   `json:"key"`
	Kind        string   `json:"kind"`
	Name        string   `json:"name"`
	Years       [2]int   `json:"years"`
	MeanCodes   []int    `json:"mean_codes,omitempty"`
	Types       []string `json:"types,omitempty"`
	File        string   `json:"file,omitempty"`
	MergeRadius *float64 `json:"merge_radius,omitempty"`
	Cite        string   `json:"cite"`
	URL         string   `json:"url"`
}

// Row is one normalised record.
type Row struct {
	Src, Code, Name string
	Lat, Lon, Year  Num
	I               Num
	F               *Num
	Q               any // int mean code, or "R" / "O" / "M" / "A" / "C"
	site            *[2]float64
}

// counts keeps the order the script's dict had.
type counts []pyjson.KV

func (c *counts) inc(k string) {
	for i := range *c {
		if (*c)[i].K == k {
			(*c)[i].V = (*c)[i].V.(int) + 1
			return
		}
	}
	*c = append(*c, pyjson.KV{K: k, V: 1})
}

// ReadSources reads the manifest strictly.
func ReadSources(root string) ([]Source, error) {
	b, err := os.ReadFile(filepath.Join(root, Manifest))
	if err != nil {
		return nil, err
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields()
	var ss []Source
	if err := dec.Decode(&ss); err != nil {
		return nil, fmt.Errorf("%s: %w", Manifest, err)
	}
	for _, s := range ss {
		if _, ok := adapters[s.Kind]; !ok {
			return nil, fmt.Errorf("%s: source %q: unknown kind %q", Manifest, s.Key, s.Kind)
		}
		if s.Key == "" || s.Cite == "" {
			return nil, fmt.Errorf("%s: every source needs a key and a cite", Manifest)
		}
	}
	return ss, nil
}

var adapters = map[string]func(root string, s Source) ([]Row, counts, error){
	"wdc-annual-means": adaptAnnualMeans,
	"wdc-survey":       adaptSurvey,
	"csv":              adaptCSV,
}

// ---- adapter: WDC observatory annual means ---------------------------------

const dmRe = `(-?\d+)\s*&deg;?\s*(-?\d+)'`

var (
	optionRe = regexp.MustCompile(`<option[^>]*>\s*([A-Z0-9]{3,4})\s+([^<\n]+)`)
	latRe    = regexp.MustCompile(`Latitude\s*=\s*` + dmRe)
	lonRe    = regexp.MustCompile(`Longitude\s*=\s*` + dmRe)
	trRe     = regexp.MustCompile(`(?is)<TR>(.*?)</TR>`)
	tdRe     = regexp.MustCompile(`(?is)<TD[^>]*>(.*?)</TD>`)
	anyTag   = regexp.MustCompile(`<[^>]*>`)
	yearRe   = regexp.MustCompile(`^\d{4}\.\d$`)
)

// dm: degrees + minutes as the WDC prints them; the sign sits on the
// minutes when the degrees are 0 ("0 -58.4").
func dm(deg, minutes string) (float64, error) {
	d, err := strconv.Atoi(deg)
	if err != nil {
		return 0, err
	}
	m, err := strconv.ParseFloat(minutes, 64)
	if err != nil {
		return 0, err
	}
	s := 1.0
	if strings.HasPrefix(deg, "-") || strings.HasPrefix(minutes, "-") {
		s = -1
	}
	if d < 0 {
		d = -d
	}
	return s * (float64(d) + math.Abs(m)/60), nil
}

// Listing reads the observatories offered by the WDC form, in its order.
func Listing(page string) [][2]string {
	var out [][2]string
	for _, m := range optionRe.FindAllStringSubmatch(page, -1) {
		out = append(out, [2]string{m[1], pymath.Strip(html.UnescapeString(m[2]))})
	}
	return out
}

type obsRow struct {
	year, I float64
	H, F    int
	MC      *int
}

type obsPage struct {
	lat, lon float64
	rows     []obsRow
}

func isDigits(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

// ParseObs reads one cached observatory answer (nil: no position found).
func ParseObs(text string) *obsPage {
	la, lo := latRe.FindStringSubmatch(text), lonRe.FindStringSubmatch(text)
	if la == nil || lo == nil {
		return nil
	}
	lat, err1 := dm(la[1], la[2])
	lon, err2 := dm(lo[1], lo[2])
	if err1 != nil || err2 != nil {
		return nil
	}
	p := &obsPage{lat: lat, lon: lon}
	for _, tr := range trRe.FindAllStringSubmatch(text, -1) {
		var c []string
		for _, td := range tdRe.FindAllStringSubmatch(tr[1], -1) {
			c = append(c, pymath.Strip(html.UnescapeString(anyTag.ReplaceAllString(td[1], ""))))
		}
		// '', Year, D°, D', H, I°, I', X, Y, Z, F, MC, Note
		if len(c) < 12 || !yearRe.MatchString(c[1]) {
			continue
		}
		year, err := strconv.ParseFloat(c[1], 64)
		if err != nil {
			continue
		}
		I, err := dm(c[5], c[6])
		if err != nil {
			continue
		}
		H, err := strconv.Atoi(c[4])
		if err != nil {
			continue
		}
		F, err := strconv.Atoi(c[10])
		if err != nil {
			continue
		}
		r := obsRow{year: year, I: I, H: H, F: F}
		if isDigits(c[11]) {
			mc, _ := strconv.Atoi(c[11])
			r.MC = &mc
		}
		p.rows = append(p.rows, r)
	}
	return p
}

func adaptAnnualMeans(root string, s Source) ([]Row, counts, error) {
	page, err := os.ReadFile(filepath.Join(root, FormPage))
	if err != nil {
		return nil, nil, fmt.Errorf("%w (fog fetch mag-obs)", err)
	}
	y0, y1 := float64(s.Years[0]), float64(s.Years[1])+0.5
	codes := map[int]bool{}
	mcs := s.MeanCodes
	if len(mcs) == 0 {
		mcs = []int{1, 2, 4}
	}
	for _, c := range mcs {
		codes[c] = true
	}
	listed := Listing(string(page))
	cnt := counts{{K: "listed", V: len(listed)}, {K: "fetch_failed", V: 0}, {K: "no_mean_in_window", V: 0}, {K: "unusable", V: 0}}
	var out []Row
	for _, l := range listed {
		code, name := l[0], l[1]
		b, err := os.ReadFile(filepath.Join(root, RawDir, s.Key, code+".html"))
		if os.IsNotExist(err) {
			cnt.inc("fetch_failed") // listed, never fetched (or the fetch failed)
			continue
		}
		if err != nil {
			return nil, nil, err
		}
		ob := ParseObs(string(b))
		inWin := func(r obsRow) bool { return y0 <= r.year && r.year <= y1 }
		seen := false
		if ob != nil {
			for _, r := range ob.rows {
				seen = seen || inWin(r)
			}
		}
		if !seen {
			cnt.inc("no_mean_in_window")
			continue
		}
		var best *obsRow
		for i := range ob.rows {
			r := ob.rows[i]
			if inWin(r) && r.MC != nil && codes[*r.MC] && r.F > 0 && math.Abs(r.I) <= 90 &&
				((r.H != 0 && r.H != 99999) || math.Abs(r.I) > 89) {
				if best == nil || r.year > best.year {
					best = &ob.rows[i]
				}
			}
		}
		if best == nil {
			cnt.inc("unusable") // only preliminary/incomplete years, or F-only
			continue
		}
		F := Num{F: float64(best.F), Int: true}
		out = append(out, Row{Code: code, Name: pymath.Title(name), Lat: fl(ob.lat), Lon: lon180(fl(ob.lon)),
			Year: fl(best.year), I: fl(best.I), F: &F, Q: *best.MC})
	}
	return out, cnt, nil
}

// ---- adapter: WDC global geomagnetic survey (API) --------------------------

// SurveyTypes maps the API's record types to the quality tag.
var SurveyTypes = []struct{ Type, Tag string }{
	{"repeat-station", "R"}, {"one-off", "O"}, {"marine-vector", "M"}, {"aeromag", "A"},
}

func surveyTag(t string) (string, bool) {
	for _, x := range SurveyTypes {
		if x.Type == t {
			return x.Tag, true
		}
	}
	return "", false
}

// SurveyFile is the cached API answer of one type.
func SurveyFile(s Source, t string) string {
	return fmt.Sprintf("%s/%s/%s-%d-%d.json", RawDir, s.Key, t, s.Years[0], s.Years[1])
}

type surveyRec struct {
	Station   string      `json:"station"`
	Year      json.Number `json:"year"`
	Latitude  json.Number `json:"latitude"`
	Longitude json.Number `json:"longitude"`
	I         json.Number `json:"i"`
	F         json.Number `json:"f"`
}

func adaptSurvey(root string, s Source) ([]Row, counts, error) {
	types := s.Types
	if len(types) == 0 {
		types = []string{"repeat-station"}
	}
	cnt := counts{{K: "records", V: 0}, {K: "without_I", V: 0}}
	var out []Row
	for _, t := range types {
		tag, ok := surveyTag(t)
		if !ok {
			return nil, nil, fmt.Errorf("source %s: unknown survey type %q", s.Key, t)
		}
		b, err := os.ReadFile(filepath.Join(root, SurveyFile(s, t)))
		if err != nil {
			return nil, nil, fmt.Errorf("%w (fog fetch mag-obs)", err)
		}
		dec := json.NewDecoder(bytes.NewReader(b))
		dec.UseNumber()
		var doc struct {
			Data []surveyRec `json:"global-survey-data"`
		}
		if err := dec.Decode(&doc); err != nil {
			return nil, nil, fmt.Errorf("%s: %w", SurveyFile(s, t), err)
		}
		cnt[0].V = cnt[0].V.(int) + len(doc.Data)
		for _, r := range doc.Data {
			I, err1 := numOf(r.I)
			lat, err2 := numOf(r.Latitude)
			lon, err3 := numOf(r.Longitude)
			year, err4 := numOf(r.Year)
			F, err5 := numOf(r.F)
			if err1 != nil || err2 != nil || err3 != nil || err4 != nil || err5 != nil {
				return nil, nil, fmt.Errorf("%s: station %q: a number is missing or malformed", SurveyFile(s, t), r.Station)
			}
			if !(math.Abs(I.F) <= 90) { // 999.999 = element not measured
				cnt.inc("without_I")
				continue
			}
			var fp *Num
			if F.F < 90000 {
				fp = &F
			}
			// the same station appears under several spellings: a site is
			// its position (0.01 deg, ~1 km)
			site := [2]float64{lat.Round(2).F, lon.Round(2).F}
			out = append(out, Row{Code: r.Station, Name: pymath.Title(pymath.Strip(r.Station)), Lat: lat, Lon: lon180(lon),
				Year: year, I: I, F: fp, Q: tag, site: &site})
		}
	}
	return out, cnt, nil
}

// ---- adapter: local CSV -----------------------------------------------------

func adaptCSV(root string, s Source) ([]Row, counts, error) {
	b, err := os.ReadFile(filepath.Join(root, Dir, s.File))
	if err != nil {
		return nil, nil, err
	}
	recs, err := csv.NewReader(bytes.NewReader(b)).ReadAll()
	if err != nil || len(recs) == 0 {
		return nil, nil, fmt.Errorf("%s: %v", s.File, err)
	}
	col := map[string]int{}
	for i, h := range recs[0] {
		col[h] = i
	}
	for _, c := range []string{"code", "name", "lat", "lon", "year", "I"} {
		if _, ok := col[c]; !ok {
			return nil, nil, fmt.Errorf("%s: no column %q", s.File, c)
		}
	}
	var out []Row
	for n, r := range recs[1:] {
		f := func(c string) (float64, error) { return strconv.ParseFloat(pymath.Strip(r[col[c]]), 64) }
		lat, e1 := f("lat")
		lon, e2 := f("lon")
		year, e3 := f("year")
		I, e4 := f("I")
		if e1 != nil || e2 != nil || e3 != nil || e4 != nil {
			return nil, nil, fmt.Errorf("%s line %d: lat, lon, year and I must be numbers", s.File, n+2)
		}
		row := Row{Code: r[col["code"]], Name: r[col["name"]], Lat: fl(lat), Lon: lon180(fl(lon)), Year: fl(year), I: fl(I), Q: "C"}
		if i, ok := col["F"]; ok && r[i] != "" {
			v, err := strconv.ParseFloat(pymath.Strip(r[i]), 64)
			if err != nil {
				return nil, nil, fmt.Errorf("%s line %d: F: %w", s.File, n+2, err)
			}
			F := fl(v)
			row.F = &F
		}
		out = append(out, row)
	}
	return out, counts{{K: "records", V: len(out)}}, nil
}

// onePerSite keeps the latest record per site. Survey rows carry an
// explicit site key; the others merge any two sites closer than radius
// degrees (a renamed or moved observatory: SFS/SFS3, DED/JCO, ESA/MIZ).
func onePerSite(rows []Row, radius float64) []Row {
	rows = append([]Row(nil), rows...)
	sort.SliceStable(rows, func(i, j int) bool { return rows[i].Year.F < rows[j].Year.F })
	allSite := len(rows) > 0
	for _, r := range rows {
		allSite = allSite && r.site != nil
	}
	if allSite {
		// a dict keyed by site: first insertion fixes the position, the
		// last record wins
		pos := map[[2]float64]int{}
		var out []Row
		for _, r := range rows {
			if i, ok := pos[*r.site]; ok {
				out[i] = r
				continue
			}
			pos[*r.site] = len(out)
			out = append(out, r)
		}
		return out
	}
	var kept []Row
	for _, o := range rows {
		next := kept[:0:0]
		for _, s := range kept {
			if !(math.Abs(s.Lat.F-o.Lat.F) < radius && math.Abs(s.Lon.F-o.Lon.F) < radius) {
				next = append(next, s)
			}
		}
		kept = append(next, o)
	}
	return kept
}

// Result of a build.
type Result struct {
	Rows []Row
	Meta []pyjson.Obj
	IGRF string // body of igrf14.js
	Log  []string
}

// Compute runs every source of the manifest, then parses IGRF-14.
func Compute(root string) (*Result, error) {
	igrf, epochs, err := buildIGRF(root)
	if err != nil {
		return nil, err
	}
	srcs, err := ReadSources(root)
	if err != nil {
		return nil, err
	}
	res := &Result{IGRF: igrf, Log: []string{fmt.Sprintf("IGRF-14: %d epochs", epochs)}}
	for _, s := range srcs {
		recs, cnt, err := adapters[s.Kind](root, s)
		if err != nil {
			return nil, fmt.Errorf("source %s: %w", s.Key, err)
		}
		radius := defRadius
		if s.MergeRadius != nil {
			radius = *s.MergeRadius
		}
		rows := onePerSite(recs, radius)
		cnt = append(cnt, pyjson.KV{K: "merged_same_site", V: len(recs) - len(rows)}) // older record, or same site under another code
		for i := range rows {
			rows[i].Src = s.Key
		}
		sort.SliceStable(rows, func(i, j int) bool { return -rows[i].Lat.F < -rows[j].Lat.F })
		res.Rows = append(res.Rows, rows...)
		var years any
		south := 0
		if len(rows) > 0 {
			lo, hi := rows[0].Year, rows[0].Year
			for _, r := range rows[1:] {
				if r.Year.F < lo.F {
					lo = r.Year
				}
				if r.Year.F > hi.F {
					hi = r.Year
				}
			}
			years = []any{lo.JSON(), hi.JSON()}
		}
		for _, r := range rows {
			if r.Lat.F < 0 {
				south++
			}
		}
		res.Meta = append(res.Meta, pyjson.Obj{{K: "key", V: s.Key}, {K: "kind", V: s.Kind}, {K: "name", V: s.Name},
			{K: "n", V: len(rows)}, {K: "years", V: years}, {K: "south", V: south}, {K: "counts", V: pyjson.Obj(cnt)},
			{K: "cite", V: s.Cite}, {K: "url", V: s.URL}})
		res.Log = append(res.Log, fmt.Sprintf("%s: %d sites (%d south of the equator)", s.Key, len(rows), south))
	}
	return res, nil
}

var epochRe = regexp.MustCompile(`^\d{4}\.0$`)

// buildIGRF: degree-1/2 Gauss coefficients of every IGRF-14 epoch, and the
// secular variation after the last one, copied as printed in the file.
func buildIGRF(root string) (string, int, error) {
	b, err := os.ReadFile(filepath.Join(root, IGRFFile))
	if err != nil {
		return "", 0, fmt.Errorf("%w (fog fetch mag-obs)", err)
	}
	lines := strings.Split(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n")
	var hdr []string
	coef := map[string][]string{}
	for _, l := range lines {
		p := pymath.Fields(l)
		if hdr == nil && strings.HasPrefix(l, "g/h") {
			hdr = p
		}
		if len(p) >= 3 && strings.Contains("gh", p[0]) && isDigits(p[1]) {
			m, err := strconv.Atoi(p[2])
			if err != nil {
				continue
			}
			n, _ := strconv.Atoi(p[1])
			coef[fmt.Sprintf("%s:%d:%d", p[0], n, m)] = p
		}
	}
	if hdr == nil {
		return "", 0, fmt.Errorf("%s: no g/h header line", IGRFFile)
	}
	keys := []string{"g:1:0", "g:1:1", "h:1:1", "g:2:0", "g:2:1", "h:2:1", "g:2:2", "h:2:2"}
	for _, k := range keys {
		if len(coef[k]) != len(hdr) {
			return "", 0, fmt.Errorf("%s: coefficient %s missing or short", IGRFFile, k)
		}
	}
	var out strings.Builder
	out.WriteString("export const IGRF14 = [\n")
	n := 0
	for i, h := range hdr {
		if !epochRe.MatchString(h) {
			continue
		}
		n++
		y, _ := strconv.ParseFloat(h, 64)
		vals := make([]string, len(keys))
		for j, k := range keys {
			vals[j] = coef[k][i]
		}
		fmt.Fprintf(&out, "  [%d, %s],\n", int(y), strings.Join(vals, ", "))
	}
	out.WriteString("];\n// Secular variation after the last epoch, nT/yr, same order (g10 ... h22).\n")
	sv := make([]string, len(keys))
	for j, k := range keys {
		sv[j] = coef[k][len(coef[k])-1]
	}
	out.WriteString("export const IGRF14_SV = [" + strings.Join(sv, ", ") + "];\n")
	return out.String(), n, nil
}

// csvField quotes like Python's csv.writer (QUOTE_MINIMAL).
func csvField(s string) string {
	if strings.ContainsAny(s, ",\"\r\n") {
		return `"` + strings.ReplaceAll(s, `"`, `""`) + `"`
	}
	return s
}

// Files renders the three outputs (same bodies as build_mag_obs.py).
func (r *Result) Files() []preset.File {
	var csvb strings.Builder
	csvb.WriteString("src,code,name,lat,lon,year,I,F,q\r\n")
	rows := make([]string, 0, len(r.Rows))
	opts := pyjson.Opts{Item: ", ", Key: ": ", ASCII: false}
	for _, o := range r.Rows {
		F, Fjs := "", any(nil)
		if o.F != nil {
			F = o.F.Str()
			Fjs = pymath.RoundInt(o.F.F)
		}
		q := fmt.Sprint(o.Q)
		cells := []string{o.Src, o.Code, o.Name, o.Lat.Str(), o.Lon.Str(), o.Year.Str(), o.I.Str(), F, q}
		for i := range cells {
			cells[i] = csvField(cells[i])
		}
		csvb.WriteString(strings.Join(cells, ",") + "\r\n")
		rows = append(rows, "  "+pyjson.Dumps([]any{o.Src, o.Code, o.Name, o.Lat.Round(3).JSON(), o.Lon.Round(3).JSON(),
			o.Year.Round(2).JSON(), o.I.Round(3).JSON(), Fjs, o.Q}, opts)+",")
	}
	meta := make([]any, len(r.Meta))
	for i, m := range r.Meta {
		meta[i] = m
	}
	obs := "export const MAG_OBS_SOURCES = " + pyjson.Dumps(meta, pyjson.Opts{Item: ",", Key: ": ", Indent: 1}) + ";\n" +
		"export const MAG_OBS = [\n" + strings.Join(rows, "\n") + "\n];\n"
	inputs := []string{Manifest, Dir + "/inputs.lock"}
	return []preset.File{
		{Out: OutIGRF, Command: "build mag-obs", Inputs: []string{IGRFFile}, Body: r.IGRF, Notes: []string{
			"Official IGRF-14 file (" + IGRFURL + ", cached as " + IGRFFile + ").",
			"Degree 1 and 2 Gauss coefficients, nT: [year, g10, g11, h11, g20, g21, h21, g22, h22].",
		}},
		{Out: OutObs, Command: "build mag-obs", Inputs: inputs, Body: obs, Notes: []string{
			"Measured magnetic inclination (and total field) -- one row per site and source (epic12):",
			"[source key, site code, name, geodetic lat, lon (E+), year, I (deg, down +), F (nT or null), quality]",
			"quality: WDC mean code for observatories (1 all days, 2 quiet days, 4 absolute obs only),",
			"R repeat station, O one-off survey station, M marine, A aeromagnetic, C from a CSV file.",
		}},
		{Out: OutCSV, Command: "build mag-obs", Body: csvb.String(), NoHeader: true},
	}
}
