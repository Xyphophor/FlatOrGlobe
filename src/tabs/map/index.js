// Onglet "map" (2026-10-08, demande du propriétaire) : l'histoire des cartes et des projections,
// vulgarisation sans mesure -- de la tablette de Babylone à l'UTM, en passant par Ptolémée,
// Mercator, Gauss et Tissot ; la carte « plate » est l'azimutale équidistante polaire, tracée
// par le moteur commun (src/core/aeproj.js) pour n'importe quel centre.
// Prose anglaise source : src/data/prose/map.js ; nombres : logic.js ; figures : formfigs.js, maps.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/map.js";
import { SOURCES } from "../../data/sources/map.js";
import { flatError, radiusForError, ptolemyRatios, ptolemyFit, eqConic, polarStretch, utmScale, utmHalfWidth, mercScale, pathKm } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { PTOLEMY } from "../../data/presets/map-ptolemy.js";
import { drawEqr, drawPtol, drawMerc, drawGallery, drawAE, drawPolar, mountAEAnim, aeReading, CENTRES, CENTRE_NAMES, MERC_ROUTE } from "./maps.js";
import "./style.css";

const KEY = "map";

export function mapValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const r = ptolemyRatios(), P = eqConic(36, 63), k0 = 0.9996, F = ptolemyFit(PTOLEMY.towns);
  return {
    lang, e100: nf(flatError(100) * 100, 3), e1000: nf(flatError(1000) * 100, 2), d1: nf(Math.round(radiusForError(0.01) / 10) * 10, 0),
    r36: nf(r.rhodes.ptolemy, 4), r63: nf(r.thule.ptolemy, 4), ptN: nf(P.n, 3), ptFan: nf(P.n * 180, 0),
    merc72: nf(mercScale(72) ** 2, 1), rhumb: nf(Math.round(pathKm(MERC_ROUTE.rhumb) / 10) * 10, 0), gc: nf(Math.round(pathKm(MERC_ROUTE.gc) / 10) * 10, 0),
    kLon: nf(polarStretch(51.5), 2), kEq: nf(polarStretch(0), 2), kSyd: nf(polarStretch(-33.87), 2),
    ptCount: nf((PTOLEMY.eu.length + PTOLEMY.af.length + PTOLEMY.as.length) / 2, 0), ptTowns: nf(F.n, 0), ptB: nf(F.b, 2),
    ptDm: nf(F.dLatMean, 1), ptSd: nf(F.dLatSD, 1), ptSpan: nf(Math.round(F.trueSpan), 0),
    utm1: nf(Math.sqrt(2 * (1 / k0 - 1)) * 6371, 0), utmE: nf(utmScale(utmHalfWidth(0)), 4), utmW: nf(utmHalfWidth(0), 0),
  };
}

export default {
  key: KEY,
  label: "Maps",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    this._tr = tr; this._lang = lang; this._c = container; this._centre = "pole";
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = mapValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const bar = container.querySelector("#mapAEBtns");
    if (bar) {
      bar.setAttribute("aria-label", tr("mp-ctr-label", "Centre of the map"));
      bar.innerHTML = Object.keys(CENTRES).map((k) => `<button type="button" class="presetbtn" data-c="${k}" aria-pressed="${k === this._centre}">${tr(`mp-c-${k}`, CENTRE_NAMES[k])}</button>`).join("");
      bar.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-c]"); if (!b) return;
        this._centre = b.dataset.c;
        for (const x of bar.querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
        this._drawAE();
      });
    }
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anim = null;
    { const cv = container.querySelector("#mapAEAnim"); if (cv) this._anim = mountAEAnim(cv, tr); }
  },
  _drawAE() {
    const c = this._c, tr = this._tr, lang = this._lang, nf = (x) => Math.round(x).toLocaleString(lang);
    const cv = c.querySelector("#mapAE"); if (cv) drawAE(cv, tr, this._centre, lang);
    const rd = c.querySelector("#map-readAE"); if (!rd) return;
    const r = aeReading(this._centre);
    rd.innerHTML = `<span>${tr("mp-read-pair", "Sydney – Santiago")}</span>` +
      `<span class="f">${tr("mp-read-map", "on this map: {d} km").replace("{d}", nf(r.map))}</span>` +
      `<span class="g">${tr("mp-read-true", "great circle: {d} km").replace("{d}", nf(r.truth))}</span>` +
      `<span>${tr("mp-read-ratio", "map / ground: ×{r}").replace("{r}", (r.map / r.truth).toLocaleString(lang, { maximumFractionDigits: 2 }))}</span>`;
  },
  render() {
    const c = this._c, tr = this._tr, lang = this._lang; if (!c) return;
    const q = (id) => c.querySelector("#" + id);
    if (q("mapEqr")) drawEqr(q("mapEqr"), tr);
    if (q("mapPtol")) drawPtol(q("mapPtol"), tr, lang);
    if (q("mapMerc")) drawMerc(q("mapMerc"), tr, lang);
    if (q("mapGallery")) drawGallery(q("mapGallery"), tr);
    if (q("mapPolar")) drawPolar(q("mapPolar"), tr, lang);
    this._drawAE();
    this._anim?.start();
  },
  teardown() { this._anim?.stop(); },
};
