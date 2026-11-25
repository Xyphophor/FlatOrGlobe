// La méthode « une forme sort des mesures » comme vitrine standard du site (2026-11-25, propriétaire : « le rendu de
// l'animation qui trouve la forme du globe à partir des vitesses des séismes est super, j'en ferais bien une méthode
// standard du site »). Sorti de seis/meshfig.js (2026-11-24) ; employé par seis (séismes), avia (temps de vol) et sat
// (Doppler des satellites).
//
// Le principe, le même pour les trois : des points (stations, aéroports, récepteurs) placés par les seules mesures, AUCUNE
// coordonnée ; d'abord sur un plan, qui cale ; puis avec la liberté de plus (l'espace, ou une courbure libre) ; seulement
// alors les droites deviennent des arcs et la sphère se montre ; enfin la vérification : le nuage tourné (rotation
// seule) sur la vraie carte qui apparaît en fondu, un arc rouge pointillé de chaque point à sa vraie position, et un
// zoom à échelle vraie. Les couleurs sont les vraies latitudes : une vérification, jamais lue par l'ajustement.
//
// Ce module dessine ; chaque onglet fournit ses données (images 3D des descentes, dans UN repère commun) et sa ligne
// du temps (stateAt) faite avec les aides exportées ici, et ses lignes de lecture. Vue orthographique d'un vrai nuage
// 3D (règle 1 : rien n'est étiré).
import { makeReel, label, REEL_COL, REEL_SANS, ease, clamp } from "./reel.js";
import { coastLines } from "./globe25d.js";

export { ease, clamp, REEL_COL };
export const D2R = Math.PI / 180;
export const TEAL = "#0f766e", AMBER = REEL_COL.flat, RED = "#dc2626";
export const lerp = (a, b, f) => a + (b - a) * f;

// ---- géométrie
export const vec = (la, lo) => [Math.cos(la * D2R) * Math.cos(lo * D2R), Math.cos(la * D2R) * Math.sin(lo * D2R), Math.sin(la * D2R)];
export const norm = (p) => { const l = Math.hypot(p[0], p[1], p[2]) || 1; return [p[0] / l, p[1] / l, p[2] / l]; };
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const mul = (A, p) => [dot3(A[0], p), dot3(A[1], p), dot3(A[2], p)];
export const mmul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
export const transpose = (A) => [0, 1, 2].map((i) => [A[0][i], A[1][i], A[2][i]]);
/** Vue : lacet φ autour de z (z = la normale du plan, en haut), puis élévation e de la caméra. Lignes : x écran, y écran (haut), profondeur. */
export const camera = (phi, e) => {
  const c = Math.cos(phi), s = Math.sin(phi), ce = Math.cos(e), se = Math.sin(e);
  return [[c, -s, 0], [se * s, se * c, ce], [-ce * s, -ce * c, se]];
};
/** Vue d'un globe centré sur (lat0, lon0), nord en haut (repère Terre : x vers 0° 0°, z vers le pôle Nord). */
export const earthCam = (la, lo) => { const c = vec(la, lo), e = [-Math.sin(lo * D2R), Math.cos(lo * D2R), 0];
  return [e, [c[1] * e[2] - c[2] * e[1], c[2] * e[0] - c[0] * e[2], c[0] * e[1] - c[1] * e[0]], c]; };
export function quat(m) {
  const t = m[0][0] + m[1][1] + m[2][2];
  if (t > 0) { const s = Math.sqrt(t + 1) * 2; return [0.25 * s, (m[2][1] - m[1][2]) / s, (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s]; }
  if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) { const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2; return [(m[2][1] - m[1][2]) / s, 0.25 * s, (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s]; }
  if (m[1][1] > m[2][2]) { const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2; return [(m[0][2] - m[2][0]) / s, (m[0][1] + m[1][0]) / s, 0.25 * s, (m[1][2] + m[2][1]) / s]; }
  const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2; return [(m[1][0] - m[0][1]) / s, (m[0][2] + m[2][0]) / s, (m[1][2] + m[2][1]) / s, 0.25 * s];
}
export const qmat = ([w, x, y, z]) => [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]];
export function slerp(a, b, f) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (d < 0) { b = b.map((x) => -x); d = -d; }
  if (d > 0.9995) { const q = a.map((x, i) => lerp(x, b[i], f)), l = Math.hypot(...q); return q.map((x) => x / l); }
  const th = Math.acos(d), s = Math.sin(th);
  return a.map((x, i) => (Math.sin((1 - f) * th) * x + Math.sin(f * th) * b[i]) / s);
}
/** La vue qui glisse de V vers target (f = 0..1), par les quaternions. */
export const viewTo = (V, target, f) => (f >= 1 ? target : f <= 0 ? V : qmat(slerp(quat(V), quat(target), f)));
export function orthonorm(A) {
  const x = norm(A[0]), y0 = A[1], d = dot3(x, y0), y = norm([y0[0] - d * x[0], y0[1] - d * x[1], y0[2] - d * x[2]]);
  return [x, y, [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]]];
}
export const at = (arr, i) => [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]];
export const asPts = (arr, n) => Array.from({ length: n }, (_, j) => at(arr, j));
export const mix = (A, B, f) => A.map((p, j) => [0, 1, 2].map((c) => lerp(p[c], B[j][c], f)));
export const centroid = (P) => P.reduce((a, p) => [a[0] + p[0] / P.length, a[1] + p[1] / P.length, a[2] + p[2] / P.length], [0, 0, 0]);
export const latCol = (lat) => { const t = (clamp(lat, -60, 60) + 60) / 120; return `hsl(${Math.round(215 - 185 * t)} 70% ${Math.round(46 + 4 * Math.sin(t * Math.PI))}%)`; };

/**
 * Image fractionnaire f (0..1) d'une descente F (images { st: [x,y,z,…], hub?: […], stress, … }) : points interpolés.
 * n = nombre de points, nh = nombre de pivots ; extra(a, b, u) ajoute des champs interpolés.
 */
export function frameAt(F, f, n, nh = 0) {
  f = clamp(f, 0, 1) * (F.length - 1);
  const i = Math.min(F.length - 2, Math.max(0, Math.floor(f))), u = F.length < 2 ? 0 : f - i, a = F[i], b = F[Math.min(F.length - 1, i + 1)];
  const pick = (A, B, m) => Array.from({ length: m }, (_, j) => [0, 1, 2].map((c) => lerp(A[j * 3 + c], B[j * 3 + c], u)));
  return { st: pick(a.st, b.st, n), hub: nh ? pick(a.hub, b.hub, nh) : [], stress: lerp(a.stress, b.stress, u), i, u, a, b };
}

/**
 * Le repère Terre d'une forme ajustée : rot = la rotation de calage (9 nombres, a·R ≈ t, a dans le repère de l'ajustement,
 * t le vrai vecteur unitaire ; un dessin seulement), réorthonormalisée (un écart de 1e-4 suffit à fausser de 0,1° des
 * angles de 0,5°). Rend E (ajustement → Terre), ET (Terre → ajustement) et TRUE(lat, lon) dans le repère de l'ajustement.
 */
export function earthFrame(rot) {
  const E = orthonorm([0, 1, 2].map((b) => [0, 1, 2].map((a) => rot[a * 3 + b]))), ET = transpose(E);
  return { E, ET, toFit: (la, lo) => mul(ET, vec(la, lo)) };
}

/** Écarts angulaires (degrés) entre des points placés et leurs vraies directions ; stats sur ceux que keep retient. */
export function angErrors(P, TRUE, keep = () => true) {
  const e = P.map((p, j) => Math.acos(clamp(dot3(norm(p), TRUE[j]), -1, 1)) / D2R);
  const k = e.filter((_, j) => keep(j)), s = k.slice().sort((a, b) => a - b), n = s.length;
  return { e, rms: Math.sqrt(k.reduce((a, x) => a + x * x, 0) / n), med: s[n >> 1], max: s[n - 1], p90: s[Math.floor(n * 0.9)], n };
}

let LANDCACHE = new Map();
function landPts(ET, key) {
  if (LANDCACHE.has(key)) return LANDCACHE.get(key);
  const out = [];
  for (const line of coastLines()) { const o = []; for (const q of line) o.push(q ? mul(ET, vec(q[0], q[1])) : null); out.push(o); }
  LANDCACHE.set(key, out);
  return out;
}

/** Deux chemins regroupés (avant, arrière) : un seul stroke chacun. */
class Segs {
  constructor() { this.s = []; }
  seg(a, b) { this.s.push(a[0], a[1], b[0], b[1]); }
  stroke(ctx) { if (!this.s.length) return; ctx.beginPath(); for (let i = 0; i < this.s.length; i += 4) { ctx.moveTo(this.s[i], this.s[i + 1]); ctx.lineTo(this.s[i + 2], this.s[i + 3]); } ctx.stroke(); }
}

/**
 * Le dessin d'un instant. cfg : { R (rayon de la sphère finale, unités de l'ajustement), ET, TRUE (vraies directions, repère
 * de l'ajustement), cols (couleur de chaque point), fixed?(j) (faux : le point n'est pas fixé par les mesures, dessiné creux),
 * lines (paires [a, b] : a, b < N = points, ≥ N = pivots), zoom?: { factor, centre (indice) }, ringLabel?, linesNote? } ;
 * s (stateAt) : { st, hub, V, o, k, bound, arc, sph, map, err, lines, ring, zoom, pts, sheet?: { z0, fade }, cloud?: { P, cols, a },
 * cloudHub?: { P, a }, read, key } ; readLines(s, T) → [[texte, couleur, gros?]].
 */
export function drawShape(ctx, b, s, T, fs, cfg, readLines, reads) {
  const N = s.st.length, cx = b.x + b.w / 2, cy = b.y + b.h / 2 + fs * 0.4;
  const sc = Math.max(0.5, Math.min(b.w, b.h - fs * 2.6) / 2) / s.bound, k = s.k ?? 1, R = cfg.R, ZOOM = cfg.zoom?.factor ?? 1;
  const P0 = (p, r = 1) => { const q = mul(s.V, [(p[0] - s.o[0]) * r, (p[1] - s.o[1]) * r, (p[2] - s.o[2]) * r]); return [q[0] * sc * k, -q[1] * sc * k, q[2]]; };
  // le zoom de la fin : grossissement Z, le point centre glisse au centre (même échelle partout : rien n'est étiré)
  const zf = s.zoom || 0, Z = 1 + (ZOOM - 1) * zf, qt = zf > 0 ? P0(cfg.TRUE[cfg.zoom.centre], R) : [0, 0, 0];
  const P = (p, r = 1) => { const q = P0(p, r); return [cx + Z * (q[0] - zf * qt[0]), cy + Z * (q[1] - zf * qt[1]), q[2]]; };
  const scx = cx - Z * zf * qt[0] - Z * (s.o[0] ? 0 : 0), scy = cy - Z * zf * qt[1];
  const fixed = cfg.fixed || (() => true);
  ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  const rNow = s.st.reduce((a, p) => a + Math.hypot(p[0], p[1], p[2]), 0) / N, Rpx = (s.sph > 0 ? (s.rSph ?? rNow) : R) * sc * k * Z;
  const c0 = P([0, 0, 0]);   // le centre de la sphère à l'écran
  // la sphère : un disque pâle et son contour ; la mer quand la carte arrive
  if (s.sph > 0) {
    ctx.save(); ctx.globalAlpha = s.sph;
    ctx.fillStyle = s.map > 0.5 ? "#e4eff5" : "#e6f1ee";
    ctx.beginPath(); ctx.arc(c0[0], c0[1], Math.max(0, Rpx), 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = TEAL; ctx.globalAlpha = s.sph * 0.55; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore();
  }
  // la vraie carte, en fondu : côtes du repère Terre ramenées dans celui de l'ajustement, face avant seulement
  if (s.map > 0) {
    const Rm = s.rMap ?? R;
    ctx.save(); ctx.globalAlpha = s.map * 0.8; ctx.strokeStyle = "#4b6b63"; ctx.lineWidth = Math.max(0.8, fs * 0.05);
    for (const line of landPts(cfg.ET, cfg.key)) { ctx.beginPath(); let pen = false;
      for (const q of line) { if (!q) { pen = false; continue; } const p = P(q, Rm); if (p[2] < 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; }
      ctx.stroke(); }
    ctx.globalAlpha = s.map * 0.35; ctx.strokeStyle = "#7a8f99"; ctx.lineWidth = 0.6;
    for (let la = -60; la <= 60; la += 30) { ctx.beginPath(); let pen = false; for (let lo = -180; lo <= 180; lo += 4) { const p = P(mul(cfg.ET, vec(la, lo)), Rm); if (p[2] < 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } ctx.stroke(); }
    for (let lo = -180; lo < 180; lo += 30) { ctx.beginPath(); let pen = false; for (let la = -88; la <= 88; la += 4) { const p = P(mul(cfg.ET, vec(la, lo)), Rm); if (p[2] < 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } ctx.stroke(); }
    ctx.restore();
  }
  // le plan : la feuille z = z0, pour que le plan se voie comme un plan
  if (s.sheet && s.sheet.fade > 0) {
    const z0 = s.sheet.z0, vis = s.st.filter((_, j) => !s.show || s.show(j));
    const rad = Math.max(1e-6, ...vis.map((p) => Math.hypot(p[0] - s.o[0], p[1] - s.o[1]))) * 1.08;
    ctx.save(); ctx.globalAlpha = 0.55 * s.sheet.fade; ctx.fillStyle = "#fbf1e1"; ctx.strokeStyle = AMBER; ctx.lineWidth = 1;
    ctx.beginPath(); for (let a = 0; a <= 72; a++) { const q = P([s.o[0] + rad * Math.cos(a * Math.PI / 36), s.o[1] + rad * Math.sin(a * Math.PI / 36), z0]); a ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 0.7 * s.sheet.fade; ctx.stroke(); ctx.restore();
  }
  const pt = (i) => (i < N ? s.st[i] : s.hub[i - N]);
  const visible = (i) => (i < N ? !s.show || s.show(i) : true);
  // les lignes (mesures) : des cordes (droites), qui ne deviennent des arcs qu'avec la sphère
  if (s.lines > 0 && cfg.lines?.length) {
    const front = new Segs(), back = new Segs();
    for (const [i, j] of cfg.lines) {
      if (!visible(i) || !visible(j)) continue;
      const h = pt(i), p = pt(j), rh = Math.hypot(...h), a = norm(h), rj = Math.hypot(...p), bb = norm(p);
      const w = Math.acos(clamp(dot3(a, bb), -1, 1)), sw = Math.sin(w) || 1, steps = s.arc > 0 ? Math.max(4, Math.ceil(w / 0.12)) : 1;
      let prev = null;
      for (let n = 0; n <= steps; n++) {
        const v = n / steps, ch = [0, 1, 2].map((c) => lerp(h[c], p[c], v));
        let q = ch;
        if (s.arc > 0) { const c1 = Math.sin((1 - v) * w) / sw, c2 = Math.sin(v * w) / sw, r = lerp(rh, rj, v); q = [0, 1, 2].map((c) => lerp(ch[c], (c1 * a[c] + c2 * bb[c]) * r, s.arc)); }
        const sp = P(q);
        if (prev) ((sp[2] + prev[2]) / 2 >= 0 || s.sph === 0 ? front : back).seg(prev, sp);
        prev = sp;
      }
    }
    const lc = s.arc > 0.5 ? TEAL : "#6b6458";
    ctx.save(); ctx.lineWidth = cfg.lineWidth ?? 0.8; ctx.strokeStyle = lc;
    ctx.globalAlpha = 0.07 * s.lines; back.stroke(ctx); ctx.globalAlpha = (s.sph > 0 ? 0.28 : 0.22) * s.lines * (cfg.lineAlpha ?? 1); front.stroke(ctx); ctx.restore();
  }
  const behind = (z) => s.sph > 0.3 && z < 0;
  // le nuage complémentaire (seis : toutes les stations), petit, sous les points principaux
  if (s.cloud && s.cloud.a > 0) {
    ctx.save(); const r0 = Math.max(1, fs * 0.06);
    for (let j = 0; j < s.cloud.P.length; j++) {
      const q = P(s.cloud.P[j]); if (behind(q[2])) continue;
      ctx.globalAlpha = s.cloud.a * 0.85; ctx.fillStyle = s.cloud.cols[j]; ctx.fillRect(q[0] - r0, q[1] - r0, 2 * r0, 2 * r0);
    }
    ctx.restore();
  }
  if (s.cloudHub && s.cloudHub.a > 0) {
    ctx.save(); ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 0.9; const r = Math.max(2, fs * 0.1);
    for (const h of s.cloudHub.P) { const q = P(h); if (behind(q[2])) continue; ctx.globalAlpha = s.cloudHub.a * 0.6; ctx.beginPath(); ctx.moveTo(q[0] - r, q[1] - r); ctx.lineTo(q[0] + r, q[1] + r); ctx.moveTo(q[0] + r, q[1] - r); ctx.lineTo(q[0] - r, q[1] + r); ctx.stroke(); }
    ctx.restore();
  }
  // les points, du fond vers l'avant ; creux s'ils ne sont pas fixés par les mesures
  const scr = s.st.map((p, j) => [P(p), j]).filter(([, j]) => visible(j)).sort((a, c) => a[0][2] - c[0][2]);
  ctx.save();
  for (const [p, j] of scr) {
    const back = behind(p[2]), rr = Math.max(cfg.dotMin ?? 2.2, fs * (back ? 0.11 : 0.15) * (cfg.dotScale ?? 1)), ap = s.pts * (back ? 0.3 : 1) * (s.alpha ? s.alpha(j) : 1);
    if (ap <= 0) continue;
    ctx.globalAlpha = ap;
    ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, 2 * Math.PI);
    if (fixed(j)) { ctx.fillStyle = cfg.cols[j]; ctx.fill(); } else { ctx.strokeStyle = cfg.cols[j]; ctx.lineWidth = Math.max(1.2, fs * 0.06); ctx.stroke(); }
  }
  ctx.restore();
  // étiquettes de points (avia : les codes des aéroports), face avant
  if (cfg.names && s.names > 0) {
    ctx.save(); ctx.globalAlpha = s.names;
    for (const [p, j] of scr) { if (behind(p[2]) || !cfg.names[j]) continue; label(ctx, cfg.names[j], p[0] + fs * 0.22, p[1] - fs * 0.3, { size: fs * 0.4, col: REEL_COL.soft, align: "left", weight: 600 }); }
    ctx.restore();
  }
  // les pivots (×)
  if (s.lines > 0 && s.hub?.length) {
    ctx.save(); ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 1.4; const r = Math.max(3.5, fs * 0.2);
    for (const h of s.hub) { const q = P(h); if (behind(q[2])) continue; ctx.globalAlpha = s.lines * s.pts; ctx.beginPath(); ctx.moveTo(q[0] - r, q[1] - r); ctx.lineTo(q[0] + r, q[1] + r); ctx.moveTo(q[0] + r, q[1] - r); ctx.lineTo(q[0] - r, q[1] + r); ctx.stroke(); }
    ctx.restore();
  }
  // l'erreur de chaque point : un arc rouge pointillé jusqu'à sa vraie position (cercle rouge)
  if (s.err > 0) {
    const Rm = s.rMap ?? R;
    ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = Math.max(1.2, fs * 0.07); ctx.setLineDash([Math.max(2, fs * 0.14), Math.max(2, fs * 0.1)]);
    for (let j = 0; j < N; j++) {
      if (!visible(j)) continue;
      const a = norm(s.st[j]), bb = cfg.TRUE[j], w = Math.acos(clamp(dot3(a, bb), -1, 1)), sw = Math.sin(w) || 1, rj = Math.hypot(...s.st[j]);
      const pts = [], m = Math.max(8, Math.ceil(w / 0.05));
      for (let n = 0; n <= m; n++) { const v = (n / m) * s.err, c1 = Math.sin((1 - v) * w) / sw, c2 = Math.sin(v * w) / sw; pts.push(P([0, 1, 2].map((c) => (c1 * a[c] + c2 * bb[c]) * lerp(rj, Rm, v)))); }
      if (pts[0][2] < 0) continue;
      ctx.globalAlpha = fixed(j) ? 0.9 : 0.45; ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.lineWidth = 1.1;
    for (let j = 0; j < N; j++) { if (!visible(j)) continue; const q = P(cfg.TRUE[j].map((x) => x * Rm)); if (q[2] < 0) continue; ctx.globalAlpha = s.err * (fixed(j) ? 1 : 0.5); ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(2.4, fs * 0.15), 0, 2 * Math.PI); ctx.stroke(); }
    ctx.restore();
  }
  // l'anneau de repère (la taille de la Terre à la vitesse nominale) : jamais lu par l'ajustement
  if (s.ring > 0) {
    const rr = (s.ringR ?? R) * sc;
    ctx.save(); ctx.globalAlpha = s.ring; ctx.strokeStyle = REEL_COL.ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(c0[0], c0[1], rr, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
    if (cfg.ringLabel) { ctx.save(); ctx.globalAlpha = s.ring; label(ctx, T(cfg.ringLabel), c0[0], Math.min(b.y + b.h - fs * 0.35, c0[1] + rr + fs * 0.55), { size: fs * 0.45, col: REEL_COL.soft, weight: 500 }); ctx.restore(); }
  }
  ctx.restore();   // fin du cadre du dessin
  // la barre d'échelle du zoom : 1° (ou cfg.zoom.bar) de grand cercle sur la sphère, à l'échelle du dessin
  if (zf > 0.05) {
    const deg = cfg.zoom.deg ?? 1, L = ((s.rMap ?? R) * sc * k * Z * Math.PI * deg) / 180, x0 = b.x + fs * 0.3, y0 = b.y + b.h - fs * 0.5;
    ctx.save(); ctx.globalAlpha = ease((zf - 0.05) / 0.3); ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + L, y0);
    ctx.moveTo(x0, y0 - 4); ctx.lineTo(x0, y0 + 4); ctx.moveTo(x0 + L, y0 - 4); ctx.lineTo(x0 + L, y0 + 4); ctx.stroke();
    label(ctx, cfg.zoom.barLabel ?? `${deg}°`, x0 + L + fs * 0.3, y0, { size: fs * 0.5, col: REEL_COL.ink, align: "left", weight: 700 }); ctx.restore();
  }
  // les lectures : en haut du dessin (sur un fond de papier : pendant le zoom, la carte passe dessous), et dans .reads
  const lines = readLines(s, T);
  ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = REEL_COL.paper;
  lines.forEach(([txt, , big], i) => { ctx.font = `${big ? 800 : 600} ${fs * (big ? 0.62 : 0.5)}px ${REEL_SANS}`; ctx.fillRect(b.x - 3, b.y + fs * (0.45 + 0.85 * i) - fs * 0.42, ctx.measureText(txt).width + 6, fs * 0.84); });
  ctx.restore();
  lines.forEach(([txt, col, big], i) => label(ctx, txt, b.x, b.y + fs * (0.45 + 0.85 * i), { size: fs * (big ? 0.62 : 0.5), col, align: "left", weight: big ? 800 : 600 }));
  if (reads) { const txt = lines.map((l) => l[0]).join(" · "); if (reads.textContent !== txt) reads.textContent = txt; }
  void scx; void scy;
}

/**
 * Une vitrine de forme : scenes [{ key, d, join? }], stateAt(t) (t global), cfg (drawShape), readLines, EN (textes anglais
 * par défaut), alt (clé du texte de remplacement). mount(canvas, tv, vals, reads) : tv(clé, défaut) = traduction ; vals = les
 * {{nombres}} des textes ; reads = le <p class="reads"> sous la figure.
 */
export function makeShapeReel({ prefix, scenes, still, stateAt, cfg, readLines, EN, alt }) {
  const START = {}; { let a = 0; for (const sc of scenes) { START[sc.key] = a; a += sc.d; } }
  const DURATION = scenes.reduce((a, s) => a + s.d, 0);
  const box = { reads: null };
  const REEL = makeReel({
    prefix, still: still ?? DURATION - 0.5, scenes,
    draw: Object.fromEntries(scenes.map((sc) => [sc.key, (ctx, b, u, d, T, fs) => drawShape(ctx, b, stateAt(START[sc.key] + u), T, fs, cfg, readLines, box.reads)])),
  });
  function mount(cv, tv, vals, reads) {
    box.reads = reads || null;
    const T = Object.assign((k) => String(tv(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang: document.documentElement.lang || "en" });
    if (alt) { cv.setAttribute("role", "img"); cv.setAttribute("aria-label", T(alt)); }
    const r = REEL.mountReel(cv, T);
    return { draw: () => r.start(), start: () => r.start(), stop: () => r.stop(), dispose: () => r.dispose() };
  }
  return { START, DURATION, mount, REEL };
}

/** La scène de l'instant t : { key, u (s dans la scène), d }. */
export function sceneOf(scenes, START, t) {
  let key = scenes[scenes.length - 1].key;
  for (const sc of scenes) if (t >= START[sc.key] && t < START[sc.key] + sc.d) { key = sc.key; break; }
  return { key, u: t - START[key], d: scenes.find((x) => x.key === key).d };
}
