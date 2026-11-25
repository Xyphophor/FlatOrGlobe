// HH_PRESETS + HH_CASES + HH_RECORDS de l'onglet "hh" (hauteur cachée),
// portés à l'identique du legacy (flat-or-globe-2.20.0.html, HH_PRESETS
// ~L15492, HH_CASES ~L15546, HH_RECORDS ~L15565).
//
// label/note sont l'anglais canonique ; les traductions vivent dans
// src/i18n/<lang>/hh.json sous "preset-<key>-label" / "-note" (voir
// presetText() dans index.js). Le legacy lui-même n'a PAS de traduction FR
// complète pour ces 17 presets -- seuls 12 des 17 ont une entrée dans
// PRESET_TEXT.fr (canigou-allauch, chicago-dunes, chicago-newbuffalo,
// chicago-towerhill et chicago-grandmere n'en ont pas). Ce fichier ne porte
// donc PAS de FR pour ces 5-là non plus : ils retombent sur l'anglais dans
// les deux versions, fidèlement.
export const HH_PRESETS = {
  "canigou-allauch": {
    label: "Canigou · Allauch, silhouetted on the setting Sun, 263 km",
    e: 244, d: 263, h: 2785, k: 0.22, ex: 40,
    note: "Backlit by the setting Sun, and that is the whole point: it is the SUN'S AZIMUTH, not refraction, that picks the dates — around 9 February and 1 November, when sunset from Allauch lines up with the peak. At k = 0.22 the cut falls near 2,450 m, which is where the local observers put it: the top tenth of the mountain, no more. A plane hides nothing, so it would show all 2,785 m on any clear evening of the year, and it does not.",
  },
  "chicago-dunes": {
    label: "Chicago · Indiana Dunes beach → Willis Tower, 53 km",
    e: 2, d: 53, h: 447, k: 0.17, ex: 120,
    note: "The most-cited long-distance claim there is. Heights are above the lake surface: the Willis Tower roof is 447 m, the antenna tip 531 m. From the beach 147 m are hidden even at k = 0.17 — so the lower third of the tower is gone, and the photographs show exactly that. A plane hides nothing at any distance.",
  },
  "chicago-newbuffalo": {
    label: "Chicago · New Buffalo → Willis Tower, 68 km",
    e: 2, d: 68, h: 447, k: 0.17, ex: 120,
    note: "254 m hidden: over half the tower, and the whole of every building under that height. What arrives is a row of crowns with no bases, which is the shape a globe predicts and a plane forbids.",
  },
  "chicago-towerhill": {
    label: "Chicago · Warren Dunes, Tower Hill 76 m, 86 km",
    e: 76, d: 86, h: 447, k: 0.17, ex: 120,
    note: "The same line from 76 m up: 175 m hidden instead of 422 m from the beach below. Climbing 76 m recovers 247 m of skyline — the trade that has no meaning on a plane, where height changes nothing because nothing was ever hidden.",
  },
  "chicago-grandmere": {
    label: "Chicago · Grand Mere, the mirage photograph, 93 km",
    e: 3, d: 93, h: 447, k: 0.17, ex: 120,
    note: "Joshua Nowicki's April 2015 photograph, reported at the time as a superior mirage. At k = 0.17 the roof is 484 m down and only the antenna could show; the picture shows more, and k ≈ 0.23 is what it takes. THIS ONE FAVOURS NOBODY: the globe needs strong refraction to explain it, and the tab says so rather than quietly using standard k.",
  },
  "garda-shore": {
    label: "Lake Garda · Malcesine shore → Sirmione, 37 km",
    e: 2, d: 37, h: 47, k: 0.17, ex: 150,
    note: "Malcesine waterfront → Sirmione; the Scaligero keep is ≈ 47 m. k = 0.17 assumed (standard atmosphere at water level; none published for the Garda tests).",
  },
  "garda-baldo": {
    label: "Lake Garda · from the Monte Baldo cable car, 515 m",
    e: 515, d: 37, h: 47, k: 0.17, ex: 150,
    note: "Same sightline from the San Michele mid-station, 515 m above the lake. Same assumed k = 0.17 — and it changes nothing, because nothing is hidden.",
  },
  "garda-flat": {
    label: "Lake Garda · Desenzano → Gargnano, the flat-earth test",
    e: 2, d: 26, h: 60, k: 0.17, ex: 220,
    note: "The 26 km line the Italian flat-earth group photographed and reported as “profile recognisable”. Recognising a village is not seeing its waterline — which is the whole methodological point.",
  },
  "corsica-coudon": {
    label: "Corsica · Fort du Coudon → Monte Cinto, 255.6 km",
    e: 702, d: 255.583, h: 2706, k: 0.14, ex: 10,
    note: "Helbronner's own distance, 255,582.75 m, August 1925. k = 0.14: the long-run geodetic average for high summer stations, not a value he published.",
  },
  "corsica-recip": {
    label: "Corsica · Monte Cinto → Mont Agel, the reciprocal",
    e: 2709, d: 198.283, h: 1149, k: 0.14, ex: 12,
    note: "The same night, read from the Corsican end: from 2,709 m the horizon is 186 km out, so the Mont Agel beam at 198 km was itself partly buried — which is exactly why the station had to be at 1,149 m.",
  },
  "corsica-nice": {
    label: "Corsica · Riviera seafront → Monte Cinto, 198 km",
    e: 5, d: 198, h: 2706, k: 0.17, ex: 10,
    note: "k = 0.17, the standard-atmosphere sea-level value. Geometry alone hides the whole mountain from 5 m, so these sightings exist only because refraction lifts it — which is what the photographers themselves conclude.",
  },
  canigou: {
    label: "Canigou from Notre-Dame de la Garde, Marseille, 253 km",
    e: 142, d: 253, h: 2784.7, k: 0.17, ex: 10,
    note: "The celebrated sunset alignment seen from the basilica esplanade at 142 m. On a plane the whole 2,784 m stands above eye level and the Roussillon coast with it; on a globe only the top of the massif clears.",
  },
  vieriou: {
    label: "Sommet de Viériou → Cime de Barbin, 60 km",
    e: 1395, d: 59.96, h: 1561, k: 0.13, ex: 60,
    note: "The original observation behind this page. From 1,395 m the horizon is 133 km out, so nothing is hidden at 60 km — here the test is the ANGLE, not the missing height. The Elevation-angles tab is where this case is decided.",
  },
  bedford: {
    label: "Bedford Level 1870 · Wallace's three markers, 9.7 km",
    e: 3.96, d: 9.66, h: 3.96, k: 0.13, ex: 400,
    note: "Three markers at equal height above still water. Not a hidden-height test either: the far marker stays visible. What the sphere predicts is that the MIDDLE one stands proud of the line joining the other two — see tab 7.",
  },
  pontchartrain: {
    label: "Lake Pontchartrain causeway · 38.4 km chord",
    e: 3, d: 38.4, h: 5, k: 0.17, ex: 150,
    note: "A causeway deck about 5 m above a lake, photographed end-on with a long lens. The deck, its pilings and its traffic sink bottom-first — the classic case where zoom demonstrably fails to bring the base back.",
  },
  shkhara: {
    label: "Karagöl → Shkhara · the Guinness record, 493 km",
    e: 3275, d: 493.07, h: 5203, k: 0.17, ex: 6,
    note: "The longest sight line ever photographed. Geometry alone buries the summit 1,350 m below the line of sight — the flat-earth arithmetic on this case is correct. It clears at k = 0.123, BELOW the standard-atmosphere value of 0.17.",
  },
  rainy: {
    label: "Rainy Lake 2018 · surveyed with differential GPS",
    e: 3.91, d: 9.46, h: 10.8, k: 0.17, ex: 400,
    note: "k = 0.17 is DOCUMENTED here: the published analysis used standard refraction k = 0.1706 at 2 m over the ice. The far target had to stand 10.8 m up to reach the observer's eye level.",
  },
};

/** HH_CASES du legacy (~L15546) : sightlines documentées, tableau principal. */
export const HH_CASES = [
  { n: "Garda · Bardolino → Gardone Riviera beach", e: 2, d: 14.40, r: "“beach clearly visible”" },
  { n: "Garda · Desenzano → harbour at Garda", e: 2, d: 17.0, r: "“harbour clearly visible”" },
  { n: "Garda · Desenzano → shore at Gargnano", e: 2, d: 26.0, r: "“profile recognisable”" },
  { n: "Garda · Malcesine shore → Sirmione", e: 2, d: 37.0, r: "proposed test — castle keep ~47 m" },
  { n: "Garda · same line, cable car mid-station", e: 515, d: 37.0, r: "proposed control at 515 m" },
  { n: "Corsica · Mont Coudon → Monte Cinto", e: 702, d: 255.583, r: "beam held 8 h, 1925" },
  { n: "Corsica · Mont Agel → Monte Cinto", e: 1149, d: 198.283, r: "beam observed, 1925" },
  { n: "Corsica · Nice seafront → Monte Cinto", e: 5, d: 198.0, r: "summit only, in clear air" },
  { n: "Karagöl → Shkhara · Guinness record 2024", e: 3275, d: 493.07, r: "a thin line above the horizon" },
  { n: "Cerro Champaquí → Aconcagua, 2023", e: 2790, d: 483.5, r: "the previous record" },
  { n: "Pic de Finestrelles → Pic Gaspard, 2016", e: 2826, d: 443.0, r: "the record before that" },
  { n: "Rainy Lake · observer → target 7", e: 3.91, d: 9.46, r: "target at eye level, DGPS" },
];

/**
 * HH_RECORDS du legacy (~L15565). Le "ceiling" n'est pas un ajustement : il
 * vaut √(2R'h₁) + √(2R'h₂), la somme des deux distances d'horizon, calculée
 * depuis le rayon et le k actuellement réglés sur la page.
 */
export const HH_RECORDS = [
  { n: "Karagöl → Shkhara (Guinness, 15 Dec 2024)", a: "Karagöl subpeak", b: "Shkhara", h1: 3275, h2: 5203, d: 493.07 },
  { n: "Cerro Champaquí → Aconcagua (13 Jun 2023)", a: "Cerro Champaquí", b: "Aconcagua", h1: 2790, h2: 6961, d: 483.5 },
  { n: "Pic de Finestrelles → Pic Gaspard (2016)", a: "Finestrelles", b: "Pic Gaspard", h1: 2826, h2: 3883, d: 443.0 },
  { n: "Mount Sanford → Denali", a: "Mount Sanford", b: "Denali", h1: 4949, h2: 6190, d: 365.3 },
  { n: "Mount Ruapehu → Tapuae-o-Uenuku", a: "Ruapehu", b: "Tapuae-o-Uenuku", h1: 2797, h2: 2885, d: 343.1 },
  { n: "Kilimanjaro → Mount Kenya", a: "Kilimanjaro", b: "Mount Kenya", h1: 5895, h2: 5199, d: 321.9 },
  { n: "Darjeeling → Everest", a: "Darjeeling", b: "Everest", h1: 2100, h2: 8849, d: 175.4 },
];

/**
 * Silhouette bakée du Canigou vu d'Allauch (HH_CAN dans le legacy, ~L28555),
 * réutilisée depuis src/data/dem/canigou.json (produite par une session
 * précédente, vérifiée octet pour octet contre le legacy avant réutilisation).
 */
export const HH_SIL_PRESET = "canigou";
