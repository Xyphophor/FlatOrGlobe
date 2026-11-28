// Tests du maillage de l'animation « Terrain models » (demmesh-logic.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { demModel, sampleGrid, bilinear, meshAt, inHole, ground, STEPS, SPAN, TIMELINE } from "./demmesh-logic.js";

const M = demModel();

test("bilinéaire : exacte aux nœuds, entre le plus bas et le plus haut des quatre ailleurs", () => {
  const g = sampleGrid(20);
  assert.ok(Math.abs(bilinear(g, 0, 20) - ground(0, 20)) < 1e-9);
  const v = bilinear(g, 7, -13), c = [g.z[6][5], g.z[7][5], g.z[6][6], g.z[7][6]];
  assert.ok(v >= Math.min(...c) - 1e-9 && v <= Math.max(...c) + 1e-9);
});

test("chaque grille contient les nœuds de la suivante, et son sommet ne monte jamais", () => {
  for (let k = 1; k < STEPS.length; k++) assert.equal(STEPS[k] % STEPS[k - 1], 0);
  for (let k = 1; k < M.maxes.length; k++) assert.ok(M.maxes[k] <= M.maxes[k - 1] + 1e-9);
  assert.ok(M.maxes.every((m) => m < M.top));
  assert.ok(M.top - M.maxes[0] < 3 && M.top - M.maxes[3] > 10);   // 5 m perd peu, 40 m beaucoup
});

test("fin d'un morph = la surface de la grille grossière ; le trou abaisse le sommet, l'autre modèle en donne un autre", () => {
  const p = TIMELINE.find((q) => q.kind === "morph" && q.a === 0 && q.b === 1);
  const m = meshAt(M, p.t1 - 1e-6);
  assert.ok(Math.abs(m.top - M.maxes[1]) < 0.01);
  const h = TIMELINE.find((q) => q.kind === "hole"), f = TIMELINE.find((q) => q.kind === "filled");
  assert.ok(Math.abs(meshAt(M, h.t1 - 1e-6).top - M.holeMax) < 1e-9);
  assert.ok(Math.abs(meshAt(M, f.t0 + 0.1).top - M.fillMax) < 1e-9 && M.fillMax !== M.maxes[0]);
  assert.ok(inHole(...[6.3, -3.7]));
  assert.equal(TIMELINE[TIMELINE.length - 1].t1, SPAN);
});
