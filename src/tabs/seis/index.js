// Onglet "seis". Panneau porté VERBATIM (flux src/data/prose/seis.js,
// research/extract_prose.py v2) ; moteur porté VERBATIM du legacy
// (src/tabs/seis/seis-legacy.js : tables, figures canvas, animation avec ses
// boutons, expérience). Les schémas symboliques (seisfig*, figure
// d'ouverture) viennent de src/core/symbols.js. logic.js + logic.test.js
// rejouent les mêmes nombres sous node:test.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawFormulaFigs } from "./formfigs.js";
import { drawResiduals, mountRelocMap, drawHeat, fillTable } from "./relocfig.js";
import { RELOC_QUAKES } from "./relocate.js";
import { mountShadow, fillShadowTable, mountIdealGlobe } from "./shadowfig.js";
import { fillBulkRead, fillBulkTable, drawBulkHist, drawBulkDens, drawBulkQuakes, drawBulkShadow, fillShadowBulkRead, drawBulkRadius, fillRadiusBulkRead } from "./bulkfig.js";
import { mountSeisReel } from "./reel.js";
import { mountMesh, meshValues } from "./meshfig.js";
import { WAVE_STATIONS, fillWaveRead, drawWaveTraces, drawWaveHodo, drawWaveDirs, fillWaveTable } from "./wavesfig.js";
import { drawSymbols } from "../../core/symbols.js";
import { wire, draw, stop } from "./seis-legacy.js";
import { PROSE } from "../../data/prose/seis.js";
import { SOURCES, READING } from "../../data/sources/seis.js";
import "./style.css";

const KEY = "seis";

export default {
  key: KEY,
  label: "Seismology",

  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    // epic18 : nos propres localisations, et le plat face à neuf séismes sur une carte
    { const lang = document.documentElement.lang || "en", t0 = makeT(lang, KEY), q = (id) => container.querySelector(`#${id}`);
      const tv = (k, fb, vars = {}) => { let v = t0(k); if (!v || v === k) v = fb; for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b); return v; };
      this._rl = { tv, lang, q };
      const sel = q("rlQuakeR");
      if (sel) { sel.innerHTML = RELOC_QUAKES.map((x, i) => `<option value="${i}">${x.name}</option>`).join(""); sel.addEventListener("change", () => this._rlDraw()); }
      fillTable(q("rlRows"), tv, lang);
      const mc = q("relocMap");
      this._rlMap = mc ? mountRelocMap(mc, q("rlMapC"), q("rlMapQ"), q("rlMapRead"), tv, lang) : null;
      // la zone d'ombre des ondes P, station par station (2026-10-25)
      const sc = q("shadowMap");
      this._sh = sc ? mountShadow(sc, q("shMapC"), q("shMapQ"), q("shMapRead"), tv, lang, q("shadowGlobe")) : null;
      fillShadowTable(q("shRows"), tv, lang);
      const ic = q("shadowIdeal");   // le globe idéal, à côté de la coupe
      this._ideal = ic ? mountIdealGlobe(ic, tv) : null;
      // les synthèses sur tous les grands séismes peu profonds (seis-bulk, 2026-10-29)
      fillBulkRead(q("rlBulkRead"), tv, lang); fillBulkTable(q("rlBulkRows"), tv, lang);
      fillShadowBulkRead(q("shBulkRead"), tv, lang);
      fillRadiusBulkRead(q("seisRadiusBulkRead"), tv, lang); drawBulkRadius(q("seisRadiusBulkFig"), tv);
      // distinguer les ondes par leur mouvement (2026-10-30)
      const ws = q("wvSta");
      if (ws) { ws.innerHTML = WAVE_STATIONS.map((x) => `<option value="${x}">${x}</option>`).join(""); ws.addEventListener("change", () => this._rlDraw()); }
      fillWaveTable(q("wvRows"), tv, lang);
      // la forme qui sort des seuls temps (seis-mesh, 2026-11-24)
      { const mv = meshValues(); container.querySelectorAll("span.cv[data-mesh]").forEach((e) => { const v = mv[e.dataset.mesh]; if (v != null) e.textContent = v; }); }
      const mcv = q("seisMesh"); this._mesh = mcv ? mountMesh(container, tv) : null;
      // la vitrine de l'onglet (2026-10-29)
      const rc = q("seisReel"); this._reel = rc ? mountSeisReel(rc, (k, fb) => tv(k, fb), lang) : null; }
    drawSymbols(KEY);
    { const t = makeT(document.documentElement.lang || "en", KEY); drawFormulaFigs(container, (k, fb) => { const v = t(k); return v && v !== k ? v : fb; }); }   // epic15/UC03
  },

  render() { draw(); this._mesh?.draw(); this._mesh?.start(); this._reel?.start(); this._rlDraw(); this._rlMap?.start(); this._sh?.draw(); this._ideal?.start(); },

  /** Les figures fixes de la section epic18 (résidus du séisme choisi, carte de chaleur). */
  _rlDraw() {
    const R = this._rl; if (!R) return;
    const cv = R.q("relocResid"), sel = R.q("rlQuakeR");
    if (cv) drawResiduals(cv, RELOC_QUAKES[+(sel?.value || 0)], R.tv, R.lang);
    const hc = R.q("relocHeat"); if (hc) drawHeat(hc, R.tv, R.lang);
    const sta = R.q("wvSta")?.value || WAVE_STATIONS[0];
    fillWaveRead(R.q("wvRead"), sta, R.tv, R.lang);
    for (const [id, fn] of [["wvTraces", drawWaveTraces], ["wvHodo", drawWaveHodo]]) { const c = R.q(id); if (c) fn(c, sta, R.tv, R.lang); }
    { const c = R.q("wvDirs"); if (c) drawWaveDirs(c, R.tv, R.lang); }
    for (const [id, fn] of [["bulkHist", drawBulkHist], ["bulkDens", drawBulkDens], ["bulkQuakes", drawBulkQuakes], ["bulkShadow", drawBulkShadow]]) { const c = R.q(id); if (c) fn(c, R.tv, R.lang); }
  },

  teardown() { stop(); this._mesh?.stop(); this._reel?.stop(); this._rlMap?.stop(); this._ideal?.stop(); },
};
