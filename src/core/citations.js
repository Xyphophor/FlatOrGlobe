// Système de sources/citations piloté par les données, par onglet.
// Remplace cites.py (numérotation automatique des <li> + insertion des
// ancres [n] au build) par une résolution à l'exécution : la position
// dans le tableau exporté par src/data/sources/<tab>.js EST la
// numérotation, comme dans le legacy (ordre de première citation).
// Voir tasks/epic01/UC06.org.

const registry = new Map(); // tabKey -> [{ id, html }, ...]

/** Enregistre la liste ordonnée des sources d'un onglet (une fois, au montage). */
export function registerSources(tabKey, sources) {
  registry.set(tabKey, sources);
}

function indexOf(tabKey, sourceId) {
  const list = registry.get(tabKey);
  if (!list) throw new Error(`citations: no sources registered for tab "${tabKey}"`);
  const i = list.findIndex((s) => s.id === sourceId);
  if (i === -1) throw new Error(`citations: source "${sourceId}" not found for tab "${tabKey}"`);
  return i + 1;
}

/**
 * Ancre [n] vers une source de CET onglet. Ne jamais appeler avec l'id
 * d'une source d'un autre onglet -- la numérotation est strictement par
 * onglet (deux onglets peuvent citer la même œuvre sous des numéros
 * différents, c'est voulu).
 *
 * L'ancre est POSITIONNELLE (#s-<tab>-n<n>), pas basée sur l'id string de
 * la source : c'est ce que research/extract_prose.py écrit déjà tel quel
 * dans la prose verbatim (converti depuis les #shh-N etc. du legacy), et
 * c'était un bug réel avant le 2026-09-16 (epic07/UC01) -- cette fonction
 * générait #s-<tab>-<sourceId> côté renderSources() pendant que la prose
 * verbatim pointait vers #s-<tab>-nN : toutes les ancres [n] des onglets
 * verbatim étaient cassées (aucun élément n'avait le bon id).
 */
export function cite(tabKey, sourceId) {
  const n = indexOf(tabKey, sourceId);
  return `<sup class="ref"><a href="#s-${tabKey}-n${n}">[${n}]</a></sup>`;
}

/** Rend le bloc .srcs d'un onglet depuis sa liste enregistrée. */
export function renderSources(tabKey) {
  const list = registry.get(tabKey) || [];
  const items = list
    .map((s, i) => `<li id="s-${tabKey}-n${i + 1}">[${i + 1}] ${s.html}</li>`)
    .join("");
  return `<section class="srcs"><h2>Sources for this tab</h2><ol>${items}</ol></section>`;
}
