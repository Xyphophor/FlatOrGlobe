#!/usr/bin/env python3
"""Contrôle de la transcription des tableaux de triangles de Roy (1790), Maclear (1866) et Struve (1857-1860)
(excès sphérique, onglet surv). Exploratoire (research/), à porter dans fog avec le reste. Aucun rayon n'entre ici.

Une page = data/surv/excess/<source>/transcription/pNNN.csv (NNN = page du PDF), une ligne par angle, trois lignes de même
`k` par triangle, colonnes :
  page, printed   page du PDF, page imprimée
  net             titre ou groupe du tableau (« C.I », « Principal triangles »…)
  k               1, 2, 3… dans le fichier ; no : numéro imprimé du triangle (« XII », « Δ7 », « I.3 »)
  station         nom tel qu'imprimé
  deg,min,sec     angle OBSERVÉ tel qu'imprimé (sec avec ses décimales) ; vides si l'angle n'est pas observé
  derived         « * » si l'angle est déduit / conclu / imprimé en pointillés (le triangle ne sert pas à l'excès)
  adj_sec         secondes de l'angle ajusté imprimé (Roy « corrected for calculation », Maclear « reduced angles »,
                  Struve « angles plans ») ; ses degrés et minutes sont ceux de l'observé, à une minute près
  log             logarithme imprimé du côté OPPOSÉ à la station (vide s'il n'est pas imprimé)
  dist            côté opposé imprimé (pieds pour Roy et Maclear, toises pour Struve ; vide s'il n'est pas imprimé)
  sum_deg,sum_min,sum_sec   somme imprimée des angles observés (sur la PREMIÈRE ligne du triangle seulement)
  exc             excès sphérique imprimé du triangle (première ligne seulement ; Maclear : les secondes de « 180° + ε »)
  flag            vide, ou la raison d'un écart vérifié dans l'IMPRIMÉ (jamais une valeur corrigée)

Contrôles (u = une unité du dernier chiffre imprimé) :
  1. Σ observés = somme imprimée ;
  2. Σ ajustés = 180° (angles plans), ou 180° + ε avec --spherical ;
  3. |ajusté − observé| < 10″ (une minute ou un degré mal lu se voit) ;
  4. log10(dist) = log quand les deux sont imprimés ;
  5. loi des sinus sur les angles ajustés : côté / sin(angle) identique (côtés lus en dist, sinon 10^log).

Usage : python3 research/surv_excess_check_generic.py <source> [--spherical] [pages…]   (source : roy, maclear, struve)
"""
import csv, glob, math, os, sys
from collections import defaultdict

COLS = ["page", "printed", "net", "k", "no", "station", "deg", "min", "sec", "derived", "adj_sec", "log", "dist",
        "sum_deg", "sum_min", "sum_sec", "exc", "flag"]


def unit(t):
    t = t.strip().lstrip("+-")
    return 10 ** -len(t.split(".")[1]) if "." in t else 1.0


def num(r, c, where):
    try:
        return float(r[c])
    except ValueError:
        raise SystemExit(f"{where} : {r['station']!r} {c} = {r[c]!r} n'est pas un nombre")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__); sys.exit(2)
    src, spherical = args[0], "--spherical" in sys.argv
    want = {int(p) for p in args[1:]}
    files = sorted(glob.glob(f"data/surv/excess/{src}/transcription/p*.csv"))
    if want:
        files = [x for x in files if int(os.path.basename(x)[1:4]) in want]
    bad = flagged = ntri = nder = 0
    for path in files:
        with open(path, newline="", encoding="utf-8") as fh:
            rd = csv.DictReader(fh)
            if rd.fieldnames != COLS:
                raise SystemExit(f"{path}: colonnes {rd.fieldnames}, attendu {COLS}")
            rows = list(rd)
        tris = defaultdict(list)
        for r in rows:
            tris[r["k"]].append(r)
        for k, t in tris.items():
            where = f"{os.path.basename(path)} triangle {t[0]['no']} ({'/'.join(r['station'] for r in t)})"
            errs = []
            if len(t) != 3:
                errs.append(f"{len(t)} lignes")
            else:
                ntri += 1
                der = any(r["derived"].strip() for r in t)
                nder += der
                obs_ok = all(r["sec"].strip() for r in t)
                obs = [num(r, "deg", where) * 3600 + num(r, "min", where) * 60 + num(r, "sec", where) if r["sec"].strip() else None for r in t]
                us = max(unit(r["sec"]) for r in t if r["sec"].strip()) if any(r["sec"].strip() for r in t) else 0.01
                # 1. somme imprimée
                if obs_ok and t[0]["sum_sec"].strip():
                    s = num(t[0], "sum_deg", where) * 3600 + num(t[0], "sum_min", where) * 60 + num(t[0], "sum_sec", where)
                    d = sum(obs) - s
                    if abs(d) > 1.5 * max(us, unit(t[0]["sum_sec"])) + 1e-9:
                        errs.append(f"Σobs − somme imprimée = {d:+.3f}″")
                # 2-3. angles ajustés (degrés et minutes de l'observé, à une minute près)
                adj = []
                for r, o in zip(t, obs):
                    if not r["adj_sec"].strip() or o is None:
                        adj = None; break
                    a = num(r, "adj_sec", where)
                    base = o - (o % 60)
                    cand = min((base + a + m * 60 for m in (-1, 0, 1)), key=lambda x: abs(x - o))
                    if abs(cand - o) > 10:
                        errs.append(f"{r['station']} : ajusté − observé = {cand - o:+.2f}″")
                    adj.append(cand)
                ua = max(unit(r["adj_sec"]) for r in t if r["adj_sec"].strip()) if any(r["adj_sec"].strip() for r in t) else 0.01
                exc = num(t[0], "exc", where) if t[0]["exc"].strip() else None
                if adj:
                    target = 648000 + (exc if spherical and exc is not None else 0)
                    d = sum(adj) - target
                    if abs(d) > 1.5 * ua + 1e-9:
                        errs.append(f"Σajustés − {'180° − ε' if spherical else '180°'} = {d:+.3f}″")
                # 4. log / dist
                sides = []
                for r in t:
                    di = num(r, "dist", where) if r["dist"].strip() else None
                    lg = num(r, "log", where) if r["log"].strip() else None
                    if di is not None and lg is not None:
                        tl = max(unit(r["log"]) + 0.5 * unit(r["dist"]) / (di * math.log(10)), 3e-8)
                        if abs(math.log10(di) - lg) > tl:
                            errs.append(f"{r['station']} : log10(dist) − log = {math.log10(di) - lg:+.1e}")
                    sides.append((di, unit(r["dist"]) / di if di else None) if di is not None else ((10 ** lg, unit(r["log"]) * math.log(10)) if lg is not None else (None, None)))
                # 5. loi des sinus (angles ajustés plans ; sphériques : − ε/3)
                if adj and all(s[0] for s in sides):
                    ratios, tol = [], []
                    for (L, rel), a in zip(sides, adj):
                        A = math.radians((a - (exc / 3 if spherical and exc else 0)) / 3600)
                        ratios.append(L / math.sin(A))
                        tol.append(0.5 * rel + math.radians(ua / 3600) * abs(math.cos(A) / math.sin(A)) + 2e-7)
                    m = sum(ratios) / 3
                    sp = max(abs(x / m - 1) for x in ratios)
                    if sp > 2 * max(tol):
                        errs.append(f"loi des sinus : écart {sp:.1e}")
            if errs:
                if any(r["flag"].strip() for r in t):
                    flagged += 1
                    print(f"[signalé] {where} : " + " ; ".join(errs))
                else:
                    bad += 1
                    print(f"ÉCART {where} : " + " ; ".join(errs))
    print(f"\n{len(files)} page(s), {ntri} triangle(s) ({nder} à angle déduit) ; {bad} écart(s) non signalé(s), {flagged} signalé(s)")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
