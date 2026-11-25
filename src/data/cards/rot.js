// Cartes autonomes de l'onglet rot (2026-10-04) : une par animation. Textes : src/i18n/<langue>/rot-cards.json.
export const SOURCES = {
  rings: "G. E. Stedman, R. B. Hurst & K. U. Schreiber, Optics Communications 279 (2007) 124; K. U. Schreiber et al., J. Geophys. Res. 109 (2004) B06405.",
  roehner: "B. M. Roehner, How can one detect the rotation of the Earth “around the Moon”? Part 2 (2011), table B1.",
  reich: "Ferdinand Reich, Drei-Brüder-Schacht, Freiberg, 1831: 158.5 m, 106 drops.",
};
export const CARDS = [
  // 2026-10-07 (propriétaire) : animation, explication (Ω sin φ autour de la verticale), fréquences mesurées, Ω lu
  { id: "ring", figs: ["rotAnimRing", "rotFxRing", "rotFigRingHz", "rotFigRing"], fx: ["rotFxRing"], rows: [1, 3], labels: true, src: ["rings"] },
  // 2026-10-07 (propriétaire) : l'animation ET les données mesurées -- déviations en mm, puis le ω qu'elles donnent
  { id: "fall", figs: ["rotAnimFall", "rotFigFallMm", "rotFigFall"], fx: ["rotFxFall"], rows: [1, 2], labels: true, src: ["roehner", "reich"] },
  { id: "sid", figs: ["rotAnimSid"], fx: ["rotFxSid"], src: [] },
];
