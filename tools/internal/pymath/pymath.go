// Package pymath gives Go the arithmetic of CPython where the two differ.
//
// Ports must keep two traps in mind (both pinned by the tests):
//
//  1. Go evaluates constant expressions EXACTLY, then rounds once:
//     `math.Pi / 180` or `1 / 298.257223563` written as constants are not
//     the doubles Python computes (it rounds each operand, then divides).
//     Use the variables below, or the Div/Mul helpers, never a constant
//     expression, for any value that must match Python.
//  2. Go may fuse x*y+z into one FMA instruction (always on arm64, on amd64
//     from GOAMD64=v3), which rounds once instead of twice. An explicit
//     float64(x*y) conversion forbids the fusion; ports wrap products that
//     feed an addition that way.
//
// Transcendentals (sin, cos, pow, atan2…) are a third difference that
// cannot be removed without cgo: CPython calls the C library, Go has its
// own code; both are within about one ulp. The parity package tolerates
// and counts the rare last-digit flips this causes.
package pymath

import "math"

// Div returns a/b rounded as a float64 division at run time.
//
//go:noinline
func Div(a, b float64) float64 { return a / b }

// Mul returns a*b rounded as a float64 product at run time.
//
//go:noinline
func Mul(a, b float64) float64 { return a * b }

// DegToRad is CPython's math.radians factor: double(pi) / 180.0.
var DegToRad = Div(math.Pi, 180)

// RadToDeg is CPython's math.degrees factor: 180.0 / double(pi).
var RadToDeg = Div(180, math.Pi)

// Radians is math.radians.
func Radians(x float64) float64 { return x * DegToRad }

// Degrees is math.degrees.
func Degrees(x float64) float64 { return x * RadToDeg }

// RoundInt is round(x) without ndigits: nearest integer, ties to even.
func RoundInt(x float64) int { return int(math.RoundToEven(x)) }

// Mod is Python's integer %: the result has the sign of the divisor.
func Mod(a, b int) int {
	m := a % b
	if m != 0 && (m < 0) != (b < 0) {
		m += b
	}
	return m
}

// Trunc is int(x) for a float: toward zero.
func Trunc(x float64) int { return int(x) }

// Sum is CPython's built-in sum() of floats (3.12 and later): Neumaier's
// compensated summation, started from the int 0, the compensation added at
// the end when it is finite and non-zero.
func Sum(xs []float64) float64 {
	if len(xs) == 0 {
		return 0
	}
	f := 0 + xs[0] // the int 0 plus the first float: -0.0 becomes 0.0
	c := 0.0
	for _, x := range xs[1:] {
		t := f + x
		if math.Abs(f) >= math.Abs(x) {
			c += (f - t) + x
		} else {
			c += (x - t) + f
		}
		f = t
	}
	if c != 0 && !math.IsInf(c, 0) && !math.IsNaN(c) {
		f += c
	}
	return f
}

// Micros is timedelta(seconds=s) in microseconds: the fraction scaled by
// 1e6 in float64, then rounded half to even on the total, as CPython's
// C timedelta constructor does.
func Micros(s float64) int64 {
	ip, frac := math.Modf(s)
	pi, pf := math.Modf(frac * 1e6)
	total := int64(ip)*1_000_000 + int64(pi)
	if pf != 0 {
		w := math.Round(pf)
		if math.Abs(w-pf) == 0.5 && total%2 == 0 { // exactly halfway: to even
			w = 0
		}
		total += int64(w)
	}
	return total
}

// Hypot is glibc 2.41's hypot (sysdeps/ieee754/dbl-64/e_hypot.c), the
// kernel compiled without FMA as on the owner's CPU (Borges' correction):
// numpy's np.hypot and CPython's math.hypot both call it. math.Hypot can
// be one ulp off.
func Hypot(x, y float64) float64 {
	const (
		scale    = 0x1p-600
		largeVal = 0x1p+511
		tinyVal  = 0x1p-459
		eps      = 0x1p-54
	)
	if math.IsInf(x, 0) || math.IsInf(y, 0) {
		return math.Inf(1)
	}
	if math.IsNaN(x) || math.IsNaN(y) {
		return x + y
	}
	x, y = math.Abs(x), math.Abs(y)
	ax, ay := x, y
	if x < y {
		ax, ay = y, x
	}
	if ax > largeVal {
		if ay <= ax*eps {
			return ax + ay
		}
		return hypotKernel(ax*scale, ay*scale) / scale
	}
	if ay < tinyVal {
		if ax >= ay/eps {
			return ax + ay
		}
		return hypotKernel(ax/scale, ay/scale) * scale
	}
	if ay <= ax*eps {
		return ax + ay
	}
	return hypotKernel(ax, ay)
}

func hypotKernel(ax, ay float64) float64 {
	var t1, t2 float64
	h := math.Sqrt(float64(ax*ax) + float64(ay*ay))
	if h <= 2.0*ay {
		delta := h - ay
		t1 = ax * (float64(2.0*delta) - ax)
		t2 = (delta - float64(2.0*(ax-ay))) * delta
	} else {
		delta := h - ax
		t1 = float64(2.0*delta) * (ax - float64(2.0*ay))
		t2 = float64((float64(4.0*delta)-ay)*ay) + float64(delta*delta)
	}
	h -= (t1 + t2) / (2.0 * h)
	return h
}

// twoProdErr is the exact rounding error of a*b (Dekker, Veltkamp
// splitting: no FMA, which this CPU lacks and Go would emulate slowly).
func twoProdErr(a, b, p float64) float64 {
	ah, al := split(a)
	bh, bl := split(b)
	return float64(float64(float64(float64(ah*bh)-p)+float64(ah*bl))+float64(al*bh)) + float64(al*bl)
}

func split(a float64) (float64, float64) {
	c := float64(134217729 * a) // 2^27 + 1
	hi := c - (c - a)
	return hi, a - hi
}

// Cube is x**3, correctly rounded (the exact cube in double-double, rounded
// once): the C pow() numpy and CPython call agrees but for rare last-bit
// cases (2 in 3,000 in the tests; x*x*x would miss 766).
func Cube(x float64) float64 {
	if x == 0 || math.IsInf(x, 0) || math.IsNaN(x) || math.Abs(x) > 1e100 || math.Abs(x) < 1e-100 {
		return math.Pow(x, 3)
	}
	p := x * x
	e := twoProdErr(x, x, p)
	c := p * x
	return c + (twoProdErr(p, x, c) + float64(e*x))
}

// NpRound is round(x, d) on a numpy float64 scalar: numpy multiplies by
// 10**d, rounds half to even with rint and divides back -- not CPython's
// correctly rounded round(), and the two differ on a few values.
func NpRound(x float64, d int) float64 {
	p10 := [...]float64{1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8}
	f := p10[d]
	return math.RoundToEven(x*f) / f
}

// PyHypot is CPython 3.13's math.hypot of two numbers (vector_norm:
// scaled, lossless squares and sums, one differential correction), which
// is not the C library's hypot.
func PyHypot(a, b float64) float64 {
	a, b = math.Abs(a), math.Abs(b)
	if math.IsInf(a, 0) || math.IsInf(b, 0) {
		return math.Inf(1)
	}
	if math.IsNaN(a) || math.IsNaN(b) {
		return math.NaN()
	}
	mx := math.Max(a, b)
	if mx == 0 {
		return mx
	}
	_, e := math.Frexp(mx)
	if e < -1023 {
		return math.Hypot(a, b) // subnormal range: not met here
	}
	scale := math.Ldexp(1, -e)
	csum, frac1, frac2 := 1.0, 0.0, 0.0
	for _, x := range []float64{a, b} {
		x *= scale
		hi := x * x
		lo := twoProdErr(x, x, hi)
		s := csum + hi // dl_fast_sum(csum, hi)
		z := s - csum
		frac1 += lo
		frac2 += hi - z
		csum = s
	}
	h := math.Sqrt(csum - 1.0 + (frac1 + frac2))
	phi := -h * h
	plo := twoProdErr(-h, h, phi)
	s := csum + phi
	z := s - csum
	frac1 += plo
	frac2 += phi - z
	csum = s
	x := csum - 1.0 + (frac1 + frac2)
	h += x / (2.0 * h)
	return h / scale
}
