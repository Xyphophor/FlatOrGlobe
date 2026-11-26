// Onglet "ref" (réfraction : d'où vient R/(1−k)). Panneau porté VERBATIM
// (flux src/data/prose/ref.js, legacy L8114-8662) ; rendu porté du legacy
// (L18310-18750) : les deux tables calculées (#refKRows, #refCondRows),
// les quatre figures canvas -- Snell couche par couche (vraie intégration),
// les deux cercles (ρ/R = 1/k exact), trois atmosphères sur une planète,
// et l'animation « unbending » (la barre orange ne bouge pas : c'est tout
// le contenu de R_eff) -- et l'expérience 1c (angles zénithaux
// réciproques). Les six schémas symboliques reffig0-5 viennent de
// src/core/symbols.js. Toute la logique numérique est dans logic.js, testée.
//
// « ref » n'est PAS un onglet méta malgré son rangement dans UC09 : c'est
// un onglet de preuve à part entière. LA RÈGLE DU k UNIQUE TIENT : cet
// onglet ne possède pas de k ; ses tables balaient des valeurs documentées.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { setupCanvas } from "../../core/canvas.js";
import { fillTextSub } from "../../core/subscript.js";
import { PROSE } from "../../data/prose/ref.js";
import { SOURCES } from "../../data/sources/ref.js";
import { REF_R, REF_KS, REF_COND, refKRow, refCondRow, reciprocalK } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountCaussolsAir } from "./caussols-air.js";
import { mountBordAir } from "./bord-air.js";
import { mountAirStats } from "./air-stats-fig.js";
import { lasValues } from "./laser.js";
import { mountLaserFig } from "./laserfig.js";
import { mountRefReel } from "./reel.js";
import { R206_MARKS } from "../../data/presets/surv-recip.js";
import { zenValues, airValues } from "./values.js";
import "./style.css";

const KEY = "ref";
const refFmtKm = (m) => (m / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " km";
const DEG = (r) => (r * 180) / Math.PI;

// ---- l'animation « unbending » : UN bouton s de 0 à 1 retire la MÊME
// courbure au rayon et au sol ; leur différence (1−k)/R ne bouge pas. ----
const REF_MORPH_K = 0.13; // le défaut de la page ; les tables balaient k, pas ceci
const REF_MORPH_D = 100000; // m, distance du poteau lointain
const refMorphGap = (d) => (1 - REF_MORPH_K) * d * d / (2 * REF_R);

// ---- Route 206 (2026-10-07) : la ligne de Kozlowski sur un fond OpenStreetMap figé (16 tuiles du
// zoom 15 dans public/maps/ref-r206/, research/build_r206_map.py) ; les repères sont placés d'après
// leurs coordonnées publiées, en Mercator web, nord en haut. Aucune requête vers OSM.
const R206_Z = 15, R206_TX = [9580, 9583], R206_TY = [12400, 12403];
const mercPx = (lat, lon) => { const n = 256 * 2 ** R206_Z, r = lat * Math.PI / 180;
  return [(lon + 180) / 360 * n, (1 - Math.asinh(Math.tan(r)) / Math.PI) / 2 * n]; };
const markDeg = (m) => [Math.sign(m[0]) * (Math.abs(m[0]) + m[1] / 60 + m[2] / 3600), Math.sign(m[3]) * (Math.abs(m[3]) + m[4] / 60 + m[5] / 3600)];

export default {
  key: KEY,
  label: "Refraction",

  mount(container) {
    registerSources(KEY, SOURCES);
    const lang = document.documentElement.lang || "en";
    this._t = makeT(lang, KEY);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const q = (s) => container.querySelector(s);
    this._el = { kRows: q("#refKRows"), condRows: q("#refCondRows"), snell: q("#refSnellCanvas"), circles: q("#refCirclesCanvas"),
      cases: q("#refCasesCanvas"), morph: q("#refMorphCanvas"), morphReads: q("#refMorphReads"),
      frCurved: q("#refFrCurved"), frStraight: q("#refFrStraight"), play: q("#refPlay"),
      r206Map: q("#refR206Map") };   // l'expérience 1c est dans falsify (exp.js, 2026-11-26)
    this._morph = { s: 0, running: false, dir: 1, hold: 0, last: 0, raf: 0, readAt: 0 };
    this._container = container;
    const on = (el, fn) => el && el.addEventListener("click", fn);
    on(this._el.frCurved, () => { this._morphSet(0, false); this._drawMorph(); this._morphReads(); });
    on(this._el.frStraight, () => { this._morphSet(1, false); this._drawMorph(); this._morphReads(); });
    on(this._el.play, () => { const m = this._morph; m.dir = m.s > 0.5 ? -1 : 1; m.hold = 0;
      this._morphSet(m.s, !m.running); this._drawMorph(); this._morphReads(); });
    this._frame = (ts) => this._morphFrame(ts);
    // export (epic10/UC02) : un cycle complet (pause 1,1 s, 3,5 s aller, pause, 3,5 s retour = 9,2 s)
    if (this._el.morph) {
      let saved = null;
      const sAt = (t) => { const u = t % 9.2; return u < 1.1 ? 0 : u < 4.6 ? (u - 1.1) / 3.5 : u < 5.7 ? 1 : 1 - (u - 5.7) / 3.5; };
      this._el.morph.__anim = {
        duration: 9.2,
        begin: () => { const m = this._morph; saved = { ...m }; if (m.raf) cancelAnimationFrame(m.raf); m.raf = 0; },
        frameAt: (t) => { this._morph.s = sAt(t); this._drawMorph(); this._morphReads(); },
        end: () => { Object.assign(this._morph, saved, { raf: 0, last: 0 }); saved = null; this._drawMorph(); this._morphReads(); this._morphStart(); },
        readout: () => this._el.morphReads?.textContent.replace(/\s+/g, " ").trim(),
      };
    }
    if (this._el.r206Map && typeof Image === "function") {
      this._tiles = new Map();
      for (let x = R206_TX[0]; x <= R206_TX[1]; x++) for (let y = R206_TY[0]; y <= R206_TY[1]; y++) {
        const img = new Image(); img.onload = () => this._drawR206Map(); img.src = `/maps/ref-r206/${R206_Z}_${x}_${y}.png`;
        this._tiles.set(`${x}_${y}`, img);
      }
    }
    this._fillTables();
    // les lignes réciproques de Schott (2026-10-28) : valeurs des span.cv de la section rf-hsp4
    const zv = { ...zenValues(lang), ...lasValues(lang), ...airValues(lang) };
    container.querySelectorAll("span.cv[data-v]").forEach((sp) => { const v = zv[sp.dataset.v]; if (v != null) sp.textContent = v; });
    drawSymbols(KEY);
    drawFormulaFigs(container, (k, fb) => { const v = this._t(k); return v && v !== k ? v : fb; });   // epic15/UC03 : une figure par formule
    // exemple de la jauge de réfraction (2026-10-14) : l'air qu'il faut à chaque modèle pour le dip mesuré à Caussols
    const tv = (k, fb, vars = {}) => { let v = this._t(k); if (!v || v === k) v = fb; for (const [a, b] of Object.entries(vars)) v = v.split(`{${a}}`).join(b); return v; };
    this._caus = mountCaussolsAir(container, tv, lang);
    // la même question à Bordighera (hauteur cachée, rayons tracés), puis la statistique de toutes les photos (2026-11-13)
    this._bord = mountBordAir(container, tv, lang);
    this._stats = mountAirStats(container, tv, lang);
    this.ready = this._stats.ready;   // les lignes des contributions arrivent à la demande (mode IA, banc de montage)
    // section laser (2026-10-31) : le faisceau tracé dans quatre airs, globe et plan
    const lc = q("#refLaserCanvas");
    if (lc) { const tl = Object.assign((k, fb) => tv(k, fb), { lang }); this._laser = mountLaserFig(lc, q("#refLaserReads"), tl); }
    // la vitrine (2026-10-31)
    const rc = q("#refReel"); this._reel = rc ? mountRefReel(rc, (k, fb) => tv(k, fb), lang) : null;
  },

  render() {
    this._fillTables();
    this._drawSnell(); this._drawCircles(); this._drawCases(); this._drawR206Map(); this._caus?.(); this._bord?.(); this._stats?.(); this._laser?.start(); this._reel?.start();
    this._morph.last = 0; // timestamp périmé après un changement d'onglet
    this._drawMorph(); this._morphReads(); this._morphStart();
  },

  teardown() {
    this._laser?.stop(); this._reel?.stop();
    if (this._morph.raf) { cancelAnimationFrame(this._morph.raf); this._morph.raf = 0; }
  },

  _fillTables() {
    const e = this._el, t = this._t;
    if (e.kRows) e.kRows.innerHTML = REF_KS.map((row) => { const r = refKRow(row);
      const cls = r.k < 0 ? "cold" : (r.k === 0.13 ? "hot" : "");
      return `<tr><td class="${cls}"><b>${r.k.toFixed(3)}</b> <span style="color:var(--ink-soft)">· ${t(r.t)}</span></td>` +
        `<td>${r.rhoStr}</td><td>${r.ratioStr}</td><td>${r.reffStr}</td><td>${r.horizon}</td><td>${r.hidden}</td></tr>`; }).join("");
    if (e.condRows) e.condRows.innerHTML = REF_COND.map((row) => { const r = refCondRow(row);
      const cls = r.k < -0.01 ? "cold" : (r.k > 0.9 ? "cold" : "");
      const cmp = Math.abs(r.k) < 0.005 ? t("cmp-straight")
        : r.k < 0 ? t("cmp-opposite").replace("{k}", Math.abs(r.k).toFixed(2))
        : t("cmp-same").replace("{k}", r.k.toFixed(2));
      return `<tr><td>${t(r.c)}</td><td>${r.dt.toFixed(4).replace("-", "−")} K/m</td>` +
        `<td class="${cls}"><b>${r.k.toFixed(2).replace("-", "−")}</b></td><td>${cmp}</td><td>${t(r.s)}</td></tr>`; }).join("");
  },

  // ---- expérience 1c : angles zénithaux réciproques (les hauteurs de station s'annulent) ----

  // ---- figure 1 : Snell couche par couche (vraie intégration, n_i sin θ_i constant) ----
  _drawSnell() {
    const cv = this._el.snell; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); if (!W) return;
    const narrow = W < 520;
    const padT = 16, padB = 30, padL = 12, padR = narrow ? 12 : 54;
    const NL = 13, dn = 0.00015;
    const n = (i) => 1 - i * dn; // couche 0 = bas (la plus dense)
    const th0 = 87 * Math.PI / 180; // depuis la verticale, en montant
    const C = n(0) * Math.sin(th0);
    const up = [{ x: 0, l: 0 }];
    let x = 0;
    for (let i = 0; i < NL - 1; i++) {
      const s = C / n(i);
      if (s >= 1) break;
      x += Math.tan(Math.asin(s));
      up.push({ x, l: i + 1 });
    }
    const pts = up.concat(up.slice(0, -1).reverse().map((p) => ({ x: 2 * x - p.x, l: p.l })));
    const xmax = 2 * x;
    const bandH = (H - padT - padB) / NL;
    const sx = (W - padL - padR) / xmax;
    const PX = (p) => padL + p.x * sx;
    const PY = (p) => H - padB - p.l * bandH;
    for (let i = 0; i < NL; i++) {
      const a = 0.045 + 0.055 * (1 - i / NL);
      ctx.fillStyle = `rgba(29,78,216,${a.toFixed(3)})`;
      ctx.fillRect(padL, H - padB - (i + 1) * bandH, W - padL - padR, bandH);
      ctx.strokeStyle = "rgba(21,26,33,.10)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, H - padB - i * bandH); ctx.lineTo(W - padR, H - padB - i * bandH); ctx.stroke();
    }
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "#8b93a0"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(PX(pts[0]), PY(pts[0])); ctx.lineTo(PX(pts[pts.length - 1]), PY(pts[pts.length - 1])); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.4; ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(PX(p), PY(p)) : ctx.moveTo(PX(p), PY(p)));
    ctx.stroke();
    ctx.strokeStyle = "#c2410c"; ctx.lineWidth = 1.6;
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = PX(pts[i]), ay = PY(pts[i]), bx = PX(pts[i + 1]), by = PY(pts[i + 1]);
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const L = Math.hypot(bx - ax, by - ay) || 1;
      const ux = -(by - ay) / L, uy = (bx - ax) / L, t = 9;
      ctx.beginPath(); ctx.moveTo(mx - ux * t, my - uy * t); ctx.lineTo(mx + ux * t, my + uy * t); ctx.stroke();
    }
    ctx.fillStyle = "#151a21";
    [pts[0], pts[pts.length - 1]].forEach((p) => { ctx.beginPath(); ctx.arc(PX(p), PY(p), 3.4, 0, 7); ctx.fill(); });
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "left";
    ctx.fillText(this._t("snell-thin"), padL + 6, padT + 4);
    ctx.fillText(this._t("snell-dense"), padL + 6, H - padB - 6);
    if (!narrow) { ctx.textAlign = "right"; ctx.fillText(this._t("snell-turning"), W - padR - 4, PY(pts[Math.floor(pts.length / 2)]) - 8); }
    ctx.textAlign = "left"; ctx.fillStyle = "#8b93a0";
    ctx.fillText(this._t("snell-exagg"), padL + 6, H - 10);
  },

  // ---- figure 2 : les deux cercles (petite planète, échelle uniforme, ρ/R = 1/k EXACT) ----
  _drawR206Map() {
    const cv = this._el.r206Map; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv); if (!W) return;
    const t = this._t, tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    const [A, B] = R206_MARKS.y2016.map(markDeg), pA = mercPx(...A), pB = mercPx(...B);
    // cadrage : la ligne au milieu, toute sa longueur et une marge, à l'échelle commune des deux axes
    const span = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]), sc = Math.min(W, H) / (span * 1.55);
    const cxp = (pA[0] + pB[0]) / 2, cyp = (pA[1] + pB[1]) / 2, X = (px) => W / 2 + (px - cxp) * sc, Y = (py) => H / 2 + (py - cyp) * sc;
    ctx.fillStyle = "#f2efe9"; ctx.fillRect(0, 0, W, H);
    for (const [k, img] of this._tiles || []) {
      if (!img.complete || !img.naturalWidth) continue;
      const [tx, ty] = k.split("_").map(Number);
      ctx.drawImage(img, X(tx * 256), Y(ty * 256), 256 * sc + 0.5, 256 * sc + 0.5);
    }
    // la ligne et les deux repères
    ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(X(pA[0]), Y(pA[1])); ctx.lineTo(X(pB[0]), Y(pB[1])); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "600 12px system-ui, sans-serif"; ctx.textBaseline = "middle";
    for (const [p, lab] of [[pA, "MP 27"], [pB, "MP 28"]]) {
      ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 5.5, 0, 2 * Math.PI); ctx.fillStyle = "#1d4ed8"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.textAlign = "right"; ctx.lineWidth = 3.5; ctx.strokeText(lab, X(p[0]) - 10, Y(p[1])); ctx.fillStyle = "#151a21"; ctx.fillText(lab, X(p[0]) - 10, Y(p[1]));
    }
    const sKm = "1.54 km".replace(".", tr("r206map-dec", "."));
    ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.lineWidth = 3; ctx.strokeStyle = "#fff";
    const lx = X(cxp) + 14, ly = Y(cyp);
    ctx.font = "600 12px system-ui, sans-serif"; ctx.strokeText(sKm, Math.min(lx, W - 6 - ctx.measureText(sKm).width), ly); ctx.fillStyle = "#1d4ed8"; ctx.fillText(sKm, Math.min(lx, W - 6 - ctx.measureText(sKm).width), ly);
    // échelle (Mercator : mètres par pixel à cette latitude) et nord
    const mPerPx = 40075016.686 * Math.cos(A[0] * Math.PI / 180) / (256 * 2 ** R206_Z) / sc, bar = 500 / mPerPx;
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(6, H - 30, bar + 56, 24);
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, H - 14); ctx.lineTo(12 + bar, H - 14); ctx.moveTo(12, H - 19); ctx.lineTo(12, H - 9); ctx.moveTo(12 + bar, H - 19); ctx.lineTo(12 + bar, H - 9); ctx.stroke();
    ctx.fillStyle = "#151a21"; ctx.font = "11px system-ui, sans-serif"; ctx.fillText("500 m", 18 + bar, H - 14);
    ctx.textAlign = "center"; ctx.font = "600 12px system-ui, sans-serif"; ctx.fillText("N", W - 18, 36);
    ctx.beginPath(); ctx.moveTo(W - 18, 44); ctx.lineTo(W - 23, 58); ctx.lineTo(W - 13, 58); ctx.closePath(); ctx.fill();
    // crédit des données (ODbL) et lieu
    const cr = "© OpenStreetMap contributors";
    ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "right"; const cw = ctx.measureText(cr).width;
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(W - cw - 10, H - 16, cw + 10, 16); ctx.fillStyle = "#5b6470"; ctx.fillText(cr, W - 5, H - 8);
    ctx.textAlign = "left"; ctx.font = "600 11px system-ui, sans-serif"; const place = tr("r206map-place", "Route 206, New Jersey (40.03° N, 74.73° W)");
    ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.strokeText(place, 8, 14); ctx.fillStyle = "#151a21"; ctx.fillText(place, 8, 14);
    ctx.textBaseline = "alphabetic";
  },

  _drawCircles() {
    const cv = this._el.circles; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); if (!W) return;
    const k = 0.13, dkm = 100;
    const padL = 46, padR = 16, padT = 30, padB = 26;
    const Wd = W - padL - padR;
    const Rp = Wd * Wd / (2 * 0.60 * (H - padT - padB));
    const Rr = Rp / k;
    const x0 = padL, y0 = padT;
    const yE = (x) => y0 + Rp - Math.sqrt(Math.max(0, Rp * Rp - x * x));
    const yL = (x) => y0 + Rr - Math.sqrt(Math.max(0, Rr * Rr - x * x));
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "#8b93a0"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Wd, y0); ctx.stroke();
    ctx.setLineDash([]);
    const arc = (f, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
      for (let i = 0; i <= 220; i++) { const x = Wd * i / 220; i ? ctx.lineTo(x0 + x, f(x)) : ctx.moveTo(x0 + x, f(x)); }
      ctx.stroke(); };
    arc(yL, "#0f766e", 2.4); // le trajet de la lumière
    arc(yE, "#7a6a4f", 2.6); // le sol
    const xe = Wd;
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0 + xe, yL(xe)); ctx.lineTo(x0 + xe, yE(xe)); ctx.stroke();
    ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0 + xe, y0); ctx.lineTo(x0 + xe, yL(xe)); ctx.stroke();
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(x0, y0, 4, 0, 7); ctx.fill();
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.fillStyle = "#5b6470"; ctx.fillText(this._t("word-eye"), x0 + 6, y0 - 8);
    ctx.textAlign = "right";
    ctx.fillStyle = "#0f766e"; ctx.fillText(this._t("circ-light"), x0 + xe - 6, yL(xe) - 8);
    ctx.fillStyle = "#7a6a4f"; ctx.fillText(this._t("circ-ground"), x0 + xe - 6, yE(xe) - 6);
    ctx.fillStyle = "#b45309"; fillTextSub(ctx, this._t("circ-gap"), x0 + xe - 6, (yL(xe) + yE(xe)) / 2 + 4);
    ctx.textAlign = "left"; ctx.fillStyle = "#8b93a0";
    const ex = Wd * (REF_R / 1000) / (Rp * dkm);
    ctx.fillText(this._t("circ-note").replace("{ex}", ex.toFixed(0)).replace("{dkm}", dkm).replace("{ratio}", (1 / k).toFixed(1)), padL, H - 8);
  },

  // ---- figure 3 : trois atmosphères sur une planète (rayon rasant sous chaque k) ----
  _drawCases() {
    const cv = this._el.cases; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); if (!W) return;
    const narrow = W < 600;
    const padL = 20, padR = narrow ? 20 : 104, padT = narrow ? 62 : 24, padB = 30;
    const Wd = W - padL - padR, Hd = H - padT - padB;
    const Rp = Wd * Wd / (2 * 0.72 * Hd);
    const eh = 0.55 * 0.55 * Wd * Wd / (2 * Rp);
    const x0 = padL, yEye = padT, ys = padT + eh;
    const drop = (x) => Rp - Math.sqrt(Math.max(0, Rp * Rp - x * x));
    const yg = (x) => ys + drop(x);
    ctx.fillStyle = "rgba(122,106,79,.14)";
    ctx.beginPath(); ctx.moveTo(x0, yg(0));
    for (let i = 0; i <= 240; i++) { const x = Wd * i / 240; ctx.lineTo(x0 + x, yg(x)); }
    ctx.lineTo(x0 + Wd, H); ctx.lineTo(x0, H); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const x = Wd * i / 240; i ? ctx.lineTo(x0 + x, yg(x)) : ctx.moveTo(x0 + x, yg(x)); }
    ctx.stroke();
    const cases = [
      { k: -1, col: "#b45309", dash: null, lbl: this._t("cases-hot") },
      { k: 0, col: "#151a21", dash: null, lbl: this._t("cases-straight") },
      { k: 0.17, col: "#0f766e", dash: null, lbl: this._t("cases-standard") },
      { k: 1, col: "#6d28d9", dash: [6, 4], lbl: this._t("cases-duct") },
    ];
    ctx.font = "11px ui-monospace, Menlo, monospace";
    cases.forEach((c) => {
      const duct = c.k >= 1;
      const Re = duct ? Infinity : Rp / (1 - c.k);
      const xh = duct ? Wd : Math.min(Wd, Math.sqrt(2 * eh * Re));
      const Hx = (x) => duct ? eh : (x - xh) * (x - xh) / (2 * Re);
      ctx.strokeStyle = c.col; ctx.lineWidth = 2.1; ctx.setLineDash(c.dash || []);
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) { const x = xh * i / 240, y = yg(x) - Hx(x); i ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0 + x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      if (!duct) { ctx.strokeStyle = c.col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0 + xh, yg(xh) - 7); ctx.lineTo(x0 + xh, yg(xh) + 7); ctx.stroke(); }
      if (!narrow) { ctx.fillStyle = c.col; ctx.textAlign = "left"; ctx.fillText(c.lbl, x0 + Wd + 6, yg(Math.min(xh, Wd)) - Hx(Math.min(xh, Wd)) + 4); }
    });
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(x0, yEye, 4, 0, 7); ctx.fill();
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "left"; ctx.fillText(this._t("word-eye"), x0 + 7, yEye - 7);
    if (narrow) cases.forEach((c, i) => { ctx.fillStyle = c.col; ctx.fillText(c.lbl, padL, 14 + i * 13); });
    ctx.fillStyle = "#8b93a0";
    const ex = Wd * (REF_R / 1000) / (Rp * 100);
    ctx.fillText(this._t("cases-note").replace("{ex}", ex.toFixed(0)), padL, H - 9);
  },

  // ---- l'animation « unbending » ----
  _morphSet(s, run) {
    const m = this._morph, e = this._el;
    m.s = s; m.running = run;
    if (e.frCurved) e.frCurved.setAttribute("aria-pressed", String(!run && s < 0.5));
    if (e.frStraight) e.frStraight.setAttribute("aria-pressed", String(!run && s > 0.5));
    if (e.play) { e.play.setAttribute("aria-pressed", String(run)); e.play.innerHTML = run ? "&#10073;&#10073;" : "&#9654;"; }
    if (run) this._morphStart();
  },
  _morphReads() {
    const el = this._el.morphReads; if (!el) return;
    const t = this._t;
    const s = this._morph.s, k = REF_MORPH_K;
    const rho = (1 - s) * k <= 1e-6 ? Infinity : REF_R / ((1 - s) * k);
    const Rs = REF_R / (1 - s * k);
    el.innerHTML =
      `<span class="r"><span class="dot" style="background:#0f766e"></span>${t("morph-ray-radius").replace("{rho}", rho === Infinity ? t("morph-ray-straight") : refFmtKm(rho))}</span>` +
      `<span class="r"><span class="dot" style="background:#7a6a4f"></span>${t("morph-earth-radius").replace("{Rs}", refFmtKm(Rs))}</span>` +
      `<span class="r">${t("morph-unbent").replace("{pct}", (s * 100).toFixed(0))}</span>` +
      `<span class="r"><span class="dot" style="background:#b45309"></span>${t("morph-hidden").replace("{m}", refMorphGap(REF_MORPH_D).toFixed(0)).replace("{unchanged}", t("morph-unchanged"))}</span>`;
  },
  _drawMorph() {
    const cv = this._el.morph; if (!cv) return;
    const { ctx, W, H } = setupCanvas(cv);
    ctx.clearRect(0, 0, W, H); if (!W) return;
    const s = this._morph.s, k = REF_MORPH_K;
    const padL = 34, padR = 30, padT = 36, padB = 30;
    const Wd = W - padL - padR, Hd = H - padT - padB;
    const Rp = Wd * Wd / (2 * 0.62 * Hd);
    const x0 = padL, y0 = padT;
    const yGround = (x) => y0 + (1 - s * k) * x * x / (2 * Rp);
    const yRay = (x) => y0 + (1 - s) * k * x * x / (2 * Rp);
    const arc = (f, col, w, dash) => { ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
      for (let i = 0; i <= 220; i++) { const x = Wd * i / 220; i ? ctx.lineTo(x0 + x, f(x)) : ctx.moveTo(x0 + x, f(x)); }
      ctx.stroke(); ctx.setLineDash([]); };
    // ciel et sol remplis (2026-09-24) : même géométrie, plus de matière
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#e3edf6"); sky.addColorStop(1, "#f7f4ec");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.beginPath();
    for (let i = 0; i <= 220; i++) { const x = Wd * i / 220; i ? ctx.lineTo(x0 + x, yGround(x)) : ctx.moveTo(x0 + x, yGround(x)); }
    ctx.lineTo(x0 + Wd, H); ctx.lineTo(x0, H); ctx.closePath();
    const soil = ctx.createLinearGradient(0, y0, 0, H);
    soil.addColorStop(0, "#d8ccb2"); soil.addColorStop(1, "#b9a987");
    ctx.fillStyle = soil; ctx.fill();
    arc(() => y0, "#c9ced6", 1.3, [5, 4]);
    arc(yGround, "#7a6a4f", 2.6);
    arc(yRay, "rgba(15,118,110,.18)", 8);          // halo du rayon
    arc(yRay, "#0f766e", 2.4);
    const xe = Wd, gTop = yRay(xe), gBot = yGround(xe);
    ctx.strokeStyle = "rgba(21,26,33,.30)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0 + xe, gBot); ctx.lineTo(x0 + xe, gTop - 22); ctx.stroke();
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 7; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(x0 + xe, gBot); ctx.lineTo(x0 + xe, gTop); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(x0, y0, 4, 0, 7); ctx.fill();
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "left"; ctx.fillText(this._t("word-eye"), x0 + 7, y0 - 7);
    ctx.textAlign = "right";
    ctx.fillStyle = "#0f766e"; ctx.fillText(s > 0.985 ? this._t("morph-light-straight") : this._t("morph-light"), x0 + xe - 14, yRay(xe) - 10);
    ctx.fillStyle = "#7a6a4f"; ctx.fillText(s < 0.015 ? this._t("morph-ground-r") : this._t("morph-ground-inflated"), x0 + xe - 14, yGround(xe) + 16);
    ctx.fillStyle = "#b45309"; ctx.textAlign = "left";
    ctx.fillText(this._t("morph-hidden-canvas").replace("{m}", refMorphGap(REF_MORPH_D).toFixed(0)), x0 + xe - 108, (gTop + gBot) / 2 + 4);
    ctx.textAlign = "center"; ctx.fillStyle = "#5b6470";
    ctx.fillText(this._t("morph-subtitle").replace("{pct}", (s * 100).toFixed(0)), W / 2, 16);
    const ex = Wd * (REF_R / 1000) / (Rp * (REF_MORPH_D / 1000));
    ctx.fillStyle = "#8b93a0"; ctx.textAlign = "left";
    ctx.fillText(this._t("morph-footer").replace("{k}", k).replace("{span}", REF_MORPH_D / 1000).replace("{ex}", ex.toFixed(0)), padL, H - 9);
  },
  _morphFrame(ts) {
    const m = this._morph;
    m.raf = 0;
    if (!this._el.morph || this._container.hidden) return; // onglet fermé : la boucle meurt
    const now = ts / 1000;
    if (m.last && now - m.last < 0.032) { m.raf = requestAnimationFrame(this._frame); return; } // ~30 i/s
    const dt = m.last ? Math.min(0.08, now - m.last) : 0;
    m.last = now;
    if (m.running && dt > 0) {
      if (m.hold > 0) { m.hold -= dt; }
      else {
        m.s += m.dir * dt / 3.5; // 3,5 s dans chaque sens
        if (m.s >= 1) { m.s = 1; m.dir = -1; m.hold = 1.1; }
        if (m.s <= 0) { m.s = 0; m.dir = 1; m.hold = 1.1; }
      }
    }
    this._drawMorph();
    if (now - m.readAt > 0.15) { this._morphReads(); m.readAt = now; }
    if (m.running) this._morphStart();
  },
  _morphStart() {
    const m = this._morph;
    if (m.raf || !m.running) return;
    if (!this._el.morph || this._container.hidden) return;
    m.raf = requestAnimationFrame(this._frame);
  },
};
