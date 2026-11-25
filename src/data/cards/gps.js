// Cartes autonomes de l'onglet gps (epic11). Textes : src/i18n/<langue>/gps-cards.json.
import { cardValueLookup as V } from "../../tabs/gps/rawvalues.js";

export const SOURCES = {
  gpsgov: "GPS.gov — the Space Segment: 24 baseline slots, six orbital planes, ~20,200 km altitude.",
  uscg: "U.S. Coast Guard Navigation Center — GPS overview: 55° inclination, 11 h 58 min period.",
  navipedia: "ESA Navipedia — GPS Space Segment: semi-major axis 26,560 km, orbital speed 3.9 km/s.",
  pennstate: "Penn State GEOG 862, \"GPS and GNSS for Geospatial Professionals\".",
  bkg: "BKG GNSS Data Center, IGS archive (open): daily 30 s RINEX 3 observation files and the broadcast navigation message, 10 April 2025.",
  is200: "IS-GPS-200: the broadcast orbital elements, clock polynomial and the algorithm that turns them into a satellite position.",
  wgs84: "NIMA TR8350.2, World Geodetic System 1984 (3rd ed., 2000): a = 6,378.137 km, 1/f = 298.257 223 563.",
  ashby: "N. Ashby, \"Relativity in the Global Positioning System\", Living Reviews in Relativity (2003).",
};

export const CARDS = [
  { id: "spheres", figs: ["gpsTri"], src: ["pennstate"] },
  { id: "unknowns", figs: ["gpsfig0"], src: ["pennstate"] },
  { id: "ranges", figs: ["gpsfig1"], src: [] },
  { id: "sky", figs: ["gpsSky"], fx: ["gpsfig2"], reads: ["gpsLatRead"], src: ["gpsgov", "uscg"] },
  { id: "clock", figs: ["gpsRange"], src: [] },
  { id: "kepler", figs: ["gpsfig2"], src: ["navipedia"] },
  { id: "relativity", figs: ["gpsfig3"], src: ["navipedia", "ashby"] },
  // 2026-10-02 (epic16/UC03) : récepteurs bruts
  { id: "raw-map", values: V, figs: ["gpsRawMap"], src: ["bkg", "is200"] },
  { id: "raw-fit", values: V, figs: ["gpsRawFit"], src: ["bkg", "wgs84"] },
  { id: "fx-sphere", values: V, figs: ["gpsFxSphere"], src: ["bkg"] },
  { id: "raw-vis", values: V, figs: ["gpsRawVis"], src: ["bkg"] },
  { id: "raw-share", values: V, figs: ["gpsRawShare"], src: ["bkg", "navipedia"] },
  // l'ensemble « Solve it yourself » : schéma de la sphère, carte, ajustement, ciel croisé, limite géométrique
  { id: "solve", values: V, figs: ["gpsFxSphere", "gpsRawMap", "gpsRawFit", "gpsRawVis", "gpsRawShare"], rows: [1, 2, 2], labels: true,
    src: ["bkg", "is200", "wgs84", "navipedia"] },
];
