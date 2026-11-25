// Toutes les ondes de Lamb ensemble (lambpool.js) : les nombres de la section, figés.
import test from "node:test";
import assert from "node:assert/strict";
import { lambPool, tongaLaps, tsarLaps, LAP_SD_MAX } from "./lambpool.js";

test("Tonga sur sept jours : seul A4 − A2 se resserre en un tour", () => {
  const long = tongaLaps(1, 3);
  assert.ok(long.used && long.sd < 0.1, `A4 − A2 : écart-type ${long.sd} h`);
  assert.ok(Math.abs(long.med - 36.13) < 0.05, `tour ${long.med} h`);
  for (const [i, j] of [[0, 2], [2, 4], [3, 5]]) assert.equal(tongaLaps(i, j).used, false, `A${j + 1} − A${i + 1} : du bruit, pas un tour`);
  assert.equal(LAP_SD_MAX, 1);
});

test("Tsar Bomba : troisième train − premier, heures entre parenthèses écartées", () => {
  const t = tsarLaps(), tq = tsarLaps({ queried: true });
  assert.equal(t.rows.length, 5);
  assert.equal(tq.rows.length, 7);
  for (const T of t.T) assert.ok(T > 34.9 && T < 35.4, `tour ${T} h`);
});

test("le résultat commun : quatre lots, médiane de tous les rayons, écart entre lots dans l'incertitude", () => {
  const P = lambPool();
  assert.deepEqual(P.sets.map((s) => s.key), ["tonga", "tonga-lap", "krak", "tsar"]);
  assert.equal(P.n, P.sets.reduce((a, s) => a + s.R.length, 0));
  assert.ok(Math.abs(P.med - 6388) < 5, `médiane ${P.med}`);
  assert.ok(P.sys > P.stat, "l'écart entre lots domine");
  assert.equal(P.sys, Math.max(...P.alts.map((a) => Math.abs(a.R - P.med))));
  assert.ok(Math.abs(P.z) < 1, `z ${P.z}`);
  for (const a of P.alts) assert.ok(Math.abs(a.R - P.med) < P.sigma, `${a.k} ${a.R}`);
});
