// Onglet « cases » (études de cas, 2026-10-31) : logique pure de l'étude Worthing–Brighton (PIER2PIER 2, février 2019).
// Données : src/data/presets/cases-pier2pier.js (fog build cases-pier2pier). Les rayons sont tracés par le moteur de la
// section laser de l'onglet ref (src/tabs/ref/laser.js), avec le dispositif de chaque essai et l'air mesuré à chaque bout.
import { CASE_P2P } from "../../data/presets/cases-pier2pier.js";
import { LAS, LAS_AIRS, WORTHING_A, WORTHING_B, BRIGHTON, lasBeam, lasKNeed, lasHidden, lasGFor } from "../ref/laser.js";
import { REF_R } from "../ref/logic.js";

/** Le dispositif d'un essai (même forme que LAS) : la distance réelle entre leurs sites, leurs hauteurs. */
export function trialSetup(tr) {
  return { ...LAS, D: CASE_P2P.dist.wb, hL: tr.hs, hE: tr.hc, n: 81 };
}

/** Les airs tracés pour un essai : l'air standard, puis l'air mesuré à chaque bout, sur tout le trajet. */
const STD = LAS_AIRS.find((a) => a.key === "std");
export const P2P_AIRS = [
  { key: "std", ...STD },
  { key: "worthingA", prof: WORTHING_A, top: STD.g },
  { key: "worthingB", prof: WORTHING_B, top: STD.g },
  { key: "brighton", prof: BRIGHTON, top: STD.g },
];

/** Le verdict d'un faisceau : "direct", "reflet" ou "caché". */
const verdict = (b) => (!b.seen ? "hidden" : b.direct ? "direct" : "reflect");

/**
 * L'air ESTIMÉ d'un soir sans relevé (2 février) : profil logarithmique de la couche de surface entre la mer (OISST) et l'air
 * à 2 m (ERA5), rugosité z₀ = 1 mm (0,1 à 10 mm donnent le même verdict) ; au-dessus, le gradient standard.
 */
export function estimatedAir(date, z0 = 1e-3) {
  const e = eveningAt(date), hs = [0, 0.01, 0.03, 0.1, 0.3, 0.6, 1, 1.5, 2];
  return { key: "estimated", prof: hs.map((h) => [h, e.sst + (e.T - e.sst) * Math.log(h / z0 + 1) / Math.log(2 / z0 + 1)]), top: STD.g, P: e.P, T: e.T + 273.15 };
}

/** Tout ce que le tableau des essais affiche, essai par essai. Le 2 février n'a pas de relevé : son air est estimé. */
export function trialRows() {
  return CASE_P2P.trials.map((tr) => {
    let S = trialSetup(tr);
    const measured = tr.date === "2019-02-23";
    if (!measured) { const a = estimatedAir(tr.date); S = { ...S, P: a.P, T: a.T }; }
    const k = lasKNeed(S), g = lasGFor(k, S);
    const airs = measured ? P2P_AIRS : [estimatedAir(tr.date)];
    const traced = Object.fromEntries(airs.map((a) => [a.key, { globe: verdict(lasBeam(a, true, 50, S)), plane: verdict(lasBeam(a, false, 50, S)) }]));
    return { ...tr, D: S.D, measured, hidden0: lasHidden(REF_R, S), hiddenStd: lasHidden(REF_R / 0.87, S), kNeed: k, gNeed: g, traced };
  });
}

/** Les gradients de leurs tableaux : par thermomètre, entre deux lectures, en K/m, et le plus petit/plus grand compatibles
 * avec ±0,25 °C aux deux bouts. */
export function gradients(rows, col) {
  const pts = rows.filter((r) => r[col] != null).map((r) => [r[0], r[col]]);
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const dh = pts[i][0] - pts[i - 1][0], dT = pts[i][1] - pts[i - 1][1];
    out.push({ h0: pts[i - 1][0], h1: pts[i][0], g: dT / dh, lo: (dT - 0.5) / dh, hi: (dT + 0.5) / dh });
  }
  return out;
}

/** Le gradient global, de la plus basse à la plus haute lecture, avec sa marge (±0,25 °C à chaque bout). */
export function overall(rows, col) {
  const pts = rows.filter((r) => r[col] != null);
  const a = pts[0], b = pts.at(-1), dh = b[0] - a[0], dT = b[col] - a[col];
  return { dh, dT, g: dT / dh, lo: (dT - 0.5) / dh, hi: (dT + 0.5) / dh };
}

/** Un soir : l'heure la plus proche de t (h), l'air et la mer (ERA5, OISST) et la marée à cette heure. */
export function eveningAt(date, hour = 20.8) {
  const E = CASE_P2P.evenings[date];
  const r = E.era5.reduce((a, x) => (Math.abs(x[0] - hour) < Math.abs(a[0] - hour) ? x : a));
  const sst = E.sst.reduce((s, v) => s + v, 0) / E.sst.length;
  return { hour: r[0], T: r[1], Td: r[2], P: r[3], wind: r[4], dir: r[5], cloud: r[6], sst, airSea: r[1] - sst };
}

/**
 * Les scènes de l'animation (1 m → 1 m) : le 2 février dans l'air estimé, le 23 dans l'air mesuré à Worthing puis à Brighton,
 * enfin l'air uniforme le plus faible qui montre le laser au globe (k requis + 0,02, pour ne pas tracer sur le fil).
 */
export function p2pScenes() {
  const tr2 = CASE_P2P.trials[0], tr23 = CASE_P2P.trials[2], est = estimatedAir("2019-02-02");
  const S2 = { ...trialSetup(tr2), P: est.P, T: est.T }, S23 = trialSetup(tr23), kN = lasKNeed(S23) + 0.02;
  return [
    { key: "feb2", air: est, S: S2, date: tr2.date },
    { key: "worthing", air: P2P_AIRS[1], S: S23, date: tr23.date },
    { key: "brighton", air: P2P_AIRS[3], S: S23, date: tr23.date },
    { key: "need", air: { key: "need", g: lasGFor(kN, S23) }, S: S23, date: tr23.date },
  ];
}

/** L'i360 et le laser sont presque à la même distance : l'écart d'angle entre eux ne dépend pas de k (mrad). */
export function i360Gap(k, Htop = 162 + 5 + 2.7) {
  const Re = REF_R / (1 - k), di = CASE_P2P.dist.wi360, dl = CASE_P2P.dist.wb;
  const el = (H, d) => Math.atan((H - 1) / d) - d / (2 * Re);
  return 1000 * (el(Htop, di) - el(1, dl));
}

/** L'angle apparent du laser au-dessus de l'horizontale de la caméra (mrad), lumière de courbure k/R, sur le globe et sur
 * le plan : (h_s − h_c)/d − d(1 − k)/2R et (h_s − h_c)/d + k·d/2R. Dans le même air, le globe le met dessous, le plan dessus. */
export function apparentEl(tr, k) {
  const d = CASE_P2P.dist.wb, a = (tr.hs - tr.hc) / d;
  return { globe: 1000 * (a - d * (1 - k) / (2 * REF_R)), plane: 1000 * (a + k * d / (2 * REF_R)) };
}

/** Les nombres de la prose (span.cv[data-v]). */
export function p2pValues(lang = "en") {
  const nf = (x, d = 0) => (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const rows = trialRows(), r1 = rows[1], rLow = rows[4];
  const W = CASE_P2P.therm.worthing, B = CASE_P2P.therm.brighton;
  const wA = overall(W, 1), wB = overall(W, 2), bA = overall(B, 1);
  const e2 = eveningAt("2019-02-02"), e23 = eveningAt("2019-02-23");
  return {
    pD: nf(CASE_P2P.dist.wb / 1000, 1), pBulge: nf(CASE_P2P.dist.wb ** 2 / (8 * REF_R), 1),
    pHid: nf(r1.hidden0, 1), pHidStd: nf(r1.hiddenStd, 1), pK: nf(r1.kNeed, 2), pG: nf(r1.gNeed, 3), pG2: nf(2 * r1.gNeed, 2),
    pKlow: nf(rLow.kNeed, 2), pGlow2: nf(2 * rLow.gNeed, 2), pHidLow: nf(rLow.hidden0, 1),
    pWdT: nf(wA.dT, 1), pWg: nf(wA.g, 2), pWgB: nf(wB.g, 2), pWlo: nf(Math.min(wA.lo, wB.lo), 2),
    pBlo: nf(bA.lo, 2), pBhi: nf(bA.hi, 2), pBdh: nf(bA.dh, 2),
    pRatio: nf(wA.g / r1.gNeed, 0),
    p2T: nf(e2.T, 1), p2S: nf(e2.sst, 1), p2W: nf(e2.wind, 0), p2AS: nf(e2.airSea, 1),
    p23T: nf(e23.T, 1), p23S: nf(e23.sst, 1), p23W: nf(e23.wind, 0), p23AS: nf(e23.airSea, 1), p23P: nf(e23.P, 1),
    pI360: nf(i360Gap(0), 2), pI360b: nf(i360Gap(0.78), 2),
    pElG: nf(Math.abs(apparentEl(r1, r1.kNeed).globe), 2), pElF: nf(apparentEl(r1, r1.kNeed).plane, 2), pElF13: nf(apparentEl(r1, 0.13).plane, 2),
  };
}
