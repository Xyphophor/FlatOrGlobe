#!/usr/bin/env python3
"""Fond de carte de la ligne Route 206 MP 27-28 (onglet ref, 2026-10-07).

Télécharge UNE fois les 16 tuiles OpenStreetMap (zoom 15) autour des repères 27 et 28 de
J. Kozlowski dans public/maps/ref-r206/ ; la page les assemble dans un canvas et y place les
repères d'après leurs coordonnées (src/data/presets/surv-recip.js). Aucune requête vers OSM
depuis la page. Données © les contributeurs d'OpenStreetMap (ODbL), crédit imprimé sur la figure.
Politique d'usage des tuiles : https://operations.osmfoundation.org/policies/tiles/
"""
import pathlib, subprocess, time

Z, XS, YS = 15, range(9580, 9584), range(12400, 12404)
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "maps" / "ref-r206"
UA = "FlatOrGlobe/1.0 (static science site; one-off fetch of 16 tiles; contact x.com/Xyphophor)"

OUT.mkdir(parents=True, exist_ok=True)
for x in XS:
    for y in YS:
        f = OUT / f"{Z}_{x}_{y}.png"
        if f.exists():
            continue
        subprocess.run(["curl", "-sSf", "-A", UA, "-o", str(f), f"https://tile.openstreetmap.org/{Z}/{x}/{y}.png"], check=True)
        time.sleep(1)
print("ok", len(list(OUT.glob("*.png"))), "tuiles dans", OUT)
