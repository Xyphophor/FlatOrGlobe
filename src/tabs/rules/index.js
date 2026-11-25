// Onglet "rules" (2026-11-25, demande du propriétaire : « dans le groupe Start, à côté de Basics, un onglet Rules ; on a
// établi des règles pour permettre la meilleure comparaison, la plus honnête ; il faut les afficher »). Les règles du
// CLAUDE.md et celles fixées depuis avec le propriétaire, chacune avec son pourquoi et un lien vers un exemple. Explication
// seulement : aucun h2 ne porte de badge de preuve. Prose : src/data/prose/rules.js ; figures : formfigs.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/rules.js";
import { SOURCES } from "../../data/sources/rules.js";
import { drawFormulaFigs } from "./formfigs.js";
import "./style.css";

const KEY = "rules";

export default {
  key: KEY,
  label: "Rules",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    drawFormulaFigs(container, tr);
    drawSymbols(KEY);
  },
  render() {},
  teardown() {},
};
