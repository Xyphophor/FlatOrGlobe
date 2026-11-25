import { test } from "node:test";
import assert from "node:assert/strict";
import { refineProfile } from "./horizon.js";

const HP = { az0: 10, step: 0.1, flat: [0, 10, 20, 30], globeK: [1, 1, 1, 1], dist: [5, 5, 5, 5],
  detail: { az0: 10.1, step: 0.01, n: 3, flat: [11, 12, 13], globeK: [2, 2, 2] } };

test("détail dans la bande, profil interpolé ailleurs, même forme", () => {
  const P = refineProfile(HP);
  assert.equal(P.step, 0.01); assert.equal(P.az0, 10); assert.equal(P.flat.length, 31);
  assert.equal(P.flat[10], 11); assert.equal(P.flat[12], 13);          // 10.10 et 10.12 : lectures du détail
  assert.ok(Math.abs(P.flat[5] - 5) < 1e-9);                           // 10.05 : interpolé entre 0 et 10
  assert.ok(Math.abs(P.flat[20] - 20) < 1e-9);                         // 10.20 : hors bande
  assert.equal(P.dist.length, 31);                                     // tout tableau aligné suit
  assert.equal(refineProfile({ az0: 0, step: 1, flat: [1, 2] }).step, 1); // sans détail : inchangé
});
