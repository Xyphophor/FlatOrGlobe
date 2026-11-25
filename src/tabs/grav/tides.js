// Onglet grav : pourquoi deux marées par jour (epic37/UC01, 2026-11-13, demande du propriétaire : « une animation qui
// montre pourquoi il y a 2 marées et pourquoi ça correspond très bien à la gravité au globe et Kepler »).
// Six scènes : la Terre et la Lune autour de leur barycentre (échelle vraie) ; l'attraction de la Lune moins celle du
// centre ; les deux bosses et la Terre qui tourne dessous ; le Soleil, vives-eaux et mortes-eaux ; la déclinaison ;
// le meilleur cas plat (une bosse). Les hauteurs d'eau sont agrandies et le facteur est écrit (règle 1).
// Figures des marégraphes (spectre, mars 2018) et tableau : mêmes données que fog build grav-tides.
import { anim2d, text, disc, arrow, pow10, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp } from "../../core/formfigs.js";
import { jdFromUTC, sun, moon, deltaT } from "../../core/ephemeris.js";
import { TIDE_GAUGES, TIDE_SPEC, TIDE_EXCERPT, TIDE_YEAR } from "../../data/presets/grav-tides.js";
import { TICON_BASINS } from "../../data/presets/grav-ticon.js";
import { keplerRatio, tidalAccel, equiShape, flatShape, portHeight, gaugeRows, equiRatio, ellipseN2, periodH, beatDays, D_MOON, MASS_RATIO, T_MONTH, T_YEAR, T_SYN } from "./tides-logic.js";

const TAU = 2 * Math.PI, D2R = Math.PI / 180;
const SUN = "#d97706", WATER = "#cfe8f3", LAND = "#e7e3da";
/** Nombre de lignes de text(…, { maxW }) : coupure aux espaces, comme fillTextFit pour ces phrases. */
function lineCount(ctx, s, maxW, size) {
  ctx.font = `${size}px system-ui, sans-serif`;
  let n = 1, cur = "";
  for (const w of String(s).split(" ")) { const t = cur ? cur + " " + w : w; if (cur && ctx.measureText(t).width > maxW) { n++; cur = w; } else cur = t; }
  return n;
}
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
// hauteur d'équilibre de la Lune (m) : (M_L/M_T)(R/d)³ R, et l'agrandissement des dessins
const H_EQ = (1 / MASS_RATIO) * (1 / D_MOON) ** 3 * 6.371e6;
const SCENES = [0, 0.13, 0.31, 0.49, 0.68, 0.84, 1];

/** Courbe d'un port en bas du cadre : f(t) pour t ∈ [0, tMax], tracée jusqu'à tNow. */
function strip(ctx, x0, y0, w, h, f, tMax, tNow, o = {}) {
  ctx.fillStyle = "#f4f2ec"; ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + h / 2); ctx.lineTo(x0 + w, y0 + h / 2); ctx.stroke();
  for (const [tt, lab] of o.ticks || []) { const x = x0 + w * tt / tMax; ctx.strokeStyle = "#d6d2c8"; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke(); if (lab) text(ctx, lab, x + 2, y0 + h - 4, { size: 9.5, c: SOFT }); }
  const n = Math.max(2, Math.round(w)), lo = o.lo ?? -1, hi = o.hi ?? 1, Y = (v) => y0 + h - 6 - (v - lo) / (hi - lo) * (h - 12);
  ctx.strokeStyle = o.c || GLOBE; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const t = tMax * i / n; if (t > tNow) break; const x = x0 + w * i / n, y = Y(f(t)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  if (tNow <= tMax) { const x = x0 + w * tNow / tMax; disc(ctx, x, Y(f(tNow)), 3.2, o.c || GLOBE); }
  if (o.title) text(ctx, o.title, x0, y0 - 4, { size: 10, c: SOFT });
}

/** La couche d'eau autour d'une Terre de rayon r (px) : r(θ) = r + w0 + hgt(θ). */
function water(ctx, cx, cy, r, w0, hgt, col = SEA) {
  ctx.beginPath();
  for (let i = 0; i <= 180; i++) { const a = TAU * i / 180, rr = r + w0 + hgt(a); const x = cx + rr * Math.cos(a), y = cy - rr * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath(); ctx.fillStyle = WATER; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
  disc(ctx, cx, cy, r, LAND, "#b9b2a3", 1);
}

export function mountTideAnim(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const SR = keplerRatio();
  const near = (tidalAccel(0).pull[0] - 1) * 100, far = (1 - tidalAccel(Math.PI).pull[0]) * 100;
  const CAPS = (s, k) => [
    tr("td-c1", "Neither body is held up: each falls towards the other and misses, once a month around their common centre. The whole Earth falls towards the Moon with the pull its centre feels."),
    clamp((k - 0.42) / 0.3) < 0.5 ? tr("td-c2a", "Near side +{n} %, far side −{f} % compared with the centre: the pull weakens with distance.").replace("{n}", nf(near, 1)).replace("{f}", nf(far, 1))
      : tr("td-c2b", "Take away what the centre feels (the whole Earth falls with it): the rest stretches the Earth along the line to the Moon and squeezes it across. Two bulges, not one."),
    tr("td-c3", "The bulges stay lined up with the Moon while the Earth turns under them: every port passes under one bulge, then the other. High water every 12 h 25 min, 50 minutes later each day, as the Moon rises 50 minutes later."),
    tr("td-c4", "Kepler III, GM/d³ = (2π/T)², gives the Sun's pull against the Moon's from the month, the year and the masses: (27.32/365.26)² × (1 + 81.3) = {r}. Aligned at new and full moon: spring tides; at right angles: neap tides, every 14.77 days.").replace("{r}", nf(SR, 2)),
    tr("td-c5", "Tilted bulges: the port passes through the thick part of one and the edge of the other. One high is bigger than the other each day; where the sea damps the 12-hour wave, only the daily one is left, as at Pensacola."),
    tr("td-c6", "Water climbs towards a pull. On a plane every point is on the same side of the Moon, so there is one hump, under it, and one high water a day. The far-side bulge needs a body that falls towards the Moon as a whole: a globe."),
  ][s];
  // 44 s : les vidéos des cartes s'arrêtent à 45 s (règle du propriétaire) ; à 52 s la scène 6 (le plat) était coupée (2026-11-21)
  return anim2d(canvas, { span: 44, u0: 0.33, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    let s = 0; while (s < SCENES.length - 2 && u >= SCENES[s + 1]) s++;
    const k = clamp((u - SCENES[s]) / (SCENES[s + 1] - SCENES[s]) / 0.88);            // 12 % d'arrêt sur image
    const narrow = W < 560, M = 10;
    const titles = [tr("td-t1", "1. The Earth and the Moon fall around each other"), tr("td-t2", "2. The Moon pulls the near side harder than the far side"),
      tr("td-t3", "3. Two bulges, and the Earth turns under them"), tr("td-t4", "4. The Sun adds a smaller pair: spring and neap tides"),
      tr("td-t5", "5. The Moon off the equator: the two tides of a day differ"), tr("td-t6", "6. The flat model's best case: a nearby Moon over a plane")];
    const n1 = text(ctx, titles[s], M, 17, { size: 12.5, bold: true, maxW: W - 2 * M });
    let y = 17 + n1 * 16;
    const stripH = s >= 2 ? (narrow ? 92 : 104) : 0, capTxt = CAPS(s, k), capH = lineCount(ctx, capTxt, W - 2 * M, 10.5) * 14 + 6;
    const stY = y + 8, vTop = y + 22, vBot = H - stripH - capH - 8, vh = vBot - vTop, cx = W / 2, cy = vTop + vh / 2;
    const cap = (str) => text(ctx, str, M, H - capH + 10, { size: 10.5, c: INK, maxW: W - 2 * M });
    const stampTop = (str, warn = true) => { ctx.save(); text(ctx, str, W - M, stY, { size: 10, c: warn ? FLAT : SOFT, align: "right", maxW: narrow ? W - 2 * M : W * 0.5 }); ctx.restore(); };
    const sX = M, sY = H - stripH - capH - 2, sW = W - 2 * M;

    if (s === 0) {
      // échelle vraie : distance 60,27 R, barycentre à 0,73 R du centre de la Terre
      const re = Math.min(W - 2 * M - 40, vh - 40) / (D_MOON * 2 + 4), dB = D_MOON / (1 + MASS_RATIO), a = TAU * 0.9 * ease(k);
      const bx = cx, by = cy, ex = bx - dB * re * Math.cos(a), ey = by + dB * re * Math.sin(a), mx = bx + (D_MOON - dB) * re * Math.cos(a), my = by - (D_MOON - dB) * re * Math.sin(a);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx, by, (D_MOON - dB) * re, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      disc(ctx, ex, ey, re, "#6fa8dc", SEA, 1); disc(ctx, mx, my, Math.max(1.5, re * 0.273), "#a8a29e", INK, 1);
      ctx.strokeStyle = FLAT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx - 5, by); ctx.lineTo(bx + 5, by); ctx.moveTo(bx, by - 5); ctx.lineTo(bx, by + 5); ctx.stroke();
      text(ctx, tr("td-earth", "Earth"), ex, ey - re - 6, { size: 10.5, c: SEA, align: "center" });
      text(ctx, tr("td-moon", "Moon"), mx, my - 8, { size: 10.5, c: INK, align: "center" });
      text(ctx, tr("td-bary", "+ barycentre: 4,670 km from the Earth's centre, inside the Earth"), M, vBot - 4, { size: 10, c: FLAT, maxW: W - 2 * M, up: true });
      stampTop(tr("td-st1", "true scale: distance 60 Earth radii"), false);
      cap(capTxt);
    } else if (s === 1) {
      const r = Math.min((vh / 2 - 34), W * 0.26), L0 = r * 0.5, ph = clamp((k - 0.42) / 0.3), gain = 20;
      disc(ctx, cx, cy, r, LAND, "#b9b2a3", 1.2);
      { const yA = Math.min(vBot - 6, cy + r + 26), x1 = Math.min(W - M, cx + r * 1.5); arrow(ctx, x1 - 70, yA, x1, yA, SOFT, 1.4, 7);
        text(ctx, tr("td-tomoon", "to the Moon, 60 Earth radii"), x1 - 76, yA + 4, { size: 10, c: SOFT, align: "right" }); }
      for (let i = 0; i < 12; i++) {
        const th = TAU * i / 12, px = cx + r * Math.cos(th), py = cy - r * Math.sin(th), A = tidalAccel(th);
        if (ph < 1) { ctx.globalAlpha = 1 - ph; arrow(ctx, px, py, px + A.pull[0] * L0, py - A.pull[1] * L0, INK, 1.5, 6); ctx.globalAlpha = 1; }
        if (ph > 0) { ctx.globalAlpha = ph; arrow(ctx, px, py, px + A.tide[0] * L0 * gain, py - A.tide[1] * L0 * gain, GLOBE, 2, 7); ctx.globalAlpha = 1; }
      }
      if (ph < 1) { ctx.globalAlpha = 1 - ph; arrow(ctx, cx, cy, cx + L0, cy, FAINT, 1.5, 6); ctx.globalAlpha = 1; text(ctx, tr("td-centre", "centre"), cx, cy + 14, { size: 9.5, c: SOFT, align: "center" }); }
      stampTop(ph < 0.5 ? tr("td-st2a", "black: the Moon's pull, all to one scale") : tr("td-st2b", "blue: pull minus the centre's, drawn 20× longer"), ph >= 0.5);
      cap(capTxt);
    } else if (s === 2 || s === 3) {
      const r = Math.min((vh / 2 - 56) / 1.31, W * 0.22), A = r * 0.16, w0 = r * 0.07, fac = (A / r) * 6.371e6 / H_EQ;
      const days = s === 2 ? 2 * 24.8412 / 24 : T_SYN, t = days * k;                         // jours
      const rotM = TAU * t / (24.8412 / 24);                                                // la Terre tourne sous la Lune
      const sunAng = -TAU * t / T_SYN + Math.PI * 0.0;                                      // le Soleil recule d'un tour par mois synodique (repère de la Lune)
      const hM = (a) => A * equiShape(a), hS = (a) => s === 3 ? A * SR * equiShape(a - sunAng) : 0;
      water(ctx, cx, cy, r, w0, (a) => hM(a) + hS(a));
      const pa = Math.PI + rotM, px = cx + r * Math.cos(pa), py = cy - r * Math.sin(pa);
      disc(ctx, px, py, 4.2, FLAT, "#fff", 1.4); text(ctx, tr("td-port", "port"), px + 7 * Math.cos(pa) , py - 7 * Math.sin(pa) - 2, { size: 10, c: FLAT, align: Math.cos(pa) > 0 ? "left" : "right" });
      arrow(ctx, cx + r + w0 + A + 10, cy, Math.min(W - M, cx + r + w0 + A + 56), cy, GLOBE, 1.6, 7);
      text(ctx, tr("td-moon", "Moon"), Math.min(W - M, cx + r + w0 + A + 56), cy - 8, { size: 10.5, c: GLOBE, align: "right" });
      if (s === 3) {
        const L = r + w0 + A + 12, sx = cx + L * Math.cos(sunAng), sy = cy - L * Math.sin(sunAng);
        arrow(ctx, sx, sy, sx + 26 * Math.cos(sunAng), sy - 26 * Math.sin(sunAng), SUN, 1.6, 7);
        text(ctx, tr("td-sun", "Sun"), sx + 32 * Math.cos(sunAng), sy - 32 * Math.sin(sunAng) + 4, { size: 10.5, c: SUN, align: Math.cos(sunAng) > 0.2 ? "left" : Math.cos(sunAng) < -0.2 ? "right" : "center" });
      }
      stampTop(tr("td-st3", "water heights drawn {f} times higher").replace("{f}", pow10(fac)));
      const f = (tt) => portHeight(TAU * tt / (24.8412 / 24) , s === 3 ? TAU * tt / (24.8412 / 24) + TAU * tt / T_SYN : 0, 0, 0, s === 3 ? SR : 0);
      if (s === 2) {
        strip(ctx, sX, sY, sW, stripH, f, days, t, { title: tr("td-s3", "height at the port, two lunar days (24 h 50 min each)"), lo: -0.6, hi: 1.05, ticks: [[periodH("M2") / 24, "12 h 25"], [2 * periodH("M2") / 24, "24 h 50"], [3 * periodH("M2") / 24, ""]] });
        cap(capTxt);
      } else {
        const lo = -0.6 * (1 + SR), hi = 1.05 * (1 + SR);
        strip(ctx, sX, sY, sW, stripH, f, days, t, { title: tr("td-s4", "height at the port over one month (29.5 days)"), lo, hi, ticks: [[0, tr("td-new", "new")], [T_SYN / 4, tr("td-q1", "1st q.")], [T_SYN / 2, tr("td-full", "full")], [3 * T_SYN / 4, tr("td-q3", "last q.")]] });
        cap(capTxt);
      }
    } else if (s === 4) {
      const r = Math.min((vh / 2 - 30) / 1.25, W * 0.22), A = r * 0.16, w0 = r * 0.07, dec = 28 * D2R, phi = 45 * D2R, t = 2 * 24.8412 / 24 * k, HL = TAU * t / (24.8412 / 24);
      // vue de côté : l'axe de la Terre vertical, la Lune à 28° au-dessus de l'équateur
      water(ctx, cx, cy, r, w0, (a) => A * equiShape(a - dec));
      ctx.strokeStyle = SOFT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy - r - w0 - A - 10); ctx.lineTo(cx, cy + r + w0 + A + 10); ctx.stroke();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = FAINT; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      const yP = cy - r * Math.sin(phi), xw = r * Math.cos(phi); ctx.strokeStyle = FLAT; ctx.beginPath(); ctx.moveTo(cx - xw, yP); ctx.lineTo(cx + xw, yP); ctx.stroke(); ctx.setLineDash([]);
      const px = cx + xw * Math.cos(HL), front = Math.sin(HL) <= 0; disc(ctx, px, yP, front ? 4.4 : 3, front ? FLAT : "#e0b07a", "#fff", 1.2);
      text(ctx, tr("td-lat", "port at 45° N"), cx - xw - 6, yP - 4, { size: 10, c: FLAT, align: "right" });
      const L = r + w0 + A + 12; arrow(ctx, cx + L * Math.cos(dec), cy - L * Math.sin(dec), cx + (L + 40) * Math.cos(dec), cy - (L + 40) * Math.sin(dec), GLOBE, 1.6, 7);
      text(ctx, tr("td-moon28", "Moon, 28° N"), Math.min(W - M, cx + (L + 44) * Math.cos(dec)), cy - (L + 44) * Math.sin(dec) - 4, { size: 10.5, c: GLOBE, align: "right" });
      stampTop(tr("td-st3", "water heights drawn {f} times higher").replace("{f}", pow10((A / r) * 6.371e6 / H_EQ)));
      strip(ctx, sX, sY, sW, stripH, (tt) => portHeight(TAU * tt / (24.8412 / 24), 0, phi, dec, 0), 2 * 24.8412 / 24, t, { title: tr("td-s5", "height at 45° N, two lunar days"), lo: -0.6, hi: 1.05, ticks: [[periodH("M2") / 24, "12 h 25"], [2 * periodH("M2") / 24, "24 h 50"]] });
      cap(capTxt);
    } else {
      // le plat : vue de dessus d'un disque, la Lune à quelques milliers de km au-dessus d'un point qui fait le tour
      const R = Math.min(vh * 0.44, W * 0.3), Hm = 5000, Rkm = 20000, t = 2 * 24.8412 / 24 * k, a = TAU * t / (24.8412 / 24);
      const rM = 0.45, sx = cx + R * rM * Math.cos(a), sy = cy - R * rM * Math.sin(a), pX = cx - R * 0.55, pY = cy;
      // anneaux de niveau autour du point sous la Lune (pas de dégradé : le rasteriseur des exports n'en a pas besoin)
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.fillStyle = "#eef6fb"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      for (let i = 24; i >= 1; i--) { const rr = 2 * R * i / 24, v = flatShape(rr / R * Rkm, Hm), l = Math.round(238 - 110 * v); ctx.fillStyle = `rgb(${l - 40},${l},${Math.min(255, l + 22)})`; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, TAU); ctx.fill(); }
      ctx.restore();
      disc(ctx, cx, cy, R, null, FLAT, 1.4);
      disc(ctx, sx, sy, 5, "#a8a29e", INK, 1); text(ctx, tr("td-flatmoon", "under the Moon, 5,000 km up"), sx, sy - 9, { size: 10, c: INK, align: "center" });
      disc(ctx, pX, pY, 4.2, FLAT, "#fff", 1.4); text(ctx, tr("td-port", "port"), pX - 7, pY + 4, { size: 10, c: FLAT, align: "right" });
      stampTop(tr("td-st6", "shading: water level, any scale; same for any height or mass of the Moon"));
      const f = (tt) => { const aa = TAU * tt / (24.8412 / 24), X = Math.hypot(R * rM * Math.cos(aa) + R * 0.55, R * rM * Math.sin(aa)) / R * Rkm; return 2 * flatShape(X, Hm) - 1; };
      strip(ctx, sX, sY, sW, stripH, f, 2 * 24.8412 / 24, t, { c: FLAT, title: tr("td-s6", "height at the port, two lunar days"), lo: -1, hi: 1, ticks: [[periodH("M2") / 24, "12 h 25"], [2 * periodH("M2") / 24, "24 h 50"]] });
      cap(capTxt);
    }
  } });
}

/* ---- figures des formules et des données (SVG, FIG) --------------------------------------------------------- */

/** a = 2GMr/d³ le long de l'axe, −GMr/d³ en travers : la figure de la formule. */
export function figTideFx(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("td-fx-alt", "The Earth with the Moon far to the right. Black arrows: the Moon's pull at the near side, the centre and the far side, slightly longer at the near side. Blue arrows: each minus the centre's pull: outward at the near and far sides, inward at the top and bottom") });
  const C = FIG.C, cx = 120, cy = 110, r = 70;
  f.circle(cx, cy, r, { c: C.sea, w: 1.6, fill: "#eef6f4" });
  f.dash(cx + r + 8, cy, 360, cy, { c: C.faint });
  f.circle(360, cy, 8, { c: C.ink, w: 1.2, fill: "#d9dde3" }); f.note(360, cy - 14, tr("td-moon", "Moon"), { anchor: "middle", size: 9.5 });
  f.note(290, cy + 14, "d", { tex: "d", anchor: "middle", size: 11 });
  for (const [x, y, dx, dy] of [[cx + r, cy, 26, 0], [cx - r, cy, -26, 0], [cx, cy - r, 0, 13], [cx, cy + r, 0, -13]]) f.arrow(x, y, x + dx, y + dy, { c: C.globe, w: 2, head: 6 });
  f.seg(cx, cy, cx + r, cy, { label: "r", tex: "r", c: C.soft, side: -10 });
  f.note(cx + r + 30, cy - 10, "+2GMr/d³", { tex: "+2GMr/d^3", c: C.globe, size: 10.5 });
  f.note(cx - r - 30, cy - 10, "+2GMr/d³", { tex: "+2GMr/d^3", c: C.globe, size: 10.5, anchor: "end" });
  f.note(cx + 8, cy - r + 22, "−GMr/d³", { tex: "-GMr/d^3", c: C.globe, size: 10.5 });
  stamp(f, tr, tr("td-fx-s", "pull minus the centre's"));
  return f;
}

/** Kepler III donne GM/d³ par la période : le rapport Soleil/Lune sans distance. */
export function figTideKep(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("td-fxk-alt", "Left: the Moon goes round the Earth in 27.32 days; right: the Earth goes round the Sun in 365.26 days. For each, GM over d cubed equals two pi over the period, squared, so the strength of each tide follows from its period, with the Moon's share of the Earth–Moon pair, 1 part in 82.3") });
  const C = FIG.C;
  f.circle(90, 100, 16, { c: C.sea, w: 1.4, fill: "#eef6f4" }); f.circle(90, 100, 60, { c: C.faint, w: 1, dash: "3 4" }); f.circle(150, 100, 6, { c: C.ink, w: 1.2, fill: "#d9dde3" });
  f.note(90, 180, "T = 27.32 d", { tex: "T_\\mathrm{L} = 27.32\\ \\mathrm{d}", anchor: "middle", size: 10.5 });
  f.circle(290, 100, 22, { c: "#d97706", w: 1.4, fill: "#fde68a" }); f.circle(290, 100, 64, { c: C.faint, w: 1, dash: "3 4" }); f.circle(354, 100, 7, { c: C.sea, w: 1.2, fill: "#eef6f4" });
  f.note(290, 180, "T = 365.26 d", { tex: "T_{\\odot} = 365.26\\ \\mathrm{d}", anchor: "middle", size: 10.5 });
  f.note(190, 34, "GM/d³ = (2π/T)²", { tex: "GM/d^3 = (2\\pi/T)^2", anchor: "middle", c: C.globe, size: 11 });
  stamp(f, tr, tr("td-fxk-s", "two orbits"));
  return f;
}

/** Spectre (amplitude par fréquence) des cinq marégraphes, 2018, avec les raies attendues. */
export function figTideSpec(tr) {
  const f = FIG.make({ w: 400, h: 300, alt: tr("td-spec-alt", "Amplitude against frequency for one year of hourly sea level at five tide gauges. Every record has lines at the frequencies the Moon and Sun set, marked O1, K1, N2, M2, S2: Brest's M2 line is 2 metres high, Pensacola's diurnal lines dominate") });
  const C = FIG.C, X0 = 46, X1 = 392, f0 = TIDE_SPEC.f0, f1 = f0 + TIDE_SPEC.step * TIDE_GAUGES[0].spec.length, X = (v) => X0 + (v - f0) / (f1 - f0) * (X1 - X0);
  const rowH = 46, top = 30, cols = ["#1d4ed8", "#0f766e", "#b45309", "#7c3aed", "#be123c"];
  const lines = [["O1", 0.92954], ["K1", 1.00274], ["N2", 1.89598], ["M2", 1.93227], ["S2", 2.0]];
  for (const [n, v] of lines) { f.dash(X(v), top - 4, X(v), top + rowH * 5, { c: "#e7e3da" }); f.note(X(v), top - 7, n, { anchor: "middle", size: 9 }); }
  TIDE_GAUGES.forEach((g, i) => {
    const y0 = top + rowH * (i + 1) - 4, mx = Math.max(...g.spec), sc = (rowH - 10) / mx;
    let d = ""; g.spec.forEach((a, j) => { const x = X(f0 + TIDE_SPEC.step * (j + 0.5)); d += (j ? "L" : "M") + x.toFixed(1) + " " + (y0 - a * sc).toFixed(1); });
    f.path(d, { c: cols[i], w: 1.2 });
    f.line(X0, y0, X1, y0, { c: C.faint, w: 0.8 });
    f.note(X0 - 4, y0 - 14, g.name, { anchor: "end", size: 9 });
    f.note(X0 - 4, y0 - 4, `${(mx * 100).toFixed(0)} cm`, { anchor: "end", size: 8.5 });
  });
  for (const v of [1, 1.5, 2]) f.note(X(v), top + rowH * 5 + 12, String(v), { anchor: "middle", size: 9 });
  f.note((X0 + X1) / 2, top + rowH * 5 + 25, tr("td-spec-x", "cycles per day (each row to its own height)"), { anchor: "middle", size: 9.5 });
  axesStamp(f, tr, `UHSLC ${TIDE_YEAR}`);
  return f;
}

/** Mars 2018 : niveau observé à Brest et Pensacola, phases et déclinaison de la Lune (ephemeris.js). */
export function figTideMonth(tr) {
  const f = FIG.make({ w: 400, h: 300, alt: tr("td-mon-alt", "Sea level through March 2018 at Brest and at Pensacola. Brest's range swells at new and full moon and shrinks at the quarters; Pensacola has one tide a day, largest when the Moon is farthest from the equator and almost none when it crosses it") });
  const C = FIG.C, X0 = 40, X1 = 392, days = 31, X = (d) => X0 + d / days * (X1 - X0);
  const { year, month } = TIDE_EXCERPT;
  // phases (élongation Lune − Soleil) et déclinaison de la Lune, chaque heure
  const el = [], dec = [];
  for (let h = 0; h <= days * 24; h += 1) { const jd = jdFromUTC(year, month, 1, h); const jt = jd + deltaT(year) / 86400; const S = sun(jt), L = moon(jt); el.push(((L.lon - S.lon) % 360 + 360) % 360); dec.push(L.dec); }
  const phases = []; for (let h = 1; h < el.length; h++) for (const [p, n] of [[0, tr("td-new", "new")], [90, tr("td-q1", "1st q.")], [180, tr("td-full", "full")], [270, tr("td-q3", "last q.")]]) { const a = (el[h - 1] - p + 540) % 360 - 180, b = (el[h] - p + 540) % 360 - 180; if (a < 0 && b >= 0 && Math.abs(a - b) < 90) phases.push([h / 24, n, p]); }
  for (const [d, n, p] of phases) { f.dash(X(d), 26, X(d), 276, { c: p % 180 ? "#e7e3da" : "#c7d2fe" }); f.note(X(d), 22, n, { anchor: "middle", size: 8.5 }); }
  // le temps qu'il fait (surcotes, fronts) retiré par une moyenne glissante de 25 h : la marée reste, le lent s'en va
  const hp = (y) => y.map((v, i) => { if (v === null) return null; let S = 0, n = 0; for (let j = Math.max(0, i - 12); j <= Math.min(y.length - 1, i + 12); j++) if (y[j] !== null) { S += y[j]; n++; } return v - S / n; });
  const panel = (g, y0, h, lab, col) => {
    const ob = hp(g.obs), mx = Math.max(...ob.filter((v) => v !== null).map(Math.abs)), sc = h / 2 / mx;
    let d = "", pen = false; ob.forEach((v, i) => { if (v === null) { pen = false; return; } d += (pen ? "L" : "M") + X(i / 24).toFixed(1) + " " + (y0 - v * sc).toFixed(1); pen = true; });
    f.path(d, { c: col, w: 0.9 }); f.note(X0 - 4, y0 - h / 2 + 8, lab, { anchor: "end", size: 9 }); f.note(X0 - 4, y0 - h / 2 + 19, `±${(mx).toFixed(1)} m`, { anchor: "end", size: 8.5 });
  };
  const gb = TIDE_GAUGES.find((g) => g.key === "brest"), gp = TIDE_GAUGES.find((g) => g.key === "pensacola");
  panel(gb, 92, 96, "Brest", "#1d4ed8"); panel(gp, 196, 80, "Pensacola", "#b45309");
  // déclinaison
  let d = ""; dec.forEach((v, i) => { d += (i ? "L" : "M") + X(i / 24).toFixed(1) + " " + (262 - v * 0.5).toFixed(1); }); f.line(X0, 262, X1, 262, { c: C.faint, w: 0.8 }); f.path(d, { c: C.soft, w: 1.2 });
  f.note(X0 - 4, 258, tr("td-mon-dec", "Moon dec."), { anchor: "end", size: 8.5 }); f.note(X0 - 4, 268, `±${Math.round(Math.max(...dec.map(Math.abs)))}°`, { anchor: "end", size: 8.5 });
  for (const dd of [1, 8, 15, 22, 29]) f.note(X(dd - 1), 290, String(dd), { anchor: "middle", size: 9 });
  axesStamp(f, tr, tr("td-mon-st", "March {y}, hourly").replace("{y}", year));
  return f;
}

/** Le tableau des cinq marégraphes. */
export function fillTideTable(root, tr, lang = "en") {
  const tb = root.querySelector("#gravTabTides"); if (!tb) return;
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const kind = { semi: tr("td-k-semi", "semidiurnal"), mixsemi: tr("td-k-mixsemi", "mixed, mainly semidiurnal"), mixdiur: tr("td-k-mixdiur", "mixed, mainly diurnal"), diur: tr("td-k-diur", "diurnal") };
  const head = [tr("td-h-st", "Gauge"), tr("td-h-kind", "Kind (F)"), tr("td-h-p", "Line read off the record"), tr("td-h-r", "Range beats"), "N2/M2", "S2/M2", "K1/O1"];
  const rows = gaugeRows().map((g) => [g.name, `${kind[g.kind]} (${nf(g.form, 2)})`, `${nf(g.pSemiH, 3)} h`, `${nf(g.pRange, 2)} d`, nf(g.n2m2, 2), nf(g.s2m2, 2), nf(g.k1o1, 2)]);
  rows.push([tr("td-h-eq", "Globe and Kepler"), "", `${nf(periodH("M2"), 3)} h (M2)`, `${nf(beatDays("M2", "S2"), 2)} / ${nf(beatDays("K1", "O1"), 2)} d`, `${nf(ellipseN2(), 2)}`, `${nf(keplerRatio(), 2)}`, nf(equiRatio("K1", "O1"), 2)]);
  tb.innerHTML = `<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr>${r.map((c, j) => `<td${i === rows.length - 1 ? ' class="g"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
}


/* ---- les petites mers (UC06) ---------------------------------------------------------------------------------- */
// Longueur d'un bassin fermé (km, ordre de grandeur, le long de son axe principal) : la borne A·L/R de la marée qu'il peut avoir.
export const A_M2 = 0.24;                                   // m : M2 d'équilibre à l'équateur (Pugh & Woodworth 2014)
export const CLOSED = [{ key: "geneva", L: 73 }, { key: "superior", L: 560 }, { key: "black", L: 1150 }, { key: "baltic", L: 1500 }, { key: "med", L: 3800 }];
export const closedBound = (Lkm) => A_M2 * Lkm / 6371;      // m

/** M2 mesurée (TICON-3, médiane et quartiles) par bassin, et la borne du bassin fermé A·L/R ; échelle log. */
export function figSmallSeas(tr) {
  const f = FIG.make({ w: 400, h: 300, alt: tr("ss-alt", "Twice-daily tide (M2 amplitude) measured at the gauges of six seas, on a logarithmic scale: about 1.3 m on the Atlantic coast of Europe and 3.3 m in the Bay of Fundy, 6 cm in the Gulf of Mexico, 7 cm in the Mediterranean, 2 cm in the Black Sea, under 1 cm in the Baltic. Open circles: the largest tide a closed basin of that length could have from the pull alone; Lake Superior and Lake Geneva added") });
  const C = FIG.C, X0 = 132, X1 = 388, lo = Math.log10(0.1), hi = Math.log10(500), X = (cm) => X0 + (Math.log10(Math.max(0.1, cm)) - lo) / (hi - lo) * (X1 - X0);
  const name = { atl: tr("ss-atl", "Atlantic, Europe"), fundy: tr("ss-fundy", "Bay of Fundy"), gom: tr("ss-gom", "Gulf of Mexico"), med: tr("ss-med", "Mediterranean"), black: tr("ss-black", "Black Sea"), baltic: tr("ss-baltic", "Baltic"), superior: tr("ss-sup", "Lake Superior"), geneva: tr("ss-gen", "Lake Geneva") };
  const rows = [...TICON_BASINS.map((b) => b.key), "superior", "geneva"], y = (i) => 40 + i * 30;
  for (const v of [0.1, 1, 10, 100]) { f.dash(X(v), 28, X(v), y(rows.length - 1) + 12, { c: "#e7e3da" }); f.note(X(v), y(rows.length - 1) + 26, v >= 1 ? `${v} cm` : "1 mm", { anchor: "middle", size: 9 }); }
  rows.forEach((k, i) => {
    const b = TICON_BASINS.find((x) => x.key === k), cl = CLOSED.find((x) => x.key === k);
    f.note(X0 - 6, y(i) + 4, name[k] + (b ? ` (${b.n})` : ""), { anchor: "end", size: 9.5 });
    if (b) { f.line(X(b.q1), y(i), X(b.q3), y(i), { c: C.globe, w: 5 }); f.dot(X(b.med), y(i), { r: 3.5, c: C.ink }); }
    if (k === "superior") { f.line(X(0.1), y(i), X(5), y(i), { c: C.globe, w: 1.2, dash: "2 3" }); f.note(X(5) + 4, y(i) + 4, tr("ss-noaa", "< 5 cm (NOAA)"), { size: 9 }); }
    if (cl) f.circle(X(closedBound(cl.L) * 100), y(i), 4.5, { c: C.flat, w: 1.6, fill: "#fff" });
  });
  f.note(X0, 18, tr("ss-key", "bar: middle half of the gauges · dot: median · ring: closed-basin bound A·L/R"), { size: 9 });
  axesStamp(f, tr, tr("ss-st", "TICON-3, M2"));
  return f;
}

/** Une baie ouverte d'un côté résonne si 4L/√(gh) approche 12 h 25 (Merian). */
export function figBay(tr) {
  const f = FIG.make({ w: 380, h: 200, alt: tr("ss-bay-alt", "A bay of length L and depth h open to the ocean at one end. The tide entering from the ocean reflects at the closed end; if the time for the wave to go in and out twice, 4L over the square root of g h, is close to 12 hours 25 minutes, each tide adds to the last and the range at the head of the bay grows") });
  const C = FIG.C;
  f.path("M30 70 L330 70 L330 140 L30 140", { c: C.ink, w: 1.6 });
  f.path("M30 105 Q105 90 180 105 T330 120", { c: C.globe, w: 2 });
  f.seg(30, 160, 330, 160, { label: "L", tex: "L", c: C.soft, side: 10 });
  f.seg(345, 70, 345, 140, { label: "h", tex: "h", c: C.soft, side: 10 });
  f.arrow(8, 105, 28, 105, { c: C.globe, w: 1.8, head: 6 }); f.note(6, 92, tr("ss-bay-o", "ocean"), { size: 9.5 });
  f.note(180, 40, "T = 4L/√(gh)", { tex: "T = 4L/\\sqrt{gh}", anchor: "middle", c: C.globe, size: 11 });
  stamp(f, tr, tr("ss-bay-s", "a bay open at one end"));
  return f;
}

export const TIDE_FIGS = { gravFxTide: figTideFx, gravFxTideKep: figTideKep, gravFigTideSpec: figTideSpec, gravFigTideMonth: figTideMonth, gravFigSmallSeas: figSmallSeas, gravFxBay: figBay };
// réexportés pour la prose (valeurs .cv)
export { keplerRatio, T_MONTH, T_YEAR };
