// Onglet orb : le retard annuel des pulsars (epic37/UC02, 2026-11-18). Animation : une année par pulsar, les douze de suite.
// À gauche (en haut au téléphone) : l'orbite de la Terre vue du nord de l'écliptique, à l'échelle, et les fronts d'onde
// du pulsar qui arrivent de sa direction (sa longitude écliptique λ) ; la Terre les reçoit plus tôt quand elle est du côté du
// pulsar, plus tard de l'autre côté. À droite (en bas) : le retard (A/c)·r·cos β·cos(λ⊕ − λ) des douze pulsars sur un an,
// celui de l'année en cours en gras, et le curseur. Positions de la Terre : ephemeris.js (Meeus) ; λ, β : fog build orb-pulsar.
import { anim2d, text, disc, arrow, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { sun } from "../../core/ephemeris.js";
import { distinct, romerDelay } from "./pulsar-logic.js";

const D2R = Math.PI / 180, TAU = 2 * Math.PI, PSR = "#7c3aed";
const J0 = Date.UTC(2015, 0, 1) / 864e5 + 2440587.5;
const earthAt = (jd) => { const s = sun(jd); return { lam: (s.lon + 180) * D2R, r: s.distAU }; };

export function mountPulsar(canvas, tr, lang = "en") {
  const P = distinct(), N = P.length, YEAR = 4, AU = 149597870.7;
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const months = [0, 3, 6, 9].map((m) => new Date(Date.UTC(2015, m, 1)).toLocaleDateString(lang, { month: "short", timeZone: "UTC" }));
  // les courbes sur un an, calculées une fois : 96 points par pulsar
  const curves = P.map((p) => Array.from({ length: 97 }, (_, k) => { const e = earthAt(J0 + k / 96 * 365.25); return romerDelay(AU, p.bv, p.lam, e.r, e.lam); }));
  return anim2d(canvas, { span: N * YEAR, u0: 0.04, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, M = 10, i = Math.min(N - 1, Math.floor(u * N)), f = u * N - i, p = P[i], jd = J0 + f * 365.25, e = earthAt(jd);
    const L = narrow ? [0, 0, W, H * 0.5] : [0, 0, W * 0.48, H], R = narrow ? [0, H * 0.5, W, H * 0.5] : [W * 0.5, 0, W * 0.5, H];
    const n1 = text(ctx, tr("ps-t", "The pulses arrive early or late with the Earth's place on its orbit"), M, 17, { size: 12.5, bold: true, maxW: W - 2 * M });
    const top = 17 + n1 * 16;
    // 1. l'orbite, le pulsar et ses fronts d'onde
    const Ro = Math.min(L[2] * 0.3, (L[3] - top - 70) * 0.36), cx = L[0] + L[2] / 2, cy = top + 50 + (L[3] - top - 70) / 2;
    const ux = Math.cos(p.lam * D2R), uy = Math.sin(p.lam * D2R);                 // vers le pulsar (écran : y vers le haut)
    ctx.save(); ctx.beginPath(); ctx.rect(L[0], top + 34, L[2], L[3] - top - 34); ctx.clip();
    const sp = Ro * 0.45, ph = (f * 40) % 1;
    for (let k = -4; k <= 4; k++) { const d = (k + ph) * sp, ox = cx - ux * d, oy = cy + uy * d;
      ctx.strokeStyle = "rgba(124,58,237,.28)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox - uy * Ro * 2.2, oy - ux * Ro * 2.2); ctx.lineTo(ox + uy * Ro * 2.2, oy + ux * Ro * 2.2); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, Ro, 0, TAU); ctx.stroke();
    disc(ctx, cx, cy, 7, "#fde68a", FLAT, 1.4);
    const ex = cx + Ro * e.r * Math.cos(e.lam), ey = cy - Ro * e.r * Math.sin(e.lam);
    disc(ctx, ex, ey, 5, "#dbeafe", GLOBE, 1.4);
    // la distance de la Terre le long de la direction du pulsar : c'est elle, divisée par c, qui avance ou retarde l'impulsion
    const along = e.r * Math.cos(e.lam - p.lam * D2R), fx = cx + ux * Ro * along, fy = cy - uy * Ro * along;
    ctx.strokeStyle = PSR; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(fx, fy); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = PSR; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(fx, fy); ctx.stroke();
    arrow(ctx, cx + ux * Ro * 1.15, cy - uy * Ro * 1.15, cx + ux * Ro * 1.45, cy - uy * Ro * 1.45, PSR, 1.6);
    { const lab = tr("ps-to", "to {p}").replace("{p}", p.name); ctx.font = "10px system-ui, sans-serif"; const w = ctx.measureText(lab).width;
      const al = ux > 0.3 ? 0 : ux < -0.3 ? 1 : 0.5, x0 = Math.max(L[0] + M, Math.min(L[0] + L[2] - M - w, cx + ux * Ro * 1.5 - al * w));
      text(ctx, lab, x0, cy - uy * Ro * 1.5 + (uy > 0 ? -4 : 12), { size: 10, c: PSR }); }
    const d = romerDelay(AU, p.bv, p.lam, e.r, e.lam);
    const lw = L[2] - 2 * M;
    text(ctx, `${p.name} · β = ${nf(p.bv, 1)}° · ${new Date((jd - 2440587.5) * 864e5).toLocaleDateString(lang, { day: "numeric", month: "short", timeZone: "UTC" })}`, L[0] + M, top + 12, { size: 10.5, c: SOFT, mono: true, maxW: lw });
    text(ctx, (d < 0 ? tr("ps-early", "pulses {s} s early") : tr("ps-late", "pulses {s} s late")).replace("{s}", nf(Math.abs(d), 1)), L[0] + M, top + 28, { size: 11.5, bold: true, c: PSR, maxW: lw });
    // 2. le retard des huit pulsars sur un an
    const X0 = R[0] + 44, X1 = R[0] + R[2] - 10, Yt = R[1] + (narrow ? 40 : top + 52), Yb = R[1] + R[3] - (narrow ? 84 : 76);
    const X = (k) => X0 + k / 96 * (X1 - X0), Y = (s) => (Yt + Yb) / 2 - s / 520 * (Yb - Yt) / 2;
    text(ctx, tr("ps-axis", "arrival time minus a steady clock (s), over one year"), X0 - 38, Yt - 24, { size: 10.5, c: SOFT, maxW: X1 - X0 + 38 });
    for (const v of [-500, -250, 0, 250, 500]) { ctx.strokeStyle = v ? "#ebe8e1" : "#cfcac0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y(v)); ctx.lineTo(X1, Y(v)); ctx.stroke();
      text(ctx, `${v > 0 ? "+" : ""}${nf(v)}`, X0 - 4, Y(v) + 3.5, { size: 9.5, c: SOFT, align: "right" }); }
    months.forEach((m, k) => text(ctx, m, X(k * 24) + 2, Yb + 13, { size: 9.5, c: SOFT }));
    curves.forEach((c, k) => { ctx.strokeStyle = k === i ? PSR : "rgba(124,58,237,.22)"; ctx.lineWidth = k === i ? 2.2 : 1; ctx.beginPath(); c.forEach((v, j) => (j ? ctx.lineTo(X(j), Y(v)) : ctx.moveTo(X(j), Y(v)))); ctx.stroke(); });
    { const x = X(f * 96); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, Yt); ctx.lineTo(x, Yb); ctx.stroke(); disc(ctx, x, Y(d), 4, PSR); }
    text(ctx, tr("ps-amp", "half-swing (A/c)·cos β = {s} s").replace("{s}", nf(p.romer, 1)), X1, Yb + 28, { size: 10.5, c: INK, align: "right", maxW: X1 - X0 });
    stamp2d(ctx, W, tr("ps-st", "orbit to scale; wave fronts not to scale; one year shown in four seconds"), false, H);
  } });
}
