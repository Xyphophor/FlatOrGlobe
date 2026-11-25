// Onglet "rot" (epic19, 2026-10-04) : la rotation de la Terre, lue sur trois instruments sans
// carte -- lasers en anneau (Christchurch, Wettzell), chutes vers l'est (1791-2005), jour sidéral
// (mesure à faire soi-même). Prose anglaise source : src/data/prose/rot.js ; nombres : logic.js.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/rot.js";
import { SOURCES } from "../../data/sources/rot.js";
import { ringRows, ringRatio, fallRows, fallStats, siderealDay, OMEGA_REF } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountRing, mountFall, mountSid } from "./anims.js";
import "./style.css";

const KEY = "rot";
const sec = (s) => { const m = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(s).trim()); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : NaN; };
const hms = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h} h ${m} min ${(s % 60).toFixed(1)} s`; };

export function rotValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const r = ringRatio(), g = ringRows().find((x) => x.id === "G"), c = ringRows().find((x) => x.id === "C-II");
  const omegaN_G = g.omegaN, discCII = c.S * omegaN_G; // disque calé sur Wettzell, vu à Christchurch
  return { ratioM: nf(r.measured, 4), ratioG: nf(r.globe, 4), omegaG: g.omega.toExponential(5).replace("e-5", " × 10⁻⁵"), dayG: hms((2 * Math.PI) / g.omega), discCII: nf(discCII, 1) };
}

export default {
  key: KEY,
  label: "Rotation",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = rotValues(lang);
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const q = (s) => container.querySelector(s);
    const tbR = q("#rot-tbRing");
    if (tbR) tbR.innerHTML = ringRows().map((r) => `<tr><td>${r.id}</td><td>${r.site} (${nf(Math.abs(r.lat), 2)}° ${r.lat < 0 ? "S" : "N"})</td><td>${nf(r.A, 1)} m²</td>` +
      `<td class="g"><b>${nf(r.f, r.f < 100 ? 1 : 0)} Hz</b></td><td>${nf(r.omega * 1e5, 3)} × 10⁻⁵ rad/s</td><td class="f">${nf(r.fDisc, 0)} Hz</td><td class="f">0 Hz</td></tr>`).join("");
    const rr = ringRatio();
    if (q("#rot-readRing")) q("#rot-readRing").innerHTML = `<span>${tr("rot-read-ratio", "Wettzell / Christchurch")}</span><span class="g">${tr("rot-read-m", "measured {v}").replace("{v}", nf(rr.measured, 4))}</span>` +
      `<span class="g">${tr("rot-read-g", "globe {v}").replace("{v}", nf(rr.globe, 4))}</span><span class="f">${tr("rot-read-d", "disc 1, plane at rest 0")}</span>`;
    const tbF = q("#rot-tbFall"), st = fallStats();
    if (tbF) tbF.innerHTML = fallRows().map((r) => `<tr${st.kept.includes(r.who) ? "" : ' class="dim"'}><td>${r.who}, ${r.place} ${r.year}</td><td>${nf(r.h, r.h % 1 ? 1 : 0)} m</td>` +
      `<td class="g"><b>${nf(r.d, 2)}${r.e ? " ± " + nf(r.e, 2) : ""} mm</b></td><td>${nf(r.dGlobe, 2)} mm</td><td>${nf(r.omega * 1e5, 2)} × 10⁻⁵</td></tr>`).join("");
    if (q("#rot-readFall")) q("#rot-readFall").innerHTML = `<span>${tr("rot-read-falls", "{n} experiments kept").replace("{n}", st.q.n)}</span>` +
      `<span class="g">${tr("rot-read-fmed", "median ω {v} × 10⁻⁵ rad/s").replace("{v}", nf(st.q.med * 1e5, 2))}</span><span>${tr("rot-read-fref", "stars: {v}").replace("{v}", nf(OMEGA_REF * 1e5, 3))}</span><span class="f">${tr("rot-read-f0", "flat: 0")}</span>`;
    // expérience : le jour sidéral (les champs sont du texte hh:mm:ss)
    for (const id of ["rotT1", "rotT2"]) { const el = q("#" + id); if (el) { el.type = "text"; el.inputMode = "numeric"; } }
    const upd = () => {
      const out = q("#rotSidOut"), v = q("#rotSidV"); if (!out) return;
      const t1 = sec(q("#rotT1").value), t2r = sec(q("#rotT2").value), n = Math.round(+q("#rotN").value);
      if (!isFinite(t1) || !isFinite(t2r) || !(n >= 1)) { out.textContent = ""; v.textContent = ""; return; }
      const r = siderealDay(t1, t2r + n * 86400, n);
      out.innerHTML = tr("rot-sid-out", "One turn: <b>{T}</b> · {a} s earlier each night · {y} turns a year").replace("{T}", hms(r.sid)).replace("{a}", nf(r.advance, 1)).replace("{y}", nf(r.turnsPerYear, 2));
      v.innerHTML = tr("rot-sid-v", "Ω = {w} × 10⁻⁵ rad/s (stars: 7.292)").replace("{w}", nf(r.omega * 1e5, 3));
    };
    for (const id of ["rotT1", "rotT2", "rotN"]) q("#" + id)?.addEventListener("input", upd);
    upd();
    drawFormulaFigs(container, tr, vals);
    drawSymbols(KEY);
    // animations : détecter le mouvement (2026-10-04)
    this._anims = [];
    { const cv = container.querySelector("#rotAnimRing"); if (cv) this._anims.push(mountRing(cv, tr, lang)); }
    { const cv = container.querySelector("#rotAnimFall"); if (cv) this._anims.push(mountFall(cv, tr, lang)); }
    { const cv = container.querySelector("#rotAnimSid"); if (cv) this._anims.push(mountSid(cv, tr, lang)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
