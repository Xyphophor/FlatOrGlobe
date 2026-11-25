// Section « Doing it ourselves » de l'onglet seis (epic18/UC04) : les résidus du globe et du
// plat pour un séisme, la carte animée (le plat a le droit de choisir SA carte, mais une seule
// pour les neuf séismes), la carte de chaleur des centres de carte, le tableau. Nombres :
// relocate.js et le pré-calcul ; ici on ne fait que dessiner. Canvas 2D (beaucoup de points).
import { setupCanvas } from "../../core/canvas.js";
import { reducedMotion, frameStep, exportBusy } from "../../core/motion.js";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";
import { seisDirect } from "./logic.js";
import { RELOC_QUAKES, RELOC_MAPS, curve, globeDist, looFixed, flatMap, rootsOf } from "./relocate.js";

const TEAL = "#0f766e", AMBER = "#b45309", INK = "#151a21", SOFT = "#5b6470";
const fs = (px, w = "") => `${w}${px}px system-ui, sans-serif`;
const num = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/** La courbe inverse : la distance où la courbe vaut t, par dichotomie sur [a, b] (courbe croissante). */
function inverse(coef, t, a, b) {
  if (t <= curve(coef, a)) return a; if (t >= curve(coef, b)) return b;
  for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (curve(coef, m) < t) a = m; else b = m; }
  return (a + b) / 2;
}

/** Les centres de carte offerts au plat : les 9 épicentres officiels, le pôle Nord, la meilleure carte unique. */
export function mapChoices(t) {
  const M = RELOC_MAPS, out = RELOC_QUAKES.map((q, i) => ({ key: `ev-${q.key}`, label: t("rl-map-on", "centred on {q}", { q: q.name }), c: M.named[i].c, row: M.named[i] }));
  out.push({ key: "pole", label: t("rl-map-pole", "North Pole (the flat-earth map)"), c: [90, 0], row: M.named[M.named.length - 1] });
  out.push({ key: "best", label: t("rl-map-best", "the best single map ({c})", { c: `${M.best.c[0]}° N ${M.best.c[1]}° E` }), c: M.best.c, row: M.best });
  return out;
}

/** Résidus (s) du globe et du plat polaire pour un séisme : deux bandes, même échelle. */
export function drawResiduals(cv, q, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const pl = 44, pr = 12, top = 26, gap = 30, hB = (H - top - gap - 34) / 2, lim = 40;
  const X = (d) => pl + ((d - 25) / 70) * (W - pl - pr);
  const g = globeDist(q), tt = q.pP.map((r) => r[2]);
  const gk = q.pP.map((r) => r[3] === 1);
  const map = flatMap(), pts = q.pP.map((r) => map.fwd(r[0], r[1])), fd = pts.map(([a, b]) => Math.hypot(a - q.Pflat.x, b - q.Pflat.y));
  const ff = looFixed(fd, tt);
  const band = (y0, label, col, d, res, keep, sd) => {
    const Y = (r) => y0 + hB / 2 - (Math.max(-lim, Math.min(lim, r)) / lim) * (hB / 2);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.strokeRect(pl, y0, W - pl - pr, hB);
    ctx.beginPath(); ctx.moveTo(pl, Y(0)); ctx.lineTo(W - pr, Y(0)); ctx.strokeStyle = "#c9ced6"; ctx.stroke();
    ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "right";
    for (const r of [-lim, -20, 0, 20, lim]) ctx.fillText(`${r > 0 ? "+" : ""}${r}`, pl - 4, Y(r) + 3);
    d.forEach((x, i) => {
      ctx.fillStyle = keep[i] ? col : "rgba(91,100,112,.35)";
      ctx.fillRect(X(x) - 1.2, Y(res[i]) - 1.2, 2.4, 2.4);
    });
    // le titre à gauche, la dispersion à droite (un écran étroit n'a pas la place des deux sur une ligne)
    ctx.font = fs(W < 500 ? 10 : 11, "600 "); ctx.fillStyle = col; ctx.textAlign = "left";
    ctx.fillText(label, pl + 2, y0 - 6);
    ctx.textAlign = "right"; ctx.fillText(t("rl-res-sd", "scatter {s} s", { s: num(lang, sd, 1) }), W - pr, y0 - 6);
  };
  const narrow = W < 500;
  band(top, narrow ? t("rl-res-globe-n", "globe (great circle)") : t("rl-res-globe", "globe: distance along the great circle"), TEAL, g, tt.map((x, i) => x - curve(q.P.coef, g[i])), gk, q.P.sd);
  band(top + hB + gap, narrow ? t("rl-res-flat-n", "flat map (North Pole)") : t("rl-res-flat", "flat map (North Pole): distance on the disc"), AMBER, fd, tt.map((x, i) => x - curve(ff.coef, fd[i])), ff.keep, ff.sd);
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  for (let d = 30; d <= 90; d += 15) ctx.fillText(`${d}°`, X(d), H - 18);
  ctx.fillText(narrow ? t("rl-res-x-n", "distance from each model's centre (°); beyond ±40 s: at the edge") : t("rl-res-x", "distance from the centre each model found (degrees); points outside ±40 s pinned to the edge"), (pl + W - pr) / 2, H - 4);
  ctx.save(); ctx.translate(11, top + hB + gap / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t("rl-res-y", "observed − fitted P time (s)"), 0, 0); ctx.restore();
}

/** La carte animée : un séisme sur la carte choisie, le vrai front (globe) et le meilleur cercle du plat SUR CETTE carte. */
export function mountRelocMap(cv, selMap, selQuake, readsEl, t, lang) {
  const choices = mapChoices(t), DUR = 14, RUN = 12;
  const an = { t: 0, last: 0, raf: null, vis: true, playing: !reducedMotion() };
  let ci = choices.findIndex((c) => c.key === "pole"), qi = 0;
  if (selMap) { selMap.innerHTML = choices.map((c, i) => `<option value="${i}"${i === ci ? " selected" : ""}>${c.label}</option>`).join(""); selMap.addEventListener("change", () => { ci = +selMap.value; reads(); draw(); }); }
  if (selQuake) { selQuake.innerHTML = RELOC_QUAKES.map((q, i) => `<option value="${i}">${q.name}</option>`).join(""); selQuake.addEventListener("change", () => { qi = +selQuake.value; an.t = 0; reads(); draw(); }); }
  // l'ajustement plat de CE séisme sur CETTE carte, fait par le build (`fog build seis-relocate`, keep_fits)
  const fitOf = () => { const f = choices[ci].row.fits[qi]; return { x: f[0], y: f[1], coef: f.slice(2, 6) }; };
  function reads() {
    if (!readsEl) return;
    const ch = choices[ci], q = RELOC_QUAKES[qi];
    readsEl.innerHTML = `<span class="g">${t("rl-r-globe", "globe: {s} s for this earthquake, {a} s for all nine", { s: num(lang, q.P.sd, 1), a: num(lang, RELOC_MAPS.globe_rms, 1) })}</span>` +
      `<span class="f">${t("rl-r-flat", "this flat map: {s} s for this earthquake, {a} s for all nine", { s: num(lang, ch.row.sd[qi], 1), a: num(lang, ch.row.rms, 1) })}</span>`;
  }
  function draw() {
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const ch = choices[ci], q = RELOC_QUAKES[qi], map = makeAE({ lat0: ch.c[0], lon0: ch.c[1] });
    const narrow = W < 500, top = narrow ? 40 : 30, R = Math.min(W / 2 - 12, (H - top - 30) / 2), cx = W / 2, cy = top + R + 4;
    const o = drawAEMap(ctx, map, { cx, cy, Rpx: R, grid: 30 });
    const tA = curve(q.P.coef, 25), tB = curve(q.P.coef, 95), tm = tA + (tB - tA) * Math.min(1, an.t / RUN);
    // stations : allumées à leur heure réelle
    for (const r of q.pP) { if (r[3] !== 1) continue; const [x, y] = o.project(r[0], r[1]); const on = r[2] <= tm;
      ctx.beginPath(); ctx.arc(x, y, on ? 2.6 : 2, 0, 7); ctx.fillStyle = on ? TEAL : "#fff"; ctx.fill(); ctx.strokeStyle = on ? TEAL : "#8b93a0"; ctx.lineWidth = 0.8; ctx.stroke(); }
    // le vrai front : tous les points à la distance Δ(t) du centre trouvé sur le globe, projetés sur cette carte
    const dG = inverse(q.P.coef, tm, 25, 95);
    ctx.beginPath(); let prev = null;
    for (let az = 0; az <= 360; az += 2) { const p = seisDirect(q.P.lat, q.P.lon, az, dG), m = map.fwd(p.lat, p.lon), [x, y] = o.S(m);
      if (prev && Math.hypot(m[0] - prev[0], m[1] - prev[1]) < 30) ctx.lineTo(x, y); else ctx.moveTo(x, y); prev = m; }
    ctx.strokeStyle = TEAL; ctx.lineWidth = 2.4; ctx.stroke();
    // le plat, à son meilleur SUR CETTE carte : un cercle autour de son propre centre
    // la courbe plate n'est inversée que sur la plage des distances qu'elle a ajustées (hors de là, une cubique peut se retourner)
    const f = fitOf(), dd = q.pP.filter((r) => r[3] === 1).map((r) => { const [a, b] = map.fwd(r[0], r[1]); return Math.hypot(a - f.x, b - f.y); });
    // la meilleure courbe plate n'est pas toujours croissante (l'onde arriverait plus tôt plus loin) : on trace TOUS
    // les cercles où elle vaut t, dans la plage ajustée (rootsOf, relocate.js)
    const [fx, fy] = o.S([f.x, f.y]);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();   // le plat n'a rien au-delà du bord de son disque
    ctx.strokeStyle = AMBER; ctx.setLineDash([6, 4]); ctx.lineWidth = 2;
    for (const dF of rootsOf(f.coef, tm, Math.min(...dd), Math.max(...dd))) { ctx.beginPath(); ctx.arc(fx, fy, (dF * R) / 180, 0, 7); ctx.stroke(); }
    ctx.restore();
    // les centres : celui du globe (étoile), celui du plat (croix)
    const [gx, gy] = o.project(q.P.lat, q.P.lon);
    ctx.fillStyle = INK; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * Math.PI / 180, rr = i % 2 ? 3 : 7; i ? ctx.lineTo(gx + rr * Math.cos(a), gy + rr * Math.sin(a)) : ctx.moveTo(gx + rr * Math.cos(a), gy + rr * Math.sin(a)); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = AMBER; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - 5, fy - 5); ctx.lineTo(fx + 5, fy + 5); ctx.moveTo(fx + 5, fy - 5); ctx.lineTo(fx - 5, fy + 5); ctx.stroke();
    ctx.font = fs(11, "600 "); ctx.fillStyle = INK; ctx.textAlign = "left";
    ctx.fillText(`${q.name} · ${t("rl-map-t", "{m} min after the first arrival shown", { m: num(lang, (tm - tA) / 60, 1) })}`, 8, 16);
    // la mention de projection : en bas à droite, ou sous le titre sur un écran étroit (sinon elle chevauche la légende)
    ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = narrow ? "left" : "right";
    ctx.fillText(t("rl-map-stamp", "azimuthal equidistant · distances true from the map's centre only"), narrow ? 8 : W - 6, narrow ? 30 : H - 8);
    ctx.textAlign = "left"; ctx.fillStyle = TEAL; ctx.fillText(t("rl-map-leg-g", "— true front (globe)"), 8, H - 22); ctx.fillStyle = AMBER; ctx.fillText(t("rl-map-leg-f", "- - best flat front(s) on this map"), 8, H - 8);
  }
  function loop() {
    if (an.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => { an.raf = null; if (!an.playing || !an.vis || cv.closest("[hidden]")) { an.last = 0; return; }
      const k = frameStep(an, ts); if (k) { an.t = (an.t + k / 60) % DUR; draw(); } an.raf = requestAnimationFrame(step); };
    an.raf = requestAnimationFrame(step);
  }
  cv.style.cursor = "pointer"; cv.setAttribute("tabindex", "0");
  cv.addEventListener("click", () => { an.playing = !an.playing; an.last = 0; if (an.playing) loop(); else draw(); });
  cv.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); cv.click(); } });
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { an.vis = es.some((e) => e.isIntersecting); if (an.vis && !exportBusy()) loop(); }).observe(cv);
  let saved = null;
  cv.__anim = { duration: DUR, begin() { saved = { ...an }; if (an.raf) cancelAnimationFrame(an.raf); an.raf = null; }, frameAt(s) { an.t = s; draw(); },
    end() { if (saved) Object.assign(an, saved, { raf: null, last: 0 }); saved = null; draw(); if (an.playing) loop(); }, readout: () => readsEl?.textContent || "" };
  reads();
  return { start() { draw(); if (an.playing) loop(); }, stop() { if (an.raf) cancelAnimationFrame(an.raf); an.raf = null; an.last = 0; }, draw };
}

/** La carte de chaleur : la dispersion moyenne du plat pour les neuf séismes, selon le centre de la carte (plate carrée). */
export function drawHeat(cv, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const pl = 30, pr = 10, top = 24, bot = 58, Wm = W - pl - pr, Hm = Math.min(Wm / 2, H - top - bot);
  const X = (lo) => pl + ((lo + 180) / 360) * Wm, Y = (la) => top + ((90 - la) / 180) * Hm;
  const M = RELOC_MAPS, g = M.globe_rms, all = [...M.grid, ...M.fine], hi = Math.max(...all.map((r) => r.rms));
  const col = (v) => { const u = Math.max(0, Math.min(1, Math.log(v / g) / Math.log(hi / g))); const a = [253, 236, 200], b = [140, 45, 4]; return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * u)).join(",")})`; };
  ctx.save(); ctx.beginPath(); ctx.rect(pl, top, Wm, Hm); ctx.clip();   // les cellules du bord débordent : on les coupe au cadre
  for (const r of M.grid) for (const sh of [0, 360]) { ctx.fillStyle = col(r.rms); ctx.fillRect(X(r.c[1] - 10 + sh), Y(r.c[0] + 10), (Wm / 360) * 20 + 0.5, (Hm / 180) * 20 + 0.5); }
  for (const r of M.fine) { ctx.fillStyle = col(r.rms); ctx.fillRect(X(r.c[1]) - 3, Y(r.c[0]) - 3, 6, 6); }
  ctx.restore();
  ctx.strokeStyle = "rgba(21,26,33,.5)"; ctx.lineWidth = 1; ctx.strokeRect(pl, top, Wm, Hm);
  for (const q of RELOC_QUAKES) { ctx.beginPath(); ctx.arc(X(((q.official[1] + 540) % 360) - 180), Y(q.official[0]), 2.6, 0, 7); ctx.fillStyle = INK; ctx.fill(); }
  const b = M.best; ctx.strokeStyle = TEAL; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(b.c[1]), Y(b.c[0]), 7, 0, 7); ctx.stroke();
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  for (const lo of [-120, -60, 0, 60, 120]) ctx.fillText(`${lo}°`, X(lo), top + Hm + 12);
  ctx.textAlign = "right"; for (const la of [-60, 0, 60]) ctx.fillText(`${la}°`, pl - 3, Y(la) + 3);
  ctx.textAlign = "left"; ctx.fillStyle = INK; ctx.font = fs(11, "600 ");
  ctx.fillText(t("rl-heat-t", "flat-map scatter for all nine earthquakes, by map centre"), pl, 15);
  ctx.font = fs(9.5); ctx.fillStyle = SOFT;
  const leg = t("rl-heat-leg", "globe {g} s · best map {b} s (circle) · North Pole map {p} s · dots: the nine epicentres", { g: num(lang, g, 1), b: num(lang, b.rms, 1), p: num(lang, M.named[M.named.length - 1].rms, 1) });
  // sur un écran étroit, la légende passe sur deux lignes (coupée au milieu de ses « · »)
  const parts = leg.split(" · "), lines = ctx.measureText(leg).width > Wm ? [parts.slice(0, 2).join(" · "), parts.slice(2).join(" · ")] : [leg];
  lines.forEach((l, i) => ctx.fillText(l, pl, top + Hm + 28 + 12 * i));
  // barre de couleur
  const bx = pl, by = top + Hm + 34 + 12 * (lines.length - 1), bw = Math.min(220, Wm * 0.5);
  for (let i = 0; i < bw; i++) { ctx.fillStyle = col(g * Math.pow(hi / g, i / bw)); ctx.fillRect(bx + i, by, 1, 6); }
  ctx.textAlign = "left"; ctx.fillText(`${num(lang, g, 1)} s`, bx + bw + 4, by + 7);
  ctx.textAlign = "right"; ctx.fillText(`${num(lang, hi, 0)} s`, W - pr, by + 7);
}

/** Le tableau : séisme par séisme. */
export function fillTable(tb, t, lang) {
  if (!tb) return;
  const M = RELOC_MAPS, pole = M.named[M.named.length - 1];
  tb.innerHTML = RELOC_QUAKES.map((q, i) => `<tr><td>${q.name}</td><td class="num">${q.P.n}</td><td class="num">${num(lang, q.P.sd, 1)} s</td><td class="num">${num(lang, q.P.offset_deg, 2)}°</td>` +
    `<td class="num">${num(lang, pole.sd[i], 1)} s</td><td class="num">${num(lang, M.named[i].sd[i], 1)} s</td><td class="num">${num(lang, M.best.sd[i], 1)} s</td>` +
    `<td class="num">${num(lang, q.firstArrival?.sd ?? NaN, 1)} / ${num(lang, q.firstArrival?.flat_sd ?? NaN, 1)} s</td><td class="num">${num(lang, q.LR.lap_h, 2)} h</td></tr>`).join("") +
    `<tr class="sum"><td>${t("rl-tab-all", "all nine (rms)")}</td><td></td><td class="num">${num(lang, M.globe_rms, 1)} s</td><td></td><td class="num">${num(lang, pole.rms, 1)} s</td><td></td><td class="num">${num(lang, M.best.rms, 1)} s</td><td></td><td></td></tr>`;
}

