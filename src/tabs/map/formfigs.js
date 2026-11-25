// Schémas SVG de l'onglet map (2026-10-08) : un par formule (règle du propriétaire), plus
// les deux cartes anciennes redessinées en schéma (Babylone, T-O). Libellés via tr(k, repli anglais).
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { flatError, radiusForError, polarStretch, utmScale, utmHalfWidth, mercY, R_KM } from "./logic.js";

const C = FIG.C;
const trueScale = (f, tr, what) => { f.stamped = true; f.note(f.w - 4, 12, `${tr("fx-true", "true scale")}${what ? " — " + what : ""}`, { anchor: "end", c: C.soft, size: 10 }); };
const pts = (a) => a.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

/* Babylone : la tablette BM 92687, en schéma (cercle d'océan, Babylone, régions triangulaires). */
function figBab(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-bab-alt", "Schematic of the Babylonian map of the world: a ring of ocean around a disc with Babylon and the Euphrates, and triangular regions beyond the ocean") });
  const cx = 150, cy = 118, r1 = 62, r2 = 80;
  f.circle(cx, cy, r2, { c: C.sea, w: 1.6, fill: "#dcebf2" }); f.circle(cx, cy, r1, { c: C.sea, w: 1.4, fill: "#efe6cf" });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * 2 * Math.PI - Math.PI / 2 + 0.25, w = 0.16;
    f.path(pts([[cx + r2 * Math.cos(a - w), cy + r2 * Math.sin(a - w)], [cx + (r2 + 30) * Math.cos(a), cy + (r2 + 30) * Math.sin(a)], [cx + r2 * Math.cos(a + w), cy + r2 * Math.sin(a + w)]]), { c: C.ground, w: 1.2, fill: "#e6dfcc" });
  }
  f.path(`M${cx - 8} ${cy - r1 + 4} C ${cx - 16} ${cy - 20}, ${cx + 10} ${cy + 10}, ${cx + 2} ${cy + r1 - 6}`, { c: C.sea, w: 2.2 });
  f.path(`M${cx - 44} ${cy - 6} h 40 v 14 h -40 Z`, { c: C.ink, w: 1.2, fill: C.paper }); f.note(cx - 24, cy + 5, tr("fx-bab-1", "Babylon"), { size: 8.5, anchor: "middle", c: C.ink });
  f.note(cx + 8, cy - 30, tr("fx-bab-2", "Euphrates"), { size: 9, c: C.sea });
  f.note(254, 106, tr("fx-bab-3", "ring: the “bitter river”"), { size: 9.5, c: C.sea });
  f.note(254, 52, tr("fx-bab-4", "regions beyond the ocean"), { size: 9.5 });
  f.note(254, 66, tr("fx-bab-5", "(“nagû”), as triangles"), { size: 9.5 });
  f.note(254, 160, tr("fx-bab-6", "clay, 12 × 8 cm,"), { size: 9.5 });
  f.note(254, 174, tr("fx-bab-7", "Sippar, Neo-Babylonian"), { size: 9.5 });
  stamp(f, tr, tr("fx-bab-st", "after BM 92687, simplified"));
  return f;
}

/* Une carte plate de rayon d : le cercle tracé à d du centre mesure 2πd sur le papier, 2πR sin(d/R) au sol. */
function figLocal(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-loc-alt", "A cap of the sphere around a centre point, of ground radius d, and the flat disc of the same radius d. The circle at distance d is shorter on the sphere, 2 pi R sin(d/R), than on the disc, 2 pi d") });
  const cx = 110, cy = 128, R = 80, c = 0.9;
  f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  f.dot(cx, cy, { r: 2.5, c: C.soft });
  const top = [cx, cy - R], p = [cx + R * Math.sin(c), cy - R * Math.cos(c)], q = [cx - R * Math.sin(c), cy - R * Math.cos(c)];
  const arc = []; for (let t = -c; t <= c + 1e-9; t += c / 30) arc.push([cx + R * Math.sin(t), cy - R * Math.cos(t)]);
  f.path(pts(arc), { c: C.globe, w: 2.4 });
  f.ellipse(cx, p[1], R * Math.sin(c), 9, { c: C.globe, w: 1.4 });
  f.line(cx, cy, p[0], p[1], { c: C.faint, w: 1, dash: "4 3" }); f.line(cx, cy, cx, cy - R, { c: C.faint, w: 1, dash: "4 3" });
  f.angleAt(cx, cy, 20, top, p, { label: "c", c: C.soft, pad: 8 });
  f.dot(...top, { r: 3.5, c: C.ink });
  f.note(p[0] + 4, (top[1] + p[1]) / 2 - 2, "d = Rc", { size: 10.5, c: C.globe });
  f.note(cx - 4, p[1] + 26, "2πR sin c", { size: 10.5, c: C.globe, anchor: "middle" });
  f.note(cx + 26, cy + 4, "R", { size: 10.5 });
  // le disque plat, même rayon d
  const dx = 290, dy = 128, rd = R * c;
  f.ellipse(dx, dy, rd, rd * 0.32, { c: C.flat, w: 2, fill: C.wash });
  f.line(dx, dy, dx + rd, dy, { c: C.flat, w: 1.6 }); f.dot(dx, dy, { r: 3.5, c: C.ink });
  f.note(dx + rd / 2, dy - 6, "d", { size: 10.5, c: C.flat, anchor: "middle" });
  f.note(dx, dy + rd * 0.32 + 16, "2πd", { size: 10.5, c: C.flat, anchor: "middle" });
  f.note(8, 214, tr("fx-loc-1", "the same circle: 2πd on paper, 2πR sin(d/R) on the ground"), { size: 9.5 });
  f.note(8, 227, tr("fx-loc-2", "every flat map stretches it by k = c / sin c ≈ 1 + c²/6"), { size: 9.5 });
  stamp(f, tr, tr("fx-loc-st", "c = 52°, far larger than a regional map"));
  return f;
}

/* L'erreur d'une carte plate (la meilleure : azimutale équidistante) contre son rayon, échelle log-log. */
function figErr(tr, v) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-err-alt", "The largest scale error of the best flat map of a region, against the radius of the region, on log scales: under a millionth for a town, four thousandths of a percent for a county, 0.4 percent for a kingdom, about 4 percent for the Mediterranean") });
  const X0 = 54, X1 = 368, Y0 = 200, Y1 = 30;
  const lx = (d) => X0 + (Math.log10(d) - 0) / 4 * (X1 - X0);               // 1 à 10 000 km
  const ly = (e) => Y0 - (Math.log10(e) + 9) / 9 * (Y0 - Y1);                // 1e-9 à 1
  for (const d of [1, 10, 100, 1000, 10000]) { f.dash(lx(d), Y1, lx(d), Y0, { c: "#e7e3da" }); f.note(lx(d), Y0 + 13, d.toLocaleString(v.lang), { size: 9.5, anchor: d === 10000 ? "end" : "middle" }); }
  for (const [e, s] of [[1e-8, "10⁻⁶ %"], [1e-6, "10⁻⁴ %"], [1e-4, "0.01 %"], [1e-2, "1 %"], [1, "100 %"]]) { f.dash(X0, ly(e), X1, ly(e), { c: "#e7e3da" }); f.note(X0 - 4, ly(e) + 3, v.lang === "en" ? s : s.replace(".", ","), { anchor: "end", size: 9 }); }
  const P = []; for (let k = 0; k <= 120; k++) { const d = 10 ** (k / 30); P.push([lx(d), ly(flatError(d))]); }
  f.path(pts(P), { c: C.globe, w: 2.2 });
  f.line(X0, ly(0.01), X1, ly(0.01), { c: C.flat, w: 1.2, dash: "5 3" });
  const d1 = radiusForError(0.01); f.dot(lx(d1), ly(0.01), { r: 3.5, c: C.flat });
  f.note(X0 + 4, ly(0.01) - 5, tr("fx-err-1", "1 % at {d} km").replace("{d}", v.d1), { size: 9.5, c: C.flat });
  const marks = [[10, tr("fx-err-town", "town")], [100, tr("fx-err-county", "county")], [1000, tr("fx-err-kingdom", "kingdom")], [3000, tr("fx-err-med", "Mediterranean")]];
  for (const [d, s] of marks) { const last = d === 3000; f.dot(lx(d), ly(flatError(d)), { r: 3, c: C.globe }); f.note(lx(d) + (last ? -6 : 5), ly(flatError(d)) + (last ? -6 : 13), s, { size: 9.5, c: C.ink, anchor: last ? "end" : "start" }); }
  f.note(X1, Y0 + 28, tr("fx-err-2", "radius of the region mapped (km) · largest scale error"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-err-st", "log–log"));
  return f;
}

/* Ératosthène : C = (360°/α) s. */
function figErat(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-era-alt", "Parallel sunbeams reach Syene and Alexandria. At Syene the Sun is overhead, at Alexandria a gnomon casts a shadow at angle alpha, which is also the angle between the two places at the Earth's centre, so the circumference is 360 degrees over alpha times the distance s") });
  const cx = 120, cy = 210, R = 150, aS = 90, aA = 90 + 20;
  f.path(`M${cx - R * 0.72} ${cy - R * 0.69} A ${R} ${R} 0 0 1 ${cx + R * 0.5} ${cy - R * 0.87}`, { c: C.sea, w: 2 });
  const S = [cx + R * Math.cos(aS * Math.PI / 180), cy - R * Math.sin(aS * Math.PI / 180)], A = [cx + R * Math.cos(aA * Math.PI / 180), cy - R * Math.sin(aA * Math.PI / 180)];
  f.dot(cx, cy, { r: 0 });
  f.line(cx, cy, S[0], S[1], { c: C.faint, w: 1, dash: "4 3" }); f.line(cx, cy, A[0], A[1], { c: C.faint, w: 1, dash: "4 3" });
  f.angle(cx, cy, 40, aS, aA, { label: "α", tex: "\\alpha", c: C.globe, pad: 9 });
  f.note(S[0] + 6, S[1] - 6, tr("fx-era-s", "Syene: no shadow"), { size: 9.5 });
  // gnomon d'Alexandrie, le long de la verticale locale
  const g = 26, G = [A[0] + g * Math.cos(aA * Math.PI / 180), A[1] - g * Math.sin(aA * Math.PI / 180)];
  f.line(A[0], A[1], G[0], G[1], { c: C.ink, w: 2.4 });
  for (const [x, y] of [[S[0], S[1] - 3], [G[0], G[1] - 3], [330, 70], [360, 70]]) f.arrow(x, 18, x, y, { c: "#d9a521", w: 1.4 });
  f.note(A[0] - 14, A[1] - 2, tr("fx-era-a", "Alexandria"), { size: 9.5, anchor: "end" });
  f.note((S[0] + A[0]) / 2, S[1] - 12, "s", { size: 11, c: C.sea, anchor: "middle" });
  f.note(196, 120, "C = (360° / α) · s", { size: 11, c: C.ink });
  f.note(196, 136, tr("fx-era-1", "α = 7.2° (1/50 of a circle)"), { size: 9.5 });
  f.note(196, 150, tr("fx-era-2", "s = 5,000 stadia → C = 250,000"), { size: 9.5 });
  stamp(f, tr, tr("fx-era-st", "α enlarged ~3×"));
  return f;
}

/* Marinus et Ptolémée : un parallèle à la latitude φ a la longueur cos φ de l'équateur. */
function figMarinus(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-mar-alt", "Cross-section of the globe: the parallel at latitude phi is a circle of radius R cos phi. At Rhodes, 36 degrees, cos phi is 0.809; Ptolemy gives 93 parts for 115 of the equator, 0.809") });
  const cx = 70, cy = 190, R = 140, phi = 36 * Math.PI / 180;
  f.path(`M${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`, { c: C.sea, w: 2 });
  f.line(cx, cy, cx + R, cy, { c: C.ink, w: 1.4 }); f.line(cx, cy, cx, cy - R, { c: C.faint, w: 1, dash: "4 3" });
  const P = [cx + R * Math.cos(phi), cy - R * Math.sin(phi)];
  f.line(cx, cy, P[0], P[1], { c: C.faint, w: 1, dash: "4 3" });
  f.line(cx, P[1], P[0], P[1], { c: C.globe, w: 2.4 });
  f.angle(cx, cy, 34, 0, 36, { label: "φ", tex: "\\varphi", c: C.soft, pad: 9 });
  f.note((cx + P[0]) / 2, P[1] - 6, "R cos φ", { size: 10.5, c: C.globe, anchor: "middle" });
  f.note(cx + R / 2, cy + 14, tr("fx-mar-eq", "equator, R"), { size: 9.5, anchor: "middle" });
  f.dot(P[0], P[1], { r: 3.5, c: C.ink }); f.note(P[0] + 6, P[1] - 4, tr("fx-mar-rh", "Rhodes, 36°"), { size: 9.5 });
  f.note(222, 40, tr("fx-mar-c36", "cos 36° = 0.809"), { size: 10.5, c: C.globe });
  f.note(222, 56, tr("fx-mar-1", "Ptolemy: 93 / 115 = 0.809"), { size: 10, c: C.ink });
  f.note(222, 72, tr("fx-mar-2", "Thule, 63°: 52 / 115"), { size: 10, c: C.ink });
  f.note(222, 88, tr("fx-mar-c63", "cos 63° = 0.454"), { size: 10.5, c: C.globe });
  trueScale(f, tr, tr("fx-mar-st", "angles true"));
  return f;
}

/* Ptolémée : un cône posé sur le globe, déroulé (conique équidistante). */
function figPtolCone(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-pco-alt", "A cone set over the globe, touching it along the parallels of Rhodes and Thule, and the same cone unrolled into a fan: meridians become straight lines from the apex, parallels become concentric arcs") });
  const cx = 82, cy = 118, R = 55;
  f.circle(cx, cy, R, { c: C.sea, w: 1.6 });
  const ap = [cx, cy - R * 2.05];
  const t1 = [cx + R * Math.cos(36 * Math.PI / 180), cy - R * Math.sin(36 * Math.PI / 180)], t2 = [cx + R * Math.cos(63 * Math.PI / 180), cy - R * Math.sin(63 * Math.PI / 180)];
  f.line(ap[0], ap[1], cx + R * 1.18, cy + 8, { c: C.flat, w: 1.6 }); f.line(ap[0], ap[1], cx - R * 1.18, cy + 8, { c: C.flat, w: 1.6 });
  f.ellipse(cx, t1[1], t1[0] - cx, 6, { c: C.globe, w: 1.4 }); f.ellipse(cx, t2[1], t2[0] - cx, 4, { c: C.globe, w: 1.4 });
  f.note(cx + R + 8, t1[1] + 4, "36°", { size: 9.5, c: C.globe }); f.note(t2[0] + 10, t2[1], "63°", { size: 9.5, c: C.globe });
  // l'éventail déroulé
  const fx = 268, fy = 30, n = 0.753, G = 1.702, s = 66, half = n * Math.PI / 2;
  for (const la of [0, 36, 63]) {
    const r = (G - la * Math.PI / 180) * s, a = []; for (let t = -half; t <= half + 1e-9; t += half / 20) a.push([fx + r * Math.sin(t), fy + r * Math.cos(t)]);
    f.path(pts(a), { c: la ? C.globe : C.soft, w: la ? 1.8 : 1.2 });
  }
  for (const t of [-half, -half / 2, 0, half / 2, half]) { const r0 = (G - 63 * Math.PI / 180) * s, r1 = G * s; f.line(fx + r0 * Math.sin(t), fy + r0 * Math.cos(t), fx + r1 * Math.sin(t), fy + r1 * Math.cos(t), { c: C.faint, w: 1 }); }
  f.note(fx, fy + G * s + 14, tr("fx-pco-eq", "equator"), { size: 9.5, anchor: "middle" });
  f.note(8, 204, "ρ = G − φ,  θ = n (λ − λ₀),  n = (cos φ₁ − cos φ₂) / (φ₂ − φ₁)", { size: 9.5 });
  f.note(8, 217, tr("fx-pco-1", "true along every meridian and on both chosen parallels"), { size: 9.5 });
  stamp(f, tr, tr("fx-pco-st", "cone schematic"));
  return f;
}

/* Mercator : les méridiens rendus parallèles, chaque parallèle étiré de sec φ ; on étire le nord-sud d'autant. */
function figMerc(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-mer-alt", "Left: on the globe two meridians converge toward the pole, and a small square between them shrinks in width as cos phi. Right: on Mercator's map the meridians are parallel, so each square is widened by sec phi and, to keep its shape, heightened by the same factor; the parallels spread apart toward the pole") });
  const gx = 90, by = 205;
  for (const la of [0, 20, 40, 60, 80]) {
    const w = 60 * Math.cos(la * Math.PI / 180), y = by - la * 2.1;
    f.line(gx - w, y, gx + w, y, { c: la === 60 ? C.globe : C.faint, w: la === 60 ? 1.8 : 1 }); f.note(gx - 66, y + 3, la + "°", { size: 9, anchor: "end" });
  }
  f.path(pts(Array.from({ length: 17 }, (_, i) => { const la = i * 5; return [gx + 60 * Math.cos(la * Math.PI / 180), by - la * 2.1]; })), { c: C.ink, w: 1.4 });
  f.path(pts(Array.from({ length: 17 }, (_, i) => { const la = i * 5; return [gx - 60 * Math.cos(la * Math.PI / 180), by - la * 2.1]; })), { c: C.ink, w: 1.4 });
  f.note(gx, by + 16, tr("fx-mer-g", "globe: width ∝ cos φ"), { size: 9.5, anchor: "middle" });
  const mx = 280, s = 40;
  for (const la of [0, 20, 40, 60, 80]) {
    const y = by - mercY(la) * s;
    f.line(mx - 60, y, mx + 60, y, { c: la === 60 ? C.globe : C.faint, w: la === 60 ? 1.8 : 1 }); f.note(mx - 66, y + 3, la + "°", { size: 9, anchor: "end" });
  }
  f.line(mx - 60, by, mx - 60, by - mercY(80) * s, { c: C.ink, w: 1.4 }); f.line(mx + 60, by, mx + 60, by - mercY(80) * s, { c: C.ink, w: 1.4 });
  f.note(mx, by + 16, tr("fx-mer-m", "Mercator: y = ln tan(45° + φ/2)"), { size: 9.5, anchor: "middle" });
  // un petit carré à 60° de part et d'autre
  const q = 6; f.path(`M${gx - q} ${by - 126 - q} h ${2 * q} v ${2 * q} h ${-2 * q} Z`, { c: C.globe, w: 1.4, fill: C.coolwash });
  const y60 = by - mercY(60) * s; f.path(`M${mx - 2 * q} ${y60 - 2 * q} h ${4 * q} v ${4 * q} h ${-4 * q} Z`, { c: C.globe, w: 1.4, fill: C.coolwash });
  stamp(f, tr, tr("fx-mer-st", "squares enlarged"));
  return f;
}

/* Tissot : un petit cercle du globe devient une ellipse de demi-axes h (nord-sud) et k (est-ouest). */
function figTissot(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-tis-alt", "A small circle on the globe becomes on the map an ellipse whose semi-axes are the scale along the meridian, h, and along the parallel, k. Conformal maps keep h equal to k, equal-area maps keep h times k equal to one") });
  f.circle(70, 95, 34, { c: C.globe, w: 1.8, fill: C.coolwash }); f.line(70, 95, 104, 95, { c: C.soft, w: 1 }); f.note(87, 90, "1", { size: 10, anchor: "middle" });
  f.note(70, 150, tr("fx-tis-g", "on the globe"), { size: 9.5, anchor: "middle" });
  f.arrow(118, 95, 160, 95, { c: C.soft, w: 1.4 });
  f.ellipse(235, 95, 62, 30, { c: C.globe, w: 1.8, fill: C.coolwash });
  f.line(235, 95, 297, 95, { c: C.flat, w: 1.6 }); f.line(235, 95, 235, 65, { c: C.flat, w: 1.6 });
  f.note(268, 90, "k", { size: 11, c: C.flat, anchor: "middle" }); f.note(229, 82, "h", { size: 11, c: C.flat, anchor: "end" });
  f.note(235, 150, tr("fx-tis-m", "on the map"), { size: 9.5, anchor: "middle" });
  f.note(8, 176, tr("fx-tis-1", "conformal: h = k (shapes kept) · equal-area: h·k = 1 (areas kept)"), { size: 9.5 });
  f.note(8, 190, tr("fx-tis-2", "Gauss: on a sphere no map has h = k = 1 everywhere"), { size: 9.5 });
  stamp(f, tr, tr("fx-tis-st", "circle enlarged"));
  return f;
}

/* Azimutale équidistante : ρ = R c dans la direction de l'azimut θ. */
function figAE(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-ae-alt", "Left: on the globe, a point at angular distance c from the centre of the map, in the direction of azimuth theta. Right: on the map it is drawn at radius R c in the same direction, so every distance and direction from the centre is true; the circle through it is drawn 2 pi R c long instead of 2 pi R sin c") });
  const cx = 90, cy = 98, R = 68, c = 1.1;
  f.circle(cx, cy, R, { c: C.faint, w: 1.2 });
  const top = [cx, cy - R], p = [cx + R * Math.sin(c), cy - R * Math.cos(c)];
  const arc = []; for (let t = 0; t <= c + 1e-9; t += c / 24) arc.push([cx + R * Math.sin(t), cy - R * Math.cos(t)]);
  f.path(pts(arc), { c: C.globe, w: 2.2 });
  f.line(cx, cy, top[0], top[1], { c: C.faint, w: 1, dash: "4 3" }); f.line(cx, cy, p[0], p[1], { c: C.faint, w: 1, dash: "4 3" });
  f.angleAt(cx, cy, 18, top, p, { label: "c", c: C.soft, pad: 8 }); f.dot(...top, { r: 3.5 }); f.dot(...p, { r: 3.5, c: C.globe });
  f.note(cx, cy + R + 16, tr("fx-ae-g", "globe"), { size: 9.5, anchor: "middle" });
  const mx = 275, my = 110, rr = 72 * c * 0.75;
  f.circle(mx, my, rr, { c: C.flat, w: 1.4, dash: "5 3" }); f.dot(mx, my, { r: 3.5 });
  const th = 50 * Math.PI / 180, q = [mx + rr * Math.sin(th), my - rr * Math.cos(th)];
  f.line(mx, my, mx, my - rr - 10, { c: C.faint, w: 1, dash: "4 3" }); f.line(mx, my, q[0], q[1], { c: C.globe, w: 2.2 }); f.dot(...q, { r: 3.5, c: C.globe });
  f.angleAt(mx, my, 20, [mx, my - rr], q, { label: "θ", tex: "\\theta", c: C.soft, pad: 8 });
  f.note(mx + 6, my + 20, "ρ = R c", { size: 10.5, c: C.globe });
  f.note(mx, my + rr + 16, tr("fx-ae-m", "map: drawn 2πRc, true 2πR sin c"), { size: 9.5, anchor: "middle", c: C.flat });
  f.note(8, 206, "cos c = sin φ₀ sin φ + cos φ₀ cos φ cos(λ − λ₀)", { size: 9.5 });
  stamp(f, tr, tr("fx-ae-st", "schematic"));
  return f;
}

/* La carte polaire : étirement est-ouest k = (π/2 − φ)/cos φ, contre la latitude. */
function figPolar(tr, v) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-pol-alt", "East-west stretch of the north-polar azimuthal equidistant map against latitude: 1 at the pole, 1.57 at the equator, 2.6 at the latitude of Sydney, Cape Town and Buenos Aires, 5.2 at 60 degrees south") });
  const X0 = 46, X1 = 352, Y0 = 196, Y1 = 30, lx = (la) => X0 + (90 - la) / 150 * (X1 - X0), ly = (k) => Y0 - (k - 0) / 5.5 * (Y0 - Y1);
  for (const k of [1, 2, 3, 4, 5]) { f.dash(X0, ly(k), X1, ly(k), { c: "#e7e3da" }); f.note(X0 - 5, ly(k) + 3, `×${k}`, { size: 9.5, anchor: "end" }); }
  for (const la of [90, 60, 30, 0, -30, -60]) { f.note(lx(la), Y0 + 13, `${Math.abs(la)}°${la > 0 ? (v.lang === "fr" ? "N" : "N") : la < 0 ? "S" : ""}`, { size: 9.5, anchor: "middle" }); }
  const P = []; for (let la = 89.9; la >= -60; la -= 1) P.push([lx(la), ly(polarStretch(la))]);
  f.path(pts(P), { c: C.flat, w: 2.2 });
  f.line(X0, ly(1), X1, ly(1), { c: C.globe, w: 1.4 }); f.note(X1, ly(1) + 14, tr("fx-pol-g", "globe: ×1 everywhere"), { size: 9.5, c: C.globe, anchor: "end" });
  for (const [la, s] of [[51.5, tr("fx-pol-lon", "London")], [0, tr("fx-pol-eq", "equator")], [-33.9, tr("fx-pol-syd", "Sydney, Cape Town")]]) {
    const k = polarStretch(la); f.dot(lx(la), ly(k), { r: 3.5, c: C.flat }); f.note(lx(la) - 4, ly(k) - 8, `${s} ×${k.toLocaleString(v.lang, { maximumFractionDigits: 2 })}`, { size: 9.5, anchor: "end", c: C.ink });
  }
  f.note(374, Y0 + 28, tr("fx-pol-1", "latitude · east-west scale of the polar map, k = (π/2 − φ) / cos φ"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-pol-st", "computed"));
  return f;
}

/* UTM : l'échelle à travers une zone de 6°. */
function figUTM(tr, v) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-utm-alt", "Scale of the transverse Mercator projection across one 6-degree UTM zone at the equator: 0.9996 on the central meridian, exactly 1 about 180 km either side, 1.001 at the zone's edge 334 km away") });
  const half = utmHalfWidth(0), X0 = 56, X1 = 364, Y0 = 186, Y1 = 34, xm = 400;
  const lx = (x) => X0 + (x + xm) / (2 * xm) * (X1 - X0), ly = (k) => Y0 - (k - 0.9994) / 0.0018 * (Y0 - Y1);
  for (const k of [0.9996, 1, 1.0004, 1.0008]) { f.dash(X0, ly(k), X1, ly(k), { c: "#e7e3da" }); f.note(X0 - 4, ly(k) + 3, k.toLocaleString(v.lang, { minimumFractionDigits: 4 }), { size: 9, anchor: "end" }); }
  for (const x of [-400, -200, 0, 200, 400]) f.note(lx(x), Y0 + 13, String(x), { size: 9.5, anchor: "middle" });
  f.path(`M${lx(-half)} ${Y1} L${lx(-half)} ${Y0} M${lx(half)} ${Y1} L${lx(half)} ${Y0}`, { c: C.soft, w: 1, dash: "3 3" });
  f.note(lx(half) - 4, Y1 + 10, tr("fx-utm-e", "zone edge"), { size: 9, anchor: "end" });
  const P = []; for (let x = -half; x <= half + 1e-9; x += half / 40) P.push([lx(x), ly(utmScale(x))]);
  f.path(pts(P), { c: C.globe, w: 2.2 });
  f.line(X0, ly(1), X1, ly(1), { c: C.sea, w: 1.2 });
  f.note(lx(0), ly(0.9996) + 14, tr("fx-utm-k0", "k₀ = 0.9996"), { size: 10, c: C.globe, anchor: "middle" });
  f.note(X1, Y0 + 28, tr("fx-utm-1", "km from the zone's central meridian · scale k ≈ k₀(1 + x²/2R²)"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-utm-st", "at the equator"));
  return f;
}

/* Le T-O médiéval, en schéma : un symbole, pas une carte à l'échelle. */
function figTO(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-to-alt", "Schematic of a medieval T-O map: a circle of ocean, east at the top, divided by a T of waters into Asia above, Europe lower left and Africa lower right") });
  const cx = 110, cy = 100, r = 78;
  f.circle(cx, cy, r + 8, { c: C.sea, w: 1.6, fill: "#dcebf2" }); f.circle(cx, cy, r, { c: C.sea, w: 1.2, fill: "#efe6cf" });
  f.line(cx - r, cy, cx + r, cy, { c: C.sea, w: 4 }); f.line(cx, cy, cx, cy + r, { c: C.sea, w: 4 });
  f.note(cx, cy - 30, tr("fx-to-as", "Asia"), { size: 11, anchor: "middle", c: C.ink });
  f.note(cx - 38, cy + 40, tr("fx-to-eu", "Europe"), { size: 11, anchor: "middle", c: C.ink });
  f.note(cx + 38, cy + 40, tr("fx-to-af", "Africa"), { size: 11, anchor: "middle", c: C.ink });
  f.note(cx, cy - r - 12, tr("fx-to-e", "east (oriens) at the top"), { size: 9.5, anchor: "middle" });
  f.note(222, 60, tr("fx-to-1", "T: the Don and the Nile,"), { size: 9.5 });
  f.note(222, 74, tr("fx-to-2", "the Mediterranean as the stem"), { size: 9.5 });
  f.note(222, 110, tr("fx-to-3", "a diagram of the known"), { size: 9.5 });
  f.note(222, 124, tr("fx-to-4", "world's three parts, drawn"), { size: 9.5 });
  f.note(222, 138, tr("fx-to-5", "on the habitable quarter"), { size: 9.5 });
  f.note(222, 152, tr("fx-to-6", "of a sphere"), { size: 9.5 });
  stamp(f, tr, tr("fx-to-st", "symbolic, after Isidore"));
  return f;
}

export const FORMULA_FIGS = { mapFigBab: figBab, mapFxLocal: figLocal, mapFigErr: figErr, mapFxErat: figErat, mapFxMarinus: figMarinus,
  mapFxPtol: figPtolCone, mapFigTO: figTO, mapFxMerc: figMerc, mapFxTissot: figTissot, mapFxAE: figAE, mapFxPolar: figPolar, mapFxUTM: figUTM };
export function drawFormulaFigs(root, tr, vals) { return drawAll(root, FORMULA_FIGS, tr, vals, "map"); }
export { R_KM };
