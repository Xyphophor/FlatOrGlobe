// Package las reads LiDAR point clouds (LAS/LAZ) through laz2pts, a small
// C++ front end to LASzip (rapidlasso, vendored unchanged in
// tools/third_party/laszip, built by `make laz2pts`): fog stays a pure-Go
// binary and runs the decoder as a subprocess, as it does crx2rnx (epic24).
package las

import (
	"bufio"
	"encoding/binary"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path/filepath"
)

// Bin is laz2pts, relative to the repository root.
const Bin = "tools/bin/laz2pts"

// Points is a chunk of points, x/y/z scaled as laspy scales them
// (X * scale + offset, in float64).
type Points struct {
	X, Y, Z []float64
	Class   []uint8 // full byte for point formats 6-10, 5 bits for 0-5
	GPS     []float64
}

// Len is the number of points.
func (p *Points) Len() int { return len(p.X) }

// Append adds point i of q.
func (p *Points) Append(q *Points, i int) {
	p.X = append(p.X, q.X[i])
	p.Y = append(p.Y, q.Y[i])
	p.Z = append(p.Z, q.Z[i])
	p.Class = append(p.Class, q.Class[i])
	p.GPS = append(p.GPS, q.GPS[i])
}

// Concat appends all of q.
func (p *Points) Concat(q *Points) {
	p.X = append(p.X, q.X...)
	p.Y = append(p.Y, q.Y...)
	p.Z = append(p.Z, q.Z...)
	p.Class = append(p.Class, q.Class...)
	p.GPS = append(p.GPS, q.GPS...)
}

const recLen = 21

// Read streams the file in chunks of at most chunk points to fn, in file
// order. The chunk is reused: fn must copy what it keeps.
func Read(root, path string, chunk int, fn func(*Points) error) error {
	bin := filepath.Join(root, Bin)
	if _, err := os.Stat(bin); err != nil {
		return fmt.Errorf("%s missing: make laz2pts (LASzip, tools/third_party/laszip)", Bin)
	}
	cmd := exec.Command(bin, path)
	cmd.Stderr = os.Stderr
	out, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	if err := cmd.Start(); err != nil {
		return err
	}
	rerr := decode(bufio.NewReaderSize(out, 1<<20), chunk, fn)
	if rerr != nil {
		_ = cmd.Process.Kill()
		_ = cmd.Wait()
		return fmt.Errorf("%s: %w", filepath.Base(path), rerr)
	}
	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("laz2pts %s: %w", filepath.Base(path), err)
	}
	return nil
}

func decode(r io.Reader, chunk int, fn func(*Points) error) error {
	var h [60]byte
	if _, err := io.ReadFull(r, h[:]); err != nil {
		return err
	}
	if string(h[:4]) != "LZP1" {
		return fmt.Errorf("not a laz2pts stream")
	}
	n := binary.LittleEndian.Uint64(h[4:])
	var sc [6]float64
	for i := range sc {
		sc[i] = math.Float64frombits(binary.LittleEndian.Uint64(h[12+8*i:]))
	}
	p := &Points{}
	buf := make([]byte, recLen*chunk)
	for left := n; left > 0; {
		k := min(uint64(chunk), left)
		b := buf[:recLen*k]
		if _, err := io.ReadFull(r, b); err != nil {
			return err
		}
		p.X, p.Y, p.Z, p.Class, p.GPS = p.X[:0], p.Y[:0], p.Z[:0], p.Class[:0], p.GPS[:0]
		for i := 0; i < int(k); i++ {
			o := b[recLen*i:]
			X := float64(int32(binary.LittleEndian.Uint32(o)))
			Y := float64(int32(binary.LittleEndian.Uint32(o[4:])))
			Z := float64(int32(binary.LittleEndian.Uint32(o[8:])))
			p.X = append(p.X, float64(X*sc[0])+sc[3])
			p.Y = append(p.Y, float64(Y*sc[1])+sc[4])
			p.Z = append(p.Z, float64(Z*sc[2])+sc[5])
			p.Class = append(p.Class, o[12])
			p.GPS = append(p.GPS, math.Float64frombits(binary.LittleEndian.Uint64(o[13:])))
		}
		if err := fn(p); err != nil {
			return err
		}
		left -= k
	}
	return nil
}
