// Les nombres calculés des textes de l'onglet ref (span.cv[data-v] de la page, {{clé}} des cartes) : lignes réciproques de
// Schott, radiosondages IGRA 2, section laser, Caussols. Sans DOM, pour que les cartes les lisent aussi.
import { ZEN_PAIRS, ZEN_HOURLY } from "../../data/presets/ref-zenith.js";
import { REF_IGRA, REF_IGRA_ST } from "../../data/presets/ref-igra.js";
import { lasValues } from "./laser.js";
import { causValues } from "./caussols-air.js";
import { bordValues } from "./bord-air.js";

/** r de Pearson de E contre s, rayon effectif de la droite E = c s par zéro (″/km → km), écart type des résidus (″). */
export function zenFit(pairs = ZEN_PAIRS) {
  const x = pairs.map((p) => p[3]), y = pairs.map((p) => p[4]), n = x.length, mx = x.reduce((a, b) => a + b) / n, my = y.reduce((a, b) => a + b) / n;
  let a = 0, b = 0, c = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; sxy += x[i] * y[i]; sxx += x[i] * x[i]; }
  const k = sxy / sxx, res = y.map((v, i) => v - k * x[i]);
  return { r: a / Math.sqrt(b * c), reff: 206264.806 / k, scatter: Math.sqrt(res.reduce((s, v) => s + v * v, 0) / (n - 1)) };
}
const zenStats = (nf) => { const f = zenFit(); return { zenCorr: nf(f.r, 3), zenFitReff: nf(f.reff), zenScat: nf(f.scatter) }; };

/** Les nombres de la section « Ninety-seven lines » (fog build surv-zenith). */
export function zenValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
  const reg = (g) => ZEN_PAIRS.filter((p) => p[0] === g).map((p) => p[5]);
  const withM = ZEN_PAIRS.filter((p) => p[7] != null), dev = Math.max(...withM.map((p) => Math.abs(p[6] - 2 * p[7])));
  const minP = ZEN_PAIRS.reduce((a, p) => (p[4] < a[4] ? p : a));
  const night = ZEN_HOURLY.filter((h) => h[0] <= 5 || h[0] >= 20), day = ZEN_HOURLY.filter((h) => h[0] >= 12 && h[0] <= 16);
  const mean = (a) => a.reduce((s, h) => s + h[2], 0) / a.length;
  return { zenRows: "302", zenN: String(ZEN_PAIRS.length), zenSchott: `±${nf(dev, 3)}`, zenSchottN: String(withM.length),
    zenReff: nf(med(ZEN_PAIRS.map((p) => p[5]))), zenReffCo: nf(med(reg("Colorado"))), zenReffCa: nf(med(reg("California"))),
    zenMinE: nf(minP[4], 0), zenMinS: nf(minP[3], 1), zenNight: nf(mean(night), 3), zenNoon: nf(mean(day), 3),
    zenPairsH: String(ZEN_HOURLY.reduce((s, h) => s + h[1], 0)),
    // corrélation de l'excès avec la longueur et dispersion autour de la droite par zéro (2026-11-27, règle de kappa :
    // r partout, χ²/ν seulement avec une erreur de lecture indépendante -- Schott n'en imprime pas par ligne)
    ...zenStats(nf),
    // radiosondages IGRA 2 de 2026 (fog build ref-igra)
    igN: nf(REF_IGRA.soundings), igSt: nf(REF_IGRA.stations), igDay: nf(REF_IGRA.lowDay.med, 2), igNight: nf(REF_IGRA.lowNight.med, 2),
    igDayQ1: nf(REF_IGRA.lowDay.q1, 2), igDayQ3: nf(REF_IGRA.lowDay.q3, 2), igKmDay: nf(REF_IGRA.kmDay.med, 2), igKmNight: nf(REF_IGRA.kmNight.med, 2),
    igGe1N: nf(REF_IGRA.lowNight.ge1 * 100, 1), igGe1D: nf(REF_IGRA.lowDay.ge1 * 100, 1),
    igConc: nf(Math.round((REF_IGRA_ST.find((r) => /CONCORDIA/.test(r[1]))?.[12] ?? 0) * 100), 0) };
}

/** Bordighera (2026-11-13) ; les nombres de la statistique (rs*) arrivent avec les lignes des contributions
 * (air-stats-fig.js, mountAirStats). */
export const airValues = (lang = "en") => ({ ...bordValues(lang) });

/** Toutes les valeurs, pour les cartes (card.values). */
export function refValueLookup(lang = "en") {
  const v = { ...zenValues(lang), ...lasValues(lang), ...causValues(lang), ...airValues(lang) };
  return (k) => v[k] ?? k;
}
