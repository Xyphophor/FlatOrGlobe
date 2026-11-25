package survexcess

// Readers of the European and African surveys (2026-10-28): Delambre & Méchain's
// "Tableau général des triangles" (Base du système métrique, t. 1, 1806, with the
// sides of t. 2, 1807) and a common format for Roy (Phil. Trans., 1790), Maclear
// (Cape arc, 1866) and Struve (Arc du méridien, 1857-1860). As for Schott, every
// row is our transcription from the page images and the printed check quantities
// must hold (research/surv_excess_check_delambre.py and _generic.py, same rules).
//
// Delambre: observed angle, excess, spherical angle = observed + one third of the
// closing error (t. 2 p. 700), chord angle = spherical − excess; sides from t. 2.
// Generic: observed angle, the printed adjusted angle (plane: Roy "corrected for
// calculation", Maclear "reduced angles", Struve "angles plans"), the printed sum
// of the observed angles and the triangle's excess, sides as printed.
// A derived ("conclu", dotted) angle is marked: its triangle's sum is forced and
// never enters the fit.

import (
	"fmt"
	"math"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/csvx"
)

// DelambreCols is the header of a Delambre page.
var DelambreCols = []string{"page", "printed", "k", "no", "station", "reg", "deg", "min", "sec", "exc", "sph_deg", "sph_min", "sph_sec",
	"cord_sec", "log", "dist", "t2page", "flag"}

// GenericCols is the header of a Roy, Maclear or Struve page.
var GenericCols = []string{"page", "printed", "net", "k", "no", "station", "deg", "min", "sec", "derived", "adj_sec", "log", "dist",
	"sum_deg", "sum_min", "sum_sec", "exc", "flag"}

func optCell(s string) (cell, bool, error) {
	if strings.TrimSpace(s) == "" {
		return cell{}, false, nil
	}
	c, err := parseCell(s)
	return c, err == nil, err
}

// readPages groups the rows of every page of a source by triangle and hands each
// triangle's raw rows to build.
func readPages(root, pub string, cols []string, build func(rel string, rows []csvx.Row) (*Tri, error)) ([]*Tri, error) {
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
		if strings.Join(tb.Header, ",") != strings.Join(cols, ",") {
			return nil, fmt.Errorf("%s: header %v, want %v", f, tb.Header, cols)
		}
		rel, _ := filepath.Rel(root, f)
		byK := map[string][]csvx.Row{}
		var order []string
		for _, r := range tb.Rows {
			k, _ := r.Get("k")
			if _, ok := byK[k]; !ok {
				order = append(order, k)
			}
			byK[k] = append(byK[k], r)
		}
		for _, k := range order {
			if len(byK[k]) != 3 {
				return nil, fmt.Errorf("%s: triangle %s has %d rows", rel, k, len(byK[k]))
			}
			t, err := build(rel, byK[k])
			if err != nil {
				return nil, err
			}
			t.Pub, t.File, t.K = pub, rel, k
			out = append(out, t)
		}
	}
	return out, nil
}

func get(r csvx.Row, c string) string { v, _ := r.Get(c); return strings.TrimSpace(v) }

// common fills the fields every format shares: station, flag, page, observed angle.
func common(rel string, r csvx.Row, row *Row) error {
	row.Station, row.Flag = get(r, "station"), get(r, "flag")
	pg, err := strconv.Atoi(get(r, "page"))
	if err != nil {
		return fmt.Errorf("%s line %d: page", rel, r.Line)
	}
	row.Page = pg
	for _, c := range []struct {
		n string
		d *cell
	}{{"deg", &row.Deg}, {"min", &row.Min}, {"sec", &row.Sec}} {
		v, ok, err := optCell(get(r, c.n))
		if err != nil {
			return fmt.Errorf("%s line %d: %s %w", rel, r.Line, c.n, err)
		}
		if !ok {
			row.Derived = true // an angle with no observed value cannot enter the sum
		}
		*c.d = v
	}
	return nil
}

func secOf(c cell, deg, min cell) float64 { return deg.V*3600 + min.V*60 + c.V }

// ReadDelambre reads data/surv/excess/<pub>/transcription in Delambre's format.
func ReadDelambre(root, pub string, unit float64) ([]*Tri, error) {
	return readPages(root, pub, DelambreCols, func(rel string, rows []csvx.Row) (*Tri, error) {
		t := &Tri{}
		t.Net = "Tableau général des triangles"
		var sph, exc, cord [3]float64
		var us, ue, uc float64
		missing := false // excess and spherical angles not printed (the triangles with a concluded angle)
		for i, r := range rows {
			row := &t.R[i]
			if err := common(rel, r, row); err != nil {
				return nil, err
			}
			if get(r, "reg") == "*" {
				row.Derived = true
			}
			var c [5]cell
			for j, n := range []string{"exc", "sph_deg", "sph_min", "sph_sec", "cord_sec"} {
				v, ok, err := optCell(get(r, n))
				if err != nil {
					return nil, fmt.Errorf("%s line %d: %s %w", rel, r.Line, n, err)
				}
				if !ok {
					missing = true
				}
				c[j] = v
			}
			row.Exc = c[0]
			sph[i], exc[i], cord[i] = c[1].V*3600+c[2].V*60+c[3].V, c[0].V, c[4].V
			us, ue, uc = math.Max(us, math.Max(c[3].U, row.Sec.U)), math.Max(ue, c[0].U), math.Max(uc, c[4].U)
			if err := sides(rel, r, row, unit); err != nil {
				return nil, err
			}
			if i == 0 {
				t.Page = row.Page
			}
		}
		add := func(f string, a ...any) { t.Errs = append(t.Errs, fmt.Sprintf(f, a...)) }
		if missing {
			if !t.Derived() {
				add("excess or spherical angles missing on a triangle with no concluded angle")
			}
			return t, nil
		}
		if clo := sph[0] + sph[1] + sph[2] - 648000 - exc[0] - exc[1] - exc[2]; math.Abs(clo) > 1.5*us+1.5*ue+1e-9 {
			add("Σsph-180°-Σexc = %+.3f″", clo)
		}
		if !t.Derived() {
			var d [3]float64
			for i := range d {
				d[i] = sph[i] - secOf(t.R[i].Sec, t.R[i].Deg, t.R[i].Min)
			}
			if math.Max(d[0], math.Max(d[1], d[2]))-math.Min(d[0], math.Min(d[1], d[2])) > 2.5*us+1e-9 {
				add("sph-obs unequal (%.2f, %.2f, %.2f)", d[0], d[1], d[2])
			}
		}
		for i := range sph {
			if dd := math.Mod(math.Mod(sph[i]-exc[i], 60)-cord[i]+90, 60) - 30; math.Abs(dd) > 1.5*math.Max(uc, math.Max(us, ue))+1e-9 {
				add("%s: chord ≠ sph-exc (%+.2f″)", t.R[i].Station, dd)
			}
		}
		var ang [3]float64
		for i := range ang {
			ang[i] = sph[i] - exc[i]
		}
		sineRule(t, ang, us)
		return t, nil
	})
}

// ReadGeneric reads Roy, Maclear and Struve pages.
func ReadGeneric(root, pub string, unit float64, spherical bool) ([]*Tri, error) {
	return readPages(root, pub, GenericCols, func(rel string, rows []csvx.Row) (*Tri, error) {
		t := &Tri{}
		t.Net = get(rows[0], "net")
		var adj [3]float64
		haveAdj := true
		var us, ua float64
		for i, r := range rows {
			row := &t.R[i]
			if err := common(rel, r, row); err != nil {
				return nil, err
			}
			if get(r, "derived") != "" {
				row.Derived = true
			}
			us = math.Max(us, row.Sec.U)
			if err := sides(rel, r, row, unit); err != nil {
				return nil, err
			}
			a, ok, err := optCell(get(r, "adj_sec"))
			if err != nil {
				return nil, fmt.Errorf("%s line %d: adj_sec %w", rel, r.Line, err)
			}
			if !ok || row.Derived && row.Sec == (cell{}) {
				haveAdj = false
			} else {
				o := secOf(row.Sec, row.Deg, row.Min)
				base := o - math.Mod(o, 60)
				best := base + a.V
				for _, m := range []float64{-60, 60} {
					if math.Abs(base+a.V+m-o) < math.Abs(best-o) {
						best = base + a.V + m
					}
				}
				adj[i] = best
				ua = math.Max(ua, a.U)
			}
			if i == 0 {
				t.Page = row.Page
			}
		}
		add := func(f string, a ...any) { t.Errs = append(t.Errs, fmt.Sprintf(f, a...)) }
		r0 := rows[0]
		exc := 0.0
		if e, ok, _ := optCell(get(r0, "exc")); ok {
			exc = e.V
			t.R[0].Exc = e
		}
		if !t.Derived() {
			if s, ok, _ := optCell(get(r0, "sum_sec")); ok {
				d, _ := parseCell(get(r0, "sum_deg"))
				m, _ := parseCell(get(r0, "sum_min"))
				obs := 0.0
				for _, row := range t.R {
					obs += secOf(row.Sec, row.Deg, row.Min)
				}
				if diff := obs - (d.V*3600 + m.V*60 + s.V); math.Abs(diff) > 1.5*math.Max(us, s.U)+1e-9 {
					add("Σobs - printed sum = %+.3f″", diff)
				}
			}
		}
		if haveAdj && !t.Derived() {
			target := 648000.0
			if spherical {
				target += exc
			}
			if d := adj[0] + adj[1] + adj[2] - target; math.Abs(d) > 1.5*ua+1e-9 {
				add("Σadjusted - target = %+.3f″", d)
			}
			for i, row := range t.R {
				if math.Abs(adj[i]-secOf(row.Sec, row.Deg, row.Min)) > 10 {
					add("%s: adjusted - observed > 10″", row.Station)
				}
			}
			ang := adj
			if spherical {
				for i := range ang {
					ang[i] -= exc / 3
				}
			}
			sineRule(t, ang, ua)
		}
		return t, nil
	})
}

// sides reads the printed side opposite the row's station: dist (printed unit) or
// 10^log; DistM in metres (0: not printed). log and dist must agree when both are there.
func sides(rel string, r csvx.Row, row *Row, unit float64) error {
	d, okD, err := optCell(get(r, "dist"))
	if err != nil {
		return fmt.Errorf("%s line %d: dist %w", rel, r.Line, err)
	}
	l, okL, err := optCell(get(r, "log"))
	if err != nil {
		return fmt.Errorf("%s line %d: log %w", rel, r.Line, err)
	}
	row.Dist, row.Log = d, l
	switch {
	case okD:
		row.DistM = d.V * unit
	case okL:
		row.DistM = math.Pow(10, l.V) * unit
		row.Dist = cell{math.Pow(10, l.V), math.Pow(10, l.V) * l.U * math.Ln10}
	}
	return nil
}

// sineRule checks dist/sin(angle) on the three rows (angles in ″, plane), when the
// three sides are printed; and log10(dist) = log where both are printed.
func sineRule(t *Tri, ang [3]float64, ua float64) {
	for _, r := range t.R {
		if r.Log != (cell{}) && r.Dist.V > 0 && r.Dist.U > 0 {
			if tl := math.Max(r.Log.U+0.5*r.Dist.U/(r.Dist.V*math.Ln10), 3e-8); math.Abs(math.Log10(r.Dist.V)-r.Log.V) > tl {
				t.SideErrs = append(t.SideErrs, fmt.Sprintf("%s: log10(dist) - log = %+.1e", r.Station, math.Log10(r.Dist.V)-r.Log.V))
			}
		}
	}
	if t.R[0].DistM == 0 || t.R[1].DistM == 0 || t.R[2].DistM == 0 {
		return
	}
	var ratio [3]float64
	tol := 0.0
	for i, r := range t.R {
		a := ang[i] * Sec
		ratio[i] = r.DistM / math.Sin(a)
		rel := 0.0
		if r.Dist.V > 0 {
			rel = 0.5 * r.Dist.U / r.Dist.V
		}
		tol = math.Max(tol, 2*(rel+ua*Sec*math.Abs(math.Cos(a)/math.Sin(a))+2e-7))
	}
	m := (ratio[0] + ratio[1] + ratio[2]) / 3
	sp := 0.0
	for _, x := range ratio {
		sp = math.Max(sp, math.Abs(x/m-1))
	}
	if sp > tol {
		t.SideErrs = append(t.SideErrs, fmt.Sprintf("sine rule spread %.1e", sp))
	}
}

// Derived reports whether one of t's angles is not observed.
func (t *Tri) Derived() bool { return t.R[0].Derived || t.R[1].Derived || t.R[2].Derived }
