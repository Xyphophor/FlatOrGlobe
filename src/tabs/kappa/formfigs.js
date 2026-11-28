// Figures de l'onglet kappa (2026-11-27) : une figure fixe par formule (règle du propriétaire). Schémas : tampon « not to
// scale » ; la figure de l'ajustement est un tracé des vrais relevés simulés (logic.js), à l'échelle de ses axes.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { survey, fitRadius, fitSeries, METHODS, ARCSEC } from "./logic.js";

const C = FIG.C, VIOLET = "#7c3aed";
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
const foot = (f, s, y) => f.note(8, y ?? f.h - 6, s, { size: 9.5 });

/** κ = dθ/ds : une courbe, deux tangentes à Δs l'une de l'autre, l'angle Δθ entre elles. */
function figTurn(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("tu-alt", "A curve with two nearby points a distance Δs apart along it; the tangent at each point; the angle Δθ between the two tangent directions, drawn again from one point on the right") });
  const Y = (x) => 120 - 55 * Math.sin((x - 20) / 70) + 0.0004 * (x - 150) ** 2, D = (x) => -(55 / 70) * Math.cos((x - 20) / 70) + 0.0008 * (x - 150);
  const pts = []; for (let x = 20; x <= 270; x += 4) pts.push([x, Y(x)]);
  f.path(poly(pts), { c: C.ink, w: 2.4 });
  const tan = (x, c) => { const s = D(x), L = 46, k = L / Math.hypot(1, s); f.line(x - k, Y(x) - s * k, x + k, Y(x) + s * k, { c, w: 2 }); };
  const xa = 120, xb = 160; tan(xa, C.globe); tan(xb, C.sea);
  const arc = []; for (let x = xa; x <= xb; x += 2) arc.push([x, Y(x)]); f.path(poly(arc), { c: VIOLET, w: 4 });
  f.dot(xa, Y(xa), { r: 4, c: C.globe }); f.dot(xb, Y(xb), { r: 4, c: C.sea });
  f.txt((xa + xb) / 2, Y((xa + xb) / 2) + 22, "Δs", { c: VIOLET, anchor: "middle", tex: "\\Delta s" });
  // le rapporteur à droite
  const cx = 320, cy = 100, r = 42, a1 = Math.atan(-D(xa)) * 180 / Math.PI, a2 = Math.atan(-D(xb)) * 180 / Math.PI;
  const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  f.arrow(cx, cy, ...p(a1), { c: C.globe, w: 2 }); f.arrow(cx, cy, ...p(a2), { c: C.sea, w: 2 });
  f.angle(cx, cy, 24, Math.min(a1, a2), Math.max(a1, a2), { c: VIOLET, w: 2, label: "Δθ", tex: "\\Delta\\theta", pad: 14 });
  f.note(cx, cy + 58, tr("tu-1", "same two directions, one origin"), { size: 9.5, anchor: "middle" });
  foot(f, tr("tu-2", "κ = Δθ/Δs when Δs → 0: turn per unit length"));
  stamp(f, tr, tr("tu-st", "schematic"));
  return f;
}

/** Un cercle : la tangente tourne de l'angle au centre, Δθ = Δs/R ; une droite : Δθ = 0. */
function figCircle(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("ci-alt", "Left: a straight line with two parallel tangents, angle zero. Right: a circle of radius R; two points an arc Δs apart; their tangents turn by the same angle as the radii, Δs over R") });
  f.line(20, 120, 150, 120, { c: C.flat, w: 2.4 });
  f.dot(55, 120, { r: 4, c: C.globe }); f.dot(110, 120, { r: 4, c: C.sea });
  f.arrow(55, 120, 85, 120, { c: C.globe, w: 2 }); f.arrow(110, 120, 140, 120, { c: C.sea, w: 2 });
  f.note(85, 150, "Δθ = 0, κ = 0", { size: 11, anchor: "middle", c: C.flat });
  const cx = 270, cy = 115, R = 70, a1 = 115, a2 = 65, P = (a, r = R) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  f.circle(cx, cy, R, { c: C.globe, w: 2.2 });
  f.line(cx, cy, ...P(a1), { c: C.soft, w: 1.2 }); f.line(cx, cy, ...P(a2), { c: C.soft, w: 1.2 });
  f.angle(cx, cy, 20, a2, a1, { c: VIOLET, w: 1.8, label: "Δθ", tex: "\\Delta\\theta", pad: 12 });
  const arc = []; for (let a = a2; a <= a1; a += 2) arc.push(P(a)); f.path(poly(arc), { c: VIOLET, w: 4 });
  for (const [a, c] of [[a1, C.globe], [a2, C.sea]]) { const p = P(a), t = [Math.sin(a * Math.PI / 180), Math.cos(a * Math.PI / 180)]; f.line(p[0] - 40 * t[0], p[1] - 40 * t[1], p[0] + 40 * t[0], p[1] + 40 * t[1], { c, w: 2 }); f.dot(p[0], p[1], { r: 4, c }); }
  f.txt(cx, cy - R - 16, "Δs", { c: VIOLET, anchor: "middle", tex: "\\Delta s" });
  f.txt(cx + 28, cy + 26, "R", { c: C.soft, tex: "R" });
  f.note(cx, cy + R + 20, tr("ci-1", "tangents turn as much as the radii"), { size: 9.5, anchor: "middle" });
  stamp(f, tr, tr("ci-st", "schematic"));
  return f;
}

/** Le cercle osculateur d'un graphe : rayon ρ = 1/κ, centre du côté où la courbe tourne. */
function figOsc(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("os-alt", "The graph of a function y of x, and at one point the circle that hugs it best, the osculating circle, of radius rho equal to one over kappa, centred on the side the curve turns towards") });
  const Y = (x) => 160 - 0.0042 * (x - 190) ** 2 + 30 * Math.exp(-((x - 300) ** 2) / 900), pts = [];
  for (let x = 20; x <= 360; x += 3) pts.push([x, Y(x)]);
  f.path(poly(pts), { c: C.ink, w: 2.4 });
  const x0 = 150, h = 1, d1 = -(Y(x0 + h) - Y(x0 - h)) / (2 * h), d2 = -(Y(x0 + h) - 2 * Y(x0) + Y(x0 - h)) / (h * h);
  const k = d2 / Math.pow(1 + d1 * d1, 1.5), rho = 1 / Math.abs(k), nx = -d1 / Math.hypot(1, d1), ny = 1 / Math.hypot(1, d1);
  const ox = x0 + Math.sign(k) * nx * rho, oy = Y(x0) - Math.sign(k) * ny * rho;
  f.circle(ox, oy, rho, { c: C.flat, w: 1.4, dash: "5 4" });
  f.line(ox, oy, x0, Y(x0), { c: C.flat, w: 1.2 }); f.dot(ox, oy, { r: 3, c: C.flat }); f.dot(x0, Y(x0), { r: 4, c: C.globe });
  f.txt((ox + x0) / 2 + 8, (oy + Y(x0)) / 2, "ρ = 1/κ", { c: C.flat, tex: "\\rho = 1/\\kappa", size: 11 });
  foot(f, tr("os-1", "the circle through three points of the curve as they merge"));
  stamp(f, tr, tr("os-st", "schematic"));
  return f;
}

/** Quatre surfaces et leurs deux courbures principales. */
function figSurf(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("su-alt", "Four surfaces with their two principal curvatures: a plane, both zero, K zero; a cylinder, one over R and zero, K zero; a sphere, one over R twice, K one over R squared; a saddle, opposite signs, K negative") });
  const box = (i) => 12 + i * 92;
  // le plan
  { const x = box(0); f.path(`M${x} 110 L${x + 50} 90 L${x + 80} 110 L${x + 30} 130 Z`, { c: C.flat, w: 1.5, fill: "#fbf1e3" }); f.line(x + 10, 118, x + 70, 102, { c: C.globe, w: 2 }); f.line(x + 22, 98, x + 58, 122, { c: C.sea, w: 2 }); }
  // le cylindre
  { const x = box(1) + 40; f.ellipse(x, 80, 26, 9, { c: C.ink, w: 1.3 }); f.line(x - 26, 80, x - 26, 130, { c: C.ink, w: 1.3 }); f.line(x + 26, 80, x + 26, 130, { c: C.ink, w: 1.3 }); f.path(`M${x - 26} 130 A26 9 0 0 0 ${x + 26} 130`, { c: C.ink, w: 1.3 }); f.path(`M${x - 26} 105 A26 9 0 0 0 ${x + 26} 105`, { c: C.globe, w: 2 }); f.line(x, 80 + 9, x, 139, { c: C.sea, w: 2 }); }
  // la sphère
  { const x = box(2) + 40; f.circle(x, 105, 34, { c: C.ink, w: 1.3 }); f.ellipse(x, 105, 34, 10, { c: C.globe, w: 2 }); f.ellipse(x, 105, 10, 34, { c: C.sea, w: 2 }); }
  // la selle
  { const x = box(3) + 40; f.path(`M${x - 36} 92 Q${x} 128 ${x + 36} 92`, { c: C.globe, w: 2 }); f.path(`M${x - 22} 128 Q${x} 82 ${x + 22} 128`, { c: C.sea, w: 2 }); f.path(`M${x - 36} 92 L${x - 22} 128 M${x + 36} 92 L${x + 22} 128`, { c: C.ink, w: 1.2 }); }
  const lab = [["0 · 0", "K = 0"], ["1/R · 0", "K = 0"], ["1/R · 1/R", "K = 1/R²"], ["1/R · (−1/R)", "K < 0"]];
  const name = [tr("su-pl", "plane"), tr("su-cy", "cylinder"), tr("su-sp", "sphere"), tr("su-sa", "saddle")];
  for (let i = 0; i < 4; i++) { const x = box(i) + 40; f.note(x, 40, name[i], { size: 10.5, anchor: "middle", c: C.ink }); f.note(x, 160, `κ₁κ₂ = ${lab[i][0]}`, { size: 9.5, anchor: "middle" }); f.note(x, 176, lab[i][1], { size: 10.5, anchor: "middle", c: i === 2 ? C.globe : i < 2 ? C.flat : C.soft }); }
  stamp(f, tr, tr("su-st", "schematic"));
  return f;
}

/** Un triangle plat et un triangle sur une sphère : la somme des angles. */
function figTri(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("tr-alt", "Left: a flat triangle whose angles add up to 180 degrees. Right: a triangle on a sphere with curved sides whose angles add up to more, by the area divided by R squared") });
  const T = [[40, 160], [160, 160], [95, 60]];
  f.path(poly([...T, T[0]]) + "Z", { c: C.flat, w: 1.8, fill: "#fbf1e3" });
  f.note(100, 185, "α + β + γ = 180°", { size: 11, anchor: "middle", c: C.flat });
  const cx = 280, cy = 115, R = 72; f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  const A = [cx - 52, cy + 22], B = [cx + 52, cy + 22], Cc = [cx, cy - 58];
  f.path(`M${A[0]} ${A[1]} Q${cx} ${cy + 40} ${B[0]} ${B[1]} Q${cx + 36} ${cy - 10} ${Cc[0]} ${Cc[1]} Q${cx - 36} ${cy - 10} ${A[0]} ${A[1]} Z`, { c: C.globe, w: 1.8, fill: "#e8effd" });
  for (const p of [A, B, Cc]) f.dot(p[0], p[1], { r: 3.2, c: C.ink });
  f.note(cx, 192, "α + β + γ = 180° + A/R²", { size: 11, anchor: "middle", c: C.globe });
  stamp(f, tr, tr("tr-st", "schematic"));
  return f;
}

/** Un cercle tracé sur la sphère à distance r du piquet : sa circonférence est plus courte que 2πr. */
function figCirc(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("cc-alt", "Left: on a plane, a circle of radius r measured on the ground has a circumference two pi r. Right: on a sphere, a circle at distance r from the pole, measured along the surface, has a smaller circumference, two pi R sine of r over R") });
  f.ellipse(100, 120, 70, 22, { c: C.flat, w: 2 }); f.line(100, 120, 170, 120, { c: C.soft, w: 1.2, dash: "3 3" }); f.dot(100, 120, { r: 3, c: C.ink });
  f.note(135, 113, "r", { size: 11, c: C.soft }); f.note(100, 168, "C = 2πr", { size: 11, anchor: "middle", c: C.flat });
  const cx = 280, cy = 110, R = 64; f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  const lat = 35 * Math.PI / 180, yy = cy - R * Math.sin(lat), rr = R * Math.cos(lat);
  f.ellipse(cx, yy, rr, rr * 0.28, { c: C.globe, w: 2 });
  f.path(`M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx + rr} ${yy}`, { c: C.soft, w: 1.2, dash: "3 3" });
  f.dot(cx, cy - R, { r: 3, c: C.ink }); f.note(cx + rr * 0.62, cy - R + 6, "r", { size: 11, c: C.soft });
  f.note(cx, 192, "C = 2πR sin(r/R) < 2πr", { size: 11, anchor: "middle", c: C.globe });
  stamp(f, tr, tr("cc-st", "schematic"));
  return f;
}

/** L'ajustement : les vrais relevés simulés des triangles, plan et sphère, et leurs droites par l'origine. */
function figFit(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fi-alt", "The 300 simulated triangle surveys: angle-sum excess in arcseconds against area. The sphere's readings rise along a line through zero whose slope gives R; the plane's readings scatter around zero with no slope") });
  const m = METHODS.triangle, P = survey("triangle", "plane"), S = survey("triangle", "sphere"), fp = fitRadius(P, m), fs = fitRadius(S, m);
  const x0 = 46, x1 = 360, y0 = 180, y1 = 30, X = (A) => x0 + (A / 15500) * (x1 - x0), Y = (e) => y0 - ((e + 6) / 90) * (y0 - y1);
  f.line(x0, y1, x0, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x1, y0, { c: C.faint, w: 1 }); f.line(x0, Y(0), x1, Y(0), { c: C.soft, w: 1 });
  for (const a of [0, 20, 40, 60, 80]) f.note(x0 - 4, Y(a) + 3, `${a}″`, { size: 9.5, anchor: "end" });
  for (const A of [5000, 10000, 15000]) f.note(X(A), y0 + 13, `${A / 1000}k km²`, { size: 9.5, anchor: "middle" });
  for (const p of S) f.dot(X(p.x), Y(p.y / ARCSEC), { r: 1.8, c: C.globe });
  for (const p of P) f.dot(X(p.x), Y(p.y / ARCSEC), { r: 1.8, c: C.flat });
  f.line(X(0), Y(0), X(15500), Y((fs.c * 15500) / ARCSEC), { c: C.globe, w: 2 });
  f.line(X(0), Y(0), X(15500), Y((fp.c * 15500) / ARCSEC), { c: C.flat, w: 2 });
  f.note(x0 + 8, y1 + 6, tr("fi-1", "sphere: one line through zero, slope 1/R²"), { size: 10, c: C.globe });
  f.note(x1, Y(0) - 6, tr("fi-2", "plane: scatter around 0, no slope"), { size: 10, c: C.flat, anchor: "end" });
  axesStamp(f, tr, tr("fi-st", "simulated readings"));
  return f;
}

/** Le dip : l'œil à h, la tangente au cercle, l'angle δ sous le niveau ; au centre le même angle. */
function figDip(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("dp-alt", "An eye at height h above a circle of radius R; the line to the horizon is tangent to the circle; it dips below eye level by delta, and the same angle delta sits at the centre between the eye's vertical and the radius to the horizon") });
  const cx = 120, cy = 300, R = 220, h = 34, ey = cy - R - h, d = Math.acos(R / (R + h)), tx = cx + R * Math.sin(d), ty = cy - R * Math.cos(d);
  f.path(`M${cx - 110} ${cy - Math.sqrt(R * R - 110 * 110)} A${R} ${R} 0 0 1 ${cx + 200} ${cy - Math.sqrt(R * R - 200 * 200)}`, { c: C.ground, w: 2.4 });
  f.line(cx, cy - R, cx, ey, { c: C.ink, w: 2 }); f.dot(cx, ey, { r: 3.5 });
  f.dash(cx, ey, 360, ey, { c: "#ca8a04" });
  f.line(cx, ey, tx + (tx - cx) * 0.5, ty + (ty - ey) * 0.5, { c: C.globe, w: 1.8 }); f.dot(tx, ty, { r: 3.2, c: C.globe });
  f.angle(cx, ey, 60, -(d * 180) / Math.PI, 0, { c: C.globe, w: 1.6, label: "δ", tex: "\\delta", pad: 12 });
  f.line(cx, cy - R, cx, 205, { c: C.soft, w: 1, dash: "3 3" });   // la verticale vers le centre, hors cadre
  f.note(cx - 8, (ey + cy - R) / 2 + 4, "h", { size: 11, anchor: "end" });
  f.note(250, 120, tr("dp-1", "the sightline is tangent: cos δ = R/(R + h)"), { size: 9.5, c: C.globe });
  stamp(f, tr, tr("dp-st", "schematic, horizon dip exaggerated"));
  return f;
}

/** Les distances zénithales réciproques : deux verticales, la ligne qui les joint. */
function figZen(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("zn-alt", "Left: on a plane two parallel verticals and the line between their tops; the two zenith angles add up to 180 degrees. Right: on a sphere the verticals meet at the centre at the angle d over R, and the zenith angles add up to 180 degrees plus d over R") });
  f.line(20, 170, 170, 170, { c: C.ground, w: 2.4 });
  f.line(45, 170, 45, 70, { c: C.ink, w: 2 }); f.line(145, 170, 145, 90, { c: C.ink, w: 2 }); f.line(45, 100, 145, 120, { c: C.flat, w: 1.6 });
  f.angle(45, 100, 18, -11.3, 90, { c: C.flat, label: "z_A", tex: "z_A", pad: 12 }); f.angle(145, 120, 18, 90, 168.7, { c: C.flat, label: "z_B", tex: "z_B", pad: 12 });
  f.note(95, 192, "z_A + z_B = 180°", { size: 11, anchor: "middle", c: C.flat });
  const cx = 290, cy = 260, R = 140, a1 = 104, a2 = 76, P = (a, r) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  f.path(`M${P(115, R)[0]} ${P(115, R)[1]} A${R} ${R} 0 0 1 ${P(65, R)[0]} ${P(65, R)[1]}`, { c: C.ground, w: 2.4 });
  const A = P(a1, R + 40), B = P(a2, R + 30);
  for (const a of [a1, a2]) f.line(...P(a, R), ...P(a, R + 46), { c: C.ink, w: 2 });
  for (const a of [a1, a2]) f.line(...P(a, R), ...P(a, 150 - 40), { c: C.soft, w: 1, dash: "3 3" });
  f.line(A[0], A[1], B[0], B[1], { c: C.globe, w: 1.6 });
  f.note(cx, 200, "z_A + z_B = 180° + d/R", { size: 11, anchor: "middle", c: C.globe });
  stamp(f, tr, tr("zn-st", "schematic, curvature exaggerated"));
  return f;
}

/** Ératosthène : deux bâtons, un Soleil à l'infini sur une sphère, un Soleil proche sur un plan. */
function figErat(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("er-alt", "Left: on a plane with a Sun at height H, two sticks cast shadows whose angles differ by the difference of two arctangents. Right: on a sphere with parallel sunlight, the difference of shadow angles equals the angle at the centre, d over R") });
  f.line(15, 175, 175, 175, { c: C.ground, w: 2.4 });
  f.circle(40, 35, 8, { c: "#f59e0b", fill: "#fde68a" }); f.dash(40, 43, 40, 175, { c: C.faint });
  for (const x of [80, 140]) { f.line(x, 175, x, 145, { c: C.ink, w: 2 }); const k = (175 - 35) / (145 - 35); f.line(40, 35, 40 + (x - 40) * k, 175, { c: "#d97706", w: 1.2 }); }
  f.note(40 + 8, 32, "H", { size: 11 }); f.note(110, 192, "Δz = arctan(r₂/H) − arctan(r₁/H)", { size: 10, anchor: "middle", c: C.flat });
  const cx = 290, cy = 250, R = 130, P = (a, r) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  f.path(`M${P(120, R)[0]} ${P(120, R)[1]} A${R} ${R} 0 0 1 ${P(60, R)[0]} ${P(60, R)[1]}`, { c: C.ground, w: 2.4 });
  for (const a of [100, 80]) { f.line(...P(a, R), ...P(a, R + 26), { c: C.ink, w: 2 }); f.line(...P(a, R), ...P(a, 0.82 * R), { c: C.soft, w: 1, dash: "3 3" }); }
  for (let i = 0; i < 4; i++) f.arrow(225 + i * 34, 30, 225 + i * 34, 62, { c: "#d97706", w: 1.2 });
  f.note(cx, 200, "Δz = d/R", { size: 11, anchor: "middle", c: C.globe });
  stamp(f, tr, tr("er-st", "schematic"));
  return f;
}

/** Vitesse × temps : le même trajet sur le globe (arc R θ) et sur la carte du pôle (droite, plus longue au sud). */
function figTravel(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("tv-alt", "Left: on a globe, a trip between two places is an arc R theta, theta from their latitudes and longitudes. Right: the same two places on the flat-earth map centred on the North Pole; the straight trip between them is longer than R theta, more so in the south") });
  const cx = 95, cy = 105, R = 70, th = 60, a0 = 90 + th / 2, P = (a) => [cx + R * Math.cos(a * Math.PI / 180), cy - R * Math.sin(a * Math.PI / 180)];
  f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  const arc = []; for (let a = a0 - th; a <= a0; a += 2) arc.push(P(a)); f.path(poly(arc), { c: C.globe, w: 2.6 });
  f.line(cx, cy, ...P(a0), { c: C.soft, w: 1, dash: "3 3" }); f.line(cx, cy, ...P(a0 - th), { c: C.soft, w: 1, dash: "3 3" });
  f.angle(cx, cy, 16, a0 - th, a0, { c: C.globe, label: "θ", tex: "\\theta", pad: 11 });
  f.dot(...P(a0), { r: 3.5 }); f.dot(...P(a0 - th), { r: 3.5 });
  f.note(cx, 196, "v t = R θ", { size: 11, anchor: "middle", c: C.globe });
  const mx = 285, my = 105, MR = 85;   // la carte : pôle au centre, équateur à MR/2, bord au pôle Sud
  f.circle(mx, my, MR, { c: C.faint, w: 1.2, fill: "#fbf1e3" }); f.circle(mx, my, MR / 2, { c: C.faint, w: 1, dash: "3 3" }); f.dot(mx, my, { r: 2.2 });
  const Q = (lat, lon) => { const q = (MR * (90 - lat)) / 180; return [mx + q * Math.sin(lon * Math.PI / 180), my + q * Math.cos(lon * Math.PI / 180)]; };
  const n1 = Q(40, -30), n2 = Q(40, 30), s1 = Q(-35, -30), s2 = Q(-35, 30);
  f.line(...n1, ...n2, { c: C.flat, w: 2 }); f.line(...s1, ...s2, { c: C.flat, w: 2.6 });
  for (const q of [n1, n2, s1, s2]) f.dot(...q, { r: 3 });
  f.note(mx, 196, tr("tv-1", "flat map: v t ≠ R θ, longer in the south"), { size: 10, anchor: "middle", c: C.flat });
  stamp(f, tr, tr("tv-st", "schematic"));
  return f;
}

/** Les deux façons d'échouer, figure fixe (2026-11-27, propriétaire : « pas en animation » ; les graphes de la scène de la
 *  vitrine) : r et χ²/ν selon le nombre de relevés, triangles en haut, Ératosthène en bas, plan et sphère, sur les relevés
 *  simulés de logic.js (N en log, χ²/ν en log avec la ligne 1). */
function figFail(tr) {
  const f = FIG.make({ w: 380, h: 330, alt: tr("ff-alt", "Correlation and scatter against the number of readings. Triangles: on the plane the correlation falls from 1 to about 0 while the scatter stays near 1; on the sphere both stay at 1. Eratosthenes under a nearby flat Sun: on the plane the correlation stays near 0.7 while the scatter climbs to about 300; on the sphere both stay near 1") });
  const rows = [["triangle", tr("ff-tri", "Triangles: r falls to 0, χ²/ν stays at 1")], ["erat", tr("ff-era", "Eratosthenes, nearby Sun: r stays, χ²/ν climbs")]];
  rows.forEach(([id, title], i) => {
    const m = METHODS[id], P = fitSeries(survey(id, "plane"), m), S = fitSeries(survey(id, "sphere"), m), n = m.n, y0 = 30 + i * 150;
    f.note(8, y0, title, { size: 10.5, c: C.ink });
    for (const [j, key] of [[0, "r"], [1, "chi2nu"]]) {
      const x0 = 34 + j * 182, x1 = x0 + 150, top = y0 + 16, bot = y0 + 112;
      const X = (k) => x0 + ((Math.log(k) - Math.log(2)) / (Math.log(n) - Math.log(2))) * (x1 - x0);
      const Y = key === "r" ? (v) => bot - ((v + 1) / 2) * (bot - top) : (v) => bot - ((Math.log10(Math.max(0.01, Math.min(3000, v))) + 2) / Math.log10(300000)) * (bot - top);
      f.line(x0, top, x0, bot, { c: C.faint, w: 1 }); f.line(x0, bot, x1, bot, { c: C.faint, w: 1 });
      f.dash(x0, Y(key === "r" ? 0 : 1), x1, Y(key === "r" ? 0 : 1), { c: C.soft });
      for (const [v, s] of key === "r" ? [[-1, "−1"], [0, "0"], [1, "1"]] : [[0.01, "0.01"], [1, "1"], [100, "100"]]) f.note(x0 - 3, Y(v) + 3, s, { size: 8.5, anchor: "end" });
      for (const k of [2, 10, n]) f.note(X(k), bot + 11, String(k), { size: 8.5, anchor: "middle" });
      f.note(x0 + 4, top - 3, key === "r" ? "r" : "χ²/ν", { size: 9.5, c: C.ink });
      for (const [ser, c, w] of [[P, C.flat, 3], [S, C.globe, 1.4]]) f.path(poly(ser.map((e) => [X(e.n), Y(e[key])])), { c, w });
    }
  });
  f.note(372, 322, tr("ff-key", "amber: plane · blue: sphere · N in log"), { size: 9, anchor: "end" });
  axesStamp(f, tr, tr("fi-st", "simulated readings"));
  return f;
}

export const FORMULA_FIGS = { kapFxTurn: figTurn, kapFxCircle: figCircle, kapFxOsc: figOsc, kapFxSurf: figSurf, kapFxTri: figTri, kapFxCirc: figCirc, kapFxFit: figFit, kapFxDip: figDip, kapFxZen: figZen, kapFxErat: figErat, kapFxTravel: figTravel, kapFxFail: figFail };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "kappa"); }
