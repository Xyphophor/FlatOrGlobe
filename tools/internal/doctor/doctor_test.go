package doctor

import (
	"context"
	"strings"
	"testing"
)

func TestRunAndReport(t *testing.T) {
	probes := []Probe{
		{Name: "present", Cmd: []string{"sh", "-c", "echo v1.2; echo second line"}, For: "x"},
		{Name: "absent", Cmd: []string{"fog-no-such-command-xyz"}, For: "y"},
	}
	rs := Run(context.Background(), probes)
	if !rs[0].OK || rs[0].Version != "v1.2" {
		t.Errorf("present: %+v", rs[0])
	}
	if rs[1].OK {
		t.Errorf("absent reported present")
	}
	var b strings.Builder
	if !Report(&b, "go1.x", rs) {
		t.Error("optional missing tool must not fail the report")
	}
	if !strings.Contains(b.String(), "missing") {
		t.Errorf("report:\n%s", b.String())
	}
	rs[1].Required = true
	b.Reset()
	if Report(&b, "go1.x", rs) || !strings.Contains(b.String(), "FAIL") {
		t.Errorf("required missing tool must fail:\n%s", b.String())
	}
}
