# Least squares from the centre of the Earth (Gauss-Newton). Uses predicted() above.
# The page also adds the troposphere, the ionosphere and a 10-degree mask from step 4,
# and one receiver clock per system (GPS, Galileo); this keeps GPS only.
import numpy as np

def solve_epoch(sats, t):
    """sats: [(record, pseudorange)] seen at the same instant t. Returns x (m), clock (m), rms (m)."""
    x, b = np.zeros(3), 0.0                                # start: the origin, no idea where we are
    for step in range(15):
        H, y = [], []
        for e, pr in sats:
            rho, s = predicted(e, x, b, pr, t)
            u = (np.array(s) - x) / np.linalg.norm(np.array(s) - x)   # unit vector towards the satellite
            H.append([-u[0], -u[1], -u[2], 1.0])           # derivatives of rho with respect to x, y, z, b
            y.append(pr - rho)                             # measured minus computed
        H, y = np.array(H), np.array(y)
        dx = np.linalg.solve(H.T @ H, H.T @ y)             # dx = (H^T H)^-1 H^T y
        x, b = x + dx[:3], b + dx[3]
        if np.linalg.norm(dx[:3]) < 1e-3:                  # moved less than a millimetre
            break
    res = y - H @ dx
    return x, b, float(np.sqrt(np.mean(res**2)))
