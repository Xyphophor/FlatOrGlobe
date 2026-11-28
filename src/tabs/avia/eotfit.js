// Figure 8c (epic14, 2026-09-30) : la rotation ET le rayon de la Terre tirés
// des mêmes paires de lignes GRAV-D (logic.fitRotRadius). Plan (Ω/Ω₀, R) :
// chaque cercle est une paire de lignes voisines prise seule (ils tombent un
// à un) -- ils glissent le long du compromis entre Ω et R ; le point plein est
// l'ajustement sur toutes les paires, avec son ellipse jackknife à 1 σ (à
// l'échelle, donc minuscule) ; la croix tiretée, les valeurs vraies (Ω₀,
// 6 371 km). En haut, hors cadre : R = ∞ (le terme de rotation du globe posé
// sur un plan, Ω libre) et l'écart qu'il laisse.
import { drawFitBox } from "../../core/fitbox.js";
import { setupCanvas } from "../../core/canvas.js";
import { eotData } from "./eot.js";
import { colors, label, wrapLabel, dot, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

export function mountEotFit(root, tr) {
  const cv = root.querySelector("#aviaEotFit"), btn = root.querySelector("#aviaEotFitPlay");
  const st = { k: 0 };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    const J = eotData().joint, P = J.per;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const nt = wrapLabel(ctx, `${tr("jf-all", "all pairs together")}: Ω = ${num(J.om, 4)} ± ${num(J.seOm, 4)} Ω₀ (${tr("jf-turn", "one turn in")} ${num(J.dayH, 2)} ± ${num(J.seDayH, 2)} h) · R = ${num(J.km)} ± ${num(J.seKm)} km`, 8, 12, W - 16, { col: globe, font: "600 12px system-ui, sans-serif", lh: 15 });
    const n2 = wrapLabel(ctx, tr("jf-sub", "circles: one pair of neighbouring lines alone; dashed: the true values, 23.93 h and 6,371 km"), 8, 12 + nt * 15, W - 16, { col: SOFT, font: "10.5px system-ui, sans-serif" });
    const x0 = 50, x1 = W - 12, y0 = 18 + nt * 15 + n2 * 13 + 18, y1 = H - 34;
    const oLo = 0.99, oHi = 1.035, rLo = 5000, rHi = 9500;
    const X = (o) => x0 + (o - oLo) / (oHi - oLo) * (x1 - x0), Y = (r) => y1 - (r - rLo) / (rHi - rLo) * (y1 - y0);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let r = rLo; r <= rHi; r += 1000) { ctx.beginPath(); ctx.moveTo(x0, Y(r)); ctx.lineTo(x1, Y(r)); ctx.stroke(); label(ctx, num(r), x0 - 4, Y(r), { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    for (let o = 0.99; o <= oHi + 1e-9; o += 0.01) { ctx.beginPath(); ctx.moveTo(X(o), y0); ctx.lineTo(X(o), y1); ctx.stroke(); label(ctx, num(o, 2), X(o), y1 + 11, { al: "center", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    label(ctx, "R (km)", x0 - 4, y0 - 10, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    label(ctx, tr("jf-x", "Ω / Ω₀, the rotation put in the correction"), x1, y1 + 24, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = INK; ctx.beginPath();
    ctx.moveTo(x0, Y(6371)); ctx.lineTo(x1, Y(6371)); ctx.moveTo(X(1), y0); ctx.lineTo(X(1), y1); ctx.stroke(); ctx.restore();
    const n = Math.min(P.length, Math.floor(st.k));
    ctx.strokeStyle = globe; ctx.lineWidth = 1.4;
    for (let i = 0; i < n; i++) { const p = P[i], y = Y(Math.min(rHi, p.km)); ctx.beginPath(); ctx.arc(X(p.om), y, 4, 0, 2 * Math.PI); ctx.stroke(); }
    if (st.k >= P.length + 4) {
      // ellipse jackknife à 1 σ (Cholesky de la covariance), à l'échelle des axes
      const a = J.seOm, c = J.cov / a, d = Math.sqrt(Math.max(0, J.seKm ** 2 - c * c));
      ctx.fillStyle = globe; ctx.globalAlpha = 0.25; ctx.beginPath();
      for (let t = 0; t <= 64; t++) { const u = Math.cos(t / 32 * Math.PI), v = Math.sin(t / 32 * Math.PI), px = X(J.om + a * u), py = Y(J.km + c * u + d * v); t ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.fill(); ctx.globalAlpha = 1;
      dot(ctx, X(J.om), Y(J.km), 4.5, globe);
      // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : deux paramètres libres (Ω, R), pas une droite ; dispersion = rms
      drawFitBox(ctx, x1 - 4, y1 - 4, { R: J.km, range: `± ${num(J.seKm)} km`, r: J.multR, rOf: tr("jf-rof", "multiple, Ω and R"), scatter: `${num(J.rms, 1)} mGal rms`, chi2nu: null, title: `Ω = ${num(J.om, 4)} Ω₀`, col: globe, size: W < 480 ? 9 : 10, align: "right", valign: "bottom" });
      label(ctx, tr("jf-best", "all pairs (±1 σ)"), X(J.om) + 8, Y(J.km) + 12, { col: globe, font: "600 10.5px system-ui, sans-serif", halo: true });
      // R = ∞ : hors cadre, en haut
      const fx = X(Math.min(oHi, J.flat.om));
      ctx.strokeStyle = flat; ctx.fillStyle = flat; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(fx, y0 + 30); ctx.lineTo(fx, y0 + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx, y0 - 2); ctx.lineTo(fx - 5, y0 + 7); ctx.lineTo(fx + 5, y0 + 7); ctx.closePath(); ctx.fill();
      wrapLabel(ctx, `R = ∞: Ω = ${num(J.flat.om, 3)} Ω₀, ${num(J.flat.rms)} mGal rms (${tr("jf-vs", "globe")} ${num(J.rms, 1)})`, fx - 8, y0 + 14, Math.min(180, fx - x0 - 12), { al: "right", col: flat, font: "600 10px system-ui, sans-serif", halo: true });
    }
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.k += n * 0.06; if (st.k > eotData().joint.per.length + 60) st.k = 0; }, draw,
    anim: { duration: () => (eotData().joint.per.length + 40) / 0.06 / 60, state: st, reset: () => { st.k = 0; } },
  });
  // sans animation (préférence « réduire les animations »), tout est affiché
  if (!loop.playing) st.k = 1e9;
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
