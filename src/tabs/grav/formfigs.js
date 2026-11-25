// Schémas des formules de l'onglet grav (2026-10-01, revue de toute la page,
// epic15/UC04 : les méthodes pour refaire). Montés par index.js après
// drawSymbols, avant renderTexIn. Schématiques, tamponnés.
import { FIG, polar } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

/** L'horloge de Richer : la période d'un pendule dit g ; sur une sphère qui tourne, g baisse vers l'équateur. */
function figPendulum(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-pd-alt", "Left: a pendulum of length L swings with period T = 2π√(L/g); the same clock runs slower where g is smaller. Right: a turning sphere; at latitude φ the rotation throws outward by ω² R cos φ, most at the equator, so Cayenne near the equator has a smaller g than Paris") });
  const px = 70, py = 36, L = 120, th = 22 * Math.PI / 180;
  f.line(px - 30, py, px + 30, py, { c: C.ink, w: 2 });
  const B = [px + L * Math.sin(th), py + L * Math.cos(th)];
  f.line(px, py, ...B, { c: C.ink, w: 1.6 }); f.dash(px, py, px, py + L + 6, { c: C.faint });
  f.circle(...B, 9, { c: C.ink, w: 1.4, fill: "#d9dde3" });
  f.seg(px - 14, py, px - 14, py + L, { label: "L", tex: "L", c: C.soft, side: 10 });
  f.path(`M${px - L * 0.8 * Math.sin(th)} ${py + L * 0.8 * Math.cos(th)}A${L * 0.8} ${L * 0.8} 0 0 0 ${px + L * 0.8 * Math.sin(th)} ${py + L * 0.8 * Math.cos(th)}`, { c: C.globe, w: 1.2, dash: "3 3" });
  f.arrow(B[0], B[1] + 11, B[0], B[1] + 36, { c: C.flat, w: 2, head: 7 });
  f.txt(B[0] + 7, B[1] + 32, "g", { tex: "g", c: C.flat });
  f.txt(px - 40, 200, "T = 2π√(L/g)", { tex: "T = 2\\pi\\sqrt{L/g}", c: C.globe, size: 11 });
  // la sphère qui tourne
  const cx = 262, cy = 116, r = 72;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.line(cx, cy - r - 14, cx, cy + r + 14, { c: C.soft, w: 1.2 });
  f.path(`M${cx - 14} ${cy - r - 8}A14 5 0 1 0 ${cx + 14} ${cy - r - 8}`, { c: C.soft, w: 1.2 });
  for (const [phi, name, len] of [[48.85, "Paris", 16], [4.9, "Cayenne", 24]]) {
    const P = polar(cx, cy, r, phi), Q = [cx, P[1]];
    f.dash(...Q, ...P, { c: C.faint });
    f.arrow(...P, P[0] + len, P[1], { c: C.flat, w: 2, head: 6 });
    f.dot(...P, { r: 3.5 });
    f.note(P[0] - 6, P[1] - 7, name, { size: 9.5, anchor: "end" });
  }
  f.txt(cx - 30, cy + r + 34, "ω²R cos φ", { tex: "\\omega^2 R\\cos\\varphi", c: C.flat, size: 11 });
  stamp(f, tr, tr("fx-pd-s", "schematic"));
  return f;
}

/** Cavendish : G mesuré dans une pièce ; avec g et R, la masse et la densité moyenne de la Terre. */
function figCavendish(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-cv-alt", "Left: Cavendish's torsion balance seen from above, two small lead balls on a rod pulled towards two large ones; the twist of the fibre gives G. Right: the Earth of radius R; a mass m at its surface weighs m g = G M m / R², so M = g R² / G and the mean density follows") });
  const cx = 96, cy = 104;
  f.line(cx - 64, cy, cx + 64, cy, { c: C.ink, w: 2 });
  f.dot(cx, cy, { r: 3 });
  f.circle(cx - 64, cy, 7, { c: C.ink, w: 1.2, fill: "#d9dde3" }); f.circle(cx + 64, cy, 7, { c: C.ink, w: 1.2, fill: "#d9dde3" });
  f.circle(cx - 64, cy + 30, 18, { c: C.ink, w: 1.4, fill: "#9aa1ab" }); f.circle(cx + 64, cy - 30, 18, { c: C.ink, w: 1.4, fill: "#9aa1ab" });
  f.arrow(cx - 64, cy + 6, cx - 64, cy + 14, { c: C.flat, w: 2, head: 5 }); f.arrow(cx + 64, cy - 6, cx + 64, cy - 14, { c: C.flat, w: 2, head: 5 });
  f.note(cx, cy + 70, tr("fx-cv-1", "the fibre twists: G"), { size: 9.5, anchor: "middle", c: C.flat });
  const ex = 290, ey = 112, er = 70;
  f.circle(ex, ey, er, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.seg(ex, ey, ex + er, ey, { label: "R", tex: "R", c: C.soft, side: -10 });
  const P = [ex, ey - er];
  f.circle(P[0], P[1] - 6, 5, { c: C.ink, w: 1.2, fill: "#d9dde3" });
  f.arrow(P[0], P[1] - 6, P[0], P[1] + 22, { c: C.flat, w: 2, head: 6 });
  f.txt(P[0] + 8, P[1] + 20, "g", { tex: "g", c: C.flat });
  f.txt(ex, ey + er + 22, "M = gR²/G", { tex: "M = gR^2/G", c: C.globe, anchor: "middle", size: 11 });
  stamp(f, tr, tr("fx-cv-s", "schematic"));
  return f;
}

// Romaides & Jekeli (1989), tableau 2 : hauteur (m), observé − prédit (µGal), méthode 1
const TOWER = [[0.69, 9], [7.58, 2], [9.38, 8], [23.07, -13], [45.93, -98], [68.76, -176], [93.92, -184], [192.17, -301], [283.58, -412], [379.54, -498], [473.24, -540], [562.27, -547]];

/** La tour WTVD : l'écart publié (observé − prédit, µGal) à chaque hauteur ; le plan, lui, serait à +0,3086 mGal/m de la prédiction. */
function figTower(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-tow-alt", "Departures of the measured gravity from the prediction at twelve heights up a 562 metre tower, from plus 9 to minus 547 microgals. An infinite plane predicts no change with height, which would put it 173,500 microgals above the prediction at the top, about 300 times off this chart") });
  const X0 = 64, X1 = 330, Y0 = 200, Y1 = 34, H = 600, lo = -700, hi = 200;
  const x = (v) => X0 + (v - lo) / (hi - lo) * (X1 - X0), y = (h) => Y0 - (h / H) * (Y0 - Y1);
  for (const h of [0, 200, 400, 600]) { f.dash(X0, y(h), X1, y(h), { c: "#e7e3da" }); f.note(X0 - 4, y(h) + 4, h + " m", { anchor: "end", size: 9.5 }); }
  for (const v of [-600, -300, 0]) f.note(x(v), Y0 + 14, String(v).replace("-", "−"), { anchor: "middle", size: 9.5 });
  f.line(x(0), y(0), x(0), y(H), { c: C.globe, w: 1.6 });
  for (const [h, oc] of TOWER) f.dot(x(oc), y(h), { r: 3, c: C.ink });
  f.arrow(x(0), y(562), 372, y(562), { c: C.flat, w: 1.6 });
  f.note(372, y(562) - 8, tr("fx-tow-1", "plane: +173,500"), { c: C.flat, size: 9.5, anchor: "end" });
  f.note(x(0) + 4, y(0) - 6, tr("fx-tow-2", "globe's prediction"), { c: C.globe, size: 9.5 });
  f.note(4, 230, tr("fx-tow-3", "observed − predicted (µGal) against height on the tower;"), { size: 9.5 });
  f.note(4, 243, tr("fx-tow-4", "the prediction falls 173,500 µGal over the 562 m"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-tow-st", "WTVD tower"));
  return f;
}

export const FORMULA_FIGS = { gravFxPendulum: figPendulum, gravFxCavendish: figCavendish, gravFigTower: figTower };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "grav"); }
