// Onglet "sun" (le Soleil : distance, mouvement, analemme, cadran solaire),
// porté du legacy (flat-or-globe-2.20.0.html, panneau id="tab-sun" ~L11233,
// drawSun ~L17743 et sous-fonctions ~L17222-17780). Voir tasks/epic02/UC06.org.
//
// PORTÉE : tout le contenu du legacy -- histoire de la distance, panneau
// Rœmer animé (courbe de modèle SEULE, pas de points "observés"), paire
// d'analemmes (projection ciel caméra de niveau, échelle x/y égale), tableau
// des hauteurs de midi, chemin journalier + vitesse angulaire, cadran
// solaire (scène orthographique 2.5D : soleil FIXE dans l'espace monde, la
// planète tourne) + cinq mini-cadrans tracés par l'UNIQUE helper
// sunDialPlate(), expériences 6 et 6b, sources. La scène du cadran est le
// candidat identifié pour epic03/UC05 (vraie 3D) ; ici elle reste 2.5D.
//
// Les deux boucles rAF du legacy (Rœmer `SUN.t`, cadran `SUND.earth`) sont
// fusionnées en une seule, arrêtée franchement par teardown().
import { webglOK, webglFailed } from "../../core/webgl.js";
import { makeT } from "../../core/i18n.js";
import { registerSources, cite, renderSources } from "../../core/citations.js";
import { setupCanvas } from "../../core/canvas.js";
import { RAD, DEG } from "../../core/math.js";
import { SOURCES, FURTHER_READING } from "../../data/sources/sun.js";
import { magRot, magPoly, magPanelBox, magOrbitInit, magSgn } from "../mag/shared.js";
import { drawGlobe25 } from "../../core/globe25d.js";
import {
  sunFlatH, flatMinAlt, romerCurve, romerLightMin, ROMER, SUN_C, SUN_AU, analemmaPoints,
  sunDirG, sunDirF, sunSpeedCurves, SUND_YAW, SUN_AZ, SUN_DIR, SUND_STATIONS, sunDialHour, sunDialPlate, sunTableRows,
} from "./logic.js";
import { drawSymbols } from "../../core/symbols.js";
import { xrefsNav } from "../../core/tabs.js";
import { expAwayLink } from "../../core/prose.js";
import "./style.css";
import { reducedMotion, frameStep } from "../../core/motion.js";
import { evBadge } from "../../core/evidence.js";
import { DAYLEN_FIGS, daylenValues } from "./daylen.js";
import { ROMER_FIGS, romerValues, eraRows } from "./romer-data.js";
import { drawSystem, drawDelay } from "./romer-anim.js";
import { mountRomerReel } from "./romer-reel.js";
import { label } from "../../core/reel.js";
import { drawFormulaFigs } from "../../core/formfigs.js";

const KEY = "sun";
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
const sgnDeg = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}°`;

export default {
  key: KEY,
  label: "Sun",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", KEY);
    registerSources(KEY, SOURCES);
    this._t = t; this._lang = document.documentElement.lang || "en";
    this._root = container;
    // état legacy : SUN (lat, hour, t, run) + SUND (caméra du cadran)
    this._S = { lat: 45, hour: 0, t: 0, run: true };
    this._D = { yaw: SUND_YAW + 0.32, pitch: 0.55, spin: 0, spinning: true, drag: false, lx: 0, ly: 0, earth: SUN_AZ - 0.5 };
    this._raf = null;

    const hist = [
      ["~270 BC", t("hist-aristarchus"), t("hist-aristarchus-result")],
      ["1672", t("hist-cassini"), "~140"],
      ["1761 / 1769", t("hist-venus"), t("hist-venus-result")],
      ["1849–62", t("hist-fizeau"), "~148–154"],
      ["1961+", t("hist-radar"), "149.598"],
      ["2012", t("hist-iau"), t("hist-iau-result")],
    ];

    container.innerHTML = `
      <p class="eyebrow">${t("eyebrow")}</p>
      <h1>${t("h1")}</h1>

      <!-- curseurs JUSTE AU-DESSUS des deux analemmes qu'ils pilotent (2026-09-24,
           demande du propriétaire : ils étaient sous deux paragraphes et le chapeau) -->
      <div class="mini-form">
        <div class="field grow"><label for="sunLat">${t("lat-label")} <span id="sunLatRead" class="unit">+45°</span></label>
          <input type="range" id="sunLat" min="-85" max="85" step="1" value="45"></div>
        <div class="field grow"><label for="sunHour">${t("hour-label")} <span id="sunHourRead" class="unit">${t("solar-noon")}</span></label>
          <input type="range" id="sunHour" min="-5" max="5" step="0.5" value="0"></div>
      </div>
      <div class="cnav-grid opener">
        <div class="fig"><canvas id="anGlobe"></canvas><div class="fcap">${t("an-globe-cap")}</div></div>
        <div class="fig"><canvas id="anFlat"></canvas><div class="fcap">${t("an-flat-cap")}</div></div>
      </div>
      <p class="notes">${t("sun-p-flat8")}</p>
      <p class="notes">${t("sun-p-flat8b")}</p>
      <p class="cnav-lead">${t("lead")}</p>

      <h2 class="cnav-h2" data-sec="hist-h2">${t("hist-h2")}</h2>
      <table class="cnav-table">
        <caption>${t("hist-caption")}</caption>
        <thead><tr><th>${t("hist-th-when")}</th><th>${t("hist-th-who")}</th><th>${t("hist-th-result")}</th></tr></thead>
        <tbody>${hist.map(([w, who, r]) => `<tr><td>${w}</td><td>${who}</td><td>${r}</td></tr>`).join("")}</tbody>
      </table>
      <p class="rate-note">${t("hist-note")}</p>

      <h2 class="cnav-h2" data-sec="romer-h2">${t("romer-h2")}${evBadge("sun", "romer-h2")} <button type="button" class="swapbtn" id="sunRomerBtn">${t("romer-pause")}</button></h2>
      <p class="notes">${t("romer-p1")}</p>
      <p class="notes">${t("romer-p2")}</p>
      <div class="fig"><canvas id="sunRomer" class="wide"></canvas><div class="fcap">${t("romer-cap")}</div></div>
      <div class="formula">
        <div class="big"><div class="ln"><span class="tex" data-tex="\\Delta t = \\frac{D}{c} \\implies 2\\,\\text{au} = c\\cdot\\Delta t_{\\text{max}} \\approx 299,792\\ \\text{km}/\\text{s}\\times 998\\ \\text{s}">Δt = D / c &nbsp;⇒&nbsp; 2 au = c · Δt<sub>max</sub> ≈ 299,792 km/s × 998 s</span> &nbsp;⇒&nbsp; <span class="tex" data-tex="\\g{1\\,\\text{au} \\approx 1.496\\times 10^{8}\\ \\text{km}}"><b>1 au ≈ 1.496×10⁸ km</b></span></div></div>
        <div class="figsym" id="sunfig0"></div>
        <div class="gloss">${t("romer-gloss")}</div>
      </div>

      <!-- Rømer à rebours sur les vraies éclipses d'Io, 1652-1983 (2026-11-25, fog build sun-romer) -->
      <h2 class="cnav-h2" data-sec="romer-m-h2">${t("romer-m-h2")}${evBadge("sun", "romer-m-h2")}</h2>
      <div class="fig"><canvas id="sunRomerReel" class="romer-reel"></canvas><div class="fcap">${t("romer-reel-cap")}</div></div>
      <p class="notes">${t("romer-m-p1")}</p>
      <p class="notes">${t("romer-m-p2")}</p>
      <div class="formula">
        <div class="big"><div class="ln"><span class="tex" data-tex="t_{\\text{obs}} = t_{J} + \\frac{A}{c}\\,d">t<sub>obs</sub> = t<sub>J</sub> + (A/c) · d</span></div><div class="ln"><b>A/c = <span class="cv" data-v="rmAs">…</span> ± <span class="cv" data-v="rmDAs">…</span> s</b> &nbsp;⇒&nbsp; <b>A = <span class="cv" data-v="rmAU">…</span> ± <span class="cv" data-v="rmDAU">…</span> million km</b></div></div>
        <div class="figsym" id="sunFigRomerD"></div>
        <div class="gloss">${t("romer-m-gloss")}</div>
      </div>
      <div class="fig"><div class="figsym" id="sunFigRomerT"></div><div class="fcap">${t("romer-m-capt")}</div></div>
      <div class="tscroll"><table class="cnav-table">
        <caption>${t("romer-m-tcap")}</caption>
        <thead><tr><th>${t("romer-m-th1")}</th><th>${t("romer-m-th2")}</th><th>${t("romer-m-th3")}</th><th>${t("romer-m-th4")}</th><th>${t("romer-m-th6")}</th><th>${t("romer-m-th7")}</th></tr></thead>
        <tbody>${eraRows(document.documentElement.lang || "en")}</tbody>
      </table></div>
      <p class="notes">${t("romer-m-res")}</p>
      <p class="notes">${t("romer-m-lim")}</p>
      <div class="callout flatc">${t("romer-m-verdict")}</div>

      <h2 class="cnav-h2" data-sec="romer-f-h2">${t("romer-f-h2")}</h2>
      <p class="notes">${t("romer-f-p1")}</p>
      <div class="formula">
        <div class="big"><div class="ln">flat: <span class="tex" data-tex="\\f{\\delta(\\varphi) = a_1\\cos\\varphi + b_1\\sin\\varphi + a_2\\cos 2\\varphi + b_2\\sin 2\\varphi}">δ(φ) = a₁ cos φ + b₁ sin φ + a₂ cos 2φ + b₂ sin 2φ</span></div><div class="ln">globe: <span class="tex" data-tex="\\g{\\delta = \\frac{A}{c}\\sqrt{a_J^2 + 1 - 2a_J\\cos\\varphi}}">δ = (A/c) √(a<sub>J</sub>² + 1 − 2a<sub>J</sub> cos φ)</span></div></div>
        <div class="figsym" id="sunFigRomerF"></div>
        <div class="gloss">${t("romer-f-gloss")}</div>
      </div>
      <table class="cnav-table">
        <caption>${t("romer-f-tcap")}</caption>
        <thead><tr><th>${t("romer-f-th1")}</th><th>${t("romer-f-th2")}</th><th>${t("romer-f-th3")}</th></tr></thead>
        <tbody>
          <tr><td>a₁</td><td><span class="cv" data-v="rmA1">…</span> ± <span class="cv" data-v="rmA1e">…</span> s</td><td><span class="cv" data-v="rmA1p">…</span> s</td></tr>
          <tr><td>b₁</td><td><span class="cv" data-v="rmB1">…</span> ± <span class="cv" data-v="rmB1e">…</span> s</td><td><span class="cv" data-v="rmB1p">…</span> s</td></tr>
          <tr><td>a₂</td><td><span class="cv" data-v="rmA2">…</span> ± <span class="cv" data-v="rmA2e">…</span> s</td><td><span class="cv" data-v="rmA2p">…</span> s</td></tr>
          <tr><td>b₂</td><td><span class="cv" data-v="rmB2">…</span> ± <span class="cv" data-v="rmB2e">…</span> s</td><td><span class="cv" data-v="rmB2p">…</span> s</td></tr>
        </tbody>
      </table>
      <p class="notes">${t("romer-f-p2")}</p>

      <h2 class="cnav-h2" data-sec="romer-o-h2">${t("romer-o-h2")}</h2>
      <p class="notes">${t("romer-o-p1")}</p>
      <p class="notes">${t("romer-o-p2")}</p>
      <p class="notes">${t("romer-o-p3")}</p>

      <h2 class="cnav-h2" data-sec="an-h2">${t("an-h2")}${evBadge("sun", "an-h2")}</h2>
      <p class="notes">${t("an-p1")}</p>
      <table class="cnav-table">
        <caption>${t("noon-caption")}</caption>
        <thead><tr><th>${t("th-date")}</th><th>${t("th-measured")}</th><th>${t("th-globe")}</th><th>${t("th-flat")}</th><th>${t("th-err")}</th></tr></thead>
        <tbody id="sunRows"></tbody>
      </table>
      <p class="rate-note" id="sunNote"></p>
      <div class="callout flatc">${t("callout-two-more")}</div>

      <h2 class="cnav-h2" data-sec="daily-h2">${t("daily-h2")}${evBadge("sun", "daily-h2")}</h2>
      <p class="notes">${t("daily-p1")}</p>
      <div class="formula">
        <div class="big"><div class="ln">measured: <span class="tex" data-tex="\\frac{d\\psi}{dt} \\approx \\g{15\\deg/\\text{h}}">dψ/dt ≈ <b>15°/h</b></span><b>, constant</b></div><div class="ln">flat, uniform spin: <b class="f">varying</b></div><div class="ln">flat, tuned for you: <b class="f">wrong for everyone else</b></div></div>
        <div class="figsym" id="sunfig1"></div>
        <div class="gloss">${t("daily-gloss")}</div>
      </div>
      <div class="cnav-grid">
        <div class="fig"><canvas id="sunPath"></canvas><div class="fcap">${t("path-cap")}</div></div>
        <div class="fig"><canvas id="sunSpeed"></canvas><div class="fcap">${t("speed-cap")}</div></div>
      </div>
      <p class="rate-note" id="sunSpeedNote"></p>

      <h2 class="cnav-h2" data-sec="dial-h2">${t("dial-h2")}${evBadge("sun", "dial-h2")} <button type="button" class="swapbtn" id="sunDialSpinBtn">${t("dial-pause")}</button></h2>
      <p class="notes">${t("dial-p1")}</p>
      <div class="fig" id="sunDialsFig">
        <canvas id="sunDial" class="wide orbit"></canvas>
        <div class="dial-strip">
          <canvas id="dialM0" class="mini"></canvas><canvas id="dialM1" class="mini"></canvas><canvas id="dialM2" class="mini"></canvas><canvas id="dialM3" class="mini"></canvas><canvas id="dialM4" class="mini"></canvas>
        </div>
        <ul class="figkey">
          <li><span class="sw" data-sw="sundash"></span><span>${t("sun-k1")}</span></li>
          <li><span class="sw" data-sw="sunviolet"></span><span>${t("sun-k2")}</span></li>
          <li><span class="sw" data-sw="sunterm"></span><span>${t("sun-k3")}</span></li>
          <li><span class="sw" data-sw="sunface"></span><span>${t("sun-k4")}</span></li>
        </ul>
        <div class="fcap">${t("dial-cap")}</div>
      </div>
      <div class="formula">
        <div class="big"><div class="ln">gnomon tilt = <span class="tex" data-tex="\\g{\\varphi}"><b>φ</b></span></div><div class="ln">horizontal-plate hour lines: <span class="tex" data-tex="\\g{\\tan\\theta = \\sin\\varphi\\cdot\\tan H}"><b>tan θ = sin φ · tan H</b></span>${cite(KEY, "bss-sundials")}</div><div class="ln">shadow rate about the gnomon: <span class="tex" data-tex="\\g{15\\deg/\\text{h}}"><b>15°/h</b></span></div></div>
        <div class="figsym" id="sunfig2"></div>
        <div class="gloss">${t("dial-gloss")}</div>
      </div>
      <p class="notes">${t("sun-p-sync")}</p>

      <!-- la durée du jour mesurée (2026-10-28, epic34/UC03, fog build sun-bsrn) -->
      <h2 class="cnav-h2" data-sec="dl-h2">${t("dl-h2")}${evBadge("sun", "dl-h2")}</h2>
      <p class="notes">${t("dl-p1")}</p>
      <div class="formula">
        <div class="big"><div class="ln"><span class="tex" data-tex="\\g{\\cos H_0 = \\frac{\\sin(-0.833°) - \\sin\\varphi\\sin\\delta}{\\cos\\varphi\\cos\\delta}}">cos H₀ = (sin(−0.833°) − sin φ sin δ)/(cos φ cos δ)</span></div><div class="ln"><span class="tex" data-tex="\\f{d(t) = \\sqrt{r_s^2 + r^2 - 2 r_s r \\cos\\theta(t)} \\le \\rho}">d(t) = √(r_s² + r² − 2 r_s r cos θ(t)) ≤ ρ</span></div></div>
        <div class="figsym" id="sunFigDay"></div>
        <div class="gloss">${t("dl-gloss")}</div>
      </div>
      <div class="callout flatc">${t("dl-flat")}</div>
      <p class="notes">${t("dl-lim")}</p>

      ${expAwayLink("xp-sun-6", t("exp-h"))}

      ${expAwayLink("xp-sun-6b", t("sn2-h"))}

      ${xrefsNav(["cnav", "twi", "dist", "obs", "azim"])}
      ${renderSources(KEY)}
      <section class="srcs reading"><h2>${t("rd-more")}</h2><div class="note">${t("rd-note")}</div><ul>${FURTHER_READING.map((h) => `<li>${h}</li>`).join("")}</ul></section>
    `;

    const q = (id) => container.querySelector("#" + id);
    { const lang = document.documentElement.lang || "en", dv = { ...daylenValues(lang), ...romerValues(lang) };
      container.querySelectorAll("span.cv[data-v]").forEach((sp) => { const v = dv[sp.dataset.v]; if (v != null) sp.textContent = v; });
      const tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
      drawFormulaFigs(container, DAYLEN_FIGS, tr, {}, "sun");
      drawFormulaFigs(container, ROMER_FIGS, tr, {}, "sun");
      const rc = container.querySelector("#sunRomerReel"); if (rc) this._reel = mountRomerReel(rc, tr, lang, dv); }
    drawSymbols(KEY); // schémas sunfig0-2 + swatches de légende (rattrapage UC11)
    this._el = {
      lat: q("sunLat"), latRead: q("sunLatRead"), hour: q("sunHour"), hourRead: q("sunHourRead"),
      anG: q("anGlobe"), anF: q("anFlat"), romer: q("sunRomer"), path: q("sunPath"), speed: q("sunSpeed"),
      dial: q("sunDial"), faces: [0, 1, 2, 3, 4].map((i) => q("dialM" + i)),
      rows: q("sunRows"), note: q("sunNote"), speedNote: q("sunSpeedNote"),
      romerBtn: q("sunRomerBtn"), spinBtn: q("sunDialSpinBtn"),
    };
    const redraw = () => this._redrawStatic();
    this._el.lat.addEventListener("input", () => {
      this._S.lat = +this._el.lat.value;
      this._el.latRead.textContent = magSgn(this._S.lat) + "°";
      redraw();
    });
    this._el.hour.addEventListener("input", () => {
      this._S.hour = +this._el.hour.value;
      const h = this._S.hour;
      this._el.hourRead.textContent = h === 0 ? t("solar-noon") : (h > 0 ? "+" : "−") + Math.abs(h) + " h";
      redraw();
    });
    // décidé AU MONTAGE : le premier render() dessinait le 2.5D sur ce canvas
    // avant de lancer Three.js, et un canvas qui a un contexte 2D ne donne plus
    // de contexte WebGL -- le cadran 3D ne pouvait jamais démarrer.
    this._three = webglOK();
    if (!this._three) magOrbitInit(this._el.dial, this._D, () => this._drawDial());
    this._el.spinBtn.addEventListener("click", () => {
      this._D.spinning = !this._D.spinning;
      this._el.spinBtn.textContent = this._D.spinning ? t("dial-pause") : t("dial-resume");
      if (!this._D.spinning) { this._drawDial(); this._drawFaces(); }
    });
    this._el.romerBtn.addEventListener("click", () => {
      this._S.run = !this._S.run;
      this._el.romerBtn.textContent = this._S.run ? t("romer-pause") : t("romer-play");
    });
    // export (epic10/UC02) : Rømer sur un cycle synodique Terre–Jupiter (≈ 399 j, 54 j/s),
    // les cadrans sur un tour de la Terre (0,3 rad/s, ≈ 21 s) ; état rendu à la fin
    const syn = 1 / (1 / ROMER.TE - 1 / ROMER.TJ);
    if (this._el.romer) {
      let saved = null;
      this._el.romer.__anim = {
        duration: syn / 54,
        begin: () => { saved = { ...this._S }; this._S.run = false; },
        frameAt: (t) => { this._S.t = saved.t + t * 54; this._drawRomer(); },
        end: () => { Object.assign(this._S, saved); saved = null; this._drawRomer(); },
      };
    }
    if (this._el.dial) {
      let saved = null;
      const anim = {
        duration: (2 * Math.PI) / 0.3,
        begin: () => { saved = { earth: this._D.earth, spinning: this._D.spinning }; this._D.spinning = false; },
        frameAt: (t) => { this._D.earth = saved.earth + 0.3 * t; this._drawDial(); this._drawFaces(); },
        end: () => { Object.assign(this._D, saved); saved = null; this._drawDial(); this._drawFaces(); },
      };
      this._el.dial.__anim = anim;
      for (const f of this._el.faces) if (f) f.__anim = anim;
    }
    // prefers-reduced-motion : cadran et Rømer à l'arrêt, boutons en « lecture »
    if (reducedMotion()) {
      this._S.run = false; this._D.spinning = false;
      this._el.romerBtn.textContent = t("romer-play"); this._el.spinBtn.textContent = t("dial-resume");
    }
  },

  render() {
    if (this._root.hidden) return;
    this._reel?.start();
    this._drawRomer();
    this._redrawStatic();
    if (this._raf == null) this._loop();
    // epic03/UC05 : cadran solaire en vraie 3D (Three.js, chargé à la
    // demande) par-dessus le même état D.earth ; le canvas 2.5D
    // (_drawDial) reste le repli sans WebGL. Les mini cadrans restent en
    // 2D et lisent la MÊME source (sunDialPlate), donc la démonstration
    // "les heures correspondent" n'est pas circulaire.
    if (this._three) {
      this._active = true;
      import("../../render3d/scene-sundial.js").then(({ mountSundial }) => {
        if (!this._active) return;
        if (!this._dial3d) { this._dial3d = mountSundial(this._el.dial, () => ({ the: this._D.earth })); this._dial3d.controls.autoRotate = false; }
        this._dial3d.start();
      }).catch((e) => {
        // Three.js n'a pas eu son contexte : le cadran 2.5D du legacy reprend
        webglFailed(e);
        this._three = false; this._dial3d = null;
        magOrbitInit(this._el.dial, this._D, () => this._drawDial());
        if (this._active) this._redrawStatic();
      });
    }
  },

  teardown() {
    this._active = false;
    this._reel?.stop();
    if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; }
    this._dial3d?.stop();
  },

  _loop() {
    const st = { last: 0 };
    const step = (ts) => {
      if (this._root.hidden) { this._raf = null; return; }
      const n = frameStep(st, ts); // ~30 images/s, vitesses inchangées
      if (n && this._S.run) { this._S.t += 0.9 * n; this._drawRomer(); }
      if (n && this._D.spinning && !this._D.drag) { this._D.earth += 0.005 * n; this._drawDial(); this._drawFaces(); }
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  },

  _redrawStatic() {
    this._drawAnalemma(this._el.anG, "globe");
    this._drawAnalemma(this._el.anF, "flat");
    this._drawPath(); this._drawSpeed(); this._drawDial(); this._drawFaces(); this._tables();
  },

  // -- Rømer : orbites à l'échelle + courbe de temps-lumière (modèle seul) --
  // Refait le 2026-11-25 (Xyphophor : « j'aime moyen le rendu ») : dessins communs avec la vitrine (romer-anim.js) ; le
  // médaillon montre Jupiter de près, son ombre et Io (ralentie, grossie), la courbe marque chaque éclipse vue.
  _drawRomer() {
    const cv = this._el.romer; if (!cv || this._root.hidden) return;
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    ctx.fillStyle = "#fbfaf7"; ctx.fillRect(0, 0, W, H);
    const t = this._t, narrow = W < 560, day = this._S.t, fs = narrow ? 11 : 12.5;
    // trois colonnes (système, Jupiter de près, courbe) ; au téléphone : système et médaillon en haut, courbe dessous
    const sys = narrow ? { x: 0, y: 0, w: W * 0.6, h: W * 0.6 } : { x: 0, y: 0, w: W * 0.36, h: H };
    const r = narrow ? W * 0.18 : Math.min(W * 0.11, H * 0.36);
    const ins = narrow ? { x: W * 0.8, y: W * 0.24 } : { x: W * 0.48, y: H * 0.42 };
    const strip = narrow ? { x: 2, y: W * 0.6 + fs * 3.2, w: W - 4, h: H - W * 0.6 - fs * 3.2 } : { x: W * 0.6, y: fs * 2.4, w: W * 0.395, h: H - fs * 2.6 };
    const lab = { earth: t("romer-a-earth"), jupiter: t("romer-a-jup"), sun: t("romer-a-sun") };
    const nf = (x) => x.toLocaleString(this._lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    drawSystem(ctx, sys, day, { fs, labels: lab, fmt: nf, inset: { x: ins.x, y: ins.y, r, maxX: W - 4, io: (2 * Math.PI * day) / 54, caption: t("romer-a-inset") } });
    const lt = romerLightMin(day), lt0 = romerLightMin(0);
    drawDelay(ctx, strip, day, { fs, labels: { axis: t("romer-a-axis"), now: t("romer-a-now").replace("{lt}", nf(lt)).replace("{late}", (lt - lt0 >= 0 ? "+" : "") + nf(lt - lt0)) } });
    const c = romerCurve(day, 160);
    label(ctx, t("romer-a-swing").replace("{swing}", nf(c.swing)).replace("{au}", nf(c.auMkm)), strip.x + strip.w - fs * 0.6, strip.y - fs * 1.2, { size: fs * 0.85, col: "#0f766e", align: "right", weight: 700 });
  },

  // -- analemme : projection ciel caméra de niveau, ÉCHELLE ÉGALE ----------
  _drawAnalemma(cv, model) {
    if (!cv || this._root.hidden) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    const lat = this._S.lat, hf = sunFlatH(lat);
    const A = analemmaPoints(model, lat, this._S.hour, hf.h);
    const P2 = A.pts;
    let xLo = 1e9, xHi = -1e9, yLo = 1e9, yHi = -1e9;
    P2.forEach((o) => { xLo = Math.min(xLo, o.xy[0]); xHi = Math.max(xHi, o.xy[0]); yLo = Math.min(yLo, o.xy[1]); yHi = Math.max(yHi, o.xy[1]); });
    const pad = 5, ML = 14, MR = 14, MT = 12, MB = 24;
    const sc = Math.min((W - ML - MR) / (xHi - xLo + 2 * pad), (H - MT - MB) / (yHi - yLo + 2 * pad)); // échelle ÉGALE ou le basculement ment
    const cxd = (xLo + xHi) / 2, cyd = (yLo + yHi) / 2;
    const X = (x) => W / 2 + (x - cxd) * sc, Y = (y) => MT + (H - MT - MB) / 2 - (y - cyd) * sc;
    /* L'HORIZON (corrigé 2026-09-24, « pourquoi un cercle autour de
       l'analemme ? »). En projection orthographique centrée sur le Soleil
       moyen, l'horizon -- un grand cercle du ciel -- est une ELLIPSE. Le legacy
       gardait aussi la moitié ARRIÈRE (jusqu'à 100° du Soleil moyen) et triait
       les points par x : branche avant et branche arrière étaient reliées, ce
       qui dessinait un anneau autour du 8 et remplissait le « sol » n'importe
       comment. On ne garde que la moitié tournée vers le Soleil moyen,
       parcourue dans l'ordre des azimuts : une cuvette sous l'analemme. */
    const azM = Math.atan2(A.m[0], A.m[1]) * 180 / Math.PI;
    const horIn = [];
    for (let a = azM - 89; a <= azM + 89; a += 1) {
      const v = [Math.sin(RAD(a)), Math.cos(RAD(a)), 0];
      if (v[0] * A.m[0] + v[1] * A.m[1] > 0) horIn.push(A.proj(v));
    }
    if (horIn.length > 3) {
      ctx.beginPath(); horIn.forEach((q, i) => (i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1]))));
      ctx.lineTo(X(horIn[horIn.length - 1][0]), H); ctx.lineTo(X(horIn[0][0]), H); ctx.closePath();
      ctx.fillStyle = "#7a6a4f"; ctx.globalAlpha = .07; ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); horIn.forEach((q, i) => (i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1]))));
      ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 1.8; ctx.stroke();
    }
    ctx.strokeStyle = "#eceae3"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(cxd), MT - 6); ctx.lineTo(X(cxd), H - MB + 6); ctx.stroke();
    const col = model === "globe" ? "#0f766e" : "#b45309";
    for (let i = 0; i < 365; i++) {
      const a = P2[i], b = P2[(i + 1) % 365];
      const under = a.alt < 0 && b.alt < 0;
      ctx.strokeStyle = col; ctx.lineWidth = under ? 1.4 : 2;
      ctx.globalAlpha = under ? .45 : 1; ctx.setLineDash(under ? [4, 4] : []);
      ctx.beginPath(); ctx.moveTo(X(a.xy[0]), Y(a.xy[1])); ctx.lineTo(X(b.xy[0]), Y(b.xy[1])); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = col;
    [0, 90, 181, 273].forEach((N, mi) => {
      const q = P2[N].xy;
      ctx.beginPath(); ctx.arc(X(q[0]), Y(q[1]), 2.2, 0, 7); ctx.fill();
      if (W >= 460) { ctx.font = "600 9px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("JAJO"[mi], X(q[0]) + 6, Y(q[1])); }
    });
    const narrow = W < 460, hh = this._S.hour;
    const clock = hh === 0 ? "solar noon" : `noon ${hh > 0 ? "+" : "−"}${Math.abs(hh)}h`;
    const lines = [["#6d28d9", `φ = ${magSgn(lat)}° · ${clock}`], [col, `altitude ${A.aMin.toFixed(0)}°…${A.aMax.toFixed(0)}°`]];
    if (model === "globe") {
      if (A.below > 0) lines.push(["#b91c1c", narrow ? `horizon cuts the 8 — ${A.below} days below` : `the horizon cuts the 8: below it ${A.below} days/yr`]);
      else if (hh !== 0) lines.push(["#7d848f", narrow ? "tilted — parallactic turning" : "off-noon it leans — the parallactic turning"]);
      else lines.push(["#7d848f", Math.abs(lat) <= 23.44 ? "passes overhead — altitude caps at 90°" : "same rigid 8 — only rotated"]);
    } else {
      lines.push(["#7d848f", narrow ? `h tuned ${(hf.h / 1000).toFixed(0)}k km` : `sun height tuned: ${(hf.h / 1000).toFixed(0)}k km (${hf.cal})`]);
      lines.push(["#b91c1c", narrow ? `min alt ${flatMinAlt(lat, hf.h).toFixed(1)}° — never sets` : `min alt ever ${flatMinAlt(lat, hf.h).toFixed(1)}° — the horizon can never cut it`]);
    }
    magPanelBox(ctx, lines, narrow ? 9.5 : 11, narrow ? 13 : 16);
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText("degrees on the sky · level camera aimed at the mean Sun", W / 2, H - 8);
  },

  // -- chemin journalier (fisheye tout-ciel, équinoxe) ------------------------
  _drawPath() {
    const cv = this._el.path; if (!cv || this._root.hidden) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    const R = Math.min(W, H) / 2 - 26, cx = W / 2, cy = H / 2 + 6;
    const sky = (d) => {
      const alt = DEG(Math.asin(Math.max(-1, Math.min(1, d[2])))), az = Math.atan2(d[0], d[1]), r = (R * (90 - alt)) / 90;
      return [cx + r * Math.sin(az), cy - r * Math.cos(az), alt];
    };
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = "#eceae3";
    [30, 60].forEach((a) => { ctx.beginPath(); ctx.arc(cx, cy, (R * (90 - a)) / 90, 0, 7); ctx.stroke(); });
    ctx.fillStyle = "#5b6470"; ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy - R - 9); ctx.fillText("S", cx, cy + R + 9); ctx.fillText("zenith", cx, cy - 8);
    const lat = this._S.lat, hf = sunFlatH(lat);
    const seg = (dirFn, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; let open = false; ctx.beginPath();
      for (let i = 0; i <= 288; i++) {
        const q = sky(dirFn(-180 + (360 * i) / 288));
        if (q[2] < -1) { open = false; continue; }
        if (!open) { ctx.moveTo(q[0], q[1]); open = true; } else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke(); ctx.fillStyle = col;
      for (let hh = -12; hh < 12; hh++) { const q = sky(dirFn(hh * 15)); if (q[2] < -1) continue; ctx.beginPath(); ctx.arc(q[0], q[1], 2.6, 0, 7); ctx.fill(); }
    };
    seg((Hd) => sunDirG(lat, Hd), "#0f766e");
    seg((Ad) => sunDirF(lat, hf.h, Ad), "#b45309");
    const narrow = W < 460;
    magPanelBox(ctx, [
      ["#6d28d9", `φ = ${magSgn(lat)}° · equinox · dots hourly`],
      ["#0f766e", narrow ? "globe: circle arc, even dots" : "globe: circular arc, evenly spaced, meets the horizon"],
      ["#b45309", narrow ? "flat: lopsided, never sets" : "flat: lopsided loop, bunched dots, never touches the rim"],
    ], narrow ? 9.5 : 10.5, narrow ? 13 : 15);
  },

  // -- vitesse angulaire apparente ------------------------------------------
  _drawSpeed() {
    const cv = this._el.speed; if (!cv || this._root.hidden) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    const lat = this._S.lat, hf = sunFlatH(lat), s = sunSpeedCurves(lat, hf.h);
    this._speed = s;
    const ML = 44, MR = 12, MT = 14, MB = 30;
    const yHi = Math.min(90, Math.max(...s.spUA, ...s.spTB, 15) * 1.08), yLo = 0;
    const X = (tt) => ML + ((W - ML - MR) * (tt + 12)) / 24, Y = (v) => MT + ((H - MT - MB) * (yHi - v)) / (yHi - yLo);
    ctx.strokeStyle = "#eceae3"; ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
    for (let v = 0; v <= yHi; v += 15) {
      ctx.beginPath(); ctx.moveTo(ML, Y(v)); ctx.lineTo(W - MR, Y(v)); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(v + "°/h", ML - 4, Y(v));
    }
    for (let tt = -12; tt <= 12; tt += 6) {
      ctx.beginPath(); ctx.moveTo(X(tt), MT); ctx.lineTo(X(tt), H - MB); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(tt === 0 ? "noon" : tt > 0 ? "+" + tt + "h" : tt + "h", X(tt), H - MB + 5);
    }
    const curve = (ts, vs, col, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 0; i < ts.length; i++) { const y = Y(Math.min(vs[i], yHi)); i ? ctx.lineTo(X(ts[i]), y) : ctx.moveTo(X(ts[i]), y); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(ML, Y(15)); ctx.lineTo(W - MR, Y(15)); ctx.stroke();
    curve(s.tU, s.spUA, "#b45309");
    curve(s.tT, s.spTB, "#b45309", [5, 4]);
    const narrow = W < 460;
    magPanelBox(ctx, [
      ["#0f766e", "measured & globe: 15.0°/h, constant"],
      ["#b45309", narrow ? `flat uniform: ${s.uLo.toFixed(0)}–${s.uHi.toFixed(0)}°/h` : `flat, uniform spin (you): ${s.uLo.toFixed(0)}–${s.uHi.toFixed(0)}°/h`],
      ["#b45309", narrow ? `tuned for you → B sees ${s.bLo.toFixed(0)}–${s.bHi.toFixed(0)}°/h` : `track tuned for you → observer B (10°S) sees ${s.bLo.toFixed(0)}–${s.bHi.toFixed(0)}°/h`],
    ], narrow ? 9.5 : 10.5, narrow ? 13 : 15);
  },

  // -- cadran solaire : scène 2.5D, soleil FIXE, la planète tourne ----------
  _drawDial() {
    const cv = this._el.dial; if (!cv || this._root.hidden || this._three) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const D = this._D, narrow = W < 520;
    const sc = Math.min(W, H) * 0.30, cx = W / 2, cy = H / 2 + (narrow ? 34 : 14);
    const P = (p) => { const q = magRot(D, p); return [cx + q[0] * sc, cy - q[1] * sc, q[2]]; };
    const poly = (pts, c, w, d, cu, a) => magPoly(ctx, P, pts, c, w, d, cu, a);
    const sdir = SUN_DIR, the = D.earth;
    /* SENS DE ROTATION (2026-09-24). Le méridien 0 est à l'angle `ang` dans
       [cos a, ·, sin a]. Le legacy prenait ang = the : dans ce repère main
       droite, c'est une rotation vers l'OUEST, et les ombres des cadrans de
       l'hémisphère nord tournaient à l'envers. ang = 2·SUN_AZ − the tourne
       vers l'est, et garde midi (ang = SUN_AZ quand the = SUN_AZ) et
       sunDialHour(the) inchangés -- même correction que scene-sundial.js. */
    const ang = 2 * SUN_AZ - the;
    // planète : sphère ombrée, côtes qui tournent avec elle, face de nuit (globe25d)
    drawGlobe25(ctx, P, sc, {
      vec: (la, lo) => { const p = RAD(la), a = ang - RAD(lo); return [Math.cos(p) * Math.cos(a), Math.sin(p), Math.cos(p) * Math.sin(a)]; },
      sun: sdir,
    });
    poly([[0, -1.22, 0], [0, 1.22, 0]], "#0f766e", 1.4, null, false, .9);
    { const u = [-Math.sin(SUN_AZ), 0, Math.cos(SUN_AZ)], v = [0, -1, 0], pts = [];
      for (let i = 0; i <= 120; i++) { const tt = (2 * Math.PI * i) / 120; pts.push([u[0] * Math.cos(tt) + v[0] * Math.sin(tt), u[1] * Math.cos(tt) + v[1] * Math.sin(tt), u[2] * Math.cos(tt) + v[2] * Math.sin(tt)]); }
      poly(pts, "#7d848f", 1.1, [4, 4], true, .55); }
    /* LISIBILITÉ (2026-10-08). La géométrie était juste (même ombre que
       sunDialPlate, vérifié), mais illisible : plaques de 0,075 sous des
       gnomons de 0,20, ombre bornée à 0,30 qui débordait sur le globe, cadran
       « vous » posé sur celui de 35°, soleil collé au disque. Désormais :
       grande plaque claire avec ses lignes d'heure (sunDialPlate, la source
       des mini cadrans), ombre du style du pied jusqu'au bord de la plaque
       (comme sur un vrai cadran), rayon qui frôle la pointe pour le vôtre,
       soleil lointain à rayons parallèles, stations trop proches du vôtre
       omises. Les cadrans restent des symboles, pas à l'échelle. */
    const east = [Math.sin(ang), 0, -Math.cos(ang)];
    // méridien commun des cadrans : même heure locale pour tous
    { const m = []; for (let la = -90; la <= 90; la += 3) { const l = RAD(la); m.push([Math.cos(l) * Math.cos(ang), Math.sin(l), Math.cos(l) * Math.sin(ang)]); }
      poly(m, "#0f766e", 1.2, [2, 3], true, .55); }
    // soleil lointain : icône hors du disque, flèches parallèles vers le globe
    { const c0 = P([0, 0, 0]), sp = P(sdir), dx = sp[0] - c0[0], dy = sp[1] - c0[1], m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m;
      const r0 = sc * 1.42, sx = c0[0] + ux * r0, sy = c0[1] + uy * r0;
      ctx.strokeStyle = "#b45309"; ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.arc(sx, sy, 9, 0, 7); ctx.globalAlpha = .55; ctx.fill(); ctx.globalAlpha = 1;
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(sx, sy, 9, 0, 7); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = (Math.PI * i) / 4; ctx.beginPath(); ctx.moveTo(sx + 12 * Math.cos(a), sy + 12 * Math.sin(a)); ctx.lineTo(sx + 16 * Math.cos(a), sy + 16 * Math.sin(a)); ctx.stroke(); }
      ctx.lineWidth = 1.2; ctx.globalAlpha = .8;
      for (const o of [-16, 0, 16]) {
        const bx = sx - ux * 22 - uy * o, by = sy - uy * 22 + ux * o, ex = bx - ux * sc * 0.16, ey = by - uy * sc * 0.16;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + ux * 6 - uy * 3.5, ey + uy * 6 + ux * 3.5); ctx.moveTo(ex, ey); ctx.lineTo(ex + ux * 6 + uy * 3.5, ey + uy * 6 - ux * 3.5); ctx.stroke();
      }
      ctx.globalAlpha = 1; }
    const dial = (lat, hot) => {
      const l = RAD(lat), ct = Math.cos(ang), st = Math.sin(ang);
      const Pp = [Math.cos(l) * ct, Math.sin(l), Math.cos(l) * st];
      const p2 = P(Pp); if (p2[2] < 0.02) return;
      const g = lat >= 0 ? [0, 1, 0] : [0, -1, 0], PR = hot ? 0.17 : 0.14, L = hot ? 0.11 : 0.10;
      const e1 = [-Math.sin(l) * ct, Math.cos(l), -Math.sin(l) * st];
      // point de la plaque à r (unités planète) dans la direction (nord nc, est ec)
      const at = (r, nc, ec) => { const k = Math.hypot(nc, ec) || 1, a = (r * nc) / k, b = (r * ec) / k; return P([Pp[0] + a * e1[0] + b * east[0], Pp[1] + a * e1[1] + b * east[1], Pp[2] + a * e1[2] + b * east[2]]); };
      const q = sunDialPlate(lat, the), flat = Math.abs(lat) < 8, ink = hot ? "#6d28d9" : "#151a21";
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) { const a = (2 * Math.PI * i) / 48, s = at(PR, Math.cos(a), Math.sin(a)); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }
      ctx.fillStyle = q.lit ? "#fffdf5" : "#d6d3c9"; ctx.globalAlpha = .95; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = hot ? "#6d28d9" : "#5b6470"; ctx.lineWidth = hot ? 1.6 : 1.1; ctx.stroke();
      // lignes d'heure : sunDialPlate aux heures rondes (6 h et 18 h : plein est / ouest)
      if (!flat) for (let k = -6; k <= 6; k++) {
        const h = (k === -6 || k === 6) ? { lit: true, nc: 0, ec: k > 0 ? 1 : -1 } : sunDialPlate(lat, SUN_AZ + RAD(k * 15));
        if (!h.lit) continue;
        const a0 = at(PR * 0.3, h.nc, h.ec), a1 = at(PR, h.nc, h.ec);
        ctx.strokeStyle = k === 0 ? "#0f766e" : "#b7b1a2"; ctx.lineWidth = k === 0 ? 1.6 : (k % 3 === 0 ? 1.1 : 0.7);
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
      }
      const T = [Pp[0] + L * g[0], Pp[1] + L * g[1], Pp[2] + L * g[2]], t2 = P(T);
      if (q.lit) {
        // ombre du style : du pied jusqu'au bord de la plaque
        const x2 = at(PR, q.nc, q.ec);
        ctx.strokeStyle = "#262b33"; ctx.lineWidth = hot ? 4 : 3.4; ctx.globalAlpha = .82; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(x2[0], x2[1]); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt";
        if (hot) {
          // rayon de soleil qui frôle la pointe ; s'il touche la plaque, il y marque l'ombre de la pointe
          const dn = Math.hypot(q.nc, q.ec) * L, back = P([T[0] + 0.32 * sdir[0], T[1] + 0.32 * sdir[1], T[2] + 0.32 * sdir[2]]);
          const end = dn <= PR ? at(dn, q.nc, q.ec) : t2;
          ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.4; ctx.setLineDash([4, 3]);
          ctx.beginPath(); ctx.moveTo(back[0], back[1]); ctx.lineTo(t2[0], t2[1]); ctx.lineTo(end[0], end[1]); ctx.stroke(); ctx.setLineDash([]);
          if (dn <= PR) { ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(end[0], end[1], 2.6, 0, 7); ctx.fill(); }
        }
      } else if (hot || !narrow) {
        ctx.fillStyle = "#7d848f"; ctx.font = "600 9px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText("night", p2[0], p2[1] + 10);
      }
      ctx.strokeStyle = ink; ctx.lineWidth = hot ? 3 : 2.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(t2[0], t2[1]); ctx.stroke(); ctx.lineCap = "butt";
      const ext = P([T[0] + 0.11 * g[0], T[1] + 0.11 * g[1], T[2] + 0.11 * g[2]]);
      ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.globalAlpha = .6;
      ctx.beginPath(); ctx.moveTo(t2[0], t2[1]); ctx.lineTo(ext[0], ext[1]); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      if (!narrow || hot) {
        const lb = at(PR, 0, 1);   // étiquette à l'est de la plaque, hors de l'ombre de midi
        ctx.fillStyle = hot ? "#6d28d9" : "#5b6470"; ctx.font = "600 9px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(`${magSgn(lat)}°`, lb[0] + 5, lb[1]);
      }
    };
    // une station trop proche de votre latitude chevaucherait votre plaque : on l'omet
    SUND_STATIONS.filter((la) => Math.abs(la - this._S.lat) >= 20).forEach((la) => dial(la, false));
    dial(this._S.lat, true);
    const hh = sunDialHour(the);
    const clock = Math.abs(hh) < 0.05 ? "solar noon" : `noon ${hh > 0 ? "+" : "−"}${Math.abs(hh).toFixed(1)}h`;
    magPanelBox(ctx, [
      ["#6d28d9", `yours: φ = ${magSgn(this._S.lat)}° → gnomon tilt ${Math.abs(this._S.lat).toFixed(0)}°`],
      ["#151a21", "all gnomons parallel — aimed at the celestial pole"],
      ["#0f766e", `dials' local time: ${clock} — shadows in lock-step`],
      ["#b45309", "flat model: no stick direction survives the seasons"],
    ], narrow ? 9.5 : 10.5, narrow ? 13 : 15);
    ctx.fillStyle = "#7d848f"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText("sun fixed · the planet turns beneath it — drag to orbit", 10, H - 8);
  },

  // -- mini cadrans : lignes d'heure ET ombre depuis sunDialPlate -----------
  _drawFaces() {
    if (this._root.hidden) return;
    const D = this._D, hh = sunDialHour(D.earth);
    const clock = Math.abs(hh) < 0.05 ? "noon" : `noon${hh > 0 ? "+" : "−"}${Math.abs(hh).toFixed(1)}h`;
    const faces = [{ lat: 65 }, { lat: 35 }, { lat: 0 }, { lat: -30 }, { lat: this._S.lat, hot: true }];
    faces.forEach((F, fi) => {
      const cv = this._el.faces[fi]; if (!cv) return;
      const { ctx, W, H } = setupCanvas(cv);
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2 + 4, R = Math.min(W, H) / 2 - 20, col = F.hot ? "#6d28d9" : "#151a21";
      const p = sunDialPlate(F.lat, D.earth), equatorial = Math.abs(F.lat) < 8;
      ctx.fillStyle = p.lit ? "#fff" : "#efede6"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = "#b7b1a2"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.font = "600 9px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = col; ctx.fillText(`φ=${magSgn(F.lat)}°${F.hot ? " (yours)" : ""}`, 3, 2);
      const hourLabel = (x, y, txt) => { ctx.fillStyle = "#5b6470"; ctx.font = "8px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x, y); };
      if (equatorial) {
        for (let k = -6; k <= 6; k++) {
          const a = Math.PI + RAD(k * 15);
          ctx.strokeStyle = "#b7b1a2"; ctx.lineWidth = k % 3 === 0 ? 1.2 : 0.7;
          ctx.beginPath(); ctx.moveTo(cx + 0.28 * R * Math.sin(a), cy - 0.28 * R * Math.cos(a)); ctx.lineTo(cx + R * Math.sin(a), cy - R * Math.cos(a)); ctx.stroke();
          if (k % 3 === 0) hourLabel(cx + (R + 9) * Math.sin(a), cy - (R + 9) * Math.cos(a), String((12 + k + 24) % 24 || 12));
        }
        if (p.lit) {
          const a = Math.PI + RAD(hh * 15);
          ctx.strokeStyle = "#39414c"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.globalAlpha = .7;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 0.9 * R * Math.sin(a), cy - 0.9 * R * Math.cos(a)); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt";
        }
        ctx.fillStyle = "#7d848f"; ctx.font = "7.5px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText("equatorial dial — horizontal fails at 0°", cx, H - 2);
      } else {
        for (let k = -6; k <= 6; k++) {
          const q = (k === -6 || k === 6) ? { lit: true, nc: 0, ec: k > 0 ? 1 : -1 } : sunDialPlate(F.lat, SUN_AZ + RAD(k * 15));
          if (!q.lit) continue;
          const L2 = Math.hypot(q.nc, q.ec) || 1, ux = q.ec / L2, uy = q.nc / L2;
          ctx.strokeStyle = "#b7b1a2"; ctx.lineWidth = k % 3 === 0 ? 1.2 : 0.7;
          ctx.beginPath(); ctx.moveTo(cx + 0.16 * R * ux, cy - 0.16 * R * uy); ctx.lineTo(cx + R * ux, cy - R * uy); ctx.stroke();
          if (k % 3 === 0) hourLabel(cx + (R + 9) * ux, cy - (R + 9) * uy, String((12 + k + 24) % 24 || 12));
        }
        const gy = F.lat >= 0 ? 1 : -1;
        ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - gy * 0.5 * R); ctx.stroke(); ctx.lineCap = "butt";
        if (p.lit) {
          const L2 = Math.hypot(p.nc, p.ec) || 1;
          ctx.strokeStyle = "#39414c"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.globalAlpha = .7;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (0.9 * R * p.ec) / L2, cy - (0.9 * R * p.nc) / L2); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt";
        }
      }
      ctx.font = "600 9px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      if (p.lit) { ctx.fillStyle = "#0f766e"; ctx.fillText(`reads ${clock}`, cx, H - 13); } else { ctx.fillStyle = "#7d848f"; ctx.fillText("night", cx, H - 13); }
    });
  },

  // -- tableaux + expérience --------------------------------------------------
  _tables() {
    const t = this._t, lat = this._S.lat, T = sunTableRows(lat);
    const names = { 79: t("date-equinox"), 172: t("date-june"), 355: t("date-dec") };
    this._el.rows.innerHTML = T.rows.map((r) => `<tr><td>${names[r.N]}</td><td><b>${r.globe.toFixed(1)}°</b></td><td class="hot">${r.globe.toFixed(1)}°</td><td class="cold">${r.flat.toFixed(1)}°</td><td class="cold">${sgnDeg(r.err)}</td></tr>`).join("");
    const cal = T.hf.cal === "equinox" ? t("cal-equinox") : t("cal-june");
    this._el.note.innerHTML = fill(t("note-tpl"), { h: (T.hf.h / 1000).toFixed(1), cal, ratio: T.ratio.toFixed(1) });
    const sp = this._speed;
    if (sp) this._el.speedNote.innerHTML = fill(t("speed-note-tpl"), { lat: magSgn(lat), uLo: sp.uLo.toFixed(0), uHi: sp.uHi.toFixed(0), swing: (sp.uHi / Math.max(sp.uLo, .1)).toFixed(1), bLo: sp.bLo.toFixed(0), bHi: sp.bHi.toFixed(0) });
  },
};
