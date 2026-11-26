// Onglet "moon" (epic19, 2026-10-04) : la Lune comme règle -- laser lunaire de Grasse (rayon tiré
// des temps de vol, validation), parallaxe + Kepler + pendule et ombre d'éclipse (protocoles, en
// prédiction tant qu'ils ne sont pas faits).
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/moon.js";
import { SOURCES } from "../../data/sources/moon.js";
import { LLR_PASSES } from "../../data/presets/moon-llr.js";
import { ECL_CRATERS as EC } from "../../data/presets/moon-eclcraters.js";
import { passPoints, passCost, stationRadius, radiusFromParallax, parallaxFromShadow } from "./logic.js";
import { drawFormulaFigs, llrMemo } from "./formfigs.js";
import "./style.css";

const KEY = "moon";

export function moonValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const L = llrMemo(), med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
  const flat = med(LLR_PASSES.map((p) => passCost(passPoints(p), 0))) / 1000, globe = med(L.rows.map((r) => r.rms));
  return { nPass: String(L.q.n), med: nf(L.q.med, 1), dev: nf(stationRadius("GRSM") - L.q.med, 1), iqr: nf(L.q.q3 - L.q.q1, 1),
    flatRms: nf(flat, 1), globeRms: nf(globe, 2), parR: nf(radiusFromParallax(9.80, 57.04 / 60, 27.321661), 0), eclPi: nf(parallaxFromShadow(41.6, 0.011, 16.0), 1),
    // ombre d'éclipse (2026-10-28, fog build moon-eclcraters) : médianes des éclipses d'au moins 20 chronométrages
    ...eclValues(nf, med) };
}
function eclValues(nf, med) {
  const big = EC.eclipses.filter((e) => e.n >= 20), n = EC.used;
  return { eclTot: nf(22539, 0), eclN: nf(n, 0), eclNE: String(big.length), eclRs: nf(EC.rs, 0), eclRsSig: nf(EC.rsSig, 0),
    eclEnl: nf(EC.enl, 1), eclLayer: nf(Math.round((EC.rs - 6371) / 10) * 10, 0), eclE: nf(EC.E, 4), eclESig: nf(EC.Esig, 4),
    eclCorr: nf(EC.heraldCorr, 2), eclBall: nf(med(big.map((e) => e.ball)), 2), eclDisc: nf(med(big.map((e) => e.disc)), 0) };
}

export default {
  key: KEY,
  label: "Moon",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = moonValues(lang), L = llrMemo();
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const rd = container.querySelector("#moon-readLlr");
    if (rd) rd.innerHTML = `<span>${tr("moon-read-n", "{n} passes, Grasse").replace("{n}", L.q.n)}</span>` +
      `<span class="g">${tr("moon-read-R", "R = {v} km (quartiles {a}–{b})").replace("{v}", nf(L.q.med, 1)).replace("{a}", nf(L.q.q1, 1)).replace("{b}", nf(L.q.q3, 1))}</span>` +
      `<span class="f">${tr("moon-read-flat", "station at rest: {v} km off").replace("{v}", vals.flatRms)}</span>`;
    // l'expérience de la parallaxe est dans falsify (exp.js, 2026-11-26)
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
  },
  render() {},
  teardown() {},
};
