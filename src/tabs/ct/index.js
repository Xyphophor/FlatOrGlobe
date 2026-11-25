// Onglet "ct" (théodolite céleste). Panneau porté VERBATIM (flux
// src/data/prose/ct.js, legacy L13105-13464) ; moteur porté VERBATIM du
// legacy (ct-legacy.js, L28160-29290 moins les silhouettes sim/hh et les
// angles zénithaux qui vivent ailleurs) : les treize figures FIG (schéma
// d'ouverture, 1-4, pôle, zéro, barres, boîte à moustaches et sa légende,
// R, tendance, tir du 24 novembre), les tables et les lectures, le menu
// des 46 cas publiés. logic.js + logic.test.js rejouent les nombres.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { wire, draw, stop } from "./ct-legacy.js";
import { PROSE } from "../../data/prose/ct.js";
import { SOURCES, READING } from "../../data/sources/ct.js";
import "./style.css";

const KEY = "ct";

export default {
  key: KEY,
  label: "Theodolite",
  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    for (const d of container.querySelectorAll("details.fold")) d.addEventListener("toggle", () => this.render());
    drawSymbols(KEY);
  },
  render() { draw(); },
  teardown() { stop(); },
};
