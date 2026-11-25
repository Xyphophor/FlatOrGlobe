// Package orbpulsar measures the astronomical unit with millisecond pulsars (orb tab, epic37/UC02, 2026-11-18): the pulses of
// a pulsar arrive up to (A/c)·cos β earlier or later through the year, A the radius of the Earth's orbit and β the pulsar's
// ecliptic latitude (the Rømer delay, −r⊕·n̂/c; Lorimer & Kramer, Handbook of Pulsar Astronomy (2005), §8.2.1; Edwards,
// Hobbs & Manchester, MNRAS 372 (2006) 1549, eq. 7).
//
// Why the timing alone cannot give A. A timing fit takes the Earth's orbit from an ephemeris (JPL DE440, in kilometres,
// that is A_DE times its shape in AU) and fits, with the spin, the binary orbit and the dispersion, the pulsar's position.
// Because the Earth moves in the ecliptic, the annual delay is A·cos β·(x cos λ + y sin λ)/c with (x, y) the Earth's
// position in AU: its size fixes the product A·cos β only. Were the true A different from A_DE by a factor 1 + ε, the
// fitted latitude would move so that cos β_timing = (1 + ε)·cos β, and the residuals would show nothing.
//
// Where A comes from. Very long baseline interferometry measures the same pulsar's direction against quasars: an angle,
// with no ephemeris and no annual delay in it. Then
//
//	A = A_DE · cos β_timing / cos β_VLBI
//
// and an error σβ on the latitudes becomes A·tan β·σβ: one milliarcsecond (4.8 × 10⁻⁹ rad) is 0.7 km at β = 45°.
//
// Data. Timing: the EPTA second data release (Antoniadis et al., A&A 678 (2023) A48; Zenodo 8300645), version DR2full,
// the .par files read from the zip as published: position (RAJ, DECJ) and its 1σ error at POSEPOCH, fitted with DE440.
// Interferometry: the MSPSRπ catalogue (H. Ding et al., MNRAS 519 (2023) 4982, Table 5, results "inferred without using
// timing proper motions as priors"), our transcription: the reference position at t_ref, its error budget (the relative
// position's Bayesian error and the bracketed reference-point, calibrator and core-shift terms, which the authors call
// "only indicative" and which dominate) and the VLBI proper motion, used to carry the position to the timing epoch
// (rectilinear, a few tens of mas over eight years). Second, independent timing: the NANOGrav 15-year data set (G. Agazie et
// al., ApJL 951 (2023) L9; Zenodo 16051178, v2.1.0), the narrowband PINT models read from the tar.gz (ecliptic coordinates,
// ECL IERS2010; B1937+21 is J1939+2134). Common to the VLBI table: 8 EPTA models and 12 NANOGrav models, 12 pulsars.
//
// Frame: both positions are ICRS directions (DE440 is aligned to the ICRF); the ecliptic is the J2000 one with the IERS 2010
// obliquity, 84381.406″ (Petit & Luzum, IERS Technical Note 36, 2010) — the same rotation for both, so its choice cancels.
// Four EPTA models are written in ecliptic coordinates (ELONG, ELAT) with tempo2's default obliquity (IERS 2003, 84381.4059″);
// they are turned back to equatorial with it first.
// EPTA works in TCB units; an angle is the same in either scale, and A comes out in the units of A_DE (TDB).
//
// Rule 10 (evidence classes): a check. The pulse times are a clock and the VLBI direction an angle, but the timing model
// needs the observatory's position (the 21-ms daily delay, from its terrestrial coordinates) and the Earth's orbit shape
// from DE440, whose scale rests partly on radar ranging. A_DE enters only as the unit that the ratio corrects.
package orbpulsar

import (
	"archive/tar"
	"archive/zip"
	"bufio"
	"compress/gzip"
	"encoding/csv"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Inputs, relative to the repository root.
const (
	Zip     = "data/orb/pulsar/raw/EPTA-DR2.zip"
	NGTar   = "data/orb/pulsar/raw/NANOGrav15yr_PulsarTiming_v2.1.0.tar.gz"
	Version = "DR2full"
	VLBI    = "data/orb/pulsar/transcription/ding2023-table5.csv"
	Out     = "src/data/presets/orb-pulsar.js"

	AUkm    = 149597870.700 // A_DE: IAU 2012 B2, DE440's unit
	C       = 299792.458
	obliq   = 84381.406 / 3600  // deg, IERS 2010
	obliqT2 = 84381.4059 / 3600 // deg, tempo2's default for ELONG/ELAT (IERS 2003)
	d2r     = math.Pi / 180
	mas     = d2r / 3600 / 1000
	julYr   = 365.25
	secDay  = 86400.0
)

// Pulsar is one pulsar common to both catalogues.
type Pulsar struct {
	Name, Array           string  // Array: "EPTA" or "NANOGrav"
	PosEpoch, TRef        float64 // MJD (timing, VLBI)
	Span                  [2]float64
	NTOA                  int
	RAt, Dect             float64 // rad, timing at PosEpoch
	SRAt, SDect           float64 // mas (σα·cos δ, σδ)
	RAv, Decv             float64 // rad, VLBI carried to PosEpoch
	SRAv, SDecv           float64 // mas
	Lam, Bt, Bv           float64 // rad: ecliptic longitude, latitude (timing, VLBI)
	SBt, SBv              float64 // mas
	DAlpha, DDelta, DBeta float64 // mas, timing − VLBI (α·cos δ, δ, β)
	A, SA                 float64 // km
	Romer                 float64 // s, (A_DE/c)·cos β_VLBI, half the annual swing
}

// Result is the whole build.
type Result struct {
	Pulsars []Pulsar
	Inputs  []string
}

func num(s string) float64 {
	v, err := strconv.ParseFloat(strings.TrimSpace(s), 64)
	if err != nil {
		return math.NaN()
	}
	return v
}

// sexa reads "hh:mm:ss.s" or "±dd:mm:ss.s" into hours or degrees.
func sexa(s string) float64 {
	s = strings.TrimSpace(s)
	sign := 1.0
	if strings.HasPrefix(s, "-") {
		sign, s = -1, s[1:]
	}
	s = strings.TrimPrefix(s, "+")
	p := strings.Split(s, ":")
	return sign * (num(p[0]) + num(p[1])/60 + num(p[2])/3600)
}

// ecl turns an equatorial direction into ecliptic longitude and latitude (rad).
func ecl(ra, dec float64) (lam, beta float64) {
	e := obliq * d2r
	beta = math.Asin(math.Sin(dec)*math.Cos(e) - math.Cos(dec)*math.Sin(e)*math.Sin(ra))
	lam = math.Atan2(math.Sin(ra)*math.Cos(e)+math.Tan(dec)*math.Sin(e), math.Cos(ra))
	return
}

// equ turns ecliptic coordinates (rad) into equatorial ones with the obliquity e (deg).
func equ(lam, beta, e float64) (ra, dec float64) {
	e *= d2r
	dec = math.Asin(math.Sin(beta)*math.Cos(e) + math.Cos(beta)*math.Sin(e)*math.Sin(lam))
	ra = math.Atan2(math.Sin(lam)*math.Cos(e)-math.Tan(beta)*math.Sin(e), math.Cos(lam))
	if ra < 0 {
		ra += 2 * math.Pi
	}
	return
}

// sigBeta propagates (σα·cos δ, σδ) in mas to σβ in mas, by finite differences.
func sigBeta(ra, dec, sa, sd float64) float64 {
	_, b0 := ecl(ra, dec)
	_, b1 := ecl(ra+mas/math.Cos(dec), dec)
	_, b2 := ecl(ra, dec+mas)
	da, dd := (b1-b0)/mas, (b2-b0)/mas
	return math.Hypot(da*sa, dd*sd)
}

type par struct {
	ra, dec, sra, sdec, posEpoch, start, finish float64
	elon, elat, selon, selat                    float64 // when the model is written in ecliptic coordinates
	ntoa                                        int
	ephem, units, ecl                           string
}

func readPar(r io.Reader) (par, error) {
	p := par{ra: math.NaN(), elon: math.NaN()}
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		f := strings.Fields(sc.Text())
		if len(f) < 2 {
			continue
		}
		errOf := func() float64 { // value, fit flag, error
			if len(f) >= 4 {
				return num(f[3])
			}
			return math.NaN()
		}
		switch f[0] {
		case "RAJ":
			p.ra, p.sra = sexa(f[1])*15*d2r, errOf() // error in seconds of time
		case "DECJ":
			p.dec, p.sdec = sexa(f[1])*d2r, errOf() // error in arcseconds
		case "ELONG":
			p.elon, p.selon = num(f[1])*d2r, errOf() // deg
		case "ELAT":
			p.elat, p.selat = num(f[1])*d2r, errOf() // deg
		case "POSEPOCH":
			p.posEpoch = num(f[1])
		case "START":
			p.start = num(f[1])
		case "FINISH":
			p.finish = num(f[1])
		case "NTOA":
			p.ntoa = int(num(f[1]))
		case "EPHEM":
			p.ephem = f[1]
		case "UNITS":
			p.units = f[1]
		case "ECL":
			p.ecl = f[1]
		}
	}
	if math.IsNaN(p.ra) && !math.IsNaN(p.elon) {
		// the model's ecliptic back to equatorial (ECL keyword; tempo2's default without it: IERS 2003, 84381.4059″)
		ob := obliqT2
		if p.ecl == "IERS2010" {
			ob = obliq
		}
		p.ra, p.dec = equ(p.elon, p.elat, ob)
		r0, d0 := p.ra, p.dec
		r1, d1 := equ(p.elon+p.selon*d2r, p.elat, ob)
		r2, d2 := equ(p.elon, p.elat+p.selat*d2r, ob)
		sa := math.Hypot((r1-r0)*math.Cos(d0), (r2-r0)*math.Cos(d0)) / d2r * 3600 / 15 / math.Cos(d0) // back to seconds of time
		sd := math.Hypot(d1-d0, d2-d0) / d2r * 3600
		p.sra, p.sdec = sa, sd
	}
	if math.IsNaN(p.ra) {
		return p, fmt.Errorf("no position")
	}
	return p, sc.Err()
}

// alias maps the B names of the NANOGrav files to the J names of the VLBI table.
var alias = map[string]string{"B1937+21": "J1939+2134", "B1855+09": "J1857+0943", "B1953+29": "J1955+2908"}

// compare puts one timing model beside the VLBI position of the same pulsar.
func compare(row []string, tp par, arr string) Pulsar {
	p := Pulsar{Name: row[0], Array: arr, PosEpoch: tp.posEpoch, TRef: num(row[1]), Span: [2]float64{tp.start, tp.finish}, NTOA: tp.ntoa, RAt: tp.ra, Dect: tp.dec}
	p.SRAt, p.SDect = tp.sra*15*math.Cos(tp.dec)*1000, tp.sdec*1000 // s of time and arcsec -> mas
	// VLBI at t_ref, carried to POSEPOCH with its own proper motion
	ra0, dec0 := sexa(row[2])*15*d2r, sexa(row[7])*d2r
	q := func(i ...int) float64 {
		s := 0.0
		for _, k := range i {
			s += num(row[k]) * num(row[k])
		}
		return math.Sqrt(s)
	}
	pmra, pmdec := num(row[12]), num(row[15])
	spmra, spmdec := (num(row[13])+num(row[14]))/2, (num(row[16])+num(row[17]))/2
	dt := (p.PosEpoch - p.TRef) / julYr
	p.Decv = dec0 + pmdec*dt*mas
	p.RAv = ra0 + pmra*dt*mas/math.Cos(dec0)
	p.SRAv = math.Hypot(q(3, 4, 5, 6), spmra*dt)
	p.SDecv = math.Hypot(q(8, 9, 10, 11), spmdec*dt)
	p.Lam, p.Bt = ecl(p.RAt, p.Dect)
	_, p.Bv = ecl(p.RAv, p.Decv)
	p.SBt = sigBeta(p.RAt, p.Dect, p.SRAt, p.SDect)
	p.SBv = sigBeta(p.RAv, p.Decv, p.SRAv, p.SDecv)
	p.DAlpha = (p.RAt - p.RAv) * math.Cos(p.Dect) / mas
	p.DDelta = (p.Dect - p.Decv) / mas
	p.DBeta = (p.Bt - p.Bv) / mas
	p.A = AUkm * math.Cos(p.Bt) / math.Cos(p.Bv)
	p.SA = AUkm * math.Abs(math.Tan(p.Bv)) * math.Hypot(p.SBt, p.SBv) * mas
	p.Romer = AUkm / C * math.Cos(p.Bv)
	return p
}

// Compute reads both catalogues and compares every common pulsar.
func Compute(root string) (*Result, error) {
	r := &Result{Inputs: []string{Zip, VLBI}}
	f, err := os.Open(filepath.Join(root, VLBI))
	if err != nil {
		return nil, err
	}
	defer f.Close()
	cr := csv.NewReader(f)
	cr.Comment = '#'
	rows, err := cr.ReadAll()
	if err != nil {
		return nil, err
	}
	pars := map[string]map[string]par{"EPTA": {}, "NANOGrav": {}}
	// EPTA DR2: the main model of each pulsar in version DR2full
	zr, err := zip.OpenReader(filepath.Join(root, Zip))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch orb-pulsar)", err)
	}
	for _, zf := range zr.File {
		if strings.Contains(zf.Name, "/"+Version+"/") && strings.HasSuffix(zf.Name, ".par") {
			b := filepath.Base(zf.Name)
			if b == filepath.Base(filepath.Dir(zf.Name))+".par" { // the main model, not a variant
				rc, err := zf.Open()
				if err != nil {
					return nil, err
				}
				tp, err := readPar(rc)
				rc.Close()
				if err != nil {
					return nil, fmt.Errorf("%s: %w", b, err)
				}
				pars["EPTA"][strings.TrimSuffix(b, ".par")] = tp
			}
		}
	}
	zr.Close()
	// NANOGrav 15 yr: narrowband/par/<name>_PINT_<date>.nb.par, the combined model (no gbt/ao suffix)
	if f, err := os.Open(filepath.Join(root, NGTar)); err == nil {
		r.Inputs = append(r.Inputs, NGTar)
		gz, err := gzip.NewReader(f)
		if err != nil {
			return nil, err
		}
		tr := tar.NewReader(gz)
		for {
			h, err := tr.Next()
			if err == io.EOF {
				break
			}
			if err != nil {
				return nil, err
			}
			if !strings.Contains(h.Name, "/narrowband/par/") || !strings.HasSuffix(h.Name, ".nb.par") {
				continue
			}
			name := strings.SplitN(filepath.Base(h.Name), "_", 2)[0]
			if a, ok := alias[name]; ok {
				name = a
			}
			tp, err := readPar(tr)
			if err != nil {
				return nil, fmt.Errorf("%s: %w", h.Name, err)
			}
			pars["NANOGrav"][name] = tp
		}
		gz.Close()
		f.Close()
	}
	for _, row := range rows[1:] {
		for _, arr := range []string{"EPTA", "NANOGrav"} {
			tp, ok := pars[arr][row[0]]
			if !ok {
				continue
			}
			if tp.ephem != "DE440" {
				return nil, fmt.Errorf("%s %s: ephemeris %s, expected DE440", arr, row[0], tp.ephem)
			}
			r.Pulsars = append(r.Pulsars, compare(row, tp, arr))
		}
	}
	if len(r.Pulsars) == 0 {
		return nil, fmt.Errorf("no pulsar common to %s and %s", Zip, VLBI)
	}
	sort.Slice(r.Pulsars, func(i, j int) bool {
		if r.Pulsars[i].Name != r.Pulsars[j].Name {
			return r.Pulsars[i].Name < r.Pulsars[j].Name
		}
		return r.Pulsars[i].Array < r.Pulsars[j].Array
	})
	return r, nil
}

// Combined is the weighted mean of A (1/σ²), its formal error, χ²/ν, and the median.
func (r *Result) Combined() (mean, sigma, chi2nu, median float64) {
	sw, swx := 0.0, 0.0
	v := []float64{}
	for _, p := range r.Pulsars {
		w := 1 / (p.SA * p.SA)
		sw += w
		swx += w * p.A
		v = append(v, p.A)
	}
	mean, sigma = swx/sw, 1/math.Sqrt(sw)
	for _, p := range r.Pulsars {
		chi2nu += (p.A - mean) * (p.A - mean) / (p.SA * p.SA)
	}
	if n := len(r.Pulsars); n > 1 {
		chi2nu /= float64(n - 1)
	}
	sort.Float64s(v)
	if n := len(v); n%2 == 1 {
		median = v[n/2]
	} else {
		median = (v[n/2-1] + v[n/2]) / 2
	}
	return
}

// Summary is the build's one-line report.
func (r *Result) Summary() string {
	m, s, chi, med := r.Combined()
	n := map[string]int{}
	for _, p := range r.Pulsars {
		n[p.Array]++
	}
	return fmt.Sprintf("%d comparisons (EPTA %d, NANOGrav %d) with MSPSRπ VLBI: a.u. median %.1f km (weighted %.1f ± %.1f, χ²/ν %.2f); A_DE %.1f",
		len(r.Pulsars), n["EPTA"], n["NANOGrav"], med, m, s, chi, AUkm)
}

// File writes the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	R := func(x float64, n int) float64 { return pyjson.Round(x, n) }
	b.WriteString("// One timing model per line: [name, array (EPTA or NANOGrav), timing epoch MJD, first and last TOA MJD, TOAs, ecliptic longitude deg, β timing deg,\n")
	b.WriteString("// β VLBI deg, σβ timing mas, σβ VLBI mas, timing − VLBI: Δα·cos δ, Δδ, Δβ (mas), a.u. km, its σ km, half annual swing s]\n")
	b.WriteString("export const PSR_ROWS = [\n")
	for _, p := range r.Pulsars {
		b.WriteString(" " + pyjson.Dumps([]any{p.Name, p.Array, p.PosEpoch, R(p.Span[0], 1), R(p.Span[1], 1), p.NTOA, R(p.Lam/d2r, 5), R(p.Bt/d2r, 7), R(p.Bv/d2r, 7),
			R(p.SBt, 3), R(p.SBv, 2), R(p.DAlpha, 2), R(p.DDelta, 2), R(p.DBeta, 2), R(p.A, 1), R(p.SA, 1), R(p.Romer, 3)}, pyjson.Compact) + ",\n")
	}
	m, s, chi, med := r.Combined()
	b.WriteString("];\n// weighted mean (1/σ²) of the a.u. (km), its formal error, χ²/ν, median; DE440's unit. The two pulsars near the ecliptic\n// (cos β ≈ 1, σ ≈ 0) dominate the weighted mean: the page quotes the median and the range.\n")
	b.WriteString(fmt.Sprintf("export const PSR_AU = %s;\nexport const PSR_AU_DE = %s;\n",
		pyjson.Dumps([]any{R(m, 1), R(s, 1), R(chi, 2), R(med, 1)}, pyjson.Compact), pyjson.Float(AUkm)))
	return preset.File{
		Out: Out, Command: "build orb-pulsar",
		Inputs: r.Inputs,
		Notes: []string{"Astronomical unit from pulsar timing (EPTA DR2, Antoniadis et al. 2023) against VLBI positions (MSPSRpi, Ding et al. 2023,",
			"Table 5, our transcription): A = A_DE cos(beta_timing)/cos(beta_VLBI). go doc -all ./internal/build/orbpulsar."},
		Body: b.String(),
	}
}
