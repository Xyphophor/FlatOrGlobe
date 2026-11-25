// Onglet "avia" (epic14) -- l'aviation sur une Terre courbe. Onglet NOUVEAU,
// pas un port du legacy (demande du propriétaire du 2026-09-28 : « voler à
// niveau », le gyroscope, les vols long-courriers ; de nouvelles
// animations). Prose anglaise source dans src/data/prose/avia.js, calculs
// purs et testés dans logic.js, vols réels (FlightAware) générés par
// `fog build avia-flights` (tools/) dans src/data/presets/avia-flights.js.
// Figures canvas 2D (pas de WebGL2 chez le propriétaire) : level.js,
// scale.js, eot.js, eotfit.js (Eötvös, données GRAV-D : la balance, les trois corrections, Ω et R), gyro.js (conservateurs de cap, gyrocompas),
// schuler.js, gjt.js, race.js, springs.js, world.js (tours du monde) ; table.js. Les nombres du texte sont calculés (values.js).
// Neuf schémas SVG de formules (formfigs.js), un par bloc formule, dessinés au montage.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/avia.js";
import { SOURCES, READING } from "../../data/sources/avia.js";
import { proseValues } from "./values.js";
import { mountLevel } from "./level.js";
import { mountForces } from "./forces.js";
import { mountDG, mountGC } from "./gyro.js";
import { mountSchuler } from "./schuler.js";
import { mountGJT } from "./gjt.js";
import { mountRace } from "./race.js";
import { mountSprings } from "./springs.js";
import { mountBearings } from "./bearings.js";
import { mountEot } from "./eot.js";
import { mountEotScale } from "./scale.js";
import { mountEotFit } from "./eotfit.js";
import { mountEotK } from "./eotk.js";
import { mountRadius } from "./radius.js";
import { mountCsv } from "./table.js";
import { mountWorld, fillWorldTable } from "./world.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountAviaReel } from "./reel.js";
import { mountAviaMesh, aviaMeshValues } from "./meshfig.js";
import "./style.css";

const KEY = "avia";

export default {
  key: KEY,
  label: "Aviation",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY);
    const tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(lang, KEY) });
    const vals = proseValues(tr);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    mountCsv(container.querySelector("#aviaCsv"));
    fillWorldTable(container.querySelector("#aviaWorldTb"), tr);
    drawFormulaFigs(container, tr, vals);   // avant renderTexIn (main.js) : les libellés TeX des schémas
    const has = (id) => !!container.querySelector(`#${id}`);
    this._figs = [
      has("aviaLevel") && mountLevel(container, tr),
      has("aviaForces") && mountForces(container, tr),
      has("aviaEotScale") && mountEotScale(container, tr),
      has("aviaEot") && mountEot(container, tr),
      has("aviaEotK") && mountEotK(container, tr),
      has("aviaEotFit") && mountEotFit(container, tr),
      has("aviaDG") && mountDG(container, tr),
      has("aviaGC") && mountGC(container, tr),
      has("aviaSchuler") && mountSchuler(container, tr),
      has("aviaGJT") && mountGJT(container, tr),
      has("aviaRace") && mountRace(container, tr),
      has("aviaSprings") && mountSprings(container, tr),
      has("aviaBearings") && mountBearings(container, tr),
      has("aviaRadius") && mountRadius(container, tr),
      has("aviaWorld") && mountWorld(container, tr),
    ].filter(Boolean);
    // la vitrine (2026-11-21) : mêmes nombres que le texte
    // la forme sortie des seuls temps de vol (2026-11-25, core/shape-reel.js)
    { const mv = aviaMeshValues(); container.querySelectorAll("span.cv[data-amesh]").forEach((s) => { const v = mv[s.dataset.amesh]; if (v != null) s.textContent = v; }); }
    if (has("aviaMesh")) this._figs.push(mountAviaMesh(container, tr));
    const rc = container.querySelector("#aviaReel"); this._reel = rc ? mountAviaReel(rc, tr, lang, vals) : null;
  },

  render() { for (const f of this._figs) { f.draw(); f.start(); } this._reel?.start(); },
  teardown() { for (const f of this._figs) f.stop(); this._reel?.stop(); },
};
