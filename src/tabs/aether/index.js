// Onglet "aether" (2026-10-25, demande du propriétaire) : l'histoire de l'éther, de Huygens à la relativité restreinte, et
// les arguments récurrents des vidéos platistes et géocentristes (« Airy's failure », Michelson-Morley, Lorentz, Sagnac,
// Michelson-Gale, Miller, Einstein-Infeld), chacun dans la section de l'expérience qu'il cite. Histoire et objections :
// aucun h2 ne porte de badge de preuve. Prose : src/data/prose/aether.js ; nombres : logic.js ; figures : formfigs.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/aether.js";
import { SOURCES } from "../../data/sources/aether.js";
import { aetherValues } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountAberration, mountMM, mountClock, mountSagnac } from "./anims.js";
import "./style.css";

const KEY = "aether";

export default {
  key: KEY,
  label: "Aether",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = aetherValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    // animations (2026-10-25)
    this._anims = [];
    for (const [id, mount] of [["aetherAnimAberr", mountAberration], ["aetherAnimMM", mountMM], ["aetherAnimClock", mountClock], ["aetherAnimSagnac", mountSagnac]]) {
      const cv = container.querySelector(`#${id}`); if (cv) this._anims.push(mount(cv, tr, lang));
    }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
