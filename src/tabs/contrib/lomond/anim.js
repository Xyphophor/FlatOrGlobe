// Animation « Bass Rock vu d'East Lomond » (onglet contrib, 2026-10-14) : la mise en page de la jetée de Brighton
// (adelaide-anim.js) -- globe et plan CÔTE À CÔTE, synchronisés (lomond-logic.js ltimeline) : lumière droite →
// réfraction standard → la réfraction que chaque modèle exige pour mettre l'horizon où la photo le montre sur le
// rocher (même image) → la photo du contributeur s'y pose → retour à la lumière droite.
// Chaque panneau : 1. la vue de l'œil à l'échelle angulaire VRAIE dans les deux sens, ancrée sur le rocher : la mer
// jusqu'à son horizon, le relief Copernicus GLO-30 (le rocher, la côte du Berwickshire, la Fife au premier plan) ;
// 2. la coupe le long de la visée : la VRAIE surface (sphère de rayon R ou plan), le rayon rasant de courbure k/R, le
// rocher, l'œil (337 m, placé par la parallaxe). Règle 1 : hauteurs et courbures × ex (le même pour les deux), facteur imprimé.
// Deux jauges (src/core/refgauge.js), tout à gauche (globe) et tout à droite (plan), rayons tracés
// (tools/internal/build/lomond) : le gradient moyen de température entre 2 m et l'œil qu'il faut pour l'horizon de
// l'état courant, face à celui de GFS. Photo posée, la même marge pour les deux (2026-10-15, demande du propriétaire) :
// la bande couvre les différences air − mer des modèles et f ± σ. Aucun angle n'est lu sur le dessin.
import { setupCanvas } from "../../../core/canvas.js";
import { reducedMotion, frameStep, exportBusy, revealAlpha } from "../../../core/motion.js";
import { keyClickable } from "../../../core/a11y.js";
import { drawGradGauge } from "../../../core/refgauge.js";
import { R, elevL, horizonL, horizonDistL, seaEdgeL, fraction, gradFor, airSeaFor, lomNumbers, photoToAnglesL, ltimeline, LCYCLE, LSTEPS, lPhotoAt, decodeFanL, AUTOCONV, ADIABATIC } from "./logic.js";

const COL = {
  skyTop: "#d9d3dc", skyBot: "#f0e2d8", haze: [222, 214, 214], land: [86, 98, 92], landFar: [150, 146, 156], rock: [70, 72, 80],
  sea: "#7f8fa4", seaDeep: "#566a80", seaLine: "#3f5470", ink: "#151a21", mute: "#5b6470", faint: "#697381",
  ray: "#0f766e", hidden: "#b45309", eye: "#8b93a0", globe: "#1d4ed8", flat: "#b45309", cold: "#cfe0ef", warm: "#f3dccb",
};
const mix = (a, b, f) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
const niceEx = (x) => { const p = 10 ** Math.floor(Math.log10(x)); const f = x / p; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p; };
const D2R = Math.PI / 180;
const ASPECT = 0.66, GW = 72, GAP = 10;
// cadre de la vue : plus large que la photo (qui s'y pose entière, avec du champ autour), centré sur elle ;
// l'éventail de relief (fog, ±2,5°) couvre la largeur du cadre
const PH_MARGIN = 1.18;
const PH_X0 = 150, PH_X1 = 1770;   // la photo publiée est une diapositive : bandes blanches à gauche et à droite (mesurées), retirées
const SIDE_KM = 80;                                              // la coupe : de l'œil à 80 km (St Abb's Head à 76 km)
const STAMP = "10px ui-monospace, Menlo, monospace", TITLE = "600 12px ui-monospace, Menlo, monospace", HEAD = "700 11px ui-monospace, Menlo, monospace", SMALL = "9px ui-monospace, Menlo, monospace";
function wrap(ctx, text, maxW) {
  const words = text.split(" "), out = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (line && ctx.measureText(t).width > maxW) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line);
  return out;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement|null} readsEl
 * @param {(k: string, fb: string, vars?: object) => string} t
 * @param {string} lang
 * @param {{ site, photo, air, traced, seaAir, fan, tide? }} data  (src/data/presets/contrib-lomond.js)
 * @param {{ op: number, prog?: HTMLElement|null }} opts
 */
export function mountLomond(canvas, readsEl, t, lang, data, opts = {}) {
  const { site: S, photo: PH, air: AIR, traced: TR } = data;
  const F = decodeFanL(data.fan), d = S.rock.d, e = S.e, H = S.Hw;
  const SA = data.seaAir || [], TAS = data.tracedAS || null;
  const N = lomNumbers(S, PH, AIR, TR, SA, TAS), cNeed = N.c;
  const gLo = -0.16, gHi = 0.04;          // les deux jauges : gradient moyen 2 m–œil, K/m
  // le cadre : la photo (pxRad px/rad) agrandie de PH_MARGIN, centré sur son milieu (décalage horizontal par rapport au sommet)
  const SPAN_X = (PH_MARGIN * (PH_X1 - PH_X0)) / PH.pxRad, X_OFF = ((PH_X0 + PH_X1) / 2 - PH.summitX) / PH.pxRad, Y_OFF = (PH.summitRow - PH.h / 2) / PH.pxRad;
  // la marée du jour à Leith (heure par heure, m du niveau moyen) : l'échelle de la jauge, au décimètre
  const TD = data.tide, tAll = TD ? [...TD.hours, ...TD.hl.map((x) => x[2])] : [0];
  const wLo = Math.floor(Math.min(...tAll) * 10) / 10 - 0.1, wHi = Math.ceil(Math.max(...tAll) * 10) / 10 + 0.1;
  const num = (x, n = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: n, maximumFractionDigits: n });
  const sgn = (x, n = 1) => (Math.abs(x) < 0.5 * 10 ** -n ? num(0, n) : (x < 0 ? "−" : "+") + num(Math.abs(x), n));
  const g100 = (g) => sgn(g * 100, 1);   // K/m -> K par 100 m
  const st = { time: 0, raf: null, last: 0, vis: true, playing: !reducedMotion(), key: "", op: opts.op ?? 0.7 };
  const im = typeof Image === "function" ? (() => { const i = new Image(); i.onload = () => draw(true); i.src = "/" + PH.src; return i; })() : null;
  canvas.style.cursor = "pointer";
  const toggle = () => { st.playing = !st.playing; if (st.playing) st.held = false; st.last = 0; if (st.playing) loop(); else draw(true); };
  canvas.addEventListener("click", toggle);
  keyClickable(canvas);

  // ---- la barre de progression (HTML) : une case, la bande claire = la photo posée ----
  const PB = opts.prog ? (() => {
    const el = opts.prog, iPh = LSTEPS.findIndex(([n]) => n === "photo");
    const a = LSTEPS.slice(0, iPh).reduce((x, [, v]) => x + v, 0) / LCYCLE, w = LSTEPS[iPh][1] / LCYCLE;
    el.innerHTML = `<button type="button" class="ad-pp"></button><div class="ad-pbar"><div class="ad-labs"><button type="button" class="ad-lab on">${t("lm-pb", "9 Aug 2023")}</button></div>`
      + `<div class="ad-track" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="${Math.round(LCYCLE)}" aria-label="${t("lm-prog-aria", "Animation time: click or drag to move; the date's name jumps to the photograph")}">`
      + `<div class="ad-seg"><span class="ad-phz" style="left:${(100 * a).toFixed(1)}%;width:${(100 * w).toFixed(1)}%"></span><span class="ad-fill"></span></div></div></div>`;
    const o = { pp: el.querySelector(".ad-pp"), track: el.querySelector(".ad-track"), lab: el.querySelector(".ad-lab"), fill: el.querySelector(".ad-fill") };
    o.pp.addEventListener("click", toggle);
    o.lab.addEventListener("click", () => { st.time = lPhotoAt(); st.playing = false; st.held = true; draw(true); });
    let drag = false;
    const seek = (ev) => { const r = o.track.getBoundingClientRect(); if (!r.width) return; st.time = Math.max(0, Math.min(0.9999, (ev.clientX - r.left) / r.width)) * LCYCLE; st.held = false; draw(true); };
    o.track.addEventListener("pointerdown", (ev) => { drag = true; o.track.setPointerCapture?.(ev.pointerId); seek(ev); });
    o.track.addEventListener("pointermove", (ev) => { if (drag) seek(ev); });
    o.track.addEventListener("pointerup", () => { drag = false; });
    o.track.addEventListener("pointercancel", () => { drag = false; });
    o.track.addEventListener("keydown", (ev) => {
      const x = ((st.time % LCYCLE) + LCYCLE) % LCYCLE, step = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[ev.key];
      if (step != null) st.time = (x + step + LCYCLE) % LCYCLE; else if (ev.key === "Home") st.time = 0; else if (ev.key === "End") st.time = LCYCLE - 0.01; else return;
      ev.preventDefault(); st.held = false; draw(true);
    });
    return o;
  })() : null;
  function progUpdate() {
    if (!PB) return;
    const x = ((st.time % LCYCLE) + LCYCLE) % LCYCLE;
    PB.fill.style.width = `${(100 * x / LCYCLE).toFixed(2)}%`;
    PB.track.setAttribute("aria-valuenow", String(Math.round(x)));
    PB.pp.textContent = st.playing ? "❚❚" : "▶";
    PB.pp.setAttribute("aria-label", st.playing ? t("ad-pp-pause", "Pause") : t("ad-pp-play", "Play"));
  }

  /** Ce que l'état demande à l'air : f de l'état, gradient exigé (null hors grille) et, photo posée, sa fourchette. */
  function need(flat, c, measured) {
    const m = flat ? "flat" : "globe", f = fraction(c, S), g = gradFor(TR, m, f);
    const o = { f, grad: g, beyond: g == null };
    // photo posée : la même marge pour les deux, les air − mer des modèles et f ± σ (logic.js needAS)
    const sym = flat ? N.symF : N.symG;
    if (measured) {
      if (sym) { o.gLo = sym.lo ?? gLo; o.gHi = sym.hi ?? gHi; } else { o.gLo = gradFor(TR, m, PH.f - PH.fSd) ?? gLo; o.gHi = gradFor(TR, m, PH.f + PH.fSd) ?? gHi; }
      o.lo = o.gLo; o.hi = o.gHi;
    }
    o.sa = airSeaFor(SA, m, f);
    return o;
  }

  // ---- vue de l'œil ----
  function eyeView(ctx, P, c, L) {
    const s = P.w / SPAN_X, ref = elevL(c, e, d, H) + Y_OFF;   // le milieu de la photo, au milieu du cadre
    const X = (a) => P.x + P.w / 2 + (a - X_OFF) * s, Y = (el) => P.y + P.h * 0.5 - (el - ref) * s;
    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    const sky = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); sky.addColorStop(0, COL.skyTop); sky.addColorStop(1, COL.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, P.h);
    // la mer, de son bord haut (horizon, ou la mer à 200 km) jusqu'en bas
    const yh = Y(horizonL(c, e, S.dMax));
    const g = ctx.createLinearGradient(0, yh, 0, P.y + P.h); g.addColorStop(0, COL.sea); g.addColorStop(1, COL.seaDeep);
    ctx.fillStyle = g; ctx.fillRect(P.x, yh, P.w, P.y + P.h - yh);
    ctx.strokeStyle = COL.seaLine; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.x, yh); ctx.lineTo(P.x + P.w, yh); ctx.stroke();
    // le relief, colonne par colonne, du plus loin au plus proche ; la terre proche (< 20 km, la Fife) descend jusqu'en bas
    const cw = Math.max(1, F.azStep * D2R * s) + 0.6;
    for (let j = 0; j < F.nAz; j++) {
      const a = (F.az(j) - S.rock.az) * D2R, x = X(a);
      if (x < P.x - cw || x > P.x + P.w + cw) continue;
      const cells = F.cols[j];
      for (let k = cells.length - 1; k >= 0; k--) {
        const [dd, hh] = cells[k], yt = Y(elevL(c, e, dd, hh - S.water));
        const yb = dd < 20000 ? P.y + P.h : Y(seaEdgeL(c, e, dd, S.dMax));
        if (yt >= yb) continue;
        const isRock = Math.abs(dd - d) < 700, f = Math.min(1, Math.max(0, (dd - 20000) / 50000));
        ctx.fillStyle = isRock ? mix(COL.rock, COL.haze, 0.25) : mix(COL.land.map((v, i) => v + (COL.landFar[i] - v) * f), COL.haze, 0.2 + 0.5 * f);
        ctx.fillRect(x - cw / 2, yt, cw, yb - yt);
      }
    }
    // la photo, posée par le rocher (échelle et pied lus sur elle), seulement sur l'image finale
    const alpha = L.photo ? (st.held ? st.op : revealAlpha(L.since, st.op)) : 0;
    if (im && im.complete && im.naturalWidth && alpha > 0) {
      const toS = (u, v) => { const [a, el] = photoToAnglesL(S, PH, c, u, v); return [X(a), Y(el)]; };
      const o = toS(0, 0), ex = toS(1, 0), ey = toS(0, 1);
      ctx.save(); ctx.globalAlpha = alpha; ctx.transform(ex[0] - o[0], ex[1] - o[1], ey[0] - o[0], ey[1] - o[1], o[0], o[1]);
      ctx.drawImage(im, PH_X0, 0, PH_X1 - PH_X0, PH.h, PH_X0, 0, PH_X1 - PH_X0, PH.h); ctx.restore();
      // l'horizon mesuré sur la photo, à la colonne du sommet
      const yc = toS(PH.summitX, PH.horAtSummit)[1];
      ctx.setLineDash([5, 3]); ctx.strokeStyle = COL.hidden; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(P.x, yc); ctx.lineTo(P.x + P.w, yc); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "600 10px ui-monospace, Menlo, monospace"; ctx.fillStyle = COL.hidden; ctx.textAlign = "left";
      ctx.fillText(t("lm-horline", "horizon on the photo"), P.x + 6, yc - 4);
    }
    // le rocher : son nom, sa hauteur ; la part sous l'horizon (f) à droite
    const xr = X(0), yTop = Y(elevL(c, e, d, H)), yFoot = Y(elevL(c, e, d, 0));
    ctx.font = SMALL; ctx.textAlign = "center"; ctx.fillStyle = COL.ink;
    ctx.fillText(t("lm-rock", "Bass Rock · {h} m · {km} km", { h: num(S.rock.H), km: num(d / 1000, 1) }), xr, Math.max(P.y + 10, yTop - 8));
    const xb = X(0.0062);
    if (xb < P.x + P.w - 30) {
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xb, yTop); ctx.lineTo(xb, yFoot); ctx.moveTo(xb - 3, yTop); ctx.lineTo(xb + 3, yTop); ctx.moveTo(xb - 3, yFoot); ctx.lineTo(xb + 3, yFoot); ctx.stroke();
      const f = fraction(c, S), yf = Y(horizonL(c, e, S.dMax));
      if (yf > yTop && yf < yFoot) { ctx.fillStyle = COL.hidden; ctx.fillRect(xb - 2, yf, 4, yFoot - yf); }
      ctx.textAlign = "left"; ctx.fillStyle = COL.ink; ctx.fillText(f > 1.5 ? `f > ${num(1.5, 1)}` : `f = ${num(f, 2)}`, xb + 6, (yTop + yFoot) / 2 + 3);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(21,26,33,.15)"; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
  }

  // ---- coupe : la vraie surface, le rayon rasant (courbure k/R), le rocher, l'œil ----
  function sideView(ctx, P, c, flat, ex) {
    const span = SIDE_KM * 1000, padL = 8, s = (P.w - 2 * padL) / span;
    const surf = (x) => (flat ? 0 : -(x * x) / (2 * R));
    const yb = P.y + 14 + (e + 20) * ex * s, x0 = P.x + padL;
    const Sx = (x) => x0 + x * s, Sy = (m) => yb - m * ex * s;
    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    const sky = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); sky.addColorStop(0, COL.skyTop); sky.addColorStop(1, COL.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, P.h);
    ctx.fillStyle = COL.sea; ctx.beginPath(); ctx.moveTo(Sx(0), Sy(surf(0)));
    for (let i = 0; i <= 100; i++) { const x = (span * i) / 100; ctx.lineTo(Sx(x), Sy(surf(x))); }
    ctx.lineTo(P.x + P.w, P.y + P.h); ctx.lineTo(P.x, P.y + P.h); ctx.closePath(); ctx.fill();
    // la colline de l'œil (schématique : la Fife jusqu'à la côte, ~14 km)
    ctx.fillStyle = mix(COL.land, COL.haze, 0.2); ctx.beginPath(); ctx.moveTo(Sx(0), Sy(e)); ctx.lineTo(Sx(2500), Sy(surf(2500) + 120)); ctx.lineTo(Sx(14000), Sy(surf(14000))); ctx.lineTo(Sx(0), Sy(surf(0) - 40)); ctx.closePath(); ctx.fill();
    // le rayon rasant (h(x) = e + a·x + c·x²/2R au-dessus de la surface apparente) s'il y a un horizon avant 200 km ;
    // sinon celui qui va au pied du rocher
    const d0 = horizonDistL(c, e), graze = d0 < S.dMax;
    const a = graze ? -Math.sqrt((2 * e * c) / R) : (-e - (c * d * d) / (2 * R)) / d;
    const hr = (x) => e + a * x + (c * x * x) / (2 * R);
    ctx.strokeStyle = COL.ray; ctx.lineWidth = 1.6; ctx.beginPath();
    const xEnd = graze ? Math.min(span, 2 * d0) : d;
    for (let i = 0; i <= 160; i++) { const x = (xEnd * i) / 160; const y = Sy(surf(x) + hr(x)); i ? ctx.lineTo(Sx(x), y) : ctx.moveTo(Sx(x), y); }
    ctx.stroke();
    if (graze && d0 < span) { ctx.fillStyle = COL.ray; ctx.beginPath(); ctx.arc(Sx(d0), Sy(surf(d0)), 3, 0, 7); ctx.fill(); }
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(Sx(0), Sy(e), 3, 0, 7); ctx.fill();
    // le rocher ; en orange, la part sous le rayon rasant (sous l'horizon)
    const base = surf(d), wR = Math.max(3, 300 * s);
    ctx.fillStyle = mix(COL.rock, COL.haze, 0.25); ctx.fillRect(Sx(d) - wR / 2, Sy(base + H), wR, H * ex * s);
    const hRay = graze ? Math.max(0, Math.min(H, hr(d))) : 0;
    if (hRay > 0) { ctx.fillStyle = COL.hidden; ctx.fillRect(Sx(d) - wR / 2, Sy(base + hRay), wR, hRay * ex * s); }
    ctx.restore();
    ctx.strokeStyle = "rgba(21,26,33,.15)"; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
  }

  // ---- jauges (src/core/refgauge.js) : gradient moyen 2 m–l'œil, K par 100 m, même marge pour les deux ----
  function gauge(ctx, P, flat, nd) {
    const col = flat ? COL.flat : COL.globe;
    const lines = [{ text: `${t("ad-g-need", "need")} ${nd.grad == null ? (flat ? "< −16" : "—") : g100(nd.grad)}`, color: col, dy: 48 }];
    if (nd.lo !== undefined) lines.push({ text: `${g100(nd.lo)} … ${g100(nd.hi)}`, color: col, dy: 37 });
    lines.push({ text: `${t("lm-g-day", "GFS")} ${g100(AIR.grad)}`, color: COL.ink, dy: 23 }, { text: `${g100(AIR.gradLo)} … ${g100(AIR.gradHi)}`, color: COL.ink, dy: 12 },
      { text: t("lm-g-unit", "K/100 m"), color: COL.mute, dy: 1 });
    drawGradGauge(ctx, P, {
      flat, col, title: flat ? t("ad-plane", "PLANE") : t("ad-globe", "GLOBE"), sub: "dT/dz", lo: gLo, hi: gHi,
      tick: 0.01, labelEvery: 4, fmt: (g, i) => (i === 0 ? "0" : g100(g).replace(/[.,]0$/, "")),
      day: AIR.grad, dayA: AIR.gradLo, dayB: AIR.gradHi, dayOver: AIR.grad > gHi,
      need: { grad: nd.grad, beyond: nd.beyond, gLo: nd.gLo, gHi: nd.gHi }, marks: [{ g: ADIABATIC }, { g: AUTOCONV }], lines,
      C: { ink: COL.ink, mute: COL.mute, faint: COL.faint, warm: COL.warm, cold: COL.cold }, F: { head: HEAD, small: SMALL },
    });
  }

  /** Jauge horizontale de la marée à Leith ce jour-là : basse à gauche, haute à droite, l'eau de la photo en triangle. */
  function tideGauge(ctx, x0, x1, y) {
    const Xw = (v) => x0 + ((v - wLo) / (wHi - wLo)) * (x1 - x0), h = 8;
    const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "#e8eef3"); g.addColorStop(1, "#9fb9c9");
    ctx.fillStyle = g; ctx.fillRect(x0, y, x1 - x0, h); ctx.strokeStyle = COL.faint; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y + 0.5, x1 - x0 - 1, h - 1);
    ctx.font = SMALL; ctx.textAlign = "center"; ctx.fillStyle = COL.faint;
    for (let v = Math.ceil(wLo * 2) / 2; v <= wHi + 1e-9; v += 0.5) {
      const x = Xw(v); ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + h + 3); ctx.stroke();
      ctx.fillText(v === 0 ? "0" : sgn(v, 1), x, y + h + 12);
    }
    const x = Xw(S.water); ctx.fillStyle = COL.ray; ctx.beginPath(); ctx.moveTo(x, y - 1); ctx.lineTo(x - 6, y - 9); ctx.lineTo(x + 6, y - 9); ctx.closePath(); ctx.fill();
    ctx.font = HEAD; ctx.textAlign = x > (x0 + x1) / 2 ? "right" : "left"; ctx.fillStyle = COL.ray;
    ctx.fillText(t("lm-water", "water {w} m", { w: sgn(S.water, 2) }), x + (x > (x0 + x1) / 2 ? -9 : 9), y - 3);
    ctx.font = SMALL; ctx.fillStyle = COL.mute; ctx.textAlign = "left"; ctx.fillText(t("lm-tide-low", "low"), x0, y + h + 22);
    ctx.textAlign = "right"; ctx.fillText(t("lm-tide-high", "high water · Leith, m from mean level"), x1, y + h + 22);
  }

  function phaseText(L) {
    if (L.phase === "straight") return t("lm-st-straight", "straight light: on the globe the horizon crosses the rock, on the plane it stands above it");
    if (L.phase === "toStd" || L.phase === "std") return t("ad-st-std", "standard refraction, k = 0.13: light bends down");
    if (L.phase === "toStraight") return t("ad-st-back", "back to straight light");
    return t("lm-st-need", "the refraction each model needs to put the horizon where the photograph shows it");
  }
  const panelHead = (flat, c) => `${flat ? t("ad-plane", "PLANE") : t("ad-globe", "GLOBE")} · k = ${sgn(flat ? -c : 1 - c, 2)}`;
  const eyeStamp = () => t("lm-eye-stamp", "eye view · true angles both ways · {w} wide · relief Copernicus GLO-30", { w: `${num(SPAN_X / D2R, 2)}°` });
  const sideStamp = (flat, ex) => (flat ? t("ad-side-flat", "cross-section · flat sea · heights and curvatures ×{ex} · {km} km", { ex: num(ex), km: num(SIDE_KM) })
    : t("ad-side-globe", "cross-section · sea of radius R · heights and curvatures ×{ex} · {km} km", { ex: num(ex), km: num(SIDE_KM) }));

  function reads(L) {
    if (!readsEl) return;
    const r = (x) => `<span class="r">${x}</span>`;
    const one = (flat, c) => {
      const nd = need(flat, c, false);
      const needTxt = `${t("lm-r-need", "dT/dz this needs")} <b>${nd.grad == null ? "—" : `${g100(nd.grad)} K/100 m`}</b>`
        + ` · ${t("lm-r-need-sa", "air − sea this needs")} <b>${nd.sa == null ? t("lm-r-none", "none") : `${sgn(nd.sa, 1)} K`}</b>`;
      return r(`<b>${flat ? t("ad-r-flat", "plane") : t("ad-r-globe", "globe")}</b> · ${t("lm-r-f", "horizon at")} <b>${nd.f > 1.5 ? `f > ${num(1.5, 1)}` : `f = ${num(nd.f, 2)}`}</b> · ${needTxt}`);
    };
    const html = one(false, L.cG) + one(true, L.cF)
      + r(`${t("ad-r-photo", "photo")} f = ${num(PH.f, 2)} ± ${num(PH.fSd, 2)} · GFS ${t("lm-r-airsea", "air − sea")} ${sgn(AIR.airSea, 1)} K, ${g100(AIR.grad)} K/100 m`)
      + r(`<span class="sub">${st.playing ? t("ad-pause", "click: pause") : t("ad-play", "click: play")}</span>`);
    if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
  }

  function draw(force) {
    const wpx = canvas.getBoundingClientRect().width;
    if (!wpx) return;
    const L = ltimeline(st.time, cNeed);
    const side = wpx >= 700, pw = side ? (wpx - 2 * GW - 2 * GAP - GAP) / 2 : wpx - GW - GAP;
    const hEye = Math.round(pw * ASPECT), hSide = Math.round(Math.min(Math.max(pw * 0.36, 100), 170));
    const nE = pw < 420 ? 2 : 1, nP = side ? 1 : 2, hRow = TD ? (side ? 46 : 18 + 58) : 34;
    const hHead = hRow + 14 + 15 * nP + 10, hPanel = 16 + hEye + 6 + 12 * nE + hSide + 6 + 12 * nE + 6;
    const want = hHead + (side ? hPanel : 2 * hPanel + 8);
    if (canvas._h !== want) { canvas.style.height = want + "px"; canvas._h = want; force = true; }
    const key = `${st.time.toFixed(3)}|${st.playing}|${st.op}`;
    if (!force && key === st.key) return;
    st.key = key;
    const { ctx, W } = setupCanvas(canvas);
    if (!W) return;
    ctx.clearRect(0, 0, W, want);
    ctx.textAlign = "left"; ctx.font = "700 15px ui-monospace, Menlo, monospace"; ctx.fillStyle = COL.ink;
    ctx.fillText(t("lm-date", "9 August 2023, 5:28 am BST"), 4, 20);
    if (TD) { if (side) tideGauge(ctx, Math.round(W * 0.45), W - 22, 22); else tideGauge(ctx, 14, W - 22, 18 + 22); }
    ctx.textAlign = "left"; ctx.font = STAMP; ctx.fillStyle = COL.mute;
    ctx.fillText(t("lm-cam", "camera {e} m above the water · Leith gauge {w} m", { e: num(e, 0), w: sgn(S.water, 2) }), 4, hRow + 4);
    ctx.font = TITLE; ctx.fillStyle = COL.ink; wrap(ctx, phaseText(L), W - 8).slice(0, nP).forEach((l, i) => ctx.fillText(l, 4, hRow + 22 + 15 * i));
    const span = SIDE_KM * 1000, s1 = (pw - 16) / span, ex = niceEx((0.8 * (hSide - 24) / s1) / (e + 20 + span ** 2 / (2 * R)));
    [[false, L.cG], [true, L.cF]].forEach(([flat, c], k) => {
      const gx = flat ? W - GW : 0;
      const x = side ? (flat ? GW + GAP + pw + GAP : GW + GAP) : (flat ? 0 : GW + GAP);
      const y = side ? hHead : hHead + k * (hPanel + 8);
      ctx.font = HEAD; ctx.textAlign = "left"; ctx.fillStyle = flat ? COL.flat : COL.globe; ctx.fillText(panelHead(flat, c), x + 2, y + 11);
      const pe = { x, y: y + 16, w: pw, h: hEye };
      eyeView(ctx, pe, c, L);
      gauge(ctx, { x: gx, y: pe.y, w: GW, h: hEye }, flat, need(flat, c, L.photo));
      ctx.font = STAMP; ctx.fillStyle = COL.faint; ctx.textAlign = "left";
      wrap(ctx, eyeStamp(), pw - 6).slice(0, 2).forEach((l, i) => ctx.fillText(l, x + 3, pe.y + hEye + 12 + 12 * i));
      const ps = { x, y: pe.y + hEye + 6 + 12 * nE, w: pw, h: hSide };
      sideView(ctx, ps, c, flat, ex);
      ctx.font = STAMP; ctx.fillStyle = COL.faint; ctx.textAlign = "left";
      wrap(ctx, sideStamp(flat, ex), pw - 6).slice(0, 2).forEach((l, i) => ctx.fillText(l, x + 3, ps.y + hSide + 12 + 12 * i));
    });
    reads(L);
    progUpdate();
  }

  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (st.dead || !st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      const nfr = frameStep(st, ts);
      if (nfr) { st.time += nfr / 60; draw(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  let saved = null;
  canvas.__anim = {
    duration: LCYCLE,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(x) { st.time = x; draw(true); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(true); if (st.playing) loop(); },
  };
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { st.vis = es.some((x) => x.isIntersecting); if (st.vis && !exportBusy()) loop(); }) : null;
  io?.observe(canvas);
  return {
    start() { draw(true); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
    draw: () => draw(true),
    seek(x) { st.time = x; draw(true); },
    setOpacity(op) { st.op = op; st.held = true; st.playing = false; if (!ltimeline(st.time, cNeed).photo) st.time = lPhotoAt(); draw(true); },
    dispose() { st.dead = true; io?.disconnect(); if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
  };
}
