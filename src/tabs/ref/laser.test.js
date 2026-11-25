import { test } from "node:test";
import assert from "node:assert/strict";
import { LAS_AIRS, lasBeam, lasK, lasEdgeDist, lasValues, lasKNeed, lasHidden, WORTHING_B } from "./laser.js";
import { REF_R } from "./logic.js";

const air = (k) => LAS_AIRS.find((a) => a.key === k);

test("le test du 23 février 2019 : 15,3 km, 1 m / 1 m ; bord bas sur l'eau à 2h/θ = 2 km", () => assert.equal(lasEdgeDist(), 2000));

test("géométrie : caché de 10,8 m sans air, 9,0 m à k = 0,13 ; il faut k = 0,78", () => {
  assert.ok(Math.abs(lasHidden() - 10.8) < 0.05);
  assert.ok(Math.abs(lasHidden(REF_R / 0.87) - 8.99) < 0.05);
  assert.ok(Math.abs(lasKNeed() - 0.782) < 0.002);
});

test("l'air standard donne k = 0,13 ; Worthing : k ≈ 7,5 dans le premier demi-mètre, ≈ 13 entre 1,5 et 2 m", () => {
  for (const h of [0.5, 3]) assert.ok(Math.abs(lasK(air("std"), h) - 0.13) < 1e-9);
  assert.ok(Math.abs(lasK(air("worthing"), 0.3) - 7.53) < 0.02);
  assert.ok(Math.abs(lasK(air("worthing"), 1.75) - 13.38) < 0.02);
});

test("lumière droite, air standard, air de Brighton : le globe cache, le plan montre en direct", () => {
  for (const k of ["vac", "std", "brighton"]) {
    const g = lasBeam(air(k), true), p = lasBeam(air(k), false);
    assert.equal(g.seen, false, k); assert.equal(p.seen, true, k); assert.equal(p.direct, true, k);
  }
});

test("air de Worthing (thermomètre A ou B) : le globe montre le faisceau EN DIRECT, le plan seulement par reflet", () => {
  for (const a of [air("worthing"), { key: "wB", prof: WORTHING_B, top: air("worthing").top }]) {
    const g = lasBeam(a, true), p = lasBeam(a, false);
    assert.ok(g.seen && g.direct, a.key);
    assert.ok(p.seen && !p.direct && p.bounced === p.rays.length, a.key);
  }
});

test("valeurs du texte", () => {
  const v = lasValues("en");
  assert.deepEqual([v.lasD, v.lasW, v.lasEdge, v.lasHid, v.lasHidK, v.lasKNeed, v.lasGNeed, v.lasG2], ["15.3", "15.3", "2", "10.8", "9.0", "0.78", "0.085", "0.17"]);
  assert.equal(lasValues("fr").lasBulge, "4,6");
});
