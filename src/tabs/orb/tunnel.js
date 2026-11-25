// Vitrine du tunnel (propriétaire, 2026-10-25 : « quelqu'un a vraiment du mal avec les orbites ») : une balle tombe dans
// un tunnel qui traverse une Terre homogène et oscille (la pesanteur y vaut g r/R : un ressort) ; une deuxième, dans un
// tunnel perpendiculaire, a un quart de période de retard ; le point qui suit l'une en x et l'autre en y tourne sur un
// cercle au ras du sol, à √(gR), en 2π√(R/g) : l'orbite rasante de la section. Le découpage en deux balles indépendantes
// n'est exact que parce que la force est proportionnelle à r (dit dans la légende). Cadre : core/reel.js.
import { makeReel, ease, label, REEL_COL } from "../../core/reel.js";

const C = { ...REEL_COL, acc: "#0f766e", earth: "#efe3c8", rim: "#8a7a5a", tunnel: "#fbfaf7" };
const R = 6371e3, G = 9.82, W0 = Math.sqrt(G / R);
export const TUNNEL = { period: 2 * Math.PI / W0, vmax: W0 * R, g: G };   // 84,4 min, 7,91 km/s
const P = 5;                                                               // s d'écran par période
const TAU = 2 * Math.PI;

const EN = {
  "tun-schem": "schematic: uniform Earth, no air, balls enlarged",
  "tun-fall-k": "A tunnel through the Earth",
  "tun-fall-a": "Drop a ball into a hole that goes straight through the Earth.",
  "tun-fall-b": "With no air, it speeds up to the centre, slows down, stops just at the far side, and falls back. Forever.",
  "tun-curves-k": "Three waves",
  "tun-curves-a": "Its position, speed and pull rise and fall like waves, a quarter of a turn apart.",
  "tun-curves-b": "Inside the Earth, gravity weakens in a straight line towards the centre. That is a spring.",
  "tun-two-k": "A second ball",
  "tun-two-a": "A second ball does the same in a tunnel at right angles, a quarter of a swing behind.",
  "tun-two-b": "When one flies through the centre at full speed, the other is stopped at the edge.",
  "tun-orbit-k": "Both together",
  "tun-orbit-a": "Follow the point with the orange ball's left–right and the blue ball's up–down.",
  "tun-orbit-b": "It goes round in a circle just above the ground, at constant speed. That is an orbit.",
  "tun-fallorb-k": "An orbit is a fall",
  "tun-fallorb-a": "The two pulls add up to one, always towards the centre: the satellite falls all the time, like the balls.",
  "tun-fallorb-b": "It never lands because it also moves sideways, and keeps missing the Earth.",
  "tun-same-k": "Same clock",
  "tun-same-a": "Through the tunnel and back, or once round: 84 minutes, T = 2π√(R/g).",
  "tun-same-b": "The speed at the centre is the orbital speed, 7.9 km/s. Each satellite casts a ball's shadow.",
  "tun-t": "t", "tun-min": "min", "tun-pos": "position", "tun-speed": "speed", "tun-pull": "pull", "tun-centre": "centre",
  "tun-sum": "speed = sum of the two", "tun-acc": "pull: towards the centre",
  "tun-alt": "Animation: a ball swings through a tunnel across the Earth, a second one in a perpendicular tunnel a quarter of a swing behind; together they trace a circular orbit just above the ground, with the same 84-minute period",
};

const nf = (lang, x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
function ball(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = C.paper; ctx.lineWidth = Math.max(1.5, r * 0.25); ctx.stroke(); }
function arrow(ctx, x1, y1, x2, y2, col, lw) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); if (L < 3) return;
  const h = Math.min(lw * 4.5, L * 0.45);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4)); ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
/** La Terre en coupe et ses tunnels (opacités v, h). */
function earth(ctx, cx, cy, r, v, h) {
  ctx.fillStyle = C.earth; ctx.strokeStyle = C.rim; ctx.lineWidth = Math.max(1.5, r * 0.012);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.stroke();
  const tw = Math.max(5, r * 0.045);
  for (const [a, vert] of [[v, true], [h, false]]) {
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.tunnel; ctx.strokeStyle = C.faint; ctx.lineWidth = 1;
    if (vert) { ctx.fillRect(cx - tw, cy - r, 2 * tw, 2 * r); ctx.strokeRect(cx - tw, cy - r, 2 * tw, 2 * r); }
    else { ctx.fillRect(cx - r, cy - tw, 2 * r, 2 * tw); ctx.strokeRect(cx - r, cy - tw, 2 * r, 2 * tw); }
    ctx.restore();
  }
  ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, r * 0.018), 0, TAU); ctx.fill();
}
const geo = (b, k = 0.4) => ({ cx: b.x + b.w / 2, cy: b.y + b.h / 2, r: Math.min(b.w, b.h) * k });
const th = (u) => TAU * u / P;                    // phase de la balle bleue, partie du haut à u = 0
const minutes = (u) => (th(u) / W0) / 60;
const ACC = (r) => r * 0.34 / G;                   // px par m/s²

function clock(ctx, b, u, T, fs) {
  label(ctx, `${T("tun-t")} = ${nf(T.lang, minutes(u) % (TUNNEL.period / 60), 0)} ${T("tun-min")}`, b.x + b.w - fs * 0.3, b.y + fs * 0.6, { size: fs * 0.62, col: C.soft, align: "right", weight: 600 });
}

function sceneFall(ctx, b, u, d, T, fs) {
  const { cx, cy, r } = geo(b), a = th(u), y = r * Math.cos(a);
  earth(ctx, cx, cy, r, 1, 0);
  const B = [cx, cy - y], br = Math.max(6, r * 0.06);
  arrow(ctx, B[0] + br * 2.2, B[1], B[0] + br * 2.2, B[1] + G * Math.cos(a) * ACC(r), C.acc, Math.max(2, fs * 0.12));
  ball(ctx, ...B, br, C.globe);
  const v = Math.abs(TUNNEL.vmax * Math.sin(a)) / 1000;
  label(ctx, `${nf(T.lang, v, 1)} km/s`, B[0] - br * 2.2, B[1], { size: fs * 0.62, col: C.globe, align: "right", weight: 700 });
  label(ctx, T("tun-centre"), cx - r * 0.25, cy + fs * 0.7, { size: fs * 0.5, col: C.soft });
  clock(ctx, b, u, T, fs);
}

function sceneCurves(ctx, b, u, d, T, fs) {
  const land = b.w > b.h * 1.1;
  const eb = land ? { x: b.x, y: b.y, w: b.w * 0.4, h: b.h } : { x: b.x, y: b.y, w: b.w * 0.42, h: b.h };
  const { cx, cy, r } = geo(eb, 0.44), a = th(u);
  earth(ctx, cx, cy, r, 1, 0);
  ball(ctx, cx, cy - r * Math.cos(a), Math.max(5, r * 0.07), C.globe);
  const gx = eb.x + eb.w + fs * 0.6, gw = b.x + b.w - gx - fs * 0.3, rh = b.h / 3;
  const rows = [[T("tun-pos"), (t) => Math.cos(t)], [T("tun-speed"), (t) => -Math.sin(t)], [T("tun-pull"), (t) => -Math.cos(t)]];
  const shown = Math.min(1, u / P), cur = (u % P) / P;
  rows.forEach(([name, f], i) => {
    const mid = b.y + rh * i + rh * 0.58, A = rh * 0.3;
    label(ctx, name, gx, b.y + rh * i + rh * 0.14, { size: fs * 0.55, col: i === 2 ? C.acc : C.ink, align: "left", weight: 700 });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, mid); ctx.lineTo(gx + gw, mid); ctx.moveTo(gx, mid - A); ctx.lineTo(gx, mid + A); ctx.stroke();
    ctx.strokeStyle = i === 2 ? C.acc : C.globe; ctx.lineWidth = Math.max(2, fs * 0.11); ctx.beginPath();
    const n = Math.max(2, Math.round(80 * shown));
    for (let k = 0; k <= n; k++) { const s = shown * k / n, x = gx + s * gw, yy = mid - f(TAU * s) * A; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
    ctx.stroke();
    const s = shown < 1 ? shown : cur;
    ball(ctx, gx + s * gw, mid - f(TAU * s) * A, Math.max(3.5, fs * 0.22), i === 2 ? C.acc : C.globe);
  });
  label(ctx, `0 → ${nf(T.lang, TUNNEL.period / 60, 0)} ${T("tun-min")}`, gx + gw, b.y + rh * 0.14, { size: fs * 0.5, col: C.soft, align: "right", weight: 500 });
}

function twoBalls(ctx, cx, cy, r, a, k, arrows, fs) {
  const br = Math.max(6, r * 0.06), B1 = [cx, cy - r * Math.cos(a)], B2 = [cx + r * Math.sin(a), cy];
  if (arrows) {
    arrow(ctx, B1[0] + br * 2.2, B1[1], B1[0] + br * 2.2, B1[1] + G * Math.cos(a) * ACC(r), C.acc, Math.max(2, fs * 0.12));
    ctx.save(); ctx.globalAlpha *= k;
    arrow(ctx, B2[0], B2[1] - br * 2.2, B2[0] - G * Math.sin(a) * ACC(r), B2[1] - br * 2.2, C.acc, Math.max(2, fs * 0.12));
    ctx.restore();
  }
  ball(ctx, ...B1, br, C.globe);
  ctx.save(); ctx.globalAlpha *= k; ball(ctx, ...B2, br, C.flat); ctx.restore();
  return [B1, B2];
}

function sceneTwo(ctx, b, u, d, T, fs) {
  const { cx, cy, r } = geo(b), k = ease(u / 1);
  earth(ctx, cx, cy, r, 1, k);
  twoBalls(ctx, cx, cy, r, th(u), k, true, fs);
  clock(ctx, b, u, T, fs);
}

function sceneOrbit(ctx, b, u, d, T, fs) {
  const { cx, cy, r } = geo(b), a = th(u);
  earth(ctx, cx, cy, r, 1, 1);
  const [B1, B2] = twoBalls(ctx, cx, cy, r, a, 1, false, fs);
  const S = [B2[0], B1[1]], k = ease((u - 0.6) / 0.8);
  ctx.save(); ctx.globalAlpha *= k;
  // la trace : le cercle se dessine au fil du premier tour
  ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, fs * 0.09); ctx.setLineDash([fs * 0.35, fs * 0.3]);
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.min(TAU, a)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(...S); ctx.lineTo(...B1); ctx.moveTo(...S); ctx.lineTo(...B2); ctx.stroke(); ctx.setLineDash([]);
  const kv = r * 0.45, v1 = -Math.sin(a), v2 = Math.cos(a), lw = Math.max(2, fs * 0.11);
  arrow(ctx, S[0], S[1], S[0] + v2 * kv, S[1], C.flat, lw * 0.8);
  arrow(ctx, S[0], S[1], S[0], S[1] - v1 * kv, C.globe, lw * 0.8);
  arrow(ctx, S[0], S[1], S[0] + v2 * kv, S[1] - v1 * kv, C.ink, lw * 1.2);
  ball(ctx, ...S, Math.max(7, r * 0.07), C.ink);
  label(ctx, T("tun-sum"), b.x + fs * 0.3, b.y + b.h - fs * 0.4, { size: fs * 0.55, col: C.ink, align: "left", weight: 700 });
  ctx.restore();
  clock(ctx, b, u, T, fs);
}

function satellite(ctx, cx, cy, r, a, fs, tunnels) {
  earth(ctx, cx, cy, r, tunnels, tunnels);
  const S = [cx + r * 1.0 * Math.sin(a), cy - r * Math.cos(a)], lw = Math.max(2, fs * 0.12);
  ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, fs * 0.09); ctx.setLineDash([fs * 0.35, fs * 0.3]);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  arrow(ctx, S[0], S[1], S[0] + Math.cos(a) * r * 0.45, S[1] + Math.sin(a) * r * 0.45, C.ink, lw);
  arrow(ctx, S[0], S[1], S[0] - Math.sin(a) * G * ACC(r), S[1] + Math.cos(a) * G * ACC(r), C.acc, lw * 1.1);
  ball(ctx, ...S, Math.max(7, r * 0.07), C.ink);
  return S;
}

function sceneFallOrb(ctx, b, u, d, T, fs) {
  const { cx, cy, r } = geo(b), a = th(u), k = 1 - ease(u / 1.2);
  ctx.save(); ctx.globalAlpha *= k; earth(ctx, cx, cy, r, 1, 1); twoBalls(ctx, cx, cy, r, a, 1, false, fs); ctx.restore();
  satellite(ctx, cx, cy, r, a, fs, 1 - ease(u / 1.2));
  label(ctx, T("tun-acc"), b.x + fs * 0.3, b.y + b.h - fs * 0.4, { size: fs * 0.55, col: C.acc, align: "left", weight: 700 });
  label(ctx, `${nf(T.lang, G, 1)} m/s²`, cx, cy + fs * 0.9, { size: fs * 0.55, col: C.acc, weight: 700 });
}

function sceneSame(ctx, b, u, d, T, fs) {
  const land = b.w > b.h * 1.1, a = th(u);
  const L = land ? { x: b.x, y: b.y, w: b.w / 2, h: b.h } : { x: b.x, y: b.y, w: b.w / 2, h: b.h };
  const Rr = { ...L, x: L.x + L.w };
  const g1 = geo(L, 0.4), g2 = geo(Rr, 0.4);
  earth(ctx, g1.cx, g1.cy, g1.r, 1, 0);
  ball(ctx, g1.cx, g1.cy - g1.r * Math.cos(a), Math.max(5, g1.r * 0.07), C.globe);
  const S = satellite(ctx, g2.cx, g2.cy, g2.r, a, fs * 0.8, 0);
  // l'ombre du satellite sur l'axe vertical : la balle
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(g2.cx, S[1]); ctx.stroke(); ctx.setLineDash([]);
  ball(ctx, g2.cx, S[1], Math.max(4, g2.r * 0.05), C.globe);
  ctx.strokeStyle = C.faint; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(g1.cx, g1.cy - g1.r * Math.cos(a)); ctx.lineTo(g2.cx, S[1]); ctx.stroke(); ctx.setLineDash([]);
  const yl = Math.min(b.y + b.h - fs * 0.4, g1.cy + g1.r + fs * 1.1);
  label(ctx, `T = ${nf(T.lang, TUNNEL.period / 60, 0)} ${T("tun-min")}`, g1.cx, yl, { size: fs * 0.62, col: C.globe, weight: 700 });
  label(ctx, `T = ${nf(T.lang, TUNNEL.period / 60, 0)} ${T("tun-min")}`, g2.cx, yl, { size: fs * 0.62, col: C.ink, weight: 700 });
}

export const TUNNEL_SCENES = [
  { key: "fall", d: 8 }, { key: "curves", d: 8 }, { key: "two", d: 7 }, { key: "orbit", d: 8 }, { key: "fallorb", d: 7 }, { key: "same", d: 7.5 },
];
export const TUNNEL_DRAW = { fall: sceneFall, curves: sceneCurves, two: sceneTwo, orbit: sceneOrbit, fallorb: sceneFallOrb, same: sceneSame };
// à l'arrêt : le milieu de « les deux ensemble », cercle déjà tracé
const STILL = TUNNEL_SCENES.slice(0, 3).reduce((a, x) => a + x.d, 0) + 6.6;
const REEL = makeReel({ scenes: TUNNEL_SCENES, draw: TUNNEL_DRAW, prefix: "tun", still: STILL });
export const TUNNEL_T = REEL.total;
export const drawTunnel = REEL.drawReel;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet (fr/orb.json), repli anglais ici. */
export function mountTunnel(canvas, tr, lang) {
  const T = Object.assign((k) => tr(k, EN[k] ?? k), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("tun-alt"));
  return REEL.mountReel(canvas, T);
}
export const TUNNEL_EN = EN;
