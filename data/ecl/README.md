# Données de l'onglet éclipses (epic09)

Pages archivées telles que téléchargées le **2026-09-24** (curl), puis
converties par `fog build ecl` (`tools/internal/build/ecl`, epic24 ; jusqu'au 2026-10-14
`scripts/build_ecl_data.py`) en `src/data/presets/ecl.js`.
Aucun chiffre n'est recopié à la main.

Crédit exigé par la source : *Eclipse Predictions by Fred Espenak, NASA's
GSFC* (eclipse.gsfc.nasa.gov). Éphémérides VSOP87/ELP2000-85, ΔT = 71,7 s
pour 2027.

| Fichier (`raw/`) | URL | Contenu |
|---|---|---|
| `SE2027Aug02Tbeselm.html` | https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/SE2027Aug02Tbeselm.html | éléments besséliens polynomiaux (t0 = 10:00 TDT), γ, magnitude, k1/k2, tan f1/f2, maximum (10:06:37,7 UT, 25°30,3′ N 33°11,0′ E, 6 min 22,6 s) et durée maximale (10:00:21 UT, 6 min 23,2 s) |
| `SE2027Aug02Tpath.html` | https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2027Aug02Tpath.html | bande de totalité toutes les 2 min : limites nord/sud, ligne centrale, rapport des diamètres, hauteur et azimut du Soleil, largeur, durée |
| `SE2009Jul22Tpath.html` | https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2009Jul22Tpath.html | idem, 22 juillet 2009 (saros 136, membre précédent) |
| `SE2045Aug12Tpath.html` | https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2045Aug12Tpath.html | idem, 12 août 2045 (membre suivant) |
| `SEsaros136.html` | https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros136.html | catalogue des 71 membres de la série 136 |
| `SEsaros.html` | https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros.html | mois synodique 29,530589 j, anomalistique 27,554550 j, draconitique 27,212221 j ; 223/239/242 mois ; « ~120° vers l'ouest à chaque saros » |

## Contrôles faits le 2026-09-24

- **Éléments besséliens → ligne centrale** (méthode de Meeus, *Elements of
  Solar Eclipses*) : à 08:40, 09:20, 10:00, 10:40 et 11:20 UT, latitude
  reproduite au millième de degré ; longitude aussi une fois appliqué le
  terme 0,00417807·ΔT (la rotation terrestre suit UT, les éléments TDT) --
  sans lui l'écart est de 0,2996°, exactement ce terme.
- **Décalage d'un saros** : la NASA écrit « ~120° vers l'ouest » (8 h de
  rotation, arrondi) ; les longitudes publiées du maximum de la série 136
  donnent ~111° (2009 : 144,1° E → 2027 : 33,2° E → 2045 : 78,5° O). Le
  tiers de jour vaut 7 h 43 min (6585,3223 j), soit ~116°, et la géométrie
  propre de chaque éclipse fait le reste. L'onglet cite les deux.
- EclipseWise (circonstances locales par ville) refuse les requêtes
  automatiques (403) : la validation de l'UC05 utilisera les circonstances
  PUBLIÉES sur la ligne centrale (hauteur, azimut, durée toutes les 2 min),
  qui sont des circonstances locales en ~100 points.
