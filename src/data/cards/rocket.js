// Cartes autonomes de l'onglet rocket (2026-10-27) : une par animation, plus les poussées du RS-25 et la détente de Joule ;
// la formule en bande sans redessiner sa figure (fxFigs: false), sauf pour les deux figures fixes. Textes :
// src/i18n/<langue>/rocket-cards.json ; {{clé}} = rocketValues.
import { rocketValues } from "../../tabs/rocket/logic.js";

const V = (lang) => { const v = rocketValues(lang); return (k) => String(v[k] ?? k); };

export const SOURCES = {
  bernoulli: "D. Bernoulli, Hydrodynamica (1738), section X: pressure as the impacts of particles; J. C. Maxwell, Phil. Mag. 19 (1860) 19.",
  newton: "I. Newton, Principia (1687), Law III and Corollary IV.",
  sutton: "G. P. Sutton, O. Biblarz, Rocket Propulsion Elements, 9th ed. (Wiley, 2017): thrust equation, choked throat, c*.",
  rs25: "NASA Facts FS-2020-10-42-MSFC, RS-25 Core Stage Engine: 512,300 lbf in vacuum, 416,300 lbf at sea level (109 %).",
  rs25dim: "RS-25: chamber pressure 20.64 MPa, mass flow 514.49 kg/s, nozzle exit 2.30 m and throat 0.26 m across (Wikipedia, after Rocketdyne); Isp 452.3 s / 366 s (Aerojet Rocketdyne).",
  goddard: "R. H. Goddard, A Method of Reaching Extreme Altitudes, Smithsonian Misc. Coll. 71 (2), 1919: velocities in vacuo larger than in air.",
  nyt: "The New York Times, 13 January 1920, p. 12, and “A Correction”, 17 July 1969, p. 43.",
  joule: "J. P. Joule, Phil. Mag. 26 (1845) 369: air let into an evacuated vessel does no external work.",
  tsiol: "K. E. Tsiolkovsky, Naučnoe obozrenie 5 (1903): Δv = u ln(m₀/m₁).",
  b2: "NASA Glenn, In-Space Propulsion Facility (B-2): full-scale upper stages hot-fired in a vacuum chamber.",
};

export const CARDS = [
  { id: "box", figs: ["rocketAnimBox"], fx: ["rk-fx-kick"], fxFigs: false, values: V, src: ["bernoulli", "newton"] },
  { id: "hole", figs: ["rocketAnimHole"], fx: ["rk-fx-hole"], fxFigs: false, src: ["sutton"] },
  { id: "fill", figs: ["rocketAnimFill"], fx: ["rk-fx-fill"], fxFigs: false, values: V, src: ["sutton", "rs25dim"] },
  { id: "thrust", figs: ["rocketAnimThrust"], fx: ["rk-fx-thrust"], fxFigs: false, src: ["newton", "sutton"] },
  { id: "air", figs: ["rocketAnimAir"], fx: ["rk-fx-thrust"], fxFigs: false, values: V, src: ["sutton", "rs25", "goddard", "nyt"] },
  { id: "rs25", figs: ["rocketFxRs25"], fx: ["rk-fx-rs25"], fxFigs: false, values: V, src: ["rs25", "rs25dim", "b2"] },
  { id: "joule", figs: ["rocketFxJoule"], fx: ["rk-fx-joule"], fxFigs: false, src: ["joule"] },
  { id: "free", figs: ["rocketAnimFree"], fx: ["rk-fx-tsiol"], fxFigs: false, values: V, src: ["newton", "tsiol"] },
];
