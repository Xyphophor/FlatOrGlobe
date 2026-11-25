// Calculs de l'onglet orb faits une fois (le meilleur plat parcourt 462 jours) : mémoïsés.
import { SUN_DAYS } from "../../data/presets/orb-sun.js";
import { TAU_CETI } from "../../data/presets/orb-star.js";
import { SDO_RSUN } from "../../data/presets/orb-sdo.js";
import * as o from "./logic.js";

let memo = null;
export function orbData() {
  if (memo) return memo;
  const days = o.sunDays(SUN_DAYS), year = o.sunYear(days), sdo = o.sdoEccentricity(SDO_RSUN);
  const Hflat = o.bestFlatH(SUN_DAYS);
  const rmsFlat = o.modelCost(SUN_DAYS, (d) => o.flatSunRV(d, Hflat)), rmsGlobe = o.modelCost(SUN_DAYS, (d) => o.globeSunRV(d));
  // le jour montré : celui dont le résidu est le médian (règle fixée d'avance, pas le plus beau)
  const byRms = days.map((d, i) => [d.rms, i]).sort((a, b) => a[0] - b[0]);
  const shown = SUN_DAYS[byRms[byRms.length >> 1][1]];
  memo = { days, year, sdo, au: o.auFromDoppler(year.K, sdo.e), Rq: o.quartiles(days.map((d) => d.R)), Hflat, rmsFlat, rmsGlobe, shown,
    star: o.starYear(TAU_CETI), bradley: o.fromLightTime(492), parAU: o.parallaxAU(0.314) };
  return memo;
}
export { SUN_DAYS, TAU_CETI, SDO_RSUN };
