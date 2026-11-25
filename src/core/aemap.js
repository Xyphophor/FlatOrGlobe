// Dessin d'une carte azimutale équidistante de centre quelconque (epic18/UC01).
// Projection : src/core/aeproj.js (degrés, aucun rayon). Terres : masque
// Natural Earth 0,5° (src/data/land.js), rempli par projection INVERSE pixel par
// pixel -- une carte centrée n'importe où retourne les polygones qui contiennent
// l'antipode, un masque n'a pas ce problème. L'image des terres est gardée en
// cache par (carte, taille) : rien à recalculer d'une image d'animation à l'autre.
// Côtes vectorielles (coastLines, core/globe25d.js) par-dessus, coupées aux sauts.
import { LAND } from "../data/land.js";
import { coastLines } from "./globe25d.js";
import { toScreen, fromScreen } from "./aeproj.js";
import { pixelRatio } from "./canvas.js";

let bits = null;
function landBits() {
  if (bits) return bits;
  const s = typeof atob === "function" ? atob(LAND.b64) : Buffer.from(LAND.b64, "base64").toString("binary");
  bits = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bits[i] = s.charCodeAt(i);
  return bits;
}

/** Terre (true) ou mer, d'après le masque 0,5°. Décoratif. */
export function isLand(lat, lon) {
  const b = landBits(), st = LAND.step;
  const r = Math.min(LAND.nlat - 1, Math.max(0, Math.floor((90 - lat) / st)));
  const c = ((Math.floor((lon + 180) / st) % LAND.nlon) + LAND.nlon) % LAND.nlon;
  const k = r * LAND.nlon + c;
  return (b[k >> 3] >> (7 - (k & 7))) & 1 ? true : false;
}

export const AE_COLORS = { sea: "#dcebf2", land: "#e6dfcc", coast: "#8a8170", grid: "rgba(60,80,100,0.18)", rim: "#3d7f99" };

const cache = new Map();
/**
 * Image des terres pour une carte et un disque de Rpx pixels (cache LRU de 8 images) : un canvas carré de
 * n = ⌈2·Rpx·dpr⌉ pixels, le centre de la carte au milieu, nord en haut (mirror : est à gauche).
 * col.sea = "transparent" : seules les terres sont peintes (pour un fond déjà dessiné, la dalle de dist).
 */
export function aeLandImage(map, Rpx, mirror = false, colors = {}) { return landImage(map, Rpx, mirror, { ...AE_COLORS, ...colors }); }
function landImage(map, Rpx, mirror, col) {
  if (typeof document === "undefined") return null;
  const dpr = pixelRatio(), n = Math.max(2, Math.ceil(2 * Rpx * dpr));
  const key = `${map.lat0},${map.lon0},${map.rot},${n},${mirror},${col.land},${col.sea}`;
  if (cache.has(key)) { const v = cache.get(key); cache.delete(key); cache.set(key, v); return v; }
  const off = document.createElement("canvas"); off.width = n; off.height = n;
  const c = off.getContext("2d");
  if (!c || typeof c.createImageData !== "function") return null;
  const img = c.createImageData(n, n), d = img?.data;
  if (!d || d.length < n * n * 4) return null;   // contexte factice (outils hors navigateur) : pas de terres
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const L = hex(col.land), S = col.sea === "transparent" ? null : hex(col.sea), F = fromScreen({ cx: n / 2, cy: n / 2, Rpx: n / 2, mirror });
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const [x, y] = F(i + 0.5, j + 0.5);
    if (x * x + y * y > 180 * 180) continue;
    const ll = map.inv(x, y);
    if (!ll) continue;
    const p = (j * n + i) * 4, rgb = isLand(ll[0], ll[1]) ? L : S;
    if (!rgb) continue;
    d[p] = rgb[0]; d[p + 1] = rgb[1]; d[p + 2] = rgb[2]; d[p + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  cache.set(key, off);
  if (cache.size > 8) cache.delete(cache.keys().next().value);
  return off;
}

/** Trace une suite de [lat, lon] (null = coupure), coupée quand deux points voisins sautent de plus de `jump`° sur la carte. */
function strokeLL(ctx, map, S, pts, jump = 25) {
  ctx.beginPath();
  let prev = null;
  for (const q of pts) {
    if (!q) { prev = null; continue; }
    const p = map.fwd(q[0], q[1]);
    const [px, py] = S(p);
    if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) < jump) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    prev = p;
  }
  ctx.stroke();
}

/** Les côtes seules, sur une carte et un passage à l'écran donnés (pour les cartes qui gardent leur propre fond). */
export function strokeCoasts(ctx, map, S, { color = AE_COLORS.coast, width = 0.8, jump = 25 } = {}) {
  ctx.strokeStyle = color; ctx.lineWidth = width;
  for (const line of coastLines()) strokeLL(ctx, map, S, line, jump);
}

/**
 * La carte : mer, terres, graticule (tous les `grid` degrés, courbes échantillonnées), côtes,
 * bord (l'antipode du centre). Renvoie { S, project(lat, lon) → [px, py], map } pour les surcouches.
 * mirror = true : est à gauche (la convention de seisAE / twiAE).
 */
export function drawAEMap(ctx, map, { cx, cy, Rpx, mirror = false, land = true, coast = true, grid = 30, rim = true, colors = {} } = {}) {
  const col = { ...AE_COLORS, ...colors }, S = toScreen({ cx, cy, Rpx, mirror });
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, Rpx, 0, 2 * Math.PI); ctx.fillStyle = col.sea; ctx.fill();
  ctx.clip();
  const im = land ? landImage(map, Rpx, mirror, col) : null;
  if (im) ctx.drawImage(im, cx - Rpx, cy - Rpx, 2 * Rpx, 2 * Rpx);
  if (grid) {
    ctx.strokeStyle = col.grid; ctx.lineWidth = 0.8;
    for (let la = -90 + grid; la < 90; la += grid) { const pts = []; for (let lo = -180; lo <= 180; lo += 2) pts.push([la, lo]); strokeLL(ctx, map, S, pts); }
    for (let lo = -180; lo < 180; lo += grid) { const pts = []; for (let la = -89; la <= 89; la += 2) pts.push([la, lo]); strokeLL(ctx, map, S, pts); }
  }
  if (coast) { ctx.strokeStyle = col.coast; ctx.lineWidth = 0.8; for (const line of coastLines()) strokeLL(ctx, map, S, line); }
  ctx.restore();
  if (rim) { ctx.beginPath(); ctx.arc(cx, cy, Rpx, 0, 2 * Math.PI); ctx.strokeStyle = col.rim; ctx.lineWidth = 1.2; ctx.stroke(); }
  return { S, map, project: (lat, lon) => S(map.fwd(lat, lon)) };
}
