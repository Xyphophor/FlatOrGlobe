import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GRV_G0,
  GRV_R,
  GRV_RHO,
  GRV_OM,
  GRV_MASS,
  GRV_DENSITY,
  GRV_DISC_T,
  GRV_TILT_CACHE,
  grvIGF,
  grvSphere,
  grvMGal,
  grvMapR,
  grvTilt,
  grvDiscField,
  gvVertRow,
  gvHeightRow,
  gvLatRow,
  gvRicherCheck,
  GRV_MODEL_ROWS,
  gravExp,
} from "./logic.js";

test("g falls off with height on the globe (rule-4 test: a presence, not a small difference)", () => {
  const g0 = grvSphere(0);
  const g11k = grvSphere(11000);
  assert.ok(g11k < g0, "gravity must be weaker at altitude");
  // Free-air gradient near the surface: -2g/R -- flat's infinite slab predicts
  // exactly zero here, which is the whole point of section 03.
  const measuredMgal = grvMGal(g0 - grvSphere(1));
  assert.ok(Math.abs(measuredMgal - 0.3086) < 0.001, "1 m of climb should cost ~0.3086 mGal, the free-air constant");
});

test("grvIGF reproduces the documented ~half a percent pole-to-equator spread", () => {
  const gPole = grvIGF(90), gEq = grvIGF(0);
  const spreadPct = (100 * (gPole - gEq)) / gPole;
  assert.ok(spreadPct > 0.4 && spreadPct < 0.6, `expected ~0.5%, got ${spreadPct.toFixed(3)}%`);
});

test("rotation alone explains about two thirds of the pole-to-equator gap (the callout's admitted limit)", () => {
  const rotationTerm = GRV_OM * GRV_OM * GRV_R; // omega^2 R at the equator
  const measuredGap = grvIGF(90) - grvIGF(0);
  const ratio = rotationTerm / measuredGap;
  assert.ok(ratio > 0.6 && ratio < 0.7, `expected ~2/3, got ${ratio.toFixed(3)}`);
});

test("disc-tilt integral matches the legacy's grid-verified values at Paris's and Sydney's map radii", () => {
  // Legacy comment (flat-or-globe-2.20.0.html ~L23078): 7.347 deg at
  // s=0.2286a (Paris's map radius) and 26.411 deg at s=0.6884a (Sydney's),
  // checked there against a brute-force 600x100x1200 volume integral.
  const rParis = grvMapR(48.85), rSydney = grvMapR(-33.9);
  const tiltParisDeg = (grvTilt(rParis).tilt * 180) / Math.PI;
  const tiltSydneyDeg = (grvTilt(rSydney).tilt * 180) / Math.PI;
  assert.ok(Math.abs(tiltParisDeg - 7.347) < 0.05, `Paris tilt off: ${tiltParisDeg}`);
  assert.ok(Math.abs(tiltSydneyDeg - 26.411) < 0.05, `Sydney tilt off: ${tiltSydneyDeg}`);
  assert.ok(grvTilt(0).tilt < 1e-9, "the centre of the disc is the one point with (numerically) no tilt");
});

test("grvTilt memoizes: a second call at the same rounded distance does not recompute", () => {
  const s = 987654.3;
  GRV_TILT_CACHE.delete(Math.round(s));
  const before = GRV_TILT_CACHE.size;
  const a = grvTilt(s);
  const afterFirst = GRV_TILT_CACHE.size;
  const b = grvTilt(s);
  const afterSecond = GRV_TILT_CACHE.size;
  assert.equal(afterFirst, before + 1, "first call should populate the cache");
  assert.equal(afterSecond, afterFirst, "second call at the same key must not grow the cache");
  assert.equal(a, b, "same cached object should be returned");
});

test("grvDiscField is a pure function of distance (no hidden state leaks between calls)", () => {
  const f1 = grvDiscField(1000000);
  const f2 = grvDiscField(1000000);
  assert.deepEqual(f1, f2);
});

test("Cavendish loop: g, R and G reproduce Earth's known mass and mean density", () => {
  assert.ok(Math.abs(GRV_MASS / 1e24 - 5.97) < 0.02, `mass off: ${GRV_MASS}`);
  assert.ok(Math.abs(GRV_DENSITY - GRV_RHO) / GRV_RHO < 0.01, `density should reproduce the assumed 5514 kg/m^3`);
});

test("the disc's thickness is a finite, plausible number (thousands of km, not degenerate)", () => {
  assert.ok(GRV_DISC_T > 1e6 && GRV_DISC_T < 5e7);
});

test("gvVertRow: globe grows linearly-ish with separation, flat plane is exactly zero, disc tilts", () => {
  const near = gvVertRow(1000);
  const far = gvVertRow(1e6);
  assert.equal(near.flatDeg, 0);
  assert.equal(far.flatDeg, 0);
  assert.ok(far.globeDeg > near.globeDeg);
  assert.equal(near.measuredDeg, near.globeDeg, "the 'measured' column is the globe prediction, not a free parameter");
});

test("gvHeightRow: climbing costs measurable mGal against a field gravimeter's 0.01 mGal noise floor", () => {
  const eiffel = gvHeightRow(276);
  assert.ok(eiffel.dMgal > 0);
  assert.ok(eiffel.timesNoise > 50, "the Eiffel Tower's gravity drop should be tens of times the field noise floor");
});

test("gvLatRow: Cayenne (4.94 deg) is weaker than Paris and lags a Paris-set clock, per Richer 1672", () => {
  const paris = gvLatRow(48.85);
  const cayenne = gvLatRow(4.94);
  assert.ok(cayenne.g < paris.g, "gravity should be weaker near the equator");
  assert.ok(cayenne.rateSec > 0, "a clock carried to Cayenne should run slow against Paris, as Richer found");
});

test("gvRicherCheck: the modern formula reproduces Richer's overshoot within the documented ballpark", () => {
  const r = gvRicherCheck();
  assert.ok(r.pred > 100 && r.pred < 148, "prediction should be positive and below Richer's raw 148 s");
  assert.ok(r.overshootPct > 0, "Richer's instrument should have overshot the modern prediction (thermal rod expansion)");
});

test("GRV_MODEL_ROWS: the globe passes all three tests, every flat proposal fails at least one", () => {
  assert.equal(GRV_MODEL_ROWS.length, 5);
  const globe = GRV_MODEL_ROWS[0];
  assert.deepEqual(globe.ok, [true, true, true]);
  for (const row of GRV_MODEL_ROWS.slice(1)) {
    assert.ok(row.ok.some((v) => v !== true), `${row.model} should fail at least one column`);
  }
});

test("gravExp: distant latitudes are resolvable with ordinary kit, nearly-identical ones are not", () => {
  const farApart = gravExp(0, 90, 2, 10);
  const nearlySame = gravExp(45, 45.02, 2, 10);
  assert.ok(farApart.resolvable, "pole vs equator should be resolvable with a 2 m pendulum or a 10 kg mass");
  assert.ok(!nearlySame.resolvable, "two nearly-identical latitudes should not be diagnostic");
  assert.equal(gravExp(45, 45, 2, 10).dgMgal, 0, "same latitude twice must show exactly zero difference");
});
