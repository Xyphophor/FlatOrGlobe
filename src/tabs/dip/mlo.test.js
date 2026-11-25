import { test } from "node:test";
import assert from "node:assert/strict";
import { MLO, KEAHOLE, seaDip, tangentArc, lastLimbAlt, sunAt, sunsetMin, keaholeFromMlo, seaHorizonAt, evening, mloStats } from "./mlo.js";
import { MLO_SITE, MLO_EVENINGS, MLO_FEATURED } from "../../data/presets/dip-mlo.js";
import { MLO_HORIZON, MLO_SEA, MLO_PROFILE } from "../../data/presets/dip-mlo-profile.js";

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b} (±${tol})`);

test("dip of the sea horizon from 3,397 m: 1.87° true, 1.75° with k = 0.13; the arc to the tangent point is 2.01°", () => {
  near(seaDip(3397, 0), 1.871, 0.002, "geometric dip");
  near(seaDip(3397), 1.745, 0.002, "apparent dip");
  near(tangentArc(3397), 2.006, 0.002, "arc to the tangent point");
  // the DEM script's sea horizon is the same number
  near(-MLO_SEA.geo, seaDip(3397, 0), 1e-3, "MLO_SEA.geo"); near(-MLO_SEA.app, seaDip(3397), 1e-3, "MLO_SEA.app");
});

test("last edge: −2.75° at Mauna Loa, −0.81° at Keahole; refraction lets the mountain see further, never flips the sign", () => {
  const sd = 0.2627;
  near(lastLimbAlt(3397, sd), -2.751, 0.003, "MLO refracted"); near(lastLimbAlt(3397, sd, false), -2.133, 0.003, "MLO unrefracted");
  near(lastLimbAlt(4, sd), -0.815, 0.003, "Keahole refracted");
  assert.ok(lastLimbAlt(3397, sd) < lastLimbAlt(3397, sd, false) && lastLimbAlt(3397, sd, false) < lastLimbAlt(4, sd, false));
});

test("Keahole is 55 km from the observatory, towards the west-north-west", () => {
  const k = keaholeFromMlo();
  near(k.km, 54.9, 0.2, "distance"); near(k.az, 293.0, 0.3, "azimuth");
});

test("computed sunsets: Keahole first, the mountain 6 to 7 minutes later; the crossing really is at the last-edge altitude", () => {
  const d = MLO_FEATURED.date, kea = sunsetMin(KEAHOLE, d), mlo = sunsetMin(MLO, d);
  const sd = sunAt(MLO, d, mlo).sd;
  near(sunAt(MLO, d, mlo).alt, lastLimbAlt(MLO.h, sd), 1e-4, "MLO crossing");
  assert.ok(mlo - kea > 5 && mlo - kea < 8, `lead ${mlo - kea} min`);
  assert.ok(sunsetMin(MLO, d, false) < mlo, "without refraction the mountain loses the Sun earlier");
});

test("the horizon file: the sea from 281° to 310° except where Hualālai rises (≈300°), terrain to the south", () => {
  assert.equal(MLO_HORIZON.length, 161);
  assert.equal(seaHorizonAt(290), true); assert.equal(seaHorizonAt(300), false); assert.equal(seaHorizonAt(250), false); assert.equal(seaHorizonAt(320), false);
  const h300 = MLO_HORIZON.find((h) => h[0] === 300);
  near(h300[3], 35.2, 1, "Hualālai at 35 km");
  assert.equal(MLO_PROFILE.find((p) => p[0] === 0)[1], 3397);
});

test("the year 2016: 331 evenings, 286 clear, 104 with a sea horizon; median last light 1.72° below the horizontal", () => {
  assert.equal(MLO_SITE.year, 2016); assert.equal(MLO_EVENINGS.length, 331);
  const s = mloStats();
  assert.equal(s.clear, 286); assert.equal(s.n, 104);
  near(s.altMed, -1.72, 0.01, "median altitude"); assert.equal(s.below, 90); assert.equal(s.after, 70);
  near(s.leadMed, 1.95, 0.05, "median lead over Keahole's computed sunset (min)");
  // every kept evening is in the sea-horizon months
  assert.ok(s.rows.every((r) => ["04", "05", "06", "07", "08"].includes(r.date.slice(5, 7))));
});

test("the featured evening is a typical one (near the median), its curve ends below the threshold", () => {
  const e = evening(MLO_FEATURED);
  assert.ok(e.sea, "sea horizon");
  assert.ok(Math.abs(e.alt - mloStats().altMed) < 0.3, `featured ${e.alt}`);
  const after = MLO_FEATURED.curve.filter(([t]) => t > MLO_FEATURED.t + 1);
  assert.ok(after.length && after.every(([, v]) => v < MLO_SITE.threshold), "no direct light after the last light");
});
