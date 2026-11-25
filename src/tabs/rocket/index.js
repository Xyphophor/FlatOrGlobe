// Onglet "rocket" (2026-10-27, demande du propriétaire : « j'ai besoin d'expliquer les fusées… comment la pression existe dans
// la fusée pour éjecter de la masse et exploiter la troisième loi de Newton… l'atmosphère n'a aucun rôle ») : la pression d'une
// chambre, le trou, le feu, la poussée, l'air qui retient (Goddard 1916, le RS-25), Joule, Tsiolkovski. Explication et
// objections : aucun h2 ne porte de badge de preuve. Prose : src/data/prose/rocket.js ; billes : balls.js, scenes.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/rocket.js";
import { SOURCES } from "../../data/sources/rocket.js";
import { rocketValues } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountBox, mountHole, mountFill, mountThrust, mountAir, mountFree } from "./anims.js";
import { mountRocketReel } from "./reel.js";
import "./style.css";

const KEY = "rocket";

export default {
  key: KEY,
  label: "Rockets",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = rocketValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anims = [];
    for (const [id, mount] of [["rocketAnimBox", mountBox], ["rocketAnimHole", mountHole], ["rocketAnimFill", mountFill], ["rocketAnimThrust", mountThrust], ["rocketAnimAir", mountAir], ["rocketAnimFree", mountFree]]) {
      const cv = container.querySelector(`#${id}`); if (cv) this._anims.push(mount(cv, tr, lang));
    }
    // la vitrine (2026-10-27)
    { const cv = container.querySelector("#rocketReel"); if (cv) this._anims.push(mountRocketReel(cv, tr, lang, vals)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
