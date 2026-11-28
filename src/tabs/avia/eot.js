// Figure 8 (epic14) : l'effet Eötvös dans de vraies données de gravimétrie
// aéroportée (NOAA GRAV-D, bloc EN02, preset avia-gravd.js). Les lignes du
// levé sont volées alternativement vers l'est et vers l'ouest, à 10 km
// l'une de l'autre. On montre, le long de chaque ligne, ce que donne la
// lecture du gravimètre corrigée par trois modèles : aucun (tout modèle
// plat : sur un plan, se déplacer à l'horizontale ne change pas le poids),
// la rotation seule, la rotation et la courbure (le globe). L'animation
// passe d'un modèle à l'autre ; l'échelle verticale suit (imprimée).
// En médaillon : l'écart entre lignes voisines selon le rayon mis dans la
// correction -- le rayon de la Terre, lu dans le poids d'un avion.
import { drawFitBox } from "../../core/fitbox.js";
import { setupCanvas } from "../../core/canvas.js";
import { gravdPairs, pairRms, reduced, fitRadius, fitRotRadius, lineWeights, kScan } from "./logic.js";
import { GRAVD } from "../../data/presets/avia-gravd.js";
import { colors, label, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

const EAST = "#1d4ed8", WEST = "#6d28d9";
const MODELS = [
  { m: { none: true }, k: "eo-m0", fb: "no correction — every flat model" },
  { m: { R: Infinity }, k: "eo-m1", fb: "rotation only, 2Ω·v·cos φ" },
  { m: {}, k: "eo-m2", fb: "globe: rotation + curvature v²/R" },
];

let cache = null;
export function eotData() {
  if (cache) return cache;
  const G = gravdPairs(GRAVD[0].lines);
  const vals = MODELS.map((M) => G.lines.map((l) => l.pts.map((p) => reduced(p, M.m))));
  const rms = MODELS.map((M) => pairRms(G.pairs, M.m));
  cache = { ...G, vals, rms, fit: fitRadius(G.pairs), joint: fitRotRadius(G.pairs), kscan: kScan(G.pairs), weights: lineWeights(G.lines) };
  return cache;
}

const ease = (x) => x * x * (3 - 2 * x);

export function mountEot(root, tr) {
  const cv = root.querySelector("#aviaEot"), btn = root.querySelector("#aviaEotPlay"), sel = root.querySelector("#aviaEotModel");
  const st = { t: 0, hold: 0, from: 0, to: 0, auto: true };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    const D = eotData();
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520;
    const f = ease(st.t), val = (li, pi) => D.vals[st.from][li][pi] * (1 - f) + D.vals[st.to][li][pi] * f;
    // échelle verticale : l'étendue des valeurs affichées, interpolée
    const span = (k) => { let lo = Infinity, hi = -Infinity; for (const L of D.vals[k]) for (const v of L) { lo = Math.min(lo, v); hi = Math.max(hi, v); } return [lo, hi]; };
    const s0 = span(st.from), s1 = span(st.to), lo = s0[0] * (1 - f) + s1[0] * f, hi = s0[1] * (1 - f) + s1[1] * f;
    const px0 = 44, px1 = wide ? W * 0.68 : W - 10, py0 = 34, py1 = wide ? H - 28 : H * 0.62;
    let lon0 = Infinity, lon1 = -Infinity;
    for (const l of D.lines) { lon0 = Math.min(lon0, l.pts[0][0]); lon1 = Math.max(lon1, l.pts.at(-1)[0]); }
    const X = (lon) => px0 + (lon - lon0) / (lon1 - lon0) * (px1 - px0);
    const pad = (hi - lo) * 0.08 + 1, Y = (v) => py1 - (v - (lo - pad)) / (hi - lo + 2 * pad) * (py1 - py0);
    // grille : pas lisible
    const stepV = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000].find((s) => (hi - lo + 2 * pad) / s < 7) || 5000;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let v = Math.ceil((lo - pad) / stepV) * stepV; v <= hi + pad; v += stepV) {
      const y = Y(v); ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px1, y); ctx.stroke();
      label(ctx, num(v), px0 - 4, y, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    }
    label(ctx, "mGal", px0 - 4, py0 - 10, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    for (let lon = Math.ceil(lon0); lon <= lon1; lon++) label(ctx, `${num(-lon)}°W`, X(lon), py1 + 11, { al: "center", col: SOFT, font: "9.5px system-ui, sans-serif" });
    D.lines.forEach((l, li) => {
      ctx.strokeStyle = l.east ? EAST : WEST; ctx.globalAlpha = 0.75; ctx.lineWidth = 1.2; ctx.beginPath();
      l.pts.forEach((p, pi) => { const x = X(p[0]), y = Y(val(li, pi)); pi ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    const cur = st.t < 0.5 ? st.from : st.to;
    const M = MODELS[cur];
    label(ctx, tr(M.k, M.fb), 8, 12, { col: cur === 2 ? globe : cur === 0 ? flat : INK, font: "600 12px system-ui, sans-serif" });
    label(ctx, `${tr("eo-rms", "neighbouring lines, opposite directions, differ by")} ${num(D.rms[cur], D.rms[cur] < 10 ? 1 : 0)} mGal rms`, 8, 26, { col: SOFT, font: "11px system-ui, sans-serif" });
    label(ctx, `■ ${tr("eo-east", "flown east")}`, px1, 12, { al: "right", col: EAST, font: "11px system-ui, sans-serif" });
    label(ctx, `■ ${tr("eo-west", "flown west")}`, px1, 26, { al: "right", col: WEST, font: "11px system-ui, sans-serif" });
    // médaillon : écart rms selon le rayon de la correction
    const ix0 = wide ? W * 0.74 : 44, ix1 = W - 12, iy0 = wide ? 46 : H * 0.72, iy1 = wide ? H - 40 : H - 26;
    const cmax = 100, cx = (km) => ix0 + (Math.log(km) - Math.log(1000)) / (Math.log(30000) - Math.log(1000)) * (ix1 - ix0);
    const cy = (r) => iy1 - Math.min(r, cmax) / cmax * (iy1 - iy0);
    ctx.strokeStyle = "#e3e7ec"; ctx.beginPath(); ctx.moveTo(ix0, iy1); ctx.lineTo(ix1, iy1); ctx.moveTo(ix0, iy0); ctx.lineTo(ix0, iy1); ctx.stroke();
    for (const km of [1000, 3000, 10000, 30000]) label(ctx, num(km), cx(km), iy1 + 10, { al: "center", col: SOFT, font: "9px system-ui, sans-serif" });
    for (const r of [0, 50, 100]) label(ctx, num(r), ix0 - 3, cy(r), { al: "right", col: SOFT, font: "9px system-ui, sans-serif" });
    ctx.strokeStyle = globe; ctx.lineWidth = 1.6; ctx.beginPath();
    D.fit.curve.forEach(([km, r], i) => (i ? ctx.lineTo(cx(km), cy(r)) : ctx.moveTo(cx(km), cy(r))));
    ctx.stroke();
    ctx.strokeStyle = INK; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx(6371), iy0); ctx.lineTo(cx(6371), iy1); ctx.stroke(); ctx.setLineDash([]);
    // l'encadré de l'ajustement (core/fitbox.js, 2026-11-27) : pas de χ²/ν (aucune erreur publiée par lecture du gravimètre)
    drawFitBox(ctx, ix1, iy0 + 4, { R: D.fit.km, r: D.fit.corr, scatter: `${num(D.fit.rms, 1)} mGal rms`, chi2nu: null, title: `${num(D.fit.n)} ${tr("eo-pairs", "pairs of lines")}`, col: globe, size: wide ? 9.5 : 9, align: "right" });
    label(ctx, tr("eo-inset", "rms (mGal) vs the radius R put in the correction (km)"), ix0, iy0 - 8, { col: SOFT, font: "9.5px system-ui, sans-serif" });
  };
  const next = () => { st.from = st.to; st.to = (st.to + 1) % MODELS.length; st.t = 0; };
  sel?.addEventListener("change", () => { st.auto = sel.value === "auto"; if (!st.auto) { st.from = st.to; st.to = +sel.value; st.t = 0; } draw(); });
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => {
      if (st.t < 1) { st.t = Math.min(1, st.t + n / 90); st.hold = 0; return; }
      st.hold += n; if (st.auto && st.hold > 150) next();
    },
    draw,
    // export : les trois corrections tour à tour (4 s chacune), ou le modèle choisi
    anim: { duration: 12, state: st, reset: () => { st.hold = 0; if (st.auto) { st.from = st.to = 0; st.t = 0; } else { st.from = st.to; st.t = 1; } } },
  });
  // cartes (epic11) : « aviaEot@0|1|2 » fige une correction
  cv.__variant = { get: () => (st.auto ? "auto" : String(st.to)), set: (v) => { st.auto = v === "auto"; if (!st.auto) { st.from = st.to = +v; st.t = 1; } if (sel) sel.value = v; draw(); } };
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
