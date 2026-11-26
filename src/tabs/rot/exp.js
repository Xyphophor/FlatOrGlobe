// Expérience « le jour sidéral », dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) ; le calcul était
// dans rot/index.js (siderealDay de logic.js ; les champs sont du texte hh:mm:ss).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/rot.js";
import { siderealDay } from "./logic.js";

const sec = (s) => { const m = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(s).trim()); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : NaN; };
const hms = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h} h ${m} min ${(s % 60).toFixed(1)} s`; };
export const EXP = {
  "xp-rot-sid": {
    html: (lang) => proseExp("rot", PROSE, "xp-rot-sid", lang),
    wire(host, lang) {
      const t = makeT(lang, "rot"), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
      const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const q = (id) => host.querySelector("#" + id);
      for (const id of ["rotT1", "rotT2"]) { const el = q(id); el.type = "text"; el.inputMode = "numeric"; }
      const out = q("rotSidOut"), v = q("rotSidV");
      const upd = () => {
        const t1 = sec(q("rotT1").value), t2r = sec(q("rotT2").value), n = Math.round(+q("rotN").value);
        if (!isFinite(t1) || !isFinite(t2r) || !(n >= 1)) { out.textContent = ""; v.textContent = ""; return; }
        const r = siderealDay(t1, t2r + n * 86400, n);
        out.innerHTML = tr("rot-sid-out", "One turn: <b>{T}</b> · {a} s earlier each night · {y} turns a year").replace("{T}", hms(r.sid)).replace("{a}", nf(r.advance, 1)).replace("{y}", nf(r.turnsPerYear, 2));
        v.innerHTML = tr("rot-sid-v", "Ω = {w} × 10⁻⁵ rad/s (stars: 7.292)").replace("{w}", nf(r.omega * 1e5, 3));
      };
      for (const id of ["rotT1", "rotT2", "rotN"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
