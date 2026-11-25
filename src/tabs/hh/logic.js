// Logique pure de l'onglet hh (hauteur cachée), portée du legacy
// (hhWorld ~L15609, updateHidden ~L15633, updateHiddenRecords). Les trois
// quantités restent RIGOUREUSEMENT séparées (CLAUDE.md "THE THREE
// QUANTITIES") : horizon depuis l'œil, hauteur cachée sur la cible, chute
// sous la tangente aux pieds -- H == chute seulement si e == 0.
import { horizonDist, hiddenHeight, dropBelowTangent, effectiveRadius, globeElev, flatElev, DEG } from "../../core/math.js";

/** État "monde" : R géométrique, k, réfraction on/off, Rg utilisé pour DESSINER (honore la case). */
export function hhWorld(radiusKm, k, on) {
  const R = (Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : 6371) * 1000;
  const kk = Number.isFinite(k) && k >= 0 && k < 1 ? k : 0.13;
  return { R, k: kk, on, Rg: on ? effectiveRadius(R, kk) : R };
}

/** Calcul complet d'une visée : géométrique ET réfracté toujours côte à côte (règle 3). */
export function hiddenCalc(R, k, e, dKm, h) {
  const Rr = effectiveRadius(R, k);
  const d = Math.max(1, dKm * 1000);
  const d0 = horizonDist(R, e), d0r = horizonDist(Rr, e);
  const H = hiddenHeight(R, e, d), Hr = hiddenHeight(Rr, e, d);
  const drop = dropBelowTangent(R, d);
  return {
    d0, d0r, H, Hr, drop,
    visG: Math.max(0, h - H), visR: Math.max(0, h - Hr),
    flatEl: DEG(flatElev(e, d, h)), globeEl: DEG(globeElev(R, e, d, h)), globeElR: DEG(globeElev(Rr, e, d, h)),
    flatHidden: 0, // exactement zéro, à tout e et tout d -- c'est l'argument (règle 4)
  };
}

/**
 * Plafond d'intervisibilité de deux sommets : la somme des deux distances
 * d'horizon EXACTES (updateHiddenRecords() du legacy, ~L15581 --
 * `horizonDist(Rg, r.h1) + horizonDist(Rg, r.h2)`), pas l'approximation
 * √(2R'h) affichée dans la formule de la page (elle-même une
 * approximation pédagogique de horizonDist -- l'écart est de l'ordre de
 * la dizaine de mètres sur des centaines de km, correction faite le
 * 2026-09-16 : cette fonction utilisait l'approximation par erreur).
 */
export function ceilingKm(Rg, h1, h2) {
  return (horizonDist(Rg, h1) + horizonDist(Rg, h2)) / 1000;
}

/** Le k minimal qui dégage un sommet de hauteur h à la distance d depuis un œil à e. */
export function clearingK(R, e, dKm, h) {
  let lo = 0, hi = 0.95;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (hiddenHeight(effectiveRadius(R, mid), e, dKm * 1000) > h) lo = mid; else hi = mid;
  }
  return hi;
}
