// Onglet orb : l'écho radar de Vénus (epic37/UC03, 2026-11-18). Animation : les 25 échos de Millstone du printemps 1961, un
// par un. À gauche (en haut au téléphone), les orbites de la Terre et de Vénus vues du nord, à l'échelle, et l'impulsion qui
// part, touche Vénus et revient, avec son temps de vol imprimé ; à droite (en bas), l'unité astronomique que donne chaque
// écho, réduite avec les orbites de Newcomb (ce que l'équipe a imprimé) et avec celles d'aujourd'hui (DE440, fog build
// orb-radar). Les positions DESSINÉES de Vénus viennent des éléments képlériens approchés de Standish (dessin seulement) ;
// tous les nombres écrits viennent du tableau II et de sa réduction.
import { anim2d, arrow, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { sun } from "../../core/ephemeris.js";
import { echoes, echoDistance, AU_IAU } from "./radar-logic.js";

const D2R = Math.PI / 180, TAU = 2 * Math.PI, VENUS = "#a16207";
const jdOfMs = (ms) => ms / 864e5 + 2440587.5;
/** Vénus héliocentrique (longitude rad, distance UA) : E. M. Standish, « Keplerian Elements for Approximate Positions of the
 *  Major Planets » (JPL), tableau 1 (1800-2050) ; inclinaison négligée (3,4°), dessin seulement. */
function venusAt(jd) {
  const T = (jd - 2451545) / 36525, a = 0.72333566 + 0.0000039 * T, e = 0.00677672 - 0.00004107 * T;
  const L = 181.9790995 + 58517.81538729 * T, w = 131.60246718 + 0.00268329 * T, M = ((L - w) % 360) * D2R;
  let E = M; for (let i = 0; i < 6; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  return { lam: nu + w * D2R, r: a * (1 - e * Math.cos(E)) };
}
const earthAt = (jd) => { const s = sun(jd); return { lam: (s.lon + 180) * D2R, r: s.distAU }; };
const smooth = (x) => x * x * (3 - 2 * x);

export function mountRadar(canvas, tr, lang = "en") {
  const E = echoes(), N = E.length, SPAN = N * 1.6;
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const day = (t) => new Date(t).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const t0 = Date.UTC(1961, 2, 1), t1 = Date.UTC(1961, 4, 22), LO = -1000, HI = 2200;   // axe : a.u. − 149 597 000 km
  return anim2d(canvas, { span: SPAN, u0: 0.53, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, M = 10;
    const x = u * N, i = Math.min(N - 1, Math.floor(x)), p = x - i, e = E[i], nxt = E[Math.min(N - 1, i + 1)];
    const done = p > 0.8 ? i : i - 1;                                        // échos déjà revenus
    const tNow = e.t + (i < N - 1 ? smooth(Math.max(0, (p - 0.8) / 0.2)) * (nxt.t - e.t) : 0);
    // mise en page : orbites à gauche (en haut), graphique à droite (en bas)
    const L = narrow ? [0, 0, W, H * 0.52] : [0, 0, W * 0.5, H], R = narrow ? [0, H * 0.52, W, H * 0.48] : [W * 0.5, 0, W * 0.5, H];
    const n1 = text(ctx, tr("rd-t", "Radar echoes from Venus, Millstone, spring 1961"), M, 17, { size: 12.5, bold: true, maxW: (narrow ? W : L[2]) - 2 * M });
    // 1. les orbites, vues du nord de l'écliptique, à l'échelle
    const top = 17 + n1 * 16 + 4, rows = 3, infoH = rows * 15 + 6;
    const Ro = Math.min(L[2] * 0.38, (L[3] - top - infoH - 16) * 0.5), cx = L[0] + L[2] / 2, cy = top + infoH + Ro + 4;
    const jd = jdOfMs(tNow), Ea = earthAt(jd), Va = venusAt(jd);
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1;
    for (const rr of [1, 0.7233]) { ctx.beginPath(); ctx.arc(cx, cy, Ro * rr, 0, TAU); ctx.stroke(); }
    disc(ctx, cx, cy, 7, "#fde68a", FLAT, 1.4);
    const ex = cx + Ro * Ea.r * Math.cos(Ea.lam), ey = cy - Ro * Ea.r * Math.sin(Ea.lam), vx = cx + Ro * Va.r * Math.cos(Va.lam), vy = cy - Ro * Va.r * Math.sin(Va.lam);
    ctx.strokeStyle = "rgba(29,78,216,.25)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(vx, vy); ctx.stroke(); ctx.setLineDash([]);
    disc(ctx, vx, vy, 4.5, "#fef3c7", VENUS, 1.4); disc(ctx, ex, ey, 5, "#dbeafe", GLOBE, 1.4);
    text(ctx, tr("rd-venus", "Venus"), vx + (vx < cx ? -8 : 8), vy - 8, { size: 10, c: VENUS, align: vx < cx ? "right" : "left" });
    text(ctx, tr("rd-earth", "Earth"), ex + (ex < cx ? -9 : 9), ey + 14, { size: 10, c: GLOBE, align: ex < cx ? "right" : "left" });
    // l'impulsion : aller (p 0 → 0,4), retour (0,4 → 0,8)
    if (p < 0.8) { const f = p < 0.4 ? p / 0.4 : 2 - p / 0.4, px = ex + (vx - ex) * f, py = ey + (vy - ey) * f;
      disc(ctx, px, py, 3.2, p < 0.4 ? GLOBE : "#60a5fa"); }
    // ce qu'on lit : la date, le temps de vol (imprimé), la distance qu'il donne
    const clock = p < 0.8 ? e.tau * p / 0.8 : e.tau;
    const lw = L[2] - 2 * M;
    text(ctx, `${day(e.t)} · ${e.ut} UT`, L[0] + M, top + 12, { size: 10.5, c: SOFT, mono: true, maxW: lw });
    text(ctx, tr("rd-tau", "echo flight time {t} s").replace("{t}", nf(clock, p < 0.8 ? 1 : 4)), L[0] + M, top + 27, { size: 11, bold: true, c: GLOBE, maxW: lw });
    text(ctx, p < 0.8 ? tr("rd-wait", "the pulse is on its way") : tr("rd-d", "c τ / 2 = {d} million km").replace("{d}", nf(echoDistance(e.tau) / 1e6, 3)), L[0] + M, top + 42, { size: 10.5, c: INK, maxW: lw });
    // 2. l'unité astronomique de chaque écho
    const X0 = R[0] + (narrow ? 46 : 52), X1 = R[0] + R[2] - 10, Yt = R[1] + (narrow ? 26 : top + 30), Yb = R[1] + R[3] - (narrow ? 138 : 96);
    const X = (t) => X0 + (t - t0) / (t1 - t0) * (X1 - X0), Y = (km) => Yb - (km - 149597000 - LO) / (HI - LO) * (Yb - Yt);
    text(ctx, tr("rd-axis", "astronomical unit from each echo: 149,597,000 km + …"), X0 - (narrow ? 40 : 46), Yt - 12, { size: 10.5, c: SOFT, maxW: X1 - X0 + 40 });
    ctx.lineWidth = 1;
    for (let v = -1000; v <= 2000; v += 500) { const yy = Y(149597000 + v); ctx.strokeStyle = "#ebe8e1"; ctx.beginPath(); ctx.moveTo(X0, yy); ctx.lineTo(X1, yy); ctx.stroke();
      text(ctx, `${v > 0 ? "+" : ""}${nf(v)}`, X0 - 4, yy + 3.5, { size: 9.5, c: SOFT, align: "right" }); }
    for (const [mo, d] of [[2, 1], [3, 1], [4, 1]]) { const tt = Date.UTC(1961, mo, d), xx = X(tt); ctx.strokeStyle = "#ebe8e1"; ctx.beginPath(); ctx.moveTo(xx, Yt); ctx.lineTo(xx, Yb); ctx.stroke();
      text(ctx, new Date(tt).toLocaleDateString(lang, { month: "short", timeZone: "UTC" }), xx + 3, Yb + 13, { size: 9.5, c: SOFT }); }
    // la valeur d'aujourd'hui
    { const yy = Y(AU_IAU); ctx.strokeStyle = INK; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(X0, yy); ctx.lineTo(X1, yy); ctx.stroke(); ctx.setLineDash([]); }
    for (let k = 0; k <= done; k++) { const q = E[k], xx = X(q.t);
      ctx.strokeStyle = FAINT; ctx.lineWidth = 1; disc(ctx, xx, Y(q.newcomb), 2.6, PAPER, FAINT, 1.2);
      ctx.strokeStyle = GLOBE; ctx.beginPath(); ctx.moveTo(xx, Y(q.ours - q.err)); ctx.lineTo(xx, Y(q.ours + q.err)); ctx.stroke();
      disc(ctx, xx, Y(q.ours), k === done && p > 0.8 ? 3.6 : 2.6, GLOBE); }
    if (done >= 0) { const q = E[done];
      text(ctx, tr("rd-au", "this echo: {a} km").replace("{a}", nf(q.ours)), X1, Yt + 2, { size: 10.5, bold: true, c: GLOBE, align: "right" }); }
    // légende : une entrée par ligne, chacune peut passer à la ligne (téléphone, français)
    { const lx = X0 - 22, lw2 = X1 - lx; let ly = Yb + 30;
      disc(ctx, lx - 8, ly - 4, 3, GLOBE); ly += 13 * text(ctx, tr("rd-l-ours", "reduced with today's orbits (DE440), printed error bar"), lx, ly, { size: 10, c: INK, maxW: lw2 }) + 2;
      disc(ctx, lx - 8, ly - 4, 2.6, PAPER, FAINT, 1.2); ly += 13 * text(ctx, tr("rd-l-newc", "as printed in 1962, with Newcomb's orbits"), lx, ly, { size: 10, c: INK, maxW: lw2 }) + 2;
      ctx.strokeStyle = INK; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(lx - 14, ly - 4); ctx.lineTo(lx - 2, ly - 4); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, tr("rd-l-iau", "today's value, 149,597,870.7 km"), lx, ly, { size: 10, c: INK, maxW: lw2 }); }
    stamp2d(ctx, W, tr("rd-st", "orbits to scale; Sun, planets and pulse not to scale; each 4-to-7-minute echo shown in about a second"), false, H);
  } });
}
