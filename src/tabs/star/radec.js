// Onglet star, sections « sky-* » (2026-11-11, demande du propriétaire) : l'ascension droite et la
// déclinaison, la sphère des étoiles et sa carte, ce qui change au fil des siècles et ce qu'une latitude
// laisse voir. Quatre animations canvas (rendu de nuit, comme la figure d'ouverture), trois schémas de
// formules, deux tables. Les étoiles sont celles d'Hipparcos (`fog build star-hip`) ; les nombres viennent
// de radec-logic.js. Ce qui n'est pas à l'échelle est imprimé (règle 1) : la sphère est une carte de
// DIRECTIONS, les distances des étoiles n'y sont pas.
import { anim2d, text, disc } from "../../core/anim2d.js";
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import * as L from "./radec-logic.js";

const D2R = Math.PI / 180, R2D = 180 / Math.PI, TAU = 2 * Math.PI;
const N = { ink: "#e6ecf7", soft: "#9fb0cc", faint: "#6b7a96", grid: "#8aa0c8", eq: "#5eead4", ecl: "#fcd34d",
  ra: "#fbbf24", dec: "#7dd3fc", never: "#f87171", always: "#5eead4", earth: "#3b82f6", warn: "#fbbf24" };
const clamp = (x) => Math.max(0, Math.min(1, x)), smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerpAng = (a, b, k) => a + ((((b - a + Math.PI) % TAU) + TAU) % TAU - Math.PI) * k;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

function night(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#070b1a"); g.addColorStop(1, "#141f3d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const starCol = (bv) => (bv == null ? "#f4f6ff" : bv < 0 ? "#b9ccff" : bv < 0.3 ? "#dfe6ff" : bv < 0.6 ? "#fff6e8" : bv < 1 ? "#ffe2b0" : "#ffc487");
function drawStar(ctx, x, y, v, bv, a = 1, col = null) {
  const r = Math.max(0.6, 2.6 - 0.44 * v);
  ctx.globalAlpha = a;
  if (v < 1.6 && !col) { ctx.fillStyle = "rgba(190,210,255,0.16)"; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = col || starCol(bv); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
/** Caméra orthographique sur la sphère vue du dehors : renvoie [x, y, profondeur] (profondeur > 0 = face tournée vers nous). */
function camera(cx, cy, R, yaw, pitch) {
  const c = Math.cos(yaw), s = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return (v) => { const x1 = v[0] * c - v[1] * s, y1 = v[0] * s + v[1] * c; return [cx + R * y1, cy - R * (-x1 * sp + v[2] * cp), x1 * cp + v[2] * sp]; };
}
/** Courbe sur la sphère : la partie arrière est tracée plus pâle (boule de verre). */
function curve(ctx, P, pts, col, w, aF = 1, aB = 0.3, dash = null) {
  const q = pts.map(P);
  for (const front of [false, true]) {
    ctx.beginPath(); let pen = false;
    for (let i = 1; i < q.length; i++) {
      if ((q[i - 1][2] >= 0) === front && (q[i][2] >= 0) === front) { if (!pen) { ctx.moveTo(q[i - 1][0], q[i - 1][1]); pen = true; } ctx.lineTo(q[i][0], q[i][1]); } else pen = false;
    }
    ctx.globalAlpha = front ? aF : aB; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.stroke();
  }
  ctx.setLineDash([]); ctx.globalAlpha = 1;
}
const parallel = (dec, a0 = 0, a1 = 360, n = 72) => Array.from({ length: n + 1 }, (_, i) => L.vec(a0 + (a1 - a0) * i / n, dec));
const meridian = (ra, d0 = -90, d1 = 90, n = 36) => Array.from({ length: n + 1 }, (_, i) => L.vec(ra, d0 + (d1 - d0) * i / n));
const ecliptic = () => Array.from({ length: 73 }, (_, i) => { const l = i * 5 * D2R, e = L.OBLIQUITY * D2R; return [Math.cos(l), Math.sin(l) * Math.cos(e), Math.sin(l) * Math.sin(e)]; });
const circleAbout = (axis, radDeg, n = 72) => {
  const a = unit(cross(axis, Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), b = cross(axis, a), c = Math.cos(radDeg * D2R), s = Math.sin(radDeg * D2R);
  return Array.from({ length: n + 1 }, (_, i) => { const t = i / n * TAU; return [0, 1, 2].map((k) => axis[k] * c + s * (Math.cos(t) * a[k] + Math.sin(t) * b[k])); });
};

/** La boule de verre commune : contour, grille, équateur, axe, Terre au centre, étoiles, astérismes. */
function glassBall(ctx, P, cx, cy, R, stars, tr, { ecl = true, style = null } = {}) {
  const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); halo.addColorStop(0, "rgba(60,90,160,0.10)"); halo.addColorStop(1, "rgba(60,90,160,0.02)");
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  for (const d of [-60, -30, 30, 60]) curve(ctx, P, parallel(d), N.grid, 0.7, 0.32, 0.12);
  for (let a = 0; a < 360; a += 30) curve(ctx, P, meridian(a), N.grid, 0.7, 0.32, 0.12);
  if (ecl) curve(ctx, P, ecliptic(), N.ecl, 1, 0.75, 0.25, [4, 4]);
  curve(ctx, P, parallel(0), N.eq, 1.5, 0.95, 0.4);
  const n = P([0, 0, 1.13]), s = P([0, 0, -1.13]);
  ctx.strokeStyle = N.soft; ctx.globalAlpha = 0.7; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(n[0], n[1]); ctx.lineTo(s[0], s[1]); ctx.stroke(); ctx.globalAlpha = 1;
  // astérismes
  const pos = new Map(stars.map((o) => [o.s.hip, o.v]));
  ctx.lineWidth = 0.9; ctx.strokeStyle = "#9fb7e8";
  for (const segs of Object.values(L.ASTERISMS)) for (const [a, b] of segs) {
    const A = P(pos.get(a)), B = P(pos.get(b)); ctx.globalAlpha = A[2] + B[2] < 0 ? 0.75 : 0.3;
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // étoiles : la face arrière est le ciel vu de l'intérieur, elle est la plus nette
  for (const o of stars) { const q = P(o.v), st = style ? style(o) : null; drawStar(ctx, q[0], q[1], o.s.v, o.s.bv, (q[2] < 0 ? 1 : 0.5) * (st?.a ?? 1), st?.col || null); }
  disc(ctx, cx, cy, 4.5, N.earth, "#bfdbfe", 1);
  text(ctx, tr("sky-earth", "Earth"), cx + 8, cy + 4, { c: N.soft, size: 10 });
  text(ctx, tr("sky-np", "north celestial pole"), n[0] + 6, n[1] + 3, { c: N.soft, size: 10 });
  text(ctx, tr("sky-sp", "south celestial pole"), s[0] + 6, s[1] + 5, { c: N.soft, size: 10 });
}
/** Titre en haut à gauche, tampon (règle 1) à droite ou dessous si l'image est étroite ; renvoie la hauteur prise. */
function header(ctx, W, title, stampTxt, warn = true) {
  const narrow = W < 760, n = text(ctx, title, 10, 17, { c: N.ink, size: 12, bold: true, maxW: W - 20 });
  if (!narrow) { text(ctx, stampTxt, W - 10, 17, { c: warn ? N.warn : N.soft, size: 10, align: "right" }); return 26; }
  const m = text(ctx, stampTxt, 10, 17 + n * 16, { c: warn ? N.warn : N.soft, size: 10, maxW: W - 20 });
  return 12 + n * 16 + m * 13;
}
const fmtSigned = (nf) => (x, d = 1) => (x < 0 ? "−" : "+") + nf(Math.abs(x), d);

/* ---- 1. la sphère et ses deux angles ------------------------------------------------------------ */
export function mountSphere(canvas, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), sg = fmtSigned(nf);
  const stars = L.BRIGHT.map((s) => ({ s, v: L.moved(s, 2000) }));
  const EX = ["sirius", "vega", "canopus", "betelgeuse", "acrux", "polaris"].map((k) => { const c = L.radec(L.moved(L.named(k), 2000)); return { k, c, v: L.vec(c.ra, c.dec) }; });
  const SLOT = 6, yawOf = (e) => (28 - e.c.ra) * D2R;
  return anim2d(canvas, { span: SLOT * EX.length, u0: 0.09, draw(ctx, W, H, u) {
    night(ctx, W, H);
    const t = u * EX.length, i = Math.floor(t) % EX.length, f = t - Math.floor(t), e = EX[i], prev = EX[(i + EX.length - 1) % EX.length];
    const top = header(ctx, W, tr("sky-t-sphere", "Two angles place every star"), tr("sky-st-dir", "a map of directions — the stars' distances are not drawn"));
    const bot = W < 620 ? 82 : 60, R = Math.max(40, Math.min(W * 0.43, (H - top - bot) / 2 - 16)), cx = W / 2, cy = top + (H - top - bot) / 2;
    const P = camera(cx, cy, R, lerpAng(yawOf(prev), yawOf(e), smooth(f / 0.22)), 18 * D2R);
    glassBall(ctx, P, cx, cy, R, stars, tr);
    for (const h of [0, 6, 12, 18]) { const q = P(L.vec(h * 15, 0).map((x) => x * 1.07)); ctx.globalAlpha = q[2] >= 0 ? 1 : 0.45; text(ctx, `${h} h`, q[0], q[1] + 4, { c: N.eq, size: 10, align: "center" }); ctx.globalAlpha = 1; }
    const fa = clamp((f - 0.22) / 0.3), fd = clamp((f - 0.52) / 0.2);
    if (fa > 0) curve(ctx, P, parallel(0, 0, e.c.ra * fa, 90), N.ra, 3.2, 1, 0.55);
    if (fd > 0) curve(ctx, P, meridian(e.c.ra, 0, e.c.dec * fd), N.dec, 3.2, 1, 0.55);
    const eq0 = P([1, 0, 0]); disc(ctx, eq0[0], eq0[1], 3.2, N.ra);
    const q = P(e.v); disc(ctx, q[0], q[1], 8, null, "#ffffff", 1.4);
    const name = tr("sky-n-" + e.k, L.NAMES[e.k]);
    text(ctx, name, q[0] + (q[0] > cx + R * 0.5 ? -12 : 12), q[1] - 10, { c: N.ink, size: 12, bold: true, align: q[0] > cx + R * 0.5 ? "right" : "left" });
    const y0 = H - bot + 16, hm = L.hm(e.c.ra);
    text(ctx, name, 10, y0, { c: N.ink, size: 13, bold: true });
    if (fa > 0) text(ctx, tr("sky-read-ra", "right ascension α = {h} h {m} min · {deg}° eastwards from the March equinox").replace("{h}", hm.h).replace("{m}", String(hm.m).padStart(2, "0")).replace("{deg}", nf(e.c.ra, 1)), 10, y0 + 16, { c: N.ra, size: 11, maxW: W - 20 });
    if (fd > 0) text(ctx, tr(e.c.dec >= 0 ? "sky-read-decn" : "sky-read-decs", e.c.dec >= 0 ? "declination δ = {d}° · north of the celestial equator" : "declination δ = {d}° · south of the celestial equator").replace("{d}", sg(e.c.dec)), 10, y0 + (W < 620 ? 46 : 31), { c: N.dec, size: 11, maxW: W - 20 });
  } });
}

/* ---- 2. la précession : le pôle fait le tour en 25 772 ans ------------------------------------ */
export function mountPrec(canvas, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), sg = fmtSigned(nf);
  const n = L.ECL_POLE, up = unit([0, 0, 1].map((x, k) => x - n[2] * n[k])), right = cross(n, up), FOV = 43;
  const near = L.BRIGHT.filter((s) => L.sepDeg(L.vec(s.ra, s.dec), n) < FOV + 4);
  const LABELS = ["polaris", "thuban", "vega", "deneb", "kochab", "alderamin"];
  const circle = Array.from({ length: 181 }, (_, i) => L.poleAt(2000 + i / 180 * L.PRECESSION_PERIOD));
  return anim2d(canvas, { span: 40, u0: 0.17, draw(ctx, W, H, u) {
    night(ctx, W, H);
    const year = -3000 + u * L.PRECESSION_PERIOD;
    const top = header(ctx, W, tr("sky-t-prec", "The pole circles among the stars in 25,772 years"), tr("sky-st-prec", "map centred on the pole of the ecliptic · rate and tilt held constant"), false);
    const bot = W < 620 ? 82 : 62, R = Math.max(40, Math.min(W / 2 - 10, (H - top - bot) / 2 - 4)), cx = W / 2, cy = top + (H - top - bot) / 2, k = R / FOV;
    const P = (v) => { const a = Math.acos(Math.max(-1, Math.min(1, dot(v, n)))) * R2D, x = dot(v, right), y = dot(v, up), l = Math.hypot(x, y) || 1; return [cx + k * a * x / l, cy - k * a * y / l, a]; };
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    ctx.fillStyle = "rgba(4,7,18,0.55)"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const line = (pts, col, w, a, dash) => { ctx.beginPath(); pts.forEach((v, i) => { const q = P(v); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
    line(circle, N.ecl, 1.2, 0.8, [5, 4]);
    // la grille de l'année : cercles de déclinaison et méridiens horaires, attachés au pôle du moment
    const pole = L.poleAt(year), eqx = L.equinoxAt(year), e6 = cross(pole, eqx);
    for (const r of [10, 20, 30]) line(circleAbout(pole, r), N.dec, 0.9, 0.5);
    for (let h = 0; h < 24; h += 2) { const a = h * 15 * D2R, dir = [0, 1, 2].map((j) => Math.cos(a) * eqx[j] + Math.sin(a) * e6[j]);
      line([2, 34].map((r) => [0, 1, 2].map((j) => pole[j] * Math.cos(r * D2R) + dir[j] * Math.sin(r * D2R))), h ? N.dec : N.ra, h ? 0.7 : 1.8, h ? 0.4 : 0.95); }
    const pos = new Map();
    for (const s of near) { const v = L.moved(s, year), q = P(v); pos.set(s.hip, q); if (q[2] < FOV + 2) drawStar(ctx, q[0], q[1], s.v, s.bv); }
    ctx.strokeStyle = "#9fb7e8"; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.6;
    for (const key of ["dipper", "cassiopeia"]) for (const [a, b] of L.ASTERISMS[key]) { const A = pos.get(a), B = pos.get(b); if (A && B) { ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); } }
    ctx.globalAlpha = 1;
    for (const key of LABELS) { const q = pos.get(L.NAMED[key]); if (q) text(ctx, tr("sky-n-" + key, L.NAMES[key]), q[0] + 6, q[1] - 5, { c: N.ink, size: 10.5 }); }
    for (const y of [-2000, 2000, 6000, 10000, 14000, 18000, 22000]) { const q = P(L.poleAt(y)), d = Math.hypot(q[0] - cx, q[1] - cy) || 1, ox = (q[0] - cx) / d, oy = (q[1] - cy) / d;
      disc(ctx, q[0], q[1], 1.8, N.ecl); text(ctx, (y < 0 ? "−" : "") + nf(Math.abs(y), 0), q[0] - ox * 16, q[1] - oy * 12 + 3, { c: N.ecl, size: 9, align: "center" }); }
    const c0 = P(n); ctx.strokeStyle = N.ecl; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(c0[0] - 5, c0[1]); ctx.lineTo(c0[0] + 5, c0[1]); ctx.moveTo(c0[0], c0[1] - 5); ctx.lineTo(c0[0], c0[1] + 5); ctx.stroke();
    const pq = P(pole); disc(ctx, pq[0], pq[1], 5, null, "#ffffff", 1.6); disc(ctx, pq[0], pq[1], 1.6, "#ffffff");
    const zq = P([0, 1, 2].map((j) => pole[j] * Math.cos(15 * D2R) + eqx[j] * Math.sin(15 * D2R))); text(ctx, "0 h", zq[0], zq[1] - 6, { c: N.ra, size: 11, align: "center", bold: true });
    ctx.restore();
    ctx.strokeStyle = N.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    const y0 = H - bot + 16, yr = Math.round(year / 10) * 10;
    text(ctx, tr("sky-read-year", "year {y}").replace("{y}", (yr < 0 ? "−" : "") + nf(Math.abs(yr), 0)), 10, y0, { c: N.ink, size: 13, bold: true });
    let best = null; for (const key of LABELS) { const d = L.sepDeg(L.moved(L.named(key), year), pole); if (!best || d < best.d) best = { key, d }; }
    text(ctx, best.d < 10 ? tr("sky-read-polestar", "nearest bright star to the pole: {n}, {d}° away").replace("{n}", tr("sky-n-" + best.key, L.NAMES[best.key])).replace("{d}", nf(best.d, 1)) : tr("sky-read-nopole", "no bright star within 10° of the pole"), 10, y0 + 16, { c: N.soft, size: 11, maxW: W - 20 });
    const cp = L.coordsAt(L.named("polaris"), year), cs = L.coordsAt(L.named("sirius"), year), hs = L.hm(cs.ra);
    text(ctx, `${tr("sky-n-polaris", "Polaris")} δ = ${sg(cp.dec)}° · ${tr("sky-n-sirius", "Sirius")} α = ${hs.h} h ${String(hs.m).padStart(2, "0")}, δ = ${sg(cs.dec)}°`, 10, y0 + (W < 620 ? 46 : 32), { c: N.dec, size: 11, maxW: W - 20 });
  } });
}

/* ---- 3. le mouvement propre : la Grande Ourse sur 200 000 ans ---------------------------------- */
export function mountPM(canvas, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const dip = L.DIPPER.map(L.star), c = unit(dip.map((s) => L.moved(s, 2000)).reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0]));
  const up = unit([0, 0, 1].map((x, k) => x - c[2] * c[k])), right = cross(c, up);
  const field = L.BRIGHT.filter((s) => !L.DIPPER.includes(s.hip) && L.sepDeg(L.vec(s.ra, s.dec), c) < 50);
  const SPAN = 100000, HALF = 21;
  return anim2d(canvas, { span: 24, u0: 0.3, draw(ctx, W, H, u) {
    night(ctx, W, H);
    const year = 2000 - SPAN * Math.cos(TAU * u);
    const top = header(ctx, W, tr("sky-t-pm", "Each star drifts on its own: the Big Dipper over 200,000 years"), tr("sky-st-pm", "gnomonic view, north up · straight-line motion, radial velocity ignored"), false);
    const bot = W < 620 ? 76 : 46, k = Math.min(W / 2 - 6, (H - top - bot) * 0.9) / Math.tan(HALF * D2R), cx = W / 2, cy = top + (H - top - bot) / 2;
    const P = (v) => { const d = dot(v, c); return d < 0.3 ? null : [cx + k * dot(v, right) / d, cy - k * dot(v, up) / d]; };
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H - top - bot); ctx.clip();
    for (const s of field) { const q = P(L.moved(s, year)); if (q && q[0] > -5 && q[0] < W + 5 && q[1] > top - 5 && q[1] < H - bot + 5) drawStar(ctx, q[0], q[1], s.v + 0.4, s.bv, 0.55); }
    const now = new Map(dip.map((s) => [s.hip, P(L.moved(s, 2000))])), at = new Map(dip.map((s) => [s.hip, P(L.moved(s, year))]));
    const lines = (m, col, w, a, dash) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.globalAlpha = a; ctx.setLineDash(dash || []); for (const [x, y] of L.ASTERISMS.dipper) { const A = m.get(x), B = m.get(y); if (A && B) { ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); } } ctx.setLineDash([]); ctx.globalAlpha = 1; };
    lines(now, N.soft, 1, 0.55, [3, 4]);
    for (const q of now.values()) disc(ctx, q[0], q[1], 3, null, N.faint, 1);
    for (const s of dip) { const a = now.get(s.hip), b = at.get(s.hip); if (a && b) { ctx.strokeStyle = N.ra; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.globalAlpha = 1; } }
    lines(at, "#cfe0ff", 1.4, 0.95);
    for (const s of dip) { const q = at.get(s.hip); if (q) drawStar(ctx, q[0], q[1], s.v - 0.8, s.bv); }
    for (const key of ["dubhe", "alkaid"]) { const q = at.get(L.NAMED[key]); if (q) text(ctx, L.NAMES[key], q[0] + 8, q[1] - 7, { c: N.ink, size: 10.5 }); }
    ctx.restore();
    const y0 = H - bot + 16, ky = Math.round((year - 2000) / 1000) * 1000;
    text(ctx, ky === 0 ? tr("sky-read-today", "today") : (ky < 0 ? tr("sky-read-ago", "{n} years ago") : tr("sky-read-in", "in {n} years")).replace("{n}", nf(Math.abs(ky), 0)), 10, y0, { c: N.ink, size: 13, bold: true });
    text(ctx, tr("sky-read-pm", "dashes: today's outline · the five middle stars travel together, Dubhe and Alkaid do not"), 10, y0 + 16, { c: N.soft, size: 11, maxW: W - 20 });
  } });
}

/* ---- 4. ce qu'une latitude laisse voir ---------------------------------------------------------- */
export function mountVis(canvas, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), sg = fmtSigned(nf);
  const YEAR = 2026, of = (s) => L.toDate(L.moved(s, YEAR), YEAR);
  const stars = L.BRIGHT.map((s) => { const v = of(s); return { s, v, dec: L.radec(v).dec }; });
  const SP = L.VIS_SPOTS, SLOT = 6;
  const EXK = [...new Set(SP.flatMap((p) => p.ex))], exv = Object.fromEntries(EXK.map((k) => { const v = of(L.named(k)); return [k, { v, dec: L.radec(v).dec }]; }));
  return anim2d(canvas, { span: SLOT * SP.length, u0: 0.2, draw(ctx, W, H, u) {
    night(ctx, W, H);
    const t = u * SP.length, i = Math.floor(t) % SP.length, f = t - Math.floor(t), sp = SP[i], prev = SP[(i + SP.length - 1) % SP.length];
    const lat = prev.lat + (sp.lat - prev.lat) * smooth(f / 0.25), north = lat >= 0, sgn = north ? 1 : -1, lim = L.decLimit(lat);
    const top = header(ctx, W, tr("sky-t-vis", "A latitude hides only a cap around the far pole"), tr("sky-st-dir", "a map of directions — the stars' distances are not drawn"));
    const bot = W < 620 ? 110 : 90, R = Math.max(40, Math.min(W * 0.43, (H - top - bot) / 2 - 16)), cx = W / 2, cy = top + (H - top - bot) / 2;
    const P = camera(cx, cy, R, TAU * u + 0.6, 14 * D2R);
    const hidden = (dec) => (north ? dec <= lim : dec >= lim);
    glassBall(ctx, P, cx, cy, R, stars, tr, { ecl: false, style: (o) => (hidden(o.dec) ? { col: "#b45353", a: 0.75 } : null) });
    for (let d = lim; north ? d > -90 : d < 90; d -= sgn * 3) curve(ctx, P, parallel(d), N.never, 1, 0.4, 0.15);
    for (let d = sgn * (90 - Math.abs(lat)); Math.abs(d) < 90; d += sgn * 3) curve(ctx, P, parallel(d), N.always, 1, 0.3, 0.1);
    curve(ctx, P, parallel(lim), N.never, 2, 1, 0.5);
    curve(ctx, P, parallel(sgn * (90 - Math.abs(lat))), N.always, 1.6, 0.9, 0.4);
    // le zénith du lieu fait le tour en un jour sidéral ; son horizon balaie tout sauf la calotte
    const z = L.vec(360 * f * 2, lat), zq = P(z);
    curve(ctx, P, circleAbout(z, 90), "#ffffff", 1.5, 0.9, 0.35);
    ctx.strokeStyle = "#ffffff"; ctx.globalAlpha = 0.7; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(zq[0], zq[1]); ctx.stroke(); ctx.globalAlpha = 1;
    disc(ctx, zq[0], zq[1], 3, "#ffffff"); text(ctx, tr("sky-zenith", "zenith"), zq[0] + 6, zq[1] - 5, { c: N.ink, size: 10 });
    for (const k of sp.ex) { const e = exv[k], q = P(e.v), col = hidden(e.dec) ? N.never : N.always; disc(ctx, q[0], q[1], 7, null, col, 1.4); text(ctx, tr("sky-n-" + k, L.NAMES[k]), q[0] + 10, q[1] + 4, { c: col, size: 11, bold: true }); }
    const y0 = H - bot + 16, lh = 15;
    text(ctx, `${tr("sky-c-" + i, sp.n)} · ${nf(Math.abs(sp.lat), 1)}° ${sp.lat >= 0 ? tr("sky-N", "N") : tr("sky-S", "S")}`, 10, y0, { c: N.ink, size: 13, bold: true });
    const l2 = L.decLimit(sp.lat);
    text(ctx, tr(sp.lat >= 0 ? "sky-read-visn" : "sky-read-viss", sp.lat >= 0 ? "sees every star north of δ = {d}° · {p} % of the sphere" : "sees every star south of δ = {d}° · {p} % of the sphere").replace("{d}", sg(l2)).replace("{p}", nf(100 * L.skyFraction(sp.lat), 1)), 10, y0 + lh, { c: N.soft, size: 11, maxW: W - 20 });
    sp.ex.forEach((k, j) => {
      const e = exv[k], c = L.cls(sp.lat, e.dec), a = L.maxAlt(sp.lat, e.dec);
      const what = c === "never" ? tr("sky-never", "never rises") : (c === "always" ? tr("sky-always", "never sets, up to {a}° high") : tr("sky-rises", "rises, up to {a}° high")).replace("{a}", nf(a, 1));
      text(ctx, `${tr("sky-n-" + k, L.NAMES[k])} (δ ${sg(e.dec)}°): ${what}`, 10, y0 + (W < 620 ? 3 : 2) * lh + j * lh, { c: c === "never" ? N.never : N.always, size: 11 });
    });
  } });
}

/* ---- schémas des formules ----------------------------------------------------------------------- */
const C = FIG.C;
/** Coupe par le méridien : horizon, pôle à la hauteur φ, équateur à 90° − φ, étoile à δ de l'équateur. */
function figRaDec(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-radec-alt", "The meridian seen from the east: the horizon, the observer at its centre, the celestial pole at altitude phi on the north side, the celestial equator at altitude 90 degrees minus phi on the south side, and a star crossing the meridian at altitude a; its declination delta is the angle from the equator to the star.") });
  const cx = 190, cy = 180, r = 130, phi = 49, dec = 20, aEq = 90 - phi;
  f.ground(cy, 30, 350); f.path(`M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}`, { c: C.faint, w: 1.2 });
  const pt = (alt, south) => [cx + (south ? -1 : 1) * r * Math.cos(alt * D2R), cy - r * Math.sin(alt * D2R)];
  const pole = pt(phi, false), eq = pt(aEq, true), st = pt(aEq + dec, true);
  f.dash(cx, cy, pole[0], pole[1]); f.line(cx, cy, eq[0], eq[1], { c: C.sea, w: 1.6 }); f.line(cx, cy, st[0], st[1], { c: C.globe, w: 1.6 });
  f.dot(cx, cy, { r: 3 }); f.dot(pole[0], pole[1], { r: 3, c: C.soft }); f.dot(st[0], st[1], { r: 4, c: C.globe });
  f.note(pole[0] + 6, pole[1] - 4, tr("fx-radec-pole", "celestial pole")); f.note(eq[0] - 6, eq[1] + 2, tr("fx-radec-eq", "equator"), { anchor: "end", c: C.sea });
  f.note(st[0] - 4, st[1] - 8, tr("fx-radec-star", "star on the meridian"), { c: C.globe, anchor: "middle" });
  f.angle(cx, cy, 34, 0, phi, { label: "φ", tex: "\\varphi", c: C.soft });
  f.angle(cx, cy, 52, 180 - aEq, 180, { label: "90° − φ", c: C.sea, pad: 26 });
  f.angle(cx, cy, 84, 180 - aEq - dec, 180 - aEq, { label: "δ", tex: "\\delta", c: C.globe });
  f.note(40, cy + 16, tr("fx-radec-s", "south")); f.note(340, cy + 16, tr("fx-radec-n", "north"), { anchor: "end" });
  f.note(cx, cy + 32, tr("fx-radec-clock", "α = what the sidereal clock reads at that instant"), { anchor: "middle", c: C.flat });
  stamp(f, tr, tr("fx-radec-st", "angles drawn for 49° N and δ = +20°"));
  return f;
}
/** Le pôle sur son cercle de rayon ε autour du pôle de l'écliptique ; la grille (0 h) le suit. */
function figPrec(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-prec-alt", "A circle of radius epsilon, 23.4 degrees, around the pole of the ecliptic. The celestial pole moves along it by 50.3 arcseconds a year; a star stays where it is, so its distance to the pole, 90 degrees minus delta, changes.") });
  const cx = 150, cy = 118, r = 78;
  f.circle(cx, cy, r, { c: C.faint, w: 1.2, dash: "5 4" });
  f.dot(cx, cy, { r: 3, c: C.flat, label: tr("fx-prec-k", "pole of the ecliptic"), dx: 8, dy: 14 });
  const p0 = [cx + r * Math.cos(70 * D2R), cy - r * Math.sin(70 * D2R)], p1 = [cx + r * Math.cos(20 * D2R), cy - r * Math.sin(20 * D2R)], st = [cx + 122, cy - 96];
  f.line(cx, cy, p0[0], p0[1], { c: C.soft, w: 1.2 }); f.line(cx, cy, p1[0], p1[1], { c: C.soft, w: 1.2 });
  f.angle(cx, cy, 30, 20, 70, { label: "p·t", c: C.ink, pad: 16 });
  f.note((cx + p0[0]) / 2 - 16, (cy + p0[1]) / 2, "ε", { size: 12 });
  f.dot(p0[0], p0[1], { r: 3.5, c: C.globe, label: tr("fx-prec-p0", "pole, year 0"), dx: -8, dy: -8, anchor: "end" });
  f.dot(p1[0], p1[1], { r: 3.5, c: C.globe, label: tr("fx-prec-p1", "pole, t years later"), dx: 9, dy: 12 });
  f.arrow(p0[0] + 8, p0[1] + 1, p1[0] + 2, p1[1] - 9, { c: C.globe, w: 1.3 });
  f.dot(st[0], st[1], { r: 3.5, label: tr("fx-prec-star", "star (stays put)"), dx: 8, dy: 4 });
  f.dash(p0[0], p0[1], st[0], st[1], { c: C.sea }); f.dash(p1[0], p1[1], st[0], st[1], { c: C.sea });
  f.note(8, 210, tr("fx-prec-n", "90° − δ = the star's distance to the pole of the year: it changes, the star has not moved"), { size: 9.5, c: C.sea });
  stamp(f, tr, tr("fx-prec-st", "flat sketch of a small patch of sky"));
  return f;
}
/** Coupe par le méridien : pôle à φ, calotte toujours levée, calotte jamais levée, étoile au méridien. */
function figVis(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-vis-alt", "The celestial sphere cut along the meridian for an observer at latitude phi north: the horizon is a diameter, the north celestial pole sits phi above it. Stars within phi of the north pole never set; stars within phi of the south pole never rise; the rest rise and set, culminating at 90 degrees minus the difference between latitude and declination.") });
  const cx = 190, cy = 128, r = 96, phi = 40;
  f.circle(cx, cy, r, { c: C.faint, w: 1.2 }); f.ground(cy, cx - r - 30, cx + r + 30);
  const pt = (deg, k = 1) => [cx + k * r * Math.cos(deg * D2R), cy - k * r * Math.sin(deg * D2R)];   // deg = angle écran, 0 = nord
  const arc = (a, b, col) => { const A = pt(a), B = pt(b); f.path(`M${A[0]} ${A[1]}A${r} ${r} 0 0 0 ${B[0]} ${B[1]}`, { c: col, w: 5 }); };
  arc(0, 2 * phi, C.sea); arc(180, 180 + 2 * phi, C.flat);
  const np = pt(phi), spo = pt(phi + 180); f.dash(spo[0], spo[1], np[0], np[1], { c: C.soft });
  const e1 = pt(phi + 90), e2 = pt(phi - 90); f.line(e1[0], e1[1], e2[0], e2[1], { c: C.sea, w: 1.2 });
  f.dot(cx, cy, { r: 3 }); f.dot(np[0], np[1], { r: 3, c: C.soft, label: tr("fx-vis-np", "north pole"), dx: 8, dy: -4 });
  f.dot(spo[0], spo[1], { r: 3, c: C.soft, label: tr("fx-vis-sp", "south pole"), dx: -8, dy: 14, anchor: "end" });
  f.angle(cx, cy, 30, 0, phi, { label: "φ", tex: "\\varphi", c: C.soft });
  const st = pt(phi + 90 + 25); f.dot(st[0], st[1], { r: 4, c: C.globe }); f.line(cx, cy, st[0], st[1], { c: C.globe, w: 1.4 });
  f.angle(cx, cy, 46, phi + 115, 180, { label: "a max", c: C.globe, pad: 24 });
  f.note(e1[0] - 6, e1[1] - 6, tr("fx-vis-eq", "equator"), { anchor: "end", c: C.sea });
  f.note(cx + r + 8, cy - 46, tr("fx-vis-always", "never sets"), { c: C.sea }); f.note(cx - r - 8, cy + 52, tr("fx-vis-never", "never rises"), { c: C.flat, anchor: "end" });
  f.note(cx + r + 28, cy + 14, tr("fx-radec-n", "north"), { anchor: "end" }); f.note(cx - r - 28, cy + 14, tr("fx-radec-s", "south"));
  f.note(st[0] - 6, st[1] - 8, tr("fx-vis-star", "star, δ south of the equator"), { c: C.globe, anchor: "middle", size: 10 });
  stamp(f, tr, tr("fx-vis-st", "drawn for 40° N and δ = −25°"));
  return f;
}
/** Le mouvement propre : deux composantes sur le ciel, leur somme, et le chemin en t années. */
function figPM(tr) {
  const f = FIG.make({ w: 380, h: 170, alt: tr("fx-pm-alt", "A star on the sky with two small arrows at right angles, mu alpha towards the east and mu delta towards the north; their sum mu is the star's motion in one year, and after t years the star has covered mu times t along that line.") });
  const x0 = 250, y0 = 130, ax = -90, ay = -60;
  f.dash(x0, y0, x0 + ax * 2.2, y0 + ay * 2.2, { c: C.faint });
  f.arrow(x0, y0, x0 + ax, y0, { c: C.sea }); f.arrow(x0, y0, x0, y0 + ay, { c: C.sea });
  f.arrow(x0, y0, x0 + ax, y0 + ay, { c: C.globe, w: 2 });
  f.rightAngle(x0, y0, [x0 + ax, y0], [x0, y0 + ay]);
  f.dot(x0, y0, { r: 4, label: tr("fx-pm-now", "today"), dx: 8, dy: 4 });
  f.dot(x0 + ax * 2.2, y0 + ay * 2.2, { r: 3, c: C.soft, label: tr("fx-pm-later", "t years later: Δ = μ t"), dx: 8, dy: 12 });
  f.txt(x0 + ax / 2, y0 + 16, "μ_α", { c: C.sea, anchor: "middle", tex: "\\mu_{\\alpha}" }); f.txt(x0 + 8, y0 + ay / 2, "μ_δ", { c: C.sea, tex: "\\mu_{\\delta}" });
  f.txt(x0 + ax / 2 - 12, y0 + ay / 2 - 8, "μ", { c: C.globe, anchor: "middle", tex: "\\mu" });
  f.note(330, 150, tr("fx-pm-e", "← east"), { anchor: "middle" }); f.note(330, 50, tr("fx-pm-nn", "↑ north"), { anchor: "middle" });
  stamp(f, tr, tr("fx-pm-st", "one year's motion, enormously enlarged"));
  return f;
}
export const FORMULA_FIGS = { stFxRaDec: figRaDec, stFxPrec: figPrec, stFxPM: figPM, stFxVis: figVis };
export function drawFormulaFigs(root, tr) { return drawAll(root, FORMULA_FIGS, tr, {}, "star"); }

/* ---- tables --------------------------------------------------------------------------------------- */
const HIPPARCHUS = -128;   // 129 av. J.-C., année astronomique
export function pmRows(year = 2026) {
  return ["barnard", "kapteyn", "groombridge", "cyg61", "rigilkent", "arcturus", "sirius", "vega", "polaris"].map((k) => {
    const s = L.named(k), pm = L.pmTotal(s);
    return { k, pm, yearsHalfDeg: 1800 / pm, since: pm * (year - HIPPARCHUS) / 3600 };
  });
}
export function fillTables(root, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), sg = fmtSigned(nf);
  const pmT = root.querySelector("#st-tabPM");
  if (pmT) {
    const head = [tr("sky-th-star", "Star"), tr("sky-th-pm", "Proper motion, ″ per year"), tr("sky-th-half", "Years to move 0.5° (the Moon's width)"), tr("sky-th-since", "Moved since Hipparchus (129 BC)")];
    const prec = L.PRECESSION;
    pmT.innerHTML = `<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
      pmRows().map((r) => `<tr><td>${tr("sky-n-" + r.k, L.NAMES[r.k])}</td><td class="num">${nf(r.pm, 2)}</td><td class="num">${nf(r.yearsHalfDeg, 0)}</td><td class="num">${nf(r.since, 2)}°</td></tr>`).join("") +
      `<tr><td><b>${tr("sky-th-prec", "Every star, by precession (the grid slides)")}</b></td><td class="num"><b>${nf(prec, 2)}</b></td><td class="num"><b>${nf(1800 / prec, 0)}</b></td><td class="num"><b>${nf(prec * (2026 - HIPPARCHUS) / 3600, 1)}°</b></td></tr></tbody>`;
  }
  const visT = root.querySelector("#st-tabVis");
  if (visT) {
    const YEAR = 2026;
    visT.innerHTML = `<thead><tr><th>${tr("sky-th-star", "Star")}</th><th>δ</th>${L.VIS_SPOTS.map((p, i) => `<th>${tr("sky-c-" + i, p.n)}<br>${nf(Math.abs(p.lat), 1)}° ${p.lat >= 0 ? tr("sky-N", "N") : tr("sky-S", "S")}</th>`).join("")}</tr></thead><tbody>` +
      L.VIS_STARS.map((k) => { const dec = L.coordsAt(L.named(k), YEAR).dec;
        return `<tr><td>${tr("sky-n-" + k, L.NAMES[k])}</td><td class="num">${sg(dec)}°</td>` + L.VIS_SPOTS.map((p) => { const c = L.cls(p.lat, dec);
          return c === "never" ? `<td class="num skynever">${tr("sky-td-never", "never")}</td>` : `<td class="num${c === "always" ? " skyalways" : ""}">${nf(L.maxAlt(p.lat, dec), 1)}°${c === "always" ? " *" : ""}</td>`; }).join("") + `</tr>`; }).join("") +
      `<tr><td colspan="2" class="f">${tr("sky-td-flat", "Flat disc under a dome")}</td><td colspan="${L.VIS_SPOTS.length}" class="f">${tr("sky-td-flat2", "every star above the horizon, from every place, at every hour: altitude atan(h/d) > 0")}</td></tr></tbody>`;
  }
}
