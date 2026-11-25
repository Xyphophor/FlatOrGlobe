// Rendu 2.5D partagé d'un globe et d'un disque plat, sur canvas 2D, pour les
// scènes « à la main » (camera3d.js, magRot). Créé le 2026-09-24 : le
// propriétaire trouvait les modèles 3D de la Terre faibles, et sa machine n'a
// pas de WebGL2 -- ce sont CES scènes-là qu'il voit, pas celles de Three.js.
//
// Tout ici est DÉCOR : sphère ombrée, liseré d'atmosphère, graticule, côtes
// Natural Earth (src/data/coasts.js, 1:110m). Aucun nombre de la page ne se
// lit sur ce dessin, et rien n'est étiré (règle 1) : la sphère et le disque
// sont tracés à l'échelle uniforme de la projection qu'on leur passe.
//
// REPÈRE : celui de camera3d (main droite, y en haut, z vers l'observateur).
// Un point (φ, λ) du globe est [cos φ cos λ, sin φ, −cos φ sin λ] -- l'est
// en −z au méridien 0 ; sur le disque azimutal, vu d'en haut, l'est tourne
// dans le sens direct. Un globe dessiné avec +sin λ est un globe EN MIROIR.
import { COASTS } from "../data/coasts.js";

const D2R = Math.PI / 180;

/** Point du globe unité pour (lat, lon) en degrés, repère ci-dessus. */
export const globeVec = (lat, lon) => {
  const p = lat * D2R, l = lon * D2R;
  return [Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l)];
};

let coastLL = null;
/** Côtes décodées en listes de [lat, lon] ; null = coupure (antiméridien). */
export function coastLines() {
  if (coastLL) return coastLL;
  coastLL = COASTS.map((line) => {
    const out = [[line[1] / 10, line[0] / 10]];
    let lon = line[0], lat = line[1];
    for (let i = 2; i < line.length; i += 2) {
      lon += line[i]; lat += line[i + 1];
      if (Math.abs(line[i]) >= 1800) out.push(null);
      out.push([lat / 10, lon / 10]);
    }
    return out;
  });
  return coastLL;
}

/** Trace une liste de [lat,lon] projetée par map() → P ; face avant seulement si cull. */
function strokeLL(ctx, P, map, pts, cull) {
  ctx.beginPath();
  let pen = false;
  for (const q of pts) {
    if (!q) { pen = false; continue; }
    const p = P(map(q[0], q[1]));
    if (cull && p[2] < 0.02) { pen = false; continue; }
    pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
    pen = true;
  }
  ctx.stroke();
}

/**
 * Globe unité (rayon `sc` pixels à l'écran, centre P([0,0,0])).
 * opt.ink : couleur du trait (défaut sarcelle du globe) ; opt.coasts,
 * opt.grid : booléens ; opt.radius : rayon monde (défaut 1) ; opt.vec :
 * (lat, lon) → [x,y,z] unité, pour un globe qui TOURNE (défaut globeVec) ;
 * opt.sun : direction monde du Soleil -- assombrit la face de nuit.
 */
export function drawGlobe25(ctx, P, sc, opt = {}) {
  const ink = opt.ink || "#0f766e", R = opt.radius || 1, rr = sc * R;
  const vec = opt.vec || globeVec;
  const c = P([0, 0, 0]);
  // liseré d'atmosphère
  const atm = ctx.createRadialGradient(c[0], c[1], rr * 0.97, c[0], c[1], rr * 1.09);
  atm.addColorStop(0, "rgba(106,169,216,0.42)"); atm.addColorStop(1, "rgba(106,169,216,0)");
  ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(c[0], c[1], rr * 1.09, 0, 2 * Math.PI); ctx.fill();
  // corps, éclairé en haut à gauche
  const sea = ctx.createRadialGradient(c[0] - rr * 0.35, c[1] - rr * 0.4, rr * 0.08, c[0], c[1], rr);
  sea.addColorStop(0, "#f2f9f7"); sea.addColorStop(0.65, "#d3e9e5"); sea.addColorStop(1, "#a7cac5");
  ctx.fillStyle = sea; ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, 2 * Math.PI); ctx.fill();
  const map = (la, lo) => vec(la, lo).map((x) => x * R);
  ctx.strokeStyle = ink;
  if (opt.grid !== false) {
    ctx.globalAlpha = 0.2; ctx.lineWidth = 0.6;
    for (let la = -60; la <= 60; la += 30) {
      if (la === 0) continue;
      const g = []; for (let lo = -180; lo <= 180; lo += 5) g.push([la, lo]);
      strokeLL(ctx, P, map, g, true);
    }
    for (let lo = -180; lo < 180; lo += 30) { const g = []; for (let la = -90; la <= 90; la += 5) g.push([la, lo]); strokeLL(ctx, P, map, g, true); }
    ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    const eq = []; for (let lo = -180; lo <= 180; lo += 5) eq.push([0, lo]);
    strokeLL(ctx, P, map, eq, true);
  }
  if (opt.coasts !== false) {
    ctx.globalAlpha = 0.75; ctx.lineWidth = 0.9;
    for (const line of coastLines()) strokeLL(ctx, P, map, line, true);
  }
  ctx.globalAlpha = 1;
  if (opt.sun) {
    // face de nuit. Le long de la direction du Soleil projetée à l'écran
    // (u), un point du disque à t·rr du centre est éclairé si t > −s_z, où
    // s_z est la composante du Soleil vers l'observateur : c'est exact sur cet
    // axe ; ailleurs le dégradé linéaire approche l'ellipse du terminateur,
    // que l'appelant trace exactement.
    const sp = P(opt.sun), dx = sp[0] - c[0], dy = sp[1] - c[1];
    const m = Math.hypot(dx, dy), ux = m > 1e-6 ? dx / m : 1, uy = m > 1e-6 ? dy / m : 0;
    const sz = sp[2] - c[2];
    if (sz > 0.97) { /* Soleil dans le dos de l'observateur : tout est jour */ }
    else {
    const g0 = Math.max(0, Math.min(1, (1 + sz) / 2));
    const g = ctx.createLinearGradient(c[0] + ux * rr, c[1] + uy * rr, c[0] - ux * rr, c[1] - uy * rr);
    g.addColorStop(0, "rgba(10,20,40,0)");
    g.addColorStop(Math.max(0, g0 - 0.04), "rgba(10,20,40,0)");
    g.addColorStop(Math.min(1, g0 + 0.04), "rgba(10,20,40,0.42)");
    g.addColorStop(1, "rgba(10,20,40,0.5)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, 2 * Math.PI); ctx.fill();
    }
  }
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, 2 * Math.PI); ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * Disque plat dans le plan y = 0, rayon `R` en unités monde, avec épaisseur
 * (tranche), ombre portée et côtes projetées par `mapLL(lat, lon)` → [x,0,z]
 * (azimutale équidistante, plate carrée...). `shape` : "disc" | "rect"
 * (rect : demi-largeurs R × Rz, Rz = R/2 par défaut pour la plate carrée). Renvoie false si le
 * disque est vu par-dessous (la face du dessus, et ce qu'elle porte, est cachée).
 */
export function drawFlat25(ctx, P, { R = 1.5, Rz = null, shape = "disc", mapLL = null, ink = "#b45309", thick = 0.06, onTop = null } = {}) {
  const outline = (y, grow = 1) => {
    const pts = [];
    if (shape === "disc") for (let i = 0; i <= 96; i++) { const t = (2 * Math.PI * i) / 96; pts.push([R * grow * Math.cos(t), y, R * grow * Math.sin(t)]); }
    else { const a = R * grow, b = (Rz ?? R / 2) * grow; pts.push([-a, y, -b], [a, y, -b], [a, y, b], [-a, y, b], [-a, y, -b]); }
    return pts.map(P);
  };
  const fillPoly = (pts, style) => { ctx.fillStyle = style; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
  // ombre portée, un peu sous le disque
  ctx.save(); ctx.globalAlpha = 0.18; ctx.filter = "blur(6px)";
  fillPoly(outline(-thick - 0.25, 1.02), "#1b1f25");
  ctx.restore();
  // tranche : dessus et dessous reliés par l'enveloppe des deux contours
  const top = outline(0), bot = outline(-thick);
  ctx.fillStyle = "#c98a4b";
  for (let i = 0; i < top.length - 1; i++) {
    ctx.beginPath(); ctx.moveTo(top[i][0], top[i][1]); ctx.lineTo(top[i + 1][0], top[i + 1][1]);
    ctx.lineTo(bot[i + 1][0], bot[i + 1][1]); ctx.lineTo(bot[i][0], bot[i][1]); ctx.closePath(); ctx.fill();
  }
  // vu par-dessous (tangage négatif) : on voit le dessous, nu -- pas de côtes
  const c = P([0, 0, 0]);
  if (P([0, 1, 0])[2] < c[2]) {
    fillPoly(bot, "#d9c3a3");
    ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6;
    ctx.beginPath(); bot.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.globalAlpha = 1;
    return false;
  }
  // face supérieure, ombrée légèrement
  const span = Math.max(...top.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])));
  const g = ctx.createRadialGradient(c[0] - span * 0.3, c[1] - span * 0.3, span * 0.05, c[0], c[1], span);
  g.addColorStop(0, "#fbf3e6"); g.addColorStop(1, "#ecd9bd");
  fillPoly(top, g);
  if (onTop) { ctx.save(); ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.clip(); onTop(ctx, top); ctx.restore(); }   // epic18 : les terres
  if (mapLL) {
    ctx.strokeStyle = ink; ctx.globalAlpha = 0.7; ctx.lineWidth = 0.9;
    for (const line of coastLines()) strokeLL(ctx, P, mapLL, line, false);
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8;
  ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  ctx.globalAlpha = 1;
  return true;
}
