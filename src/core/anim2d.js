// Animation canvas 2D en boucle (2026-10-04, onglets rot et orb) : ce que les onglets
// ecl/flat.js et ecl/selen.js écrivaient chacun à la main. Le canvas se met à la taille
// CSS × DPR, un clic (ou Entrée/Espace) met en pause, l'animation ne tourne que visible,
// reste à l'arrêt si « réduire les animations » est demandé, et s'exporte en vidéo par
// canvas.__anim (begin / frameAt / end, comme les autres).
//   const a = anim2d(canvas, { span: 20, draw: (ctx, W, H, u) => … });   // u ∈ [0, 1)
//   a.start(); a.stop();
import { keyClickable } from "./a11y.js";
import { pixelRatio, fillTextFit } from "./canvas.js";
import { fillTextSub } from "./subscript.js";
import { reducedMotion, exportBusy } from "./motion.js";

// fps : cadence plafond à l'écran (30 par défaut, ménage les machines lentes ; 60 pour une animation légère où des points
// rapides saccaderaient à 30 -- 2026-10-17, colonne d'air de atmo)
export function anim2d(canvas, { span = 20, draw, u0 = 0.15, fps = 30 }) {
  const minDt = 1000 / fps - 2;
  const st = { u: u0, playing: !reducedMotion(), last: 0, raf: null, vis: true, exporting: false };
  if (!st.playing) st.u = 0.5;
  const paint = () => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, r.width, r.height, st.u, st.playing);
  };
  const loop = () => {
    // pendant un export vidéo, la boucle de la page reste arrêtée (2026-10-07 : relancée par l'IntersectionObserver,
    // elle se disputait le canvas avec l'export -- image saccadée, repartie du début)
    if (st.raf || st.exporting || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      if (st.last && ts - st.last < minDt) { st.raf = requestAnimationFrame(step); return; }
      if (st.last) st.u = (st.u + Math.min(0.2, (ts - st.last) / 1000) / span) % 1;
      st.last = ts; paint();
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  };
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); else paint(); });
  keyClickable(canvas);
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);
  let saved = null;
  canvas.__anim = {
    duration: span,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.exporting = true; },
    frameAt(t) { st.u = (t / span) % 1; paint(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); st.exporting = false; saved = null; paint(); if (st.playing) loop(); },
  };
  return {
    start() { paint(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
    redraw: paint,
    /** Lecture ou pause commandée par la page (un bouton commun à plusieurs animations). */
    setPlaying(v) { st.playing = !!v && !reducedMotion(); st.last = 0; if (st.playing) loop(); else paint(); },
  };
}

/* ---- petits outils de dessin partagés par ces animations ---------------- */
export const INK = "#151a21", SOFT = "#5b6470", FAINT = "#9aa1ab", GLOBE = "#1d4ed8", FLAT = "#b45309", PAPER = "#fdfdfc", SEA = "#0f766e";
export const MONO = "ui-monospace, Menlo, monospace";
export function arrow(ctx, x1, y1, x2, y2, col = INK, w = 1.6, head = 7) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); if (L < 0.5) return;
  const h = Math.min(head, L * 0.6);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * h * 0.6, y2 - Math.sin(a) * h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4)); ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
/** o.maxW : coupé en lignes (fillTextFit) au-delà, vers le bas, ou vers le haut si o.up ; renvoie le nombre de lignes. */
export function text(ctx, s, x, y, o = {}) {
  ctx.font = `${o.bold ? "600 " : ""}${o.size || 11}px ${o.mono ? MONO : "system-ui, sans-serif"}`;
  ctx.fillStyle = o.c || INK; ctx.textAlign = o.align || "left";
  if (o.maxW) return fillTextFit(ctx, s, x, y, o.maxW, { lineH: Math.round((o.size || 11) * 1.3), dir: o.up ? -1 : 1 });
  fillTextSub(ctx, s, x, y); return 1;
}
export const disc = (ctx, x, y, r, fill, stroke, w = 1.4) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); } };
/** Tampon de la règle 1, en haut à droite : « not to scale — … » ou une échelle déclarée. */
// bottomH : en bas ; reserve : largeur laissée libre à gauche (une barre d'échelle) ; coupé en lignes si trop long (téléphone)
// (s'il ne tient pas sur une ligne à côté de la barre, il passe au-dessus d'elle, en pleine largeur)
export function stamp2d(ctx, W, s, warn = true, bottomH = 0, reserve = 0) {
  ctx.font = `10px system-ui, sans-serif`;
  const above = bottomH && reserve && ctx.measureText(s).width > W - 12 - reserve;
  return text(ctx, s, W - 6, bottomH ? bottomH - (above ? 22 : 6) : 13, { size: 10, c: warn ? FLAT : SOFT, align: "right", maxW: W - 12 - (above ? 0 : reserve), up: !!bottomH });
}
/** Puissance de dix lisible : 2.1e11 -> « 2 × 10¹¹ ». */
export function pow10(x) {
  const e = Math.floor(Math.log10(x)), m = Math.round(x / 10 ** e), sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return `${m === 1 ? "" : m + " × "}10${String(e).split("").map((c) => (c === "-" ? "⁻" : sup[+c])).join("")}`;
}
