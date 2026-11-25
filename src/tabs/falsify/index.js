// Onglet "falsify" -- "What would refute each model", le miroir de la page
// d'accueil. Porté du legacy (panneau id="tab-falsify" ~L14073,
// buildFalsify ~L25153, FX_ROWS ~L25061 -> src/data/falsify.js, verbatim).
// Règle rhétorique n°6 : chaque onglet énonce à l'avance le résultat qui
// le réfuterait, avec la précision nécessaire ; le tableau est symétrique.
import { makeT } from "../../core/i18n.js";
import { tabLabel, tabExists, xref } from "../../core/tabs.js";
import { FX_ROWS } from "../../data/falsify.js";
import "./style.css";

const KEY = "falsify";

export default {
  key: KEY,
  label: "What would refute each model",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", KEY);
    this._t = t;
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
    `;
    this._table = container.querySelector("#fxTable");
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
