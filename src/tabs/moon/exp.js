// Expérience « la Lune contre les étoiles » (le rayon par la parallaxe lunaire), dans l'onglet falsify depuis le
// 2026-11-26 (src/core/experiments.js) ; le calcul était dans moon/index.js (radiusFromParallax de logic.js).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/moon.js";
import { radiusFromParallax } from "./logic.js";

export const EXP = {
  "xp-moon-par": {
    html: (lang) => proseExp("moon", PROSE, "xp-moon-par", lang),
    wire(host, lang) {
      const t = makeT(lang, "moon"), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
      const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const q = (id) => host.querySelector("#" + id), out = q("moonParOut"), v = q("moonParV");
      const upd = () => {
        const pi = +q("moonPi").value, g = +q("moonG").value;
        if (!(pi > 0 && g > 0)) { out.textContent = ""; v.textContent = ""; return; }
        const R = radiusFromParallax(g, pi / 60, 27.321661);
        out.innerHTML = tr("moon-par-out", "R = <b>{R} km</b>").replace("{R}", nf(R, 0));
        v.innerHTML = tr("moon-par-v", "1 % on π moves R by 3 %: {lo}–{hi} km for ±1 %").replace("{lo}", nf(radiusFromParallax(g, pi * 0.99 / 60, 27.321661), 0)).replace("{hi}", nf(radiusFromParallax(g, pi * 1.01 / 60, 27.321661), 0));
      };
      for (const id of ["moonPi", "moonG"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
