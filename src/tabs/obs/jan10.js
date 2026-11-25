// Le coucher du 10 janvier 2026 au Globe spot, quatre fois (demande du
// propriétaire, 2026-09-24) : même principe que la vidéo du 24 novembre de
// l'onglet ct (ct-legacy.js, ctLiveFrame), en grille 2 × 2 et caméra FIXE
// visée comme son P900 -- là où le Soleil du globe doit se cacher :
//   A  globe : Soleil des éphémérides, crête du globe (k = 0,13) ;
//   B  Terre plate, Soleil du globe : même Soleil, crête que le plan prédit ;
//   C  Terre plate, son propre Soleil : lampe à 5 000 km au-dessus du point
//      subsolaire, à son azimut et sa hauteur -- hors du cadre, une flèche
//      dit où ;
//   D  la vidéo du propriétaire, synchronisée (emplacement réservé tant que
//      OBS_JAN10.video est nul) ;
//   E, F (2026-09-27, demande du propriétaire) : le même instant vu d'en haut,
//      avec les panneaux de l'onglet azim -- le globe éclairé, le point
//      subsolaire et le grand cercle depuis le point de vue ; la carte de
//      Gleason, où l'azimut du Soleil tracé en ligne droite le manque.
// Échelle angulaire VRAIE sur les deux axes (cos h en azimut), règle 1.
// Réfraction standard (OBS_REFR_F) sur le Soleil du globe, comme ct.
import { setupCanvas } from "../../core/canvas.js";
import { OBS } from "../../core/ephemeris.js";
import { reducedMotion, frameStep, exportBusy } from "../../core/motion.js";
import { keyClickable } from "../../core/a11y.js";
import { GLOBESPOT } from "../../data/dem/globespot.js";
import { refineProfile } from "../../core/horizon.js";
import { OBS_SITE, OBS_REFR_F, OBS_JAN10 } from "../../data/presets/obs.js";
import { azimObserverState, drawAzimGlobe, drawAzimFlat } from "../azim/azim-legacy.js";

const HP = refineProfile(GLOBESPOT);          // détail LiDAR à 0,01° sur la bande des couchers
const hms = (s) => s.split(":").map(Number).reduce((a, x) => a * 60 + x, 0);
const clock = (sec) => [sec / 3600, (sec / 60) % 60, sec % 60].map((x) => String(Math.floor(x)).padStart(2, "0")).join(":");

/** Soleil au Globe spot, `sec` secondes après t0 (heure locale CET). */
export function sunAt(sec, cfg = OBS_JAN10) {
  const [Y, M, D] = cfg.date.split("-").map(Number);
  const loc = hms(cfg.t0) + sec, hUT = loc / 3600 - OBS_SITE.tz;
  const b = OBS.bodyAt("sun", OBS.jdFromUTC(Y, M, D, Math.floor(hUT), (hUT % 1) * 60, 0), OBS_SITE.lat, OBS_SITE.lon, OBS_SITE.h, { refraction: true, lampKM: cfg.lampKM });
  b.altApp = b.altTrue + b.refrArcmin * OBS_REFR_F / 60;
  return b;
}

/** Hauteur (°) d'une crête du profil à l'azimut az, interpolée. */
export function ridgeAt(arr, az) {
  const j = (az - HP.az0) / HP.step, i = Math.floor(j), f = j - i;
  if (i < 0 || i + 1 >= arr.length) return NaN;
  return (arr[i] * (1 - f) + arr[i + 1] * f) / 60;
}

/** Premier contact et disparition du Soleil du globe derrière une crête (s après t0), au pas de 1 s. */
export function contactTimes(arr, cfg = OBS_JAN10) {
  let first = null, gone = null;
  for (let s = 0; s <= cfg.span; s++) {
    const b = sunAt(s, cfg), r = ridgeAt(arr, b.az);
    // bords réfractés chacun à leur hauteur : le disque aplati (ephemeris.js, limbAlt)
    if (first === null && OBS.limbAlt(b.altTrue, -b.sd, OBS_REFR_F) <= r) first = s;
    if (gone === null && OBS.limbAlt(b.altTrue, b.sd, OBS_REFR_F) <= r) { gone = s; break; }
  }
  return { first, gone };
}

/**
 * Ératosthène avec le contact du 10 janvier 2026 (page obs, paragraphe « Eratosthenes, from one
 * photograph ») : à 17:11:06 le bord du Soleil touche l'épaulement (az 238,953°). La hauteur du
 * Soleil ne demande aucun rayon terrestre ; elle MESURE donc l'angle d'élévation de l'épaulement,
 * et cet angle donne R (dichotomie sur R, rayon effectif R/(1 − k)). Renvoie le rayon central
 * (milieu du bord à cet azimut, k = 0,13), et la fourchette (bas du bord et k = 0,17 ; haut du bord
 * et k = 0,09), en km -- ce que refaisait jan10.test.js, déplacé ici pour le cumul de l'accueil.
 * dt (s) décale l'heure du contact (l'horloge est juste à ~1-2 s, recoupée par NTP).
 */
export function jan10Radius(dt = 0) {
  const D = Math.PI / 180, az = 238.953, eye = GLOBESPOT.eye;
  const at = (arr) => { const x = (az - HP.az0) / HP.step, i = Math.floor(x), u = x - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
  const d = at(HP.dist) * 1000, h = eye + d * Math.tan(at(HP.flat) / 60 * D);
  const b = sunAt(17 * 3600 + 11 * 60 + 6 + dt - hms(OBS_JAN10.t0));   // dt : erreur d'horloge (s)
  const half = Math.sqrt(b.sd ** 2 - ((az - b.az) * Math.cos(b.altTrue * D)) ** 2);
  const eps = [OBS.limbAlt(b.altTrue, -half, OBS_REFR_F), OBS.limbAlt(b.altTrue, half, OBS_REFR_F)];
  const Rof = (e, k) => { let lo = 2e6, hi = 4e7; for (let i = 0; i < 80; i++) { const R = (lo + hi) / 2, Re = R / (1 - k), th = d / Re;
    (Math.atan2((Re + h) * Math.cos(th) - (Re + eye), (Re + h) * Math.sin(th)) / D > e ? (hi = R) : (lo = R)); } return (lo + hi) / 2000; };
  return { mid: Rof((eps[0] + eps[1]) / 2, 0.13), lo: Rof(eps[0], 0.17), hi: Rof(eps[1], 0.09), flatArcmin: Math.atan2(h - eye, d) / D * 60, dKm: d / 1000 };
}

import { T as tt } from "./t.js";

const PANELS = [
  { key: "globe", tk: "j-a", title: "A · Globe", sk: "j-a-sub", sub: "ephemeris Sun · globe ridge (k = 0.13)", ridge: "globeK", ghost: null, sun: "globe" },
  { key: "flatG", tk: "j-b", title: "B · Flat Earth, the globe's Sun", sk: "j-b-sub", sub: "same Sun · the ridge a plane predicts", ridge: "flat", ghost: "globeK", sun: "globe" },
  { key: "flatF", tk: "j-c", title: "C · Flat Earth, its own Sun", sk: "j-c-sub", sub: "lamp {lamp} km up · flat ridge", ridge: "flat", ghost: null, sun: "flat" },
];

export function mountJan10(root) {
  const cfg = OBS_JAN10;
  const cvs = PANELS.map((p) => root.querySelector(`#obsJan-${p.key}`));
  const reads = root.querySelector("#obsJanReads"), vbox = root.querySelector("#obsJan-video");
  if (cvs.some((c) => !c)) return null;
  const st = { t: 0, last: 0, raf: null, vis: true, playing: !reducedMotion(), frame: null, video: null };
  // E, F : sous la vidéo, la grille passe à 2 × 3
  const grid = cvs[0].parentElement;
  const azc = [["azG", tt("j-azg", "The same instant on the globe: the Sun's rays, the point beneath the Sun, and the great circle from the viewpoint to it")],
    ["azF", tt("j-azf", "The same instant on the Gleason flat-earth map: the Sun's measured bearing, laid off straight from the viewpoint, misses the point beneath the Sun")]]
    .map(([k, label]) => {
      let c = root.querySelector(`#obsJan-${k}`);
      if (!c) { c = document.createElement("canvas"); c.id = `obsJan-${k}`; c.setAttribute("role", "img"); c.setAttribute("aria-label", label); grid.appendChild(c); }
      return c;
    });
  const T = { globe: contactTimes(HP.globeK, cfg), flat: contactTimes(HP.flat, cfg) };

  // la vidéo : absente tant que cfg.video est nul -- l'emplacement reste réservé
  if (cfg.video?.src && vbox) {
    vbox.innerHTML = `<video src="${cfg.video.src}" muted playsinline loop preload="auto" controls aria-label="${tt("j-vid", "P900 video of the sunset, 10 January 2026, ×{rate}", { rate: cfg.video.rate || 1 })}"></video>`;
    st.video = vbox.querySelector("video");
    st.video.addEventListener("play", () => { st.playing = true; loop(); });
    st.video.addEventListener("pause", () => { st.playing = false; });
    st.video.addEventListener("seeked", () => draw());
  }
  // temps de l'animation : la vidéo commande quand elle est là (même instant sur les quatre cases)
  const now = () => {
    if (!st.video) return st.t;
    const t = hms(cfg.video.startLocal) - hms(cfg.t0) + st.video.currentTime * (cfg.video.rate || 1);
    return Math.max(0, Math.min(cfg.span, t));
  };

  function frameOf() {
    if (st.frame) return st.frame;
    const auto = sunAt(cfg.span / 2, cfg), fr = cfg.frame || {};
    // azAt : l'azimut du Soleil du globe à cette heure locale (la hauteur reste celle de alt, ou l'auto)
    const az = fr.az ?? (fr.azAt ? sunAt(hms(fr.azAt) - hms(cfg.t0), cfg).az : auto.az);
    st.frame = { az, alt: fr.alt ?? auto.altApp, fov: fr.fovDeg ?? 2.4 };
    return st.frame;
  }

  // hauteur de visée d'un panneau : sa crête posée là où la vidéo montre la sienne
  // (frame.ridgeRow) -- chaque modèle vise la crête de la même façon, le Soleil départage
  function altFor(arr, F, W, H) {
    const row = cfg.frame?.ridgeRow; if (row == null) return F.alt;
    const S = W / F.fov, ca = Math.cos(F.alt * Math.PI / 180), v = [];
    for (let i = 0; i <= 48; i++) { const r = ridgeAt(arr, F.az + (i / 48) * (F.fov / 2) / ca); if (Number.isFinite(r)) v.push(r); }
    if (!v.length) return F.alt;
    v.sort((a, b) => a - b);
    return v[v.length >> 1] - (H / 2 - row * H) / S;
  }

  function drawPanel(cv, P, B, t) {
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    const F = frameOf(), S = W / F.fov, ca = Math.cos(F.alt * Math.PI / 180);      // px par degré, les deux axes
    const altC = altFor(HP[P.ridge], F, W, H);
    const px = (az) => W / 2 + ((((az - F.az + 540) % 360) - 180)) * ca * S;
    const py = (al) => H / 2 - (al - altC) * S;
    ctx.fillStyle = "#1c1f24"; ctx.fillRect(0, 0, W, H);                           // ciel à travers le filtre
    // le Soleil du globe, aplati par la réfraction (chaque bord à sa hauteur) ; la lampe plate, ronde
    const globeSun = P.sun === "globe", sunAz = globeSun ? B.az : B.flatAz;
    const lo = globeSun ? OBS.limbAlt(B.altTrue, -B.sd, OBS_REFR_F) : B.flat.alt - B.sd, up = globeSun ? OBS.limbAlt(B.altTrue, B.sd, OBS_REFR_F) : B.flat.alt + B.sd;
    const sunAlt = (lo + up) / 2, sx = px(sunAz), sy = py(sunAlt), rad = B.sd * S, sq = (up - lo) / (2 * B.sd);
    const inFrame = sx > -rad && sx < W + rad && sy > -rad && sy < H + rad;
    if (inFrame) {
      ctx.save(); ctx.translate(sx, sy); ctx.scale(1, sq);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      g.addColorStop(0, "#ffd36b"); g.addColorStop(0.75, "#f0a81a"); g.addColorStop(1, "#c46f0c");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, 7); ctx.fill(); ctx.restore();
    }
    const ridge = (arr) => {
      ctx.beginPath(); let open = false, first = 0, last = 0;
      for (let j = 0; j < arr.length; j++) {
        const X = px(HP.az0 + j * HP.step); if (X < -20 || X > W + 20) continue;
        const Y = py(arr[j] / 60);
        open ? ctx.lineTo(X, Y) : (ctx.moveTo(X, Y), first = X, open = true); last = X;
      }
      return open ? [first, last] : null;
    };
    const fr = ridge(HP[P.ridge]);
    if (fr) { ctx.lineTo(fr[1], H + 2); ctx.lineTo(fr[0], H + 2); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); }
    if (P.ghost && ridge(HP[P.ghost])) { ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(232,227,214,.55)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
    // le Soleil plat hors cadre : une flèche vers lui, et de combien
    if (!inFrame) {
      const dx = ((((sunAz - F.az + 540) % 360) - 180)), dy = sunAlt - altC;
      const a = Math.atan2(-dy, dx * ca), ex = W / 2 + Math.cos(a) * (W / 2 - 18), ey = H / 2 + Math.sin(a) * (H / 2 - 18);
      ctx.strokeStyle = "#f0a81a"; ctx.fillStyle = "#f0a81a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex - Math.cos(a) * 26, ey - Math.sin(a) * 26); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(a - 0.45) * 9, ey - Math.sin(a - 0.45) * 9); ctx.lineTo(ex - Math.cos(a + 0.45) * 9, ey - Math.sin(a + 0.45) * 9); ctx.closePath(); ctx.fill();
      ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText(tt("j-itsun", "its Sun: {dx}° {h}, {dy}° {v}", { dx: Math.abs(dx).toFixed(0), h: dx > 0 ? tt("j-right", "right") : tt("j-left", "left"), dy: Math.abs(dy).toFixed(0), v: dy > 0 ? tt("j-up", "up") : tt("j-down", "down") }), W - 8, H / 2 + 14);
      ctx.fillText(tt("j-never", "out of frame · never sets"), W - 8, H / 2 + 27);
    }
    ctx.textBaseline = "top"; ctx.textAlign = "left";
    ctx.fillStyle = "#e8e3d6"; ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.fillText(tt(P.tk, P.title), 8, 7);
    ctx.fillStyle = "#b7bec7"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillText(tt(P.sk, P.sub, { lamp: cfg.lampKM.toLocaleString("en-US") }), 8, 21);
    ctx.textBaseline = "bottom"; ctx.fillStyle = "#e8e3d6"; ctx.fillText(`${clock(hms(cfg.t0) + t)} CET`, 8, H - 6);
    ctx.textAlign = "right"; ctx.fillStyle = "#e0a52a"; ctx.fillText(tt("j-wide", "{fov}° wide · true scale", { fov: F.fov.toFixed(1) }), W - 8, H - 6);
  }

  function drawAzim(t) {
    const [Y, M, D] = cfg.date.split("-").map(Number), hUT = (hms(cfg.t0) + t) / 3600 - OBS_SITE.tz;
    const jd = OBS.jdFromUTC(Y, M, D, Math.floor(hUT), (hUT % 1) * 60, 0);
    // le Soleil est encore visible (réfraction, crête) : sa direction reste tracée jusqu'au bout
    const S = azimObserverState(jd, { lat: OBS_SITE.lat, lon: OBS_SITE.lon, name: OBS_SITE.name, col: "#0f766e", up: true });
    drawAzimGlobe(S, azc[0]); drawAzimFlat(S, azc[1]);
  }

  function draw() {
    const t = now(), B = sunAt(t, cfg);
    PANELS.forEach((P, i) => drawPanel(cvs[i], P, B, t));
    drawAzim(t);
    if (reads) {
      const f = (x) => x === null ? tt("j-after", "after the window") : clock(hms(cfg.t0) + x);
      const html =
        `<span class="r"><span class="dot" style="background:#0f766e"></span>${tt("j-r1", "<b>globe</b> first contact {a} · gone {b}", { a: f(T.globe.first), b: f(T.globe.gone) })}</span>` +
        `<span class="r"><span class="dot" style="background:#b45309"></span>${tt("j-r2", "<b>flat ridge, globe Sun</b> {a} · {b}", { a: f(T.flat.first), b: f(T.flat.gone) })}</span>` +
        `<span class="r"><span class="dot" style="background:#b45309"></span>${tt("j-r3", "<b>flat Sun</b> az {az}° vs {az0}°, {alt}° up", { az: B.flatAz.toFixed(1), az0: B.az.toFixed(1), alt: B.flat.alt.toFixed(1) })}</span>` +
        `<span class="r"><span class="sub">${tt("j-r4", "{drv} · click: {act}", { drv: st.video ? tt("j-drives", "the video drives the clock") : `×${cfg.speed}`, act: st.playing ? tt("j-pause", "pause") : tt("j-play", "play") })}</span></span>`;
      if (reads._last !== html) { reads.innerHTML = html; reads._last = html; }
    }
  }

  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || cvs[0].closest("[hidden]")) { st.last = 0; return; }
      const n = frameStep(st, ts);
      if (n) { if (!st.video) st.t = (st.t + n / 60 * cfg.speed) % cfg.span; draw(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  const toggle = () => {
    if (st.video) { st.video.paused ? st.video.play?.() : st.video.pause?.(); return; }
    st.playing = !st.playing; st.last = 0; if (st.playing) loop(); else draw();
  };
  for (const cv of cvs) { cv.style.cursor = "pointer"; cv.addEventListener("click", toggle); keyClickable(cv); }
  // export (epic10/UC02) : la grille rejouée à l'instant t ; avec la vidéo, c'est elle qu'on cale
  // (image par image, en attendant « seeked ») et les trois panneaux suivent
  let saved = null, wasPlaying = false;
  const anim = {
    get duration() { return st.video && Number.isFinite(st.video.duration) ? st.video.duration : cfg.span / cfg.speed; },
    begin() { saved = { ...st }; wasPlaying = st.video ? !st.video.paused : false; st.video?.pause?.(); if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    async frameAt(t) {
      if (st.video) {
        await new Promise((res) => { const v = st.video; const done = () => { v.removeEventListener("seeked", done); res(); }; v.addEventListener("seeked", done); v.currentTime = Math.min(t, v.duration - 0.01); setTimeout(done, 1500); });
      } else st.t = (t * cfg.speed) % cfg.span;
      draw();
    },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(); if (wasPlaying) st.video?.play?.(); else if (st.playing && !st.video) loop(); },
  };
  for (const cv of cvs) cv.__anim = anim;
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(cvs[0]);
  return {
    start() {
      draw();
      if (!st.playing) return;
      if (st.video) st.video.play?.()?.catch(() => { st.playing = false; draw(); });   // lecture auto refusée : bouton lecture
      else loop();
    },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; st.video?.pause?.(); },
    seek(s) { st.t = s; draw(); },
  };
}
