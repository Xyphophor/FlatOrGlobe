package build

// The .explain files (2026-11-25, Xyphophor: « pour chaque fichier data x, un autre fichier x.explain qui fait office
// de métadonnées » ; « le maître mot c'est la transparence »). Every file of every dataset's inputs.lock gets, beside
// it, a plain-text x.explain that says what it is, where it comes from exactly, how it was obtained (downloaded,
// transcribed from which pages…), what checks it went through, what could still be wrong in it, its hash, whether it
// is in the public repository (and, if not, why, and where to get it), the code that uses it and the page sections
// that show it. Every generated file of src/data gets one too. All of it is written from data/**/dataset.json and
// inputs.lock, never by hand: `fog build explain` (a meta target, run by `fog build all`) rewrites them, and
// `fog build --check explain` fails when a manifest changed and they were not. The page reads the same facts from
// src/data/provenance.js (the "code · data" button of every section that shows evidence).

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"

	"flatorglobe/tools/internal/dataset"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// ExplainExt is the suffix of the metadata files.
const ExplainExt = dataset.ExplainExt

const explainFooter = "Written by `fog build explain` from %s and %s: edit those, not this file.\n"

func wrap(s string, width int, indent string) string {
	var out []string
	line := ""
	for _, w := range strings.Fields(s) {
		if line != "" && len(line)+1+len(w) > width {
			out = append(out, line)
			line = indent + w
			continue
		}
		if line == "" {
			line = w
		} else {
			line += " " + w
		}
	}
	if line != "" {
		out = append(out, line)
	}
	return strings.Join(out, "\n")
}

func field(b *strings.Builder, name, text string) {
	if strings.TrimSpace(text) == "" {
		return
	}
	b.WriteString(wrap(name+": "+text, 100, "  ") + "\n")
}

func list(b *strings.Builder, name string, items []string) {
	if len(items) == 0 {
		return
	}
	b.WriteString(name + ":\n")
	for _, it := range items {
		b.WriteString(wrap("- "+it, 100, "  ") + "\n")
	}
}

// common writes what every file of a dataset shares.
func explainCommon(b *strings.Builder, d *dataset.Dataset) {
	field(b, "Collected", d.Collected)
	lic := d.License
	if d.LicenseNote != "" {
		lic += " — " + d.LicenseNote
	}
	field(b, "Licence", lic)
	var src []string
	for _, s := range d.Sources {
		if s.URL != "" {
			src = append(src, s.Cite+" <"+s.URL+">")
		} else {
			src = append(src, s.Cite)
		}
	}
	list(b, "Sources", src)
	field(b, "Evidence class (rule 10)", d.Evidence)
	var rv []string
	for _, e := range d.RadiusEntersVia {
		rv = append(rv, e.Field+": "+e.How)
	}
	list(b, "Where the Earth's radius enters", rv)
	field(b, "What would vindicate the flat model (rule 5)", d.VerdictRule)
	var targets []string
	for _, t := range d.Targets() {
		targets = append(targets, "fog build "+t)
	}
	field(b, "Built by", strings.Join(targets, ", "))
	list(b, "Generated files", d.Outputs)
	list(b, "Code", d.Code)
	list(b, "Shown on the page", sectionsURL(d.Sections))
	field(b, "Notes", d.Notes)
}

func sectionsURL(secs []string) []string {
	var out []string
	for _, s := range secs {
		t, sec, _ := strings.Cut(s, "/")
		out = append(out, "#tab-"+t+"/"+sec)
	}
	return out
}

func explainInput(d *dataset.Dataset, f, sum, norm string) string {
	in, _ := d.InputOf(f)
	pub, why := d.Public(in)
	var b strings.Builder
	b.WriteString("# " + path.Base(f) + "\n\n")
	field(&b, "Dataset", d.ID+" — "+d.Title)
	field(&b, "File", d.Dir+"/"+f)
	field(&b, "SHA-256", sum+" (also in "+d.Dir+"/"+dataset.LockName+"; check with: cd "+d.Dir+" && sha256sum -c "+dataset.LockName+")")
	get := "fog fetch " + d.ID
	if in.URL != "" {
		get = in.URL + " (or fog fetch " + d.ID + ")"
	}
	switch {
	case pub && !in.Ignored:
		field(&b, "In the public repository", "yes, beside this description.")
	case pub:
		field(&b, "In the public repository", "no, only this description and the hash: the file may be shared but is kept out of git for its size. Get it from "+get+", then compare its SHA-256 with the one above.")
	default:
		field(&b, "In the public repository", "no, only this description and the hash: "+why+" Get it from "+get+", then compare its SHA-256 with the one above.")
	}
	field(&b, "Obtained", dataset.Hows[in.How]+".")
	field(&b, "From", in.Origin)
	if in.URL != "" && !strings.Contains(in.Origin, in.URL) {
		field(&b, "URL", in.URL)
	}
	switch {
	case in.Refetch == "no":
		field(&b, "Fetching it again", "not possible: "+in.RefetchWhy)
	case in.VerifySkip != "" && norm != "":
		field(&b, "Check it yourself", "fog verify "+d.ID+" (tools/) downloads it again into a temporary directory and compares it with this hash; the lines matching "+in.VerifySkip+" change at every download (the date of the request), so it also compares the rest: SHA-256 without them "+norm+".")
	default:
		field(&b, "Check it yourself", "fog verify "+d.ID+" (tools/) downloads it again into a temporary directory and compares it with this hash.")
	}
	field(&b, "Checks", in.Checks)
	field(&b, "What could still be wrong", in.Caveats)
	explainCommon(&b, d)
	b.WriteString("\n" + fmt.Sprintf(explainFooter, d.Dir+"/"+dataset.ManifestName, d.Dir+"/"+dataset.LockName))
	return b.String()
}

func explainOutput(out string, ds []*dataset.Dataset) string {
	var b strings.Builder
	b.WriteString("# " + path.Base(out) + "\n\n")
	field(&b, "File", out+" (generated: never edited by hand)")
	for _, d := range ds {
		b.WriteString("\n")
		field(&b, "From the dataset", d.ID+" — "+d.Title+" ("+d.Dir+"/, every input with its own .explain)")
		var ins []string
		for _, in := range d.Inputs {
			p := in.Path + in.Glob
			pub, _ := d.Public(in)
			s := d.Dir + "/" + p + " — " + in.How
			if !pub {
				s += ", not in the public repository (hash and source in its .explain)"
			}
			ins = append(ins, s)
		}
		list(&b, "Inputs", ins)
		explainCommon(&b, d)
	}
	var man []string
	for _, d := range ds {
		man = append(man, d.Dir+"/"+dataset.ManifestName)
	}
	b.WriteString("\n" + fmt.Sprintf(explainFooter, strings.Join(man, ", "), "the lock files"))
	return b.String()
}

// explainPath is the .explain beside a data file, or, when a directory on the way is a symbolic link (data/sat/raw
// is one to data/gps/raw: two datasets, the same files), under the dataset's own explain/ directory, so that the
// two descriptions never overwrite each other.
func explainPath(root string, d *dataset.Dataset, f string) string {
	dir := path.Dir(f)
	for p := dir; p != "." && p != "/"; p = path.Dir(p) {
		if fi, err := os.Lstat(filepath.Join(root, filepath.FromSlash(d.Dir+"/"+p))); err == nil && fi.Mode()&os.ModeSymlink != 0 {
			return d.Dir + "/explain/" + f + ExplainExt
		}
	}
	return d.Dir + "/" + f + ExplainExt
}

func published(root string) (map[string]bool, error) {
	pb, err := os.ReadFile(filepath.Join(root, "src/data/contrib/published.json"))
	if err != nil {
		return nil, err
	}
	m := map[string]bool{}
	return m, json.Unmarshal(pb, &m)
}

func init() {
	Targets = append(Targets, Target{
		Name: "explain",
		Meta: true,
		Desc: "site: one .explain beside every data file and generated file (provenance, hash, public or not and why), and src/data/provenance.js for the page",
		Make: func(root string) ([]preset.File, string, error) {
			paths, err := dataset.Discover(root)
			if err != nil {
				return nil, "", err
			}
			var files []preset.File
			outputs := map[string][]*dataset.Dataset{}
			var all []*dataset.Dataset
			nIn := 0
			for _, p := range paths {
				d, err := dataset.Load(root, p)
				if err != nil {
					return nil, "", err
				}
				all = append(all, d)
				lock, err := dataset.ReadLock(root, d)
				if err != nil {
					return nil, "", fmt.Errorf("%s: %w", d.ID, err)
				}
				var fs []string
				for f := range lock {
					fs = append(fs, f)
				}
				sort.Strings(fs)
				norm, _ := dataset.ReadNorm(root, d)
				for _, f := range fs {
					files = append(files, preset.File{Out: explainPath(root, d, f), NoHeader: true, Body: explainInput(d, f, lock[f], norm[f])})
					nIn++
				}
				for _, o := range d.Outputs {
					outputs[o] = append(outputs[o], d)
				}
			}
			described := map[string]bool{}
			for o := range outputs {
				described[o] = true
			}
			others, nOther, err := otherExplains(root, described)
			if err != nil {
				return nil, "", err
			}
			files = append(files, others...)
			var outs []string
			for o := range outputs {
				outs = append(outs, o)
			}
			sort.Strings(outs)
			for _, o := range outs {
				files = append(files, preset.File{Out: o + ExplainExt, NoHeader: true, Body: explainOutput(o, outputs[o])})
			}
			// the page's view: every published dataset, what the "code · data" panel shows
			var b strings.Builder
			b.WriteString("// One entry per dataset (contributions left out: they leave no trace outside their own files): what the \"code · data\" panel of a section shows.\n")
			b.WriteString("// {id: {title, tab, dir, kind, evidence, license, sources [[cite, url]], publicRaw, why, code [], sections [], outputs [],\n")
			b.WriteString("//  inputs [[pattern, how, origin, public (0/1), why, files]]}}\nexport const PROVENANCE = {\n")
			kept := []string{}
			for i, d := range all {
				// a contribution leaves no trace outside its own files (src/tabs/contrib/registry.test.js), published or not:
				// its .explain files stay beside its data, the page's panel does not name it
				if strings.HasPrefix(d.ID, "contrib-") {
					continue
				}
				kept = append(kept, paths[i])
				lock, _ := dataset.ReadLock(root, d)
				var src []any
				for _, s := range d.Sources {
					src = append(src, []any{s.Cite, s.URL})
				}
				var ins []any
				for _, in := range d.Inputs {
					pub, why := d.Public(in)
					n := 0
					for f := range lock {
						if g, ok := d.InputOf(f); ok && g.Path+g.Glob == in.Path+in.Glob {
							n++
						}
					}
					p := 0
					if pub {
						p = 1
					}
					ins = append(ins, []any{in.Path + in.Glob, in.How, in.Origin, p, why, n})
				}
				o := pyjson.Obj{{K: "title", V: d.Title}, {K: "tab", V: d.Tab}, {K: "dir", V: d.Dir}, {K: "kind", V: d.Kind}, {K: "evidence", V: d.Evidence},
					{K: "license", V: d.License}, {K: "sources", V: src}, {K: "publicRaw", V: d.PublicRaw == "yes"}, {K: "why", V: d.PublicRawWhy},
					{K: "code", V: d.Code}, {K: "sections", V: d.Sections}, {K: "outputs", V: d.Outputs}, {K: "inputs", V: ins}}
				b.WriteString(" " + pyjson.Dumps(d.ID, pyjson.Compact) + ": " + pyjson.Dumps(o, pyjson.Compact) + ",\n")
			}
			b.WriteString("};\n")
			files = append(files, preset.File{Out: "src/data/provenance.js", Command: "build explain", Inputs: kept,
				Notes: []string{"Provenance of the datasets (data/**/dataset.json): sources, files, public or not and why, code, sections."}, Body: b.String()})
			return files, fmt.Sprintf("%d .explain for data files, %d for generated files, %d for files compiled from no dataset (%s), provenance of %d datasets", nIn, len(outs), nOther, OtherName, len(kept)), nil
		},
	})
}
