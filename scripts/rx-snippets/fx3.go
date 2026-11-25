// The terms of the equation: satellite clock, Earth's rotation during the flight, troposphere.
// (The ionosphere, Klobuchar's model, is klobuchar() in src/tabs/rx/userlogic.js.)
// import "math"

// satClock is the satellite clock offset (s): polynomial + relativistic term - group delay.
func satClock(e Eph, t, E, mu float64) float64 {
	dt := wrapWeek(t - e.toc)
	rel := -2 * math.Sqrt(mu) * e.sqrt_a * e.ecc * math.Sin(E) / (cLight * cLight)
	return e.af0 + e.af1*dt + e.af2*dt*dt + rel - e.tgd
}

// sagnac: the Earth turns by omegaE*tau while the signal flies; rotate s about the z axis.
func sagnac(s [3]float64, tau float64) [3]float64 {
	th := omegaE * tau
	return [3]float64{s[0]*math.Cos(th) + s[1]*math.Sin(th), -s[0]*math.Sin(th) + s[1]*math.Cos(th), s[2]}
}

// tropo is Saastamoinen's delay (m), standard atmosphere at height h (m), elevation el (degrees).
func tropo(elDeg, h float64) float64 {
	h = math.Max(-100, math.Min(h, 8000))
	p := 1013.25 * math.Pow(1-2.2557e-5*h, 5.2568)               // pressure (hPa)
	T := 15 - 6.5e-3*h + 273.16                                  // temperature (K)
	ew := 6.108 * 0.5 * math.Exp((17.15*T-4684)/(T-38.45))       // water vapour
	z := (90 - math.Max(elDeg, 5)) * math.Pi / 180               // zenith distance
	return 0.002277 / math.Cos(z) * (p + (1255/T+0.05)*ew - math.Pow(math.Tan(z), 2))
}

// predicted: what the pseudorange should be from x with clock b (m), atmosphere left out.
func predicted(e Eph, x [3]float64, b, pr, t float64) (float64, [3]float64) {
	tau := (pr - b) / cLight                     // flight time
	s, E := satPos(e, t-tau, muGPS)              // where the satellite was at emission
	s = sagnac(s, tau)                           // ... in the frame of reception
	d := math.Hypot(math.Hypot(s[0]-x[0], s[1]-x[1]), s[2]-x[2])
	return d + b - cLight*satClock(e, t-tau, E, muGPS), s
}
