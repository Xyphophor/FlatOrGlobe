import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TWI_R, TWI_RIM, TWI_MEAS, TWI_OBLIQ, TWI_SUNUP, twiCeil, twiLayerKey, twiFlatE, twiFlatTh, twiFlatH, twiFlatD,
  twiHA, twiSpan, twiMidnightAlt, twiThreshold, twiShadowTop, twiThetaZ, twiwSubsolar, twiwZones, twiwFitAlt,
  twiwColour, twiwUTC, twiAE, twiwHA, twiHtRows, twiFlatRows, twiDurRows, twiExperiment, TWI_SD,
} from "./logic.js";

test("shadow ceiling h = R(sec theta - 1): 35 / 142 / 328 km at 6 / 12 / 18 deg (the numbers quoted in the prose)", () => {
  assert.equal(Math.round(twiCeil(TWI_R, 6)), 35);
  assert.equal(Math.round(twiCeil(TWI_R, 12)), 142);
  assert.equal(Math.round(twiCeil(TWI_R, 18)), 328);
  assert.equal(twiCeil(TWI_R, 0), 0);
  assert.equal(twiCeil(TWI_R, -6), twiCeil(TWI_R, 6), "sign of the depression is irrelevant");
});

test("layer labels follow the computed height, not the other way round", () => {
  const rows = twiHtRows();
  assert.deepEqual(rows.map((r) => r.layer), ["layer-ground", "layer-strato", "layer-thermo", "layer-iss"]);
  assert.equal(twiLayerKey(0.5), "layer-ground");
});

test("flat inverse-square: nuisance parameters cancel, E/E0 = (theta/theta0)^3 exactly", () => {
  for (const H of [1000, 5000]) for (const d of [0, 3000, 20000]) {
    assert.ok(Math.abs(twiFlatE(H, d) - Math.pow(twiFlatTh(H, d), 3)) < 1e-15);
  }
  assert.equal(twiFlatE(5000, 0), 1);
});

test("the steel-man that eats itself: H ~ 43 km makes the night dark enough, but shrinks the disc from 32' to ~4''", () => {
  const H = twiFlatH(TWI_MEAS, TWI_RIM);
  assert.ok(Math.abs(H - 43) < 1, `H = ${H}`);
  const forced = twiFlatRows().at(-1);
  assert.ok(forced.forced);
  assert.ok(Math.abs(forced.E / TWI_MEAS - 1) < 1e-9, "forced row matches the measured drop by construction");
  const sizeFactor = TWI_SD / forced.th;
  assert.ok(Math.abs(sizeFactor - 464) < 2, `size factor ${sizeFactor}`);
  assert.ok(forced.th * 60 > 3.9 && forced.th * 60 < 4.2, "about 4 arcseconds");
});

test("tune it the other way: at 5,000 km the flat midnight is about one seventieth of noon", () => {
  const E = twiFlatE(5000, TWI_RIM);
  assert.ok(Math.abs(1 / E - 70) < 1, `1/E = ${1 / E}`);
});

test("where IS night on a plane: 2,320,800 km at H = 5,000 km; 49,700 km for a thousandfold; 464,000 km at H = 1,000 km", () => {
  assert.ok(Math.abs(twiFlatD(TWI_MEAS, 5000) - 2320800) < 200);
  assert.ok(Math.abs(twiFlatD(1e-3, 5000) - 49700) < 100);
  assert.ok(Math.abs(twiFlatD(TWI_MEAS, 1000) - 464000) < 200);
});

test("hour angle sentinels: 'always' when the Sun never sinks that low, 'never' when it never rises that high", () => {
  assert.equal(twiHA(-18, 60, TWI_OBLIQ), "always");
  assert.equal(twiHA(60, 60, -TWI_OBLIQ), "never");
  assert.ok(Math.abs(twiHA(0, 0, 0) - 90) < 1e-9, "on the equator at the equinox the Sun sets at H = 90");
});

test("the radius-free thresholds: astronomical night vanishes above 48.6 N in June, nautical 54.6, civil 60.6", () => {
  assert.ok(Math.abs(twiThreshold(-18, TWI_OBLIQ) - 48.56) < 0.01);
  assert.ok(Math.abs(twiThreshold(-12, TWI_OBLIQ) - 54.56) < 0.01);
  assert.ok(Math.abs(twiThreshold(-6, TWI_OBLIQ) - 60.56) < 0.01);
});

test("sign test: Paris (48.86) has no astronomical night at the June solstice, Nice (43.70) does", () => {
  assert.ok(twiSpan(48.86, TWI_OBLIQ, -12, -18).all);
  assert.ok(twiSpan(43.70, TWI_OBLIQ, -12, -18).min > 0);
  assert.ok(twiMidnightAlt(48.86, TWI_OBLIQ) > -18 && twiMidnightAlt(43.70, TWI_OBLIQ) < -18);
});

test("measured twilight lengths quoted in the objections: ~68 min at the equator, ~107 min at Paris in March", () => {
  const eq = twiSpan(0, 0, TWI_SUNUP, -18).min, paris = twiSpan(48.86, 0, TWI_SUNUP, -18).min;
  assert.ok(Math.abs(eq - 68) < 3, `equator ${eq}`);
  assert.ok(Math.abs(paris - 107) < 3, `paris ${paris}`);
});

test("the duration table: 16 rows, Ushuaia is southern (negative), stage lengths grow with latitude at the equinox", () => {
  const rows = twiDurRows();
  assert.equal(rows.length, 16);
  const ush = rows.find((r) => r.place === "Ushuaia");
  assert.ok(ush.lat < 0);
  const eqx = rows.filter((r) => r.date === "equinox" && r.lat > 0).sort((a, b) => a.lat - b.lat);
  for (let i = 1; i < eqx.length; i++) assert.ok(eqx[i].civil.min > eqx[i - 1].civil.min);
});

test("the shadow's top is never below the antisolar point, it accelerates, and the sky is fully shadowed at 3-4.5 deg", () => {
  let prevRatio = 0;
  for (const th of [0.5, 1, 1.5, 2]) {
    const a = twiShadowTop(th, 15);
    assert.ok(a !== null && a > th, `top ${a} above depression ${th}`);
    const ratio = a / th;
    assert.ok(ratio > prevRatio, "rise ratio grows");
    prevRatio = ratio;
  }
  assert.ok(prevRatio > 1.1);
  for (const H of [10, 15, 20]) {
    const tz = twiThetaZ(H);
    assert.ok(tz > 3 && tz < 4.6, `theta_z(${H}) = ${tz}`);
    assert.equal(twiShadowTop(tz + 0.1, H), null, "past theta_z the whole sky is in shadow");
  }
});

test("subsolar point: 8 July 11:15 UTC puts the Sun over ~22.5 N, ~10 E; UTC noon at the equinox is near Greenwich", () => {
  const s = twiwSubsolar(189, 11.25);
  assert.ok(Math.abs(s.lat - 22.5) < 0.3, `lat ${s.lat}`);
  assert.ok(s.lon > 8 && s.lon < 14, `lon ${s.lon}`);
  const e = twiwSubsolar(80, 12);
  assert.ok(Math.abs(e.lon) < 3 && Math.abs(e.lat) < 1);
});

test("fitted flat rings: calibrated exactly at 45 N (radius = map distance to that evening's sunset), null when a stage never ends", () => {
  const jul = twiwSubsolar(189, 11.25), z = twiwZones(jul);
  assert.equal(z.length, 4);
  assert.ok(z[0].r > 0 && z[1].r > z[0].r && z[2].r > z[1].r);
  assert.ok(z[3].r > z[2].r, "45 N is south of the 48.6 threshold, so all four rings exist even in July");
  assert.ok(Math.abs(twiwFitAlt(0, z) - 90) < 1e-9);
  assert.ok(Math.abs(twiwFitAlt(z[0].r, z)) < 1e-9, "on the ring the fitted altitude is 0");
  assert.ok(twiwFitAlt(z[3].r + 50, z) < -18, "beyond the last ring: night");
  assert.equal(twiwHA(-18, 60, TWI_OBLIQ), null, "a ring that never closes reports null");
});

test("colour ramp is monotone in altitude, clamped at both ends; UTC formatter pads and rolls 60 s", () => {
  assert.deepEqual(twiwColour(95), [255, 253, 246]);
  assert.deepEqual(twiwColour(-40), [43, 49, 64]);
  let prev = 999;
  for (let a = 90; a >= -30; a -= 5) { const c = twiwColour(a)[0]; assert.ok(c <= prev); prev = c; }
  assert.equal(twiwUTC(11.25), "11:15 UTC");
  assert.equal(twiwUTC(9.9999), "10:00 UTC");
});

test("AE map: the pole is at the origin, the equator at radius 90, east runs anticlockwise on screen", () => {
  const p = twiAE(90, 0); assert.ok(Math.abs(p.x) < 1e-9 && Math.abs(p.y) < 1e-9);
  const e = twiAE(0, 0); assert.ok(Math.abs(Math.hypot(e.x, e.y) - 90) < 1e-9);
  assert.ok(twiAE(0, 90).x < 0);
});

test("experiment calculator: Paris in June has no astronomical night; total sunset -> -18 is 'all night'", () => {
  const r = twiExperiment(48.86, 23.44);
  assert.ok(r.astro.all && r.total.all);
  assert.ok(r.civil.min > 40);
  assert.ok(Math.abs(r.thr18 - 48.56) < 0.01);
});
