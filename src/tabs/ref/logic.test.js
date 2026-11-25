import { test } from "node:test";
import assert from "node:assert/strict";
import { normalAngleArcsec, r206Rows, reciprocalK } from "./logic.js";
import { R206, R206_MARKS } from "../../data/presets/surv-recip.js";

test("angle between normals: one arcminute of latitude is 60″", () => {
  assert.ok(Math.abs(normalAngleArcsec([40, -75], [40 + 1 / 60, -75]) - 60) < 1e-6);
});

test("Route 206 MP 27-28: γ ≈ 49.9″ (Kozlowski: 50″), k from −0.48 to +0.94 on the same line", () => {
  const r = r206Rows(R206, R206_MARKS);
  assert.ok(Math.abs(r[0].gamma - 49.87) < 0.01);
  const ks = r.map((x) => x.k);
  assert.ok(Math.abs(Math.min(...ks) + 0.484) < 0.001 && Math.abs(Math.max(...ks) - 0.940) < 0.001);
  // Bislin (JK2i) : 0,478 et 0,940 pour les deux sessions de novembre 2016
  assert.ok(Math.abs(r[1].k - 0.478) < 0.002 && Math.abs(r[2].k - 0.940) < 0.002);
});

test("reciprocalK still returns k = 0.13 for a 30 km line read with standard refraction", () => {
  const g = 30000 / 6371000 * 180 / Math.PI;
  assert.ok(Math.abs(reciprocalK(90, 90 + g * 0.87, 30).k - 0.13) < 1e-9);
});
