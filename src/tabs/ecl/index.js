// Onglet "ecl" (éclipses) -- epic09. Onglet NOUVEAU, pas un port du legacy :
// prose anglaise source dans src/data/prose/ecl.js, données NASA dans
// src/data/presets/ecl.js (générées par `fog build ecl`), calculs
// purs et testés dans logic.js. Canvas 2D uniquement (la machine du
// propriétaire n'a pas de WebGL2). Les sections arrivent UC par UC
// (tasks/epic09/) : squelette (UC02), maquette des nœuds (UC03, nodes.js), saros (UC04, saros.js), circonstances locales (UC05, local.js), modèle plat (UC06, flat.js), séléniélie (2026-10-04, selen.js).
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/ecl.js";
import { SOURCES, READING } from "../../data/sources/ecl.js";
import { mountNodes } from "./nodes.js";
import { mountSaros } from "./saros.js";
import { mountLocal } from "./local.js";
import { mountFlat } from "./flat.js";
import { drawBesselFig } from "./besselfig.js";
import { drawLunarFig } from "./lunar.js";
import { mountSelen } from "./selen.js";
import { drawFormulaFigs } from "./formfigs.js";
import "./style.css";

const KEY = "ecl";

export default {
  key: KEY,
  label: "Eclipses",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY);
    // libellé traduit s'il existe, sinon le texte anglais du code (même contenu que en/ecl.json)
    const tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(lang, KEY) });
    const cv = container.querySelector("#eclNodes");
    this._nodes = cv ? mountNodes(cv, container.querySelector("#eclNodesReads"), tr) : null;
    const cs = container.querySelector("#eclSaros");
    this._saros = cs ? mountSaros(cs, container.querySelector("#eclSarosReads"), tr) : null;
    this._local = container.querySelector("#eclMap") ? mountLocal(container, tr) : null;
    this._bessel = container.querySelector("#eclBessel"); this._lunar = container.querySelector("#eclLunar"); this._tr = tr;
    const cf = container.querySelector("#eclFlat");
    this._flat = cf ? mountFlat(cf, container.querySelector("#eclFlatReads"), tr) : null;
    const cl = container.querySelector("#eclSelen");   // séléniélie (2026-10-04)
    this._selen = cl ? mountSelen(cl, container.querySelector("#eclSelenReads"), [...cl.closest(".fig").querySelectorAll("button[data-case]")], tr) : null;
    drawFormulaFigs(container, tr);
  },

  render() { if (this._bessel) drawBesselFig(this._bessel, this._tr); if (this._lunar) drawLunarFig(this._lunar, this._tr); this._nodes?.start(); this._saros?.start(); this._local?.start(); this._flat?.start(); this._selen?.start(); },
  teardown() { this._nodes?.stop(); this._saros?.stop(); this._flat?.stop(); this._selen?.stop(); },
};
