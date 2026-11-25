package seismesh

import "math"

// Unit vector of (lat, lon) degrees.
func unit(lat, lon float64) []float64 {
	p, l := lat*math.Pi/180, lon*math.Pi/180
	return []float64{math.Cos(p) * math.Cos(l), math.Cos(p) * math.Sin(l), math.Sin(p)}
}

// AlignError: after the best rotation (or mirror) and scale, the rms angular distance (degrees) between the fitted
// 3D points and the stations' real positions, and the sign of the mirror. A CHECK only: coordinates never enter the fit.
func AlignError(X [][]float64, loc [][2]float64) (rms float64, mirrored bool) {
	best := math.Inf(1)
	for _, sgn := range []float64{1, -1} {
		e := alignOnce(X, loc, sgn)
		if e < best {
			best, mirrored = e, sgn < 0
		}
	}
	return best, mirrored
}

func alignOnce(X [][]float64, loc [][2]float64, sgn float64) float64 {
	e, _ := AlignRot(X, loc, sgn)
	return e
}

// AlignRot is alignOnce with the rotation: a R ~ t for a the fitted directions from the cloud's centre (z times sgn) and
// t the real unit vectors (x to 0° 0°, z to the North Pole). Drawing only (the page turns the cloud onto the map with it).
func AlignRot(X [][]float64, loc [][2]float64, sgn float64) (float64, [3][3]float64) {
	n := len(X)
	c, _, _ := SphereFit(X)   // the cloud's own centre, not its centroid
	A := make([][]float64, n) // centred, mirrored fitted points, unit length (direction from the centre)
	T := make([][]float64, n)
	for i, x := range X {
		a := []float64{x[0] - c[0], x[1] - c[1], sgn * (x[2] - c[2])}
		l := math.Sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2])
		A[i] = []float64{a[0] / l, a[1] / l, a[2] / l}
		T[i] = unit(loc[i][0], loc[i][1])
	}
	var H [3][3]float64
	for i := range A {
		for a := 0; a < 3; a++ {
			for b := 0; b < 3; b++ {
				H[a][b] += A[i][a] * T[i][b]
			}
		}
	}
	R := polar(H)
	// the polar factor may be a reflection (det -1): a rotation only is allowed, the mirror is sgn's to carry
	// (2026-11-25: avia-mesh's sphere came out a mirror image, matched by a reflection the page cannot apply)
	if det3(R) < 0 {
		return math.Inf(1), R
	}
	var sq float64
	for i := range A {
		var v [3]float64
		for a := 0; a < 3; a++ {
			for b := 0; b < 3; b++ {
				v[b] += A[i][a] * R[a][b]
			}
		}
		d := math.Acos(math.Max(-1, math.Min(1, v[0]*T[i][0]+v[1]*T[i][1]+v[2]*T[i][2]))) * 180 / math.Pi
		sq += d * d
	}
	return math.Sqrt(sq / float64(n)), R
}

// polar: the rotation closest to H (H = sum a_i t_i^T, so that a_i R ~ t_i), Newton iteration on the polar factor.
func polar(H [3][3]float64) [3][3]float64 {
	M := H
	for it := 0; it < 60; it++ {
		inv := inv3(M)
		var N [3][3]float64
		for a := 0; a < 3; a++ {
			for b := 0; b < 3; b++ {
				N[a][b] = 0.5 * (M[a][b] + inv[b][a])
			}
		}
		M = N
	}
	return M
}

func inv3(m [3][3]float64) [3][3]float64 {
	d := m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0])
	var r [3][3]float64
	r[0][0] = (m[1][1]*m[2][2] - m[1][2]*m[2][1]) / d
	r[0][1] = (m[0][2]*m[2][1] - m[0][1]*m[2][2]) / d
	r[0][2] = (m[0][1]*m[1][2] - m[0][2]*m[1][1]) / d
	r[1][0] = (m[1][2]*m[2][0] - m[1][0]*m[2][2]) / d
	r[1][1] = (m[0][0]*m[2][2] - m[0][2]*m[2][0]) / d
	r[1][2] = (m[0][2]*m[1][0] - m[0][0]*m[1][2]) / d
	r[2][0] = (m[1][0]*m[2][1] - m[1][1]*m[2][0]) / d
	r[2][1] = (m[0][1]*m[2][0] - m[0][0]*m[2][1]) / d
	r[2][2] = (m[0][0]*m[1][1] - m[0][1]*m[1][0]) / d
	return r
}

func det3(m [3][3]float64) float64 {
	return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0])
}
