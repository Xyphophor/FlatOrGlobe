// Les deux ondes de Lamb (Tonga 2022, Krakatoa 1883) l'une contre l'autre (epic17, 2026-10-03).
// À vitesse égale (310 m/s), leurs tours diffèrent de ~1,1 % : c'est l'incertitude PURE sur la
// vitesse (un rapport de durées, sans rayon), qui remplace la vitesse mesurée en 2022 avec des
// distances du globe (règle 10). Module à part pour éviter un import circulaire tonga <-> krakatoa.
import { tongaRadii, tongaResult } from "./tongalogic.js";
import { krakRadii, krakResult } from "./krakatoalogic.js";
import { quart } from "../home/radii.js";

let cache = null;
/** { tonga, krak } : chaque résultat avec, parmi ses alternatives, le rayon de l'autre éruption. */
export function lambPair() {
  if (cache) return cache;
  const t = tongaRadii().lap, k = krakRadii();
  const tMed = quart(t.rows.filter((_, i) => t.keep[i]).map((x) => x.R)).med;
  const kMed = quart(k.rows.filter((_, i) => k.keep[i]).map((x) => x.R)).med;
  cache = { tonga: tongaResult({ otherR: kMed }), krak: krakResult({ otherR: tMed }) };
  return cache;
}
