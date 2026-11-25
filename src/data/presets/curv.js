// Onglet curv (epic13) -- cas documentés, tous tirés de Lynch (2008),
// Applied Optics 47(34) H39-H43 (source [1] de l'onglet). Hauteurs en pieds
// dans l'article, converties ici (1 ft = 0,3048 m, comme Lynch).
export const FT = 0.3048;

/** La mesure photographique de Lynch : horizon centré, image 62,7° × 47,1°, flèche 0,51° (~17 px). */
export const LYNCH_PHOTO = { h: 35000 * FT, fovH: 62.7, fovV: 47.1, sagDeg: 0.51, sagPx: 17 };

/** Témoignages rapportés par Lynch, du plus bas au plus haut (règle 7 : cas documentés seulement). */
export const LYNCH_REPORTS = [
  { id: "hal", h: 3116, k: "rep-hal" },          // Haleakalā -- Lynch : pas de courbure perçue
  { id: "mk", h: 4205, k: "rep-mk" },            // Mauna Kea -- idem
  { id: "jet", h: 35000 * FT, k: "rep-jet" },    // avion de ligne -- subtile mais nette à 90°, invisible sous 60°
  { id: "b57", h: 50000 * FT, k: "rep-b57" },    // B-57 (Gutierrez) -- « pas vraiment sensible » avant ~50 000 ft
  { id: "pic", h: 15787, k: "rep-pic" },         // Piccard & Kipfer 1931 -- première observation attribuée
  { id: "b60", h: 60000 * FT, k: "rep-b60" },    // 60 000 ft : évidente ; Concorde
  { id: "exp", h: 22066, k: "rep-exp" },         // Explorer II 1935 -- premières photographies
];

/* ---- Caméras du calculateur (epic13) : caractéristiques PUBLIÉES, rien d'ajusté ici ----
   Formats de capteur : largeur × hauteur en mm (source [9] de l'onglet). */
export const SENSORS = [
  { id: "ff", w: 36, h: 24 },
  { id: "apsc", w: 23.6, h: 15.6 },     // Nikon, Sony, Fujifilm (23,6–23,7 selon la marque)
  { id: "apscc", w: 22.3, h: 14.9 },    // Canon
  { id: "m43", w: 17.3, h: 13 },
  { id: "1in", w: 13.2, h: 8.8 },
];

/* Smartphones : focale ÉQUIVALENTE 35 mm (définie sur la diagonale du
   24 × 36, 43,27 mm) et champ diagonal quand le fabricant le donne. Images 4:3.
   iPhone 16 Pro : source [6] ; iPhone 15 : source [7]. Objectifs traités
   comme rectilinéaires : corrigés par logiciel (« Lens correction (Ultra
   Wide) » est dans la fiche [6]). */
export const PHONES = [
  { id: "ip16p-1x", eq: 24, src: 6 },
  { id: "ip16p-05x", eq: 13, dfov: 120, src: 6 },
  { id: "ip16p-5x", eq: 120, dfov: 20, src: 6 },
  { id: "ip15-1x", eq: 26, src: 7 },
  { id: "ip15-05x", eq: 13, dfov: 120, src: 7 },
  { id: "ip15-2x", eq: 52, src: 7 },
];

/* GoPro HERO7 Black, table de champs publiée par GoPro (source [8]) : degrés
   vertical / horizontal / diagonal, zoom 0 %, stabilisation coupée. */
export const GOPRO7 = {
  wide43: { v: 94.4, h: 122.6, d: 149.2 },
  wide169: { v: 69.5, h: 118.2, d: 133.6 },
  linear43: { v: 70.0, h: 86.0, d: 98.7 },
};

/* ---- Animation « en profondeur / de gauche à droite » (epic13 UC05, 2026-09-30) ----
   Cas documenté (règle 7) : la Turning Torso de Malmö filmée depuis le côté
   danois de l'Øresund par Mathias Kp le 26 février 2016 [12][13]. Sept prises,
   œil à 2 à 4 m au-dessus de la mer de 25 à 47,9 km, puis la dernière depuis
   17,6 m. Partie cachée mesurée par l'auteur en segments (9 segments de
   19,53 m au-dessus d'un socle de 6,3 m, sol à 2,13 m) et convertie en mètres
   au-dessus de la mer, colonne « Obscured measured » de son tableau. */
export const TORSO = {
  ground: 2.13, base: 6.3, seg: 19.53, nSeg: 9, top: 7.9,        // m (tableau de l'auteur [13])
  width: 26,                                                     // m, largeur apparente approximative (dessin seulement)
  shots: [                                                       // h œil (m), d (m), segments cachés, cachés mesurés (m)
    { id: "A", h: 3.7, d: 25000, seg: 0.75, hid: 23 },
    { id: "B", h: 2.9, d: 28400, seg: 1.32, hid: 34 },
    { id: "C", h: 2.9, d: 34700, seg: 2.35, hid: 54 },
    { id: "D", h: 2.4, d: 40300, seg: 3.46, hid: 76 },
    { id: "E", h: 2.7, d: 45100, seg: 4.72, hid: 101 },
    { id: "F", h: 2.1, d: 47900, seg: 5.40, hid: 114 },
    { id: "F2", h: 17.6, d: 47900, seg: 2.86, hid: 64 },
  ],
};
TORSO.height = TORSO.ground + TORSO.base + TORSO.nSeg * TORSO.seg + TORSO.top;   // sommet au-dessus de la mer (≈ 192 m ; LiDAR : 192,6 m)

/** Paramètres de l'animation : départ à 10 km, les sept prises, puis montée jusqu'à 400 km. */
export const DEPTH = {
  tower: TORSO.height, d0: 10000, d1: 47900, hMax: 400000,
  eye: 3.7,                      // hauteur de départ = celle de la prise A
  ex1: 2000,                     // Terre dessinée 2 000 fois plus petite au ras de l'eau (distances ≈ ÷√2000)
  marks: [                       // hauteurs nommées pendant la montée
    { h: 400 * FT, k: "dp-m-drone2" },
    { h: 35000 * FT, k: "dp-m-jet" }, { h: 30000, k: "dp-m-balloon" }, { h: 400000, k: "dp-m-iss" },
  ],
};
