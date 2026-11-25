// Rømer en images (2026-11-25, demande de Xyphophor : « je mettrais une animation style vitrine qui fera office de carte » et
// « j'aime moyen le rendu de l'animation actuelle de Rømer avec Jupiter ») : les dessins communs à l'animation de la
// section (canvas sunRomer) et à la vitrine (sunRomerReel, cadre core/reel.js). Tout est dessiné en fonction pure de
// l'état (jour, phase), dans une boîte {x, y, w, h} en px CSS.
//
// Échelles (règle 1) : la vue du système solaire est à l'échelle en UA (orbites circulaires et coplanaires, comme le
// modèle de la section) ; la vue de Jupiter est à l'échelle de Jupiter (orbite d'Io à 5,9 rayons, d'Europe à 9,4, ombre
// large d'un diamètre), Io et Europe grossies, et Io RALENTIE dans l'animation de la section (sinon elle ferait quinze
// tours par seconde) : chaque dessin le dit.
import { label, REEL_COL, ease, clamp } from "../../core/reel.js";
import { ROMER as ORB, romerLightMin } from "./logic.js";

export const COL = { ...REEL_COL, earth: "#1d4ed8", jup: "#c2410c", sun: "#f59e0b", light: "#d97706", io: "#ca8a04", eur: "#64748b", shadow: "#1f2937", curve: "#0f766e" };
export const IO_P = 1.769138, EUR_P = 3.551181; // jours (périodes sidérales, Lieske 1980)
const TAU = Math.PI * 2;

/** Angles héliocentriques de la Terre et de Jupiter au jour t (rad), orbites circulaires ; t = 0 : opposition. */
export function anglesAt(day) { return { e: (TAU * day) / ORB.TE, j: (TAU * day) / ORB.TJ }; }

function ball(ctx, x, y, r, c0, c1) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

function sunDisc(ctx, x, y, r) {
  const halo = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 3.2);
  halo.addColorStop(0, "rgba(251,191,36,0.55)"); halo.addColorStop(1, "rgba(251,191,36,0)");
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
  ball(ctx, x, y, r, "#fff7cc", "#f59e0b");
}

/** Jupiter vue de dessus, son ombre, Io (et Europe si o.europa) ; ioAng, eurAng en rad (0 = vers le Soleil + π…),
 *  sunAng = direction du Soleil vue de Jupiter (rad, écran, y vers le haut). Renvoie { inShadow }. */
export function drawJovian(ctx, b, ioAng, sunAng, o = {}) {
  const outer = o.europa ? 10.2 : 6.7, R = Math.min(b.w, b.h) / 2 / outer, cx = b.x + b.w / 2, cy = b.y + b.h / 2, fs = o.fs || 12;
  const ux = Math.cos(sunAng), uy = -Math.sin(sunAng);        // vers le Soleil, écran
  const reach = Math.hypot(b.w, b.h);
  // l'ombre : un cylindre de la largeur de Jupiter, à l'opposé du Soleil
  ctx.save();
  ctx.beginPath(); if (o.round) ctx.arc(cx, cy, Math.min(b.w, b.h) / 2, 0, TAU); else ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  const px = -uy, py = ux;
  const sg = ctx.createLinearGradient(cx, cy, cx - ux * reach * 0.5, cy - uy * reach * 0.5);
  sg.addColorStop(0, "rgba(31,41,55,0.55)"); sg.addColorStop(1, "rgba(31,41,55,0.12)");
  ctx.fillStyle = sg; ctx.beginPath();
  ctx.moveTo(cx + px * R, cy + py * R); ctx.lineTo(cx + px * R - ux * reach, cy + py * R - uy * reach);
  ctx.lineTo(cx - px * R - ux * reach, cy - py * R - uy * reach); ctx.lineTo(cx - px * R, cy - py * R); ctx.closePath(); ctx.fill();
  // la lumière du Soleil : quelques traits parallèles venant de son côté
  ctx.strokeStyle = "rgba(245,158,11,0.35)"; ctx.lineWidth = 1;
  for (let k = -3; k <= 3; k++) {
    const ox = cx + px * R * 2.2 * k + ux * R * 1.6, oy = cy + py * R * 2.2 * k + uy * R * 1.6;
    ctx.beginPath(); ctx.moveTo(ox + ux * reach, oy + uy * reach); ctx.lineTo(ox + ux * R * 0.6, oy + uy * R * 0.6); ctx.stroke();
  }
  // orbites
  ctx.strokeStyle = "rgba(91,100,112,0.45)"; ctx.setLineDash([3, 4]);
  for (const a of o.europa ? [5.9, 9.4] : [5.9]) { ctx.beginPath(); ctx.arc(cx, cy, a * R, 0, TAU); ctx.stroke(); }
  ctx.setLineDash([]);
  // Jupiter et ses bandes, éclairée du côté du Soleil
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  ctx.fillStyle = "#e9c99a"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  for (const [y0, h, c] of [[-0.55, 0.18, "#c98b56"], [-0.15, 0.12, "#b7743e"], [0.2, 0.16, "#c98b56"], [0.55, 0.1, "#d8a876"]]) { ctx.fillStyle = c; ctx.fillRect(cx - R, cy + y0 * R, 2 * R, h * R); }
  const night = ctx.createLinearGradient(cx + ux * R, cy + uy * R, cx - ux * R, cy - uy * R);
  night.addColorStop(0.45, "rgba(15,23,42,0)"); night.addColorStop(1, "rgba(15,23,42,0.6)");
  ctx.fillStyle = night; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  ctx.restore();
  // Io : dans l'ombre si sa direction est à moins du demi-arc de l'anti-Soleil
  const rel = Math.atan2(Math.sin(ioAng - (sunAng + Math.PI)), Math.cos(ioAng - (sunAng + Math.PI)));
  const half = Math.asin(1 / 5.9), inShadow = Math.abs(rel) < half;
  const ix = cx + 5.9 * R * Math.cos(ioAng), iy = cy - 5.9 * R * Math.sin(ioAng), ir = Math.max(3, R * 0.32);
  if (inShadow) {
    ctx.fillStyle = "#374151"; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(202,138,4,0.8)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ix, iy, ir + 3, 0, TAU); ctx.stroke();
  } else ball(ctx, ix, iy, ir, "#fef3c7", COL.io);
  if (o.europa) {
    const ex = cx + 9.4 * R * Math.cos(o.eurAng), ey = cy - 9.4 * R * Math.sin(o.eurAng);
    ball(ctx, ex, ey, Math.max(3, R * 0.28), "#f1f5f9", COL.eur);
    if (o.labels) label(ctx, o.labels.europa, ex, ey + R * 0.6 + fs * 0.7, { size: fs * 0.8, col: COL.eur, weight: 700 });
    if (o.conj) { // la ligne des conjonctions Io-Europe, qui tourne
      ctx.strokeStyle = "rgba(190,18,60,0.7)"; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 10 * R * Math.cos(o.conj), cy - 10 * R * Math.sin(o.conj)); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  if (o.labels) {
    label(ctx, o.labels.io, ix, iy - ir - fs * 0.7, { size: fs * 0.85, col: inShadow ? COL.shadow : "#92400e", weight: 700 });
    label(ctx, o.labels.sun, cx + ux * R * 2.6 + px * R * 2.6, cy + uy * R * 2.6 + py * R * 2.6, { size: fs * 0.75, col: "#b45309" });
    label(ctx, o.labels.shadow, cx - ux * R * 3.3 - px * R * 1.9, cy - uy * R * 3.3 - py * R * 1.9, { size: fs * 0.75, col: COL.shadow });
  }
  ctx.restore();
  return { inShadow, R, cx, cy };
}

/** Le système solaire vu de dessus, à l'échelle en UA, au jour `day` (0 = opposition) ; faisceau Jupiter → Terre et
 *  son temps de lumière ; o.inset = zoom sur Jupiter (drawJovian) dans un médaillon. */
export function drawSystem(ctx, b, day, o = {}) {
  const fs = o.fs || 12, { e, j } = anglesAt(day);
  const s = (Math.min(b.w, b.h) / 2 - fs * 1.6) / ORB.aJ, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const P = (r, a) => [cx + r * s * Math.cos(a), cy - r * s * Math.sin(a)];
  const E = P(1, e), J = P(ORB.aJ, j);
  ctx.strokeStyle = "rgba(29,78,216,0.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, s, 0, TAU); ctx.stroke();
  ctx.strokeStyle = "rgba(194,65,12,0.25)"; ctx.beginPath(); ctx.arc(cx, cy, ORB.aJ * s, 0, TAU); ctx.stroke();
  // traînées
  const trail = (r, a, span, col, w) => { for (let k = 0; k < 20; k++) { ctx.strokeStyle = col; ctx.globalAlpha = 0.04 + 0.45 * (k / 20); ctx.lineWidth = w; const a0 = a - span * (1 - k / 20), a1 = a - span * (1 - (k + 1) / 20); ctx.beginPath(); ctx.arc(cx, cy, r * s, -a0, -a1, true); ctx.stroke(); } ctx.globalAlpha = 1; };
  trail(1, e, Math.PI / 3, COL.earth, 2.4); trail(ORB.aJ, j, Math.PI / 14, COL.jup, 2.4);
  sunDisc(ctx, cx, cy, Math.max(4, fs * 0.5));
  // le faisceau : la lumière qui part de Jupiter, des tirets qui avancent vers la Terre (direction seulement)
  const lt = romerLightMin(day);
  const g = ctx.createLinearGradient(J[0], J[1], E[0], E[1]);
  g.addColorStop(0, "rgba(217,119,6,0.75)"); g.addColorStop(1, "rgba(217,119,6,0.35)");
  ctx.strokeStyle = g; ctx.lineWidth = 2.2; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -((o.dash ?? day * 3) % 13);
  ctx.beginPath(); ctx.moveTo(J[0], J[1]); ctx.lineTo(E[0], E[1]); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  {
    let ang = Math.atan2(E[1] - J[1], E[0] - J[0]); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
    ctx.save(); ctx.translate((E[0] + J[0]) / 2, (E[1] + J[1]) / 2); ctx.rotate(ang);
    label(ctx, `${(o.fmt || ((x) => x.toFixed(1)))(lt)} min`, 0, -fs * 0.75, { size: fs * 0.9, col: "#92400e", weight: 700, font: "ui-monospace, Menlo, monospace" });
    ctx.restore();
  }
  ball(ctx, E[0], E[1], Math.max(4, fs * 0.42), "#bfdbfe", COL.earth);
  ball(ctx, J[0], J[1], Math.max(5, fs * 0.6), "#fed7aa", COL.jup);
  if (o.labels) { // dehors, le long du rayon : loin du Soleil et du faisceau
    label(ctx, o.labels.earth, E[0] + Math.cos(e) * fs * 1.3, E[1] - Math.sin(e) * fs * 1.3, { size: fs * 0.85, col: COL.earth, weight: 700 });
    label(ctx, o.labels.jupiter, J[0] + Math.cos(j) * fs * 1.6, J[1] - Math.sin(j) * fs * 1.6, { size: fs * 0.85, col: COL.jup, weight: 700 });
    if (o.labels.sun) label(ctx, o.labels.sun, cx - fs * 1.4, cy - fs * 1.1, { size: fs * 0.75, col: COL.soft, align: "right" });
  }
  if (o.inset) { // médaillon : Jupiter de près, l'ombre pointant à l'opposé du Soleil
    const r = o.inset.r, ix = o.inset.x, iy = o.inset.y;
    ctx.strokeStyle = "rgba(91,100,112,0.5)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(J[0], J[1]); ctx.lineTo(ix + (J[0] - ix) * r / Math.hypot(J[0] - ix, J[1] - iy), iy + (J[1] - iy) * r / Math.hypot(J[0] - ix, J[1] - iy)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(ix, iy, r, 0, TAU); ctx.fillStyle = "#fbfaf7"; ctx.fill();
    const res = drawJovian(ctx, { x: ix - r, y: iy - r, w: 2 * r, h: 2 * r }, o.inset.io, j + Math.PI, { fs, round: true });
    ctx.strokeStyle = "rgba(91,100,112,0.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ix, iy, r, 0, TAU); ctx.stroke();
    if (o.inset.caption) {
      ctx.font = `600 ${fs * 0.72}px ${"ui-sans-serif, system-ui, sans-serif"}`;
      const w = ctx.measureText(o.inset.caption).width, xc = Math.min(ix, (o.inset.maxX ?? Infinity) - w / 2);
      label(ctx, o.inset.caption, xc, iy + r + fs * 0.75, { size: fs * 0.72, col: COL.soft });
    }
    return { E, J, lt, eclipse: res.inShadow };
  }
  return { E, J, lt };
}

/** Le temps de lumière jour après jour (modèle), une fenêtre de `span` jours finissant à `day` ; un point par éclipse
 *  d'Io déjà vue (une sur `every`), le curseur et sa lecture. */
export function drawDelay(ctx, b, day, o = {}) {
  const fs = o.fs || 12, span = o.span || 2 * ORB.TSYN, every = o.every || 6;
  const x0 = b.x + fs * 2.6, x1 = b.x + b.w - fs * 0.6, y0 = b.y + fs * 0.6, y1 = b.y + b.h - fs * 2.6;
  const m0 = 32, m1 = 54, X = (t) => x0 + (x1 - x0) * (t - (day - span)) / span, Y = (m) => y1 - (y1 - y0) * (m - m0) / (m1 - m0);
  ctx.font = `${Math.round(fs * 0.72)}px ui-monospace, Menlo, monospace`;
  for (const m of [35, 40, 45, 50]) {
    ctx.strokeStyle = "#ebe8e0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(m)); ctx.lineTo(x1, Y(m)); ctx.stroke();
    label(ctx, `${m}`, x0 - fs * 0.35, Y(m), { size: fs * 0.72, col: COL.soft, align: "right", font: "ui-monospace, Menlo, monospace", weight: 500 });
  }
  ctx.strokeStyle = COL.curve; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const t = day - span + (span * i) / 200, p = [X(t), Y(romerLightMin(t))]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
  ctx.stroke();
  // les éclipses vues : une sur `every` (sinon un trait continu), au temps de lumière du moment
  const k0 = Math.ceil((day - span) / (IO_P * every)), k1 = Math.floor(day / (IO_P * every));
  for (let k = k0; k <= k1; k++) { const t = k * IO_P * every; ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(X(t), Y(romerLightMin(t)), Math.max(1.6, fs * 0.15), 0, TAU); ctx.fill(); }
  const now = romerLightMin(day);
  ctx.fillStyle = COL.light; ctx.beginPath(); ctx.arc(X(day), Y(now), Math.max(3.5, fs * 0.33), 0, TAU); ctx.fill();
  if (o.labels) {
    label(ctx, o.labels.axis, x0, y1 + fs * 1.0, { size: fs * 0.75, col: COL.soft, align: "left", weight: 500 });
    label(ctx, typeof o.labels.now === "function" ? o.labels.now(now) : o.labels.now, x1, y1 + fs * 2.0, { size: fs * 0.8, col: "#92400e", align: "right", weight: 700 });
  }
  return { now };
}
