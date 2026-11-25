// Package doctor reports which outside tools the data chain needs and
// which are present, so that a build does not fail after ten minutes of
// CPU because crx2rnx or numpy is missing.
package doctor

import (
	"context"
	"fmt"
	"io"
	"os/exec"
	"strings"
	"time"
)

// Probe is one thing to look for.
type Probe struct {
	Name     string   // shown in the report
	Cmd      []string // command whose success means "present"; first line of output is the version
	For      string   // what needs it
	Required bool     // `fog doctor` fails without it
}

// Probes lists what the repository uses today. fog build needs only
// crx2rnx (gps-raw) and laz2pts (a LiDAR contribution); the others serve the site (node),
// and the exploratory Python of research/.
var Probes = []Probe{
	{"node", []string{"node", "--version"}, "site: tests, mount-smoke, build_ai", true},
	{"crx2rnx", []string{"sh", "-c", "test -x tools/bin/crx2rnx && echo tools/bin/crx2rnx"}, "fog build gps-raw (make crx2rnx: RNXCMP, vendored)", false},
	{"gcc", []string{"gcc", "--version"}, "make crx2rnx; rx-snippets (C)", false},
	{"g++", []string{"g++", "--version"}, "make laz2pts (LASzip, C++)", false},
	{"python3", []string{"python3", "--version"}, "research/ only (exploratory; not needed to build)", false},
	{"numpy", []string{"python3", "-c", "import numpy; print(numpy.__version__)"}, "research/ (requirements.txt)", false},
}

// Result of one probe.
type Result struct {
	Probe
	OK      bool
	Version string
}

// Run executes the probes, each bounded by a short timeout.
func Run(ctx context.Context, probes []Probe) []Result {
	out := make([]Result, len(probes))
	for i, p := range probes {
		c, cancel := context.WithTimeout(ctx, 20*time.Second)
		b, err := exec.CommandContext(c, p.Cmd[0], p.Cmd[1:]...).CombinedOutput()
		cancel()
		out[i] = Result{Probe: p, OK: err == nil}
		if err == nil {
			out[i].Version, _, _ = strings.Cut(strings.TrimSpace(string(b)), "\n")
		}
	}
	return out
}

// Report prints the results and returns false if a required tool is missing.
func Report(w io.Writer, goVersion string, rs []Result) bool {
	ok := true
	fmt.Fprintf(w, "%-9s %-4s %-40s %s\n", "go", "ok", goVersion, "fog itself")
	for _, r := range rs {
		mark, v := "ok", r.Version
		if !r.OK {
			mark, v = "--", "missing"
			if r.Required {
				mark, ok = "FAIL", false
			}
		}
		if len(v) > 40 {
			v = v[:37] + "..."
		}
		fmt.Fprintf(w, "%-9s %-4s %-40s %s\n", r.Name, mark, v, r.For)
	}
	return ok
}
