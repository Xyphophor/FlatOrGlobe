// Le modèle plat, à son avantage (epic09/UC06), canvas 2D.
// La carte est celle du modèle plat lui-même : azimutale équidistante, pôle
// Nord au centre. On y reporte la bande PUBLIÉE (NASA) telle qu'elle y tombe,
// et l'ombre que le plat prédit avec ses deux paramètres ajustés en SA
// faveur (logic.js : flatFit). Le temps court de 08:26 à 11:46 UT ; les deux
// ombres avancent ensemble.
import { exportBusy } from "../../core/motion.js";
import { ECL_PATHS } from "../../data/presets/ecl.js";
import { flatFit, flatShadow, aeXY, subPoints2027, hhmm, AE_K } from "./logic.js";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";
const ECL_MAP = makeAE();   // = X(aeXY(lat, lon)) : (cx + r sin λ, cy + r cos λ)
import { keyClickable } from "../../core/a11y.js";
import { pixelRatio, fillTextFit } from "../../core/canvas.js";

export function mountFlat(canvas, readsEl, tr) {
  let F = null;
  const st = { t: 0, playing: true, last: 0, raf: null, vis: true };
  const rows = ECL_PATHS["2027"].filter((r) => r.t !== "Limits");
  const T0 = hhmm(rows[0].t), T1 = hhmm(rows.at(-1).t), SPAN = 30;    // 3 h 20 min en 30 s
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { st.playing = false; st.t = 0.5; }
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); });
  keyClickable(canvas); // clavier : Entrée/Espace = pause (epic06/UC03)

  const pubAt = (utH) => {                                   // ligne centrale publiée, interpolée
    const x = (utH - T0) / (2 / 60), i = Math.max(0, Math.min(rows.length - 2, Math.floor(x))), u = x - i;
    const a = rows[i], b = rows[i + 1];
    return { c: [a.c[0] + (b.c[0] - a.c[0]) * u, a.c[1] + (b.c[1] - a.c[1]) * u], alt: a.alt + (b.alt - a.alt) * u };
  };

  function draw() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    F ??= flatFit(ECL_PATHS["2027"]);
    const dpr = pixelRatio(2);
    if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height, Rpx = Math.min(W * 0.46, H * 0.44), cx = W / 2, cy = H / 2 + 8;
    const Rkm = 180 * AE_K, X = (p) => [cx + (p[1] / Rkm) * Rpx, cy + (p[0] / Rkm) * Rpx];   // x = cos λ vers le bas, y = sin λ vers la droite
    const LL = (la, lo) => X(aeXY(la, lo));
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    // epic18 : la carte polaire du moteur commun (aeXY = makeAE tournée de 90°, ici dessinée x ↔ y : c'est
    // makeAE() sans rotation à l'écran, parité testée), avec ses terres, dans la teinte du modèle plat
    drawAEMap(ctx, ECL_MAP, { cx, cy, Rpx, grid: 0, colors: { sea: "#f6ecdc", land: "#e8d3b0", coast: "rgba(180,83,9,.5)", rim: "#b45309" } });
    // bande publiée, reportée sur la carte plate
    const all = ECL_PATHS["2027"];
    ctx.fillStyle = "rgba(15,118,110,.35)"; ctx.beginPath();
    all.forEach((q, i) => { const p = LL(...q.n); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    [...all].reverse().forEach((q) => { const p = LL(...q.s); ctx.lineTo(p[0], p[1]); }); ctx.closePath(); ctx.fill();
    // tracé plat complet (pointillé)
    ctx.strokeStyle = "#b45309"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath();
    F.pts.forEach((p, i) => { const q = X(flatShadow(p.g, F.f)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.setLineDash([]);
    // l'instant courant
    const ut = T0 + st.t * (T1 - T0), g = subPoints2027(ut), pub = pubAt(ut);
    const sP = X(g.s), mP = X(g.m), fl = X(flatShadow(g, F.f)), pb = LL(...pub.c);
    ctx.strokeStyle = "rgba(180,83,9,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sP[0], sP[1]); ctx.lineTo(fl[0], fl[1]); ctx.stroke();
    const sun = ctx.createRadialGradient(sP[0], sP[1], 0, sP[0], sP[1], 12);
    sun.addColorStop(0, "#fff3c4"); sun.addColorStop(0.4, "#f7b733"); sun.addColorStop(1, "rgba(247,183,51,0)");
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(sP[0], sP[1], 12, 0, 7); ctx.fill();
    ctx.fillStyle = "#8b93a0"; ctx.beginPath(); ctx.arc(mP[0], mP[1], 4, 0, 7); ctx.fill();
    ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(fl[0], fl[1], 6, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(pb[0], pb[1], 6, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.stroke();
    // textes
    const hm = (h) => { const s = Math.round(h * 3600); return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}`; };
    ctx.fillStyle = "#151a21"; ctx.font = "600 13px ui-monospace, Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText(`${tr("flat-date", "2 Aug 2027")} · ${hm(ut)} UT`, 10, 18);
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#5b6470";
    fillTextFit(ctx, tr("flat-stamp", "the flat model's own map (azimuthal equidistant) · click: pause"), 10, H - 8, W - 20, { dir: -1 });
    if (readsEl) {
      const d = Math.hypot(...[0, 1].map((k) => flatShadow(g, F.f)[k] - aeXY(...pub.c)[k]));
      const cP = aeXY(...pub.c), lamp = Math.atan2(F.Hs, Math.hypot(cP[0] - g.s[0], cP[1] - g.s[1])) * 180 / Math.PI;
      const html = `<span class="g"><span class="dot" style="background:#0f766e"></span>${tr("flat-read-pub", "published shadow (NASA)")}</span>` +
        `<span class="f"><span class="dot" style="background:#b45309"></span>${tr("flat-read-flat", "flat shadow, best fit")}: <b>${Math.round(d).toLocaleString("en-US")} km</b> ${tr("flat-read-away", "away")}</span>` +
        `<span>${tr("flat-read-alt", "Sun over the published shadow")}: ${tr("flat-read-pubalt", "published")} <b>${pub.alt.toFixed(0)}°</b> · ${tr("flat-read-lamp", "flat lamp")} <b>${lamp.toFixed(0)}°</b></span>` +
        `<span class="sub">f = ${F.f.toFixed(1)} · H☉ ${Math.round(F.Hs).toLocaleString("en-US")} km · H☾ ${Math.round(F.Hm).toLocaleString("en-US")} km</span>`;
      if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
    }
  }
  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      if (st.last && ts - st.last < 32) { st.raf = requestAnimationFrame(step); return; }
      if (st.last) st.t = (st.t + (ts - st.last) / 1000 / SPAN) % 1;
      st.last = ts; draw();
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);
  // export (epic10/UC02) : l'animation rejouée à l'instant t, puis remise en état
  let saved = null;
  canvas.__anim = {
    duration: SPAN,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(t) { st.t = (t / SPAN) % 1; draw(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(); if (st.playing) loop(); },
  };
  return {
    get fit() { return (F ??= flatFit(ECL_PATHS["2027"])); },
    start() { draw(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
  };
}
