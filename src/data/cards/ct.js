// Cartes autonomes de l'onglet ct (epic11). Textes : src/i18n/<langue>/ct-cards.json.
// Les chiffres des études viennent des lectures de la page (`reads`), calculées sur le classeur publié.
export const SOURCES = {
  sa: "Space Audits, Celestial Theodolite — measurement reward programme, the project's published notes.",
  workbook: "Celestial Theodolite Calculator v9.1.1, the project's published workbook (data_table sheet).",
  usno: "U.S. Naval Observatory, altitude and azimuth service.",
  iers: "IERS — the sidereal day: 15.041° per hour, 15.041″ per second.",
  saem: "Þ. Sæmundsson, astronomical refraction formula, Sky & Telescope 72 (1986).",
  hirt: "C. Hirt et al. (2010), J. Geophys. Res.: the refraction coefficient k ≈ 0.13.",
  nos74: "NOAA Technical Report NOS 74 NGS 9 (1978): the McDonald Observatory radial scheme.",
};

export const CARDS = [
  { id: "method", figs: ["ct-figOpen"], src: ["sa", "usno"] },
  { id: "rate", figs: ["ctfig1"], src: ["iers"] },
  { id: "predict", figs: ["ctfig2"], src: ["nos74"] },
  { id: "rule", figs: ["ct-figPole"], src: [] },
  { id: "pole", figs: ["ct-figZero"], src: [] },
  { id: "objection", figs: ["ct-figPole", "ct-figZero"], labels: true, src: [] },
  { id: "residual", figs: ["ctfig3"], src: ["usno"] },
  { id: "bars", figs: ["ct-figBars"], reads: ["ct-case"], src: ["workbook", "saem"] },
  { id: "box", figs: ["ct-figBox"], reads: ["ct-readBox"], src: ["workbook", "saem"] },
  { id: "rsym", figs: ["ctfig4"], src: ["hirt"] },
  { id: "radius", figs: ["ct-figR"], reads: ["ct-readR"], src: ["workbook", "hirt"] },
  { id: "trend", figs: ["ct-figTrend"], reads: ["ct-readTrend"], src: ["workbook", "hirt"] },
  { id: "shoot", figs: ["ct-shootLive"], src: [] },
  { id: "frames", figs: ["ct-figShoot"], src: [] },
];
