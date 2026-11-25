package satdop

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// Obs is one Doppler measurement: receiver time t (s since 00:00 GPS time
// of the day), satellite, and the range rate it implies, −c·D/f (m/s).
type Obs struct {
	T    float64
	Sat  string // "G05", "E12", "R21"
	Rate float64
	SNR  float64
}

// carrier is the nominal carrier frequency (Hz) of a satellite's L1/E1/G1
// signal: GPS and Galileo 1575.42 MHz (IS-GPS-200, Galileo OS SIS ICD);
// GLONASS FDMA 1602 MHz + k·562.5 kHz (GLONASS ICD 5.1), k from the RINEX
// header "GLONASS SLOT / FRQ #".
// carrier2 is the second frequency used for the ionosphere-free
// combination: GPS L2 1227.60 MHz, Galileo E5a 1176.45 MHz, GLONASS G2
// 1246 MHz + k·437.5 kHz.
func carrier2(sat string, glo map[string]int) (float64, bool) {
	switch sat[0] {
	case 'G':
		return 1227.60e6, true
	case 'E':
		return 1176.45e6, true
	case 'R':
		k, ok := glo[sat]
		return 1246e6 + float64(k)*437.5e3, ok
	}
	return 0, false
}

func carrier(sat string, glo map[string]int) (float64, bool) {
	switch sat[0] {
	case 'G', 'E':
		return 1575.42e6, true
	case 'R':
		k, ok := glo[sat]
		return 1602e6 + float64(k)*562.5e3, ok
	}
	return 0, false
}

// ReadDoppler reads two carrier phases (cycles) of GPS, Galileo and GLONASS
// from a RINEX 3 observation text: L1C (or L1X), and the second frequency (GPS L2:
// L2W, L2P, L2L, L2X or L2S; Galileo E5a: L5Q, L5X or L5I; GLONASS G2: L2P or
// L2C, the first one present). At the epochs that are multiples of step
// seconds it returns the range rate averaged over the minute around them,
// λ·(L(t+30) − L(t−30))/60 (m/s) on each frequency, combined ionosphere-free:
// (f₁²·r₁ − f₂²·r₂)/(f₁² − f₂²). The receiver counts carrier cycles; the
// count's rate is the Doppler shift (RINEX phase grows with the range). A
// loss-of-lock flag at either end or at the middle epoch, on either
// frequency, drops the point; so does a missing second frequency.
func ReadDoppler(r io.Reader, step int) ([]Obs, error) {
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 1<<20), 1<<20)
	types := map[byte][]string{}
	var last byte
	glo := map[string]int{}
	for sc.Scan() {
		ln := sc.Text()
		lab := ""
		if len(ln) > 60 {
			lab = strings.TrimSpace(ln[60:])
		}
		if lab == "SYS / # / OBS TYPES" {
			body := ln[:min(60, len(ln))]
			if body[0] != ' ' {
				last = body[0]
			}
			types[last] = append(types[last], strings.Fields(body[6:])...)
		} else if lab == "GLONASS SLOT / FRQ #" {
			f := strings.Fields(ln[:min(60, len(ln))])
			if len(f) > 0 && !strings.HasPrefix(f[0], "R") {
				f = f[1:]
			}
			for k := 0; k+1 < len(f); k += 2 {
				v, err := strconv.Atoi(f[k+1])
				if err == nil {
					glo[f[k]] = v
				}
			}
		} else if lab == "END OF HEADER" {
			break
		}
	}
	idx := func(sys byte, name string) int {
		for k, t := range types[sys] {
			if t == name {
				return k
			}
		}
		return -1
	}
	first := func(sys byte, names ...string) int {
		for _, n := range names {
			if k := idx(sys, n); k >= 0 {
				return k
			}
		}
		return -1
	}
	col := map[byte][3]int{}
	for _, s := range []byte{'G', 'E', 'R'} {
		l, n := idx(s, "L1C"), idx(s, "S1C")
		if l < 0 {
			l, n = idx(s, "L1X"), idx(s, "S1X")
		}
		var l2 int
		switch s {
		case 'G':
			l2 = first(s, "L2W", "L2P", "L2L", "L2X", "L2S")
		case 'E':
			l2 = first(s, "L5Q", "L5X", "L5I")
		case 'R':
			l2 = first(s, "L2P", "L2C")
		}
		col[s] = [3]int{l, n, l2}
	}
	field := func(ln string, k int) (float64, byte, bool) {
		a := 3 + 16*k
		if k < 0 || a >= len(ln) {
			return 0, 0, false
		}
		s := strings.TrimSpace(ln[a:min(a+14, len(ln))])
		if s == "" {
			return 0, 0, false
		}
		v, err := strconv.ParseFloat(s, 64)
		lli := byte(' ')
		if a+14 < len(ln) {
			lli = ln[a+14]
		}
		return v, lli, err == nil
	}
	type ph struct {
		L, L2, snr float64
		slip       bool
	}
	at := map[int]map[string]ph{} // epoch (s, 30 s grid) -> satellite -> phase
	var tk int
	ok := false
	skip := 0
	for sc.Scan() {
		ln := sc.Text()
		if skip > 0 {
			skip--
			continue
		}
		if ln == "" {
			continue
		}
		if ln[0] == '>' {
			flag := strings.TrimSpace(sub(ln, 31, 32))
			if flag != "" && flag != "0" && flag != "1" { // event record: the next n lines are header-like text
				n, _ := strconv.Atoi(strings.TrimSpace(sub(ln, 32, 35)))
				skip = n
				ok = false
				continue
			}
			p := strings.Fields(ln[1:])
			if len(p) < 8 {
				return nil, fmt.Errorf("epoch %q", ln)
			}
			h, _ := strconv.Atoi(p[3])
			m, _ := strconv.Atoi(p[4])
			s, _ := strconv.ParseFloat(p[5], 64)
			t := float64(h*3600+m*60) + s
			tk = int(math.Round(t))
			ok = flag != "1" && math.Abs(t-float64(tk)) < 1e-3
			if ok {
				at[tk] = map[string]ph{}
			}
			continue
		}
		if !ok {
			continue
		}
		c, has := col[ln[0]]
		if !has || c[0] < 0 {
			continue
		}
		sat := strings.ReplaceAll(ln[:3], " ", "0")
		L, lli, good := field(ln, c[0])
		if !good || L == 0 {
			continue
		}
		snr, _, has := field(ln, c[1])
		if !has {
			snr = -1 // not recorded
		}
		L2, lli2, good2 := field(ln, c[2])
		if !good2 {
			L2 = 0
		}
		slip := func(b byte) bool { return b != ' ' && b != '0' && (b-'0')&1 == 1 }
		at[tk][sat] = ph{L: L, L2: L2, snr: snr, slip: slip(lli) || (good2 && slip(lli2))}
	}
	if err := sc.Err(); err != nil {
		return nil, err
	}
	var ts []int
	for t := range at {
		if t%step == 0 {
			ts = append(ts, t)
		}
	}
	sort.Ints(ts)
	var out []Obs
	for _, t := range ts {
		a, b := at[t-30], at[t+30]
		if a == nil || b == nil {
			continue
		}
		for sat, p1 := range a {
			p2, ok := b[sat]
			mid, ok2 := at[t][sat]
			if !ok || !ok2 || p2.slip || mid.slip {
				continue
			}
			f, ok := carrier(sat, glo)
			f2, ok2 := carrier2(sat, glo)
			if !ok || !ok2 || p1.L2 == 0 || p2.L2 == 0 {
				continue
			}
			// ionosphere-free: the ionosphere delays the phase by 40.3·TEC/f², so
			// (f1²·r1 − f2²·r2)/(f1² − f2²) cancels it
			r1, r2 := C/f*(p2.L-p1.L)/60, C/f2*(p2.L2-p1.L2)/60
			out = append(out, Obs{T: float64(t), Sat: sat, Rate: (f*f*r1 - f2*f2*r2) / (f*f - f2*f2), SNR: math.Min(p1.snr, p2.snr)})
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].T != out[j].T {
			return out[i].T < out[j].T
		}
		return out[i].Sat < out[j].Sat
	})
	return out, nil
}

// Header reads the APPROX POSITION XYZ of a RINEX observation text (used
// only to report how far the solution landed from it, never as a start).
func headerXYZ(text []byte) [3]float64 {
	var x [3]float64
	for _, ln := range strings.Split(string(text[:min(len(text), 40000)]), "\n") {
		if strings.Contains(ln, "APPROX POSITION XYZ") {
			f := strings.Fields(ln)
			for k := 0; k < 3; k++ {
				x[k], _ = strconv.ParseFloat(f[k], 64)
			}
		}
		if strings.Contains(ln, "END OF HEADER") {
			break
		}
	}
	return x
}

// decompress runs gunzip then crx2rnx (RNXCMP, vendored) on a .crx.gz file.
func decompress(root, path string) ([]byte, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return nil, err
	}
	bin := filepath.Join(root, Crx2rnx)
	if _, err := os.Stat(bin); err != nil {
		return nil, fmt.Errorf("%s missing: make crx2rnx (RNXCMP, tools/third_party/rnxcmp)", Crx2rnx)
	}
	cmd := exec.Command(bin, "-")
	cmd.Stdin = gz
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("crx2rnx %s: %v %s", filepath.Base(path), err, errb.String())
	}
	return out.Bytes(), nil
}
