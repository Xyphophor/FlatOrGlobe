package fetch

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

// sha256("hello")
const helloSum = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"

func fast() *Client { return &Client{Retries: 2, Pause: time.Millisecond, UserAgent: "fog-test"} }

func TestGetAndCache(t *testing.T) {
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		if r.UserAgent() != "fog-test" {
			t.Errorf("user agent %q", r.UserAgent())
		}
		w.Write([]byte("hello"))
	}))
	defer srv.Close()
	dest := filepath.Join(t.TempDir(), "raw", "a.txt")
	sum, err := fast().Get(context.Background(), srv.URL, dest, helloSum)
	if err != nil || sum != helloSum {
		t.Fatalf("Get = %s, %v", sum, err)
	}
	if _, err := fast().Get(context.Background(), srv.URL, dest, helloSum); err != nil {
		t.Fatal(err)
	}
	if hits.Load() != 1 {
		t.Errorf("%d requests, the second Get must use the cache", hits.Load())
	}
	if fi, _ := os.Stat(dest); fi.Mode().Perm() != 0o644 {
		t.Errorf("mode %v, want 0644", fi.Mode().Perm())
	}
}

func TestCachedFileWithWrongSumIsAnError(t *testing.T) {
	dest := filepath.Join(t.TempDir(), "a.txt")
	os.WriteFile(dest, []byte("changed"), 0o644)
	_, err := fast().Get(context.Background(), "http://127.0.0.1:1/never", dest, helloSum)
	if !errors.Is(err, ErrChecksum) {
		t.Fatalf("err = %v, want checksum error", err)
	}
	if b, _ := os.ReadFile(dest); string(b) != "changed" {
		t.Error("cached file was replaced")
	}
}

func TestDownloadedFileWithWrongSumIsNotKept(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("hellO")) }))
	defer srv.Close()
	dir := t.TempDir()
	dest := filepath.Join(dir, "a.txt")
	if _, err := fast().Get(context.Background(), srv.URL, dest, helloSum); !errors.Is(err, ErrChecksum) {
		t.Fatalf("err = %v", err)
	}
	if entries, _ := os.ReadDir(dir); len(entries) != 0 {
		t.Errorf("left %d files in the cache", len(entries))
	}
}

func TestRetriesTransientErrors(t *testing.T) {
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch hits.Add(1) {
		case 1:
			w.WriteHeader(http.StatusServiceUnavailable)
		case 2:
			w.WriteHeader(http.StatusTooManyRequests)
		default:
			w.Write([]byte("hello"))
		}
	}))
	defer srv.Close()
	if _, err := fast().Get(context.Background(), srv.URL, filepath.Join(t.TempDir(), "a"), helloSum); err != nil {
		t.Fatal(err)
	}
	if hits.Load() != 3 {
		t.Errorf("%d requests, want 3", hits.Load())
	}
}

func TestGivesUpAfterRetries(t *testing.T) {
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		w.WriteHeader(http.StatusBadGateway)
	}))
	defer srv.Close()
	_, err := fast().Get(context.Background(), srv.URL, filepath.Join(t.TempDir(), "a"), "")
	if err == nil || !strings.Contains(err.Error(), "after 3 attempts") {
		t.Fatalf("err = %v", err)
	}
	if hits.Load() != 3 {
		t.Errorf("%d requests, want 1 + 2 retries", hits.Load())
	}
}

func TestNotFoundIsNotRetried(t *testing.T) {
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		http.NotFound(w, r)
	}))
	defer srv.Close()
	_, err := fast().Get(context.Background(), srv.URL, filepath.Join(t.TempDir(), "a"), "")
	var he *HTTPError
	if !errors.As(err, &he) || he.Status != 404 {
		t.Fatalf("err = %v", err)
	}
	if hits.Load() != 1 {
		t.Errorf("404 retried (%d requests)", hits.Load())
	}
}

// The reason this package exists: a certificate that does not verify must
// fail, as `curl -k` in build_seis_radius.py did not.
func TestTLSIsVerified(t *testing.T) {
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("hello")) }))
	defer srv.Close()
	c := &Client{Retries: 1, Pause: time.Millisecond}
	if _, err := c.Get(context.Background(), srv.URL, filepath.Join(t.TempDir(), "a"), ""); err == nil {
		t.Fatal("self-signed certificate accepted")
	}
	// with the test server's own CA trusted, it works
	c.HTTP = srv.Client()
	if _, err := c.Get(context.Background(), srv.URL, filepath.Join(t.TempDir(), "a"), helloSum); err != nil {
		t.Fatal(err)
	}
}
