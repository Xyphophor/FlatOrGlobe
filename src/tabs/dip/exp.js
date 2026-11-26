// Expériences 4 (abaissement de l'horizon) et 4b (le double coucher), dans l'onglet falsify depuis le 2026-11-26
// (src/core/experiments.js) ; les calculs étaient _exp4 et _expDb de dip/index.js. L'expérience 4 lisait la hauteur
// réglée plus haut dans l'onglet : elle a ici son propre champ (100 m, la valeur de départ de l'onglet).
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/dip.js";
import { DIP_K, DIP_R0, dipAngle, dipSetRate } from "./logic.js";

const R2D = 180 / Math.PI;
const thou = (x) => x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmtDist = (m) => m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1) + " km" : m.toFixed(0) + " m";
const dipHm = (h) => (h < 10 ? h.toFixed(1) : Math.round(h).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + " m";
const num = (el, def) => { const v = parseFloat(el.value); return Number.isFinite(v) ? v : def; };

export const EXP = {
  "xp-dip-4": {
    html: (lang) => proseExp("dip", PROSE, "xp-dip-4", lang),
    wire(host) {
      const out = host.querySelector("#exp4out"), v = host.querySelector("#exp4v");
      out.insertAdjacentHTML("beforebegin", `<div class="exp-inputs"><div class="field"><label for="exp4h">h (m)</label><input type="number" id="exp4h" value="100" min="0.5" step="any" /></div></div>`);
      const hIn = host.querySelector("#exp4h");
      const upd = () => {
        const h = Math.max(0.5, num(hIn, 100)), R = 6371000;
        const geo = Math.acos(R / (R + h)) * R2D, ref = Math.acos((R / (1 - DIP_K)) / ((R / (1 - DIP_K)) + h)) * R2D;
        out.innerHTML = `IV  h = ${fmtDist(h)}<br>` +
          `DV  <span class="f">flat prediction: dip = 0.0′ = 0.000°</span><br>` +
          `DV  <span class="g">globe prediction: dip = ${(ref * 60).toFixed(1)}′ = ${ref.toFixed(3)}° (with refraction)</span><br>` +
          `&nbsp;&nbsp;&nbsp; geometric, no refraction: ${(geo * 60).toFixed(1)}′ · rule of thumb 1.76′×√h = ${(1.76 * Math.sqrt(h)).toFixed(1)}′`;
        v.innerHTML = `<b>Verdict rule:</b> a single non-zero dip, repeated and larger from higher up, refutes the flat model outright — ` +
          `there is no value of any parameter that turns zero into ${(ref * 60).toFixed(1)}′. And because the globe predicts ` +
          `dip ∝ √h, plotting your readings against √h should give a straight line whose slope hands you the Earth's radius.`;
      };
      hIn.addEventListener("input", upd);
      upd();
    },
  },
  "xp-dip-4b": {
    html: (lang) => proseExp("dip", PROSE, "xp-dip-4b", lang),
    wire(host) {
      const q = (id) => host.querySelector("#" + id);
      const $ = { a: q("expDbA"), b: q("expDbB"), lat: q("expDbLat"), t: q("expDbT"), out: q("expDbOut"), v: q("expDbV") };
      const upd = () => {
        const h1 = Math.max(0.05, num($.a, 1.2)), h2 = Math.max(h1 + 0.01, num($.b, 6));
        const lat = num($.lat, 52), tObs = Math.max(0.05, num($.t, 16));
        const Rr = DIP_R0 / (1 - DIP_K), rate = dipSetRate(lat);
        const dd = (dipAngle(Rr, h2) - dipAngle(Rr, h1)) * R2D, pred = dd / rate * 3600;
        const ddObs = rate * (tObs / 3600) * Math.PI / 180;
        const Reff = 2 * Math.pow(Math.sqrt(h2) - Math.sqrt(h1), 2) / (ddObs * ddObs);
        $.out.innerHTML =
          `<div>Dip at ${dipHm(h1)}: <span class="g">${(dipAngle(Rr, h1) * R2D * 60).toFixed(2)}′</span>
             &nbsp;·&nbsp; at ${dipHm(h2)}: <span class="g">${(dipAngle(Rr, h2) * R2D * 60).toFixed(2)}′</span>
             &nbsp;→&nbsp; Δδ = <b>${(dd * 60).toFixed(2)}′</b></div>
           <div>Globe predicts a delay of <span class="g">${pred >= 90 ? (pred / 60).toFixed(1) + " min" : pred.toFixed(1) + " s"}</span>
             at ${lat.toFixed(1)}° &nbsp;·&nbsp; flat plane predicts <span class="f">0.0 s</span></div>
           <div>Your ${tObs.toFixed(1)} s, inverted: Rₑff = <b>${thou(Reff / 1000)} km</b>,
             i.e. R = <b>${thou(Reff * (1 - DIP_K) / 1000)} km</b> after removing k = ${DIP_K}</div>`;
        $.v.innerHTML =
          `<b>Verdict rule.</b> The flat prediction is that the second sunset never happens: raise your eye and the Sun stays gone,
           because the vanishing line does not move. Time a delay of <b>0 s</b>, repeatably, from a height difference big enough
           that the globe predicts ${pred >= 90 ? (pred / 60).toFixed(1) + " min" : pred.toFixed(0) + " s"}, and the globe prediction is refuted.
           Conversely a delay that tracks √h₂ − √h₁ across several height pairs, and returns the same R each
           time, is a measurement no flat arrangement reproduces. Expect scatter: coastal air can shift the dip by minutes of arc,
           so repeat it and take the open sea over a river mouth.`;
      };
      for (const el of [$.a, $.b, $.lat, $.t]) el.addEventListener("input", upd);
      upd();
    },
  },
};
