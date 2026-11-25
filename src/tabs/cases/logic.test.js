import { test } from "node:test";
import assert from "node:assert/strict";
import { CASE_P2P } from "../../data/presets/cases-pier2pier.js";
import { trialRows, overall, eveningAt, i360Gap, apparentEl, p2pValues } from "./logic.js";

test("les sites : 15,2 km (eux : 15,3) ; cinq essais, le premier non vu", () => {
  assert.ok(Math.abs(CASE_P2P.dist.wb - 15300) < 150);
  assert.equal(CASE_P2P.trials.length, 5);
  assert.deepEqual(CASE_P2P.trials.map((t) => t.seen), [false, true, true, true, true]);
});

test("ce qu'il faut au globe : k 0,78 (1 m → 1 m), 0,92 (0,15 m → 0,7 m)", () => {
  const r = trialRows();
  assert.ok(Math.abs(r[1].kNeed - 0.78) < 0.01 && Math.abs(r[4].kNeed - 0.918) < 0.01);
  assert.ok(Math.abs(2 * r[1].gNeed - 0.17) < 0.01);
});

test("l'air de Worthing montre le laser EN DIRECT sur le globe (1 m → 1 m) ; l'air plat de Brighton le cache", () => {
  const r = trialRows()[2];
  assert.equal(r.traced.worthingA.globe, "direct"); assert.equal(r.traced.worthingB.globe, "direct");
  assert.equal(r.traced.brighton.globe, "hidden"); assert.equal(r.traced.brighton.plane, "direct");
});

test("leurs thermomètres : Worthing +1,5 °C sur 2 m ; Brighton, ±0,28 °C/m", () => {
  const w = overall(CASE_P2P.therm.worthing, 1), b = overall(CASE_P2P.therm.brighton, 1);
  assert.ok(Math.abs(w.dT - 1.5) < 1e-9);
  assert.ok(b.lo < 0.085 && b.hi > 0.085);
});

test("les deux soirs : air froid sur mer chaude le 2, presque égal le 23", () => {
  assert.ok(eveningAt("2019-02-02").airSea < -5 && eveningAt("2019-02-02").wind > 25);
  assert.ok(Math.abs(eveningAt("2019-02-23").airSea) < 1);
});

test("l'i360 ne départage pas (même distance) ; l'angle apparent, si : signe opposé", () => {
  assert.ok(Math.abs(i360Gap(0) - i360Gap(0.78)) < 0.05);
  const e = apparentEl(CASE_P2P.trials[1], 0.78);
  assert.ok(e.globe < 0 && e.plane > 0);
});

test("valeurs du texte, en et fr", () => {
  const v = p2pValues("en"), f = p2pValues("fr");
  assert.equal(v.pD, "15.2"); assert.equal(f.pD, "15,2"); assert.equal(v.pK, "0.78");
});
