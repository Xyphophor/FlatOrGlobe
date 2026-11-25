// Figures de l'onglet moon (epic19).
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { llrRadii, passPoints, passCost, stationRadius } from "./logic.js";
import { LLR_PASSES } from "../../data/presets/moon-llr.js";
import { ECL_CRATERS, ECL_CRATERS_T } from "../../data/presets/moon-eclcraters.js";

const C = FIG.C;
let memo = null;
export const llrMemo = () => (memo ||= llrRadii(LLR_PASSES));

function figLlr(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-llr-alt", "The Earth's centre, the observatory on a circle of radius R around the axis, and the Moon at distance D from the centre. The measured range rho is the side from the observatory to the Moon; it changes through the night as the observatory is carried around, by up to R") });
  const ox = 90, oy = 120, R = 50;
  f.circle(ox, oy, R, { c: C.sea, w: 1.6 }); f.dot(ox, oy, { r: 3 });
  const sx = ox + R * Math.cos(-0.9), sy = oy + R * Math.sin(-0.9);
  f.dot(sx, sy, { r: 4, c: C.globe }); f.line(ox, oy, sx, sy, { c: C.soft }); f.note((ox + sx) / 2 - 12, (oy + sy) / 2, "R", { size: 11 });
  f.circle(340, 70, 9, { c: C.ink, w: 1.4, fill: "#e7e3da" });
  f.line(ox, oy, 340, 70, { c: C.faint, w: 1, dash: "4 3" }); f.note(220, 106, "D", { size: 11 });
  f.line(sx, sy, 340, 70, { c: C.globe, w: 1.8 }); f.note(220, 64, "ρ = cτ/2", { size: 11, c: C.globe });
  f.angleAt(ox, oy, 22, [sx, sy], [340, 70], { label: "Z", c: C.soft, pad: 10 });
  f.note(8, 196, tr("fx-llr-1", "ρ² = D² − 2DR cos Z + R²"), { size: 9.5 });
  f.note(8, 210, tr("fx-llr-2", "the observatory turns with the Earth: Z changes, D does not jump"), { size: 9.5 });
  stamp(f, tr, tr("fx-llr-st", "Moon drawn ~60× too close"));
  return f;
}
function figLlrData(tr) {
  const L = llrMemo(), p0 = passPoints(LLR_PASSES[0]);
  const f = FIG.make({ w: 380, h: 300, alt: tr("fx-llrd-alt", "Top: residual of the Moon's distance from a cubic against the trial radius, falling from tens of kilometres at R equal to zero to about a metre at 6,366 kilometres and rising again. Bottom: the 55 radii, between 6,361 and 6,372 kilometres") });
  // haut : coût contre R (échelle log)
  const X0 = 52, X1 = 366, Y0 = 150, Y1 = 26, Rs = [];
  const best = L.rows[0].R;
  for (let r = 0; r <= 9000; r += 150) Rs.push(r);
  for (let d = -140; d <= 140; d += d > -10 && d < 10 ? 0.5 : 5) Rs.push(best + d); // le creux, échantillonné fin
  Rs.sort((a, b) => a - b);
  const costs = Rs.map((r) => Math.max(passCost(p0, r), 0.1));
  const lx = (r) => X0 + r / 9000 * (X1 - X0), ly = (c) => Y0 - (Math.log10(c) + 1) / 6 * (Y0 - Y1);
  for (const c of [0.1, 1, 10, 100, 1000, 10000, 100000]) { f.dash(X0, ly(c), X1, ly(c), { c: "#e7e3da" }); f.note(X0 - 4, ly(c) + 4, c >= 1000 ? c / 1000 + " km" : c + " m", { anchor: "end", size: 9 }); }
  for (const r of [0, 3000, 6000, 9000]) f.note(lx(r), Y0 + 13, String(r), { anchor: "middle", size: 9.5 });
  f.path(Rs.map((r, i) => `${i ? "L" : "M"}${lx(r).toFixed(1)} ${ly(costs[i]).toFixed(1)}`).join(""), { c: C.globe, w: 2 });
  f.dot(lx(0), ly(costs[0]), { r: 4, c: C.flat }); f.note(lx(0) + 6, ly(costs[0]) + 18, tr("fx-llrd-1", "R = 0: station at rest"), { size: 9.5, c: C.flat });
  f.note(X1, Y0 + 26, tr("fx-llrd-2", "trial radius (km) · residual from a cubic"), { size: 9.5, anchor: "end" });
  // bas : les 55 rayons
  const B0 = 6355, B1 = 6380, by = 250, bx = (r) => X0 + (r - B0) / (B1 - B0) * (X1 - X0);
  for (const r of [6355, 6360, 6365, 6370, 6375, 6380]) { f.dash(bx(r), by - 22, bx(r), by + 6, { c: "#e7e3da" }); f.note(bx(r), by + 18, String(r), { anchor: "middle", size: 9.5 }); }
  const sr = stationRadius("GRSM");
  f.line(bx(sr), by - 24, bx(sr), by + 6, { c: C.soft, w: 1.4 });
  L.rows.forEach((r, i) => f.dot(bx(r.R), by - 4 - (i % 4) * 5, { r: 2.4, c: C.globe }));
  f.line(bx(L.q.med), by - 26, bx(L.q.med), by + 6, { c: C.globe, w: 2 });
  f.note(4, 292, tr("fx-llrd-3", "radius from each pass (km) · grey: reference ellipsoid at the station"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-llrd-st", "log residual"));
  return f;
}
function figPar(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-mpar-alt", "The Earth of radius R and the Moon at distance D. From the Moon the Earth's radius subtends the horizontal parallax pi; an observer carried from the sub-lunar point to the limb sees the Moon shift against the stars by up to pi") });
  const ex = 70, ey = 100, R = 45;
  f.circle(ex, ey, R, { c: C.sea, w: 1.6 }); f.dot(ex, ey, { r: 3 });
  f.circle(340, 100, 8, { c: C.ink, w: 1.4, fill: "#e7e3da" });
  f.line(ex, ey, 340, 100, { c: C.faint, dash: "4 3" }); f.line(ex, ey - R, 340, 100, { c: C.globe, w: 1.4 }); f.line(ex, ey, ex, ey - R, { c: C.soft });
  f.note(ex - 14, ey - 18, "R", { size: 11 }); f.note(200, 116, "D", { size: 11 });
  f.angleAt(340, 100, 60, [ex, ey], [ex, ey - R], { label: "π", tex: "\\pi", c: C.globe, pad: 10 });
  f.note(8, 182, tr("fx-mpar-1", "sin π = R/D, and Kepler: n²D³ = gR²(1 + m/M)"), { size: 9.5 });
  stamp(f, tr, tr("fx-mpar-st", "π enlarged ~10×"));
  return f;
}
function figEcl(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-ecl-alt", "The Sun, the Earth and the cone of the Earth's shadow reaching the Moon's distance. At the Moon the shadow's angular radius sigma, the Sun's angular radius s and the Moon's parallax pi satisfy pi plus the Sun's parallax equals sigma plus s") });
  f.circle(40, 95, 30, { c: C.flat, w: 2, fill: C.wash });
  f.path("M200 79 L360 89 L360 101 L200 111 Z", { c: C.ink, w: 1, fill: "#e7e3da" });
  f.circle(200, 95, 16, { c: C.sea, w: 1.6, fill: C.paper });
  f.line(40, 65, 200, 79, { c: C.faint }); f.line(40, 125, 200, 111, { c: C.faint });
  f.circle(330, 95, 9, { c: C.ink, w: 1.2 });
  f.note(330, 76, "σ", { anchor: "middle", size: 11 }); f.note(40, 140, "s", { anchor: "middle", size: 11 });
  f.note(8, 182, tr("fx-ecl-1", "π + π☉ = σ + s: the shadow's size measures the Moon's parallax"), { size: 9.5 });
  stamp(f, tr, tr("fx-ecl-st", "angles enlarged"));
  return f;
}

// Le rayon du corps qui fait l'ombre, éclipse par éclipse (2026-10-28) : 1842-2011, à côté du rayon moyen de la Terre.
function figEclRs(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-eclrs-alt", "The radius of the body that casts the umbra's edge, one dot per eclipse from 1842 to 2011, between about 6,450 and 6,520 kilometres, all above the Earth's mean radius of 6,371 kilometres drawn as a grey line") });
  const X0 = 46, X1 = 372, Y0 = 180, Y1 = 26, y0 = 6360, y1 = 6540;
  const x = (yr) => X0 + (yr - 1840) / 175 * (X1 - X0), y = (r) => Y0 - (r - y0) / (y1 - y0) * (Y0 - Y1);
  for (const r of [6360, 6400, 6440, 6480, 6520]) { f.dash(X0, y(r), X1, y(r), { c: "#e7e3da" }); f.note(X0 - 4, y(r) + 4, String(r), { anchor: "end", size: 9 }); }
  for (const yr of [1850, 1900, 1950, 2000]) f.note(x(yr), Y0 + 13, String(yr), { anchor: "middle", size: 9.5 });
  f.line(X0, y(6371), X1, y(6371), { c: C.soft, w: 1.4 }); f.note(X1, y(6371) - 5, tr("fx-eclrs-1", "Earth's mean radius, 6,371 km"), { anchor: "end", size: 9.5 });
  for (const e of ECL_CRATERS.eclipses) {
    if (e.n < 20) continue;
    const yr = +e.d.slice(0, 4) + (+e.d.slice(5, 7) - 0.5) / 12;
    f.dot(x(yr), y(e.rs), { r: Math.min(4.5, 1.6 + Math.sqrt(e.n) / 9), c: C.globe });
  }
  f.line(X0, y(ECL_CRATERS.rs), X1, y(ECL_CRATERS.rs), { c: C.globe, w: 1.4, dash: "5 3" });
  f.note(X0 + 4, y(ECL_CRATERS.rs) - 6, tr("fx-eclrs-2", "median {v} km").replace("{v}", ECL_CRATERS.rs.toLocaleString(document.documentElement.lang || "en")), { size: 9.5, c: C.globe });
  f.note(4, 212, tr("fx-eclrs-3", "one dot per eclipse with 20 timings or more · km"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-eclrs-st", "radius axis starts at 6,360 km"));
  return f;
}

// Le schéma de la formule de forme : l'ombre d'une boule (cercle, quel que soit l'éclairage) et celle d'un disque
// dont la normale est l'axe de la Terre, éclairé depuis le Soleil à δ☉ (ellipse de hauteur sin δ☉).
function figShapeFx(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-shape-alt", "Left: a ball lit from the side casts a round shadow on the Moon, of radius sigma zero at every latitude beta. Right: a flat disc with the Earth's axis as its normal, lit from the Sun 15 degrees above its plane, casts an ellipse whose height is sine 15 degrees, about a quarter, of its width") });
  const R = 52, cy = 100;
  // la boule
  f.circle(95, cy, R, { c: C.globe, w: 2, fill: "#e7e3da" });
  f.line(95, cy, 95 + R * Math.cos(-0.6), cy + R * Math.sin(-0.6), { c: C.ink, w: 1.2 });
  f.note(95 + 22, cy - 22, "σ₀", { size: 11 });
  f.angleAt(95, cy, 18, [95 + 40, cy], [95 + R * Math.cos(-0.6), cy + R * Math.sin(-0.6)], { label: "β", tex: "\\beta", c: C.soft, pad: 9 });
  f.dash(95 - R - 8, cy, 95 + R + 8, cy, { c: C.faint });
  f.note(95, cy + R + 18, tr("fx-shape-1", "a ball: round from every side"), { anchor: "middle", size: 9.5, c: C.globe });
  // le disque
  const q = Math.sin(15 * Math.PI / 180);
  f.ellipse(285, cy, R, R * q, { c: C.flat, w: 2, fill: "#f6ecdc" });
  f.dash(285, cy - R - 4, 285, cy + R + 4, { c: C.faint });
  f.note(285 + 6, cy - R * q - 6, "σ₀ sin δ☉", { size: 10, c: C.flat });
  f.note(285, cy + R + 18, tr("fx-shape-2", "a disc, Sun at δ☉ = 15°"), { anchor: "middle", size: 9.5, c: C.flat });
  f.note(285 - 6, cy - R + 2, tr("fx-shape-3", "pole"), { anchor: "end", size: 9, c: C.soft });
  stamp(f, tr, tr("fx-shape-st", "shadows as seen at the Moon"));
  return f;
}

// La forme de l'ombre (2026-10-28) : chaque σ divisé par la médiane de son éclipse, contre la latitude β sur l'ombre.
// En haut, toute l'échelle : les points (comptés par case de 2° × 0,5 %), et l'ellipse du meilleur disque à trois
// déclinaisons du Soleil ; en bas, la loupe : moyennes par tranche de 10°, l'aplatissement ajusté et celui de la Terre.
function figEclShape(tr) {
  const f = FIG.make({ w: 380, h: 380, alt: tr("fx-eclsh-alt", "Top: every timing's shadow radius divided by its eclipse's median, against the latitude on the shadow from minus 90 to plus 90 degrees: all points lie in a thin band at 1, while a flat disc's shadow would fall to between 5 and 40 percent of its width towards the poles. Bottom: the band magnified, ten-degree averages within two tenths of a percent of 1, slightly lower towards the poles, as the Earth's flattening predicts") });
  const X0 = 46, X1 = 372, bx = (b) => X0 + (b + 90) / 180 * (X1 - X0);
  // --- en haut : 0 à 1,15
  const T0 = 190, T1 = 26, ty = (v) => T0 - v / 1.15 * (T0 - T1);
  for (const v of [0, 0.25, 0.5, 0.75, 1]) { f.dash(X0, ty(v), X1, ty(v), { c: "#e7e3da" }); f.note(X0 - 4, ty(v) + 4, String(v), { anchor: "end", size: 9 }); }
  const cells = new Map();
  for (const t of ECL_CRATERS_T) { if (t[4]) continue; const k = `${Math.floor(t[1] / 2)},${Math.floor(t[2] / 0.005)}`; cells.set(k, (cells.get(k) || 0) + 1); }
  for (const [k, n] of cells) {
    const [i, j] = k.split(",").map(Number), x0 = bx(i * 2), x1 = bx(i * 2 + 2), y0 = ty(j * 0.005), y1 = ty((j + 1) * 0.005);
    f.path(`M${x0.toFixed(1)} ${y1.toFixed(1)}H${x1.toFixed(1)}V${y0.toFixed(1)}H${x0.toFixed(1)}Z`, { c: "none", w: 0.01, fill: C.globe })
      ?.setAttribute("fill-opacity", Math.min(1, 0.25 + n / 40).toFixed(2));
  }
  for (const dec of [3, 12, 23]) {
    const q = Math.sin(dec * Math.PI / 180), pts = [];
    for (let b = -90; b <= 90; b += 2) { const r = 1 / Math.sqrt(Math.cos(b * Math.PI / 180) ** 2 + Math.sin(b * Math.PI / 180) ** 2 / (q * q)); pts.push(`${pts.length ? "L" : "M"}${bx(b).toFixed(1)} ${ty(r).toFixed(1)}`); }
    f.path(pts.join(""), { c: C.flat, w: 1.4, dash: "5 3" });
    f.note(bx(50) + 4, ty(1 / Math.sqrt(Math.cos(50 * Math.PI / 180) ** 2 + Math.sin(50 * Math.PI / 180) ** 2 / (q * q))) - 4, `δ☉ = ${dec}°`, { size: 9, c: C.flat });
  }
  f.note(X0 + 4, ty(1) - 6, tr("fx-eclsh-1", "{n} timings: the shadow is round").replace("{n}", ECL_CRATERS_T.filter((t) => !t[4]).length.toLocaleString(document.documentElement.lang || "en")), { size: 9.5, c: C.globe });
  f.note(X0 + 4, ty(0.12), tr("fx-eclsh-2", "flat disc, best radius"), { size: 9.5, c: C.flat });
  // --- en bas : la loupe, 0,99 à 1,01
  const B0 = 340, B1 = 226, lo = 0.993, hi = 1.006, by = (v) => B0 - (v - lo) / (hi - lo) * (B0 - B1);
  for (const v of [0.994, 0.997, 1, 1.003, 1.006]) { f.dash(X0, by(v), X1, by(v), { c: "#e7e3da" }); f.note(X0 - 4, by(v) + 4, v.toFixed(3), { anchor: "end", size: 9 }); }
  for (const b of [-90, -45, 0, 45, 90]) f.note(bx(b), B0 + 13, `${b}°`, { anchor: "middle", size: 9.5 });
  // niveau moyen a des moyennes, pour poser les deux courbes d'aplatissement
  const bins = ECL_CRATERS.bins, s2 = (b) => Math.sin(b * Math.PI / 180) ** 2;
  let num = 0, den = 0; for (const [b, m, , n] of bins) { num += n * (m + ECL_CRATERS.E * s2(b)); den += n; }
  const a = num / den, curve = (e) => { const p = []; for (let b = -90; b <= 90; b += 3) p.push(`${p.length ? "L" : "M"}${bx(b).toFixed(1)} ${by(a * (1 - e * s2(b))).toFixed(1)}`); return p.join(""); };
  f.path(curve(1 / 298.257), { c: C.soft, w: 1.4, dash: "4 3" });
  f.path(curve(ECL_CRATERS.E), { c: C.globe, w: 1.6 });
  for (const [b, m, se] of bins) { f.line(bx(b), by(m - 2 * se), bx(b), by(m + 2 * se), { c: C.globe, w: 1.2 }); f.dot(bx(b), by(m), { r: 2.8, c: C.globe }); }
  f.note(X0 + 4, B1 - 8, tr("fx-eclsh-3", "×100 magnified · 10° averages ± 2 SE"), { size: 9, c: C.soft });
  f.note(X0 + 4, B1 + 4, tr("fx-eclsh-5", "blue: fitted flattening · grey: the Earth's"), { size: 9, c: C.soft });
  f.note(X1, 376, tr("fx-eclsh-4", "latitude on the shadow β (north: the Earth's pole)"), { anchor: "end", size: 9.5 });
  axesStamp(f, tr, tr("fx-eclsh-st", "σ / median σ of its eclipse"));
  return f;
}

export const FORMULA_FIGS = { moonFxLlr: figLlr, moonFigLlr: figLlrData, moonFxPar: figPar, moonFxEcl: figEcl, moonFigEclRs: figEclRs, moonFxShape: figShapeFx, moonFigEclShape: figEclShape };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "moon"); }
