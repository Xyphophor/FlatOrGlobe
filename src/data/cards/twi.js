// Cartes autonomes de l'onglet twi (epic11). Textes : src/i18n/<langue>/twi-cards.json.
export const SOURCES = {
  usno: "U.S. Naval Observatory, \"Rise, Set, and Twilight Definitions\".",
  spitschan: "M. Spitschan et al., \"Variation of outdoor illumination as a function of solar elevation and light pollution\", Scientific Reports 6 (2016).",
  hulburt: "E. O. Hulburt, \"Explanation of the brightness and color of the sky, particularly the twilight sky\", JOSA 43, 113 (1953).",
  lynch: "D. K. Lynch & W. C. Livingston, Color and Light in Nature, 2nd ed. (Cambridge University Press, 2001).",
  almanac: "U.S. Naval Observatory, sunrise, sunset and twilight times for an entire year.",
  noaa: "NOAA Global Monitoring Laboratory, Solar Calculator.",
};

export const CARDS = [
  { id: "shell", figs: ["twiGeomCanvas"], src: ["usno", "hulburt"] },
  { id: "ceiling", figs: ["twifig0"], src: [] },
  { id: "lamp", figs: ["twifig1"], src: [] },
  { id: "cancel", figs: ["twifig2"], src: ["spitschan"] },
  { id: "fall", figs: ["twiFallCanvas"], src: ["spitschan"] },
  { id: "world", figs: ["twiWorldCanvas#globe", "twiWorldCanvas@inv#flat", "twiWorldCanvas@fit#flat"], fx: ["twifig3"], layout: "side", labels: true, reads: ["twiWorldWhen"], src: ["almanac", "spitschan"] },
  { id: "meridian", figs: ["twifig3"], src: ["noaa"] },
  { id: "duration", figs: ["twiDurCanvas"], src: ["almanac", "noaa"] },
  { id: "shadow", figs: ["twiArchCanvas"], src: ["lynch"] },
];
