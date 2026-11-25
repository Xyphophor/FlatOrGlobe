// Données de l'onglet avia (epic14) qui ne viennent pas du pipeline de vols
// (celles-là : avia-flights.js, GÉNÉRÉ). Chaque nombre porte sa source.

/** Noms courts des aéroports (affichage) ; les coordonnées sont celles de avia-flights.js. */
export const CITY = {
  AKL: "Auckland", CPT: "Cape Town", DFW: "Dallas", DXB: "Dubai", FRA: "Frankfurt", GRU: "São Paulo",
  HND: "Tokyo", IPC: "Easter Island", JFK: "New York", JNB: "Johannesburg", LAX: "Los Angeles",
  LHR: "London", MEL: "Melbourne", PER: "Perth", SCL: "Santiago", SIN: "Singapore", SYD: "Sydney",
  // escales des tours du monde (WORLD, plus bas)
  TLS: "Toulouse", BKK: "Bangkok", GUM: "Guam", HNL: "Honolulu", ACA: "Acapulco", SFO: "San Francisco",
  KSC: "Kennedy Space Center", NQZ: "Astana", MRU: "Mauritius", PUQ: "Punta Arenas",
  // routes ajoutées le 2026-11-07
  AMS: "Amsterdam", ATL: "Atlanta", AUH: "Abu Dhabi", BNE: "Brisbane", CDG: "Paris", DOH: "Doha", EWR: "Newark",
  EZE: "Buenos Aires", HKG: "Hong Kong", IAH: "Houston", NAN: "Nadi", PPT: "Papeete", YVR: "Vancouver",
};

/** Vitesse de croisière retenue pour les calculs « à niveau » : 250 m/s = 900 km/h (les vitesses propres
 *  déposées dans les plans de vol du jeu de données vont de ~820 à ~930 km/h, voir la table). */
export const CRUISE = { v: 250, h: 10668 };

/** Les deux avions de la figure des forces (epic17) : FL350 (croisière) et FL100 (250 kt = 129 m/s), à niveau sur deux surfaces de pression. */
export const FORCE_PLANES = [
  { k: "A", fl: 350, h: 10668, v: 250 },
  { k: "B", fl: 100, h: 3048, v: 129 },
];

/** Trois aéroports pour les conservateurs de cap (dérive −15,04°·sin φ par heure). */
export const DG_SITES = [
  { k: "tos", n: "Tromsø", lat: 69.68 },
  { k: "sin", n: "Singapore", lat: 1.36 },
  { k: "syd", n: "Sydney", lat: -33.95 },
];

/**
 * EI-GJT, Boeing 737-800, 9 octobre 2018 (AAIB Bulletin 12/2019, source de l'onglet).
 * gs = vitesse sol de la centrale inertielle gauche, RELEVÉE À L'ŒIL sur la figure 3
 * du rapport ([minutes après 20:00 UTC, m/s]) : départ de la dérive à ~20:39.7 depuis
 * la vitesse vraie (~240 m/s), pente 1,6 g, sommet ~14 000 m/s vers 21:00 ; incertitude
 * de lecture de l'ordre de ±2 % sur chaque point. Le rapport donne aussi : attitude
 * invalide vers 20:59 (barre « ATTITUDE INVALID »), assiette affichée « jusqu'à 90° »
 * en ~20 min, cap changé de près de 180°, position de la centrale passée à l'est du pôle
 * nord (figure 4). start = position vraie approximative lue sur la figure 4 (golfe de
 * Gascogne), brg = route vers le nord (Porto -> Édimbourg) ; décor, pas une donnée.
 */
export const GJT = {
  vTrue: 240,
  gs: [[39.72, 240], [48, 8043], [50, 9379], [52, 10586], [54, 12138], [56, 13276], [58, 13862], [60, 14069], [62, 13862]],
  invalid: 59, poleCross: 53,
  start: [43.6, -8.9], brg: 8,
};

/**
 * One More Orbit, 9-11 juillet 2019, Gulfstream G650ER, tour du monde par les deux pôles
 * depuis le Kennedy Space Center (FAI : 46 h 39 min 38 s ; site de la mission : 40 172 km,
 * 861 km/h de moyenne, étapes ci-dessous). Coordonnées des aéroports d'escale (piste du
 * KSC, Astana, Maurice, Punta Arenas) ; "pole" = passage au pôle.
 */
export const OMO = {
  hours: 46 + 39 / 60 + 38 / 3600, km: 40172, avg: 861,
  pts: [
    { k: "KSC", n: "Kennedy Space Center", ll: [28.615, -80.695] },
    { k: "NP", pole: true, ll: [90, 0] },
    { k: "NQZ", n: "Nur-Sultan (Astana)", ll: [51.022, 71.467] },
    { k: "MRU", n: "Mauritius", ll: [-20.430, 57.683] },
    { k: "SP", pole: true, ll: [-90, 0] },
    { k: "PUQ", n: "Punta Arenas", ll: [-53.003, -70.855] },
    { k: "KSC", n: "Kennedy Space Center", ll: [28.615, -80.695] },
  ],
};

/**
 * Tours du monde documentés (2026-10-01, demande du propriétaire : « un passage sur
 * les vols qui font le tour de la Terre, est-ouest et nord-sud »). hours = temps
 * ÉCOULÉ publié, escales comprises (la vitesse moyenne qu'on en tire est donc un
 * minimum de ce que l'avion a tenu en vol) ; vmax = vitesse maximale de l'appareil,
 * sourcée ; km = distance publiée. Coordonnées des aéroports d'escale (pistes) ;
 * "pole" = passage au pôle. L'anneau austral, lui, est MESURÉ : ses temps sont les
 * médianes FlightAware des vols réguliers (avia-flights.js), sommés étape par étape.
 */
export const WORLD = [
  { k: "SOUTH", dir: "ew", ring: ["SYD", "SCL", "GRU", "JNB", "PER", "SYD"] },
  {
    // Air France AF1995, Concorde F-BTSD, 15-16 août 1995 : 31 h 27 min 49 s écoulées,
    // 25 252 milles terrestres (UPI) ; croisière moyenne Mach 2,02, 2 150 km/h (Wikipedia, Concorde).
    k: "AF1995", n: "Concorde AF1995, 1995", dir: "ew", hours: 31 + 27 / 60 + 49 / 3600, km: 40638, vmax: 2150, vmaxKind: "cruise",
    pts: [
      { k: "JFK", ll: [40.6399, -73.7787] }, { k: "TLS", ll: [43.6291, 1.3638] }, { k: "DXB", ll: [25.2550, 55.3643] },
      { k: "BKK", ll: [13.9126, 100.6067] }, { k: "GUM", ll: [13.4834, 144.7960] }, { k: "HNL", ll: [21.3187, -157.9225] },
      { k: "ACA", ll: [16.7571, -99.7540] }, { k: "JFK", ll: [40.6399, -73.7787] },
    ],
  },
  {
    // Pan Am 50, Boeing 747SP « Clipper New Horizons », 28-30 octobre 1977 : 54 h 7 min 12 s,
    // 784,31 km/h de moyenne (FAI, record 3796) -> ~42 450 km ; vitesse maximale Mach 0,92
    // (Wikipedia, Boeing 747SP), ≈ 980 km/h à 11 km (son à 295 m/s).
    k: "PA50", n: "Pan Am 50, 1977", dir: "ns", hours: 54 + 7 / 60 + 12 / 3600, avg: 784.31, vmax: 980, vmaxKind: "max",
    pts: [
      { k: "SFO", ll: [37.6189, -122.3750] }, { k: "NP", pole: true, ll: [90, 0] }, { k: "LHR", ll: [51.4775, -0.4614] },
      { k: "CPT", ll: [-33.9648, 18.6017] }, { k: "SP", pole: true, ll: [-90, 0] }, { k: "AKL", ll: [-37.0081, 174.7917] },
      { k: "SFO", ll: [37.6189, -122.3750] },
    ],
  },
  // One More Orbit (OMO ci-dessus) ; G650ER : Mmo Mach 0,925, 983 km/h (Wikipedia, Gulfstream G650).
  { k: "OMO", n: "One More Orbit, 2019", dir: "ns", omo: true, vmax: 983, vmaxKind: "max" },
];
