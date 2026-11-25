// Onglet "sat" (epic27, 2026-10-16, demande du propriétaire : « des données publiques exploitables pour mesurer
// l'effet Doppler sur les satellites ») : un jour de Doppler de phase de 80 récepteurs IGS ; orbites, récepteurs,
// GM et Ω ajustés au seul Doppler, départ sur une carte plate (fog build sat-doppler). Prose : src/data/prose/sat.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/sat.js";
import { SOURCES } from "../../data/sources/sat.js";
import { SAT_DOPPLER as D } from "../../data/presets/sat-doppler.js";
import { satValues } from "./values.js";
import { keptStations, ellipse, clairaut, turn, keplerStats, GM_IERS, OM_IERS, WGS84 } from "./logic.js";
export { satValues };
import { drawFormulaFigs } from "./formfigs.js";
import { mountPass, mountBall, mountKep } from "./anims.js";
import "./style.css";

const KEY = "sat";

const RESTART = { catalogue: ["rs-cat", "receivers at their catalogue positions, GM and J₂ accepted"], ball3000: ["rs-ball", "every receiver on a 3,000 km ball, GM 25 % low"], "sats+5%": ["rs-sats", "every satellite 5 % too high, receivers on the flat map"], "sats+5%cat": ["rs-satscat", "every satellite 5 % too high, receivers at their catalogue positions"],
  scrambled: ["rs-scr", "every receiver at a random place on the flat map"], "moon+10%": ["rs-moon", "the Moon 10 % farther (GM/d³ kept)"] };

export default {
  key: KEY,
  label: "Satellites",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = satValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const q = (s) => container.querySelector(s);
    const tb = q("#sat-tbRestart");
    if (tb) tb.innerHTML = D.restarts.map((r) => { const [k, fb] = RESTART[r.name] || [r.name, r.name]; const ok = r.rms * 1000 < 2 * D.rms;
      return `<tr${ok ? "" : ' class="dim"'}><td>${tr(k, fb)}</td><td>${nf(r.rms * 1000, 1)}</td><td>${ok ? nf(r.dgm, 1) : "—"}</td><td>${ok ? nf(r.dom, 1) : "—"}</td><td>${ok ? nf(r.dsta, 2) + " m" : tr("rs-other", "another minimum")}</td></tr>`; }).join("");
    // le tableau des résultats (2026-10-17, propriétaire : « les résultats ne sont pas assez exposés »)
    const tbR = q("#sat-tbRes");
    if (tbR) {
      const turnI = 2 * Math.PI / (OM_IERS * 1e-5), hm = (T) => `${Math.floor(T / 3600)} h ${Math.floor((T % 3600) / 60)} min ${nf(T % 60, 2)} s`;
      const E = ellipse(keptStations(D)), Cl = clairaut(D, E.a), k = keplerStats(D), ppm = (a, b) => { const x = (a / b - 1) * 1e6; return `${x >= 0 ? "+" : "−"}${nf(Math.abs(x), 2)} ppm`; };
      const rows = [
        [tr("res-gm", "Earth's GM (×10¹⁴ m³/s²)"), nf(D.gm, 7), nf(GM_IERS, 9), ppm(D.gm, GM_IERS)],
        [tr("res-om", "Rotation Ω (×10⁻⁵ rad/s)"), nf(D.om, 7), nf(OM_IERS, 6), ppm(D.om, OM_IERS)],
        [tr("res-day", "One turn (sidereal day)"), hm(turn(D.om)), hm(turnI), `${turn(D.om) >= turnI ? "+" : "−"}${nf(Math.abs(turn(D.om) - turnI), 3)} s`],
        [tr("res-a", "Equatorial radius (km)"), nf(E.a, 1), nf(WGS84.a, 3), `${E.a >= WGS84.a ? "+" : "−"}${nf(Math.abs(E.a - WGS84.a), 1)} km`],
        [tr("res-f1", "Flattening, from the receivers' positions"), `1/${nf(E.invF, 0)}`, `1/${nf(WGS84.invF, 2)}`, ""],
        [tr("res-f2", "Flattening, from the orbits (J₂ and Clairaut)"), `1/${nf(Cl.invF, 0)}`, `1/${nf(WGS84.invF, 2)}`, ""],
        [tr("res-j2", "J₂ (×10⁻³)"), nf(Cl.J2 * 1e3, 4), nf(1.08263, 5), `${Cl.J2 * 1e3 >= 1.08263 ? "+" : "−"}${nf(Math.abs(Cl.J2 * 1e3 / 1.08263 - 1) * 100, 2)} %`],
        [tr("res-kep", "Kepler III: GM from GLONASS, GPS, Galileo"), tr("res-kep-v", "agree to {v} ppm").replace("{v}", nf(k.sysPpm, 1)), tr("res-kep-a", "one GM"), ""],
        [tr("res-fit", "Speeds left unexplained: receivers free / held on a plane"), `${nf(D.rms, 1)} mm/s / ${nf(D.flatRms, 0)} m/s`, "—", `× ${nf(Math.round(D.flatRms / (D.rms / 1000) / 1000) * 1000, 0)}`],
      ];
      tbR.innerHTML = rows.map(([a, b, c, d], i) => `<tr><td>${a}</td><td class="${i === rows.length - 1 ? "" : "g"}"><b>${b}</b></td><td>${c}</td><td>${d}</td></tr>`).join("");
    }
    const rd = q("#sat-readFit");
    if (rd) rd.innerHTML = `<span>${tr("sat-read-n", "{n} speeds").replace("{n}", vals.n)}</span>` +
      `<span class="g">GM ${vals.gm} × 10¹⁴ m³/s² (${vals.dGM})</span><span class="g">Ω ${vals.om} × 10⁻⁵ rad/s (${vals.dOm})</span>` +
      `<span class="g">${tr("sat-read-rms", "rms {v} mm/s").replace("{v}", vals.rms)}</span><span class="f">${tr("sat-read-flat", "best plane: {v} m/s").replace("{v}", vals.flatRms)}</span>`;
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    this._anims = [];
    { const cv = q("#satAnimPass"); if (cv) this._anims.push(mountPass(cv, tr, lang)); }
    { const cv = q("#satAnimBall"); if (cv) this._anims.push(mountBall(cv, tr, lang)); }
    { const cv = q("#satAnimKep"); if (cv) this._anims.push(mountKep(cv, tr, lang)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
