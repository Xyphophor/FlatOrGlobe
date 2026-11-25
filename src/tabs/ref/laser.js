// Section laser de l'onglet ref (propriétaire, 2026-10-31 : « le faisceau est divergent et les mesures sont souvent faites la
// nuit près de l'eau, donc avec les pires conditions »). Logique pure, sur le VRAI test (recalé le 2026-10-31 sur les
// diapositives des opérateurs envoyées au propriétaire) : Worthing Pier ↔ Brighton West Pier, 23 février 2019 vers 20 h 48 UTC,
// 15,3 km, laser (1 mrad) et caméra à 1 m au-dessus de l'eau, 1033,6 hPa (ERA5), ~8 °C. Chaque rayon du faisceau est tracé
// dans l'air de leurs propres thermomètres (profil par morceaux, gradient standard au-dessus du dernier relevé), le MÊME air
// pour le globe (h'' = (1 − k(h))/R, h au-dessus de la sphère) et pour le plan (h'' = −k(h)/R) : règle des marges symétriques.
// L'eau réfléchit presque tout à incidence rasante (quelques milliradians) : un rayon qui la touche repart vers le haut.
import { refK, REF_R } from "./logic.js";

/** Le dispositif : distance (m), hauteurs du laser et de l'œil (m), divergence totale (rad), air (hPa, K), rayons, pas. */
export const LAS = { D: 15300, hL: 1, hE: 1, theta: 1e-3, P: 1033.6, T: 281.15, z0: 0.01, n: 81, dx: 20, ad: 10 };

/** k pour un gradient dT/dh (K/m), à la pression et la température du soir (S : un autre dispositif, même forme que LAS). */
export const lasKg = (g, S = LAS) => refK(g, S.P, S.T);
/** Le gradient qui donne k (inverse de lasKg). */
const gFor = (k) => k / refK(0, LAS.P, LAS.T) * 0.0342 - 0.0342;
const G_STD = gFor(0.13), G_VAC = -0.0342;

/**
 * Leurs relevés (°C, hauteur en m) ; « above water » posé à 5 cm. Deux thermomètres à Worthing (« 7.5 / <7.0 ») : A, le
 * premier chiffre de chaque case (B, décalé d'environ −0,5 °C, donne la même forme et le même verdict) ; Brighton : 7,0 dans
 * l'eau et à 1,78 m, « indiscernables » entre les deux à ±0,25 °C.
 */
export const WORTHING_A = [[0.05, 7.5], [0.5, 8.0], [1.0, 8.0], [1.5, 8.0], [2.0, 9.0]];
export const WORTHING_B = [[0.05, 7.0], [0.5, 7.5], [1.0, 7.5], [1.5, 7.5], [2.0, 8.5]];
export const BRIGHTON = [[0, 7.0], [1.78, 7.0]];

/** Les quatre airs de la figure, dans l'ordre de l'animation : { key, g } (uniforme) ou { key, prof, top }. */
export const LAS_AIRS = [
  { key: "vac", g: G_VAC },
  { key: "std", g: G_STD },
  { key: "worthing", prof: WORTHING_A, top: G_STD },
  { key: "brighton", prof: BRIGHTON, top: G_STD },
];

/** dT/dh (K/m) à la hauteur h dans un air ; sous le premier relevé, le gradient du premier segment. */
export function lasGrad(air, h) {
  if (!air.prof) return air.g;
  const p = air.prof;
  for (let i = 1; i < p.length; i++) if (h <= p[i][0] || i === 1 && h < p[0][0]) return (p[i][1] - p[i - 1][1]) / (p[i][0] - p[i - 1][0]);
  return air.top;
}
/** k à la hauteur h. */
export const lasK = (air, h, S = LAS) => lasKg(lasGrad(air, h), S);

/**
 * Un rayon tiré à l'angle a (rad, positif vers le haut) depuis hL, tracé jusqu'à D. globe = vrai : h'' = (1 − k)/R ; sinon
 * h'' = −k/R. Renvoie { pts: [[x, h, n]…] (un point tous les `every` pas et deux
 * à chaque rebond ; n = rebonds déjà faits), end (hauteur à D), bounces }.
 */
export function lasRay(air, a, globe, every = 2, S = LAS) {
  const { D, hL, dx } = S;
  let x = 0, h = hL, s = a, b = 0, i = 0;
  const pts = [[0, h, 0]];
  const acc = (hh) => ((globe ? 1 : 0) - lasK(air, hh, S)) / REF_R;
  while (x < D) {
    const st = Math.min(dx, D - x, Math.max(0.2, S.ad * (h + S.z0)));   // pas réduit près de l'eau, où k est grand
    // pas du point milieu (la courbure varie avec h)
    const hm = h + s * st / 2, sm = s + acc(h) * st / 2;
    h += sm * st; s += acc(Math.max(hm, 0)) * st; x += st;
    if (h < 0) { pts.push([x, 0, b]); h = -h; s = -s; b++; pts.push([x, 0, b]); }   // l'eau, miroir à incidence rasante (eau calme)
    if (++i % every === 0 || x >= D) pts.push([x, h, b]);
  }
  return { pts, end: h, bounces: b };
}

/**
 * Le faisceau entier : n rayons de −θ/2 à +θ/2. seen = l'œil (hE) est entre les arrivées de deux rayons voisins (la carte
 * angle → hauteur d'arrivée est continue, même repliée par l'eau) ; direct = vu par deux rayons qui n'ont pas touché l'eau ; lo/hi = plus basse et plus haute arrivée à D.
 */
export function lasBeam(air, globe, every = 2, S = LAS) {
  const { n, theta, hE } = S, rays = [];
  for (let i = 0; i < n; i++) rays.push(lasRay(air, -theta / 2 + theta * i / (n - 1), globe, every, S));
  let seen = false, direct = false, lo = Infinity, hi = -Infinity, bounced = 0;
  rays.forEach((r, i) => { lo = Math.min(lo, r.end); hi = Math.max(hi, r.end); if (r.bounces) bounced++;
    if (i && (rays[i - 1].end - hE) * (r.end - hE) <= 0) { seen = true; if (!r.bounces && !rays[i - 1].bounces) direct = true; } });
  return { rays, seen, direct, lo, hi, bounced };
}

/** Distance à laquelle le bord bas d'un faisceau tiré à niveau atteint l'eau, lumière droite sur un plan : 2h/θ. */
export const lasEdgeDist = (h = LAS.hL, theta = LAS.theta) => 2 * h / theta;

/** Le k uniforme qu'il faut pour qu'un œil à hE voie une source à hL à la distance D (R_eff ≥ D²/2(√hL + √hE)²). */
export const lasKNeed = (S = LAS) => 1 - REF_R * 2 * (Math.sqrt(S.hL) + Math.sqrt(S.hE)) ** 2 / (S.D * S.D);
/** La hauteur cachée de la source, lumière à rayon effectif Re (œil à hE). */
export const lasHidden = (Re = REF_R, S = LAS) => { const d0 = Math.sqrt(2 * S.hE * Re); return d0 >= S.D ? 0 : (S.D - d0) ** 2 / (2 * Re); };
/** Le gradient (K/m) qui donne k, à la pression et la température de S. */
export const lasGFor = (k, S = LAS) => k / refK(0, S.P, S.T) * 0.0342 - 0.0342;

/** Les nombres de la section (span.cv), dans la langue de la page. */
export function lasValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const kN = lasKNeed(), gN = gFor(kN), w = LAS_AIRS[2];
  return { lasW: nf(LAS.theta * LAS.D, 1), lasEdge: nf(lasEdgeDist() / 1000), lasD: nf(LAS.D / 1000, 1), lasBulge: nf(LAS.D * LAS.D / (8 * REF_R), 1),
    lasHid: nf(lasHidden(), 1), lasHidK: nf(lasHidden(REF_R / 0.87), 1), lasKNeed: nf(kN, 2), lasGNeed: nf(gN, 3), lasG2: nf(gN * 2, 2),
    lasKw1: nf(lasK(w, 0.3), 0), lasKw2: nf(lasK(w, 1.75), 0), lasKb: nf(lasK(LAS_AIRS[3], 1), 2) };
}
