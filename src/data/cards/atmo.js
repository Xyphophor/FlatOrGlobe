import { eruptValueLookup } from "../../tabs/atmo/eruptvalues.js";
// Cartes autonomes de l'onglet atmo (epic29, 2026-10-17). Textes : src/i18n/<langue>/atmo-cards.json.
export const SOURCES = {
  ussa: "NOAA, NASA, USAF, U.S. Standard Atmosphere, 1976 (NOAA-S/T 76-1562): pressure, temperature and density from 0 to 1,000 km.",
  reif: "F. Reif, Fundamentals of Statistical and Thermal Physics (1965), ch. 6–7: barometric distribution, molecular flux n v̄/4.",
  davies: "K. Davies, Ionospheric Radio (IEE, 1990): plasma frequency, secant law, D, E and F layers.",
  itu: "ITU-R P.533, Method for the prediction of the performance of HF circuits: F2 hops of up to about 4,000 km.",
  kopp: "G. Kopp, J. L. Lean, Geophys. Res. Lett. 38 (2011) L01706: total solar irradiance 1,360.8 W/m².",
  crc: "CRC Handbook of Chemistry and Physics, 103rd ed. (2022): aluminium, 2.70 g/cm³, 897 J/(kg·K).",
  codata: "CODATA 2018 (Rev. Mod. Phys. 93, 2021, 025010): Stefan–Boltzmann constant.",
  iers: "IERS Conventions (2010), TN 36: GM of the Earth 3.986004418 × 10¹⁴ m³/s², giving the period at 400 km.",
  // Hunga Tonga et Krakatoa (venus de seis le 2026-10-19)
  iem: "Iowa Environmental Mesonet, ASOS one-minute data: station pressure at 102 US weather stations, 15–18 January 2022.",
  usgs: "USGS, M 5.8 volcanic eruption, Hunga Tonga–Hunga Ha'apai, 15 January 2022, 04:14:45 UTC.",
  strachey: "G. J. Symons (ed.), The Eruption of Krakatoa and Subsequent Phenomena, Royal Society (1888), Part II: R. Strachey, On the air waves, Tables II–IV and VIII.",
  lindzen: "R. S. Lindzen & D. Blake, \"Lamb waves in the presence of realistic distributions of temperature and dissipation\", J. Geophys. Res. 77, 2166–2176 (1972): about 310 m/s.",
};
export const CARDS = [
  { id: "column", figs: ["atmoAnimColumn"], fx: ["atmo-fx-hydro"], src: ["ussa", "reif"] },
  { id: "radio", figs: ["atmoAnimRadio"], fx: ["atmo-fx-plasma"], src: ["davies", "itu"] },
  { id: "heat", figs: ["atmoAnimHeat"], fx: ["atmo-fx-heat"], src: ["ussa", "reif", "kopp"] },
  { id: "rad", figs: ["atmoAnimRad"], fx: ["atmo-fx-ode"], src: ["ussa", "reif", "kopp", "crc", "codata", "iers"] },
  // les éruptions : la figure des données, la formule et son illustration, le rayon trouvé (fxAt : formule entre les deux)
  { id: "tonga", figs: ["tongaVFig", "tongaResFig"], layout: "col", fx: ["tg-m1"], fxAt: 1, src: ["iem", "usgs", "lindzen"], values: eruptValueLookup },
  { id: "krakatoa", figs: ["krakLapFig", "krakResFig"], layout: "col", fx: ["kr-m1"], fxAt: 1, src: ["strachey", "lindzen"], values: eruptValueLookup },
  { id: "krak-lap", figs: ["krakLapFig"], src: ["strachey", "lindzen"] },
  { id: "krak-gap", figs: ["krakGapFig"], src: ["strachey", "lindzen"] },
];
