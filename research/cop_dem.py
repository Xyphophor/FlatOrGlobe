#!/usr/bin/env python3
"""Terrain Copernicus GLO-30 pour research/lidar_horizon.py : le relief HORS de
France (Italie, 2026-09-27 : le Monte Ceppo vu de Caussols), là où le LiDAR
HD et le RGE ALTI de l'IGN répondent « pas de donnée ».

Copernicus DEM GLO-30 (ESA / Airbus, licence Copernicus, libre) : dalles
d'1° × 1° en EPSG:4326, 3 600 × 3 600 points à 1″ sous 50° de latitude,
GeoTIFF COG, DEFLATE + prédicteur flottant (3), blocs de 1 024 × 1 024.
C'est un modèle de SURFACE (forêt et bâti compris), à ~30 m : moins fin que
le LiDAR, suffisant pour des reliefs lointains ; le rapport de lidar_horizon
compte les points de silhouette qui en viennent (code 5).

Une dalle (12 Mo) est téléchargée entière une fois et gardée dans
data/dem/cache/cop/ ; décodée, elle est gardée en mémoire (50 Mo, 3 au plus).

  python3 research/cop_dem.py --selftest
"""
import math, os, struct, sys, threading, zlib, urllib.request
from collections import OrderedDict
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bev_dem                      # le prédicteur flottant en C (bev_lzw.c)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "dem", "cache", "cop")
BASE = "https://copernicus-dem-30m.s3.amazonaws.com"
_mem = OrderedDict(); _lock = threading.Lock()


def _name(lat0, lon0):
    ns = f"N{lat0:02d}" if lat0 >= 0 else f"S{-lat0:02d}"
    ew = f"E{lon0:03d}" if lon0 >= 0 else f"W{-lon0:03d}"
    return f"Copernicus_DSM_COG_10_{ns}_00_{ew}_00_DEM"


def _fetch(lat0, lon0):
    """Chemin local de la dalle, ou None (pas de dalle : pleine mer)."""
    n = _name(lat0, lon0); f = os.path.join(CACHE, n + ".tif")
    if os.path.exists(f): return f
    if os.path.exists(f + ".none"): return None
    os.makedirs(CACHE, exist_ok=True)
    try:
        with urllib.request.urlopen(f"{BASE}/{n}/{n}.tif", timeout=180) as r: raw = r.read()
    except urllib.error.HTTPError as e:
        if e.code in (403, 404): open(f + ".none", "w").close(); return None   # dalle absente : la mer
        raise
    tmp = f + f".{threading.get_ident()}.tmp"; open(tmp, "wb").write(raw); os.replace(tmp, f)
    return f


def _decode(path):
    b = open(path, "rb").read()
    assert b[:4] == b"II*\x00", "TIFF classique petit-boutiste attendu"
    off = struct.unpack("<I", b[4:8])[0]; n = struct.unpack("<H", b[off:off + 2])[0]; t = {}
    for i in range(n):
        e = b[off + 2 + i * 12: off + 14 + i * 12]; tag, typ, cnt = struct.unpack("<HHI", e[:8]); t[tag] = (typ, cnt, e[8:12])
    def arr(tag):
        typ, cnt, raw = t[tag]; f = {3: "H", 4: "I", 16: "Q"}[typ]; sz = {3: 2, 4: 4, 16: 8}[typ]
        if cnt * sz <= 4: return list(struct.unpack("<" + f * cnt, raw[:cnt * sz]))
        vo = struct.unpack("<I", raw)[0]; return list(struct.unpack("<" + f * cnt, b[vo:vo + cnt * sz]))
    W, H, tw, th = arr(256)[0], arr(257)[0], arr(322)[0], arr(323)[0]
    comp, pred = arr(259)[0], (arr(317)[0] if 317 in t else 1)
    assert comp == 8 and tw == th and pred in (1, 3), f"format non géré ({comp}, {pred})"
    offs, cnts = arr(324), arr(325); nx = -(-W // tw)
    out = np.full((-(-H // th) * th, nx * tw), np.nan, np.float32)
    for i, (o, c) in enumerate(zip(offs, cnts)):
        if not c: continue
        buf = bytearray(zlib.decompress(b[o:o + c]))
        if pred == 3:                                  # le décodeur C a une table statique : un fil à la fois
            cb = bev_dem.ctypes.create_string_buffer(bytes(buf))
            with bev_dem._lzw_lock: bev_dem._lzw().fp_predictor(cb, tw, th)
            buf = cb.raw[:tw * th * 4]
        bi, bj = divmod(i, nx)
        out[bi * th:(bi + 1) * th, bj * tw:(bj + 1) * tw] = np.frombuffer(bytes(buf), "<f4").reshape(th, tw)
    return out[:H, :W]


def _tile(lat0, lon0):
    k = (lat0, lon0)
    with _lock:
        if k in _mem: _mem.move_to_end(k); return _mem[k]
    p = _fetch(lat0, lon0)
    v = None if p is None else _decode(p)
    with _lock:
        _mem[k] = v
        while len(_mem) > 3: _mem.popitem(last=False)
    return v


def grid(lat, lon):
    """Altitude bilinéaire (m) aux points WGS84 ; 0 en pleine mer (pas de dalle)."""
    lat = np.asarray(lat, float).ravel(); lon = np.asarray(lon, float).ravel()
    out = np.full(lat.shape, np.nan)
    la0 = np.floor(lat).astype(int); lo0 = np.floor(lon).astype(int)
    for a, b in sorted({(int(x), int(y)) for x, y in zip(la0, lo0)}):
        m = (la0 == a) & (lo0 == b); v = _tile(a, b)
        if v is None: out[m] = 0.0; continue
        H, W = v.shape
        # 1″ ; ligne 0 = bord nord (a + 1), colonne 0 = bord ouest ; centres de pixels
        r = (a + 1 - lat[m]) * H - 0.5; c = (lon[m] - b) * W - 0.5
        r0 = np.clip(np.floor(r).astype(int), 0, H - 2); c0 = np.clip(np.floor(c).astype(int), 0, W - 2)
        fr, fc = np.clip(r - r0, 0, 1), np.clip(c - c0, 0, 1)
        out[m] = (v[r0, c0] * (1 - fr) * (1 - fc) + v[r0 + 1, c0] * fr * (1 - fc)
                  + v[r0, c0 + 1] * (1 - fr) * fc + v[r0 + 1, c0 + 1] * fr * fc)
    return out


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        for name, la, lo in [("Monte Ceppo (1 627 m publiés)", 43.9230, 7.7450), ("mer au large de Nice", 43.60, 7.30)]:
            print(name, ":", round(float(grid([la], [lo])[0]), 1), "m")
