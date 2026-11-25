// Figures des formules de la mécanique de l'onglet phys (2026-10-27) : une figure fixe par formule. Schémas (tampon « not to
// scale »), sauf la parabole de la balle et la courbe de traînée, à l'échelle de leurs axes. Nombres : mechanics.js.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp } from "../../core/formfigs.js";
import { ballistic, BALL } from "./mechanics.js";

const C = FIG.C, AMBER = "#d97706";
const foot = (f, s) => f.note(8, f.h - 6, s, { size: 9.5 });
const rect = (f, x, y, w, h, o = {}) => f.path(`M${x} ${y}h${w}v${h}h${-w}Z`, o);

/** Une force et ses composantes ; trois forces qui se ferment en triangle. */
function figEquil(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-eq-alt", "Left, a force F at an angle theta split into its components F cos theta along x and F sin theta along y. Right, three forces of 3, 4 and 5 units placed end to end close a right triangle: their sum is zero") });
  const ox = 30, oy = 160, L = 120, th = 30 * Math.PI / 180, ex = ox + L * Math.cos(th), ey = oy - L * Math.sin(th);
  f.arrow(ox, oy, ox + 150, oy, { c: C.faint, w: 1.2 }); f.arrow(ox, oy, ox, oy - 110, { c: C.faint, w: 1.2 });
  f.dash(ex, ey, ex, oy); f.dash(ex, ey, ox, ey);
  f.arrow(ox, oy, ex, ey, { c: C.ink, w: 2.4 }); f.note(ox + 46, oy - 44, "F", { size: 12, c: C.ink });
  f.arrow(ox, oy, ex, oy, { c: C.globe, w: 2 }); f.note(ox + 40, oy + 16, "F cos θ", { size: 10.5, c: C.globe });
  f.arrow(ox, oy, ox, ey, { c: AMBER, w: 2 }); f.note(ox + 4, ey - 6, "F sin θ", { size: 10.5, c: AMBER });
  f.angle(ox, oy, 28, 0, 30, { label: "θ", pad: 10 });
  // le triangle 3-4-5
  const s = 20, x0 = 230, y0 = 160;
  f.arrow(x0, y0, x0 + 4 * s, y0, { c: C.sea, w: 2.2 }); f.arrow(x0 + 4 * s, y0, x0 + 4 * s, y0 - 3 * s, { c: C.globe, w: 2.2 }); f.arrow(x0 + 4 * s, y0 - 3 * s, x0, y0, { c: AMBER, w: 2.2 });
  f.note(x0 + 2 * s, y0 + 16, "4", { size: 11, anchor: "middle", c: C.sea }); f.note(x0 + 4 * s + 8, y0 - 1.5 * s, "3", { size: 11, c: C.globe }); f.note(x0 + 2 * s - 10, y0 - 1.5 * s - 8, "5", { size: 11, c: AMBER });
  f.note(x0 - 6, y0 - 82, tr("fx-eq-1", "end to end, closed: sum = 0"), { size: 10 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** Atwood : les deux diagrammes de forces. */
function figAtwood(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-at-alt", "Atwood's machine: a pulley with two blocks of masses m1 and m2 hanging on either side; on each block the rope's tension T pulls up and its weight pulls down; the heavier block accelerates down, the lighter up") });
  const cx = 130, top = 40, r = 22;
  f.line(cx - 50, 18, cx + 50, 18, { w: 2 }); f.line(cx, 18, cx, top, { w: 1.4 });
  f.circle(cx, top, r, { c: C.ink, w: 1.6, fill: "#e5e7eb" });
  f.line(cx - r, top, cx - r, 120, { w: 1.4 }); f.line(cx + r, top, cx + r, 90, { w: 1.4 });
  rect(f, cx - r - 18, 120, 36, 40, { c: C.ink, w: 1.6, fill: "#cbd5e1" }); f.note(cx - r, 145, "m₁", { size: 12, anchor: "middle", c: C.ink });
  rect(f, cx + r - 15, 90, 30, 30, { c: C.ink, w: 1.6, fill: "#cbd5e1" }); f.note(cx + r, 110, "m₂", { size: 12, anchor: "middle", c: C.ink });
  f.arrow(cx - r - 30, 160, cx - r - 30, 196, { c: AMBER, w: 2 }); f.note(cx - r - 36, 196, "m₁g", { size: 10.5, anchor: "end", c: AMBER });
  f.arrow(cx - r - 30, 124, cx - r - 30, 96, { c: C.globe, w: 2 }); f.note(cx - r - 36, 104, "T", { size: 11, anchor: "end", c: C.globe });
  f.arrow(cx + r + 26, 120, cx + r + 26, 146, { c: AMBER, w: 2 }); f.note(cx + r + 32, 146, "m₂g", { size: 10.5, c: AMBER });
  f.arrow(cx + r + 26, 94, cx + r + 26, 66, { c: C.globe, w: 2 }); f.note(cx + r + 32, 74, "T", { size: 11, c: C.globe });
  f.note(240, 120, "m₁ a = m₁g − T", { size: 11 }); f.note(240, 140, "m₂ a = T − m₂g", { size: 11 });
  f.note(240, 168, tr("fx-at-1", "add: T disappears"), { size: 10 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** Le palan : n brins tiennent la charge. */
function figTackle(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-tk-alt", "A block and tackle: an upper block fixed to the ceiling, a lower block holding the load, four strands of rope between them, and the free end pulled with a force F equal to a quarter of the weight") });
  const cx = 130;
  f.line(cx - 60, 18, cx + 60, 18, { w: 2 });
  rect(f, cx - 30, 30, 60, 18, { c: C.ink, w: 1.4, fill: "#e5e7eb" }); rect(f, cx - 30, 120, 60, 18, { c: C.ink, w: 1.4, fill: "#e5e7eb" });
  for (let j = 0; j < 4; j++) f.line(cx - 21 + j * 14, 48, cx - 21 + j * 14, 120, { c: C.globe, w: 1.6 });
  f.line(cx + 30, 39, cx + 54, 39, { c: C.globe, w: 1.6 }); f.arrow(cx + 54, 39, cx + 54, 92, { c: C.globe, w: 2.2 }); f.note(cx + 60, 80, "F = mg/4", { size: 11, c: C.globe });
  rect(f, cx - 26, 146, 52, 40, { c: C.ink, w: 1.6, fill: "#cbd5e1" }); f.note(cx, 172, "m", { size: 12, anchor: "middle" });
  f.line(cx, 138, cx, 146, { w: 1.4 });
  f.arrow(cx + 36, 186, cx + 36, 206, { c: AMBER, w: 2 }); f.note(cx + 42, 204, "mg", { size: 10.5, c: AMBER });
  f.note(250, 70, tr("fx-tk-1", "4 strands × F = mg"), { size: 10.5 });
  f.note(250, 92, tr("fx-tk-2", "rope pulled: 4 h"), { size: 10.5 }); f.note(250, 112, tr("fx-tk-3", "load raised: h"), { size: 10.5 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** L'impulsion : v + J/m, en triangle. */
function figImpulse(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-im-alt", "A velocity triangle: the old velocity v to the right, the change J over m at 60 degrees added at its tip, and the new velocity v prime from the start to the end") });
  const ox = 40, oy = 150, k = 60, v = [2, 0], dv = [1.5 * Math.cos(Math.PI / 3), 1.5 * Math.sin(Math.PI / 3)], v1 = [v[0] + dv[0], v[1] + dv[1]];
  f.arrow(ox, oy, ox + v[0] * k, oy, { c: C.globe, w: 2.4 }); f.note(ox + v[0] * k / 2, oy + 16, "v", { size: 12, c: C.globe, anchor: "middle" });
  f.arrow(ox + v[0] * k, oy, ox + v1[0] * k, oy - v1[1] * k, { c: AMBER, w: 2.4 }); f.note(ox + v[0] * k + 30, oy - 40, "J/m", { size: 12, c: AMBER });
  f.arrow(ox, oy, ox + v1[0] * k, oy - v1[1] * k, { c: C.ink, w: 2.8 }); f.note(ox + 60, oy - 52, "v′", { size: 12, c: C.ink });
  f.note(236, 60, tr("fx-im-1", "J: force × duration"), { size: 10.5 }); f.note(236, 80, tr("fx-im-2", "along the blow"), { size: 10.5 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** La même déviation dans deux référentiels : deux triangles des vitesses, la même flèche Δv. */
function figKickFrames(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-kf-alt", "Two velocity diagrams. Seen from the table, the velocity before the kick points right and the velocity after points up and to the right. Seen from the frame moving with the ball, the velocity before is zero and the velocity after points straight up. The change of velocity is the same upward arrow in both") });
  const k = 44;
  // le sol
  let ox = 30, oy = 150;
  f.arrow(ox, oy, ox + 2 * k, oy, { c: C.globe, w: 2.2 }); f.note(ox + k, oy + 16, "v", { size: 11, c: C.globe, anchor: "middle" });
  f.arrow(ox + 2 * k, oy, ox + 2 * k, oy - 1.5 * k, { c: AMBER, w: 2.4 }); f.note(ox + 2 * k + 6, oy - 0.75 * k, "Δv", { size: 11, c: AMBER });
  f.arrow(ox, oy, ox + 2 * k, oy - 1.5 * k, { c: C.ink, w: 2.6 }); f.note(ox + 22, oy - 52, "v + Δv", { size: 11 });
  f.note(ox, 30, tr("fx-kf-1", "from the table"), { size: 10.5 });
  // le référentiel de la bille
  ox = 250;
  f.dot(ox, oy, { r: 3.5, c: C.flat }); f.note(ox + 8, oy + 16, "v′ = 0", { size: 11, c: C.flat });
  f.arrow(ox, oy, ox, oy - 1.5 * k, { c: AMBER, w: 2.4 }); f.note(ox + 6, oy - 0.75 * k, "Δv′ = Δv", { size: 11, c: AMBER });
  f.note(ox - 30, 30, tr("fx-kf-2", "moving with the ball (u)"), { size: 10.5 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** Trois F(t) d'aires égales : une bande basse et longue, deux pics, un pic. */
function figSumJ(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-sj-alt", "Three graphs of force against time: a long low strip, two spikes, one taller spike; the three shaded areas are equal") });
  const rows = [[tr("fx-sj-1", "steady wind"), [[0.15, 0.85, 1]], C.sea], [tr("fx-sj-2", "two blows"), [[0.25, 0.32, 5], [0.6, 0.67, 5]], C.globe], [tr("fx-sj-3", "one blow"), [[0.45, 0.52, 10]], C.flat]];
  const x0 = 100, w = 250, hU = 4.2;
  rows.forEach(([lab, segs, c], i) => {
    const y0 = 66 + i * 52;
    f.line(x0, y0, x0 + w, y0, { c: C.faint, w: 1 });
    for (const [a, b, h] of segs) f.path(`M${x0 + a * w} ${y0}V${y0 - h * hU}H${x0 + b * w}V${y0}Z`, { c, w: 1.4, fill: c + "33" });
    f.note(x0 - 8, y0 - 4, lab, { size: 10.5, anchor: "end", c });
  });
  f.note(x0 + w, 186, "t", { size: 11, anchor: "end" });
  f.note(x0 + w * 0.5, 22, tr("fx-sj-4", "same area: same Δv"), { size: 10.5, anchor: "middle" });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** Le choc de billes : deux départs à 90°, le triangle des quantités de mouvement. */
function figBilliard(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-bi-alt", "Two equal balls: one at rest is struck off-centre; afterwards they move apart at a right angle, and their two momentum arrows end to end add up to the momentum of the striking ball") });
  const ox = 30, oy = 110, k = 70;
  f.circle(ox + 100, oy, 14, { c: C.ink, w: 1.4, fill: "#fde68a" }); f.circle(ox + 76, oy - 14, 14, { c: C.ink, w: 1.4, fill: "#f1f5f9" });
  f.arrow(ox, oy - 14, ox + 56, oy - 14, { c: C.globe, w: 2.2 }); f.note(ox + 10, oy - 22, "v", { size: 11, c: C.globe });
  f.arrow(ox + 100, oy, ox + 100 + 1.5 * k * 0.55, oy + 0.866 * k * 0.55, { c: AMBER, w: 2.2 }); f.note(ox + 150, oy + 46, "v₂′", { size: 11, c: AMBER });
  f.arrow(ox + 76, oy - 14, ox + 76 + 0.5 * k * 0.55, oy - 14 - 0.866 * k * 0.55, { c: C.soft, w: 2.2 }); f.note(ox + 100, oy - 54, "v₁′", { size: 11, c: C.soft });
  // le triangle
  const tx = 250, ty = 150, s = 52;
  f.arrow(tx, ty, tx + 2 * s, ty, { c: C.globe, w: 2 }); f.arrow(tx, ty, tx + 1.5 * s, ty - 0.866 * s, { c: AMBER, w: 2 }); f.arrow(tx + 1.5 * s, ty - 0.866 * s, tx + 2 * s, ty, { c: C.soft, w: 2 });
  f.rightAngle(tx + 1.5 * s, ty - 0.866 * s, [tx, ty], [tx + 2 * s, ty], 7);
  f.note(tx, ty + 18, tr("fx-bi-1", "m v = m v₁′ + m v₂′"), { size: 10 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** La force de Lorentz : le cercle. */
function figLorentz(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-lo-alt", "A positive charge on a circle in a magnetic field pointing into the page; its velocity is tangent to the circle and the magnetic force q v cross B points to the centre") });
  for (let x = 20; x < 240; x += 24) for (let y = 30; y < 190; y += 24) f.note(x, y, "×", { size: 10, c: C.faint, anchor: "middle" });
  const cx = 130, cy = 108, R = 62;
  f.circle(cx, cy, R, { c: C.soft, w: 1.2, dash: "4 4" });
  const px = cx + R, py = cy;
  f.arrow(px, py, px, py - 50, { c: C.globe, w: 2.2 }); f.note(px + 6, py - 44, "v", { size: 12, c: C.globe });
  f.arrow(px, py, px - 42, py, { c: AMBER, w: 2.4 }); f.note(px - 40, py - 6, "F", { size: 12, c: AMBER });
  f.circle(px, py, 7, { c: C.flat, w: 1.6, fill: "#fee2e2" });
  f.line(cx, cy, cx + R * Math.cos(2.3), cy - R * Math.sin(2.3), { c: C.soft, w: 1 }); f.note(cx - 30, cy - 18, "r", { size: 11 });
  f.note(260, 60, tr("fx-lo-1", "× : B into the page"), { size: 10.5 }); f.note(260, 82, "F ⊥ v", { size: 11 }); f.note(260, 104, "q v B = m v²/r", { size: 11 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** Ørsted : la boussole suit la somme des champs. */
function figOersted(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-oe-alt", "A compass seen from above with a wire just north of it; the Earth's horizontal field points north, the wire's field east, and the needle turns to their sum, at an angle delta from north") });
  const cx = 120, cy = 120, R = 44;
  f.circle(cx, cy, R, { c: C.ink, w: 1.4, fill: "#f8fafc" });
  f.circle(cx, cy - R - 24, 7, { c: C.ink, w: 1.4, fill: "#fde68a" }); f.note(cx + 12, cy - R - 20, tr("fx-oe-1", "wire, current upward"), { size: 10 });
  f.arrow(cx, cy, cx, cy - 40, { c: C.globe, w: 2 }); f.note(cx - 6, cy - 30, "B_H", { size: 10.5, anchor: "end", c: C.globe });
  f.arrow(cx, cy - 40, cx + 40, cy - 40, { c: AMBER, w: 2 }); f.note(cx + 42, cy - 44, "B_wire", { size: 10.5, c: AMBER });
  f.arrow(cx, cy, cx + 40, cy - 40, { c: C.ink, w: 2.6 });
  f.angle(cx, cy, 22, 45, 90, { label: "δ", pad: 9 });
  f.note(240, 90, "B_wire = μ₀ I / 2π d", { size: 11 }); f.note(240, 112, "tan δ = B_wire / B_H", { size: 11 });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

/** La parabole de la balle, à l'échelle de ses axes, avec v₀ et ses composantes. */
function figBallistic(tr, v) {
  const B = ballistic(), f = FIG.make({ w: 380, h: 190, alt: tr("fx-bl-alt", "The ball's path in a vacuum, a parabola from the launch point to 50 metres, at the same scale on both axes, with the launch velocity split into its horizontal and vertical components") });
  const ox = 22, oy = 150, s = 330 / 54, X = (x) => ox + x * s, Y = (y) => oy - y * s;
  f.line(ox - 6, oy, ox + 340, oy, { c: C.ground, w: 2 });
  let d = ""; B.vac.forEach((q, i) => { if (i % 20 === 0 || i === B.vac.length - 1) d += `${d ? "L" : "M"}${X(q.x).toFixed(1)} ${Y(q.y).toFixed(1)}`; });
  f.path(d, { c: C.globe, w: 2 });
  const k = 2.2, vx = B.vEnd[0], vy = B.vEnd[1];
  f.arrow(X(B.pEnd[0]), Y(B.pEnd[1]), X(B.pEnd[0]) + vx * k, Y(B.pEnd[1]) - vy * k, { c: C.ink, w: 2.2 }); f.note(X(B.pEnd[0]) + vx * k - 6, Y(B.pEnd[1]) - vy * k - 6, "v₀", { size: 11 });
  f.arrow(X(B.pEnd[0]), Y(B.pEnd[1]), X(B.pEnd[0]) + vx * k, Y(B.pEnd[1]), { c: C.soft, w: 1.4 }); f.arrow(X(B.pEnd[0]), Y(B.pEnd[1]), X(B.pEnd[0]), Y(B.pEnd[1]) - vy * k, { c: C.soft, w: 1.4 });
  for (const m of [0, 10, 20, 30, 40, 50]) f.note(X(m), oy + 14, `${m}`, { size: 9.5, anchor: "middle" });
  f.note(X(52), oy + 14, "m", { size: 9.5 });
  f.note(X(B.topVac.x), Y(B.topVac.y) - 8, `${v.bHmax ?? "6.93"} m`, { size: 10, anchor: "middle", c: C.globe });
  f.note(X(B.vac[B.vac.length - 1].x) - 8, oy - 26, `${v.bRange ?? "50.1"} m`, { size: 10, anchor: "end", c: C.globe });
  axesStamp(f, tr, tr("fx-bl-st", "x and y at the same scale; velocity arrows not"));
  return f;
}

/** La traînée en fonction de la vitesse, pour cette boule ; le poids d'une balle creuse de même taille la croise, celui de la boule
 *  d'acier est hors du cadre, 13 fois plus haut. */
function figDrag(tr) {
  const B = ballistic(), f = FIG.make({ w: 380, h: 190, alt: tr("fx-dr-alt", "Air drag on a 10 cm sphere against speed, a curve rising with the square of the speed up to about 2 newtons at 30 metres per second; the weight of a hollow 50 gram ball of the same size, a line the drag crosses near 15 metres per second; the steel ball's weight, 40 newtons, is far above the chart") });
  const ox = 46, oy = 150, w = 300, h = 110, vMax = 30, FMax = 2.5, X = (u) => ox + (u / vMax) * w, Y = (F) => oy - (F / FMax) * h;
  f.axes(ox, oy, w + 10, h + 14, { x: "v (m/s)", y: "N" });
  let d = ""; for (let u = 0; u <= vMax; u += 0.5) d += `${u ? "L" : "M"}${X(u).toFixed(1)} ${Y(B.k * u * u).toFixed(1)}`;
  f.path(d, { c: C.sea, w: 2 });
  const wPlastic = 0.05 * 9.81;   // une sphère creuse de 10 cm d'environ 50 g
  f.line(X(0), Y(wPlastic), X(vMax), Y(wPlastic), { c: C.soft, w: 1.2, dash: "4 3" }); f.note(X(vMax), Y(wPlastic) + 14, tr("fx-dr-2", "weight of a 50 g hollow ball, same size"), { size: 9.5, anchor: "end" });
  f.note(X(15), Y(B.k * 22 * 22) - 4, tr("fx-dr-3", "drag ½ρC_D A v²"), { size: 10, c: C.sea, anchor: "end" });
  f.arrow(X(4), Y(2.2), X(4), Y(2.6) - 6, { c: AMBER, w: 1.6 }); f.note(X(4) + 8, Y(2.4), tr("fx-dr-1", "steel ball's weight: 40 N, far above"), { size: 10, c: AMBER });
  for (const u of [0, 10, 20]) f.note(X(u), oy + 14, String(u), { size: 9.5, anchor: "middle" });
  for (const F of [0, 1, 2]) f.note(ox - 6, Y(F) + 4, String(F), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-dr-st", "sphere 10 cm, C_D 0.47"));
  return f;
}

export const MECH_FIGS = {
  physFxEquil: figEquil, physFxAtwood: figAtwood, physFxTackle: figTackle, physFxImpulse: figImpulse, physFxSumJ: figSumJ, physFxKickFrames: figKickFrames, physFxBilliard: figBilliard,
  physFxLorentz: figLorentz, physFxOersted: figOersted, physFxBallistic: figBallistic, physFxDrag: figDrag,
};
