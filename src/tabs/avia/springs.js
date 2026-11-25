// Figure 7 (epic14) : le plan au mieux de sa forme. Chaque route est un
// ressort dont la longueur au repos est la distance que donne sa durée de
// vol (d = v·(t − t0), même modèle horaire que le globe) ; les aéroports sont
// libres de glisser n'importe où sur le plan. L'animation rejoue la descente
// (SMACOF, logic.fitFlat) depuis le départ qui mène au meilleur minimum
// trouvé ; les ressorts restent tendus : c'est l'erreur qu'aucun plan ne peut
// faire disparaître. Le globe, lui, n'a rien à ajuster.
import { setupCanvas } from "../../core/canvas.js";
import { routeStats, fitTime, fitFlat } from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { AVIA_FLAT_FIT } from "../../data/presets/avia-flat-fit.js";
import { colors, label, wrapLabel, dot, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

let cache = null;
/**
 * Rejoue la descente depuis le départ stocké (scripts/fit_avia_flat.mjs :
 * la recherche à 60 départs prend ~1 s, trop pour chaque montage) ; ~0,1 s,
 * fait une fois. best = état final du rejeu (mêmes résidus que le stocké).
 */
export function springFit() {
  if (cache) return cache;
  const stats = ROUTES.map((r) => routeStats(r, AIRPORTS));
  const g = fitTime(stats, (s) => s.gc);
  const frames = [];
  const best = fitFlat(stats, AIRPORTS, { ...g, init: AVIA_FLAT_FIT.init, iters: 400, onStep: (X, it) => { if (it % 2 === 0) frames.push(X.map((p) => [...p])); } });
  cache = { stats, g, best, frames };
  return cache;
}

// 2026-10-19 (propriétaire : « je comprends pas le graphe qui est supposé faire les distances de la terre plate ») : deux panneaux.
// À gauche le plan des ressorts, les pires routes nommées ; à droite, pour chaque route, la longueur dessinée sur ce plan contre la
// distance que permet son temps de vol (la diagonale = la route colle), et les points du globe, qui n'ont rien d'ajusté, pour comparer.
export function mountSprings(root, tr) {
  const cv = root.querySelector("#aviaSprings"), btn = root.querySelector("#aviaSpringsPlay");
  const st = { f: 0 };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    const { stats, g, best, frames } = springFit();
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const X = frames[Math.min(frames.length - 1, Math.floor(st.f))], keys = best.keys, fin = frames[frames.length - 1];
    const wide = W >= 620, top = 40, foot = wide ? 22 : 30;
    const A = wide ? [0, top, W * 0.54, H - top - foot] : [0, top, W, (H - top - foot) * 0.5];
    const B = wide ? [W * 0.56, top, W * 0.44, H - top - foot] : [0, top + A[3], W, (H - top - foot) * 0.5];
    const idx = Object.fromEntries(keys.map((k, i) => [k, i]));
    const S = stats.filter((q) => q.both);
    const rows = S.map((q) => {
      const tgt = g.v * (q.h - g.t0), d = Math.hypot(X[idx[q.a]][0] - X[idx[q.b]][0], X[idx[q.a]][1] - X[idx[q.b]][1]);
      return { q, tgt, d, rel: (d - tgt) / tgt, gc: q.gc, rg: (q.gc - tgt) / tgt };
    });
    const rms = Math.sqrt(rows.reduce((p, r) => p + r.rel ** 2, 0) / rows.length);
    // en-tête : ce qui est comparé
    label(ctx, `${tr("sp-rms", "flat, airports placed freely")}: ${num(rms * 100, 1)} % rms · ${tr("sp-it", "step")} ${Math.min(frames.length, Math.floor(st.f) + 1) * 2}`, 8, 12, { col: flat, font: "600 12px system-ui, sans-serif" });
    label(ctx, `${tr("sp-globe", "globe, airports where they are")}: ${num(g.rms * 100, 1)} % rms`, 8, 28, { col: globe, font: "600 12px system-ui, sans-serif" });
    // A. le plan des ressorts
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of fin) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const pad = 22, s = Math.min((A[2] - 2 * pad) / (x1 - x0), (A[3] - 2 * pad) / (y1 - y0));
    const ox = A[0] + A[2] / 2 - s * (x0 + x1) / 2, oy = A[1] + A[3] / 2 + s * (y0 + y1) / 2;
    const P = (p) => [ox + s * p[0], oy - s * p[1]];
    // étiquettes qui ne se recouvrent pas : une étiquette trop proche d'une déjà posée est sautée (plan) ou décalée (nuage)
    const placed = [], free = (x, y, w = 46) => !placed.some((q) => Math.abs(q[0] - x) < w && Math.abs(q[1] - y) < 12);
    const worst = [...rows].sort((p, q) => Math.abs(q.rel) - Math.abs(p.rel)).slice(0, 4);

    for (const r of rows) {
      const a = P(X[idx[r.q.a]]), b = P(X[idx[r.q.b]]), hot = worst.includes(r);
      ctx.strokeStyle = r.rel > 0 ? flat : "#1d4ed8";
      ctx.globalAlpha = hot ? 0.95 : Math.min(0.55, 0.12 + Math.abs(r.rel) * 2.5);
      ctx.lineWidth = hot ? 3 : 0.8 + Math.min(2.5, Math.abs(r.rel) * 12);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 2026-11-07 (32 aéroports) : chaque code essaie quatre places autour de son point, la première libre
    // gagne ; sans place libre, le point reste sans nom (les pires routes gardent leurs pourcentages)
    keys.forEach((k, i) => { const p = P(X[i]); dot(ctx, p[0], p[1], 3, INK); });
    ctx.font = "600 9.5px system-ui, sans-serif";
    const boxes = keys.map((k, i) => { const p = P(X[i]); return [p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3]; });
    const hit = (b) => boxes.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
    keys.forEach((k, i) => {
      const p = P(X[i]), w = ctx.measureText(k).width + 2, h = 11;
      for (const [dx, dy] of [[4, -12], [4, 1], [-4 - w, -12], [-4 - w, 1]]) {
        const b = [p[0] + dx, p[1] + dy, p[0] + dx + w, p[1] + dy + h];
        if (b[0] < A[0] || b[2] > A[0] + A[2] || b[1] < A[1] || hit(b)) continue;
        boxes.push(b); placed.push([b[0] + w / 2, b[1] + h / 2]);
        label(ctx, k, b[0] + 1, b[1] + h / 2, { halo: true, font: "600 9.5px system-ui, sans-serif" });
        break;
      }
    });
    for (const r of worst) {
      const a = P(X[idx[r.q.a]]), b = P(X[idx[r.q.b]]), mx0 = a[0] + (b[0] - a[0]) * 0.6, my0 = a[1] + (b[1] - a[1]) * 0.6;
      if (!free(mx0, my0)) continue; placed.push([mx0, my0]);
      label(ctx, `${r.rel > 0 ? "+" : "−"}${num(Math.abs(r.rel) * 100, 0)} %`, mx0, my0, { al: "center", halo: true, col: r.rel > 0 ? flat : "#1d4ed8", font: "700 10px system-ui, sans-serif" });
    }
    placed.length = 0;
    label(ctx, tr("sp-a", "the airports slid on a plane, routes as springs"), A[0] + 8, A[1] + A[3] - 4, { bl: "bottom", col: SOFT, font: "10px system-ui, sans-serif" });
    // B. longueur sur le plan (ou sur le globe) contre la distance que permet le temps de vol
    const mx = Math.ceil(Math.max(...rows.map((r) => Math.max(r.tgt, r.d, r.gc))) / 2000) * 2000;
    const bx0 = B[0] + 40, bx1 = B[0] + B[2] - 10, by0 = B[1] + B[3] - 30, by1 = B[1] + 18;
    const sx = (v) => bx0 + v / mx * (bx1 - bx0), sy = (v) => by0 - v / mx * (by0 - by1);
    ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1;
    for (let v = 0; v <= mx; v += mx / 4) { ctx.beginPath(); ctx.moveTo(bx0, sy(v)); ctx.lineTo(bx1, sy(v)); ctx.stroke(); label(ctx, `${num(v / 1000)}k`, bx0 - 4, sy(v), { al: "right", col: SOFT, font: "9px system-ui, sans-serif" }); label(ctx, `${num(v / 1000)}k`, sx(v), by0 + 10, { al: "center", col: SOFT, font: "9px system-ui, sans-serif" }); }
    ctx.strokeStyle = INK; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(sx(0), sy(0)); ctx.lineTo(sx(mx), sy(mx)); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, `- - - ${tr("sp-diag", "the route fits")}`, bx0 + 6, by1 + 10, { col: INK, font: "9.5px system-ui, sans-serif" });
    for (const r of rows) dot(ctx, sx(r.tgt), sy(r.gc), 2.6, globe);
    for (const r of rows) { ctx.strokeStyle = flat; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(sx(r.tgt), sy(r.d), 3, 0, 2 * Math.PI); ctx.stroke(); }
    for (const r of worst) {
      const x = sx(r.tgt), right = x > bx1 - 70; let y = sy(r.d);
      while (!free(x, y, 70)) y += 12;
      placed.push([x, y]);
      label(ctx, r.q.key.replace("-", "–"), right ? x - 5 : x + 5, y, { al: right ? "right" : "left", col: flat, font: "600 9px system-ui, sans-serif", halo: true });
    }
    label(ctx, tr("sp-x", "distance its flight time allows (km)"), (bx0 + bx1) / 2, by0 + 22, { al: "center", col: SOFT, font: "10px system-ui, sans-serif" });
    label(ctx, tr("sp-y", "length drawn (km)"), bx0, by1 - 10, { col: SOFT, font: "10px system-ui, sans-serif" });
    label(ctx, `○ ${tr("sp-fl", "best plane")}`, bx1, by1 - 10, { al: "right", col: flat, font: "600 10px system-ui, sans-serif" });
    ctx.font = "600 10px system-ui, sans-serif"; const wfl = ctx.measureText(`○ ${tr("sp-fl", "best plane")}`).width;
    label(ctx, `● ${tr("sp-gl", "globe")}`, bx1 - wfl - 10, by1 - 10, { al: "right", col: globe, font: "600 10px system-ui, sans-serif" });
    wrapLabel(ctx, tr("sp-key", "orange: drawn longer than the flight time allows · blue: shorter · thicker = further off"), 8, H - 6, W - 16, { col: SOFT, bl: "bottom", font: "10px system-ui, sans-serif", lh: 12 });
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { const N = springFit().frames.length; st.f += n * 0.5; if (st.f > N + 90) st.f = 0; }, draw,
    anim: { duration: () => (springFit().frames.length + 60) / 0.5 / 60, state: st, reset: () => { st.f = 0; } },
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
