// Vitrine de l'onglet seis (propriétaire, 2026-10-29 : « une animation vitrine de l'onglet séisme : présenter notre
// approche, nos résultats »). Neuf scènes, toutes tirées des pré-calculs de la page, rien d'inventé : l'onde d'un vrai
// séisme (Tōhoku 2011) qui allume les vraies stations à leur heure enregistrée ; les quatre mouvements du sol à ANMO
// (seis-waves) ; notre centre trouvé sans catalogue ni
// rayon ; tous les grands séismes peu profonds sous une seule courbe (seis-bulk) ; séisme par séisme ; toutes les
// cartes plates offertes ; la zone d'ombre de toutes les stations ; le rayon des ondes de surface ; le bilan.
// Cadre : core/reel.js.
import { makeReel, label, REEL_COL, ease, clamp } from "../../core/reel.js";
import { coastLines } from "../../core/globe25d.js";
import { RELOC_QUAKES, curve } from "./relocate.js";
import { BULK_P, BULK_SHADOW, BULK_RADIUS } from "../../data/presets/seis-bulk.js";
import { SEIS_WAVES } from "../../data/presets/seis-waves.js";

const TEAL = "#0f766e", AMBER = REEL_COL.flat, D2R = Math.PI / 180;

const EN = {
  "sr-schem": "real data throughout; globes in true proportion",
  "sr-wave-k": "The clocks",
  "sr-wave-a": "An earthquake is one tick heard by hundreds of clocks.",
  "sr-wave-b": "Each station writes down when the wave arrived. We keep only that time, and the station's latitude and longitude.",
  "sr-kinds-k": "Four motions",
  "sr-kinds-a": "Each kind of wave moves the ground its own way.",
  "sr-kinds-b": "Three components tell them apart with no travel-time table: P along the ray, S and Love across it, Rayleigh rolling on an ellipse.",
  "sr-centre-k": "No catalogue",
  "sr-centre-a": "We find each earthquake's centre ourselves.",
  "sr-centre-b": "It is the point from which the times fall on one curve. No catalogue, no radius, and every flat map gets the same freedom.",
  "sr-law-k": "One law",
  "sr-law-a": "{{n}} earthquakes, {{st}} stations, one curve for all.",
  "sr-law-b": "Real clocks miss the globe's curve by {{g}} s. On the best flat map they miss by {{b}} s.",
  "sr-quakes-k": "One by one",
  "sr-quakes-a": "Earthquake by earthquake, the same verdict.",
  "sr-quakes-b": "The globe does better for {{w}} of the {{n}}. Each dot above the line is one earthquake the flat map gets worse.",
  "sr-maps-k": "Any map",
  "sr-maps-a": "The flat model may choose where its map is centred.",
  "sr-maps-b": "Of {{nscan}} centres tried, the best still misses {{xr}} times as much as the globe.",
  "sr-shadow-k": "The shadow",
  "sr-shadow-a": "Beyond one angle, the direct wave never arrives.",
  "sr-shadow-b": "{{sn}} stations: on the globe the edge is sharp, the same for every earthquake. On a flat map it smears.",
  "sr-size-k": "The size",
  "sr-size-a": "Surface waves give the size of the Earth.",
  "sr-size-b": "{{rn}} arrivals of {{rq}} earthquakes: median {{rm}} km, against 6,371 km.",
  "sr-end-k": "",
  "sr-end-a": "Same clocks, same freedom, two shapes.",
  "sr-end-b": "Only the sphere makes the arrival times agree.",
  "sr-globe": "globe", "sr-flat": "flat, best map", "sr-pole": "flat, North Pole map", "sr-sec": "s", "sr-dist": "distance from the trial centre", "sr-time": "arrival time",
  "sr-diag": "as good as the globe", "sr-darker": "darker: the flat map misses more",
  "sr-r1": "every arrival", "sr-r2": "path-corrected", "sr-r3": "one median per earthquake", "sr-r4": "the same, corrected", "sr-better": "globe better", "sr-km": "radius, thousand km",
  "sr-alt": "Animation: the P wave of the 2011 Tōhoku earthquake lighting real stations on a globe; a trial centre sliding until the arrival times fall on one curve; the residuals of every large shallow earthquake under one curve, narrow for the globe and wide for the best flat map; one dot per earthquake above the line of equality; a map of every flat-map centre tried; the share of stations with a direct P wave against distance; the radius from every surface-wave arrival; a summary",
};

const nf = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Les nombres des textes, lus dans les pré-calculs. */
export function reelValues(lang) {
  const Q = BULK_P.quakes, C = BULK_P.common, S = BULK_SHADOW, R = BULK_RADIUS;
  return { n: nf(lang, Q.length), st: nf(lang, C.globe.n + C.globe.ex), g: nf(lang, C.globe.rms, 1), b: nf(lang, C.best.rms, 1),
    w: nf(lang, Q.filter((r) => r[8] < r[10]).length), nscan: nf(lang, BULK_P.scan.length), xr: nf(lang, C.best.rms / C.globe.rms, 0),
    sn: nf(lang, S.quakes.reduce((a, q) => a + q[2], 0)), rn: nf(lang, R.all.n), rq: nf(lang, R.quakes), rm: nf(lang, R.all.med) };
}

// ---- le globe orthographique (une vue de la vraie sphère : rien n'est étiré, règle 1) ----
const vec = (la, lo) => [Math.cos(la * D2R) * Math.cos(lo * D2R), Math.cos(la * D2R) * Math.sin(lo * D2R), Math.sin(la * D2R)];
function ortho(lat0, lon0, cx, cy, r) {
  const c = vec(lat0, lon0), e = [-Math.sin(lon0 * D2R), Math.cos(lon0 * D2R), 0], n = [c[1] * e[2] - c[2] * e[1], c[2] * e[0] - c[0] * e[2], c[0] * e[1] - c[1] * e[0]];
  return (la, lo) => { const p = vec(la, lo), z = p[0] * c[0] + p[1] * c[1] + p[2] * c[2];
    return [cx + r * (p[0] * e[0] + p[1] * e[1] + p[2] * e[2]), cy - r * (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]), z > 0]; };
}
function direct(lat, lon, az, d) {
  const p1 = lat * D2R, t = az * D2R, s = d * D2R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(s) + Math.cos(p1) * Math.sin(s) * Math.cos(t));
  return [p2 / D2R, lon + Math.atan2(Math.sin(t) * Math.sin(s) * Math.cos(p1), Math.cos(s) - Math.sin(p1) * Math.sin(p2)) / D2R];
}
const gc = (a1, o1, a2, o2) => { const p = vec(a1, o1), q = vec(a2, o2); return Math.acos(clamp(p[0] * q[0] + p[1] * q[1] + p[2] * q[2], -1, 1)) / D2R; };

function globe(ctx, P, cx, cy, r) {
  ctx.fillStyle = "#eef6f4"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = "rgba(15,118,110,.35)"; ctx.lineWidth = 0.8;
  for (const line of coastLines()) { ctx.beginPath(); let pen = false;
    for (const pt of line) { if (!pt) { pen = false; continue; } const [x, y, v] = P(pt[0], pt[1]); if (!v) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; }
    ctx.stroke(); }
  ctx.strokeStyle = "rgba(21,26,33,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
}
function ring(ctx, P, lat, lon, d, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); let pen = false;
  for (let az = 0; az <= 360; az += 3) { const [a, o] = direct(lat, lon, az, d), [x, y, v] = P(a, o); if (!v) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; }
  ctx.stroke();
}
function star(ctx, x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * D2R, rr = i % 2 ? r * 0.45 : r; ctx[i ? "lineTo" : "moveTo"](x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fill();
}

const TQ = RELOC_QUAKES.find((q) => q.key === "tohoku2011") || RELOC_QUAKES[0];
const KEPT = TQ.pP.filter((r) => r[3] === 1);

function sceneWave(ctx, b, u, d, T, fs) {
  const r = Math.min(b.w, b.h) * 0.46, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const P = ortho(TQ.P.lat - 25, TQ.P.lon + 25 * u / d, cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const dd = 100 * ease(u / (d * 0.85)), tf = curve(TQ.P.coef, Math.max(25, dd));
  for (const s of KEPT) { const [x, y, v] = P(s[0], s[1]); if (!v) continue; const on = dd >= 25 && s[2] <= tf;
    ctx.beginPath(); ctx.arc(x, y, on ? fs * 0.13 : fs * 0.09, 0, 2 * Math.PI); ctx.fillStyle = on ? TEAL : "#fff"; ctx.fill(); ctx.strokeStyle = on ? TEAL : "#8b93a0"; ctx.lineWidth = 0.7; ctx.stroke(); }
  if (dd > 0.5) ring(ctx, P, TQ.P.lat, TQ.P.lon, dd, TEAL, Math.max(2, fs * 0.12));
  const [ex, ey] = P(TQ.P.lat, TQ.P.lon); star(ctx, ex, ey, fs * 0.45, REEL_COL.ink);
  label(ctx, `${TQ.name} · ${nf(T.lang, KEPT.filter((s) => dd >= 25 && s[2] <= tf).length)} / ${nf(T.lang, KEPT.length)}`, cx, b.y + b.h - fs * 0.3, { size: fs * 0.55, col: REEL_COL.soft });
}

const HODO = SEIS_WAVES.shown.ANMO;
const KCOL = { P: "#1d4ed8", S: "#1d4ed8", Love: "#7c3aed", Rayleigh: "#be185d" };
function sceneKinds(ctx, b, u, d, T, fs) {
  const n = HODO.wins.length, cols = b.w > b.h * 1.4 ? n : 2, rows = Math.ceil(n / cols), cw = b.w / cols, ch = b.h / rows;
  HODO.wins.forEach((w, i) => {
    const k = ease((u - 0.3 - i * 1.1) / 1.4); if (k <= 0) return;
    const side = Math.min(cw, ch) * 0.7, ox = b.x + (i % cols) * cw + cw / 2, oy = b.y + Math.floor(i / cols) * ch + ch / 2 + fs * 0.2;
    const plane = w.kind === "P" || w.kind === "Rayleigh" || (w.kind === "S" && w.trans < 0.5), ys = plane ? w.Z : w.T;
    ctx.strokeStyle = "rgba(21,26,33,.12)"; ctx.lineWidth = 1; ctx.strokeRect(ox - side / 2, oy - side / 2, side, side);
    ctx.strokeStyle = KCOL[w.kind]; ctx.lineWidth = Math.max(1.6, fs * 0.08); ctx.beginPath();
    const m = Math.max(2, Math.round(w.R.length * k));
    for (let j = 0; j < m; j++) { const x = ox + (w.R[j] * side) / 2, y = oy - (ys[j] * side) / 2; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    label(ctx, w.kind, ox, oy - side / 2 - fs * 0.5, { size: fs * 0.7, col: REEL_COL.ink, weight: 800 });
    label(ctx, `${nf(T.lang, w.period, 0)} s`, ox, oy + side / 2 + fs * 0.5, { size: fs * 0.5, col: REEL_COL.soft, weight: 600 });
  });
}

function sceneCentre(ctx, b, u, d, T, fs) {
  const half = b.w / 2, r = Math.min(half, b.h) * 0.42, cx = b.x + half / 2, cy = b.y + b.h / 2;
  const P = ortho(TQ.P.lat - 25, TQ.P.lon + 25, cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const k = ease((u - 0.6) / (d * 0.7)), c = [TQ.P.lat - 14 * (1 - k), TQ.P.lon + 22 * (1 - k)];
  for (const s of KEPT) { const [x, y, v] = P(s[0], s[1]); if (v) { ctx.fillStyle = TEAL; ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); } }
  ring(ctx, P, c[0], c[1], 40, "rgba(180,83,9,.7)", 1.4); ring(ctx, P, c[0], c[1], 70, "rgba(180,83,9,.7)", 1.4);
  const [sx, sy] = P(c[0], c[1]); star(ctx, sx, sy, fs * 0.45, AMBER);
  // t contre la distance au centre essayé
  const x0 = b.x + half + fs * 1.2, x1 = b.x + b.w - fs * 0.4, y0 = b.y + b.h * 0.85, y1 = b.y + b.h * 0.12;
  const ts = KEPT.map((s) => s[2]), tmin = Math.min(...ts), tmax = Math.max(...ts);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  const X = (dd) => x0 + ((dd - 10) / 100) * (x1 - x0), Y = (t) => y0 - ((t - tmin) / (tmax - tmin)) * (y0 - y1);
  for (const s of KEPT) { const dd = gc(c[0], c[1], s[0], s[1]); if (dd < 10 || dd > 110) continue; ctx.fillStyle = k > 0.97 ? TEAL : AMBER; ctx.fillRect(X(dd) - 1.4, Y(s[2]) - 1.4, 2.8, 2.8); }
  if (k > 0.97) { ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = Math.max(1.5, fs * 0.08); ctx.beginPath();
    for (let dd = 25; dd <= 95; dd += 1) ctx[dd === 25 ? "moveTo" : "lineTo"](X(dd), Y(curve(TQ.P.coef, dd))); ctx.stroke(); }
  label(ctx, T("sr-dist"), (x0 + x1) / 2, y0 + fs * 0.6, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  label(ctx, T("sr-time"), x0, y1 - fs * 0.5, { size: fs * 0.45, col: REEL_COL.soft, align: "left", weight: 500 });
}

function sceneLaw(ctx, b, u, d, T, fs) {
  const C = BULK_P.common, lim = 40, k = ease((u - 0.3) / (d * 0.5));
  const share = (h) => { const n = h.reduce((a, x) => a + x, 0); return h.map((x) => (100 * x) / n); };
  const S = [[share(C.globe.hist), TEAL, [], T("sr-globe"), C.globe.rms], [share(C.best.hist), AMBER, [], T("sr-flat"), C.best.rms], [share(C.pole.hist), AMBER, [fs * 0.3, fs * 0.2], T("sr-pole"), C.pole.rms]];
  const ymax = Math.max(...S[0][0]) * 1.1, x0 = b.x + fs * 0.5, x1 = b.x + b.w - fs * 0.3, y0 = b.y + b.h * 0.86, y1 = b.y + b.h * 0.3;
  const X = (r) => x0 + ((r + lim) / (2 * lim)) * (x1 - x0), Y = (v) => y0 - (v / ymax) * (y0 - y1) * k;
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  for (const [y, col, dash] of S.slice().reverse()) {
    ctx.beginPath(); for (let i = -lim; i <= lim; i++) { const v = y[i + 60]; ctx[i === -lim ? "moveTo" : "lineTo"](X(i - 0.5), Y(v)); ctx.lineTo(X(i + 0.5), Y(v)); }
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, fs * 0.11); ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  }
  for (const r of [-40, -20, 0, 20, 40]) label(ctx, `${r > 0 ? "+" : ""}${r} ${T("sr-sec")}`, X(r), y0 + fs * 0.55, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  S.forEach(([, col, , name, rms], i) => label(ctx, `${name}: ${nf(T.lang, rms, 1)} s`, x0, b.y + fs * (0.5 + 0.85 * i), { size: fs * 0.62, col, align: "left", weight: 800 }));
}

function sceneQuakes(ctx, b, u, d, T, fs) {
  const Q = BULK_P.quakes, lo = 0.3, hi = 100, L = (v) => Math.log10(clamp(v, lo, hi));
  const side = Math.min(b.w, b.h) * 0.86, x0 = b.x + (b.w - side) / 2 + fs * 0.6, y0 = b.y + (b.h + side) / 2 - fs * 0.4, s = side - fs;
  const X = (v) => x0 + ((L(v) - L(lo)) / (L(hi) - L(lo))) * s, Y = (v) => y0 - ((L(v) - L(lo)) / (L(hi) - L(lo))) * s;
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.strokeRect(x0, y0 - s, s, s);
  ctx.setLineDash([fs * 0.25, fs * 0.18]); ctx.beginPath(); ctx.moveTo(X(lo), Y(lo)); ctx.lineTo(X(hi), Y(hi)); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, T("sr-diag"), X(8), Y(3.2), { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
  const n = Math.round(Q.length * ease((u - 0.2) / (d * 0.7)));
  let w = 0;
  for (let i = 0; i < n; i++) { const r = Q[i]; if (r[8] < r[10]) w++;
    ctx.beginPath(); ctx.arc(X(r[8]), Y(r[10]), Math.max(2, fs * 0.12), 0, 2 * Math.PI); ctx.fillStyle = r[11] ? REEL_COL.ink : "rgba(180,83,9,.6)"; ctx.fill(); }
  label(ctx, `${T("sr-better")}: ${nf(T.lang, w)} / ${nf(T.lang, n)}`, x0 + fs * 0.3, y0 - s + fs * 0.6, { size: fs * 0.6, col: REEL_COL.ink, align: "left", weight: 800 });
  for (const v of [1, 10, 100]) { label(ctx, `${v} s`, X(v), y0 + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 }); label(ctx, `${v}`, x0 - fs * 0.4, Y(v), { size: fs * 0.42, col: REEL_COL.soft, align: "right", weight: 500 }); }
  label(ctx, T("sr-globe"), x0 + s / 2, y0 + fs * 1.05, { size: fs * 0.48, col: TEAL });
  ctx.save(); ctx.translate(x0 - fs * 1.9, y0 - s / 2); ctx.rotate(-Math.PI / 2); label(ctx, T("sr-flat"), 0, 0, { size: fs * 0.48, col: AMBER }); ctx.restore();
}

function sceneMaps(ctx, b, u, d, T, fs) {
  const W = b.w, H = Math.min(b.h * 0.8, W / 2), x0 = b.x, y0 = b.y + (b.h - H) / 2;
  const X = (lo) => x0 + ((lo + 180) / 360) * W, Y = (la) => y0 + ((90 - la) / 180) * H;
  const g = BULK_P.common.globe.rms, rows = BULK_P.scan, hiR = Math.max(...rows.map((r) => r[2])), loR = Math.min(...rows.map((r) => r[2]));
  const col = (v) => { const t = clamp(Math.log(v / loR) / Math.log(hiR / loR)); const a = [253, 236, 200], z = [140, 45, 4]; return `rgb(${a.map((x, i) => Math.round(x + (z[i] - x) * t)).join(",")})`; };
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, W, H);
  const n = Math.round(rows.length * ease((u - 0.2) / (d * 0.6)));
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip();
  for (let i = 0; i < n; i++) { const [la, lo, v] = rows[i], big = i < 163; ctx.fillStyle = col(v);
    if (big) for (const sh of [0, 360]) ctx.fillRect(X(lo - 10 + sh), Y(la + 10), (W / 360) * 20 + 0.5, (H / 180) * 20 + 0.5); else ctx.fillRect(X(lo) - fs * 0.15, Y(la) - fs * 0.15, fs * 0.3, fs * 0.3); }
  ctx.restore();
  ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.lineWidth = 0.7;
  for (const line of coastLines()) { ctx.beginPath(); let prev = null;
    for (const pt of line) { if (!pt) { prev = null; continue; } const x = X(pt[1]), y = Y(pt[0]); if (prev !== null && Math.abs(pt[1] - prev) < 180) ctx.lineTo(x, y); else ctx.moveTo(x, y); prev = pt[1]; }
    ctx.stroke(); }
  if (n === rows.length) { const c = BULK_P.cbest; ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.12); ctx.beginPath(); ctx.arc(X(c[1]), Y(c[0]), fs * 0.5, 0, 2 * Math.PI); ctx.stroke(); }
  label(ctx, `${T("sr-globe")} ${nf(T.lang, g, 1)} s · ${T("sr-flat")} ${nf(T.lang, BULK_P.common.best.rms, 1)} s`, x0 + W / 2, y0 + H + fs * 0.7, { size: fs * 0.55, col: REEL_COL.ink, weight: 700 });
  label(ctx, T("sr-darker"), x0 + W / 2, y0 + H + fs * 1.4, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
}

function sceneShadow(ctx, b, u, d, T, fs) {
  const h = BULK_SHADOW.hist, gap = fs * 1.9, hB = (b.h - gap - fs * 3) / 2, k = ease((u - 0.2) / (d * 0.6));
  const band = (y0, arr, xmax, rgb, name) => {
    const X = (dd) => b.x + (dd / xmax) * b.w * k, n = Math.ceil(xmax / 2);
    const mx = Math.max(...arr.filter((_, i) => i % 2).slice(0, n));
    for (let i = 0; i < n; i++) { const dn = arr[2 * i], tot = arr[2 * i + 1]; if (!tot) continue; const v = dn / tot;
      ctx.fillStyle = `rgba(${rgb},${(0.25 + 0.75 * Math.sqrt(tot / mx)).toFixed(3)})`; ctx.fillRect(b.x + (i * 2 / xmax) * b.w, y0 + hB * (1 - v), (2 / xmax) * b.w * 0.85, hB * v); }
    ctx.fillStyle = REEL_COL.paper; ctx.fillRect(X(xmax), y0 - 1, b.x + b.w - X(xmax) + 2, hB + 2);
    ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x, y0 + hB); ctx.lineTo(b.x + b.w, y0 + hB); ctx.stroke();
    label(ctx, name, b.x, y0 - fs * 0.35, { size: fs * 0.55, col: `rgb(${rgb})`, align: "left", weight: 800 });
    for (const dd of xmax > 200 ? [0, 120, 240, 360] : [0, 60, 120, 180]) label(ctx, `${dd}°`, b.x + (dd / xmax) * b.w, y0 + hB + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  };
  band(b.y + fs * 0.9, h.globe, 180, "15,118,110", T("sr-globe"));
  band(b.y + fs * 0.9 + hB + gap, h.common, 360, "180,83,9", T("sr-flat"));
}

function sceneSize(ctx, b, u, d, T, fs) {
  const R = BULK_RADIUS, rows = [[R.all, REEL_COL.ink, "sr-r1"], [R.allc, TEAL, "sr-r2"], [R.med, REEL_COL.ink, "sr-r3"], [R.medc, TEAL, "sr-r4"]];
  const x0 = b.x + fs * 0.5, x1 = b.x + b.w - fs * 0.5, X = (v) => x0 + (v / 10000) * (x1 - x0), rowH = Math.min(fs * 2.2, b.h / 6), y0 = b.y + b.h / 2 - rowH * 1.5;
  ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.beginPath(); ctx.moveTo(X(6371), y0 - rowH * 0.8); ctx.lineTo(X(6371), y0 + rowH * 3.6); ctx.stroke();
  label(ctx, "6 371 km", X(6371), y0 - rowH, { size: fs * 0.5, col: TEAL, weight: 700 });
  rows.forEach(([s, col, lk], i) => {
    const k = ease((u - 0.3 - i * 0.5) / 1.2); if (k <= 0) return;
    const y = y0 + i * rowH, m = X(s.med), sc = (v) => m + (X(v) - m) * k, hh = rowH * 0.28;
    ctx.globalAlpha = k; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.4, fs * 0.07);
    ctx.beginPath(); ctx.moveTo(sc(s.lo), y); ctx.lineTo(sc(s.hi), y); ctx.stroke();
    ctx.strokeRect(sc(s.q1), y - hh, sc(s.q3) - sc(s.q1), 2 * hh);
    ctx.lineWidth = Math.max(2.5, fs * 0.14); ctx.beginPath(); ctx.moveTo(m, y - hh); ctx.lineTo(m, y + hh); ctx.stroke();
    label(ctx, T(lk), x0, y, { size: fs * 0.48, col, align: "left", weight: 600 }); ctx.globalAlpha = 1;
  });
  for (const v of [0, 2500, 5000, 7500, 10000]) label(ctx, nf(T.lang, v / 1000, 1), X(v), y0 + rowH * 3.9, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  label(ctx, T("sr-km"), (x0 + x1) / 2, y0 + rowH * 4.5, { size: fs * 0.45, col: REEL_COL.soft, weight: 500 });
}

function sceneEnd(ctx, b, u, d, T, fs) {
  const C = BULK_P.common, r = Math.min(b.w / 2, b.h) * 0.36, cy = b.y + b.h * 0.45;
  const gx = b.x + b.w * 0.27, fx = b.x + b.w * 0.73;
  const P = ortho(20, 140 + 30 * u / d, gx, cy, r); globe(ctx, P, gx, cy, r);
  ctx.fillStyle = "#fff7ed"; ctx.strokeStyle = AMBER; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(fx, cy, r, r * 0.32, 0, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  const k = ease((u - 0.4) / 1.2);
  ctx.globalAlpha = k;
  label(ctx, `${nf(T.lang, C.globe.rms, 1)} s`, gx, cy + r + fs * 1.1, { size: fs * 1.1, col: TEAL, weight: 800 });
  label(ctx, `${nf(T.lang, C.best.rms, 1)} s`, fx, cy + r + fs * 1.1, { size: fs * 1.1, col: AMBER, weight: 800 });
  label(ctx, T("sr-globe"), gx, cy + r + fs * 2.1, { size: fs * 0.5, col: TEAL, weight: 600 });
  label(ctx, T("sr-flat"), fx, cy + r + fs * 2.1, { size: fs * 0.5, col: AMBER, weight: 600 });
  ctx.globalAlpha = 1;
}

export const SEIS_SCENES = [{ key: "wave", d: 7 }, { key: "kinds", d: 6.5 }, { key: "centre", d: 7 }, { key: "law", d: 7 }, { key: "quakes", d: 6.5 }, { key: "maps", d: 6.5 }, { key: "shadow", d: 7 }, { key: "size", d: 6.5 }, { key: "end", d: 4.5, num: false }];
export const SEIS_DRAW = { wave: sceneWave, kinds: sceneKinds, centre: sceneCentre, law: sceneLaw, quakes: sceneQuakes, maps: sceneMaps, shadow: sceneShadow, size: sceneSize, end: sceneEnd };
const REEL = makeReel({ scenes: SEIS_SCENES, draw: SEIS_DRAW, prefix: "sr", still: 20.5 + 5 });   // à l'arrêt : une courbe pour tous, déjà tracée
export const SEIS_REEL_T = REEL.total;
export const drawSeisReel = REEL.drawReel;
export const SEIS_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = reelValues. */
export function mountSeisReel(canvas, tr, lang) {
  const vals = reelValues(lang);
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("sr-alt"));
  return REEL.mountReel(canvas, T);
}
