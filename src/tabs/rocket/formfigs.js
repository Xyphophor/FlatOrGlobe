// Figures de l'onglet rocket (2026-10-27) : une figure fixe par formule (règle du propriétaire). Schémas : tampon « not to
// scale » ; les barres du RS-25 et la courbe de Tsiolkovski sont à l'échelle de leurs axes.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { rs25 } from "./logic.js";

const C = FIG.C, GAS = "#c2410c", AIR = "#64748b", PUSH = "#0f766e";
const foot = (f, s, y) => f.note(8, y ?? f.h - 6, s, { size: 9.5 });
const rect = (f, x, y, w, h, o = {}) => f.path(`M${x} ${y}h${w}v${h}h${-w}Z`, o);

/** Un choc : la bille arrive, repart, la paroi reçoit 2 m v⊥ ; à droite, beaucoup de chocs = une pression. */
function figKick(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("kk-alt", "A ball hits a wall and bounces off; its velocity across the wall reverses and the wall receives twice its momentum. Beside it, a box full of balls whose many hits make a steady pressure") });
  const wx = 150;
  rect(f, wx, 30, 10, 130, { fill: C.wash, c: C.ground });
  f.arrow(40, 60, wx - 8, 100, { c: GAS, w: 1.8 }); f.arrow(wx - 8, 100, 40, 140, { c: GAS, w: 1.8, dash: "4 3" });
  f.dot(wx - 8, 100, { r: 6, c: GAS });
  f.note(12, 50, tr("kk-in", "before: v⊥ towards the wall"), { size: 10, c: GAS });
  f.note(12, 160, tr("kk-out", "after: −v⊥"), { size: 10, c: GAS });
  f.arrow(wx + 12, 100, wx + 50, 100, { c: PUSH, w: 2.4 }); f.txt(wx + 54, 104, "2 m v⊥", { size: 11, c: PUSH });
  // la boîte de droite
  const bx = 262, by = 44, bw = 100, bh = 100;
  rect(f, bx, by, bw, bh, { c: C.ink, w: 2, fill: "#fff7ed" });
  const pts = [[14, 20], [40, 12], [70, 30], [86, 70], [24, 64], [52, 52], [60, 86], [16, 88], [82, 14], [34, 38], [72, 56], [46, 76]];
  for (const [x, y] of pts) f.dot(bx + x, by + y, { r: 2.6, c: GAS });
  for (const [x1, y1, x2, y2] of [[bx + bw / 2, by, bx + bw / 2, by - 18], [bx + bw / 2, by + bh, bx + bw / 2, by + bh + 18], [bx, by + bh / 2, bx - 18, by + bh / 2], [bx + bw, by + bh / 2, bx + bw + 14, by + bh / 2]]) f.arrow(x1, y1, x2, y2, { c: PUSH, w: 2 });
  f.note(376, by + bh + 38, tr("kk-box", "billions of hits: p = n k T"), { size: 10, anchor: "end" });
  stamp(f, tr, tr("kk-st", "schematic"));
  return f;
}

/** La boîte trouée : en haut une poussée sans partenaire. */
function figHole(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("ho-alt", "Two boxes of gas. In the closed one, the push on each wall is matched by the push on the opposite wall. In the one with a hole in the bottom, the patch of top above the hole has no partner, and the box is pushed up") });
  for (const [x0, hole] of [[40, false], [220, true]]) {
    const y0 = 46, w = 120, h = 100;
    f.line(x0, y0, x0 + w, y0, { w: 2.4 }); f.line(x0, y0, x0, y0 + h, { w: 2.4 }); f.line(x0 + w, y0, x0 + w, y0 + h, { w: 2.4 });
    if (hole) { f.line(x0, y0 + h, x0 + 42, y0 + h, { w: 2.4 }); f.line(x0 + 78, y0 + h, x0 + w, y0 + h, { w: 2.4 }); f.dash(x0 + 42, y0 + h, x0 + 78, y0 + h); }
    else f.line(x0, y0 + h, x0 + w, y0 + h, { w: 2.4 });
    for (const dx of [20, 60, 100]) {
      f.arrow(x0 + dx, y0, x0 + dx, y0 - 16, { c: hole && dx === 60 ? C.ink : PUSH, w: hole && dx === 60 ? 2.6 : 1.8 });
      if (!hole || dx !== 60) f.arrow(x0 + dx, y0 + h, x0 + dx, y0 + h + 16, { c: PUSH, w: 1.8 });
    }
    if (hole) { f.arrow(x0 + 60, y0 + h + 4, x0 + 60, y0 + h + 30, { c: GAS, w: 1.4, dash: "3 3" }); f.note(x0 + 66, y0 + h + 28, tr("ho-out", "gas out"), { size: 10, c: GAS }); f.note(x0 + 66, y0 - 6, tr("ho-alone", "no partner"), { size: 10, c: C.ink }); }
    f.note(x0 + w / 2, 186, hole ? tr("ho-2", "with a hole: pushed up") : tr("ho-1", "closed: pushes in pairs"), { size: 10.5, anchor: "middle", c: hole ? C.ink : C.soft });
  }
  stamp(f, tr, tr("ho-st", "schematic"));
  return f;
}

/** Le bain : le robinet (le feu) et la bonde (le col) ; la courbe N(t) qui monte jusqu'à Ṅ τ. */
function figFill(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fi-alt", "A chamber fed by a fire and emptied through a narrow throat, and the curve of the amount of gas inside: it rises and levels off where as much leaves as is made") });
  const x0 = 30, y0 = 40, w = 90, h = 90;
  rect(f, x0, y0, w, h, { c: C.ink, w: 2.2, fill: "#fff7ed" });
  rect(f, x0 + 8, y0 + 6, w - 16, 12, { c: "none", fill: "rgba(245,158,11,.35)" });
  f.note(x0 + w / 2, y0 - 8, tr("fi-in", "fire: Ṅin per second"), { size: 10, anchor: "middle", c: "#92400e" });
  f.line(x0 + w / 2 - 10, y0 + h, x0 + w / 2 - 10, y0 + h + 14, { w: 2.2 }); f.line(x0 + w / 2 + 10, y0 + h, x0 + w / 2 + 10, y0 + h + 14, { w: 2.2 });
  f.arrow(x0 + w / 2, y0 + h - 4, x0 + w / 2, y0 + h + 34, { c: GAS, w: 1.8 });
  f.note(x0 - 10, y0 + h + 52, tr("fi-out", "throat: N/τ per second"), { size: 10, c: GAS });
  // la courbe
  const gx = 170, gy = 160, gw = 190, gh = 110;
  f.axes(gx, gy, gw, gh, { x: tr("fi-t", "time"), y: "N" });
  let d = ""; for (let i = 0; i <= 40; i++) { const t = i / 40, n = 1 - Math.exp(-t * 4); d += `${i ? "L" : "M"}${gx + t * gw * 0.95} ${gy - n * gh * 0.8}`; }
  f.path(d, { c: GAS, w: 2 });
  f.dash(gx, gy - gh * 0.8, gx + gw, gy - gh * 0.8, { c: C.soft });
  f.note(gx + gw - 2, gy - gh * 0.8 - 6, tr("fi-ss", "Ṅin τ: as many out as in"), { size: 10, anchor: "end" });
  stamp(f, tr, tr("fi-st", "schematic"));
  return f;
}

/** La fusée : pression dedans, air dehors, le plan de sortie. */
function figThrust(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("th-alt", "A rocket chamber and nozzle. Inside, the gas pushes outwards on every wall; the push on the top of the chamber is not matched at the bottom, where the gas leaves through the nozzle at speed v e. Outside, the air pushes inwards on the skin everywhere except across the nozzle exit") });
  const cx = 150, top = 30, yC = 110, yT = 140, yE = 196, w = 60, hT = 16, hE = 44;
  const P = [[cx - w, top], [cx + w, top], [cx + w, yC], [cx + hT, yT], [cx + hE, yE], [cx - hE, yE], [cx - hT, yT], [cx - w, yC]];
  f.path("M" + P.map((p) => p.join(" ")).join("L") + "Z", { c: "none", fill: "#fff7ed" });
  f.path(`M${cx - hE} ${yE}L${cx - hT} ${yT}L${cx - w} ${yC}L${cx - w} ${top}L${cx + w} ${top}L${cx + w} ${yC}L${cx + hT} ${yT}L${cx + hE} ${yE}`, { w: 2.4 });
  f.dash(cx - hE, yE, cx + hE, yE, { c: GAS });
  for (const x of [cx - 36, cx, cx + 36]) f.arrow(x, top + 18, x, top - 2, { c: PUSH, w: 1.8 });
  f.arrow(cx - w + 16, 70, cx - w - 4, 70, { c: PUSH, w: 1.6 }); f.arrow(cx + w - 16, 70, cx + w + 4, 70, { c: PUSH, w: 1.6 });
  f.arrow(cx - 30, yC + 2, cx - 34, yC + 16, { c: PUSH, w: 1.6 }); f.arrow(cx + 30, yC + 2, cx + 34, yC + 16, { c: PUSH, w: 1.6 });
  // l'air dehors
  for (const [x1, y1, x2, y2] of [[cx, top - 26, cx, top - 10], [cx - w - 26, 70, cx - w - 10, 70], [cx + w + 26, 70, cx + w + 10, 70], [cx - hE - 20, yE - 34, cx - hE - 6, yE - 28], [cx + hE + 20, yE - 34, cx + hE + 6, yE - 28]]) f.arrow(x1, y1, x2, y2, { c: AIR, w: 1.4 });
  f.note(cx + w + 30, 66, tr("th-air", "air: pₐ inwards"), { size: 10, c: AIR });
  f.note(cx + w + 30, 80, tr("th-air2", "(not across the exit)"), { size: 10, c: AIR });
  f.arrow(cx, yE + 2, cx, yE + 22, { c: GAS, w: 2 }); f.txt(cx + 6, yE + 20, "ṁ, vₑ, pₑ", { size: 11, c: GAS });
  f.note(cx + hE + 8, yE + 4, tr("th-ae", "exit area Aₑ"), { size: 10, c: GAS });
  f.note(cx, 94, tr("th-gas", "gas pushes out"), { size: 9.5, c: PUSH, anchor: "middle" });
  f.arrow(330, 160, 330, 100, { c: C.ink, w: 3 }); f.txt(336, 132, "F", { size: 13, c: C.ink });
  stamp(f, tr, tr("th-st", "schematic"));
  return f;
}

/** Les poussées du RS-25 et la part de l'air. */
function figRs25(tr, v) {
  const r = rs25();
  const f = FIG.make({ w: 380, h: 190, alt: tr("rs-alt", "Bars of the RS-25's thrust: 2,279 kilonewtons in a vacuum, 1,852 at sea level; the difference, 427 kilonewtons, next to the air pressure times the nozzle exit area, 422 kilonewtons") });
  const x0 = 120, x1 = 360, max = 2650e3, X = (F) => x0 + (F / max) * (x1 - x0);
  const rows = [[tr("rs-vac", "vacuum"), r.fVac, C.ink], [tr("rs-sl", "sea level"), r.fSl, AIR], [tr("rs-diff", "difference"), r.diff, PUSH], [tr("rs-pa", "pₐ × exit area"), r.paAe, GAS]];
  rows.forEach(([lab, F, c], i) => {
    const y = 40 + i * 30;
    rect(f, x0, y, X(F) - x0, 16, { c: "none", fill: c });
    f.note(x0 - 6, y + 12, lab, { size: 10.5, anchor: "end", c });
    f.note(X(F) + 5, y + 12, `${(F / 1e3).toLocaleString(v.lang || "en", { maximumFractionDigits: 0 })} kN`, { size: 10.5, c });
  });
  for (const k of [0, 1000, 2000]) { f.line(X(k * 1e3), 34, X(k * 1e3), 162, { c: C.faint, w: 0.8, dash: "2 3" }); f.note(X(k * 1e3), 176, `${k.toLocaleString(v.lang || "en")}`, { size: 9.5, anchor: "middle" }); }
  axesStamp(f, tr, tr("rs-st", "kN, RS-25 at 109 % power"));
  return f;
}

/** Joule et la fusée : sans paroi qui bouge, pas de travail ; la fusée est la paroi qui bouge. */
function figJoule(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("jo-alt", "Joule's two vessels joined by a tap: the air spreads from the full one into the empty one and no wall moves, so no work is done. Beside them, a rocket chamber whose top is pushed by the gas and moves up") });
  // Joule
  f.circle(70, 96, 36, { c: C.ink, w: 2, fill: "#fff7ed" }); f.circle(170, 96, 36, { c: C.ink, w: 2 });
  f.line(106, 96, 134, 96, { w: 4 }); f.circle(120, 96, 5, { c: C.ink, w: 1.6, fill: C.paper });
  for (const [x, y] of [[56, 80], [80, 106], [66, 116], [90, 84], [50, 100], [152, 90], [178, 110], [168, 80]]) f.dot(x, y, { r: 2.6, c: GAS });
  f.note(120, 152, tr("jo-1", "Joule 1845: nothing moves, W = 0"), { size: 10.5, anchor: "middle" });
  // la fusée
  const x0 = 270, top = 60, w = 34;
  f.path(`M${x0 - 14} 170L${x0 - w} 130L${x0 - w} ${top}L${x0 + w} ${top}L${x0 + w} 130L${x0 + 14} 170`, { w: 2.2, fill: "#fff7ed" });
  for (const [x, y] of [[x0 - 14, 80], [x0 + 10, 100], [x0 - 4, 118], [x0 + 18, 76], [x0 - 20, 108]]) f.dot(x, y, { r: 2.6, c: GAS });
  f.arrow(x0, top - 2, x0, top - 30, { c: PUSH, w: 2.4 }); f.txt(x0 + 6, top - 18, "F", { size: 12, c: PUSH });
  f.dash(x0 + w + 6, top, x0 + w + 6, top - 26, { c: C.ink }); f.txt(x0 + w + 10, top - 10, "Δx", { size: 11 });
  f.note(x0, 190, tr("jo-2", "rocket: the top moves, W = F Δx"), { size: 10.5, anchor: "middle" });
  stamp(f, tr, tr("jo-st", "schematic"));
  return f;
}

/** Δv/u en fonction de m₀/m₁ ; le 4 de l'animation, le 5,9 d'une orbite basse. */
function figTsiol(tr, v) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("ts-alt", "The rocket equation as a curve: speed gained, in units of the exhaust speed, against the ratio of full to empty mass; it rises ever more slowly, 1.39 at a ratio of 4 and 1.78 at 5.9, the ratio for a low orbit with the RS-25's exhaust speed") });
  const ox = 46, oy = 166, w = 310, h = 130, mMax = 8, vMax = 2.2, X = (m) => ox + ((m - 1) / (mMax - 1)) * w, Y = (d) => oy - (d / vMax) * h;
  f.axes(ox, oy, w + 10, h + 10, { x: "m₀/m₁", y: "Δv/u" });
  let d = ""; for (let i = 0; i <= 60; i++) { const m = 1 + (i / 60) * (mMax - 1); d += `${i ? "L" : "M"}${X(m)} ${Y(Math.log(m))}`; }
  f.path(d, { c: C.ink, w: 2 });
  for (const m of [1, 2, 4, 6]) f.note(X(m), oy + 14, String(m), { size: 9.5, anchor: "middle" });
  for (const q of [0, 1, 2]) f.note(ox - 6, Y(q) + 4, String(q), { size: 9.5, anchor: "end" });
  const mo = Number(String(v.mrOrb ?? "5.9").replace(",", "."));
  for (const [m, lab, c] of [[4, tr("ts-anim", "m₀/m₁ = 4: 1.39 (1.36 in 48 throws)"), PUSH], [mo, tr("ts-orb", "low orbit with the RS-25"), GAS]]) {
    f.dot(X(m), Y(Math.log(m)), { r: 4, c }); f.dash(X(m), Y(Math.log(m)), X(m), oy, { c });
    f.note(m === 4 ? X(m) + 6 : X(m) - 8, Y(Math.log(m)) + (m === 4 ? 14 : -8), lab, { size: 10, c, anchor: m === 4 ? "start" : "end" });
  }
  axesStamp(f, tr, tr("ts-st", "Δv = u ln(m₀/m₁)"));
  return f;
}

export const FORMULA_FIGS = {
  rocketFxKick: figKick, rocketFxHole: figHole, rocketFxFill: figFill, rocketFxThrust: figThrust, rocketFxRs25: figRs25,
  rocketFxJoule: figJoule, rocketFxTsiol: figTsiol,
};
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "rocket"); }
