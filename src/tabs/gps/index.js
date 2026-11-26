// Onglet "gps", porté du legacy (flat-or-globe-2.20.0.html, panneau
// id="tab-gps" ~L13464, drawGps ~L18289, drawGpsSky ~L18071, drawGpsTri
// ~L18159, drawGpsRange ~L18247). Voir tasks/epic02/UC08.org.
//
// Toute la géométrie vient de src/tabs/gps/logic.js (testée). Ici : la
// scène constellation (caméra orbitale propre GPSC, boucle rAF), la scène
// des trois sphères de portée (coquilles filaires avec alpha par
// profondeur, cercles d'intersection, deux points triples), le diagramme
// 2D de fermeture, les empreintes calculées, le tableau et l'expérience 8.
// Candidat epic03/UC02 : la scène constellation passe en Three.js plus tard.
import { figColor } from "../../core/theme.js";
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { setupCanvas } from "../../core/canvas.js";
import { drawGlobe25 } from "../../core/globe25d.js";
import { PROSE } from "../../data/prose/gps.js";
import { RAD } from "../../core/math.js";
import { SOURCES } from "../../data/sources/gps.js";
import { GPS_EL_MASK_DEG } from "../../data/orbits/gps.js";
import {
  GPS_A_RE, observerVector, allSatellites, visibilitySummary, pickTriSatellites, reflectAcrossPlane, verifyTriplePoint, sphereIntersectionCircle, circlePoint,
  shellRings, shellMeridians,
} from "./logic.js";
import { mountGpsRaw } from "./rawfig.js";
import { gpsRawValues } from "./rawvalues.js";
import { drawFormulaFigs } from "./formfigs.js";
import "./style.css";

const KEY = "gps";
import { webglOK as hasWebGL, webglFailed } from "../../core/webgl.js";
import { reducedMotion, frameStep } from "../../core/motion.js";
const css = (n, f) => figColor(n, f);

/** Caméra orbitale locale (GPSC dans le legacy) -- indépendante de V3D partagée. */
function makeCam(yaw, pitch) { return { yaw, pitch, drag: false, lx: 0, ly: 0 }; }
function projector(cam, W, H, sc) {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  return (p) => {
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, y1 = p[1];
    const y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
    return [W / 2 + x1 * sc, H / 2 - y2 * sc, z2];
  };
}
function orbitInit(canvas, cam, redraw) {
  canvas.classList.add("drag");   // glisser pour tourner : seul ce canvas bloque le défilement tactile (core/legacy.css)
  canvas.addEventListener("pointerdown", (e) => { cam.drag = true; cam.lx = e.clientX; cam.ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!cam.drag) return;
    cam.yaw += (e.clientX - cam.lx) * 0.008;
    cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + (e.clientY - cam.ly) * 0.008));
    cam.lx = e.clientX; cam.ly = e.clientY; redraw();
  });
  for (const ev of ["pointerup", "pointercancel"]) canvas.addEventListener(ev, () => { cam.drag = false; });
}
function poly(ctx, P, pts, color, w, alpha, dash) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.setLineDash(dash || []);
  ctx.beginPath();
  pts.forEach((p, i) => { const q = P(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
  ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash([]);
}

export default {
  key: KEY,
  label: "GPS",

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en";
    this._t = makeT(lang, KEY);
    this._lat = 45;
    this._time = 0;
    this._camSky = makeCam(-0.6, 0.4);
    this._camTri = makeCam(-0.9, 0.35);
    this._raf = null;

    // Panneau VERBATIM du legacy (src/data/prose/gps.js) : figure
    // d'ouverture (trois sphères de portée) avec sa légende, formules et
    // schémas gpsfig0-3, curseur de latitude, grille constellation/fermeture,
    // empreintes, tableau, expérience 8, sources.
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    this._sky = container.querySelector("#gpsSky");
    // export (epic10/UC02) : une orbite complète de la constellation (2π rad) en 21 s (2 × le repos)
    if (this._sky) {
      let saved = null;
      this._sky.__anim = {
        duration: 21,
        begin: () => { saved = this._time; if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; } },
        frameAt: (t) => { this._time = saved + (2 * Math.PI * t) / 21; this._drawSky(); },
        end: () => { this._time = saved; saved = null; this._drawSky(); if (this._active) this.render(); },
      };
    }
    this._tri = container.querySelector("#gpsTri");
    this._range = container.querySelector("#gpsRange");
    this._latRead = container.querySelector("#gpsLatRead");
    container.querySelector("#gpsLat").addEventListener("input", (e) => {
      const v = Number(e.target.value);
      if (Number.isFinite(v)) this._lat = Math.max(-89, Math.min(89, v));
      if (this._latRead) this._latRead.textContent = (this._lat >= 0 ? "+" : "−") + Math.abs(this._lat) + "°";
      this.render();
    });
    // panneau « récepteurs GPS bruts » (epic16/UC03) : nombres calculés, schéma de formule, trois figures canvas
    const tr = (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; };
    const rawVals = gpsRawValues();
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = rawVals[s.dataset.v]; if (v != null) s.textContent = v; });
    drawFormulaFigs(container, tr, rawVals);
    this._raw = mountGpsRaw(container, tr);
    drawSymbols(KEY);
    if (!hasWebGL()) this._init2d();
  },

  /** Repli 2.5D du legacy (orbite à la souris) -- sans WebGL2, ou si Three.js échoue. */
  _init2d() {
    if (this._2d) return;
    this._2d = true;
    orbitInit(this._sky, this._camSky, () => this._drawSky());
    orbitInit(this._tri, this._camTri, () => this._drawTri());
  },

  render() {
    this._raw?.draw();
    this._three = this._three ?? hasWebGL();
    if (this._three) {
      // epic03/UC02 : vraie 3D (Three.js), chargée à la demande pour ne pas
      // alourdir le bundle des onglets 2D. Les scènes lisent logic.js, pas
      // le canvas 2.5D ; celui-ci reste le repli sans WebGL.
      this._drawRange();
      this._gen = (this._gen || 0) + 1;
      const gen = this._gen;
      import("../../render3d/scene-gps.js").then(({ mountGpsSky, mountGpsTri }) => {
        if (gen !== this._gen || !this._active) return;
        if (!this._sky3d) {
          this._sky3d = mountGpsSky(this._sky, () => ({ lat: this._lat, time: this._time }));
          this._sky3d.onTick(() => { this._time += 0.0025; });
        }
        this._sky3d.start();
        if (this._tri3dLat !== this._lat) {
          this._tri3d?.dispose();
          this._tri3d = mountGpsTri(this._tri, this._lat);
          this._tri3dLat = this._lat;
        }
        this._tri3d.start();
      }).catch((e) => {
        webglFailed(e);
        this._three = false; this._sky3d = this._tri3d = null;
        this._init2d();
        if (this._active) this.render();
      });
      this._active = true;
      return;
    }
    this._drawAll();
    if (this._raf == null && !reducedMotion()) {
      const st = { last: 0 };
      const loop = (ts) => {
        const n = frameStep(st, ts); // ~30 images/s, même vitesse
        if (n) { this._time += 0.0025 * n; this._drawSky(); } // la constellation tourne (gpsLoop du legacy)
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
  },

  teardown() {
    this._active = false;
    if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; }
    this._sky3d?.stop();
    this._tri3d?.stop();
  },


  // l'expérience 8 (gpsTables du legacy) est dans falsify (exp.js, 2026-11-26)

  _drawAll() { this._drawSky(); this._drawTri(); this._drawRange(); },

  _drawSky() {
    const { ctx, W, H } = setupCanvas(this._sky);
    ctx.clearRect(0, 0, W, H);
    const sc = Math.min(W, H) * 0.09, P = projector(this._camSky, W, H, sc);
    const globe = css("--globe", "#0f766e"), soft = css("--ink-soft", "#5b6470"), ink = css("--ink", "#151a21"), obj1 = css("--obj1", "#1d4ed8");
    const sats = allSatellites(this._lat, this._time);
    const O = observerVector(this._lat);
    /* DEUX PASSES (2026-09-24) : ce qui est derrière le plan de la Terre
       (profondeur < 0) d'abord, estompé, puis la Terre, puis l'avant. Avant,
       orbites et satellites cachés par la planète restaient dessinés à travers
       elle. */
    const orbits = [];
    for (let k = 0; k < 6; k++) { const pts = []; for (let i = 0; i <= 96; i++) pts.push(P(satOnPlane(k, (2 * Math.PI * i) / 96))); orbits.push(pts); }
    const drawOrbits = (front) => {
      ctx.strokeStyle = soft; ctx.lineWidth = 0.8; ctx.globalAlpha = front ? 0.45 : 0.2;
      for (const pts of orbits) {
        ctx.beginPath(); let pen = false;
        for (const q of pts) { if ((q[2] >= 0) !== front) { pen = false; continue; } pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    const drawSats = (front) => {
      for (const st of sats) {
        const q = P(st.S);
        if ((q[2] >= 0) !== front) continue;
        ctx.globalAlpha = front ? 1 : 0.45;
        if (st.visible) {
          const g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 10);
          g.addColorStop(0, "rgba(29,78,216,0.45)"); g.addColorStop(1, "rgba(29,78,216,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q[0], q[1], 10, 0, 7); ctx.fill();
        }
        // petit corps + panneaux solaires
        ctx.fillStyle = st.visible ? obj1 : soft;
        ctx.fillRect(q[0] - 2, q[1] - 2, 4, 4);
        ctx.fillRect(q[0] - 7, q[1] - 1, 4, 2); ctx.fillRect(q[0] + 3, q[1] - 1, 4, 2);
        ctx.globalAlpha = 1;
      }
    };
    drawOrbits(false); drawSats(false);
    // Terre : sphère ombrée, côtes (l'observateur est sur le méridien 0), atmosphère
    drawGlobe25(ctx, P, sc, { grid: false });
    const o = P(O);
    // lignes de visée, puis l'avant
    for (const st of sats) {
      if (!st.visible) continue;
      const q = P(st.S);
      ctx.strokeStyle = obj1; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.globalAlpha = 1;
    }
    drawOrbits(true); drawSats(true);
    if (o[2] > 0) { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(o[0], o[1], 3.5, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke(); }
    const v = visibilitySummary(this._lat, this._time);
    ctx.fillStyle = ink; ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(this._t("cv-in-view").replace("{n}", v.count).replace("{mask}", GPS_EL_MASK_DEG), 8, 16);
    ctx.fillStyle = soft; ctx.fillText(this._t("cv-true-scale-a"), 8, H - 8);
  },

  _drawTri() {
    const { ctx, W, H } = setupCanvas(this._tri);
    ctx.clearRect(0, 0, W, H);
    const sc = Math.min(W, H) * 0.105, P = projector(this._camTri, W, H, sc);   // les satellites (4,17 R) remplissent le cadre ; les coquilles débordent
    const globe = css("--globe", "#0f766e"), soft = css("--ink-soft", "#5b6470"), ink = css("--ink", "#151a21"), obj1 = css("--obj1", "#1d4ed8"), obj3 = css("--obj3", "#6d28d9");
    const picks = pickTriSatellites(this._lat, 0.7);
    if (picks.length < 3) return;
    const O = observerVector(this._lat);
    // 1. coquilles filaires, alpha par profondeur (jamais de simples silhouettes)
    for (const { S, r } of picks) {
      for (const ring of [...shellRings(S, r), ...shellMeridians(S, r)]) {
        for (let i = 0; i < ring.length - 1; i++) {
          const a = P(ring[i]), b = P(ring[i + 1]);
          ctx.strokeStyle = soft; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.08 + 0.22 * Math.max(0, (a[2] + b[2]) / (2 * r) + 0.5);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    // 2. Terre solide (sphère ombrée, côtes, atmosphère -- globe25d)
    drawGlobe25(ctx, P, sc, { grid: false });
    // 3. satellites + lignes de portée
    const o = P(O);
    for (const { S } of picks) {
      const q = P(S);
      ctx.strokeStyle = obj1; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      ctx.fillStyle = obj1; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill();
    }
    // 4. cercles d'intersection violets
    for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) {
      const circ = sphereIntersectionCircle(picks[i].S, picks[i].r, picks[j].S, picks[j].r);
      const pts = []; for (let k = 0; k <= 96; k++) pts.push(circlePoint(circ, (2 * Math.PI * k) / 96));
      poly(ctx, P, pts, obj3, 1.4, 0.9);
    }
    // 5. les deux points triples
    const mirror = reflectAcrossPlane(O, picks[0].S, picks[1].S, picks[2].S);
    const okYou = verifyTriplePoint(O, picks, 1e-6), okMir = verifyTriplePoint(mirror, picks, 1e-6);
    const m = P(mirror);
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(o[0], o[1], 4.5, 0, 7); ctx.fill();
    ctx.strokeStyle = ink; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(m[0], m[1], 4.5, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "11px ui-monospace, monospace"; ctx.fillStyle = ink;
    const tag = (txt, p) => { const w = ctx.measureText(txt).width, left = p[0] + 7 + w > W - 4; ctx.fillText(txt, left ? Math.max(4, p[0] - 7 - w) : p[0] + 7, p[1] + 4); };
    tag(this._t("cv-you"), o);
    tag(this._t("cv-mirror-rejected"), m);
    ctx.fillStyle = soft; ctx.fillText(this._t("cv-triple-verified").replace("{status}", okYou && okMir ? this._t("cv-status-both") : this._t("cv-status-check")), 8, H - 8);
  },

  _drawRange() {
    const { ctx, W, H } = setupCanvas(this._range);
    ctx.clearRect(0, 0, W, H);
    const ink = css("--ink", "#151a21"), obj1 = css("--obj1", "#1d4ed8"), warn = css("--warn", "#b91c1c"), soft = css("--ink-soft", "#5b6470");
    const you = [W * 0.5, H * 0.62];
    const sats = [[W * 0.2, H * 0.18], [W * 0.78, H * 0.22], [W * 0.62, H * 0.9]];
    const dt = 14; // c·δt en px, exagéré (schéma)
    for (const s of sats) {
      const r = Math.hypot(you[0] - s[0], you[1] - s[1]);
      ctx.strokeStyle = obj1; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(s[0], s[1], r, 0, 7); ctx.stroke();
      ctx.strokeStyle = warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(s[0], s[1], r + dt, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = obj1; ctx.beginPath(); ctx.arc(s[0], s[1], 4, 0, 7); ctx.fill();
    }
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(you[0], you[1], 4, 0, 7); ctx.fill();
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(this._t("cv-you"), you[0] + 7, you[1] + 4);
    ctx.fillStyle = warn; ctx.fillText(this._t("cv-dashed-inflated"), 8, 16);
    ctx.fillStyle = soft; ctx.fillText(this._t("cv-schematic"), 8, H - 8);
  },
};

// Position d'un point de l'orbite du plan k à la phase th (pour tracer l'orbite entière).
function satOnPlane(k, th) {
  const O = RAD((k * 360) / 6), inc = RAD(55);
  const a = [Math.cos(O), 0, Math.sin(O)], b = [-Math.sin(O) * Math.cos(inc), Math.sin(inc), Math.cos(O) * Math.cos(inc)];
  return [0, 1, 2].map((i) => GPS_A_RE * (a[i] * Math.cos(th) + b[i] * Math.sin(th)));
}
