import test from "node:test";
import assert from "node:assert/strict";
import { bestRing, globeShare, scoreMap, SHADOW_QUAKES, SHADOW_GLOBE, SHADOW_MAPS, SHADOW_BEST } from "./shadow.js";

test("bestRing : le seuil qui sépare P directe / pas de P", () => {
  const r = bestRing([[10, true], [50, true], [99, true], [105, false], [120, false]]);
  assert.equal(r.n, 5); assert.equal(r.rho, 102);
  assert.equal(bestRing([[10, false], [20, true]]).n, 1);
});

test("le globe sans paramètre redonne le pré-calcul (Go)", () => {
  SHADOW_QUAKES.forEach((q, i) => assert.ok(Math.abs(globeShare(q) - SHADOW_GLOBE.fixed[i]) < 1e-3, q.key));
});

test("la carte du pôle Nord et la meilleure carte redonnent le pré-calcul, à l'arrondi des coordonnées près", () => {
  const pole = scoreMap([90, 0]), P = SHADOW_MAPS.at(-1);
  assert.ok(Math.abs(pole.common.share - P.common) < 2e-3);
  const best = scoreMap(SHADOW_BEST.common.c);
  assert.ok(Math.abs(best.common.share - SHADOW_BEST.common.common) < 2e-3);
});

test("une carte plate ne fait jamais mieux, pour les neuf, que l'anneau unique du globe", () => {
  for (const M of [...SHADOW_MAPS, SHADOW_BEST.common, SHADOW_BEST.own]) assert.ok(M.common < SHADOW_GLOBE.fittedAll);
});
