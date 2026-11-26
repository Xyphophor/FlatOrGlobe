// Expérience 1d (le pendule de Foucault), dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js) ; le
// calcul était updateExpF de fou-legacy.js (fonctions de logic.js).
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/fou.js";
import { FOU_OMEGA, FOU_G, fouRate, fouAiry, fouPeriod, fouSense, fouHrs } from "./logic.js";

export const EXP = {
  "xp-fou-1d": {
    html: (lang) => proseExp("fou", PROSE, "xp-fou-1d", lang),
    wire(host) {
      const q = (id) => host.querySelector("#" + id);
      const upd = () => {
        const out = q("expFout"), vd = q("expFv");
        const phi = parseFloat(q("expFlat").value), L = parseFloat(q("expFL").value);
        const a = parseFloat(q("expFa").value), bcm = parseFloat(q("expFb").value);
        const t = parseFloat(q("expFt").value);
        if(![phi, L, a, bcm, t].every(isFinite) || L <= 0 || a <= 0 || t <= 0){ out.innerHTML = ""; vd.innerHTML = ""; return; }
        const rate = fouRate(phi), aRate = fouAiry(a, bcm / 100, L);
        const T0 = 2 * Math.PI * Math.sqrt(L / FOU_G);
        const ratio = Math.abs(rate) < 1e-6 ? Infinity : Math.abs(aRate / rate);
        // the ellipse width that would keep Airy at 10% of the signal
        const b10 = 0.10 * Math.abs(rate) * L * L / (0.375 * a * Math.sqrt(FOU_G / L) * (180 / Math.PI) * 3600) * 100;
        out.innerHTML =
          `Pendulum period T₀ = 2π√(L/g) = <b>${T0.toFixed(2)} s</b> · ${Math.round(t * 3600 / T0).toLocaleString("en-US")} swings in ${t} h<br>` +
          `<span class="g">Globe predicts:</span> <b>${rate.toFixed(3).replace("-", "−")} °/h</b> ${fouSense(phi)} · ` +
          `full turn in ${fouHrs(fouPeriod(phi))} · <b>${(rate * t).toFixed(1).replace("-", "−")}°</b> in ${t} h<br>` +
          `<span class="f">Flat disc predicts:</span> ${FOU_OMEGA.toFixed(3)} °/h · <b>${(FOU_OMEGA * t).toFixed(1)}°</b> in ${t} h<br>` +
          `<span class="f">Flat, not rotating:</span> 0.0° in ${t} h, and in any other number of hours<br>` +
          `Airy ellipse precession = <b>${aRate.toFixed(3)} °/h</b> — ` +
          (isFinite(ratio) ? `${(ratio * 100).toFixed(0)}% of the globe signal` : "infinitely larger than a zero signal") +
          `<br>Ellipse you can tolerate for a 10% error: <b>${b10 < 0.01 ? "&lt; 0.01" : b10.toFixed(2)} cm</b> half-width`;
        let v;
        const gap = Math.abs(FOU_OMEGA - rate) * t;
        if(Math.abs(phi) < 2){
          v = `<b>You are on the equator, which is the one place this is hardest and most decisive.</b> The globe predicts ` +
              `essentially no precession at all, the spinning disc predicts a full ${(FOU_OMEGA * t).toFixed(0)}° in ${t} h. ` +
              `You do not need precision here — you need only to establish that nothing happens, which is a much easier ` +
              `measurement, and it falsifies the disc outright.`;
        } else if(ratio > 0.5){
          v = `<b>Your ellipse would dominate.</b> Airy's term is ${(ratio * 100).toFixed(0)}% of the signal at this wire ` +
              `length, so a single run tells you nothing. Two fixes, in order of effect: lengthen the wire — the Airy rate ` +
              `falls as L<sup>−5/2</sup>, so doubling L divides it by ${Math.pow(2, 2.5).toFixed(1)} — and release with a ` +
              `burnt thread so b stays under ${b10 < 0.01 ? "a hundredth of a centimetre" : b10.toFixed(2) + " cm"}. ` +
              `Failing both, alternate the ellipse direction between runs and average: Airy reverses, the Earth does not.`;
        } else {
          v = `<b>This is a viable site.</b> Airy's term sits at ${(ratio * 100).toFixed(0)}% of the signal, so after ${t} h ` +
              `the globe says the plane has turned ${Math.abs(rate * t).toFixed(1)}° ${fouSense(phi)} while a disc spinning ` +
              `once a day says ${(FOU_OMEGA * t).toFixed(1)}° — a gap of ${gap.toFixed(0)}°, far larger than anything a ` +
              `chalk mark can blur. Run it twice with opposite ellipses and average, and the residue is the Earth.`;
        }
        vd.innerHTML = v;
      };
      for (const id of ["expFlat", "expFL", "expFa", "expFb", "expFt"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
