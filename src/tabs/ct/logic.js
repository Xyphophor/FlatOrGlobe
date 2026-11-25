// Logique pure de l'onglet ct (théodolite céleste), portée à l'identique
// du legacy (ctGamma/ctRate ~L28200, ctCase ~L28781, ctSeries, ctStats,
// ctRadii ~L29059). La grandeur testée est γ = s/R (angle entre les deux
// verticales locales), PAS s/2R (écart entre modèles sur UN poste) -- la
// distinction a failli passer dans le legacy, elle est gardée ici.
import { DEG, RAD } from "../../core/math.js";
import { CT_CASES } from "../../data/presets/ct.js";

export const CT_R = 6371, CT_K = 0.13, CT_SID = 15.041; // km, -, ″ par seconde d'horloge
export const CT_RE = 6371000;
export const CT_SMIN = 20000, CT_KTHEIR = 0.1483; // m ; leur k implicite, s/1.5e6

/** γ = s/R en minutes d'arc, réduit par (1−k). */
export const ctGamma = (sKm, k) => DEG(sKm / CT_R) * (1 - k) * 60;
/** Vitesse de perte d'altitude d'une étoile, ″ par seconde, à la latitude φ et l'azimut A. */
export const ctRate = (latDeg, azDeg) => CT_SID * Math.cos(RAD(latDeg)) * Math.sin(RAD(azDeg));
export const ctArcmin = (a) => `${a.toFixed(2)}′ (${(a / 60).toFixed(3)}°)`;
export const CTd = (x) => x * 60; // degrés -> minutes d'arc

/** Tout ce qui se déduit d'un cas (ctCase du legacy). La réfraction terrestre est prise avec LEUR formule, s/1.5e6 degré. */
export function ctCase(c) {
  const G = DEG(Math.atan((c.hP - c.hO) / c.s));
  const drop = DEG(c.s / (2 * CT_RE));
  const gam = DEG(c.s / CT_RE);
  const t = c.s / 1.5e6;
  return {
    c, G, drop, gam, t,
    flatOff: c.sOT - G,
    globOff: c.sOT - (G - drop),
    flatOn: c.sOA - (G + t),
    globOn: c.sOA - (G - drop + t),
    pairT: c.sPT - c.sOT,
    pairFlat: c.sPT - c.sOT, // le plan prédit 0
    pairGlobe: c.sPT - c.sOT - gam,
    mixed: c.sPT - G, // LA COMPARAISON DE LEUR FEUILLE : les deux bouts mélangés
  };
}

export function ctSeries(cases = CT_CASES) {
  const a = cases.map(ctCase);
  return [
    ["one end · plane", a.map((x) => Math.abs(CTd(x.flatOn))), "flat"],
    ["one end · globe", a.map((x) => Math.abs(CTd(x.globOn))), "globe"],
    ["two ends · plane", a.map((x) => Math.abs(CTd(x.pairFlat))), "flat"],
    ["two ends · globe", a.map((x) => Math.abs(CTd(x.pairGlobe))), "globe"],
  ];
}

/** Moustaches de Tukey, 1,5 IQR, aberrants listés (ctStats du legacy). */
export function ctStats(a) {
  const v = a.slice().sort((x, y) => x - y), n = v.length;
  const q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
  const lo = v.find((x) => x >= q1 - 1.5 * iqr), hi = v.filter((x) => x <= q3 + 1.5 * iqr).pop();
  return { n, q1, q3, med: q(0.5), lo, hi, out: v.filter((x) => x < lo || x > hi), mean: v.reduce((s, x) => s + x, 0) / n };
}

/** Classement des quatre façons de poser la question, par médiane des résidus (ctReadBox). */
export function ctRanking(cases = CT_CASES) {
  const a = cases.map(ctCase), med = (v) => ctStats(v).med;
  return [
    ["plane, refraction off", med(a.map((x) => Math.abs(CTd(x.flatOff))))],
    ["globe, refraction off", med(a.map((x) => Math.abs(CTd(x.globOff))))],
    ["plane, refraction on", med(a.map((x) => Math.abs(CTd(x.flatOn))))],
    ["globe, refraction on", med(a.map((x) => Math.abs(CTd(x.globOn))))],
  ].sort((p, q) => p[1] - q[1]);
}

/** Les trois estimations de R depuis chaque cas au-delà de 20 km (ctRadii). */
export function ctRadii(cases = CT_CASES) {
  const out = [[], [], []];
  for (const c of cases) {
    if (c.s < CT_SMIN) continue;
    const G = DEG(Math.atan((c.hP - c.hO) / c.s));
    const g = RAD(c.sPT - c.sOT), a = RAD(G - c.sOT), b = RAD(G - c.sOA);
    if (g > 0) out[0].push(c.s / g / 1000);
    if (a > 0) out[1].push(c.s / (2 * a) / 1000);
    if (b > 0) out[2].push(((1 - CT_KTHEIR) * c.s) / (2 * b) / 1000);
  }
  return [["γ · two ends", out[0], "globe"], ["one end · raw", out[1], "flat"], ["one end · reduced", out[2], "globe"]];
}
