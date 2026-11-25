// État des contrôles d'une carte (epic25/UC03) : les animations à curseurs ou à menus sont pré-rendues dans leur état INITIAL ;
// le MP4 prêt n'est servi que si les contrôles du bloc de la carte sont encore à ces valeurs, sinon la page calcule (comme avant).
// La signature est une courte empreinte des valeurs ; le script de rendu l'enregistre dans le manifeste (`ctl`), la page la
// recalcule au moment de l'export et compare. Une carte sans contrôle à état (champs, menus, boutons de préréglage) a la signature "".
// Fonction pure sur le DOM : même code dans le navigateur et dans le rendu hors navigateur (linkedom).
export const CTRL = "input, select, button:not([data-do]):not(.xp-btn), textarea";

/** Les blocs de figure d'une carte (un par figure, sans doublon). */
export function cardBlocks(card, doc = document) {
  const out = new Set();
  for (const ref of card.figs) {
    const el = doc.getElementById(ref.split(/[@#]/)[0]); if (!el) continue;
    out.add(el.closest(".fig, .figopen, [data-xp-block]") || el.parentElement);
  }
  return [...out];
}

/**
 * Tous les contrôles des blocs de la carte, dans l'ordre du document, sans doublon ; plus ceux que la carte nomme dans
 * `ctl` (ids) quand ils vivent hors de ses blocs (2026-10-28 : le menu des réseaux de surv/tri est dans sa propre rangée ;
 * invisible ici, la carte n'avait qu'une vidéo, celle de Gauss, servie quelle que soit la sélection).
 */
export function cardControls(card, doc = document) {
  const out = new Set();
  for (const b of cardBlocks(card, doc)) for (const c of b.querySelectorAll(CTRL)) out.add(c);
  for (const id of card.ctl || []) { const el = doc.getElementById(id); if (el) out.add(el); }
  return [...out];
}

const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };

/** Valeur d'un champ, normalisée (nombres comparés comme nombres : « 50 » = « 50.0 »). */
function stateOf(el) {
  const type = (el.getAttribute?.("type") || el.type || "").toLowerCase();
  if (type === "checkbox" || type === "radio") return el.checked ?? el.hasAttribute?.("checked") ? "1" : "0";
  const v = String(el.value ?? el.getAttribute?.("value") ?? "");
  return type === "range" || type === "number" ? String(parseFloat(v)) : v;
}

/** État d'un bouton qui en porte un (préréglage : date, modèle, repère…) : aria-pressed / selected / checked, ou une classe on/active ; null pour un simple bouton d'action. */
function buttonState(el) {
  for (const a of ["aria-pressed", "aria-selected", "aria-checked"]) { const v = el.getAttribute?.(a); if (v != null) return v; }
  const cls = (el.getAttribute?.("class") || "").split(/\s+/);
  return cls.some((c) => /^(on|active|selected|is-active)$/.test(c)) ? "on" : null;
}

/** Signature des champs et boutons à état de la carte ("" s'il n'y en a pas : la vidéo sert alors toujours). Le texte d'un bouton n'y entre pas. */
export function controlsSignature(card, doc = document) {
  const parts = [];
  cardControls(card, doc).forEach((el, i) => {
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "button") { const b = buttonState(el); if (b != null) parts.push(`button:${el.id || i}=${b}`); return; }
    parts.push(`${tag}:${el.getAttribute?.("type") || ""}:${el.id || el.getAttribute?.("name") || i}=${stateOf(el)}`);
  });
  return parts.length ? fnv(parts.join("|")) : "";
}

/**
 * Une carte « à liste simple » (2026-10-19, propriétaire : « étendre les prerender aux animations simplement sélectionnables dans
 * une liste ») : aucune figure figée par « @variante », et pour seul contrôle à valeur une liste <select> (les boutons, lecture ou
 * remise à zéro, restent dans leur état initial). Renvoie { sel, values } (les valeurs des options, dans l'ordre), ou null.
 * Le rendu fait une vidéo par option ; la page sert celle dont la signature des contrôles est la sienne.
 */
/** Nom de fichier d'une carte exportée : « <carte>-<longueur> », plus l'option choisie d'une carte à liste simple (sinon chaque réseau, chaque préréglage, donnait le même nom). */
export function cardFileFig(card, len, doc = document) {
  const LV = listVariants(card, doc), o = LV?.sel.selectedOptions?.[0] || LV?.sel.querySelector("option:checked");
  const opt = o ? o.textContent.split(" · ")[0] : "";
  return `${card.id}-${len}` + (opt ? `-${opt}` : "");
}

export function listVariants(card, doc = document) {
  if (card.figs.some((f) => f.includes("@"))) return null;
  const fields = cardControls(card, doc).filter((el) => (el.tagName || "").toLowerCase() !== "button");
  if (fields.length !== 1 || (fields[0].tagName || "").toLowerCase() !== "select") return null;
  const sel = fields[0], values = [...sel.querySelectorAll("option")].map((o) => o.getAttribute("value") ?? o.textContent);
  return values.length > 1 ? { sel, values } : null;
}
