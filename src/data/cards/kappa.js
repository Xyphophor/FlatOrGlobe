// Cartes autonomes de l'onglet kappa (2026-11-27) : une par animation, plus la courbure de Gauss et l'excès d'un triangle ;
// la formule en bande sans redessiner sa figure (fxFigs: false). Textes : src/i18n/<langue>/kappa-cards.json ; {{clé}} =
// kappaValues. Les relevés des cinq méthodes sont simulés et chaque carte le dit.
import { kappaValues } from "../../tabs/kappa/logic.js";

const V = (lang) => { const v = kappaValues(lang); return (k) => String(v[k] ?? k); };

export const SOURCES = {
  gauss: "C. F. Gauss, Disquisitiones generales circa superficies curvas (Göttingen, 1827): K = κ₁κ₂, the theorema egregium, the angle excess of a geodesic triangle.",
  euler: "L. Euler, “Recherches sur la courbure des surfaces”, Mém. Acad. Berlin 16 (1760) 119–143: the principal curvatures.",
  leibniz: "G. W. Leibniz, “Meditatio nova de natura anguli contactus et osculi”, Acta Eruditorum (1686): the osculating circle.",
  girard: "A. Girard, Invention nouvelle en l'algèbre (Amsterdam, 1629): the area of a spherical triangle and its angle excess.",
  bdp: "J. Bertrand, C.-F. Diguet, V. Puiseux, J. Math. Pures Appl. 13 (1848) 80–90: the curvature from the circumference of a small circle.",
  docarmo: "M. P. do Carmo, Differential Geometry of Curves and Surfaces (Prentice-Hall, 1976): κ = dθ/ds, principal and Gaussian curvatures.",
  flat: "Encyclopædia Britannica, “Flat Earth”: in some modern flat-earth models the Sun circles about 5,500 km above the disc.",
};

export const CARDS = [
  { id: "def", figs: ["kappaAnimDef"], fx: ["ka-fx-kappa"], fxFigs: false, values: V, src: ["docarmo", "leibniz", "euler", "gauss"] },
  { id: "surf", figs: ["kapFxSurf"], fx: ["ka-fx-gauss"], fxFigs: false, values: V, src: ["euler", "gauss"] },
  { id: "inside", figs: ["kapFxTri", "kapFxCirc"], fx: ["ka-fx-girard"], fxFigs: false, values: V, src: ["girard", "gauss", "bdp"] },
  { id: "dip", figs: ["kappaAnimDip"], fx: ["ka-fx-dip"], fxFigs: false, values: V, src: [] },
  { id: "zen", figs: ["kappaAnimZen"], fx: ["ka-fx-zen"], fxFigs: false, values: V, src: [] },
  { id: "tri", figs: ["kappaAnimTri"], fx: ["ka-fx-girard"], fxFigs: false, values: V, src: ["girard", "gauss"] },
  { id: "circ", figs: ["kappaAnimCirc"], fx: ["ka-fx-circum"], fxFigs: false, values: V, src: ["bdp"] },
  { id: "erat", figs: ["kappaAnimErat"], fx: ["ka-fx-erat"], fxFigs: false, values: V, src: ["flat"] },
  { id: "fail", figs: ["kapFxFit", "kapFxFail"], fx: ["ka-fx-fit"], fxFigs: false, values: V, src: [] },   // avec le graphe de l'ajustement (propriétaire : « une carte commune avec le graphe juste au-dessus »)
  { id: "travel", figs: ["kappaAnimTravel"], fx: ["ka-fx-trav"], fxFigs: false, values: V, src: [] },
];
