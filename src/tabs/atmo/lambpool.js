// Toutes les ondes de Lamb ensemble (propriétaire, 2026-11-21 : « plus de passages pour Tonga, rajouter la Tsar Bomba sur
// plusieurs passages, et réunir toutes ces mesures en une, comme pour les séismes »). Un tour mesuré à UNE station donne
// R = v·T/2π : ni sa position, ni la distance, ni (sauf t₁ + t₂) l'heure de l'explosion n'entrent. Quatre lots :
//   tonga      : t₁ + t₂ (un passage dans chaque sens, heure de l'éruption mesurée), tongalogic ;
//   tonga-lap  : A4 − A2 sur sept jours (fog atmo-tonga-laps), le retour du passage par le chemin long après un tour ;
//   krak       : Krakatoa 1883, un tour dans chaque sens (III − I et IV − II), krakatoalogic ;
//   tsar       : 30 octobre 1961, Novaya Zemlya, troisième train − premier (Murayama 1962), fog atmo-tsar.
// Même règle partout : aberrants à 3 écarts-types des autres (looKeep). Un lot de tours n'est gardé que s'il se resserre
// (écart-type des gardés < LAP_SD_MAX) : un relevé qui tombe n'importe où dans sa fenêtre est du bruit météo, pas un tour.
// Le résultat commun : la médiane de tous les rayons ; incertitude = statistique ⊕ le plus grand écart des autres façons
// de réunir les lots (règle du site, home/radii.js).
import { TONGA_LAPS } from "../../data/presets/atmo-tonga-laps.js";
import { TSAR_STATIONS } from "../../data/presets/atmo-tsar.js";
import { TONGA_V, tongaRadii, looKeep } from "./tongalogic.js";
import { krakRadii } from "./krakatoalogic.js";
import { quart, statSE } from "../home/radii.js";

const H = 3600, R0 = 6371;
/** h : un lot de tours dont les gardés s'écartent de plus d'une heure n'est pas un tour. */
export const LAP_SD_MAX = 1;
const radiusOf = (T, v = TONGA_V) => (v * H * T) / (2 * Math.PI);

export const sd = (x) => { const m = x.reduce((a, b) => a + b, 0) / x.length; return Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1)); };

/** Les tours A(j) − A(i) de Tonga sur sept jours, station par station, aberrants retirés. */
export function tongaLaps(i, j, laps = TONGA_LAPS) {
  const rows = laps.filter((s) => s.a[i] != null && s.a[j] != null).map((s) => ({ id: s.id, T: s.a[j] - s.a[i] }));
  const keep = looKeep(rows.map((r) => r.T)), T = rows.filter((_, k) => keep[k]).map((r) => r.T);
  return { i, j, rows, keep, n: T.length, of: rows.length, med: quart(T).med, sd: T.length > 1 ? sd(T) : Infinity, used: T.length > 1 && sd(T) < LAP_SD_MAX };
}

/** Les tours de la Tsar Bomba : troisième train − premier à une même station ; queried : garder les heures entre parenthèses. */
export function tsarLaps({ queried = false, stations = TSAR_STATIONS } = {}) {
  const rows = stations.filter((s) => s.t[0] != null && s.t[2] != null && (queried || (!s.q[0] && !s.q[2])))
    .map((s) => ({ id: s.id, T: s.t[2] - s.t[0] }));
  const keep = looKeep(rows.map((r) => r.T));
  return { rows, keep, T: rows.filter((_, k) => keep[k]).map((r) => r.T) };
}

let memo = null;
/** Les lots, chacun avec ses rayons gardés, et le résultat commun. */
export function lambPool() {
  if (memo) return memo;
  const tr = tongaRadii().lap, kr = krakRadii();
  const kept = (rows, keep) => rows.filter((_, k) => keep[k]);
  const tl = [[0, 2], [1, 3], [2, 4], [3, 5]].map(([i, j]) => tongaLaps(i, j));
  const longLap = tl[1];
  const ts = tsarLaps();
  const sets = [
    { key: "tonga", year: 2022, dirs: 2, R: kept(tr.rows, tr.keep).map((r) => r.R) },
    { key: "tonga-lap", year: 2022, dirs: 1, R: longLap.used ? kept(longLap.rows, longLap.keep).map((r) => radiusOf(r.T)) : [] },
    { key: "krak", year: 1883, dirs: 2, R: kept(kr.rows, kr.keep).map((r) => r.R) },
    { key: "tsar", year: 1961, dirs: 1, R: ts.T.map((T) => radiusOf(T)) },
  ].map((s) => ({ ...s, ...quart(s.R), stat: statSE(s.R) }));
  const all = sets.flatMap((s) => s.R), q = quart(all), stat = statSE(all);
  // les lots se contredisent plus que leur statistique ne le permet (la vitesse effective de l'onde change d'un événement
  // et d'un trajet à l'autre : vent, température). Règle du site : sys = le plus grand écart à med du même rayon réduit
  // autrement -- chaque lot pesant autant (médiane des médianes), un lot retiré à tour de rôle, les seuls lots chronométrés
  // dans les deux sens (vent annulé), les heures entre parenthèses de la Tsar gardées.
  const tq = tsarLaps({ queried: true }).T.map((T) => radiusOf(T));
  const alts = [
    { k: "per-event", R: quart(sets.map((s) => s.med)).med },
    ...sets.map((s) => ({ k: `without-${s.key}`, R: quart(sets.filter((x) => x !== s).flatMap((x) => x.R)).med })),
    { k: "both-ways", R: quart(sets.filter((s) => s.dirs === 2).flatMap((s) => s.R)).med },
    { k: "tsar-queried", R: quart([...sets.slice(0, 3).flatMap((s) => s.R), ...tq]).med },
  ];
  const sys = Math.max(...alts.map((a) => Math.abs(a.R - q.med))), sigma = Math.hypot(stat, sys);
  memo = { sets, tongaLapSets: tl, ...q, stat, sys, sigma, alts, z: (q.med - R0) / sigma, lo95: q.med - 1.96 * sigma, hi95: q.med + 1.96 * sigma };
  return memo;
}
