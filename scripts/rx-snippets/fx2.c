/* Satellite position from the broadcast elements (IS-GPS-200, Table 20-IV). */
#include <math.h>
#define OMEGA_E 7.2921151467e-5               /* Earth's rotation rate (rad/s) */
#define MU_GPS 3.986005e14                    /* GM (m^3/s^2); Galileo: 3.986004418e14 */

typedef struct {                              /* one record of the navigation file */
    double sqrt_a, dn, M0, ecc, omega, cus, cuc, crs, crc, cis, cic,
           i0, idot, Omega0, Omega_dot, toe, toc, af0, af1, af2, tgd;
} Eph;

double wrap_week(double dt) {                 /* into [-half a week, +half a week) */
    double r = fmod(dt + 302400.0, 604800.0);
    return (r < 0 ? r + 604800.0 : r) - 302400.0;
}

/* Earth-fixed position s (m) at t (seconds of the week); returns E, which the clock needs. */
double sat_pos(const Eph *e, double t, double mu, double s[3]) {
    double a = e->sqrt_a * e->sqrt_a;
    double tk = wrap_week(t - e->toe);                        /* time since the reference epoch */
    double M = e->M0 + (sqrt(mu / (a * a * a)) + e->dn) * tk; /* mean anomaly */
    double E = M;
    for (int k = 0; k < 12; k++) E = M + e->ecc * sin(E);     /* Kepler: E - e sin E = M */
    double nu = atan2(sqrt(1 - e->ecc * e->ecc) * sin(E), cos(E) - e->ecc);
    double phi = nu + e->omega, s2 = sin(2 * phi), c2 = cos(2 * phi);
    double u = phi + e->cus * s2 + e->cuc * c2;               /* six small corrections */
    double r = a * (1 - e->ecc * cos(E)) + e->crs * s2 + e->crc * c2;
    double i = e->i0 + e->idot * tk + e->cis * s2 + e->cic * c2;
    double xp = r * cos(u), yp = r * sin(u);                  /* in the orbital plane */
    double Om = e->Omega0 + (e->Omega_dot - OMEGA_E) * tk - OMEGA_E * e->toe;
    s[0] = xp * cos(Om) - yp * cos(i) * sin(Om);
    s[1] = xp * sin(Om) + yp * cos(i) * cos(Om);
    s[2] = yp * sin(i);
    return E;
}
