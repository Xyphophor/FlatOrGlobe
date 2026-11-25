// Schémas des formules de l'onglet mag (2026-10-01, revue de toute la page,
// epic15/UC04 : « on donne les méthodes pour refaire ce qui est fait »).
// Monté par index.js après drawSymbols, avant renderTexIn. Schématique.
import { FIG, polar } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

/** La méthode du test sur sites mesurés : λm -> I prédit par chaque modèle -> résidu. */
function figMethod(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-mm-alt", "Left: a sphere with a magnet at its centre; at magnetic latitude λm the needle dips by I, with tan I = 2 tan λm. Right: a cross-section of the flat disc with a magnet buried at depth D under the centre; at distance r from the centre the needle dips by I given by tan I = (2D² − r²)/(3rD); layout two adds a ring of opposite pole at the rim. Each measured site gives I measured minus I predicted") });
  // globe
  const gx = 88, gy = 128, gr = 66;
  f.circle(gx, gy, gr, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.arrow(gx, gy - 20, gx, gy + 20, { c: C.flat, w: 3, head: 7 });   // le moment de la Terre pointe vers le sud géographique
  f.dash(gx, gy, ...polar(gx, gy, gr, 40), { c: C.faint });
  f.dash(gx, gy, gx + gr, gy, { c: C.faint });
  f.angle(gx, gy, 22, 0, 40, { label: "λm", tex: "\\lambda_m", c: C.globe, pad: 12 });
  const P = polar(gx, gy, gr, 40), tan = 40 - 90, I = Math.atan(2 * Math.tan(40 * Math.PI / 180)) * 180 / Math.PI;
  f.line(...polar(P[0], P[1], 16, tan + 180), ...polar(P[0], P[1], 16, tan), { c: C.soft, w: 1, dash: "3 2" });
  f.line(...polar(P[0], P[1], 14, tan + 180 - I), ...polar(P[0], P[1], 14, tan - I), { c: C.ink, w: 2.4 });
  f.dot(...P, { r: 2.5 });
  f.txt(P[0] + 12, P[1] - 10, "I", { tex: "I", c: C.ink });
  f.txt(gx, gy + gr + 20, "tan I = 2 tan λm", { tex: "\\tan I = 2\\tan\\lambda_m", c: C.globe, anchor: "middle", size: 11 });
  // disque plat en coupe
  const x0 = 196, x1 = 372, ys = 88, cx = 204, D = 58;
  f.line(x0, ys, x1, ys, { c: C.ground, w: 2.4 });
  f.path(`M${x0} ${ys}H${x1}V${ys + 100}H${x0}Z`, { c: "none", w: 0, fill: "#f6efe4" });
  f.line(x0, ys, x1, ys, { c: C.ground, w: 2.4 });
  f.arrow(cx, ys + D - 18, cx, ys + D + 18, { c: C.flat, w: 3, head: 7 });
  f.seg(cx + 14, ys, cx + 14, ys + D, { label: "D", tex: "D", c: C.soft, side: -10 });
  const ox = cx + 110;
  f.seg(cx, ys - 12, ox, ys - 12, { label: "r", tex: "r", c: C.soft, side: -10 });
  f.line(ox - 13, ys - 26, ox + 13, ys - 26 + 13 * Math.tan(0.35) * 2, { c: C.ink, w: 2.4 });
  f.dot(ox, ys - 26, { r: 2.5 });
  f.note(x1 - 4, ys + D + 4, tr("fx-mm-1", "② + ring at the rim"), { size: 9, anchor: "end", c: C.flat });
  f.txt(284, ys + 118, "tan I = (2D² − r²) / 3rD", { tex: "\\tan I = \\frac{2D^2 - r^2}{3rD}", c: C.flat, anchor: "middle", size: 11 });
  f.note(10, 232, tr("fx-mm-2", "every site: residual = I measured − I predicted"), { size: 9.5 });
  stamp(f, tr, tr("fx-mm-s", "schematic"));
  return f;
}

export const FORMULA_FIGS = { magFxMethod: figMethod };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "mag"); }
