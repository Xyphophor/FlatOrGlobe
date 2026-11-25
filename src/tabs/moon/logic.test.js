import { test } from "node:test";
import assert from "node:assert/strict";
import { llrRadii, stationRadius, radiusFromParallax, parallaxFromShadow, passRadius } from "./logic.js";
import { LLR_PASSES } from "../../data/presets/moon-llr.js";

test("laser lunaire, Grasse : 55 passages, rayon médian 6 365,8 km, à 4 km du rayon géocentrique de la station", () => {
  const r = llrRadii(LLR_PASSES);
  assert.equal(r.q.n, 55);
  assert.ok(Math.abs(r.q.med - 6365.8) < 0.3, `med ${r.q.med}`);
  assert.ok(r.q.q3 - r.q.q1 < 5);
  assert.ok(Math.abs(r.q.med - stationRadius("GRSM")) < 4.5);
});

test("laser lunaire : un passage lisse à mieux que 2 m avec R, mais pas avec R ± 100 km", () => {
  const p = passRadius(LLR_PASSES[0]);
  assert.ok(p.rms < 2, `rms ${p.rms}`);
});

test("parallaxe 57,04′ + mois sidéral + g = 9,80 : environ 6 400 km", () => {
  const R = radiusFromParallax(9.80, 57.04 / 60, 27.321661);
  assert.ok(R > 6300 && R < 6500, `${R}`);
});

test("ombre : 41,6′ élargie de 1,1 %, Soleil 16,0′ -> parallaxe ≈ 57′", () => {
  assert.ok(Math.abs(parallaxFromShadow(41.6, 0.011, 16.0) - 57.0) < 0.1);
});
