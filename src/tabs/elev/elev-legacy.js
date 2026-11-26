// Moteur de l'onglet sim (angles d'élévation), porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html) : render() ~L14941, applyPreset()/PRESETS
// ~L24688-24894, drawPanel()/scales()/boundingBox()/drawScaleBars()
// ~L14239-14427, drawPerspective() ~L14435-14616 (partagée avec hh),
// statusFor() ~L14620, updateSizes() ~L14629, updateReverse() ~L14657,
// updateRecip() ~L14779, updateNameTags()/updateWhy() ~L14819-14877,
// updateResults() ~L14879, updateExaggUI()/updateRefractionUI()
// ~L14914-14939, updateExp1() ~L15445, setO3()/wiring ~L24665-24912.
//
// PAS PORTÉ : tanLoop()/TAN3, le globe-rapporteur tournant de la section
// 05 (#tan3d) -- décision explicite epic03/UC06.org ("la migration de sim
// ne l'a pas porté ... si elle revient un jour, la refaire directement en
// Three.js sur le modèle de scene-mag.js, pas en 2.5D"). Cette section
// revient avec le panneau verbatim (UC11) mais son canvas reste un
// chantier séparé ; index.js neutralise l'hôte (bouton et canvas cachés)
// plutôt que de laisser un canvas muet.
//
// R/k/refr passent par src/core/settings.js : sim EST l'écriveur de ce
// réglage partagé (legacy #radius/#kcoef/#refr, formulaire de tab 1),
// hh et obs le lisent, twi lit R seul -- voir ce module pour le détail
// vérifié contre le legacy. Les libellés PRESETS (label/why/note) restent
// en anglais -- ce sont des données de cas documentés (comme HH_PRESETS),
// pas la couche traduite par epic04/UC06 (2026-09-17), qui couvre le reste
// (figures, tables, verdicts).
import { setupCanvas, niceLen } from "../../core/canvas.js";
import { $, DEG, fillPresetSelect, fmtAngle, fmtDist, fmtDiff, expNum } from "../../core/legacy-helpers.js";
import { globeElev } from "../../core/math.js";
import { readInputs, computeAngles, objLabel, objShort, angularSize, reciprocalZenith, reconstructTwoStation } from "./logic.js";
import { PRESETS, SIM_PROFILES } from "../../data/presets/elev.js";
import { drawSimFigSil } from "../../core/symbols.js";
import { cite } from "../../core/citations.js";
import { setR, setK, setRefr, subscribeSettings } from "../../core/settings.js";
import { makeT } from "../../core/i18n.js";

const KEY = "elev";
// drawPanel()/drawPerspective() sont PARTAGES avec hh (hhOverlay les appelle
// directement) -- t() s'initialise donc paresseusement au premier appel,
// plutot que dans wire(), pour marcher meme si hh est monte avant sim.
let _t = null;
function t(key) { if (!_t) _t = makeT(document.documentElement.lang || "en", KEY); return _t(key); }
const COLORS = ["#1d4ed8", "#c2410c", "#6d28d9"], KEYS = ["①", "②", "③"];
const READS = { flatCanvas: "readFlat", globeCanvas: "readGlobe", perspCanvas: "readPersp" };
export const PADX = 62, PADY = 30;
let TARGET_NAMES = null, OBSERVER_NAME = null, CURRENT_PRESET = null;
let perspSolid = "globe";

/* ---- lecture/validation des champs, à l'identique de readInputs() du legacy ---- */
function readSimInputs() {
  const eye = parseFloat($("eye").value);
  const R = parseFloat($("radius").value) * 1000;
  const objs = [0, 1].map((i) => ({
    d: parseFloat($(`d${i + 1}`).value) * 1000, h: parseFloat($(`h${i + 1}`).value), az: parseFloat($(`az${i + 1}`).value),
    color: COLORS[i], key: KEYS[i],
  }));
  if ($("o3on").checked) objs.push({ d: parseFloat($("d3").value) * 1000, h: parseFloat($("h3").value), az: parseFloat($("az3").value), color: COLORS[2], key: KEYS[2] });
  objs.forEach((o, i) => { const nm = TARGET_NAMES && TARGET_NAMES[i]; o.name = nm ? nm.n : null; o.short = nm ? nm.s || nm.n : null; });
  const exagg = parseFloat($("exagg").value);
  const refr = $("refr").checked;
  const k = parseFloat($("kcoef").value);
  const s = readInputs({ eye, R, refr, k, objs });
  if (s.valid && !Number.isFinite(exagg)) return { ...s, exagg, valid: false, msg: "err-need-number" };
  return { ...s, exagg };
}

/* ---- géométrie d'affichage (petite planète R/ex), à l'identique du legacy ---- */
function flatPts(s) {
  const ex = s.exagg;
  const P = [[0, 0]];
  s.objs.forEach((o) => { P.push([o.d, -s.eye * ex]); P.push([o.d, (o.h - s.eye) * ex]); });
  P.push([Math.max(...s.objs.map((o) => o.d)), -s.eye * ex]);
  return P;
}
export function globeDisp(s) { const ex = s.exagg; return { ex, Rd: s.Rg / ex, eyeD: s.eye * ex }; }
function globePts(s) {
  const { ex, Rd, eyeD } = globeDisp(s);
  const P = [[0, 0]];
  s.objs.forEach((o) => {
    const t = o.d / Rd;
    P.push([Rd * Math.sin(t), Rd * Math.cos(t) - (Rd + eyeD)]);
    P.push([(Rd + o.h * ex) * Math.sin(t), (Rd + o.h * ex) * Math.cos(t) - (Rd + eyeD)]);
  });
  const tmax = Math.max(...s.objs.map((o) => o.d)) / Rd;
  P.push([Rd * Math.sin(tmax), Rd * Math.cos(tmax) - (Rd + eyeD)]);
  return P;
}
export function boundingBox(s) {
  const P = flatPts(s).concat(globePts(s));
  let minX = 0, maxX = Math.max(...P.map((p) => p[0]));
  let minY = Math.min(...P.map((p) => p[1])), maxY = Math.max(...P.map((p) => p[1]));
  maxX *= 1.06;
  const yr = maxY - minY || 1;
  minY -= 0.15 * yr; maxY += 0.18 * yr;
  return { minX, maxX, minY, maxY };
}
export function scales(box, W, H, exagg) {
  const worldW = box.maxX - box.minX, worldH = (box.maxY - box.minY) || 1;
  const availW = W - 2 * PADX, availH = H - 2 * PADY;
  const su = Math.min(availW / worldW, availH / worldH);
  return { sx: su, sy: su, effExagg: exagg };
}
function fillReads(id, rows) {
  const el = $(id); if (!el) return;
  el.innerHTML = rows.map((r) => `<span class="r"><span class="dot" style="background:${r.color}"></span><b>${r.name}</b>${r.main ? " " + r.main : ""}${r.sub ? ` <span class="sub">${r.sub}</span>` : ""}</span>`).join("");
}

/* ---- coupes orthographiques plat/globe, à l'identique de drawPanel() du legacy --
   PARTAGÉE avec hh (drawHiddenViews() y ajoute une surcouche, hhOverlay). */
export function drawPanel(canvas, mode, s, ang, box) {
  const readId = READS[canvas.id];
  const reads = [];
  const { ctx, W, H } = setupCanvas(canvas);
  if (!W) return;
  const { sx, sy } = scales(box, W, H, s.exagg);
  const T = (x, y) => [PADX + (x - box.minX) * sx, H - PADY - (y - box.minY) * sy];

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);

  const groundColor = "#7a6a4f";
  const exD = s.exagg, gD = globeDisp(s);

  ctx.lineWidth = 2; ctx.strokeStyle = groundColor;
  ctx.fillStyle = "rgba(122,106,79,0.07)";
  ctx.beginPath();
  if (mode === "flat") {
    const [x0, y0] = T(box.minX, -s.eye * exD), [x1, y1] = T(box.maxX, -s.eye * exD);
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x1, H); ctx.lineTo(x0, H); ctx.closePath(); ctx.fill();
  } else {
    const N = 160;
    const tEnd = Math.min(Math.asin(Math.min(1, box.maxX / gD.Rd)), Math.PI / 2);
    const pts = [];
    for (let i = 0; i <= N; i++) { const phi = (tEnd * i) / N; pts.push(T(gD.Rd * Math.sin(phi), gD.Rd * Math.cos(phi) - (gD.Rd + gD.eyeD))); }
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(pts[pts.length - 1][0], H); ctx.lineTo(pts[0][0], H); ctx.closePath(); ctx.fill();
  }

  ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4; ctx.strokeStyle = "#9aa1ab";
  const [ex0, ey0] = T(box.minX, 0), [ex1, ey1] = T(box.maxX, 0);
  ctx.beginPath(); ctx.moveTo(ex0, ey0); ctx.lineTo(ex1, ey1); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#7d848f"; ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "bottom";
  ctx.fillText(t("eye-level-dot"), ex0 + 4, ey0 - 3);

  const [ox, oy] = T(0, 0), [fx, fy] = T(0, -s.eye * exD);
  ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(fx, fy); ctx.stroke();
  ctx.fillStyle = "#151a21";
  ctx.beginPath(); ctx.arc(ox, oy, 4.2, 0, 7); ctx.fill();
  ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#151a21";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(t("observer"), ox + 8, oy - 9);

  s.objs.forEach((o, i) => {
    let base, top;
    if (mode === "flat") {
      base = T(o.d, -s.eye * exD); top = T(o.d, (o.h - s.eye) * exD);
    } else {
      const t = o.d / gD.Rd;
      base = T(gD.Rd * Math.sin(t), gD.Rd * Math.cos(t) - (gD.Rd + gD.eyeD));
      top = T((gD.Rd + o.h * exD) * Math.sin(t), (gD.Rd + o.h * exD) * Math.cos(t) - (gD.Rd + gD.eyeD));
    }
    ctx.strokeStyle = o.color; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(top[0], top[1]); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.strokeStyle = o.color; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
    ctx.fillStyle = o.color;
    ctx.beginPath(); ctx.arc(top[0], top[1], 3.6, 0, 7); ctx.fill();
    const aVal = mode === "flat" ? ang[i].flat : ang[i].globe;
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.fillStyle = o.color; ctx.textBaseline = "bottom";
    const rightSide = top[0] < W - 150;
    ctx.textAlign = rightSide ? "left" : "right";
    const lx = rightSide ? top[0] + 7 : top[0] - 7;
    if (readId) {
      ctx.fillText(objShort(o), lx, top[1] - 5);
      reads.push({ color: o.color, name: objShort(o), main: `${DEG(aVal) >= 0 ? "+" : ""}${DEG(aVal).toFixed(3)}°`, sub: `h ${fmtDist(o.h)} · ${fmtDist(o.d)}` });
    } else {
      ctx.fillText(`${objShort(o)} ${DEG(aVal).toFixed(3)}°`, lx, top[1] - 5);
      ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#7d848f";
      ctx.fillText(`h=${fmtDist(o.h)} · ${fmtDist(o.d)}`, lx, top[1] + 12);
    }
  });
  if (readId) fillReads(readId, reads);

  drawScaleBars(ctx, W, H, sx, sy, box, exD);
}

function drawScaleBars(ctx, W, H, sx, sy, box, ex) {
  const bx = W - 20, by = H - 16;
  const hLen = niceLen(0.22 * (box.maxX - box.minX));
  const hpx = hLen * sx;
  ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(bx - hpx, by); ctx.lineTo(bx, by);
  ctx.moveTo(bx - hpx, by - 4); ctx.lineTo(bx - hpx, by + 4);
  ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by + 4);
  ctx.stroke();
  ctx.fillStyle = "#151a21"; ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText(hLen >= 1000 ? hLen / 1000 + " km" : hLen + " m", bx - hpx / 2, by - 4);
  const vLen = niceLen((0.42 * (box.maxY - box.minY)) / ex);
  const vpx = vLen * ex * sy;
  const vx = bx - hpx - 26;
  ctx.beginPath();
  ctx.moveTo(vx, by); ctx.lineTo(vx, by - vpx);
  ctx.moveTo(vx - 4, by); ctx.lineTo(vx + 4, by);
  ctx.moveTo(vx - 4, by - vpx); ctx.lineTo(vx + 4, by - vpx);
  ctx.stroke();
  ctx.save();
  ctx.translate(vx - 5, by - vpx / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText(vLen >= 1000 ? vLen / 1000 + " km" : vLen + " m", 0, 0);
  ctx.restore();
}

/* ---- vue perspective, à l'identique de drawPerspective() du legacy --
   PARTAGÉE avec hh (opt.zoomId/nameId/metaId/readId/solid/clipHorizon). */
export function drawPerspective(canvas, s, ang, opt) {
  opt = opt || {};
  const zoomEl = $(opt.zoomId || "pzoom"), nameEl = $(opt.nameId || "perspName");
  const metaEl = $(opt.metaId || "metaPersp"), readEl = $(opt.readId || "pzoomRead");
  const { ctx, W, H } = setupCanvas(canvas);
  if (!W) return;
  const R2D = 180 / Math.PI;
  const readId = READS[canvas.id];
  const reads = [];

  const items = ang.map((a) => ({
    ...a, azR: (a.az * Math.PI) / 180, halfW: Math.atan2(a.h / 2, a.d),
    baseFlat: Math.atan2(-s.eye, a.d), baseGlobe: globeElev(s.Rg, s.eye, a.d, 0),
  }));

  let yMin = Infinity, yMax = -Infinity, xMin = Infinity, xMax = -Infinity;
  items.forEach((it) => {
    yMin = Math.min(yMin, it.flat, it.globe); yMax = Math.max(yMax, it.flat, it.globe);
    xMin = Math.min(xMin, it.azR - it.halfW); xMax = Math.max(xMax, it.azR + it.halfW);
  });
  const ySpan = Math.max(yMax - yMin, 0.0006);
  yMin -= 0.45 * ySpan; yMax += 0.55 * ySpan;
  const xSpan = Math.max(xMax - xMin, 0.002);
  xMin -= 0.1 * xSpan; xMax += 0.1 * xSpan;

  const PAD = 34;
  const availW = W - 2 * PAD, availH = H - 2 * PAD;
  const scaleBase = Math.min(availW / (xMax - xMin), availH / (yMax - yMin));
  const pzoom = Math.max(1, (zoomEl && parseFloat(zoomEl.value)) || 1);
  const scaleX = scaleBase;
  let scaleY = scaleBase * pzoom;
  if ((yMax - yMin) * scaleY > availH) scaleY = availH / (yMax - yMin);
  const effZoom = scaleY / scaleX;
  const cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2;
  const T = (az, el) => [W / 2 + (az - cx) * scaleX, H / 2 - (el - cy) * scaleY];

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);

  const line = (el, color, dash, label) => {
    const y = T(0, el)[1];
    if (y < 6 || y > H - 6) return;
    ctx.setLineDash(dash); ctx.lineWidth = 1.3; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText(label, 6, y - 2);
  };
  line(0, "#9aa1ab", [6, 5], t("eye-level"));
  const dip = -Math.acos(s.Rg / (s.Rg + s.eye));
  line(dip, "#0f766e", [2, 3], t("horizon-dip").replace("{v}", (dip * R2D).toFixed(2)));

  const solidIsGlobe = (opt.solid || perspSolid) === "globe";
  if (nameEl) nameEl.textContent = solidIsGlobe ? t("persp-name-globe") : t("persp-name-flat");

  items.forEach((it) => {
    const apex = solidIsGlobe ? it.globe : it.flat;
    const y = T(0, apex)[1];
    if (y < 4 || y > H - 4) return;
    ctx.strokeStyle = it.color; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.globalAlpha = 1;
  });

  const order = [...items].sort((a, b) => b.d - a.d);
  const drawItem = (it) => {
    const tri = (apexEl, baseEl, dashed) => {
      const [ax, ay] = T(it.azR, apexEl);
      const [lx, ly] = T(it.azR - it.halfW, baseEl);
      const [rx, ry] = T(it.azR + it.halfW, baseEl);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(ax, ay); ctx.lineTo(rx, ry);
      if (dashed) { ctx.setLineDash([4, 4]); ctx.lineWidth = 0.9; ctx.strokeStyle = it.color; ctx.globalAlpha = 0.65; ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash([]); }
      else { ctx.closePath(); ctx.globalAlpha = 0.16; ctx.fillStyle = it.color; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.strokeStyle = it.color; ctx.stroke(); }
      return [ax, ay];
    };
    const solid = solidIsGlobe ? { apex: it.globe, base: it.baseGlobe } : { apex: it.flat, base: it.baseFlat };
    const ghost = solidIsGlobe ? { apex: it.flat, base: it.baseFlat, name: t("word-flat") } : { apex: it.globe, base: it.baseGlobe, name: t("word-globe") };
    tri(ghost.apex, ghost.base, true);
    const [gx, gy] = tri(solid.apex, solid.base, false);
    ctx.fillStyle = it.color;
    ctx.beginPath(); ctx.arc(gx, gy, 3.4, 0, 7); ctx.fill();
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    const [fx2, fy2] = T(it.azR, ghost.apex);
    if (readId) {
      ctx.fillText(objShort(it), gx, gy - 6);
      const sgn = (v) => (v >= 0 ? "+" : "") + (v * R2D).toFixed(3) + "°";
      reads.push({ color: it.color, name: objShort(it), main: `${solidIsGlobe ? t("word-globe") : t("word-flat")} ${sgn(solid.apex)}`, sub: `${ghost.name} ${sgn(ghost.apex)} · Δ ${(Math.abs(it.flat - it.globe) * R2D * 60).toFixed(1)}′` });
    } else {
      ctx.fillText(`${objShort(it)} ${(solid.apex * R2D).toFixed(3)}°`, gx, gy - 6);
      ctx.globalAlpha = 0.7; ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText(`${ghost.name} ${(ghost.apex * R2D).toFixed(3)}°`, fx2, fy2 - 5);
      ctx.globalAlpha = 1;
    }
    if (Math.abs(fy2 - gy) > 12) {
      ctx.strokeStyle = it.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx + 14, gy); ctx.lineTo(gx + 14, fy2); ctx.stroke();
      if (!readId) {
        ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(`Δ ${(Math.abs(it.flat - it.globe) * R2D * 60).toFixed(1)}′`, gx + 18, (gy + fy2) / 2);
      }
    }
  };
  order.forEach(drawItem);
  if (readId) fillReads(readId, reads.sort((a, b) => a.name.localeCompare(b.name)));

  const noteEl0 = $("perspNote");
  if (readId && noteEl0) noteEl0.textContent = "";
  if (opt.clipHorizon) {
    const dHor = s.Rg * Math.acos(s.Rg / (s.Rg + s.eye));
    const yh = T(0, dip)[1], y0 = Math.max(0, yh);
    const anyCut = items.some((it) => it.d > dHor);
    if (yh < H - 2) {
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(122,106,79,0.72)";
      ctx.fillRect(0, y0, W, H - y0);
      ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, yh); ctx.lineTo(W, yh); ctx.stroke();
      order.filter((it) => it.d <= dHor).forEach(drawItem);
      const msg = anyCut
        ? t("water-cut").replace("{v}", fmtDist(dHor))
        : t("water-cut-near").replace("{v}", fmtDist(dHor));
      const noteEl = readId ? $("perspNote") : null;
      if (noteEl) noteEl.textContent = msg;
      else {
        ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = "#ffffff"; ctx.fillText(msg, 6, yh + 4);
      }
    }
  }

  const barDeg = niceLen(0.25 * (yMax - yMin) * R2D * 100) / 100;
  const barPx = (barDeg / R2D) * scaleY;
  const bx = W - 24, by = H - 18;
  ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx, by); ctx.lineTo(bx, by - barPx);
  ctx.moveTo(bx - 4, by); ctx.lineTo(bx + 4, by);
  ctx.moveTo(bx - 4, by - barPx); ctx.lineTo(bx + 4, by - barPx);
  ctx.stroke();
  ctx.save(); ctx.translate(bx - 6, by - barPx / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#151a21"; ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText(barDeg >= 1 ? barDeg + "°" : (barDeg * 60).toFixed(0) + "′", 0, 0);
  ctx.restore();

  if (metaEl) metaEl.textContent = t("persp-meta").replace("{x}", ((xMax - xMin) * R2D).toFixed(1)).replace("{y}", ((yMax - yMin) * R2D).toFixed(2)) +
    (effZoom > 1.001 ? t("persp-meta-zoom").replace("{v}", effZoom.toFixed(1)) : t("persp-meta-equal"));
  if (readEl) readEl.textContent = effZoom > 1.001 ? t("persp-read-zoom").replace("{v}", effZoom.toFixed(1)) : t("persp-read-equal");
}

function statusFor(s, a) {
  const horizon = Math.sqrt(2 * s.Rg * s.eye + s.eye * s.eye);
  const dip = -Math.acos(s.Rg / (s.Rg + s.eye));
  if (a.globe < dip) return { cls: "hidden", txt: t("status-hidden") };
  if (a.d > horizon) return { cls: "grazing", txt: t("status-grazing") };
  if (a.globe < 0) return { cls: "", txt: t("status-below") };
  return { cls: "", txt: t("status-full") };
}

function updateSizes(s, ang) {
  const tb = $("sizeRows"); if (!tb) return;
  let worstSize = 0, worstPos = 0;
  tb.innerHTML = ang.map((a) => {
    const z = angularSize(s.Rg, s.eye, a.d, a.h);
    const bFlat = z.flat, bGlobe = z.globe, dSize = z.dSize, dPos = a.flat - a.globe;
    worstSize = Math.max(worstSize, Math.abs(dSize / bFlat));
    worstPos = Math.max(worstPos, Math.abs(dPos));
    return `<tr><td><span class="obj-key" style="background:${a.color}"></span>${objLabel(a)}</td>` +
      `<td>${DEG(bFlat).toFixed(4)}°</td>` +
      `<td>${DEG(bGlobe).toFixed(4)}°</td>` +
      `<td>${(DEG(dSize) * 3600).toFixed(2)}″ <span style="color:var(--ink-soft)">(${((dSize / bFlat) * 100).toFixed(3)}%)</span></td>` +
      `<td class="ang-globe">${(DEG(dPos) * 60).toFixed(2)}′ = ${DEG(dPos).toFixed(4)}°</td></tr>`;
  }).join("");
  const note = $("sizeNote"); if (!note) return;
  note.innerHTML = t("sizes-note").replace("{worstSize}", (worstSize * 100).toFixed(3)).replace("{worstPos}", (DEG(worstPos) * 60).toFixed(1));
}

function updateReverse(s, ang) {
  const tb = $("reAngRows"); if (!tb) return;
  const R = s.Rg, e = s.eye, AM = (180 / Math.PI) * 60;
  const sorted = [...ang].sort((a, b) => a.d - b.d);
  const near = sorted[0], far = sorted[sorted.length - 1];
  const reTarget = $("reTarget"); if (reTarget) reTarget.textContent = t("re-target").replace("{name}", objLabel(far)).replace("{d}", fmtDist(far.d));
  const fname = far.name ? `${far.key} ${far.name}` : "";
  if ($("reName1")) $("reName1").textContent = fname;
  if ($("reName2")) $("reName2").textContent = fname;
  const b = near.d, dNear = far.d - b, dFar = far.d;
  if (dNear <= 0 || sorted.length < 2) {
    tb.innerHTML = ""; if ($("reHtRows")) $("reHtRows").innerHTML = "";
    if ($("reNote")) $("reNote").textContent = t("re-needtwo");
    return;
  }

  const glob = (dist, h) => globeElev(R, e, dist, h);
  const aFar = glob(dFar, far.h), aNear = glob(dNear, far.h);
  const rec = reconstructTwoStation(b, aFar, aNear, R, e);
  const { tangent, sines, naive, divNaive, divTrue } = rec;
  const hTan = tangent.h, Dt = tangent.D, hSin = sines.h, illc = sines.illConditioned, hNo = naive.h, dNo = naive.d;
  const bR = rec.bOverR;

  const flatAng = Math.atan2(far.h - e, dFar), globeAng = aFar;
  const dm = (v) => { const x = v - far.h; return `${x >= 0 ? "+" : ""}${x.toFixed(1)} m`; };
  const A = (r) => `${(r * AM).toFixed(2)}′ = ${((r * 180) / Math.PI).toFixed(3)}°`;

  const nearNamePart = near.name ? t("re-row-measured-near-name").replace("{key}", near.key).replace("{name}", near.name) : "";
  tb.innerHTML =
    `<tr><td>${t("re-row-measured-obs")}</td><td class="hot">${A(aFar)}</td>` +
      `<td>${t("re-row-measured-obs-note")}</td></tr>` +
    `<tr><td>${t("re-row-measured-near").replace("{near}", nearNamePart)}${t("re-row-measured-near-suffix")}</td><td>${A(aNear)}</td>` +
      `<td>${t("re-row-measured-near-note").replace("{d}", fmtDist(dNear)).replace("{far}", far.name ? far.name : t("re-summit"))}</td></tr>` +
    `<tr><td>${t("re-row-flat")}</td><td class="cold">${A(flatAng)}</td>` +
      `<td class="cold">${t("re-row-flat-note").replace("{v}", ((flatAng - aFar) * AM).toFixed(2))}</td></tr>` +
    `<tr><td>${t("re-row-globe")}</td><td class="hot">${A(globeAng)}</td>` +
      `<td class="hot">${t("re-row-globe-note")}</td></tr>` +
    `<tr><td>${t("re-row-diverge")}</td><td class="cold">${(divNaive * AM).toFixed(2)}′</td>` +
      `<td class="cold">${t("re-row-diverge-note").replace("{v}", (divTrue * AM).toFixed(2)).replace("{x}", (divNaive / divTrue).toFixed(1))}</td></tr>`;

  const okT = Math.abs(hTan - far.h) < 5, okS = !illc && Math.abs(hSin - far.h) < 5;
  const reHtRows = $("reHtRows");
  if (reHtRows) reHtRows.innerHTML =
    `<tr><td>${t("re-ht-tangent")}</td>` +
      `<td class="${okT ? "hot" : "cold"}">${hTan.toFixed(1)} m</td>` +
      `<td class="${okT ? "" : "cold"}">${dm(hTan)}</td>` +
      `<td class="${okT ? "" : "cold"}">${fmtDist(Math.abs(Dt))}</td>` +
      `<td>${okT ? t("re-ht-ok") : t("re-ht-inconsistent")}</td></tr>` +
    `<tr><td>${t("re-ht-sines")}</td>` +
      `<td class="${okS ? "hot" : "cold"}">${illc ? t("re-ht-dash") : hSin.toFixed(1) + " m"}</td>` +
      `<td class="${okS ? "hot" : "cold"}">${illc ? t("re-ht-dash") : dm(hSin)}</td>` +
      `<td>${fmtDist(dFar)}</td>` +
      `<td>${okS ? t("re-ht-recovers") : t("re-ht-dash")}</td></tr>` +
    `<tr><td>${t("re-ht-sines-no-br")}</td>` +
      `<td class="cold">${hNo.toFixed(1)} m</td><td class="cold">${dm(hNo)}</td>` +
      `<td class="cold">${fmtDist(Math.abs(dNo))}</td>` +
      `<td class="cold">${t("re-ht-absurd")}</td></tr>` +
    `<tr><td>${t("re-ht-true")}</td><td><b>${far.h.toFixed(0)} m</b></td><td>${t("re-ht-dash")}</td>` +
      `<td>${fmtDist(dFar)}</td><td>${t("re-ht-dash")}</td></tr>`;

  const pct = (bR / divNaive) * 100;
  const reFlatRows = $("reFlatRows");
  if (reFlatRows) reFlatRows.innerHTML =
    `<tr><td>${t("re-flat-rotation")}</td><td class="hot">${(bR * AM).toFixed(2)}′</td>` +
      `<td>${t("re-flat-rotation-note").replace("{b}", fmtDist(b))}</td></tr>` +
    `<tr><td>${t("re-flat-diff")}</td><td>${(divNaive * AM).toFixed(2)}′</td>` +
      `<td>${t("re-flat-diff-note")}</td></tr>` +
    `<tr><td>${t("re-flat-share")}</td><td class="cold"><b>${pct.toFixed(0)}%</b></td>` +
      `<td class="cold">${t("re-flat-share-note").replace("{cmp}", pct > 100 ? t("re-flat-share-larger") : t("re-flat-share-comparable"))}</td></tr>` +
    `<tr><td>${t("re-flat-truediv")}</td><td class="hot">${(divTrue * AM).toFixed(2)}′</td>` +
      `<td>${t("re-flat-truediv-note").replace("{x}", (divNaive / divTrue).toFixed(1))}</td></tr>` +
    `<tr><td>${t("re-flat-summit")}</td><td class="cold"><b>${fmtDist(Math.abs(dNo))}</b></td>` +
      `<td class="cold">${t("re-flat-summit-note").replace("{v}", fmtDist(dFar)).replace("{x}", (dFar / Math.abs(dNo)).toFixed(1))}</td></tr>`;
  const reFlatNote = $("reFlatNote");
  if (reFlatNote) reFlatNote.innerHTML = t("re-flat-note")
    .replace("{x}", (divNaive / divTrue).toFixed(1)).replace("{near}", fmtDist(Math.abs(dNo))).replace("{far}", fmtDist(dFar));

  const reNote = $("reNote");
  if (reNote) reNote.innerHTML = t("re-note")
    .replace("{b}", fmtDist(b)).replace("{flat}", (flatAng * AM).toFixed(2))
    .replace("{diff}", Math.abs(hTan - (illc ? far.h : hSin)).toFixed(0));
}

function updateRecip(s, ang) {
  const tb = $("recipRows"); if (!tb) return;
  const R = s.Rg, e = s.eye, D = 180 / Math.PI;
  const far = [...ang].sort((a, b) => a.d - b.d).pop();
  const d = far.d, h = far.h;
  const eA = globeElev(R, e, d, h), eB = globeElev(R, h, d, e);
  const zA = 90 - eA * D, zB = 90 - eB * D, sum = zA + zB;
  const excess = sum - 180, th = (d / R) * D;
  const Rrec = d / (excess / D);
  const f = (x) => `${x.toFixed(5)}°`;
  tb.innerHTML =
    `<tr><td>${t("recip-row-zA")}</td><td class="hot">${f(zA)}</td>` +
      `<td>${t("recip-row-zA-note").replace("{v}", (eA * D * 60).toFixed(2))}</td></tr>` +
    `<tr><td>${t("recip-row-zB").replace("{name}", objLabel(far))}</td><td class="hot">${f(zB)}</td>` +
      `<td>${t("recip-row-zB-note").replace("{v}", fmtDist(d))}</td></tr>` +
    `<tr><td>${t("recip-row-sum")}</td><td class="hot"><b>${f(sum)}</b></td>` +
      `<td>${t("recip-row-sum-note")}</td></tr>` +
    `<tr><td>${t("recip-row-flat")}</td><td class="cold"><b>180.00000°</b></td>` +
      `<td class="cold">${t("recip-row-flat-note")}</td></tr>` +
    `<tr><td>${t("recip-row-excess")}</td><td class="hot">+${excess.toFixed(5)}° = ${(excess * 60).toFixed(2)}′</td>` +
      `<td>${t("recip-row-excess-note").replace("{v}", th.toFixed(5))}</td></tr>` +
    `<tr><td>${t("recip-row-radius")}</td>` +
      `<td class="hot"><b>${(Rrec / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km</b></td>` +
      `<td>${s.refr ? t("recip-row-radius-refr").replace("{v}", s.k.toFixed(2)) : t("recip-row-radius-true")}</td></tr>`;
  const note = $("recipNote"); if (!note) return;
  note.innerHTML = t("recip-note").replace("{v}", (excess * 60).toFixed(2));
}

function updateNameTags() {
  for (let i = 0; i < 3; i++) {
    const nm = TARGET_NAMES && TARGET_NAMES[i];
    const full = nm ? nm.n : "", short = nm ? nm.s || nm.n : "";
    const a = $("objName" + (i + 1)), b = $("chipName" + (i + 1));
    if (a) a.textContent = full;
    if (b) b.textContent = short;
  }
  const o = $("obsName"); if (o) o.textContent = OBSERVER_NAME || "";
}

function updateWhy(s, ang) {
  const box = $("whyBox"); if (!box) return;
  const P = CURRENT_PRESET;
  if (!P || !P.why || !s || !s.valid) { box.hidden = true; return; }
  box.hidden = false;
  $("whyTitle").textContent = P.obs ? t("why-title-obs").replace("{v}", P.obs) : P.label;
  $("whyBody").innerHTML = P.why;

  const EPS = 1e-9;
  const sign = (x) => (x > EPS ? 1 : x < -EPS ? -1 : 0);
  let best = null;
  ang.forEach((a) => {
    const sf = sign(a.flat), sg = sign(a.globe);
    const flip = sf > 0 && sg < 0;
    const level = sf === 0 && sg !== 0;
    const score = Math.abs(a.diff) + (flip ? 10 : 0) + (level ? 5 : 0);
    if (!best || score > best.score) best = { a, flip, level, score };
  });
  const a = best.a, R2 = 180 / Math.PI;
  const lines = [];
  lines.push(t("why-line1").replace("{name}", objLabel(a)).replace("{d}", fmtDist(a.d)).replace("{h}", fmtDist(a.h)).replace("{eye}", fmtDist(s.eye)));
  lines.push(t("why-line2").replace("{flat}", fmtAngle(a.flat)).replace("{globe}", fmtAngle(a.globe)).replace("{diff}", fmtDiff(a.diff)));
  if (best.flip) {
    lines.push(t("why-flip"));
  } else if (best.level) {
    lines.push(t("why-level").replace("{v}", fmtAngle(a.globe)));
  } else {
    lines.push(t("why-amount").replace("{v}", ((Math.abs(a.diff) * R2 * 60)).toFixed(1)).replace("{x}", ((Math.abs(a.diff) * R2 * 60) / 31).toFixed(1)));
  }
  const horizon = Math.sqrt(2 * s.Rg * s.eye + s.eye * s.eye);
  const inside = ang.filter((x) => x.d < horizon).length;
  lines.push(t("why-horizon").replace("{v}", fmtDist(horizon)) + (inside === ang.length
    ? t("why-horizon-allin")
    : t("why-horizon-some").replace("{n}", ang.length - inside).replace("{total}", ang.length)
        .replace("{verb}", ang.length - inside > 1 ? t("why-targets-are") : t("why-target-is"))));
  $("whyNum").innerHTML = lines.join("<br>");
}

function updateResults(s, ang) {
  const tb = $("results"); if (!tb) return;
  tb.innerHTML = "";
  ang.forEach((a) => {
    const st = statusFor(s, a);
    const globeCell = s.refr && Math.abs(a.globe - a.globeGeo) > 1e-9
      ? `${fmtAngle(a.globe)}<span class="vac">${t("no-refraction").replace("{v}", fmtAngle(a.globeGeo))}</span>`
      : fmtAngle(a.globe);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><span class="obj-key" style="background:${a.color}"></span>${objLabel(a)}</td>` +
      `<td>${fmtDist(a.d)}</td><td>${fmtDist(a.h)}</td>` +
      `<td class="ang-flat">${fmtAngle(a.flat)}</td>` +
      `<td class="ang-globe">${globeCell}</td>` +
      `<td>${fmtDiff(a.diff)}</td>` +
      `<td class="status ${st.cls}">${st.txt}</td>`;
    tb.appendChild(tr);
  });
  const horizon = Math.sqrt(2 * s.Rg * s.eye + s.eye * s.eye);
  const dipDeg = DEG(Math.acos(s.Rg / (s.Rg + s.eye)));
  const note = $("horizonNote");
  if (note) note.innerHTML = t("results-note").replace("{eye}", s.eye).replace("{horizon}", fmtDist(horizon)).replace("{dip}", dipDeg.toFixed(3)) +
    (s.refr ? t("results-note-refr").replace("{k}", s.k.toFixed(2)).replace("{reff}", (s.Rg / 1000).toFixed(0)) : ``);
  if ($("metaFlat")) $("metaFlat").textContent = t("meta-flat");
  if ($("metaGlobe")) $("metaGlobe").textContent = s.refr
    ? t("meta-globe-refr").replace("{v}", (s.Rg / 1000).toFixed(0)).replace("{k}", s.k.toFixed(2))
    : t("meta-globe-geo").replace("{v}", (s.R / 1000).toLocaleString());
}

function updateExaggUI(box) {
  const fc = $("flatCanvas"); if (!fc) return;
  const { width: W, height: H } = fc.getBoundingClientRect();
  const s = readSimInputs();
  if (!s.valid) return;
  const req = s.exagg;
  const read = $("exaggRead"); if (read) read.textContent = req === 1 ? t("exagg-true") : t("exagg-x").replace("{v}", req);
  const note = $("exaggNote");
  if (note) note.textContent = req > 1
    ? t("exagg-note").replace("{v}", req).replace("{v}", req)
    : "";
}

function updateRefractionUI() {
  const on = $("refr").checked;
  const k = parseFloat($("kcoef").value);
  $("kcoef").disabled = !on;
  const read = $("kRead"); if (!read) return;
  if (Number.isFinite(k) && k < 1) read.textContent = t("k-readout").replace("{k}", k.toFixed(2)).replace("{v}", (1 / (1 - k)).toFixed(2));
  read.style.opacity = on ? 1 : 0.45;
}


/* ---- UNE SEULE VUE À LA FOIS (legacy simSwapView, ~L28531). L'onglet a
   deux vues du même regard : le panneau perspective (triangles), et la
   silhouette DEM (src/core/symbols.js:drawSimFigSil, dessinée dans un
   hôte .figsym plutôt que sur un canvas -- règle FIG). Un seul exemple,
   vieriou, a un profil cuit ; les autres gardent les triangles. */
function simSwapView() {
  const sel = $("presetSel"), fig = document.getElementById("sim-figSil");
  if (!fig) return;
  const has = !!(sel && SIM_PROFILES.includes(sel.value));
  const persp = $("perspCanvas") && $("perspCanvas").closest(".panel");
  const wrap = fig.closest(".fig");
  if (persp) persp.hidden = has;
  if (wrap) wrap.hidden = !has;
  if (has) drawSimFigSil();
}

function setO3(on) {
  $("o3on").checked = on;
  $("o3fields").classList.toggle("off", !on);
  $("d3").disabled = !on; $("h3").disabled = !on; $("az3").disabled = !on;
  const chip = $("chip3"); if (chip) chip.style.display = on ? "" : "none";
}

/* ---- le tan3d (globe-rapporteur tournant, TAN3) n'est pas porté --
   décision epic03/UC06.org. On neutralise son hôte au lieu de laisser un
   canvas muet : le panneau perd sa section 05 démonstrative, garde le
   texte, la table des zéniths réciproques et l'expérience 1. */
function neutralizeTan3() {
  const host = document.getElementById("tan3d");
  const wrap = host && host.closest(".fig");
  if (wrap) wrap.hidden = true;
}

export function render() {
  const simPanel = $("tab-elev");
  if (simPanel && simPanel.hidden) return;
  updateRefractionUI();
  const s = readSimInputs();
  const err = $("err");
  if (!s.valid) { if (err) { err.style.display = "block"; err.textContent = t(s.msg); } return; }
  if (err) err.style.display = "none";
  setR(s.R / 1000); setK(s.k); setRefr(s.refr); // le réglage partagé de la page (settings.js)

  const ang = computeAngles(s);
  const box = boundingBox(s);
  drawPanel($("flatCanvas"), "flat", s, ang, box);
  drawPanel($("globeCanvas"), "globe", s, ang, box);
  drawPerspective($("perspCanvas"), s, ang);
  updateResults(s, ang);
  updateReverse(s, ang);
  updateRecip(s, ang);
  updateNameTags();
  updateWhy(s, ang);
  updateSizes(s, ang);
  updateExaggUI(box);
}

export function applyPreset(key) {
  const P = PRESETS[key]; if (!P) return;
  $("eye").value = P.eye; $("radius").value = P.radius;
  P.o.forEach((o, i) => { $("d" + (i + 1)).value = o.d; $("h" + (i + 1)).value = o.h; $("az" + (i + 1)).value = o.az; });
  setO3(P.third);
  if (P.k !== undefined) { $("kcoef").value = P.k; $("refr").checked = !!P.refr; }
  TARGET_NAMES = P.names || null;
  OBSERVER_NAME = P.obs || null;
  CURRENT_PRESET = P;
  // legacy L24890 : $("presetNote").innerHTML = presetText(P).note + (P.src || "")
  // -- P.src était du HTML d'ancres écrit à la main (#s1-3...) ; ici les
  // mêmes sources sont nommées par id (P.sourceIds) et rendues par cite(),
  // qui garde la numérotation cohérente avec le bloc .srcs de l'onglet.
  const note = $("presetNote");
  if (note) note.innerHTML = (P.note || "") + (P.sourceIds || []).map((id) => cite(KEY, id)).join("");
  if ($("presetSel")) $("presetSel").value = key;
  simSwapView();
  render();
}

export function wire() {
  neutralizeTan3();
  fillPresetSelect("presetSel", PRESETS, t("preset-placeholder"), (P) => P.label);
  $("presetSel")?.addEventListener("change", (e) => { if (e.target.value) applyPreset(e.target.value); simSwapView(); });
  $("form").addEventListener("input", () => {
    const had = TARGET_NAMES || CURRENT_PRESET;
    const note = $("presetNote"); if (note) note.textContent = t("preset-custom");
    if ($("presetSel")) $("presetSel").value = "";
    simSwapView();
    TARGET_NAMES = null; OBSERVER_NAME = null; CURRENT_PRESET = null;
    if (had) render(); else updateWhy(null, null);
  });
  $("pzoom")?.addEventListener("input", render);
  $("perspSwap")?.addEventListener("click", () => { perspSolid = perspSolid === "globe" ? "flat" : "globe"; render(); });
  $("o3on").addEventListener("change", () => { setO3($("o3on").checked); render(); });
  // hh peut aussi écrire k/refr (remote control, comme dans le legacy) : si
  // #kcoef/#refr sont déjà à jour, cette resynchronisation est un no-op --
  // elle ne peut donc pas écraser une frappe en cours dans CE formulaire.
  subscribeSettings(({ k, refr }) => {
    // le formulaire peut ne plus être dans la page (rendu hors navigateur qui retire les onglets montés, 2026-10-20)
    if (!$("kcoef") || !$("refr")) return;
    if (parseFloat($("kcoef").value) !== k) $("kcoef").value = k;
    if ($("refr").checked !== refr) $("refr").checked = refr;
    updateRefractionUI();
  });
  applyPreset("vieriou"); // l'état d'ouverture est produit PAR un preset (piège de boot documenté)
}

export function stop() {}
