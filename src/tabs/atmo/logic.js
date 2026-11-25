// Onglet "atmo" (epic29, 2026-10-17, demande du propriétaire) : le gradient de pression, les ondes radio et l'ionosphère,
// pourquoi les satellites ne fondent pas. Logique pure, testée. Les [n] renvoient à src/data/sources/atmo.js.
import { USSA1976 } from "../../data/presets/atmo-ussa.js";

export const K_B = 1.380649e-23, N_A = 6.02214076e23, SIGMA = 5.670374419e-8, AMU = 1.66053907e-27; // CODATA 2018 [6]
export const G0 = 9.80665, S_SUN = 1361;                                                              // W/m², Kopp & Lean [5]

/** La table 1976 à une altitude (km) : interpolation linéaire de T et de la vitesse, logarithmique de p, ρ, n [1]. */
export function ussa(zKm) {
  const T = USSA1976, i = Math.max(0, Math.min(T.length - 2, T.findIndex((r) => r[0] > zKm) - 1));
  const a = T[i < 0 ? T.length - 2 : i], b = T[(i < 0 ? T.length - 2 : i) + 1], f = (zKm - a[0]) / (b[0] - a[0]);
  const lin = (j) => a[j] + f * (b[j] - a[j]), lg = (j) => Math.exp(Math.log(a[j]) + f * (Math.log(b[j]) - Math.log(a[j])));
  return { z: zKm, T: lin(1), p: lg(2), rho: lg(3), n: lg(4), v: lin(5) };
}

/** Hauteur d'échelle H = kT/(m g) (m) : sur H, la pression est divisée par e. M en g/mol. */
export const scaleHeight = (T, M = 28.9645, g = G0) => (K_B * T) / ((M / 1000 / N_A) * g);
/** Formule barométrique isotherme : p(h) = p₀ e^(−h/H). */
export const barometric = (h, p0, H) => p0 * Math.exp(-h / H);

/** Flux de molécules qui frappent une surface (par m² et par s) : n v̄ / 4 (théorie cinétique [2]). */
export const impactFlux = (n, vbar) => (n * vbar) / 4;
/** Énergie qu'apporte un gaz de température T à une surface : chaque molécule qui la frappe apporte 2kT en moyenne [2]. */
export const gasEnergyFlux = (n, vbar, T) => impactFlux(n, vbar) * 2 * K_B * T;
/**
 * Échange NET entre un gaz à Tgas et une paroi à Twall (W/m²), accommodation complète : le gaz apporte 2kTgas par impact
 * et repart avec 2kTwall. Nul à températures égales, proportionnel à la densité.
 */
export const netGasHeat = (n, vbar, Tgas, Twall) => impactFlux(n, vbar) * 2 * K_B * (Tgas - Twall);
/** Échauffement par la vitesse du satellite dans le gaz (W/m², face avant) : ½ ρ v³. */
export const ramHeat = (rho, v) => 0.5 * rho * v ** 3;
/** Équilibre radiatif : absorbe α S sur l'aire éclairée, rayonne ε σ T⁴ sur toute la surface (rapport ratio = aire totale / aire éclairée). */
export const equilibriumT = (alpha = 1, eps = 1, ratio = 4, S = S_SUN) => ((alpha * S) / (eps * SIGMA * ratio)) ** 0.25;

// L'IONOSPHÈRE [3]. Fréquence de plasma f_p = 8,98 √Nₑ (Hz, Nₑ en électrons par m³) ; une onde verticale de fréquence f se
// réfléchit là où f = f_p, et traverse si f dépasse la fréquence critique foF2 du pic. Une onde oblique se réfléchit jusqu'à
// f = foF2 / cos φ (loi de la sécante), φ l'angle d'incidence sur la couche.
export const plasmaFreq = (Ne) => 8.98 * Math.sqrt(Ne);
/** Couches typiques (hauteur du pic en km, Nₑ au pic en m⁻³) de jour et de nuit, moyenne latitude, activité solaire moyenne [3][4]. */
export const LAYERS = {
  day: { D: { h: 75, Ne: 1e9 }, E: { h: 110, Ne: 1.5e11 }, F: { h: 300, Ne: 1e12 } },
  night: { D: null, E: { h: 110, Ne: 5e9 }, F: { h: 320, Ne: 2e11 } },
};
export const R_EARTH_KM = 6371;
/** Angle d'incidence (degrés) sur une couche de hauteur h pour un départ à l'élévation e, sur une Terre ronde. */
export function incidence(elevDeg, hKm, R = R_EARTH_KM) {
  return (Math.asin((R / (R + hKm)) * Math.cos((elevDeg * Math.PI) / 180)) * 180) / Math.PI;
}
/** Une onde de fréquence f (Hz) partie à l'élévation e se réfléchit-elle sur une couche de fréquence critique fo à la hauteur h ? */
export const reflects = (f, foHz, elevDeg, hKm) => f <= foHz / Math.cos((incidence(elevDeg, hKm) * Math.PI) / 180);
/** Longueur au sol d'un bond (km) : angle au centre 2 (90° − e − φ), φ l'incidence. */
export function hopKm(elevDeg, hKm, R = R_EARTH_KM) {
  const phi = incidence(elevDeg, hKm, R);
  return 2 * R * ((90 - elevDeg - phi) * Math.PI) / 180;
}
/** Le plus long bond possible (départ rasant) : 2 R arccos(R/(R+h)). Sur un plan il n'aurait pas de limite. */
export const maxHopKm = (hKm, R = R_EARTH_KM) => 2 * R * Math.acos(R / (R + hKm));

// RAYONNEMENT -> ÉNERGIE -> TEMPÉRATURE (2026-10-18, propriétaire). Une plaque d'aluminium noire de 1 m², 2 mm d'épaisseur,
// face au Soleil, sur une orbite circulaire à 400 km. Le Soleil apporte S·A (watts) quand la plaque est éclairée ; l'énergie
// s'accumule dans la plaque, C dT/dt = P_in − P_out ; la plaque rayonne par ses deux faces, P_out = 2 ε σ A T⁴. La lumière
// renvoyée par la Terre et son infrarouge sont laissés de côté pour garder les trois étapes visibles.
export const PLATE = { A: 1, thick: 0.002, rho: 2700, c: 897, alpha: 1, eps: 1 };   // aluminium : 2 700 kg/m³, 897 J/(kg·K)
export const plateC = (p = PLATE) => p.A * p.thick * p.rho * p.c;                    // capacité thermique, J/K
export const GM_EARTH = 3.986004418e14;
/** Orbite circulaire à h km : période (s) et fraction passée dans l'ombre de la Terre (Soleil dans le plan de l'orbite). */
export function orbitShadow(hKm, R = R_EARTH_KM) {
  const a = (R + hKm) * 1e3, T = 2 * Math.PI * Math.sqrt(a ** 3 / GM_EARTH);
  return { T, shadow: Math.asin(R / (R + hKm)) / Math.PI };
}
/** Équilibre de la plaque en plein Soleil : S A = 2 σ A T⁴. */
export const plateEq = (p = PLATE, S = S_SUN) => ((p.alpha * S) / (2 * p.eps * SIGMA)) ** 0.25;
/**
 * La température de la plaque au fil d'une orbite, régime établi (plusieurs orbites intégrées, la dernière gardée), pas dt :
 * [{t, T, pin, pout, sun}]. L'ombre est centrée sur le milieu de l'orbite.
 */
export function plateOrbit(hKm = 400, p = PLATE, S = S_SUN, dt = 5) {
  const { T: P, shadow } = orbitShadow(hKm), C = plateC(p), n = Math.round(P / dt), out = [];
  let T = 250;
  for (let orbit = 0; orbit < 8; orbit++) {
    for (let k = 0; k < n; k++) {
      const f = k / n, sun = Math.abs(f - 0.5) > shadow / 2, pin = sun ? p.alpha * S * p.A : 0, pout = 2 * p.eps * SIGMA * p.A * T ** 4;
      if (orbit === 7) out.push({ t: k * dt, T, pin, pout, sun });
      T += ((pin - pout) / C) * dt;
    }
  }
  return { P, shadow, C, rows: out };
}
