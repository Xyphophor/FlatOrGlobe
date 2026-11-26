package main

// fog verify <id>… (2026-11-27, transparence : les fichiers que le dépôt public ne republie pas sont donnés par leur
// hash et leur source ; cette commande permet à chacun de vérifier que la source rend bien les mêmes fichiers). Elle
// télécharge de nouveau chaque entrée dans un dossier temporaire, jamais dans data/, et compare au verrou :
//   - une entrée avec une URL : le fichier lui-même ;
//   - un jeu qui a son récupérateur (fetchers) : celui-ci est lancé sur une copie temporaire du dossier du jeu (sans
//     ses fichiers bruts), puis chaque fichier rapporté est comparé ;
//   - une entrée « refetch: no » (la source ne rend plus le même fichier) est sautée, avec sa raison ;
//   - quand le hash brut diffère, une entrée « verify_skip » est comparée sans ses lignes datées (inputs.norm).

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"flatorglobe/tools/internal/dataset"
	"flatorglobe/tools/internal/fetch"
	"flatorglobe/tools/internal/preset"
)

func runVerify(ids []string, root string, stdout, stderr io.Writer) int {
	if len(ids) == 0 {
		fmt.Fprintln(stderr, "fog verify <dataset id>… (some datasets are hundreds of MB: name them)")
		return 2
	}
	all, err := loadAll(root)
	if err != nil {
		fmt.Fprintln(stderr, "fog verify:", err)
		return 1
	}
	ds, err := pick(all, ids, false)
	if err != nil {
		fmt.Fprintln(stderr, "fog verify:", err)
		return 2
	}
	c := &fetch.Client{UserAgent: "FlatOrGlobe-fog/1 (data compiler)", Pause: 3 * time.Second}
	ctx := context.Background()
	bad := 0
	for _, d := range ds {
		lock, err := dataset.ReadLock(root, d)
		if err != nil {
			fmt.Fprintf(stderr, "fog verify: %s: %v\n", d.ID, err)
			bad++
			continue
		}
		norm, _ := dataset.ReadNorm(root, d)
		tmp, err := os.MkdirTemp("", "fog-verify-")
		if err != nil {
			fmt.Fprintln(stderr, "fog verify:", err)
			return 1
		}
		report := func(f, path string) {
			in, _ := d.InputOf(f)
			want := lock[f]
			b, err := os.ReadFile(path)
			if err != nil {
				fmt.Fprintf(stdout, "%-20s MISSING    %s (the source did not give it)\n", d.ID, f)
				bad++
				return
			}
			sum := preset.SHA(b)
			switch {
			case sum == want:
				fmt.Fprintf(stdout, "%-20s same       %s\n", d.ID, f)
			case in.VerifySkip != "" && norm[f] != "" && dataset.NormHash(b, regexp.MustCompile(in.VerifySkip)) == norm[f]:
				fmt.Fprintf(stdout, "%-20s same data  %s (only lines matching %s differ)\n", d.ID, f, in.VerifySkip)
			default:
				fmt.Fprintf(stdout, "%-20s DIFFERENT  %s\n", d.ID, f)
				bad++
			}
		}
		skipped := map[string]bool{}
		for _, in := range d.Inputs {
			p := in.Path + in.Glob
			if in.Refetch == "no" {
				fmt.Fprintf(stdout, "%-20s skipped    %s: %s\n", d.ID, p, in.RefetchWhy)
				skipped[p] = true
				continue
			}
			if in.URL == "" || in.Path == "" {
				continue
			}
			dest := filepath.Join(tmp, "url", filepath.FromSlash(in.Path))
			os.MkdirAll(filepath.Dir(dest), 0o755)
			if _, err := c.Get(ctx, in.URL, dest, ""); err != nil {
				fmt.Fprintf(stdout, "%-20s UNREACHABLE %s: %v\n", d.ID, in.Path, err)
				bad++
				continue
			}
			report(in.Path, dest)
		}
		// le récupérateur ne sert que s'il reste une entrée qu'il produit (ni URL, ni « refetch: no », ni écrite par nous)
		needFetcher := false
		for _, in := range d.Inputs {
			if in.URL == "" && in.Refetch != "no" && in.How != "ours" {
				needFetcher = true
			}
		}
		if f, ok := fetchers[d.ID]; ok && needFetcher {
			troot := filepath.Join(tmp, "root")
			if err := copyDatasetDir(root, troot, d, lock); err != nil {
				fmt.Fprintf(stderr, "fog verify: %s: %v\n", d.ID, err)
				bad++
			} else if err := f(ctx, troot, false, io.Discard); err != nil {
				fmt.Fprintf(stdout, "%-20s FETCH FAILED: %v\n", d.ID, err)
				bad++
			} else {
				var fs []string
				for f := range lock {
					in, _ := d.InputOf(f)
					if in.URL == "" && in.How != "ours" && !skipped[in.Path+in.Glob] {
						fs = append(fs, f)
					}
				}
				sort.Strings(fs)
				for _, f := range fs {
					report(f, filepath.Join(troot, filepath.FromSlash(d.Dir), filepath.FromSlash(f)))
				}
			}
		}
		os.RemoveAll(tmp)
	}
	if bad > 0 {
		fmt.Fprintf(stdout, "%d file(s) not confirmed\n", bad)
		return 1
	}
	fmt.Fprintln(stdout, "every file fetched again matches its lock")
	return 0
}

// copyDatasetDir copies the dataset directory into a temporary root, without the locked files that a source gives (our
// own lists, how "ours", are kept: the fetcher reads them) and without the .explain.
func copyDatasetDir(root, troot string, d *dataset.Dataset, lock map[string]string) error {
	src := filepath.Join(root, filepath.FromSlash(d.Dir))
	return filepath.WalkDir(src, func(p string, e fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		rel = filepath.ToSlash(rel)
		dst := filepath.Join(troot, filepath.FromSlash(d.Dir), filepath.FromSlash(rel))
		if e.IsDir() {
			return os.MkdirAll(dst, 0o755)
		}
		in, _ := d.InputOf(rel)
		if _, locked := lock[rel]; (locked && in.How != "ours") || strings.HasSuffix(rel, dataset.ExplainExt) || e.Type()&fs.ModeSymlink != 0 {
			return nil
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(dst, b, 0o644)
	})
}
