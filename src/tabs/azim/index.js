// Onglet "azim" (azimut). Panneau porté VERBATIM (flux
// src/data/prose/azim.js, legacy L12181-12667) ; moteur porté VERBATIM du
// legacy (azim-legacy.js, L25631-26322 : sept observatoires, globe et
// disque animés (une journée en 24 s), tableau des relèvements, éclipse
// publiée, lampes balayées, Lune, parallaxe, expériences 9 et 9b).
// Schémas azfig0 (ouverture) et azfig1-5, swatches : src/core/symbols.js.
// logic.js + logic.test.js rejouent les nombres sous node:test.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { wire, draw, stop } from "./azim-legacy.js";
import { PROSE } from "../../data/prose/azim.js";
import { SOURCES } from "../../data/sources/azim.js";
import "./style.css";

const KEY = "azim";

export default {
  key: KEY,
  label: "Azimuth",
  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    for (const d of container.querySelectorAll("details.fold")) d.addEventListener("toggle", () => this.render());
    drawSymbols(KEY);
  },
  render() { draw(); },
  teardown() { stop(); },
};
