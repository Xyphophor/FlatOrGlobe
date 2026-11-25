#!/usr/bin/env python3
"""Contrôle de la transcription des positions géographiques des stations (pour DESSINER les triangles ; elles n'entrent
jamais dans la mesure de courbure). Exploratoire (research/), à porter dans fog avec le reste.

Une page = data/surv/excess/<pub>/positions/pNNN.csv (NNN = page du PDF), une ligne par station, colonnes :
  page, printed, state, station, alias, lat_d, lat_m, lat_s, lon_d, lon_m, lon_s, flag
  state    l'État en intertitre italique (« Maine », « West Virginia »)
  station  le nom tel qu'imprimé dans ce tableau
  alias    vide, ou le nom de la même station tel qu'il est écrit dans les tableaux de triangles quand l'orthographe diffère
  lat_*, lon_*  degrés, minutes, secondes imprimés (longitude OUEST, positive, comme imprimée)
  flag     vide, ou la raison d'un écart vérifié dans l'IMPRIMÉ

Contrôle : pour chaque côté d'un triangle transcrit (data/surv/excess/<pub>/transcription) dont les deux stations ont une
position, la distance géodésique recalculée sur l'ellipsoïde de Clarke 1866 (sur lequel Schott calcule ses positions ;
formule inverse de Vincenty) doit retrouver le côté imprimé à 2e-5 près (relatif). Une seconde mal lue (≈ 30 m) se voit.
Le script liste aussi les stations des triangles sans position (souvent : une orthographe différente → colonne alias).

Usage : python3 research/surv_positions_check.py data/surv/excess/sp7 [pages…]
"""
import csv, glob, math, os, re, sys
from collections import defaultdict

COLS = ["page", "printed", "state", "station", "alias", "lat_d", "lat_m", "lat_s", "lon_d", "lon_m", "lon_s", "flag"]
A, B = 6378206.4, 6356583.8          # Clarke 1866


def vincenty(lat1, lon1, lat2, lon2):
    f = (A - B) / A
    L = math.radians(lon2 - lon1)
    U1, U2 = math.atan((1 - f) * math.tan(math.radians(lat1))), math.atan((1 - f) * math.tan(math.radians(lat2)))
    sU1, cU1, sU2, cU2 = math.sin(U1), math.cos(U1), math.sin(U2), math.cos(U2)
    lam = L
    for _ in range(200):
        sl, cl = math.sin(lam), math.cos(lam)
        ss = math.hypot(cU2 * sl, cU1 * sU2 - sU1 * cU2 * cl)
        if ss == 0:
            return 0.0
        cs = sU1 * sU2 + cU1 * cU2 * cl
        sig = math.atan2(ss, cs)
        sa = cU1 * cU2 * sl / ss
        c2a = 1 - sa * sa
        c2m = cs - 2 * sU1 * sU2 / c2a if c2a else 0
        C = f / 16 * c2a * (4 + f * (4 - 3 * c2a))
        lp, lam = lam, L + (1 - C) * f * sa * (sig + C * ss * (c2m + C * cs * (-1 + 2 * c2m * c2m)))
        if abs(lam - lp) < 1e-13:
            break
    u2 = c2a * (A * A - B * B) / (B * B)
    k1 = (math.sqrt(1 + u2) - 1) / (math.sqrt(1 + u2) + 1)
    Ak, Bk = (1 + k1 * k1 / 4) / (1 - k1), k1 * (1 - 3 * k1 * k1 / 8)
    ds = Bk * ss * (c2m + Bk / 4 * (cs * (-1 + 2 * c2m * c2m) - Bk / 6 * c2m * (-3 + 4 * ss * ss) * (-3 + 4 * c2m * c2m)))
    return B * Ak * (sig - ds)


def nm(s):
    return re.sub(r"\s+", " ", s.strip().replace("I'd.", "Island")).lower()


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    base, want = sys.argv[1], {int(p) for p in sys.argv[2:]}
    pos, bad = {}, 0
    for f in sorted(glob.glob(os.path.join(base, "positions", "p*.csv"))):
        with open(f, newline="", encoding="utf-8") as fh:
            r = csv.DictReader(fh)
            if r.fieldnames != COLS:
                raise SystemExit(f"{f}: colonnes {r.fieldnames}, attendu {COLS}")
            for row in r:
                try:
                    la = float(row["lat_d"]) + float(row["lat_m"]) / 60 + float(row["lat_s"]) / 3600
                    lo = -(float(row["lon_d"]) + float(row["lon_m"]) / 60 + float(row["lon_s"]) / 3600)
                except ValueError:
                    raise SystemExit(f"{f}: {row['station']!r} : coordonnée non numérique")
                for key in {nm(row["station"]), nm(row["alias"])} - {""}:
                    pos[key] = (la, lo, row)
    tri_st, sides = set(), []
    for f in sorted(glob.glob(os.path.join(base, "transcription", "p*.csv"))):
        t = defaultdict(list)
        for row in csv.DictReader(open(f, newline="", encoding="utf-8")):
            t[row["k"]].append(row)
        for rows in t.values():
            if len(rows) != 3:
                continue
            for i in range(3):
                o = [nm(rows[j]["station"]) for j in range(3) if j != i]
                tri_st.update(o)
                sides.append((o[0], o[1], float(rows[i]["dist"]), rows[i]["page"], rows[i]["flag"]))
    seen, nchk = set(), 0
    for a, b, d, pg, fl in sides:
        if a not in pos or b not in pos or fl.strip():
            continue
        pa, pb = pos[a], pos[b]
        pages = {int(pa[2]["page"]), int(pb[2]["page"])}
        if want and not (pages & want):
            continue
        key = tuple(sorted((a, b)))
        if key in seen:
            continue
        seen.add(key); nchk += 1
        g = vincenty(pa[0], pa[1], pb[0], pb[1])
        rel = g / d - 1
        if abs(rel) > 2e-5:
            flagged = pa[2]["flag"].strip() or pb[2]["flag"].strip()
            if not flagged:
                bad += 1
            print(f"{'[signalé] ' if flagged else 'ÉCART '}{pa[2]['station']} (p{pa[2]['page']}) – {pb[2]['station']} (p{pb[2]['page']}) : "
                  f"Clarke {g:.2f} m, imprimé {d:.2f} m (triangle p{pg}), écart {rel:+.1e}")
    missing = sorted(s for s in tri_st if s not in pos)
    print(f"\n{len({id(v) for v in pos.values()})} positions ; {nchk} côtés vérifiés ; {bad} écart(s) non signalé(s) ; "
          f"{len(missing)} station(s) des triangles sans position" + (f" : {', '.join(missing)}" if missing else ""))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
