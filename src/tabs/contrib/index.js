// Onglet "contrib" (2026-10-08, demande du propriétaire) : les observations envoyées au site, mesurées contre les deux
// modèles avec des données ouvertes. Une contribution = un module (src/tabs/contrib/<clé>/contribution.js), publiée
// ou non selon src/data/contrib/published.json (registry.js) : ici, l'en-tête, la prose assemblée, les figures des
// formules, puis les données et l'animation de chaque contribution, chargées à part.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { drawFormulaFigs } from "../../core/formfigs.js";
import { PROSE } from "../../data/prose/contrib.js";
import { SOURCES } from "../../data/sources/contrib.js";
import { CONTRIBUTIONS, resolveCites } from "./registry.js";
import "./style.css";

const KEY = "contrib";

export default {
  key: KEY,
  label: "Contributions",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const T = makeT(lang, KEY);
    const tv = (k, fb, vars = {}) => { let v = T(k); if (!v || v === k) v = fb; for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b); return v; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: resolveCites(getProseDict(lang, KEY)) });
    drawFormulaFigs(container, Object.assign({}, ...CONTRIBUTIONS.map((c) => c.figs)), tv, {}, KEY);
    drawSymbols(KEY);
    // les données et l'animation de chaque contribution se chargent à part
    this._anims = [];
    this._p = Promise.all(CONTRIBUTIONS.map((c) => c.start(container, tv, lang).then((a) => {
      if (!a) return;
      this._anims.push(a);
      if (!container.hidden) a.start();
    }).catch((e) => console.warn(`[contrib] ${c.key}: data/animation skipped:`, e.message))));
  },
  render() { for (const a of this._anims ?? []) a.start(); },
  teardown() { for (const a of this._anims ?? []) a.stop(); },
};
