package tonga

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

// IEM endpoints (variables for the tests).
var (
	NetURL = "https://mesonet.agron.iastate.edu/geojson/network/%s_ASOS.geojson"
	OneMin = "https://mesonet.agron.iastate.edu/cgi-bin/request/asos1min.py?station=%s&vars=pres1" +
		"&sts=2022-01-15T00:00Z&ets=2022-01-18T00:00Z&sample=1min&what=download&delim=comma"
)

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

// Fetch replays the script's download: every state's station list, then
// candidates' pressures until PerState stations per state have more than
// 3,000 lines. Cached files are never fetched again.
func Fetch(ctx context.Context, root string, c *http.Client, pause time.Duration, log io.Writer) error {
	if c == nil {
		c = &http.Client{Timeout: 90 * time.Second}
	}
	raw := filepath.Join(root, RawDir)
	if err := os.MkdirAll(raw, 0o755); err != nil {
		return err
	}
	for _, st := range States {
		net := filepath.Join(raw, "net_"+st+".json")
		if _, err := os.Stat(net); err != nil {
			b, err := get(ctx, c, fmt.Sprintf(NetURL, st))
			if err != nil {
				return err
			}
			if err := os.WriteFile(net, b, 0o644); err != nil {
				return err
			}
		}
		cands, err := candidates(root, st)
		if err != nil {
			return err
		}
		n := 0
		for _, f := range cands {
			if n >= PerState {
				break
			}
			p := filepath.Join(raw, f.ID+".csv")
			if _, err := os.Stat(p); err != nil {
				b, err := get(ctx, c, fmt.Sprintf(OneMin, f.ID))
				if err != nil {
					return err
				}
				if err := os.WriteFile(p, b, 0o644); err != nil {
					return err
				}
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(pause):
				}
			}
			b, err := os.ReadFile(p)
			if err != nil {
				return err
			}
			if bytes.Count(b, []byte("\n")) > 3000 {
				n++
			}
		}
		fmt.Fprintf(log, "  %s: %d\n", st, n)
	}
	return nil
}
