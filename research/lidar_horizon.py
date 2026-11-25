#!/usr/bin/env python3
"""Cuit les profils d'horizon des points de vue français depuis le MNT
LiDAR HD de l'IGN (Géoplateforme, WMS-Raster, flottants 32 bits).

Remplace make_horizon.py/dem.py du legacy (jamais versionnés), qui lisaient
SRTM ou un MNT France à 3″ (~90 m). Le contrat est celui de HORIZONS
(legacy, en-tête v51) : TROIS courbes -- plan, globe rayons droits, globe à
k -- tirées d'UNE SEULE lecture de terrain, donc toute différence entre
elles est de la géométrie, jamais de l'échantillonnage.

MÉTHODE, en deux passes (un rayon de 285 km à 1 m, c'est 285 000 lectures
par azimut : on ne lit finement que là où ça peut compter) :
  1. passe grossière : chaque rayon est échantillonné tous les 25 m sur une
     grille à 1″ (~30 m) ;
  2. affinage : tout échantillon grossier dont l'angle, augmenté de la marge
     DH_MARGIN/s (ce qu'un pic pointu peut perdre entre 30 m et 1 m),
     atteint le maximum grossier du rayon est relu à 1 m sur ±25 m le long
     du rayon, sur une grille à 1e-5° (~1 m). Le maximum retenu est celui
     de ces lectures fines. Le rapport imprime le plus grand écart
     fin - grossier observé : s'il dépasse la marge, la marge est fausse et
     le script refuse d'écrire.

SOURCE AUTRICHIENNE (2026-09-26) : un site qui porte dem="bev" est lu sur
le MNT ALS à 1 m du BEV (research/bev_dem.py : COG en EPSG:3035, niveau
réduit à ≈16 m pour la passe grossière, 1 m pour l'affinage). Code source 4.

SOURCE, dans l'ordre : LiDAR HD MNT (IGNF_LIDAR-HD_MNT_ELEVATION, WGS84G) ;
là où il manque (−9999), RGE ALTI (ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES) ;
là où les deux manquent, la mer à 0 m. Le rapport compte, pour les points
qui DÉFINISSENT la silhouette, combien viennent de chaque source.

Un rayon reste un rayon : entre deux azimuts, un sommet peut passer entre
les mailles. C'est le pas d'azimut du profil qui fixe cette résolution,
pas le MNT.

Usage :
  python3 research/lidar_horizon.py <site> [--source lidar|srtm3] [--write]
                                          [--summits] [--vp LAT,LON,EYE]
  sites : globespot, vieriou, canigou (ou « all »)
  --source srtm3 : même balayage sur la couche SRTM 3″ de l'IGN, pour la
                   régression contre les profils actuels (sans --write).
  --summits      : lit au LiDAR l'altitude des sommets nommés du site,
                   à comparer aux altitudes publiées.
Le cache des dalles est dans data/dem/cache/ (ignoré par git).
"""
import argparse, json, math, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bev_dem, cop_dem

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "dem", "cache")
WMS = "https://data.geopf.fr/wms-r/wms"
LAYERS = {
    "lidar": "IGNF_LIDAR-HD_MNT_ELEVATION.ELEVATIONGRIDCOVERAGE.WGS84G",
    "rgealti": "ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES",
    "srtm3": "ELEVATION.ELEVATIONGRIDCOVERAGE.SRTM3",
}
R_EARTH = 6371000.0
VALID_MIN = -100.0     # m : en dessous, une lecture IGN est un artefact de bord de trou, pas du relief
COP_FALLBACK = False   # activé par un site qui porte cop=True (relief hors de France visible)
# source « lidarcop » (2026-09-27, Caussols) : LiDAR/RGE ALTI jusqu'à COP_BEYOND km du point de vue,
# Copernicus au-delà (une vue de 78° jusqu'en Corse, 260 km : 2 000 dalles WMS sinon)
COP_BEYOND = 45.0; VP = (0.0, 0.0)
DH_MARGIN = 40.0     # m : perte maximale admise d'un pic entre 1″ et 1 m
COARSE = (0.05, 180)   # dalle 0,05° à 180 px -> 1″
FINE = (0.005, 500)    # dalle 0,005° à 500 px -> 1e-5°
STEP_COARSE = 25.0   # m le long du rayon
STEP_FINE = 1.0

# Points de vue. Coordonnées et altitudes : celles de la page (obs.js,
# presets/sim.js, en-tête du legacy) ; az0/step/n/k reprennent les profils
# existants pour que les figures n'aient rien à changer.
SITES = {
    "globespot": dict(lat=44.09388, lon=6.92856, eye=1690.0, az0=200.0, step=0.1, n=851,
                      k=0.13, dmin=500.0, dmax=120000.0, out="js",
                      # le croisement des deux crêtes (onglet obs) : fenêtres de
                      # distance de chaque crête, balayage fin en azimut
                      cross=dict(az0=241.10, step=0.002, n=151, near=(5000, 30000), far=(40000, 70000)),
                      # bande détaillée (2026-09-24, demande du propriétaire) : là où les
                      # couchers de ct (24 nov.) et d'obs (10 janv.) sont filmés, la crête
                      # au pas de 0,01° -- ~9 m entre deux rayons à 54 km -- pour coller
                      # au LiDAR à fort zoom ; les figures la préfèrent au profil à 0,1°
                      detail=dict(az0=236.0, step=0.01, n=801),
                      summits=[("Globe spot (viewpoint)", 44.09388, 6.92856, 1690),
                               ("Le Grand Mourre", 43.85750, 6.33722, 1898),
                               ("Mourre de Chanier", 43.84171, 6.35139, 1930),
                               ("Ridge point 1677 m", 44.02418, 6.75155, 1677),
                               ("Mourre Frey", 44.03250, 6.73333, 2025)]),
    # la vue « paysage » d'elev (2026-09-25) : même point de vue, fenêtre large
    # 258-278° pour un rendu en couches comme obs ; fichiers à part pour ne
    # pas toucher vieriou.json (silhouette legacy d'elev)
    "vieriouview": dict(lat=43.799634, lon=7.060015, eye=1395.0, az0=258.0, step=0.02, n=1001,
                        k=0.13, dmin=1500.0, dmax=120000.0, out="json", file="vieriou-view",
                        keys=("flat", "globe", "globeK"), layerwin=dict(az0=258.0, step=0.025, n=801),
                        summits=[]),
    # point de vue personnel du propriétaire (2026-09-25) : regard au 17,4° vers
    # la Cima Nord dell'Argentera (Italie, 64 km) derrière le Riourun ; sol LiDAR
    # 109,2 m + 1,7 m d'œil (SUPPOSÉ, à confirmer). Côté italien, c'est le RGE
    # ALTI qui répond (le LiDAR HD s'arrête à la frontière).
    "argentera": dict(lat=43.62374, lon=7.07219, eye=110.9, az0=12.0, step=0.01, n=1101,
                      k=0.13, dmin=300.0, dmax=120000.0, out="json", file="argentera-view",
                      keys=("flat", "globe", "globeK"), layerwin=dict(az0=12.0, step=0.01, n=1101),
                      summits=[("Cima Sud dell'Argentera (publiée)", 44.1753, 7.3042, 3297)]),
    # second point de vue du propriétaire (2026-10-06), d'où vient la photo P900 DSCN7498 (31 mars 2026,
    # 143 mm) : « 43,62258 N 7,07217 E, environ », au bord d'une route, 130 m au sud du précédent ;
    # sol LiDAR 105,0 m + 1,7 m d'œil (SUPPOSÉ, comme le premier).
    "argentera2": dict(lat=43.62258, lon=7.07217, eye=106.7, az0=12.0, step=0.01, n=1101,
                       k=0.13, dmin=300.0, dmax=120000.0, out="json", file="argentera2-view",
                       keys=("flat", "globe", "globeK"), layerwin=dict(az0=12.0, step=0.01, n=1101),
                       summits=[("Cima Sud dell'Argentera (publiée)", 44.1753, 7.3042, 3297)]),
    # Vienne (Donaustadt) → le Schneeberg, 70,9 km (photo envoyée au propriétaire,
    # 2026-09-26). Point de vue et œil tels que DONNÉS par le photographe (164 m ;
    # sol BEV 156,7 m : étage ou balcon ? question posée). Son azimut mesuré,
    # 248,69°, ne colle pas à ses coordonnées (226,1°) : fenêtre large couvrant
    # les deux, en attendant sa réponse. Terrain : BEV ALS 1 m (Autriche).
    "schneeberg": dict(lat=48.211995, lon=16.48885, eye=164.0, az0=218.0, step=0.025, n=1601,
                       k=0.13, dmin=300.0, dmax=125000.0, out="json", file="schneeberg-view", dem="bev",
                       keys=("flat", "globe", "globeK"), layerwin=dict(az0=218.0, step=0.025, n=1601),
                       summits=[("Schneeberg (coordonnées du photographe)", 47.767474, 15.805565, 2075),
                                ("Klosterwappen (LiDAR, max ±150 m)", 47.767016, 15.804469, 2076),
                                ("Point de vue (donné 164 m)", 48.211995, 16.48885, 164)]),
    # Plateau de Caussols, 1 210 m (photo PeakFinder du propriétaire, 2026-09-27) : vue vers
    # l'est, de 53° à 129°, du Monte Ceppo (Italie, 70 km) à la Corse (216 km et plus) au-dessus
    # de la mer. LiDAR/RGE ALTI jusqu'à 45 km, Copernicus au-delà ; bandes jusqu'à 260 km.
    "caussols": dict(lat=43.72218, lon=6.93849, eye=1210.0, az0=52.0, step=0.04, n=1951,
                     k=0.13, dmin=300.0, dmax=260000.0, out="json", file="caussols-view", dem="lidarcop",
                     keys=("flat", "globe", "globeK"), layerwin=dict(az0=52.0, step=0.04, n=1951),
                     bands=[0.5, 1.5, 3, 6, 10, 15, 22, 30, 42, 55, 75, 120, 180, 260], sea=True,
                     summits=[("Point de vue (donné 1 210 m)", 43.72218, 6.93849, 1210)]),
    "vieriou": dict(lat=43.799634, lon=7.060015, eye=1395.0, az0=264.23, step=0.02, n=311,
                    k=0.13, dmin=1500.0, dmax=120000.0, out="json", ex=1,
                    summits=[("Sommet de Viériou", 43.799634, 7.060015, 1395),
                             ("Castellaras de Thorenc", 43.791999, 6.839338, 1400),
                             ("Cime de Barbin", 43.780144, 6.313491, 1561)]),
    # Allauch : coordonnées jamais écrites par le legacy. Retrouvées par le
    # relèvement : l'ancien profil sort le sommet du Canigou à 250,76°, celui
    # des moulins d'Allauch (43,3372 N 5,4818 E) à 180 m latéraux près ; mais
    # le LiDAR y lit le sol à 214 m, pas 290. Point retenu : le plus proche des
    # moulins dont le sol LiDAR est à ~290 m (286,5 m), colline de
    # Notre-Dame-du-Château. À 263 km, 300 m de décalage déplacent la
    # silhouette de ~0,05°. À CONFIRMER par le propriétaire.
    "canigou": dict(lat=43.3364, lon=5.4854, eye=290.0, az0=249.40, step=0.04, n=71,
                    k=0.13, dmin=500.0, dmax=285000.0, out="json",
                    summits=[("Allauch (viewpoint)", 43.3364, 5.4854, 290), ("Canigou", 42.51905, 2.45674, 2785)]),
}


# --------------------------------------------------------------------- dalles
def _fetch(layer, bbox, w, h):
    s, wl, n, e = bbox
    url = (f"{WMS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS={LAYERS[layer]}"
           f"&STYLES=&CRS=EPSG:4326&BBOX={s:.8f},{wl:.8f},{n:.8f},{e:.8f}"
           f"&WIDTH={w}&HEIGHT={h}&FORMAT=image/x-bil;bits=32")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=90) as r:
                raw = r.read()
            a = np.frombuffer(raw, "<f4")
            if a.size != w * h:
                raise IOError(f"taille {a.size} != {w * h} (réponse non-BIL ?)")
            return a.reshape(h, w).copy()
        except Exception as ex:  # réseau capricieux : on réessaie, puis on abandonne franchement
            if attempt == 4:
                raise
            time.sleep(2 * (attempt + 1))


def tile(kind, grid, ti, tj, source):
    """Dalle (ti, tj) de la grille `grid` = (taille en degrés, pixels), avec
    un pixel de recouvrement de chaque côté pour l'interpolation bilinéaire.
    Renvoie (valeurs float32, code source uint8 : 1 LiDAR, 2 RGE ALTI,
    3 SRTM, 0 mer/rien)."""
    T, P = grid
    d = os.path.join(CACHE, f"{source}-{kind}")
    f = os.path.join(d, f"{ti}_{tj}.npz")
    if os.path.exists(f) and COP_FALLBACK and source == "lidar" and "cop" not in (zz := np.load(f)).files and (zz["c"] == 0).any():
        os.remove(f)          # cuite avant Copernicus : ses trous (hors de France) valaient la mer ; on refait
    if os.path.exists(f):
        z = np.load(f)
        v, c = z["v"], z["c"]
        if source == "srtm3":
            # la couche SRTM3 de l'IGN porte des artefacts sur l'eau (−451 à
            # 7 220 m au large de la Camargue) : mer, pour la régression seulement
            bad = (v < -100) | (v > 5000)
            v = np.where(bad, 0.0, v).astype(np.float32); c = np.where(bad, 0, c).astype(np.uint8)
        return v, c
    px = T / P
    bbox = (ti * T - px, tj * T - px, (ti + 1) * T + px, (tj + 1) * T + px)
    if source == "lidarcop":
        cla, clo = (ti + 0.5) * T, (tj + 0.5) * T
        dkm = 6371 * math.acos(min(1, math.sin(math.radians(VP[0])) * math.sin(math.radians(cla))
              + math.cos(math.radians(VP[0])) * math.cos(math.radians(cla)) * math.cos(math.radians(clo - VP[1]))))
        if dkm > COP_BEYOND + T * 111:        # loin : Copernicus seul (code 5 ; sa mer, code 0)
            rr = (ti + 1) * T + px - (np.arange(P + 2) + 0.5) * px
            qq = tj * T - px + (np.arange(P + 2) + 0.5) * px
            LA, LO = np.meshgrid(rr, qq, indexing="ij")
            v = cop_dem.grid(LA, LO).reshape(LA.shape).astype(np.float32)
            land = np.isfinite(v) & (np.abs(v) > 0.5)
            c = np.where(land, 5, 0).astype(np.uint8); v[~land] = 0.0
            os.makedirs(d, exist_ok=True); np.savez_compressed(f, v=v, c=c)
            return v, c
    if source == "bev":
        # mêmes centres de pixels que la réponse WMS : ligne 0 au nord
        rr = (ti + 1) * T + px - (np.arange(P + 2) + 0.5) * px
        qq = tj * T - px + (np.arange(P + 2) + 0.5) * px
        LA, LO = np.meshgrid(rr, qq, indexing="ij")
        v = bev_dem.grid(LA, LO, 4 if kind == "coarse" else 0).reshape(LA.shape).astype(np.float32)
        ok = np.isfinite(v)
        c = np.where(ok, 4, 0).astype(np.uint8)
        v[~ok] = 0.0
        # une dalle à trous n'est PAS mise en cache : hors d'Autriche elle sera
        # relue (c'est rapide, la dalle BEV n'existe pas) ; en Autriche, un trou
        # vient d'une panne passagère, qui ne doit pas s'inscrire dans le cache
        # (2026-09-26 : 113 dalles grossières vides, cachées par un premier
        # lancement où l'index des dalles se remplissait en concurrence)
        if ok.all():
            os.makedirs(d, exist_ok=True)
            np.savez_compressed(f, v=v, c=c)
        return v, c
    if source == "srtm3":
        v = _fetch("srtm3", bbox, P + 2, P + 2)
        ok = v > -1000
        c = np.where(ok, 3, 0).astype(np.uint8)
    else:                                   # "lidar", et "lidarcop" près du point de vue
        v = _fetch("lidar", bbox, P + 2, P + 2)
        # VALIDE = au-dessus de −100 m (2026-09-27) : au bord de ses trous, le WMS de l'IGN rend des
        # valeurs HYBRIDES (−617, −264 m au sommet du Mont Agel, jusqu'à −1 000 m ailleurs), qui
        # passaient le seuil « −9 999 » et abaissaient la grille grossière (653 m à l'Agel). Aucun
        # point de France n'est sous −10 m.
        ok = v > VALID_MIN
        c = np.where(ok, 1, 0).astype(np.uint8)
        if not ok.all():
            r = _fetch("rgealti", bbox, P + 2, P + 2)
            fill = ~ok & (r > VALID_MIN)
            v[fill] = r[fill]
            c[fill] = 2
            ok = ok | fill
        # hors de France (2026-09-27) : Copernicus GLO-30 (code 5) ; sa mer (0 m) reste « mer » (code 0)
        # tout trou IGN (hors de France, ou artefact rejeté) : Copernicus, pour TOUS les sites (2026-09-27)
        if not ok.all():
            rr = (ti + 1) * T + px - (np.arange(P + 2) + 0.5) * px
            qq = tj * T - px + (np.arange(P + 2) + 0.5) * px
            LA, LO = np.meshgrid(rr, qq, indexing="ij")
            cv = cop_dem.grid(LA[~ok], LO[~ok])
            land = np.isfinite(cv) & (np.abs(cv) > 0.5)
            idx = np.nonzero(~ok)
            v[idx[0][land], idx[1][land]] = cv[land]; c[idx[0][land], idx[1][land]] = 5
            ok[idx[0][land], idx[1][land]] = True
    v[~ok] = 0.0
    os.makedirs(d, exist_ok=True)
    extra = {"cop": np.array(1)} if COP_FALLBACK and source == "lidar" else {}   # déjà complétée par Copernicus
    np.savez_compressed(f, v=v.astype(np.float32), c=c, **extra)
    return v, c


def sample(lat, lon, kind, source, workers=8):
    """Altitude bilinéaire aux points (lat, lon) ; renvoie (h, code source
    du pixel le plus proche)."""
    grid = COARSE if kind == "coarse" else FINE
    T, P = grid
    px = T / P
    ti = np.floor(lat / T).astype(np.int64)
    tj = np.floor(lon / T).astype(np.int64)
    keys = np.unique(np.stack([ti, tj], 1), axis=0)
    todo = [tuple(k) for k in keys if not os.path.exists(
        os.path.join(CACHE, f"{source}-{kind}", f"{k[0]}_{k[1]}.npz"))]
    if todo:
        print(f"  {len(todo)} dalles {kind} à télécharger ({source})", file=sys.stderr)
        with ThreadPoolExecutor(workers) as ex:
            list(ex.map(lambda k: tile(kind, grid, k[0], k[1], source), todo))
    h = np.empty(lat.shape, np.float64)
    code = np.empty(lat.shape, np.uint8)
    for a, b in keys:
        m = (ti == a) & (tj == b)
        v, c = tile(kind, grid, a, b, source)
        # centre du pixel (0,0) de la dalle étendue : nord-ouest, décalé d'un demi-pixel
        top = (a + 1) * T + px
        left = b * T - px
        r = (top - lat[m]) / px - 0.5
        q = (lon[m] - left) / px - 0.5
        r0 = np.clip(np.floor(r).astype(int), 0, P)
        q0 = np.clip(np.floor(q).astype(int), 0, P)
        fr, fq = r - r0, q - q0
        h[m] = (v[r0, q0] * (1 - fr) * (1 - fq) + v[r0 + 1, q0] * fr * (1 - fq)
                + v[r0, q0 + 1] * (1 - fr) * fq + v[r0 + 1, q0 + 1] * fr * fq)
        code[m] = c[np.rint(r).astype(int).clip(0, P + 1), np.rint(q).astype(int).clip(0, P + 1)]
    return h, code


# ------------------------------------------------------------------ géométrie
def destination(lat, lon, az, s):
    """Point à la distance s (m) le long du grand cercle d'azimut az (°)."""
    p1, l1, t, d = math.radians(lat), math.radians(lon), np.radians(az), s / R_EARTH
    p2 = np.arcsin(math.sin(p1) * np.cos(d) + math.cos(p1) * np.sin(d) * np.cos(t))
    l2 = l1 + np.arctan2(np.sin(t) * np.sin(d) * math.cos(p1), np.cos(d) - math.sin(p1) * np.sin(p2))
    return np.degrees(p2), np.degrees(l2)


def angles(s, h, eye, k):
    """Élévation (arcmin) : plan, globe rayons droits, globe à k (rayon
    effectif R/(1-k), règle 3)."""
    flat = np.arctan2(h - eye, s)
    def globe(Rm):
        th = s / Rm
        return np.arctan2((Rm + h) * np.cos(th) - (Rm + eye), (Rm + h) * np.sin(th))
    f = 180 * 60 / math.pi
    return flat * f, globe(R_EARTH) * f, globe(R_EARTH / (1 - k)) * f


# ------------------------------------------------------------------- balayage
def sweep(site, source, S=None):
    S = S or SITES[site]
    az = S["az0"] + S["step"] * np.arange(S["n"])
    s = np.arange(S["dmin"], S["dmax"] + 1, STEP_COARSE)
    AZ, SS = np.meshgrid(az, s, indexing="ij")
    lat, lon = destination(S["lat"], S["lon"], AZ.ravel(), SS.ravel())
    h, hc = sample(lat, lon, "coarse", source)
    H = h.reshape(AZ.shape)
    sea = (hc == 0).reshape(AZ.shape)
    models = angles(SS, H, S["eye"], S["k"])
    names = ("flat", "globe", "globeK")
    res = {m: np.empty(S["n"]) for m in names}
    dist = {m: np.empty(S["n"]) for m in names}
    hwin = {m: np.empty(S["n"]) for m in names}
    src = {m: np.zeros(S["n"], np.uint8) for m in names}
    gain = []   # (fin - grossier) en m au point gagnant, pour vérifier la marge
    if source == "srtm3":   # régression : pas d'affinage, la couche n'a pas mieux que 3″
        for m, A in zip(names, models):
            i = A.argmax(1)
            res[m] = A.max(1); dist[m] = s[i]; hwin[m] = H[np.arange(S["n"]), i]; src[m][:] = 3
        return az, res, dist, hwin, src, gain
    # affinage
    margin = np.degrees(DH_MARGIN / SS) * 60
    cand = np.zeros(AZ.shape, bool)
    for A in models:
        cand |= A + margin >= A.max(1, keepdims=True)
    # la mer vaut 0 m à toutes les résolutions : rien à affiner. Sans ce
    # filtre, depuis Allauch, tout l'horizon marin (0,3′ sous le Canigou sur
    # le globe) tombait dans la marge : 7,4 millions de lectures fines.
    # Le pixel grossier est « mer » seulement si LiDAR ET RGE ALTI manquent.
    cand &= ~sea
    ri, ci = np.nonzero(cand)
    off = np.arange(-STEP_COARSE, STEP_COARSE + STEP_FINE / 2, STEP_FINE)
    fs = (s[ci][:, None] + off[None, :]).ravel()
    fr = np.repeat(ri, off.size)
    keep = fs >= S["dmin"]
    fs, fr = fs[keep], fr[keep]
    print(f"  {len(ri)} échantillons candidats, {fs.size} lectures fines", file=sys.stderr)
    flat_, flon = destination(S["lat"], S["lon"], az[fr], fs)
    fh, fc = sample(flat_, flon, "fine", source)
    fmodels = angles(fs, fh, S["eye"], S["k"])
    for m, A, FA in zip(names, models, fmodels):
        best = np.full(S["n"], -np.inf); bi = np.zeros(S["n"], int)
        order = np.lexsort((-FA, fr))              # par rayon, meilleur d'abord
        first = np.ones(order.size, bool); first[1:] = fr[order][1:] != fr[order][:-1]
        w = order[first]
        best[fr[w]] = FA[w]; bi[fr[w]] = w
        res[m] = best.copy(); dist[m] = fs[bi]; hwin[m] = fh[bi]; src[m] = fc[bi]
        # la mer (0 m, exacte à 1″) peut faire l'horizon : elle concourt ici
        As = np.where(sea, A, -np.inf); j = As.argmax(1); sv = As[np.arange(S["n"]), j]
        wins = sv > best
        res[m][wins] = sv[wins]; dist[m][wins] = s[j[wins]]; hwin[m][wins] = 0.0; src[m][wins] = 0
        # gain au point gagnant : altitude fine contre grille grossière AU MÊME
        # POINT (comparer à l'échantillon grossier le plus proche le long du
        # rayon mesurait la pente -- 84 m sur une falaise -- pas la perte d'un pic)
        ch, cc = sample(flat_[bi], flon[bi], "coarse", source)
        g = fh[bi] - ch
        # diagnostic (2026-09-27, l'écart de 653 m de Caussols) : OÙ la marge est dépassée
        for r in np.nonzero(np.abs(g) > DH_MARGIN)[0][:5]:
            k = bi[r]
            print(f"  [{m}] écart {g[r]:+.0f} m : az {az[r]:.3f}°, {fs[k] / 1000:.2f} km, ({flat_[k]:.5f}, {flon[k]:.5f}) "
                  f"fin {fh[k]:.0f} m (source {fc[k]}) / grossier {ch[r]:.0f} m (source {cc[r]}) ; rayon sans candidat : {not np.isfinite(best[r])}", file=sys.stderr)
        gain.append(g)
    return az, res, dist, hwin, src, np.concatenate(gain)


def sweep_chunked(site, source, S=None, chunk=200):
    """sweep() par paquets de `chunk` rayons (2026-09-26) : depuis Vienne, la
    plaine au niveau de l'œil fait des candidats par centaines de milliers ;
    tout d'un coup (1 601 rayons, 12,5 M lectures fines) la mémoire de la
    machine n'y suffisait pas. Même résultat, rayon par rayon."""
    S = S or SITES[site]
    if S["n"] <= chunk: return sweep(site, source, S)
    parts = []
    for i0 in range(0, S["n"], chunk):
        P = {**S, "az0": S["az0"] + i0 * S["step"], "n": min(chunk, S["n"] - i0)}
        print(f"  paquet {i0 // chunk + 1}/{-(-S['n'] // chunk)} : {P['az0']:.3f}° + {P['n']} rayons", file=sys.stderr)
        parts.append(sweep(site, source, P))
    az = np.concatenate([p[0] for p in parts])
    cat = lambda j: {m: np.concatenate([p[j][m] for p in parts]) for m in parts[0][j]}
    return az, cat(1), cat(2), cat(3), cat(4), np.concatenate([p[5] for p in parts])


def summits(site, source="lidar"):
    S = SITES[site]
    out = []
    for name, la, lo, pub in S["summits"]:
        # fenêtre de ±40 m autour du point publié, lue à 1 m
        dy = 40 / 111320.0; dx = 40 / (111320.0 * math.cos(math.radians(la)))
        g = np.linspace(-1, 1, 81)
        LA, LO = np.meshgrid(la + g * dy, lo + g * dx, indexing="ij")
        h, c = sample(LA.ravel(), LO.ravel(), "fine", source)
        i = h.argmax()
        at = h.reshape(LA.shape)[40, 40]
        moved = math.hypot((LA.ravel()[i] - la) * 111320, (LO.ravel()[i] - lo) * 111320 * math.cos(math.radians(la)))
        out.append((name, pub, round(float(at), 1), round(float(h[i]), 1), round(moved), int(c[i])))
    return out


def crossing(site):
    """Azimut où la crête proche et la crête lointaine se touchent, pour chaque
    modèle : un balayage par crête (fenêtre de distance), au pas fin, puis
    interpolation linéaire du changement de signe. Renvoie aussi l'altitude
    et la distance des deux points qui se touchent, et l'altitude d'œil
    qu'un plan exigerait pour qu'ils coïncident."""
    S, X = SITES[site], SITES[site]["cross"]
    runs = {}
    for side in ("near", "far"):
        SITES["_x"] = dict(S, az0=X["az0"], step=X["step"], n=X["n"], dmin=X[side][0], dmax=X[side][1])
        runs[side] = sweep("_x", "lidar")
    del SITES["_x"]
    az = runs["near"][0]
    out = {}
    for m in ("flat", "globe", "globeK"):
        n, f = runs["near"][1][m], runs["far"][1][m]
        diff = f - n
        js = np.where(np.diff(np.sign(diff)) != 0)[0]
        if len(js) != 1:
            sys.exit(f"REFUS : {len(js)} croisements pour {m} (un seul attendu)")
        j = js[0]; t = diff[j] / (diff[j] - diff[j + 1])
        hn, dn = runs["near"][3][m][j], runs["near"][2][m][j]
        hf, df = runs["far"][3][m][j], runs["far"][2][m][j]
        out[m] = dict(az=round(float(az[j] + t * X["step"]), 3), alt=round(float(n[j] + t * (n[j + 1] - n[j])), 2),
                      nearH=round(float(hn), 1), nearD=round(float(dn) / 1000, 2),
                      farH=round(float(hf), 1), farD=round(float(df) / 1000, 2),
                      planeEye=round(float((hn * df - hf * dn) / (df - dn)), 1))
    return out



# ------------------------------------------------------------ couches (obs)
LAYER_BANDS_KM = [0.5, 1.5, 3, 6, 10, 15, 22, 30, 42, 55, 75, 120]
LAYER_WIN = dict(az0=228.0, step=0.025, n=1121)


def layers(site, source="lidar"):
    """Rendu « en couches » (2026-09-24) : pour chaque azimut et chaque
    tranche de distance, l'angle d'élévation de la crête la plus haute DANS
    la tranche, pour les trois modèles. Grille grossière 1″ (sans l'affinage
    à 1 m : c'est un décor peint couche par couche, la ligne de crête exacte
    reste celle du profil). En dixièmes de minute d'arc, entiers ; None si la
    tranche ne contient rien au-dessus de −90°."""
    S = SITES[site]; W = S.get("layerwin", LAYER_WIN); BANDS = S.get("bands", LAYER_BANDS_KM)
    az = W["az0"] + W["step"] * np.arange(W["n"])
    edges = np.array(BANDS) * 1000
    s = np.arange(edges[0], edges[-1] + 1, STEP_COARSE)
    band = np.searchsorted(edges, s, side="right") - 1
    out = {m: np.full((len(edges) - 1, W["n"]), np.nan) for m in ("flat", "globe", "globeK")}
    for c0 in range(0, W["n"], 60):                      # par paquets : mémoire bornée
        a = az[c0:c0 + 60]
        AZ, SS = np.meshgrid(a, s, indexing="ij")
        lat, lon = destination(S["lat"], S["lon"], AZ.ravel(), SS.ravel())
        h, hc = sample(lat, lon, "coarse", source)
        H = h.reshape(AZ.shape)
        # la mer (code 0) n'est pas du relief : une tranche toute marine reste vide (le rendu
        # peint la mer jusqu'à l'horizon du modèle ; Caussols, 2026-09-27)
        sea = (hc == 0).reshape(AZ.shape) if S.get("sea") else np.zeros(AZ.shape, bool)
        for m, A in zip(("flat", "globe", "globeK"), angles(SS, H, S["eye"], S["k"])):
            A = np.where(sea, -np.inf, A)
            for b in range(len(edges) - 1):
                sel = band == b
                if sel.any():
                    out[m][b, c0:c0 + len(a)] = A[:, sel].max(1)
    enc = lambda row: [None if not np.isfinite(v) else int(round(v * 10)) for v in row]
    return {"az0": W["az0"], "step": W["step"], "bandsKm": BANDS, "unit": "0.1 arcmin",
            **{m: [enc(r) for r in out[m]] for m in out}}

# ----------------------------------------------------------------- écriture
def arr(a):
    return "[" + ",".join(f"{v:.2f}" for v in a) + "]"


def write(site, az, res, dist, detail=None):
    S = SITES[site]
    cross = crossing(site) if "cross" in S else None
    if S["out"] == "json":
        d = {"az0": S["az0"], "step": S["step"]}
        if "ex" in S:
            d["ex"] = S["ex"]
        for m in S.get("keys", ("flat", "globeK")):
            d[m] = [round(float(v), 2) for v in res[m]]
        p = os.path.join(ROOT, "src", "data", "dem", f"{S.get('file', site)}.json")
        with open(p, "w") as f:
            json.dump(d, f, indent=2)
            f.write("\n")
    else:
        p = os.path.join(ROOT, "src", "data", "dem", "globespot.js")
        head = open(p).read().split("export const")[0]
        body = (f"export const GLOBESPOT = {{\n"
                f"  name: 'Globe spot', lat: {S['lat']}, lon: {S['lon']}, eye: {S['eye']:.1f},\n"
                f"  az0: {S['az0']:.2f}, step: {S['step']:.2f}, k: {S['k']},\n"
                f"  flat:   {arr(res['flat'])},\n"
                f"  globe:  {arr(res['globe'])},\n"
                f"  globeK: {arr(res['globeK'])},\n"
                f"  dist:   [{','.join(f'{v / 1000:.1f}' for v in dist['globeK'])}],\n"
                f"  crossing: {json.dumps(cross)},\n"
                + (f"  detail: {{ az0: {detail['az0']:.2f}, step: {detail['step']}, n: {detail['n']},\n"
                   f"    flat:   {arr(detail['res']['flat'])},\n"
                   f"    globe:  {arr(detail['res']['globe'])},\n"
                   f"    globeK: {arr(detail['res']['globeK'])} }},\n" if detail else "")
                + "};\n")
        with open(p, "w") as f:
            f.write(head + body)
    print(f"écrit {os.path.relpath(p, ROOT)}")


def compare(site, res):
    S = SITES[site]
    p = os.path.join(ROOT, "src", "data", "dem", f"{S.get('file', site)}.json" if S["out"] == "json" else "globespot.js")
    if S["out"] == "json":
        if not os.path.exists(p):
            print("  (pas de fichier existant à comparer)"); return
        old = json.load(open(p))
    else:
        txt = open(p).read()
        old = {}
        for key in ("flat", "globe", "globeK"):
            i = txt.index(f"  {key}:")
            old[key] = json.loads(txt[txt.index("[", i):txt.index("]", i) + 1])
    for m in ("flat", "globe", "globeK"):
        if m not in old:
            continue
        d = res[m] - np.array(old[m])
        print(f"  {m:7s} nouveau - actuel : moyenne {d.mean():+.2f}′  min {d.min():+.2f}′  max {d.max():+.2f}′")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("site")
    ap.add_argument("--source", default="lidar", choices=("lidar", "srtm3"))
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--summits", action="store_true")
    ap.add_argument("--summits-only", action="store_true", help="avec --summits : sans le balayage")
    ap.add_argument("--layers-only", action="store_true", help="les couches seules, sans le balayage")
    ap.add_argument("--layers", action="store_true", help="cuire aussi les couches du rendu d'obs (globespot)")
    ap.add_argument("--vp", help="LAT,LON,EYE : remplace le point de vue (tests)")
    ap.add_argument("--margin", type=float, help="DH_MARGIN en m (test de convergence)")
    a = ap.parse_args()
    global DH_MARGIN
    if a.margin:
        DH_MARGIN = a.margin
    for site in (SITES if a.site == "all" else [a.site]):
        S = SITES[site]
        if a.vp:
            S["lat"], S["lon"], S["eye"] = map(float, a.vp.split(","))
        source = S.get("dem", "lidar") if a.source == "lidar" else a.source   # l'Autriche : BEV
        global COP_FALLBACK, VP; COP_FALLBACK = bool(S.get("cop")); VP = (S["lat"], S["lon"])   # hors de France : Copernicus
        print(f"== {site}  ({S['lat']}, {S['lon']}, {S['eye']} m)  source {source}")
        if a.summits:
            for name, pub, at, mx, moved, c in summits(site, source):
                print(f"  {name:26s} publié {pub:6.0f}  LiDAR au point {at:7.1f}  max ±40 m {mx:7.1f}"
                      f" (à {moved} m)  source {'LiDAR' if c == 1 else 'RGE ALTI' if c == 2 else 'BEV ALS' if c == 4 else '?'}")
            if a.summits_only:
                continue
        if a.layers_only:
            L = layers(site, source)
            p = os.path.join(ROOT, "src", "data", "dem", f"{S.get('file', site)}-layers.json")
            with open(p, "w") as f:
                json.dump(L, f, separators=(",", ":"))
            print(f"écrit {os.path.relpath(p, ROOT)} ({os.path.getsize(p) // 1024} ko)")
            continue
        t = time.time()
        az, res, dist, hwin, src, gain = sweep_chunked(site, source)
        print(f"  balayage {time.time() - t:.0f} s")
        compare(site, res)
        for m in ("flat", "globe", "globeK"):
            u, c = np.unique(src[m], return_counts=True)
            lab = {0: "mer/vide", 1: "LiDAR", 2: "RGE ALTI", 3: "SRTM", 4: "BEV ALS", 5: "Copernicus"}
            print(f"  {m:7s} points de silhouette : " + ", ".join(f"{lab[x]} {n}" for x, n in zip(u, c)))
        if len(gain):
            print(f"  gain fin - grossier au point gagnant : max {gain.max():+.1f} m, min {gain.min():+.1f} m")
            # PAS un critère de refus : sur une falaise, un pixel de 30 m mêle le
            # pied et le haut de la paroi et l'écart au même point dépasse la
            # marge sans qu'aucun pic ait été manqué (Cheiron : 64 m). Le vrai
            # test est la CONVERGENCE : relancer avec --margin 120 et comparer.
            # 2026-09-24, Viériou : 40 m et 120 m donnent le même profil à
            # 0,016′ près (un seul échantillon).
        if a.layers:
            L = layers(site, source)
            p = os.path.join(ROOT, "src", "data", "dem", f"{S.get('file', site)}-layers.json")
            with open(p, "w") as f:
                json.dump(L, f, separators=(",", ":"))
            print(f"écrit {os.path.relpath(p, ROOT)} ({os.path.getsize(p) // 1024} ko)")
            if not a.write:
                continue
        if a.write:
            if source not in ("lidar", "bev", "lidarcop"):
                sys.exit("REFUS : --write n'écrit que le balayage LiDAR")
            detail = None
            if "detail" in S:
                D = {**S, **S["detail"]}
                t = time.time()
                _, dres, _, _, _, _ = sweep(site, source, D)
                print(f"  bande détaillée {D['az0']}° + {D['n']} × {D['step']}° : {time.time() - t:.0f} s")
                # cohérence : aux azimuts communs, le détail doit retomber sur le profil à 0,1°
                j = np.round((D["az0"] + D["step"] * np.arange(D["n"]) - S["az0"]) / S["step"], 6)
                on = (j == np.round(j)) & (j >= 0) & (j < S["n"])
                for m in ("flat", "globe", "globeK"):
                    dd = dres[m][on] - res[m][j[on].astype(int)]
                    print(f"  {m:7s} détail - profil aux azimuts communs : max |écart| {np.abs(dd).max():.3f}′")
                detail = {**S["detail"], "res": dres}
            write(site, az, res, dist, detail)


if __name__ == "__main__":
    main()
