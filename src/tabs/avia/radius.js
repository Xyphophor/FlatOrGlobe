// Figure 9 (epic14) : le rayon de la Terre tiré des temps de vol, route par
// route (logic.radiusFromFlights) -- comme seis avec la vitesse des ondes,
// la vitesse connue d'avance étant ici la vitesse propre déposée. Les points
// tombent un à un (du plus court au plus long trajet) puis restent ; les
// deux droites sont le rayon moyen de la Terre et l'ajustement global.
// 2026-11-20 (propriétaire) : à côté du nuage, le globe montre le vol de
// chaque point au moment où il apparaît (la vue tourne vers la route, l'arc
// de grand cercle se trace, le point tombe) ; les vols déjà vus restent en
// pâle. Lent au début, puis de plus en plus vite. Le globe est un décor : le
// rayon de chaque point vient des seuls temps et vitesses (logic.js).
import { setupCanvas } from "../../core/canvas.js";
import { routeStats, radiusFromFlights, gcPoint } from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { colors, label, dot, plane, orthoGlobe, strokeGlobe, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

let cache = null;
export function flightRadius() {
  cache ??= radiusFromFlights(ROUTES.map((r) => routeStats(r, AIRPORTS)));
  return cache;
}

const LL = (k) => [AIRPORTS[k].lat, AIRPORTS[k].lon];
const HOLD = 4;                                        // s, tout affiché avant de reboucler

/** Routes triées par distance, avec leur arc (40 pas), leur milieu et leur créneau de temps [t0, t0 + d] (s). */
let plan = null;
export function radiusPlan() {
  if (plan) return plan;
  const S = new Map(ROUTES.map((r) => routeStats(r, AIRPORTS)).map((s) => [s.key, s]));   // a, b, h, tas de chaque route
  const P = [...flightRadius().per].sort((p, q) => p.gc - q.gc).map((p) => { const s = S.get(p.key); return { ...p, a: s.a, b: s.b, h: s.h, tas: s.tas }; });
  let t = 0.3;
  const rows = P.map((p, i) => {
    const a = LL(p.a), b = LL(p.b), d = 0.35 + 1.6 * Math.exp(-i / 6);
    const r = { ...p, arc: Array.from({ length: 41 }, (_, k) => gcPoint(a, b, k / 40)), mid: gcPoint(a, b, 0.5), t0: t, d };
    t += d;
    return r;
  });
  plan = { rows, T: t + HOLD };
  return plan;
}

/** Fraction u (0..1) de l'animation d'une route au temps t. */
const phase = (r, t) => Math.max(0, Math.min(1, (t - r.t0) / r.d));
const ease = (x) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };

export function mountRadius(root, tr) {
  const cv = root.querySelector("#aviaRadius"), btn = root.querySelector("#aviaRadiusPlay");
  const st = { t: 0 };
  const caption = (r) => [`${r.a} → ${r.b} · ${num(r.gc)} km`,
    `${num(r.h, 1)} h · ${num(r.tas)} km/h → R = ${num(r.R)} km`];
  const current = () => {
    const { rows } = radiusPlan();
    let i = -1;
    for (let k = 0; k < rows.length; k++) if (st.t >= rows[k].t0) i = k;
    return i;
  };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe } = colors(cv);
    const F = flightRadius(), { rows } = radiusPlan(), OUT = "#b45309";
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W >= 560;
    // le globe : à gauche (large) ou en haut (étroit)
    const gw = wide ? W * 0.36 : W;
    const gR = wide ? Math.min(W * 0.16, H * 0.36) : Math.min(W * 0.3, 82);
    const gcx = gw / 2, gcy = wide ? H * 0.46 : 40 + gR;
    const capY = wide ? H - 30 : gcy + gR + 16;
    // le nuage : à droite (large) ou en bas (étroit)
    const x0 = (wide ? gw : 0) + 46, x1 = W - 12, y0 = wide ? 44 : capY + 34, y1 = H - 30;
    const hx = wide ? gw + 8 : 8;
    const dMax = Math.ceil(Math.max(...rows.map((p) => p.gc)) / 2000) * 2000;
    const rLo = 5000, rHi = 9000;
    const X = (d) => x0 + (d / dMax) * (x1 - x0), Y = (r) => y1 - (Math.min(rHi, Math.max(rLo, r)) - rLo) / (rHi - rLo) * (y1 - y0);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let r = rLo; r <= rHi; r += 1000) { ctx.beginPath(); ctx.moveTo(x0, Y(r)); ctx.lineTo(x1, Y(r)); ctx.stroke(); label(ctx, num(r), x0 - 4, Y(r), { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    for (let d = 0; d <= dMax; d += 4000) label(ctx, num(d), X(d), y1 + 11, { al: X(d) > x1 - 20 ? "right" : "center", col: SOFT, font: "9.5px system-ui, sans-serif" });
    label(ctx, tr("rd-x", "great-circle distance of the route (km)"), x1, y1 + 23, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(x0, Y(6371)); ctx.lineTo(x1, Y(6371)); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = globe; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, Y(F.R)); ctx.lineTo(x1, Y(F.R)); ctx.stroke();

    const cur = current(), done = st.t >= rows[rows.length - 1].t0 + rows[rows.length - 1].d;
    // points tombés (u ≥ 0,85 pour la route en cours)
    let n = 0;
    rows.forEach((p, i) => {
      const u = phase(p, st.t);
      if (u < 0.85) return;
      n++;
      const pop = ease((u - 0.85) / 0.15), col = p.R > rHi ? OUT : globe;
      dot(ctx, X(p.gc), Y(p.R), 3.2 * (i === cur && !done ? 0.6 + 0.4 * pop : 1), col);
      if (p.R > rHi) label(ctx, `${p.key.replace("-", "–")} ${num(p.R)} ↑`, X(p.gc) - 4, Y(rHi) + 10, { al: "right", col: OUT, font: "9.5px system-ui, sans-serif", halo: true });
    });
    if (cur >= 0 && !done && phase(rows[cur], st.t) >= 0.85) {
      const p = rows[cur]; ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(X(p.gc), Y(p.R), 7, 0, 2 * Math.PI); ctx.stroke();
    }
    label(ctx, `${tr("rd-fit", "all routes together")}: R = ${num(F.R)} ± ${num(F.se)} km`, hx, 12, { col: globe, font: "600 12px system-ui, sans-serif" });
    label(ctx, `${tr("rd-true", "dashed: the Earth's mean radius, 6,371 km")} · ${num(n)}/${num(rows.length)} ${tr("rd-routes", "routes")}`, hx, 26, { col: SOFT, font: "10.5px system-ui, sans-serif" });

    // globe : la vue va du milieu de la route précédente au milieu de celle-ci
    const r = rows[Math.max(0, cur)], u = cur >= 0 ? phase(r, st.t) : 0;
    const prev = cur > 0 ? rows[cur - 1].mid : r.mid;
    const view = done ? r.mid : gcPoint(prev, r.mid, ease(u / 0.35));
    const G = orthoGlobe(gcx, gcy, gR, Math.max(-70, Math.min(70, view[0])), view[1]);
    G.draw(ctx, { ink: globe });
    for (let i = 0; i < (done ? rows.length : cur); i++) strokeGlobe(ctx, G, rows[i].arc, { c: rows[i].R > rHi ? OUT : globe, w: 1, alpha: 0.35 });
    if (cur >= 0 && !done) {
      const col = r.R > rHi ? OUT : globe, f = ease((u - 0.2) / 0.65), k = Math.round(f * 40);
      for (const e of [r.arc[0], r.arc[40]]) { const q = G.ll(e[0], e[1]); if (q[2] > 0) dot(ctx, q[0], q[1], 3, INK); }
      if (k > 0) strokeGlobe(ctx, G, r.arc.slice(0, k + 1), { c: col, w: 2.4 });
      if (f > 0 && f < 1) {
        const a = gcPoint(r.arc[0], r.arc[40], f), b = gcPoint(r.arc[0], r.arc[40], Math.min(1, f + 0.02));
        const pa = G.ll(a[0], a[1]), pb = G.ll(b[0], b[1]);
        if (pa[2] > 0) plane(ctx, pa[0], pa[1], Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), INK, 0.9);
      }
      const [c1, c2] = caption(r);
      label(ctx, c1, gcx, capY, { al: "center", col: INK, font: "600 11px system-ui, sans-serif" });
      if (u >= 0.85) label(ctx, c2, gcx, capY + 14, { al: "center", col, font: "10.5px system-ui, sans-serif" });
    } else if (done) {
      label(ctx, `${num(rows.length)} ${tr("rd-routes", "routes")}`, gcx, capY, { al: "center", col: INK, font: "600 11px system-ui, sans-serif" });
    }
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.t += n / 60; if (st.t > radiusPlan().T) st.t = 0; }, draw,
    anim: { duration: () => radiusPlan().T, state: st, reset: () => { st.t = 0; } },   // la légende de la route est sur le dessin
  });
  // sans animation (préférence « réduire les animations »), tout est affiché
  if (!loop.playing) st.t = radiusPlan().T - HOLD / 2;
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
