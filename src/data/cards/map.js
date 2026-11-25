// Cartes autonomes de l'onglet map (2026-10-08) : une par figure de carte et par animation, plus les
// schémas qui portent une formule clé. Textes : src/i18n/<langue>/map-cards.json.
export const SOURCES = {
  snyder: "J. P. Snyder, Map Projections — A Working Manual, USGS Professional Paper 1395 (1987).",
  snyder93: "J. P. Snyder, Flattening the Earth: Two Thousand Years of Map Projections (University of Chicago Press, 1993).",
  bm: "British Museum, the Babylonian map of the world, BM 92687.",
  cleomedes: "Cleomedes, Caelestia I.7, transl. A. C. Bowen & R. B. Todd (University of California Press, 2004).",
  ptcat: "G. Graßhoff & O. Defaux, Catalog of Ptolemy's Geography, main books (Zenodo 3585758, 2019, CC BY 4.0); modern sites from Wikidata (CC0).",
  urbinas: "Codex Vaticanus Urbinas graecus 82, ff. 60v–61r, world map, Constantinople, c. 1300 (Biblioteca Apostolica Vaticana; Wikimedia Commons, public domain).",
  ptolemy: "J. L. Berggren & A. Jones, Ptolemy's Geography: An Annotated Translation of the Theoretical Chapters (Princeton University Press, 2000).",
  mercator: "G. Mercator, Nova et aucta orbis terrae descriptio ad usum navigantium (Duisburg, 1569); E. Wright, Certaine Errors in Navigation (London, 1599).",
  gauss: "C. F. Gauss, Disquisitiones generales circa superficies curvas (Göttingen, 1828).",
  tissot: "N. A. Tissot, Mémoire sur la représentation des surfaces et les projections des cartes géographiques (Paris, 1881).",
  gleason: "A. J. Gleason, Gleason's New Standard Map of the World (Buffalo, 1892); US patent 497,917 (1893).",
  un: "United Nations, General Assembly resolution 92 (I), 7 December 1946: the UN emblem.",
  utm: "Defense Mapping Agency, The Universal Grids: UTM and UPS, DMA TM 8358.2 (1989).",
};
export const CARDS = [
  { id: "small", figs: ["mapFxLocal", "mapFigErr"], labels: true, src: ["snyder", "bm"] },
  { id: "erat", figs: ["mapFxErat"], src: ["cleomedes"] },
  { id: "ptolemy", figs: ["mapPtol"], src: ["ptolemy", "ptcat", "urbinas", "snyder"] },
  { id: "mercator", figs: ["mapMerc"], src: ["mercator", "snyder"] },
  { id: "tissot", figs: ["mapGallery"], src: ["gauss", "tissot", "snyder93"] },
  { id: "ae", figs: ["mapAE"], src: ["snyder"] },
  { id: "centres", figs: ["mapAEAnim"], fx: ["mapFxAE"], src: ["snyder"] },
  { id: "gleason", figs: ["mapPolar", "mapFxPolar"], labels: true, src: ["gleason", "un", "snyder"] },
  { id: "utm", figs: ["mapFxUTM"], src: ["utm"] },
];
