// Onglet "fou". Panneau porté VERBATIM (flux src/data/prose/fou.js,
// research/extract_prose.py v2) ; moteur porté VERBATIM du legacy
// (src/tabs/fou/fou-legacy.js : tables, figures canvas, animation avec ses
// boutons, expérience). Les schémas symboliques (foufig*, figure
// d'ouverture) viennent de src/core/symbols.js. logic.js + logic.test.js
// rejouent les mêmes nombres sous node:test.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { wire, draw, stop } from "./fou-legacy.js";
import { PROSE } from "../../data/prose/fou.js";
import { SOURCES, READING } from "../../data/sources/fou.js";
import "./style.css";

const KEY = "fou";

export default {
  key: KEY,
  label: "Foucault",

  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    drawSymbols(KEY);
  },

  render() { draw(); },

  teardown() { stop(); },
};
