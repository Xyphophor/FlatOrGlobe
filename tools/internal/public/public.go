// Package public writes the tree of the public repository (2026-11-25, Xyphophor: a new public repository on GitHub,
// « le maître mot c'est la transparence »; raw files whose terms do not allow republishing are given by hash and URL
// only, with the reason). It never touches git or the network: it copies the tracked files of this repository into a
// directory, leaving out
//
//   - every raw file that a dataset.json marks public_raw "no" (its .explain, with the hash and the source, stays);
//   - every unpublished contribution (src/data/contrib/published.json): its data, page, photos, presets, Go package
//     and any line marked "// public:drop <key>" (or a block between "// public:drop <key> begin" and "… end");
//   - the paths of public.json "exclude" (the working notes);
//
// then strips the unpublished contributions from src/tabs/contrib/registry.js and published.json, and scans the
// result for the contributions' canaries (contribution.js) and for the private strings of public.json: any hit is
// reported, and the tree must not be published until it is fixed.
package public

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"flatorglobe/tools/internal/dataset"
)

// Config is public.json at the repository root.
type Config struct {
	About   string              `json:"about"`
	Exclude []string            `json:"exclude"`
	Contrib map[string][]string `json:"contrib"` // extra paths of each contribution (Go package, research scripts)
	Private []string            `json:"private"` // strings that must not appear anywhere in the tree
}

// Report is what Export did.
type Report struct {
	Kept, Excluded int
	Bytes          int64
	Why            map[string]int // reason → files left out
	Hits           []string       // canary or private string found: "file: string"
}

func globRe(g string) *regexp.Regexp {
	var b strings.Builder
	b.WriteString("^")
	for i := 0; i < len(g); i++ {
		switch c := g[i]; {
		case c == '*' && i+1 < len(g) && g[i+1] == '*':
			b.WriteString(".*")
			i++
		case c == '*':
			b.WriteString("[^/]*")
		case c == '?':
			b.WriteString("[^/]")
		default:
			b.WriteString(regexp.QuoteMeta(string(c)))
		}
	}
	b.WriteString("$")
	return regexp.MustCompile(b.String())
}

func match(globs []string, p string) bool {
	for _, g := range globs {
		if globRe(g).MatchString(p) {
			return true
		}
	}
	return false
}

var canaryRe = regexp.MustCompile(`canaries:\s*\[([^\]]*)\]`)

// Export copies the public tree of root into out (which must not exist).
func Export(root, out string) (*Report, error) {
	if _, err := os.Stat(out); err == nil {
		return nil, fmt.Errorf("%s exists: give a new directory", out)
	}
	var cfg Config
	b, err := os.ReadFile(filepath.Join(root, "public.json"))
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(b, &cfg); err != nil {
		return nil, fmt.Errorf("public.json: %w", err)
	}
	var pub map[string]bool
	pb, err := os.ReadFile(filepath.Join(root, "src/data/contrib/published.json"))
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(pb, &pub); err != nil {
		return nil, err
	}
	ls, err := exec.Command("git", "-C", root, "ls-files", "-z").Output()
	if err != nil {
		return nil, fmt.Errorf("git ls-files: %w", err)
	}
	var files []string
	for _, f := range strings.Split(string(ls), "\x00") {
		if f != "" {
			files = append(files, f)
		}
	}
	// what each unpublished contribution owns, and the strings that betray it
	drop := map[string][]string{}
	var canaries []string
	var hidden []string
	for k, ok := range pub {
		if ok {
			continue
		}
		hidden = append(hidden, k)
		drop[k] = append([]string{"data/contrib/" + k + "/**", "src/tabs/contrib/" + k + "/**", "src/data/presets/contrib-" + k + ".js*",
			"public/photos/contrib-" + k + "-*"}, cfg.Contrib[k]...)
		if c, err := os.ReadFile(filepath.Join(root, "src/tabs/contrib", k, "contribution.js")); err == nil {
			if m := canaryRe.FindSubmatch(c); m != nil {
				for _, q := range regexp.MustCompile(`"([^"]+)"`).FindAllSubmatch(m[1], -1) {
					canaries = append(canaries, string(q[1]))
				}
			}
		}
	}
	sort.Strings(hidden)
	// raw files that may not be republished
	notPublic := map[string]string{}
	paths, err := dataset.Discover(root)
	if err != nil {
		return nil, err
	}
	for _, p := range paths {
		d, err := dataset.Load(root, p)
		if err != nil {
			return nil, err
		}
		lock, err := dataset.ReadLock(root, d)
		if err != nil {
			return nil, err
		}
		for f := range lock {
			in, _ := d.InputOf(f)
			if ok, _ := d.Public(in); !ok {
				notPublic[d.Dir+"/"+f] = d.ID
			}
		}
	}
	r := &Report{Why: map[string]int{}}
	for _, f := range files {
		why := ""
		switch {
		case notPublic[f] != "":
			why = "raw file not republishable (hash and source in its .explain)"
		case match(cfg.Exclude, f):
			why = "public.json exclude"
		default:
			for _, k := range hidden {
				if match(drop[k], f) {
					why = "unpublished contribution"
				}
			}
		}
		if why != "" {
			r.Excluded++
			r.Why[why]++
			continue
		}
		if err := copyOne(root, out, f, hidden); err != nil {
			return nil, err
		}
		r.Kept++
	}
	// scan
	needles := append(append([]string{}, canaries...), cfg.Private...)
	err = filepath.Walk(out, func(p string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || fi.Mode()&os.ModeSymlink != 0 {
			return err
		}
		r.Bytes += fi.Size()
		c, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(out, p)
		for _, n := range needles {
			if n != "" && bytes.Contains(c, []byte(n)) {
				r.Hits = append(r.Hits, rel+": "+n)
			}
		}
		return nil
	})
	sort.Strings(r.Hits)
	return r, err
}

var dropLine = regexp.MustCompile(`(?://|<!--)\s*public:drop\s+([a-z0-9-]+)(\s+(begin|end))?\s*(?:-->)?\s*$`)
var contribLine = regexp.MustCompile(`//\s*contrib:([a-z0-9-]+)\s*$`)

// copyOne copies a file, stripping what belongs to the hidden contributions.
func copyOne(root, out, f string, hidden []string) error {
	src, dst := filepath.Join(root, f), filepath.Join(out, f)
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	fi, err := os.Lstat(src)
	if err != nil {
		if os.IsNotExist(err) { // tracked but deleted in the working tree
			return nil
		}
		return err
	}
	if fi.Mode()&os.ModeSymlink != 0 {
		t, err := os.Readlink(src)
		if err != nil {
			return err
		}
		return os.Symlink(t, dst)
	}
	isHidden := func(k string) bool {
		for _, h := range hidden {
			if h == k {
				return true
			}
		}
		return false
	}
	if f == "src/data/contrib/published.json" {
		var m map[string]bool
		b, _ := os.ReadFile(src)
		if err := json.Unmarshal(b, &m); err != nil {
			return err
		}
		for _, h := range hidden {
			delete(m, h)
		}
		o, _ := json.MarshalIndent(m, "", "  ")
		return os.WriteFile(dst, append(o, '\n'), 0o644)
	}
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	if strings.HasSuffix(f, ".js") || strings.HasSuffix(f, ".go") || strings.HasSuffix(f, ".mjs") || strings.HasSuffix(f, ".md") || f == "Makefile" {
		b, err := io.ReadAll(in)
		if err != nil {
			return err
		}
		var keep []string
		skipping := ""
		for _, line := range strings.Split(string(b), "\n") {
			if m := dropLine.FindStringSubmatch(line); m != nil && isHidden(m[1]) {
				switch m[3] {
				case "begin":
					skipping = m[1]
				case "end":
					skipping = ""
				}
				continue
			}
			if m := contribLine.FindStringSubmatch(line); m != nil && isHidden(m[1]) {
				continue
			}
			if skipping == "" {
				keep = append(keep, line)
			}
		}
		return os.WriteFile(dst, []byte(strings.Join(keep, "\n")), fi.Mode().Perm())
	}
	o, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, fi.Mode().Perm())
	if err != nil {
		return err
	}
	defer o.Close()
	_, err = io.Copy(o, in)
	return err
}

// Into writes the public tree into an existing clone of the public repository: files that the tree no longer has are
// removed (never .git), the others replaced. The tree is first written to a temporary directory (os.MkdirTemp), which is
// removed afterwards. It returns the report and the number of files removed from the clone.
func Into(root, clone string) (*Report, int, error) {
	if fi, err := os.Stat(filepath.Join(clone, ".git")); err != nil || !fi.IsDir() {
		return nil, 0, fmt.Errorf("%s is not a git clone", clone)
	}
	tmp, err := os.MkdirTemp("", "fog-public-")
	if err != nil {
		return nil, 0, err
	}
	defer os.RemoveAll(tmp)
	tree := filepath.Join(tmp, "tree")
	r, err := Export(root, tree)
	if err != nil || len(r.Hits) > 0 {
		return r, 0, err
	}
	removed := 0
	err = filepath.Walk(clone, func(p string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(clone, p)
		if rel == ".git" {
			return filepath.SkipDir
		}
		if fi.IsDir() {
			return nil
		}
		if _, err := os.Lstat(filepath.Join(tree, rel)); os.IsNotExist(err) {
			removed++
			return os.Remove(p)
		}
		return nil
	})
	if err != nil {
		return r, removed, err
	}
	err = filepath.Walk(tree, func(p string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return err
		}
		rel, _ := filepath.Rel(tree, p)
		dst := filepath.Join(clone, rel)
		if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
			return err
		}
		os.Remove(dst)
		if fi.Mode()&os.ModeSymlink != 0 {
			t, err := os.Readlink(p)
			if err != nil {
				return err
			}
			return os.Symlink(t, dst)
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(dst, b, fi.Mode().Perm())
	})
	return r, removed, err
}
