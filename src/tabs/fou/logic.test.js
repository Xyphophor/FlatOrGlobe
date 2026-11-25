import { test } from "node:test";
import assert from "node:assert/strict";
import { fouRate, fouPeriod, fouAiry, fouExp, FOU_OMEGA } from "./logic.js";

test("Paris (Panthéon, 48.8462°) precesses at ≈ 11.3 °/h clockwise, a full turn in ≈ 31.8 h", () => {
  assert.ok(Math.abs(fouRate(48.8462) - 11.33) < 0.02);
  assert.ok(Math.abs(fouPeriod(48.8462) - 31.8) < 0.1);
});
test("the sense reverses across the equator and vanishes on it", () => {
  assert.ok(fouRate(-37.81) < 0 && fouRate(37.81) > 0);
  assert.equal(fouPeriod(0), Infinity);
});
test("at the poles the rate is the full sidereal rate", () => {
  assert.ok(Math.abs(Math.abs(fouRate(90)) - FOU_OMEGA) < 1e-9);
});
test("Airy's ellipse precession falls as L^-5/2: doubling the wire divides it by 2^2.5", () => {
  assert.ok(Math.abs(fouAiry(0.5, 0.01, 24) / fouAiry(0.5, 0.01, 12) - Math.pow(2, -2.5)) < 1e-9);
});
test("experiment 1d: a 12 m wire in Paris with a 1 cm ellipse is a viable site (Airy < 50 % of signal)", () => {
  const r = fouExp(48.8462, 12, 0.5, 1, 3);
  assert.ok(r.ratio < 0.5, `ratio ${r.ratio}`);
});
