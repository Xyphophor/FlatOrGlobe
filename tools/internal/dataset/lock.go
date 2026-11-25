package dataset

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"flatorglobe/tools/internal/preset"
)

// The lock is in sha256sum format ("<hex>  <path>", one per line, sorted),
// so that `cd data/x && sha256sum -c inputs.lock` checks it without fog.
var lockLine = regexp.MustCompile(`^([0-9a-f]{64})  (\S.*)$`)

// ReadLock reads the lock of d: dataset-relative path -> sha256.
func ReadLock(root string, d *Dataset) (map[string]string, error) {
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(d.Dir), LockName))
	if err != nil {
		return nil, err
	}
	out := map[string]string{}
	sc := bufio.NewScanner(bytes.NewReader(b))
	n := 0
	for sc.Scan() {
		n++
		l := sc.Text()
		if l == "" || strings.HasPrefix(l, "#") {
			continue
		}
		m := lockLine.FindStringSubmatch(l)
		if m == nil {
			return nil, fmt.Errorf("%s line %d: want \"<sha256>  <path>\"", LockName, n)
		}
		if _, dup := out[m[2]]; dup {
			return nil, fmt.Errorf("%s line %d: %s listed twice", LockName, n, m[2])
		}
		out[m[2]] = m[1]
	}
	return out, sc.Err()
}

// HashFiles hashes dataset-relative files.
func HashFiles(root string, d *Dataset, files []string) (map[string]string, error) {
	out := make(map[string]string, len(files))
	for _, f := range files {
		s, err := preset.SHA256File(filepath.Join(root, filepath.FromSlash(d.Dir), filepath.FromSlash(f)))
		if err != nil {
			return nil, err
		}
		out[f] = s
	}
	return out, nil
}

// WriteLock hashes every input on disk and writes the lock. Entries of
// gitignored inputs that are not on disk are kept from the old lock (a
// machine without the raw files must not erase their hashes).
func WriteLock(root string, d *Dataset) (int, error) {
	files, _, err := d.Files(root)
	if err != nil {
		return 0, err
	}
	sums, err := HashFiles(root, d, files)
	if err != nil {
		return 0, err
	}
	if old, err := ReadLock(root, d); err == nil {
		ign := d.ignoredPatterns()
		for f, s := range old {
			if _, ok := sums[f]; !ok && ign(f) {
				sums[f] = s
			}
		}
	}
	names := make([]string, 0, len(sums))
	for f := range sums {
		names = append(names, f)
	}
	sort.Strings(names)
	var b strings.Builder
	for _, f := range names {
		fmt.Fprintf(&b, "%s  %s\n", sums[f], f)
	}
	p := filepath.Join(root, filepath.FromSlash(d.Dir), LockName)
	return len(names), os.WriteFile(p, []byte(b.String()), 0o644)
}
