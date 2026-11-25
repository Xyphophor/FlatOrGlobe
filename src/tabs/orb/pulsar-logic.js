// Onglet orb : l'unité astronomique par les pulsars (epic37/UC02, 2026-11-18). Calculs purs, testés (pulsar-logic.test.js).
// Les nombres : fog build orb-pulsar (src/data/presets/orb-pulsar.js), chronométrage EPTA DR2 et NANOGrav 15 ans contre positions VLBI MSPSRπ.
import { PSR_ROWS, PSR_AU, PSR_AU_DE } from "../../data/presets/orb-pulsar.js";

export const C_KM = 299792.458;
const D2R = Math.PI / 180, MAS = D2R / 3.6e6;

export function pulsars() {
  return PSR_ROWS.map((r) => ({ name: r[0], array: r[1], epoch: r[2], first: r[3], last: r[4], ntoa: r[5], lam: r[6], bt: r[7], bv: r[8], sbt: r[9], sbv: r[10],
    da: r[11], dd: r[12], db: r[13], au: r[14], sau: r[15], romer: r[16], years: (r[4] - r[3]) / 365.25 }));
}
/** Un pulsar par nom (le premier modèle de chronométrage), pour l'animation. */
export const distinct = () => { const seen = new Set(); return pulsars().filter((p) => !seen.has(p.name) && seen.add(p.name)); };
/** Médiane, plus petite et plus grande valeur (km), et l'unité de DE440. */
export function summary() { const v = pulsars().map((p) => p.au); return { median: PSR_AU[3], min: Math.min(...v), max: Math.max(...v), de: PSR_AU_DE, n: v.length }; }
/** Le retard de Rømer (s) : −(A/c)·r·cos β·cos(λ⊕ − λ), r en UA, λ⊕ longitude héliocentrique de la Terre (rad). */
export const romerDelay = (auKm, betaDeg, lamDeg, rAU, lamEarth) => -(auKm / C_KM) * rAU * Math.cos(betaDeg * D2R) * Math.cos(lamEarth - lamDeg * D2R);
/** La latitude que le chronométrage trouverait si la vraie unité valait A_DE·(1 + ε) : cos β_t = (1 + ε)·cos β ; renvoie β_t − β (mas). */
export function betaShift(betaDeg, eps) {
  const b = Math.abs(betaDeg) * D2R, c = (1 + eps) * Math.cos(b);
  if (c >= 1) return NaN;                        // impossible : le chronométrage verrait l'écart dans ses résidus
  return Math.sign(betaDeg || 1) * (Math.acos(c) - b) / MAS;
}
/** Une unité de 1 000 km plus grande déplacerait chaque latitude de ~ −ε·cot β (mas). */
export const shiftFor1000km = (betaDeg) => betaShift(betaDeg, -1000 / PSR_AU_DE);
