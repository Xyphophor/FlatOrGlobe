// Moteur des vitrines animées (2026-10-25) : un enchaînement de scènes dessinées en fonction pure du temps, chacune
// ponctuée d'une étiquette et de deux phrases qui apparaissent mot à mot, une frise de progression en bas, un clic
// pour la pause et le contrat __anim de l'export vidéo. Sorti de results/reel.js (la vitrine des méthodes, dont le
// dessin est inchangé) pour la vitrine du tunnel de orb. Une vitrine = ses scènes { key, d, num? } et ses dessins.
import { setupCanvas } from "./canvas.js";
import { wrapText } from "./export.js";
import { reducedMotion, frameStep, exportBusy } from "./motion.js";

export const REEL_SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const REEL_MONO = "ui-monospace, Menlo, monospace";
export const REEL_COL = { paper: "#fbfaf7", ink: "#151a21", soft: "#5b6470", faint: "#9aa1ab", globe: "#1d4ed8", flat: "#b45309" };

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);

export function label(ctx, txt, x, y, { size, col = REEL_COL.soft, align = "center", font = REEL_SANS, weight = 600 } = {}) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(txt, x, y);
}

/**
 * Une vitrine. scenes : [{ key, d (s), num (numérotée, défaut vrai), join (2026-10-27 : enchaînée à la précédente, sans fondu
 * ni zoom entre les deux, pour un mouvement continu) }] ; draw : { clé: (ctx, boîte, u, d, T, fs) } ;
 * prefix : préfixe des textes (`${prefix}-${clé}-k|a|b`, `${prefix}-schem`) ; still : instant montré sans animation.
 */
export function makeReel({ scenes, draw, prefix, still = 0 }) {
  const total = scenes.reduce((s, x) => s + x.d, 0);
  const numbered = scenes.filter((s) => s.num !== false);

  /** La scène à l'instant t (boucle) : { i, u (s dans la scène), d }. */
  function sceneAt(t) {
    let u = ((t % total) + total) % total;
    for (let i = 0; i < scenes.length; i++) { if (u < scenes[i].d) return { i, u, d: scenes[i].d }; u -= scenes[i].d; }
    return { i: scenes.length - 1, u: scenes.at(-1).d, d: scenes.at(-1).d };
  }

  /** Deux phrases, mot à mot : la première au début de la scène, la seconde à mi-chemin. */
  function captions(ctx, box, sc, u, d, T, fs) {
    const key = scenes[sc].key, kick = T(`${prefix}-${key}-k`);
    const lines = [[T(`${prefix}-${key}-a`), 0.25], [T(`${prefix}-${key}-b`), d * 0.45]];
    let y = box.y;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    // l'étiquette de la scène : numéro et nom, en capitales
    if (kick) {
      const ka = ease(u / 0.3); ctx.globalAlpha = ka;
      ctx.font = `700 ${Math.round(fs * 0.62)}px ${REEL_MONO}`; ctx.fillStyle = REEL_COL.flat;
      const no = numbered.indexOf(scenes[sc]) + 1;
      const tag = (no ? `0${no} / 0${numbered.length} · ` : "") + kick.toUpperCase();
      ctx.fillText(tag, box.x, y);
      ctx.fillStyle = REEL_COL.flat; ctx.fillRect(box.x, y + fs * 0.85, fs * 2.2 * ease(u / 0.5), Math.max(2, fs * 0.09));
      ctx.globalAlpha = 1; y += fs * 1.5;
    }
    lines.forEach(([txt, t0], li) => {
      if (!txt) return;
      const big = li === 0, f = Math.round(fs * (big ? 1.18 : 0.92)), lh = f * 1.22;
      ctx.font = `${big ? 800 : 500} ${f}px ${REEL_SANS}`;
      const wrapped = wrapText(txt, box.w, (s) => ctx.measureText(s).width);
      let wi = 0;
      for (const line of wrapped) {
        let x = box.x;
        for (const w of line.split(" ")) {
          const a = ease((u - t0 - wi * 0.055) / 0.22);
          if (a > 0) { ctx.globalAlpha = a; ctx.fillStyle = big ? REEL_COL.ink : REEL_COL.soft; ctx.fillText(w, x, y + (1 - a) * f * 0.45); }
          x += ctx.measureText(w + " ").width; wi++;
        }
        y += lh;
      }
      ctx.globalAlpha = 1; y += f * 0.45;
    });
  }

  /**
   * Une image de la vitrine à l'instant t, sur W × H (px CSS). T(clé) = textes ; T.lang = langue.
   * Paysage : le texte à gauche, le dessin à droite ; portrait : le dessin en haut, le texte dessous.
   */
  function drawReel(ctx, W, H, t, T) {
    const { i, u, d } = sceneAt(t);
    ctx.fillStyle = REEL_COL.paper; ctx.fillRect(0, 0, W, H);
    const land = W >= H * 1.15, pad = Math.round(Math.min(W, H) * 0.06);
    const fs = land ? clamp(W * 0.024, 12, 34) : clamp(W * 0.041, 12, 26);
    const art = land ? { x: W * 0.44, y: pad * 0.6, w: W * 0.56 - pad * 0.6, h: H - pad * 1.2 } : { x: pad * 0.5, y: pad * 0.4, w: W - pad, h: H * 0.53 };
    const txt = land ? { x: pad, y: pad * 1.3, w: W * 0.4 - pad } : { x: pad, y: H * 0.56 + pad * 0.3, w: W - 2 * pad };
    // entrée et sortie de la scène : fondu et léger zoom (aucun des deux entre deux scènes enchaînées, « join »)
    const joinIn = !!scenes[i].join, joinOut = !!scenes[(i + 1) % scenes.length].join;
    const k = Math.min(joinIn ? 1 : ease(u / 0.35), joinOut ? 1 : ease((d - u) / 0.3));
    ctx.save(); ctx.globalAlpha = k;
    const z = joinIn ? 1 : 0.94 + 0.06 * easeOut(u / 0.5), ox = art.x + art.w / 2, oy = art.y + art.h / 2;
    ctx.translate(ox, oy); ctx.scale(z, z); ctx.translate(-ox, -oy);
    draw[scenes[i].key](ctx, art, u, d, T, fs);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = Math.min(1, ease((d - u) / 0.3)) * 1; captions(ctx, txt, i, u, d, T, fs); ctx.restore();
    // honnêteté (règle 1) : ce qui n'est pas à l'échelle (en portrait, au-dessus de la frise) ; la frise des scènes en bas
    label(ctx, T(`${prefix}-schem`), W - pad * 0.5, H - pad * (land ? 0.45 : 1.1), { size: Math.max(9, fs * 0.45), col: REEL_COL.faint, align: "right", weight: 500 });
    const bw = (land ? W * 0.4 - pad : (W - 2 * pad) * 0.55) / scenes.length, by = H - pad * 0.45;
    for (let j = 0; j < scenes.length; j++) {
      const f = j < i ? 1 : j > i ? 0 : u / d;
      ctx.fillStyle = "rgba(21,26,33,0.12)"; ctx.fillRect(pad + j * bw, by - 1.5, bw - 4, 3);
      ctx.fillStyle = REEL_COL.ink; ctx.fillRect(pad + j * bw, by - 1.5, (bw - 4) * f, 3);
    }
  }

  /** Monte la vitrine sur `canvas` : boucle quand elle est visible, clic = pause/lecture, export (__anim). */
  function mountReel(canvas, T) {
    const st = { time: 0, playing: !reducedMotion(), vis: true, raf: null, last: 0, dead: false };
    if (!st.playing) st.time = still;   // à l'arrêt : une image parlante
    const paint = () => { const { ctx, W, H } = setupCanvas(canvas); if (!W) return; drawReel(ctx, W, H, st.time, T); };
    const loop = () => {
      if (st.raf || typeof requestAnimationFrame !== "function") return;
      const step = (ts) => {
        st.raf = null;
        if (st.dead || !st.playing || !st.vis || exportBusy() || canvas.closest("[hidden]")) { st.last = 0; return; }
        const n = frameStep(st, ts);
        if (n) { st.time = (st.time + n / 60) % total; paint(); }
        st.raf = requestAnimationFrame(step);
      };
      st.raf = requestAnimationFrame(step);
    };
    canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); });
    let saved = null;
    canvas.__anim = {
      duration: total,
      begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
      frameAt(x) { st.time = x; paint(); },
      end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; paint(); if (st.playing) loop(); },
    };
    const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { st.vis = es.some((x) => x.isIntersecting); if (st.vis) loop(); }) : null;
    io?.observe(canvas);
    return {
      start() { paint(); if (st.playing) loop(); },
      stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
      dispose() { st.dead = true; io?.disconnect(); if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    };
  }

  return { total, sceneAt, drawReel, mountReel };
}
