import { test } from "node:test";
import assert from "node:assert/strict";
import { distGC, distCart, distAE, exp3, DSEGS, fmtLL } from "./logic.js";

test("globe distance is symmetric across the equator for a mirror pair (rule: sign flip, not magnitude)", () => {
  const pairA = DSEGS.find((s) => s.key === "A·N");
  const pairAS = DSEGS.find((s) => s.key === "A·S");
  const gN = distGC(pairA.p[0], pairA.p[1]);
  const gS = distGC(pairAS.p[0], pairAS.p[1]);
  assert.ok(Math.abs(gN - gS) < 1e-6, "globe great-circle distance must be exactly equal for mirror segments");
});

test("the cartesian map keeps mirror pairs equal to each other, but inflates both relative to the globe", () => {
  const pairA = DSEGS.find((s) => s.key === "A·N");
  const pairAS = DSEGS.find((s) => s.key === "A·S");
  const cN = distCart(pairA.p[0], pairA.p[1]);
  const cS = distCart(pairAS.p[0], pairAS.p[1]);
  assert.ok(Math.abs(cN - cS) < 1e-6, "plate carree is symmetric across the equator");
  assert.ok(cN >= distGC(pairA.p[0], pairA.p[1]), "cartesian ruler never reads shorter than the globe");
});

test("the polar disk breaks the mirror symmetry the cartesian map preserves", () => {
  const pairA = DSEGS.find((s) => s.key === "A·N");
  const pairAS = DSEGS.find((s) => s.key === "A·S");
  const aN = distAE(pairA.p[0], pairA.p[1]);
  const aS = distAE(pairAS.p[0], pairAS.p[1]);
  assert.notEqual(Math.round(aN), Math.round(aS), "AE disk must disagree between mirror twins");
});

test("two 60-degree legs (polar over the pole, along the equator) are equal on the globe, ~6672 km", () => {
  const polar = distGC([60, 0], [60, 180]);
  const equator = distGC([0, -30], [0, 30]);
  assert.ok(Math.abs(polar - equator) < 1, "same central angle => same globe distance");
  assert.ok(Math.abs(polar - 6672) < 5);
});

test("exp3: mirror legs are equal on the globe and unequal on the disk, ratio matches the documented ×3 at 45°", () => {
  const r = exp3(45, 60);
  assert.ok(Math.abs(r.globe - r.mirror) < 1e-9, "globe mirror legs are exactly equal");
  assert.ok(Math.abs(r.ratio - 3) < 0.05, "documented ~3x stretch between hemispheres at 45 degrees");
});

test("fmtLL renders hemisphere letters the way the legacy table does", () => {
  assert.equal(fmtLL([60, -180]), "60°N 180°W");
  assert.equal(fmtLL([-33, 151]), "33°S 151°E");
});
