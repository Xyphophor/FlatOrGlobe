// Package repo finds the root of the FlatOrGlobe checkout, so that fog
// works from any directory (the Python scripts only worked from the root
// or from scripts/).
package repo

import (
	"errors"
	"os"
	"path/filepath"
)

// marker identifies the root: the Go module of the data compiler.
const marker = "tools/go.mod"

// Find walks up from dir until it finds the root.
func Find(dir string) (string, error) {
	d, err := filepath.Abs(dir)
	if err != nil {
		return "", err
	}
	for {
		if _, err := os.Stat(filepath.Join(d, marker)); err == nil {
			return d, nil
		}
		up := filepath.Dir(d)
		if up == d {
			return "", errors.New("not inside the FlatOrGlobe repository (no " + marker + " above " + dir + ")")
		}
		d = up
	}
}
