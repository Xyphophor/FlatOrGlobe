// Onglet "surv" (géodésie). Panneau porté VERBATIM (flux
// src/data/prose/surv.js, legacy L12667-13105) ; rendu porté VERBATIM du
// legacy (surv-legacy.js : coupe de nivellement à six scènes, tables,
// expérience 7, table des angles zénithaux, rayon depuis 32 couples en
// boîte à moustaches FIG). Le triangle d'excès sphérique est le drawSurvTri
// 2.5D du legacy (orbite + rotation), partout : la scène Three.js de l'epic03
// (src/render3d/scene-surv.js) est retirée le 2026-10-28, la carte exportée et
// sa vidéo pré-rendue (calculées sans WebGL) montraient un autre globe que la page.
// Schémas survPairFig, survfig0-1 : src/core/symbols.js. logic.js +
// logic.test.js rejouent les nombres sous node:test.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { drawFormulaFigs } from "./formfigs.js";
import { fillRapp } from "./recip.js";
import { fillTri, initTriMaps, drawTriGlobe, drawTriFlat } from "./excess.js";
import { fillPresetSelect, $ } from "../../core/legacy-helpers.js";
import { magOrbitInit } from "../mag/shared.js";
import { makeT } from "../../core/i18n.js";
import { reducedMotion, frameStep } from "../../core/motion.js";
import { SURV, SURV_LVL, SURV_TRI, SURVC, survFace, drawSurvLevel, drawSurvTri, survTables, svTabZen, svFigR, svReadR, setSurvLang } from "./surv-legacy.js";
import { PROSE } from "../../data/prose/surv.js";
import { SOURCES } from "../../data/sources/surv.js";
import "./style.css";

const KEY = "surv";

export default {
  key: KEY,
  label: "Surveying",

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en";
    this._t = makeT(lang, KEY);
    setSurvLang(lang);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    this._container = container;
    // initSurv() du legacy (L18027), moins la boucle 2.5D quand Three.js dessine le triangle
    const label = (v) => v.name + (v.side ? this._t("lbl-km-side").replace("{side}", v.side) : v.d ? ` · ${v.d >= 1 ? v.d + " km" : Math.round(v.d * 1000) + " m"}` : "");
    fillPresetSelect("survLvlSel", SURV_LVL, null, label);
    fillPresetSelect("survTriSel", SURV_TRI, null, label);
    $("survLvlSel")?.addEventListener("change", (e) => { SURV.lvl = +e.target.value; drawSurvLevel(); $("survLvlCap").innerHTML = this._t(SURV_LVL[SURV.lvl].capKey); });
    $("survTriSel")?.addEventListener("change", (e) => { SURV.tri = +e.target.value; survFace(); drawSurvTri(); survTables(); });
    $("survLvlCap").innerHTML = this._t(SURV_LVL[0].capKey);
    survFace();
    magOrbitInit($("survTri"), SURVC, drawSurvTri);
    $("survTriSpinBtn").addEventListener("click", () => {
      SURVC.spinning = !SURVC.spinning;
      $("survTriSpinBtn").textContent = SURVC.spinning ? this._t("spin-pause") : this._t("spin-play");
      if (!SURVC.spinning) drawSurvTri();
    });
    // prefers-reduced-motion : la triangulation reste immobile (bouton lecture)
    if (reducedMotion()) { SURVC.spinning = false; $("survTriSpinBtn").textContent = this._t("spin-play"); }
    // export (epic10/UC02) : un tour complet de la sphère de triangulation en 20 s (2 × le repos)
    if ($("survTri")) {
      let saved = null;
      $("survTri").__anim = {
        duration: 20,
        begin: () => { saved = { spin: SURVC.spin, spinning: SURVC.spinning }; SURVC.spinning = false; },
        frameAt: (t) => { SURVC.spin = saved.spin + (2 * Math.PI * t) / 20; drawSurvTri(); },
        end: () => { Object.assign(SURVC, saved); saved = null; drawSurvTri(); },
      };
    }
    svTabZen(); svReadR();
    fillRapp(container, (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; }, lang);   // 2026-10-04 : rayon apparent sans k
    // 2026-10-28 : onze cents triangles de Schott (SP 4 et SP 7), la courbure par leurs sommes d'angles
    this._tr = (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; };
    fillTri(container, this._tr, lang);
    initTriMaps(this._tr);
    for (const d of container.querySelectorAll("details.fold")) d.addEventListener("toggle", () => this.render());
    drawSymbols(KEY);
    drawFormulaFigs(container, (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; });   // epic15/UC04
  },

  render() {
    if (this._container.hidden) return;
    drawSurvLevel(); drawSurvTri(); survTables(); svFigR(); drawTriGlobe(this._tr); drawTriFlat(this._tr);
    if (this._raf == null) {
      const st = { last: 0 };
      const loop = (ts) => { // survLoop du legacy, ~30 images/s à vitesse inchangée
        const n = frameStep(st, ts);
        if (n && !this._container.hidden) { if (SURVC.spinning && !SURVC.drag) SURVC.spin += 0.0026 * n; if (SURVC.spinning || SURVC.drag) drawSurvTri(); }
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
  },

  teardown() {
    if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; }
  },
};
