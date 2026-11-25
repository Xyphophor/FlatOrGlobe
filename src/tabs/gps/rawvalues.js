// Nombres du texte du panneau « GPS bruts » (epic16/UC03), tous calculés
// (rawlogic.js sur data/presets/gps-raw.js) : index.js les pose dans les
// <span class="cv" data-v>.
import { rawData } from "./rawfig.js";
import { num } from "../curv/fmt.js";

const WGS_A = 6378137, WGS_F = 1 / 298.257223563;   // WGS84 : a, 1/f (modèle publié, comparé, jamais ajusté)

export function gpsRawValues() {
  const { raw, earth: E, pair, share: X } = rawData(), V = pair?.vis;
  const o = {
    grN: num(raw.stations.length), grRes: `${num(raw.resid.rms, 1)} m`, grP95: `${num(raw.resid.p95, 1)} m`,
    grR: `${num(E.R / 1000)} ± ${num(E.seR / 1000, 1)} km`, grCentre: `${num(E.centre / 1000, 1)} km`,
    grPlane: `${num(E.plane.rms / 1000)} km rms`, grSphRms: `${num(E.rms / 1000, 1)} km`, grDelta: `${num(E.delta, 1)} km`,
    grPairs: num(X.pairs.length), grShareMax: `${num(X.maxShared, 1)}°`, grLimit: `${num(X.limit, 1)}°`, grDisjoint: `${num(X.minDisjoint, 0)}°`, grAEarth: `${num(26560)} km`,
    grWgs: `${num(WGS_A * WGS_F / 1000, 1)} km`, grAfter: `${num(E.deflatedRms, 1)} km`,
  };
  if (V) Object.assign(o, {
    grA: pair.A.id, grB: pair.B.id, grAB: `${num(pair.deg)}° (${num(pair.km)} km)`, grCommon: num(V.common, 1), grOnlyA: num(V.onlyA, 1), grOnlyB: num(V.onlyB, 1), grSame: `${num(V.same * 100)} %`,
  });
  return o;
}

/** Valeurs des cartes d'export (data/cards/gps.js) : les mêmes nombres que la page. */
const memo = { v: null };
export function cardValueLookup() {
  memo.v ??= gpsRawValues();
  return (k) => memo.v[k] ?? "?";
}
