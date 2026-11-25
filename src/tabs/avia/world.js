// Figure « tours du monde » (2026-10-01, demande du propriétaire : les vols qui
// font le tour de la Terre, est-ouest et nord-sud). Même principe que race.js :
// à gauche le globe (arcs de grand cercle, vue qui suit l'avion), à droite le
// disque azimutal (cordes droites ; le pôle sud, qui est tout le bord, touché au
// point le plus favorable au plan -- flatViaRim, règle 2). Les deux avions partent
// et arrivent ensemble : la durée est la vraie (mesurée pour l'anneau austral,
// publiée pour les vols records) ; seule change la distance, donc la vitesse.
import { setupCanvas } from "../../core/canvas.js";
import { worldTrip, gcPoint, distGC, aeXY, aeLL, flatViaRim, routeStats, median } from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { WORLD, OMO, CITY } from "../../data/presets/avia.js";
import { colors, label, dot, plane, orthoGlobe, strokeGlobe, aeDisc, makeLoop, INK } from "./draw.js";
import { num } from "../curv/fmt.js";

/** Les tours calculés une fois (pur) : { k -> stats (g, f : km) + chemins gp (globe, [lat, lon]) et fp (disque, [x, y] km) }. */
let memo = null;
export function worldTrips() {
  if (memo) return memo;
  memo = {};
  for (const T of WORLD) {
    const s = worldTrip(T, { AP: AIRPORTS, routes: ROUTES, omo: OMO });
    const P = s.pts, gp = [], fp = [];
    for (let i = 1; i < P.length; i++) for (let k = i === 1 ? 0 : 1; k <= 40; k++) gp.push(gcPoint(P[i - 1].ll, P[i].ll, k / 40));
    for (let i = 0; i < P.length; i++) {
      if (P[i].pole && P[i].ll[0] < 0) { fp.push(aeXY([-90, flatViaRim(P[i - 1].ll, P[i + 1].ll).lon])); continue; }
      fp.push(aeXY(P[i].ll));
    }
    if (T.ring) {
      // vitesses propres déposées dans les plans de vol des étapes de l'anneau (quand FlightAware en montre un)
      const tas = [];
      for (let i = 1; i < T.ring.length; i++) {
        const r = ROUTES.find((x) => (x.a === T.ring[i - 1] && x.b === T.ring[i]) || (x.b === T.ring[i - 1] && x.a === T.ring[i]));
        const st = routeStats(r, AIRPORTS);
        if (st.tas) tas.push(st.tas);
      }
      s.tasLo = Math.min(...tas); s.tasHi = Math.max(...tas); s.vmax = Math.max(...tas); s.vmaxKind = "tas"; s.tasMed = median(tas);
    }
    memo[T.k] = { ...s, gp, fp, stops: P.filter((p) => !p.pole) };
  }
  return memo;
}

/** « San Francisco → pôle Nord → London … » : escales et passages aux pôles, dans la langue de la page. */
export function routeName(P, tr = (k, fb) => fb) {
  return P.pts.map((p) => p.pole ? tr(p.ll[0] > 0 ? "wd-np" : "wd-sp", p.ll[0] > 0 ? "North Pole" : "South Pole") : tr(`city-${p.k}`, CITY[p.k] || p.k)).join(" → ");
}

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

export function mountWorld(root, tr) {
  const cv = root.querySelector("#aviaWorld"), sel = root.querySelector("#aviaWorldTrip"), btn = root.querySelector("#aviaWorldPlay");
  const reads = root.querySelector("#aviaWorldReads");
  const name = (k) => tr(`wd-name-${k}`, { SOUTH: "Southern ring of scheduled flights", AF1995: "Concorde AF1995, 1995", PA50: "Pan Am 50, 1977", OMO: "One More Orbit, 2019" }[k]);
  if (sel) sel.innerHTML = `<optgroup label="${tr("wd-ew", "East–west")}">${WORLD.filter((T) => T.dir === "ew").map((T) => `<option value="${T.k}">${name(T.k)}</option>`).join("")}</optgroup>` +
    `<optgroup label="${tr("wd-ns", "North–south, over both poles")}">${WORLD.filter((T) => T.dir === "ns").map((T) => `<option value="${T.k}">${name(T.k)}</option>`).join("")}</optgroup>`;
  const st = { key: "SOUTH", t: 0 };
  if (sel) sel.value = st.key;
  const writeReads = () => {
    if (!reads) return;
    const P = worldTrips()[st.key], vg = P.g / P.h, vf = P.f / P.h;
    const time = P.kind === "airborne"
      ? `${tr("wd-air", "measured airborne time, mean of the two directions")}: <b>${num(P.h, 1)} h</b> (${tr("wd-east", "eastbound")} ${num(P.hE, 1)} h, ${tr("wd-west", "westbound")} ${num(P.hW, 1)} h)`
      : `${tr("wd-elapsed", "published elapsed time, stops included")}: <b>${num(P.h, 1)} h</b>`;
    const vmax = P.vmaxKind === "tas" ? `${tr("wd-tas", "filed cruise speeds")} ${num(P.tasLo)}–${num(P.tasHi)} km/h`
      : `${tr(P.vmaxKind === "cruise" ? "wd-cruise" : "wd-max", P.vmaxKind === "cruise" ? "cruise speed of the aircraft" : "top speed of the aircraft")} ${num(P.vmax)} km/h`;
    const over = vf > P.vmax ? ` <b>${tr("wd-over", "faster than the aircraft can fly")}</b>` : ` ${tr("wd-under", "possible for this aircraft")}`;
    reads.innerHTML = `<div>${routeName(P, tr)}</div><div>${time} · ${vmax}</div>` +
      `<div class="g">${tr("rc-globe", "globe")}: ${num(P.g)} km → <b>${num(vg)} km/h</b>${P.pub ? ` (${tr("wd-pub", "published")}: ${num(P.pub)} km)` : ""}</div>` +
      `<div class="f">${tr("rc-flat", "flat map")}: ${num(P.f)} km → <b>${num(vf)} km/h</b> (×${num(P.f / P.g, 2)}) —${over}</div>`;
  };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv), P = worldTrips()[st.key];
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520;
    const pw = wide ? W / 2 : W, ph = wide ? H : H / 2;
    const R = Math.min(pw, ph - 50) * 0.42;
    // globe : la vue suit l'avion
    const gi = along(P.gp, st.t, (p, q) => distGC(p, q));
    const pos = gcPoint(P.gp[gi.i], P.gp[gi.i + 1] ?? P.gp[gi.i], gi.f);
    const G = orthoGlobe(pw / 2, ph / 2 + 8, R, Math.max(-60, Math.min(60, pos[0])), pos[1]);
    G.draw(ctx, { ink: globe });
    strokeGlobe(ctx, G, P.gp, { c: globe, w: 2, alpha: 0.9 });
    for (const s of P.stops) { const q = G.ll(s.ll[0], s.ll[1]); if (q[2] > 0) dot(ctx, q[0], q[1], 3.5, INK); }
    const pg = G.ll(pos[0], pos[1]), nx = gcPoint(P.gp[gi.i], P.gp[gi.i + 1] ?? P.gp[gi.i], Math.min(1, gi.f + 0.05)), pn = G.ll(nx[0], nx[1]);
    if (pg[2] > 0) plane(ctx, pg[0], pg[1], Math.atan2(pn[1] - pg[1], pn[0] - pg[0]), INK, 1.1);
    label(ctx, tr("wd-globe-h", "Globe: great circles, the view follows the aircraft"), 8, 14, { col: globe, font: "600 12px system-ui, sans-serif" });
    // disque (pôle nord au centre, pôle sud = tout le bord)
    const ox = wide ? pw : 0, oy = wide ? 0 : ph;
    const D = aeDisc(ox + pw / 2, oy + ph / 2 + 8, R * 1.05, 90);
    D.draw(ctx, flat);
    ctx.save(); ctx.strokeStyle = globe; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.beginPath();
    P.gp.forEach((q, i) => { const s = D.xy(q); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke(); ctx.restore();
    const scr = P.fp.map(([x, y]) => D.xy(aeLL([x, y])));
    ctx.strokeStyle = flat; ctx.lineWidth = 2; ctx.beginPath(); scr.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    for (const s of P.stops) { const q = D.xy(s.ll); dot(ctx, q[0], q[1], 3.5, INK); }
    const fi = along(P.fp, st.t, (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]));
    const a0 = scr[fi.i], a1 = scr[fi.i + 1] ?? scr[fi.i];
    plane(ctx, a0[0] + (a1[0] - a0[0]) * fi.f, a0[1] + (a1[1] - a0[1]) * fi.f, Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), INK, 1.1);
    label(ctx, tr("wd-flat-h", "Flat map: straight lines on the disc"), ox + 8, oy + 14, { col: flat, font: "600 12px system-ui, sans-serif" });
    const h = st.t * P.h;
    label(ctx, `${num(h, 1)} h / ${num(P.h, 1)} h`, wide ? W / 2 : W - 8, wide ? H - 10 : ph - 6, { al: wide ? "center" : "right", bl: "bottom", col: INK, font: "600 12px ui-monospace, monospace" });
    label(ctx, `${num(P.g / P.h)} km/h`, 8, ph - 6, { bl: "bottom", col: globe, font: "600 12px system-ui, sans-serif" });
    label(ctx, `${num(P.f / P.h)} km/h`, ox + (wide ? pw - 8 : 8), oy + ph - 6, { al: wide ? "right" : "left", bl: "bottom", col: flat, font: "600 12px system-ui, sans-serif" });
  };
  sel?.addEventListener("change", () => { st.key = sel.value; st.t = 0; writeReads(); draw(); });
  writeReads();
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.t += n / (60 * 16); if (st.t > 1.08) st.t = 0; }, draw: () => { const t = st.t; st.t = Math.min(1, t); draw(); st.t = t; },
    anim: { duration: 17, state: st, reset: () => { st.t = 0; }, readout: () => [...(reads?.children || [])].map((d) => d.textContent).join(" · ") },
  });
  // cartes (epic11) : « aviaWorld@PA50 » choisit le tour
  cv.__variant = { get: () => st.key, set: (k) => { if (k === st.key) return; st.key = k; st.t = 0; if (sel) sel.value = k; writeReads(); draw(); } };
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}

/** Table des tours du monde : temps, km et km/h sur chaque carte, vitesse de l'appareil (dépassée : en gras). */
export function fillWorldTable(tb, tr = (k, fb) => fb) {
  if (!tb) return;
  const W = worldTrips();
  const nm = { SOUTH: "Southern ring of scheduled flights", AF1995: "Concorde AF1995, 1995", PA50: "Pan Am 50, 1977", OMO: "One More Orbit, 2019" };
  tb.innerHTML = WORLD.map((T) => {
    const P = W[T.k], vg = P.g / P.h, vf = P.f / P.h;
    const dir = tr(T.dir === "ew" ? "wd-ew" : "wd-ns", T.dir === "ew" ? "East–west" : "North–south, over both poles");
    const time = P.kind === "airborne" ? `${num(P.h, 1)} h ${tr("wd-air-s", "in the air")}` : `${num(P.h, 1)} h ${tr("wd-elapsed-s", "elapsed")}`;
    const ac = P.vmaxKind === "tas" ? `${num(P.tasLo)}–${num(P.tasHi)} ${tr("wd-tas-s", "filed")}` : `${num(P.vmax)} ${tr(P.vmaxKind === "cruise" ? "wd-cruise-s" : "wd-max-s", P.vmaxKind === "cruise" ? "cruise" : "max")}`;
    const bad = vf > P.vmax;
    return `<tr><td><b>${tr(`wd-name-${T.k}`, nm[T.k])}</b> · ${dir}<br><small>${routeName(P, tr)}</small></td>` +
      `<td class="num">${time}</td>` +
      `<td class="num g">${num(P.g)} km<br>${num(vg)} km/h</td>` +
      `<td class="num f">${num(P.f)} km<br>${bad ? "<b>" : ""}${num(vf)} km/h${bad ? "</b>" : ""}</td>` +
      `<td class="num">${ac} km/h</td></tr>`;
  }).join("");
}
