// Figures de l'onglet scale (epic28, 2026-10-17) : un schéma par formule, et l'échelle des distances en log.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { RUNGS, AU_KM, RUNG_NAMES } from "./logic.js";

const C = FIG.C;

function figClock(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-clock-alt", "A clock hand turning about its centre. At the reference time it points at the angle theta zero; after a time t minus t zero it has turned by 360 degrees times that time divided by its period") });
  const cx = 120, cy = 108, R = 80, a0 = 20, a1 = 95;
  f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  const P = (a, r = R) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  f.dash(cx, cy, ...P(a0), { c: C.soft });
  f.arrow(cx, cy, ...P(a1, R * 0.92), { c: C.globe, w: 2.4 });
  f.angle(cx, cy, 36, a0, a1, { c: C.ink }); f.note(cx + 24, cy - 48, "360° (t − t₀)/T", { size: 10.5 });
  f.note(P(a0)[0] + 6, P(a0)[1] + 4, "θ₀ (J2000)", { size: 10 });
  f.note(P(a1)[0] - 4, P(a1)[1] - 8, "θ(t)", { size: 10.5, c: C.globe, anchor: "middle" });
  f.note(236, 140, tr("fx-clock-1", "one turn in T"), { size: 10.5 });
  f.note(236, 160, tr("fx-clock-2", "t: your computer's clock"), { size: 10.5 });
  f.note(236, 180, tr("fx-clock-3", "nothing else in the code"), { size: 10.5, c: C.globe });
  f.note(8, 204, tr("fx-clock-4", "each hand is a straight line in time"), { size: 9.5 });
  stamp(f, tr, tr("fx-clock-st", "schematic"));
  return f;
}
function figSpeed(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-speed-alt", "A body going round a circle of radius r once in a time T covers the circumference two pi r, so its speed is two pi r over T, which is the angular speed omega times r") });
  const cx = 120, cy = 108, R = 76;
  f.circle(cx, cy, R, { c: C.sea, w: 1.4, dash: "4 3" }); f.dot(cx, cy, { r: 3 });
  f.line(cx, cy, cx + R * Math.cos(0.6), cy - R * Math.sin(0.6), { c: C.soft, w: 1 }); f.note(cx + R * 0.45, cy - R * 0.36, "r", { size: 11 });
  const P = [cx + R * Math.cos(0.6), cy - R * Math.sin(0.6)];
  f.dot(P[0], P[1], { r: 4.5, c: C.globe }); f.arrow(P[0], P[1], P[0] - 40 * Math.sin(0.6), P[1] - 40 * Math.cos(0.6), { c: C.globe }); f.note(P[0] - 40 * Math.sin(0.6) - 4, P[1] - 40 * Math.cos(0.6) - 4, "v", { size: 12, anchor: "end" });
  f.note(240, 64, tr("fx-speed-1", "equator: 0.465 km/s"), { size: 10.5 });
  f.note(240, 84, tr("fx-speed-2", "orbit: 29.8 km/s"), { size: 10.5 });
  f.note(240, 104, tr("fx-speed-3", "Galaxy: ~250 km/s"), { size: 10.5 });
  f.note(8, 204, tr("fx-speed-4", "a circle of 2πr in a time T: v = 2πr/T"), { size: 9.5 });
  stamp(f, tr, tr("fx-speed-st", "schematic"));
  return f;
}
// L'échelle des distances, axe logarithmique en km.
function figLadder(tr, v = {}) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-ladder-alt", "Distances on a logarithmic axis from a thousand kilometres to ten to the nineteenth: the Earth's radius, the Moon, the Sun, Neptune, Proxima Centauri, the Galactic centre and Andromeda; and, in orange, where the flat models put the Sun, a few thousand kilometres up") });
  const X0 = 20, X1 = 362, lo = 3, hi = 20, y = 150, x = (km) => X0 + (Math.log10(km) - lo) / (hi - lo) * (X1 - X0);
  f.line(X0, y, X1, y, { c: C.ink, w: 1.4 });
  for (let e = lo; e <= hi; e++) { f.line(x(10 ** e), y - (e % 5 ? 3 : 6), x(10 ** e), y + (e % 5 ? 3 : 6), { c: C.soft, w: 1 }); if (e % 3 === 0) f.note(x(10 ** e), y + 18, `10${String(e).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]).join("")}`, { size: 9.5, anchor: "middle" }); }
  f.note(X1, y + 32, tr("fx-ladder-km", "km"), { size: 9.5, anchor: "end" });
  RUNGS.forEach((r, i) => {
    const px = x(r.km), ly = y - { earth: 26, moon: 56, sun: 26, neptune: 56, proxima: 86, gc: 26, m31: 56 }[r.id];
    f.dot(px, y, { r: 3.5, c: C.globe });
    f.line(px, y - 4, px, ly + 4, { c: C.globe, w: 0.8 });
    f.note(px + (px < 60 ? -4 : px > 330 ? 4 : 0), ly, tr(`z-${r.id}`, RUNG_NAMES[r.id]), { size: 9.5, anchor: px < 60 ? "start" : px > 330 ? "end" : "middle", c: C.globe });
  });
  const hf = v.hFlatKm || 9666;
  f.dot(x(hf), y, { r: 3.5, c: C.flat }); f.line(x(hf), y + 4, x(hf), y + 46, { c: C.flat, w: 0.8 });
  f.note(x(hf) + 4, y + 56, tr("fx-ladder-flat", "the flat models' Sun"), { size: 9.5, c: C.flat });
  f.note(8, 234, tr("fx-ladder-1", "each tick ten times the one before"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-ladder-st", "logarithmic"));
  return f;
}
function figPar(tr) {
  const f = FIG.make({ w: 380, h: 190, alt: tr("fx-par-alt", "The Earth at two opposite points of its orbit, two astronomical units apart, sees a near star against different background stars; the half-angle p at the star gives its distance d equal to one astronomical unit over tan p") });
  f.line(40, 50, 40, 150, { c: C.sea, w: 1.4 }); f.circle(40, 100, 7, { c: C.flat, w: 2, fill: C.wash });
  f.dot(40, 50, { r: 4, c: C.globe }); f.dot(40, 150, { r: 4, c: C.globe });
  f.line(40, 50, 330, 100, { c: C.ink, w: 1 }); f.line(40, 150, 330, 100, { c: C.ink, w: 1 }); f.line(40, 100, 330, 100, { c: C.faint, w: 1, dash: "4 3" });
  f.dot(330, 100, { r: 4 }); f.note(336, 104, "★", { size: 12 });
  f.angleAt(330, 100, 50, [40, 100], [40, 50], { label: "p", c: C.ink, pad: 10 });
  f.seg(22, 50, 22, 100, { label: "1 AU", c: C.soft, side: -14 });
  f.note(180, 116, "d", { size: 11 });
  f.note(8, 184, tr("fx-par-1", "d = 1 AU / tan p · p = 1″ ⇒ d = 1 parsec"), { size: 9.5 });
  stamp(f, tr, tr("fx-par-st", "p enlarged ~10⁵×"));
  return f;
}
function figLt(tr, v) {
  const f = FIG.make({ w: 380, h: 170, alt: tr("fx-lt-alt", "A laser pulse leaves a telescope on the Earth, bounces off a reflector on the Moon and comes back; the round trip time times the speed of light is twice the distance") });
  f.circle(50, 90, 26, { c: C.globe, w: 1.6, fill: C.coolwash }); f.circle(330, 90, 9, { c: C.soft, w: 1.4, fill: "#eee" });
  f.arrow(78, 82, 318, 82, { c: C.flat, w: 1.6 }); f.arrow(318, 98, 78, 98, { c: C.flat, w: 1.6, dash: "4 3" });
  f.note(198, 74, tr("fx-lt-1", "out"), { size: 10, anchor: "middle" }); f.note(198, 116, tr("fx-lt-2", "back"), { size: 10, anchor: "middle" });
  f.note(50, 136, tr("z-earth", "Earth"), { size: 10, anchor: "middle" }); f.note(330, 120, tr("z-moon", "Moon"), { size: 10, anchor: "middle" });
  f.note(8, 164, `${tr("fx-lt-3", "round trip")} ${v.ltMoon2} s · d = c t / 2`, { size: 9.5 });
  stamp(f, tr, tr("fx-lt-st", "Earth–Moon distance shortened"));
  return f;
}

export const FORMULA_FIGS = { scaleFxClock: figClock, scaleFxSpeed: figSpeed, scaleFigLadder: figLadder, scaleFxPar: figPar, scaleFxLt: figLt };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "scale"); }
