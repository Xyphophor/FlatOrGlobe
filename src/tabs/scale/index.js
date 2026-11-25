// Onglet "scale" (epic28, 2026-10-17, demande du propriétaire) : une horloge des mouvements de la Terre, chaque aiguille à
// sa vitesse vraie (logic.js : une droite dans le temps), et l'échelle des distances. Prose : src/data/prose/scale.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { xref } from "../../core/tabs.js";
import { PROSE } from "../../data/prose/scale.js";
import { SOURCES } from "../../data/sources/scale.js";
import { ARMS, arcsecPerSecond, speeds, RUNGS, lightSeconds, RUNG_NAMES } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountClock, mountZoom, periodText, ARM_STYLE } from "./anims.js";
import "./style.css";

const KEY = "scale";
// Le Soleil du modèle plat : la meilleure lampe de l'onglet orb (bestFlatH sur le Doppler de HARPS-N), recopiée pour ne pas
// refaire ce calcul de plusieurs secondes au montage ; logic.test.js vérifie qu'elle suit l'onglet orb.
export const FLAT_SUN_KM = 9666;

export function scaleValues(lang = "en", tr = (k, fb) => fb) {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const P = (id) => periodText(ARMS.find((a) => a.id === id).period, tr, lang), v = speeds(), km = (id) => RUNGS.find((r) => r.id === id).km;
  const ly = (s) => s / 31557600, lt = (s) => (s < 120 ? `${nf(s, 2)} s` : s < 7200 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : s < 2 * 31557600 ? `${nf(s / 3600, 1)} h` : `${nf(ly(s), ly(s) > 1e5 ? 0 : 2)} ${tr("u-ly", "light-years")}`);
  return { pSpin: P("spin"), pOrbit: P("orbit"), pAxis: P("axis"), pPeri: P("perihelion"), pGal: P("galaxy"),
    vSpin: nf(v.spin, 3), vOrbit: nf(v.orbit, 2), vGal: nf(Math.round(v.galaxy), 0), dOrbit: nf(v.orbit * 60, 0), dGal: nf(Math.round(v.galaxy * 60 / 100) * 100, 0),
    dProx: `${nf(ly(lightSeconds(km("proxima"))), 2)} ${tr("u-ly", "light-years")}`, ltMoon2: nf(2 * lightSeconds(km("moon")), 2), ltSun: lt(lightSeconds(km("sun"))),
    ltProx: lt(lightSeconds(km("proxima"))), ltM31: `${nf(ly(lightSeconds(km("m31"))) / 1e6, 2)} ${tr("u-mly", "million years")}`, hFlatKm: FLAT_SUN_KM, lt, nf };
}

const HOW = { earth: ["results", "how-earth", "angles and lengths on the ground"], moon: ["moon", "how-moon", "parallax; laser echoes"], sun: ["orb", "how-sun", "light time, aberration, Doppler; radar"],
  neptune: ["orb", "how-nep", "Kepler's third law with its period; spacecraft"], proxima: ["orb", "how-prox", "parallax (Gaia)"], gc: ["sat", "how-gc", "orbits of the stars around Sgr A*"], m31: ["results", "how-m31", "Cepheids calibrated on parallaxes"] };

export default {
  key: KEY,
  label: "Scale",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = scaleValues(lang, tr), { nf, lt } = vals;
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const q = (s) => container.querySelector(s), sp = speeds();
    const tbA = q("#scale-tbArms");
    if (tbA) tbA.innerHTML = ARMS.map((a) => {
      const w = arcsecPerSecond(a), wTxt = w >= 0.01 ? `${nf(w, w >= 1 ? 2 : 4)}″/s` : w >= 1e-8 ? `${nf(w * 1e6, 3)} µas/s` : `${nf(w * 1e9, 3)} nas/s`;
      const v = a.id === "spin" ? `${nf(sp.spin, 3)} km/s` : a.id === "orbit" ? `${nf(sp.orbit, 2)} km/s` : a.id === "galaxy" ? `~${nf(Math.round(sp.galaxy), 0)} km/s` : "—";
      return `<tr><td>${tr(`arm-${a.id}`, ARM_STYLE[a.id].name)}</td><td>${periodText(a.period, tr, lang)}</td><td class="num">${wTxt}</td><td class="num">${v}</td></tr>`; }).join("");
    const tbR = q("#scale-tbRungs");
    if (tbR) tbR.innerHTML = RUNGS.map((r) => { const [tab, k, fb] = HOW[r.id];
      const d = r.km < 1e7 ? `${nf(r.km, 0)} km` : r.km < 1e12 ? `${nf(r.km / 1e6, 1)} ${tr("u-mkm", "million km")}` : `${nf(r.km / 9.4607e12, r.km > 1e17 ? 0 : 2)} ${tr("u-ly", "light-years")}`;
      return `<tr><td>${tr(`z-${r.id}`, RUNG_NAMES[r.id])}</td><td class="num">${d}</td><td class="num">${lt(lightSeconds(r.km))}</td><td>${tr(k, fb)}</td><td>${xref(tab)}</td></tr>`; }).join("");
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anims = [];
    { const cv = q("#scaleAnimClock"); if (cv) this._anims.push(mountClock(cv, tr, lang)); }
    { const cv = q("#scaleAnimZoom"); if (cv) this._anims.push(mountZoom(cv, tr, lang)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
