// Onglet "twi" (aube et crépuscule), porté du legacy
// (flat-or-globe-2.20.0.html, panneau id="tab-twi" ~L11570, drawTwi ~L24458
// et figures ~L23730-24456). Voir tasks/epic02/UC06.org.
//
// PORTÉE : tout le contenu du legacy -- figure 1 (plafond d'ombre, à
// l'ÉCHELLE VRAIE, jamais exagérée), figure 2 (chute en carré inverse sur
// neuf décades), figure 2b (les deux modèles côte à côte, animée : globe
// ombré par l'altitude du Soleil + carte plate en deux modes 1/r² et
// "ajusté" à 45° N), figure 3 (durées par latitude, trois asymptotes),
// figure 4 (arche anti-crépusculaire, SCHÉMATIQUE), quatre tableaux
// calculés, calculateur d'expérience 1f, section "hauteur de l'ombre",
// objections repliées, sources. La boucle rAF du panneau monde est arrêtée
// par teardown(). R vient de src/core/settings.js (le legacy lisait
// #radius de sim via twiR(), L23527 -- "R is read from tab 1's #radius
// like every other tab"), pas d'une constante : figure 1, ses tableaux
// (hauteur du plafond, tableau des seuils) et le tableau d'ombre en
// dépendent tous, comme dans le legacy.
import { makeT } from "../../core/i18n.js";
import { registerSources, renderSources } from "../../core/citations.js";
import { setupCanvas } from "../../core/canvas.js";
import { RAD, DEG } from "../../core/math.js";
import { SOURCES, FURTHER_READING } from "../../data/sources/twi.js";
import { COASTS } from "../../data/coasts.js";
import {
  TWI_RIM, TWI_MEAS, TWI_OBLIQ, TWI_SUNUP, TWI_HEIGHTS, TWI_PLACES, TWI_MOON, TWI_SHADOW_H, TWI_KM_PER_DEG,
  twiCeil, twiFlatE, twiFlatD, twiSpan, twiThreshold, twiThetaZ, twiwSubsolar, twiwUnit, twiwHA, twiAE, twiwColour, twiwZones, twiwFitAlt,
  TWIW_CAL, TWIW_H, TWIW_PRESETS, twiNum, twiDeg, twiwFmtLat, twiwFmtLon, twiwUTC,
  twiHtRows, twiFlatRows, twiDurRows, twiShadowRows, twiExperiment,
} from "./logic.js";
import { drawSymbols } from "../../core/symbols.js";
import { xrefsNav } from "../../core/tabs.js";
import { getSettings } from "../../core/settings.js";
import "./style.css";
import { evBadge } from "../../core/evidence.js";
import { makeAE, toScreen } from "../../core/aeproj.js";
import { strokeCoasts } from "../../core/aemap.js";
const TWI_MAP = makeAE({ rot: 180 });   // = twiAE à l'écran (cx + x·sc, cy + y·sc)

const KEY = "twi";
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
const TWI_LEGH = 15;

/** Légende à position fixe partagée par chaque figure (jamais positionnée par les données). */
function twiLegend(ctx, cx, top, maxW, items, dry) {
  ctx.font = "11px ui-monospace, Menlo, monospace";
  const SW = 15, PAD = 11, wOf = (it) => SW + 4 + ctx.measureText(it.t).width;
  const rows = [[]]; let cur = 0;
  items.forEach((it) => { const iw = wOf(it); if (cur && cur + PAD + iw > maxW) { rows.push([]); cur = 0; } rows[rows.length - 1].push(it); cur += (cur ? PAD : 0) + iw; });
  if (dry) return rows.length * TWI_LEGH;
  rows.forEach((row, r) => {
    const total = row.reduce((a, it) => a + wOf(it), 0) + PAD * (row.length - 1);
    let x = cx - total / 2; const y = top + r * TWI_LEGH + 4;
    row.forEach((it) => {
      ctx.strokeStyle = it.c; ctx.fillStyle = it.c; ctx.lineWidth = it.w || 2.2;
      if (it.k === "box") ctx.fillRect(x, y - 4, SW, 8);
      else if (it.k === "dot" || it.k === "hollow") {
        ctx.beginPath(); ctx.arc(x + SW / 2, y, 4.2, 0, 7);
        if (it.k === "dot") { ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.3; ctx.stroke(); } else { ctx.fillStyle = "#fdfdfc"; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); }
      } else if (it.k === "vdash") {
        ctx.setLineDash([3, 3]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + SW / 2, y - 6); ctx.lineTo(x + SW / 2, y + 6); ctx.stroke(); ctx.setLineDash([]);
      } else {
        ctx.setLineDash(it.k === "line" ? [] : [4, 3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + SW, y); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.fillStyle = "#5b6470"; ctx.textAlign = "left"; ctx.fillText(it.t, x + SW + 4, y + 4);
      x += wOf(it) + PAD;
    });
  });
  ctx.textAlign = "center";
  return rows.length * TWI_LEGH;
}

/** Soleil (2026-09-24) : halo + disque, à l'échelle de la figure, pas du ciel. */
function twiSunGlyph(ctx, x, y) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
  g.addColorStop(0, "rgba(255,221,120,1)"); g.addColorStop(0.35, "rgba(245,166,35,0.8)"); g.addColorStop(1, "rgba(245,166,35,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff6d5"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
}

export default {
  key: KEY,
  label: "Twilight",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", KEY);
    registerSources(KEY, SOURCES);
    this._t = t; this._root = container;
    this._W = { N: 189, utc: 11.25, mode: "fit", playing: false, last: 0, preset: "jul" };
    this._raf = null; this._buf = null;

    const fig = (id, reads, canvasCls, keys, cap) => `
      <div class="fig">${reads ? `<div class="reads" id="${reads}"></div>` : ""}<canvas id="${id}" class="${canvasCls || ""}"></canvas>
        ${keys ? `<ul class="figkey">${keys.map(([sw, k]) => `<li><span class="sw" data-sw="${sw}"></span><span>${t(k)}</span></li>`).join("")}</ul>` : ""}
        <div class="fcap">${t(cap)}</div></div>`;
    const fold = (qk, pk) => `<details class="fold q"><summary><b class="faq-q">${t(qk)}</b></summary><p class="cnav-lead">${t(pk)}</p></details>`;

    container.innerHTML = `
      <p class="eyebrow">${t("eyebrow")}</p>
      <h1>${t("h1")}</h1>
      ${fig("twiGeomCanvas", "twiGeomReads", "tall", [["twxs", "tw-k9"], ["twgraze", "tw-k10"], ["twshadow", "tw-k11"], ["twaxis", "tw-k12"]], "tw-fcap1")}
      <p class="cnav-lead">${t("tw-lead")}</p>
      <p class="cnav-lead">${t("tw-lead2")}</p>
      <div class="formula">
        <div class="big"><div class="ln"><span class="tex" data-tex="h = R\\left(\\sec\\theta - 1\\right) \\approx \\frac{R\\theta^2}{2}">h = R(sec θ − 1) ≈ Rθ²/2</span></div><div class="ln">θ = the Sun's depression below the horizon</div></div>
        <div class="figsym" id="twifig0"></div>
        <div class="gloss">${t("tw-gloss1")}</div>
      </div>
      <h2 class="cnav-h2" data-sec="tw-h1">${t("tw-h1")}${evBadge("twi", "tw-h1")}</h2>
      <p class="cnav-lead">${t("tw-p1")}</p><p class="cnav-lead">${t("tw-p1b")}</p><p class="cnav-lead">${t("tw-p2")}</p>
      <table class="cnav-table"><caption>${t("tw-cap1")}</caption>
        <thead><tr><th>${t("tw-th1")}</th><th>${t("tw-th2")}</th><th>${t("tw-th3")}</th><th>${t("tw-th4")}</th><th>${t("tw-th5")}</th></tr></thead><tbody id="twiHtRows"></tbody></table>
      <div class="callout">${t("tw-call1")}</div>

      <h2 class="cnav-h2" data-sec="tw-h2">${t("tw-h2")}${evBadge("twi", "tw-h2")}</h2>
      <p class="cnav-lead">${t("tw-p3")}</p>
      <div class="formula flat">
        <div class="big"><div class="ln"><span class="tex" data-tex="E(d) = \\frac{I H}{\\left(H^2 + d^2\\right)^{3/2}}">E(d) = I·H / (H² + d²)^{3/2}</span></div><div class="ln"><span class="tex" data-tex="\\vartheta(d) = \\frac{D}{\\sqrt{H^2 + d^2}}">ϑ(d) = D / √(H² + d²)</span></div></div>
        <div class="figsym" id="twifig1"></div>
        <div class="gloss">${t("tw-gloss2")}</div>
      </div>
      <p class="cnav-lead">${t("tw-p4")}</p>
      <div class="formula flat">
        <div class="big"><div class="ln"><span class="tex" data-tex="\\frac{E(d)}{E(0)} = \\left(\\frac{H}{r}\\right)^3 = \\left(\\frac{\\vartheta(d)}{\\vartheta(0)}\\right)^{3}">E(d)/E(0) = (H/r)³ = (ϑ(d)/ϑ(0))³</span></div></div>
        <div class="figsym" id="twifig2"></div>
        <div class="gloss">${t("tw-gloss3")}</div>
      </div>
      <p class="cnav-lead">${t("tw-p5")}</p><p class="cnav-lead">${t("tw-p5b")}</p>
      <table class="cnav-table"><caption>${t("tw-cap2")}</caption>
        <thead><tr><th>${t("tw-th6")}</th><th>${t("tw-th7")}</th><th>${t("tw-th8")}</th><th>${t("tw-th9")}</th><th>${t("tw-th10")}</th><th>${t("tw-th11")}</th></tr></thead><tbody id="twiFlatRows"></tbody></table>
      <div class="callout flatc">${t("tw-call2")}</div>
      <div class="callout flatc">${t("tw-call2b")}</div>
      ${fig("twiFallCanvas", null, "tall", [["twamber", "tw-k13"], ["twnight", "tw-k14"]], "tw-fcap2")}
      <p class="notes">${t("tw-p-gap")}</p>

      <h2 class="cnav-h2" data-sec="tw-h6">${t("tw-h6")}${evBadge("twi", "tw-h6")}</h2>
      <p class="cnav-lead">${t("tw-p14")}</p><p class="cnav-lead">${t("tw-p15")}</p><p class="cnav-lead">${t("tw-p15s")}</p>
      <div class="fig">
        <div class="preset-row">
          <span class="preset-lbl">${t("tw-anlbl1")}</span>
          <button type="button" class="presetbtn" id="twiDateJul" aria-pressed="true">${t("preset-jul")}</button>
          <button type="button" class="presetbtn" id="twiDateEqx" aria-pressed="false">${t("preset-eqx")}</button>
          <button type="button" class="presetbtn" id="twiDateDec" aria-pressed="false">${t("preset-dec")}</button>
          <span class="spacer"></span>
          <button type="button" class="presetbtn" id="twiModeInv" aria-pressed="false">${t("mode-inv")}</button>
          <button type="button" class="presetbtn" id="twiModeFit" aria-pressed="true">${t("mode-fit")}</button>
          <button type="button" class="presetbtn" id="twiPlay" aria-pressed="false" aria-label="Play or pause">&#9654;</button>
          <button type="button" class="presetbtn" id="twiReset" aria-label="Restart">&#8634;</button>
        </div>
        <div class="reads" id="twiWorldReads"></div>
        <canvas id="twiWorldCanvas" class="tall"></canvas>
        <ul class="figkey"><li><span class="sw" data-sw="twterm"></span><span>${t("tw-k1")}</span></li><li><span class="sw" data-sw="twtick"></span><span>${t("tw-k2")}</span></li><li><span class="sw" data-sw="twhollow"></span><span>${t("tw-k3")}</span></li><li><span class="sw" data-sw="twsolid"></span><span>${t("tw-k4")}</span></li></ul>
        <div class="fcap">${t("tw-fcap5")}</div>
      </div>
      <p class="notes">${t("tw-p15b")}</p><p class="notes">${t("tw-p15c")}</p>
      <p class="cnav-lead">${t("tw-p17")}</p><p class="cnav-lead">${t("tw-p17s")}</p>
      <div class="callout">${t("tw-call4")}</div><div class="callout">${t("tw-call4b")}</div>
      <p class="cnav-lead">${t("tw-p16")}</p><p class="cnav-lead">${t("tw-p16s")}</p><p class="cnav-lead">${t("tw-p16t")}</p>

      <h2 class="cnav-h2" data-sec="tw-h3">${t("tw-h3")}${evBadge("twi", "tw-h3")}</h2>
      <p class="cnav-lead">${t("tw-p6")}</p>
      <div class="formula">
        <div class="big"><div class="ln"><span class="tex" data-tex="\\cos H = \\frac{\\sin h - \\sin\\varphi\\sin\\delta}{\\cos\\varphi\\cos\\delta}">cos H = (sin h − sin φ sin δ) / (cos φ cos δ)</span></div><div class="ln"><span class="tex" data-tex="h_{\\min} = \\left|\\varphi + \\delta\\right| - 90\\deg">h_min = |φ + δ| − 90°</span></div></div>
        <div class="figsym" id="twifig3"></div>
        <div class="gloss">${t("tw-gloss4")}</div>
      </div>
      <p class="cnav-lead">${t("tw-p7")}</p><p class="cnav-lead">${t("tw-p7c")}</p>
      <table class="cnav-table"><caption>${t("tw-cap3")}</caption>
        <thead><tr><th>${t("tw-th12")}</th><th>${t("tw-th13")}</th><th>${t("tw-th14")}</th><th>${t("tw-th15")}</th><th>${t("tw-th16")}</th><th>${t("tw-th17")}</th><th>${t("tw-th18")}</th></tr></thead><tbody id="twiDurRows"></tbody></table>
      ${fig("twiDurCanvas", null, "tall", [["twsolidc", "tw-k5"], ["twvert", "tw-k6"], ["twequi", "tw-k7"], ["twring", "tw-k8"]], "tw-fcap3")}
      <p class="notes">${t("tw-p7b")}</p>
      <div class="callout">${t("tw-call3")}</div>

      <h2 class="cnav-h2" data-sec="tw-h4">${t("tw-h4")}</h2>
      <p class="cnav-lead">${t("tw-p8")}</p><p class="cnav-lead">${t("tw-p9")}</p>
      ${fig("twiArchCanvas", null, "tall", null, "tw-fcap4")}

      <h2 class="cnav-h2" data-sec="tw-h5">${t("tw-h5")}</h2>
      <p class="cnav-lead">${t("tw-refr")}</p>
      ${fold("tw-p10-q", "tw-p10")}${fold("tw-p11-q", "tw-p11")}${fold("tw-p12-q", "tw-p12")}${fold("tw-p13-q", "tw-p13")}

      <div class="exp">
        <div class="exp-h">${t("tw-exph")}</div><div class="exp-t">${t("tw-expt")}</div>
        <p class="exp-lead">${t("tw-explead")}</p>
        <div class="exp-grid"><div class="exp-var iv">${t("tw-expiv")}</div><div class="exp-var dv">${t("tw-expdv")}</div></div>
        <p class="exp-meta">${t("tw-expmeta")}</p>
        <div class="exp-calc">
          <div class="exp-inputs">
            <div class="field"><label for="expTwLat">${t("tw-lbl1")}</label><input type="number" id="expTwLat" value="48.86" min="-89" max="89" step="0.01"></div>
            <div class="field"><label for="expTwDec">${t("tw-lbl2")}</label><input type="number" id="expTwDec" value="23.44" min="-23.44" max="23.44" step="0.01"></div>
          </div>
          <div class="exp-out" id="expTwOut"></div><div class="exp-verdict" id="expTwVerd"></div>
        </div>
      </div>

      <section>
        <h2 class="cnav-h2" data-sec="tw2-h2">${t("tw2-h2")}${evBadge("twi", "tw2-h2")}</h2>
        <p class="cnav-lead">${t("tw2-p1")}</p>
        <div class="callout">${t("tw2-call1")}</div>
        <p class="cnav-lead">${t("tw2-p2")}</p>
        <table class="cnav-table"><caption>${t("tw2-cap")}</caption>
          <thead><tr><th>${t("tw2-th1")}</th><th>${t("tw2-th2")}</th><th>${t("tw2-th3")}</th><th>${t("tw2-th4")}</th><th>${t("tw2-th5")}</th></tr></thead><tbody id="twiShadowRows"></tbody></table>
        <div class="fcap">${t("tw2-foot")}</div>
      </section>

      <div class="exp">
        <div class="exp-h">${t("tw2-exph")}</div><div class="exp-t">${t("tw2-expt")}</div>
        <p class="exp-lead">${t("tw2-explead")}</p>
        <div class="exp-grid"><div class="exp-var iv">${t("tw2-expiv")}</div><div class="exp-var dv">${t("tw2-expdv")}</div></div>
        <p class="exp-meta">${t("tw2-expmeta")}</p><p class="exp-meta">${t("tw2-expverd")}</p>
      </div>

      <div class="notes"><p>${t("tw-n1")}</p><p>${t("tw-n2")}</p></div>
      ${xrefsNav(["sun", "ref", "dip", "azim"])}
      ${renderSources(KEY)}
      <section class="srcs reading"><h2>${t("rd-more")}</h2><div class="note">${t("rd-note")}</div><ul>${FURTHER_READING.map((h) => `<li>${h}</li>`).join("")}</ul></section>
    `;

    const q = (id) => container.querySelector("#" + id);
    drawSymbols(KEY); // schémas twifig0-3 + 14 swatches de légende (rattrapage UC11)
    this._el = {
      geom: q("twiGeomCanvas"), geomReads: q("twiGeomReads"), fall: q("twiFallCanvas"), world: q("twiWorldCanvas"), worldReads: q("twiWorldReads"),
      dur: q("twiDurCanvas"), arch: q("twiArchCanvas"), ht: q("twiHtRows"), flat: q("twiFlatRows"), durRows: q("twiDurRows"), shadow: q("twiShadowRows"), shadowFoot: q("twiShadowFoot"),
      lat: q("expTwLat"), dec: q("expTwDec"), out: q("expTwOut"), verd: q("expTwVerd"),
      btns: { jul: q("twiDateJul"), eqx: q("twiDateEqx"), dec: q("twiDateDec"), inv: q("twiModeInv"), fit: q("twiModeFit"), play: q("twiPlay"), reset: q("twiReset") },
    };
    // le <span id="twiShadowFoot"> vit dans la prose traduite : on le retrouve après injection
    this._el.shadowFoot = container.querySelector("#twiShadowFoot");
    for (const k of ["jul", "eqx", "dec"]) this._el.btns[k].addEventListener("click", () => this._setPreset(k));
    for (const m of ["inv", "fit"]) this._el.btns[m].addEventListener("click", () => { this._W.mode = m; this._syncButtons(); this._drawWorld(); this._worldReads(); });
    this._el.btns.play.addEventListener("click", () => { this._W.playing = !this._W.playing; this._W.last = 0; this._syncButtons(); });
    this._el.btns.reset.addEventListener("click", () => this._setPreset(this._W.preset));
    this._el.lat.addEventListener("input", () => this._experiment());
    this._el.dec.addEventListener("input", () => this._experiment());
    // export (epic10/UC02) : un jour complet (24 h en 24 s), depuis l'heure affichée ;
    // readout : les lectures de la page sous la carte
    let saved = null;
    this._el.world.__anim = {
      duration: 24,
      begin: () => { saved = { ...this._W }; if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; } },
      frameAt: (t) => { this._W.utc = (saved.utc + t) % 24; this._drawWorld(); this._worldReads(); },
      end: () => { Object.assign(this._W, saved, { last: 0 }); saved = null; this._drawWorld(); this._worldReads(); if (!this._root.hidden) this._loop(); },
      readout: () => this._el.worldReads?.querySelector("#twiWorldWhen")?.textContent.replace(/\s+/g, " ").trim(),
    };
    // deux plans au choix (1/r² ou ajusté) : une carte exportée (epic11) les montre tous les deux
    this._el.world.__crop = (name) => this._crops?.[name];
    this._el.world.__variant = { get: () => this._W.mode, set: (m) => { this._W.mode = m; this._syncButtons(); this._drawWorld(); this._worldReads(); } };
  },

  render() {
    this._experiment();
    if (this._root.hidden) return;
    this._tables();
    this._drawGeom(); this._drawFall(); this._drawDur(); this._drawArch();
    this._syncButtons(); this._drawWorld(); this._worldReads();
    if (this._raf == null) { this._W.last = 0; this._loop(); }
    const R = getSettings().R;
    this._el.geomReads.innerHTML = fill(this._t("geom-reads-tpl"), { R: Math.round(R).toLocaleString("en-US"), h6: twiCeil(R, 6).toFixed(0), h12: twiCeil(R, 12).toFixed(0), h18: twiCeil(R, 18).toFixed(0) });
  },

  teardown() {
    if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; }
  },

  _loop() {
    const step = (ts) => {
      if (this._root.hidden) { this._raf = null; return; }
      const W = this._W;
      if (W.playing) {
        // ~30 images/s : l'ombrage est calculé pixel par pixel sur deux
        // panneaux, inutile de le refaire 60 fois (machine du propriétaire)
        if (W.last && ts - W.last < 32) { this._raf = requestAnimationFrame(step); return; }
        if (W.last) W.utc = (W.utc + (ts - W.last) / 1000) % 24; // un jour en 24 s
        W.last = ts; this._drawWorld(); this._worldReads();
      } else W.last = 0;
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  },

  _setPreset(key) {
    const P = TWIW_PRESETS[key]; if (!P) return;
    Object.assign(this._W, { N: P.N, utc: P.utc, preset: key, playing: false, last: 0 });
    this._syncButtons(); this._drawWorld(); this._worldReads();
  },
  _syncButtons() {
    const b = this._el.btns, W = this._W;
    for (const k of ["jul", "eqx", "dec"]) b[k].setAttribute("aria-pressed", String(W.preset === k));
    for (const m of ["inv", "fit"]) b[m].setAttribute("aria-pressed", String(W.mode === m));
    b.play.textContent = W.playing ? "▍▍" : "▶"; b.play.setAttribute("aria-pressed", String(W.playing));
  },

  // ---- tableaux ----
  _tables() {
    const t = this._t, e = this._el, R = getSettings().R;
    const stage = { sunset: t("stage-sunset"), civil: t("stage-civil"), naut: t("stage-naut"), astro: t("stage-astro") };
    e.ht.innerHTML = twiHtRows(R).map((r) => `<tr><td>${stage[r.key]}</td><td>${Math.abs(r.end).toFixed(0)}°</td><td><b>${r.h < 1 ? r.h.toFixed(1) : Math.round(r.h).toLocaleString("en-US")} km</b></td><td>${r.frac.toFixed(2)} %</td><td>${t(r.layer)}</td></tr>`).join("");
    e.flat.innerHTML = twiFlatRows().map((r) => {
      const sz = r.th < 1 ? (r.th * 60).toFixed(1) + "″" : r.th.toFixed(1) + "′";
      return `<tr${r.forced ? ' class="forced"' : ""}><td>${r.forced ? `<b>${r.H.toFixed(0)} km</b> — ${t("forced")}` : Math.round(r.H).toLocaleString("en-US") + " km"}</td><td>${r.d.toLocaleString("en-US")} km</td><td>1 / ${twiNum(1 / r.E)}</td><td>${sz}</td><td>1 / 100,000,000</td><td>${r.forced ? t("matches") : twiNum(r.shortBy) + " ×"}</td></tr>`;
    }).join("");
    const mn = (o) => (o.all ? t("all-night") : o.none ? "—" : Math.round(o.min) + " min");
    e.durRows.innerHTML = twiDurRows().map((r) => {
      const hot = r.midnight > -18 && r.midnight < 0;
      return `<tr><td>${r.first ? r.place : ""}</td><td>${r.first ? r.lat.toFixed(2).replace("-", "−") + "°" : ""}</td><td>${t("date-" + r.date)}</td><td>${mn(r.civil)}</td><td>${mn(r.naut)}</td><td>${mn(r.astro)}</td><td>${hot ? "<b>" : ""}${twiDeg(r.midnight)}${hot ? "</b>" : ""}</td></tr>`;
    }).join("");
    e.shadow.innerHTML = twiShadowRows(R).map((r) => `<tr><td>${r.th.toFixed(1)}°</td>${r.tops.map((a) => `<td>${a === null ? t("whole-sky") : "<b>" + a.toFixed(2) + "°</b>"}</td>`).join("")}<td>${r.a15 === null ? "—" : "× " + (r.a15 / r.th).toFixed(2)}</td></tr>`).join("");
    if (e.shadowFoot) e.shadowFoot.innerHTML = TWI_SHADOW_H.map((H) => `H = ${H} km → <b>θ<sub>z</sub> = ${twiThetaZ(H, R).toFixed(2)}°</b>`).join(" · ");
  },

  _experiment() {
    const t = this._t, e = this._el;
    const phi = parseFloat(e.lat.value), dec = parseFloat(e.dec.value);
    if (!isFinite(phi) || !isFinite(dec)) { e.out.textContent = "—"; return; }
    const r = twiExperiment(phi, dec);
    const f = (o) => (o.all ? t("exp-never-ends") : o.none ? t("exp-no-rise") : Math.round(o.min) + " min");
    const m = r.midnight.toFixed(2).replace("-", "−");
    e.out.innerHTML = fill(t("exp-out-tpl"), { c: f(r.civil), n: f(r.naut), a: f(r.astro), t: f(r.total), m, thr18: r.thr18.toFixed(1), thr12: r.thr12.toFixed(1), thr6: r.thr6.toFixed(1) });
    e.verd.innerHTML = r.astro.all
      ? fill(t("exp-verd-all-tpl"), { phi: Math.abs(phi).toFixed(2), dec: dec.toFixed(2), m })
      : fill(t("exp-verd-tpl"), { t: f(r.total), c: f(r.civil), dlat: (r.thr18 - Math.abs(phi)).toFixed(1) });
  },

  // ================= figure 1 : le plafond d'ombre, à l'ÉCHELLE VRAIE =================
  _drawGeom() {
    const cv = this._el.geom; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, R = getSettings().R, TH = 18, barW = narrow ? 0 : 128, LW = W - barW;
    const span = RAD(92), hMax = twiCeil(R, TH), wKm = 2 * R * Math.sin(Math.min(span, Math.PI / 2)), hKm = R * (1 - Math.cos(span)) + hMax;
    const geomItems = [
      { k: "line", c: "#c9a227", t: narrow ? "sunlight" : "grazing sunlight", w: 2 },
      { k: "box", c: "rgba(21,26,33,.16)", t: narrow ? "shadow" : "planet's shadow" },
      { k: "line", c: "#0f766e", t: narrow ? "ceiling" : "shadow ceiling", w: 2 },
    ];
    ctx.font = "11px ui-monospace, Menlo, monospace";
    const legH = twiLegend(ctx, LW / 2, 0, LW - 12, geomItems, true);
    const s = Math.min((LW - 84) / wKm, (H - 62 - legH) / hKm);
    const cx = LW / 2, cyTop = 26 + hMax * s;
    const Wpx = (x, y) => ({ x: cx + x * s, y: cyTop + (R - y) * s });
    const Ppx = (a, alt) => Wpx((R + alt) * Math.sin(a), (R + alt) * Math.cos(a));
    const arc = (alt, from, to, n) => { for (let i = 0; i <= n; i++) { const a = from + ((to - from) * i) / n, p = Ppx(a, alt); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } };
    const th = RAD(TH), dir = { x: Math.cos(th), y: -Math.sin(th) }, perp = { x: Math.sin(th), y: Math.cos(th) };
    const T = { x: R * Math.sin(th), y: R * Math.cos(th) }, tMax = R * (Math.tan(th) + Math.sin(span) + 0.35);
    ctx.beginPath(); arc(0, th, -span, 120);
    const sh = Wpx(T.x - tMax * dir.x, T.y + tMax * dir.y); ctx.lineTo(sh.x, sh.y);
    const t0 = Wpx(T.x, T.y); ctx.lineTo(t0.x, t0.y); ctx.closePath(); ctx.fillStyle = "rgba(21,26,33,.09)"; ctx.fill();
    ctx.beginPath(); arc(0, -span, span, 200);
    ctx.lineTo(Wpx(R * Math.sin(span), -R).x, H); ctx.lineTo(Wpx(-R * Math.sin(span), -R).x, H); ctx.closePath(); ctx.fillStyle = "#efece3"; ctx.fill();
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 1.6; ctx.beginPath(); arc(0, -span, span, 200); ctx.stroke();
    const o = Ppx(0, 0);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(o.x - LW * 0.44, o.y); ctx.lineTo(o.x + LW * 0.44, o.y); ctx.stroke(); ctx.setLineDash([]);
    [0, 220, 440, 660].forEach((n, i) => {
      const A = { x: T.x + n * perp.x + tMax * dir.x, y: T.y + n * perp.y - tMax * dir.y }, B = { x: T.x + n * perp.x - tMax * dir.x, y: T.y + n * perp.y + tMax * dir.y };
      const a = Wpx(A.x, A.y), b = Wpx(B.x, B.y);
      ctx.strokeStyle = "#c9a227"; ctx.lineWidth = i ? 1.1 : 2.0; ctx.globalAlpha = i ? 0.55 : 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.globalAlpha = 1;
    });
    [[6, "rgba(180,83,9,.6)"], [12, "rgba(180,83,9,.85)"], [18, "#0f766e"]].forEach(([deg, col]) => {
      const p = Ppx(RAD(deg), 0); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 7); ctx.fill();
      const c = Ppx(0, twiCeil(R, deg)); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(c.x - 9, c.y); ctx.lineTo(c.x + 9, c.y); ctx.stroke();
    });
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(o.x, o.y, 3.5, 0, 7); ctx.fill();
    ctx.textAlign = "center"; ctx.fillStyle = "#5b6470"; ctx.fillText("true scale — no exaggeration", LW / 2, H - legH - 10);
    twiLegend(ctx, LW / 2, H - legH - 4, LW - 12, geomItems);
    if (narrow) return;
    const bx = LW + 12, bw = barW - 34, top = 34, bot = H - 42, KM = 400, Y = (km) => bot - (km / KM) * (bot - top);
    ctx.strokeStyle = "rgba(21,26,33,.10)"; ctx.lineWidth = 1;
    [0, 100, 200, 300, 400].forEach((k) => { ctx.beginPath(); ctx.moveTo(bx, Y(k)); ctx.lineTo(bx + bw, Y(k)); ctx.stroke(); ctx.fillStyle = "#8b93a0"; ctx.textAlign = "right"; ctx.fillText(k, bx - 4, Y(k) + 4); });
    [[0, 12, "#cfe0ee"], [12, 50, "#e2eadf"], [50, 85, "#efe8d8"], [85, KM, "#f5f3ee"]].forEach(([a, b, c]) => { ctx.fillStyle = c; ctx.fillRect(bx, Y(b), bw, Y(a) - Y(b)); });
    ctx.strokeStyle = "rgba(21,26,33,.18)"; ctx.strokeRect(bx, Y(KM), bw, Y(0) - Y(KM));
    [[6, "rgba(180,83,9,.75)"], [12, "rgba(180,83,9,.95)"], [18, "#0f766e"]].forEach(([deg, col]) => {
      const y = Y(twiCeil(R, deg)); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
      ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(deg + "°", bx + bw + 3, y + 4);
    });
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("km above you", bx + bw / 2, H - 6); ctx.fillText("shadow ceiling", bx + bw / 2, 20);
  },

  // ================= figure 2 : la chute en carré inverse =================
  _drawFall() {
    const cv = this._el.fall; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560;
    const items = [{ k: "line", c: "#b45309", t: narrow ? "1/r², 4 Sun heights" : "inverse square, Sun 1,000–10,000 km up" }, { k: "box", c: "rgba(15,118,110,.35)", t: narrow ? "measured night" : "measured night, eight decades down" }];
    ctx.font = "11px ui-monospace, Menlo, monospace";
    const legH = twiLegend(ctx, W / 2, 0, W - 16, items, true);
    const padL = narrow ? 40 : 56, padR = narrow ? 16 : 118, padT = 18, padB = 44 + legH, Wd = W - padL - padR, Hd = H - padT - padB, DEC = 9;
    const X = (d) => padL + (d / TWI_RIM) * Wd, Y = (l) => padT + (-l / DEC) * Hd;
    ctx.strokeStyle = "rgba(21,26,33,.10)"; ctx.lineWidth = 1;
    for (let l = 0; l >= -DEC; l--) {
      ctx.beginPath(); ctx.moveTo(padL, Y(l)); ctx.lineTo(padL + Wd, Y(l)); ctx.stroke();
      ctx.fillStyle = "#8b93a0"; ctx.textAlign = "right";
      ctx.fillText(l === 0 ? "1" : "10" + String(l).replace("-", "⁻").replace(/[0-9]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]), padL - 5, Y(l) + 4);
    }
    [0, 5000, 10000, 15000, 20000].forEach((d) => { ctx.beginPath(); ctx.moveTo(X(d), padT); ctx.lineTo(X(d), padT + Hd); ctx.stroke(); ctx.fillStyle = "#8b93a0"; ctx.textAlign = "center"; ctx.fillText(d ? d / 1000 + "k" : "0", X(d), padT + Hd + 14); });
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("km from the point under the Sun", padL + Wd / 2, padT + Hd + 30);
    ctx.fillStyle = "rgba(15,118,110,.16)"; ctx.fillRect(padL, Y(-8), Wd, Y(-9) - Y(-8));
    ctx.strokeStyle = "#0f766e"; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(padL, Y(-8)); ctx.lineTo(padL + Wd, Y(-8)); ctx.stroke(); ctx.setLineDash([]);
    TWI_HEIGHTS.forEach((Hs, i) => {
      ctx.strokeStyle = "#b45309"; ctx.globalAlpha = 0.35 + 0.65 * (1 - i / (TWI_HEIGHTS.length - 1)); ctx.lineWidth = 2.2; ctx.beginPath();
      for (let k = 0; k <= 200; k++) { const d = (TWI_RIM * k) / 200, l = Math.log10(twiFlatE(Hs, d)); k ? ctx.lineTo(X(d), Y(l)) : ctx.moveTo(X(d), Y(l)); }
      ctx.stroke();
      if (!narrow) { ctx.globalAlpha = 1; ctx.fillStyle = "#b45309"; ctx.textAlign = "left"; ctx.fillText("H = " + Hs / 1000 + ",000 km", padL + Wd + 6, Y(Math.log10(twiFlatE(Hs, TWI_RIM))) + 4); }
      ctx.globalAlpha = 1;
    });
    if (!narrow) { ctx.fillStyle = "#0f766e"; ctx.textAlign = "left"; ctx.fillText("measured night", padL + Wd + 6, Y(-8.5) + 4); }
    twiLegend(ctx, W / 2, H - legH - 6, W - 16, items);
    ctx.save(); ctx.translate(12, padT + Hd / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("light on the ground ÷ noon", 0, 0); ctx.restore();
  },

  // ================= figure 2b : les deux modèles côte à côte, animée =================
  _drawWorld() {
    const cv = this._el.world; if (!cv || this._root.hidden) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, TW = this._W;
    const sub = twiwSubsolar(TW.N, TW.utc), dec = sub.lat, s = twiwUnit(sub.lat, sub.lon);
    const top = 30, bot = H - 30, Rpx = Math.min((W / 2 - 28) / 2, (bot - top) / 2), cy = (top + bot) / 2, cxG = W / 4, cxF = (3 * W) / 4;
    const D = Math.max(2, Math.round(Rpx * 2));
    if (!this._buf || this._buf.width !== D) { this._buf = document.createElement("canvas"); this._buf.width = this._buf.height = D; }
    const buf = this._buf, bctx = buf.getContext("2d");
    // ---- panneau A : le globe, caméra fixe par rapport au Soleil ----
    const img = bctx.createImageData(D, D), px = img.data;
    const camLat = 12, camLon = sub.lon + 75, k = twiwUnit(camLat, camLon);
    const e = [-Math.sin(RAD(camLon)), Math.cos(RAD(camLon)), 0];
    const n = [k[1] * e[2] - k[2] * e[1], k[2] * e[0] - k[0] * e[2], k[0] * e[1] - k[1] * e[0]];
    for (let j = 0; j < D; j++) {
      const b = 1 - (2 * (j + 0.5)) / D;
      for (let i = 0; i < D; i++) {
        const a = (2 * (i + 0.5)) / D - 1, qq = a * a + b * b, o = (j * D + i) * 4;
        if (qq > 1) { px[o + 3] = 0; continue; }
        const c = Math.sqrt(1 - qq);
        const Px = a * e[0] + b * n[0] + c * k[0], Py = a * e[1] + b * n[1] + c * k[1], Pz = a * e[2] + b * n[2] + c * k[2];
        const col = twiwColour(DEG(Math.asin(Math.max(-1, Math.min(1, Px * s[0] + Py * s[1] + Pz * s[2])))));
        px[o] = col[0]; px[o + 1] = col[1]; px[o + 2] = col[2]; px[o + 3] = 255;
      }
    }
    bctx.putImageData(img, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(cxG, cy, Rpx, 0, 7); ctx.clip();
    ctx.drawImage(buf, cxG - Rpx, cy - Rpx, Rpx * 2, Rpx * 2);
    const GP = (lat, lon) => { const P = twiwUnit(lat, lon); return P[0] * k[0] + P[1] * k[1] + P[2] * k[2] <= 0 ? null : [cxG + (P[0] * e[0] + P[1] * e[1] + P[2] * e[2]) * Rpx, cy - (P[0] * n[0] + P[1] * n[1] + P[2] * n[2]) * Rpx]; };
    ctx.strokeStyle = "rgba(21,26,33,.45)"; ctx.lineWidth = 0.8;
    for (const L of COASTS) {
      let x = L[0], y = L[1], prev = GP(y / 10, x / 10), open = false; ctx.beginPath();
      for (let i = 2; i < L.length; i += 2) {
        x += L[i]; y += L[i + 1]; const p = GP(y / 10, x / 10);
        if (p && prev) { open ? ctx.lineTo(p[0], p[1]) : (ctx.moveTo(prev[0], prev[1]), ctx.lineTo(p[0], p[1]), (open = true)); } else open = false;
        prev = p;
      }
      ctx.stroke();
    }
    const perp1 = Math.abs(s[2]) < 0.9 ? [-s[1], s[0], 0] : [1, 0, 0], L1 = Math.hypot(perp1[0], perp1[1], perp1[2]);
    const u1 = [perp1[0] / L1, perp1[1] / L1, perp1[2] / L1], u2 = [s[1] * u1[2] - s[2] * u1[1], s[2] * u1[0] - s[0] * u1[2], s[0] * u1[1] - s[1] * u1[0]];
    [[0, "#8a7f63", 1.5], [-6, "rgba(255,255,255,.5)", 1], [-12, "rgba(255,255,255,.4)", 1], [-18, "rgba(255,255,255,.35)", 1]].forEach(([alt, col, lw]) => {
      const g = RAD(90 - alt), cg = Math.cos(g), sg = Math.sin(g);
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); let open = false;
      for (let tt = 0; tt <= 240; tt++) {
        const w = (tt / 240) * 2 * Math.PI, cw = Math.cos(w), sw = Math.sin(w);
        const P = [cg * s[0] + sg * (cw * u1[0] + sw * u2[0]), cg * s[1] + sg * (cw * u1[1] + sw * u2[1]), cg * s[2] + sg * (cw * u1[2] + sw * u2[2])];
        if (P[0] * k[0] + P[1] * k[1] + P[2] * k[2] <= 0) { open = false; continue; }
        const X = cxG + (P[0] * e[0] + P[1] * e[1] + P[2] * e[2]) * Rpx, Y = cy - (P[0] * n[0] + P[1] * n[1] + P[2] * n[2]) * Rpx;
        open ? ctx.lineTo(X, Y) : (ctx.moveTo(X, Y), (open = true));
      }
      ctx.stroke();
    });
    { const q = GP(sub.lat, sub.lon); if (q) twiSunGlyph(ctx, q[0], q[1]); }  // le point subsolaire
    ctx.restore();
    // liseré d'atmosphère (2026-09-24)
    { const g = ctx.createRadialGradient(cxG, cy, Rpx * 0.98, cxG, cy, Rpx * 1.1);
      g.addColorStop(0, "rgba(106,169,216,0.5)"); g.addColorStop(1, "rgba(106,169,216,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cxG, cy, Rpx * 1.1, 0, 7); ctx.arc(cxG, cy, Rpx, 0, 7, true); ctx.fill(); }
    ctx.beginPath(); ctx.arc(cxG, cy, Rpx, 0, 7); ctx.strokeStyle = "#b7b1a2"; ctx.lineWidth = 1.4; ctx.stroke();
    // ---- panneau B : la carte plate ----
    const Sm = twiAE(sub.lat, sub.lon), sc = Rpx / 180;
    const FX = (p) => cxF + p.x * sc, FY = (p) => cy + p.y * sc, Spx = { x: FX(Sm), y: FY(Sm) };
    const zones = twiwZones(sub);
    const img2 = bctx.createImageData(D, D), p2 = img2.data;
    for (let j = 0; j < D; j++) for (let i = 0; i < D; i++) {
      const o = (j * D + i) * 4, gx = ((2 * (i + 0.5)) / D - 1) * 180, gy = ((2 * (j + 0.5)) / D - 1) * 180;
      if (Math.hypot(gx, gy) > 180) { p2[o + 3] = 0; continue; }
      const d = Math.hypot(gx - Sm.x, gy - Sm.y);
      let col;
      if (TW.mode === "inv") {
        const E = Math.pow(TWIW_H / Math.hypot(TWIW_H, d * TWI_KM_PER_DEG), 3);
        col = twiwColour(90 + (Math.max(-9, Math.log10(E)) / 9) * 120);
      } else col = twiwColour(twiwFitAlt(d, zones));
      p2[o] = col[0]; p2[o + 1] = col[1]; p2[o + 2] = col[2]; p2[o + 3] = 255;
    }
    bctx.putImageData(img2, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(cxF, cy, Rpx, 0, 7); ctx.clip();
    ctx.drawImage(buf, cxF - Rpx, cy - Rpx, Rpx * 2, Rpx * 2);
    // epic18 : projection et côtes du moteur commun (twiAE = makeAE tournée de 180°, parité testée) ;
    // pas de terres remplies ici -- le fond du disque EST l'éclairement calculé
    const TWI_S = toScreen({ cx: cxF, cy, Rpx }), MP = (lat, lon) => TWI_S(TWI_MAP.fwd(lat, lon));
    strokeCoasts(ctx, TWI_MAP, TWI_S, { color: "rgba(21,26,33,.45)", width: 0.8, jump: 400 });
    if (TW.mode === "fit") zones.forEach((z, i) => { if (z.r === null) return; ctx.strokeStyle = i ? "rgba(255,255,255,.45)" : "#8a7f63"; ctx.lineWidth = i ? 1 : 1.5; ctx.beginPath(); ctx.arc(Spx.x, Spx.y, z.r * sc, 0, 7); ctx.stroke(); });
    const termPt = (w) => { const cw = Math.cos(w), sw = Math.sin(w); return [cw * u1[0] + sw * u2[0], cw * u1[1] + sw * u2[1], cw * u1[2] + sw * u2[2]]; };
    const toMap = (P) => MP(DEG(Math.asin(Math.max(-1, Math.min(1, P[2])))), DEG(Math.atan2(P[1], P[0])));
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]); ctx.beginPath();
    for (let tt = 0; tt <= 240; tt++) { const qq = toMap(termPt((tt / 240) * 2 * Math.PI)); tt ? ctx.lineTo(qq[0], qq[1]) : ctx.moveTo(qq[0], qq[1]); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(15,118,110,.75)"; ctx.lineWidth = 1.2;
    for (let tt = 0; tt < 48; tt++) {
      const P = termPt((tt / 48) * 2 * Math.PI), eps = 0.06, Q = [P[0] - eps * s[0], P[1] - eps * s[1], P[2] - eps * s[2]], L = Math.hypot(Q[0], Q[1], Q[2]);
      const a = toMap(P), b = toMap([Q[0] / L, Q[1] / L, Q[2] / L]), dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy);
      if (!m || m > Rpx) continue;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + (dx / m) * 6, a[1] + (dy / m) * 6); ctx.stroke();
    }
    const ha0 = twiwHA(0, TWIW_CAL, dec);
    if (ha0 !== null && TW.mode === "fit") [[sub.lon - ha0, false], [sub.lon + ha0, true]].forEach(([lon, filled]) => {
      const qq = MP(TWIW_CAL, lon); ctx.beginPath(); ctx.arc(qq[0], qq[1], 4.2, 0, 7);
      ctx.fillStyle = filled ? "#b45309" : "#fdfdfc"; ctx.fill(); ctx.strokeStyle = filled ? "#fff" : "#b45309"; ctx.lineWidth = filled ? 1.4 : 2; ctx.stroke();
    });
    twiSunGlyph(ctx, Spx.x, Spx.y);   // la lampe du modèle plat, au-dessus de ce point
    ctx.restore();
    ctx.beginPath(); ctx.arc(cxF, cy, Rpx, 0, 7); ctx.strokeStyle = "#b7b1a2"; ctx.lineWidth = 1.4; ctx.stroke();
    // ---- titres fixes + légende ----
    ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#5b6470";
    ctx.fillText("globe — exact geometry", cxG, top - 12);
    ctx.fillText(TW.mode === "inv" ? "plane — inverse square" : "plane — fitted at 45° N", cxF, top - 12);
    ctx.fillText(narrow ? "Sun-fixed view" : "viewpoint fixed to the Sun; the Earth turns under it", cxG, bot + 18);
    const ly = bot + 18, lab1 = narrow ? "real edge" : "real edge, ticks to night", lab2 = narrow ? "rise" : "sunrise", lab3 = narrow ? "set" : "sunset", fit = TW.mode === "fit";
    const w1 = ctx.measureText(lab1).width, w2 = ctx.measureText(lab2).width, w3 = ctx.measureText(lab3).width, gapL = narrow ? 7 : 11, swatch = 15;
    let total = swatch + 4 + w1; if (fit) total += gapL + 9 + 4 + w2 + gapL + 9 + 4 + w3;
    // découpes pour les cartes exportées (epic11) : chaque disque au plus près, sans son titre (la carte
    // l'étiquette), avec sa légende ; la largeur du plan est celle de la légende la plus longue (mode
    // « fit »), pour que les deux plans d'une carte aient la même taille
    const capW = ctx.measureText(narrow ? "Sun-fixed view" : "viewpoint fixed to the Sun; the Earth turns under it").width;
    const legFit = swatch + 4 + w1 + gapL + 9 + 4 + w2 + gapL + 9 + 4 + w3;
    const cut = (cx, halfW, x0, x1) => { const a = Math.max(x0, cx - halfW), b = Math.min(x1, cx + halfW); return { x: a, y: top - 4, w: b - a, h: bot + 24 - (top - 4) }; };
    this._crops = { globe: cut(cxG, Math.max(Rpx + 4, capW / 2 + 4), 0, W / 2), flat: cut(cxF, Math.max(Rpx + 4, legFit / 2 + 4), W / 2, W) };
    let lx = cxF - total / 2;
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx + swatch, ly - 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(15,118,110,.75)"; ctx.lineWidth = 1.2;
    [4, 11].forEach((o2) => { ctx.beginPath(); ctx.moveTo(lx + o2, ly - 4); ctx.lineTo(lx + o2, ly + 1); ctx.stroke(); });
    ctx.textAlign = "left"; ctx.fillStyle = "#5b6470"; ctx.fillText(lab1, lx + swatch + 4, ly);
    if (fit) {
      lx += swatch + 4 + w1 + gapL;
      ctx.beginPath(); ctx.arc(lx + 4.5, ly - 4, 4.2, 0, 7); ctx.fillStyle = "#fdfdfc"; ctx.fill(); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#5b6470"; ctx.fillText(lab2, lx + 13, ly);
      lx += 9 + 4 + w2 + gapL;
      ctx.beginPath(); ctx.arc(lx + 4.5, ly - 4, 4.2, 0, 7); ctx.fillStyle = "#b45309"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = "#5b6470"; ctx.fillText(lab3, lx + 13, ly);
    }
    ctx.textAlign = "center";
  },

  _worldReads() {
    const t = this._t, TW = this._W, sub = twiwSubsolar(TW.N, TW.utc);
    const anti = { lat: -sub.lat, lon: sub.lon > 0 ? sub.lon - 180 : sub.lon + 180 };
    const head = fill(t("world-reads-head-tpl"), { N: TW.N, utc: twiwUTC(TW.utc), sub: `${twiwFmtLat(sub.lat)}, ${twiwFmtLon(sub.lon)}`, anti: `${twiwFmtLat(anti.lat)}, ${twiwFmtLon(anti.lon)}` });
    const dN = twiFlatD(TWI_MEAS, TWIW_H);
    const body = TW.mode === "inv"
      ? fill(t("world-reads-inv-tpl"), { H: TWIW_H.toLocaleString("en-US"), rim: TWI_RIM.toLocaleString("en-US"), dim: Math.round(1 / twiFlatE(TWIW_H, TWI_RIM)), dNight: twiNum(dN), xMap: (dN / TWI_RIM).toFixed(0), xMoon: (dN / TWI_MOON).toFixed(1) })
      : fill(t("world-reads-fit-tpl"), { cal: TWIW_CAL });
    this._el.worldReads.innerHTML = `<span id="twiWorldWhen">${head}</span>` + body;
  },

  // ================= figure 3 : durée des étapes selon la latitude =================
  _drawDur() {
    const cv = this._el.dur; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560;
    const ST = [
      { alt: -6, c: "#8fc3bd", lw: 2.0, t: narrow ? "to −6°" : "midsummer, to −6°" },
      { alt: -12, c: "#3f9a91", lw: 2.4, t: narrow ? "to −12°" : "midsummer, to −12°" },
      { alt: -18, c: "#0f766e", lw: 2.8, t: narrow ? "to −18°" : "midsummer, to −18°" },
    ];
    const items = ST.map((s) => ({ k: "line", c: s.c, t: s.t, w: s.lw })).concat([
      { k: "dash", c: "#1d4ed8", t: narrow ? "equinox" : "equinox, to −18°" },
      { k: "vdash", c: "#3f9a91", t: narrow ? "never ends" : "vertical: that stage never ends" },
      { k: "dot", c: "#0f766e", t: narrow ? "a place" : "a place from the table" },
      { k: "hollow", c: "#0f766e", t: narrow ? "never dark" : "…that never gets dark at all" },
    ]);
    ctx.font = "11px ui-monospace, Menlo, monospace";
    const legH = twiLegend(ctx, W / 2, 0, W - 16, items, true);
    const padL = narrow ? 42 : 56, padR = narrow ? 14 : 20, padT = 22, padB = 42 + legH, Wd = W - padL - padR, Hd = H - padT - padB, MAXLAT = 72, MAXMIN = 240;
    const X = (p) => padL + (p / MAXLAT) * Wd, Y = (m) => padT + (1 - Math.min(m, MAXMIN) / MAXMIN) * Hd;
    ctx.strokeStyle = "rgba(21,26,33,.10)"; ctx.lineWidth = 1;
    [0, 60, 120, 180, 240].forEach((m) => { ctx.beginPath(); ctx.moveTo(padL, Y(m)); ctx.lineTo(padL + Wd, Y(m)); ctx.stroke(); ctx.fillStyle = "#8b93a0"; ctx.textAlign = "right"; ctx.fillText(m === 240 ? "4 h" : m + (m ? "" : " min"), padL - 5, Y(m) + 4); });
    [0, 15, 30, 45, 60].forEach((p) => { ctx.beginPath(); ctx.moveTo(X(p), padT); ctx.lineTo(X(p), padT + Hd); ctx.stroke(); ctx.fillStyle = "#8b93a0"; ctx.textAlign = "center"; ctx.fillText(p + "°", X(p), padT + Hd + 14); });
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("latitude", padL + Wd / 2, padT + Hd + 30);
    ST.forEach((st) => {
      const p0 = twiThreshold(st.alt, TWI_OBLIQ);
      if (p0 <= MAXLAT) {
        ctx.strokeStyle = st.c; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(p0), padT); ctx.lineTo(X(p0), padT + Hd); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = st.c; ctx.textAlign = "center"; ctx.fillText(p0.toFixed(1) + "°", X(p0), padT - 6);
      }
      ctx.strokeStyle = st.c; ctx.lineWidth = st.lw; ctx.beginPath(); let started = false;
      for (let k = 0; k <= 300; k++) {
        const p = (MAXLAT * k) / 300, r = twiSpan(p, TWI_OBLIQ, TWI_SUNUP, st.alt);
        if (r.all || r.none) { if (started) ctx.lineTo(X(p), Y(MAXMIN)); break; }
        started ? ctx.lineTo(X(p), Y(r.min)) : ctx.moveTo(X(p), Y(r.min)); started = true;
      }
      ctx.stroke();
    });
    ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath();
    for (let k = 0; k <= 300; k++) { const p = (MAXLAT * k) / 300, r = twiSpan(p, 0, TWI_SUNUP, -18); if (r.all || r.none) break; k ? ctx.lineTo(X(p), Y(r.min)) : ctx.moveTo(X(p), Y(r.min)); }
    ctx.stroke(); ctx.setLineDash([]);
    TWI_PLACES.forEach((pl) => {
      const p = Math.abs(pl.p); if (p > MAXLAT) return;
      let hit = null;
      for (let i = ST.length - 1; i >= 0; i--) { const r = twiSpan(p, TWI_OBLIQ, TWI_SUNUP, ST[i].alt); if (!r.all && !r.none) { hit = { y: Y(r.min), c: ST[i].c }; break; } }
      ctx.beginPath(); ctx.arc(X(p), hit ? hit.y : Y(MAXMIN), 4.2, 0, 7);
      if (hit) { ctx.fillStyle = hit.c; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; } else { ctx.fillStyle = "#fdfdfc"; ctx.fill(); ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2; }
      ctx.stroke();
    });
    twiLegend(ctx, W / 2, H - legH - 6, W - 16, items);
    ctx.save(); ctx.translate(12, padT + Hd / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("minutes from sunset", 0, 0); ctx.restore();
  },

  // ================= figure 4 : l'ombre de la Terre dans le ciel oriental (SCHÉMATIQUE) =================
  _drawArch() {
    const cv = this._el.arch; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, deps = narrow ? [2, 8] : [2, 6, 12];
    const items = [{ k: "box", c: "#a9bcd4", t: narrow ? "sky" : "clear twilight sky" }, { k: "box", c: "#e1b0a0", t: narrow ? "Venus" : "reddened band — the Belt of Venus" }, { k: "box", c: "#4b5568", t: narrow ? "shadow" : "the Earth's own shadow" }];
    ctx.font = "11px ui-monospace, Menlo, monospace";
    const legH = twiLegend(ctx, W / 2, 0, W - 14, items, true);
    const gap = 12, padT = 26, padB = 34 + legH, padL = 34, pw = (W - padL - gap * (deps.length - 1) - 12) / deps.length;
    const skyTop = padT, skyBot = H - padB, ELEV = 30, Y = (e) => skyBot - (e / ELEV) * (skyBot - skyTop);
    ctx.strokeStyle = "rgba(21,26,33,.14)"; ctx.lineWidth = 1;
    [0, 10, 20, 30].forEach((e) => { ctx.beginPath(); ctx.moveTo(padL - 6, Y(e)); ctx.lineTo(padL - 2, Y(e)); ctx.stroke(); ctx.fillStyle = "#8b93a0"; ctx.textAlign = "right"; ctx.fillText(e + "°", padL - 8, Y(e) + 4); });
    deps.forEach((dep, i) => {
      const x = padL + i * (pw + gap), yb = Y(dep), yp = Y(dep + 3.5);
      const g = ctx.createLinearGradient(0, skyTop, 0, yp); g.addColorStop(0, "#7f9dc4"); g.addColorStop(1, "#b9c9dc"); ctx.fillStyle = g; ctx.fillRect(x, skyTop, pw, yp - skyTop);
      const gb = ctx.createLinearGradient(0, yp, 0, yb); gb.addColorStop(0, "#d9a898"); gb.addColorStop(1, "#e8b7a6"); ctx.fillStyle = gb; ctx.fillRect(x, yp, pw, yb - yp);
      const gs = ctx.createLinearGradient(0, yb, 0, skyBot); gs.addColorStop(0, "#5c6a80"); gs.addColorStop(1, "#3d4757"); ctx.fillStyle = gs; ctx.fillRect(x, yb, pw, skyBot - yb);
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const u = k / 40, px = x + u * pw, py = yb + Math.pow(2 * u - 1, 2) * 5; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      ctx.fillStyle = "#2b3138"; ctx.fillRect(x, skyBot, pw, H - padB - skyBot + 8);
      ctx.strokeStyle = "rgba(21,26,33,.25)"; ctx.lineWidth = 1; ctx.strokeRect(x, skyTop, pw, skyBot - skyTop);
      ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("Sun " + dep + "° down", x + pw / 2, skyBot + 16); ctx.fillText("edge at " + dep + "°", x + pw / 2, skyTop - 8);
    });
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.fillText("looking east · elevation in degrees · schematic colours", W / 2, skyBot + 30);
    twiLegend(ctx, W / 2, H - legH - 4, W - 14, items);
  },
};
