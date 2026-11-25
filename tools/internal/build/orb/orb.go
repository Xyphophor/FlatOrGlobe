// Package orb builds the orb tab's three presets (epic19/UC06, UC08, UC09)
// from the public files in data/orb/raw/ (gitignored). Port of
// scripts/build_orb.py (epic24/UC03).
//
//  1. HARPS-N solar telescope, release 2015-2018 (DACE): the observed radial
//     velocity of the Sun, rv_raw - berv; time = exposure start in the file
//     name (UTC) + half the exposure. Kept: obs_quality >= 0.99 and
//     drs_quality; days with >= 30 points over >= 4 h; every third point.
//  2. HARPS RVBank, tau Ceti: observed RV = RVdrs - BERV, one mean per
//     night; rows more than 500 m/s from the star's -16.54 km/s are dropped
//     (a few carry absurd values, 1.6e7 m/s).
//  3. SDO/HMI RSUN_OBS every 7 days of 2023 (from an ephemeris: a check).
package orb

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Dir     = "data/orb"
	SunTGZ  = Dir + "/raw/harpn_sun_2015_2018.tar.gz"
	StarTSV = Dir + "/raw/rvbank_HD10700.tsv"
	SDOJSON = Dir + "/raw/sdo_rsun_2023.json"
	OutSun  = "src/data/presets/orb-sun.js"
	OutStar = "src/data/presets/orb-star.js"
	OutSDO  = "src/data/presets/orb-sdo.js"
)

var compact = pyjson.Opts{Item: ",", Key: ":", ASCII: true}

func readSunCSV(root string) ([]byte, error) {
	f, err := os.Open(filepath.Join(root, SunTGZ))
	if err != nil {
		return nil, err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return nil, err
	}
	tr := tar.NewReader(gz)
	for {
		h, err := tr.Next()
		if err == io.EOF {
			return nil, fmt.Errorf("%s: no .csv member", SunTGZ)
		}
		if err != nil {
			return nil, err
		}
		if strings.HasSuffix(h.Name, ".csv") && !strings.Contains(h.Name, "/._") {
			return io.ReadAll(tr)
		}
	}
}

type sunPt struct {
	us int64 // µs since epoch, UTC
	v  float64
}

// Sun builds SUN_DAYS.
func Sun(root string) (string, string, error) {
	b, err := readSunCSV(root)
	if err != nil {
		return "", "", err
	}
	recs, err := csv.NewReader(bytes.NewReader(b)).ReadAll()
	if err != nil {
		return "", "", fmt.Errorf("%s: %w", SunTGZ, err)
	}
	col := map[string]int{}
	for i, h := range recs[0] {
		col[h] = i
	}
	for _, c := range []string{"filename", "rv_raw", "berv", "texp", "obs_quality", "drs_quality"} {
		if _, ok := col[c]; !ok {
			return "", "", fmt.Errorf("%s: no column %s", SunTGZ, c)
		}
	}
	days := map[string][]sunPt{}
	for n, r := range recs[1:] {
		g := func(c string) string { return r[col[c]] }
		bad := fmt.Errorf("%s: row %d", SunTGZ, n+2)
		q, err := strconv.ParseFloat(pymath.Strip(g("obs_quality")), 64)
		if err != nil {
			return "", "", bad
		}
		if g("drs_quality") != "True" || q < 0.99 {
			continue
		}
		fn := g("filename")
		if len(fn) < 31 {
			return "", "", bad
		}
		t, err := time.Parse("2006-01-02T15:04:05.999999", fn[8:31])
		if err != nil {
			return "", "", fmt.Errorf("%s: row %d: %w", SunTGZ, n+2, err)
		}
		texp, e1 := strconv.ParseFloat(pymath.Strip(g("texp")), 64)
		rv, e2 := strconv.ParseFloat(pymath.Strip(g("rv_raw")), 64)
		berv, e3 := strconv.ParseFloat(pymath.Strip(g("berv")), 64)
		if e1 != nil || e2 != nil || e3 != nil {
			return "", "", bad
		}
		us := t.UnixMicro() + pymath.Micros(texp/2)
		day := time.UnixMicro(us).UTC().Format("2006-01-02")
		days[day] = append(days[day], sunPt{us, rv - berv})
	}
	keys := make([]string, 0, len(days))
	for k := range days {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var out []any
	npts := 0
	for _, k := range keys {
		pts := days[k]
		sort.Slice(pts, func(i, j int) bool {
			if pts[i].us != pts[j].us {
				return pts[i].us < pts[j].us
			}
			return pts[i].v < pts[j].v
		})
		if len(pts) < 30 || float64(pts[len(pts)-1].us-pts[0].us)/1e6 < 4*3600 {
			continue
		}
		t0 := pts[0].us
		var ps []any
		for i := 0; i < len(pts); i += 3 {
			ps = append(ps, []any{pymath.RoundInt(float64(pts[i].us-t0) / 1e6), pyjson.Round(pts[i].v, 1)})
		}
		npts += len(ps)
		out = append(out, pyjson.Obj{{K: "t0", V: time.UnixMicro(t0).UTC().Format("2006-01-02T15:04:05") + "Z"}, {K: "pts", V: ps}})
	}
	return "export const SUN_DAYS = " + pyjson.Dumps(out, compact) + ";\n", fmt.Sprintf("sun days %d %d", len(out), npts), nil
}

// Star builds TAU_CETI.
func Star(root string) (string, string, error) {
	b, err := os.ReadFile(filepath.Join(root, StarTSV))
	if err != nil {
		return "", "", err
	}
	text := strings.ReplaceAll(strings.ReplaceAll(string(b), "\r\n", "\n"), "\r", "\n")
	type obs struct{ bjd, rv float64 }
	nights := map[int][]obs{}
	for _, l := range strings.SplitAfter(text, "\n") {
		s := strings.Split(strings.TrimRight(l, "\n"), "\t")
		if len(s) < 4 || !strings.HasPrefix(s[0], "HD10700") {
			continue
		}
		bjd, e1 := strconv.ParseFloat(pymath.Strip(s[1]), 64)
		rv, e2 := strconv.ParseFloat(pymath.Strip(s[2]), 64)
		berv, e3 := strconv.ParseFloat(pymath.Strip(s[3]), 64)
		if e1 != nil || e2 != nil || e3 != nil {
			continue
		}
		if math.Abs(rv+16540) > 500 { // a few rows carry absurd RVs (1.6e7 m/s)
			continue
		}
		k := pymath.RoundInt(bjd - 0.5)
		nights[k] = append(nights[k], obs{bjd, rv - float64(berv*1000)})
	}
	keys := make([]int, 0, len(nights))
	for k := range nights {
		keys = append(keys, k)
	}
	sort.Ints(keys)
	out := make([]any, 0, len(keys))
	for _, k := range keys {
		v := nights[k]
		bs, rs := make([]float64, len(v)), make([]float64, len(v))
		for i, o := range v {
			bs[i], rs[i] = o.bjd, o.rv
		}
		n := float64(len(v))
		out = append(out, []float64{pyjson.Round(pymath.Sum(bs)/n, 4), pyjson.Round(pymath.Sum(rs)/n, 1)})
	}
	return "export const TAU_CETI = { ra: 26.0170, dec: -15.9375, nights: " + pyjson.Dumps(out, compact) + " };\n",
		fmt.Sprintf("tau Ceti nights %d", len(out)), nil
}

// SDO builds SDO_RSUN.
func SDO(root string) (string, string, error) {
	b, err := os.ReadFile(filepath.Join(root, SDOJSON))
	if err != nil {
		return "", "", err
	}
	var d struct {
		Keywords []struct {
			Name   string            `json:"name"`
			Values []json.RawMessage `json:"values"`
		} `json:"keywords"`
	}
	if err := json.Unmarshal(b, &d); err != nil {
		return "", "", fmt.Errorf("%s: %w", SDOJSON, err)
	}
	k := map[string][]json.RawMessage{}
	for _, x := range d.Keywords {
		k[x.Name] = x.Values
	}
	tr, rs := k["T_REC"], k["RSUN_OBS"]
	if len(tr) == 0 || len(rs) != len(tr) {
		return "", "", fmt.Errorf("%s: T_REC and RSUN_OBS missing or of different lengths", SDOJSON)
	}
	out := make([]any, len(tr))
	for i := range tr {
		var t string
		if err := json.Unmarshal(tr[i], &t); err != nil || len(t) < 10 {
			return "", "", fmt.Errorf("%s: T_REC[%d]", SDOJSON, i)
		}
		var r float64
		var rsS string
		if json.Unmarshal(rs[i], &rsS) == nil {
			r, err = strconv.ParseFloat(pymath.Strip(rsS), 64)
		} else {
			err = json.Unmarshal(rs[i], &r)
		}
		if err != nil {
			return "", "", fmt.Errorf("%s: RSUN_OBS[%d]", SDOJSON, i)
		}
		out[i] = []any{strings.ReplaceAll(t[:10], ".", "-"), pyjson.Round(r, 3)}
	}
	return "export const SDO_RSUN = " + pyjson.Dumps(out, compact) + ";\n", fmt.Sprintf("sdo %d", len(out)), nil
}

// Files builds the three presets (same bodies as build_orb.py).
func Files(root string) ([]preset.File, string, error) {
	sun, s1, err := Sun(root)
	if err != nil {
		return nil, "", err
	}
	star, s2, err := Star(root)
	if err != nil {
		return nil, "", err
	}
	sdo, s3, err := SDO(root)
	if err != nil {
		return nil, "", err
	}
	return []preset.File{
		{Out: OutSun, Command: "build orb", Inputs: []string{SunTGZ}, Body: sun, Notes: []string{
			"HARPS-N, télescope solaire (La Palma), 2015-2018 : vitesse radiale OBSERVÉE du Soleil,",
			"rv_raw − berv (m/s) (epic19/UC09). pts : [s depuis t0 (UTC), m/s].",
		}},
		{Out: OutStar, Command: "build orb", Inputs: []string{StarTSV}, Body: star, Notes: []string{
			"HARPS (RVBank, Trifonov et al. 2020), tau Ceti : vitesse radiale OBSERVÉE = RVdrs − BERV,",
			"moyenne par nuit (epic19/UC08). [BJD, m/s].",
		}},
		{Out: OutSDO, Command: "build orb", Inputs: []string{SDOJSON}, Body: sdo, Notes: []string{
			"SDO/HMI : rayon apparent du Soleil RSUN_OBS (″), tous les 7 jours de 2023. Calculé par le JSOC",
			"depuis la distance satellite-Soleil (éphéméride) : validation (epic19/UC06).",
		}},
	}, s1 + "; " + s2 + "; " + s3, nil
}
