// Nombres du texte de l'onglet avia (epic14), tous calculés : index.js les
// pose dans les <span class="cv" data-v>, logic.test.js garde les calculs.
import { levelForces, levelFlight, turnOver, dgDrift, earthRate, schulerPeriod, irsOnPlane, gjtArc, routeStats, fitTime, bearingGC, flatLine, gcExtremeLat, polarCircuit, flatViaRim, median, distGC } from "./logic.js";
import { ROUTES, AIRPORTS, AVIA_FETCHED } from "../../data/presets/avia-flights.js";
import { CRUISE, DG_SITES, GJT, OMO, FORCE_PLANES } from "../../data/presets/avia.js";
import { springFit } from "./springs.js";
import { eotData } from "./eot.js";
import { flightRadius } from "./radius.js";
import { worldTrips } from "./world.js";
import { parallelLength } from "./logic.js";
import { bearingFit } from "./logic.js";
import { eotvos, fitRadiusByPair, fitRadius, fitGradients, grams } from "./logic.js";
import { num } from "../curv/fmt.js";
import { makeT } from "../../core/i18n.js";

const deg = (x, d = 1) => `${num(x, d)}°`;
const lat = (x) => `${num(Math.abs(x))}°${x >= 0 ? "N" : "S"}`;
const sgn = (x, d = 1) => `${x >= 0 ? "+" : "−"}${num(Math.abs(x), d)}`;

function forceValues() {
  const o = {};
  for (const P of FORCE_PLANES) {
    const F = levelForces(P.v, P.h);
    o[`fg${P.k}p`] = `${num(F.p)} hPa`; o[`fg${P.k}v`] = `${num(P.v * 3.6)} km/h`;
    o[`fg${P.k}c`] = `${num(F.c * 100, 3)} %`; o[`fg${P.k}w`] = `${num(levelFlight(P.v, P.h).degPerMin, 3)}°`;
  }
  o.fgLD = num(levelForces(250, 10668).finesse);
  return o;
}

/** Valeurs des <span class="cv" data-v> du texte (fitFlat inclus : ~1 s, fait une fois). */
export function proseValues(tr = (k, fb) => fb) {
  const f = levelFlight(CRUISE.v, CRUISE.h);
  const stats = ROUTES.map((r) => routeStats(r, AIRPORTS));
  const both = stats.filter((s) => s.both);
  const nFlights = both.reduce((p, s) => p + s.n, 0);
  const syd = stats.find((s) => s.key === "SYD-SCL");
  const a = [AIRPORTS.SYD.lat, AIRPORTS.SYD.lon], b = [AIRPORTS.SCL.lat, AIRPORTS.SCL.lon];
  const fl = flatLine(a, b);
  const { g, best } = springFit();
  const ae = fitTime(stats, (s) => s.ae);
  const south = both.filter((s) => s.south && s.gc > 5000);
  const vfs = south.map((s) => s.vFlat), vgs = both.map((s) => s.vGlobe);
  const tas = both.map((s) => s.tas).filter(Boolean);
  const worst = [...best.res].sort((p, q) => Math.abs(q.rel) - Math.abs(p.rel))[0];
  const gWorst = [...g.res].sort((p, q) => Math.abs(q.rel) - Math.abs(p.rel));
  const gcOf = (k) => stats.find((s) => s.key === k)?.gc ?? 0, gwLong = gWorst.find((r) => gcOf(r.key) > 5000), gwShort = gWorst.find((r) => gcOf(r.key) < 3000);
  const arc = gjtArc(GJT.gs, GJT.vTrue);
  const irs1 = irsOnPlane(CRUISE.v, 3600);
  const pc = polarCircuit(OMO.pts);
  const rim = flatViaRim(OMO.pts[3].ll, OMO.pts[5].ll);
  const jnb = stats.find((s) => s.key === "SYD-JNB");
  const e51 = earthRate(51.5);
  return {
    kmh: `${num(CRUISE.v * 3.6)} km/h`, vms: num(CRUISE.v),
    rateMin: deg(f.degPerMin, 3), rateHour: deg(f.degPerHour, 1),
    turnSyd: deg(turnOver(syd.gc), 0), sydKm: `${num(syd.gc)} km`,
    dotMin: num(f.minutesFor(2)),
    climb1: `${num(f.climbAfter(60) / 0.3048 * 60)} ft/min`, climb10: `${num(f.climbAfter(600) / 0.3048 * 60)} ft/min`,
    rise1: `${num(f.riseAfter(60))} m`,
    cent: `${num(f.centripetalFrac * 100, 2)} %`,
    ...forceValues(),
    omega: `${num(15.041, 2)}°/h`,
    dg: DG_SITES.map((s) => `${tr(`dg-site-${s.k}`, s.n)} (${lat(s.lat)}) ${sgn(dgDrift(s.lat))}°/h`).join(", "),
    dgTos: `${sgn(dgDrift(DG_SITES[0].lat))}°`, dgSyd: `${sgn(dgDrift(DG_SITES[2].lat))}°`,
    dgTosAbs: `${num(Math.abs(dgDrift(DG_SITES[0].lat)), 1)}°`, dgSydAbs: `${num(Math.abs(dgDrift(DG_SITES[2].lat)), 1)}°`,
    dg15: `${num(Math.abs(dgDrift(DG_SITES[0].lat)) / 4, 1)}°`,
    gcH51: `${num(e51.h, 2)}°/h`, gcV51: `${num(e51.v, 2)}°/h`,
    schuler: `${num(schulerPeriod() / 60, 1)} min`, schAmp: `${num(irs1.amp / 1000)} km`, schErr: `${num(irs1.err / 1000)} km`,
    gjt53: deg(arc(GJT.poleCross), 0), gjt59: deg(arc(GJT.invalid), 0), gjtKm: `${num((arc(GJT.invalid) * Math.PI / 180) * 6371)} km`,
    nRoutes: num(both.length), nFlights: num(nFlights),
    nDropped: num(ROUTES.reduce((p, r) => p + r.abOut + r.baOut, 0)), nAll: num(ROUTES.reduce((p, r) => p + r.ab.length + r.ba.length + r.abOut + r.baOut, 0)), fetched: AVIA_FETCHED.join(", "),
    vGlobe: `${num(g.v)} km/h`, t0: `${num(g.t0 * 60)} min`, rmsGlobe: `${num(g.rms * 100, 1)} %`,
    vgRange: `${num(Math.min(...vgs))}–${num(Math.max(...vgs))} km/h`,
    tasRange: `${num(Math.min(...tas))}–${num(Math.max(...tas))} km/h`,
    vfRange: `${num(Math.min(...vfs))}–${num(Math.max(...vfs))} km/h`,
    rmsAE: `${num(ae.rms * 100)} %`, vAE: `${num(ae.v)} km/h`,
    sydH: `${num(syd.hAB, 1)} h`, sydH2: `${num(syd.hBA, 1)} h`, sydFlat: `${num(syd.ae)} km`, sydVf: `${num(syd.vFlat)} km/h`, sydVg: `${num(syd.vGlobe)} km/h`,
    sydBrgG: deg(bearingGC(a, b), 0), sydBrgF: deg(fl.brg, 0), sydMaxLat: lat(fl.maxLat), sydGcLat: lat(gcExtremeLat(a, b)),
    sydWpt: lat(Math.min(...(syd.wpt.length ? syd.wpt.map((w) => w[0]) : [NaN]))),
    jnbAB: `${num(jnb.hAB, 1)} h`, jnbBA: `${num(jnb.hBA, 1)} h`,
    flatDof: num(best.dof), nAirports: num(best.keys.length), flatRatio: num(best.rms / g.rms, 1), flatEdges: num(best.edges), rmsFlat: `${num(best.rms * 100, 1)} %`,
    flatWorst: `${worst.key.replace("-", "–")} (${sgn(worst.rel * 100, 0)} %)`,
    // 2026-11-25 : par nature, non par rang (la prose : la longue qui passe par l'Arctique, puis le saut court)
    gWorst: `${gwLong.key.replace("-", "–")} (${sgn(gwLong.rel * 100, 0)} %)`, gWorst2: `${gwShort.key.replace("-", "–")} (${sgn(gwShort.rel * 100, 0)} %)`,
    ...bearingValues(stats, best),
    omoH: `${num(Math.floor(OMO.hours))} h ${num(Math.round((OMO.hours % 1) * 60))} min`, omoKm: `${num(OMO.km)} km`, omoAvg: `${num(OMO.avg)} km/h`,
    omoG: `${num(pc.g)} km`, omoGv: `${num(pc.g / OMO.hours)} km/h`, omoF: `${num(pc.f)} km`, omoFv: `${num(pc.f / OMO.hours)} km/h`,
    omoLeg3: `${num(distGC(OMO.pts[3].ll, OMO.pts[4].ll) + distGC(OMO.pts[4].ll, OMO.pts[5].ll))} km`,
    omoRim: `${num(rim.km)} km`,
    medTas: `${num(median(tas))} km/h`,
    // quatre villes à égale distance sur la sphère : sommets d'un tétraèdre, arccos(−1/3) au centre
    tetraKm: `${num(Math.round(Math.acos(-1 / 3) * 6371 / 10) * 10)} km`,
    ...eotValues(),
    ...radiusValues(),
    ...worldValues(),
  };
}

/** Caps de la meilleure carte plane contre les vrais, route par route (logic.bearingFit) ; les deux pires routes distinctes en exemples. */
function bearingValues(stats, best) {
  const B = bearingFit(stats, AIRPORTS, best.pos);
  const seen = new Set(), ex = [];
  for (const r of [...B.rows].sort((p, q) => Math.abs(q.diff) - Math.abs(p.diff))) {
    const id = [r.a, r.b].sort().join("-");
    if (seen.has(id)) continue; seen.add(id); ex.push(r);
    if (ex.length === 2) break;
  }
  const show = (r) => `${r.a}→${r.b}: ${num(r.real, 0)}° → ${num(r.flat, 0)}°`;
  return {
    bfRms: deg(B.rms, 0), bfOver90: `${num(B.rows.filter((r) => Math.abs(r.diff) > 90).length)} / ${num(B.rows.length)}`,
    bfEx1: show(ex[0]), bfEx2: show(ex[1]), bfEx1d: deg(Math.abs(ex[0].diff), 0), bfEx2d: deg(Math.abs(ex[1].diff), 0),
  };
}

/** Nombres de la section Eötvös : un avion de ligne, puis le levé GRAV-D EN02. */
function eotValues() {
  const v = CRUISE.v, mg = (x) => `${x >= 0 ? "+" : "−"}${num(Math.abs(x))} mGal`, pc = (x) => `${num(Math.abs(x) / 980665 * 100, 2)} %`;
  const e = eotvos(v, 0, 45, CRUISE.h), w = eotvos(-v, 0, 45, CRUISE.h), n = eotvos(0, v, 45, CRUISE.h);
  const D = eotData(), L = D.lines, J = D.joint;
  const E = L.filter((l) => l.east), W = L.filter((l) => !l.east);
  const range = (xs) => `${mg(Math.min(...xs))} … ${mg(Math.max(...xs))}`.replace(" … −", " … −");
  const byPair = fitRadiusByPair(D.pairs).map((x) => x.km);
  return {
    eoE: mg(e), eoW: mg(w), eoN: mg(n), eoEp: pc(e), eoWp: pc(w), eoNp: pc(n), eoDiff: mg(e - w),
    gdLines: num(L.length), gdEast: num(E.length), gdWest: num(W.length), gdSamples: num(L.reduce((p, l) => p + l.pts.length, 0)),
    gdGsE: `${num(median(E.map((l) => l.gs)) * 3.6)} km/h`, gdGsW: `${num(median(W.map((l) => l.gs)) * 3.6)} km/h`,
    gdEE: range(E.map((l) => l.E)), gdEW: range(W.map((l) => l.E)),
    gdRms0: `${num(D.rms[0])} mGal`, gdRms1: `${num(D.rms[1])} mGal`, gdRms2: `${num(D.rms[2], 1)} mGal`,
    gdR: `${num(D.fit.km)} km`, gdRmsR: `${num(D.fit.rms, 1)} mGal`,
    gdHalf: `${num(D.fit.rmsAt(3185.5))} mGal`, gdDouble: `${num(D.fit.rmsAt(12742))} mGal`,
    gdPairs: num(byPair.length), gdPairLo: `${num(Math.min(...byPair))} km`, gdPairHi: `${num(Math.max(...byPair))} km`, gdPairMed: `${num(median(byPair))} km`,
    gdRatio: num(D.rms[0] / D.rms[2]),
    // où entre WGS84 / GRS80 (2026-10-03) : défaire la correction, et les deux réductions mesurées sur les paires
    gdRell: `${num(fitRadius(D.pairs, { ellipsoid: true }).km)} km`,
    ...(() => { const G = fitGradients(D.pairs), km = (x) => `${num(x.km)} ± ${num(x.seKm)} km`;
      return { gaFa: `${num(G.both.fa, 3)} ± ${num(G.both.seFa, 3)} mGal/m`, gaLat: `${num(G.both.lat, 2)} ± ${num(G.both.seLat, 2)} mGal/km`,
        gaLat80: `${num(G.grs80.lat, 2)} mGal/km`, gaRgrs: km(G.grs), gaRfa: km(G.fa), gaRlat: km(G.lat), gaRboth: km(G.both) }; })(),
    // la balance : un passager de 70 kg
    scE: `${num(70 + grams(D.weights.east) / 1000, 2)} kg`, scW: `${num(70 + grams(D.weights.west) / 1000, 2)} kg`,
    scGap: `${num(grams(D.weights.gap))} g`, scPred: `${num(grams(D.weights.gapPred))} g`, scGapMgal: `${num(D.weights.gap)} mGal`,
    // test de la correction injectée (epic16/UC01) : rms(k)
    ekStar: `${num(D.kscan.kStar, 4)} ± ${num(D.kscan.seK, 4)}`, ekSpread: `${num(D.kscan.spread0)} mGal`,
    ekRms0: `${num(D.kscan.rms0)} mGal`, ekRms1: `${num(D.kscan.rms1, 1)} mGal`, ekRmsMin: `${num(D.kscan.rmsStar, 1)} mGal`,
    ekHalf: `${num(D.kscan.rmsAt(0.5))} mGal`, ekRatio: num(D.kscan.rms0 / D.kscan.rms1),
    // Ω et R ajustés ensemble
    jfOm: `${num(J.om, 4)} ± ${num(J.seOm, 4)}`, jfDay: `${num(J.dayH, 2)} ± ${num(J.seDayH, 2)} h`,
    jfR: `${num(J.km)} ± ${num(J.seKm)} km`, jfRms: `${num(J.rms, 1)} mGal`, jfCorr: num(J.corr, 2),
    jfSig: num((6371 - J.km) / J.seKm, 1), jfN: num(J.nGroups),
    jfOmRange: `${num(Math.min(...J.per.map((p) => p.om)), 3)}–${num(Math.max(...J.per.map((p) => p.om)), 3)}`,
    jfRRange: `${num(Math.min(...J.per.map((p) => p.km)))}–${num(Math.max(...J.per.map((p) => p.km)))} km`,
    jfTermOm: `${num(Math.round(J.termOm / 10) * 10)} mGal`, jfTermR: `${num(Math.round(J.termR / 10) * 10)} mGal`,
    jfFlatOm: num(J.flat.om, 3), jfFlatRms: `${num(J.flat.rms)} mGal`,
  };
}

/** Nombres de la section « tours du monde » (2026-10-01). */
function worldValues() {
  const W = worldTrips(), pct = (x, d = 0) => `${num(x * 100, d)} %`, spct = (x) => `${x >= 0 ? "+" : "−"}${num(Math.abs(x) * 100, 2)} %`;
  const st = (lat) => { const p = parallelLength(lat); return pct(p.f / p.g - 1); };
  const A = W.AF1995, P = W.PA50, O = W.OMO, S = W.SOUTH;
  return {
    par45: st(45), par0: st(0), par35: st(-35),
    paDiff: spct(P.g / P.pub - 1), omoDiff: spct(O.g / O.pub - 1),
    afX: pct(A.f / A.g - 1), afPub: `${num(A.pub)} km`, afG: `${num(A.g)} km`, afF: `${num(A.f)} km`, afH: `${num(A.h, 1)} h`,
    afVg: `${num(A.g / A.h)} km/h`, afVf: `${num(A.f / A.h)} km/h`, afVmax: `${num(A.vmax)} km/h`,
    paVf: `${num(P.f / P.h)} km/h`, omoVf: `${num(O.f / O.h)} km/h`, swVg: `${num(S.g / S.h)} km/h`, swVf: `${num(S.f / S.h)} km/h`,
    swH: `${num(S.h, 1)} h`, swN: num(S.nFlights), swG: `${num(S.g)} km`, swF: `${num(S.f)} km`,
    paG: `${num(P.g)} km`, paF: `${num(P.f)} km`, paPub: `${num(P.pub)} km`,
  };
}

/** Nombres de la section « rayon tiré des temps de vol ». */
function radiusValues() {
  const F = flightRadius(), per = [...F.per].sort((p, q) => p.R - q.R);
  const long = per.filter((p) => p.gc > 6000 && p.key !== "HND-LHR");
  const hl = per.find((p) => p.key === "HND-LHR");
  const nm = (k) => k.replace("-", "–");
  return {
    rfR: `${num(F.R)} km`, rfSe: `${num(F.se)} km`, rfN: num(F.n), rfT0: `${num(F.t0 * 60)} min`, rfCorr: num(F.r, 3), rfScat: `${num(F.scatter * 60)} min`,
    rfPct: `${num((F.R / 6371 - 1) * 100, 1)} %`,
    rfLo: `${num(long[0].R)} km (${nm(long[0].key)})`, rfHi: `${num(long.at(-1).R)} km (${nm(long.at(-1).key)})`,
    rfMed: `${num(median(per.map((p) => p.R)))} km`, rfHL: `${num(hl.R)} km`,
  };
}

/**
 * Chiffres des cartes d'export (src/data/cards/avia.js, {{clé}}) : les mêmes que le texte,
 * calculés une fois par langue (proseValues coûte ~1 s : l'ajustement du plan libre).
 */
const cardMemo = new Map();
export function cardValueLookup(lang) {
  if (!cardMemo.has(lang)) {
    let t = (k, fb) => fb;
    try { t = ((T) => (k, fb) => { const v = T(k); return v && v !== k ? v : fb; })(makeT(lang, "avia")); } catch { /* hors Vite */ }
    cardMemo.set(lang, proseValues(t));
  }
  const vals = cardMemo.get(lang);
  return (k) => vals[k] ?? "?";
}
