/* Least squares from the centre of the Earth (Gauss-Newton). Uses predicted() above.
   The page also adds the troposphere, the ionosphere and a 10-degree mask from step 4,
   and one receiver clock per system (GPS, Galileo); this keeps GPS only. */
#include <math.h>

/* Solve the 4x4 system A z = r (Gaussian elimination with pivoting). */
void solve4(double A[4][4], double r[4], double z[4]) {
    for (int i = 0; i < 4; i++) {
        int p = i;
        for (int k = i + 1; k < 4; k++) if (fabs(A[k][i]) > fabs(A[p][i])) p = k;
        for (int j = 0; j < 4; j++) { double t = A[i][j]; A[i][j] = A[p][j]; A[p][j] = t; }
        double t = r[i]; r[i] = r[p]; r[p] = t;
        for (int k = i + 1; k < 4; k++) {
            double f = A[k][i] / A[i][i];
            for (int j = i; j < 4; j++) A[k][j] -= f * A[i][j];
            r[k] -= f * r[i];
        }
    }
    for (int i = 3; i >= 0; i--) {
        z[i] = r[i];
        for (int j = i + 1; j < 4; j++) z[i] -= A[i][j] * z[j];
        z[i] /= A[i][i];
    }
}

/* n satellites seen at the same instant t; x (m) and clock b (m) out; returns the rms (m). */
double solve_epoch(const Eph *eph, const double *pr, int n, double t, double x[3], double *b) {
    double H[64][4], y[64], dx[4], s[3];
    x[0] = x[1] = x[2] = 0; *b = 0;                           /* start: the origin */
    for (int step = 0; step < 15; step++) {
        double N[4][4] = {{0}}, r[4] = {0};
        for (int i = 0; i < n; i++) {
            double rho = predicted(&eph[i], x, *b, pr[i], t, s);
            double d = sqrt(pow(s[0] - x[0], 2) + pow(s[1] - x[1], 2) + pow(s[2] - x[2], 2));
            for (int k = 0; k < 3; k++) H[i][k] = -(s[k] - x[k]) / d;   /* minus the unit vector */
            H[i][3] = 1;                                                /* the receiver clock */
            y[i] = pr[i] - rho;                                         /* measured - computed */
            for (int p = 0; p < 4; p++) {                               /* normal equations */
                r[p] += H[i][p] * y[i];
                for (int q = 0; q < 4; q++) N[p][q] += H[i][p] * H[i][q];
            }
        }
        solve4(N, r, dx);                                     /* dx = (H^T H)^-1 H^T y */
        for (int k = 0; k < 3; k++) x[k] += dx[k];
        *b += dx[3];
        if (sqrt(dx[0] * dx[0] + dx[1] * dx[1] + dx[2] * dx[2]) < 1e-3) break;
    }
    double ss = 0;
    for (int i = 0; i < n; i++) {
        double v = y[i];
        for (int k = 0; k < 4; k++) v -= H[i][k] * dx[k];
        ss += v * v;
    }
    return sqrt(ss / n);
}
