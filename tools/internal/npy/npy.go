// Package npy reproduces, bit for bit, the few numpy operations the data
// chain used (numpy 2.2, with the reference BLAS of Debian, as on the
// owner's machine). Each one is checked against numpy itself
// (testdata/numpy.json, written by numpy).
package npy

import (
	"math"
	"sort"
)

// Arange is np.arange(start, stop, step) for floats: n = ceil((stop -
// start) / step) values start + i*d, where d = (start + step) - start (not
// step: numpy fills from the first two values).
func Arange(start, stop, step float64) []float64 {
	n := int(math.Ceil((stop - start) / step))
	if n <= 0 {
		return nil
	}
	out := make([]float64, n)
	out[0] = start
	if n > 1 {
		out[1] = start + step
		d := out[1] - out[0]
		for i := 2; i < n; i++ {
			out[i] = start + float64(float64(i)*d)
		}
	}
	return out
}

// pairwise is numpy's pairwise_sum for float64 (blocks of 8, PW_BLOCKSIZE 128).
func pairwise(a []float64) float64 {
	n := len(a)
	switch {
	case n < 8:
		r := 0.0
		for _, x := range a {
			r += x
		}
		return r
	case n <= 128:
		var r [8]float64
		copy(r[:], a[:8])
		i := 8
		for ; i < n-n%8; i += 8 {
			for j := 0; j < 8; j++ {
				r[j] += a[i+j]
			}
		}
		res := ((r[0] + r[1]) + (r[2] + r[3])) + ((r[4] + r[5]) + (r[6] + r[7]))
		for ; i < n; i++ {
			res += a[i]
		}
		return res
	}
	n2 := n / 2
	n2 -= n2 % 8
	return pairwise(a[:n2]) + pairwise(a[n2:])
}

// Sum is np.sum of a contiguous float64 array: 0.0 + pairwise sum.
func Sum(a []float64) float64 { return 0.0 + pairwise(a) }

// NanStd is np.nanstd(a) (ddof 0): NaNs are replaced by 0 in place for the
// sums (they keep their slot in the pairwise blocks), the count excludes
// them. ok is false when every value is NaN.
func NanStd(a []float64) (float64, bool) {
	arr := make([]float64, len(a))
	cnt := 0
	for i, x := range a {
		if math.IsNaN(x) {
			continue
		}
		arr[i] = x
		cnt++
	}
	if cnt == 0 {
		return math.NaN(), false
	}
	avg := Sum(arr) / float64(cnt)
	for i, x := range a {
		if math.IsNaN(x) {
			arr[i] = 0
			continue
		}
		d := arr[i] - avg
		arr[i] = d * d
	}
	return math.Sqrt(Sum(arr) / float64(cnt)), true
}

// Interp is np.interp(x, xp, fp) for increasing xp, outside values clamped
// to fp[0] and fp[-1].
func Interp(x, xp, fp []float64) []float64 {
	out := make([]float64, len(x))
	n := len(xp)
	for i, v := range x {
		j := sort.SearchFloat64s(xp, v) // first xp[j] >= v
		switch {
		case math.IsNaN(v):
			out[i] = v
		case v < xp[0]:
			out[i] = fp[0]
		case v > xp[n-1]:
			out[i] = fp[n-1]
		case j < n && xp[j] == v:
			out[i] = fp[j] // numpy returns the node value exactly
		default:
			j-- // xp[j] < v < xp[j+1]
			slope := (fp[j+1] - fp[j]) / (xp[j+1] - xp[j])
			out[i] = float64(slope*(v-xp[j])) + fp[j]
			if math.IsNaN(out[i]) {
				out[i] = float64(slope*(v-xp[j+1])) + fp[j+1]
				if math.IsNaN(out[i]) && fp[j] == fp[j+1] {
					out[i] = fp[j]
				}
			}
		}
	}
	return out
}

// SearchSorted is np.searchsorted(a, v) (side left) for each v.
func SearchSorted(a, v []float64) []int {
	out := make([]int, len(v))
	for i, x := range v {
		out[i] = sort.SearchFloat64s(a, x)
	}
	return out
}

// RunningMean is np.convolve(x, np.ones(k)/k, "same"): every output is the
// window's products added in index order from 0.0 (numpy's small kernel
// loop and the reference BLAS ddot both add sequentially); the windows
// shrink at both ends.
func RunningMean(x []float64, k int) []float64 {
	w := 1.0 / float64(k)
	nLeft := k / 2
	out := make([]float64, len(x))
	for o := range x {
		lo, hi := o-nLeft, o-nLeft+k // window [lo, hi)
		if lo < 0 {
			lo = 0
		}
		if hi > len(x) {
			hi = len(x)
		}
		s := 0.0
		for j := lo; j < hi; j++ {
			s += float64(x[j] * w)
		}
		out[o] = s
	}
	return out
}

// Argmax is np.argmax: the first index of the largest value.
func Argmax(a []float64) int {
	best := 0
	for i, x := range a {
		if x > a[best] {
			best = i
		}
	}
	return best
}

// Percentile is np.percentile(a, q) with the default linear method:
// virtual index (n - 1) * q, then numpy's _lerp.
func Percentile(a []float64, qpc float64) float64 {
	s := append([]float64(nil), a...)
	sort.Float64s(s)
	n := float64(len(s))
	q := qpc / 100
	vi := (n - 1) * q
	if vi >= n-1 {
		return s[len(s)-1]
	}
	lo := math.Floor(vi)
	g := vi - lo
	i := int(lo)
	A, B := s[i], s[i+1]
	diff := B - A
	if g >= 0.5 {
		return B - float64(diff*(1-g))
	}
	return A + float64(diff*g)
}

// Median is np.median: the middle value, or the mean of the two middle
// ones, (a + b) / 2.
func Median(a []float64) float64 {
	s := append([]float64(nil), a...)
	sort.Float64s(s)
	n := len(s)
	if n%2 == 1 {
		return s[n/2]
	}
	return (s[n/2-1] + s[n/2]) / 2
}

// Mean is np.mean: pairwise sum over n.
func Mean(a []float64) float64 { return Sum(a) / float64(len(a)) }
