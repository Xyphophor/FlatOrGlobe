# The two radii of curvature of the WGS84 ellipsoid at latitude phi.
import math
A, F = 6_378_137.0, 1 / 298.257223563
E2 = F * (2 - F)                                           # e^2

def radius_M(lat_deg):                                     # north-south
    s = math.sin(math.radians(lat_deg))
    return A * (1 - E2) / (1 - E2 * s * s) ** 1.5

def radius_N(lat_deg):                                     # east-west
    s = math.sin(math.radians(lat_deg))
    return A / math.sqrt(1 - E2 * s * s)
