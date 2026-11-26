// Expérience 5 (le champ dans votre poche), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js). Dans
// l'onglet, la latitude magnétique venait de son curseur ; ici, son propre champ (45°, la valeur de départ de l'onglet).
// Le calcul est celui de mag/index.js (globeMag, flatMag de logic.js ; le plat le plus proche du globe cité, règle 2).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/mag.js";
import { globeMag, flatMag } from "./logic.js";
import { magLat2r, magSgn } from "./shared.js";

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
export const EXP = {
  "xp-mag-5": {
    html: (lang) => proseExp("mag", PROSE, "xp-mag-5", lang),
    wire(host, lang) {
      const t = makeT(lang, "mag"), out = host.querySelector("#exp5out"), v = host.querySelector("#exp5v");
      out.insertAdjacentHTML("beforebegin", `<div class="exp-inputs"><div class="field"><label for="exp5lat">λ (°)</label><input type="number" id="exp5lat" value="45" min="-89" max="89" step="1" /></div></div>`);
      const latIn = host.querySelector("#exp5lat");
      const upd = () => {
        const x = parseFloat(latIn.value), lat = Number.isFinite(x) ? Math.max(-89, Math.min(89, x)) : 45;
        const r = magLat2r(lat), g = globeMag(lat), f1 = flatMag(1, r), f2 = flatMag(2, r);
        out.innerHTML = fill(t("exp5out-tpl"), {
          lat: lat.toFixed(1), r: (r / 1000).toFixed(1),
          gI: magSgn(g.I), gB: g.B.toFixed(1), gH: g.H.toFixed(1),
          f1I: magSgn(f1.I), f1B: f1.B.toFixed(1), f1H: f1.H.toFixed(1),
          f2I: magSgn(f2.I), f2B: f2.B.toFixed(1), f2H: f2.H.toFixed(1),
        });
        v.innerHTML = fill(t("exp5v-tpl"), { diff: Math.min(Math.abs(g.I - f1.I), Math.abs(g.I - f2.I)).toFixed(0) });
      };
      latIn.addEventListener("input", upd);
      upd();
    },
  },
};
