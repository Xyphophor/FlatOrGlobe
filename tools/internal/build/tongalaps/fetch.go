package tongalaps

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"flatorglobe/tools/internal/build/tonga"
)

// LongURL is the IEM one-minute request for one station over seven days (variable for the tests).
var LongURL = "https://mesonet.agron.iastate.edu/cgi-bin/request/asos1min.py?station=%s&vars=pres1" +
	"&sts=2022-01-15T00:00Z&ets=2022-01-22T00:00Z&sample=1min&what=download&delim=comma"

func get(ctx context.Context, c *http.Client, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if err == nil && resp.StatusCode != http.StatusOK {
		err = fmt.Errorf("GET %s: HTTP %d", url, resp.StatusCode)
	}
	return b, err
}

// Fetch downloads the seven-day pressure of the 102 stations seis-tonga selected (its raw files must be there:
// fog fetch seis-tonga). Cached files are never fetched again.
func Fetch(ctx context.Context, root string, c *http.Client, pause time.Duration, log io.Writer) error {
	if c == nil {
		c = &http.Client{Timeout: 180 * time.Second}
	}
	sts, err := tonga.Select(root)
	if err != nil {
		return err
	}
	raw := filepath.Join(root, RawDir)
	if err := os.MkdirAll(raw, 0o755); err != nil {
		return err
	}
	got := 0
	for _, s := range sts {
		p := filepath.Join(raw, s.ID+".csv")
		if _, err := os.Stat(p); err == nil {
			continue
		}
		b, err := get(ctx, c, fmt.Sprintf(LongURL, s.ID))
		if err != nil {
			return err
		}
		if err := os.WriteFile(p, b, 0o644); err != nil {
			return err
		}
		got++
		fmt.Fprintf(log, "  %s (%d/%d)\n", s.ID, got, len(sts))
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pause):
		}
	}
	return nil
}
