// Package stats holds the statistics the data chain shares, computed as
// CPython's statistics module computes them: exactly, in rationals, and
// rounded once at the end. The leave-one-out 3-sigma exclusion is the
// project's outlier rule (owner, 2026-09: a value is judged against the
// mean and standard deviation of the OTHERS, so that an outlier cannot
// widen the spread to hide itself; never a percentage threshold).
package stats

import (
	"math"
	"math/big"
	"sort"
)

func ratOf(x float64) *big.Rat { return new(big.Rat).SetFloat64(x) }

// Mean is statistics.mean of floats: the exact mean, correctly rounded.
// It panics on an empty slice or a non-finite value.
func Mean(xs []float64) float64 {
	if len(xs) == 0 {
		panic("stats.Mean of no data")
	}
	sum := new(big.Rat)
	for _, x := range xs {
		sum.Add(sum, mustRat(x))
	}
	f, _ := sum.Quo(sum, new(big.Rat).SetInt64(int64(len(xs)))).Float64()
	return f
}

// Stdev is statistics.stdev (sample, n-1) of floats: the square root of
// the exact variance, correctly rounded.
func Stdev(xs []float64) float64 {
	n := len(xs)
	if n < 2 {
		panic("stats.Stdev needs two values")
	}
	sx, sxx := new(big.Rat), new(big.Rat)
	for _, x := range xs {
		r := mustRat(x)
		sx.Add(sx, r)
		sxx.Add(sxx, new(big.Rat).Mul(r, r))
	}
	bn := new(big.Rat).SetInt64(int64(n))
	// ssd = (n*sxx - sx*sx) / n ; variance = ssd / (n-1)
	ssd := new(big.Rat).Sub(new(big.Rat).Mul(bn, sxx), new(big.Rat).Mul(sx, sx))
	ssd.Quo(ssd, bn)
	ssd.Quo(ssd, new(big.Rat).SetInt64(int64(n-1)))
	return SqrtRat(ssd)
}

func mustRat(x float64) *big.Rat {
	if math.IsNaN(x) || math.IsInf(x, 0) {
		panic("stats: non-finite value")
	}
	return ratOf(x)
}

// SqrtRat is the correctly rounded square root of a non-negative rational
// (CPython's _float_sqrt_of_frac): an integer square root carrying at least
// 55 significant bits, rounded to odd, then rounded once to a double.
func SqrtRat(r *big.Rat) float64 {
	if r.Sign() < 0 {
		panic("stats.SqrtRat of a negative number")
	}
	if r.Sign() == 0 {
		return 0
	}
	n, m := new(big.Int).Set(r.Num()), new(big.Int).Set(r.Denom())
	const width = 2*53 + 3 // as CPython's _sqrt_bit_width
	q := floorDiv(n.BitLen()-m.BitLen()-width, 2)
	if q >= 0 {
		m.Lsh(m, uint(2*q))
	} else {
		n.Lsh(n, uint(-2*q))
	}
	a := new(big.Int).Sqrt(new(big.Int).Quo(n, m))
	// round to odd: set the last bit when the root is inexact
	chk := new(big.Int).Mul(a, a)
	chk.Mul(chk, m)
	if chk.Cmp(n) != 0 {
		a.SetBit(a, 0, 1)
	}
	f := new(big.Float).SetInt(a)
	f.SetMantExp(f, q)
	v, _ := f.Float64()
	return v
}

func floorDiv(a, b int) int {
	q := a / b
	if (a%b != 0) && ((a < 0) != (b < 0)) {
		q--
	}
	return q
}

// KeepLOO applies the leave-one-out rule to xs: x is kept when
// |x - mean(others)| <= k * max(floor, stdev(others)). With fewer than
// minOthers others, every value is kept (no spread to judge against).
// Same arithmetic as the Python builders (statistics.mean/stdev, then
// float64 operations), so the same values are kept.
func KeepLOO(xs []float64, k, floor float64, minOthers int) (keep []float64, dropped int) {
	others := make([]float64, 0, len(xs))
	for i, x := range xs {
		others = others[:0]
		others = append(others, xs[:i]...)
		others = append(others, xs[i+1:]...)
		if len(others) < minOthers {
			keep = append(keep, x)
			continue
		}
		m, sd := Mean(others), math.Max(floor, Stdev(others))
		if math.Abs(x-m) <= k*sd {
			keep = append(keep, x)
		}
	}
	return keep, len(xs) - len(keep)
}

// Median is statistics.median: the middle value, or the mean of the two
// middle values computed as (a + b) / 2 in float64, as CPython does.
func Median(xs []float64) float64 {
	if len(xs) == 0 {
		panic("stats.Median of no data")
	}
	s := append([]float64(nil), xs...)
	sort.Float64s(s)
	n := len(s)
	if n%2 == 1 {
		return s[n/2]
	}
	return (s[n/2-1] + s[n/2]) / 2
}
