// Package igra computes the refraction coefficient k of the air actually measured by the world's radiosondes (ref tab,
// epic34/UC04, 2026-10-28): every sounding of 2026 in the Integrated Global Radiosonde Archive, version 2 (IGRA 2,
// NOAA NCEI; Durre, Yin, Vose, Applequist & Arnfield 2018, J. Climate 31:3471 for the data, Durre, Vose & Wuertz 2006,
// J. Climate 19:53 for its quality control).
//
// k is the ratio of a horizontal ray's curvature to the Earth's, k = R/ρ, and for visible light (ref tab, Torge,
// Geodesy) k = 503 · P/T² · (0.0342 + dT/dh), P in hPa, T in K, dT/dh in K/m. A sounding gives P, T and the
// geopotential height of each level, so it gives dT/dh layer by layer. Two layers:
//
//   - the low layer, from the surface to the first level 50 to 300 m above it: the air that a sightline near the
//     ground crosses, the one the page's tabs use k for;
//   - the first kilometre, from the surface to the level nearest 1,000 m above it (700 to 1,300 m): the air a
//     sightline between two summits crosses, on average.
//
// Water vapour is left out: for visible light it changes n − 1 by under 1 % (Ciddor 1996, Appl. Opt. 35:1566).
// Each sounding is called day or night from the Sun's elevation at the station at launch (NOAA's low-precision
// solar position, Meeus ch. 25 abridged: ±0.1°, enough to sort day from night).
//
// Rule 10: k is a ratio to the Earth's curvature, so the radius enters as its unit (503 = R · 78.8 × 10⁻⁶ with
// R = 6,371 km): a check. The ray's curvature itself, 1/ρ = k/R, comes from the lab formula and the measured air only.
// k = 1 is the air that would make the globe look flat (R/(1 − k) infinite); the fraction of soundings that reach it
// is counted.
package igra

import (
	"archive/zip"
	"bufio"
	"context"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Raw inputs, relative to the repository root.
const (
	RawDir   = "data/ref/igra/raw"
	Stations = RawDir + "/igra2-station-list.txt"
	Out      = "src/data/presets/ref-igra.js"
	BaseURL  = "https://www.ncei.noaa.gov/data/integrated-global-radiosonde-archive/"
)

const d2r = math.Pi / 180

// K is the refraction coefficient of a layer from its two ends (P hPa, T K, z m).
func K(p0, t0, z0, p1, t1, z1 float64) float64 {
	P, T := (p0+p1)/2, (t0+t1)/2
	return 503 * P / (T * T) * (0.0342 + (t1-t0)/(z1-z0))
}

// sunElev is the Sun's elevation (deg) at (lat, lon) at a UT instant: declination and equation of time from the
// mean longitude and anomaly (Meeus ch. 25, low precision).
func sunElev(lat, lon float64, t time.Time) float64 {
	d := float64(t.Unix())/86400 + 2440587.5 - 2451545.0
	g := (357.529 + 0.98560028*d) * d2r
	q := 280.459 + 0.98564736*d
	L := (q + 1.915*math.Sin(g) + 0.020*math.Sin(2*g)) * d2r
	e := (23.439 - 0.00000036*d) * d2r
	ra := math.Atan2(math.Cos(e)*math.Sin(L), math.Cos(L))
	dec := math.Asin(math.Sin(e) * math.Sin(L))
	gmst := math.Mod(18.697374558+24.06570982441908*d, 24) * 15 * d2r
	ha := gmst + lon*d2r - ra
	return math.Asin(math.Sin(lat*d2r)*math.Sin(dec)+math.Cos(lat*d2r)*math.Cos(dec)*math.Cos(ha)) / d2r
}

type level struct{ p, t, z float64 } // hPa, K, m

// Sounding is one launch, reduced.
type Sounding struct {
	Day       bool
	KLow, K1k float64 // NaN when the layer is missing
}

// Station sums one station.
type Station struct {
	ID, Name       string
	Lat, Lon, Elev float64
	S              []Sounding
}

type stInfo struct {
	name           string
	lat, lon, elev float64
}

func readStations(path string) (map[string]stInfo, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	out := map[string]stInfo{}
	for _, ln := range strings.Split(string(b), "\n") {
		if len(ln) < 71 {
			continue
		}
		f := func(a, b int) float64 { v, _ := strconv.ParseFloat(strings.TrimSpace(ln[a:b]), 64); return v }
		out[ln[0:11]] = stInfo{strings.TrimSpace(ln[41:71]), f(12, 20), f(21, 30), f(31, 37)}
	}
	return out, nil
}

func num(s string) (float64, bool) {
	v, err := strconv.Atoi(strings.TrimSpace(s))
	if err != nil || v == -9999 || v == -8888 {
		return 0, false
	}
	return float64(v), true
}

// reduce turns one sounding's levels into its two k values.
func reduce(lv []level, surf int) (float64, float64) {
	kl, k1 := math.NaN(), math.NaN()
	if surf < 0 || math.IsNaN(lv[surf].z) {
		return kl, k1
	}
	s := lv[surf]
	best1 := math.Inf(1)
	for i, l := range lv {
		if i == surf || l.p >= s.p {
			continue
		}
		dz := l.z - s.z
		if math.IsNaN(dz) {
			continue
		}
		if math.IsNaN(kl) && dz >= 50 && dz <= 300 && l.p < s.p {
			kl = K(s.p, s.t, s.z, l.p, l.t, l.z)
		}
		if dz >= 700 && dz <= 1300 && math.Abs(dz-1000) < best1 {
			best1 = math.Abs(dz - 1000)
			k1 = K(s.p, s.t, s.z, l.p, l.t, l.z)
		}
	}
	return kl, k1
}

// readZip reads one IGRA 2 station file (header records "#ID YYYY MM DD HH ..." and fixed-column level records).
func readZip(path string, info map[string]stInfo) ([]Sounding, string, error) {
	zr, err := zip.OpenReader(path)
	if err != nil {
		return nil, "", err
	}
	defer zr.Close()
	var out []Sounding
	id := ""
	for _, zf := range zr.File {
		rc, err := zf.Open()
		if err != nil {
			return nil, "", err
		}
		sc := bufio.NewScanner(rc)
		sc.Buffer(make([]byte, 1<<16), 1<<20)
		var lv []level
		surf := -1
		var when time.Time
		var lat, lon float64
		flush := func() {
			if len(lv) > 0 && !when.IsZero() && surf >= 0 {
				// heights: the surface at the station's elevation when not printed, then the hypsometric equation
				// z₂ = z₁ + (R_d/g) T̄ ln(p₁/p₂) for every level without a geopotential height (R_d/g = 29.27 m/K)
				if math.IsNaN(lv[surf].z) {
					if in, ok := info[id]; ok && in.elev > -998 {
						lv[surf].z = in.elev
					}
				}
				for i := surf + 1; i < len(lv); i++ {
					if math.IsNaN(lv[i].z) && !math.IsNaN(lv[i-1].z) {
						lv[i].z = lv[i-1].z + 29.27*(lv[i].t+lv[i-1].t)/2*math.Log(lv[i-1].p/lv[i].p)
					}
				}
				// levels in order of falling pressure: the surface first
				kl, k1 := reduce(lv, surf)
				if !math.IsNaN(kl) || !math.IsNaN(k1) {
					out = append(out, Sounding{Day: sunElev(lat, lon, when) > 0, KLow: kl, K1k: k1})
				}
			}
			lv, surf = lv[:0], -1
		}
		for sc.Scan() {
			ln := sc.Text()
			if strings.HasPrefix(ln, "#") {
				flush()
				if len(ln) < 71 {
					when = time.Time{}
					continue
				}
				id = ln[1:12]
				y, _ := strconv.Atoi(ln[13:17])
				mo, _ := strconv.Atoi(ln[18:20])
				dd, _ := strconv.Atoi(ln[21:23])
				hh, _ := strconv.Atoi(ln[24:26])
				rel, okr := num(ln[27:31]) // release time HHMM, 9999 missing
				if hh == 99 {
					when = time.Time{}
					continue
				}
				mi := 0
				if okr && rel != 9999 && int(rel)%100 < 60 && int(rel)/100 < 24 {
					hh, mi = int(rel)/100, int(rel)%100
				}
				when = time.Date(y, time.Month(mo), dd, hh, mi, 0, 0, time.UTC)
				la, _ := num(ln[55:62])
				lo, _ := num(ln[63:71])
				lat, lon = la/10000, lo/10000
				continue
			}
			if len(ln) < 28 {
				continue
			}
			p, okp := num(ln[9:15])
			z, okz := num(ln[16:21])
			t, okt := num(ln[22:27])
			flag := ln[15]
			if !okp || !okt || p <= 0 || (ln[27] != ' ' && ln[27] != 'A' && ln[27] != 'B') || (flag != ' ' && flag != 'A' && flag != 'B') {
				continue
			}
			if !okz || (ln[21] != ' ' && ln[21] != 'A' && ln[21] != 'B') {
				z = math.NaN()
			}
			if len(lv) > 0 && p/100 >= lv[len(lv)-1].p { // levels must climb: pressure strictly falling
				continue
			}
			if ln[1] == '1' {
				surf = len(lv)
			}
			lv = append(lv, level{p / 100, t/10 + 273.15, z})
		}
		flush()
		rc.Close()
		if err := sc.Err(); err != nil {
			return nil, "", fmt.Errorf("%s: %w", path, err)
		}
	}
	return out, id, nil
}

// Result is the whole computation.
type Result struct {
	Stations []Station
	N        int
	Inputs   []string
}

// Compute reads every station file.
func Compute(root string) (*Result, error) {
	info, err := readStations(filepath.Join(root, Stations))
	if err != nil {
		return nil, err
	}
	files, err := filepath.Glob(filepath.Join(root, RawDir, "*-data-beg2026.txt.zip"))
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, fmt.Errorf("no %s/*-data-beg2026.txt.zip (fog fetch ref-igra)", RawDir)
	}
	sort.Strings(files)
	r := &Result{Inputs: []string{Stations}}
	for _, f := range files {
		rel, _ := filepath.Rel(root, f)
		r.Inputs = append(r.Inputs, filepath.ToSlash(rel))
		ss, id, err := readZip(f, info)
		if err != nil {
			return nil, err
		}
		if len(ss) < 30 {
			continue
		}
		in := info[id]
		r.Stations = append(r.Stations, Station{ID: id, Name: in.name, Lat: in.lat, Lon: in.lon, Elev: in.elev, S: ss})
		r.N += len(ss)
	}
	return r, nil
}

func quant(x []float64, q float64) float64 {
	if len(x) == 0 {
		return math.NaN()
	}
	y := append([]float64(nil), x...)
	sort.Float64s(y)
	i := q * float64(len(y)-1)
	lo := int(math.Floor(i))
	if lo+1 >= len(y) {
		return y[lo]
	}
	return y[lo] + (i-float64(lo))*(y[lo+1]-y[lo])
}

func frac(x []float64, f func(float64) bool) float64 {
	n := 0
	for _, v := range x {
		if f(v) {
			n++
		}
	}
	return float64(n) / float64(len(x))
}

// pick returns the k values of a layer, day or night or both.
func pick(ss []Sounding, low bool, day int) []float64 {
	var out []float64
	for _, s := range ss {
		if (day == 1 && !s.Day) || (day == 0 && s.Day) {
			continue
		}
		v := s.K1k
		if low {
			v = s.KLow
		}
		if !math.IsNaN(v) {
			out = append(out, v)
		}
	}
	return out
}

func r3(x float64) any {
	if math.IsNaN(x) {
		return nil
	}
	return pyjson.Round(x, 3)
}

// Summary is fog build's report.
func (r *Result) Summary() string {
	var all, k1 []float64
	for _, s := range r.Stations {
		all = append(all, pick(s.S, true, -1)...)
		k1 = append(k1, pick(s.S, false, -1)...)
	}
	return fmt.Sprintf("%d stations, %d soundings; low layer: median k %.3f (IQR %.3f to %.3f), k < 0 %.1f %%, k ≥ 1 %.1f %%; first km: median %.3f",
		len(r.Stations), r.N, quant(all, .5), quant(all, .25), quant(all, .75), 100*frac(all, func(v float64) bool { return v < 0 }),
		100*frac(all, func(v float64) bool { return v >= 1 }), quant(k1, .5))
}

// File writes per-station medians and quartiles, histograms of k (day and night) and latitude bands.
func (r *Result) File() preset.File {
	st := []any{}
	var lowD, lowN, k1D, k1N []float64
	for _, s := range r.Stations {
		ld, ln, kd, kn := pick(s.S, true, 1), pick(s.S, true, 0), pick(s.S, false, 1), pick(s.S, false, 0)
		lowD, lowN, k1D, k1N = append(lowD, ld...), append(lowN, ln...), append(k1D, kd...), append(k1N, kn...)
		la := pick(s.S, true, -1)
		if len(la) < 30 {
			continue
		}
		st = append(st, []any{s.ID, s.Name, pyjson.Round(s.Lat, 2), pyjson.Round(s.Lon, 2), pyjson.Round(s.Elev, 0), len(la),
			r3(quant(ld, .5)), r3(quant(ln, .5)), r3(quant(la, .25)), r3(quant(la, .75)), r3(quant(pick(s.S, false, -1), .5)),
			pyjson.Round(frac(la, func(v float64) bool { return v < 0 }), 3), pyjson.Round(frac(la, func(v float64) bool { return v >= 1 }), 3)})
	}
	hist := func(x []float64) []any {
		h := make([]int, 61) // −1 to +2 by 0.05, the ends gather what lies beyond
		for _, v := range x {
			i := int(math.Floor((v + 1) / 0.05))
			if i < 0 {
				i = 0
			}
			if i > 60 {
				i = 60
			}
			h[i]++
		}
		out := []any{}
		for _, v := range h {
			out = append(out, v)
		}
		return out
	}
	sumObj := func(x []float64) pyjson.Obj {
		return pyjson.Obj{{K: "n", V: len(x)}, {K: "q1", V: r3(quant(x, .25))}, {K: "med", V: r3(quant(x, .5))}, {K: "q3", V: r3(quant(x, .75))},
			{K: "p5", V: r3(quant(x, .05))}, {K: "p95", V: r3(quant(x, .95))},
			{K: "neg", V: pyjson.Round(frac(x, func(v float64) bool { return v < 0 }), 4)},
			{K: "ge1", V: pyjson.Round(frac(x, func(v float64) bool { return v >= 1 }), 4)}, {K: "hist", V: hist(x)}}
	}
	obj := pyjson.Obj{
		{K: "stations", V: len(st)}, {K: "soundings", V: r.N},
		{K: "lowDay", V: sumObj(lowD)}, {K: "lowNight", V: sumObj(lowN)},
		{K: "kmDay", V: sumObj(k1D)}, {K: "kmNight", V: sumObj(k1N)},
	}
	var b strings.Builder
	b.WriteString("export const REF_IGRA = " + pyjson.Dumps(obj, pyjson.Compact) + ";\n")
	b.WriteString("// [id, name, lat, lon, elev m, n, k low day, k low night, q1, q3, k first km, share k<0, share k>=1]\nexport const REF_IGRA_ST = [\n")
	for _, row := range st {
		b.WriteString(" " + pyjson.Dumps(row, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{
		Out: Out, Command: "build ref-igra",
		Inputs: r.Inputs,
		Notes: []string{"Refraction coefficient k = 503 P/T² (0.0342 + dT/dh) from every 2026 sounding of IGRA 2 (NOAA NCEI);",
			"low layer: surface to the first level 50-300 m above; km: surface to the level nearest 1,000 m above.",
			"hist: counts in bins of 0.05 from k = -1 to +2 (first and last bins gather what lies beyond)."},
		Body: b.String(),
	}
}

// Fetch downloads the station list and every station file of the current year (data-y2d), once.
func Fetch(ctx context.Context, root string, client *http.Client, log io.Writer) error {
	if client == nil {
		client = &http.Client{Timeout: 5 * time.Minute}
	}
	dir := filepath.Join(root, RawDir)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	get := func(url, dst string) error {
		if _, err := os.Stat(dst); err == nil {
			return nil
		}
		req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
		if err != nil {
			return err
		}
		resp, err := client.Do(req)
		if err != nil {
			return err
		}
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			return fmt.Errorf("%s: HTTP %d", url, resp.StatusCode)
		}
		tmp := dst + ".part"
		f, err := os.Create(tmp)
		if err != nil {
			return err
		}
		if _, err := io.Copy(f, resp.Body); err != nil {
			f.Close()
			return err
		}
		f.Close()
		return os.Rename(tmp, dst)
	}
	if err := get(BaseURL+"doc/igra2-station-list.txt", filepath.Join(root, Stations)); err != nil {
		return err
	}
	req, _ := http.NewRequestWithContext(ctx, "GET", BaseURL+"access/data-y2d/", nil)
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	page, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		return err
	}
	names := regexp.MustCompile(`href="([A-Z0-9]{11}-data-beg2026\.txt\.zip)"`).FindAllSubmatch(page, -1)
	fmt.Fprintf(log, "ref-igra: %d station files\n", len(names))
	for i, m := range names {
		n := string(m[1])
		if err := get(BaseURL+"access/data-y2d/"+n, filepath.Join(dir, n)); err != nil {
			return err
		}
		if i%50 == 0 {
			fmt.Fprintf(log, "  %d/%d %s\n", i, len(names), n)
		}
	}
	return nil
}
