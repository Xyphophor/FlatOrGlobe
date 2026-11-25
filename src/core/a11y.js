// Passe d'accessibilité commune (epic06/UC03), appelée par src/main.js
// après le montage d'un onglet et après chaque render(). Plutôt que de
// retoucher à la main des centaines de blocs de prose verbatim, elle
// complète le DOM produit, sans jamais écraser ce qu'un onglet a déjà posé :
//  - les puces « voir aussi » vides (<a class="xref" data-xref>) reçoivent
//    le nom de l'onglet et un href -- buildXrefs() du legacy le faisait, le
//    portage l'avait perdu (on voyait une flèche sans texte) ;
//  - un champ sans libellé est relié au <label> de son .field (le legacy
//    écrit <label>…</label><input> sans for=) ou à l'étiquette qui le précède ;
//  - un canvas ou un SVG sans nom devient role="img", nommé par la légende
//    de sa figure (ou, à défaut, le titre de section qui le précède) et
//    décrit par ses lectures chiffrées (.reads) quand il en a.
import { tabLabel } from "./tabs.js";

let uid = 0;
const idOf = (el) => el.id || (el.id = `a11y-${++uid}`);
const hasName = (el) => el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("aria-hidden") === "true";

function fillXrefs(root) {
  for (const a of root.querySelectorAll("a.xref[data-xref]")) {
    if (a.textContent.trim()) continue;
    const key = a.getAttribute("data-xref");
    a.textContent = tabLabel(key);
    a.setAttribute("href", `#tab-${key}`);
    a.title = tabLabel(key);
  }
}

function labelFields(root) {
  for (const f of root.querySelectorAll("input, select, textarea")) {
    if (f.type === "hidden" || f.closest("label") || f.getAttribute("aria-label") || f.getAttribute("aria-labelledby")) continue;
    if (f.id && root.ownerDocument.querySelector(`label[for="${f.id}"]`)) continue;
    const lab = [...(f.parentElement?.children || [])].find((c) => c.tagName === "LABEL" && !c.getAttribute("for"));
    if (lab) { lab.setAttribute("for", idOf(f)); continue; }
    // étiquette qui précède le champ dans la même rangée (.preset-lbl, <b>, <span>)
    let p = f.previousElementSibling;
    while (p && !p.textContent.trim()) p = p.previousElementSibling;
    if (p && p.tagName !== "INPUT" && p.tagName !== "SELECT" && p.tagName !== "BUTTON") f.setAttribute("aria-labelledby", idOf(p));
  }
}

// légende d'une figure : dans le bloc .fig, ou le bloc qui le suit ; sinon le titre qui précède
function captionFor(el, root) {
  const fig = el.closest(".fig, figure, .figsym, .panel, .card, .exp, .persp-wrap") || el.parentElement;
  const inside = fig?.querySelector("figcaption, .fcap, .figcap, .cap, .panel-title");
  if (inside && inside.textContent.trim()) return inside;
  for (let n = fig?.nextElementSibling, i = 0; n && i < 2; n = n.nextElementSibling, i++)
    if (n.matches("figcaption, .fcap, .figcap") && n.textContent.trim()) return n;
  // titre de section le plus proche en remontant le document
  for (let n = fig; n && n !== root; n = n.previousElementSibling || n.parentElement) {
    if (n.matches?.("h1, h2, h3, h4, .label-row, legend") && n.textContent.trim()) return n;
    const h = n.previousElementSibling?.matches?.("h1, h2, h3, h4, .label-row") ? n.previousElementSibling : null;
    if (h && h.textContent.trim()) return h;
  }
  return null;
}

function describeGraphics(root) {
  const items = [...root.querySelectorAll("canvas")].concat([...root.querySelectorAll("svg")].filter((s) => !s.parentElement?.closest("svg")));
  for (const el of items) {
    if (hasName(el) || el.closest("[aria-hidden=true]")) continue;
    if (el.tagName.toLowerCase() === "svg" && el.getAttribute("role") === "img" && el.querySelector("title")) continue;
    const cap = captionFor(el, root);
    el.setAttribute("role", "img");
    if (cap) el.setAttribute("aria-labelledby", idOf(cap));
    else el.setAttribute("aria-label", "figure");
    const reads = el.closest(".fig, figure, .panel")?.querySelector(".reads");
    if (reads && !el.getAttribute("aria-describedby")) el.setAttribute("aria-describedby", idOf(reads));
  }
}

export function enhance(root) {
  if (!root) return;
  fillXrefs(root);
  labelFields(root);
  describeGraphics(root);
}

/**
 * Canvas « clic = pause/lecture » atteignable au clavier : Tab pour y aller,
 * Entrée ou Espace pour basculer (même effet que le clic). Réservé aux
 * canvas dont le clic ne dépend pas de la position visée.
 */
export function keyClickable(el) {
  if (!el || el.hasAttribute("tabindex")) return;
  el.setAttribute("tabindex", "0");
  el.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    el.click();
  });
}
