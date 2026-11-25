// Cartes autonomes de l'onglet cases (études de cas, 2026-10-31). Textes : src/i18n/<langue>/cases-cards.json.
import { p2pValues } from "../../tabs/cases/logic.js";

export const SOURCES = {
  p2p: "Dr John D., \"PIER2PIER 2 – Results & Observations\" (YouTube, youtu.be/uJ3TLdcVNfA): the Worthing–Brighton laser test of February 2019; sites, heights, trials, thermometer tables.",
  era5: "ERA5 reanalysis (Copernicus Climate Change Service) via Open-Meteo, sea cell 50.75° N 0.25° W.",
  oisst: "NOAA OISST v2.1 daily sea surface temperature.",
  baselga: "S. Baselga & L. García-Asenjo, \"Practical Formulas for the Refraction Coefficient\", J. Surveying Eng. 140(2) (2014).",
};

const values = (lang) => { const v = p2pValues(lang); return (k) => v[k] ?? k; };

export const CARDS = [
  { id: "anim", figs: ["p2pAnim"], fx: ["p2p-fx1"], src: ["p2p", "era5", "oisst"], values },
  { id: "geom", figs: ["p2pFxGeom"], fx: ["p2p-fx1"], fxFigs: false, src: ["p2p"], values },
  { id: "therm", figs: ["p2pFxTherm"], fx: ["p2p-fx2"], fxFigs: false, src: ["p2p", "baselga"], values },
  { id: "evenings", figs: ["p2pFigEvenings"], src: ["p2p", "era5", "oisst"], values },
];
