package audit

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// bracedBody: the text between the first openCh after start and its
// balanced closing.
func bracedBody(text string, start int, open, close byte) (string, error) {
	i := strings.IndexByte(text[start:], open)
	if i < 0 {
		return "", fmt.Errorf("no %c after %d", open, start)
	}
	i += start
	depth := 0
	for j := i; j < len(text); j++ {
		switch text[j] {
		case open:
			depth++
		case close:
			depth--
			if depth == 0 {
				return text[i+1 : j], nil
			}
		}
	}
	return "", fmt.Errorf("unbalanced %c%c from index %d", open, close, start)
}

var (
	wordColon  = regexp.MustCompile(`(\w+):`)
	wordQuoted = regexp.MustCompile(`"(\w+)"`)
	caseRe     = regexp.MustCompile(`case\s+"(\w+)"\s*:`)
	commandRe  = regexp.MustCompile(`\\+([A-Za-z]+)`)
	jsUnicode  = regexp.MustCompile(`\\u[0-9a-fA-F]{4}`)
	dataTex    = regexp.MustCompile(`data-tex=\\*["']([^"']*)`)
	texField   = regexp.MustCompile(`\btex:\s*\\*["']([^"']*)`)
)

// knownCommands: SYM, OP, TIGHT, FUNC, the word keys of SPACE and the
// `case "x":` of the inner switch, read from the engine at each run.
func knownCommands(engine string) (map[string]bool, error) {
	known := map[string]bool{}
	add := func(re *regexp.Regexp, body string) {
		for _, m := range re.FindAllStringSubmatch(body, -1) {
			known[m[1]] = true
		}
	}
	for _, c := range []struct {
		decl        string
		open, close byte
		re          *regexp.Regexp
	}{
		{"const SYM = {", '{', '}', wordColon}, {"const OP = {", '{', '}', wordColon}, {"const TIGHT = {", '{', '}', wordColon},
		{"const FUNC = [", '[', ']', wordQuoted}, {"const SPACE = {", '{', '}', wordColon}, {"switch (n) {", '{', '}', caseRe},
	} {
		i := strings.Index(engine, c.decl)
		if i < 0 {
			return nil, fmt.Errorf("tex-mathml.js: %q not found", c.decl)
		}
		body, err := bracedBody(engine, i+len(c.decl)-1, c.open, c.close)
		if err != nil {
			return nil, err
		}
		add(c.re, body)
	}
	return known, nil
}

func commandsIn(tex string) []string {
	tex = jsUnicode.ReplaceAllString(tex, "")
	var out []string
	for _, m := range commandRe.FindAllStringSubmatch(tex, -1) {
		out = append(out, m[1])
	}
	return out
}

func first60(s string) string {
	r := []rune(s)
	return string(r[:min(60, len(r))])
}

func texInJSON(v any, out *[]string) {
	switch x := v.(type) {
	case string:
		for _, m := range dataTex.FindAllStringSubmatch(x, -1) {
			*out = append(*out, m[1])
		}
	case map[string]any:
		for _, e := range x {
			texInJSON(e, out)
		}
	case []any:
		for _, e := range x {
			texInJSON(e, out)
		}
	}
}

// Tex is audit_tex.py: every \command in the project must be one the
// engine (src/core/tex-mathml.js) supports.
func Tex(root string, w io.Writer) (int, error) {
	engine, err := read(filepath.Join(root, "src/core/tex-mathml.js"))
	if err != nil {
		return 1, err
	}
	known, err := knownCommands(engine)
	if err != nil {
		return 1, err
	}
	unknown := map[string]map[[2]string]bool{}
	total := 0
	note := func(file, tex string) {
		total++
		for _, c := range commandsIn(tex) {
			if !known[c] {
				if unknown[c] == nil {
					unknown[c] = map[[2]string]bool{}
				}
				unknown[c][[2]string{file, first60(tex)}] = true
			}
		}
	}
	var jsFiles, jsonFiles []string
	filepath.WalkDir(filepath.Join(root, "src"), func(p string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() && strings.HasSuffix(p, ".js") && !strings.HasSuffix(p, ".test.js") {
			jsFiles = append(jsFiles, p)
		}
		return nil
	})
	filepath.WalkDir(filepath.Join(root, "src/i18n"), func(p string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() && strings.HasSuffix(p, ".json") {
			jsonFiles = append(jsonFiles, p)
		}
		return nil
	})
	sort.Strings(jsFiles)
	sort.Strings(jsonFiles)
	rel := func(p string) string { r, _ := filepath.Rel(root, p); return r }
	for _, f := range jsFiles {
		text, _ := read(f)
		for _, m := range dataTex.FindAllStringSubmatch(text, -1) {
			note(rel(f), m[1])
		}
		for _, m := range texField.FindAllStringSubmatch(text, -1) {
			note(rel(f), m[1])
		}
	}
	for _, f := range jsonFiles {
		b, _ := os.ReadFile(f)
		var v any
		if err := json.Unmarshal(b, &v); err != nil {
			fmt.Fprintf(w, "%s: JSON invalide -- %v\n", rel(f), err)
			return 1, nil
		}
		var found []string
		texInJSON(v, &found)
		for _, t := range found {
			note(rel(f), t)
		}
	}
	fmt.Fprintf(w, "%d commande(s) connue(s) (extraites de src/core/tex-mathml.js), %d chaîne(s) TeX passées en revue.\n", len(known), total)
	if len(unknown) > 0 {
		fmt.Fprintf(w, "\n%d commande(s) inconnue(s) :\n", len(unknown))
		var cmds []string
		for c := range unknown {
			cmds = append(cmds, c)
		}
		sort.Strings(cmds)
		for _, c := range cmds {
			fmt.Fprintf(w, "  \\%s :\n", c)
			var sites [][2]string
			for s := range unknown[c] {
				sites = append(sites, s)
			}
			sort.Slice(sites, func(i, j int) bool {
				if sites[i][0] != sites[j][0] {
					return sites[i][0] < sites[j][0]
				}
				return sites[i][1] < sites[j][1]
			})
			for _, s := range sites {
				fmt.Fprintf(w, "    - %s : \"%s...\"\n", s[0], s[1])
			}
		}
		return 1, nil
	}
	fmt.Fprintln(w, "audit_tex: OK -- aucune commande TeX inconnue.")
	return 0, nil
}
