// Jauge de réfraction (2026-10-14, extraite de src/tabs/contrib/adelaide-anim.js à la demande du propriétaire :
// « la jauge de la réfraction sur le côté », à reprendre sur toutes les superpositions de photos du site).
// Une barre verticale, du chaud (haut) au froid (bas), graduée en gradient de température (K/m) dans la couche que
// les rayons traversent ; le trait noir et sa bande = l'air du jour (réanalyse ou modèle) et son incertitude ; le
// triangle de la couleur du modèle = le gradient qu'il faut pour ce que l'état courant cache ; sa bande = la fourchette
// de ce qu'il faut quand la mesure de la photo est posée. Repères optionnels (ex. gradient autoconvectif). Le globe à
// gauche (graduations à droite de la barre), le plan à droite (graduations à gauche). Aucun nombre n'est calculé ici.

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number,y:number,w:number,h:number}} P  cadre de la jauge
 * @param {object} o
 * @param {boolean} o.flat        plan (barre à droite) ou globe (barre à gauche)
 * @param {string} o.col          couleur du modèle
 * @param {string} o.title        titre (GLOBE, PLANE…) ; o.sub : sous-titre (dT/dz)
 * @param {number} o.lo           bas de l'échelle (K/m) ; o.hi : haut
 * @param {number} o.tick         pas des graduations (K/m) ; o.labelEvery : une étiquette toutes les n graduations
 * @param {(g:number)=>string} o.fmt  étiquette d'une graduation
 * @param {number} o.day          l'air du jour ; o.dayA, o.dayB : sa bande ; o.dayOver : flèche (hors échelle en haut)
 * @param {{grad:number|null, beyond?:boolean, gLo?:number|null, gHi?:number|null}} o.need  ce que l'état exige
 * @param {{g:number,label:string}[]} [o.marks]  repères (trait pointillé et texte court)
 * @param {{text:string,color:string,dy:number}[]} o.lines  textes du bas (dy : distance au bas du cadre)
 * @param {{ink:string,mute:string,faint:string,warm:string,cold:string}} o.C  couleurs
 * @param {{head:string,small:string}} o.F  polices
 */
export function drawGradGauge(ctx, P, o) {
  const { flat, col, lo, hi, C, F } = o;
  const top = P.y + 26, bot = P.y + P.h - 62, bx = P.x + (flat ? P.w - 26 : 8), bw = 18;
  const Yg = (g) => top + ((hi - Math.max(lo, Math.min(hi, g))) / (hi - lo)) * (bot - top);   // borné à l'échelle
  const grd = ctx.createLinearGradient(0, top, 0, bot); grd.addColorStop(0, C.warm); grd.addColorStop(1, C.cold);
  ctx.fillStyle = grd; ctx.fillRect(bx, top, bw, bot - top); ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, top + 0.5, bw - 1, bot - top - 1);
  ctx.font = F.head; ctx.fillStyle = col; ctx.textAlign = flat ? "right" : "left";
  const tx = flat ? P.x + P.w - 2 : P.x + 2;
  ctx.fillText(o.title, tx, P.y + 10);
  ctx.font = F.small; ctx.fillStyle = C.mute; ctx.fillText(o.sub, tx, P.y + 21);
  // graduations du côté intérieur
  ctx.textAlign = flat ? "right" : "left";
  const n = Math.round(1 / o.tick);
  for (let i = Math.ceil(lo * n - 1e-9); i <= Math.floor(hi * n + 1e-9); i++) {
    const g = i / n, y = Yg(g), x1 = flat ? bx : bx + bw;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + (flat ? -4 : 4), y); ctx.stroke();
    if (i % o.labelEvery === 0) { ctx.fillStyle = C.faint; ctx.fillText(o.fmt(g, i), x1 + (flat ? -6 : 6), y + 3); }
  }
  // repères : un trait pointillé en travers de la barre
  for (const m of o.marks || []) {
    if (m.g < lo || m.g > hi) continue;
    const y = Yg(m.g);
    ctx.setLineDash([2, 2]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 2, y); ctx.lineTo(bx + bw + 2, y); ctx.stroke(); ctx.setLineDash([]);
    if (m.label) { ctx.font = F.small; ctx.fillStyle = C.mute; ctx.textAlign = flat ? "left" : "right"; ctx.fillText(m.label, flat ? bx + bw + 3 : bx - 3, y + 3); ctx.textAlign = flat ? "right" : "left"; }
  }
  // l'air du jour : une bande autour du trait (son incertitude)
  const yd = Yg(o.day), dA = Yg(o.dayA), dB = Yg(o.dayB);
  ctx.fillStyle = "rgba(21,26,33,.28)"; ctx.fillRect(bx - 3, Math.min(dA, dB), bw + 6, Math.max(2, Math.abs(dB - dA)));
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 3, yd); ctx.lineTo(bx + bw + 3, yd); ctx.stroke();
  if (o.dayOver) {   // l'air du jour sort de l'échelle par le haut : une flèche dans le haut de la jauge
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(bx + bw / 2, top + 2); ctx.lineTo(bx + bw / 2 - 5, top + 9); ctx.lineTo(bx + bw / 2 + 5, top + 9); ctx.closePath(); ctx.fill();
  }
  // ce que l'état exige : un triangle de la couleur du modèle (au bout de l'échelle s'il en sort)
  const nd = o.need;
  if (nd.grad != null || nd.beyond) {
    const gN = nd.beyond ? lo : Math.max(lo, Math.min(hi, nd.grad)), y = Yg(gN), x = flat ? bx - 2 : bx + bw + 2, s = flat ? -1 : 1;
    // la fourchette de ce qu'il faut (mesure posée) : une bande de la couleur du modèle en travers de la barre, plus large
    // qu'elle (2026-10-15, le propriétaire : « on ne voit pas assez la zone d'erreur »), bordée ; dessinée sous le
    // triangle et le trait
    if (nd.gLo != null || nd.gHi != null) {
      const ya = Yg(Math.min(hi, nd.gHi ?? hi)), yb = Yg(Math.max(lo, nd.gLo ?? lo));
      const x0 = bx - 7, w = bw + 14, y0 = Math.min(ya, yb), h = Math.max(3, Math.abs(yb - ya));
      ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = col; ctx.fillRect(x0, y0, w, h); ctx.restore();
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 9 * s, y - 6); ctx.lineTo(x + 9 * s, y + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + bw / 2, yd); ctx.lineTo(bx + bw / 2, y); ctx.stroke();
  }
  // en bas : les textes (ce qu'il faut, l'air du jour…)
  ctx.font = F.small; ctx.textAlign = flat ? "right" : "left";
  for (const l of o.lines) { ctx.fillStyle = l.color; ctx.fillText(l.text, tx, P.y + P.h - l.dy); }
}

/** La différence air − mer (K) à laquelle les rayons tracés d'un modèle cachent H m (interpolation linéaire dans la
 * grille [{dT, globe, flat, …}] triée par dT croissant). null si H sort de la grille. */
export function tracedFor(grid, model, H) {
  for (let i = 0; i + 1 < grid.length; i++) {
    const a = grid[i], b = grid[i + 1], ha = a[model], hb = b[model];
    if ((ha - H) * (hb - H) <= 0 && ha !== hb) return a.dT + ((H - ha) / (hb - ha)) * (b.dT - a.dT);
  }
  return null;
}

/** Une colonne de la grille (ex. grad, K/m) à la différence dT (interpolation linéaire, bornée aux bouts). */
export function tracedAt(grid, key, dT) {
  if (dT <= grid[0].dT) return grid[0][key];
  for (let i = 0; i + 1 < grid.length; i++) {
    const a = grid[i], b = grid[i + 1];
    if (dT <= b.dT) return a[key] + ((dT - a.dT) / (b.dT - a.dT)) * (b[key] - a[key]);
  }
  return grid[grid.length - 1][key];
}
