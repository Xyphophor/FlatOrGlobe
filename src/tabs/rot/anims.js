// Animations de l'onglet rot (2026-10-04, demande du propriétaire : « on parle de détecter un
// mouvement, ça parlera plus »). Trois instruments, chacun montré en train de détecter :
//  - rotAnimRing : deux impulsions laser en sens contraires dans un anneau qui tourne ; celle qui
//    suit la rotation arrive en retard. En dessous, les franges qui défilent devant le détecteur
//    à la fréquence mesurée (Wettzell G), à celle du globe, du disque, et figées pour le plan au repos ;
//  - rotAnimFall : la chute de Reich (Freiberg, 158,5 m) en temps réel, déviation vers l'est agrandie ;
//  - rotAnimSid : jour sidéral et jour solaire, vue de dessus, et l'heure où l'étoile se cache derrière
//    la cheminée, nuit après nuit.
// Les nombres viennent de logic.js / des données ; les agrandissements sont imprimés (règle 1).
import { anim2d, arrow, text, disc, stamp2d, pow10, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { ringRows, fallRows, OMEGA_REF } from "./logic.js";

const C_MS = 299792458, D2R = Math.PI / 180;
const BEAM_A = "#0f766e", BEAM_B = "#7c3aed";

/* ---- 1. l'anneau ---------------------------------------------------------------------- */
export function mountRing(canvas, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const G = ringRows().find((r) => r.id === "G");
  const EPS = 0.08;                                            // v/c dessiné (bord de l'anneau / lumière)
  const epsTrue = OMEGA_REF * Math.sin(G.lat * D2R) * (G.a / 2) / C_MS, exag = EPS / epsTrue;
  const SLOW = 200, LAP = 2.6, CYCLE = 4.2;                    // franges ralenties ×200 ; un tour de lumière en 2,6 s
  const rows = [
    [tr("an-ring-m", "Wettzell G, measured"), G.f, INK],
    [tr("an-ring-g", "globe, Ω sin φ"), G.fGlobe, GLOBE],
    [tr("an-ring-d", "disc turning about the pole"), G.fDisc, FLAT],
    [tr("an-ring-0", "plane at rest"), 0, FLAT],
  ];
  return anim2d(canvas, { span: 4 * CYCLE, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const tau = u * 4 * CYCLE, narrow = W < 560;
    // panneau anneau
    const pw = narrow ? W : W * 0.46, ph = narrow ? H * 0.52 : H;
    const s = Math.min(pw, ph - 50) * 0.62, cx = pw / 2, cy = 26 + (ph - 50) / 2 + 4, r = s / 2;
    const om = (EPS * (4 * s / LAP)) / r;                       // rad/s dessinés : bord à v = ε c
    const rot = (x, y, a) => [cx + x * Math.cos(a) - y * Math.sin(a), cy - (x * Math.sin(a) + y * Math.cos(a))];
    const alpha = om * tau;
    // l'anneau (carré) tourné, sens direct (vu de dessus, hémisphère nord)
    const corners = [[-r, r], [-r, -r], [r, -r], [r, r]];      // départ coin haut-gauche, sens direct = vers le bas d'abord
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath();
    corners.forEach((p, i) => { const q = rot(p[0], p[1], alpha); i ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.closePath(); ctx.stroke();
    // point sur le périmètre, abscisse curviligne σ ∈ [0, 4s) depuis le coin de départ, sens direct
    const onRing = (sig, a) => { sig = ((sig % (4 * s)) + 4 * s) % (4 * s); const k = Math.floor(sig / s), f = (sig - k * s) / s;
      const p = corners[k], q = corners[(k + 1) % 4]; return rot(p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, a); };
    // impulsions : dans le repère de l'anneau, celle qui suit la rotation avance à c(1 − ε), l'autre à c(1 + ε)
    const tc = tau % CYCLE, c = (4 * s) / LAP;
    const dA = Math.min(c * (1 - EPS) * tc, 4 * s), dB = Math.min(c * (1 + EPS) * tc, 4 * s);
    const arrA = dA >= 4 * s, arrB = dB >= 4 * s;
    const trail = (d, sgn, col) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = 0.35; ctx.beginPath();
      for (let k = 0; k <= 24; k++) { const q = onRing(sgn * Math.max(0, d - 0.18 * s + (0.18 * s * k) / 24), alpha); k ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke(); ctx.globalAlpha = 1; };
    if (!arrA) trail(dA, 1, BEAM_A); if (!arrB) trail(dB, -1, BEAM_B);
    disc(ctx, ...onRing(dA, alpha), 5, BEAM_A); disc(ctx, ...onRing(-dB, alpha), 5, BEAM_B);
    // le détecteur, au coin de départ (il tourne avec l'anneau)
    const [dx, dy] = onRing(0, alpha);
    disc(ctx, dx, dy, 7, arrB ? (arrA ? "#fde68a" : "#e9d5ff") : PAPER, INK, 1.4);
    // flèche de rotation
    ctx.strokeStyle = SOFT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, -0.3 - alpha, -1.9 - alpha, true); ctx.stroke();
    const ea = -1.9 - alpha; arrow(ctx, cx + r * 0.42 * Math.cos(ea + 0.15), cy + r * 0.42 * Math.sin(ea + 0.15), cx + r * 0.42 * Math.cos(ea), cy + r * 0.42 * Math.sin(ea), SOFT, 1.2, 6);
    text(ctx, "Ω sin φ", cx, cy + 4, { size: 11, c: SOFT, align: "center" });
    text(ctx, tr("an-ring-t1", "with the turn: arrives late"), 8, ph - 24, { size: 10.5, c: BEAM_A });
    text(ctx, tr("an-ring-t2", "against the turn: arrives early"), 8, ph - 10, { size: 10.5, c: BEAM_B });
    if (arrB && !arrA) text(ctx, tr("an-ring-wait", "one pulse in, the other still running"), cx, 30, { size: 11, c: INK, align: "center", bold: true });
    if (arrA) text(ctx, `Δt ∝ Ω sin φ · ${tr("an-ring-real", "real: Δt =")} ${pow10(4 * G.A * OMEGA_REF * Math.sin(G.lat * D2R) / C_MS ** 2)} s`, cx, 30, { size: 10.5, c: INK, align: "center" });
    // franges qui défilent devant le détecteur
    const x0 = narrow ? 10 : W * 0.5, y0 = narrow ? ph + 8 : 34, sw = W - x0 - 10, rh = Math.min(48, ((narrow ? H - ph - 8 : H - 46) - 4) / 4);
    text(ctx, tr("an-ring-fr", "fringes past the detector (slowed ×{s})").replace("{s}", SLOW), x0, y0 - 8 + (narrow ? 8 : 0), { size: 10.5, c: SOFT });
    rows.forEach(([lab, f, col], i) => {
      const y = y0 + (narrow ? 8 : 0) + i * rh, bh = rh - 22, ph0 = (f / SLOW) * tau;
      text(ctx, `${lab}: ${nf(f, 1)} Hz`, x0, y + 10, { size: 10.5, c: col });
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y + 14, sw, bh); ctx.clip();
      const per = 22;                                           // une frange = 22 px
      for (let x = -per; x < sw + per; x += 2) { const v = 0.5 + 0.5 * Math.cos(2 * Math.PI * ((x / per) - ph0)); ctx.fillStyle = `rgba(29,78,216,${(0.08 + 0.75 * v).toFixed(3)})`; ctx.fillRect(x0 + x, y + 14, 2, bh); }
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + sw / 2, y + 12); ctx.lineTo(x0 + sw / 2, y + 16 + bh); ctx.stroke();
    });
    stamp2d(ctx, W, tr("an-ring-st", "not to scale — turn per lap of light ×{x}").replace("{x}", pow10(exag)), true, H);
  } });
}

/* ---- 2. la chute vers l'est ------------------------------------------------------------- */
export function mountFall(canvas, tr, lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const R = fallRows().find((r) => r.who === "Reich"), g = 9.81, K = 1000;
  const T = R.t, HOLD = 2.4, SPAN = T + HOLD;
  const cosf = Math.cos(R.lat * D2R), dv = OMEGA_REF * R.h * cosf * 1000;   // mm/s : le haut va plus vite vers l'est
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = Math.min(u * SPAN, T), top = 34, bot = H - 52, ppm = (bot - top) / R.h, cx = W * 0.3;
    const east = (tt) => K * (OMEGA_REF * g * tt ** 3 * cosf / 3) * ppm;          // m -> px, agrandi ×K
    // le puits
    ctx.fillStyle = "#efe9dd"; ctx.fillRect(cx - 66, top - 6, 162, bot - top + 6); ctx.fillStyle = PAPER; ctx.fillRect(cx - 50, top - 6, 130, bot - top + 6);
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(10, bot); ctx.lineTo(W - 10, bot); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = SOFT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, bot); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, tr("an-fall-plumb", "plumb line"), cx - 6, bot - 8, { size: 10, c: SOFT, align: "right" });
    // le trajet prévu par le globe (tracé), et la bille
    ctx.strokeStyle = "rgba(29,78,216,.35)"; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let k = 0; k <= 40; k++) { const tt = (T * k) / 40, y = top + 0.5 * g * tt * tt * ppm; k ? ctx.lineTo(cx + east(tt), y) : ctx.moveTo(cx + east(tt), y); } ctx.stroke();
    const y = top + 0.5 * g * t * t * ppm;
    disc(ctx, cx, y, 5, null, FLAT, 1.4);                        // le plat : rien ne dévie
    disc(ctx, cx + east(t), y, 6, GLOBE);
    // ce qui est mesuré au fond : Reich, ± son erreur, la prévision du globe, le zéro plat
    const xm = cx + K * (R.d / 1000) * ppm, xe = K * (R.e / 1000) * ppm;
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm - xe, bot + 10); ctx.lineTo(xm + xe, bot + 10); ctx.moveTo(xm, bot + 4); ctx.lineTo(xm, bot + 16); ctx.stroke();
    text(ctx, `${tr("an-fall-m", "measured")} ${nf(R.d, 1)} ± ${nf(R.e, 1)} mm`, xm + 8, bot + 14, { size: 10.5 });
    text(ctx, `${tr("an-fall-g", "globe")} ${nf(R.dGlobe, 1)} mm · ${tr("an-fall-f", "flat 0")}`, xm + 8, bot + 28, { size: 10.5, c: GLOBE });
    // l'explication : le haut du puits va plus vite vers l'est que le fond
    const ax = cx + 104;
    arrow(ctx, ax, top + 2, ax + 40, top + 2, GLOBE, 1.8); arrow(ctx, ax, bot - 34, ax + 34, bot - 34, GLOBE, 1.4);
    text(ctx, `${tr("an-fall-top", "top")}: ω(R + h)`, ax, top + 18, { size: 10.5, c: GLOBE });
    text(ctx, `+${nf(dv, 1)} mm/s ${tr("an-fall-faster", "faster east")}`, ax, top + 31, { size: 10.5, c: GLOBE });
    text(ctx, `${tr("an-fall-bot", "bottom")}: ωR`, ax, bot - 20, { size: 10.5, c: GLOBE });
    text(ctx, `${tr("an-fall-who", "Reich, Freiberg 1831")} · h = ${nf(R.h, 1)} m · t = ${nf(t, 2)} s`, 8, 16, { size: 11, bold: true });
    text(ctx, tr("an-fall-east", "east →"), W - 8, bot - 8, { size: 10, c: SOFT, align: "right" });
    stamp2d(ctx, W, tr("an-fall-st", "eastward offset enlarged ×{k} · fall in real time").replace("{k}", K), true, H);
  } });
}

/* ---- 3. jour sidéral, jour solaire --------------------------------------------------------- */
export function mountSid(canvas, tr) {
  const SID = 86164.0905, ADV = 86400 - SID, DAYS = 6, PERDAY = 3, EXO = 6;    // pas orbital dessiné ×6
  const hms = (s) => { s = ((s % 86400) + 86400) % 86400; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.round(s % 60); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`; };
  return anim2d(canvas, { span: DAYS * PERDAY, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const days = u * DAYS, narrow = W < 560, lw = narrow ? W : W * 0.55, lh = narrow ? H * 0.58 : H;
    // vue de dessus : le Soleil, un arc d'orbite, la Terre qui tourne ; l'étoile très loin, vers le haut
    const sx = lw * 0.5, sy = lh * 0.86, R = Math.min(lw * 0.42, lh * 0.66), lam0 = 90 * D2R;
    const lam = lam0 + (days * 2 * Math.PI / 365.2422) * EXO;    // longitude de la Terre (dessinée)
    disc(ctx, sx, sy, 11, "#fde68a", FLAT, 1.4);
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx, sy, R, -(lam0 + 0.75), -(lam0 - 0.1), false); ctx.stroke();
    const ex = sx + R * Math.cos(lam), ey = sy - R * Math.sin(lam), er = Math.min(26, R * 0.14);
    // rotation : le méridien de l'observateur fait face à l'étoile (vers le haut) à minuit sidéral du jour 0
    const psi = 90 * D2R + days * 2 * Math.PI + (lam - lam0);     // un tour par jour solaire + le pas orbital : un tour de plus par an
    disc(ctx, ex, ey, er, "#dbeafe", GLOBE, 1.4);
    ctx.fillStyle = "rgba(21,26,33,.18)"; ctx.beginPath(); const sunA = Math.atan2(-(sy - ey), sx - ex);
    ctx.arc(ex, ey, er, -sunA + Math.PI / 2, -sunA + Math.PI * 1.5); ctx.fill();          // côté nuit
    const ox = ex + er * Math.cos(psi), oy = ey - er * Math.sin(psi);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + (er + 30) * Math.cos(psi), ey - (er + 30) * Math.sin(psi)); ctx.stroke();
    disc(ctx, ox, oy, 3.5, INK);
    // directions : l'étoile (parallèle, toujours vers le haut) et le Soleil
    const dStar = Math.abs(((psi - Math.PI / 2) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    const dSun = Math.abs(((psi - Math.atan2(-(sy - ey), sx - ex)) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    arrow(ctx, ex, ey - er - 34, ex, ey - er - 60, dStar < 0.06 ? GLOBE : FAINT, dStar < 0.06 ? 2.2 : 1.2);
    text(ctx, "★", ex, ey - er - 64, { size: 14, c: dStar < 0.06 ? GLOBE : SOFT, align: "center" });
    if (dSun < 0.06) text(ctx, tr("an-sid-noon", "noon"), ex + er + 6, ey + er + 4, { size: 11, c: FLAT, bold: true });
    if (dStar < 0.06) text(ctx, tr("an-sid-tr", "the star on the meridian"), ex + 14, ey - er - 66, { size: 11, c: GLOBE, bold: true });
    text(ctx, `${tr("an-sid-day", "day")} ${Math.floor(days) + 1}`, 8, 16, { size: 11, bold: true });
    text(ctx, tr("an-sid-why", "one turn against the stars is shorter than one against the Sun"), 8, lh - 8, { size: 10.5, c: SOFT });
    // la cheminée : l'étoile se cache chaque nuit 3 min 56 s plus tôt à l'horloge
    const x0 = narrow ? 10 : W * 0.58, y0 = narrow ? lh + 8 : 46, cw = W - x0 - 10, ch = (narrow ? H - lh - 14 : H - 60);
    const edge = x0 + cw * 0.62;
    const chH = Math.min(ch * 0.45, 120);
    ctx.fillStyle = "#e7e3da"; ctx.fillRect(edge, y0, cw * 0.38, chH); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(edge, y0, cw * 0.38, chH);
    const n = Math.floor(days), f = days - n, sy2 = y0 + chH * 0.45;
    const pxPerS = (cw * 0.62) / 1800;                            // 30 min de ciel dans la largeur
    const hide = (k) => 22 * 3600 - k * ADV;                      // heure du soir où l'étoile se cache, nuit k
    const clock = hide(n) - 1800 + f * 2000;                      // l'horloge défile pendant la nuit montrée
    const sxStar = edge - (hide(n) - clock) * pxPerS;
    if (sxStar < edge) text(ctx, "★", sxStar, sy2 + 5, { size: 15, c: GLOBE, align: "center" });
    text(ctx, `${tr("an-sid-night", "night")} ${n + 1} · ${hms(clock)}`, x0, y0 - 10 + (narrow ? 8 : 0), { size: 11, bold: true, mono: true });
    for (let k = 0; k <= n; k++) if (k < n || clock >= hide(k))
      text(ctx, `${tr("an-sid-night", "night")} ${k + 1}: ${hms(hide(k))}${k ? `  (−${k} × 3 min 56 s)` : ""}`, x0, y0 + chH + 16 + k * 14, { size: 10.5, c: k ? GLOBE : INK, mono: true });
    stamp2d(ctx, W, tr("an-sid-st", "not to scale — orbital step drawn ×{k}; times true").replace("{k}", EXO), true, H);
  } });
}
