// Les deux expériences de l'onglet sun (6 : la hauteur du Soleil à midi ; 6b), dans l'onglet falsify depuis le
// 2026-11-26 (src/core/experiments.js) : le HTML vient de sun/index.js, textes dans src/i18n/<langue>/sun.json. Dans
// l'onglet, la latitude de l'expérience 6 était celle de son curseur ; ici, son propre champ (45°, sa valeur de départ).
import { makeT } from "../../core/i18n.js";
import { magSgn } from "../mag/shared.js";
import { sunTableRows } from "./logic.js";

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
export const EXP = {
  "xp-sun-6": {
    html(lang) {
      const t = makeT(lang, "sun");
      return `<div class="exp">
        <div class="exp-h">${t("exp-h")}</div>
        <div class="exp-t">${t("exp-t")}</div>
        <p class="exp-lead">${t("exp-lead")}</p>
        <div class="exp-grid"><div class="exp-var iv">${t("exp-iv")}</div><div class="exp-var dv">${t("exp-dv")}</div></div>
        <p class="exp-meta">${t("exp-meta")}</p>
        <div class="exp-calc"><div class="exp-inputs"><div class="field"><label for="exp6lat">φ (°)</label><input type="number" id="exp6lat" value="45" min="-89" max="89" step="1" /></div></div>
          <div class="exp-out" id="exp6out"></div><div class="exp-verdict" id="exp6v"></div></div>
      </div>`;
    },
    wire(host, lang) {
      const t = makeT(lang, "sun"), q = (id) => host.querySelector("#" + id);
      const upd = () => {
        const x = parseFloat(q("exp6lat").value), lat = Number.isFinite(x) ? Math.max(-89, Math.min(89, x)) : 45, T = sunTableRows(lat);
        q("exp6out").innerHTML = fill(t("exp6out-tpl"), { lat: magSgn(lat), gAlt: T.june.globe.toFixed(1), fAlt: T.june.flat.toFixed(1), ratio: T.ratio.toFixed(1), minAlt: T.minAlt.toFixed(1) });
        q("exp6v").innerHTML = t("exp6v");
      };
      q("exp6lat").addEventListener("input", upd);
      upd();
    },
  },
  "xp-sun-6b": {
    html(lang) {
      const t = makeT(lang, "sun");
      return `<div class="exp">
        <div class="exp-h">${t("sn2-h")}</div>
        <div class="exp-t">${t("sn2-t")}</div>
        <p class="exp-lead">${t("sn2-lead")}</p>
        <div class="exp-grid"><div class="exp-var iv">${t("sn2-iv")}</div><div class="exp-var dv">${t("sn2-dv")}</div></div>
        <p class="exp-meta">${t("sn2-meta")}</p>
        <p class="exp-meta">${t("sn2-metab")}</p>
        <p class="exp-meta">${t("sn2-metac")}</p>
        <p class="exp-meta">${t("sn2-metad")}</p>
        <p class="exp-meta">${t("sn2-verd")}</p>
      </div>`;
    },
  },
};
