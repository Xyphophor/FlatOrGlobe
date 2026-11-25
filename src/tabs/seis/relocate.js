// Séismes relocalisés par nous, en degrés et secondes (epic18/UC03). Pur, testé dans
// relocate.test.js. Données et ajustements lourds : `fog build seis-relocate` (tools/, ex-scripts/build_seis_relocate.py) ->
// src/data/presets/seis-relocate.js (heures d'arrivée et angles des stations, rien d'autre).
//
// Modèle commun aux deux géométries : t = c0 + c1·u + c2·u² + c3·u³, u = distance/100, la
// distance étant en degrés -- de grand cercle sur le globe, de carte sur le plat. Une courbe
// libre, pas une table de temps : aucun modèle de Terre, aucun rayon (règle 10). Centre (2) +
// courbe (4) = 6 paramètres de part et d'autre (règle 2). Exclusion à 3 écarts-types des
// AUTRES, un point à la fois, à centre fixe, comme le script.
import { RELOC_QUAKES, RELOC_MAPS } from "../../data/presets/seis-relocate.js";
import { makeAE, gcDeg } from "../../core/aeproj.js";

export { RELOC_QUAKES, RELOC_MAPS };
export const RELOC_P = 6;          // paramètres libres de l'ajustement P
const DEG = 3;

/** La courbe libre évaluée en une distance (degrés). */
export const curve = (coef, d) => { const u = d / 100; return coef[0] + u * (coef[1] + u * (coef[2] + u * coef[3])); };

/** Toutes les distances de [a, b] où la courbe vaut t (pas de 0,25°, interpolation linéaire). */
export function rootsOf(coef, t, a, b, step = 0.25) {
  const out = [];
  let d0 = a, f0 = curve(coef, a) - t;
  if (f0 === 0) out.push(a);
  for (let d = a + step; d <= b + 1e-9; d += step) {
    const f1 = curve(coef, d) - t;
    if ((f0 < 0 && f1 >= 0) || (f0 > 0 && f1 <= 0)) out.push(d0 + (step * f0) / (f0 - f1));
    d0 = d; f0 = f1;
  }
  return out;
}

/** La courbe est-elle croissante sur [a, b] ? (une onde ne peut pas arriver plus tôt plus loin) */
export function isMonotone(coef, a, b, step = 0.5) {
  for (let d = a; d < b; d += step) if (curve(coef, d + step) < curve(coef, d)) return false;
  return true;
}

/** Moindres carrés t = Σ c_k u^k (k ≤ 3) pour des distances d (degrés) ; renvoie { coef, res, ss }. */
export function fitCurve(d, t) {
  const n = d.length, A = Array.from({ length: 4 }, () => new Float64Array(4)), b = new Float64Array(4);
  for (let i = 0; i < n; i++) {
    const u = d[i] / 100, p = [1, u, u * u, u * u * u];
    for (let r = 0; r < 4; r++) { b[r] += p[r] * t[i]; for (let c = 0; c < 4; c++) A[r][c] += p[r] * p[c]; }
  }
  // Gauss avec pivot partiel (4 × 4)
  const M = A.map((row, r) => [...row, b[r]]);
  for (let c = 0; c < 4; c++) {
    let piv = c; for (let r = c + 1; r < 4; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < 4; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 5; k++) M[r][k] -= f * M[c][k]; }
  }
  const coef = M.map((row, r) => row[4] / row[r]);
  const res = d.map((x, i) => t[i] - curve(coef, x)), ss = res.reduce((s, x) => s + x * x, 0);
  return { coef, res, ss };
}

/**
 * À centre fixe : ajustement + exclusion à k écarts-types des AUTRES, un point à la fois.
 * d, t : distances et heures de TOUS les points ; renvoie { coef, sd, keep, n }.
 */
export function looFixed(d, t, k = 3, p = RELOC_P) {
  const keep = d.map(() => true);
  for (;;) {
    const idx = keep.flatMap((v, i) => (v ? [i] : []));
    const f = fitCurve(idx.map((i) => d[i]), idx.map((i) => t[i])), n = idx.length;
    let worst = -1, wz = k;
    f.res.forEach((r, j) => {
      const sdo = Math.sqrt(Math.max(f.ss - r * r, 0) / Math.max(1, n - 1 - p));
      const z = sdo > 0 ? Math.abs(r) / sdo : 0;
      if (z > wz) { wz = z; worst = idx[j]; }
    });
    if (worst < 0) return { coef: f.coef, sd: Math.sqrt(f.ss / Math.max(1, n - p)), keep, n, res: f.res, idx };
    keep[worst] = false;
  }
}

/** Les ondes P d'un séisme : [lat, lon, t (s), gardé par le globe] (25-95° de NOTRE centre). */
export const pPicks = (q) => q.pP;

/** Distances au centre trouvé sur le globe (degrés de grand cercle). */
export const globeDist = (q, lat = q.P.lat, lon = q.P.lon) => q.pP.map((r) => gcDeg(lat, lon, r[0], r[1]));

/** Le globe, au centre et avec la courbe trouvés par le script : résidus des points gardés, dispersion. */
export function globeCheck(q) {
  const d = globeDist(q), kept = q.pP.map((r) => r[3] === 1);
  const res = q.pP.map((r, i) => r[2] - curve(q.P.coef, d[i])).filter((_, i) => kept[i]);
  return { sd: Math.sqrt(res.reduce((s, x) => s + x * x, 0) / (res.length - RELOC_P)), n: res.length };
}

/** La carte plate de centre (lat0, lon0) ; la carte des platistes est le pôle Nord. */
export const flatMap = (lat0 = 90, lon0 = 0) => makeAE({ lat0, lon0 });

/** Distances sur une carte plate depuis le point de carte (x, y). */
export const flatDist = (q, map, x, y) => q.pP.map((r) => { const [a, b] = map.fwd(r[0], r[1]); return Math.hypot(a - x, b - y); });

/**
 * Ajustement robuste, comme le script (fit_robust) : recherche du centre sur grilles successives avec les
 * points gardés (première passe au critère robuste : les 80 % de résidus les plus petits), puis exclusions
 * une à une à centre fixe ; on recommence (grilles fines, moindres carrés) jusqu'à ce qu'aucun point ne sorte.
 * distAt(cx, cy) → distances de TOUS les points.
 */
export function robustFit(distAt, t, start, steps, trim = 0.8) {
  const keep = t.map(() => true);
  let [x, y] = start, first = true;
  for (let it = 0; it < 50; it++) {
    const idx = keep.flatMap((v, i) => (v ? [i] : [])), tk = idx.map((i) => t[i]);
    for (const [half, step] of first ? steps : steps.slice(1)) {
      let best = [Infinity, x, y];
      const n = Math.round((2 * half) / step);
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
        const cx = x - half + i * step, cy = y - half + j * step, D = distAt(cx, cy);
        const f = fitCurve(idx.map((k) => D[k]), tk);
        // première passe : critère robuste (les 80 % de résidus les plus petits), comme le script
        let ss = f.ss;
        if (first && trim) { const r2 = f.res.map((r) => r * r).sort((a, b) => a - b), k = Math.max(6, Math.floor(trim * r2.length)); ss = 0; for (let m = 0; m < k; m++) ss += r2[m]; }
        if (ss < best[0]) best = [ss, cx, cy];
      }
      [, x, y] = best;
    }
    first = false;
    const before = keep.filter(Boolean).length, D = distAt(x, y);
    const sub = looFixedFrom(D, t, keep);
    if (sub.n === before) return { x, y, coef: sub.coef, sd: sub.sd, n: sub.n, keep };
  }
  throw new Error("robustFit: no convergence");
}

/** looFixed à partir d'une liste déjà réduite (keep est modifié en place). */
function looFixedFrom(d, t, keep, k = 3, p = RELOC_P) {
  for (;;) {
    const idx = keep.flatMap((v, i) => (v ? [i] : []));
    const f = fitCurve(idx.map((i) => d[i]), idx.map((i) => t[i])), n = idx.length;
    let worst = -1, wz = k;
    f.res.forEach((r, j) => {
      const sdo = Math.sqrt(Math.max(f.ss - r * r, 0) / Math.max(1, n - 1 - p));
      const z = sdo > 0 ? Math.abs(r) / sdo : 0;
      if (z > wz) { wz = z; worst = idx[j]; }
    });
    if (worst < 0) return { coef: f.coef, sd: Math.sqrt(f.ss / Math.max(1, n - p)), n };
    keep[worst] = false;
  }
}

/**
 * Le plat sur une carte : centre du séisme libre EN COORDONNÉES DE CARTE, même courbe libre, même exclusion,
 * mêmes grilles que le script pour les cartes nommées ((±20°, 1,5°), (±2°, 0,25°), (±0,3°, 0,05°)).
 * Renvoie { x, y, coef, sd, n }. Lourd (quelques secondes) : la page lit les ajustements du script ;
 * cette fonction sert aux tests.
 */
export function fitFlatOnMap(q, map, start = null) {
  const pts = q.pP.map((r) => map.fwd(r[0], r[1])), t = q.pP.map((r) => r[2]);
  const s0 = start || map.fwd(q.P.lat, q.P.lon);
  return robustFit((cx, cy) => pts.map(([a, b]) => Math.hypot(a - cx, b - cy)), t, s0, [[20, 1.5], [2, 0.25], [0.3, 0.05]]);
}

/** Le tour du monde des ondes de surface (h), sans km : 360/ω, ω ajustée sur les arrivées LR depuis notre centre. */
export const lapHours = (q) => q.LR.lap_h;

/** Le résumé des cartes : la dispersion moyenne (pondérée par n) du globe, du plat polaire, de la meilleure carte unique. */
export function mapSummary() {
  const M = RELOC_MAPS, pole = M.named[M.named.length - 1];
  const own = RELOC_QUAKES.map((q, i) => M.named[i].sd[i]);   // chaque séisme sur SA carte (centrée sur son épicentre officiel)
  return { globe: M.globe_rms, pole: pole.rms, best: M.best, own, ownMapAll: M.named.slice(0, -1).map((r) => r.rms) };
}
