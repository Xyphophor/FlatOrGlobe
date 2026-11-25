// Onglet "grav" (gravité). Panneau porté VERBATIM (flux
// src/data/prose/grav.js) ; moteur porté VERBATIM du legacy
// (grav-legacy.js, L23028-23495 : paire « où est le bas », inclinaison du
// disque (intégrale mémoïsée), g(h), g(φ), cinq tables, expérience 1f).
// Schémas gravPairFig et gravfig0-2 : src/core/symbols.js. logic.js +
// logic.test.js rejouent les mêmes nombres sous node:test.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { makeT } from "../../core/i18n.js";
import { drawFormulaFigs } from "./formfigs.js";
import { wire, draw, stop } from "./grav-legacy.js";
import { mountTideAnim, fillTideTable, TIDE_FIGS } from "./tides.js";
import { mountTideGlobe, CLIP_M } from "./tideglobe.js";
import { TICON_N, TICON_BASINS } from "../../data/presets/grav-ticon.js";
import { gaugeRows } from "./tides-logic.js";
import { drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { PROSE } from "../../data/prose/grav.js";
import { SOURCES, READING } from "../../data/sources/grav.js";
import "./style.css";

const KEY = "grav";

export default {
  key: KEY,
  label: "Gravity",
  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    drawSymbols(KEY);
    const lang = document.documentElement.lang || "en", t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    drawFormulaFigs(container, tr);   // epic15/UC04
    // les deux marées (epic37/UC01) : animation, figures des marégraphes, tableau, valeurs de la prose
    drawAll(container, TIDE_FIGS, tr, {}, KEY);
    fillTideTable(container, tr, lang);
    { const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), G = gaugeRows(), by = (k) => G.find((g) => g.key === k);
      const ps = G.map((g) => g.pSemiH), cv = { pSemi: Math.min(...ps) === Math.max(...ps) ? nf(ps[0], 3) : `${nf(Math.min(...ps), 3)}–${nf(Math.max(...ps), 3)}`,
        brM2: nf(by("brest").M2, 2), brN2: nf(by("brest").n2m2, 2), brS2: nf(by("brest").s2m2, 2), frS2: nf(by("fremantle").s2m2, 2), brAge: nf(by("brest").age, 1), mrExp: nf(by("marseille").explained * 100, 0),
        nGlobe: nf(TICON_N.globe, 0), clipM: nf(CLIP_M, 1), medMax: nf(TICON_BASINS.find((b) => b.key === "med").max, 0), fundyMax: nf(TICON_BASINS.find((b) => b.key === "fundy").max / 100, 1) };
      container.querySelectorAll("span.cv[data-v]").forEach((e) => { if (cv[e.dataset.v] != null) e.textContent = cv[e.dataset.v]; }); }
    this._anims = [];
    { const cv = container.querySelector("#gravAnimTide"); if (cv) this._anims.push(mountTideAnim(cv, tr, lang)); }
    { const cv = container.querySelector("#gravAnimTideGlobe"); if (cv) this._anims.push(mountTideGlobe(cv, tr, lang)); }
  },
  render() { draw(); for (const a of this._anims || []) a.start(); },
  teardown() { stop(); for (const a of this._anims || []) a.stop(); },
};
