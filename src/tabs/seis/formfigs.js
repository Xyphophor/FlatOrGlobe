// Schémas des formules de l'onglet seis (2026-10-01, revue de toute la page,
// epic15/UC03). Montés par index.js après drawSymbols, avant renderTexIn.
// Schématiques, tamponnés « not to scale » (règle 1).
import { FIG, polar } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

/** R = v·t / Δ : l'onde de surface parcourt l'arc R·Δ entre l'épicentre et la station, à la vitesse v, en t. */
function figRvt(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-rvt-alt", "A sphere of radius R with an epicentre E and a station S on its surface; the angle between them at the centre is Δ, computed from their coordinates. The surface wave runs along the arc of length R Δ at speed v and arrives after the time t, so R = v t / Δ") });
  const cx = 110, cy = 120, r = 88, aE = 150, aS = 40;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  const E = polar(cx, cy, r, aE), S = polar(cx, cy, r, aS);
  f.line(cx, cy, ...E, { c: C.faint, w: 1 }); f.line(cx, cy, ...S, { c: C.faint, w: 1 });
  f.angle(cx, cy, 24, aS, aE, { label: "Δ", tex: "\\Delta", c: C.globe, pad: 10 });
  f.path(`M${E.join(" ")}A${r} ${r} 0 0 1 ${S.join(" ")}`, { c: C.flat, w: 3 });
  for (const a of [118, 88, 62]) { const p = polar(cx, cy, r, a), q = polar(cx, cy, r + 9, a); f.line(...p, ...q, { c: C.flat, w: 1.4 }); }
  f.dot(...E, { r: 4.5, c: C.ink }); f.dot(...S, { r: 4, c: C.globe });
  f.txt(E[0] - 16, E[1] + 4, "E", { c: C.ink }); f.txt(S[0] + 8, S[1] + 4, "S", { c: C.globe });
  const m = polar(cx, cy, r + 18, 95);
  f.txt(m[0], m[1], "R·Δ = v·t", { tex: "R\\Delta = v\\,t", c: C.flat, anchor: "middle", size: 11 });
  f.seg(cx, cy, ...polar(cx, cy, r, 260), { label: "R", tex: "R", c: C.soft, side: 10 });
  // le sismogramme de la station
  const x0 = 232, x1 = 370, y0 = 116;
  f.line(x0, y0, x1, y0, { c: C.faint, w: 1 });
  let d = `M${x0} ${y0}`;
  for (let x = x0; x <= x1; x += 2) { const u = x - 310, amp = x < 300 ? 1.2 * Math.sin(x) : 16 * Math.exp(-u * u / 300) * Math.sin((x - 300) / 2.2); d += `L${x} ${(y0 + amp).toFixed(1)}`; }
  f.path(d, { c: C.ink, w: 1.1 });
  f.line(x0, y0 - 30, x0, y0 + 30, { c: C.ink, w: 1, dash: "2 2" }); f.line(300, y0 - 30, 300, y0 + 30, { c: C.globe, w: 1, dash: "2 2" });
  f.arrow(x0, y0 + 40, 300, y0 + 40, { c: C.soft, w: 1.2, head: 6 });
  f.txt((x0 + 300) / 2, y0 + 56, "t", { tex: "t", c: C.soft, anchor: "middle" });
  f.note(x0, y0 - 36, tr("fx-rvt-1", "origin time"), { size: 9.5, anchor: "middle" });
  f.note(300, y0 - 36, tr("fx-rvt-2", "wave at S"), { size: 9.5, anchor: "middle", c: C.globe });
  f.note((x0 + 300) / 2, y0 + 70, tr("fx-rvt-3", "the station's own clock"), { size: 9.5, anchor: "middle" });
  f.note(10, 224, tr("fx-rvt-4", "Δ from the coordinates of E and S; v fixed in advance"), { size: 9.5 });
  stamp(f, tr, tr("fx-rvt-s", "schematic"));
  return f;
}

/** v_path : la part océanique du trajet (croûte mince, onde plus rapide) pondère les deux vitesses. */
function figBlend(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-bl-alt", "The great-circle path from an epicentre to a station, drawn as a strip: stretches over ocean in blue, over continent in brown. The share of blue is f_ocean. Below, a cross-section: thin oceanic crust over fast mantle, thick slower continental crust; the path's speed is the blend of the two") });
  const x0 = 20, x1 = 360, y = 58, segs = [[0, 0.18, "c"], [0.18, 0.62, "o"], [0.62, 0.74, "c"], [0.74, 1, "o"]];
  for (const [a, b, k] of segs) f.path(`M${x0 + a * (x1 - x0)} ${y - 9}H${x0 + b * (x1 - x0)}V${y + 9}H${x0 + a * (x1 - x0)}Z`, { c: "none", w: 0, fill: k === "o" ? "#b9d7ee" : "#d9c7a7" });
  f.path(`M${x0} ${y - 9}H${x1}V${y + 9}H${x0}Z`, { c: C.soft, w: 1 });
  f.dot(x0, y, { r: 4.5 }); f.dot(x1, y, { r: 4, c: C.globe });
  f.txt(x0 - 4, y - 16, "E", { c: C.ink }); f.txt(x1 - 4, y - 16, "S", { c: C.globe });
  f.note(x0 + 0.40 * (x1 - x0), y + 4, tr("fx-bl-1", "ocean"), { size: 9.5, anchor: "middle", c: "#1f5f8b" });
  f.note(x0 + 0.09 * (x1 - x0), y + 4, tr("fx-bl-2", "land"), { size: 9.5, anchor: "middle", c: "#7a5a2a" });
  f.txt(190, y + 30, "f_ocean = blue length / total", { tex: "f_{\\text{ocean}} = \\frac{\\text{blue}}{\\text{total}}", c: C.globe, anchor: "middle", size: 11 });
  // coupe : croûte océanique mince, continentale épaisse
  const yb = 128;
  f.path(`M20 ${yb}H190V${yb + 14}H20Z`, { c: "none", w: 0, fill: "#b9d7ee" });
  f.path(`M20 ${yb + 14}H190V${yb + 26}H20Z`, { c: "none", w: 0, fill: "#c9c3b4" });
  f.path(`M200 ${yb - 6}H360V${yb + 42}H200Z`, { c: "none", w: 0, fill: "#d9c7a7" });
  f.path(`M20 ${yb + 26}H360V${yb + 64}H20Z`, { c: "none", w: 0, fill: "#ece6da" });
  f.note(105, yb + 22, tr("fx-bl-3", "thin crust"), { size: 9, anchor: "middle" });
  f.note(280, yb + 24, tr("fx-bl-4", "thick crust"), { size: 9, anchor: "middle" });
  f.note(190, yb + 54, tr("fx-bl-5", "mantle"), { size: 9, anchor: "middle" });
  f.txt(105, yb + 84, "v_ocean ≈ 3.6 km/s", { tex: "v_{\\text{ocean}} \\approx 3.6", c: "#1f5f8b", anchor: "middle", size: 11 });
  f.txt(280, yb + 84, "v_cont ≈ 2.97 km/s", { tex: "v_{\\text{cont}} \\approx 2.97", c: "#7a5a2a", anchor: "middle", size: 11 });
  stamp(f, tr, tr("fx-bl-s", "schematic"));
  return f;
}

/** t₁ + t₂ = 2πR/v : sur une sphère l'onde arrive par les deux côtés du grand cercle ; sur un plan, une seule fois. */
function figReloc(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-rl-alt", "Left: stations scattered around an unknown centre, each with the time its wave arrived; circles of equal arrival time grow around the centre. Right: the arrival times against each station's distance from a trial centre: at the right centre they fall on one smooth curve, at a wrong one they scatter. The same is done with distances on the globe and with distances on the flat map, each allowed its own curve") });
  const cx = 95, cy = 118, P = [[40, 70], [150, 60], [168, 150], [62, 182], [120, 196], [30, 126], [140, 100]];
  for (const r of [26, 52, 78]) f.circle(cx, cy, r, { c: C.globe, w: 1, dash: "4 3" });
  P.forEach(([x, y]) => f.dot(x, y, { r: 3.5, c: C.ink }));
  f.txt(cx - 4, cy + 4, "?", { c: C.flat, anchor: "middle", size: 14 });
  f.note(cx, 226, tr("fx-rl-1", "the centre is unknown: it is fitted"), { size: 9.5, anchor: "middle" });
  // la courbe libre
  const x0 = 210, x1 = 368, y0 = 196, y1 = 50;
  f.line(x0, y0, x1, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x0, y1, { c: C.faint, w: 1 });
  let d = ""; for (let i = 0; i <= 40; i++) { const u = i / 40, x = x0 + u * (x1 - x0), y = y0 - (0.15 + 0.95 * u - 0.25 * u * u) * (y0 - y1) / 0.85; d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
  f.path(d, { c: C.globe, w: 2 });
  [[0.12, 0.02], [0.3, -0.03], [0.45, 0.02], [0.6, 0], [0.75, -0.02], [0.9, 0.03]].forEach(([u, e]) => { const x = x0 + u * (x1 - x0), y = y0 - (0.15 + 0.95 * u - 0.25 * u * u + e) * (y0 - y1) / 0.85; f.dot(x, y, { r: 3, c: C.ink }); });
  f.note((x0 + x1) / 2, y0 + 14, tr("fx-rl-2", "distance from the centre (degrees)"), { size: 9.5, anchor: "middle" });
  f.note(x0 + 2, y1 - 6, tr("fx-rl-3", "arrival time"), { size: 9.5 });
  f.txt(290, 226, "t = c₀ + c₁u + c₂u² + c₃u³", { tex: "t = c_0 + c_1 u + c_2 u^2 + c_3 u^3", c: C.globe, anchor: "middle", size: 11 });
  stamp(f, tr, tr("fx-rl-s", "schematic"));
  return f;
}

/** Une courbe pour tous : chaque séisme n'a que son centre et son heure origine c₀q ; la forme est commune. */
function figRelocCommon(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-rc-alt", "Arrival time against distance for three earthquakes: three copies of the same curve, shifted up or down by each earthquake's own origin time, with each earthquake's stations on its own copy. Only the shift and the centre belong to each earthquake; the shape is one for all") });
  const x0 = 40, x1 = 300, y0 = 190, y1 = 30, S = (u) => 0.95 * u - 0.25 * u * u;
  f.line(x0, y0, x1 + 20, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x0, y1, { c: C.faint, w: 1 });
  const cols = [C.globe, C.ink, C.flat], offs = [0.05, 0.32, 0.58];
  offs.forEach((c0, k) => {
    const Y = (u) => y0 - (c0 + S(u)) * (y0 - y1) / 1.35;
    let d = ""; for (let i = 0; i <= 40; i++) { const u = 0.1 + 0.9 * i / 40; d += (i ? "L" : "M") + (x0 + u * (x1 - x0)).toFixed(1) + " " + Y(u).toFixed(1); }
    f.path(d, { c: cols[k], w: 1.8 });
    [0.2, 0.38, 0.55, 0.7, 0.86].forEach((u, j) => f.dot(x0 + u * (x1 - x0), Y(u) + ((j * 7 + k * 3) % 5 - 2) * 0.8, { r: 2.6, c: cols[k] }));
    f.txt(x1 + 8, Y(1) + 4, `c₀,${k + 1}`, { tex: `c_{0,${k + 1}}`, c: cols[k], size: 11 });
  });
  f.note((x0 + x1) / 2, y0 + 14, tr("fx-rc-1", "distance from each earthquake's own centre"), { size: 9.5, anchor: "middle" });
  f.note(x0 + 2, y1 - 6, tr("fx-rc-2", "arrival time"), { size: 9.5 });
  f.txt(190, 222, "one shape c₁, c₂, c₃ for every earthquake", { tex: "c_1,\ c_2,\ c_3", c: C.ink, anchor: "middle", size: 11 });
  f.note(190, 222 - 16, tr("fx-rc-3", "one shape for every earthquake:"), { size: 9.5, anchor: "middle" });
  stamp(f, tr, tr("fx-rc-s", "schematic"));
  return f;
}

/** L = 1 − λ₂/λ₁ : le nuage des positions du sol dans une fenêtre ; une droite (P, S, Love) ou une ellipse (Rayleigh). */
function figPolar(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-pol-alt", "Three small boxes showing the path of the ground during a few seconds: a straight line tilted near the vertical for a P wave, a straight horizontal line across the path for an S or Love wave, and an ellipse in the vertical plane for a Rayleigh wave; under each, its rectilinearity L, close to 1 for the lines and small for the ellipse") });
  const box = (cx, title, draw, lab, sub) => {
    f.path(`M${cx - 52} 40H${cx + 52}V144H${cx - 52}Z`, { c: C.faint, w: 1 });
    f.line(cx - 52, 92, cx + 52, 92, { c: C.faint, w: 0.6, dash: "2 2" }); f.line(cx, 40, cx, 144, { c: C.faint, w: 0.6, dash: "2 2" });
    draw(cx, 92);
    f.note(cx, 30, title, { size: 10, anchor: "middle", c: C.ink });
    f.txt(cx, 166, lab, { tex: lab.replace("≈", "\\approx").replace("≪", "\\ll"), anchor: "middle", size: 11, c: C.globe });
    f.note(cx, 184, sub, { size: 9, anchor: "middle" });
  };
  box(68, tr("fx-pol-1", "P"), (x, y) => f.line(x - 14, y + 38, x + 14, y - 38, { c: "#1d4ed8", w: 2.4 }), "L ≈ 1", tr("fx-pol-1b", "along the ray"));
  box(190, tr("fx-pol-2", "S, Love"), (x, y) => f.line(x - 40, y + 4, x + 40, y - 4, { c: "#7c3aed", w: 2.4 }), "L ≈ 1", tr("fx-pol-2b", "across the path"));
  box(312, tr("fx-pol-3", "Rayleigh"), (x, y) => f.path(`M${x - 26} ${y}A26 40 0 1 0 ${x + 26} ${y}A26 40 0 1 0 ${x - 26} ${y}Z`, { c: "#be185d", w: 2.2, fill: "none" }), "L ≪ 1", tr("fx-pol-3b", "ellipse, vertical plane"));
  f.note(190, 208, tr("fx-pol-4", "λ₁ ≥ λ₂ ≥ λ₃: the spread of the motion along its three main directions"), { size: 9.5, anchor: "middle" });
  stamp(f, tr, tr("fx-pol-s", "schematic"));
  return f;
}

export const FORMULA_FIGS = { seisFxRvt: figRvt, seisFxBlend: figBlend, seisFxReloc: figReloc, seisFxRelocC: figRelocCommon, seisFxPolar: figPolar };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "seis"); }
