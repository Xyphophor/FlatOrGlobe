// Onglet "phys" (2026-10-25, demande du propriétaire) : la physique dont les autres onglets se servent (unités, mouvement,
// référentiels, Newton, mouvement circulaire, conservation, ondes, constantes et, depuis le 2026-10-27, la mécanique : forces,
// poulies, chocs, magnétisme, balistique). « Basics » jusqu'au 2026-11-27, puis coupé en deux (propriétaire) : les angles, vecteurs,
// dérivées, la mesure et les modèles de terrain sont dans l'onglet math (src/tabs/math/). Explication seulement : aucun h2 ne
// porte de badge de preuve. Prose : src/data/prose/phys.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/phys.js";
import { SOURCES } from "../../data/sources/phys.js";
import { CONSTANTS, physValues } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mechValues } from "./mechanics.js";
import { mountCollReel } from "./collreel.js";
import { mountTable, mountPulley, mountKick, mountFrames, mountImpulseSum, mountMag, mountBallistic } from "./anims.js";
import "./style.css";

const KEY = "phys";

const NAMES = { c: "speed of light in vacuum", h: "Planck constant", e: "elementary charge", k: "Boltzmann constant", na: "Avogadro constant",
  cs: "caesium-133 hyperfine frequency", kcd: "luminous efficacy of 540 THz light", G: "Newtonian constant of gravitation", gm: "Earth's gravitational parameter",
  omega: "Earth's mean angular velocity", req: "Earth's equatorial radius (GRS80)", geq: "normal gravity at the equator", gpole: "normal gravity at the poles", gn: "standard gravity" };
const KINDS = { defined: "exact, defines a unit", measured: "universal, measured", earth: "property of the Earth", convention: "convention" };

export default {
  key: KEY,
  label: "Physics",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = { ...physValues(lang), ...mechValues(lang) };
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const tb = container.querySelector("#phys-tbConst");
    if (tb) tb.innerHTML = CONSTANTS.map((c) => {
      const sym = c.sym.replace(/_(\w+)/, "<sub>$1</sub>"), ref = `<sup class="ref"><a href="#s-${KEY}-n${c.src}">[${c.src}]</a></sup>`;
      const value = lang === "en" ? c.value : c.value.replace(/\./g, ",");
      return `<tr><td>${sym}</td><td>${tr(`c-${c.id}`, NAMES[c.id])}${ref}</td><td class="num">${value}</td><td>${c.unit}</td><td class="phys-${c.cls}">${tr(`cls-${c.cls}`, KINDS[c.cls])}</td></tr>`;
    }).join("");
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    // les animations de la mécanique (2026-10-27)
    this._anims = [];
    for (const [id, mount] of [["physAnimTable", mountTable], ["physAnimPulley", mountPulley], ["physAnimKick", mountKick], ["physAnimFrames", mountFrames], ["physAnimISum", mountImpulseSum], ["physAnimMag", mountMag], ["physAnimBall", mountBallistic]]) {
      const cv = container.querySelector(`#${id}`); if (cv) this._anims.push(mount(cv, tr, lang));
    }
    // la vitrine du choc (2026-10-27)
    { const cv = container.querySelector("#physReelColl"); if (cv) this._anims.push(mountCollReel(cv, tr, lang, vals)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
