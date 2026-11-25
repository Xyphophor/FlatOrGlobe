// Onglet "dist" (distances), porté du legacy (flat-or-globe-2.20.0.html,
// L9048-9461 pour le panneau, L15241-15440 + L15890 pour le rendu).
// Voir tasks/epic02/UC03.org et tasks/epic02/UC11.org.
//
// Le panneau est le flux VERBATIM du legacy (src/data/prose/dist.js :
// schéma d'ouverture SVG, sept formules avec leurs schémas symboliques
// distfig0-6, courbe du facteur d'étirement, figure des deux jambes,
// tableau statique, grille 3D, tableau des trois règles, expérience 3,
// notes et renvois). Ce module ne fait que remplir les emplacements :
// les deux scènes 2.5D (caméra partagée V3D, bouton de bascule
// polaire/cartésien), le tableau #distRows et l'expérience 3.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { V3D, mk3, path3, idleSpin } from "../../core/camera3d.js";
import { drawGlobe25, drawFlat25 } from "../../core/globe25d.js";
import { DSEGS, R3D_KM, llVec, distGC, distCart, distAE, aePoint, cartPoint, fmtLL, exp3, distLandAffine } from "./logic.js";
import { PROSE } from "../../data/prose/dist.js";
import { SOURCES } from "../../data/sources/dist.js";
import "./style.css";
import { makeAE } from "../../core/aeproj.js";
import { aeLandImage } from "../../core/aemap.js";
const DIST_MAP = makeAE();   // carte polaire du moteur ; aePoint = (X, Z) = (−y, −x) de cette carte

const KEY = "dist";
const D2R = Math.PI / 180;

function segLabel(ctx, pt, color, txt) {
  ctx.fillStyle = color; ctx.font = "600 10px ui-monospace, Menlo, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText(txt, pt[0], pt[1] - 6);
}

export default {
  key: KEY,
  label: "Distances",

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en";
    this._t = makeT(lang, KEY);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const q = (s) => container.querySelector(s);
    this._el = { g: q("#dg3d"), f: q("#df3d"), cap: q("#distFlatCap"), rows: q("#distRows"),
      lat: q("#exp3lat"), dl: q("#exp3dl"), out: q("#exp3out"), v: q("#exp3v"), swap: q("#distSwap") };
    this._proj = "polar"; // "polar" (AE) | "cartesian"
    this._el.swap.addEventListener("click", () => { this._proj = this._proj === "polar" ? "cartesian" : "polar"; this._draw(); });
    // deux cartes plates au choix : une carte exportée (epic11) les montre toutes les deux
    this._el.f.__variant = { get: () => this._proj, set: (p) => { this._proj = p; this._drawFlat(); } };
    for (const el of [this._el.g, this._el.f]) this._wireOrbit(el);
    for (const el of [this._el.lat, this._el.dl]) el.addEventListener("input", () => this._exp3());
    drawSymbols(KEY);
  },

  render() { this._draw(); this._spinStart(); },
  teardown() { this._spinStop(); },

  // rotation au repos : idleSpin() de camera3d.js (caméra V3D partagée)
  _spinStart() {
    this._spin ??= idleSpin([this._el.g, this._el.f], () => { this._drawGlobe(); this._drawFlat(); });
    this._spin.start();
  },
  _spinStop() { this._spin?.stop(); },

  _draw() {
    this._exp3();
    this._drawGlobe(); this._drawFlat(); this._fillTable();
  },

  // Drag pour tourner la caméra PARTAGÉE V3D (même écouteur que le legacy).
  _wireOrbit(el) {
    let drag = false, lx = 0, ly = 0;
    el.classList.add("drag");   // glisser pour tourner : seul ce canvas bloque le défilement tactile (core/legacy.css)
    el.addEventListener("pointerdown", (e) => { drag = true; this._spin?.grab(); lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => {
      if (!drag) return;
      V3D.yaw += (e.clientX - lx) * 0.008;
      V3D.pitch += (e.clientY - ly) * 0.008;
      V3D.pitch = Math.max(-1.35, Math.min(1.35, V3D.pitch));
      lx = e.clientX; ly = e.clientY;
      this._drawGlobe(); this._drawFlat();
    });
    ["pointerup", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { drag = false; this._spin?.release(); }));
  },

  _drawGlobe() {
    const { ctx, sc, P, W } = mk3(this._el.g);
    if (!W) return;
    // sphère ombrée, côtes, graticule, atmosphère (src/core/globe25d.js)
    drawGlobe25(ctx, P, sc);
    DSEGS.forEach((s) => {
      const u = llVec(s.p[0]), v = llVec(s.p[1]);
      const w = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2])));
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, s1 = Math.sin((1 - t) * w) / Math.sin(w), s2 = Math.sin(t * w) / Math.sin(w);
        pts.push([u[0] * s1 + v[0] * s2, u[1] * s1 + v[1] * s2, u[2] * s1 + v[2] * s2]);
      }
      path3(ctx, P, pts, s.color, 3, null, true);
      [pts[0], pts[40]].forEach((e) => { const p = P(e); if (p[2] > 0.02) { ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); } });
      const mid = P(pts[20]);
      if (mid[2] > 0.02) segLabel(ctx, mid, s.color, `${s.key} ${Math.round(distGC(s.p[0], s.p[1])).toLocaleString()} km`);
    });
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(this._t("cv-globe-title"), 10, 8);
  },

  _drawFlat() {
    const { ctx, P, W } = mk3(this._el.f, 0.85);
    if (!W) return;
    const dot = (e, color) => { const p = P(e); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); };
    if (this._proj === "polar") {
      // disque azimutal équidistant : r = colatitude, θ = λ ; échelle telle que colat π → 1.5
      const S = 1.5 / Math.PI;
      // le disque en relief, avec les côtes projetées comme sur la carte « terre plate »
      // epic18 : les terres du moteur commun posées sur la face du dessus (transformation affine : logic.js, distLandAffine)
      const onTop = (c2) => {
        const o = P([0, 0, 0]), eX = P([1, 0, 0]), eZ = P([0, 0, 1]), Rpx = Math.hypot(eX[0] - o[0], eX[1] - o[1]) * 1.5;
        const img = aeLandImage(DIST_MAP, Rpx, false, { sea: "transparent", land: "#e3cfa9" }); if (!img) return;
        c2.transform(...distLandAffine(o, eX, eZ, img.width, S));
        c2.drawImage(img, 0, 0);
      };
      drawFlat25(ctx, P, { R: 1.5, shape: "disc", mapLL: (la, lo) => aePoint([la, lo], S), onTop });
      for (let colat = 30; colat <= 180; colat += 30) {
        const r = colat * D2R * S, pts = [];
        for (let i = 0; i <= 90; i++) { const t = 2 * Math.PI * i / 90; pts.push([r * Math.cos(t), 0, r * Math.sin(t)]); }
        path3(ctx, P, pts, "#b45309", colat === 180 ? 1.4 : 0.6, null, false, colat === 180 ? 0.8 : 0.35);
      }
      for (let lon = 0; lon < 360; lon += 30) {
        const l = lon * D2R;
        path3(ctx, P, [[0, 0, 0], [1.5 * Math.cos(l), 0, 1.5 * Math.sin(l)]], "#b45309", 0.6, null, false, 0.3);
      }
      DSEGS.forEach((s) => {
        const a = aePoint(s.p[0], S), b = aePoint(s.p[1], S);
        path3(ctx, P, [a, b], s.color, 3, null, false); // règle : DROITE sur la carte
        dot(a, s.color); dot(b, s.color);
        segLabel(ctx, P([(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2]), s.color, `${s.key} ${Math.round(distAE(s.p[0], s.p[1])).toLocaleString()} km`);
      });
      const np = P([0, 0, 0]);
      ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(np[0], np[1], 3, 0, 7); ctx.fill();
      ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(this._t("cv-n-pole"), np[0], np[1] + 5);
      ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(this._t("cv-polar-title"), 10, 8);
      this._el.cap.innerHTML = this._t("cap-polar");
    } else {
      // rectangle plate carrée : x = λ, z = −φ ; échelle λ ±π → ±1.5
      const SX = 1.5 / Math.PI, SZ = 1.5 / Math.PI;
      drawFlat25(ctx, P, { R: 1.5, shape: "rect", mapLL: (la, lo) => cartPoint([la, lo], SX, SZ) });
      for (let lon = -180; lon <= 180; lon += 30) {
        const x = lon * D2R * SX;
        path3(ctx, P, [[x, 0, -Math.PI / 2 * SZ], [x, 0, Math.PI / 2 * SZ]], "#b45309", lon % 180 === 0 ? 1.2 : 0.6, null, false, 0.35);
      }
      for (let lat = -90; lat <= 90; lat += 30) {
        const z = -lat * D2R * SZ;
        path3(ctx, P, [[-1.5, 0, z], [1.5, 0, z]], "#b45309", lat === 0 ? 1.2 : 0.6, null, false, 0.35);
      }
      DSEGS.forEach((s) => {
        const a = cartPoint(s.p[0], SX, SZ), b = cartPoint(s.p[1], SX, SZ);
        path3(ctx, P, [a, b], s.color, 3, null, false);
        dot(a, s.color); dot(b, s.color);
        segLabel(ctx, P([(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2]), s.color, `${s.key} ${Math.round(distCart(s.p[0], s.p[1])).toLocaleString()} km`);
      });
      ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(this._t("cv-cart-title"), 10, 8);
      this._el.cap.innerHTML = this._t("cap-cart");
    }
  },

  _fillTable() {
    const pct = (x) => `<span style="color:var(--ink-soft)">(${x > 1 ? "+" : ""}${Math.round((x - 1) * 100)}%)</span>`;
    this._el.rows.innerHTML = DSEGS.map((s) => {
      const g = distGC(s.p[0], s.p[1]), c = distCart(s.p[0], s.p[1]), ae = distAE(s.p[0], s.p[1]);
      return `<tr><td><span class="obj-key" style="background:${s.color}"></span>${s.key} &nbsp;<span style="color:var(--ink-soft);font-size:11px">${fmtLL(s.p[0])} → ${fmtLL(s.p[1])}</span></td>` +
        `<td class="hot">${Math.round(g).toLocaleString()} km</td>` +
        `<td class="cold">${Math.round(c).toLocaleString()} km ${pct(c / g)}</td>` +
        `<td class="cold">${Math.round(ae).toLocaleString()} km ${pct(ae / g)}</td></tr>`;
    }).join("");
  },

  _exp3() {
    const num = (el, def) => { const v = parseFloat(el.value); return Number.isFinite(v) ? v : def; };
    const lat = num(this._el.lat, 45), dl = Math.max(0.1, num(this._el.dl, 60));
    const r = exp3(lat, dl);
    const fmtk = (v) => Math.round(v).toLocaleString() + " km";
    this._el.out.innerHTML = this._t("exp3-out")
      .replace("{lat}", lat).replace("{dl}", dl)
      .replace("{globeKm}", fmtk(r.globe)).replace("{mirrorKm}", fmtk(r.mirror))
      .replace("{aeKm}", fmtk(r.ae)).replace("{aeMKm}", fmtk(r.aeM)).replace("{ratio}", r.ratio.toFixed(2));
    this._el.v.innerHTML = this._t("exp3-verdict").replace("{ratio2}", (r.aeM / r.ae).toFixed(1));
  },
};
