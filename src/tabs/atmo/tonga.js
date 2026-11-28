// Section « Hunga Tonga » de l'onglet atmo (venu de seis le 2026-10-19) (epic05/UC05, 2026-10-03) :
// la coupe des 102 baromètres (figure en V), les rayons par station, les deux
// tableaux et la ligne de lecture. Les nombres viennent tous de tongalogic.js ;
// ici on ne fait que dessiner. Figures SVG (FIG), à l'échelle de leurs axes.
import { FIG } from "../../core/fig.js";
import { figFitBox, pearson } from "../../core/fitbox.js";
const sdOf = (a) => { const m = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };

import { axesStamp } from "../../core/formfigs.js";
import { makeT } from "../../core/i18n.js";
import { lambPair } from "./lambsys.js";
import { TONGA_EVENT, TONGA_STATIONS } from "../../data/presets/seis-tonga.js";
import { seisFlatKm } from "../seis/logic.js";
import { TONGA_V, TONGA_RIM, tongaTheta, tongaRadii, tongaFreeFits, tongaFlatFits, tongaGlobeFixed, tongaDomeFits, tongaResult } from "./tongalogic.js";

const C = FIG.C, H = 3600, R0 = 6371;
const DEGOF = (r) => (r * 180) / Math.PI;

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
  if (!cache) cache = { radii: tongaRadii(), free: tongaFreeFits(), flat: tongaFlatFits(), fixed: tongaGlobeFixed(), dome: tongaDomeFits(), res: lambPair().tonga,
    // le même passage que le plan « direct » : le premier seulement
    fixed1: tongaGlobeFixed(R0, TONGA_V, TONGA_STATIONS.map((s) => ({ ...s, a2: null }))) };
  return cache;
}

/** La coupe : une ligne par station, à la hauteur de son angle θ ; temps en abscisse. */
function figV(t) {
  const W = 380, Ht = 340, pl = 40, pr = 12, pt = 34, pb = 40;
  const T1 = 40, th0 = 40, th1 = 120, G = 6; // px par hPa
  const X = (h) => pl + (h / T1) * (W - pl - pr), Y = (th) => pt + ((th - th0) / (th1 - th0)) * (Ht - pt - pb);
  const f = FIG.make({ w: W, h: Ht, alt: t("tg-v-alt", "Band-passed pressure at 102 US weather stations, one line per station placed at its angle from the volcano, against hours after the eruption. Two bands of pulses run across the plot: the first arrives later the farther the station, the second arrives earlier the farther the station, as the globe predicts for a wave coming the short way and then the long way round. The flat model's best line has only the first.") });
  for (let h = 0; h <= T1; h += 10) { f.dash(X(h), pt, X(h), Ht - pb, { c: "#e7e3da", dash: "3 3" }); f.note(X(h), Ht - pb + 13, String(h), { anchor: "middle", size: 9.5 }); }
  for (let th = 50; th <= 110; th += 20) { f.dash(pl, Y(th), W - pr, Y(th), { c: "#efece5", dash: "2 4" }); f.note(pl - 4, Y(th) + 3, `${th}°`, { anchor: "end", size: 9.5 }); }
  const { from, step } = TONGA_EVENT.trace;
  for (const s of TONGA_STATIONS) {
    const y0 = Y(s.theta); let d = "", pen = false;
    s.trace.forEach((v, i) => {
      const h = from + i * step;
      if (h < 0 || h > T1 || v == null) { pen = false; return; }
      const y = y0 - Math.max(-12, Math.min(12, (v / 100) * G));
      d += `${pen ? "L" : "M"}${X(h).toFixed(1)} ${y.toFixed(1)}`; pen = true;
    });
    if (d) f.path(d, { c: C.ink, w: 0.6 });
  }
  // prédictions du globe, rien d'ajusté : R = 6 371 km, v = 310 m/s, t₀ = 0
  const line = (fn, o) => { let d = ""; for (let th = 44; th <= 117; th += 1) d += `${d ? "L" : "M"}${X(fn(th)).toFixed(1)} ${Y(th).toFixed(1)}`; f.path(d, o); };
  const tg = (a) => (R0 * a) / TONGA_V / H;
  line((th) => tg((th * Math.PI) / 180), { c: C.globe, w: 1.6, dash: "5 3" });
  line((th) => tg(2 * Math.PI - (th * Math.PI) / 180), { c: C.globe, w: 1.6, dash: "5 3" });
  // le plan réglé au mieux sur le premier passage (v et t₀ libres) : un point par station
  const fl = numbers().flat.direct;
  for (const s of TONGA_STATIONS) {
    const h = fl.t0 + seisFlatKm(TONGA_EVENT.vent[0], TONGA_EVENT.vent[1], s.lat, s.lon) / fl.v / H;
    if (h <= T1) f.dot(X(h), Y(s.theta), { r: 1.6, c: C.flat });
  }
  // étiquettes dans la bande vide 50-75° (aucune station entre Hawaï et la côte ouest)
  const r57 = (57 * Math.PI) / 180;
  // le second modèle plat, réglé au mieux : le rebond sur le dôme (plafond à la hauteur h), second passage
  const dm = numbers().dome.best;
  for (const s of TONGA_STATIONS) {
    const d = seisFlatKm(TONGA_EVENT.vent[0], TONGA_EVENT.vent[1], s.lat, s.lon), h = dm.t0 + Math.hypot(d, 2 * dm.h) / dm.v / H;
    if (h >= 0 && h <= T1) f.circle(X(h), Y(s.theta), 1.9, { c: C.flat, w: 1 });
  }
  f.note(X(tg(r57)) + 6, Y(57) + 3, t("tg-v-a1", "short way"), { size: 9.5, c: C.globe });
  f.note(X(tg(2 * Math.PI - r57)) - 6, Y(57) + 3, t("tg-v-a2", "long way"), { size: 9.5, c: C.globe, anchor: "end" });
  f.note(X(17.5), Y(68) + 3, t("tg-v-flat", "plane: no second band"), { size: 9.5, c: C.flat, anchor: "middle" });
  f.note(X(17.5), Y(73) + 3, t("tg-v-dome", "dome bounce (○): nearly flat, tilted the wrong way"), { size: 9.5, c: C.flat, anchor: "middle" });
  f.note(pl + (W - pl - pr) / 2, Ht - 6, t("tg-v-x", "hours after the eruption (04:14:45 UTC)"), { anchor: "middle", size: 10 });
  f.note(4, pt - 8, t("tg-v-y", "angle from the volcano, θ"), { size: 10 });
  axesStamp(f, t, t("tg-v-s", "{n} stations, pressure ×{g} px/hPa", { n: TONGA_STATIONS.length, g: G }));
  return f;
}

/** Rayon par station selon θ : premier passage, second passage, 6 371 km en tirets ; exclus en gris. */
function figR(t) {
  const W = 380, Ht = 260, pl = 46, pr = 12, pt = 32, pb = 36, r0 = 5900, r1 = 6900;
  const X = (th) => pl + ((th - 40) / 80) * (W - pl - pr), Y = (R) => pt + (1 - (R - r0) / (r1 - r0)) * (Ht - pt - pb);
  const f = FIG.make({ w: W, h: Ht, alt: t("tg-r-alt", "Earth's radius computed separately at each station, against its angle from the volcano: from the first passage (open circles) and from the second (dots), with 6,371 km dashed. The dots sit in a narrow band just above the line and drift slightly downward with the angle; excluded stations are grey.") });
  for (let th = 40; th <= 120; th += 20) { f.dash(X(th), pt, X(th), Ht - pb, { c: "#e7e3da", dash: "3 3" }); f.note(X(th), Ht - pb + 13, `${th}°`, { anchor: "middle", size: 9.5 }); }
  for (let R = 6000; R <= 6800; R += 200) f.note(pl - 4, Y(R) + 3, String(R), { anchor: "end", size: 9.5 });
  f.line(pl, Y(R0), W - pr, Y(R0), { c: C.ink, w: 1, dash: "4 3" });
  f.note(X(52), Y(R0) + 12, t("tg-r-true", "6,371 km"), { anchor: "middle", size: 9.5 });
  const { radii } = numbers(), byId = Object.fromEntries(TONGA_STATIONS.map((s) => [s.id, s]));
  const plot = (g, hollow) => g.rows.forEach((r, i) => {
    const x = X(DEGOF(tongaTheta(byId[r.id]))), y = Math.max(pt, Math.min(Ht - pb, Y(r.R))), out = !g.keep[i];
    if (hollow || out) f.circle(x, y, out ? 2 : 2.6, { c: out ? C.faint : C.sea, w: 1 });
    else f.dot(x, y, { r: 2.2, c: C.globe });
  });
  plot(radii.a1, true); plot(radii.a2, false);
  f.note(pl + (W - pl - pr) / 2, Ht - 6, t("tg-r-x", "angle from the volcano, θ"), { anchor: "middle", size: 10 });
  f.note(4, pt - 8, t("tg-r-y", "radius from one station (km)"), { size: 10 });
  axesStamp(f, t, t("tg-r-s", "v = 310 m/s, t₀ = 0; off-scale: at the edge"));
  return f;
}

/** Le résultat sur une règle en km : intervalle total (±σ et ±1,96σ), statistique seule, chaque alternative, 6 371 km. */
function figRes(t, lang) {
  const W = 380, Ht = 228, pl = 16, pr = 16, r0 = 5900, r1 = 6900, y = 70;
  const X = (R) => pl + ((R - r0) / (r1 - r0)) * (W - pl - pr);
  const { res } = numbers(), km = (x) => fmt(lang, Math.round(x));
  const f = FIG.make({ w: W, h: Ht, alt: t("tg-res-alt", "The radius found, on a ruler in kilometres: a dot at {r} km, a dark bar for the statistical uncertainty alone, a wide pale band for the total uncertainty at one standard deviation and a thinner one at 95 %, small ticks for each alternative reduction, and the mean radius of 6,371 km dashed, inside the band.", { r: km(res.med) }) });
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
  f.note(W - pr, y + 60, t("tg-res-flat", "plane: no finite radius fits"), { anchor: "end", size: 9.5, c: C.flat });
  // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : le rayon d'un tour complet, le même à chaque station ; pas une
  // droite, et la dispersion est l'écart type des rayons des stations gardées
  { const rd = numbers().radii.lap, Rs = rd.rows.filter((_, i) => rd.keep[i]).map((r) => r.R);
    const ok = new Set(rd.rows.filter((_, i) => rd.keep[i]).map((r) => r.id)), G = TONGA_STATIONS.filter((s) => s.a1 != null && s.a2 != null && ok.has(s.id));   // r : l'intervalle entre passages contre 2π − 2θ, une droite, stations gardées (règle des 3 σ)
    figFitBox(f, W - pr, y + 70, { R: res.med, range: `± ${km(res.sigma)} km`, r: pearson(G.map((s) => 2 * Math.PI - 2 * tongaTheta(s)), G.map((s) => s.a2 - s.a1)), rOf: t("fb-gap", "gap, 2π − 2θ"), scatter: `${km(sdOf(Rs))} km (${t("fb-sd", "SD")})`, chi2nu: null, title: `${Rs.length} ${t("fb-st", "stations")}`, col: C.globe, align: "right" }); }
  axesStamp(f, t, t("tg-res-s", "ticks: the alternative reductions"));
  return f;
}

export function drawTonga(root, lang = "en") {
  const t = tr(lang), q = (id) => root.querySelector(`#${id}`);
  const { radii, free, flat, fixed, fixed1, dome, res } = numbers();
  if (q("tongaVFig")) figV(t).mountIn(q("tongaVFig"));
  if (q("tongaRFig")) figR(t).mountIn(q("tongaRFig"));
  if (q("tongaResFig")) figRes(t, lang).mountIn(q("tongaResFig"));
  const box = q("tongaResult");
  if (box) {
    const kmr = (x) => fmt(lang, Math.round(x));
    box.innerHTML = `<div class="tg-big">R = ${kmr(res.med)} ± ${kmr(res.sigma)} km</div>` +
      `<div class="tg-sub">${t("tg-res-ci", "95 % confidence: {lo} – {hi} km · the mean radius, 6,371 km, lies {z} σ away", { lo: kmr(res.lo95), hi: kmr(res.hi95), z: fmt(lang, Math.abs(res.z), 2) })}</div>` +
      `<div class="tg-sub">${t("tg-res-parts", "statistical ± {st} km ({n} stations) · systematic ± {sy} km, mostly the wave's speed (the two eruptions differ by 1.1 %)", { st: kmr(res.stat), n: res.n, sy: kmr(res.sys) })}</div>` +
      `<div class="tg-sub f">${t("tg-res-flatline", "flat models, tuned in their favour: no radius, and a scatter {x}× the globe's (best: a dome {h} km high)", { x: fmt(lang, dome.best.sd / free.joint.sd, 0), h: kmr(dome.best.h) })}</div>`;
  }
  const km = (x) => fmt(lang, Math.round(x));
  const read = q("tongaRead");
  if (read) read.innerHTML =
    `<span>${t("tg-read-n", "{n} barometers, {k} with both passages", { n: TONGA_STATIONS.length, k: radii.lap.rows.length })}</span>` +
    `<span class="f">${t("tg-read-flat", "best plane, first passage: {x}× the globe's scatter", { x: fmt(lang, flat.direct.sd / fixed1.sd, 1) })}</span>`;
  const rows = q("tongaRows");
  if (rows) {
    const line = (lab, g) => `<tr><td>${lab}</td><td>${g.n} / ${g.rows.length}</td><td>${km(g.mean)} km</td><td>± ${km(g.sd)} km</td><td>${g.mean >= R0 ? "+" : "−"}${fmt(lang, Math.abs((g.mean - R0) / R0) * 100, 1)} %</td></tr>`;
    const j = free.joint;
    rows.innerHTML = line(t("tg-row-a1", "first passage, R = v t₁ / θ"), radii.a1) + line(t("tg-row-a2", "second passage, R = v t₂ / (2π − θ)"), radii.a2) +
      line(t("tg-row-lap", "both, R = v (t₁ + t₂) / 2π"), radii.lap) +
      `<tr><td>${t("tg-row-free", "both on one line, t₀ left free")}</td><td>${j.n} / ${j.of}</td><td>${km(j.R)} km</td><td>± ${km(j.eR)} km ${t("tg-row-fit", "(fit)")}</td><td>${j.R >= R0 ? "+" : "−"}${fmt(lang, Math.abs((j.R - R0) / R0) * 100, 1)} %</td></tr>`;
  }
  const fr = q("tongaFlatRows");
  if (fr) {
    const min = (h) => `${fmt(lang, h * 60, 0)} min`, ms = (v) => `${fmt(lang, v * 1000, 0)} m/s`, hh = (h) => `${h >= 0 ? "+" : "−"}${fmt(lang, Math.abs(h), 1)} h`;
    const g = free.joint;
    let html = `<tr><td>${t("tg-fl-globe0", "globe, nothing fitted (R = 6,371 km, v = 310 m/s)")}</td><td>0</td><td>310 m/s</td><td>0 h</td><td>${min(fixed.sd)}</td></tr>`;
    html += `<tr><td>${t("tg-fl-globe2", "globe, v and t₀ free")}</td><td>2</td><td>${ms(TONGA_V * R0 / g.R)}</td><td>${hh(g.t0)}</td><td>${min(g.sd)}</td></tr>`;
    html += `<tr class="f"><td>${t("tg-fl-direct", "plane, first passage only")}</td><td>2</td><td>${ms(flat.direct.v)}</td><td>${hh(flat.direct.t0)}</td><td>${min(flat.direct.sd)}</td></tr>`;
    for (const r of flat.rim) html += `<tr class="f"><td>${t("tg-fl-rim", "plane, second passage as an echo off a rim at {r} km", { r: km(r.rim) })}${r.rim === TONGA_RIM ? t("tg-fl-rim180", " (the map's edge)") : ""}</td><td>3</td><td>${ms(r.v)}</td><td>${hh(r.t0)}</td><td>${min(r.sd)}</td></tr>`;
    html += `<tr class="f"><td>${t("tg-fl-dome", "plane, second passage bounced off a dome {h} km high (best height)", { h: km(dome.best.h) })}</td><td>3</td><td>${ms(dome.best.v)}</td><td>${hh(dome.best.t0)}</td><td>${min(dome.best.sd)}</td></tr>`;
    fr.innerHTML = html;
  }
}
