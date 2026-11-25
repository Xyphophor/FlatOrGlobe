package seisbulk

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// ISC endpoints (variables for the tests). The catalogue query IS the
// selection rule: reviewed ISC Bulletin, 2000-2023, depth at most 70 km,
// moment magnitude 7.0 or more from the Global CMT project.
var (
	CatalogueURL = "https://www.isc.ac.uk/cgi-bin/web-db-run?request=REVIEWED&out_format=CATCSV&searchshape=GLOBAL" +
		"&start_year=2000&start_month=01&start_day=01&start_time=00:00:00" +
		"&end_year=2023&end_month=12&end_day=31&end_time=23:59:59" +
		"&max_dep=70&min_mag=7.0&req_mag_type=MW&req_mag_agcy=GCMT&include_magnitudes=on"
	EventURL = "https://www.isc.ac.uk/cgi-bin/web-db-run?event_id=%s&out_format=ISF2&request=COMPREHENSIVE&include_phases=on"
)

func get(ctx context.Context, c *http.Client, url string) ([]byte, error) {
	var last error
	for try := 0; try < 6; try++ {
		if try > 0 { // "please try again in a few minutes"
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(time.Duration(try*60) * time.Second):
			}
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("User-Agent", "FlatOrGlobe-fog/1 (data compiler)")
		resp, err := c.Do(req)
		if err != nil {
			last = err
			continue
		}
		b, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err == nil && resp.StatusCode != http.StatusOK {
			err = fmt.Errorf("GET %s: HTTP %d", url, resp.StatusCode)
		}
		if err == nil && !bytes.Contains(b, []byte("DATA_TYPE ")) {
			err = fmt.Errorf("GET %s: no ISF/CSV block (ISC busy?)", url)
		}
		if err == nil {
			return b, nil
		}
		last = err
	}
	return nil, last
}

// Fetch downloads the catalogue once, then every event's comprehensive
// bulletin (ISF2 with phases), one at a time with a pause (the ISC answers
// "try again in a few minutes" to parallel requests). Cached files are kept.
func Fetch(ctx context.Context, root string, c *http.Client, log io.Writer) error {
	if c == nil {
		c = &http.Client{Timeout: 5 * time.Minute}
	}
	raw := filepath.Join(root, RawDir)
	if err := os.MkdirAll(raw, 0o755); err != nil {
		return err
	}
	cat := filepath.Join(raw, "catalogue.html")
	if _, err := os.Stat(cat); err != nil {
		b, err := get(ctx, c, CatalogueURL)
		if err != nil {
			return err
		}
		if err := os.WriteFile(cat, b, 0o644); err != nil {
			return err
		}
	}
	evs, err := ReadCatalogue(root)
	if err != nil {
		return err
	}
	fmt.Fprintf(log, "  catalogue: %d events\n", len(evs))
	jobs := make(chan Event)
	var mu sync.Mutex
	var first error
	done := 0
	var wg sync.WaitGroup
	for w := 0; w < 1; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for ev := range jobs {
				p := filepath.Join(raw, ev.ID+".isf")
				if _, err := os.Stat(p); err == nil {
					continue
				}
				b, err := get(ctx, c, fmt.Sprintf(EventURL, ev.ID))
				if err == nil {
					err = os.WriteFile(p+".part", b, 0o644)
				}
				if err == nil {
					err = os.Rename(p+".part", p)
				}
				mu.Lock()
				done++
				if err != nil && first == nil {
					first = err
				}
				fmt.Fprintf(log, "  %s %s (%d)\n", ev.ID, ev.Date, done)
				mu.Unlock()
				time.Sleep(3 * time.Second)
			}
		}()
	}
	for _, ev := range evs {
		jobs <- ev
	}
	close(jobs)
	wg.Wait()
	return first
}
