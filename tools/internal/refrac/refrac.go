// Package refrac is the air above the sea and the rays through it, shared by
// the contribution targets (adelaide, lomond): a surface layer by
// Monin-Obukhov similarity, optionally topped by a measured or modelled
// column, its refractivity, and rays traced through it over a sphere
// (globe) or a plane (flat). Moved out of package adelaide (2026-10-14)
// with its arithmetic unchanged: adelaide's parity test still holds.
//
// # Surface layer
//
// By Monin-Obukhov similarity [Foken 2006] with the Businger-Dyer
// flux-profile functions [Businger 1971; Dyer 1974], integrated by [Paulson
// 1970]:
//
//	stable (ζ ≥ 0):   ψ_m = ψ_h = −5ζ        (ζ capped at 5)
//	unstable (ζ < 0): x = (1 − 16ζ)^¼,
//	                  ψ_m = 2 ln((1+x)/2) + ln((1+x²)/2) − 2 atan x + π/2,
//	                  ψ_h = 2 ln((1+x²)/2)
//	T(z) = θ_s + θ*/κ [ln(z/z₀t) − ψ_h(z/L)] − 0.0098 z
//	e(z) = e_s + q*/κ [ln(z/z₀t) − ψ_h(z/L)]
//	L = u*² θ_v / (κ g θ_v*),  u* = κ U₁₀ / (ln(10/z₀) − ψ_m(10/L))
//
// with κ = 0.4, the sea's roughness z₀ = 0.011 u*²/g (Charnock) + 0.11 ν/u*
// (smooth flow) [Charnock 1955; Smith 1988], z₀t = 10⁻⁴ m, the saturation
// vapour pressure over water by the Magnus formula e = 6.112 exp(17.62 t /
// (243.12 + t)) hPa [WMO 2008, annex 4.B], 0.98 of it at the sea surface
// (salinity).
//
// # Column
//
// Above the surface layer (Column, from ZTop), the temperature is
// interpolated linearly in height between the levels of a sounding or a
// model (geopotential height above the sea, temperature), constant lapse
// beyond the last two; the vapour pressure keeps its value at ZTop.
// Pressure falls with a scale height of 8.4 km in both.
//
// # Refractivity and rays
//
// Refractivity in the visible:
//
//	N = 79.01 P/T − 12.0 e/T        (P, e in hPa, T in K)
//
// the dry term being Ciddor's n − 1 at 550 nm [Ciddor 1996] (the dip tab's
// constant), the water vapour term that of the same paper, rounded. Rays are
// traced from the eye in horizontally layered air [Lehn 1979]: with s the
// ray's slope and z its height above the surface,
//
//	z” = c_R + dN/dz·10⁻⁶,   c_R = 1/R (sphere of radius R) or 0 (plane)
//
// in fixed steps, dN/dz interpolated linearly between the mid-points of a
// geometric height grid (0.01 m × 1.02^i). In uniform air this is the
// classical refraction coefficient [Hirt 2010, eq. 2; Brunner 1984]:
//
//	k = −R dn/dz = 503 (P/T²)(0.0343 + dT/dz)        (P hPa, T K, dT/dz K/m)
//
// (KFromGrad, GradFromK): light curves down (k > 0) unless the temperature
// falls faster than 0.0343 K/m, the autoconvective lapse rate at which the
// air's density no longer decreases with height.
//
// # References
//
//   - [Brunner 1984] F. K. Brunner (ed.), Geodetic Refraction, Springer (1984), ch. 1.
//   - [Businger 1971] J. A. Businger, J. C. Wyngaard, Y. Izumi, E. F. Bradley, "Flux-profile
//     relationships in the atmospheric surface layer", J. Atmos. Sci. 28 (1971) 181-189.
//   - [Charnock 1955] H. Charnock, "Wind stress on a water surface", Q. J. R. Meteorol. Soc. 81 (1955) 639-640.
//   - [Ciddor 1996] P. E. Ciddor, "Refractive index of air: new equations for the visible and near
//     infrared", Applied Optics 35 (1996) 1566-1573.
//   - [Dyer 1974] A. J. Dyer, "A review of flux-profile relationships", Boundary-Layer Meteorol. 7 (1974) 363-372.
//   - [Foken 2006] T. Foken, "50 years of the Monin-Obukhov similarity theory", Boundary-Layer
//     Meteorol. 119 (2006) 431-447.
//   - [Hirt 2010] C. Hirt, S. Guillaume, A. Wisbar, B. Bürki, H. Sternberg, "Monitoring of the
//     refraction coefficient in the lower atmosphere using a controlled setup of simultaneous
//     reciprocal vertical angle measurements", J. Geophys. Res. 115 (2010) D21102.
//   - [Lehn 1979] W. H. Lehn, "The theory of terrestrial refraction", Applied Mathematical Modelling 3
//     (1979) 98-104 (ray tracing in horizontally layered air).
//   - [Paulson 1970] C. A. Paulson, "The mathematical representation of wind speed and temperature
//     profiles in the unstable atmospheric surface layer", J. Appl. Meteorol. 9 (1970) 857-861.
//   - [Smith 1988] S. D. Smith, "Coefficients for sea surface wind stress, heat flux, and wind
//     profiles as a function of wind speed and temperature", J. Geophys. Res. 93 (1988) 15467-15472.
//   - [WMO 2008] WMO, Guide to Meteorological Instruments and Methods of Observation, WMO-No. 8,
//     7th ed. (2008), annex 4.B.
package refrac

import (
	"math"
	"math/big"
	"sort"

	"flatorglobe/tools/internal/pymath"
)

// variables, not constants: Go folds constant expressions exactly, Python
// multiplies at run time (pymath, trap 1)
var (
	kappa, grav = 0.4, 9.81
	viscous     = pymath.Mul(0.11, 1.5e-5)
	z0t         = 1e-4
)

// Esat is the saturation vapour pressure over water (hPa) at t °C, Magnus
// formula with the WMO constants [WMO 2008, annex 4.B].
func Esat(t float64) float64 { return 6.112 * math.Exp(float64(17.62*t)/(243.12+t)) }

// pow025 is pow(x, 0.25) correctly rounded (glibc's pow).
func pow025(x float64) float64 {
	b := new(big.Float).SetPrec(256).SetFloat64(x)
	b.Sqrt(b)
	b.Sqrt(b)
	f, _ := b.Float64()
	return f
}

// psi returns the Businger-Dyer stability functions (m, h) of zeta = z/L
// [Businger 1971; Dyer 1974; Foken 2006, eq. 7-10]: -5 zeta when stable
// (zeta capped at 5), the integrated forms of Paulson (1970) when unstable.
func psi(zeta float64) (float64, float64) {
	if zeta >= 0 {
		z := zeta
		if 5.0 < z {
			z = 5.0
		}
		return -5 * z, -5 * z
	}
	x := pow025(1 - 16*zeta)
	pm := 2*math.Log((1+x)/2) + math.Log((1+float64(x*x))/2) - 2*math.Atan(x) + math.Pi/2
	return pm, 2 * math.Log((1+float64(x*x))/2)
}

// Air is anything with a refractivity profile N(z) at surface pressure P0.
type Air interface {
	N(P0, z float64) float64
}

// Profile is the surface layer above the sea: T(z) °C and e(z) hPa.
type Profile struct {
	thS, ths, es, esS float64
	L, Ustar          float64
}

// NewProfile solves the surface layer from the sea (temperature sst, air
// saturated x 0.98 for salinity) and the air at 2 m (t2, dew point td2), 10 m
// wind u10, pressure P: 50 fixed-point iterations on u*, theta*, q* and the
// Obukhov length L [Foken 2006, eq. 4-6]; the sea's roughness length z0 =
// 0.011 u*²/g + 0.11 nu/u* (Charnock's constant 0.011 [Charnock 1955], the
// smooth-flow term with nu = 1.5e-5 m²/s [Smith 1988]); z0t = 1e-4 m.
func NewProfile(sst, t2, td2, u10, P float64) *Profile {
	es := 0.98 * Esat(sst)
	e2 := Esat(td2)
	thS, th2 := sst, t2+0.0098*2
	us, L := 0.035*u10, 1e9
	var ths, esS float64
	for range 50 {
		z0 := float64(float64(0.011*us)*us)/grav + viscous/us
		pm10, _ := psi(10 / L)
		_, ph2 := psi(2 / L)
		us = kappa * u10 / (math.Log(10/z0) - pm10)
		ths = kappa * (th2 - thS) / (math.Log(2/z0t) - ph2)
		esS = kappa * (e2 - es) / (math.Log(2/z0t) - ph2)
		thvStar := ths + float64(float64(float64(0.61*(thS+273.15))*esS)/P)*0.622
		if math.Abs(thvStar) > 1e-9 {
			L = float64(float64(us*us)*(thS+273.15)) / float64(float64(kappa*grav)*thvStar)
		} else {
			L = 1e9
		}
	}
	return &Profile{thS: thS, ths: ths, es: es, esS: esS, L: L, Ustar: us}
}

// T is the air temperature (°C) at z m: potential temperature from the
// log-linear profile minus the dry adiabatic lapse rate 0.0098 K/m.
func (p *Profile) T(z float64) float64 {
	z = math.Max(z, 2*z0t)
	_, ph := psi(z / p.L)
	return p.thS + float64(p.ths/kappa*(math.Log(z/z0t)-ph)) - 0.0098*z
}

// E is the water vapour pressure (hPa) at z m, same profile form.
func (p *Profile) E(z float64) float64 {
	z = math.Max(z, 2*z0t)
	_, ph := psi(z / p.L)
	return p.es + float64(p.esS/kappa*(math.Log(z/z0t)-ph))
}

// N is the refractivity (n - 1) x 1e6 for visible light at height z, the
// pressure falling with a scale height of 8.4 km: N = 79.01 P/T - 12.0 e/T
// [Ciddor 1996: dry air 2.778e-4 at 550 nm, 15 °C, 1013.25 hPa; the water
// vapour term of the same paper, rounded].
func (p *Profile) N(P0, z float64) float64 {
	t := p.T(z) + 273.15
	pr := P0 * math.Exp(-z/8400)
	return float64(79.01*pr)/t - float64(12.0*p.E(z))/t
}

// Level is a level of a sounding or a model: height above the sea (m) and
// temperature (°C).
type Level struct{ Z, T float64 }

// Column is the surface layer up to ZTop, then the levels above it
// (interpolated linearly in height, the last lapse rate beyond), plus a
// uniform extra gradient Shift (K/m) over the whole column: T(z) + Shift·z.
type Column struct {
	S      *Profile
	ZTop   float64
	Levels []Level // ascending, all above ZTop
	Shift  float64
}

// T is the column's temperature (°C) at z m.
func (c *Column) T(z float64) float64 {
	return c.base(z) + c.Shift*math.Max(z, 0)
}

func (c *Column) base(z float64) float64 {
	if z <= c.ZTop || len(c.Levels) == 0 {
		return c.S.T(z)
	}
	pts := append([]Level{{c.ZTop, c.S.T(c.ZTop)}}, c.Levels...)
	i := sort.Search(len(pts), func(i int) bool { return pts[i].Z >= z })
	if i >= len(pts) {
		i = len(pts) - 1
	}
	a, b := pts[i-1], pts[i]
	return a.T + (z-a.Z)/(b.Z-a.Z)*(b.T-a.T)
}

// E is the vapour pressure: the surface layer's, constant above ZTop.
func (c *Column) E(z float64) float64 { return c.S.E(math.Min(z, c.ZTop)) }

// N is the refractivity at z, as Profile.N.
func (c *Column) N(P0, z float64) float64 {
	t := c.T(z) + 273.15
	pr := P0 * math.Exp(-z/8400)
	return float64(79.01*pr)/t - float64(12.0*c.E(z))/t
}

// MeanGrad is the mean temperature gradient (K/m) between z0 and z1.
func MeanGrad(T func(float64) float64, z0, z1 float64) float64 { return (T(z1) - T(z0)) / (z1 - z0) }

// KFromGrad is the refraction coefficient of uniform air with temperature
// gradient g (K/m), pressure P (hPa), temperature T (K) [Hirt 2010, eq. 2].
func KFromGrad(g, P, T float64) float64 { return 503 * P / (T * T) * (0.0343 + g) }

// GradFromK inverts KFromGrad.
func GradFromK(k, P, T float64) float64 { return k*T*T/(503*P) - 0.0343 }

// ZGrid is 0.01 * 1.02 ** np.arange(n) below zmax (pow correctly rounded,
// as glibc's).
func ZGrid(zmax float64) []float64 {
	var zs []float64
	one02 := new(big.Float).SetPrec(512).SetFloat64(1.02)
	acc := new(big.Float).SetPrec(512).SetFloat64(1)
	for i := 0; i < 2000; i++ {
		f, _ := acc.Float64()
		z := 0.01 * f
		if z >= zmax {
			break
		}
		zs = append(zs, z)
		acc.Mul(acc, one02)
	}
	return zs
}

// Gradient is dN/dz at the mid-points of a height grid (np.diff(Ns) /
// np.diff(zs)), with the slopes np.interp precomputes.
type Gradient struct{ zm, gr, slope []float64 }

// NewGradient tabulates dN/dz of air on the grid zs.
func NewGradient(air Air, P0 float64, zs []float64) *Gradient {
	Ns := make([]float64, len(zs))
	for i, z := range zs {
		Ns[i] = air.N(P0, z)
	}
	g := &Gradient{zm: make([]float64, len(zs)-1), gr: make([]float64, len(zs)-1)}
	for i := range g.zm {
		g.zm[i] = (zs[i+1] + zs[i]) / 2
		g.gr[i] = (Ns[i+1] - Ns[i]) / (zs[i+1] - zs[i])
	}
	g.slope = make([]float64, len(g.zm)-1)
	for j := range g.slope {
		g.slope[j] = (g.gr[j+1] - g.gr[j]) / (g.zm[j+1] - g.zm[j])
	}
	return g
}

// At is np.interp(z, zm, gr) (numpy precomputes the slopes when there are
// fewer nodes than points, as here); hint is the ray's last interval.
func (g *Gradient) At(v float64, hint *int) float64 {
	xp, fp := g.zm, g.gr
	n := len(xp)
	switch {
	case math.IsNaN(v):
		return v
	case v < xp[0]:
		return fp[0]
	case v > xp[n-1]:
		return fp[n-1]
	}
	j := *hint
	if j < 0 || j >= n-1 || !(xp[j] <= v && v < xp[j+1]) {
		j = sort.SearchFloat64s(xp, v) // first xp[j] >= v
		if j < n && xp[j] == v {
			*hint = min(j, n-2)
			return fp[j]
		}
		j--
	}
	*hint = j
	if xp[j] == v {
		return fp[j]
	}
	r := float64(g.slope[j]*(v-xp[j])) + fp[j]
	if math.IsNaN(r) {
		r = float64(g.slope[j]*(v-xp[j+1])) + fp[j+1]
		if math.IsNaN(r) && fp[j] == fp[j+1] {
			r = fp[j]
		}
	}
	return r
}

// Linspace is np.linspace(a, b, n).
func Linspace(a, b float64, n int) []float64 {
	step := (b - a) / float64(n-1)
	out := make([]float64, n)
	for i := range out {
		out[i] = float64(float64(i)*step) + a
	}
	out[n-1] = b
	return out
}

// Hidden traces 4,000 rays from -3 to +2 mrad in 5 m steps and returns the
// lowest height (m above the water) a ray from the eye reaches at distance d
// without touching the water; cR = 1/R (globe) or 0 (flat).
func Hidden(g *Gradient, eye, d, cR float64) float64 {
	a := Linspace(-3e-3, 2e-3, 4000)
	const dx = 5.0
	best := math.Inf(1)
	for k := range a {
		z, s, alive, hint := eye, a[k], true, -1
		for x := 0.0; x < d; x += dx {
			s = s + float64((cR+float64(g.At(z, &hint)*1e-6))*dx)
			z = z + float64(s*dx)
			if !(z > 0) {
				alive = false
			}
		}
		if alive && z < best {
			best = z
		}
	}
	return best
}

// TracedAt traces rays of elevation a from eyeW (dx = 2 m) and returns
// their heights at each distance of stops (NaN where the ray met the water).
func TracedAt(g *Gradient, eyeW float64, a []float64, cR float64, stops []float64) [][]float64 {
	const dx = 2.0
	out := make([][]float64, len(stops))
	for i := range out {
		out[i] = make([]float64, len(a))
	}
	for k := range a {
		z, s, alive, hint := eyeW, a[k], true, -1
		x, todo := 0.0, 0
		for todo < len(stops) {
			s = s + float64((cR+float64(g.At(z, &hint)*1e-6))*dx)
			z = z + float64(s*dx)
			x += dx
			if !(z > 0) {
				alive = false
			}
			for todo < len(stops) && x >= stops[todo] {
				if alive {
					out[todo][k] = z
				} else {
					out[todo][k] = math.NaN()
				}
				todo++
			}
		}
	}
	return out
}

// Up is the elevation angle at which the heights h (NaN = blocked) last
// cross H, interpolated; ok false when they never do.
func Up(a, h []float64, H float64) (float64, bool) {
	var aa, hh []float64
	for i, v := range h {
		if !math.IsNaN(v) {
			aa = append(aa, a[i])
			hh = append(hh, v)
		}
	}
	sign := func(x float64) float64 {
		switch {
		case x > 0:
			return 1
		case x < 0:
			return -1
		}
		return 0
	}
	last := -1
	for i := 0; i+1 < len(hh); i++ {
		if sign(hh[i+1]-H)-sign(hh[i]-H) != 0 {
			last = i
		}
	}
	if last < 0 {
		return 0, false
	}
	i := last
	return aa[i] + float64((H-hh[i])/(hh[i+1]-hh[i])*(aa[i+1]-aa[i])), true
}

// Ray follows one ray of initial slope a (rad) from height eye in steps of
// dx m up to distance d (or until it meets the water, z ≤ 0): its height at
// d, and whether it got there.
func Ray(g *Gradient, eye, a, cR, d, dx float64) (float64, bool) {
	z, s, hint := eye, a, -1
	for x := 0.0; x < d; x += dx {
		s += (cR + g.At(z, &hint)*1e-6) * dx
		z += s * dx
		if z <= 0 {
			return z, false
		}
	}
	return z, true
}

// Aim is the initial slope (rad) of the ray from eye that arrives at height
// h at distance d (bisection on the slope, the height at d being increasing
// in it); ok false when no ray in [-0.1, 0.1] rad gets there above the water.
func Aim(g *Gradient, eye, h, cR, d, dx float64) (float64, bool) {
	lo, hi := -0.1, 0.1
	if z, ok := Ray(g, eye, hi, cR, d, dx); !ok || z < h {
		return 0, false
	}
	for range 60 {
		m := (lo + hi) / 2
		if z, ok := Ray(g, eye, m, cR, d, dx); ok && z >= h {
			hi = m
		} else {
			lo = m
		}
	}
	return hi, true
}

// Horizon is the elevation (rad) of the top of the sea seen from eye within
// dmax m: the steepest ray that still meets the water before dmax
// (bisection; a ray that meets the water stays down there).
func Horizon(g *Gradient, eye, cR, dmax, dx float64) float64 {
	lo, hi := -0.1, 0.1
	for range 60 {
		m := (lo + hi) / 2
		if _, ok := Ray(g, eye, m, cR, dmax, dx); ok {
			hi = m
		} else {
			lo = m
		}
	}
	return lo
}
