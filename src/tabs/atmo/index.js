// Onglet "atmo" (epic29, 2026-10-17, demande du propriétaire) : pourquoi l'air tient sans couvercle, les ondes radio et
// l'ionosphère, pourquoi les satellites ne fondent pas. Prose : src/data/prose/atmo.js ; nombres : logic.js et la table 1976.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/atmo.js";
import { SOURCES } from "../../data/sources/atmo.js";
import { ussa, scaleHeight, plasmaFreq, LAYERS, maxHopKm, impactFlux, netGasHeat, ramHeat, equilibriumT, S_SUN, plateOrbit, plateEq } from "./logic.js";
import { drawTonga } from "./tonga.js";
import { drawKrakatoa } from "./krakatoa.js";
import { drawLambPool, lambValues } from "./lambfig.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountColumn, mountRadio, mountHeat, mountRad } from "./anims.js";
import { mountEruptReel } from "./reel.js";
import "./style.css";

const KEY = "atmo";

/** Altitude (km) où la pression de la table 1976 tombe à la fraction frac de celle du sol. */
function heightOf(frac) { let lo = 0, hi = 200; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (ussa(m).p > frac * ussa(0).p) lo = m; else hi = m; } return lo; }

export function atmoValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const sci = (x, d = 2) => { const e = Math.floor(Math.log10(x)); return `${nf(x / 10 ** e, d)} × 10${String(e).replace("-", "⁻").split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || c).join("")}`; };
  const sea = ussa(0), z = ussa(400), vSea1000 = sea.v * Math.sqrt(1000 / sea.T);
  const O = plateOrbit(), Tmin = Math.min(...O.rows.map((r) => r.T)), Tmax = Math.max(...O.rows.map((r) => r.T));
  const q400 = netGasHeat(z.n, z.v, z.T, 300), qSea = netGasHeat(sea.n, vSea1000, 1000, 300), qRam = ramHeat(z.rho, 7660), Teq = equilibriumT();
  return { h50: nf(heightOf(0.5), 1), h10: nf(heightOf(0.1), 0), h1: nf(heightOf(0.01), 0), H: nf(scaleHeight(288.15) / 1000, 1),
    foDay: nf(plasmaFreq(LAYERS.day.F.Ne) / 1e6, 1), dmax: nf(maxHopKm(LAYERS.day.F.h), 0), T400: nf(z.T, 0), n400: sci(z.n),
    nRatio: `${nf(sea.n / z.n / 1e9, 0)} ${lang === "fr" ? "milliards de" : "billion"}`.replace("billion", "billion").trim(),
    q400: `${nf(q400 * 1000, 2)} mW`, qSea: `${nf(qSea / 1e6, 0)} MW`, qRam: `${nf(qRam, 2)} W/m²`, phi400: sci(impactFlux(z.n, z.v)),
    S: nf(S_SUN, 0), Teq: nf(Teq, 0), TeqC: nf(Teq - 273.15, 0),
    radP: nf(O.P / 60, 1), radSh: nf(O.shadow * O.P / 60, 0), radC: nf(O.C, 0), radEq: nf(plateEq(), 0), radEqC: nf(plateEq() - 273.15, 0),
    radMin: nf(Tmin, 0), radMinC: nf(Tmin - 273.15, 0), radMax: nf(Tmax, 0), radRate: nf((S_SUN / O.C) * 60, 0) };
}

const BANDS = [
  ["LF / MF", "30 kHz – 3 MHz", "bd-lf", "ground wave; absorbed by the D layer in daytime, reflected at night", "bd-lfu", "long and medium-wave broadcasting, navigation beacons"],
  ["HF", "3 – 30 MHz", "bd-hf", "reflected by the E and F layers, in hops beyond the horizon; skip zone", "bd-hfu", "short-wave broadcasting, radio amateurs, aircraft over oceans"],
  ["VHF", "30 – 300 MHz", "bd-vhf", "goes through (except rare E-layer clouds): line of sight", "bd-vhfu", "FM radio, aircraft and marine radio"],
  ["UHF / SHF", "300 MHz – 30 GHz", "bd-uhf", "goes straight through: line of sight and space", "bd-uhfu", "television, mobile phones, GPS, satellite links"],
];

export default {
  key: KEY,
  label: "Atmosphere",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = { ...atmoValues(lang), ...lambValues(lang) };
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const tb = container.querySelector("#atmo-tbBands");
    if (tb) tb.innerHTML = BANDS.map(([b, f, k1, d1, k2, d2]) => `<tr><td>${b}</td><td>${f}</td><td>${tr(k1, d1)}</td><td>${tr(k2, d2)}</td></tr>`).join("");
    drawFormulaFigs(container, tr, vals);
    // les ondes de pression des éruptions (venues de seis le 2026-10-19 : Hunga Tonga 2022, Krakatoa 1883)
    drawTonga(container, lang); drawKrakatoa(container, lang); drawLambPool(container, lang);
    drawSymbols(KEY);
    this._anims = [];
    for (const [id, m] of [["atmoAnimColumn", mountColumn], ["atmoAnimRadio", mountRadio], ["atmoAnimHeat", mountHeat], ["atmoAnimRad", mountRad]]) { const cv = container.querySelector("#" + id); if (cv) this._anims.push(m(cv, tr, lang)); }
    // la vitrine des éruptions (2026-11-21)
    const rc = container.querySelector("#atmoReel"); if (rc) this._anims.push(mountEruptReel(rc, tr, lang));
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
