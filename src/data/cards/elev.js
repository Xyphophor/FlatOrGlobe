// Cartes autonomes de l'onglet elev (epic11). Textes : src/i18n/<langue>/elev-cards.json.
export const SOURCES = {
  lidar: "IGN, LiDAR HD — 1 m terrain model of France (Géoplateforme).",
  cheiron: "Montagne du Cheiron (Wikipédia, FR): Sommet de Viériou, 1,395 m.",
  castellaras: "Castellaras de Thorenc (Wikipédia, FR): 1,400 m.",
  argentera: "Monte Argentera (Wikipedia): 3,297 m, highest summit of the Maritime Alps.",
  bev: "BEV (Austria), ALS DTM — 1 m laser-scan terrain model of Austria (CC BY 4.0).",
  schneeberg: "Schneeberg (Wikipedia): Klosterwappen, 2,076 m, highest summit of Lower Austria.",
  anninger: "Anninger (Wikipedia, DE): 675 m.",
};

export const CARDS = [
  { id: "pair", figs: ["simPairFig"], src: [] },
  // paysages LiDAR : les trois modèles l'un sous l'autre (une vidéo ne laisse pas choisir)
  { id: "land", figs: ["elevLand@globeK", "elevLand@globe", "elevLand@flat"], layout: "col", labels: true, src: ["lidar", "cheiron", "castellaras"] },
  { id: "arg", figs: ["elevArg@globeK", "elevArg@globe", "elevArg@flat"], layout: "col", labels: true, src: ["lidar", "argentera"] },
  // « schnee » : retirée avec la photo le 2026-09-27, remise le 2026-10-06 (deprojected a autorisé la photo)
  { id: "schnee", figs: ["elevSchnee@globeK", "elevSchnee@globe", "elevSchnee@flat"], layout: "col", labels: true, src: ["bev", "schneeberg", "anninger"] },
  { id: "sil", figs: ["sim-figSil"], src: ["lidar", "cheiron", "castellaras"] },
  { id: "flatten", figs: ["simFlatten"], src: ["cheiron", "castellaras"] },
  { id: "twoangles", figs: ["simfig1"], src: [] },
  { id: "frames", figs: ["simFramesFig"], src: [] },
  { id: "tangents", figs: ["tan3d"], src: [] },
  { id: "recip", figs: ["simfig2"], src: [] },
  { id: "size", figs: ["simfig3"], src: [] },
];
