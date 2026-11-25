// Cartes autonomes de l'onglet obs (epic11). Textes : src/i18n/<langue>/obs-cards.json.
// Les chiffres sont ceux que la page calcule (lectures au 24 novembre 2026, 16:56:33 CET ;
// croisement des crêtes ; contacts du 10 janvier 2026) : aucun ne dépend d'un réglage.
export const SOURCES = {
  peakfinder: "PeakFinder — viewpoint (44.09388° N, 6.92856° E, 1,690 m) and summit coordinates and heights; Le Grand Mourre 1,898 m.",
  lidar: "IGN, LiDAR HD digital terrain model (about 1 m), read through the Géoplateforme WMS-R service.",
  meeus: "J. Meeus, Astronomical Algorithms, 2nd ed. (1998): Sun and Moon positions; this implementation agrees with PyEphem/libastro to 35″ over 42 dates.",
  icao: "ICAO, Manual of the ICAO Standard Atmosphere, Doc 7488/3 (1993): about 826 hPa and 4 °C at 1,690 m.",
  gleason: "A. J. Gleason, New Standard Map of the World (1892): the azimuthal-equidistant map published by flat-earth sources.",
};

export const CARDS = [
  { id: "ridge", figs: ["obsCam"], fx: ["obs-25"], reads: ["obsDate", "obsTime"], src: ["peakfinder", "lidar", "meeus", "icao"] },
  { id: "crossing", figs: ["obsCam"], fx: ["obs-25"], reads: ["obsCross"], src: ["lidar", "meeus"] },
  { id: "map", figs: ["obsMap"], reads: ["obsDate", "obsTime"], src: ["gleason", "meeus"] },
  { id: "dr", figs: ["obsFigDR"], src: [] },
  { id: "jan10", figs: ["obsJanFig"], fx: ["obs-25"], src: ["meeus", "lidar"] },
  { id: "jan10-video", figs: ["obsJan-globe", "obsJan-video"], fx: ["obs-25"], labels: true, src: ["meeus", "lidar"] },
];
