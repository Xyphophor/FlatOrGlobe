// Expérience 8 (lire le ciel avec une application gratuite), dans l'onglet falsify depuis le 2026-11-26
// (src/core/experiments.js). Dans l'onglet, la sortie portait le nombre de satellites en vue dans sa scène animée ; ici,
// la fourchette (8–12) et la latitude de départ de l'onglet (45°), comme l'onglet avant que sa scène tourne.
import { proseExp } from "../../core/experiments.js";
import { PROSE } from "../../data/prose/gps.js";

export const EXP = {
  "xp-gps-8": {
    html: (lang) => proseExp("gps", PROSE, "xp-gps-8", lang),
    wire(host) {
      const out = host.querySelector("#exp8out"), v = host.querySelector("#exp8v");
      out.innerHTML =
        `<span class="g">globe → at φ = +45°: 8–12 satellites above your horizon, ` +
        `every one rising or setting, ranges pinned to the 20,200–25,800 km window, tomorrow's sky 4 min early</span><br>` +
        `<span class="f">flat towers → a frozen constellation: fixed azimuths and elevations forever, no sidereal ` +
        `slip, range window broken open</span>`;
      v.innerHTML =
        `<b>Verdict rule:</b> if two screenshots an hour apart show the same satellites parked at the same spots, ` +
        `fixed emitters win. If the sky has turned over — new birds risen, old ones set, the whole pattern shifted ` +
        `along tracks the almanac predicted days ago — you are watching orbital mechanics around a rotating sphere, ` +
        `measured with a free app on a device that proves it by knowing where you are.`;
    },
  },
};
