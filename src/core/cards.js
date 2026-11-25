// Cartes autonomes (epic11) : un texte écrit pour être lu HORS de la page
// (pas de « ci-dessus », pas de renvoi à un curseur), en deux longueurs --
// mini (2-3 phrases) et carte (un paragraphe + le verdict, règle 5) -- avec
// ses sources en toutes lettres. Une carte couvre une figure seule, ou un
// ensemble de figures (`figs` de plusieurs blocs) composé sur une image.
import { CARD_TABS } from "../data/cards/index.js";
import { makeT } from "./i18n.js";

/**
 * Référence de figure d'une carte : « id », « id@variante » (la même figure
 * dans un autre des modèles que la page fait choisir) et/ou « id#découpe »
 * (une partie nommée d'un canvas qui en dessine plusieurs, twi : globe | flat).
 */
export function figRef(ref) {
  const m = /^([^@#]+)(?:@([^#]+))?(?:#(.+))?$/.exec(ref) || [];
  return { id: m[1] || ref, v: m[2] ?? null, crop: m[3] ?? null };
}

/** Les cartes d'un onglet ({id, figs, src, labels?}), [] s'il n'en a pas. */
export function cardsOf(tabKey) { return CARD_TABS[tabKey]?.CARDS || []; }

/**
 * Cartes qui concernent un bloc de figure, d'après les ids qu'il contient :
 * `own` = toutes ses figures sont dans le bloc, `sets` = le bloc n'est qu'une
 * partie de l'ensemble.
 */
export function cardsForIds(tabKey, ids) {
  const own = [], sets = [];
  for (const c of cardsOf(tabKey)) {
    const n = c.figs.filter((f) => ids.has(figRef(f).id)).length;
    if (n === c.figs.length) own.push(c); else if (n) sets.push(c);
  }
  return { own, sets };
}

/** Textes d'une carte dans une langue (repli anglais par clé) ; champ absent = "". */
export function cardText(tabKey, card, lang, dicts) {
  const t = makeT(lang, `${tabKey}-cards`, dicts);
  // {{clé}} : valeur calculée par la carte elle-même (card.values(lang) -> k => texte),
  // pour les cartes dont les chiffres viennent des données (epic12, mag).
  const val = card.values ? card.values(lang) : null;
  const fillV = (v) => (val ? v.replace(/\{\{([\w.]+)\}\}/g, (_, k) => val(k)) : v);
  const get = (f) => { const k = `${card.id}.${f}`, v = t(k); return v === k ? "" : fillV(v); };
  const srcs = CARD_TABS[tabKey]?.SOURCES || {};
  return {
    title: get("title"), mini: get("mini"), text: get("text"), verdict: get("verdict"), readsLabel: get("reads"),
    labels: card.labels ? get("labels").split("|") : [],
    sources: card.src.map((s, i) => `[${i + 1}] ${srcs[s] || s}`),
  };
}
