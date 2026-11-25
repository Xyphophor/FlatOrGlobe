package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"flatorglobe/tools/internal/build"
	"flatorglobe/tools/internal/build/aviaflights"
	"flatorglobe/tools/internal/build/daylen"
	"flatorglobe/tools/internal/build/flightdip"
	"flatorglobe/tools/internal/build/gpsraw"
	"flatorglobe/tools/internal/build/igra"
	"flatorglobe/tools/internal/build/llr"
	"flatorglobe/tools/internal/build/lomond"
	"flatorglobe/tools/internal/build/mag"
	"flatorglobe/tools/internal/build/mlo"
	"flatorglobe/tools/internal/build/refbord"
	"flatorglobe/tools/internal/build/satdop"
	"flatorglobe/tools/internal/build/seisbulk"
	"flatorglobe/tools/internal/build/seiswaves"
	"flatorglobe/tools/internal/build/tonga"
	"flatorglobe/tools/internal/build/tongalaps"
	"flatorglobe/tools/internal/dataset"
	"flatorglobe/tools/internal/fetch"
)

// loadAll reads every manifest; ids are unique.
func loadAll(root string) ([]*dataset.Dataset, error) {
	paths, err := dataset.Discover(root)
	if err != nil {
		return nil, err
	}
	var out []*dataset.Dataset
	seen := map[string]string{}
	for _, p := range paths {
		d, err := dataset.Load(root, p)
		if err != nil {
			return nil, err
		}
		if prev, dup := seen[d.ID]; dup {
			return nil, fmt.Errorf("dataset id %q in both %s and %s", d.ID, prev, p)
		}
		seen[d.ID] = p
		out = append(out, d)
	}
	return out, nil
}

// pick selects datasets by id ("all" or none = every one).
func pick(all []*dataset.Dataset, ids []string, emptyMeansAll bool) ([]*dataset.Dataset, error) {
	if (len(ids) == 0 && emptyMeansAll) || (len(ids) == 1 && ids[0] == "all") {
		return all, nil
	}
	if len(ids) == 0 {
		return nil, fmt.Errorf("name a dataset id or 'all'")
	}
	byID := map[string]*dataset.Dataset{}
	for _, d := range all {
		byID[d.ID] = d
	}
	var out []*dataset.Dataset
	for _, id := range ids {
		d, ok := byID[id]
		if !ok {
			return nil, fmt.Errorf("unknown dataset %q", id)
		}
		out = append(out, d)
	}
	return out, nil
}

func env(root string) dataset.Env {
	e := dataset.Env{Root: root, Tabs: map[string]bool{}, Targets: map[string]bool{}}
	entries, _ := os.ReadDir(filepath.Join(root, "src", "tabs"))
	for _, x := range entries {
		if x.IsDir() && x.Name()[0] != '_' {
			e.Tabs[x.Name()] = true
		}
	}
	if fi, err := os.Stat(filepath.Join(root, "src", "core")); err == nil && fi.IsDir() {
		e.Tabs["core"] = true // shared data (e.g. the land mask every map draws)
	}
	for _, t := range build.Targets {
		e.Targets[t.Name] = true
	}
	return e
}

func runValidate(ids []string, root string, stdout, stderr io.Writer) int {
	all, err := loadAll(root)
	if err != nil {
		fmt.Fprintln(stderr, "fog validate:", err)
		return 1
	}
	ds, err := pick(all, ids, true)
	if err != nil {
		fmt.Fprintln(stderr, "fog validate:", err)
		return 2
	}
	ev := env(root)
	errs := 0
	for _, d := range ds {
		ps := d.Validate(ev)
		// each fog target belongs to exactly the dataset that names it
		for _, name := range d.Targets() {
			if t, ok := build.Find(name); ok && t.Dataset != d.ID {
				ps = append(ps, dataset.Problem{Sev: dataset.Error, Field: "build",
					Msg: fmt.Sprintf("target %s belongs to dataset %q", t.Name, t.Dataset)})
			}
		}
		n := 0
		for _, p := range ps {
			if p.Sev == dataset.Error {
				n++
			}
		}
		mark := "ok"
		if n > 0 {
			mark = "FAIL"
		}
		fmt.Fprintf(stdout, "%-4s %-20s %s\n", mark, d.ID, d.Dir)
		for _, p := range ps {
			fmt.Fprintf(stdout, "       %s\n", p)
		}
		errs += n
	}
	if len(ids) == 0 {
		// every fog target must be described by a dataset, except the site's own lists (Target.Meta)
		used := map[string]bool{}
		for _, d := range all {
			for _, t := range d.Targets() {
				used[t] = true
			}
		}
		for _, t := range build.Targets {
			if !used[t.Name] && !t.Meta {
				fmt.Fprintf(stdout, "FAIL target %s has no dataset.json naming it (build: \"fog:%s\")\n", t.Name, t.Name)
				errs++
			}
		}
	}
	if errs > 0 {
		fmt.Fprintf(stderr, "fog validate: %d error(s)\n", errs)
		return 1
	}
	return 0
}

func runLock(ids []string, root string, stdout, stderr io.Writer) int {
	all, err := loadAll(root)
	if err != nil {
		fmt.Fprintln(stderr, "fog lock:", err)
		return 1
	}
	ds, err := pick(all, ids, false)
	if err != nil {
		fmt.Fprintln(stderr, "fog lock:", err)
		return 2
	}
	for _, d := range ds {
		n, err := dataset.WriteLock(root, d)
		if err != nil {
			fmt.Fprintln(stderr, "fog lock:", d.ID+":", err)
			return 1
		}
		fmt.Fprintf(stdout, "%-20s %d files -> %s/%s\n", d.ID, n, d.Dir, dataset.LockName)
	}
	return 0
}

// fetchers download what a plain URL cannot describe (web pages, API
// queries), per dataset id. refresh re-reads what is already cached.
var fetchers = map[string]func(ctx context.Context, root string, refresh bool, log io.Writer) error{
	"avia-flights": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return aviaflights.Fetch(ctx, root, refresh, nil, 3*time.Second, log)
	},
	"sun-bsrn": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return daylen.Fetch(ctx, root, nil, log)
	},
	"ref-igra": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return igra.Fetch(ctx, root, nil, log)
	},
	"moon-llr": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return llr.Fetch(ctx, root, nil, log)
	},
	"seis-radius": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return seisbulk.Fetch(ctx, root, nil, log)
	},
	"seis-waves": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return seiswaves.Fetch(ctx, root, nil, log)
	},
	"seis-tonga": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return tonga.Fetch(ctx, root, nil, 500*time.Millisecond, log)
	},
	"atmo-tonga-laps": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return tongalaps.Fetch(ctx, root, nil, 500*time.Millisecond, log)
	},
	"dip-mlo": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return mlo.Fetch(ctx, root, nil, log)
	},
	"gps-raw": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return gpsraw.Fetch(ctx, root, nil, log)
	},
	"sat-doppler": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return satdop.Fetch(ctx, root, nil, log)
	},
	"contrib-flightdip": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return flightdip.Fetch(ctx, root, refresh, nil, log)
	},
	"ref-bordighera": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return refbord.Fetch(ctx, root, refresh, nil, log)
	},
	"contrib-lomond": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return lomond.Fetch(ctx, root, refresh, nil, log)
	},
	"mag-obs": func(ctx context.Context, root string, refresh bool, log io.Writer) error {
		return (&mag.Fetcher{Pause: time.Second, Refresh: refresh, Log: log}).Run(ctx, root)
	},
}

func runFetch(args []string, root string, stdout, stderr io.Writer) int {
	refresh := false
	var ids []string
	for _, a := range args {
		if a == "--refresh" {
			refresh = true
		} else {
			ids = append(ids, a)
		}
	}
	all, err := loadAll(root)
	if err != nil {
		fmt.Fprintln(stderr, "fog fetch:", err)
		return 1
	}
	ds, err := pick(all, ids, false)
	if err != nil {
		fmt.Fprintln(stderr, "fog fetch:", err)
		return 2
	}
	c := &fetch.Client{UserAgent: "FlatOrGlobe-fog/1 (data compiler)", Pause: 3 * time.Second}
	status := 0
	for _, d := range ds {
		lock, _ := dataset.ReadLock(root, d)
		for _, in := range d.Inputs {
			if in.URL == "" || in.Path == "" {
				continue
			}
			dest := filepath.Join(root, filepath.FromSlash(d.Dir), filepath.FromSlash(in.Path))
			if _, err := os.Stat(dest); err == nil {
				fmt.Fprintf(stdout, "%-20s present  %s\n", d.ID, in.Path)
				continue
			}
			want := lock[in.Path]
			sum, err := c.Get(context.Background(), in.URL, dest, want)
			if err != nil {
				fmt.Fprintf(stderr, "fog fetch: %s: %s: %v\n", d.ID, in.Path, err)
				status = 1
				continue
			}
			note := "matches the lock"
			if want == "" {
				note = "NOT in the lock yet: check the file, then fog lock " + d.ID
			}
			fmt.Fprintf(stdout, "%-20s fetched  %s (sha256 %s…, %s)\n", d.ID, in.Path, sum[:12], note)
		}
		if f, ok := fetchers[d.ID]; ok {
			fmt.Fprintf(stdout, "%-20s fetching (dataset fetcher%s)\n", d.ID, map[bool]string{true: ", refresh"}[refresh])
			if err := f(context.Background(), root, refresh, stdout); err != nil {
				fmt.Fprintf(stderr, "fog fetch: %s: %v\n", d.ID, err)
				status = 1
				continue
			}
			fmt.Fprintf(stdout, "%-20s done: check the new files, then fog lock %s\n", d.ID, d.ID)
		}
	}
	return status
}
