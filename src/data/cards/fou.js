// Cartes autonomes de l'onglet fou (epic11). Textes : src/i18n/<langue>/fou-cards.json.
export const SOURCES = {
  foucault: "L. Foucault, \"Démonstration physique du mouvement de rotation de la Terre au moyen du pendule\", Comptes rendus 32, 135–138 (1851).",
  wolfe: "J. Wolfe, The Foucault pendulum — the physics and maths involved (Physclips, UNSW).",
  stoytchev: "O. Stoytchev, \"From Foucault's Pendulum to the Gauss–Bonnet Theorem\", arXiv:1701.01666.",
  avron: "J. E. Avron, \"Topological quantum numbers in the Hall effect\", arXiv:math-ph/0303055.",
  southpole: "J. Bird, J. McCallum, M. Town & R. A. Baker, South Pole Foucault Pendulum, Amundsen–Scott Station (2001).",
  salva: "N. N. Salva & H. R. Salva, \"Interplay between Airy and Coriolis precessions in a real Foucault pendulum\", arXiv:2502.12230.",
};

export const CARDS = [
  { id: "pair", figs: ["fouPairFig"], src: ["southpole"] },
  { id: "axis", figs: ["foufig0"], src: [] },
  // les deux repères côte à côte (propriétaire, 2026-09-27)
  { id: "anim", figs: ["fouAnimCanvas@floor", "fouAnimCanvas@swing"], fx: ["foufig0"], labels: true, reads: ["fouAnimReads"], src: ["foucault", "wolfe"] },
  { id: "split", figs: ["foufig1"], src: ["wolfe"] },
  { id: "omega", figs: ["fouOmegaCanvas"], src: ["wolfe"] },
  { id: "rose", figs: ["fouRoseCanvas"], src: ["foucault"] },
  { id: "lat", figs: ["fouLatCanvas"], src: ["southpole", "stoytchev", "avron"] },
  { id: "ellipse", figs: ["foufig2"], src: ["salva"] },
];
