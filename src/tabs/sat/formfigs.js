// Figures de l'onglet sat (epic27, 2026-10-16) : un schéma par formule, et les tracés des données
// (src/data/presets/sat-doppler.js, fog build sat-doppler).
import { figFitBox, fbNum, pearson } from "../../core/fitbox.js";
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { SAT_DOPPLER as D } from "../../data/presets/sat-doppler.js";
import { keptStations, keptSats, ellipse } from "./logic.js";

const C = FIG.C;
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
const SYS = { G: { c: C.globe, n: "GPS" }, E: { c: C.sea, n: "Galileo" }, R: { c: C.flat, n: "GLONASS" } };

// Doppler d'un passage : montant il approche, au plus près rien, descendant il s'éloigne.
function figDop(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-dop-alt", "A satellite crossing the sky over a receiver. While it rises its velocity has a part toward the receiver and the carrier is heard higher; at its nearest point the motion is across the line of sight; while it sets the part is away from the receiver and the carrier is heard lower") });
  const cx = 190, cy = 330, R = 210, rs = 300;
  f.path(`M${cx - 150} ${(cy - Math.sqrt(R * R - 150 * 150)).toFixed(1)}A${R} ${R} 0 0 1 ${cx + 150} ${(cy - Math.sqrt(R * R - 150 * 150)).toFixed(1)}`, { c: C.ground, w: 2.4 });
  f.path(`M${cx - 200} ${(cy - Math.sqrt(rs * rs - 200 * 200)).toFixed(1)}A${rs} ${rs} 0 0 1 ${cx + 200} ${(cy - Math.sqrt(rs * rs - 200 * 200)).toFixed(1)}`, { c: C.sea, w: 1.2, dash: "4 3" });
  const P = [cx, cy - R];
  f.dot(P[0], P[1], { r: 4 });
  for (const [x, lab] of [[-150, tr("fx-dop-1", "rising: closer, higher pitch")], [0, tr("fx-dop-2", "nearest: no shift")], [150, tr("fx-dop-3", "setting: farther, lower pitch")]]) {
    const y = cy - Math.sqrt(rs * rs - x * x), sx = cx + x, ang = Math.atan2(x, Math.sqrt(rs * rs - x * x));
    const vx = Math.cos(ang), vy = Math.sin(ang);
    f.dot(sx, y, { r: 4, c: C.globe });
    f.line(P[0], P[1], sx, y, { c: C.faint, w: 1 });
    f.arrow(sx, y, sx + 40 * vx, y + 40 * vy, { c: C.globe });
    f.note(x === 0 ? sx + 8 : sx + (x < 0 ? -4 : 4), y + (x === 0 ? 16 : 22), lab, { size: 9.5, anchor: x < 0 ? "start" : x > 0 ? "end" : "start" });
  }
  f.note(8, 214, tr("fx-dop-4", "range rate = −λ × Doppler shift; λ = 19.03 cm at 1575.42 MHz"), { size: 9.5 });
  stamp(f, tr, tr("fx-dop-st", "orbit far too low"));
  return f;
}

// Le modèle : centre, satellite et sa vitesse, récepteur tournant à Ω, ligne de visée u.
function figModel(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-model-alt", "The centre of attraction, a satellite on its orbit with its velocity, a receiver on a body turning about an axis with its own velocity, and the line of sight between them; the measured speed is the difference of the two velocities along that line") });
  const cx = 130, cy = 110, R = 48, rs = 94;
  f.circle(cx, cy, rs, { c: C.sea, w: 1.2, dash: "4 3" });
  f.circle(cx, cy, R, { c: C.ground, w: 1.6 });
  f.line(cx - 5, cy, cx + 5, cy, { c: C.ink, w: 1.4 }); f.line(cx, cy - 5, cx, cy + 5, { c: C.ink, w: 1.4 });
  f.angle(cx, cy, 22, 100, 210, { c: C.soft }); f.note(cx - 30, cy - 14, "Ω", { size: 11 });
  const sa = 25 * Math.PI / 180, S = [cx + rs * Math.cos(sa), cy - rs * Math.sin(sa)], pa = 70 * Math.PI / 180, Pp = [cx + R * Math.cos(pa), cy - R * Math.sin(pa)];
  f.dot(S[0], S[1], { r: 4.5, c: C.globe }); f.arrow(S[0], S[1], S[0] - 40 * Math.sin(sa), S[1] - 40 * Math.cos(sa), { c: C.globe }); f.note(S[0] - 40 * Math.sin(sa) - 4, S[1] - 40 * Math.cos(sa) - 4, "v_s", { size: 10.5, anchor: "end" });
  f.dot(Pp[0], Pp[1], { r: 4 }); f.arrow(Pp[0], Pp[1], Pp[0] - 22 * Math.sin(pa), Pp[1] - 22 * Math.cos(pa), { c: C.ink }); f.note(Pp[0] - 26, Pp[1] - 14, "v_p", { size: 10.5, anchor: "end" });
  f.line(Pp[0], Pp[1], S[0], S[1], { c: C.flat, w: 1.2, dash: "3 3" }); f.note((Pp[0] + S[0]) / 2 + 6, (Pp[1] + S[1]) / 2 - 4, "u", { size: 11, c: C.flat });
  f.note(250, 60, tr("fx-model-1", "unknown: every orbit,"), { size: 10 }); f.note(250, 76, tr("fx-model-2", "every receiver, GM, Ω"), { size: 10 });
  f.note(250, 100, tr("fx-model-3", "measured: ρ̇ only"), { size: 10, c: C.globe });
  f.note(8, 224, tr("fx-model-4", "ρ̇ = u · (v_s − v_p), plus the receiver's clock rate"), { size: 9.5 });
  stamp(f, tr, tr("fx-model-st", "schematic"));
  return f;
}

// La convergence depuis le plan : rms (log) et étendue des distances au centre, par itération.
function figConv(tr) {
  const H = D.history, f = FIG.make({ w: 380, h: 220, alt: tr("fx-conv-alt", "Iteration by iteration from the flat start, the unexplained speed falls from hundreds of metres per second to millimetres per second, while the receivers' distances from the centre of the orbits, spread over thousands of kilometres at the start, gather near 6,370 kilometres") });
  const X0 = 48, X1 = 330, Y0 = 186, Y1 = 26, n = H.length - 1;
  const x = (i) => X0 + (i / Math.max(1, n)) * (X1 - X0), ly = (v) => Y0 - (Math.log10(v) + 3) / 6 * (Y0 - Y1);
  for (const e of [-3, -2, -1, 0, 1, 2, 3]) { f.dash(X0, ly(10 ** e), X1, ly(10 ** e), { c: "#e7e3da" }); f.note(X0 - 4, ly(10 ** e) + 4, e >= 0 ? String(10 ** e) : `10${["⁻³", "⁻²", "⁻¹"][e + 3]}`, { anchor: "end", size: 9 }); }
  f.path(poly(H.map((h, i) => [x(i), ly(h.rms)])), { c: C.globe, w: 1.8 });
  H.forEach((h, i) => f.dot(x(i), ly(h.rms), { r: 2.5, c: C.globe }));
  // étendue des rayons, échelle de droite : 0 à la plus grande distance du départ
  const rTop = Math.ceil(Math.max(...H.flatMap((h) => h.r)) / 5000) * 5000, ry = (r) => Y0 - (r / rTop) * (Y0 - Y1);
  H.forEach((h, i) => { const lo = Math.min(...h.r), hi = Math.max(...h.r); f.line(x(i), ry(lo), x(i), ry(hi), { c: C.flat, w: 3 }); });
  for (const v of [0, 6371, rTop]) f.note(X1 + 6, ry(v) + 4, `${v.toLocaleString("en")}`, { size: 9 });
  f.note(X0, Y0 + 14, tr("fx-conv-1", "start"), { size: 9.5 }); f.note(X1, Y0 + 14, tr("fx-conv-2", "iterations →"), { size: 9.5, anchor: "end" });
  f.note(4, 214, tr("fx-conv-3", "blue: unexplained speed, m/s (log) · orange: distances to the centre, km"), { size: 9 });
  axesStamp(f, tr, tr("fx-conv-st", "two axes"));
  return f;
}

// L'ellipse : a, b, φ, r.
function figEll(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-ell-alt", "A meridian section of a flattened Earth: the equatorial radius a is longer than the polar radius b; a point at geocentric latitude phi lies at a distance r from the centre between the two") });
  const cx = 150, cy = 105, a = 120, b = 88;
  f.ellipse(cx, cy, a, b, { c: C.ground, w: 2 }); f.circle(cx, cy, a, { c: C.faint, w: 1, dash: "3 3" });
  f.seg(cx, cy + 6, cx + a, cy + 6, { label: "a", c: C.soft, side: 10 });
  f.seg(cx - 6, cy, cx - 6, cy - b, { label: "b", c: C.soft, side: -10 });
  const ph = 40 * Math.PI / 180, rr = 1 / Math.sqrt((Math.cos(ph) / a) ** 2 + (Math.sin(ph) / b) ** 2);
  const P = [cx + rr * Math.cos(ph), cy - rr * Math.sin(ph)];
  f.line(cx, cy, P[0], P[1], { c: C.globe, w: 1.6 }); f.dot(P[0], P[1], { r: 4, c: C.globe }); f.note(P[0] + 6, P[1] - 4, "r", { size: 11, c: C.globe });
  f.angle(cx, cy, 30, 0, 40, { label: "φ", c: C.ink, pad: 10 });
  f.note(290, 80, "f = (a − b)/a", { size: 10.5 }); f.note(290, 98, tr("fx-ell-1", "Earth: 1/298"), { size: 10 });
  f.note(8, 204, tr("fx-ell-2", "r(φ) ≈ a (1 − f sin²φ)"), { size: 9.5 });
  stamp(f, tr, tr("fx-ell-st", "flattening ×80"));
  return f;
}

// Les distances au centre contre la latitude, et l'ellipse ajustée.
function figBall(tr) {
  const f = FIG.make({ w: 380, h: 320, alt: tr("fx-ball-alt", "Each receiver's distance from the centre of the orbits against its latitude: the points follow an ellipse, about 6,378 kilometres at the equator and 6,357 near the poles, a few points higher for receivers on high plateaus") });
  const X0 = 50, X1 = 368, Y0 = 190, Y1 = 26, lo = 6350, hi = 6385;
  const x = (la) => X0 + (la + 90) / 180 * (X1 - X0), y = (r) => Y0 - (r - lo) / (hi - lo) * (Y0 - Y1);
  for (const v of [6350, 6360, 6370, 6380]) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, v.toLocaleString("en"), { anchor: "end", size: 9 }); }
  for (const la of [-90, -45, 0, 45, 90]) f.note(x(la), Y0 + 14, `${la}°`, { anchor: "middle", size: 9 });
  const E = ellipse(keptStations(D)), pts = [];
  for (let la = -90; la <= 90; la += 3) pts.push([x(la), y(E.a * (1 - E.f * Math.sin(la * Math.PI / 180) ** 2))]);
  f.path(poly(pts), { c: C.globe, w: 1.6 });
  for (const s of D.stations) f.dot(x(s.lat), y(Math.min(hi, s.r)), { r: 3, c: s.drop ? C.faint : C.ink });
  f.note(4, 224, tr("fx-ball-1", "distance from the centre of the orbits (km) against latitude"), { size: 9.5 });
  // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : une ellipse ajustée, pas une droite ; dispersion = rms des distances
  const kept = keptStations(D), rms = Math.sqrt(kept.reduce((q, s) => q + (s.r - E.a * (1 - E.f * Math.sin(s.lat * Math.PI / 180) ** 2)) ** 2, 0) / kept.length);
  figFitBox(f, X1, 236, { R: `${fbNum(E.a, 1)} km`, r: pearson(kept.map((s) => Math.sin(s.lat * Math.PI / 180) ** 2), kept.map((s) => s.r)), rOf: "r, sin²φ", scatter: `${fbNum(rms, 2)} km rms`, chi2nu: null, title: `${fbNum(kept.length)} ${tr("fx-ball-2", "receivers")} · a, 1/f = ${fbNum(1 / E.f)}`, col: C.globe, align: "right" });
  axesStamp(f, tr, tr("fx-ball-st", "axis from 6,350 km"));
  return f;
}

// J₂ et q : la Terre aplatie qui tourne.
function figJ2(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-j2-alt", "A spinning Earth bulging at the equator. The bulge pulls on the satellites' orbits, the J2 term; the spin pushes outward at the equator by the fraction q of gravity. Together they fix the flattening of a fluid body") });
  const cx = 140, cy = 100;
  f.ellipse(cx, cy, 80, 66, { c: C.ground, w: 2, fill: C.wash }); f.circle(cx, cy, 66, { c: C.faint, w: 1, dash: "3 3" });
  f.line(cx, cy - 92, cx, cy + 92, { c: C.soft, w: 1, dash: "4 3" }); f.angle(cx, cy - 80, 10, 200, 340, { c: C.soft });
  f.note(cx + 14, cy - 80, "Ω", { size: 11 });
  f.arrow(cx + 80, cy, cx + 110, cy, { c: C.flat }); f.note(cx + 114, cy + 4, "q", { size: 11, c: C.flat });
  f.note(250, 60, tr("fx-j2-1", "the bulge pulls on orbits: J₂"), { size: 10 });
  f.note(250, 78, tr("fx-j2-2", "the spin pushes out: q"), { size: 10 });
  f.note(8, 194, tr("fx-j2-3", "f ≈ 3/2 J₂ + q/2 (Clairaut, fluid body)"), { size: 9.5 });
  stamp(f, tr, tr("fx-j2-st", "flattening ×60"));
  return f;
}

// Kepler III : les trois constellations et la Terre, à l'échelle.
function figKep(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-kep-alt", "The Earth and the orbits of GLONASS, GPS and Galileo drawn to scale: about four, four and a quarter and four and two thirds Earth radii from the centre") });
  const cx = 112, cy = 102, k = 90 / 29600;   // le cercle de Galileo s'arrête à y = 192, au-dessus de la légende (y = 214)
  const K = keplerSys();
  f.circle(cx, cy, 6371 * k, { c: C.ground, w: 2, fill: C.wash });
  for (const s of ["R", "G", "E"]) f.circle(cx, cy, K[s] * k, { c: SYS[s].c, w: 1.4 });
  let yy = 70;
  for (const s of ["R", "G", "E"]) { f.note(240, yy, `${SYS[s].n}: ${Math.round(K[s]).toLocaleString("en")} km`, { size: 10, c: SYS[s].c }); yy += 18; }
  f.note(240, yy + 8, tr("fx-kep-1", "one GM for all?"), { size: 10 });
  f.note(8, 214, tr("fx-kep-2", "GM = n² a³ from each satellite's own orbit"), { size: 9.5 });
  f.stamped = true; f.note(f.w - 4, 12, tr("fx-kep-st", "true scale"), { anchor: "end", c: C.soft, size: 10 });
  return f;
}
const keplerSys = () => Object.fromEntries(["G", "E", "R"].map((s) => { const a = keptSats(D).filter((x) => x.id[0] === s).map((x) => x.a).sort((p, q) => p - q); return [s, a[a.length >> 1]]; }));

// GM de chaque satellite (ppm autour de la solution commune) contre son demi-grand axe.
function figKepData(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-kepd-alt", "GM obtained from each satellite's own orbit against the size of the orbit: GLONASS near 25,500 kilometres, GPS near 26,600 and Galileo near 29,600 all give the same value to within a few hundred parts per million at most") });
  const S = keptSats(D), X0 = 52, X1 = 366, Y0 = 186, Y1 = 26, lo = 25000, hi = 30200;
  const pp = S.map((s) => (s.gm / D.gm - 1) * 1e6), lim = Math.max(50, Math.ceil(Math.max(...pp.map(Math.abs)) / 50) * 50);
  const x = (a) => X0 + (a - lo) / (hi - lo) * (X1 - X0), y = (p) => Y0 - (p + lim) / (2 * lim) * (Y0 - Y1);
  for (const v of [-lim, 0, lim]) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, `${v > 0 ? "+" : ""}${v}`, { anchor: "end", size: 9 }); }
  for (const a of [25000, 27000, 29000]) f.note(x(a), Y0 + 14, a.toLocaleString("en"), { anchor: "middle", size: 9 });
  S.forEach((s, i) => f.dot(x(Math.min(hi, Math.max(lo, s.a))), y(Math.max(-lim, Math.min(lim, pp[i]))), { r: 2.6, c: SYS[s.id[0]].c }));
  // chaque nom au-dessus de son groupe (à la médiane de ses demi-grands axes), non à pas fixe
  const medA = (k) => { const v = S.filter((s) => s.id[0] === k).map((s) => s.a).sort((p, q) => p - q); return v[v.length >> 1]; };
  for (const s of ["R", "G", "E"]) f.note(Math.min(X1 - 20, x(medA(s))), Y1 + 11, SYS[s].n, { anchor: "middle", size: 9.5, c: SYS[s].c });
  f.note(4, 214, tr("fx-kepd-1", "GM of each satellite (ppm from the common value) against its semi-major axis (km)"), { size: 9 });
  axesStamp(f, tr, tr("fx-kepd-st", "ppm"));
  return f;
}

// Un passage à Wettzell : mesures, globe, plat.
function figFlat(tr) {
  const id = Object.keys(D.passes)[0], P = D.passes[id];
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-flat-alt", "The speed of one satellite seen from Wettzell through the day: the measured points lie on the globe solution's curve; the best flat solution's curve departs from them by tens to hundreds of metres per second") });
  const X0 = 50, X1 = 366, Y0 = 190, Y1 = 26;
  const all = P.flatMap((p) => [p[1], p[2], p[3]]), lo = Math.min(...all), hi = Math.max(...all);
  const t0 = P[0][0], t1 = P.at(-1)[0];
  const x = (t) => X0 + (t - t0) / (t1 - t0 || 1) * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
  const step = (hi - lo) > 1200 ? 500 : 200;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, String(v), { anchor: "end", size: 9 }); }
  // segments continus seulement (un passage = des points à 5 min d'écart)
  const seg = (k, c, w) => { let cur = []; const out = []; P.forEach((p, i) => { if (i && p[0] - P[i - 1][0] > 0.2) { out.push(cur); cur = []; } cur.push([x(p[0]), y(p[k])]); }); out.push(cur); for (const s of out) if (s.length > 1) f.path(poly(s), { c, w }); };
  seg(3, C.flat, 1.6);
  for (const p of P) f.dot(x(p[0]), y(p[1]), { r: 1.3, c: C.ink });
  seg(2, C.globe, 1.2);
  f.note(X0, Y0 + 14, `${id} · ${D.example} · ${t0.toFixed(1)} h UTC`, { size: 9.5 }); f.note(X1, Y0 + 14, `${t1.toFixed(1)} h`, { size: 9.5, anchor: "end" });
  f.note(4, 224, tr("fx-flat-1", "speed (m/s) · dots measured · blue globe · orange best plane"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-flat-st", "one satellite"));
  return f;
}


// « Comment » (2026-10-17) : GM = v³/n -- l'orbite, sa vitesse, son angle par unité de temps, l'attraction.
function figGM(tr, v) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-gm-alt", "A satellite on a circular orbit of radius a around the centre. In a time t it moves along the orbit by v t and turns through the angle n t, so a equals v over n; the pull toward the centre, GM over a squared, is exactly what bends its path, so GM equals v cubed over n") });
  const cx = 120, cy = 112, a = 86, th0 = 20 * Math.PI / 180, th1 = 70 * Math.PI / 180;
  f.circle(cx, cy, a, { c: C.sea, w: 1.4, dash: "4 3" }); f.circle(cx, cy, 14, { c: C.ground, w: 1.6, fill: C.wash });
  const P0 = [cx + a * Math.cos(th0), cy - a * Math.sin(th0)], P1 = [cx + a * Math.cos(th1), cy - a * Math.sin(th1)];
  f.line(cx, cy, P0[0], P0[1], { c: C.faint, w: 1 }); f.line(cx, cy, P1[0], P1[1], { c: C.soft, w: 1.2 });
  f.note((cx + P1[0]) / 2 - 12, (cy + P1[1]) / 2 + 4, "a", { size: 11 });
  f.angle(cx, cy, 26, 20, 70, { label: "n t", c: C.ink, pad: 12 });
  f.dot(P1[0], P1[1], { r: 4.5, c: C.globe });
  f.arrow(P1[0], P1[1], P1[0] - 44 * Math.sin(th1), P1[1] - 44 * Math.cos(th1), { c: C.globe }); f.note(P1[0] - 44 * Math.sin(th1) - 6, P1[1] - 44 * Math.cos(th1) - 4, "v", { size: 12, anchor: "end" });
  f.arrow(P1[0], P1[1], P1[0] - 26 * Math.cos(th1), P1[1] + 26 * Math.sin(th1), { c: C.flat }); f.note(P1[0] + 8, P1[1] + 20, "GM/a²", { size: 10.5, c: C.flat });
  f.note(240, 60, tr("fx-gm-1", "Doppler: speed v"), { size: 10.5, c: C.globe });
  f.note(240, 78, tr("fx-gm-2", "clock: period T, n = 2π/T"), { size: 10.5 });
  f.note(240, 104, "a = v/n", { size: 11 }); f.note(240, 122, "GM = v³/n", { size: 11, c: C.globe });
  f.note(240, 148, `GPS: v = ${v.vG} km/s`, { size: 10 }); f.note(240, 164, `T = ${v.TG}`, { size: 10 }); f.note(240, 180, `→ a = ${v.aGm} km`, { size: 10 });
  f.note(8, 214, tr("fx-gm-3", "no ruler: a size from a speed and a time"), { size: 9.5 });
  stamp(f, tr, tr("fx-gm-st", "schematic"));
  return f;
}
// Plusieurs récepteurs : chacun voit une part de la vitesse, ensemble ils la fixent.
function figLos(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-los-alt", "A satellite with its velocity, and three receivers on the ground looking at it from different directions. Each measures only the part of the velocity along its own line of sight; the three parts together fix the velocity in space") });
  const S = [190, 40], vs = [70, 6], R = 300, cx = 190, cy = 150 + R;
  f.path(`M${cx - 145} ${(cy - Math.sqrt(R * R - 145 * 145)).toFixed(1)}A${R} ${R} 0 0 1 ${cx + 145} ${(cy - Math.sqrt(R * R - 145 * 145)).toFixed(1)}`, { c: C.ground, w: 2.4 });
  f.arrow(S[0], S[1], S[0] + vs[0], S[1] + vs[1], { c: C.globe, w: 2 }); f.note(S[0] + vs[0] + 4, S[1] + 4, "v_s", { size: 11, c: C.globe });
  f.dot(S[0], S[1], { r: 5, c: C.globe });
  for (const x of [-130, -10, 120]) {
    const P = [cx + x, cy - Math.sqrt(R * R - x * x)];
    f.dot(P[0], P[1], { r: 3.5 }); f.line(P[0], P[1], S[0], S[1], { c: C.faint, w: 1 });
    const d = [S[0] - P[0], S[1] - P[1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L], c = (vs[0] * u[0] + vs[1] * u[1]) / Math.hypot(...vs) * 40;
    f.arrow(P[0] + u[0] * 30, P[1] + u[1] * 30, P[0] + u[0] * (30 + c), P[1] + u[1] * (30 + c), { c: C.flat, w: 2.2 });
  }
  f.note(8, 196, tr("fx-los-1", "orange: the part each receiver measures, u · v_s"), { size: 9.5, c: C.flat });
  f.note(8, 214, tr("fx-los-2", "three directions fix the velocity; dozens fix the orbit"), { size: 9.5 });
  stamp(f, tr, tr("fx-los-st", "schematic"));
  return f;
}
// La rotation : le récepteur emporté sur son parallèle, à Ω r cos φ.
function figOm(tr, v) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-om-alt", "The Earth seen from the side with its axis. A receiver at latitude phi is carried around the axis on its parallel, at a distance r cos phi from the axis, at the speed Omega r cos phi; after one turn it is back where it started") });
  const cx = 130, cy = 104, R = 74, ph = 49 * Math.PI / 180, px = R * Math.cos(ph), py = R * Math.sin(ph);
  f.circle(cx, cy, R, { c: C.ground, w: 1.8 });
  f.line(cx, cy - R - 18, cx, cy + R + 14, { c: C.soft, w: 1, dash: "4 3" }); f.angle(cx, cy + R + 6, 8, 200, 340, { c: C.soft }); f.note(cx + 12, cy + R + 10, "Ω", { size: 11 });
  f.ellipse(cx, cy - py, px, px * 0.22, { c: C.sea, w: 1.2, dash: "3 3" });
  f.line(cx, cy, cx + px, cy - py, { c: C.faint, w: 1 }); f.note(cx + px * 0.3 - 10, cy - py * 0.3 - 2, "r", { size: 11 });
  f.angle(cx, cy, 22, 0, 49, { label: "φ", c: C.ink, pad: 10 });
  f.seg(cx, cy - py - 10, cx + px, cy - py - 10, { label: "r cos φ", c: C.soft, side: -10 });
  const t = -55 * Math.PI / 180, Q = [cx + px * Math.cos(t), cy - py - px * 0.22 * Math.sin(t)];
  const tg = [-px * Math.sin(t), -px * 0.22 * Math.cos(t)], tl = Math.hypot(...tg);
  f.dot(Q[0], Q[1], { r: 4 }); f.arrow(Q[0], Q[1], Q[0] + 40 * tg[0] / tl, Q[1] + 40 * tg[1] / tl, { c: C.globe, w: 1.8 });
  f.note(Q[0] + 6, Q[1] + 18, "Ω r cos φ", { size: 10.5, c: C.globe });
  f.note(250, 66, tr("fx-om-1", "equator:") + ` ${v.vEq} m/s`, { size: 10.5 });
  f.note(250, 84, `Wettzell: ${v.vW} m/s`, { size: 10.5 });
  f.note(250, 110, tr("fx-om-2", "one turn: 2π/Ω"), { size: 10.5 }); f.note(250, 128, `= ${v.day}`, { size: 10 });
  f.note(8, 214, tr("fx-om-3", "the receiver's own velocity enters every speed it measures"), { size: 9.5 });
  stamp(f, tr, tr("fx-om-st", "schematic"));
  return f;
}

export const FORMULA_FIGS = { satFxGM: figGM, satFxLos: figLos, satFxOm: figOm, satFxDop: figDop, satFxModel: figModel, satFigConv: figConv, satFxEll: figEll, satFigBall: figBall, satFxJ2: figJ2, satFxKep: figKep, satFigKep: figKepData, satFigFlat: figFlat };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "sat"); }
