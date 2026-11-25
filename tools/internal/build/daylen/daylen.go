// Package daylen measures the length of the day at the stations of the Baseline Surface Radiation Network (BSRN; Driemel
// et al. 2018, Earth Syst. Sci. Data 10:1491), from their one-minute global irradiance, in March, June and December 2019
// (sun and twi tabs, epic34/UC03, 2026-10-28).
//
// The day at a station is the time the sky gives light: the minutes in which the downward short-wave irradiance (SWD,
// a pyranometer on a horizontal plane) is at least 5 W/m². A pyranometer at night reads a few W/m² below zero (thermal
// offset); it reaches 5 W/m² only once the Sun has cleared the horizon by a little (later behind hills, and the
// instrument answers poorly to grazing light), so the measured day is shorter than sunrise to sunset, by minutes in the
// tropics and up to half an hour at high latitude (measured, 2019: rms 18 min), and thick cloud shortens it further. Times and latitudes only: a
// measure. The globe's prediction for the same day (Sun's centre at −0.833°, NOAA's solar equations after Meeus) is drawn
// beside it, and so is the flat model at its best.
//
// The flat model at its best: the azimuthal-equidistant disc (north pole at the centre, 111.2 km per degree of latitude)
// lit by a Sun whose light reaches a distance ρ from the point under it, the point turning once a day on the circle of
// the Sun's declination. ρ is free and fitted for each month to all the stations together (least squares on the day
// lengths): the most a spotlight on that map can do.
package daylen

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Raw inputs, relative to the repository root.
const (
	RawDir = "data/sun/bsrn/raw"
	Out    = "src/data/presets/sun-daylen.js"
)

// Months fetched and reduced.
var Months = []string{"2019-03", "2019-06", "2019-12"}

const (
	d2r       = math.Pi / 180
	threshold = 5.0 // W/m²
	kmPerDeg  = 20015.1 / 180
)

// Day is one station-day.
type Day struct {
	Date      string
	Light     float64 // minutes with SWD ≥ threshold
	Valid     int     // minutes with a reading
	Predicted float64 // minutes, Sun's centre above −0.833° (globe)
}

// Station sums one station-month.
type Station struct {
	Name, Month string
	Lat, Lon    float64
	Days        []Day
}

// sunDecEoT returns the Sun's declination (rad) and the equation of time (min) on a UT instant (NOAA, after Meeus).
func sunDecEoT(t time.Time) (float64, float64) {
	jd := float64(t.Unix())/86400 + 2440587.5
	T := (jd - 2451545) / 36525
	L0 := math.Mod(280.46646+T*(36000.76983+T*0.0003032), 360)
	M := 357.52911 + T*(35999.05029-0.0001537*T)
	e := 0.016708634 - T*(0.000042037+0.0000001267*T)
	C := math.Sin(M*d2r)*(1.914602-T*(0.004817+0.000014*T)) + math.Sin(2*M*d2r)*(0.019993-0.000101*T) + math.Sin(3*M*d2r)*0.000289
	lam := L0 + C - 0.00569 - 0.00478*math.Sin((125.04-1934.136*T)*d2r)
	eps := 23.439291 - 0.0130042*T + 0.00256*math.Cos((125.04-1934.136*T)*d2r)
	dec := math.Asin(math.Sin(eps*d2r) * math.Sin(lam*d2r))
	y := math.Pow(math.Tan(eps*d2r/2), 2)
	eot := 4 / d2r * (y*math.Sin(2*L0*d2r) - 2*e*math.Sin(M*d2r) + 4*e*y*math.Sin(M*d2r)*math.Cos(2*L0*d2r) -
		0.5*y*y*math.Sin(4*L0*d2r) - 1.25*e*e*math.Sin(2*M*d2r))
	return dec, eot
}

// globeDay is the minutes the Sun's centre spends above −0.833° on a date at a latitude (minute steps, refraction and
// the Sun's radius in the −0.833°).
func globeDay(lat, lon float64, date time.Time) float64 {
	n := 0
	for m := 0; m < 1440; m++ {
		t := date.Add(time.Duration(m) * time.Minute)
		dec, eot := sunDecEoT(t)
		ha := (float64(m)+eot+4*lon)/4 - 180
		alt := math.Asin(math.Sin(lat*d2r)*math.Sin(dec) + math.Cos(lat*d2r)*math.Cos(dec)*math.Cos(ha*d2r))
		if alt/d2r > -0.833 {
			n++
		}
	}
	return float64(n)
}

// flatDay is the minutes a station on the azimuthal-equidistant disc spends within ρ km of the point under a spotlight
// Sun circling the pole on the circle of its declination.
func flatDay(lat, lon float64, date time.Time, rho float64) float64 {
	rs := (90 - lat) * kmPerDeg
	n := 0
	for m := 0; m < 1440; m++ {
		t := date.Add(time.Duration(m) * time.Minute)
		dec, eot := sunDecEoT(t)
		sunLon := -((float64(m)+eot)/4 - 180) // the sub-solar longitude
		r := (90 - dec/d2r) * kmPerDeg
		dl := (lon - sunLon) * d2r
		d := math.Sqrt(rs*rs + r*r - 2*rs*r*math.Cos(dl))
		if d <= rho {
			n++
		}
	}
	return float64(n)
}

var dataLine = regexp.MustCompile(`^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})\t`)

// readTab reads one PANGAEA text file: the header's coordinates and the SWD column.
func readTab(path string) (*Station, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	s := string(b)
	st := &Station{}
	if m := regexp.MustCompile(`at station (.+?) \((\d{4}-\d{2})\)`).FindStringSubmatch(s); m != nil {
		st.Name, st.Month = m[1], m[2]
	}
	if m := regexp.MustCompile(`LATITUDE: (-?[0-9.]+) \* LONGITUDE: (-?[0-9.]+)`).FindStringSubmatch(s); m != nil {
		st.Lat, _ = strconv.ParseFloat(m[1], 64)
		st.Lon, _ = strconv.ParseFloat(m[2], 64)
	} else {
		return nil, fmt.Errorf("%s: no coordinates", path)
	}
	lines := strings.Split(s, "\n")
	col := -1
	byDay := map[string]*Day{}
	var order []string
	for _, ln := range lines {
		if strings.HasPrefix(ln, "Date/Time\t") {
			for i, h := range strings.Split(ln, "\t") {
				if strings.HasPrefix(h, "SWD [") {
					col = i
					break
				}
			}
			continue
		}
		if col < 0 || !dataLine.MatchString(ln) {
			continue
		}
		f := strings.Split(ln, "\t")
		if col >= len(f) || f[col] == "" {
			continue
		}
		v, err := strconv.ParseFloat(f[col], 64)
		if err != nil {
			continue
		}
		d := f[0][:10]
		day, ok := byDay[d]
		if !ok {
			day = &Day{Date: d}
			byDay[d] = day
			order = append(order, d)
		}
		day.Valid++
		if v >= threshold {
			day.Light++
		}
	}
	if col < 0 {
		return nil, fmt.Errorf("%s: no SWD column", path)
	}
	sort.Strings(order)
	for _, d := range order {
		day := byDay[d]
		if day.Valid < 1380 { // at most an hour missing
			continue
		}
		t, _ := time.Parse("2006-01-02", d)
		day.Predicted = globeDay(st.Lat, st.Lon, t)
		st.Days = append(st.Days, *day)
	}
	return st, nil
}

// Result is the whole build.
type Result struct {
	Stations []*Station
	Rho      map[string]float64 // best spotlight radius per month, km
	Inputs   []string
}

// Compute reads every station-month on disk.
func Compute(root string) (*Result, error) {
	files, err := filepath.Glob(filepath.Join(root, RawDir, "*.tab"))
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, fmt.Errorf("no %s/*.tab (fog fetch sun-bsrn)", RawDir)
	}
	sort.Strings(files)
	r := &Result{Rho: map[string]float64{}}
	for _, f := range files {
		rel, _ := filepath.Rel(root, f)
		r.Inputs = append(r.Inputs, filepath.ToSlash(rel))
		st, err := readTab(f)
		if err != nil {
			return nil, err
		}
		if len(st.Days) >= 10 {
			r.Stations = append(r.Stations, st)
		}
	}
	// the flat spotlight: one ρ per month, fitted to the 15th of the month at every station (golden-section search)
	for _, mo := range Months {
		date, _ := time.Parse("2006-01-02", mo+"-15")
		var sts []*Station
		for _, s := range r.Stations {
			if s.Month == mo {
				sts = append(sts, s)
			}
		}
		cost := func(rho float64) float64 {
			var c float64
			for _, s := range sts {
				e := flatDay(s.Lat, s.Lon, date, rho) - medLight(s)
				c += e * e
			}
			return c
		}
		a, b := 1000.0, 30000.0
		g := (math.Sqrt(5) - 1) / 2
		for i := 0; i < 50; i++ {
			c, d := b-g*(b-a), a+g*(b-a)
			if cost(c) < cost(d) {
				b = d
			} else {
				a = c
			}
		}
		r.Rho[mo] = (a + b) / 2
	}
	return r, nil
}

func medLight(s *Station) float64 {
	var x []float64
	for _, d := range s.Days {
		x = append(x, d.Light)
	}
	sort.Float64s(x)
	return x[len(x)/2]
}

func medPred(s *Station) float64 {
	var x []float64
	for _, d := range s.Days {
		x = append(x, d.Predicted)
	}
	sort.Float64s(x)
	return x[len(x)/2]
}

// Summary is fog build's report.
func (r *Result) Summary() string {
	var rms float64
	n := 0
	for _, s := range r.Stations {
		e := medLight(s) - medPred(s)
		rms += e * e
		n++
	}
	return fmt.Sprintf("%d station-months; measured light minus the globe's day: rms %.0f min; best spotlight ρ: %v",
		len(r.Stations), math.Sqrt(rms/float64(n)), r.Rho)
}

// File writes per station-month: name, latitude, longitude, median measured light (min), median globe day (min), the
// best flat spotlight's day on the 15th (min), the number of days.
func (r *Result) File() preset.File {
	rows := []any{}
	for _, s := range r.Stations {
		date, _ := time.Parse("2006-01-02", s.Month+"-15")
		rows = append(rows, []any{s.Month, s.Name, pyjson.Round(s.Lat, 3), pyjson.Round(s.Lon, 3), medLight(s), medPred(s),
			flatDay(s.Lat, s.Lon, date, r.Rho[s.Month]), len(s.Days)})
	}
	rho := pyjson.Obj{}
	for _, m := range Months {
		rho = append(rho, pyjson.KV{K: m, V: pyjson.Round(r.Rho[m], 0)})
	}
	var b strings.Builder
	b.WriteString("export const DAYLEN_RHO = " + pyjson.Dumps(rho, pyjson.Compact) + ";\n")
	b.WriteString("// [month, station, lat, lon, measured light (median min/day, SWD >= 5 W/m2), globe day (median min), best flat spotlight (min, the 15th), days]\nexport const DAYLEN = [\n")
	for _, row := range rows {
		b.WriteString(" " + pyjson.Dumps(row, pyjson.Compact) + ",\n")
	}
	b.WriteString("];\n")
	return preset.File{Out: Out, Command: "build sun-bsrn", Inputs: r.Inputs,
		Notes: []string{"Length of the day measured by BSRN pyranometers (one-minute global irradiance, PANGAEA), March, June and December 2019."},
		Body:  b.String()}
}

// Fetch finds the station-months of Months on PANGAEA (search API) and downloads each as text, once.
func Fetch(ctx context.Context, root string, client *http.Client, log io.Writer) error {
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Minute}
	}
	dir := filepath.Join(root, RawDir)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	get := func(u string) ([]byte, error) {
		req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
		if err != nil {
			return nil, err
		}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			return nil, fmt.Errorf("%s: HTTP %d", u, resp.StatusCode)
		}
		return io.ReadAll(resp.Body)
	}
	title := regexp.MustCompile(`measurements of radiation at station (.+?) \((\d{4}-\d{2})\)`)
	tag := regexp.MustCompile(`<[^>]+>`)
	for _, mo := range Months {
		q := url.Values{"q": {`"measurements of radiation at station" "(` + mo + `)"`}, "count": {"200"}}
		b, err := get("https://www.pangaea.de/advanced/search.php?" + q.Encode())
		if err != nil {
			return err
		}
		var res struct {
			Results []struct{ URI, HTML string }
		}
		if err := json.Unmarshal(b, &res); err != nil {
			return err
		}
		for _, it := range res.Results {
			m := title.FindStringSubmatch(tag.ReplaceAllString(it.HTML, ""))
			if m == nil || m[2] != mo {
				continue
			}
			id := strings.TrimPrefix(it.URI, "doi:10.1594/PANGAEA.")
			dst := filepath.Join(dir, mo+"_"+id+".tab")
			if _, err := os.Stat(dst); err == nil {
				continue
			}
			data, err := get("https://doi.pangaea.de/10.1594/PANGAEA." + id + "?format=textfile")
			if err != nil {
				fmt.Fprintf(log, "  %s %s: %v (skipped)\n", mo, m[1], err)
				continue
			}
			if err := os.WriteFile(dst, data, 0o644); err != nil {
				return err
			}
			fmt.Fprintf(log, "  %s %s\n", mo, m[1])
			time.Sleep(time.Second)
		}
	}
	return nil
}
