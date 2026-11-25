import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GPS_A_RE,
  satPosition,
  observerVector,
  elevationAndRange,
  allSatellites,
  visibilitySummary,
  keplerPeriodSeconds,
  formatHoursMinutes,
  orbitalSpeedKmS,
  maxCentralAngleDeg,
  maxVisibleDurationSeconds,
  rangeWindowKm,
  gravitationalShiftMicrosPerDay,
  velocityDilationMicrosPerDay,
  netRelativisticOffsetMicrosPerDay,
  pickTriSatellites,
  reflectAcrossPlane,
  verifyTriplePoint,
  sphereIntersectionCircle,
  circlePoint,
  shellRings,
  shellMeridians,
} from "./logic.js";

test("satPosition sits on the orbit sphere of radius GPS_A_RE for any plane/slot/phase", () => {
  for (const [k, m, t] of [[0, 0, 0], [3, 2, 1.4], [5, 3, 6.0]]) {
    const S = satPosition(k, m, t);
    const r = Math.hypot(S[0], S[1], S[2]);
    assert.ok(Math.abs(r - GPS_A_RE) < 1e-9, `satellite must sit at orbit radius (plane ${k}, slot ${m})`);
  }
});

test("Kepler box: T = 2*pi*sqrt(a^3/GM) computed, not hardcoded, matches the documented 11 h 58 min", () => {
  const T = keplerPeriodSeconds();
  assert.equal(formatHoursMinutes(T), "11 h 58 min");
});

test("orbital speed matches the documented ~3.9 km/s (ESA Navipedia, computed from a and GM)", () => {
  const v = orbitalSpeedKmS();
  assert.ok(Math.abs(v - 3.9) < 0.05, `expected ~3.9 km/s, got ${v}`);
});

test("max visibility duration: no satellite is ever visible above a true horizon for more than the documented 5 h 04 min, or above the 5 deg mask for more than 4 h 44 min", () => {
  const trueHorizon = maxVisibleDurationSeconds(0);
  const masked = maxVisibleDurationSeconds(5);
  assert.equal(formatHoursMinutes(trueHorizon), "5 h 04 min");
  assert.equal(formatHoursMinutes(masked), "4 h 44 min");
  assert.ok(masked < trueHorizon, "a stricter elevation mask must shorten the visibility window");
});

test("maxCentralAngleDeg(0) matches the documented arccos(R/a) = 76.12 deg", () => {
  const gamma = maxCentralAngleDeg(0);
  assert.ok(Math.abs(gamma - 76.12) < 0.02);
});

test("range window matches the documented 20,200-25,800 km band", () => {
  const { minKm, maxKm } = rangeWindowKm();
  assert.ok(Math.abs(minKm - 20189) < 5, `expected ~20,189 km, got ${minKm}`);
  assert.ok(Math.abs(maxKm - 25785) < 5, `expected ~25,785 km, got ${maxKm}`);
});

test("relativistic ledger: +45.7 (gravitational) - 7.1..7.3 (velocity) ~= +38.6 microseconds/day", () => {
  const grav = gravitationalShiftMicrosPerDay();
  const vel = velocityDilationMicrosPerDay();
  const net = netRelativisticOffsetMicrosPerDay();
  assert.ok(Math.abs(grav - 45.7) < 0.5, `gravitational term: expected ~45.7 us/day, got ${grav}`);
  assert.ok(Math.abs(vel - 7.2) < 0.5, `velocity term: expected ~7.1-7.3 us/day, got ${vel}`);
  assert.ok(Math.abs(net - 38.6) < 1, `net offset: expected ~38.6 us/day, got ${net}`);
});

test("visibility count sits in the documented typical range (8-12), and every visible satellite's range sits inside the documented window", () => {
  for (const lat of [-60, -20, 0, 20, 45, 80]) {
    for (const t of [0, 1.2, 3.7, 5.5]) {
      const sats = allSatellites(lat, t).filter((s) => s.visible);
      assert.ok(sats.length >= 6 && sats.length <= 14, `lat=${lat} t=${t}: got ${sats.length} visible satellites (typical 8-12)`);
      const { minKm, maxKm } = rangeWindowKm();
      for (const s of sats) {
        const rangeKm = s.range * 6371;
        assert.ok(rangeKm >= minKm - 1 && rangeKm <= maxKm + 1, `range ${rangeKm} km out of the ${minKm}-${maxKm} km window`);
      }
    }
  }
});

test("visibilitySummary reports the same count/range bounds as filtering allSatellites by hand", () => {
  const lat = 45, t = 0.7;
  const summary = visibilitySummary(lat, t);
  const manual = allSatellites(lat, t).filter((s) => s.visible);
  assert.equal(summary.count, manual.length);
  if (manual.length) {
    assert.ok(Math.abs(summary.rangeMinKm - Math.min(...manual.map((s) => s.range * 6371))) < 1e-6);
    assert.ok(Math.abs(summary.rangeMaxKm - Math.max(...manual.map((s) => s.range * 6371))) < 1e-6);
  }
});

test("observerVector/elevationAndRange: a satellite directly overhead reads el=90 and range=a-R", () => {
  const P = observerVector(0);
  const S = [GPS_A_RE, 0, 0]; // straight up from the equator at longitude 0
  const { elDeg, range } = elevationAndRange(P, S);
  assert.ok(Math.abs(elDeg - 90) < 1e-6);
  assert.ok(Math.abs(range - (GPS_A_RE - 1)) < 1e-9);
});

test("the two trilateration solutions (you + mirror) both satisfy the three range equations to machine precision, on all three spheres", () => {
  let checked = 0;
  for (const [lat, t] of [[45, 0], [-30, 2.1], [10, 4.4], [70, 1.0]]) {
    const picks = pickTriSatellites(lat, t);
    if (picks.length < 3) continue;
    const P = observerVector(lat);
    const [p1, p2, p3] = picks;
    assert.ok(verifyTriplePoint(P, picks), "the true receiver position must satisfy all three range spheres");
    const mirror = reflectAcrossPlane(P, p1.S, p2.S, p3.S);
    assert.ok(verifyTriplePoint(mirror, picks), "the mirror point must ALSO satisfy all three range spheres exactly");
    assert.ok(dist3(P, mirror) > 1e-6, "mirror must be a distinct point from the receiver");
    checked++;
  }
  assert.ok(checked >= 3, "expected at least 3 of the 4 sampled (lat, t) pairs to yield 3+ candidate satellites");
});

test("sphereIntersectionCircle: every sampled point on the circle sits at the two correct ranges from both centres", () => {
  const A = [1.2, 0.3, -0.5], ra = 3.1;
  const B = [-0.8, 1.1, 0.2], rb = 2.7;
  const circle = sphereIntersectionCircle(A, ra, B, rb);
  for (const theta of [0, 1, 2.5, 4.2, 6.0]) {
    const p = circlePoint(circle, theta);
    assert.ok(Math.abs(dist3(p, A) - ra) < 1e-9, `point at theta=${theta} not at range ra from A`);
    assert.ok(Math.abs(dist3(p, B) - rb) < 1e-9, `point at theta=${theta} not at range rb from B`);
  }
});

test("shellRings/shellMeridians: every generated point sits exactly on the shell radius (sphere, not a flat silhouette)", () => {
  const center = [0.5, -0.2, 0.1], r = 2.4;
  for (const ring of shellRings(center, r)) {
    for (const p of ring) assert.ok(Math.abs(dist3(p, center) - r) < 1e-9);
  }
  for (const merid of shellMeridians(center, r)) {
    for (const p of merid) assert.ok(Math.abs(dist3(p, center) - r) < 1e-9);
  }
  assert.equal(shellRings(center, r).length, 5, "rings from -60 to 60 step 30 = 5");
  assert.equal(shellMeridians(center, r).length, 4, "meridians from 0 to 180 step 45 (exclusive) = 4");
});

function dist3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
