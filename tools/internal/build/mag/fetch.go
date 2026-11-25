package mag

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Endpoints (variables so that tests can point them at a local server).
var (
	FormURL   = "https://geomag.bgs.ac.uk/data_service/data/annual_means.shtml"
	MeansCGI  = "https://geomag.bgs.ac.uk/cgi-bin/means"
	SurveyAPI = "https://wdcapi.bgs.ac.uk/global-geomagnetic-survey"
)

// Fetcher downloads what build needs and is missing; with Refresh it
// re-reads the WDC form (the list of observatories may have changed).
type Fetcher struct {
	Client  *http.Client
	Pause   time.Duration // between two observatory requests (1 s, as the script)
	Refresh bool
	Log     io.Writer
}

func (f *Fetcher) do(ctx context.Context, req *http.Request) ([]byte, error) {
	resp, err := f.Client.Do(req.WithContext(ctx))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%s %s: HTTP %d", req.Method, req.URL, resp.StatusCode)
	}
	return b, nil
}

func write(p string, b []byte) error {
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		return err
	}
	return os.WriteFile(p, b, 0o644)
}

func exists(p string) bool { _, err := os.Stat(p); return err == nil }

// Run fetches for every source of the manifest.
func (f *Fetcher) Run(ctx context.Context, root string) error {
	if f.Client == nil {
		f.Client = &http.Client{Timeout: 5 * time.Minute}
	}
	srcs, err := ReadSources(root)
	if err != nil {
		return err
	}
	for _, s := range srcs {
		switch s.Kind {
		case "wdc-annual-means":
			err = f.annualMeans(ctx, root, s)
		case "wdc-survey":
			err = f.survey(ctx, root, s)
		}
		if err != nil {
			return fmt.Errorf("source %s: %w", s.Key, err)
		}
	}
	return nil
}

func (f *Fetcher) annualMeans(ctx context.Context, root string, s Source) error {
	form := filepath.Join(root, FormPage)
	if f.Refresh || !exists(form) {
		req, _ := http.NewRequest(http.MethodGet, FormURL, nil)
		b, err := f.do(ctx, req)
		if err != nil {
			return err
		}
		if err := write(form, b); err != nil {
			return err
		}
	}
	page, err := os.ReadFile(form)
	if err != nil {
		return err
	}
	listed := Listing(string(page))
	fmt.Fprintf(f.Log, "  %d observatories listed\n", len(listed))
	failed, first := 0, true
	for _, l := range listed {
		p := filepath.Join(root, RawDir, s.Key, l[0]+".html")
		if exists(p) {
			continue
		}
		if !first {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(f.Pause):
			}
		}
		first = false
		body := url.Values{"name": {"FlatOrGlobe"}, "observatory": {l[0]}}.Encode() + "&map=0&option=observatory"
		req, _ := http.NewRequest(http.MethodPost, MeansCGI, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		b, err := f.do(ctx, req)
		if err != nil {
			fmt.Fprintf(f.Log, "  %s: fetch failed (%v), skipped -- rerun to retry\n", l[0], err)
			failed++
			continue
		}
		if err := write(p, ResultSection(b)); err != nil {
			return err
		}
		fmt.Fprintf(f.Log, "  %s: fetched\n", l[0])
	}
	if failed > 0 {
		fmt.Fprintf(f.Log, "  %d observatories not fetched (counted as fetch_failed by the build)\n", failed)
	}
	return nil
}

// ResultSection keeps the part of the answer between "<h1>Results" and
// "Data and Services", as the script did (the page around it changes
// with the site's layout, the table does not).
func ResultSection(b []byte) []byte {
	a := bytes.Index(b, []byte("<h1>Results"))
	if a < 0 {
		return []byte("FETCH-ERROR\n")
	}
	end := bytes.Index(b[a:], []byte("Data and Services"))
	if end < 0 {
		// Python's body[a:-1]: everything but the last character
		end = len(b) - a - 1
	}
	out := append([]byte{}, b[a:a+end]...)
	return append(out, '\n')
}

// SurveyURL is the API query for one record type.
func SurveyURL(s Source, t string) string {
	flags := ""
	for _, x := range SurveyTypes {
		v := "false"
		if x.Type == t {
			v = "true"
		}
		flags += "&include-" + x.Type + "=" + v
	}
	return fmt.Sprintf("%s?start_dt=%d-01-01&end_dt=%d-12-31&file_format=json"+
		"&include-satellite=false&include-marine-scalar=false&include-observatory=false"+
		"&add-source-information=true%s", SurveyAPI, s.Years[0], s.Years[1], flags)
}

func (f *Fetcher) survey(ctx context.Context, root string, s Source) error {
	types := s.Types
	if len(types) == 0 {
		types = []string{"repeat-station"}
	}
	for _, t := range types {
		p := filepath.Join(root, SurveyFile(s, t))
		if exists(p) && !f.Refresh {
			continue
		}
		req, _ := http.NewRequest(http.MethodGet, SurveyURL(s, t), nil)
		b, err := f.do(ctx, req)
		if err != nil {
			return err
		}
		if err := write(p, b); err != nil {
			return err
		}
		fmt.Fprintf(f.Log, "  %s: %d bytes\n", t, len(b))
	}
	return nil
}
