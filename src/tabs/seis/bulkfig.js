// Les synthèses de l'onglet seis sur tous les grands séismes peu profonds (2026-10-29,
// `fog build seis-bulk`) : les heures P de tous les séismes mises ensemble (une courbe par
// séisme, puis une courbe commune), la zone d'ombre de toutes les stations, la boîte du
// rayon de toutes les arrivées de Rayleigh. Aucun de ces séismes ne se choisit dans un menu :
// ils donnent du volume. Nombres : le pré-calcul ; ici on ne fait que dessiner.
import { setupCanvas } from "../../core/canvas.js";
import { FIG } from "../../core/fig.js";
import { BULK_P, BULK_SHADOW, BULK_RADIUS } from "../../data/presets/seis-bulk.js";

const TEAL = "#0f766e", AMBER = "#b45309", INK = "#151a21", SOFT = "#5b6470";
const fs = (px, w = "") => `${w}${px}px system-ui, sans-serif`;
const num = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const ll = (c, lang) => `${num(lang, Math.abs(c[0]), 0)}° ${c[0] >= 0 ? "N" : "S"} ${num(lang, Math.abs(c[1]), 0)}° ${c[1] >= 0 ? "E" : (lang === "fr" ? "O" : "W")}`;

/** Les nombres de la synthèse P, pour la ligne de lecture, le tableau et la prose. */
export function bulkSummary() {
  const Q = BULK_P.quakes, st = BULK_P.common.globe.n + BULK_P.common.globe.ex;
  // colonnes : 5 globe, 6 pôle, 7 meilleure carte (une courbe par séisme) ; 8, 9, 10 : courbe commune
  const wins = (gi, fi) => Q.filter((r) => r[gi] < r[fi]).length;
  return { n: Q.length, stations: st, winsPole: wins(8, 9), winsBest: wins(8, 10), winsPoleQ: wins(5, 6), winsBestQ: wins(5, 7) };
}

export function fillBulkRead(el, t, lang) {
  if (!el) return;
  const s = bulkSummary(), C = BULK_P.common, Pq = BULK_P.perq;
  el.innerHTML = `<span>${t("rb-read-n", "{n} earthquakes, {s} P stations", { n: s.n, s: num(lang, s.stations) })}</span>` +
    `<span class="g">${t("rb-read-g", "globe: {a} s (one curve for all), {b} s (a curve each)", { a: num(lang, C.globe.rms, 1), b: num(lang, Pq.globe.rms, 1) })}</span>` +
    `<span class="f">${t("rb-read-f", "best flat map: {a} s, {b} s · North Pole map: {c} s, {d} s", { a: num(lang, C.best.rms, 1), b: num(lang, Pq.best.rms, 1), c: num(lang, C.pole.rms, 1), d: num(lang, Pq.pole.rms, 1) })}</span>`;
}

/** Les résidus de toutes les stations, courbe commune : la part des stations par seconde d'écart. */
export function drawBulkHist(cv, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const narrow = W < 500, pl = 40, pr = 10, top = narrow ? 50 : 36, bot = 34, Wp = W - pl - pr, Hp = H - top - bot;
  const C = BULK_P.common, half = 60, lim = 40;
  const share = (h) => { const n = h.reduce((a, b) => a + b, 0); return h.map((x) => (100 * x) / n); };
  const series = [[C.globe, TEAL, [], 2.2], [C.best, AMBER, [], 2], [C.pole, AMBER, [5, 3], 1.6]].map(([f, c, d, w]) => ({ y: share(f.hist), c, d, w }));
  const ymax = Math.max(...series[0].y) * 1.08;
  const X = (r) => pl + ((r + lim) / (2 * lim)) * Wp, Y = (v) => top + Hp - (v / ymax) * Hp;
  ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.strokeRect(pl, top, Wp, Hp);
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  for (let r = -lim; r <= lim; r += 10) { ctx.fillText(`${r > 0 ? "+" : ""}${r}`, X(r), top + Hp + 12); ctx.beginPath(); ctx.moveTo(X(r), top + Hp); ctx.lineTo(X(r), top + Hp + 3); ctx.stroke(); }
  ctx.fillText(t("rb-h-x", "observed − fitted P time (s), one curve for every earthquake"), pl + Wp / 2, H - 6);
  ctx.textAlign = "right";
  const step = ymax > 20 ? 10 : 5;
  for (let v = 0; v <= ymax; v += step) { ctx.fillText(`${v}`, pl - 4, Y(v) + 3); }
  ctx.save(); ctx.translate(10, top + Hp / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(t("rb-h-y", "% of stations per second"), 0, 0); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(pl, top, Wp, Hp); ctx.clip();
  for (const s of series.slice().reverse()) {
    ctx.beginPath();
    for (let i = -lim; i <= lim; i++) { const v = s.y[i + half], x0 = X(i - 0.5), x1 = X(i + 0.5);
      if (i === -lim) ctx.moveTo(x0, Y(v)); else ctx.lineTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); }
    ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.setLineDash(s.d); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  ctx.font = fs(narrow ? 10 : 11, "600 "); ctx.textAlign = "left";
  const lg = [[TEAL, t("rb-h-g", "globe: {s} s", { s: num(lang, C.globe.rms, 1) })], [AMBER, t("rb-h-b", "best flat map: {s} s", { s: num(lang, C.best.rms, 1) })], [AMBER, t("rb-h-p", "- - North Pole map: {s} s", { s: num(lang, C.pole.rms, 1) })]];
  if (narrow) { ctx.fillStyle = lg[0][0]; ctx.fillText(lg[0][1], pl, 14); ctx.fillStyle = AMBER; ctx.fillText(lg[1][1], pl, 28); ctx.fillText(lg[2][1], pl, 42); }
  else { let x = pl; for (const [c, s] of lg) { ctx.fillStyle = c; ctx.fillText(s, x, 16); x += ctx.measureText(s).width + 18; } }
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "right";
  const nt = t("rb-h-note", "beyond ±40 s: not drawn ({p} % of the North Pole map's)", { p: num(lang, outside(C.pole.hist, lim), 0) });
  if (narrow) { const [a, b] = nt.split(": "); ctx.fillText(a + ":", W - pr - 4, top + 12); ctx.fillText(b || "", W - pr - 4, top + 24); }
  else ctx.fillText(nt, W - pr, top - 4);
}

function outside(h, lim) { const n = h.reduce((a, b) => a + b, 0); let o = 0; h.forEach((x, i) => { if (Math.abs(i - 60) > lim) o += x; }); return (100 * o) / n; }

/** Les résidus contre la distance, toutes les stations : densité (cases de 2° × 1 s). */
export function drawBulkDens(cv, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const narrow = W < 500, pl = 44, pr = 12, top = 26, gap = 30, hB = (H - top - gap - 34) / 2;
  const C = BULK_P.common, lim = 30;
  const band = (y0, f, col, label, rgb) => {
    const d0 = Math.min(...f.dens.map((c) => c[0])), d1 = Math.max(...f.dens.map((c) => c[0])) + 1;
    const X = (i) => pl + ((i - d0) / (d1 - d0)) * (W - pl - pr), Y = (j) => y0 + hB - (j / 60) * hB;
    const mx = Math.max(...f.dens.map((c) => c[2]));
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.strokeRect(pl, y0, W - pl - pr, hB);
    for (const [i, j, n] of f.dens) { const a = Math.min(1, 0.12 + 0.88 * Math.log(1 + n) / Math.log(1 + mx));
      ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`; ctx.fillRect(X(i), Y(j + 1), X(i + 1) - X(i) + 0.4, Y(j) - Y(j + 1) + 0.4); }
    ctx.beginPath(); ctx.moveTo(pl, Y(30)); ctx.lineTo(W - pr, Y(30)); ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.stroke();
    ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "right";
    for (const r of [-lim, -15, 0, 15, lim]) ctx.fillText(`${r > 0 ? "+" : ""}${r}`, pl - 4, Y(r + 30) + 3);
    ctx.textAlign = "center";
    const st = (d1 - d0) * 2 > 120 ? 30 : 15;
    for (let d = Math.ceil((d0 * 2) / st) * st; d <= d1 * 2; d += st) ctx.fillText(`${d}°`, X(d / 2), y0 + hB + 12);
    ctx.font = fs(narrow ? 10 : 11, "600 "); ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(label, pl + 2, y0 - 6);
    ctx.textAlign = "right"; ctx.fillText(t("rl-res-sd", "scatter {s} s", { s: num(lang, f.rms, 1) }), W - pr, y0 - 6);
  };
  band(top, C.globe, TEAL, narrow ? t("rl-res-globe-n", "globe (great circle)") : t("rl-res-globe", "globe: distance along the great circle"), "15,118,110");
  band(top + hB + gap, C.best, AMBER, narrow ? t("rb-d-flat-n", "best flat map ({c})", { c: ll(BULK_P.cbest, lang) }) : t("rb-d-flat", "best flat map ({c}): distance on the disc", { c: ll(BULK_P.cbest, lang) }), "180,83,9");
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  ctx.fillText(t("rb-d-x", "distance from each model's centre (degrees); darker: more stations"), (pl + W - pr) / 2, H - 4);
  ctx.save(); ctx.translate(11, top + hB + gap / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t("rl-res-y", "observed − fitted P time (s)"), 0, 0); ctx.restore();
}

/** Un point par séisme : la dispersion du globe (x) contre celle de la meilleure carte plate (y), échelles log. */
export function drawBulkQuakes(cv, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const narrow = W < 500, pl = 44, pr = 12, top = narrow ? 36 : 24, bot = 52, Wp = W - pl - pr, Hp = H - top - bot;
  const lo = 0.3, hi = 100, L = (v) => Math.log10(Math.max(lo, Math.min(hi, v)));
  const X = (v) => pl + ((L(v) - L(lo)) / (L(hi) - L(lo))) * Wp, Y = (v) => top + Hp - ((L(v) - L(lo)) / (L(hi) - L(lo))) * Hp;
  ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.strokeRect(pl, top, Wp, Hp);
  ctx.font = fs(9.5); ctx.fillStyle = SOFT;
  for (const v of [0.3, 1, 3, 10, 30, 100]) { ctx.textAlign = "center"; ctx.fillText(num(lang, v, v < 1 ? 1 : 0), X(v), top + Hp + 12); ctx.textAlign = "right"; ctx.fillText(num(lang, v, v < 1 ? 1 : 0), pl - 4, Y(v) + 3); }
  // la diagonale : autant que le globe
  ctx.beginPath(); ctx.moveTo(X(lo), Y(lo)); ctx.lineTo(X(hi), Y(hi)); ctx.strokeStyle = "rgba(21,26,33,.45)"; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
  ctx.save(); ctx.translate(X(2), Y(2)); ctx.rotate(-Math.atan2(Y(lo) - Y(hi), X(hi) - X(lo))); ctx.textAlign = "center"; ctx.fillText(t("rb-q-diag", "as good as the globe"), 0, 12); ctx.restore();
  const Q = BULK_P.quakes;
  for (const r of Q) { if (r[11]) continue; ctx.beginPath(); ctx.arc(X(r[8]), Y(r[10]), 2.6, 0, 7); ctx.fillStyle = "rgba(180,83,9,.55)"; ctx.fill(); }
  for (const r of Q) { if (!r[11]) continue; ctx.beginPath(); ctx.arc(X(r[8]), Y(r[10]), 4.2, 0, 7); ctx.fillStyle = INK; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.textAlign = "center"; ctx.fillStyle = SOFT;
  ctx.fillText(narrow ? t("rb-q-x-n", "globe's scatter (s)") : t("rb-q-x", "globe's scatter for this earthquake (s), one curve for all"), pl + Wp / 2, H - 22);
  ctx.save(); ctx.translate(11, top + Hp / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t("rb-q-y", "best flat map's scatter (s)"), 0, 0); ctx.restore();
  const s = bulkSummary();
  ctx.font = fs(narrow ? 10 : 11, "600 "); ctx.textAlign = "left"; ctx.fillStyle = INK;
  const head = t("rb-q-t", "one dot per earthquake: the globe does better for {w} of {n}", { w: s.winsBest, n: s.n });
  if (narrow) { ctx.fillText(t("rb-q-t1", "one dot per earthquake"), pl, 13); ctx.fillText(t("rb-q-t2", "the globe does better for {w} of {n}", { w: s.winsBest, n: s.n }), pl, 27); }
  else ctx.fillText(head, pl, 15);
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "left";
  ctx.fillText(t("rb-q-leg", "● black: the named earthquakes · log scales"), pl, H - 6);
}

/** Le tableau de la synthèse P. */
export function fillBulkTable(tb, t, lang) {
  if (!tb) return;
  const s = bulkSummary(), Pq = BULK_P.perq, C = BULK_P.common;
  const row = (lbl, k, wq, wc) => `<tr><td>${lbl}</td><td class="num">${num(lang, Pq[k].rms, 1)} s</td><td class="num">${num(lang, C[k].rms, 1)} s</td>` +
    `<td class="num">${num(lang, C[k].n)}</td><td class="num">${num(lang, C[k].ex)}</td><td class="num">${wq === null ? "" : `${wq} / ${s.n}`}</td><td class="num">${wc === null ? "" : `${wc} / ${s.n}`}</td></tr>`;
  tb.innerHTML = row(t("rb-tab-g", "Globe"), "globe", null, null) +
    row(t("rb-tab-p", "Flat, North Pole map"), "pole", s.winsPoleQ, s.winsPole) +
    row(t("rb-tab-b", "Flat, best single map ({c})", { c: ll(BULK_P.cbest, lang) }), "best", s.winsBestQ, s.winsBest);
}

/** La zone d'ombre de toutes les stations : la part des stations avec une P directe, selon la distance. */
export function drawBulkShadow(cv, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const narrow = W < 500, pl = 40, pr = 12, top = 26, gap = 34, hB = (H - top - gap - 34) / 2;
  const S = BULK_SHADOW, h = S.hist, bin = h.bin;
  const band = (y0, arr, xmax, col, label, edge, edgeLbl) => {
    const X = (d) => pl + (d / xmax) * (W - pl - pr), Y = (v) => y0 + hB - v * hB;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.strokeRect(pl, y0, W - pl - pr, hB);
    const mx = Math.max(...arr.filter((_, i) => i % 2).slice(0, Math.ceil(xmax / bin)));
    for (let i = 0; i * bin < xmax; i++) { const d = arr[2 * i], n = arr[2 * i + 1]; if (!n) continue;
      const a = 0.25 + 0.75 * Math.sqrt(n / mx); ctx.fillStyle = col.replace("A", a.toFixed(3));
      ctx.fillRect(X(i * bin) + 0.3, Y(d / n), X(bin) - X(0) - 0.6, Y(0) - Y(d / n)); }
    if (edge) { ctx.beginPath(); ctx.moveTo(X(edge), y0); ctx.lineTo(X(edge), y0 + hB); ctx.strokeStyle = INK; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
      ctx.font = fs(9.5); ctx.fillStyle = INK; ctx.textAlign = "left"; ctx.fillText(edgeLbl, X(edge) + 4, y0 + 12); }
    ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "right";
    for (const v of [0, 0.5, 1]) ctx.fillText(`${v * 100}`, pl - 4, Y(v) + 3);
    ctx.textAlign = "center"; const st = xmax > 200 ? 60 : 30;
    for (let d = 0; d <= xmax; d += st) ctx.fillText(`${d}°`, X(d), y0 + hB + 12);
    ctx.font = fs(narrow ? 10 : 11, "600 "); ctx.fillStyle = col.replace("A", "1"); ctx.textAlign = "left"; ctx.fillText(label, pl + 2, y0 - 6);
  };
  band(top, h.globe, 180, "rgba(15,118,110,A)", t("rb-s-g", "globe: angle from the epicentre"), S.globe.edge || 103, t("rb-s-edge", "103°, no fit"));
  band(top + hB + gap, h.common, 360, "rgba(180,83,9,A)", narrow ? t("rb-s-f-n", "best flat map, one ring ({c})", { c: ll(S.common.c, lang) }) : t("rb-s-f", "best flat map for one ring ({c}): distance on the disc", { c: ll(S.common.c, lang) }), S.common.commonR, t("rb-s-ring", "its ring, {r}°", { r: num(lang, S.common.commonR, 0) }));
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  ctx.fillText(narrow ? t("rb-s-x-n", "distance from the epicentre (°)") : t("rb-s-x", "distance from the epicentre; bar height: % of stations with a direct P; paler: fewer stations"), (pl + W - pr) / 2, H - 4);
  ctx.save(); ctx.translate(10, top + hB + gap / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t("rb-s-y", "% with a direct P"), 0, 0); ctx.restore();
}

/** Les nombres de l'ombre : stations du mauvais côté. */
export function shadowBulkSummary() {
  const S = BULK_SHADOW, n = S.quakes.reduce((a, q) => a + q[2], 0), w = (f) => Math.round((1 - f) * n);
  return { quakes: S.quakes.length, n, globe: w(S.globe.fixedAll), globeBest: w(S.globe.bestAll), globeR: S.globe.bestR,
    pole: w(S.pole.common), poleR: S.pole.commonR, best: w(S.common.common), bestR: S.common.commonR, own: w(S.own.ownAll), ownC: S.own.c, bestC: S.common.c };
}

export function fillShadowBulkRead(el, t, lang) {
  if (!el) return;
  const s = shadowBulkSummary();
  el.innerHTML = `<span>${t("rb-sr-n", "{q} earthquakes, {n} stations", { q: s.quakes, n: num(lang, s.n) })}</span>` +
    `<span class="g">${t("rb-sr-g", "globe, 103° (no fit): {a} wrong · one ring for all ({r}°): {b}", { a: num(lang, s.globe), b: num(lang, s.globeBest), r: num(lang, s.globeR, 1) })}</span>` +
    `<span class="f">${t("rb-sr-f", "best flat map, one ring: {a} wrong · North Pole map: {p} · one ring per earthquake: {o}", { a: num(lang, s.best), p: num(lang, s.pole), o: num(lang, s.own) })}</span>`;
}

/** La boîte du rayon de toutes les arrivées de Rayleigh : à part, en plus des boîtes par séisme. */
export function drawBulkRadius(host, t) {
  if (!host) return;
  const C = FIG.C, R = BULK_RADIUS;
  const rows = [[t("rb-r-all", "every arrival"), R.all], [t("rb-r-allc", "every arrival, path-corrected"), R.allc],
    [t("rb-r-med", "one median per earthquake"), R.med], [t("rb-r-medc", "the same, path-corrected"), R.medc]];
  const rowH = 38, topY = 40, n = rows.length, lastY = topY + (n - 1) * rowH;
  const gridBottom = lastY + 24, tickY = gridBottom + 18, trueLabelY = tickY + 18, H = trueLabelY + 26;
  const f = FIG.make({ w: 380, h: H, alt: t("rb-r-alt", "Box plots of the Earth's radius from every Rayleigh-wave arrival of {q} large shallow earthquakes, with and without the ocean/continent correction, and of the per-earthquake medians", { q: R.quakes }) });
  const VMAX = 10000, X0 = 150, X1 = 360, bx = (v) => Math.max(X0 - 6, Math.min(X1 + 10, X0 + (v / VMAX) * (X1 - X0)));
  [0, 2500, 5000, 7500, 10000].forEach((v) => { f.dash(bx(v), 22, bx(v), gridBottom, { c: "#e7e3da", dash: "3 3" }); f.note(bx(v), tickY, (v / 1000).toFixed(1), { anchor: "middle" }); });
  f.line(bx(6371), 18, bx(6371), gridBottom + 4, { c: C.globe, w: 1.6 });
  f.note(bx(6371) + 5, trueLabelY, "6371 km", { c: C.globe });
  rows.forEach(([lbl, s], i) => {
    const y = topY + i * rowH, col = i % 2 ? C.globe : C.ink;
    f.note(X0 - 10, y + 1, lbl, { anchor: "end", c: col, size: 9.5 });
    f.note(X0 - 10, y + 13, `n = ${s.n.toLocaleString("en-US")}`, { anchor: "end", size: 9 });
    f.line(bx(s.lo), y, bx(s.hi), y, { c: col, w: 1.2 });
    f.line(bx(s.lo), y - 6, bx(s.lo), y + 6, { c: col, w: 1.2 }); f.line(bx(s.hi), y - 6, bx(s.hi), y + 6, { c: col, w: 1.2 });
    f.path(`M${bx(s.q1)} ${y - 9} H${bx(s.q3)} V${y + 9} H${bx(s.q1)} Z`, { c: col, w: 1.6, fill: "none" });
    f.line(bx(s.med), y - 9, bx(s.med), y + 9, { c: col, w: 2.6 });
  });
  f.note(4, trueLabelY, t("sq-radius-axis", "radius (thousand km)"));
  f.notToScale(t("rb-r-stamp", "{q} earthquakes 2000–2023, outliers not drawn", { q: R.quakes }));
  f.mountIn(host);
}

export function fillRadiusBulkRead(el, t, lang) {
  if (!el) return;
  const R = BULK_RADIUS, pc = (v) => { const p = ((v - 6371) / 6371) * 100; return `${p >= 0 ? "+" : "−"}${num(lang, Math.abs(p), 1)}`; };
  el.innerHTML = `<span>${t("rb-rr-n", "{n} arrivals, {q} earthquakes", { n: num(lang, R.all.n), q: R.quakes })}</span>` +
    `<span class="g">${t("rb-rr-m", "median {v} km ({p} %), path-corrected {c} km ({pc} %)", { v: num(lang, R.all.med), p: pc(R.all.med), c: num(lang, R.allc.med), pc: pc(R.allc.med) })}</span>` +
    `<span>${t("sq-radius-read-true", "true: 6,371 km")}</span>`;
}
