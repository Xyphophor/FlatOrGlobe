// Onglet "rx" (epic16/UC06) -- « Your own GPS » : le visiteur résout la position de son
// téléphone à partir des signaux bruts (userlogic.js, youfig.js), la compare aux 34
// stations de l'onglet gps, et partage un code pour ajuster une sphère à plusieurs
// (grouplogic.js, groupfig.js). Onglet NOUVEAU (demande du propriétaire du 2026-10-03 :
// une section à part, longuement expliquée, chaque formule avec sa figure). Prose
// anglaise source dans src/data/prose/rx.js ; nombres calculés dans values.js. Ordre
// (2026-10-03) : l'outil, le code partagé et ce qu'il protège, puis les équations, chacune
// avec un extrait de code Python / C / Go (snippets.js, généré et vérifié par
// scripts/rx-snippets/check.mjs).
// RIEN n'est envoyé ni stocké : ni fetch, ni localStorage ; tout vit dans ce module.
import { highlight } from "../../core/highlight.js";
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/rx.js";
import { SOURCES, READING } from "../../data/sources/rx.js";
import { rxValues } from "./values.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountGpsYou } from "./youfig.js";
import { mountGpsGroup } from "./groupfig.js";
import { SNIPPETS } from "./snippets.js";
import "./style.css";

const KEY = "rx";

// Formule -> extrait de code (scripts/rx-snippets/fxN.*, vérifiés par check.mjs).
const SNIP_OF = { rxFxClock: "fx1", rxFxKepler: "fx2", rxFxBudget: "fx3", rxFxIter: "fx4", rxFxRound: "fx5", rxFxSag: "fx6", rxFxSigma: "fx7", rxFxMN: "fx8" };
const LANG_NAME = { py: "Python", c: "C", go: "Go" };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Pose sous chaque formule ses trois extraits ; un seul visible, celui du sélecteur #rxLang (rien n'est mémorisé). */
function mountSnippets(root, tr) {
  for (const [fig, fx] of Object.entries(SNIP_OF)) {
    const box = root.querySelector(`#${fig}`)?.closest(".formula");
    if (!box || !SNIPPETS[fx]) continue;
    const pres = Object.entries(SNIPPETS[fx]).map(([l, code]) =>
      `<pre class="rx-code-snip" data-lang="${l}" tabindex="0" aria-label="${esc(tr("snip-label", "Code") + ": " + LANG_NAME[l])}"${l === "py" ? "" : " hidden"}><code>${highlight(code, l)}</code></pre>`).join("");
    box.insertAdjacentHTML("beforeend", `<div class="rx-snip">${pres}</div>`);
  }
  const sel = root.querySelector("#rxLang");
  sel?.addEventListener("change", () => root.querySelectorAll("pre.rx-code-snip").forEach((p) => { p.hidden = p.dataset.lang !== sel.value; }));
}

export default {
  key: KEY,
  label: "Your own GPS",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY);
    const tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(lang, KEY) });
    const vals = rxValues();
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);   // un schéma par formule, avant renderTexIn (main.js)
    mountSnippets(container, tr);           // et son extrait Python / C / Go
    this._group = mountGpsGroup(container, tr);
    this._you = mountGpsYou(container, tr, (res) => this._group.setYou(res));
    drawSymbols(KEY);
  },

  render() { this._you?.draw(); this._group?.draw(); },
  teardown() {},   // aucune animation
};
