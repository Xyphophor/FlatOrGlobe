# The group's sphere |p - c| = R, centre and radius free, and the uncertainty on R.
import math
import numpy as np

def fit_sphere(P):
    P = np.asarray(P, float)
    # 1. a first guess, linear: |p|^2 = 2 c.p + (R^2 - |c|^2)
    A = np.c_[2 * P, np.ones(len(P))]
    s = np.linalg.lstsq(A, (P**2).sum(axis=1), rcond=None)[0]
    c, R = s[:3], math.sqrt(s[3] + s[:3] @ s[:3])
    # 2. Gauss-Newton on the true distances to the surface, |p - c| - R
    for _ in range(8):
        d = P - c
        n = np.linalg.norm(d, axis=1)
        J = np.c_[-d / n[:, None], -np.ones(len(P))]
        step = np.linalg.lstsq(J, -(n - R), rcond=None)[0]
        c, R = c + step[:3], R + step[3]
    return c, R

def sigma_R(P, q, c, R, sigma_fix=20.0):
    """The larger of: what the rounding alone causes, and what the real scatter says (n > 4)."""
    P, q = np.asarray(P, float), np.asarray(q, float)
    d = P - c
    n = np.linalg.norm(d, axis=1)
    J = np.c_[-d / n[:, None], -np.ones(len(P))]
    w = 1 / (q**2 / 12 + sigma_fix**2)                     # rounding uniform over +-q/2, and the fix
    noise = math.sqrt(np.linalg.inv(J.T @ (w[:, None] * J))[3, 3])
    if len(P) == 4:
        return noise                                       # the sphere passes through all four
    res = n - R
    scatter = math.sqrt(np.linalg.inv(J.T @ J)[3, 3] * (res @ res) / (len(P) - 4))
    return max(noise, scatter)
