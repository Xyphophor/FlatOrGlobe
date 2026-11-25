// Cartes autonomes de l'onglet hh (epic11). Textes : src/i18n/<langue>/hh-cards.json.
export const SOURCES = {
  hirt: "C. Hirt et al., \"Modeling of the terrestrial refraction coefficient\", J. Geophys. Res. 115 (2010): k ≈ 0.13.",
  chicago: "ABC57, \"Skyline skepticism: the Lake Michigan mirage\" — viewpoints and distances; Willis Tower 442.1 m to the roof.",
  lidar: "IGN, LiDAR HD and RGE ALTI — terrain models of France (Géoplateforme).",
  osm: "OpenStreetMap contributors (ODbL): building outlines of Bordighera.",
  liguria: "Ministero dell'Ambiente / Regione Liguria, LiDAR 1 m (2008–2010), PCN: roofs and ground of the lower town.",
  tinitaly: "INGV, TINITALY 1.1 — 10 m terrain model of Italy (CC BY 4.0).",
  canigou: "Metabunk, \"Observations of Canigou, curvature of the Earth and atmospheric refraction\" (2017); first recorded by von Zach in 1808.",
};

export const CARDS = [
  { id: "models", figs: ["hhOpenerFig"], src: [] },
  { id: "graze", figs: ["hhfig0"], src: [] },
  { id: "flatten", figs: ["hhFlatten"], fx: ["hhfig0"], src: ["chicago", "hirt"] },
  { id: "three", figs: ["hhThreeFig"], src: [] },
  { id: "canigou", figs: ["hh-figSil"], src: ["lidar", "canigou", "hirt"] },
  // Bordighera depuis un balcon près d'Antibes (2026-10-06) : plan, globe, réfraction, puis la photo
  { id: "bord", figs: ["hhBord"], fx: ["hhfig0"], reads: ["hhBordReads"], src: ["lidar", "osm", "liguria", "tinitaly", "hirt"] },
];
