// Données du legacy (flat-or-globe-2.20.0.html, IIFE STAR, ~L26914-27053),
// portées à l'identique. Ne pas "arrondir" ou "simplifier" ces tableaux --
// voir tasks/epic02/UC02.org et le commentaire d'origine ci-dessous.

/* 49 étoiles, Yale Bright Star Catalogue 5e éd., J2000, telles que publiées.
   Mouvement propre NON appliqué : 26 ans en donnent au plus ~30", sous tout ce
   que cet onglet affirme. Précession, elle, atteint 0,36° et EST appliquée
   (voir star-ephemeris.js:precess). */
export const STARS = [
  { hr: 424, n: "Polaris", b: "α UMi", ra: 37.9529, de: 89.2642, v: 2.02 },
  { hr: 5563, n: "Kochab", b: "β UMi", ra: 222.6763, de: 74.1556, v: 2.08 },
  { hr: 168, n: "Schedar", b: "α Cas", ra: 10.1271, de: 56.5372, v: 2.23 },
  { hr: 21, n: "Caph", b: "β Cas", ra: 2.2946, de: 59.1497, v: 2.27 },
  { hr: 264, n: "Gamma Cassiopeiae", b: "γ Cas", ra: 14.1771, de: 60.7167, v: 2.47 },
  { hr: 403, n: "Ruchbah", b: "δ Cas", ra: 21.4542, de: 60.2353, v: 2.68 },
  { hr: 542, n: "ε Cas", b: "ε Cas", ra: 28.5987, de: 63.6700, v: 3.38 },
  { hr: 3982, n: "Regulus", b: "α Leo", ra: 152.0929, de: 11.9672, v: 1.35 },
  { hr: 2891, n: "Castor", b: "α Gem", ra: 113.6500, de: 31.8883, v: 1.98 },
  { hr: 2990, n: "Pollux", b: "β Gem", ra: 116.3287, de: 28.0261, v: 1.14 },
  { hr: 8781, n: "Markab", b: "α Peg", ra: 346.1904, de: 15.2053, v: 2.49 },
  { hr: 5735, n: "γ UMi", b: "γ UMi", ra: 230.1821, de: 71.8339, v: 3.05 },
  { hr: 6789, n: "δ UMi", b: "δ UMi", ra: 263.0538, de: 86.5864, v: 4.36 },
  { hr: 6322, n: "ε UMi", b: "ε UMi", ra: 251.4921, de: 82.0372, v: 4.23 },
  { hr: 5903, n: "ζ UMi", b: "ζ UMi", ra: 236.0146, de: 77.7944, v: 4.32 },
  { hr: 6116, n: "η UMi", b: "η UMi", ra: 244.3762, de: 75.7553, v: 4.95 },
  { hr: 4301, n: "Dubhe", b: "α UMa", ra: 165.9321, de: 61.7508, v: 1.79 },
  { hr: 4295, n: "Merak", b: "β UMa", ra: 165.4604, de: 56.3825, v: 2.37 },
  { hr: 4554, n: "Phecda", b: "γ UMa", ra: 178.4575, de: 53.6947, v: 2.44 },
  { hr: 4660, n: "Megrez", b: "δ UMa", ra: 183.8567, de: 57.0325, v: 3.31 },
  { hr: 4905, n: "Alioth", b: "ε UMa", ra: 193.5071, de: 55.9597, v: 1.77 },
  { hr: 5054, n: "Mizar", b: "ζ UMa", ra: 200.9812, de: 54.9253, v: 2.27 },
  { hr: 5191, n: "Alkaid", b: "η UMa", ra: 206.8850, de: 49.3133, v: 1.86 },
  { hr: 2061, n: "Betelgeuse", b: "α Ori", ra: 88.7929, de: 7.4069, v: 0.50 },
  { hr: 1713, n: "Rigel", b: "β Ori", ra: 78.6346, de: -8.2017, v: 0.12 },
  { hr: 1790, n: "Bellatrix", b: "γ Ori", ra: 81.2829, de: 6.3497, v: 1.64 },
  { hr: 1852, n: "Mintaka", b: "δ Ori", ra: 83.0017, de: -0.2992, v: 2.23 },
  { hr: 1903, n: "Alnilam", b: "ε Ori", ra: 84.0533, de: -1.2019, v: 1.70 },
  { hr: 1948, n: "Alnitak", b: "ζ Ori", ra: 85.1896, de: -1.9428, v: 2.05 },
  { hr: 2004, n: "Saiph", b: "κ Ori", ra: 86.9392, de: -9.6697, v: 2.06 },
  { hr: 4730, n: "Acrux", b: "α¹ Cru", ra: 186.6496, de: -63.0992, v: 1.33 },
  { hr: 4853, n: "Mimosa", b: "β Cru", ra: 191.9300, de: -59.6886, v: 1.25 },
  { hr: 4763, n: "Gacrux", b: "γ Cru", ra: 187.7913, de: -57.1133, v: 1.63 },
  { hr: 4656, n: "δ Cru", b: "δ Cru", ra: 183.7862, de: -58.7489, v: 2.80 },
  { hr: 7228, n: "Sigma Octantis", b: "σ Oct", ra: 317.1925, de: -88.9564, v: 5.47 },
  { hr: 5459, n: "Rigil Kentaurus", b: "α¹ Cen", ra: 219.8996, de: -60.8353, v: -0.01 },
  { hr: 5267, n: "Hadar", b: "β Cen", ra: 210.9558, de: -60.3731, v: 0.61 },
  { hr: 2491, n: "Sirius", b: "α CMa", ra: 101.2871, de: -16.7161, v: -1.46 },
  { hr: 2326, n: "Canopus", b: "α Car", ra: 95.9879, de: -52.6958, v: -0.72 },
  { hr: 7001, n: "Vega", b: "α Lyr", ra: 279.2346, de: 38.7836, v: 0.03 },
  { hr: 5340, n: "Arcturus", b: "α Boo", ra: 213.9154, de: 19.1825, v: -0.04 },
  { hr: 1708, n: "Capella", b: "α Aur", ra: 79.1725, de: 45.9981, v: 0.08 },
  { hr: 7557, n: "Altair", b: "α Aql", ra: 297.6958, de: 8.8683, v: 0.77 },
  { hr: 7924, n: "Deneb", b: "α Cyg", ra: 310.3579, de: 45.2803, v: 1.25 },
  { hr: 472, n: "Achernar", b: "α Eri", ra: 24.4288, de: -57.2367, v: 0.46 },
  { hr: 8728, n: "Fomalhaut", b: "α PsA", ra: 344.4129, de: -29.6222, v: 1.16 },
  { hr: 5056, n: "Spica", b: "α Vir", ra: 201.2983, de: -11.1614, v: 0.98 },
  { hr: 6134, n: "Antares", b: "α Sco", ra: 247.3517, de: -26.4319, v: 0.96 },
  { hr: 1457, n: "Aldebaran", b: "α Tau", ra: 68.9800, de: 16.5092, v: 0.85 },
];

/* Douze villes, réparties sur toute la plage de latitudes, des deux côtés.
   Coordonnées : Natural Earth 1:10m "populated places", domaine public -- le
   même jeu de données que les traits de côte de l'onglet obs. */
export const STAR_SPOTS = [
  { n: "Longyearbyen, Svalbard", lat: 78.2167, lon: 15.5500 },
  { n: "Tromsø, Norway", lat: 69.6351, lon: 18.9920 },
  { n: "Paris, France", lat: 48.8686, lon: 2.3314 },
  { n: "New York, USA", lat: 40.7519, lon: -73.9820 },
  { n: "Cairo, Egypt", lat: 30.0519, lon: 31.2480 },
  { n: "Mexico City, Mexico", lat: 19.4444, lon: -99.1329 },
  { n: "Quito, Ecuador", lat: -0.2130, lon: -78.5020 },
  { n: "Lima, Peru", lat: -12.0461, lon: -77.0520 },
  { n: "Rio de Janeiro, Brazil", lat: -22.9231, lon: -43.2270 },
  { n: "Santiago, Chile", lat: -33.4481, lon: -70.6690 },
  { n: "Melbourne, Australia", lat: -37.8181, lon: 144.9731 },
  { n: "Ushuaia, Argentina", lat: -54.7900, lon: -68.3100 },
];

/* Quatre dates. L'heure retenue est le MINUIT MOYEN LOCAL du lieu, pas une
   heure UTC fixe. */
export const STAR_DATES = [
  { n: "March equinox", Y: 2026, M: 3, D: 20 },
  { n: "June solstice", Y: 2026, M: 6, D: 21 },
  { n: "September equinox", Y: 2026, M: 9, D: 23 },
  { n: "December solstice", Y: 2026, M: 12, D: 21 },
];

/* Balayé, jamais ajusté -- même règle que AZIM_LAMPS dans le legacy.
   5004 km n'est PAS un choix : c'est la valeur qui pose le point fixe à
   45,00° pour un observateur à 45° N, donc la plus favorable au modèle plat. */
export const STAR_DOMES = [5004, 10000, 25000, 100000];

/* Les constellations dont on parle dans la section "permanentes ou
   saisonnières". Chacune est repérée par ses étoiles PRÉSENTES dans STARS
   (numéro HR), pas par un centroïde de frontières IAU. */
export const STAR_CONS = [
  { n: "Ursa Minor", hr: [424, 5563, 5735, 6789, 6322, 5903, 6116] },
  { n: "Cassiopeia", hr: [168, 21, 264, 403, 542] },
  { n: "Ursa Major", hr: [4301, 4295, 4554, 4660, 4905, 5054, 5191] },
  { n: "Auriga", hr: [1708] },
  { n: "Cygnus", hr: [7924] },
  { n: "Lyra", hr: [7001] },
  { n: "Gemini", hr: [2891, 2990] },
  { n: "Boötes", hr: [5340] },
  { n: "Leo", hr: [3982] },
  { n: "Taurus", hr: [1457] },
  { n: "Pegasus", hr: [8781] },
  { n: "Aquila", hr: [7557] },
  { n: "Orion", hr: [2061, 1713, 1790, 2004, 1948, 1903, 2004] },
  { n: "Virgo", hr: [5056] },
  { n: "Canis Major", hr: [2491] },
  { n: "Scorpius", hr: [6134] },
  { n: "Piscis Austrinus", hr: [8728] },
  { n: "Carina", hr: [2326] },
  { n: "Eridanus", hr: [472] },
  { n: "Centaurus", hr: [5459, 5267] },
  { n: "Southern Cross", hr: [4730, 4853, 4763, 4656] },
  { n: "Octans", hr: [7228] },
];

/* Les deux astérismes que le lecteur doit reconnaître, chacun autour du pôle
   de son hémisphère. `null` = lever le crayon. */
export const ASTER = {
  "Ursa Minor": [424, 6789, 6322, 5903, 6116, 5735, 5563, 5903],
  "Southern Cross": [4730, 4763, null, 4853, 4656],
};

/* Trois visées, PAS des réglages des modèles comparés : seule la direction
   de l'appareil change. */
export const STAR_VIEWS = [
  { k: "fix", n: "the fixed point" },
  { k: "N", n: "north", alt: 28, az: 0 },
  { k: "E", n: "east", alt: 28, az: 90 },
  { k: "S", n: "south", alt: 28, az: 180 },
  { k: "W", n: "west", alt: 28, az: 270 },
];

export const EXPO_H = 4; // durée de pose des figures, heures
export const FOV = 52; // demi-champ gnomonique, degrés
