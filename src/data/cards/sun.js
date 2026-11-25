// Cartes autonomes de l'onglet sun (epic11). Textes : src/i18n/<langue>/sun-cards.json.
// Plusieurs vues suivent la latitude choisie : `reads` + « <id>.reads » la nomment.
// romerdata (2026-11-25) : le résultat de fog build sun-romer, {{clé}} = romerValues.
import { romerValues } from "../../tabs/sun/romer-data.js";

const V = (lang) => { const v = romerValues(lang); return (k) => String(v[k] ?? k); };
export const SOURCES = {
  romer: "Paris Observatory — Rømer and Cassini's Io programme and the finite speed of light (1676).",
  uva: "University of Virginia, \"The Speed of Light\": Rømer's prediction of 9 November 1676, Fizeau (1849), Foucault.",
  iau: "IAU — the astronomical unit, exactly 149,597,870,700 m since 2012.",
  bss: "British Sundial Society, \"How Sundials Work\".",
  lieske: "J. H. Lieske, Astron. Astrophys. Suppl. 63 (1986) 143: 16,802 timed eclipses of the Galilean satellites, 1652-1983 (IMCCE NSDC raw file).",
  standish: "E. M. Standish, Keplerian Elements for Approximate Positions of the Major Planets (JPL), Table 2a.",
  noaa: "NOAA Solar Calculator — noon altitude, declination and equation of time for any place.",
};

export const CARDS = [
  { id: "anglobe", figs: ["anGlobe"], reads: ["sunLatRead"], src: ["noaa"] },
  { id: "anflat", figs: ["anFlat"], reads: ["sunLatRead"], src: ["noaa"] },
  { id: "analemma", figs: ["anGlobe", "anFlat"], labels: true, reads: ["sunLatRead"], src: ["noaa"] },
  { id: "baseline", figs: ["sunfig0"], src: ["romer"] },
  { id: "romer", figs: ["sunRomer"], fx: ["sunfig0"], src: ["romer", "uva", "iau"] },
  { id: "romerdata", figs: ["sunFigRomerD"], values: V, src: ["lieske", "standish", "uva", "iau"] },
  { id: "bearing", figs: ["sunfig1"], src: [] },
  { id: "path", figs: ["sunPath"], reads: ["sunLatRead"], src: ["noaa"] },
  { id: "speed", figs: ["sunSpeed"], reads: ["sunLatRead"], src: [] },
  { id: "daily", figs: ["sunPath", "sunSpeed"], labels: true, reads: ["sunLatRead"], src: ["noaa"] },
  { id: "gnomon", figs: ["sunfig2"], src: ["bss"] },
  { id: "dials", figs: ["sunDialsFig"], fx: ["sunfig2#2"], reads: ["sunHourRead"], src: ["bss"] },
];
