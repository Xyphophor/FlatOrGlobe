// Onglet "falsify" -- "What would refute each model", le miroir de la page
// d'accueil. Porté du legacy (panneau id="tab-falsify" ~L14073,
// buildFalsify ~L25153, FX_ROWS ~L25061 -> src/data/falsify.js, verbatim).
// Règle rhétorique n°6 : chaque onglet énonce à l'avance le résultat qui
// le réfuterait, avec la précision nécessaire ; le tableau est symétrique.
import { makeT } from "../../core/i18n.js";
import { tabLabel, tabExists, xref } from "../../core/tabs.js";
import { FX_ROWS } from "../../data/falsify.js";
import { EXPERIMENTS, experimentsByGroup } from "../../core/experiments.js";
import { EXP_ALL } from "./experiments.js";
import "./style.css";

const KEY = "falsify";

export default {
  key: KEY,
  label: "What would refute each model",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", KEY);
    this._t = t; this._lang = document.documentElement.lang || "en";
    container.innerHTML = `
      <p class="eyebrow">${t("eyebrow")}</p>
      <h1>${t("h1")}</h1>
      <p class="cnav-lead">${t("lead")}</p>
      <p class="notes">${t("gap")}</p>
      <p class="notes">${t("howto")}</p>
      <div class="tablewrap"><table class="cnav-table" id="fxTable"><caption>${t("caption")}</caption></table></div>
      <h2 class="cnav-h2" data-sec="not-h2">${t("not-h2")}</h2>
      <p class="notes">${t("not-1")}</p><p class="notes">${t("not-2")}</p><p class="notes">${t("not-3")}</p><p class="notes">${t("not-4")}</p>
      <div class="callout">${t("honest")}</div>
      ${this._experiments(t)}
    `;
    this._table = container.querySelector("#fxTable");
    // les calculateurs (src/tabs/<onglet>/exp.js) se branchent sur leur carte, ici
    for (const e of EXPERIMENTS) { const host = container.querySelector(`#xp-host-${e.id}`); if (host) EXP_ALL[e.tab]?.[e.id]?.wire?.(host, this._lang); }
  },

  // Les expériences de tous les onglets (2026-11-26) : un sommaire par groupe d'onglets, pour choisir et voir l'équilibre,
  // puis chaque expérience sous son propre titre (lien profond #tab-falsify/<id>), avec son calculateur.
  _experiments(t) {
    const lang = this._lang, tn = makeT(lang, "nav");
    const rendered = Object.fromEntries(EXPERIMENTS.map((e) => [e.id, EXP_ALL[e.tab]?.[e.id]?.html?.(lang) ?? ""]));
    // le titre : la section de l'expérience (star, ct) ou l'en-tête de sa carte
    const title = (h) => { const m = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(h) || /<div class="exp-h">([\s\S]*?)<\/div>/.exec(h); return m ? m[1].replace(/<span class="ev[^]*?<\/span>/g, "").trim() : ""; };
    const body = (h) => h.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, "");
    const groups = experimentsByGroup();
    // une expérience par ligne : le lien et le nom de son onglet ne se coupent pas entre deux lignes
    const index = groups.map(({ group, items }) => `<p class="xp-ig"><b>${tn(`group-${group}`)}</b> (${items.length})</p><ul class="xp-index">` +
      items.map((e) => `<li><a class="xref" href="#tab-falsify/${e.id}" data-xref="falsify" data-sec="${e.id}">${title(rendered[e.id])}</a> <span class="xp-tab">${tabLabel(e.tab)}</span></li>`).join("") + `</ul>`).join("");
    const cards = groups.map(({ group, items }) => `<h3 class="xp-group">${tn(`group-${group}`)}</h3>` + items.map((e) =>
      `<h2 class="cnav-h2" data-sec="${e.id}">${title(rendered[e.id])}</h2><p class="xp-from">${t("xp-from")} ${xref(e.tab, tabLabel(e.tab))}</p>` +
      `<div class="xp" id="xp-host-${e.id}">${body(rendered[e.id])}</div>`).join("")).join("");
    return `<h2 class="cnav-h2" data-sec="xp-h2">${t("xp-h2")}</h2><p class="notes">${t("xp-lead").replace("{n}", EXPERIMENTS.length)}</p>` +
      `${index}${cards}`;
  },

  render() {
    const t = this._t;
    const head = `<tr><th>${t("col-tab")}</th><th>${t("col-what")}</th><th class="g">${t("col-globe")}</th><th class="f">${t("col-flat")}</th><th>${t("col-prec")}</th></tr>`;
    const body = FX_ROWS.map((r) => {
      const name = tabExists(r.tab) ? xref(r.tab, tabLabel(r.tab)) : `<span class="pending" title="${t("pending")}">${r.tab}</span>`;
      const k = r.id || r.tab; // une deuxième ligne pour un même onglet porte son propre id (seis-tonga)
      return `<tr><td>${name}</td><td>${t(`${k}-what`)}</td><td class="g">${t(`${k}-globe`)}</td><td class="f">${t(`${k}-flat`)}</td><td>${t(`${k}-prec`)}</td></tr>`;
    }).join("");
    const cap = this._table.querySelector("caption");
    this._table.innerHTML = head + body + (cap ? cap.outerHTML : "");
  },

  teardown() {},
};
