// Epic12 : figures et tableaux de la section « observatoires et stations »
// de mag. Plusieurs sources (data/mag/sources.json) : un sélecteur filtre
// figures et tableaux ; les nombres cités dans le texte (spans data-obsv)
// sont ceux de TOUTES les sources réunies, calculés ici, jamais recopiés.
// Les nombres viennent de obs-logic.js (testé) ; ici on ne fait que dessiner
// (SVG via le helper FIG, même convention de boîte que seis/surv : boîte
// entre les quartiles, barre à la médiane, moustaches à 1,5 IQR, points
// au-delà).
import { FIG } from "../../core/fig.js";
import { MAG_OBS, MAG_OBS_SOURCES } from "../../data/presets/mag-obs.js";
import { MAG_OBS_FIT } from "../../data/presets/mag-obs-fit.js";
import { analyse, boxStats, MODELS, obsFromPreset } from "./obs-logic.js";
import { flatShape } from "./logic.js";
import { magSgn, magLat2r } from "./shared.js";

const ALL = obsFromPreset(MAG_OBS);
const _cache = new Map();
let SEL = "all";
/** Analyse mémoïsée par source ("all" = toutes) ; l'ajustement plat est celui de toutes les données. */
export function magObsAnalysis(key = SEL) {
  if (!_cache.has(key)) _cache.set(key, analyse(key === "all" ? ALL : ALL.filter((o) => o.src === key), MAG_OBS_FIT));
  return _cache.get(key);
}
export function setObsSource(key) { SEL = key === "all" || MAG_OBS_SOURCES.some((s) => s.key === key) ? key : "all"; }

const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? v[k] : `{${k}}`));
const deg0 = (v) => (v ? magSgn(v) : "0") + "°";
const sg1 = (x) => (x < 0 ? "−" : "+") + Math.abs(x).toFixed(1);
const half = (rows, m, north) => boxStats(rows.filter((o) => (o.mlat > 0) === north).map((o) => o.res[m])).med;
const isGlobe = (m) => m.startsWith("globe");

/**
 * Boîtes à moustaches, un rang par modèle. kind "I" : résidus I_mesurée −
 * I_modèle en degrés ; kind "F" : écart relatif d'intensité en %. Les
 * valeurs hors axe sont posées sur le bord et COMPTÉES (rien n'est caché).
 */
function drawBoxes(host, t, kind) {
  if (!host) return;
  const { rows, stats, statsF } = magObsAnalysis();
  const S = kind === "F" ? statsF : stats;
  const [VMIN, VMAX, ticks, unit] = kind === "F" ? [-100, 100, [-100, -50, 0, 50, 100], "%"] : [-70, 70, [-60, -30, 0, 30, 60], "°"];
  const C = FIG.C, rowH = 34, topY = 40, n = MODELS.length;
  const lastY = topY + (n - 1) * rowH, gridBottom = lastY + 22, tickY = gridBottom + 16, H = tickY + 30;
  const f = FIG.make({ w: 380, h: H, alt: fill(t(`obs-box${kind}-alt`), { n: rows.length }) });
  const X0 = 132, X1 = 356;
  const bx = (v) => Math.max(X0 - 4, Math.min(X1 + 4, X0 + ((v - VMIN) / (VMAX - VMIN)) * (X1 - X0)));
  for (const v of ticks) {
    if (v) f.dash(bx(v), 22, bx(v), gridBottom, { c: "#e7e3da", dash: "3 3" });
    f.note(bx(v), tickY, (v ? magSgn(v) : "0") + unit, { anchor: "middle" });
  }
  f.line(bx(0), 18, bx(0), gridBottom + 4, { c: C.globe, w: 1.4 });
  MODELS.forEach((m, i) => {
    const y = topY + i * rowH, s = S[m], col = isGlobe(m) ? C.globe : C.flat;
    f.note(X0 - 8, y - 1, t(`obs-m-${m}`), { anchor: "end", c: col });
    f.note(X0 - 8, y + 10, t(`obs-p-${m}`), { anchor: "end", size: 9 });
    f.line(bx(s.lo), y, bx(s.q1), y, { c: col, w: 1.2 });
    f.line(bx(s.q3), y, bx(s.hi), y, { c: col, w: 1.2 });
    f.line(bx(s.lo), y - 6, bx(s.lo), y + 6, { c: col, w: 1.2 });
    f.line(bx(s.hi), y - 6, bx(s.hi), y + 6, { c: col, w: 1.2 });
    f.path(`M${bx(s.q1)} ${y - 9} H${bx(s.q3)} V${y + 9} H${bx(s.q1)} Z`, { c: col, w: m === "globe" ? 2 : 1.4 });
    f.line(bx(s.med), y - 9, bx(s.med), y + 9, { c: col, w: 2.6 });
    for (const o of s.out) f.dot(bx(o), y, { r: 2, c: col });
    const past = s.out.filter((o) => o > VMAX).length;
    if (past) f.note(X1 + 8, y + 4, `+${past}`, { c: col, size: 9 });
  });
  f.note(4, H - 6, t(`obs-box${kind}-axis`));
  f.notToScale(fill(t("obs-stamp"), { n: rows.length }));
  f.mountIn(host);
}
export const drawObsBox = (host, t) => drawBoxes(host, t, "I");
export const drawObsBoxF = (host, t) => drawBoxes(host, t, "F");

/** Résidu en fonction de la latitude magnétique : globe, puis le meilleur plat (② ajusté). */
export function drawObsLat(host, t) {
  if (!host) return;
  const { rows } = magObsAnalysis();
  const C = FIG.C, W = 380, panH = 132, gap = 26, top = 22, L = 40, R = W - 10;
  const H = top + 2 * panH + gap + 34;
  const f = FIG.make({ w: W, h: H, alt: fill(t("obs-lat-alt"), { n: rows.length }) });
  const X = (ml) => L + ((ml + 90) / 180) * (R - L);
  ["globe", "flat2fit"].forEach((m, p) => {
    const y0 = top + p * (panH + gap), col = isGlobe(m) ? C.globe : C.flat;
    const Y = (v) => y0 + ((50 - Math.max(-50, Math.min(50, v))) / 100) * panH;
    for (const v of [-50, -25, 25, 50]) f.dash(L, Y(v), R, Y(v), { c: "#eeebe4", dash: "2 3", w: 1 });
    for (const v of [-50, -25, 0, 25, 50]) f.note(L - 4, Y(v) + 3, deg0(v), { anchor: "end", size: 9 });
    f.dash(X(0), y0, X(0), y0 + panH, { c: C.faint, dash: "3 3", w: 1 });
    f.line(L, Y(0), R, Y(0), { c: C.soft, w: 1 });
    f.note(L + 4, y0 + 10, t(`obs-m-${m}`) + " — " + t(`obs-p-${m}`), { c: col });
    for (const o of rows) {
      const v = o.res[m];
      const d = f.dot(X(o.mlat), Y(v), { r: rows.length > 400 ? 1.5 : 2.2, c: col });
      d.setAttribute("fill-opacity", rows.length > 400 ? "0.35" : "0.55");
      // hors cadre : posé sur le bord, marqué d'une flèche (rien n'est caché)
      if (Math.abs(v) > 50) f.note(X(o.mlat) + 4, Y(v) + (v > 0 ? 8 : -3), v > 0 ? "▲" : "▼", { c: col, size: 8 });
    }
    // médianes par tranches de 15° (≥ 3 sites), en trait continu
    let d = "";
    for (let b = -90; b < 90; b += 15) {
      const vs = rows.filter((o) => o.mlat >= b && o.mlat < b + 15).map((o) => o.res[m]);
      if (vs.length < 3) continue;
      d += `${d ? "L" : "M"}${X(b + 7.5).toFixed(1)} ${Y(boxStats(vs).med).toFixed(1)} `;
    }
    f.path(d, { c: C.ink, w: 1.6 });
    const nN = half(rows, m, true), nS = half(rows, m, false);
    f.note(L + 4, y0 + 23, fill(t("obs-lat-halves"), { s: sg1(nS), n: sg1(nN) }), { c: C.ink, size: 10 });
  });
  const yb = top + 2 * panH + gap;
  for (const v of [-90, -45, 0, 45, 90]) f.note(X(v), yb + 12, deg0(v), { anchor: "middle", size: 9 });
  f.note(W / 2, yb + 28, t("obs-lat-axis"), { anchor: "middle" });
  f.notToScale(fill(t("obs-stamp"), { n: rows.length }));
  f.mountIn(host);
}

/** Lecture et tableaux de synthèse de la source choisie. */
export function fillObsText(q, t) {
  const { rows, stats, statsF } = magObsAnalysis();
  const g = stats.globe, b = stats.flat2fit;
  const rd = q("#magObsRead");
  if (rd) rd.innerHTML = fill(t("obs-read"), {
    n: rows.length, gm: sg1(g.med), g5: Math.round(100 * g.within5),
    fm: sg1(b.med), fn: sg1(half(rows, "flat2fit", true)), fs: sg1(half(rows, "flat2fit", false)),
  });
  const tb = q("#magObsRows");
  if (tb) tb.innerHTML = MODELS.map((m) => {
    const s = stats[m], cls = isGlobe(m) ? "g" : "f";
    return `<tr><td class="${cls}">${t(`obs-m-${m}`)}</td><td>${t(`obs-p-${m}`)}</td><td><b>${sg1(s.med)}°</b></td>` +
      `<td>${sg1(s.q1)}° … ${sg1(s.q3)}°</td><td>${Math.round(100 * s.within5)} %</td>` +
      `<td>${sg1(half(rows, m, true))}° / ${sg1(half(rows, m, false))}°</td></tr>`;
  }).join("");
  const tf = q("#magObsRowsF");
  if (tf) tf.innerHTML = MODELS.map((m) => {
    const s = statsF[m], cls = isGlobe(m) ? "g" : "f", pc = (x) => (x < 0 ? "−" : "+") + Math.abs(x).toFixed(0) + " %";
    return `<tr><td class="${cls}">${t(`obs-m-${m}`)}</td><td>${t(`obs-p-${m}`)}</td><td>${pc(s.q1)} … ${pc(s.q3)}</td>` +
      `<td><b>${Math.round(100 * s.within10)} %</b></td><td>${pc(s.min)} … ${pc(s.max)}</td></tr>`;
  }).join("");
}

/** Liste de tous les sites de la source choisie -- construite quand on déplie le repli (≈2 000 lignes). */
export function fillObsList(q) {
  const all = q("#magObsAll");
  if (!all) return;
  const { rows } = magObsAnalysis();
  all.innerHTML = [...rows].sort((a, c) => c.mlat - a.mlat).map((o) =>
    `<tr><td>${o.src}</td><td>${o.code}</td><td>${o.name}</td><td>${o.year.toFixed(1)}</td><td>${o.q}</td><td>${magSgn(o.mlat)}°</td>` +
    `<td><b>${sg1(o.I)}°</b></td><td><b>${o.F == null ? "—" : (o.F / 1000).toFixed(1)}</b></td><td class="g">${sg1(o.pred.globe)}°</td>` +
    `<td class="g">${sg1(o.pred.globeEcc)}°</td><td class="f">${sg1(o.pred.flat2fit)}°</td></tr>`).join("");
}

/** Toutes les lignes de toutes les sources, toutes les prédictions (I en degrés, F en nT). */
export function obsCsv() {
  const { rows, scale, fit } = magObsAnalysis("all");
  const head = ["source", "site", "name", "lat", "lon", "year", "quality", "I_measured", "F_measured_nT", "maglat"];
  for (const m of MODELS) head.push(`I_${m}`, `F_${m}_nT`);
  const q = (x) => (/[",]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : x);
  const lines = [
    ...MAG_OBS_SOURCES.map((s) => `# Source "${s.key}": ${s.cite} ${s.url}`),
    `# Flat fits (on I only): ${JSON.stringify(fit)}`,
    head.join(","),
  ];
  for (const o of rows) {
    const v = [o.src, o.code, o.name, o.lat, o.lon, o.year, o.q, o.I, o.F ?? "", o.mlat.toFixed(3)];
    for (const m of MODELS) v.push(o.pred[m].toFixed(3), Math.round(scale[m] * o.shapeB[m]));
    lines.push(v.map(q).join(","));
  }
  return lines.join("\n") + "\n";
}

/**
 * Nombres cités dans le texte, jamais recopiés à la main : <span
 * data-obsv="clé"></span> dans la prose, dans toutes les langues, formatés
 * à la langue de la page (virgule décimale). Clé nue = toutes les sources ;
 * « obs.fFw10 » = la même valeur sur la seule source « obs » ;
 * « src.obs.no_mean_in_window » = un décompte du build (MAG_OBS_SOURCES).
 * Les affirmations qualitatives qui entourent ces nombres sont gardées par
 * des tests (obs-logic.test.js, « text: … »).
 */
export function obsValues(lang, key = "all") {
  const { rows, stats, statsF, fit } = magObsAnalysis(key);
  const nf = (x, d = 0, sign = false) => {
    const s = new Intl.NumberFormat(lang, { minimumFractionDigits: d, maximumFractionDigits: d }).format(Math.abs(x));
    if (/^[0.,]+$/.test(s)) return s; // arrondi à zéro : ni « +0 » ni « −0 »
    return (x < 0 ? "−" : sign && x > 0 ? "+" : "") + s;
  };
  const pc = (x) => nf(100 * x);
  const ratio = boxStats(rows.filter((o) => Math.abs(o.mlat) > 10).map((o) => Math.tan((o.I * Math.PI) / 180) / Math.tan((o.mlat * Math.PI) / 180)));
  const worst = [...rows].sort((a, c) => Math.abs(c.res.globe) - Math.abs(a.res.globe)).slice(0, 4);
  const bal = MAG_OBS_FIT.flat2bal;
  const balRes = (north) => boxStats(rows.filter((o) => (o.mlat > 0) === north).map((o) => o.I - flatShape(2, magLat2r(o.mlat), bal).I)).med;
  const iqr = (m) => statsF[m].q3 - statsF[m].q1;
  return {
    n: nf(rows.length), south: nf(rows.filter((o) => o.lat < 0).length),
    north: nf(rows.filter((o) => o.mlat > 0).length), southM: nf(rows.filter((o) => o.mlat < 0).length),
    nWithF: nf(statsF.globe.n), sources: nf(MAG_OBS_SOURCES.length),
    mlatMax: nf(Math.max(...rows.map((o) => o.mlat)), 0, true), mlatMin: nf(Math.min(...rows.map((o) => o.mlat)), 0, true),
    gMed: nf(stats.globe.med, 1, true), gW5: pc(stats.globe.within5),
    eMed: nf(stats.globeEcc.med, 1, true), eW5: pc(stats.globeEcc.within5),
    f1Med: nf(stats.flat1.med), f2Med: nf(stats.flat2.med),
    fMed: nf(stats.flat2fit.med, 1, true), fW5: pc(stats.flat2fit.within5),
    fN: nf(half(rows, "flat2fit", true), 0, true), fS: nf(half(rows, "flat2fit", false), 0, true),
    fbN: nf(balRes(true), 0, true), fbS: nf(balRes(false), 0, true),
    gN: nf(half(rows, "globe", true), 1, true), gS: nf(half(rows, "globe", false), 1, true),
    ratio: nf(ratio.med, 2), ratioQ1: nf(ratio.q1, 2), ratioQ3: nf(ratio.q3, 2), ratioN: nf(ratio.n),
    worst: worst.map((o) => `${o.name} ${nf(o.res.globe, 0, true)}°`).join(", "),
    f1d: nf(Math.round(fit.flat1.d / 100) * 100), f2d: nf(Math.round(fit.flat2.d2 / 100) * 100),
    gFw10: pc(statsF.globe.within10), eFw10: pc(statsF.globeEcc.within10), fFw10: pc(statsF.flat2fit.within10),
    gFq1: nf(statsF.globe.q1, 0, true), gFq3: nf(statsF.globe.q3, 0, true),
    eFq1: nf(statsF.globeEcc.q1, 0, true), eFq3: nf(statsF.globeEcc.q3, 0, true),
    fFq1: nf(statsF.flat2fit.q1, 0, true), fFq3: nf(statsF.flat2fit.q3, 0, true),
    gFiqr: nf(iqr("globe")), eFiqr: nf(iqr("globeEcc")), fFiqr: nf(iqr("flat2fit")),
  };
}

/** Valeur d'une clé data-obsv (voir obsValues), calculée à la demande par source. */
export function obsValueLookup(lang) {
  const memo = new Map();
  const V = (key) => { if (!memo.has(key)) memo.set(key, obsValues(lang, key)); return memo.get(key); };
  const nf = (x) => new Intl.NumberFormat(lang).format(x);
  return (k) => {
    const p = k.split(".");
    if (p[0] === "src") {                      // src.<source>.<compteur du build> ou src.<source>.n
      const s = MAG_OBS_SOURCES.find((x) => x.key === p[1]);
      const v = s && ({ n: s.n, south: s.south, from: s.years && Math.floor(s.years[0]), to: s.years && Math.floor(s.years[1]) }[p[2]] ?? s.counts?.[p[2]]);
      return v == null ? "?" : p[2] === "from" || p[2] === "to" ? String(v) : nf(v);
    }
    if (p.length === 2) return V(p[0])[p[1]] ?? "?";
    return V("all")[k] ?? "?";
  };
}

/** Monte la section : sélecteur de source, figures, tableaux, nombres du texte, liste et CSV. */
export function mountObsSection(container, t, lang) {
  const q = (sel) => container.querySelector(sel);
  const draw = () => {
    drawObsBox(q("#magObsBox"), t);
    drawObsBoxF(q("#magObsBoxF"), t);
    drawObsLat(q("#magObsLat"), t);
    fillObsText(q, t);
    const fold = q("details.mag-obs-all");
    if (fold?.open) fillObsList(q);
  };
  const sel = q("#magObsSrc");
  if (sel) {
    const opt = (v, label) => `<option value="${v}"${v === SEL ? " selected" : ""}>${label}</option>`;
    sel.innerHTML = opt("all", fill(t("obs-src-all"), { n: ALL.length })) +
      MAG_OBS_SOURCES.map((s) => opt(s.key, fill(t(`obs-src-${s.key}`) || s.name, { n: s.n }))).join("");
    sel.addEventListener("change", () => { setObsSource(sel.value); draw(); });
  }
  q("details.mag-obs-all")?.addEventListener("toggle", (e) => { if (e.target.open) fillObsList(q); });
  const val = obsValueLookup(lang);
  for (const el of container.querySelectorAll("[data-obsv]")) el.textContent = val(el.dataset.obsv);
  const dl = q("#magObsCsv");
  if (dl && typeof Blob !== "undefined" && URL.createObjectURL) {
    dl.href = URL.createObjectURL(new Blob([obsCsv()], { type: "text/csv" }));
    dl.download = "flat-or-globe-magnetic-measurements.csv";
  }
  draw();
}
