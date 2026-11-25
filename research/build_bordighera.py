#!/usr/bin/env python3
"""Bordighera seen from a balcony near Antibes, 49 km across the sea (hh tab, 2026-10-06).

The owner's photo (Nikon P900, 3rd-floor balcony near Antibes, aimed at
43°47'01.44"N 7°40'01.18"E): the bottom of the town above Via Romana is missing. This script
gathers what the hh animation needs to draw that view, plane -> globe -> globe with refraction:

  - the eye: ground from IGN LiDAR HD (MNT, via research/lidar_horizon.py) + the 3rd floor
    (EYE_ABOVE_GROUND, an assumption until the owner measures it);
  - the buildings: OpenStreetMap footprints (API 0.6 map call, ODbL) in a box around Villa
    Regina Margherita (Via Romana 34/36) and Servizi Medici Hesperia (Via Romana 40). Height
    = building:levels x LEVEL_M when OSM has it, else Copernicus DSM - ground at the centroid
    (clamped), else DEFAULT_LEVELS; the source is kept per building;
  - roofs and the ground under each building, where possible: the 1 m LiDAR of Liguria (Ministero
    dell'Ambiente, Piano Straordinario di Telerilevamento, flights 2008-2010), DSM first return and
    DTM, read one pixel at a time through WMS GetFeatureInfo (the only way that service gives values;
    every answer is cached in raw/pcn-cache.json). Roof = 75th percentile of the DSM inside the
    outline, ground = DTM at each corner. Height source "lidar"; OSM levels are then only a check;
  - the hills behind: TINITALY 1.1 (INGV, 10 m, a terrain model
    WITHOUT buildings, CC BY 4.0) through its WCS, as a fan of rings seen from the eye:
    every AZ_STEP over +-AZ_HALF around the aim, every RING_M from the coast out to D_MAX.

Every position is reduced to (azimuth from the eye, great-circle distance on a sphere of
6,371 km, height above the sea): the distance is where the radius enters (evidence class
"check"). The flat model is given the SAME distances (steel-man: no map of the plane is
asked to agree with anything else).

Raw downloads in data/hh/bordighera/raw/ (not in git). Writes src/data/presets/hh-bordighera.js.

  python3 research/build_bordighera.py
"""
import base64, json, math, os, struct, sys, urllib.request
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cop_dem

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "hh", "bordighera", "raw")
OUT = os.path.join(ROOT, "src", "data", "presets", "hh-bordighera.js")
R = 6371e3
UA = "FlatOrGlobe/1.0 (research; static educational site)"

# The balcony is the owner's home: its coordinates live in a local file kept out of git
# (data/hh/bordighera/raw/eye.json: {"lat": .., "lon": ..}), and the page only says "near Antibes".
# Caveat: the baked (azimuth, distance) pairs still pin the eye down by trilateration.
_EYE = json.load(open(os.path.join(RAW, "eye.json")))
EYE_LAT, EYE_LON = _EYE["lat"], _EYE["lon"]
AIM_LAT, AIM_LON = 43 + 47 / 60 + 1.44 / 3600, 7 + 40 / 60 + 1.18 / 3600
EYE_ABOVE_GROUND = 10.5      # m : 3rd floor (3 x 3 m) + 1.5 m of eye; to be measured by the owner
EYE_GPS = 41.6               # m a.s.l. : the owner's GPS reading on the balcony (2026-10-14); replaces ground + EYE_ABOVE_GROUND
LEVEL_M = 3.2                # m per OSM level (residential, roof included on average)
DEFAULT_LEVELS = 3
OSM_BBOX = (7.6600, 43.7790, 7.6740, 43.7870)      # W S E N
TIN_BBOX = (43.765, 7.640, 43.845, 7.800)           # S W N E
AZ_HALF, AZ_STEP = 0.75, 0.0125                      # degrees
RING_M, D_MAX = 40.0, 62000.0
RING_FAR, D_FAR = 150.0, 95000.0               # m: far rings, Copernicus
LIDAR_BELOW, LIDAR_AZ = 130.0, 0.45            # m, deg: buildings read on the Liguria LiDAR
# the two places the owner named, drawn highlighted. Nominatim gives a point for each; the OSM ways
# are picked by hand: the villa and its neighbour tagged Via Romana 36; for Hesperia (a clinic node at
# Via Romana 40) the nearest building, 36 m away, named "Hotel Esperia" in OSM.
NAMED = {
    "vrm": dict(name="Villa Regina Margherita", addr="Via Romana 34/36", lat=43.7824587, lon=7.6683549, ids=[202197742, 202199165]),
    "hesperia": dict(name="Servizi Medici Hesperia", addr="Via Romana 40", lat=43.7832330, lon=7.6660953, ids=[202199366]),
}


def get(url, path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=180) as r, open(path + ".part", "wb") as f:
            f.write(r.read())
        os.replace(path + ".part", path)
    return path


def inv(lat, lon):
    """Azimuth (deg) and great-circle distance (m) from the eye, on the sphere R."""
    p1, l1 = math.radians(EYE_LAT), math.radians(EYE_LON)
    p2, l2 = np.radians(lat), np.radians(lon)
    dl = l2 - l1
    a = np.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    d = 2 * R * np.arcsin(np.sqrt(a))
    az = np.degrees(np.arctan2(np.sin(dl) * np.cos(p2), math.cos(p1) * np.sin(p2) - math.sin(p1) * np.cos(p2) * np.cos(dl)))
    return az % 360, d


def dest(az, d):
    p1, l1, a, dd = math.radians(EYE_LAT), math.radians(EYE_LON), np.radians(az), d / R
    p2 = np.arcsin(math.sin(p1) * np.cos(dd) + math.cos(p1) * np.sin(dd) * np.cos(a))
    l2 = l1 + np.arctan2(np.sin(a) * np.sin(dd) * math.cos(p1), np.cos(dd) - math.sin(p1) * np.sin(p2))
    return np.degrees(p2), np.degrees(l2)


# ------------------------------------------------------------------ TINITALY (WCS, plain TIFF)
class Tin:
    def __init__(self):
        s, w, n, e = TIN_BBOX
        url = ("https://tinitaly.pi.ingv.it/TINItaly_1_1/wcs?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage"
               "&COVERAGEID=TINItaly_1_1__tinitaly_dem"
               "&SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326&OUTPUTCRS=http://www.opengis.net/def/crs/EPSG/0/4326"
               f"&subset=Lat({s},{n})&subset=Long({w},{e})&FORMAT=image/tiff")
        b = open(get(url, os.path.join(RAW, f"tinitaly_{s}_{w}_{n}_{e}.tif")), "rb").read()
        bo = {b"MM": ">", b"II": "<"}[b[:2]]
        o = struct.unpack(bo + "I", b[4:8])[0]; n_ = struct.unpack(bo + "H", b[o:o + 2])[0]
        tags = {}
        for i in range(n_):
            e_ = b[o + 2 + 12 * i:o + 14 + 12 * i]
            t, ty, c = struct.unpack(bo + "HHI", e_[:8])
            v = struct.unpack(bo + "H", e_[8:10])[0] if ty == 3 and c == 1 else struct.unpack(bo + "I", e_[8:12])[0]
            tags[t] = (ty, c, v)
        W, H = tags[256][2], tags[257][2]
        assert tags[259][2] == 1 and tags[258][2] == 32 and tags[339][2] == 3, "TINITALY: expected uncompressed float32"
        M = struct.unpack(bo + "16d", b[tags[34264][2]:tags[34264][2] + 128])
        self.dx, self.x0, self.dy, self.y0 = M[0], M[3], M[5], M[7]
        if 322 in tags:      # tiled
            TW, TH = tags[322][2], tags[323][2]
            nx, ny = -(-W // TW), -(-H // TH)
            offs = struct.unpack(bo + f"{nx * ny}I", b[tags[324][2]:tags[324][2] + 4 * nx * ny]) if nx * ny > 1 else (tags[324][2],)
            a = np.zeros((ny * TH, nx * TW), np.float32)
            for k, off in enumerate(offs):
                ty_, tx_ = divmod(k, nx)
                a[ty_ * TH:(ty_ + 1) * TH, tx_ * TW:(tx_ + 1) * TW] = np.frombuffer(b[off:off + 4 * TW * TH], bo + "f4").reshape(TH, TW)
        else:                # strips
            rps = tags[278][2]; ns = -(-H // rps)
            offs = struct.unpack(bo + f"{ns}I", b[tags[273][2]:tags[273][2] + 4 * ns]) if ns > 1 else (tags[273][2],)
            a = np.concatenate([np.frombuffer(b[off:off + 4 * W * min(rps, H - i * rps)], bo + "f4").reshape(-1, W) for i, off in enumerate(offs)])
        a = a[:H, :W].astype(np.float64)
        a[a < -100] = 0.0                     # nodata = sea
        self.a = np.maximum(a, 0.0)
        print(f"TINITALY {W} x {H}, max {self.a.max():.0f} m", file=sys.stderr)

    def __call__(self, lat, lon):
        lat = np.asarray(lat, float); lon = np.asarray(lon, float)
        c = (lon - self.x0) / self.dx - 0.5; r = (lat - self.y0) / self.dy - 0.5
        H, W = self.a.shape
        r0 = np.clip(np.floor(r).astype(int), 0, H - 2); c0 = np.clip(np.floor(c).astype(int), 0, W - 2)
        fr, fc = np.clip(r - r0, 0, 1), np.clip(c - c0, 0, 1)
        a = self.a
        return (a[r0, c0] * (1 - fr) * (1 - fc) + a[r0 + 1, c0] * fr * (1 - fc)
                + a[r0, c0 + 1] * (1 - fr) * fc + a[r0 + 1, c0 + 1] * fr * fc)


PCN = "http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/servizi-LiDAR/LIDAR_LIGURIA.map"
PCN_CACHE = os.path.join(RAW, "pcn-cache.json")
_pcn = json.load(open(PCN_CACHE)) if os.path.exists(PCN_CACHE) else {}


def pcn(layer, pts, workers=6):
    """LiDAR Liguria values (m) at [(lat, lon)], one GetFeatureInfo per pixel, cached; None = no data."""
    import re, time
    from concurrent.futures import ThreadPoolExecutor
    L = f"EL.LIDAR.LIGURIA.1x1.{layer}"
    key = lambda la, lo: f"{layer}|{la:.6f}|{lo:.6f}"

    def one(p):
        la, lo = p
        u = (f"{PCN}&service=WMS&version=1.3.0&request=GetFeatureInfo&layers={L}&query_layers={L}&CRS=EPSG:4326"
             f"&BBOX={la - 0.0005},{lo - 0.0005},{la + 0.0005},{lo + 0.0005}&WIDTH=101&HEIGHT=101&I=50&J=50"
             "&INFO_FORMAT=text/plain&styles=")
        for a in range(4):
            try:
                t = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=40).read().decode().strip()
                m = re.search(r"Pixel Value;\s*-?\d+;(-?\d+\.\d+);?\s*$", t)
                return float(m.group(1)) if m else None
            except Exception:
                time.sleep(1 + a)
        raise IOError("PCN LiDAR: no answer")
    todo = sorted({key(*p) for p in pts} - set(_pcn))
    if todo:
        print(f"  PCN {layer}: {len(todo)} pixels to read", file=sys.stderr)
        pp = [tuple(map(float, k.split("|")[1:])) for k in todo]
        with ThreadPoolExecutor(workers) as ex:
            for k, v in zip(todo, ex.map(one, pp)):
                _pcn[k] = v
        json.dump(_pcn, open(PCN_CACHE, "w"))
    return [_pcn[key(*p)] for p in pts]


def lidar_samples(la, lo):
    """Up to 12 points inside the outline (3 m grid, else the centroid and corners pulled halfway in)."""
    cl, co = la.mean(), lo.mean(); k = math.cos(math.radians(cl))
    st = 3 / 111195; pts = []
    P = list(zip(la, lo))
    for y in np.arange(la.min() + st / 2, la.max(), st):
        for x in np.arange(lo.min() + st / k / 2, lo.max(), st / k):
            if inside(y, x, P): pts.append((float(y), float(x)))
    if len(pts) > 12:
        pts = [pts[i] for i in np.linspace(0, len(pts) - 1, 12).round().astype(int)]
    if len(pts) < 3:
        pts += [(float(cl), float(co))] + [(float((a + cl) / 2), float((b + co) / 2)) for a, b in P[:6]]
    return pts


def inside(y, x, P):
    c = False
    for i in range(len(P)):
        (y1, x1), (y2, x2) = P[i], P[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def eye_ground():
    import lidar_horizon as L
    h, code = L.sample(np.array([EYE_LAT]), np.array([EYE_LON]), "fine", "lidar")
    assert code[0] == 1, "the eye is expected on LiDAR HD"
    return float(h[0])


def buildings(tin):
    W, S, E, N = OSM_BBOX
    p = get(f"https://api.openstreetmap.org/api/0.6/map.json?bbox={W},{S},{E},{N}", os.path.join(RAW, "osm-map.json"))
    el = json.load(open(p))["elements"]
    nodes = {e["id"]: (e["lat"], e["lon"]) for e in el if e["type"] == "node"}
    out = []
    for e in el:
        t = e.get("tags", {})
        if e["type"] != "way" or "building" not in t or t.get("building") in ("roof", "ruins", "construction"):
            continue
        pts = [nodes[n] for n in e["nodes"] if n in nodes]
        if len(pts) < 4 or pts[0] != pts[-1]:
            continue
        pts = pts[:-1]
        la = np.array([q[0] for q in pts]); lo = np.array([q[1] for q in pts])
        if la.mean() < S or la.mean() > N or lo.mean() < W or lo.mean() > E:
            continue
        g = tin(la, lo)
        cl, co = la.mean(), lo.mean()
        lev = None
        try:
            lev = float(str(t.get("building:levels", "")).replace(",", "."))
        except ValueError:
            pass
        if t.get("height"):
            try:
                hgt, src = float(str(t["height"]).split()[0].replace(",", ".")), "osm-height"
            except ValueError:
                hgt, src = None, None
        else:
            hgt, src = None, None
        if hgt is None and lev:
            hgt, src = lev * LEVEL_M, "osm-levels"
        if hgt is None:
            dsm = float(cop_dem.grid([cl], [co])[0]); g0 = float(tin([cl], [co])[0])
            if 3 <= dsm - g0 <= 40:
                hgt, src = dsm - g0, "dsm"
            else:
                hgt, src = DEFAULT_LEVELS * LEVEL_M, "default"
        az, d = inv(la, lo)
        tag = next((k for k, v in NAMED.items() if e["id"] in v["ids"]), None)
        out.append(dict(id=e["id"], name=t.get("name"), tag=tag, h=round(hgt, 1), src=src, est=round(hgt, 1), estSrc=src,
                        roof=round(float(g.mean()) + hgt, 1), _la=la, _lo=lo,
                        v=[[float(a), round(float(x)), round(float(gg), 1)] for a, x, gg in zip(az, d, g)]))
    return out


def with_lidar(B, az0):
    """LiDAR roofs and corners for the buildings of the lower town in the field (where the horizon can cut):
    TINITALY ground under LIDAR_BELOW m and within the view. One batch of requests for all of them."""
    sel = [b for b in B if min(v[2] for v in b["v"]) < LIDAR_BELOW and max(abs(v[0] - az0) for v in b["v"]) <= LIDAR_AZ]
    S = [lidar_samples(b["_la"], b["_lo"]) for b in sel]
    C = [[(float(a), float(o)) for a, o in zip(b["_la"], b["_lo"])] for b in sel]
    ds = pcn("DSM_FIRST", [p for s in S for p in s], workers=8)
    dt = pcn("DTM", [p for c in C for p in c], workers=8)
    i = j = 0
    for b, s_, c_ in zip(sel, S, C):
        dsm = [v for v in ds[i:i + len(s_)] if v is not None]; dtm = dt[j:j + len(c_)]
        i += len(s_); j += len(c_)
        if not dsm or any(v is None for v in dtm):
            continue
        roof = float(np.percentile(dsm, 75)); g = np.array(dtm, float)
        if roof - g.mean() < 2.5:
            continue                                   # no roof seen (vanished building, or a canopy-free yard)
        b["roof"], b["h"], b["src"] = round(roof, 1), round(roof - float(g.mean()), 1), "lidar"
        for v, gg in zip(b["v"], g):
            v[2] = round(float(gg), 1)
    return len(sel)


def fan(tin, az0):
    """Ground in rings: az0 + AZ_HALF..., from the first land to D_MAX every RING_M (TINITALY), then to
    D_FAR every RING_FAR (Copernicus GLO-30: the ridges at ~70 km that make the skyline of the photo)."""
    azs = az0 + np.arange(-AZ_HALF, AZ_HALF + 1e-9, AZ_STEP)
    ds = np.arange(40000.0, D_MAX + 1, RING_M)
    A, Dd = np.meshgrid(azs, ds)
    la, lo = dest(A.ravel(), Dd.ravel())
    g = tin(la, lo).reshape(Dd.shape)
    land = np.where(g.max(axis=1) > 0.5)[0]
    i0 = max(land[0] - 1, 0)
    g, ds = g[i0:], ds[i0:]
    df = np.arange(ds[-1] + RING_FAR, D_FAR + 1, RING_FAR)
    A2, D2 = np.meshgrid(azs, df)
    la2, lo2 = dest(A2.ravel(), D2.ravel())
    g2 = np.maximum(cop_dem.grid(la2, lo2), 0).reshape(D2.shape)
    q = np.clip(np.rint(np.vstack([g, g2]) * 4), 0, 65535).astype("<u2")         # quarter metres
    return dict(az0=round(float(azs[0] - az0), 4), azStep=AZ_STEP, nAz=len(azs), d0=float(ds[0]),
                dStep=RING_M, n1=len(ds), dStep2=RING_FAR, nD=len(ds) + len(df), q=4, b64=base64.b64encode(q.tobytes()).decode())


def main():
    tin = Tin()
    eg = eye_ground()
    az0, d_aim = inv(np.array([AIM_LAT]), np.array([AIM_LON]))
    az0, d_aim = float(az0[0]), float(d_aim[0])
    B = buildings(tin)
    n_lid = with_lidar(B, az0)
    chk = {}
    for b in B:
        if b["src"] == "lidar":
            chk.setdefault(b["estSrc"], []).append(b["est"] - b["h"])
        del b["_la"], b["_lo"], b["est"], b["estSrc"]
    check = {k: dict(n=len(v), median=round(float(np.median(v)), 1), p16=round(float(np.percentile(v, 16)), 1),
                     p84=round(float(np.percentile(v, 84)), 1)) for k, v in chk.items()}
    print(f"LiDAR asked for {n_lid} buildings; estimate - LiDAR height (m): {check}", file=sys.stderr)
    for b in B:
        for v in b["v"]:
            v[0] = round((v[0] - az0) * 1e6)     # azimuth relative to the aim, micro-degrees (1 µ° = 0.9 mm at 49 km)
    B = [b for b in B if max(abs(v[0]) for v in b["v"]) <= AZ_HALF * 1e6]
    F = fan(tin, az0)
    named = {k: dict(name=v["name"], addr=v["addr"], ids=v["ids"],
                     ground=round(float(tin([v["lat"]], [v["lon"]])[0]), 1),
                     d=round(float(inv(np.array([v["lat"]]), np.array([v["lon"]]))[1][0]))) for k, v in NAMED.items()}
    for k, n in named.items():      # ground and roof of the named buildings themselves (LiDAR when read)
        bb = [b for b in B if b["id"] in n["ids"]]
        n["ground"] = round(min(v[2] for b in bb for v in b["v"]), 1)
        n["roof"] = max(b["roof"] for b in bb)
        n["d"] = round(float(np.mean([v[1] for b in bb for v in b["v"]])))
        n["src"] = sorted({b["src"] for b in bb})
    srcs = {}
    for b in B:
        srcs[b["src"]] = srcs.get(b["src"], 0) + 1
    site = dict(aimLat=AIM_LAT, aimLon=AIM_LON, az=round(az0, 4), dAim=round(d_aim),
                eyeGround=round(eg, 2), eyeAbove=round(EYE_GPS - eg, 1) if EYE_GPS else EYE_ABOVE_GROUND,
                eye=EYE_GPS if EYE_GPS else round(eg + EYE_ABOVE_GROUND, 1), eyeSrc="gps" if EYE_GPS else "floors",
                levelM=LEVEL_M, heightSources=srcs, estimateMinusLidar=check, named=named)
    with open(OUT, "w") as f:
        f.write("// GENERATED by research/build_bordighera.py -- do not edit by hand.\n")
        f.write("// Bordighera from a balcony near Antibes (hh tab). Eye ground: IGN LiDAR HD (MNT). Buildings:\n")
        f.write("// OpenStreetMap (ODbL), height from building:levels x levelM, else Copernicus DSM - ground, else 3 levels.\n")
        f.write("// Ground under them and hills: TINITALY 1.1 (INGV, CC BY 4.0). Positions: [azimuth from the eye minus\n")
        f.write("// BORD_SITE.az (micro-degrees), great-circle distance on a 6,371 km sphere (m), ground (m)].\n")
        f.write(f"export const BORD_SITE = {json.dumps(site, separators=(',', ':'))};\n")
        f.write("// [{id, name, tag, h (m), src, roof (m a.s.l.), v: [[daz, d, ground]...]}]\n")
        f.write("export const BORD_BUILDINGS = [\n" + ",\n".join(json.dumps(b, separators=(",", ":"), ensure_ascii=False) for b in B) + "];\n")
        f.write("// ground fan: nD rings x nAz azimuths (row-major, nearest ring first), uint16 little-endian, value/q = m\n")
        f.write(f"export const BORD_FAN = {json.dumps(F, separators=(',', ':'))};\n")
    print(f"eye {site['eye']} m (ground {eg:.2f}), aim az {az0:.3f} d {d_aim / 1000:.2f} km, {len(B)} buildings {srcs}, "
          f"fan {F['nAz']} x {F['nD']} from {F['d0'] / 1000:.2f} km; named {named}; {os.path.getsize(OUT) // 1024} KB", file=sys.stderr)


if __name__ == "__main__":
    main()
