// Expérience 1b (balayage de la hauteur de l'œil), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) ;
// le calcul était updateHiddenSweep de hh-legacy.js (rayon et k du réglage commun de la page, core/settings.js).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { getSettings } from "../../core/settings.js";
import { hiddenHeight } from "../../core/math.js";
import { PROSE } from "../../data/prose/hh.js";

const hhM = (x) => (x >= 1000 ? (x / 1000).toFixed(2) + " km" : x.toFixed(1) + " m");
export const EXP = {
  "xp-hh-1b": {
    html: (lang) => proseExp("hh", PROSE, "xp-hh-1b", lang),
    wire(host, lang) {
      const t = makeT(lang, "hh"), q = (id) => host.querySelector("#" + id);
      const eIn = q("hhSweepE"), dIn = q("hhSweepD"), out = q("hhSweepOut"), v = q("hhSweepV");
      const num = (el, def) => { const x = parseFloat(el.value); return Number.isFinite(x) ? x : def; };
      const upd = () => {
        const { R: Rkm, k: k0 } = getSettings(), R = Rkm * 1000, k = Number.isFinite(k0) && k0 >= 0 && k0 < 1 ? k0 : 0.13, Rg = R / (1 - k);
        const e = Math.max(0, num(eIn, 2)), d = Math.max(1, num(dIn, 37) * 1000);
        const H = hiddenHeight(R, e, d), Hr = hiddenHeight(Rg, e, d);
        const rungs = [...new Set([0.5, 2, 25, 100, 515, 1695, e])].sort((a, b) => a - b);
        const ladder = rungs.map((x) => { const cell = `${x} m → ${hhM(hiddenHeight(R, x, d))}`; return x === e ? `<b>${cell}</b>` : cell; }).join(" &nbsp;·&nbsp; ");
        const first = hiddenHeight(R, rungs[0], d), last = hiddenHeight(R, rungs[rungs.length - 1], d);
        out.innerHTML = t("sweep-iv").replace("{e}", e).replace("{d}", (d / 1000).toFixed(2)) + "<br>" +
          `DV&nbsp; <span class="f">` + t("sweep-dv-flat") + `</span><br>` +
          `DV&nbsp; <span class="g">` + t("sweep-dv-globe").replace("{H}", hhM(H)).replace("{Hr}", hhM(Hr)).replace("{k}", k.toFixed(2)) + `</span><br>` +
          `&nbsp;&nbsp;&nbsp; ` + t("sweep-ladder-intro").replace("{ladder}", ladder) + `<br>` +
          `&nbsp;&nbsp;&nbsp; ` + t("sweep-climb").replace("{delta}", hhM(Math.max(0, first - last)));
        v.innerHTML = t("sweep-verdict");
      };
      for (const el of [eIn, dIn]) el.addEventListener("input", upd);
      upd();
    },
  },
};
