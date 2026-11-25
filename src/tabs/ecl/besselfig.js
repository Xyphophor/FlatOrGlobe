// Schéma des éléments besséliens (epic09/UC05, reporté puis fait), canvas 2D,
// figure FIXE. SCHÉMATIQUE, pas à l'échelle -- tampon sur la figure (règle 1).
// Ce qu'elle montre : le plan fondamental passe par le CENTRE de la Terre,
// perpendiculaire à l'axe de l'ombre ; x, y y repèrent l'axe ; l1, l2 sont les
// rayons de la pénombre et de l'ombre sur ce plan ; un observateur à la
// surface y est projeté en (ξ, η), à la hauteur ζ au-dessus du plan -- et
// ξ, η, ζ se calculent depuis ρ sin φ′, ρ cos φ′, sa position sur l'ellipsoïde.
import { pixelRatio } from "../../core/canvas.js";
export function drawBesselFig(canvas, tr) {
  const r = canvas.getBoundingClientRect(); if (!r.width) return;
  const dpr = pixelRatio(2);
  canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = r.width, H = r.height;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const s = Math.min(W / 380, H / 260);
  ctx.save(); ctx.translate((W - 380 * s) / 2, (H - 260 * s) / 2); ctx.scale(s, s);
  const txt = (t, x, y, col = "#151a21", al = "left", f = "11px") => { ctx.fillStyle = col; ctx.font = `${f} ui-monospace, Menlo, monospace`; ctx.textAlign = al; ctx.fillText(t, x, y); };

  // Soleil (à gauche, hors cadre), Lune, cônes d'ombre vers la droite
  const my = 120, mx = 70, mr = 12, ex = 285, er = 58;
  const g = ctx.createLinearGradient(0, 0, 60, 0); g.addColorStop(0, "rgba(247,183,51,0.5)"); g.addColorStop(1, "rgba(247,183,51,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 30, 60, 180);
  txt(tr("bf-sun", "← Sun"), 6, 26, "#b45309");
  // pénombre (s'ouvre) et ombre (se referme), axe
  ctx.fillStyle = "rgba(90,100,115,0.14)"; ctx.beginPath(); ctx.moveTo(mx, my - mr); ctx.lineTo(ex + 20, my - 58); ctx.lineTo(ex + 20, my + 58); ctx.lineTo(mx, my + mr); ctx.fill();
  ctx.fillStyle = "rgba(21,26,33,0.35)"; ctx.beginPath(); ctx.moveTo(mx, my - mr); ctx.lineTo(ex + 20, my - 4); ctx.lineTo(ex + 20, my + 4); ctx.lineTo(mx, my + mr); ctx.fill();
  ctx.strokeStyle = "#151a21"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(20, my); ctx.lineTo(372, my); ctx.stroke(); ctx.setLineDash([]);
  txt(tr("bf-axis", "shadow axis"), 100, my + 30, "#151a21");   // à droite, la Terre (dessinée après) le cachait
  const moon = ctx.createRadialGradient(mx - 4, my - 4, 1, mx, my, mr); moon.addColorStop(0, "#f2f2f2"); moon.addColorStop(1, "#8b93a0");
  ctx.fillStyle = moon; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();
  txt(tr("bf-moon", "Moon"), mx, my + mr + 14, "#5b6470", "center");
  // la Terre, et le plan fondamental par son CENTRE (vu de biais : une ellipse)
  const earth = ctx.createRadialGradient(ex - 20, my - 22, 5, ex, my, er); earth.addColorStop(0, "#e6f4f1"); earth.addColorStop(1, "#8fc2bb");
  ctx.fillStyle = earth; ctx.beginPath(); ctx.arc(ex, my, er, 0, 7); ctx.fill(); ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = "#1d4ed8"; ctx.fillStyle = "rgba(29,78,216,0.10)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(ex, my, 18, 92, 0, 0, 7); ctx.fill(); ctx.stroke();
  txt(tr("bf-plane", "fundamental plane,"), ex - 4, 16, "#1d4ed8", "center");
  txt(tr("bf-plane2", "through the Earth's centre"), ex - 4, 29, "#1d4ed8", "center");
  // axes x, y du plan, et les deux cercles d'ombre sur le plan
  ctx.strokeStyle = "#1d4ed8"; ctx.beginPath(); ctx.moveTo(ex, my); ctx.lineTo(ex, my - 80); ctx.stroke(); txt("y", ex + 4, my - 74, "#1d4ed8");
  ctx.beginPath(); ctx.moveTo(ex, my); ctx.lineTo(ex - 14, my + 40); ctx.stroke(); txt("x", ex - 22, my + 50, "#1d4ed8");
  ctx.strokeStyle = "#5b6470"; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.ellipse(ex, my - 6, 9, 48, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#151a21"; ctx.beginPath(); ctx.ellipse(ex, my - 6, 1.5, 6, 0, 0, 7); ctx.stroke();
  txt("l₁", ex + 14, my - 48, "#5b6470"); txt("l₂", ex + 8, my - 4, "#151a21");
  // un observateur à la surface, projeté sur le plan : (ξ, η), hauteur ζ
  const ox = ex - 40, oy = my - 42;
  ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, 7); ctx.fill();
  ctx.strokeStyle = "#b45309"; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex - 3, oy + 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(ex - 3, oy + 2, 2.5, 0, 7); ctx.fill();
  txt(tr("bf-obs", "observer (ρ sin φ′, ρ cos φ′)"), 96, oy - 30, "#b45309");
  ctx.strokeStyle = "rgba(180,83,9,.5)"; ctx.beginPath(); ctx.moveTo(150, oy - 26); ctx.lineTo(ox - 3, oy - 3); ctx.stroke();
  txt("ζ", (ox + ex) / 2 - 4, oy - 5, "#b45309"); txt("(ξ, η)", ex + 6, oy + 6, "#b45309");
  txt(tr("bf-stamp", "schematic, not to scale"), 376, 252, "#b45309", "right", "10px");
  ctx.restore();
}
