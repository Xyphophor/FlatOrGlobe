// Onglet "aether" (2026-10-25, demande du propriétaire) : l'histoire de l'éther, de Huygens à la relativité restreinte,
// et les arguments récurrents des vidéos platistes et géocentristes (« Airy's failure », Michelson-Morley, Lorentz,
// Sagnac, Michelson-Gale, Miller, Einstein-Infeld). Rien n'y est mesuré par nous : les nombres de la page sont ceux des
// expériences publiées (sources de l'onglet), recalculés ici une fois pour que la prose, les figures et les tests disent
// la même chose.

export const C_LIGHT = 299792458;              // m/s, exacte (SI 2019)
export const MU0 = 1.25663706212e-6;           // N/A², CODATA 2018 (μ0 n'est plus exacte depuis 2019)
export const EPS0 = 8.8541878128e-12;          // F/m, CODATA 2018
export const V_ORBIT = 29.78e3;                // m/s, vitesse orbitale moyenne de la Terre
export const OMEGA_EARTH = 7.292115e-5;        // rad/s, IERS 2010
export const GM_EARTH = 3.986004418e14;        // m³/s², IERS 2010
export const R_EARTH = 6371e3;                 // m, rayon moyen
export const N_WATER = 1.333;
export const FT = 0.3048;
export const DEG = Math.PI / 180;
const RAD_TO_ARCSEC = 180 / Math.PI * 3600;

/** La vitesse des ondes de Maxwell (1865) à partir de deux constantes de laboratoire. */
export const maxwellC = (mu0 = MU0, eps0 = EPS0) => 1 / Math.sqrt(mu0 * eps0);

/** Aberration (Bradley 1729) : tan α = v/c ; renvoie α en secondes d'arc. */
export const aberrationArcsec = (v = V_ORBIT) => Math.atan(v / C_LIGHT) * RAD_TO_ARCSEC;

/** Coefficient d'entraînement de Fresnel (1818) : f = 1 − 1/n². */
export const fresnelF = (n = N_WATER) => 1 - 1 / (n * n);

/** Composition relativiste des vitesses (Einstein 1905) : u = (u′ + v)/(1 + u′v/c²). */
export const addVel = (u1, v, c = C_LIGHT) => (u1 + v) / (1 + (u1 * v) / (c * c));

/** Lumière dans l'eau qui coule à v : relativiste exacte, Fresnel (ordre 1) et Galilée (entraînement total). */
export function lightInWater(v, n = N_WATER) {
  const u0 = C_LIGHT / n;
  return { exact: addVel(u0, v), fresnel: u0 + v * fresnelF(n), full: u0 + v, none: u0 };
}

/**
 * Lunette pleine d'eau (Boscovich 1766, Airy 1871). L'étoile est vue hors de la lunette sous l'angle α = v/c.
 * Deux angles dans le tube : (1) celui du rayon réfracté par l'objectif plan, α/n (Snell, petits angles) ;
 * (2) celui dont il faut incliner le tube pour que la lumière, entraînée à f·v, reste sur l'axe pendant que le tube
 * avance à v : (v − f v)/(c/n) = v/(n c). Sans entraînement (f = 0) il faudrait n v / c : un écart de (n − 1/n) α
 * entre le rayon et l'axe, que la lunette aurait vu.
 */
export function airy(v = V_ORBIT, n = N_WATER) {
  const a = v / C_LIGHT;
  const refracted = a / n, needed = (v - fresnelF(n) * v) / (C_LIGHT / n), noDrag = v / (C_LIGHT / n);
  return { a, refracted, needed, noDrag, aArcsec: a * RAD_TO_ARCSEC, gapArcsec: (noDrag - refracted) * RAD_TO_ARCSEC };
}

/** Temps d'aller-retour dans les deux bras de Michelson (éther immobile, Terre à v). */
export function mmTimes(L, v, c = C_LIGHT) {
  const b2 = (v / c) ** 2;
  const par = (2 * L / c) / (1 - b2), perp = (2 * L / c) / Math.sqrt(1 - b2);
  return { par, perp, dt: par - perp, approx: (L / c) * b2 };
}

/** Déplacement de franges attendu en tournant l'appareil de 90° : ΔN = 2 (L/λ) β². */
export const mmFringe = (LoverLambda, v = V_ORBIT) => 2 * LoverLambda * (v / C_LIGHT) ** 2;
export const MM1887 = { LoverLambda: 2e7, L: 11, observedMax: 0.01, expected: 0.4 };   // Michelson & Morley 1887 : D = 2 × 10⁷ λ

/** Facteur de Lorentz. */
export const gamma = (v, c = C_LIGHT) => 1 / Math.sqrt(1 - (v / c) ** 2);

/** Raccourcissement d'une longueur D le long du mouvement : D (1 − 1/γ) ≈ D β²/2. */
export const contraction = (D, v) => D * (v / C_LIGHT) ** 2 / 2;

/** GPS (Ashby 2003) : dérive des horloges en orbite, en µs/jour ; vitesse (−), pesanteur (+). */
export function gpsDrift(a = 26561.75e3) {
  const v = Math.sqrt(GM_EARTH / a);
  const vel = -(v * v) / (2 * C_LIGHT ** 2) * 86400e6;
  const grav = GM_EARTH * (1 / R_EARTH - 1 / a) / C_LIGHT ** 2 * 86400e6;
  return { v, vel, grav, net: vel + grav };
}

/** Sagnac (1913) : Δt = 4 A Ω / c² ; en franges : ΔN = 4 A Ω / (λ c). Ω est la composante sur la normale à la boucle. */
export const sagnacDt = (A, Omega) => 4 * A * Omega / C_LIGHT ** 2;
export const sagnacFringe = (A, Omega, lambda) => 4 * A * Omega / (lambda * C_LIGHT);

/** Michelson, Gale & Pearson (1925), Clearing (Illinois) : rectangle de 2010 × 1113 pieds, 41° 46′ N, λ = 570 nm. */
export const MGP = { w: 2010 * FT, h: 1113 * FT, lat: 41 + 46 / 60, lambda: 570e-9, observed: 0.230, sigma: 0.005, published: 0.236 };
export function mgpFringe(m = MGP) {
  const A = m.w * m.h;
  return { A, fringe: sagnacFringe(A, OMEGA_EARTH * Math.sin(m.lat * DEG), m.lambda) };
}

/** Muons du CERN (Bailey et al. 1977) : γ = 29,33, vie propre 2,1948 µs → vie prévue au labo. */
export const MUONS = { gamma: 29.33, tau0: 2.1948, measured: 64.368 };

/**
 * Limites sur l'anisotropie de la lumière, en fraction du temps d'aller-retour : (franges observées au plus) / (2 L/λ)
 * pour les interféromètres, Δν/ν pour les cavités. Une Terre traversant l'éther à 30 km/s donnerait β² ≈ 10⁻⁸.
 */
export const BOUNDS = [
  { year: 1881, who: "Michelson", v: 0.02 / 2e6, src: 9 },
  { year: 1887, who: "Michelson & Morley", v: 0.01 / 4e7, src: 10 },
  { year: 1930, who: "Joos", v: 0.002 / 7.5e7, src: 20 },
  { year: 2009, who: "Herrmann et al.", v: 1e-17, src: 21 },
  { year: 2015, who: "Nagel et al.", v: 2e-18, src: 22 },
];

export function aetherValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const ai = airy(), mt = mmTimes(MM1887.L, V_ORBIT), g = gpsDrift(), mg = mgpFringe();
  const w = lightInWater(7.06);
  return {
    cMax: nf(maxwellC() / 1000), aberr: nf(aberrationArcsec(), 1), fF: nf(fresnelF(), 3),
    airyA: nf(ai.aArcsec, 1), airyGap: nf(ai.gapArcsec, 1), airyIn: nf(ai.refracted * RAD_TO_ARCSEC, 1), airyN: nf(N_WATER, 3),
    fizDrag: nf(w.fresnel - w.none, 2), fizFull: nf(w.full - w.none, 2),
    mmBeta2: nf(((V_ORBIT / C_LIGHT) ** 2) * 1e8, 2), mmDt: nf(mt.dt * 1e15, 2), mmN: nf(mmFringe(MM1887.LoverLambda), 2),
    gam30: nf((gamma(V_ORBIT) - 1) * 1e9, 1), earthCm: nf(contraction(2 * R_EARTH, V_ORBIT) * 100, 1),
    gpsV: nf(g.v / 1000, 2), gpsVel: nf(-g.vel, 1), gpsGrav: nf(g.grav, 1), gpsNet: nf(g.net, 1),
    muPred: nf(MUONS.gamma * MUONS.tau0, 1), muMeas: nf(MUONS.measured, 1),
    mgpA: nf(mg.A / 1e4, 1), mgpN: nf(mg.fringe, 3),
  };
}
