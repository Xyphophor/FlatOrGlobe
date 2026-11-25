// Cartes autonomes de l'onglet avia (epic11 ; demande du propriétaire du 2026-09-30 :
// « mets des cartes pour les animations etc. »). Textes : src/i18n/<langue>/avia-cards.json ;
// leurs chiffres ({{clé}}) sont ceux du texte de la page, calculés (values.js cardValueLookup).
// Une carte par animation -- celles qui font choisir un modèle (aviaEot, aviaDG, aviaGC)
// montrent chaque modèle (« id@variante », règle du propriétaire) -- et une par schéma de formule.
import { cardValueLookup } from "../../tabs/avia/values.js";
import { aviaMeshValues } from "../../tabs/avia/meshfig.js";
const VM = (lang) => { const a = aviaMeshValues(), b = cardValueLookup(lang); return (k) => a[k] ?? b(k); };

export const SOURCES = {
  "faa-ai": "FAA, Instrument Flying Handbook, FAA-H-8083-15B, ch. 5: attitude indicators and their erection mechanism.",
  "faa-hi": "FAA, Pilot's Handbook of Aeronautical Knowledge, FAA-H-8083-25C, ch. 8: the heading indicator's drift, up to 15° per hour.",
  hdg: "Heading indicator: Earth-rate drift ω sin(latitude), opposite in the two hemispheres; the latitude nut.",
  vectornav: "VectorNav, Inertial Navigation Primer: gyrocompassing, 15°/h × cos(latitude) towards north.",
  honeywell: "Honeywell, Laseref V Micro Inertial Reference System — Product Description (2004): laser gyros, alignment times by latitude.",
  schuler: "M. Schuler, Physikalische Zeitschrift 24 (1923): Schuler tuning, period 2π√(R/g) ≈ 84.4 minutes.",
  carpenter: "J. R. Carpenter & I. Y. Bar-Itzhack, \"Schuler period in LEO satellites\", NASA GSFC (NTRS 20040040118).",
  cfr: "14 CFR Part 121, Appendix G: inertial navigation, at most 2 nautical miles per hour of error on flights up to 10 hours.",
  aaib: "AAIB Bulletin 12/2019, Boeing 737-8AS EI-GJT, serious incident of 9 October 2018 (Porto–Edinburgh).",
  flightaware: "FlightAware, public flight pages: wheels-off and wheels-on times and filed cruise speeds, read on 2026-09-28.",
  snyder: "J. P. Snyder, Map Projections — A Working Manual, USGS Professional Paper 1395 (1987): the azimuthal equidistant projection.",
  fai: "Fédération Aéronautique Internationale: One More Orbit, Gulfstream G650ER, around the world over both poles, 9–11 July 2019.",
  omo: "One More Orbit, Mission Statistics: legs, distance and average speed.",
  "fai-pa50": "Fédération Aéronautique Internationale, record 3796: speed around the world over both poles, Boeing 747SP, 28 October 1977, 784.31 km/h.",
  af1995: "UPI, \"Concorde lands, breaking speed record\", 16 August 1995: Air France Concorde, Kennedy Airport eastbound via Toulouse, Dubai, Bangkok, Guam, Honolulu and Acapulco, 31 h 27 min 49 s, 25,252 statute miles (40,638 km).",
  concorde: "Concorde: average cruise speed Mach 2.02, about 2,150 km/h.",
  b747sp: "Boeing 747SP specifications: maximum speed Mach 0.92 (about 980 km/h at cruise altitude).",
  pa50: "Airways Magazine, \"Pan Am's Polar Flight Around the World\": Flight 50, San Francisco and return over both poles, 54 h 7 min 12 s.",
  isa: "International Standard Atmosphere (ICAO Doc 7488; ISO 2533:1975): 1,013.25 hPa at sea level, 6.5 K/km below 11 km.",
  eotvos: "L. Eötvös, Annalen der Physik 364(16), 743–752 (1919): the change of weight of a body moving east or west.",
  harlan: "R. B. Harlan, \"Eötvös corrections for airborne gravimetry\", J. Geophys. Res. 73(14), 4675–4679 (1968).",
  "gravd-manual": "NOAA NGS, GRAV-D General Airborne Gravity Data User Manual, v2.1 (2017): corrections for aircraft motion.",
  en02: "NOAA NGS, GRAV-D Block EN02 airborne gravity data (2013): east–west lines over Lake Erie, 2011.",
};

const V = cardValueLookup;
const MODELS3 = (id) => [`${id}@globe`, `${id}@still`, `${id}@disc`];
export const CARDS = [
  { id: "level", values: V, figs: ["aviaLevel"], fx: ["aviaFxLevel"], src: ["faa-ai"] },
  { id: "fx-level", values: V, figs: ["aviaFxLevel"], src: ["faa-ai"] },
  { id: "forces", values: V, figs: ["aviaForces"], fx: ["aviaFxRope"], src: ["isa"] },
  { id: "eot-scale", values: V, figs: ["aviaEotScale"], fx: ["aviaFxEot"], src: ["en02", "eotvos"] },
  { id: "eot", values: V, figs: ["aviaEot@0", "aviaEot@1", "aviaEot@2"], fx: ["aviaFxEot"], labels: true, src: ["en02", "eotvos", "harlan"] },
  { id: "eot-k", values: V, figs: ["aviaEotK"], src: ["gravd-manual", "harlan", "en02"] },
  { id: "eot-fit", values: V, figs: ["aviaEotFit"], fx: ["aviaFxEotFit"], src: ["en02", "harlan"] },
  { id: "fx-eotfit", values: V, figs: ["aviaFxEotFit"], src: ["en02"] },
  { id: "fx-eot", values: V, figs: ["aviaFxEot"], src: ["eotvos", "gravd-manual"] },
  { id: "dg", values: V, figs: MODELS3("aviaDG"), fx: ["aviaFxGyro"], labels: true, src: ["faa-hi", "hdg"] },
  { id: "gc", values: V, figs: MODELS3("aviaGC"), fx: ["aviaFxGyro"], labels: true, reads: ["aviaGCLatv"], src: ["honeywell", "aaib", "vectornav"] },
  { id: "fx-gyro", values: V, figs: ["aviaFxGyro"], src: ["vectornav", "hdg"] },
  { id: "schuler", values: V, figs: ["aviaSchuler"], fx: ["aviaFxSchuler"], src: ["schuler", "carpenter", "cfr"] },
  { id: "fx-schuler", values: V, figs: ["aviaFxSchuler"], src: ["schuler", "carpenter"] },
  { id: "gjt", values: V, figs: ["aviaGJT"], fx: ["aviaFxGjt"], src: ["aaib"] },
  { id: "fx-gjt", values: V, figs: ["aviaFxGjt"], src: ["aaib"] },
  { id: "race", values: V, figs: ["aviaRace@SYD-SCL"], fx: ["aviaFxDist"], labels: true, src: ["flightaware", "snyder"] },
  { id: "omo", values: V, figs: ["aviaWorld@OMO"], fx: ["aviaFxWorld"], labels: true, src: ["fai", "omo"] },
  // 2026-10-01 : tours du monde est-ouest et nord-sud, la corde
  { id: "world", values: V, figs: ["aviaWorld@SOUTH"], fx: ["aviaFxWorld"], labels: true, src: ["flightaware", "snyder"] },
  // 2026-10-19 (propriétaire : « il manque l'option pour le dernier ») : le quatrième tour de la liste, qui ne tranche pas
  { id: "af1995", values: V, figs: ["aviaWorld@AF1995"], fx: ["aviaFxWorld"], labels: true, src: ["af1995", "concorde", "snyder"] },
  { id: "pa50", values: V, figs: ["aviaWorld@PA50"], fx: ["aviaFxWorld"], labels: true, src: ["fai-pa50", "pa50", "b747sp"] },
  { id: "fx-world", values: V, figs: ["aviaFxWorld"], src: ["snyder"] },
  { id: "fx-rope", values: V, figs: ["aviaFxRope"], src: ["faa-ai"] },
  { id: "fx-dist", values: V, figs: ["aviaFxDist"], src: ["snyder", "flightaware"] },
  { id: "springs", values: V, figs: ["aviaSprings"], fx: ["aviaFxSprings"], src: ["flightaware"] },
  // 2026-11-25 : la forme sortie des seuls temps de vol (la méthode des séismes, core/shape-reel.js)
  { id: "mesh", values: VM, figs: ["aviaMesh"], reads: ["aviaMeshReads"], fx: ["avia-fx-mesh"], fxFigs: false, src: ["flightaware"] },
  { id: "fx-mesh", values: V, figs: ["aviaFxMesh"], src: ["flightaware"] },
  { id: "bearings", values: V, figs: ["aviaBearings"], fx: ["aviaFxSprings"], src: ["flightaware"] },
  { id: "fx-springs", values: V, figs: ["aviaFxSprings"], src: ["flightaware"] },
  { id: "radius", values: V, figs: ["aviaRadius"], fx: ["aviaFxRadius"], src: ["flightaware"] },
  { id: "fx-radius", values: V, figs: ["aviaFxRadius"], src: ["flightaware"] },
];
