import { test } from "node:test";
import assert from "node:assert/strict";
import { rows, fit, fits, slope, slopeFor, stations, AU_IAU, V2012_OWN_C3 } from "./transit-logic.js";

test("1769 : 278 chronométrages, 228 retenus ; l'unité à 2 % près, dans l'erreur du bootstrap", () => {
  const R = rows("1769"), F = fit("1769"); assert.equal(R.length, 278); assert.equal(R.filter((r) => r.used).length, F.used);
  assert.ok(Math.abs(F.a / AU_IAU - 1) < 0.02, `${F.a}`); assert.ok(Math.abs(F.a - AU_IAU) < 2 * F.sa);
});
test("1761 : dans deux erreurs de la valeur d'aujourd'hui ; les trois passages ensemble à 1,5 % près", () => {
  const F = fits(); assert.ok(Math.abs(F["1761"].a - AU_IAU) < 2 * F["1761"].sa); assert.ok(Math.abs(F.all.a / AU_IAU - 1) < 0.015);
  assert.equal(rows().length, F.all.n);
});
test("2012 : le contact III des amateurs donne la même valeur que le projet lui-même (158,5 millions de km), à 1 % près", () => {
  assert.ok(Math.abs(fit("2012").a / V2012_OWN_C3 - 1) < 0.01, `${fit("2012").a}`);
});
test("l'effet de la taille de la Terre va jusqu'à plusieurs minutes, et les observations le suivent (pente 1)", () => {
  for (const y of ["1761", "1769"]) {
    const R = rows(y).filter((r) => r.used), Ps = R.map((r) => Math.abs(r.P));
    assert.ok(Math.max(...Ps) > 300);
    const k = R.reduce((a, r) => a + r.P * r.D, 0) / R.reduce((a, r) => a + r.P * r.P, 0);
    assert.ok(Math.abs(k - slope(y)) < 0.03, `${y} ${k} ${slope(y)}`);
  }
  assert.ok(slopeFor(5000) > 20000);
});
test("des stations des deux hémisphères", () => {
  const S = stations("1769"); assert.ok(S.length > 50);
  assert.ok(S.some((s) => s.lat < -15) && S.some((s) => s.lat > 70));
});
