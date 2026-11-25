// Badge de classe de preuve sur un titre de section (epic17/UC01) : registre
// src/data/evidence.js, textes src/i18n/<lang>/evidence.json. Le libellé est
// visible ; la définition et, pour une validation, « où le rayon entre » sont
// dans le title (et lus par aria-label).
import { EVIDENCE } from "../data/evidence.js";
import { makeT } from "./i18n.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const pageLang = () => (typeof document !== "undefined" && document.documentElement?.lang) || "en";

/** HTML d'un badge de classe, ou "" si la section n'a pas de classe. */
export function evBadge(tab, k, lang = pageLang()) {
  const e = EVIDENCE[tab]?.[k];
  if (!e) return "";
  return evChip(e.cls, lang, e.enters);
}

/** Un badge d'une classe donnée (aussi pour la légende et les cartes de l'accueil). */
export function evChip(cls, lang = pageLang(), enters = null) {
  const t = makeT(lang, "evidence");
  const lab = t(`cls-${cls}`), def = t(`def-${cls}`);
  const tip = enters ? `${def} ${t("where")} ${t(enters)}` : def;
  return ` <span class="ev ev-${cls}" title="${esc(tip)}" aria-label="${esc(`${lab}${lang === "fr" ? " : " : ": "}${tip}`)}">${esc(lab)}</span>`;
}
