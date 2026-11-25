// Cartes autonomes de l'onglet azim (epic11). Textes : src/i18n/<langue>/azim-cards.json.
export const SOURCES = {
  usno: "U.S. Naval Observatory, Altitude and Azimuth of the Sun or Moon During One Day (online service).",
  gsn: "EarthScope / NSF SAGE — Global Seismographic Network station coordinates.",
  snyder: "J. P. Snyder, Map Projections — A Working Manual, USGS Professional Paper 1395 (1987).",
  noaa: "NOAA Global Monitoring Laboratory, Solar Calculator.",
  meeus: "J. Meeus, Astronomical Algorithms, 2nd ed. (Willmann-Bell, 1998).",
  almagest: "G. J. Toomer (trans.), Ptolemy's Almagest (Duckworth, 1984), Book V.",
  lalande: "MacTutor History of Mathematics — Jérôme Lalande: the 1751 Berlin–Cape of Good Hope campaign.",
};

export const CARDS = [
  { id: "measure", figs: ["azfig0"], src: [] },
  { id: "subpoint", figs: ["azfig1"], src: [] },
  { id: "bearing", figs: ["azfig2"], src: ["usno"] },
  { id: "aedisc", figs: ["azfig3"], src: ["snyder"] },
  { id: "globe", figs: ["azimGlobe"], fx: ["azfig1", "azfig2"], reads: ["azimReads"], src: ["gsn", "usno", "noaa"] },
  { id: "flat", figs: ["azimFlat"], fx: ["azfig1", "azfig3"], reads: ["azimReads"], src: ["snyder", "usno"] },
  { id: "both", figs: ["azimGlobe", "azimFlat"], fx: ["azfig2", "azfig3"], labels: true, reads: ["azimReads"], src: ["gsn", "usno", "snyder"] },
  { id: "parallax", figs: ["azfig4"], src: ["meeus", "almagest"] },
  { id: "baseline", figs: ["azfig5"], src: ["lalande"] },
];
