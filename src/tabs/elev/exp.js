// Expérience 1 (angles d'élévation), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) ; le calcul
// était updateExp1 de elev-legacy.js.
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/elev.js";

export const EXP = {
  "xp-elev-1": {
    html: (lang) => proseExp("elev", PROSE, "xp-elev-1", lang),
    wire(host, lang) {
      const t = makeT(lang, "elev"), q = (id) => host.querySelector("#" + id);
      const din = q("exp1d"), out = q("exp1out"), v = q("exp1v");
      const upd = () => {
        const x = parseFloat(din.value), R = 6371, d = Math.max(0.001, Number.isFinite(x) ? x : 10);
        const th = (d / R) * (180 / Math.PI), arcsec = th * 3600, arcmin = th * 60;
        out.innerHTML = t("exp1-iv").replace("{d}", d) + "<br>" +
          `DV&nbsp; <span class="f">` + t("exp1-dv-flat") + `</span><br>` +
          `DV&nbsp; <span class="g">` + t("exp1-dv-globe").replace("{v}", (180 + th).toFixed(6)) + `</span><br>` +
          `&nbsp;&nbsp;&nbsp; ` + t("exp1-diff").replace("{v}", arcmin < 1 ? arcsec.toFixed(1) + "″" : arcmin.toFixed(2) + "′");
        const detect = arcsec > 60 ? t("exp1-detect-easy") : arcsec > 5 ? t("exp1-detect-hard") : t("exp1-detect-none");
        v.innerHTML = t("exp1-verd").replace("{d}", d).replace("{detect}", detect);
      };
      din.addEventListener("input", upd);
      upd();
    },
  },
};
