// Package dataset reads and validates data/**/dataset.json, the manifest
// that turns a directory of raw material into a dataset fog can check and
// compile (epic24/UC02). The format is documented in data/README.md.
//
// A dataset says what it is (title, tab, sources, licence), what kind of
// evidence it can support (rule 10: does the Earth's radius enter the
// data, and where), what would vindicate the flat model (rule 5), which
// files it is made of (each one hashed in inputs.lock, sha256sum format)
// and which generated files come out of it, by which fog target.
package dataset

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/fs"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// SchemaVersion is the only version fog reads today.
const SchemaVersion = 1

// ExplainExt is the suffix of the metadata file fog writes beside every data file (fog build explain).
const ExplainExt = ".explain"

// File name of the manifest and of its lock.
const (
	ManifestName = "dataset.json"
	LockName     = "inputs.lock"
)

// Dataset is one manifest.
type Dataset struct {
	SchemaVersion int    `json:"schema_version"`
	ID            string `json:"id"`
	Title         string `json:"title"`
	Tab           string `json:"tab"`
	// Build names the fog targets that compile it ("fog:<target>", several
	// separated by spaces when they share the inputs), or, until the port,
	// the script that still does ("script:scripts/x.py").
	Build string `json:"build"`
	// Kind says how the raw material was obtained (see Kinds).
	Kind string `json:"kind"`
	// Evidence is the class the data can support at best (rule 10).
	Evidence string `json:"evidence"`
	// RadiusEntersVia lists the fields a globe model touched. Empty for
	// "measure", required for "check".
	RadiusEntersVia []Entry `json:"radius_enters_via"`
	// VerdictRule: what result would vindicate the flat model (rule 5).
	VerdictRule string            `json:"verdict_rule"`
	License     string            `json:"license"`
	LicenseNote string            `json:"license_note,omitempty"`
	Sources     []Source          `json:"sources"`
	Collected   string            `json:"collected"` // YYYY-MM-DD, or YYYY-MM-DD/YYYY-MM-DD
	Units       map[string]string `json:"units"`
	Inputs      []Input           `json:"inputs"`
	Outputs     []string          `json:"outputs"` // repo-relative generated files
	Notes       string            `json:"notes,omitempty"`
	// Transparency (2026-11-25, Xyphophor: « le maître mot c'est la transparence »): whether the raw files may be
	// published in the public repository (else only their hash and URL are), and why; the code that turns them into
	// the page's numbers; the page sections that show them ("tab/section"). Every input says how it was obtained.
	PublicRaw    string   `json:"public_raw"`               // "yes" or "no"
	PublicRawWhy string   `json:"public_raw_why,omitempty"` // required for "no"
	Code         []string `json:"code"`                     // repo-relative files or directories
	Sections     []string `json:"sections"`                 // "tab/section" of the page

	Dir string `json:"-"` // repo-relative directory of the manifest
}

// Entry is one place where the radius enters.
type Entry struct {
	Field string `json:"field"`
	How   string `json:"how"`
}

// Source is one citation.
type Source struct {
	Cite string `json:"cite"`
	URL  string `json:"url,omitempty"`
}

// Input is one file, or a glob of files, relative to the dataset directory.
// URL, for a single file, is where `fog fetch` gets it when missing.
// Ignored marks files kept out of git (too big): CI cannot see them, so
// their absence is a warning, not an error.
type Input struct {
	Path    string `json:"path,omitempty"`
	Glob    string `json:"glob,omitempty"`
	URL     string `json:"url,omitempty"`
	Ignored bool   `json:"gitignored,omitempty"`
	// Provenance, written into each file's .explain: how it was obtained (see Hows), from where exactly (URL,
	// publication and pages), what checks it went through, and what could still be wrong in it.
	How     string `json:"how"`
	Origin  string `json:"origin"`
	Checks  string `json:"checks,omitempty"`
	Caveats string `json:"caveats,omitempty"`
	// PublicRaw overrides the dataset's for this input ("yes"/"no"), with its reason.
	PublicRaw    string `json:"public_raw,omitempty"`
	PublicRawWhy string `json:"public_raw_why,omitempty"`
}

// Hows: how one input file was obtained.
var Hows = map[string]string{
	"download":      "downloaded as published (fog fetch or by hand)",
	"api":           "the answer of a public web API to the request given",
	"scrape":        "values extracted from web pages",
	"transcription": "typed by hand (or OCR checked by hand) from a printed or scanned source",
	"ours":          "written by us (lists, choices, positions), not measured",
	"contributor":   "sent by a contributor (photos, logs)",
}

// Kinds of raw material.
var Kinds = map[string]string{
	"transcription": "typed by hand from a printed source",
	"archive":       "files downloaded as published by an open archive",
	"scrape":        "values extracted from web pages",
	"api":           "answers of a public web API",
	"instrument":    "our own or a contributor's measurements",
	"photo":         "photographs, measured by us",
}

// Licenses fog accepts; "other" needs a license_note.
var Licenses = map[string]bool{
	"public-domain": true, "CC0-1.0": true, "CC-BY-4.0": true, "CC-BY-SA-4.0": true,
	"ODbL-1.0": true, "other": true,
}

// Evidence classes (src/data/evidence.js, EV_CLASSES).
var Evidence = map[string]bool{"measure": true, "check": true, "model": true}

// Severity of a Problem.
type Severity int

const (
	Error Severity = iota
	Warning
)

// Problem is one validation finding.
type Problem struct {
	Sev   Severity
	Field string
	Msg   string
}

func (p Problem) String() string {
	s := "error"
	if p.Sev == Warning {
		s = "warning"
	}
	return fmt.Sprintf("%s: %s: %s", s, p.Field, p.Msg)
}

// Load parses a manifest strictly: unknown fields are errors (a typo in
// a field name must not silently drop the field).
func Load(root, rel string) (*Dataset, error) {
	b, err := os.ReadFile(filepath.Join(root, rel))
	if err != nil {
		return nil, err
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields()
	var d Dataset
	if err := dec.Decode(&d); err != nil {
		return nil, fmt.Errorf("%s: %w", rel, err)
	}
	if dec.More() {
		return nil, fmt.Errorf("%s: trailing data after the JSON object", rel)
	}
	d.Dir = filepath.ToSlash(filepath.Dir(rel))
	return &d, nil
}

// Discover returns every manifest under data/, sorted.
func Discover(root string) ([]string, error) {
	var out []string
	err := filepath.WalkDir(filepath.Join(root, "data"), func(p string, e fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if e.IsDir() && (e.Name() == "raw" || e.Name() == "cache") {
			return filepath.SkipDir
		}
		if !e.IsDir() && e.Name() == ManifestName {
			rel, _ := filepath.Rel(root, p)
			out = append(out, filepath.ToSlash(rel))
		}
		return nil
	})
	sort.Strings(out)
	return out, err
}

var (
	idRe   = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	dateRe = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}(/\d{4}-\d{2}-\d{2})?$`)
)

// Env is what validation checks against.
type Env struct {
	Root    string
	Tabs    map[string]bool // src/tabs/* directories
	Targets map[string]bool // fog build targets
}

// Files expands the inputs into sorted dataset-relative paths. A glob
// that matches nothing, or a missing path, is reported in missing.
func (d *Dataset) Files(root string) (files []string, missing []Input, err error) {
	base := filepath.Join(root, filepath.FromSlash(d.Dir))
	seen := map[string]bool{}
	for _, in := range d.Inputs {
		switch {
		case in.Path != "":
			if _, err := os.Stat(filepath.Join(base, filepath.FromSlash(in.Path))); err != nil {
				missing = append(missing, in)
				continue
			}
			if !seen[in.Path] {
				seen[in.Path] = true
				files = append(files, in.Path)
			}
		case in.Glob != "":
			m, err := filepath.Glob(filepath.Join(base, filepath.FromSlash(in.Glob)))
			if err != nil {
				return nil, nil, fmt.Errorf("glob %q: %w", in.Glob, err)
			}
			if len(m) == 0 {
				missing = append(missing, in)
			}
			for _, p := range m {
				if fi, err := os.Stat(p); err != nil || fi.IsDir() {
					continue
				}
				r, _ := filepath.Rel(base, p)
				r = filepath.ToSlash(r)
				if strings.HasSuffix(r, ExplainExt) { // the metadata beside a file (fog build explain), never an input
					continue
				}
				if !seen[r] {
					seen[r] = true
					files = append(files, r)
				}
			}
		}
	}
	sort.Strings(files)
	return files, missing, nil
}

// Validate checks a manifest and its files. It never stops at the first
// problem: the report lists them all.
func (d *Dataset) Validate(env Env) []Problem {
	var ps []Problem
	add := func(sev Severity, field, f string, a ...any) {
		ps = append(ps, Problem{sev, field, fmt.Sprintf(f, a...)})
	}
	if d.SchemaVersion != SchemaVersion {
		add(Error, "schema_version", "is %d, fog reads version %d", d.SchemaVersion, SchemaVersion)
	}
	if !idRe.MatchString(d.ID) {
		add(Error, "id", "%q: lowercase letters, digits and single dashes", d.ID)
	}
	if strings.TrimSpace(d.Title) == "" {
		add(Error, "title", "missing")
	}
	if !env.Tabs[d.Tab] {
		add(Error, "tab", "%q is not a directory of src/tabs/ (or \"core\" for shared data)", d.Tab)
	}
	builds := strings.Fields(d.Build)
	if len(builds) == 0 {
		add(Error, "build", "missing: \"fog:<target>\" (several separated by spaces) or \"script:<path>\"")
	}
	for _, b := range builds {
		switch {
		case strings.HasPrefix(b, "fog:"):
			if t := strings.TrimPrefix(b, "fog:"); !env.Targets[t] {
				add(Error, "build", "no fog build target %q (see fog list)", t)
			}
		case strings.HasPrefix(b, "script:"):
			p := strings.TrimPrefix(b, "script:")
			if _, err := os.Stat(filepath.Join(env.Root, p)); err != nil {
				add(Error, "build", "script %s not found", p)
			} else {
				add(Warning, "build", "still built by %s (not ported to fog yet)", p)
			}
		default:
			add(Error, "build", "%q: must be \"fog:<target>\" or \"script:<path>\"", b)
		}
	}
	if _, ok := Kinds[d.Kind]; !ok {
		add(Error, "kind", "%q: one of %s", d.Kind, keys(Kinds))
	}
	if !Evidence[d.Evidence] {
		add(Error, "evidence", "%q: one of measure, check, model", d.Evidence)
	}
	switch d.Evidence {
	case "measure":
		if len(d.RadiusEntersVia) > 0 {
			add(Error, "radius_enters_via", "a measure dataset has no field touched by a globe model (rule 10); class it check")
		}
	case "check":
		if len(d.RadiusEntersVia) == 0 {
			add(Error, "radius_enters_via", "a check dataset must say where the radius enters (rule 10)")
		}
	}
	for i, e := range d.RadiusEntersVia {
		if strings.TrimSpace(e.Field) == "" || strings.TrimSpace(e.How) == "" {
			add(Error, fmt.Sprintf("radius_enters_via[%d]", i), "field and how are both required")
		}
	}
	if d.Evidence != "model" && strings.TrimSpace(d.VerdictRule) == "" {
		add(Error, "verdict_rule", "missing: what result would vindicate the flat model (rule 5)")
	}
	if !Licenses[d.License] {
		add(Error, "license", "%q: one of %s", d.License, keys(Licenses))
	}
	if d.License == "other" && strings.TrimSpace(d.LicenseNote) == "" {
		add(Error, "license_note", "required with license \"other\": the terms, and where they are")
	}
	if len(d.Sources) == 0 {
		add(Error, "sources", "at least one source")
	}
	for i, s := range d.Sources {
		f := fmt.Sprintf("sources[%d]", i)
		if strings.TrimSpace(s.Cite) == "" {
			add(Error, f+".cite", "missing")
		}
		if s.URL != "" && !httpURL(s.URL) {
			add(Error, f+".url", "%q is not an http(s) URL", s.URL)
		}
	}
	if !dateRe.MatchString(d.Collected) {
		add(Error, "collected", "%q: YYYY-MM-DD or YYYY-MM-DD/YYYY-MM-DD", d.Collected)
	}
	if len(d.Units) == 0 {
		add(Error, "units", "say the unit and convention of every quantity (e.g. \"t\": \"h after 0 h GMT\")")
	}
	if len(d.Inputs) == 0 {
		add(Error, "inputs", "at least one input file")
	}
	for i, in := range d.Inputs {
		f := fmt.Sprintf("inputs[%d]", i)
		if (in.Path == "") == (in.Glob == "") {
			add(Error, f, "exactly one of path and glob")
			continue
		}
		p := in.Path + in.Glob
		if !local(p) {
			add(Error, f, "%q must stay inside the dataset directory", p)
		}
		if in.URL != "" && (in.Glob != "" || !httpURL(in.URL)) {
			add(Error, f+".url", "an http(s) URL, on a single path only")
		}
	}
	for i, o := range d.Outputs {
		if !local(o) || !(strings.HasPrefix(o, "src/data/") || strings.HasPrefix(o, d.Dir+"/")) {
			add(Error, fmt.Sprintf("outputs[%d]", i), "%q: a path under src/data/ or under the dataset directory", o)
		}
		for _, in := range d.Inputs {
			if in.Path != "" && d.Dir+"/"+in.Path == o {
				add(Error, fmt.Sprintf("outputs[%d]", i), "%q is also an input", o)
			}
		}
	}
	if len(d.Outputs) == 0 {
		add(Error, "outputs", "at least one generated file")
	}
	switch d.PublicRaw {
	case "yes":
	case "no":
		if strings.TrimSpace(d.PublicRawWhy) == "" {
			add(Error, "public_raw_why", "required with public_raw \"no\": why only the hash and the URL are published")
		}
	default:
		add(Error, "public_raw", "%q: \"yes\" (the raw files go into the public repository) or \"no\" (only their hash and URL)", d.PublicRaw)
	}
	for i, in := range d.Inputs {
		f := fmt.Sprintf("inputs[%d]", i)
		if _, ok := Hows[in.How]; !ok {
			add(Error, f+".how", "%q: one of %s", in.How, keys(Hows))
		}
		if strings.TrimSpace(in.Origin) == "" {
			add(Error, f+".origin", "missing: where exactly the file comes from (URL, publication and pages)")
		}
		switch in.PublicRaw {
		case "", "yes":
		case "no":
			if strings.TrimSpace(in.PublicRawWhy) == "" {
				add(Error, f+".public_raw_why", "required with public_raw \"no\"")
			}
		default:
			add(Error, f+".public_raw", "%q: \"yes\" or \"no\"", in.PublicRaw)
		}
	}
	if len(d.Code) == 0 {
		add(Error, "code", "at least one file or directory of the code that turns the data into the page's numbers")
	}
	for i, c := range d.Code {
		if _, err := os.Stat(filepath.Join(env.Root, filepath.FromSlash(c))); err != nil || !local(c) {
			add(Error, fmt.Sprintf("code[%d]", i), "%q not found (a repo-relative path)", c)
		}
	}
	for i, sc := range d.Sections {
		if t, _, ok := strings.Cut(sc, "/"); !ok || !env.Tabs[t] {
			add(Error, fmt.Sprintf("sections[%d]", i), "%q: \"tab/section\" of an existing tab", sc)
		}
	}
	ps = append(ps, d.checkFiles(env.Root)...)
	return ps
}

// Public reports whether an input's raw files may go into the public repository, and why not.
func (d *Dataset) Public(in Input) (bool, string) {
	if in.PublicRaw != "" {
		return in.PublicRaw == "yes", in.PublicRawWhy
	}
	return d.PublicRaw == "yes", d.PublicRawWhy
}

// InputOf returns the input entry a dataset-relative file belongs to (first match).
func (d *Dataset) InputOf(f string) (Input, bool) {
	for _, in := range d.Inputs {
		if in.Path == f {
			return in, true
		}
		if in.Glob != "" {
			if ok, _ := path.Match(in.Glob, f); ok {
				return in, true
			}
		}
	}
	return Input{}, false
}

func (d *Dataset) checkFiles(root string) []Problem {
	var ps []Problem
	files, missing, err := d.Files(root)
	if err != nil {
		return []Problem{{Error, "inputs", err.Error()}}
	}
	for _, in := range missing {
		p := in.Path + in.Glob
		switch {
		case in.Ignored && in.URL != "":
			ps = append(ps, Problem{Warning, "inputs", p + ": not on disk (kept out of git); fog fetch " + d.ID})
		case in.Ignored:
			ps = append(ps, Problem{Warning, "inputs", p + ": not on disk (kept out of git)"})
		default:
			ps = append(ps, Problem{Error, "inputs", p + ": not found"})
		}
	}
	lock, err := ReadLock(root, d)
	if os.IsNotExist(err) {
		return append(ps, Problem{Error, LockName, "missing; write it with fog lock " + d.ID})
	}
	if err != nil {
		return append(ps, Problem{Error, LockName, err.Error()})
	}
	have, err := HashFiles(root, d, files)
	if err != nil {
		return append(ps, Problem{Error, "inputs", err.Error()})
	}
	for _, f := range files {
		want, ok := lock[f]
		switch {
		case !ok:
			ps = append(ps, Problem{Error, LockName, f + ": not in the lock (new file? fog lock " + d.ID + ")"})
		case want != have[f]:
			ps = append(ps, Problem{Error, LockName, f + ": sha256 differs from the lock (file changed)"})
		}
	}
	onDisk := map[string]bool{}
	for _, f := range files {
		onDisk[f] = true
	}
	ignored := d.ignoredPatterns()
	for f := range lock {
		if !onDisk[f] && !ignored(f) {
			ps = append(ps, Problem{Error, LockName, f + ": locked but gone"})
		}
	}
	return ps
}

// ignoredPatterns reports whether a locked file belongs to a gitignored
// input (absent in CI, not an error).
func (d *Dataset) ignoredPatterns() func(string) bool {
	return func(f string) bool {
		for _, in := range d.Inputs {
			if !in.Ignored {
				continue
			}
			if in.Path == f {
				return true
			}
			if in.Glob != "" {
				if ok, _ := path.Match(in.Glob, f); ok {
					return true
				}
			}
		}
		return false
	}
}

func local(p string) bool {
	if p == "" || path.IsAbs(p) || strings.Contains(p, "\\") {
		return false
	}
	c := path.Clean(p)
	return c != ".." && !strings.HasPrefix(c, "../")
}

func httpURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && (u.Scheme == "https" || u.Scheme == "http") && u.Host != ""
}

func keys[V any](m map[string]V) string {
	var k []string
	for x := range m {
		k = append(k, x)
	}
	sort.Strings(k)
	return strings.Join(k, ", ")
}

// Targets lists the fog targets named by Build.
func (d *Dataset) Targets() []string {
	var out []string
	for _, b := range strings.Fields(d.Build) {
		if strings.HasPrefix(b, "fog:") {
			out = append(out, strings.TrimPrefix(b, "fog:"))
		}
	}
	return out
}
