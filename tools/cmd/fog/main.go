// Command fog is the data compiler of FlatOrGlobe (epic24): it turns the
// sources under data/ into the generated files under src/data/.
//
//	fog build <target>… | all   write generated files
//	fog build --check …         write nothing, exit 1 if a file is stale
//	fog list                    list build targets
//	fog validate [id…]          check data/**/dataset.json and their files
//	fog lock <id>… | all        (re)write a dataset's inputs.lock
//	fog fetch <id>… | all       download missing inputs that have a URL
//	fog verify <id>…            fetch again into a temporary directory and compare with the lock
//	fog audit [structure|tex|prose|all]  static audits of the site's sources
//	fog doctor                  outside tools the repository uses
//	fog public <dir>            write the tree of the public repository into a new directory
//	fog public --into <clone>   rewrite an existing clone of the public repository from that tree
//
// fog finds the repository root from the current directory (-root to
// override). Only fetch touches the network.
package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	"os"
	"runtime"

	"flatorglobe/tools/internal/audit"
	"flatorglobe/tools/internal/build"
	"flatorglobe/tools/internal/doctor"
	"flatorglobe/tools/internal/public"
	"flatorglobe/tools/internal/repo"
)

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func usage(w io.Writer) {
	fmt.Fprint(w, `usage: fog [-root DIR] <command> [args]

commands:
  build [--check] [--slow] <target>… | all
                                    generate files under src/data/ from data/
  list                              list build targets
  validate [<dataset id>…]          check data/**/dataset.json and their files
  lock <dataset id>… | all          (re)write inputs.lock from the files on disk
  fetch [--refresh] <id>… | all     download missing inputs (URL or dataset fetcher)
  verify <id>…                      fetch again into a temporary directory, compare with the lock (data/ untouched)
  audit [structure|tex|prose|all]   static audits of the site's sources (no JS executed)
  doctor                            check the outside tools the repository uses
  public <new dir> | --into <clone> write the public repository's tree (no git, no network)
`)
}

func run(args []string, stdout, stderr io.Writer) int {
	g := flag.NewFlagSet("fog", flag.ContinueOnError)
	g.SetOutput(stderr)
	rootFlag := g.String("root", "", "repository root (default: found from the current directory)")
	g.Usage = func() { usage(stderr) }
	if err := g.Parse(args); err != nil {
		return 2
	}
	if g.NArg() == 0 {
		usage(stderr)
		return 2
	}
	cmd, rest := g.Arg(0), g.Args()[1:]
	switch cmd {
	case "list":
		for _, t := range build.Targets {
			fmt.Fprintf(stdout, "%-12s %s\n", t.Name, t.Desc)
		}
		return 0
	case "doctor":
		rs := doctor.Run(context.Background(), doctor.Probes)
		if !doctor.Report(stdout, runtime.Version(), rs) {
			return 1
		}
		return 0
	case "audit":
		root, err := findRoot(*rootFlag)
		if err != nil {
			fmt.Fprintln(stderr, "fog:", err)
			return 1
		}
		return runAudit(rest, root, stdout, stderr)
	case "build", "validate", "lock", "fetch", "verify":
		root, err := findRoot(*rootFlag)
		if err != nil {
			fmt.Fprintln(stderr, "fog:", err)
			return 1
		}
		switch cmd {
		case "build":
			return runBuild(rest, root, stdout, stderr)
		case "validate":
			return runValidate(rest, root, stdout, stderr)
		case "lock":
			return runLock(rest, root, stdout, stderr)
		case "verify":
			return runVerify(rest, root, stdout, stderr)
		default:
			return runFetch(rest, root, stdout, stderr)
		}
	case "public":
		root, err := findRoot(*rootFlag)
		into := len(rest) == 2 && rest[0] == "--into"
		if err != nil || (len(rest) != 1 && !into) {
			fmt.Fprintln(stderr, "fog: public <new directory> | public --into <clone of the public repository>")
			return 2
		}
		var r *public.Report
		removed := 0
		if into {
			r, removed, err = public.Into(root, rest[1])
		} else {
			r, err = public.Export(root, rest[0])
		}
		if into && err == nil && len(r.Hits) == 0 {
			fmt.Fprintf(stdout, "%d file(s) removed from the clone\n", removed)
		}
		if err != nil {
			fmt.Fprintln(stderr, "fog:", err)
			return 1
		}
		fmt.Fprintf(stdout, "%d files kept (%.1f MB), %d left out\n", r.Kept, float64(r.Bytes)/1e6, r.Excluded)
		for w, n := range r.Why {
			fmt.Fprintf(stdout, "  left out: %4d  %s\n", n, w)
		}
		if len(r.Hits) > 0 {
			fmt.Fprintf(stdout, "NOT READY: %d hit(s) of a hidden contribution or a private string:\n", len(r.Hits))
			for _, h := range r.Hits {
				fmt.Fprintln(stdout, "  "+h)
			}
			return 1
		}
		fmt.Fprintln(stdout, "no canary and no private string: ready to commit")
		return 0
	case "help", "-h", "--help":
		usage(stdout)
		return 0
	}
	fmt.Fprintf(stderr, "fog: unknown command %q\n", cmd)
	usage(stderr)
	return 2
}

func findRoot(flagged string) (string, error) {
	if flagged != "" {
		return repo.Find(flagged)
	}
	return repo.Find(".")
}

func runBuild(args []string, root string, stdout, stderr io.Writer) int {
	f := flag.NewFlagSet("build", flag.ContinueOnError)
	f.SetOutput(stderr)
	check := f.Bool("check", false, "write nothing; exit 1 if a generated file differs from what the build gives")
	slow := f.Bool("slow", false, "with all: include the slow targets (minutes of CPU)")
	if err := f.Parse(args); err != nil {
		return 2
	}
	names := f.Args()
	if len(names) == 0 {
		fmt.Fprintln(stderr, "fog build: name a target or 'all' (see fog list)")
		return 2
	}
	var targets []build.Target
	if len(names) == 1 && names[0] == "all" {
		for _, t := range build.Targets {
			if t.Slow && !*slow {
				fmt.Fprintf(stdout, "%s: skipped (slow; fog build --slow all, or fog build %s)\n", t.Name, t.Name)
				continue
			}
			targets = append(targets, t)
		}
	} else {
		for _, n := range names {
			t, ok := build.Find(n)
			if !ok {
				fmt.Fprintf(stderr, "fog build: unknown target %q (see fog list)\n", n)
				return 2
			}
			targets = append(targets, t)
		}
	}
	status := 0
	for _, t := range targets {
		fresh, err := build.Run(stdout, root, t, *check)
		if err != nil {
			fmt.Fprintln(stderr, "fog build:", err)
			return 1
		}
		if !fresh {
			status = 1
		}
	}
	if status != 0 {
		fmt.Fprintln(stderr, "fog build --check: stale generated files; run `make data` (fog build all) and commit them")
	}
	return status
}

func runAudit(args []string, root string, stdout, stderr io.Writer) int {
	which := "all"
	if len(args) == 1 {
		which = args[0]
	} else if len(args) > 1 {
		fmt.Fprintln(stderr, "fog audit: one of structure, tex, prose, all")
		return 2
	}
	audits := []struct {
		name string
		f    func(string, io.Writer) (int, error)
	}{{"structure", audit.Structure}, {"tex", audit.Tex}, {"prose", audit.Fidelity}}
	status, ran := 0, false
	for _, a := range audits {
		if which != "all" && which != a.name {
			continue
		}
		ran = true
		code, err := a.f(root, stdout)
		if err != nil {
			fmt.Fprintln(stderr, "fog audit:", a.name+":", err)
			return 1
		}
		status = max(status, code)
	}
	if !ran {
		fmt.Fprintln(stderr, "fog audit: one of structure, tex, prose, all")
		return 2
	}
	return status
}
