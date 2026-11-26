// Expériences 9 (où est le Soleil pour vous) et 9b (la Lune contre les étoiles), dans l'onglet falsify depuis le
// 2026-11-26 (src/core/experiments.js). Leurs sorties viennent de l'état de l'onglet azim (le cas affiché, l'instant) :
// azim-legacy.js les écrit (ids uniques dans la page), au cas par défaut tant que l'onglet n'a pas tourné.
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/azim.js";
import { azimExperimentsPaint } from "./azim-legacy.js";

export const EXP = {
  "xp-azim-9": { html: (lang) => proseExp("azim", PROSE, "xp-azim-9", lang), wire: () => azimExperimentsPaint() },
  "xp-azim-9b": { html: (lang) => proseExp("azim", PROSE, "xp-azim-9b", lang), wire: () => azimExperimentsPaint() },
};
