package audit

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var proseKeyedFidelity = map[string]bool{"eyebrow": true, "h1": true, "h2": true, "lead": true, "notes": true,
	"notes-block": true, "callout": true, "fcap": true}

// KnownFalsePositives were checked by hand (2026-09-17): century names
// ("the 1800s" -> "XIXe siècle"), French time notation, and the like.
var KnownFalsePositives = map[[3]string]bool{
	{"fr", "dist", "bec68fcf"}: true, {"nl", "dist", "bec68fcf"}: true,
	{"es", "mag", "mg-x1"}: true, {"nl", "mag", "mg-x1"}: true, {"pt", "mag", "mg-x1"}: true,
	{"es", "elev", "sim-n2"}: true, {"nl", "elev", "sim-n2"}: true, {"pt", "elev", "sim-n2"}: true,
	{"fr", "ecl", "ecl-p9"}: true, {"es", "ecl", "ecl-p9"}: true, {"pt", "ecl", "ecl-p9"}: true, {"nl", "ecl", "ecl-p9"}: true,
	{"pt", "hh", "hh-flatten-cap"}: true,
	{"es", "surv", "2e7c8282"}:     true, {"nl", "surv", "2e7c8282"}: true, {"pt", "surv", "2e7c8282"}: true,
}

// pySpace is Python's \s (str.isspace) as a regexp class body.
const pySpace = `\t\n\v\f\r\x{1c}-\x{1f} \x{85}\x{a0}\x{1680}\x{2000}-\x{200a}\x{2028}\x{2029}\x{202f}\x{205f}\x{3000}`

var (
	tagRe    = regexp.MustCompile(`<(/?[a-zA-Z][a-zA-Z0-9]*)\b`)
	anyTagRe = regexp.MustCompile(`<[^>]*>`)
	// significant numbers: runs of >= 2 digits once thousands/decimal separators are removed
	numRe = regexp.MustCompile(`\p{Nd}[\p{Nd}.,` + pySpace + `]*\p{Nd}|\p{Nd}`)
	sepRe = regexp.MustCompile(`[.,` + pySpace + `]`)
)

// counter keeps first-seen order, as Python's Counter.
type counter struct {
	keys []string
	n    map[string]int
}

func newCounter() *counter { return &counter{n: map[string]int{}} }

func (c *counter) add(k string) {
	if _, ok := c.n[k]; !ok {
		c.keys = append(c.keys, k)
	}
	c.n[k]++
}

func (c *counter) equal(o *counter) bool {
	if len(c.n) != len(o.n) {
		return false
	}
	for k, v := range c.n {
		if o.n[k] != v {
			return false
		}
	}
	return true
}

// repr is Python's repr(dict(counter)).
func (c *counter) repr() string {
	var p []string
	for _, k := range c.keys {
		p = append(p, fmt.Sprintf("'%s': %d", k, c.n[k]))
	}
	return "{" + strings.Join(p, ", ") + "}"
}

// minus is sorted((a - b).elements()) as Python's list repr.
func (c *counter) minus(o *counter) []string {
	var out []string
	for k, v := range c.n {
		for i := 0; i < v-o.n[k]; i++ {
			out = append(out, k)
		}
	}
	sort.Strings(out)
	return out
}

func listRepr(xs []string) string {
	q := make([]string, len(xs))
	for i, x := range xs {
		q[i] = "'" + x + "'"
	}
	return "[" + strings.Join(q, ", ") + "]"
}

func tags(html string) *counter {
	c := newCounter()
	for _, m := range tagRe.FindAllStringSubmatch(html, -1) {
		c.add(strings.ToLower(m[1]))
	}
	return c
}

func nums(html string) *counter {
	c := newCounter()
	text := anyTagRe.ReplaceAllString(html, " ")
	for _, raw := range numRe.FindAllString(text, -1) {
		if d := sepRe.ReplaceAllString(raw, ""); len([]rune(d)) >= 2 {
			c.add(d)
		}
	}
	return c
}

func strs(v any) ([]string, bool) {
	switch x := v.(type) {
	case string:
		return []string{x}, true
	case []any:
		out := make([]string, len(x))
		for i, e := range x {
			s, ok := e.(string)
			if !ok {
				return nil, false
			}
			out[i] = s
		}
		return out, true
	}
	return nil, false
}

// Fidelity is audit_prose_fidelity.py: in every translated prose block,
// the same multiset of HTML tags and of significant numbers as in English.
// One change from the Python (which crashed on them since epic15): a
// translation given as an object ({summary, html} for a fold, {__html} for
// a block translated whole) has no English string of the same shape to
// compare with; it is counted and skipped.
func Fidelity(root string, w io.Writer) (int, error) {
	i18n := filepath.Join(root, "src/i18n")
	var issues []string
	checked, whole := 0, 0
	for _, pf := range glob(filepath.Join(root, "src/data/prose", "*.js")) {
		tab := strings.TrimSuffix(filepath.Base(pf), ".js")
		text, _ := read(pf)
		order, blocks := proseBlocks(text, proseKeyedFidelity)
		if len(order) == 0 {
			continue
		}
		for _, lang := range dirs(i18n) {
			if lang == "en" {
				continue
			}
			b, err := os.ReadFile(filepath.Join(i18n, lang, tab+"-prose.json"))
			if err != nil {
				continue
			}
			var tr map[string]any
			if err := json.Unmarshal(b, &tr); err != nil {
				return 1, fmt.Errorf("%s/%s-prose.json: %w", lang, tab, err)
			}
			for _, key := range order {
				v, ok := tr[key]
				if !ok {
					continue // reported by the structure audit
				}
				blk := blocks[key]
				var en []string
				if blk["t"] == "notes-block" {
					en, _ = strs(blk["paras"])
				} else {
					h, _ := blk["html"].(string)
					en = []string{h}
				}
				trs, ok := strs(v)
				if !ok {
					whole++
					continue
				}
				if len(en) != len(trs) {
					issues = append(issues, fmt.Sprintf("%s/%s-prose.json[%s] : %d paragraphe(s) traduits contre %d en anglais", lang, tab, key, len(trs), len(en)))
					continue
				}
				for i := range en {
					checked++
					suffix := ""
					if len(en) > 1 {
						suffix = fmt.Sprintf(" (paragraphe %d)", i)
					}
					et, tt := tags(en[i]), tags(trs[i])
					if !et.equal(tt) {
						issues = append(issues, fmt.Sprintf("%s/%s-prose.json[%s]%s : balises différentes -- anglais %s vs traduit %s", lang, tab, key, suffix, et.repr(), tt.repr()))
					}
					en_, tn := nums(en[i]), nums(trs[i])
					if !en_.equal(tn) && !KnownFalsePositives[[3]string{lang, tab, key}] {
						var detail []string
						if m := en_.minus(tn); len(m) > 0 {
							detail = append(detail, "manquant(s) "+listRepr(m))
						}
						if a := tn.minus(en_); len(a) > 0 {
							detail = append(detail, "en trop "+listRepr(a))
						}
						issues = append(issues, fmt.Sprintf("%s/%s-prose.json[%s]%s : nombres différents -- %s", lang, tab, key, suffix, strings.Join(detail, ", ")))
					}
				}
			}
		}
	}
	fmt.Fprintf(w, "%d chaîne(s)/paragraphe(s) comparé(s) (balises + nombres) sur les onglets traduits.\n", checked)
	if whole > 0 {
		fmt.Fprintf(w, "%d bloc(s) traduit(s) en objet ({summary, html} ou {__html}) non comparé(s).\n", whole)
	}
	if len(issues) > 0 {
		fmt.Fprintf(w, "\n%d problème(s) :\n", len(issues))
		for _, m := range issues {
			fmt.Fprintf(w, "  - %s\n", m)
		}
		return 1, nil
	}
	fmt.Fprintln(w, "audit_prose_fidelity: OK -- mêmes balises, mêmes nombres, dans les 4 langues.")
	return 0, nil
}
