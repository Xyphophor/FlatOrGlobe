/* The two radii of curvature of the WGS84 ellipsoid at latitude phi. */
#include <math.h>
#define WGS_A 6378137.0
#define WGS_F (1 / 298.257223563)
#define WGS_E2 (WGS_F * (2 - WGS_F))

double radius_M(double lat_deg) {                             /* north-south */
    double s = sin(lat_deg * M_PI / 180);
    return WGS_A * (1 - WGS_E2) / pow(1 - WGS_E2 * s * s, 1.5);
}

double radius_N(double lat_deg) {                             /* east-west */
    double s = sin(lat_deg * M_PI / 180);
    return WGS_A / sqrt(1 - WGS_E2 * s * s);
}
