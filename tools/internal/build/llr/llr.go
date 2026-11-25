// Package llr builds src/data/presets/moon-llr.js (moon tab, epic19/UC11):
// lunar laser ranging passes of the Apollo 15 reflector, from the monthly
// CRD normal-point files of the open EDC/DGFI archive in data/moon/llr/raw/
// (gitignored). Port of scripts/build_llr.py (epic24/UC03).
//
// Kept: record type 11 (epoch, two-way time of flight) and the station of
// each session (header H2). Sessions join into passes (a gap of more than
// 3 h, or another station, ends a pass); a pass is kept when it lasts at
// least 6 h with at least 6 points. Nothing about the Earth's shape is
// used: the output is times and times of flight; the page fits the radius.
package llr

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Dir    = "data/moon/llr"
	RawDir = Dir + "/raw"
	Out    = "src/data/presets/moon-llr.js"
	Gap    = 3 * 3600 * 1e6 // µs
	MinLen = 6 * 3600 * 1e6 // µs
	MinPts = 6
)

// Years fetched (the script's default range).
var Years = [2]int{2015, 2025}

// URL of the monthly file.
var URL = "https://edc.dgfi.tum.de/pub/slr/data/npt_crd/apollo15/%d/apollo15_%d%02d.npt"

type row struct {
	st  string
	us  int64 // µs since the Unix epoch, UTC
	tof float64
}

// addSeconds is datetime + timedelta(seconds=s) (pymath.Micros).
func addSeconds(day int64, s float64) int64 { return day + pymath.Micros(s) }

func midnight(y, m, d int) int64 {
	return time.Date(y, time.Month(m), d, 0, 0, 0, 0, time.UTC).UnixMicro()
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

// parse reads one CRD file into rows.
func parse(name string, b []byte, rows map[row]bool) error {
	s := string(b)
	if !utf8.ValidString(s) {
		s = strings.ToValidUTF8(s, "") // the script read with errors="ignore"
	}
	s = strings.ReplaceAll(strings.ReplaceAll(s, "\r\n", "\n"), "\r", "\n")
	var st string
	var d0, s0 int64
	haveD0 := false
	for n, l := range strings.Split(s, "\n") {
		p := pymath.Fields(l)
		if len(p) == 0 {
			continue
		}
		bad := func() error { return fmt.Errorf("%s line %d: %q", name, n+1, l) }
		switch strings.ToUpper(p[0]) {
		case "H2":
			st = ""
			for _, x := range p[1:min(3, len(p))] {
				if !isDigits(x) {
					st = x
					break
				}
			}
			if st == "" {
				return bad()
			}
		case "H4":
			if len(p) < 8 {
				return bad()
			}
			var v [5]int
			for i := range v {
				var err error
				if v[i], err = strconv.Atoi(p[2+i]); err != nil {
					return bad()
				}
			}
			sec, err := strconv.ParseFloat(p[7], 64)
			if err != nil {
				return bad()
			}
			d0 = midnight(v[0], v[1], v[2])
			s0 = int64(v[3]*3600+v[4]*60) + int64(sec)
			haveD0 = true
		case "11":
			if !haveD0 {
				continue
			}
			if len(p) < 3 {
				return bad()
			}
			sec, err1 := strconv.ParseFloat(p[1], 64)
			tof, err2 := strconv.ParseFloat(p[2], 64)
			if err1 != nil || err2 != nil {
				return bad()
			}
			day := d0
			if sec < float64(s0-43200) {
				day += 86400 * 1_000_000
			}
			rows[row{st, addSeconds(day, sec), tof}] = true
		}
	}
	return nil
}

// Pass is one kept pass.
type Pass struct {
	St  string
	T0  int64
	Pts [][2]float64
}

// Compute reads every raw file.
func Compute(root string) ([]Pass, int, error) {
	files, err := filepath.Glob(filepath.Join(root, RawDir, "a15_*.npt"))
	if err != nil {
		return nil, 0, err
	}
	if len(files) == 0 {
		return nil, 0, fmt.Errorf("no %s/a15_*.npt (fog fetch moon-llr)", RawDir)
	}
	sort.Strings(files)
	set := map[row]bool{}
	for _, f := range files {
		b, err := os.ReadFile(f)
		if err != nil {
			return nil, 0, err
		}
		if err := parse(filepath.Base(f), b, set); err != nil {
			return nil, 0, err
		}
	}
	rows := make([]row, 0, len(set))
	for r := range set {
		rows = append(rows, r)
	}
	// the script sorted a set by (station, time); there is no tie on both
	// (checked 2026-10-14), the time of flight only makes the order total
	sort.Slice(rows, func(i, j int) bool {
		a, b := rows[i], rows[j]
		if a.st != b.st {
			return a.st < b.st
		}
		if a.us != b.us {
			return a.us < b.us
		}
		return a.tof < b.tof
	})
	var groups [][]row
	var cur []row
	for _, r := range rows {
		if len(cur) > 0 && (r.st != cur[len(cur)-1].st || r.us-cur[len(cur)-1].us > Gap) {
			groups = append(groups, cur)
			cur = nil
		}
		cur = append(cur, r)
	}
	if len(cur) > 0 {
		groups = append(groups, cur)
	}
	var out []Pass
	for _, g := range groups {
		if g[len(g)-1].us-g[0].us < MinLen || len(g) < MinPts {
			continue
		}
		p := Pass{St: g[0].st, T0: g[0].us}
		for _, q := range g {
			p.Pts = append(p.Pts, [2]float64{pyjson.Round(float64(q.us-p.T0)/1e6, 3), pyjson.Round(q.tof, 13)})
		}
		out = append(out, p)
	}
	return out, len(rows), nil
}

// File renders the preset (same body as build_llr.py).
func File(passes []Pass) preset.File {
	list := make([]any, len(passes))
	for i, p := range passes {
		pts := make([]any, len(p.Pts))
		for k, q := range p.Pts {
			pts[k] = []float64{q[0], q[1]}
		}
		t := time.UnixMicro(p.T0).UTC()
		t0 := t.Format("2006-01-02T15:04:05.") + fmt.Sprintf("%03d", t.Nanosecond()/1_000_000) + "Z"
		list[i] = pyjson.Obj{{K: "st", V: p.St}, {K: "t0", V: t0}, {K: "pts", V: pts}}
	}
	return preset.File{
		Out: Out, Command: "build moon-llr", Inputs: []string{Dir + "/inputs.lock"},
		Notes: []string{
			"Laser lunaire, réflecteur Apollo 15 : passages d'au moins 6 h (epic19/UC11).",
			"Points normaux CRD ouverts d'EDC/DGFI (data/moon/llr/raw/, hors git).",
			"pts : [secondes depuis t0, temps de vol aller-retour en secondes]. Rien d'autre.",
		},
		Body: "export const LLR_PASSES = " + pyjson.Dumps(list, pyjson.Opts{Item: ",", Key: ":", ASCII: true}) + ";\n",
	}
}

// Fetch downloads the missing monthly files; a month the archive does not
// have is reported and skipped, as the script did.
func Fetch(ctx context.Context, root string, client *http.Client, log io.Writer) error {
	if client == nil {
		client = &http.Client{Timeout: 30 * time.Second}
	}
	for y := Years[0]; y <= Years[1]; y++ {
		for m := 1; m <= 12; m++ {
			p := filepath.Join(root, RawDir, fmt.Sprintf("a15_%d%02d.npt", y, m))
			if _, err := os.Stat(p); err == nil {
				continue
			}
			req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf(URL, y, y, m), nil)
			if err != nil {
				return err
			}
			resp, err := client.Do(req)
			if err != nil {
				fmt.Fprintf(log, "  skip %d %d: %v\n", y, m, err)
				continue
			}
			b, err := io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil || resp.StatusCode != http.StatusOK {
				fmt.Fprintf(log, "  skip %d %d: HTTP %d %v\n", y, m, resp.StatusCode, err)
				continue
			}
			if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
				return err
			}
			if err := os.WriteFile(p, b, 0o644); err != nil {
				return err
			}
			fmt.Fprintf(log, "  %d-%02d: %d bytes\n", y, m, len(b))
		}
	}
	return nil
}
