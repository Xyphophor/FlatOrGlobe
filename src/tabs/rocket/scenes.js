// Ce que partagent les animations de l'onglet rocket et sa vitrine (2026-10-27) : les gaz de billes (balls.js) réglés une
// fois, la fusée sans frottement de l'espace (calcul exact, jet par jet), et les petits outils de dessin (cadrage du modèle
// à l'échelle uniforme, billes, parois, flèches de force).
import { makeGas, rocketWalls, jetWall, ROCKET, ROCKET_BODY, inChamber, inRocket, press2d } from "./balls.js";

export const SIG = 1.5;            // écart-type des vitesses du gaz chaud (unités du modèle par seconde)
export const RATE = 60;            // billes « brûlées » par seconde par la flamme
export const N_STEADY = 300;       // billes dans la chambre en régime établi à ce débit (mesuré : 290-310)
export const SIG_AIR = SIG * 0.7;  // l'air du dehors, plus froid
// pression de l'air : choisie pour que la poussée perde ~19 %, comme le RS-25 entre le vide et le niveau de la mer ; la
// chambre est alors ~37 fois plus pressée que l'air (le RS-25 : 204 fois)
export const P_AIR = 42;
export const BOX = { N: 400, sigma: 1 };   // la boîte fermée : P0 = N σ² sur une paroi de longueur 1
export const P0 = press2d(BOX.N, BOX.sigma);

export const GAS_C = "#c2410c", AIR_C = "#64748b", PUSH_C = "#0f766e", WALL_C = "#151a21", FLAME_C = "#f59e0b";

const OPEN = { left: "open", right: "open", bottom: "open", top: "open" };
const boxWalls = (hole) => {
  const W = [{ x1: 0, y1: 1, x2: 1, y2: 1, group: "top" }, { x1: 0, y1: 0, x2: 0, y2: 1, group: "left" }, { x1: 1, y1: 0, x2: 1, y2: 1, group: "right" }];
  if (!hole) W.push({ x1: 0, y1: 0, x2: 1, y2: 0, group: "bottom" });
  else W.push({ x1: 0, y1: 0, x2: hole.a, y2: 0, group: "bottom" }, { x1: hole.b, y1: 0, x2: 1, y2: 0, group: "bottom" }, { x1: hole.a, y1: 0, x2: hole.b, y2: 0, group: "hole", until: hole.t });
  // parois rugueuses (comme la chambre) : sans elles, les billes qui sortent par le trou sont celles qui vont le plus vite
  // vers le bas, et celles qui restent finissent par aller presque toutes à l'horizontale (un gaz sans chocs ne se remélange pas)
  for (const w of W) w.diffuse = true;
  return W;
};

/** La boîte fermée ; heatAt : instant où chaque bille va √2 fois plus vite (la température double). */
export function boxGas({ heatAt = null, seed = 5 } = {}) {
  return makeGas({ seed, walls: boxWalls(null), box: { x0: -1, x1: 2, y0: -1, y1: 2 }, body: ["top", "left", "right", "bottom"],
    init: [{ x0: 0.01, x1: 0.99, y0: 0.01, y1: 0.99, count: BOX.N, sigma: BOX.sigma, exact: true, zero: true }],
    events: heatAt == null ? [] : [{ t: heatAt, fn: (bs) => { for (const b of bs) { b.vx *= Math.SQRT2; b.vy *= Math.SQRT2; } } }] });
}
export const HOLE = { a: 0.32, b: 0.68, t: 2.5 };
/** La même boîte, dans le vide ; à HOLE.t un morceau du fond disparaît. */
export function holeGas({ seed = 5, t = HOLE.t } = {}) {
  return makeGas({ seed, walls: boxWalls({ ...HOLE, t }), box: { x0: -0.6, x1: 1.6, y0: -1.2, y1: 1.6 }, sides: OPEN, body: ["top", "left", "right", "bottom", "hole"],
    init: [{ x0: 0.01, x1: 0.99, y0: 0.01, y1: 0.99, count: BOX.N, sigma: BOX.sigma, exact: true, zero: true }], inside: (x, y) => x > 0 && x < 1 && y > 0 && y < 1 });
}

export const DOMAIN = { x0: -0.6, x1: 0.6, y0: -0.6, y1: 1.15 };
/** La fusée sur son banc : flamme (jusqu'à fireUntil), chambre pleine au départ ou vide, dans le vide ou dans l'air. */
export function rocketGas({ prefill = true, air = false, fireUntil = null, seed = 3, domain = DOMAIN } = {}) {
  const amb = { n: P_AIR / (SIG_AIR * SIG_AIR), sigma: SIG_AIR };
  const init = prefill ? [{ x0: -ROCKET.w, x1: ROCKET.w, y0: ROCKET.yThroat, y1: ROCKET.top, count: N_STEADY, sigma: SIG, keep: inChamber, zero: true }] : [];
  if (air) {
    const area = (domain.x1 - domain.x0) * (domain.y1 - domain.y0);
    init.push({ ...domain, count: Math.round(amb.n * (area - 0.5)), sigma: SIG_AIR, tag: "air", keep: (x, y) => !inRocket(x, y) });
  }
  return makeGas({ seed, walls: air ? [...rocketWalls(), jetWall()] : rocketWalls(), box: domain, sides: air ? { left: amb, right: amb, bottom: amb, top: amb } : OPEN,
    source: { x0: -0.24, x1: 0.24, y0: 0.86, y1: 0.95, rate: RATE, sigma: SIG, until: fireUntil }, body: ROCKET_BODY, inside: inChamber, exitY: ROCKET.yExit, init });
}

/* ---- la fusée dans l'espace : une suite de jets, chacun exact ------------------------------------------------------- */
// Masse 1, dont 0,75 de carburant jeté en K boulettes à la vitesse relative u = 1 pendant BURN secondes, puis le vol libre.
// Référentiel du départ (= du centre de masse, qui ne bouge jamais). Rapport de masses 4 : v final = u ln 4 = 1,39 u.
export const FREE = { M0: 1, prop: 0.75, K: 48, u: 1, burn: 9 };
export function freeFlight(F = FREE) {
  const dm = F.prop / F.K, jets = [];
  let M = F.M0, v = 0, x = 0, tPrev = 0;
  for (let i = 0; i < F.K; i++) {
    const ti = ((i + 0.5) * F.burn) / F.K;
    x += v * (ti - tPrev); tPrev = ti;
    const dv = (dm * F.u) / M; M -= dm; v += dv;
    jets.push({ t: ti, x, pv: v - F.u, v, M });
  }
  /** État à l'instant t : position et vitesse de la fusée, masse, boulettes parties { x, v }. */
  return function at(t) {
    let k = 0; while (k < jets.length && jets[k].t <= t) k++;
    const last = k ? jets[k - 1] : null, v = last ? last.v : 0, M = last ? last.M : F.M0;
    const xr = last ? last.x + v * (t - last.t) : 0;
    const pel = jets.slice(0, k).map((j, i) => ({ x: j.x + j.pv * (t - j.t), v: j.pv, i }));
    const com = (M * xr + pel.reduce((s, p) => s + dm * p.x, 0)) / F.M0;
    return { xr, v, M, pel, com, k, jets };
  };
}

/* ---- dessin --------------------------------------------------------------------------------------------------------- */
/** Cadre le rectangle du modèle mb dans la boîte b (px), échelle uniforme, y vers le haut. */
export function fit(b, mb, pad = 6) {
  const s = Math.min((b.w - 2 * pad) / (mb.x1 - mb.x0), (b.h - 2 * pad) / (mb.y1 - mb.y0));
  const ox = b.x + (b.w - s * (mb.x1 - mb.x0)) / 2, oy = b.y + (b.h - s * (mb.y1 - mb.y0)) / 2;
  return { s, X: (x) => ox + (x - mb.x0) * s, Y: (y) => oy + (mb.y1 - y) * s };
}
export function balls(ctx, bs, V, r, clip) {
  for (const [tag, col] of [["air", AIR_C], ["gas", GAS_C]]) {
    ctx.fillStyle = col; ctx.beginPath();
    for (const b of bs) {
      if (b.tag !== tag) continue;
      if (clip && (b.x < clip.x0 || b.x > clip.x1 || b.y < clip.y0 || b.y > clip.y1)) continue;
      const X = V.X(b.x), Y = V.Y(b.y); ctx.moveTo(X + r, Y); ctx.arc(X, Y, r, 0, 2 * Math.PI);
    }
    ctx.fill();
  }
}
export function walls(ctx, ws, V, w = 3) {
  ctx.strokeStyle = WALL_C; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath();
  for (const s of ws) { if (s.only) continue; ctx.moveTo(V.X(s.x1), V.Y(s.y1)); ctx.lineTo(V.X(s.x2), V.Y(s.y2)); }
  ctx.stroke();
}
/** La flamme en haut de la chambre (là où le carburant brûle et crée les billes). */
export function flame(ctx, V, on, t) {
  if (!on) return;
  const x0 = V.X(-0.24), x1 = V.X(0.24), y0 = V.Y(0.95), y1 = V.Y(0.86);
  ctx.fillStyle = `rgba(245,158,11,${0.22 + 0.08 * Math.sin(t * 9)})`; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}
export function rocketFill(ctx, V) {
  const R = ROCKET; ctx.fillStyle = "#fff7ed"; ctx.beginPath();
  for (const [x, y] of [[-R.w, R.top], [R.w, R.top], [R.w, R.yConv], [R.hT, R.yThroat], [R.hE, R.yExit], [-R.hE, R.yExit], [-R.hT, R.yThroat], [-R.w, R.yConv]]) ctx.lineTo(V.X(x), V.Y(y));
  ctx.closePath(); ctx.fill();
}
/** Flèche de force (px) à partir de (x, y) en px ; renvoie la pointe. */
export function push(ctx, x, y, dx, dy, col = PUSH_C, w = 2.4) {
  const L = Math.hypot(dx, dy); if (L < 2) return [x, y];
  const a = Math.atan2(dy, dx), h = Math.min(9, L * 0.5);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - Math.cos(a) * h * 0.6, y + dy - Math.sin(a) * h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - h * Math.cos(a - 0.42), y + dy - h * Math.sin(a - 0.42)); ctx.lineTo(x + dx - h * Math.cos(a + 0.42), y + dy - h * Math.sin(a + 0.42)); ctx.closePath(); ctx.fill();
  return [x + dx, y + dy];
}
export const ballR = (V) => Math.max(1.5, Math.min(3, V.s * 0.011));
export { ROCKET, ROCKET_BODY };
