import { test } from "node:test";
import assert from "node:assert/strict";
import { dipFrame, clampHeight, bandRow, expDb, solveRadius, dipR, DIP_R0 } from "./logic.js";
import { dipAngle } from "../../core/math.js";
import { DIP_HEIGHT_MAX } from "../../data/presets/dip.js";

test("sticky frame: moving the observer inside the current band does not re-scale (CLAUDE.md trap)", () => {
  const f = dipFrame(100, 220);
  assert.equal(f, 220);
  assert.equal(dipFrame(150, 220), 220);
  assert.notEqual(dipFrame(300, 220), 220, "leaving the band re-frames");
});
test("heights are clamped to the 20,000 m ceiling at the entry point", () => {
  assert.equal(clampHeight(50000), DIP_HEIGHT_MAX);
  assert.equal(clampHeight(NaN), 0.5);
});
test("refraction honours the toggle", () => { assert.equal(dipR(false), DIP_R0); assert.ok(dipR(true) > DIP_R0); });
test("the band the Sun has to cross: from an airliner it is several Sun-widths and takes minutes", () => {
  const b = bandRow(11000, DIP_R0 / (1 - 0.13));
  assert.ok(b.w > 100 && b.secs > 600);
});
test("doubled sunset (Rawlins): the predicted delay inverts back to the input radius", () => {
  const r = expDb(1.2, 6, 52, 0);
  const back = expDb(1.2, 6, 52, r.pred);
  assert.ok(Math.abs(back.R - DIP_R0) / DIP_R0 < 0.02, `R back = ${back.R}`);
});
test("one dip angle returns R (al-Biruni): exact round trip", () => {
  const h = 1395, d = dipAngle(DIP_R0, h);
  assert.ok(Math.abs(solveRadius(h, d) - DIP_R0) < 1);
});
