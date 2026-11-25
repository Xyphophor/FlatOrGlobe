// Schémas des formules de l'onglet avia (demande du propriétaire du 2026-09-30 :
// « chaque formule doit avoir sa figure qui l'accompagne »). Un générateur FIG
// (src/core/fig.js, SVG) par bloc formule, monté dans l'hôte .figsym du bloc
// (id aviaFx*) au montage de l'onglet, AVANT renderTexIn (les libellés data-tex
// deviennent du MathML). Schématiques : chacun porte son tampon « not to scale »
// (règle 1) ; les seuls nombres écrits viennent de values.js (vals).
import { FIG, polar } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

/** Vol à niveau : la verticale tourne de θ = d/R ; un nez figé s'écarte de Δh. */
function figLevel(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-level-alt", "An aircraft flies an arc d around the Earth; the local vertical turns by the angle θ at the centre; an aircraft keeping its nose fixed follows the tangent and ends Δh higher") });
  const cx = 120, cy = 262, Rg = 150, Rf = 172, a0 = 105, a1 = 69, th = a0 - a1;
  f.path(`M${polar(cx, cy, Rg, 150).join(" ")}A${Rg} ${Rg} 0 0 1 ${polar(cx, cy, Rg, 40).join(" ")}`, { c: C.ground, w: 2.4 });
  f.path(`M${polar(cx, cy, Rf, 140).join(" ")}A${Rf} ${Rf} 0 0 1 ${polar(cx, cy, Rf, 45).join(" ")}`, { c: C.sea, w: 1.2, dash: "3 4" });
  const A = polar(cx, cy, Rf, a0), B = polar(cx, cy, Rf, a1), T = polar(cx, cy, Rf / Math.cos(th * Math.PI / 180), a1);
  f.path(`M${A.join(" ")}A${Rf} ${Rf} 0 0 1 ${B.join(" ")}`, { c: C.sea, w: 2.6 });
  f.line(cx, cy, ...A, { c: C.faint, w: 1 }); f.line(cx, cy, ...T, { c: C.faint, w: 1 });
  f.angle(cx, cy, 44, a1, a0, { label: "θ", tex: "\\theta", c: C.globe, pad: 12 });
  const ux = (T[0] - A[0]) / Math.hypot(T[0] - A[0], T[1] - A[1]), uy = (T[1] - A[1]) / Math.hypot(T[0] - A[0], T[1] - A[1]);
  f.dash(...A, T[0] + 36 * ux, T[1] + 36 * uy, { c: C.soft });
  f.seg(...B, ...T, { label: "Δh", tex: "\\Delta h", c: C.flat, side: 14 });
  f.dot(...A, { r: 4, c: C.ink }); f.dot(...B, { r: 4, c: C.sea }); f.dot(...T, { r: 3.5, c: C.soft });
  const m = polar(cx, cy, Rf + 13, (a0 + a1) / 2);
  f.txt(m[0], m[1], "d", { tex: "d", c: C.sea, anchor: "middle" });
  f.note(248, 100, tr("fx-level-1", "altitude held: along"), { size: 10, c: C.sea });
  f.note(248, 113, tr("fx-level-2", "the arc, the nose turns"), { size: 10, c: C.sea });
  f.note(248, 126, tr("fx-level-3", "by θ = d/(R + h)"), { size: 10, c: C.sea });
  f.note(248, 152, tr("fx-level-4", "nose locked to the"), { size: 10 });
  f.note(248, 165, tr("fx-level-5", "stars: the tangent,"), { size: 10 });
  f.note(248, 178, tr("fx-level-6", "ending Δh higher"), { size: 10 });
  f.note(10, 244, tr("fx-level-7", "θ: the angle at the Earth's centre"), { size: 9 });
  stamp(f, tr, tr("fx-level-s", "Earth drawn tiny"));
  return f;
}

/** Eötvös : vers l'est, l'avion tourne autour de l'axe plus vite que le sol. */
function figEot(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-eot-alt", "The Earth with its axis; at latitude φ a point circles the axis on a circle of radius R cos φ; an aircraft flying east adds its speed to the ground's rotation, one flying west subtracts it") });
  const cx = 110, cy = 128, r = 82, ph = 40 * Math.PI / 180;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.dash(cx, cy - r - 26, cx, cy + r + 14, { c: C.faint });
  f.arrow(cx, cy - r - 6, cx, cy - r - 30, { c: C.flat, w: 2, head: 8 });
  f.txt(cx + 12, cy - r - 20, "Ω", { tex: "\\Omega", c: C.flat, size: 13 });
  const y = cy - r * Math.sin(ph), rx = r * Math.cos(ph);
  f.ellipse(cx, y, rx, 11, { c: C.soft, w: 1.1 });
  const P = [cx, y + 11];
  f.seg(cx, y, cx + rx, y, { label: "R cos φ", tex: "R\\cos\\varphi", c: C.soft, side: -10 });
  f.line(cx, cy, cx + r * Math.cos(ph), cy - r * Math.sin(ph), { c: C.faint, w: 1 });
  f.angleAt(cx, cy, 30, [cx + r, cy], [cx + rx, y], { label: "φ", tex: "\\varphi", c: C.globe, pad: 11 });
  f.arrow(P[0], P[1], P[0] + 46, P[1], { c: C.globe, w: 2.4, head: 8 });
  f.txt(P[0] + 50, P[1] + 4, "v", { tex: "v_E", c: C.globe });
  f.dot(...P, { r: 3.5, c: C.ink });
  f.note(212, 60, tr("fx-eot-1", "east: faster round the"), { size: 10, c: C.globe });
  f.note(212, 73, tr("fx-eot-2", "axis, a lighter aircraft"), { size: 10, c: C.globe });
  f.note(212, 98, tr("fx-eot-3", "west: slower round it,"), { size: 10 });
  f.note(212, 111, tr("fx-eot-4", "a heavier aircraft"), { size: 10 });
  f.note(212, 136, tr("fx-eot-5", "any direction: v²/(R + h)"), { size: 10 });
  f.note(212, 149, tr("fx-eot-6", "for following the curve"), { size: 10 });
  f.note(212, 174, tr("fx-eot-7", "a plane: no axis to circle,"), { size: 10, c: C.flat });
  f.note(212, 187, tr("fx-eot-8", "no curve to follow: 0"), { size: 10, c: C.flat });
  stamp(f, tr, tr("fx-eot-s", "the aircraft's speed arrow is enlarged"));
  return f;
}

/** Ω et R tirés des mêmes lignes : Ω écarte les deux sens, R ne joue que par leur écart de vitesse. */
function figEotFit(tr, vals) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-jf-alt", "Two neighbouring survey lines, one flown east with the wind, one flown west against it, and the gap d between their readings; the rotation Ω pulls the two directions apart by thousands of mGal, the radius R acts only through their difference of speed; with a steady wind only Ω cos φ + w/R would show") });
  const E = "#1d4ed8", Wc = "#6d28d9", xa = 16, xb = 168;
  f.arrow(xa, 74, xb, 74, { c: E, w: 2.6, head: 8 });
  f.note(xa, 62, tr("fx-jf-1", "east, wind behind: a + w"), { size: 10, c: E });
  f.arrow(xb, 124, xa, 124, { c: Wc, w: 2.6, head: 8 });
  f.note(xa, 142, tr("fx-jf-2", "west, wind ahead: a − w"), { size: 10, c: Wc });
  f.seg(xb + 14, 74, xb + 14, 124, { label: "d", tex: "d", c: C.ink, side: 10 });
  f.note(xa, 172, tr("fx-jf-3", "10 km apart, the same air"), { size: 9.5 });
  f.note(xa, 186, tr("fx-jf-4", "and the same ground below"), { size: 9.5 });
  f.note(206, 44, tr("fx-jf-5", "Ω pulls the two directions"), { size: 10, c: C.globe });
  f.note(206, 57, `${tr("fx-jf-6", "apart by")} ${vals.jfTermOm ?? "…"}`, { size: 10, c: C.globe });
  f.note(206, 84, tr("fx-jf-7", "R acts only through their"), { size: 10, c: C.sea });
  f.note(206, 97, `${tr("fx-jf-8", "speed difference:")} ${vals.jfTermR ?? "…"}`, { size: 10, c: C.sea });
  f.note(206, 124, tr("fx-jf-9", "steady wind: only"), { size: 10 });
  f.note(206, 137, tr("fx-jf-10", "Ω cos φ + w/R would show"), { size: 10 });
  f.note(206, 164, tr("fx-jf-11", "the wind changes from line"), { size: 10 });
  f.note(206, 177, tr("fx-jf-12", "to line: Ω and R come apart"), { size: 10 });
  stamp(f, tr, tr("fx-jf-s", "schematic"));
  return f;
}

/** Gyroscopes : Ω se partage en Ω sin φ (vertical) et Ω cos φ (vers le nord vrai). */
function figGyro(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-gyro-alt", "The Earth's rotation Ω, parallel to its axis, splits at an airport of latitude φ into a vertical part Ω sin φ and a horizontal part Ω cos φ pointing to true north") });
  const cx = 82, cy = 118, r = 64, ph = 40;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.dash(cx, cy - r - 20, cx, cy + r + 12, { c: C.faint });
  f.arrow(cx, cy - r - 4, cx, cy - r - 26, { c: C.flat, w: 2, head: 7 });
  f.txt(cx + 9, cy - r - 16, "Ω", { tex: "\\Omega", c: C.flat, size: 12 });
  const P = polar(cx, cy, r, ph);
  f.line(cx, cy, ...P, { c: C.faint, w: 1 });
  f.angleAt(cx, cy, 26, [cx + r, cy], P, { label: "φ", tex: "\\varphi", c: C.globe, pad: 10 });
  f.dot(...P, { r: 4, c: C.ink });
  f.note(cx, cy + r + 26, tr("fx-gyro-1", "the airport"), { size: 9.5, anchor: "middle" });
  // la décomposition au sol, agrandie
  const S = [210, 168], L = 118, a = ph * Math.PI / 180;
  f.dash(P[0] + 6, P[1], S[0] - 14, S[1] - 6, { c: C.faint, dash: "2 3" });
  f.ground(S[1], 180, 370);
  f.note(362, S[1] + 16, tr("fx-gyro-2", "true north →"), { size: 9.5, anchor: "end" });
  const A = [S[0] + L * Math.cos(a), S[1] - L * Math.sin(a)];
  f.arrow(...S, ...A, { c: C.flat, w: 2.2, head: 8 });
  f.txt(A[0] + 8, A[1] - 2, "Ω", { tex: "\\Omega", c: C.flat, size: 12 });
  f.arrow(...S, S[0], S[1] - L * Math.sin(a), { c: "#6d28d9", w: 2.6, head: 8 });
  f.txt(S[0] - 6, S[1] - L * Math.sin(a) / 2, "Ω sin φ", { tex: "\\Omega\\sin\\varphi", c: "#6d28d9", anchor: "end", size: 11 });
  f.arrow(...S, S[0] + L * Math.cos(a), S[1], { c: C.globe, w: 2.6, head: 8 });
  f.txt(S[0] + L * Math.cos(a) / 2, S[1] + 16, "Ω cos φ", { tex: "\\Omega\\cos\\varphi", c: C.globe, anchor: "middle", size: 11 });
  f.dash(S[0] + L * Math.cos(a), S[1], ...A, { c: C.faint, dash: "3 3" });
  f.dash(S[0], S[1] - L * Math.sin(a), ...A, { c: C.faint, dash: "3 3" });
  f.angleAt(...S, 36, [S[0] + 60, S[1]], A, { label: "φ", tex: "\\varphi", c: C.globe, pad: 11 });
  f.note(178, 200, tr("fx-gyro-3", "south of the equator Ω sin φ"), { size: 9.5 });
  f.note(178, 212, tr("fx-gyro-4", "points down: the drift reverses"), { size: 9.5 });
  stamp(f, tr, tr("fx-gyro-s", "arrow lengths carry no units"));
  return f;
}

/** Schuler : un pendule long comme le rayon terrestre ; sur un plan, l'erreur de la centrale. */
function figSchuler(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-sch-alt", "Left: a pendulum hanging from an aircraft down to the Earth's centre keeps pointing down wherever the aircraft goes. Right: on a plane, the position computed by a globe-programmed unit swings around the departure point while the true position runs away in a straight line") });
  const cx = 88, cy = 140, r = 66;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  for (const deg of [90, 45]) {
    const p = polar(cx, cy, r + 14, deg);
    f.line(...p, cx, cy, { c: C.ink, w: 1.2 });
    f.dot(...p, { r: 3.5, c: C.ink });
  }
  f.circle(cx, cy, 6, { c: C.ink, w: 1.6, fill: "#fff" });
  f.seg(cx - 12, cy - r - 14, cx - 12, cy, { label: "R", tex: "R", c: C.soft, side: 10 });
  f.note(cx, cy + r + 18, tr("fx-sch-1", "a pendulum of length R"), { size: 9.5, anchor: "middle" });
  f.note(cx, cy + r + 30, tr("fx-sch-2", "always hangs straight down"), { size: 9.5, anchor: "middle" });
  // à droite : sur un plan, la position calculée oscille, la vraie s'en va
  const ox = 200, oy = 150, w = 165, h = 110;
  f.axes(ox, oy, w, h, { x: "t", y: tr("fx-sch-3", "distance") });
  f.line(ox, oy, ox + w - 10, oy - h + 10, { c: C.ink, w: 1.6 });
  f.note(ox + w - 12, oy - h + 6, tr("fx-sch-4", "true: v·t"), { size: 9.5, anchor: "end", c: C.ink });
  let d = "";
  for (let i = 0; i <= 60; i++) { const x = ox + (i / 60) * (w - 10), y = oy - 22 * Math.sin((i / 60) * 2 * Math.PI * 1.6); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
  f.path(d, { c: C.flat, w: 2 });
  f.note(ox + 4, oy + 28, tr("fx-sch-5", "computed on a plane: ±v/ω_s"), { size: 9.5, c: C.flat });
  stamp(f, tr, tr("fx-sch-s", "shapes only"));
  return f;
}

/** EI-GJT : l'horizon affiché est celui du point où la centrale se croit. */
function figGjt(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-gjt-alt", "The true position and the position computed by the faulty unit on a circle, separated by the angle Δσ at the centre; the unit draws the horizon of its own position, tilted by Δσ from the true horizon") });
  const cx = 120, cy = 150, r = 88, aT = 100, aI = 40, ds = aT - aI;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  const T = polar(cx, cy, r, aT), I = polar(cx, cy, r, aI);
  f.line(cx, cy, ...T, { c: C.faint, w: 1 }); f.line(cx, cy, ...I, { c: C.faint, w: 1 });
  f.angle(cx, cy, 30, aI, aT, { label: "Δσ", tex: "\\Delta\\sigma", c: C.globe, pad: 14 });
  const tan = (P, deg, L, o) => { const u = [Math.cos((deg - 90) * Math.PI / 180), -Math.sin((deg - 90) * Math.PI / 180)]; f.line(P[0] - u[0] * L, P[1] - u[1] * L, P[0] + u[0] * L, P[1] + u[1] * L, o); };
  tan(T, aT, 52, { c: C.ink, w: 1.8 }); tan(I, aI, 36, { c: C.flat, w: 1.4, dash: "4 3" });
  tan(T, aI, 52, { c: C.flat, w: 2 });
  f.dot(...T, { r: 4.5, c: C.ink }); f.dot(...I, { r: 4.5, c: C.flat });
  f.note(T[0] - 8, T[1] - 26, tr("fx-gjt-1", "true position"), { size: 9.5, anchor: "end", c: C.ink });
  f.note(I[0] + 10, I[1] + 4, tr("fx-gjt-2", "where the unit thinks it is"), { size: 9.5, c: C.flat });
  f.note(222, 36, tr("fx-gjt-3", "black: the real horizon"), { size: 10, c: C.ink });
  f.note(222, 50, tr("fx-gjt-4", "orange: the horizon shown,"), { size: 10, c: C.flat });
  f.note(222, 63, tr("fx-gjt-5", "that of the wrong position,"), { size: 10, c: C.flat });
  f.note(222, 76, tr("fx-gjt-6", "tilted by Δσ"), { size: 10, c: C.flat });
  stamp(f, tr, tr("fx-gjt-s", "the two positions are drawn close"));
  return f;
}

/** Distances : l'arc du globe, la corde du disque (loi des cosinus depuis le pôle). */
function figDist(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-dist-alt", "Left: on the globe the distance is the arc R θ between two airports, θ being the angle at the centre. Right: on the flat disc each airport sits at a distance r from the north pole, and the distance is the straight chord between them, from r1, r2 and the difference of longitude Δλ") });
  const gx = 92, gy = 116, gr = 70;
  f.circle(gx, gy, gr, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  const A = polar(gx, gy, gr, 150), B = polar(gx, gy, gr, 30);
  f.line(gx, gy, ...A, { c: C.faint, w: 1 }); f.line(gx, gy, ...B, { c: C.faint, w: 1 });
  f.path(`M${A.join(" ")}A${gr} ${gr} 0 0 1 ${B.join(" ")}`, { c: C.sea, w: 3 });
  f.angle(gx, gy, 24, 30, 150, { label: "θ", tex: "\\theta", c: C.globe, pad: 10 });
  f.dot(...A, { r: 3.5 }); f.dot(...B, { r: 3.5 });
  f.note(gx, gy + gr + 20, tr("fx-dist-1", "globe: d = R θ"), { size: 10, anchor: "middle", c: C.sea });
  const fx = 285, fy = 116, fr = 80;
  f.circle(fx, fy, fr, { c: C.flat, w: 1.4, fill: "#f6efe4" });
  f.dot(fx, fy, { r: 3, c: C.ink });
  f.note(fx + 5, fy + 13, "N", { size: 9.5 });
  const P = polar(fx, fy, 64, 205), Q = polar(fx, fy, 50, 320);
  f.line(fx, fy, ...P, { c: C.soft, w: 1.2 }); f.line(fx, fy, ...Q, { c: C.soft, w: 1.2 });
  f.txt((fx + P[0]) / 2 - 4, (fy + P[1]) / 2 - 6, "r₁", { tex: "r_1", c: C.soft, anchor: "middle", size: 11 });
  f.txt((fx + Q[0]) / 2 + 10, (fy + Q[1]) / 2 - 4, "r₂", { tex: "r_2", c: C.soft, anchor: "middle", size: 11 });
  f.angle(fx, fy, 20, 205, 320, { label: "Δλ", tex: "\\Delta\\lambda", c: C.flat, pad: 12 });
  f.line(...P, ...Q, { c: C.flat, w: 3 });
  f.dot(...P, { r: 3.5 }); f.dot(...Q, { r: 3.5 });
  f.note(fx, fy + fr + 16, tr("fx-dist-2", "flat disc: the chord"), { size: 10, anchor: "middle", c: C.flat });
  stamp(f, tr, tr("fx-dist-s", "schematic"));
  return f;
}

/** Le meilleur plan libre : quatre villes équidistantes, possibles sur une sphère, pas sur un plan. */
function figSprings(tr, vals) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-spr-alt", "Four cities can all be the same distance apart on a sphere, at the corners of a tetrahedron; on a plane they cannot: with three at the corners of a triangle, the fourth in the middle is too close to all three, and its springs are squeezed") });
  const gx = 82, gy = 112, gr = 62;
  f.circle(gx, gy, gr, { c: C.sea, w: 1.4, fill: "#eef6f4" });
  const pts = [[gx, gy - 38], [gx - 44, gy + 28], [gx + 44, gy + 28], [gx + 6, gy + 6]];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) f.line(...pts[i], ...pts[j], { c: C.sea, w: 1.4, dash: i === 3 || j === 3 ? "3 3" : undefined });
  pts.forEach((p) => f.dot(...p, { r: 3.5 }));
  f.note(gx, gy + gr + 18, tr("fx-spr-1", "sphere: all six equal"), { size: 10, anchor: "middle", c: C.sea });
  f.note(gx, gy + gr + 31, `(${vals.tetraKm})`, { size: 9.5, anchor: "middle" });
  const cx = 276, cy = 120, L = 150, hgt = L * Math.sqrt(3) / 2;
  const T = [[cx, cy - hgt * 2 / 3], [cx - L / 2, cy + hgt / 3], [cx + L / 2, cy + hgt / 3]];
  const spring = (p, q, col) => {
    const n = 9, dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
    let d = `M${p[0]} ${p[1]}`;
    for (let i = 1; i < n; i++) { const t = i / n, s = i % 2 ? 4 : -4; d += `L${p[0] + dx * t - uy * s} ${p[1] + dy * t + ux * s}`; }
    f.path(d + `L${q[0]} ${q[1]}`, { c: col, w: 1.6 });
  };
  for (let i = 0; i < 3; i++) spring(T[i], T[(i + 1) % 3], C.sea);
  for (const p of T) spring([cx, cy], p, C.globe);
  T.forEach((p) => f.dot(...p, { r: 3.5 })); f.dot(cx, cy, { r: 3.5 });
  f.note(cx, cy + hgt / 3 + 22, tr("fx-spr-2", "plane: the middle springs"), { size: 10, anchor: "middle", c: C.globe });
  f.note(cx, cy + hgt / 3 + 35, tr("fx-spr-3", "squeezed to 58 % of their length"), { size: 10, anchor: "middle", c: C.globe });
  stamp(f, tr, tr("fx-spr-s", "schematic"));
  return f;
}

/** Rayon tiré des temps de vol : t = t0 + Rθ/v ; le vent n'annule pas tout. */
function figRadius(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-rad-alt", "Two airports separated by the angle θ at the Earth's centre; the flight covers the arc R θ at the true airspeed v. Out with a tailwind at v + w and back into a headwind at v − w, the average time is longer than with no wind") });
  const cx = 100, cy = 150, r = 86;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  const A = polar(cx, cy, r, 130), B = polar(cx, cy, r, 50);
  f.line(cx, cy, ...A, { c: C.faint, w: 1 }); f.line(cx, cy, ...B, { c: C.faint, w: 1 });
  f.path(`M${A.join(" ")}A${r} ${r} 0 0 1 ${B.join(" ")}`, { c: C.sea, w: 3 });
  f.angle(cx, cy, 26, 50, 130, { label: "θ", tex: "\\theta", c: C.globe, pad: 10 });
  f.seg(cx, cy, ...polar(cx, cy, r, 90), { label: "R", tex: "R", c: C.soft, side: 10 });
  f.dot(...A, { r: 3.5 }); f.dot(...B, { r: 3.5 });
  const m = polar(cx, cy, r + 14, 90);
  f.txt(m[0], m[1], "Rθ", { tex: "R\\theta", c: C.sea, anchor: "middle" });
  const x0 = 220, x1 = 360;
  f.arrow(x0, 70, x1, 70, { c: C.globe, w: 2.2, head: 8 });
  f.note(x0, 60, tr("fx-rad-1", "out, tailwind: v + w"), { size: 10, c: C.globe });
  f.arrow(x1, 110, x0, 110, { c: C.flat, w: 2.2, head: 8 });
  f.note(x0, 100, tr("fx-rad-2", "back, headwind: v − w"), { size: 10, c: C.flat });
  f.note(x0, 140, tr("fx-rad-3", "the slow leg lasts longer:"), { size: 10 });
  f.note(x0, 153, tr("fx-rad-4", "the average time is always"), { size: 10 });
  f.note(x0, 166, tr("fx-rad-5", "longer than with no wind"), { size: 10 });
  stamp(f, tr, tr("fx-rad-s", "schematic"));
  return f;
}

/**
 * La corde (2026-10-01, propriétaire : « on a l'impression que l'avion lutte pour ne pas
 * aller dans l'espace ; fais un parallèle avec un objet tenu par une corde »). À gauche
 * une pierre qu'on fait tourner : la corde la tire vers la main, sinon elle part tout
 * droit. À droite l'avion : la corde, c'est la gravité, et elle est mille fois trop forte.
 */
function figRope(tr, vals) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-rope-alt", "Left: a stone swung on a rope; the rope pulls it towards the hand, and if the rope is cut the stone leaves in a straight line along the tangent. Right: an airliner around the Earth; gravity plays the part of the rope, pulling towards the centre; the wings hold up almost all of the weight, and the small remainder bends the path into the circle") });
  // pierre et corde
  const hx = 88, hy = 128, r = 58, a = 50;
  f.circle(hx, hy, r, { c: C.faint, w: 1, dash: "3 4" });
  const S = polar(hx, hy, r, a);
  f.line(hx, hy, ...S, { c: C.ink, w: 1.6 });
  f.dot(hx, hy, { r: 5, c: C.soft });
  f.dot(...S, { r: 7, c: C.sea });
  const ti = polar(S[0], S[1], 26, a + 180);
  f.arrow(...S, ...ti, { c: C.globe, w: 2.2, head: 7 });
  f.txt(ti[0] - 4, ti[1] + 16, "T", { tex: "T", c: C.globe });
  const tg = polar(S[0], S[1], 62, a + 90);             // la pierre tourne dans le sens direct
  f.dash(...S, ...tg, { c: C.soft });
  f.note(hx, hy + r + 20, tr("fx-rope-1", "the rope pulls the stone"), { size: 10, anchor: "middle", c: C.globe });
  f.note(hx, hy + r + 33, tr("fx-rope-2", "towards the hand"), { size: 10, anchor: "middle", c: C.globe });
  f.note(tg[0] - 30, tg[1] - 8, tr("fx-rope-3", "rope cut: straight on"), { size: 9.5 });
  // avion et gravité
  const cx = 290, cy = 300, Rg = 190, Rf = 212, b = 90;
  f.path(`M${polar(cx, cy, Rg, 118).join(" ")}A${Rg} ${Rg} 0 0 1 ${polar(cx, cy, Rg, 62).join(" ")}`, { c: C.ground, w: 2.4 });
  f.path(`M${polar(cx, cy, Rf, 116).join(" ")}A${Rf} ${Rf} 0 0 1 ${polar(cx, cy, Rf, 64).join(" ")}`, { c: C.sea, w: 1.4, dash: "3 4" });
  const P = polar(cx, cy, Rf, b);
  f.dot(...P, { r: 5, c: C.sea });
  f.arrow(P[0], P[1], P[0], P[1] + 56, { c: C.globe, w: 2.4, head: 8 });
  f.txt(P[0] + 8, P[1] + 52, "mg", { tex: "mg", c: C.globe });
  f.arrow(P[0] - 3, P[1], P[0] - 3, P[1] - 54, { c: C.sea, w: 2.2, head: 8 });
  f.txt(P[0] - 12, P[1] - 44, "L", { tex: "L", c: C.sea, anchor: "end" });
  f.note(cx, cy - Rg + 44, tr("fx-rope-4", "gravity is the rope"), { size: 10, anchor: "middle", c: C.globe });
  f.note(cx, cy - Rg + 57, `${tr("fx-rope-5", "only")} ${vals.cent || "0.1 %"} ${tr("fx-rope-6", "of it bends the path")}`, { size: 10, anchor: "middle", c: C.globe });
  f.note(cx, cy - Rg + 70, tr("fx-rope-7", "the wings hold up the rest"), { size: 10, anchor: "middle", c: C.sea });
  stamp(f, tr, tr("fx-rope-s", "schematic"));
  return f;
}

/**
 * Le tour du monde est-ouest (2026-10-01) : un parallèle mesure 2πR·cos φ sur le globe,
 * 2πR·(π/2 − φ) sur le disque, où il est d'autant plus long qu'il est au sud ; et le pôle
 * sud, que les vols nord-sud survolent, est tout le bord du disque.
 */
function figWorld(tr) {
  const f = FIG.make({ w: 380, h: 246, alt: tr("fx-world-alt", "Left: a globe with the parallel at 35 degrees south, a small circle of radius R cos φ, and a meridian through both poles. Right: the flat disc centred on the North Pole; the same parallel is a large circle near the rim, of radius R times (90° − φ); the South Pole is the whole rim") });
  const gx = 92, gy = 122, gr = 72, ph = -35 * Math.PI / 180;
  f.circle(gx, gy, gr, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.ellipse(gx, gy, gr, gr * 0.22, { c: C.faint, w: 1 });
  const py = gy - gr * Math.sin(ph), prx = gr * Math.cos(ph);
  f.ellipse(gx, py, prx, prx * 0.22, { c: C.globe, w: 2.2 });
  f.line(gx, gy - gr, gx, gy + gr, { c: C.flat, w: 1.6, dash: "4 3" });
  f.dot(gx, gy - gr, { r: 3.5 }); f.dot(gx, gy + gr, { r: 3.5 });
  f.note(gx + 6, gy - gr - 6, tr("fx-world-np", "N pole"), { size: 9.5 });
  f.note(gx + 6, gy + gr + 13, tr("fx-world-sp", "S pole: one point"), { size: 9.5 });
  f.txt(gx, py - prx * 0.22 - 7, "2πR cos φ", { tex: "2\\pi R\\cos\\varphi", c: C.globe, size: 11, anchor: "middle" });
  const dx = 282, dy = 122, dr = 86;
  f.circle(dx, dy, dr, { c: C.flat, w: 2.4, fill: "#f6efe4" });
  f.circle(dx, dy, dr / 2, { c: C.faint, w: 1 });
  const rr = dr * (90 - (-35)) / 180;
  f.circle(dx, dy, rr, { c: C.globe, w: 2.2 });
  f.dot(dx, dy, { r: 3.5 });
  f.note(dx + 5, dy - 5, tr("fx-world-np", "N pole"), { size: 9.5 });
  f.line(dx, dy - dr, dx, dy + dr, { c: C.flat, w: 1.6, dash: "4 3" });
  f.txt(dx, dy + dr + 16, "2πR(π/2 − φ)", { tex: "2\\pi R\\,(\\pi/2 - \\varphi)", c: C.globe, size: 11, anchor: "middle" });
  f.note(dx, dy - dr - 8, tr("fx-world-rim", "S pole: the whole rim"), { size: 9.5, anchor: "middle", c: C.flat });
  f.note(10, 240, tr("fx-world-1", "blue: the parallel at 35°S on each map"), { size: 9 });
  stamp(f, tr, tr("fx-world-s", "schematic"));
  return f;
}

/** Le maillage (2026-11-25) : deux aéroports sur un plan (d = |x_a − x_b|) et sur une sphère de rayon libre (d = R ω). */
function figMesh(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-mesh-alt", "Left: two airports on a plane, the route's length is the straight line between them. Right: the same two airports on a sphere whose radius R is free, the route's length is the arc R omega, omega being the angle between them seen from the centre; a very large sphere is the plane again") });
  // le plan : une feuille en perspective, deux aéroports, la droite
  f.path("M14 150 L150 150 L176 104 L40 104 Z", { c: C.flat, w: 1.2, fill: "#fbf1e1" });
  const A = [58, 136], B = [140, 116];
  f.line(...A, ...B, { c: C.flat, w: 2 }); f.dot(...A, { r: 3.5 }); f.dot(...B, { r: 3.5 });
  f.note(A[0] - 6, A[1] + 4, "a", { size: 10, anchor: "end" }); f.note(B[0] + 6, B[1] - 2, "b", { size: 10 });
  f.note(96, 172, tr("fx-mesh-1", "plane: d = |xₐ − x_b|"), { size: 10, anchor: "middle", c: C.flat });
  // la sphère : centre, deux rayons, l'arc R ω
  const cx = 282, cy = 118, r = 62, a1 = -112 * Math.PI / 180, a2 = -48 * Math.PI / 180;
  f.circle(cx, cy, r, { c: C.sea, w: 1.3, fill: "#eef6f4" });
  const P = (a, rr = r) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  f.line(cx, cy, ...P(a1), { c: C.soft, w: 1, dash: "3 3" }); f.line(cx, cy, ...P(a2), { c: C.soft, w: 1, dash: "3 3" });
  let d = ""; for (let i = 0; i <= 24; i++) { const q = P(a1 + (a2 - a1) * i / 24); d += `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }
  f.path(d, { c: C.globe, w: 2.2 }); f.dot(...P(a1), { r: 3.5 }); f.dot(...P(a2), { r: 3.5 });
  let w = ""; for (let i = 0; i <= 12; i++) { const q = P(a1 + (a2 - a1) * i / 12, 16); w += `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }
  f.path(w, { c: C.ink, w: 1 }); f.note(...P((a1 + a2) / 2, 26), "ω", { size: 11, anchor: "middle" });
  f.dot(cx, cy, { r: 2 }); f.note(cx - 4, cy + 30, "R ?", { size: 10.5, anchor: "end", c: C.globe });
  f.line(cx, cy, cx - 44, cy + 44, { c: C.globe, w: 1 });
  f.note(cx, cy + r + 22, tr("fx-mesh-2", "sphere: d = R ω, R free"), { size: 10, anchor: "middle", c: C.globe });
  f.note(190, 206, tr("fx-mesh-3", "one number more: R → ∞ is the plane again"), { size: 9.5, anchor: "middle" });
  stamp(f, tr, tr("fx-mesh-s", "schematic"));
  return f;
}

export const FORMULA_FIGS = {
  aviaFxLevel: figLevel, aviaFxRope: figRope, aviaFxWorld: figWorld, aviaFxEot: figEot, aviaFxEotFit: figEotFit, aviaFxGyro: figGyro, aviaFxSchuler: figSchuler,
  aviaFxGjt: figGjt, aviaFxDist: figDist, aviaFxSprings: figSprings, aviaFxRadius: figRadius, aviaFxMesh: figMesh,
};

/** Dessine chaque schéma dans son hôte (s'il existe) ; renvoie le nombre de schémas montés. */
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "avia"); }
