// Expérience 2 (navigation céleste), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js). L'onglet
// prenait la hauteur des étoiles du plat sur son curseur cnH ; ici, sa valeur de départ (5 000 km).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/cnav.js";
import { exp2, exp2At } from "./logic.js";

const H_KM = 5000;
export const EXP = {
  "xp-cnav-2": {
    html: (lang) => proseExp("cnav", PROSE, "xp-cnav-2", lang),
    wire(host, lang) {
      const t = makeT(lang, "cnav"), q = (id) => host.querySelector("#" + id);
      const d0 = q("exp2d"), lat0 = q("exp2lat"), out = q("exp2out"), v = q("exp2v");
      const upd = () => {
        const d = Number(d0.value) || 300, lat = Number(lat0.value) || 45, r = exp2(d, lat, H_KM);
        out.innerHTML = t("exp2-out").replace("{d}", d).replace("{lat}", lat)
          .replace("{flat}", r.flat.toFixed(3)).replace("{globe}", r.globe.toFixed(3))
          .replace("{diff}", r.diff.toFixed(3)).replace("{diffArcmin}", (r.diff * 60).toFixed(0));
        const at15 = exp2At(15, d, H_KM), at60 = exp2At(60, d, H_KM);
        v.innerHTML = t("exp2-verdict").replace("{globe}", r.globe.toFixed(3)).replace("{d}", d)
          .replace("{at15}", at15.toFixed(3)).replace("{at60}", at60.toFixed(3));
      };
      for (const e of [d0, lat0]) e.addEventListener("input", upd);
      upd();
    },
  },
};
