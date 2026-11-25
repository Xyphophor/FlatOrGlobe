// Package survexcess builds src/data/presets/surv-excess.js: the Earth's
// curvature from the angle sums of nineteenth-century survey triangles, read
// in our own transcription of two U.S. Coast and Geodetic Survey volumes
// (data/surv/excess/):
//
//   - C. A. Schott, The Transcontinental Triangulation and the American Arc of
//     the Parallel, USC&GS Special Publication No. 4 (1900), "Adjusted
//     triangles" and the triangles of its base nets;
//   - C. A. Schott, The Eastern Oblique Arc of the United States, USC&GS
//     Special Publication No. 7 (1902), "Resulting angles and sides".
//
// Both are public domain (NOAA library PDFs). Their OCR is unusable: every
// row was read off the page images, one CSV per page, as printed.
//
// # The quantity
//
// On a surface of constant Gaussian curvature K the three angles of a
// geodesic triangle add to π + K·A, A its area (Gauss, Disquisitiones
// generales circa superficies curvas, 1827, art. 20; for the sphere, Girard
// 1629 and Legendre 1787). On a plane K = 0 and the sum is exactly 180°. The
// observed excess ε = A₁ + A₂ + A₃ − 180° of each triangle, against its area,
// gives K by least squares through the origin: K = Σ εA / Σ A², R = 1/√K.
//
// # No radius in the data (evidence class: measure, CLAUDE.md rule 10)
//
// The angles are the "observed angles" column (station adjustment only; the
// printed corrections and spherical angles, which follow from an excess
// computed with a radius, are used only to check the transcription). The
// areas are NOT taken from the printed sides, which went through Legendre's
// theorem with a computed excess: lengths are carried from the measured base
// lines through the triangles with the observed angles alone, as plane
// triangles whose observed closure is shared equally between the three
// angles (Legendre's theorem with the observed, not computed, excess), then
// Heron's formula. A pair of stations printed with incompatible lengths (a
// misprinted station name, e.g. Buffalo/Flat Top in SP7 p. 155) is never
// used to pass from one triangle to the next. The only place a radius
// enters: the base lengths are printed reduced to sea level, a correction of
// about h/R ≈ 1e-6; the page says so.
//
// # Checks (the build fails on any unexplained discrepancy)
//
// For every triangle, with tolerances set by the printed precision (u = one
// unit of the last printed digit): observed + correction = spherical angle
// (mod 60″) to 1.5u; Σ spherical − 180° = Σ printed excess; log10(distance) =
// printed log; the sine rule dist/sin(spherical − excess) equal on the three
// rows. A triangle that fails a check is a misprint verified on the page
// image (its `flag` column says so) and is left out of the fit, counted; an
// unflagged failure stops the build. Station positions (drawing only) are
// checked by recomputing every printed side on the Clarke 1866 ellipsoid
// (Vincenty 1975, inverse formula) to 2e-5.
//
// # Fit and uncertainty
//
// Outliers: the project's rule, a triangle beyond 3 standard deviations of
// the residuals of the OTHER triangles (leave-one-out, through-zero fit),
// iterated, every drop counted. The uncertainty is a bootstrap over printed
// pages (triangles of one page share stations and angles): 2000 resamples,
// fixed seed, 16th and 84th percentiles. Also given: the fit with a constant
// offset per triangle (an observer's bias), and the flat model's best case,
// K = 0 with that offset fitted (rule 2): the offset cannot follow the area.
//
// References: Schott 1900 and 1902 (above); Gauss 1827, art. 20 (English:
// Morehead & Hiltebeitel, General Investigations of Curved Surfaces, 1902);
// A.-M. Legendre, "Mémoire sur les opérations trigonométriques dont les
// résultats dépendent de la figure de la Terre", Mém. Acad. Sci. 1787;
// T. Vincenty, "Direct and inverse solutions of geodesics on the ellipsoid
// with application of nested equations", Survey Review 23 (1975) 88-93;
// A. R. Clarke, Comparisons of the Standards of Length (1866), the spheroid
// of the USC&GS positions.
package survexcess

import (
	"fmt"
	"math"
	"math/rand/v2"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/csvx"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Dir = "data/surv/excess"
	Out = "src/data/presets/surv-excess.js"
	// Sec is one arcsecond in radians.
	Sec = math.Pi / 180 / 3600
)

// Pub is one transcribed volume.
type Pub struct {
	ID, Cite string
	// Kind: the table format ("schott", "delambre", "generic"); Unit: metres per printed
	// length unit (feet 0.3048, toise 1.949036591); Spherical: the generic adjusted angles
	// are spherical (sum 180° + ε) rather than plane.
	Kind      string
	Unit      float64
	Spherical bool
	// Bases: the measured base lines, as printed (printed unit, reduced to sea level).
	Bases []Base
	// Aliases: one station printed under two spellings in the same source (read as the second).
	Aliases map[string]string
	// LonOrigin: longitudes printed from a local meridian (degrees east of Greenwich; drawing only).
	LonOrigin float64
	// PosTol: how far a side recomputed on Clarke 1866 may depart from the source's median
	// ratio (default 2e-5: Schott computed on Clarke 1866; other spheroids drift slowly).
	PosTol float64
	// PosSoft: the source's own positions contradict its sides in places (Delambre's Table V):
	// a triangle whose positions fail is not drawn, and the build only warns.
	PosSoft bool
}

// Base is a measured base line between two stations.
type Base struct {
	A, B string
	L    float64
}

// Pubs, in output order. SP7 bases: the synopsis of base lines (printed p. 100);
// SP4 bases: the base as printed as a side of its own base net.
var Pubs = []Pub{
	{ID: "sp4", Kind: "schott", Unit: 1, Cite: "C. A. Schott, The Transcontinental Triangulation and the American Arc of the Parallel, USC&GS Special Publication No. 4 (1900)",
		Bases: []Base{
			{"Am. Bot. Low. Base", "Am. Bot. Up. Base", 7266.884},
			{"El Paso East Base", "El Paso West Base", 11289.176},
			{"Holton North Base", "Holton South Base", 5500.570},
			{"Kent I. N. Base", "Kent I. S. Base", 8687.545},
			{"Olney East Base", "Olney West Base", 6590.780},
			{"S. L. Northwest Base", "S. L. Southeast Base", 11198.677},
			{"Salina East Base", "Salina West Base", 6552.446},
			{"St. Albans East Base", "St. Albans West Base", 3870.403},
			{"Yolo N. W. Base", "Yolo S. E. Base", 17486.512},
		}},
	{ID: "sp7", Kind: "schott", Unit: 1, Cite: "C. A. Schott, The Eastern Oblique Arc of the United States and Osculating Spheroid, USC&GS Special Publication No. 7 (1902)",
		Bases: []Base{
			{"Epping West Base", "Epping East Base", 8715.9422},
			{"Massachusetts North Base", "Massachusetts South Base", 17326.3763},
			{"Fire Island East Base", "Fire Island West Base", 14058.9709},
			{"Kent Island North Base", "Kent Island South Base", 8687.5446},
			{"Atlanta Northeast Base", "Atlanta Southwest Base", 9338.4778},
			{"Dauphin Island West Base", "Dauphin Island East Base", 10661.8376},
		}},
	// Delambre & Méchain: the two bases "en arc" in toises (t. 2, 1807, p. 56); a toise is
	// 864 lignes and the metre 443.296 lignes (the law of 1799), 1.949036591 m.
	// Positions: t. 3 Table V, longitudes from the meridian of Dunkerque (the tower, taken at
	// the belfry of Saint-Éloi, 2°22′34″ E; drawing only). They reproduce the printed sides to
	// about 1e-3 only (his own spheroid and reductions): PosTol 5e-3 still catches a misread minute.
	{ID: "delambre", Kind: "delambre", Unit: 864 / 443.296, LonOrigin: 2 + 22.0/60 + 34.0/3600, PosTol: 5e-3, PosSoft: true, Cite: "J.-B. Delambre and P. Méchain, Base du système métrique décimal (Paris, 1806-1810), t. 1 pp. 513-542, t. 2 pp. 56 and 800-841",
		Bases: []Base{
			{"Lieursaint", "Melun", 6075.90},
			{"Vernet", "Salces", 6006.25},
		},
		Aliases: map[string]string{"Bayonvilliers": "Bayonvillers", "Ste -Montaine": "Ste.-Montaine"}},
	// Maclear: the Zwartland base (Δ1, printed p. 534), English feet; positions from the
	// Royal Observatory's meridian, 18°28′39″ E (drawing only).
	{ID: "maclear", Kind: "generic", Unit: 0.3048, LonOrigin: 18 + 28.0/60 + 39.0/3600, PosTol: 2e-4,
		Cite:  "T. Maclear, Verification and Extension of La Caille's Arc of Meridian at the Cape of Good Hope (London, 1866), pp. 533-558 and 589",
		Bases: []Base{{"West End of Base", "East End of Base", 42819.065}}},
	// Roy: the Hounslow Heath base, Hampton Poor-house to King's Arbour (triangle I, printed
	// p. 64) and the Romney Marsh base of verification, High Nook to Ruckinge (triangle XXIII,
	// printed p. 68), English feet. No station positions are printed: not drawn on the maps.
	{ID: "roy", Kind: "generic", Unit: 0.3048,
		Cite:    "W. Roy, An account of the trigonometrical operation whereby the distance between the meridians of the Royal Observatories of Greenwich and Paris has been determined, Phil. Trans. 80 (1790), pp. 64-79",
		Bases:   []Base{{"Hampton Poor-house", "King's Arbour", 27404.7}, {"High Nook near Dymchurch", "Ruckinge", 28532.92}},
		Aliases: map[string]string{"High Nook": "High Nook near Dymchurch"}},

	// Struve: the six bases reduced to sea level, toises (vol. 1, printed p. 76), the toise of
	// Peru, 1.949036591 m like Delambre's.
	{ID: "struve", Kind: "generic", Unit: 864 / 443.296,
		Cite: "F. G. W. Struve, Arc du méridien de 25° 20′ entre le Danube et la mer Glaciale, vol. 1 (St Petersburg, 1860), pp. 76, 96-102 and 111-143",
		Bases: []Base{
			{"Katko", "Woibifer", 2315.13307},
			{"Ponedeli", "Jakschti", 6055.16232},
			{"Ossownitza", "Tschekuzk", 5719.64316},
			{"Kusmin", "Pogarelaja", 4563.97153},
			{"Romankautzi", "Sselischtsche", 2910.09451},
			{"Taschbunar I", "Waissal", 2770.24614},
		}}}

// Cols is the header of a transcription page.
var Cols = []string{"page", "printed", "net", "k", "no", "station", "deg", "min", "sec", "corr", "sph", "exc", "log", "dist", "flag"}

// PosCols is the header of a positions page.
var PosCols = []string{"page", "printed", "state", "station", "alias", "lat_d", "lat_m", "lat_s", "lon_d", "lon_m", "lon_s", "flag"}

// cell is a printed number with its precision.
type cell struct {
	V float64
	U float64 // one unit of the last printed digit
}

func parseCell(s string) (cell, error) {
	t := strings.TrimSpace(s)
	v, err := strconv.ParseFloat(t, 64)
	if err != nil {
		return cell{}, fmt.Errorf("%q is not a number", s)
	}
	u := 1.0
	if i := strings.IndexByte(t, '.'); i >= 0 {
		u = math.Pow(10, -float64(len(t)-i-1))
	}
	return cell{v, u}, nil
}

// Row is one printed angle line.
type Row struct {
	Station                       string
	Deg, Min, Sec, Corr, Sph, Exc cell
	Log, Dist                     cell
	Flag                          string
	Page                          int
	DistM                         float64 // the side opposite, metres (0: not printed)
	DistP                         float64 // the same as printed, metres, kept when not used (to choose between homonyms)
	Derived                       bool    // the angle is concluded, not observed
}

// Tri is one printed triangle.
type Tri struct {
	Pub, File, Net string
	Page           int // PDF page of its first row
	K              string
	R              [3]Row
	Errs           []string // failed checks on the angles (the triangle is left out)
	SideErrs       []string // failed checks on the printed sides only (flagged: kept, sides unused)
}

// Stations returns the three station names, normalised.
func (t *Tri) Stations() [3]string {
	return [3]string{norm(t.R[0].Station), norm(t.R[1].Station), norm(t.R[2].Station)}
}

// Obs is the sum of the observed angles minus 180°, in arcseconds.
func (t *Tri) Obs() float64 {
	s := 0.0
	for _, r := range t.R {
		s += r.Deg.V*3600 + r.Min.V*60 + r.Sec.V
	}
	return s - 648000
}

var spaces = regexp.MustCompile(`\s+`)

func norm(s string) string {
	// case-insensitive: Struve's stations are printed in small capitals
	return strings.ToLower(spaces.ReplaceAllString(strings.TrimSpace(strings.ReplaceAll(s, "I'd.", "Island")), " "))
}

// Check runs the print checks on t and records the failures in t.Errs.
func (t *Tri) Check() {
	t.Errs, t.SideErrs = nil, nil
	add := func(f string, a ...any) { t.Errs = append(t.Errs, fmt.Sprintf(f, a...)) }
	var sph, exc [3]float64
	for i, r := range t.R {
		if !(r.Min.V >= 0 && r.Min.V < 60 && r.Sec.V >= 0 && r.Sec.V < 70 && r.Sph.V >= 0 && r.Sph.V < 70 && r.Deg.V >= 0 && r.Deg.V < 180 &&
			r.Deg.V*3600+r.Min.V*60+r.Sec.V > 0) {
			add("%s: angle out of bounds", r.Station)
		}
		us := math.Max(r.Sec.U, math.Max(r.Corr.U, r.Sph.U))
		dd := math.Mod(r.Sec.V+r.Corr.V-r.Sph.V+30+600, 60) - 30
		if math.Abs(dd) > 1.5*us+1e-9 {
			add("%s: obs+corr-sph = %+.4f″", r.Station, dd)
		}
		tl := r.Log.U + 0.5*r.Dist.U/(math.Max(r.Dist.V, 1e-9)*math.Ln10) + 1e-12
		if r.Dist.V <= 0 || math.Abs(math.Log10(math.Max(r.Dist.V, 1e-9))-r.Log.V) > tl {
			t.SideErrs = append(t.SideErrs, fmt.Sprintf("%s: log10(dist) - log = %+.2e", r.Station, math.Log10(math.Max(r.Dist.V, 1e-9))-r.Log.V))
		}
		sph[i] = r.Deg.V*3600 + r.Min.V*60 + r.Sph.V
		exc[i] = r.Exc.V
	}
	clo := sph[0] + sph[1] + sph[2] - 648000 - exc[0] - exc[1] - exc[2]
	tc := 0.0
	for _, r := range t.R {
		tc += 0.75*r.Sph.U + 0.75*r.Exc.U
	}
	if math.Abs(clo) > tc+1e-9 {
		add("closure Σsph-180°-Σexc = %+.4f″", clo)
	}
	var ratio, tol [3]float64
	for i, r := range t.R {
		a := (sph[i] - exc[i]) * Sec
		s := math.Sin(a)
		ratio[i] = r.Dist.V / s
		tol[i] = 0.5*r.Dist.U/r.Dist.V + r.Sph.U*Sec*math.Abs(math.Cos(a)/s) + 1e-7
	}
	m := (ratio[0] + ratio[1] + ratio[2]) / 3
	spread, ts := 0.0, 0.0
	for i := range ratio {
		spread = math.Max(spread, math.Abs(ratio[i]/m-1))
		ts = math.Max(ts, 2*tol[i])
	}
	if !(spread <= ts) {
		t.SideErrs = append(t.SideErrs, fmt.Sprintf("sine rule spread %.1e", spread))
	}
}

// Read loads every transcription page of a publication.
func Read(root string, pub string) ([]*Tri, error) {
	files, err := filepath.Glob(filepath.Join(root, Dir, pub, "transcription", "p*.csv"))
	if err != nil {
		return nil, err
	}
	sort.Strings(files)
	var out []*Tri
	for _, f := range files {
		tb, err := csvx.ReadFile(f)
		if err != nil {
			return nil, err
		}
		if strings.Join(tb.Header, ",") != strings.Join(Cols, ",") {
			return nil, fmt.Errorf("%s: header %v, want %v", f, tb.Header, Cols)
		}
		rel, _ := filepath.Rel(root, f)
		byK := map[string]*Tri{}
		var order []string
		count := map[string]int{}
		for _, r := range tb.Rows {
			k, _ := r.Get("k")
			t := byK[k]
			if t == nil {
				t = &Tri{Pub: pub, File: rel, K: k}
				t.Net, _ = r.Get("net")
				byK[k] = t
				order = append(order, k)
			}
			if count[k] >= 3 {
				return nil, fmt.Errorf("%s line %d: triangle %s has more than three rows", rel, r.Line, k)
			}
			row := Row{}
			row.Station, _ = r.Get("station")
			row.Flag, _ = r.Get("flag")
			pg, _ := r.Get("page")
			if row.Page, err = strconv.Atoi(strings.TrimSpace(pg)); err != nil {
				return nil, fmt.Errorf("%s line %d: page %q", rel, r.Line, pg)
			}
			for _, c := range []struct {
				name string
				dst  *cell
			}{{"deg", &row.Deg}, {"min", &row.Min}, {"sec", &row.Sec}, {"corr", &row.Corr}, {"sph", &row.Sph},
				{"exc", &row.Exc}, {"log", &row.Log}, {"dist", &row.Dist}} {
				s, _ := r.Get(c.name)
				v, err := parseCell(s)
				if err != nil {
					return nil, fmt.Errorf("%s line %d: %s %w", rel, r.Line, c.name, err)
				}
				*c.dst = v
			}
			row.DistM = row.Dist.V
			t.R[count[k]] = row
			if count[k] == 0 {
				t.Page = row.Page
			}
			count[k]++
		}
		for _, k := range order {
			if count[k] != 3 {
				return nil, fmt.Errorf("%s: triangle %s has %d rows", rel, k, count[k])
			}
			t := byK[k]
			t.Check()
			out = append(out, t)
		}
	}
	return out, nil
}

// Flagged reports whether a row of t carries a flag (a misprint verified on the image).
func (t *Tri) Flagged() bool {
	for _, r := range t.R {
		if strings.TrimSpace(r.Flag) != "" {
			return true
		}
	}
	return false
}

type pair [2]string

func mkpair(a, b string) pair {
	if a > b {
		a, b = b, a
	}
	return pair{a, b}
}

// side i of t is opposite station i.
func (t *Tri) side(i int) pair {
	s := t.Stations()
	return mkpair(s[(i+1)%3], s[(i+2)%3])
}

// CarryAngles returns the plane angles (rad) used to carry lengths through t: the
// three observed angles with the observed closure shared by thirds; or, when one
// angle is not trustworthy (concluded, or on a row flagged as misprinted in a
// triangle that fails a check), 180° minus the two others. Fewer than two sound
// angles: ok = false. No radius either way; such triangles never enter the fit.
func (t *Tri) CarryAngles() (pa [3]float64, ok bool) {
	bad := -1
	for j, r := range t.R {
		if r.Derived || (len(t.Errs) > 0 && strings.TrimSpace(r.Flag) != "") || r.Sec == (cell{}) {
			if bad >= 0 {
				return pa, false
			}
			bad = j
		}
	}
	var a [3]float64
	for j, r := range t.R {
		a[j] = r.Deg.V*3600 + r.Min.V*60 + r.Sec.V
	}
	if bad < 0 {
		eps := a[0] + a[1] + a[2] - 648000
		for j := range pa {
			pa[j] = (a[j] - eps/3) * Sec
		}
		return pa, true
	}
	for j := range pa {
		if j != bad {
			pa[j] = a[j] * Sec
		}
	}
	pa[bad] = math.Pi - pa[(bad+1)%3] - pa[(bad+2)%3]
	return pa, pa[bad] > 0
}

// Area is a triangle's radius-free area (m²) and how many triangles it lies
// from a measured base.
type Area struct {
	A     float64
	Depth int
	Sides [3]float64
}

// kn is a known length and its depth (triangles from a base).
type kn struct {
	L     float64
	Depth int
}

// PlaneAreas carries lengths from the bases through the triangles of one
// publication with the observed angles only (see the package doc) and
// returns the area of every triangle reached. Breadth-first by number of
// triangles from a base; ties broken by station names, so the result does
// not depend on map order. Returns also the number of ambiguous pairs.
func PlaneAreas(tris []*Tri, bases []Base) (map[*Tri]Area, int) {
	bySide := map[pair][]struct {
		t *Tri
		i int
	}{}
	plen := map[pair][]float64{}
	for _, t := range tris {
		for i := 0; i < 3; i++ {
			p := t.side(i)
			bySide[p] = append(bySide[p], struct {
				t *Tri
				i int
			}{t, i})
			if t.R[i].DistM > 0 {
				plen[p] = append(plen[p], t.R[i].DistM)
			}
		}
	}
	amb := 0
	for p, v := range plen {
		lo, hi := v[0], v[0]
		for _, x := range v {
			lo, hi = math.Min(lo, x), math.Max(hi, x)
		}
		if hi/lo-1 > 1e-4 {
			delete(bySide, p)
			amb++
		}
	}
	known := map[pair]kn{}
	var frontier []pair
	for _, b := range bases {
		p := mkpair(norm(b.A), norm(b.B))
		known[p] = kn{b.L, 0}
		frontier = append(frontier, p)
	}
	areas := map[*Tri]Area{}
	for depth := 0; len(frontier) > 0; depth++ {
		sort.Slice(frontier, func(i, j int) bool {
			if frontier[i][0] != frontier[j][0] {
				return frontier[i][0] < frontier[j][0]
			}
			return frontier[i][1] < frontier[j][1]
		})
		var next []pair
		for _, p := range frontier {
			L := known[p].L
			for _, ti := range bySide[p] {
				t := ti.t
				if _, done := areas[t]; done {
					continue
				}
				pa, ok := t.CarryAngles()
				if !ok {
					continue
				}
				k := L / math.Sin(pa[ti.i])
				var ls [3]float64
				for j := range ls {
					ls[j] = k * math.Sin(pa[j])
				}
				s := (ls[0] + ls[1] + ls[2]) / 2
				areas[t] = Area{A: math.Sqrt(s * (s - ls[0]) * (s - ls[1]) * (s - ls[2])), Depth: depth + 1, Sides: ls}
				for j := 0; j < 3; j++ {
					q := t.side(j)
					if _, ok := known[q]; !ok {
						known[q] = kn{ls[j], depth + 1}
						next = append(next, q)
					}
				}
			}
		}
		frontier = next
		if len(frontier) == 0 {
			frontier = quadClose(tris, areas, known, plen, func(q pair, L float64) { known[q] = kn{L, depth + 1} })
		}
	}
	return areas, amb
}

// quadClose finds sides no reached triangle carries but two reached triangles
// imply: (C, P, D) and (C, Q, D) share the ray C-D, so the angle PCQ is the sum or
// the difference of their angles at C, and PQ follows by the law of cosines (plane,
// no radius). The printed side PQ, where printed, only chooses between the sum and
// the difference (it must match within 1e-3); with no printed side nothing is added.
func quadClose(tris []*Tri, areas map[*Tri]Area, known map[pair]kn, plen map[pair][]float64, add func(pair, float64)) []pair {
	type ray struct {
		ang, len float64 // angle at C between C-other and C-D (rad), length C-other
	}
	// at station C, toward station D: the other stations X of reached triangles (C, X, D)
	at := map[[2]string]map[string]ray{}
	for _, t := range tris {
		a, ok := areas[t]
		if !ok {
			continue
		}
		pa, _ := t.CarryAngles()
		st := t.Stations()
		for c := 0; c < 3; c++ {
			for _, dd := range []int{1, 2} {
				d, x := (c+dd)%3, (c+3-dd)%3
				k := [2]string{st[c], st[d]}
				if at[k] == nil {
					at[k] = map[string]ray{}
				}
				// side C-X is opposite D
				at[k][st[x]] = ray{pa[c], a.Sides[d]}
			}
		}
	}
	var out []pair
	keys := make([][2]string, 0, len(at))
	for k := range at {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool { return keys[i][0]+"\x00"+keys[i][1] < keys[j][0]+"\x00"+keys[j][1] })
	for _, k := range keys {
		m := at[k]
		names := make([]string, 0, len(m))
		for n := range m {
			names = append(names, n)
		}
		sort.Strings(names)
		for i, p := range names {
			for _, q := range names[i+1:] {
				pq := mkpair(p, q)
				if _, ok := known[pq]; ok {
					continue
				}
				pr := plen[pq]
				if len(pr) == 0 {
					continue
				}
				rp, rq := m[p], m[q]
				best, bestErr := 0.0, math.Inf(1)
				for _, ang := range []float64{rp.ang + rq.ang, math.Abs(rp.ang - rq.ang)} {
					L := math.Sqrt(rp.len*rp.len + rq.len*rq.len - 2*rp.len*rq.len*math.Cos(ang))
					if e := math.Abs(L/pr[0] - 1); e < bestErr {
						best, bestErr = L, e
					}
				}
				if bestErr < 1e-3 {
					add(pq, best)
					out = append(out, pq)
				}
			}
		}
	}
	return out
}

// Point is one triangle in the fit: excess (″) and area (m²).
type Point struct {
	E, A float64
	Pub  string
	Page int
}

// FitK is the least-squares K (″ per m²) through the origin.
func FitK(ps []Point) float64 {
	n, d := 0.0, 0.0
	for _, p := range ps {
		n += p.E * p.A
		d += p.A * p.A
	}
	return n / d
}

// RadiusKm turns K (″/m²) into R (km).
func RadiusKm(k float64) float64 {
	if k <= 0 {
		return math.Inf(1)
	}
	return 1 / math.Sqrt(k*Sec) / 1000
}

// km rounds a radius for the output; an infinite one (K <= 0) is null.
func km(r float64) any {
	if math.IsInf(r, 0) || math.IsNaN(r) {
		return nil
	}
	return pyjson.Round(r, 1)
}

func sampleSD(xs []float64) float64 {
	m := 0.0
	for _, x := range xs {
		m += x
	}
	m /= float64(len(xs))
	s := 0.0
	for _, x := range xs {
		s += (x - m) * (x - m)
	}
	return math.Sqrt(s / float64(len(xs)-1))
}

// KeepLOO drops, iteratively, the triangles beyond 3 SD of the residuals of
// the others' through-zero fit. Returns the kept points and the dropped ones.
func KeepLOO(ps []Point) (keep, drop []Point) {
	keep = append([]Point(nil), ps...)
	for {
		var out []int
		for i := range keep {
			others := append(append([]Point(nil), keep[:i]...), keep[i+1:]...)
			k := FitK(others)
			res := make([]float64, len(others))
			for j, o := range others {
				res[j] = o.E - k*o.A
			}
			if math.Abs(keep[i].E-k*keep[i].A) > 3*sampleSD(res) {
				out = append(out, i)
			}
		}
		if len(out) == 0 {
			return keep, drop
		}
		var nk []Point
		j := 0
		for i, p := range keep {
			if j < len(out) && out[j] == i {
				drop = append(drop, p)
				j++
				continue
			}
			nk = append(nk, p)
		}
		keep = nk
	}
}

// Fit is one fit's summary.
type Fit struct {
	N, Dropped           int
	K, R, Lo, Hi         float64 // K ″/m²; R km; Lo/Hi bootstrap 16-84 % (km)
	Q025, Q25, Q75, Q975 float64 // bootstrap 2.5, 25, 75 and 97.5 % (km), for the box plot of the results tab
	Scatter              float64 // ″, sample SD of the residuals
	Bias, RBias          float64 // constant offset per triangle (″) and the R with it
	FlatOffset           float64 // flat best case: K = 0, offset = mean excess
	FlatScatter          float64
	Chi2Ratio            float64 // Σ flat residuals² / Σ globe residuals²
	SigmaK               float64 // K / its naive standard error
}

// Do fits ps (after the leave-one-out rule) with a page bootstrap.
func Do(ps []Point, seed uint64) Fit {
	keep, drop := KeepLOO(ps)
	f := Fit{N: len(keep), Dropped: len(drop)}
	f.K = FitK(keep)
	f.R = RadiusKm(f.K)
	res := make([]float64, len(keep))
	sa2, me, ma := 0.0, 0.0, 0.0
	for i, p := range keep {
		res[i] = p.E - f.K*p.A
		sa2 += p.A * p.A
		me += p.E
		ma += p.A
	}
	f.Scatter = sampleSD(res)
	f.SigmaK = f.K / (f.Scatter / math.Sqrt(sa2))
	n := float64(len(keep))
	me, ma = me/n, ma/n
	sxy, sxx := 0.0, 0.0
	for _, p := range keep {
		sxy += (p.A - ma) * (p.E - me)
		sxx += (p.A - ma) * (p.A - ma)
	}
	kb := sxy / sxx
	f.Bias, f.RBias = me-kb*ma, RadiusKm(kb)
	f.FlatOffset = me
	ss0, ssf := 0.0, 0.0
	fl := make([]float64, len(keep))
	for i, p := range keep {
		fl[i] = p.E - me
		ssf += fl[i] * fl[i]
		ss0 += res[i] * res[i]
	}
	f.FlatScatter = sampleSD(fl)
	f.Chi2Ratio = ssf / ss0
	// bootstrap over printed pages
	type key struct {
		pub  string
		page int
	}
	groups := map[key][]Point{}
	var keys []key
	for _, p := range keep {
		k := key{p.Pub, p.Page}
		if _, ok := groups[k]; !ok {
			keys = append(keys, k)
		}
		groups[k] = append(groups[k], p)
	}
	sort.Slice(keys, func(i, j int) bool {
		if keys[i].pub != keys[j].pub {
			return keys[i].pub < keys[j].pub
		}
		return keys[i].page < keys[j].page
	})
	rng := rand.New(rand.NewPCG(seed, 0x5eed))
	const nb = 2000
	rs := make([]float64, 0, nb)
	for b := 0; b < nb; b++ {
		var smp []Point
		for range keys {
			smp = append(smp, groups[keys[rng.IntN(len(keys))]]...)
		}
		rs = append(rs, FitK(smp))
	}
	// quantiles on K (R falls as K grows); K <= 0, a flat or saddle surface, is R = +Inf
	sort.Float64s(rs)
	q := func(p float64) float64 { return RadiusKm(rs[int(float64(nb)*(1-p))]) }
	f.Lo, f.Hi = q(0.16), q(0.84)
	f.Q025, f.Q25, f.Q75, f.Q975 = q(0.025), q(0.25), q(0.75), q(0.975)
	return f
}

// Position is a station's printed geographic position (Clarke 1866, drawing only).
type Position struct {
	Lat, Lon float64 // degrees, east positive
	Name     string
	Flag     string // a misprint of the position verified on the image: drawn, not checked
}

// ReadPositions loads data/surv/excess/<pub>/positions/*.csv (absent: none). A name
// may have several positions: two stations of the same name in different states
// (Humpback, Maine and Virginia, in SP7); Locate picks the right one per triangle.
func ReadPositions(root, pub string) (map[string][]Position, []string, error) {
	files, _ := filepath.Glob(filepath.Join(root, Dir, pub, "positions", "p*.csv"))
	sort.Strings(files)
	out := map[string][]Position{}
	var inputs []string
	for _, f := range files {
		tb, err := csvx.ReadFile(f)
		if err != nil {
			return nil, nil, err
		}
		if strings.Join(tb.Header, ",") != strings.Join(PosCols, ",") {
			return nil, nil, fmt.Errorf("%s: header %v, want %v", f, tb.Header, PosCols)
		}
		rel, _ := filepath.Rel(root, f)
		inputs = append(inputs, rel)
		for _, r := range tb.Rows {
			var v [6]float64
			for i, c := range []string{"lat_d", "lat_m", "lat_s", "lon_d", "lon_m", "lon_s"} {
				s, _ := r.Get(c)
				x, err := strconv.ParseFloat(strings.TrimSpace(s), 64)
				if err != nil {
					return nil, nil, fmt.Errorf("%s line %d: %s %q", rel, r.Line, c, s)
				}
				v[i] = x
			}
			name, _ := r.Get("station")
			alias, _ := r.Get("alias")
			flag, _ := r.Get("flag")
			p := Position{Lat: v[0] + v[1]/60 + v[2]/3600, Lon: -(v[3] + v[4]/60 + v[5]/3600), Name: norm(name), Flag: strings.TrimSpace(flag)}
			out[strings.ToLower(norm(name))] = append(out[strings.ToLower(norm(name))], p)
			if a := norm(alias); a != "" {
				out[strings.ToLower(a)] = append(out[strings.ToLower(a)], p)
			}
		}
	}
	return out, inputs, nil
}

// Clarke 1866 semi-axes (m).
const clarkeA, clarkeB = 6378206.4, 6356583.8

// Vincenty is the geodesic distance (m) on the Clarke 1866 ellipsoid
// (Vincenty 1975, inverse formula).
func Vincenty(lat1, lon1, lat2, lon2 float64) float64 {
	a, b := clarkeA, clarkeB
	f := (a - b) / a
	L := (lon2 - lon1) * math.Pi / 180
	U1 := math.Atan((1 - f) * math.Tan(lat1*math.Pi/180))
	U2 := math.Atan((1 - f) * math.Tan(lat2*math.Pi/180))
	sU1, cU1, sU2, cU2 := math.Sin(U1), math.Cos(U1), math.Sin(U2), math.Cos(U2)
	lam := L
	var ss, cs, sig, c2a, c2m float64
	for i := 0; i < 200; i++ {
		sl, cl := math.Sin(lam), math.Cos(lam)
		ss = math.Hypot(cU2*sl, cU1*sU2-sU1*cU2*cl)
		if ss == 0 {
			return 0
		}
		cs = sU1*sU2 + cU1*cU2*cl
		sig = math.Atan2(ss, cs)
		sa := cU1 * cU2 * sl / ss
		c2a = 1 - sa*sa
		c2m = 0
		if c2a != 0 {
			c2m = cs - 2*sU1*sU2/c2a
		}
		C := f / 16 * c2a * (4 + f*(4-3*c2a))
		lp := lam
		lam = L + (1-C)*f*sa*(sig+C*ss*(c2m+C*cs*(-1+2*c2m*c2m)))
		if math.Abs(lam-lp) < 1e-13 {
			break
		}
	}
	u2 := c2a * (a*a - b*b) / (b * b)
	k1 := (math.Sqrt(1+u2) - 1) / (math.Sqrt(1+u2) + 1)
	A := (1 + k1*k1/4) / (1 - k1)
	B := k1 * (1 - 3*k1*k1/8)
	ds := B * ss * (c2m + B/4*(cs*(-1+2*c2m*c2m)-B/6*c2m*(-3+4*ss*ss)*(-3+4*c2m*c2m)))
	return b * A * (sig - ds)
}

// Locate picks, for each vertex of t, among the positions of that name, the
// combination whose Clarke 1866 distances best reproduce the printed sides
// (homonyms: the right Humpback is the one 30 km from the others, not 900).
func Locate(t *Tri, pos map[string][]Position) [3]*Position {
	st := t.Stations()
	var cand [3][]*Position
	for i, s := range st {
		ps := pos[strings.ToLower(s)]
		for k := range ps {
			cand[i] = append(cand[i], &ps[k])
		}
		if len(cand[i]) == 0 {
			cand[i] = []*Position{nil}
		}
	}
	var best [3]*Position
	bestCost := math.Inf(1)
	for _, a := range cand[0] {
		for _, b := range cand[1] {
			for _, c := range cand[2] {
				pick := [3]*Position{a, b, c}
				cost := 0.0
				for i := 0; i < 3; i++ {
					p, q := pick[(i+1)%3], pick[(i+2)%3]
					if p != nil && q != nil {
						d := t.R[i].DistM
						if d == 0 {
							d = t.R[i].DistP
						}
						if d > 0 {
							cost += math.Abs(Vincenty(p.Lat, p.Lon, q.Lat, q.Lon)/d - 1)
						} else {
							// no printed side: of two homonyms, the nearer one (a survey triangle is small)
							cost += Vincenty(p.Lat, p.Lon, q.Lat, q.Lon) / 1e7
						}
					}
				}
				if cost < bestCost {
					bestCost, best = cost, pick
				}
			}
		}
	}
	return best
}

// aeFwd is the azimuthal equidistant projection centred on (lat0, lon0), in
// degrees of arc on the map (src/core/aeproj.js makeAE, without rotation).
func aeFwd(lat0, lon0, lat, lon float64) (x, y float64) {
	d := math.Pi / 180
	s1, c1 := math.Sin(lat0*d), math.Cos(lat0*d)
	sp, cp, dl := math.Sin(lat*d), math.Cos(lat*d), (lon-lon0)*d
	ex, ny := cp*math.Sin(dl), c1*sp-s1*cp*math.Cos(dl)
	c := math.Atan2(math.Hypot(ex, ny), s1*sp+c1*cp*math.Cos(dl))
	n := math.Hypot(ex, ny)
	if n < 1e-15 {
		return 0, 0
	}
	return c * ex / n / d, c * ny / n / d
}

// FlatMap is how a flat azimuthal map with the best scale (km per degree of
// map) carries the printed sides: the ratio map length / printed length.
type FlatMap struct {
	Lat0, Lon0, KmPerDeg float64
	Lo, Hi, RMS          float64 // ratio range (1st-99th percentile) and RMS of log ratio
}

type side struct {
	a, b *Position
	d    float64
}

func flatFit(sides []side, lat0, lon0 float64) FlatMap {
	logs := make([]float64, len(sides))
	m := 0.0
	for i, s := range sides {
		x1, y1 := aeFwd(lat0, lon0, s.a.Lat, s.a.Lon)
		x2, y2 := aeFwd(lat0, lon0, s.b.Lat, s.b.Lon)
		logs[i] = math.Log(math.Hypot(x2-x1, y2-y1) / (s.d / 1000))
		m += logs[i]
	}
	m /= float64(len(logs))
	f := FlatMap{Lat0: lat0, Lon0: lon0, KmPerDeg: math.Exp(-m)}
	r := make([]float64, len(logs))
	ss := 0.0
	for i, l := range logs {
		r[i] = math.Exp(l - m)
		ss += (l - m) * (l - m)
	}
	sort.Float64s(r)
	f.Lo, f.Hi, f.RMS = r[len(r)/100], r[len(r)*99/100], math.Sqrt(ss/float64(len(r)))
	return f
}

// FlatMaps returns the North-Pole map (the flat-Earth map) and the best
// centre found by a 1° grid then a 0.1° refinement (rule 2: the flat model's
// free parameters set in its favour).
func FlatMaps(sides []side) (np, best FlatMap) {
	// the search starts at the stations' mean position: a 1° grid 15° around it, then 0.1°
	var la, lo float64
	for _, s := range sides {
		la += s.a.Lat + s.b.Lat
		lo += s.a.Lon + s.b.Lon
	}
	la, lo = la/float64(2*len(sides)), lo/float64(2*len(sides))
	np = flatFit(sides, 90, -95)
	best = flatFit(sides, la, lo)
	search := func(la0, la1, lo0, lo1, step float64) {
		for a := la0; a <= la1+1e-9; a += step {
			for o := lo0; o <= lo1+1e-9; o += step {
				if f := flatFit(sides, a, o); f.RMS < best.RMS {
					best = f
				}
			}
		}
	}
	search(math.Max(-89, la-15), math.Min(89, la+15), lo-15, lo+15, 1)
	search(best.Lat0-1, best.Lat0+1, best.Lon0-1, best.Lon0+1, 0.1)
	return np, best
}

// Result is the whole computation.
type Result struct {
	Tris          []*Tri
	Bad           []string // unflagged check failures (the build fails)
	Misprints     int      // triangles left out for a verified misprint
	Derived       int      // triangles with a concluded angle (sum forced), left out
	BadSides      int      // triangles kept whose printed sides are misprinted (not used)
	Unreached     int      // triangles no base reaches
	Ambiguous     int      // station pairs printed with incompatible lengths
	Points        []Point
	Fit           Fit
	PerPub        map[string]Fit
	Areas         map[*Tri]Area
	Pos           map[string]map[string][]Position
	Loc           map[*Tri][3]*Position // the position chosen for each vertex (nil: none)
	PosBad        []string              // positions that do not reproduce a printed side
	PosChecked    int
	RPrinted      float64               // the fit with areas from the printed sides (km)
	FlatNP        FlatMap               // the North-Pole azimuthal map, best scale
	FlatBest      FlatMap               // the best-centred azimuthal map, best scale
	FlatPub       map[string][2]FlatMap // per source: North-Pole map and best-centred map
	UnreachedList []string
	PosWarn       []string // positions contradicting their sides in a PosSoft source (not drawn)
	Inputs        []string
}

// Compute reads, checks and fits everything.
func Compute(root string) (*Result, error) {
	res := &Result{PerPub: map[string]Fit{}, Areas: map[*Tri]Area{}, Pos: map[string]map[string][]Position{}, Loc: map[*Tri][3]*Position{}, FlatPub: map[string][2]FlatMap{}}
	var allSides []side
	for _, pub := range Pubs {
		var tris []*Tri
		var err error
		switch pub.Kind {
		case "delambre":
			tris, err = ReadDelambre(root, pub.ID, pub.Unit)
		case "generic":
			tris, err = ReadGeneric(root, pub.ID, pub.Unit, pub.Spherical)
		default:
			tris, err = Read(root, pub.ID)
		}
		if err != nil {
			return nil, err
		}
		for _, t := range tris {
			for i := range t.R {
				if a, ok := pub.Aliases[strings.TrimSpace(t.R[i].Station)]; ok {
					t.R[i].Station = a
				}
			}
		}
		files, _ := filepath.Glob(filepath.Join(root, Dir, pub.ID, "transcription", "p*.csv"))
		sort.Strings(files)
		for _, f := range files {
			rel, _ := filepath.Rel(root, f)
			res.Inputs = append(res.Inputs, rel)
		}
		var good, carriers []*Tri
		for _, t := range tris {
			res.Tris = append(res.Tris, t)
			if len(t.Errs) > 0 {
				if !t.Flagged() {
					res.Bad = append(res.Bad, fmt.Sprintf("%s triangle %s: %s", t.File, t.K, strings.Join(append(t.Errs, t.SideErrs...), "; ")))
				}
				res.Misprints++
				carriers = append(carriers, t) // its sound angles may still carry lengths (CarryAngles)
				continue
			}
			if len(t.SideErrs) > 0 {
				if !t.Flagged() {
					res.Bad = append(res.Bad, fmt.Sprintf("%s triangle %s: %s", t.File, t.K, strings.Join(t.SideErrs, "; ")))
					continue
				}
				// a misprinted side: the angles are sound, the printed sides are not used
				for i := range t.R {
					t.R[i].DistP, t.R[i].DistM = t.R[i].DistM, 0
				}
				res.BadSides++
			}
			if t.Derived() {
				res.Derived++
				// a concluded angle is 180° minus the two others (plane): it still carries
				// lengths from one triangle to the next, but its sum never enters the fit
				carriers = append(carriers, t)
				continue
			}
			good = append(good, t)
			carriers = append(carriers, t)
		}
		bases := make([]Base, len(pub.Bases))
		for i, b := range pub.Bases {
			bases[i] = Base{b.A, b.B, b.L * pub.Unit}
		}
		areas, amb := PlaneAreas(carriers, bases)
		res.Ambiguous += amb
		var pts []Point
		for _, t := range good {
			a, ok := areas[t]
			if !ok {
				res.Unreached++
				res.UnreachedList = append(res.UnreachedList, fmt.Sprintf("%s p%d %v", pub.ID, t.Page, t.Stations()))
				continue
			}
			res.Areas[t] = a
			pts = append(pts, Point{E: t.Obs(), A: a.A, Pub: pub.ID, Page: t.Page})
		}
		res.Points = append(res.Points, pts...)
		if len(pts) > 2 {
			res.PerPub[pub.ID] = Do(pts, 1)
		}
		pos, in, err := ReadPositions(root, pub.ID)
		for _, ps := range pos {
			for k := range ps {
				ps[k].Lon += pub.LonOrigin
			}
		}
		if err != nil {
			return nil, err
		}
		res.Inputs = append(res.Inputs, in...)
		res.Pos[pub.ID] = pos
		seen := map[pair]bool{}
		type chk struct {
			a, b *Position
			g, d float64
		}
		var chks []chk
		var pubSides []side
		for _, t := range good {
			loc := Locate(t, pos)
			res.Loc[t] = loc
			st := t.Stations()
			for i := 0; i < 3; i++ {
				pa, pb := loc[(i+1)%3], loc[(i+2)%3]
				p := mkpair(strings.ToLower(st[(i+1)%3]), strings.ToLower(st[(i+2)%3]))
				if pa == nil || pb == nil || seen[p] || pa.Flag != "" || pb.Flag != "" || t.R[i].DistM == 0 {
					continue
				}
				seen[p] = true
				res.PosChecked++
				chks = append(chks, chk{pa, pb, Vincenty(pa.Lat, pa.Lon, pb.Lat, pb.Lon), t.R[i].DistM})
				pubSides = append(pubSides, side{pa, pb, t.R[i].DistM})
			}
		}
		// each source computed its positions on its own spheroid and length standard (Maclear's
		// feet, Delambre's toise): a misread shows as a departure from the source's median ratio
		if len(chks) > 0 {
			rs := make([]float64, len(chks))
			for i, c := range chks {
				rs[i] = c.g / c.d
			}
			sort.Float64s(rs)
			med := rs[len(rs)/2]
			tol := pub.PosTol
			if tol == 0 {
				tol = 2e-5
			}
			for _, c := range chks {
				if math.Abs(c.g/c.d/med-1) > tol {
					msg := fmt.Sprintf("%s: %s-%s Clarke %.2f m, printed %.2f m (source ratio %.6f)", pub.ID, c.a.Name, c.b.Name, c.g, c.d, med)
					if !pub.PosSoft {
						res.PosBad = append(res.PosBad, msg)
						continue
					}
					res.PosWarn = append(res.PosWarn, msg)
					for t, l := range res.Loc {
						for i := 0; i < 3; i++ {
							if l[(i+1)%3] == c.a && l[(i+2)%3] == c.b || l[(i+1)%3] == c.b && l[(i+2)%3] == c.a {
								res.Loc[t] = [3]*Position{} // not drawn
							}
						}
					}
				}
			}
		}
		if len(pubSides) > 100 {
			np, best := FlatMaps(pubSides)
			res.FlatPub[pub.ID] = [2]FlatMap{np, best}
		}
		allSides = append(allSides, pubSides...)
	}
	res.Fit = Do(res.Points, 1)
	// alternative: the same fit with Heron on the PRINTED sides (which went through a computed excess)
	var printed []Point
	for _, t := range res.Tris {
		if _, ok := res.Areas[t]; !ok {
			continue
		}
		a, b, c := t.R[0].DistM, t.R[1].DistM, t.R[2].DistM
		if a == 0 || b == 0 || c == 0 {
			continue
		}
		s := (a + b + c) / 2
		printed = append(printed, Point{E: t.Obs(), A: math.Sqrt(s * (s - a) * (s - b) * (s - c)), Pub: t.Pub, Page: t.Page})
	}
	keep, _ := KeepLOO(printed)
	res.RPrinted = RadiusKm(FitK(keep))
	if len(allSides) > 100 {
		res.FlatNP, res.FlatBest = FlatMaps(allSides)
	}
	return res, nil
}

// r4 rounds for the output.
func r4(x float64) float64 { return pyjson.Round(x, 4) }

// File renders the preset.
func (res *Result) File() preset.File {
	var b strings.Builder
	fitObj := func(f Fit) pyjson.Obj {
		return pyjson.Obj{
			{K: "n", V: f.N}, {K: "dropped", V: f.Dropped},
			{K: "R", V: km(f.R)}, {K: "lo", V: km(f.Lo)}, {K: "hi", V: km(f.Hi)},
			{K: "q", V: []any{km(f.Q025), km(f.Q25), km(f.Q75), km(f.Q975)}},
			{K: "K", V: f.K * Sec}, {K: "kSigma", V: pyjson.Round(f.SigmaK, 1)},
			{K: "scatter", V: pyjson.Round(f.Scatter, 3)},
			{K: "bias", V: pyjson.Round(f.Bias, 3)}, {K: "Rbias", V: km(f.RBias)},
			{K: "flatOffset", V: pyjson.Round(f.FlatOffset, 3)}, {K: "flatScatter", V: pyjson.Round(f.FlatScatter, 3)},
			{K: "chi2Ratio", V: pyjson.Round(f.Chi2Ratio, 2)},
		}
	}
	flatObj := func(f FlatMap) pyjson.Obj {
		return pyjson.Obj{{K: "lat0", V: pyjson.Round(f.Lat0, 1)}, {K: "lon0", V: pyjson.Round(f.Lon0, 1)}, {K: "kmPerDeg", V: pyjson.Round(f.KmPerDeg, 2)},
			{K: "lo", V: r4(f.Lo)}, {K: "hi", V: r4(f.Hi)}, {K: "rms", V: pyjson.Round(f.RMS, 5)}}
	}
	pubs := make([]any, 0, len(Pubs))
	for _, p := range Pubs {
		o := pyjson.Obj{{K: "id", V: p.ID}, {K: "cite", V: p.Cite}, {K: "bases", V: len(p.Bases)}, {K: "fit", V: fitObj(res.PerPub[p.ID])}}
		if fm, ok := res.FlatPub[p.ID]; ok {
			o = append(o, pyjson.KV{K: "flatNP", V: flatObj(fm[0])}, pyjson.KV{K: "flatBest", V: flatObj(fm[1])})
		}
		pubs = append(pubs, o)
	}
	b.WriteString("export const SURV_EXCESS = " + pyjson.Dumps(pyjson.Obj{
		{K: "pubs", V: pubs},
		{K: "fit", V: fitObj(res.Fit)},
		{K: "triangles", V: len(res.Tris)}, {K: "misprints", V: res.Misprints},
		{K: "unreached", V: res.Unreached}, {K: "ambiguous", V: res.Ambiguous},
		{K: "Rprinted", V: pyjson.Round(res.RPrinted, 1)},
		{K: "flatNP", V: flatObj(res.FlatNP)}, {K: "flatBest", V: flatObj(res.FlatBest)},
	}, pyjson.Indented(1)) + ";\n")
	// stations with a position, per publication; triangles: [pub, page, eps ″, area km², depth, i, j, k]
	idx := map[string]int{}
	var stations []any
	pubIdx := map[string]int{}
	for i, p := range Pubs {
		pubIdx[p.ID] = i
	}
	b.WriteString("// [pub index, PDF page, observed excess ″, radius-free area km², triangles from a base, station indices (-1: no position) ×3, printed sides km ×3 (side i opposite station i)]\n")
	b.WriteString("export const SURV_EXCESS_TRI = [\n")
	for _, t := range res.Tris {
		a, ok := res.Areas[t]
		if !ok {
			continue
		}
		row := []any{pubIdx[t.Pub], t.Page, r4(t.Obs()), r4(a.A / 1e6), a.Depth}
		for _, p := range res.Loc[t] {
			key := ""
			if p != nil {
				key = fmt.Sprintf("%s:%.6f:%.6f", t.Pub, p.Lat, p.Lon)
			}
			if p == nil {
				row = append(row, -1)
				continue
			}
			if _, seen := idx[key]; !seen {
				idx[key] = len(stations)
				stations = append(stations, []any{r4(p.Lat), r4(p.Lon)})
			}
			row = append(row, idx[key])
		}
		for _, r := range t.R {
			row = append(row, pyjson.Round(r.DistM/1000, 5))
		}
		b.WriteString("  " + pyjson.Dumps(row, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	b.WriteString("// station positions [lat, lon] (deg, east positive), Clarke 1866 as printed: drawing only\n")
	b.WriteString("export const SURV_EXCESS_ST = " + pyjson.Dumps(stations, pyjson.Compact) + ";\n")
	return preset.File{
		Out:     Out,
		Command: "build surv-excess",
		Inputs:  res.Inputs,
		Notes: []string{
			"Curvature from the observed angle sums of survey triangles (Schott, USC&GS Special Publications 4 and 7,",
			"our transcription in data/surv/excess/). Excess = observed angles - 180° (″); areas carried from the measured",
			"bases with the observed angles only (no radius; bases printed reduced to sea level, ~1e-6). Fit through zero,",
			"3-SD leave-one-out, bootstrap over printed pages (16-84 %). Positions only draw the triangles.",
		},
		Body: b.String(),
	}
}

// Summary is the one-line report of `fog build`.
func (res *Result) Summary() string {
	return fmt.Sprintf("%d triangles (%d misprints left out, %d not reached from a base, %d ambiguous pairs), fit %d (−%d): R = %.0f km (%.0f–%.0f); %d sides checked against positions (%d contradicted, not drawn); flat map, pole: %.3f–%.3f, best centre (%.1f, %.1f): %.4f–%.4f",
		len(res.Tris), res.Misprints, res.Unreached, res.Ambiguous, res.Fit.N, res.Fit.Dropped, res.Fit.R, res.Fit.Lo, res.Fit.Hi, res.PosChecked, len(res.PosWarn),
		res.FlatNP.Lo, res.FlatNP.Hi, res.FlatBest.Lat0, res.FlatBest.Lon0, res.FlatBest.Lo, res.FlatBest.Hi)
}
