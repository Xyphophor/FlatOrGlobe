// Package tmerc is PROJ's exact transverse Mercator (Poder/Engsager,
// src/projections/tmerc.cpp of PROJ 9.6, the algorithm PROJ's proj.ini
// selects by default), ported line for line so that a UTM easting/northing
// agrees with pyproj to the last bit. The transformation WGS84 -> GDA2020
// that EPSG:4326 -> EPSG:7854 (MGA zone 54) goes through is PROJ's null
// "GDA2020 to WGS 84 (2)": only the projection remains (epic24, Adelaide).
//
// The method is Krüger's series in the third flattening n (to n⁶) between
// the ellipsoid and a conformal sphere, then the spherical transverse
// Mercator, evaluated by Clenshaw summation:
//
//   - K. Engsager, K. Poder, "A highly accurate world wide algorithm for the transverse Mercator
//     mapping (almost)", Proc. XXIII International Cartographic Conference, Moscow (2007);
//   - L. Krüger, Konforme Abbildung des Erdellipsoids in der Ebene, Königlich Preussisches
//     Geodätisches Institut, Neue Folge 52, Potsdam (1912);
//   - C. F. F. Karney, "Transverse Mercator with an accuracy of a few nanometers", Journal of
//     Geodesy 85 (2011) 475-485 (accuracy of the n⁶ series: 5 nm within 3,900 km of the meridian);
//   - R. König, K. H. Weise, Mathematische Grundlagen der höheren Geodäsie und Kartographie,
//     Springer, Berlin (1951), the source of the coefficients PROJ cites (p. 186-196);
//   - UTM: k0 = 0.9996, false easting 500 km, false northing 10,000 km south (NGA, DMA TM 8358.2).
//   - GRS80: a = 6,378,137 m, 1/f = 298.257222101 (Moritz, "Geodetic Reference System 1980",
//     Journal of Geodesy 74 (2000) 128-133).
package tmerc

import (
	"math"

	"flatorglobe/tools/internal/pymath"
)

const order = 6

// degFactor is PROJ's "deg" angular unit (unitconvert: x * f forward, x / f back).
const degFactor = 0.017453292519943296

// Proj is one transverse Mercator with its precomputed series.
type Proj struct {
	a, k0, lam0, x0, y0 float64
	cgb, cbg, utg, gtu  [order]float64
	qn, zb              float64
}

// UTM returns zone `zone` of the given ellipsoid (a, 1/f); south adds the
// 10,000 km false northing.
func UTM(zone int, south bool, a, rf float64) *Proj {
	p := &Proj{a: a, k0: 0.9996, x0: 500000}
	z := float64(zone - 1)
	p.lam0 = z + .5
	p.lam0 = p.lam0 * math.Pi / 30. // utm.cpp: (zone + .5) * M_PI / 30. - M_PI, zone counted from 0
	p.lam0 -= math.Pi
	if south {
		p.y0 = 10000000
	}
	f := 1 / rf
	es := 2*f - f*f
	e := math.Sqrt(es)
	alpha := math.Asin(e)
	t := math.Tan(alpha / 2)
	p.setup(t * t)
	return p
}

// GRS80 constants (GDA2020).
const (
	GRS80A  = 6378137.0
	GRS80RF = 298.257222101
)

// MGA54 is EPSG:7854, GDA2020 / MGA zone 54.
func MGA54() *Proj { return UTM(54, true, GRS80A, GRS80RF) }

func gatg(p1 *[order]float64, B, cos2B, sin2B float64) float64 {
	var h, h2 float64
	twoCos2B := 2 * cos2B
	i := order - 1
	h1 := p1[i]
	for i > 0 {
		i--
		h = -h2 + float64(twoCos2B*h1) + p1[i]
		h2 = h1
		h1 = h
	}
	return B + float64(h*sin2B)
}

// clenS is the complex Clenshaw summation; it returns R and I.
func clenS(a *[order]float64, sinR, cosR, sinhI, coshI float64) (float64, float64) {
	i := order - 1
	r := float64(2*cosR) * coshI
	im := float64(-2*sinR) * sinhI
	var hi1, hr1, hi float64
	hr := a[i]
	for i > 0 {
		hr2, hi2 := hr1, hi1
		hr1, hi1 = hr, hi
		i--
		hr = -hr2 + float64(r*hr1) - float64(im*hi1) + a[i]
		hi = -hi2 + float64(im*hr1) + float64(r*hi1)
	}
	r = sinR * coshI
	im = cosR * sinhI
	return float64(r*hr) - float64(im*hi), float64(r*hi) + float64(im*hr)
}

func clens(a *[order]float64, argR float64) float64 {
	i := order - 1
	r := 2 * math.Cos(argR)
	var hr1 float64
	hr := a[i]
	for i > 0 {
		hr2 := hr1
		hr1 = hr
		i--
		hr = -hr2 + float64(r*hr1) + a[i]
	}
	return math.Sin(argR) * hr
}

func (q *Proj) setup(n float64) {
	np := n
	q.cgb[0] = n * (2 + n*(-2/3.0+n*(-2+n*(116/45.0+n*(26/45.0+n*(-2854/675.0))))))
	q.cbg[0] = n * (-2 + n*(2/3.0+n*(4/3.0+n*(-82/45.0+n*(32/45.0+n*(4642/4725.0))))))
	np *= n
	q.cgb[1] = np * (7/3.0 + n*(-8/5.0+n*(-227/45.0+n*(2704/315.0+n*(2323/945.0)))))
	q.cbg[1] = np * (5/3.0 + n*(-16/15.0+n*(-13/9.0+n*(904/315.0+n*(-1522/945.0)))))
	np *= n
	q.cgb[2] = np * (56/15.0 + n*(-136/35.0+n*(-1262/105.0+n*(73814/2835.0))))
	q.cbg[2] = np * (-26/15.0 + n*(34/21.0+n*(8/5.0+n*(-12686/2835.0))))
	np *= n
	q.cgb[3] = np * (4279/630.0 + n*(-332/35.0+n*(-399572/14175.0)))
	q.cbg[3] = np * (1237/630.0 + n*(-12/5.0+n*(-24832/14175.0)))
	np *= n
	q.cgb[4] = np * (4174/315.0 + n*(-144838/6237.0))
	q.cbg[4] = np * (-734/315.0 + n*(109598/31185.0))
	np *= n
	q.cgb[5] = np * (601676 / 22275.0)
	q.cbg[5] = np * (444337 / 155925.0)

	np = n * n
	q.qn = q.k0 / (1 + n) * (1 + np*(1/4.0+np*(1/64.0+np/256.0)))
	q.utg[0] = n * (-0.5 + n*(2/3.0+n*(-37/96.0+n*(1/360.0+n*(81/512.0+n*(-96199/604800.0))))))
	q.gtu[0] = n * (0.5 + n*(-2/3.0+n*(5/16.0+n*(41/180.0+n*(-127/288.0+n*(7891/37800.0))))))
	q.utg[1] = np * (-1/48.0 + n*(-1/15.0+n*(437/1440.0+n*(-46/105.0+n*(1118711/3870720.0)))))
	q.gtu[1] = np * (13/48.0 + n*(-3/5.0+n*(557/1440.0+n*(281/630.0+n*(-1983433/1935360.0)))))
	np *= n
	q.utg[2] = np * (-17/480.0 + n*(37/840.0+n*(209/4480.0+n*(-5569/90720.0))))
	q.gtu[2] = np * (61/240.0 + n*(-103/140.0+n*(15061/26880.0+n*(167603/181440.0))))
	np *= n
	q.utg[3] = np * (-4397/161280.0 + n*(11/504.0+n*(830251/7257600.0)))
	q.gtu[3] = np * (49561/161280.0 + n*(-179/168.0+n*(6601661/7257600.0)))
	np *= n
	q.utg[4] = np * (-4583/161280.0 + n*(108847/3991680.0))
	q.gtu[4] = np * (34729/80640.0 + n*(-3418889/1995840.0))
	np *= n
	q.utg[5] = np * (-20648693 / 638668800.0)
	q.gtu[5] = np * (212378941 / 319334400.0)

	// phi0 = 0: Z = gatg(cbg, 0, 1, 0) = 0, Zb = -Qn * (0 + clens(gtu, 0)) = -0
	z := gatg(&q.cbg, 0, math.Cos(0), math.Sin(0))
	q.zb = -q.qn * (z + clens(&q.gtu, 2*z))
}

// adjlon is PROJ's adjlon.
func adjlon(l float64) float64 {
	if math.Abs(l) < math.Pi+1e-12 {
		return l
	}
	l += math.Pi
	l -= 2 * math.Pi * math.Floor(l/(2*math.Pi))
	return l - math.Pi
}

// Fwd projects (lon, lat) in degrees to (easting, northing) in metres.
func (q *Proj) Fwd(lon, lat float64) (x, y float64) {
	lam := lon * degFactor
	phi := lat * degFactor
	lam = adjlon(lam - q.lam0)

	cn := gatg(&q.cbg, phi, math.Cos(2*phi), math.Sin(2*phi))
	sinCn, cosCn := math.Sin(cn), math.Cos(cn)
	sinCe, cosCe := math.Sin(lam), math.Cos(lam)
	cosCnCosCe := cosCn * cosCe
	cn = math.Atan2(sinCn, cosCnCosCe)
	invDenom := 1. / pymath.Hypot(sinCn, cosCnCosCe)
	tanCe := sinCe * cosCn * invDenom
	ce := math.Asinh(tanCe)
	twoInv := 2 * invDenom
	twoInvSq := twoInv * invDenom
	tmpR := cosCnCosCe * twoInvSq
	sinArgR := sinCn * tmpR
	cosArgR := float64(cosCnCosCe*tmpR) - 1
	sinhArgI := tanCe * twoInv
	coshArgI := twoInvSq - 1
	dCn, dCe := clenS(&q.gtu, sinArgR, cosArgR, sinhArgI, coshArgI)
	cn += dCn
	ce += dCe
	if math.Abs(ce) > 2.623395162778 {
		return math.Inf(1), math.Inf(1)
	}
	y = float64(q.qn*cn) + q.zb
	x = q.qn * ce
	// PJ_IO_UNITS_CLASSIC: times a, then false easting/northing (fr_meter = 1)
	x *= q.a
	y *= q.a
	return 1 * (x + q.x0), 1 * (y + q.y0)
}

// Inv is the inverse: (easting, northing) in metres to (lon, lat) in degrees.
func (q *Proj) Inv(x, y float64) (lon, lat float64) {
	x = 1*x - q.x0
	y = 1*y - q.y0
	x *= 1. / q.a
	y *= 1. / q.a

	cn := (y - q.zb) / q.qn
	ce := x / q.qn
	if math.Abs(ce) > 2.623395162778 {
		return math.Inf(1), math.Inf(1)
	}
	sinArgR, cosArgR := math.Sin(2*cn), math.Cos(2*cn)
	exp2Ce := math.Exp(2 * ce)
	halfInv := 0.5 / exp2Ce
	sinhArgI := 0.5*exp2Ce - halfInv
	coshArgI := 0.5*exp2Ce + halfInv
	dCn, dCe := clenS(&q.utg, sinArgR, cosArgR, sinhArgI, coshArgI)
	cn += dCn
	ce += dCe
	sinCn, cosCn := math.Sin(cn), math.Cos(cn)
	sinhCe := math.Sinh(ce)
	ce = math.Atan2(sinhCe, cosCn)
	modulus := pymath.Hypot(sinhCe, cosCn)
	cn = math.Atan2(sinCn, modulus)
	tmp := 2 * modulus / (float64(sinhCe*sinhCe) + 1)
	sin2Cn := sinCn * tmp
	cos2Cn := float64(tmp*modulus) - 1.
	phi := gatg(&q.cgb, cn, cos2Cn, sin2Cn)
	lam := adjlon(ce + 0 + q.lam0)
	return lam / degFactor, phi / degFactor
}
