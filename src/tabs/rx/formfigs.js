// Les huit figures des formules de l'onglet rx (règle du propriétaire : chaque formule a
// sa figure). Schémas SVG par le helper FIG (src/core/fig.js) ; quatre d'entre elles sont
// CALCULÉES par le code même que la page utilise (iter : userlogic.solveEpoch sur un ciel
// synthétique ; budget : constantes de [2] et Klobuchar sur de vrais coefficients ;
// sigma : grouplogic.groupFit ; mn : rayons de courbure WGS84). Règle 1 : chaque figure
// porte son tampon (schéma, échelle vraie, ou graphique calculé).
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { solveEpoch, klobuchar, ecef } from "./userlogic.js";
import { syntheticSky } from "./synth.js";
import { groupFit } from "./grouplogic.js";
import { budget, sagitta, radiiM, radiiN } from "./values.js";
import { rawData } from "../gps/rawfig.js";
import { num } from "../curv/fmt.js";

const C = FIG.C, D2R = Math.PI / 180;
/** Tampon d'un graphique calculé (pas un dessin : rien à mettre à l'échelle). */
const computed = (f, tr, what) => { f.stamped = true; f.note(f.w - 4, 12, `${tr("fx-computed", "computed")} — ${what}`, { anchor: "end", c: C.soft, size: 10 }); };

// ① la pseudo-distance, depuis les champs d'horloge du téléphone
function figClock(tr) {
  const f = FIG.make({ w: 460, h: 244, alt: tr("fx-clk-alt", "The satellite stamps its time of emission into the signal; the phone notes the time of reception on its own clock, shifted to GPS time; the difference times the speed of light is the pseudorange") });
  const yS = 46, yP = 148, xT = 240, xR = 410;
  f.note(14, 30, tr("fx-clk-1", "satellite clock (GPS time)"), { c: C.globe, size: 11 });
  f.line(14, yS, 446, yS, { c: C.globe, w: 1.6 });
  f.line(xT, yS - 6, xT, yS + 6, { c: C.globe, w: 2 });
  f.note(xT - 8, yS + 18, tr("fx-clk-2", "emission: its time is in the signal"), { size: 10.5, c: C.globe, anchor: "end" });
  f.note(14, yP - 16, tr("fx-clk-3", "phone clock"), { c: C.ink, size: 11 });
  f.line(14, yP, 446, yP, { c: C.ink, w: 1.6 });
  f.line(xR, yP - 6, xR, yP + 6, { c: C.ink, w: 2 });
  f.arrow(xT + 4, yS + 4, xR - 3, yP - 4, { c: C.flat, w: 1.6, head: 7 });
  f.note(290, 118, tr("fx-clk-4", "the signal flies 67 to 86 ms"), { size: 10.5, c: C.flat, anchor: "end" });
  f.note(xR, yP + 18, tr("fx-clk-5", "reception"), { size: 10.5, anchor: "middle" });
  f.txt(14, 194, "t_rx = TimeNanos − (FullBiasNanos + BiasNanos)", { size: 11 });
  f.note(14, 212, tr("fx-clk-6", "the phone's counter, shifted to GPS time and taken modulo one week"), { size: 10.5 });
  f.txt(14, 234, "ρ = c · (t_rx − t_tx)", { size: 12, c: C.globe });
  stamp(f, tr, tr("fx-sch", "schematic"));
  return f;
}

// ② l'orbite à partir des éléments diffusés (Kepler)
function figKepler(tr) {
  const f = FIG.make({ w: 460, h: 256, alt: tr("fx-kep-alt", "An elliptical orbit with the Earth's centre at one focus: the eccentric anomaly E measured at the centre of the ellipse, the true anomaly ν and the distance r measured from the focus") });
  const cx = 150, cy = 138, a = 115, b = 95, c = Math.sqrt(a * a - b * b), Fx = cx + c, E = 60 * D2R;
  const S = [cx + a * Math.cos(E), cy - b * Math.sin(E)], A = [cx + a * Math.cos(E), cy - a * Math.sin(E)];
  f.circle(cx, cy, a, { c: C.faint, w: 1, dash: "4 4" });
  f.ellipse(cx, cy, a, b, { c: C.globe, w: 1.8 });
  f.dash(cx - a - 6, cy, cx + a + 6, cy);
  f.line(cx, cy, A[0], A[1], { c: C.soft, w: 1.1, dash: "3 3" });
  f.dot(A[0], A[1], { r: 2.4, c: C.soft });
  f.angle(cx, cy, 24, 0, 60, { c: C.soft, label: "E" });
  f.line(Fx, cy, S[0], S[1], { c: C.ink, w: 1.6 });
  const nu = Math.atan2(cy - S[1], S[0] - Fx) / D2R;
  f.angle(Fx, cy, 20, 0, nu, { c: C.ink, label: "ν" });
  f.note((Fx + S[0]) / 2 + 6, (cy + S[1]) / 2 + 10, "r", { size: 13, c: C.ink });
  f.dot(Fx, cy, { r: 4, c: C.ink });
  f.note(Fx - 8, cy + 20, tr("fx-kep-1", "Earth's centre"), { size: 10.5, c: C.ink, anchor: "end" });
  f.dot(S[0], S[1], { r: 5, c: C.globe });
  f.note(S[0] + 9, S[1] - 6, tr("fx-kep-2", "satellite"), { size: 10.5, c: C.globe });
  f.note(cx + a - 4, cy + 16, tr("fx-kep-3", "perigee"), { size: 10, anchor: "end" });
  const x = 292;
  f.note(x, 56, tr("fx-kep-4", "M grows evenly with time"), { size: 10.5 });
  f.note(x, 80, tr("fx-kep-5", "Kepler: E − e·sin E = M"), { size: 10.5 });
  f.note(x, 104, tr("fx-kep-6", "r = a(1 − e·cos E), ν from E"), { size: 10.5 });
  f.note(x, 128, tr("fx-kep-7", "+ six small corrections"), { size: 10.5 });
  f.note(x, 152, tr("fx-kep-8", "then ω, i, Ω turn the orbit"), { size: 10.5 });
  f.note(x, 168, tr("fx-kep-9", "into the Earth-fixed frame"), { size: 10.5 });
  stamp(f, tr, tr("fx-kep-s", "eccentricity exaggerated (GPS: e ≈ 0.01)"));
  return f;
}

// ③ la taille de chaque terme de l'équation (échelle logarithmique)
function figBudget(tr) {
  const f = FIG.make({ w: 460, h: 262, alt: tr("fx-bud-alt", "The size of each term of the pseudorange equation on a logarithmic scale, from the 20,000 km of the geometric range down to the metre-level corrections") });
  const B = budget();
  // ionosphère : Klobuchar avec de vrais coefficients (BRDC IGS du 10 avril 2025, [7]), à 45°N, satellites ≥ 10°
  const ion = { a: [3.2596e-8, 1.4901e-8, -1.7881e-7, -5.9605e-8], b: [137220, 16384, -327680, 327680] };
  let iLo = Infinity, iHi = 0;
  for (let hh = 0; hh < 24; hh++) for (const el of [10, 30, 90]) { const v = klobuchar(ion, 45, 0, 0, el, hh * 3600); iLo = Math.min(iLo, v); iHi = Math.max(iHi, v); }
  const tropZ = 2.3, rows = [
    [tr("fx-bud-1", "geometric range |s − x|"), B.rangeMin, B.rangeMax, C.globe],
    [tr("fx-bud-2", "satellite clock (up to 1 ms)"), 1, B.satClock, C.ink],
    [tr("fx-bud-3", "Earth's turn during the flight"), 1, B.sagnac, C.ink],
    [tr("fx-bud-4", "ionosphere (Klobuchar, ≥ 10°)"), iLo, iHi, C.flat],
    [tr("fx-bud-5", "troposphere (zenith → 10°)"), tropZ, tropZ / Math.sin(10 * D2R), C.flat],
    [tr("fx-bud-6", "relativity (e = 0.02)"), 1, B.rel, C.ink],
    [tr("fx-bud-7", "group delay TGD (G27)"), 0.6, 2.328306436539e-9 * 299792458, C.ink],
  ];
  const x0 = 196, x1 = 444, lo = 0, hi = 8, X = (m) => x0 + (Math.log10(Math.max(1, m)) - lo) / (hi - lo) * (x1 - x0);
  for (const [v, l] of [[1, "1 m"], [1e3, "1 km"], [1e6, `${num(1000)} km`]]) { f.dash(X(v), 34, X(v), 222); f.note(X(v), 236, l, { size: 10, anchor: "middle" }); }
  rows.forEach(([t, a, b, col], i) => {
    const y = 46 + i * 26;
    f.note(8, y + 4, t, { size: 10.5, c: C.ink });
    f.path(`M${X(a)} ${y - 5}H${Math.max(X(b), X(a) + 2)}V${y + 5}H${X(a)}Z`, { c: col, w: 1, fill: col });
    const v = (m) => (m >= 1e4 ? `${num(m / 1000)} km` : `${num(m, m < 10 ? 1 : 0)} m`), lab = a > 1 ? `${v(a)}–${v(b)}` : v(b);
    if (X(b) > 400) f.note(X(a) - 6, y + 4, lab, { size: 9.5, anchor: "end" }); else f.note(X(b) + 6, y + 4, lab, { size: 9.5 });
  });
  f.note(x1, 256, tr("fx-bud-8", "metres, logarithmic scale; receiver clock: an unknown"), { size: 10, anchor: "end" });
  computed(f, tr, tr("fx-bud-s", "typical ranges"));
  return f;
}

// ④ Gauss-Newton depuis l'origine, sur un ciel synthétique (le vrai code de la page)
function figIter(tr) {
  const f = FIG.make({ w: 460, h: 236, alt: tr("fx-it-alt", "Starting from the centre of the Earth, each least-squares step moves the solution: its distance from the centre after each iteration, up to the surface") });
  const { nav, ep, truth } = syntheticSky(), trace = [];
  solveEpoch(nav, ep, trace);
  const pts = [{ x: [0, 0, 0], rms: trace[0]?.rms ?? 0 }, ...trace];
  const n = pts.length, x0 = 56, x1 = 440, y0 = 40, y1 = 190, top = 8000;
  const X = (k) => x0 + k / (n - 1) * (x1 - x0), Y = (km) => y1 - km / top * (y1 - y0);
  for (const v of [0, 2000, 4000, 6000, 8000]) { f.dash(x0, Y(v), x1, Y(v)); f.note(x0 - 6, Y(v) + 4, num(v), { size: 10, anchor: "end" }); }
  f.note(x0 - 40, y0 - 14, tr("fx-it-1", "distance from the centre (km)"), { size: 10 });
  f.dash(x0, Y(Math.hypot(...truth) / 1000), x1, Y(Math.hypot(...truth) / 1000), { c: C.globe, dash: "2 3" });
  let d = "";
  pts.forEach((p, k) => { const r = Math.hypot(...p.x) / 1000; d += `${k ? "L" : "M"}${X(k)} ${Y(r)}`; });
  f.path(d, { c: C.globe, w: 1.8 });
  pts.forEach((p, k) => { const r = Math.hypot(...p.x) / 1000; f.dot(X(k), Y(r), { r: 3.4, c: C.globe }); f.note(X(k), y1 + 16, String(k), { size: 10, anchor: "middle" }); });
  f.note(x1, y1 + 32, tr("fx-it-2", "iteration"), { size: 10, anchor: "end" });
  const last = pts[n - 1], err = Math.hypot(last.x[0] - truth[0], last.x[1] - truth[1], last.x[2] - truth[2]);
  f.note(X(1) + 10, Y(1200), `${tr("fx-it-3", "start: (0, 0, 0); residuals")} ${num(pts[0].rms / 1000)} km`, { size: 10.5, c: C.ink });
  f.note(X(1) + 10, Y(400), `${tr("fx-it-4", "end:")} ${num(Math.hypot(...last.x) / 1000, 1)} km, ${num(err, 1)} m ${tr("fx-it-5", "from the true position")}`, { size: 10.5, c: C.globe });
  computed(f, tr, `${tr("fx-it-s", "synthetic sky")}, ${ep.obs.length} ${tr("fx-it-s2", "satellites")}`);
  return f;
}

// ⑤ l'arrondi du code
function figRound(tr) {
  const f = FIG.make({ w: 460, h: 222, alt: tr("fx-rd-alt", "A grid of step q: the position solved by the phone is replaced by the nearest grid node, which is what the code carries; any position in the square around that node gives the same code") });
  const g = 50, x0 = 26, y0 = 30, nx = 4, ny = 3;
  for (let i = 0; i <= nx; i++) f.line(x0 + i * g, y0, x0 + i * g, y0 + ny * g, { c: "#d7dce2", w: 1 });
  for (let j = 0; j <= ny; j++) f.line(x0, y0 + j * g, x0 + nx * g, y0 + j * g, { c: "#d7dce2", w: 1 });
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) f.dot(x0 + i * g, y0 + j * g, { r: 1.8, c: C.faint });
  const P = [x0 + 1.76 * g, y0 + 1.24 * g], R = [x0 + 2 * g, y0 + 1 * g];
  f.path(`M${R[0] - g / 2} ${R[1] - g / 2}H${R[0] + g / 2}V${R[1] + g / 2}H${R[0] - g / 2}Z`, { c: C.flat, w: 1.2, dash: "4 3" });
  f.arrow(P[0], P[1], R[0] - 3, R[1] + 3, { c: C.ink, w: 1.3, head: 6 });
  f.dot(P[0], P[1], { r: 4.2, c: C.globe });
  f.dot(R[0], R[1], { r: 4.6, c: C.flat });
  f.note(P[0] - 6, P[1] + 16, tr("fx-rd-1", "your fix"), { size: 10.5, c: C.globe, anchor: "end" });
  f.note(R[0] + 8, R[1] - 8, tr("fx-rd-2", "in the code"), { size: 10.5, c: C.flat });
  f.line(x0, y0 + ny * g + 12, x0 + g, y0 + ny * g + 12, { c: C.ink, w: 1.2 });
  f.txt(x0 + g / 2, y0 + ny * g + 28, "q", { size: 13, anchor: "middle", tex: "q" });
  const x = 256;
  f.note(x, 48, tr("fx-rd-3", "x, y and z are each rounded"), { size: 10.5 });
  f.note(x, 64, tr("fx-rd-4", "to the nearest multiple of q"), { size: 10.5 });
  f.note(x, 94, tr("fx-rd-5", "error spread evenly over ±q/2:"), { size: 10.5 });
  f.note(x, 110, tr("fx-rd-6", "σ = q/√12 ≈ 0.29 q per axis"), { size: 10.5, c: C.ink });
  f.note(x, 140, tr("fx-rd-7", "q = 1 km: ± 0.5 km"), { size: 10.5 });
  f.note(x, 156, tr("fx-rd-8", "q = 10 km: ± 5 km"), { size: 10.5 });
  f.note(x, 172, tr("fx-rd-9", "exact: the fix itself, ~10 m"), { size: 10.5 });
  f.note(x, 202, tr("fx-rd-10", "dashed: same code anywhere inside"), { size: 10.5, c: C.flat });
  stamp(f, tr, tr("fx-rd-s", "schematic, 2 of the 3 axes"));
  return f;
}

// ⑥ le bombement sur une corde de 3 000 km, à l'échelle vraie
function figSag(tr) {
  const f = FIG.make({ w: 460, h: 226, alt: tr("fx-sag-alt", "An arc of the Earth 3,000 km long drawn at true scale above its chord: the surface rises above the straight line by the sagitta s") });
  const R = 6371, L = 3000, k = 400 / L, xa = 30, xb = 430, yc = 176, s = sagitta(R * 1e3, L * 1e3) / 1e3, Rp = R * k;
  f.path(`M${xa} ${yc}A${Rp} ${Rp} 0 0 1 ${xb} ${yc}`, { c: C.globe, w: 2.2 });
  f.line(xa, yc, xb, yc, { c: C.flat, w: 1.6, dash: "6 4" });
  // cinq participants sur l'arc
  const cyc = yc + Math.sqrt(R * R - (L / 2) ** 2) * k;
  for (const u of [-0.9, -0.45, 0, 0.5, 0.85]) { const x = 230 + u * 200; f.dot(x, cyc - Math.sqrt(Rp * Rp - (x - 230) ** 2), { r: 3.6, c: C.globe }); }
  f.arrow(230, yc, 230, yc - s * k + 2, { c: C.ink, w: 1.4, head: 6 });
  f.note(238, yc - 6, `s = ${num(s)} km`, { size: 11, c: C.ink });
  f.note(230, yc + 20, `L = ${num(L)} km`, { size: 11, anchor: "middle" });
  f.note(xb, yc + 40, tr("fx-sag-1", "dashed: the straight line (a plane)"), { size: 10, anchor: "end", c: C.flat });
  f.txt(14, 44, "s = R − √(R² − (L/2)²) ≈ L²/8R", { size: 12 });
  f.note(14, 64, `R = ${num(R)} km, L = ${num(L)} km: s = ${num(s)} km (≈ ${num(L * L / 8 / R)} km)`, { size: 10.5 });
  f.stamped = true; f.note(f.w - 4, 12, tr("fx-ts", "true scale"), { anchor: "end", c: C.soft, size: 10 });
  return f;
}

// ⑦ l'incertitude sur R selon l'étendue du groupe et l'arrondi (grouplogic.groupFit)
function figSigma(tr) {
  const f = FIG.make({ w: 460, h: 258, alt: tr("fx-sig-alt", "Uncertainty of the group's radius against the size of the group, for positions rounded to 10 km, 1 km, or exact: the farther apart, the tighter") });
  // groupe type : un centre à 45°N 10°E et cinq points sur un cercle de diamètre L, sur l'ellipsoïde
  const ring = (L, step) => {
    const d = L / 2 / 6371e3, la = 45 * D2R, lo = 10 * D2R, parts = [{ x: ecef(45, 10, 0), step }];
    for (let k = 0; k < 5; k++) {
      const b = k * 72 * D2R, la2 = Math.asin(Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(b));
      const lo2 = lo + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la), Math.cos(d) - Math.sin(la) * Math.sin(la2));
      parts.push({ x: ecef(la2 / D2R, lo2 / D2R, 0), step });
    }
    return groupFit(parts).noise / 1000;
  };
  const Ls = [300, 500, 1000, 2000, 3000, 5000, 8000], x0 = 60, x1 = 400, y0 = 34, y1 = 206;
  const X = (L) => x0 + (Math.log10(L) - Math.log10(200)) / (Math.log10(10000) - Math.log10(200)) * (x1 - x0);
  const Y = (km) => y1 - (Math.log10(km) + 2) / 6 * (y1 - y0);          // 0,01 km … 10 000 km
  for (const v of [0.01, 0.1, 1, 10, 100, 1000, 10000]) { f.dash(x0, Y(v), x1, Y(v)); f.note(x0 - 6, Y(v) + 4, num(v, v < 1 ? 2 : 0), { size: 9.5, anchor: "end" }); }
  for (const L of [300, 1000, 3000, 10000]) f.note(X(L), y1 + 16, num(L), { size: 10, anchor: "middle" });
  f.note(x1, y1 + 32, tr("fx-sig-1", "largest distance in the group (km)"), { size: 10, anchor: "end" });
  f.note(x0 - 50, y0 - 14, tr("fx-sig-2", "uncertainty on R (km)"), { size: 10 });
  for (const [step, col, lab] of [[10000, C.flat, "q = 10 km"], [1000, C.globe, "q = 1 km"], [1, C.sea, tr("fx-sig-3", "exact")]]) {
    let d = "";
    Ls.forEach((L, i) => { const v = Math.min(9000, ring(L * 1e3, step)); d += `${i ? "L" : "M"}${X(L)} ${Y(v)}`; f.dot(X(L), Y(v), { r: 2.6, c: col }); });
    f.path(d, { c: col, w: 1.6 });
    f.note(X(8000) + 8, Y(Math.min(9000, ring(8000e3, step))) + 4, lab, { size: 10.5, c: col });
  }
  computed(f, tr, tr("fx-sig-s", "six participants, noise only"));
  return f;
}

// ⑧ la courbure locale de l'ellipsoïde : M (nord-sud) et N (est-ouest)
function figMN(tr) {
  const f = FIG.make({ w: 460, h: 236, alt: tr("fx-mn-alt", "The local radius of curvature of the WGS84 ellipsoid against latitude: north-south, from 6,335 km at the equator to 6,400 km at the poles, and east-west, from 6,378 to 6,400 km") });
  const x0 = 56, x1 = 440, y0 = 30, y1 = 196, lo = 6330, hi = 6405;
  const X = (l) => x0 + l / 90 * (x1 - x0), Y = (km) => y1 - (km - lo) / (hi - lo) * (y1 - y0);
  for (const v of [6340, 6360, 6380, 6400]) { f.dash(x0, Y(v), x1, Y(v)); f.note(x0 - 6, Y(v) + 4, num(v), { size: 10, anchor: "end" }); }
  for (const l of [0, 30, 60, 90]) f.note(X(l), y1 + 16, `${l}°`, { size: 10, anchor: "middle" });
  f.note(x1, y1 + 32, tr("fx-mn-1", "latitude"), { size: 10, anchor: "end" });
  f.note(x0 - 46, y0 - 14, tr("fx-mn-2", "radius of curvature (km)"), { size: 10 });
  const curve = (fn) => { let d = ""; for (let l = 0; l <= 90; l += 2) d += `${l ? "L" : "M"}${X(l)} ${Y(fn(l) / 1000)}`; return d; };
  f.path(curve(radiiM), { c: C.globe, w: 2 });
  f.path(curve(radiiN), { c: C.sea, w: 2 });
  const Rs = rawData().earth.R / 1000;
  f.line(x0, Y(Rs), x1, Y(Rs), { c: C.ink, w: 1.1, dash: "5 4" });
  f.note(X(4), Y(Rs) - 6, `${tr("fx-mn-3", "sphere of the stations")}: ${num(Rs, 1)} km`, { size: 10, c: C.ink });
  f.note(X(30), Y(radiiM(30) / 1000) + 18, tr("fx-mn-4", "M: north–south"), { size: 10.5, c: C.globe });
  f.note(X(18), Y(radiiN(18) / 1000) - 16, tr("fx-mn-5", "N: east–west"), { size: 10.5, c: C.sea });
  computed(f, tr, "WGS84");
  return f;
}

export const FORMULA_FIGS = { rxFxClock: figClock, rxFxKepler: figKepler, rxFxBudget: figBudget, rxFxIter: figIter, rxFxRound: figRound, rxFxSag: figSag, rxFxSigma: figSigma, rxFxMN: figMN };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "rx"); }
