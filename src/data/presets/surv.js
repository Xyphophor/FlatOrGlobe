// Données de l'onglet surv (nivellement / géodésie), portées VERBATIM du
// legacy (flat-or-globe-2.20.0.html : SURV_LVL ~L17785, SURV_TRI ~L17817,
// SV_ZEN ~L28599 -- sept lignes NGS de 1977 --, SV_TRI ~L28647 -- 25 lignes
// de la triangulation transcontinentale de 1900 transcrites par Bislin).
// Aucun curseur utilisateur : cas documentés seulement (directive du
// propriétaire). Les légendes (`cap`) sont du texte EN du legacy, non
// traduit ici (comme les notes de presets de sim).
export const SURV_LVL = [
  { name: "NGS practice", d: 0.06, mode: "balanced",
    cap: "<b>Standard geodetic levelling (NGS-style): 60 m balanced sights.</b> At 60 m the curvature correction " +
         "is a mere 0.3 mm per sight — and because back-sight and fore-sight distances are kept equal, it cancels " +
         "exactly between the two staff readings. The procedure is DESIGNED around the curve: short sights, " +
         "balanced setups, thousands of times per line. On a flat earth none of this discipline would buy anything." },
  { name: "Bedford Level", d: 9.7, mode: "wallace",
    cap: "<b>Wallace's three-marker design on the Old Bedford River (9.7 km), 1870.</b> Three markers at equal " +
         "height above the water; one sight line joining the end markers. The sphere predicts the middle marker " +
         "stands proud of that line by d²/8R ≈ 1.85 m — about 1.6 m after standard refraction — and through " +
         "Wallace's telescope, it did. Drawn with the vertical scale exaggerated (factor printed); the metres are true." },
  { name: "Pontchartrain", d: 38.4, mode: "chord",
    cap: "<b>A 38.4 km chord across Lake Pontchartrain.</b> Stretch a straight line between two shore points " +
         "38.4 km apart and the level water surface bulges d²/8R ≈ 29 m above its midpoint — which is why the far " +
         "end of the causeway, its pilings and its traffic sink below the horizon in every long-lens photograph, " +
         "bottom first. The flat prediction is a bulge of exactly zero." },
  { name: "Rainy Lake 2018", d: 9.46, mode: "wallace",
    cap: "<b>Rainy Lake, Minnesota–Ontario, spring 2018 — the Bedford Level redone with GPS.</b> Targets planted " +
         "on a metre of lake ice out to 9.5 km, each one fixed to centimetres by differential GPS, and the " +
         "observer's line of sight compared against both models. Same three-marker logic as Wallace, but with the " +
         "positions measured rather than argued about: the surface came out curved at roughly 6,400 km radius." },
  { name: "Suez Canal", d: 162, mode: "chord",
    cap: "<b>The Suez Canal, 162 km of lock-free water.</b> A standing flat-earth argument is that the canal was " +
         "dug level and therefore proves a flat sea. It proves the opposite: “level” means following an " +
         "equipotential, and a straight chord between its ends would pass d²/8R ≈ 515 m below the midpoint of the " +
         "water surface. Nobody dug a chord — the surveyors levelled, which is a curvature-following procedure." },
  { name: "LIGO Hanford arm", d: 4, mode: "chord",
    cap: "<b>A 4 km laser arm that had to be built as a chord.</b> The beam tube of a gravitational-wave " +
         "interferometer is straight because light is; the ground under it is not. Over 4 km the surface falls " +
         "about 1.25 m away from the straight tube, and the concrete had to be graded to match. The instrument " +
         "would not have worked if the correction had been left out." },
];

export const SURV_TRI = [
  { name: "Gauss 1823 · Brocken–Hohehagen–Inselsberg", side: 82.2,
    extra: "equal-area equilateral shown; real sides 69 / 85 / 107 km", measured: "measured excess: 14.85″" },
  { name: "Struve chain triangle (typical)", side: 40, extra: "258 such triangles, Hammerfest → Black Sea" },
  { name: "OSGB retriangulation, primary (typical)", side: 60, extra: "6,500+ trig pillars, 1936–62" },
  { name: "Great Trigonometrical Survey (typical long side)", side: 75, extra: "India, 1802–71" },
  { name: "Continental scale (illustrative)", side: 1000, extra: "the excess grows to whole degrees" },
  { name: "Cassini's Paris meridian (typical side)", side: 35, extra: "1683–1718, the arc that started the flattening dispute" },
  { name: "Spain–Algeria junction 1879 (Mulhacén side)", side: 270, extra: "Perrier & Ibáñez, across the Mediterranean" },
  { name: "Corsica–mainland junction 1925 (Coudon–Cinto)", side: 255.6, extra: "Helbronner's longest side; see tab 1" },
];

export const SV_ZEN = [
  { z1:"91 08 09", z2:"89 07 44", d:32139, h:2273 },
  { z1:"91 03 44", z2:"89 15 34", d:39476, h:2188 },
  { z1:"90 50 01", z2:"89 35 13", d:52518, h:2269 },
  { z1:"91 09 00", z2:"89 22 35", d:66128, h:2043 },
  { z1:"90 49 49", z2:"89 45 41", d:74362, h:2209 },
  { z1:"90 40 36", z2:"89 56 32", d:76957, h:2308 },
  { z1:"90 32 21", z2:"90 12 12", d:92882, h:2421 },
];

export const SV_TRI = [
  [34.163,90.089167,90.187556],[30.701,89.877139,90.384667],[35.218,90.269472,90.015028],
  [156.762,90.144972,91.082194],[65.696,89.075806,91.440417],[38.546,88.799778,91.501500],
  [33.063,90.358333,89.895806],[41.044,90.159778,90.158889],[28.391,91.535528,88.680611],
  [18.647,92.303278,87.842722],[18.670,92.284528,87.862861],[41.775,89.994528,90.343944],
  [33.840,90.226944,90.046167],[69.422,88.299111,92.249556],[41.982,89.684361,90.654028],
  [47.805,90.502000,89.883000],[28.354,89.639056,90.595028],[59.102,89.742667,90.734722],
  [87.142,91.355333,89.342222],[82.966,89.912806,90.755694],[110.377,90.201250,90.689778],
  [123.697,90.461667,90.525028],[108.825,90.519806,90.331972],[122.287,90.140250,90.827722],
  [112.907,89.990417,90.914944],
];

