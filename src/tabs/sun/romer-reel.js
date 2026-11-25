// Vitrine de Rømer à rebours (2026-11-25, Xyphophor : « une animation style vitrine qui fera office de carte ») : six
// scènes, l'horloge d'Io, le retard, les registres de trois siècles, la droite du retard contre la distance (l'unité
// astronomique), la meilleure courbe du plat, l'oscillation qu'impose Europe. Dessins communs : romer-anim.js ; nombres :
// le preset de fog build sun-romer. Cadre : core/reel.js.
import { makeReel, label, REEL_COL, ease, clamp } from "../../core/reel.js";
import { drawJovian, drawSystem, drawDelay, COL, IO_P, EUR_P } from "./romer-anim.js";
import { eras, ERA_COLS, flatDelay, fitOf } from "./romer-data.js";
import { ROMER, ROMER_SERIES, ROMER_CURVE, ROMER_FLAT } from "../../data/presets/sun-romer.js";
import { ROMER as ORB } from "./logic.js";

const EN = {
  "rmr-schem": "AU to scale; Jupiter to its own scale, moons enlarged",
  "rmr-clock-k": "Io's clock",
  "rmr-clock-a": "Every 42 h 28 min, Io slips into Jupiter's shadow and goes out.",
  "rmr-clock-b": "A clock at Jupiter, that anyone with a small telescope can read.",
  "rmr-late-k": "Seen late",
  "rmr-late-a": "We see each eclipse when its light reaches us: 35 to 52 minutes later.",
  "rmr-late-b": "As the Earth goes round, the delay swings by 16 minutes every 399 days.",
  "rmr-logs-k": "Three centuries",
  "rmr-logs-a": "{{rmIo}} eclipses of Io were timed and kept, from 1652 to 1983.",
  "rmr-logs-b": "Harvard's photometer, 1878–1903: every dot is one eclipse, on the light-time curve.",
  "rmr-line-k": "The astronomical unit",
  "rmr-line-a": "The farther Jupiter, the later the eclipse: one straight line for every century.",
  "rmr-line-b": "Its slope is {{rmAs}} s per astronomical unit. Times c from the laboratory: {{rmAU}} million km.",
  "rmr-flat-k": "The flat model",
  "rmr-flat-a": "With no distance to Jupiter, Io's clock alone leaves {{rmRmsClock}} s of scatter.",
  "rmr-flat-b": "Give it a free curve: it lands on the one an astronomical unit predicts.",
  "rmr-wob-k": "Europa's pull",
  "rmr-wob-a": "Europa makes Io run early or late by {{rmLapMin}} minutes, every 437.6 days.",
  "rmr-wob-b": "Fitted beside the light time, it is measured in every era, and leaves the light time alone.",
  "rmr-io": "Io", "rmr-europa": "Europa", "rmr-sun": "to the Sun", "rmr-shadow": "shadow",
  "rmr-earth": "Earth", "rmr-jup": "Jupiter", "rmr-sunl": "Sun",
  "rmr-axis": "light time from Jupiter (min)", "rmr-now": "{lt} min",
  "rmr-n": "eclipses", "rmr-dist": "Earth–Jupiter distance (AU)", "rmr-delay": "delay from 4 AU (min)",
  "rmr-clockonly": "Io's clock alone", "rmr-free": "flat free curve", "rmr-pred": "one AU predicts",
  "rmr-early": "Io early / late (min)", "rmr-conj": "Io–Europa conjunctions",
  "rmr-alt": "Animation: Io going round Jupiter and into its shadow every 42.5 hours; the Earth going round the Sun while the light from Jupiter takes 35 to 52 minutes to reach it; the eclipses timed from 1652 to 1983 and Harvard's photometric timings on the light-time curve; the delay against the Earth-Jupiter distance, one straight line giving the astronomical unit; the flat model's free curve landing on the globe's prediction; Europa making Io run early or late every 437.6 days",
};

const nf = (lang, x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
const halves = (b, gap = 8) => b.w >= b.h * 1.2 ? [{ x: b.x, y: b.y, w: b.w / 2 - gap / 2, h: b.h }, { x: b.x + b.w / 2 + gap / 2, y: b.y, w: b.w / 2 - gap / 2, h: b.h }] : [{ x: b.x, y: b.y, w: b.w, h: b.h / 2 - gap / 2 }, { x: b.x, y: b.y + b.h / 2 + gap / 2, w: b.w, h: b.h / 2 - gap / 2 }];
const MONO = "ui-monospace, Menlo, monospace";

function axes(ctx, b, fs, { xs, ys, xl, yl }) {
  const x0 = b.x + fs * 2.2, x1 = b.x + b.w - fs * 0.5, y0 = b.y + fs * 0.6, y1 = b.y + b.h - fs * 2.2;
  const X = (v) => x0 + (x1 - x0) * (v - xs[0]) / (xs[1] - xs[0]), Y = (v) => y1 - (y1 - y0) * (v - ys[0]) / (ys[1] - ys[0]);
  for (const v of ys[2]) { ctx.strokeStyle = "#ebe8e0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); label(ctx, `${v}`, x0 - fs * 0.3, Y(v), { size: fs * 0.62, col: COL.soft, align: "right", font: MONO, weight: 500 }); }
  for (const v of xs[2]) label(ctx, `${v}`, X(v), y1 + fs * 0.7, { size: fs * 0.62, col: COL.soft, font: MONO, weight: 500 });
  if (xl) label(ctx, xl, x1, y1 + fs * 1.6, { size: fs * 0.66, col: COL.soft, align: "right", weight: 500 });
  if (yl) label(ctx, yl, x0, y0 - fs * 0.1, { size: fs * 0.66, col: COL.soft, align: "left", weight: 500 });
  return { X, Y, x0, x1, y0, y1 };
}

// 1. l'horloge : Io fait le tour de Jupiter (un tour en 5 s) et passe dans l'ombre
function sceneClock(ctx, b, u, d, T, fs) {
  const io = Math.PI * 0.55 + (2 * Math.PI * u) / 5;
  const r = drawJovian(ctx, b, io, Math.PI, { fs, labels: { io: T("rmr-io"), sun: T("rmr-sun"), shadow: T("rmr-shadow") } });
  const h = (u / 5) * IO_P * 24, hh = Math.floor(h % (IO_P * 24));
  label(ctx, `${hh} h ${String(Math.floor((h * 60) % 60)).padStart(2, "0")} min`, b.x + b.w / 2, b.y + b.h - fs * 1.6, { size: fs * 0.9, col: r.inShadow ? COL.shadow : COL.soft, font: MONO, weight: 700 });
}

// 2. le retard : un cycle synodique, le système à gauche, la courbe à droite
function sceneLate(ctx, b, u, d, T, fs) {
  const day = (u / d) * ORB.TSYN, [A, B] = halves(b);
  const fmt = (x) => nf(T.lang, x, 1);
  drawSystem(ctx, A, day, { fs: fs * 0.8, labels: { earth: T("rmr-earth"), jupiter: T("rmr-jup") }, fmt, dash: u * 20 });
  drawDelay(ctx, B, day, { fs: fs * 0.8, span: ORB.TSYN, every: 4, labels: { axis: T("rmr-axis"), now: (lt) => T("rmr-now").replace("{lt}", fmt(lt)) } });
}

// 3. les registres : les six époques (nombre d'éclipses gardées), puis la photométrie de Harvard point par point
function sceneLogs(ctx, b, u, d, T, fs) {
  const [A, B] = halves(b.w >= b.h * 1.2 ? { ...b } : b);
  const E = eras(), nMax = Math.max(...E.map((e) => e.main.n));
  const top = A, x0 = top.x + fs, x1 = top.x + top.w - fs * 0.4, yb = top.y + top.h - fs * 1.6, hMax = top.h - fs * 3.6;
  const X = (y) => x0 + (x1 - x0) * (y - 1652) / (1983 - 1652);
  E.forEach((e, i) => {
    const k = ease((u - 0.3 - i * 0.35) / 0.8), h = hMax * (e.main.n / nMax) * k;
    ctx.fillStyle = ERA_COLS[i]; ctx.globalAlpha = 0.85; ctx.fillRect(X(e.y0) + 1, yb - h, X(e.y1 + 1) - X(e.y0) - 2, h); ctx.globalAlpha = 1;
    if (k > 0.5) label(ctx, nf(T.lang, Math.round(e.main.n * k)), (X(e.y0) + X(e.y1 + 1)) / 2, yb - h - fs * 0.5, { size: fs * 0.6, col: ERA_COLS[i], weight: 700, font: MONO });
  });
  ctx.strokeStyle = COL.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
  for (const y of [1700, 1800, 1900]) label(ctx, `${y}`, X(y), yb + fs * 0.65, { size: fs * 0.62, col: COL.soft, font: MONO, weight: 500 });
  label(ctx, T("rmr-n"), x0, top.y + fs * 0.6, { size: fs * 0.66, col: COL.soft, align: "left", weight: 500 });
  // Harvard
  const as = fitOf(ROMER.photo).as, tEnd = 1878 + 26 * clamp((u - 2.6) / (d - 3.2));
  const ax = axes(ctx, B, fs, { xs: [1878, 1904.6, [1880, 1890, 1900]], ys: [-2, 21, [0, 10, 20]], yl: T("rmr-delay") });
  ctx.strokeStyle = COL.globe; ctx.lineWidth = 1; ctx.beginPath();
  ROMER_CURVE.forEach(([t, dd], i) => { const p = [ax.X(t), ax.Y((dd - 4) * as / 60)]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.stroke();
  ctx.fillStyle = COL.ink;
  for (const [t, , del] of ROMER_SERIES) if (t <= tEnd) { ctx.beginPath(); ctx.arc(ax.X(t), ax.Y((del - 4 * as) / 60), Math.max(1.3, fs * 0.1), 0, 2 * Math.PI); ctx.fill(); }
}

// 4. la droite : retard contre distance, époque après époque, puis la pente
function sceneLine(ctx, b, u, d, T, fs) {
  const as = ROMER.mean, ax = axes(ctx, b, fs, { xs: [3.9, 6.45, [4, 5, 6]], ys: [-1, 22, [0, 10, 20]], xl: T("rmr-dist"), yl: T("rmr-delay") });
  eras().forEach((e, i) => {
    const k = ease((u - 0.3 - i * 0.45) / 0.5); if (k <= 0) return;
    ctx.globalAlpha = k; ctx.fillStyle = ERA_COLS[i];
    for (const [dd, del] of e.bins) { ctx.beginPath(); ctx.arc(ax.X(dd) + (i - 2.5) * fs * 0.18, ax.Y((del - 4 * as) / 60), Math.max(2.2, fs * 0.2), 0, 2 * Math.PI); ctx.fill(); }
    ctx.globalAlpha = 1;
  });
  const kl = ease((u - 3.3) / 1.2);
  if (kl > 0) {
    const dEnd = 3.9 + (6.45 - 3.9) * kl;
    ctx.strokeStyle = COL.globe; ctx.lineWidth = Math.max(1.6, fs * 0.13); ctx.beginPath(); ctx.moveTo(ax.X(3.9), ax.Y((3.9 - 4) * as / 60)); ctx.lineTo(ax.X(dEnd), ax.Y((dEnd - 4) * as / 60)); ctx.stroke();
  }
  const kr = ease((u - 4.3) / 0.6);
  if (kr > 0) {
    ctx.globalAlpha = kr;
    label(ctx, `A/c = ${nf(T.lang, ROMER.mean, 1)} s`, ax.x0 + fs * 0.6, ax.y0 + fs * 1.4, { size: fs * 1.05, col: COL.globe, align: "left", weight: 800, font: MONO });
    label(ctx, `A = ${nf(T.lang, ROMER.mean * ROMER.c / 1e6, 1)} × 10⁶ km`, ax.x0 + fs * 0.6, ax.y0 + fs * 2.8, { size: fs * 1.05, col: COL.ink, align: "left", weight: 800, font: MONO });
    ctx.globalAlpha = 1;
  }
}

// 5. le plat : l'horloge seule (plate), puis la courbe libre qui grandit et se pose sur la prédiction
function sceneFlat(ctx, b, u, d, T, fs) {
  const ax = axes(ctx, b, fs, { xs: [-180, 180, [-180, -90, 0, 90, 180]], ys: [-10, 10, [-10, -5, 0, 5, 10]], yl: T("rmr-delay").replace(/ ?\(.*$/, "") + " (min)" });
  const curve = (amp, which, col, w, dash) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath();
    for (let deg = -180; deg <= 180; deg += 4) { const p = [ax.X(deg), ax.Y(amp * flatDelay((deg * Math.PI) / 180, which) / 60)]; deg > -180 ? ctx.lineTo(...p) : ctx.moveTo(...p); }
    ctx.stroke(); ctx.setLineDash([]);
  };
  const kp = ease((u - 3.2) / 1.0), kf = ease((u - 1.2) / 1.8);
  // l'horloge d'Io seule : une ligne à 0 et sa dispersion (± rms), qui s'efface quand la courbe libre arrive
  const sc = ROMER_FLAT.rmsClock / 60;
  ctx.globalAlpha = 1 - 0.7 * kf; ctx.fillStyle = "rgba(91,100,112,0.16)"; ctx.fillRect(ax.x0, ax.Y(sc), ax.x1 - ax.x0, ax.Y(-sc) - ax.Y(sc));
  ctx.strokeStyle = COL.soft; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ax.x0, ax.Y(0)); ctx.lineTo(ax.x1, ax.Y(0)); ctx.stroke(); ctx.globalAlpha = 1;
  if (kp > 0) { ctx.globalAlpha = kp; curve(1, 2, COL.globe, Math.max(3, fs * 0.28)); ctx.globalAlpha = 1; }
  curve(kf, 0, COL.flat, Math.max(1.6, fs * 0.13), [6, 4]);
  const ly = ax.y0 + fs * 0.9, lx = ax.X(-60);
  label(ctx, `▬ ${T("rmr-clockonly")} (± ${nf(T.lang, ROMER_FLAT.rmsClock)} s)`, lx, ly, { size: fs * 0.7, col: COL.soft, align: "left" });
  label(ctx, `- - ${T("rmr-free")}`, lx, ly + fs * 1.0, { size: fs * 0.7, col: COL.flat, align: "left", weight: 700 });
  if (kp > 0) label(ctx, `━ ${T("rmr-pred")}`, lx, ly + fs * 2.0, { size: fs * 0.7, col: COL.globe, align: "left", weight: 700 });
}

// 6. Europe : Io et Europe autour de Jupiter, la ligne des conjonctions qui tourne ; Io en avance ou en retard
function sceneWob(ctx, b, u, d, T, fs) {
  const [A, B] = halves(b), ioA = (2 * Math.PI * u) / 2.4, euA = ioA * IO_P / EUR_P;
  const P = 437.6, day = (u / d) * P * 1.3, conj = (2 * Math.PI * day) / P;
  drawJovian(ctx, A, ioA, Math.PI, { fs: fs * 0.85, europa: true, eurAng: euA, conj, labels: { io: T("rmr-io"), europa: T("rmr-europa"), sun: T("rmr-sun"), shadow: T("rmr-shadow") } });
  const lap = ROMER_LAP(), ax = axes(ctx, B, fs * 0.85, { xs: [0, P * 1.3, [0, 200, 400]], ys: [-4, 4, [-3, 0, 3]], yl: T("rmr-early") });
  ctx.strokeStyle = "#be123c"; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const t = (day * i) / 120, p = [ax.X(t), ax.Y((lap / 60) * Math.sin((2 * Math.PI * t) / P))]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
  ctx.stroke();
  ctx.fillStyle = "#be123c"; ctx.beginPath(); ctx.arc(ax.X(day), ax.Y((lap / 60) * Math.sin((2 * Math.PI * day) / P)), Math.max(3, fs * 0.25), 0, 2 * Math.PI); ctx.fill();
  label(ctx, T("rmr-conj"), A.x + A.w / 2, A.y + A.h - fs * 0.3, { size: fs * 0.68, col: "#be123c" });
}
const ROMER_LAP = () => { const E = eras(); return E.reduce((s, e) => s + e.main.lap, 0) / E.length; };

export const ROMER_SCENES = [{ key: "clock", d: 7.2 }, { key: "late", d: 7.4 }, { key: "logs", d: 7.4 }, { key: "line", d: 7.2 }, { key: "flat", d: 7 }, { key: "wob", d: 7 }];
export const ROMER_DRAW = { clock: sceneClock, late: sceneLate, logs: sceneLogs, line: sceneLine, flat: sceneFlat, wob: sceneWob };
const REEL = makeReel({ scenes: ROMER_SCENES, draw: ROMER_DRAW, prefix: "rmr", still: 7.2 + 7.4 + 7.4 + 6 });
export const ROMER_REEL_T = REEL.total;
export const drawRomerReel = REEL.drawReel;
export const ROMER_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = romerValues. */
export function mountRomerReel(canvas, tr, lang, vals = {}) {
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("rmr-alt"));
  return REEL.mountReel(canvas, T);
}
