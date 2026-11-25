package flightdip

import (
	"fmt"
	"html"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

// Flight is one of the two flights, identified by the contributor (document
// "Flights, Model, Graphs", raw/flights-model-graphs.docx): its FlightAware
// track log, the ADS-B fixes of the flight [FlightAware].
type Flight struct {
	N     int
	Ident string // e.g. "AA 6322 (CRJ-700), Chicago O'Hare to Des Moines"
	Path  string // FlightAware history path, the track log is Path + "/tracklog"
	File  string // under RawDir
	Day   time.Time
}

// Flights are the contributor's two flights.
var Flights = []Flight{
	{1, "AA 6322 (CRJ-700), Chicago O'Hare to Des Moines", "AAL6322/history/20250905/1210Z/KORD/KDSM", "tracklog-AAL6322-20250905.html", time.Date(2025, 9, 5, 0, 0, 0, 0, time.UTC)},
	{2, "AA 5255 (CRJ-700), Des Moines to Washington National", "AAL5255/history/20250908/2100Z/KDSM/KDCA", "tracklog-AAL5255-20250908.html", time.Date(2025, 9, 8, 0, 0, 0, 0, time.UTC)},
}

// TrackURL is a flight's FlightAware track log page.
func TrackURL(f Flight) string {
	return "https://www.flightaware.com/live/flight/" + f.Path + "/tracklog"
}

// Fix is one row of a track log: time (UTC), position, course (degrees),
// ground speed (kt), altitude (ft, the transponder's pressure altitude; NaN
// when missing).
type Fix struct {
	T                 time.Time
	Lat, Lon, Crs, Kt float64
	AltFt             float64
}

var (
	reComment = regexp.MustCompile(`(?s)<!--.*?-->`)
	reRow     = regexp.MustCompile(`(?s)<tr class="smallrow[12]">(.*?)</tr>`)
	reCell    = regexp.MustCompile(`(?s)<td[^>]*>(.*?)</td>`)
	reTag     = regexp.MustCompile(`<[^>]+>`)
	reClock   = regexp.MustCompile(`(\d\d):(\d\d):(\d\d) ([AP]M)`)
	reNum     = regexp.MustCompile(`-?\d+(\.\d+)?`)
	// the departure row gives the page's clock and the airport's local clock:
	// "Fri 08:18:08 AM ... Departure (ORD) @ Friday 07:18:08 AM CDT"
	reDep  = regexp.MustCompile(`(\d\d):(\d\d):(\d\d) ([AP]M)[^@]*Departure[^@]*@ \w+ (\d\d):(\d\d):(\d\d) ([AP]M) ([A-Z]{3})`)
	zoneOf = map[string]int{"EDT": -4, "EST": -5, "CDT": -5, "CST": -6, "MDT": -6, "PDT": -7}
)

func clock(h, m, s, ampm string) int {
	hh, _ := strconv.Atoi(h)
	mm, _ := strconv.Atoi(m)
	ss, _ := strconv.Atoi(s)
	hh %= 12
	if ampm == "PM" {
		hh += 12
	}
	return hh*3600 + mm*60 + ss
}

func cellNum(s string) float64 {
	s = strings.ReplaceAll(strings.ReplaceAll(s, ",", ""), " ", " ")
	m := reNum.FindString(s)
	if m == "" {
		return math.NaN()
	}
	v, _ := strconv.ParseFloat(m, 64)
	return v
}

// ParseTrack reads a FlightAware track log page. The rows' clock is the
// page's display zone; its offset to UTC comes from the departure row, which
// prints the same instant in the airport's local time and zone.
func ParseTrack(b []byte, day time.Time) ([]Fix, error) {
	s := reComment.ReplaceAllString(string(b), "")
	plain := html.UnescapeString(reTag.ReplaceAllString(s, " "))
	plain = strings.Join(strings.Fields(plain), " ")
	d := reDep.FindStringSubmatch(plain)
	if d == nil {
		return nil, fmt.Errorf("tracklog: no departure row")
	}
	zone, ok := zoneOf[d[9]]
	if !ok {
		return nil, fmt.Errorf("tracklog: unknown zone %s", d[9])
	}
	shown, local := clock(d[1], d[2], d[3], d[4]), clock(d[5], d[6], d[7], d[8])
	// display = UTC + off: off = (shown - local) + zone, rounded to the hour
	off := int(math.Round(float64(shown-local)/3600)) + zone
	var out []Fix
	for _, r := range reRow.FindAllStringSubmatch(s, -1) {
		var c []string
		for _, m := range reCell.FindAllStringSubmatch(r[1], -1) {
			c = append(c, html.UnescapeString(reTag.ReplaceAllString(m[1], " ")))
		}
		if len(c) < 9 {
			continue
		}
		k := reClock.FindStringSubmatch(c[0])
		if k == nil {
			continue
		}
		t := day.Add(time.Duration(clock(k[1], k[2], k[3], k[4])-off*3600) * time.Second)
		f := Fix{T: t, Lat: cellNum(c[1]), Lon: cellNum(c[2]), Crs: cellNum(c[3]), Kt: cellNum(c[4]), AltFt: cellNum(c[6])}
		if math.IsNaN(f.Lat) || math.IsNaN(f.Lon) {
			continue
		}
		out = append(out, f)
	}
	if len(out) < 10 {
		return nil, fmt.Errorf("tracklog: %d fixes", len(out))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].T.Before(out[j].T) })
	return out, nil
}

func readTrack(root string, f Flight) ([]Fix, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, f.File))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch contrib-flightdip)", err)
	}
	return ParseTrack(b, f.Day)
}

// State is the aircraft at an instant, from its track: position, pressure
// altitude, ground velocity and acceleration (east, north; m/s, m/s²), the
// course change over the window and the fixes used.
type State struct {
	Lat, Lon, AltFt float64
	VE, VN, AE, AN  float64 // from the two fixes around t: ground speed and course, and their changes
	SigL, SigT      float64 // the rounding of the log (1 kt, 1°) as a standard error, along and across the track (m/s²)
	Crs             float64 // mean course of the two fixes (degrees)
	Unresolved      bool    // a turn between the fixes around t that the log cannot place in time
	PAE, PAN        float64 // cross-check: the parabola through the positions within ±Win (NaN when fewer than three fixes)
	Turn            float64 // largest course change from the nearest fix within the parabola's window (degrees)
	N               int
	Gap             float64 // seconds to the nearest fix
	Span            float64 // seconds to the farthest fix in the parabola
}

// Win is the half-width (s) of the window over which the track's positions
// are fitted by a parabola in time.
var Win = 60.0

// At interpolates the track at t (position, altitude linearly between the
// two fixes around it). The acceleration is that of the two fixes around t:
// the change of the ground speed they report along the track, and of the
// course across it (v·Δcourse/Δt). As a cross-check, the positions within
// ±Win s are fitted by a parabola in time, east and north in metres on the
// local tangent plane, whose second derivative is an acceleration smoothed
// over the window. Fixes whose
// course differs by more than 5° from the nearest fix's (a turn) are left
// out; when fewer than three remain within Win, the nearest ones out to
// 2·Win complete them.
func At(tr []Fix, t time.Time) (State, error) {
	i := sort.Search(len(tr), func(i int) bool { return !tr[i].T.Before(t) })
	if i == 0 || i == len(tr) {
		return State{}, fmt.Errorf("track: %s outside the log", t)
	}
	a, b := tr[i-1], tr[i]
	w := t.Sub(a.T).Seconds() / b.T.Sub(a.T).Seconds()
	st := State{Lat: a.Lat + w*(b.Lat-a.Lat), Lon: a.Lon + w*(b.Lon-a.Lon), Gap: math.Min(t.Sub(a.T).Seconds(), b.T.Sub(t).Seconds())}
	// altitude: the nearest fixes that carry one
	var lo, hi *Fix
	for j := i - 1; j >= 0 && lo == nil; j-- {
		if !math.IsNaN(tr[j].AltFt) {
			lo = &tr[j]
		}
	}
	for j := i; j < len(tr) && hi == nil; j++ {
		if !math.IsNaN(tr[j].AltFt) {
			hi = &tr[j]
		}
	}
	switch {
	case lo != nil && hi != nil:
		u := t.Sub(lo.T).Seconds() / hi.T.Sub(lo.T).Seconds()
		st.AltFt = lo.AltFt + u*(hi.AltFt-lo.AltFt)
	case lo != nil:
		st.AltFt = lo.AltFt
	case hi != nil:
		st.AltFt = hi.AltFt
	default:
		return State{}, fmt.Errorf("track: no altitude near %s", t)
	}
	near := a
	if w > 0.5 {
		near = b
	}
	cosl := math.Cos(st.Lat * math.Pi / 180)
	var ts, xs, ys []float64
	// the fixes on the same course, nearest in time first; all those within
	// Win, and at least three (out to twice Win)
	var cand []Fix
	for _, f := range tr {
		dt := math.Abs(f.T.Sub(t).Seconds())
		if dt <= 2*Win && math.Abs(math.Remainder(f.Crs-near.Crs, 360)) <= 5 {
			cand = append(cand, f)
		}
	}
	sort.SliceStable(cand, func(i, j int) bool {
		return math.Abs(cand[i].T.Sub(t).Seconds()) < math.Abs(cand[j].T.Sub(t).Seconds())
	})
	for k, f := range cand {
		dt := f.T.Sub(t).Seconds()
		if math.Abs(dt) > Win && k >= 3 {
			break
		}
		st.Turn = math.Max(st.Turn, math.Abs(math.Remainder(f.Crs-near.Crs, 360)))
		st.Span = math.Max(st.Span, math.Abs(dt))
		ts = append(ts, dt)
		xs = append(xs, (f.Lon-st.Lon)*math.Pi/180*R*cosl)
		ys = append(ys, (f.Lat-st.Lat)*math.Pi/180*R)
	}
	st.N = len(ts)
	st.PAE, st.PAN = math.NaN(), math.NaN()
	if st.N >= 3 {
		cx, _ := quad(ts, xs)
		cy, _ := quad(ts, ys)
		st.PAE, st.PAN = 2*cx[2], 2*cy[2]
	}
	// the two fixes around t: the ADS-B ground speed and course they report.
	// A course change of more than 2° between them is a turn whose start or
	// end the log cannot place: the bracket on the steady side of the
	// nearest fix is used when that fix is within 10 s, else the state is
	// unresolved.
	const kt = 1852.0 / 3600
	turn := func(p, q Fix) float64 { return math.Abs(math.Remainder(q.Crs-p.Crs, 360)) }
	if turn(a, b) > 2 {
		st.Unresolved = true
		for _, j := range []int{i - 1, i} {
			if math.Abs(tr[j].T.Sub(t).Seconds()) > 10 {
				continue
			}
			for _, k := range []int{j - 1, j + 1} {
				if k < 0 || k >= len(tr) || k == i || k == i-1 {
					continue
				}
				p, q := tr[min(j, k)], tr[max(j, k)]
				if turn(p, q) <= 2 && st.Unresolved {
					a, b, st.Unresolved = p, q, false
				}
			}
		}
	}
	dt := b.T.Sub(a.T).Seconds()
	dc := math.Remainder(b.Crs-a.Crs, 360)
	st.Crs = a.Crs + dc/2
	v := (a.Kt + b.Kt) / 2 * kt
	al, at := (b.Kt-a.Kt)*kt/dt, v*dc*math.Pi/180/dt // along the track; across it, to the right
	c := st.Crs * math.Pi / 180
	st.VE, st.VN = v*math.Sin(c), v*math.Cos(c)
	st.AE, st.AN = al*math.Sin(c)+at*math.Cos(c), al*math.Cos(c)-at*math.Sin(c)
	// each reported value rounded to 1 kt or 1°: uniform error of ±0.5, SD 1/√12, two of them
	st.SigL = math.Sqrt2 / math.Sqrt(12) * kt / dt
	st.SigT = math.Sqrt2 / math.Sqrt(12) * math.Pi / 180 * v / dt
	return st, nil
}

// quad fits y = c0 + c1 t + c2 t² by least squares (normal equations) and
// returns the coefficients and the standard error of c2.
func quad(t, y []float64) ([3]float64, float64) {
	var m [3][4]float64
	for i := range t {
		p := [3]float64{1, t[i], t[i] * t[i]}
		for r := 0; r < 3; r++ {
			for c := 0; c < 3; c++ {
				m[r][c] += p[r] * p[c]
			}
			m[r][3] += p[r] * y[i]
		}
	}
	inv := invert3([3][3]float64{{m[0][0], m[0][1], m[0][2]}, {m[1][0], m[1][1], m[1][2]}, {m[2][0], m[2][1], m[2][2]}})
	var c [3]float64
	for r := 0; r < 3; r++ {
		for k := 0; k < 3; k++ {
			c[r] += inv[r][k] * m[k][3]
		}
	}
	ss := 0.0
	for i := range t {
		e := y[i] - c[0] - c[1]*t[i] - c[2]*t[i]*t[i]
		ss += e * e
	}
	if len(t) <= 3 {
		return c, math.NaN() // three fixes: an exact parabola, no residual to judge it by
	}
	return c, math.Sqrt(ss / float64(len(t)-3) * inv[2][2])
}

func invert3(a [3][3]float64) [3][3]float64 {
	det := a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1]) - a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0]) + a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0])
	var r [3][3]float64
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			i1, i2, j1, j2 := (j+1)%3, (j+2)%3, (i+1)%3, (i+2)%3
			r[i][j] = (a[i1][j1]*a[i2][j2] - a[i1][j2]*a[i2][j1]) / det
		}
	}
	return r
}

// Omega is the Earth's rotation rate (rad/s) and G the gravity used for the
// tilt (m/s²).
var Omega, G = 7.2921150e-5, 9.80

// Tilt is how far (radians) apparent gravity in the aircraft tilts the
// phone's level along the view azimuth az (degrees): the specific force a
// phone feels is the acceleration relative to the ground plus the Coriolis
// term 2Ω×v, minus gravity; its horizontal part along the view, divided by
// g, lifts the phone's level in that direction. A reading of the dip δ_m
// then stands for δ = δ_m + Tilt (a plane slowing down, viewed forward,
// makes the horizon read deeper).
func (s State) Tilt(az, lat float64) float64 {
	sl := math.Sin(lat * math.Pi / 180)
	ce, cn := -2*Omega*sl*s.VN, 2*Omega*sl*s.VE
	ue, un := math.Sin(az*math.Pi/180), math.Cos(az*math.Pi/180)
	return ((s.AE+ce)*ue + (s.AN+cn)*un) / G
}

// SigTilt is the standard error of Tilt from the log's rounding: the along-
// and across-track errors projected on the view.
func (s State) SigTilt(az float64) float64 {
	d := (az - s.Crs) * math.Pi / 180
	return math.Hypot(s.SigL*math.Cos(d), s.SigT*math.Sin(d)) / G
}

// TiltParabola is Tilt with the parabola's acceleration (cross-check).
func (s State) TiltParabola(az, lat float64) float64 {
	p := s
	p.AE, p.AN = s.PAE, s.PAN
	return p.Tilt(az, lat)
}
