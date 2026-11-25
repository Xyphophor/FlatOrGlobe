// Onglet "persp" (2026-11-21, demande du propriétaire : « un onglet dédié perspective dans objections ; une animation
// vitrine au début ; quatre cubes qui s'éloignent ; le parallèle avec le coucher de soleil ; les rayons du soleil, la
// caméra qui se tourne ; la même chose avec un soleil très proche »). Explication et objections : aucun h2 ne porte de
// badge de preuve. Prose : src/data/prose/persp.js ; nombres : logic.js ; projection : persp3d.js ; figures : formfigs.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/persp.js";
import { SOURCES } from "../../data/sources/persp.js";
import { perspValues } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountCubes, mountSunset, mountRays, mountZoom, mountDip, mountAnti } from "./anims.js";
import { mountPerspReel } from "./reel.js";
import "./style.css";

const KEY = "persp";

export default {
  key: KEY,
  label: "Perspective",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = perspValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anims = [];
    const near = (cv, tr2, l) => mountRays(cv, tr2, l, { near: true });
    for (const [id, mount] of [["perspAnimCubes", mountCubes], ["perspAnimSunset", mountSunset], ["perspAnimRays", mountRays], ["perspAnimNear", near], ["perspAnimZoom", mountZoom], ["perspAnimDip", mountDip], ["perspAnimAnti", mountAnti]]) {
      const cv = container.querySelector(`#${id}`); if (cv) this._anims.push(mount(cv, tr, lang));
    }
    { const cv = container.querySelector("#perspReel"); if (cv) this._anims.push(mountPerspReel(cv, tr, lang, vals)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
