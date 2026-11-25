// Onglet orb : l'écho radar de Vénus, 1961 (epic37/UC03, 2026-11-18). Calculs purs, testés (radar-logic.test.js).
// Les échos : Pettengill et al., Astron. J. 67 (1962) 181, tableau II, notre transcription, réduits de nouveau avec DE440 par
// fog build orb-radar (src/data/presets/orb-radar.js) ; ici, ce que la page en dit et le calcul d'un coin de table.
import { RADAR_ECHOES, RADAR_STATS, RADAR_TEAMS } from "../../data/presets/orb-radar.js";

export const C_KM = 299792.458;          // km/s, exacte
export const R_VENUS = 6051.8;           // km, rayon moyen (Magellan, Archinal et al. 2011)
export const AU_IAU = 149597870.7;       // km, UAI 2012 B2 (comparaison seulement)
export const ELONG_MAX = 46.3;           // °, plus grand écart moyen de Vénus au Soleil
const D2R = Math.PI / 180;

/** Un écho : la distance de l'antenne au point le plus proche de Vénus (km), c·τ/2. */
export const echoDistance = (tau) => C_KM * tau / 2;
/** Le rapport des orbites par l'angle seul : Vénus ne s'écarte jamais de plus de ε du Soleil, sin ε = r_V / r_T (orbites circulaires). */
export const orbitRatio = (elongDeg = ELONG_MAX) => Math.sin(elongDeg * D2R);
/** Le coin de table : à la conjonction, centre à centre d = (1 − r_V/r_T)·UA ⇒ UA = (c·τ/2 + R_V) / (1 − sin ε). */
export function auBackOfEnvelope(tau, elongDeg = ELONG_MAX) { const d = echoDistance(tau) + R_VENUS; return { d, ratio: orbitRatio(elongDeg), au: d / (1 - orbitRatio(elongDeg)) }; }
/** Le meilleur cas plat : une Vénus à H km de l'antenne renverrait l'écho en 2H/c secondes. */
export const flatEcho = (Hkm) => 2 * Hkm / C_KM;
/** La distance qu'un écho de τ secondes impose, quel que soit le modèle. */
export const impliedKm = (tau) => echoDistance(tau);

/** Les échos du tableau II, lisibles. */
export function echoes() {
  return RADAR_ECHOES.map((r) => ({ date: r[0], ut: r[1], tau: r[2], tauErr: r[3], newcomb: r[4], duncombe: r[5], err: r[6], ours: r[7], ours1962: r[8],
    dAU: r[9], station: r[10], elong: r[11], phase: r[12], t: Date.parse(`${r[0]}T${r[1]}Z`) }));
}
/** [moyenne pondérée, son erreur, médiane, dispersion] de chaque réduction (km). */
export const stats = () => RADAR_STATS;
export const teams = () => RADAR_TEAMS.map((r) => ({ facility: r[0], ref: r[1], mhz: r[2], au: r[3], err: r[4] }));
/** L'écho le plus court (la conjonction inférieure). */
export const shortest = () => echoes().reduce((a, b) => (b.tau < a.tau ? b : a));
