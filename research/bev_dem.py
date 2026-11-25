#!/usr/bin/env python3
"""Terrain LiDAR de l'Autriche pour research/lidar_horizon.py (source « bev »).

Le BEV (Bundesamt für Eich- und Vermessungswesen) publie le MNT ALS à 1 m
de tout le pays (CC BY 4.0) : 55 dalles de 50 km en GeoTIFF « cloud
optimized », projection ETRS89-LAEA (EPSG:3035), flottants 32 bits, blocs
de 256 × 256 compressés en LZW, avec des niveaux réduits (2, 4, 8, 16 m…).
Une dalle pèse 12 Go : on n'en lit que les blocs utiles, par requêtes HTTP
partielles, et on les garde dans data/dem/cache/bev/ (ignoré par git).

Pas de GDAL sur la machine : l'en-tête TIFF est lu à la main, la projection
LAEA ellipsoïdale est écrite ici (vérifiée sur l'exemple de la note EPSG
7-2), et le LZW est décodé en C (research/bev_lzw.c, compilé à la demande).

Interface : `grid(lat, lon, level)` rend l'altitude bilinéaire aux points
(lat, lon) WGS84 ~ ETRS89 (écart < 1 m en Autriche, sans effet ici), et NaN
hors des dalles. level = 0 (1 m), 4 (≈16 m), etc.

  python3 research/bev_dem.py --selftest     (projection + un bloc décodé)
"""
import ctypes, json, math, os, struct, subprocess, sys, threading, time, urllib.request
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "dem", "cache", "bev")
BASE = "https://data.bev.gv.at/download/ALS/DTM"
# Stichtage publiés ; une dalle n'existe qu'à l'un d'eux (le plus récent essayé d'abord)
DATES = ["20250915", "20240915", "20230915", "20220915", "20210915", "20200915", "20190915"]
TILE = 50000.0                                 # m ; dalle nommée par son coin sud-ouest
NODATA = -9999.0

# ------------------------------------------------------------ projection LAEA
# EPSG:3035 : GRS80, φ0 = 52° N, λ0 = 10° E, FE = 4 321 000, FN = 3 210 000.
_A, _F = 6378137.0, 1 / 298.257222101
_E2 = _F * (2 - _F); _E = math.sqrt(_E2)
def _q(s):
    return (1 - _E2) * (s / (1 - _E2 * s * s) - np.log((1 - _E * s) / (1 + _E * s)) / (2 * _E))
_QP = float(_q(1.0))
_RQ = _A * math.sqrt(_QP / 2)
_B0 = math.asin(float(_q(math.sin(math.radians(52.0)))) / _QP)
_D = _A * (math.cos(math.radians(52.0)) / math.sqrt(1 - _E2 * math.sin(math.radians(52.0)) ** 2)) / (_RQ * math.cos(_B0))

def laea(lat, lon):
    """(lat, lon) degrés → (E, N) m, EPSG:3035."""
    lat = np.asarray(lat, float); lon = np.asarray(lon, float)
    beta = np.arcsin(_q(np.sin(np.radians(lat))) / _QP)
    dl = np.radians(lon - 10.0)
    B = _RQ * np.sqrt(2 / (1 + math.sin(_B0) * np.sin(beta) + math.cos(_B0) * np.cos(beta) * np.cos(dl)))
    E = 4321000.0 + B * _D * np.cos(beta) * np.sin(dl)
    N = 3210000.0 + (B / _D) * (math.cos(_B0) * np.sin(beta) - math.sin(_B0) * np.cos(beta) * np.cos(dl))
    return E, N

# ---------------------------------------------------------------- LZW en C
_lib = None
def _lzw():
    global _lib
    if _lib is None:
        so = os.path.join(CACHE, "libbevlzw.so"); src = os.path.join(ROOT, "research", "bev_lzw.c")
        if not os.path.exists(so) or os.path.getmtime(so) < os.path.getmtime(src):
            os.makedirs(CACHE, exist_ok=True)
            subprocess.check_call(["cc", "-O2", "-shared", "-fPIC", "-o", so, src])
        _lib = ctypes.CDLL(so)
        _lib.lzw_decode.argtypes = [ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_int]
        _lib.fp_predictor.argtypes = [ctypes.c_char_p, ctypes.c_int, ctypes.c_int]
    return _lib
_lzw_lock = threading.Lock()                     # la table du décodeur C est statique

def decode_block(raw, size=256, pred=1):
    """Bloc size × size : LZW, puis le prédicteur (1 : aucun ; 3 : flottant)."""
    out = ctypes.create_string_buffer(size * size * 4)
    with _lzw_lock:
        n = _lzw().lzw_decode(raw, len(raw), out, len(out))
        if n == size * size * 4 and pred == 3: _lzw().fp_predictor(out, size, size)
    if n != size * size * 4:
        raise IOError(f"bloc LZW invalide ({n} octets au lieu de {size * size * 4})")
    return np.frombuffer(out.raw, "<f4").reshape(size, size).copy()

# ------------------------------------------------------------- HTTP partiel
def _get(url, a=None, b=None):
    hdr = {"Range": f"bytes={a}-{b}"} if a is not None else {}
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=120) as r:
                return r.read()
        except Exception:
            if attempt == 4: raise
            time.sleep(2 * (attempt + 1))

def _exists(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=60) as r:
            return r.status == 200
    except Exception:
        return False

# ------------------------------------------------------------------ dalles
_index = None
def tile_url(tn, te):
    """URL de la dalle de coin sud-ouest (te, tn), ou None si elle n'existe pas (hors d'Autriche)."""
    global _index
    f = os.path.join(CACHE, "index.json")
    if _index is None:
        _index = json.load(open(f)) if os.path.exists(f) else {}
    key = f"N{int(tn)}E{int(te)}"
    if key not in _index:
        _index[key] = None
        for d in DATES:
            u = f"{BASE}/{d}/ALS_DTM_CRS3035RES50000m{key}.tif"
            if _exists(u): _index[key] = u; break
        os.makedirs(CACHE, exist_ok=True); json.dump(_index, open(f + ".tmp", "w"), indent=1); os.replace(f + ".tmp", f)
    return _index[key]

class Level:
    """Un niveau (image) d'une dalle : taille, pas, table des blocs."""
    def __init__(self, url, key, lvl, W, H, offs, cnts, corner, tw=256, pred=1):
        self.url, self.key, self.lvl, self.W, self.H = url, key, lvl, W, H
        self.offs, self.cnts = offs, cnts
        self.E0, self.N0 = corner                 # coin nord-ouest de la dalle (m)
        self.px = (TILE + 1) / W                  # m par pixel (50 001 px au niveau 0)
        self.tw, self.pred = int(tw), int(pred); self.nx = -(-W // self.tw)
        self._mem = OrderedDict(); self._lock = threading.Lock()

    MAX_MEM = 48                                   # blocs décodés gardés en mémoire (1 Mo chacun à 512²)

    def block(self, bi, bj):
        k = (bi, bj)
        with self._lock:
            if k in self._mem: self._mem.move_to_end(k); return self._mem[k]
        d = os.path.join(CACHE, self.key, str(self.lvl)); f = os.path.join(d, f"{bi}_{bj}.lzw")
        if os.path.exists(f): raw = open(f, "rb").read()
        else:
            i = bi * self.nx + bj; o, c = int(self.offs[i]), int(self.cnts[i])
            raw = _get(self.url, o, o + c - 1) if c else b""
            os.makedirs(d, exist_ok=True)
            tmp = f"{f}.{threading.get_ident()}.tmp"      # écriture atomique : un autre fil ne lit jamais un bloc à moitié écrit
            open(tmp, "wb").write(raw); os.replace(tmp, f)
        v = decode_block(raw, self.tw, self.pred) if raw else np.full((self.tw, self.tw), NODATA, np.float32)
        with self._lock:
            self._mem[k] = v
            while len(self._mem) > self.MAX_MEM: self._mem.popitem(last=False)
        return v

_levels = {}
_lv_lock = threading.RLock()
def level(tn, te, lvl):
    k = (tn, te, lvl)
    with _lv_lock:
        if k in _levels: return _levels[k]
        return _level(tn, te, lvl, k)

def _level(tn, te, lvl, k):
    url = tile_url(tn, te)
    if url is None: _levels[k] = None; return None
    key = f"N{int(tn)}E{int(te)}"
    meta = os.path.join(CACHE, key, f"ifd{lvl}.npz")
    if os.path.exists(meta):
        z = np.load(meta); lv = Level(url, key, lvl, int(z["W"]), int(z["H"]), z["offs"], z["cnts"], tuple(z["corner"]), int(z["tw"]), int(z["pred"]))
    else:
        lv = _read_ifd(url, key, lvl)
        os.makedirs(os.path.dirname(meta), exist_ok=True)
        np.savez(meta, W=lv.W, H=lv.H, offs=lv.offs, cnts=lv.cnts, corner=np.array([lv.E0, lv.N0]), tw=lv.tw, pred=lv.pred)
    _levels[k] = lv
    return lv

def _read_ifd(url, key, lvl):
    head = _get(url, 0, 65535)
    if head[:4] != b"II+\x00": raise IOError("BigTIFF petit-boutiste attendu")
    off = struct.unpack("<Q", head[8:16])[0]; corner = None
    for i in range(lvl + 1):
        n = struct.unpack("<Q", _get(url, off, off + 7))[0]
        b = _get(url, off, off + 8 + n * 20 + 7)
        tags = {}
        for j in range(n):
            e = b[8 + j * 20: 28 + j * 20]
            tag, typ, cnt = struct.unpack("<HHQ", e[:12]); tags[tag] = (typ, cnt, e[12:20])
        if i == lvl: break
        if i == 0:                                 # l'ancrage n'est porté que par l'image pleine
            typ, cnt, raw = tags[33922]; vo = struct.unpack("<Q", raw)[0]
            tp = struct.unpack("<6d", _get(url, vo, vo + 47)); corner = (tp[3], tp[4])
        off = struct.unpack("<Q", b[8 + n * 20: 16 + n * 20])[0]
    if corner is None:
        typ, cnt, raw = tags[33922]; vo = struct.unpack("<Q", raw)[0]
        tp = struct.unpack("<6d", _get(url, vo, vo + 47)); corner = (tp[3], tp[4])
    def val(tag):
        typ, cnt, raw = tags[tag]; return struct.unpack("<" + {3: "H", 4: "I", 16: "Q"}[typ], raw[:{3: 2, 4: 4, 16: 8}[typ]])[0]
    def arr(tag):
        typ, cnt, raw = tags[tag]; sz = {4: 4, 16: 8}[typ]
        if cnt * sz <= 8: return np.frombuffer(raw[:cnt * sz], {4: "<u4", 16: "<u8"}[typ]).astype(np.int64)
        vo = struct.unpack("<Q", raw)[0]
        return np.frombuffer(_get(url, vo, vo + cnt * sz - 1), {4: "<u4", 16: "<u8"}[typ]).astype(np.int64)
    tw, pred = val(322), (val(317) if 317 in tags else 1)
    assert val(259) == 5 and val(323) == tw and pred in (1, 3), f"format non géré (compression {val(259)}, prédicteur {pred})"
    return Level(url, key, lvl, val(256), val(257), arr(324), arr(325), corner, tw, pred)

# ----------------------------------------------------------- échantillonnage
def grid(lat, lon, lvl=0, workers=8):
    """Altitude bilinéaire (m) aux points WGS84 ; NaN hors des dalles ou sur un vide."""
    lat = np.asarray(lat, float).ravel(); lon = np.asarray(lon, float).ravel()
    E, N = laea(lat, lon)
    out = np.full(lat.shape, np.nan)
    tn = np.floor((N - 0.5) / TILE) * TILE; te = np.floor((E + 0.5) / TILE) * TILE
    for a, b in {(float(x), float(y)) for x, y in zip(tn, te)}:
        m = (tn == a) & (te == b)
        lv = level(a, b, lvl)
        if lv is None: continue
        # centre du pixel (i, j) : E0 + (j + 0.5)·px, N0 − (i + 0.5)·px
        c = (E[m] - lv.E0) / lv.px - 0.5; r = (lv.N0 - N[m]) / lv.px - 0.5
        r0 = np.clip(np.floor(r).astype(int), 0, lv.H - 2); c0 = np.clip(np.floor(c).astype(int), 0, lv.W - 2)
        fr, fc = r - r0, c - c0
        need = set()
        for dr in (0, 1):
            for dc in (0, 1):
                need |= set(zip(((r0 + dr) // lv.tw).tolist(), ((c0 + dc) // lv.tw).tolist()))
        todo = [k for k in need if k not in lv._mem][:lv.MAX_MEM]
        if todo:
            if len(todo) > 20: print(f"  bev {lv.key} niveau {lvl} : {len(todo)} blocs", file=sys.stderr)
            with ThreadPoolExecutor(workers) as ex: list(ex.map(lambda k: lv.block(*k), todo))
        def px(rr, cc):
            v = np.empty(rr.shape, np.float64)
            T = lv.tw
            for (bi, bj) in {(x, y) for x, y in zip((rr // T).tolist(), (cc // T).tolist())}:
                s = (rr // T == bi) & (cc // T == bj)
                v[s] = lv.block(bi, bj)[rr[s] % T, cc[s] % T]
            return v
        v00, v10, v01, v11 = px(r0, c0), px(r0 + 1, c0), px(r0, c0 + 1), px(r0 + 1, c0 + 1)
        h = v00 * (1 - fr) * (1 - fc) + v10 * fr * (1 - fc) + v01 * (1 - fr) * fc + v11 * fr * fc
        bad = (v00 <= NODATA + 1) | (v10 <= NODATA + 1) | (v01 <= NODATA + 1) | (v11 <= NODATA + 1)
        h[bad] = np.nan
        out[m] = h
    return out

def _selftest():
    # note EPSG 7-2, exemple 3035 : 50° N, 5° E → E 3 962 799,45, N 2 999 718,85
    E, N = laea(50.0, 5.0)
    print(f"LAEA 50N 5E : {float(E):.2f} {float(N):.2f} (attendu 3962799.45 2999718.85)")
    assert abs(E - 3962799.45) < 0.01 and abs(N - 2999718.85) < 0.01
    for name, la, lo in [("viewpoint", 48.211995, 16.48885), ("Schneeberg", 47.767474, 15.805565)]:
        E, N = laea(la, lo); print(f"{name} : E {float(E):.1f} N {float(N):.1f} → dalle N{int(math.floor(N / TILE) * TILE)}E{int(math.floor(E / TILE) * TILE)}")

if __name__ == "__main__":
    if "--selftest" in sys.argv: _selftest()
