// Vitrine de l'onglet ref (propriétaire, 2026-10-31 : « une animation vitrine »). Huit scènes, toutes tirées des calculs et
// des données de la page, rien d'inventé : la lumière se courbe vers l'air dense ; ôter la même courbure au rayon et au sol
// (R/(1 − k)) ; le signe (sur un plan, la réfraction ordinaire soulève, elle ne cache pas) ; les 97 lignes réciproques de
// Schott ; Round Top – Jackson Butte heure par heure ; les radiosondages de 2026 de jour et de nuit ; le laser de nuit sur
// l'eau (les rayons tracés de laser.js) ; l'air qu'il faut à chaque modèle à Caussols. Cadre : core/reel.js.
import { makeReel, label, REEL_COL, ease } from "../../core/reel.js";
import { ZEN_PAIRS, ZEN_HOURLY } from "../../data/presets/ref-zenith.js";
import { REF_IGRA } from "../../data/presets/ref-igra.js";
import { causNumbers } from "./caussols-air.js";
import { zenValues } from "./values.js";
import { lasValues, LAS, LAS_AIRS } from "./laser.js";
import { lasBeams } from "./laserfig.js";

const TEAL = "#0f766e", AMBER = REEL_COL.flat, BLUE = REEL_COL.globe, RED = "#dc2626", GROUND = "#7a6a4f";

const EN = {
  "rr-schem": "curvatures enlarged; data to scale",
  "rr-bend-k": "The bend",
  "rr-bend-a": "Light bends toward denser air.",
  "rr-bend-b": "Air thins with height, so a ray running level curves gently down, about one seventh as fast as the Earth curves away.",
  "rr-sub-k": "One subtraction",
  "rr-sub-a": "Straighten the ray, and the Earth grows by the same amount.",
  "rr-sub-b": "What hides a distant foot is the difference of the two curvatures. Refraction is the globe seen through a radius of R/(1 − k).",
  "rr-sign-k": "The sign",
  "rr-sign-a": "On a plane, the same air lifts things up.",
  "rr-sign-b": "Light bending toward the ground makes distant objects look higher. To hide them it must bend away from the ground, in air cooling faster than 3.4 °C per 100 m.",
  "rr-zen-k": "Measured",
  "rr-zen-a": "{{zenN}} lines, two zenith angles each.",
  "rr-zen-b": "On a plane the sum is at most 180°. Every line exceeds it, more for longer lines: R/(1 − k) = {{zenReff}} km, from angles and lengths alone.",
  "rr-hour-k": "Weather",
  "rr-hour-a": "k follows the hour, never the shape.",
  "rr-hour-b": "Round Top to Jackson Butte, 72 km, 1879: k {{zenNight}} at night, {{zenNoon}} after noon. The sum stays above 180° at all {{zenPairsH}} hours.",
  "rr-igra-k": "The air of 2026",
  "rr-igra-a": "{{igN}} radiosondes measured k.",
  "rr-igra-b": "Median {{igDay}} by day and {{igNight}} by night near the ground. k = 1, the air in which a globe looks flat: {{igGe1N}} % of nights, mostly in Antarctica.",
  "rr-laser-k": "Lasers at night",
  "rr-laser-a": "A laser test, redone in the air its own thermometers measured.",
  "rr-laser-b": "Worthing to Brighton, 15.3 km, 1 m above the water. The globe needs air warming by {{lasG2}} °C over 2 m; theirs warmed by 1.5 °C. The far eye sees the beam on a globe as on a plane.",
  "rr-caus-k": "The price",
  "rr-caus-a": "A measured dip, and the air each model needs.",
  "rr-caus-b": "Caussols, {{rcH}} m: the globe needs {{rcTg}} °C at the eye, the plane {{rcTf}} °C, on a June afternoon of {{rcTeye}} °C.",
  "rr-end-k": "",
  "rr-end-a": "Refraction is measured, bounded, and of known sign.",
  "rr-end-b": "It changes with the weather. The curvature under it does not.",
  "rr-eye": "eye", "rr-ray": "light", "rr-ground": "ground", "rr-hidden": "hidden", "rr-plane": "plane", "rr-globe": "globe",
  "rr-zero": "plane: at most 0", "rr-km": "line length (km)", "rr-exc": "excess over 180°", "rr-day": "day", "rr-night": "night", "rr-flat": "k = 1: looks flat",
  "rr-noon": "noon", "rr-hot": "warmer below: bends up", "rr-std": "standard air", "rr-straight": "straight", "rr-lifted": "lifted",
  "rr-alt": "Animation: a light ray bending in thinning air; the ray straightened while the Earth grows to R/(1 − k); on a plane ordinary refraction lifting distant objects; 97 reciprocal survey lines all above the plane's zero; k on one line hour by hour in 1879; the day and night distributions of k from the radiosondes of 2026; the 2019 Worthing–Brighton laser test traced in its measured air on a globe and on a plane; the air each model needs at Caussols; a summary",
};

/** Les nombres des textes. */
export function reelValues(lang) {
  const N = causNumbers(), nf = (x, d = 0) => (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  return { ...zenValues(lang), ...lasValues(lang), rcH: nf(N.h), rcTg: nf(N.globe.T), rcTf: nf(N.flat.T), rcTeye: nf(N.day.Teye, 0) };
}

// ---- 1. la courbure de la lumière : couches d'air qui s'éclaircissent, un rayon qui s'incurve vers le bas ----
function sceneBend(ctx, b, u, d, T, fs) {
  const n = 9, lh = b.h * 0.78 / n, y0 = b.y + b.h * 0.9;
  for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(29,78,216,${(0.03 + 0.12 * (1 - i / n)).toFixed(3)})`; ctx.fillRect(b.x, y0 - (i + 1) * lh, b.w, lh); }
  ctx.fillStyle = GROUND; ctx.fillRect(b.x, y0, b.w, fs * 0.3);
  const k = ease((u - 0.4) / (d * 0.6)), x0 = b.x + fs, x1 = b.x + b.w - fs, ys = y0 - lh * 4.5;
  ctx.setLineDash([fs * 0.3, fs * 0.25]); ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, ys); ctx.lineTo(x1, ys - b.h * 0.12); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2.5, fs * 0.14); ctx.beginPath();
  for (let i = 0; i <= 100 * k; i++) { const t = i / 100, x = x0 + (x1 - x0) * t; const y = ys - b.h * 0.12 * t + b.h * 0.22 * t * t; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  ctx.fillStyle = REEL_COL.ink; ctx.beginPath(); ctx.arc(x0, ys, fs * 0.2, 0, 7); ctx.fill();
  label(ctx, "n", b.x + b.w - fs * 0.6, b.y + b.h * 0.15, { size: fs * 0.7, col: BLUE, weight: 700 });
  label(ctx, "↓", b.x + b.w - fs * 0.6, b.y + b.h * 0.3, { size: fs * 0.9, col: BLUE });
}

// ---- 2. la soustraction : le rayon se redresse, le sol grandit, l'écart orange ne bouge pas (la figure « unbending ») ----
function sceneSub(ctx, b, u, d, T, fs) {
  const s = ease((u - 1.2) / (d * 0.55)), kk = 0.13, x0 = b.x + fs * 0.8, Wd = b.w - fs * 1.6, y0 = b.y + b.h * 0.25;
  const Rp = Wd * Wd / (2 * 0.6 * b.h * 0.65);
  const yG = (x) => y0 + (1 - s * kk) * x * x / (2 * Rp), yR = (x) => y0 + (1 - s) * kk * x * x / (2 * Rp);
  const path = (f, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const x = Wd * i / 80; i ? ctx.lineTo(x0 + x, f(x)) : ctx.moveTo(x0 + x, f(x)); } ctx.stroke(); };
  ctx.beginPath(); for (let i = 0; i <= 80; i++) { const x = Wd * i / 80; i ? ctx.lineTo(x0 + x, yG(x)) : ctx.moveTo(x0 + x, yG(x)); }
  ctx.lineTo(x0 + Wd, b.y + b.h); ctx.lineTo(x0, b.y + b.h); ctx.closePath(); ctx.fillStyle = "#e6dcc6"; ctx.fill();
  path(yG, GROUND, Math.max(2.5, fs * 0.13)); path(yR, TEAL, Math.max(2.5, fs * 0.13));
  ctx.strokeStyle = AMBER; ctx.lineWidth = Math.max(5, fs * 0.3); ctx.beginPath(); ctx.moveTo(x0 + Wd, yG(Wd)); ctx.lineTo(x0 + Wd, yR(Wd)); ctx.stroke();
  ctx.fillStyle = REEL_COL.ink; ctx.beginPath(); ctx.arc(x0, y0, fs * 0.2, 0, 7); ctx.fill();
  label(ctx, T("rr-hidden"), x0 + Wd - fs * 0.6, (yG(Wd) + yR(Wd)) / 2, { size: fs * 0.55, col: AMBER, align: "right" });
  label(ctx, s > 0.98 ? "R/(1 − k)" : "R", x0 + Wd * 0.45, yG(Wd * 0.45) + fs * 0.8, { size: fs * 0.62, col: GROUND, weight: 700 });
  label(ctx, s > 0.98 ? T("rr-straight") : "R/k", x0 + Wd * 0.45, yR(Wd * 0.45) - fs * 0.7, { size: fs * 0.62, col: TEAL, weight: 700 });
}

// ---- 3. le signe : sur un plan, un rayon courbé vers le sol arrive par au-dessus ; pour cacher il faut l'inverse ----
function sceneSign(ctx, b, u, d, T, fs) {
  const y0 = b.y + b.h * 0.82, x0 = b.x + fs, x1 = b.x + b.w - fs * 1.4, H = b.h * 0.42;
  ctx.fillStyle = "#fbf3e8"; ctx.fillRect(b.x, b.y + b.h * 0.08, b.w, y0 - b.y - b.h * 0.08);
  ctx.fillStyle = "#e6dcc6"; ctx.fillRect(b.x, y0, b.w, b.h - (y0 - b.y)); ctx.strokeStyle = GROUND; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, y0); ctx.lineTo(b.x + b.w, y0); ctx.stroke();
  const ye = y0 - H * 0.8, tx = x1;
  ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = Math.max(3, fs * 0.2); ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx, y0 - H); ctx.stroke();
  // trois rayons de l'œil vers le bas du mât : droit, courbé vers le sol (arrive d'en haut : l'objet paraît plus haut), courbé vers le haut
  const rays = [[0, REEL_COL.ink, T("rr-straight")], [1, TEAL, T("rr-lifted")], [-1, AMBER, T("rr-hot")]];
  rays.forEach(([sg, col, lab], i) => {
    const k = ease((u - 0.6 - i * 1.2) / 1.4); if (k <= 0) return;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2.2, fs * 0.12); ctx.beginPath();
    const yt = y0 - H * 0.45, bow = sg * H * 0.25;
    for (let j = 0; j <= 60 * k; j++) { const t = j / 60, x = x0 + (tx - x0) * t, y = ye + (yt - ye) * t - bow * 4 * t * (1 - t); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    if (k > 0.95) {
      // la direction d'arrivée, prolongée en ligne droite depuis l'œil : où l'œil croit voir le point
      const slope = (yt - ye) / (tx - x0) - bow * 4 / (tx - x0);
      ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, y0 - b.y); ctx.clip(); ctx.setLineDash([fs * 0.2, fs * 0.2]); ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(x0, ye); ctx.lineTo(tx, ye + slope * (tx - x0)); ctx.stroke(); ctx.restore();
      label(ctx, lab, tx - fs * 0.5, Math.min(y0 - fs * 0.5, ye + slope * (tx - x0) + (sg > 0 ? -fs * 0.5 : sg < 0 ? fs * 0.5 : -fs * 0.9)), { size: fs * 0.5, col, align: "right" });
    }
  });
  ctx.fillStyle = REEL_COL.ink; ctx.beginPath(); ctx.arc(x0, ye, fs * 0.2, 0, 7); ctx.fill();
  label(ctx, T("rr-plane"), b.x + fs * 0.4, b.y + b.h * 0.08 + fs * 0.6, { size: fs * 0.6, col: AMBER, align: "left", weight: 800 });
}

// ---- 4. les 97 lignes de Schott : l'excès contre la longueur ----
function sceneZen(ctx, b, u, d, T, fs) {
  const X0 = b.x + fs * 2.4, X1 = b.x + b.w - fs * 0.4, Y0 = b.y + b.h - fs * 1.6, Y1 = b.y + fs * 0.6, sMax = 130, eMax = 3600, AS = 206264.806;
  const X = (s) => X0 + s / sMax * (X1 - X0), Y = (e) => Y0 - e / eMax * (Y0 - Y1);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  ctx.strokeStyle = AMBER; ctx.lineWidth = Math.max(2.5, fs * 0.14); ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  label(ctx, T("rr-zero"), X1, Y0 - fs * 0.45, { size: fs * 0.5, col: AMBER, align: "right" });
  const n = Math.round(ZEN_PAIRS.length * ease((u - 0.5) / (d * 0.55)));
  for (let i = 0; i < n; i++) { const p = ZEN_PAIRS[i]; ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(X(p[3]), Y(p[4]), Math.max(2.4, fs * 0.13), 0, 7); ctx.fill(); }
  if (n === ZEN_PAIRS.length) { ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(sMax), Y(sMax / 7323 * AS)); ctx.stroke();
    label(ctx, "R/(1 − k)", X(sMax * 0.8), Y(sMax * 0.8 / 7323 * AS) - fs * 0.7, { size: fs * 0.55, col: TEAL, weight: 700 }); }
  for (const s of [0, 40, 80, 120]) label(ctx, String(s), X(s), Y0 + fs * 0.55, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  for (const e of [0, 20, 40, 60]) label(ctx, `${e}′`, X0 - fs * 0.35, Y(e * 60), { size: fs * 0.45, col: REEL_COL.soft, align: "right", weight: 500 });
  label(ctx, T("rr-km"), (X0 + X1) / 2, Y0 + fs * 1.2, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  label(ctx, T("rr-exc"), X0 + fs * 0.3, Y1, { size: fs * 0.45, col: REEL_COL.soft, align: "left", weight: 500 });
}

// ---- 5. Round Top – Jackson Butte, 1879 : k heure par heure ----
function sceneHour(ctx, b, u, d, T, fs) {
  const X0 = b.x + fs * 2.4, X1 = b.x + b.w - fs * 0.4, Y0 = b.y + b.h - fs * 1.6, Y1 = b.y + fs * 0.8, k0 = 0.095, k1 = 0.17;
  const X = (h) => X0 + (h - 1) / 23 * (X1 - X0), Y = (k) => Y0 - (k - k0) / (k1 - k0) * (Y0 - Y1);
  ctx.fillStyle = "rgba(30,58,138,.07)"; ctx.fillRect(X0, Y1, X(6) - X0, Y0 - Y1); ctx.fillRect(X(19), Y1, X1 - X(19), Y0 - Y1);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  const n = Math.max(2, Math.round(ZEN_HOURLY.length * ease((u - 0.4) / (d * 0.6))));
  ctx.strokeStyle = BLUE; ctx.lineWidth = Math.max(2.5, fs * 0.15); ctx.beginPath();
  ZEN_HOURLY.slice(0, n).forEach((h, i) => (i ? ctx.lineTo(X(h[0]), Y(h[2])) : ctx.moveTo(X(h[0]), Y(h[2])))); ctx.stroke();
  for (const k of [0.10, 0.13, 0.16]) label(ctx, k.toFixed(2), X0 - fs * 0.35, Y(k), { size: fs * 0.45, col: REEL_COL.soft, align: "right", weight: 500 });
  for (const h of [1, 6, 12, 18, 24]) label(ctx, h === 12 ? T("rr-noon") : `${h} h`, X(h), Y0 + fs * 0.55, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  label(ctx, T("rr-night"), (X0 + X(6)) / 2, Y1 + fs * 0.5, { size: fs * 0.5, col: "#1e3a8a" });
  label(ctx, "k", X0 + fs * 0.4, Y1 - fs * 0.2, { size: fs * 0.55, col: REEL_COL.soft, align: "left" });
}

// ---- 6. les radiosondages de 2026 : jour et nuit ----
function sceneIgra(ctx, b, u, d, T, fs) {
  const X0 = b.x + fs * 0.6, X1 = b.x + b.w - fs * 0.6, Y0 = b.y + b.h - fs * 1.6, Y1 = b.y + fs * 1.2, k0 = -0.3, k1 = 1.1;
  const X = (k) => X0 + (k - k0) / (k1 - k0) * (X1 - X0);
  const H = (o) => o.hist.map((v) => v / o.n / 0.05), hd = H(REF_IGRA.lowDay), hn = H(REF_IGRA.lowNight), top = Math.max(...hd, ...hn) * 1.05;
  const g = ease((u - 0.3) / (d * 0.45)), Y = (v) => Y0 - v / top * (Y0 - Y1) * g;
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  ctx.strokeStyle = AMBER; ctx.lineWidth = Math.max(2, fs * 0.12); ctx.beginPath(); ctx.moveTo(X(1), Y0); ctx.lineTo(X(1), Y1); ctx.stroke();
  label(ctx, T("rr-flat"), X(1) - fs * 0.3, Y1 - fs * 0.3, { size: fs * 0.5, col: AMBER, align: "right" });
  for (const [h, col] of [[hd, "#d97706"], [hn, "#1e3a8a"]]) {
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2.4, fs * 0.13); ctx.beginPath(); let first = true;
    h.forEach((v, i) => { const kc = -1 + (i + 0.5) * 0.05; if (kc < k0 || kc > k1) return; first ? ctx.moveTo(X(kc), Y(v)) : ctx.lineTo(X(kc), Y(v)); first = false; }); ctx.stroke();
  }
  label(ctx, T("rr-day"), X(0.02), Y(Math.max(...hd) * 0.8), { size: fs * 0.55, col: "#d97706", align: "right" });
  label(ctx, T("rr-night"), X(0.42), Y(Math.max(...hn) * 0.6), { size: fs * 0.55, col: "#1e3a8a", align: "left" });
  for (const k of [0, 0.5, 1]) label(ctx, String(k), X(k), Y0 + fs * 0.55, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  label(ctx, "k", (X0 + X1) / 2, Y0 + fs * 1.2, { size: fs * 0.5, col: REEL_COL.soft });
}

// ---- 7. le laser de nuit sur l'eau : les rayons tracés de la section (air de Brighton), globe puis plan ----
const DUCT = LAS_AIRS.findIndex((a) => a.key === "worthing");   // l'air mesuré à Worthing le 23 février 2019
function sceneLaser(ctx, b, u, d, T, fs) {
  const B = lasBeams(DUCT), HM = 7, gap = fs * 1.4, ph = (b.h - gap - fs) / 2, sx = b.w / LAS.D, sy = ph / HM;
  const prog = ease((u - 0.3) / (d * 0.55));
  [[B.g, true], [B.p, false]].forEach(([bm, globe], n) => {
    const y = b.y + fs * 0.4 + n * (ph + gap), bulge = (x) => (globe ? x * (LAS.D - x) / (2 * 6371000) : 0);
    const X = (x) => b.x + x * sx, Y = (x, h) => y + ph - (bulge(x) + h) * sy;
    ctx.save(); ctx.beginPath(); ctx.rect(b.x, y - 2, b.w, ph + 4); ctx.clip();
    ctx.fillStyle = globe ? "#eef2fb" : "#fbf3e8"; ctx.fillRect(b.x, y, b.w, ph);
    ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = LAS.D * i / 60; i ? ctx.lineTo(X(x), Y(x, 0)) : ctx.moveTo(X(x), Y(x, 0)); }
    ctx.lineTo(b.x + b.w, y + ph + 4); ctx.lineTo(b.x, y + ph + 4); ctx.closePath(); ctx.fillStyle = "#cfe5e1"; ctx.fill();
    ctx.strokeStyle = "rgba(220,38,38,.3)"; ctx.lineWidth = 1;
    const xm = LAS.D * prog;
    for (const r of bm.rays) { ctx.beginPath(); let first = true; for (const [x, h] of r.pts) { if (x > xm) break; first ? ctx.moveTo(X(x), Y(x, h)) : ctx.lineTo(X(x), Y(x, h)); first = false; } ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x + 1, Y(0, 0)); ctx.lineTo(b.x + 1, Y(0, LAS.hL)); ctx.moveTo(b.x + b.w - 3, Y(LAS.D, 0)); ctx.lineTo(b.x + b.w - 3, Y(LAS.D, LAS.hE)); ctx.stroke();
    ctx.fillStyle = RED; ctx.fillRect(b.x, Y(0, LAS.hL) - 3, 6, 6);
    ctx.fillStyle = REEL_COL.ink; ctx.beginPath(); ctx.arc(b.x + b.w - 3, Y(LAS.D, LAS.hE), fs * 0.18, 0, 7); ctx.fill();
    label(ctx, globe ? T("rr-globe") : T("rr-plane"), b.x + fs * 0.3, y + fs * 0.55, { size: fs * 0.55, col: globe ? BLUE : AMBER, align: "left", weight: 800 });
    if (prog > 0.98) label(ctx, `✓ ${(LAS.D / 1000).toLocaleString(T.lang)} km`, b.x + b.w - fs * 0.3, y + fs * 0.55, { size: fs * 0.55, col: "#15803d", align: "right", weight: 800 });
  });
}

// ---- 8. Caussols : la température qu'il faut à l'œil, globe et plan ----
function sceneCaus(ctx, b, u, d, T, fs) {
  const N = causNumbers(), X0 = b.x + fs * 2.2, X1 = b.x + b.w - fs * 0.8, Y0 = b.y + b.h - fs * 1.4, Y1 = b.y + fs * 1.2, t0 = -130, t1 = 30;
  const X = (t) => X0 + (t - t0) / (t1 - t0) * (X1 - X0), Y = (h) => Y0 - h / N.h * (Y0 - Y1);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  const lines = [[N.day.Teye, REEL_COL.ink, 0], [N.globe.T, BLUE, 1.2], [N.flat.T, AMBER, 2.4]];
  for (const [Te, col, t] of lines) {
    const k = ease((u - 0.4 - t) / 1.3); if (k <= 0) continue;
    const Tx = N.Tsea + (Te - N.Tsea) * k;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2.6, fs * 0.15); ctx.beginPath(); ctx.moveTo(X(N.Tsea), Y(0)); ctx.lineTo(X(Tx), Y(N.h * k)); ctx.stroke();
    if (k > 0.98) label(ctx, `${Math.round(Te).toString().replace("-", "−")} °C`, X(Te) + (col === AMBER ? fs * 0.3 : -fs * 0.3), Y(N.h) - fs * 0.5, { size: fs * 0.6, col, align: col === AMBER ? "left" : "right", weight: 800 });
  }
  for (const t of [-120, -80, -40, 0, 20]) label(ctx, `${t}°`.replace("-", "−"), X(t), Y0 + fs * 0.55, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  label(ctx, `${Math.round(N.h).toLocaleString(T.lang)} m`, X0 - fs * 0.3, Y(N.h), { size: fs * 0.45, col: REEL_COL.soft, align: "right", weight: 500 });
  label(ctx, "0 m", X0 - fs * 0.3, Y0, { size: fs * 0.45, col: REEL_COL.soft, align: "right", weight: 500 });
  label(ctx, T("rr-globe"), X(N.globe.T) - fs * 0.3, (Y0 + Y1) / 2, { size: fs * 0.5, col: BLUE, align: "right" });
  label(ctx, T("rr-plane"), X((N.flat.T + N.Tsea) / 2) - fs * 0.3, (Y0 + Y1) / 2 + fs, { size: fs * 0.5, col: AMBER, align: "right" });
}

// ---- 9. le bilan : R/(1 − k) mesuré, le plan à l'infini ----
function sceneEnd(ctx, b, u, d, T, fs) {
  const cx = b.x + b.w / 2, cy = b.y + b.h * 0.5, r = Math.min(b.w, b.h) * 0.3;
  ctx.fillStyle = "#eef6f4"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  ctx.strokeStyle = GROUND; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.stroke();
  const k = ease((u - 0.3) / 1.5);
  ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.12); ctx.setLineDash([fs * 0.3, fs * 0.2]); ctx.beginPath(); ctx.arc(cx, cy, r * (1 + 0.15 * k), 0, 7); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, "R", cx, cy, { size: fs * 0.9, col: GROUND, weight: 800 });
  ctx.globalAlpha = k; label(ctx, "R/(1 − k)", cx, cy - r * 1.15 - fs * 0.7, { size: fs * 0.7, col: TEAL, weight: 800 }); ctx.globalAlpha = 1;
}

export const REF_SCENES = [{ key: "bend", d: 6 }, { key: "sub", d: 7 }, { key: "sign", d: 7 }, { key: "zen", d: 7 }, { key: "hour", d: 6.5 }, { key: "igra", d: 6.5 }, { key: "laser", d: 7.5 }, { key: "caus", d: 7 }, { key: "end", d: 4.5, num: false }];
export const REF_DRAW = { bend: sceneBend, sub: sceneSub, sign: sceneSign, zen: sceneZen, hour: sceneHour, igra: sceneIgra, laser: sceneLaser, caus: sceneCaus, end: sceneEnd };
const REEL = makeReel({ scenes: REF_SCENES, draw: REF_DRAW, prefix: "rr", still: 6 + 7 + 7 + 5 });   // à l'arrêt : les 97 lignes, déjà tracées
export const REF_REEL_T = REEL.total;
export const drawRefReel = REEL.drawReel;
export const REF_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = reelValues. */
export function mountRefReel(canvas, tr, lang) {
  const vals = reelValues(lang);
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("rr-alt"));
  return REEL.mountReel(canvas, T);
}
