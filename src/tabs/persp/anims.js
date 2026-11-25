// Animations de l'onglet persp (2026-11-21, propriétaire : « quatre cubes qui s'éloignent… le parallèle avec le coucher de
// soleil… les rayons du soleil… la caméra se tourne… la même chose avec un soleil très proche »). Toutes en perspective
// vraie (persp3d.js : x' = f X/Z) ; seul le disque du Soleil est agrandi, et le tampon le dit (règle 1). Les nombres lus
// à l'écran viennent de logic.js.
import { anim2d, text, disc, arrow, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { drawCubes, drawRaysView, drawRaysPlan, drawRaysSection } from "./persp3d.js";
import { perspValues, dipAngle, flatDip, DIP_SKY, CUBES, DEG, gapAngle, ACUITY, flatElevation, flatSunAngDiam, FLAT_SUN_H, FLAT_D_MAX, SUN_DIAM_DEG, BOAT, R_EARTH, K_REFR, hiddenHeight, horizonDist } from "./logic.js";

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const nfmt = (lang) => (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
/** Deux cadres côte à côte (écran large) ou l'un sous l'autre : [x, y, w, h]. */
function split(W, H, top, bottom, frac = 0.5, minW = 560) {
  const side = W >= minW, h = H - top - bottom;
  return side ? [[0, top, W * frac, h], [W * frac, top, W * (1 - frac), h]] : [[0, top, W, h * frac], [0, top + h * frac, W, h * (1 - frac)]];
}
const R = (p, pad = 6) => ({ x: p[0] + pad, y: p[1] + pad, w: p[2] - 2 * pad, h: p[3] - 2 * pad });
/** Bandeau de texte lisible sur une image : fond blanc translucide. */
function tag(ctx, s, x, y, { size = 12.5, c = INK, bold = true, align = "left", maxW = 400 } = {}) {
  ctx.font = `${bold ? "600 " : ""}${size}px system-ui, sans-serif`;
  const w = Math.min(maxW, ctx.measureText(s).width), x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.fillStyle = "rgba(255,255,255,.82)"; ctx.fillRect(x0 - 4, y - size, w + 8, size * 1.45);
  text(ctx, s, x, y, { size, c, bold, align, maxW });
}

/* ---- 1. le carré de cubes qui s'éloigne ------------------------------------------------------------------------------- */
/** La distance des cubes à l'instant t (s) : de 4 m à 2 km, à vitesse logarithmique constante (chaque doublement prend le même temps). */
export const cubeDist = (t, T = 11) => 4 * Math.pow(500, clamp(t / T));

/** Dessine la vue des cubes et sa loupe dans r ; renvoie l'écart en degrés. Partagé avec la vitrine. */
export function cubesView(ctx, r, d, tr, lang, { loupe = true, size = 12.5 } = {}) {
  const nf = nfmt(lang), f = r.h * 0.95, cx = r.x + r.w / 2, cy = r.y + r.h * 0.48;
  const B = drawCubes(ctx, r, d, { f, cx, cy });
  tag(ctx, tr("an-cu-hz", "eye level"), r.x + 6, cy - 6, { size: size * 0.85, c: FLAT, bold: false });
  const gap = gapAngle(d);
  if (loupe && d > 20) {
    const N = d / 4, iw = r.w * 0.36, ih = r.h * 0.42, ix = r.x + r.w - iw - 6, iy = r.y + 6;
    const ir = { x: ix, y: iy, w: iw, h: ih }, fz = f * N, ctr = d + 0.5;
    const dy = CUBES.eye - (CUBES.lowTop + CUBES.highBottom) / 2 - 0.0, cyz = iy + ih * 0.5 - (fz * dy) / ctr;   // le centre du carré au centre de la loupe
    // la zone agrandie, dans la vue
    const zw = iw / N, zh = ih / N, zx = cx - zw / 2, zy = cy + (f * dy) / ctr - zh / 2;
    ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.2; ctx.strokeRect(zx, zy, Math.max(zw, 2), Math.max(zh, 2));
    ctx.beginPath(); ctx.moveTo(zx, zy + zh); ctx.lineTo(ix, iy + ih); ctx.moveTo(zx + zw, zy); ctx.lineTo(ix + iw, iy); ctx.stroke();
    drawCubes(ctx, ir, d, { f: fz, cx: ix + iw / 2, cy: cyz });
    ctx.strokeStyle = GLOBE; ctx.lineWidth = 2; ctx.strokeRect(ix, iy, iw, ih);
    tag(ctx, `${tr("an-cu-zoom", "zoom")} ×${nf(N, N < 10 ? 1 : 0)}`, ix + 6, iy + ih - 6, { size: size * 0.9, c: GLOBE });
  }
  const arc = gap * 60;
  const s = arc >= 60 ? `${nf(gap, 2)}°` : arc >= 1 ? `${nf(arc, 1)}′` : `${nf(arc * 60, 0)}″`;
  tag(ctx, `${tr("an-cu-d", "distance")} ${d < 1000 ? nf(d, 0) + " m" : nf(d / 1000, 2) + " km"}`, r.x + 6, r.y + r.h - 26, { size });
  tag(ctx, `${tr("an-cu-gap", "gap between the rows")}: ${s}`, r.x + 6, r.y + r.h - 8, { size, c: GLOBE });
  return gap;
}

/** Le graphique de l'écart vu (minutes d'arc, échelles logarithmiques) avec le point courant et l'acuité de l'œil. */
function gapPlot(ctx, r, d, tr, lang) {
  const nf = nfmt(lang), x0 = r.x + 44, x1 = r.x + r.w - 10, y0 = r.y + r.h - 34, y1 = r.y + 30;
  const lx = (v) => x0 + ((Math.log10(v) - 0) / 4) * (x1 - x0);                   // 1 m à 10 km
  const ly = (a) => y0 - ((Math.log10(a) + 1) / 4) * (y0 - y1);                    // 0,1′ à 1 000′
  ctx.fillStyle = PAPER; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  for (const [v, s] of [[1, "1 m"], [10, "10 m"], [100, "100 m"], [1000, "1 km"], [10000, "10 km"]]) text(ctx, s, lx(v), y0 + 14, { size: 10.5, c: SOFT, align: "center" });
  for (const [a, s] of [[0.1, "0.1′"], [1, "1′"], [10, "10′"], [100, "100′"], [1000, "1000′"]]) text(ctx, s.replace(".", nf(0.1, 1)[1] || "."), x0 - 4, ly(a) + 4, { size: 10.5, c: SOFT, align: "right" });
  // l'acuité
  ctx.strokeStyle = "rgba(180,83,9,.6)"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, ly(ACUITY * 60)); ctx.lineTo(x1, ly(ACUITY * 60)); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, tr("an-cu-eye", "what the naked eye separates (1′)"), x1, ly(1) - 5, { size: 10.5, c: FLAT, align: "right" });
  ctx.strokeStyle = GLOBE; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 80; i++) { const v = Math.pow(10, (4 * i) / 80); const a = gapAngle(v) * 60; i ? ctx.lineTo(lx(v), ly(a)) : ctx.moveTo(lx(v), ly(a)); }
  ctx.stroke();
  const dd = clamp(d, 1, 1e4); disc(ctx, lx(dd), ly(gapAngle(dd) * 60), 5, GLOBE, PAPER, 1.5);
  text(ctx, tr("an-cu-plot", "the gap seen, in minutes of arc"), r.x + 8, r.y + 16, { size: 12.5, bold: true, c: INK, maxW: r.w - 16 });
  text(ctx, tr("an-cu-never", "halves when the distance doubles; never zero"), x1, y1 + 8, { size: 11, c: GLOBE, align: "right", maxW: r.w * 0.7 });
}

export function mountCubes(canvas, tr, lang = "en") {
  const span = 14, T = 11;
  return anim2d(canvas, { span, u0: 0.35, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * span, d = cubeDist(t, T), P = split(W, H, 22, 4, 0.6);
    cubesView(ctx, R(P[0], 4), d, tr, lang);
    gapPlot(ctx, R(P[1], 4), d, tr, lang);
    stamp2d(ctx, W, tr("an-cu-st", "true perspective: 1 m cubes, eye 1.7 m up; nothing exaggerated"), false);
  } });
}

/* ---- 2. le coucher : un Soleil au-dessus d'un plan, un Soleil derrière une sphère --------------------------------------- */
const FLAT_D0 = FLAT_SUN_H / Math.tan(60 * DEG);
/** L'état des deux Soleils pour p ∈ [0, 1] : plat (distance, hauteur, diamètre), globe (hauteur ; diamètre constant). */
/** La distance de l'œil au Soleil, affichée à côté de lui : plat √(h² + d²) ; globe une unité astronomique. */
export function sunDistLabel(st, flat, tr, lang) {
  const nf = nfmt(lang);
  return flat ? `${nf(Math.hypot(FLAT_SUN_H, st.d) / 1000, 1)} ${tr("an-ss-tkm", "thousand km")}` : `${nf(149.6, 1)} ${tr("an-ss-mkm", "million km")}`;
}
export function sunsetState(p) {
  const d = FLAT_D0 + p * (FLAT_D_MAX - FLAT_D0);
  return { d, aFlat: flatElevation(d), dFlat: flatSunAngDiam(d), aGlobe: 60 - p * 68, dGlobe: SUN_DIAM_DEG };
}
const EX_SUN = 6;
/** Ce que voit l'observateur, tourné vers le Soleil : hauteur de −10° à 65°, disque agrandi EX_SUN fois. */
export function skyView(ctx, r, alpha, diam, { floor = null, label, col = INK, tr, lang, size = 12, dist = null }) {
  const nf = nfmt(lang), lo = -10, hi = 65, Y = (a) => r.y + r.h - ((a - lo) / (hi - lo)) * r.h, hy = Y(0), ppd = r.h / (hi - lo);
  const g = ctx.createLinearGradient(0, r.y, 0, hy); g.addColorStop(0, "#bcd3ee"); g.addColorStop(1, "#f7e8cf");
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, hy - r.y);
  for (let a = 10; a <= 60; a += 10) { if (a > 40) continue; ctx.strokeStyle = "rgba(21,26,33,.08)"; ctx.beginPath(); ctx.moveTo(r.x, Y(a)); ctx.lineTo(r.x + r.w, Y(a)); ctx.stroke(); text(ctx, `${a}°`, r.x + r.w - 4, Y(a) - 3, { size: 10, c: SOFT, align: "right" }); }
  if (floor != null) { ctx.strokeStyle = "rgba(180,83,9,.7)"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(r.x, Y(floor)); ctx.lineTo(r.x + r.w, Y(floor)); ctx.stroke(); ctx.setLineDash([]); }
  const sx = r.x + r.w * 0.55, sy = Y(alpha), rad = Math.max(1.5, (diam / 2) * ppd * EX_SUN);
  disc(ctx, sx, sy, rad, "#fde68a", "#f59e0b", 1.2);
  if (dist && alpha > -0.3) {
    ctx.font = `600 ${size * 0.95}px system-ui, sans-serif`;
    const w = ctx.measureText(dist).width, left = sx - rad - 8 - w >= r.x + 4, y = sy < r.y + 36 ? sy + rad + 16 : sy + 4;
    text(ctx, dist, left ? sx - rad - 8 : r.x + r.w - 30, left ? y : sy - rad - 6, { size: size * 0.95, bold: true, c: col, align: "right" });
  }   // la distance du Soleil, à côté de lui
  ctx.fillStyle = "#6b8f4e"; ctx.fillRect(r.x, hy, r.w, r.y + r.h - hy);   // le sol couvre ce qui est dessous
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(r.x, hy); ctx.lineTo(r.x + r.w, hy); ctx.stroke();
  ctx.restore();
  tag(ctx, label, r.x + 6, r.y + 16, { size, c: col, maxW: r.w - 12 });
  tag(ctx, `${tr("an-ss-alt", "height")} ${nf(alpha, 1)}° · ${tr("an-ss-diam", "disc")} ${nf(diam * 60, 1)}′`, r.x + 6, r.y + r.h - 10, { size: size * 0.95, c: col, maxW: r.w - 12 });
}
/** La coupe du modèle plat à l'échelle vraie : le sol, l'observateur, le Soleil à h, la ligne de visée et α. */
export function flatSide(ctx, r, st, tr, lang, size = 12) {
  const nf = nfmt(lang), k = (r.w - 30) / 21000, ox = r.x + 14, gy = r.y + r.h - 18;
  ctx.fillStyle = PAPER; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(r.x + 4, gy); ctx.lineTo(r.x + r.w - 4, gy); ctx.stroke();
  const sx = ox + st.d * k, sy = gy - FLAT_SUN_H * k;
  ctx.strokeStyle = "rgba(180,83,9,.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, sy); ctx.lineTo(r.x + r.w - 6, sy); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = FLAT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(sx, sy); ctx.stroke();
  disc(ctx, sx, sy, 6, "#fde68a", "#f59e0b", 1.2); disc(ctx, ox, gy - 2, 3.5, GLOBE);
  ctx.strokeStyle = FLAT; ctx.beginPath(); ctx.arc(ox, gy, 34, -Math.atan2(gy - sy, sx - ox), 0); ctx.stroke();
  text(ctx, `α = ${nf(st.aFlat, 1)}°`, ox + 38, gy - 6, { size, c: FLAT, bold: true });
  text(ctx, `h = ${nf(FLAT_SUN_H)} km`, sx, sy + 20, { size: size * 0.9, c: SOFT, align: sx > r.x + r.w * 0.6 ? "right" : "left" });
  text(ctx, `d = ${nf(st.d)} km`, (ox + sx) / 2, gy + 14, { size: size * 0.9, c: SOFT, align: "center" });
  tag(ctx, tr("an-ss-flat", "A Sun 5,000 km above a flat Earth"), r.x + 6, r.y + 16, { size, c: FLAT, maxW: r.w - 12 });
}
/** La coupe du globe : le Soleil loin à droite (rayons parallèles), l'observateur emporté par la rotation, son horizon. */
export function globeSide(ctx, r, st, tr, lang, size = 12) {
  const nf = nfmt(lang), Rp = Math.min(r.w * 0.24, r.h * 0.33), cx = r.x + r.w * 0.36, cy = r.y + r.h * 0.56;
  ctx.fillStyle = PAPER; ctx.fillRect(r.x, r.y, r.w, r.h);
  for (let i = -2; i <= 2; i++) arrow(ctx, r.x + r.w - 8, cy + i * Rp * 0.45, r.x + r.w * 0.72, cy + i * Rp * 0.45, "rgba(217,119,6,.55)", 1.3, 6);
  ctx.fillStyle = "#dbe6f7"; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 2 * Math.PI); ctx.fill(); ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = "rgba(21,26,33,.12)"; ctx.beginPath(); ctx.arc(cx, cy, Rp, Math.PI / 2, 1.5 * Math.PI); ctx.fill();   // la nuit
  const th = (90 - st.aGlobe) * DEG, px = cx + Rp * Math.cos(th), py = cy - Rp * Math.sin(th);   // angle depuis le point sous le Soleil
  const tx = -Math.sin(th), ty = -Math.cos(th);   // l'horizon local (tangente)
  ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px - tx * Rp * 0.7, py - ty * Rp * 0.7); ctx.lineTo(px + tx * Rp * 0.7, py + ty * Rp * 0.7); ctx.stroke();
  if (st.aGlobe > 0) { ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(r.x + r.w - 10, py); ctx.stroke(); }
  disc(ctx, px, py, 4, GLOBE);
  text(ctx, `α = ${nf(st.aGlobe, 1)}°`, r.x + r.w - 10, r.y + r.h - 8, { size, c: GLOBE, bold: true, align: "right" });
  tag(ctx, tr("an-ss-globe", "A distant Sun, a turning globe"), r.x + 6, r.y + 16, { size, c: GLOBE, maxW: r.w - 12 });
}

export function mountSunset(canvas, tr, lang = "en") {
  const span = 14;
  return anim2d(canvas, { span, u0: 0.5, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const p = clamp((u * span) / 11), st = sunsetState(p), P = split(W, H, 22, 4, 0.5);
    for (const [i, flat] of [[0, true], [1, false]]) {
      const b = R(P[i], 4), top = { x: b.x, y: b.y, w: b.w, h: b.h * 0.46 }, bot = { x: b.x, y: b.y + b.h * 0.5, w: b.w, h: b.h * 0.5 };
      if (flat) flatSide(ctx, top, st, tr, lang); else globeSide(ctx, top, st, tr, lang);
      skyView(ctx, bot, flat ? st.aFlat : st.aGlobe, flat ? st.dFlat : st.dGlobe, { dist: sunDistLabel(st, flat, tr, lang), floor: flat ? flatElevation(FLAT_D_MAX) : null, label: flat ? tr("an-ss-sky1", "seen: it shrinks, and stops at 14°") : tr("an-ss-sky2", "seen: same size, then below the horizon"), col: flat ? FLAT : GLOBE, tr, lang });
    }
    stamp2d(ctx, W, tr("an-ss-st", "flat side view at true scale; Sun's disc in the sky drawn 6× larger"), true);
  } });
}

const perspFill = (x, lang) => { const v = perspValues(lang); return x.replace(/\{\{(\w+)\}\}/g, (_, q) => v[q] ?? q); };

/* ---- 3. les rayons : la caméra tourne, puis regarde d'en haut ------------------------------------------------------------ */
// Les phases (s) : face au Soleil, tour jusqu'au profil, tenue, tour jusqu'au dos, tenue, fondu vers le plan, plan, retour.
export const RAY_SPAN = 26;
export function rayPhase(t) {
  const y = (a, b, t0, t1) => a + (b - a) * ease((t - t0) / (t1 - t0));
  if (t < 4) return { yaw: 0, plan: 0, k: "sun" };
  if (t < 7) return { yaw: y(0, 90, 4, 7), plan: 0, k: "turn" };
  if (t < 10) return { yaw: 90, plan: 0, k: "side" };
  if (t < 13) return { yaw: y(90, 180, 10, 13), plan: 0, k: "turn" };
  if (t < 16) return { yaw: 180, plan: 0, k: "anti" };
  if (t < 17.5) return { yaw: 180, plan: ease((t - 16) / 1.5), k: "anti" };
  if (t < 23.5) return { yaw: 180, plan: 1, k: "plan" };
  if (t < 25) return { yaw: 0, plan: 1 - ease((t - 23.5) / 1.5), k: "sun" };
  return { yaw: 0, plan: 0, k: "sun" };
}
/** Une image des rayons (lointain ou proche) dans r, au cap yaw (degrés) ; mini : le petit plan dans un coin. */
export function raysFrame(ctx, r, { near, yaw, plan = 0, k, tr, size = 12.5, mini = true, captions = true, lang = "en" }) {
  const v = perspValues(lang), fill = (x) => x.replace(/\{\{(\w+)\}\}/g, (_, q) => v[q] ?? q);
  const lab = { sun: tr("an-ry-sun", "the Sun"), anti: tr("an-ry-anti", "antisolar point"), toSun: tr("an-ry-tosun", "to the Sun"), under: tr("an-ry-under", "under the Sun"), eye: tr("an-ry-eye", "you") };
  if (plan < 1) {
    drawRaysView(ctx, r, { near, yaw: yaw * DEG, ghost: near, labels: lab });
    if (mini) { const m = { x: r.x + 6, y: r.y + r.h * 0.5, w: r.w * 0.24, h: r.h * 0.5 - 6 }; drawRaysPlan(ctx, m, { near, yaw: yaw * DEG }); ctx.strokeStyle = SOFT; ctx.lineWidth = 1; ctx.strokeRect(m.x, m.y, m.w, m.h); }
  }
  if (plan > 0) {
    // d'en haut (plan) et de côté (coupe à l'échelle vraie) : côte à côte sur écran large, l'une sous l'autre sinon
    const wide = r.w >= r.h * 1.3, A = wide ? { x: r.x, y: r.y + 30, w: r.w * 0.42, h: r.h - 30 } : { x: r.x, y: r.y + r.h * 0.42, w: r.w, h: r.h * 0.58 };
    const B = wide ? { x: r.x + r.w * 0.42, y: r.y + r.h * 0.3, w: r.w * 0.58, h: r.h * 0.7 } : { x: r.x, y: r.y + 52, w: r.w, h: r.h * 0.42 - 52 };
    ctx.save(); ctx.globalAlpha = plan; ctx.fillStyle = PAPER; ctx.fillRect(r.x, r.y, r.w, r.h);
    drawRaysPlan(ctx, A, { near, yaw: yaw * DEG, labels: lab });
    drawRaysSection(ctx, B, { near, labels: { eye: lab.eye, sun: near ? lab.sun : lab.toSun, scale: tr("an-ry-true", "side view, true scale") } });
    ctx.restore();
  }
  const key = plan > 0.5 ? (near ? "plan-n" : "plan-f") : k === "turn" ? null : `${k}${near ? "-n" : "-f"}`;
  const say = {
    "sun-f": tr("an-ry-c-sun", "Facing the Sun: the beams fan out from it"),
    "side-f": tr("an-ry-c-side", "Side-on: the same beams are parallel"),
    "anti-f": tr("an-ry-c-anti", "Back to the Sun: they close up again, towards the antisolar point"),
    "plan-f": tr("an-ry-c-plan", "From above and from the side: all parallel; each patch of light is its gap, moved, not enlarged"),
    "sun-n": fill(tr("an-ry-c-sun-n", "The best-fit Sun, {{nearD}} km away, {{nearAbove}} m above the clouds: the same fan (dotted: the distant Sun's beams)")),
    "side-n": tr("an-ry-c-side-n", "Side-on: parallel again, on the same lines"),
    "anti-n": tr("an-ry-c-anti-n", "Back to it: on the same lines, towards the same antisolar point"),
    "plan-n": fill(tr("an-ry-c-plan-n", "From above and from the side: a pyramid under the Sun; the patches are {{patchK}}× the gaps")),
  }[key];
  if (say && captions) tag(ctx, say, r.x + 8, r.y + 20, { size, c: near ? FLAT : INK, maxW: r.w - 16 });
  if (plan < 0.5 && captions) tag(ctx, `${tr("an-ry-yaw", "facing")} ${Math.round(yaw)}° ${tr("an-ry-from", "from the Sun")}`, r.x + r.w - 8, r.y + r.h - 8, { size: size * 0.9, c: SOFT, bold: false, align: "right" });
}

export function mountRays(canvas, tr, lang = "en", { near = false } = {}) {
  return anim2d(canvas, { span: RAY_SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const ph = rayPhase(u * RAY_SPAN);
    raysFrame(ctx, { x: 0, y: 22, w: W, h: H - 22 }, { near, ...ph, tr, lang, size: W < 480 ? 11.5 : 13 });
    stamp2d(ctx, W, near ? perspFill(tr("an-ry-st-n", "true perspective; fitted Sun {{nearD}} km away, {{nearH}} km up; disc drawn 4× larger"), lang) : tr("an-ry-st", "true perspective; clouds 2 km up, Sun 15° high; disc drawn 4× larger"), true);
  } });
}

/* ---- 4. le zoom : il rend ce que la perspective rapetisse, pas ce que cache l'horizon --------------------------------- */
/** Hauteur angulaire (degrés) d'un point à y (km) au-dessus de la mer, à la distance d, pour un œil à h : plat ou globe. */
export function elevAt(y, d, h, globe, R = R_EARTH) { return Math.atan((y - h - (globe ? (d * d) / (2 * R) : 0)) / d) / DEG; }
const BOAT_POLY = [[-15, 0], [15, 0], [19, 6], [-19, 6]], BOAT_CAB = [[-6, 6], [8, 6], [8, 12], [-6, 12]], BOAT_MAST = [[0, 12], [0, 20]];

/** La vue d'une jumelle de champ fixe (degrés vertical vh), centrée sur la hauteur ac, dans r : mer, horizon, bateau. */
function boatView(ctx, r, d, globe, vh, ac) {
  const h = BOAT.eye, ppd = r.h / vh, Y = (a) => r.y + r.h / 2 - (a - ac) * ppd, X = (m) => r.x + r.w / 2 + ((m / 1000 / d) / DEG) * ppd;
  const hz = globe ? -Math.sqrt((2 * h) / R_EARTH) / DEG : 0, hy = Y(hz);
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  ctx.fillStyle = "#e6eef8"; ctx.fillRect(r.x, r.y, r.w, r.h);
  const sea = () => { ctx.fillStyle = "#4b7aa6"; ctx.fillRect(r.x, hy, r.w, r.y + r.h - hy); };
  const d0 = horizonDist(h), behind = globe && d > d0;
  if (!behind) sea();
  const shape = (P, fill) => { ctx.beginPath(); P.forEach(([x, y], i) => { const p = [X(x), Y(elevAt(y / 1000, d, h, globe))]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  shape(BOAT_POLY, "#7f1d1d"); shape(BOAT_CAB, "#f8fafc");
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, ((0.0004 / d) / DEG) * ppd); ctx.beginPath(); ctx.moveTo(X(0), Y(elevAt(0.012, d, h, globe))); ctx.lineTo(X(0), Y(elevAt(0.02, d, h, globe))); ctx.stroke();
  if (behind) sea();
  ctx.strokeStyle = "rgba(21,26,33,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x, hy); ctx.lineTo(r.x + r.w, hy); ctx.stroke();
  ctx.restore();
}

export function mountZoom(canvas, tr, lang = "en") {
  const span = 16, T = 13, nf = nfmt(lang);
  return anim2d(canvas, { span, u0: 0.6, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const p = clamp((u * span) / T), d = 1 + p * 29, N = d, P = split(W, H, 22, 4, 0.5);
    for (const [i, globe] of [[0, false], [1, true]]) {
      const b = R(P[i], 4), eyeR = { x: b.x, y: b.y + 22, w: b.w, h: b.h * 0.3 }, zR = { x: b.x, y: eyeR.y + eyeR.h + 22, w: b.w, h: b.y + b.h - eyeR.y - eyeR.h - 44 };
      text(ctx, globe ? tr("an-zm-globe", "On a globe of radius 6,371 km") : tr("an-zm-flat", "On a flat sea"), b.x + 4, b.y + 14, { size: 13, bold: true, c: globe ? GLOBE : FLAT, maxW: b.w - 8 });
      boatView(ctx, eyeR, d, globe, 40 * eyeR.h / eyeR.w, 0);
      text(ctx, tr("an-zm-eye", "naked eye (40° wide)"), eyeR.x + 4, eyeR.y + eyeR.h + 14, { size: 11.5, c: SOFT });
      const vh = 3.4 / N, hz = globe ? -Math.sqrt((2 * BOAT.eye) / R_EARTH) / DEG : 0, ac = Math.max(elevAt(0.01, d, BOAT.eye, globe), hz + 0.15 * vh);
      boatView(ctx, zR, d, globe, vh, ac);
      ctx.strokeStyle = globe ? GLOBE : FLAT; ctx.lineWidth = 1.5; ctx.strokeRect(zR.x, zR.y, zR.w, zR.h);
      const hid = globe ? hiddenHeight(d, BOAT.eye) * 1000 : 0, hidK = globe ? hiddenHeight(d, BOAT.eye, K_REFR) * 1000 : 0;
      tag(ctx, `${tr("an-cu-zoom", "zoom")} ×${nf(N, 0)} · d = ${nf(d, 1)} km`, zR.x + 6, zR.y + 18, { size: 12, c: INK });
      const hs = globe ? `${tr("an-zm-hid", "hidden")}: ${nf(Math.min(hid, 20), 1)} m (k = ${nf(K_REFR, 2)}: ${nf(Math.min(hidK, 20), 1)} m)` : `${tr("an-zm-hid", "hidden")}: 0 m`;
      text(ctx, hs, zR.x + 4, zR.y + zR.h + 15, { size: 11.5, c: globe ? GLOBE : FLAT, bold: true, maxW: zR.w - 8 });
    }
    stamp2d(ctx, W, tr("an-zm-st", "true angles; a 20 m boat, eye 2 m above the sea; drawn without refraction"), false);
  } });
}

/* ---- 5. sous la hauteur de l'œil : un observateur qui monte de 0 à 2 km ---------------------------------------------- */
export const DIP_SPAN = 15;
/** La hauteur de l'œil (km) à l'instant t : monte de 0 à 2 km en 9 s, puis reste. */
export const dipHeight = (t) => 2 * ease(t / 9);
/** Le coin de ciel vers l'ouest, angles vrais (−2,2° à +1,3°) : la hauteur de l'œil (le niveau), l'horizon, les astres. */
export function dipView(ctx, r, h, globe, tr, lang, size = 12) {
  const nf = nfmt(lang), lo = -2.2, hi = 1.3, ppd = r.h / (hi - lo), Y = (a) => r.y + (hi - a) * ppd, X = (az) => r.x + r.w / 2 + az * ppd;
  const hz = globe ? -dipAngle(h) : -flatDip(h), hy = Y(hz);
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  const g = ctx.createLinearGradient(0, r.y, 0, hy); g.addColorStop(0, "#1e3a5f"); g.addColorStop(1, "#f4a261");
  ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, hy - r.y);
  if (globe) {
    for (const [a, az] of DIP_SKY.stars) disc(ctx, X(az), Y(a), 2.6, "#fffbe6");
    const [a, az] = DIP_SKY.sun; disc(ctx, X(az), Y(a), (SUN_DIAM_DEG / 2) * ppd, "#fde68a", "#f59e0b", 1);
  }
  ctx.fillStyle = globe ? "#3f4a3c" : "#5b5a3c"; ctx.fillRect(r.x, hy, r.w, r.y + r.h - hy);   // la mer ou la plaine, devant les astres
  ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x, hy); ctx.lineTo(r.x + r.w, hy); ctx.stroke();
  // la hauteur de l'œil : un niveau à bulle
  ctx.strokeStyle = "#facc15"; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(r.x, Y(0)); ctx.lineTo(r.x + r.w, Y(0)); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  text(ctx, tr("an-dp-level", "eye level (spirit level)"), r.x + 6, Y(0) - 5, { size: size * 0.9, c: "#facc15", bold: true });
  text(ctx, `${tr("an-dp-hz", "horizon")} ${nf(-hz, globe ? 2 : 3)}° ${tr("an-dp-below", "below")}`, r.x + 6, hy + 15, { size: size * 0.9, c: "#f8fafc", bold: true });
  if (!globe) text(ctx, tr("an-dp-flatsky", "Sun, Moon and stars: all at least 14° above eye level"), r.x + r.w / 2, r.y + 16, { size: size * 0.9, c: "#f8fafc", bold: true, align: "center", maxW: r.w - 12 });
  else if (hz < -0.3) text(ctx, tr("an-dp-band", "below eye level, above the horizon"), r.x + r.w - 6, Y(-0.22), { size: size * 0.85, c: "#fde68a", align: "right", bold: true, maxW: r.w * 0.5 });
}
/** La coupe (schéma) : l'observateur sur sa montagne, son niveau et la visée de l'horizon. */
function dipSide(ctx, r, h, globe, tr, lang, size = 12) {
  const nf = nfmt(lang);
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  ctx.fillStyle = PAPER; ctx.fillRect(r.x, r.y, r.w, r.h);
  const gy = r.y + r.h - 14, mx = r.x + r.w * 0.2, mh = (r.h - 40) * (h / 2);   // la montagne : sa hauteur à l'échelle de la case (schéma)
  if (globe) {
    const R = r.w * 1.6, cx = mx, cy = gy + R;
    ctx.fillStyle = "#dbe6f7"; ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5); ctx.stroke();
    const ey = gy - mh, d = Math.acos(R / (R + mh)), tx = cx + R * Math.sin(d), ty = cy - R * Math.cos(d);
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, gy); ctx.lineTo(mx, ey); ctx.stroke();
    if (mh > 2) { ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx, ey); ctx.lineTo(tx + (tx - mx) * 1.5, ty + (ty - ey) * 1.5); ctx.stroke(); }
    ctx.strokeStyle = "#ca8a04"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(mx, ey); ctx.lineTo(r.x + r.w - 4, ey); ctx.stroke(); ctx.setLineDash([]);
    disc(ctx, mx, ey, 3.5, GLOBE);
  } else {
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(r.x + 4, gy); ctx.lineTo(r.x + r.w - 4, gy); ctx.stroke();
    const ey = gy - mh; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, gy); ctx.lineTo(mx, ey); ctx.stroke();
    ctx.strokeStyle = "#ca8a04"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx, ey); ctx.lineTo(r.x + r.w - 4, ey); ctx.stroke(); ctx.setLineDash([]);
    arrow(ctx, r.x + r.w - 12, r.y + 26, r.x + r.w - 12, r.y + 4, "#d97706", 1.4, 6);
    text(ctx, tr("an-dp-sunup", "the Sun, thousands of km up"), r.x + r.w - 22, r.y + 14, { size: size * 0.85, c: "#92400e", align: "right" });
    disc(ctx, mx, ey, 3.5, FLAT);
  }
  ctx.restore();
  text(ctx, `${tr("an-dp-eye", "eye")} ${nf(h * 1000, 0)} m`, mx + 8, gy - mh + 18, { size, bold: true, c: globe ? GLOBE : FLAT });
}
export function mountDip(canvas, tr, lang = "en") {
  return anim2d(canvas, { span: DIP_SPAN, u0: 0.7, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const h = dipHeight(u * DIP_SPAN), P = split(W, H, 22, 4, 0.5), size = W < 480 ? 11.5 : 12.5;
    for (const [i, globe] of [[0, false], [1, true]]) {
      const b = R(P[i], 4), top = { x: b.x, y: b.y + 20, w: b.w, h: b.h * 0.34 - 20 }, bot = { x: b.x, y: b.y + b.h * 0.36, w: b.w, h: b.h * 0.64 };
      text(ctx, globe ? tr("an-dp-globe", "On a globe, looking west after sunset") : tr("an-dp-flat", "On a plane, looking west"), b.x + 4, b.y + 14, { size: 13, bold: true, c: globe ? GLOBE : FLAT, maxW: b.w - 8 });
      dipSide(ctx, top, h, globe, tr, lang, size);
      dipView(ctx, bot, h, globe, tr, lang, size);
    }
    stamp2d(ctx, W, tr("an-dp-st", "views at true angles, without refraction; side views not to scale"), true);
  } });
}

/* ---- 6. le point de convergence bouge : un Soleil qui s'éloigne, un Soleil qui se couche (propriétaire, 2026-11-21) ------ */
// On regarde à l'est, dos au Soleil. Chaque rayon anticrépusculaire est un arc de grand cercle par le Soleil et le point
// antisolaire (formule n̂ = ŝ × ĝ) : à l'image, une droite qui va vers le point antisolaire, à −α (α = hauteur du Soleil).
// Plan : le Soleil (5 000 km de haut) part de 25° et s'éloigne jusqu'à 20 000 km : α ne descend pas sous 14°, le point de
// convergence reste à 14° au moins SOUS l'horizon. Globe : le Soleil part de 25° et se couche (−8°) : le point monte jusqu'à
// l'horizon au coucher, puis au-dessus, dans l'ombre de la Terre, sous la ceinture de Vénus.
export const ANTI_SPAN = 16;
export function antiState(t) {
  const p = clamp(t / 12), d0 = FLAT_SUN_H / Math.tan(25 * DEG), d = d0 + p * (FLAT_D_MAX - d0);
  return { p, d, aFlat: flatElevation(d), aGlobe: 25 - 33 * p };
}
/** Le ciel de l'est vu de l'œil (perspective vraie, objectif horizontal décentré), le Soleil à la hauteur alpha derrière soi. */
export function antiView(ctx, r, alpha, globe, tr, lang, size = 12, title = "") {
  const nf = nfmt(lang), f = r.w / 2 / Math.tan(45 * DEG), cx = r.x + r.w / 2, cy = r.y + r.h * 0.6;
  const proj = (v) => (v[0] < -1e-9 ? [cx + (f * v[2]) / -v[0], cy - (f * v[1]) / -v[0]] : null);   // regard vers −x ; +z à droite
  const s = [Math.cos(alpha * DEG), Math.sin(alpha * DEG), 0], A = s.map((x) => -x), ay = cy + f * Math.tan(alpha * DEG);
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  // le ciel ; sur le globe après le coucher : l'ombre de la Terre (gris bleu) jusqu'à environ la dépression du Soleil, et la ceinture de Vénus (rose) au-dessus
  const dep = -alpha, sky = ctx.createLinearGradient(0, r.y, 0, cy);
  sky.addColorStop(0, dep > 0 ? "#3b4f7a" : "#7fa6d6"); sky.addColorStop(1, dep > 0 ? "#9db0cf" : "#cfe0f2");
  ctx.fillStyle = sky; ctx.fillRect(r.x, r.y, r.w, cy - r.y);
  if (globe && dep > -1) {
    const k = clamp((dep + 1) / 2), top = cy - f * Math.tan(Math.max(0, dep) * DEG), belt = top - f * Math.tan(5 * DEG);
    ctx.globalAlpha = k;
    ctx.fillStyle = "rgba(236,140,170,.75)"; ctx.fillRect(r.x, belt, r.w, top - belt);
    ctx.fillStyle = "#53607e"; ctx.fillRect(r.x, top, r.w, cy - top);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "#6b6a4a"; ctx.fillRect(r.x, cy, r.w, r.y + r.h - cy);
  // les rayons : chaque arc par ŝ et une trouée ĝ (au-dessus, vers l'est) ; dessiné du haut du cadre jusqu'au point antisolaire, coupé à l'horizon
  const ap = [cx, ay];
  for (const az of [-48, -30, -14, 0, 14, 30, 48]) {
    const e = 38 * DEG, g = [-Math.cos(e) * Math.cos(az * DEG), Math.sin(e), Math.cos(e) * Math.sin(az * DEG)];
    const p = proj(g); if (!p) continue;
    const w = 7 + Math.abs(az) * 0.05, dx = ap[0] - p[0], dy = ap[1] - p[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const t0 = (r.y - p[1]) / dy, top = [p[0] + dx * t0, p[1] + dy * t0];   // prolongé jusqu'au haut du cadre
    const endY = Math.min(ay, cy), t1 = (endY - p[1]) / dy, end = [p[0] + dx * t1, p[1] + dy * t1], wE = w * Math.max(0.05, (ay - endY) / (ay - r.y));
    ctx.fillStyle = dep > 0 && globe ? "rgba(255,214,170,.42)" : "rgba(255,250,225,.45)";
    ctx.beginPath(); ctx.moveTo(top[0] - nx * w, top[1] - ny * w); ctx.lineTo(top[0] + nx * w, top[1] + ny * w); ctx.lineTo(end[0] + nx * wE, end[1] + ny * wE); ctx.lineTo(end[0] - nx * wE, end[1] - ny * wE); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(124,45,18,.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(end[0], end[1]); ctx.lineTo(ap[0], ap[1]); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x, cy); ctx.lineTo(r.x + r.w, cy); ctx.stroke();
  // le point de convergence (antisolaire)
  const k = 7; ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 2;
  const yA = Math.min(ay, r.y + r.h - 10);
  ctx.beginPath(); ctx.moveTo(cx - k, yA - k); ctx.lineTo(cx + k, yA + k); ctx.moveTo(cx + k, yA - k); ctx.lineTo(cx - k, yA + k); ctx.stroke();
  if (ay > r.y + r.h - 10) arrow(ctx, cx, r.y + r.h - 30, cx, r.y + r.h - 4, "#7c2d12", 1.6, 6);
  ctx.restore();
  tag(ctx, `${title}${tr("an-an-sun", "Sun behind you")} ${nf(alpha, 1)}° · ${tr("an-an-conv", "convergence")} ${nf(-alpha, 1)}°`, r.x + 6, r.y + 16, { size, c: globe ? GLOBE : FLAT, maxW: r.w - 12 });
  if (globe && dep > 1) tag(ctx, tr("an-an-belt", "Earth's shadow, Belt of Venus above"), r.x + r.w - 6, cy - f * Math.tan(Math.max(0, dep) * DEG) - f * Math.tan(5 * DEG) - 4, { size: size * 0.85, c: "#7c2d12", align: "right", maxW: r.w * 0.6 });
  if (!globe && alpha < 15) tag(ctx, tr("an-an-floor", "it cannot rise above −14°"), r.x + r.w - 6, r.y + r.h - 8, { size: size * 0.85, c: FLAT, align: "right" });
  return { ay, cy };
}
export function mountAnti(canvas, tr, lang = "en") {
  return anim2d(canvas, { span: ANTI_SPAN, u0: 0.8, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const st = antiState(u * ANTI_SPAN), P = split(W, H, 22, 4, 0.5), size = W < 480 ? 11.5 : 12.5;
    for (const [i, globe] of [[0, false], [1, true]]) {
      const b = R(P[i], 4);
      text(ctx, globe ? tr("an-an-globe", "Globe: the Sun sets behind you") : tr("an-an-flat", "Plane: the Sun recedes behind you"), b.x + 4, b.y + 14, { size: 13, bold: true, c: globe ? GLOBE : FLAT, maxW: b.w - 8 });
      antiView(ctx, { x: b.x, y: b.y + 22, w: b.w, h: b.h - 22 }, globe ? st.aGlobe : st.aFlat, globe, tr, lang, size);
    }
    stamp2d(ctx, W, tr("an-an-st", "looking east, true perspective, 90° wide; shadow and belt schematic; no refraction"), true);
  } });
}
