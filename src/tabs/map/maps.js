// Cartes canvas de l'onglet map (2026-10-08). Un seul moteur pour toutes les projections :
// les terres sont remplies par projection INVERSE pixel par pixel (masque Natural Earth 0,5°,
// comme src/core/aemap.js), côtes et graticule tracés par projection directe, cercles de
// Tissot EXACTS (vrais petits cercles de la sphère, projetés point par point -- pas linéarisés).
// Décoratif côté terres (aucun chiffre n'en dépend) ; les rapports affichés viennent de logic.js.
import { isLand, AE_COLORS } from "../../core/aemap.js";
import { coastLines } from "../../core/globe25d.js";
import { gcDeg } from "../../core/aeproj.js";
import { pixelRatio, setupCanvas } from "../../core/canvas.js";
import { anim2d, text, disc, stamp2d, INK, SOFT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { equirect, mercator, lambertCyl, sinusoidal, eqConic, ortho, aeq, rhumbLine, greatCircle, pathKm, R_KM, tissot, PTOL_FRAME, PTOL_ZERO, zoneFraction, ptolemyFit } from "./logic.js";
import { PTOLEMY } from "../../data/presets/map-ptolemy.js";

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const COL = { ...AE_COLORS, tis: "rgba(29,78,216,0.28)", tisLine: "#1d4ed8", out: "#f1efe9" };
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Point à distance angulaire d (°) et azimut az (°) de (lat, lon). */
export function dest(lat, lon, az, d) {
  const p = lat * D2R, l = lon * D2R, a = az * D2R, c = d * D2R;
  const p2 = Math.asin(Math.sin(p) * Math.cos(c) + Math.cos(p) * Math.sin(c) * Math.cos(a));
  const l2 = l + Math.atan2(Math.sin(a) * Math.sin(c) * Math.cos(p), Math.cos(c) - Math.sin(p) * Math.sin(p2));
  return [p2 * R2D, ((((l2 * R2D + 180) % 360) + 360) % 360) - 180];
}

const cache = new WeakMap();
/** Image des terres d'une projection dans un cadre (coordonnées de projection) à rw × rh pixels. */
function landImage(P, box, rw, rh, region, useCache = true) {
  if (typeof document === "undefined") return null;
  const key = `${rw}x${rh}|${box.join(",")}`;
  let m = cache.get(P); if (useCache && m?.has(key)) return m.get(key);
  const off = document.createElement("canvas"); off.width = rw; off.height = rh;
  const c = off.getContext("2d"); if (!c || typeof c.createImageData !== "function") return null;
  const img = c.createImageData(rw, rh), d = img?.data; if (!d || d.length < rw * rh * 4) return null;
  const L = hex(COL.land), S = hex(COL.sea), O = hex(COL.out);
  const [x0, x1, y0, y1] = box;
  for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) {
    const x = x0 + (i + 0.5) / rw * (x1 - x0), y = y1 - (j + 0.5) / rh * (y1 - y0);
    const ll = P.inv(x, y); if (!ll) continue;
    const o = (j * rw + i) * 4, inR = !region || region(ll[0], ll[1]);
    const rgb = !inR ? O : isLand(ll[0], ll[1]) ? L : S;
    d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  if (useCache) { if (!m) cache.set(P, (m = new Map())); m.set(key, off); }
  return off;
}

/**
 * Dessine la projection P dans le rectangle (x, y, w, h), à échelle uniforme (le cadre `box` centré).
 * opts : grid (°), coast, tissot {step, r, lat:[a,b]}, region(lat, lon), maxRes, cache, lon/lat ranges.
 * Renvoie { proj(lat, lon) → [px, py] | null, s (px par unité), ox, oy }.
 */
export function drawProj(ctx, P, rect, opts = {}) {
  const box = opts.box || P.box, [x0, x1, y0, y1] = box;
  const s = Math.min(rect.w / (x1 - x0), rect.h / (y1 - y0));
  const W = (x1 - x0) * s, H = (y1 - y0) * s, ox = rect.x + (rect.w - W) / 2, oy = rect.y + (rect.h - H) / 2;
  const toS = (p) => [ox + (p[0] - x0) * s, oy + (y1 - p[1]) * s];
  const inBox = (p) => p && p[0] >= x0 - 1e-9 && p[0] <= x1 + 1e-9 && p[1] >= y0 - 1e-9 && p[1] <= y1 + 1e-9;
  const proj = (la, lo) => { const p = P.fwd(la, lo); return inBox(p) ? toS(p) : null; };
  const dpr = pixelRatio(), cap = opts.maxRes || 640;
  const rw = Math.max(8, Math.min(cap, Math.round(W * dpr))), rh = Math.max(8, Math.round(rw * H / W));
  const im = landImage(P, box, rw, rh, opts.region, opts.cache !== false);
  ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, W, H); ctx.clip();
  if (im) { ctx.imageSmoothingEnabled = true; ctx.drawImage(im, ox, oy, W, H); }
  const jump = (opts.jump || 0.25) * Math.max(W, H);
  const stroke = (pts, col, w, dash) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); let prev = null;
    for (const q of pts) {
      const p = q && (opts.region && !opts.region(q[0], q[1]) ? null : proj(q[0], q[1]));
      if (!p) { prev = null; continue; }
      if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) < jump) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      prev = p;
    }
    ctx.stroke(); ctx.setLineDash([]);
  };
  const g = opts.grid ?? 30;
  if (g) {
    for (let la = -90 + g; la < 90; la += g) { const a = []; for (let lo = -180; lo <= 180; lo += 1) a.push([la, lo]); stroke(a, COL.grid, 0.8); }
    for (let lo = -180; lo < 180; lo += g) { const a = []; for (let la = -89.5; la <= 89.5; la += 1) a.push([la, lo]); stroke(a, COL.grid, 0.8); }
  }
  for (const [la, col, w] of opts.parallels || []) { const a = []; for (let lo = -180; lo <= 180; lo += 0.5) a.push([la, lo]); stroke(a, col, w); }
  if (opts.coast !== false) for (const line of coastLines()) stroke(line, COL.coast, 0.7);
  if (opts.tissot) {
    const { step = 30, r = 6, lat = [-60, 60], lonStep = step } = opts.tissot;
    for (let la = lat[0]; la <= lat[1] + 1e-9; la += step) for (let lo = -180 + lonStep / 2; lo < 180; lo += lonStep) {
      if (opts.region && !opts.region(la, lo)) continue;
      const ring = []; let ok = true;
      for (let az = 0; az <= 360; az += 10) { const q = dest(la, lo, az, r), p = proj(q[0], q[1]); if (!p) { ok = false; break; } ring.push(p); }
      if (!ok) continue;
      ctx.beginPath(); ring.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.fillStyle = COL.tis; ctx.fill(); ctx.strokeStyle = COL.tisLine; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  if (opts.lines) for (const l of opts.lines) stroke(l.pts, l.col, l.w || 2, l.dash);
  ctx.restore();
  if (opts.frame !== false) { ctx.strokeStyle = COL.rim; ctx.lineWidth = 1; ctx.strokeRect(ox + 0.5, oy + 0.5, W - 1, H - 1); }
  return { proj, s, ox, oy, W, H, stroke };
}

const label = (ctx, s, x, y, o = {}) => text(ctx, s, x, y, { size: o.size || 11, c: o.c || INK, align: o.align || "left", bold: o.bold, maxW: o.maxW });
const halo = (ctx, s, x, y, o = {}) => { ctx.save(); ctx.font = `${o.bold ? "600 " : ""}${o.size || 11}px system-ui, sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(253,253,252,0.9)"; ctx.textAlign = o.align || "left"; ctx.strokeText(s, x, y); ctx.restore(); label(ctx, s, x, y, o); };
const begin = (cv) => { const r = cv.getBoundingClientRect(); if (!r.width) return null; const { ctx, W, H } = setupCanvas(cv); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); return { ctx, W, H }; };

/* ---- 1. Marinus : rectangulaire, parallèle de Rhodes en vraie grandeur ---------------- */
const P_EQR = equirect(36);
const KNOWN = (la, lo) => lo >= -20 && lo <= 135 && la >= -20 && la <= 66;   // le monde connu de Ptolémée, en longitudes modernes
export function drawEqr(cv, tr) {
  const b = begin(cv); if (!b) return; const { ctx, W, H } = b;
  const r = drawProj(ctx, P_EQR, { x: 6, y: 22, w: W - 12, h: H - 46 }, { grid: 30, parallels: [[36, FLAT, 2]], region: null });
  // le monde connu : un cadre
  const a = r.proj(66, -20), c = r.proj(-20, 135);
  if (a && c) { ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.setLineDash([5, 3]); ctx.strokeRect(a[0], a[1], c[0] - a[0], c[1] - a[1]); ctx.setLineDash([]); label(ctx, tr("mp-eqr-known", "the world Ptolemy knew"), a[0] + 4, a[1] + 14, { size: 10.5, maxW: c[0] - a[0] - 8 }); }
  const rh = r.proj(36, 28); if (rh) { disc(ctx, rh[0], rh[1], 3.5, FLAT); halo(ctx, tr("mp-eqr-rh", "Rhodes, 36°: true length"), rh[0] - 6, rh[1] + 14, { size: 10.5, c: FLAT, align: "right" }); }
  label(ctx, tr("mp-eqr-t", "Marinus's grid: x = λ cos 36°, y = φ"), 6, 15, { size: 11, bold: true, maxW: W * 0.55 });
  stamp2d(ctx, W, tr("mp-eqr-st", "areas and E–W lengths wrong away from 36°"), true, H);
}

/* ---- 2. Ptolémée : sa projection, le monde connu, son catalogue calculé, le globe et un manuscrit ------ */
// (2026-10-26, demande du propriétaire : une carte unique.) Tout est dans le repère de Ptolémée : longitudes
// comptées depuis les îles Fortunées, son 0 posé à PTOL_ZERO (les Canaries) ; les côtes modernes et la vraie
// place des 56 villes sont tracées par la même projection, sans ajustement.
const PF = PTOL_FRAME, P_PTOL = eqConic(36, 63, PTOL_ZERO + 90);
const PTOL_REG = (la, lo) => { const lp = lo - PTOL_ZERO; return lp >= PF.lon0 && lp <= PF.lon1 && la >= PF.latS && la <= PF.latN; };
function ptolBox() {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const add = (la, lp) => { const [x, y] = P_PTOL.fwd(la, lp + PTOL_ZERO); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  for (let la = PF.latS; la <= PF.latN; la += 1) for (const lp of [0, 90, 180]) add(la, lp);
  for (let lp = 0; lp <= 180; lp += 1) { add(PF.latS, lp); add(PF.latN, lp); }
  const m = 0.02; return [x0 - m, x1 + m, y0 - m, y1 + m];
}
const BOX_PTOL = ptolBox();
export const PTOL_FIT = ptolemyFit(PTOLEMY.towns);
// le manuscrit : Codex Urbinas gr. 82, Constantinople vers 1300 (Wikimedia Commons, domaine public)
const URB = { src: "/maps/ptolemy-urbinas-gr82.jpg", w: 1100, h: 778, img: null };
function urbinas(redraw) {
  if (typeof Image === "undefined") return null;
  if (!URB.img) { URB.img = new Image(); URB.img.src = URB.src; }
  const im = URB.img;
  if (im.complete && im.naturalWidth) return im;
  if (redraw && !im._wait) {
    im._wait = true;
    const done = () => { im._wait = false; redraw(); };
    // l'image de l'environnement des vidéos (scripts/prerender-env.mjs) n'a qu'onload, pas addEventListener
    if (typeof im.addEventListener === "function") im.addEventListener("load", done, { once: true });
    else { const prev = im.onload; im.onload = () => { prev?.(); done(); }; }
  }
  return null;
}
const CAT = "rgba(124,45,18,0.6)", SHIFT = "rgba(124,45,18,0.75)";
const PTOL_LAB = [["Londinium", "mp-ptol-lon", "London"], ["Alexandreia", "mp-ptol-alx", "Alexandria"], ["Palimbothra", "mp-ptol-pat", "Patna"]];
export function drawPtol(cv, tr, lang = "en") {
  const w0 = cv.getBoundingClientRect().width; if (!w0) return;
  const [bx0, bx1, by0, by1] = BOX_PTOL, ar = (by1 - by0) / (bx1 - bx0), ur = URB.h / URB.w;
  const side = w0 >= 640, head = side ? 22 : 36, leg = side ? 18 : 32, cap = 16, gap = 12, foot = side ? 32 : 72;
  const pw = side ? (w0 - 12 - gap) / 2 : w0 - 12, ha = pw * ar, hb = pw * ur;
  const want = Math.round(side ? head + Math.max(ha + leg, hb + cap) + foot : head + ha + leg + gap + hb + cap + foot);
  if (cv._h !== want) { cv.style.height = want + "px"; cv._h = want; }
  const b = begin(cv); if (!b) return; const { ctx, W, H } = b;
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  // A. le calcul : la projection, le monde connu, les côtes modernes
  const A = { x: 6, y: head + (side ? Math.max(0, (hb + cap - ha - leg) / 2) : 0), w: pw, h: ha };
  const r = drawProj(ctx, P_PTOL, A, { box: BOX_PTOL, grid: 0, region: PTOL_REG, frame: false });
  const grat = "rgba(60,80,100,0.3)", L = (lp) => lp + PTOL_ZERO;
  for (let lp = 0; lp <= 180; lp += 10) { const a = []; for (let la = PF.latS; la <= PF.latN; la += 1) a.push([la, L(lp)]); a.push([PF.latN, L(lp)]); r.stroke(a, grat, 0.8); }
  const par = (la, col, w) => { const a = []; for (let lp = 0; lp <= 180; lp += 0.5) a.push([la, L(lp)]); r.stroke(a, col, w); };
  for (let la = -10; la <= 60; la += 10) par(la, grat, 0.8);
  par(36, FLAT, 1.6); par(PF.latN, FLAT, 1.6); par(0, GLOBE, 1.2);
  // le bord du monde connu
  ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.beginPath();
  const edge = []; for (let lp = 0; lp <= 180; lp += 1) edge.push([PF.latN, lp]);
  for (let la = PF.latN; la >= PF.latS; la -= 1) edge.push([la, 180]);
  for (let lp = 180; lp >= 0; lp -= 1) edge.push([PF.latS, lp]);
  for (let la = PF.latS; la <= PF.latN; la += 1) edge.push([la, 0]);
  edge.forEach(([la, lp], k) => { const p = r.proj(Math.min(PF.latN, Math.max(PF.latS, la)), L(lp)); if (p) (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); });
  ctx.closePath(); ctx.stroke();
  // son catalogue, calculé par sa projection
  ctx.fillStyle = CAT;
  for (const arr of [PTOLEMY.eu, PTOLEMY.af, PTOLEMY.as]) for (let k = 0; k < arr.length; k += 2) {
    const p = r.proj(arr[k + 1] / 12, L(arr[k] / 12)); if (p) ctx.fillRect(p[0] - 0.7, p[1] - 0.7, 1.4, 1.4);
  }
  // 56 villes : là où il les met, là où elles sont
  for (const [, lp, fp, la, lo] of PTOLEMY.towns) {
    const p = r.proj(fp, L(lp)), q = r.proj(la, lo); if (!p || !q) continue;
    ctx.strokeStyle = SHIFT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    disc(ctx, q[0], q[1], 2.2, GLOBE); disc(ctx, p[0], p[1], 2.2, INK);
  }
  for (const [n, k, fb] of PTOL_LAB) {
    const t = PTOLEMY.towns.find((x) => x[0] === n), p = t && r.proj(t[2], L(t[1])); if (!p) continue;
    const west = n === "Palimbothra";   // Patna : à gauche du point, loin de l'étiquette de l'équateur
    halo(ctx, tr(k, fb), p[0] + (west ? -4 : 4), p[1] + (west ? 13 : -5), { size: 10, align: west ? "right" : "left" });
  }
  // les parallèles nommés, côté est, sous leur trait (dans le cadre)
  const lab = (la, lp, s, c) => { const p = r.proj(la, L(lp)); if (p) halo(ctx, s, p[0] - 4, p[1] + 12, { size: 10, c, align: "right" }); };
  lab(PF.latN, 178, tr("mp-ptol-th", "Thule 63°"), FLAT); lab(36, 178, tr("mp-ptol-rh", "Rhodes 36°"), FLAT); lab(0, 178, tr("mp-ptol-eq", "equator"), GLOBE);
  // légende sous A
  { let x = A.x, y = A.y + ha + 13; ctx.font = "10px system-ui, sans-serif";
    const items = [["sq", CAT, tr("mp-ptol-k1", "his {n} places").replace("{n}", ((PTOLEMY.eu.length + PTOLEMY.af.length + PTOLEMY.as.length) / 2).toLocaleString(lang))],
      ["dot", INK, tr("mp-ptol-k2", "56 towns where he puts them")], ["dot", GLOBE, tr("mp-ptol-k3", "where they are")]];
    for (const [kind, col, s] of items) {
      const w = 12 + ctx.measureText(s).width + 12;
      if (x + w > A.x + pw && x > A.x) { x = A.x; y += 13; }
      if (kind === "sq") { ctx.fillStyle = col; ctx.fillRect(x + 2, y - 5, 3, 3); } else disc(ctx, x + 4, y - 3.5, 2.6, col);
      label(ctx, s, x + 11, y, { size: 10, c: kind === "sq" ? "#7c2d12" : col }); x += w;
      ctx.font = "10px system-ui, sans-serif";
    } }
  // B. le manuscrit
  const B = side ? { x: 6 + pw + gap, y: head, w: pw, h: hb } : { x: 6, y: head + ha + leg + gap, w: pw, h: hb };
  const im = urbinas(() => drawPtol(cv, tr, lang));
  if (im) ctx.drawImage(im, B.x, B.y, B.w, B.h);
  else { ctx.fillStyle = "#f1efe9"; ctx.fillRect(B.x, B.y, B.w, B.h); label(ctx, tr("mp-ptol-wait", "the manuscript map…"), B.x + B.w / 2, B.y + B.h / 2, { size: 11, c: SOFT, align: "center" }); }
  ctx.strokeStyle = COL.rim; ctx.lineWidth = 1; ctx.strokeRect(B.x + 0.5, B.y + 0.5, B.w - 1, B.h - 1);
  label(ctx, tr("mp-ptol-urb", "The same projection by hand: Codex Urbinas gr. 82, Constantinople, c. 1300"), B.x, B.y + B.h + 12, { size: 10, c: SOFT, maxW: B.w });
  label(ctx, tr("mp-ptol-t", "Ptolemy's world, computed from his coordinates with his first projection"), 6, 15, { size: 11, bold: true, maxW: W - 12 });
  const fr = (d) => Math.round(zoneFraction(PF.latS, PF.latN, d) * 100);
  const s1 = tr("mp-ptol-st", "equidistant conic: true on every meridian and on 36° and 63° · his longitudes = {b} × the real ones").replace("{b}", nf(PTOL_FIT.b, 2));
  const s2 = tr("mp-ptol-st2", "known world: 63° N to 16°25′ S over 180° = {p} % of the sphere; in fact {d}°, {q} %")
    .replace("{p}", fr(180)).replace("{d}", Math.round(PTOL_FIT.trueSpan)).replace("{q}", fr(PTOL_FIT.trueSpan));
  const n2 = text(ctx, s2, W - 6, H - 5, { size: 10, c: SOFT, align: "right", maxW: W - 12, up: true });
  text(ctx, s1, W - 6, H - 5 - n2 * 13, { size: 10, c: SOFT, align: "right", maxW: W - 12, up: true });
}

/* ---- 3. Mercator : cercles de Tissot, loxodromie contre grand cercle --------------------- */
const P_MERC = mercator(80), FRA = [50.03, 8.57], SFO = [37.62, -122.38];
export const MERC_ROUTE = { rhumb: rhumbLine(FRA, SFO, 200), gc: greatCircle(FRA, SFO, 200) };
export function drawMerc(cv, tr, lang = "en") {
  const b = begin(cv); if (!b) return; const { ctx, W, H } = b;
  const r = drawProj(ctx, P_MERC, { x: 6, y: 22, w: W - 12, h: H - 46 }, { grid: 30, tissot: { step: 30, r: 7, lat: [-60, 60] },
    lines: [{ pts: MERC_ROUTE.rhumb, col: FLAT, w: 2.2 }, { pts: MERC_ROUTE.gc, col: GLOBE, w: 2.2, dash: [6, 3] }] });
  for (const [p, s] of [[FRA, "Frankfurt"], [SFO, "San Francisco"]]) { const q = r.proj(...p); if (q) { disc(ctx, q[0], q[1], 3.5, INK); halo(ctx, s, q[0] + (p === SFO ? 5 : -5), q[1] + 14, { size: 10, align: p === SFO ? "left" : "right" }); } }
  const nf = (x) => Math.round(x).toLocaleString(lang);
  label(ctx, tr("mp-merc-t", "Mercator 1569: equal circles of the globe"), 6, 15, { size: 11, bold: true, maxW: W * 0.6 });
  ctx.font = "10.5px system-ui, sans-serif";
  const l1 = tr("mp-merc-rh", "straight: constant heading, {d} km").replace("{d}", nf(pathKm(MERC_ROUTE.rhumb))), l2 = tr("mp-merc-gc", "dashed: great circle, {d} km").replace("{d}", nf(pathKm(MERC_ROUTE.gc)));
  label(ctx, l1, 8, H - 18, { size: 10.5, c: FLAT, maxW: W - 16 }); label(ctx, l2, 8, H - 5, { size: 10.5, c: GLOBE, maxW: W - 16 });
}

/* ---- 4. Galerie : les mêmes cercles sur six projections ------------------------------- */
const GALLERY = [
  ["eqr", equirect(0), "mp-g-eqr", "Equirectangular: neither", null],
  ["merc", mercator(80), "mp-g-merc", "Mercator: shapes", null],
  ["lcea", lambertCyl(), "mp-g-lcea", "Lambert cylindrical: areas", null],
  ["sinu", sinusoidal(), "mp-g-sinu", "Sinusoidal: areas", null],
  ["ae", aeq(90, 0), "mp-g-ae", "Polar azimuthal equidistant", null],
  ["ortho", ortho(25, 15), "mp-g-ortho", "Orthographic: the globe", null],
];
export function drawGallery(cv, tr) {
  const b = begin(cv); if (!b) return; const { ctx, W, H } = b;
  const cols = W < 560 ? 2 : 3, rows = Math.ceil(GALLERY.length / cols), cw = W / cols, ch = (H - 16) / rows;
  GALLERY.forEach(([id, P, k, fb], i) => {
    const cx = (i % cols) * cw, cy = 16 + Math.floor(i / cols) * ch;
    const round = id === "ae" || id === "ortho";
    const rect = { x: cx + 4, y: cy + 4, w: cw - 8, h: ch - 40 };
    if (round) {   // les projections en disque : on clippe au disque, sans cadre
      const s = Math.min(rect.w, rect.h) / (P.box[1] - P.box[0]), cxx = rect.x + rect.w / 2, cyy = rect.y + rect.h / 2, rr = (P.box[1] - P.box[0]) / 2 * s;
      ctx.save(); ctx.beginPath(); ctx.arc(cxx, cyy, rr, 0, 2 * Math.PI); ctx.clip();
      drawProj(ctx, P, rect, { grid: 30, maxRes: 320, tissot: { step: 30, r: 7, lat: [-60, 60], lonStep: 60 }, frame: false });
      ctx.restore(); ctx.beginPath(); ctx.arc(cxx, cyy, rr, 0, 2 * Math.PI); ctx.strokeStyle = COL.rim; ctx.lineWidth = 1; ctx.stroke();
    } else drawProj(ctx, P, rect, { grid: 30, maxRes: 360, tissot: { step: 30, r: 7, lat: [-60, 60], lonStep: 60 } });
    label(ctx, tr(k, fb), cx + cw / 2, cy + ch - 24, { size: 10.5, align: "center", maxW: cw - 10 });
  });
  label(ctx, tr("mp-g-t", "Equal circles of the globe on six maps"), 6, 12, { size: 11, bold: true, maxW: W - 12 });
}

/* ---- 5. L'azimutale équidistante, centre au choix -------------------------------------- */
export const CENTRES = {
  pole: [90, 0], paris: [48.857, 2.352], mecca: [21.422, 39.826], honolulu: [21.307, -157.858], sydney: [-33.868, 151.209], south: [-90, 0],
};
const CITIES = [["Paris", 48.857, 2.352], ["New York", 40.713, -74.006], ["Tokyo", 35.68, 139.69], ["Sydney", -33.868, 151.209], ["Santiago", -33.45, -70.67],
  ["Cape Town", -33.925, 18.424], ["Honolulu", 21.307, -157.858], ["Mecca", 21.422, 39.826], ["Buenos Aires", -34.6, -58.38]];
export const CENTRE_NAMES = { pole: "North Pole", paris: "Paris", mecca: "Mecca", honolulu: "Honolulu", sydney: "Sydney", south: "South Pole", capetown: "Cape Town" };
export const AE_PAIR = [[-33.868, 151.209], [-33.45, -70.67]];   // Sydney – Santiago
export function drawAE(cv, tr, centreKey, lang = "en") {
  const b = begin(cv); if (!b) return; const { ctx, W, H } = b;
  const c = CENTRES[centreKey] || CENTRES.pole, P = aeq(c[0], c[1]);
  const side = Math.min(W - 12, H - 52), rect = { x: (W - side) / 2, y: 24, w: side, h: side };
  const s = side / (2 * Math.PI), cx = rect.x + side / 2, cy = rect.y + side / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, side / 2, 0, 2 * Math.PI); ctx.clip();
  const r = drawProj(ctx, P, rect, { grid: 30, frame: false, maxRes: 560, lines: [{ pts: greatCircle(...AE_PAIR, 200), col: GLOBE, w: 2, dash: [6, 3] }] });
  // anneaux de distance tous les 30° (3 336 km)
  ctx.strokeStyle = "rgba(180,83,9,0.55)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  for (let d = 30; d < 180; d += 30) { ctx.beginPath(); ctx.arc(cx, cy, d * D2R * s, 0, 2 * Math.PI); ctx.stroke(); }
  ctx.setLineDash([]);
  // le trajet Sydney–Santiago : droite sur cette carte
  const A = r.proj(...AE_PAIR[0]), B = r.proj(...AE_PAIR[1]);
  if (A && B) { ctx.strokeStyle = FLAT; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke(); }
  for (const [n, la, lo] of CITIES) {
    const p = r.proj(la, lo); if (!p) continue;
    ctx.strokeStyle = "rgba(21,26,33,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...p); ctx.stroke();
    disc(ctx, p[0], p[1], 3, INK); halo(ctx, n, p[0] + 5, p[1] - 4, { size: 10 });
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, side / 2, 0, 2 * Math.PI); ctx.strokeStyle = COL.rim; ctx.lineWidth = 1.2; ctx.stroke();
  disc(ctx, cx, cy, 4, FLAT, INK, 1.2);
  const km = Math.round(30 * D2R * R_KM).toLocaleString(lang);
  label(ctx, tr("mp-ae-t", "Centre: {c}").replace("{c}", tr(`mp-c-${centreKey}`, CENTRE_NAMES[centreKey])), 6, 15, { size: 11, bold: true, maxW: W * 0.5 });
  stamp2d(ctx, W, tr("mp-ae-st", "true distance and direction from the centre only · rings every 30° = {km} km").replace("{km}", km), false, H);
  return r;
}
/** Lecture du couple Sydney–Santiago sur la carte de ce centre (km). */
export function aeReading(centreKey) {
  const c = CENTRES[centreKey] || CENTRES.pole, P = aeq(c[0], c[1]);
  const a = P.fwd(...AE_PAIR[0]), b = P.fwd(...AE_PAIR[1]);
  return { map: Math.hypot(a[0] - b[0], a[1] - b[1]) * R_KM, truth: gcDeg(...AE_PAIR[0], ...AE_PAIR[1]) * D2R * R_KM };
}

/* ---- 6. Animation : le centre voyage, la carte se refait -------------------------------- */
const TOUR = [["pole", CENTRES.pole], ["paris", CENTRES.paris], ["mecca", CENTRES.mecca], ["capetown", [-33.925, 18.424]], ["south", CENTRES.south],
  ["sydney", CENTRES.sydney], ["honolulu", CENTRES.honolulu]];
function slerpLL(a, b, t) {
  const v = (p) => [Math.cos(p[0] * D2R) * Math.cos(p[1] * D2R), Math.cos(p[0] * D2R) * Math.sin(p[1] * D2R), Math.sin(p[0] * D2R)];
  const A = v(a), B = v(b), om = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
  if (om < 1e-9) return a;
  const s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om), p = [0, 1, 2].map((i) => s1 * A[i] + s2 * B[i]);
  return [Math.asin(Math.max(-1, Math.min(1, p[2]))) * R2D, Math.atan2(p[1], p[0]) * R2D];
}
export function mountAEAnim(cv, tr) {
  const n = TOUR.length, HOLD = 0.45;   // fraction de chaque étape passée immobile sur une ville
  return anim2d(cv, { span: n * 4, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const x = u * n, i = Math.floor(x) % n, f = x - Math.floor(x), t = f < HOLD ? 0 : (1 - Math.cos(Math.PI * (f - HOLD) / (1 - HOLD))) / 2;
    const c = slerpLL(TOUR[i][1], TOUR[(i + 1) % n][1], t), P = aeq(c[0], c[1]);
    const side = Math.min(W - 12, H - 46), rect = { x: (W - side) / 2, y: 22, w: side, h: side }, cx = rect.x + side / 2, cy = rect.y + side / 2;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, side / 2, 0, 2 * Math.PI); ctx.clip();
    drawProj(ctx, P, rect, { grid: 30, frame: false, maxRes: 170, cache: false });
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, side / 2, 0, 2 * Math.PI); ctx.strokeStyle = COL.rim; ctx.lineWidth = 1.2; ctx.stroke();
    disc(ctx, cx, cy, 4, FLAT, INK, 1.2);
    const name = t === 0 ? tr(`mp-c-${TOUR[i][0]}`, CENTRE_NAMES[TOUR[i][0]]) : tr("mp-anim-move", "moving the centre…");
    label(ctx, tr("mp-anim-t", "Centre: {c}").replace("{c}", name), 6, 15, { size: 11, bold: true, maxW: W * 0.55 });
    label(ctx, `${Math.abs(c[0]).toFixed(1)}° ${c[0] >= 0 ? "N" : "S"}, ${Math.abs(c[1]).toFixed(1)}° ${c[1] >= 0 ? "E" : "W"}`, W - 6, 15, { size: 10.5, c: SOFT, align: "right" });
    stamp2d(ctx, W, tr("mp-anim-st", "one globe, one rule (true distance from the centre), a different flat map for each centre"), false, H);
  } });
}

/* ---- 7. La carte de Gleason / de l'ONU : polaire, avec cercles de Tissot ------------------- */
const P_POLE = aeq(90, 0);
export function drawPolar(cv, tr, lang = "en") {
  const b = begin(cv); if (!b) return; const { ctx, W, H } = b;
  const side = Math.min(W - 12, H - 50), rect = { x: (W - side) / 2, y: 24, w: side, h: side }, cx = rect.x + side / 2, cy = rect.y + side / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, side / 2, 0, 2 * Math.PI); ctx.clip();
  const r = drawProj(ctx, P_POLE, rect, { grid: 30, frame: false, maxRes: 600, tissot: { step: 30, r: 7, lat: [-60, 60], lonStep: 45 } });
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, side / 2, 0, 2 * Math.PI); ctx.strokeStyle = COL.rim; ctx.lineWidth = 1.2; ctx.stroke();
  // le bord de l'emblème de l'ONU, 60° S
  ctx.beginPath(); ctx.arc(cx, cy, 150 * D2R * side / (2 * Math.PI), 0, 2 * Math.PI); ctx.strokeStyle = FLAT; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
  const t = tissot(P_POLE, -30, 0);
  label(ctx, tr("mp-pol-t", "The polar map of Gleason and the UN"), 6, 15, { size: 11, bold: true, maxW: W * 0.55 });
  stamp2d(ctx, W, tr("mp-pol-st", "equal circles of the globe · at 30° S each is drawn {k}× too wide · dashed: the UN emblem's edge, 60° S").replace("{k}", t.k.toLocaleString(lang, { maximumFractionDigits: 1 })), false, H);
  return r;
}
