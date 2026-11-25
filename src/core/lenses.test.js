// Lois d'objectif partagées (star, curv) -- epic13.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LENSES, lens, invLens, maxFov } from "./lenses.js";

const D2R = Math.PI / 180;

test("the eight laws, unchanged from the legacy star list (values at 30°)", () => {
  const t = Math.tan(30 * D2R);
  const want = { r35: t, r20: t * (1 - 0.03 * t * t), r14: t * (1 - 0.09 * t * t), tel: t * (1 - 0.055 * t * t + 0.012 * t ** 4),
    eqs: 2 * Math.sin(15 * D2R), eqd: 30 * D2R, ster: 2 * Math.tan(15 * D2R), ort: 0.5 };
  assert.deepEqual(LENSES.map((L) => L.k), Object.keys(want));
  for (const L of LENSES) assert.ok(Math.abs(L.r(30 * D2R) - want[L.k]) < 1e-15, L.k);
});

test("every law increases up to thetaMax and invLens inverts it", () => {
  for (const L of LENSES) {
    let prev = -1;
    for (let th = 0; th < L.thetaMax * 0.999; th += 0.005) {
      const r = L.r(th); assert.ok(r > prev, `${L.k} ${th}`); prev = r;
      assert.ok(Math.abs(invLens(L, r) - th) < 1e-7, `${L.k} inv ${th}`);
    }
  }
});

test("aliases and field limits", () => {
  assert.equal(lens("rect").k, "r35"); assert.equal(lens("fish").k, "eqd");
  assert.ok(maxFov(lens("r14")) >= 100 && maxFov(lens("r14")) < 110);
  assert.equal(maxFov(lens("eqd")), 180);
});
