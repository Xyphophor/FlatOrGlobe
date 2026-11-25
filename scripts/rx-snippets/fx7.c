/* The group's sphere |p - c| = R, centre and radius free, and the uncertainty on R.
   Uses solve4() above. */
#include <math.h>

/* Rows of J: derivatives of |p - c| - R with respect to c and R. */
static void jrow(const double p[3], const double c[3], double row[4], double *dist) {
    double d[3] = {p[0] - c[0], p[1] - c[1], p[2] - c[2]};
    *dist = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    for (int k = 0; k < 3; k++) row[k] = -d[k] / *dist;
    row[3] = -1;
}

void fit_sphere(const double (*P)[3], int n, double c[3], double *R) {
    double A[4][4] = {{0}}, r[4] = {0}, z[4];
    for (int i = 0; i < n; i++) {             /* 1. linear guess: |p|^2 = 2 c.p + (R^2 - |c|^2) */
        double row[4] = {2 * P[i][0], 2 * P[i][1], 2 * P[i][2], 1};
        double y = P[i][0] * P[i][0] + P[i][1] * P[i][1] + P[i][2] * P[i][2];
        for (int a = 0; a < 4; a++) { r[a] += row[a] * y; for (int b = 0; b < 4; b++) A[a][b] += row[a] * row[b]; }
    }
    solve4(A, r, z);
    for (int k = 0; k < 3; k++) c[k] = z[k];
    *R = sqrt(z[3] + c[0] * c[0] + c[1] * c[1] + c[2] * c[2]);
    for (int it = 0; it < 8; it++) {          /* 2. Gauss-Newton on |p - c| - R */
        double N[4][4] = {{0}}, g[4] = {0}, row[4], dist;
        for (int i = 0; i < n; i++) {
            jrow(P[i], c, row, &dist);
            for (int a = 0; a < 4; a++) { g[a] -= row[a] * (dist - *R); for (int b = 0; b < 4; b++) N[a][b] += row[a] * row[b]; }
        }
        solve4(N, g, z);
        for (int k = 0; k < 3; k++) c[k] += z[k];
        *R += z[3];
    }
}

/* Element (R, R) of (J^T W J)^-1, by solving with the last unit vector. */
static double cov_RR(const double (*P)[3], const double *w, int n, const double c[3]) {
    double N[4][4] = {{0}}, e4[4] = {0, 0, 0, 1}, z[4], row[4], dist;
    for (int i = 0; i < n; i++) {
        jrow(P[i], c, row, &dist);
        for (int a = 0; a < 4; a++) for (int b = 0; b < 4; b++) N[a][b] += w[i] * row[a] * row[b];
    }
    solve4(N, e4, z);
    return fabs(z[3]);
}

/* The larger of: what the rounding alone causes, and what the real scatter says (n > 4). */
double sigma_R(const double (*P)[3], const double *q, int n, const double c[3], double R) {
    double w[64] = {0}, ones[64] = {0}, ss = 0, row[4], dist;    /* n <= 64 */
    for (int i = 0; i < n; i++) {
        w[i] = 1 / (q[i] * q[i] / 12 + 20.0 * 20.0);          /* rounding, and a fix good to 20 m */
        ones[i] = 1;
        jrow(P[i], c, row, &dist);
        ss += (dist - R) * (dist - R);
    }
    double noise = sqrt(cov_RR(P, w, n, c));
    if (n == 4) return noise;                                 /* the sphere passes through all four */
    double scatter = sqrt(cov_RR(P, ones, n, c) * ss / (n - 4));
    return fmax(noise, scatter);
}
