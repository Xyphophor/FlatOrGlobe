# Satellite position from the broadcast elements (IS-GPS-200, Table 20-IV).
import math
OMEGA_E = 7.2921151467e-5      # Earth's rotation rate (rad/s), as the message defines it
MU_GPS = 3.986005e14           # GM (m^3/s^2); Galileo uses 3.986004418e14

def wrap_week(dt):
    """Bring a time difference into [-half a week, +half a week)."""
    return (dt + 302_400) % 604_800 - 302_400

def sat_pos(e, t, mu=MU_GPS):
    """e: one record of the navigation file (dict); t: seconds of the GPS week.
    Returns the Earth-fixed position (m) and E, which the clock needs."""
    a = e["sqrt_a"] ** 2                                   # the message sends sqrt(a)
    tk = wrap_week(t - e["toe"])                           # time since the reference epoch
    M = e["M0"] + (math.sqrt(mu / a**3) + e["dn"]) * tk    # mean anomaly
    E = M
    for _ in range(12):                                    # Kepler: E - e sin E = M
        E = M + e["ecc"] * math.sin(E)
    nu = math.atan2(math.sqrt(1 - e["ecc"]**2) * math.sin(E), math.cos(E) - e["ecc"])
    phi = nu + e["omega"]                                  # argument of latitude
    s2, c2 = math.sin(2 * phi), math.cos(2 * phi)          # six small harmonic corrections
    u = phi + e["cus"] * s2 + e["cuc"] * c2
    r = a * (1 - e["ecc"] * math.cos(E)) + e["crs"] * s2 + e["crc"] * c2
    i = e["i0"] + e["idot"] * tk + e["cis"] * s2 + e["cic"] * c2
    xp, yp = r * math.cos(u), r * math.sin(u)              # in the orbital plane
    Om = e["Omega0"] + (e["Omega_dot"] - OMEGA_E) * tk - OMEGA_E * e["toe"]   # node, Earth-fixed
    return [xp * math.cos(Om) - yp * math.cos(i) * math.sin(Om),
            xp * math.sin(Om) + yp * math.cos(i) * math.cos(Om),
            yp * math.sin(i)], E
