package seiswaves

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// FDSN web services of the EarthScope (ex-IRIS) data centre (variables for the tests).
var (
	StationURL    = "https://service.iris.edu/fdsnws/station/1/query?net=%s&sta=%s&loc=%s&cha=BH?&starttime=%s&endtime=%s&level=channel&format=text"
	DataselectURL = "https://service.earthscope.org/fdsnws/dataselect/1/query?net=%s&sta=%s&loc=%s&cha=BH?&starttime=%s&endtime=%s"
)

// Station is one line of stations.txt.
type Station struct{ Net, Sta, Loc string }

// ReadStations reads data/seis/waves/stations.txt.
func ReadStations(root string) ([]Station, error) {
	f, err := os.Open(filepath.Join(root, Dir, "stations.txt"))
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var out []Station
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		l := strings.TrimSpace(sc.Text())
		if l == "" || strings.HasPrefix(l, "#") {
			continue
		}
		p := strings.Fields(l)
		if len(p) != 3 {
			return nil, fmt.Errorf("stations.txt: %q", l)
		}
		out = append(out, Station{p[0], p[1], p[2]})
	}
	return out, sc.Err()
}

func get(ctx context.Context, c *http.Client, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "FlatOrGlobe-fog/1 (data compiler)")
	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if resp.StatusCode == http.StatusNoContent || resp.StatusCode == http.StatusNotFound { // no data for this station and window
		return nil, nil
	}
	if err == nil && resp.StatusCode != http.StatusOK {
		err = fmt.Errorf("GET %s: HTTP %d", url, resp.StatusCode)
	}
	return b, err
}

// Fetch downloads each station's channel metadata (text) and its three BH
// channels over the window, once.
func Fetch(ctx context.Context, root string, c *http.Client, log io.Writer) error {
	if c == nil {
		c = &http.Client{Timeout: 5 * time.Minute}
	}
	sts, err := ReadStations(root)
	if err != nil {
		return err
	}
	for _, q := range Quakes {
		raw := filepath.Join(root, RawDir, q.Key)
		if err := os.MkdirAll(raw, 0o755); err != nil {
			return err
		}
		t0, t1 := q.Start.Format("2006-01-02T15:04:05"), q.End.Format("2006-01-02T15:04:05")
		for _, s := range sts {
			for _, f := range []struct{ ext, url string }{{".txt", StationURL}, {".mseed", DataselectURL}} {
				p := filepath.Join(raw, s.Sta+f.ext)
				if _, err := os.Stat(p); err == nil {
					continue
				}
				b, err := get(ctx, c, fmt.Sprintf(f.url, s.Net, s.Sta, s.Loc, t0, t1))
				if err != nil {
					return err
				}
				if err := os.WriteFile(p, b, 0o644); err != nil {
					return err
				}
				fmt.Fprintf(log, "  %s/%s%s %d bytes\n", q.Key, s.Sta, f.ext, len(b))
				time.Sleep(time.Second)
			}
		}
	}
	return nil
}
