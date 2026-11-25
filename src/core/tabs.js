// Petits helpers de navigation croisée utilisables par n'importe quel
// onglet SANS importer src/main.js (import circulaire). Le libellé d'un
// onglet est lu sur son bouton, comme le legacy ("increvable au renommage").
export function tabLabel(key) {
  return document.getElementById(`tabbtn-${key}`)?.textContent?.trim() || key;
}

export function tabExists(key) {
  return !!document.getElementById(`tabbtn-${key}`);
}

/** Ancre qui active un onglet (écouteur délégué dans src/main.js). */
export function xref(key, text) {
  return `<a class="xref" href="#tab-${key}" data-xref="${key}">${text ?? tabLabel(key)}</a>`;
}

/** Bande « See also » (nav.xrefs du legacy) pour une liste de clés d'onglet. */
export function xrefsNav(keys) {
  return `<nav class="xrefs" aria-label="See also"><b class="xh">See also</b>${keys.map((k) => xref(k)).join("")}</nav>`;
}
