// Package csvx reads the hand-made CSV files of data/: lines starting with
// '#' are comments, the first remaining line is the header, and each row
// is addressed by column name, like Python's csv.DictReader over
// (l for l in f if not l.startswith("#")).
package csvx

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"strings"
)

// Row is one record. A column the line is too short for is absent (Get
// reports ok=false), as DictReader gives None there.
type Row struct {
	Line   int // 1-based line in the file, for error messages
	fields map[string]string
}

// Get returns the cell of column k.
func (r Row) Get(k string) (string, bool) {
	v, ok := r.fields[k]
	return v, ok
}

// Must returns the cell of column k or an error naming the line.
func (r Row) Must(k string) (string, error) {
	v, ok := r.fields[k]
	if !ok {
		return "", fmt.Errorf("line %d: no value for column %q", r.Line, k)
	}
	return v, nil
}

// Table is a parsed file.
type Table struct {
	Header []string
	Rows   []Row
}

// ReadFile parses path.
func ReadFile(path string) (*Table, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	t, err := Parse(b)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return t, nil
}

// Parse parses CSV bytes. Comment lines are blanked rather than removed
// so that line numbers stay those of the file.
func Parse(b []byte) (*Table, error) {
	var kept bytes.Buffer
	sc := bufio.NewScanner(bytes.NewReader(b))
	sc.Buffer(make([]byte, 0, 64*1024), 16*1024*1024)
	for sc.Scan() {
		l := sc.Text()
		if !strings.HasPrefix(l, "#") {
			kept.WriteString(l)
		}
		kept.WriteByte('\n')
	}
	if err := sc.Err(); err != nil {
		return nil, err
	}
	r := csv.NewReader(&kept)
	r.FieldsPerRecord = -1
	t := &Table{}
	for {
		rec, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		line, _ := r.FieldPos(0)
		if t.Header == nil {
			t.Header = rec
			continue
		}
		if len(rec) > len(t.Header) {
			return nil, fmt.Errorf("line %d: %d fields for %d columns", line, len(rec), len(t.Header))
		}
		m := make(map[string]string, len(rec))
		for i, v := range rec {
			m[t.Header[i]] = v
		}
		t.Rows = append(t.Rows, Row{Line: line, fields: m})
	}
	if t.Header == nil {
		return nil, fmt.Errorf("no header line")
	}
	return t, nil
}
