// Onglet "math" (2026-11-27, demande du propriétaire : « séparer l'onglet basics en deux onglets math et physics ») : les outils
// mathématiques dont les autres onglets se servent, sortis de l'onglet phys : angles et radians, vecteurs (Chasles), dérivées et
// leurs notations, mesure, incertitude et ajustement (σ, moindres carrés, r, χ²/ν), modèles de terrain (maillage, lecture
// bilinéaire). Explication seulement : aucun h2 ne porte de badge de preuve. Prose : src/data/prose/math.js ; les valeurs
// (exemple du pendule, petits angles) viennent de src/tabs/phys/logic.js, comme avant la séparation.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/math.js";
import { SOURCES } from "../../data/sources/math.js";
import { physValues } from "../phys/logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountDemMesh } from "./demmesh.js";
import "./style.css";

const KEY = "math";

export default {
  key: KEY,
  label: "Math",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = physValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anims = [];
    const cv = container.querySelector("#mathAnimDem"); if (cv) this._anims.push(mountDemMesh(cv, tr, lang));
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
