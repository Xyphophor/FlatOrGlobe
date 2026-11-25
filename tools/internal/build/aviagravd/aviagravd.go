// Package aviagravd builds src/data/presets/avia-gravd.js, the airborne
// gravity of the avia tab's Eötvös section (epic14), from the NOAA NGS
// GRAV-D block releases listed as inputs of data/avia/gravd/dataset.json
// (one zip per block; adding a block = one input line with its URL, then
// fog fetch, fog lock, fog build). Port of scripts/build_avia_gravd.py
// (epic24/UC02).
//
// From the main gravity data file of each zip (not the supplement: cross
// lines and transits), per 1 Hz sample: line id, time (s of day), latitude,
// longitude, ellipsoidal height (m), full-field gravity at altitude (mGal),
// already corrected by NGS for the aircraft's motion and not leveled. The
// only derived quantity is the aircraft's north and east velocity, from the
// published positions (centred difference, one second either side, on the
// GRS80 ellipsoid). One sample every 30 s is kept. The Eötvös correction
// itself is computed by the tab.
package aviagravd

import (
	"archive/zip"
	"fmt"
	"io"
	"math"
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/dataset"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/pymath"
)

const (
	Manifest = "data/avia/gravd/dataset.json"
	Out      = "src/data/presets/avia-gravd.js"
	Step     = 30 // seconds between kept samples
	MinPts   = 20 // a line with fewer kept samples is dropped
)

// GRS80 / WGS84 semi-major axis and flattening, rounded as Python does.
var (
	A  = 6378137.0
	F  = pymath.Div(1, 298.257223563)
	E2 = F * (2 - F)
)

type sample struct{ t, lat, lon, h, g float64 }

// Line is one flight line of a block.
type Line struct {
	ID  string
	Pts [][6]float64 // lon, lat, h (integer), g, ve, vn
}

// Block is one GRAV-D release.
type Block struct {
	ID, File string
	Lines    []Line
}

// readZip returns the name of the main data file and its samples by line.
func readZip(p string) (string, map[string][]sample, error) {
	z, err := zip.OpenReader(p)
	if err != nil {
		return "", nil, err
	}
	defer z.Close()
	for _, f := range z.File {
		if !strings.Contains(f.Name, "Gravity_Data") || !strings.HasSuffix(f.Name, ".txt") {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			return "", nil, err
		}
		var b strings.Builder
		_, err = copyASCII(&b, rc)
		rc.Close()
		if err != nil {
			return "", nil, fmt.Errorf("%s: %w", f.Name, err)
		}
		lines := map[string][]sample{}
		for n, ln := range strings.Split(b.String(), "\n") {
			p := strings.Fields(ln)
			if len(p) < 6 {
				continue
			}
			var v [5]float64
			for i := range v {
				if v[i], err = strconv.ParseFloat(p[i+1], 64); err != nil {
					return "", nil, fmt.Errorf("%s line %d: %w", f.Name, n+1, err)
				}
			}
			lines[p[0]] = append(lines[p[0]], sample{v[0], v[1], v[2], v[3], v[4]})
		}
		return f.Name, lines, nil
	}
	return "", nil, fmt.Errorf("%s: no *Gravity_Data*.txt inside", p)
}

// Velocities and decimation of one line, exactly as the Python script.
func thin(r []sample) [][6]float64 {
	var pts [][6]float64
	for i := 1; i+1 < len(r); i++ {
		s0, s1, s := r[i-1], r[i+1], r[i]
		dt := s1.t - s0.t
		if !(0 < dt && dt <= 4) || pymath.Mod(pymath.Trunc(s.t), Step) != 0 {
			continue
		}
		sn := math.Sin(pymath.Radians(s.lat))
		w := 1 - float64(float64(E2*sn)*sn)
		N := A / math.Sqrt(w)
		M := float64(A*(1-E2)) / math.Pow(w, 1.5)
		vn := pymath.Radians(s1.lat-s0.lat) * (M + s.h) / dt
		ve := pymath.Radians(s1.lon-s0.lon) * (N + s.h) * math.Cos(pymath.Radians(s.lat)) / dt
		pts = append(pts, [6]float64{pyjson.Round(s.lon, 4), pyjson.Round(s.lat, 4), float64(pymath.RoundInt(s.h)),
			pyjson.Round(s.g, 2), pyjson.Round(ve, 1), pyjson.Round(vn, 1)})
	}
	return pts
}

// Compute reads every block zip listed in the manifest, in its order.
func Compute(root string) ([]Block, *dataset.Dataset, error) {
	d, err := dataset.Load(root, Manifest)
	if err != nil {
		return nil, nil, err
	}
	var blocks []Block
	for _, in := range d.Inputs {
		if in.Path == "" || !strings.HasSuffix(in.Path, ".zip") {
			continue
		}
		name, lines, err := readZip(filepath.Join(root, d.Dir, in.Path))
		if err != nil {
			return nil, nil, err
		}
		b := Block{ID: strings.TrimSuffix(path.Base(in.Path), ".zip"), File: name}
		ids := make([]string, 0, len(lines))
		for id := range lines {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		for _, id := range ids {
			if pts := thin(lines[id]); len(pts) >= MinPts {
				b.Lines = append(b.Lines, Line{id, pts})
			}
		}
		blocks = append(blocks, b)
	}
	if len(blocks) == 0 {
		return nil, nil, fmt.Errorf("%s: no block zip among the inputs", Manifest)
	}
	return blocks, d, nil
}

// File renders the preset (same body as build_avia_gravd.py).
func File(blocks []Block, d *dataset.Dataset) preset.File {
	out := make([]any, len(blocks))
	for i, b := range blocks {
		lines := make([]any, len(b.Lines))
		for j, l := range b.Lines {
			pts := make([]any, len(l.Pts))
			for k, p := range l.Pts {
				pts[k] = []any{p[0], p[1], int(p[2]), p[3], p[4], p[5]}
			}
			lines[j] = pyjson.Obj{{K: "id", V: l.ID}, {K: "pts", V: pts}}
		}
		out[i] = pyjson.Obj{{K: "id", V: b.ID}, {K: "file", V: b.File}, {K: "lines", V: lines}}
	}
	ascii := pyjson.Opts{Item: ",", Key: ":", ASCII: true}
	var inputs []string
	for _, in := range d.Inputs {
		if in.Path != "" {
			inputs = append(inputs, d.Dir+"/"+in.Path)
		}
	}
	return preset.File{
		Out: Out, Command: "build avia-gravd", Inputs: inputs,
		Notes: []string{
			"NOAA NGS GRAV-D airborne gravity, main data lines, one sample every 30 s:",
			"[lon, lat, ellipsoidal height m, published full-field gravity mGal (Eötvös-corrected by NGS,",
			" not leveled), east velocity m/s, north velocity m/s (from the published 1 Hz positions)].",
		},
		Body: "export const GRAVD = " + pyjson.Dumps(out, ascii) + ";\n",
	}
}

// Summary is the line the Python script printed per block.
func Summary(blocks []Block) string {
	var s []string
	for _, b := range blocks {
		n := 0
		for _, l := range b.Lines {
			n += len(l.Pts)
		}
		s = append(s, fmt.Sprintf("%s: %d lines, %d samples kept (1 every %d s)", b.ID, len(b.Lines), n, Step))
	}
	return strings.Join(s, "; ")
}

// copyASCII copies r into b and refuses anything but printable ASCII,
// tab, CR and LF: on such text, splitting on "\n" and strings.Fields are
// exactly Python's splitlines() and split().
func copyASCII(b *strings.Builder, r io.Reader) (int64, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return 0, err
	}
	for i, c := range data {
		if c >= 0x7f || (c < 0x20 && c != '\n' && c != '\r' && c != '\t') {
			return 0, fmt.Errorf("byte 0x%02x at offset %d: not plain ASCII text", c, i)
		}
	}
	b.Write(data)
	return int64(len(data)), nil
}
