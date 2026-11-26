// Les deux expériences du crépuscule, dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) : le HTML
// et le calcul (_experiment) viennent de twi/index.js, textes dans src/i18n/<langue>/twi.json.
import { makeT } from "../../core/i18n.js";
import { twiExperiment } from "./logic.js";

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
export const EXP = {
  "xp-twi-1": {
    html(lang) {
      const t = makeT(lang, "twi");
      return `<div class="exp">
        <div class="exp-h">${t("tw-exph")}</div><div class="exp-t">${t("tw-expt")}</div>
        <p class="exp-lead">${t("tw-explead")}</p>
        <div class="exp-grid"><div class="exp-var iv">${t("tw-expiv")}</div><div class="exp-var dv">${t("tw-expdv")}</div></div>
        <p class="exp-meta">${t("tw-expmeta")}</p>
        <div class="exp-calc">
          <div class="exp-inputs">
            <div class="field"><label for="expTwLat">${t("tw-lbl1")}</label><input type="number" id="expTwLat" value="48.86" min="-89" max="89" step="0.01"></div>
            <div class="field"><label for="expTwDec">${t("tw-lbl2")}</label><input type="number" id="expTwDec" value="23.44" min="-23.44" max="23.44" step="0.01"></div>
          </div>
          <div class="exp-out" id="expTwOut"></div><div class="exp-verdict" id="expTwVerd"></div>
        </div>
      </div>`;
    },
    wire(host, lang) {
      const t = makeT(lang, "twi"), q = (id) => host.querySelector("#" + id);
      const e = { lat: q("expTwLat"), dec: q("expTwDec"), out: q("expTwOut"), verd: q("expTwVerd") };
      const upd = () => {
        const phi = parseFloat(e.lat.value), dec = parseFloat(e.dec.value);
        if (!isFinite(phi) || !isFinite(dec)) { e.out.textContent = "—"; return; }
        const r = twiExperiment(phi, dec);
        const f = (o) => (o.all ? t("exp-never-ends") : o.none ? t("exp-no-rise") : Math.round(o.min) + " min");
        const m = r.midnight.toFixed(2).replace("-", "−");
        e.out.innerHTML = fill(t("exp-out-tpl"), { c: f(r.civil), n: f(r.naut), a: f(r.astro), t: f(r.total), m, thr18: r.thr18.toFixed(1), thr12: r.thr12.toFixed(1), thr6: r.thr6.toFixed(1) });
        e.verd.innerHTML = r.astro.all
          ? fill(t("exp-verd-all-tpl"), { phi: Math.abs(phi).toFixed(2), dec: dec.toFixed(2), m })
          : fill(t("exp-verd-tpl"), { t: f(r.total), c: f(r.civil), dlat: (r.thr18 - Math.abs(phi)).toFixed(1) });
      };
      e.lat.addEventListener("input", upd); e.dec.addEventListener("input", upd);
      upd();
    },
  },
  "xp-twi-2": {
    html(lang) {
      const t = makeT(lang, "twi");
      return `<div class="exp">
        <div class="exp-h">${t("tw2-exph")}</div><div class="exp-t">${t("tw2-expt")}</div>
        <p class="exp-lead">${t("tw2-explead")}</p>
        <div class="exp-grid"><div class="exp-var iv">${t("tw2-expiv")}</div><div class="exp-var dv">${t("tw2-expdv")}</div></div>
        <p class="exp-meta">${t("tw2-expmeta")}</p><p class="exp-meta">${t("tw2-expverd")}</p>
      </div>`;
    },
  },
};
