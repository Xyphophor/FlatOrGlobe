// Package aviaflights builds src/data/presets/avia-flights.js, the avia
// tab's measured flight times (epic14), from data/avia/flights/: routes.json
// (the ONLY file to edit to add a route) and raw/<IDENT>.json, the legs read
// from FlightAware's public flight pages (see fetch.go). Port of
// scripts/build_avia_flights.py (epic24/UC02).
//
// Per route and direction: the legs between the two airports with an
// ACTUAL wheels-off and wheels-on time, not cancelled, not diverted;
// airborne time = landing - takeoff; a leg more than 3 standard deviations
// from the mean of the OTHER legs of its direction (their standard
// deviation, floor one minute) is dropped and counted (stats.KeepLOO).
// Plus the filed flight plan with the most lat/lon waypoints. Nothing here
// computes a distance: the tab does, on both models, from the coordinates.
package aviaflights

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
	"flatorglobe/tools/internal/stats"
)

const (
	Dir    = "data/avia/flights"
	Routes = Dir + "/routes.json"
	RawDir = Dir + "/raw"
	Out    = "src/data/presets/avia-flights.js"
	KSigma = 3.0
)

// Route is one entry of routes.json.
type Route struct {
	A     string   `json:"a"`
	B     string   `json:"b"`
	AB    []string `json:"ab"`
	BA    []string `json:"ba"`
	South bool     `json:"south"`
}

type manifest struct {
	Comment string  `json:"_comment"`
	Routes  []Route `json:"routes"`
}

// Leg is one flight of a raw file; numbers keep their JSON spelling.
type Leg struct {
	O, D           *string
	OC, DC         []json.Number
	On, Dn         *string
	Off, OnT       *json.Number
	Cancelled      bool
	Diverted       bool
	Type           *string
	Tas, Nm, FuelL *json.Number
	Route          *string
}

func (l *Leg) UnmarshalJSON(b []byte) error {
	var x struct {
		O         *string       `json:"o"`
		D         *string       `json:"d"`
		OC        []json.Number `json:"oc"`
		DC        []json.Number `json:"dc"`
		On        *string       `json:"on"`
		Dn        *string       `json:"dn"`
		Off       *json.Number  `json:"off"`
		OnT       *json.Number  `json:"onT"`
		Cancelled bool          `json:"cancelled"`
		Diverted  bool          `json:"diverted"`
		Type      *string       `json:"type"`
		Tas       *json.Number  `json:"tas"`
		Nm        *json.Number  `json:"nm"`
		FuelLb    *json.Number  `json:"fuelLb"`
		Route     *string       `json:"route"`
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&x); err != nil {
		return err
	}
	*l = Leg{x.O, x.D, x.OC, x.DC, x.On, x.Dn, x.Off, x.OnT, x.Cancelled, x.Diverted, x.Type, x.Tas, x.Nm, x.FuelLb, x.Route}
	return nil
}

// Raw is one raw/<IDENT>.json.
type Raw struct {
	Ident   string   `json:"ident"`
	Fetched string   `json:"fetched"`
	Windows []string `json:"windows,omitempty"` // every reading kept, when there were several (fetch.go, Merge)
	Legs    []Leg    `json:"legs"`
}

func str(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

// num reads a JSON number as Python would compare it (ints exactly).
func num(n *json.Number) (float64, bool) {
	if n == nil {
		return 0, false
	}
	f, err := strconv.ParseFloat(string(*n), 64)
	return f, err == nil
}

// filed-route waypoints: 3706S15803E, 59S150W, optional /N0474F370
// speed-level suffix; and the slashed form 7500N/13000W
var wptRe = regexp.MustCompile(`^(\d{2})(\d{2})?([NS])/?(\d{3})(\d{2})?([EW])(?:/.*)?$`)

// Waypoints extracts the lat/lon waypoints of a filed route.
func Waypoints(route string) [][2]float64 {
	pts := [][2]float64{}
	for _, tok := range strings.Fields(route) {
		m := wptRe.FindStringSubmatch(tok)
		if m == nil {
			continue
		}
		a := func(s string) int {
			if s == "" {
				return 0
			}
			v, _ := strconv.Atoi(s)
			return v
		}
		la := float64(a(m[1])) + float64(a(m[2]))/60
		lo := float64(a(m[4])) + float64(a(m[5]))/60
		if m[3] == "S" {
			la = -la
		}
		if m[6] == "W" {
			lo = -lo
		}
		pts = append(pts, [2]float64{pyjson.Round(la, 2), pyjson.Round(lo, 2)})
	}
	return pts
}

// ReadRaw reads raw/<ident>.json.
func ReadRaw(root, ident string) (*Raw, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, ident+".json"))
	if err != nil {
		return nil, fmt.Errorf("%s: %w (fog fetch avia-flights)", ident, err)
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields()
	var r Raw
	if err := dec.Decode(&r); err != nil {
		return nil, fmt.Errorf("%s/%s.json: %w", RawDir, ident, err)
	}
	return &r, nil
}

// ReadRoutes reads the manifest.
func ReadRoutes(root string) ([]Route, error) {
	b, err := os.ReadFile(filepath.Join(root, Routes))
	if err != nil {
		return nil, err
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields()
	var m manifest
	if err := dec.Decode(&m); err != nil {
		return nil, fmt.Errorf("%s: %w", Routes, err)
	}
	for i, r := range m.Routes {
		if r.A == "" || r.B == "" || len(r.AB) == 0 || len(r.BA) == 0 {
			return nil, fmt.Errorf("%s: route %d: a, b and at least one callsign each way are required", Routes, i)
		}
	}
	return m.Routes, nil
}

type airport struct {
	name *string
	c    []json.Number
}

// Result of a build.
type Result struct {
	Fetched  []string
	Airports map[string]airport
	Recs     []pyjson.Obj
	Lines    []string // the script's per-route report
}

// Compute reads the manifest and the raw files.
func Compute(root string) (*Result, error) {
	routes, err := ReadRoutes(root)
	if err != nil {
		return nil, err
	}
	res := &Result{Airports: map[string]airport{}}
	fetched := map[string]bool{}
	cache := map[string]*Raw{}
	for _, r := range routes {
		idents := append(append([]string{}, r.AB...), r.BA...)
		rec := pyjson.Obj{{K: "a", V: r.A}, {K: "b", V: r.B}, {K: "south", V: r.South}, {K: "idents", V: idents}}
		var plans []Leg
		outs := map[string]int{}
		counts := map[string]int{}
		for _, dir := range []struct {
			key      string
			o, d     string
			callsign []string
		}{{"ab", r.A, r.B, r.AB}, {"ba", r.B, r.A, r.BA}} {
			var hours []float64
			dates := map[string]bool{}
			for _, ident := range dir.callsign {
				raw, ok := cache[ident]
				if !ok {
					if raw, err = ReadRaw(root, ident); err != nil {
						return nil, err
					}
					cache[ident] = raw
				}
				fetched[raw.Fetched] = true
				for _, w := range raw.Windows {
					fetched[w] = true
				}
				for _, L := range raw.Legs {
					if str(L.O) != dir.o || str(L.D) != dir.d || L.O == nil || L.D == nil {
						continue
					}
					if _, ok := res.Airports[dir.o]; !ok {
						res.Airports[dir.o] = airport{L.On, L.OC}
					}
					if _, ok := res.Airports[dir.d]; !ok {
						res.Airports[dir.d] = airport{L.Dn, L.DC}
					}
					if str(L.Route) != "" {
						plans = append(plans, L)
					}
					off, okOff := num(L.Off)
					on, okOn := num(L.OnT)
					if L.Cancelled || L.Diverted || !okOff || !okOn || off == 0 || on == 0 {
						continue
					}
					hours = append(hours, (on-off)/3600)
					dates[time.Unix(int64(math.Floor(off)), 0).UTC().Format("2006-01-02")] = true
				}
			}
			keep, dropped := stats.KeepLOO(hours, KSigma, 1.0/60, 3)
			rounded := make([]float64, len(keep))
			for i, h := range keep {
				rounded[i] = pyjson.Round(h, 3)
			}
			ds := make([]string, 0, len(dates))
			for d := range dates {
				ds = append(ds, d)
			}
			sort.Strings(ds)
			rec = append(rec, pyjson.KV{K: dir.key, V: rounded}, pyjson.KV{K: dir.key + "Out", V: dropped},
				pyjson.KV{K: dir.key + "Dates", V: ds})
			outs[dir.key], counts[dir.key] = dropped, len(keep)
		}
		// the filed plan with the most lat/lon waypoints (the most drawable), latest on a tie
		var best *Leg
		var bestN int
		var bestOff float64
		for i := range plans {
			n := len(Waypoints(str(plans[i].Route)))
			off, _ := num(plans[i].Off)
			if best == nil || n > bestN || (n == bestN && off > bestOff) {
				best, bestN, bestOff = &plans[i], n, off
			}
		}
		if best != nil {
			wpt := make([]any, 0)
			for _, p := range Waypoints(str(best.Route)) {
				wpt = append(wpt, []float64{p[0], p[1]})
			}
			rec = append(rec, pyjson.KV{K: "plan", V: pyjson.Obj{{K: "from", V: optStr(best.O)}, {K: "type", V: optStr(best.Type)},
				{K: "tas", V: optNum(best.Tas)}, {K: "nm", V: optNum(best.Nm)}, {K: "fuelLb", V: optNum(best.FuelL)}, {K: "wpt", V: wpt}}})
		}
		res.Recs = append(res.Recs, rec)
		res.Lines = append(res.Lines, fmt.Sprintf("%s-%s: %d + %d flights (dropped %d/%d)", r.A, r.B, counts["ab"], counts["ba"], outs["ab"], outs["ba"]))
	}
	for f := range fetched {
		res.Fetched = append(res.Fetched, f)
	}
	sort.Strings(res.Fetched)
	return res, nil
}

func optStr(p *string) any {
	if p == nil {
		return nil
	}
	return *p
}

func optNum(p *json.Number) any {
	if p == nil {
		return nil
	}
	return *p
}

// File renders the preset (same body as build_avia_flights.py).
func (r *Result) File() (preset.File, error) {
	var b strings.Builder
	b.WriteString("export const AVIA_FETCHED = " + pyjson.Dumps(r.Fetched, pyjson.Default) + ";\n")
	b.WriteString("export const AIRPORTS = {\n")
	codes := make([]string, 0, len(r.Airports))
	for k := range r.Airports {
		codes = append(codes, k)
	}
	sort.Strings(codes)
	for _, k := range codes {
		a := r.Airports[k]
		if len(a.c) < 2 {
			return preset.File{}, fmt.Errorf("airport %s: no coordinates", k)
		}
		lon, err1 := strconv.ParseFloat(string(a.c[0]), 64)
		lat, err2 := strconv.ParseFloat(string(a.c[1]), 64)
		if err1 != nil || err2 != nil {
			return preset.File{}, fmt.Errorf("airport %s: bad coordinates %v", k, a.c)
		}
		fmt.Fprintf(&b, "  %s: { n: %s, lat: %.4f, lon: %.4f },\n", k, pyjson.Dumps(optStr(a.name), pyjson.Default), lat, lon)
	}
	b.WriteString("};\nexport const ROUTES = [\n")
	compactASCII := pyjson.Opts{Item: ",", Key: ":", ASCII: true}
	for _, rec := range r.Recs {
		b.WriteString("  " + pyjson.Dumps(rec, compactASCII) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{
		Out: Out, Command: "build avia-flights",
		// 115 raw files: the header names the manifest and the lock that
		// hashes every raw file, not each file.
		Inputs: []string{Routes, Dir + "/inputs.lock"},
		Notes: []string{
			"Airborne times (wheels off -> wheels on, hours), filed flight plans and airport",
			"coordinates read from FlightAware (https://www.flightaware.com) on the date(s) below.",
			"No distance is stored here: the tab computes them (src/tabs/avia/logic.js).",
		},
		Body: b.String(),
	}, nil
}

// Coord is an airport's reference point (degrees), as File writes it.
func (r *Result) Coord(code string) (lat, lon float64, err error) {
	a, ok := r.Airports[code]
	if !ok || len(a.c) < 2 {
		return 0, 0, fmt.Errorf("airport %s: no coordinates", code)
	}
	lon, err1 := strconv.ParseFloat(string(a.c[0]), 64)
	lat, err2 := strconv.ParseFloat(string(a.c[1]), 64)
	if err1 != nil || err2 != nil {
		return 0, 0, fmt.Errorf("airport %s: bad coordinates %v", code, a.c)
	}
	return lat, lon, nil
}
