package mlo

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// DayURL is NOAA GML's one-minute radiation file of a day of the year.
var DayURL = "https://gml.noaa.gov/aftp/data/radiation/baseline/mlo/%d/mlo%02d%03d.dat"

// Fetch downloads the missing days of Year; a day the archive does not
// have (an HTML page comes back) is skipped, as the script did. The
// Copernicus tiles are plain inputs with a URL (fog fetch gets them).
func Fetch(ctx context.Context, root string, c *http.Client, log io.Writer) error {
	if c == nil {
		c = &http.Client{Timeout: 60 * time.Second}
	}
	days := 365
	if Year%4 == 0 {
		days = 366
	}
	got := 0
	for doy := 1; doy <= days; doy++ {
		p := filepath.Join(root, RawDir, fmt.Sprintf("mlo%02d%03d.dat", Year%100, doy))
		if _, err := os.Stat(p); err == nil {
			continue
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf(DayURL, Year, Year%100, doy), nil)
		if err != nil {
			return err
		}
		resp, err := c.Do(req)
		if err != nil {
			fmt.Fprintf(log, "  day %d: %v (skipped)\n", doy, err)
			continue
		}
		b, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil || resp.StatusCode != http.StatusOK || bytes.HasPrefix(bytes.TrimSpace(b), []byte("<")) {
			continue // no file that day
		}
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(p, b, 0o644); err != nil {
			return err
		}
		got++
	}
	fmt.Fprintf(log, "  %d days fetched\n", got)
	return nil
}
