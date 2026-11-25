import { test } from "node:test";
import assert from "node:assert/strict";
import { jdFromUTC, deltaT, gmst, sun, moon, topocentric, altaz, greatCircle, subPoint, flatAzimuth, refrArcmin, refrArcminApp, bodyAt, OBS } from "./ephemeris.js";

// PUBLISHED, not computed: Espenak, greatest eclipse of 2026 Aug 12 (the azim tab's [3]).
const ECL = { lat: 65 + 13.4 / 60, lon: -(25 + 13.7 / 60), alt: 25.8, az: 248.4, sunDec: 14 + 48 / 60 + 4.5 / 3600, moonDec: 15 + 36 / 60 + 58.5 / 3600 };

test("Julian day: J2000.0 epoch and a Gregorian date", () => {
  assert.equal(jdFromUTC(2000, 1, 1, 12), 2451545.0);
  assert.equal(jdFromUTC(2026, 8, 12, 0), 2461264.5);
});

test("greatest eclipse 2026 Aug 12 17:45:53.3 UTC: Sun alt/az and both declinations match Espenak's published values", () => {
  const jd = jdFromUTC(2026, 8, 12, 17, 45, 53.3);
  const jdTT = jd + deltaT(2000 + (jd - 2451545) / 365.25) / 86400;
  const s = sun(jdTT), m = moon(jdTT);
  const hs = altaz(s.ra, s.dec, ECL.lat, ECL.lon, jd);
  assert.ok(Math.abs(hs.alt - ECL.alt) < 0.06, `alt ${hs.alt}`);
  assert.ok(Math.abs(hs.az - ECL.az) < 0.06, `az ${hs.az}`);
  assert.ok(Math.abs(s.dec - ECL.sunDec) < 0.01);
  assert.ok(Math.abs(m.dec - ECL.moonDec) < 0.01);
  // at greatest eclipse the topocentric Moon sits on the Sun to within a few arcminutes
  const t = topocentric(m.ra, m.dec, m.parallax, ECL.lat, ECL.lon, jd, 0);
  const hm = altaz(t.ra, t.dec, ECL.lat, ECL.lon, jd);
  assert.ok(Math.abs(hm.alt - hs.alt) < 0.05 && Math.abs(hm.az - hs.az) < 0.05);
});

test("Moon: distance in the 356,000-407,000 km band, parallax about a degree", () => {
  for (const d of [0, 100, 200, 300]) {
    const m = moon(2461264.5 + d);
    assert.ok(m.distKM > 356000 && m.distKM < 407000);
    assert.ok(m.parallax > 0.88 && m.parallax < 1.03);
  }
});

test("sub-solar point at UTC noon on the June solstice: ~23.4 N, longitude within the equation of time of Greenwich", () => {
  const jd = jdFromUTC(2026, 6, 21, 12);
  const s = sun(jd + deltaT(2026.5) / 86400);
  const sub = subPoint(s.ra, s.dec, jd);
  assert.ok(Math.abs(sub.lat - 23.44) < 0.02, `lat ${sub.lat}`);
  assert.ok(Math.abs(sub.lon) < 1.2, `lon ${sub.lon}`);
});

test("the two refraction formulas are not interchangeable: 33.1' (Saemundsson, true alt) vs 40.8' (Bennett misfed) at -26.5'", () => {
  assert.ok(Math.abs(refrArcmin(-26.5 / 60) - 33.1) < 0.3);
  assert.ok(Math.abs(refrArcminApp(-26.5 / 60) - 40.8) < 0.3);
});

test("great circle: Paris -> Sydney about 16,960 km; the flat AE azimuth has no free parameter", () => {
  const g = greatCircle(48.86, 2.35, -33.87, 151.21);
  assert.ok(Math.abs(g.d - 16960) < 40, `d ${g.d}`);
  const a1 = flatAzimuth(48.86, 2.35, 23.4, 0), a2 = flatAzimuth(48.86, 2.35, 23.4, 0);
  assert.equal(a1, a2);
  // observer due south of the sub-point on the same meridian: flat azimuth is due north (toward the pole)
  assert.ok(Math.abs(flatAzimuth(10, 0, 23.4, 0)) < 1e-9);
});

test("bodyAt bundles the same numbers as the separate calls, and OBS mirrors the named exports", () => {
  const jd = jdFromUTC(2026, 8, 12, 17, 45, 53.3);
  const b = bodyAt("sun", jd, ECL.lat, ECL.lon, 0, { refraction: false });
  assert.ok(Math.abs(b.altTrue - ECL.alt) < 0.06);
  assert.equal(OBS.gmst, gmst);
});
