// Cartes autonomes de l'onglet sat (epic27, 2026-10-16 ; 2026-10-17 : cartes des figures de données, demande du
// propriétaire). Textes : src/i18n/<langue>/sat-cards.json ; les chiffres {{clé}} viennent des données (tabs/sat/values.js).
import { satValueLookup } from "../../tabs/sat/values.js";
export const SOURCES = {
  igs: "International GNSS Service: RINEX 3 observation files of 80 stations, 2025-04-10 (BKG open archive); Johnston et al., Springer Handbook of GNSS (2017).",
  mg: "O. Montenbruck, E. Gill, Satellite Orbits (Springer, 2000): J₂, Sun and Moon perturbations, numerical integration.",
  wgs84: "NIMA TR8350.2 (2000), World Geodetic System 1984: a = 6,378.137 km, 1/f = 298.257, for comparison only.",
  iers: "G. Petit, B. Luzum (eds.), IERS Conventions (2010), IERS Technical Note 36: accepted GM and Ω, for comparison only.",
};
export const CARDS = [
  { id: "pass", figs: ["satAnimPass"], fx: ["satFxDop"], src: ["igs"] },
  { id: "ball", figs: ["satAnimBall"], fx: ["satFxModel"], src: ["igs", "mg", "iers"], values: satValueLookup },
  { id: "radius", figs: ["satFigBall"], src: ["igs", "wgs84"], values: satValueLookup },
  // 2026-11-25 (propriétaire : la carte Kepler « désastreuse ») : l'animation seule, pleine largeur ; le graphique des GM par
  // satellite, qui lui prenait la moitié de la place en colonne, a sa carte (kepgm)
  { id: "kepler", figs: ["satAnimKep"], fx: ["sat-fx-kep"], fxFigs: false, src: ["igs", "mg"], values: satValueLookup },
  { id: "kepgm", figs: ["satFigKep"], fx: ["sat-fx-kep"], fxFigs: false, src: ["igs", "mg"], values: satValueLookup },
  { id: "flat", figs: ["satFigFlat"], src: ["igs"], values: satValueLookup },
];
