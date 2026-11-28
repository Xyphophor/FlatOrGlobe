// Logique pure du « rayon à plusieurs » (panneau GPS brut, epic16/UC05).
//
// Chaque participant résout SON journal dans SA page (userlogic.js) ; la page en tire un
// code texte qu'il partage lui-même (message, forum) : aucun serveur, rien n'est stocké
// par le site. On colle les codes des autres et la page ajuste une sphère sur le groupe
// SEUL, centre et rayon libres, avec la même formule que pour les stations
// (|xⱼ − c| = R, rawlogic.fitSphere), et le meilleur plan en comparaison (fitPlane).
//
// Le code contient la position ECEF ARRONDIE au pas choisi par le participant (1 km par
// défaut, 10 km, ou exacte) : c'est ce qu'il révèle de lui, et la page lui montre la
// latitude/longitude correspondante avant qu'il le copie. Format lisible, sans
// encodage, pour que chacun voie ce qu'il partage :
//   FOG1|nom|aaaammjj|pas (m)|x|y|z|rms (dm)|époques|systèmes|contrôle
// x, y, z : en unités du pas (entiers). Contrôle : FNV-1a 32 bits du reste, en base 36 ;
// il détecte une faute de copie, PAS une falsification : un code peut être inventé.
import { fitSphere, fitPlane, solveLin } from "../gps/rawlogic.js";
import { geodetic } from "./userlogic.js";

const norm = (v) => Math.hypot(v[0], v[1], v[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const STEPS = [1000, 10000, 1];       // pas d'arrondi proposés (m) : 1 km par défaut

function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

/** Nom libre réduit à des caractères sûrs (pas de « | »), 20 au plus ; vide = anonyme. */
export const cleanName = (s) => String(s || "").normalize("NFC").replace(/[^\p{L}\p{N} _.'-]/gu, "").trim().slice(0, 20);

/** La position que le code révèle : x arrondi à `step` mètres sur chaque axe. */
export const roundXyz = (x, step) => x.map((v) => Math.round(v / step) * step);

/** Code d'un participant. r = résultat de solveLog ; date = "2026-10-02". */
export function encodeCode({ name, date, x, step, rms, n, systems }) {
  const body = ["FOG1", cleanName(name), date.replaceAll("-", ""), step, ...x.map((v) => Math.round(v / step)), Math.round(rms * 10), n, systems.join("")].join("|");
  return `${body}|${fnv(body)}`;
}

/** Lit un code ; lève une erreur lisible si le format ou le contrôle est faux. */
export function decodeCode(code) {
  const s = String(code).trim(), f = s.split("|");
  if (f[0] !== "FOG1" || f.length !== 11) throw new Error("format");
  if (fnv(f.slice(0, 10).join("|")) !== f[10]) throw new Error("checksum");
  const step = Number(f[3]), x = [f[4], f[5], f[6]].map((v) => Number(v) * step);
  if (!(step > 0) || x.some((v) => !Number.isFinite(v)) || !/^\d{8}$/.test(f[2])) throw new Error("format");
  return { code: s, name: f[1], date: `${f[2].slice(0, 4)}-${f[2].slice(4, 6)}-${f[2].slice(6)}`, step, x, rms: Number(f[7]) / 10, n: Number(f[8]), systems: f[9].split("") };
}

/**
 * Sphère et plan sur le groupe seul. parts = [{name, x (m), step (m)}], au moins 4 points
 * distincts (4 inconnues : centre et rayon). Incertitude sur R, deux estimations, on garde
 * la plus grande (règle 6 : ne pas se flatter) :
 *   — bruit : chaque point est incertain de σᵢ = pas/√12 (arrondi uniforme) et ~20 m
 *     (fix d'un téléphone), propagé par la jacobienne de l'ajustement, (JᵀWJ)⁻¹ ;
 *   — dispersion : s'il y a plus de 4 points, les résidus réels (altitudes différentes,
 *     aplatissement) remis à l'échelle, s² = Σres²/(n − 4) ; null à 4 points.
 * Renvoie { n, R, c, sigmaR, rms, planeRms, spanKm (plus grande distance), sagKm
 * (bombement attendu sur cette distance), res: [m], latRange } ou null.
 */
export function groupFit(parts) {
  const P = parts.map((p) => p.x);
  if (P.length < 4) return null;
  const F = fitSphere(P), n = P.length;
  if (!Number.isFinite(F.R)) return null;
  const J = P.map((p) => { const d = sub(p, F.c), r = norm(d); return [-d[0] / r, -d[1] / r, -d[2] / r, -1]; });
  const w = parts.map((p) => 1 / ((p.step ** 2) / 12 + 20 ** 2));
  const inv = (W) => {
    const A = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => J.reduce((q, row, k) => q + W[k] * row[i] * row[j], 0)));
    return solveLin(A, [0, 0, 0, 1])[3];          // élément (R, R) de l'inverse
  };
  const noise = Math.sqrt(Math.abs(inv(w)));
  // à 4 points l'ajustement passe exactement par eux : aucune dispersion à juger (null, dit dans la page)
  const scatter = n > 4 ? Math.sqrt(Math.abs(inv(new Array(n).fill(1))) * F.res.reduce((q, r) => q + r * r, 0) / (n - 4)) : null;
  let span = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) span = Math.max(span, norm(sub(P[i], P[j])));
  const lats = P.map((p) => geodetic(p).lat);
  return {
    n, R: F.R, c: F.c, sigmaR: Math.max(noise, scatter ?? 0), noise, scatter, rms: F.rms, res: F.res,
    planeRms: fitPlane(P).rms, spanKm: span / 1000, sagKm: (F.R - Math.sqrt(Math.max(0, F.R ** 2 - (span / 2) ** 2))) / 1000,
    latRange: [Math.min(...lats), Math.max(...lats)],
  };
}

/**
 * Coupe du groupe pour la figure : chaque point par sa hauteur au-dessus du meilleur plan
 * (y) et sa distance horizontale à l'axe qui passe par le centre de la sphère,
 * perpendiculaire au plan (rho). Un point sur la sphère vérifie exactement
 * y = cy + √(R² − rho²) : la courbe tracée. Renvoie { pts: [{rho, y}] (km), curve(rho) → y (km) }.
 */
/**
 * r de l'encadré d'ajustement (2026-11-27, règle de l'onglet courbure) : la hauteur de chaque point au-dessus du meilleur plan
 * contre la hauteur que prédit la sphère ajustée (centre c, rayon R : le point ramené sur la sphère le long du rayon). Vaut à
 * toute échelle, du groupe local au réseau mondial ; le plan prédit zéro partout.
 */
export function heightCorr(P, c, R) {
  const n = P.length, m = [0, 1, 2].map((i) => P.reduce((q, p) => q + p[i], 0) / n), nv = fitPlane(P).normal;
  const ys = P.map((p) => dot3(sub(p, m), nv));
  const ps = P.map((p) => { const d = sub(p, c), k = R / norm(d); return dot3(sub([c[0] + d[0] * k, c[1] + d[1] * k, c[2] + d[2] * k], m), nv); });
  const my = ys.reduce((a, b) => a + b, 0) / n, mp = ps.reduce((a, b) => a + b, 0) / n;
  let a = 0, b = 0, d = 0; for (let i = 0; i < n; i++) { a += (ys[i] - my) * (ps[i] - mp); b += (ys[i] - my) ** 2; d += (ps[i] - mp) ** 2; }
  return a / Math.sqrt(b * d);
}

export function bulge(parts, G) {
  const P = parts.map((p) => p.x), n = P.length, m = [0, 1, 2].map((i) => P.reduce((q, p) => q + p[i], 0) / n);
  let nv = fitPlane(P).normal;
  if (dot3(sub(m, G.c), nv) < 0) nv = nv.map((v) => -v);   // normale tournée vers l'extérieur de la sphère
  const cy = dot3(sub(G.c, m), nv), foot = G.c.map((v, i) => v - cy * nv[i]);  // pied de l'axe dans le plan
  const pts = P.map((p) => { const d = sub(p, m), y = dot3(d, nv), h = sub(sub(p, foot), nv.map((v) => v * y)); return { rho: norm(h) / 1000, y: y / 1000 }; });
  return { pts, curve: (rho) => (cy + Math.sqrt(Math.max(0, G.R ** 2 - (rho * 1000) ** 2))) / 1000 };
}
