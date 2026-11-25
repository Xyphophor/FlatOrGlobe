#!/usr/bin/env python3
"""Contrôle de la transcription des tableaux de triangles (excès sphérique, onglet surv).

Exploratoire (research/) : sera porté dans fog quand le jeu de données sera complet.

Une page = un fichier data/surv/excess/<pub>/transcription/pNNN.csv (NNN = page du PDF, pas la page imprimée),
une ligne par angle, trois lignes consécutives de même `k` par triangle, colonnes :

  page   page du PDF (1-based)
  printed  numéro de page imprimé (vide si absent)
  net    titre du tableau (« Fire Island base net », « Main triangulation »...), tel qu'imprimé, en italique sur la page
  k      numéro du triangle dans la page (1, 2, 3…, attribué par le transcripteur)
  no     colonne « No. » telle qu'imprimée sur cette ligne (numéro du triangle ou « -7+8 »), vide si rien
  station  nom de la station tel qu'imprimé
  deg,min,sec   angle observé (sec avec ses décimales imprimées, ex. 02.716)
  corr   correction, signée (ex. -0.290)
  sph    secondes de l'angle sphérique imprimé (ex. 02.426)
  exc    excès sphérique imprimé sur la ligne (ex. 0.218)
  log    log de la distance (ex. 4.1479535)
  dist   distance en mètres (ex. 14058.971)
  flag   vide, ou la raison d'un écart qui est dans l'IMPRIMÉ (ex. « misprint: sph+corr ≠ obs, print checked at 300 dpi »)

Contrôles (tous sur ce qui est imprimé ; aucun rayon n'entre). Les tolérances suivent la précision IMPRIMÉE de chaque
colonne (u = une unité du dernier chiffre imprimé ; les sections de la SP 7 vont de 1 à 3 décimales) :
  1. obs + corr = sph (modulo 60″), à 1,5 u près ;
  2. somme des angles sphériques − 180° = somme de la colonne excès, à 3 u(sph)/2 + 3 u(exc)/2 près ;
  3. log10(dist) = log, à u(log) + 0,5 u(dist)/(dist ln 10) près ;
  4. loi des sinus de Legendre : dist / sin(sph − exc) identique pour les trois lignes, à la somme des arrondis près
     (0,5 u(dist)/dist + u(sph) cot A, deux lignes) ;
Les secondes imprimées à 60 ou plus (convention de l'époque, ex. 60,08″) sont acceptées telles quelles.
  5. un même côté (paire de stations) imprimé deux fois a la même distance, à 0,005 m près (sinon : signalé, pas une erreur).
Le côté d'une ligne est opposé à sa station : il joint les deux autres stations du triangle.

Usage : python3 research/surv_excess_check.py data/surv/excess/sp7 [pages…]
Sortie : une ligne par écart (page, triangle, contrôle, valeurs), puis le bilan. Code de sortie 1 s'il reste un
écart non signalé par `flag`.
"""
import csv, math, sys, glob, os, re
from collections import defaultdict

COLS = ["page", "printed", "net", "k", "no", "station", "deg", "min", "sec", "corr", "sph", "exc", "log", "dist", "flag"]


def rows_of(path):
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        if r.fieldnames != COLS:
            raise SystemExit(f"{path}: colonnes {r.fieldnames}, attendu {COLS}")
        return list(r)


def num(r, c, path):
    try:
        return float(r[c])
    except ValueError:
        raise SystemExit(f"{path}: page {r['page']} triangle {r['k']} station {r['station']!r} : {c} = {r[c]!r} n'est pas un nombre")


def unit(txt):
    """Une unité du dernier chiffre imprimé : '02.716' -> 0.001, '60.4' -> 0.1, '12' -> 1."""
    t = txt.strip().lstrip("+-")
    return 10 ** -len(t.split(".")[1]) if "." in t else 1.0


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    base = sys.argv[1]
    want = {int(p) for p in sys.argv[2:]}
    files = sorted(glob.glob(os.path.join(base, "transcription", "p*.csv")))
    if want:
        files = [f for f in files if int(re.sub(r"\D", "", os.path.basename(f))) in want]
    bad = flagged = ntri = 0
    sides = defaultdict(list)
    for path in files:
        rows = rows_of(path)
        tris = defaultdict(list)
        for r in rows:
            tris[r["k"]].append(r)
        for k, t in tris.items():
            where = f"p{t[0]['page']} tri {k} ({'/'.join(r['station'] for r in t)})"
            fl = any(r["flag"].strip() for r in t)
            errs = []
            if len(t) != 3:
                errs.append(f"{len(t)} lignes au lieu de 3")
            else:
                ntri += 1
                for r in t:
                    d, m, s, c, sp = (num(r, x, path) for x in ("deg", "min", "sec", "corr", "sph"))
                    if not (0 <= m < 60 and 0 <= s < 70 and 0 <= sp < 70 and 0 <= d < 180 and d * 3600 + m * 60 + s > 0):
                        errs.append(f"{r['station']}: angle hors bornes {d} {m} {s}")
                    us = max(unit(r["sec"]), unit(r["corr"]), unit(r["sph"]))
                    dd = (s + c - sp + 30) % 60 - 30
                    if abs(dd) > 1.5 * us + 1e-9:
                        errs.append(f"{r['station']}: obs+corr−sph = {dd:+.4f}″ (obs {s}, corr {c}, sph {sp})")
                    lg, di = num(r, "log", path), num(r, "dist", path)
                    tl = unit(r["log"]) + 0.5 * unit(r["dist"]) / (max(di, 1e-9) * math.log(10)) + 1e-12
                    if di <= 0 or abs(math.log10(di) - lg) > tl:
                        errs.append(f"{r['station']}: log10(dist) − log = {math.log10(max(di, 1e-9)) - lg:+.2e} (dist {di}, log {lg}, tolérance {tl:.1e})")
                sph = [num(r, "deg", path) * 3600 + num(r, "min", path) * 60 + num(r, "sph", path) for r in t]
                exc = [num(r, "exc", path) for r in t]
                clo = sum(sph) - 648000 - sum(exc)
                tc = 1.5 * sum(unit(r["sph"]) for r in t) / 2 + 1.5 * sum(unit(r["exc"]) for r in t) / 2 + 1e-9
                if abs(clo) > tc:
                    errs.append(f"Σsph − 180° − Σexc = {clo:+.4f}″ (Σexc {sum(exc):.3f}, tolérance {tc:.4f}″)")
                ratios, tol = [], []
                for r, a, e in zip(t, sph, exc):
                    A = math.radians((a - e) / 3600)
                    sn = math.sin(A)
                    ratios.append(num(r, "dist", path) / sn if sn else float("nan"))
                    tol.append(0.5 * unit(r["dist"]) / num(r, "dist", path) + math.radians(unit(r["sph"]) / 3600) * abs(math.cos(A) / sn) + 1e-7)
                mr = sum(ratios) / 3
                spread = max(abs(x / mr - 1) for x in ratios)
                ts = 2 * max(tol)
                if not spread <= ts:
                    worst = max(range(3), key=lambda i: abs(ratios[i] / mr - 1))
                    errs.append(f"loi des sinus : écart {spread:.1e} > {ts:.1e} (pire ligne {t[worst]['station']})")
                for i, r in enumerate(t):
                    pair = tuple(sorted(t[j]["station"].strip() for j in range(3) if j != i))
                    sides[pair].append((num(r, "dist", path), where))
            if errs:
                if fl:
                    flagged += 1
                    print(f"[signalé] {where}: " + " ; ".join(errs) + f" — flag: {'; '.join(r['flag'] for r in t if r['flag'].strip())}")
                else:
                    bad += 1
                    print(f"ÉCART {where}: " + " ; ".join(errs))
    nd = 0
    for pair, v in sorted(sides.items()):
        ds = [x for x, _ in v]
        if len(ds) > 1 and max(ds) - min(ds) > 0.005:
            nd += 1
            print(f"côté {pair[0]}–{pair[1]} : {', '.join(f'{x:.3f} ({w})' for x, w in v)}")
    print(f"\n{len(files)} page(s), {ntri} triangle(s) complets ; {bad} triangle(s) avec écart non signalé, {flagged} signalé(s) ; "
          f"{nd} côté(s) imprimés avec des longueurs différentes (réseaux différents ou erreur : à regarder)")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
