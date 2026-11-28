// Les figures des dips mesurés en avion (contribution flightdip, 2026-10-15) :
//  1. #fdEnv, les lignes de visée (comme « The surface you never drew » de l'onglet dip) : chaque photo est une ligne
//     partie de sa hauteur au-dessus du relief de l'horizon, sur une même verticale, inclinée par SON dip mesuré ;
//     aucun sol n'est dessiné. Règle 1 : hauteurs × ex et planète ÷ ex, même échelle dans les deux sens ; chaque ligne
//     touche le cercle du rayon que son dip donne seul (logic.js sightline) ; « montrer la surface » trace le cercle
//     de 6 371 km et celui du rayon ajusté.
//  2. #fdPlot, le dip en fonction de la hauteur, à l'échelle de ses axes : les lectures (écran, EXIF, et accélération
//     retirée), la sphère de 6 371 km (lumière droite ; tirets par photo : à travers l'air du jour), le rayon ajusté, et
//     le plan (0°, ses tirets au-dessus du niveau dans l'air du jour, et son meilleur cas : un bord dans la brume plus
//     un décalage constant).
// Un clic sur une ligne ou un point montre la photo, l'angle et ce que chaque modèle prédit (#fdInfo).
import { drawFitBox } from "../../../core/fitbox.js";
import { setupCanvas } from "../../../core/canvas.js";
import { keyClickable } from "../../../core/a11y.js";
import { dipGlobe, dipPlane, pointNumbers, sightline, hEff, dipCorrected, R0 } from "./logic.js";

const COL = { ink: "#151a21", mute: "#5b6470", faint: "#9aa1ab", globe: "#1d4ed8", flat: "#b45309", fit: "#6b7280", f1: "#0f766e", f2: "#7c3aed", sel: "#b91c1c", paper: "#fdfdfc" };
const SMALL = "10px ui-monospace, Menlo, monospace", HEAD = "600 11px ui-monospace, Menlo, monospace";

export function mountFlightDip(container, t, lang, D) {
  const P = D.FD_POINTS, F = D.FD_FITS, A = D.FD_ALTS;
  const env = container.querySelector("#fdEnv"), plot = container.querySelector("#fdPlot"), info = container.querySelector("#fdInfo"), btn = container.querySelector("#fdEnvBtn"), offBtn = container.querySelector("#fdOffBtn");
  const num = (x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const st = { pick: -1, surf: false, off: false, envHits: [], plotHits: [] };
  const fitFace = F.find((f) => f.name === "screen, no refraction"), fitOff0 = F.find((f) => f.name === "screen, no refraction, constant offset");
  const plane = A.find((a) => a.name === "plane, haze edge, no refraction, constant offset"), globeOff = A.find((a) => a.name === "globe, R = 6,371 km, no refraction, constant offset");
  const colOf = (p) => (p.flight === 1 ? COL.f1 : COL.f2);

  function drawEnv() {
    if (!env) return;
    const { ctx, W } = setupCanvas(env);
    if (!W) return;
    const H = Math.round(Math.min(460, Math.max(280, W * 0.55)));
    if (env._h !== H) { env.style.height = H + "px"; env._h = H; return drawEnv(); }
    ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H);
    const hs = P.map((p) => hEff(p)), hMax = Math.max(...hs), xMax = 1.15 * Math.max(...P.map((p) => Math.sqrt(2 * R0 * hEff(p))));
    const padL = 46, padR = 10, padT = W < 520 ? 50 : 26, padB = 28, w = W - padL - padR, h = H - padT - padB;
    // même échelle dans les deux sens ; ex : les hauteurs ET la chute de la plus petite sphère tracée tiennent dans le cadre
    const s = w / xMax, Rmin = Math.min(R0, fitFace.R * 1000), ex = Math.max(1, Math.floor((h / s) / (hMax * 1.08 + (xMax * xMax) / (2 * Rmin))));
    const yTop = hMax * ex * 1.08;
    const X = (x) => padL + x * s, Y = (y) => padT + (yTop - y) * s;
    ctx.strokeStyle = COL.faint; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(0), Y(0) + 4); ctx.lineTo(X(0), Y(yTop)); ctx.stroke(); ctx.setLineDash([]);
    st.envHits = [];
    P.forEach((p, i) => {
      const L = sightline(hEff(p), Math.max(0.05, p.dip - (st.off ? fitOff0.b : 0)), ex), sel = i === st.pick;
      const x1 = xMax, y1 = L.y0 + L.slope * x1;
      ctx.strokeStyle = sel ? COL.ink : colOf(p); ctx.lineWidth = sel ? 2.6 : 1.3; ctx.globalAlpha = sel ? 1 : 0.85;
      ctx.beginPath(); ctx.moveTo(X(0), Y(L.y0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke(); ctx.globalAlpha = 1;
      if (sel) { ctx.fillStyle = COL.sel; ctx.beginPath(); ctx.arc(X(L.xTangent), Y(L.yTangent), 4.5, 0, 7); ctx.fill(); }
      ctx.fillStyle = sel ? COL.ink : COL.mute; ctx.beginPath(); ctx.arc(X(0), Y(L.y0), sel ? 5 : 3.2, 0, 7); ctx.fill();
      st.envHits.push({ i, a: [X(0), Y(L.y0)], b: [X(x1), Y(y1)] });
    });
    if (st.surf) {
      const arc = (R, col, dash, label) => {
        const Rd = R / ex; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath();
        for (let k = 0; k <= 200; k++) { const x = (xMax * k) / 200; if (x > Rd) break; const y = Math.sqrt(Rd * Rd - x * x) - Rd; k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
        ctx.stroke(); ctx.setLineDash([]);
        const xl = Math.min(xMax * 0.92, Rd * 0.95), yl = Math.sqrt(Math.max(0, Rd * Rd - xl * xl)) - Rd;
        ctx.font = SMALL; ctx.fillStyle = col; ctx.textAlign = "right"; ctx.fillText(label, X(xl) - 4, Y(yl) + 14);
      };
      arc(R0, COL.sel, [7, 4], `R = ${num(6371)} km`);
      const ff = st.off ? fitOff0 : fitFace;
      arc(ff.R * 1000, COL.fit, [3, 3], `${t("fd-fit", "fitted")} ${num(ff.R)} km`);
    }
    ctx.font = SMALL; ctx.fillStyle = COL.mute; ctx.textAlign = "left";
    const stampTxt = t("fd-env-stamp", "{n} photographs on one vertical · heights ×{ex}, planet ÷{ex} · {km} km across", { n: P.length, ex: num(ex), km: num(xMax / 1000) }) + (st.off ? ` · ${t("fd-env-off", "zero error subtracted")}` : "");
    // le canvas ne revient pas à la ligne : coupé aux « · » quand il ne tient pas
    const parts = stampTxt.split(" · "), lines = [];
    for (const p of parts) { const tr = lines.length ? `${lines[lines.length - 1]} · ${p}` : p; if (lines.length && ctx.measureText(tr).width <= W - 12) lines[lines.length - 1] = tr; else lines.push(p); }
    lines.slice(0, 3).forEach((l, k) => ctx.fillText(l, 6, 14 + 12 * k));
    ctx.fillText(t("fd-env-legend", "teal: flight 1 · violet: flight 2 · click a line"), 6, H - 8);
  }

  function drawPlot() {
    if (!plot) return;
    const { ctx, W } = setupCanvas(plot);
    if (!W) return;
    // la légende sous l'axe : elle ne cache aucun point
    const cols = W < 520 ? 1 : 2, nLeg = 7, legH = Math.ceil(nLeg / cols) * 13 + 8;
    const H = Math.round(Math.min(420, Math.max(280, W * 0.5))) + legH;
    if (plot._h !== H) { plot.style.height = H + "px"; plot._h = H; return drawPlot(); }
    ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H);
    const padL = 40, padR = 12, padT = 18, padB = 34 + legH, w = W - padL - padR, h = H - padT - padB;
    const xMax = 10.5, yMin = -1.5, yMax = 4;
    const X = (km) => padL + (km / xMax) * w, Y = (deg) => padT + h - ((deg - yMin) / (yMax - yMin)) * h;
    ctx.strokeStyle = "rgba(91,100,112,.25)"; ctx.lineWidth = 1; ctx.font = SMALL; ctx.fillStyle = COL.mute;
    for (let k = 0; k <= 10; k += 2) { ctx.beginPath(); ctx.moveTo(X(k), padT); ctx.lineTo(X(k), padT + h); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(num(k), X(k), padT + h + 13); }
    for (let d = -1; d <= 4; d++) { ctx.beginPath(); ctx.moveTo(padL, Y(d)); ctx.lineTo(padL + w, Y(d)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(`${d < 0 ? "−" : ""}${num(Math.abs(d))}°`, padL - 5, Y(d) + 3); }
    ctx.textAlign = "center"; ctx.fillText(t("fd-axis-h", "height above the horizon's terrain, km"), padL + w / 2, padT + h + 27);
    ctx.textAlign = "right"; ctx.fillText(t("fd-axis-up", "above level"), padL + w - 4, Y(-1.3));
    const curve = (f, col, wdt, dash) => { ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.setLineDash(dash); ctx.beginPath(); for (let k = 0; k <= 200; k++) { const km = (xMax * k) / 200, y = f(km * 1000); k ? ctx.lineTo(X(km), Y(y)) : ctx.moveTo(X(km), Y(y)); } ctx.stroke(); ctx.setLineDash([]); };
    curve((m) => dipGlobe(m), COL.globe, 1.6, [5, 3]);
    curve((m) => dipGlobe(m, fitFace.R * 1000), COL.fit, 1.4, [2, 2]);
    curve((m) => globeOff.b + dipGlobe(m), COL.globe, 1, [1, 3]);
    curve(() => 0, COL.flat, 2, []);
    curve((m) => plane.b + dipPlane(m, plane.param * 1000), COL.flat, 1.4, [5, 3]);
    const tick = (x, y, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.stroke(); };
    st.plotHits = [];
    P.forEach((p, i) => {
      const x = X(hEff(p) / 1000), sel = i === st.pick, c = dipCorrected(p);
      tick(x, Y(p.globeDipA), COL.globe); tick(x, Y(-p.flatEsc), COL.flat);
      if (c != null) {
        const s = p.sigTilt ?? 0;
        ctx.strokeStyle = COL.fit; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 5, Y(c - s)); ctx.lineTo(x + 5, Y(c + s)); ctx.stroke();
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + 2, Y(c) - 3); ctx.lineTo(x + 8, Y(c) + 3); ctx.moveTo(x + 2, Y(c) + 3); ctx.lineTo(x + 8, Y(c) - 3); ctx.stroke();
      }
      ctx.strokeStyle = colOf(p); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, Y(p.dip - 0.1)); ctx.lineTo(x, Y(p.dip + 0.1)); ctx.stroke();
      ctx.fillStyle = sel ? COL.sel : colOf(p); ctx.beginPath(); ctx.arc(x, Y(p.dip), sel ? 5.5 : 4, 0, 7); ctx.fill();
      ctx.strokeStyle = colOf(p); ctx.beginPath(); ctx.arc(x, Y(p.dipExif), 2.5, 0, 7); ctx.stroke();
      st.plotHits.push({ i, p: [x, Y(p.dip)] });
    });
    // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : l'ajustement tel quel ; χ²/ν avec l'erreur de chaque lecture
    // (affichage à 0,1°, accélération), r des abaissements contre √h ; en haut à gauche, où aucune lecture ne tombe
    drawFitBox(ctx, padL + 6, padT + 4, { R: fitFace.R, range: `${num(fitFace.lo)}–${num(fitFace.hi)} km`, r: fitFace.r, scatter: `${num(fitFace.rms, 2)}° rms`, chi2nu: fitFace.chi2nu,
      title: `${num(fitFace.n)} ${t("fd-box-n", "readings, at face value")}`, col: COL.fit, size: W < 480 ? 9 : 10 });
    // légende
    const L = [[COL.globe, [5, 3], t("fd-l-globe", "globe, R = 6,371 km, straight light")], [COL.globe, [], t("fd-l-globea", "ticks: globe in the day's air")],
      [COL.fit, [2, 2], t("fd-l-fit", "fitted at face value")], [COL.globe, [1, 3], t("fd-l-off", "globe + constant offset")],
      [COL.fit, [], t("fd-l-acc", "×: acceleration removed")],
      [COL.flat, [], t("fd-l-plane", "plane: 0°; ticks: in the day's air")], [COL.flat, [5, 3], t("fd-l-haze", "plane: haze edge + offset")]];
    ctx.font = SMALL; ctx.textAlign = "left";
    const lw = (W - 16) / cols;
    L.forEach(([c, dash, s], k) => {
      const x0 = 8 + (k % cols) * lw, y0 = padT + h + 42 + Math.floor(k / cols) * 13;
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 18, y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = COL.ink; ctx.fillText(s, x0 + 24, y0 + 3);
    });
  }

  function drawInfo() {
    if (!info) return;
    if (st.pick < 0) { info.innerHTML = `<span class="sub">${t("fd-info-none", "Click a sightline or a point to see its photograph and its numbers.")}</span>`; return; }
    const p = P[st.pick], n = pointNumbers(p);
    const when = `${p.local.replace(" ", " · ")} (UTC${p.offset.replace("-", "−")})`;
    const gps = Math.abs(p.gpsLag) > 30 ? t("fd-info-stale", "GPS frozen: the aircraft was there {m} min earlier", { m: num(p.gpsLag / 60, 1) }) : t("fd-info-live", "GPS live");
    const tilt = n.corr == null ? t("fd-info-unres", "acceleration unresolved (turn)") : `${t("fd-info-tilt", "acceleration removed")} <b>${num(n.corr, 2)}°</b> (${p.tilt < 0 ? "−" : "+"}${num(Math.abs(p.tilt), 2)}° ± ${num(p.sigTilt ?? 0, 2)}°)`;
    info.innerHTML = `<img src="/${p.src}" alt="${t("fd-info-alt", "Screenshot of the Theodolite app, the reticle on the horizon")}" style="width:100%;height:auto;border-radius:6px;margin-bottom:8px">`
      + `<b>${t("fd-info-flight", "Flight {f}", { f: p.flight })}</b> · ${when} · ${num(p.lat, 4)}° N, ${num(-p.lon, 4)}° W · ${t("fd-info-heading", "heading")} ${num(p.heading)}°<br>`
      + `${t("fd-info-alt-h", "height")} <b>${num(p.h)} m</b> (${t("fd-info-xpdr", "transponder")} ${num(p.altFt)} ft) · ${t("fd-info-gps", "phone")} ${num(p.hGps)} m, ${gps}<br>`
      + `${t("fd-info-terrain", "terrain at the horizon")} ${num(p.zh)} m, ${num(p.dh / 1000)} km ${t("fd-info-away", "away")} · h′ = ${num(n.he)} m<br>`
      + `${t("fd-info-dip", "dip read on screen")} <b>${num(p.dip, 1)}°</b> (EXIF ${num(p.dipExif, 1)}°) · ${tilt} · ${t("fd-info-self", "alone, it gives")} R = ${num(n.Rself)} km<br>`
      + `<span style="color:var(--globe)">${t("fd-info-globe", "globe")}: ${num(n.globe, 2)}°, ${t("fd-info-air", "in the day's air")} ${num(n.globeA, 2)}° (k = ${num(p.kEff, 2)}), ${t("fd-info-tangent", "horizon")} ${num(n.tangent)} km</span> · `
      + `<span style="color:var(--flat)">${t("fd-info-plane", "plane")}: 0°, ${t("fd-info-esc", "in the day's air {e}° above level", { e: num(n.flatEsc, 2) })}, ${t("fd-info-haze", "or a haze edge at")} ${num(n.flatD)} km</span>`;
  }

  const pick = (i) => { st.pick = st.pick === i ? -1 : i; drawEnv(); drawPlot(); drawInfo(); };
  const segDist = (q, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], wx = q[0] - a[0], wy = q[1] - a[1], L = vx * vx + vy * vy; const u = L ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / L)) : 0; return Math.hypot(q[0] - a[0] - u * vx, q[1] - a[1] - u * vy); };
  const at = (cv, e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  env?.addEventListener("click", (e) => { const q = at(env, e); let best = -1, bd = 10; for (const h of st.envHits) { const d = segDist(q, h.a, h.b); if (d < bd) { bd = d; best = h.i; } } if (best >= 0) pick(best); });
  plot?.addEventListener("click", (e) => { const q = at(plot, e); let best = -1, bd = 12; for (const h of st.plotHits) { const d = Math.hypot(q[0] - h.p[0], q[1] - h.p[1]); if (d < bd) { bd = d; best = h.i; } } if (best >= 0) pick(best); });
  for (const cv of [env, plot]) {
    if (!cv) continue;
    cv.style.cursor = "pointer"; keyClickable(cv);
    cv.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); pick((st.pick + 1 + P.length) % P.length); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); pick((st.pick - 1 + P.length) % P.length); }
      else if (e.key === "Escape") { st.pick = -1; drawEnv(); drawPlot(); drawInfo(); }
    });
  }
  btn?.addEventListener("click", () => { st.surf = !st.surf; btn.textContent = st.surf ? t("fd-hide", "◕ hide the surface") : t("fd-reveal", "◔ show the surface"); drawEnv(); });
  offBtn?.addEventListener("click", () => {
    st.off = !st.off;
    offBtn.textContent = st.off ? t("fd-off-on", "add the zero error back") : t("fd-off", "subtract the fitted zero error ({b}°)", { b: num(fitOff0.b, 2) });
    drawEnv();
  });
  if (offBtn) offBtn.textContent = t("fd-off", "subtract the fitted zero error ({b}°)", { b: num(fitOff0.b, 2) });
  return { start() { drawEnv(); drawPlot(); drawInfo(); }, stop() {} };
}
