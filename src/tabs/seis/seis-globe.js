// L'onde sismique sur un GLOBE, à côté de la carte plate (demande du
// propriétaire, 2026-09-24 : « une onde sismique sur un globe en plus de sur
// la terre plate, pour bien faire comprendre l'animation »).
//
// MÊME INSTANT, MÊMES DONNÉES que la carte plate de seis-legacy.js : même
// séisme réel, même vitesse (SEIS_V20 = 3,5 km/s), mêmes stations réelles qui
// s'allument à leur temps de trajet ENREGISTRÉ (bulletin ISC), jamais à un
// temps calculé. Le front, lui, reste de la géométrie calculée, comme sur la
// carte : sur la sphère c'est un petit cercle à distance angulaire constante
// de l'épicentre, qui grandit jusqu'à 90° puis se referme sur l'antipode.
// C'est tout l'argument visuel : sur le globe le front est un CERCLE, et les
// stations s'allument sur son passage ; sur la carte plate le même front
// réel devient une courbe tordue, et le cercle du modèle plat les manque.
//
// Canvas 2D, projection ORTHOGRAPHIQUE (une vue de la vraie sphère, rien
// n'est étiré -- règle 1). Pas de WebGL : la machine du propriétaire n'a pas
// de WebGL2. La caméra accompagne l'onde de l'épicentre vers l'antipode ; on
// peut faire tourner le globe à la souris / au doigt.
import { setupCanvas } from "../../core/canvas.js";
import { coastLines } from "../../core/globe25d.js";

const R = Math.PI / 180;
const V = (lat, lon) => [Math.cos(lat * R) * Math.cos(lon * R), Math.cos(lat * R) * Math.sin(lon * R), Math.sin(lat * R)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const L = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / L, a[1] / L, a[2] / L]; };

/** Point à la distance angulaire d (°) de (lat, lon) le long de l'azimut az (°). */
function direct(lat, lon, az, d) {
  const p1 = lat * R, l1 = lon * R, t = az * R, s = d * R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(s) + Math.cos(p1) * Math.sin(s) * Math.cos(t));
  const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(s) * Math.cos(p1), Math.cos(s) - Math.sin(p1) * Math.sin(p2));
  return [p2 / R, l2 / R];
}
function azimuth(lat1, lon1, lat2, lon2) {
  const p1 = lat1 * R, p2 = lat2 * R, dl = (lon2 - lon1) * R;
  return Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / R;
}

// epic18 : le décodeur commun (core/globe25d.js), identique à la copie qui vivait ici
const coasts = coastLines;

// rotation à la main (ajoutée à la vue automatique)
const drag = { dLat: 0, dLon: 0, on: false, x: 0, y: 0, wired: null };
export function wireSeisGlobe(canvas) {
  if (!canvas || drag.wired === canvas) return;
  drag.wired = canvas;
  canvas.style.touchAction = "none";
  canvas.style.cursor = "grab";
  canvas.addEventListener("pointerdown", (e) => { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; canvas.setPointerCapture?.(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag.on) return;
    drag.dLon -= (e.clientX - drag.x) * 0.4; drag.dLat += (e.clientY - drag.y) * 0.4;
    drag.dLat = Math.max(-80, Math.min(80, drag.dLat));
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const up = () => { drag.on = false; canvas.style.cursor = "grab"; };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("dblclick", () => { drag.dLat = drag.dLon = 0; });
}

const meanAz = new Map();
/** Direction « moyenne » des stations vue de l'épicentre : la caméra voyage le long de celle-ci. */
function stationBearing(ev, rows) {
  if (meanAz.has(ev.key)) return meanAz.get(ev.key);
  let x = 0, y = 0;
  for (const [, la, lo] of rows) { const a = azimuth(ev.lat, ev.lon, la, lo) * R; x += Math.cos(a); y += Math.sin(a); }
  const az = Math.atan2(y, x) / R;
  meanAz.set(ev.key, az);
  return az;
}

/**
 * @param {HTMLCanvasElement} cv
 * @param {{ev:{key,lat,lon,name}, rows:Array, t:number, v:number, kmPerDeg:number, tr:(k:string)=>string}} s
 */
export function drawSeisGlobe(cv, { ev, rows, t, v, kmPerDeg, tr }) {
  if (!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const D = Math.min(180, (t * v) / kmPerDeg);          // distance angulaire du front
  // vue : part à 30° de l'épicentre, finit à 30° de l'antipode, le long des stations
  const az0 = stationBearing(ev, rows);
  let [cLat, cLon] = direct(ev.lat, ev.lon, az0, 30 + (D * 120) / 180);
  cLat = Math.max(-89, Math.min(89, cLat + drag.dLat)); cLon += drag.dLon;
  const f = V(cLat, cLon);
  let right = cross([0, 0, 1], f); if (Math.hypot(...right) < 1e-6) right = [0, 1, 0];
  right = unit(right);
  const up = cross(f, right);
  const r = Math.min(W, H) * 0.42, cx = W / 2, cy = H / 2 + 6;
  const P = (lat, lon) => { const p = V(lat, lon); return [cx + dot(p, right) * r, cy - dot(p, up) * r, dot(p, f)]; };

  // la sphère : dégradé d'éclairage (lumière en haut à gauche), liseré d'atmosphère
  const atm = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.08);
  atm.addColorStop(0, "rgba(106,169,216,0.45)"); atm.addColorStop(1, "rgba(106,169,216,0)");
  ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, r * 1.08, 0, 2 * Math.PI); ctx.fill();
  const sea = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
  sea.addColorStop(0, "#eef7f5"); sea.addColorStop(0.7, "#cfe6e2"); sea.addColorStop(1, "#a9ccc7");
  ctx.fillStyle = sea; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();

  // tracé d'une polyligne lat/lon : face avant seulement
  const path = (pts, style, width, alpha = 1, back = false) => {
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.globalAlpha = alpha;
    ctx.beginPath(); let pen = false;
    for (const q of pts) {
      if (!q) { pen = false; continue; }
      const [x, y, z] = P(q[0], q[1]);
      if ((z > 0) !== !back) { pen = false; continue; }
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
    }
    ctx.stroke(); ctx.globalAlpha = 1;
  };
  // graticule 30°
  for (let la = -60; la <= 60; la += 30) { const g = []; for (let lo = -180; lo <= 180; lo += 4) g.push([la, lo]); path(g, "#0f766e", la === 0 ? 1 : 0.6, la === 0 ? 0.35 : 0.18); }
  for (let lo = -180; lo < 180; lo += 30) { const g = []; for (let la = -90; la <= 90; la += 4) g.push([la, lo]); path(g, "#0f766e", 0.6, 0.18); }
  for (const c of coasts()) path(c, "#0f766e", 0.9, 0.7);

  // antipode
  const [aLat, aLon] = [-ev.lat, ev.lon + 180];
  const A = P(aLat, aLon);
  if (A[2] > 0) {
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(A[0] - 4, A[1] - 4); ctx.lineTo(A[0] + 4, A[1] + 4); ctx.moveTo(A[0] + 4, A[1] - 4); ctx.lineTo(A[0] - 4, A[1] + 4); ctx.stroke();
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText(tr("sq-glb-antipode"), A[0] + 7, A[1] + 3);
  }

  // le front : un petit cercle, avec deux ondes de sillage ; derrière = pointillé discret
  if (D > 0.3) {
    const ring = (d) => { const pts = []; for (let a = 0; a <= 360; a += 2) pts.push(direct(ev.lat, ev.lon, a, d)); return pts; };
    ctx.setLineDash([4, 4]); path(ring(D), "#0f766e", 1.2, 0.3, true); ctx.setLineDash([]);
    for (const [dd, al] of [[6, 0.12], [3, 0.22]]) if (D - dd > 0.3 && D < 180) path(ring(D - dd), "#0f766e", 1.6, al);
    const pts = ring(D);
    path(pts, "rgba(15,118,110,0.25)", 7);
    path(pts, "#0f766e", 2.4);
  }

  // stations réelles : allumées à leur temps ENREGISTRÉ, éclair au passage
  for (const [, la, lo, , tt] of rows) {
    const [x, y, z] = P(la, lo);
    if (z <= 0) continue;
    const on = tt <= t;
    if (on && t - tt < 500) {
      const u = (t - tt) / 500;
      ctx.strokeStyle = `rgba(15,118,110,${(0.7 * (1 - u)).toFixed(3)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 4 + 10 * u, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.fillStyle = on ? "#0f766e" : "#fff"; ctx.strokeStyle = on ? "#0f766e" : "#8b93a0"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, on ? 3.6 : 2.8, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  }

  // épicentre
  const E = P(ev.lat, ev.lon);
  if (E[2] > 0) {
    ctx.fillStyle = "#151a21"; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * R, rr = i % 2 ? 3.5 : 8; const px = E[0] + rr * Math.cos(a), py = E[1] + rr * Math.sin(a); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fill();
  }
  // limbe
  ctx.strokeStyle = "rgba(15,118,110,0.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();

  ctx.textAlign = "left"; ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#151a21";
  ctx.fillText(tr("sq-glb-title"), 8, 16);
  ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#5b6470";
  ctx.fillText(tr("sq-glb-front").replace("{d}", D.toFixed(0)), 8, 30);
  ctx.fillText(tr("sq-glb-stamp"), 8, H - 8);
}
