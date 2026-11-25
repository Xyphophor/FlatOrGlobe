// Package dem reads the elevation models the data chain uses: tiled
// GeoTIFF (Copernicus GLO-30, the Austrian BEV ALS DTM), without GDAL.
// Port of research/cop_dem.py and the decoder of research/bev_lzw.c
// (epic24/UC04): classic little-endian TIFF, DEFLATE (8) or LZW (5)
// tiles, horizontal predictor 1 (none) or 3 (floating point), float32.
package dem

import (
	"bytes"
	"compress/zlib"
	"encoding/binary"
	"fmt"
	"io"
	"math"
)

// Raster is a decoded float32 image, row-major, north row first.
type Raster struct {
	W, H int
	V    []float32
}

// At is the value at (row, col).
func (r *Raster) At(i, j int) float32 { return r.V[i*r.W+j] }

type ifd map[uint16]struct {
	typ uint16
	cnt uint32
	raw [4]byte
}

func (t ifd) ints(b []byte, tag uint16) ([]uint64, error) {
	e, ok := t[tag]
	if !ok {
		return nil, fmt.Errorf("TIFF tag %d missing", tag)
	}
	size := map[uint16]int{3: 2, 4: 4, 16: 8}[e.typ]
	if size == 0 {
		return nil, fmt.Errorf("TIFF tag %d: type %d not handled", tag, e.typ)
	}
	data := e.raw[:]
	if int(e.cnt)*size > 4 {
		off := binary.LittleEndian.Uint32(e.raw[:])
		end := uint64(off) + uint64(e.cnt)*uint64(size)
		if end > uint64(len(b)) {
			return nil, fmt.Errorf("TIFF tag %d: values past the end of the file", tag)
		}
		data = b[off:end]
	}
	out := make([]uint64, e.cnt)
	for i := range out {
		switch size {
		case 2:
			out[i] = uint64(binary.LittleEndian.Uint16(data[2*i:]))
		case 4:
			out[i] = uint64(binary.LittleEndian.Uint32(data[4*i:]))
		case 8:
			out[i] = binary.LittleEndian.Uint64(data[8*i:])
		}
	}
	return out, nil
}

// DecodeTIFF decodes the first image of a tiled float32 TIFF held in b.
func DecodeTIFF(b []byte) (*Raster, error) {
	if len(b) < 8 || string(b[:4]) != "II*\x00" {
		return nil, fmt.Errorf("classic little-endian TIFF expected")
	}
	off := binary.LittleEndian.Uint32(b[4:8])
	if int(off)+2 > len(b) {
		return nil, fmt.Errorf("TIFF: bad IFD offset")
	}
	n := int(binary.LittleEndian.Uint16(b[off:]))
	t := ifd{}
	for i := 0; i < n; i++ {
		e := b[int(off)+2+12*i:]
		var raw [4]byte
		copy(raw[:], e[8:12])
		t[binary.LittleEndian.Uint16(e)] = struct {
			typ uint16
			cnt uint32
			raw [4]byte
		}{binary.LittleEndian.Uint16(e[2:]), binary.LittleEndian.Uint32(e[4:]), raw}
	}
	get1 := func(tag uint16, def uint64) (uint64, error) {
		if _, ok := t[tag]; !ok && def != math.MaxUint64 {
			return def, nil
		}
		v, err := t.ints(b, tag)
		if err != nil {
			return 0, err
		}
		return v[0], nil
	}
	W, err := get1(256, math.MaxUint64)
	if err != nil {
		return nil, err
	}
	H, err := get1(257, math.MaxUint64)
	if err != nil {
		return nil, err
	}
	tw, err := get1(322, math.MaxUint64)
	if err != nil {
		return nil, err
	}
	th, err := get1(323, math.MaxUint64)
	if err != nil {
		return nil, err
	}
	comp, err := get1(259, 1)
	if err != nil {
		return nil, err
	}
	pred, err := get1(317, 1)
	if err != nil {
		return nil, err
	}
	if (comp != 8 && comp != 5) || (pred != 1 && pred != 3) {
		return nil, fmt.Errorf("TIFF: compression %d / predictor %d not handled", comp, pred)
	}
	offs, err := t.ints(b, 324)
	if err != nil {
		return nil, err
	}
	cnts, err := t.ints(b, 325)
	if err != nil {
		return nil, err
	}
	nx := int((W + tw - 1) / tw)
	r := &Raster{W: int(W), H: int(H), V: make([]float32, W*H)}
	for i := range r.V {
		r.V[i] = float32(math.NaN())
	}
	need := int(tw * th * 4)
	for k := range offs {
		if k >= len(cnts) || cnts[k] == 0 {
			continue
		}
		o, c := offs[k], cnts[k]
		if o+c > uint64(len(b)) {
			return nil, fmt.Errorf("TIFF tile %d past the end of the file", k)
		}
		var buf []byte
		if comp == 8 {
			zr, err := zlib.NewReader(bytes.NewReader(b[o : o+c]))
			if err != nil {
				return nil, fmt.Errorf("tile %d: %w", k, err)
			}
			if buf, err = io.ReadAll(zr); err != nil {
				return nil, fmt.Errorf("tile %d: %w", k, err)
			}
		} else {
			buf = make([]byte, need)
			if n := LZWDecode(b[o:o+c], buf); n != need {
				return nil, fmt.Errorf("tile %d: invalid LZW block (%d bytes, %d expected)", k, n, need)
			}
		}
		if len(buf) < need {
			return nil, fmt.Errorf("tile %d: %d bytes, %d expected", k, len(buf), need)
		}
		if pred == 3 {
			FPPredictor(buf, int(tw), int(th))
		}
		bi, bj := k/nx, k%nx
		for y := 0; y < int(th); y++ {
			row := bi*int(th) + y
			if row >= r.H {
				break
			}
			for x := 0; x < int(tw); x++ {
				col := bj*int(tw) + x
				if col >= r.W {
					break
				}
				r.V[row*r.W+col] = math.Float32frombits(binary.LittleEndian.Uint32(buf[4*(y*int(tw)+x):]))
			}
		}
	}
	return r, nil
}

// LZWDecode is TIFF's LZW (compression 5): codes MSB first, 9 to 12 bits,
// Clear 256, EOI 257, early change. It returns the bytes written, or -1 on
// an invalid stream (research/bev_lzw.c, line for line).
func LZWDecode(in, out []byte) int {
	var st, ln [4096]int
	ip, pos, nbits, next, old, oldpos, oldlen := 0, 0, 9, 258, -1, 0, 0
	var buf uint32
	bits := 0
	for {
		for bits < nbits {
			if ip >= len(in) {
				return pos // truncated stream without EOI: what we have
			}
			buf = buf<<8 | uint32(in[ip])
			ip++
			bits += 8
		}
		code := int((buf >> (bits - nbits)) & (1<<nbits - 1))
		bits -= nbits
		if code == 257 {
			break
		}
		if code == 256 {
			nbits, next, old = 9, 258, -1
			continue
		}
		var curlen int
		if old < 0 {
			if code > 255 || pos >= len(out) {
				return -1
			}
			out[pos] = byte(code)
			curlen = 1
		} else {
			switch {
			case code < 256:
				if pos >= len(out) {
					return -1
				}
				out[pos] = byte(code)
				curlen = 1
			case code < next:
				curlen = ln[code]
				if pos+curlen > len(out) {
					return -1
				}
				copy(out[pos:pos+curlen], out[st[code]:st[code]+curlen])
			case code == next: // KwKwK: the previous string + its first byte
				curlen = oldlen + 1
				if pos+curlen > len(out) {
					return -1
				}
				copy(out[pos:pos+oldlen], out[oldpos:oldpos+oldlen])
				out[pos+oldlen] = out[oldpos]
			default:
				return -1
			}
			if next < 4096 {
				st[next], ln[next] = oldpos, oldlen+1
				next++
			}
			if next >= 1<<nbits-1 && nbits < 12 {
				nbits++
			}
		}
		old, oldpos, oldlen = code, pos, curlen
		pos += curlen
	}
	return pos
}

// FPPredictor undoes TIFF predictor 3 (floating point) in place: each row
// of w floats is stored most significant byte first, by byte planes, then
// differenced byte by byte (libtiff fpAcc).
func FPPredictor(buf []byte, w, h int) {
	n := 4 * w
	tmp := make([]byte, n)
	for r := 0; r < h; r++ {
		row := buf[r*n : (r+1)*n]
		for i := 1; i < n; i++ {
			row[i] += row[i-1]
		}
		copy(tmp, row)
		for i := 0; i < w; i++ {
			for b := 0; b < 4; b++ {
				row[4*i+b] = tmp[(3-b)*w+i]
			}
		}
	}
}
