// Tests de l'onglet avia (epic14) : node --test src/tabs/avia/logic.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { GJT, OMO, CRUISE } from "../../data/presets/avia.js";
import { AVIA_FLAT_FIT } from "../../data/presets/avia-flat-fit.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b} (±${tol})`);

test("voler à niveau : 0,135°/min à 250 m/s, 8,1°/h, montée de ~116 ft/min après 1 min d'assiette figée", () => {
  const f = L.levelFlight(CRUISE.v, CRUISE.h);
  near(f.degPerMin, 0.1347, 0.0005);
  near(f.degPerHour, 8.08, 0.01);
  near(f.climbAfter(60) / 0.3048 * 60, 116, 1, "ft/min");
  near(f.centripetalFrac, 0.001, 0.0001);
  // le nez tourne de l'arc parcouru : Sydney-Santiago ≈ 102°
  near(L.turnOver(L.distGC([AIRPORTS.SYD.lat, AIRPORTS.SYD.lon], [AIRPORTS.SCL.lat, AIRPORTS.SCL.lon])), 102, 1);
});

test("conservateur de cap : −Ω sin φ, signe inversé entre hémisphères ; le plan ne donne jamais ça", () => {
  near(L.OMEGA_DEG_H, 15.041, 0.001);
  assert.ok(L.dgDrift(60) < 0 && L.dgDrift(-60) > 0);
  near(L.dgDrift(90), -15.041, 0.001);
  near(L.dgDrift(0), 0, 1e-12);
  assert.equal(L.dgDriftFlat.still(-60), 0);
  assert.equal(Math.sign(L.dgDriftFlat.disc(60)), Math.sign(L.dgDriftFlat.disc(-60)));
});

test("gyrocompas : composantes Ω cos φ / Ω sin φ, la latitude se relit, rien d'horizontal sur un plan", () => {
  for (const lat of [-78, -34, 0, 1.4, 45, 69.7]) {
    const e = L.earthRate(lat);
    near(e.lat, lat, 1e-9); near(e.total, L.OMEGA_DEG_H, 1e-9);
  }
  assert.equal(L.earthRateFlat("disc").h, 0);
  assert.equal(L.earthRateFlat("still").total, 0);
});

test("Schuler : 84,4 min ; une centrale « globe » sur un plan reste à ±201 km du départ", () => {
  near(L.schulerPeriod() / 60, 84.4, 0.05);
  const r = L.irsOnPlane(250, 3600);
  near(r.amp / 1000, 201.5, 0.5);
  assert.ok(Math.abs(r.xc) <= r.amp + 1e-6);
  near(r.err / 1000, 1095, 2);
});

test("EI-GJT : l'écart d'arc atteint ~90° quand l'attitude est déclarée invalide, ~45° au passage du pôle", () => {
  const arc = L.gjtArc(GJT.gs, GJT.vTrue);
  assert.equal(arc(30), 0);
  near(arc(GJT.invalid), 85, 5, "20:59");
  near(arc(60), 92, 5, "21:00");
  // au passage du pôle, la fausse position est à ~90° − latitude vraie du pôle
  near(arc(GJT.poleCross) + GJT.start[0], 90, 6, "20:53");
  // pente initiale 1,6 g
  near((GJT.gs[1][1] - GJT.gs[0][1]) / ((GJT.gs[1][0] - GJT.gs[0][0]) * 60) / L.G0, 1.6, 0.05);
});

test("cap de départ : Sydney -> Santiago part au sud-est sur le globe, au nord-nord-est sur le disque", () => {
  const a = [AIRPORTS.SYD.lat, AIRPORTS.SYD.lon], b = [AIRPORTS.SCL.lat, AIRPORTS.SCL.lon];
  const g = L.bearingGC(a, b), f = L.flatLine(a, b);
  assert.ok(g > 120 && g < 160, `globe ${g}`);
  assert.ok(f.brg > 0 && f.brg < 45, `flat ${f.brg}`);
  assert.ok(f.maxLat > 40, "la droite du disque passe dans l'hémisphère nord");
  assert.ok(L.gcExtremeLat(a, b) < -55, "le grand cercle descend vers l'Antarctique");
  // aeXY/aeLL réciproques
  const p = L.aeLL(L.aeXY([-33.9, 151.2])); near(p[0], -33.9, 1e-9); near(p[1], 151.2, 1e-9);
});

test("vols réels : le globe s'ajuste avec une seule vitesse, le disque non ; même le meilleur plan libre fait pire", () => {
  const st = ROUTES.map((r) => L.routeStats(r, AIRPORTS));
  const both = st.filter((s) => s.both);
  assert.ok(both.length >= 40, `${both.length} routes aller-retour`);
  const g = L.fitTime(st, (s) => s.gc), a = L.fitTime(st, (s) => s.ae);
  assert.ok(g.v > 850 && g.v < 950, `vitesse globe ${g.v}`);
  assert.ok(g.rms < 0.06, `globe rms ${g.rms}`);
  assert.ok(a.rms > 0.3, `disque rms ${a.rms}`);
  // routes du sud : vitesse sol impliquée sur le disque ≥ 1 500 km/h pour les grandes traversées
  for (const k of ["SYD-SCL", "AKL-SCL", "MEL-SCL", "SYD-JNB", "PER-JNB"]) {
    const s = st.find((x) => x.key === k);
    assert.ok(s.vFlat > 1700 && s.vGlobe < 950, `${k} ${s.vGlobe} / ${s.vFlat}`);
  }
  const f = L.fitFlat(st, AIRPORTS, g);
  assert.ok(f.edges > f.dof, "plus de routes que de nombres libres : le test a du pouvoir");
  assert.ok(f.rms > 2 * g.rms, `plan libre ${f.rms} contre globe ${g.rms}`);
  // le meilleur plan stocké (scripts/fit_avia_flat.mjs) est toujours l'optimum, et son rejeu le retrouve
  assert.ok(f.rms >= AVIA_FLAT_FIT.rms - 0.002, `une recherche neuve (${f.rms}) bat le stocké (${AVIA_FLAT_FIT.rms}) : relancer fit_avia_flat.mjs`);
  const re = L.fitFlat(st, AIRPORTS, { ...g, init: AVIA_FLAT_FIT.init, iters: 400 });
  near(re.rms, AVIA_FLAT_FIT.rms, 0.001, "rejeu");
});

test("tour du monde par les pôles : le globe redonne la distance et la moyenne publiées", () => {
  const c = L.polarCircuit(OMO.pts);
  near(c.g, OMO.km, 0.002 * OMO.km);
  near(c.g / OMO.hours, OMO.avg, 3);
  assert.ok(c.f / OMO.hours > 1.4 * OMO.avg);
});

test("texte : les deux pires routes du globe sont bien celles que nomme la prose, pour les raisons qu'elle donne", () => {
  const st = ROUTES.map((r) => L.routeStats(r, AIRPORTS));
  const g = L.fitTime(st, (s) => s.gc);
  const w = [...g.res].sort((p, q) => Math.abs(q.rel) - Math.abs(p.rel));
  // la pire longue route (values.js gWorst) et la pire courte (gWorst2)
  const s0 = st.find((s) => s.key === w.find((r) => st.find((x) => x.key === r.key).gc > 5000).key), s1 = st.find((s) => s.key === w.find((r) => st.find((x) => x.key === r.key).gc < 3000).key);
  assert.equal(s0.key, "HND-LHR");
  assert.ok(w.slice(0, 2).some((r) => r.key === s1.key), "le saut court est parmi les deux pires");
  assert.ok(Math.max(...s0.wpt.map((p) => p[0])) > 75, "la route déposée passe par l'Arctique");
  assert.ok(s1.gc < 2000, `${s1.key} : un saut court`);
  // la prose dit « les grandes routes du sud à peu près deux fois plus longues »
  for (const s of st.filter((x) => x.south && x.gc > 5000)) assert.ok(s.ratio > 1.9 && s.ratio < 2.6, `${s.key} ${s.ratio}`);
});


test("Eötvös : signe inversé est/ouest, terme v²/R ; données GRAV-D EN02 : seul le globe accorde les lignes voisines", async () => {
  const { GRAVD } = await import("../../data/presets/avia-gravd.js");
  near(L.eotvos(250, 0, 45, 10668), 3558, 5); near(L.eotvos(-250, 0, 45, 10668), -1599, 5);
  near(L.eotvos(0, 250, 45, 10668), 979, 2);
  assert.equal(L.eotvos(250, 0, 45, 0, { rot: false, R: Infinity }), 0, "un plan : rien");
  near(L.normalGravity(0), 978032.68, 0.01); near(L.normalGravity(90), 983218.64, 0.05); // GRS80 : 9,8321863685 m/s² au pôle
  const D = L.gravdPairs(GRAVD[0].lines);
  assert.ok(D.lines.every((l) => (l.east ? l.E > 1000 : l.E < -800)), "correction positive vers l'est, négative vers l'ouest");
  const r2 = L.pairRms(D.pairs), r0 = L.pairRms(D.pairs, { none: true }), r1 = L.pairRms(D.pairs, { R: Infinity });
  assert.ok(r2 < 6, `globe ${r2}`); assert.ok(r0 > 2000, `plat ${r0}`); assert.ok(r1 > 50, `rotation seule ${r1}`);
  const f = L.fitRadius(D.pairs);
  assert.ok(f.km > 5800 && f.km < 6700, `rayon ${f.km}`);
  near(f.rmsAt(6371), r2, 0.05, "forme fermée = calcul direct");
  const by = L.fitRadiusByPair(D.pairs).map((x) => x.km);
  assert.ok(by.length >= 15 && Math.min(...by) > 5000 && Math.max(...by) < 7500, by.join(" "));
});

test("Eötvös : Ω et R ajustés ensemble sur EN02 ; la balance du passager ; R = ∞ ne rattrape rien", async () => {
  const { GRAVD } = await import("../../data/presets/avia-gravd.js");
  const D = L.gravdPairs(GRAVD[0].lines);
  const J = L.fitRotRadius(D.pairs);
  assert.ok(Math.abs(J.om - 1) < 3 * J.seOm && J.seOm < 0.002, `Ω/Ω₀ = ${J.om} ± ${J.seOm}`);
  assert.ok(J.dayH > 23.8 && J.dayH < 24.1, `tour en ${J.dayH} h`);
  assert.ok(J.km > 6000 && J.km < 6700 && J.seKm > 20 && J.seKm < 200, `R = ${J.km} ± ${J.seKm}`);
  assert.ok(J.rms < 6, `rms ${J.rms}`);
  assert.ok(J.corr > 0.8 && J.corr < 0.99, `corrélation ${J.corr} : liées, pas confondues`);
  assert.ok(J.nGroups >= 15 && J.per.length >= 15, `${J.nGroups} paires`);
  assert.ok(J.termOm > 20 * J.termR, `rotation ${J.termOm} ≫ courbure ${J.termR}`);
  assert.ok(J.flat.rms > 5 * J.rms, `R = ∞ : ${J.flat.rms} mGal`);
  const Je = L.fitRotRadius(D.pairs, { ellipsoid: true });
  assert.ok(Math.abs(Je.km - J.km) < J.seKm && Math.abs(Je.om - J.om) < J.seOm, "sphère ou ellipsoïde : dans l'erreur");
  const W = L.lineWeights(D.lines);
  assert.ok(W.lines.every((l) => (l.east ? l.meas < -800 : l.meas > 800)), "chaque ligne vers l'est plus légère que la moyenne, chaque ligne vers l'ouest plus lourde");
  assert.ok(Math.abs(W.gap - W.gapPred) < 20, `mesuré ${W.gap}, prévu ${W.gapPred}`);
  near(L.grams(W.gap), 189, 5, "≈ 189 g pour 70 kg");
  near(L.grams(98066.5, 1), 100, 1e-9, "10 % de g sur 1 kg : 100 g");
});

test("rayon tiré des temps de vol et des vitesses propres déposées : proche de 6 371 km, et au-dessus (les biais vont tous vers le haut)", () => {
  const f = L.radiusFromFlights(ROUTES.map((r) => L.routeStats(r, AIRPORTS)));
  assert.ok(f.n >= 30, `${f.n} routes`);
  assert.ok(f.R > 6371 && f.R < 6371 * 1.08, `R = ${f.R}`);
  assert.ok(f.se < 300, `erreur type ${f.se}`);
  assert.ok(f.t0 > 0 && f.t0 < 1, `t0 = ${f.t0} h`);
  const hl = f.per.find((p) => p.key === "HND-LHR");
  assert.ok(hl.R === Math.max(...f.per.map((p) => p.R)), "Tokyo–Londres, le détour arctique, donne le plus grand rayon");
});

// 2026-10-01 : tours du monde, est-ouest et nord-sud
test("parallelLength: equal at the North Pole, the disc 57 % longer at the equator", async () => {
  const { parallelLength } = await import("./logic.js");
  const np = parallelLength(90); assert.ok(Math.abs(np.g) < 1e-6 && Math.abs(np.f) < 1e-6);
  const eq = parallelLength(0); assert.ok(Math.abs(eq.f / eq.g - Math.PI / 2) < 1e-12);
  assert.ok(parallelLength(-35).f / parallelLength(-35).g > 2.6);
});

test("worldTrip: globe sums land on the published distances; the disc needs impossible speeds except in the north", async () => {
  const { worldTrip } = await import("./logic.js");
  const { WORLD, OMO } = await import("../../data/presets/avia.js");
  const { ROUTES, AIRPORTS } = await import("../../data/presets/avia-flights.js");
  const T = Object.fromEntries(WORLD.map((w) => [w.k, worldTrip(w, { AP: AIRPORTS, routes: ROUTES, omo: OMO })]));
  assert.ok(Math.abs(T.PA50.g / T.PA50.pub - 1) < 0.002, `PA50 globe ${T.PA50.g} vs FAI ${T.PA50.pub}`);
  assert.ok(Math.abs(T.OMO.g / T.OMO.pub - 1) < 0.002, `OMO globe ${T.OMO.g} vs ${T.OMO.pub}`);
  for (const k of ["PA50", "OMO"]) { assert.ok(T[k].g / T[k].h < T[k].vmax); assert.ok(T[k].f / T[k].h > T[k].vmax, k); }
  assert.ok(T.AF1995.f / T.AF1995.h < T.AF1995.vmax, "Concorde's northern loop does not discriminate");
  // anneau austral : temps mesurés, les deux sens, 5 étapes chacun
  assert.equal(T.SOUTH.kind, "airborne");
  assert.ok(T.SOUTH.hE < T.SOUTH.hW, "eastbound helped by the westerlies");
  assert.ok(T.SOUTH.g / T.SOUTH.h > 750 && T.SOUTH.g / T.SOUTH.h < 950);
  assert.ok(T.SOUTH.f / T.SOUTH.h > 1700);
});

test("test de la correction du NGS (epic16/UC01) : minimum de rms(k) à k ≈ 1, ~2 700 mGal à k = 0", async () => {
  const { GRAVD } = await import("../../data/presets/avia-gravd.js");
  const G = L.gravdPairs(GRAVD[0].lines), K = L.kScan(G.pairs);
  near(K.kStar, 1.0007, 0.002, "k*");
  assert.ok(K.seK > 0 && K.seK < 0.01);
  near(K.rms1, 4.3, 0.2); near(K.rmsStar, 3.8, 0.2);
  assert.ok(K.rms0 > 2000 && K.rms0 < 3500, `rms0 ${K.rms0}`);
  assert.ok(K.rmsAt(0.5) > 300 && K.rmsAt(2) > 2000);   // la correction ne « force » rien : il y a un vrai creux
  assert.equal(K.curve.length, 201);
  // sphère ou ellipsoïde pour refaire E : même k*
  near(L.kScan(G.pairs, {}).kStar, K.kStar, 0.002);
});

test("forces à niveau (epic17) : ISA 697 et 238 hPa, W − L = v²/(R+h), poussée = traînée", () => {
  near(L.isaPressure(0), 1013.25, 1e-9); near(L.isaPressure(3048), 696.8, 0.5); near(L.isaPressure(10668), 238.4, 0.5);
  const F = L.levelForces(250, 10668);
  near(F.W - F.L, 0.00100, 0.00005); near(F.W - L.levelForces(129, 3048).L, 0.00027, 0.00003);
  assert.equal(F.T, F.D);
});

test("Eötvös : les deux réductions du GRS80, mesurées sur les paires, redonnent les gradients de l'ellipsoïde et le même rayon (2026-10-03)", async () => {
  const { GRAVD } = await import("../../data/presets/avia-gravd.js");
  const D = L.gravdPairs(GRAVD[0].lines), G = L.fitGradients(D.pairs);
  near(G.grs.km, L.fitRadius(D.pairs).km, 1e-6, "avec les gradients du GRS80 : le même ajustement que fitRadius");
  near(G.both.fa, 0.3086, 2 * G.both.seFa, "gradient en hauteur mesuré");
  near(G.both.lat, G.grs80.lat, 2 * G.both.seLat, "gradient nord-sud mesuré");
  for (const k of ["fa", "lat", "both"]) near(G[k].km, G.grs.km, G[k].seKm, `R avec ${k} mesuré`);
  // défaire la correction : 1/R trouvé − 1/R retiré est fixé par les données, pas par le rayon retiré
  const inv = (R) => 1 / L.fitRadius(D.pairs, { R: R * 1000 }).km - 1 / R;
  near(inv(6000), inv(7000), 2e-7, "1/R trouvé − 1/R retiré");
});

test("bearingFit : le disque azimutal lui-même a des caps faux (grand cercle ≠ droite), la carte ajustée aussi", () => {
  const st = ROUTES.map((r) => L.routeStats(r, AIRPORTS));
  const pos = Object.fromEntries(AVIA_FLAT_FIT.keys.map((k, i) => [k, AVIA_FLAT_FIT.pos[i]]));
  const b = L.bearingFit(st, AIRPORTS, pos);
  assert.equal(b.rows.length, 2 * st.filter((s) => s.both).length);
  assert.ok(b.rms > 30 && b.rms < 120, `rms ${b.rms}`);
  assert.ok(b.rows.every((r) => Math.abs(r.diff) <= 180));
});
