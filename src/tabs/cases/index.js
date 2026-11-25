// Onglet "cases" (études de cas, 2026-10-31, propriétaire : « ce n'est pas une contribution, plutôt une étude de cas ; j'en
// ferais un onglet à part ; contribution, c'est pour les gens qui veulent volontairement partager des données ») : une
// observation publiée comme preuve d'une Terre plate, retrouvée (lieu, heure), refaite avec les nombres des opérateurs et les
// données ouvertes du jour, les deux modèles avec les mêmes entrées. Première étude : Worthing–Brighton, février 2019
// (PIER2PIER 2, Dr John D.). Prose : src/data/prose/cases.js ; données : fog build cases-pier2pier ; rayons : ../ref/laser.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/cases.js";
import { SOURCES } from "../../data/sources/cases.js";
import { p2pValues, trialRows, p2pScenes } from "./logic.js";
import { makeLaserAnim } from "../ref/laserfig.js";
import { drawFormulaFigs } from "./formfigs.js";
import "./style.css";

const KEY = "cases";

export default {
  key: KEY,
  label: "Case studies",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = p2pValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    this._fillTrials(container, tr, lang);
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    // l'animation (2026-10-31) : le moteur et le dessin de la section laser de ref, sur les scènes de l'étude
    const cv = container.querySelector("#p2pAnim");
    if (cv) {
      const A = makeLaserAnim({ scenes: p2pScenes(), name: (sc) => tr(`p2p-an-${sc.key}`, sc.key), still: 4.5 + 1,
        foot: (sc) => tr("p2p-an-foot", "1 mrad beam, level, 1 m above the water · camera 1 m, {d} km away").replace("{d}", (sc.S.D / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })) });
      this._anim = A.mount(cv, container.querySelector("#p2pReads"), Object.assign(tr, { lang }));
    }
  },
  render() { this._anim?.start(); },
  teardown() { this._anim?.stop(); },

  // le tableau des essais (calculé : le traçage des rayons prend ~1 s, une fois, au montage)
  _fillTrials(container, tr, lang) {
    const tb = container.querySelector("#p2pTrials"); if (!tb) return;
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    const V = { direct: tr("p2p-v-direct", "seen, direct"), reflect: tr("p2p-v-reflect", "by reflection"), hidden: tr("p2p-v-hidden", "hidden") };
    const cell = (v) => `<span class="p2p-${v}">${V[v]}</span>`;
    const date = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString(lang, { day: "numeric", month: "short" });
    tb.innerHTML = trialRows().map((r) => `<tr><td>${date(r.date)}${r.time ? ` ${r.time}` : ""}</td>` +
      `<td>${tr(`p2p-site-${r.from}`, r.from)} ${nf(r.hs, 2)} m → ${tr(`p2p-site-${r.to}`, r.to)} ${nf(r.hc, 1)} m</td>` +
      `<td class="${r.seen ? "p2p-yes" : "p2p-no"}">${r.seen ? tr("p2p-yes", "yes") : tr("p2p-no", "no")}</td>` +
      `<td>${nf(r.hidden0, 1)} m</td><td>${nf(r.kNeed, 2)}</td><td>${nf(2 * r.gNeed, 2)} °C</td>` +
      (r.measured ? `<td>${cell(r.traced.worthingA.globe)} / ${cell(r.traced.worthingA.plane)}</td>` +
        `<td>${cell(r.traced.brighton.globe)} / ${cell(r.traced.brighton.plane)}</td>`
        : `<td colspan="2">${tr("p2p-est", "no readings that night; air estimated from ERA5 and OISST:")} ${cell(r.traced.estimated.globe)} / ${cell(r.traced.estimated.plane)}</td>`) + "</tr>").join("");
  },
};
