package mag

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

func TestResultSection(t *testing.T) {
	page := []byte("<html>menu<h1>Results of Observatory Annual Means query</h1><TABLE>x</TABLE>Data and Services footer</html>")
	if got := string(ResultSection(page)); got != "<h1>Results of Observatory Annual Means query</h1><TABLE>x</TABLE>\n" {
		t.Errorf("%q", got)
	}
	if got := string(ResultSection([]byte("<h1>Results x"))); got != "<h1>Results \n" {
		t.Errorf("no footer (Python drops the last character): %q", got)
	}
	if got := string(ResultSection([]byte("error page"))); got != "FETCH-ERROR\n" {
		t.Errorf("%q", got)
	}
}

// The URL the script built for the survey API, copied from its output.
func TestSurveyURL(t *testing.T) {
	s := Source{Years: [2]int{1990, 2025}}
	want := SurveyAPI + "?start_dt=1990-01-01&end_dt=2025-12-31&file_format=json&include-satellite=false" +
		"&include-marine-scalar=false&include-observatory=false&add-source-information=true" +
		"&include-repeat-station=false&include-one-off=true&include-marine-vector=false&include-aeromag=false"
	if got := SurveyURL(s, "one-off"); got != want {
		t.Errorf("\n got %s\nwant %s", got, want)
	}
}

func TestFetchMissingOnly(t *testing.T) {
	var mu sync.Mutex
	var posts []string
	gets := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()
		switch {
		case r.URL.Path == "/form":
			gets++
			io.WriteString(w, `<select><option value="AAA">AAA ALMA-ATA</option><option>BBB  BOU&amp;LDER </option></select>`)
		case r.URL.Path == "/cgi" && r.Method == http.MethodPost:
			b, _ := io.ReadAll(r.Body)
			posts = append(posts, string(b))
			io.WriteString(w, "<html><h1>Results</h1><TABLE></TABLE>Data and Services</html>")
		case r.URL.Path == "/api":
			io.WriteString(w, `{"global-survey-data": []}`)
		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()
	oldF, oldC, oldS := FormURL, MeansCGI, SurveyAPI
	FormURL, MeansCGI, SurveyAPI = srv.URL+"/form", srv.URL+"/cgi", srv.URL+"/api"
	defer func() { FormURL, MeansCGI, SurveyAPI = oldF, oldC, oldS }()

	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, RawDir, "obs"), 0o755)
	os.WriteFile(filepath.Join(root, Manifest), []byte(`[
	 {"key":"obs","kind":"wdc-annual-means","name":"o","years":[2015,2025],"cite":"c","url":"u"},
	 {"key":"survey","kind":"wdc-survey","name":"s","years":[1990,2025],"types":["one-off"],"cite":"c","url":"u"}]`), 0o644)
	os.WriteFile(filepath.Join(root, RawDir, "obs", "AAA.html"), []byte("cached"), 0o644)
	f := &Fetcher{Client: srv.Client(), Log: io.Discard}
	if err := f.Run(context.Background(), root); err != nil {
		t.Fatal(err)
	}
	if gets != 1 || len(posts) != 1 || posts[0] != "name=FlatOrGlobe&observatory=BBB&map=0&option=observatory" {
		t.Errorf("gets %d, posts %q", gets, posts)
	}
	if b, _ := os.ReadFile(filepath.Join(root, RawDir, "obs", "AAA.html")); string(b) != "cached" {
		t.Error("cached observatory refetched")
	}
	if l := Listing(mustRead(t, filepath.Join(root, FormPage))); len(l) != 2 || l[1] != [2]string{"BBB", "BOU&LDER"} {
		t.Errorf("listing %q", l)
	}
	if !strings.Contains(mustRead(t, filepath.Join(root, RawDir, "survey", "one-off-1990-2025.json")), "global-survey-data") {
		t.Error("survey answer not stored")
	}
	// second run: nothing missing, the form is not re-read without Refresh
	if err := f.Run(context.Background(), root); err != nil || gets != 1 || len(posts) != 1 {
		t.Errorf("second run: err %v, gets %d, posts %d", err, gets, len(posts))
	}
}

func mustRead(t *testing.T, p string) string {
	t.Helper()
	b, err := os.ReadFile(p)
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}
