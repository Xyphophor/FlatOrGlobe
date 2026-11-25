#!/usr/bin/env python3
"""Cale une photo du propriétaire sur le profil LiDAR d'un point de vue
(2026-09-25, onglet elev) -- sans réglage à la main.

1. Ligne de ciel de la photo (voir skyline()) ; seules comptent les
   colonnes où elle touche un relief lointain (bleuté), ce qui écarte le
   cairn et l'herbe proches ; --cols restreint encore la plage.
2. Recherche exhaustive : azimut du centre de l'image et échelle (px par
   degré, la même en largeur et en hauteur -- photo de panorama, projection
   supposée équirectangulaire), sur le profil globe k ; la hauteur (le
   basculement inconnu de l'appareil) est la moyenne des résidus.
3. Avec ce cadrage commun, chaque modèle reçoit SA meilleure hauteur (la
   plus favorable, règle 2) ; les résidus sont imprimés pour les trois.
Le script imprime aussi la meilleure solution éloignée (> 1° de centre) :
si elle approche la première, le calage est ambigu et il faut regarder.

Usage : python3 research/align_photo.py <photo.jpg> <profil.json> [--cols 94:299]
Sortie : les nombres à reporter dans src/data/presets/elev.js (ELEV_PHOTO).
Dépend de ffmpeg (décodage) et de numpy, comme lidar_horizon.py.
"""
import argparse, json, subprocess
import numpy as np

SEUIL = 28.0
CHUTE = 12.0


def load(path):
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", path],
                           capture_output=True, text=True, check=True).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(float), w, h


def skyline(img, mode="color"):
    """Ligne de ciel par colonne, et si le relief touché est lointain (bleuté).
    mode "color" (défaut, celui du calage publié) : premier pixel (3 de suite)
    à plus de SEUIL de la couleur du ciel (médiane d'une bande en haut) ;
    mode "drop" : premier pixel plus sombre de CHUTE niveaux que le ciel juste
    au-dessus -- pour un ciel en dégradé (panorama), où une couleur unique
    prendrait le bas du ciel pour du relief."""
    h, w, _ = img.shape
    top = np.full(w, -1); far = np.zeros(w, bool)
    if mode == "color":
        sky = np.median(img[2:10, w // 3:].reshape(-1, 3), 0)
        d = np.sqrt(((img - sky) ** 2).sum(2))
    L = img.mean(2)
    if mode == "rise":
        # mode "rise" (Schneeberg, 2026-09-26) : ciel en dégradé ET neige bleutée
        # à l'ombre -- ni une couleur de ciel unique ni une chute de luminance ne
        # suffisent. Neige au soleil : le ROUGE saute de ~110 à > 170 ; versant
        # à l'ombre : le BLEU baisse franchement. Référence : médiane des 13
        # pixels au-dessus ; 3 pixels de suite.
        R, Bc = img[:, :, 0], img[:, :, 2]
        for x in range(w):
            for y in range(18, h - 3):
                r0 = np.median(R[y - 15:y - 2, x]); b0 = np.median(Bc[y - 15:y - 2, x])
                if (R[y:y + 3, x] - r0 > 30).all() or (b0 - Bc[y:y + 3, x] > 18).all():
                    top[x] = y; far[x] = True; break
        return top, far
    for x in range(w):
        y = -1
        if mode == "color":
            c = d[:, x] > SEUIL
            run = np.nonzero(c[2:-2] & c[3:-1] & c[4:])[0]
            if run.size: y = run[0] + 2
        else:
            col = L[:, x]
            for yy in range(16, h - 3):
                ref = col[yy - 15:yy].max()
                if col[yy] < ref - CHUTE and col[yy + 1] < ref - CHUTE and col[yy + 2] < ref - CHUTE:
                    y = yy; break
        if y >= 0:
            top[x] = y
            c3 = img[y + 2:y + 6, x].mean(0)
            far[x] = (c3[2] - c3[0]) > 30 and c3[2] >= c3[1]
    return top, far


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("photo"); ap.add_argument("profile")
    ap.add_argument("--cols", default=None, help="colonnes utiles a:b (premier plan exclu)")
    ap.add_argument("--ppd", default="8:120:0.5", help="plage d'échelle, px/° : début:fin:pas")
    ap.add_argument("--sky", default="color", choices=("color", "drop", "rise"))
    ap.add_argument("--anchor", help="X:AZ -- azimut ANCRÉ : la colonne X (pleine image) est à l'azimut AZ "
                    "(un repère identifié, le même dans tous les modèles) ; on cherche alors, POUR CHAQUE "
                    "modèle, l'échelle, le basculement et la hauteur")
    ap.add_argument("--scale", type=float, default=1.0, help="facteur pleine image / image analysée (ex. 4)")
    ap.add_argument("--skip", action="append", default=[], help="colonnes a:b à écarter (image analysée ; répétable) : "
                    "ligne de ciel mal lue, ex. un sommet enneigé plus clair que les nuages (Argentera P900, 2026-10-06)")
    ap.add_argument("--allfar", action="store_true", help="toute la ligne de ciel est lointaine (sommet enneigé : "
                    "blanc, pas bleuté -- le test de couleur l'écarterait ; Schneeberg, 2026-09-26)")
    a = ap.parse_args()
    a.ppd0, a.ppd1, a.ppdstep = map(float, a.ppd.split(":"))
    img, w, h = load(a.photo)
    top, far = skyline(img, a.sky)
    c0, c1 = (map(int, a.cols.split(":")) if a.cols else (0, w))
    xs = np.arange(c0, c1); ys = top[c0:c1].astype(float)
    ok = (ys >= 0) & (far[c0:c1] | a.allfar)   # seul le relief LOINTAIN compte : pas le cairn, pas l'herbe proche
    for sk in a.skip:
        s0, s1 = map(int, sk.split(":")); ok &= ~((xs >= s0) & (xs < s1))
    xs, ys = xs[ok], ys[ok]
    P = json.load(open(a.profile))
    azs = P["az0"] + P["step"] * np.arange(len(P["flat"]))
    xc = (w - 1) / 2

    def fit(model, lock=None):
        prof = np.array(P[model]) / 60
        grid = [lock] if lock else [(p, z) for p in np.arange(a.ppd0, a.ppd1, a.ppdstep) for z in np.arange(azs[0], azs[-1], 0.02)]
        out = []
        for ppd, azc in grid:
            az = azc + (xs - xc) / ppd
            inw = (az >= azs[0]) & (az <= azs[-1])       # seules les colonnes dans la fenêtre du profil
            if inw.sum() < 0.6 * xs.size:
                continue
            A = np.interp(az[inw], azs, prof); yy = ys[inw]
            y0 = np.mean(yy + ppd * A)
            out.append((float(np.sqrt(np.mean((yy - (y0 - ppd * A)) ** 2))), float(ppd), float(azc), float(y0)))
        out.sort()
        return out

    if a.anchor:
        X, AZ = map(float, a.anchor.split(":"))
        xa = (X + 0.5) / a.scale - 0.5            # colonne du repère dans l'image analysée
        print(f"photo {w}×{h} (×{a.scale:g} = pleine image), {xs.size} colonnes, repère x {X:g} = {AZ:g}°")
        out = {}
        for m in ("globeK", "globe", "flat"):
            prof = np.array(P[m]) / 60; best = None
            for pf in np.arange(a.ppd0, a.ppd1, a.ppdstep):      # px/° PLEINE image
                ppd = pf / a.scale
                az = AZ + (xs - xa) / ppd; inw = (az >= azs[0]) & (az <= azs[-1])
                A = np.interp(az[inw], azs, prof); yy = ys[inw]; xx = xs[inw]
                M = np.c_[np.ones_like(xx), xx - xa]                 # y = y0 - ppd·A + pente·(x - xa)
                sol, *_ = np.linalg.lstsq(M, yy + ppd * A, rcond=None)
                r = float(np.sqrt(np.mean((yy + ppd * A - M @ sol) ** 2)))
                if best is None or r < best[0]:
                    best = (r, float(pf), float(sol[0]), float(sol[1]))
            r, pf, y0, sl = best
            out[m] = {"pxPerDeg": pf, "eyeRow": round((y0 + 0.5) * a.scale - 0.5, 1), "slope": round(sl, 5),
                      "rmsPx": round(r * a.scale, 1)}
            print(f"  {m:7s} {pf:.1f} px/°, ligne de l'œil y {out[m]['eyeRow']} (colonne du repère), basculement "
                  f"{np.degrees(np.arctan(sl)):+.2f}°, rms {r * a.scale:.1f} px pleine image ({r * a.scale / pf * 60:.2f}′)")
        print(json.dumps(out))
        return

    g = fit("globeK")
    best = g[0]
    far = next((b for b in g if abs(b[2] - best[2]) > 1.0), None)
    print(f"photo {w}×{h}, {xs.size} colonnes de ligne de ciel utilisées")
    print(f"cadrage : centre {best[2]:.2f}°, {best[1]:.1f} px/°, largeur {w / best[1]:.2f}°  (rms {best[0]:.2f} px)")
    if far:
        print(f"meilleure solution éloignée : centre {far[2]:.2f}°, {far[1]:.1f} px/° (rms {far[0]:.2f} px) -- à REGARDER si proche")
    res = {}
    for m in ("globeK", "globe", "flat"):
        r = fit(m, (best[1], best[2]))[0]
        res[m] = {"eyeRow": round(r[3], 2), "rmsPx": round(r[0], 2)}
        print(f"  {m:7s} ligne de l'œil à y = {r[3]:.1f} px, rms {r[0]:.2f} px")
    print(json.dumps({"w": w, "h": h, "azCenter": round(best[2], 2), "pxPerDeg": best[1], "models": res}))


if __name__ == "__main__":
    main()
