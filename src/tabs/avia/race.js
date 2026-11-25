// Figure 6 (epic14) : le même vol, la même durée mesurée, sur les deux cartes.
// À gauche le globe (grand cercle), à droite le disque plat usuel (azimutal
// équidistant, ligne droite). Les deux avions partent et arrivent ensemble :
// la durée est celle des vols réels (FlightAware, moyenne des deux sens) ;
// seule change la distance, donc la vitesse qu'il faudrait tenir. Les points
// sont les points tournants en latitude/longitude du plan de vol déposé.
import { setupCanvas } from "../../core/canvas.js";
import { routeStats, gcPoint, distGC, aeXY, aeLL } from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { CITY } from "../../data/presets/avia.js";
import { colors, label, dot, plane, orthoGlobe, strokeGlobe, aeDisc, makeLoop, INK } from "./draw.js";
import { num } from "../curv/fmt.js";

const ll = (k) => [AIRPORTS[k].lat, AIRPORTS[k].lon];

/** Chemin polyligne (liste de [lat, lon]) du globe et du disque (liste de [x, y] km) pour une route (les tours du monde : world.js). */
export function racePaths(key, tr = (k, fb) => fb) {
  const city = (c) => tr(`city-${c}`, CITY[c]);
  const r = ROUTES.find((x) => `${x.a}-${x.b}` === key), s = routeStats(r, AIRPORTS);
  const a = ll(r.a), b = ll(r.b), g = [];
  for (let k = 0; k <= 120; k++) g.push(gcPoint(a, b, k / 120));
  return { g, f: [aeXY(a), aeXY(b)], gKm: s.gc, fKm: s.ae, h: s.h, label: `${city(r.a)} → ${city(r.b)}`, stops: [a, b], tas: s.tas, wpt: s.wpt, s };
}

/** Point à la fraction t (0..1) de la longueur d'une polyligne, et sa direction. */
function along(pts, t, len) {
  const seg = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = len(pts[i - 1], pts[i]); seg.push(d); tot += d; }
  let rem = t * tot;
  for (let i = 0; i < seg.length; i++) {
    if (rem <= seg[i] || i === seg.length - 1) return { i, f: seg[i] ? Math.min(1, rem / seg[i]) : 0 };
    rem -= seg[i];
  }
  return { i: 0, f: 0 };
}

export function mountRace(root, tr) {
  const cv = root.querySelector("#aviaRace"), sel = root.querySelector("#aviaRaceRoute"), btn = root.querySelector("#aviaRacePlay");
  const reads = root.querySelector("#aviaRaceReads");
  const south = ROUTES.filter((r) => r.south && r.ab.length && r.ba.length).map((r) => `${r.a}-${r.b}`);
  const other = ROUTES.filter((r) => !r.south && r.ab.length && r.ba.length).map((r) => `${r.a}-${r.b}`);
  const city = (c) => tr(`city-${c}`, CITY[c]);
  const opt = (k) => { const [a, b] = k.split("-"); return `<option value="${k}">${city(a)} – ${city(b)}</option>`; };
  if (sel) sel.innerHTML = `<optgroup label="${tr("rc-south", "Southern hemisphere")}">${south.map(opt).join("")}</optgroup>` +
    `<optgroup label="${tr("rc-other", "Other long-haul routes")}">${other.map(opt).join("")}</optgroup>`;
  const st = { key: "SYD-SCL", t: 0, P: null };
  if (sel) sel.value = st.key;
  const load = () => { st.P = racePaths(st.key, tr); st.t = 0; writeReads(); };
  const writeReads = () => {
    if (!reads) return;
    const P = st.P, vg = P.gKm / P.h, vf = P.fKm / P.h;
    const tas = P.tas ? ` · ${tr("rc-tas", "cruise speed filed in the flight plan")} ${num(P.tas)} km/h` : "";
    // 2026-11-25 (propriétaire) : ce que donnait la ligne du tableau des vols, retiré au profit du CSV
    const S = P.s, [ca, cb] = st.key.split("-").map(city);
    reads.innerHTML = `<div>${num(S.n)} ${tr("rc-flights", "flights")} · ${ca} → ${cb} ${num(S.hAB, 2)} h · ${cb} → ${ca} ${num(S.hBA, 2)} h</div>` +
      `<div>${tr("rc-time", "measured airborne time")}: <b>${num(P.h, 1)} h</b>${tas}</div>` +
      `<div class="g">${tr("rc-globe", "globe")}: ${num(P.gKm)} km → <b>${num(vg)} km/h</b></div>` +
      `<div class="f">${tr("rc-flat", "flat map")}: ${num(P.fKm)} km → <b>${num(vf)} km/h</b> (×${num(P.fKm / P.gKm, 2)})</div>`;
  };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W || !st.P) return;
    const { globe, flat } = colors(cv), P = st.P;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520;
    const pw = wide ? W / 2 : W, ph = wide ? H : H / 2;
    const R = Math.min(pw, ph - 50) * 0.42;
    // globe
    const gi = along(P.g, st.t, (p, q) => distGC(p, q));
    const pos = gcPoint(P.g[gi.i], P.g[gi.i + 1] ?? P.g[gi.i], gi.f);
    const centre = gcPoint(P.g[0], P.g[P.g.length - 1], 0.5);
    const G = orthoGlobe(pw / 2, ph / 2 + 8, R, Math.max(-70, Math.min(70, centre[0])), centre[1]);
    G.draw(ctx, { ink: globe });
    strokeGlobe(ctx, G, P.g, { c: globe, w: 2, alpha: 0.9 });
    for (const w of P.wpt) { const q = G.ll(w[0], w[1]); if (q[2] > 0) dot(ctx, q[0], q[1], 2, INK); }
    for (const s of P.stops) { const q = G.ll(s[0], s[1]); if (q[2] > 0) dot(ctx, q[0], q[1], 3.5, INK); }
    const pg = G.ll(pos[0], pos[1]), nx = gcPoint(P.g[gi.i], P.g[gi.i + 1] ?? P.g[gi.i], Math.min(1, gi.f + 0.05)), pn = G.ll(nx[0], nx[1]);
    if (pg[2] > 0) plane(ctx, pg[0], pg[1], Math.atan2(pn[1] - pg[1], pn[0] - pg[0]), INK, 1.1);
    label(ctx, tr("rc-globe-h", "Globe: shortest path on the sphere"), 8, 14, { col: globe, font: "600 12px system-ui, sans-serif" });
    // disque
    const ox = wide ? pw : 0, oy = wide ? 0 : ph;
    // disque tourné pour que le milieu de la droite tombe sous le centre
    const mid = aeLL([(P.f[0][0] + P.f[1][0]) / 2, (P.f[0][1] + P.f[1][1]) / 2])[1];
    const D = aeDisc(ox + pw / 2, oy + ph / 2 + 8, R * 1.05, 90 + mid);
    D.draw(ctx, flat);
    // le grand cercle réel reporté sur le disque (la route que suivent les avions), puis la droite du disque
    ctx.save(); ctx.strokeStyle = globe; ctx.globalAlpha = 0.55; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.3; ctx.beginPath();
    P.g.forEach((q, i) => { const s = D.xy(q); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke(); ctx.restore();
    for (const w of P.wpt) { const q = D.xy(w); dot(ctx, q[0], q[1], 2, INK); }
    const scr = P.f.map(([x, y]) => D.xy(aeLL([x, y])));
    ctx.strokeStyle = flat; ctx.lineWidth = 2; ctx.beginPath(); scr.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    for (const s of P.stops) { const q = D.xy(s); dot(ctx, q[0], q[1], 3.5, INK); }
    const fi = along(P.f, st.t, (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]));
    const a0 = scr[fi.i], a1 = scr[fi.i + 1] ?? scr[fi.i];
    plane(ctx, a0[0] + (a1[0] - a0[0]) * fi.f, a0[1] + (a1[1] - a0[1]) * fi.f, Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), INK, 1.1);
    label(ctx, tr("rc-flat-h", "Flat map: straight line on the disc"), ox + 8, oy + 14, { col: flat, font: "600 12px system-ui, sans-serif" });
    // horloge et vitesses
    const h = st.t * P.h;
    label(ctx, `${num(h, 1)} h / ${num(P.h, 1)} h`, wide ? W / 2 : W - 8, wide ? H - 10 : ph - 6, { al: wide ? "center" : "right", bl: "bottom", col: INK, font: "600 12px ui-monospace, monospace" });
    label(ctx, `${num(P.gKm / P.h)} km/h`, 8, ph - 6, { bl: "bottom", col: globe, font: "600 12px system-ui, sans-serif" });
    label(ctx, `${num(P.fKm / P.h)} km/h`, ox + (wide ? pw - 8 : 8), oy + ph - 6, { al: wide ? "right" : "left", bl: "bottom", col: flat, font: "600 12px system-ui, sans-serif" });
  };
  sel?.addEventListener("change", () => { st.key = sel.value; load(); draw(); });
  load();
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.t += n / (60 * 12); if (st.t > 1.08) st.t = 0; }, draw: () => { const t = st.t; st.t = Math.min(1, t); draw(); st.t = t; },
    anim: { duration: 13, state: st, reset: () => { st.t = 0; }, readout: () => [...(reads?.children || [])].map((d) => d.textContent).join(" · ") },
  });
  // cartes (epic11) : « aviaRace@SYD-SCL » choisit la route (One More Orbit : aviaWorld@OMO)
  cv.__variant = { get: () => st.key, set: (k) => { if (k === st.key) return; st.key = k; if (sel) sel.value = k; load(); draw(); } };
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
