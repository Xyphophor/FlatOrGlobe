import { test } from "node:test";
import assert from "node:assert/strict";
import { rApp, predicted, budget, triangulate } from "./theo.js";

test("Grand Mourre : plan 13,2′, globe 0,52′ avec k = 0,13, −1,38′ sans réfraction", () => {
  const p = predicted();
  assert.ok(Math.abs(p.plane - 13.22) < 0.01 && Math.abs(p.globeK - 0.52) < 0.01 && Math.abs(p.globe + 1.38) < 0.01);
});

test("le globe's α redonne R/(1 − k) = 6 371/0,87 ≈ 7 323 km ; α = Δh/s donne l'infini", () => {
  assert.ok(Math.abs(rApp(predicted().globeK, 54.1, 208) - 6371 / 0.87) < 1);
  assert.equal(rApp(predicted().plane + 0.01, 54.1, 208), Infinity);
});

test("budget : α ±10″, s ±0,4 %, Δh ±5 m -> environ 2,9 % sur le rayon apparent", () => {
  assert.ok(Math.abs(budget().total - 2.9) < 0.05);
});

test("triangulation : base 1 km, angles 89,5° et 89,44° -> 54 km", () => {
  assert.ok(Math.abs(triangulate(1000, 89.5, 89.44) - 54.05) < 0.01);
});
