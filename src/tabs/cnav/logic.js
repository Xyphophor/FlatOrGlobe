// Logique pure de l'onglet cnav (navigation céleste), portée à l'identique
// du legacy (flat-or-globe-2.20.0.html, renderCnav() ~L14966, le bloc 3D
// ~L15001-15230, updateExp2() ~L15867). Séparée de index.js pour rester
// testable sous node:test sans DOM/canvas (voir tasks/epic02/UC02.org).

const NM = 1852; // mètres par mille nautique
const RAD2DEG = 180 / Math.PI;
export const TO_ARCMIN_PER_NM = RAD2DEG * 60 * NM; // rad/m -> arcmin/nm

export const CNAV_DISTS_KM = [0, 1000, 2500, 5000, 7500, 10000];

/**
 * Rangée du tableau "is k constant ?" pour une distance d (m), une hauteur
 * de dôme plat H (m) et un rayon globe R (m) -- legacy renderCnav().
 * kGlobe = 1/R est CONSTANT (indépendant de d) : c'est tout l'argument.
 * kFlat varie avec d, ce qui est le point à démontrer.
 */
export function cnavRate(H, R, d) {
  const kGlobe = (1 / R) * TO_ARCMIN_PER_NM;
  const altG = 90 - (d / R) * RAD2DEG;
  const altF = d === 0 ? 90 : Math.atan2(H, d) * RAD2DEG;
  const kFlat = (H / (H * H + d * d)) * TO_ARCMIN_PER_NM;
  return { altG, altF, kGlobe, kFlat };
}

/** Rayon R = 1/k impliqué par le taux mesuré, en milles nautiques et en km. */
export function impliedRadius(R) {
  return { Rnm: R / NM, Rkm: R / 1000 };
}

/**
 * Expérience 2 : conduire vers le nord et regarder Polaris monter -- legacy
 * updateExp2(), ~L15867. d en km, lat en degrés N, H = hauteur du dôme plat
 * (km). Le globe prédit une montée indépendante de la latitude ; le plat
 * varie avec elle (c'est le test).
 */
export function exp2(d, lat, H) {
  const R = 6371; // km
  const rad = Math.PI / 180;
  const globe = (d / R) * RAD2DEG;
  const r1 = R * (90 - lat) * rad, r2 = Math.max(1, r1 - d);
  const flat = (Math.atan2(H, r2) - Math.atan2(H, r1)) * RAD2DEG;
  return { globe, flat, diff: Math.abs(globe - flat) };
}

/** Prédiction du modèle plat pour exp2, à une autre latitude de départ (vérifie la dérive). */
export function exp2At(lat, d, H) {
  const R = 6371;
  const rad = Math.PI / 180;
  const a = R * (90 - lat) * rad;
  const b = Math.max(1, a - d);
  return (Math.atan2(H, b) - Math.atan2(H, a)) * RAD2DEG;
}

/**
 * Réfraction astronomique (formule de Bennett, 1982), en arcminutes, à
 * partir de l'altitude APPARENTE -- legacy refrArcmin() du bloc 3D cnav,
 * ~L15015. À ne pas confondre avec la formule de Saemundsson (obs-core),
 * qui prend l'altitude VRAIE ; voir le commentaire du legacy à ce sujet.
 */
export function refrArcminBennett(altDeg) {
  return 1 / Math.tan(((altDeg + 7.31 / (altDeg + 4.4)) * Math.PI) / 180);
}

export const R3D_KM = 6371;

// Quatre visées synthétiques pour la démo 3D -- legacy STARS3D, ~L15003.
export const STARS3D = [
  { delta: 0.35, beta: 0.45, color: "#b45309", key: "①" },
  { delta: 0.55, beta: 2.10, color: "#0f766e", key: "②" },
  { delta: 0.75, beta: 3.75, color: "#1d4ed8", key: "③" },
  { delta: 0.95, beta: 5.30, color: "#6d28d9", key: "④" },
];

/**
 * Hauteur du dôme du modèle plat, calibrée pour que la visée ① soit exacte :
 * atan(r1/H) = δ1 → H = r1/tan(δ1) -- legacy HCAL, ~L15011. On donne au
 * modèle plat le meilleur avantage possible : une seule visée est
 * satisfaite EXACTEMENT, par construction.
 */
export const HCAL = STARS3D[0].delta / Math.tan(STARS3D[0].delta);

/**
 * Résultat d'une visée pour le tableau des quatre sights -- legacy
 * fill3DTable(), ~L15210. `miss` est l'écart (km) entre le cercle de
 * position du modèle plat et l'observateur réel -- 0 seulement pour la
 * visée calibrée ①.
 */
export function starFix(s, hcal = HCAL) {
  const altDeg = 90 - s.delta * RAD2DEG;
  const d = s.delta * R3D_KM;
  const rho = Math.atan2(s.delta, hcal) * R3D_KM;
  const miss = d - rho;
  return { key: s.key, color: s.color, altDeg, d, rho, miss };
}
