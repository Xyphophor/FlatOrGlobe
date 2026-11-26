// L'expérience de l'onglet ct (xp-ct-11), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) : sa section
// entière (titre, carte, notes) reste dans la prose de l'onglet, marquée « away » ; pas de calculateur.
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/ct.js";

export const EXP = { "xp-ct-11": { html: (lang) => proseExp("ct", PROSE, "xp-ct-11", lang) } };
