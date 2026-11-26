// Expérience 1f (la gravité et le niveau), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) ; le
// calcul était updateExpGv de grav-legacy.js (formule internationale de gravité, grvIGF de logic.js).
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/grav.js";
import { grvIGF } from "./logic.js";

export const EXP = {
  "xp-grav-1f": {
    html: (lang) => proseExp("grav", PROSE, "xp-grav-1f", lang),
    wire(host) {
      const q = (id) => host.querySelector("#" + id);
      const num = (id, def) => { const v = parseFloat(q(id)?.value); return Number.isFinite(v) ? v : def; };
      const upd = () => {
        const out = q("expGvOut");
        const a = num("expGvA", 43.3), b = num("expGvB", 50.6);
        const L = Math.max(0.1, num("expGvL", 2)), M = Math.max(0.1, num("expGvM", 10));
        const gA = grvIGF(a), gB = grvIGF(b), dg = gB - gA;
        const rel = dg/gA;
        const TA = 2*Math.PI*Math.sqrt(L/gA), TB = 2*Math.PI*Math.sqrt(L/gB);
        const n100 = 100*Math.abs(TA - TB);
        const dm = 1000*M*Math.abs(rel);                                     // grams read on a force-reading balance
        out.innerHTML =
          `<div>Globe: g = <span class="g">${gA.toFixed(5)}</span> at ${a.toFixed(1)}\u00B0 and <span class="g">${gB.toFixed(5)} m/s\u00B2</span>
             at ${b.toFixed(1)}\u00B0 &nbsp;\u2192&nbsp; \u0394g = <b>${(Math.abs(dg)*1e5).toFixed(1)} mGal</b> (${(Math.abs(rel)*100).toFixed(4)}%)</div>
           <div>Every flat model: \u0394g = <span class="f">0.0 mGal</span>, at both places, exactly</div>
           <div>Pendulum of ${L.toFixed(2)} m: period ${TA.toFixed(5)} s vs ${TB.toFixed(5)} s &nbsp;\u2192&nbsp;
             <b>${n100.toFixed(2)} s</b> apart over 100 swings</div>
           <div>${M.toFixed(1)} kg on a force-reading balance: <b>${dm.toFixed(1)} g</b> difference</div>`;
        const ok = n100 > 0.05 || dm > 0.5;
        q("expGvV").innerHTML = ok
          ? `<b>Verdict rule.</b> If the two places really do differ, you will see it: ${n100.toFixed(2)} s over 100 swings is
             within reach of a phone timing the swings, and ${dm.toFixed(1)} g is readable on a 0.1 g balance. Measure a
             <em>difference of zero</em>, repeatably, with an instrument that can resolve this much, and the flat models win this
             test outright — no amount of curvature elsewhere would save the prediction.`
          : `<b>Verdict rule.</b> This pair is too close together to be diagnostic: ${n100.toFixed(2)} s over 100 swings and
             ${dm.toFixed(1)} g on the balance are below what ordinary kit resolves. Finding no difference here would prove
             nothing. Move the two latitudes apart, or lengthen the pendulum, until the numbers above clear your instrument.`;
      };
      for (const id of ["expGvA", "expGvB", "expGvL", "expGvM"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
