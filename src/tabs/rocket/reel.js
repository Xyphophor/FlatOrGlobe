// Vitrine de l'onglet rocket (propriétaire, 2026-10-27 : « une animation vitrine qui résumerait l'onglet ») : six scènes
// de billes, les mêmes gaz que les animations de la page (scenes.js), forces mesurées de la même façon. Une boîte fermée
// (les coups s'annulent), un trou (une poussée qui s'éteint), le feu (une pression qui tient), la tuyère (la poussée = ce
// que le jet emporte), l'air (il retient), l'espace (le centre de masse ne bouge pas). Cadre : core/reel.js.
import { makeReel, label, REEL_COL } from "../../core/reel.js";
import { boxGas, holeGas, rocketGas, freeFlight, fit, balls, walls, flame, rocketFill, push, ballR, P0, FREE, GAS_C, AIR_C, PUSH_C, ROCKET } from "./scenes.js";

const EN = {
  "rk-schem": "balls enlarged and few; every push measured",
  "rk-box-k": "Pressure",
  "rk-box-a": "Pressure is nothing but molecules hitting the walls.",
  "rk-box-b": "In a closed box each wall is hit as hard as the opposite one: the box goes nowhere.",
  "rk-hole-k": "A hole",
  "rk-hole-a": "Open a hole in the bottom: the top is still hit, the missing piece of bottom is not.",
  "rk-hole-b": "The box is pushed upwards, until it is empty.",
  "rk-fire-k": "The fire",
  "rk-fire-a": "A fire makes new gas faster than the narrow throat lets it out.",
  "rk-fire-b": "The pressure rises until as much leaves as is made, then holds: the vacuum outside sucks nothing.",
  "rk-nozzle-k": "The push",
  "rk-nozzle-a": "The gas pushes the top of the chamber up harder than it pushes anything down.",
  "rk-nozzle-b": "It equals what the jet carries off each second: Newton's third law, hit by hit.",
  "rk-air-k": "The air",
  "rk-air-a": "The air pushes on the outside of the rocket, everywhere except the nozzle exit: it holds the rocket back.",
  "rk-air-b": "The RS-25 gives {{fVac}} kN in a vacuum and {{fSl}} kN at sea level. Goddard measured it first, in 1916.",
  "rk-free-k": "Empty space",
  "rk-free-a": "Free in space, the rocket throws its fuel backwards and speeds up.",
  "rk-free-b": "The centre of mass of rocket and fuel never moves: nothing outside is needed. v = u ln(m₀/m).",
  "rk-push": "push on the rocket", "rk-jet": "carried off by the jet per second", "rk-sum": "sum", "rk-vac": "empty space", "rk-airlab": "air",
  "rk-com": "centre of mass", "rk-n": "balls in the chamber",
  "rk-alt": "Animation: gas balls hitting the walls of a closed box, then of a box with a hole, then of a rocket chamber kept full by a fire; the push on the rocket equals the momentum of the jet; the same rocket loses thrust in air; in empty space the centre of mass of rocket and fuel never moves",
};

const nf = (lang, x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
// une scène = un gaz ; at(u) le joue depuis le début de la scène (u recule à chaque passage : le gaz repart de zéro)
const G = { box: boxGas(), hole: holeGas({ t: 1.6 }), fire: rocketGas({ prefill: false }), nozzle: rocketGas({ prefill: true }), vac: rocketGas({ prefill: true, seed: 3 }), air: rocketGas({ prefill: true, air: true, seed: 3 }) };
const FLY = freeFlight();

function sceneBox(ctx, b, u, d, T, fs) {
  const g = G.box.at(u), V = fit(b, { x0: -0.35, x1: 1.35, y0: -0.35, y1: 1.35 });
  ctx.fillStyle = "#fff7ed"; ctx.fillRect(V.X(0), V.Y(1), V.s, V.s);
  balls(ctx, g.balls, V, ballR(V)); walls(ctx, g.wallsAt(u), V, Math.max(2.5, fs * 0.14));
  const k = (0.22 * V.s) / P0, lw = Math.max(2, fs * 0.12);
  let sx = 0, sy = 0;
  for (const [q, x, y] of [["top", 0.5, 1], ["bottom", 0.5, 0], ["left", 0, 0.5], ["right", 1, 0.5]]) { const F = g.force(q, 1.2); sx += F.x; sy += F.y; push(ctx, V.X(x), V.Y(y), F.x * k, -F.y * k, PUSH_C, lw); }
  label(ctx, `${T("rk-sum")}: ${nf(T.lang, (100 * Math.hypot(sx, sy)) / P0)}`, V.X(0.5), V.Y(0.5), { size: fs * 0.7, col: REEL_COL.ink, weight: 800 });
}

function sceneHole(ctx, b, u, d, T, fs) {
  const g = G.hole.at(u), MB = { x0: -0.45, x1: 1.45, y0: -0.75, y1: 1.4 }, V = fit(b, MB);
  ctx.fillStyle = "#fff7ed"; ctx.fillRect(V.X(0), V.Y(1), V.s, V.s);
  balls(ctx, g.balls, V, ballR(V), MB); walls(ctx, g.wallsAt(u), V, Math.max(2.5, fs * 0.14));
  const k = (0.32 * V.s) / P0, lw = Math.max(2, fs * 0.12), Ft = g.force("top", 1), Fb = g.force("bottom", 1), Fh = g.force("hole", 1), Fn = g.bodyForce(1);
  push(ctx, V.X(0.5), V.Y(1), 0, -Ft.y * k, PUSH_C, lw);
  push(ctx, V.X(0.18), V.Y(0), 0, -Fb.y * k * 0.5, PUSH_C, lw); push(ctx, V.X(0.82), V.Y(0), 0, -Fb.y * k * 0.5, PUSH_C, lw);
  if (Fh.y) push(ctx, V.X(0.5), V.Y(0), 0, -Fh.y * k, PUSH_C, lw);
  push(ctx, V.X(1.25), V.Y(0.5), 0, -Fn.y * k, REEL_COL.ink, lw * 1.5);
}

function sceneFire(ctx, b, u, d, T, fs) {
  const g = G.fire.at(u), MB = { x0: -0.7, x1: 0.7, y0: -0.55, y1: 1.05 }, V = fit(b, MB);
  rocketFill(ctx, V); flame(ctx, V, true, u); balls(ctx, g.balls, V, ballR(V), MB); walls(ctx, g.wallsAt(u), V, Math.max(2.5, fs * 0.14));
  // la jauge : billes dans la chambre
  const gx = V.X(0.5), gy0 = V.Y(0.25), gy1 = V.Y(1), f = Math.min(1, g.count() / 400);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy1, fs * 0.6, gy0 - gy1);
  ctx.fillStyle = GAS_C; ctx.fillRect(gx, gy0 - f * (gy0 - gy1), fs * 0.6, f * (gy0 - gy1));
  label(ctx, nf(T.lang, g.count()), gx + fs * 0.3, gy1 - fs * 0.5, { size: fs * 0.55, col: GAS_C, weight: 700 });
}

function sceneNozzle(ctx, b, u, d, T, fs) {
  const g = G.nozzle.at(u + 3), MB = { x0: -0.95, x1: 0.95, y0: -0.5, y1: 1.3 }, V = fit(b, MB);   // +3 s : régime déjà établi
  rocketFill(ctx, V); flame(ctx, V, true, u); balls(ctx, g.balls, V, ballR(V), MB); walls(ctx, g.wallsAt(u + 3), V, Math.max(2.5, fs * 0.14));
  const k = (0.3 * V.s) / 600, lw = Math.max(2, fs * 0.12), R = ROCKET, w = u + 2.8;
  push(ctx, V.X(0), V.Y(R.top), 0, -g.force("top", w).y * k, PUSH_C, lw);
  for (const sx of [-1, 1]) push(ctx, V.X(sx * (R.w + R.hT) / 2), V.Y((R.yConv + R.yThroat) / 2), 0, (-g.force("conv", w).y * k) / 2, PUSH_C, lw);
  const Fn = g.bodyForce(w).y, J = -g.flowOut(w), bx = V.X(0.5), by = V.Y(0.15), bw = fs * 0.7, hk = (0.45 * V.s) / 120;
  ctx.fillStyle = REEL_COL.ink; ctx.fillRect(bx, by - Fn * hk, bw, Fn * hk);
  ctx.fillStyle = GAS_C; ctx.fillRect(bx + bw * 1.7, by - J * hk, bw, J * hk);
  label(ctx, nf(T.lang, Fn), bx + bw / 2, by - Fn * hk - fs * 0.45, { size: fs * 0.55, col: REEL_COL.ink, weight: 800 });
  label(ctx, nf(T.lang, J), bx + bw * 2.2, by - J * hk - fs * 0.45, { size: fs * 0.55, col: GAS_C, weight: 800 });
  label(ctx, T("rk-push"), bx + bw * 1.35, by + fs * 0.5, { size: fs * 0.42, col: REEL_COL.ink, weight: 600 });
  label(ctx, T("rk-jet"), bx + bw * 1.35, by + fs * 1.0, { size: fs * 0.42, col: GAS_C, weight: 600 });
}

function sceneAir(ctx, b, u, d, T, fs) {
  const t = u + 3, MB = { x0: -0.6, x1: 0.6, y0: -0.6, y1: 1.15 }, half = b.w / 2;
  for (const [i, g, lab] of [[0, G.vac.at(t), T("rk-vac")], [1, G.air.at(t), T("rk-airlab")]]) {
    const bb = { x: b.x + i * half, y: b.y + fs * 1.2, w: half, h: b.h - fs * 1.2 }, V = fit(bb, MB, 3);
    if (i) { ctx.fillStyle = "rgba(100,116,139,.08)"; ctx.fillRect(V.X(MB.x0), V.Y(MB.y1), V.s * 1.2, V.s * 1.75); }
    rocketFill(ctx, V); flame(ctx, V, true, u); balls(ctx, g.balls, V, Math.max(1.3, ballR(V) * 0.9), MB); walls(ctx, g.wallsAt(t), V, Math.max(2, fs * 0.11));
    label(ctx, `${lab}: ${nf(T.lang, g.bodyForce(t - 0.5).y)}`, bb.x + half / 2, b.y + fs * 0.5, { size: fs * 0.62, col: i ? AIR_C : REEL_COL.ink, weight: 800 });
  }
}

function sceneFree(ctx, b, u, d, T, fs) {
  const t = Math.min(15, u * 2), s = FLY(t), end = FLY(15), xMax = end.xr + 0.6, xMin = Math.min(...end.pel.map((p) => p.x)) - 0.4;
  const cx = b.x + b.w * 0.35, Y = (x) => b.y + b.h - 6 - ((x - xMin) / (xMax - xMin)) * (b.h - 12), r = Math.max(2.2, fs * 0.13);
  for (const p of s.pel) { ctx.fillStyle = p.v > 0 ? "#9a3412" : GAS_C; ctx.beginPath(); ctx.arc(cx + ((p.i * 37) % 11 - 5) * fs * 0.12, Y(p.x), r, 0, 2 * Math.PI); ctx.fill(); }
  const yr = Y(s.xr), rw = fs * 0.5, rh = fs * 1.7;
  ctx.fillStyle = "#e5e7eb"; ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = Math.max(1.5, fs * 0.08);
  ctx.beginPath(); ctx.moveTo(cx, yr - rh); ctx.lineTo(cx + rw, yr - rh + rh * 0.4); ctx.lineTo(cx + rw, yr); ctx.lineTo(cx - rw, yr); ctx.lineTo(cx - rw, yr - rh + rh * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
  const yc = Y(s.com), c = fs * 0.45; ctx.strokeStyle = PUSH_C; ctx.lineWidth = Math.max(2, fs * 0.12);
  ctx.beginPath(); ctx.moveTo(cx - c, yc - c); ctx.lineTo(cx + c, yc + c); ctx.moveTo(cx + c, yc - c); ctx.lineTo(cx - c, yc + c); ctx.stroke();
  label(ctx, T("rk-com"), cx + fs * 0.8, yc, { size: fs * 0.5, col: PUSH_C, align: "left", weight: 700 });
  // la vitesse et la courbe de Tsiolkovski
  const gx0 = b.x + b.w * 0.6, gx1 = b.x + b.w - fs * 0.3, gy0 = b.y + b.h * 0.8, gy1 = b.y + b.h * 0.25, xx = (q) => gx0 + (q / 15) * (gx1 - gx0), yy = (v) => gy0 - (v / 1.5) * (gy0 - gy1);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
  ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = Math.max(2, fs * 0.11); ctx.beginPath();
  for (let q = 0; q <= t; q += 0.1) { const m = FREE.M0 - FREE.prop * Math.min(1, q / FREE.burn), v = FREE.u * Math.log(FREE.M0 / m); q ? ctx.lineTo(xx(q), yy(v)) : ctx.moveTo(xx(q), yy(v)); }
  ctx.stroke();
  label(ctx, `v = ${nf(T.lang, s.v, 2)} u`, gx0 + fs * 0.2, gy1 - fs * 0.5, { size: fs * 0.55, col: REEL_COL.ink, align: "left", weight: 800 });
}

export const ROCKET_SCENES = [{ key: "box", d: 7.5 }, { key: "hole", d: 7.5 }, { key: "fire", d: 7.5 }, { key: "nozzle", d: 7.5 }, { key: "air", d: 7.5 }, { key: "free", d: 7.5 }];
export const ROCKET_DRAW = { box: sceneBox, hole: sceneHole, fire: sceneFire, nozzle: sceneNozzle, air: sceneAir, free: sceneFree };
// à l'arrêt : la tuyère, poussée et jet déjà mesurés
const REEL = makeReel({ scenes: ROCKET_SCENES, draw: ROCKET_DRAW, prefix: "rk", still: 3 * 7.5 + 5 });
export const ROCKET_REEL_T = REEL.total;
export const drawRocketReel = REEL.drawReel;
export const ROCKET_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = rocketValues. */
export function mountRocketReel(canvas, tr, lang, vals = {}) {
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("rk-alt"));
  return REEL.mountReel(canvas, T);
}
