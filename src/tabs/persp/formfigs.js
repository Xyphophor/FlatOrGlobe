// Figures de l'onglet persp (2026-11-21) : une figure fixe par formule (règle du propriétaire). Schémas : tampon « not to
// scale » ; les deux tracés (l'angle, le Soleil plat) sont à l'échelle de leurs axes.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { angSize, ACUITY, flatElevation, flatSunAngDiam, FLAT_D_MAX, SUN_DIAM_DEG, DEG } from "./logic.js";

const C = FIG.C;
const foot = (f, s, y) => f.note(8, y ?? f.h - 6, s, { size: 9.5 });
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

function figAngle(tr, v) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("ag-alt", "The angle filled by a 1 metre object against its distance, on logarithmic scales: a straight line coming down for ever, crossing the eye's one-minute limit at 3.4 km, never reaching zero") });
  const x0 = 50, x1 = 360, y0 = 170, y1 = 30, lx = (d) => x0 + (Math.log10(d) / 5) * (x1 - x0), ly = (a) => y0 - ((Math.log10(a) + 2) / 5) * (y0 - y1);
  f.line(x0, y1, x0, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x1, y0, { c: C.faint, w: 1 });
  for (const [d, s] of [[1, "1 m"], [10, "10 m"], [100, "100 m"], [1e3, "1 km"], [1e4, "10 km"], [1e5, "100 km"]]) f.note(lx(d), y0 + 13, s, { size: 9.5, anchor: "middle" });
  for (const [a, s] of [[0.01, "0.01′"], [1, "1′"], [100, "100′"], [1000, "1000′"]]) f.note(x0 - 4, ly(a) + 3, s, { size: 9.5, anchor: "end" });
  const pts = []; for (let i = 0; i <= 60; i++) { const d = Math.pow(10, (5 * i) / 60); pts.push([lx(d), ly(angSize(1, d) * 60)]); }
  f.path(poly(pts), { c: C.globe, w: 2 });
  f.dash(x0, ly(ACUITY * 60), x1, ly(ACUITY * 60), { c: C.flat });
  f.note(x1, ly(1) - 5, tr("ag-eye", "the naked eye's limit, 1′"), { size: 9.5, anchor: "end", c: C.flat });
  const da = 1 / Math.tan(ACUITY * DEG); f.dot(lx(da), ly(1), { r: 3.5, c: C.flat }); f.note(lx(da) - 6, ly(1) + 14, `${v.gapAcuity ?? "3.4"} km`, { size: 9.5, anchor: "end", c: C.flat });
  f.note(x0 + 8, y1 + 6, tr("ag-1", "θ for s = 1 m: halves when d doubles, never 0"), { size: 10, c: C.globe });
  axesStamp(f, tr, tr("ag-st", "log scales"));
  return f;
}

function figPinhole(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("ph-alt", "A pinhole camera: a tree of height Y at distance Z in front of the pinhole, its inverted image of height y′ on the back wall at distance f; the two triangles are similar") });
  const px = 120, ay = 100;
  f.line(20, ay, 360, ay, { c: C.faint, w: 1, dash: "3 3" });
  f.line(px, 40, px, ay - 4, { c: C.ink, w: 2.5 }); f.line(px, ay + 4, px, 160, { c: C.ink, w: 2.5 });
  f.line(40, 50, 40, 150, { c: C.ink, w: 2.5 }); // le fond de la boîte
  const tx = 330, tt = 40; f.line(tx, ay, tx, tt, { c: C.sea, w: 3 }); f.circle(tx, tt, 8, { c: C.sea, fill: "#ccebe7" });
  const iy = ay + ((ay - tt) * (px - 40)) / (tx - px);
  f.line(tx, tt, 40, iy, { c: C.flat, w: 1.2 }); f.line(40, ay, 40, iy, { c: C.sea, w: 3 });
  f.note(tx + 6, (ay + tt) / 2, "Y", { size: 12, c: C.sea }); f.note(28, (ay + iy) / 2 + 4, "y′", { size: 12, c: C.sea, anchor: "end" });
  f.note((px + tx) / 2, ay + 16, "Z", { size: 12, anchor: "middle" }); f.note((40 + px) / 2, ay - 6, "f", { size: 12, anchor: "middle" });
  foot(f, tr("ph-1", "y′/f = Y/Z: twice as far, half as tall; never zero"));
  stamp(f, tr, tr("ph-st", "schematic"));
  return f;
}

function figVanish(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("vp-alt", "Left: two rails going away from the eye meet at a vanishing point on the horizon. Right: a fence parallel to the picture keeps its lines parallel") });
  const hy = 70, vx = 100;
  f.line(10, hy, 200, hy, { c: C.flat, w: 1, dash: "4 3" });
  f.path(poly([[20, 180], [vx, hy]]), { c: C.ink, w: 2 }); f.path(poly([[180, 180], [vx, hy]]), { c: C.ink, w: 2 });
  for (let i = 1; i < 9; i++) { const t = 1 - 1 / (1 + i * 0.45), y = 180 - t * (180 - hy), xl = 20 + t * (vx - 20), xr = 180 - t * (180 - vx); f.line(xl, y, xr, y, { c: C.ground, w: 1.2 }); }
  f.dot(vx, hy, { r: 3.5, c: C.flat }); f.note(vx, hy - 8, tr("vp-1", "vanishing point"), { size: 10, anchor: "middle", c: C.flat });
  for (let k = 0; k < 4; k++) f.line(230, 90 + k * 22, 365, 60 + k * 22, { c: C.globe, w: 2 });
  f.note(298, 172, tr("vp-2", "parallel to the picture:"), { size: 10, anchor: "middle", c: C.globe });
  f.note(298, 185, tr("vp-3", "they stay parallel"), { size: 10, anchor: "middle", c: C.globe });
  stamp(f, tr, tr("vp-st", "schematic"));
  return f;
}

function figSunset(tr, v) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("sf-alt", "The flat Sun's height angle and its apparent diameter against distance from 0 to 20,000 km: the height comes down to 14 degrees and the diameter to a quarter; measured, the height reaches 0 and the diameter stays 32 minutes of arc") });
  const x0 = 46, x1 = 330, y0 = 180, y1 = 30, X = (d) => x0 + (d / FLAT_D_MAX) * (x1 - x0), Ya = (a) => y0 - (a / 90) * (y0 - y1), Yd = (m) => y0 - (m / 40) * (y0 - y1);
  f.line(x0, y1, x0, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x1, y0, { c: C.faint, w: 1 }); f.line(x1, y1, x1, y0, { c: C.faint, w: 1 });
  for (const d of [0, 5000, 10000, 15000, 20000]) f.note(X(d), y0 + 13, `${d / 1000}k`, { size: 9.5, anchor: "middle" });
  f.note((x0 + x1) / 2, y0 + 26, tr("sf-x", "distance to the point under the Sun, km"), { size: 9.5, anchor: "middle" });
  for (const a of [0, 30, 60, 90]) f.note(x0 - 4, Ya(a) + 3, `${a}°`, { size: 9.5, anchor: "end", c: C.flat });
  for (const m of [0, 20, 40]) f.note(x1 + 4, Yd(m) + 3, `${m}′`, { size: 9.5, c: C.sea });
  const A = [], D = []; for (let i = 0; i <= 50; i++) { const d = 50 + (i / 50) * (FLAT_D_MAX - 50); A.push([X(d), Ya(flatElevation(d))]); D.push([X(d), Yd(flatSunAngDiam(d) * 60)]); }
  f.path(poly(A), { c: C.flat, w: 2 }); f.path(poly(D), { c: C.sea, w: 2 });
  f.dash(x0, Yd(SUN_DIAM_DEG * 60), x1, Yd(SUN_DIAM_DEG * 60), { c: C.sea });
  f.note(x1 - 4, Yd(SUN_DIAM_DEG * 60) - 4, tr("sf-meas", "measured disc, 32′, all day"), { size: 9.5, anchor: "end", c: C.sea });
  f.note(X(20000) - 4, Ya(flatElevation(20000)) - 6, `α ≥ ${v.alphaMin ?? "14"}°`, { size: 10, anchor: "end", c: C.flat });
  f.note(X(4000), Ya(60), tr("sf-a", "α, height above eye level"), { size: 10, c: C.flat });
  f.note(X(9000), Yd(13), tr("sf-d", "δ, apparent diameter"), { size: 10, c: C.sea });
  axesStamp(f, tr, `h = ${v.sunH ?? "5,000"} km`);
  return f;
}

/** Une demi-sphère du ciel vue de côté (projection orthographique), le Soleil à 10° à gauche, les grands cercles des rayons. */
function figRays(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("rs-alt", "The sky as a dome seen from the side: the beams drawn as great circles from the Sun, low on one side, over the sky to the antisolar point, below the horizon on the other side") });
  const cx = 190, cy = 140, Rr = 120, e = 10 * DEG, tilt = 0.32;
  const P = (x, y, z) => [cx + Rr * x, cy - Rr * (y * Math.cos(tilt) - z * Math.sin(tilt))];   // vue légèrement plongeante
  const ring = []; for (let i = 0; i <= 72; i++) { const a = (i / 72) * 2 * Math.PI; ring.push(P(Math.cos(a), 0, Math.sin(a))); }
  f.path(poly(ring), { c: C.ground, w: 1.4 });
  const dome = []; for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI; dome.push(P(Math.cos(a), Math.sin(a), 0)); }
  f.path(poly(dome), { c: C.faint, w: 1, dash: "3 3" });
  const s = [-Math.cos(e), Math.sin(e), 0];   // le Soleil à gauche
  for (const tz of [-0.8, -0.45, -0.15, 0.15, 0.45, 0.8]) {
    // le grand cercle par ±s et par un point g du ciel : base orthonormée (s, w)
    let g = [0, Math.cos(tz * 1.4), Math.sin(tz * 1.4)];
    const dt = g[0] * s[0] + g[1] * s[1] + g[2] * s[2]; let w = [g[0] - dt * s[0], g[1] - dt * s[1], g[2] - dt * s[2]]; const n = Math.hypot(...w); w = w.map((q) => q / n);
    const pts = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI, q = [0, 1, 2].map((j) => Math.cos(a) * s[j] + Math.sin(a) * w[j]); pts.push(P(...q)); }
    f.path(poly(pts), { c: "#d97706", w: 1.3 });
  }
  const S = P(...s), A = P(-s[0], -s[1], 0), E = P(0, 0, 0);
  f.circle(S[0], S[1], 7, { c: "#f59e0b", fill: "#fde68a" }); f.note(S[0] - 4, S[1] + 20, tr("rs-sun", "Sun"), { size: 10.5, anchor: "middle", c: C.flat });
  f.line(A[0] - 5, A[1] - 5, A[0] + 5, A[1] + 5, { c: "#7c2d12", w: 1.8 }); f.line(A[0] + 5, A[1] - 5, A[0] - 5, A[1] + 5, { c: "#7c2d12", w: 1.8 });
  f.note(A[0], A[1] + 18, tr("rs-anti", "antisolar point"), { size: 10.5, anchor: "end", c: "#7c2d12" });
  f.dot(E[0], E[1], { r: 3.5, c: C.globe }); f.note(E[0] + 6, E[1] + 14, tr("rs-eye", "eye"), { size: 10, c: C.globe });
  stamp(f, tr, tr("rs-st", "the sky as a sphere"));
  return f;
}

function figShadow(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("sh-alt", "Two maps seen from above. Left, a distant Sun: the shadows of five posts are parallel. Right, a Sun a few kilometres away: the shadows fan out from the point under the Sun, at an angle b over D between neighbours") });
  const posts = [-2, -1, 0, 1, 2], L = 50;
  f.note(95, 22, tr("sh-far", "distant Sun"), { size: 11, anchor: "middle", c: C.globe }); f.note(285, 22, tr("sh-near", "Sun D away"), { size: 11, anchor: "middle", c: C.flat });
  for (const p of posts) { const x = 95 + p * 30, y = 70; f.dot(x, y, { r: 3, c: C.ink }); f.line(x, y, x, y + L * 1.6, { c: C.soft, w: 4 }); }
  f.arrow(95, 60, 95, 34, { c: "#d97706", w: 1.4 }); f.note(104, 44, tr("sh-to", "to the Sun"), { size: 9.5, c: "#d97706" });
  const sx = 285, sy = 40; f.dot(sx, sy, { r: 5, c: "#f59e0b" }); f.note(sx + 8, sy + 3, tr("sh-under", "under the Sun"), { size: 9.5, c: "#d97706" });
  for (const p of posts) { const x = 285 + p * 26, y = 80, dx = x - sx, dy = y - sy, n = Math.hypot(dx, dy); f.dot(x, y, { r: 3, c: C.ink }); f.line(x, y, x + (dx / n) * L * 1.6, y + (dy / n) * L * 1.6, { c: C.soft, w: 4 }); f.dash(sx, sy, x, y, { c: "#f59e0b" }); }
  f.note(285, 188, "Δψ = b/D", { size: 11, anchor: "middle", c: C.flat }); f.note(95, 188, "Δψ = 0", { size: 11, anchor: "middle", c: C.globe });
  f.note(270, 80, "b", { size: 10.5, c: C.ink, anchor: "middle" });
  stamp(f, tr, tr("sh-st", "plan view"));
  return f;
}

function figZoom(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("zm-alt", "An eye above a curved sea looks at a distant boat: the line of sight grazing the horizon passes above the boat's waterline, hiding a height H; a narrower zoom cone around the same line hides exactly the same height") });
  const cx = 190, cy = 760, Rr = 640, ang = (x) => Math.asin((x - cx) / Rr), Ys = (x) => cy - Math.sqrt(Rr * Rr - (x - cx) ** 2);
  const pts = []; for (let x = 10; x <= 370; x += 6) pts.push([x, Ys(x)]); f.path(poly(pts), { c: C.sea, w: 2 });
  const ex = 30, ey = Ys(30) - 18, bx = 330, by = Ys(330);
  f.dot(ex, ey, { r: 3.5, c: C.globe }); f.note(ex, ey - 8, tr("zm-eye", "eye"), { size: 10, c: C.globe });
  // la tangente depuis l'œil
  let best = null; for (let x = 40; x < 360; x += 0.5) { const sl = (Ys(x) - ey) / (x - ex); if (!best || sl < best.sl) best = { sl, x }; }
  const yAt = (x) => ey + best.sl * (x - ex);
  f.line(ex, ey, 370, yAt(370), { c: C.globe, w: 1.3 });
  f.dot(best.x, Ys(best.x), { r: 3, c: C.ink }); f.note(best.x, Ys(best.x) + 14, tr("zm-hz", "horizon"), { size: 9.5, anchor: "middle" });
  const nang = ang(bx); f.line(bx, by, bx + Math.sin(nang) * 46, by - Math.cos(nang) * 46, { c: "#7f1d1d", w: 5 });
  const H = yAt(bx); f.line(bx + 12, by, bx + 12, H, { c: C.flat, w: 1.4 }); f.note(bx + 16, (by + H) / 2 + 4, "H", { size: 12, c: C.flat });
  f.path(poly([[ex, ey], [370, yAt(370) - 14], [370, yAt(370) + 14]]) + "Z", { c: "rgba(29,78,216,.4)", w: 1, fill: "rgba(29,78,216,.08)" });
  foot(f, tr("zm-1", "a zoom narrows the cone around the same line: H does not change"));
  stamp(f, tr, tr("zm-st", "schematic: a small planet"));
  return f;
}

function figDip(tr, v) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("dp-alt", "Left: an observer on a mountain on a globe; the line to the horizon dips below eye level by delta, opening a strip of sky below eye level. Right: an observer on a mountain on a plane; the Sun, far higher than the mountain, is above eye level, and the horizon is at eye level") });
  // le globe : un petit cercle (schéma), la montagne, le niveau, la tangente
  const cx = 95, cy = 250, R = 150, h = 26, ey = cy - R - h, d = Math.acos(R / (R + h));
  f.path(`M${cx - R * Math.sin(0.62)} ${cy - R * Math.cos(0.62)} A${R} ${R} 0 0 1 ${cx + R * Math.sin(0.62)} ${cy - R * Math.cos(0.62)}`, { c: C.globe, w: 2 });
  f.line(cx, cy - R, cx, ey, { c: C.ground, w: 3 });
  f.line(cx, ey, cx + 120, ey, { c: "#ca8a04", w: 1.4, dash: "5 4" });
  const tx = cx + R * Math.sin(d), ty = cy - R * Math.cos(d); f.line(cx, ey, tx + (tx - cx) * 0.55, ty + (ty - ey) * 0.55, { c: C.globe, w: 1.4 });
  f.angle(cx, ey, 70, -((d * 180) / Math.PI), 0, { c: C.flat });
  f.note(cx + 76, ey + 12, "δ", { size: 12, c: C.flat });
  f.note(cx + 122, ey + 4, tr("dp-level", "eye level"), { size: 9.5, c: "#ca8a04" });
  f.note(cx + 8, ey + 30, "h", { size: 11 });
  f.note(10, 200, tr("dp-g", "globe: a strip of sky below eye level"), { size: 10, c: C.globe });
  // le plan
  const px = 230, gy = 150, pey = gy - h;
  f.line(205, gy, 375, gy, { c: C.ground, w: 2.4 });
  f.line(px, gy, px, pey, { c: C.ground, w: 3 });
  f.line(px, pey, 375, pey, { c: "#ca8a04", w: 1.4, dash: "5 4" });
  f.circle(345, 40, 8, { c: "#f59e0b", fill: "#fde68a" }); f.line(px, pey, 345, 40, { c: C.flat, w: 1.3 });
  f.note(px + 30, pey - 22, "α > 0", { size: 11, c: C.flat });
  f.note(353, 28, "H", { size: 11 });
  f.note(205, 200, tr("dp-f", "plane: all the sky above eye level"), { size: 10, c: C.flat });
  stamp(f, tr, tr("dp-st", "schematic"));
  return f;
}

function figAnti(tr, v) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fa-alt", "The angle of the point where the anticrepuscular rays meet, as the Sun moves: over a plane it sinks no higher than 14 degrees below the horizon; on a globe it rises through the horizon at sunset and above it") });
  const x0 = 46, x1 = 360, y0 = 180, y1 = 30, lo = -30, hi = 10, X = (p) => x0 + p * (x1 - x0), Y = (a) => y1 + ((hi - a) / (hi - lo)) * (y0 - y1);
  f.line(x0, y1, x0, y0, { c: C.faint, w: 1 }); f.line(x0, Y(0), x1, Y(0), { c: C.ink, w: 1.2 });
  for (const a of [-30, -20, -10, 0, 10]) f.note(x0 - 4, Y(a) + 3, `${a}°`, { size: 9.5, anchor: "end" });
  f.note(x1, Y(0) - 4, tr("fa-hz", "eastern horizon"), { size: 9.5, anchor: "end" });
  const d0 = 5000 / Math.tan(25 * DEG), F = [], G = [];
  for (let i = 0; i <= 40; i++) { const p = i / 40, d = d0 + p * (FLAT_D_MAX - d0); F.push([X(p), Y(-flatElevation(d))]); G.push([X(p), Y(-(25 - 33 * p))]); }
  f.path(poly(F), { c: C.flat, w: 2 }); f.path(poly(G), { c: C.globe, w: 2 });
  f.dash(x0, Y(-flatElevation(FLAT_D_MAX)), x1, Y(-flatElevation(FLAT_D_MAX)), { c: C.flat });
  f.note(X(0.98), Y(-flatElevation(FLAT_D_MAX)) + 13, `${tr("fa-flat", "plane: never above")} −${v.alphaMin ?? "14"}°`, { size: 10, anchor: "end", c: C.flat });
  f.note(X(0.66), Y(8.5), tr("fa-globe", "globe: up through the horizon at sunset"), { size: 10, anchor: "end", c: C.globe });
  f.note((x0 + x1) / 2, y0 + 18, tr("fa-x", "time, the Sun moving (both start at 25°)"), { size: 9.5, anchor: "middle" });
  axesStamp(f, tr, "h_A = −α");
  return f;
}

export const FORMULA_FIGS = { persFxAngle: figAngle, persFxPinhole: figPinhole, persFxVanish: figVanish, persFxSunset: figSunset, persFxRays: figRays, persFxShadow: figShadow, persFxZoom: figZoom, persFxDip: figDip, persFxAnti: figAnti };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "persp"); }
