// Onglet grav : le globe des marées (epic37/UC06, 2026-11-14, idée du propriétaire : « un globe en rotation, et on verrait
// simultanément le champ équipotentiel de pesanteur théorique avec sa déformation, et des "pics" à la surface du globe qui
// montrent les marées réelles »). Canvas 2.5D (pas de WebGL chez le propriétaire), projection orthographique.
//   - la surface d'équilibre : Lune et Soleil à leurs positions du moment (ephemeris.js), hauteur (M/M_T)(R/d)³R·P₂(cos z),
//     en teinte sur l'océan et en déformation du bord, agrandie d'un facteur écrit sur l'image (règle 1) ;
//   - un pic par marégraphe (TICON-3, un par case de 2°, fog build grav-ticon) : la marée que prédisent SES constantes
//     mesurées à l'instant affiché, à la même échelle que la surface d'équilibre.
// Trois scènes : toutes les raies sur deux jours ; M2 seule (l'onde qui tourne autour des points sans marée) ; un mois vu
// une fois par jour lunaire (la rotation se fige, restent vives-eaux et mortes-eaux).
// La caméra suit la Lune, à 90° d'elle : les deux bosses sont sur les bords gauche et droit, la Terre tourne dessous.
// 2026-11-18 (propriétaire : « l'animation avec des pics est gourmande ; pour une fois, du précalculé ») : le globe (bord,
// cases, côtes, flèche, pics) est dessiné par drawGlobe, SANS texte ; scripts/prerender-layers.mjs le rend une fois en vidéo
// carrée (LAYER, src/data/video-layers.js) et la page la plaque sous les textes, dessinés à chaque image dans la langue de la
// page. Sans vidéo à jour (manifeste, empreinte), à l'export, ou animations réduites : drawGlobe dans la page, comme avant.
import { anim2d, text, disc, pow10, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { isLand } from "../../core/aemap.js";
import { jdFromUTC, sun, moon, gmst, deltaT } from "../../core/ephemeris.js";
import { TICON_GLOBE, TICON_NAMES } from "../../data/presets/grav-ticon.js";
import { COASTS } from "../../data/coasts.js";
import { args, predict, equiHeight } from "./tides-logic.js";
import { layerVideo } from "../../core/layer-video.js";

const D2R = Math.PI / 180, TAU = 2 * Math.PI;
const T0 = Date.UTC(2018, 2, 17, 0) / 1000;               // 17 mars 2018, nouvelle lune vers 13 h TU
const LUNAR_DAY = 24.8412 * 3600, M2P = 12.4206 * 3600;
// 44 s (2026-11-21, était 46 : coupé à 45 s dans les vidéos de cartes) : le mouvement de chaque scène garde sa durée (17,4, 12,4,
// 11,6 s), seuls les arrêts sur image raccourcissent, de 1,5 s à HOLD
const SCENES = [0, 0.4148, 0.7168, 1], HOLD = 0.87;
const moveFrac = (s) => 1 - HOLD / ((SCENES[s + 1] - SCENES[s]) * SPAN);   // part de la scène où ça bouge
const CELL = 4;
export const SCALE = 0.14, CLIP_M = 0.32 / SCALE;      // px par mètre en rayons du globe ; pics coupés au-delà de CLIP_M mètres                                            // degrés : la grille de l'océan
const HI = "#1d4ed8", LO = "#dc2626", LANDC = "#e6dfcc";
// constantes des stations, en mètres et en degrés, prêtes pour predict()
const ST = TICON_GLOBE.map((r) => ({ lat: r[0] * D2R, lon: r[1] * D2R, cs: Object.fromEntries(TICON_NAMES.map((n, i) => [n, [r[2 + i] / 100, r[10 + i]]])) }));
// la grille : centre de chaque case et terre/mer, calculés une fois
// la mer en cases de 4° (teinte d'équilibre), la terre en cases de 2° (masque 0,5°, décoratif), les côtes par-dessus
const GRID = (() => { const g = []; for (let la = -90; la < 90; la += CELL) for (let lo = -180; lo < 180; lo += CELL) g.push({ la, lo }); return g; })();
const LANDG = (() => { const g = []; for (let la = -90; la < 90; la += 2) for (let lo = -180; lo < 180; lo += 2) { let n = 0; for (const [a, b] of [[0.5, 0.5], [1.5, 0.5], [0.5, 1.5], [1.5, 1.5]]) n += isLand(la + a, lo + b); if (n >= 2) g.push({ la, lo }); } return g; })();
const COASTLL = COASTS.map((a) => { const out = []; let lo = a[0] / 10, la = a[1] / 10; out.push([la * D2R, lo * D2R]); for (let i = 2; i < a.length; i += 2) { lo += a[i] / 10; la += a[i + 1] / 10; out.push([la * D2R, lo * D2R]); } return out; });
/** Teinte de l'eau selon la hauteur d'équilibre (m) : bleu plus soutenu en haut, plus pâle en bas. */
const seaCol = (h) => { const x = Math.max(-1, Math.min(1, h / 0.35)); const l = 214 - 62 * x; return `rgb(${Math.round(l - 46)},${Math.round(l - 10)},${Math.round(Math.min(255, l + 26))})`; };

function lineCount(ctx, s, maxW, size) {
  ctx.font = `${size}px system-ui, sans-serif`;
  let n = 1, cur = ""; for (const w of String(s).split(" ")) { const t = cur ? cur + " " + w : w; if (cur && ctx.measureText(t).width > maxW) { n++; cur = w; } else cur = t; }
  return n;
}

/** L'instant affiché (s Unix) et la scène, pour u ∈ [0, 1). */
export function sceneAt(u) {
  let s = 0; while (s < SCENES.length - 2 && u >= SCENES[s + 1]) s++;
  const k = Math.max(0, Math.min(1, (u - SCENES[s]) / (SCENES[s + 1] - SCENES[s]) / moveFrac(s)));
  if (s === 0) return { s, t: T0 + k * 2 * 86400 };
  if (s === 1) return { s, t: T0 + k * 2 * M2P };
  return { s, t: T0 + Math.floor(k * 29.999) * LUNAR_DAY, day: Math.floor(k * 29.999) };
}

/** Le calque pré-rendu : carré, globe de rayon size/(2·HALF) au centre ; `k` = épaisseurs, réglées pour un globe de 270 px. */
export const HALF = 1.4, SPAN = 44;
export const LAYER = { id: "gravAnimTideGlobe", span: SPAN, size: 1080,
  paint(ctx, S, u) { ctx.fillStyle = PAPER; ctx.fillRect(0, 0, S, S); const R = S / (2 * HALF); drawGlobe(ctx, S / 2, S / 2, R, u, R / 270); } };

/** Lune, Soleil et temps sidéral à l'instant t (scène s). */
function sky(t, s) {
  const d = new Date(t * 1000), jd = jdFromUTC(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
  const jt = jd + deltaT(d.getUTCFullYear()) / 86400, L = moon(jt), S = sun(jt);
  return { th: gmst(jd) * D2R, raL: L.ra * D2R, decL: s === 1 ? 0 : L.dec * D2R, raS: S.ra * D2R, decS: S.dec * D2R, dKm: s === 1 ? 60.27 * 6371 : L.distKM, dAU: S.distAU, withSun: s !== 1 };
}
/** La caméra : dans le plan de l'équateur céleste, à 90° de la Lune, relevée de 18° ; e1, e2 = axes de l'écran. */
function camera(raL) {
  const ac = raL + Math.PI / 2, dc = 18 * D2R, c = [Math.cos(dc) * Math.cos(ac), Math.cos(dc) * Math.sin(ac), Math.sin(dc)];
  const e1 = (() => { const v = [-c[1], c[0], 0], n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n, 0]; })();
  const e2 = [c[1] * e1[2] - c[2] * e1[1], c[2] * e1[0] - c[0] * e1[2], c[0] * e1[1] - c[1] * e1[0]];
  return { c, e1, e2 };
}
/** Direction de la Lune à l'écran (x vers la droite, y vers le haut), et où s'arrête sa flèche (en rayons du globe). */
export function moonArrow(raL) {
  const { e1, e2 } = camera(raL), dirL = [Math.cos(raL), Math.sin(raL), 0], x = dirL[0] * e1[0] + dirL[1] * e1[1], y = dirL[0] * e2[0] + dirL[1] * e2[1];
  const n = Math.hypot(x, y) || 1; return { ux: x / n, uy: y / n, r0: 1.12, r1: 1.3 };
}

/**
 * Le globe à l'instant u, centre (cx, cy), rayon Rpx ; k = facteur des épaisseurs de trait et des points (1 dans la page).
 * Tout ce qui coûte (≈ 5 000 quadrilatères, les côtes, 613 prédictions) et aucun texte : c'est ce que la vidéo contient.
 */
export function drawGlobe(ctx, cx, cy, Rpx, u, k = 1) {
  const { s, t } = sceneAt(u), Spx = Rpx * SCALE, CLIP = CLIP_M * Spx;   // px par mètre
  const { th, raL, decL, raS, decS, dKm, dAU, withSun } = sky(t, s), { c, e1, e2 } = camera(raL);
  const P = (la, lo) => { const li = lo + th, cl = Math.cos(la); return [cl * Math.cos(li), cl * Math.sin(li), Math.sin(la)]; };
  const scr = (p, r = Rpx) => [cx + r * (p[0] * e1[0] + p[1] * e1[1] + p[2] * e1[2]), cy - r * (p[0] * e2[0] + p[1] * e2[1] + p[2] * e2[2])];
  const dep = (p) => p[0] * c[0] + p[1] * c[1] + p[2] * c[2];
  const hEq = (la, lo) => { const li = lo + th; return equiHeight(la, Math.cos(li - raL), decL, dKm, withSun ? Math.cos(li - raS) : null, decS, dAU); };
  // 1. la surface d'équilibre vue de profil : le bord, déformé, rempli d'eau
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = TAU * i / 120, q = [Math.cos(a) * e1[0] + Math.sin(a) * e2[0], Math.cos(a) * e1[1] + Math.sin(a) * e2[1], Math.cos(a) * e1[2] + Math.sin(a) * e2[2]];
    const la = Math.asin(q[2]), li = Math.atan2(q[1], q[0]), h = equiHeight(la, Math.cos(li - raL), decL, dKm, withSun ? Math.cos(li - raS) : null, decS, dAU);
    const r = Rpx + 0.04 * Rpx + h * Spx, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fillStyle = "#d4e6f1"; ctx.fill(); ctx.strokeStyle = HI; ctx.lineWidth = 1.4 * k; ctx.stroke();
  // 2. le globe : cases de 4°, terre ou mer teintée par la hauteur d'équilibre
  disc(ctx, cx, cy, Rpx, "#cfe0ec");
  const quad = (la, lo, st, col) => {
    const la0 = la * D2R, lo0 = lo * D2R, la1 = (la + st) * D2R, lo1 = (lo + st) * D2R;
    if (dep(P((la0 + la1) / 2, (lo0 + lo1) / 2)) <= 0.02) return;
    const q = [scr(P(la0, lo0)), scr(P(la0, lo1)), scr(P(la1, lo1)), scr(P(la1, lo0))], c = col ?? seaCol(hEq((la0 + la1) / 2, (lo0 + lo1) / 2));
    ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 0.7 * k;
    ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  for (const g of GRID) quad(g.la, g.lo, CELL);
  for (const g of LANDG) quad(g.la, g.lo, 2, LANDC);
  ctx.strokeStyle = "#8a8170"; ctx.lineWidth = 0.7 * k;
  for (const line of COASTLL) { ctx.beginPath(); let pen = false; for (const [la, lo] of line) { const p = P(la, lo); if (dep(p) <= 0) { pen = false; continue; } const q = scr(p); pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } ctx.stroke(); }
  ctx.strokeStyle = "#8aa4b8"; ctx.lineWidth = 1 * k; ctx.beginPath(); ctx.arc(cx, cy, Rpx, 0, TAU); ctx.stroke();
  // la flèche de la Lune (son nom est écrit par la page, dans sa langue)
  { const { ux, uy, r0: a0, r1: a1 } = moonArrow(raL), r0 = Rpx * a0, r1 = Rpx * a1;
    ctx.strokeStyle = GLOBE; ctx.fillStyle = GLOBE; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(cx + ux * r0, cy - uy * r0); ctx.lineTo(cx + ux * r1, cy - uy * r1); ctx.stroke();
    ctx.beginPath(); const a = Math.atan2(-uy, ux), hx = cx + ux * r1, hy = cy - uy * r1, L = 8 * k; ctx.moveTo(hx, hy); ctx.lineTo(hx - L * Math.cos(a - 0.4), hy - L * Math.sin(a - 0.4)); ctx.lineTo(hx - L * Math.cos(a + 0.4), hy - L * Math.sin(a + 0.4)); ctx.fill(); }
  // 3. les marégraphes : un pic radial (même échelle que la surface d'équilibre) et un point dont la taille dit |h|
  const A = args(t, s === 1 ? ["M2"] : TICON_NAMES);
  const pts = [];
  for (const st of ST) { const p = P(st.lat, st.lon), z = dep(p); if (z <= 0.05) continue; pts.push([z, p, predict(st.cs, A)]); }
  pts.sort((a, b) => a[0] - b[0]);
  for (const [, p, h] of pts) {
    const cut = Math.abs(h * Spx) > CLIP, hl = cut ? Math.sign(h) * CLIP : h * Spx;
    const b = scr(p), e = scr(p, Rpx + hl), col = h >= 0 ? HI : LO;
    ctx.strokeStyle = col; ctx.lineWidth = 1.3 * k; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
    if (cut) disc(ctx, e[0], e[1], 4 * k, "#fff", col, 1.6 * k); else disc(ctx, e[0], e[1], k * Math.min(4.5, 1.1 + Math.abs(h) * 1.6), col);
  }
}

export function mountTideGlobe(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtT = (t) => new Date(t * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
  const CAPS = [
    tr("tg-c1", "The surface the pull would give the water (shading, and the outline drawn out into two bulges) turns with the Moon; each spike is one tide gauge, its tide at that instant from its own measured constants. Same clock everywhere, but each coast is early or late: the spikes do not ride the bulges."),
    tr("tg-c2", "The Moon's twice-daily line alone. The real M2 wave runs round each ocean basin, and has points where it vanishes (spikes that never grow): the sea answers the pull with its own delays."),
    tr("tg-c3", "One picture per lunar day: the Earth is back in the same place under the Moon, so the twice-daily tide is frozen. What still changes is the Sun's share: spikes swell at new and full moon, shrink at the quarters."),
  ];
  const vid = layerVideo(canvas, LAYER.id, { span: SPAN });
  const DEV = !!import.meta.env?.DEV, ticks = [];   // serveur de dev seulement : vidéo ou calcul, et images par seconde
  const a = anim2d(canvas, { span: SPAN, u0: 0.12, draw(ctx, W, H, u0, playing) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const u = vid.active(playing, u0) ? vid.u() : u0;     // la vidéo mène : les textes suivent son image
    const { s, t, day } = sceneAt(u), M = 10, narrow = W < 560;
    const titles = [tr("tg-t1", "1. The pull of the Moon and the Sun, and the tide at {n} gauges").replace("{n}", nf(ST.length)), tr("tg-t2", "2. The Moon's twice-daily line, M2, alone"), tr("tg-t3", "3. One month, seen once every lunar day")];
    const n1 = text(ctx, titles[s], M, 17, { size: 12.5, bold: true, maxW: W - 2 * M });
    const yI = 17 + n1 * 16;
    const info = s === 2 ? tr("tg-day", "day {d} of the lunar month · {t}").replace("{d}", day).replace("{t}", fmtT(t)) : fmtT(t);
    // légende en ligne, qui passe à la ligne quand elle ne tient plus (mesurée d'abord, dessinée à la fin)
    const LEG = [["hi", tr("tg-l-hi", "gauge above its mean")], ["lo", tr("tg-l-lo", "below")], ["eq", tr("tg-l-eq", "sea shaded by the equilibrium height")], ["cut", tr("tg-l-cut", "ring: tide larger than drawn (spike cut at {m} m)").replace("{m}", nf(CLIP_M, 1))]];
    const legend = (y0, draw) => { ctx.font = "10px system-ui, sans-serif"; let x = M, y = y0;
      for (const [k, lab] of LEG) { const sw = k === "eq" ? 28 : 13, w = sw + Math.min(ctx.measureText(lab).width, W - 2 * M - sw) + 16;
        if (x > M && x + w > W - M) { x = M; y += 14; }
        if (draw) { if (k === "hi" || k === "lo") disc(ctx, x + 5, y - 4, 3.5, k === "hi" ? HI : LO); else if (k === "cut") disc(ctx, x + 5, y - 4, 3.5, "#fff", HI, 1.4); else { ctx.fillStyle = seaCol(0.4); ctx.fillRect(x, y - 9, 12, 10); ctx.fillStyle = seaCol(-0.3); ctx.fillRect(x + 12, y - 9, 12, 10); }
          text(ctx, lab, x + sw, y, { size: 10, c: INK, maxW: W - 2 * M - sw }); }
        const nl = lineCount(ctx, lab, W - 2 * M - sw, 10); ctx.font = "10px system-ui, sans-serif";
        if (nl > 1) { y += (nl - 1) * 13; x = W; } else x += w; }
      return y - y0 + 14; };
    const cap = CAPS[s], capH = lineCount(ctx, cap, W - 2 * M, 10.5) * 14 + 6, legH = legend(0, false) + 10;
    const yG = yI + 9, vTop = yG + 14, vBot = H - capH - legH, vh = vBot - vTop;
    const Rpx = Math.min(vh * 0.37, W * 0.3), cx = W / 2, cy = vTop + vh / 2, Spx = Rpx * SCALE;
    const fac = (Spx / Rpx) * 6.371e6;
    if (vid.on) {   // l'image de la vidéo, coupée à la bande du globe (son fond déborde un peu sur la date et la légende)
      const r = HALF * Rpx; ctx.save(); ctx.beginPath(); ctx.rect(0, yI + 4, W, vBot - yI - 4); ctx.clip(); ctx.drawImage(vid.el, cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
    } else drawGlobe(ctx, cx, cy, Rpx, u);
    text(ctx, info, M, yI, { size: 10.5, c: SOFT, mono: true });
    // la jauge du temps de l'animation (propriétaire, 2026-11-18) : elle glisse sans à-coup ; un trait à chaque changement de
    // scène et, dans la troisième, un cran par jour lunaire, là où le globe change d'image (les sauts sont voulus, et visibles)
    { const w = W - 2 * M, X = (v) => M + w * v;
      ctx.fillStyle = "#e4e2dc"; ctx.fillRect(M, yG, w, 4); ctx.fillStyle = "#a9c1dc"; ctx.fillRect(M, yG, w * u, 4);
      ctx.fillStyle = FAINT; for (let d = 1; d < 30; d++) ctx.fillRect(X(SCENES[2] + (SCENES[3] - SCENES[2]) * moveFrac(2) * d / 29.999) - 0.5, yG - 1, 1, 6);
      ctx.fillStyle = INK; for (let i = 1; i < SCENES.length - 1; i++) ctx.fillRect(X(SCENES[i]) - 1, yG - 3, 2, 10);
      disc(ctx, X(u), yG + 2, 4.5, GLOBE, "#fff", 1.5); }
    { const { ux, uy, r1 } = moonArrow(sky(t, s).raL), x = cx + ux * r1 * Rpx, y = cy - uy * r1 * Rpx;
      text(ctx, tr("td-moon", "Moon"), x, y - 8, { size: 10.5, c: GLOBE, align: ux > 0 ? "right" : "left" }); }
    // échelle et légende
    text(ctx, tr("tg-st", "heights drawn {f} times higher, the same for the surface and the spikes").replace("{f}", pow10(fac)), W - M, vTop + 2, { size: 10, c: FLAT, align: "right", maxW: narrow ? W - 2 * M : W * 0.55 });
    legend(vBot + 14, true);
    text(ctx, cap, M, H - capH + 10, { size: 10.5, c: INK, maxW: W - 2 * M });
    if (DEV && playing) { const now = performance.now(); ticks.push(now); while (ticks.length > 31) ticks.shift();
      const fps = ticks.length > 1 ? (ticks.length - 1) * 1000 / (now - ticks[0]) : 0;
      text(ctx, `dev · ${vid.on ? "vidéo" : "calcul"} · ${fps.toFixed(0)} i/s`, W - M, vTop + 16, { size: 9.5, c: SOFT, mono: true, align: "right" }); }
  } });
  vid.attach(a, canvas);
  return { ...a, stop() { a.stop(); vid.pause(); } };
}
