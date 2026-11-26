// Expérience 1e (une paire de coordonnées, deux géométries), dans l'onglet falsify depuis le 2026-11-26
// (src/core/experiments.js) ; le calcul était updateExpS de seis-legacy.js (fonctions de logic.js).
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/seis.js";
import { seisDelta, seisFlatKm, seisHMS, SEIS_KM_PER_DEG } from "./logic.js";

export const EXP = {
  "xp-seis-1e": {
    html: (lang) => proseExp("seis", PROSE, "xp-seis-1e", lang),
    wire(host) {
      const q = (id) => host.querySelector("#" + id);
      const upd = () => {
        const out = q("expSout"), vd = q("expSverd");
        const la1 = parseFloat(q("expSlat").value), lo1 = parseFloat(q("expSlon").value);
        const la2 = parseFloat(q("expTlat").value), lo2 = parseFloat(q("expTlon").value);
        const v = parseFloat(q("expSv").value);
        if(![la1, lo1, la2, lo2, v].every(isFinite) || v <= 0){ out.innerHTML = ""; vd.innerHTML = ""; return; }
        const dg = seisDelta(la1, lo1, la2, lo2), kmG = dg * SEIS_KM_PER_DEG;
        const kmF = seisFlatKm(la1, lo1, la2, lo2);
        const tG = kmG / v, tF = kmF / v, err = kmG > 0 ? kmF / kmG - 1 : 0;
        out.innerHTML =
          `Great-circle separation Δ = <b>${dg.toFixed(2)}°</b><br>` +
          `<span class="g">Globe:</span> <b>${Math.round(kmG).toLocaleString("en-US")} km</b> → surface wave at ` +
            `<b>${seisHMS(tG)}</b> after origin time<br>` +
          `<span class="f">Flat map:</span> <b>${Math.round(kmF).toLocaleString("en-US")} km</b> → surface wave at ` +
            `<b>${seisHMS(tF)}</b><br>` +
          `Disagreement <b>${err >= 0 ? "+" : "−"}${Math.abs(err * 100).toFixed(0)}%</b> in distance, ` +
            `<b>${tF >= tG ? "+" : "−"}${seisHMS(Math.abs(tF - tG))}</b> in arrival time`;
        let msg;
        if(dg < 5){
          msg = `<b>Too close to separate the models.</b> At ${dg.toFixed(1)}° the two geometries differ by less than a ` +
                `minute, which no picking method will resolve. Pick a station on another continent.`;
        } else if(Math.abs(err) < 0.05){
          msg = `<b>This pair is nearly blind.</b> The flat map happens to be almost right along this path — which it is, ` +
                `for anything running roughly radially from the north pole. Not evidence for the flat map, just a path that ` +
                `does not test it. Add a southern-hemisphere station and the gap opens up immediately.`;
        } else {
          msg = `<b>This pair is diagnostic.</b> The two models disagree by ${seisHMS(Math.abs(tF - tG))} on a single ` +
                `arrival — far beyond any picking error, any dispersion correction and any plausible variation in wave ` +
                `speed. One trace from this station settles it, and the trace is free. Note which way it goes: the flat map ` +
                `puts the station ${err > 0 ? "further away" : "closer"} than the sphere does, so it predicts an arrival ` +
                `${err > 0 ? "late" : "early"} by that much.`;
        }
        vd.innerHTML = msg;
      };
      for (const id of ["expSlat", "expSlon", "expTlat", "expTlon", "expSv"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
