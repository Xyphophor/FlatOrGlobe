// Package exif reads the few EXIF fields the data chain needs from a JPEG
// (APP1 "Exif" segment, TIFF structure, either byte order): the image
// description and software of IFD0, the capture time and lens of the Exif
// IFD, and the position, altitude and heading of the GPS IFD. Reference:
// JEITA CP-3451C, Exchangeable image file format for digital still cameras
// (Exif 2.32), CIPA DC-008 (2019), §4.6.
package exif

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"math"
)

// Info is what is read.
type Info struct {
	Description, Software, Model, Lens   string
	DateTimeOriginal, OffsetTimeOriginal string // "2025:09:05 07:35:50", "-05:00"
	Width, Height, Focal35               int
	Lat, Lon                             float64 // degrees, north and east positive
	Alt                                  float64 // GPS altitude, m (negative below the reference)
	ImgDir                               float64 // direction of the image, degrees
	ImgDirRef                            string  // "T" true north, "M" magnetic
	HasGPS                               bool
}

type reader struct {
	b  []byte
	bo binary.ByteOrder
}

func (r *reader) u16(o int) int { return int(r.bo.Uint16(r.b[o:])) }
func (r *reader) u32(o int) int { return int(r.bo.Uint32(r.b[o:])) }

type entry struct{ typ, cnt, val int }

// ifd reads one IFD at offset o: tag -> entry (val = offset of the value or of
// the inline bytes).
func (r *reader) ifd(o int) (map[int]entry, error) {
	if o <= 0 || o+2 > len(r.b) {
		return nil, fmt.Errorf("exif: IFD offset %d out of range", o)
	}
	n := r.u16(o)
	out := map[int]entry{}
	for k := 0; k < n; k++ {
		e := o + 2 + 12*k
		if e+12 > len(r.b) {
			return nil, errors.New("exif: truncated IFD")
		}
		typ, cnt := r.u16(e+2), r.u32(e+4)
		size := map[int]int{1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8}[typ] * cnt
		val := e + 8
		if size > 4 {
			val = r.u32(e + 8)
		}
		if val+size > len(r.b) {
			continue
		}
		out[r.u16(e)] = entry{typ, cnt, val}
	}
	return out, nil
}

func (r *reader) str(e entry) string {
	return string(bytes.TrimRight(r.b[e.val:e.val+e.cnt], "\x00 "))
}

func (r *reader) num(e entry) int {
	if e.typ == 3 {
		return r.u16(e.val)
	}
	return r.u32(e.val)
}

func (r *reader) rats(e entry) []float64 {
	out := make([]float64, e.cnt)
	for i := range out {
		a, b := r.u32(e.val+8*i), r.u32(e.val+8*i+4)
		if e.typ == 10 {
			a, b = int(int32(a)), int(int32(b))
		}
		if b != 0 {
			out[i] = float64(a) / float64(b)
		}
	}
	return out
}

// Read parses the EXIF of a JPEG file's bytes.
func Read(jpg []byte) (*Info, error) {
	i := bytes.Index(jpg, []byte("Exif\x00\x00"))
	if i < 0 {
		return nil, errors.New("exif: no Exif segment")
	}
	t := jpg[i+6:]
	r := &reader{b: t}
	switch string(t[:2]) {
	case "II":
		r.bo = binary.LittleEndian
	case "MM":
		r.bo = binary.BigEndian
	default:
		return nil, errors.New("exif: bad byte order")
	}
	ifd0, err := r.ifd(r.u32(4))
	if err != nil {
		return nil, err
	}
	in := &Info{}
	get := func(m map[int]entry, tag int) (entry, bool) { e, ok := m[tag]; return e, ok }
	if e, ok := get(ifd0, 0x010e); ok {
		in.Description = r.str(e)
	}
	if e, ok := get(ifd0, 0x0131); ok {
		in.Software = r.str(e)
	}
	if e, ok := get(ifd0, 0x0110); ok {
		in.Model = r.str(e)
	}
	if e, ok := get(ifd0, 0x8769); ok {
		ex, err := r.ifd(r.num(e))
		if err != nil {
			return nil, err
		}
		if e, ok := get(ex, 0x9003); ok {
			in.DateTimeOriginal = r.str(e)
		}
		if e, ok := get(ex, 0x9011); ok {
			in.OffsetTimeOriginal = r.str(e)
		}
		if e, ok := get(ex, 0xa434); ok {
			in.Lens = r.str(e)
		}
		if e, ok := get(ex, 0xa002); ok {
			in.Width = r.num(e)
		}
		if e, ok := get(ex, 0xa003); ok {
			in.Height = r.num(e)
		}
		if e, ok := get(ex, 0xa405); ok {
			in.Focal35 = r.num(e)
		}
	}
	if e, ok := get(ifd0, 0x8825); ok {
		g, err := r.ifd(r.num(e))
		if err != nil {
			return nil, err
		}
		dms := func(tag int) (float64, bool) {
			e, ok := get(g, tag)
			if !ok || e.cnt < 3 {
				return 0, false
			}
			v := r.rats(e)
			return v[0] + v[1]/60 + v[2]/3600, true
		}
		la, ok1 := dms(2)
		lo, ok2 := dms(4)
		if ok1 && ok2 {
			in.HasGPS = true
			if e, ok := get(g, 1); ok && r.str(e) == "S" {
				la = -la
			}
			if e, ok := get(g, 3); ok && r.str(e) == "W" {
				lo = -lo
			}
			in.Lat, in.Lon = la, lo
		}
		if e, ok := get(g, 6); ok {
			in.Alt = r.rats(e)[0]
			if e, ok := get(g, 5); ok && r.b[e.val] == 1 {
				in.Alt = -in.Alt
			}
		}
		if e, ok := get(g, 17); ok {
			in.ImgDir = r.rats(e)[0]
		}
		if e, ok := get(g, 16); ok {
			in.ImgDirRef = r.str(e)
		}
	}
	if math.IsNaN(in.Alt) {
		in.Alt = 0
	}
	return in, nil
}
