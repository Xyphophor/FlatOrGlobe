/* The bulge: height s of an arc of radius R above its chord L. */
#include <math.h>

double sagitta(double R, double L) {
    return R - sqrt(R * R - (L / 2) * (L / 2));              /* about L*L / (8 R) */
}
