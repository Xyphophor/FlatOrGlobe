// Onglet "star" (traînées d'étoiles). Panneau porté VERBATIM (flux
// src/data/prose/star.js, legacy L8826-9048) ; moteur porté VERBATIM de
// l'IIFE STAR du legacy (src/tabs/star/star-legacy.js, L26907-28155) :
// figure d'ouverture animée, ciel gnomonique, projection photographique,
// rythme des pauses, permanentes/saisonnières, les cinq tables et le
// dump. Les schémas symboliques stfig0-4 viennent de src/core/symbols.js.
// Sections « sky-* » (2026-11-11, hors legacy) : coordonnées du ciel, radec.js + radec-logic.js.
//
// ATTENTION NOMMAGE : le `render()` PRIVÉ de l'IIFE (exposé comme
// STAR.draw) n'a aucun rapport avec le `render()` du contrat d'onglet.
// src/tabs/star/logic.js + logic.test.js rejouent les mêmes nombres que
// les tables du moteur (spots, shape, dome, season, dump) sous node:test.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { STAR } from "./star-legacy.js";
import { mountOpen, mountSky } from "./trails.js";
import { mountSphere, mountPrec, mountPM, mountVis, drawFormulaFigs, fillTables } from "./radec.js";
import { PROSE } from "../../data/prose/star.js";
import { SOURCES, READING } from "../../data/sources/star.js";
import "./style.css";

const KEY = "star";

export default {
  key: KEY,
  label: "Star trails",

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en";
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(lang, KEY) });
    STAR.wire();
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    // ciel de nuit (2026-11-11) : la figure d'ouverture et celle des traînées, trails.js ; le moteur garde nombres et réglages
    this._night = [];
    { const h = container.querySelector("#st-figOpen"); if (h) { this._night.push(mountOpen(h, tr, STAR.api)); STAR.ext.open = true; } }
    { const h = container.querySelector("#st-figSky"); if (h) { const a = mountSky(h, tr, STAR.api, lang); this._night.push(a); STAR.ext.sky = () => a.redraw(); } }
    STAR.ext.play = (on) => { for (const a of [...this._night, ...(this._anims || [])]) a.setPlaying(on); };
    // sections « sky-* » (2026-11-11) : ascension droite et déclinaison, précession, mouvement propre, visibilité
    drawFormulaFigs(container, tr);
    fillTables(container, tr, lang);
    this._anims = [];
    for (const [id, mount] of [["stAnimSphere", mountSphere], ["stAnimPrec", mountPrec], ["stAnimPM", mountPM], ["stAnimVis", mountVis]]) {
      const cv = container.querySelector("#" + id); if (cv) this._anims.push(mount(cv, tr, lang));
    }
    drawSymbols(KEY);
  },

  render() { STAR.draw(); for (const a of [...(this._night || []), ...(this._anims || [])]) a.start(); },

  teardown() { STAR.stop(); for (const a of [...(this._night || []), ...(this._anims || [])]) a.stop(); },
};
