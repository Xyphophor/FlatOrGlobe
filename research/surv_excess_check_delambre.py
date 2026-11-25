#!/usr/bin/env python3
"""Contrôle de la transcription du « Tableau général des triangles » de Delambre et Méchain (Base du système métrique,
tome 1, 1806, pp. 513-542), complété des côtés du « Tableau complet des triangles » (tome 2, 1807, pp. 800-841).
Exploratoire (research/), à porter dans fog avec le reste. Aucun rayon n'entre dans ces contrôles.

Une page du tome 1 = data/surv/excess/delambre/transcription/pNNN.csv (NNN = page du PDF du tome 1), une ligne par
angle, trois lignes de même `k` par triangle, colonnes :
  page      page du PDF (tome 1)
  printed   page imprimée (tome 1)
  k         1, 2, 3… dans le fichier
  no        numéro du triangle imprimé (1 à 115)
  station   nom tel qu'imprimé
  reg       colonne « Pages » (page du registre) ; « * » = angle CONCLU (le triangle ne sert pas à l'excès)
  deg,min,sec     angle observé (sec avec ses décimales, ex. 9.34)
  exc       excès sphérique imprimé sur la ligne, POSITIF (imprimé « −0″34 » : on écrit 0.34)
  sph_deg,sph_min,sph_sec   angle sphérique imprimé
  cord_sec  secondes de l'angle « des cordes » imprimé (les degrés et minutes sont ceux de l'angle sphérique, ou ±1′)
  log       logarithme du côté opposé, en toises (tome 2), vide s'il est imprimé « ..... »
  dist      côté opposé, arc en toises (tome 2, colonne « Côtés oppos. Arcs en toises »), vide si « ..... »
  t2page    page du PDF du tome 2 où sont lus log et dist
  flag      vide, ou la raison d'un écart vérifié dans l'IMPRIMÉ (jamais une valeur corrigée)

Contrôles (tolérances à la précision imprimée, u = une unité du dernier chiffre) :
  1. Σ sphériques − 180° = Σ excès ;
  2. sphérique − observé identique sur les trois lignes (Delambre répartit l'erreur par tiers, t. 2 p. 700) ;
  3. cordes = sphérique − excès (modulo 60″) ;
  4. log10(dist) = log, à 3e-8 près (les log imprimés à 10 décimales viennent de tables plus courtes) ;
  5. loi des sinus sur les angles des cordes : dist / sin(cordes) identique sur les trois lignes (quand les côtés sont là).
Un triangle à angle conclu (« * ») n'est contrôlé que sur 1 et 3.

Usage : python3 research/surv_excess_check_delambre.py [pages…]
"""
import csv, glob, math, os, sys
from collections import defaultdict

BASE = "data/surv/excess/delambre/transcription"
COLS = ["page", "printed", "k", "no", "station", "reg", "deg", "min", "sec", "exc", "sph_deg", "sph_min", "sph_sec",
        "cord_sec", "log", "dist", "t2page", "flag"]


def unit(t):
    t = t.strip().lstrip("+-")
    return 10 ** -len(t.split(".")[1]) if "." in t else 1.0


def f(r, c, path):
    try:
        return float(r[c])
    except ValueError:
        raise SystemExit(f"{path}: triangle {r['no']} {r['station']!r} : {c} = {r[c]!r} n'est pas un nombre")


def main():
    want = {int(p) for p in sys.argv[1:]}
    files = sorted(glob.glob(os.path.join(BASE, "p*.csv")))
    if want:
        files = [x for x in files if int(os.path.basename(x)[1:4]) in want]
    bad = flagged = ntri = nconc = 0
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
            where = f"p{t[0]['page']} triangle {t[0]['no']} ({'/'.join(r['station'] for r in t)})"
            errs = []
            if len(t) != 3:
                errs.append(f"{len(t)} lignes")
            else:
                ntri += 1
                conc = any(r["reg"].strip() == "*" for r in t)
                nconc += conc
                obs = [f(r, "deg", path) * 3600 + f(r, "min", path) * 60 + f(r, "sec", path) for r in t]
                if not all(r[c].strip() for r in t for c in ("exc", "sph_deg", "sph_min", "sph_sec", "cord_sec")):
                    # excès et angles sphériques non imprimés : rien à contrôler sur les angles (le triangle est conclu)
                    if not conc:
                        errs.append("excès ou angles sphériques absents sur un triangle sans angle conclu")
                    if errs:
                        bad += 1; print(f"ÉCART {where} : " + " ; ".join(errs))
                    continue
                sph = [f(r, "sph_deg", path) * 3600 + f(r, "sph_min", path) * 60 + f(r, "sph_sec", path) for r in t]
                exc = [f(r, "exc", path) for r in t]
                us = max(max(unit(r["sec"]), unit(r["sph_sec"])) for r in t)
                ue = max(unit(r["exc"]) for r in t)
                clo = sum(sph) - 648000 - sum(exc)
                if abs(clo) > 1.5 * us + 1.5 * ue + 1e-9:
                    errs.append(f"Σsph − 180° − Σexc = {clo:+.3f}″")
                if not conc:
                    d = [s - o for s, o in zip(sph, obs)]
                    if max(d) - min(d) > 2.5 * us + 1e-9:
                        errs.append(f"sph − obs inégaux : {', '.join(f'{x:+.2f}' for x in d)}″")
                for r, s, e in zip(t, sph, exc):
                    cs = f(r, "cord_sec", path)
                    dd = ((s - e) % 60 - cs + 30) % 60 - 30
                    if abs(dd) > 1.5 * max(unit(r["cord_sec"]), us, ue) + 1e-9:
                        errs.append(f"{r['station']} : cordes ≠ sph − exc ({dd:+.2f}″)")
                have = [r["dist"].strip() and r["log"].strip() for r in t]
                for r in t:
                    if r["dist"].strip() and r["log"].strip():
                        di, lg = f(r, "dist", path), f(r, "log", path)
                        # les logarithmes imprimés à 10 décimales ont été calculés avec des tables plus courtes : 3e-8 de jeu
                        tl = max(unit(r["log"]) + 0.5 * unit(r["dist"]) / (di * math.log(10)), 3e-8)
                        if abs(math.log10(di) - lg) > tl:
                            errs.append(f"{r['station']} : log10(dist) − log = {math.log10(di) - lg:+.1e}")
                if all(have):
                    ratios, tol = [], []
                    for r, s, e in zip(t, sph, exc):
                        a = math.radians((s - e) / 3600)
                        ratios.append(f(r, "dist", path) / math.sin(a))
                        tol.append(0.5 * unit(r["dist"]) / f(r, "dist", path) + math.radians(us / 3600) * abs(math.cos(a) / math.sin(a)) + 1e-7)
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
    print(f"\n{len(files)} page(s), {ntri} triangle(s) ({nconc} à angle conclu) ; {bad} écart(s) non signalé(s), {flagged} signalé(s)")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
