// Rømer à rebours, sur les vraies éclipses (2026-11-25, fog build sun-romer) : 8 822 éclipses d'Io de 1652 à 1983 (la
// compilation de Lieske, IMCCE), c de laboratoire, orbites faites d'angles et de périodes. Le build ajuste tout (go doc
// -all ./internal/build/romer) ; la page lit ses nombres et dessine trois figures en SVG (FIG), une par formule ou légende.
import { FIG } from "../../core/fig.js";
import { axesStamp } from "../../core/formfigs.js";
import { ROMER, ROMER_ERAS, ROMER_FLAT, ROMER_SERIES, ROMER_CURVE } from "../../data/presets/sun-romer.js";

const C = FIG.C;
// une ligne d'ajustement (voir l'en-tête du preset)
export const fitOf = (r) => r && { n: r[0], drop: r[1], opp: r[2], sites: r[3], rms: r[4], as: r[5], das: r[6], boot: r[7], lap: r[8], vis: r[9] };
export const ERA_COLS = ["#7c3aed", "#b45309", "#0f766e", "#be123c", "#1d4ed8", "#4d7c0f"];
/** Temps de lumière sur une unité astronomique adopté (UAI 2012) : 149 597 870,7 km / c. */
export const AS_IAU = 149597870.7 / ROMER.c;

/** Les éras : années, ajustement principal, sans terme libre, DE440, cases de distance. */
export function eras() {
  return ROMER_ERAS.map(([y0, y1, main, fixed, de, bins]) => ({ y0, y1, main: fitOf(main), fixed: fitOf(fixed), de: fitOf(de), bins }));
}

/** Le résultat d'ensemble en km. */
export function romerAU() {
  return { as: ROMER.mean, das: ROMER.meanErr, au: ROMER.mean * ROMER.c, dau: ROMER.meanErr * ROMER.c, n: fitOf(ROMER.whole).n };
}

/** Le retard (s) de la courbe plate libre ou de sa prédiction par une UA, à la phase synodique φ (rad, 0 = opposition).
 *  Le build donne les coefficients de la phase d'Io (un retard est une phase en moins) : retard = −courbe. */
export function flatDelay(phi, which = 0) {
  const k = ROMER_FLAT.coef, v = (nm) => k[nm][which];
  return -(v("s1c") * Math.cos(phi) + v("s1s") * Math.sin(phi) + v("s2c") * Math.cos(2 * phi) + v("s2s") * Math.sin(2 * phi));
}

export function romerValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const E = eras(), r = romerAU(), w = fitOf(ROMER.whole), p = fitOf(ROMER.photo);
  const mains = E.map((e) => e.main.as), fixeds = E.map((e) => e.fixed.as), des = E.filter((e) => e.de).map((e) => e.de.as);
  const laps = E.map((e) => e.main.lap);
  const k = ROMER_FLAT.coef;
  const span = (v, d = 0) => `${nf(Math.min(...v), d)}–${nf(Math.max(...v), d)}`;
  return {
    rmTotal: nf(ROMER.total), rmIo: nf(ROMER.io), rmSites: nf(ROMER.ioSites), rmPhot: nf(p.n + p.drop), rmVis: nf(ROMER.visual),
    rmKept: nf(w.n), rmDrop: nf(w.drop), rmAJ: nf(ROMER.aJup, 3),
    rmAs: nf(r.as, 1), rmDAs: nf(r.das, 1), rmAU: nf(r.au / 1e6, 1), rmDAU: nf(r.dau / 1e6, 1),
    rmIAU: nf(AS_IAU, 1), rmDiff: nf((r.as / AS_IAU - 1) * 100, 1), rmZ: nf(Math.abs(r.as - AS_IAU) / r.das, 1),
    rmChi: nf(ROMER.chi2, 1), rmDof: String(E.length - 1), rmEras: String(E.length),
    rmSpan: span(mains), rmSpanFixed: span(fixeds), rmSpanDE: des.length ? span(des) : "–", rmLap: span(laps),
    rmLapMin: nf(laps.reduce((s, x) => s + x, 0) / laps.length / 60, 1),
    rmPhAs: nf(p.as, 1), rmPhB: nf(p.boot, 1), rmPhN: nf(p.n), rmPhDiff: nf((p.as / AS_IAU - 1) * 100, 1),
    rmWholeAs: nf(w.as, 1), rmWholeB: nf(w.boot, 1),
    rmRmsClock: nf(ROMER_FLAT.rmsClock), rmRmsFree: nf(ROMER_FLAT.rmsFree, 1), rmRmsGlobe: nf(ROMER_FLAT.rmsGlobe, 1),
    rmA1: nf(k.s1c[0], 1), rmA1e: nf(k.s1c[1], 1), rmA1p: nf(k.s1c[2], 1),
    rmB1: nf(k.s1s[0], 1), rmB1e: nf(k.s1s[1], 1), rmB1p: nf(k.s1s[2], 1),
    rmA2: nf(k.s2c[0], 1), rmA2e: nf(k.s2c[1], 1), rmA2p: nf(k.s2c[2], 1),
    rmB2: nf(k.s2s[0], 1), rmB2e: nf(k.s2s[1], 1), rmB2p: nf(k.s2s[2], 1),
    rmCImp: nf(149597870.7 / r.as),
  };
}

/** Le tableau des éras (lignes HTML). */
export function eraRows(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  return eras().map((e, i) => `<tr><td><span style="color:${ERA_COLS[i]}" aria-hidden="true">●</span> ${e.y0}–${e.y1}</td><td>${nf(e.main.n)}</td><td>${e.main.opp}</td>` +
    `<td><b>${nf(e.main.as, 1)} ± ${nf(e.main.boot, 1)}</b></td>` +
    `<td>${e.de ? `${nf(e.de.as, 1)} ± ${nf(e.de.boot, 1)}` : "–"}</td><td>${nf(e.fixed.as, 1)}</td></tr>`).join("");
}

// -- figure 1 : le retard contre la distance Terre-Jupiter, six éras --
function figDist(tr) {
  const f = FIG.make({ w: 380, h: 290, alt: tr("rm-figd-alt", "The delay of Io's eclipses against the Earth-Jupiter distance, averaged in bins for six eras from 1660 to 1983: the points of every era lie on one straight line rising by about 8.4 minutes per astronomical unit, the light time") });
  const X0 = 46, X1 = 368, Y0 = 242, Y1 = 28, d0 = 3.9, d1 = 6.45, m1 = 22;
  const x = (d) => X0 + (d - d0) / (d1 - d0) * (X1 - X0), y = (m) => Y0 - m / m1 * (Y0 - Y1);
  for (const m of [0, 5, 10, 15, 20]) { f.dash(X0, y(m), X1, y(m), { c: "#e7e3da" }); f.note(X0 - 4, y(m) + 4, `${m}`, { anchor: "end", size: 9 }); }
  for (const d of [4, 4.5, 5, 5.5, 6]) f.note(x(d), Y0 + 13, `${d}`, { anchor: "middle", size: 9.5 });
  const as = ROMER.mean;
  f.line(x(d0), y((d0 - 4) * as / 60), x(d1), y((d1 - 4) * as / 60), { c: C.globe, w: 1.4 });
  eras().forEach((e, i) => {
    for (const [d, del, sem] of e.bins) {
      const m = (del - 4 * as) / 60, xx = x(d) + (i - 2.5) * 2.2;
      if (sem / 60 > 0.15) f.line(xx, y(m - sem / 60), xx, y(m + sem / 60), { c: ERA_COLS[i], w: 1 });
      f.dot(xx, y(m), { r: 2.4, c: ERA_COLS[i] });
    }
  });
  f.note(X0 + 6, y(20.6), tr("rm-figd-1", "dots: mean delay of each era's eclipses, by distance"), { size: 9.5 });
  f.note(X0 + 6, y(19.2), tr("rm-figd-2", "line: one light time for all"), { size: 9.5, c: C.globe });
  eras().forEach((e, i) => f.note(X0 + 6 + (i % 3) * 44, y(17.6) + Math.floor(i / 3) * 12, `${e.y0}–${String(e.y1).slice(2)}`, { size: 9, c: ERA_COLS[i] }));
  f.note(X1, 282, tr("rm-figd-3", "Earth–Jupiter distance (AU) · delay from 4 AU (min)"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("rm-figd-st", "Lieske's compilation, 1660–1983"));
  return f;
}

// -- figure 2 : la photométrie de Harvard, 1878-1904, chaque éclipse --
function figSeries(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("rm-figt-alt", "Every photometric eclipse of Io timed at Harvard from 1878 to 1903 as a dot, its delay against the date, on the curve of the light time from Jupiter computed from the orbits: the dots follow the curve's yearly swing of about sixteen minutes") });
  const X0 = 40, X1 = 370, Y0 = 204, Y1 = 26, t0 = 1878, t1 = 1904.6, m0 = -2, m1 = 21;
  const x = (t) => X0 + (t - t0) / (t1 - t0) * (X1 - X0), y = (m) => Y0 - (m - m0) / (m1 - m0) * (Y0 - Y1);
  for (const m of [0, 5, 10, 15, 20]) { f.dash(X0, y(m), X1, y(m), { c: "#e7e3da" }); f.note(X0 - 4, y(m) + 4, `${m}`, { anchor: "end", size: 9 }); }
  for (const t of [1880, 1885, 1890, 1895, 1900]) f.note(x(t), Y0 + 13, `${t}`, { anchor: "middle", size: 9.5 });
  const as = fitOf(ROMER.photo).as;
  f.path(ROMER_CURVE.map(([t, d], i) => `${i ? "L" : "M"}${x(t).toFixed(1)} ${y((d - 4) * as / 60).toFixed(1)}`).join(""), { c: C.globe, w: 1.1 });
  for (const [t, , del] of ROMER_SERIES) f.dot(x(t), y((del - 4 * as) / 60), { r: 1.7, c: C.ink });
  f.note(X1, 242, tr("rm-figt-1", "date · delay from 4 AU (min) · dots: Harvard photometry · line: light time"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("rm-figt-st", "Harvard, 1878–1903"));
  return f;
}

// -- figure 3 : la courbe libre du plat et ce qu'une UA en prédit --
function figFlat(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("rm-figf-alt", "The flat model's free curve of Io's delay over Jupiter's synodic cycle, fitted to the 330 years of eclipses, drawn over the curve that one astronomical unit predicts: the two curves lie on top of each other, about sixteen minutes from opposition to conjunction") });
  const X0 = 40, X1 = 370, Y0 = 200, Y1 = 30, m0 = -10, m1 = 10;
  const x = (deg) => X0 + (deg + 180) / 360 * (X1 - X0), y = (m) => Y0 - (m - m0) / (m1 - m0) * (Y0 - Y1);
  for (const m of [-10, -5, 0, 5, 10]) { f.dash(X0, y(m), X1, y(m), { c: "#e7e3da" }); f.note(X0 - 4, y(m) + 4, `${m}`, { anchor: "end", size: 9 }); }
  for (const deg of [-180, -90, 0, 90, 180]) f.note(x(deg), Y0 + 13, `${deg}°`, { anchor: deg === -180 ? "start" : deg === 180 ? "end" : "middle", size: 9.5 });
  const curve = (which) => { const p = []; for (let deg = -180; deg <= 180; deg += 3) p.push(`${p.length ? "L" : "M"}${x(deg).toFixed(1)} ${y(flatDelay(deg * Math.PI / 180, which) / 60).toFixed(1)}`); return p.join(""); };
  f.path(curve(2), { c: C.globe, w: 3.2 });
  f.path(curve(0), { c: C.flat, w: 1.6, dash: "5 3" });
  f.line(X0, y(0), X1, y(0), { c: C.soft, w: 1 });
  f.note(x(-80), y(9), tr("rm-figf-1", "thick: what one AU predicts"), { size: 9.5, c: C.globe });
  f.note(x(-80), y(7.6), tr("rm-figf-2", "dashed: the flat model's free curve"), { size: 9.5, c: C.flat });
  f.note(x(-80), y(6.2), tr("rm-figf-3", "flat line at 0: Io's clock alone"), { size: 9.5 });
  f.note(X1, 238, tr("rm-figf-4", "Earth − Jupiter about the Sun (0° = opposition) · delay (min)"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("rm-figf-st", "fit of 1652–1983"));
  return f;
}

export const ROMER_FIGS = { sunFigRomerD: figDist, sunFigRomerT: figSeries, sunFigRomerF: figFlat };
