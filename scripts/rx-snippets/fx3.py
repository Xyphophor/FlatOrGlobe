# The terms of the equation: satellite clock, Earth's rotation during the flight, troposphere.
# (The ionosphere, Klobuchar's model, is klobuchar() in src/tabs/rx/userlogic.js.)
def sat_clock(e, t, E, mu=MU_GPS):
    """Satellite clock offset (s): broadcast polynomial + relativistic term - group delay."""
    dt = wrap_week(t - e["toc"])
    rel = -2 * math.sqrt(mu * e["sqrt_a"]**2) * e["ecc"] * math.sin(E) / C**2
    return e["af0"] + e["af1"] * dt + e["af2"] * dt**2 + rel - e["tgd"]

def sagnac(s, tau):
    """The Earth turns by OMEGA_E*tau while the signal flies: rotate s about the z axis."""
    th = OMEGA_E * tau
    return [s[0] * math.cos(th) + s[1] * math.sin(th),
            -s[0] * math.sin(th) + s[1] * math.cos(th), s[2]]

def tropo(el_deg, h):
    """Saastamoinen delay (m), standard atmosphere at height h (m), elevation el (degrees)."""
    h = max(-100.0, min(h, 8000.0))
    p = 1013.25 * (1 - 2.2557e-5 * h) ** 5.2568            # pressure (hPa)
    T = 15 - 6.5e-3 * h + 273.16                           # temperature (K)
    ew = 6.108 * 0.5 * math.exp((17.15 * T - 4684) / (T - 38.45))   # water vapour, 50 % humidity
    z = math.radians(90 - max(el_deg, 5))                  # zenith distance
    return 0.002277 / math.cos(z) * (p + (1255 / T + 0.05) * ew - math.tan(z)**2)

def predicted(e, x, b, pr, t):
    """What the pseudorange should be if you are at x with clock b (m), atmosphere left out.
    Returns it with the satellite's position, for the next step."""
    tau = (pr - b) / C                                     # flight time
    s, E = sat_pos(e, t - tau)                             # where the satellite was at emission
    s = sagnac(s, tau)                                     # ... in the frame of the reception
    return math.dist(s, x) + b - C * sat_clock(e, t - tau, E), s
