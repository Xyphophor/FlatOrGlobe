// Cartes autonomes de l'onglet cnav (epic11). Structure seulement : les
// textes (titre, mini, texte, verdict, étiquettes) sont dans
// src/i18n/<langue>/cnav-cards.json, clés « <id>.<champ> ». Les [n] d'un
// texte renvoient à `src` de la carte, dans l'ordre. Les sources sont des
// références bibliographiques, sans traduction.
export const SOURCES = {
  bowditch: "N. Bowditch, The American Practical Navigator, Pub. No. 9, Vol. 2 (NGA, 2019).",
  sumner: "T. H. Sumner, A New and Accurate Method of Finding a Ship's Position at Sea (Boston, 1843).",
  pub249: "Sight Reduction Tables for Air Navigation, Pub. 249 / AP 3270 (U.S. Naval Observatory and UK Hydrographic Office).",
  usno: "U.S. Naval Observatory, Celestial Navigation Data for Assumed Position and Time (online service).",
};

export const CARDS = [
  { id: "rate", figs: ["cnavPairFig"], src: ["bowditch"] },
  { id: "walk", figs: ["cnavfig0"], src: ["bowditch"] },
  { id: "fix-globe", figs: ["g3d"], fx: ["cnavfig0"], src: ["bowditch", "sumner"] },
  { id: "fix-flat", figs: ["f3d"], fx: ["cnavfig0"], src: [] },
  { id: "fix", figs: ["g3d", "f3d"], fx: ["cnavfig0"], labels: true, src: ["bowditch", "pub249", "usno"] },
];
