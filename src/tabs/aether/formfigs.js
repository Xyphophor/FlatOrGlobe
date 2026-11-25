// Figures de l'onglet aether (2026-10-25) : une figure fixe par formule (règle du propriétaire), plus la frise et le
// graphique des limites. Schémas : tampon « not to scale » ; les deux tracés (vitesses, limites) et les barres du GPS sont
// à l'échelle de leurs axes ; la Terre contractée est à l'échelle vraie (la différence est sous le pixel, c'est le propos).
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { BOUNDS, gpsDrift, addVel, C_LIGHT } from "./logic.js";

const C = FIG.C;
const foot = (f, s) => f.note(8, f.h - 6, s, { size: 9.5 });

function figTimeline(tr) {
  const rows = [
    [1690, "idea", tr("tl-huygens", "Huygens: light is a wave")],
    [1729, "fit", tr("tl-bradley", "Bradley: aberration, 20″")],
    [1810, "null", tr("tl-arago", "Arago: a prism sees no motion")],
    [1818, "idea", tr("tl-fresnel", "Fresnel: still aether, partial drag")],
    [1851, "fit", tr("tl-fizeau", "Fizeau: the drag, measured")],
    [1862, "idea", tr("tl-maxwell", "Maxwell: light is electromagnetic")],
    [1871, "null", tr("tl-airy", "Airy: water changes nothing")],
    [1887, "null", tr("tl-mm", "Michelson–Morley: no wind")],
    [1889, "idea", tr("tl-fitz", "FitzGerald, Lorentz: contraction")],
    [1904, "idea", tr("tl-lorentz", "Lorentz, Poincaré: transformations")],
    [1905, "idea", tr("tl-einstein", "Einstein: no aether needed")],
    [1913, "fit", tr("tl-sagnac", "Sagnac: a turning loop delays light")],
    [1925, "fit", tr("tl-mgp", "Michelson–Gale: the Earth turns")],
    [1933, "null", tr("tl-miller", "Miller's wind (heat, 1955)")],
    [2015, "null", tr("tl-cav", "cavities: no wind to 10⁻¹⁸")],
  ];
  const top = 52, step = 19, h = top + rows.length * step + 14;
  const f = FIG.make({ w: 380, h, alt: tr("tl-alt", "A vertical timeline from 1690 to 2015: ideas about the aether on one side, experiments on the other, coloured by whether they fit a moving Earth or gave a null result") });
  const xl = 64, col = { idea: C.ink, fit: C.globe, null: C.flat };
  f.line(xl, top - 8, xl, top + (rows.length - 1) * step + 6, { c: C.faint, w: 2 });
  rows.forEach(([y, k, s], i) => {
    const yy = top + i * step;
    f.note(xl - 10, yy + 4, String(y), { size: 10.5, anchor: "end", c: C.ink });
    if (k === "idea") f.circle(xl, yy, 4.5, { c: C.ink, w: 1.6, fill: C.paper }); else f.dot(xl, yy, { r: 4.5, c: col[k] });
    f.note(xl + 12, yy + 4, s, { size: 10.5, c: col[k] });
  });
  f.circle(12, 30, 4, { c: C.ink, w: 1.4, fill: C.paper }); f.note(20, 34, tr("tl-k1", "idea"), { size: 10 });
  f.dot(92, 30, { r: 4, c: C.globe }); f.note(100, 34, tr("tl-k2", "fits a moving Earth"), { size: 10, c: C.globe });
  f.dot(300, 30, { r: 4, c: C.flat }); f.note(308, 34, tr("tl-k3", "null result"), { size: 10, c: C.flat });
  stamp(f, tr, tr("tl-st", "dates evenly spaced"));
  return f;
}

function figMaxwell(tr, v) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("mx-alt", "An electromagnetic wave: the electric field oscillates up and down, the magnetic field sideways, both across the direction of travel; its speed follows from two bench constants") });
  const x0 = 24, x1 = 300, y0 = 96, A = 46, k = 2 * Math.PI / 130;
  f.arrow(x0, y0, x1 + 30, y0, { c: C.faint, w: 1.2 });
  let e = "", b = "";
  for (let x = 0; x <= x1 - x0; x += 3) {
    const s = Math.sin(k * x);
    e += (x ? "L" : "M") + (x0 + x) + " " + (y0 - A * s);
    b += (x ? "L" : "M") + (x0 + x + 0.3 * A * s) + " " + (y0 + 0.3 * A * s);
  }
  f.path(e, { c: C.globe, w: 2 }); f.path(b, { c: C.sea, w: 1.6, dash: "4 2" });
  f.note(x0 + 30, y0 - A - 4, "E", { size: 12, c: C.globe }); f.note(x0 + 2, y0 + 30, "B", { size: 12, c: C.sea });
  f.note(x1 + 32, y0 + 4, "c", { size: 12, c: C.ink });
  f.note(8, 172, tr("mx-1", "μ₀, ε₀: coils and charged plates on a bench"), { size: 10.5 });
  f.note(8, 186, `1/√(μ₀ε₀) = ${v.cMax ?? "299,792"} km/s`, { size: 10.5, c: C.globe });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

function figAberr(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("ab-alt", "Left: rain falls vertically, a walker tips the umbrella forward. Right: starlight falls at speed c, the telescope moves at v and must be tipped forward by the angle alpha, with tan alpha equal to v over c") });
  // à gauche : la pluie et le parapluie
  for (const x of [20, 40, 60, 80, 100]) for (const y of [30, 70]) f.line(x, y, x, y + 16, { c: C.sea, w: 1.2 });
  const px = 60, py = 176;
  f.line(px, py, px + 10, py - 50, { c: C.ink, w: 1.6 });
  f.path(`M${px - 12} ${py - 46}Q${px + 14} ${py - 76} ${px + 38} ${py - 52}`, { c: C.ink, w: 1.8 });
  f.arrow(px - 10, py + 10, px + 30, py + 10, { c: C.flat, w: 1.6 });
  f.note(px + 34, py + 14, tr("ab-walk", "walking"), { size: 10 });
  // à droite : le triangle des vitesses
  const tx = 240, ty = 172, H = 130, Wv = 38;
  f.arrow(tx + Wv, ty - H, tx + Wv, ty - 4, { c: C.globe, w: 2 });
  f.note(tx + Wv + 6, ty - H / 2, "c", { size: 12, c: C.globe });
  f.arrow(tx + Wv, ty, tx + 2, ty, { c: C.flat, w: 1.8 });
  f.note(tx + Wv / 2, ty + 14, "−v", { size: 11, c: C.flat, anchor: "middle" });
  f.line(tx, ty, tx + Wv, ty - H, { c: C.ink, w: 7 }); f.line(tx, ty, tx + Wv, ty - H, { c: C.paper, w: 4 });
  f.angleAt(tx + Wv, ty - H, 34, [tx + Wv, ty], [tx, ty], { label: "α", pad: 10 });
  f.note(tx - 6, ty - 70, tr("ab-tel", "telescope"), { size: 10, anchor: "end" });
  f.note(372, 40, "tan α = v / c", { size: 11.5, c: C.globe, anchor: "end" });
  foot(f, tr("ab-1", "the light seen from a moving telescope comes slightly from ahead"));
  stamp(f, tr, tr("ab-st", "angle enlarged ~3,000 times"));
  return f;
}

function figDrag(tr, v) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("dr-alt", "Fizeau's experiment: two tubes of water flowing in opposite directions; one beam of light travels with the water in both tubes, the other against it; they are compared by interference") });
  const xL = 40, xR = 320, y1 = 70, y2 = 130;
  for (const y of [y1, y2]) { f.path(`M${xL} ${y - 10}H${xR}V${y + 10}H${xL}Z`, { c: C.sea, w: 1.4, fill: "#e6f3f1" }); }
  f.arrow(150, y1 - 18, 230, y1 - 18, { c: C.sea, w: 1.6 }); f.arrow(230, y2 + 18, 150, y2 + 18, { c: C.sea, w: 1.6 });
  f.note(240, y1 - 15, tr("dr-w", "water, v"), { size: 10, c: C.sea }); f.note(140, y2 + 22, tr("dr-w", "water, v"), { size: 10, c: C.sea, anchor: "end" });
  f.arrow(xL + 10, y1 - 3, xR - 10, y1 - 3, { c: C.globe, w: 1.8 }); f.arrow(xR - 10, y2 - 3, xL + 10, y2 - 3, { c: C.globe, w: 1.8 });
  f.arrow(xR - 10, y1 + 4, xL + 10, y1 + 4, { c: C.flat, w: 1.8 }); f.arrow(xL + 10, y2 + 4, xR - 10, y2 + 4, { c: C.flat, w: 1.8 });
  f.note(xR + 6, y1 + 4, tr("dr-with", "with"), { size: 10, c: C.globe }); f.note(xR + 6, y2 + 4, tr("dr-against", "against"), { size: 10, c: C.flat });
  f.note(8, 172, `${tr("dr-1", "light gains f v, f = 1 − 1/n²")} = ${v.fF ?? "0.437"}`, { size: 10.5, c: C.globe });
  foot(f, tr("dr-2", "full drag would give v; Fizeau found Fresnel's fraction"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

function figAiry(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("ai-alt", "A telescope tube filled with water moving to the right. Starlight arrives at the angle alpha, bends at the entrance to alpha over n, and with Fresnel's drag that is exactly the direction the moving tube needs, so the image does not move") });
  const ox = 170, oy = 62, len = 140, a = 12 * Math.PI / 180, ain = a / 1.333;
  const ex = ox + len * Math.sin(ain), ey = oy + len * Math.cos(ain);
  const nx = Math.cos(ain) * 16, ny = -Math.sin(ain) * 16;
  f.path(`M${ox - nx} ${oy - ny}L${ox + nx} ${oy + ny}L${ex + nx} ${ey + ny}L${ex - nx} ${ey - ny}Z`, { c: C.ink, w: 1.6, fill: "#e6f3f1" });
  f.line(ox - nx - 4, oy - ny, ox + nx + 4, oy + ny, { c: C.ink, w: 3 });
  f.arrow(ox - 50 * Math.sin(a), oy - 50 * Math.cos(a), ox, oy, { c: C.globe, w: 2 });
  f.line(ox, oy, ex, ey, { c: C.globe, w: 2 });
  f.dash(ox, oy - 52, ox, oy + 30);
  f.angleAt(ox, oy, 38, [ox, oy - 52], [ox - 50 * Math.sin(a), oy - 50 * Math.cos(a)], { label: "α", pad: 9 });
  f.angleAt(ox, oy, 26, [ox, oy + 30], [ex, ey]); f.note(ox - 22, oy + 30, "α/n", { size: 11, anchor: "end", c: C.ink });
  f.arrow(ex + 30, ey - 6, ex + 70, ey - 6, { c: C.flat, w: 1.8 }); f.note(ex + 74, ey - 2, "v", { size: 12, c: C.flat });
  f.note(ox + 26, oy + 70, tr("ai-water", "water, n"), { size: 10, c: C.sea });
  f.note(8, 24, tr("ai-1", "Snell: the ray bends to α/n"), { size: 10.5 });
  f.note(8, 40, tr("ai-2", "Fresnel: the tube needs α/n"), { size: 10.5, c: C.globe });
  foot(f, tr("ai-3", "the two agree: water leaves the aberration unchanged"));
  stamp(f, tr, tr("ai-st", "angles enlarged"));
  return f;
}

function figMM(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("mm-alt", "Michelson's interferometer: light from a source is split in two by a half-silvered mirror, travels along two perpendicular arms of length L to mirrors and back, and is recombined at the detector. An aether wind would blow along one arm") });
  const sx = 30, cx = 150, cy = 140, L = 150;
  f.arrow(sx, cy, cx - 8, cy, { c: C.globe, w: 1.8 });
  f.note(sx - 4, cy - 10, tr("mm-src", "source"), { size: 10 });
  f.line(cx - 12, cy + 12, cx + 12, cy - 12, { c: C.ink, w: 3 });
  f.line(cx, cy - 3, cx + L, cy - 3, { c: C.globe, w: 1.4 }); f.line(cx, cy + 3, cx + L, cy + 3, { c: C.globe, w: 1.4, dash: "3 2" });
  f.line(cx + L, cy - 16, cx + L, cy + 16, { c: C.ink, w: 3.5 });
  f.line(cx - 3, cy, cx - 3, cy - 100, { c: C.globe, w: 1.4 }); f.line(cx + 3, cy, cx + 3, cy - 100, { c: C.globe, w: 1.4, dash: "3 2" });
  f.line(cx - 16, cy - 100, cx + 16, cy - 100, { c: C.ink, w: 3.5 });
  f.arrow(cx, cy, cx, cy + 50, { c: C.globe, w: 1.8 }); f.note(cx + 6, cy + 54, tr("mm-det", "fringes"), { size: 10 });
  f.seg(cx, cy + 22, cx + L, cy + 22, { label: "L, t∥", side: 12 });
  f.note(cx - 22, cy - 50, "L, t⊥", { size: 11, anchor: "end" });
  f.arrow(370, 52, 230, 52, { c: C.flat, w: 1.8, dash: "6 3" });
  f.note(370, 40, tr("mm-wind", "aether wind, v"), { size: 10.5, c: C.flat, anchor: "end" });
  foot(f, tr("mm-1", "upstream and back takes longer than across and back"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

function figContract(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("ct-alt", "The two arms of the interferometer: the arm across the motion keeps its length L; the arm along the motion is shortened to L times the square root of one minus v squared over c squared, drawn hugely exaggerated, so that both round trips take the same time") });
  const cx = 70, cy = 150, L = 120, Lc = 84;
  f.line(cx, cy, cx, cy - L, { c: C.ink, w: 5 }); f.note(cx - 8, cy - L / 2, "L", { size: 12, anchor: "end" });
  f.line(cx, cy, cx + L, cy, { c: C.faint, w: 5, dash: "4 4" });
  f.line(cx, cy, cx + Lc, cy, { c: C.globe, w: 5 });
  f.note(cx + Lc / 2, cy + 20, "L √(1 − v²/c²)", { size: 11, c: C.globe, anchor: "middle" });
  f.arrow(cx + L + 20, cy - 30, cx + L + 80, cy - 30, { c: C.flat, w: 1.8 }); f.note(cx + L + 84, cy - 26, "v", { size: 12, c: C.flat });
  f.note(372, 60, "t∥ = t⊥", { size: 12, c: C.globe, anchor: "end" });
  f.note(372, 78, tr("ct-1", "at every speed"), { size: 10.5, anchor: "end" });
  foot(f, tr("ct-2", "for 30 km/s the real shortening is 5 parts in a billion"));
  stamp(f, tr, tr("ct-st", "shortening exaggerated ~60 million times"));
  return f;
}

function figLightClock(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("lc-alt", "A light clock: a pulse bounces between two mirrors. At rest it goes straight up and down. Moving at v, the pulse follows a longer zigzag at the same speed c, so each tick lasts longer") });
  const yT = 58, yB = 166;
  f.line(30, yT, 70, yT, { c: C.ink, w: 3 }); f.line(30, yB, 70, yB, { c: C.ink, w: 3 });
  f.arrow(50, yB, 50, yT + 3, { c: C.globe, w: 1.8 });
  f.note(56, (yT + yB) / 2, "c Δτ/2", { size: 10.5, c: C.globe });
  f.note(50, yB + 18, tr("lc-rest", "at rest"), { size: 10, anchor: "middle" });
  const x0 = 150, dx = 90;
  for (const k of [0, 1, 2]) { const x = x0 + k * dx; f.line(x - 18, yT, x + 18, yT, { c: k === 1 ? C.ink : C.faint, w: 3 }); f.line(x - 18, yB, x + 18, yB, { c: k === 1 ? C.ink : C.faint, w: 3 }); }
  f.arrow(x0, yB, x0 + dx, yT + 3, { c: C.globe, w: 1.8 }); f.arrow(x0 + dx, yT, x0 + 2 * dx, yB - 3, { c: C.globe, w: 1.8 });
  f.dash(x0, yB, x0 + dx, yB); f.dash(x0 + dx, yB, x0 + dx, yT);
  f.note(x0 + dx / 2, yB + 14, "v Δt/2", { size: 10.5, anchor: "middle", c: C.flat });
  f.note(x0 + dx / 2 - 10, (yT + yB) / 2 - 6, "c Δt/2", { size: 10.5, anchor: "end", c: C.globe });
  f.arrow(x0 + 2 * dx - 10, yB + 20, x0 + 2 * dx + 30, yB + 20, { c: C.flat, w: 1.6 }); f.note(x0 + 2 * dx + 34, yB + 24, "v", { size: 11, c: C.flat });
  f.note(372, 34, tr("lc-1", "(cΔt)² = (cΔτ)² + (vΔt)²"), { size: 10.5, c: C.globe, anchor: "end" });
  foot(f, tr("lc-2", "same speed c, longer path: the moving clock ticks slower"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

function figVadd(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("va-alt", "Graph of the combined speed against the frame's speed, for a body moving at half the speed of light in that frame: the simple sum passes the speed of light, Einstein's sum bends and never reaches it") });
  const ox = 46, oy = 186, W = 280, Hh = 150, X = (x) => ox + x * W, Y = (y) => oy - (y / 1.5) * Hh;
  f.axes(ox, oy, W + 44, Hh + 14, { x: "v / c", y: "u / c" });
  f.dash(ox, Y(1), ox + W, Y(1), { c: C.soft });
  f.note(ox - 6, Y(1) + 4, "1", { size: 10, anchor: "end" }); f.note(ox - 6, Y(0.5) + 4, "0.5", { size: 10, anchor: "end" }); f.note(ox - 6, Y(1.5) + 4, "1.5", { size: 10, anchor: "end" });
  f.note(X(1), oy + 14, "1", { size: 10, anchor: "middle" }); f.note(X(0.5), oy + 14, "0.5", { size: 10, anchor: "middle" });
  let g = "", r = "";
  for (let i = 0; i <= 50; i++) { const x = i / 50; g += (i ? "L" : "M") + X(x) + " " + Y(0.5 + x); r += (i ? "L" : "M") + X(x) + " " + Y(addVel(0.5 * C_LIGHT, x * C_LIGHT) / C_LIGHT); }
  f.path(g, { c: C.flat, w: 1.8, dash: "5 3" }); f.path(r, { c: C.globe, w: 2.2 });
  f.note(X(0.62), Y(1.2) - 6, "u′ + v", { size: 10.5, c: C.flat, anchor: "end" });
  f.note(X(0.62), Y(0.93) + 16, tr("va-1", "Einstein"), { size: 10.5, c: C.globe });
  f.note(X(0.02), Y(1) - 6, "c", { size: 10.5, c: C.soft });
  axesStamp(f, tr, "u′ = 0.5 c");
  return f;
}

function figGps(tr, v) {
  const g = gpsDrift();
  const f = FIG.make({ w: 380, h: 210, alt: tr("gp-alt", "Bar chart of the daily drift of a GPS satellite clock: minus 7 microseconds from its speed, plus 46 from the weaker gravity, plus 38.5 in all") });
  const y0 = 138, s = 2.2, bw = 56, xs = [70, 170, 270];
  f.line(30, y0, 360, y0, { c: C.faint, w: 1.2 });
  const bars = [[g.vel, C.flat, tr("gp-v", "speed"), "−" + (v.gpsVel ?? "")], [g.grav, C.globe, tr("gp-g", "gravity"), "+" + (v.gpsGrav ?? "")], [g.net, C.ink, tr("gp-n", "net"), "+" + (v.gpsNet ?? "")]];
  bars.forEach(([val, c, lab, txt], i) => {
    const x = xs[i], hpx = val * s;
    f.path(`M${x} ${y0}V${y0 - hpx}H${x + bw}V${y0}Z`, { c, w: 1.2, fill: c === C.ink ? "#d9dce1" : c === C.globe ? "#dbe4fb" : "#f6e3cc" });
    f.note(x + bw / 2, val > 0 ? y0 - hpx - 6 : y0 - hpx + 15, txt, { size: 11, c, anchor: "middle" });
    f.note(x + bw / 2, val > 0 ? y0 + 16 : y0 - hpx + 30, lab, { size: 10.5, anchor: "middle" });
  });
  foot(f, tr("gp-1", "µs per day gained by a GPS clock (circular orbit, 26,560 km)"));
  axesStamp(f, tr, tr("gp-st", "µs/day"));
  return f;
}

function figSagnac(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("sg-alt", "A loop of light on a turning platform: two beams leave together in opposite directions; the one going with the rotation has further to go to reach the moving starting point and arrives later. Inset: the Michelson–Gale rectangle") });
  const cx = 110, cy = 112, R = 72;
  f.circle(cx, cy, R, { c: C.faint, w: 6 });
  f.path(`M${cx + R * Math.cos(-1.3)} ${cy - R * Math.sin(-1.3)}A${R} ${R} 0 1 0 ${cx + R * Math.cos(-1.9)} ${cy - R * Math.sin(-1.9)}`, { c: C.flat, w: 1.8 });
  f.arrow(cx + R * Math.cos(-1.95), cy - R * Math.sin(-1.95), cx + R * Math.cos(-1.9), cy - R * Math.sin(-1.9), { c: C.flat, w: 1.8 });
  const r2 = R - 9;
  f.path(`M${cx + r2 * Math.cos(-1.8)} ${cy - r2 * Math.sin(-1.8)}A${r2} ${r2} 0 1 1 ${cx + r2 * Math.cos(-1.4)} ${cy - r2 * Math.sin(-1.4)}`, { c: C.globe, w: 1.8 });
  f.arrow(cx + r2 * Math.cos(-1.45), cy - r2 * Math.sin(-1.45), cx + r2 * Math.cos(-1.4), cy - r2 * Math.sin(-1.4), { c: C.globe, w: 1.8 });
  f.dot(cx + R * Math.cos(-Math.PI / 2), cy + R, { r: 4 });
  f.angle(cx, cy, 22, 200, 340, { c: C.ink });
  f.arrow(cx + 22 * Math.cos(340 * Math.PI / 180) - 2, cy - 22 * Math.sin(340 * Math.PI / 180) - 3, cx + 22 * Math.cos(340 * Math.PI / 180), cy - 22 * Math.sin(340 * Math.PI / 180), { c: C.ink, w: 1.4, head: 5 });
  f.note(cx, cy + 4, "Ω", { size: 12, anchor: "middle" });
  f.note(cx, cy + R + 18, tr("sg-src", "split and recombined here"), { size: 10, anchor: "middle" });
  // l'encart : le rectangle de Michelson et Gale, à ses proportions
  const rx = 228, ry = 60, rw = 130, rh = 130 * 1113 / 2010;
  f.path(`M${rx} ${ry}H${rx + rw}V${ry + rh}H${rx}Z`, { c: C.globe, w: 2 });
  f.note(rx + rw / 2, ry - 8, "2010 × 1113 ft", { size: 10, anchor: "middle" });
  f.note(rx, ry + rh + 18, tr("sg-1", "1925: 0.236 predicted"), { size: 10.5, c: C.globe });
  f.note(rx, ry + rh + 34, tr("sg-2", "0.230 ± 0.005 measured"), { size: 10.5 });
  foot(f, tr("sg-3", "amber goes with the turn and arrives later than blue"));
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

function figBounds(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("bd-alt", "Logarithmic chart of the upper limits on an aether wind from 1881 to 2015: from one part in a hundred million to one part in a billion billion; the expected effect of a 30 km/s wind is a dashed line at ten to the minus eight") });
  const ox = 60, oy = 206, W = 290, Hh = 176, y0 = 1880, y1 = 2020, e0 = -19, e1 = -7;
  const X = (y) => ox + (y - y0) / (y1 - y0) * W, Y = (v) => oy - (Math.log10(v) - e0) / (e1 - e0) * Hh;
  f.axes(ox, oy, W + 12, Hh + 12, {});
  for (let e = e0; e <= e1; e += 2) { f.line(ox - 4, Y(10 ** e), ox, Y(10 ** e), { c: C.faint, w: 1 }); f.note(ox - 6, Y(10 ** e) + 4, `10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`, { size: 10, anchor: "end" }); }
  for (const y of [1900, 1950, 2000]) f.note(X(y), oy + 14, String(y), { size: 10, anchor: "middle" });
  f.dash(ox, Y(1e-8), ox + W, Y(1e-8), { c: C.flat, w: 1.6 });
  f.note(ox + W, Y(1e-8) - 6, tr("bd-wind", "a 30 km/s wind"), { size: 10, c: C.flat, anchor: "end" });
  for (const b of BOUNDS) {
    const x = X(b.year), y = Y(b.v);
    f.line(x, y, x, y + 12, { c: C.globe, w: 1.4 }); f.dot(x, y, { r: 4, c: C.globe });
    const right = b.year < 1950, dy = b.year === 1881 ? 18 : 4;
    f.note(x + (right ? 8 : -8), y + dy, `${b.who} ${b.year}`, { size: 9.5, anchor: right ? "start" : "end", c: C.ink });
  }
  axesStamp(f, tr, tr("bd-st", "log scale"));
  return f;
}

function figEarth(tr, v) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("ea-alt", "Two identical circles: the Earth in its own frame, and the Earth described from the Sun's frame, 6.3 centimetres shorter along its motion, a difference far smaller than a pixel") });
  const R = 62;
  f.circle(95, 96, R, { c: C.globe, w: 2 }); f.circle(285, 96, R, { c: C.globe, w: 2 });
  f.arrow(300, 96, 360, 96, { c: C.flat, w: 1.6 }); f.note(362, 88, "v", { size: 11, c: C.flat });
  f.note(95, 176, tr("ea-1", "its own frame"), { size: 10.5, anchor: "middle" });
  f.note(285, 176, tr("ea-2", "from the Sun's frame"), { size: 10.5, anchor: "middle" });
  foot(f, `${tr("ea-3", "shorter along the motion by")} ${v.earthCm ?? "6.3"} cm: ${tr("ea-4", "less than a millionth of a pixel here")}`);
  f.stamped = true;
  f.note(f.w - 4, 12, tr("ea-st", "true scale"), { anchor: "end", c: C.soft, size: 10 });
  return f;
}

export const FORMULA_FIGS = {
  aetherFigTimeline: figTimeline, aetherFxMaxwell: figMaxwell, aetherFxAberr: figAberr, aetherFxDrag: figDrag, aetherFxAiry: figAiry,
  aetherFxMM: figMM, aetherFxContract: figContract, aetherFxLightClock: figLightClock, aetherFxVadd: figVadd, aetherFxGps: figGps,
  aetherFxSagnac: figSagnac, aetherFigBounds: figBounds, aetherFxEarth: figEarth,
};
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "aether"); }
