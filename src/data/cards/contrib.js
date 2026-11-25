// Cartes autonomes de l'onglet contrib (2026-10-08) : depuis le 2026-10-15, celles des contributions publiées,
// chacune déclarée dans src/tabs/contrib/<clé>/contribution.js (textes : <clé>/i18n/<langue>.json, « contrib-cards »).
import { CONTRIBUTIONS } from "../../tabs/contrib/registry.js";

export const SOURCES = Object.assign({}, ...CONTRIBUTIONS.map((c) => c.cardSources));
export const CARDS = CONTRIBUTIONS.flatMap((c) => c.cards);
