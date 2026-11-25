// Onglet "curv" (epic13) -- courbure de la Terre contre courbure de
// l'horizon. Onglet NOUVEAU, pas un port du legacy (demande du propriétaire
// du 2026-09-28) : prose anglaise source dans src/data/prose/curv.js, calculs
// purs et testés dans logic.js, simulateur (sim.js, dessin frame.js), distorsions (tri.js), calculateur (calc.js),
// schéma de profil (side.js). Canvas 2D uniquement (pas de WebGL2 chez le
// propriétaire). Les nombres du texte sont calculés (values.js), jamais écrits en dur.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { PROSE } from "../../data/prose/curv.js";
import { SOURCES, READING } from "../../data/sources/curv.js";
import { LYNCH_PHOTO } from "../../data/presets/curv.js";
import { mountSim } from "./sim.js";
import { mountCalc } from "./calc.js";
import { mountTri } from "./tri.js";
import { proseValues, torsoRows } from "./values.js";
import { fmtH, num } from "./fmt.js";
import { drawSide } from "./side.js";
import { mountDepth } from "./depth.js";
import { drawFormulaFigs } from "./formfigs.js";
import "./style.css";

const KEY = "curv";

export default {
  key: KEY,
  label: "Horizon curve",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY);
    const ts = makeT(lang, "star");              // noms des huit objectifs : ceux de star, une seule source
    const tr = (k, fb) => { let v = t(k); if (v && v !== k) return v;
      if (k.startsWith("lens-")) { v = ts(k); if (v && v !== k) return v; } return fb; };
    this._tr = tr;
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(lang, KEY) });
    const vals = proseValues(tr);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, vals);   // un schéma par formule (2026-10-01), avant renderTexIn
    this._side = container.querySelector("#curvSide");
    this._sim = container.querySelector("#curvSim") ? mountSim(container, tr) : null;
    this._sim?.onHeight((h) => this._side && drawSide(this._side, h, tr));
    this._calc = container.querySelector("#curvF") ? mountCalc(container, tr, { toSim: (c) => this._sim?.setCamera(c) }) : null;
    this._tri = container.querySelector("#curvTri0") ? mountTri(container, tr) : null;
    this._depth = container.querySelector("#curvDepth") ? mountDepth(container, tr) : null;
    const tb = container.querySelector("#curvTorsoTb");
    if (tb) tb.innerHTML = torsoRows().map((r) => `<tr><td>${r.id}</td><td class="num">${fmtH(r.h)}</td><td class="num">${num(r.d / 1000, 1)} km</td>`
      + `<td class="num"><b>${num(r.hid)} m</b> (${num(r.seg, 2)} ${tr("seg-s", "seg.")})</td><td class="num g">${num(r.geo, 1)} / ${num(r.refr, 1)} m</td>`
      + `<td class="num f">0.0 m</td><td class="num">${num(r.k, 3)}</td></tr>`).join("");
  },

  render() {
    this._sim?.draw();
    this._tri?.draw();
    this._depth?.draw(); this._depth?.start();
    if (this._side) drawSide(this._side, this._sim ? this._sim.h : LYNCH_PHOTO.h, this._tr);
  },
  teardown() { this._sim?.stop(); this._tri?.stop(); this._depth?.stop(); },
};
