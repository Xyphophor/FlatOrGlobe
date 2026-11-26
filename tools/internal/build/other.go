package build

// The files that fog does not compile from a dataset (2026-11-27, Xyphophor: « certaines data dans preset n'ont pas de
// fichier explain… c'est souvent mes photos avec Caussols et le balcon ; il faut prévoir d'en mettre aussi ») : presets
// typed by hand or ported from the legacy page, computed once by a script of research/ or scripts/, photographs, maps,
// portraits. data/other.json describes them (how, made by, from, inputs, licence, caveats); fog build explain writes a
// .explain beside each, with the file's own header comment and the list of the site's files that name it. A file of the
// watched places (Watched) that neither a dataset's outputs nor data/other.json describes makes the target fail.

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"flatorglobe/tools/internal/dataset"
	"flatorglobe/tools/internal/preset"
)

// OtherName is the manifest of the files compiled from no dataset.
const OtherName = "data/other.json"

// Watched are the places whose every file must be described (a dataset's output or data/other.json).
var Watched = []string{"src/data/presets/*.js", "src/data/dem/*", "src/data/orbits/*", "src/data/coasts.js", "src/data/star-catalog.js",
	"public/photos/*", "public/maps/**", "public/portraits/*", "data/elev/*"}

type otherFile struct {
	Path    string   `json:"path"`
	Title   string   `json:"title"`
	How     string   `json:"how"`
	MadeBy  string   `json:"made_by"`
	Origin  string   `json:"origin"`
	License string   `json:"license"`
	Inputs  []string `json:"inputs"`
	Caveats string   `json:"caveats"`
	Notes   string   `json:"notes"`
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
		default:
			b.WriteString(regexp.QuoteMeta(string(c)))
		}
	}
	b.WriteString("$")
	return regexp.MustCompile(b.String())
}

// listFiles is every regular file under root's dirs (relative, slash-separated), .explain left out.
func listFiles(root string, dirs ...string) []string {
	var out []string
	for _, d := range dirs {
		filepath.Walk(filepath.Join(root, d), func(p string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() || strings.HasSuffix(p, ExplainExt) {
				return nil
			}
			rel, _ := filepath.Rel(root, p)
			out = append(out, filepath.ToSlash(rel))
			return nil
		})
	}
	sort.Strings(out)
	return out
}

// headerComment is the leading comment of a JS file (// lines, or a /* … */ block), as text.
func headerComment(b []byte) string {
	var out []string
	inBlock := false
	for _, l := range strings.Split(string(b), "\n") {
		t := strings.TrimSpace(l)
		switch {
		case inBlock:
			if i := strings.Index(t, "*/"); i >= 0 {
				out = append(out, strings.TrimPrefix(strings.TrimSpace(t[:i]), "*"))
				inBlock = false
				continue
			}
			out = append(out, strings.TrimSpace(strings.TrimPrefix(t, "*")))
		case strings.HasPrefix(t, "//"):
			if strings.HasPrefix(t, "// input ") || strings.HasPrefix(t, "// GENERATED") {
				continue
			}
			out = append(out, strings.TrimSpace(strings.TrimPrefix(t, "//")))
		case strings.HasPrefix(t, "/*"):
			r := strings.TrimPrefix(strings.TrimPrefix(t, "/**"), "/*")
			if i := strings.Index(r, "*/"); i >= 0 {
				out = append(out, strings.TrimSpace(r[:i]))
				continue
			}
			out = append(out, strings.TrimSpace(r))
			inBlock = true
		case t == "" && len(out) == 0:
		default:
			return strings.TrimSpace(strings.Join(out, "\n"))
		}
	}
	return strings.TrimSpace(strings.Join(out, "\n"))
}

func explainOther(o otherFile, f, sum, header string, usedBy []string) string {
	var b strings.Builder
	b.WriteString("# " + path.Base(f) + "\n\n")
	field(&b, "What it is", o.Title)
	field(&b, "File", f)
	field(&b, "SHA-256", sum)
	field(&b, "Obtained", dataset.Hows[o.How]+".")
	field(&b, "Made by", o.MadeBy)
	field(&b, "From", o.Origin)
	list(&b, "Inputs", o.Inputs)
	field(&b, "Licence", o.License)
	field(&b, "What could still be wrong", o.Caveats)
	field(&b, "Notes", o.Notes)
	list(&b, "Used by", usedBy)
	if header != "" {
		b.WriteString("\nWhat the file says about itself:\n")
		for _, l := range strings.Split(header, "\n") {
			b.WriteString("  " + l + "\n")
		}
	}
	b.WriteString("\nWritten by `fog build explain` from " + OtherName + ": edit that, not this file.\n")
	return b.String()
}

// otherExplains writes the .explain of data/other.json's files and checks that every watched file is described.
func otherExplains(root string, described map[string]bool) ([]preset.File, int, error) {
	raw, err := os.ReadFile(filepath.Join(root, OtherName))
	if err != nil {
		return nil, 0, err
	}
	var man struct {
		About string      `json:"about"`
		Files []otherFile `json:"files"`
	}
	if err := json.Unmarshal(raw, &man); err != nil {
		return nil, 0, fmt.Errorf("%s: %w", OtherName, err)
	}
	all := listFiles(root, "src", "public", "data/elev")
	srcJS := []string{}
	for _, f := range all {
		if strings.HasPrefix(f, "src/") && strings.HasSuffix(f, ".js") {
			srcJS = append(srcJS, f)
		}
	}
	texts := map[string]string{}
	for _, f := range srcJS {
		b, _ := os.ReadFile(filepath.Join(root, f))
		texts[f] = string(b)
	}
	var files []preset.File
	n := 0
	for i, o := range man.Files {
		if _, ok := dataset.Hows[o.How]; !ok {
			return nil, 0, fmt.Errorf("%s files[%d] %s: how %q", OtherName, i, o.Path, o.How)
		}
		re := globRe(o.Path)
		matched := 0
		for _, f := range all {
			if !re.MatchString(f) {
				continue
			}
			matched++
			described[f] = true
			b, err := os.ReadFile(filepath.Join(root, f))
			if err != nil {
				return nil, 0, err
			}
			header := ""
			if strings.HasSuffix(f, ".js") {
				header = headerComment(b)
			}
			var usedBy []string
			base := path.Base(f)
			for _, s := range srcJS {
				if s != f && strings.Contains(texts[s], base) {
					usedBy = append(usedBy, s)
				}
			}
			files = append(files, preset.File{Out: f + ExplainExt, NoHeader: true, Body: explainOther(o, f, preset.SHA(b), header, usedBy)})
			n++
		}
		if matched == 0 {
			return nil, 0, fmt.Errorf("%s files[%d]: %s matches no file", OtherName, i, o.Path)
		}
	}
	// an unpublished contribution's photos are described by its own dataset.json, and nothing of it may appear here
	pub, err := published(root)
	if err != nil {
		return nil, 0, err
	}
	hidden := func(f string) bool {
		for k, ok := range pub {
			if !ok && strings.HasPrefix(f, "public/photos/contrib-"+k+"-") {
				return true
			}
		}
		return false
	}
	var missing []string
	for _, w := range Watched {
		re := globRe(w)
		for _, f := range all {
			if re.MatchString(f) && !described[f] && !hidden(f) {
				missing = append(missing, f)
			}
		}
	}
	if len(missing) > 0 {
		return nil, 0, fmt.Errorf("described neither by a dataset's outputs nor by %s:\n  %s", OtherName, strings.Join(missing, "\n  "))
	}
	return files, n, nil
}
