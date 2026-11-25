// Onglet "scale" (epic28, 2026-10-17, demande du propriétaire). Logique pure, testée.
//
// L'HORLOGE. Chaque aiguille tourne à la vitesse réelle d'un mouvement de la Terre, mesurée ailleurs. Son angle est une
// droite dans le temps, rien d'autre :
//
//     angle(t) = angle à J2000 + 360° × (t − J2000) / période
//
// t est l'heure de l'ordinateur qui affiche la page (Date.now()). Rien n'est accéléré : l'aiguille de la rotation fait un
// tour en 23 h 56 min 4 s, celle de la galaxie en deux cents millions d'années. Les sources de chaque nombre sont dans
// src/data/sources/scale.js ; les numéros [n] ci-dessous y renvoient.

/** J2000.0 = 1er janvier 2000, 12 h TT = 11 h 58 min 55,816 s UTC, en millisecondes Unix. */
export const J2000_MS = Date.UTC(2000, 0, 1, 11, 58, 55, 816);
const DAY = 86400, CENTURY = 36525 * DAY, YEAR = 365.25 * DAY;

export const ARMS = [
  // La rotation de la Terre par rapport aux étoiles : l'angle de rotation de la Terre de l'IERS,
  // θ = 2π (0,7790572732640 + 1,00273781191135448 × jours depuis J2000) [1]. Un tour : 86 164,0989 s.
  { id: "spin", period: DAY / 1.00273781191135448, a0: 0.779057273264 * 360 },
  // La Terre autour du Soleil : longitude moyenne de la Terre, 100,46457166° + 35 999,37244981° par siècle [2].
  { id: "orbit", period: (CENTURY * 360) / 35999.37244981, a0: 100.46457166 },
  // La précession de l'axe (des équinoxes) : 5 028,796195″ par siècle [3]. Angle 0 : l'équinoxe de J2000.
  { id: "axis", period: (CENTURY * 1296000) / 5028.796195, a0: 0 },
  // La précession de l'orbite : le grand axe (le périhélie) tourne de 0,32327364° par siècle par rapport aux étoiles [2].
  { id: "perihelion", period: (CENTURY * 360) / 0.32327364, a0: 102.93768193 },
  // Le Soleil autour du centre de la Galaxie : Sgr A*, au centre, semble glisser de 6,411 millisecondes d'arc par an
  // le long du plan galactique, reflet de notre propre tour [4]. Angle 0 : J2000 (origine arbitraire).
  { id: "galaxy", period: (YEAR * 1296000e3) / 6.411, a0: 0 },
];

/** Angle d'une aiguille (degrés, 0–360) à l'instant ms (Unix). */
export function armAngle(arm, ms) {
  const turns = (ms - J2000_MS) / 1000 / arm.period;
  return (((arm.a0 + 360 * turns) % 360) + 360) % 360;
}
/** Vitesse angulaire d'une aiguille, en secondes d'arc par seconde. */
export const arcsecPerSecond = (arm) => 1296000 / arm.period;
/** De combien une aiguille a tourné (secondes d'arc) entre deux instants. */
export const turnedArcsec = (arm, ms0, ms1) => ((ms1 - ms0) / 1000) * arcsecPerSecond(arm);

// Vitesses de déplacement correspondantes (v = ω r) : à l'équateur (rayon 6 378,137 km [5]), sur l'orbite (1 UA [6]),
// autour de la Galaxie (R₀ = 8,275 kpc [7], 1 pc = 3,0857 × 10¹³ km).
export const AU_KM = 149597870.7, PC_KM = 3.0857e13, R0_KPC = 8.275, REQ_KM = 6378.137;
export function speeds() {
  const w = (id) => (2 * Math.PI) / ARMS.find((a) => a.id === id).period;
  return { spin: w("spin") * REQ_KM, orbit: w("orbit") * AU_KM, galaxy: w("galaxy") * R0_KPC * 1e3 * PC_KM };
}

// L'ÉCHELLE DES DISTANCES, en km : chaque barreau et sa source. Le temps de lumière est d / c.
export const C_KMS = 299792.458;
export const RUNGS = [
  { id: "earth", km: 6371 },                              // rayon moyen (onglet Résultats)
  { id: "moon", km: 384400 },                             // distance moyenne [8]
  { id: "sun", km: AU_KM },                               // l'unité astronomique [6]
  { id: "neptune", km: 4514.953e6 },                      // demi-grand axe [8]
  { id: "proxima", km: (1 / 0.7680665) * PC_KM },         // parallaxe Gaia DR3 768,0665 mas [9]
  { id: "gc", km: R0_KPC * 1e3 * PC_KM },                 // centre galactique, orbites des étoiles S [7]
  { id: "m31", km: 761e3 * PC_KM },                       // Andromède, céphéides et binaires [10]
];
/** Distance d'une étoile par sa parallaxe p (secondes d'arc) : d = 1 UA / tan p. */
export const parallaxKm = (pArcsec) => AU_KM / Math.tan((pArcsec / 3600) * (Math.PI / 180));
/** Temps de lumière (s). */
export const lightSeconds = (km) => km / C_KMS;
/** Noms anglais des barreaux (les traductions sont sous z-<id> dans src/i18n/<langue>/scale.json). */
export const RUNG_NAMES = { earth: "Earth (radius)", moon: "Moon", sun: "Sun", neptune: "Neptune", proxima: "Proxima Centauri", gc: "Galactic centre", m31: "Andromeda galaxy" };
