// Package fetch downloads raw inputs into a local cache, once.
//
// It replaces the per-script urllib / `curl` / `curl -k` calls of the
// Python builders: TLS is always verified (there is no option to turn it
// off), a file is only placed in the cache after it is complete and its
// SHA-256 matches the expected one when one is given, transient failures
// (network errors, 429, 5xx) are retried with a growing pause, and other
// HTTP errors fail at once. Nothing here is used by `fog build`, which
// never touches the network.
package fetch

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Client holds the download policy.
type Client struct {
	HTTP      *http.Client  // nil = a client with a 5 min timeout
	Retries   int           // extra attempts after the first (default 3 when zero)
	Pause     time.Duration // pause before retry n is n×Pause (default 2 s when zero)
	UserAgent string        // sent with every request
	Accept    string        // Accept header, "" = none (e.g. application/json for a Desmos graph)
}

// ErrChecksum is returned when a file's SHA-256 is not the expected one.
var ErrChecksum = errors.New("sha256 mismatch")

// HTTPError is a non-retryable HTTP status.
type HTTPError struct {
	URL    string
	Status int
}

func (e *HTTPError) Error() string { return fmt.Sprintf("GET %s: HTTP %d", e.URL, e.Status) }

func (c *Client) http() *http.Client {
	if c.HTTP != nil {
		return c.HTTP
	}
	return &http.Client{Timeout: 5 * time.Minute}
}

// Get makes sure dest holds url's content and returns its SHA-256.
// If dest exists it is not downloaded again, only checked against want
// (when want is not empty). A cached file that fails the check is an
// error, never silently replaced: the archive may have changed.
func (c *Client) Get(ctx context.Context, url, dest, want string) (string, error) {
	if _, err := os.Stat(dest); err == nil {
		sum, err := sumFile(dest)
		if err != nil {
			return "", err
		}
		if want != "" && sum != want {
			return sum, fmt.Errorf("%s (cached): %w: have %s, want %s", dest, ErrChecksum, sum, want)
		}
		return sum, nil
	}
	retries, pause := c.Retries, c.Pause
	if retries == 0 {
		retries = 3
	}
	if pause == 0 {
		pause = 2 * time.Second
	}
	var last error
	for attempt := 0; attempt <= retries; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return "", ctx.Err()
			case <-time.After(time.Duration(attempt) * pause):
			}
		}
		sum, err := c.once(ctx, url, dest, want)
		if err == nil {
			return sum, nil
		}
		last = err
		if _, ok := err.(retryable); !ok || ctx.Err() != nil {
			return "", err
		}
	}
	return "", fmt.Errorf("after %d attempts: %w", retries+1, last)
}

// retryable marks a transient failure; every other error ends Get at once.
type retryable struct{ error }

func (r retryable) Unwrap() error { return r.error }

func (c *Client) once(ctx context.Context, url, dest, want string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	if c.UserAgent != "" {
		req.Header.Set("User-Agent", c.UserAgent)
	}
	if c.Accept != "" {
		req.Header.Set("Accept", c.Accept)
	}
	resp, err := c.http().Do(req)
	if err != nil {
		return "", retryable{err}
	}
	defer resp.Body.Close()
	switch {
	case resp.StatusCode == http.StatusOK:
	case resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= 500:
		return "", retryable{fmt.Errorf("GET %s: HTTP %d", url, resp.StatusCode)}
	default:
		return "", &HTTPError{URL: url, Status: resp.StatusCode}
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return "", err
	}
	tmp, err := os.CreateTemp(filepath.Dir(dest), ".part-*")
	if err != nil {
		return "", err
	}
	defer os.Remove(tmp.Name())
	h := sha256.New()
	n, err := io.Copy(io.MultiWriter(tmp, h), resp.Body)
	if cerr := tmp.Close(); err == nil {
		err = cerr
	}
	if err != nil {
		return "", retryable{err}
	}
	if resp.ContentLength >= 0 && n != resp.ContentLength {
		return "", retryable{fmt.Errorf("GET %s: got %d of %d bytes", url, n, resp.ContentLength)}
	}
	sum := hex.EncodeToString(h.Sum(nil))
	if want != "" && sum != want {
		return "", fmt.Errorf("GET %s: %w: got %s, want %s", url, ErrChecksum, sum, want)
	}
	if err := os.Chmod(tmp.Name(), 0o644); err != nil { // CreateTemp makes 0600
		return "", err
	}
	if err := os.Rename(tmp.Name(), dest); err != nil {
		return "", err
	}
	return sum, nil
}

func sumFile(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
