# Exploratoire (2026-11-25) : Rømer à l'envers, prototype du modèle avant le portage Go.
# L'unité astronomique depuis les éclipses d'Io de la compilation de Lieske (IMCCE NSDC,
# 1652-1983_J1-4_lieske.data.txt), c de laboratoire, orbites en angles (Standish, éléments
# képlériens 3000 av.-3000 apr. J.-C.) avec a_J par Kepler III, ΔT d'Espenak & Meeus.
# Usage : python3 -I research/romer_io.py <fichier lieske> [an0 an1] [--flat] [--nosite] [--mode V|P]
import sys, math, numpy as np

D2R = math.pi / 180
C_KMS = 299792.458

def load(path, y0, y1, mode=None, sat=1):
    rows = []
    for l in open(path):
        l = l.rstrip("\n")
        if len(l) < 40 or int(l[18]) != sat: continue
        y = int(l[0:4])
        if not (y0 <= y <= y1): continue
        if mode and l[17] != mode: continue
        rows.append((float(l[24:38]), int(l[14:17]), l[17], l[19], l[20:22] + l[22:24], l[22:24]))
    return rows

def delta_t(year):
    # Espenak & Meeus (NASA, 2006), polynomes par tranche, en secondes
    y = year
    if y < 1700:
        t = y - 1600; return 120 - 0.9808 * t - 0.01532 * t**2 + t**3 / 7129
    if y < 1800:
        t = y - 1700; return 8.83 + 0.1603 * t - 0.0059285 * t**2 + 0.00013336 * t**3 - t**4 / 1174000
    if y < 1860:
        t = y - 1800; return 13.72 - 0.332447 * t + 0.0068612 * t**2 + 0.0041116 * t**3 - 0.00037436 * t**4 + 0.0000121272 * t**5 - 0.0000001699 * t**6 + 0.000000000875 * t**7
    if y < 1900:
        t = y - 1860; return 7.62 + 0.5737 * t - 0.251754 * t**2 + 0.01680668 * t**3 - 0.0004473624 * t**4 + t**5 / 233174
    if y < 1920:
        t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t**2 + 0.0061966 * t**3 - 0.000197 * t**4
    if y < 1941:
        t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t**2 + 0.0020936 * t**3
    if y < 1961:
        t = y - 1950; return 29.07 + 0.407 * t - t**2 / 233 + t**3 / 2547
    if y < 1986:
        t = y - 1975; return 45.45 + 1.067 * t - t**2 / 260 - t**3 / 718
    t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t**2 + 0.0017275 * t**3 + 0.000651814 * t**4 + 0.00002373599 * t**5

# Standish, table 2a : a e I L varpi Omega (J2000) et taux par siècle ; Jupiter b c s f
EM = ((1.00000018, 0.01673163, -0.00054346, 100.46691572, 102.93005885, -5.11260389),
      (-0.00000003, -0.00003661, -0.01337178, 35999.37306329, 0.31795260, -0.24123856), None)
JU = ((5.20248019, 0.04853590, 1.29861416, 34.33479152, 14.27495244, 100.29282654),
      (-0.00002864, 0.00018026, -0.00322699, 3034.90371757, 0.18199196, 0.13024619),
      (-0.00012452, 0.06064060, -0.35635438, 38.35125000))
MJ = 1 / 1047.348644
# a_J par Kepler III depuis les deux moyens mouvements (aucune distance)
A_J = (EM[1][3] / JU[1][3]) ** (2 / 3) * (1 + MJ) ** (1 / 3)

def helio(el, T, a_override=None):
    p0, r, x = el
    a, e, I, L, w, O = (p0[i] + r[i] * T for i in range(6))
    if a_override: a = a_override
    M = L - w
    if x: M = M + x[0] * T**2 + x[1] * np.cos(x[3] * T * D2R) + x[2] * np.sin(x[3] * T * D2R)
    M = np.mod(M + 180, 360) - 180
    M = M * D2R; E = M + e * np.sin(M)
    for _ in range(10): E = E - (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
    xp = a * (np.cos(E) - e); yp = a * math.sqrt(1) * np.sqrt(1 - e * e) * np.sin(E)
    om = (w - O) * D2R; O = O * D2R; I = I * D2R
    co, so, cO, sO, cI, sI = np.cos(om), np.sin(om), np.cos(O), np.sin(O), np.cos(I), np.sin(I)
    X = (co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp
    Y = (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp
    Z = (so * sI) * xp + (co * sI) * yp
    return np.array([X, Y, Z]), M

# pôle de Jupiter (IAU) : repère équatorial de Jupiter depuis l'écliptique J2000
EPS = 23.4392911 * D2R
RA0, DE0 = 268.056595 * D2R, 64.495303 * D2R
zq = np.array([math.cos(DE0) * math.cos(RA0), math.cos(DE0) * math.sin(RA0), math.sin(DE0)])
# équatorial -> écliptique : rotation autour de x de +EPS
def eq2ecl(v): return np.array([v[0], math.cos(EPS) * v[1] + math.sin(EPS) * v[2], -math.sin(EPS) * v[1] + math.cos(EPS) * v[2]])
ZJ = eq2ecl(zq)
XJ = np.cross([0, 0, 1], ZJ); XJ /= np.linalg.norm(XJ)   # noeud ascendant de l'équateur de Jupiter sur l'écliptique
YJ = np.cross(ZJ, XJ)

def anti_sun(rJ):
    # direction Jupiter -> ombre (= direction héliocentrique de Jupiter) dans le repère équatorial de Jupiter
    u = rJ / np.linalg.norm(rJ, axis=0)
    lon = np.arctan2(YJ @ u, XJ @ u)
    dec = np.arcsin(ZJ @ u)
    return lon / D2R, dec

def geometry(jd_ut, years, As):
    dt = np.array([delta_t(y) for y in years]) / 86400
    to = jd_ut + dt                                   # TT de l'observation
    T = (to - 2451545) / 36525
    rE, _ = helio(EM, T)
    te = to.copy()
    for _ in range(3):
        rJ, MJm = helio(JU, (te - 2451545) / 36525, A_J)
        d = np.linalg.norm(rJ - rE, axis=0)
        te = to - As * d / 86400
    lon, dec = anti_sun(rJ)
    # angle Soleil-Terre-Jupiter vu de la Terre (élongation) et phase synodique
    u = rJ - rE
    elong = np.arccos(np.sum(-rE * u, axis=0) / np.linalg.norm(rE, axis=0) / d)
    lE = np.arctan2(rE[1], rE[0]); lJ = np.arctan2(rJ[1], rJ[0])
    return dict(to=to, te=te, d=d, lon=np.unwrap(lon * D2R) / D2R, dec=dec, rJ=np.linalg.norm(rJ, axis=0), MJ=MJm, syn=lE - lJ, elong=elong)

def half_angle(dec, a0):
    # demi-arc de l'ombre (degrés de longitude d'Io), ombre aplatie Rp/Re = 0.935
    s0 = math.sin(a0 * D2R)
    b = np.sin(dec) / (s0 * 0.935)
    return np.arcsin(s0 * np.sqrt(np.clip(1 - b * b, 0.2, 1))) / D2R

N_IO = 203.48895
FREE12 = '--free12' in sys.argv
def fit(rows, flat=False, sites=True, minsite=30, verbose=True, label=""):
    jd = np.array([r[0] for r in rows]); sg = np.array([r[1] for r in rows], float)
    years = (jd - 2451545) / 365.25 + 2000
    isD = np.array([r[3] == "D" for r in rows]); isV = np.array([r[2] == "V" for r in rows])
    site = np.array([r[5] for r in rows])
    keep = np.ones(len(rows), bool)
    As, a0 = 499.0, 9.6
    if flat: As = 0.0
    t0 = np.median(jd)
    for it in range(8):
        g = geometry(jd, years, As)
        h = half_angle(g["dec"], a0)
        # y = phase observée de l'événement : longitude de l'ombre au moment de l'événement, ramenée
        y = g["lon"] + np.where(isD, -h, h) - N_IO * (g["to"] - t0)
        if it == 0:
            cen = np.angle(np.mean(np.exp(1j * y * D2R))) / D2R
            off = (y - cen + 180) % 360 - 180; keep &= np.abs(off) < 3.0
            ref = cen
        y = y - 360 * np.round((y - ref) / 360)
        tt = (g["to"] - t0) / 36525
        cols = [np.ones_like(y), tt, tt**2 / 10]
        names = ["lam0", "dn", "ndot"]
        th = (0.08309 + 0.7396) * D2R * (g["te"] - 2451545)     # terme de Laplace (437,6 j)
        cols += [np.sin(th), np.cos(th)]; names += ["lap_s", "lap_c"]
        cols += [np.where(isD, 1.0, -1.0)]; names += ["DR"]                       # moitié de l'écart D/R libre
        cols += [np.where(isD, 1.0, -1.0) * (g["d"] - 5.2) * isV]; names += ["vis"]  # biais visuel, signe opposé D/R
        if flat:
            for kk in (1, 2):
                cols += [np.cos(kk * g["syn"]), np.sin(kk * g["syn"])]; names += [f"f{kk}c", f"f{kk}s"]
            cols += [np.cos(g["MJ"]), np.sin(g["MJ"])]; names += ["mjc", "mjs"]
        else:
            cols += [g["d"]]; names += ["p"]
            if FREE12:
                cols += [np.cos(g["MJ"]), np.sin(g["MJ"])]; names += ["mjc", "mjs"]   # p = N_IO * AU/c (deg/AU) ; y = ... + p*d  (on a retiré N*to)
        if sites:
            sc = {}
            for s in site[keep]: sc[s] = sc.get(s, 0) + 1
            big = sorted(s for s, n in sc.items() if n >= minsite)
            for s in big[1:]:
                cols.append((site == s).astype(float)); names.append("site:" + s)
        X = np.column_stack(cols)
        w = 1 / (sg / 86400 * N_IO)
        Xw, yw = X[keep] * w[keep, None], y[keep] * w[keep]
        beta, *_ = np.linalg.lstsq(Xw, yw, rcond=None)
        res = (y - X @ beta) / N_IO * 86400
        # exclusion à 3 écarts-types des autres
        sd = np.std(res[keep])
        keep = keep & (np.abs(res) < 3 * sd) if it < 6 else keep
        if not flat:
            # temps de lumière : t_e = t_o - As*d ; la phase avance de N*(t_e) -> y contient +N*As*d/86400
            As = -beta[names.index("p")] / N_IO * 86400
        a0 = a0  # demi-durée gardée fixe dans la forme ; l'écart moyen est libre (DR)
    cov = np.linalg.inv(Xw.T @ Xw) * np.sum((res[keep] / sg[keep]) ** 2) / (keep.sum() - X.shape[1])
    out = dict(n=int(keep.sum()), rms=float(np.std(res[keep])), names=names, beta=beta, cov=cov, res=res, keep=keep, g=g)
    if not flat:
        i = names.index("p"); out["As"] = As; out["dAs"] = math.sqrt(cov[i, i]) / N_IO * 86400
        out["AU"] = As * C_KMS; out["dAU"] = out["dAs"] * C_KMS
    if verbose:
        s = f"{label:12s} N={out['n']:5d} rms={out['rms']:5.0f}s"
        if not flat: s += f"  AU/c={As:6.1f}±{out['dAs']:4.1f}s  AU={out['AU']/1e6:6.2f}±{out['dAU']/1e6:4.2f} Mkm"
        lap = math.hypot(beta[names.index('lap_s')], beta[names.index('lap_c')]) / N_IO * 86400
        s += f"  Laplace={lap:5.0f}s  vis={beta[names.index('vis')]/N_IO*86400:6.1f}s/AU"
        print(s)
    return out

if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    path = a[0]
    mode = None
    if "--mode" in sys.argv: mode = sys.argv[sys.argv.index("--mode") + 1]; a = [x for x in a if x != mode]
    sites = "--nosite" not in sys.argv
    wins = [(int(a[1]), int(a[2]))] if len(a) >= 3 else [(1660, 1709), (1710, 1759), (1760, 1809), (1810, 1869), (1870, 1919), (1920, 1983), (1652, 1983)]
    for y0, y1 in wins:
        r = load(path, y0, y1, mode)
        if len(r) < 50: continue
        g = fit(r, sites=sites, label=f"{y0}-{y1}")
        if "--flat" in sys.argv:
            f = fit(r, flat=True, sites=sites, verbose=False)
            n0 = fit(r, flat=True, sites=sites, verbose=False) if False else None
            print(f"{'':12s} flat best (2 harmonics + 12 y): rms={f['rms']:5.0f}s N={f['n']}  coeffs(s): " +
                  " ".join(f"{nm}={f['beta'][f['names'].index(nm)]/N_IO*86400:6.1f}" for nm in ("f1c", "f1s", "f2c", "f2s", "mjc", "mjs")))
