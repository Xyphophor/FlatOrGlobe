// Cas documentés de la figure « aplatir la Terre » (src/core/flatten.js,
// epic06/UC04). Un cas par onglet, repris des cas que l'onglet cite déjà :
//  - dip : l'œil au Sommet de Viériou, 1 395 m (DIP_VANTAGE, et l'observation de sim) ;
//  - hh  : Indiana Dunes → Willis Tower, 53 km, toit à 447 m (HH_PRESETS["chicago-dunes"]) ;
//  - sim : Viériou → Castellaras / Cime de Barbin (PRESETS.vieriou, cibles ① et ②).
// Distances en mètres. k = 0,13 pour la lecture réfractée (règle 3).
const R = 6371e3, k = 0.13;
export const FLATTEN_CASES = {
  dip: { mode: "dip", R, k, e: 1395, surface: "sea" },
  hh: { mode: "hide", R, k, e: 2, surface: "sea", targets: [{ name: "Willis Tower", d: 53000, h: 447, w: 68, bands: [100, 200, 300, 400] }] },
  elev: {
    mode: "elev", R, k, e: 1395, surface: "land",
    targets: [{ name: "Castellaras", d: 17730, h: 1400, color: "#1d4ed8" }, { name: "Barbin", d: 59960, h: 1561, color: "#c2410c" }],
  },
};
