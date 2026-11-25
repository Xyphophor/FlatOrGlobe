// Cartes autonomes de l'onglet ref (epic11). Textes : src/i18n/<langue>/ref-cards.json.
import { refValueLookup } from "../../tabs/ref/values.js";
export const SOURCES = {
  young: "A. T. Young, The Refractive Invariant, and Ducts (San Diego State University).",
  baselga: "S. Baselga & L. García-Asenjo, \"Practical Formulas for the Refraction Coefficient\", J. Surveying Eng. 140(2) (2014).",
  hirt: "C. Hirt et al., \"Monitoring of the refraction coefficient in the lower atmosphere using simultaneous reciprocal vertical angle measurements\", J. Geophys. Res. 115, D21102 (2010).",
  ramsayer: "K. Ramsayer, \"The accuracy of the determination of terrestrial refraction from reciprocal zenith angles\", IAU Symposium 89 (1979).",
  ams: "American Meteorological Society, Glossary of Meteorology: \"autoconvective lapse rate\".",
  novaya: "Atmospheric Optics, \"Novaya Zemlya Effect\".",
  igra: "NOAA NCEI, Integrated Global Radiosonde Archive (IGRA v2).",
  kozlowski: "J. Kozlowski, \"One mile level line\" (2016), jessekozlowski.wordpress.com: Route 206 mile posts 27-28, New Jersey; GNSS marks (NAD83, CORS NJTW and NJGC) and reciprocal zenith angles; 2016 and 2018 sessions from his \"Zenith Angle Projects\" table.",
  osm: "Map data © OpenStreetMap contributors, ODbL (openstreetmap.org/copyright).",
  schott: "C. A. Schott, The Transcontinental Triangulation and the American Arc of the Parallel, U.S. Coast and Geodetic Survey Special Publication No. 4 (1900): reciprocal zenith distances, Colorado, California, Round Top–Jackson Butte 1879.",
  mirages: "A. T. Young, An Introduction to Mirages (San Diego State University).",
  lehn: "W. H. Lehn, \"Atmospheric refraction and lake monsters\", Science 205 (1979) 183–185.",
  era5: "Copernicus Climate Change Service, ERA5 hourly data (13 June 2026, Caussols and the sea below); Météo-France AROME.",
  slides: "Dr John D., \"PIER2PIER 2 – Results & Observations\" (YouTube, youtu.be/uJ3TLdcVNfA): the Worthing–Brighton laser test, 23 February 2019; sites, heights, thermometer tables at both ends, tides.",
  brighton: "Metabunk, \"Why flat earth laser tests are misleading\": the Worthing–Brighton laser test, 1 mrad laser 1.0 m up, \"1.5°C thermal inversion over 2m\".",
  fews: "flatearth.ws, \"Flat-earth laser tests are misleading\": beam divergence and its arithmetic.",
};

export const CARDS = [
  { id: "cases", figs: ["refCasesCanvas"], src: ["young", "novaya"] },
  { id: "arc", figs: ["reffig0"], src: [] },
  { id: "snell", figs: ["refSnellCanvas"], src: ["young"] },
  { id: "circles", figs: ["refCirclesCanvas"], src: [] },
  { id: "dndh", figs: ["reffig1"], src: ["baselga"] },
  { id: "crossing", figs: ["reffig2"], src: ["young"] },
  { id: "subtract", figs: ["reffig3"], src: [] },
  { id: "morph", figs: ["refMorphCanvas"], fx: ["reffig3"], src: [] },
  { id: "kline", figs: ["reffig4"], src: ["baselga", "ams", "young", "igra"] },
  { id: "recip", figs: ["reffig5"], src: ["hirt", "ramsayer"] },
  // 2026-10-07 : la ligne de Kozlowski -- où (OSM figé), le dispositif, k séance par séance
  { id: "r206", figs: ["refR206Map", "refFigR206Setup", "refFigR206"], rows: [2, 1], labels: true, src: ["kozlowski", "osm"] },
  // 2026-10-31 (propriétaire : « certains graphiques sont super mais n'ont pas de format cartes ») : les figures de données
  // et de formules qui n'en avaient pas, puis la section laser
  { id: "layer", figs: ["refFxLayer"], fx: ["x:rf-gloss-nu"], fxFigs: false, src: ["mirages", "lehn"] },
  { id: "caus", figs: ["rfCausAir"], fx: ["rf-caus-fx"], src: ["young", "ams", "era5"], values: refValueLookup },
  { id: "zen", figs: ["refFxZen"], fx: ["rf-fx-sp4"], fxFigs: false, src: ["schott"], values: refValueLookup },
  { id: "zenhour", figs: ["refFigZenHour"], src: ["schott"], values: refValueLookup },
  { id: "igra", figs: ["refFigIgra"], src: ["igra"], values: refValueLookup },
  { id: "beam", figs: ["refFxLaser"], fx: ["rf-las-fx1"], fxFigs: false, src: ["fews"], values: refValueLookup },
  { id: "laser", figs: ["refLaserCanvas"], fx: ["rf-las-fx2"], src: ["slides", "brighton"], values: refValueLookup },
];
