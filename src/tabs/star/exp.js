// L'expérience de l'onglet star (xp-star-2b), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) : sa section
// entière (titre, carte, notes) reste dans la prose de l'onglet, marquée « away » ; pas de calculateur.
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/star.js";

export const EXP = { "xp-star-2b": { html: (lang) => proseExp("star", PROSE, "xp-star-2b", lang) } };
