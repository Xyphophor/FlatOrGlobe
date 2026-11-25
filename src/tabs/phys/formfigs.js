// Figures de l'onglet phys (2026-10-25) : une figure fixe par formule (règle du propriétaire), plus la cible justesse/fidélité.
// Schémas : tampon « not to scale » ; les deux tracés de l'exemple du pendule sont à l'échelle de leurs axes.
import { FIG, polar } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { PENDULUM_T, PENDULUM_FIT, stats, lineFit } from "./logic.js";
import { MECH_FIGS } from "./mechfigs.js";

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
function figMean(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-mean-alt", "A curve of position x against time t; two points at t1 and t2 joined by a straight chord; its slope, delta x over delta t, is the mean velocity") });
  const ox = 40, oy = 176, X = (t) => ox + t * 300, Y = (x) => oy - x * 140;
  const x = (t) => 0.1 + 0.9 * t * t;
  f.axes(ox, oy, 316, 160, { x: "t", y: "x" });
  let d = ""; for (let i = 0; i <= 50; i++) { const t = i / 50; d += (i ? "L" : "M") + X(t) + " " + Y(x(t)); } f.path(d, { c: C.ink, w: 1.8 });
  const t1 = 0.3, t2 = 0.85;
  f.line(X(t1), Y(x(t1)), X(t2), Y(x(t2)), { c: C.globe, w: 1.8 });
  f.dash(X(t1), Y(x(t1)), X(t2), Y(x(t1))); f.dash(X(t2), Y(x(t1)), X(t2), Y(x(t2)));
  f.dot(X(t1), Y(x(t1)), { r: 3.5 }); f.dot(X(t2), Y(x(t2)), { r: 3.5 });
  f.note((X(t1) + X(t2)) / 2, Y(x(t1)) + 14, "Δt", { size: 11, anchor: "middle" });
  f.note(X(t2) + 6, (Y(x(t1)) + Y(x(t2))) / 2, "Δx", { size: 11 });
  f.note(X(t1) - 4, Y(x(t1)) - 8, "(t₁, x₁)", { size: 10, anchor: "end" }); f.note(X(t2) - 6, Y(x(t2)) - 6, "(t₂, x₂)", { size: 10, anchor: "end" });
  f.note(X(0.45), Y(x(0.62)) - 6, tr("fx-mean-1", "slope = v̄"), { size: 10.5, c: C.globe, anchor: "end" });
  foot(f, tr("fx-mean-2", "the mean velocity is the slope of the chord"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figVec(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-vec-alt", "Left: a vector v with its components v x and v y along the axes. Right: two velocities added end to end, the airspeed and the wind, giving the ground speed") });
  const ox = 30, oy = 160;
  f.axes(ox, oy, 150, 130, { x: "x", y: "y" });
  f.arrow(ox, oy, ox + 120, oy - 90, { c: C.globe, w: 2.4 });
  f.dash(ox + 120, oy, ox + 120, oy - 90); f.dash(ox, oy - 90, ox + 120, oy - 90);
  f.note(ox + 60, oy + 14, "vₓ", { size: 11, anchor: "middle" }); f.note(ox - 6, oy - 45, "v_y", { size: 11, anchor: "end" });
  f.note(ox + 56, oy - 56, "v⃗", { size: 13, c: C.globe, anchor: "end" });
  const ax = 220, ay = 150;
  f.arrow(ax, ay, ax + 110, ay - 70, { c: C.ink, w: 2 }); f.arrow(ax + 110, ay - 70, ax + 140, ay - 20, { c: C.sea, w: 2 });
  f.arrow(ax, ay, ax + 140, ay - 20, { c: C.globe, w: 2.4, dash: "5 3" });
  f.note(ax + 40, ay - 52, tr("fx-vec-1", "air"), { size: 10.5 }); f.note(ax + 132, ay - 52, tr("fx-vec-2", "wind"), { size: 10.5, c: C.sea });
  f.note(ax + 82, ay + 4, tr("fx-vec-3", "ground"), { size: 10.5, c: C.globe });
  foot(f, tr("fx-vec-4", "vectors add end to end"));
  stamp(f, tr, tr("fx-sch", "schematic"));
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
function figGalileo(tr) {
  const f = FIG.make({ w: 380, h: 214, alt: tr("fx-gal-alt", "A platform frame and a train frame moving at constant speed V; a ball's position is x from the platform and x prime from the train, with x prime equal to x minus V t") });
  const y0 = 150;
  f.ground(y0, 10, 370);
  f.path(`M150 ${y0 - 6}L330 ${y0 - 6}L330 ${y0 - 56}L150 ${y0 - 56}Z`, { c: C.globe, w: 1.6, fill: C.coolwash });
  f.circle(180, y0 - 2, 5, { c: C.globe }); f.circle(300, y0 - 2, 5, { c: C.globe });
  f.arrow(240, y0 - 74, 300, y0 - 74, { c: C.globe, w: 2 }); f.note(270, y0 - 80, "V", { size: 12, c: C.globe, anchor: "middle" });
  f.dot(40, y0, { r: 3.5 }); f.note(40, y0 + 16, "O", { size: 11, anchor: "middle" });
  f.dot(160, y0 - 6, { r: 3.5, c: C.globe }); f.note(160, y0 - 64, "O′", { size: 11, c: C.globe, anchor: "middle" });
  f.dot(270, y0 - 30, { r: 5, c: C.flat });
  f.seg(40, y0 + 30, 270, y0 + 30, { label: "x", side: 12 });
  f.seg(160, y0 - 30, 270, y0 - 30, { label: "x′", side: -10, c: C.globe });
  f.seg(40, y0 - 100, 160, y0 - 100, { label: "V t", side: -10, c: C.soft });
  foot(f, tr("fx-gal-1", "speeds differ by V; accelerations are the same"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figRotFrame(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-rot-alt", "Left: a disc turning, seen from outside; a ball rolled from the centre goes in a straight line. Right: the same ball seen from the turning disc curves to the side, the Coriolis effect") });
  const R = 72, w = 0.9, steps = 30;
  const L = [100, 116], Rt = [280, 116];
  for (const P of [L, Rt]) {
    f.circle(...P, R, { c: C.soft, w: 1.2, fill: C.wash });
    f.angle(P[0], P[1], R + 8, 60, 110, { c: C.soft }); f.arrow(...polar(P[0], P[1], R + 8, 106), ...polar(P[0], P[1], R + 8, 112), { c: C.soft, head: 5 });
    f.note(P[0], P[1] - R - 16, "Ω", { size: 12, anchor: "middle" }); f.dot(...P, { r: 3 });
  }
  f.arrow(L[0], L[1], L[0] + R * 0.95, L[1], { c: C.globe, w: 2.2 });
  let d = "";
  for (let i = 0; i <= steps; i++) { const s = i / steps, r = s * R * 0.95, a = -w * s; d += (i ? "L" : "M") + (Rt[0] + r * Math.cos(a)) + " " + (Rt[1] - r * Math.sin(a)); }
  f.path(d, { c: C.flat, w: 2.2 });
  f.note(L[0], L[1] + R + 18, tr("fx-rot-1", "seen from outside"), { size: 10.5, anchor: "middle" });
  f.note(Rt[0], Rt[1] + R + 18, tr("fx-rot-2", "seen from the disc"), { size: 10.5, anchor: "middle" });
  foot(f, tr("fx-rot-3", "same ball, same push: the turning frame sees it curve"));
  stamp(f, tr, tr("fx-rot-st", "rotation exaggerated"));
  return f;
}
function figN2(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-n2-alt", "A block of mass m on the ground pushed by a force F and held back by friction; the net force gives an acceleration a in its direction") });
  const y0 = 140;
  f.ground(y0, 20, 360);
  f.path(`M150 ${y0}L230 ${y0}L230 ${y0 - 60}L150 ${y0 - 60}Z`, { c: C.ink, w: 1.6, fill: C.wash });
  f.note(190, y0 - 26, "m", { size: 14, anchor: "middle" });
  f.arrow(60, y0 - 30, 148, y0 - 30, { c: C.flat, w: 2.6 }); f.note(100, y0 - 38, "F", { size: 12, c: C.flat, anchor: "middle" });
  f.arrow(160, y0 + 8, 120, y0 + 8, { c: C.soft, w: 1.6 }); f.note(118, y0 + 22, tr("fx-n2-1", "friction"), { size: 10, anchor: "end" });
  f.arrow(240, y0 - 72, 310, y0 - 72, { c: C.globe, w: 2.2 }); f.note(276, y0 - 80, "a", { size: 12, c: C.globe, anchor: "middle" });
  f.note(250, y0 - 30, "a = ΣF / m", { size: 11.5, c: C.globe });
  foot(f, tr("fx-n2-2", "the net force sets the acceleration, not the speed"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figN3(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-n3-alt", "The Earth and an apple; the Earth pulls the apple down and the apple pulls the Earth up with an equal and opposite force") });
  f.path("M10 190A260 260 0 0 1 370 190", { c: C.sea, w: 2, fill: C.coolwash });
  f.circle(190, 50, 12, { c: C.flat, w: 2, fill: C.wash });
  f.arrow(190, 66, 190, 104, { c: C.flat, w: 2.4 }); f.note(198, 92, tr("fx-n3-1", "Earth on apple"), { size: 10.5, c: C.flat });
  f.arrow(190, 160, 190, 122, { c: C.globe, w: 2.4 }); f.note(198, 150, tr("fx-n3-2", "apple on Earth"), { size: 10.5, c: C.globe });
  f.note(8, 44, "F_A→B = −F_B→A", { size: 11.5 });
  f.note(8, 26, tr("fx-n3-3", "same force, opposite ways, on two different bodies"), { size: 9.5 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figGrav(tr) {
  const f = FIG.make({ w: 380, h: 180, alt: tr("fx-grav-alt", "Two masses m1 and m2 a distance r apart, each pulled towards the other by a force F") });
  f.circle(80, 90, 26, { c: C.ink, w: 1.6, fill: C.wash }); f.circle(300, 90, 14, { c: C.ink, w: 1.6, fill: C.wash });
  f.note(80, 95, "m₁", { size: 12, anchor: "middle" }); f.note(300, 95, "m₂", { size: 11, anchor: "middle" });
  f.arrow(108, 90, 160, 90, { c: C.globe, w: 2.2 }); f.arrow(284, 90, 232, 90, { c: C.globe, w: 2.2 });
  f.note(134, 82, "F", { size: 12, c: C.globe, anchor: "middle" }); f.note(258, 82, "F", { size: 12, c: C.globe, anchor: "middle" });
  f.seg(80, 140, 300, 140, { label: "r", side: 12 });
  f.note(150, 40, tr("fx-grav-1", "twice as far: a quarter of the force"), { size: 10.5 });
  foot(f, tr("fx-grav-2", "r between the centres"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figMoon(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-moon-alt", "The Earth and the Moon's orbit; in a short time the Moon would go straight along the tangent, but it falls towards the Earth by a small distance, keeping it on the circle") });
  const cx = 90, cy = 190, R = 16, r = 180, a0 = 55, a1 = 25;
  f.circle(cx, cy, R, { c: C.globe, w: 1.6, fill: C.coolwash });
  f.path(`M${polar(cx, cy, r, 80).join(" ")}A${r} ${r} 0 0 1 ${polar(cx, cy, r, 12).join(" ")}`, { c: C.faint, w: 1.2, dash: "4 3" });
  const M = polar(cx, cy, r, a0), N = polar(cx, cy, r, a1), tl = r * Math.tan((a0 - a1) * Math.PI / 180), s = Math.sin(a0 * Math.PI / 180), c = Math.cos(a0 * Math.PI / 180);
  const T = [M[0] + tl * s, M[1] + tl * c];   // tangente, sens horaire
  f.circle(M[0], M[1], 7, { c: C.soft, w: 1.4, fill: "#eee" }); f.circle(N[0], N[1], 7, { c: C.soft, w: 1.4, fill: "#eee" });
  f.arrow(M[0] + 8 * s, M[1] + 8 * c, T[0], T[1], { c: C.soft, w: 1.4, dash: "5 3" });
  f.arrow(T[0], T[1], N[0] + 6, N[1] - 4, { c: C.flat, w: 2.2 }); f.note(T[0] + 8, (T[1] + N[1]) / 2 + 10, tr("fx-moon-1", "fall"), { size: 10.5, c: C.flat });
  f.line(cx, cy, M[0], M[1], { c: C.faint, w: 1 }); f.note((cx + M[0]) / 2 - 6, (cy + M[1]) / 2, "r", { size: 11, anchor: "end" });
  f.note(T[0] + 6, T[1] - 6, tr("fx-moon-2", "straight on"), { size: 10 });
  f.note(cx + R + 8, cy + 4, tr("fx-moon-3", "Earth"), { size: 10 });
  foot(f, tr("fx-moon-4", "r = 60 R: g weakened 3,600 times"));
  stamp(f, tr, tr("fx-moon-st", "fall enlarged"));
  return f;
}
function figOmega(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-om-alt", "A turning disc; two points at radii r1 and r2 turn through the same angle in the same time, the outer one covering a longer arc, so it goes faster") });
  const cx = 110, cy = 104, a0 = 20, a1 = 70;
  f.circle(cx, cy, 80, { c: C.faint, w: 1.2 }); f.circle(cx, cy, 40, { c: C.faint, w: 1.2 });
  for (const [r, w] of [[40, 2], [80, 3]]) { const A = polar(cx, cy, r, a0), B = polar(cx, cy, r, a1); f.path(`M${A[0]} ${A[1]}A${r} ${r} 0 0 0 ${B[0]} ${B[1]}`, { c: C.globe, w }); }
  f.line(cx, cy, ...polar(cx, cy, 80, a0), { c: C.ink, w: 1.2 }); f.line(cx, cy, ...polar(cx, cy, 80, a1), { c: C.ink, w: 1.2 });
  f.angle(cx, cy, 18, a0, a1, { label: "Δθ", pad: 10 });
  const P = polar(cx, cy, 80, a1); f.arrow(P[0], P[1], P[0] - 34 * Math.sin(a1 * Math.PI / 180), P[1] - 34 * Math.cos(a1 * Math.PI / 180), { c: C.flat, w: 2 });
  f.note(P[0] - 40, P[1] - 30, "v", { size: 12, c: C.flat, anchor: "end" });
  f.note(222, 70, "ω = Δθ / Δt", { size: 11.5, c: C.globe }); f.note(222, 92, tr("fx-om-1", "same ω for every point"), { size: 10.5 });
  f.note(222, 112, tr("fx-om-2", "v = ω r: faster outside"), { size: 10.5 });
  foot(f, tr("fx-om-3", "Earth: ω = 7.292 × 10⁻⁵ rad/s"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figCentri(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-cen-alt", "A body on a circle at two nearby instants, with velocity arrows of equal length; their difference delta v, moved to one point, points to the centre") });
  const cx = 120, cy = 116, R = 78, a1 = 100, a2 = 50;
  f.circle(cx, cy, R, { c: C.faint, w: 1.2 }); f.dot(cx, cy, { r: 3 });
  const vec = (a) => [Math.sin(a * Math.PI / 180) * 56, Math.cos(a * Math.PI / 180) * 56];   // sens horaire, de a1 vers a2
  const P1 = polar(cx, cy, R, a1), P2 = polar(cx, cy, R, a2), v1 = vec(a1), v2 = vec(a2);
  f.dot(...P1, { r: 3.5 }); f.dot(...P2, { r: 3.5 });
  f.arrow(P1[0], P1[1], P1[0] + v1[0], P1[1] + v1[1], { c: C.globe, w: 2 }); f.note(P1[0] + v1[0] / 2, P1[1] + v1[1] / 2 - 8, "v₁", { size: 11, c: C.globe, anchor: "middle" });
  f.arrow(P2[0], P2[1], P2[0] + v2[0], P2[1] + v2[1], { c: C.globe, w: 2 }); f.note(P2[0] + v2[0] + 6, P2[1] + v2[1], "v₂", { size: 11, c: C.globe });
  const Q = [282, 92];
  f.arrow(Q[0], Q[1], Q[0] + v1[0], Q[1] + v1[1], { c: C.globe, w: 1.6 }); f.arrow(Q[0], Q[1], Q[0] + v2[0], Q[1] + v2[1], { c: C.globe, w: 1.6 });
  f.arrow(Q[0] + v1[0], Q[1] + v1[1], Q[0] + v2[0], Q[1] + v2[1], { c: C.flat, w: 2.4 });
  f.note(Q[0] + (v1[0] + v2[0]) / 2 + 8, Q[1] + (v1[1] + v2[1]) / 2 + 4, "Δv", { size: 11, c: C.flat });
  f.dot(...Q, { r: 2.5 }); f.note(Q[0] - 4, Q[1] + 16, tr("fx-cen-2", "same origin"), { size: 9.5, anchor: "end" });
  const mid = (a1 + a2) / 2, M = polar(cx, cy, R, mid), I = polar(cx, cy, R - 34, mid);
  f.arrow(M[0], M[1], I[0], I[1], { c: C.flat, w: 2.4 }); f.note(I[0] + 6, I[1] + 12, "a_c", { size: 11, c: C.flat });
  foot(f, tr("fx-cen-1", "Δv points to the centre: a = v²/r"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figSidereal(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-sid-alt", "The Sun and the Earth at two points of its orbit one day apart; after one turn relative to the stars the same place does not face the Sun yet, the Earth has to turn a little more") });
  const S = [190, 170], R = 136, a1 = 115, a2 = 75, er = 18;
  f.circle(S[0], S[1], 14, { c: C.flat, w: 2, fill: C.wash }); f.note(S[0] + 20, S[1] + 4, tr("fx-sid-4", "Sun"), { size: 10 });
  f.path(`M${polar(...S, R, 140).join(" ")}A${R} ${R} 0 0 1 ${polar(...S, R, 40).join(" ")}`, { c: C.faint, w: 1.2, dash: "4 3" });
  const E1 = polar(...S, R, a1), E2 = polar(...S, R, a2);
  for (const E of [E1, E2]) f.circle(E[0], E[1], er, { c: C.globe, w: 1.6, fill: C.coolwash });
  f.arrow(...E1, ...polar(...E1, er + 10, a1 + 180), { c: C.ink, w: 1.8 });
  f.arrow(...E2, ...polar(...E2, er + 10, a1 + 180), { c: C.ink, w: 1.8, dash: "4 3" });
  f.arrow(...E2, ...polar(...E2, er + 10, a2 + 180), { c: C.flat, w: 1.8 });
  f.note(E1[0] - 24, E1[1] + 4, tr("fx-sid-1", "noon"), { size: 10, anchor: "end" });
  f.note(E2[0] + 28, E2[1] - 4, tr("fx-sid-2", "one turn vs stars"), { size: 10 });
  f.note(E2[0] + 28, E2[1] + 12, tr("fx-sid-3", "noon: a bit more"), { size: 10, c: C.flat });
  foot(f, tr("fx-sid-5", "366.24 turns vs stars = 365.24 noons a year"));
  stamp(f, tr, tr("fx-sid-st", "one day's motion enlarged"));
  return f;
}
function figEnergy(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-en-alt", "A ball falling from height h; bars beside it show its potential energy decreasing and its kinetic energy increasing, their sum constant") });
  const y0 = 186, x0 = 90, h = 150;
  f.ground(y0, 20, 360); f.seg(40, y0, 40, y0 - h, { label: "h", side: -12 });
  const pos = [0, 0.5, 1];
  pos.forEach((s, i) => {
    const y = y0 - h + s * (h - 10);
    f.circle(x0 + i * 0, y, 7, { c: C.ink, w: 1.4, fill: i === 0 ? C.wash : "none", dash: i ? "3 2" : undefined });
    const bx = 170 + i * 66, H = 110;
    f.path(`M${bx} ${y0}L${bx} ${y0 - H * (1 - s)}L${bx + 18} ${y0 - H * (1 - s)}L${bx + 18} ${y0}Z`, { c: C.flat, w: 1, fill: C.wash });
    f.path(`M${bx + 20} ${y0}L${bx + 20} ${y0 - H * s}L${bx + 38} ${y0 - H * s}L${bx + 38} ${y0}Z`, { c: C.globe, w: 1, fill: C.coolwash });
    f.dash(bx - 4, y0 - H, bx + 42, y0 - H);
  });
  f.note(179, 30, "mgh", { size: 11, c: C.flat, anchor: "middle" }); f.note(199, 30, "½mv²", { size: 11, c: C.globe, anchor: "start" });
  f.note(350, y0 - 116, tr("fx-en-1", "sum"), { size: 10, anchor: "end" });
  f.arrow(x0 + 14, y0 - h + 4, x0 + 14, y0 - 20, { c: C.soft, w: 1.2 });
  foot(f, tr("fx-en-2", "top, half-way, bottom: the total stays the same"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figMom(tr) {
  const f = FIG.make({ w: 380, h: 170, alt: tr("fx-mom-alt", "Two skaters, a heavy one and a light one, push each other apart; the light one leaves faster, the momenta are equal and opposite") });
  const y0 = 130;
  f.ground(y0, 20, 360);
  f.circle(160, y0 - 34, 22, { c: C.ink, w: 1.6, fill: C.wash }); f.note(160, y0 - 30, "2m", { size: 11, anchor: "middle" });
  f.circle(218, y0 - 24, 13, { c: C.ink, w: 1.6, fill: C.wash }); f.note(218, y0 - 20, "m", { size: 11, anchor: "middle" });
  f.arrow(134, y0 - 34, 94, y0 - 34, { c: C.globe, w: 2.2 }); f.note(112, y0 - 42, "v", { size: 12, c: C.globe, anchor: "middle" });
  f.arrow(234, y0 - 24, 314, y0 - 24, { c: C.flat, w: 2.2 }); f.note(274, y0 - 32, "2v", { size: 12, c: C.flat, anchor: "middle" });
  f.note(190, 36, "2m · v = m · 2v", { size: 11.5, anchor: "middle" });
  foot(f, tr("fx-mom-1", "total momentum zero before, zero after"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figKep2(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-k2-alt", "An elliptical orbit with the Sun at one focus; two shaded sectors of equal area, one short and wide near the Sun, one long and thin far from it, swept in equal times") });
  const cx = 190, cy = 108, a = 150, b = 86, c = Math.sqrt(a * a - b * b), F = [cx + c * 0.92, cy];
  f.ellipse(cx, cy, a, b, { c: C.ink, w: 1.4 });
  f.circle(...F, 8, { c: C.flat, w: 2, fill: C.wash });
  const pt = (E) => [cx + a * Math.cos(E), cy - b * Math.sin(E)];
  const sector = (E1, E2, fill) => { let d = `M${F[0]} ${F[1]}`; for (let i = 0; i <= 24; i++) { const p = pt(E1 + (E2 - E1) * i / 24); d += `L${p[0]} ${p[1]}`; } f.path(d + "Z", { c: C.globe, w: 1, fill }); };
  // aires égales : M = E − e sin E (anomalie moyenne) avance du même pas
  const e = c * 0.92 / a, solve = (M) => { let E = M; for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };
  const dM = 0.5;
  sector(solve(-dM / 2), solve(dM / 2), C.coolwash); sector(solve(Math.PI - dM / 2), solve(Math.PI + dM / 2), C.coolwash);
  f.note(F[0] + 30, F[1] - 50, "A", { size: 12, c: C.globe }); f.note(cx - a + 30, cy - 4, "A", { size: 12, c: C.globe });
  f.note(F[0], F[1] + 22, tr("fx-k2-1", "Sun"), { size: 10, anchor: "middle" });
  foot(f, tr("fx-k2-2", "equal areas in equal times: fast near, slow far"));
  stamp(f, tr, tr("fx-k2-st", "eccentricity exaggerated"));
  return f;
}
function figKep3(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-k3-alt", "Two circular orbits around the Earth of radii a and four a; the outer one takes eight times as long, since T squared grows as a cubed") });
  const cx = 110, cy = 108;
  f.circle(cx, cy, 10, { c: C.globe, w: 1.6, fill: C.coolwash });
  f.circle(cx, cy, 22, { c: C.ink, w: 1.2, dash: "4 3" }); f.circle(cx, cy, 88, { c: C.ink, w: 1.2, dash: "4 3" });
  f.dot(...polar(cx, cy, 22, 45), { r: 3 }); f.dot(...polar(cx, cy, 88, 45), { r: 3.5 });
  f.note(...polar(cx, cy, 30, 20), "a", { size: 11 }); f.note(...polar(cx, cy, 96, 20), "4a", { size: 11 });
  f.note(222, 60, "T² ∝ a³", { size: 12, c: C.globe });
  f.note(222, 84, tr("fx-k3-1", "4 × farther:"), { size: 10.5 }); f.note(222, 102, tr("fx-k3-2", "√(4³) = 8 × longer"), { size: 10.5 });
  f.note(222, 130, tr("fx-k3-3", "GPS: 26,560 km, 11.97 h"), { size: 10.5 }); f.note(222, 148, tr("fx-k3-4", "Moon: 384,400 km, 27.3 d"), { size: 10.5 });
  foot(f, tr("fx-k3-5", "the period depends on the size and on GM only"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figWave(tr) {
  const f = FIG.make({ w: 380, h: 180, alt: tr("fx-wave-alt", "A sine wave travelling to the right at speed v; the distance between two crests is the wavelength lambda") });
  const y0 = 96, A = 36, lam = 120, X0 = 20;
  f.line(X0, y0, 360, y0, { c: C.faint, w: 1 });
  let d = ""; for (let x = 0; x <= 340; x += 2) d += (x ? "L" : "M") + (X0 + x) + " " + (y0 - A * Math.sin(2 * Math.PI * (x - 30) / lam)); f.path(d, { c: C.globe, w: 2 });
  const c1 = X0 + 30 + lam / 4, c2 = c1 + lam;
  f.seg(c1, y0 - A - 12, c2, y0 - A - 12, { label: "λ", side: -10 });
  f.arrow(290, y0 + A + 18, 340, y0 + A + 18, { c: C.flat, w: 2 }); f.note(286, y0 + A + 22, "v", { size: 12, c: C.flat, anchor: "end" });
  foot(f, tr("fx-wave-1", "one period T: the wave moves one λ"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figSnell(tr) {
  const f = FIG.make({ w: 380, h: 224, alt: tr("fx-snell-alt", "A light ray passing from air into water bends towards the perpendicular; the angles theta 1 and theta 2 are measured from the perpendicular") });
  const P = [190, 104], th1 = 50 * Math.PI / 180, th2 = Math.asin(Math.sin(th1) / 1.333);
  f.path(`M10 ${P[1]}L370 ${P[1]}L370 200L10 200Z`, { c: C.sea, w: 0, fill: C.coolwash }); f.line(10, P[1], 370, P[1], { c: C.sea, w: 1.4 });
  f.dash(P[0], 14, P[0], 196);
  const A = [P[0] - 90 * Math.tan(th1), P[1] - 90], B = [P[0] + 88 * Math.tan(th2), P[1] + 88];
  f.arrow(...A, ...P, { c: C.flat, w: 2.2 }); f.arrow(...P, ...B, { c: C.flat, w: 2.2 });
  f.angleAt(...P, 40, [P[0], 14], A, { label: "θ₁", pad: 12 }); f.angleAt(...P, 40, [P[0], 196], B, { label: "θ₂", pad: 12 });
  f.note(20, 30, tr("fx-snell-1", "air"), { size: 10.5 }); f.note(20, 46, "n₁ = 1.000", { size: 10 });
  f.note(20, 130, tr("fx-snell-2", "water"), { size: 10.5, c: C.sea }); f.note(20, 146, "n₂ = 1.333", { size: 10, c: C.sea });
  foot(f, tr("fx-snell-3", "slower medium: the ray bends towards the perpendicular"));
  axesStamp(f, tr, tr("fx-snell-st", "true angles"));
  return f;
}
function figDoppler(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-dop-alt", "A source moving to the right emits circular wave fronts; ahead of it the fronts are squeezed together, higher frequency; behind it they are stretched, lower frequency") });
  const cy = 106, v = 0.6, n = 6, dt = 15, x0 = 190;
  for (let i = 0; i < n; i++) { const age = (n - i) * dt; f.circle(x0 - v * age, cy, age, { c: C.globe, w: 1.2 }); }
  f.dot(x0, cy, { r: 5, c: C.flat }); f.arrow(x0 + 6, cy, x0 + 38, cy, { c: C.flat, w: 2 });
  f.note(x0 + 22, cy + 18, "v_r", { size: 11, c: C.flat, anchor: "middle" });
  f.note(250, cy - 30, tr("fx-dop-1", "ahead: f higher"), { size: 10.5 });
  f.note(8, 30, tr("fx-dop-2", "behind: f lower"), { size: 10.5 });
  foot(f, tr("fx-dop-3", "only the speed along the line of sight counts"));
  stamp(f, tr, tr("fx-dop-st", "speed exaggerated"));
  return f;
}
function figMetre(tr) {
  const f = FIG.make({ w: 380, h: 160, alt: tr("fx-m-alt", "A light pulse travels one metre in one 299,792,458th of a second; the second itself is counted in oscillations of the caesium atom") });
  const y = 80;
  f.line(40, y, 340, y, { c: C.ink, w: 1.4 }); f.line(40, y - 8, 40, y + 8, { c: C.ink }); f.line(340, y - 8, 340, y + 8, { c: C.ink });
  f.arrow(50, y - 20, 330, y - 20, { c: C.flat, w: 2.2 });
  f.note(190, y - 28, tr("fx-m-1", "light, in 1/299,792,458 s"), { size: 10.5, c: C.flat, anchor: "middle" });
  f.note(190, y + 20, "1 m", { size: 12, anchor: "middle" });
  let d = ""; for (let x = 0; x <= 300; x += 2) d += (x ? "L" : "M") + (40 + x) + " " + (y + 48 - 8 * Math.sin(x / 4)); f.path(d, { c: C.sea, w: 1.2 });
  f.note(190, y + 70, tr("fx-m-2", "caesium: 9,192,631,770 oscillations = 1 s"), { size: 10, c: C.sea, anchor: "middle" });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}
function figGvar(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-gv-alt", "A turning sphere; at the pole gravity points to the centre at full strength; at the equator the centrifugal acceleration points outward and slightly reduces it") });
  const cx = 96, cy = 110, R = 76;
  f.circle(cx, cy, R, { c: C.globe, w: 1.6, fill: C.coolwash });
  f.dash(cx, cy - R - 14, cx, cy + R + 10);
  f.arrow(cx, cy - R, cx, cy - R + 50, { c: C.ink, w: 2.4 }); f.note(cx + 6, cy - R + 34, "g", { size: 12 });
  f.arrow(cx + R, cy, cx + R - 48, cy, { c: C.ink, w: 2.4 }); f.note(cx + R - 26, cy - 8, "GM/R²", { size: 10.5, anchor: "middle" });
  f.arrow(cx + R, cy + 12, cx + R + 26, cy + 12, { c: C.flat, w: 2 }); f.note(cx + R + 30, cy + 16, "ω²R", { size: 11, c: C.flat });
  f.note(222, 44, tr("fx-gv-1", "sphere: 9.820 → 9.786"), { size: 10.5 });
  f.note(222, 64, tr("fx-gv-2", "measured: 9.832 → 9.780"), { size: 10.5, c: C.globe });
  f.note(222, 84, tr("fx-gv-3", "(pole → equator, m/s²)"), { size: 10 });
  foot(f, tr("fx-gv-4", "the flattening makes up the rest"));
  stamp(f, tr, tr("fx-gv-st", "ω²R enlarged"));
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
  physFxRad: figRad, physFxSmall: figSmall, physFxMean: figMean, physFxVec: figVec, physFxChasles: figChasles, physFxComp: figComp, physFxSub: figSub, physFxTangent: figTangent, physFxArea: figArea, physFxGrad: figGrad,
  physFxGalileo: figGalileo, physFxRotFrame: figRotFrame, physFxN2: figN2, physFxN3: figN3, physFxGrav: figGrav, physFxMoon: figMoon,
  physFxOmega: figOmega, physFxCentri: figCentri, physFxSidereal: figSidereal, physFxEnergy: figEnergy, physFxMom: figMom, physFxKep2: figKep2, physFxKep3: figKep3,
  physFxWave: figWave, physFxSnell: figSnell, physFxDoppler: figDoppler, physFxMetre: figMetre, physFxGvar: figGvar,
  physFxSigma: figSigma, physFxLsq: figLsq, physFigTargets: figTargets, physFxBilin: figBilin,
  ...MECH_FIGS,   // la mécanique (2026-10-27), mechfigs.js
};
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "phys"); }
