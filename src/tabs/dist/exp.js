// Expérience 3 (distances), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) : le texte reste dans
// la prose de dist, le calcul est exp3 de logic.js.
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/dist.js";
import { exp3 } from "./logic.js";

export const EXP = {
  "xp-dist-3": {
    html: (lang) => proseExp("dist", PROSE, "xp-dist-3", lang),
    wire(host, lang) {
      const t = makeT(lang, "dist"), q = (id) => host.querySelector("#" + id);
      const el = { lat: q("exp3lat"), dl: q("exp3dl"), out: q("exp3out"), v: q("exp3v") };
      const num = (e, def) => { const v = parseFloat(e.value); return Number.isFinite(v) ? v : def; };
      const upd = () => {
        const lat = num(el.lat, 45), dl = Math.max(0.1, num(el.dl, 60)), r = exp3(lat, dl);
        const fmtk = (v) => Math.round(v).toLocaleString(lang) + " km";
        el.out.innerHTML = t("exp3-out").replace("{lat}", lat).replace("{dl}", dl)
          .replace("{globeKm}", fmtk(r.globe)).replace("{mirrorKm}", fmtk(r.mirror))
          .replace("{aeKm}", fmtk(r.ae)).replace("{aeMKm}", fmtk(r.aeM)).replace("{ratio}", r.ratio.toFixed(2));
        el.v.innerHTML = t("exp3-verdict").replace("{ratio2}", (r.aeM / r.ae).toFixed(1));
      };
      for (const e of [el.lat, el.dl]) e.addEventListener("input", upd);
      upd();
    },
  },
};
