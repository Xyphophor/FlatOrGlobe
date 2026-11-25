/* Pseudorange from the clock fields of an Android "Raw" line (GnssLogger, GPSTest). */
#include <stdint.h>
#include <math.h>
#define C_LIGHT 299792458.0                   /* speed of light (m/s) */
#define WEEK_NS 604800000000000LL             /* one GPS week, in nanoseconds */

/* Keep a measurement only if the time of week was decoded (State bit 8 or 16384), on L1/E1. */
int usable(int state, double sv_time_uncertainty_ns, double carrier_hz) {
    return (state & (8 | 16384)) && sv_time_uncertainty_ns < 500
        && fabs(carrier_hz - 1575.42e6) < 1e6;
}

/* 64-bit integers: a double would lose the nanoseconds of FullBiasNanos (about -1.5e18). */
double pseudorange(int64_t time_nanos, int64_t full_bias_nanos, double bias_nanos,
                   double time_offset_nanos, int64_t received_sv_time_nanos) {
    int64_t gps_ns = time_nanos - full_bias_nanos;            /* phone clock in GPS time */
    double t_rx = (double)(gps_ns % WEEK_NS) - bias_nanos + time_offset_nanos;
    double dt = t_rx - (double)received_sv_time_nanos;        /* minus the emission time */
    if (dt < -WEEK_NS / 2) dt += WEEK_NS;                     /* sent last week */
    return dt * 1e-9 * C_LIGHT;                               /* metres */
}
