// Satellite position from the broadcast elements (IS-GPS-200, Table 20-IV).
// import "math"
const omegaE = 7.2921151467e-5 // Earth's rotation rate (rad/s)
const muGPS = 3.986005e14      // GM (m^3/s^2); Galileo: 3.986004418e14

// Eph is one record of the navigation file.
type Eph struct {
	sqrt_a, dn, M0, ecc, omega, cus, cuc, crs, crc, cis, cic,
	i0, idot, Omega0, Omega_dot, toe, toc, af0, af1, af2, tgd float64
}

// wrapWeek brings a time difference into [-half a week, +half a week).
func wrapWeek(dt float64) float64 {
	r := math.Mod(dt+302400, 604800)
	if r < 0 {
		r += 604800
	}
	return r - 302400
}

// satPos returns the Earth-fixed position (m) at t (seconds of the week), and E for the clock.
func satPos(e Eph, t, mu float64) ([3]float64, float64) {
	a := e.sqrt_a * e.sqrt_a
	tk := wrapWeek(t - e.toe)                            // time since the reference epoch
	M := e.M0 + (math.Sqrt(mu/(a*a*a))+e.dn)*tk         // mean anomaly
	E := M
	for k := 0; k < 12; k++ {                           // Kepler: E - e sin E = M
		E = M + e.ecc*math.Sin(E)
	}
	nu := math.Atan2(math.Sqrt(1-e.ecc*e.ecc)*math.Sin(E), math.Cos(E)-e.ecc)
	phi := nu + e.omega
	s2, c2 := math.Sin(2*phi), math.Cos(2*phi)          // six small corrections
	u := phi + e.cus*s2 + e.cuc*c2
	r := a*(1-e.ecc*math.Cos(E)) + e.crs*s2 + e.crc*c2
	i := e.i0 + e.idot*tk + e.cis*s2 + e.cic*c2
	xp, yp := r*math.Cos(u), r*math.Sin(u)              // in the orbital plane
	Om := e.Omega0 + (e.Omega_dot-omegaE)*tk - omegaE*e.toe
	return [3]float64{xp*math.Cos(Om) - yp*math.Cos(i)*math.Sin(Om),
		xp*math.Sin(Om) + yp*math.Cos(i)*math.Cos(Om), yp * math.Sin(i)}, E
}
