// The bulge: height s of an arc of radius R above its chord L.
// import "math"
func sagitta(R, L float64) float64 {
	return R - math.Sqrt(R*R-(L/2)*(L/2)) // about L*L / (8 R)
}
