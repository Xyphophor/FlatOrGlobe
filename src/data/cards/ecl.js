// Cartes autonomes de l'onglet ecl (epic11). Textes : src/i18n/<langue>/ecl-cards.json.
export const SOURCES = {
  path: "F. Espenak, NASA GSFC, Path of the Total Solar Eclipse of 2027 Aug 02.",
  bessel: "F. Espenak, NASA GSFC, Besselian Elements for the Total Solar Eclipse of 2027 Aug 02.",
  saros: "F. Espenak, NASA GSFC, Eclipses and the Saros; Catalog of Solar Eclipses of Saros 136.",
  meeusel: "J. Meeus, Elements of Solar Eclipses 1951–2200 (Willmann-Bell, 1989).",
  meeus: "J. Meeus, Astronomical Algorithms, 2nd ed. (Willmann-Bell, 1998), chapters 47 and 54.",
  lunar: "F. Espenak, NASA GSFC, Lunar Eclipses: 2021–2030.",
  aristotle: "Aristotle, On the Heavens, book II, chapter 14 (trans. J. L. Stocks).",
  cleomedes: "Cleomedes, The Heavens, book II, trans. A. C. Bowen and R. B. Todd (University of California Press, 2004).",
  selphoto: "The Photographer's Ephemeris, The Selenelion Challenge (2022), with T. Ruen's photograph, Minneapolis, October 2014.",
};

export const CARDS = [
  { id: "bessel", figs: ["eclBessel"], src: ["bessel", "meeusel"] },
  { id: "nodes", figs: ["eclNodes"], fx: ["ecl-fx2"], reads: ["eclNodesReads"], src: ["meeus", "lunar"] },
  { id: "saros", figs: ["eclSaros"], fx: ["ecl-fx3"], reads: ["eclSarosReads"], src: ["saros", "path"] },
  { id: "local", figs: ["eclMap"], src: ["path", "bessel", "meeus"] },
  { id: "flat", figs: ["eclFlat"], fx: ["ecl-fx5"], reads: ["eclFlatReads"], src: ["path", "meeus"] },
  { id: "lunar", figs: ["eclLunar"], src: ["aristotle"] },
  { id: "selen", figs: ["eclSelen"], fx: ["eclFxSel"], reads: ["eclSelenReads"], src: ["cleomedes", "selphoto", "lunar", "meeus"] },
];
