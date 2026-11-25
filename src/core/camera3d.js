// Caméra orthographique partagée (rendu 3D "fait main", sans librairie),
// portée à l'identique du legacy (~L15002-15094). Utilisée par les scènes
// qui restent en 2.5D après l'epic03 -- les scènes qui passent à Three.js
// (GPS, magnétisme, nivellement, cadran solaire) ont leur propre caméra
// dans src/render3d/.
import { setupCanvas } from "./canvas.js";

/** État de la caméra partagée : lacet (yaw) et tangage (pitch), en radians. */
export const V3D = { yaw: -0.65, pitch: 0.45 };

/** Applique la rotation caméra à un point 3D [x,y,z]. */
export function rot3(p) {
  const cy = Math.cos(V3D.yaw), sy = Math.sin(V3D.yaw);
  const cp = Math.cos(V3D.pitch), sp = Math.sin(V3D.pitch);
  const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, y1 = p[1];
  return [x1, y1 * cp - z1 * sp, y1 * sp + z1 * cp];
}

/**
 * Prépare un canvas pour une scène 3D orthographique : renvoie le contexte
 * 2D, les dimensions, et une fonction de projection P(point3D) -> [x,y,z]
 * écran (z conservé pour les tests de face avant/arrière).
 */
export function mk3(canvas, zoom) {
  const { ctx, W, H } = setupCanvas(canvas);
  const sc = Math.min(W, H) * 0.30 * (zoom || 1);
  const P = (p) => {
    const q = rot3(p);
    return [W / 2 + q[0] * sc, H / 2 + 28 - q[1] * sc, q[2]];
  };
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fdfdfc";
  ctx.fillRect(0, 0, W, H);
  return { ctx, W, H, sc, P };
}

/**
 * Trace une polyligne de points 3D. `cull` masque les segments dont le
 * point projeté est au dos de la sphère (test sur la composante z projetée).
 */
export function path3(ctx, P, pts, color, width, dash, cull, alpha) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash || []);
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  let open = false;
  ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    const a = P(pts[i]), b = P(pts[i + 1]);
    if (cull && (a[2] < 0.02 || b[2] < 0.02)) { open = false; continue; }
    if (!open) { ctx.moveTo(a[0], a[1]); open = true; }
    ctx.lineTo(b[0], b[1]);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

export const norm3 = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

export const addS = (a, b, s, t) => [a[0] * s + b[0] * t, a[1] * s + b[1] * t, a[2] * s + b[2] * t];

/** Points d'un cercle à rayon angulaire `angR` autour du vecteur unitaire C. */
export function sphCirclePts(C, angR, U, N) {
  const Vv = norm3([
    C[1] * U[2] - C[2] * U[1],
    C[2] * U[0] - C[0] * U[2],
    C[0] * U[1] - C[1] * U[0],
  ]);
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    pts.push(addS(
      addS([0, 0, 0], C, 0, Math.cos(angR)),
      addS(U, Vv, Math.cos(t) * Math.sin(angR), Math.sin(t) * Math.sin(angR)),
      1, 1,
    ));
  }
  return pts;
}

/**
 * Rotation lente au repos de la caméra PARTAGÉE V3D (2026-09-24). Toutes les
 * scènes qui l'utilisent tournent ensemble -- c'est voulu, même point de vue.
 * S'arrête pendant un glisser et 4 s après (touch()), hors écran, onglet
 * masqué, et sous prefers-reduced-motion. ~30 images/s : setupCanvas
 * réalloue le canvas à chaque dessin, inutile de le faire 60 fois.
 * @param {HTMLCanvasElement[]} canvases  @param {() => void} redraw
 */
export function idleSpin(canvases, redraw, speed = 0.12) {
  let raf = null, last = 0, touched = 0, dragging = false, vis = true, io = null;
  const start = () => {
    if (raf || typeof requestAnimationFrame !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (!io && typeof IntersectionObserver === "function") {
      io = new IntersectionObserver((es) => { vis = es.some((e) => e.isIntersecting); });
      canvases.forEach((c) => c && io.observe(c));
    }
    last = 0;
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      if (last && ts - last < 32) return;
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts;
      if (!vis || document.hidden || dragging || ts - touched < 4000) return;
      V3D.yaw += dt * speed;
      redraw();
    };
    raf = requestAnimationFrame(loop);
  };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
  // export (epic10/UC02) : un tour complet de la caméra, bouclé, en 17 s (3 × la
  // vitesse de repos, 52 s par tour -- trop long pour un clip), puis retour au point de vue
  let yaw0 = 0, wasOn = false;
  const anim = {
    duration: (2 * Math.PI) / (speed * 3),
    begin() { yaw0 = V3D.yaw; wasOn = !!raf; stop(); },
    frameAt(t) { V3D.yaw = yaw0 + (2 * Math.PI * t) / anim.duration; redraw(); },
    end() { V3D.yaw = yaw0; redraw(); if (wasOn) start(); },
  };
  for (const c of canvases) if (c) c.__anim = anim;
  return { start, stop, grab: () => { dragging = true; }, release: () => { dragging = false; touched = performance.now(); } };
}
