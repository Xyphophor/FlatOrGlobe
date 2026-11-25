// Least squares from the centre of the Earth (Gauss-Newton). Uses predicted() above.
// The page also adds the troposphere, the ionosphere and a 10-degree mask from step 4,
// and one receiver clock per system (GPS, Galileo); this keeps GPS only.
// import "math"

// solve4 solves the 4x4 system A z = r (Gaussian elimination with pivoting).
func solve4(A [4][4]float64, r [4]float64) [4]float64 {
	for i := 0; i < 4; i++ {
		p := i
		for k := i + 1; k < 4; k++ {
			if math.Abs(A[k][i]) > math.Abs(A[p][i]) {
				p = k
			}
		}
		A[i], A[p] = A[p], A[i]
		r[i], r[p] = r[p], r[i]
		for k := i + 1; k < 4; k++ {
			f := A[k][i] / A[i][i]
			for j := i; j < 4; j++ {
				A[k][j] -= f * A[i][j]
			}
			r[k] -= f * r[i]
		}
	}
	var z [4]float64
	for i := 3; i >= 0; i-- {
		z[i] = r[i]
		for j := i + 1; j < 4; j++ {
			z[i] -= A[i][j] * z[j]
		}
		z[i] /= A[i][i]
	}
	return z
}

// solveEpoch: satellites seen at the same instant t. Returns x (m), clock b (m), rms (m).
func solveEpoch(eph []Eph, pr []float64, t float64) ([3]float64, float64, float64) {
	var x [3]float64 // start: the origin, no idea where we are
	var b float64
	var dx [4]float64
	H := make([][4]float64, len(pr))
	y := make([]float64, len(pr))
	for step := 0; step < 15; step++ {
		var N [4][4]float64
		var r [4]float64
		for i := range pr {
			rho, s := predicted(eph[i], x, b, pr[i], t)
			d := math.Hypot(math.Hypot(s[0]-x[0], s[1]-x[1]), s[2]-x[2])
			for k := 0; k < 3; k++ {
				H[i][k] = -(s[k] - x[k]) / d // minus the unit vector towards the satellite
			}
			H[i][3] = 1                  // the receiver clock
			y[i] = pr[i] - rho           // measured - computed
			for p := 0; p < 4; p++ {     // normal equations
				r[p] += H[i][p] * y[i]
				for q := 0; q < 4; q++ {
					N[p][q] += H[i][p] * H[i][q]
				}
			}
		}
		dx = solve4(N, r) // dx = (H^T H)^-1 H^T y
		for k := 0; k < 3; k++ {
			x[k] += dx[k]
		}
		b += dx[3]
		if math.Sqrt(dx[0]*dx[0]+dx[1]*dx[1]+dx[2]*dx[2]) < 1e-3 {
			break
		}
	}
	ss := 0.0
	for i := range pr {
		v := y[i]
		for k := 0; k < 4; k++ {
			v -= H[i][k] * dx[k]
		}
		ss += v * v
	}
	return x, b, math.Sqrt(ss / float64(len(pr)))
}
