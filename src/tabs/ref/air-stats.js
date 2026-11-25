// Onglet ref (2026-11-13, demande du propriétaire) : « l'air qu'il faut à chaque modèle », photo par photo, puis la
// statistique de l'écart entre le gradient de température qu'il faut et celui des données du jour, globe et plan.
// Les photos de l'onglet : le dip de Caussols (onglet dip) et Bordighera depuis le balcon près d'Antibes (onglet hh).
// Celles des contributions publiées viennent de leur propre dossier (src/tabs/contrib/<clé>/air.js, crochet `air`
// du registre) : cet onglet ne les nomme pas, pour qu'une contribution retirée disparaisse aussi d'ici.
//
// Une même grandeur pour toutes : le gradient moyen de température dT/dz entre le bas du rayon et l'œil, en K/m.
//   - dip (Caussols) : seuls les deux bouts comptent (invariants de Bouguer et de Snell, caussols-air.js) ;
//   - hauteur cachée (Bordighera) : la forme du profil compte ; rayons tracés par fog dans l'air du jour dont on ne
//     change que la différence air − mer (fog build ref-bordighera).
// Les écarts réduits et les résumés : src/core/air-need.js.
import { RB_AIR, RB_TRACED } from "../../data/presets/ref-bordighera.js";
import { CONTRIBUTIONS } from "../contrib/registry.js";
import { airRow, summarize, bestOffset, DAY_SD_K } from "../../core/air-need.js";
import { causNumbers } from "./caussols-air.js";

/** Interpolation linéaire de y en x sur des points triés selon x (bornée aux bouts). */
function lerp(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) { const u = (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[i - 1] + u * (ys[i] - ys[i - 1]); }
  return ys[ys.length - 1];
}

/** Bordighera : la différence air − mer (K) pour laquelle le modèle cache H m à la Villa Regina Margherita, et le
 * gradient moyen (K/m) de cet air ; null si aucun air tracé ne le fait. La hauteur cachée décroît quand l'air se
 * réchauffe : premier passage sous H en partant de l'air le plus froid. */
export function bordNeed(model, H, T = RB_TRACED) {
  for (let i = 1; i < T.length; i++) {
    const a = T[i - 1][model], b = T[i][model];
    if ((a - H) * (b - H) <= 0 && a !== b) {
      const u = (a - H) / (a - b);
      return { dT: T[i - 1].dT + u * (T[i].dT - T[i - 1].dT), grad: T[i - 1].grad + u * (T[i].grad - T[i - 1].grad) };
    }
  }
  return null;
}

/** Le gradient d'un air − mer donné (K/m), par les airs tracés. */
export const bordGrad = (dT, T = RB_TRACED) => lerp(T.map((r) => r.dT), T.map((r) => r.grad), dT);

/** Le profil de température (°C aux hauteurs RB_AIR.zs) d'un air − mer donné. */
export function bordProfile(dT, T = RB_TRACED) {
  const xs = T.map((r) => r.dT);
  return RB_AIR.zs.map((_, j) => lerp(xs, T.map((r) => r.T[j]), dT));
}

/** Les nombres de l'exemple de Bordighera. dTsd : la marge sur l'air − mer du jour (K), celle d'une réanalyse. */
export function bordNumbers(A = RB_AIR, T = RB_TRACED, dTsd = 0.5) {
  const need = (m) => {
    const c = bordNeed(m, A.H, T), lo = bordNeed(m, A.H + A.Hsd, T), hi = bordNeed(m, A.H - A.Hsd, T);   // plus caché = plus froid
    const gs = [lo, hi].filter(Boolean).map((x) => x.grad);
    return c && { dT: c.dT, grad: c.grad, gLo: Math.min(...gs, c.grad), gHi: Math.max(...gs, c.grad), T: bordProfile(c.dT, T) };
  };
  const day = { dT: A.airSea, grad: A.grad, gLo: bordGrad(A.airSea - dTsd, T), gHi: bordGrad(A.airSea + dTsd, T), T: A.T,
    Tlo: bordProfile(A.airSea - dTsd, T), Thi: bordProfile(A.airSea + dTsd, T) };
  return { H: A.H, Hsd: A.Hsd, eye: A.eye, d: A.d, sst: A.sst, t2: A.t2, u: A.u, P: A.P, dTsd, zs: A.zs, globe: need("globe"), flat: need("flat"), day,
    hiddenGlobe: A.hiddenGlobe, hiddenFlat: A.hiddenFlat };
}

/** Les lignes de l'onglet : Caussols et Bordighera. */
export function refRows() {
  const C = causNumbers(), B = bordNumbers();
  return [
    airRow({ id: "caus", kind: "dip", h: C.h, dz: C.h, floor: DAY_SD_K,
      day: { grad: C.day.grad, gLo: Math.min(C.day.grad, C.day.gFree), gHi: Math.max(C.day.grad, C.day.gFree) },
      globe: { grad: C.globe.grad, gLo: C.globe.gLo, gHi: C.globe.gHi }, flat: { grad: C.flat.grad, gLo: C.flat.gLo, gHi: C.flat.gHi } }),
    airRow({ id: "bord", kind: "hidden", h: B.eye, dz: B.eye - 0.5, day: { grad: B.day.grad, gLo: B.day.gLo, gHi: B.day.gHi },
      globe: B.globe && { grad: B.globe.grad, gLo: B.globe.gLo, gHi: B.globe.gHi }, flat: B.flat && { grad: B.flat.grad, gLo: B.flat.gLo, gHi: B.flat.gHi } }),
  ];
}

/** Les modules `air` des contributions affichées qui en ont un : [{ key, m }]. */
export const loadContribAir = (list = CONTRIBUTIONS) =>
  Promise.all(list.filter((c) => typeof c.air === "function").map((c) => c.air().then((m) => ({ key: c.key, m }))));

/** Tout ce que la section montre, à partir des modules des contributions : les lignes (indépendantes d'abord, puis les
 * séries), les mêmes avec le meilleur décalage de chaque modèle sur chaque série, et les résumés. */
export function airStats(mods = []) {
  const parts = mods.map(({ key, m }) => {
    const tag = (rs) => rs.map((r) => ({ ...r, src: key, series: !!m.series }));
    const raw = tag(m.rows({ b: { globe: 0, flat: 0 } }));
    if (!m.series) return { key, m, raw, shifted: raw, off: null, sum: summarize(raw), sumShifted: summarize(raw) };
    const at = (b) => m.rows({ b: { globe: b, flat: b } }), off = { globe: bestOffset(at, "globe"), flat: bestOffset(at, "flat") };
    const shifted = tag(m.rows({ b: { globe: off.globe.b, flat: off.flat.b } }));
    return { key, m, raw, shifted, off, sum: summarize(raw), sumShifted: summarize(shifted) };
  });
  const own = refRows(), ind = parts.filter((p) => !p.m.series), ser = parts.filter((p) => p.m.series);
  const rows = [...own, ...ind.flatMap((p) => p.raw), ...ser.flatMap((p) => p.raw)];
  const shifted = [...own, ...ind.flatMap((p) => p.raw), ...ser.flatMap((p) => p.shifted)];
  const indep = rows.filter((r) => !r.series);
  return { rows, shifted, parts, all: summarize(rows), indep: summarize(indep), allShifted: summarize(shifted), hasSeries: ser.length > 0 };
}
