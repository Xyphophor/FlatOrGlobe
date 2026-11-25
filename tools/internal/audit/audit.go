// Package audit holds the static audits of the site's sources (no JS is
// executed), ported from scripts/audit_structure.py, audit_tex.py and
// audit_prose_fidelity.py (epic07, epic04; epic24/UC06). Reports are the
// Python ones, line for line; each audit returns 0 when clean, 1 otherwise.
package audit

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

func read(p string) (string, error) {
	b, err := os.ReadFile(p)
	return string(b), err
}

func exists(p string) bool { _, err := os.Stat(p); return err == nil }

// dirs lists the sub-directories of d, sorted.
func dirs(d string) []string {
	es, _ := os.ReadDir(d)
	var out []string
	for _, e := range es {
		if e.IsDir() {
			out = append(out, e.Name())
		}
	}
	sort.Strings(out)
	return out
}

func glob(pattern string) []string {
	m, _ := filepath.Glob(pattern)
	sort.Strings(m)
	return m
}

// ---- structure (audit_structure.py) -----------------------------------------------

// AssumedIncompleteLangs: languages whose JS-string incompleteness is a known state.
var AssumedIncompleteLangs = map[string]bool{"fr": true, "de": true, "it": true, "es": true, "pt": true, "nl": true}

// TabsNeverCitedInlineInLegacy: tabs whose legacy panel cites no source inline (checked in the legacy).
var TabsNeverCitedInlineInLegacy = map[string]bool{"mag": true}

var (
	sourcesStart = regexp.MustCompile(`export\s+const\s+SOURCES\s*=\s*\[`)
	idField      = regexp.MustCompile(`\bid:\s*"([^"]+)"`)
	citeLit      = regexp.MustCompile(`cite\(\s*KEY\s*,\s*"([^"]+)"\s*\)`)
	citeVar      = regexp.MustCompile(`cite\(\s*KEY\s*,\s*\w+\s*\)`)
	sourceIds    = regexp.MustCompile(`sourceIds:\s*\[([^\]]*)\]`)
	quoted       = regexp.MustCompile(`"([^"]+)"`)
	otherAnchor  = regexp.MustCompile(`#s-([a-z0-9]+)-n\d+`)
	proseRe      = regexp.MustCompile(`(?s)export\s+const\s+PROSE\s*=\s*(\[.*\])\s*;?\s*$`)
)

func sourceIDs(js string) []string {
	loc := sourcesStart.FindStringIndex(js)
	if loc == nil {
		return nil
	}
	depth, i := 0, loc[1]-1
	for ; i < len(js); i++ {
		if js[i] == '[' {
			depth++
		} else if js[i] == ']' {
			depth--
			if depth == 0 {
				break
			}
		}
	}
	body := js[loc[1]-1 : min(i+1, len(js))]
	var out []string
	for _, m := range idField.FindAllStringSubmatch(body, -1) {
		out = append(out, m[1])
	}
	return out
}

func sourceIdsListed(text string) []string {
	var parts []string
	for _, m := range sourceIds.FindAllStringSubmatch(text, -1) {
		parts = append(parts, m[1])
	}
	var out []string
	for _, m := range quoted.FindAllStringSubmatch(strings.Join(parts, "\n"), -1) {
		out = append(out, m[1])
	}
	return out
}

func auditSourcesAndAnchors(root string) []string {
	var issues []string
	tabsDir := filepath.Join(root, "src/tabs")
	for _, tab := range dirs(tabsDir) {
		if strings.HasPrefix(tab, "_") {
			continue
		}
		var ids []string
		if s, err := read(filepath.Join(root, "src/data/sources", tab+".js")); err == nil {
			ids = sourceIDs(s)
		}
		n := len(ids)
		pos := map[string]int{}
		for i, id := range ids {
			pos[id] = i + 1 // a dict comprehension: the last duplicate wins
		}
		cited := map[int]bool{}
		for _, f := range glob(filepath.Join(tabsDir, tab, "*.js")) {
			if strings.HasSuffix(f, ".test.js") {
				continue
			}
			text, _ := read(f)
			for _, m := range citeLit.FindAllStringSubmatch(text, -1) {
				if p, ok := pos[m[1]]; ok {
					cited[p] = true
				} else {
					issues = append(issues, fmt.Sprintf(`%s: cite(KEY, "%s") -- id absent de src/data/sources/%s.js`, tab, m[1], tab))
				}
			}
			if citeVar.MatchString(text) {
				for _, id := range sourceIdsListed(text) {
					if p, ok := pos[id]; ok {
						cited[p] = true
					}
				}
			}
		}
		if text, err := read(filepath.Join(root, "src/data/presets", tab+".js")); err == nil {
			for _, id := range sourceIdsListed(text) {
				if p, ok := pos[id]; ok {
					cited[p] = true
				}
			}
		}
		anchor := regexp.MustCompile(`#s-` + regexp.QuoteMeta(tab) + `-n(\d+)\b`)
		for _, af := range []string{filepath.Join(root, "src/data/prose", tab+".js"), filepath.Join(root, "src/i18n/en", tab+".json")} {
			text, err := read(af)
			if err != nil {
				continue
			}
			for _, m := range anchor.FindAllStringSubmatch(text, -1) {
				p, _ := strconv.Atoi(m[1])
				if 1 <= p && p <= n {
					cited[p] = true
				} else {
					issues = append(issues, fmt.Sprintf("%s: ancre #s-%s-n%d dans %s -- hors de la liste des sources (%d entrée(s))", tab, tab, p, filepath.Base(af), n))
				}
			}
			for _, m := range otherAnchor.FindAllStringSubmatch(text, -1) {
				if m[1] != tab {
					issues = append(issues, fmt.Sprintf(`%s: ancre pointant vers l'onglet "%s" dans %s -- numérotation censée être locale à l'onglet`, tab, m[1], filepath.Base(af)))
				}
			}
		}
		if TabsNeverCitedInlineInLegacy[tab] {
			continue
		}
		for i, id := range ids {
			if !cited[i+1] {
				issues = append(issues, fmt.Sprintf(`%s: source "%s" (position %d) déclarée mais jamais citée -- source orpheline`, tab, id, i+1))
			}
		}
	}
	return issues
}

// keyed block types the prose renderer looks up in a dictionary
var proseKeyedStructure = map[string]bool{"eyebrow": true, "h1": true, "h2": true, "lead": true, "notes": true,
	"notes-block": true, "callout": true, "fcap": true, "raw": true}

type block = map[string]any

// proseBlocks returns the keyed blocks of export const PROSE = [...], in
// order (a later duplicate key replaces the block, keeping its place).
func proseBlocks(js string, types map[string]bool) ([]string, map[string]block) {
	m := proseRe.FindStringSubmatch(js)
	if m == nil {
		return nil, nil
	}
	var blocks []any
	if err := json.Unmarshal([]byte(m[1]), &blocks); err != nil {
		return nil, nil
	}
	var order []string
	out := map[string]block{}
	var walk func([]any)
	walk = func(bl []any) {
		for _, x := range bl {
			b, ok := x.(map[string]any)
			if !ok {
				continue
			}
			t, _ := b["t"].(string)
			if t == "section" {
				sub, _ := b["blocks"].([]any)
				walk(sub)
				continue
			}
			k, hasK := b["k"]
			ks, isStr := k.(string)
			if types[t] && hasK && isStr {
				if _, seen := out[ks]; !seen {
					order = append(order, ks)
				}
				out[ks] = b
			}
		}
	}
	walk(blocks)
	return order, out
}

func jsonKeys(p string) (map[string]bool, error) {
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	var m map[string]json.RawMessage
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, fmt.Errorf("%s: %w", p, err)
	}
	out := map[string]bool{}
	for k := range m {
		out[k] = true
	}
	return out, nil
}

func missingKeys(ref, have map[string]bool) []string {
	var out []string
	for k := range ref {
		if !have[k] {
			out = append(out, k)
		}
	}
	sort.Strings(out)
	return out
}

type langSummary map[string]map[string]int

func (s langSummary) add(lang, tab string, n int) {
	if s[lang] == nil {
		s[lang] = map[string]int{}
	}
	s[lang][tab] = n
}

func (s langSummary) print(w io.Writer, unit string) {
	var langs []string
	for l := range s {
		langs = append(langs, l)
	}
	sort.Strings(langs)
	for _, l := range langs {
		total := 0
		for _, n := range s[l] {
			total += n
		}
		fmt.Fprintf(w, "  %s: %d clé(s) sur %d %s touché(s)\n", l, total, len(s[l]), unit)
	}
}

// Structure is audit_structure.py.
func Structure(root string, w io.Writer) (int, error) {
	issues := auditSourcesAndAnchors(root)
	i18n := filepath.Join(root, "src/i18n")
	sumI18n, sumProse := langSummary{}, langSummary{}
	for _, enFile := range glob(filepath.Join(i18n, "en", "*.json")) {
		tab := strings.TrimSuffix(filepath.Base(enFile), ".json")
		enKeys, err := jsonKeys(enFile)
		if err != nil {
			return 1, err
		}
		for _, lang := range dirs(i18n) {
			if lang == "en" {
				continue
			}
			have := map[string]bool{}
			lf := filepath.Join(i18n, lang, tab+".json")
			if exists(lf) {
				if have, err = jsonKeys(lf); err != nil {
					return 1, err
				}
			}
			if miss := missingKeys(enKeys, have); len(miss) > 0 {
				sumI18n.add(lang, tab, len(miss))
				if !AssumedIncompleteLangs[lang] {
					issues = append(issues, fmt.Sprintf("i18n %s/%s.json : %d clé(s) manquante(s) -- langue non listée comme incomplète assumée (ASSUMED_INCOMPLETE_LANGS)", lang, tab, len(miss)))
				}
			}
		}
	}
	for _, pf := range glob(filepath.Join(root, "src/data/prose", "*.js")) {
		tab := strings.TrimSuffix(filepath.Base(pf), ".js")
		text, _ := read(pf)
		order, _ := proseBlocks(text, proseKeyedStructure)
		if len(order) == 0 {
			continue
		}
		ref := map[string]bool{}
		for _, k := range order {
			ref[k] = true
		}
		for _, lang := range dirs(i18n) {
			if lang == "en" {
				continue
			}
			have := map[string]bool{}
			lf := filepath.Join(i18n, lang, tab+"-prose.json")
			if exists(lf) {
				var err error
				if have, err = jsonKeys(lf); err != nil {
					return 1, err
				}
			}
			if miss := missingKeys(ref, have); len(miss) > 0 {
				sumProse.add(lang, tab, len(miss))
				issues = append(issues, fmt.Sprintf("prose-i18n %s/%s-prose.json : %d clé(s) manquante(s) sur %d (%s)", lang, tab, len(miss), len(ref), strings.Join(miss, ", ")))
			}
		}
	}
	if len(sumI18n) > 0 {
		fmt.Fprintln(w, `i18n -- clés manquantes par langue (incomplétude connue, voir CLAUDE.md "i18n state") :`)
		sumI18n.print(w, "fichier(s)")
		fmt.Fprintln(w)
	}
	if len(sumProse) > 0 {
		fmt.Fprintln(w, "prose-i18n -- clés manquantes par langue (epic04/UC02, régression si non nul) :")
		sumProse.print(w, "onglet(s)")
		fmt.Fprintln(w)
	}
	if len(issues) > 0 {
		fmt.Fprintf(w, "%d problème(s) :\n", len(issues))
		for _, m := range issues {
			fmt.Fprintf(w, "  - %s\n", m)
		}
		return 1, nil
	}
	fmt.Fprintln(w, `audit_structure: OK -- aucune source orpheline, aucune ancre cassée, aucune langue "complète" en défaut.`)
	return 0, nil
}
