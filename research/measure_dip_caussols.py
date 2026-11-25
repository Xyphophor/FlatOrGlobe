#!/usr/bin/env python3
"""Le dip de l'horizon marin MESURÉ sur la photo de Caussols du propriétaire (13 juin 2026,
Redmi Note 13 Pro, 4 080 × 3 060, focale EXIF 2 711 px), sans le supposer : demande du
propriétaire du 2026-09-29 (« calcule R avec MON dip, à partir de la photo, pas du modèle »).

Principe. L'horizon marin est à la MÊME dépression dans toutes les directions -- sur un globe
comme sur un plan (où elle vaut 0) : sa pente dans l'image donne donc la rotation de
l'appareil, et sa hauteur est une inconnue de plus. Les deux sommets proches (dôme du Puy de
Tourrettes, Pic de Courmettes, ~7 km), dont l'angle d'élévation ne dépend presque pas du
modèle (1,6-1,8′ entre plan et globe), donnent le cap et l'inclinaison. Ajustement conjoint
(appareil rectiligne, focale EXIF, centre optique au centre de l'image) : cap, inclinaison,
rotation, et l'angle de l'horizon -- LE DIP, libre. Les sommets sont décrits par le profil
LiDAR de src/data/dem/caussols-view.json : « flat » (trigonométrie plane, pour le plan au
mieux) ou « globeK » ; les deux sont donnés.

Puis R = h·cos δ/(1 − cos δ) (géométrique), et × (1 − k) pour la réfraction (k = 0,13), comme
l'onglet dip. h = 1 210 m (sol LiDAR 1 208,5 m + le téléphone).

Sortie : src/data/presets/dip-caussols.js (les pixels mesurés et les variantes du calcul ;
l'onglet refait R). Usage : python3 research/measure_dip_caussols.py
"""
import json, math, os, sys
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "research"))
import align_photo as A

D = math.pi / 180
F = 2711.0
img, W, H = A.load(os.path.join(ROOT, "data/elev/caussols-2026-06-13-original.jpg"))
cx, cy = (W - 1) / 2, (H - 1) / 2
P = json.load(open(os.path.join(ROOT, "src/data/dem/caussols-view.json")))
AZ = P["az0"] + P["step"] * np.arange(len(P["flat"]))


def cam(yaw, pitch, roll):
    f = np.array([math.cos(pitch) * math.sin(yaw), math.cos(pitch) * math.cos(yaw), math.sin(pitch)])
    r = np.array([math.cos(yaw), -math.sin(yaw), 0.0]); u = np.cross(r, f)
    cr, sr = math.cos(roll), math.sin(roll); r2 = cr * r + sr * u; u2 = -sr * r + cr * u
    def proj(az, alt):
        v = np.stack([np.cos(alt) * np.sin(az), np.cos(alt) * np.cos(az), np.sin(alt)], -1)
        Z = v @ f
        return cx + F * (v @ r2) / Z, cy - F * (v @ u2) / Z
    return proj


# ---- 1. l'horizon marin, colonne par colonne. Le ciel a un bleu-moins-rouge constant (~66-70) ;
# la mer, plus bleue, le dépasse. edge = seuil au-dessus du ciel (5 = bord supérieur de la mer,
# à la moitié du saut = milieu de la transition) ; les deux définitions sont gardées : l'écart
# entre elles mesure le flou de la brume sur l'horizon. Colonnes où la côte touche l'horizon
# (sombre, luminance < 170 dans les 12 px sous la limite) écartées.
BR = img[:, :, 2] - img[:, :, 0]
LUM = img.mean(axis=2)
def horizon_rows(mode="edge", x0=2250, x1=3850, lo=1500, hi=1640):
    xs, ys = [], []
    for x in range(x0, x1):
        col = np.convolve(BR[lo:hi, x], np.ones(3) / 3, mode="same")
        sky = float(np.median(col[2:30]))
        above = np.where(col[30:-3] > sky + 5)[0]
        if not above.size:
            continue
        i = 30 + int(above[0])
        if mode == "mid":
            sea = float(np.median(col[i + 6:i + 16])); thr = (sky + sea) / 2
            j = i
            while j < len(col) - 2 and col[j] < thr: j += 1
            i, t = j, thr
        else:
            t = sky + 5
        y = lo + i - 1 + (t - col[i - 1]) / max(1e-6, col[i] - col[i - 1])   # interpolation linéaire au seuil
        if LUM[int(y) + 1:int(y) + 13, x].min() < 170:
            continue
        xs.append(x); ys.append(y)
    xs, ys = np.array(xs, float), np.array(ys, float)
    keep = np.ones(xs.size, bool)
    for _ in range(4):
        p = np.polyfit(xs[keep], ys[keep], 1); r = ys - np.polyval(p, xs)
        mad = 1.4826 * np.median(np.abs(r[keep])) + 1e-9; keep = np.abs(r) < 3 * mad
    return xs[keep], ys[keep], p, float(mad)


# ---- 2. la ligne de ciel des sommets proches : premier pixel (3 de suite) à plus de `thr` de la couleur
# du ciel JUSTE AU-DESSUS (médiane des lignes y-12..y-3 : le ciel est en dégradé), au sous-pixel
# (interpolation de la distance au seuil). thr en niveaux RVB ; 40 par défaut, 25 et 60 en variantes.
def skyline(x0, x1, thr=40.0, lo=1350, hi=1560):
    xs, ys = [], []
    for x in range(x0, x1):
        col = img[:, x]
        for y in range(lo, hi):
            ref = np.median(col[y - 12:y - 3], 0)
            d = np.sqrt(((col[y:y + 3] - ref) ** 2).sum(1))
            if (d > thr).all():
                d0 = float(np.sqrt(((col[y - 1] - ref) ** 2).sum()))
                xs.append(x); ys.append(y - 1 + (thr - d0) / max(1e-6, d[0] - d0) - 0.5); break
    return np.array(xs, float), np.array(ys, float)


def fit(model, hx, hy, sx, sy, tree_m=0.0, dKm=7.2):
    """Cap, inclinaison, rotation et angle de l'horizon (LE DIP, libre) : moindres carrés
    robustes (Huber, 3 px) sur la ligne de ciel des deux sommets ET sur la ligne d'horizon.
    tree_m : hauteur de végétation supposée sur les crêtes (la crête vue plus haute)."""
    prof = np.array(P[model]) / 60 * D + (tree_m / (dKm * 1000))
    az = AZ * D
    azs = np.linspace(80 * D, 125 * D, 3000)
    def resid(p):
        yaw, pitch, roll, ah = p
        proj = cam(yaw, pitch, roll)
        X, Y = proj(az, prof)
        yy = np.interp(sx, X, Y)
        HX, HY = proj(azs, np.full(azs.shape, ah))
        hh = np.interp(hx, HX, HY)
        return np.r_[sy - yy, hy - hh]
    p = np.array([92.2 * D, -0.65 * D, 1.3 * D, -60 / 60 * D])
    for _ in range(30):
        r = resid(p)
        w = np.where(np.abs(r) <= 3, 1.0, 3 / np.abs(r))              # Huber
        J = np.empty((r.size, 4)); e = [1e-6, 1e-6, 1e-6, 1e-6]
        for k in range(4):
            q = p.copy(); q[k] += e[k]; J[:, k] = (resid(q) - r) / e[k]
        sw = np.sqrt(w)
        dp, *_ = np.linalg.lstsq(J * sw[:, None], -r * sw, rcond=None)
        p = p + dp
        if np.max(np.abs(dp)) < 1e-9: break
    r = resid(p)
    ns = sx.size
    return {"yaw": p[0], "pitch": p[1], "roll": p[2], "ah": p[3],
            "rmsS": float(np.sqrt(np.mean(np.minimum(r[:ns] ** 2, 100)))), "rmsH": float(np.sqrt(np.mean(np.minimum(r[ns:] ** 2, 100))))}


def radius(dip, h=1210.0, k=0.0):
    return h * math.cos(dip) / (1 - math.cos(dip)) * (1 - k)


if __name__ == "__main__":
    # Mesure centrale : horizon « mid » (milieu de la transition), ligne de ciel au seuil 40, sommets décrits
    # SANS courbure (profil « flat » : le choix le plus favorable au plan), pas de végétation. Variantes : chacune
    # de ces quatre décisions changée seule -- leur écart est l'incertitude de la mesure.
    sky = {thr: [np.r_[a, b] for a, b in zip(skyline(1005, 1230, thr), skyline(1610, 1760, thr))] for thr in (25.0, 40.0, 60.0)}
    hor = {mode: horizon_rows(mode) for mode in ("mid", "edge")}
    out = {"h": 1210, "f": F, "w": W, "hgt": H, "k": 0.13, "horizon": {}, "fits": []}
    for mode, (hx, hy, hp, hsig) in hor.items():
        out["horizon"][mode] = {"n": int(hx.size), "slope": round(float(hp[0]), 6), "row2250": round(float(np.polyval(hp, 2250)), 2),
                                "row3850": round(float(np.polyval(hp, 3850)), 2), "sigmaPx": round(hsig, 2)}
        print(f"horizon ({mode}) : {hx.size} colonnes, ligne {np.polyval(hp, 2250):.1f} -> {np.polyval(hp, 3850):.1f}, dispersion {hsig:.2f} px")
    variants = [("central", "mid", 40.0, "flat", 0.0), ("horizon edge", "edge", 40.0, "flat", 0.0),
                ("skyline 25", "mid", 25.0, "flat", 0.0), ("skyline 60", "mid", 60.0, "flat", 0.0),
                ("summits globeK", "mid", 40.0, "globeK", 0.0), ("scrub 5 m", "mid", 40.0, "flat", 5.0)]
    for name, mode, thr, model, tree in variants:
        hx, hy, hp, hsig = hor[mode]; sx, sy = sky[thr]
        f = fit(model, hx, hy, sx, sy, tree)
        dip = -f["ah"]
        out["fits"].append({"name": name, "horizon": mode, "thr": thr, "model": model, "treeM": tree, "yaw": round(f["yaw"] / D, 4),
                            "pitch": round(f["pitch"] / D, 4), "roll": round(f["roll"] / D, 4), "rmsSummitPx": round(f["rmsS"], 2),
                            "rmsHorizonPx": round(f["rmsH"], 2), "nSummit": int(sx.size), "dipArcmin": round(dip / D * 60, 2)})
        print(f"  {name:15s} sommets {f['rmsS']:.1f} px, horizon {f['rmsH']:.1f} px ; cap {f['yaw'] / D:.3f}° incl {f['pitch'] / D:+.3f}° rot {f['roll'] / D:+.3f}° ; "
              f"DIP {dip / D * 60:.2f}′ ; R géom {radius(dip) / 1000:.0f} km, réfr. {radius(dip, k=0.13) / 1000:.0f} km")
    hx, hy, _, _ = hor["mid"]; sx, sy = sky[40.0]
    out["pts"] = {"sky": [[int(x), round(float(y), 1)] for x, y in zip(sx[::4], sy[::4])],
                  "hor": [[int(x), round(float(y), 1)] for x, y in zip(hx[::25], hy[::25])]}
    js = ("// GENERATED by research/measure_dip_caussols.py -- do not edit by hand (2026-09-29).\n"
          "// The sea-horizon dip MEASURED on the owner's Caussols photo (13 June 2026): joint fit of the camera\n"
          "// (EXIF focal, heading, tilt, roll) and of the horizon's altitude, the level set by the two near summits.\n"
          "// fits[0] = central measurement; the others change one decision each. The tab recomputes R from dipArcmin.\n"
          f"export const DIP_CAUS = {json.dumps(out)};\n")
    open(os.path.join(ROOT, "src/data/presets/dip-caussols.js"), "w").write(js)
    print("écrit src/data/presets/dip-caussols.js")
