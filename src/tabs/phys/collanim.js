// Le dessin du choc de billes (2026-10-27), partagé par la vitrine du choc (collreel.js) et les animations de la page
// (anims.js : le panneau billard, les trois référentiels). Vue de dessus, billes et distances à l'échelle vraie ; les flèches
// de vitesse à l'échelle entre elles ; la force de contact en proportion de son maximum (sa vraie taille dépend de la durée du
// contact, que l'écran étire). Nombres : mechanics.js, collision().
import { arrow, text, disc, INK, SOFT, FAINT, GLOBE, SEA } from "../../core/anim2d.js";
import { collision } from "./mechanics.js";

export const CL = collision();
export const C_A = GLOBE, C_B = "#d97706", C_F = SEA, C_N = "#7c3aed";
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** Un référentiel inertiel qui va à u : sa vitesse et son déplacement au temps physique T. */
export const frameConst = (u = [0, 0]) => (T) => ({ u, x: [u[0] * T, u[1] * T] });
/**
 * Un changement de point de vue PROGRESSIF (vitrine, 2026-10-27) : entre ta et tb (temps du choc), on passe en douceur du
 * référentiel inertiel qui va à u0 à celui qui va à u1. Chaque image est vue depuis UN référentiel inertiel, de vitesse
 * intermédiaire constante : les trajectoires y restent droites (un référentiel qui accélérerait vraiment les courberait).
 */
export function blendU(u0, u1, t, ta, tb) {
  const k = smooth((t - ta) / (tb - ta));
  return { u: [u0[0] + (u1[0] - u0[0]) * k, u0[1] + (u1[1] - u0[1]) * k], k, moving: k > 0 && k < 1 };
}
/** L'accélération réelle de A (m/s²) à cet instant : la force de contact sur sa masse, la même dans tout référentiel inertiel. */
export const accelReal = (st) => st.Freal / CL.C.m;
/**
 * La force accumulée sur A depuis le début du contact (2026-10-27, propriétaire : « une persistance de la somme totale de F ») :
 * l'impulsion ∫F dt, qui grandit pendant le contact et reste ensuite, le long de −n ; et le pic de force déjà atteint. Les
 * mêmes dans tout référentiel inertiel : la force ne dépend pas de l'observateur.
 */
export function impulseSoFar(st) {
  const J = CL.J * st.s, Fpeak = st.s >= 0.5 ? CL.FmaxReal : st.Freal;
  return { J: [-J * CL.n[0], -J * CL.n[1]], Jmag: J, Fpeak, done: st.s >= 1 };
}
/**
 * La bande de la somme des forces, sous chaque vue, à la même échelle partout : son titre, la flèche ∫F dt (contour pointillé :
 * sa taille finale) et ses valeurs. b = { x, y, w } ; hauteur ≈ 3,2 fs. Renvoie la hauteur utilisée.
 */
export function drawImpulse(ctx, b, st, T, lang, fs = 10) {
  const I = impulseSoFar(st), L = fs * 3.4, n = CL.n, ox = b.x + L * Math.abs(n[0]) + 2, oy = b.y + fs * 1.3 + L * Math.abs(n[1]);
  text(ctx, T("cl-sumF", "sum of F over the contact, ∫F dt"), b.x, b.y + fs * 0.9, { size: fs * 0.85, c: C_F, bold: true, maxW: b.w });
  ctx.setLineDash([3, 3]); ctx.strokeStyle = C_F; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - n[0] * L, oy + n[1] * L); ctx.stroke(); ctx.setLineDash([]);
  const k = (I.Jmag / CL.J) * L;
  if (k > 2) arrow(ctx, ox, oy, ox - n[0] * k, oy + n[1] * k, C_F, Math.max(2.2, fs * 0.22), 8);
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  text(ctx, `J = ${nf(I.Jmag, 3)} N·s · F max ${nf(I.Fpeak, 0)} N`, ox + fs * 0.8, oy - fs * 0.1, { size: fs * 0.9, mono: true, c: C_F, maxW: b.x + b.w - ox - fs * 0.8 });
  return fs * 1.3 + L * Math.abs(n[1]) + fs * 0.5;
}
/** L'état du choc à l'instant d'affichage t vu du référentiel fr (fonction du temps physique), ou d'un référentiel à vitesse u. */
export function stateIn(t, fr = [0, 0]) {
  const F = typeof fr === "function" ? fr : frameConst(fr), st = CL.at(t), { u, x, ramp } = F(st.T), m = CL.C.m;
  const vA = [st.vA[0] - u[0], st.vA[1] - u[1]], vB = [st.vB[0] - u[0], st.vB[1] - u[1]];
  return { ...st, vA, vB, pA: [st.pA[0] - x[0], st.pA[1] - x[1]], pB: [st.pB[0] - x[0], st.pB[1] - x[1]], x, u, ramp: !!ramp,
    p: [m * (vA[0] + vB[0]), m * (vA[1] + vB[1])], E: 0.5 * m * (vA[0] ** 2 + vA[1] ** 2 + vB[0] ** 2 + vB[1] ** 2) };
}

/**
 * Dessine l'état à l'instant t (s, temps d'affichage) dans le référentiel qui va à u, dans la boîte b = { x, y, w, h }.
 * o : { span (m de large), grid, xy (composantes x/y de A), nt (composantes le long de n et en travers), line (ligne des centres),
 *       force, trail, kv (px par m/s, sinon s·0,35), fs (taille du texte) }. Renvoie { st, X, Y, s }.
 */
export function drawColl(ctx, b, t, u = [0, 0], o = {}) {
  const fr = typeof u === "function" ? u : frameConst(u), st = stateIn(t, fr), span = o.span ?? 2.6, s = Math.min(b.w / span, b.h / (span * 0.72));
  // le centre de la vue : le point de contact dans ce référentiel (au temps physique du contact)
  const xc = fr(CL.C.t0).x, cx0 = -xc[0], cy0 = -xc[1], X = (x) => b.x + b.w / 2 + (x - cx0) * s, Y = (y) => b.y + b.h / 2 - (y - cy0) * s;
  const fs = o.fs ?? 11, kv = o.kv ?? s * 0.35, r = Math.max(3, CL.C.r * s);
  ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  if (o.grid) {   // les repères de la table : fixes au sol, ils défilent dans un référentiel qui avance
    const g = 0.25, x0 = cx0 - span, x1 = cx0 + span, y0 = cy0 - span, y1 = cy0 + span, sx = st.x[0], sy = st.x[1];
    ctx.fillStyle = "#cbd5e1";
    for (let gx = Math.floor((x0 + sx) / g) * g; gx < x1 + sx; gx += g) for (let gy = Math.floor((y0 + sy) / g) * g; gy < y1 + sy; gy += g) { ctx.beginPath(); ctx.arc(X(gx - sx), Y(gy - sy), 1.4, 0, 2 * Math.PI); ctx.fill(); }
  }
  if (o.trail) {   // le chemin de A déjà parcouru, dans ce référentiel
    ctx.strokeStyle = FAINT; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let q = o.trailFrom ?? 0; q <= t; q += 0.04) { const p = stateIn(q, fr).pA; q ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  const A = [X(st.pA[0]), Y(st.pA[1])], B = [X(st.pB[0]), Y(st.pB[1])], n = CL.n, tn = [-n[1], n[0]];
  if (o.line && t >= (o.ntFrom ?? CL.C.t0 - 0.4)) {   // la ligne des centres au moment du contact
    ctx.strokeStyle = C_N; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(A[0] - n[0] * s * 0.5, A[1] + n[1] * s * 0.5); ctx.lineTo(A[0] + n[0] * s * 0.8, A[1] - n[1] * s * 0.8); ctx.stroke(); ctx.setLineDash([]);
  }
  disc(ctx, ...B, r, "#fde68a", INK, 1.2); disc(ctx, ...A, r, "#f1f5f9", INK, 1.2);
  const vA = st.vA, vB = st.vB, lw = Math.max(1.8, fs * 0.17);
  if (o.xy && Math.hypot(...vA) > 0.01) {   // composantes x et y de la vitesse de A
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C_A; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(A[0] + vA[0] * kv, A[1] - vA[1] * kv); ctx.lineTo(A[0] + vA[0] * kv, A[1]); ctx.moveTo(A[0] + vA[0] * kv, A[1] - vA[1] * kv); ctx.lineTo(A[0], A[1] - vA[1] * kv); ctx.stroke(); ctx.setLineDash([]);
    if (Math.abs(vA[0]) > 0.02) arrow(ctx, A[0], A[1], A[0] + vA[0] * kv, A[1], "#93c5fd", lw * 0.8, 7);
    if (Math.abs(vA[1]) > 0.02) arrow(ctx, A[0], A[1], A[0], A[1] - vA[1] * kv, "#93c5fd", lw * 0.8, 7);
    text(ctx, "vₓ", A[0] + vA[0] * kv * 0.5, A[1] + fs * 1.2, { size: fs * 0.9, c: C_A, align: "center" });
    text(ctx, "v_y", A[0] - fs * 0.4, A[1] - vA[1] * kv * 0.5, { size: fs * 0.9, c: C_A, align: "right" });
  }
  if (o.nt && t >= (o.ntFrom ?? -1e9)) {   // composantes le long de la ligne des centres (change) et en travers (ne change pas)
    const a = dot(vA, n), c = dot(vA, tn);
    if (Math.abs(a) > 0.02) arrow(ctx, A[0], A[1], A[0] + a * n[0] * kv, A[1] - a * n[1] * kv, C_N, lw, 8);
    if (Math.abs(c) > 0.02) arrow(ctx, A[0], A[1], A[0] + c * tn[0] * kv, A[1] - c * tn[1] * kv, SOFT, lw, 8);
    if (Math.abs(a) > 0.05) text(ctx, "v_n", A[0] + a * n[0] * kv + fs * 0.3, A[1] - a * n[1] * kv + fs, { size: fs * 0.9, c: C_N });
    text(ctx, "v_t", A[0] + c * tn[0] * kv + fs * 0.3, A[1] - c * tn[1] * kv - fs * 0.3, { size: fs * 0.9, c: SOFT });
  }
  if (Math.hypot(...vA) > 0.01) arrow(ctx, A[0], A[1], A[0] + vA[0] * kv, A[1] - vA[1] * kv, C_A, lw * 1.2, 9);
  if (Math.hypot(...vB) > 0.01) arrow(ctx, B[0], B[1], B[0] + vB[0] * kv, B[1] - vB[1] * kv, C_B, lw * 1.2, 9);
  if (o.force && st.F > 0) {   // la force de contact : sur A le long de −n, sur B le long de +n (troisième loi)
    const k = (st.F / CL.Fmax) * s * 0.45;
    arrow(ctx, A[0], A[1], A[0] - n[0] * k, A[1] + n[1] * k, C_F, lw * 1.4, 9);
    arrow(ctx, B[0], B[1], B[0] + n[0] * k, B[1] - n[1] * k, C_F, lw * 1.4, 9);
    if (o.forceLabel) text(ctx, `F = ${Math.round(st.Freal)} N`, A[0] - n[0] * k - fs * 0.5, A[1] + n[1] * k - fs * 0.6, { size: fs, c: C_F, align: "right" });
  }
  ctx.restore();
  return { st, X, Y, s, A, B };
}

/** Quantité de mouvement totale (x, y), maintenant et avant, et barre de l'énergie : cinétique (bleu) + stockée dans l'écrasement
 *  des billes pendant le contact (vert clair), dans le référentiel u. */
export function drawLedger(ctx, b, t, u, T, lang, fs = 10.5) {
  const nf = (x, d = 3) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const fr = typeof u === "function" ? u : frameConst(u), s0 = stateIn(0, frameConst(fr(1e9).u)), st = stateIn(t, fr), E0 = s0.E;   // « avant » : dans le référentiel final
  let y = b.y + fs;
  text(ctx, `p = (${nf(st.p[0])} ; ${nf(st.p[1])}) kg·m/s · ${T("cl-before", "before")} (${nf(s0.p[0])} ; ${nf(s0.p[1])})`, b.x, y, { size: fs, mono: true, maxW: b.w });
  y += fs * 1.6;
  const w = b.w * 0.55, h = fs * 0.8;
  ctx.fillStyle = "#e5e7eb"; ctx.fillRect(b.x, y, w, h);
  ctx.fillStyle = C_A; ctx.fillRect(b.x, y, w * (st.E / Math.max(E0, 1e-9)), h);
  if (st.E < E0 - 1e-9) { ctx.fillStyle = "#a7f3d0"; ctx.fillRect(b.x + w * (st.E / E0), y, w * (1 - st.E / E0), h); }
  text(ctx, `E ${nf(st.E * 1000, 0)}${st.E < E0 - 1e-9 ? ` + ${nf((E0 - st.E) * 1000, 0)}` : ""} mJ`, b.x + w + 6, y + h, { size: fs * 0.95, maxW: b.w - w - 6 });
  return y + h;
}
