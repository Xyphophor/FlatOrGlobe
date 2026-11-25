// Nombres des cartes des éruptions (2026-10-19, propriétaire : « pas de carte complète pour les éruptions de volcans ») :
// le rayon de chaque éruption tel que la section le calcule (lambsys.js, tongalogic.js, krakatoalogic.js), rien d'autre.
import { lambPair } from "./lambsys.js";

export function eruptValues(lang = "en") {
  const nf = (x) => Math.round(x).toLocaleString(lang);
  const { tonga: T, krak: K } = lambPair();
  return { tgR: `${nf(T.med)} km`, tgS: `${nf(T.sigma)} km`, tgN: nf(T.n), tgLo: nf(T.lo95), tgHi: nf(T.hi95),
    krR: `${nf(K.med)} km`, krS: `${nf(K.sigma)} km`, krN: nf(K.n), krLo: nf(K.lo95), krHi: nf(K.hi95) };
}
export function eruptValueLookup(lang) { const v = eruptValues(lang); return (k) => v[k] ?? k; }
