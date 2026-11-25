// Package spk reads JPL planetary ephemerides in the NAIF SPK format (a DAF file of Chebyshev segments), enough to
// evaluate the position of a body relative to another at a given TDB instant: DE440 (de440.bsp) for the Sun, Venus, the
// Earth-Moon barycentre, the Earth and the Moon.
//
// Format (NAIF, "DAF Required Reading" and "SPK Required Reading"): a 1024-byte file record ("DAF/SPK ", ND = 2,
// NI = 6, FWARD the first summary record, LOCFMT "LTL-IEEE" for little-endian), then summary records holding, for each
// segment, its start and end epochs (TDB seconds past J2000) and six integers: target, centre, frame, data type,
// first and last address (1-based double-precision words). Type 2 segments store, after their records, INIT, INTLEN,
// RSIZE and N; each record is MID, RADIUS and the Chebyshev coefficients of x, y and z (km), evaluated at
// τ = (t − MID)/RADIUS. Positions are in the ICRF (frame 1, "J2000").
//
// Reference: W. M. Folkner, J. G. Williams, D. H. Boggs, R. S. Park and P. Kuchynka, "The Planetary and Lunar
// Ephemerides DE430 and DE431", IPN Progress Report 42-196 (2014); R. S. Park et al., "The JPL Planetary and Lunar
// Ephemerides DE440 and DE441", Astron. J. 161:105 (2021); NAIF, SPK Required Reading (naif.jpl.nasa.gov).
package spk

import (
	"encoding/binary"
	"fmt"
	"io"
	"math"
	"os"
)

// NAIF body codes used here.
const (
	SSB   = 0   // solar-system barycentre
	Venus = 2   // Venus barycentre (Venus has no moon: its centre, to the millimetre)
	EMB   = 3   // Earth-Moon barycentre
	Jup   = 5   // Jupiter system barycentre (sun-romer: the shape of the orbits, a check variant)
	Sun   = 10  // Sun
	Moon  = 301 // Moon
	Earth = 399 // Earth
)

type segment struct {
	target, center, typ int
	t0, t1              float64 // TDB seconds past J2000
	init, intlen        float64
	rsize, n            int
	addr                int64 // byte offset of the first record
}

// File is an open SPK file. Segments are read lazily, record by record, so a 114 MB DE440 costs a few kilobytes of
// memory; the last record read per segment is cached (eclipses are clustered in time).
type File struct {
	r    io.ReaderAt
	f    *os.File
	segs []segment
	last map[int]cache
}

type cache struct {
	idx  int
	data []float64
}

// Open reads the summaries of an SPK file.
func Open(path string) (*File, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	s, err := read(f)
	if err != nil {
		f.Close()
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	s.f = f
	return s, nil
}

// Close closes the underlying file.
func (s *File) Close() error {
	if s.f != nil {
		return s.f.Close()
	}
	return nil
}

func read(r io.ReaderAt) (*File, error) {
	rec := make([]byte, 1024)
	if _, err := r.ReadAt(rec, 0); err != nil {
		return nil, err
	}
	if string(rec[:7]) != "DAF/SPK" {
		return nil, fmt.Errorf("not an SPK file (%q)", rec[:8])
	}
	if string(rec[88:96]) != "LTL-IEEE" {
		return nil, fmt.Errorf("only little-endian SPK files are read (%q)", rec[88:96])
	}
	le := binary.LittleEndian
	nd, ni := int(le.Uint32(rec[8:])), int(le.Uint32(rec[12:]))
	if nd != 2 || ni != 6 {
		return nil, fmt.Errorf("ND=%d NI=%d, expected 2 and 6", nd, ni)
	}
	next := int64(le.Uint32(rec[76:]))
	s := &File{r: r, last: map[int]cache{}}
	f64 := func(b []byte) float64 { return math.Float64frombits(le.Uint64(b)) }
	for next > 0 {
		if _, err := r.ReadAt(rec, (next-1)*1024); err != nil {
			return nil, err
		}
		nsum := int(f64(rec[16:]))
		for i := 0; i < nsum; i++ {
			b := rec[24+i*40:] // a summary is ND doubles + NI ints packed in (NI+1)/2 doubles: 5 doubles
			sg := segment{t0: f64(b), t1: f64(b[8:])}
			ints := make([]int, 6)
			for k := range ints {
				ints[k] = int(int32(le.Uint32(b[16+4*k:])))
			}
			sg.target, sg.center, sg.typ = ints[0], ints[1], ints[3]
			if ints[2] != 1 {
				return nil, fmt.Errorf("segment %d/%d in frame %d, only ICRF (1) is read", sg.target, sg.center, ints[2])
			}
			end := int64(ints[5])
			tail := make([]byte, 32)
			if _, err := r.ReadAt(tail, (end-4)*8); err != nil {
				return nil, err
			}
			sg.init, sg.intlen = f64(tail), f64(tail[8:])
			sg.rsize, sg.n = int(f64(tail[16:])), int(f64(tail[24:]))
			sg.addr = (int64(ints[4]) - 1) * 8
			s.segs = append(s.segs, sg)
		}
		next = int64(f64(rec[0:]))
	}
	return s, nil
}

// pos is the position (km, ICRF) of target relative to center at t (TDB seconds past J2000), from one segment.
func (s *File) pos(target, center int, t float64) ([3]float64, error) {
	for i, sg := range s.segs {
		if sg.target != target || sg.center != center || t < sg.t0 || t > sg.t1 {
			continue
		}
		if sg.typ != 2 {
			return [3]float64{}, fmt.Errorf("segment %d/%d of type %d, only type 2 is read", target, center, sg.typ)
		}
		idx := int((t - sg.init) / sg.intlen)
		if idx >= sg.n {
			idx = sg.n - 1
		}
		c, ok := s.last[i]
		if !ok || c.idx != idx {
			b := make([]byte, sg.rsize*8)
			if _, err := s.r.ReadAt(b, sg.addr+int64(idx*sg.rsize*8)); err != nil {
				return [3]float64{}, err
			}
			c = cache{idx: idx, data: make([]float64, sg.rsize)}
			for k := range c.data {
				c.data[k] = math.Float64frombits(binary.LittleEndian.Uint64(b[8*k:]))
			}
			s.last[i] = c
		}
		mid, rad := c.data[0], c.data[1]
		ncoef := (sg.rsize - 2) / 3
		tau := (t - mid) / rad
		var out [3]float64
		for k := 0; k < 3; k++ {
			out[k] = cheb(c.data[2+k*ncoef:2+(k+1)*ncoef], tau)
		}
		return out, nil
	}
	return [3]float64{}, fmt.Errorf("no segment for %d relative to %d at %.0f s TDB", target, center, t)
}

// cheb evaluates Σ c_k T_k(x) by Clenshaw's recurrence.
func cheb(c []float64, x float64) float64 {
	var b1, b2 float64
	for k := len(c) - 1; k >= 1; k-- {
		b1, b2 = 2*x*b1-b2+c[k], b1
	}
	return x*b1 - b2 + c[0]
}

// Bary is the position (km, ICRF) of the Sun, Venus, Jupiter's barycentre, the Earth-Moon barycentre, the Earth or the Moon relative to the solar-system barycentre at t
// (TDB seconds past J2000), chaining the DE segments (Earth and Moon through the Earth-Moon barycentre).
func (s *File) Bary(body int, t float64) ([3]float64, error) {
	add := func(a, b [3]float64) [3]float64 { return [3]float64{a[0] + b[0], a[1] + b[1], a[2] + b[2]} }
	switch body {
	case Sun, Venus, Jup, EMB:
		return s.pos(body, SSB, t)
	case Earth, Moon:
		emb, err := s.pos(EMB, SSB, t)
		if err != nil {
			return emb, err
		}
		p, err := s.pos(body, EMB, t)
		return add(emb, p), err
	}
	return [3]float64{}, fmt.Errorf("body %d not chained", body)
}
