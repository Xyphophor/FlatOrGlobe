// Contrôles d'accessibilité statiques (epic06/UC03), appelés par
// scripts/mount-smoke.mjs --a11y sur chaque panneau monté. Sans navigateur :
// on lit le DOM produit (noms accessibles, libellés, rôles), pas le rendu --
// le contraste et le parcours au clavier réel restent à voir à l'écran.
const nameOf = (el, root) => {
  const al = el.getAttribute("aria-label"); if (al && al.trim()) return al.trim();
  const lb = el.getAttribute("aria-labelledby");
  if (lb) return lb.split(/\s+/).map((id) => root.ownerDocument.getElementById(id)?.textContent || "").join(" ").trim();
  return (el.textContent || "").trim() || (el.getAttribute("title") || "").trim();
};
const desc = (el) => el.id ? `#${el.id}` : `<${el.tagName.toLowerCase()}${el.className ? " ." + String(el.className).split(" ")[0] : ""}>`;

export function a11yCheck(root) {
  const doc = root.ownerDocument, out = [];
  const add = (kind, el) => out.push(`${kind} ${desc(el)}`);
  for (const b of root.querySelectorAll("button, [role=button]")) if (!nameOf(b, root)) add("bouton-sans-nom", b);
  for (const a of root.querySelectorAll("a[href], a[data-xref]")) if (!nameOf(a, root)) add("lien-sans-texte", a);
  for (const f of root.querySelectorAll("input, select, textarea")) {
    if (f.getAttribute("type") === "hidden") continue;
    const labelled = f.closest("label") || (f.id && doc.querySelector(`label[for="${f.id}"]`)) || f.getAttribute("aria-label") || f.getAttribute("aria-labelledby") || f.getAttribute("title");
    if (!labelled) add("champ-sans-libellé", f);
  }
  for (const c of root.querySelectorAll("canvas")) {
    const named = c.getAttribute("aria-label") || c.getAttribute("aria-labelledby") || c.getAttribute("aria-hidden") === "true";
    if (!named) add("canvas-sans-description", c);
    const cur = c.style?.cursor || "";
    // « pointer » = un clic qui bascule quelque chose ; « grab »/« crosshair » = glisser ou viser, avec des commandes à côté
    if (/pointer/.test(cur) && !c.hasAttribute("tabindex")) add("canvas-cliquable-hors-clavier", c);
  }
  for (const s of root.querySelectorAll("svg")) {
    if (s.closest("svg") !== s) continue;
    if (s.closest("[aria-hidden=true]")) continue;
    const ok = s.getAttribute("aria-hidden") === "true" || (s.getAttribute("role") === "img" && (s.getAttribute("aria-label") || s.getAttribute("aria-labelledby") || s.querySelector("title")));
    if (!ok) add("svg-sans-rôle", s);
  }
  for (const g of root.querySelectorAll("[aria-label=figure]")) add("figure-sans-légende", g);
  for (const i of root.querySelectorAll("img")) if (!i.hasAttribute("alt")) add("img-sans-alt", i);
  return out;
}

/** Ids en double dans toute la page (un label[for] ou aria-labelledby visera le premier). */
export function duplicateIds(doc) {
  const seen = new Map();
  for (const el of doc.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) || 0) + 1);
  return [...seen].filter(([, n]) => n > 1).map(([id, n]) => `${id}×${n}`);
}
