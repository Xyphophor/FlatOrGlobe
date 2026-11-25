// Vitrine de l'onglet avia (propriétaire, 2026-11-21 : « fais la vitrine d'avia »). Sept scènes et une fin, toutes tirées des
// calculs de la page, rien d'inventé : les 85 routes FlightAware sur le globe ; temps de vol contre distance, globe et carte du
// pôle Nord ; Sydney → Santiago sur les deux cartes ; l'anneau austral de vols réguliers ; le rayon par chronomètre et plan de
// vol (logic.radiusFromFlights, mesure) ; la dérive des gyroscopes qui change de signe à l'équateur ; le passager pesé vers
// l'est et vers l'ouest (GRAV-D) ; le bilan. Les phrases prennent leurs nombres dans values.js (proseValues, {{clé}}).
// Cadre : core/reel.js.
import { makeReel, label, REEL_COL, ease, clamp } from "../../core/reel.js";
import { coastLines } from "../../core/globe25d.js";
import { routeStats, fitTime, gcPoint, aeLL, aeXY, dgDrift } from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { DG_SITES } from "../../data/presets/avia.js";
import { radiusPlan, flightRadius } from "./radius.js";
import { worldTrips } from "./world.js";
import { aeDisc, plane } from "./draw.js";

const TEAL = "#0f766e", AMBER = REEL_COL.flat, D2R = Math.PI / 180;

const EN = {
  "ar-schem": "real flights; globes and maps to scale; the rest schematic",
  "ar-flights-k": "The stopwatches",
  "ar-flights-a": "{{nFlights}} flights, {{nRoutes}} routes, two clocks each.",
  "ar-flights-b": "Wheels off, wheels on: we keep only the airborne time, both ways, and the airports' latitude and longitude.",
  "ar-speed-k": "One speed",
  "ar-speed-a": "On the globe, one cruising speed fits every route.",
  "ar-speed-b": "{{vGlobe}}, within {{rmsGlobe}}. On the North Pole map the same times miss by {{rmsAE}}.",
  "ar-syd-k": "Sydney → Santiago",
  "ar-syd-a": "The same {{sydH}} in the air, two very different journeys.",
  "ar-syd-b": "Globe: {{sydKm}} at {{sydVg}}. Flat map: {{sydFlat}}, so {{sydVf}}, twice as fast as any airliner.",
  "ar-ring-k": "Around the south",
  "ar-ring-a": "{{swN}} scheduled flights close a ring around the south in {{swH}}.",
  "ar-ring-b": "On the globe that is {{swVg}}, airliner speed. On the flat map it is {{swVf}}; the flight plans file {{tasRange}}.",
  "ar-radius-k": "The size",
  "ar-radius-a": "A stopwatch and a flight plan give the size of the Earth.",
  "ar-radius-b": "Filed speed × airborne time ÷ the angle between the airports, on {{rfN}} routes: R = {{rfR}} ± {{rfSe}}. No distance goes in.",
  "ar-gyro-k": "The gyroscopes",
  "ar-gyro-a": "A gyroscope holds its direction in space; the Earth turns under it.",
  "ar-gyro-b": "The heading drifts by 15.04°/h × sin(latitude): the sign flips across the equator, as on a turning ball.",
  "ar-weigh-k": "The scales",
  "ar-weigh-a": "Flying east, a passenger weighs less; flying west, more.",
  "ar-weigh-b": "70 kg reads {{scE}} eastbound and {{scW}} westbound on the GRAV-D survey aircraft, whose lines give a day of {{jfDay}}.",
  "ar-end-k": "",
  "ar-end-a": "Same stopwatches, two shapes.",
  "ar-end-b": "Only the globe makes every airborne time agree with the speed the aircraft can fly.",
  "ar-globe": "globe", "ar-flat": "North Pole map", "ar-best": "flat map, airports moved freely", "ar-h": "airborne time (h)", "ar-km": "distance (km)",
  "ar-routes": "routes", "ar-true": "6,371 km", "ar-east": "eastbound", "ar-west": "westbound", "ar-after": "after {h} h",
  "ar-alt": "Animation: the 85 measured routes appearing on a globe; airborne time against distance, on one line for the globe and scattered for the North Pole map; Sydney to Santiago flown on the globe and on the flat map; the southern ring of scheduled flights on both; the Earth's radius from flight times, route by route; three gyroscopes drifting at Tromsø, Singapore and Sydney; a passenger weighed flying east and west; a summary",
};

// ---- le globe orthographique (une vue de la vraie sphère : rien n'est étiré, règle 1) ----
const vec = (la, lo) => [Math.cos(la * D2R) * Math.cos(lo * D2R), Math.cos(la * D2R) * Math.sin(lo * D2R), Math.sin(la * D2R)];
function ortho(lat0, lon0, cx, cy, r) {
  const c = vec(lat0, lon0), e = [-Math.sin(lon0 * D2R), Math.cos(lon0 * D2R), 0], n = [c[1] * e[2] - c[2] * e[1], c[2] * e[0] - c[0] * e[2], c[0] * e[1] - c[1] * e[0]];
  return (la, lo) => { const p = vec(la, lo), z = p[0] * c[0] + p[1] * c[1] + p[2] * c[2];
    return [cx + r * (p[0] * e[0] + p[1] * e[1] + p[2] * e[2]), cy - r * (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]), z > 0]; };
}
function globe(ctx, P, cx, cy, r) {
  ctx.fillStyle = "#eef6f4"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = "rgba(15,118,110,.35)"; ctx.lineWidth = 0.8;
  for (const line of coastLines()) { ctx.beginPath(); let pen = false;
    for (const pt of line) { if (!pt) { pen = false; continue; } const [x, y, v] = P(pt[0], pt[1]); if (!v) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; }
    ctx.stroke(); }
  ctx.strokeStyle = "rgba(21,26,33,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
}
function path(ctx, P, pts, col, w, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); let pen = false;
  for (const q of pts) { const [x, y, v] = P(q[0], q[1]); if (!v) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; }
  ctx.stroke(); ctx.restore();
}
const arcOf = (a, b, n = 40) => Array.from({ length: n + 1 }, (_, k) => gcPoint(a, b, k / n));
/** Le point d'une polyligne à la fraction f de sa longueur (len = mesure d'un segment). */
function along(pts, f, len) {
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = len(pts[i - 1], pts[i]); seg.push(d); tot += d; }
  let rem = clamp(f) * tot;
  for (let i = 0; i < seg.length; i++) { if (rem <= seg[i] || i === seg.length - 1) return { i, f: seg[i] ? Math.min(1, rem / seg[i]) : 0 }; rem -= seg[i]; }
  return { i: 0, f: 0 };
}
const lerp2 = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];

// ---- les données, calculées une fois ----
let D = null;
function data() {
  if (D) return D;
  const LL = (k) => [AIRPORTS[k].lat, AIRPORTS[k].lon];
  const stats = ROUTES.map((r) => routeStats(r, AIRPORTS)).filter((s) => s.both);
  const arcs = [...stats].sort((p, q) => p.gc - q.gc).map((s) => ({ arc: arcOf(LL(s.a), LL(s.b)), a: LL(s.a), b: LL(s.b) }));
  const syd = stats.find((s) => s.key === "SYD-SCL");
  D = { stats, arcs, g: fitTime(stats, (s) => s.gc), ae: fitTime(stats, (s) => s.ae), syd: { ...syd, A: LL("SYD"), B: LL("SCL") }, ring: worldTrips().SOUTH };
  return D;
}

// ---- les scènes ----
function sceneFlights(ctx, b, u, d, T, fs) {
  const { arcs } = data(), r = Math.min(b.w, b.h) * 0.42, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const P = ortho(15, 40 + 120 * (u / d), cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const n = Math.round(arcs.length * ease((u - 0.3) / (d * 0.75)));
  for (let i = 0; i < n; i++) path(ctx, P, arcs[i].arc, TEAL, Math.max(1.2, fs * 0.06), 0.75);
  for (let i = 0; i < n; i++) for (const e of [arcs[i].a, arcs[i].b]) { const [x, y, v] = P(e[0], e[1]); if (v) { ctx.fillStyle = REEL_COL.ink; ctx.beginPath(); ctx.arc(x, y, Math.max(1.8, fs * 0.09), 0, 2 * Math.PI); ctx.fill(); } }
  label(ctx, `${n} / ${arcs.length} ${T("ar-routes")}`, cx, cy + r + fs * 0.7, { size: fs * 0.55, col: REEL_COL.soft });
}

function sceneSpeed(ctx, b, u, d, T, fs) {
  const { stats, g, ae } = data();
  const x0 = b.x + fs * 1.6, x1 = b.x + b.w - fs * 0.4, y0 = b.y + b.h - fs * 1.4, y1 = b.y + fs * 2.2;
  const dMax = 30000, hMax = 20, X = (km) => x0 + (km / dMax) * (x1 - x0), Y = (h) => y0 - (h / hMax) * (y0 - y1);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  for (const km of [0, 10000, 20000, 30000]) label(ctx, `${km / 1000}k`, X(km), y0 + fs * 0.55, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  for (const h of [0, 10, 20]) label(ctx, `${h}`, x0 - fs * 0.4, Y(h), { size: fs * 0.42, col: REEL_COL.soft, align: "right", weight: 500 });
  label(ctx, T("ar-km"), (x0 + x1) / 2, y0 + fs * 1.1, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  ctx.save(); ctx.translate(x0 - fs * 1.25, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); label(ctx, T("ar-h"), 0, 0, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 }); ctx.restore();
  const kg = ease((u - 0.3) / 1.6), kf = ease((u - d * 0.45) / 1.6), rr = Math.max(2, fs * 0.11);
  const line = (fit, col, k) => { ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, fs * 0.07); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(X(0), Y(fit.t0)); ctx.lineTo(X(dMax), Y(fit.t0 + dMax / fit.v)); ctx.stroke(); ctx.globalAlpha = 1; };
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y1, x1 - x0, y0 - y1); ctx.clip();
  const n = Math.round(stats.length * kg);
  for (let i = 0; i < n; i++) { const s = stats[i]; ctx.fillStyle = TEAL; ctx.beginPath(); ctx.arc(X(s.gc), Y(s.h), rr, 0, 2 * Math.PI); ctx.fill(); }
  line(g, TEAL, kg);
  if (kf > 0) {
    for (const s of stats) { const x = X(s.gc + (s.ae - s.gc) * kf); ctx.fillStyle = "rgba(180,83,9,.75)"; ctx.beginPath(); ctx.arc(x, Y(s.h), rr, 0, 2 * Math.PI); ctx.fill(); }
    line(ae, AMBER, kf);
  }
  ctx.restore();
  const pc = (x, dd = 1) => `${(x * 100).toLocaleString(T.lang === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: dd })} %`;
  label(ctx, `${T("ar-globe")}: ${pc(g.rms)}`, x0 + fs * 0.3, b.y + fs * 0.5, { size: fs * 0.6, col: TEAL, align: "left", weight: 800 });
  if (kf > 0) { ctx.globalAlpha = kf; label(ctx, `${T("ar-flat")}: ${pc(ae.rms, 0)}`, x0 + fs * 0.3, b.y + fs * 1.35, { size: fs * 0.6, col: AMBER, align: "left", weight: 800 }); ctx.globalAlpha = 1; }
}

/** Deux panneaux : globe (arc) et disque (corde), un avion sur chacun au même instant ; f = fraction du trajet. */
function twoMaps(ctx, b, fs, view, gpts, fpts, f, T) {
  const half = b.w / 2, r = Math.min(half, b.h) * 0.42, cy = b.y + b.h * 0.47, gx = b.x + half / 2, fx = b.x + half * 1.5;
  const P = ortho(view[0], view[1], gx, cy, r);
  globe(ctx, P, gx, cy, r);
  path(ctx, P, gpts, TEAL, Math.max(2, fs * 0.1));
  const gi = along(gpts, f, (p, q) => Math.acos(clamp(vec(...p).reduce((s, x, i) => s + x * vec(...q)[i], 0), -1, 1)));
  const pg = gcPoint(gpts[gi.i], gpts[gi.i + 1] ?? gpts[gi.i], gi.f), pn = gcPoint(gpts[gi.i], gpts[gi.i + 1] ?? gpts[gi.i], Math.min(1, gi.f + 0.1));
  const [ax, ay, av] = P(pg[0], pg[1]), [bx, by] = P(pn[0], pn[1]);
  if (av) plane(ctx, ax, ay, Math.atan2(by - ay, bx - ax), REEL_COL.ink, fs * 0.07);
  const Dd = aeDisc(fx, cy, r, 90);
  Dd.draw(ctx, AMBER);
  const scr = fpts.map(([x, y]) => Dd.xy(aeLL([x, y])));
  ctx.strokeStyle = AMBER; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.beginPath(); scr.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
  const fi = along(fpts, f, (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1])), s0 = scr[fi.i], s1 = scr[fi.i + 1] ?? scr[fi.i], ps = lerp2(s0, s1, fi.f);
  plane(ctx, ps[0], ps[1], Math.atan2(s1[1] - s0[1], s1[0] - s0[0]), REEL_COL.ink, fs * 0.07);
  return { gx, fx, yb: cy + r + fs * 0.9 };
}

function sceneSyd(ctx, b, u, d, T, fs) {
  const { syd } = data(), f = ease((u - 0.8) / (d * 0.7));
  const fl = [aeXY(syd.A), aeXY(syd.B)];   // sur le disque, la ligne droite
  const m = twoMaps(ctx, b, fs, [-50, -140], arcOf(syd.A, syd.B), fl, f, T);
  const nf = (x) => Math.round(x).toLocaleString(T.lang === "fr" ? "fr-FR" : "en-US");
  label(ctx, `${nf(syd.gc * f)} km · ${nf(syd.vGlobe)} km/h`, m.gx, m.yb, { size: fs * 0.55, col: TEAL, weight: 800 });
  label(ctx, `${nf(syd.ae * f)} km · ${nf(syd.vFlat)} km/h`, m.fx, m.yb, { size: fs * 0.55, col: AMBER, weight: 800 });
  label(ctx, `${(syd.h * f).toFixed(1)} h`, b.x + b.w / 2, b.y + fs * 0.4, { size: fs * 0.6, col: REEL_COL.ink, weight: 700 });
}

function sceneRing(ctx, b, u, d, T, fs) {
  const { ring } = data(), f = ease((u - 0.6) / (d * 0.8));
  const m = twoMaps(ctx, b, fs, [-62, 150 + 60 * (u / d)], ring.gp, ring.fp, f, T);
  const nf = (x) => Math.round(x).toLocaleString(T.lang === "fr" ? "fr-FR" : "en-US");
  label(ctx, `${nf(ring.g * f)} km · ${nf(ring.g / ring.h)} km/h`, m.gx, m.yb, { size: fs * 0.55, col: TEAL, weight: 800 });
  label(ctx, `${nf(ring.f * f)} km · ${nf(ring.f / ring.h)} km/h`, m.fx, m.yb, { size: fs * 0.55, col: AMBER, weight: 800 });
  label(ctx, `${(ring.h * f).toFixed(1)} h`, b.x + b.w / 2, b.y + fs * 0.4, { size: fs * 0.6, col: REEL_COL.ink, weight: 700 });
}

function sceneRadius(ctx, b, u, d, T, fs) {
  const { rows } = radiusPlan(), F = flightRadius();
  const x0 = b.x + fs * 1.9, x1 = b.x + b.w - fs * 0.4, y0 = b.y + b.h - fs * 1.5, y1 = b.y + fs * 1.8;
  const dMax = Math.ceil(Math.max(...rows.map((p) => p.gc)) / 2000) * 2000, rLo = 5000, rHi = 9000;
  const X = (km) => x0 + (km / dMax) * (x1 - x0), Y = (r) => y0 - (clamp(r, rLo, rHi) - rLo) / (rHi - rLo) * (y0 - y1);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  for (const r of [5000, 6000, 7000, 8000, 9000]) label(ctx, `${r / 1000}k`, x0 - fs * 0.4, Y(r), { size: fs * 0.42, col: REEL_COL.soft, align: "right", weight: 500 });
  for (let km = 0; km <= dMax; km += 4000) label(ctx, `${km / 1000}k`, X(km), y0 + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  label(ctx, T("ar-km"), (x0 + x1) / 2, y0 + fs * 1.05, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  ctx.setLineDash([fs * 0.25, fs * 0.18]); ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(6371)); ctx.lineTo(x1, Y(6371)); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, T("ar-true"), x1, Y(6371) + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, align: "right", weight: 500 });
  const n = Math.round(rows.length * ease((u - 0.3) / (d * 0.7)));
  for (let i = 0; i < n; i++) { const p = rows[i]; ctx.fillStyle = p.R > rHi ? AMBER : TEAL; ctx.beginPath(); ctx.arc(X(p.gc), Y(p.R), Math.max(2, fs * 0.12), 0, 2 * Math.PI); ctx.fill(); }
  const k = ease((u - d * 0.75) / 0.8);
  if (k > 0) { ctx.globalAlpha = k; ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.beginPath(); ctx.moveTo(x0, Y(F.R)); ctx.lineTo(x1, Y(F.R)); ctx.stroke(); ctx.globalAlpha = 1; }
  const nf = (x) => Math.round(x).toLocaleString(T.lang === "fr" ? "fr-FR" : "en-US");
  label(ctx, k > 0 ? `R = ${nf(F.R)} ± ${nf(F.se)} km` : `${n} / ${rows.length} ${T("ar-routes")}`, x0 + fs * 0.3, b.y + fs * 0.5, { size: fs * 0.62, col: TEAL, align: "left", weight: 800 });
}

function sceneGyro(ctx, b, u, d, T, fs) {
  const n = DG_SITES.length, cw = b.w / n, r = Math.min(cw * 0.38, b.h * 0.3), cy = b.y + b.h * 0.45;
  const hours = 6 * ease((u - 0.5) / (d * 0.8));
  DG_SITES.forEach((s, i) => {
    const cx = b.x + cw * (i + 0.5), rate = dgDrift(s.lat), ang = rate * hours * D2R;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(21,26,33,.45)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    for (let t = 0; t < 36; t++) { const a = t * 10 * D2R, l = t % 9 ? 0.08 : 0.16; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r, cy - Math.cos(a) * r); ctx.lineTo(cx + Math.sin(a) * r * (1 - l), cy - Math.cos(a) * r * (1 - l)); ctx.stroke(); }
    // la ligne de départ (pâle) et le cap du gyroscope, qui tourne de −Ω sin φ par heure vu du sol
    ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - r * 0.85); ctx.stroke();
    const col = rate < -1 ? TEAL : rate > 1 ? "#7c3aed" : REEL_COL.soft;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2.5, fs * 0.13); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ang) * r * 0.85, cy - Math.cos(ang) * r * 0.85); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, fs * 0.15, 0, 2 * Math.PI); ctx.fill();
    const sg = (x, dd = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toLocaleString(T.lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: dd, maximumFractionDigits: dd })}`;
    label(ctx, s.n, cx, cy - r - fs * 0.6, { size: fs * 0.55, col: REEL_COL.ink, weight: 800 });
    label(ctx, `${Math.abs(s.lat).toFixed(0)}°${s.lat >= 0 ? "N" : "S"} · ${sg(rate)}°/h`, cx, cy + r + fs * 0.6, { size: fs * 0.48, col, weight: 700 });
    label(ctx, `${sg(rate * hours, 0)}°`, cx, cy + r + fs * 1.35, { size: fs * 0.62, col, weight: 800 });
  });
  label(ctx, T("ar-after").replace("{h}", hours.toFixed(1)), b.x + b.w / 2, cy + r + fs * 2.4, { size: fs * 0.5, col: REEL_COL.soft, weight: 500 });
}

function sceneWeigh(ctx, b, u, d, T, fs, vals) {
  // un arc de sol (schématique : sa courbure n'est pas à l'échelle) et deux avions qui partent en sens opposés
  const cx = b.x + b.w / 2, R = b.w * 1.1, cy = b.y + b.h * 0.5 + R, A0 = Math.PI * 1.37, A1 = Math.PI * 1.63;
  ctx.fillStyle = "#eef6f4"; ctx.strokeStyle = "rgba(21,26,33,.5)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, R, A0, A1); ctx.arc(cx, cy, R - b.h * 0.12, A1, A0, true); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, R, A0, A1); ctx.stroke();
  const s = ease((u - 0.4) / (d * 0.8)), hA = R + fs * 1.6, at = (a) => [cx + Math.cos(a) * hA, cy + Math.sin(a) * hA];
  const aE = Math.PI * (1.5 + 0.015 + 0.09 * s), aW = Math.PI * (1.5 - 0.015 - 0.09 * s);   // vers l'est = à droite
  const [ex, ey] = at(aE), [wx, wy] = at(aW);
  plane(ctx, ex, ey, aE + Math.PI / 2, TEAL, fs * 0.09);
  plane(ctx, wx, wy, aW - Math.PI / 2, "#7c3aed", fs * 0.09);
  // les deux balances
  const k = ease((u - 1.2) / 1.2), by = b.y + b.h * 0.78, bw = Math.min(b.w * 0.36, fs * 7);
  [[b.x + b.w * 0.27, T("ar-west"), vals("scW"), "#7c3aed"], [b.x + b.w * 0.73, T("ar-east"), vals("scE"), TEAL]].forEach(([x, name, kg, col]) => {
    ctx.globalAlpha = k;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.fillRect(x - bw / 2, by - fs * 0.9, bw, fs * 1.8); ctx.strokeRect(x - bw / 2, by - fs * 0.9, bw, fs * 1.8);
    label(ctx, kg, x, by, { size: fs * 0.9, col, weight: 800 });
    label(ctx, name, x, by - fs * 1.4, { size: fs * 0.5, col, weight: 700 });
    ctx.globalAlpha = 1;
  });
}

function sceneEnd(ctx, b, u, d, T, fs, vals) {
  const r = Math.min(b.w / 2, b.h) * 0.36, cy = b.y + b.h * 0.42, gx = b.x + b.w * 0.27, fx = b.x + b.w * 0.73;
  const P = ortho(20, 140 + 30 * u / d, gx, cy, r); globe(ctx, P, gx, cy, r);
  for (const a of data().arcs) path(ctx, P, a.arc, TEAL, 1, 0.5);
  ctx.fillStyle = "#fff7ed"; ctx.strokeStyle = AMBER; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(fx, cy, r, r * 0.32, 0, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  const k = ease((u - 0.4) / 1.2);
  ctx.globalAlpha = k;
  label(ctx, vals("rmsGlobe"), gx, cy + r + fs * 1.1, { size: fs * 1.1, col: TEAL, weight: 800 });
  label(ctx, vals("rmsFlat"), fx, cy + r + fs * 1.1, { size: fs * 1.1, col: AMBER, weight: 800 });
  label(ctx, T("ar-globe"), gx, cy + r + fs * 2.1, { size: fs * 0.5, col: TEAL, weight: 600 });
  label(ctx, T("ar-best"), fx, cy + r + fs * 2.1, { size: fs * 0.5, col: AMBER, weight: 600 });
  ctx.globalAlpha = 1;
}

export const AVIA_SCENES = [{ key: "flights", d: 6.5 }, { key: "speed", d: 7 }, { key: "syd", d: 7 }, { key: "ring", d: 7.5 }, { key: "radius", d: 6.5 }, { key: "gyro", d: 7 }, { key: "weigh", d: 7 }, { key: "end", d: 4.5, num: false }];

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet ; vals = proseValues (les {{clé}} des phrases). */
export function mountAviaReel(canvas, tr, lang, vals = {}) {
  const V = (k) => vals[k] ?? "?";
  const draw = { flights: sceneFlights, speed: sceneSpeed, syd: sceneSyd, ring: sceneRing, radius: sceneRadius, gyro: sceneGyro,
    weigh: (c, b, u, d, T, fs) => sceneWeigh(c, b, u, d, T, fs, V), end: (c, b, u, d, T, fs) => sceneEnd(c, b, u, d, T, fs, V) };
  const REEL = makeReel({ scenes: AVIA_SCENES, draw, prefix: "ar", still: 6.5 + 7 + 5 });   // à l'arrêt : globe et carte, les points déjà tombés
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("ar-alt"));
  return REEL.mountReel(canvas, T);
}
export const AVIA_REEL_EN = EN;
