// Schéma de la formule du panneau « GPS bruts » (epic16/UC03) : une sphère de
// centre c et de rayon R passe par les stations ; un plan ne le peut pas.
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

function figSphere(tr) {
  const f = FIG.make({ w: 440, h: 250, alt: tr("fx-sph-alt", "A sphere of centre c and radius R through stations solved from raw signals, each at distance R from the centre, and the best plane through the same points, which leaves them far from it") });
  const cx = 110, cy = 118, R = 92;
  f.circle(cx, cy, R, { c: C.globe, w: 2, fill: "#eef6f4" });
  f.dot(cx, cy, { r: 4, c: C.ink });
  f.txt(cx + 7, cy + 17, "c", { tex: "\\mathbf{c}", c: C.ink, size: 15 });
  const pts = [[-77, 13], [-38, -74], [43, -81], [84, 18], [26, 88], [-61, 66]];
  for (const [dx, dy] of pts) f.dot(cx + dx, cy + dy, { r: 4.2, c: C.globe });
  f.arrow(cx, cy, cx + 84, cy + 18, { c: C.ink, w: 1.6, head: 7 });
  f.txt(cx + 42, cy - 2, "R", { tex: "R", c: C.ink, size: 15 });
  f.note(10, 242, tr("fx-sph-1", "stations: points solved alone, each from its own signals"), { size: 10.5 });
  // le plan : une droite en coupe, loin de la plupart des points
  f.line(226, 22, 226, 220, { c: C.flat, w: 2.4, dash: "7 5" });
  f.note(238, 44, tr("fx-sph-2", "best plane"), { size: 12, c: C.flat });
  f.note(238, 61, tr("fx-sph-3", "n·x = d"), { size: 12, c: C.flat });
  f.note(238, 112, tr("fx-sph-4", "sphere: every station at"), { size: 11, c: C.globe });
  f.note(238, 127, tr("fx-sph-5", "R from c, to the flattening"), { size: 11, c: C.globe });
  f.note(238, 162, tr("fx-sph-6", "plane: stations all round"), { size: 11, c: C.flat });
  f.note(238, 177, tr("fx-sph-7", "the globe cannot lie on it"), { size: 11, c: C.flat });
  stamp(f, tr, tr("fx-sph-s", "schematic"));
  return f;
}

export const FORMULA_FIGS = { gpsFxSphere: figSphere };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "gps"); }
