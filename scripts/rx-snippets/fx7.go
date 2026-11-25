// The group's sphere |p - c| = R, centre and radius free, and the uncertainty on R.
// Uses solve4() above.
// import "math"

// jrow: derivatives of |p - c| - R with respect to c and R, and the distance |p - c|.
func jrow(p, c [3]float64) ([4]float64, float64) {
	d := [3]float64{p[0] - c[0], p[1] - c[1], p[2] - c[2]}
	n := math.Sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2])
	return [4]float64{-d[0] / n, -d[1] / n, -d[2] / n, -1}, n
}

func fitSphere(P [][3]float64) ([3]float64, float64) {
	var A [4][4]float64
	var r [4]float64
	for _, p := range P { // 1. linear guess: |p|^2 = 2 c.p + (R^2 - |c|^2)
		row := [4]float64{2 * p[0], 2 * p[1], 2 * p[2], 1}
		y := p[0]*p[0] + p[1]*p[1] + p[2]*p[2]
		for a := 0; a < 4; a++ {
			r[a] += row[a] * y
			for b := 0; b < 4; b++ {
				A[a][b] += row[a] * row[b]
			}
		}
	}
	z := solve4(A, r)
	c := [3]float64{z[0], z[1], z[2]}
	R := math.Sqrt(z[3] + c[0]*c[0] + c[1]*c[1] + c[2]*c[2])
	for it := 0; it < 8; it++ { // 2. Gauss-Newton on |p - c| - R
		var N [4][4]float64
		var g [4]float64
		for _, p := range P {
			row, n := jrow(p, c)
			for a := 0; a < 4; a++ {
				g[a] -= row[a] * (n - R)
				for b := 0; b < 4; b++ {
					N[a][b] += row[a] * row[b]
				}
			}
		}
		z = solve4(N, g)
		c = [3]float64{c[0] + z[0], c[1] + z[1], c[2] + z[2]}
		R += z[3]
	}
	return c, R
}

// covRR is element (R, R) of (J^T W J)^-1, solved with the last unit vector.
func covRR(P [][3]float64, w []float64, c [3]float64) float64 {
	var N [4][4]float64
	for i, p := range P {
		row, _ := jrow(p, c)
		for a := 0; a < 4; a++ {
			for b := 0; b < 4; b++ {
				N[a][b] += w[i] * row[a] * row[b]
			}
		}
	}
	return math.Abs(solve4(N, [4]float64{0, 0, 0, 1})[3])
}

// sigmaR: the larger of what the rounding alone causes and what the real scatter says (n > 4).
func sigmaR(P [][3]float64, q []float64, c [3]float64, R float64) float64 {
	n := len(P)
	w, ones, ss := make([]float64, n), make([]float64, n), 0.0
	for i, p := range P {
		w[i] = 1 / (q[i]*q[i]/12 + 20*20) // rounding, and a fix good to 20 m
		ones[i] = 1
		_, d := jrow(p, c)
		ss += (d - R) * (d - R)
	}
	noise := math.Sqrt(covRR(P, w, c))
	if n == 4 {
		return noise // the sphere passes through all four
	}
	return math.Max(noise, math.Sqrt(covRR(P, ones, c)*ss/float64(n-4)))
}
