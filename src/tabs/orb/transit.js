// Onglet orb : les passages de Vénus (epic37/UC04 ; 1769 le 2026-11-18, 1761 et 2012 le 2026-11-19). Animation : les contacts
// de 1761, 1769 et 2012 l'un après l'autre (neuf : 2012 n'a gardé que le contact III).
// À gauche (en haut au téléphone) : la Terre vue du Soleil à l'instant du contact, les stations qui l'ont chronométré, chacune
// colorée par le décalage que la taille de la Terre donne à son contact (P, calculé avec DE440). À droite (en bas) : le
// diagramme de Delisle, l'heure observée moins celle d'un Soleil infiniment loin (D) contre P ; un Soleil à la bonne distance
// met les points sur la diagonale (pente A_DE/A), un Soleil proche les mettrait sur une droite presque verticale.
import { anim2d, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { rows, fit, slope, slopeFor, YEARS } from "./transit-logic.js";

const CONTACTS = ["I", "II", "III", "IV"], EARLY = "#2563eb", LATE = "#dc2626";
const colP = (P) => { const x = Math.max(-1, Math.min(1, P / 420)), a = 0.35 + 0.65 * Math.abs(x); return x < 0 ? `rgba(37,99,235,${a})` : `rgba(220,38,38,${a})`; };

export function mountTransit(canvas, tr, lang = "en") {
  const ALL = rows().filter((r) => r.used), SEG = 5.2;
  const SEGS = YEARS.flatMap((y) => CONTACTS.filter((c) => ALL.some((r) => r.year === y && r.contact === c)).map((c) => ({ y, c })));
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const names = { I: tr("tr-c1", "I · Venus first touches the Sun (outside)"), II: tr("tr-c2", "II · Venus wholly on the Sun (inside)"), III: tr("tr-c3", "III · Venus starts to leave (inside)"), IV: tr("tr-c4", "IV · Venus leaves the Sun (outside)") };
  const dates = { 1761: tr("tr-d1761", "6 June 1761"), 1769: tr("tr-d1769", "3 June 1769"), 2012: tr("tr-d2012", "6 June 2012") };
  return anim2d(canvas, { span: SEGS.length * SEG, u0: 0.48, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, M = 10, si = Math.min(SEGS.length - 1, Math.floor(u * SEGS.length)), f = u * SEGS.length - si, { y: Y0, c: C } = SEGS[si];
    const R = ALL.filter((r) => r.year === Y0), F = fit(Y0), k = slope(Y0), ci = CONTACTS.indexOf(C);
    const n1 = text(ctx, tr("tr-t", "Transit of Venus, {d}: the contacts at {n} places").replace("{d}", dates[Y0]).replace("{n}", nf(new Set(R.map((r) => r.station)).size)), M, 17, { size: 12.5, bold: true, maxW: W - 2 * M });
    const top = 17 + n1 * 16 + 4;
    text(ctx, names[C], M, top + 10, { size: 11, c: INK, bold: true, maxW: W - 2 * M });
    const L = narrow ? [0, top + 20, W, (H - top) * 0.45] : [0, top + 20, W * 0.42, H - top - 60], Rp = narrow ? [0, top + 34 + (H - top) * 0.45, W, (H - top) * 0.55 - 96] : [W * 0.44, top + 20, W * 0.56, H - top - 60];
    // 1. la Terre vue du Soleil, les stations de ce contact
    const cur = R.filter((r) => r.contact === C), shown = Math.ceil(cur.length * Math.min(1, f / 0.75));
    const re = Math.min(L[2] * 0.4, L[3] * 0.4), cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2;
    disc(ctx, cx, cy, re, "#eef4fb", "#9fb3c8", 1.2);
    ctx.strokeStyle = "#d6dee8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - re, cy); ctx.lineTo(cx + re, cy); ctx.stroke();
    const seen = new Map();
    for (const r of cur.slice(0, shown)) seen.set(r.station, r);
    for (const r of seen.values()) disc(ctx, cx + r.x * re, cy - r.y * re, 4.2, colP(r.P), "#fff", 0.8);
    text(ctx, tr("tr-earth", "the Earth seen from the Sun (line: the ecliptic)"), cx, L[1] + L[3] - 2, { size: 10, c: SOFT, align: "center", maxW: L[2] - 2 * M });
    { const y = L[1] + 6; disc(ctx, L[0] + M + 4, y, 4, EARLY); text(ctx, tr("tr-early", "contact earlier"), L[0] + M + 12, y + 4, { size: 10, c: INK });
      disc(ctx, L[0] + L[2] / 2 + 4, y, 4, LATE); text(ctx, tr("tr-late", "later"), L[0] + L[2] / 2 + 12, y + 4, { size: 10, c: INK }); }
    // 2. le diagramme de Delisle du passage
    const X0 = Rp[0] + 46, X1 = Rp[0] + Rp[2] - 10, Yt = Rp[1] + 22, Yb = Rp[1] + Rp[3] - 24, lim = 450;
    const X = (p) => X0 + (p + lim) / (2 * lim) * (X1 - X0), Yy = (d) => Yb - (d + lim) / (2 * lim) * (Yb - Yt);
    for (const v of [-400, -200, 0, 200, 400]) { ctx.strokeStyle = v ? "#ebe8e1" : "#cfcac0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Yy(v)); ctx.lineTo(X1, Yy(v)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(v), Yt); ctx.lineTo(X(v), Yb); ctx.stroke();
      text(ctx, nf(v), X0 - 4, Yy(v) + 3.5, { size: 9.5, c: SOFT, align: "right" }); text(ctx, nf(v), X(v), Yb + 13, { size: 9.5, c: SOFT, align: "center" }); }
    text(ctx, tr("tr-ax-y", "observed − a Sun infinitely far (s)"), X0 - 42, Yt - 8, { size: 10, c: SOFT, maxW: X1 - X0 + 42 });
    text(ctx, tr("tr-ax-x", "shift the Earth's size gives at 149.6 million km (s)"), X1, Yb + 26, { size: 10, c: SOFT, align: "right", maxW: X1 - X0 });
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Yt, X1 - X0, Yb - Yt); ctx.clip();
    { const s5 = slopeFor(5000); ctx.strokeStyle = FLAT; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(-lim / s5), Yy(-lim)); ctx.lineTo(X(lim / s5), Yy(lim)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(-lim), Yy(-lim * k)); ctx.lineTo(X(lim), Yy(lim * k)); ctx.stroke();
    for (const r of R) if (CONTACTS.indexOf(r.contact) < ci) disc(ctx, X(r.P), Yy(r.D), 2.2, "rgba(29,78,216,.35)");
    for (const r of cur.slice(0, shown)) disc(ctx, X(r.P), Yy(r.D), 3, colP(r.P));
    ctx.restore();
    text(ctx, tr("tr-flat", "a Sun at 5,000 km"), X(lim / slopeFor(5000)) + 6, Yt + 12, { size: 10, c: FLAT });
    text(ctx, tr("tr-fit", "slope {k}: {a} million km").replace("{k}", nf(k, 3)).replace("{a}", nf(F.a / 1e6, 2)), X1 - 4, Yy(-lim * k * 0.75) + 14, { size: 10.5, bold: true, c: GLOBE, align: "right" });
    stamp2d(ctx, W, tr("tr-st", "Earth's disc to scale with the stations; diagram to scale of its axes"), false, H);
  } });
}
