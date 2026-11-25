// Points de vue documentés de l'onglet dip, portés à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L16120 `DIP_SPOTS` et ~L16431 `VANTAGE`).
// La formule du dip n'a aucun paramètre libre, donc cette liste sert
// d'échelle de falsification : chaque échelon a une hauteur publiée et une
// distance d'horizon vérifiable sur une carte ou une photo.
//
// PIÈGE DOCUMENTÉ (CLAUDE.md, tasks/epic02/UC03.org) : la plage est
// PLAFONNÉE à 20 000 m. Ne pas ajouter d'échelon au-delà de ce plafond --
// le contrôle numérique (voir dip/logic.js `clampHeight`) le bloquerait
// silencieusement, exactement comme dans le legacy (`Math.min(20000, ...)`
// aux trois points d'entrée : sélection d'un preset, saisie manuelle,
// glisser-déposer sur les figures).
export const DIP_HEIGHT_MIN = 0.5;
export const DIP_HEIGHT_MAX = 20000;

export const DIP_SPOTS = [
  { label: "Eye level on the beach · 1.7 m", h: 1.7 },
  { label: "Ship's bridge, coastal ferry · 12 m", h: 12 },
  { label: "Lighthouse gallery, average French light · 40 m", h: 40 },
  { label: "Notre-Dame de la Garde esplanade, Marseille · 142 m", h: 142 },
  { label: "Eiffel Tower, top platform · 276 m", h: 276 },
  { label: "Empire State Building observatory · 320 m", h: 320 },
  { label: "Burj Khalifa, At the Top SKY · 555 m", h: 555 },
  { label: "Sommet de Viériou, Cheiron ridge · 1,395 m", h: 1395 },
  { label: "Monte Cinto, Corsica · 2,709 m", h: 2709 },
  { label: "Karagöl subpeak, Giresun (the GWR record) · 3,275 m", h: 3275 },
  { label: "Airliner at cruise · 11,000 m", h: 11000 },
  { label: "High-altitude research aircraft · 20,000 m", h: 20000 },
];

// Vantage points for the envelope figure (drawDipEnv in the legacy): a
// smaller, fixed set of real verticals, independent from the DIP_SPOTS
// dropdown -- each sightline in that figure is tangent from one of these.
export const DIP_VANTAGE = [
  { n: "Standing on the beach", h: 2 },
  { n: "Ship's bridge", h: 25 },
  { n: "Sea cliff", h: 150 },
  { n: "Tower observation deck", h: 450 },
  { n: "Mountain summit", h: 1395, note: "the viewpoint from the first tab" },
  { n: "Alpine peak", h: 4000 },
  { n: "Airliner at cruise", h: 11000 },
];

// Rows for "the band the Sun has to cross" table (fillBandTable in the legacy).
export const DIP_BAND_ROWS = [
  [1.7, "standing at the waterline"],
  [276, "Eiffel Tower, top platform"],
  [555, "Burj Khalifa, At the Top SKY"],
  [1395, "Sommet de Viériou"],
  [3275, "Karagöl subpeak"],
  [11000, "airliner at cruise"],
];

// Rows for "solve the triangle" table (fillTriTable in the legacy).
export const DIP_TRI_HEIGHTS = [2, 10, 100, 1395, 10000];
