#!/usr/bin/env python3
"""Cale la photo DSCN7496 de Bordighera (P900, 2026-03-28 17:34) sur la scène de hh.

Version 2 (2026-10-06, fichier original reçu, EXIF compris). Rien n'est ajusté sur la hauteur :
1. ÉCHELLE : lue dans l'EXIF. Focale 999,6 mm (357 mm optiques × zoom numérique 2,8) ; capteur 1/2,3",
   largeur tirée du facteur de recadrage de l'EXIF lui-même (2000 mm éq. pour 357 mm) : 6,18 mm.
   Même échelle pour tous les modèles (c'est une mesure, pas un paramètre).
2. ROULIS : l'horizon de mer, ligne de niveau dans tous les modèles, plan compris.
3. HAUTEUR : la photo est CALÉE SUR L'HORIZON -- sa ligne de mer est posée sur le haut de la mer du
   modèle (horizon du globe, ou ligne de côte sur le plan), état par état.
4. AZIMUT : le seul paramètre libre ; pour chaque état, celui qui superpose le mieux les bâtiments du
   modèle aux bâtiments de la photo (corrélation des bords). Chaque modèle reçoit SON meilleur azimut (règle 2)
   et la corrélation obtenue est le test. Le dessin garde UN azimut (une direction ne dépend pas de la forme) :
   celui de l'état qui colle le mieux -- les meilleurs azimuts des mauvais modèles sautent de pic en pic.
5. MESURE : hauteur du toit de la Villa Regina Margherita au-dessus de la ligne de mer, en pixels, donc en
   angle (échelle EXIF) -> la courbure apparente c qui la reproduit -> le k du jour. Hesperia : la plus haute
   rangée où ses colonnes sont plus claires que le voile voisin.

Photo publiée : redressée, contraste corrigé (niveaux par canal + contraste local, mêmes réglages sur toute
l'image ; aucun pixel déplacé), sans métadonnées, 1600 × 1200 -> public/photos/hh-bordighera-zoom.jpg.

  nice python3 research/fit_bordighera_photo.py <DSCN7496.JPG>
"""
import base64, json, math, os, re, struct, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "presets", "hh-bordighera.js")
OUT = os.path.join(ROOT, "src", "data", "presets", "hh-bordighera-photo.js")
PUB = os.path.join(ROOT, "public", "photos", "hh-bordighera-zoom.jpg")
R, K, D2R = 6371e3, 0.13, math.pi / 180
STATES = [0.0, 0.25, 0.5, 0.75, 0.87, 1.0]
DIAG35 = math.hypot(36, 24)
PUB_W = 1600


# ---------- EXIF (lecteur minimal : pas de dépendance) ----------
def exif(path):
    b = open(path, "rb").read(); i = b.find(b"Exif\0\0"); t = b[i + 6:]
    en = "<" if t[:2] == b"II" else ">"
    u = lambda f, o: struct.unpack_from(en + f, t, o)
    names = {0x010F: "make", 0x0110: "model", 0x9003: "time", 0x920A: "focal", 0xA405: "focal35", 0xA404: "dzoom"}
    out = {}
    def ifd(o):
        for k in range(u("H", o)[0]):
            tag, typ, cnt, val = u("HHII", o + 2 + 12 * k)
            sz = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 10: 8}.get(typ, 1) * cnt
            vo = o + 2 + 12 * k + 8 if sz <= 4 else val
            if typ == 2: v = t[vo:vo + cnt].rstrip(b"\0").decode(errors="ignore")
            elif typ == 3: v = u("H", vo)[0]
            elif typ == 4: v = u("I", vo)[0]
            elif typ == 5: a, c = u("II", vo); v = a / c if c else 0
            else: v = None
            if tag in names: out[names[tag]] = v
            if tag == 0x8769: ifd(val)
    ifd(u("I", 4)[0])
    return out


# ---------- géométrie (identique à src/core/flatten.js) ----------
def elev(c, e, d, h):
    d = np.asarray(d, float); h = np.asarray(h, float)
    if c <= 0:
        return np.arctan2(h - e, d)
    Rc = R / c; t = d / Rc
    return np.arctan2(h * np.cos(t) - 2 * Rc * np.sin(t / 2) ** 2 - e, (Rc + h) * np.sin(t))


def dip(c, e):
    return 0.0 if c <= 0 else math.atan2(math.sqrt(e * (2 * R / c + e)), R / c)


def load_data():
    s = open(DATA).read()
    site = json.loads(re.search(r"export const BORD_SITE = (\{.*?\});\n", s).group(1))
    fan = json.loads(re.search(r"export const BORD_FAN = (\{.*?\});\n", s).group(1))
    i = s.index("export const BORD_BUILDINGS = ") + len("export const BORD_BUILDINGS = ")
    bl = json.loads(s[i:s.index("];", i) + 1])
    g = np.frombuffer(base64.b64decode(fan["b64"]), "<u2").astype(float).reshape(fan["nD"], fan["nAz"]) / fan["q"]
    n1 = fan.get("n1", fan["nD"]); k = np.arange(fan["nD"])
    ds = np.where(k < n1, fan["d0"] + k * fan["dStep"], fan["d0"] + (n1 - 1) * fan["dStep"] + (k - n1 + 1) * fan.get("dStep2", 0))
    az = np.radians(fan["az0"] + np.arange(fan["nAz"]) * fan["azStep"])
    # comme decodeFan (bordighera.js) : d0 + i·dStep pour le premier anneau de terre
    coast = np.array([fan["d0"] + min(int(np.argmax(g[:, j] > 0.5)) if np.any(g[:, j] > 0.5) else fan["nD"] - 1, fan["nD"] - 1) * fan["dStep"] for j in range(g.shape[1])])
    return site, bl, az, ds, g, coast


def sea_top(c, e, dc):
    if c > 0 and math.sqrt(2 * (R / c) * e) < dc:
        return -dip(c, e)
    return float(elev(c, e, dc, 0))


# ---------- rendu du modèle dans le repère de la photo (étiquettes : 0 ciel, -1 terrain, -2 mer, k+1 bâtiment) ----------
def fill_poly(img, xs, ys, val):
    h, w = img.shape
    x0, x1 = max(int(math.floor(min(xs))), 0), min(int(math.ceil(max(xs))), w - 1)
    y0, y1 = max(int(math.floor(min(ys))), 0), min(int(math.ceil(max(ys))), h - 1)
    if x1 < x0 or y1 < y0: return
    yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1] + 0.5
    inside = np.zeros(xx.shape, bool); n = len(xs)
    for i in range(n):
        xa, ya, xb, yb = xs[i], ys[i], xs[(i + 1) % n], ys[(i + 1) % n]
        if ya == yb: continue
        inside ^= ((ya > yy) != (yb > yy)) & (xx < xa + (yy - ya) * (xb - xa) / (yb - ya))
    img[y0:y1 + 1, x0:x1 + 1][inside] = val


def render(D, c, W, H, s, azc, elc):
    site, bl, AZ, DS, GT, COAST = D; e = site["eye"]
    X = lambda a: W / 2 + (a - azc) * s; Y = lambda v: H / 2 - (v - elc) * s
    img = np.zeros((H, W), np.int32); half = (W / 2) / s
    jj = np.where(np.abs(AZ - azc) < half * 1.2 + 0.002)[0]; xsT = X(AZ[jj])
    bs = []
    for k, b in enumerate(bl):
        v = np.array(b["v"], float); a = v[:, 0] * 1e-6 * D2R
        if np.all(np.abs(a - azc) > half * 1.1): continue
        bs.append((v[:, 1].mean(), k, a, v))
    bs.sort(key=lambda t: -t[0])

    def building(k, a, v):
        b = bl[k]; yb = elev(c, e, v[:, 1], v[:, 2]); yt = elev(c, e, v[:, 1], b["roof"]); n = len(a)
        for q in sorted(range(n), key=lambda q: -(v[q, 1] + v[(q + 1) % n, 1])):
            r = (q + 1) % n
            fill_poly(img, [X(a[q]), X(a[r]), X(a[r]), X(a[q])], [Y(yb[q]), Y(yb[r]), Y(yt[r]), Y(yt[q])], k + 1)
        fill_poly(img, list(X(a)), list(Y(yt)), k + 1)

    bi = 0; yy = np.arange(H)[:, None] + 0.5; xc = np.arange(W) + 0.5
    for i in range(len(DS) - 1, -1, -1):
        d = DS[i]
        while bi < len(bs) and bs[bi][0] >= d:
            building(*bs[bi][1:]); bi += 1
        g = GT[i, jj]
        if not np.any(g > 0.5): continue
        top = np.interp(xc, xsT, Y(elev(c, e, d, g)))
        img[(yy >= top[None, :]) & (yy <= Y(elev(c, e, d, 0)))] = -1
    while bi < len(bs):
        building(*bs[bi][1:]); bi += 1
    st = np.interp(xc, xsT, Y(np.array([sea_top(c, e, COAST[j]) for j in jj])))
    img[yy >= st[None, :]] = -2
    return img


# ---------- image ----------
def load_rgb(p):
    w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", p],
                                   capture_output=True, text=True, check=True).stdout.strip().split(","))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(np.float32)


def box(a, r):
    """Flou boîte séparable (sommes cumulées), 2D ou par canal."""
    pad = ((r + 1, r), (0, 0)) + ((0, 0),) * (a.ndim - 2)
    cs = np.cumsum(np.pad(a, pad, mode="edge"), 0); a = (cs[2 * r + 1:] - cs[:-2 * r - 1]) / (2 * r + 1)
    pad = ((0, 0), (r + 1, r)) + ((0, 0),) * (a.ndim - 2)
    cs = np.cumsum(np.pad(a, pad, mode="edge"), 1); return (cs[:, 2 * r + 1:] - cs[:, :-2 * r - 1]) / (2 * r + 1)


def horizon(G, band=192, sm=9, gap=8):
    """Horizon de mer : par bande, la plus forte baisse de luminosité vers le bas (sous-pixel) ; droite robuste.
    Rend (pente, rangée au centre, écart-type des résidus)."""
    h, w = G.shape; xs, ys = [], []; lo, hi = int(h * 0.45), int(h * 0.62)
    for c0 in range(0, w - band + 1, band // 2):
        g = np.convolve(G[lo:hi, c0:c0 + band].mean(1), np.ones(sm) / sm, "valid"); d = g[:-2 * gap] - g[2 * gap:]
        k = int(np.argmax(d))
        if 0 < k < len(d) - 1:
            a, b, c = d[k - 1], d[k], d[k + 1]; k = k + 0.5 * (a - c) / (a - 2 * b + c + 1e-9)
        xs.append(c0 + band / 2); ys.append(lo + (sm - 1) / 2 + gap + k)
    xs, ys = np.array(xs) - w / 2, np.array(ys); keep = np.abs(ys - np.median(ys)) < 25
    for _ in range(5):
        p = np.polyfit(xs[keep], ys[keep], 1); r = ys - np.polyval(p, xs)
        keep = np.abs(r) < max(3, 2.5 * np.std(r[keep]))
    return float(p[0]), float(p[1]), float(np.std(r[keep])), int(keep.sum()), len(xs)


def level(A, roll, q=1):
    """Image redressée (rotation de -roll autour du centre), sous-échantillonnée ×q, bilinéaire."""
    h, w = A.shape[:2]; W, H = w // q, h // q
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) * q + (q - 1) / 2
    ca, sa = math.cos(roll), math.sin(roll); cx, cy = w / 2, h / 2
    xs = ca * (xx - cx) - sa * (yy - cy) + cx; ys = sa * (xx - cx) + ca * (yy - cy) + cy
    x0 = np.clip(np.floor(xs).astype(int), 0, w - 2); y0 = np.clip(np.floor(ys).astype(int), 0, h - 2)
    fx = np.clip(xs - x0, 0, 1); fy = np.clip(ys - y0, 0, 1)
    if A.ndim == 3: fx, fy = fx[..., None], fy[..., None]
    return A[y0, x0] * (1 - fx) * (1 - fy) + A[y0, x0 + 1] * fx * (1 - fy) + A[y0 + 1, x0] * (1 - fx) * fy + A[y0 + 1, x0 + 1] * fx * fy


def contrast(A):
    """Niveaux par canal (0,5 / 99,7 centiles : retire le voile bleu) puis contraste local (rayon 90 px à
    pleine résolution, gain 1,6), identiques sur toute l'image."""
    out = np.empty_like(A)
    for k in range(3):
        lo, hi = np.percentile(A[..., k], [0.5, 99.7]); out[..., k] = (A[..., k] - lo) / (hi - lo)
    Y = out.mean(2); r = max(2, round(90 * A.shape[1] / 4608)); M = box(box(Y, r), r)
    out += (M + 1.6 * (Y - M) - Y)[..., None]
    return np.clip(np.clip(out, 0, 1) ** 0.9 * 255, 0, 255)


def corr(a, b):
    a = a - a.mean(); b = b - b.mean()
    return float((a * b).sum() / math.sqrt((a * a).sum() * (b * b).sum() + 1e-12))


def main():
    path = sys.argv[1]
    ex = exif(path); D = load_data(); site, bl = D[0], D[1]; e = site["eye"]
    crop = ex["focal35"] / (ex["focal"] / (ex["dzoom"] or 1))          # 2000 / 357 = 5,60
    sensorW = DIAG35 / crop * 0.8                                      # capteur 4:3
    A0 = load_rgb(path); h, w = A0.shape[:2]
    S_FULL = w * ex["focal"] / sensorW                                 # px/rad à pleine résolution
    G0 = A0.mean(2)
    slope, yh, sd, nk, nn = horizon(G0); roll = math.atan(slope)
    print(f"EXIF {ex} ; capteur {sensorW:.3f} mm ; échelle {S_FULL:.0f} px/rad, champ {w / S_FULL / D2R:.3f}° ; "
          f"horizon rangée {yh:.1f}, roulis {math.degrees(roll):+.3f}° ({nk}/{nn}, σ {sd:.1f} px)", file=sys.stderr)

    # --- azimut par état (sous-échantillonné ×8), photo calée sur l'horizon ---
    q = 8; Gq = level(G0, roll, q); H, W = Gq.shape; s = S_FULL / q; rowh = (yh - (q - 1) / 2) / q
    hp = Gq - box(Gq, 6); above = np.arange(H)[:, None] < rowh - 2; above = np.broadcast_to(above, (H, W))
    AZ, COAST = D[2], D[5]
    def placed(c, azc, rowh, H, s):
        """Élévation du centre de l'image : la rangée de l'horizon sur le haut de la mer du modèle."""
        return sea_top(c, e, COAST[int(np.argmin(np.abs(AZ - azc)))]) + (rowh - H / 2) / s
    def score(c, azc):
        m = (render(D, c, W, H, s, azc, placed(c, azc, rowh, H, s)) > 0).astype(np.float32)
        return corr(hp[above], (m - box(m, 6))[above])
    states = []
    for c in STATES:
        grid = [(score(c, a), a) for a in np.arange(-0.004, 0.006, 0.0002)]
        a0 = max(grid)[1]
        best = max((score(c, a), a) for a in np.arange(a0 - 0.0002, a0 + 0.00021, 0.00002))
        states.append(dict(c=c, az=round(best[1], 6), score=round(best[0], 3)))
        print(f"  c = {c:.2f} : azimut {best[1] * 1e3:+.2f} mrad, corrélation {best[0]:.3f}", file=sys.stderr)

    # --- mesures (pleine résolution, image redressée autour de la ligne de mer) ---
    ref = max(states, key=lambda t: t["score"])
    if os.environ.get("BORD_AZ"):   # direction fixée (rad) : celle du premier calage, œil à 38,6 m (2026-10-06)
        ref = dict(c=0.87, az=float(os.environ["BORD_AZ"]))
        print(f"  direction fixée : {ref['az'] * 1e3:+.2f} mrad (BORD_AZ)", file=sys.stderr)
    q = 2; L = level(G0, roll, q); H, W = L.shape; s = S_FULL / q; rowh = (yh - (q - 1) / 2) / q
    img = render(D, ref["c"], W, H, s, ref["az"], placed(ref["c"], ref["az"], rowh, H, s))
    band = img[int(rowh) - 400 // q:int(rowh) - 2]
    empty = np.where((band <= 0).all(0) & (img[int(rowh) - 600 // q:int(rowh) - 2] <= 0).all(0))[0]
    refp = np.median(L[:, empty], 1) if len(empty) else np.median(L, 1)
    def cols(ids):
        ks = {k + 1 for k, b in enumerate(bl) if b["id"] in ids}
        own = np.isin(band, list(ks)); other = (band > 0) & ~own
        return np.where(own.any(0) & ~other.any(0))[0], np.where(own.any(0))[0]
    meas = {}
    for key, n in site["named"].items():
        excl, anyc = cols(n["ids"])
        cc = excl if len(excl) >= 10 else anyc
        x = np.convolve(L[:, cc].mean(1) - refp, np.ones(5) / 5, "same")     # clarté au-dessus du voile voisin
        y = np.arange(H); win = (y > rowh - 500 / q) & (y < rowh - 4 / q)
        peak = float(x[win].max())
        # haut : première rangée (depuis le haut) où l'excès dépasse la moitié du maximum (au moins 2 niveaux)
        thr = max(2.0, 0.5 * peak); top = next((int(y[i]) for i in np.where(win)[0] if x[i] > thr), None)
        px = (rowh - top) * q if top is not None else 0.0
        b = next(b for b in bl if b["id"] == n["ids"][0]); d = float(np.mean([v[1] for v in b["v"]]))
        f = lambda c: (float(elev(c, e, d, n["roof"])) - sea_top(c, e, COAST[int(np.argmin(np.abs(AZ - ref["az"])))])) * S_FULL
        lo, hi = 0.3, 1.0
        for _ in range(60):
            m = (lo + hi) / 2
            if f(m) > px: lo = m
            else: hi = m
        meas[key] = dict(px=round(px), excess=round(peak, 1), mrad=round(px / S_FULL * 1e3, 4), m=round(px / S_FULL * d, 1),
                         c=round(lo, 3), k=round(1 - lo, 3), pred={str(c): round(f(c)) for c in (0.0, 1 - K, 1.0)}, cols=int(len(cc)))
        print(f"  {n['name']} : {meas[key]}", file=sys.stderr)

    # --- photo publiée : redressée, contrastée, 1600 px, sans métadonnées ---
    Aq = level(contrast(A0), roll, 1)
    os.makedirs(os.path.dirname(PUB), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-",
                    "-vf", f"scale={PUB_W}:-1:flags=area", "-map_metadata", "-1", "-q:v", "4", PUB],
                   input=np.ascontiguousarray(Aq.astype(np.uint8)).tobytes(), check=True)
    pw, ph = PUB_W, round(h * PUB_W / w)
    out = dict(src="photos/hh-bordighera-zoom.jpg", w=pw, h=ph, horizon=round(yh * pw / w, 2), s=round(S_FULL * pw / w), az=ref["az"],
               fov=round(w / S_FULL / D2R, 4), time=ex.get("time"), focal=ex["focal"], focal35=ex["focal35"], dzoom=ex["dzoom"],
               sensorW=round(sensorW, 3), roll=round(roll, 6), horizonSd=round(sd * pw / w, 2), states=states, meas=meas)
    with open(OUT, "w") as fo:
        fo.write("// GENERATED by research/fit_bordighera_photo.py -- do not edit by hand.\n")
        fo.write("// The owner's P900 photo DSCN7496 (28 March 2026, 17:34), levelled on its sea horizon (already rotated by\n")
        fo.write("// roll), contrast corrected, w x h px. Scale s (px/rad) from the EXIF focal length, the same for every model.\n")
        fo.write("// Placed ON THE HORIZON: photo row `horizon` = the model's sea top, in every state c (apparent curvature).\n")
        fo.write("// az: azimuth of the photo centre (rad, relative to BORD_SITE.az), the only free parameter, one for all models\n")
        fo.write("// (a direction does not depend on the shape): that of the best-matching state. states[]: each model's OWN best\n")
        fo.write("// azimuth and its match of the buildings (score = correlation; steel-man for the plane). meas: named roofs above the photo's\n")
        fo.write("// sea line (px at full resolution, mrad, m at their distance) and the curvature c / refraction k they imply.\n")
        fo.write(f"export const BORD_PHOTO = {json.dumps(out, separators=(',', ':'), ensure_ascii=False)};\n")


if __name__ == "__main__":
    main()
