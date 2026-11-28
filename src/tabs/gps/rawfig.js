// Figures du panneau « récepteurs GPS bruts » (epic16/UC03), canvas 2D.
//  gpsRawMap : où sont les stations (carte plate, seulement pour LOCALISER) et la
//    distribution des résidus de pseudo-distance, en mètres (si la géométrie était
//    fausse : des kilomètres) ;
//  gpsRawFit : écart de chaque station à la sphère ajustée selon la latitude (l'écart
//    qui reste est l'aplatissement), avec les rms de la sphère et du plan ;
//  gpsRawVis : frise des satellites vus par deux stations lointaines (sans orbite).
// Tous les nombres viennent de rawlogic.js et de data/presets/gps-raw.js.
import { drawFitBox } from "../../core/fitbox.js";
import { heightCorr } from "../rx/grouplogic.js";
import { setupCanvas } from "../../core/canvas.js";
import { coastLines } from "../../core/globe25d.js";
import { GPS_RAW } from "../../data/presets/gps-raw.js";
import { earthFromStations, crossVisibility, sharedSky, separationDeg } from "./rawlogic.js";
import { colors, label, wrapLabel, dot, INK, SOFT } from "../avia/draw.js";
import { num } from "../curv/fmt.js";

let cache = null;
export function rawData() {
  if (cache) return cache;
  const S = GPS_RAW.stations, earth = earthFromStations(S);
  // la paire montrée en frise : une station des États-Unis et une d'Australie (l'exemple de la demande) ; à défaut, la plus éloignée nord-sud
  const by = Object.fromEntries(S.map((s) => [s.id, s]));
  let A = by.NLIB, B = by.ALIC;
  if (!A || !B) {
    let best = null;
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) { if (!(S[i].lat > 20 && S[j].lat < -20)) continue; const d = separationDeg(S[i].xyz, S[j].xyz); if (!best || d > best.d) best = { i, j, d }; }
    if (best) { A = S[best.i]; B = S[best.j]; }
  }
  const pair = A && B && { A, B, deg: separationDeg(A.xyz, B.xyz), km: separationDeg(A.xyz, B.xyz) * Math.PI / 180 * earth.R / 1000, vis: crossVisibility(A, B) };
  const share = sharedSky(S, earth.R);
  cache = { raw: GPS_RAW, earth, pair, share };
  return cache;
}

const FONT = "10px system-ui, sans-serif";
const eq = (w) => ({ X: (lon) => w.x0 + (lon + 180) / 360 * (w.x1 - w.x0), Y: (lat) => w.y1 - (lat + 90) / 180 * (w.y1 - w.y0) });

export function mountGpsRaw(root, tr) {
  const cShare = root.querySelector("#gpsRawShare"), cMap = root.querySelector("#gpsRawMap"), cFit = root.querySelector("#gpsRawFit"), cVis = root.querySelector("#gpsRawVis");

  const drawMap = () => {
    const { ctx, W, H } = setupCanvas(cMap);
    if (!W) return;
    const { globe, flat } = colors(cMap), { raw } = rawData(), wide = W > 560;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const m = wide ? { x0: 8, x1: W * 0.58, y0: 28, y1: H - 22 } : { x0: 8, x1: W - 8, y0: 44, y1: H * 0.46 };
    const { X, Y } = eq(m);
    ctx.fillStyle = "#eef3f7"; ctx.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
    ctx.strokeStyle = "#c3ccd6"; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.9;
    for (const line of coastLines()) {
      ctx.beginPath(); let pen = false;
      for (const q of line) { if (!q) { pen = false; continue; } const x = X(q[1]), y = Y(q[0]); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    wrapLabel(ctx, `${raw.stations.length} ${tr("gr-stations", "stations, one day, raw pseudoranges, each solved alone")} (${raw.day})`, m.x0, 12, m.x1 - m.x0, { col: SOFT, font: "11px system-ui, sans-serif", lh: 13 });
    for (const s of raw.stations) { dot(ctx, X(s.lon), Y(s.lat), 3.2, globe); if (W > 820) label(ctx, s.id, X(s.lon) + 4, Y(s.lat) - 5, { al: X(s.lon) > m.x1 - 28 ? "right" : "left", font: "8.5px system-ui, sans-serif", col: "#39414c", halo: true }); }
    // histogramme des résidus
    const R = raw.resid, hx0 = wide ? W * 0.64 : 36, hx1 = W - 12, hy0 = wide ? 48 : H * 0.46 + 52, hy1 = wide ? H - 38 : H - 30;
    const max = Math.max(...R.counts), bw = (hx1 - hx0) / R.counts.length;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx0, hy1); ctx.lineTo(hx1, hy1); ctx.stroke();
    ctx.fillStyle = globe; ctx.globalAlpha = 0.8;
    R.counts.forEach((c, i) => { const h = c / max * (hy1 - hy0); ctx.fillRect(hx0 + i * bw + 0.5, hy1 - h, bw - 1, h); });
    ctx.globalAlpha = 1;
    for (const v of [-30, -10, 0, 10, 30]) label(ctx, num(v), hx0 + (v + 30) / 60 * (hx1 - hx0), hy1 + 10, { al: "center", col: SOFT, font: FONT });
    label(ctx, tr("gr-xm", "pseudorange residual after the fix (m)"), hx1, hy1 + 24, { al: "right", col: SOFT, font: FONT });
    wrapLabel(ctx, `${num(R.n)} ${tr("gr-res", "residuals")}: ${num(R.rms, 2)} m rms, 95 % ${tr("gr-below", "below")} ${num(R.p95, 1)} m, ${tr("gr-max", "largest")} ${num(R.max)} m`, hx0, hy0 - 22, hx1 - hx0, { col: globe, font: "600 11px system-ui, sans-serif", lh: 13 });
    wrapLabel(ctx, tr("gr-km", "if the satellite geometry were wrong, kilometres"), hx1, hy1 - 6, (hx1 - hx0) * 0.55, { al: "right", col: flat, font: FONT, lh: 12, bl: "bottom" });
  };

  const drawFit = () => {
    const { ctx, W, H } = setupCanvas(cFit);
    if (!W) return;
    const { globe, flat } = colors(cFit), E = rawData().earth;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const tw = (W - 24) / 2, ty = 8;
    // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : une sphère ajustée, pas une droite ; la dispersion est le rms
    // r : la hauteur de chaque station au-dessus du meilleur plan contre celle que la sphère ajustée prédit (la flèche)
    const rB = heightCorr(GPS_RAW.stations.map((s) => s.xyz), E.c, E.R);
    const B = drawFitBox(ctx, 8, ty, { R: `${num(E.R / 1000)} km`, range: `± ${num(E.seR / 1000, 1)} km`, r: rB, rOf: tr("gr-rof", "height, sphere"), scatter: `${num(E.rms / 1000, 1)} km rms`, chi2nu: null,
      title: tr("gr-sph2", "sphere through the stations"), col: globe, size: W < 480 ? 9.5 : 10.5, maxW: tw });
    const th = Math.max(50, B.h);
    const tile = (x, big, small, col) => { ctx.fillStyle = "#f3f5f7"; ctx.fillRect(x, ty, tw, th); label(ctx, big, x + 8, ty + 18, { col, font: "600 16px system-ui, sans-serif" }); wrapLabel(ctx, small, x + 8, ty + 34, tw - 12, { col: SOFT, font: FONT, lh: 11 }); };
    tile(16 + tw, `${num(E.plane.rms / 1000)} km`, tr("gr-plane", "rms of the best plane through the same stations"), flat);
    const x0 = 44, x1 = W - 12, y0 = ty + th + 26, y1 = H - 34, span = 16;
    const X = (lat) => x0 + (lat + 90) / 180 * (x1 - x0), Y = (km) => (y0 + y1) / 2 - km / span * (y1 - y0) / 2;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (const k of [-15, -10, -5, 0, 5, 10, 15]) { ctx.beginPath(); ctx.moveTo(x0, Y(k)); ctx.lineTo(x1, Y(k)); ctx.stroke(); label(ctx, num(k), x0 - 4, Y(k), { al: "right", col: SOFT, font: FONT }); }
    for (const l of [-90, -60, -30, 0, 30, 60, 90]) label(ctx, `${num(l)}°`, X(l), y1 + 11, { al: "center", col: SOFT, font: FONT });
    label(ctx, tr("gr-yk", "distance to the fitted sphere (km)"), x0, y0 - 10, { col: SOFT, font: FONT });
    label(ctx, tr("gr-xl", "latitude of the station"), x1, y1 + 24, { al: "right", col: SOFT, font: FONT });
    ctx.strokeStyle = globe; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let l = -90; l <= 90; l += 3) { const y = Y(E.a - E.delta * Math.sin(l * Math.PI / 180) ** 2); l === -90 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); }
    ctx.stroke();
    for (const s of E.stations) dot(ctx, X(s.lat), Y(s.res), 3.6, globe);
    wrapLabel(ctx, `${tr("gr-flat", "what is left is the flattening: the equator is")} ${num(E.delta, 1)} km ${tr("gr-flat2", "farther from the centre than the poles")}; ${tr("gr-after", "scatter after removing it")} ${num(E.deflatedRms, 1)} km`, x1 - 4, y0 + 4, (x1 - x0) * 0.6, { al: "right", col: globe, font: "600 10.5px system-ui, sans-serif", lh: 12 });
  };

  const drawVis = () => {
    const { ctx, W, H } = setupCanvas(cVis);
    if (!W) return;
    const { globe, flat } = colors(cVis), { pair } = rawData();
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    if (!pair) return;
    const V = pair.vis, rows = V.rows, A = "#1d4ed8", B = "#6d28d9", BOTH = globe;
    wrapLabel(ctx, `${pair.A.id} (${num(pair.A.lat, 0)}°, ${num(pair.A.lon, 0)}°) ${tr("gr-and", "and")} ${pair.B.id} (${num(pair.B.lat, 0)}°, ${num(pair.B.lon, 0)}°), ${num(pair.deg)}° ${tr("gr-apart", "apart")} (${num(pair.km)} km): ${tr("gr-both", "satellites seen by both")} ${num(V.common, 1)}, ${tr("gr-onlyA", "by")} ${pair.A.id} ${tr("gr-only", "only")} ${num(V.onlyA, 1)}, ${tr("gr-onlyA", "by")} ${pair.B.id} ${tr("gr-only", "only")} ${num(V.onlyB, 1)} ${tr("gr-avg", "on average")}`, 8, 12, W - 16, { col: INK, font: "600 11px system-ui, sans-serif", lh: 13 });
    const x0 = 34, x1 = W - 10, y0 = 52, y1 = H - 26, rh = (y1 - y0) / rows.length, bw = (x1 - x0) / V.bins;
    const paint = (list, col) => { ctx.fillStyle = col; for (const k of list) ctx.fillRect(x0 + k * bw, 0, Math.max(1, bw), 1); };
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      ctx.fillStyle = "#f3f5f7"; ctx.fillRect(x0, y + 0.5, x1 - x0, Math.max(1, rh - 1));
      for (const [list, col] of [[r.a, A], [r.b, B], [r.both, BOTH]]) { ctx.fillStyle = col; for (const k of list) ctx.fillRect(x0 + k * bw, y + 0.5, Math.max(1, bw + 0.3), Math.max(1, rh - 1)); }
      if (rh >= 7) label(ctx, `G${String(r.prn).padStart(2, "0")}`, x0 - 3, y + rh / 2, { al: "right", col: SOFT, font: "8px system-ui, sans-serif" });
    });
    for (const hh of [0, 6, 12, 18, 24]) label(ctx, `${String(hh).padStart(2, "0")}h`, x0 + hh / 24 * (x1 - x0), y1 + 10, { al: "center", col: SOFT, font: FONT });
    ctx.font = FONT; let lx = x0;
    for (const [c, t] of [[A, `${pair.A.id} ${tr("gr-only", "only")}`], [B, `${pair.B.id} ${tr("gr-only", "only")}`], [BOTH, tr("gr-bothl", "both")]]) { ctx.fillStyle = c; ctx.fillRect(lx, H - 12, 10, 8); label(ctx, t, lx + 14, H - 8, { col: SOFT, font: FONT }); lx += 24 + ctx.measureText(t).width; }
    label(ctx, tr("gr-t", "GPS time, 5-minute bins"), x1, H - 8, { al: "right", col: SOFT, font: FONT });
  };

  const drawShare = () => {
    const { ctx, W, H } = setupCanvas(cShare);
    if (!W) return;
    const { globe, flat } = colors(cShare), { share: X } = rawData();
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const x0 = 40, x1 = W - 12, y0 = 44, y1 = H - 34, ymax = 12;
    const PX = (d) => x0 + d / 180 * (x1 - x0), PY = (v) => y1 - v / ymax * (y1 - y0);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let v = 0; v <= ymax; v += 3) { ctx.beginPath(); ctx.moveTo(x0, PY(v)); ctx.lineTo(x1, PY(v)); ctx.stroke(); label(ctx, num(v), x0 - 4, PY(v), { al: "right", col: SOFT, font: FONT }); }
    for (let d = 0; d <= 180; d += 30) label(ctx, `${num(d)}°`, PX(d), y1 + 11, { al: "center", col: SOFT, font: FONT });
    label(ctx, tr("gr-xs", "angle between the two stations, seen from the centre of the Earth"), x1, y1 + 24, { al: "right", col: SOFT, font: FONT });
    wrapLabel(ctx, `${num(X.pairs.length)} ${tr("gr-pairs", "pairs of stations: satellites tracked by both at the same time, on average")}`, 8, 12, W - 16, { col: INK, font: "600 11px system-ui, sans-serif", lh: 13 });
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = flat; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(PX(X.limit), y0); ctx.lineTo(PX(X.limit), y1); ctx.stroke(); ctx.restore();
    wrapLabel(ctx, `${tr("gr-lim", "geometric limit")} 2·acos(R/a) = ${num(X.limit, 1)}°`, PX(X.limit) - 6, y0 + 8, PX(X.limit) - x0 - 12, { al: "right", col: flat, font: "600 10.5px system-ui, sans-serif", lh: 12 });
    ctx.fillStyle = globe; ctx.globalAlpha = 0.55;
    for (const p of X.pairs) { ctx.beginPath(); ctx.arc(PX(p.deg), PY(Math.min(ymax, p.common)), 2.6, 0, 2 * Math.PI); ctx.fill(); }
    ctx.globalAlpha = 1;
    // l'étiquette tombe dans le nuage de points verts : fond clair sous le texte, vert foncé, halo (lisible sur les points)
    const farT = `${tr("gr-far", "farthest pair that ever tracked the same satellite")}: ${num(X.maxShared, 1)}°`;
    const farF = "600 10.5px system-ui, sans-serif", farX = PX(X.maxShared) - 6, farY = PY(0) - 26, farW = PX(X.maxShared) - x0 - 12;
    ctx.save(); ctx.font = farF;
    const farL = []; let cur = "";
    for (const w of farT.split(" ")) { const nx = cur ? `${cur} ${w}` : w; if (cur && ctx.measureText(nx).width > farW) { farL.push(cur); cur = w; } else cur = nx; }
    if (cur) farL.push(cur);
    const bw = Math.max(...farL.map((l) => ctx.measureText(l).width));
    ctx.fillStyle = "rgba(253,253,252,0.92)"; ctx.strokeStyle = globe; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(farX - bw - 5, farY - farL.length * 12 - 5, bw + 10, farL.length * 12 + 8); ctx.fill(); ctx.stroke();
    ctx.restore();
    wrapLabel(ctx, farT, farX, farY, farW, { al: "right", col: "#0b4f4a", font: farF, lh: 12, bl: "bottom", halo: true });
  };

  const draw = () => { drawMap(); drawFit(); drawVis(); drawShare(); };
  return { draw, start() {}, stop() {} };
}
