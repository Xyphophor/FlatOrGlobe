// Onglet "obs" -- guide d'observation + l'outil « prédire d'abord,
// photographier ensuite ». Panneau porté VERBATIM (flux
// src/data/prose/obs.js, legacy L13692-14073 : bandeau WIP, renvois,
// trois panneaux Vue/Carte/Données avec leurs commandes, prose, formules,
// expérience, figure). Le rendu est celui du legacy (drawObs L26447,
// drawObsMap L26726, obsReads L26812, obsCrossing L29291, lecture
// L26876-26893), sur src/core/ephemeris.js (Meeus, validé contre
// libastro) et le profil d'horizon cuit src/data/dem/globespot.js.
// Le legacy déclare cet onglet « work in progress », anglais seulement.
//
// k : le legacy lit #kcoef via son unique formulaire global (onglet sim),
// ANDé avec sa propre case #obsRefr ("#obsRefr is ANDed with #refr, it
// does not replace it", L1142-1145). src/core/settings.js remplace ce
// formulaire global (un état en mémoire écrit par sim, indépendant du
// montage) -- voir ce module pour ce qui est vraiment partagé. Le
// sélecteur de points de vue nommés du legacy n'existait pas non plus :
// OBS_SITE est le seul site cuit (HORIZONS).
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { setupCanvas } from "../../core/canvas.js";
import { OBS } from "../../core/ephemeris.js";
import { GLOBESPOT } from "../../data/dem/globespot.js";
import { refineProfile } from "../../core/horizon.js";
import { OBS_SITE, OBS_TARGETS, OBS_ATM, obsKof, obsRefrF } from "../../data/presets/obs.js";
import { cite } from "../../core/citations.js";
import { PROSE } from "../../data/prose/obs.js";
import { SOURCES, READING } from "../../data/sources/obs.js";
import { getSettings, setK } from "../../core/settings.js";
import { mountJan10 } from "./jan10.js";
import { budget, rApp, predicted, figTheo } from "./theo.js";
import { T, setT } from "./t.js";
import { makeT } from "../../core/i18n.js";
import "./style.css";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";
const OBS_MAP = makeAE();   // pôle Nord, Greenwich vers le bas : (cx + r sin λ, cy + r cos λ)

const KEY = "obs";
const HORIZONS = { globespot: refineProfile(GLOBESPOT) };   // détail LiDAR à 0,01° sur la bande des couchers

const obsAm = (d) => (d * 60).toFixed(2) + "′";
const D2R = Math.PI / 180;

function obsCamera(canvas, azC, altC, fov) {
  const { ctx, W, H } = setupCanvas(canvas);
  const v = (az, alt) => [Math.cos(alt * D2R) * Math.cos(az * D2R), Math.cos(alt * D2R) * Math.sin(az * D2R), Math.sin(alt * D2R)];
  const f = v(azC, altC);
  const r = [-Math.sin(azC * D2R), Math.cos(azC * D2R), 0];
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
  const sc = (W / 2) / Math.tan(fov / 2 * D2R);
  const P = (az, alt) => {
    const p = v(az, alt), Z = p[0] * f[0] + p[1] * f[1] + p[2] * f[2];
    if (Z <= 0.02) return [0, 0, false];
    return [W / 2 + (p[0] * r[0] + p[1] * r[1] + p[2] * r[2]) / Z * sc, H / 2 - (p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) / Z * sc, true];
  };
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  return { ctx, W, H, P };
}

/* Le croisement des deux crêtes. Depuis le recuit LiDAR (2026-09-24) le
   générateur le calcule lui-même (HP.crossing : un balayage par crête au pas
   de 0,002°) ; l'ajustement de deux droites du legacy, ci-dessous, ne sert
   plus que de repli pour un profil qui n'en porte pas. Sur le profil LiDAR à
   0,1° il tombait à 241,51° au lieu de 241,29° : la crête proche n'est pas
   une droite. */
export function obsCrossing(HP) {
  if (!HP) return null;
  if (HP.crossing) return HP.crossing;
  const fit = (arr, lo, hi) => {
    let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (let i = 0; i < arr.length; i++) {
      const a = HP.az0 + i * HP.step;
      if (a < lo || a > hi) continue;
      n++; sx += a; sy += arr[i]; sxx += a * a; sxy += a * arr[i];
    }
    const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    return [m, (sy - m * sx) / n];
  };
  const solve = (arr) => {
    const f = fit(arr, 239.6, 241.1), n = fit(arr, 241.9, 242.9);
    const az = (n[1] - f[1]) / (f[0] - n[0]);
    return { az, alt: f[0] * az + f[1] };
  };
  return { flat: solve(HP.flat), globe: solve(HP.globe), globeK: solve(HP.globeK) };
}

/* ATMOSPHÈRE (2026-09-24, question du propriétaire sur les soirs d'hiver).
   UN SEUL k SUR LA PAGE (règle du legacy, v51) : ce panneau n'en ajoute pas
   un second, il CALCULE le k unique (settings.js) depuis T, P et le gradient
   dT/dh -- k = 503·P/T²·(0,0343 + dT/dh), P en hPa, T en K, dT/dh en K/m
   (la formule de l'onglet ref, ses sources n3-n5 ; ISA donne ~0,15 à 1 690 m,
   ~0,17 au niveau de la mer ; la page garde 0,13, valeur géodésique
   classique). k ne touche que le globe, jamais le plan (règle 3).
   La réfraction ASTRONOMIQUE du Soleil (Sæmundsson, calibrée à 1010 hPa et
   10 °C) est multipliée par P/1010 · 283/(273 + T) (Meeus, ch. 16). À 1 690 m
   la pression est ~826 hPa : la valeur « niveau de la mer » que la page
   utilisait par défaut surestime la réfraction de ~15 %.
   Préréglages CALCULÉS à l'altitude du point de vue (ISA : 826 hPa, 4 °C),
   dans src/data/presets/obs.js (partagés avec ct). Défaut : ISA au point de
   vue (décision du propriétaire, 2026-09-24). */
export default {
  key: KEY,
  label: "Observation",

  _mountTheo(container, lang) {
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    const host = container.querySelector("#obsFxTheo"); if (host) figTheo(tr).mountIn(host);
    const b = budget(), tb = container.querySelector("#obs-tbTheo");
    if (tb) tb.innerHTML = [["alpha", tr("obs-theo-a", "elevation angle α"), "±10″"], ["s", tr("obs-theo-s", "distance s"), "±0.4 %"], ["dh", tr("obs-theo-h", "height difference Δh"), "±5 m"]]
      .map(([k, n, p]) => `<tr><td>${n}</td><td>${p}</td><td>±${nf(b.parts[k], 1)} %</td></tr>`).join("") +
      `<tr><td><b>${tr("obs-theo-tot", "together")}</b></td><td></td><td><b>±${nf(b.total, 1)} %</b></td></tr>`;
    const q = (id) => container.querySelector("#" + id);
    const upd = () => {
      const out = q("obsThOut"), v = q("obsThV"); if (!out) return;
      const a = +q("obsThA").value, s = +q("obsThS").value, h = +q("obsThH").value;
      if (!(s > 0 && h > 0) || !isFinite(a)) { out.textContent = ""; v.textContent = ""; return; }
      const R = rApp(a, s, h), p = predicted({ s, dh: h, k: 0.13, R: 6371 });
      out.innerHTML = isFinite(R) ? tr("obs-theo-out", "R/(1 − k) = <b>{R} km</b>").replace("{R}", nf(R, 0)) : tr("obs-theo-inf", "α ≥ Δh/s: no curvature, the plane's answer");
      v.innerHTML = tr("obs-theo-v", "plane α = {p}′ · globe α (k = 0.13) = {g}′").replace("{p}", nf(p.plane, 1)).replace("{g}", nf(p.globeK, 2));
    };
    for (const id of ["obsThA", "obsThS", "obsThH"]) q(id)?.addEventListener("input", upd);
    upd();
  },

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en", mk = makeT(lang, KEY);
    setT((k, fb) => { const v = mk(k); return v && v !== k ? v : fb; });
    container.innerHTML = renderProse(KEY, PROSE, { reading: READING, dict: getProseDict(lang, KEY) });
    // le coucher du 10 janvier 2026 en grille 2 × 2 (jan10.js)
    this._jan = mountJan10(container);
    const q = (s) => container.querySelector(s);
    const ids = ["obsDate", "obsTime", "obsBody", "obsLamp", "obsLampV", "obsFov", "obsFovV", "obsSpeed", "obsSpeedV", "obsPlay", "obsBack", "obsFwd",
      "obsTrack", "obsRefr", "obsSky", "obsFilter", "obsFlatSun", "obsCam", "obsMap", "obsReads", "obsReads2", "obsCross", "obsMapReads", "obsTbl", "obsExpOut", "obsExpV"];
    this._el = Object.fromEntries(ids.map((id) => [id, q("#" + id)]));
    const e = this._el;
    this._playing = false; this._off = 0; this._raf = null; this._last = 0;
    for (const id of ["obsDate", "obsTime", "obsBody", "obsRefr", "obsTrack", "obsSky", "obsFilter", "obsFlatSun"]) e[id].addEventListener("input", () => this._draw());
    e.obsBody.addEventListener("change", () => this._draw()); e.obsTrack.addEventListener("change", () => this._draw());
    e.obsLamp.addEventListener("input", (ev) => { e.obsLampV.textContent = (+ev.target.value).toLocaleString() + " km"; this._draw(); });
    e.obsFov.addEventListener("input", (ev) => { e.obsFovV.textContent = (+ev.target.value).toFixed(1) + "°"; this._draw(); });
    e.obsSpeed.addEventListener("input", (ev) => { e.obsSpeedV.textContent = ev.target.value + "×"; });
    e.obsFwd.addEventListener("click", () => { this._off += 60; this._setClock(this._jd()); this._draw(); });
    e.obsBack.addEventListener("click", () => { this._off -= 60; this._setClock(this._jd()); this._draw(); });
    e.obsPlay.addEventListener("click", () => this._togglePlay());
    // export (epic10/UC02) : 30 s de lecture à la vitesse choisie (60× : une demi-heure de ciel),
    // sans toucher aux champs date/heure ; readout : l'heure courante et les lectures de la caméra
    if (e.obsCam) {
      let saved = null;
      const hms = () => { const jd = this._jd(), d = new Date(Math.round((jd - 2440587.5) * 86400000 + OBS_SITE.tz * 3600000));
        return d.toISOString().slice(0, 10) + " " + d.toISOString().slice(11, 19) + " CET"; };
      e.obsCam.__anim = {
        duration: 30,
        begin: () => { saved = { off: this._off, playing: this._playing, speed: parseFloat(e.obsSpeed.value) || 60 }; if (this._playing) this._togglePlay(); },
        frameAt: (t) => { this._off = saved.off + t * saved.speed; this._draw(); },
        end: () => { this._off = saved.off; const wasPlaying = saved.playing; saved = null; this._draw(); if (wasPlaying) this._togglePlay(); },
        readout: () => [hms(), ...[...(e.obsReads?.children || [])].map((r) => r.textContent.replace(/\s+/g, " ").trim())].filter(Boolean).join(" · "),
      };
      if (e.obsMap) e.obsMap.__anim = e.obsCam.__anim;    // _draw() redessine la carte avec la caméra : même boucle
    }
    this._step = (now) => {
      if (!this._playing) return;
      // ~30 images/s (2026-09-24) : la carte est redessinée avec la vue
      if (now - this._last < 32) { this._raf = requestAnimationFrame(this._step); return; }
      const dt = Math.min(0.1, (now - this._last) / 1000); this._last = now;
      this._off += dt * parseFloat(e.obsSpeed.value);
      if (Math.abs(this._off) > 30) this._setClock(this._jd());
      this._draw();
      this._raf = requestAnimationFrame(this._step);
    };
    this._crossReads();
    /* RENDU EN COUCHES (2026-09-24) : un sélecteur à côté de « Skylines », et
       les couches cuites par research/lidar_horizon.py --layers, chargées à la
       demande (183 ko, chunk séparé). */
    // la cellule « Options » sur toute la largeur, par une classe et non par :has()
    // (un Firefox antérieur à 121 ignore :has() : la cellule restait large de 118 px
    // et ses cases à cocher s'empilaient en une longue colonne)
    e.obsRefr?.closest(".obsctl > div")?.classList.add("obsopts");
    const sky = e.obsSky?.closest("label");
    if (sky && !this._el.obsLand) {
      const lab = document.createElement("label"); lab.className = "obschk";
      lab.innerHTML = `${T("land", "Landscape")} <select id="obsLand"><option value="globe">${T("land-globe", "globe")}</option><option value="flat">${T("land-plane", "plane")}</option><option value="none">${T("land-none", "none")}</option></select>`;
      sky.after(lab);
      this._el.obsLand = lab.querySelector("select");
      this._el.obsLand.addEventListener("change", () => this._draw());
    }
    // panneau Atmosphère, dans la grille compacte des contrôles
    const ctl = this._el.obsCam?.closest(".panel")?.querySelector(".obsctl");
    if (ctl && !this._el.obsAtm) {
      const box = document.createElement("div"); box.className = "obsatm";
      box.innerHTML = `<label class="f">${T("atm", "Atmosphere")}</label>
        <div class="obsrow" style="flex-wrap:wrap">
          <select id="obsAtm">${Object.entries(OBS_ATM).map(([k2, v]) => `<option value="${k2}">${T("atm-" + k2, v.label)}</option>`).join("")}<option value="custom">${T("atm-custom", "custom")}</option></select>
          <label class="obschk">T <input type="range" id="obsT" min="-20" max="35" step="1"> <span id="obsTV"></span></label>
          <label class="obschk">P <input type="range" id="obsP" min="700" max="1050" step="1"> <span id="obsPV"></span></label>
          <label class="obschk">dT/dh <input type="range" id="obsG" min="-10" max="20" step="0.5"> <span id="obsGV"></span></label>
        </div>
        <div class="reads" id="obsAtmReads" style="margin-top:4px"></div>`;
      ctl.appendChild(box);
      for (const id of ["obsAtm", "obsT", "obsTV", "obsP", "obsPV", "obsG", "obsGV", "obsAtmReads"]) this._el[id] = box.querySelector("#" + id);
      this._atm = { ...OBS_ATM.isa };
      const apply = () => {
        const a = this._atm, E = this._el;
        E.obsT.value = a.T; E.obsP.value = a.P; E.obsG.value = a.g;
        E.obsTV.textContent = `${a.T} °C`; E.obsPV.textContent = `${a.P} hPa`; E.obsGV.textContent = `${a.g > 0 ? "+" : ""}${a.g} °C/km`;
        setK(Math.round(obsKof(a) * 1000) / 1000);   // LE k de la page, pas un second
        this._contactsKey = null; this._draw();
      };
      this._el.obsAtm.addEventListener("change", () => { const v = this._el.obsAtm.value; if (v !== "custom") this._atm = { ...OBS_ATM[v] }; apply(); });
      for (const [id, key] of [["obsT", "T"], ["obsP", "P"], ["obsG", "g"]]) this._el[id].addEventListener("input", () => {
        this._atm = { T: +this._el.obsT.value, P: +this._el.obsP.value, g: +this._el.obsG.value }; this._el.obsAtm.value = "custom"; apply();
      });
      apply();
    }
    // export (epic10/11) : la caméra et la carte sont dans des .panel, que le bouton
    // d'export ne voit pas -- chacune reçoit un bloc à elle ; le schéma d/R, un id
    for (const cv of [e.obsCam, e.obsMap]) if (cv && !cv.parentElement.hasAttribute("data-xp-block")) {
      const w = document.createElement("div"); w.setAttribute("data-xp-block", ""); cv.before(w); w.appendChild(cv);
    }
    const jan = container.querySelector(".fig.obs-jan");
    if (jan && !jan.id) jan.id = "obsJanFig";
    import("../../data/dem/globespot-layers.json").then((m) => { this._layers = m.default || m; this._draw(); }).catch(() => {});
    this._mountTheo(container, lang);   // epic19/UC14 : le 24 novembre au théodolite
    drawSymbols(KEY);
  },

  render() { this._draw(); this._jan?.start(); },
  teardown() { if (this._playing) this._togglePlay(); this._jan?.stop(); },

  _togglePlay() {
    const e = this._el;
    this._playing = !this._playing;
    e.obsPlay.textContent = this._playing ? T("pause", "Pause") : T("play", "Play");
    e.obsPlay.classList.toggle("on", this._playing);
    this._last = performance.now();
    if (this._playing) this._raf = requestAnimationFrame(this._step); else cancelAnimationFrame(this._raf);
  },

  _jd() {
    const [Y, M, D] = this._el.obsDate.value.split("-").map(Number);
    const [h, m, s] = this._el.obsTime.value.split(":").map(Number);
    return OBS.jdFromUTC(Y, M, D, h - OBS_SITE.tz, m, (s || 0) + this._off);
  },
  _setClock(jd) {
    const d = new Date(Math.round((jd - 2440587.5) * 86400000 + OBS_SITE.tz * 3600000));
    const p = (n) => String(n).padStart(2, "0");
    this._el.obsDate.value = `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
    this._el.obsTime.value = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
    this._off = 0;
  },

  _draw() {
    const $ = this._el;
    const jd = this._jd();
    const { k, refr } = getSettings(); // le k et la case réfraction uniques de la page (onglet sim)
    const refrOn = refr && $.obsRefr.checked; // ANDed, ne remplace pas (legacy L1142-1145)
    let fov = parseFloat($.obsFov.value); // réassigné par le mode « frame both »
    const body = $.obsBody.value;
    const lampKM = parseFloat($.obsLamp.value);
    const B = OBS.bodyAt(body, jd, OBS_SITE.lat, OBS_SITE.lon, OBS_SITE.h, { refraction: refrOn, lampKM });
    const fAtm = obsRefrF(this._atm || OBS_ATM.isa);
    if (refrOn) { B.refrArcmin *= fAtm; B.altApp = B.altTrue + B.refrArcmin / 60; }
    const bodyAlt = refrOn ? B.altApp : B.altTrue;
    // chaque point du bord réfracté à sa hauteur : le disque aplati près de l'horizon (ephemeris.js, limbAlt)
    const limbOf = (off) => refrOn ? OBS.limbAlt(B.altTrue, off, fAtm) : B.altTrue + off;
    // crête du globe AU k courant : interpolation linéaire entre les profils
    // cuits à k = 0 et k = 0,13 (exacte tant que le même point reste le plus haut)
    const gAt = (g0, gk) => { const key = `${k}`; if (!refrOn) return g0; this._gk ??= new Map();
      const c = this._gk.get(gk); if (c && c.key === key) return c.arr;
      const arr = g0.map((v, i) => v === null ? null : v + (gk[i] - v) * (k / 0.13)); this._gk.set(gk, { key, arr }); return arr; };
    const HPg = HORIZONS[OBS_SITE.key] ? gAt(HORIZONS[OBS_SITE.key].globe, HORIZONS[OBS_SITE.key].globeK) : null;
    const rows = OBS_TARGETS.map((t) => Object.assign({}, t, {
      flat: OBS.flatAngle(OBS_SITE.h, t.h, t.d),
      globe: OBS.targetAngle(OBS_SITE.h, t.h, t.d, 6371, refrOn ? k : 0) }));

    // séparation angulaire des deux objets prédits, sur la sphère des directions
    const dirv = (az, al) => [Math.cos(al * D2R) * Math.cos(az * D2R), Math.cos(al * D2R) * Math.sin(az * D2R), Math.sin(al * D2R)];
    const v1 = dirv(B.az, bodyAlt), v2 = dirv(B.flat.az, B.flat.alt);
    const sep = Math.acos(Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]))) / D2R;

    const mode = $.obsTrack.value;
    let azC, altC, fovUse = fov;
    if (mode === "flat") { azC = B.flat.az; altC = B.flat.alt; }
    else if (mode === "fixed") { azC = 241.0; altC = 0; }
    else if (mode === "both") {
      const m = [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
      const n = Math.hypot(m[0], m[1], m[2]);
      altC = Math.asin(m[2] / n) / D2R;
      azC = (Math.atan2(m[1], m[0]) / D2R + 360) % 360;
      fovUse = Math.max(fov, Math.min(120, sep * 1.35 + 2)); // la gnomonique meurt vers 180
    } else { azC = B.az; altC = bodyAlt; }
    fov = fovUse;
    const { ctx, W, H, P } = obsCamera($.obsCam, azC, altC, fov);
    if (!W) { this._map(B); this._reads(B, rows, refrOn, k, sep); return; }
    // projection brute dans le repère caméra : un objet hors cadre ou derrière
    // la caméra est POINTÉ plutôt que silencieusement omis.
    const fwd = [Math.cos(altC * D2R) * Math.cos(azC * D2R), Math.cos(altC * D2R) * Math.sin(azC * D2R), Math.sin(altC * D2R)];
    const rgt = [-Math.sin(azC * D2R), Math.cos(azC * D2R), 0];
    const upv = [fwd[1] * rgt[2] - fwd[2] * rgt[1], fwd[2] * rgt[0] - fwd[0] * rgt[2], fwd[0] * rgt[1] - fwd[1] * rgt[0]];
    const camXYZ = (az, al) => { const p = dirv(az, al);
      return [p[0] * rgt[0] + p[1] * rgt[1] + p[2] * rgt[2], p[0] * upv[0] + p[1] * upv[1] + p[2] * upv[2], p[0] * fwd[0] + p[1] * fwd[1] + p[2] * fwd[2]]; };
    const edgeMarker = (az, al, colour, label) => {
      const [X, Y, Z] = camXYZ(az, al);
      let dx, dy;
      if (Z > 0.02) { dx = X / Z * (W / 2) / Math.tan(fov / 2 * D2R); dy = -Y / Z * (W / 2) / Math.tan(fov / 2 * D2R); }
      else { dx = X; dy = -Y; } // derrière la caméra : direction seule
      const m = 22, t = Math.min((W / 2 - m) / Math.abs(dx || 1e-9), (H / 2 - m) / Math.abs(dy || 1e-9));
      const ex = W / 2 + dx * t, ey = H / 2 + dy * t;
      const a = Math.atan2(dy, dx);
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
      ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-6, 0); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-9, -5); ctx.lineTo(-9, 5); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = colour; ctx.font = "600 10px ui-monospace, Menlo, monospace";
      ctx.textAlign = ex > W * 0.6 ? "right" : (ex < W * 0.4 ? "left" : "center");
      ctx.textBaseline = ey < H * 0.5 ? "top" : "bottom";
      ctx.fillText(label, Math.max(30, Math.min(W - 30, ex)), ey < H * 0.5 ? ey + 11 : ey - 11);
    };

    /* VUE FILTRE SOLAIRE : seul le disque passe ; la montagne est un bord noir
       qui le mange. Pas de grille, pas de repères, pas de niveau de l'œil. */
    const filt = $.obsFilter.checked;
    const HPh = HORIZONS[OBS_SITE.key];
    const obsDiscPath = () => {
      if (Math.abs(((B.az - azC + 540) % 360) - 180) >= fov) return false;
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const th = 2 * Math.PI * i / 96;
        pts.push(P(B.az + B.sd * Math.sin(th) / Math.max(0.05, Math.cos(bodyAlt * D2R)), limbOf(B.sd * Math.cos(th))));
      }
      if (!pts[0][2]) return false;
      ctx.beginPath();
      pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
      return true;
    };
    const obsFill = (arr, colour) => {
      ctx.beginPath(); let open = false, lx = -1e9;
      for (let i = 0; i < arr.length; i++) {
        const a = HPh.az0 + i * HPh.step;
        if (Math.abs(((a - azC + 540) % 360) - 180) > fov * 0.75) continue;
        const p = P(a, arr[i] / 60);
        if (!p[2]) continue;
        // profil au pas de 0,01° : en vue large, plusieurs points par pixel -- on n'en trace qu'un
        if (open && Math.abs(p[0] - lx) < 0.7 && i < arr.length - 1) continue;
        lx = p[0];
        if (open) ctx.lineTo(p[0], p[1]); else { ctx.moveTo(p[0], p[1]); open = true; }
      }
      if (!open) return;
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = colour; ctx.fill();
    };
    if (filt) {
      ctx.fillStyle = "#f2f0ea"; ctx.fillRect(0, 0, W, H);
      if (obsDiscPath()) {
        ctx.fillStyle = body === "sun" ? "#f0a81a" : "#c9ced6"; ctx.fill();
        // seule l'intersection avec le disque est dessinée : les deux silhouettes découpées par le disque
        if (HPh) {
          obsDiscPath(); ctx.save(); ctx.clip();
          obsFill(HPh.flat, "#1d4ed8"); // le plan
          obsFill(HPg, "#14181d"); // le globe, par-dessus
          ctx.restore();
        }
        // bleu et non orange : seule entorse de la page à sa convention (l'orange serait invisible sur le disque)
        ctx.font = "600 10px ui-monospace, Menlo, monospace";
        ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillStyle = "#1d4ed8"; ctx.fillText(T("filt-blue", "blue: the plane's ridge"), 10, H - 24);
        ctx.fillStyle = "#14181d"; ctx.fillText(T("filt-black", "black: the globe's"), 10, H - 11);
      }
    }

    if (!filt) {
      /* CIEL ET SOL (2026-09-24), décor. Le ciel suit la hauteur VRAIE du
         Soleil (jour, heure dorée, crépuscule civil, nuit), en tons clairs
         pour que repères et textes restent lisibles. Le sol est rempli sous la
         PLUS BASSE des deux silhouettes, azimut par azimut : là, les deux
         modèles s'accordent sur la présence du terrain -- le remplissage ne
         prend parti pour aucun. */
      const hs = OBS.bodyAt("sun", jd, OBS_SITE.lat, OBS_SITE.lon, OBS_SITE.h, { refraction: false, lampKM }).altTrue;
      const stops = [[-12, "#8e9ab3", "#c7c3cf"], [-6, "#b8c3d8", "#eecfb4"], [0, "#cfd9e8", "#f6dcb8"], [6, "#d9e5f2", "#f7e9d2"], [15, "#dbe8f4", "#f3f6f9"]];
      let i0 = 0; while (i0 < stops.length - 2 && hs > stops[i0 + 1][0]) i0++;
      const [a0, t0, b0] = stops[i0], [a1, t1, b1] = stops[i0 + 1], u = Math.max(0, Math.min(1, (hs - a0) / (a1 - a0)));
      const mix = (c0, c1) => { const x = parseInt(c0.slice(1), 16), y = parseInt(c1.slice(1), 16), m = (k) => Math.round(((x >> k) & 255) * (1 - u) + ((y >> k) & 255) * u); return `rgb(${m(16)},${m(8)},${m(0)})`; };
      const hz = P(azC, 0), yH = hz[2] ? Math.max(0, Math.min(H, hz[1])) : H;
      const gsky = ctx.createLinearGradient(0, 0, 0, Math.max(yH, 1));
      gsky.addColorStop(0, mix(t0, t1)); gsky.addColorStop(1, mix(b0, b1));
      ctx.fillStyle = gsky; ctx.fillRect(0, 0, W, H);
      // le disque AVANT le relief : un paysage plein doit pouvoir le cacher
      const drawDisc = () => { if (Math.abs(((B.az - azC + 540) % 360) - 180) < fov) {
        const pts = [];
        for (let i = 0; i <= 48; i++) {
          const th = 2 * Math.PI * i / 48;
          pts.push(P(B.az + B.sd * Math.sin(th) / Math.max(0.05, Math.cos(bodyAlt * D2R)), limbOf(B.sd * Math.cos(th))));
        }
        if (pts[0][2]) {
          ctx.beginPath();
          pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.closePath();
          ctx.fillStyle = body === "sun" ? "rgba(234,167,26,.85)" : "rgba(120,128,140,.30)";
          ctx.fill();
          ctx.strokeStyle = body === "sun" ? "#c98410" : "#6b7280"; ctx.lineWidth = 1.2; ctx.stroke();
        }
      } };
      drawDisc();
      if (HPh) {
        const lo = HPh.flat.map((v, i) => Math.min(v, HPg[i]));
        ctx.globalAlpha = 0.35; obsFill(lo, "#5f6752"); ctx.globalAlpha = 1;
      }
      /* LE PAYSAGE EN COUCHES. Chaque couche = la crête la plus haute d'une
         tranche de distance (0,5–1,5 km … 75–120 km), calculée sur le LiDAR
         POUR LE MODÈLE CHOISI ; peintes du lointain au proche, les lointaines
         pâles et bleutées (perspective aérienne), les proches sombres. Chaque
         couche est plafonnée au profil exact (affiné à 1 m) : la grille à 1″
         des couches ne dépasse jamais la vraie ligne de crête. Décor, comme
         les silhouettes : le test reste les sommets nommés. */
      const land = this._el.obsLand?.value || "globe", L = this._layers;
      if (L && HPh && land !== "none") {
        const rows = land === "flat" ? L.flat : (refrOn ? L.globe.map((r, b) => gAt(r, L.globeK[b])) : L.globe);
        const prof = land === "flat" ? HPh.flat : HPg;
        const profAt = (a) => { const x = (a - HPh.az0) / HPh.step, i = Math.floor(x), f = x - i; return prof[i] * (1 - f) + prof[Math.min(prof.length - 1, i + 1)] * f; };
        const nb = rows.length, far = [174, 190, 210], near = [58, 70, 54];
        for (let b = nb - 1; b >= 0; b--) {
          const row = rows[b], u = b / (nb - 1);          // 1 = le plus lointain
          const col = near.map((c, q) => Math.round(c + (far[q] - c) * Math.pow(u, 0.7)));
          ctx.beginPath(); let open = false, x0 = 0, x1 = 0;
          for (let j = 0; j < row.length; j++) {
            const a = L.az0 + j * L.step;
            if (Math.abs(((a - azC + 540) % 360) - 180) > fov * 0.75 || row[j] === null) continue;
            const v = Math.min(row[j] / 10, profAt(a));
            const p = P(a, v / 60); if (!p[2]) continue;
            open ? ctx.lineTo(p[0], p[1]) : (ctx.moveTo(p[0], p[1]), (x0 = p[0]), (open = true)); x1 = p[0];
          }
          if (!open) continue;
          ctx.lineTo(x1, H); ctx.lineTo(x0, H); ctx.closePath();
          ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; ctx.fill();
          ctx.strokeStyle = `rgba(255,255,255,${(0.10 + 0.25 * u).toFixed(2)})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
        ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"; ctx.fillStyle = "#5b6470";
        ctx.fillText(T("land-cap", "landscape: {what} · LiDAR HD · decor", { what: land === "flat" ? T("land-plane", "plane") : refrOn ? T("land-cap-k", "globe, k = {k}", { k: k.toFixed(2) }) : T("land-globe", "globe") }), W - 30, 8);
      }
    }
    const st = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10].find((s) => fov / s < 12) || 20;
    if (!filt) {
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let a = Math.ceil((azC - fov) / st) * st; a <= azC + fov; a += st) {
        const p1 = P(a, altC - fov), p2 = P(a, altC + fov);
        if (!p1[2] || !p2[2]) continue;
        ctx.strokeStyle = "#ece8dd"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        ctx.fillStyle = "#a9a294"; ctx.fillText(((a % 360 + 360) % 360).toFixed(st < 1 ? 1 : 0) + "°", p1[0], H - 12);
      }
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      for (let el = Math.ceil((altC - fov) / st) * st; el <= altC + fov; el += st) {
        const p1 = P(azC - fov, el), p2 = P(azC + fov, el);
        if (!p1[2] || !p2[2]) continue;
        const zero = Math.abs(el) < 1e-9;
        ctx.strokeStyle = zero ? "#9aa1ab" : "#ece8dd"; ctx.lineWidth = zero ? 1.4 : 1;
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        ctx.fillStyle = zero ? "#5b6470" : "#a9a294";
        ctx.fillText(zero ? T("eye", "eye level") : el.toFixed(st < 1 ? 2 : 1) + "°", 6, p1[1] - 7);
      }
    }

    // deux silhouettes d'un seul relief -- décor, et dit tel dans la prose
    if (HPh && $.obsSky.checked && !filt) {
      const sky = (arr, color, dash) => {
        ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.setLineDash(dash); ctx.beginPath();
        let open = false, lx = -1e9;
        for (let i = 0; i < arr.length; i++) {
          const a = HPh.az0 + i * HPh.step;
          if (Math.abs(((a - azC + 540) % 360) - 180) > fov * 0.75) { open = false; continue; }
          const p = P(a, arr[i] / 60);
          if (!p[2]) { open = false; continue; }
          if (open && Math.abs(p[0] - lx) < 0.7) continue;          // un point par pixel en vue large
          lx = p[0];
          if (open) ctx.lineTo(p[0], p[1]); else { ctx.moveTo(p[0], p[1]); open = true; }
        }
        ctx.stroke(); ctx.setLineDash([]);
      };
      sky(HPh.flat, "#b45309", [5, 4]);
      sky(HPg, "#0f766e", []);
    }

    rows.forEach((t) => {
      if (filt) return;
      const g = P(t.az, t.globe), fl = P(t.az, t.flat);
      if (!g[2]) return;
      ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(g[0] - 13, g[1]); ctx.lineTo(g[0] + 13, g[1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(g[0], g[1]); ctx.lineTo(g[0], H - 22); ctx.stroke();
      ctx.strokeStyle = "#b45309"; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(fl[0] - 13, fl[1]); ctx.lineTo(fl[0] + 13, fl[1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#151a21"; ctx.font = "600 11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(t.key, g[0], H - 24); // la lettre seule ; les noms sont dans la table
    });


    // l'objet propre du modèle plat : pointillé, à SON azimut, SA hauteur, SA taille
    // angulaire. Taille physique FIXE : D = 2 H tan(sd), choisie pour sous-tendre le
    // disque observé au zénith ; au coucher, le même objet doit paraître bien plus petit.
    if ($.obsFlatSun.checked) {
      const lampD = 2 * lampKM * Math.tan(B.sd * D2R);
      const fsd = Math.atan(lampD / 2 / B.flat.slant) / D2R;
      const [fx, fy, fz] = camXYZ(B.flat.az, B.flat.alt);
      const scpx = (W / 2) / Math.tan(fov / 2 * D2R);
      const rpx = fz > 0.02 ? fsd * D2R * scpx / fz : 0;
      const px = fz > 0.02 ? W / 2 + fx / fz * scpx : -1e9;
      const py = fz > 0.02 ? H / 2 - fy / fz * scpx : -1e9;
      const onFrame = fz > 0.02 && px > 4 && px < W - 4 && py > 4 && py < H - 4;
      if (onFrame && rpx >= 3.5) {
        ctx.beginPath(); ctx.arc(px, py, rpx, 0, 2 * Math.PI);
        ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(180,83,9,.10)"; ctx.fill();
      } else if (onFrame) {
        // dans le cadre mais trop petit pour être trouvé : cerclé, avec un renvoi
        ctx.beginPath(); ctx.arc(px, py, 11, 0, 2 * Math.PI);
        ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(px, py, Math.max(1.2, rpx), 0, 2 * Math.PI);
        ctx.fillStyle = "#b45309"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(px + 26, py - 18); ctx.lineTo(px + 13, py - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + 11, py - 6); ctx.lineTo(px + 19, py - 8); ctx.lineTo(px + 16, py - 15); ctx.closePath(); ctx.fill();
        ctx.font = "600 10px ui-monospace, Menlo, monospace";
        ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillText(T("flat-short", "flat: {x}′", { x: (2 * fsd * 60).toFixed(1) }), px + 29, py - 15);
      } else {
        edgeMarker(B.flat.az, B.flat.alt, "#b45309", T("flat-edge", "flat model — {x}° away", { x: sep.toFixed(1) }));
      }
    }

    const c1 = P(azC, altC), c2 = P(azC, altC + 2 * B.sd);
    if (c1[2] && c2[2]) {
      const px = Math.abs(c2[1] - c1[1]);
      ctx.strokeStyle = "#5b6470"; ctx.lineWidth = 1;
      [[14], [14 + px]].forEach(([y]) => { ctx.beginPath(); ctx.moveTo(W - 23, y); ctx.lineTo(W - 13, y); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(W - 18, 14); ctx.lineTo(W - 18, 14 + px); ctx.stroke();
    }
    ctx.fillStyle = "#a9a294"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(T("scale", "TRUE SCALE · FOV {fov}° · disc {d}′", { fov: fov.toFixed(1), d: (2 * B.sd * 60).toFixed(1) }), 10, 8);

    this._map(B);
    this._reads(B, rows, refrOn, k, sep);
    this._atmReads(refrOn, k, fAtm);
  },

  /* Heures de contact du Soleil avec la crête du GLOBE, pour la date affichée,
     l'atmosphère choisie ET l'atmosphère par défaut de la page -- l'écart dit
     ce que le temps qu'il fait change à la prédiction. Recherche par pas de
     10 s entre 15:30 et 18:30 locales, puis bisection ; recalculé seulement
     quand la date, k ou la réfraction changent (jamais à chaque image). */
  _contacts(dateStr, k, f) {
    const HP = HORIZONS[OBS_SITE.key]; if (!HP) return null;
    const [Y, M, D] = dateStr.split("-").map(Number);
    const sky = (az) => { const x = (az - HP.az0) / HP.step, i = Math.floor(x), u = x - i;
      if (i < 0 || i >= HP.globe.length - 1) return null;
      const g = (j) => HP.globe[j] + (HP.globeK[j] - HP.globe[j]) * (k / 0.13);
      return (g(i) * (1 - u) + g(i + 1) * u) / 60; };
    const state = (sec) => {
      const B = OBS.bodyAt("sun", OBS.jdFromUTC(Y, M, D, 15 - OBS_SITE.tz, 30, sec), OBS_SITE.lat, OBS_SITE.lon, OBS_SITE.h, { refraction: true });
      const s = sky(B.az);         // bords réfractés chacun à leur hauteur (disque aplati, 2026-09-27)
      return s === null ? null : { lo: OBS.limbAlt(B.altTrue, -B.sd, f) - s, up: OBS.limbAlt(B.altTrue, B.sd, f) - s };
    };
    const find = (which) => {
      let prev = null;
      for (let t = 0; t <= 3 * 3600; t += 10) {
        const st = state(t); if (!st) { prev = null; continue; }
        if (prev && prev.v > 0 && st[which] <= 0) {
          let a = prev.t, b = t;
          for (let n = 0; n < 12; n++) { const m = (a + b) / 2, sm = state(m); if (sm && sm[which] > 0) a = m; else b = m; }
          return b;
        }
        prev = { t, v: st[which] };
      }
      return null;
    };
    return { first: find("lo"), last: find("up") };
  },

  _atmReads(refrOn, k, f) {
    const el = this._el.obsAtmReads; if (!el) return;
    if (!refrOn) { el.innerHTML = `<span>${T("refr-off", "refraction off — the atmosphere does not enter")}</span>`; return; }
    const date = this._el.obsDate.value, key = `${date}|${k}|${f.toFixed(4)}`;
    if (this._contactsKey !== key) {
      this._contactsKey = key;
      this._contactsNow = this._contacts(date, k, f);
      this._contactsRef = this._contacts(date, obsKof(OBS_ATM.isa), obsRefrF(OBS_ATM.isa));
    }
    const c = this._contactsNow, r = this._contactsRef;
    const hms = (sec) => { if (sec == null) return "—"; const t = 15 * 3600 + 30 * 60 + Math.round(sec), p = (n) => String(n).padStart(2, "0");
      return `${p(Math.floor(t / 3600))}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}`; };
    const dt = (a, b) => (a == null || b == null ? "" : ` (${a - b >= 0 ? "+" : "−"}${Math.abs(Math.round(a - b))} s)`);
    el.innerHTML =
      `<span class="g">${T("ar-k", "k = <b>{k}</b> (globe only)", { k: k.toFixed(3) })}</span>` +
      `<span>${T("ar-f", "Sun refraction × <b>{f}</b>", { f: f.toFixed(3) })}</span>` +
      `<span class="g">${T("ar-first", "first contact <b>{t}</b>{dt}", { t: hms(c && c.first), dt: dt(c && c.first, r && r.first) })}</span>` +
      `<span class="g">${T("ar-last", "last light <b>{t}</b>{dt}", { t: hms(c && c.last), dt: dt(c && c.last, r && r.last) })}</span>` +
      `<span>${T("ar-note", "Δ vs the standard atmosphere at the viewpoint{cites} · k formula and its sources: <a href=\"#\" data-xref=\"ref\">refraction tab</a> · the plane is untouched by k", { cites: cite(KEY, "n6") + cite(KEY, "n7") })}</span>`;
  },

  /* La carte propre du modèle plat, vue de dessus : azimutale équidistante, pôle
     nord au centre, r = 90 − lat, θ = longitude (la projection que publient les
     sources plates). Deux chemins partent de l'observateur vers le point
     sub-solaire : le vrai grand cercle (courbe ici) et la droite de la carte. */
  _map(B) {
    const cv = this._el.obsMap; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, Rpx = Math.min(W, H) / 2 - 12;
    // epic18 : la carte polaire du moteur commun (core/aemap.js) avec ses terres ; M = la même projection
    // qu'avant (cx + r sin λ, cy + r cos λ), parité testée dans core/aeproj.test.js
    const map = drawAEMap(ctx, OBS_MAP, { cx, cy, Rpx, grid: 30, colors: { rim: "#c9c3b4" } });
    const M = map.project;
    ctx.beginPath(); ctx.arc(cx, cy, Rpx / 2, 0, 2 * Math.PI); ctx.strokeStyle = "#d8d2c2"; ctx.lineWidth = 1.4; ctx.stroke();   // l'équateur

    const O = M(OBS_SITE.lat, OBS_SITE.lon), S = M(B.sub.lat, B.sub.lon);

    // le vrai grand cercle, échantillonné et tracé sur la carte plate
    const la1 = OBS_SITE.lat * D2R, lo1 = OBS_SITE.lon * D2R, la2 = B.sub.lat * D2R, lo2 = B.sub.lon * D2R;
    const dd = 2 * Math.asin(Math.sqrt(Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2));
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.1; ctx.setLineDash([2, 3]); ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const f = i / 96, A = Math.sin((1 - f) * dd) / Math.sin(dd), Bc = Math.sin(f * dd) / Math.sin(dd);
      const x = A * Math.cos(la1) * Math.cos(lo1) + Bc * Math.cos(la2) * Math.cos(lo2);
      const y = A * Math.cos(la1) * Math.sin(lo1) + Bc * Math.cos(la2) * Math.sin(lo2);
      const z = A * Math.sin(la1) + Bc * Math.sin(la2);
      const p = M(Math.atan2(z, Math.hypot(x, y)) / D2R, Math.atan2(y, x) / D2R);
      i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // le relèvement observé, tracé COMME la droite du modèle plat : droit, angle
    // euclidien depuis le nord local (direction du centre) -- comparables.
    { const nx = cx - O[0], ny = cy - O[1], n = Math.hypot(nx, ny) || 1;
      const NX = nx / n, NY = ny / n, EX = -NY, EY = NX;
      const a = B.az * D2R, len = Rpx * 1.6;
      ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.2;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Rpx, 0, 2 * Math.PI); ctx.clip();
      ctx.beginPath(); ctx.moveTo(O[0], O[1]);
      ctx.lineTo(O[0] + (NX * Math.cos(a) + EX * Math.sin(a)) * len, O[1] + (NY * Math.cos(a) + EY * Math.sin(a)) * len);
      ctx.stroke(); ctx.restore(); }

    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(O[0], O[1]); ctx.lineTo(S[0], S[1]); ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath(); ctx.arc(S[0], S[1], 6, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(234,167,26,.9)"; ctx.fill();
    ctx.strokeStyle = "#c98410"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(O[0], O[1], 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#0f766e"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();

    ctx.fillStyle = "#a9a294"; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(T("map-title", "AZIMUTHAL EQUIDISTANT · TRUE SCALE"), 8, 8);
  },

  _reads(B, rows, refrOn, k, sep) {
    const $ = this._el;
    const gap = B.flatAz - B.az;
    const R = (dot, label, val, sub) =>
      `<span class="r">${dot ? `<span class="dot" style="background:${dot}"></span>` : ""}` +
      `<b>${label}</b> ${val}${sub ? ` <span class="sub">${sub}</span>` : ""}</span>`;
    $.obsReads.innerHTML =
      R("#0f766e", T("r-azg", "azimuth (globe)"), B.az.toFixed(2) + "°") +
      R("#b45309", T("r-azf", "azimuth (flat map)"), B.flatAz.toFixed(2) + "°", T("r-nofree", "no free parameter")) +
      R("", T("r-gap", "gap"), (gap > 0 ? "+" : "") + gap.toFixed(2) + "°", T("r-discw", "{n} disc widths", { n: (Math.abs(gap) / (2 * B.sd)).toFixed(0) }));
    const lampD = 2 * B.lampKM * Math.tan(B.sd * D2R);
    const fsd = Math.atan(lampD / 2 / B.flat.slant) / D2R;
    const isSun = $.obsBody.value === "sun";
    $.obsReads2.innerHTML =
      R("#b45309", T("r-falt", "flat altitude"), obsAm(B.flat.alt), T("r-lamp", "lamp {km} km up, {d} km across", { km: B.lampKM.toLocaleString(), d: Math.round(lampD) })) +
      R("#b45309", T("r-fdisc", "flat disc"), obsAm(2 * fsd), T("r-obsp", "{p}% of observed, at {km} km", { p: (fsd / B.sd * 100).toFixed(0), km: Math.round(B.flat.ground).toLocaleString() })) +
      R("", T("r-atrue", "altitude, true"), obsAm(B.altTrue), B.altTrue.toFixed(3) + "°") +
      R("", T("r-app", "apparent"), refrOn ? obsAm(B.altApp) : "—", refrOn ? T("r-refr", "refraction +{x}′", { x: B.refrArcmin.toFixed(1) }) : T("r-refroff", "refraction off")) +
      R("", T("r-diam", "diameter"), obsAm(2 * B.sd), isSun ? B.distAU.toFixed(5) + " AU" : Math.round(B.distKM).toLocaleString() + " km");

    $.obsMapReads.innerHTML =
      R("#0f766e", T("m-bear", "bearing to the Sun"), B.az.toFixed(2) + "°", T("m-compass", "what a compass reads")) +
      R("#b45309", T("m-mapbear", "bearing on this map"), B.flatAz.toFixed(2) + "°", T("m-straight", "straight line across the disc")) +
      R("", T("m-differ", "the two disagree by"), (gap > 0 ? "+" : "") + gap.toFixed(2) + "°", T("m-sundiam", "{n} solar diameters", { n: (Math.abs(gap) / (2 * B.sd)).toFixed(0) })) +
      R("", T("m-sub", "sub-solar point"), `${Math.abs(B.sub.lat).toFixed(2)}°${B.sub.lat < 0 ? "S" : "N"} ${Math.abs(B.sub.lon).toFixed(2)}°${B.sub.lon < 0 ? "W" : "E"}`, T("m-setby", "set by date and clock alone"));

    $.obsTbl.querySelector("tbody").innerHTML = rows.map((t) => `
      <tr><td><b>${t.key}</b>&nbsp; ${t.name}</td>
      <td>${t.d.toFixed(2)} km</td>
      <td>${t.h - OBS_SITE.h > 0 ? "+" : ""}${t.h - OBS_SITE.h} m</td>
      <td style="color:var(--flat)">${obsAm(t.flat)}</td>
      <td style="color:var(--globe)">${obsAm(t.globe)}</td>
      <td>${obsAm(t.flat - t.globe)}</td></tr>`).join("");

    const A = rows[0], disc = Math.abs(A.flat - A.globe) / (2 * B.sd) * 100;
    const xv = { diff: obsAm(A.flat - A.globe), pct: disc.toFixed(0) };
    $.obsExpOut.innerHTML = T("x-out", "<b>{name}</b>, {d} km out and {dh} m above eye height: a plane puts it <b style=\"color:var(--flat)\">{flat}</b> above the horizontal, a globe <b style=\"color:var(--globe)\">{globe}</b>{how}. The two differ by <b>{diff}</b>, which is <b>{pct}%</b> of the {body}'s disc as drawn.",
      { name: A.name, d: A.d.toFixed(2), dh: A.h - OBS_SITE.h, flat: obsAm(A.flat), globe: obsAm(A.globe), how: refrOn ? T("x-atk", " at k = {k}", { k: k.toFixed(2) }) : T("x-straight", " with straight rays"), ...xv, body: isSun ? T("x-sun", "Sun") : T("x-moon", "Moon") });
    $.obsExpV.innerHTML = (A.flat > 0 && A.globe < 0)
      ? T("x-v1", "<b>Verdict rule.</b> The models disagree about the <b>sign</b> here, not the size: above eye level on a plane, below it on a globe. Photograph the summit against the disc. Above &rarr; the plane prediction holds and the globe's is refuted. Level or below &rarr; no k on a plane can produce that.")
      : T("x-v2", "<b>Verdict rule.</b> Both models put this summit on the same side of eye level; the test is the <b>{diff}</b> gap, {pct}% of a disc. The far ridge carries the same gap along 3&deg; of skyline, azimuth 238.1&deg; to 241.2&deg;, and the crossing at 241.29&deg; is where the sign argument lives.", xv);
  },

  _crossReads() {
    const c = obsCrossing(HORIZONS[OBS_SITE.key]); if (!c || !this._el.obsCross) return;
    const f = (x, n) => x.toFixed(n);
    this._el.obsCross.innerHTML =
      `<span>${T("c-title", "Where the two ridges cross")}</span>` +
      `<span class="f">${T("c-plane", "plane · az {az}° · {alt}′", { az: f(c.flat.az, 2), alt: f(c.flat.alt, 1) })}</span>` +
      `<span class="g">${T("c-globe", "globe · az {az}° · {alt}′", { az: f(c.globe.az, 2), alt: f(c.globe.alt, 1) })}</span>` +
      `<span class="g">${T("c-globek", "globe, k · az {az}° · {alt}′", { az: f(c.globeK.az, 2), alt: f(c.globeK.alt, 1) })}</span>` +
      `<span>${T("c-apart", "apart: {az}° of azimuth, {alt}′ of altitude", { az: f(c.flat.az - c.globeK.az, 2), alt: f(c.flat.alt - c.globeK.alt, 1) })}</span>`;
  },
};
