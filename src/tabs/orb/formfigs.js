// Figures de l'onglet orb (epic19).
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { orbData, SDO_RSUN, TAU_CETI } from "./data.js";
import { globeSunRV, flatSunRV, PLANETS, EARTH_SATS } from "./logic.js";
import { pulsars as psrRows, summary as psrSummary } from "./pulsar-logic.js";
import { fits as trFits, ESO_2004, AU_IAU as TR_AU } from "./transit-logic.js";

const C = FIG.C;
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

function figAb(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-ab-alt", "A telescope carried sideways at the Earth's orbital speed v must be tilted forward by the angle kappa to catch light falling at speed c, as a runner tilts an umbrella in vertical rain; tan kappa equals v over c. Half a year later the motion is reversed and so is the tilt") });
  f.arrow(190, 20, 190, 170, { c: C.globe, w: 1.6 }); f.note(196, 40, "c", { size: 12 });
  f.arrow(190, 190, 280, 190, { c: C.flat, w: 1.6 }); f.note(284, 194, "v", { size: 12 });
  f.line(190, 170, 215, 40, { c: C.ink, w: 3 });
  f.angle(190, 170, 46, 79, 90, { label: "κ", tex: "\\kappa", c: C.ink, pad: 12 });
  f.note(8, 212, tr("fx-ab-1", "tan κ = v/c ≈ 20.5″; reversed six months later"), { size: 9.5 });
  stamp(f, tr, tr("fx-ab-st", "κ enlarged ~2,000×"));
  return f;
}
function figSun(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-sun-alt", "An elliptical orbit with the Sun at one focus. In early January the Earth is nearest and the Sun looks widest; in early July it is farthest and the Sun looks narrowest") });
  const cx = 190, cy = 100, a = 130, b = 80, c = 40;
  f.ellipse(cx, cy, a, b, { c: C.sea, w: 1.4 });
  f.circle(cx - c, cy, 9, { c: C.flat, w: 2, fill: C.wash });
  f.dot(cx - a, cy, { r: 4, c: C.globe }); f.note(cx - a - 4, cy - 10, tr("fx-sun-1", "January: widest"), { size: 9.5, anchor: "start" });
  f.dot(cx + a, cy, { r: 4, c: C.globe }); f.note(cx + a - 4, cy - 10, tr("fx-sun-2", "July: narrowest"), { size: 9.5, anchor: "end" });
  f.note(8, 192, tr("fx-sun-3", "θ ∝ 1/r: θmax/θmin = (1 + e)/(1 − e)"), { size: 9.5 });
  stamp(f, tr, tr("fx-sun-st", "eccentricity exaggerated ×20"));
  return f;
}
function figSunData(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-sund-alt", "The Sun's apparent radius every seven days of 2023, from 976 arcseconds in January down to 944 in July and back") });
  const X0 = 46, X1 = 366, Y0 = 160, Y1 = 30, lo = 940, hi = 980;
  const t0 = Date.parse("2023-01-01"), x = (d) => X0 + (Date.parse(d) - t0) / (366 * 864e5) * (X1 - X0), y = (r) => Y0 - (r - lo) / (hi - lo) * (Y0 - Y1);
  for (const v of [940, 950, 960, 970, 980]) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, String(v), { anchor: "end" }); }
  ["Jan", "Apr", "Jul", "Oct"].forEach((m, i) => f.note(x(`2023-${String(1 + 3 * i).padStart(2, "0")}-01`), Y0 + 14, m, { anchor: "middle" }));
  for (const [d, r] of SDO_RSUN) f.dot(x(d), y(r), { r: 2.6, c: C.globe });
  f.note(4, 194, tr("fx-sund-1", "apparent radius of the Sun (″), 2023, SDO"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-sund-st", "radius axis from 940″"));
  return f;
}
function figDop(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-dop-alt", "The Earth seen from above the North Pole, turning anticlockwise, with the Sun far to the right. A morning observer moves toward the Sun and sees it approach; an afternoon observer moves away and sees it recede; at noon the motion is across the line of sight") });
  const cx = 130, cy = 110, r = 70;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6 });
  f.arrow(cx - r - 18, cy - 22, cx - r - 18, cy + 22, { c: C.soft }); f.note(cx - r - 26, cy + 4, "Ω", { anchor: "end" });
  f.circle(350, 110, 14, { c: C.flat, w: 2, fill: C.wash });
  for (const [ang, lab] of [[-90, tr("fx-dop-1", "morning: approaching")], [0, tr("fx-dop-2", "noon")], [90, tr("fx-dop-3", "afternoon: receding")]]) {
    const a = ang * Math.PI / 180, px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
    f.dot(px, py, { r: 3.5 });
    const vx = -Math.sin(a), vy = -Math.cos(a);
    f.arrow(px, py, px + 34 * vx, py + 34 * vy, { c: C.globe });
    f.note(px + (ang === 0 ? 10 : 8), py + (ang === 90 ? -12 : ang === -90 ? 22 : 4), lab, { size: 9.5 });
  }
  f.note(8, 226, tr("fx-dop-4", "velocity toward the Sun: Ω R cos φ cos δ sin H"), { size: 9.5 });
  stamp(f, tr, tr("fx-dop-st", "Sun not to scale"));
  return f;
}
function figDopData(tr) {
  const D = orbData(), day = D.shown, t0 = Date.parse(day.t0);
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-dopd-alt", "One day of HARPS-N solar velocities, rising from negative in the morning to positive in the afternoon by several hundred metres per second; the globe's parameter-free curve follows the dots, the best flat lamp's curve departs from them") });
  const pts = day.pts.map(([s, v]) => [s / 3600, v]);
  const g = day.pts.map(([s]) => globeSunRV(new Date(t0 + s * 1000))), fl = day.pts.map(([s]) => flatSunRV(new Date(t0 + s * 1000), D.Hflat));
  const off = (m) => pts.reduce((a, p, i) => a + p[1] - m[i], 0) / pts.length, og = off(g), of = off(fl);
  const all = [...pts.map((p) => p[1]), ...g.map((v) => v + og), ...fl.map((v) => v + of)];
  const lo = Math.min(...all), hi = Math.max(...all), T = pts.at(-1)[0];
  const X0 = 48, X1 = 366, Y0 = 186, Y1 = 26, x = (t) => X0 + (t / T) * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
  for (let v = Math.ceil(lo / 100) * 100; v <= hi; v += 100) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, String(v), { anchor: "end" }); }
  f.path(poly(pts.map((p, i) => [x(p[0]), y(fl[i] + of)])), { c: C.flat, w: 2 });
  f.path(poly(pts.map((p, i) => [x(p[0]), y(g[i] + og)])), { c: C.globe, w: 2 });
  for (const p of pts) f.dot(x(p[0]), y(p[1]), { r: 1.8, c: C.ink });
  f.note(X0, Y0 + 14, day.t0.slice(0, 16).replace("T", " ") + " UTC", { size: 9.5 });
  f.note(X1, Y0 + 14, `+${T.toFixed(1)} h`, { size: 9.5, anchor: "end" });
  f.note(4, 222, tr("fx-dopd-1", "observed velocity of the Sun (m/s) · blue globe · orange best lamp"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-dopd-st", "one day"));
  return f;
}
function figYear(tr) {
  const D = orbData(), rows = D.days;
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-year-alt", "The daily mean solar velocity from 2015 to 2018, oscillating with a one-year period and an amplitude of about 494 metres per second") });
  const t0 = rows[0].jd, t1 = rows.at(-1).jd, X0 = 48, X1 = 366, Y0 = 170, Y1 = 26, lo = -600, hi = 600;
  const x = (t) => X0 + (t - t0) / (t1 - t0) * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
  for (const v of [-500, 0, 500]) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, String(v), { anchor: "end" }); }
  const w = 2 * Math.PI / D.year.Ta, fit = [];
  for (let t = t0; t <= t1; t += 5) fit.push([x(t), y(D.year.m + D.year.ac * Math.cos(w * t) + D.year.as * Math.sin(w * t))]);
  f.path(poly(fit), { c: C.globe, w: 1.6 });
  for (const r of rows) f.dot(x(r.jd), y(r.v0), { r: 1.6, c: C.ink });
  ["2016", "2017", "2018"].forEach((yr) => { const jd = (Date.parse(yr + "-01-01") / 864e5) + 2440587.5; f.note(x(jd), Y0 + 14, yr, { anchor: "middle" }); });
  f.note(4, 204, tr("fx-year-1", "daily mean velocity of the Sun (m/s), HARPS-N, 2015–2018"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-year-st", "462 days"));
  return f;
}
function figStar(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-star-alt", "The Earth's orbit seen from above with a distant star to the right. When the Earth moves toward the star its light is blueshifted, six months later redshifted; the swing is K equal to v cos beta") });
  const cx = 150, cy = 100, r = 70;
  f.circle(cx, cy, r, { c: C.sea, w: 1.4 }); f.circle(cx, cy, 8, { c: C.flat, w: 2, fill: C.wash });
  f.dot(cx, cy - r, { r: 4, c: C.globe }); f.arrow(cx, cy - r, cx + 40, cy - r, { c: C.globe }); f.note(cx + 44, cy - r + 4, tr("fx-star-1", "toward: −K"), { size: 9.5 });
  f.dot(cx, cy + r, { r: 4, c: C.globe }); f.arrow(cx, cy + r, cx - 40, cy + r, { c: C.globe }); f.note(cx - 44, cy + r + 4, tr("fx-star-2", "away: +K"), { size: 9.5, anchor: "end" });
  f.arrow(250, 100, 360, 100, { c: C.soft }); f.note(356, 90, "★", { anchor: "end", size: 14 });
  f.note(8, 194, tr("fx-star-3", "K = v cos β, β the star's angle from the orbit's plane"), { size: 9.5 });
  stamp(f, tr, tr("fx-star-st", "schematic"));
  return f;
}
function figStarData(tr) {
  const D = orbData().star, N = TAU_CETI.nights;
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-stard-alt", "Tau Ceti's observed radial velocity on 561 nights folded on one year: a sinusoid of amplitude 27.2 kilometres per second around minus 16.5") });
  const P = 365.25636, X0 = 48, X1 = 366, Y0 = 170, Y1 = 26, lo = -46, hi = 12;
  const x = (ph) => X0 + ph * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
  for (const v of [-40, -30, -20, -10, 0, 10]) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, String(v), { anchor: "end" }); }
  for (const [t, v] of N) f.dot(x(((t % P) + P) % P / P), y(v / 1000), { r: 1.6, c: C.ink });
  f.line(X0, y(D.gamma / 1000), X1, y(D.gamma / 1000), { c: C.flat, w: 1 });
  f.note(X1, y(D.gamma / 1000) - 4, tr("fx-stard-2", "the star itself"), { anchor: "end", size: 9.5, c: C.flat });
  f.note(4, 204, tr("fx-stard-1", "observed velocity of τ Ceti (km/s) against the time of year"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-stard-st", "folded on one year"));
  return f;
}
function figPar(tr) {
  const f = FIG.make({ w: 380, h: 180, alt: tr("fx-par-alt", "The Earth at two opposite points of its orbit, a distance 2a apart, sees a near star against different background stars; the half-angle p at the star gives its distance d equal to a over tan p") });
  f.line(40, 60, 40, 140, { c: C.sea, w: 1.4 }); f.dot(40, 60, { r: 4, c: C.globe }); f.dot(40, 140, { r: 4, c: C.globe }); f.circle(40, 100, 6, { c: C.flat, w: 2, fill: C.wash });
  f.line(40, 60, 330, 100, { c: C.ink, w: 1 }); f.line(40, 140, 330, 100, { c: C.ink, w: 1 }); f.dot(330, 100, { r: 4 });
  f.angleAt(330, 100, 40, [40, 100], [40, 60], { label: "p", c: C.ink, pad: 10 });
  f.seg(20, 60, 20, 100, { label: "a", c: C.soft, side: -10 });
  f.note(8, 172, tr("fx-par-1", "d = a / tan p · 61 Cygni: p = 0.314″"), { size: 9.5 });
  stamp(f, tr, tr("fx-par-st", "p enlarged ~10⁶×"));
  return f;
}

function figGno(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-gno-alt", "A vertical stick of height L and its noon shadow: short in June when the Sun is high, long in December when it is low. The two noon altitudes give the axis tilt as half their difference and the latitude from their mean") });
  f.ground(170, 20, 370); f.line(120, 170, 120, 70, { c: C.ink, w: 3 });
  f.seg(104, 70, 104, 170, { label: "L", c: C.soft, side: -10 });
  f.line(120, 70, 170, 170, { c: C.flat, w: 1, dash: "4 3" }); f.line(120, 170, 170, 170, { c: C.ink, w: 4 });
  f.note(150, 188, tr("fx-gno-1", "June"), { anchor: "middle", size: 9.5 });
  f.line(120, 70, 330, 170, { c: C.globe, w: 1, dash: "4 3" }); f.line(170, 170, 330, 170, { c: C.soft, w: 4 });
  f.note(300, 188, tr("fx-gno-2", "December"), { anchor: "middle", size: 9.5 });
  f.angleAt(330, 170, 34, [120, 70], [20, 170], { label: "h", c: C.globe, pad: 10 });
  f.note(8, 204, tr("fx-gno-3", "ε = (h_June − h_Dec)/2 · φ = 90° − (h_June + h_Dec)/2"), { size: 9.5 });
  stamp(f, tr, tr("fx-gno-st", "schematic"));
  return f;
}


// ---- Kepler et Newton (2026-10-16) ----
// Kepler 1 et 2 : ellipse, Soleil au foyer, deux secteurs d'aire égale balayés en des temps égaux.
function figKep(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-kep-alt", "An ellipse with the Sun at one focus. Two shaded sectors have the same area: near perihelion a short, wide one, near aphelion a long, thin one. The planet covers the longer arc near the Sun in the same time as the shorter arc far from it") });
  const cx = 190, cy = 122, a = 130, e = 0.6, b = a * Math.sqrt(1 - e * e), fx = cx - a * e;
  f.ellipse(cx, cy, a, b, { c: C.sea, w: 1.4 });
  // anomalie moyenne M -> point de l'ellipse (équation de Kepler) ; périhélie à gauche, près du foyer
  const at = (M) => { let E = M; for (let k = 0; k < 30; k++) E = M + e * Math.sin(E); return [cx - a * Math.cos(E), cy - b * Math.sin(E)]; };
  const sector = (M0, M1) => {
    const pts = []; for (let k = 0; k <= 24; k++) pts.push(at(M0 + (M1 - M0) * k / 24));
    f.path(`M${fx} ${cy}` + pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("") + "Z", { c: C.globe, w: 1, fill: C.coolwash });
  };
  const dM = 0.5; // même durée, donc même aire (Kepler 2)
  sector(-dM / 2, dM / 2); sector(Math.PI - dM / 2, Math.PI + dM / 2);
  f.circle(fx, cy, 7, { c: C.flat, w: 2, fill: C.wash });
  f.dot(cx - a, cy, { r: 3.5, c: C.globe }); f.note(cx - a, cy - b + 6, tr("fx-kep-1", "perihelion: fast"), { size: 9.5 });
  f.dot(cx + a, cy, { r: 3.5, c: C.globe }); f.note(cx + a, cy - b + 6, tr("fx-kep-2", "aphelion: slow"), { size: 9.5, anchor: "end" });
  f.seg(cx, cy - 30, cx + a, cy - 30, { label: "a", c: C.soft, side: -10 });
  f.seg(fx, cy + 20, cx, cy + 20, { label: "ae", c: C.soft, side: 11 });
  f.note(8, 246, tr("fx-kep-3", "the two shaded areas are equal, swept in equal times"), { size: 9.5 });
  stamp(f, tr, tr("fx-kep-st", "eccentricity 0.6 (Earth's: 0.017)"));
  return f;
}
// Newton : le boulet tiré d'une montagne ; plus il part vite, plus loin il tombe, jusqu'à ne plus tomber.
function figNewt(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-newt-alt", "Newton's cannon on a mountain on a round Earth. Cannonballs fired horizontally faster and faster land farther and farther away, until one falls around the whole Earth without landing: the orbit. The pull toward the centre, GM over r squared, is what bends each path") });
  const cx = 190, cy = 132, R = 78, top = [cx, cy - R - 14];
  f.circle(cx, cy, R, { c: C.ground, w: 2, fill: C.wash });
  f.path(`M${cx - 10} ${cy - R + 1}L${cx} ${top[1]}L${cx + 10} ${cy - R + 1}`, { c: C.ground, w: 1.6 });
  // trajectoires depuis le sommet, vitesse horizontale v = k·v_circ (GM = 1, saute-mouton), arrêt au sol ou après un tour
  const r0 = R + 14, ks = [0.55, 0.75, 0.9, 1.0];
  for (const k of ks) {
    let x = 0, y = r0, vx = k * Math.sqrt(1 / r0), vy = 0, swept = 0, prev = 0; const pts = [[cx, cy - y]], h = 1;
    for (let s = 0; s < 20000; s++) {
      const r = Math.hypot(x, y), g = 1 / (r * r * r);
      vx -= g * x * h; vy -= g * y * h; x += vx * h; y += vy * h;
      const ang = Math.atan2(x, y); let d = ang - prev; if (d < -Math.PI) d += 2 * Math.PI; swept += d; prev = ang;
      if (s % 4 === 0) pts.push([cx + x, cy - y]);
      if (Math.hypot(x, y) < R || swept > 2 * Math.PI - 0.02) { pts.push([cx + x, cy - y]); break; }
    }
    f.path(poly(pts), { c: k === 1 ? C.globe : C.flat, w: k === 1 ? 2 : 1.4, dash: k === 1 ? undefined : "4 3" });
  }
  f.arrow(cx + 4, top[1], cx + 50, top[1], { c: C.ink }); f.note(cx + 54, top[1] + 4, "v", { size: 12 });
  { const u = Math.SQRT1_2, px = cx - r0 * u, py = cy + r0 * u; f.arrow(px, py, px + 20 * u, py - 20 * u, { c: C.globe });
    f.note(px - 6, py + 12, "GM/r²", { size: 10, anchor: "end" }); }
  f.dot(cx, cy, { r: 2.5, c: C.soft });
  f.note(8, 234, tr("fx-newt-1", "slower: lands (orange) · fast enough: falls around, an orbit (blue)"), { size: 9.5 });
  stamp(f, tr, tr("fx-newt-st", "mountain far too high"));
  return f;
}
// Tomber autour : en un temps t le boulet est tombé de ½gt² sous la droite qu'il suivrait sans pesanteur,
// et le sol s'est incurvé de (vt)²/2R sous la même droite. Égaux : il garde sa hauteur.
function figFall(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-fall-alt", "A ball moving sideways along a straight line tangent to the ground would leave it; in the same time it has fallen below that line by one half g t squared, and the curved ground has dropped below it by v t squared over 2 R. When the two are equal the ball keeps its height above the ground") });
  const R = 420, cx = 60, cy = 40 + R, ang = 0.62;
  f.path(`M${cx} ${cy - R}A${R} ${R} 0 0 1 ${(cx + R * Math.sin(ang)).toFixed(1)} ${(cy - R * Math.cos(ang)).toFixed(1)}`, { c: C.ground, w: 2.4 });
  const rb = R + 16;
  f.path(`M${cx} ${cy - rb}A${rb} ${rb} 0 0 1 ${(cx + rb * Math.sin(ang * 0.93)).toFixed(1)} ${(cy - rb * Math.cos(ang * 0.93)).toFixed(1)}`, { c: C.globe, w: 1.8 });
  f.dash(cx, cy - rb, 360, cy - rb, { c: C.faint });
  f.dot(cx, cy - rb, { r: 4 }); f.arrow(cx, cy - rb, cx + 44, cy - rb, { c: C.ink });
  const a2 = 0.5, bx = cx + rb * Math.sin(a2), by = cy - rb * Math.cos(a2);
  f.dot(bx, by, { r: 4 });
  f.line(bx, cy - rb, bx, by, { c: C.flat, w: 1.6 });
  f.note(bx + 6, (cy - rb + by) / 2 + 4, "½gt²", { size: 11, c: C.flat });
  f.note(bx - 6, by + 30, "(vt)²/2R", { size: 11, c: C.ground, anchor: "end" });
  f.note(cx + 48, cy - rb - 6, "vt", { size: 11 });
  f.note(8, 214, tr("fx-fall-1", "fallen below the straight line = ground's drop below it: same height"), { size: 9.5 });
  stamp(f, tr, tr("fx-fall-st", "drops enlarged"));
  return f;
}
// Kepler 3 : deux orbites, l'une 4 fois plus grande, met 8 fois plus de temps (4^1,5 = 8).
function figKep3(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-kep3-alt", "Two circular orbits around the same body, one four times wider than the other. The wide one takes eight times longer to go round, because the period grows as the size to the power three halves") });
  const cx = 150, cy = 116, r1 = 21, r2 = 84;
  f.circle(cx, cy, r2, { c: C.sea, w: 1.4 }); f.circle(cx, cy, r1, { c: C.sea, w: 1.4 });
  f.circle(cx, cy, 6, { c: C.flat, w: 2, fill: C.wash });
  f.dot(cx + r1, cy, { r: 3.5, c: C.globe }); f.dot(cx + r2, cy, { r: 3.5, c: C.globe });
  f.seg(cx, cy - r2 - 8, cx + r2, cy - r2 - 8, { label: "4a", c: C.soft, side: -10 });
  f.note(cx + r1 + 6, cy - 6, "a, T", { size: 10 });
  f.note(cx + r2 + 8, cy - 6, "4a, 8T", { size: 10 });
  f.note(258, 60, tr("fx-kep3-1", "4³ = 64 = 8²"), { size: 10 });
  f.note(258, 78, tr("fx-kep3-2", "speed halves: 4a / 8T"), { size: 10 });
  f.note(8, 214, tr("fx-kep3-3", "T² ∝ a³ around one body; the constant is 4π²/GM"), { size: 9.5 });
  stamp(f, tr, tr("fx-kep3-st", "schematic"));
  return f;
}
// Kepler 3 en données : planètes et satellites de la Terre, axes logarithmiques (pente 3/2).
function figKep3Data(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-kep3d-alt", "Period against semi-major axis on logarithmic axes. The eight planets lie on one straight line of slope three halves; the Moon and the GPS satellites lie on a parallel line far below, set by the Earth's much smaller GM") });
  const X0 = 46, X1 = 368, Y0 = 200, Y1 = 22, lx0 = 4, lx1 = 10, ly0 = -1.6, ly1 = 5.3; // log10 km, log10 jours
  const x = (aKm) => X0 + (Math.log10(aKm) - lx0) / (lx1 - lx0) * (X1 - X0), y = (Td) => Y0 - (Math.log10(Td) - ly0) / (ly1 - ly0) * (Y0 - Y1);
  for (let e = lx0; e <= lx1; e++) { f.dash(X0 + (e - lx0) / (lx1 - lx0) * (X1 - X0), Y0, X0 + (e - lx0) / (lx1 - lx0) * (X1 - X0), Y1, { c: "#e7e3da" }); f.note(X0 + (e - lx0) / (lx1 - lx0) * (X1 - X0), Y0 + 13, `10${"⁰¹²³⁴⁵⁶⁷⁸⁹"[e] || "¹⁰"}`, { anchor: "middle", size: 9.5 }); }
  for (const [v, lab] of [[1 / 24, tr("fx-kep3d-h", "1 h")], [1, tr("fx-kep3d-d", "1 d")], [365.25, tr("fx-kep3d-yr", "1 yr")], [36525, tr("fx-kep3d-cy", "100 yr")]]) { f.dash(X0, y(v), X1, y(v), { c: "#e7e3da" }); f.note(X0 - 4, y(v) + 4, lab, { anchor: "end", size: 9.5 }); }
  const line = (gm, c) => { const pts = []; for (let l = lx0; l <= lx1; l += 0.1) { const a = 10 ** l, T = 2 * Math.PI * Math.sqrt((a * 1e3) ** 3 / gm) / 86400; if (y(T) <= Y0 && y(T) >= Y1) pts.push([x(a), y(T)]); } f.path(poly(pts), { c, w: 1.2, dash: "5 3" }); };
  line(1.32712e20, C.flat); line(3.986e14, C.globe);
  for (const [n, a, T] of PLANETS) { f.dot(x(a * 1e6), y(T), { r: 3, c: C.flat }); f.note(x(a * 1e6) - 5, y(T) - 5, tr("fx-kep3d-" + n, n), { size: 9, anchor: "end" }); }
  for (const [n, a, T] of EARTH_SATS) { f.dot(x(a * 1e6), y(T), { r: 3, c: C.globe }); f.note(x(a * 1e6) + 6, y(T) + 12, tr("fx-kep3d-" + n, n), { size: 9 }); }
  f.note(x(4e8), y(40), tr("fx-kep3d-1", "around the Sun"), { size: 9.5, c: C.flat });
  f.note(x(1.2e4), y(400), tr("fx-kep3d-2", "around the Earth"), { size: 9.5, c: C.globe });
  f.note(4, 234, tr("fx-kep3d-3", "orbital period against semi-major axis (km), both logarithmic"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-kep3d-st", "log–log"));
  return f;
}


// l'écho radar de Vénus (2026-11-18) : l'élongation donne le rapport des orbites, l'écho la distance à la conjonction
function figRadar(tr) {
  const f = FIG.make({ w: 380, h: 236, alt: tr("fx-rd-alt", "The Sun, the orbit of Venus and the Earth. At greatest elongation the line from the Earth to Venus touches Venus's orbit, so the angle epsilon between the Sun and Venus gives sin epsilon equal to the ratio of the two orbits. At inferior conjunction Venus lies between the Earth and the Sun, at a distance of one minus that ratio, in astronomical units, which the echo measures in kilometres") });
  const S = [118, 128], rE = 160, rV = rE * 0.7233, E = [S[0] + rE, S[1]], a = Math.acos(0.7233), T = [S[0] + rV * Math.cos(a), S[1] - rV * Math.sin(a)], Vc = [S[0] + rV, S[1]];
  f.circle(S[0], S[1], rV, { c: C.faint, w: 1 });
  f.path(`M${S[0] + rE * Math.cos(0.42)} ${S[1] - rE * Math.sin(0.42)} A${rE} ${rE} 0 0 1 ${S[0] + rE * Math.cos(-0.42)} ${S[1] - rE * Math.sin(-0.42)}`, { c: C.faint, w: 1 });
  f.circle(S[0], S[1], 9, { c: C.flat, w: 2, fill: C.wash });
  f.line(E[0], E[1], S[0], S[1], { c: C.ink, w: 1 }); f.line(E[0], E[1], T[0], T[1], { c: C.ink, w: 1 });
  f.rightAngle(T[0], T[1], S, E, 8);
  f.angleAt(E[0], E[1], 44, S, T, { label: "ε", tex: "\\varepsilon", c: C.ink, pad: 12 });
  f.dot(E[0], E[1], { r: 4.5, c: C.globe }); f.note(E[0] + 8, E[1] + 4, tr("fx-rd-e", "Earth"), { size: 10, anchor: "start", c: C.globe });
  f.dot(T[0], T[1], { r: 4, c: "#a16207" }); f.note(T[0] - 6, T[1] - 8, tr("fx-rd-vmax", "Venus at greatest elongation"), { size: 9.5, anchor: "middle" });
  f.dot(Vc[0], Vc[1], { r: 4, c: "#a16207" }); f.note(Vc[0], Vc[1] + 16, tr("fx-rd-vc", "at conjunction"), { size: 9.5, anchor: "middle" });
  f.seg(Vc[0], S[1] + 34, E[0], S[1] + 34, { label: "d = cτ/2", tex: "d = c\\tau/2", c: C.globe, side: 20 });
  f.seg(S[0], S[1], T[0], T[1], { label: "r_V", tex: "r_V", c: C.soft, side: -12 });
  f.note(8, 228, tr("fx-rd-1", "sin ε = r_V / r_E ≈ 0.723 · d = (1 − 0.723) AU"), { size: 9.5 });
  stamp(f, tr, tr("fx-rd-st", "orbits to scale, bodies enlarged"));
  return f;
}

// les pulsars (2026-11-18) : de côté, l'orbite dans le plan de l'écliptique et la direction du pulsar à β au-dessus
function figPsr(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-ps-alt", "The Earth's orbit seen edge-on, the Sun in the middle and the Earth at both ends, a distance A from the Sun. Wave fronts from a pulsar at latitude beta above the plane reach one end of the orbit earlier than the Sun and the other end later, by A cos beta over c") });
  const S = [150, 150], A = 110, b = 30 * Math.PI / 180, ux = Math.cos(b), uy = -Math.sin(b);
  f.line(20, S[1], 360, S[1], { c: C.faint, w: 1 }); f.note(356, S[1] + 14, tr("fx-ps-ecl", "plane of the orbit"), { size: 9.5, anchor: "end" });
  f.circle(S[0], S[1], 8, { c: C.flat, w: 2, fill: C.wash });
  f.dot(S[0] + A, S[1], { r: 4.5, c: C.globe }); f.dot(S[0] - A, S[1], { r: 4.5, c: C.globe });
  for (const k of [-1, 0, 1]) { const px = S[0] + k * A * ux * ux, py = S[1] + k * A * ux * uy; f.dash(px - uy * 70, py + ux * 70, px + uy * 70, py - ux * 70, { c: "#7c3aed" }); }   // chaque front passe par une position de la Terre
  f.arrow(S[0] + 40 * ux, S[1] + 40 * uy, S[0] + 150 * ux, S[1] + 150 * uy, { c: "#7c3aed", w: 1.4 }); f.note(S[0] + 156 * ux, S[1] + 156 * uy, tr("fx-ps-to", "to the pulsar"), { size: 9.5, anchor: "start", c: "#7c3aed" });
  f.angle(S[0], S[1], 46, 0, 30, { label: "β", tex: "\\beta", c: C.ink, pad: 12 });
  f.seg(S[0], S[1] + 30, S[0] + A, S[1] + 30, { label: "A", c: C.soft, side: 12 });
  f.seg(S[0], S[1] - 4, S[0] + A * ux * ux, S[1] + A * ux * uy - 4, { label: "A cos β", tex: "A\\cos\\beta", c: "#7c3aed", side: -12 });
  f.note(8, 40, tr("fx-ps-1", "Δt = (A/c) cos β · cos(λ⊕ − λ): only A cos β"), { size: 9.5 });
  stamp(f, tr, tr("fx-ps-st", "β = 30° here"));
  return f;
}
function figPsrData(tr) {
  const P = psrRows(), S = psrSummary(), rowH = 17, f = FIG.make({ w: 380, h: 72 + P.length * rowH, alt: tr("fx-psd-alt", "The astronomical unit from each timing model of twelve pulsars, EPTA and NANOGrav, in kilometres, with error bars: all within their errors of the value of the ephemeris, 149,597,870.7") });
  const X0 = 166, X1 = 370, lo = 149597858, hi = 149597880, x = (v) => X0 + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (X1 - X0), y0 = 46;
  for (let v = 860; v <= 880; v += 5) { const xx = x(149597000 + v); f.dash(xx, y0 - 6, xx, y0 + P.length * rowH - 6, { c: "#e7e3da" }); f.note(xx, y0 + P.length * rowH + 8, String(v), { anchor: "middle", size: 9 }); }
  f.line(x(S.de), y0 - 8, x(S.de), y0 + P.length * rowH - 4, { c: C.ink, w: 1 });
  P.forEach((p, k) => { const yy = y0 + k * rowH + 4, col = p.array === "EPTA" ? C.globe : C.sea;
    f.note(4, yy + 4, `${p.name} ${p.array === "EPTA" ? "EPTA" : "NANOGrav"}`, { anchor: "start", size: 9, c: C.ink });
    const s = Math.max(p.sau, 0.05); f.line(x(p.au - s), yy, x(p.au + s), yy, { c: col, w: 1.4 }); f.dot(x(p.au), yy, { r: 2.8, c: col });
    if (p.au - s < lo) f.note(X0 + 2, yy - 3, "◂", { anchor: "start", size: 9, c: col }); });
  f.note(X1, 30, tr("fx-psd-1", "a.u. from each timing model: 149,597,000 km + … (line: DE440)"), { anchor: "end", size: 9.5 });
  axesStamp(f, tr, tr("fx-psd-st", "22 kilometres wide"));
  return f;
}

// le passage de Vénus (2026-11-18) : deux stations voient Vénus devant deux points différents du Soleil
function figTransit(tr) {
  const f = FIG.make({ w: 380, h: 210, alt: tr("fx-tr-alt", "The Earth on the left with a northern and a southern station, Venus in the middle and the edge of the Sun on the right. The two lines of sight through Venus land on the Sun at two different places, so Venus touches the Sun's edge at different times for the two stations; the difference depends on the Earth's size over the Sun's distance") });
  const E = [40, 105], V = [200, 105], S = [470, 105], rS = 140;
  f.circle(E[0], E[1], 26, { c: C.globe, w: 1.4, fill: "#eef4fb" });
  f.path(`M${S[0] - rS} 20 A ${rS + 40} ${rS + 40} 0 0 0 ${S[0] - rS} 190`, { c: C.flat, w: 2, fill: C.wash });
  f.dot(V[0], V[1], { r: 4.5, c: "#a16207" }); f.note(V[0], V[1] - 10, tr("fx-tr-v", "Venus"), { size: 9.5, anchor: "middle" });
  const N = [E[0], E[1] - 26], So = [E[0], E[1] + 26];
  for (const [P, c] of [[N, C.globe], [So, C.sea]]) { const dx = V[0] - P[0], dy = V[1] - P[1], t = (S[0] - rS + 12 - P[0]) / dx; f.line(P[0], P[1], P[0] + dx * t, P[1] + dy * t, { c, w: 1.2 }); f.dot(P[0], P[1], { r: 3.5, c }); }
  f.note(E[0] - 4, E[1] - 34, tr("fx-tr-n", "north"), { size: 9.5, anchor: "middle", c: C.globe });
  f.note(E[0] - 4, E[1] + 46, tr("fx-tr-s", "south"), { size: 9.5, anchor: "middle", c: C.sea });
  f.note(300, 34, tr("fx-tr-sun", "the Sun's edge"), { size: 9.5, anchor: "end", c: C.flat });
  f.note(8, 204, tr("fx-tr-1", "t = t∞ + P·(A_DE/A): P from the Earth's size, A fitted"), { size: 9.5 });
  stamp(f, tr, tr("fx-tr-st", "distances and angles enlarged"));
  return f;
}

// les passages de Vénus côte à côte (2026-11-19) : 1761, 1769, 2012 réduits ici ; 2004 tel que publié (données perdues)
function figTransits(tr) {
  const F = trFits(), lines = [["1761", F["1761"], tr("fx-trs-1761", "1761 · Newcomb's collection")], ["1769", F["1769"], tr("fx-trs-1769", "1769 · Newcomb's collection")],
    ["2004", { a: ESO_2004.a, sa: ESO_2004.sa }, tr("fx-trs-2004", "2004 · ESO, as published")], ["2012", F["2012"], tr("fx-trs-2012", "2012 · contact III, amateurs")], ["all", F.all, tr("fx-trs-all", "1761 + 1769 + 2012 together")]];
  const f = FIG.make({ w: 380, h: 64 + lines.length * 26, alt: tr("fx-trs-alt", "The astronomical unit from each transit of Venus, in millions of kilometres, with its error: 1761, 1769 and 2012 reduced on this site, 2004 as published by ESO, and the three reduced together, against today's value of 149.6") });
  const X0 = 170, X1 = 370, lo = 140, hi = 170, x = (v) => X0 + (Math.max(lo, Math.min(hi, v / 1e6)) - lo) / (hi - lo) * (X1 - X0), y0 = 46;
  for (let v = 140; v <= 170; v += 10) { f.dash(x(v * 1e6), y0 - 8, x(v * 1e6), y0 + lines.length * 26 - 8, { c: "#e7e3da" }); f.note(x(v * 1e6), y0 + lines.length * 26 + 6, String(v), { anchor: "middle", size: 9 }); }
  f.line(x(TR_AU), y0 - 10, x(TR_AU), y0 + lines.length * 26 - 6, { c: C.ink, w: 1 });
  lines.forEach(([k, v, lab], i) => { const yy = y0 + i * 26 + 4, col = k === "2004" ? C.soft : k === "all" ? C.ink : C.globe;
    f.note(4, yy + 4, lab, { anchor: "start", size: 9.5, c: C.ink });
    f.line(x(v.a - v.sa), yy, x(v.a + v.sa), yy, { c: col, w: 1.4 });
    if (k === "2004") f.circle(x(v.a), yy, 3.2, { c: col, w: 1.4, fill: "#fff" }); else f.dot(x(v.a), yy, { r: 3.2, c: col }); });
  f.note(X1, 30, tr("fx-trs-1", "astronomical unit, million km (line: today's)"), { anchor: "end", size: 9.5 });
  axesStamp(f, tr, tr("fx-trs-st", "from 140 to 170 million km"));
  return f;
}

export const FORMULA_FIGS = { orbFigTransits: figTransits, orbFxTransit: figTransit, orbFxPsr: figPsr, orbFigPsr: figPsrData, orbFxRadar: figRadar, orbFxKep: figKep, orbFxFall: figFall, orbFxNewt: figNewt, orbFxKep3: figKep3, orbFigKep3: figKep3Data, orbFxGno: figGno, orbFxAb: figAb, orbFxSun: figSun, orbFigSun: figSunData, orbFxDop: figDop, orbFigDop: figDopData, orbFigYear: figYear, orbFxStar: figStar, orbFigStar: figStarData, orbFxPar: figPar };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "orb"); }
