// Section « Krakatoa 1883 » de l'onglet atmo (venu de seis le 2026-10-19) (epic05/UC06, 2026-10-03) : le
// temps d'un tour à chaque station, l'intervalle I → II contre les modèles
// plats, la règle du résultat, deux tableaux et la ligne de lecture. Les
// nombres viennent tous de krakatoalogic.js ; ici on ne fait que dessiner.
// Figures SVG (FIG), à l'échelle de leurs axes.
import { FIG } from "../../core/fig.js";
import { figFitBox, pearson } from "../../core/fitbox.js";
const sdOf = (a) => { const m = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };

import { axesStamp as axes } from "../../core/formfigs.js";
import { makeT } from "../../core/i18n.js";
import { lambPair } from "./lambsys.js";
import { RAD } from "../../core/math.js";
import { KRAK_STATIONS } from "../../data/presets/seis-krakatoa.js";
import { KRAK_V, KRAK_RIM, krakTheta, krakLaps, krakRadii, krakGapFits, krakResult, krakRimPath } from "./krakatoalogic.js";

const C = FIG.C, H = 3600, R0 = 6371;
const LAP0 = (2 * Math.PI * R0) / KRAK_V / H; // h : un tour du globe sans rien d'ajusté

function tr(lang) {
  const t = makeT(lang, "atmo");
  return (k, fb, vars = {}) => {
    let v = t(k); if (!v || v === k) v = fb;
    for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b);
    return v;
  };
}
const fmt = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

let cache = null;
function numbers() {
  if (!cache) cache = { radii: krakRadii(), all: krakRadii({ laps: "all" }), queried: krakRadii({ queried: true }),
    out: krakRadii({ dir: "out" }), back: krakRadii({ dir: "back" }), gap: krakGapFits(), res: lambPair().krak };
  return cache;
}

/** Les tours complets, station par station, selon l'angle θ (pour étaler les points seulement). */
function figLaps(t, lang) {
  const W = 380, Ht = 280, pl = 40, pr = 12, pt = 32, pb = 38, h0 = 31.5, h1 = 38.5;
  const X = (th) => pl + ((th - 30) / 125) * (W - pl - pr), Y = (h) => pt + (1 - (h - h0) / (h1 - h0)) * (Ht - pt - pb);
  const f = FIG.make({ w: W, h: Ht, alt: t("kr-lap-alt", "The time of one complete lap of the Earth, measured at each 1883 barograph between two passages of the same wave, against the station's angle from Krakatoa. Laps towards the antipodes (dots) take about 36.4 hours, laps coming back (open circles) about 34.8 hours, at every distance: the lap does not depend on where the station is. The globe's lap with nothing fitted, 35.9 hours, is dashed between them.") });
  for (let th = 40; th <= 150; th += 20) { f.dash(X(th), pt, X(th), Ht - pb, { c: "#e7e3da", dash: "3 3" }); f.note(X(th), Ht - pb + 13, `${th}°`, { anchor: "middle", size: 9.5 }); }
  for (let h = 32; h <= 38; h += 1) f.note(pl - 4, Y(h) + 3, String(h), { anchor: "end", size: 9.5 });
  f.line(pl, Y(LAP0), W - pr, Y(LAP0), { c: C.ink, w: 1, dash: "4 3" });
  for (const s of KRAK_STATIONS) {
    const th = krakTheta(s); if (th == null) continue;
    const L = krakLaps(s), x = X(th);
    for (const T of L.out) if (T != null) f.dot(x, Math.max(pt, Math.min(Ht - pb, Y(T))), { r: 2.2, c: C.globe });
    for (const T of L.back) if (T != null) f.circle(x, Math.max(pt, Math.min(Ht - pb, Y(T))), 2.4, { c: C.sea, w: 1 });
  }
  f.note(W - pr, Y(LAP0) - 5, t("kr-lap-globe", "globe, nothing fitted: {h} h", { h: fmt(lang, LAP0, 1) }), { size: 9.5, anchor: "end" });
  f.note(X(36), Y(38.1), t("kr-lap-out", "• towards the antipodes"), { size: 9.5, c: C.globe });
  f.note(X(36), Y(32.2), t("kr-lap-back", "○ coming back"), { size: 9.5, c: C.sea });
  f.note(pl + (W - pl - pr) / 2, Ht - 6, t("kr-lap-x", "station's angle from Krakatoa, θ (not used for the lap)"), { anchor: "middle", size: 10 });
  f.note(4, pt - 8, t("kr-lap-y", "one lap of the Earth, hours"), { size: 10 });
  axes(f, t, t("kr-lap-s", "{n} laps; off-scale: at the edge", { n: KRAK_STATIONS.reduce((a, s) => { const L = krakLaps(s); return a + [...L.out, ...L.back].filter((x) => x != null).length; }, 0) }));
  return f;
}

/** L'intervalle I → II selon θ : le globe sans rien d'ajusté (droite), le plan au mieux (bord, dôme). */
function figGap(t) {
  const W = 380, Ht = 280, pl = 40, pr = 12, pt = 32, pb = 38, g1 = 32;
  const X = (th) => pl + ((th - 30) / 125) * (W - pl - pr), Y = (h) => pt + (1 - h / g1) * (Ht - pt - pb);
  const { gap } = numbers();
  const f = FIG.make({ w: W, h: Ht, alt: t("kr-gap-alt", "The hours between the first and the second passage of the wave at each station, against its angle from Krakatoa. The points fall on a straight line, from 28 hours near Krakatoa to 7 hours near its antipodes, as the globe predicts with nothing fitted (dashed). The flat model's best echo off a rim (orange dots) and best bounce off a dome (orange open circles) scatter far from the measured points.") });
  for (let th = 40; th <= 150; th += 20) { f.dash(X(th), pt, X(th), Ht - pb, { c: "#e7e3da", dash: "3 3" }); f.note(X(th), Ht - pb + 13, `${th}°`, { anchor: "middle", size: 9.5 }); }
  for (let h = 0; h <= 30; h += 10) f.note(pl - 4, Y(h) + 3, String(h), { anchor: "end", size: 9.5 });
  f.path(`M${X(30)} ${Y((R0 * (2 * Math.PI - 2 * RAD(30))) / KRAK_V / H)}L${X(155)} ${Y((R0 * (2 * Math.PI - 2 * RAD(155))) / KRAK_V / H)}`, { c: C.globe, w: 1.6, dash: "5 3" });
  const rim = gap.rim[0], dome = gap.domeBest, clip = (h) => Math.max(pt, Math.min(Ht - pb, Y(h)));
  for (const r of gap.rows) {
    const x = X(r.theta);
    f.dot(x, clip((krakRimPath(r.s, rim.rim) - r.d) * rim.b), { r: 1.7, c: C.flat });
    f.circle(x, clip((Math.hypot(r.d, 2 * dome.h) - r.d) * dome.b), 2, { c: C.flat, w: 1 });
  }
  for (const r of gap.rows) f.dot(X(r.theta), clip(r.gap), { r: 2.6, c: C.ink });
  f.note(X(138), Y(5.2), t("kr-gap-globe", "globe, nothing fitted"), { size: 9.5, c: C.globe, anchor: "end" });
  f.note(X(36), Y(3), t("kr-gap-flat", "plane at its best: • rim echo, ○ dome bounce"), { size: 9.5, c: C.flat });
  f.note(pl + (W - pl - pr) / 2, Ht - 6, t("kr-gap-x", "station's angle from Krakatoa, θ"), { anchor: "middle", size: 10 });
  f.note(4, pt - 8, t("kr-gap-y", "hours from passage I to passage II"), { size: 10 });
  axes(f, t, t("kr-gap-s", "{n} stations (black); off-scale: at the edge", { n: gap.rows.length }));
  return f;
}

/** Le résultat sur une règle en km, comme Tonga : ±σ et ±1,96σ, statistique seule, chaque alternative, 6 371 km. */
function figRes(t, lang) {
  const W = 380, Ht = 228, pl = 16, pr = 16, r0 = 5900, r1 = 6900, y = 70;
  const X = (R) => pl + ((R - r0) / (r1 - r0)) * (W - pl - pr);
  const { res } = numbers(), km = (x) => fmt(lang, Math.round(x));
  const f = FIG.make({ w: W, h: Ht, alt: t("kr-res-alt", "The radius found from the 1883 barographs, on a ruler in kilometres: a dot at {r} km, a dark bar for the statistical uncertainty alone, a wide pale band for the total uncertainty at one standard deviation and a thinner one at 95 %, small ticks for each alternative reduction, and the mean radius of 6,371 km dashed, inside the band.", { r: km(res.med) }) });
  for (let R = 6000; R <= 6800; R += 200) { f.line(X(R), y + 26, X(R), y + 30, { c: C.faint, w: 1 }); f.note(X(R), y + 42, km(R), { anchor: "middle", size: 9.5 }); }
  f.line(X(r0), y + 26, X(r1), y + 26, { c: C.faint, w: 1 });
  const band = (lo, hi, h, fill) => f.path(`M${X(lo)} ${y - h}H${X(hi)}V${y + h}H${X(lo)}Z`, { c: "none", w: 0, fill });
  band(res.lo95, res.hi95, 9, "#e3eafc"); band(res.med - res.sigma, res.med + res.sigma, 9, "#c3d1f6");
  band(res.med - res.stat, res.med + res.stat, 4, C.globe);
  for (const a of res.alts) f.line(X(a.R), y - 15, X(a.R), y - 10, { c: C.globe, w: 1.4 });
  f.line(X(6371), y - 22, X(6371), y + 22, { c: C.ink, w: 1.2, dash: "3 2" });
  f.note(X(6371), y - 26, t("tg-r-true", "6,371 km"), { anchor: "middle", size: 9.5, c: C.ink });
  f.dot(X(res.med), y, { r: 4.5, c: C.globe });
  f.note(X(res.lo95), y + 18, t("tg-res-95", "95%"), { anchor: "start", size: 9, c: C.globe });
  f.note(W - pr, y + 60, t("kr-res-flat", "plane: no lap, no radius"), { anchor: "end", size: 9.5, c: C.flat });
  // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : le rayon d'un tour complet, le même à chaque station ; pas une
  // droite, et la dispersion est l'écart type des rayons des stations gardées
  { const rd = numbers().radii, Rs = rd.rows.filter((_, i) => rd.keep[i]).map((r) => r.R);
    const g = numbers().gap, gk = g.rows.filter((_, i) => g.globe.keep[i]);   // r : l'intervalle I → II contre 2π − 2θ
    figFitBox(f, W - pr, y + 70, { R: res.med, range: `± ${km(res.sigma)} km`, r: pearson(gk.map((r) => 2 * Math.PI - 2 * RAD(r.theta)), gk.map((r) => r.gap)), rOf: t("fb-gap", "gap, 2π − 2θ"), scatter: `${km(sdOf(Rs))} km (${t("fb-sd", "SD")})`, chi2nu: null, title: `${Rs.length} ${t("fb-st", "stations")}`, col: C.globe, align: "right" }); }
  axes(f, t, t("tg-res-s", "ticks: the alternative reductions"));
  return f;
}

export function drawKrakatoa(root, lang = "en") {
  const t = tr(lang), q = (id) => root.querySelector(`#${id}`);
  const { radii, all, queried, out, back, gap, res } = numbers();
  const km = (x) => fmt(lang, Math.round(x)), min = (h) => `${fmt(lang, h * 60, 0)} min`, hrs = (h) => `${fmt(lang, h, 1)} h`;
  if (q("krakLapFig")) figLaps(t, lang).mountIn(q("krakLapFig"));
  if (q("krakGapFig")) figGap(t).mountIn(q("krakGapFig"));
  if (q("krakResFig")) figRes(t, lang).mountIn(q("krakResFig"));
  const box = q("krakResult");
  if (box) box.innerHTML = `<div class="tg-big">R = ${km(res.med)} ± ${km(res.sigma)} km</div>` +
    `<div class="tg-sub">${t("tg-res-ci", "95 % confidence: {lo} – {hi} km · the mean radius, 6,371 km, lies {z} σ away", { lo: km(res.lo95), hi: km(res.hi95), z: fmt(lang, Math.abs(res.z), 2) })}</div>` +
    `<div class="tg-sub">${t("kr-res-parts", "statistical ± {st} km ({n} stations) · systematic ± {sy} km: the gap fit and the wave's speed (the two eruptions differ by 1.1 %)", { st: km(res.stat), n: res.n, sy: km(res.sys) })}</div>` +
    `<div class="tg-sub f">${t("kr-res-flatline", "flat models, tuned in their favour: no lap at all, and on the first interval a scatter {x}× the globe's", { x: fmt(lang, gap.domeBest.sd / gap.globe0.sd, 0) })}</div>`;
  const read = q("krakRead");
  if (read) read.innerHTML =
    `<span>${t("kr-read-n", "{n} barographs of 1883, {k} with a lap each way", { n: KRAK_STATIONS.length, k: radii.rows.length })}</span>` +
    `<span>${t("kr-read-lap", "laps: {o} towards the antipodes, {b} coming back", { o: hrs(out.rows.reduce((s, r) => s + r.T, 0) / out.rows.length), b: hrs(back.rows.reduce((s, r) => s + r.T, 0) / back.rows.length) })}</span>`;
  const rows = q("krakRows");
  if (rows) {
    const line = (lab, g) => `<tr><td>${lab}</td><td>${g.n} / ${g.rows.length}</td><td>${km(g.med)} km</td><td>± ${km(g.sd)} km</td><td>${g.med >= R0 ? "+" : "−"}${fmt(lang, Math.abs((g.med - R0) / R0) * 100, 1)} %</td></tr>`;
    const gf = gap.globe;
    rows.innerHTML = line(t("kr-row-first", "first lap each way, (III − I + IV − II) / 2"), radii) + line(t("kr-row-all", "every lap each way, averaged"), all) +
      line(t("kr-row-q", "first laps, queried times kept"), queried) + line(t("kr-row-out", "towards the antipodes only (wind not cancelled)"), out) +
      line(t("kr-row-back", "coming back only (wind not cancelled)"), back) +
      `<tr><td>${t("kr-row-gap", "interval I → II against θ, R/v fitted")}</td><td>${gf.n} / ${gf.of}</td><td>${km(gf.R)} km</td><td>± ${min(gf.sd)} ${t("tg-row-fit", "(fit)")}</td><td>${gf.R >= R0 ? "+" : "−"}${fmt(lang, Math.abs((gf.R - R0) / R0) * 100, 1)} %</td></tr>`;
  }
  const fr = q("krakFlatRows");
  if (fr) {
    const ms = (v) => `${fmt(lang, v * 1000, 0)} m/s`;
    let html = `<tr><td>${t("tg-fl-globe0", "globe, nothing fitted (R = 6,371 km, v = 310 m/s)")}</td><td>0</td><td>310 m/s</td><td>${min(gap.globe0.sd)}</td></tr>`;
    html += `<tr><td>${t("kr-fl-globe", "globe, R/v free")}</td><td>1</td><td>${ms((KRAK_V * R0) / gap.globe.R)}</td><td>${min(gap.globe.sd)}</td></tr>`;
    for (const r of gap.rim) html += `<tr class="f"><td>${t("kr-fl-rim", "plane, II as an echo off a rim at {r} km", { r: km(r.rim) })}${r.rim === KRAK_RIM ? t("tg-fl-rim180", " (the map's edge)") : ""}</td><td>1</td><td>${ms(r.v)}</td><td>${min(r.sd)}</td></tr>`;
    html += `<tr class="f"><td>${t("kr-fl-dome", "plane, II bounced off a dome {h} km high (best height)", { h: km(gap.domeBest.h) })}</td><td>2</td><td>${ms(gap.domeBest.v)}</td><td>${min(gap.domeBest.sd)}</td></tr>`;
    fr.innerHTML = html;
  }
}
