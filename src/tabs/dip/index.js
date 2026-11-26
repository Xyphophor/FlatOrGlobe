// Onglet "dip" (dépression d'horizon). Panneau porté VERBATIM (flux
// src/data/prose/dip.js, legacy L9461-9810) ; rendu porté VERBATIM du
// legacy (L16116-16630 et L22898-23026) : les deux panneaux globe/plat à
// cadrage collant (planète rapetissée R/ex à échelle uniforme, facteur
// imprimé -- règle 1), glisser pour changer la hauteur, le triangle plat,
// l'enveloppe des tangentes (clic sur une ligne, bouton « reveal the
// surface »), R depuis le dip, la bande sous le niveau des yeux (échelle
// angulaire vraie, Soleil à 32′), les deux expériences (4 et 4b) et les
// quatre tables. Schémas dipPairFig et dipfig0-3 : src/core/symbols.js.
// Logique numérique : logic.js (testée).
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { setupCanvas } from "../../core/canvas.js";
import { DIP_SPOTS, DIP_VANTAGE, DIP_HEIGHT_MIN, DIP_HEIGHT_MAX } from "../../data/presets/dip.js";
import { PROSE } from "../../data/prose/dip.js";
import { SOURCES } from "../../data/sources/dip.js";
import { DIP_K, DIP_R0, DIP_SUN_SD, dipR, dipFrame, dipScales, dipAngle, dipDist, dipSetRate } from "./logic.js";
import { mountFlatten } from "../../core/flatten.js";
import { mountLandscape } from "../../core/landscape.js";
import { ELEV_CAUS } from "../../data/presets/elev.js";
import { FLATTEN_CASES } from "../../data/presets/flatten.js";
import { fillOwn, mountOwn } from "./own.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountMlo } from "./mlo-anim.js";
import "./style.css";

const KEY = "dip";
const fmtDist = (m) => m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1) + " km" : m.toFixed(0) + " m";
// fmtDist arrondit au mètre et passe en km à 1 000 -- faux pour les hauteurs d'œil (1,7 m et 1 395 m)
const dipHm = (h) => (h < 10 ? h.toFixed(1) : Math.round(h).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + " m";
const thou = (x) => x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const R2D = 180 / Math.PI;
const clampH = (v) => Math.max(DIP_HEIGHT_MIN, Math.min(DIP_HEIGHT_MAX, v));

export default {
  key: KEY,
  label: "Dip",

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en";
    this._t = makeT(lang, KEY);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    // « aplatir la Terre » (epic06/UC04) : figure animée partagée avec hh et sim
    const fl = container.querySelector("#dipFlatten");
    this._flat = fl ? mountFlatten(fl, container.querySelector("#dipFlattenReads"), FLATTEN_CASES.dip) : null;
    this._container = container;
    const q = (s) => container.querySelector(s);
    const ids = ["dipH", "dipSel", "dipEx", "dipExRead", "dipRefrBtn", "dipG", "dipF", "dipGCap", "dipFCap", "dipRows", "dipNote", "dipTri", "dipTriCap",
      "triRows", "dipEnv", "dipEnvInfo", "dipEnvBtn", "dipEnvCap", "radRows", "radNote", "dipBand", "dipBandCap", "bandRows", "bandNote"];   // les expériences 4 et 4b sont dans falsify (exp.js, 2026-11-26)
    this._el = Object.fromEntries(ids.map((id) => [id, q("#" + id)]));
    const $ = this._el;
    // état du legacy : DIP = { h, ex, refr, frameH } + enveloppe
    this._st = { h: 100, ex: 1, refr: false, frameH: 200, showSurf: false, pick: -1, hits: [] };
    const st = this._st;
    $.dipSel.innerHTML = `<option value="">${this._t("cv-choose-vantage")}</option>` + DIP_SPOTS.map((s, i) => `<option value="${i}">${s.label}</option>`).join("");
    $.dipSel.addEventListener("change", (e) => {
      if (e.target.value === "") return;
      st.h = clampH(DIP_SPOTS[+e.target.value].h);
      $.dipH.value = st.h < 10 ? st.h.toFixed(1) : Math.round(st.h);
      this._draw();
    });
    $.dipH.addEventListener("input", () => {
      const v = parseFloat($.dipH.value);
      if (Number.isFinite(v) && v > 0) { st.h = clampH(v); this._draw(); }
    });
    $.dipEx.addEventListener("input", () => {
      st.ex = parseFloat($.dipEx.value) || 1;
      $.dipExRead.textContent = `×${st.ex.toFixed(1)}`;
      this._draw();
    });
    $.dipRefrBtn.addEventListener("click", () => {
      st.refr = !st.refr;
      $.dipRefrBtn.textContent = st.refr ? "☼ " + this._t("refr-on") : "☼ " + this._t("refr-off");
      this._draw();
    });
    $.dipEnv.addEventListener("click", (e) => this._envPick(e));
    // clavier (epic06/UC03) : flèches ou Entrée parcourent les rayons, Échap efface la sélection
    $.dipEnv.setAttribute("tabindex", "0");
    $.dipEnv.addEventListener("keydown", (e) => {
      const st = this._st, ids = (st.hits || []).map((h) => h.i);
      if (!ids.length) return;
      const k = ids.indexOf(st.pick);
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "Enter") st.pick = ids[(k + 1) % ids.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") st.pick = ids[(k - 1 + ids.length) % ids.length];
      else if (e.key === "Escape") st.pick = -1;
      else return;
      e.preventDefault(); this._drawEnv();
    });
    $.dipEnvBtn.addEventListener("click", () => {
      st.showSurf = !st.showSurf;
      $.dipEnvBtn.textContent = st.showSurf ? this._t("cv-hide-surface") : this._t("cv-reveal-surface");
      this._drawEnv();
    });
    this._dipDrag($.dipG); this._dipDrag($.dipF);
    // Caussols (2026-09-27) : on courbe la Terre sous la scène -- plan, R, réfraction (core/landscape.js, morph)
    const cc = container.querySelector("#dipCaus");
    if (cc) Promise.all([import("../../data/dem/caussols-view.json"), import("../../data/dem/caussols-view-layers.json")]).then(([p, l]) => {
      const tl = makeT(document.documentElement.lang || "en", "landscape");
      this._caus = mountLandscape(cc, { profile: p.default || p, layers: l.default || l, eye: ELEV_CAUS.eye, R: 6371e3, k: 0.13,
        targets: ELEV_CAUS.targets, view: ELEV_CAUS.view, photo: ELEV_CAUS.photo, sea: true, morph: true,
        stamp: tl("stamp-cop"), stampShort: tl("stamp-cop-short"), reads: container.querySelector("#dipCausReads") });
      if (!container.hidden) this._caus.start();
    }).catch(() => {});
    // « ton dip » (2026-09-29) : le dip mesuré sur la photo de Caussols, et le rayon qu'il donne (own.js)
    fillOwn(container, lang, this._t);
    // Mauna Loa et Keahole sur la même horloge (2026-10-03) : le coucher doublé, mesuré d'un côté (mlo-anim.js)
    const mc = container.querySelector("#dipMlo");
    if (mc) {
      const tv = (k, fb, vars = {}) => { let v = this._t(k); if (!v || v === k) v = fb; for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b); return v; };
      this._mlo = mountMlo(mc, container.querySelector("#dipMloReads"), tv, lang);
    }
    this._own = mountOwn(container, this._t);
    drawSymbols(KEY);
    drawFormulaFigs(container, (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; });   // epic15/UC03 : une figure par formule
  },

  render() { this._draw(); this._flat?.start(); this._caus?.start(); this._own?.draw(); this._mlo?.start(); },
  teardown() { this._flat?.stop(); this._caus?.stop(); this._mlo?.stop(); },

  _R() { return dipR(this._st.refr); },

  _draw() {
    if (this._container.hidden) return;
    this._drawGlobe(); this._drawFlat(); this._fillDipTable(); this._drawTri(); this._fillTriTable();
    this._drawEnv(); this._fillRadTable(); this._drawBand(); this._fillBandTable();
  },

  // glisser verticalement dans un panneau change la hauteur (échelle log)
  _dipDrag(el) {
    let drag = false, ly = 0;
    el.classList.add("drag");   // glisser pour tourner : seul ce canvas bloque le défilement tactile (core/legacy.css)
    el.addEventListener("pointerdown", (e) => { drag = true; ly = e.clientY; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const st = this._st;
      st.h = clampH(st.h * Math.exp(-(e.clientY - ly) * 0.012));
      ly = e.clientY;
      this._el.dipH.value = st.h < 10 ? st.h.toFixed(1) : Math.round(st.h);
      this._draw();
    });
    ["pointerup", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { drag = false; }));
  },

  _scales(W, H) {
    const st = this._st;
    st.frameH = dipFrame(st.h, st.frameH);
    return dipScales(W, H, st.frameH, st.ex, this._R());
  },

  _drawGlobe() {
    const { ctx, W, H } = setupCanvas(this._el.dipG); if (!W) return;
    const st = this._st, R = this._R(), h = st.h;
    const G = this._scales(W, H);
    const T = (x, y) => [G.PADL + x * G.s, G.gy - y * G.s];
    const Rd = G.Rd, hd = h * G.ex;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    // géométrie de tangence de la planète AFFICHÉE (vrai cercle : tangence exacte à l'écran)
    const th = Math.acos(Rd / (Rd + hd));
    const Tx = Rd * Math.sin(th), Ty = Rd * Math.cos(th) - Rd;
    const N = 220, xEnd = Math.min(G.Xf, Rd * 0.999), pts = [];
    for (let i = 0; i <= N; i++) { const x = xEnd * i / N; pts.push(T(x, Math.sqrt(Math.max(0, Rd * Rd - x * x)) - Rd)); }
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2;
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    ctx.globalAlpha = 0.07; ctx.fillStyle = "#0f766e";
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.lineTo(pts[N][0], H); ctx.lineTo(pts[0][0], H); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    if (Tx < xEnd) { // zone cachée au-delà du point de tangence
      ctx.globalAlpha = 0.10; ctx.fillStyle = "#b91c1c"; ctx.beginPath();
      const i0 = Math.ceil(Tx / xEnd * N);
      ctx.moveTo(pts[i0][0], pts[i0][1]);
      for (let i = i0; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[N][0], H); ctx.lineTo(pts[i0][0], H); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    const [ox, oy] = T(0, hd), [gx, gy] = T(0, 0), [tx, ty] = T(Tx, Ty);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "#9aa1ab"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(W - 10, oy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#7d848f"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(this._t("cv-eye-level-0"), W - 12, oy - 4);
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx, ty); ctx.stroke();
    const rr = Math.min(64, Math.hypot(tx - ox, ty - oy) * 0.5);
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(ox, oy, rr, 0, Math.atan2(ty - oy, tx - ox)); ctx.stroke();
    const trueDip = th * R2D;
    const narrow = W < 520;
    ctx.fillStyle = "#0f766e"; ctx.font = "600 " + (narrow ? "9px" : "11px") + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${this._t("cv-dip-word")} ${(trueDip * 60).toFixed(1)}′ = ${trueDip.toFixed(3)}°`, ox + rr + 8, oy + 5);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(gx, gy); ctx.stroke();
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
    ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText(`h = ${fmtDist(h)}`, ox + 10, oy - 7);
    ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#7d848f"; ctx.textBaseline = "top";
    ctx.fillText(this._t("cv-drag-vert"), ox + 10, oy + 5);
    ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(tx, ty, 4.5, 0, 7); ctx.fill();
    ctx.font = "600 " + (narrow ? "9px" : "10px") + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(`${this._t("cv-horizon-word")} ${fmtDist(dipDist(R, h))}`, Math.max(64, Math.min(W - 64, tx)), ty + 10);
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.font = (narrow ? "9px" : "10px") + " ui-monospace, Menlo, monospace";
    ctx.fillText(narrow
      ? this._t("cv-globe-narrow").replace("{refr}", st.refr ? this._t("cv-refr-narrow") : "").replace("{ex}", Math.round(G.ex))
      : this._t("cv-globe-wide").replace("{refr}", st.refr ? this._t("cv-refr-wide") : "").replace("{view}", fmtDist(G.Xf)).replace("{ex}", Math.round(G.ex)), 10, 8);
    this._el.dipGCap.innerHTML = `<b>Globe.</b> The surface keeps its shape; only the observer moves. Raise the eye and the
      tangent point slides outward as √h while the sightline tips further below horizontal:
      <b>${(trueDip * 60).toFixed(1)}′ = ${trueDip.toFixed(3)}°</b> down, horizon at <b>${fmtDist(dipDist(R, h))}</b>. Everything in the red band
      beyond it is geometrically hidden.`;
  },

  _drawFlat() {
    const { ctx, W, H } = setupCanvas(this._el.dipF); if (!W) return;
    const st = this._st, R = this._R(), h = st.h;
    const G = this._scales(W, H);
    const T = (x, y) => [G.PADL + x * G.s, G.gy - y * G.s];
    const hd = h * G.ex;
    const dReal = dipDist(R, h);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const [g0x, g0y] = T(0, 0);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(g0x, g0y); ctx.lineTo(W - 10, g0y); ctx.stroke();
    ctx.globalAlpha = 0.07; ctx.fillStyle = "#b45309";
    ctx.fillRect(g0x, g0y, W - 10 - g0x, H - g0y); ctx.globalAlpha = 1;
    const [ox, oy] = T(0, hd);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "#9aa1ab"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(W - 10, oy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#7d848f"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(this._t("cv-eye-level-0"), W - 12, oy - 4);
    const dep = Math.atan2(h, dReal);
    const [px, py] = T(Math.min(dReal, G.Xf), 0);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 7); ctx.fill();
    const narrowF = W < 520;
    ctx.font = "600 " + (narrowF ? "9px" : "10px") + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(narrowF
      ? this._t("cv-still-ground-narrow").replace("{a}", (dep * R2D * 60).toFixed(1))
      : this._t("cv-still-ground-wide").replace("{a}", (dep * R2D * 60).toFixed(1)).replace("{b}", (dep * R2D).toFixed(3)),
      Math.max(70, Math.min(W - 70, px)), py + 10);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(px + 12, oy + 8); ctx.lineTo(W - 28, oy + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 28, oy + 8); ctx.lineTo(W - 35, oy + 4); ctx.lineTo(W - 35, oy + 12);
    ctx.closePath(); ctx.fillStyle = "#b45309"; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = "600 " + (narrowF ? "9px" : "10px") + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "top";
    ctx.fillText(this._t("cv-ground-infinity"), W - 14, oy + 15);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(g0x, g0y); ctx.stroke();
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
    ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText(`h = ${fmtDist(h)}`, ox + 10, oy - 7);
    ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#7d848f"; ctx.textBaseline = "top";
    ctx.fillText(this._t("cv-drag-vert"), ox + 10, oy + 5);
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.font = (narrowF ? "9px" : "10px") + " ui-monospace, Menlo, monospace";
    ctx.fillText(narrowF ? this._t("cv-flat-narrow") : this._t("cv-flat-wide"), 10, 8);
    this._el.dipFCap.innerHTML = `<b>Flat plane.</b> Same frame, same scales. The observer rises but nothing else changes:
      no tangent point ever forms, the surface runs straight to the frame edge, and the only "horizon" is the eye‑level
      line itself — reached at infinity, dip 0.0′ = 0.000°. At ${fmtDist(dReal)}, where the globe's horizon sits, the plane still
      shows open ground ${(dep * R2D * 60).toFixed(1)}′ (${(dep * R2D).toFixed(3)}°) below eye level.`;
  },

  _fillDipTable() {
    const st = this._st, Rg = DIP_R0, Rr = DIP_R0 / (1 - DIP_K), h = st.h;
    const rows = [
      ["Globe — geometric", dipAngle(Rg, h), dipDist(Rg, h), "yes, sharp", "hot"],
      [`Globe + refraction (k=${DIP_K})`, dipAngle(Rr, h), dipDist(Rr, h), "yes, sharp", "hot"],
    ];
    this._el.dipRows.innerHTML = rows.map(([n, a, d, e, c]) =>
      `<tr><td>${n}</td><td class="${c}">${(a * R2D * 60).toFixed(1)}′ = ${(a * R2D).toFixed(3)}°</td><td class="${c}">${fmtDist(d)}</td><td>${e}</td></tr>`).join("") +
      `<tr><td>Flat plane — any height</td><td class="cold">0.0′ = 0.000°</td><td class="cold">∞ (no tangent)</td><td>no — haze only</td></tr>`;
    const t = dipAngle(this._R(), h) * R2D * 60, c = st.refr ? 1.76 : 1.93;
    this._el.dipNote.innerHTML = `At h = <b>${fmtDist(h)}</b> the ${st.refr ? "refracted" : "geometric"} dip is
      <b>${t.toFixed(1)}′ = ${(t / 60).toFixed(3)}°</b> — the √h rule gives ${c.toFixed(2)}′×√${Math.round(h)} =
      <b>${(c * Math.sqrt(h)).toFixed(1)}′ = ${(c * Math.sqrt(h) / 60).toFixed(3)}°</b>, matching the exact arccos formula to within a whisker.
      The flat prediction is 0.0′ = 0.000° at this and every other height.`;
  },

  _drawTri() {
    const { ctx, W, H } = setupCanvas(this._el.dipTri); if (!W) return;
    const st = this._st, R = this._R(), h = st.h;
    const dTrue = dipAngle(R, h), dFlat = h / Math.tan(dTrue), dReal = dipDist(R, h);
    const small = W < 520;
    const F1 = small ? "9px" : "10px", F2 = small ? "10px" : "11px";
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    // distances en vraie proportion (rx−ox vaut exactement 2 × (qx−ox))
    const PADL = small ? 44 : 58, PADR = small ? 18 : 26, PADT = 56, LEG = 88;
    const ox = PADL, rx = W - PADR, qx = (ox + rx) / 2;
    const yEye = PADT;
    const drawnA = Math.max(14 * Math.PI / 180, Math.min(32 * Math.PI / 180, Math.atan(st.ex * 20 * Math.tan(dTrue))));
    const triH = Math.min((qx - ox) * Math.tan(drawnA), H - LEG - 24 - yEye);
    const yGnd = yEye + triH;
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, yGnd); ctx.lineTo(W - 10, yGnd); ctx.stroke();
    ctx.globalAlpha = 0.06; ctx.fillStyle = "#b45309";
    ctx.fillRect(ox, yGnd, W - 10 - ox, H - yGnd); ctx.globalAlpha = 1;
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "#9aa1ab"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(ox, yEye); ctx.lineTo(W - 10, yEye); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#7d848f"; ctx.font = F1 + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(this._t("cv-eye-level-0"), ox + 8, yEye - 5);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, yEye); ctx.lineTo(ox, yGnd); ctx.stroke();
    ctx.save(); ctx.translate(ox - 13, (yEye + yGnd) / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#151a21"; ctx.font = "600 " + F1 + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText("h", 0, 0); ctx.restore();
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(ox, yEye); ctx.lineTo(qx, yGnd); ctx.stroke();
    const m = Math.min(11, triH * 0.35);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.2; ctx.strokeRect(ox, yGnd - m, m, m);
    const rr = Math.min(38, triH * 0.7);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(ox, yEye, rr, 0, drawnA); ctx.stroke();
    ctx.fillStyle = "#b45309"; ctx.font = "600 " + F2 + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("δ", ox + rr + 5, yEye + rr * 0.35);
    ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(qx, yGnd, 5, 0, 7); ctx.fill();
    ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(rx, yGnd, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.3; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(rx, yGnd); ctx.lineTo(rx, yEye); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "600 " + F1 + " ui-monospace, Menlo, monospace"; ctx.textBaseline = "top";
    ctx.fillStyle = "#b45309"; ctx.textAlign = "center"; ctx.fillText("d", qx, yGnd + 8);
    ctx.fillStyle = "#0f766e"; ctx.textAlign = "right"; ctx.fillText(this._t("cv-horizon-word"), rx, yGnd + 8);
    const yB = yEye - 22;
    ctx.strokeStyle = "#b91c1c"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(qx, yB); ctx.lineTo(rx, yB);
    ctx.moveTo(qx, yB - 5); ctx.lineTo(qx, yB + 5); ctx.moveTo(rx, yB - 5); ctx.lineTo(rx, yB + 5); ctx.stroke();
    ctx.fillStyle = "#b91c1c"; ctx.font = "600 " + F1 + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(`${this._t("cv-gap-word")} ${fmtDist(dReal - dFlat)}`, (qx + rx) / 2, yB - 5);
    ctx.fillStyle = "#5b6470"; ctx.font = F1 + " ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(this._t("cv-flat-triangle"), 10, 8);
    const lx = ox, ly = H - LEG + 4, lh = small ? 15 : 17;
    ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.fillRect(lx - 6, ly - 6, W - lx - 14, LEG - 6);
    ctx.strokeStyle = "#e5e0d6"; ctx.lineWidth = 1; ctx.strokeRect(lx - 6, ly - 6, W - lx - 14, LEG - 6);
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    const line = (i, color, txt) => { ctx.fillStyle = color; ctx.font = "600 " + F1 + " ui-monospace, Menlo, monospace"; ctx.fillText(txt, lx, ly + i * lh); };
    line(0, "#151a21", `h = ${fmtDist(h)}   δ = ${(dTrue * R2D * 60).toFixed(1)}′ = ${(dTrue * R2D).toFixed(3)}°`);
    line(1, "#b45309", `d = h / tan δ = ${fmtDist(dFlat)}   (flat prediction)`);
    line(2, "#0f766e", `measured horizon = ${fmtDist(dReal)}`);
    line(3, "#b91c1c", `gap = ${fmtDist(dReal - dFlat)} unexplained · ratio ${(dReal / dFlat).toFixed(2)}×`);
    ctx.fillStyle = "#7d848f"; ctx.font = F1 + " ui-monospace, Menlo, monospace";
    ctx.fillText(this._t("cv-angle-note"), lx, ly + 4 * lh);
    this._el.dipTriCap.innerHTML = `Granting the measured dip <b>δ = ${(dTrue * R2D * 60).toFixed(1)}′ = ${(dTrue * R2D).toFixed(3)}°</b>, flat
      trigonometry puts the ground contact at <b>${fmtDist(dFlat)}</b>. The horizon actually ranged sits at
      <b>${fmtDist(dReal)}</b> — a factor of <b>${(dReal / dFlat).toFixed(2)}</b>. On the plane the surface neither ends at
      the first distance nor at the second; on the globe both numbers are the same tangent point.`;
  },

  _fillTriTable() {
    const R = this._R(), st = this._st;
    this._el.triRows.innerHTML = [2, 10, 100, 1395, 10000].map((h) => {
      const d = dipAngle(R, h), dF = h / Math.tan(d), dR = dipDist(R, h);
      const cur = Math.abs(h - st.h) < Math.max(0.5, st.h * 0.02);
      return `<tr${cur ? ' style="background:#f6f4ef"' : ""}><td>${fmtDist(h)}</td>` +
        `<td>${(d * R2D * 60).toFixed(1)}′<br><span style="color:var(--ink-soft);font-size:11px">${(d * R2D).toFixed(3)}°</span></td>` +
        `<td class="cold">${fmtDist(dF)}</td><td class="hot">${fmtDist(dR)}</td><td><b>${(dR / dF).toFixed(2)}×</b></td></tr>`;
    }).join("");
  },

  // ---- enveloppe : des tangentes depuis des altitudes réelles, aucun sol dessiné ----
  _drawEnv() {
    const { ctx, W, H } = setupCanvas(this._el.dipEnv); if (!W) return;
    const st = this._st, R = this._R(), hMax = DIP_VANTAGE[DIP_VANTAGE.length - 1].h;
    const PADL = 40, PADR = 16, PADT = 26, PADB = 22;
    const availW = W - PADL - PADR, availH = H - PADT - PADB;
    const thMax = Math.max(14 * Math.PI / 180, Math.min(40 * Math.PI / 180, Math.atan(1.05 / (availW / availH))));
    const ex = Math.sqrt((1 / Math.cos(thMax) - 1) * R / hMax);
    const Rd = R / ex;
    const Xh = Rd * Math.sin(thMax) * 1.06;
    const yTop = hMax * ex * 1.04, yBot = Math.sqrt(Math.max(0, Rd * Rd - Xh * Xh)) - Rd;
    const s = Math.min(availW / (Xh * 1.05), availH / (yTop - yBot));
    const x0 = PADL + Xh * 0.05 * s, gy = PADT + yTop * s;
    const T = (x, y) => [x0 + x * s, gy - y * s];
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.4; ctx.setLineDash([2, 4]); ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(...T(0, 0)); ctx.lineTo(...T(0, hMax * ex)); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    st.hits = [];
    DIP_VANTAGE.forEach((v, i) => {
      const hd = v.h * ex;
      const th = Math.acos(Rd / (Rd + hd));
      const tp = T(Rd * Math.sin(th), Rd * Math.cos(th) - Rd);
      const p0 = T(0, hd);
      const sel = (i === st.pick), t = i / (DIP_VANTAGE.length - 1);
      const dx = tp[0] - p0[0], dy = tp[1] - p0[1];
      const k = (W - 8 - p0[0]) / Math.max(1e-6, dx);
      const pe = [p0[0] + dx * k, p0[1] + dy * k];
      ctx.strokeStyle = sel ? "#151a21" : `hsl(${194 - 50 * t}, 60%, ${56 - 18 * t}%)`;
      ctx.lineWidth = sel ? 2.6 : 1.3; ctx.globalAlpha = sel ? 1 : 0.85;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(pe[0], pe[1]); ctx.stroke();
      ctx.globalAlpha = 1;
      if (sel) { ctx.fillStyle = "#b91c1c"; ctx.beginPath(); ctx.arc(tp[0], tp[1], 4.5, 0, 7); ctx.fill(); }
      ctx.fillStyle = sel ? "#151a21" : "#5b6470";
      ctx.beginPath(); ctx.arc(p0[0], p0[1], sel ? 5 : 3.2, 0, 7); ctx.fill();
      st.hits.push({ i, p0, pe });
    });
    if (st.showSurf) {
      const pts = [];
      for (let i = 0; i <= 240; i++) { const x = Xh * i / 240; pts.push(T(x, Math.sqrt(Math.max(0, Rd * Rd - x * x)) - Rd)); }
      ctx.strokeStyle = "#b91c1c"; ctx.lineWidth = 2.4; ctx.setLineDash([7, 4]);
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(this._t("cv-vantage-points").replace("{n}", DIP_VANTAGE.length), 10, 8);
    this._envInfo();
    this._el.dipEnvCap.innerHTML = st.showSurf
      ? `The red arc is the circle every one of these sightlines is tangent to. Not one crosses it — the envelope
         <em>is</em> the Earth's surface, recovered from dip angles alone.`
      : `Seven real vantage points on one vertical, from a beach to an airliner, each line tipped by its own dip.
         Notice the wedge below them that none of the lines enters, and how its upper boundary curves.
         <b>Click any line</b> for its numbers, or press <b>reveal the surface</b> to see what fills the void.`;
  },
  _envInfo() {
    const box = this._el.dipEnvInfo, st = this._st; if (!box) return;
    if (st.pick < 0) {
      box.innerHTML = `<span style="color:var(--ink-soft)">Click any sightline in the figure to see the height it was
        taken from, the dip it produces, and how far its horizon lies.</span>`;
      return;
    }
    const v = DIP_VANTAGE[st.pick], R = this._R();
    const d = dipAngle(R, v.h), dist = dipDist(R, v.h);
    box.innerHTML =
      `<b>${v.n}</b> — altitude <b>${fmtDist(v.h)}</b>${v.note ? ` <span style="color:var(--ink-soft)">(${v.note})</span>` : ""}<br>` +
      `Dip below eye level: <b style="color:var(--globe)">${(d * R2D * 60).toFixed(1)}′ = ${(d * R2D).toFixed(3)}°</b>` +
      ` &nbsp;·&nbsp; horizon at <b>${fmtDist(dist)}</b>` +
      ` &nbsp;·&nbsp; <span style="color:var(--ink-soft)">√h rule: ${(1.93 * Math.sqrt(v.h)).toFixed(1)}′</span><br>` +
      `<span style="color:var(--flat)">Flat‑plane prediction at this altitude: 0.0′ = 0.000°, no horizon at any distance.</span>`;
  },
  _envPick(evt) {
    const st = this._st, c = this._el.dipEnv, r = c.getBoundingClientRect();
    const mx = evt.clientX - r.left, my = evt.clientY - r.top;
    const segDist = (p, a, b) => {
      const vx = b[0] - a[0], vy = b[1] - a[1], wx = p[0] - a[0], wy = p[1] - a[1];
      const L = vx * vx + vy * vy; let t = L ? (wx * vx + wy * vy) / L : 0; t = Math.max(0, Math.min(1, t));
      return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vy));
    };
    let best = -1, bestD = 12;
    st.hits.forEach((hit) => {
      const d = Math.min(segDist([mx, my], hit.p0, hit.pe), Math.hypot(mx - hit.p0[0], my - hit.p0[1]) - 3);
      if (d < bestD) { bestD = d; best = hit.i; }
    });
    st.pick = (best === st.pick) ? -1 : best;
    this._drawEnv();
  },

  _fillRadTable() {
    const h = this._st.h, R0 = DIP_R0, Rr = DIP_R0 / (1 - DIP_K);
    const solve = (d) => h * Math.cos(d) / (1 - Math.cos(d));
    const dGeo = dipAngle(R0, h), dRef = dipAngle(Rr, h);
    const rows = [
      ["Geometric dip (vacuum)", dGeo, solve(dGeo), "hot"],
      ["Refracted dip, used as-is", dRef, solve(dRef), "cold"],
      [`Refracted dip, corrected by (1−k), k=${DIP_K}`, dRef, solve(dRef) * (1 - DIP_K), "hot"],
    ];
    this._el.radRows.innerHTML = rows.map(([n, d, Rc, c]) =>
      `<tr><td>${n}</td><td>${(d * R2D * 60).toFixed(2)}′ = ${(d * R2D).toFixed(3)}°</td>` +
      `<td class="${c}">${thou(Rc / 1000)} km</td><td>${((Rc / R0 - 1) * 100 >= 0 ? "+" : "")}${((Rc / R0 - 1) * 100).toFixed(1)}%</td></tr>`).join("");
    this._el.radNote.innerHTML =
      `From h = <b>${fmtDist(h)}</b> the geometric dip returns R exactly. Feed in the <em>refracted</em> dip — which is
       what any real instrument reads — and the naive answer is about <b>15% too large</b>, because light bending makes
       the Earth look flatter than it is. Correcting by the refraction coefficient recovers the right value. This is the
       one systematic error that dogged the method for nine centuries.`;
  },

  // ---- la bande sous le niveau des yeux : UNE échelle angulaire pour les deux axes ----
  _drawBand() {
    const cv = this._el.dipBand; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const narrow = W < 470;
    const R = this._R(), h = this._st.h, d = dipAngle(R, h);
    const PADT = 26, PADB = 30, PADL = 8, PADR = 8;
    const top = Math.max(d * 0.45, 0.006), bot = d + Math.max(d * 0.55, 0.008);
    const spanY = top + bot, sc = (H - PADT - PADB) / spanY;
    const Y = (a) => PADT + (top - a) * sc;
    const y0 = Y(0), yH = Y(-d);
    ctx.fillStyle = "#eef4f7"; ctx.fillRect(PADL, PADT, W - PADL - PADR, (H - PADT - PADB));
    ctx.fillStyle = "rgba(122,106,79,0.22)"; ctx.fillRect(PADL, yH, W - PADL - PADR, H - PADB - yH);
    ctx.fillStyle = "rgba(15,118,110,0.13)"; ctx.fillRect(PADL, y0, W - PADL - PADR, yH - y0);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(PADL, y0); ctx.lineTo(W - PADR, y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(PADL, yH); ctx.lineTo(W - PADR, yH); ctx.stroke();
    const sunR = DIP_SUN_SD * sc, sx = W * 0.62;
    const drawSun = (alt, solid) => {
      ctx.beginPath(); ctx.arc(sx, Y(alt), sunR, 0, 2 * Math.PI);
      if (solid) { ctx.fillStyle = "#f2b34b"; ctx.fill(); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.4; ctx.stroke(); }
      else { ctx.strokeStyle = "rgba(180,83,9,0.55)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); }
    };
    drawSun(-DIP_SUN_SD, true);
    if (d > 2 * DIP_SUN_SD) drawSun(-d + DIP_SUN_SD, false);
    const bx = Math.max(30, W * 0.14);
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bx, y0); ctx.lineTo(bx, yH);
    ctx.moveTo(bx - 5, y0); ctx.lineTo(bx + 5, y0); ctx.moveTo(bx - 5, yH); ctx.lineTo(bx + 5, yH); ctx.stroke();
    ctx.font = "11px " + (getComputedStyle(document.body).fontFamily || "sans-serif");
    ctx.fillStyle = "#151a21"; ctx.textAlign = "left";
    ctx.fillText(narrow ? this._t("cv-eye-level") : this._t("cv-eye-level-bubble"), PADL + 4, y0 - 6);
    ctx.fillStyle = "#5b6470"; ctx.fillText(this._t("cv-sea-horizon"), PADL + 4, yH + 14);
    ctx.fillStyle = "#0f766e"; ctx.textAlign = "center";
    ctx.fillText((d * R2D * 60).toFixed(1) + "′", bx, (y0 + yH) / 2 + 4);
    ctx.textAlign = "left"; ctx.fillStyle = "#5b6470";
    ctx.fillText(narrow ? this._t("cv-true-scale-narrow") : this._t("cv-true-scale-wide"), PADL + 4, H - 10);
    ctx.textAlign = "right"; ctx.fillStyle = "#b45309";
    ctx.fillText(this._t("cv-flat-horizon-here"), W - PADR - 4, y0 - 6);
    const wide = d - 2 * DIP_SUN_SD;
    this._el.dipBandCap.textContent = "Eye height " + dipHm(h) + ": the horizon lies " + (d * R2D * 60).toFixed(1)
      + "′ (" + (d * R2D).toFixed(3) + "°) below eye level, so the shaded band is "
      + (d / (2 * DIP_SUN_SD)).toFixed(2) + " Sun-widths tall. "
      + (wide > 0
        ? "The solid Sun has its upper limb at eye level; the dashed one has its lower limb at the horizon. Between those two instants the whole disc is below level and wholly unobstructed."
        : "At this height the band is narrower than the Sun itself, so the disc cannot fit inside it — climb above about 330 m and it can.")
      + " On a flat plane the two lines coincide and the band has zero height at every altitude.";
  },

  _fillBandTable() {
    const R = this._R(), st = this._st;
    const rows = [
      [1.7, "standing at the waterline"], [276, "Eiffel Tower, top platform"], [555, "Burj Khalifa, At the Top SKY"],
      [1395, "Sommet de Viériou"], [3275, "Karagöl subpeak"], [11000, "airliner at cruise"],
    ];
    const rate = dipSetRate(45);
    this._el.bandRows.innerHTML = rows.map(([h, n]) => {
      const d = dipAngle(R, h), am = d * R2D * 60, w = am - 32;
      const secs = w > 0 ? (w / 60) / rate * 3600 : 0;
      const cur = Math.abs(h - st.h) < Math.max(0.5, st.h * 0.02);
      return `<tr${cur ? ' style="background:#f6f4ef"' : ""}><td>${dipHm(h)} <span class="vac">${n}</span></td>` +
        `<td class="hot">${am.toFixed(1)}′<br><span style="color:var(--ink-soft);font-size:11px">${(d * R2D).toFixed(3)}°</span></td>` +
        `<td>${(am / 32).toFixed(2)}×</td>` +
        `<td class="${w > 0 ? "hot" : "cold"}">${w > 0 ? w.toFixed(1) + "′ = " + (w / 32).toFixed(2) + "×" : "— too low"}</td>` +
        `<td>${w > 0 ? (secs >= 90 ? (secs / 60).toFixed(1) + " min" : secs.toFixed(0) + " s") : "—"}</td>` +
        `<td class="cold">0.0′ · 0 s</td></tr>`;
    }).join("");
    const dAir = dipAngle(R, 11000) * R2D * 60;
    this._el.bandNote.innerHTML =
      `Times are for the equinox at 45°, where the Sun descends at ${rate.toFixed(2)}° per hour; nearer the solstices, or
       nearer the poles, it descends more slowly and every figure above gets longer. Sunset from an airliner is also
       <b>later</b> than at sea level by the whole band: ${(dAir / 60 / rate * 60).toFixed(0)} minutes at this latitude, for the
       ${dAir.toFixed(0)}′ of dip alone. A plane predicts the same instant from the beach and from 11 km.`;
  },


};
