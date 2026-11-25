# Pseudorange from the clock fields of an Android "Raw" line (GnssLogger, GPSTest).
C = 299_792_458.0               # speed of light (m/s)
WEEK_NS = 604_800 * 10**9       # one GPS week, in nanoseconds

def usable(state, sv_time_uncertainty_ns, carrier_hz):
    """Keep a measurement only if the time of week was decoded from the signal
    (State bit 8 or 16384), on L1/E1, with a small uncertainty."""
    tow_decoded = (state & 8) or (state & 16384)
    return bool(tow_decoded) and sv_time_uncertainty_ns < 500 and abs(carrier_hz - 1575.42e6) < 1e6

def pseudorange(time_nanos, full_bias_nanos, bias_nanos, time_offset_nanos, received_sv_time_nanos):
    # Python integers never round: FullBiasNanos (about -1.5e18) keeps every nanosecond
    gps_ns = time_nanos - full_bias_nanos                  # phone clock, shifted to GPS time
    t_rx = gps_ns % WEEK_NS - bias_nanos + time_offset_nanos   # reception, ns since the week began
    dt = t_rx - received_sv_time_nanos                     # minus the emission time read in the signal
    if dt < -WEEK_NS / 2:                                  # sent last week, received this week
        dt += WEEK_NS
    return dt * 1e-9 * C                                   # metres
