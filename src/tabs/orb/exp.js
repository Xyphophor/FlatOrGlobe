// Expérience « l'ombre de midi » (l'inclinaison de l'axe par un gnomon), dans l'onglet falsify depuis le 2026-11-26
// (src/core/experiments.js) ; le calcul était dans orb/index.js (gnomon de logic.js).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/orb.js";
import { gnomon } from "./logic.js";

export const EXP = {
  "xp-orb-gno": {
    html: (lang) => proseExp("orb", PROSE, "xp-orb-gno", lang),
    wire(host, lang) {
      const t = makeT(lang, "orb"), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
      const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const q = (id) => host.querySelector("#" + id), out = q("orbGnoOut"), v = q("orbGnoV");
      const upd = () => {
        const L = +q("orbGnoL").value, a = +q("orbGnoS").value, b = +q("orbGnoW").value;
        if (!(L > 0 && a > 0 && b > a)) { out.textContent = ""; v.textContent = ""; return; }
        const g = gnomon(L, a, b);
        out.innerHTML = tr("orb-gno-out", "Noon altitudes {a}° and {b}° · tilt <b>ε = {e}°</b>").replace("{a}", nf(g.hj, 2)).replace("{b}", nf(g.hd, 2)).replace("{e}", nf(g.eps, 2));
        v.innerHTML = tr("orb-gno-v", "latitude φ = {p}° (accepted tilt: 23.44°)").replace("{p}", nf(g.lat, 2));
      };
      for (const id of ["orbGnoL", "orbGnoS", "orbGnoW"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
