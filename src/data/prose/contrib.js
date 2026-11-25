// Prose de l'onglet contrib (2026-10-08), en anglais (source) : les observations envoyées au site, mesurées contre
// les deux modèles. Depuis le 2026-10-15, l'en-tête et la fin seulement : la prose de chaque contribution est dans
// src/tabs/contrib/<clé>/prose.js et n'entre ici que si elle est publiée (src/tabs/contrib/registry.js) ; ses
// renvois ⟦cite:<id>⟧ y reçoivent leur numéro (src/data/sources/contrib.js).
import { CONTRIBUTIONS, resolveCites } from "../../tabs/contrib/registry.js";

export const PROSE = [
  { t: "eyebrow", k: "cb-eyebrow", html: "Contributions · observations sent to the site, measured in the open" },
  { t: "h1", k: "cb-h1", html: "Your photographs, measured against both models" },
  { t: "lead", opener: true, k: "cb-lead", html: "This tab collects observations sent by readers, including readers who think the Earth is flat. Each one is measured with open data, and both models get the same data, the same distances and the same freedom. The analysis is published as it stands, limits included, so that the contributor can check every number and every step." },

  // les contributions publiées (src/tabs/contrib/registry.js), chacune sa prose (src/tabs/contrib/<clé>/prose.js)
  ...(CONTRIBUTIONS.length ? CONTRIBUTIONS.flatMap((c) => resolveCites(c.blocks))
    : [{ t: "notes", k: "cb-none", html: "No contribution is published yet." }]),

  { t: "xrefs", keys: ["ref", "hh", "dip", "obs", "surv"], wide: false },
  { t: "sources" },
];
