// Cartes autonomes de l'onglet surv (epic11). Textes : src/i18n/<langue>/surv-cards.json.
// tri : ses chiffres suivent le réseau choisi ({{clé}}, triValueLookup dans src/tabs/surv/card-values.js).
import { triValueLookup, excessValueLookup } from "../../tabs/surv/card-values.js";
export const SOURCES = {
  ngs3: "NOAA Manual NOS NGS 3, Geodetic Leveling: the curvature-cancellation rule.",
  ngs: "NOAA National Geodetic Survey, Geodetic Leveling; \"What is geodesy?\".",
  gauss: "MacTutor History of Mathematics — Carl Friedrich Gauss: the Hanover survey.",
  hirt: "C. Hirt et al. (2010), J. Geophys. Res.: the refraction coefficient k ≈ 0.13.",
  nos74: "NOAA Technical Report NOS 74 NGS 9, Survey of the McDonald Observatory Radial Line Scheme (1978).",
  uscgs: "USC&GS Special Publication No. 4, The Transcontinental Triangulation and the American Arc of the Parallel (1900).",
  schott7: "C. A. Schott, USC&GS Special Publication No. 7, The Eastern Oblique Arc of the United States (1902); with No. 4 (1900), our transcription of the triangles.",
  gauss1827: "C. F. Gauss, General Investigations of Curved Surfaces (1827), art. 20: the excess of a triangle equals its area over R² on a sphere.",
  surveys: "Delambre & Méchain, Base du système métrique (1806-10); Maclear, La Caille's Arc at the Cape (1866); Roy, Phil. Trans. 80 (1790); Struve, Arc du méridien (1860): our transcription of their triangles.",
};

export const CARDS = [
  { id: "pair", figs: ["survPairFig"], src: ["ngs"] },
  { id: "drop", figs: ["survfig0"], src: [] },
  { id: "level", figs: ["survLevel"], src: ["ngs3"] },
  { id: "excess", figs: ["survfig1"], src: ["gauss"] },
  { id: "tri", figs: ["survTri"], fx: ["survfig1"], reads: ["survTriSel"], ctl: ["survTriSel"], values: triValueLookup, src: ["gauss"] },
  { id: "angles", figs: ["svFigTri", "svTriGlobe", "svTriFlat"], fx: ["sv-fx-tri"], reads: ["sv-readTri"], values: excessValueLookup, src: ["uscgs", "schott7", "gauss1827", "surveys"] },
  { id: "radius", figs: ["sv-figR"], reads: ["sv-readR"], src: ["nos74", "uscgs", "hirt"] },
];
