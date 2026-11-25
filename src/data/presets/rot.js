// Onglet rot (epic19). Données publiées, recopiées telles quelles.
//
// RINGS : lasers en anneau horizontaux. Dimensions, aires, périmètres : Stedman, Hurst &
// Schreiber 2007 (arXiv:0707.1377), tableau 1 ; fréquences Sagnac : même article,
// tableau 2 (kHz, valeurs observées), sauf G : 348,643 Hz (Schreiber et al. 2004,
// arXiv:physics/0406156) et C-II : 79,4 Hz (Stedman et al., article de photonics.com et
// tableau 2). Latitudes des laboratoires : 43,57694° S (Cashmere) et 49,14441° N (Wettzell),
// même article. λ = 632,8 nm (hélium-néon).
export const LAMBDA_M = 632.8e-9;
export const RINGS = [
  { id: "C-II", site: "Cashmere, Christchurch", lat: -43.57694, a: 1, b: 1, f: 79.4 },
  { id: "UG1", site: "Cashmere, Christchurch", lat: -43.57694, a: 21.0, b: 17.5, f: 1513 },
  { id: "UG2", site: "Cashmere, Christchurch", lat: -43.57694, a: 21.0, b: 39.7, f: 2177 },
  { id: "G", site: "Wettzell, Bavaria", lat: 49.14441, a: 4, b: 4, f: 348.643 },
];
// FALLS : chutes vers l'est, Roehner 2011 (arXiv:1112.5408), tableau B1 (hauteur, déviation
// mesurée, erreur probable, nombre de lâchers). Latitude : celle du lieu (Roehner donne 48,20°
// pour Freiberg, qui est à 50,92° N -- Wikipedia, « Ferdinand Reich » ; on prend 50,92).
export const FALLS = [
  { who: "Guglielmini", year: 1791, place: "Bologna", lat: 44.50, h: 78, d: 18.9, e: null, n: null },
  { who: "Benzenberg", year: 1802, place: "Hamburg", lat: 53.57, h: 76, d: 9.0, e: null, n: 32 },
  { who: "Reich", year: 1831, place: "Freiberg", lat: 50.92, h: 158.5, d: 28.4, e: 0.4, n: 106 },
  { who: "Hall", year: 1903, place: "Cambridge, Mass.", lat: 42.31, h: 23, d: 1.49, e: 0.05, n: 946 },
  { who: "Bähr et al.", year: 2005, place: "Bremen drop tower", lat: 53.06, h: 145, d: 26.4, e: 1.4, n: 120 },
];
