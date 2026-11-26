// Onglet "cnav" (navigation céleste), porté du legacy
// (flat-or-globe-2.20.0.html, markup ~L8662-8826, renderCnav() ~L14966,
// draw3d()/drawGlobe3D()/drawFlat3D()/fill3DTable() ~L15001-15231,
// updateExp2() ~L15867). Voir tasks/epic02/UC02.org pour la spec complète
// et le détail de ce qui est porté ici vs différé.
//
// PORTÉE DE CETTE PASSE (voir "** Résultat" de l'UC pour le détail) : la
// formule a=d×k, le tableau "is k constant?", la scène 3D à quatre visées
// (globe vs plat) avec la caméra orthographique PARTAGÉE de
// src/core/camera3d.js (même V3D, même mk3/rot3/path3/sphCirclePts que le
// legacy -- angle et échelle de départ identiques par construction), le
// bascule de réfraction, et l'expérience "conduire vers le nord". Les
// figures (cnavPairFig, cnavfig0) sont montées par src/core/symbols.js
// (drawSymbols) dans les hôtes du flux verbatim -- rattrapage UC11.
import { makeT, getProseDict } from "../../core/i18n.js";
import { renderProse } from "../../core/prose.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/cnav.js";
import { V3D, rot3, mk3, path3, norm3, addS, sphCirclePts, idleSpin } from "../../core/camera3d.js";
import { drawGlobe25, drawFlat25 } from "../../core/globe25d.js";
import {
  cnavRate, refrArcminBennett, STARS3D, HCAL, starFix,
  impliedRadius, CNAV_DISTS_KM, R3D_KM,
} from "./logic.js";
import "./style.css";

const KEY = "cnav";
const REFR_EXAG = 300; // même exagération d'affichage que le legacy (valeurs réelles dans la note)

export default {
  key: KEY,
  label: "Cel. nav.",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY);

    // Panneau VERBATIM du legacy (src/data/prose/cnav.js) : figure
    // d'ouverture cnavPairFig, bouton de réfraction global, formule avec son
    // schéma cnavfig0, grille 3D, tables, expérience 2, renvois et lectures.
    // dict : traduction bloc-par-bloc de la prose verbatim (epic04/UC01),
    // src/i18n/<lang>/cnav-prose.json, absente/incomplète -> anglais.
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    this._t = t;
    this._refr = false;
    this._refrBtns = [...container.querySelectorAll(".refrBtn")];
    this._canvasG = container.querySelector("#g3d");
    this._canvasF = container.querySelector("#f3d");
    this._fixRows = container.querySelector("#fix3dRows");
    this._refrNote = container.querySelector("#refr3dNote");
    this._cnH = container.querySelector("#cnH");
    this._cnR = container.querySelector("#cnR");
    this._cnavRows = container.querySelector("#cnavRows");
    this._cnavNote = container.querySelector("#cnavNote");

    for (const b of this._refrBtns) b.addEventListener("click", () => {
      this._refr = !this._refr;
      for (const bb of this._refrBtns) bb.textContent = `☼ ${this._refr ? t("refr-on") : t("refr-off")}`;
      this.render();
    });
    this._cnH.addEventListener("input", () => this.render());
    this._cnR.addEventListener("input", () => this.render());

    this._wireOrbit(this._canvasG);
    this._wireOrbit(this._canvasF);
    drawSymbols(KEY);
  },

  render() {
    this._fillRateTable();
    this._fillFixTable();
    this._drawGlobe3D();
    this._drawFlat3D();
    this._updateRefrNote();
    this._spin ??= idleSpin([this._canvasG, this._canvasF], () => { this._drawGlobe3D(); this._drawFlat3D(); });
    this._spin.start();
  },

  teardown() {
    // la seule boucle est la rotation au repos (idleSpin, 2026-09-24)
    this._spin?.stop();
  },

  // ---- orbite (drag pour tourner la caméra PARTAGÉE V3D) ----
  _wireOrbit(el) {
    let dragging = false, lx = 0, ly = 0;
    el.classList.add("drag");   // glisser pour tourner : seul ce canvas bloque le défilement tactile (core/legacy.css)
    el.addEventListener("pointerdown", (e) => {
      dragging = true; this._spin?.grab(); lx = e.clientX; ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      V3D.yaw += (e.clientX - lx) * 0.008;
      V3D.pitch += (e.clientY - ly) * 0.008;
      V3D.pitch = Math.max(-1.35, Math.min(1.35, V3D.pitch));
      lx = e.clientX; ly = e.clientY;
      this._drawGlobe3D();
      this._drawFlat3D();
    });
    ["pointerup", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { dragging = false; this._spin?.release(); }));
  },

  _fillRateTable() {
    const H = (Number(this._cnH.value) || 5000) * 1000;
    const R = (Number(this._cnR.value) || 6371) * 1000;
    if (!(H > 0) || !(R > 0)) return;
    this._cnavRows.innerHTML = CNAV_DISTS_KM.map((dk) => {
      const r = cnavRate(H, R, dk * 1000);
      return `<tr><td>${dk.toLocaleString()} km</td><td>${r.altG.toFixed(2)}°</td>` +
        `<td class="hot">${r.kGlobe.toFixed(3)} ′/nm</td><td>${r.altF.toFixed(2)}°</td>` +
        `<td class="cold">${r.kFlat.toFixed(3)} ′/nm</td></tr>`;
    }).join("");
    const { Rnm, Rkm } = impliedRadius(R);
    const kGlobe = cnavRate(H, R, 0).kGlobe;
    this._cnavNote.innerHTML = this._t("rate-note")
      .replace("{k}", kGlobe.toFixed(3))
      .replace("{Rnm}", Math.round(Rnm).toLocaleString())
      .replace("{Rkm}", Math.round(Rkm).toLocaleString());
  },

  _fillFixTable() {
    this._fixRows.innerHTML = STARS3D.map((s) => {
      const f = starFix(s, HCAL);
      const missTxt = Math.abs(f.miss) < 1 ? this._t("calibrated") : `${Math.round(f.miss).toLocaleString()} km`;
      return `<tr><td><span class="obj-key" style="background:${f.color}"></span>${this._t("star-word")} ${f.key}</td>` +
        `<td>${f.altDeg.toFixed(1)}°</td><td class="hot">${Math.round(f.d).toLocaleString()} km</td>` +
        `<td class="cold">${Math.round(f.rho).toLocaleString()} km</td><td class="cold">${missTxt}</td></tr>`;
    }).join("");
  },


  _updateRefrNote() {
    if (!this._refr) { this._refrNote.textContent = ""; return; }
    const vals = STARS3D.map((s) => {
      const v = refrArcminBennett(90 - s.delta * (180 / Math.PI));
      return `${s.key} ${v.toFixed(1)}′ (${(v / 60).toFixed(4)}°)`;
    }).join(" · ");
    this._refrNote.innerHTML = this._t("refr-note").replace("{exag}", REFR_EXAG).replace("{vals}", vals);
  },

  // ---- scènes 3D : mêmes helpers que le legacy, désormais partagés ----
  _drawGlobe3D() {
    if (this._canvasG.closest(".tabpanel")?.hidden) return;
    const { ctx, sc, P } = mk3(this._canvasG);
    const O = [0, 1, 0], e1 = [1, 0, 0], e2 = [0, 0, 1];
    // sphère ombrée + atmosphère (globe25d). PAS de côtes : l'observateur est
    // au sommet d'une sphère abstraite, des continents le mettraient au pôle Nord.
    drawGlobe25(ctx, P, sc, { coasts: false, grid: false });
    for (let lat = -60; lat <= 60; lat += 30) {
      const r = Math.cos((lat * Math.PI) / 180), y = Math.sin((lat * Math.PI) / 180), pts = [];
      for (let i = 0; i <= 72; i += 1) { const th = (2 * Math.PI * i) / 72; pts.push([r * Math.cos(th), y, r * Math.sin(th)]); }
      path3(ctx, P, pts, "#0f766e", 0.7, null, true, 0.35);
    }
    for (let lon = 0; lon < 180; lon += 30) {
      const l = (lon * Math.PI) / 180, pts = [];
      for (let i = 0; i <= 72; i += 1) { const th = (2 * Math.PI * i) / 72; pts.push([Math.cos(th) * Math.cos(l), Math.sin(th), Math.cos(th) * Math.sin(l)]); }
      path3(ctx, P, pts, "#0f766e", 0.7, null, true, 0.35);
    }
    STARS3D.forEach((s) => {
      const dir = addS(e1, e2, Math.cos(s.beta), Math.sin(s.beta));
      const GP = addS(O, dir, Math.cos(s.delta), Math.sin(s.delta));
      const star = addS([0, 0, 0], GP, 0, 1.45);
      const U = norm3(addS(O, GP, 1, -Math.cos(s.delta)));
      path3(ctx, P, sphCirclePts(GP, s.delta, U, 120), s.color, 1.8, null, true);
      const arc = [];
      for (let i = 0; i <= 40; i += 1) {
        const frac = i / 40, w = s.delta;
        arc.push(addS(O, GP, Math.sin((1 - frac) * w) / Math.sin(w), Math.sin(frac * w) / Math.sin(w)));
      }
      path3(ctx, P, arc, s.color, 1, [3, 3], true, 0.8);
      const gp2 = P(GP), st2 = P(star);
      if (gp2[2] > 0.02) {
        ctx.strokeStyle = s.color; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(gp2[0], gp2[1]); ctx.lineTo(st2[0], st2[1]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(gp2[0], gp2[1], 3, 0, 7); ctx.fill();
        this._starGlyph(ctx, st2[0], st2[1], s.color, s.key);
        const mid = P(arc[20]);
        ctx.font = "600 9px ui-monospace, Menlo, monospace"; ctx.fillStyle = s.color;
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(`d=${Math.round(s.delta * R3D_KM)} km`, mid[0], mid[1] - 2);
      }
    });
    const o2 = P(O);
    if (o2[2] > 0) {
      ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(o2[0], o2[1], 4.5, 0, 7); ctx.fill();
      ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(o2[0], o2[1], 9, 0, 7); ctx.stroke();
      ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#151a21";
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(this._t("observer-globe"), o2[0], o2[1] - 13);
    }
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(this._t("corner-globe"), 10, 8);
  },

  _drawFlat3D() {
    if (this._canvasF.closest(".tabpanel")?.hidden) return;
    const { ctx, P } = mk3(this._canvasF);
    const EXT = 1.25;
    drawFlat25(ctx, P, { R: EXT, Rz: EXT, shape: "rect" });
    for (let g = -EXT; g <= EXT + 1e-9; g += 0.25) {
      path3(ctx, P, [[g, 0, -EXT], [g, 0, EXT]], "#b45309", 0.6, null, false, 0.3);
      path3(ctx, P, [[-EXT, 0, g], [EXT, 0, g]], "#b45309", 0.6, null, false, 0.3);
    }
    STARS3D.forEach((s) => {
      const r = s.delta;
      const rho = Math.atan2(r, HCAL);
      const GP = [r * Math.cos(s.beta), 0, r * Math.sin(s.beta)];
      const star = [GP[0], HCAL, GP[2]];
      const cir = [];
      for (let i = 0; i <= 120; i += 1) { const th = (2 * Math.PI * i) / 120; cir.push([GP[0] + rho * Math.cos(th), 0, GP[2] + rho * Math.sin(th)]); }
      path3(ctx, P, cir, s.color, 1.8, null, false);
      path3(ctx, P, [[0, 0, 0], GP], s.color, 1, [3, 3], false, 0.8);
      const miss = r - rho;
      if (miss > 1e-4) {
        const near = [GP[0] * (miss / r), 0, GP[2] * (miss / r)];
        path3(ctx, P, [[0, 0, 0], near], "#b91c1c", 2.6, null, false);
        const m2 = P([near[0] / 2, 0, near[2] / 2]);
        ctx.fillStyle = "#b91c1c"; ctx.font = "600 9px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(this._t("miss-label").replace("{v}", Math.round(miss * R3D_KM)), m2[0], m2[1] - 2);
      }
      const gp2 = P(GP), st2 = P(star);
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(gp2[0], gp2[1]); ctx.lineTo(st2[0], st2[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(gp2[0], gp2[1], 3, 0, 7); ctx.fill();
      this._starGlyph(ctx, st2[0], st2[1], s.color, s.key);
    });
    const o2 = P([0, 0, 0]);
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(o2[0], o2[1], 4.5, 0, 7); ctx.fill();
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(o2[0], o2[1], 9, 0, 7); ctx.stroke();
    ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#151a21";
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(this._t("observer-flat"), o2[0], o2[1] - 13);
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(this._t("corner-flat").replace("{h}", Math.round(HCAL * R3D_KM)), 10, 8);
  },

  _starGlyph(ctx, x, y, color, key) {
    ctx.fillStyle = color; ctx.font = "16px ui-sans-serif, system-ui";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("★", x, y);
    ctx.font = "600 10px ui-monospace, Menlo, monospace";
    ctx.fillText(key, x + 11, y - 8);
  },
};
