// Epic12 (2026-09-27) : inclinaisons MESURÉES dans les observatoires
// magnétiques (moyennes annuelles du World Data Centre d'Édimbourg,
// src/data/presets/mag-obs.js, reconstruit par `fog build mag-obs`)
// confrontées aux modèles de l'onglet. Pur, testé (obs-logic.test.js).
//
// Modèles comparés, tous à la latitude magnétique λm de l'observatoire
// (repère du dipôle IGRF à l'année de la mesure) :
//   globe      -- dipôle centré, tan I = 2 tan λm, AUCUN paramètre libre ;
//   globeEcc   -- le dipôle décentré PUBLIÉ : son décalage est calculé
//                 depuis les coefficients IGRF-14 de degré 1-2 par la
//                 méthode classique de Schmidt, rien d'ajusté ici ;
//   flat1/2    -- les deux dispositions plates telles que calibrées dans
//                 logic.js (cercle d'inclinaison nulle sur l'équateur
//                 magnétique réel) ;
//   flat1fit/2fit -- les mêmes, leurs paramètres libres réajustés AU MIEUX
//                 sur ces mesures (règle 2 : steel-man) -- ils voient les
//                 réponses avant de prédire, le globe non.
// RÈGLE DU PROPRIÉTAIRE (2026-09-28) : le globe est SOURCÉ et sans liberté ;
// seuls les plats peuvent être ajustés (steel-man). Un dipôle décentré
// ajusté sur ces mesures a été essayé puis retiré pour cette raison.
// La distance au pôle sur la carte plate est r = magLat2r(λm), c'est-à-dire
// la distance du GLOBE : concession faite au plat, comme dans l'onglet.
// Les ajustements des plats se font sur I SEULEMENT ; F sert ensuite de
// test hors échantillon : chaque plat reçoit un facteur d'échelle libre,
// le globe garde l'intensité publiée de l'IGRF (terme dipolaire B0).
import { RAD, DEG } from "../../core/math.js";
import { globeMag, flatMag, flatShape, fitFlat2Depth, golden, MAG_B0 } from "./logic.js";
import { magLat2r } from "./shared.js";
import { IGRF14, IGRF14_SV } from "../../data/presets/igrf14.js";

const R_EARTH = 6371.2; // rayon de référence de l'IGRF, km
const unit = (la, lo) => [Math.cos(RAD(la)) * Math.cos(RAD(lo)), Math.cos(RAD(la)) * Math.sin(RAD(lo)), Math.sin(RAD(la))];

// Coefficients de Gauss IGRF-14 de degré 1 et 2 (nT) de TOUTES les époques,
// générés par `fog build mag-obs` depuis le fichier officiel
// https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf14coeffs.txt (copie dans
// data/mag/igrf14coeffs.txt) -- plus de table recopiée à la main.
const IGRF = IGRF14;
const IGRF_SV_2025 = IGRF14_SV;

/** Les 8 coefficients à l'année `year` (interpolation linéaire entre époques ; au-delà de la dernière, variation séculaire). */
export function igrfAt(year) {
  const t = IGRF, last = t[t.length - 1];
  if (year >= last[0]) return IGRF_SV_2025.map((sv, k) => last[k + 1] + (year - last[0]) * sv);
  let i = 0;
  while (i < t.length - 2 && year > t[i + 1][0]) i++;
  const f = Math.max(0, (year - t[i][0]) / (t[i + 1][0] - t[i][0]));
  return IGRF_SV_2025.map((_, k) => t[i][k + 1] + f * (t[i + 1][k + 1] - t[i][k + 1]));
}

/** Intensité du terme dipolaire à l'équateur, au rayon de référence (nT). */
export function dipoleB0(year) {
  const [g10, g11, h11] = igrfAt(year);
  return Math.hypot(g10, g11, h11);
}

/** Pôle géomagnétique nord (lat, lon en degrés) à l'année `year`. */
export function dipolePole(year) {
  const [g10, g11, h11] = igrfAt(year), B0 = Math.hypot(g10, g11, h11);
  return { lat: 90 - DEG(Math.acos(-g10 / B0)), lon: DEG(Math.atan2(-h11, -g11)) };
}

/**
 * Décalage du dipôle décentré (km, repère terrestre : x vers 0°E, y vers
 * 90°E, z vers le nord), calculé depuis les termes de degré 1 et 2 de
 * l'IGRF par la méthode classique de Schmidt, telle que la donnent
 * Fraser-Smith (1987, Rev. Geophys. 25, 1-16, doi:10.1029/RG025i001p00001)
 * et Koochak & Fraser-Smith (2017, Earth Space Sci. 4, 626-636,
 * doi:10.1002/2017EA000280) : L0, L1, L2, E puis (ξ, η, ζ) = (L − g E)/(3 B0²).
 * Rien n'est ajusté ici. ~590 km vers 23° N 137° E en 2020.
 */
export function eccOffset(year) {
  const [g10, g11, h11, g20, g21, h21, g22, h22] = igrfAt(year), s3 = Math.sqrt(3);
  const B2 = g10 * g10 + g11 * g11 + h11 * h11;
  const L0 = 2 * g10 * g20 + s3 * (g11 * g21 + h11 * h21);
  const L1 = -g11 * g20 + s3 * (g10 * g21 + g11 * g22 + h11 * h22);
  const L2 = -h11 * g20 + s3 * (g10 * h21 - h11 * g22 + g11 * h22);
  const E = (L0 * g10 + L1 * g11 + L2 * h11) / (4 * B2);
  return [(L1 - g11 * E), (L2 - h11 * E), (L0 - g10 * E)].map((v) => (v / (3 * B2)) * R_EARTH);
}

/** Latitude géocentrique (degrés) depuis la latitude géodésique (WGS84). */
export function geocentric(lat) {
  const e2 = 0.00669437999014;
  return DEG(Math.atan((1 - e2) * Math.tan(RAD(lat))));
}

/** Latitude magnétique (repère dipolaire) d'un point, à l'année donnée. */
export function magLat(lat, lon, year) {
  const p = dipolePole(year), phi = RAD(geocentric(lat)), pp = RAD(p.lat);
  const s = Math.sin(phi) * Math.sin(pp) + Math.cos(phi) * Math.cos(pp) * Math.cos(RAD(lon - p.lon));
  return DEG(Math.asin(Math.max(-1, Math.min(1, s))));
}

/** Quartiles (méthode de Tukey par interpolation linéaire), moustaches à 1,5 IQR, valeurs extrêmes. */
export function boxStats(xs) {
  const v = [...xs].sort((a, b) => a - b), n = v.length;
  const q = (p) => { const h = (n - 1) * p, lo = Math.floor(h); return v[lo] + (h - lo) * ((v[lo + 1] ?? v[lo]) - v[lo]); };
  const q1 = q(0.25), med = q(0.5), q3 = q(0.75), iqr = q3 - q1;
  const inside = v.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr);
  const rms = Math.sqrt(v.reduce((s, x) => s + x * x, 0) / n);
  const mae = v.reduce((s, x) => s + Math.abs(x), 0) / n;
  return {
    n, q1, med, q3, iqr, rms, mae,
    lo: inside[0], hi: inside[inside.length - 1],
    out: v.filter((x) => x < inside[0] || x > inside[inside.length - 1]),
    min: v[0], max: v[n - 1],
    within5: v.filter((x) => Math.abs(x) <= 5).length / n,
    within10: v.filter((x) => Math.abs(x) <= 10).length / n,
  };
}

const rmsOf = (pred, obs) => Math.sqrt(obs.reduce((s, o) => { const d = o.I - pred(o); return s + d * d; }, 0) / obs.length);

/**
 * Meilleur ajustement des paramètres libres des plats sur les mesures
 * (moindres carrés sur I). ① : la profondeur d de l'aimant (balayage puis
 * section dorée). ② : la profondeur d2 -- son seul paramètre depuis que
 * l'anneau porte une charge égale et opposée au pôle central (charge nette
 * nulle, ∇·B = 0 ; voir logic.js, 2026-09-30).
 */
export function fitFlat(obs) {
  const withR = obs.map((o) => ({ ...o, r: magLat2r(o.mlat) }));
  // ①
  const f1 = (d) => rmsOf((o) => flatShape(1, o.r, { d }).I, withR);
  let best1 = { d: 1000, rms: Infinity };
  for (let d = 250; d <= 60000; d += 250) { const e = f1(d); if (e < best1.rms) best1 = { d, rms: e }; }
  const d1 = golden(f1, Math.max(100, best1.d - 250), best1.d + 250, 1);
  // ②
  const f2 = fitFlat2Depth(withR, (d2) => rmsOf((o) => flatShape(2, o.r, { d2 }).I, withR));
  return { flat1: { d: d1, rms: f1(d1) }, flat2: f2 };
}

/**
 * Variante « hémisphères à égalité » de l'ajustement ② : minimise la
 * moyenne des erreurs quadratiques nord et sud, pour qu'une majorité de
 * sites au nord ne décide pas seule. Sert au texte (« pondérer les deux
 * hémisphères à égalité ne fait que déplacer l'écart »), testé.
 */
export function fitFlat2Balanced(obs) {
  const N = obs.filter((o) => o.mlat > 0).map((o) => ({ I: o.I, r: magLat2r(o.mlat) }));
  const S = obs.filter((o) => o.mlat < 0).map((o) => ({ I: o.I, r: magLat2r(o.mlat) }));
  const mse = (rows, d2) => rows.reduce((s, o) => s + (o.I - flatShape(2, o.r, { d2 }).I) ** 2, 0) / rows.length;
  return fitFlat2Depth([], (d2) => Math.sqrt((mse(N, d2) + mse(S, d2)) / 2));
}

/**
 * Dipôle d'axe IGRF (année de la mesure) placé au point d (km, repère
 * terrestre x vers 0°E, z vers le nord) au lieu du centre. Rend I (degrés)
 * et F en nT (moment de l'IGRF). d = [0,0,0] redonne exactement globeMag.
 */
export function eccDipole(o, d = eccOffset(o.year)) {
  const p = dipolePole(o.year), m = unit(p.lat, p.lon).map((x) => -x); // moment vers le sud géographique
  const up = unit(geocentric(o.lat), o.lon);
  const r = up.map((x, i) => x * R_EARTH - d[i]), L = Math.hypot(...r), rh = r.map((x) => x / L);
  const md = m[0] * rh[0] + m[1] * rh[1] + m[2] * rh[2];
  const B = rh.map((x, i) => (3 * md * x - m[i]) / L ** 3);
  const Bu = B[0] * up[0] + B[1] * up[1] + B[2] * up[2];
  const H = Math.hypot(...B.map((x, i) => x - Bu * up[i]));
  return { I: DEG(Math.atan2(-Bu, H)), F: Math.hypot(...B) * R_EARTH ** 3 * dipoleB0(o.year) };
}

/** Lignes du preset (src/data/presets/mag-obs.js) -> objets d'analyse. */
export function obsFromPreset(rows) {
  return rows.map(([src, code, name, lat, lon, year, I, F, q]) => ({ src, code, name, lat, lon, year, I, F, q }));
}

export const MODELS = ["globe", "globeEcc", "flat1", "flat2", "flat1fit", "flat2fit"];

/** Globe : F en nT, publiée (IGRF), jamais mise à l'échelle par nous. */
const SOURCED_F = new Set(["globe", "globeEcc"]);

/** I de chaque modèle ; B en nT pour le globe, à un facteur près pour les plats. */
function shapes(o, fit) {
  const r = magLat2r(o.mlat);
  const f1 = flatShape(1, r, fit.flat1), f2 = flatShape(2, r, fit.flat2), e = eccDipole(o);
  const gB = (globeMag(o.mlat).B / MAG_B0) * dipoleB0(o.year);
  return {
    I: { globe: globeMag(o.mlat).I, globeEcc: e.I, flat1: flatMag(1, r).I, flat2: flatMag(2, r).I, flat1fit: f1.I, flat2fit: f2.I },
    B: { globe: gB, globeEcc: e.F, flat1: flatMag(1, r).B, flat2: flatMag(2, r).B, flat1fit: f1.B, flat2fit: f2.B },
  };
}

const median = (xs) => boxStats(xs).med;

/**
 * Tableau d'analyse : pour chaque observatoire, λm et, par modèle,
 * l'inclinaison prédite (res = mesure − modèle, degrés) et l'intensité
 * prédite (resF = écart relatif en %, mesure/modèle − 1). Pour F, chaque
 * PLAT reçoit un facteur d'échelle libre (médiane de F/forme, steel-man) ;
 * le globe garde l'intensité publiée de l'IGRF (échelle 1).
 * obs = [{ code, lat, lon, year, I, F }] ; `fit` = MAG_OBS_FIT (sinon recalculé).
 * `scale` : pour F, le facteur de chaque modèle (nT par unité de forme).
 */
export function analyse(obs, fit) {
  const rows = obs.map((o) => ({ ...o, mlat: magLat(o.lat, o.lon, o.year) }));
  fit ??= fitFlat(rows);
  for (const o of rows) { const s = shapes(o, fit); o.pred = s.I; o.shapeB = s.B; }
  // F manque pour certains sites (un levé peut ne mesurer que D et I) : ces
  // sites comptent pour I, pas pour F.
  const withF = rows.filter((o) => o.F != null);
  const scale = Object.fromEntries(MODELS.map((m) => [m, SOURCED_F.has(m) ? 1 : median(withF.map((o) => o.F / o.shapeB[m]))]));
  for (const o of rows) {
    o.res = Object.fromEntries(MODELS.map((m) => [m, o.I - o.pred[m]]));
    o.resF = o.F == null ? null : Object.fromEntries(MODELS.map((m) => [m, 100 * (o.F / (scale[m] * o.shapeB[m]) - 1)]));
  }
  const stats = Object.fromEntries(MODELS.map((m) => [m, boxStats(rows.map((o) => o.res[m]))]));
  const statsF = Object.fromEntries(MODELS.map((m) => [m, boxStats(withF.map((o) => o.resF[m]))]));
  return { rows, stats, statsF, scale, fit };
}
