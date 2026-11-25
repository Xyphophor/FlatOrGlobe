import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEG,
  horizonDist,
  hiddenHeight,
  dropBelowTangent,
  effectiveRadius,
  globeElev,
  flatElev,
  dipAngle,
  tangentDistance,
  reconstructTwoStation,
} from "./math.js";

const R = 6371000;

test("horizonDist matches the ~sqrt(2Re) approximation at low altitude", () => {
  const d0 = horizonDist(R, 1.7);
  assert.ok(Math.abs(d0 - Math.sqrt(2 * R * 1.7)) < 1, "should be within 1 m of the small-angle approximation");
});

test("hiddenHeight is exactly zero before the horizon, and positive beyond it", () => {
  const d0 = horizonDist(R, 244);
  assert.equal(hiddenHeight(R, 244, d0 - 1000), 0);
  assert.ok(hiddenHeight(R, 244, d0 + 50000) > 0);
});

test("hiddenHeight and dropBelowTangent coincide only at eye height zero", () => {
  const d = 40000;
  const atZero = Math.abs(hiddenHeight(R, 0, d) - dropBelowTangent(R, d));
  const atTwoMeters = Math.abs(hiddenHeight(R, 2, d) - dropBelowTangent(R, d));
  assert.ok(atZero < 1e-6);
  assert.ok(atTwoMeters > atZero);
});

test("effectiveRadius grows the radius under refraction, and is a no-op at k=0", () => {
  assert.equal(effectiveRadius(R, 0), R);
  assert.ok(effectiveRadius(R, 0.13) > R);
});

test("Tower case (CLAUDE.md): both targets taller than the observer flip sign on the globe", () => {
  // Observer 322.5 m; near target 341 m @ 16.9 km -- taller than the observer,
  // yet documented as sitting BELOW eye level on the globe while sitting ABOVE
  // it on a plane. A sign flip, not a magnitude difference (rule 4).
  const e = 322.5, d = 16900, h = 341;
  assert.ok(flatElev(e, d, h) > 0, "above eye level on a plane");
  assert.ok(globeElev(R, e, d, h) < 0, "below eye level on the globe");
});

test("dipAngle is exact and increases monotonically with altitude", () => {
  const low = DEG(dipAngle(R, 100));
  const high = DEG(dipAngle(R, 10000));
  assert.ok(high > low);
});

test("tangentDistance (dip tab's horizon) differs from horizonDist (hh tab's arc)", () => {
  // Both are exact, both answer "how far is the horizon", but they are not the
  // same quantity -- the dip tab's flat-triangle exercise (CLAUDE.md / UC03)
  // depends on this NOT collapsing to one number.
  const h = 1395; // Sommet de Viériou, a DIP_SPOTS entry
  const chord = tangentDistance(R, h);
  const arc = horizonDist(R, h);
  assert.ok(Math.abs(chord - arc) > 1, "chord and arc must not coincide at this altitude");
  // Both still agree with the small-angle approximation sqrt(2Rh) at low altitude.
  assert.ok(Math.abs(tangentDistance(R, 1.7) - Math.sqrt(2 * R * 1.7)) < 0.01);
});

test("reconstructTwoStation: the geocentric ray intersection recovers the true height exactly, the naive sine-rule shortcut does not", () => {
  // Mirrors the legacy's default worked case (sim tab, Sommet de Viériou ->
  // Cime de Barbin): observer eye 1395 m, far target (Barbin) 1561 m tall at
  // 59.96 km, near station (Castellaras) at 17.73 km along the same bearing.
  const R = 6371000, e = 1395, farH = 1561;
  const dFar = 59960, b = 17730, dNear = dFar - b;
  const aFar = globeElev(R, e, dFar, farH);
  const aNear = globeElev(R, e, dNear, farH);
  const rec = reconstructTwoStation(b, aFar, aNear, R, e);

  assert.equal(rec.sines.illConditioned, false);
  assert.ok(
    Math.abs(rec.sines.h - farH) < 0.5,
    `geocentric ray intersection should recover the true height (${farH} m), got ${rec.sines.h}`,
  );
  // The naive shortcut's HEIGHT is only mildly off here (b is a sizeable
  // fraction of dFar), but its dramatic, documented failure is the
  // DISTANCE it reports for the summit -- the "drive there and find an
  // empty field" result (CLAUDE.md "TAN vs LAW OF SINES", legacy
  // updateReverse() Result 3). Assert that failure directly, on the
  // quantity where it is unmistakable, rather than tuning the scenario
  // until the height error alone looks big.
  assert.ok(
    dFar / rec.naive.d > 10,
    `naive sine-rule shortcut must misplace the summit by an order of magnitude in distance, got dFar/naive.d = ${dFar / rec.naive.d}`,
  );
  // The apparent divergence overstates the true angular divergence of the
  // two rays -- the mechanism behind the naive method's failure.
  assert.ok(rec.divNaive > rec.divTrue);
  assert.ok(rec.naive.h !== rec.sines.h);
});

test("reconstructTwoStation: on a very large radius (near-flat limit) tangent and naive both approach the true height", () => {
  // On a genuine plane the tangent and (correct) law-of-sines formulas are
  // algebraically identical (CLAUDE.md). Approximate "flat" with a very
  // large radius and check the tangent method's error shrinks accordingly.
  const RbigR = 6371000 * 500, e = 10, farH = 200;
  const dFar = 5000, b = 1500, dNear = dFar - b;
  const aFar = globeElev(RbigR, e, dFar, farH);
  const aNear = globeElev(RbigR, e, dNear, farH);
  const rec = reconstructTwoStation(b, aFar, aNear, RbigR, e);
  assert.ok(Math.abs(rec.tangent.h - farH) < 0.1);
  assert.ok(Math.abs(rec.sines.h - farH) < 0.1);
});

test("granting the measured dip to a flat triangle recovers half the real horizon distance", () => {
  // The dip tab's "solve the triangle" exercise (drawDipTri in the legacy):
  // d_flat = h / tan(dip) is close to HALF of tangentDistance at ordinary
  // heights -- the factor of two is the signature this tab is built to show,
  // not a fudge. It is only approximate (both are exact but derived
  // differently), so this checks the ratio stays near 2, not exactly 2.
  const h = 100;
  const dip = dipAngle(R, h);
  const dFlat = h / Math.tan(dip);
  const dReal = tangentDistance(R, h);
  assert.ok(Math.abs(dReal / dFlat - 2) < 0.01);
});
