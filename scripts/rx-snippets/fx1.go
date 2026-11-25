// Pseudorange from the clock fields of an Android "Raw" line (GnssLogger, GPSTest).
// import "math"
const cLight = 299792458.0         // speed of light (m/s)
const weekNs int64 = 604800e9      // one GPS week, in nanoseconds

// usable keeps a measurement only if the time of week was decoded (State bit 8 or 16384), on L1/E1.
func usable(state int, svTimeUncertaintyNs, carrierHz float64) bool {
	return state&(8|16384) != 0 && svTimeUncertaintyNs < 500 && math.Abs(carrierHz-1575.42e6) < 1e6
}

// pseudorange in metres. int64: a float64 would lose the nanoseconds of FullBiasNanos (about -1.5e18).
func pseudorange(timeNanos, fullBiasNanos int64, biasNanos, timeOffsetNanos float64, receivedSvTimeNanos int64) float64 {
	gpsNs := timeNanos - fullBiasNanos                                     // phone clock in GPS time
	tRx := float64(gpsNs%weekNs) - biasNanos + timeOffsetNanos             // reception, ns in the week
	dt := tRx - float64(receivedSvTimeNanos)                               // minus the emission time
	if dt < -float64(weekNs)/2 {                                           // sent last week
		dt += float64(weekNs)
	}
	return dt * 1e-9 * cLight
}
