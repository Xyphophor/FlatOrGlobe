// La zone d'ombre des ondes P, station par station (2026-10-25, propriétaire) : les neuf séismes de l'ISC, chaque
// station classée par les phases que le bulletin lui donne (0 P directe, 1 Pdif seulement, 2 PKP seulement :
// fog build seis-shadow, tools/internal/build/seisshadow). Le globe prédit « P directe » jusqu'à 103° de l'épicentre,
// sans rien ajuster ; une carte plate (azimutale équidistante, centre au choix) a droit à son meilleur rayon ρ.
// Mêmes règles que le compilateur ; ici pour la carte choisie dans la page (pré-calcul : SHADOW_MAPS, SHADOW_BEST).
import { makeAE, gcDeg } from "../../core/aeproj.js";
import { SHADOW_QUAKES, SHADOW_GLOBE, SHADOW_MAPS, SHADOW_BEST } from "../../data/presets/seis-shadow.js";

export { SHADOW_QUAKES, SHADOW_GLOBE, SHADOW_MAPS, SHADOW_BEST };

/**
 * Le seuil qui classe le mieux des points [d, direct] (P directe en deçà de ρ, aucune au-delà) :
 * { n bien classés, rho }. Même balayage que le compilateur (ρ au milieu de deux distances voisines).
 */
export function bestRing(pts) {
  const ps = pts.slice().sort((a, b) => a[0] - b[0]);
  let out = ps.filter((p) => !p[1]).length, inn = 0, bestN = out, rho = 0;
  for (let i = 0; i < ps.length; i++) {
    if (ps[i][1]) inn++; else out--;
    if (i + 1 < ps.length && ps[i + 1][0] === ps[i][0]) continue;
    if (inn + out > bestN) { bestN = inn + out; rho = i + 1 < ps.length ? (ps[i][0] + ps[i + 1][0]) / 2 : ps[i][0] + 1; }
  }
  // none : l'anneau englobe toutes les stations -- aucun anneau ne fait mieux que d'appeler « P directe » chacune
  return { n: bestN, rho, none: ps.length > 0 && rho > ps[ps.length - 1][0] };
}

/** Distances (degrees de carte) de l'épicentre à chaque station sur la carte `map`, avec le drapeau « P directe ». */
export function flatPoints(q, map) {
  const [ex, ey] = map.fwd(q.epi[0], q.epi[1]);
  return q.st.map(([la, lo, c]) => { const [x, y] = map.fwd(la, lo); return [Math.hypot(x - ex, y - ey), c === 0]; });
}

/** Le globe, sans paramètre : part des stations où « P directe » ⇔ Δ < 103°. */
export function globeShare(q, edge = SHADOW_GLOBE.edge) {
  return q.st.filter(([la, lo, c]) => (gcDeg(q.epi[0], q.epi[1], la, lo) < edge) === (c === 0)).length / q.st.length;
}

/** Une carte plate de centre c : chaque séisme avec son meilleur anneau, et un anneau pour les neuf. */
export function scoreMap(c, quakes = SHADOW_QUAKES) {
  const map = makeAE({ lat0: c[0], lon0: c[1] });
  const per = quakes.map((q) => flatPoints(q, map));
  const own = per.map((p) => { const b = bestRing(p); return { share: b.n / p.length, rho: b.rho, none: b.none }; });
  const all = per.flat(), common = bestRing(all), n = all.length;
  return { map, own, common: { share: common.n / n, rho: common.rho, none: common.none }, ownAll: own.reduce((s, o, i) => s + o.share * per[i].length, 0) / n };
}
