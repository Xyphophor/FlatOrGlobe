// Figures de l'onglet rot (epic19) : une par formule, plus les tracés de données.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { ringRows, ringRatio, fallRows, fallStats, OMEGA_REF } from "./logic.js";

const C = FIG.C;

/** L'anneau (vu de dessus, deux faisceaux) et le globe : l'axe de l'anneau = la verticale locale, à 90° − φ de l'axe terrestre. */
function figRing(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-ring-alt", "Left: a square ring seen from above with two laser beams running in opposite directions. Right: a globe with its rotation axis and, at latitude phi, the local vertical, which is the ring's axis; the rotation felt about it is Omega times sine phi. On a disc turning about the pole every vertical is parallel to the axis") });
  f.path("M30 60 H130 V160 H30 Z", { c: C.ink, w: 1.6 });
  f.arrow(40, 52, 120, 52, { c: C.globe }); f.arrow(138, 70, 138, 150, { c: C.globe });
  f.arrow(120, 168, 40, 168, { c: C.flat }); f.arrow(22, 150, 22, 70, { c: C.flat });
  f.note(80, 190, tr("fx-ring-1", "beat f = 4AΩv/λP"), { anchor: "middle", size: 10 });
  const cx = 270, cy = 120, r = 70;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6 });
  f.arrow(cx, cy + r + 18, cx, cy - r - 22, { c: C.ink, w: 1.4 });
  f.note(cx + 6, cy - r - 12, "Ω", { size: 12 });
  const phi = 45 * Math.PI / 180, px = cx + r * Math.cos(phi), py = cy - r * Math.sin(phi);
  f.dash(cx, cy, px, py, { c: C.faint });
  f.arrow(px, py, px + 40 * Math.cos(phi), py - 40 * Math.sin(phi), { c: C.globe, w: 1.6 });
  f.angle(cx, cy, 22, 0, 45, { label: "φ", tex: "\\varphi", c: C.soft });
  f.note(372, py - 46, tr("fx-ring-2", "vertical: Ω sin φ"), { c: C.globe, size: 10, anchor: "end" });
  f.note(8, 222, tr("fx-ring-3", "disc turning about its pole: every vertical ∥ axis, Ω everywhere"), { size: 9.5, c: C.flat });
  stamp(f, tr, tr("fx-ring-st", "ring and globe not to the same scale"));
  return f;
}

/** Ωv lu par chaque anneau, contre globe / disque / plan immobile. */
function figRingData(tr) {
  const rows = ringRows();
  const f = FIG.make({ w: 380, h: 70 + rows.length * 28, alt: tr("fx-ringd-alt", "For each ring, the rotation about its vertical read from the beat (dot), the globe's prediction Omega sine phi (blue tick), the disc's Omega (orange tick) and the plane at rest's zero. Christchurch rings read about 5.03 and Wettzell 5.52 in units of ten to the minus five radians per second; the disc would give 7.29 for all") });
  const X0 = 80, X1 = 360, V = 8e-5, x = (v) => X0 + (v / V) * (X1 - X0), Y0 = 30;
  for (const v of [0, 2e-5, 4e-5, 6e-5, 8e-5]) { f.dash(x(v), Y0 - 6, x(v), Y0 + rows.length * 28, { c: "#e7e3da" }); f.note(x(v), Y0 + rows.length * 28 + 14, String(v * 1e5), { anchor: "middle" }); }
  rows.forEach((r, i) => {
    const y = Y0 + 10 + i * 28, s = Math.abs(Math.sin(r.lat * Math.PI / 180));
    f.note(X0 - 8, y + 4, r.id, { anchor: "end" });
    f.line(x(OMEGA_REF * s), y - 8, x(OMEGA_REF * s), y + 8, { c: C.globe, w: 2 });
    f.line(x(OMEGA_REF), y - 8, x(OMEGA_REF), y + 8, { c: C.flat, w: 2 });
    f.line(x(0), y - 8, x(0), y + 8, { c: C.flat, w: 2 });
    f.dot(x(r.omegaN), y, { r: 3.5, c: C.ink });
  });
  f.note(4, 58 + rows.length * 28, tr("fx-ringd-1", "rotation about the vertical, 10⁻⁵ rad/s"), { size: 9.5 });
  f.note(372, 58 + rows.length * 28, tr("fx-ringd-2", "blue globe · orange disc, plane at rest"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-ringd-st", "Ωv axis"));
  return f;
}

/** La chute : le haut du puits va plus vite vers l'est que le fond. */
function figFall(tr) {
  const f = FIG.make({ w: 380, h: 234, alt: tr("fx-fall-alt", "A shaft of height h. Its top moves east faster than its bottom because it is further from the axis; a ball released at the top keeps that extra speed and lands a distance d east of the plumb point") });
  f.ground(190, 40, 340);
  f.line(150, 190, 150, 40, { c: C.soft, w: 1 }); f.line(230, 190, 230, 40, { c: C.soft, w: 1 });
  f.dash(190, 40, 190, 190, { c: C.ink });
  f.path("M190 40 Q 192 120 206 190", { c: C.globe, w: 2 });
  f.dot(190, 40, { r: 4 }); f.dot(206, 190, { r: 4, c: C.globe });
  f.seg(190, 202, 206, 202, { label: "d", c: C.globe, side: 10 });
  f.seg(120, 40, 120, 190, { label: "h", c: C.soft, side: -12 });
  f.arrow(250, 50, 300, 50, { c: C.globe }); f.note(305, 54, tr("fx-fall-1", "ω(R + h)"), { size: 10 });
  f.arrow(250, 180, 290, 180, { c: C.globe }); f.note(295, 184, tr("fx-fall-2", "ωR"), { size: 10 });
  f.note(8, 228, tr("fx-fall-3", "east is to the right · d = ⅓ ω g t³ cos φ"), { size: 9.5 });
  stamp(f, tr, tr("fx-fall-st", "offset enlarged ~1,000×"));
  return f;
}

/** ω de chaque chute, barres d'erreur, globe et zéro plat. */
function figFallData(tr) {
  const rows = fallRows(), kept = fallStats().kept;
  const f = FIG.make({ w: 380, h: 84 + rows.length * 26, alt: tr("fx-falld-alt", "The rotation rate implied by each experiment, in units of ten to the minus five radians per second: Benzenberg 7.6, Reich 7.5, Hall 6.1, Bähr 8.4, Guglielmini 12.8 (set aside). The stars' rotation, 7.29, is drawn for comparison; both flat models predict zero") });
  const X0 = 112, X1 = 364, V = 14e-5, x = (v) => X0 + (v / V) * (X1 - X0), Y0 = 30;
  for (const v of [0, 4e-5, 8e-5, 12e-5]) { f.dash(x(v), Y0 - 6, x(v), Y0 + rows.length * 26, { c: "#e7e3da" }); f.note(x(v), Y0 + rows.length * 26 + 14, String(Math.round(v * 1e5)), { anchor: "middle" }); }
  f.line(x(OMEGA_REF), Y0 - 6, x(OMEGA_REF), Y0 + rows.length * 26, { c: C.globe, w: 1.4 });
  f.line(x(0), Y0 - 6, x(0), Y0 + rows.length * 26, { c: C.flat, w: 2 });
  rows.forEach((r, i) => {
    const y = Y0 + 10 + i * 26, out = !kept.includes(r.who);
    f.note(X0 - 8, y + 4, `${r.who} ${r.year}`, { anchor: "end", size: 10 });
    if (r.eOmega) f.line(x(r.omega - r.eOmega), y, x(r.omega + r.eOmega), y, { c: C.ink, w: 1.4 });
    f.dot(x(r.omega), y, { r: 3.5, c: out ? C.faint : C.ink });
  });
  f.note(4, 58 + rows.length * 26, tr("fx-falld-1", "ω, 10⁻⁵ rad/s · blue: the stars' rotation"), { size: 9.5 });
  f.note(4, 71 + rows.length * 26, tr("fx-falld-2", "orange: both flat models · grey: set aside"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-falld-st", "ω axis"));
  return f;
}

/** Le jour sidéral : la même étoile derrière le même repère, 3 min 56 s plus tôt chaque nuit. */
function figSid(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("fx-sid-alt", "A fixed edge, such as a chimney, and a star approaching it. Night 1 the star disappears at t1; N nights later it disappears at t2, about N times 3 minutes 56 seconds earlier on the clock") });
  f.path("M250 40 V170 H300 V40 Z", { c: C.ink, w: 1.6, fill: C.wash });
  f.ground(170, 30, 360);
  for (const [i, y, lab] of [[0, 70, tr("fx-sid-1", "night 1: t₁")], [1, 120, tr("fx-sid-2", "night N: t₂ ≈ t₁ − N·3 min 56 s")]]) {
    f.dot(236 - i * 40, y, { r: 4, c: C.globe });
    f.arrow(176 - i * 40, y, 226 - i * 40, y, { c: C.globe, w: 1.2 });
    f.note(20, y - 10, lab, { size: 10 });
  }
  f.note(8, 192, tr("fx-sid-3", "one turn: 23 h 56 min 4 s; 366.24 turns a year"), { size: 9.5 });
  stamp(f, tr, tr("fx-sid-st", "schematic"));
  return f;
}

/** Les déviations MESURÉES (mm), chacune avec sa prédiction du globe ; les deux modèles plats : 0 (2026-10-07, carte « fall »). */
function figFallMm(tr) {
  const rows = fallRows(), kept = fallStats().kept, RH = 34;
  const f = FIG.make({ w: 380, h: 82 + rows.length * RH, alt: tr("fx-fallmm-alt", "Eastward offset of a dropped ball, measured in five experiments, each beside the offset the rotating globe predicts for its height and latitude: Guglielmini 1791, 78 m, 18.9 mm measured; Benzenberg 1802, 76 m, 9.0 mm; Reich 1831, 158.5 m, 28.4 mm; Hall 1903, 23 m, 1.49 mm; Bähr 2005, 145 m, 26.4 mm. Both flat models predict zero") });
  const X0 = 128, X1 = 300, D = 32, x = (d) => X0 + (d / D) * (X1 - X0), Y0 = 26, yb = Y0 + rows.length * RH;
  for (const d of [0, 10, 20, 30]) { f.dash(x(d), Y0 - 6, x(d), yb, { c: "#e7e3da" }); f.note(x(d), yb + 13, String(d), { anchor: "middle" }); }
  f.line(x(0), Y0 - 6, x(0), yb, { c: C.flat, w: 2 });
  const nf = (v, k) => v.toFixed(k).replace(".", tr("fx-dec", "."));
  rows.forEach((r, i) => {
    const y = Y0 + 12 + i * RH, out = !kept.includes(r.who), col = out ? C.faint : C.ink;
    f.note(X0 - 8, y, `${r.who} ${r.year}`, { anchor: "end", size: 10, c: col });
    f.note(X0 - 8, y + 12, `${nf(r.h, r.h % 1 ? 1 : 0)} m${r.n ? ` · ${r.n} ${tr("fx-fallmm-drops", "drops")}` : ""}`, { anchor: "end", size: 9, c: C.soft });
    f.line(x(0), y + 3, x(r.d), y + 3, { c: col, w: 5 });                                        // la déviation mesurée
    if (r.e) f.line(x(r.d - r.e), y - 3, x(r.d + r.e), y - 3, { c: C.ink, w: 1.2 });
    f.line(x(r.dGlobe), y - 5, x(r.dGlobe), y + 11, { c: C.globe, w: 2 });                         // la prédiction du globe
    f.note(X1 + 6, y + 2, `${nf(r.d, r.d < 5 ? 2 : 1)}${r.e ? ` ± ${nf(r.e, r.d < 5 ? 2 : 1)}` : ""}`, { size: 9.5, c: col });
    f.note(X1 + 6, y + 13, `${tr("fx-fallmm-g", "globe")} ${nf(r.dGlobe, r.dGlobe < 5 ? 2 : 1)}`, { size: 9, c: C.globe });
  });
  f.note(4, yb + 30, tr("fx-fallmm-1", "eastward offset, mm · bar: measured · blue tick: the globe"), { size: 9.5 });
  f.note(4, yb + 43, tr("fx-fallmm-2", "orange: both flat models (0) · grey: set aside"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-fallmm-st", "mm axis"));
  return f;
}

/** Les fréquences MESURÉES des quatre anneaux, à côté du globe (Ω sin φ), du disque (Ω) et du plan immobile (0) ; 2026-10-07, carte « ring ». */
function figRingHz(tr) {
  const rows = ringRows(), R = ringRatio(), RH = 30, Y0 = 44;
  const f = FIG.make({ w: 380, h: Y0 + rows.length * RH + 58, alt: tr("fx-ringhz-alt", "Table of the four ring lasers: size, latitude, measured beat frequency and the frequencies the globe and a disc turning about its pole predict. C-II, 1 by 1 m at 43.6 degrees south: 79.4 hertz measured. UG1, 21 by 17.5 m: 1,513. UG2, 21 by 39.7 m: 2,177. G at Wettzell, 4 by 4 m at 49.1 degrees north: 348.6. Each matches the globe; the disc is 32 to 45 percent higher; a plane at rest gives zero") });
  const nf = (v, k) => { const [i, d] = v.toFixed(k).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, tr("fx-thou", ",")) + (d ? tr("fx-dec", ".") + d : ""); };
  const X = [6, 64, 148, 218, 278, 336];
  const head = [tr("fx-ringhz-h0", "ring"), tr("fx-ringhz-h1", "size"), tr("fx-ringhz-h2", "latitude"), tr("fx-ringhz-h3", "measured"), tr("fx-ringhz-h4", "globe"), tr("fx-ringhz-h5", "disc")];
  head.forEach((h, i) => f.note(i < 3 ? X[i] : X[i] + 34, Y0 - 12, h, { size: 9.5, anchor: i < 3 ? "start" : "end", c: i === 4 ? C.globe : i === 5 ? C.flat : C.soft }));
  f.line(4, Y0 - 6, 376, Y0 - 6, { c: C.faint, w: 1 });
  rows.forEach((r, i) => {
    const y = Y0 + 12 + i * RH, k = r.f < 100 ? 1 : r.f < 1000 ? 1 : 0;
    f.txt(X[0], y, r.id, { size: 11 });
    f.note(X[0], y + 12, r.site.split(",")[0], { size: 8.5 });
    f.note(X[1], y, `${nf(r.a, r.a % 1 ? 1 : 0)} × ${nf(r.b, r.b % 1 ? 1 : 0)} m`, { size: 10, c: C.ink });
    f.note(X[2], y, `${nf(Math.abs(r.lat), 1)}° ${r.lat < 0 ? tr("fx-ringhz-s", "S") : tr("fx-ringhz-n", "N")}`, { size: 10, c: C.ink });
    f.txt(X[3] + 34, y, nf(r.f, r.f % 1 ? Math.min(3, String(r.f).split(".")[1].length) : 0), { size: 11, anchor: "end" });
    f.note(X[4] + 34, y, nf(r.fGlobe, k), { size: 10, anchor: "end", c: C.globe });
    f.note(X[5] + 34, y, nf(r.fDisc, k), { size: 10, anchor: "end", c: C.flat });
  });
  const yb = Y0 + rows.length * RH;
  f.line(4, yb, 376, yb, { c: C.faint, w: 1 });
  f.note(4, yb + 16, tr("fx-ringhz-1", "beat frequency, Hz · a plane at rest: 0 Hz for every ring"), { size: 9.5 });
  f.note(4, yb + 30, tr("fx-ringhz-2", "Wettzell ÷ Christchurch, per unit of scale factor:"), { size: 9.5 });
  f.note(4, yb + 44, `${tr("fx-ringhz-3", "measured")} ${nf(R.measured, 4)} · ${tr("fx-ringhz-4", "globe")} ${nf(R.globe, 4)} · ${tr("fx-ringhz-5", "disc")} 1`, { size: 9.5, c: C.ink });
  f.stamped = true;                                  // un tableau de nombres : rien n'est dessiné à une échelle
  f.note(f.w - 4, 12, tr("fx-ringhz-st", "measured values, Schreiber and Stedman"), { anchor: "end", c: C.soft, size: 10 });
  return f;
}

export const FORMULA_FIGS = { rotFxRing: figRing, rotFigRing: figRingData, rotFigRingHz: figRingHz, rotFxFall: figFall, rotFigFall: figFallData, rotFigFallMm: figFallMm, rotFxSid: figSid };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "rot"); }
