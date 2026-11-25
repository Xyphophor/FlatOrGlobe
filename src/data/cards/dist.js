// Cartes autonomes de l'onglet dist (epic11). Textes : src/i18n/<langue>/dist-cards.json.
export const SOURCES = {
  bowditch: "N. Bowditch, The American Practical Navigator, Vol. 2 (NGA, 2019): \"The Sailings\".",
  gcmap: "Great Circle Mapper — Santiago de Chile → Sydney, a scheduled daily route.",
  snyder: "J. P. Snyder, Map Projections — A Working Manual, USGS Professional Paper 1395 (1987).",
  sinnott: "R. W. Sinnott, \"Virtues of the Haversine\", Sky & Telescope 68(2), 158–159 (1984).",
};

export const CARDS = [
  { id: "rulers", figs: ["distOpenerFig"], src: ["snyder"] },
  { id: "three", figs: ["distfig0"], src: [] },
  { id: "arc", figs: ["distfig1"], src: ["sinnott"] },
  { id: "grid", figs: ["distfig2"], src: ["snyder"] },
  { id: "disc", figs: ["distfig3"], src: ["snyder"] },
  { id: "mirror", figs: ["distfig4"], src: [] },
  { id: "parallel", figs: ["distfig5"], src: [] },
  { id: "stretch", figs: ["distStretchFig"], src: ["snyder"] },
  { id: "legs", figs: ["distfig6"], src: ["gcmap"] },
  { id: "legs3", figs: ["distLegsFig"], src: [] },
  { id: "globe", figs: ["dg3d"], fx: ["distfig1"], src: ["bowditch"] },
  { id: "disk", figs: ["df3d@polar", "df3d@cartesian"], fx: ["distfig3"], labels: true, src: ["snyder"] },
  { id: "pairs", figs: ["dg3d", "df3d@polar", "df3d@cartesian"], fx: ["distfig1", "distfig3"], labels: true, src: ["bowditch", "snyder", "gcmap"] },
];
