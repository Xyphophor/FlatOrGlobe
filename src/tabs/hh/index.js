// Onglet "hh" (hauteur cachée). Passé au flux VERBATIM (rattrapage UC11,
// 2026-09-16) : panneau legacy mot pour mot (src/data/prose/hh.js) +
// moteur porté verbatim (src/tabs/hh/hh-legacy.js -- calculateur,
// tableau des cas documentés, records/plafond replié, expérience du
// balayage de hauteur, deux coupes + perspective avec zoom, silhouette
// DEM du Canigou). drawPanel()/drawPerspective() sont réutilisées depuis
// sim/sim-legacy.js, comme dans le legacy. Voir tasks/epic02/UC01.org
// (portée d'origine) et UC11.org (rattrapage).
import { SCENES } from "./scenes.js";
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { wire, render as draw, stop } from "./hh-legacy.js";
import { PROSE } from "../../data/prose/hh.js";
import { SOURCES } from "../../data/sources/hh.js";
import { mountFlatten } from "../../core/flatten.js";
import { FLATTEN_CASES } from "../../data/presets/flatten.js";
import "./style.css";

const KEY = "hh";

export default {
  key: KEY,
  label: "Hidden height",
  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    // « aplatir la Terre » (epic06/UC04) : figure animée partagée avec dip
    const fl = container.querySelector("#hhFlatten");
    this._flat = fl ? mountFlatten(fl, container.querySelector("#hhFlattenReads"), FLATTEN_CASES.hh) : null;
    // Bordighera depuis un balcon près d'Antibes (2026-10-06, photo du propriétaire) : plan -> globe -> réfraction,
    // bâtiments OSM et terrain TINITALY (bordighera-anim.js ; données ~340 Ko, chargées à part)
    const bc = container.querySelector("#hhBord");
    if (bc) {
      const lang = document.documentElement.lang || "en", T = makeT(lang, KEY);
      const tv = (k, fb, vars = {}) => { let v = T(k); if (!v || v === k) v = fb; for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b); return v; };
      // la liste des scènes (scenes.js), au début de la rangée de la réglette ; changer de scène remplace le canvas
      // et la réglette par des copies neuves (leurs écouteurs partent avec) et remonte l'animation
      const ctl = container.querySelector(".hh-bord-ctl");
      let sel = null;
      if (ctl) {
        const wrap = document.createElement("span"); wrap.className = "hh-bord-scene";
        wrap.innerHTML = `<label for="hhBordScene">${tv("bd-scene", "Scene")}</label> <select id="hhBordScene">`
          + SCENES.map((x) => `<option value="${x.key}">${tv(x.label, x.fallback)}</option>`).join("") + "</select>";
        ctl.prepend(wrap); sel = wrap.querySelector("select");
      }
      const mountScene = (key) => {
        const sc = SCENES.find((x) => x.key === key) ?? SCENES[0];
        this._bordP = Promise.all([import("./bordighera-anim.js"), sc.load()]).then(([{ mountBordighera }, scene]) => {
          if (this._bord) {
            this._bord.dispose();
            for (const id of ["hhBord", "hhBordOp"]) { const el = container.querySelector("#" + id); el?.replaceWith(el.cloneNode(true)); }
          }
          this._bord = mountBordighera(container.querySelector("#hhBord"), container.querySelector("#hhBordReads"), tv, lang, container.querySelector("#hhBordOp"), scene);
          if (!container.hidden) this._bord.start();
        }).catch(() => {});
      };
      sel?.addEventListener("change", () => mountScene(sel.value));
      mountScene(sel?.value);
    }
    drawSymbols(KEY);
  },
  render() { draw(); this._flat?.start(); this._bord?.start(); },
  teardown() { stop(); this._flat?.stop(); this._bord?.stop(); },
};
