// Lois de projection des objectifs, partagées par star (figure trace contre
// cercle) et curv (l'horizon à travers chaque objectif). Portées du legacy
// (star, PROJ_LENSES ~L673 de src/tabs/star/star-legacy.js avant epic13),
// passées en RADIANS : r(θ) = distance au centre de l'image, en unités de
// focale, pour un angle θ à l'axe optique.
//
// La focale ne déforme rien (changer f multiplie l'image par une constante :
// un zoom) ; ce qui change les formes, c'est la LOI et la distorsion
// résiduelle. Toutes ces lois sont RADIALES : un point bouge le long du rayon
// qui le joint au centre, son angle polaire ne change jamais. Les
// coefficients de barillet sont des ordres de grandeur typiques de leur
// classe d'objectif, pas la mesure d'un modèle précis.
const T = Math.tan;
const barrel = (k2, k4 = 0) => (t) => { const x = T(t); return x * (1 - k2 * x * x + k4 * x ** 4); };

/** k = clé (libellé : t("lens-"+k) du dictionnaire star) ; thetaMax = limite où r(θ) cesse de croître ; rect = garde les droites (au barillet près). */
export const LENSES = [
  // rectilinéaires -- grand angle, de plus en plus court
  { k: "r35", r: (t) => T(t), inv: (r) => Math.atan(r), thetaMax: Math.PI / 2, rect: true },
  { k: "r20", r: barrel(0.030), thetaMax: Math.atan(Math.sqrt(1 / 0.09)), rect: true },
  { k: "r14", r: barrel(0.090), thetaMax: Math.atan(Math.sqrt(1 / 0.27)), rect: true },
  { k: "tel", r: barrel(0.055, 0.012), thetaMax: Math.PI / 2, rect: true },   // dérivée > 0 partout
  // non rectilinéaires -- les quatre lois qu'on rencontre réellement
  { k: "eqs", r: (t) => 2 * Math.sin(t / 2), inv: (r) => (r < 2 ? 2 * Math.asin(r / 2) : null), thetaMax: Math.PI },
  { k: "eqd", r: (t) => t, inv: (r) => (r < Math.PI ? r : null), thetaMax: Math.PI },
  { k: "ster", r: (t) => 2 * Math.tan(t / 2), inv: (r) => 2 * Math.atan(r / 2), thetaMax: Math.PI },
  { k: "ort", r: (t) => Math.sin(t), inv: (r) => (r < 1 ? Math.asin(r) : null), thetaMax: Math.PI / 2 },
];
const ALIAS = { rect: "r35", fish: "eqd" };
const EXTRA = new Map();          // lois d'objectifs réels (curv : caméras), hors de la liste de star

/** Famille r = tan(kθ)/k : k = 1 rectilinéaire, 0,5 stéréographique, k -> 0 équidistant. */
export function tanLaw(key, k) {
  return { k: key, r: (t) => Math.tan(k * t) / k, inv: (r) => Math.atan(k * r) / k,
    thetaMax: Math.min(Math.PI, Math.PI / (2 * k)), rect: false, kLaw: k };
}
export function registerLens(L) { EXTRA.set(L.k, L); return L; }

/** Clé (huit lois, alias, loi enregistrée) ou objet loi -> loi. */
export function lens(k) {
  if (k && typeof k === "object") return k;
  return EXTRA.get(k) || LENSES.find((L) => L.k === (ALIAS[k] || k)) || LENSES[0];
}

// inverse r -> θ (lois à barillet) : table monotone + recherche dichotomique (appelée une fois par pixel)
const N = 4096, INV = new Map();
export function invLens(L, r) {
  if (L.inv) return r <= 0 ? 0 : L.inv(r);                 // forme close quand elle existe
  let tab = INV.get(L.k);
  if (!tab) {
    const hi = L.thetaMax * (1 - 1e-6), th = new Float64Array(N + 1), rr = new Float64Array(N + 1);
    for (let i = 0; i <= N; i++) { th[i] = (hi * i) / N; rr[i] = L.r(th[i]); }
    INV.set(L.k, (tab = { th, rr }));
  }
  const { th, rr } = tab;
  if (r <= 0) return 0;
  if (r >= rr[N]) return null;
  let lo = 0, up = N;
  while (up - lo > 1) { const m = (lo + up) >> 1; if (rr[m] <= r) lo = m; else up = m; }
  const f = (r - rr[lo]) / (rr[up] - rr[lo]);
  const t0 = th[lo] + f * (th[up] - th[lo]);
  // un pas de Newton pour gommer l'interpolation
  const h = 1e-7, d = (L.r(t0 + h) - L.r(t0 - h)) / (2 * h);
  return d > 0 ? t0 - (L.r(t0) - r) / d : t0;
}

/** Champ horizontal maximal (degrés) pour un cadre d'aspect H/W : le coin doit rester sous thetaMax (rectilinéaires). */
export function maxFov(L, aspect = 2 / 3) {
  if (!L.rect) return 180;
  let lo = 1, hi = 179;
  const ok = (fov) => { const a = (fov * Math.PI) / 360, rEdge = L.r(a);
    if (!(a < L.thetaMax) || !(rEdge > 0)) return false;
    const inv = invLens(L, rEdge * Math.hypot(1, aspect)); return inv != null; };
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; }
  return Math.floor(lo);
}
