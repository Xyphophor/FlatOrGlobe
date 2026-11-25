// Caméras du calculateur (epic13) : caractéristiques publiées et contrôles croisés.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CAMERAS, camera, fitTanK, gopro7Check, diagFor, GOPRO_WIDE, fovFromEq, dfovFromEq, fovFromFocalLaw } from "./cameras.js";
import { GOPRO7 } from "../../data/presets/curv.js";
import { resolveCamera, lensBend } from "./calc.js";
import { heightForSagitta, sagittaAt, K_STD } from "./logic.js";

test("GoPro Wide law: fitted on the 4:3 photo fields, it reproduces them and predicts the 16:9 diagonal to 0.5°", () => {
  const w = GOPRO7.wide43;
  assert.ok(Math.abs(diagFor(GOPRO_WIDE, w.h, w.v) - w.d) < 1e-6);
  const c = gopro7Check();
  assert.ok(c.k > 0.3 && c.k < 0.45, `k ${c.k}`);
  assert.ok(Math.abs(c.d169 - c.d169pub) < 0.5, `${c.d169}`);
});

test("GoPro Linear fields are those of an ordinary lens (tan law), to 0.1°", () => {
  const l = GOPRO7.linear43, D2R = Math.PI / 180;
  const d = 2 * Math.atan(Math.hypot(Math.tan((l.h / 2) * D2R), Math.tan((l.v / 2) * D2R))) / D2R;
  assert.ok(Math.abs(d - l.d) < 0.1, `${d}`);
  assert.ok(fitTanK(l) > 0.95);
});

test("Apple's equivalent focal lengths agree with Apple's published diagonal fields", () => {
  assert.ok(Math.abs(dfovFromEq(13) - 120) < 2.5);     // ultra-wide : 118.0° calculé, 120° publié
  assert.ok(Math.abs(dfovFromEq(120) - 20) < 0.5);     // 5x : 20.4° calculé, 20° publié
  assert.ok(Math.abs(fovFromEq(24, 3 / 4) - 71.6) < 0.05);
});

test("focal length on a sensor: 24 mm on full frame = 73.7°; a circular fish-eye cannot fill the frame", () => {
  assert.ok(Math.abs(fovFromFocalLaw(24, 36, "r35") - 73.74) < 0.01);
  assert.equal(resolveCamera(camera("sen-ff"), { focal: 8, law: "eqd" }), null);
  assert.ok(resolveCamera(camera("sen-ff"), { focal: 16, law: "eqd" }).fov > 120);
});

test("every fixed camera gives a finite height for 2 px, geometric and refracted", () => {
  for (const c of CAMERAS.filter((c) => c.fov)) for (const k of [0, K_STD]) {
    const h = heightForSagitta(2, { fovH: c.fov, W: c.W, aspect: c.aspect, lens: c.lens, k });
    assert.ok(h > 1 && h < 5000, `${c.id} ${k} ${h}`);
  }
});

test("lens check: phones and GoPro Linear keep a flat horizon straight, GoPro Wide bends it by several percent", () => {
  for (const id of ["ip16p-1x", "ip15-2x", "gp7-l43"]) { const c = camera(id); assert.ok(Math.abs(lensBend(c, c.W).px) < 0.01, id); }
  const g = camera("gp7-w43"), b = lensBend(g, g.W);
  const globe30 = sagittaAt(30000, { fovH: g.fov, W: g.W, aspect: g.aspect, lens: g.lens, k: K_STD });
  assert.ok(b.frac > 0.05 && b.px > 2 * globe30.px, `${b.frac} ${globe30.px}`);
});
