// Cartes autonomes de l'onglet dip (epic11). Textes : src/i18n/<langue>/dip-cards.json.
// Plusieurs figures suivent la hauteur d'œil choisie : elle est écrite sur l'image.
export const SOURCES = {
  bowditch: "N. Bowditch, The American Practical Navigator, Vol. 2 (NGA, 2019): the dip correction.",
  young: "A. T. Young, Dip of the Horizon (San Diego State University).",
  rawlins: "D. Rawlins, \"Doubling your sunsets\", American Journal of Physics 47(2), 126–128 (1979).",
  nasa: "NASA NSSDCA, Sun Fact Sheet: apparent diameter 31.6′ to 32.7′.",
  lidar: "IGN, LiDAR HD — 1 m terrain model of France (Géoplateforme).",
  copernicus: "ESA, Copernicus DEM GLO-30 — 30 m surface model of the globe.",
  agel: "Mont Agel (Wikipédia, FR): 1,148 m published; 1,133 m in the IGN terrain model, which has no LiDAR on the summit (a military site).",
  gml: "NOAA Global Monitoring Laboratory, baseline surface radiation, Mauna Loa Observatory (19.536° N, 155.576° W, 3,397 m): one-minute direct normal irradiance, 2016 (gml.noaa.gov/aftp/data/radiation/baseline/mlo).",
  midc: "NREL / NLR Measurement and Instrumentation Data Center, station NELHA, Keahole Point, Hawaii: 19.728° N, 156.059° W, 4 m.",
};

export const CARDS = [
  { id: "pair", figs: ["dipPairFig"], src: [] },
  { id: "flatten", figs: ["dipFlatten"], fx: ["dipfig0"], src: ["bowditch"] },
  { id: "globe", figs: ["dipG"], src: ["young"] },
  { id: "plane", figs: ["dipF"], src: [] },
  { id: "both", figs: ["dipG", "dipF"], labels: true, src: ["young", "bowditch"] },
  { id: "tangent", figs: ["dipfig0"], src: ["young"] },
  { id: "chord", figs: ["dipfig1"], src: [] },
  { id: "tri", figs: ["dipTri"], src: [] },
  { id: "env", figs: ["dipEnv"], src: [] },
  { id: "radius", figs: ["dipfig2"], src: ["young", "rawlins"] },
  { id: "window", figs: ["dipfig3"], src: ["nasa"] },
  { id: "band", figs: ["dipBand"], src: ["nasa", "young"] },
  // l'animation de Caussols (2026-09-27) : on courbe la Terre, puis la photo
  { id: "caus", figs: ["dipCaus"], src: ["lidar", "copernicus", "agel"] },
  // Mauna Loa et Keahole sur la même horloge (2026-10-03) : l'animation, et la soirée montrée dans ses lectures
  { id: "mlo", figs: ["dipMlo"], fx: ["dipFxMlo"], reads: ["dipMloReads"], src: ["gml", "midc", "copernicus", "bowditch", "young"] },
];
