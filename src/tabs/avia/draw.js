// Outils de dessin partagés par les figures de l'onglet avia (epic14) :
// globe orthographique centré où l'on veut (décor de globe25d.js), disque
// azimutal équidistant vu d'en haut (la carte plate usuelle), étiquettes,
// boucle d'animation. Tout est à l'échelle uniforme ; aucun nombre de la page
// ne se lit sur ces dessins (ils viennent de logic.js).
import { figColor } from "../../core/theme.js";
import { drawGlobe25 } from "../../core/globe25d.js";
import { frameStep, reducedMotion, exportBusy } from "../../core/motion.js";
import { aeXY, R_KM } from "./logic.js";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";

const D2R = Math.PI / 180;
export const INK = "#151a21", SOFT = "#5b6470";

export function cssVar(el, name, fb) {
  return figColor(name, fb);
}
export const colors = (el) => ({ globe: cssVar(el, "--globe", "#0f766e"), flat: cssVar(el, "--flat", "#b45309") });

/** Vecteur unité du globe (repère de globe25d.js). */
const gv = (lat, lon) => { const p = lat * D2R, l = lon * D2R; return [Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l)]; };

/**
 * Projection orthographique d'un globe centré sur (lat0, lon0), rayon sc px,
 * centre (cx, cy). Renvoie { P, ll(lat, lon) -> [x, y, z] écran (z > 0 : face
 * visible), draw(ctx, opt) }.
 */
export function orthoGlobe(cx, cy, sc, lat0, lon0) {
  const p = lat0 * D2R, l = lon0 * D2R;
  const f = gv(lat0, lon0);
  const u = [-Math.sin(p) * Math.cos(l), Math.cos(p), Math.sin(p) * Math.sin(l)];
  const r = [-Math.sin(l), 0, -Math.cos(l)];
  const P = (w) => [cx + sc * (w[0] * r[0] + w[1] * r[1] + w[2] * r[2]), cy - sc * (w[0] * u[0] + w[1] * u[1] + w[2] * u[2]), w[0] * f[0] + w[1] * f[1] + w[2] * f[2]];
  const ll = (la, lo) => P(gv(la, lo));
  return { P, ll, sc, cx, cy, draw: (ctx, opt = {}) => drawGlobe25(ctx, P, sc, opt) };
}

/** Trace une suite de [lat, lon] sur un globe orthographique (face visible seulement). */
export function strokeGlobe(ctx, G, pts, { c, w = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); let pen = false;
  for (const q of pts) { const s = G.ll(q[0], q[1]); if (s[2] < 0) { pen = false; continue; } pen ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); pen = true; }
  ctx.stroke(); ctx.restore();
}

/**
 * Disque azimutal équidistant (pôle nord au centre, bord = pôle sud), rayon
 * Rpx, centre (cx, cy), rot = angle écran (degrés) du méridien 0. Renvoie
 * { xy([lat, lon]) -> [x, y] écran, km(x, y km) -> écran, s (px/km), draw(ctx) }.
 */
export function aeDisc(cx, cy, Rpx, rot = 90) {
  const s = Rpx / (Math.PI * R_KM), c = Math.cos(rot * D2R), n = Math.sin(rot * D2R);
  const km = ([x, y]) => [cx + s * (x * c - y * n), cy + s * (x * n + y * c)];
  const xy = (q) => { const [x, y] = aeXY(q); return km([x, -y]); };   // y écran vers le bas : l'est reste dans le sens direct vu d'en haut
  // epic18 : le fond vient du moteur commun (terres remplies) ; xy() = makeAE({ rot: 90 − rot }) à l'écran, parité testée
  const map = makeAE({ rot: 90 - rot });
  const draw = (ctx, ink) => {
    drawAEMap(ctx, map, { cx, cy, Rpx, grid: 30, colors: { sea: "#f6efe4", land: "#e8dcc6", coast: "rgba(21,26,33,.62)", grid: "rgba(21,26,33,.16)", rim: ink } });
    ctx.save(); ctx.strokeStyle = ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(cx, cy, Rpx / 2, 0, 2 * Math.PI); ctx.stroke();       // équateur
    ctx.restore();
  };
  return { xy, km, s, draw, cx, cy, R: Rpx };
}

export function label(ctx, t, x, y, { al = "left", bl = "middle", col = INK, font = "11px system-ui, sans-serif", halo = false } = {}) {
  ctx.save(); ctx.font = font; ctx.textAlign = al; ctx.textBaseline = bl;
  if (halo) { ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.strokeText(t, x, y); }
  ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.restore();
}

/**
 * Texte replié sur plusieurs lignes dans maxW px (le canvas ne replie pas).
 * bl = "bottom" : la DERNIÈRE ligne est posée à y et les autres au-dessus.
 * Renvoie le nombre de lignes.
 */
export function wrapLabel(ctx, t, x, y, maxW, o = {}) {
  const font = o.font || "11px system-ui, sans-serif", lh = o.lh || 13;
  ctx.save(); ctx.font = font;
  const lines = [];
  let cur = "";
  for (const w of String(t).split(" ")) {
    const nx = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(nx).width > maxW) { lines.push(cur); cur = w; } else cur = nx;
  }
  if (cur) lines.push(cur);
  ctx.restore();
  const y0 = o.bl === "bottom" ? y - (lines.length - 1) * lh : y;
  lines.forEach((l, i) => label(ctx, l, x, y0 + i * lh, { ...o, font }));
  return lines.length;
}

export function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); }

/** Petit avion vu de dessus, nez dans la direction ang (radians écran). */
export function plane(ctx, x, y, ang, c, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(9, 0); ctx.lineTo(2, -1.5); ctx.lineTo(-1, -8); ctx.lineTo(-3, -8); ctx.lineTo(-1, -1.5); ctx.lineTo(-6, -1.2);
  ctx.lineTo(-8, -4); ctx.lineTo(-9, -4); ctx.lineTo(-8, 0); ctx.lineTo(-9, 4); ctx.lineTo(-8, 4); ctx.lineTo(-6, 1.2);
  ctx.lineTo(-1, 1.5); ctx.lineTo(-3, 8); ctx.lineTo(-1, 8); ctx.lineTo(2, 1.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/**
 * Boucle d'animation d'une figure : tick(n) avance l'état de n « cadres à
 * 60 Hz », draw() redessine. Ne tourne que si la figure est à l'écran
 * (IntersectionObserver quand il existe), part à l'arrêt si l'utilisateur
 * préfère réduire les animations ; bouton lecture/pause optionnel.
 */
/**
 * Boucle d'animation d'une figure. `anim` (facultatif) = { duration (s), state, reset(),
 * readout?() } : branche le contrat d'export epic10/UC02 (canvas.__anim) -- l'image à
 * l'instant t se refait depuis reset() en appelant tick() comme à l'écran (60 cadres/s),
 * sans toucher aux choix du lecteur (modèle, route) ; begin/end sauvent et rendent l'état.
 */
export function makeLoop(canvas, { tick, draw, button = null, playLabel = "▶ play", pauseLabel = "❚❚ pause", anim = null }) {
  let raf = 0, visible = true, playing = !reducedMotion();
  const st = {};
  const frame = (ts) => {
    raf = 0;
    const n = frameStep(st, ts);
    if (n) { tick(n); draw(); }
    if (playing && visible) raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!raf && playing && visible && typeof requestAnimationFrame !== "undefined") { st.last = 0; raf = requestAnimationFrame(frame); } };
  const halt = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  let io = null;
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); visible && !exportBusy() ? run() : halt(); });
    io.observe(canvas);
  }
  const sync = () => { if (button) button.textContent = playing ? pauseLabel : playLabel; };
  button?.addEventListener("click", () => { playing = !playing; sync(); playing ? run() : halt(); });
  sync();
  if (anim) {
    let saved = null, cur = 0;
    canvas.__anim = {
      get duration() { return typeof anim.duration === "function" ? anim.duration() : anim.duration; },
      begin() { saved = { ...anim.state }; halt(); cur = Infinity; },
      frameAt(t) {
        const target = t * 60;
        if (target < cur) { anim.reset(); cur = 0; }
        if (target > cur) tick(target - cur);
        cur = target; draw();
      },
      end() { if (saved) Object.assign(anim.state, saved); saved = null; draw(); run(); },
      readout: anim.readout,
    };
  }
  return {
    start() { run(); },
    stop() { halt(); },
    play() { playing = true; sync(); run(); },
    get playing() { return playing; },
    dispose() { halt(); io?.disconnect(); },
  };
}
