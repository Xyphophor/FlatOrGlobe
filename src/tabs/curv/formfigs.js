// Schémas des formules de l'onglet curv (2026-10-01, revue de toute la page :
// « les formules doivent avoir des figures »). Un générateur FIG par bloc
// formule (hôtes curvFx*), monté par index.js avant renderTexIn. Schématiques,
// tamponnés « not to scale » (règle 1) ; aucun nombre de la page ne s'y lit.
import { FIG, polar } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

/** H et d₀ de profil ; s et δ dans le cadre de la photo. */
function figHidden(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-hid-alt", "Left, side view: an eye at height h sees the horizon at distance d₀ along the tangent; a target at distance d has its lower part H hidden below that line. Right, the photo: the horizon lies δ below eye level and arches up in the middle; s is the sagitta across half the field a") });
  const cx = 115, cy = 300, R = 220, hE = 14, aE = 112, aT = 64, hT = 50;
  f.path(`M${polar(cx, cy, R, 118).join(" ")}A${R} ${R} 0 0 1 ${polar(cx, cy, R, 60).join(" ")}`, { c: C.sea, w: 2.4 });
  const E0 = polar(cx, cy, R, aE), E = polar(cx, cy, R + hE, aE);
  f.line(...E0, ...E, { c: C.ink, w: 1.4 });
  f.dot(...E, { r: 3.5 });
  f.txt(E[0] - 16, (E[1] + E0[1]) / 2 + 4, "h", { tex: "h", c: C.ink });
  const tg = Math.acos(R / (R + hE)) * 180 / Math.PI, Hz = polar(cx, cy, R, aE - tg);
  const ux = (Hz[0] - E[0]) / Math.hypot(Hz[0] - E[0], Hz[1] - E[1]), uy = (Hz[1] - E[1]) / Math.hypot(Hz[0] - E[0], Hz[1] - E[1]);
  f.dot(...Hz, { r: 3, c: C.sea });
  const T0 = polar(cx, cy, R, aT), T1 = polar(cx, cy, R + hT, aT);
  f.line(...T0, ...T1, { c: C.ink, w: 3 });
  // où la tangente croise la tour
  const nx = Math.cos(aT * Math.PI / 180), ny = -Math.sin(aT * Math.PI / 180);
  const det = ux * ny - uy * nx, t = ((T0[0] - E[0]) * ny - (T0[1] - E[1]) * nx) / det;
  const X = [E[0] + ux * t, E[1] + uy * t];
  f.line(...E, X[0] + ux * 14, X[1] + uy * 14, { c: C.flat, w: 1.3, dash: "4 3" });
  f.line(...T0, ...X, { c: C.flat, w: 3 });
  f.txt(X[0] + 6, (X[1] + T0[1]) / 2 + 4, "H", { tex: "H", c: C.flat });
  f.note(Hz[0] - 14, Hz[1] + 16, "d₀", { size: 11, c: C.sea });
  f.note(T0[0] - 22, T0[1] + 16, "d", { size: 11, c: C.sea });
  f.note(12, 222, tr("fx-hid-1", "side view: H is below the line of sight"), { size: 9 });
  // le cadre
  const x0 = 250, y0 = 56, w = 120, hh = 110, yEye = y0 + 26, yH = y0 + 64;
  f.path(`M${x0} ${y0}H${x0 + w}V${y0 + hh}H${x0}Z`, { c: C.soft, w: 1.2, fill: "#eef3f7" });
  f.line(x0, yEye, x0 + w, yEye, { c: C.flat, w: 1.2, dash: "5 3" });
  f.path(`M${x0} ${yH + 12}Q${x0 + w / 2} ${yH - 12} ${x0 + w} ${yH + 12}`, { c: C.sea, w: 2 });
  f.line(x0, yH + 12, x0 + w, yH + 12, { c: C.faint, w: 1, dash: "2 3" });
  f.seg(x0 + w / 2, yEye, x0 + w / 2, yH, { label: "δ", tex: "\\delta", c: C.globe, side: 10 });
  f.seg(x0 + w - 18, yH + 12, x0 + w - 18, yH + 1, { c: C.flat });
  f.txt(x0 + w - 30, yH + 32, "s", { tex: "s", c: C.flat });
  f.arrow(x0 + w / 2, y0 + hh + 14, x0 + w, y0 + hh + 14, { c: C.soft, w: 1.2, head: 6 });
  f.txt(x0 + w * 0.72, y0 + hh + 30, "a", { tex: "a", c: C.soft });
  f.note(x0, y0 - 8, tr("fx-hid-2", "the photo: eye level dashed"), { size: 9 });
  stamp(f, tr, tr("fx-hid-s", "curvature enlarged"));
  return f;
}

/** s = f·tan δ·(sec a − 1) : vu de dessus, le bord du cadre est plus loin (f·sec a), donc plus bas dans l'image. */
function figSagitta(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-sag-alt", "Left, seen from above: a camera with focal length f; a ray at angle a from the axis meets the sensor plane at distance f sec a. Right, the sensor: the horizon is f tan δ below eye level at the centre and f tan δ sec a at the edges, so it bows by s") });
  const cx = 40, cy = 176, fpx = 110;
  f.dot(cx, cy, { r: 4 });
  f.line(cx, cy, cx + fpx, cy, { c: C.ink, w: 1.4 });
  f.line(cx + fpx, cy + 10, cx + fpx, 30, { c: C.soft, w: 2 });
  const a = 48 * Math.PI / 180, ex = cx + fpx, ey = cy - fpx * Math.tan(a);
  f.line(cx, cy, ex, ey, { c: C.sea, w: 1.6 });
  f.angle(cx, cy, 30, 0, 48, { label: "a", tex: "a", c: C.globe, pad: 10 });
  f.txt(cx + fpx / 2 - 4, cy + 16, "f", { tex: "f", c: C.ink });
  f.txt((cx + ex) / 2 - 40, (cy + ey) / 2 - 4, "f sec a", { tex: "f\\sec a", c: C.sea, size: 11 });
  f.note(cx + fpx + 6, 40, tr("fx-sag-1", "sensor"), { size: 9.5 });
  f.note(10, 212, tr("fx-sag-2", "seen from above"), { size: 9 });
  // le capteur
  const x0 = 206, y0 = 34, w = 160, hh = 150, yEye = y0 + 30, dc = 44, de = dc * 1.5;
  f.path(`M${x0} ${y0}H${x0 + w}V${y0 + hh}H${x0}Z`, { c: C.soft, w: 1.2, fill: "#eef3f7" });
  f.line(x0, yEye, x0 + w, yEye, { c: C.flat, w: 1.2, dash: "5 3" });
  f.path(`M${x0} ${yEye + de}Q${x0 + w / 2} ${yEye + dc - (de - dc)} ${x0 + w} ${yEye + de}`, { c: C.sea, w: 2 });
  f.seg(x0 + w / 2, yEye, x0 + w / 2, yEye + dc, { label: "f tan δ", tex: "f\\tan\\delta", c: C.globe, side: 34 });
  f.seg(x0 + w - 10, yEye, x0 + w - 10, yEye + de, { c: C.sea });
  f.txt(x0 + w - 16, yEye + de + 18, "f tan δ sec a", { tex: "f\\tan\\delta\\sec a", c: C.sea, size: 10.5, anchor: "end" });
  f.note(x0, y0 - 8, tr("fx-sag-3", "the sensor: eye level dashed"), { size: 9 });
  stamp(f, tr, tr("fx-sag-s", "angles enlarged"));
  return f;
}

export const FORMULA_FIGS = { curvFxHidden: figHidden, curvFxSag: figSagitta };

export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "curv"); }
