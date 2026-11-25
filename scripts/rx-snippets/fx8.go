// The two radii of curvature of the WGS84 ellipsoid at latitude phi.
// import "math"
const wgsA, wgsF = 6378137.0, 1 / 298.257223563
const wgsE2 = wgsF * (2 - wgsF)

func radiusM(latDeg float64) float64 { // north-south
	s := math.Sin(latDeg * math.Pi / 180)
	return wgsA * (1 - wgsE2) / math.Pow(1-wgsE2*s*s, 1.5)
}

func radiusN(latDeg float64) float64 { // east-west
	s := math.Sin(latDeg * math.Pi / 180)
	return wgsA / math.Sqrt(1-wgsE2*s*s)
}
