// Figures de l'onglet math (2026-11-27, sorties de src/tabs/phys/formfigs.js quand l'onglet Basics a été coupé en Math et Physics) :
// une figure fixe par formule (règle du propriétaire), plus la cible justesse/fidélité. Schémas : tampon « not to scale » ; les
// tracés de l'exemple du pendule (données de src/tabs/phys/logic.js) sont à l'échelle de leurs axes.
import { FIG, polar } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { PENDULUM_T, PENDULUM_FIT, stats, lineFit } from "../phys/logic.js";

const C = FIG.C;
const foot = (f, s) => f.note(8, f.h - 6, s, { size: 9.5 });
function figRad(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-rad-alt", "A circle of radius r; an angle theta at the centre cuts an arc of length s on the circle; theta in radians is s divided by r") });
  const cx = 110, cy = 112, R = 74, a0 = 10, a1 = 75;
  f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  f.line(cx, cy, ...polar(cx, cy, R, a0), { c: C.ink, w: 1.4 }); f.line(cx, cy, ...polar(cx, cy, R, a1), { c: C.ink, w: 1.4 });
  const A = polar(cx, cy, R, a0), Bp = polar(cx, cy, R, a1);
  f.path(`M${A[0]} ${A[1]}A${R} ${R} 0 0 0 ${Bp[0]} ${Bp[1]}`, { c: C.globe, w: 3 });
  f.angle(cx, cy, 24, a0, a1, { label: "θ", pad: 10 });
  f.note(...polar(cx, cy, R + 12, (a0 + a1) / 2), "s", { size: 12, c: C.globe, anchor: "middle" });
  f.note(cx + 26, cy + 14, "r", { size: 11 });
  f.note(222, 70, "θ = s / r", { size: 12, c: C.globe });
  f.note(222, 96, tr("fx-rad-1", "full turn: 2πr / r = 2π"), { size: 10.5 });
  f.note(222, 116, "1 rad = 57.30°", { size: 10.5 });
  f.note(222, 136, "1″ = 4.848 × 10⁻⁶ rad", { size: 10.5 });
  foot(f, tr("fx-rad-2", "the radian: an arc measured in radii"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figSmall(tr) {
  const f = FIG.make({ w: 380, h: 170, alt: tr("fx-small-alt", "A long thin right triangle: an object of height h at distance d seen from the eye under a small angle theta; for small angles theta in radians is close to h over d") });
  const ex = 30, ey = 130, dx = 330, h = 50;
  f.line(ex, ey, dx, ey, { c: C.ink, w: 1.3 }); f.line(dx, ey, dx, ey - h, { c: C.flat, w: 2.6 }); f.line(ex, ey, dx, ey - h, { c: C.globe, w: 1.3 });
  f.rightAngle(dx, ey, [ex, ey], [dx, ey - h], 8);
  f.angleAt(ex, ey, 70, [dx, ey], [dx, ey - h], { label: "θ", pad: 12 });
  f.dot(ex, ey, { r: 3 }); f.note(ex, ey + 16, tr("fx-eye", "eye"), { size: 10, anchor: "middle" });
  f.note(dx + 6, ey - h / 2, "h", { size: 12, c: C.flat }); f.note((ex + dx) / 2, ey + 16, "d", { size: 12, anchor: "middle" });
  f.note(200, 50, "θ ≈ h / d", { size: 12, c: C.globe });
  foot(f, tr("fx-small-1", "error of tan θ ≈ θ: 0.01 % at 1°, 1 % at 10°"));
  stamp(f, tr, tr("fx-small-st", "angle enlarged"));
  return f;
}
function figChasles(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-ch-alt", "Left: points A, B and C; the arrows from A to B and from B to C, end to end, reach the same point as the arrow from A to C. Right: a path through four points A, B, C, D and the single arrow from A to D") });
  const A = [30, 160], B = [120, 60], Cc = [190, 140];
  f.arrow(...A, ...B, { c: C.globe, w: 2.2 }); f.arrow(...B, ...Cc, { c: C.globe, w: 2.2 }); f.arrow(...A, Cc[0] - 6, Cc[1] + 1, { c: C.flat, w: 2.4 });
  for (const [P, n, dx, dy] of [[A, "A", -4, 16], [B, "B", -4, -8], [Cc, "C", 8, 4]]) { f.dot(...P, { r: 3.5 }); f.note(P[0] + dx, P[1] + dy, n, { size: 12, c: C.ink }); }
  f.note(58, 100, "AB⃗", { size: 11, c: C.globe, anchor: "end" }); f.note(162, 92, "BC⃗", { size: 11, c: C.globe });
  f.note(110, 170, "AC⃗", { size: 11, c: C.flat, anchor: "middle" });
  const P2 = [[230, 170], [250, 80], [320, 110], [360, 50]];
  for (let i = 0; i < 3; i++) f.arrow(...P2[i], ...P2[i + 1], { c: C.globe, w: 1.8 });
  f.arrow(...P2[0], P2[3][0] - 4, P2[3][1] + 5, { c: C.flat, w: 2.2, dash: "5 3" });
  ["A", "B", "C", "D"].forEach((n, i) => { f.dot(...P2[i], { r: 3 }); f.note(P2[i][0] + (i === 0 ? -4 : 6), P2[i][1] + (i === 0 || i === 2 ? 16 : -6), n, { size: 11, c: C.ink }); });
  foot(f, tr("fx-ch-1", "only the start and the end count, not the path"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figComp(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-cp-alt", "Two vectors a and b end to end and their sum from the origin; their shadows on the x axis and on the y axis add up the same way") });
  const ox = 50, oy = 180, a = [110, -50], b = [90, -80];
  f.axes(ox, oy, 300, 160, { x: "x", y: "y" });
  const T1 = [ox + a[0], oy + a[1]], T2 = [T1[0] + b[0], T1[1] + b[1]];
  f.arrow(ox, oy, ...T1, { c: C.globe, w: 2.2 }); f.arrow(...T1, ...T2, { c: C.sea, w: 2.2 }); f.arrow(ox, oy, T2[0] - 4, T2[1] + 4, { c: C.flat, w: 2.4 });
  f.note(ox + a[0] / 2 + 4, oy + a[1] / 2 + 16, "a⃗", { size: 12, c: C.globe }); f.note(T1[0] + b[0] / 2 + 8, T1[1] + b[1] / 2 + 6, "b⃗", { size: 12, c: C.sea });
  f.note(ox + (a[0] + b[0]) / 2 - 10, oy + (a[1] + b[1]) / 2 - 6, "a⃗ + b⃗", { size: 11, c: C.flat, anchor: "end" });
  f.dash(...T1, T1[0], oy); f.dash(...T2, T2[0], oy); f.dash(...T1, ox, T1[1]); f.dash(...T2, ox, T2[1]);
  f.line(ox, oy + 8, T1[0], oy + 8, { c: C.globe, w: 3 }); f.line(T1[0], oy + 8, T2[0], oy + 8, { c: C.sea, w: 3 });
  f.note(ox + a[0] / 2, oy + 22, "aₓ", { size: 10.5, c: C.globe, anchor: "middle" }); f.note(T1[0] + b[0] / 2, oy + 22, "bₓ", { size: 10.5, c: C.sea, anchor: "middle" });
  f.line(ox - 8, oy, ox - 8, T1[1], { c: C.globe, w: 3 }); f.line(ox - 8, T1[1], ox - 8, T2[1], { c: C.sea, w: 3 });
  f.note(ox - 12, oy + a[1] / 2 + 4, "a_y", { size: 10.5, c: C.globe, anchor: "end" }); f.note(ox - 12, T1[1] + b[1] / 2 + 4, "b_y", { size: 10.5, c: C.sea, anchor: "end" });
  f.note(372, 136, tr("fx-cp-1", "the shadows add"), { size: 10.5, anchor: "end" }); f.note(372, 154, tr("fx-cp-2", "axis by axis"), { size: 10.5, anchor: "end" });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figSub(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-sb-alt", "Two vectors a and b from a common origin; the difference a minus b goes from the tip of b to the tip of a. Right: the same difference as a plus the opposite of b, end to end") });
  const O = [40, 160], a = [130, -100], b = [150, -20];
  const Ta = [O[0] + a[0], O[1] + a[1]], Tb = [O[0] + b[0], O[1] + b[1]];
  f.arrow(...O, ...Ta, { c: C.globe, w: 2.2 }); f.arrow(...O, ...Tb, { c: C.sea, w: 2.2 }); f.arrow(...Tb, Ta[0] + 2, Ta[1] + 5, { c: C.flat, w: 2.4 });
  f.dot(...O, { r: 3 });
  f.note(O[0] + a[0] / 2 - 8, O[1] + a[1] / 2, "a⃗", { size: 12, c: C.globe, anchor: "end" }); f.note(O[0] + b[0] / 2, O[1] + b[1] / 2 + 18, "b⃗", { size: 12, c: C.sea, anchor: "middle" });
  f.note((Ta[0] + Tb[0]) / 2 + 8, (Ta[1] + Tb[1]) / 2, "a⃗ − b⃗", { size: 11, c: C.flat });
  const O2 = [250, 160], Ta2 = [O2[0] + a[0] * 0.6, O2[1] + a[1] * 0.6], E2 = [Ta2[0] - b[0] * 0.6, Ta2[1] - b[1] * 0.6];
  f.arrow(...O2, ...Ta2, { c: C.globe, w: 1.8 }); f.arrow(...Ta2, ...E2, { c: C.sea, w: 1.8, dash: "4 3" }); f.arrow(...O2, E2[0] + 2, E2[1] + 4, { c: C.flat, w: 2 });
  f.note(Ta2[0] + 4, Ta2[1] - 6, "−b⃗", { size: 11, c: C.sea }); f.note(O2[0] + 4, O2[1] + 16, "a⃗ + (−b⃗)", { size: 10.5, c: C.flat });
  foot(f, tr("fx-sb-1", "a − b: from the tip of b to the tip of a"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figTangent(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-tan-alt", "The same position curve; chords from one point to points ever closer to it turn into the tangent line, whose slope is the instantaneous velocity dx over dt") });
  const ox = 40, oy = 176, X = (t) => ox + t * 300, Y = (x) => oy - x * 140, x = (t) => 0.1 + 0.9 * t * t;
  f.axes(ox, oy, 316, 160, { x: "t", y: "x" });
  let d = ""; for (let i = 0; i <= 50; i++) { const t = i / 50; d += (i ? "L" : "M") + X(t) + " " + Y(x(t)); } f.path(d, { c: C.ink, w: 1.8 });
  const t0 = 0.45, s = 1.8 * t0;
  for (const [t2, c] of [[0.95, C.faint], [0.75, C.soft], [0.58, C.ink]]) { f.line(X(t0), Y(x(t0)), X(t2), Y(x(t2)), { c, w: 1, dash: "4 3" }); f.dot(X(t2), Y(x(t2)), { r: 2.5, c }); }
  f.line(X(t0 - 0.3), Y(x(t0) - 0.3 * s), X(t0 + 0.42), Y(x(t0) + 0.42 * s), { c: C.globe, w: 2.2 });
  f.dot(X(t0), Y(x(t0)), { r: 4, c: C.globe });
  f.note(X(t0) + 8, Y(x(t0)) + 16, "t", { size: 11, c: C.globe });
  f.note(X(0.86), Y(x(t0) + 0.42 * s) + 2, "dx/dt", { size: 11, c: C.globe, anchor: "end" });
  foot(f, tr("fx-tan-1", "Δt → 0: the chord becomes the tangent"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figArea(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-area-alt", "A curve of velocity v against time t; the area under it, cut into thin slices of width dt, is the distance covered") });
  const ox = 40, oy = 168, X = (t) => ox + t * 300, Y = (v) => oy - v * 130, v = (t) => 0.25 + 0.6 * Math.sin(t * 2.4);
  f.axes(ox, oy, 316, 150, { x: "t", y: "v" });
  const n = 18; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; f.path(`M${X(i / n)} ${oy}L${X(i / n)} ${Y(v(t))}L${X((i + 1) / n)} ${Y(v(t))}L${X((i + 1) / n)} ${oy}Z`, { c: C.globe, w: 0.6, fill: C.coolwash }); }
  let d = ""; for (let i = 0; i <= 50; i++) { const t = i / 50; d += (i ? "L" : "M") + X(t) + " " + Y(v(t)); } f.path(d, { c: C.ink, w: 1.8 });
  f.seg(X(10 / n), oy + 10, X(11 / n), oy + 10, { label: "dt", side: 12 });
  f.note(X(0.36), Y(0.32), "∫ v dt", { size: 12, c: C.globe, anchor: "middle" });
  foot(f, tr("fx-area-1", "area under v(t) = distance covered"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figGrad(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-grad-alt", "Contour lines of a hill seen from above; at one point the gradient arrow points straight uphill, across the contour lines, with its east and north components") });
  const cx = 150, cy = 108;
  [22, 44, 66, 88].forEach((r, i) => f.ellipse(cx, cy, r * 1.35, r, { c: C.ground, w: 1.1 }));
  f.note(cx, cy + 4, tr("fx-grad-top", "top"), { size: 9.5, anchor: "middle" });
  const P = [cx + 66 * 1.35 * Math.cos(-0.6), cy - 66 * Math.sin(-0.6)];
  const g = [-(P[0] - cx) / (1.35 * 1.35), -(P[1] - cy)], L = Math.hypot(...g), u = [g[0] / L * 46, g[1] / L * 46];
  f.dot(P[0], P[1], { r: 3.5 });
  f.arrow(P[0], P[1], P[0] + u[0], P[1] + u[1], { c: C.globe, w: 2.4 });
  f.arrow(P[0], P[1], P[0] + u[0], P[1], { c: C.soft, w: 1.2 }); f.arrow(P[0] + u[0], P[1], P[0] + u[0], P[1] + u[1], { c: C.soft, w: 1.2 });
  f.note(P[0] + u[0] / 2, P[1] + 14, "∂h/∂x", { size: 10, anchor: "middle" });
  f.note(P[0] + u[0] - 6, P[1] + u[1] / 2 + 4, "∂h/∂y", { size: 10, anchor: "end" });
  f.note(P[0] + u[0] - 4, P[1] + u[1] - 6, "∇h", { size: 12, c: C.globe, anchor: "end" });
  f.note(300, 60, tr("fx-grad-1", "x: east"), { size: 10.5 }); f.note(300, 78, tr("fx-grad-2", "y: north"), { size: 10.5 });
  f.note(300, 96, tr("fx-grad-3", "lines: equal h"), { size: 10.5, c: C.ground });
  foot(f, tr("fx-grad-4", "the gradient points uphill, across the contours"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figSigma(tr) {
  const st = stats(PENDULUM_T);
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-sig-alt", "A histogram of twelve timings of a pendulum's period between 1.98 and 2.03 seconds, with the mean and one standard deviation either side") });
  const ox = 40, oy = 170, lo = 1.965, hi = 2.045, X = (t) => ox + (t - lo) / (hi - lo) * 320, bw = 0.01;
  f.axes(ox, oy, 326, 150, { x: "T (s)", y: tr("fx-sig-n", "count") });
  const bins = {}; for (const t of PENDULUM_T) { const k = Math.round(t * 100); bins[k] = (bins[k] || 0) + 1; }
  for (const [k, n] of Object.entries(bins)) { const t = k / 100; f.path(`M${X(t - bw / 2)} ${oy}L${X(t - bw / 2)} ${oy - n * 30}L${X(t + bw / 2)} ${oy - n * 30}L${X(t + bw / 2)} ${oy}Z`, { c: C.ink, w: 1, fill: C.wash }); }
  for (let t = 1.98; t <= 2.031; t += 0.01) f.note(X(t), oy + 14, t.toFixed(2), { size: 9, anchor: "middle" });
  f.line(X(st.mean), oy, X(st.mean), 36, { c: C.globe, w: 2 }); f.note(X(st.mean), 30, "x̄", { size: 12, c: C.globe, anchor: "middle" });
  f.dash(X(st.mean - st.sd), oy, X(st.mean - st.sd), 50, { c: C.globe }); f.dash(X(st.mean + st.sd), oy, X(st.mean + st.sd), 50, { c: C.globe });
  f.note(X(st.mean - st.sd) - 2, 46, "−σ", { size: 10.5, c: C.globe, anchor: "end" }); f.note(X(st.mean + st.sd) + 2, 46, "+σ", { size: 10.5, c: C.globe });
  foot(f, tr("fx-sig-1", "12 timings, invented for the example"));
  axesStamp(f, tr, tr("fx-sig-st", "invented data"));
  return f;
}
/* r et χ²/ν (2026-11-27, à la demande du propriétaire : « un morceau pour expliquer ces valeurs qu'on a rajoutées partout ») :
   des nuages inventés, tirés d'une suite fixe ; les valeurs affichées sont calculées sur les points dessinés. */
function lcg(seed) { let a = seed >>> 0; const u = () => ((a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296); return () => { let s = 0; for (let i = 0; i < 6; i++) s += u(); return (s - 3) * Math.SQRT2; }; }
const dec = (x, d) => x.toLocaleString((typeof document !== "undefined" && document.documentElement.lang) || "en", { minimumFractionDigits: d, maximumFractionDigits: d });
export function pearson(xs, ys) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let a = 0, b = 0, c = 0; for (let i = 0; i < n; i++) { a += (xs[i] - mx) * (ys[i] - my); b += (xs[i] - mx) ** 2; c += (ys[i] - my) ** 2; }
  return a / Math.sqrt(b * c);
}
/** χ²/ν d'une droite y = c x par zéro, avec σ connu. */
export function chi2nuThrough0(xs, ys, s) {
  let sxy = 0, sxx = 0; for (let i = 0; i < xs.length; i++) { sxy += xs[i] * ys[i]; sxx += xs[i] * xs[i]; }
  const c = sxy / sxx; let q = 0; for (let i = 0; i < xs.length; i++) q += ((ys[i] - c * xs[i]) / s) ** 2;
  return { c, chi: q / (xs.length - 1) };
}
export const CORR_SETS = (() => { const g = lcg(8), xs = Array.from({ length: 24 }, (_, i) => (i + 0.5) / 24);
  return [xs.map((x) => [x, 0.9 * x + 0.03 * g()]), xs.map((x) => [x, 0.45 + 0.25 * g()]), xs.map((x) => [x, 0.25 + 0.5 * x + 0.17 * g()])]; })();
export const CHI_SETS = (() => { const g = lcg(6), xs = Array.from({ length: 10 }, (_, i) => (i + 1) / 10), s = 0.05;
  return { s, sets: [xs.map((x) => [x, 0.8 * x + s * g()]), xs.map((x) => [x, 0.8 * x + 4 * s * g()]), xs.map((x) => [x, 0.8 * x + 0.25 * s * g()])] }; })();

function figCorr(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-corr-alt", "Three clouds of invented points: one along a straight line, correlation close to 1; one with no trend, correlation close to 0; one with a trend and a lot of scatter, correlation in between") });
  CORR_SETS.forEach((pts, j) => {
    const x0 = 14 + j * 124, y0 = 160, w = 108, h = 120;
    f.line(x0, y0, x0 + w, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x0, y0 - h, { c: C.faint, w: 1 });
    for (const [x, y] of pts) f.dot(x0 + x * w, y0 - Math.max(0, Math.min(1, y)) * h, { r: 2.4, c: j === 1 ? C.flat : C.globe });
    const r = pearson(pts.map((p) => p[0]), pts.map((p) => p[1]));
    f.note(x0 + w / 2, y0 + 16, `r = ${dec(r, 2).replace("-", "−")}`, { size: 11, anchor: "middle", c: C.ink });
  });
  foot(f, tr("fx-corr-1", "r: how well y follows x along a line; no model, no unit"));
  axesStamp(f, tr, tr("fx-sig-st", "invented data"));
  return f;
}

function figChi(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-chi-alt", "Three sets of ten invented points with their error bars around a fitted line: points scattered as much as their bars, chi squared per degree of freedom close to 1; points scattered four times their bars, much larger than 1; points far closer to the line than their bars, much smaller than 1") });
  const { s, sets } = CHI_SETS, lab = [tr("fx-chi-a", "as the bars say"), tr("fx-chi-b", "more than the bars"), tr("fx-chi-c", "less than the bars")];
  sets.forEach((pts, j) => {
    const x0 = 14 + j * 124, y0 = 160, w = 108, h = 130, Y = (y) => y0 - ((y + 0.45) / 1.45) * h;   // de −0,45 à 1 : tous les points
    const { c, chi } = chi2nuThrough0(pts.map((p) => p[0]), pts.map((p) => p[1]), s);
    f.line(x0, y0, x0 + w, y0, { c: C.faint, w: 1 }); f.line(x0, Y(0), x0 + w, Y(c * 1.05), { c: C.globe, w: 1.6 });
    for (const [x, y] of pts) { const X = x0 + x * w * 0.95; f.line(X, Y(y - s), X, Y(y + s), { c: C.soft, w: 1 }); f.dot(X, Y(y), { r: 2.4, c: j === 0 ? C.globe : C.flat }); }
    f.note(x0 + w / 2, y0 + 15, `χ²/ν = ${dec(chi, chi < 0.1 ? 2 : 1)}`, { size: 11, anchor: "middle", c: C.ink });
    f.note(x0 + w / 2, y0 + 28, lab[j], { size: 9.5, anchor: "middle" });
  });
  axesStamp(f, tr, tr("fx-sig-st", "invented data"));
  return f;
}

function figLsq(tr) {
  const fit = lineFit(PENDULUM_FIT);
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-lsq-alt", "Five points of T squared against the pendulum length L and the best straight line through them; the vertical gaps between the points and the line are the residuals") });
  const ox = 46, oy = 176, X = (L) => ox + L * 260, Y = (t2) => oy - t2 * 36;
  f.axes(ox, oy, 316, 160, { x: "L (m)", y: "T² (s²)" });
  for (const L of [0.2, 0.4, 0.6, 0.8, 1.0]) f.note(X(L), oy + 14, L.toFixed(1), { size: 9, anchor: "middle" });
  for (const t of [1, 2, 3, 4]) { f.line(ox - 3, Y(t), ox, Y(t), { c: C.faint, w: 1 }); f.note(ox - 6, Y(t) + 3, String(t), { size: 9, anchor: "end" }); }
  f.line(X(0), Y(fit.a), X(1.05), Y(fit.a + fit.b * 1.05), { c: C.globe, w: 1.8 });
  PENDULUM_FIT.forEach(([L, t2], i) => {
    const yl = fit.a + fit.b * L, k = 12;   // résidus agrandis ×12 pour se voir
    f.line(X(L), Y(yl), X(L), Y(yl + fit.res[i] * k), { c: C.flat, w: 1.6 });
    f.dot(X(L), Y(t2), { r: 3.5 });
  });
  f.note(X(0.12), Y(3.6), tr("fx-lsq-1", "slope 4π²/g"), { size: 10.5, c: C.globe });
  f.note(X(0.12), Y(3.1), tr("fx-lsq-2", "orange: residuals ×12"), { size: 10, c: C.flat });
  foot(f, tr("fx-lsq-3", "the line that makes the squared residuals smallest"));
  axesStamp(f, tr, tr("fx-sig-st", "invented data"));
  return f;
}
function figTargets(tr) {
  const f = FIG.make({ w: 380, h: 150, alt: tr("fx-tg-alt", "Four targets: scattered and off-centre, grouped and off-centre, scattered and centred, grouped and centred") });
  const pts = [[0.9, -0.5], [-0.6, 0.8], [0.3, 0.2], [-0.9, -0.4], [0.5, -0.9], [-0.2, -0.1]];
  const sets = [[0.6, [10, -8]], [0.18, [12, -10]], [0.6, [0, 0]], [0.18, [0, 0]]];
  sets.forEach(([s, off], i) => {
    const cx = 50 + i * 93, cy = 66;
    for (const r of [34, 22, 10]) f.circle(cx, cy, r, { c: C.soft, w: 1 });
    f.dot(cx, cy, { r: 1.8, c: C.flat });
    for (const p of pts) f.dot(cx + off[0] + p[0] * 34 * s, cy + off[1] + p[1] * 34 * s, { r: 2.6, c: C.globe });
  });
  const lab = [tr("fx-tg-1", "neither"), tr("fx-tg-2", "precise"), tr("fx-tg-3", "accurate"), tr("fx-tg-4", "both")];
  lab.forEach((s, i) => f.note(50 + i * 93, 122, s, { size: 10.5, anchor: "middle" }));
  foot(f, tr("fx-tg-5", "orange dot: the true value"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

// la lecture d'un modèle de terrain (2026-11-25, section Terrain models) : une case, ses quatre nœuds, le point lu
function figBilin(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-bilin-alt", "One cell of an elevation grid seen from above, side delta, with its four corner nodes z00, z10, z01 and z11; a point inside at fractions u and v of the side takes a weighted mean of the four heights; a sharp peak inside the cell is in none of them") });
  const x0 = 50, y0 = 30, D = 150, X = (u) => x0 + u * D, Y = (v) => y0 + D - v * D, u = 0.62, v = 0.38;
  f.path(`M${x0} ${y0}h${D}v${D}h${-D}Z`, { c: C.globe, w: 1.6 });
  [[0, 0, "z₀₀"], [1, 0, "z₁₀"], [0, 1, "z₀₁"], [1, 1, "z₁₁"]].forEach(([a, b, s]) => {
    f.dot(X(a), Y(b), { r: 4, c: C.globe });
    f.note(X(a) + (a ? 8 : -8), Y(b) + (b ? -6 : 14), s, { size: 11, c: C.globe, anchor: a ? "start" : "end" });
  });
  f.dash(X(u), Y(0), X(u), Y(v)); f.dash(X(0), Y(v), X(u), Y(v));
  f.dot(X(u), Y(v), { r: 3.5 }); f.note(X(u) + 6, Y(v) - 6, "z(x, y)", { size: 11 });
  f.note((X(0) + X(u)) / 2, Y(0) + 14, "u Δ", { size: 10.5, anchor: "middle" });
  f.note(X(0) - 6, (Y(0) + Y(v)) / 2 + 4, "v Δ", { size: 10.5, anchor: "end" });
  f.note(X(0.5), y0 - 8, "Δ", { size: 11, anchor: "middle" });
  // un pic entre les nœuds
  f.circle(X(0.3), Y(0.75), 7, { c: C.flat, w: 1.6 }); f.note(X(0.3) + 11, Y(0.75) + 4, tr("fx-bilin-1", "peak"), { size: 10, c: C.flat });
  f.note(222, 70, tr("fx-bilin-2", "the four weights add to 1:"), { size: 10.5 });
  f.note(222, 88, tr("fx-bilin-3", "z lies between the lowest"), { size: 10.5 });
  f.note(222, 104, tr("fx-bilin-4", "and the highest node"), { size: 10.5 });
  f.note(222, 132, tr("fx-bilin-5", "a peak narrower than Δ,"), { size: 10.5, c: C.flat });
  f.note(222, 148, tr("fx-bilin-6", "between nodes, is lost"), { size: 10.5, c: C.flat });
  foot(f, tr("fx-bilin-7", "reading a grid: a weighted mean of the cell's four nodes"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

export const FORMULA_FIGS = {
  mathFxRad: figRad, mathFxSmall: figSmall, mathFxChasles: figChasles, mathFxComp: figComp, mathFxSub: figSub,
  mathFxTangent: figTangent, mathFxArea: figArea, mathFxGrad: figGrad,
  mathFxSigma: figSigma, mathFxLsq: figLsq, mathFxCorr: figCorr, mathFxChi: figChi, mathFigTargets: figTargets, mathFxBilin: figBilin,
};
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "math"); }
