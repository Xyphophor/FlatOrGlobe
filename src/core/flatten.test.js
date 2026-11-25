import { test } from "node:test";
import assert from "node:assert/strict";
import { dipC, elevC, hiddenC, curvAt, CYCLE } from "./flatten.js";
import { dipAngle, globeElev, flatElev, hiddenHeight } from "./math.js";

const R = 6371e3;

test("courbure 1 = les formules du globe de math.js", () => {
  assert.ok(Math.abs(dipC(R, 1, 1395) - dipAngle(R, 1395)) < 1e-12);
  assert.ok(Math.abs(elevC(R, 1, 1395, 59960, 1561) - globeElev(R, 1395, 59960, 1561)) < 1e-12);
  assert.ok(Math.abs(hiddenC(R, 1, 2, 53000) - hiddenHeight(R, 2, 53000)) < 1e-6);
});

test("courbure c = globe de rayon R/c ; courbure 0 = plan", () => {
  assert.ok(Math.abs(dipC(R, 0.25, 1395) - dipAngle(4 * R, 1395)) < 1e-12);
  assert.ok(Math.abs(hiddenC(R, 0.5, 2, 53000) - hiddenHeight(2 * R, 2, 53000)) < 1e-6);
  assert.equal(dipC(R, 0, 1395), 0);
  assert.equal(hiddenC(R, 0, 2, 53000), 0);
  assert.equal(elevC(R, 0, 1395, 59960, 1561), flatElev(1395, 59960, 1561));
  // continuité vers le plan (formes stables pour R/c immense)
  assert.ok(Math.abs(elevC(R, 1e-9, 1395, 59960, 1561) - flatElev(1395, 59960, 1561)) < 1e-9);
  assert.ok(hiddenC(R, 1e-9, 2, 53000) < 1e-3);
});

test("les chiffres des cas choisis (Viériou, Willis Tower)", () => {
  const am = (r) => r * 180 / Math.PI * 60;
  const diff = (RR, c) => am(elevC(RR, c, 1395, 59960, 1561) - elevC(RR, c, 1395, 17730, 1400));
  assert.ok(Math.abs(diff(R, 0) - 8.5) < 0.1);                 // plan : Barbin 8,5′ AU-DESSUS
  assert.ok(Math.abs(diff(R, 1) + 2.85) < 0.05);               // globe sans réfraction : 2,85′ au-dessous (le legacy arrondit à 2,9′)
  assert.ok(Math.abs(diff(R / 0.87, 1) + 1.4) < 0.15);         // k = 0,13 : 1,4′ au-dessous
  assert.ok(Math.abs(hiddenC(R, 1, 2, 53000) - 180.5) < 0.5);
});

test("cycle : globe, aplatissement, plan, retour", () => {
  assert.equal(curvAt(0), 1); assert.equal(curvAt(6), 0); assert.equal(curvAt(CYCLE), 1);
  assert.ok(curvAt(3.75) > 0.4 && curvAt(3.75) < 0.6);
});
