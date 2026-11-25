// Figures de l'onglet atmo (epic29, 2026-10-17) : un schéma par formule, et le profil de la table 1976.
import { FIG, polar } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { USSA1976 } from "../../data/presets/atmo-ussa.js";

const C = FIG.C;
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

function figHydro(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-hydro-alt", "A thin slab of air of thickness dh. The pressure below it pushes up a little more than the pressure above it pushes down; the difference holds up the slab's weight, rho g dh") });
  f.line(30, 180, 350, 180, { c: C.ground, w: 2.4 });
  f.path("M110 70 L270 70 L270 110 L110 110 Z", { c: C.globe, w: 1.4, fill: C.coolwash });
  f.arrow(190, 150, 190, 114, { c: C.globe, w: 2 }); f.note(198, 140, "p", { size: 11, c: C.globe });
  f.arrow(190, 30, 190, 66, { c: C.globe, w: 1.6 }); f.note(198, 44, "p + dp", { size: 11, c: C.globe });
  f.arrow(240, 90, 240, 128, { c: C.flat, w: 1.6 }); f.note(248, 126, "ρ g dh", { size: 11, c: C.flat });
  f.seg(96, 70, 96, 110, { label: "dh", c: C.soft, side: -12 });
  f.note(8, 204, tr("fx-hydro-1", "each layer holds up the weight of the air above: dp = −ρ g dh"), { size: 9.5 });
  stamp(f, tr, tr("fx-hydro-st", "schematic"));
  return f;
}
function figProfile(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-prof-alt", "Pressure and temperature of the 1976 standard atmosphere against altitude up to 500 kilometres: the pressure falls smoothly over about twelve powers of ten; the temperature falls, rises, falls and then climbs to about 1,000 kelvins") });
  const Y0 = 216, Y1 = 40, zMax = 500, y = (z) => Y0 - (z / zMax) * (Y0 - Y1), X0 = 44, X1 = 200, lp0 = -7, lp1 = 5.2, xp = (p) => X0 + (Math.log10(p) - lp0) / (lp1 - lp0) * (X1 - X0);
  const T0 = 150, T1 = 1100, XT0 = 220, XT1 = 366, xt = (T) => XT0 + (T - T0) / (T1 - T0) * (XT1 - XT0);
  for (const z of [0, 100, 200, 300, 400, 500]) { f.dash(X0, y(z), XT1, y(z), { c: "#e7e3da" }); f.note(X0 - 4, y(z) + 4, `${z}`, { anchor: "end", size: 9 }); }
  const rows = USSA1976.filter((r) => r[0] <= zMax);
  f.path(poly(rows.map((r) => [xp(r[2]), y(r[0])])), { c: C.globe, w: 1.8 });
  f.path(poly(rows.map((r) => [xt(r[1]), y(r[0])])), { c: C.flat, w: 1.8 });
  for (const e of [-6, -3, 0, 3]) f.note(xp(10 ** e), Y0 + 13, `10${String(e).replace("-", "⁻").split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || c).join("")}`, { anchor: "middle", size: 9 });
  for (const T of [200, 600, 1000]) f.note(xt(T), Y0 + 13, `${T}`, { anchor: "middle", size: 9 });
  f.note(X0, Y1 - 6, tr("fx-prof-p", "pressure (Pa)"), { size: 9.5, c: C.globe });
  f.note(XT0, Y1 - 6, tr("fx-prof-T", "temperature (K)"), { size: 9.5, c: C.flat });
  for (const [z, lab] of [[6, tr("fx-prof-tro", "troposphere")], [35, tr("fx-prof-str", "stratosphere")], [70, tr("fx-prof-mes", "mesosphere")], [250, tr("fx-prof-the", "thermosphere")]]) f.note(XT1, y(z) - 2, lab, { anchor: "end", size: 8.5, c: C.soft });
  f.note(4, 244, tr("fx-prof-1", "altitude (km) · U.S. Standard Atmosphere 1976"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-prof-st", "pressure logarithmic"));
  return f;
}
function figPlasma(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-plasma-alt", "A radio wave rising into an electron layer. Sent steeply, it meets the layer nearly head on and goes through; sent low, it meets the layer at a grazing angle phi and is turned back down, as long as its frequency is below the critical frequency divided by the cosine of phi") });
  f.path("M10 50 L370 50 L370 80 L10 80 Z", { c: "#6d28d9", w: 0.8, fill: "#efe8fb" }); f.note(366, 46, tr("fx-plasma-1", "electron layer"), { anchor: "end", size: 9.5, c: "#6d28d9" });
  f.line(10, 180, 370, 180, { c: C.ground, w: 2.4 });
  f.line(60, 180, 140, 60, { c: C.globe, w: 1.6 }); f.line(140, 60, 220, 180, { c: C.globe, w: 1.6 }); f.note(228, 176, tr("fx-plasma-2", "low: comes back"), { size: 9.5, c: C.globe });
  f.line(140, 60, 140, 140, { c: C.faint, w: 1, dash: "3 3" }); f.angleAt(140, 60, 26, [140, 140], [60, 180], { label: "φ", c: C.ink, pad: 10 });
  f.arrow(300, 180, 314, 40, { c: C.flat, w: 1.6 }); f.note(312, 112, tr("fx-plasma-3", "steep: through"), { size: 9.5, c: C.flat, anchor: "end" });
  f.note(8, 196, "f ≤ f_oF2 / cos φ", { size: 9.5 });
  stamp(f, tr, tr("fx-plasma-st", "schematic"));
  return f;
}
function figHop(tr, v) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-hop-alt", "The longest single hop leaves the ground grazing, rises to the layer at height h and comes down grazing; on a round Earth its length is two R times the arccosine of R over R plus h") });
  const cx = 190, cy = 560, R = 480, h = 60, a = Math.acos(R / (R + h));
  f.path(`M${cx - 200} ${(cy - Math.sqrt(R * R - 200 * 200)).toFixed(1)}A${R} ${R} 0 0 1 ${cx + 200} ${(cy - Math.sqrt(R * R - 200 * 200)).toFixed(1)}`, { c: C.ground, w: 2.4 });
  f.path(`M${cx - 200} ${(cy - Math.sqrt((R + h) ** 2 - 200 * 200)).toFixed(1)}A${R + h} ${R + h} 0 0 1 ${cx + 200} ${(cy - Math.sqrt((R + h) ** 2 - 200 * 200)).toFixed(1)}`, { c: "#6d28d9", w: 1.2, dash: "4 3" });
  const A = [cx - R * Math.sin(a), cy - R * Math.cos(a)], B = [cx + R * Math.sin(a), cy - R * Math.cos(a)], T = [cx, cy - R - h];
  f.line(A[0], A[1], T[0], T[1], { c: C.globe, w: 1.6 }); f.line(T[0], T[1], B[0], B[1], { c: C.globe, w: 1.6 });
  f.dot(A[0], A[1], { r: 3.5 }); f.dot(B[0], B[1], { r: 3.5 });
  f.seg(cx + 6, cy - R, cx + 6, cy - R - h, { label: "h", c: C.soft, side: 10 });
  f.note(cx, cy - R + 18, `d_max = ${v.dmax} km`, { size: 10.5, anchor: "middle" });
  f.note(8, 194, tr("fx-hop-1", "grazing out, grazing back: the ground's curve limits one hop"), { size: 9.5 });
  stamp(f, tr, tr("fx-hop-st", "layer height ×4"));
  return f;
}
function figHeat(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-heat-alt", "Molecules of a hot gas striking a cooler wall. Each brings two k T of energy on average and leaves with the wall's temperature; the heat received is the number of impacts per second times that difference") });
  f.path("M300 20 L320 20 L320 170 L300 170 Z", { c: C.soft, w: 1.2, fill: "#e5e7eb" }); f.note(310, 186, tr("fx-heat-1", "wall, T_wall"), { anchor: "middle", size: 9.5 });
  for (const [x, y] of [[80, 50], [150, 90], [60, 130], [200, 40], [230, 140]]) { f.dot(x, y, { r: 4, c: C.flat }); f.arrow(x + 6, y, x + 46, y, { c: C.flat, w: 1.2 }); }
  f.note(40, 175, tr("fx-heat-2", "n molecules per m³, mean speed v̄, temperature T_gas"), { size: 9.5 });
  f.note(8, 196, "q = (n v̄ / 4) · 2k (T_gas − T_wall)", { size: 9.5 });
  stamp(f, tr, tr("fx-heat-st", "schematic"));
  return f;
}
function figBal(tr, v) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-bal-alt", "A ball in sunlight catches light on its cross-section, pi r squared, and radiates heat from its whole surface, four pi r squared; its temperature settles where the two balance") });
  f.circle(230, 100, 46, { c: C.ink, w: 1.6, fill: "#e5e7eb" });
  for (const y of [64, 84, 104, 124, 136]) f.arrow(40, y, 176, y, { c: "#ca8a04", w: 1.4 });
  f.note(40, 54, `${tr("fx-bal-1", "sunlight")} S = 1,361 W/m²`, { size: 9.5, c: "#ca8a04" });
  for (let k = 0; k < 8; k++) { const a = (k / 8) * 2 * Math.PI, r0 = 52, r1 = 70; f.arrow(230 + r0 * Math.cos(a), 100 + r0 * Math.sin(a), 230 + r1 * Math.cos(a), 100 + r1 * Math.sin(a), { c: C.flat, w: 1 }); }
  f.note(290, 40, "σT⁴", { size: 11, c: C.flat });
  f.note(8, 194, `${tr("fx-bal-2", "absorbed on πr², radiated from 4πr²: T =")} ${v.Teq} K`, { size: 9.5 });
  stamp(f, tr, tr("fx-bal-st", "schematic"));
  return f;
}

function figRad(tr, v) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-rad-alt", "The chain from radiation to temperature: absorbed sunlight adds energy, the stored energy divided by the heat capacity is the temperature, and the temperature sets the radiation sent back out, which takes energy away; the loop settles where what comes in equals what goes out") });
  const box = (x, y, w, h, fill) => f.path(`M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`, { c: C.soft, w: 1.2, fill });
  box(10, 40, 100, 50, "#fef3c7"); f.note(60, 60, tr("fx-rad-1", "radiation in"), { anchor: "middle", size: 9.5 }); f.note(60, 78, "P_in = α S A", { anchor: "middle", size: 9.5, c: "#ca8a04" });
  box(140, 40, 100, 50, "#e5e7eb"); f.note(190, 60, tr("fx-rad-2", "energy stored"), { anchor: "middle", size: 9.5 }); f.note(190, 78, "ΔE = C ΔT", { anchor: "middle", size: 9.5 });
  box(270, 40, 100, 50, "#fee2e2"); f.note(320, 60, tr("fx-rad-3", "temperature"), { anchor: "middle", size: 9.5 }); f.note(320, 78, "ΔT = ΔE / C", { anchor: "middle", size: 9.5 });
  f.arrow(112, 65, 138, 65, { c: "#ca8a04", w: 1.6 }); f.arrow(242, 65, 268, 65, { c: C.ink, w: 1.4 });
  f.path("M320 92 L320 130 L190 130 L190 94", { c: C.flat, w: 1.6 }); f.arrow(190, 100, 190, 94, { c: C.flat, w: 1.6 }); f.note(125, 58, "+", { anchor: "middle", size: 12, c: "#ca8a04" }); f.note(200, 112, "−", { size: 12, c: C.flat });
  f.note(255, 146, `${tr("fx-rad-4", "radiation out")} P_out = 2 ε σ A T⁴`, { anchor: "middle", size: 9.5, c: C.flat });
  f.note(8, 178, `C = ${tr("fx-rad-5", "mass × specific heat")} = ${v.radC} J/K`, { size: 9.5 });
  f.note(8, 198, `${tr("fx-rad-6", "balance when P_in = P_out:")} T = ${v.radEq} K`, { size: 9.5 });
  stamp(f, tr, tr("fx-rad-st", "schematic"));
  return f;
}
// Hunga Tonga et Krakatoa (venus de seis le 2026-10-19, propriétaire : « les déplacer dans atmosphère »)
function figTonga(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-tg-alt", "Left, a sphere: from the volcano V the pressure wave reaches the station S the short way, over the angle θ, after t₁, and the long way, over 2π − θ, after t₂; the two paths add up to one full circumference, so t₁ + t₂ = 2πR/v wherever S is. Right, a plane: the wave is a circle that grows from V and crosses S once; nothing comes back from the other side") });
  const cx = 96, cy = 112, r = 74, aV = 160, aS = 50;
  f.circle(cx, cy, r, { c: C.sea, w: 1.4, fill: "#eef6f4" });
  const V = polar(cx, cy, r, aV), S = polar(cx, cy, r, aS);
  f.line(cx, cy, ...V, { c: C.faint, w: 1 }); f.line(cx, cy, ...S, { c: C.faint, w: 1 });
  f.angle(cx, cy, 20, aS, aV, { label: "θ", tex: "\\theta", c: C.globe, pad: 9 });
  f.path(`M${V.join(" ")}A${r} ${r} 0 0 1 ${S.join(" ")}`, { c: C.globe, w: 3 });
  f.path(`M${V.join(" ")}A${r} ${r} 0 1 0 ${S.join(" ")}`, { c: C.globe, w: 2, dash: "6 4" });
  f.dot(...V, { r: 4.5, c: C.ink }); f.dot(...S, { r: 4, c: C.globe });
  f.txt(V[0] - 16, V[1] + 4, "V", { c: C.ink }); f.txt(S[0] + 7, S[1] - 2, "S", { c: C.globe });
  const m1 = polar(cx, cy, r + 14, 105), m2 = polar(cx, cy, r + 16, 285);
  f.txt(m1[0], m1[1], "t₁", { tex: "t_1", c: C.globe, anchor: "middle" });
  f.txt(m2[0], m2[1] + 6, "t₂", { tex: "t_2", c: C.globe, anchor: "middle" });
  f.note(cx, 214, tr("fx-tg-1", "sphere: twice, by both ways"), { size: 9.5, anchor: "middle", c: C.globe });
  // le plan
  const dx = 286, dy = 112, dr = 74, Vx = 268, Vy = 124, Sx = 304, Sy = 96; // le plus grand cercle reste dans le disque
  f.circle(dx, dy, dr, { c: C.flat, w: 1.4, fill: C.wash });
  const ds = Math.hypot(Sx - Vx, Sy - Vy);
  for (const k of [1 / 3, 2 / 3, 1]) f.circle(Vx, Vy, ds * k, { c: C.flat, w: 1.2, dash: "4 3" });
  f.dot(Vx, Vy, { r: 4.5, c: C.ink }); f.dot(Sx, Sy, { r: 4, c: C.flat });
  f.txt(Vx - 16, Vy + 4, "V", { c: C.ink }); f.txt(Sx + 7, Sy - 4, "S", { c: C.flat });
  f.txt(Sx + 7, Sy + 12, "t₁", { tex: "t_1", c: C.flat });
  f.note(dx, 214, tr("fx-tg-2", "plane: once, then nothing"), { size: 9.5, anchor: "middle", c: C.flat });
  f.txt(190, 238, "t₁ + t₂ = 2πR / v", { tex: "t_1 + t_2 = \\dfrac{2\\pi R}{v}", c: C.globe, anchor: "middle", size: 12 });
  stamp(f, tr, tr("fx-tg-s", "schematic"));
  return f;
}

/** L = √(d² + 4h²) : le rebond sur un plafond vu dans un miroir ; le trajet croît avec d quelle que soit h. */
function figDome(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-dm-alt", "A flat ground with the volcano V and a station S a distance d apart, under a flat vault at height h. The pulse goes up, bounces off the vault and comes down to S. Seen in a mirror, the bounce is a straight line from V', the image of V at 2h above the ground, to S, so its length is L = √(d² + 4h²), longer the farther S is, whatever h") });
  const g = 170, hc = 112, Vx = 70, Sx = 310, Ix = Vx, Iy = g - 2 * (g - hc);
  const Wx = Vx + ((g - hc) / (g - Iy)) * (Sx - Vx);
  f.ground(g, 20, 360);
  f.line(20, hc, 360, hc, { c: C.flat, w: 1.4, dash: "6 4" });
  f.note(356, hc - 6, tr("fx-dm-1", "dome (vault)"), { anchor: "end", size: 9.5, c: C.flat });
  f.line(Ix, Iy, Wx, hc, { c: C.faint, w: 1.1, dash: "3 3" });
  f.line(Vx, g, Wx, hc, { c: C.flat, w: 2.2 }); f.line(Wx, hc, Sx, g, { c: C.flat, w: 2.2 });
  f.dot(Vx, g, { r: 4.5, c: C.ink }); f.dot(Sx, g, { r: 4, c: C.flat }); f.dot(Ix, Iy, { r: 3, c: C.faint });
  f.txt(Vx - 4, g + 16, "V", { c: C.ink, anchor: "middle" }); f.txt(Sx, g + 16, "S", { c: C.flat, anchor: "middle" });
  f.txt(Ix - 12, Iy + 4, "V′", { c: C.soft, anchor: "end" });
  f.seg(40, g, 40, hc, { label: "h", tex: "h", c: C.soft, side: -10 });
  f.seg(Vx, g + 26, Sx, g + 26, { label: "d", tex: "d", c: C.soft, side: 10 });
  f.txt((Wx + Sx) / 2 + 14, (hc + g) / 2 - 2, "L", { tex: "L", c: C.flat });
  f.note(Vx + 8, Iy + 4, tr("fx-dm-2", "image of V, 2h up"), { size: 9.5 });
  stamp(f, tr, tr("fx-dm-s", "schematic"));
  return f;
}

/** R = v·[(III − I) + (IV − II)] / 4π : deux heures d'une même horloge, un tour dans chaque sens ; frise réelle de Glasgow. */
function figKrak(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-kr-alt", "Left, a sphere with Krakatoa K and a barograph S. The wave passes S on its way out (I), runs on round the whole Earth and passes S again (III): III − I is one full lap, whatever the position of S. The wave coming back from the antipodes does the same the other way (II, then IV). Right, the seven passages actually read on the Glasgow barograph in 1883, on a time axis: the two laps, 36 h 36 min and 34 h 41 min, are bracketed") });
  const cx = 82, cy = 108, r = 62, aK = 200, aS = 60;
  f.circle(cx, cy, r, { c: C.sea, w: 1.4, fill: "#eef6f4" });
  const K = polar(cx, cy, r, aK), S = polar(cx, cy, r, aS);
  // un tour complet dans chaque sens, en partant de S
  f.circle(cx, cy, r + 9, { c: C.globe, w: 1.8, dash: "6 3" });
  f.circle(cx, cy, r - 9, { c: C.sea, w: 1.4, dash: "3 3" });
  f.dot(...K, { r: 4.5, c: C.ink }); f.dot(...S, { r: 4, c: C.globe });
  f.txt(K[0] - 15, K[1] + 4, "K", { c: C.ink }); f.txt(S[0] + 8, S[1] - 4, "S", { c: C.globe });
  f.note(cx, cy + r + 26, tr("fx-kr-1", "outer: III − I · inner: IV − II"), { size: 9.5, anchor: "middle", c: C.globe });
  f.note(cx, cy + r + 39, tr("fx-kr-2", "each one full lap, 2πR / v"), { size: 9.5, anchor: "middle", c: C.globe });
  // la frise de Glasgow, à l'échelle de son axe (heures GMT après 0 h le 27 août 1883)
  const T = [14 + 2 / 60, 27.75, 50 + 38 / 60, 62 + 26 / 60, 87.25, 97 + 8 / 60, 124 + 20 / 60], N = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const x0 = 186, x1 = 370, y = 120, X = (h) => x0 + (h / 130) * (x1 - x0);
  f.line(x0, y, x1, y, { c: C.ink, w: 1 });
  for (let h = 0; h <= 120; h += 40) { f.line(X(h), y, X(h), y + 4, { c: C.faint, w: 1 }); f.note(X(h), y + 15, `${h} h`, { anchor: "middle", size: 9 }); }
  T.forEach((h, i) => { const up = i % 2 === 0; f.line(X(h), y - 6, X(h), y + 6, { c: up ? C.globe : C.sea, w: 2 }); f.note(X(h), up ? y - 10 : y + 27, N[i], { anchor: "middle", size: 9, c: up ? C.globe : C.sea }); });
  const br = (a, b, yy, c, lab) => { f.line(X(T[a]), yy, X(T[b]), yy, { c, w: 1.2 }); f.line(X(T[a]), yy - 3, X(T[a]), yy + 3, { c, w: 1.2 }); f.line(X(T[b]), yy - 3, X(T[b]), yy + 3, { c, w: 1.2 }); f.note((X(T[a]) + X(T[b])) / 2, yy - 5, lab, { anchor: "middle", size: 9, c }); };
  br(0, 2, y - 30, C.globe, "36 h 36");
  br(1, 3, y + 44, C.sea, "34 h 41");
  f.note((x0 + x1) / 2, 62, tr("fx-kr-3", "Glasgow barograph, 1883"), { anchor: "middle", size: 9.5 });
  f.txt(190, 238, "R = v [(III − I) + (IV − II)] / 4π", { tex: "R = \\dfrac{v\\,[(t_{\\text{III}} - t_{\\text{I}}) + (t_{\\text{IV}} - t_{\\text{II}})]}{4\\pi}", c: C.globe, anchor: "middle", size: 12 });
  stamp(f, tr, tr("fx-kr-s", "sphere schematic; time axis to scale"));
  return f;
}

/** Le cercle qui grandit autour d'un centre inconnu : chaque station donne une heure et une position (des angles) ; la courbe t(distance) est libre. */
export const FORMULA_FIGS = { atmoFxHydro: figHydro, atmoFigProfile: figProfile, atmoFxPlasma: figPlasma, atmoFxHop: figHop, atmoFxHeat: figHeat, atmoFxBal: figBal, atmoFxRad: figRad, seisFxTonga: figTonga, seisFxDome: figDome, seisFxKrak: figKrak };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "atmo"); }
