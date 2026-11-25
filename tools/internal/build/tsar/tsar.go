// Package tsar builds src/data/presets/atmo-tsar.js (2026-11-21, owner: "add the Tsar Bomba, over several passages"):
// the times at which the pressure wave of the Soviet nuclear explosion of 30 October 1961 (Novaya Zemlya, "Tsar Bomba")
// passed eight Japanese microbarographs and the Showa Base barograph, from Table 1 of
//
//	N. Murayama (1962), Pressure Waves Produced by the Nuclear Explosion on October 30, 1961 - Preliminary Report,
//	J. Meteor. Soc. Japan, Ser. II, 40(4), 222-231, doi:10.2151/jmsj1923.40.4_222,
//
// hand-transcribed in data/atmo/tsar/transcription/. Three wave trains: the first by the shortest path, the second by
// the antipodal path, the third the first one again after a complete circuit. A lap is the third time minus the first
// at the same station: no position, no distance and no explosion time enter it.
//
// Transcription check: Murayama printed, for each passage, his distance from an assumed site (74 N, 57 E) and the
// wave velocity he derived from an assumed explosion time (08:35 GMT). Each printed velocity must be found again from
// the transcribed distance and time, d / (t - 08:35), within the rounding of the print (1.5 m/s), or the build fails.
// Those distances and velocities serve only this check (they use the radius of his day).
package tsar

import (
	"fmt"
	"math"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/build/krakatoa"
	"flatorglobe/tools/internal/csvx"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

const (
	Dir   = "data/atmo/tsar"
	Table = Dir + "/transcription/murayama1962_table1.csv"
	Out   = "src/data/presets/atmo-tsar.js"
	// Tol is the largest accepted gap between a printed velocity and the one recomputed from the transcription, m/s.
	Tol = 1.5
)

// Origin: 0 h GMT, 30 October 1961 (times in the preset are hours after it). AssumedT0 is Murayama's explosion time.
var (
	Origin    = time.Date(1961, 10, 30, 0, 0, 0, 0, time.UTC)
	AssumedT0 = time.Date(1961, 10, 30, 8, 35, 0, 0, time.UTC)
)

// Pass is one transcribed passage.
type Pass struct {
	OK    bool
	H     float64 // hours after Origin
	Query bool    // printed in parentheses: uncertain because of complicated records
}

// Station is one row.
type Station struct {
	ID, Instrument string
	Lat, Lon       float64
	P              [3]Pass
}

// Result of a build.
type Result struct {
	Stations []Station
	Checked  int
	Bad      []string
}

func parseTime(s string) (Pass, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return Pass{}, nil
	}
	q := strings.HasSuffix(s, "?")
	t, err := time.Parse("2006-01-02 15:04", "1961-"+strings.TrimSuffix(s, "?"))
	if err != nil {
		return Pass{}, fmt.Errorf("time %q: want MM-DD hh:mm", s)
	}
	return Pass{OK: true, H: pyjson.Round(t.Sub(Origin).Hours(), 4), Query: q}, nil
}

// Compute reads the transcription and checks it against the printed velocities.
func Compute(root string) (*Result, error) {
	tab, err := csvx.ReadFile(filepath.Join(root, Table))
	if err != nil {
		return nil, err
	}
	res := &Result{}
	for _, r := range tab.Rows {
		fail := func(err error) error { return fmt.Errorf("%s line %d: %w", Table, r.Line, err) }
		get := func(k string) (string, error) { return r.Must(k) }
		id, err := get("station")
		if err != nil {
			return nil, fail(err)
		}
		s := Station{ID: id}
		if s.Instrument, err = get("instrument"); err != nil {
			return nil, fail(err)
		}
		for _, c := range []struct {
			k string
			v *float64
		}{{"lat", &s.Lat}, {"lon", &s.Lon}} {
			txt, err := get(c.k)
			if err != nil {
				return nil, fail(err)
			}
			v, ok, err := krakatoa.Angle(txt)
			if err != nil || !ok {
				return nil, fail(fmt.Errorf("%s %q: %v", c.k, txt, err))
			}
			*c.v = v
		}
		for i := 0; i < 3; i++ {
			n := strconv.Itoa(i + 1)
			at, err := get("A" + n)
			if err != nil {
				return nil, fail(err)
			}
			p, err := parseTime(at)
			if err != nil {
				return nil, fail(err)
			}
			s.P[i] = p
			ds, _ := r.Get("d" + n)
			vs, _ := r.Get("v" + n)
			if !p.OK || ds == "" || vs == "" {
				continue
			}
			d, err1 := strconv.ParseFloat(ds, 64)
			v, err2 := strconv.ParseFloat(vs, 64)
			if err1 != nil || err2 != nil {
				return nil, fail(fmt.Errorf("d%s/v%s not numbers", n, n))
			}
			sec := Origin.Add(time.Duration(p.H*3600) * time.Second).Sub(AssumedT0).Seconds()
			got := d * 1000 / sec
			res.Checked++
			if math.Abs(got-v) > Tol {
				res.Bad = append(res.Bad, fmt.Sprintf("%s train %s: printed %.0f m/s, transcription gives %.1f", id, n, v, got))
			}
		}
		res.Stations = append(res.Stations, s)
	}
	return res, nil
}

// File renders the preset.
func (res *Result) File() preset.File {
	var b strings.Builder
	b.WriteString("export const TSAR_SITE = [74, 57]; // Murayama's assumed site (drawing only)\n")
	b.WriteString("export const TSAR_STATIONS = [\n")
	for _, s := range res.Stations {
		t := make([]any, 3)
		q := make([]bool, 3)
		for i, p := range s.P {
			if p.OK {
				t[i] = p.H
			}
			q[i] = p.Query
		}
		o := pyjson.Obj{{K: "id", V: s.ID}, {K: "lat", V: s.Lat}, {K: "lon", V: s.Lon}, {K: "inst", V: s.Instrument},
			{K: "t", V: t}, {K: "q", V: q}}
		b.WriteString("  " + pyjson.Dumps(o, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{
		Out:     Out,
		Command: "build atmo-tsar",
		Inputs:  []string{Table},
		Notes: []string{
			"30 October 1961, Novaya Zemlya: the explosion's pressure wave at eight Japanese microbarographs and Showa Base",
			"(Murayama 1962, J. Meteor. Soc. Japan 40, Table 1, hand-transcribed in data/atmo/tsar/transcription/).",
			"t = hours after 0 h GMT, 30 Oct 1961, for the three trains (shortest path, antipodal path, after a full circuit);",
			"q = printed in parentheses (uncertain, complicated record). A lap = t[2] - t[0] at the same station.",
		},
		Body: b.String(),
	}
}
