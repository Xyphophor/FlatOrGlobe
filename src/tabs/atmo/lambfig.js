// Section « toutes les ondes ensemble » de l'onglet atmo (2026-11-21) : chaque tour mesuré, lot par lot (Tonga t₁ + t₂,
// Tonga A4 − A2 sur sept jours, Krakatoa, la Tsar Bomba), sur une même règle en kilomètres, et le résultat commun.
// Les nombres viennent tous de lambpool.js ; ici on ne fait que dessiner. Figure SVG (FIG), à l'échelle de son axe.
import { FIG } from "../../core/fig.js";
import { figFitBox, pearson } from "../../core/fitbox.js";
import { TONGA_STATIONS } from "../../data/presets/seis-tonga.js";
import { tongaTheta, tongaRadii } from "./tongalogic.js";
import { krakGapFits, krakRadii } from "./krakatoalogic.js";
import { axesStamp as axes } from "../../core/formfigs.js";
import { makeT } from "../../core/i18n.js";
import { lambPool, tsarLaps } from "./lambpool.js";
import { TSAR_STATIONS } from "../../data/presets/atmo-tsar.js";

const C = FIG.C, R0 = 6371;
function tr(lang) {
  const t = makeT(lang, "atmo");
  return (k, fb, vars = {}) => {
    let v = t(k); if (!v || v === k) v = fb;
    for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b);
    return v;
  };
}
const fmt = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const NAMES = {
  tonga: ["lp-set-tonga", "Hunga Tonga 2022, t₁ + t₂"], "tonga-lap": ["lp-set-tlap", "Hunga Tonga 2022, lap A4 − A2"],
  krak: ["lp-set-krak", "Krakatoa 1883, laps both ways"], tsar: ["lp-set-tsar", "Novaya Zemlya 1961, lap III − I"],
};

/** Les nombres du texte (spans data-v). */
export function lambValues(lang = "en") {
  const P = lambPool(), km = (x) => fmt(lang, Math.round(x)), [t, tl, k, ts] = P.sets;
  const long = P.tongaLapSets[1], tsr = tsarLaps();
  return {
    lpR: `${km(P.med)} km`, lpS: `${km(P.sigma)} km`, lpN: fmt(lang, P.n), lpStat: `${km(P.stat)} km`, lpSys: `${km(P.sys)} km`,
    lpZ: fmt(lang, Math.abs(P.z), 2), lpLo: `${km(P.lo95)} km`, lpHi: `${km(P.hi95)} km`,
    lpTonga: `${km(t.med)} km`, lpTlap: `${km(tl.med)} km`, lpKrak: `${km(k.med)} km`, lpTsar: `${km(ts.med)} km`,
    lpTlapN: fmt(lang, long.n), lpTlapOf: fmt(lang, long.of), lpTlapSd: `${fmt(lang, long.sd * 60, 0)} min`, lpTlapT: `${fmt(lang, long.med, 2)} h`,
    lpOddSd: `${fmt(lang, Math.min(...P.tongaLapSets.filter((s) => !s.used).map((s) => s.sd)), 0)}–${fmt(lang, Math.max(...P.tongaLapSets.filter((s) => !s.used).map((s) => s.sd)), 0)} h`,
    lpTsarN: fmt(lang, tsr.T.length), lpTsarRows: fmt(lang, tsr.rows.length), lpTsarAll: fmt(lang, TSAR_STATIONS.length),
    lpTsarT: `${fmt(lang, Math.min(...tsr.T), 2)}–${fmt(lang, Math.max(...tsr.T), 2)} h`,
    lpSpread: `${fmt(lang, ((Math.max(...P.sets.map((s) => s.med)) - Math.min(...P.sets.map((s) => s.med))) / R0) * 100, 1)} %`,
  };
}

/** Une ligne par lot : ses rayons (points), sa médiane (trait), puis le résultat commun et ses bandes. */
function figPool(t, lang) {
  const P = lambPool(), W = 380, rowH = 34, top = 40, Ht = top + rowH * (P.sets.length + 1) + 44 + 82, pl = 12, pr = 12, r0 = 5900, r1 = 6900;
  const X = (R) => pl + ((Math.max(r0, Math.min(r1, R)) - r0) / (r1 - r0)) * (W - pl - pr), km = (x) => fmt(lang, Math.round(x));
  const f = FIG.make({ w: W, h: Ht, alt: t("lp-fig-alt", "Every lap of a pressure wave measured at one station, turned into a radius and placed on a ruler from 5,900 to 6,900 km: one row per set (Hunga Tonga's two passages added, Hunga Tonga's lap after seven days, Krakatoa's laps both ways, the 1961 explosion's lap in Japan). Each set clusters within about 100 km; the sets sit between {lo} and {hi} km. The bottom row is all of them together: {r} km, with bands for its uncertainty, and the mean radius of 6,371 km dashed inside them.", { lo: km(Math.min(...P.sets.map((s) => s.med))), hi: km(Math.max(...P.sets.map((s) => s.med))), r: km(P.med) }) });
  const yA = top + rowH * (P.sets.length + 1) + 6;
  for (let R = 6000; R <= 6800; R += 200) { f.line(X(R), top - 6, X(R), yA, { c: "#efece5", w: 1 }); f.note(X(R), yA + 14, km(R), { anchor: "middle", size: 9.5 }); }
  f.line(X(r0), yA, X(r1), yA, { c: C.faint, w: 1 });
  f.line(X(R0), top - 10, X(R0), yA, { c: C.ink, w: 1.2, dash: "3 2" });
  f.note(X(R0) + 3, top - 12, t("tg-r-true", "6,371 km"), { anchor: "start", size: 9.5, c: C.ink });
  P.sets.forEach((s, i) => {
    const y = top + rowH * i + rowH / 2, [k, fb] = NAMES[s.key];
    f.note(pl, y - 10, `${t(k, fb)} · ${s.n}`, { size: 9.5, c: C.ink });
    // un point par station, décalés en hauteur s'ils se chevauchent (rien d'étiré : seule l'abscisse compte)
    const used = [];
    for (const R of [...s.R].sort((a, b) => a - b)) {
      const x = X(R); let lane = 0;
      while (used.some((u) => u.lane === lane && Math.abs(u.x - x) < 3.2)) lane++;
      used.push({ x, lane });
      f.dot(x, y + 3 + (lane % 4) * 3 - 4.5, { r: 1.5, c: s.dirs === 2 ? C.globe : "#7c3aed" });
    }
    f.line(X(s.med), y - 6, X(s.med), y + 10, { c: C.ink, w: 2 });
  });
  const y = top + rowH * P.sets.length + rowH / 2, band = (lo, hi, h, fill) => f.path(`M${X(lo)} ${y - h}H${X(hi)}V${y + h}H${X(lo)}Z`, { c: "none", w: 0, fill });
  f.note(pl, y - 13, t("lp-set-all", "all together · {n}", { n: P.n }), { size: 10, c: C.globe });
  band(P.lo95, P.hi95, 7, "#e3eafc"); band(P.med - P.sigma, P.med + P.sigma, 7, "#c3d1f6"); band(P.med - P.stat, P.med + P.stat, 3, C.globe);
  f.dot(X(P.med), y, { r: 4.5, c: C.globe });
  axes(f, t, t("lp-fig-s", "blue: both ways · violet: one way"));
  // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : tous les tours ensemble ; pas une droite, dispersion = écart type
  { const all = P.sets.flatMap((x) => x.R), m = all.reduce((a, b) => a + b, 0) / all.length, sd = Math.sqrt(all.reduce((a, b) => a + (b - m) ** 2, 0) / (all.length - 1));
    // r : l'intervalle entre passages divisé par le tour de son éruption, contre (2π − 2θ)/2π (Tonga et Krakatoa ; la Tsar
    // n'a pas les deux passages à chaque station)
    const med = (v) => { const b = [...v].sort((x, y) => x - y); return b[b.length >> 1]; };
    const tl = tongaRadii().lap, okT = new Set(tl.rows.filter((_, i) => tl.keep[i]).map((r) => r.id));
    const TG = TONGA_STATIONS.filter((s) => s.a1 != null && s.a2 != null && okT.has(s.id)), tT = med(TG.map((s) => s.a1 + s.a2));
    const kg = krakGapFits(), KG = kg.rows.filter((_, i) => kg.globe.keep[i]), kr = krakRadii(), tK = med(kr.rows.filter((_, i) => kr.keep[i]).map((r) => r.T));
    const gx = [...TG.map((s) => 1 - tongaTheta(s) / Math.PI), ...KG.map((r) => 1 - r.theta / 180)], gy = [...TG.map((s) => (s.a2 - s.a1) / tT), ...KG.map((r) => r.gap / tK)];
    figFitBox(f, W - pr, yA + 28, { R: P.med, range: `± ${km(P.sigma)} km`, r: pearson(gx, gy), rOf: t("fb-gapn", "gap ÷ lap, Tonga + Krakatoa"), scatter: `${km(sd)} km (${t("fb-sd", "SD")})`, chi2nu: null, title: `${all.length} ${t("fb-laps", "laps")}`, col: C.globe, align: "right" }); }
  return f;
}

export function drawLambPool(root, lang = "en") {
  const t = tr(lang), q = (id) => root.querySelector(`#${id}`), P = lambPool(), km = (x) => fmt(lang, Math.round(x));
  if (q("lambPoolFig")) figPool(t, lang).mountIn(q("lambPoolFig"));
  const box = q("lambPoolResult");
  if (box) box.innerHTML = `<div class="tg-big">R = ${km(P.med)} ± ${km(P.sigma)} km</div>` +
    `<div class="tg-sub">${t("tg-res-ci", "95 % confidence: {lo} – {hi} km · the mean radius, 6,371 km, lies {z} σ away", { lo: km(P.lo95), hi: km(P.hi95), z: fmt(lang, Math.abs(P.z), 2) })}</div>` +
    `<div class="tg-sub">${t("lp-res-parts", "statistical ± {st} km ({n} laps) · systematic ± {sy} km: how far the result moves when the sets are combined other ways", { st: km(P.stat), n: fmt(lang, P.n), sy: km(P.sys) })}</div>`;
  const rows = q("lambPoolRows");
  if (rows) {
    const dir = (s) => s.dirs === 2 ? t("lp-dir-2", "both ways") : t("lp-dir-1", "one way");
    const lap = { tonga: t("lp-lap-tonga", "t₁ + t₂ (eruption time measured)"), "tonga-lap": t("lp-lap-tlap", "A4 − A2, same station"),
      krak: t("lp-lap-krak", "(III − I + IV − II) / 2, same station"), tsar: t("lp-lap-tsar", "III − I, same station") };
    rows.innerHTML = P.sets.map((s) => `<tr><td>${t(...NAMES[s.key])}</td><td>${lap[s.key]}</td><td>${dir(s)}</td><td>${s.n}</td><td>${km(s.med)} km</td><td>${s.med >= R0 ? "+" : "−"}${fmt(lang, Math.abs((s.med - R0) / R0) * 100, 1)} %</td></tr>`).join("") +
      `<tr><td><b>${t("lp-row-all", "all together")}</b></td><td>${t("lp-lap-all", "median of every lap")}</td><td></td><td>${P.n}</td><td><b>${km(P.med)} km</b></td><td>${P.med >= R0 ? "+" : "−"}${fmt(lang, Math.abs((P.med - R0) / R0) * 100, 1)} %</td></tr>`;
  }
}
