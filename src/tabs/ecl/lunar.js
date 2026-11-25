// Éclipses de Lune (epic09/UC09), figure FIXE, canvas 2D, schématique.
// Le bord de l'ombre terrestre sur la Lune est un arc du MÊME cercle au lever,
// au plus haut et au coucher -- seule son orientation par rapport à l'horizon
// tourne (angle parallactique). Le rayon de ce cercle, rapporté à celui de la
// Lune, est CALCULÉ ici (umbraRatio) depuis les distances et rayons publiés :
// cône d'ombre de la Terre à la distance de la Lune, agrandi de ~2 % par
// l'atmosphère (convention de Danjon, dite dans la légende).
import { pixelRatio, fillTextFit } from "../../core/canvas.js";
export function umbraRatio() {
  const RE = 6371, RS = 696000, RM = 1737.4, dM = 384400, dS = 149.6e6;     // km
  const umbra = RE - dM * (RS - RE) / dS;                                     // rayon du cône à la distance de la Lune
  return { ratio: (umbra * 1.02) / RM, umbraKm: umbra * 1.02 };
}

export function drawLunarFig(canvas, tr) {
  const r = canvas.getBoundingClientRect(); if (!r.width) return;
  const dpr = pixelRatio(2);
  canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = r.width, H = r.height;
  ctx.fillStyle = "#0e1320"; ctx.fillRect(0, 0, W, H);
  const k = umbraRatio().ratio, n = 4, cw = W / n, rm = Math.min(cw * 0.22, H * 0.2), cy = H * 0.48;
  const panels = [
    [tr("lu-rise", "moonrise, east"), 55], [tr("lu-high", "highest, south"), 0], [tr("lu-set", "moonset, west"), -55],
  ];
  const moonDisc = (x, y) => { const g = ctx.createRadialGradient(x - rm * 0.3, y - rm * 0.3, rm * 0.1, x, y, rm);
    g.addColorStop(0, "#f4f1e8"); g.addColorStop(1, "#b9b4a6"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rm, 0, 7); ctx.fill(); };
  panels.forEach(([label, rotDeg], i) => {
    const x = cw * i + cw / 2;
    moonDisc(x, cy);
    // l'ombre : un disque de rayon k·rm dont le bord entame la Lune, tourné de rotDeg
    const a = (rotDeg - 90) * Math.PI / 180, dist = k * rm + rm * 0.35;
    const sx = x + Math.cos(a) * dist, sy = cy + Math.sin(a) * dist;
    ctx.save(); ctx.beginPath(); ctx.arc(x, cy, rm, 0, 7); ctx.clip();
    ctx.fillStyle = "rgba(120,30,20,0.82)"; ctx.beginPath(); ctx.arc(sx, sy, k * rm, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = "rgba(255,160,130,0.35)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(sx, sy, k * rm, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#c9d3e3"; ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    fillTextFit(ctx, label, x, H - 30, cw - 6, { lineH: 12 });
  });
  // ce que donnerait un disque plat éclairé par la tranche : un bord droit
  const x = cw * 3 + cw / 2; moonDisc(x, cy);
  ctx.save(); ctx.beginPath(); ctx.arc(x, cy, rm, 0, 7); ctx.clip();
  ctx.fillStyle = "rgba(120,30,20,0.82)"; ctx.fillRect(x - rm, cy - rm, rm * 1.1, rm * 2); ctx.restore();
  ctx.fillStyle = "#e0a52a"; ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
  fillTextFit(ctx, tr("lu-flat", "a disc lit edge-on"), x, H - 30, cw - 6, { lineH: 12 });
  ctx.strokeStyle = "rgba(200,210,230,0.25)"; ctx.beginPath(); ctx.moveTo(cw * 3, 12); ctx.lineTo(cw * 3, H - 12); ctx.stroke();
  ctx.textAlign = "left"; ctx.fillStyle = "#e0a52a"; ctx.font = "10px ui-monospace, Menlo, monospace";
  fillTextFit(ctx, tr("lu-stamp", "schematic · shadow radius {k} × the Moon's, computed").replace("{k}", k.toFixed(2)), 8, 16, W - 16, { lineH: 12 });
}
