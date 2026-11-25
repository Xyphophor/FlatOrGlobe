// Schémas des formules de l'onglet surv (2026-10-01, revue de toute la page,
// epic15/UC04 : les méthodes pour refaire). Montés par index.js après
// drawSymbols, avant renderTexIn. Schématiques, tamponnés.
import { FIG, polar } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { mcdRows, kozRows } from "./logic.js";
import { MCD, KOZ, BALDY_H_FT, FT } from "../../data/presets/surv-recip.js";
import { figFxTri, figTriData } from "./excess.js";

const C = FIG.C;

/** Un degré de méridien est plus long près du pôle : la courbure y est plus faible (rayon plus grand). */
function figArcs(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-arc-alt", "A flattened Earth in cross-section, the flattening exaggerated. At the equator the surface curves sharply, so one degree of latitude, the angle between two verticals, spans a short arc; near the pole the surface is flatter and the same degree spans a longer arc. Comparing the two lengths gives both the size and the flattening") });
  const cx = 150, cy = 120, a = 120, b = 84;
  f.ellipse(cx, cy, a, b, { c: C.sea, w: 1.8 });
  f.line(cx - a - 8, cy, cx + a + 8, cy, { c: C.faint, w: 1, dash: "3 3" });
  f.line(cx, cy - b - 8, cx, cy + b + 8, { c: C.faint, w: 1, dash: "3 3" });
  // normales (verticales) à la surface, à la latitude géodésique φ : point (a cos t, b sin t) avec tan φ = (a/b) tan t
  const at = (phi) => { const t = Math.atan((b / a) * Math.tan(phi * Math.PI / 180)); return [cx + a * Math.cos(t), cy - b * Math.sin(t)]; };
  const normal = (phi, len) => { const p = at(phi), r = phi * Math.PI / 180; return [p, [p[0] - len * Math.cos(r), p[1] + len * Math.sin(r)]]; };
  for (const [p0, p1, col] of [[0, 18, C.flat], [66, 84, C.globe]]) {
    const A = at(p0), B = at(p1);
    const n0 = normal(p0, 150), n1 = normal(p1, 150);
    f.line(...n0[0], ...n0[1], { c: col, w: 1, dash: "4 3" }); f.line(...n1[0], ...n1[1], { c: col, w: 1, dash: "4 3" });
    let d = `M${A[0]} ${A[1]}`; for (let q = p0; q <= p1; q += 1) { const P = at(q); d += `L${P[0].toFixed(1)} ${P[1].toFixed(1)}`; }
    f.path(d, { c: col, w: 4 });
  }
  f.note(cx + a + 12, cy - 8, tr("fx-arc-1", "equator: curved"), { size: 9.5, c: C.flat });
  f.note(cx + a + 12, cy + 5, tr("fx-arc-2", "sharply, short arc"), { size: 9.5, c: C.flat });
  const P = at(75);
  f.note(P[0] + 14, P[1] - 14, tr("fx-arc-3", "near the pole: flatter,"), { size: 9.5, c: C.globe });
  f.note(P[0] + 14, P[1] - 1, tr("fx-arc-4", "longer arc"), { size: 9.5, c: C.globe });
  f.note(10, 218, tr("fx-arc-5", "same angle between the verticals (Δφ), different lengths"), { size: 9.5 });
  stamp(f, tr, tr("fx-arc-s", "flattening exaggerated ×100"));
  return f;
}

/** Rayon apparent sans k (2026-10-04) : la distance EDM et l'écart des deux verticales lu par les théodolites. */
function figRapp(tr) {
  const f = FIG.make({ w: 380, h: 266, alt: tr("fx-rapp-alt", "Two stations on a curved surface. Each theodolite measures the zenith angle to the other from its own plumb line; the two plumb lines, extended down, meet at an angle epsilon equal to the sum of the zenith angles minus 180 degrees. The EDM measures the straight distance s between the stations. The apparent radius is s divided by epsilon. On a plane the plumb lines are parallel, epsilon is zero and the radius is infinite") });
  const O = [190, 205], r = 150, half = 24 * Math.PI / 180;
  const P = (a, rr = r) => [O[0] + rr * Math.sin(a), O[1] - rr * Math.cos(a)];
  let d = ""; for (let a = -0.62; a <= 0.621; a += 0.02) { const q = P(a); d += `${d ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }
  f.path(d, { c: C.ground, w: 2.4 });
  const A = P(-half), B = P(half), Au = P(-half, r + 30), Bu = P(half, r + 30);
  f.dash(...Au, ...O, { c: C.soft }); f.dash(...Bu, ...O, { c: C.soft });
  f.line(...A, ...B, { c: C.globe, w: 1.8 });
  f.txt(O[0], A[1] + 17, tr("fx-rapp-s", "s (EDM)"), { c: C.globe, anchor: "middle", size: 11 });
  f.dot(...A, { r: 3.5 }); f.dot(...B, { r: 3.5 });
  f.angleAt(...A, 22, Au, B, { label: "ζ₁", tex: "\\zeta_1", c: C.ink, pad: 11 });
  f.angleAt(...B, 22, A, Bu, { label: "ζ₂", tex: "\\zeta_2", c: C.ink, pad: 11 });
  f.angleAt(...O, 40, A, B, { label: "ε", tex: "\\varepsilon", c: C.globe, pad: 10 });
  f.note(8, 236, tr("fx-rapp-1", "the two plumb lines meet at ε = ζ₁ + ζ₂ − 180°"), { size: 9.5 });
  f.note(8, 249, tr("fx-rapp-2", "ρ = s/ε − h̄: no map, no coordinates, no k"), { size: 9.5 });
  f.note(8, 262, tr("fx-rapp-3", "plane: parallel plumb lines, ε = 0, ρ = ∞"), { size: 9.5, c: C.flat });
  stamp(f, tr, tr("fx-rapp-st", "ε enlarged about 100×"));
  return f;
}

/** Les 45 rayons apparents : x = longueur de la ligne (log), y = s/ε ; McDonald en haut, les visées au ras du sol en bas. */
function figRappData(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-rappd-alt", "Apparent radius against line length. The seven McDonald lines, 32 to 93 km long and well above the ground, sit between 6,950 and 7,200 km, just above 6,371. The 38 total-station lines of Kozlowski, 70 m to 1.6 km long and 1.5 m above the ground, scatter between 1,200 and 7,800 km, mostly below 6,371. None is negative or infinite, which is what a plane requires") });
  const X0 = 50, X1 = 352, Y0 = 210, Y1 = 30, YMAX = 9000;
  const lx = (m) => X0 + (Math.log10(m) - 1.7) / (5 - 1.7) * (X1 - X0);
  const ly = (km) => Y0 - Math.min(km, YMAX) / YMAX * (Y0 - Y1);
  for (const v of [0, 3000, 6000, 9000]) { f.dash(X0, ly(v), X1, ly(v), { c: "#e7e3da", dash: "3 3" }); f.note(X0 - 5, ly(v) + 4, String(v / 1000), { anchor: "end" }); }
  for (const [m, s] of [[100, "100 m"], [1000, "1 km"], [10000, "10 km"], [100000, "100 km"]]) { f.dash(lx(m), Y0, lx(m), Y1, { c: "#e7e3da", dash: "3 3" }); f.note(lx(m), Y0 + 14, s, { anchor: "middle" }); }
  f.line(X0, ly(6371), X1, ly(6371), { c: C.globe, w: 1.2 });
  f.note(X0 + 4, ly(6371) - 4, "6,371 km", { c: C.globe, size: 9.5 });
  for (const r of kozRows(KOZ)) f.dot(lx(r.s), ly(r.R), { r: 2.6, c: C.ground });
  for (const r of mcdRows(MCD, BALDY_H_FT, FT)) f.dot(lx(r.sKm * 1000), ly(r.R), { r: 3.2, c: C.globe });
  f.note(lx(30000) - 4, ly(7180) - 10, tr("fx-rappd-1", "McDonald, > 30 m up"), { c: C.globe, size: 9.5, anchor: "end" });
  f.note(lx(60), ly(400), tr("fx-rappd-2", "total station, 1.5 m above the ground"), { c: C.ground, size: 9.5 });
  f.note(X1, Y1 - 6, tr("fx-rappd-3", "plane: ∞, off the top"), { c: C.flat, size: 9.5, anchor: "end" });
  f.note(4, 244, tr("fx-rappd-4", "apparent radius s/ε (thousand km) against line length"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-rappd-st", "log length"));
  return f;
}

export const FORMULA_FIGS = { survFxArcs: figArcs, svFxRapp: figRapp, svFigRapp: figRappData, svFxTri: figFxTri, svFigTri: figTriData };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "surv"); }
