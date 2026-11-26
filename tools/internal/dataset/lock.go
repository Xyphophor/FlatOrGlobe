package dataset

import (
	"bufio"
	"bytes"
	"crypto/sha256"
	"encoding/hex"
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

// NormName is the file of the hashes without the lines an input's verify_skip names (sha256sum format, sorted).
const NormName = "inputs.norm"

// NormHash is the SHA-256 of b without the lines that match skip (each kept line ends with "\n").
func NormHash(b []byte, skip *regexp.Regexp) string {
	var keep bytes.Buffer
	for _, l := range strings.SplitAfter(string(b), "\n") {
		if l == "" || skip.MatchString(strings.TrimRight(l, "\r\n")) {
			continue
		}
		keep.WriteString(strings.TrimRight(l, "\r\n") + "\n")
	}
	h := sha256.Sum256(keep.Bytes())
	return hex.EncodeToString(h[:])
}

// ReadNorm reads inputs.norm (absent: an empty map).
func ReadNorm(root string, d *Dataset) (map[string]string, error) {
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(d.Dir), NormName))
	if os.IsNotExist(err) {
		return map[string]string{}, nil
	}
	if err != nil {
		return nil, err
	}
	out := map[string]string{}
	for _, l := range strings.Split(string(b), "\n") {
		if m := lockLine.FindStringSubmatch(l); m != nil {
			out[m[2]] = m[1]
		}
	}
	return out, nil
}

// writeNorm writes inputs.norm for the files of inputs with a verify_skip that are on disk (others kept).
func writeNorm(root string, d *Dataset, files []string) error {
	old, _ := ReadNorm(root, d)
	sums := map[string]string{}
	for _, f := range files {
		in, ok := d.InputOf(f)
		if !ok || in.VerifySkip == "" {
			continue
		}
		b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(d.Dir), filepath.FromSlash(f)))
		if err != nil {
			return err
		}
		sums[f] = NormHash(b, regexp.MustCompile(in.VerifySkip))
	}
	for f, s := range old {
		if _, ok := sums[f]; !ok {
			if in, ok := d.InputOf(f); ok && in.VerifySkip != "" {
				sums[f] = s
			}
		}
	}
	p := filepath.Join(root, filepath.FromSlash(d.Dir), NormName)
	if len(sums) == 0 {
		os.Remove(p)
		return nil
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
	return os.WriteFile(p, []byte(b.String()), 0o644)
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
	if err := os.WriteFile(p, []byte(b.String()), 0o644); err != nil {
		return 0, err
	}
	return len(names), writeNorm(root, d, files)
}
