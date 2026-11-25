package seiswaves

import (
	"encoding/binary"
	"fmt"
	"sort"
	"strings"
	"time"
)

// Record is one decoded miniSEED (v2) data record.
type Record struct {
	Sta, Loc, Cha string
	Start         time.Time
	Rate          float64
	X             []int32
}

// Decode reads a miniSEED v2 byte stream (fixed header, blockette 1000,
// big-endian, Steim1 or Steim2 data; SEED Reference Manual v2.4, ch. 8 and
// appendix B). Only data records are kept.
func Decode(b []byte) ([]Record, error) {
	var out []Record
	be := binary.BigEndian
	for off := 0; off+64 <= len(b); {
		h := b[off:]
		if h[6] != 'D' && h[6] != 'R' && h[6] != 'Q' && h[6] != 'M' {
			return nil, fmt.Errorf("offset %d: not a data record (%q)", off, h[6])
		}
		ns := int(be.Uint16(h[30:]))
		fac, mul := int16(be.Uint16(h[32:])), int16(be.Uint16(h[34:]))
		dataOff := int(be.Uint16(h[44:]))
		bl := int(be.Uint16(h[46:]))
		enc, recLen := -1, 0
		for bl != 0 && bl+8 <= len(h) {
			typ, next := be.Uint16(h[bl:]), int(be.Uint16(h[bl+2:]))
			if typ == 1000 {
				enc, recLen = int(h[bl+4]), 1<<h[bl+6]
				if h[bl+5] != 1 {
					return nil, fmt.Errorf("offset %d: little-endian record", off)
				}
			}
			bl = next
		}
		if recLen == 0 || off+recLen > len(b) {
			return nil, fmt.Errorf("offset %d: no blockette 1000 or truncated", off)
		}
		r := Record{Sta: strings.TrimSpace(string(h[8:13])), Loc: strings.TrimSpace(string(h[13:15])), Cha: strings.TrimSpace(string(h[15:18]))}
		r.Start = time.Date(int(be.Uint16(h[20:])), 1, 1, int(h[24]), int(h[25]), int(h[26]), int(be.Uint16(h[28:]))*100000, time.UTC).
			AddDate(0, 0, int(be.Uint16(h[22:]))-1)
		r.Rate = rate(fac, mul)
		if enc == 0 || ns == 0 { // ASCII (opaque) records and empty ones carry no samples
			off += recLen
			continue
		}
		var err error
		switch enc {
		case 10, 11:
			r.X, err = steim(h[dataOff:recLen], ns, enc == 11)
		default:
			err = fmt.Errorf("encoding %d not handled", enc)
		}
		if err != nil {
			return nil, fmt.Errorf("offset %d: %w", off, err)
		}
		out = append(out, r)
		off += recLen
	}
	return out, nil
}

func rate(fac, mul int16) float64 {
	f, m := float64(fac), float64(mul)
	switch {
	case fac > 0 && mul > 0:
		return f * m
	case fac > 0 && mul < 0:
		return -f / m
	case fac < 0 && mul > 0:
		return -m / f
	case fac < 0 && mul < 0:
		return 1 / (f * m)
	}
	return 0
}

func sext(v uint32, bits uint) int32 { return int32(v<<(32-bits)) >> (32 - bits) }

// steim decodes Steim1 / Steim2 frames: 64-byte frames of sixteen 32-bit
// words, the first a word of 2-bit codes; frame 0 holds X0 (first sample)
// and Xn (last sample, a check) in words 1 and 2.
func steim(b []byte, n int, two bool) ([]int32, error) {
	be := binary.BigEndian
	var d []int32
	var x0, xn int32
	for f := 0; f+64 <= len(b) && len(d) < n+1; f += 64 {
		ctl := be.Uint32(b[f:])
		for w := 1; w < 16; w++ {
			v := be.Uint32(b[f+4*w:])
			c := (ctl >> (30 - 2*uint(w))) & 3
			if f == 0 && (w == 1 || w == 2) {
				if w == 1 {
					x0 = int32(v)
				} else {
					xn = int32(v)
				}
				continue
			}
			switch {
			case c == 0:
			case c == 1:
				for k := 0; k < 4; k++ {
					d = append(d, sext(v>>(24-8*uint(k)), 8))
				}
			case !two && c == 2:
				d = append(d, sext(v>>16, 16), sext(v, 16))
			case !two && c == 3:
				d = append(d, int32(v))
			case two && c == 2:
				switch v >> 30 {
				case 1:
					d = append(d, sext(v, 30))
				case 2:
					d = append(d, sext(v>>15, 15), sext(v, 15))
				case 3:
					d = append(d, sext(v>>20, 10), sext(v>>10, 10), sext(v, 10))
				}
			case two && c == 3:
				switch v >> 30 {
				case 0:
					for k := 0; k < 5; k++ {
						d = append(d, sext(v>>(24-6*uint(k)), 6))
					}
				case 1:
					for k := 0; k < 6; k++ {
						d = append(d, sext(v>>(25-5*uint(k)), 5))
					}
				case 2:
					for k := 0; k < 7; k++ {
						d = append(d, sext(v>>(24-4*uint(k)), 4))
					}
				}
			}
		}
	}
	if len(d) < n {
		return nil, fmt.Errorf("%d differences for %d samples", len(d), n)
	}
	x := make([]int32, n)
	x[0] = x0
	for i := 1; i < n; i++ { // d[0] is relative to the previous record
		x[i] = x[i-1] + d[i]
	}
	if n > 0 && x[n-1] != xn {
		return nil, fmt.Errorf("Steim check: last sample %d, frame says %d", x[n-1], xn)
	}
	return x, nil
}

// Trace joins one channel's records into a uniform series (gaps refused).
type Trace struct {
	Start time.Time
	Rate  float64
	X     []float64
}

func Join(rs []Record, cha string) (Trace, error) {
	var sel []Record
	for _, r := range rs {
		if r.Cha == cha {
			sel = append(sel, r)
		}
	}
	if len(sel) == 0 {
		return Trace{}, fmt.Errorf("no %s records", cha)
	}
	sort.Slice(sel, func(i, j int) bool { return sel[i].Start.Before(sel[j].Start) })
	t := Trace{Start: sel[0].Start, Rate: sel[0].Rate}
	for _, r := range sel {
		want := t.Start.Add(time.Duration(float64(len(t.X)) / t.Rate * float64(time.Second)))
		if gap := r.Start.Sub(want).Seconds() * t.Rate; gap > 0.5 || gap < -0.5 {
			if gap < -0.5 && -gap >= float64(len(r.X)) { // a duplicate record
				continue
			}
			return Trace{}, fmt.Errorf("%s: gap of %.1f samples at %s", cha, gap, r.Start.Format(time.RFC3339))
		}
		for _, v := range r.X {
			t.X = append(t.X, float64(v))
		}
	}
	return t, nil
}
