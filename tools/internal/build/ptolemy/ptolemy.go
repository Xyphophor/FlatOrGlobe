// Package ptolemy builds src/data/presets/map-ptolemy.js for the map tab
// (2026-10-26): every coordinate of Ptolemy's Geography (books 2.2 to 7.4,
// about 150 CE) and the modern sites of 56 towns, so that the page can
// draw his world through his own first projection and set it beside the
// real one.
//
// Inputs. The catalogue of Graßhoff & Defaux (Zenodo 3585758, CC BY 4.0),
// after the edition of Stückelberger & Graßhoff (2006): one row per
// locality, longitude and latitude in decimal degrees for the two
// recensions Omega and Xi. The Omega reading is taken, the Xi one where
// Omega gives none. modern.csv: the modern site of 56 towns the catalogue
// identifies (Wikidata P625, CC0).
//
// The xlsx is read with the standard library (archive/zip, encoding/xml):
// one sheet, shared strings, numeric cells. Coordinates are rounded to
// 1/12 degree, the finest step Ptolemy wrote (5 minutes); five cells typed
// with truncated decimals (37.33333 for 37 1/3) move by less than one
// minute.
//
// Summary: the least-squares line lonP = a + b lon over the 56 towns
// (b = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)², Legendre 1805). b ≈ 1.40 is the ratio of
// Eratosthenes' 252,000 stadia to the 180,000 Ptolemy adopted (Geography
// I.11 and VII.5; Berggren & Jones 2000, pp. 20-23): distances measured in
// stadia and turned into degrees at 500 stadia per degree instead of 700
// come out 1.4 times too many degrees. The page recomputes it
// (src/tabs/map/logic.js, ptolemyFit).
package ptolemy

import (
	"archive/zip"
	"encoding/xml"
	"fmt"
	"io"
	"math"
	"path/filepath"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/csvx"
	"flatorglobe/tools/internal/preset"
)

const (
	Dir     = "data/map/ptolemy"
	Catalog = Dir + "/raw/PtolemyCatalogue.xlsx"
	Modern  = Dir + "/modern.csv"
	Out     = "src/data/presets/map-ptolemy.js"
)

// Place is one locality of the catalogue with coordinates, in twelfths of a degree.
type Place struct {
	ID, Map, Name string
	Lon12, Lat12  int
}

// Town is an identified town: Ptolemy's coordinates and the modern site.
type Town struct {
	ID, Name   string
	LonP, LatP float64 // Ptolemy, degrees
	Lat, Lon   float64 // modern, degrees
}

// Result of a build.
type Result struct {
	Places []Place
	Towns  []Town
	A, B   float64 // lonP = A + B lon over the towns
}

type cell struct {
	R string `xml:"r,attr"`
	T string `xml:"t,attr"`
	V string `xml:"v"`
}
type row struct {
	C []cell `xml:"c"`
}

func readZip(z *zip.Reader, name string) ([]byte, error) {
	for _, f := range z.File {
		if f.Name == name {
			r, err := f.Open()
			if err != nil {
				return nil, err
			}
			defer r.Close()
			return io.ReadAll(r)
		}
	}
	return nil, fmt.Errorf("%s: no %s", Catalog, name)
}

// sharedStrings returns the text of every <si>, rich runs concatenated.
func sharedStrings(b []byte) ([]string, error) {
	var out []string
	d := xml.NewDecoder(strings.NewReader(string(b)))
	var cur strings.Builder
	in, inT := false, false
	for {
		tok, err := d.Token()
		if err == io.EOF {
			return out, nil
		}
		if err != nil {
			return nil, err
		}
		switch t := tok.(type) {
		case xml.StartElement:
			if t.Name.Local == "si" {
				in = true
				cur.Reset()
			} else if t.Name.Local == "t" {
				inT = true
			}
		case xml.EndElement:
			if t.Name.Local == "si" {
				in = false
				out = append(out, cur.String())
			} else if t.Name.Local == "t" {
				inT = false
			}
		case xml.CharData:
			if in && inT {
				cur.Write(t)
			}
		}
	}
}

// rows returns each sheet row as column letter -> value.
func rows(b []byte, ss []string) ([]map[string]string, error) {
	var out []map[string]string
	d := xml.NewDecoder(strings.NewReader(string(b)))
	for {
		tok, err := d.Token()
		if err == io.EOF {
			return out, nil
		}
		if err != nil {
			return nil, err
		}
		se, ok := tok.(xml.StartElement)
		if !ok || se.Name.Local != "row" {
			continue
		}
		var r row
		if err := d.DecodeElement(&r, &se); err != nil {
			return nil, err
		}
		m := map[string]string{}
		for _, c := range r.C {
			col := strings.TrimRight(c.R, "0123456789")
			if c.V == "" {
				continue
			}
			if c.T == "s" {
				i, err := strconv.Atoi(c.V)
				if err != nil || i < 0 || i >= len(ss) {
					return nil, fmt.Errorf("%s: bad shared string %q", c.R, c.V)
				}
				m[col] = ss[i]
			} else {
				m[col] = c.V
			}
		}
		out = append(out, m)
	}
}

func twelfths(s string) (int, error) {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, err
	}
	return int(math.Round(v * 12)), nil
}

// Compute reads both inputs.
func Compute(root string) (*Result, error) {
	zr, err := zip.OpenReader(filepath.Join(root, Catalog))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch map-ptolemy)", err)
	}
	defer zr.Close()
	sb, err := readZip(&zr.Reader, "xl/sharedStrings.xml")
	if err != nil {
		return nil, err
	}
	ss, err := sharedStrings(sb)
	if err != nil {
		return nil, err
	}
	wb, err := readZip(&zr.Reader, "xl/worksheets/sheet1.xml")
	if err != nil {
		return nil, err
	}
	rs, err := rows(wb, ss)
	if err != nil {
		return nil, err
	}
	if len(rs) == 0 || rs[0]["A"] != "ID" || rs[0]["E"] != "Longitude_Omega" || rs[0]["H"] != "Latitude_Xi" {
		return nil, fmt.Errorf("%s: unexpected header %v", Catalog, rs[0])
	}
	res := &Result{}
	byID := map[string]Place{}
	for _, m := range rs[1:] {
		lo, la := m["E"], m["F"]
		if lo == "" || la == "" {
			lo, la = m["G"], m["H"]
		}
		if lo == "" || la == "" {
			continue
		}
		p := Place{ID: m["A"], Map: m["B"], Name: strings.TrimSpace(m["C"])}
		if p.Lon12, err = twelfths(lo); err != nil {
			return nil, fmt.Errorf("%s: %w", p.ID, err)
		}
		if p.Lat12, err = twelfths(la); err != nil {
			return nil, fmt.Errorf("%s: %w", p.ID, err)
		}
		if len(p.Map) < 2 || !strings.Contains("EU AF AS", p.Map[:2]) {
			return nil, fmt.Errorf("%s: unknown map %q", p.ID, p.Map)
		}
		res.Places = append(res.Places, p)
		byID[p.ID] = p
	}
	t, err := csvx.ReadFile(filepath.Join(root, Modern))
	if err != nil {
		return nil, err
	}
	for _, r := range t.Rows {
		id, _ := r.Get("id")
		p, ok := byID[id]
		if !ok {
			return nil, fmt.Errorf("%s line %d: %s not in the catalogue", Modern, r.Line, id)
		}
		name, _ := r.Get("name")
		w := Town{ID: id, Name: name, LonP: float64(p.Lon12) / 12, LatP: float64(p.Lat12) / 12}
		for _, f := range []struct {
			k string
			v *float64
		}{{"lat", &w.Lat}, {"lon", &w.Lon}} {
			s, err := r.Must(f.k)
			if err != nil {
				return nil, err
			}
			if *f.v, err = strconv.ParseFloat(s, 64); err != nil {
				return nil, fmt.Errorf("%s line %d: %w", Modern, r.Line, err)
			}
		}
		res.Towns = append(res.Towns, w)
	}
	var mx, my float64
	for _, w := range res.Towns {
		mx += w.Lon
		my += w.LonP
	}
	n := float64(len(res.Towns))
	mx, my = mx/n, my/n
	var sxy, sxx float64
	for _, w := range res.Towns {
		sxy += (w.Lon - mx) * (w.LonP - my)
		sxx += (w.Lon - mx) * (w.Lon - mx)
	}
	res.B = sxy / sxx
	res.A = my - res.B*mx
	return res, nil
}

func ints(b *strings.Builder, ps []Place, pre string) {
	b.WriteString(pre)
	first := true
	for _, p := range ps {
		if !first {
			b.WriteByte(',')
		}
		first = false
		fmt.Fprintf(b, "%d,%d", p.Lon12, p.Lat12)
	}
	b.WriteString("]")
}

// File renders the preset.
func (r *Result) File() preset.File {
	var b strings.Builder
	b.WriteString("export const PTOLEMY = {\n")
	for _, c := range []string{"EU", "AF", "AS"} {
		var ps []Place
		for _, p := range r.Places {
			if p.Map[:2] == c {
				ps = append(ps, p)
			}
		}
		ints(&b, ps, "  "+strings.ToLower(c)+": [")
		b.WriteString(",\n")
	}
	b.WriteString("  towns: [\n")
	for _, w := range r.Towns {
		fmt.Fprintf(&b, "    [%q, %s, %s, %s, %s],\n", w.Name,
			strconv.FormatFloat(math.Round(w.LonP*1e4)/1e4, 'f', -1, 64), strconv.FormatFloat(math.Round(w.LatP*1e4)/1e4, 'f', -1, 64),
			strconv.FormatFloat(w.Lat, 'f', -1, 64), strconv.FormatFloat(w.Lon, 'f', -1, 64))
	}
	b.WriteString("  ],\n};\n")
	return preset.File{
		Out: Out, Command: "build map-ptolemy", Inputs: []string{Catalog, Modern},
		Notes: []string{
			"Ptolemy's Geography, books 2.2-7.4 (catalogue of Grasshoff & Defaux 2019, CC BY 4.0; Omega recension, Xi where Omega is empty).",
			"eu/af/as: flat lists lon12, lat12, ... in twelfths of a degree; longitude east of the Fortunate Isles, latitude north.",
			"towns: [name, Ptolemy lon, Ptolemy lat, modern lat, modern lon] (modern: Wikidata P625, CC0).",
		},
		Body: b.String(),
	}
}

// Summary is the build's report line.
func (r *Result) Summary() string {
	return fmt.Sprintf("%d places, %d towns; lonP = %.2f + %.3f lon", len(r.Places), len(r.Towns), r.A, r.B)
}
