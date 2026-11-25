// Cartes autonomes de l'onglet curv (epic11 ; UC05 du 2026-09-30). Textes :
// src/i18n/<langue>/curv-cards.json ; leurs chiffres ({{clé}}) sont ceux du
// texte de la page, calculés (values.js cardValueLookup).
import { cardValueLookup } from "../../tabs/curv/values.js";

export const SOURCES = {
  torso: "Mathias Kp, \"Turning Torso (190m tall) — seen from 25km – 50km\" (YouTube, 2016): footage of 26 February 2016, observer heights and distances.",
  torsoM: "Mathias Kp, \"Amount obscured of Turning Torso\" and \"Turning_Torso_observations\" (Flickr): hidden segments per shot, converted to metres.",
  lynch: "D. K. Lynch, \"Visually discerning the curvature of the Earth\", Applied Optics 47(34), H39–H43 (2008): photograph from 35,000 ft, 62.7° frame, horizon on the optical axis, measured sagitta 0.51°.",
  bowditch: "Bowditch, The American Practical Navigator, Vol. 2 (NGA, 2019): dip of the sea horizon, 1.76′·√h refracted, 1.93′·√h geometric (h in metres).",
  young: "A. T. Young, \"Dip of the Horizon\" (San Diego State University): exact dip cos δ = R/(R + h); R/(1 − k) for standard refraction.",
  hirt: "C. Hirt et al., J. Geophys. Res. 115, D21102 (2010): refraction coefficient k near the ground, about 0.13 on average, variable with the weather.",
  kannala: "J. Kannala, S. S. Brandt, IEEE Trans. PAMI 28(8), 1335–1340 (2006): lens projection laws; only r = f·tan θ keeps straight lines straight.",
};

export const CARDS = [
  // le simulateur (2026-10-02) : l'état choisi sur la page, nommé par ses lectures (curvSimReads)
  { id: "sim", values: cardValueLookup, figs: ["curvSim"], reads: ["curvSimReads"], src: ["lynch", "bowditch", "young", "hirt", "kannala"] },
  // l'ensemble (2026-10-02) : la vue caméra, le profil à la même hauteur, les deux schémas de formules
  { id: "simset", values: cardValueLookup, figs: ["curvSim", "curvSide", "curvFxSag", "curvFxHidden"], rows: [2, 2], labels: true,
    reads: ["curvSimReads"], src: ["lynch", "bowditch", "young", "hirt", "kannala"] },
  // une carte par schéma de formule (règle du propriétaire : chaque formule a sa figure)
  { id: "fx-sag", values: cardValueLookup, figs: ["curvFxSag"], src: ["lynch", "bowditch", "young"] },
  { id: "fx-hid", values: cardValueLookup, figs: ["curvFxHidden"], src: ["torso", "torsoM", "young"] },
  { id: "depth", values: cardValueLookup, figs: ["curvDepth"], fx: ["curvFxHidden"], src: ["torso", "torsoM"] },
];
