// Cartes autonomes de l'onglet star (epic11). Textes : src/i18n/<langue>/star-cards.json.
// Les figures dépendent du lieu, de la date et de l'objectif choisis : `reads`
// recopie la lecture de la page qui les nomme.
export const SOURCES = {
  yale: "D. Hoffleit & W. H. Warren, Yale Bright Star Catalogue, 5th revised edition (J2000).",
  hipparcos: "ESA, The Hipparcos Catalogue (1997).",
  iers: "IERS — the sidereal day; the sky turns 15.041° per hour.",
  usno: "U.S. Naval Observatory, altitude and azimuth of celestial bodies (online service).",
  bowditch: "N. Bowditch, The American Practical Navigator (NGA, 2019): the pole's altitude equals the latitude.",
  hip: "ESA, The Hipparcos and Tycho Catalogues, ESA SP-1200 (1997), VizieR I/239: positions and proper motions.",
  capitaine: "N. Capitaine, P. T. Wallace & J. Chapront, Astronomy & Astrophysics 412 (2003) 567: precession, 5,028.796″ per century.",
  almagest: "Ptolemy, Almagest VII 2-3 (trans. G. J. Toomer, 1984): Hipparchus's discovery of precession.",
  halley: "E. Halley, Philosophical Transactions 30 (1718) 736: the discovery of proper motion.",
  aristotle: "Aristotle, On the Heavens II 14: stars seen in Egypt and Cyprus that are not seen further north.",
};

export const CARDS = [
  { id: "open", figs: ["st-figOpen"], reads: ["st-openReads"], src: ["hip", "bowditch"] },
  { id: "axis", figs: ["stfig0"], src: [] },
  // 2026-11-11 : les coordonnées du ciel (animation, puis sa formule)
  { id: "radec", figs: ["stAnimSphere"], fx: ["sky-fx-radec"], src: ["hip"] },
  { id: "prec", figs: ["stAnimPrec"], fx: ["sky-fx-prec"], src: ["hip", "capitaine", "almagest"] },
  { id: "pm", figs: ["stAnimPM"], fx: ["sky-fx-pm"], src: ["hip", "halley"] },
  { id: "vis", figs: ["stAnimVis"], fx: ["sky-fx-vis"], src: ["hip", "aristotle"] },
  { id: "dome", figs: ["stfig1"], src: [] },
  { id: "sphere", figs: ["stfig2"], src: ["bowditch"] },
  { id: "sky", figs: ["st-figSky"], reads: ["st-reads"], src: ["hip"] },
  { id: "meridian", figs: ["stfig3"], src: [] },
  { id: "proj", figs: ["st-figProj"], reads: ["st-reads"], src: [] },
  { id: "rhythm", figs: ["stfig4"], src: ["iers"] },
  { id: "rate", figs: ["st-figRate"], fx: ["stfig4"], reads: ["st-reads"], src: ["iers", "yale"] },
  { id: "season", figs: ["st-figSeason"], reads: ["st-reads"], src: ["yale", "usno"] },
];
