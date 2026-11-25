// Package tide is harmonic tidal analysis and prediction, shared by the
// contribution targets (moved out of package adelaide 2026-10-14, arithmetic
// unchanged):
//
//	h(t) = Z0 + Σ_k f_k(t) [A_k cos(V_k(t) + u_k(t)) + B_k sin(V_k(t) + u_k(t))]
//
// where V_k = Σ d_i·(τ, s, h, p, −N, p₁)_i is the constituent's equilibrium
// argument from its Doodson numbers d [Doodson 1921], the mean longitudes s
// (Moon), h (Sun), p (lunar perigee), N (lunar node), p₁ (solar perigee)
// are the linear terms of [Meeus 1998, ch. 47 and 22] (τ = lunar time), and
// f, u are the nodal corrections of [Schureman 1958] in the form tabulated
// by [Foreman 1977] (compound tides M4, M3, M6, MK3, 2MK3 take the products
// of their parents' f and sums of their u). The unknowns Z0, A_k, B_k are
// found by least squares (Householder QR [Golub & Van Loan, § 5.3.3]) from
// either a list of highs and lows (FitExtremes: each gives its height and a
// zero time derivative) or a series of readings (FitSeries, a tide gauge).
//
// # References
//
//   - [Doodson 1921] A. T. Doodson, "The harmonic development of the tide-generating potential",
//     Proc. R. Soc. A 100 (1921) 305-329.
//   - [Foreman 1977] M. G. G. Foreman, Manual for Tidal Heights Analysis and Prediction, Pacific
//     Marine Science Report 77-10, Institute of Ocean Sciences, Patricia Bay (1977, rev. 2004).
//   - [Golub & Van Loan] G. H. Golub, C. F. Van Loan, Matrix Computations, 4th ed., Johns Hopkins (2013).
//   - [Meeus 1998] J. Meeus, Astronomical Algorithms, 2nd ed., Willmann-Bell (1998).
//   - [Schureman 1958] P. Schureman, Manual of Harmonic Analysis and Prediction of Tides, US Coast
//     and Geodetic Survey Special Publication 98 (1958).
package tide

import (
	"math"
	"math/big"

	"flatorglobe/tools/internal/npy"
	"flatorglobe/tools/internal/pymath"
)

// D2R is pi/180 as Python computes it.
var D2R = pymath.Div(math.Pi, 180)

// Constituent is one harmonic of the tide: its Doodson numbers (multiples
// of τ, s, h, p, N', p₁ in its equilibrium argument) [Doodson 1921; Foreman
// 1977, table 1] and the class of its nodal correction.
type Constituent struct {
	Name string
	Dn   [6]float64 // Doodson tau, s, h, p, N', p1
	Cls  string     // nodal class
}

// All are the 32 constituents of the Adelaide fit (long-period to sixth-diurnal).
var All = []Constituent{
	{"Sa", [6]float64{0, 0, 1, 0, 0, 0}, "1"}, {"Ssa", [6]float64{0, 0, 2, 0, 0, 0}, "1"}, {"Mm", [6]float64{0, 1, 0, -1, 0, 0}, "Mm"},
	{"Msf", [6]float64{0, 2, -2, 0, 0, 0}, "M2"}, {"Mf", [6]float64{0, 2, 0, 0, 0, 0}, "Mf"}, {"2Q1", [6]float64{1, -3, 0, 2, 0, 0}, "O1"},
	{"Q1", [6]float64{1, -2, 0, 1, 0, 0}, "O1"}, {"rho1", [6]float64{1, -2, 2, -1, 0, 0}, "O1"}, {"O1", [6]float64{1, -1, 0, 0, 0, 0}, "O1"},
	{"P1", [6]float64{1, 1, -2, 0, 0, 0}, "1"}, {"S1", [6]float64{1, 1, -1, 0, 0, 0}, "1"}, {"K1", [6]float64{1, 1, 0, 0, 0, 0}, "K1"},
	{"J1", [6]float64{1, 2, 0, -1, 0, 0}, "J1"}, {"OO1", [6]float64{1, 3, 0, 0, 0, 0}, "OO1"}, {"2N2", [6]float64{2, -2, 0, 2, 0, 0}, "M2"},
	{"mu2", [6]float64{2, -2, 2, 0, 0, 0}, "M2"}, {"N2", [6]float64{2, -1, 0, 1, 0, 0}, "M2"}, {"nu2", [6]float64{2, -1, 2, -1, 0, 0}, "M2"},
	{"M2", [6]float64{2, 0, 0, 0, 0, 0}, "M2"}, {"L2", [6]float64{2, 1, 0, -1, 0, 0}, "M2"}, {"T2", [6]float64{2, 2, -3, 0, 0, 1}, "1"},
	{"S2", [6]float64{2, 2, -2, 0, 0, 0}, "1"}, {"R2", [6]float64{2, 2, -1, 0, 0, -1}, "1"}, {"K2", [6]float64{2, 2, 0, 0, 0, 0}, "K2"},
	{"2MK3", [6]float64{3, -1, 0, 0, 0, 0}, "2MK3"}, {"M3", [6]float64{3, 0, 0, 0, 0, 0}, "M3"}, {"MK3", [6]float64{3, 1, 0, 0, 0, 0}, "MK3"},
	{"MN4", [6]float64{4, -1, 0, 1, 0, 0}, "M4"}, {"M4", [6]float64{4, 0, 0, 0, 0, 0}, "M4"}, {"MS4", [6]float64{4, 2, -2, 0, 0, 0}, "M2"},
	{"S4", [6]float64{4, 4, -4, 0, 0, 0}, "1"}, {"M6", [6]float64{6, 0, 0, 0, 0, 0}, "M6"},
}

// Model is a set of constituents; the unknowns are the mean level, then
// the cos and sin of each constituent.
type Model []Constituent

// NCols is the number of unknowns.
func (m Model) NCols() int { return 1 + 2*len(m) }

// Astro returns tau, s, h, p, N, p1 (degrees) at a Unix time: the mean
// longitudes of the Moon (s), the Sun (h), the lunar perigee (p), the lunar
// ascending node (N) and the solar perigee (p1), linear in Julian centuries
// T from J2000 [Meeus 1998, eq. 47.1-47.7 and 25.3, first terms], and the
// mean lunar time tau = 15° x UT hours + 180° + h - s [Schureman 1958, §
// 69].
func Astro(ts float64) [6]float64 {
	T := (ts/86400 + 2440587.5 - 2451545.0) / 36525
	s := 218.3165 + float64(481267.8813*T)
	h := 280.4661 + float64(36000.7698*T)
	p := 83.3535 + float64(4069.0137*T)
	N := 125.0445 - float64(1934.1363*T)
	p1 := 282.9384 + float64(1.7195*T)
	return [6]float64{float64(15*math.Mod(ts/3600, 24)) + 180 + h - s, s, h, p, N, p1}
}

// pow15 is pow(x, 1.5) correctly rounded (glibc's pow, which numpy calls).
func pow15(x float64) float64 {
	b := new(big.Float).SetPrec(256).SetFloat64(x)
	c := new(big.Float).SetPrec(256).Mul(b, b)
	c.Mul(c, b)
	c.Sqrt(c)
	f, _ := c.Float64()
	return f
}

// Nodal is the (f, u) of a nodal class at N (degrees), u in degrees: the
// 18.6-year modulation of amplitude (f) and phase (u) by the lunar node,
// series of [Schureman 1958, table 14] as given by [Foreman 1977, appendix
// 2]; a compound tide takes the product of its parents' f and the sum of
// their u.
func Nodal(cls string, N float64) (float64, float64) {
	n := N * D2R
	c, s := math.Cos, math.Sin
	m2f, m2u := 1.0004-float64(0.0373*c(n))+float64(0.0002*c(2*n)), float64(-2.14*s(n))
	k1f := 1.0060 + float64(0.1150*c(n)) - float64(0.0088*c(2*n))
	k1u := float64(-8.86*s(n)) + float64(0.68*s(2*n)) - float64(0.07*s(3*n))
	switch cls {
	case "1":
		return 1 + 0*n, 0 * n
	case "O1":
		return 1.0089 + float64(0.1871*c(n)) - float64(0.0147*c(2*n)), float64(10.8*s(n)) - float64(1.34*s(2*n)) + float64(0.19*s(3*n))
	case "K1":
		return k1f, k1u
	case "M2":
		return m2f, m2u
	case "K2":
		return 1.0241 + float64(0.2863*c(n)) + float64(0.0083*c(2*n)), float64(-17.74*s(n)) + float64(0.68*s(2*n)) - float64(0.04*s(3*n))
	case "Mm":
		return 1 - float64(0.130*c(n)), 0 * n
	case "Mf":
		return 1.043 + float64(0.414*c(n)), float64(-23.7*s(n)) + float64(2.7*s(2*n))
	case "J1":
		return 1.0129 + float64(0.1676*c(n)), float64(12.94 * s(n))
	case "OO1":
		return 1.1027 + float64(0.6504*c(n)), float64(-36.68 * s(n))
	case "M4":
		return m2f * m2f, 2 * m2u
	case "M3":
		return pow15(m2f), float64(1.5 * m2u)
	case "M6":
		return pymath.Cube(m2f), float64(3 * m2u)
	case "MK3":
		return m2f * k1f, m2u + k1u
	case "2MK3":
		return float64(m2f*m2f) * k1f, 2*m2u - k1u
	}
	panic("nodal class " + cls)
}

// Arg is (f, (V + u) * D2R) of constituent c at ts.
func Arg(c *Constituent, ts float64) (float64, float64) {
	a := Astro(ts)
	x := [6]float64{a[0], a[1], a[2], a[3], -a[4], a[5]}
	V := 0.0
	for i, d := range c.Dn {
		V += float64(d * x[i])
	}
	f, u := Nodal(c.Cls, a[4])
	return f, (V + u) * D2R
}

// DesignRow fills row with design([ts]) (deriv: d/dt in m per hour, central
// difference over 60 s).
func (m Model) DesignRow(row []float64, ts float64, deriv bool) {
	if deriv {
		row[0] = 0
	} else {
		row[0] = 1
	}
	for k := range m {
		c := &m[k]
		if !deriv {
			f, th := Arg(c, ts)
			row[1+2*k] = f * math.Cos(th)
			row[2+2*k] = f * math.Sin(th)
		} else {
			f1, t1 := Arg(c, ts-30)
			f2, t2 := Arg(c, ts+30)
			row[1+2*k] = (float64(f2*math.Cos(t2)) - float64(f1*math.Cos(t1))) * 60
			row[2+2*k] = (float64(f2*math.Sin(t2)) - float64(f1*math.Sin(t1))) * 60
		}
	}
}

// At is design([ts]) @ x, summed in index order (BLAS dgemv/ddot).
func (m Model) At(x []float64, ts float64) float64 {
	row := make([]float64, m.NCols())
	m.DesignRow(row, ts, false)
	s := 0.0
	for j, v := range row {
		s += float64(v * x[j])
	}
	return s
}

// Extreme is a high or a low water: time (Unix s), "High" or "Low", height.
type Extreme struct {
	T   float64
	Typ string
	H   float64
}

// FitExtremes is lstsq([design; d design/dt], [h; 0]) (heights at the extremes
// and zero slope there). The system is well conditioned (cond ~ 5):
// Householder QR agrees with LAPACK's SVD solver to ~1e-14.
func (m Model) FitExtremes(L []Extreme) []float64 {
	n := 2 * len(L)
	A := make([][]float64, n)
	b := make([]float64, n)
	for i, e := range L {
		A[i] = make([]float64, m.NCols())
		m.DesignRow(A[i], e.T, false)
		b[i] = e.H
		A[len(L)+i] = make([]float64, m.NCols())
		m.DesignRow(A[len(L)+i], e.T, true)
	}
	return LstsqQR(A, b)
}

// LstsqQR solves min |A x - b| by Householder QR (A has full column rank)
// [Golub & Van Loan, Matrix Computations, 4th ed. (2013), § 5.3.3].
func LstsqQR(A [][]float64, b []float64) []float64 {
	m, n := len(A), len(A[0])
	for k := 0; k < n; k++ {
		norm := 0.0
		for i := k; i < m; i++ {
			norm = math.Hypot(norm, A[i][k])
		}
		if A[k][k] > 0 {
			norm = -norm
		}
		v := make([]float64, m-k)
		for i := k; i < m; i++ {
			v[i-k] = A[i][k]
		}
		v[0] -= norm
		vv := 0.0
		for _, x := range v {
			vv += x * x
		}
		if vv == 0 {
			continue
		}
		for j := k; j < n; j++ {
			d := 0.0
			for i := k; i < m; i++ {
				d += v[i-k] * A[i][j]
			}
			d = 2 * d / vv
			for i := k; i < m; i++ {
				A[i][j] -= d * v[i-k]
			}
		}
		d := 0.0
		for i := k; i < m; i++ {
			d += v[i-k] * b[i]
		}
		d = 2 * d / vv
		for i := k; i < m; i++ {
			b[i] -= d * v[i-k]
		}
	}
	x := make([]float64, n)
	for k := n - 1; k >= 0; k-- {
		s := b[k]
		for j := k + 1; j < n; j++ {
			s -= A[k][j] * x[j]
		}
		x[k] = s / A[k][k]
	}
	return x
}

// Extrema: highs and lows of the fitted tide every minute in [t0, t1).
func (m Model) Extrema(x []float64, t0, t1 float64) []Extreme {
	ts := npy.Arange(t0, t1, 60.0)
	h := make([]float64, len(ts))
	for i, t := range ts {
		h[i] = m.At(x, t)
	}
	var out []Extreme
	for i := 1; i < len(h)-1; i++ {
		if float64((h[i]-h[i-1])*(h[i+1]-h[i])) < 0 {
			typ := "Low"
			if h[i] > h[i-1] {
				typ = "High"
			}
			out = append(out, Extreme{ts[i], typ, h[i]})
		}
	}
	return out
}

// Pick returns the constituents of All with these names, in All's order.
func Pick(names ...string) Model {
	want := map[string]bool{}
	for _, n := range names {
		want[n] = true
	}
	var m Model
	for _, c := range All {
		if want[c.Name] {
			m = append(m, c)
			delete(want, c.Name)
		}
	}
	if len(want) > 0 {
		panic("tide: unknown constituent")
	}
	return m
}

// FitSeries fits readings h at times ts (Unix s) by least squares.
func (m Model) FitSeries(ts, h []float64) []float64 {
	A := make([][]float64, len(ts))
	b := make([]float64, len(ts))
	for i, t := range ts {
		A[i] = make([]float64, m.NCols())
		m.DesignRow(A[i], t, false)
		b[i] = h[i]
	}
	return LstsqQR(A, b)
}
