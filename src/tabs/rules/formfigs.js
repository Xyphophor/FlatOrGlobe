// Figures des formules de l'onglet rules (2026-11-25) : une par formule (règle du propriétaire). Schémas, tampon « not to scale ».
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;
const foot = (f, s) => f.note(8, f.h - 6, s, { size: 9.5 });

// la réfraction comme un rayon plus grand : la Terre (R), la même vue à travers l'air (R′ = R/(1 − k)), et le plan
function figRefr(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-refr-alt", "Three surfaces seen from the side: the Earth's curve of radius R, a flatter curve of radius R prime equal to R over one minus k, which is how the Earth looks through refracting air, and a straight line, the plane; the refracted curve stays between the two, never reaching the line") });
  const x0 = 30, x1 = 350, y0 = 60, span = x1 - x0, mid = (x0 + x1) / 2;
  const arc = (sag, o) => f.path(`M${x0} ${y0 + sag}Q${mid} ${y0 - sag} ${x1} ${y0 + sag}`, o);
  f.line(x0, y0, x1, y0, { c: C.flat, w: 1.6 });
  arc(70, { c: C.globe, w: 2.2 });
  arc(70 * 0.87, { c: C.globe, w: 1.6, dash: "6 4" });
  f.note(x1, y0 - 6, tr("fx-refr-1", "plane: k would have to be 1"), { size: 10.5, c: C.flat, anchor: "end" });
  f.note(mid, y0 + 30, "R′ = R / (1 − k)", { size: 11, c: C.globe, anchor: "middle" });
  f.note(mid, y0 + 70, "R", { size: 12, c: C.globe, anchor: "middle" });
  f.note(x0, y0 + 96, tr("fx-refr-2", "k = 0.13: R′ ≈ 1.15 R, flatter, still curved"), { size: 10.5 });
  f.note(x0, y0 + 112, tr("fx-refr-3", "both values are always printed side by side"), { size: 10.5 });
  foot(f, tr("fx-refr-4", "solid: the Earth; dashed: the same Earth seen through standard air"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

// la règle d'exclusion : la moyenne et l'écart-type des AUTRES, la bande de ±3σ, la valeur testée dehors
function figExcl(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-excl-alt", "Values on a line: a cluster of points whose mean and standard deviation are computed without the tested value; a shaded band three standard deviations either side; the tested value lies outside the band and is set aside") });
  const y = 100, X = (v) => 40 + v * 30, others = [3.1, 3.6, 3.9, 4.2, 4.4, 4.7, 5.0, 5.4], test = 9.4;
  const m = others.reduce((a, b) => a + b) / others.length, sd = Math.sqrt(others.reduce((a, b) => a + (b - m) ** 2, 0) / (others.length - 1));
  f.path(`M${X(m - 3 * sd)} ${y - 26}H${X(m + 3 * sd)}V${y + 26}H${X(m - 3 * sd)}Z`, { c: "none", fill: "#dbeafe" });
  f.line(30, y, 360, y, { c: C.faint, w: 1.2 });
  others.forEach((v) => f.dot(X(v), y, { r: 4, c: C.globe }));
  f.line(X(m), y - 32, X(m), y + 32, { c: C.globe, w: 1.6 });
  f.note(X(m), y - 38, "x̄₋ᵢ", { size: 11, c: C.globe, anchor: "middle" });
  f.note(X(m + 3 * sd), y + 40, "+3σ₋ᵢ", { size: 10.5, c: C.globe, anchor: "middle" });
  f.note(X(m - 3 * sd), y + 40, "−3σ₋ᵢ", { size: 10.5, c: C.globe, anchor: "middle" });
  f.dot(X(test), y, { r: 5, c: C.flat }); f.note(X(test), y - 12, "xᵢ", { size: 11, c: C.flat, anchor: "middle" });
  f.note(X(test), y + 22, tr("fx-excl-1", "set aside"), { size: 10.5, c: C.flat, anchor: "middle" });
  foot(f, tr("fx-excl-2", "the band is measured on the others only, without xᵢ"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

// la moyenne pondérée : des résultats et leurs barres d'erreur, la moyenne qui suit les plus précis
function figWmean(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-wmean-alt", "Five results with their error bars, one under the other; the weighted mean is a vertical line that lies closest to the results with the shortest bars; a wider band shows its uncertainty enlarged by the Birge ratio when the results disagree") });
  const res = [[5.2, 0.5], [4.3, 0.25], [6.0, 1.1], [5.3, 0.3], [3.6, 0.9]], X = (v) => 40 + (v - 2.5) * 60;
  const W = res.reduce((a, [, s]) => a + 1 / s / s, 0), m = res.reduce((a, [v, s]) => a + v / s / s, 0) / W;
  const se = 1 / Math.sqrt(W), chi2 = res.reduce((a, [v, s]) => a + ((v - m) / s) ** 2, 0), B = Math.max(1, Math.sqrt(chi2 / (res.length - 1)));
  const top = 34, bot = 170;
  f.path(`M${X(m - B * se)} ${top}H${X(m + B * se)}V${bot}H${X(m - B * se)}Z`, { c: "none", fill: "#c7d2fe" });
  f.path(`M${X(m - se)} ${top}H${X(m + se)}V${bot}H${X(m - se)}Z`, { c: "none", fill: "#93c5fd" });
  f.line(X(m), top, X(m), bot, { c: C.globe, w: 1.8 });
  res.forEach(([v, s], i) => { const yy = top + 16 + i * 27; f.line(X(v - s), yy, X(v + s), yy, { c: C.ink, w: 1.4 }); f.line(X(v - s), yy - 4, X(v - s), yy + 4, { c: C.ink, w: 1.2 }); f.line(X(v + s), yy - 4, X(v + s), yy + 4, { c: C.ink, w: 1.2 }); f.dot(X(v), yy, { r: 3.5 }); });
  f.note(X(m) + 5, top - 4, "x̄", { size: 12, c: C.globe });
  f.note(372, 62, tr("fx-wmean-1", "short bar:"), { size: 10.5, anchor: "end" });
  f.note(372, 78, tr("fx-wmean-2", "large weight"), { size: 10.5, anchor: "end" });
  f.note(372, 150, tr("fx-wmean-3", "light band: σ × B"), { size: 10.5, c: C.globe, anchor: "end" });
  foot(f, tr("fx-wmean-4", "each result weighs 1/σ²; disagreement enlarges the error"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

export const FORMULA_FIGS = { rulesFxRefr: figRefr, rulesFxExcl: figExcl, rulesFxWmean: figWmean };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "rules"); }
