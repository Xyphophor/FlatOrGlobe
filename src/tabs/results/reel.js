// Vitrine de results (propriétaire, 2026-10-25) : un enchaînement rapide de petites animations, chacune
// ponctuée de deux phrases courtes, qui montrent la DÉMARCHE de quelques méthodes du site (onde de pression
// d'un volcan, séismes, avions, satellites, pendule de Foucault). Schématique, sans données : rien n'y est
// mesuré, les nombres sont ceux des onglets. Le dessin est une fonction pure du temps (drawReel), pour
// l'export vidéo (contrat __anim) comme pour la page. Le cadre (textes, frise, boucle, export) : core/reel.js.
import { isLand } from "../../core/aemap.js";
import { makeReel, clamp, ease, easeOut, label } from "../../core/reel.js";
import { ECL_PATHS } from "../../data/presets/ecl.js";
import { SURV_EXCESS, SURV_EXCESS_ST, SURV_EXCESS_TRI } from "../../data/presets/surv-excess.js";

const D2R = Math.PI / 180;
const SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, Menlo, monospace";
const COL = {
  paper: "#fbfaf7", ink: "#151a21", soft: "#5b6470", faint: "#9aa1ab", globe: "#1d4ed8", flat: "#b45309",
  sea: "#dcebf2", rim: "#3d7f99", land: "#b9a77a", wave: "#dc2626", core: "#f3d9b1", mantle: "#f6ecdc",
};

// scènes : clé (textes reel-<clé>-k/-a/-b) et durée (s)
export const SCENES = [
  // le séisme d'abord : après le volcan, des ondes à travers la Terre passaient pour celles de l'éruption (2026-10-25)
  // 2026-10-28 : les triangles des géodésiens (surv) ajoutés, et le rythme un peu resserré (≈ 51 s comme avant, une scène de plus) ;
  // le même jour, tri passe à 5,8 s (les triangles des levés apparaissent avant la règle) ; ecl garde 6,4 s (ses instants sont fixes, jusqu'à ≈ 6,1 s)
  { key: "intro", d: 3, num: false }, { key: "seis", d: 5.4 }, { key: "baro", d: 5.4 }, { key: "hh", d: 5.4 }, { key: "tri", d: 5.8 },
  { key: "avia", d: 5.4 }, { key: "sat", d: 5.4 }, { key: "ecl", d: 6.4 }, { key: "fou", d: 6.2 }, { key: "outro", d: 3.8, num: false },
];
// ---- géométrie de la sphère (degrés) ----
function vec(lat, lon) { const p = lat * D2R, l = lon * D2R; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; }
function latlon(v) { return [Math.asin(clamp(v[2], -1, 1)) / D2R, Math.atan2(v[1], v[0]) / D2R]; }
/** Point à la distance angulaire d (°) et au cap b (°) de (lat, lon). */
function dest(lat, lon, d, b) {
  const p1 = lat * D2R, l1 = lon * D2R, dd = d * D2R, bb = b * D2R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(dd) + Math.cos(p1) * Math.sin(dd) * Math.cos(bb));
  const l2 = l1 + Math.atan2(Math.sin(bb) * Math.sin(dd) * Math.cos(p1), Math.cos(dd) - Math.sin(p1) * Math.sin(p2));
  return [p2 / D2R, l2 / D2R];
}
function angDist(a, b) { const u = vec(...a), v = vec(...b); return Math.acos(clamp(u[0] * v[0] + u[1] * v[1] + u[2] * v[2], -1, 1)) / D2R; }
/** Point à la fraction f du grand cercle a → b. */
function slerp(a, b, f) {
  const u = vec(...a), v = vec(...b), w = Math.acos(clamp(u[0] * v[0] + u[1] * v[1] + u[2] * v[2], -1, 1));
  if (w < 1e-9) return a;
  const s = Math.sin(w), k1 = Math.sin((1 - f) * w) / s, k2 = Math.sin(f * w) / s;
  return latlon([k1 * u[0] + k2 * v[0], k1 * u[1] + k2 * v[1], k1 * u[2] + k2 * v[2]]);
}
/** Projection orthographique centrée sur (lat0, lon0) : [x, y (vers le bas), visible (cos c)] sur le disque unité. */
function ortho(lat0, lon0) {
  const s0 = Math.sin(lat0 * D2R), c0 = Math.cos(lat0 * D2R);
  return (lat, lon) => {
    const p = lat * D2R, dl = (lon - lon0) * D2R, cp = Math.cos(p);
    return [cp * Math.sin(dl), -(c0 * Math.sin(p) - s0 * cp * Math.cos(dl)), s0 * Math.sin(p) + c0 * cp * Math.cos(dl)];
  };
}

// les continents en points (décor : masque Natural Earth 0,5°, un point tous les 3°), calculés une fois
let DOTS = null;
function landDots() {
  if (DOTS) return DOTS;
  DOTS = [];
  for (let lat = -84; lat <= 84; lat += 3) {
    const step = 3 / Math.max(0.2, Math.cos(lat * D2R));
    for (let lon = -180; lon < 180; lon += step) if (isLand(lat, lon)) DOTS.push([lat, lon]);
  }
  return DOTS;
}

/** Globe en points : mer, continents, bord. Renvoie la projection vers l'écran. */
function globe(ctx, cx, cy, r, lat0, lon0, o = {}) {
  const P = ortho(lat0, lon0);
  ctx.fillStyle = COL.sea; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = COL.land;
  const dr = Math.max(0.6, r * 0.013);
  for (const [la, lo] of landDots()) {
    const [x, y, c] = P(la, lo); if (c <= 0) continue;
    ctx.globalAlpha = (o.alpha ?? 1) * (0.35 + 0.65 * c);
    ctx.fillRect(cx + x * r - dr, cy + y * r - dr, 2 * dr, 2 * dr);
  }
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.strokeStyle = COL.rim; ctx.lineWidth = Math.max(1, r * 0.012);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
  ctx.globalAlpha = 1;
  const S = (lat, lon) => { const [x, y, c] = P(lat, lon); return [cx + x * r, cy + y * r, c]; };
  return S;
}
/** Une ligne de points (lat, lon) sur le globe, seulement la face visible. */
function strokeOnGlobe(ctx, S, pts) {
  ctx.beginPath(); let pen = false;
  for (const p of pts) { const [x, y, c] = S(...p); if (c > 0) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; }
  ctx.stroke();
}
function dot(ctx, x, y, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); }
function plane(ctx, x, y, ang, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * 0.6, -s * 0.55); ctx.lineTo(-s * 0.3, 0); ctx.lineTo(-s * 0.6, s * 0.55); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---- les scènes : (ctx, boîte, u, d, T, fs) ; la boîte est la zone du dessin ----
const BARO = [[51.5, -0.1], [40.7, -74], [35.7, 139.7], [-33.9, 18.4], [19.4, -99.1], [55.8, 37.6], [-23.5, -46.6], [28.6, 77.2],
  [64.1, -21.9], [-1.3, 36.8], [61.2, -149.9], [-41.3, 174.8], [1.35, 103.8], [30, 31.2], [-34.6, -58.4], [48.9, 2.35]];
const TONGA = [-20.5, -175.4], ANTI = [20.5, 4.6];
function sceneBaro(ctx, b, u, d, T, fs) {
  const r = Math.min(b.w, b.h) * 0.42, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const a = 180 * ease((u - 0.5) / (d - 1.3));                  // rayon angulaire du front de l'onde
  const c = dest(...TONGA, 25 + a * 0.75, 300);                  // la vue suit le front, du volcan vers son antipode
  const S = globe(ctx, cx, cy, r, c[0], c[1]);
  // le volcan : un éclair au départ
  const [vx, vy, vc] = S(...TONGA);
  if (vc > 0) { const k = clamp(1 - u / 1.2); dot(ctx, vx, vy, r * (0.03 + 0.09 * k), `rgba(220,38,38,${0.35 + 0.6 * k})`); dot(ctx, vx, vy, r * 0.025, COL.wave); }
  // le front : petit cercle de rayon a autour du volcan, deux traits (onde et son halo)
  if (a > 0.5 && a < 179.5) {
    const ring = Array.from({ length: 181 }, (_, i) => dest(...TONGA, a, i * 2));
    ctx.strokeStyle = "rgba(220,38,38,0.22)"; ctx.lineWidth = r * 0.07; strokeOnGlobe(ctx, S, ring);
    ctx.strokeStyle = COL.wave; ctx.lineWidth = Math.max(1.5, r * 0.014); strokeOnGlobe(ctx, S, ring);
  }
  // les baromètres : un saut quand le front passe
  for (const p of BARO) {
    const [x, y, c2] = S(...p); if (c2 <= 0) continue;
    const dd = a - angDist(TONGA, p), hit = dd > 0 ? Math.exp(-dd / 6) : 0;
    dot(ctx, x, y, r * (0.022 + 0.05 * hit), dd > 0 ? COL.ink : COL.soft);
    if (hit > 0.05) { ctx.strokeStyle = `rgba(21,26,33,${hit})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r * (0.05 + 0.08 * (1 - hit)), 0, 2 * Math.PI); ctx.stroke(); }
  }
  // l'antipode : l'onde s'y referme
  const [ax, ay, ac] = S(...ANTI);
  if (ac > 0 && a > 170) { const k = (a - 170) / 10; ctx.strokeStyle = COL.wave; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay, r * 0.04 * (1 + 2 * k), 0, 2 * Math.PI); ctx.stroke(); }
  label(ctx, T("reel-baro-lab"), cx, b.y + b.h - fs * 0.3, { size: fs * 0.62 });
}

// Séisme : la même coupe que l'onglet seis (seis-legacy.js drawSeisCore : rayons de PREM à l'échelle, trajets schématiques,
// mêmes couleurs), mais animée (2026-10-25, propriétaire) : les ondes partent et progressent -- P dans le manteau, Pdif le long
// du noyau, PKP à travers lui, S arrêtée à sa surface --, les stations s'allument à leur arrivée, et seulement ensuite
// l'ombre (103°–143°) apparaît.
function sceneSeis(ctx, b, u, d, T, fs) {
  const R = Math.min(b.w, b.h) * 0.4, cx = b.x + b.w / 2, cy = b.y + b.h / 2 + R * 0.04;
  const rCMB = R * 3480 / 6371, rICB = R * 1221 / 6371;
  const P = (ang, rad) => [cx + rad * Math.sin(ang * D2R), cy - rad * Math.cos(ang * D2R)];
  // les couches
  for (const [rr, fill, line] of [[R, "rgba(122,106,79,.10)", "#7a6a4f"], [rCMB, "rgba(180,83,9,.13)", "#b45309"], [rICB, "rgba(109,40,217,.14)", "#6d28d9"]]) {
    ctx.fillStyle = fill; ctx.strokeStyle = line; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  }
  // l'ombre, à la fin seulement
  const ks = ease((u - (d - 2.1)) / 0.7);
  if (ks > 0) {
    ctx.globalAlpha = ks; ctx.fillStyle = "rgba(180,83,9,.18)";
    for (const sg of [1, -1]) { ctx.beginPath(); ctx.moveTo(cx, cy); for (let a = 103; a <= 143; a += 2) ctx.lineTo(...P(sg * a, R * 1.12)); ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // les trajets : [points (angle, rayon) en fonction de s ∈ [0, 1]], couleur, tirets, départ, durée (s), étiquette
  const seg = (pts) => (s) => { const q = s * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(q)), f = q - j;
    return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]; };
  const mantle = (D, sg) => (s) => { const depth = R * (0.30 + 0.62 * D / 103); return [sg * D * s, R - (R - Math.max(depth, rCMB * 1.02)) * Math.sin(Math.PI * s)]; };
  const RAYS = [];
  for (const sg of [1, -1]) {
    for (const D of [25, 50, 75, 103]) RAYS.push({ f: mantle(D, sg), c: "#0f766e", w: D === 103 ? 2 : 1.4, t0: 0.3, dur: 0.6 + 1.5 * D / 103, end: sg * D, lab: D === 75 && sg > 0 ? "P" : "" });
    RAYS.push({ f: seg([[0, R], [sg * 42, rCMB * 1.01], [sg * 96, rCMB * 1.01], [sg * 118, R]]), c: "#5b6470", dash: [3, 2], w: 1.4, t0: 0.3, dur: 2.5, end: sg * 118, weak: true, lab: sg < 0 ? "Pdif" : "" });
    RAYS.push({ f: seg([[0, R], [sg * 22, rCMB], [sg * 75, rICB * 1.4], [sg * 128, rCMB], [sg * 152, R]]), c: "#6d28d9", w: 1.8, t0: 0.3, dur: 3.0, end: sg * 152, lab: sg > 0 ? "PKP" : "" });
    RAYS.push({ f: (s) => [sg * 30 * s, R - (R - rCMB) * s], c: "#b45309", dash: [5, 3], w: 1.8, t0: 0.3, dur: 1.4, stop: true, lab: sg < 0 ? "S" : "" });
  }
  const arrived = [];
  for (const r of RAYS) {
    const k = clamp((u - r.t0) / r.dur); if (k <= 0) continue;
    ctx.strokeStyle = r.c; ctx.lineWidth = r.w; ctx.setLineDash(r.dash || []); ctx.beginPath();
    const n = Math.max(2, Math.round(60 * k));
    for (let i = 0; i <= n; i++) { const [a, rr] = r.f(k * i / n); const [x, y] = P(a, rr); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);
    const [a, rr] = r.f(k), [hx, hy] = P(a, rr);
    if (k < 1) dot(ctx, hx, hy, R * 0.022, r.c);                       // la tête de l'onde
    else if (r.stop) { ctx.strokeStyle = r.c; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(hx - R * 0.04, hy - R * 0.04); ctx.lineTo(hx + R * 0.04, hy + R * 0.04); ctx.moveTo(hx + R * 0.04, hy - R * 0.04); ctx.lineTo(hx - R * 0.04, hy + R * 0.04); ctx.stroke(); }
    else arrived.push({ at: r.end, c: r.c, weak: r.weak, since: u - r.t0 - r.dur });
    if (r.lab && k > 0.55) { const [a2, r2] = r.f(Math.min(1, k) * 0.55), [lx, ly] = P(a2, r2); label(ctx, r.lab, lx + (a2 > 0 ? fs * 0.6 : -fs * 0.6), ly, { size: fs * 0.55, col: r.c, weight: 700 }); }
  }
  // les stations, tous les 20° autour de la surface : allumées à l'arrivée d'une onde, éteintes dans l'ombre
  for (let a = -180; a < 180; a += 20) {
    if (a === 0) continue;
    const hit = arrived.filter((h) => Math.abs(h.at - a) <= 10 || (Math.abs(h.at) < 103 && Math.abs(a) <= Math.abs(h.at) && Math.sign(a) === Math.sign(h.at)) || (Math.abs(h.at) > 143 && Math.abs(a) >= 143));
    const [x, y] = P(a, R), on = hit.find((h) => !h.weak), weak = hit.find((h) => h.weak);
    const col = on ? on.c : weak ? "#9aa1ab" : "rgba(91,100,112,.35)", pulse = on ? Math.exp(-Math.max(0, on.since) * 2.5) : 0;
    dot(ctx, x, y, R * (0.026 + 0.035 * pulse), col);
  }
  // l'épicentre, et les bords de l'ombre
  const [ex, ey] = P(0, R); dot(ctx, ex, ey, R * (0.03 + 0.05 * clamp(1 - u / 0.8)), COL.wave);
  if (ks > 0) {
    ctx.globalAlpha = ks;
    for (const [a, lab] of [[103, "103°"], [143, "143°"]]) for (const sg of [1, -1]) { const [x, y] = P(sg * a, R * 1.2); label(ctx, lab, x, y, { size: fs * 0.55, col: "#b45309", font: MONO, weight: 700 }); }
    label(ctx, T("reel-seis-shadow"), cx, cy + R * 1.08 + fs * 0.6, { size: fs * 0.58, col: "#b45309", weight: 700 });
    ctx.globalAlpha = 1;
  }
  label(ctx, T("reel-seis-core"), cx, cy, { size: fs * 0.55, col: "#6d28d9" });
}

const SYD = [-33.9, 151.2], SCL = [-33.4, -70.7];
function sceneAvia(ctx, b, u, d, T, fs) {
  const two = b.w > b.h * 0.95, r = two ? Math.min(b.w * 0.24, b.h * 0.4) : Math.min(b.w * 0.3, b.h * 0.22);
  const g = two ? [b.x + b.w * 0.27, b.y + b.h * 0.48] : [b.x + b.w * 0.5, b.y + b.h * 0.27];
  const m = two ? [b.x + b.w * 0.75, b.y + b.h * 0.48] : [b.x + b.w * 0.5, b.y + b.h * 0.74];
  const p = ease((u - 0.8) / (d - 2.2));                            // avancement de l'avion du globe
  const Lg = angDist(SYD, SCL) * 111.2;                             // km, sur la sphère
  // la carte plate (projection azimutale équidistante centrée sur le pôle nord) : rayon ∝ 90° − latitude
  const AE = (lat, lon) => { const q = (90 - lat) / 180 * r, a = lon * D2R; return [m[0] + q * Math.sin(a), m[1] + q * Math.cos(a)]; };
  const A = AE(...SYD), B = AE(...SCL), Lf = Math.hypot(B[0] - A[0], B[1] - A[1]) / r * 180 * 111.2;
  // globe : centré sur le milieu de la route
  const mid = slerp(SYD, SCL, 0.5), S = globe(ctx, ...g, r, mid[0] + 15, mid[1]);
  const route = Array.from({ length: 81 }, (_, i) => slerp(SYD, SCL, i / 80));
  ctx.strokeStyle = "rgba(29,78,216,0.25)"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); strokeOnGlobe(ctx, S, route); ctx.setLineDash([]);
  ctx.strokeStyle = COL.globe; ctx.lineWidth = 2.4; strokeOnGlobe(ctx, S, route.slice(0, Math.max(1, Math.round(p * 80)) + 1));
  for (const c of [SYD, SCL]) { const [x, y, v] = S(...c); if (v > 0) dot(ctx, x, y, r * 0.035, COL.ink); }
  { const P1 = S(...slerp(SYD, SCL, p)), P2 = S(...slerp(SYD, SCL, Math.min(1, p + 0.01))); if (P1[2] > 0) plane(ctx, P1[0], P1[1], Math.atan2(P2[1] - P1[1], P2[0] - P1[0]), r * 0.07, COL.globe); }
  // carte plate : le même avion, à la même vitesse
  ctx.fillStyle = COL.sea; ctx.beginPath(); ctx.arc(...m, r, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = COL.land; const dr = Math.max(0.6, r * 0.011);
  for (const [la, lo] of landDots()) { const [x, y] = AE(la, lo); ctx.fillRect(x - dr, y - dr, 2 * dr, 2 * dr); }
  ctx.strokeStyle = COL.flat; ctx.lineWidth = Math.max(1, r * 0.012); ctx.beginPath(); ctx.arc(...m, r, 0, 2 * Math.PI); ctx.stroke();
  const pf = p * Lg / Lf;
  ctx.strokeStyle = "rgba(180,83,9,0.3)"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = COL.flat; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(A[0] + (B[0] - A[0]) * pf, A[1] + (B[1] - A[1]) * pf); ctx.stroke();
  dot(ctx, ...A, r * 0.035, COL.ink); dot(ctx, ...B, r * 0.035, COL.ink);
  plane(ctx, A[0] + (B[0] - A[0]) * pf, A[1] + (B[1] - A[1]) * pf, Math.atan2(B[1] - A[1], B[0] - A[0]), r * 0.07, COL.flat);
  const km = (x) => `${(Math.round(x / 100) * 100).toLocaleString(T.lang)} km`;
  const ly = (c) => c[1] + r + fs * 0.75;
  label(ctx, `${T("reel-avia-g")} · ${km(Lg)}`, g[0], ly(g), { size: fs * 0.6, col: COL.globe });
  label(ctx, `${T("reel-avia-f")} · ${km(Lf)}`, m[0], ly(m), { size: fs * 0.6, col: COL.flat });
  if (p >= 1) {
    const k = ease((u - (d - 1.4)) / 0.4);
    ctx.globalAlpha = k;
    label(ctx, T("reel-avia-landed"), g[0], ly(g) + fs * 0.85, { size: fs * 0.58, col: COL.globe, weight: 700 });
    label(ctx, T("reel-avia-still").replace("{p}", Math.round(pf * 100)), m[0], ly(m) + fs * 0.85, { size: fs * 0.58, col: COL.flat, weight: 700 });
    ctx.globalAlpha = 1;
  }
}

function sceneSat(ctx, b, u, d, T, fs) {
  const R = Math.min(b.w, b.h) * 0.24, cx = b.x + b.w / 2, cy = b.y + b.h / 2, k = 1.75;
  // l'orbite dans l'espace (inclinaison 55° sur l'équateur, comme le GPS), projetée par la vue du globe au départ ; la Terre
  // tourne dessous. Rayon k (schéma : le GPS est à 4,2 rayons terrestres)
  const INC = 55 * D2R, NODE = -60, N = vec(0, NODE), E = vec(0, NODE + 90), M = [E[0] * Math.cos(INC), E[1] * Math.cos(INC), Math.sin(INC)];
  const V0 = ortho(25, 10);
  const at = (a) => { const [la, lo] = latlon([Math.cos(a) * N[0] + Math.sin(a) * M[0], Math.cos(a) * N[1] + Math.sin(a) * M[1], Math.cos(a) * N[2] + Math.sin(a) * M[2]]);
    const [x, y, c] = V0(la, lo); return { s: [cx + k * R * x, cy + k * R * y], front: c >= 0, hid: c < 0 && k * Math.hypot(x, y) < 1 }; };
  const th = (t) => 1.2 + t * 0.32;                                // angle sur l'orbite (rad)
  const pos = (t) => at(th(t)), scr = (o) => o.s;
  const orbit = Array.from({ length: 181 }, (_, i) => at((i / 180) * 2 * Math.PI));
  const hidden = (o) => o.hid;
  const drawOrbit = (front) => {
    ctx.strokeStyle = "rgba(29,78,216,0.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); let pen = false;
    for (const o of orbit) { const ok = o.front === front && !o.hid; if (ok) { pen ? ctx.lineTo(...o.s) : ctx.moveTo(...o.s); pen = true; } else pen = false; }
    ctx.stroke();
  };
  drawOrbit(false);
  const S = globe(ctx, cx, cy, R, 25, 10 - u * 4);
  // les récepteurs au sol
  const RX = [[48, 2], [40, -4], [52, 13], [30, 31], [10, 8], [59, 18], [38, 23]];
  const sat = pos(u), sp = scr(sat);
  // les fronts Doppler : un toutes les 0,3 s, centré là où était le satellite (serrés devant lui, espacés derrière)
  const c = R * 1.4;
  for (let te = Math.floor(u / 0.25) * 0.25; te > u - 0.9 && te >= 0; te -= 0.25) {
    const rr = (u - te) * c * 0.45, e = scr(pos(te)), al = 0.6 * (1 - (u - te) / 0.9);
    ctx.strokeStyle = `rgba(29,78,216,${al})`; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(...e, rr, 0, 2 * Math.PI); ctx.stroke();
  }
  for (const p of RX) {
    const [x, y, v] = S(...p); if (v <= 0) continue;
    const near = Math.exp(-Math.abs(((u * 10) % 3) - 1.5 + (p[1] % 3)) * 2);
    dot(ctx, x, y, R * 0.045, COL.ink);
    ctx.strokeStyle = `rgba(21,26,33,${0.25 + 0.5 * near})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...sp); ctx.stroke();
  }
  drawOrbit(true);
  if (!hidden(sat)) {
    ctx.save(); ctx.translate(...sp); ctx.fillStyle = COL.globe; ctx.fillRect(-R * 0.05, -R * 0.05, R * 0.1, R * 0.1);
    ctx.fillStyle = "#6b8fe8"; ctx.fillRect(-R * 0.17, -R * 0.025, R * 0.1, R * 0.05); ctx.fillRect(R * 0.07, -R * 0.025, R * 0.1, R * 0.05); ctx.restore();
  }
  // le centre commun : une croix au centre du globe, à la fin
  if (u > d * 0.55) {
    const a = ease((u - d * 0.55) / 0.6); ctx.globalAlpha = a; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - R * 0.08, cy); ctx.lineTo(cx + R * 0.08, cy); ctx.moveTo(cx, cy - R * 0.08); ctx.lineTo(cx, cy + R * 0.08); ctx.stroke();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(21,26,33,0.5)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...sp); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, T("reel-sat-centre"), cx, cy + R + fs * 0.9, { size: fs * 0.6 }); ctx.globalAlpha = 1;
  }
}

// Foucault : le globe vu du pôle Nord tourne (sens direct) ; trois pendules, au pôle, à Paris et à l'équateur. Le sol de
// chacun, vu de là-haut, est une ellipse écrasée par sin φ : au pôle il pivote comme un disque sur une platine, à l'équateur il
// est vu par la tranche et ne pivote pas. Le plan du pendule tourne, par rapport au sol, de Ω·t·sin φ (sens horaire vu d'en
// haut) : au pôle il reste immobile à l'écran, le sol tourne dessous.
const FOU = [{ key: "reel-fou-pole", p: [90, 0] }, { key: "reel-fou-paris", p: [48.85, 2.35] }, { key: "reel-fou-eq", p: [0, -78.5] }];
function sceneFou(ctx, b, u, d, T, fs) {
  const spin = 120 * ease((u - 0.5) / (d - 1.3));                 // degrés tournés par la Terre (8 h)
  const side = b.w > b.h * 0.9;
  const r = side ? Math.min(b.w * 0.27, b.h * 0.4) : Math.min(b.w * 0.28, b.h * 0.3);
  const g = side ? [b.x + b.w * 0.3, b.y + b.h * 0.5] : [b.x + b.w * 0.3, b.y + b.h * 0.5];
  const S = globe(ctx, ...g, r, 90, -30 - spin);
  // le sens de rotation, autour du pôle
  ctx.strokeStyle = COL.flat; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(...g, r * 1.08, -2.2, -0.9); ctx.stroke();
  { const a = -0.9, x = g[0] + r * 1.08 * Math.cos(a), y = g[1] + r * 1.08 * Math.sin(a), h = r * 0.06, tx = -Math.sin(a), ty = Math.cos(a);
    ctx.fillStyle = COL.flat; ctx.beginPath(); ctx.moveTo(x + tx * h, y + ty * h); ctx.lineTo(x - ty * h * 0.6, y + tx * h * 0.6); ctx.lineTo(x + ty * h * 0.6, y - tx * h * 0.6); ctx.closePath(); ctx.fill(); }
  const sw = Math.sin(u * 2 * Math.PI / 1.4);                      // l'oscillation (schéma)
  FOU.forEach((P, j) => {
    const sinp = Math.sin(P.p[0] * D2R), rel = spin * sinp * D2R;   // angle du plan par rapport au sol, depuis le nord local, vers l'est
    const [x, y] = S(...P.p), fr = r * 0.17;
    // repère local à l'écran : nord = vers le pôle (raccourci par sin φ), est = tangent ; au pôle, le méridien 0 tient lieu de nord
    let nx, ny;
    if (P.p[0] > 89) { const q = S(80, 0); nx = (x - q[0]); ny = (y - q[1]); } else { nx = g[0] - x; ny = g[1] - y; }
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const ex = -ny, ey = nx, k = Math.max(0.06, sinp);
    ctx.save(); ctx.translate(x, y); ctx.transform(ex, ey, nx * k, ny * k, 0, 0);   // le sol : un disque dans le repère (est, nord·sin φ)
    ctx.fillStyle = "rgba(239,233,220,0.95)"; ctx.beginPath(); ctx.arc(0, 0, fr, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
    const L = fr * 0.85, vx = (Math.sin(rel) * ex + Math.cos(rel) * nx * k) * L, vy = (Math.sin(rel) * ey + Math.cos(rel) * ny * k) * L;
    ctx.strokeStyle = COL.flat; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - vx, y - vy); ctx.lineTo(x + vx, y + vy); ctx.stroke();
    dot(ctx, x + vx * sw, y + vy * sw, r * 0.025, COL.ink);
    label(ctx, String(j + 1), x + (P.p[0] > 89 ? fr * 1.2 : -nx * fr * 1.5), y + (P.p[0] > 89 ? -fr * 0.9 : -ny * fr * 1.5), { size: fs * 0.55, col: COL.ink, weight: 700 });
  });
  // les trois sols vus d'en haut, sur place : le plan tourne de 15°/h × sin φ
  const fr2 = Math.min(b.w * 0.09, b.h * 0.1), colX = b.x + b.w * 0.82;
  FOU.forEach((P, j) => {
    const sinp = Math.sin(P.p[0] * D2R), cy2 = b.y + b.h * (0.12 + 0.32 * j), cx2 = colX;
    ctx.fillStyle = "#efe9dc"; ctx.beginPath(); ctx.arc(cx2, cy2, fr2, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = COL.rim; ctx.lineWidth = 1.2; ctx.stroke();
    for (let i = 0; i <= 12; i++) {                                 // la trace : les plans passés
      const a = (-90 + spin * sinp * i / 12) * D2R;
      ctx.strokeStyle = `rgba(180,83,9,${0.1 + 0.6 * i / 12})`; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(cx2 - fr2 * 0.85 * Math.cos(a), cy2 - fr2 * 0.85 * Math.sin(a)); ctx.lineTo(cx2 + fr2 * 0.85 * Math.cos(a), cy2 + fr2 * 0.85 * Math.sin(a)); ctx.stroke();
    }
    const a = (-90 + spin * sinp) * D2R; dot(ctx, cx2 + fr2 * 0.85 * sw * Math.cos(a), cy2 + fr2 * 0.85 * sw * Math.sin(a), fr2 * 0.12, COL.ink);
    label(ctx, `${j + 1} · ${T(P.key)}`, cx2, cy2 + fr2 + fs * 0.5, { size: fs * 0.52, col: COL.ink, weight: 700 });
    label(ctx, `${(15 * sinp + 0).toFixed(1).replace(".", T.lang === "fr" ? "," : ".")}°/h · ${Math.round(spin * sinp) + 0}°`, cx2, cy2 + fr2 + fs * 1.15, { size: fs * 0.5, col: COL.flat, font: MONO, weight: 600 });
  });
  label(ctx, T("reel-fou-t").replace("{h}", (spin / 15).toFixed(1).replace(".", T.lang === "fr" ? "," : ".")), g[0], g[1] + r + fs * 1.5, { size: fs * 0.55, col: COL.soft, font: MONO, weight: 600 });
}

function sceneGlobe(ctx, b, u, d, T, fs, big) {
  const r = Math.min(b.w, b.h) * (big ? 0.4 : 0.4), cx = b.x + b.w / 2, cy = b.y + b.h / 2 + (big ? r * 0.08 : 0);
  const s = 0.85 + 0.15 * easeOut(u / 0.8), R = r * s, LAT0 = 18;
  globe(ctx, cx, cy, R, LAT0, 30 - u * 28);                        // vers l'est : le centre de la vue recule en longitude
  if (!big) return;
  // l'axe (vertical à l'écran : le pôle penche vers nous de LAT0) et le sens de rotation, d'ouest en est
  const k = ease((u - 0.6) / 0.6); ctx.globalAlpha = k;
  const py = cy - R * Math.cos(LAT0 * D2R), top = py - R * 0.42;
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, top); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + R * Math.cos(LAT0 * D2R)); ctx.lineTo(cx, cy + R * Math.cos(LAT0 * D2R) + R * 0.12); ctx.stroke();
  // flèche courbe autour de l'axe : le devant (vers nous) va de gauche à droite
  const yc = py - R * 0.22, rx = R * 0.16, ry = rx * Math.sin(LAT0 * D2R) * 1.6, t0 = Math.PI + 0.9, t1 = 0.35;
  ctx.strokeStyle = COL.flat; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let i = 0; i <= 30; i++) { const th = t0 + (t1 - t0) * i / 30, x = cx + rx * Math.cos(th), y = yc + ry * Math.sin(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  const ex = cx + rx * Math.cos(t1), ey = yc + ry * Math.sin(t1), dx = rx * Math.sin(t1), dy = -ry * Math.cos(t1), dl = Math.hypot(dx, dy), h = R * 0.06;
  const ux = dx / dl, uy = dy / dl;
  ctx.fillStyle = COL.flat; ctx.beginPath(); ctx.moveTo(ex + ux * h, ey + uy * h); ctx.lineTo(ex - uy * h * 0.6, ey + ux * h * 0.6); ctx.lineTo(ex + uy * h * 0.6, ey - ux * h * 0.6); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}

// Hauteur cachée (hh) : un navire s'éloigne ; vue de côté (courbure exagérée en RÉDUISANT la planète, règle 1) et ce que voit
// l'œil au téléobjectif, sur le globe et sur le plan. La part cachée suit H = (d − d₀)²/2R (œil 2 m, navire 30 m, R = 6 371 km).
function sceneHh(ctx, b, u, d, T, fs) {
  const Rkm = 6371, eye = 0.002, ship = 0.03, d0 = Math.sqrt(2 * Rkm * eye);
  const dk = 4 + 23 * ease((u - 0.4) / (d - 1.2));                     // distance du navire (km)
  const hid = dk > d0 ? Math.min(ship, (dk - d0) ** 2 / (2 * Rkm)) : 0, f = hid / ship;
  // vue de côté, à échelle uniforme (règle 1) : la planète réduite EX fois, l'œil et le navire agrandis EX fois -- même part
  // cachée, puisque H = (d − d₀)²/2R et d₀ = √(2Rh) gardent leur rapport aux hauteurs
  const sv = { x: b.x, y: b.y, w: b.w, h: b.h * 0.48 }, EX = 100, span = 30;
  const s = sv.w / span, Rp = Rkm / EX * s, x0 = sv.x + fs * 0.6;          // px par km ; rayon réduit en px
  const top = sv.y + sv.h * 0.5, kmTop = span / 2, cx = x0 + kmTop * s, cy = top + Rp;
  const at = (km, hkm = 0) => { const a = (km - kmTop) * s / Rp, r = Rp + hkm * EX * s; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
  ctx.save(); ctx.beginPath(); ctx.rect(sv.x, sv.y, sv.w, sv.h); ctx.clip();
  ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 2 * Math.PI); ctx.fillStyle = "#c9dfe9"; ctx.fill(); ctx.strokeStyle = COL.rim; ctx.lineWidth = 1.5; ctx.stroke();
  const E = at(0, eye), ae = Math.acos(Rp / (Rp + eye * EX * s)), a0 = -kmTop * s / Rp, H = [cx + Rp * Math.sin(a0 + ae), cy - Rp * Math.cos(a0 + ae)];
  const dir = [H[0] - E[0], H[1] - E[1]], L = Math.hypot(...dir);
  ctx.strokeStyle = "rgba(21,26,33,0.55)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(...E); ctx.lineTo(E[0] + dir[0] / L * sv.w * 1.2, E[1] + dir[1] / L * sv.w * 1.2); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  dot(ctx, ...E, fs * 0.2, COL.ink);
  // le navire : un mât sur la mer, la part cachée en pâle
  const S0 = at(dk), S1 = at(dk, ship), Sm = [S0[0] + (S1[0] - S0[0]) * f, S0[1] + (S1[1] - S0[1]) * f];
  ctx.lineWidth = Math.max(2.5, fs * 0.2); ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(180,83,9,0.3)"; ctx.beginPath(); ctx.moveTo(...S0); ctx.lineTo(...Sm); ctx.stroke();
  ctx.strokeStyle = COL.flat; ctx.beginPath(); ctx.moveTo(...Sm); ctx.lineTo(...S1); ctx.stroke(); ctx.lineCap = "butt";
  label(ctx, T("reel-hh-exag"), sv.x + sv.w / 2, sv.y + fs * 0.4, { size: fs * 0.5, col: COL.faint, weight: 500 });
  // ce que voit l'œil (téléobjectif) : globe / plan
  const ey = b.y + b.h * 0.56, eh = b.h * 0.36, ew = (b.w - fs) / 2;
  const view = (x0, sunk, name, col) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, ey, ew, eh); ctx.clip();
    ctx.fillStyle = "#eef3f7"; ctx.fillRect(x0, ey, ew, eh * 0.62); ctx.fillStyle = "#9cc3d5"; ctx.fillRect(x0, ey + eh * 0.62, ew, eh * 0.38);
    const hz = ey + eh * 0.62, sz = eh * 0.55 * 6 / dk, sx = x0 + ew / 2;     // taille apparente ∝ 1/d
    ctx.save(); ctx.beginPath(); ctx.rect(x0, ey, ew, hz - ey); ctx.clip();
    ctx.translate(sx, hz + sz * sunk);
    ctx.fillStyle = COL.ink;
    ctx.beginPath(); ctx.moveTo(-sz * 0.5, -sz * 0.18); ctx.lineTo(sz * 0.5, -sz * 0.18); ctx.lineTo(sz * 0.38, 0); ctx.lineTo(-sz * 0.38, 0); ctx.closePath(); ctx.fill();   // coque
    ctx.fillRect(-sz * 0.02, -sz, sz * 0.04, sz * 0.82);                                                       // mât
    ctx.beginPath(); ctx.moveTo(sz * 0.03, -sz * 0.95); ctx.lineTo(sz * 0.36, -sz * 0.3); ctx.lineTo(sz * 0.03, -sz * 0.3); ctx.closePath(); ctx.fill();   // voile
    ctx.restore(); ctx.restore();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x0, ey, ew, eh);
    label(ctx, name, x0 + ew / 2, ey + eh + fs * 0.55, { size: fs * 0.58, col });
  };
  view(b.x, f, `${T("reel-avia-g")} · ${Math.round(f * 100)} % ${T("reel-hh-hidden")}`, COL.globe);
  view(b.x + ew + fs, 0, `${T("reel-hh-plane")} · 0 % ${T("reel-hh-hidden")}`, COL.flat);
  label(ctx, `${dk.toFixed(0)} km`, b.x + b.w / 2, ey - fs * 0.45, { size: fs * 0.55, col: COL.soft, font: MONO });
}

// Saros (ecl) : 223 mois synodiques ≈ 242 draconitiques ≈ 239 anomalistiques = 18 ans 11 j 7 h 43 min ; l'éclipse revient,
// mais les 7 h 43 min de plus font tourner la Terre d'environ 116° : la suivante tombe d'autant plus à l'ouest. Les points
// de plus grande éclipse sont ceux du saros 136 (2009, 2027, 2045, NASA, onglet ecl), les bandes sont schématiques.
// La bande de 2027 telle que NASA la publie (limites nord et sud, ligne centrale : ECL_PATHS, onglet ecl), reportée sur
// chaque membre en la décalant de son point de plus grande éclipse (propriétaire, 2026-10-25 : le même tracé à chaque fois)
const P27 = ECL_PATHS["2027"].filter((q) => q.c && q.n && q.s);
const SAROS = [{ y: 2009, p: [24.2, 144.1] }, { y: 2027, p: [25.5, 33.2] }, { y: 2045, p: [25.9, -78.5] }]
  .map((m) => { const dla = m.p[0] - 25.5, dlo = m.p[1] - 33.2, sh = ([la, lo]) => [la + dla, lo + dlo];
    return { ...m, c: P27.map((q) => sh(q.c)), n: P27.map((q) => sh(q.n)), s: P27.map((q) => sh(q.s)) }; });
function sceneEcl(ctx, b, u, d, T, fs) {
  const r = Math.min(b.w * 0.42, b.h * 0.31), cx = b.x + b.w / 2, cy = b.y + b.h * 0.57;
  // les trois cycles : trois cadrans qui comptent leurs mois et se rejoignent
  const pc = ease((u - 0.2) / 1.8), DIALS = [[223, "reel-ecl-syn", COL.ink], [242, "reel-ecl-dra", COL.globe], [239, "reel-ecl-ano", COL.flat]];
  const dr = Math.min(fs * 0.95, b.w * 0.07), dy = b.y + dr + fs * 0.3;
  DIALS.forEach(([N, key, col], j) => {
    const x = b.x + b.w * (0.2 + 0.3 * j), n = N * pc, ang = n * 2 * Math.PI - Math.PI / 2;
    ctx.strokeStyle = COL.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, dy, dr, 0, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, dy); ctx.lineTo(x + dr * 0.85 * Math.cos(ang), dy + dr * 0.85 * Math.sin(ang)); ctx.stroke();
    if (pc >= 1) { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, dy, dr * (1.1 + 0.3 * clamp(1 - (u - 2) / 0.6)), 0, 2 * Math.PI); ctx.globalAlpha = clamp(1 - (u - 2) / 0.6); ctx.stroke(); ctx.globalAlpha = 1; }
    label(ctx, `${Math.floor(n)}`, x, dy + dr + fs * 0.55, { size: fs * 0.62, col, font: MONO, weight: 700 });
    label(ctx, T(key), x, dy + dr + fs * 1.2, { size: fs * 0.46, col: COL.soft, weight: 500 });
  });
  // le globe : la caméra suit le point de plus grande éclipse d'un membre au suivant
  const t1 = 2.3, rotD = 0.9, drawD = 1.0;                         // début du premier décalage ; durées de rotation et de tracé
  const k1 = ease((u - t1) / rotD), k2 = ease((u - (t1 + rotD + drawD)) / rotD);
  const lon = SAROS[0].p[1] + (SAROS[1].p[1] - SAROS[0].p[1]) * k1 + (SAROS[2].p[1] - SAROS[1].p[1]) * k2;
  const S = globe(ctx, cx, cy, r, 22, lon);
  const band = (m, q) => {                                         // la bande de totalité, tracée d'ouest en est jusqu'à q
    const n = Math.max(2, Math.round(m.c.length * q)), c = m.c.slice(0, n);
    ctx.strokeStyle = "rgba(21,26,33,0.16)"; ctx.lineWidth = r * 0.05; ctx.lineCap = "round"; strokeOnGlobe(ctx, S, c); ctx.lineCap = "butt";
    // la bande elle-même : limite nord, puis limite sud à rebours (face visible seulement)
    const poly = [...m.n.slice(0, n), ...m.s.slice(0, n).reverse()].map((p) => S(...p));
    if (poly.every((p) => p[2] > 0)) { ctx.fillStyle = "rgba(21,26,33,0.75)"; ctx.beginPath(); poly.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); }
    else { ctx.strokeStyle = "rgba(21,26,33,0.75)"; ctx.lineWidth = Math.max(2, r * 0.02); strokeOnGlobe(ctx, S, c); }
    const [x, y, v] = S(...m.p); if (v > 0 && q > 0.5) { dot(ctx, x, y, r * 0.025, COL.wave); label(ctx, String(m.y), x, y - r * 0.12, { size: fs * 0.62, col: COL.ink, weight: 700 }); }
  };
  const starts = [0.4, t1 + rotD, t1 + 2 * rotD + drawD];
  SAROS.forEach((m, j) => { const q = clamp((u - starts[j]) / drawD); if (q > 0) band(m, q); });
  if (k1 <= 0) label(ctx, T("reel-ecl-paths"), cx, cy + r + fs * 0.7, { size: fs * 0.52, col: COL.soft, weight: 500 });
  // le décalage : un arc vers l'ouest le long du parallèle, pendant la rotation
  for (const [j, k] of [[0, k1], [1, k2]]) {
    if (k <= 0 || (j === 0 && k2 > 0.6)) continue;
    const A = SAROS[j].p, B = SAROS[j + 1].p, dl = B[1] - A[1];
    const pts = Array.from({ length: 31 }, (_, i) => [A[0] + (B[0] - A[0]) * i / 30 * k, A[1] + dl * i / 30 * k]);
    ctx.strokeStyle = COL.flat; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]); strokeOnGlobe(ctx, S, pts); ctx.setLineDash([]);
    ctx.globalAlpha = Math.min(1, k * 2); label(ctx, T("reel-ecl-shift"), cx, cy + r + fs * 0.7, { size: fs * 0.62, col: COL.flat, weight: 700 }); ctx.globalAlpha = 1;
  }
}


// Triangles (surv), 2026-10-28 (propriétaire) : d'abord la quantité -- les triangles des levés apparaissent là où ils ont été
// mesurés (SURV_EXCESS_TRI : un par case de 1° des chaînes de Schott, Delambre et Maclear, de 15 à 45 km de côté, chacun
// agrandi TRI_X fois autour de son centre ; Roy et Struve, sans positions, sur leur tracé approximatif), le globe tournant
// de l'Amérique vers l'Europe et le Cap ; puis la règle : un triangle équilatéral grandit, la somme de ses angles dépasse 180°
// de son aire divisée par R² (cos σ = cos² ρ − sin² ρ / 2 donne l'angle au sommet), le même sur le plan reste à 180°.
const TRI_X = 12;
let TRIS = null;
function surveyTris() {
  if (TRIS) return TRIS;
  const big = (c, v) => {                                          // agrandi TRI_X fois autour du centre c (repère local)
    const la = c[0] + TRI_X * (v[0] - c[0]);
    return [la, c[1] + TRI_X * (v[1] - c[1]) * Math.cos(c[0] * D2R) / Math.cos(la * D2R)];
  };
  const seen = new Set(); TRIS = [];
  for (const t of SURV_EXCESS_TRI) {
    const ix = t.slice(5, 8), sides = t.slice(8, 11);
    if (ix.some((i) => i < 0) || sides.some((s) => !(s >= 15 && s <= 45))) continue;
    const v = ix.map((i) => SURV_EXCESS_ST[i]), c = [0, 1].map((j) => (v[0][j] + v[1][j] + v[2][j]) / 3);
    const cell = `${Math.round(c[0])},${Math.round(c[1] * Math.cos(c[0] * D2R))}`;
    if (seen.has(cell)) continue;
    seen.add(cell); TRIS.push({ c, v: v.map((p) => big(c, p)) });
  }
  // Roy (Hounslow → Douvres) et la moitié sud de l'arc de Struve (golfe de Finlande → Danube) : pas de positions dans nos
  // transcriptions, des triangles de 30 km (agrandis de même) posés le long de leur tracé, à l'endroit approximatif
  for (const [a, b2, n] of [[[51.45, -0.4], [51.05, 1.3], 2], [[59.4, 25.6], [45.4, 28.6], 14]]) {
    for (let i = 0; i < n; i++) {
      const c = slerp(a, b2, n > 1 ? i / (n - 1) : 0), rr = TRI_X * 30 / Math.sqrt(3) / 111.2;
      TRIS.push({ c, v: [0, 120, 240].map((az) => dest(c[0], c[1], rr, az + 60 * (i % 2))) });
    }
  }
  return TRIS.sort((p, q) => p.c[1] - q.c[1]);                     // d'ouest en est : l'ordre d'apparition
}
function sceneTri(ctx, b, u, d, T, fs) {
  const tris = surveyTris(), N = tris.length;
  const t0 = 0.15, t1 = 2.45, tm = 2.45, tg = 2.95;                // apparitions, puis passage au côte à côte et croissance
  const m = ease((u - tm) / 0.5);
  const half = (b.w - fs) / 2, r2 = Math.min(half, b.h * 0.86) * 0.46, r1 = Math.min(b.w, b.h * 0.86) * 0.46;
  const r = r1 + (r2 - r1) * m, gx = b.x + b.w / 2 + (half / 2 - b.w / 2) * m, cy = b.y + b.h * 0.47;
  const kv = ease((u - 0.2) / (tm - 0.2)), C0 = [38 + (22 - 38) * kv, -95 + (-20 + 95) * kv];   // la vue : Amérique → Atlantique
  const S = globe(ctx, gx, cy, r, C0[0], C0[1]);
  // les triangles des levés
  let shown = 0;
  const fade = 1 - 0.6 * ease((u - tg) / 0.4);
  tris.forEach((tr, i) => {
    const ti = t0 + (t1 - t0) * i / N, k = easeOut((u - ti) / 0.25);
    if (k <= 0) return;
    shown++;
    const pts = tr.v.map((p) => S(tr.c[0] + (p[0] - tr.c[0]) * k, tr.c[1] + (p[1] - tr.c[1]) * k));
    if (pts.some((p) => p[2] <= 0)) return;
    ctx.globalAlpha = fade; ctx.beginPath(); pts.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = "rgba(29,78,216,0.3)"; ctx.fill(); ctx.strokeStyle = COL.globe; ctx.lineWidth = Math.max(1, r * 0.008); ctx.stroke();
    ctx.globalAlpha = 1;
  });
  if (m < 0.5) {                                                   // les textes se relaient : le compte s'efface, puis les sommes
    ctx.globalAlpha = 1 - 2 * m;
    label(ctx, `${Math.round(SURV_EXCESS.triangles * shown / N).toLocaleString(T("reel-tri-loc"))} ${T("reel-tri-n")}`, gx, cy + r + fs * 0.75, { size: fs * 0.62, col: COL.globe, font: MONO, weight: 700 });
    label(ctx, T("reel-tri-big").replace("{x}", TRI_X), gx, cy + r + fs * 1.4, { size: fs * 0.48, col: COL.soft, weight: 500 });
    ctx.globalAlpha = 1;
  }
  if (m <= 0) return;
  // la règle : un triangle grandit au centre de la vue, le même sur le plan
  const g = ease((u - tg) / (d - 0.5 - tg)), sig = (6 + 54 * g) * D2R;            // côté du triangle (angle au centre)
  const A = Math.acos(Math.cos(sig) / (1 + Math.cos(sig))), sum = 3 * A / D2R;     // angle au sommet (équilatéral sphérique)
  const rho = Math.acos(Math.sqrt((2 * Math.cos(sig) + 1) / 3)) / D2R;              // rayon angulaire du cercle circonscrit
  const V = [0, 120, 240].map((az) => dest(C0[0], C0[1], rho, az));
  ctx.globalAlpha = ease((u - tg) / 0.3);
  ctx.strokeStyle = COL.globe; ctx.lineWidth = Math.max(2, fs * 0.16);
  for (let i = 0; i < 3; i++) { const pts = []; for (let j = 0; j <= 30; j++) pts.push(slerp(V[i], V[(i + 1) % 3], j / 30)); strokeOnGlobe(ctx, S, pts); }
  for (const v of V) { const [x, y] = S(...v); dot(ctx, x, y, fs * 0.16, COL.globe); }
  const ml = clamp(2 * m - 1);
  ctx.globalAlpha = ml;
  label(ctx, `${T("reel-avia-g")} · ${T("reel-tri-sum")} ${sum.toFixed(1)}°`, gx, cy + r + fs * 0.9, { size: fs * 0.6, col: COL.globe, font: MONO });
  // le plan : le même côté, un triangle équilatéral à 180° (taille à l'écran : celle de la corde, en proportion)
  const px = b.x + half + fs + half / 2, side = 2 * r * Math.sin(sig / 2), hgt = side * Math.sqrt(3) / 2;
  ctx.fillStyle = "#f3efe6"; ctx.fillRect(b.x + half + fs, cy - r, half, 2 * r);
  ctx.globalAlpha = Math.min(m, ease((u - tg) / 0.3));
  ctx.strokeStyle = COL.flat; ctx.lineWidth = Math.max(2, fs * 0.16); ctx.beginPath();
  ctx.moveTo(px - side / 2, cy + hgt / 3); ctx.lineTo(px + side / 2, cy + hgt / 3); ctx.lineTo(px, cy - 2 * hgt / 3); ctx.closePath(); ctx.stroke();
  ctx.globalAlpha = ml;
  label(ctx, `${T("reel-hh-plane")} · ${T("reel-tri-sum")} 180.0°`, px, cy + r + fs * 0.9, { size: fs * 0.6, col: COL.flat, font: MONO });
  ctx.globalAlpha = 1;
}

export const DRAW = { intro: (c, b, u, d, T, fs) => sceneGlobe(c, b, u, d, T, fs, false), baro: sceneBaro, seis: sceneSeis, hh: sceneHh, tri: sceneTri, ecl: sceneEcl, avia: sceneAvia, sat: sceneSat, fou: sceneFou,
  outro: (c, b, u, d, T, fs) => sceneGlobe(c, b, u, d, T, fs, true) };

// à l'arrêt (mouvement réduit) : une image parlante, l'onde de pression
const STILL = SCENES.slice(0, SCENES.findIndex((x) => x.key === "baro")).reduce((a, x) => a + x.d, 0) + 3;
const REEL = makeReel({ scenes: SCENES, draw: DRAW, prefix: "reel", still: STILL });
export const REEL_T = REEL.total;
export const { sceneAt, drawReel, mountReel } = REEL;
