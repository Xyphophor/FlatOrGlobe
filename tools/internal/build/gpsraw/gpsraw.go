// Package gpsraw builds src/data/presets/gps-raw.js (epic16/UC03): station
// positions solved FROM RAW GPS PSEUDORANGES, and which satellites each
// station sees. Port of scripts/build_gps_raw.py (epic24/UC04).
//
// One day (2025-04-10), the 34 IGS stations of data/gps/stations.txt. For
// each: the daily RINEX 3 observation file (30 s, Hatanaka-compressed, BKG
// open archive) is decompressed by RNXCMP's crx2rnx (vendored C,
// tools/third_party/rnxcmp, built by `make crx2rnx`); every 5 minutes the
// receiver position and clock are solved FROM THE ORIGIN of the coordinate
// system (no header position) by Gauss-Newton on the iono-free combination
// of the GPS C1/C2 pseudoranges above 10°: light time, satellite clock and
// relativity from the broadcast message, Sagnac rotation, Saastamoinen
// troposphere. The day's positions are averaged; the residuals kept; and,
// per 5-minute bin, the satellites each station tracked (no orbit used).
package gpsraw

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
	"time"

	"flatorglobe/tools/internal/npy"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Dir      = "data/gps"
	RawDir   = Dir + "/raw"
	Stations = Dir + "/stations.txt"
	Out      = "src/data/presets/gps-raw.js"
	Day      = "2025-04-10"
	Crx2rnx  = "tools/bin/crx2rnx"
	C        = 299792458.0
	Step     = 300  // one fix every 5 minutes
	Mask     = 10.0 // elevation mask, degrees
)

// IS-GPS-200 values (the broadcast message's own constants), rounded as
// Python rounds them.
var (
	MU     = 3.986005e14
	OmegaE = 7.2921151467e-5
	F1, F2 = 1575.42e6, 1227.60e6
	AWGS   = 6378137.0
	FWGS   = pymath.Div(1, 298.257223563)
	E2     = FWGS * (2 - FWGS)
	F1s    = F1 * F1
	F2s    = F2 * F2
	C2     = C * C
)

func dfloat(s string) float64 {
	s = pymath.Strip(strings.NewReplacer("D", "E", "d", "e").Replace(s))
	if s == "" {
		return 0
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		panic(fmt.Sprintf("navigation value %q", s))
	}
	return v
}

func pyModF(a, b float64) float64 {
	m := math.Mod(a, b)
	if m != 0 && (m < 0) != (b < 0) {
		m += b
	}
	return m
}

var gpsEpoch = time.Date(1980, 1, 6, 0, 0, 0, 0, time.UTC)

// gpsSeconds is (seconds of the GPS week, week).
func gpsSeconds(y, mo, d, h, mi int, s float64) (float64, int) {
	t := time.Date(y, time.Month(mo), d, h, mi, 0, 0, time.UTC).Sub(gpsEpoch)
	secs := int64(t / time.Second)
	return pyModF(float64(secs)+s, 604800), int(secs / 604800)
}

// Eph is one GPS broadcast ephemeris.
type Eph struct {
	PRN                                       int
	Toc, Af0, Af1, Af2, Crs, Dn, M0, Cuc, Ecc float64
	Cus, Sqa, Toe, Cic, Om0, Cis, I0, Crc, W  float64
	Omd, Idot, Health, Tgd                    float64
}

func cut(s string, a, b int) string {
	if a >= len(s) {
		return ""
	}
	return s[a:min(b, len(s))]
}

func atoi(s string) int {
	v, err := strconv.Atoi(pymath.Strip(s))
	if err != nil {
		panic(fmt.Sprintf("integer %q", s))
	}
	return v
}

// ReadNav reads the GPS records of a RINEX 3 multi-GNSS navigation file.
func ReadNav(path string) (eph map[int][]Eph, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("%s: %v", filepath.Base(path), r)
		}
	}()
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return nil, err
	}
	b, err := io.ReadAll(gz)
	if err != nil {
		return nil, err
	}
	lines := strings.SplitAfter(string(b), "\n")
	i := 0
	for ; i < len(lines); i++ {
		if strings.Contains(lines[i], "END OF HEADER") {
			i++
			break
		}
	}
	var recs [][]string
	for ; i < len(lines); i++ {
		ln := lines[i]
		if ln == "" {
			continue
		}
		if strings.ContainsRune("GRECJIS", rune(ln[0])) && isDigits(pymath.Strip(cut(ln, 1, 3))) {
			recs = append(recs, []string{ln})
		} else if len(recs) > 0 {
			recs[len(recs)-1] = append(recs[len(recs)-1], ln)
		}
	}
	eph = map[int][]Eph{}
	for _, r := range recs {
		if r[0][0] != 'G' || len(r) < 8 {
			continue
		}
		h := r[0]
		prn := atoi(cut(h, 1, 3))
		toc, _ := gpsSeconds(atoi(cut(h, 4, 8)), atoi(cut(h, 9, 11)), atoi(cut(h, 12, 14)), atoi(cut(h, 15, 17)), atoi(cut(h, 18, 20)), float64(atoi(cut(h, 21, 23))))
		var v []float64
		for k := 0; k < 3; k++ {
			v = append(v, dfloat(cut(h, 23+19*k, 42+19*k)))
		}
		for _, ln := range r[1:8] {
			for k := 0; k < 4; k++ {
				v = append(v, dfloat(cut(ln, 4+19*k, 23+19*k)))
			}
		}
		eph[prn] = append(eph[prn], Eph{PRN: prn, Toc: toc, Af0: v[0], Af1: v[1], Af2: v[2], Crs: v[4], Dn: v[5], M0: v[6],
			Cuc: v[7], Ecc: v[8], Cus: v[9], Sqa: v[10], Toe: v[11], Cic: v[12], Om0: v[13], Cis: v[14], I0: v[15], Crc: v[16],
			W: v[17], Omd: v[18], Idot: v[19], Health: v[24], Tgd: v[25]})
	}
	return eph, nil
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

func pick(eph map[int][]Eph, prn int, t float64) *Eph {
	var best *Eph
	bd := 0.0
	es := eph[prn]
	for i := range es {
		e := &es[i]
		if e.Health != 0 {
			continue
		}
		dtk := pyModF(t-e.Toe+302400, 604800) - 302400
		if best == nil || math.Abs(dtk) < bd {
			best, bd = e, math.Abs(dtk)
		}
	}
	if best != nil && bd < 4*3600 {
		return best
	}
	return nil
}

// satState: ECEF position (m) at GPS time t (s of week) and clock offset
// (s), IS-GPS-200 Table 20-IV.
func satState(e *Eph, t float64) ([3]float64, float64) {
	a := e.Sqa * e.Sqa
	tk := pyModF(t-e.Toe+302400, 604800) - 302400
	n := math.Sqrt(MU/pymath.Cube(a)) + e.Dn
	M := e.M0 + float64(n*tk)
	E := M
	for k := 0; k < 12; k++ {
		E = M + float64(e.Ecc*math.Sin(E))
	}
	nu := math.Atan2(float64(math.Sqrt(1-float64(e.Ecc*e.Ecc))*math.Sin(E)), math.Cos(E)-e.Ecc)
	phi := nu + e.W
	s2, c2 := math.Sin(2*phi), math.Cos(2*phi)
	du := float64(e.Cus*s2) + float64(e.Cuc*c2)
	dr := float64(e.Crs*s2) + float64(e.Crc*c2)
	di := float64(e.Cis*s2) + float64(e.Cic*c2)
	u := phi + du
	r := float64(a*(1-float64(e.Ecc*math.Cos(E)))) + dr
	i := e.I0 + float64(e.Idot*tk) + di
	xp, yp := r*math.Cos(u), r*math.Sin(u)
	om := e.Om0 + float64((e.Omd-OmegaE)*tk) - float64(OmegaE*e.Toe)
	ci, si, co, so := math.Cos(i), math.Sin(i), math.Cos(om), math.Sin(om)
	x := float64(xp*co) - float64(float64(yp*ci)*so)
	y := float64(xp*so) + float64(float64(yp*ci)*co)
	z := yp * si
	dtc := pyModF(t-e.Toc+302400, 604800) - 302400
	rel := float64(float64(float64(2*math.Sqrt(MU*a))*e.Ecc)*math.Sin(E)) / C2
	clk := float64(e.Af0+float64(e.Af1*dtc)) + float64(e.Af2*float64(dtc*dtc)) - rel
	return [3]float64{x, y, z}, clk
}

// ---- observations -------------------------------------------------------------

// Epoch is one kept epoch: GPS seconds of week and {prn: (P1, P2)} in file order.
type Epoch struct {
	Sow  float64
	PRNs []int
	P    map[int][2]float64
}

// ReadObs reads a RINEX 3 observation text: the epochs every Step s with
// both pseudoranges, and per 5-minute bin the PRNs with a first
// pseudorange (all epochs).
func ReadObs(text string) ([]Epoch, []int, map[int][]int, error) {
	lines := strings.SplitAfter(text, "\n")
	var types []string
	i := 0
	for ; i < len(lines); i++ {
		ln := lines[i]
		lab := pymath.Strip(cut(ln, 60, len(ln)))
		if lab == "SYS / # / OBS TYPES" && ln[0] == 'G' {
			types = pymath.Fields(cut(ln, 7, 60))
			n := atoi(cut(ln, 3, 6))
			for len(types) < n {
				i++
				types = append(types, pymath.Fields(cut(lines[i], 7, 60))...)
			}
		} else if lab == "END OF HEADER" {
			i++
			break
		}
	}
	find := func(set ...string) int {
		for k, t := range types {
			for _, s := range set {
				if t == s {
					return k
				}
			}
		}
		return -1
	}
	c1, c2 := find("C1C", "C1W", "C1P"), find("C2W", "C2P", "C2X", "C2L", "C2C")
	var cols []int
	for _, c := range []int{c1, c2} {
		if c >= 0 {
			cols = append(cols, c)
		}
	}
	var epochs []*Epoch
	seenOrder := []int{}
	seen := map[int]map[int]bool{}
	var cur *Epoch
	have := false // an epoch line was read (cur may be a "not kept" epoch)
	keep := false
	curbin := 0
	for ; i < len(lines); i++ {
		ln := lines[i]
		if ln == "" {
			continue
		}
		if ln[0] == '>' {
			flag := pymath.Strip(cut(ln, 31, 32))
			if flag == "" {
				flag = "0"
			}
			if flag != "0" && flag != "1" { // event record: the next `count` lines are header-like text
				if n, err := strconv.Atoi(pymath.Strip(cut(ln, 32, 35))); err == nil {
					i += n
				}
				continue
			}
			p := pymath.Fields(ln[1:])
			s, err := strconv.ParseFloat(p[5], 64)
			if err != nil {
				return nil, nil, nil, fmt.Errorf("epoch %q", ln)
			}
			sow, _ := gpsSeconds(atoi(p[0]), atoi(p[1]), atoi(p[2]), atoi(p[3]), atoi(p[4]), s)
			tsec := float64(atoi(p[3])*3600+atoi(p[4])*60) + s
			keep = pymath.Mod(pymath.RoundInt(tsec), Step) == 0
			have = true
			if keep {
				cur = &Epoch{Sow: sow, P: map[int][2]float64{}}
				epochs = append(epochs, cur)
			} else {
				cur = nil
			}
			curbin = int(math.Floor(tsec / 300))
			continue
		}
		if !have || ln[0] != 'G' {
			continue
		}
		prn := atoi(cut(ln, 1, 3))
		var vals []*float64
		for _, c := range cols {
			s := pymath.Strip(cut(ln, 3+16*c, 3+16*c+14))
			if s == "" {
				vals = append(vals, nil)
				continue
			}
			v, err := strconv.ParseFloat(s, 64)
			if err != nil {
				return nil, nil, nil, fmt.Errorf("observation %q", s)
			}
			vals = append(vals, &v)
		}
		if len(vals) > 0 && vals[0] != nil {
			if seen[curbin] == nil {
				seen[curbin] = map[int]bool{}
				seenOrder = append(seenOrder, curbin)
			}
			seen[curbin][prn] = true
		}
		if keep && cur != nil && c1 >= 0 && c2 >= 0 && len(vals) == 2 && vals[0] != nil && vals[1] != nil && *vals[0] != 0 && *vals[1] != 0 {
			if _, dup := cur.P[prn]; !dup {
				cur.PRNs = append(cur.PRNs, prn)
			}
			cur.P[prn] = [2]float64{*vals[0], *vals[1]}
		}
	}
	var out []Epoch
	for _, e := range epochs {
		if len(e.P) > 0 {
			out = append(out, *e)
		}
	}
	bins := map[int][]int{}
	for k, set := range seen {
		var ps []int
		for p := range set {
			ps = append(ps, p)
		}
		sort.Ints(ps)
		bins[k] = ps
	}
	return out, seenOrder, bins, nil
}

// ---- geometry -------------------------------------------------------------------

func geodetic(x [3]float64) (float64, float64, float64) {
	lon := math.Atan2(x[1], x[0])
	p := pymath.PyHypot(x[0], x[1])
	lat := math.Atan2(x[2], p*(1-E2))
	var h float64
	for k := 0; k < 6; k++ {
		sl := math.Sin(lat)
		N := AWGS / math.Sqrt(1-float64(E2*float64(sl*sl)))
		if math.Abs(lat) < 1.4 {
			h = p/math.Cos(lat) - N
		} else {
			h = x[2]/math.Sin(lat) - float64(N*(1-E2))
		}
		lat = math.Atan2(x[2], p*(1-float64(E2*N)/(N+h)))
	}
	return pymath.Degrees(lat), pymath.Degrees(lon), h
}

func enuEl(x, s [3]float64) float64 {
	lat, lon, _ := geodetic(x)
	la, lo := pymath.Radians(lat), pymath.Radians(lon)
	d := [3]float64{s[0] - x[0], s[1] - x[1], s[2] - x[2]}
	sla, cla, slo, clo := math.Sin(la), math.Cos(la), math.Sin(lo), math.Cos(lo)
	e := float64(-slo*d[0]) + float64(clo*d[1])
	n := float64(float64(float64(-sla*clo)*d[0])-float64(float64(sla*slo)*d[1])) + float64(cla*d[2])
	u := float64(float64(float64(cla*clo)*d[0])+float64(float64(cla*slo)*d[1])) + float64(sla*d[2])
	return pymath.Degrees(math.Asin(u / math.Sqrt(float64(float64(e*e)+float64(n*n))+float64(u*u))))
}

// tropo is the Saastamoinen zenith delay (standard atmosphere), 1/sin mapping, m.
func tropo(el, h float64) float64 {
	h = math.Max(-100.0, math.Min(h, 8000.0))
	p := 1013.25 * math.Pow(1-float64(2.2557e-5*h), 5.2568)
	T := 15.0 - float64(6.5e-3*h) + 273.16
	e := float64(6.108*0.5) * math.Exp((float64(17.15*T)-4684.0)/(T-38.45))
	z := pymath.Radians(90 - math.Max(el, 5.0))
	tz := math.Tan(z)
	return (0.002277 / math.Cos(z)) * (float64(p+float64((1255.0/T+0.05)*e)) - float64(tz*tz))
}

func norm3(v [3]float64) float64 {
	return math.Sqrt(float64(float64(0+float64(v[0]*v[0]))+float64(v[1]*v[1])) + float64(v[2]*v[2]))
}

type sat struct {
	prn int
	pif float64
	e   *Eph
}

// solve is solve_epoch: Gauss-Newton from the origin.
func solve(eph map[int][]Eph, ep Epoch) ([3]float64, []float64, bool) {
	var sats []sat
	for _, prn := range ep.PRNs {
		p := ep.P[prn]
		pif := (float64(F1s*p[0]) - float64(F2s*p[1])) / (F1s - F2s)
		e := pick(eph, prn, ep.Sow-pif/C)
		if e != nil && 1.5e7 < pif && pif < 3.2e7 {
			sats = append(sats, sat{prn, pif, e})
		}
	}
	var x [3]float64
	if len(sats) < 6 {
		return x, nil, false
	}
	cb := 0.0
	use := sats
	var H [][]float64
	var y, d []float64
	for it := 0; it < 12; it++ {
		H, y = nil, nil
		for _, s := range use {
			tau := (s.pif - cb) / C
			sp, clk := satState(s.e, ep.Sow-tau)
			th := OmegaE * tau // Sagnac: the Earth turns while the signal flies
			ct, st := math.Cos(th), math.Sin(th)
			sp = [3]float64{float64(sp[0]*ct) + float64(sp[1]*st), float64(-sp[0]*st) + float64(sp[1]*ct), sp[2]}
			dv := [3]float64{sp[0] - x[0], sp[1] - x[1], sp[2] - x[2]}
			rho := norm3(dv)
			corr := 0.0
			if it >= 3 {
				el := enuEl(x, sp)
				_, _, hh := geodetic(x)
				corr = tropo(el, hh)
			}
			y = append(y, (float64(s.pif+float64(C*clk))-corr)-(rho+cb))
			H = append(H, []float64{-dv[0] / rho, -dv[1] / rho, -dv[2] / rho, 1})
		}
		d = lstsq(H, y)
		x = [3]float64{x[0] + d[0], x[1] + d[1], x[2] + d[2]}
		cb += d[3]
		if it >= 3 && norm3([3]float64{d[0], d[1], d[2]}) < 1e-3 {
			break
		}
		if it == 3 { // first good position: apply the elevation mask
			var keep []sat
			for _, s := range use {
				sp, _ := satState(s.e, ep.Sow)
				if enuEl(x, sp) >= Mask {
					keep = append(keep, s)
				}
			}
			if len(keep) < 6 {
				return x, nil, false
			}
			use = keep
		}
	}
	if n := norm3(x); n < 6.0e6 || n > 6.5e6 {
		return x, nil, false
	}
	res := make([]float64, len(y))
	for k := range y {
		f := 0.0 // matmul: in order
		for j := 0; j < 4; j++ {
			f += float64(H[k][j] * d[j])
		}
		res[k] = y[k] - f
	}
	return x, res, true
}

// lstsq: Householder QR (numpy uses LAPACK dgelsd: same solution to rounding).
func lstsq(A [][]float64, b []float64) []float64 {
	m, p := len(A), len(A[0])
	a := make([][]float64, m)
	for i := range A {
		a[i] = append([]float64(nil), A[i]...)
	}
	y := append([]float64(nil), b...)
	for j := 0; j < p; j++ {
		nrm := 0.0
		for i := j; i < m; i++ {
			nrm = math.Hypot(nrm, a[i][j])
		}
		if nrm == 0 {
			continue
		}
		if a[j][j] > 0 {
			nrm = -nrm
		}
		for i := j; i < m; i++ {
			a[i][j] /= -nrm
		}
		a[j][j] += 1
		for k := j + 1; k < p; k++ {
			s := 0.0
			for i := j; i < m; i++ {
				s += a[i][j] * a[i][k]
			}
			s = -s / a[j][j]
			for i := j; i < m; i++ {
				a[i][k] += s * a[i][j]
			}
		}
		s := 0.0
		for i := j; i < m; i++ {
			s += a[i][j] * y[i]
		}
		s = -s / a[j][j]
		for i := j; i < m; i++ {
			y[i] += s * a[i][j]
		}
		a[j][j] = nrm
	}
	x := make([]float64, p)
	for j := p - 1; j >= 0; j-- {
		s := y[j]
		for k := j + 1; k < p; k++ {
			s -= a[j][k] * x[k]
		}
		x[j] = s / a[j][j]
	}
	return x
}

// ---- main -------------------------------------------------------------------------

// Station is one row of GPS_RAW.stations.
type Station struct {
	ID, File  string
	XYZ, SD   [3]float64
	Lat, Lon  float64
	H         int
	N         int
	RMS       float64
	SeenOrder []int
	Seen      map[int][]int
	res       []float64
}

// ReadStations reads data/gps/stations.txt.
func ReadStations(root string) ([][2]string, error) {
	b, err := os.ReadFile(filepath.Join(root, Stations))
	if err != nil {
		return nil, err
	}
	var out [][2]string
	sc := bufio.NewScanner(bytes.NewReader(b))
	for sc.Scan() {
		l := strings.TrimSpace(sc.Text())
		if l == "" || strings.HasPrefix(l, "#") {
			continue
		}
		f := strings.Fields(l)
		if len(f) != 2 {
			return nil, fmt.Errorf("%s: %q: want \"id file\"", Stations, l)
		}
		out = append(out, [2]string{f[0], f[1]})
	}
	return out, sc.Err()
}

// decompress: gunzip, then crx2rnx (stdin -> stdout).
func decompress(root, path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return "", err
	}
	bin := filepath.Join(root, Crx2rnx)
	if _, err := os.Stat(bin); err != nil {
		return "", fmt.Errorf("%s missing: make crx2rnx (RNXCMP, tools/third_party/rnxcmp)", Crx2rnx)
	}
	cmd := exec.Command(bin, "-")
	cmd.Stdin = gz
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("crx2rnx %s: %v %s", filepath.Base(path), err, errb.String())
	}
	return out.String(), nil
}

// Result of a build.
type Result struct {
	Stations []*Station
	Hist     pyjson.Obj
	Log      []string
}

// Compute processes every listed station.
func Compute(root string) (*Result, error) {
	list, err := ReadStations(root)
	if err != nil {
		return nil, err
	}
	eph, err := ReadNav(filepath.Join(root, RawDir, "BRDC.rnx.gz"))
	if err != nil {
		return nil, err
	}
	res := &Result{}
	var all []float64
	for _, st := range list {
		text, err := decompress(root, filepath.Join(root, RawDir, st[1]))
		if err != nil {
			return nil, err
		}
		eps, seenOrder, seen, err := ReadObs(text)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", st[0], err)
		}
		var fixes [][3]float64
		var resid []float64
		for _, ep := range eps {
			if x, r, ok := solve(eph, ep); ok {
				fixes = append(fixes, x)
				resid = append(resid, r...)
			}
		}
		if len(fixes) < 100 {
			return nil, fmt.Errorf("%s: only %d fixes (the list holds stations the script kept)", st[0], len(fixes))
		}
		var med [3]float64
		for j := 0; j < 3; j++ {
			col := make([]float64, len(fixes))
			for i, f := range fixes {
				col[i] = f[j]
			}
			sort.Float64s(col)
			n := len(col)
			if n%2 == 1 {
				med[j] = col[n/2]
			} else {
				med[j] = (col[n/2-1] + col[n/2]) / 2
			}
		}
		var ok [][3]float64
		for _, f := range fixes {
			if norm3([3]float64{f[0] - med[0], f[1] - med[1], f[2] - med[2]}) < 30.0 {
				ok = append(ok, f)
			}
		}
		var mean, sd [3]float64
		for j := 0; j < 3; j++ {
			s := 0.0
			for _, f := range ok {
				s += f[j]
			}
			mean[j] = s / float64(len(ok))
			v := 0.0
			for _, f := range ok {
				dd := f[j] - mean[j]
				v += dd * dd
			}
			sd[j] = math.Sqrt(v / float64(len(ok)))
		}
		lat, lon, h := geodetic(mean)
		sq := make([]float64, len(resid))
		for i, r := range resid {
			sq[i] = r * r
		}
		s := &Station{ID: st[0], File: st[1], Lat: pyjson.Round(lat, 3), Lon: pyjson.Round(lon, 3), H: pymath.RoundInt(h),
			N: len(ok), RMS: pyjson.Round(math.Sqrt(npy.Sum(sq)/float64(len(sq))), 2), SeenOrder: seenOrder, Seen: seen, res: resid}
		for j := 0; j < 3; j++ {
			s.XYZ[j] = pymath.NpRound(mean[j], 2)
			s.SD[j] = pymath.NpRound(sd[j], 2)
		}
		res.Stations = append(res.Stations, s)
		all = append(all, resid...)
		res.Log = append(res.Log, fmt.Sprintf("%s %.2f %.2f %d fixes %d/%d rms %v", st[0], lat, lon, s.H, len(ok), len(fixes), s.RMS))
	}
	res.Hist = histogram(all)
	return res, nil
}

// histogram is the residual statistics of the script (np.histogram on
// integer edges, np.percentile 'linear').
func histogram(R []float64) pyjson.Obj {
	var edges []int
	for e := -30; e <= 30; e += 2 {
		edges = append(edges, e)
	}
	counts := make([]int, len(edges)-1)
	sq := make([]float64, len(R))
	abs := make([]float64, len(R))
	mx := 0.0
	for i, r := range R {
		sq[i] = r * r
		abs[i] = math.Abs(r)
		mx = math.Max(mx, abs[i])
		lo, hi := float64(edges[0]), float64(edges[len(edges)-1])
		if r < lo || r > hi {
			continue
		}
		k := int(math.Floor((r - lo) / 2))
		// bins are [e_k, e_k+1) except the last, which includes its right edge
		for k > 0 && r < float64(edges[k]) {
			k--
		}
		for k < len(counts)-1 && r >= float64(edges[k+1]) {
			k++
		}
		if k >= len(counts) {
			k = len(counts) - 1
		}
		counts[k]++
	}
	return pyjson.Obj{{K: "n", V: len(R)}, {K: "rms", V: pyjson.Round(math.Sqrt(npy.Sum(sq)/float64(len(R))), 2)},
		{K: "p95", V: pyjson.Round(npy.Percentile(abs, 95), 2)}, {K: "max", V: pyjson.Round(mx, 1)},
		{K: "edges", V: edges}, {K: "counts", V: counts}}
}

// File renders the preset (same body as the script).
func (r *Result) File() preset.File {
	sts := make([]any, len(r.Stations))
	for i, s := range r.Stations {
		seen := pyjson.Obj{}
		for _, k := range s.SeenOrder {
			seen = append(seen, pyjson.KV{K: strconv.Itoa(k), V: s.Seen[k]})
		}
		sts[i] = pyjson.Obj{{K: "id", V: s.ID}, {K: "file", V: s.File}, {K: "xyz", V: s.XYZ[:]}, {K: "lat", V: s.Lat},
			{K: "lon", V: s.Lon}, {K: "h", V: s.H}, {K: "n", V: s.N}, {K: "sd", V: s.SD[:]}, {K: "rms", V: s.RMS}, {K: "seen", V: seen}}
	}
	body := "export const GPS_RAW = " + pyjson.Dumps(pyjson.Obj{{K: "day", V: Day}, {K: "stations", V: sts}, {K: "resid", V: r.Hist}},
		pyjson.Opts{Item: ",", Key: ":", ASCII: true}) + ";\n"
	return preset.File{
		Out: Out, Command: "build gps-raw", Inputs: []string{Stations, Dir + "/inputs.lock"}, Body: body,
		Notes: []string{
			fmt.Sprintf("Raw GPS pseudoranges of %d IGS stations on %s (BKG open archive), solved from the origin of the", len(r.Stations), Day),
			"coordinate system, one fix every 5 min, averaged over the day. xyz: ECEF metres. seen: 5-minute bin (index from",
			"00:00 GPS time) -> GPS PRNs with a pseudorange (all epochs, no orbit used). resid: pseudorange residual histogram.",
		},
	}
}
