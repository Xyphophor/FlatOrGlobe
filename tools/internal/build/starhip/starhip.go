// Package starhip builds src/data/presets/star-hip.js (star tab, section
// "The sky has a map"): the Hipparcos stars the page draws on its celestial
// sphere, with the proper motions that move them over the centuries.
//
// # Data
//
// ESA, The Hipparcos and Tycho Catalogues, ESA SP-1200 (1997), table
// hip_main, read from VizieR (I/239): every star brighter than V = 4.55
// (962 entries, data/star/hip/raw/hip_bright.tsv) and six stars chosen for
// their large proper motion (hip_fast.tsv: Barnard's star HIP 87937,
// Kapteyn's star HIP 24186, Groombridge 1830 HIP 57939, 61 Cygni A and B
// HIP 104214 and 104217, HIP 439). Fields: H1 HIP number, H5 V magnitude,
// H8 and H9 right ascension and declination (degrees, ICRS, epoch
// J1991.25), H12 and H13 proper motions (mas/yr; H12 is mu_alpha times
// cos delta), H37 the B-V colour.
//
// # Method
//
// None: the rows are copied as published and rounded (1e-5 degree, i.e.
// 0.04 arcsecond; 0.1 mas/yr). Two of the 962 bright entries have no
// astrometric solution in the main catalogue (the close binaries xi Ursae
// Majoris, HIP 55203, and xi Scorpii, HIP 78727: position and proper motion
// blank); they are left out and counted. The build refuses a row with only
// part of its astrometry, a magnitude outside the request, a star given
// twice, and counts that differ from those frozen below, so that a
// different VizieR answer cannot slip in unnoticed.
//
// The page moves the stars itself, in src/tabs/star/radec-logic.js:
//
//   - proper motion: the unit vector u0 of the catalogue position moves
//     along a straight line, u(t) = normalise(u0 + t (mu_alpha* e_alpha +
//     mu_delta e_delta)), radial velocity taken as zero (the standard
//     model of the Hipparcos catalogue, ESA SP-1200 vol. 1, section 1.5.5,
//     without its radial term);
//   - precession: a rotation about the pole of the ecliptic of J2000 at
//     the general precession in longitude p = 5028.796195 arcseconds per
//     Julian century (N. Capitaine, P. T. Wallace and J. Chapront,
//     Expressions for IAU 2000 precession quantities, Astron. Astrophys.
//     412 (2003) 567-586), with the obliquity held at 23.4392911 degrees
//     (J. H. Lieske et al., Astron. Astrophys. 58 (1977) 1-16). Over a few
//     centuries it agrees with the Lieske series of src/core/ephemeris.js;
//     over the whole 25,772-year turn it is an illustration: the real
//     ecliptic tilts too and the rate drifts.
package starhip

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/preset"
)

const (
	Dir    = "data/star/hip"
	Bright = Dir + "/raw/hip_bright.tsv"
	Fast   = Dir + "/raw/hip_fast.tsv"
	Out    = "src/data/presets/star-hip.js"
	VMax   = 4.55 // the request: Vmag < 4.55
	// counts of the two VizieR answers of 2026-11-11
	NBright = 962
	NFast   = 6
	// bright entries without an astrometric solution (HIP 55203, 78727)
	NBlank = 2
)

// Star is one row of hip_main, as published.
type Star struct {
	HIP        int
	V          float64 // Johnson V, mag
	RA, Dec    float64 // deg, ICRS, epoch J1991.25
	PMRA, PMDe float64 // mas/yr; PMRA includes cos(dec)
	BV         float64 // Johnson B-V, mag; NaN when the catalogue has none
}

// Result of a build.
type Result struct {
	Bright, Fast []Star
	Blank        []int // HIP numbers of the entries left out: no position in the catalogue
}

// Read parses one VizieR tab-separated answer (columns HIP, Vmag, RAICRS,
// DEICRS, Plx, pmRA, pmDE, B-V; comment lines start with #, then two
// header lines and a rule of dashes). blank lists the entries whose four
// astrometric fields are all empty.
func Read(path string) (stars []Star, blank []int, err error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, nil, fmt.Errorf("%w (fog fetch star-hip)", err)
	}
	defer f.Close()
	seen := map[int]bool{}
	head := false
	sc := bufio.NewScanner(f)
	for n := 1; sc.Scan(); n++ {
		line := sc.Text()
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}
		c := strings.Split(line, "\t")
		if !head {
			if strings.HasPrefix(line, "---") {
				head = true
			} else if c[0] != "HIP" && strings.TrimSpace(c[0]) != "" {
				return nil, nil, fmt.Errorf("%s:%d: unexpected header %q", path, n, line)
			} else if c[0] == "HIP" && strings.Join(c, ",") != "HIP,Vmag,RAICRS,DEICRS,Plx,pmRA,pmDE,B-V" {
				return nil, nil, fmt.Errorf("%s:%d: columns %q", path, n, line)
			}
			continue
		}
		if len(c) != 8 {
			return nil, nil, fmt.Errorf("%s:%d: %d columns", path, n, len(c))
		}
		num := func(i int) (float64, error) {
			v, err := strconv.ParseFloat(strings.TrimSpace(c[i]), 64)
			if err != nil {
				return 0, fmt.Errorf("%s:%d: column %d: %q", path, n, i+1, c[i])
			}
			return v, nil
		}
		hip, err := strconv.Atoi(strings.TrimSpace(c[0]))
		if err != nil {
			return nil, nil, fmt.Errorf("%s:%d: HIP %q", path, n, c[0])
		}
		if seen[hip] {
			return nil, nil, fmt.Errorf("%s:%d: HIP %d twice", path, n, hip)
		}
		seen[hip] = true
		if strings.TrimSpace(c[2]+c[3]+c[5]+c[6]) == "" {
			blank = append(blank, hip)
			continue
		}
		s := Star{HIP: hip, BV: math.NaN()}
		for i, p := range []*float64{&s.V, &s.RA, &s.Dec, nil, &s.PMRA, &s.PMDe} {
			if p == nil {
				continue
			}
			if *p, err = num(i + 1); err != nil {
				return nil, nil, err
			}
		}
		if strings.TrimSpace(c[7]) != "" {
			if s.BV, err = num(7); err != nil {
				return nil, nil, err
			}
		}
		if s.RA < 0 || s.RA >= 360 || s.Dec < -90 || s.Dec > 90 {
			return nil, nil, fmt.Errorf("%s:%d: position out of range", path, n)
		}
		stars = append(stars, s)
	}
	return stars, blank, sc.Err()
}

// Compute reads the two answers and checks them against the request.
func Compute(root string) (*Result, error) {
	b, blank, err := Read(filepath.Join(root, Bright))
	if err != nil {
		return nil, err
	}
	f, fblank, err := Read(filepath.Join(root, Fast))
	if err != nil {
		return nil, err
	}
	if len(b)+len(blank) != NBright || len(blank) != NBlank || len(f) != NFast || len(fblank) != 0 {
		return nil, fmt.Errorf("star-hip: %d bright (%d without a position) and %d fast stars, expected %d (%d) and %d", len(b)+len(blank), len(blank), len(f), NBright, NBlank, NFast)
	}
	for _, s := range b {
		if s.V >= VMax {
			return nil, fmt.Errorf("star-hip: HIP %d has V = %.2f, outside the request", s.HIP, s.V)
		}
	}
	return &Result{Bright: b, Fast: f, Blank: blank}, nil
}

func num(v float64, prec int) string {
	s := strconv.FormatFloat(v, 'f', prec, 64)
	if strings.Contains(s, ".") {
		s = strings.TrimRight(strings.TrimRight(s, "0"), ".")
	}
	if s == "-0" {
		s = "0"
	}
	return s
}

func rows(st []Star) string {
	var b strings.Builder
	for _, s := range st {
		bv := "null"
		if !math.IsNaN(s.BV) {
			bv = num(s.BV, 2)
		}
		fmt.Fprintf(&b, "  [%d, %s, %s, %s, %s, %s, %s],\n", s.HIP, num(s.RA, 5), num(s.Dec, 5), num(s.PMRA, 1), num(s.PMDe, 1), num(s.V, 2), bv)
	}
	return b.String()
}

// File renders the preset.
func (r *Result) File() preset.File {
	return preset.File{
		Out: Out, Command: "build star-hip", Inputs: []string{Bright, Fast},
		Notes: []string{
			"Hipparcos main catalogue (ESA 1997, VizieR I/239), as published: the stars brighter than V = 4.55 (BRIGHT)",
			"and six stars with a large proper motion (FAST). One row = [HIP, ra, dec, pmra, pmde, V, B-V]:",
			"ra, dec in degrees (ICRS, epoch J1991.25), pmra = mu_alpha cos(dec) and pmde in mas/yr, V and B-V in mag",
			"(B-V null when the catalogue gives none). Rounded to 1e-5 deg and 0.1 mas/yr; nothing else is computed.",
			fmt.Sprintf("Left out, no astrometric solution in the main catalogue (close binaries): HIP %s.", strings.Trim(strings.Join(strings.Fields(fmt.Sprint(r.Blank)), ", "), "[]")),
		},
		Body: fmt.Sprintf("export const HIP_EPOCH = 1991.25;\nexport const HIP_BRIGHT = [\n%s];\nexport const HIP_FAST = [\n%s];\n", rows(r.Bright), rows(r.Fast)),
	}
}

// Summary is the report line of the build.
func (r *Result) Summary() string {
	return fmt.Sprintf("%d stars brighter than V = %.2f (%d more without a position, left out), %d fast-moving stars", len(r.Bright), VMax, len(r.Blank), len(r.Fast))
}
