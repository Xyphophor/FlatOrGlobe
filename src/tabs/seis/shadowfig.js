// La zone d'ombre des ondes P sur une carte azimutale équidistante (2026-10-25) : le centre de la carte et le séisme au
// choix ; les stations colorées par ce que le bulletin leur donne ; l'anneau du globe (103°–143° de l'épicentre, calculé
// sur la sphère, projeté) et le meilleur anneau plat de CETTE carte (un cercle autour de l'épicentre projeté, ρ ajusté).
// Statique : redessiné quand un sélecteur change. Nombres : shadow.js (et le pré-calcul pour les meilleures cartes).
import { setupCanvas } from "../../core/canvas.js";
import { makeAE, gcDeg } from "../../core/aeproj.js";
import { drawAEMap, isLand } from "../../core/aemap.js";
import { reducedMotion, frameStep, exportBusy } from "../../core/motion.js";
import { SHADOW_QUAKES, SHADOW_GLOBE, SHADOW_BEST, flatPoints, bestRing, scoreMap } from "./shadow.js";

// mêmes couleurs que la coupe de la Terre plus haut (seis-legacy.js drawSeisCore) et que les pastilles (symbols.js sh*)
const TEAL = "#0f766e", AMBER = "#b45309", INK = "#151a21", SOFT = "#5b6470", CORE = "#6d28d9", DIF = "#5b6470";
export const SHADOW_COLORS = { direct: TEAL, dif: DIF, core: CORE };
const D2R = Math.PI / 180;
const num = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Point à l'angle d (°) et au cap b (°) de (lat, lon), sur la sphère. */
function dest(lat, lon, d, b) {
  const p1 = lat * D2R, l1 = lon * D2R, dd = d * D2R, bb = b * D2R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(dd) + Math.cos(p1) * Math.sin(dd) * Math.cos(bb));
  return [p2 / D2R, (l1 + Math.atan2(Math.sin(bb) * Math.sin(dd) * Math.cos(p1), Math.cos(dd) - Math.sin(p1) * Math.sin(p2))) / D2R];
}

/** Les centres de carte offerts : les neuf épicentres, le pôle Nord, la meilleure carte pour un anneau commun. */
export function shadowChoices(t) {
  const out = SHADOW_QUAKES.map((q) => ({ key: `ev-${q.key}`, label: t("sh-map-on", "centred on {q}", { q: q.name }), c: q.epi }));
  out.push({ key: "pole", label: t("rl-map-pole", "North Pole (the flat-earth map)"), c: [90, 0] });
  const b = SHADOW_BEST.common.c;
  out.push({ key: "best", label: t("sh-map-best", "the best map for one ring ({c})", { c: `${b[0]}° N ${b[1]}° E` }), c: b });
  return out;
}

const vec = (lat, lon) => { const p = lat * D2R, l = lon * D2R; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; };
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Le globe, en vue orthographique (règle 1 : rien d'exagéré, une sphère vue de loin), tourné vers la zone d'ombre du
 * séisme : centre à 80° de l'épicentre, vers les stations sans P directe. Chaque point de la sphère est coloré par sa
 * distance Δ à l'épicentre : P directe (Δ < 103°), ombre (103°–143°), PKP (Δ > 143°) ; puis les stations visibles.
 */
export function drawShadowGlobe(cv, q, t) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const R = Math.min(W, H) / 2 - 14, cx = W / 2, cy = H / 2 + 6;
  // le cap moyen des stations sans P directe, vu de l'épicentre
  const E = vec(q.epi[0], q.epi[1]); let sx = 0, sy = 0;
  for (const [la, lo, c] of q.st) if (c !== 0) {
    const p1 = q.epi[0] * D2R, p2 = la * D2R, dl = (lo - q.epi[1]) * D2R;
    const b = Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl));
    sx += Math.sin(b); sy += Math.cos(b);
  }
  const [la0, lo0] = dest(q.epi[0], q.epi[1], 80, Math.atan2(sx, sy) / D2R);
  const C = vec(la0, lo0), Ev = [-Math.sin(lo0 * D2R), Math.cos(lo0 * D2R), 0], N = [-Math.sin(la0 * D2R) * Math.cos(lo0 * D2R), -Math.sin(la0 * D2R) * Math.sin(lo0 * D2R), Math.cos(la0 * D2R)];
  // la sphère, pixel par pixel (dans un canvas à part, collé ensuite à la densité de l'écran)
  const k = cv.width / W, n = Math.max(2, Math.round(2 * R * k)), img = ctx.createImageData(n, n), d = img.data;
  const zone = (cosD, land) => {
    const D = Math.acos(Math.max(-1, Math.min(1, cosD))) / D2R;
    const base = D < SHADOW_GLOBE.edge ? ZONE_RGB.P : D < SHADOW_GLOBE.edge2 ? ZONE_RGB.shadow : ZONE_RGB.K;
    return land ? base.map((v) => v - 28) : base;
  };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = (i + 0.5) / n * 2 - 1, y = 1 - (j + 0.5) / n * 2, r2 = x * x + y * y;
    if (r2 > 1) continue;
    const z = Math.sqrt(1 - r2), p = [x * Ev[0] + y * N[0] + z * C[0], x * Ev[1] + y * N[1] + z * C[1], x * Ev[2] + y * N[2] + z * C[2]];
    const [r, g, b] = zone(dot3(p, E), isLand(Math.asin(p[2]) / D2R, Math.atan2(p[1], p[0]) / D2R));
    const o = (j * n + i) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
  }
  const off = document.createElement("canvas"); off.width = n; off.height = n; off.getContext("2d").putImageData(img, 0, 0);
  ctx.drawImage(off, cx - R, cy - R, 2 * R, 2 * R);
  ctx.strokeStyle = "#3d7f99"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
  const P = (la, lo) => { const v = vec(la, lo); return [cx + R * dot3(v, Ev), cy - R * dot3(v, N), dot3(v, C)]; };
  // les limites, en trait sarcelle comme sur la carte
  for (const [D, w] of [[SHADOW_GLOBE.edge, 2], [SHADOW_GLOBE.edge2, 1.3]]) {
    ctx.strokeStyle = TEAL; ctx.lineWidth = w; ctx.beginPath(); let pen = false;
    for (let b = 0; b <= 360; b += 2) { const [x, y, v] = P(...dest(q.epi[0], q.epi[1], D, b)); if (v > 0) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; }
    ctx.stroke();
  }
  for (const [la, lo, c] of q.st) {
    const [x, y, v] = P(la, lo); if (v <= 0) continue;
    ctx.fillStyle = c === 0 ? TEAL : c === 1 ? DIF : CORE; ctx.beginPath(); ctx.arc(x, y, c === 0 ? 1.7 : 2.3, 0, 2 * Math.PI); ctx.fill();
  }
  const [ex, ey, ev] = P(q.epi[0], q.epi[1]);
  if (ev > 0) { ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(ex, ey - 7); ctx.lineTo(ex + 6, ey + 4); ctx.lineTo(ex - 6, ey + 4); ctx.closePath(); ctx.fill(); }
  ctx.font = "600 11px system-ui, sans-serif"; ctx.fillStyle = SOFT; ctx.textAlign = "left";
  ctx.fillText(t("sh-globe-title", "the globe, turned towards the shadow"), 8, 16);
}

// les couleurs des trois zones (globe idéal et globe des données, pastilles shzone* de symbols.js)
export const ZONE_RGB = { P: [196, 226, 220], shadow: [240, 205, 170], K: [214, 200, 240] };

/**
 * Le globe idéal, à côté de la coupe (2026-10-25) : sans données, un épicentre fixe sur la Terre qui tourne ; chaque point
 * coloré par son angle Δ à l'épicentre (P directe < 103°, ombre 103°–143°, PKP au-delà). Vue orthographique ; les vecteurs
 * des pixels sont calculés une fois, chaque image ne fait qu'un produit scalaire par pixel. Un tour en TURN secondes.
 */
const IDEAL = { epi: [25, 0], lat0: 18, TURN: 24 };
export function mountIdealGlobe(cv, t) {
  const st = { time: 0, raf: 0, last: 0, vis: true, playing: true, grid: null };
  const frame = () => {
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const R = Math.min(W, H) / 2 - 12, cx = W / 2, cy = H / 2 + 4, n = Math.max(2, Math.round(R * (cv.width / W)));
    // vecteurs des pixels dans le repère de la vue (x vers l'est, y vers le nord, z vers nous) : une fois par taille
    if (!st.grid || st.grid.n !== n) {
      const v = new Float32Array(n * n * 3);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const x = (i + 0.5) / n * 2 - 1, y = 1 - (j + 0.5) / n * 2, r2 = x * x + y * y, o = (j * n + i) * 3;
        v[o] = x; v[o + 1] = y; v[o + 2] = r2 <= 1 ? Math.sqrt(1 - r2) : -9;
      }
      st.grid = { n, v, img: ctx.createImageData(n, n), off: document.createElement("canvas") };
      st.grid.off.width = n; st.grid.off.height = n;
    }
    const lon0 = -(st.time / IDEAL.TURN) * 360;                       // la Terre tourne vers l'est : la vue recule en longitude
    const s0 = Math.sin(IDEAL.lat0 * D2R), c0 = Math.cos(IDEAL.lat0 * D2R);
    const toView = (la, lo) => {                                       // (lat, lon) → repère de la vue
      const p = la * D2R, dl = (lo - lon0) * D2R, cp = Math.cos(p);
      return [cp * Math.sin(dl), c0 * Math.sin(p) - s0 * cp * Math.cos(dl), s0 * Math.sin(p) + c0 * cp * Math.cos(dl)];
    };
    const E = toView(...IDEAL.epi), c1 = Math.cos(SHADOW_GLOBE.edge * D2R), c2 = Math.cos(SHADOW_GLOBE.edge2 * D2R);
    const { v, img } = st.grid, d = img.data;
    for (let k = 0, o = 0; k < n * n; k++, o += 4) {
      const z = v[k * 3 + 2]; if (z < -1) { d[o + 3] = 0; continue; }
      const cosD = v[k * 3] * E[0] + v[k * 3 + 1] * E[1] + z * E[2];
      const col = cosD > c1 ? ZONE_RGB.P : cosD > c2 ? ZONE_RGB.shadow : ZONE_RGB.K, sh = 0.82 + 0.18 * z;   // un peu d'ombrage vers le bord
      d[o] = col[0] * sh; d[o + 1] = col[1] * sh; d[o + 2] = col[2] * sh; d[o + 3] = 255;
    }
    st.grid.off.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(st.grid.off, cx - R, cy - R, 2 * R, 2 * R);
    const P = (la, lo) => { const w = toView(la, lo); return [cx + R * w[0], cy - R * w[1], w[2]]; };
    // méridiens et équateur, discrets : on voit la Terre tourner
    ctx.strokeStyle = "rgba(61,127,153,.35)"; ctx.lineWidth = 0.8;
    const line = (pts) => { ctx.beginPath(); let pen = false; for (const p of pts) { const [x, y, w] = P(...p); if (w > 0) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; } ctx.stroke(); };
    for (let lo = -180; lo < 180; lo += 30) line(Array.from({ length: 61 }, (_, i) => [-90 + 3 * i, lo]));
    line(Array.from({ length: 121 }, (_, i) => [0, -180 + 3 * i]));
    ctx.strokeStyle = TEAL;
    for (const [D, w] of [[SHADOW_GLOBE.edge, 2], [SHADOW_GLOBE.edge2, 1.3]]) { ctx.lineWidth = w; line(Array.from({ length: 181 }, (_, b) => dest(...IDEAL.epi, D, b * 2))); }
    ctx.strokeStyle = "#3d7f99"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
    const [ex, ey, ew] = P(...IDEAL.epi);
    if (ew > 0) { ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(ex, ey - 7); ctx.lineTo(ex + 6, ey + 4); ctx.lineTo(ex - 6, ey + 4); ctx.closePath(); ctx.fill(); }
    ctx.font = "600 11px system-ui, sans-serif"; ctx.fillStyle = SOFT; ctx.textAlign = "left";
    ctx.fillText(t("sh-ideal-title", "an ideal globe: where each wave arrives"), 8, 16);
  };
  const loop = () => {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = 0;
      if (!st.playing || !st.vis || exportBusy() || cv.closest("[hidden]")) { st.last = 0; return; }
      const k = frameStep(st, ts); if (k) { st.time = (st.time + k / 60) % IDEAL.TURN; frame(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  };
  st.playing = !reducedMotion();
  cv.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); });
  let saved = null;
  cv.__anim = {
    duration: IDEAL.TURN,
    begin() { saved = { time: st.time, playing: st.playing }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; },
    frameAt(x) { st.time = x; frame(); },
    end() { if (saved) Object.assign(st, saved); saved = null; st.last = 0; frame(); loop(); },
  };
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis) loop(); }) : null;
  io?.observe(cv);
  return {
    start() { frame(); loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; st.last = 0; },
  };
}

/** Monte la figure : deux sélecteurs, le globe, une carte, une ligne de lectures. */
export function mountShadow(cv, selMap, selQ, reads, t, lang, globeCv = null) {
  const choices = shadowChoices(t);
  if (selMap) { selMap.innerHTML = choices.map((c, i) => `<option value="${i}">${c.label}</option>`).join(""); selMap.value = String(choices.findIndex((c) => c.key === "pole")); }
  if (selQ) selQ.innerHTML = SHADOW_QUAKES.map((q, i) => `<option value="${i}">${q.name}</option>`).join("");
  const cache = new Map();
  const draw = () => {
    const ci = +(selMap?.value || 0), qi = +(selQ?.value || 0), C = choices[ci], q = SHADOW_QUAKES[qi];
    if (globeCv) drawShadowGlobe(globeCv, q, t);
    if (!cache.has(ci)) cache.set(ci, scoreMap(C.c));
    const S = cache.get(ci), map = S.map;
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const R = Math.min(W, H) / 2 - 14, cx = W / 2, cy = H / 2;
    const o = drawAEMap(ctx, map, { cx, cy, Rpx: R, grid: 30 });
    const P = (la, lo) => o.project(la, lo), pxPerDeg = R / 180;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.clip();
    // l'anneau du globe : 103° et 143° de l'épicentre, sur la sphère, puis projetés (un cercle seulement sur la carte du séisme)
    for (const [d, w] of [[SHADOW_GLOBE.edge, 2.2], [SHADOW_GLOBE.edge2, 1.4]]) {
      ctx.strokeStyle = TEAL; ctx.lineWidth = w; ctx.beginPath(); let last = null;
      for (let b = 0; b <= 360; b += 1) {
        const [x, y] = P(...dest(q.epi[0], q.epi[1], d, b));
        if (last && Math.hypot(x - last[0], y - last[1]) > R * 0.3) ctx.moveTo(x, y); else if (last) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        last = [x, y];
      }
      ctx.stroke();
    }
    // le meilleur anneau plat de cette carte, pour ce séisme : un cercle autour de l'épicentre projeté
    const [ex, ey] = P(q.epi[0], q.epi[1]), own = S.own[qi];
    ctx.setLineDash([7, 5]); ctx.strokeStyle = AMBER; ctx.lineWidth = 2.2;
    if (!own.none) { ctx.beginPath(); ctx.arc(ex, ey, own.rho * pxPerDeg, 0, 2 * Math.PI); ctx.stroke(); }
    ctx.setLineDash([2, 4]); ctx.lineWidth = 1.5;
    if (!S.common.none) { ctx.beginPath(); ctx.arc(ex, ey, S.common.rho * pxPerDeg, 0, 2 * Math.PI); ctx.stroke(); }
    ctx.setLineDash([]);
    // les stations : couleur = ce que le bulletin donne ; croix = mal placée par l'anneau plat de ce séisme
    const fp = flatPoints(q, map);
    let gBad = 0, fBad = 0;
    q.st.forEach(([la, lo, c], i) => {
      const [x, y] = P(la, lo), dir = c === 0;
      const g = gcDeg(q.epi[0], q.epi[1], la, lo) < SHADOW_GLOBE.edge, f = fp[i][0] < own.rho;
      if (g !== dir) gBad++;
      if (f !== dir) { fBad++; ctx.strokeStyle = AMBER; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
      ctx.fillStyle = c === 0 ? TEAL : c === 1 ? DIF : CORE; ctx.beginPath(); ctx.arc(x, y, c === 0 ? 1.7 : 2.3, 0, 2 * Math.PI); ctx.fill();
    });
    ctx.restore();
    // l'épicentre
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(ex, ey - 7); ctx.lineTo(ex + 6, ey + 4); ctx.lineTo(ex - 6, ey + 4); ctx.closePath(); ctx.fill();
    ctx.font = "600 11px system-ui, sans-serif"; ctx.fillStyle = SOFT; ctx.textAlign = "left"; ctx.fillText(C.label, 8, 16);
    const n = q.st.length, all = SHADOW_QUAKES.reduce((s, x) => s + x.st.length, 0);
    if (reads) reads.innerHTML =
      `<span class="g">${t("sh-read-globe", "Globe, 103° (nothing fitted): {b} of {n} stations on the wrong side", { b: num(lang, gBad), n: num(lang, n) })}</span> · ` +
      `<span class="f">${own.none ? t("sh-read-own-none", "this map, this quake: no ring does better than none, {b}", { b: num(lang, fBad) })
        : t("sh-read-own", "this map, best ring for this quake (ρ = {r}°): {b}", { r: num(lang, own.rho, 1), b: num(lang, fBad) })}</span> · ` +
      `<span class="f">${S.common.none ? t("sh-read-common-none", "one ring for the nine on this map: none does better than no ring, {b} of {n} wrong", { b: num(lang, Math.round((1 - S.common.share) * all)), n: num(lang, all) })
        : t("sh-read-common", "one ring for the nine on this map (ρ = {r}°): {b} of {n} wrong", { r: num(lang, S.common.rho, 1), b: num(lang, Math.round((1 - S.common.share) * all)), n: num(lang, all) })}</span>`;
  };
  selMap?.addEventListener("change", draw); selQ?.addEventListener("change", draw);
  return { draw };
}

/** Le tableau : par séisme, stations, mal placées par le globe et par les cartes plates. */
export function fillShadowTable(tb, t, lang) {
  if (!tb) return;
  const pole = scoreMap([90, 0]), best = scoreMap(SHADOW_BEST.common.c);
  const bad = (share, n) => num(lang, Math.round((1 - share) * n));
  const rows = SHADOW_QUAKES.map((q, i) => {
    const n = q.st.length, d = q.st.filter((s) => s[2] === 0).length;
    const self = bestRing(flatPoints(q, makeAE({ lat0: q.epi[0], lon0: q.epi[1] })));
    return `<tr><td>${q.name}</td><td class="num">${num(lang, n)}</td><td class="num">${num(lang, d)}</td>` +
      `<td class="num">${bad(SHADOW_GLOBE.fixed[i], n)}</td><td class="num">${bad(SHADOW_GLOBE.fitted[i], n)} <span class="sub">(${num(lang, SHADOW_GLOBE.fittedR[i], 1)}°)</span></td>` +
      `<td class="num">${num(lang, n - self.n)}</td><td class="num">${bad(pole.own[i].share, n)}</td><td class="num">${bad(best.own[i].share, n)}</td></tr>`;
  });
  const N = SHADOW_QUAKES.reduce((s, q) => s + q.st.length, 0), D = SHADOW_QUAKES.reduce((s, q) => s + q.st.filter((x) => x[2] === 0).length, 0);
  rows.push(`<tr class="grp"><td><b>${t("sh-all", "All nine, one ring")}</b></td><td class="num">${num(lang, N)}</td><td class="num">${num(lang, D)}</td>` +
    `<td class="num"><b>${bad(SHADOW_GLOBE.fixedAll, N)}</b></td><td class="num"><b>${bad(SHADOW_GLOBE.fittedAll, N)}</b> <span class="sub">(${num(lang, SHADOW_GLOBE.fittedAllR, 1)}°)</span></td>` +
    `<td class="num">—</td><td class="num"><b>${bad(pole.common.share, N)}</b></td><td class="num"><b>${bad(best.common.share, N)}</b></td></tr>`);
  tb.innerHTML = rows.join("");
}
