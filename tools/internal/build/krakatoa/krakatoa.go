// Package krakatoa builds src/data/presets/seis-krakatoa.js: the times of
// the Krakatoa air wave's passages (27 Aug 1883) at 47 stations, from the
// hand transcription of Strachey (1888) in data/seis/krakatoa/
// (epic05/UC06). Port of scripts/build_krakatoa.py (epic24/UC01); the
// output is byte-identical below the header.
//
// tables_3_4.csv (Tables II-IV: positions and passage times) is checked
// against table_8.csv (Table VIII: intervals between passages), typed
// separately: every interval both give must agree to the minute, or the
// build fails. No model of the Earth is used; positions only serve to
// draw stations and to test the flat model. The radius in the seis tab
// comes from lap times at one station.
package krakatoa

import (
	"fmt"
	"math"
	"path/filepath"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/csvx"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Dir      = "data/seis/krakatoa"
	Stations = Dir + "/tables_3_4.csv"
	Table8   = Dir + "/table_8.csv"
	Out      = "src/data/presets/seis-krakatoa.js"
)

// Pass names the seven passages: I, III, V, VII outward from Krakatoa,
// II, IV, VI returning from the antipodes.
var Pass = []string{"I", "II", "III", "IV", "V", "VI", "VII"}

// Angle parses "6 9 S" into -6.15 (degrees, N and E positive, rounded to
// 4 decimals as Python's round). Empty means unknown (ok = false).
func Angle(s string) (v float64, ok bool, err error) {
	if s == "" {
		return 0, false, nil
	}
	f := strings.Fields(s)
	if len(f) != 3 {
		return 0, false, fmt.Errorf("angle %q: want \"deg min hemisphere\"", s)
	}
	d, err1 := strconv.Atoi(f[0])
	m, err2 := strconv.Atoi(f[1])
	if err1 != nil || err2 != nil {
		return 0, false, fmt.Errorf("angle %q: degrees and minutes must be integers", s)
	}
	v = float64(d) + float64(m)/60
	switch f[2] {
	case "S", "W":
		v = -v
	case "N", "E":
	default:
		return 0, false, fmt.Errorf("angle %q: hemisphere must be N, S, E or W", s)
	}
	return pyjson.Round(v, 4), true, nil
}

// Kind of a time cell.
type Kind int

const (
	None  Kind = iota // empty cell: no trace received for that period
	Query             // "?" alone: wave not identifiable in the trace
	Value             // a time
)

// Time is one parsed cell: "12:51*" → 12.85 h with flags "*".
type Time struct {
	Kind  Kind
	H     float64 // hours (may be negative: "-0:42")
	Flags string  // trailing "?" (queried), "*" (Ragona), "+" (Palermo)
}

// HM parses an h:mm cell with its trailing flags.
func HM(s string) (Time, error) {
	s = strings.TrimSpace(s)
	switch s {
	case "":
		return Time{Kind: None}, nil
	case "?":
		return Time{Kind: Query}, nil
	}
	t := strings.TrimRight(s, "?*+")
	flags := s[len(t):]
	neg := strings.HasPrefix(t, "-")
	parts := strings.Split(strings.TrimLeft(t, "-"), ":")
	if len(parts) != 2 {
		return Time{}, fmt.Errorf("time %q: want h:mm", s)
	}
	h, err1 := strconv.Atoi(parts[0])
	m, err2 := strconv.Atoi(parts[1])
	if err1 != nil || err2 != nil {
		return Time{}, fmt.Errorf("time %q: hours and minutes must be integers", s)
	}
	v := float64(h) + float64(m)/60
	if neg {
		v = -v
	}
	return Time{Kind: Value, H: v, Flags: flags}, nil
}

// Station is one row of the preset.
type Station struct {
	ID       string
	Lat, Lon *float64
	T        []Time // per passage, H rounded to 4 decimals
	Note     string // "Ragona", "Palermo" or ""
}

// Result of a build.
type Result struct {
	Vent     [2]float64
	Stations []Station
	Checked  int      // intervals compared with Table VIII
	Bad      []string // disagreements (the build fails if any)
}

func opt(v float64, ok bool) *float64 {
	if !ok {
		return nil
	}
	return &v
}

// Compute reads the two tables under root and cross-checks them.
func Compute(root string) (*Result, error) {
	st, err := csvx.ReadFile(filepath.Join(root, Stations))
	if err != nil {
		return nil, err
	}
	t8tab, err := csvx.ReadFile(filepath.Join(root, Table8))
	if err != nil {
		return nil, err
	}
	t8 := map[string]csvx.Row{}
	for _, r := range t8tab.Rows {
		id, err := r.Must("station")
		if err != nil {
			return nil, fmt.Errorf("%s: %w", Table8, err)
		}
		t8[id] = r
	}
	res := &Result{}
	haveVent := false
	for _, r := range st.Rows {
		fail := func(err error) error { return fmt.Errorf("%s line %d: %w", Stations, r.Line, err) }
		id, err := r.Must("station")
		if err != nil {
			return nil, fail(err)
		}
		latS, err := r.Must("lat")
		if err != nil {
			return nil, fail(err)
		}
		lonS, err := r.Must("lon")
		if err != nil {
			return nil, fail(err)
		}
		lat, latOK, err := Angle(latS)
		if err != nil {
			return nil, fail(err)
		}
		lon, lonOK, err := Angle(lonS)
		if err != nil {
			return nil, fail(err)
		}
		if id == "Krakatoa" {
			if !latOK || !lonOK {
				return nil, fail(fmt.Errorf("Krakatoa row without a position"))
			}
			res.Vent, haveVent = [2]float64{lat, lon}, true
			continue
		}
		s := Station{ID: id, Lat: opt(lat, latOK), Lon: opt(lon, lonOK)}
		for _, k := range Pass {
			cell, err := r.Must(k)
			if err != nil {
				return nil, fail(err)
			}
			tm, err := HM(cell)
			if err != nil {
				return nil, fail(err)
			}
			if tm.Kind == Value {
				tm.H = pyjson.Round(tm.H, 4)
				if s.Note == "" {
					if strings.Contains(tm.Flags, "*") {
						s.Note = "Ragona"
					} else if strings.Contains(tm.Flags, "+") {
						s.Note = "Palermo"
					}
				}
			}
			s.T = append(s.T, tm)
		}
		if row8, ok := t8[id]; ok {
			for i := 0; i+1 < len(Pass); i++ {
				a, b := Pass[i], Pass[i+1]
				cell, _ := row8.Get(a + "-" + b)
				v8, err := HM(cell)
				if err != nil {
					return nil, fmt.Errorf("%s line %d: %w", Table8, row8.Line, err)
				}
				ta, tb := s.T[i], s.T[i+1]
				if v8.Kind == Value && ta.Kind == Value && tb.Kind == Value {
					res.Checked++
					if math.Abs((tb.H-ta.H)-v8.H) > 0.5/60 {
						res.Bad = append(res.Bad, fmt.Sprintf("%s %s-%s: tables III/IV give %.0f min, Table VIII %.0f min",
							id, a, b, (tb.H-ta.H)*60, v8.H*60))
					}
				}
			}
		}
		res.Stations = append(res.Stations, s)
	}
	if !haveVent {
		return nil, fmt.Errorf("%s: no Krakatoa row (the vent position)", Stations)
	}
	return res, nil
}

// File renders the preset. Body and notes are those of build_krakatoa.py.
func (res *Result) File() preset.File {
	var b strings.Builder
	b.WriteString("export const KRAK_VENT = " + pyjson.Dumps([]float64{res.Vent[0], res.Vent[1]}, pyjson.Default) + ";\n")
	b.WriteString("export const KRAK_STATIONS = [\n")
	for _, s := range res.Stations {
		t := make([]any, len(s.T))
		q := make([]bool, len(s.T))
		for i, tm := range s.T {
			switch tm.Kind {
			case None:
				t[i] = nil
			case Query:
				t[i] = "?"
			case Value:
				t[i] = tm.H
			}
			q[i] = strings.Contains(tm.Flags, "?")
		}
		var note any
		if s.Note != "" {
			note = s.Note
		}
		row := pyjson.Obj{{K: "id", V: s.ID}, {K: "lat", V: s.Lat}, {K: "lon", V: s.Lon},
			{K: "t", V: t}, {K: "q", V: q}, {K: "note", V: note}}
		b.WriteString("  " + pyjson.Dumps(row, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{
		Out:     Out,
		Command: "build krakatoa",
		Inputs:  []string{Stations, Table8},
		Notes: []string{
			"Krakatoa, 27 August 1883: times of the air wave's passages I-VII (Strachey 1888, Royal Society report,",
			"Tables II-IV, hand-transcribed in data/seis/krakatoa/, checked against Table VIII).",
			"t = hours after 0 h GMT, 27 Aug 1883 (null = no trace received, \"?\" = wave not identifiable);",
			"q = time queried by Strachey; I, III, V, VII outward from Krakatoa, II, IV, VI returning from the antipodes.",
		},
		Body: b.String(),
	}
}
