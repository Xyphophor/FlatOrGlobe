// Animations de l'onglet sat (epic27, 2026-10-16) : un passage de satellite et le Doppler mesuré à Wettzell,
// et le réseau des récepteurs qui passe de la carte plate à la boule, itération par itération de l'ajustement.
import { anim2d, arrow, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { SAT_DOPPLER as D } from "../../data/presets/sat-doppler.js";

const split = (W, H) => { const narrow = W < 560; return narrow ? { narrow, L: [0, 0, W, H * 0.5], Rp: [0, H * 0.5, W, H * 0.5] } : { narrow, L: [0, 0, W * 0.48, H], Rp: [W * 0.5, 0, W * 0.5, H] }; };
const COLS = ["#1d4ed8", "#0f766e", "#b45309", "#6d28d9", "#c2410c", "#0e7490"];

/* ---- 1. un passage : la géométrie (plan de l'orbite, à l'échelle) et la journée mesurée à Wettzell ---- */
export function mountPass(canvas, tr, lang = "en") {
  const ids = Object.keys(D.passes), Re = 6371, A = 26560, Tsat = 43082, Tday = 86164;
  const all = ids.flatMap((k) => D.passes[k].map((p) => p[1])), lo = Math.min(...all), hi = Math.max(...all);
  return anim2d(canvas, { span: 24, u0: 0.1, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const { narrow, L, Rp } = split(W, H), hour = u * 24;
    // gauche : la Terre et l'orbite dans le plan de l'orbite, à l'échelle ; le satellite et le récepteur tournent
    const k = Math.min(L[2], L[3]) * 0.44 / A, cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2 + 8;
    disc(ctx, cx, cy, Re * k, "#f6ecdc", "#7a6a4f", 1.6);
    ctx.setLineDash([4, 3]); disc(ctx, cx, cy, A * k, null, SEA, 1.1); ctx.setLineDash([]);
    const ts = hour * 3600, as = 2 * Math.PI * ts / Tsat + 1.2, ap = 2 * Math.PI * ts / Tday + 0.4;
    const S = [cx + A * k * Math.cos(as), cy - A * k * Math.sin(as)], P = [cx + Re * k * Math.cos(ap), cy - Re * k * Math.sin(ap)];
    const vs = [-Math.sin(as), -Math.cos(as)], up = [Math.cos(ap), -Math.sin(ap)];
    const d = [S[0] - P[0], S[1] - P[1]], dn = Math.hypot(...d), u1 = [d[0] / dn, d[1] / dn], seen = u1[0] * up[0] + u1[1] * up[1] > 0;
    if (seen) { ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(S[0], S[1]); ctx.stroke(); }
    arrow(ctx, S[0], S[1], S[0] + 34 * vs[0], S[1] + 34 * vs[1], GLOBE, 1.4);
    if (seen) { const c = vs[0] * u1[0] + vs[1] * u1[1]; arrow(ctx, S[0], S[1], S[0] - 34 * c * u1[0], S[1] - 34 * c * u1[1], c < 0 ? GLOBE : FLAT, 3); }
    disc(ctx, S[0], S[1], 5, "#dbeafe", GLOBE, 1.6); disc(ctx, P[0], P[1], 4, INK);
    text(ctx, seen ? tr("an-pass-seen", "above the horizon: heard") : tr("an-pass-hidden", "below the horizon: not heard"), L[0] + 8, L[1] + (narrow ? 34 : 16), { size: 10.5, c: seen ? GLOBE : SOFT, maxW: L[2] - 16 });
    text(ctx, tr("an-pass-orbit", "GPS orbit, 26,560 km"), L[0] + 8, L[1] + L[3] - 10, { size: 10, c: SOFT, maxW: L[2] - 16 });
    // droite : la journée à Wettzell, six satellites, et le curseur
    const X0 = Rp[0] + 44, X1 = Rp[0] + Rp[2] - 10, Y0 = Rp[1] + Rp[3] - 22, Y1 = Rp[1] + (narrow ? 18 : 40);
    const x = (h) => X0 + h / 24 * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
    for (const v of [-500, 0, 500]) if (v > lo && v < hi) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(v)); ctx.lineTo(X1, y(v)); ctx.stroke(); text(ctx, String(v), X0 - 4, y(v) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    ids.forEach((id, j) => {
      const pts = D.passes[id], col = COLS[j % COLS.length];
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath();
      pts.forEach((p, i) => { if (i && p[0] - pts[i - 1][0] < 0.2) ctx.lineTo(x(p[0]), y(p[2])); else ctx.moveTo(x(p[0]), y(p[2])); }); ctx.stroke();
      for (const p of pts) if (p[0] <= hour) disc(ctx, x(p[0]), y(p[1]), 1.7, col);
    });
    for (const h of [0, 6, 12, 18, 24]) text(ctx, `${h} h`, x(h), Y0 + 14, { size: 9.5, c: SOFT, align: "center" });
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(hour), Y1); ctx.lineTo(x(hour), Y0); ctx.stroke();
    text(ctx, tr("an-pass-right", "Wettzell, 2025-04-10: range rate (m/s), 6 satellites"), Rp[0] + 8, Rp[1] + (narrow ? 12 : 24), { size: 10.5, c: SOFT, maxW: Rp[2] - 16 });
    stamp2d(ctx, W, tr("an-pass-st", "left: Earth and orbit to scale, in the orbit's plane"), false);
  } });
}

/* ---- 2. de la carte plate à la boule : les récepteurs à chaque itération (positions de fog) ----
   2026-10-17 (propriétaire : « l'animation n'est pas claire, on est supposé voir un globe ? ») : à gauche une vue 3D
   inclinée qui tourne, une sphère de référence de 6 371 km en fil de fer (dessinée, PAS ajustée), la trace de chaque
   récepteur et une barre d'échelle (le zoom suit l'étendue du réseau) ; à droite la distance de chaque récepteur au centre
   en fonction de sa latitude : au départ tout est dispersé, à la fin tout tombe sur la bande 6 357-6 381 km. */
export function mountBall(canvas, tr, lang = "en") {
  const Hs = D.history, n = Hs.length - 1, north = D.stations.map((s) => s.lat >= 0), drop = D.stations.map((s) => s.drop);
  const nf = (x, d) => x.toLocaleString(lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  const R0 = 6371, EL = 22 * Math.PI / 180;
  const rMax0 = Math.max(...Hs[0].xyz.map((p) => Math.hypot(...p)));
  return anim2d(canvas, { span: 18, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const top = W < 560 ? 52 : 34, bottom = 24, { narrow, L, Rp } = split(W, H - top - bottom); L[1] += top; Rp[1] += top;
    // l'état de départ (plat) tenu 2 s, la fin 4,5 s
    const f = Math.min(1, Math.max(0, (u - 0.11) / 0.64)) * n, i0 = Math.floor(f), i1 = Math.min(n, i0 + 1), w = f - i0;
    const at = (it, k) => Hs[it].xyz[k];
    const pos = Hs[i0].xyz.map((p, k) => p.map((v, j) => v + (at(i1, k)[j] - v) * w));
    const ext = Math.max(R0 * 1.25, ...pos.filter((_, k) => !drop[k]).map((p) => Math.hypot(...p)));
    // titre de phase
    const phase = f < 0.02 ? tr("an-ball-p0", "start: the receivers laid on a flat map, the Doppler not yet fitted")
      : f >= n - 0.01 ? tr("an-ball-p2", "end: the receivers on a ball around the centre the satellites orbit")
      : tr("an-ball-p1", "the fit moves each receiver to where the measured speeds put it");
    text(ctx, phase, 10, 22, { size: narrow ? 11.5 : 13, bold: true, c: f >= n - 0.01 ? GLOBE : INK, maxW: W - 20 });
    // --- gauche : vue 3D inclinée qui tourne (dessin coupé au panneau)
    ctx.save(); ctx.beginPath(); ctx.rect(L[0], L[1], L[2], L[3]); ctx.clip();
    const az = 0.6 + u * Math.PI, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(EL), se = Math.sin(EL);
    const k = Math.min(L[2], L[3] - 30) * 0.45 / ext, cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2;
    const proj = (p) => { const x1 = p[0] * ca + p[1] * sa, y1 = -p[0] * sa + p[1] * ca; return [cx + x1 * k, cy - (p[2] * ce - y1 * se) * k, y1 * ce + p[2] * se]; };
    // sphère de référence : méridiens et parallèles tous les 30°, la face cachée plus pâle
    const arc = (pts) => { for (let j = 1; j < pts.length; j++) { const a = proj(pts[j - 1]), b = proj(pts[j]); ctx.strokeStyle = a[2] < 0 && b[2] < 0 ? "rgba(15,118,110,.10)" : "rgba(15,118,110,.32)"; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } };
    ctx.lineWidth = 1;
    for (let lo = 0; lo < 360; lo += 30) { const pts = []; for (let la = -90; la <= 90; la += 6) { const A = la * Math.PI / 180, B = lo * Math.PI / 180; pts.push([R0 * Math.cos(A) * Math.cos(B), R0 * Math.cos(A) * Math.sin(B), R0 * Math.sin(A)]); } arc(pts); }
    for (let la = -60; la <= 60; la += 30) { const pts = []; for (let lo = 0; lo <= 360; lo += 6) { const A = la * Math.PI / 180, B = lo * Math.PI / 180; pts.push([R0 * Math.cos(A) * Math.cos(B), R0 * Math.cos(A) * Math.sin(B), R0 * Math.sin(A)]); } arc(pts); }
    // l'axe et le centre
    { const a = proj([0, 0, -R0 * 1.15]), b = proj([0, 0, R0 * 1.15]); ctx.strokeStyle = SOFT; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5); ctx.stroke();
    // la carte plate du départ (le plan z = 6 371 km où les récepteurs sont posés), qui s'efface quand l'ajustement avance
    const fade = Math.max(0, 1 - f / 3);
    if (fade > 0) {
      ctx.strokeStyle = `rgba(180,83,9,${0.55 * fade})`; ctx.fillStyle = `rgba(246,236,220,${0.5 * fade})`; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let j = 0; j <= 72; j++) { const A = j / 72 * 2 * Math.PI, q = proj([rMax0 * 1.02 * Math.cos(A), rMax0 * 1.02 * Math.sin(A), 6371]); j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      if (f < 0.5) { const q = proj([rMax0 * 0.7, 0, 6371]); text(ctx, tr("an-ball-map", "flat map"), q[0], q[1] - 8, { size: 11, bold: true, c: FLAT }); }
    }
    // points, du fond vers l'avant
    const order = pos.map((p, s) => [proj(p)[2], s]).sort((a, b) => a[0] - b[0]);
    for (const [, s] of order) {
      if (drop[s]) continue;
      const col = north[s] ? "29,78,216" : "180,83,9", q = proj(pos[s]);
      ctx.fillStyle = q[2] < 0 ? `rgba(${col},.45)` : `rgb(${col})`; ctx.beginPath(); ctx.arc(q[0], q[1], 3.4, 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
    // barre d'échelle (le zoom suit le réseau)
    { const bl = 5000 * k, x0 = L[0] + 10, y0 = L[1] + L[3] - 8; ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + bl, y0); ctx.moveTo(x0, y0 - 4); ctx.lineTo(x0, y0 + 4); ctx.moveTo(x0 + bl, y0 - 4); ctx.lineTo(x0 + bl, y0 + 4); ctx.stroke();
      text(ctx, "5 000 km".replace(" ", lang === "en" ? "," : "\u202f"), x0 + bl + 6, y0 + 4, { size: 10, c: SOFT }); }
    text(ctx, tr("an-ball-ref", "wire sphere: 6,371 km, drawn for reference, not fitted"), L[0] + 10, L[1] + 10, { size: 10, c: SEA, maxW: L[2] - 20 });
    // --- droite : distance au centre en fonction de la latitude
    const X0 = Rp[0] + 52, X1 = Rp[0] + Rp[2] - 10, Y0 = Rp[1] + Rp[3] - 30, Y1 = Rp[1] + 22, rTop = Math.ceil(rMax0 / 5000) * 5000;
    const x = (la) => X0 + (la + 90) / 180 * (X1 - X0), y = (r) => Y0 - r / rTop * (Y0 - Y1);
    for (let v = 0; v <= rTop; v += 5000) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(v)); ctx.lineTo(X1, y(v)); ctx.stroke(); text(ctx, nf(v, 0), X0 - 4, y(v) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    ctx.fillStyle = "rgba(29,78,216,.15)"; ctx.fillRect(X0, y(6381), X1 - X0, Math.max(2, y(6357) - y(6381)));
    for (const la of [-90, 0, 90]) text(ctx, `${la}°`, x(la), Y0 + 14, { size: 9.5, c: SOFT, align: "center" });
    pos.forEach((p, s) => { if (drop[s]) return; const r = Math.hypot(...p), la = Math.asin(p[2] / r) * 180 / Math.PI; disc(ctx, x(la), y(r), 3, north[s] ? GLOBE : FLAT); });
    text(ctx, tr("an-ball-r", "distance from the centre (km) against latitude"), Rp[0] + 8, Rp[1] + 8, { size: 10.5, c: SOFT, maxW: Rp[2] - 16 });
    text(ctx, tr("an-ball-band", "band: 6,357–6,381 km"), X1, y(6381) - 6, { size: 10, c: GLOBE, align: "right" });
    const h = Hs[Math.round(f)];
    text(ctx, `${tr("an-ball-it", "iteration")} ${Math.round(f)}/${n} · ${tr("an-ball-rms", "unexplained")} ${nf(h.rms, h.rms < 1 ? 3 : 0)} m/s · ${tr("an-ball-plane", "off the best plane")} ${nf(h.plane, 0)} km`, 10, H - 8, { size: 11, bold: true, mono: true, maxW: W - 20, up: true });
  } });
}

/* ---- 3. Kepler et la validation d'une orbite (2026-10-18, propriétaire : « le graphique des orbites n'est pas dans la carte,
   et une petite animation expliquant comment on valide une orbite ») -------------------------------------------------------
   À gauche, les trois constellations À L'ÉCHELLE (rayon de la Terre et demi-grands axes médians de la solution) ; chaque
   satellite tourne à sa période T = 2π √(a³/GM_sys), GM_sys étant la médiane des GM que les satellites de ce système ont
   donnés chacun pour soi : les trois périodes viennent des données, et le tableau montre a³/T² identique. À droite, valider une
   orbite : la vitesse vers Wettzell que l'orbite ajustée PRÉDIT (trait plein, tracé d'avance), les mesures qui arrivent au fil
   de la journée (points), et leur écart en mm/s. Une journée (24 h) jouée en 24 s : temps × 3 600. */
export function mountKep(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  const S = D.sats.filter((s) => !s.drop), med = (v) => { v = [...v].sort((p, q) => p - q); return v[v.length >> 1]; };
  const SYSK = [["R", "GLONASS", FLAT], ["G", "GPS", GLOBE], ["E", "Galileo", SEA]].map(([k, n, c]) => {
    const g = S.filter((s) => s.id[0] === k), a = med(g.map((s) => s.a)), gm = med(g.map((s) => s.gm));
    const T = 2 * Math.PI * Math.sqrt((a * 1e3) ** 3 / (gm * 1e14));       // s
    return { k, n, c, a, gm, T, ph: { R: 0.3, G: 2.1, E: 4.2 }[k] };
  });
  const P = D.passes.G32, sid = "G32", Re = 6371, SPAN = 24;
  const lo = Math.min(...P.map((p) => p[1])), hi = Math.max(...P.map((p) => p[1]));
  const res = P.map((p) => (p[1] - p[2]) * 1000), rmsAll = Math.sqrt(res.reduce((s, x) => s + x * x, 0) / res.length);
  const LBL = SYSK.map((s) => ({ a: `${nf(s.a)} km`, T: `${Math.floor(s.T / 3600)} h ${String(Math.round((s.T % 3600) / 60)).padStart(2, "0")}`,
    k: `${nf((s.a * 1e3) ** 3 / s.T ** 2 * 4 * Math.PI ** 2 / 1e14, 5)} × 10¹⁴` }));
  // 2026-11-25 (propriétaire : la carte Kepler « désastreuse ») : dessinée dans un repère logique de 700 px de large au plus,
  // mis à l'échelle (uniforme) de la largeur réelle : sur une carte de 1 080 px les textes gardent leur taille relative
  return anim2d(canvas, { span: SPAN, u0: 0.3, draw(ctx, W0, H0, u) {
    const Z = Math.min(2.4, Math.max(1, W0 / 700)), W = W0 / Z, H = H0 / Z;
    ctx.save(); ctx.scale(Z, Z); drawKep(ctx, W, H, u); ctx.restore();
  } });
  function drawKep(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 620, hour = u * 24, t = hour * 3600;
    const top = narrow ? 30 : 26, bottom = narrow ? 40 : 22;
    const A = narrow ? [0, top, W, (H - top - bottom) * 0.4] : [0, top, W * 0.46, H - top - bottom];
    const B = narrow ? [0, top + A[3] + 6, W, H - top - bottom - A[3] - 6] : [W * 0.48, top, W * 0.52, H - top - bottom];
    text(ctx, `${tr("an-kep-clock", "time")} ${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.floor((hour % 1) * 60)).padStart(2, "0")} UTC · ${D.day}`, 10, 16, { size: 11, bold: true, c: SOFT });
    // A. les orbites à l'échelle
    const tabH = narrow ? 54 : 66;
    const cx = A[0] + (narrow ? A[2] * 0.3 : A[2] / 2), cy = A[1] + (A[3] - tabH) / 2 + 6, k = Math.min(narrow ? A[2] * 0.28 : A[2] * 0.45, (A[3] - tabH) / 2 - 10) / 29600;
    disc(ctx, cx, cy, Re * k, "#dbeafe", "#7a6a4f", 1.4);
    text(ctx, tr("an-kep-earth", "Earth"), cx, cy + 4, { size: 10, c: SOFT, align: "center" });
    SYSK.forEach((s) => {
      ctx.strokeStyle = s.c; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, s.a * k, 0, 2 * Math.PI); ctx.stroke(); ctx.globalAlpha = 1;
      const th = s.ph + 2 * Math.PI * t / s.T, x = cx + s.a * k * Math.cos(th), y = cy - s.a * k * Math.sin(th);
      disc(ctx, x, y, 4.5, s.c, INK, 1);
    });
    // le tableau : a, T, et n² a³ = GM (le même pour les trois)
    const tx = narrow ? A[0] + A[2] * 0.62 : A[0] + 12, ty = narrow ? A[1] + 18 : A[1] + A[3] - tabH + 10;
    if (narrow) {
      SYSK.forEach((s, i) => { text(ctx, `${s.n}`, tx, ty + i * 40, { size: 10.5, bold: true, c: s.c }); text(ctx, `a ${LBL[i].a} · T ${LBL[i].T}`, tx, ty + i * 40 + 13, { size: 9.5, c: SOFT, maxW: W - tx - 6 }); text(ctx, `n²a³ = ${LBL[i].k}`, tx, ty + i * 40 + 26, { size: 9.5, mono: true, c: INK, maxW: W - tx - 6 }); });
    } else {
      const xs = [tx, tx + 78, tx + 150, tx + 210];
      [[tr("an-kep-sys", "system"), 0], ["a", 1], ["T", 2], ["n²a³ (m³/s²)", 3]].forEach(([h, j]) => text(ctx, h, xs[j], ty, { size: 9.5, c: SOFT }));
      SYSK.forEach((s, i) => { const y = ty + 15 + i * 14; text(ctx, s.n, xs[0], y, { size: 10, bold: true, c: s.c }); text(ctx, LBL[i].a, xs[1], y, { size: 10 }); text(ctx, LBL[i].T, xs[2], y, { size: 10 }); text(ctx, LBL[i].k, xs[3], y, { size: 10, mono: true }); });
    }
    // B. valider une orbite : la vitesse prédite par l'orbite, puis la mesure
    const hd = narrow ? 50 : 42, X0 = B[0] + 46, X1 = B[0] + B[2] - 10, Yt = B[1] + hd, mainH = (B[3] - hd) * 0.6, Y0 = Yt + mainH, rY1 = Y0 + 26, rY0 = B[1] + B[3] - 16;
    const h0 = 0, h1 = 24, x = (h) => X0 + (h - h0) / (h1 - h0) * (X1 - X0);
    const lim = Math.ceil(Math.max(-lo, hi) / 200) * 200, y = (v) => Yt + (lim - v) / (2 * lim) * mainH;
    const rl = 8, ry = (r) => rY1 + (rl - r) / (2 * rl) * (rY0 - rY1);
    text(ctx, `${tr("an-kep-val", "Validating an orbit")}: ${sid} ${tr("an-kep-over", "over Wettzell")}`, B[0] + 8, B[1] + 8, { size: 11, bold: true, c: INK, maxW: B[2] - 12 });
    text(ctx, tr("an-kep-steps", "the fitted orbit predicts the speed toward the receiver; the measurement comes after"), B[0] + 8, B[1] + 22, { size: 9.5, c: SOFT, maxW: B[2] - 12 });
    for (const v of [-lim, 0, lim]) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(v)); ctx.lineTo(X1, y(v)); ctx.stroke(); text(ctx, `${v > 0 ? "+" : ""}${nf(v)}`, X0 - 4, y(v) + 4, { size: 9, c: SOFT, align: "right" }); }
    text(ctx, "m/s", X0 + 4, Yt + 12, { size: 9, c: SOFT });
    // les mesures déjà arrivées
    const seen = P.filter((p) => p[0] <= hour);
    ctx.fillStyle = "rgba(21,26,33,.55)"; ctx.beginPath(); for (const p of seen) { ctx.moveTo(x(p[0]) + 2.6, y(p[1])); ctx.arc(x(p[0]), y(p[1]), 2.6, 0, 2 * Math.PI); } ctx.fill();
    // la prédiction, d'un bout à l'autre, par-dessus les mesures (tronçons séparés aux trous)
    ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.3; ctx.beginPath();
    P.forEach((p, i) => { const gap = i && p[0] - P[i - 1][0] > 0.1; (i && !gap) ? ctx.lineTo(x(p[0]), y(p[2])) : ctx.moveTo(x(p[0]), y(p[2])); }); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(hour), Yt); ctx.lineTo(x(hour), rY0); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, tr("an-kep-pred", "predicted by the orbit"), X1, y(lim) + 12, { size: 9.5, c: GLOBE, align: "right" });
    text(ctx, `● ${tr("an-kep-meas", "measured")}`, X1, y(lim) + 25, { size: 9.5, c: INK, align: "right" });
    // l'écart, en mm/s
    ctx.strokeStyle = "#e7e3da"; for (const r of [-rl, 0, rl]) { ctx.beginPath(); ctx.moveTo(X0, ry(r)); ctx.lineTo(X1, ry(r)); ctx.stroke(); text(ctx, `${r > 0 ? "+" : ""}${r}`, X0 - 4, ry(r) + 3, { size: 9, c: SOFT, align: "right" }); }
    ctx.fillStyle = SEA; ctx.beginPath(); seen.forEach((p) => { const r = (p[1] - p[2]) * 1000; ctx.moveTo(x(p[0]) + 2, ry(r)); ctx.arc(x(p[0]), ry(r), 2, 0, 2 * Math.PI); }); ctx.fill();
    const rs = seen.map((p) => (p[1] - p[2]) * 1000), rms = rs.length ? Math.sqrt(rs.reduce((s, v) => s + v * v, 0) / rs.length) : 0;
    text(ctx, `${tr("an-kep-res", "measured − predicted (mm/s)")}${rs.length ? `: rms ${nf(rms, 1)} mm/s, ${nf(rs.length)} ${tr("an-kep-pts", "points")}` : ""}`, X0, rY1 - 6, { size: 9.5, c: SEA, maxW: X1 - X0 });
    for (const h of [0, 6, 12, 18, 24]) text(ctx, `${h} h`, x(h), rY0 + 12, { size: 9, c: SOFT, align: "center" });
    stamp2d(ctx, W, `${tr("an-kep-st", "orbits to scale · one day in 24 s: time")} ×3,600 · ${tr("an-kep-st2", "speed scale")} ±${nf(lim)} m/s, ${tr("an-kep-st3", "residuals")} ±${rl} mm/s`, false, H);
  }
}
