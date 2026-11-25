/* The terms of the equation: satellite clock, Earth's rotation during the flight, troposphere.
   (The ionosphere, Klobuchar's model, is klobuchar() in src/tabs/rx/userlogic.js.) */
#include <math.h>

/* Satellite clock offset (s): polynomial + relativistic term - group delay. */
double sat_clock(const Eph *e, double t, double E, double mu) {
    double dt = wrap_week(t - e->toc);
    double rel = -2 * sqrt(mu) * e->sqrt_a * e->ecc * sin(E) / (C_LIGHT * C_LIGHT);
    return e->af0 + e->af1 * dt + e->af2 * dt * dt + rel - e->tgd;
}

/* The Earth turns by OMEGA_E*tau while the signal flies: rotate s about the z axis. */
void sagnac(double s[3], double tau) {
    double th = OMEGA_E * tau, x = s[0], y = s[1];
    s[0] = x * cos(th) + y * sin(th);
    s[1] = -x * sin(th) + y * cos(th);
}

/* Saastamoinen delay (m), standard atmosphere at height h (m), elevation el (degrees). */
double tropo(double el_deg, double h) {
    h = fmax(-100.0, fmin(h, 8000.0));
    double p = 1013.25 * pow(1 - 2.2557e-5 * h, 5.2568);     /* pressure (hPa) */
    double T = 15 - 6.5e-3 * h + 273.16;                      /* temperature (K) */
    double ew = 6.108 * 0.5 * exp((17.15 * T - 4684) / (T - 38.45));
    double z = (90 - fmax(el_deg, 5)) * M_PI / 180;           /* zenith distance */
    return 0.002277 / cos(z) * (p + (1255 / T + 0.05) * ew - tan(z) * tan(z));
}

/* What the pseudorange should be from x with clock b (m), atmosphere left out; s = satellite. */
double predicted(const Eph *e, const double x[3], double b, double pr, double t, double s[3]) {
    double tau = (pr - b) / C_LIGHT;                          /* flight time */
    double E = sat_pos(e, t - tau, MU_GPS, s);                /* where it was at emission */
    sagnac(s, tau);                                           /* ... in the frame of reception */
    double d = sqrt(pow(s[0] - x[0], 2) + pow(s[1] - x[1], 2) + pow(s[2] - x[2], 2));
    return d + b - C_LIGHT * sat_clock(e, t - tau, E, MU_GPS);
}
