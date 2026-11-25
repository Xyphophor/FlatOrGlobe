// Cartes autonomes de l'onglet grav (epic11). Textes : src/i18n/<langue>/grav-cards.json.
export const SOURCES = {
  geoid: "NOAA National Geodetic Survey, \"What is the geoid?\"",
  gravd: "NOAA NGS, GRAV-D General Airborne Gravity Data User Manual (v2.1): free-air gradient 0.3086 mGal/m.",
  damiani: "T. Damiani et al., \"Computing gravity disturbances at altitude\", NGS/AGU (2013): normal gravity, the Somigliana formula.",
  wu: "X. Wu et al., \"Gravity surveys using a mobile atom interferometer\", arXiv:1904.09084.",
  richer: "MacTutor History of Mathematics: Jean Richer — the Cayenne expedition of 1672–73.",
  nasa: "NASA NSSDCA, Earth Fact Sheet: mean density 5,514 kg/m³, mean radius 6,371 km.",
  moonfs: "NASA NSSDCA, Moon Fact Sheet: sidereal month 27.3217 d, eccentricity 0.0549, Earth/Moon mass ratio 81.3.",
  ct71: "D. E. Cartwright & R. J. Tayler, Geophys. J. R. Astron. Soc. 23 (1971) 45: the tide-generating potential.",
  ticon: "M. G. Hart-Davis, D. Dettmering & F. Seitz, TICON-3 (PANGAEA, 2022, doi:10.1594/PANGAEA.951610): tidal constants of 3,471 gauges.",
  noaagl: "NOAA National Ocean Service, Do the Great Lakes have tides? (spring tide under 5 cm).",
  uhslc: "University of Hawaii Sea Level Center, research-quality hourly sea level 2018 (Caldwell et al. 2015, doi:10.7289/V5V40S7W).",
};

export const CARDS = [
  { id: "pair", figs: ["gravPairFig"], src: ["geoid"] },
  { id: "angle", figs: ["gravfig0"], src: [] },
  { id: "vglobe", figs: ["gravDG"], src: [] },
  { id: "vflat", figs: ["gravDF"], src: [] },
  { id: "verticals", figs: ["gravDG", "gravDF"], labels: true, src: ["geoid"] },
  { id: "slab", figs: ["gravfig1"], src: ["nasa"] },
  { id: "disc", figs: ["gravDisc"], src: ["nasa"] },
  { id: "gradient", figs: ["gravfig2"], src: ["gravd"] },
  { id: "grad", figs: ["gravGrad"], src: ["gravd", "wu", "damiani"] },
  { id: "lat", figs: ["gravLat"], src: ["richer", "damiani"] },
  // 2026-11-13 (propriétaire, epic37/UC01) : pourquoi deux marées, et ce qu'en disent cinq marégraphes
  { id: "tide", figs: ["gravAnimTide"], fx: ["gv-fx-td", "gv-fx-tdk"], src: ["moonfs", "ct71"] },
  { id: "gauges", figs: ["gravFigTideSpec", "gravFigTideMonth"], src: ["uhslc", "ct71"] },
  // 2026-11-14 (propriétaire, epic37/UC06) : le globe des marées, et les petites mers
  { id: "tglobe", figs: ["gravAnimTideGlobe"], src: ["ticon", "ct71"] },
  { id: "seas", figs: ["gravFigSmallSeas"], fx: ["gv-fx-ss"], src: ["ticon", "noaagl"] },
];
