// Expérience 1c (la réfraction par les distances zénithales réciproques), dans l'onglet falsify depuis le 2026-11-26
// (src/core/experiments.js) ; le calcul était _updateExpR de ref/index.js (reciprocalK de logic.js).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/ref.js";
import { REF_R, reciprocalK } from "./logic.js";

const DEG = (r) => r * 180 / Math.PI;
const refFmtKm = (m) => (m / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " km";
export const EXP = {
  "xp-ref-1c": {
    html: (lang) => proseExp("ref", PROSE, "xp-ref-1c", lang),
    wire(host, lang) {
      const t = makeT(lang, "ref"), q = (id) => host.querySelector("#" + id);
      const e = { zA: q("expRzA"), zB: q("expRzB"), s: q("expRs"), out: q("expRout"), v: q("expRv") };
      const upd = () => {
        const zA = parseFloat(e.zA.value), zB = parseFloat(e.zB.value), sKm = parseFloat(e.s.value);
        if (!isFinite(zA) || !isFinite(zB) || !isFinite(sKm) || sKm <= 0) { e.out.innerHTML = ""; e.v.innerHTML = ""; return; }
        const { gammaDeg, sum, exc, k, Reff } = reciprocalK(zA, zB, sKm);
        const am = (d) => (d * 60).toFixed(2) + "′";
        const sign = exc >= 0 ? "+" : "−";
        e.out.innerHTML =
          t("expR-central-angle").replace("{deg}", gammaDeg.toFixed(4)).replace("{am}", am(gammaDeg)) + "<br>" +
          t("expR-measured-sum").replace("{sum}", sum.toFixed(4)) + "<br>" +
          t("expR-plane-predicts") + "<br>" +
          t("expR-globe-predicts") + "<br>" +
          t("expR-excess").replace("{sign}", sign).replace("{exc}", Math.abs(exc).toFixed(4)).replace("{sign2}", sign).replace("{am}", am(Math.abs(exc))) + "<br>" +
          t("expR-coeff").replace("{k}", k.toFixed(3)) +
          (isFinite(Reff) ? t("expR-reff").replace("{km}", refFmtKm(Reff)).replace("{ratio}", (Reff / REF_R).toFixed(3)) : t("expR-reff-inf"));
        let v;
        if (exc > 1e-6) {
          const plaus = (k > -0.1 && k < 0.6)
            ? t("expR-plaus-ok").replace("{k}", k.toFixed(3))
            : t("expR-plaus-bad").replace("{k}", k.toFixed(3));
          v = t("expR-verd-exceeds").replace("{am}", am(exc)).replace("{plaus}", plaus);
        } else if (Math.abs(exc) <= 1e-6) {
          v = t("expR-verd-exact").replace("{am}", am(DEG(100000 / REF_R) * 0.87));
        } else {
          v = t("expR-verd-below");
        }
        e.v.innerHTML = v;
      };
      for (const k of ["zA", "zB", "s"]) e[k].addEventListener("input", upd);
      upd();
    },
  },
};
