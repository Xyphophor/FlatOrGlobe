// Onglet "kappa" (2026-11-27, demande du propriétaire : « un onglet curvature à côté de basics : la notion de courbure en
// mathématique, des tangentes qui se déplacent, le passage en 3D, le plan à 0 et la sphère à 1/R ; comment détecter la
// courbure ; surtout, comment calculer un rayon sur un plan échoue »). Explication : aucun h2 ne porte de badge de preuve
// (les relevés sont simulés). Prose : src/data/prose/kappa.js ; nombres : logic.js ; animations : anims.js, methods.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/kappa.js";
import { SOURCES } from "../../data/sources/kappa.js";
import { kappaValues } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountDef } from "./anims.js";
import { mountMethod } from "./methods.js";
import { mountKappaReel } from "./reel.js";
import "./style.css";

const KEY = "kappa";
const METHOD_CANVAS = { kappaAnimDip: "dip", kappaAnimZen: "zenith", kappaAnimTri: "triangle", kappaAnimCirc: "circle", kappaAnimErat: "erat", kappaAnimTravel: "travel" };

export default {
  key: KEY,
  label: "Curvature",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = kappaValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anims = [];
    { const cv = container.querySelector("#kappaReel"); if (cv) this._anims.push(mountKappaReel(cv, tr, lang, vals)); }   // la vitrine (2026-11-27)
    { const cv = container.querySelector("#kappaAnimDef"); if (cv) this._anims.push(mountDef(cv, tr, lang)); }
    for (const [id, m] of Object.entries(METHOD_CANVAS)) { const cv = container.querySelector(`#${id}`); if (cv) this._anims.push(mountMethod(cv, tr, lang, m)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
