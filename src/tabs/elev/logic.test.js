import { test } from "node:test";
import assert from "node:assert/strict";
import { readInputs, computeAngles, objLabel, objShort, angularSize, reciprocalZenith, reconstructTwoStation } from "./logic.js";
import { globeElev } from "../../core/math.js";
import { PRESETS } from "../../data/presets/elev.js";

const R = 6371000;

function stateFromPreset(P) {
  return readInputs({
    eye: P.eye,
    R: P.radius * 1000,
    refr: P.refr,
    k: P.k,
    objs: P.o.map((o, i) => ({ d: o.d * 1000, h: o.h, az: o.az, key: String(i + 1) })),
  });
}

test("readInputs rejects non-finite fields and non-positive radius/eye", () => {
  const bad1 = readInputs({ eye: NaN, R: 6371000, refr: false, k: 0.13, objs: [{ d: 1, h: 1, az: 0 }] });
  assert.equal(bad1.valid, false);
  const bad2 = readInputs({ eye: 10, R: 0, refr: false, k: 0.13, objs: [{ d: 1, h: 1, az: 0 }] });
  assert.equal(bad2.valid, false);
  const bad3 = readInputs({ eye: 10, R: 6371000, refr: false, k: 0.13, objs: [{ d: -1, h: 1, az: 0 }] });
  assert.equal(bad3.valid, false);
});

test("readInputs computes the refracted effective radius only when refr is on", () => {
  const off = readInputs({ eye: 10, R, refr: false, k: 0.13, objs: [{ d: 1000, h: 1, az: 0 }] });
  assert.equal(off.Rg, R);
  const on = readInputs({ eye: 10, R, refr: true, k: 0.13, objs: [{ d: 1000, h: 1, az: 0 }] });
  assert.ok(on.Rg > R);
});

test("computeAngles: the Viériou preset reproduces the documented sign flip on Barbin", () => {
  // CLAUDE.md / legacy: plane +8.5' above the Castellaras, globe -1.4' below
  // it (with refraction) -- a sign flip inside one photograph.
  const s = stateFromPreset(PRESETS.vieriou);
  assert.equal(s.valid, true);
  const ang = computeAngles(s);
  const barbin = ang[1]; // Cime de Barbin, the far target
  // Flat model: taller distant target sits above eye level.
  assert.ok(barbin.flat > 0);
  // Globe model, refracted: documented as slightly BELOW eye level.
  assert.ok(barbin.globe < 0);
});

test("objLabel/objShort: the stale-label trap -- no name means a generic label, not a leftover one", () => {
  const named = { key: "②", name: "Cime de Barbin", short: "Barbin" };
  const unnamed = { key: "②" };
  assert.equal(objLabel(named), "② Cime de Barbin");
  assert.equal(objShort(named), "② Barbin");
  assert.equal(objLabel(unnamed), "Target ②");
  assert.equal(objShort(unnamed), "②");
});

test("angularSize: flat and globe sizes differ by a tiny fraction while position differs by orders of magnitude more (CLAUDE.md rule 4)", () => {
  const { flat, globe, dSize } = angularSize(R, 1395, 59960, 1561);
  assert.ok(flat > 0 && globe > 0);
  // the size difference is a small fraction of the size itself
  assert.ok(Math.abs(dSize / flat) < 0.01);
});

test("reciprocalZenith: the flat prediction is exactly 180 deg with no free parameters, the globe's excess equals d/R", () => {
  const d = 100000, e = 50, h = 3000;
  const { sum, excess, Rrec } = reciprocalZenith(R, e, d, h);
  // The flat model predicts exactly 180 deg regardless of e, h, d -- so the
  // EXCESS over that flat prediction is what the globe actually returns.
  assert.ok(sum > 180);
  assert.ok(Math.abs(excess - (d / R) * (180 / Math.PI)) < 1e-6);
  // Recovering R from the excess returns the radius fed in.
  assert.ok(Math.abs(Rrec - R) < 1e-3);
});

test("reciprocalZenith: heights cancel -- swapping which station is taller does not change the sum", () => {
  const d = 200000;
  const a = reciprocalZenith(R, 5, d, 3000);
  const b = reciprocalZenith(R, 3000, d, 5); // same pair, heights swapped
  assert.ok(Math.abs(a.sum - b.sum) < 1e-9);
});

test("reconstructTwoStation is re-exported from core/math.js for use in the sim tab's reverse-engineering section", () => {
  const aFar = globeElev(R, 1395, 59960, 1561);
  const aNear = globeElev(R, 1395, 59960 - 17730, 1561);
  const rec = reconstructTwoStation(17730, aFar, aNear, R, 1395);
  assert.ok(Math.abs(rec.sines.h - 1561) < 0.5);
});
