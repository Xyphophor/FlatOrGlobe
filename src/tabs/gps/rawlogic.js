// Logique pure du panneau « récepteurs GPS bruts » (epic16/UC03). Les positions
// des stations viennent de data/presets/gps-raw.js, résolues par
// `fog build gps-raw` (ex-scripts/build_gps_raw.py) à partir des pseudo-distances brutes ; ici : la
// sphère (et le plan) ajustés dessus, l'aplatissement lu dans les résidus, et la
// visibilité croisée de deux stations. Rien n'est supposé de la forme de la Terre.

const D2R = Math.PI / 180;
const norm = (v) => Math.hypot(v[0], v[1], v[2]);

/** Résout A x = b (3×3 ou 4×4) par élimination de Gauss avec pivot. */
export function solveLin(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = i + 1; r < n; r++) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let c = i + 1; c < n; c++) s -= M[i][c] * x[c]; x[i] = s / M[i][i]; }
  return x;
}

/**
 * Sphère de centre c et de rayon R (m) ajustée sur des points ECEF : moindres carrés
 * algébriques (|p|² = 2 c·p + R² − |c|², linéaire), puis géométriques (Gauss-Newton sur
 * la distance au centre moins R). Renvoie { c, R, res: [m], rms }.
 */
export function fitSphere(P) {
  const ata = Array.from({ length: 4 }, () => new Array(4).fill(0)), atb = new Array(4).fill(0);
  for (const p of P) {
    const r = [2 * p[0], 2 * p[1], 2 * p[2], 1], y = p[0] ** 2 + p[1] ** 2 + p[2] ** 2;
    for (let i = 0; i < 4; i++) { atb[i] += r[i] * y; for (let j = 0; j < 4; j++) ata[i][j] += r[i] * r[j]; }
  }
  const s = solveLin(ata, atb);
  let c = [s[0], s[1], s[2]], R = Math.sqrt(s[3] + c[0] ** 2 + c[1] ** 2 + c[2] ** 2);
  for (let it = 0; it < 8; it++) {
    const a = Array.from({ length: 4 }, () => new Array(4).fill(0)), b = new Array(4).fill(0);
    for (const p of P) {
      const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], n = norm(d), r = [-d[0] / n, -d[1] / n, -d[2] / n, -1], y = -(n - R);
      for (let i = 0; i < 4; i++) { b[i] += r[i] * y; for (let j = 0; j < 4; j++) a[i][j] += r[i] * r[j]; }
    }
    const d = solveLin(a, b);
    c = [c[0] + d[0], c[1] + d[1], c[2] + d[2]]; R += d[3];
  }
  const res = P.map((p) => norm([p[0] - c[0], p[1] - c[1], p[2] - c[2]]) - R);
  return { c, R, res, rms: Math.sqrt(res.reduce((q, x) => q + x * x, 0) / res.length) };
}

/** Plan le plus proche (moindres carrés orthogonaux) : rms des distances (m). Vecteur propre de plus petite valeur propre par itération inverse. */
export function fitPlane(P) {
  const n = P.length, m = [0, 1, 2].map((i) => P.reduce((q, p) => q + p[i], 0) / n);
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of P) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) S[i][j] += (p[i] - m[i]) * (p[j] - m[j]);
  let v = [1, 1, 1];
  for (let it = 0; it < 60; it++) { v = solveLin(S.map((r, i) => r.map((x, j) => x + (i === j ? 1e-6 * S[0][0] : 0))), v); const l = norm(v); v = v.map((x) => x / l); }
  const res = P.map((p) => (p[0] - m[0]) * v[0] + (p[1] - m[1]) * v[1] + (p[2] - m[2]) * v[2]);
  return { normal: v, rms: Math.sqrt(res.reduce((q, x) => q + x * x, 0) / n) };
}

/** Latitude géocentrique (degrés) d'un point ECEF : celle qui sert à comparer au rayon. */
export const geocentricLat = (p) => Math.atan2(p[2], Math.hypot(p[0], p[1])) / D2R;

/**
 * Le rayon de la Terre tiré des stations : sphère ajustée, erreur type par jackknife sur les
 * stations (on en retire une à la fois), résidus selon la latitude, et l'aplatissement lu
 * dans ces résidus (R(φ) ≈ R₀ − Δ·sin²φ : Δ = différence équateur-pôle). Le plan ajusté
 * sur les mêmes points est donné en comparaison. Renvoie { R, seR, rms, centre (m),
 * stations: [{id, lat, res (km)}], delta (km), plane: { rms } }.
 */
export function earthFromStations(stations) {
  const P = stations.map((s) => s.xyz), F = fitSphere(P), n = P.length;
  const jk = P.map((_, i) => fitSphere(P.filter((__, j) => j !== i)).R);
  const mj = jk.reduce((q, x) => q + x, 0) / n, seR = Math.sqrt(((n - 1) / n) * jk.reduce((q, x) => q + (x - mj) ** 2, 0));
  const pts = stations.map((s, i) => ({ id: s.id, lat: geocentricLat(s.xyz), res: F.res[i] / 1000 }));
  // droite res = a + b·sin²φ par moindres carrés ; Δ = −b
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of pts) { const x = Math.sin(p.lat * D2R) ** 2; sx += x; sy += p.res; sxx += x * x; sxy += x * p.res; }
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx), a = (sy - b * sx) / n;
  const flatRms = Math.sqrt(pts.reduce((q, p) => q + (p.res - (a + b * Math.sin(p.lat * D2R) ** 2)) ** 2, 0) / n);
  return { R: F.R, seR, rms: F.rms, c: F.c, centre: norm(F.c), stations: pts, delta: -b, a, deflatedRms: flatRms, plane: fitPlane(P) };
}

/**
 * Visibilité croisée de deux stations : seen = { "bin de 5 min": [PRN...] }. Par satellite (PRN),
 * les bins vus par A seulement, par B seulement, par les deux. Renvoie { rows: [{prn, a, b, both}],
 * bins: 288, same (part des bins où les deux voient exactement les mêmes satellites),
 * common (nombre moyen de satellites vus des deux), onlyA, onlyB (moyennes) }.
 */
export function crossVisibility(A, B, bins = 288) {
  const prns = new Set();
  for (const s of [A.seen, B.seen]) for (const k in s) for (const p of s[k]) prns.add(p);
  const rows = [...prns].sort((p, q) => p - q).map((prn) => ({ prn, a: [], b: [], both: [] }));
  const at = Object.fromEntries(rows.map((r) => [r.prn, r]));
  let same = 0, common = 0, onlyA = 0, onlyB = 0, n = 0;
  for (let k = 0; k < bins; k++) {
    const a = new Set(A.seen[k] || []), b = new Set(B.seen[k] || []);
    if (!a.size && !b.size) continue;
    n++;
    let c = 0, oa = 0, ob = 0;
    for (const p of a) { if (b.has(p)) c++; else oa++; }
    for (const p of b) if (!a.has(p)) ob++;
    common += c; onlyA += oa; onlyB += ob;
    if (!oa && !ob) same++;
    for (const r of rows) { const ia = a.has(r.prn), ib = b.has(r.prn); if (ia && ib) r.both.push(k); else if (ia) r.a.push(k); else if (ib) r.b.push(k); }
  }
  return { rows, bins, same: same / n, common: common / n, onlyA: onlyA / n, onlyB: onlyB / n, n };
}

/** Distance entre deux stations (km) sur la sphère de rayon R (m) : sert à choisir une paire éloignée. */
export const chord = (a, b) => norm([a[0] - b[0], a[1] - b[1], a[2] - b[2]]) / 1000;

/** Écart angulaire (degrés) au centre de la Terre entre deux stations (positions ECEF). */
export const separationDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (norm(a) * norm(b))))) / D2R;

/**
 * Pour chaque paire de stations : leur écart angulaire et le nombre moyen de satellites suivis par les deux
 * en même temps. Renvoie { pairs: [{a, b, deg, common}], maxShared (le plus grand écart où la paire a
 * partagé AU MOINS un satellite à un instant), minDisjoint (le plus petit écart où jamais), limit (degrés :
 * 2·acos(R/a), la limite géométrique d'un satellite à la distance a du centre, vu de deux points de la
 * sphère de rayon R au ras de l'horizon : sans paramètre libre) }.
 */
export function sharedSky(stations, R, a = 26560e3) {
  const pairs = [];
  for (let i = 0; i < stations.length; i++) for (let j = i + 1; j < stations.length; j++) {
    const V = crossVisibility(stations[i], stations[j]);
    pairs.push({ a: stations[i].id, b: stations[j].id, deg: separationDeg(stations[i].xyz, stations[j].xyz), common: V.common, any: V.rows.some((r) => r.both.length > 0) });
  }
  const sh = pairs.filter((p) => p.any), no = pairs.filter((p) => !p.any);
  return { pairs, maxShared: Math.max(...sh.map((p) => p.deg)), minDisjoint: no.length ? Math.min(...no.map((p) => p.deg)) : null, limit: 2 * Math.acos(R / a) / D2R };
}
