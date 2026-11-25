// Nombres du texte de l'onglet rx, tous CALCULÉS (jamais écrits en dur dans la prose) :
// index.js les pose dans les <span class="cv" data-v>. Les mêmes fonctions servent aux
// figures des formules (formfigs.js), pour qu'une figure et sa légende disent la même chose.
import { rawData } from "../gps/rawfig.js";
import { num } from "../curv/fmt.js";

export const WGS = { a: 6378137, f: 1 / 298.257223563 };     // WGS84 [6] : publié, jamais ajusté
const E2 = WGS.f * (2 - WGS.f);
export const C = 299792458, OMEGA_E = 7.2921151467e-5, MU = 3.986005e14, A_GPS = 26559.7e3;   // [2] ; a ≈ demi-grand axe GPS nominal

/** Rayons de courbure de l'ellipsoïde à la latitude φ (°) : M nord-sud (méridien), N est-ouest (premier vertical), m. */
export const radiiM = (lat) => WGS.a * (1 - E2) / (1 - E2 * Math.sin(lat * Math.PI / 180) ** 2) ** 1.5;
export const radiiN = (lat) => WGS.a / Math.sqrt(1 - E2 * Math.sin(lat * Math.PI / 180) ** 2);

/** Flèche (bombement) d'une sphère de rayon R sur une corde L, exacte et approchée (m). */
export const sagitta = (R, L) => R - Math.sqrt(R * R - (L / 2) ** 2);

/** Ordres de grandeur des termes de l'équation, tirés des formules et des constantes de [2] (m). */
export function budget(R = 6371e3) {
  return {
    rangeMin: A_GPS - R, rangeMax: Math.sqrt(A_GPS ** 2 - R ** 2),        // satellite au zénith, à l'horizon
    satClock: 1e-3 * C,                                                   // horloge satellite : jusqu'à ~1 ms de décalage diffusé
    sagnac: OMEGA_E * A_GPS * R / C,                                      // rotation pendant le vol : au plus Ω·a·R/c
    rel: 2 * Math.sqrt(MU * A_GPS) * 0.02 / C,                            // −2√(μa)·e·sin E/c², pour e = 0,02, en mètres (× c)
  };
}

export function rxValues() {
  const E = rawData().earth, n = rawData().raw.stations.length, R = 6371e3, B = budget(R);
  return {
    rxM0: `${num(radiiM(0) / 1000, 1)} km`, rxNp: `${num(radiiN(90) / 1000, 1)} km`,
    rxRst: `${num(E.R / 1000, 1)} ± ${num(E.seR / 1000, 1)} km`, rxNst: num(n),
    rxSag: `${num(sagitta(R, 3000e3) / 1000)} km`, rxSag1: `${num(sagitta(R, 1000e3) / 1000)} km`,
    rxRgMin: `${num(B.rangeMin / 1000)} km`, rxRgMax: `${num(B.rangeMax / 1000)} km`,
    rxSagnac: `${num(B.sagnac)} m`, rxRel: `${num(B.rel)} m`, rxClk: `${num(B.satClock / 1000)} km`,
  };
}
