// Constantes orbitales de la constellation GPS, portées à l'identique du
// legacy (flat-or-globe-2.20.0.html, ~L18052-18065 `gpsSat`/`GPS_A`, et le
// bloc .srcs de tab-gps ~L13659). Le demi-grand axe et l'inclinaison sont
// des valeurs publiées (sources [1][2][3] ci-dessous, voir
// src/data/sources/gps.js) ; GM et c sont les constantes physiques
// standard. Rien de tout cela n'est un réglage utilisateur -- tasks/epic02/
// UC08.org : "boîte de Kepler calculée, pas codée en dur" s'applique à
// toute la géométrie de cet onglet.
export const EARTH_R_KM = 6371; // rayon terrestre moyen, cohérent avec dist/logic.js R3D_KM

export const GPS_A_KM = 26560; // demi-grand axe de l'orbite, ESA Navipedia [3]
export const GPS_INCLINATION_DEG = 55; // inclinaison orbitale, USCG NAVCEN [2]
export const GPS_PLANE_COUNT = 6; // six plans orbitaux également espacés, GPS.gov [1]
export const GPS_SLOTS_PER_PLANE = 4; // 24 satellites de référence = 6 plans x 4 créneaux, GPS.gov [1]

export const GPS_EL_MASK_DEG = 5; // seuil de visibilité du legacy (drawGpsSky: el > 5°)
export const GPS_TRI_EL_MASK_DEG = 15; // seuil plus strict pour choisir 3 satellites bien répartis (drawGpsTri)

export const GM_EARTH_KM3_S2 = 398600.4418; // paramètre gravitationnel standard de la Terre (WGS-84)
export const C_KM_S = 299792.458; // vitesse de la lumière, km/s
