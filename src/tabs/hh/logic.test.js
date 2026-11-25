import { test } from "node:test";
import assert from "node:assert/strict";
import { hhWorld, hiddenCalc, ceilingKm, clearingK } from "./logic.js";

const R = 6371000;

test("hhWorld: Rg honours the refraction checkbox (the legacy bug the ceiling table exposed)", () => {
  assert.equal(hhWorld(6371, 0.13, false).Rg, R);
  assert.ok(hhWorld(6371, 0.13, true).Rg > R);
});

test("Karagöl → Shkhara: refraction off hides ~6,553 m (the flat-earth arithmetic, conceded first)", () => {
  const c = hiddenCalc(R, 0.17, 3275, 493.07, 5203);
  assert.ok(Math.abs(c.H - 6553) < 30, `hidden geometric ${c.H}`);
  assert.equal(c.flatHidden, 0);
});

test("Karagöl → Shkhara clears at k ≈ 0.1234, below the standard 0.17 (CLAUDE.md)", () => {
  const k = clearingK(R, 3275, 493.07, 5203);
  assert.ok(Math.abs(k - 0.1234) < 0.003, `k = ${k}`);
});

test("every certified record sits inside its ceiling with refraction on, and the top one goes over with it off", () => {
  const on = hhWorld(6371, 0.17, true).Rg, off = hhWorld(6371, 0.17, false).Rg;
  assert.ok(493.07 <= ceilingKm(on, 3275, 5203));
  assert.ok(493.07 > ceilingKm(off, 3275, 5203));
});

test("Bedford Level: target at the observer's own height is exactly level on a plane", () => {
  const c = hiddenCalc(R, 0.13, 4, 9.66, 4);
  assert.equal(c.flatEl, 0);
  assert.ok(c.globeEl < 0);
});
