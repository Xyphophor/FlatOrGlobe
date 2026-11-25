import { test } from "node:test";
import assert from "node:assert/strict";
import { CONSTANTS, centripetal, OMEGA_EARTH, R_EQ, gravityAt, R_MEAN, gSphereRot, coriolis, keplerPeriod, siderealDay,
  moonTest, stats, lineFit, gFromPendulum, PENDULUM_T, PENDULUM_FIT, smallAngleError, physValues, MOON_A, GM_EARTH, MOON_MASS_RATIO, MOON_T } from "./logic.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("les constantes du SI sont celles de 2019, classées", () => {
  const c = Object.fromEntries(CONSTANTS.map((k) => [k.id, k]));
  assert.equal(c.c.value.replace(/\s/g, ""), "299792458");
  assert.equal(CONSTANTS.filter((k) => k.cls === "defined").length, 7);
  assert.equal(c.G.cls, "measured");
  for (const k of CONSTANTS) assert.ok(["defined", "measured", "earth", "convention"].includes(k.cls), k.id);
});

test("ordres de grandeur terrestres", () => {
  near(centripetal(OMEGA_EARTH, R_EQ), 0.03392, 1e-4, "ω²R");
  near(gravityAt(R_MEAN), 9.820, 1e-3, "GM/R²");
  near(gSphereRot(0), 9.786, 1e-3); near(gSphereRot(90), gravityAt(R_MEAN), 1e-12);
  near(coriolis(250, 45), 0.02578, 1e-4);
  near(siderealDay(), 86164.09, 0.05, "jour sidéral");
  near(2 * Math.PI / OMEGA_EARTH, 86164.1, 0.1);
  near(keplerPeriod(26560e3) / 3600, 11.97, 0.01, "GPS : un demi-jour sidéral");
});

test("la Lune tombe comme une pomme affaiblie en 1/r² (Newton, Principia III, prop. IV)", () => {
  const m = moonTest();
  near(m.ratio, 1.0096, 1e-3);
  near(m.fromGpair / m.orbit, 1, 0.005, "avec G(M+m)");
  near(keplerPeriod(MOON_A, GM_EARTH * (1 + MOON_MASS_RATIO)) / MOON_T, 1, 0.002);
});

test("petits angles", () => {
  near(smallAngleError(1), 1.0e-4, 2e-6);
});

test("statistiques et moindres carrés de l'exemple du pendule", () => {
  const s = stats(PENDULUM_T);
  near(s.mean, 2.00583, 1e-4); near(s.sd, 0.01443, 1e-4); near(s.sem, s.sd / Math.sqrt(12), 1e-12);
  const f = lineFit([[0, 1], [1, 3], [2, 5]]);
  near(f.a, 1, 1e-12); near(f.b, 2, 1e-12); near(f.sb, 0, 1e-12);
  const p = lineFit(PENDULUM_FIT);
  near(4 * Math.PI ** 2 / p.b, 9.81, 0.01);
  near(gFromPendulum(1, 2 * Math.PI / Math.sqrt(9.81)), 9.81, 1e-9);
  const v = physValues("en");
  assert.equal(v.tGps, "11.97"); assert.equal(v.gSt, "9.81");
});
