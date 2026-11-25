// Onglet "mag" (magnétisme), porté du legacy (flat-or-globe-2.20.0.html,
// panneau id="tab-mag" ~L10935, drawMag ~L17099 et sous-fonctions). Voir
// tasks/epic02/UC05.org.
//
// PORTÉE DE CETTE PASSE : formules et calibration (logic.js, testées),
// tableau de prédiction à la latitude choisie, profil d'inclinaison
// (globe vs deux dispositions plates), tableaux des villes, carte
// d'expérience et sources. Les deux scènes 3D orbitales du legacy (MAGG /
// MAGF) sont remplacées par des COUPES 2D schématiques (globe dipôle,
// disque plat) -- c'est l'epic03/UC03 qui doit leur rendre une vraie 3D.
import { figColor } from "../../core/theme.js";
import { makeT, getProseDict } from "../../core/i18n.js";
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { drawSymbols } from "../../core/symbols.js";
import { drawFormulaFigs } from "./formfigs.js";
import { PROSE } from "../../data/prose/mag.js";
import { setupCanvas } from "../../core/canvas.js";
import { RAD } from "../../core/math.js";
import { SOURCES } from "../../data/sources/mag.js";
import { MAG_RKM, MAG_D1, MAG_D2, MAGCITIES, globeMag, flatMag, magTrace2 } from "./logic.js";
import { magLat2r, magSgn } from "./shared.js";
import { mountObsSection } from "./obs-figs.js";
import { draw3D } from "./field3d.js";
import "./style.css";

const KEY = "mag";
import { webglOK as hasWebGL, webglFailed } from "../../core/webgl.js";

function fill(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
}

export default {
  key: KEY,
  label: "Magnetism",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY);
    registerSources(KEY, SOURCES);
    this._t = t;
    this._lat = 45; // valeur du curseur dans le panneau legacy

    // Panneau VERBATIM du legacy (src/data/prose/mag.js), sauf la grille des
    // scènes (2026-09-24, demande du propriétaire) : plus de bouton de bascule
    // ① ↔ ②, les TROIS modèles côte à côte (globe, plat ①, plat ②), et dessous
    // une rangée de trois cadrans d'inclinaison orientés pareil, pour comparer
    // d'un coup d'œil -- comme la rangée de cadrans solaires de `sun`.
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const q = (s) => container.querySelector(s);
    this._latInput = q("#magLat");
    this._latRead = q("#magLatRead");
    this._walkBtn = q("#magWalkBtn");
    this._cG = q("#magG"); this._cF1 = q("#magF1"); this._cF2 = q("#magF2"); this._cD = q("#magDials");
    this._cP = q("#magProfile");
    { const an = this._exportAnim(); for (const c of [this._cG, this._cF1, this._cF2, this._cD]) if (c) c.__anim = an; }
    this._f1Cap = q("#magF1Cap"); this._f2Cap = q("#magF2Cap");
    this._note = q("#magNote");
    this._rows = q("#magRows");
    this._cityI = q("#magCityIRows");
    this._cityB = q("#magCityBRows");
    this._cityNote = q("#magCityNote");
    this._expOut = q("#exp5out");
    this._expV = q("#exp5v");
    if (this._f1Cap) this._f1Cap.innerHTML = t("flatcap-1");
    if (this._f2Cap) this._f2Cap.innerHTML = t("flatcap-2");
    // lignes de champ en 3D des trois modèles (2026-09-30) : boucles fermées, on les
    // tourne en glissant (ou aux flèches du clavier) ; les trois vues tournent ensemble
    this._lang = lang;
    this._f3d = { yaw: -35, pitch: 22, cv: [["globe", q("#magF3dG")], ["flat1", q("#magF3dF1")], ["flat2", q("#magF3dF2")]].filter(([, c]) => c) };
    for (const [id, k] of [["#magF3dHG", "f3d-h-globe"], ["#magF3dHF1", "f3d-h-flat1"], ["#magF3dHF2", "f3d-h-flat2"], ["#magF3dCap", "f3d-cap"]]) { const el = q(id); if (el) el.innerHTML = t(k); }
    for (const [, c] of this._f3d.cv) this._wireF3d(c);
    // export animé (epic11) : un tour complet de la vue en 40 s, les trois panneaux ensemble ; boucle sans
    // saut. 40 s = la marche pôle à pôle : la carte « three » joue les deux ensemble (cardAnim prend la
    // plus longue durée ; une rotation plus courte sauterait au bouclage). Pas de lecture : l'angle de
    // vue n'est pas une mesure, le bandeau de la carte reste à la latitude.
    {
      const F = this._f3d; let yaw0 = F.yaw;
      const an = {
        duration: 40,
        begin: () => { yaw0 = F.yaw; },
        frameAt: (tt) => { F.yaw = yaw0 + (360 * tt) / 40; this._drawF3d(); },
        end: () => { F.yaw = yaw0; this._drawF3d(); },
        readout: () => "",
      };
      for (const [, c] of F.cv) c.__anim = an;
    }

    this._latInput.addEventListener("input", () => {
      this._walkSet(false);                      // on prend la main : la marche s'arrête
      const v = Number(this._latInput.value);
      if (Number.isFinite(v)) this._lat = Math.max(-89, Math.min(89, v));
      if (this._latRead) this._latRead.textContent = magSgn(this._lat) + "°";
      this.render();
    });
    // UN bouton : sans WebGL il pilote la marche pôle à pôle, avec WebGL la
    // rotation des trois scènes.
    this._walkBtn?.addEventListener("click", () => {
      if (!this._three) { this._walkSet(!this._walkOn); return; }
      const S = [this._g3d, this._f3d1, this._f3d2].filter(Boolean);
      if (!S.length) return;
      const on = S.map((x) => x.toggleSpin())[0];
      this._walkBtn.textContent = on ? t("spin-pause") : t("spin-play");
    });
    container.querySelector("details.fold:not(.mag-obs-all)").addEventListener("toggle", () => this.render());
    drawSymbols(KEY);
    drawFormulaFigs(container, (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; });   // epic15/UC04 : la méthode, avec son schéma
    // epic12 : mesures magnétiques (observatoires, stations de répétition…)
    mountObsSection(container, t, lang);
  },

  render() {
    const t = this._t, lat = this._lat;
    const r = magLat2r(lat);
    const g = globeMag(lat), f1 = flatMag(1, r), f2 = flatMag(2, r);

    this._note.innerHTML = fill(t("note-tpl"), { lat: lat.toFixed(1), r: (r / 1000).toFixed(1) });

    const dirOf = (I) => {
      if (I > 85) return t("dir-straight-down");
      if (I < -85) return t("dir-straight-up");
      return fill(t("dir-toward-tpl"), { nose: I >= 0 ? t("dir-nose-down") : t("dir-nose-up"), deg: Math.abs(I).toFixed(0) });
    };
    const row = (label, m, cls) => `<tr><td>${label}</td><td class="${cls}">${magSgn(m.I)}°</td><td class="${cls}">${m.H.toFixed(1)} μT</td><td class="${cls}">${m.B.toFixed(1)} μT</td><td>${dirOf(m.I)}</td></tr>`;
    this._rows.innerHTML = row(t("row-globe"), g, "g") + row(t("row-flat1"), f1, "f") + row(t("row-flat2"), f2, "f");

    this._cityI.innerHTML = MAGCITIES.map((c) => {
      const rc = magLat2r(c.mlat);
      return `<tr><td>${c.n}</td><td>${magSgn(c.mlat)}°</td><td><b>${magSgn(c.Io)}°</b></td><td class="g">${magSgn(globeMag(c.mlat).I)}°</td><td class="f">${magSgn(flatMag(1, rc).I)}°</td><td class="f">${magSgn(flatMag(2, rc).I)}°</td></tr>`;
    }).join("");
    this._cityB.innerHTML = MAGCITIES.map((c) => {
      const rc = magLat2r(c.mlat);
      return `<tr><td>${c.n}</td><td>${magSgn(c.mlat)}°</td><td><b>${c.Bo} μT</b></td><td class="g">${globeMag(c.mlat).B.toFixed(0)}</td><td class="f">${flatMag(1, rc).B.toFixed(0)}</td><td class="f">${flatMag(2, rc).B.toFixed(0)}</td></tr>`;
    }).join("");

    if (this._cityNote) this._cityNote.innerHTML = t("citynote");
    this._expOut.innerHTML = fill(t("exp5out-tpl"), {
      lat: lat.toFixed(1), r: (r / 1000).toFixed(1),
      gI: magSgn(g.I), gB: g.B.toFixed(1), gH: g.H.toFixed(1),
      f1I: magSgn(f1.I), f1B: f1.B.toFixed(1), f1H: f1.H.toFixed(1),
      f2I: magSgn(f2.I), f2B: f2.B.toFixed(1), f2H: f2.H.toFixed(1),
    });
    // plus de disposition « choisie » : l'écart cité est celui de la disposition
    // plate LA PLUS PROCHE du globe à cette latitude (règle 2, steel-man)
    this._expV.innerHTML = fill(t("exp5v-tpl"), { diff: Math.min(Math.abs(g.I - f1.I), Math.abs(g.I - f2.I)).toFixed(0) });

    drawProfile(this._cP, lat);
    if (!this._walkRender) this._drawF3d();          // pas 4 fois par seconde pendant la marche
    this._three = this._three ?? hasWebGL();
    if (!this._three) {
      this._sec = { lat, r, g, f1, f2 };
      this._nd ??= { g: { a: g.I, v: 0 }, f1: { a: f1.I, v: 0 }, f2: { a: f2.I, v: 0 } };
      this._nd.g.t = g.I; this._nd.f1.t = f1.I; this._nd.f2.t = f2.I;
      if (this._walkRender) return;                 // appelé par la marche elle-même
      if (this._walkOn === undefined) this._walkSet(true); // première activation : ça marche tout seul
      this._drawSections();
      this._needleLoop();
      return;
    }
    // epic03/UC03 : vraie 3D (Three.js, chargée à la demande), une scène par
    // modèle. Les coupes 2D restent le repli sans WebGL.
    this._active = true;
    this._gen = (this._gen || 0) + 1;
    const gen = this._gen;
    import("../../render3d/scene-mag.js").then(({ mountMagGlobe, mountMagFlat }) => {
      if (gen !== this._gen || !this._active) return;
      this._g3d ??= mountMagGlobe(this._cG, () => this._lat);
      this._f3d1 ??= mountMagFlat(this._cF1, 1, () => magLat2r(this._lat));
      this._f3d2 ??= mountMagFlat(this._cF2, 2, () => magLat2r(this._lat));
      for (const S of [this._g3d, this._f3d1, this._f3d2]) S.start();
      // les cadrans restent en 2D : ils se lisent mieux à plat
      this._sec = { lat, r, g, f1, f2 };
      this._nd = { g: { a: g.I }, f1: { a: f1.I }, f2: { a: f2.I } };
      drawDials(this._cD, this._sec, this._nd, t);
    }).catch((e) => {
      // Three.js n'a pas eu son contexte : les coupes 2D reprennent
      webglFailed(e);
      this._three = false; this._g3d = this._f3d1 = this._f3d2 = null;
      if (this._active) this.render();
    });
  },

  _drawF3d() {
    const F = this._f3d; if (!F) return;
    for (const [m, c] of F.cv) {
      const { ctx, W, H } = setupCanvas(c);
      if (!W) continue;                              // onglet encore masqué
      ctx.clearRect(0, 0, W, H);
      draw3D(ctx, m, 0, 0, W, H, { yaw: F.yaw, pitch: F.pitch, lang: this._lang });
    }
  },

  // glisser = tourner (lacet horizontal, tangage vertical, 5°..85° : toujours vu d'au-dessus du sol) ;
  // clavier : flèches, 10° par appui
  _wireF3d(c) {
    const F = this._f3d;
    const redraw = () => { if (!this._f3dRaf) this._f3dRaf = requestAnimationFrame(() => { this._f3dRaf = null; this._drawF3d(); }); };
    const turn = (dyaw, dpitch) => { F.yaw = (F.yaw + dyaw) % 360; F.pitch = Math.max(5, Math.min(85, F.pitch + dpitch)); redraw(); };
    let drag = null;
    c.classList.add("drag");   // glisser pour tourner : seul ce canvas bloque le défilement tactile (core/legacy.css)
    c.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY]; c.setPointerCapture?.(e.pointerId); });
    c.addEventListener("pointermove", (e) => {
      if (!drag) return;
      turn((e.clientX - drag[0]) * 0.5, (e.clientY - drag[1]) * 0.4);
      drag = [e.clientX, e.clientY];
    });
    const end = () => { drag = null; };
    c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end);
    c.setAttribute("tabindex", "0");
    c.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
      if (!k) return;
      e.preventDefault(); turn(...k);
    });
  },

  _drawSections() {
    const S = this._sec; if (!S) return;
    drawGlobeSection(this._cG, S.lat, S.g, this._nd.g.a);
    drawFlatSection(this._cF1, 1, S.r, S.f1, this._nd.f1.a);
    drawFlatSection(this._cF2, 2, S.r, S.f2, this._nd.f2.a);
    drawDials(this._cD, S, this._nd, this._t);
  },

  /* MARCHE PÔLE À PÔLE (2026-09-24, « mag ne bouge pas sans que je touche au
     curseur »). Sans WebGL, l'observateur parcourt lui-même les latitudes,
     λ = 80° sin(phase), un aller en 20 s, et les trois boussoles le suivent :
     c'est la démonstration de l'onglet -- l'inclinaison du globe balaie
     −90° → +90° en douceur, celles des disques plats font autre chose. Le
     curseur arrête la marche ; le bouton ⏸/▶ la relance.
     Les aiguilles suivent par un ressort amorti (ζ ≈ 0,6) : elles dépassent un
     peu et se posent. Purement visuel -- les chiffres affichés sont toujours
     les valeurs calculées. Tables : rafraîchies 4 fois par seconde seulement. */
  _walkSet(on) {
    this._walkOn = on;
    if (this._walkBtn && !this._three) this._walkBtn.textContent = on ? this._t("spin-pause") : this._t("walk-play");
    if (on) { this._walkPhase = Math.asin(Math.max(-1, Math.min(1, this._lat / 80))); this._needleLoop(); }
  },

  // un pas de la marche pôle à pôle et des aiguilles amorties (dt en s) : la boucle et l'export le partagent
  _walkStep(dt) {
    if (this._walkOn) {
      this._walkPhase = (this._walkPhase ?? 0) + dt * (Math.PI / 20);
      const lat = Math.round(80 * Math.sin(this._walkPhase) * 10) / 10;
      this._lat = lat;
      this._latInput.value = String(Math.round(lat));
      if (this._latRead) this._latRead.textContent = magSgn(lat) + "°";
      const r = magLat2r(lat), g = globeMag(lat), f1 = flatMag(1, r), f2 = flatMag(2, r);
      this._sec = { lat, r, g, f1, f2 };
      this._nd.g.t = g.I; this._nd.f1.t = f1.I; this._nd.f2.t = f2.I;
    }
    let moving = this._walkOn;
    for (const n of [this._nd.g, this._nd.f1, this._nd.f2]) {
      n.v = n.v || 0; n.t ??= n.a;
      n.v += (-60 * (n.a - n.t) - 9 * n.v) * dt; n.a += n.v * dt;
      if (Math.abs(n.a - n.t) > 0.05 || Math.abs(n.v) > 0.05) moving = true; else if (!this._walkOn) { n.a = n.t; n.v = 0; }
    }
    return moving;
  },

  // export (epic10/UC02) : la marche pôle à pôle (40 s par aller-retour), REJOUÉE par pas
  // de 1/60 s depuis l'état affiché (les aiguilles ont de l'inertie) ; tout est rendu à la fin
  _exportAnim() {
    let saved = null, simT = 0;
    const snap = () => ({ lat: this._lat, walkOn: this._walkOn, phase: this._walkPhase, sec: this._sec, nd: (this._nd === undefined ? undefined : JSON.parse(JSON.stringify(this._nd))) });
    const restore = (x) => { this._lat = x.lat; this._walkOn = x.walkOn; this._walkPhase = x.phase; this._sec = x.sec; this._nd = (x.nd === undefined ? undefined : JSON.parse(JSON.stringify(x.nd))); };
    return {
      duration: 40,
      begin: () => { if (this._ndRaf) { cancelAnimationFrame(this._ndRaf); this._ndRaf = null; } saved = snap(); simT = 0; this._walkOn = true;
        this._walkPhase ??= Math.asin(Math.max(-1, Math.min(1, this._lat / 80))); },
      frameAt: (t) => {
        if (!this._nd) return;
        if (t < simT) { restore(saved); this._walkOn = true; simT = 0; }
        while (simT < t - 1e-9) { const dt = Math.min(1 / 60, t - simT); this._walkStep(dt); simT += dt; }
        this._drawSections();
      },
      end: () => { restore(saved); saved = null; this._latInput.value = String(Math.round(this._lat)); this.render(); if (this._walkOn) this._needleLoop(); },
      readout: () => `magnetic latitude ${magSgn(this._lat)}° · dip I: globe ${this._sec?.g?.I?.toFixed?.(0)}°, flat (1 pole) ${this._sec?.f1?.I?.toFixed?.(0)}°, flat (2 poles) ${this._sec?.f2?.I?.toFixed?.(0)}°`,
    };
  },

  _needleLoop() {
    if (this._ndRaf || typeof requestAnimationFrame !== "function" || this._three || !this._nd) return;
    const needles = () => [this._nd.g, this._nd.f1, this._nd.f2];
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      this._walkOn = false;
      for (const n of needles()) n.a = n.t;
      this._drawSections(); return;
    }
    let last = 0, lastFull = 0;
    const step = (ts) => {
      this._ndRaf = null;
      if (this._cG.closest("[hidden]")) return;                // onglet masqué : on s'arrête
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
      const moving = this._walkStep(dt);
      if (this._walkOn && ts - lastFull > 250) { lastFull = ts; this._walkRender = true; this.render(); this._walkRender = false; }
      this._drawSections();
      if (moving) this._ndRaf = requestAnimationFrame(step);
    };
    this._ndRaf = requestAnimationFrame(step);
  },

  teardown() {
    if (this._ndRaf) { cancelAnimationFrame(this._ndRaf); this._ndRaf = null; }
    if (this._f3dRaf) { cancelAnimationFrame(this._f3dRaf); this._f3dRaf = null; }
    this._active = false;
    for (const S of [this._g3d, this._f3d1, this._f3d2]) S?.stop();
  },
};

/**
 * Rangée de trois cadrans d'inclinaison (dip circles vus par la tranche),
 * TOUS orientés pareil : horizontale du lieu en gris, nord à droite, bas en
 * bas. Aiguille à l'angle AFFICHÉ (en oscillation), valeur CALCULÉE en
 * dessous. Sens horizontal : vers le nord pour le globe ; pour le disque
 * plat, « nord » = vers le centre, donc H > 0 → à droite, H < 0 → à gauche.
 */
function drawDials(canvas, S, nd, t) {
  if (!canvas) return;
  const { ctx, W, H } = setupCanvas(canvas);
  if (!W) return;
  ctx.clearRect(0, 0, W, H);
  const items = [
    [t("row-globe"), S.g, nd.g.a, 1, css("--globe", "#0f766e")],
    [t("row-flat1"), S.f1, nd.f1.a, S.f1.H >= 0 ? 1 : -1, css("--flat", "#b45309")],
    [t("row-flat2"), S.f2, nd.f2.a, S.f2.H >= 0 ? 1 : -1, css("--flat", "#b45309")],
  ];
  const cw = W / 3, R = Math.min(cw * 0.36, (H - 44) / 2), cy = 12 + R;
  items.forEach(([label, m, Ia, hs, col], k) => {
    const cx = cw * k + cw / 2;
    // cadran
    const face = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    face.addColorStop(0, "#ffffff"); face.addColorStop(1, "#eef0f2");
    ctx.fillStyle = face; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    // graduations tous les 15°, plus longues à 0° et 90°
    ctx.strokeStyle = "rgba(21,26,33,0.4)"; ctx.lineWidth = 1;
    for (let a = 0; a < 360; a += 15) {
      const long = a % 90 === 0, c = Math.cos(RAD(a)), s = Math.sin(RAD(a));
      ctx.beginPath(); ctx.moveTo(cx + c * R * (long ? 0.8 : 0.88), cy + s * R * (long ? 0.8 : 0.88)); ctx.lineTo(cx + c * R, cy + s * R); ctx.stroke();
    }
    // horizontale du lieu
    ctx.strokeStyle = "#9aa3ad"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#9aa3ad"; ctx.font = "9px ui-monospace, monospace"; ctx.textAlign = "right";
    ctx.fillText("N", cx + R - 2, cy - 3);
    // aiguille
    const I = RAD(Ia), dx = hs * Math.cos(I), dy = Math.sin(I);
    const nx = -dy, ny = dx, w = R * 0.1, L = R * 0.85;
    ctx.fillStyle = "#d32f2f";
    ctx.beginPath(); ctx.moveTo(cx + dx * L, cy + dy * L); ctx.lineTo(cx + nx * w, cy + ny * w); ctx.lineTo(cx - nx * w, cy - ny * w); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#9aa3ad";
    ctx.beginPath(); ctx.moveTo(cx - dx * L, cy - dy * L); ctx.lineTo(cx + nx * w, cy + ny * w); ctx.lineTo(cx - nx * w, cy - ny * w); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 7); ctx.fill();
    // étiquettes
    ctx.textAlign = "center";
    ctx.fillStyle = col; ctx.font = `600 ${cw < 140 ? 13 : 16}px ui-monospace, monospace`;
    ctx.fillText(`I = ${magSgn(m.I)}°`, cx, cy + R + 18);
    ctx.fillStyle = "#5b6470"; ctx.font = `${cw < 140 ? 9 : 11}px ui-monospace, monospace`;
    const words = label.split(" "), line2 = words.slice(1).join(" ");
    ctx.fillText(cw < 140 ? words[0] : label, cx, cy + R + 32);
    if (cw < 140 && line2) ctx.fillText(line2, cx, cy + R + 43);
  });
  ctx.textAlign = "start";
}

function css(name, fallback) { return figColor(name, fallback); }

/** Aiguille de boussole d'inclinaison : pivot (px,py), direction unité (dx,dy) de B à l'écran ; moitié rouge vers B. */
function compassNeedle(ctx, px, py, dx, dy, len) {
  const nx = -dy, ny = dx, w = len * 0.13;
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.strokeStyle = "rgba(21,26,33,0.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(px, py, len * 0.62, 0, 7); ctx.fill(); ctx.stroke();       // cadran
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath(); ctx.moveTo(px + dx * len * 0.5, py + dy * len * 0.5); ctx.lineTo(px + nx * w, py + ny * w); ctx.lineTo(px - nx * w, py - ny * w); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#9aa3ad";
  ctx.beginPath(); ctx.moveTo(px - dx * len * 0.5, py - dy * len * 0.5); ctx.lineTo(px + nx * w, py + ny * w); ctx.lineTo(px - nx * w, py - ny * w); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(px, py, 2.2, 0, 7); ctx.fill();
}

/** Pointe de flèche pleine en (x,y), dirigée selon (dx,dy) (écran, non normalisé). */
function arrowHead(ctx, x, y, dx, dy, size, color) {
  const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + ux * size, y + uy * size);
  ctx.lineTo(x - ux * size - uy * size * 0.7, y - uy * size + ux * size * 0.7);
  ctx.lineTo(x - ux * size + uy * size * 0.7, y - uy * size - ux * size * 0.7);
  ctx.closePath(); ctx.fill();
}

/** Coupe méridienne du globe : lignes de champ dipolaires r = L cos²λ, barreau central, boussole (angle affiché Id). */
function drawGlobeSection(canvas, lat, g, Id = g.I) {
  const { ctx, W, H } = setupCanvas(canvas);
  ctx.clearRect(0, 0, W, H);
  // la ligne de champ la plus large (L = 3,2 rayons) doit tenir dans la colonne
  const cx = W / 2, cy = H / 2, R = Math.min(W * 0.15, H * 0.24);
  const globe = css("--globe", "#0f766e"), ink = css("--ink", "#151a21"), soft = css("--ink-soft", "#5b6470");
  // lignes de champ : du sud (λ = −90) vers le nord -- le champ terrestre SORT
  // dans l'hémisphère sud et RENTRE au nord ; chevron au sommet de chaque ligne
  ctx.strokeStyle = soft; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  for (const L of [1.35, 1.8, 2.4, 3.2]) {
    for (const side of [1, -1]) {
      ctx.beginPath(); let pen = false;
      for (let a = -90; a <= 90; a += 2) {
        const rr = L * Math.cos(RAD(a)) ** 2;
        if (rr < 1) { pen = false; continue; }
        const x = cx + side * R * rr * Math.cos(RAD(a)), y = cy - R * rr * Math.sin(RAD(a));
        pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
      }
      ctx.stroke();
      const ax = cx + side * R * L, ay = cy;
      ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(ax - 4, ay + 3); ctx.lineTo(ax, ay - 3); ctx.lineTo(ax + 4, ay + 3); ctx.stroke(); ctx.setLineDash([3, 3]);
    }
  }
  ctx.setLineDash([]);
  // la coupe : ombrée, liseré
  const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
  body.addColorStop(0, "#f0f8f6"); body.addColorStop(0.7, css("--globe-tint", "#dcefec")); body.addColorStop(1, "#b3d3ce");
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = body; ctx.fill();
  ctx.strokeStyle = globe; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(cx, cy - R * 1.15); ctx.lineTo(cx, cy + R * 1.15); ctx.stroke(); ctx.globalAlpha = 1;
  // barreau central : son pôle S est au nord géographique (c'est lui qui attire le N des boussoles)
  const bw = R * 0.12, bh = R * 0.3;
  ctx.fillStyle = "#3b5bdb"; ctx.fillRect(cx - bw / 2, cy - bh, bw, bh);
  ctx.fillStyle = "#d32f2f"; ctx.fillRect(cx - bw / 2, cy, bw, bh);
  ctx.fillStyle = "#fff"; ctx.font = `600 ${Math.max(8, Math.round(bw * 0.8))}px ui-monospace, monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("S", cx, cy - bh / 2); ctx.fillText("N", cx, cy + bh / 2);
  ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  // observateur et boussole (I sous l'horizontale locale), pivot un peu au-dessus du sol
  const ox = cx + R * Math.cos(RAD(lat)), oy = cy - R * Math.sin(RAD(lat));
  const ux = Math.cos(RAD(lat)), uy = -Math.sin(RAD(lat));       // verticale locale vers le haut
  const tx = -Math.sin(RAD(lat)), ty = -Math.cos(RAD(lat)); // horizontale locale vers le nord
  const nx = -ux, ny = -uy; // vers le bas
  const len = 34, I = RAD(Id);
  const bx = tx * Math.cos(I) + nx * Math.sin(I), by = ty * Math.cos(I) + ny * Math.sin(I);
  const px = ox + ux * 26, py = oy + uy * 26;
  ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(px, py); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, 7); ctx.fill();
  compassNeedle(ctx, px, py, bx, by, len);
  ctx.font = "11px ui-monospace, monospace"; ctx.fillStyle = ink;
  ctx.fillText(`λ = ${lat.toFixed(1)}°  I = ${magSgn(g.I)}°`, 8, H - 8);
  ctx.fillStyle = soft; ctx.fillText("N", cx - 4, cy - R * 1.2);
}

/** Coupe du disque plat : surface, source(s) enfouie(s), lignes de champ, observateur. */
function drawFlatSection(canvas, ver, rObs, f, Id = f.I) {
  const { ctx, W, H } = setupCanvas(canvas);
  ctx.clearRect(0, 0, W, H);
  const flat = css("--flat", "#b45309"), ink = css("--ink", "#151a21"), soft = css("--ink-soft", "#5b6470");
  const pad = 14, gy = H * 0.55, sx = (W - 2 * pad) / (2 * MAG_RKM);
  const X = (rkm) => W / 2 + rkm * sx, Y = (zkm) => gy - zkm * sx;
  ctx.fillStyle = css("--flat-tint", "#f6ecdc"); ctx.fillRect(pad, gy, W - 2 * pad, H - gy - pad);
  ctx.strokeStyle = flat; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(W - pad, gy); ctx.stroke();
  ctx.setLineDash([3, 3]); ctx.strokeStyle = soft; ctx.lineWidth = 1;
  if (ver === 1) {
    // aimant vertical sous le centre : dipôle en (0, -D1), lignes r = L cos²θ autour de lui
    const my = Y(-MAG_D1);
    for (const L of [0.5, 0.9, 1.4, 2.0]) {
      for (const s of [1, -1]) {
        ctx.beginPath();
        for (let a = -90; a <= 90; a += 2) {
          const rr = L * MAG_D1 * Math.cos(RAD(a)) ** 2;
          const x = W / 2 + s * rr * Math.cos(RAD(a)) * sx, y = my - rr * Math.sin(RAD(a)) * sx;
          a === -90 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    ctx.fillStyle = ink; ctx.fillRect(W / 2 - 4, my - 26, 8, 52);
  } else {
    // Boucles FERMÉES (∇·B = 0, charge nette nulle) : chaque ligne tracée part de l'anneau (+),
    // passe au-dessus du plan des pôles et entre dans le pôle central (−) -- raccordée aux deux
    // pôles pour qu'aucune ne paraisse s'arrêter -- puis revient au bord DANS le disque aimanté
    // enterré (aimantation radiale vers l'extérieur, M ∝ 1/r). Flèches = sens de B.
    const soft2 = css("--ink-soft", "#5b6470");
    for (const pts of magTrace2()) {
      const full = [[0, -MAG_D2], ...pts, [MAG_RKM, -MAG_D2]];
      for (const s of [1, -1]) {
        const P = full.map(([r, z]) => [X(s * r), Y(z)]);
        ctx.beginPath();
        P.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.stroke();
        const m = Math.floor(P.length / 2); // B va de l'anneau vers le centre : vers les indices décroissants
        arrowHead(ctx, P[m][0], P[m][1], P[m - 1][0] - P[m + 1][0], P[m - 1][1] - P[m + 1][1], 5, soft2);
      }
    }
    ctx.setLineDash([]);
    // le disque aimanté enterré : le retour des lignes, du centre vers le bord
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(X(-MAG_RKM), Y(-MAG_D2)); ctx.lineTo(X(MAG_RKM), Y(-MAG_D2)); ctx.stroke();
    for (const s of [1, -1]) for (const f of [0.3, 0.7]) arrowHead(ctx, X(s * f * MAG_RKM), Y(-MAG_D2), s, 0, 6, ink);
    ctx.lineWidth = 1;
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(X(0), Y(-MAG_D2), 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(X(MAG_RKM), Y(-MAG_D2), 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(X(-MAG_RKM), Y(-MAG_D2), 5, 0, 7); ctx.fill();
  }
  // observateur et vecteur B
  const ox = X(rObs), oy = gy, len = 34, I = RAD(Id), hs = f.H >= 0 ? -1 : 1; // H>0 = vers le centre
  const px = ox, py = oy - 26;                                  // pivot au-dessus du sol
  ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(px, py); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, 7); ctx.fill();
  compassNeedle(ctx, px, py, hs * Math.cos(I), Math.sin(I), len);
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText(`r = ${(rObs / 1000).toFixed(1)}k km  I = ${magSgn(f.I)}°`, 8, H - 8);
}

/** Profil I(r) : globe (bande ±10°) contre flat ① et ②. */
function drawProfile(canvas, latNow) {
  const { ctx, W, H } = setupCanvas(canvas);
  ctx.clearRect(0, 0, W, H);
  const L = 44, R = W - 14, T = 14, B = H - 30;
  const X = (r) => L + (r / MAG_RKM) * (R - L), Y = (I) => T + ((90 - I) / 180) * (B - T);
  const globe = css("--globe", "#0f766e"), flat = css("--flat", "#b45309"), soft = css("--ink-soft", "#5b6470"), ink = css("--ink", "#151a21");
  ctx.strokeStyle = css("--line", "#d7d3c8"); ctx.lineWidth = 1;
  for (const I of [-90, -45, 0, 45, 90]) { ctx.beginPath(); ctx.moveTo(L, Y(I)); ctx.lineTo(R, Y(I)); ctx.stroke(); }
  ctx.fillStyle = soft; ctx.font = "10px ui-monospace, monospace";
  for (const I of [-90, -45, 0, 45, 90]) ctx.fillText(magSgn(I), 4, Y(I) + 3);
  for (const rk of [0, 5000, 10000, 15000, 20000]) ctx.fillText(`${rk / 1000}k`, X(rk) - 8, B + 14);
  // bande globe ±10° d'inclinaison d'axe
  ctx.fillStyle = css("--globe-tint", "#dcefec");
  ctx.beginPath();
  for (let r = 0; r <= MAG_RKM; r += 200) ctx.lineTo(X(r), Y(globeMag(Math.min(89.9, 90 - (r * 180) / MAG_RKM + 10)).I));
  for (let r = MAG_RKM; r >= 0; r -= 200) ctx.lineTo(X(r), Y(globeMag(Math.max(-89.9, 90 - (r * 180) / MAG_RKM - 10)).I));
  ctx.closePath(); ctx.fill();
  const curve = (fn, color, dash) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []);
    ctx.beginPath();
    for (let r = 50; r < MAG_RKM; r += 100) { const p = [X(r), Y(fn(r))]; r === 50 ? ctx.moveTo(...p) : ctx.lineTo(...p); }
    ctx.stroke(); ctx.setLineDash([]);
  };
  curve((r) => globeMag(90 - (r * 180) / MAG_RKM).I, globe);
  curve((r) => flatMag(1, r).I, flat);
  curve((r) => flatMag(2, r).I, flat, [5, 4]);
  ctx.fillStyle = ink;
  for (const c of MAGCITIES) { ctx.beginPath(); ctx.arc(X(magLat2r(c.mlat)), Y(c.Io), 3, 0, 7); ctx.fill(); }
  const rn = magLat2r(latNow);
  ctx.strokeStyle = ink; ctx.setLineDash([2, 3]);
  ctx.beginPath(); ctx.moveTo(X(rn), T); ctx.lineTo(X(rn), B); ctx.stroke(); ctx.setLineDash([]);
}
