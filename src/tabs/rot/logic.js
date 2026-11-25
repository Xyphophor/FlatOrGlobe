// Onglet rot (epic19) : la rotation de la Terre mesurée. Logique pure, testée.
import { RINGS, LAMBDA_M, FALLS } from "../../data/presets/rot.js";
import { quartiles } from "../../core/lsq.js";

const D2R = Math.PI / 180;
export const OMEGA_REF = 7.2921150e-5; // rad/s, pour COMPARER seulement (IERS) ; aucune ligne ne l'utilise pour mesurer

/** Facteur d'échelle d'un anneau rectangulaire a × b : 4A/(λP), en Hz par rad/s. */
export const ringScale = (r, lambda = LAMBDA_M) => (4 * r.a * r.b) / (lambda * 2 * (r.a + r.b));
/**
 * Un anneau : Ω·|sin φ| lu sur la fréquence (Ω_n), puis Ω en divisant par |sin φ|. Prédictions
 * pour le même anneau : globe (Ω_ref sin φ), disque tournant autour du pôle (axe vertical
 * partout : Ω_ref), plan immobile (0).
 */
export function ringRow(r) {
  const S = ringScale(r), on = r.f / S, s = Math.abs(Math.sin(r.lat * D2R));
  return { ...r, A: r.a * r.b, P: 2 * (r.a + r.b), S, omegaN: on, omega: on / s,
    fGlobe: S * OMEGA_REF * s, fDisc: S * OMEGA_REF, fStill: 0 };
}
export const ringRows = () => RINGS.map(ringRow);
/** Le test sans paramètre : rapport des Ω_n Wettzell / Cashmere contre sin 49,14° / sin 43,58° (globe) et 1 (disque). */
export function ringRatio() {
  const R = ringRows(), g = R.find((x) => x.id === "G"), c = R.find((x) => x.id === "C-II");
  return { measured: g.omegaN / c.omegaN, globe: Math.sin(g.lat * D2R) / Math.sin(-c.lat * D2R), disc: 1 };
}

/** Chute vers l'est : ω = 3d / (g t³ cos φ), t = √(2h/g). g = 9,81 m/s² (constante de labo). */
export function fallRow(f, g = 9.81) {
  const t = Math.sqrt((2 * f.h) / g), c = Math.cos(f.lat * D2R);
  const omega = (3 * (f.d / 1000)) / (g * t ** 3 * c);
  return { ...f, t, omega, dGlobe: (OMEGA_REF * g * t ** 3 * c) / 3 * 1000, eOmega: f.e ? omega * (f.e / f.d) : null };
}
export const fallRows = () => FALLS.map((f) => fallRow(f));
/** Exclusion à > 3 écarts-types des autres (règle du propriétaire, sans seuil en %) : sur les ω. */
export function fallStats() {
  const R = fallRows(), w = R.map((r) => r.omega);
  const keep = R.filter((r, i) => {
    const o = w.filter((_, j) => j !== i), m = o.reduce((a, b) => a + b, 0) / o.length;
    const sd = Math.sqrt(o.reduce((a, b) => a + (b - m) ** 2, 0) / (o.length - 1));
    return Math.abs(r.omega - m) <= 3 * sd;
  });
  return { all: quartiles(w), kept: keep.map((r) => r.who), q: quartiles(keep.map((r) => r.omega)) };
}

/**
 * Jour sidéral : une étoile passe derrière un repère fixe à l'instant t1 (s), puis N tours plus
 * tard à t2 (s, même horloge, jours civils compris). Durée d'un tour, avance par nuit sur le jour
 * solaire, et nombre de tours de plus par an (le tour de l'orbite).
 */
export function siderealDay(t1s, t2s, nights) {
  const sid = (t2s - t1s) / nights;                             // durée d'un tour mesurée
  return { sid, advance: 86400 - sid, omega: (2 * Math.PI) / sid, turnsPerYear: 86400 / (86400 - sid) };
}
