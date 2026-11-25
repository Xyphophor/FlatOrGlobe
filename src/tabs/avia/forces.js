// Figure 1b (epic17) : vu de l'avion, rien ne bouge. Demande du propriétaire
// (2026-10-02) : un avion en vue orthographique avec ses vecteurs, pour dire
// que du point de vue de l'avion les forces ne changent pas avec le temps, donc
// qu'il n'y a rien à « faire » ; et, mieux, un second avion qui suit une autre
// couche de pression. Deux avions, FL350 (238 hPa) et FL100 (697 hPa), sur
// deux isobares de l'atmosphère standard autour d'une Terre dessinée plus
// petite (règle 1 : R/ex à échelle uniforme, ex imprimé). À gauche : les deux
// avions font le tour, chacun avec son poids (vers le centre) et sa portance.
// À droite : le diagramme des forces dans le repère de chaque avion -- le même
// à toute heure -- entre un ciel de constellations connues (sky.js, les mêmes
// qu'autour du globe, leurs positions tournant de −θ, leurs motifs restant lisibles) et un sol qui défile. Les vecteurs sont à
// l'échelle (poids = 1) ; l'écart poids − portance (v²/(R+h), ~0,1 %) est trop
// petit pour être dessiné : il est écrit.
import { setupCanvas } from "../../core/canvas.js";
import { levelFlight, levelForces, R_KM } from "./logic.js";
import { FORCE_PLANES } from "../../data/presets/avia.js";
import { sky, drawSky } from "./sky.js";
import { colors, label, wrapLabel, dot, makeLoop } from "./draw.js";
import { num } from "../curv/fmt.js";

const MIN_PER_FRAME = 0.5;            // comme la figure précédente : 30 min de vol par seconde
const WT = "#f5b301", LF = "#7fe3d4", TH = "#8fb6ff", DR = "#ff9d8a", VEL = "#e8edf2";

/** Avion de profil (vue orthographique de côté), nez vers +x, haut vers −y, longueur ~ 2·s. */
function profile(ctx, x, y, s, c) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.17, 0, 0, 2 * Math.PI); ctx.fill();                  // fuselage
  ctx.beginPath(); ctx.moveTo(-s * 0.75, -s * 0.05); ctx.lineTo(-s * 1.0, -s * 0.5); ctx.lineTo(-s * 0.78, -s * 0.5); ctx.lineTo(-s * 0.45, -s * 0.05); ctx.closePath(); ctx.fill();   // dérive
  ctx.beginPath(); ctx.moveTo(s * 0.15, s * 0.05); ctx.lineTo(-s * 0.35, s * 0.05); ctx.lineTo(-s * 0.1, s * 0.3); ctx.lineTo(s * 0.02, s * 0.3); ctx.closePath(); ctx.fill();         // aile (vue de côté, plus bas)
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, c, w = 2.2, dash = null) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 1) return;
  ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - 5 * Math.cos(a), y1 - 5 * Math.sin(a)); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(a - 0.4), y1 - 8 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 8 * Math.cos(a + 0.4), y1 - 8 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function mountForces(root, tr) {
  const cv = root.querySelector("#aviaForces"), btn = root.querySelector("#aviaForcesPlay");
  const st = { tMin: 0 };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe } = colors(cv);
    ctx.fillStyle = "#0e1726"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520;
    const F = FORCE_PLANES.map((P) => ({ ...P, f: levelForces(P.v, P.h), w: levelFlight(P.v, P.h).w }));
    // ---- à gauche (ou en haut) : la Terre, deux isobares, deux avions
    const gx = wide ? W * 0.22 : W * 0.5, gy = wide ? H * 0.52 : H * 0.23;
    const Rpx = wide ? Math.min(W * 0.16, H * 0.3) : Math.min(W * 0.2, H * 0.14);
    const hA = 20, ex = (hA / Rpx) * (R_KM / (F[0].h / 1000));
    const rad = F.map((P) => Rpx + hA * P.h / F[0].h);
    // le ciel : de vraies constellations, fixes dans l'espace, dans l'anneau entre l'isobare haute et le bord de la zone
    const rOutL = Math.max(rad[0] + 30, Math.min(gx, W - gx, gy, H - gy) - 6);
    drawSky(ctx, sky(gx, gy, rad[0] + 22 + 14, rOutL - 14, 0, Math.max(30, Math.min(52, (rOutL - rad[0]) * 0.55))), { labels: true, label, tr });
    ctx.fillStyle = "#1d4f61"; ctx.beginPath(); ctx.arc(gx, gy, Rpx, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = globe; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1;
    for (const r of rad) { ctx.beginPath(); ctx.arc(gx, gy, r, 0, 2 * Math.PI); ctx.stroke(); }
    ctx.restore();
    const th = F.map((P) => P.w * st.tMin * 60);
    const ang0 = -Math.PI / 2;
    F.forEach((P, i) => {
      const a = ang0 + th[i], x = gx + rad[i] * Math.cos(a), y = gy + rad[i] * Math.sin(a);
      const ux = Math.cos(a), uy = Math.sin(a), tx = -uy, ty = ux;
      const col = i ? "#9fc1ff" : LF;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
      profile(ctx, 0, 0, 9, col); ctx.restore();
      arrow(ctx, x, y, x - ux * 16, y - uy * 16, WT, 1.8);
      arrow(ctx, x, y, x + ux * 16, y + uy * 16, LF, 1.4);
      arrow(ctx, x, y, x + tx * 22, y + ty * 22, VEL, 1.2, [3, 2]);
    });
    F.forEach((P, i) => label(ctx, `${tr("fg-fl2", "FL")}${P.fl} · ${num(P.f.p)} hPa: ${i ? tr("fg-in", "inner ring") : tr("fg-out", "outer ring")}`, 10, 30 + i * 12, { col: "rgba(255,255,255,0.75)", font: "10px system-ui, sans-serif" }));
    label(ctx, `${tr("lv-t", "flight time")} ${num(st.tMin / 60, 1)} h`, 10, 14, { col: "#e8edf2", font: "11px system-ui, sans-serif" });
    // ---- à droite (ou en bas) : le diagramme des forces dans le repère de chaque avion
    const cells = wide
      ? F.map((_, i) => ({ x: W * 0.46, y: 8 + i * (H - 16) / 2, w: W * 0.52, h: (H - 16) / 2 - 6 }))
      : F.map((_, i) => ({ x: 6 + i * W / 2, y: H * 0.45, w: W / 2 - 10, h: H * 0.5 }));
    F.forEach((P, i) => {
      const C = cells[i];
      ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1; ctx.strokeRect(C.x, C.y, C.w, C.h);
      ctx.save(); ctx.beginPath(); ctx.rect(C.x, C.y, C.w, C.h); ctx.clip();
      const px = C.x + C.w * 0.5, py = C.y + C.h * (wide ? 0.54 : 0.5), u = Math.min(C.w * 0.3, C.h * (wide ? 0.3 : 0.28));
      // le même ciel que autour du globe : fixe dans l'espace, donc tournant de −θ dans le repère de l'avion
      drawSky(ctx, sky(px, py, Math.min(C.w, C.h) * 0.36, Math.min(C.w, C.h) * 0.56, -th[i], Math.min(C.w, C.h) * 0.2));
      // le sol : toujours sous l'avion (sa verticale est la sienne), il défile à la vitesse de l'avion ;
      // la hauteur de l'avion n'est pas à l'échelle (le sol est à 10 km ou 3 km, ce n'est pas dessiné)
      const gy0 = py + u * 1.35;
      ctx.fillStyle = "#1d4f61"; ctx.fillRect(C.x, gy0, C.w, C.y + C.h - gy0);
      ctx.strokeStyle = globe; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(C.x, gy0); ctx.lineTo(C.x + C.w, gy0); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
      const per = 26, off = (P.v * st.tMin * 60 / 1000 * 0.9) % per;
      for (let x = C.x - off; x < C.x + C.w; x += per) { ctx.beginPath(); ctx.moveTo(x, gy0 + 4); ctx.lineTo(x - 10, gy0 + 14); ctx.stroke(); }
      label(ctx, tr("fg-ground", "ground"), C.x + C.w - 6, gy0 + 9, { al: "right", col: "#9fd3e0", font: "9.5px system-ui, sans-serif" });
      profile(ctx, px, py, u * 0.5, i ? "#9fc1ff" : LF);
      const L = u * P.f.L, T = u * P.f.T * 2.2;
      arrow(ctx, px, py + u * 0.1, px, py + u * 0.1 + u, WT);                 // poids : vers le centre de la Terre
      arrow(ctx, px, py - u * 0.05, px, py - u * 0.05 - L, LF);              // portance
      arrow(ctx, px + u * 0.2, py, px + u * 0.2 + T, py, TH);                // poussée
      arrow(ctx, px - u * 0.5, py + u * 0.05, px - u * 0.5 - T, py + u * 0.05, DR);   // traînée
      arrow(ctx, px + u * 0.62, py - u * 0.3, px + u * 1.5, py - u * 0.3, VEL, 1.2, [3, 3]);
      const sm = "10px system-ui, sans-serif";
      label(ctx, "W = mg", px + 6, py + u * 0.62, { col: WT, font: sm });
      label(ctx, "L", px + 5, py - u * 0.05 - L - 2, { col: LF, font: sm });
      label(ctx, "T", px + u * 0.2 + T + 3, py - 6, { col: TH, font: sm });
      label(ctx, "D", px - u * 0.5 - T - 9, py - 6, { col: DR, font: sm });
      label(ctx, "v", px + u * 1.5 + 3, py - u * 0.3, { col: VEL, font: sm });
      ctx.restore();
      label(ctx, `${tr("fg-fl2", "FL")}${P.fl} · ${num(P.f.p)} hPa · ${num(P.v * 3.6)} km/h`, C.x + 6, C.y + 11, { col: "#e8edf2", font: "600 10px system-ui, sans-serif" });
      wrapLabel(ctx, `W − L = mv²/(R + h) = ${num(P.f.c * 100, 3)} % ${tr("fg-ofw", "of W")} · T = D = W/${num(P.f.finesse)}`, C.x + 6, C.y + C.h - 16, C.w - 10, { col: "#c7ccd4", font: "9.5px system-ui, sans-serif", lh: 11, bl: "bottom" });
    });
    if (wide) label(ctx, `${tr("fg-frame", "in the aircraft's frame: the same at every hour")}`, W * 0.46, H - 3, { col: "#9aa6b4", font: "9.5px system-ui, sans-serif", bl: "bottom" });
    wrapLabel(ctx, `${tr("lv-scale", "Earth drawn")} ×${num(ex)} ${tr("lv-scale2", "smaller than the altitude (R/ex, uniform scale); numbers are the real ones")}`, 8, wide ? H - 8 : H * 0.43, wide ? W * 0.4 : W - 16, { col: "#9aa6b4", font: "9.5px system-ui, sans-serif", bl: "bottom", lh: 11 });
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.tMin += n * MIN_PER_FRAME; if (st.tMin > 44.5 * 60) st.tMin = 0; },
    draw, anim: { duration: 12, state: st, reset: () => { st.tMin = 0; } },
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
