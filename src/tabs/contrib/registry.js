// Le registre des contributions de l'onglet contrib (2026-10-15, demande du propriétaire : « désactiver certaines
// contributions à la carte ; pas juste cachées, pas du tout renvoyées au client »).
//
// Une contribution = un dossier src/tabs/contrib/<clé>/ (contribution.js : prose, sources, carte, badge, textes
// traduits, nombres, animation ; ses données dans src/data/presets/contrib-<clé>.js, ses photos dans
// public/photos/contrib-<clé>-*). Qui est publiée : src/data/contrib/published.json, versionné.
//
// Au build (vite.config.js -> scripts/contrib-build.mjs), les lignes marquées « // contrib:<clé> » d'une
// contribution non publiée sont retirées de CE fichier avant que Rollup le lise : son module n'est jamais importé,
// donc ni sa prose, ni ses textes, ni ses données, ni son animation ne sont dans le bundle ; ses photos sont retirées
// de dist/, et `node scripts/contrib-build.mjs check dist` (Dockerfile) refuse un build où il en resterait une trace.
// Au serveur de dev, tout se voit (pour y travailler) ; dans Node (tests, mode IA, PDF), les publiées seulement,
// ou toutes avec CONTRIB_ALL=1.
import PUBLISHED from "../../data/contrib/published.json" with { type: "json" };
import { addDict } from "../../core/i18n.js";
import lomond from "./lomond/contribution.js"; // contrib:lomond
import flightdip from "./flightdip/contribution.js"; // contrib:flightdip

/** Toutes les contributions présentes dans ce build, dans l'ordre de la page. */
export const ALL = [
  lomond, // contrib:lomond
  flightdip, // contrib:flightdip
];

const showAll = !!import.meta.env?.DEV || (typeof process !== "undefined" && process.env?.CONTRIB_ALL === "1");
/** Les contributions affichées. */
export const CONTRIBUTIONS = ALL.filter((c) => showAll || PUBLISHED[c.key] === true);

// leurs textes traduits (contribution.i18n : { langue: { onglet: { clé: texte } } }), ceux des affichées seulement
for (const c of CONTRIBUTIONS) for (const [lang, d] of Object.entries(c.i18n)) for (const [tab, obj] of Object.entries(d)) addDict(lang, tab, obj);

/** L'ordre des sources : celles de chaque contribution affichée, dans l'ordre de leur premier renvoi, sans doublon. */
export const SOURCE_ORDER = [...new Set(CONTRIBUTIONS.flatMap((c) => c.sources))];
const NUM = new Map(SOURCE_ORDER.map((id, i) => [id, i + 1]));

/** Remplace les renvois ⟦cite:<id>⟧ (prose anglaise et traductions) par leur numéro, partout dans x (chaînes,
 * tableaux, objets) ; un renvoi vers une source inconnue lève (une prose citerait une source absente). */
export function resolveCites(x) {
  if (typeof x === "string") return x.replace(/⟦cite:([a-z0-9-]+)⟧/g, (_, id) => {
    const n = NUM.get(id);
    if (!n) throw new Error(`contrib: renvoi vers une source absente (${id})`);
    return `<sup class="ref"><a href="#s-contrib-n${n}">[${n}]</a></sup>`;
  });
  if (Array.isArray(x)) return x.map(resolveCites);
  if (x && typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, resolveCites(v)]));
  return x;
}

/** La liste numérotée des sources de l'onglet (shared : le fonds commun). */
export function assembleSources(shared) {
  return SOURCE_ORDER.map((id, i) => {
    const html = CONTRIBUTIONS.find((c) => c.ownSources?.[id])?.ownSources[id] ?? shared[id];
    if (!html) throw new Error(`contrib: source ${id} introuvable`);
    return { id: `n${i + 1}`, html };
  });
}
