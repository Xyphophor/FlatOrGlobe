package dem

import (
	"bytes"
	"compress/zlib"
	"encoding/binary"
	"math"
	"testing"
)

// A literal-only LZW stream: Clear, 'a', 'b', 'c', EOI in 9-bit codes.
func TestLZW(t *testing.T) {
	codes := []int{256, 'a', 'b', 'a', 'b', 258, 257} // "ab" is code 258
	var bits uint64
	n := 0
	var buf bytes.Buffer
	width := 9
	next := 258
	for i, c := range codes {
		bits = bits<<width | uint64(c)
		n += width
		for n >= 8 {
			buf.WriteByte(byte(bits >> (n - 8)))
			n -= 8
		}
		if i > 1 && c != 256 && c != 257 {
			next++
		}
	}
	if n > 0 {
		buf.WriteByte(byte(bits << (8 - n)))
	}
	out := make([]byte, 16)
	got := LZWDecode(buf.Bytes(), out)
	if string(out[:got]) != "ababab" {
		t.Fatalf("decoded %q (%d bytes)", out[:max(got, 0)], got)
	}
	if LZWDecode([]byte{0xff, 0xff, 0xff}, out) != -1 {
		t.Error("invalid first code accepted")
	}
}

// One 2x2 tile, DEFLATE + floating-point predictor, round trip.
func TestDecodeTIFFDeflatePredictor(t *testing.T) {
	vals := []float32{1.5, -2.25, 1000.125, float32(math.NaN())}
	tw := 2
	// predictor 3 encoding: per row, byte planes MSB first, then differences
	var raw []byte
	for r := 0; r < 2; r++ {
		row := make([]byte, 4*tw)
		for i := 0; i < tw; i++ {
			u := math.Float32bits(vals[r*tw+i])
			for b := 0; b < 4; b++ {
				row[(3-b)*tw+i] = byte(u >> (8 * b))
			}
		}
		for i := len(row) - 1; i > 0; i-- {
			row[i] -= row[i-1]
		}
		raw = append(raw, row...)
	}
	var z bytes.Buffer
	zw := zlib.NewWriter(&z)
	zw.Write(raw)
	zw.Close()
	tile := z.Bytes()
	// TIFF: header, IFD with 9 entries, then the tile
	ent := [][3]uint32{{256, 3, 2}, {257, 3, 2}, {259, 3, 8}, {317, 3, 3}, {322, 3, 2}, {323, 3, 2}, {324, 4, 0}, {325, 4, uint32(len(tile))}}
	ifdOff := 8
	dataOff := ifdOff + 2 + 12*len(ent) + 4
	ent[6][2] = uint32(dataOff)
	b := []byte("II*\x00")
	b = binary.LittleEndian.AppendUint32(b, uint32(ifdOff))
	b = binary.LittleEndian.AppendUint16(b, uint16(len(ent)))
	for _, e := range ent {
		b = binary.LittleEndian.AppendUint16(b, uint16(e[0]))
		b = binary.LittleEndian.AppendUint16(b, uint16(e[1]))
		b = binary.LittleEndian.AppendUint32(b, 1)
		if e[1] == 3 {
			b = binary.LittleEndian.AppendUint16(b, uint16(e[2]))
			b = append(b, 0, 0)
		} else {
			b = binary.LittleEndian.AppendUint32(b, e[2])
		}
	}
	b = append(b, 0, 0, 0, 0)
	b = append(b, tile...)
	r, err := DecodeTIFF(b)
	if err != nil {
		t.Fatal(err)
	}
	for i, v := range vals {
		if math.Float32bits(r.V[i]) != math.Float32bits(v) {
			t.Errorf("value %d: %v, want %v", i, r.V[i], v)
		}
	}
}
