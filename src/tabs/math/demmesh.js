// Animation « maillage » de l'onglet math (phys jusqu'au 2026-11-27 ; 2026-11-25, demande du propriétaire : « un mesh qui gagne et perd des nœuds et des
// trous, et qui affiche la différence ») : à gauche (ou en haut), le relief inventé vu en oblique, maillé à 5, 10, 20 puis 40 m ;
// les nœuds qui partent descendent sur la surface de la grille plus grossière, puis reviennent ; ensuite un trou dans la grille
// fine, comblé par un autre modèle (20 m, plus haut). À droite (ou en bas), la coupe par le sommet : le vrai sol, le maillage,
// et l'écart des sommets. Vue orthographique (azimut 35°, élévation 30°) et coupe : hauteurs et distances à la même échelle.
// Calculs : demmesh-logic.js.
import { anim2d, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { demModel, meshAt, profileAt, ground, bilinear, HALF, PEAK, HOLE, SPAN } from "./demmesh-logic.js";

const RED = "#b91c1c", AMBER = "#d97706";
const nf = (lang, x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
const AZ = 35 * Math.PI / 180, EL = 30 * Math.PI / 180, ZB = 1000;

export function mountDemMesh(canvas, tr, lang = "en") {
  const M = demModel();
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, m = meshAt(M, t), side = W >= 560;
    const top = 8 + 17 * text(ctx, tr("an-dm-t", "A terrain model is a mesh: fewer nodes, a lower summit; a hole, another model"), 10, 16, { size: side ? 13 : 12, bold: true, maxW: W - 20 });
    const bottom = side ? 30 : 40, h = H - top - bottom;
    const A = side ? { x: 0, y: top, w: W * 0.56, h } : { x: 0, y: top, w: W, h: h * 0.56 };
    const B = side ? { x: W * 0.56, y: top, w: W * 0.44, h } : { x: 0, y: top + h * 0.56, w: W, h: h * 0.44 };

    /* ---- le maillage en oblique ---- */
    const ca = Math.cos(AZ), sa = Math.sin(AZ), se = Math.sin(EL), ce = Math.cos(EL);
    const span3 = 2 * HALF * (ca + sa);                         // largeur du carré à l'écran (m)
    const s = Math.min((A.w - 20) / span3, (A.h - 40) / (2 * HALF * (ca + sa) * se + 120 * ce));
    const cx = A.x + A.w / 2, cy = A.y + 30 + (HALF * (ca + sa) * se + 120 * ce) * s;
    const P = (x, y, z) => { const sx = x * ca - y * sa, w = x * sa + y * ca; return [cx + sx * s, cy - (z - ZB) * ce * s - w * se * s]; };
    // le plan de base et le trou, au sol
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath();
    [[-HALF, -HALF], [HALF, -HALF], [HALF, HALF], [-HALF, HALF]].forEach(([x, y], i) => { const q = P(x, y, ZB); i ? ctx.lineTo(...q) : ctx.moveTo(...q); });
    ctx.closePath(); ctx.stroke();
    const { g, z, alpha } = m, n = g.xs.length;
    // cellules, de la plus lointaine à la plus proche (peintre) ; teinte = pente vers la lumière
    const cells = [];
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < n - 1; j++) {
      const a = Math.min(alpha(g.xs[i], g.ys[j]), alpha(g.xs[i + 1], g.ys[j]), alpha(g.xs[i], g.ys[j + 1]), alpha(g.xs[i + 1], g.ys[j + 1]));
      if (a <= 0.02) continue;
      cells.push({ i, j, a, w: (g.xs[i] + g.step / 2) * sa + (g.ys[j] + g.step / 2) * ca });
    }
    const F = M.fill;
    if (m.fillA > 0.02) for (let i = 0; i < F.xs.length - 1; i++) for (let j = 0; j < F.ys.length - 1; j++)
      cells.push({ i, j, a: m.fillA, fill: true, w: (F.xs[i] + F.step / 2) * sa + (F.ys[j] + F.step / 2) * ca });
    cells.sort((p, q) => q.w - p.w);
    const thin = g.step < 8 ? 0.5 : 0.9;
    for (const c of cells) {
      if (c.fill) {
        const { i, j } = c, q = [P(F.xs[i], F.ys[j], F.z[i][j]), P(F.xs[i + 1], F.ys[j], F.z[i + 1][j]), P(F.xs[i + 1], F.ys[j + 1], F.z[i + 1][j + 1]), P(F.xs[i], F.ys[j + 1], F.z[i][j + 1])];
        ctx.globalAlpha = c.a; ctx.fillStyle = "rgb(253,230,190)"; ctx.beginPath(); q.forEach((p, k) => (k ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = AMBER; ctx.lineWidth = 1.4; ctx.stroke();
        continue;
      }
      const { i, j } = c, x0 = g.xs[i], x1 = g.xs[i + 1], y0 = g.ys[j], y1 = g.ys[j + 1];
      const q = [P(x0, y0, z[i][j]), P(x1, y0, z[i + 1][j]), P(x1, y1, z[i + 1][j + 1]), P(x0, y1, z[i][j + 1])];
      const dzx = (z[i + 1][j] + z[i + 1][j + 1] - z[i][j] - z[i][j + 1]) / (2 * g.step), dzy = (z[i][j + 1] + z[i + 1][j + 1] - z[i][j] - z[i + 1][j]) / (2 * g.step);
      const lit = Math.max(0, Math.min(1, 0.62 - 0.45 * dzx + 0.25 * dzy));
      ctx.globalAlpha = c.a;
      ctx.fillStyle = `rgb(${Math.round(196 + 46 * lit)},${Math.round(204 + 40 * lit)},${Math.round(214 + 30 * lit)})`;
      ctx.beginPath(); q.forEach((p, k) => (k ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = GLOBE; ctx.lineWidth = thin; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // les nœuds qui partent ou reviennent (rouge), ceux d'une grille de 20 m et plus (points)
    if (m.p.kind === "morph" && m.w > 0.02 && m.w < 0.98) {
      ctx.fillStyle = RED;
      g.xs.forEach((x, i) => g.ys.forEach((y, j) => { if (m.leaving(x, y)) { const p = P(x, y, z[i][j]); ctx.fillRect(p[0] - 1, p[1] - 1, 2, 2); } }));
    } else if (g.step >= 20) g.xs.forEach((x, i) => g.ys.forEach((y, j) => disc(ctx, ...P(x, y, z[i][j]), 2, GLOBE)));
    // les nœuds de l'autre modèle
    if (m.fillA > 0.02) { ctx.globalAlpha = m.fillA; F.xs.forEach((x, i) => F.ys.forEach((y, j) => disc(ctx, ...P(x, y, F.z[i][j]), 2.4, AMBER))); ctx.globalAlpha = 1; }
    if (m.holeA > 0.02 && m.fillA < 0.5) {   // le bord du trou, posé sur le maillage fin
      const g0 = M.grids[0]; ctx.globalAlpha = m.holeA; ctx.strokeStyle = RED; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.beginPath();
      const edge = [[HOLE.x0, HOLE.y0, HOLE.x1, HOLE.y0], [HOLE.x1, HOLE.y0, HOLE.x1, HOLE.y1], [HOLE.x1, HOLE.y1, HOLE.x0, HOLE.y1], [HOLE.x0, HOLE.y1, HOLE.x0, HOLE.y0]];
      edge.forEach(([xa, ya, xb, yb], e) => { for (let k = 0; k <= 20; k++) { const x = xa + (xb - xa) * k / 20, y = ya + (yb - ya) * k / 20, q = P(x, y, bilinear(g0, x, y)); e === 0 && k === 0 ? ctx.moveTo(...q) : ctx.lineTo(...q); } });
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    // la coupe, et le vrai sommet
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath();
    for (let x = -HALF; x <= HALF; x += 4) { const q = P(x, PEAK[1], ZB); x === -HALF ? ctx.moveTo(...q) : ctx.lineTo(...q); }
    ctx.stroke(); ctx.setLineDash([]);
    const pk = P(PEAK[0], PEAK[1], M.top); disc(ctx, pk[0], pk[1], 3, INK);
    // lectures
    const lab = m.fillA > 0.5 ? tr("an-dm-fill", "hole filled by another model: 20 m, 8 m higher") : m.holeA > 0.5 ? tr("an-dm-hole", "no data here: a hole in the 5 m grid")
      : `${tr("an-dm-cell", "cell")} ${m.step} m · ${nf(lang, m.count)} ${tr("an-dm-nodes", "nodes")}`;
    text(ctx, lab, A.x + 10, A.y + 14, { size: 11, bold: true, c: m.fillA > 0.5 ? AMBER : m.holeA > 0.5 ? RED : GLOBE, maxW: A.w - 20 });

    /* ---- la coupe par le sommet ---- */
    const zlo = 1000, zhi = 1115, padL = 40, padR = 10, padT = 34, padB = 64;
    const k = Math.min((B.w - padL - padR) / (2 * HALF), (B.h - padT - padB) / (zhi - zlo));   // une seule échelle
    const ox = B.x + padL + ((B.w - padL - padR) - 2 * HALF * k) / 2, oy = B.y + padT + (zhi - zlo) * k;
    const X = (x) => ox + (x + HALF) * k, Y = (zz) => oy - (zz - zlo) * k;
    text(ctx, tr("an-dm-cut", "section through the summit"), B.x + 10, B.y + 14, { size: 11, bold: true, c: SOFT, maxW: B.w - 20 });
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(-HALF), Y(zlo)); ctx.lineTo(X(HALF), Y(zlo)); ctx.stroke();
    for (const zz of [1000, 1050, 1100]) { ctx.beginPath(); ctx.moveTo(X(-HALF) - 3, Y(zz)); ctx.lineTo(X(-HALF), Y(zz)); ctx.stroke(); text(ctx, nf(lang, zz), X(-HALF) - 5, Y(zz) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    // le vrai sol
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = -HALF; x <= HALF; x += 0.5) { const q = [X(x), Y(ground(x, PEAK[1]))]; x === -HALF ? ctx.moveTo(...q) : ctx.lineTo(...q); }
    ctx.stroke();
    // le maillage (et l'autre modèle) le long de la coupe
    const seg = (fn, col, w, a = 1) => { ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); let on = false;
      for (let x = -HALF; x <= HALF; x += 0.5) { const v = fn(x); if (v == null) { on = false; continue; } const q = [X(x), Y(v)]; on ? ctx.lineTo(...q) : ctx.moveTo(...q); on = true; }
      ctx.stroke(); ctx.globalAlpha = 1; };
    seg((x) => { const p = profileAt(M, m, x); return p.inside && m.holeA > 0.5 ? null : p.mesh; }, GLOBE, 2.2);
    if (m.fillA > 0.02) seg((x) => profileAt(M, m, x).fill, AMBER, 2.4, m.fillA);
    // les deux sommets
    const yT = Y(M.top), yM = Y(m.top), xs = X(PEAK[0]);
    ctx.strokeStyle = FAINT; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(-HALF), yT); ctx.lineTo(X(HALF), yT); ctx.moveTo(X(-HALF), yM); ctx.lineTo(X(HALF), yM); ctx.stroke(); ctx.setLineDash([]);
    disc(ctx, xs, yT, 3, INK);
    const col = m.fillA > 0.5 ? AMBER : GLOBE, d = m.top - M.top;
    const ly = Math.min(B.y + B.h - 22, Y(zlo) + 26), lx = X(-HALF);
    text(ctx, `${tr("an-dm-true", "summit of the ground")}${tr("an-dm-colon", ": ")}${nf(lang, M.top, 1)} m`, lx, ly, { size: 11, c: INK, maxW: B.x + B.w - lx - 6 });
    text(ctx, `${tr("an-dm-mesh", "summit of the mesh")}${tr("an-dm-colon", ": ")}${nf(lang, m.top, 1)} m (${d >= 0 ? "+" : "−"}${nf(lang, Math.abs(d), 1)} m)`, lx, ly + 17, { size: 11, bold: true, c: col, maxW: B.x + B.w - lx - 6 });

    stamp2d(ctx, W, tr("an-dm-st", "invented terrain; heights and distances at the same scale, no exaggeration; oblique view"), false, H);
  } });
}
