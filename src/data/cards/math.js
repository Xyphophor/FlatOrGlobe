// Cartes autonomes de l'onglet math (2026-11-27, reprises de l'onglet phys quand Basics a été coupé en Math et Physics).
// fxFigs: false garde les formules en bande sans les redessiner en petit.
// Textes : src/i18n/<langue>/math-cards.json ; {{clé}} = valeur de physValues (src/tabs/phys/logic.js : petits angles, pendule).
import { physValues } from "../../tabs/phys/logic.js";

const V = (lang) => { const v = physValues(lang); return (k) => String(v[k] ?? k); };

export const SOURCES = {
  si: "BIPM, The International System of Units (SI), 9th edition (2019): the seven defining constants.",
  calc: "G. W. Leibniz, Acta Eruditorum (1684) 467; I. Newton, Method of Fluxions (1736); J.-L. Lagrange, Théorie des fonctions analytiques (1797).",
  gum: "JCGM 100:2008, Guide to the expression of uncertainty in measurement (GUM), § 4.2.",
  lsq: "A.-M. Legendre, Nouvelles méthodes pour la détermination des orbites des comètes (1805); C. F. Gauss, Theoria motus (1809).",
  huygens: "C. Huygens, Horologium oscillatorium (1673): the pendulum and the centrifugal force.",
  lidarhd: "IGN, LiDAR HD: 1 m bare-ground terrain model of France.",
  cop: "ESA / Airbus, Copernicus DEM GLO-30: 30 m surface model of the globe.",
};

export const CARDS = [
  { id: "angles", figs: ["mathFxRad", "mathFxSmall"], fx: ["math-fx-rad", "math-fx-small"], fxFigs: false, labels: true, values: V, src: ["si"] },
  { id: "vectors", figs: ["mathFxChasles", "mathFxComp", "mathFxSub"], fx: ["math-fx-chasles", "math-fx-comp", "math-fx-sub"], fxFigs: false, rows: [1, 2], labels: true, src: [] },
  { id: "deriv", figs: ["mathFxTangent", "mathFxArea", "mathFxGrad"], fx: ["math-fx-tangent", "math-fx-area", "math-fx-grad"], fxFigs: false, rows: [1, 2], labels: true, src: ["calc"] },
  { id: "sigma", figs: ["mathFxSigma", "mathFigTargets"], fx: ["math-fx-sigma"], fxFigs: false, labels: true, values: V, src: ["gum", "huygens"] },
  { id: "lsq", figs: ["mathFxLsq"], fx: ["math-fx-lsq"], fxFigs: false, values: V, src: ["lsq"] },
  { id: "demmesh", figs: ["mathAnimDem"], fx: ["math-fx-bilin"], fxFigs: false, src: ["lidarhd", "cop"] },
];
