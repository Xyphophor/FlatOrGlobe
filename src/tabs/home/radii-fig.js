// Figure du cumul des rayons (accueil) : une ligne par mesure, boîte entre
// les quartiles, trait à la médiane, fin trait du minimum au maximum, sur un
// axe commun en km ; la droite verticale est le rayon moyen (6 371 km). Ce
// qu'un plan donnerait (R infini) est marqué au bord droit. Dessin statique.
// epic17 : deux groupes (mesures pures, puis validations), chacun sous son titre et
// avec SA moyenne pondérée et sa bande, tracée sur ses seules lignes.
import { setupCanvas } from "../../core/canvas.js";

const G = "#0f766e", F = "#b45309", INK = "#151a21", SOFT = "#5b6470", EVC = { measure: "#1d4ed8", check: "#7c3aed" };
const LO = 4000, HI = 9000;

export function drawRadii(cv, groups, t, fmt) {
  const { ctx, W, H } = setupCanvas(cv);
  const nRows = groups.reduce((a, g) => a + g.rows.length, 0);
  if (!W || !nRows) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const wide = W > 560, lw = wide ? Math.min(250, W * 0.36) : 0;
  // en étroit, la note du plan prend sa propre ligne en haut ; gh : hauteur d'un titre de groupe
  const x0 = 10 + lw, x1 = W - (wide ? 70 : 44), top = wide ? 14 : 34, bot = H - 30, gh = 18;
  const rh = (bot - top - gh * groups.length) / nRows;
  const X = (km) => x0 + (Math.max(LO, Math.min(HI, km)) - LO) / (HI - LO) * (x1 - x0);
  const txt = (s, x, y, o = {}) => { ctx.font = o.font || "11px system-ui, sans-serif"; ctx.fillStyle = o.c || INK; ctx.textAlign = o.al || "left"; ctx.textBaseline = o.bl || "middle"; ctx.fillText(s, x, y); };
  ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
  for (let km = LO; km <= HI; km += 1000) { ctx.beginPath(); ctx.moveTo(X(km), top); ctx.lineTo(X(km), bot); ctx.stroke(); txt(fmt(km), X(km), bot + 10, { al: "center", c: SOFT, font: "9.5px system-ui, sans-serif" }); }
  txt(t("rad-axis"), x1, bot + 22, { al: "right", c: SOFT, font: "9.5px system-ui, sans-serif" });
  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(X(6371), top - 4); ctx.lineTo(X(6371), bot); ctx.stroke(); ctx.restore();
  let y = top;
  for (const g of groups) {
    const ec = EVC[g.cls] || INK, gy0 = y + gh, gy1 = gy0 + rh * g.rows.length;
    txt(g.label, 10, y + gh / 2 + 1, { c: ec, font: "600 11px system-ui, sans-serif" });
    ctx.strokeStyle = ec; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10, gy0 - 1); ctx.lineTo(x1, gy0 - 1); ctx.stroke();
    // statistique du groupe (globalStats sur ses lignes) : moyenne ± erreur type, sur la hauteur du groupe
    const G0 = g.G;
    if (G0 && Number.isFinite(G0.mean)) {
      ctx.fillStyle = "rgba(21,26,33,0.10)"; ctx.fillRect(X(G0.mean - G0.seScaled), gy0, Math.max(2, X(G0.mean + G0.seScaled) - X(G0.mean - G0.seScaled)), gy1 - gy0);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(G0.mean), gy0); ctx.lineTo(X(G0.mean), gy1); ctx.stroke();
    }
    g.rows.forEach((r, i) => {
      const lab = `${t(`rad-${r.key}`)} · ${t(`rad-${r.key}-n`).replace("{n}", fmt(r.n))}`;
      // une étiquette trop longue pour sa colonne passe au-dessus de sa ligne, et se coupe au bord
      ctx.font = "11px system-ui, sans-serif";
      const side = wide && ctx.measureText(lab).width <= lw - 6;
      const yc = gy0 + rh * (i + 0.5), bh = Math.min(14, rh * 0.36), yb = side ? yc : yc + 5;
      const grey = r.quoted || r.counted === false;   // citée, ou montrée sans être comptée
      const lc = grey ? SOFT : INK;
      const fit = (s, w) => { if (ctx.measureText(s).width <= w) return s; while (s.length > 4 && ctx.measureText(s + "…").width > w) s = s.slice(0, -1); return s + "…"; };
      if (side) txt(lab, 10, yc, { font: "11px system-ui, sans-serif", c: lc });
      else { ctx.font = "10.5px system-ui, sans-serif"; txt(fit(lab, W - 20), 10, yc - rh * 0.3, { font: "10.5px system-ui, sans-serif", c: lc }); }
      const col = grey ? SOFT : G;
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(r.min), yb); ctx.lineTo(X(r.max), yb); ctx.stroke();
      ctx.fillStyle = grey ? "rgba(91,100,112,0.25)" : "rgba(15,118,110,0.22)";
      ctx.fillRect(X(r.q1), yb - bh / 2, Math.max(2, X(r.q3) - X(r.q1)), bh);
      ctx.strokeRect(X(r.q1), yb - bh / 2, Math.max(2, X(r.q3) - X(r.q1)), bh);
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(r.med), yb - bh / 2 - 2); ctx.lineTo(X(r.med), yb + bh / 2 + 2); ctx.stroke();
      // incertitude totale ± σ (statistique ⊕ systématique mesurée) : barre épaisse sous la boîte, avec butées
      if (r.sigma) {
        const ye = yb + bh / 2 + 5; ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(X(r.med - r.sigma), ye); ctx.lineTo(X(r.med + r.sigma), ye);
        ctx.moveTo(X(r.med - r.sigma), ye - 3); ctx.lineTo(X(r.med - r.sigma), ye + 3); ctx.moveTo(X(r.med + r.sigma), ye - 3); ctx.lineTo(X(r.med + r.sigma), ye + 3); ctx.stroke();
      }
      if (r.min < LO) txt("◂", x0 - 2, yb, { al: "right", c: col });
      if (r.max > HI) txt("▸", x1 + 2, yb, { c: col });
    });
    y = gy1;
  }
  // un plan : rayon infini (surv, ct) ou aucune distance cohérente (les autres)
  if (wide) {
    txt(t("rad-flat"), W - 6, top + 2, { al: "right", bl: "top", c: F, font: "600 11px system-ui, sans-serif" });
    txt("∞ →", W - 6, top + 16, { al: "right", bl: "top", c: F, font: "600 13px system-ui, sans-serif" });
  } else txt(`${t("rad-flat")} ∞ →`, W - 6, 8, { al: "right", bl: "top", c: F, font: "600 11px system-ui, sans-serif" });
}
