// Logique pure de l'onglet fou (pendule de Foucault), portée à l'identique
// du legacy (~L18758-18830, updateExpF ~L18992).
import { RAD } from "../../core/math.js";

export const FOU_OMEGA = 15.0410686; // °/h, un tour par jour sidéral
export const FOU_SIDEREAL = 23.9344696; // h
export const FOU_G = 9.81;

/** Taux de précession signé, °/h : Ω sin φ. */
export const fouRate = (phi) => FOU_OMEGA * Math.sin(RAD(phi));
/** Durée d'un tour complet, h (∞ à l'équateur). */
export const fouPeriod = (phi) => { const s = Math.abs(Math.sin(RAD(phi))); return s < 1e-9 ? Infinity : FOU_SIDEREAL / s; };
/** Précession d'Airy (1851) d'une orbite elliptique : (3/8)(ab/L²)√(g/L), convertie en °/h. */
export const fouAiry = (a, b, L) => 0.375 * ((a * b) / (L * L)) * Math.sqrt(FOU_G / L) * (180 / Math.PI) * 3600;
export const fouSense = (phi) => (Math.abs(Math.sin(RAD(phi))) < 1e-9 ? "—" : phi > 0 ? "clockwise" : "anticlockwise");
export const fouHrs = (h) => (!isFinite(h) ? "never" : h >= 100 ? `${h.toFixed(0)} h` : `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, "0")} m`);

export const FOU_LATS = [
  { p: 90, t: "geographic North Pole" }, { p: 60, t: "Oslo, St Petersburg, Anchorage" }, { p: 48.8462, t: "Paris — the Panthéon" },
  { p: 30, t: "Cairo, New Orleans" }, { p: 0, t: "the equator" }, { p: -37.81, t: "Melbourne" }, { p: -90, t: "geographic South Pole" },
];
export const FOU_SITES = [
  { n: "Panthéon, Paris (France)", p: 48.8462, L: "67 m", m: "≈ 11 °/h (Foucault, 1851)" },
  { n: "Museum of Science and Industry, Chicago", p: 41.7912, L: "—", m: "—" },
  { n: "United Nations Headquarters, New York", p: 40.7489, L: "≈ 23 m", m: "—" },
  { n: "Griffith Observatory, Los Angeles", p: 34.1184, L: "≈ 12 m", m: "—" },
  { n: "Amundsen–Scott Station, South Pole", p: -90, L: "33 m", m: "24 h ± 50 m for a full turn, sense reversed" },
];

/** Expérience 1d : tout ce que le calculateur du legacy dérive de (φ, L, a, b en cm, t en h). */
export function fouExp(phi, L, a, bcm, t) {
  const rate = fouRate(phi), aRate = fouAiry(a, bcm / 100, L);
  const T0 = 2 * Math.PI * Math.sqrt(L / FOU_G);
  const ratio = Math.abs(rate) < 1e-6 ? Infinity : Math.abs(aRate / rate);
  const b10 = ((0.1 * Math.abs(rate) * L * L) / (0.375 * a * Math.sqrt(FOU_G / L) * (180 / Math.PI) * 3600)) * 100;
  return { rate, aRate, T0, ratio, b10, swings: Math.round((t * 3600) / T0), gap: Math.abs(FOU_OMEGA - rate) * t };
}
