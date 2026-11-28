// Animations de l'onglet kappa (2026-11-27). 1. La définition : un point qui roule sur une courbe avec sa tangente, deux
// tangentes à Δs l'une de l'autre et l'angle Δθ qui les sépare, κ = Δθ/Δs et le cercle osculateur ; la courbe devient une
// droite (κ = 0) et un cercle (κ = 1/R) ; la caméra se lève sans coupure et les deux tournent autour de leur axe vertical :
// un plan et une sphère, leurs deux courbures principales et K = κ₁κ₂. Tout est dessiné par une seule projection
// orthographique (élévation 0 = la figure plane), à échelle uniforme. 2. Les cinq méthodes (methods.js).
import { anim2d, text, disc, arrow, stamp2d, INK, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { sampleCurve, atArc, WAVY, CIRCLE_R } from "./logic.js";

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const nfmt = (lang) => (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
const VIOLET = "#7c3aed";
/** Bandeau de texte lisible sur une figure : fond blanc translucide. */
export function tag(ctx, s, x, y, { size = 12.5, c = INK, bold = true, align = "left", maxW = 400 } = {}) {
  ctx.font = `${bold ? "600 " : ""}${size}px system-ui, sans-serif`;
  const w = Math.min(maxW, ctx.measureText(s).width), x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.fillStyle = "rgba(253,253,252,.86)"; ctx.fillRect(x0 - 4, y - size, w + 8, size * 1.45);
  return text(ctx, s, x, y, { size, c, bold, align, maxW });
}

/** Projection orthographique : azimut a autour de l'axe vertical y, élévation e (0 = vu de face, la figure plane). */
export function cam(cx, cy, k, a, e) {
  const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
  return (x, y, z) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; return [cx + k * x1, cy - k * (y * ce - z1 * se), z1 * ce + y * se]; };
}
const poly = (ctx, pts, col, w = 1.6, dash = null) => {
  if (pts.length < 2) return; ctx.strokeStyle = col; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); if (dash) ctx.setLineDash([]);
};
/** Une courbe 3D, la partie cachée (derrière, profondeur < 0) en pâle quand hide est vrai. */
function curve3(ctx, P, pts, col, w, hide = false, back = "rgba(29,78,216,.16)") {
  if (!hide) return poly(ctx, pts.map((p) => P(...p)), col, w);
  let seg = [], vis = null;
  const flush = () => { if (seg.length > 1) poly(ctx, seg, vis ? col : back, vis ? w : 1); seg = []; };
  for (const p of pts) { const q = P(...p), v = q[2] >= -1e-9; if (vis !== null && v !== vis) { seg.push(q); flush(); } vis = v; seg.push(q); }
  flush();
}

/* ---- la courbe ondulée, la droite, le cercle ------------------------------------------------------------------------- */
const WAVE = sampleCurve((t) => { const x = WAVY.x0 + (WAVY.x1 - WAVY.x0) * t; return [x, WAVY.y(x)]; }, 600);
const LINE_HALF = 40;
const lineAt = (p) => [-LINE_HALF + 2 * LINE_HALF * p, 0];
const circAt = (p) => { const t = Math.PI - 2 * Math.PI * p; return [CIRCLE_R * Math.cos(t), CIRCLE_R * Math.sin(t)]; };
const DS = 8;                                  // m : l'écart Δs entre les deux tangentes

/** Les deux tangentes, Δθ et le cercle osculateur d'une courbe plane (x, y en mètres, z = 0) à l'abscisse s. */
function tangents(ctx, P, k, at, s, L, { tr, lang, osc = true, r, size }) {
  const nf = nfmt(lang), a = at(s), b = at(Math.min(L, s + DS)), T = 16;
  const tl = (q, c) => { const ux = Math.cos(q.th), uy = Math.sin(q.th); poly(ctx, [P(q.x - T * ux, q.y - T * uy, 0), P(q.x + T * ux, q.y + T * uy, 0)], c, 2); };
  // le cercle osculateur en P (pointillés), s'il tient à peu près dans le cadre
  if (osc && Math.abs(a.k) > 1 / 300) {
    const rho = 1 / a.k, ox = a.x - Math.sin(a.th) * rho, oy = a.y + Math.cos(a.th) * rho, pts = [];
    for (let i = 0; i <= 96; i++) { const t = (2 * Math.PI * i) / 96; pts.push(P(ox + Math.abs(rho) * Math.cos(t), oy + Math.abs(rho) * Math.sin(t), 0)); }
    ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); poly(ctx, pts, "rgba(180,83,9,.75)", 1.2, [4, 4]);
    const c = P(ox, oy, 0); disc(ctx, c[0], c[1], 2.5, FLAT); poly(ctx, [c, P(a.x, a.y, 0)], "rgba(180,83,9,.5)", 1, [2, 3]); ctx.restore();
  }
  tl(a, GLOBE); tl(b, SEA);
  const pa = P(a.x, a.y, 0), pb = P(b.x, b.y, 0);
  // l'arc Δs, épais, entre les deux points
  const arcPts = []; for (let i = 0; i <= 12; i++) { const q = at(s + (DS * i) / 12); arcPts.push(P(q.x, q.y, 0)); }
  poly(ctx, arcPts, VIOLET, 3.5);
  disc(ctx, pa[0], pa[1], 4.5, GLOBE, PAPER, 1.5); disc(ctx, pb[0], pb[1], 4, SEA, PAPER, 1.5);
  // le rapporteur : les deux directions depuis un même point, et l'angle entre elles
  const dth = b.th - a.th, cx = r.x + r.w - 56, cy = r.y + 74, rr = 42;
  ctx.fillStyle = "rgba(253,253,252,.9)"; ctx.fillRect(cx - 50, cy - 50, 100, 100);
  arrow(ctx, cx, cy, cx + rr * Math.cos(a.th), cy - rr * Math.sin(a.th), GLOBE, 2, 7);
  arrow(ctx, cx, cy, cx + rr * Math.cos(b.th), cy - rr * Math.sin(b.th), SEA, 2, 7);
  if (Math.abs(dth) > 0.002) { ctx.strokeStyle = VIOLET; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rr * 0.55, -a.th, -b.th, dth > 0); ctx.stroke(); }
  text(ctx, `Δθ = ${nf(Math.abs(dth) / (Math.PI / 180), 1)}°`, cx, cy + 46 + size * 0.2, { size: size * 0.9, c: VIOLET, bold: true, align: "center" });
  const kk = Math.abs(dth) / DS;
  return { kk, dth, rho: kk > 1e-6 ? 1 / kk : Infinity, nf };
}

/** Les lectures en bas d'un cadre : Δs, Δθ en radians, κ et son rayon. */
function readout(ctx, r, o, tr, size, col = INK, extra) {
  const nf = o.nf, y = r.y + r.h - 10, rad = Math.abs(o.dth);
  const kS = o.kk < 1e-6 ? "0" : nf(o.kk, 3), rS = isFinite(o.rho) ? `${nf(o.rho, 0)} m` : "∞";
  const l1 = `Δs = ${DS} m · Δθ = ${nf(rad, 3)} rad`, l2 = `κ = Δθ/Δs = ${kS} /m · ${tr("an-df-rho", "radius")} 1/κ = ${rS}`;
  tag(ctx, l1, r.x + 6, y - size * 1.55, { size, c: col, bold: false, maxW: r.w - 12 });
  tag(ctx, extra ?? l2, r.x + 6, y, { size, c: col, maxW: r.w - 12 });
}

/** Phases (secondes) : courbe seule, partage et transformation, droite et cercle, levée en 3D, deux courbures principales. */
export const DEF_SPAN = 40;
const PH = { split: 10, flat2d: 14, rise: 24, k3d: 31 };

export function drawDef(ctx, W, H, u, tr, lang) {
  const nf = nfmt(lang), t = u * DEF_SPAN, size = W < 480 ? 11 : 12.5, narrow = W < 760, top = narrow ? 50 : 24, ty = narrow ? 32 : 16;   // téléphone : le titre sous le tampon
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const full = { x: 0, y: top, w: W, h: H - top };
  const side = W >= 560, L = side ? { x: 0, y: top, w: W / 2, h: H - top } : { x: 0, y: top, w: W, h: (H - top) / 2 };
  const Rp = side ? { x: W / 2, y: top, w: W / 2, h: H - top } : { x: 0, y: top + (H - top) / 2, w: W, h: (H - top) / 2 };
  const k1 = Math.min((full.w * 0.86) / 120, (full.h * 0.5) / 30);
  const k2 = Math.min((L.w * 0.8) / (2 * LINE_HALF), (L.h * 0.62) / (2 * CIRCLE_R + 6));
  if (t < PH.split) {
    // 1. une courbe, une tangente qui roule
    const P = cam(W / 2, top + full.h * 0.5, k1, 0, 0);
    poly(ctx, WAVE.P.map((p) => P(p[0], p[1], 0)), INK, 2.4);
    const s = WAVE.L * (0.08 + 0.8 * ease(t / PH.split));
    const o = tangents(ctx, P, k1, (q) => atArc(WAVE, q), s, WAVE.L, { tr, lang, r: full, size });
    readout(ctx, full, o, tr, size);
    tag(ctx, tr("an-df-t1", "A road seen from above: how fast does its direction turn?"), 8, ty, { size: size + 0.5, maxW: W - 16 });
  } else if (t < PH.flat2d) {
    // 2. la courbe se partage : à gauche elle se redresse, à droite elle se referme
    const m = ease((t - PH.split) / (PH.flat2d - PH.split));
    const P1 = cam(W / 2, top + full.h * 0.5, k1, 0, 0), PL = cam(L.x + L.w / 2, L.y + L.h * 0.52, k2, 0, 0), PR = cam(Rp.x + Rp.w / 2, Rp.y + Rp.h * 0.52, k2, 0, 0);
    for (const [Pt, tgt, col] of [[PL, lineAt, FLAT], [PR, circAt, GLOBE]]) {
      const pts = [];
      for (let i = 0; i <= 200; i++) { const p = i / 200, w = atArc(WAVE, p * WAVE.L), a = P1(w.x, w.y, 0), b = tgt(p), c = Pt(b[0], b[1], 0); pts.push([a[0] + (c[0] - a[0]) * m, a[1] + (c[1] - a[1]) * m]); }
      poly(ctx, pts, m > 0.5 ? col : INK, 2.4);
    }
    tag(ctx, tr("an-df-t2", "Straighten it: a line. Close it up evenly: a circle."), 8, ty, { size: size + 0.5, maxW: W - 16 });
  } else {
    // 3. la droite et le cercle ; 4. la caméra se lève, chacune tourne autour de son axe ; 5. κ₁ et κ₂
    const rise = ease((t - PH.rise) / (PH.k3d - PH.rise)), e = rise * 24 * (Math.PI / 180), az = rise * 0.5 + (t > PH.k3d ? (t - PH.k3d) * 0.05 : 0);
    const sweep = clamp((t - PH.rise - 1) / (PH.k3d - PH.rise - 1));
    const PL = cam(L.x + L.w / 2, L.y + L.h * (0.52 + 0.06 * rise), k2, az, e), PR = cam(Rp.x + Rp.w / 2, Rp.y + Rp.h * 0.52, k2, az, e);
    // les copies tournées autour de l'axe vertical : rayons du disque, méridiens de la sphère
    const M = 12, shown = sweep * M;
    for (let j = 1; j < M; j++) {
      const f = clamp(shown - j + 1); if (f <= 0) continue;
      const phi = (j * Math.PI) / M, cp = Math.cos(phi), sp = Math.sin(phi);
      const rot = (x, y) => [x * cp, y, -x * sp];
      const lp = []; for (let i = 0; i <= 2; i++) { const q = lineAt(i / 2); lp.push(rot(q[0], q[1])); }
      curve3(ctx, PL, lp, `rgba(180,83,9,${0.35 * f})`, 1.1);
      const cpts = []; for (let i = 0; i <= 96; i++) { const q = circAt(i / 96); cpts.push(rot(q[0], q[1])); }
      curve3(ctx, PR, cpts, `rgba(29,78,216,${0.45 * f})`, 1.1, true, `rgba(29,78,216,${0.12 * f})`);
    }
    if (sweep > 0.6) {
      const f = clamp((sweep - 0.6) / 0.4);
      for (const rr of [10, 20, 30, 40]) { const pts = []; for (let i = 0; i <= 96; i++) { const q = (2 * Math.PI * i) / 96; pts.push([rr * Math.cos(q), 0, rr * Math.sin(q)]); } curve3(ctx, PL, pts, `rgba(180,83,9,${0.35 * f})`, 1.1); }
      for (const lat of [-60, -30, 0, 30, 60]) { const y = CIRCLE_R * Math.sin((lat * Math.PI) / 180), rr = CIRCLE_R * Math.cos((lat * Math.PI) / 180), pts = []; for (let i = 0; i <= 96; i++) { const q = (2 * Math.PI * i) / 96; pts.push([rr * Math.cos(q), y, rr * Math.sin(q)]); } curve3(ctx, PR, pts, `rgba(29,78,216,${0.4 * f})`, 1, true, `rgba(29,78,216,${0.1 * f})`); }
    }
    if (sweep > 0) {   // le contour de la sphère vue de loin
      const c = PR(0, 0, 0); ctx.strokeStyle = `rgba(29,78,216,${0.6 * sweep})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(c[0], c[1], k2 * CIRCLE_R, 0, 2 * Math.PI); ctx.stroke();
    }
    // la droite et le cercle d'origine (plan z = 0)
    const lineP = [lineAt(0), lineAt(1)].map((q) => [q[0], q[1], 0]), circP = []; for (let i = 0; i <= 120; i++) { const q = circAt(i / 120); circP.push([q[0], q[1], 0]); }
    const k3 = t >= PH.k3d ? ease((t - PH.k3d) / 2) : 0;
    curve3(ctx, PL, lineP, FLAT, 2.4); curve3(ctx, PR, circP, GLOBE, 2.4, e > 0.01);
    if (t < PH.rise + 1.5) {
      const f = 1 - clamp((t - PH.rise) / 1.5), sL = 2 * LINE_HALF * (0.15 + 0.7 * ease((t - PH.flat2d) / (PH.rise - PH.flat2d))), sR = 2 * Math.PI * CIRCLE_R * (0.05 + 0.4 * ease((t - PH.flat2d) / (PH.rise - PH.flat2d)));
      ctx.globalAlpha = f;
      const atL = (q) => { const p = lineAt(q / (2 * LINE_HALF)); return { x: p[0], y: p[1], th: 0, k: 0 }; };
      const atR = (q) => { const p = q / (2 * Math.PI * CIRCLE_R), th = Math.PI - 2 * Math.PI * p - Math.PI / 2, xy = circAt(p); return { x: xy[0], y: xy[1], th, k: -1 / CIRCLE_R }; };
      const oL = tangents(ctx, PL, k2, atL, sL, 2 * LINE_HALF, { tr, lang, r: L, size, osc: false });
      const oR = tangents(ctx, PR, k2, atR, sR, 2 * Math.PI * CIRCLE_R, { tr, lang, r: Rp, size, osc: false });
      readout(ctx, L, oL, tr, size, FLAT, `κ = 0 · ${tr("an-df-line", "the tangent never turns")}`);
      readout(ctx, Rp, oR, tr, size, GLOBE, `κ = 1/R = ${nf(1 / CIRCLE_R, 3)} /m · ${tr("an-df-every", "everywhere the same")}`);
      ctx.globalAlpha = 1;
    }
    if (k3 > 0) {
      // les deux sections normales perpendiculaires au sommet : κ₁ et κ₂
      ctx.globalAlpha = k3;
      const pL1 = [[-LINE_HALF, 0, 0], [LINE_HALF, 0, 0]], pL2 = [[0, 0, -LINE_HALF], [0, 0, LINE_HALF]];
      curve3(ctx, PL, pL1, GLOBE, 2.6); curve3(ctx, PL, pL2, SEA, 2.6);
      const g1 = [], g2 = []; for (let i = 0; i <= 120; i++) { const q = (2 * Math.PI * i) / 120; g1.push([CIRCLE_R * Math.cos(q), CIRCLE_R * Math.sin(q), 0]); g2.push([0, CIRCLE_R * Math.sin(q), CIRCLE_R * Math.cos(q)]); }
      curve3(ctx, PR, g1, GLOBE, 2.6, true); curve3(ctx, PR, g2, SEA, 2.6, true);
      const tL = PL(0, 0, 0), tR = PR(0, CIRCLE_R, 0); disc(ctx, tL[0], tL[1], 4.5, INK, PAPER, 1.5); disc(ctx, tR[0], tR[1], 4.5, INK, PAPER, 1.5);
      const yb = (r) => r.y + r.h - 10;
      tag(ctx, `κ₁ = 0 · κ₂ = 0`, L.x + 6, yb(L) - size * 1.55, { size, c: FLAT, bold: false, maxW: L.w - 12 });
      tag(ctx, `K = κ₁κ₂ = 0 ${tr("an-df-every2", "at every point")}`, L.x + 6, yb(L), { size, c: FLAT, maxW: L.w - 12 });
      tag(ctx, `κ₁ = κ₂ = 1/R = ${nf(1 / CIRCLE_R, 3)} /m`, Rp.x + 6, yb(Rp) - size * 1.55, { size, c: GLOBE, bold: false, maxW: Rp.w - 12 });
      tag(ctx, `K = κ₁κ₂ = 1/R² = ${nf(1 / CIRCLE_R ** 2, 4)} /m²`, Rp.x + 6, yb(Rp), { size, c: GLOBE, maxW: Rp.w - 12 });
      ctx.globalAlpha = 1;
    }
    const title = t < PH.rise ? tr("an-df-t3", "A line never turns; a circle turns by the same angle for every metre")
      : t < PH.k3d ? tr("an-df-t4", "Turn each about its vertical axis: a plane, a sphere")
      : tr("an-df-t5", "On a surface, two directions: K = κ₁κ₂");
    tag(ctx, title, 8, ty, { size: size + 0.5, maxW: W - 16 });
    tag(ctx, tr(t < PH.rise ? "an-df-lineL" : "an-df-planeL", t < PH.rise ? "straight line" : "plane"), L.x + 8, L.y + 18, { size, c: FLAT });
    tag(ctx, tr(t < PH.rise ? "an-df-circL" : "an-df-sphL", t < PH.rise ? `circle, R = ${CIRCLE_R} m` : `sphere, R = ${CIRCLE_R} m`).replace("{{R}}", CIRCLE_R), Rp.x + 8, Rp.y + 18, { size, c: GLOBE });
  }
  stamp2d(ctx, W, tr("an-df-st", "uniform scale, in metres; orthographic view"), false);
}

export function mountDef(canvas, tr, lang = "en") {
  return anim2d(canvas, { span: DEF_SPAN, u0: 0.05, draw: (ctx, W, H, u) => drawDef(ctx, W, H, u, tr, lang) });
}
