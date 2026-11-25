// Perspective vraie pour l'onglet persp (2026-11-21) : un sténopé (position, cap, site, focale, point principal), le
// découpage au plan proche, l'enveloppe convexe des prismes de lumière, et les trois scènes que dessinent les animations et
// la vitrine : le carré de cubes, les rayons vus de l'œil, et le plan vu d'en haut. Rien n'est exagéré dans la projection :
// l'image est x' = f X/Z, y' = f Y/Z (logic.js, pinhole) ; seul le disque du Soleil est agrandi, et le tampon le dit.
import { CUBES, RAYS, DEG, sunDir, nearSun, groundHit } from "./logic.js";

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** Un appareil : yaw = cap (0 = vers +x, le Soleil ; 90° = vers +z), pitch = site ; f en px ; (cx, cy) point principal. */
export function camera({ pos, yaw = 0, pitch = 0, f, cx, cy, near = 0.05, view = null }) {
  const NEAR = near, BOX = view ? [view.x - 30, view.y - 30, view.x + view.w + 30, view.y + view.h + 30] : [cx - 2500, cy - 2500, cx + 2500, cy + 2500];   // le cadre, à peine élargi : rien de très loin ni d'invisible (resvg tombe dessus)
  const c = Math.cos(yaw), s = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const F = [cp * c, sp, cp * s], R = [-s, 0, c];
  const U = [R[1] * F[2] - R[2] * F[1], R[2] * F[0] - R[0] * F[2], R[0] * F[1] - R[1] * F[0]];
  const toCam = (P) => { const d = sub(P, pos); return [dot(d, R), dot(d, U), dot(d, F)]; };
  const dirCam = (d) => [dot(d, R), dot(d, U), dot(d, F)];
  const proj = (q) => [cx + (f * q[0]) / q[2], cy - (f * q[1]) / q[2]];
  /** Un point du monde à l'écran, ou null derrière l'objectif. */
  const pt = (P) => { const q = toCam(P); return q[2] > NEAR ? proj(q) : null; };
  /** Le point de fuite d'une direction, ou null s'il est derrière. */
  const vp = (d) => { const q = dirCam(d); return q[2] > 1e-9 ? proj(q) : null; };
  /** Un polygone du monde découpé au plan proche puis projeté (tableau de points écran, peut être vide). */
  const poly = (Ps) => clipBox(clipNear(Ps.map(toCam), NEAR).map(proj), BOX);
  /** Un segment découpé puis projeté, ou null. */
  const seg = (A, B) => {
    let a = toCam(A), b = toCam(B);
    if (a[2] <= NEAR && b[2] <= NEAR) return null;
    if (a[2] <= NEAR) a = lerp3(a, b, (NEAR - a[2]) / (b[2] - a[2]));
    else if (b[2] <= NEAR) b = lerp3(b, a, (NEAR - b[2]) / (a[2] - b[2]));
    return clipSeg(proj(a), proj(b), BOX);
  };
  return { pos, F, R, U, f, cx, cy, toCam, dirCam, proj, pt, vp, poly, seg };
}
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Sutherland-Hodgman contre z ≥ NEAR, en coordonnées de l'appareil. */
export function clipNear(Q, NEAR = 0.05) {
  const out = [];
  for (let i = 0; i < Q.length; i++) {
    const a = Q[i], b = Q[(i + 1) % Q.length], ia = a[2] > NEAR, ib = b[2] > NEAR;
    if (ia) out.push(a);
    if (ia !== ib) out.push(lerp3(a, b, (NEAR - a[2]) / (b[2] - a[2])));
  }
  return out;
}

/** Sutherland-Hodgman d'un polygone écran contre une boîte [x0, y0, x1, y1] (même image, nombres modestes). */
export function clipBox(P, [x0, y0, x1, y1]) {
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]], [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]], [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]]];
  let Q = P;
  for (const [inside, cut] of edges) {
    if (!Q.length) break;
    const out = [];
    for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], ia = inside(a), ib = inside(b); if (ia) out.push(a); if (ia !== ib) out.push(cut(a, b)); }
    Q = out;
  }
  return Q;
}
/** Liang-Barsky : un segment écran dans la boîte, ou null. */
export function clipSeg(a, b, [x0, y0, x1, y1]) {
  let t0 = 0, t1 = 1; const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy]];
}

/** Enveloppe convexe (chaîne monotone). */
export function hull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

const pathPoly = (ctx, P) => { if (P.length < 2) return; ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); };
const fillPoly = (ctx, P, fill) => { if (P.length < 3) return; ctx.beginPath(); pathPoly(ctx, P); ctx.fillStyle = fill; ctx.fill(); };

/* ---- le carré de cubes ------------------------------------------------------------------------------------------------ */
const CUBE_FACES = [
  { n: [-1, 0, 0], v: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], c: "#3b6fd8" },   // face vers l'œil
  { n: [1, 0, 0], v: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]], c: "#1e3a8a" },
  { n: [0, 1, 0], v: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], c: "#93b4f5" },    // dessus
  { n: [0, -1, 0], v: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]], c: "#1e40af" },   // dessous
  { n: [0, 0, -1], v: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], c: "#2b57c0" },
  { n: [0, 0, 1], v: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]], c: "#2b57c0" },
];
/** Les quatre cubes (coins bas-gauche-avant) : face avant à la distance d. */
export const cubeCorners = (d, c = CUBES) => [[d, 0, c.x[0]], [d, 0, c.x[1]], [d, c.highBottom, c.x[0]], [d, c.highBottom, c.x[1]]];

/**
 * Le carré de cubes vu par un œil à CUBES.eye, regard horizontal vers +x. rect = cadre (clip) ; f, cx, cy = l'appareil ;
 * grid : le carrelage du sol (2 m). Renvoie la boîte écran des cubes (pour la loupe).
 */
export function drawCubes(ctx, rect, d, { f, cx, cy, grid = true, horizon = true, sky = "#eef3fb", floor = "#efe7d6" }) {
  const cam = camera({ pos: [0, CUBES.eye, 0], f, cx, cy, view: rect });
  ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  ctx.fillStyle = sky; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = floor; ctx.fillRect(rect.x, cy, rect.w, rect.y + rect.h - cy);
  if (grid) {
    ctx.strokeStyle = "rgba(122,106,79,.35)"; ctx.lineWidth = 1;
    for (let z = -40; z <= 40; z += 2) { const s = cam.seg([0.01, 0, z], [1e5, 0, z]); if (s) { ctx.beginPath(); ctx.moveTo(...s[0]); ctx.lineTo(...s[1]); ctx.stroke(); } }
    for (let x = 2; x <= 4000; x = x < 40 ? x + 2 : x < 400 ? x + 20 : x + 200) {
      const s = cam.seg([x, 0, -400], [x, 0, 400]); if (!s) continue;
      ctx.globalAlpha = Math.max(0.15, Math.min(1, 30 / x + 0.2)); ctx.beginPath(); ctx.moveTo(...s[0]); ctx.lineTo(...s[1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (horizon) { ctx.strokeStyle = "rgba(180,83,9,.7)"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(rect.x, cy); ctx.lineTo(rect.x + rect.w, cy); ctx.stroke(); ctx.setLineDash([]); }
  const faces = [];
  for (const o of cubeCorners(d)) for (const F of CUBE_FACES) {
    const V = F.v.map((v) => [o[0] + v[0], o[1] + v[1], o[2] + v[2]]);
    const ctr = V.reduce((a, v) => [a[0] + v[0] / 4, a[1] + v[1] / 4, a[2] + v[2] / 4], [0, 0, 0]);
    if (dot(F.n, sub(cam.pos, ctr)) <= 0) continue;
    faces.push({ P: cam.poly(V), c: F.c, z: Math.hypot(...sub(ctr, cam.pos)) });
  }
  faces.sort((a, b) => b.z - a.z);
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const F of faces) {
    fillPoly(ctx, F.P, F.c);
    if (F.P.length > 2) { ctx.strokeStyle = "rgba(15,23,42,.55)"; ctx.lineWidth = 0.8; ctx.beginPath(); pathPoly(ctx, F.P); ctx.stroke(); }
    for (const p of F.P) { bx0 = Math.min(bx0, p[0]); by0 = Math.min(by0, p[1]); bx1 = Math.max(bx1, p[0]); by1 = Math.max(by1, p[1]); }
  }
  ctx.restore();
  // les bords des rangées : la ligne entre lesquelles l'écart est mesuré
  const top = cam.pt([d, CUBES.highBottom, 0]), bot = cam.pt([d, CUBES.lowTop, 0]);
  return { x0: bx0, y0: by0, x1: bx1, y1: by1, yTop: top?.[1], yBot: bot?.[1], cam };
}

/* ---- les rayons du Soleil ------------------------------------------------------------------------------------------------ */
const holeSquare = (h, y = RAYS.cloud, a = RAYS.hole / 2) => [[h[0] - a, y, h[1] - a], [h[0] + a, y, h[1] - a], [h[0] + a, y, h[1] + a], [h[0] - a, y, h[1] + a]];
const slabRect = (y = RAYS.cloud, S = RAYS.slab) => [[S.x0, y, S.z0], [S.x1, y, S.z0], [S.x1, y, S.z1], [S.x0, y, S.z1]];
/** Le prisme de lumière d'un trou : les quatre coins au nuage et leurs quatre points d'arrivée au sol. */
export function beam(h, near) { const top = holeSquare(h); return { top, bot: top.map((c) => groundHit(c, near)) }; }
const prismFaces = (B) => [B.top, B.bot, ...[0, 1, 2, 3].map((i) => [B.top[i], B.top[(i + 1) % 4], B.bot[(i + 1) % 4], B.bot[i]])];

export const RAY_COL = { sky0: "#bcd3ee", sky1: "#f7e8cf", lit: "#d9c48f", shade: "#8f8a78", cloud: "#a3a9b4", beam: "rgba(255,243,200,.5)", beamEdge: "rgba(255,225,140,.55)", sun: "#fff4c2" };

/**
 * Ce que voit l'œil (1,7 m), regard horizontal au cap yaw (radians), objectif décentré vers le haut (pour montrer le ciel
 * sans pencher l'appareil : un appareil penché ferait converger même des droites parallèles au plan de l'image).
 * near : Soleil proche (nearSun) au lieu de lointain. sunK : agrandissement du disque (tampon). ghost : les axes des rayons
 * du Soleil lointain en pointillés (pour montrer que le Soleil proche donne les mêmes droites).
 */
export function drawRaysView(ctx, rect, { near = false, yaw = 0, hfov = 100, sunK = 4, ghost = false, labels = null }) {
  const f = rect.w / 2 / Math.tan((hfov / 2) * DEG), cx = rect.x + rect.w / 2, cy = rect.y + rect.h * 0.62;
  const cam = camera({ pos: [0, RAYS.eye, 0], yaw, f, cx, cy, near: 1e-5, view: rect });   // plan proche à 1 cm : l'ombre du nuage couvre le sol jusqu'aux pieds
  const s = sunDir();
  ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  const g = ctx.createLinearGradient(0, rect.y, 0, cy); g.addColorStop(0, RAY_COL.sky0); g.addColorStop(1, RAY_COL.sky1);
  ctx.fillStyle = g; ctx.fillRect(rect.x, rect.y, rect.w, cy - rect.y);
  ctx.fillStyle = RAY_COL.lit; ctx.fillRect(rect.x, cy, rect.w, rect.y + rect.h - cy);
  // le Soleil (direction de l'œil vers lui : la même pour le lointain et le proche)
  const sp = cam.vp(s), r = Math.max(2, (f * Math.tan((0.533 / 2) * DEG)) * sunK);
  if (sp) {
    const gl = ctx.createRadialGradient(sp[0], sp[1], 0, sp[0], sp[1], r * 9); gl.addColorStop(0, "rgba(255,244,194,.95)"); gl.addColorStop(1, "rgba(255,244,194,0)");
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(sp[0], sp[1], r * 9, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = RAY_COL.sun; ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sp[0], sp[1], r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  }
  // l'ombre du nuage au sol, percée des taches de lumière
  const shadow = slabRect().map((c) => groundHit(c, near));
  ctx.beginPath(); pathPoly(ctx, cam.poly(shadow));
  for (const h of RAYS.holes) pathPoly(ctx, cam.poly(beam(h, near).bot));
  ctx.fillStyle = RAY_COL.shade; ctx.fill("evenodd");
  // le nuage, percé de ses trous
  ctx.beginPath(); pathPoly(ctx, cam.poly(slabRect()));
  for (const h of RAYS.holes) pathPoly(ctx, cam.poly(holeSquare(h)));
  ctx.fillStyle = RAY_COL.cloud; ctx.fill("evenodd");
  if (sp) { ctx.strokeStyle = "rgba(253,230,138,.9)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(sp[0], sp[1], r * 2.2, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]); }   // le Soleil, derrière le nuage
  // l'horizon
  ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rect.x, cy); ctx.lineTo(rect.x + rect.w, cy); ctx.stroke();
  // les prismes de lumière
  for (const h of RAYS.holes) {
    const B = beam(h, near), pts = [];
    for (const F of prismFaces(B)) pts.push(...cam.poly(F));
    const H = hull(pts); if (H.length < 3) continue;
    ctx.beginPath(); pathPoly(ctx, H); ctx.fillStyle = RAY_COL.beam; ctx.fill(); ctx.strokeStyle = RAY_COL.beamEdge; ctx.lineWidth = 0.8; ctx.stroke();
  }
  if (ghost) {
    ctx.strokeStyle = "rgba(29,78,216,.75)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    for (const h of RAYS.holes) { const A = [h[0], RAYS.cloud, h[1]], q = cam.seg(A, groundHit(A, false)); if (q) { ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.stroke(); } }
    ctx.setLineDash([]);
  }
  // le point antisolaire
  const ap = cam.vp(s.map((x) => -x));
  if (ap && ap[0] > rect.x && ap[0] < rect.x + rect.w && ap[1] < rect.y + rect.h) {
    ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 1.6; const k = 6;
    ctx.beginPath(); ctx.moveTo(ap[0] - k, ap[1] - k); ctx.lineTo(ap[0] + k, ap[1] + k); ctx.moveTo(ap[0] + k, ap[1] - k); ctx.lineTo(ap[0] - k, ap[1] + k); ctx.stroke();
    if (labels?.anti) { ctx.font = "600 12px system-ui, sans-serif"; ctx.fillStyle = "#7c2d12"; ctx.textAlign = "center"; ctx.fillText(labels.anti, ap[0], Math.min(ap[1] + 20, rect.y + rect.h - 6)); }
  }
  if (sp && labels?.sun && sp[0] > rect.x && sp[0] < rect.x + rect.w) { ctx.font = "600 12px system-ui, sans-serif"; ctx.fillStyle = "#92400e"; ctx.textAlign = "center"; ctx.fillText(labels.sun, sp[0], sp[1] + r + 16); }
  ctx.restore();
  return { cam, sp, ap, cy };
}

/**
 * Le plan, vu d'en haut (projection orthogonale : aucune perspective) : le nuage (pointillé), ses trous, les taches au sol,
 * l'axe de chaque rayon, l'œil et son champ au cap yaw. Le Soleil en haut (+x vers le haut de l'écran).
 */
export function drawRaysPlan(ctx, rect, { near = false, yaw = null, hfov = 100, labels = null, bg = "#f4efe2" }) {
  // la même étendue pour les deux Soleils (comparer) : les taches du Soleil proche les plus lointaines sortent du cadre
  const X0 = -28, X1 = 16, Z = 15, k = Math.min(rect.w / (2 * Z), rect.h / (X1 - X0));
  const ox = rect.x + rect.w / 2, oy = rect.y + rect.h / 2 + ((X1 + X0) / 2) * k;
  const P = (x, z) => [ox + z * k, oy - x * k];
  const BX = [rect.x - 2, rect.y - 2, rect.x + rect.w + 2, rect.y + rect.h + 2];
  const pp = (Q) => clipBox(Q.map((q) => P(q[0], q[2])), BX);   // découpé au cadre (resvg tombe sur un tracé tout entier dehors)
  const line = (a, b) => { const q = clipSeg(a, b, BX); if (q) { ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.stroke(); } };
  ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  ctx.fillStyle = bg; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // l'ombre du nuage au sol et les taches
  ctx.beginPath(); pathPoly(ctx, pp(slabRect().map((c) => groundHit(c, near))));
  for (const h of RAYS.holes) pathPoly(ctx, pp(beam(h, near).bot));
  ctx.fillStyle = "rgba(120,113,96,.32)"; ctx.fill("evenodd");
  for (const h of RAYS.holes) fillPoly(ctx, pp(beam(h, near).bot), "rgba(234,179,8,.75)");
  // le nuage (au-dessus) et ses trous
  ctx.strokeStyle = "rgba(75,85,99,.8)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); pathPoly(ctx, pp(slabRect())); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#374151"; ctx.lineWidth = 1;
  for (const h of RAYS.holes) { ctx.beginPath(); pathPoly(ctx, pp(holeSquare(h))); ctx.stroke(); }
  // l'axe de chaque rayon, du trou à sa tache
  ctx.strokeStyle = "rgba(217,119,6,.9)"; ctx.lineWidth = 1.2;
  for (const h of RAYS.holes) { const g = groundHit([h[0], RAYS.cloud, h[1]], near); line(P(h[0], h[1]), P(g[0], g[2])); }
  ctx.font = "600 11.5px system-ui, sans-serif"; ctx.textAlign = "center";
  if (near) {
    const S = nearSun(), q = P(S[0], S[2]);
    ctx.strokeStyle = "rgba(217,119,6,.35)"; ctx.setLineDash([2, 3]);
    for (const h of RAYS.holes) line(q, P(h[0], h[1]));
    ctx.setLineDash([]);
    ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, 2 * Math.PI); ctx.fill();
    if (labels?.under) { ctx.fillStyle = "#92400e"; ctx.textAlign = "center"; ctx.fillText(labels.under, q[0], q[1] + 20); }
  } else if (labels?.toSun) {
    const a = P(X1 - 1.8, 0); ctx.fillStyle = "#92400e"; ctx.fillText(labels.toSun, a[0], a[1] + 12);
    ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1] + 30); ctx.lineTo(a[0], a[1] + 18); ctx.stroke();
  }
  // l'œil et son champ
  const e = P(0, 0);
  if (yaw != null) {
    const L = 7 * k, a0 = yaw - (hfov / 2) * DEG, a1 = yaw + (hfov / 2) * DEG;
    const dir = (a) => [e[0] + Math.sin(a) * L, e[1] - Math.cos(a) * L];
    ctx.fillStyle = "rgba(29,78,216,.16)"; ctx.beginPath(); ctx.moveTo(...e); ctx.lineTo(...dir(a0)); ctx.lineTo(...dir(a1)); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = "#1d4ed8"; ctx.beginPath(); ctx.arc(e[0], e[1], 4, 0, 2 * Math.PI); ctx.fill();
  if (labels?.eye) { ctx.fillStyle = "#1d4ed8"; ctx.textAlign = "left"; ctx.fillText(labels.eye, e[0] + 7, e[1] + 4); }
  // la barre d'échelle : 5 km
  const by = rect.y + rect.h - 22, bx = rect.x + 8;
  ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 5 * k, by); ctx.stroke();
  ctx.fillStyle = "#151a21"; ctx.textAlign = "left"; ctx.font = "11px system-ui, sans-serif"; ctx.fillText("5 km", bx + 5 * k + 5, by + 4);
  ctx.restore();
  return { k, P };
}

/**
 * La coupe, vue de côté à l'échelle vraie (rien d'exagéré : 1 km en hauteur = 1 km en longueur) : le sol, la couche de
 * nuages et ses trous côté Soleil, l'œil, et les rayons projetés sur le plan vertical de la visée. Soleil lointain : des
 * rayons parallèles ; Soleil proche (meilleur ajustement) : une pyramide sous lui.
 */
export function drawRaysSection(ctx, rect, { near = false, labels = null, bg = "#fbf7ee" }) {
  const xa = -1.5, xb = 13.5, ytop = 3.4, k = Math.min((rect.w - 16) / (xb - xa), (rect.h - 30) / ytop);
  const ox = rect.x + 8 - xa * k, gy = rect.y + rect.h - 18, X = (x) => ox + x * k, Y = (y) => gy - y * k;
  ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  ctx.fillStyle = bg; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = "#d9c48f"; ctx.fillRect(rect.x, gy, rect.w, rect.y + rect.h - gy);
  const gaps = RAYS.holes.filter((h) => h[0] > 6 && h[0] < xb), a = RAYS.hole / 2;   // les trous de l'éventail
  // la couche de nuages, percée (en coupe, les trous de toutes les profondeurs se superposent)
  ctx.fillStyle = RAY_COL.cloud; ctx.fillRect(X(RAYS.slab.x0), Y(RAYS.cloud + 0.12), (RAYS.slab.x1 - RAYS.slab.x0) * k, 0.12 * k);
  ctx.fillStyle = bg; for (const h of gaps) ctx.fillRect(X(h[0] - a), Y(RAYS.cloud + 0.12) - 1, 2 * a * k, 0.12 * k + 2);
  // les rayons
  const S = nearSun();
  ctx.lineWidth = Math.max(1.2, a * k * 0.9); ctx.strokeStyle = "rgba(245,180,40,.55)";
  for (const h of gaps) { const c = [h[0], RAYS.cloud, h[1]], g = groundHit(c, near); ctx.beginPath(); ctx.moveTo(X(c[0]), Y(c[1])); ctx.lineTo(X(g[0]), Y(0)); ctx.stroke(); }
  if (near) {
    ctx.strokeStyle = "rgba(245,180,40,.35)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    for (const h of gaps) { ctx.beginPath(); ctx.moveTo(X(S[0]), Y(S[1])); ctx.lineTo(X(h[0]), Y(RAYS.cloud)); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.fillStyle = "#fde68a"; ctx.strokeStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(X(S[0]), Y(S[1]), 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  } else {
    const s = sunDir(); for (const dy of [-0.5, 0.2, 0.9]) { const x0 = xb - 1.2, y0 = 2.6 + dy * 0.3; ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x0 - s[0] * 1.2), Y(y0 - s[1] * 1.2)); ctx.stroke(); }
  }
  // l'œil et sa visée du Soleil
  ctx.strokeStyle = "rgba(29,78,216,.6)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); const L = near ? 1 : 1.4; ctx.lineTo(X(S[0] * L), Y(S[1] * L)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#1d4ed8"; ctx.beginPath(); ctx.arc(X(0), Y(0), 4, 0, 2 * Math.PI); ctx.fill();
  ctx.font = "600 11.5px system-ui, sans-serif"; ctx.textAlign = "left";
  if (labels?.eye) { ctx.fillStyle = "#1d4ed8"; ctx.fillText(labels.eye, X(0) + 6, Y(0) - 6); }
  if (labels?.sun) { ctx.fillStyle = "#92400e"; ctx.textAlign = near ? "center" : "right"; ctx.fillText(labels.sun, near ? X(S[0]) : X(xb) - 4, near ? Y(S[1]) - 12 : Y(3.2)); }
  if (labels?.scale) { ctx.fillStyle = "#5b6470"; ctx.textAlign = "left"; ctx.font = "11px system-ui, sans-serif"; const w = ctx.measureText(labels.scale).width, fs = Math.max(8, Math.min(11, (11 * (rect.w - 16)) / w)); ctx.font = `${fs.toFixed(1)}px system-ui, sans-serif`; ctx.fillText(labels.scale, rect.x + 8, rect.y + 14); }
  ctx.restore();
}
