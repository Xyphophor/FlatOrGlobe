// Expérience 7 (le nivellement au-dessus de l'eau), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) ;
// la sortie était écrite par survTables de surv-legacy.js (courbure et réfraction combinées, k = 0,13).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/surv.js";
import { SURV_R, SURV_K } from "./logic.js";

const survCR = (dkm) => (1 - SURV_K) * dkm * dkm / (2 * SURV_R) * 1000;   // m, avec la réfraction standard
export const EXP = {
  "xp-surv-7": {
    html: (lang) => proseExp("surv", PROSE, "xp-surv-7", lang),
    wire(host, lang) {
      const t = makeT(lang, "surv");
      host.querySelector("#exp7out").innerHTML = t("exp7-out").replace("{list}",
        [0.2, 0.5, 1, 2, 5].map((d) => `${d < 1 ? d * 1000 + " m" : d + " km"}: <b>${(survCR(d) * 100).toFixed(1)} cm</b>`).join(" · "));
      host.querySelector("#exp7v").innerHTML = t("exp7-verd");
    },
  },
};
