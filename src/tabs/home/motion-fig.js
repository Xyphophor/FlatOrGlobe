// Figure des cumuls de mouvement (onglet results, 2026-10-17, propriétaire : « il manque un graphique pour la rotation et
// l'orbite ») : deux panneaux, Ω puis l'unité astronomique, une ligne par méthode (mesures pures en bleu, validations en
// violet), chaque valeur un point, la médiane un trait ; la valeur de référence en tireté (comparaison seulement). Les axes
// partent de zéro : là sont les prédictions plates (un plan immobile ne tourne pas ; le Soleil plat est à quelques milliers
// de km), à l'échelle des mêmes axes.
import { setupCanvas } from "../../core/canvas.js";

const INK = "#151a21", SOFT = "#5b6470", F = "#b45309", EVC = { pure: "#1d4ed8", check: "#7c3aed" };
export const OMEGA_REF = 7.292115e-5, AU_REF = 149597870.7; // IERS, IAU 2012 : pour comparer seulement

export function drawMotion(cv, M, t, lang = "en") {
  const { ctx, W, H } = setupCanvas(cv);
  if (!W || !M) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const wide = W > 560, x0 = 10, x1 = W - (wide ? 90 : 14);   // étiquettes au-dessus de chaque ligne, à toutes les largeurs
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const txt = (s, x, y, o = {}) => { ctx.font = o.font || "11px system-ui, sans-serif"; ctx.fillStyle = o.c || INK; ctx.textAlign = o.al || "left"; ctx.textBaseline = o.bl || "middle"; ctx.fillText(s, x, y); };
  const fit = (s, w) => { if (ctx.measureText(s).width <= w) return s; while (s.length > 4 && ctx.measureText(s + "…").width > w) s = s.slice(0, -1); return s + "…"; };
  const panels = [
    { rows: M.om, max: 9e-5, step: 1e-5, ref: OMEGA_REF, tick: (v) => nf(v * 1e5, 0), unit: t("mo-ax-om"), val: (v) => `${nf(v * 1e5, 3)}`, flat: t("mo-flat-om"), refl: t("mo-ref-om") },
    { rows: M.au, max: 1.6e8, step: 2e7, ref: AU_REF, tick: (v) => nf(v / 1e6, 0), unit: t("mo-ax-au"), val: (v) => `${nf(v / 1e6, 1)}`, flat: t("mo-flat-au"), refl: t("mo-ref-au") },
  ];
  const nRows = panels.reduce((a, p) => a + p.rows.length, 0), gap = 52, top = 22;
  const rh = Math.min(wide ? 34 : 40, (H - top - gap * panels.length) / nRows);
  let y = top;
  for (const p of panels) {
    const X = (v) => x0 + Math.max(0, Math.min(1, v / p.max)) * (x1 - x0), y0 = y, y1 = y + rh * p.rows.length;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let v = 0; v <= p.max + 1e-12; v += p.step) { ctx.beginPath(); ctx.moveTo(X(v), y0); ctx.lineTo(X(v), y1); ctx.stroke(); txt(p.tick(v), X(v), y1 + 9, { al: "center", c: SOFT, font: "9.5px system-ui, sans-serif" }); }
    txt(p.unit, x1, y1 + 22, { al: "right", c: SOFT, font: "9.5px system-ui, sans-serif" });
    // référence (tireté) et prédiction plate (orange, à zéro)
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(X(p.ref), y0 - 2); ctx.lineTo(X(p.ref), y1); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = F; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y1); ctx.stroke();
    txt(p.flat, X(0) + 6, y1 - 6, { c: F, font: "600 10.5px system-ui, sans-serif" });
    p.rows.forEach((r, i) => {
      const yc = y0 + rh * (i + 0.5), col = EVC[r.purity === "pure" ? "pure" : "check"];
      const lab = t(`mo-${r.key}`);
      // l'étiquette au-dessus de sa ligne
      ctx.font = "11px system-ui, sans-serif";
      const side = false;
      if (side) txt(lab, 10, yc, { c: col });
      else { ctx.font = "10.5px system-ui, sans-serif"; txt(fit(lab, W - x0 - 20), x0 + 8, yc - rh * 0.3, { c: col, font: "10.5px system-ui, sans-serif" }); }
      const yd = side ? yc : yc + 6;
      for (const v of r.v) { ctx.fillStyle = col; ctx.globalAlpha = r.v.length > 1 ? 0.55 : 1; ctx.beginPath(); ctx.arc(X(v), yd, 3, 0, 2 * Math.PI); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(r.med), yd - 7); ctx.lineTo(X(r.med), yd + 7); ctx.stroke();
      if (wide) txt(p.val(r.med), W - 8, yd, { al: "right", font: "11px ui-monospace, Menlo, monospace" });
    });
    txt(p.refl, X(p.ref) - 4, y0 - 4, { al: "right", bl: "bottom", c: SOFT, font: "9.5px system-ui, sans-serif" });
    y = y1 + gap;
  }
}
