import { test } from "node:test";
import assert from "node:assert/strict";
import { keplerRatio, ellipseN2, equiRatio, beatDays, periodH, tidalAccel, equiShape, flatShape, portHeight, gaugeRows } from "./tides-logic.js";

test("Kepler III gives the Sun/Moon tide ratio from two periods and the mass ratio", () => {
  const r = keplerRatio();
  assert.ok(Math.abs(r - 0.4604) < 0.001, r);
  assert.ok(Math.abs(r - equiRatio("S2", "M2")) < 0.01);      // the potential's own S2/M2 is 0.465
});

test("Kepler I: N2/M2 = 7e/2 agrees with the potential", () => {
  assert.ok(Math.abs(ellipseN2() - equiRatio("N2", "M2")) < 0.002, ellipseN2());
});

test("periods and beats", () => {
  assert.ok(Math.abs(periodH("M2") - 12.4206) < 1e-4);
  assert.ok(Math.abs(beatDays("M2", "S2") - 14.765) < 0.002);
  assert.ok(Math.abs(beatDays("K1", "O1") - 13.661) < 0.002);
});

test("the tidal pull stretches along the axis twice as hard as it squeezes across", () => {
  const near = tidalAccel(0).tide[0], far = tidalAccel(Math.PI).tide[0], side = tidalAccel(Math.PI / 2).tide[1];
  const D = 60.27, lin = 2 / D;                                   // first order: 2r/D along, −r/D across
  assert.ok(near > 0 && far < 0, "both bulges point outward");
  assert.ok(Math.abs(near - lin) / lin < 0.03 && Math.abs(-far - lin) / lin < 0.03);
  assert.ok(Math.abs(side + lin / 2) / (lin / 2) < 0.02);
});

test("two bulges on the globe, one hump on the plane", () => {
  assert.equal(equiShape(0), 1); assert.ok(Math.abs(equiShape(Math.PI) - 1) < 1e-12); assert.equal(equiShape(Math.PI / 2), -0.5);
  for (const H of [3000, 5000, 20000]) for (let x = 100; x < 40000; x += 500) assert.ok(flatShape(x + 100, H) < flatShape(x, H));
});

test("a port at the equator: two equal highs a lunar day; spring larger than neap", () => {
  const hi = portHeight(0, 0, 0), anti = portHeight(Math.PI, Math.PI, 0), neap = portHeight(0, Math.PI / 2, 0);
  assert.ok(Math.abs(hi - anti) < 1e-12);
  assert.ok(hi > neap);
  // the Moon at 28° declination: the two highs of a day at 45° N are unequal
  const d = 28 * Math.PI / 180, phi = 45 * Math.PI / 180;
  assert.ok(portHeight(0, 0, phi, d, 0) - portHeight(Math.PI, 0, phi, d, 0) > 0.3);
});

test("gauges: the semidiurnal line is M2 at all five, the range beats at 14.77 d or 13.66 d", () => {
  const R = gaugeRows();
  assert.equal(R.length, 5);
  for (const g of R) {
    assert.ok(Math.abs(g.pSemiH - 12.4206) < 0.002, `${g.name} ${g.pSemiH}`);
    const want = g.kind === "semi" || g.name === "Marseille" ? 14.765 : 13.661;
    assert.ok(Math.abs(g.pRange - want) < 0.1, `${g.name} ${g.pRange}`);
  }
  const brest = R.find((g) => g.key === "brest");
  assert.equal(brest.kind, "semi");
  assert.ok(Math.abs(brest.n2m2 - equiRatio("N2", "M2")) < 0.02);
  assert.equal(R.find((g) => g.key === "pensacola").kind, "diur");
});

import { args, predict, astro, equiHeight } from "./tides-logic.js";
import { TIDE_GAUGES, TIDE_EXCERPT } from "../../data/presets/grav-tides.js";
import { TICON_GLOBE, TICON_NAMES, TICON_BASINS } from "../../data/presets/grav-ticon.js";

test("predict reproduces the Go fit of Brest (March 2018) from its eight main constants", () => {
  const g = TIDE_GAUGES.find((x) => x.key === "brest"), t0 = Date.UTC(TIDE_EXCERPT.year, TIDE_EXCERPT.month - 1, 1) / 1000;
  const cs = Object.fromEntries(TICON_NAMES.map((n) => [n, g.cs[n]]));
  let se = 0, ss = 0;
  for (let i = 0; i < g.fit.length; i++) { const p = predict(cs, args(t0 + 3600 * i)); se += (p - g.fit[i]) ** 2; ss += g.fit[i] ** 2; }
  assert.ok(Math.sqrt(se / ss) < 0.1, Math.sqrt(se / ss));     // the six minor lines left out (M4, MS4, Sa…) are under 10 %
});

test("TICON's Brest, in our convention, predicts Brest as well as our own fit", () => {
  const g = TIDE_GAUGES.find((x) => x.key === "brest"), t0 = Date.UTC(TIDE_EXCERPT.year, TIDE_EXCERPT.month - 1, 1) / 1000;
  const row = TICON_GLOBE.reduce((b, r) => (Math.hypot(r[0] - g.lat, r[1] - g.lon) < Math.hypot(b[0] - g.lat, b[1] - g.lon) ? r : b));
  assert.ok(Math.hypot(row[0] - g.lat, row[1] - g.lon) < 0.2);
  const cs = Object.fromEntries(TICON_NAMES.map((n, i) => [n, [row[2 + i] / 100, row[10 + i]]]));
  let se = 0, ss = 0;
  for (let i = 0; i < g.fit.length; i++) { const p = predict(cs, args(t0 + 3600 * i)); se += (p - g.fit[i]) ** 2; ss += g.fit[i] ** 2; }
  assert.ok(Math.sqrt(se / ss) < 0.12, Math.sqrt(se / ss));
});

test("lunar time runs at 14.4920521 deg/h", () => {
  const a = astro(1e9), b = astro(1e9 + 3600 * 10);
  assert.ok(Math.abs(((b[0] - a[0]) % 360 + 360) % 360 - 144.920521) < 1e-3);
});

test("equilibrium tide: 0.36 m under a Moon at 60.27 R, the Sun adds 0.16 m", () => {
  const dm = 60.27 * 6371;
  assert.ok(Math.abs(equiHeight(0, 1, 0, dm) - 0.358) < 0.002);
  assert.ok(Math.abs(equiHeight(0, 1, 0, dm, 1, 0, 1) - equiHeight(0, 1, 0, dm) - 0.164) < 0.003);
});

test("enclosed seas have far smaller tides than the open coast", () => {
  const m = Object.fromEntries(TICON_BASINS.map((b) => [b.key, b.med]));
  assert.ok(m.atl > 50 * m.baltic && m.atl > 10 * m.med && m.atl > 10 * m.black);
});

// le globe des marées (tideglobe.js) : la flèche de la Lune est horizontale quelle que soit l'heure (caméra à 90° d'elle,
// dans le plan de l'équateur) ; c'est ce qui permet d'écrire « Moon » par-dessus la vidéo pré-rendue sans la regarder
test("globe des marées : la Lune toujours à l'horizontale de l'écran", async () => {
  const { moonArrow } = await import("./tideglobe.js");
  for (const ra of [0, 1, 2.5, 4, 6]) { const { ux, uy } = moonArrow(ra); assert.ok(Math.abs(Math.abs(ux) - 1) < 1e-9 && Math.abs(uy) < 1e-9); }
});
