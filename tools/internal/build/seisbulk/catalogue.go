package seisbulk

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

const (
	Dir    = "data/seis/bulk"
	RawDir = Dir + "/raw"
	Cat    = RawDir + "/catalogue.html"
)

// Event is one line of the ISC catalogue (prime hypocentre, GCMT Mw).
type Event struct {
	ID         string
	Date, Time string // 2000-02-25, 01:43:59.87 (UTC)
	Lat, Lon   float64
	Depth, Mw  float64
}

var catRow = regexp.MustCompile(`^\s*(\d+)\s*,`)

// ReadCatalogue parses raw/catalogue.html (CATCSV): EVENTID, TYPE, AUTHOR,
// DATE, TIME, LAT, LON, DEPTH, DEPFIX, then (AUTHOR, TYPE, MAG) triples; the
// first GCMT MW is kept. The order is the catalogue's (by time).
func ReadCatalogue(root string) ([]Event, error) {
	b, err := os.ReadFile(filepath.Join(root, Cat))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch seis-radius)", err)
	}
	var evs []Event
	seen := map[string]bool{}
	for _, line := range strings.Split(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n") {
		if !catRow.MatchString(line) {
			continue
		}
		f := strings.Split(line, ",")
		for i := range f {
			f[i] = strings.TrimSpace(f[i])
		}
		if len(f) < 12 {
			return nil, fmt.Errorf("catalogue: short line %q", line)
		}
		var ev Event
		ev.ID, ev.Date, ev.Time = f[0], f[3], f[4]
		var e [3]error
		ev.Lat, e[0] = strconv.ParseFloat(f[5], 64)
		ev.Lon, e[1] = strconv.ParseFloat(f[6], 64)
		ev.Depth, e[2] = strconv.ParseFloat(f[7], 64)
		for _, x := range e {
			if x != nil {
				return nil, fmt.Errorf("catalogue: %q: %w", line, x)
			}
		}
		ev.Mw = -1
		for i := 9; i+2 < len(f); i += 3 {
			if f[i] == "GCMT" && strings.EqualFold(f[i+1], "MW") {
				ev.Mw, _ = strconv.ParseFloat(f[i+2], 64)
				break
			}
		}
		if ev.Mw < 0 || seen[ev.ID] {
			continue
		}
		seen[ev.ID] = true
		evs = append(evs, ev)
	}
	if len(evs) == 0 {
		return nil, fmt.Errorf("catalogue: no events")
	}
	return evs, nil
}
