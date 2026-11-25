import { test } from "node:test";
import assert from "node:assert/strict";
import { echoes, stats, teams, shortest, auBackOfEnvelope, flatEcho, orbitRatio, AU_IAU } from "./radar-logic.js";

test("le tableau II : 25 échos, le plus court le 10 avril 1961 (conjonction inférieure)", () => {
  const E = echoes(); assert.equal(E.length, 25);
  assert.equal(shortest().date, "1961-04-10"); assert.equal(shortest().tau, 283.0845);
});
test("réduits avec DE440, les échos de 1961 redonnent l'unité astronomique d'aujourd'hui à moins de 100 km", () => {
  const [mean, sig, med, rms] = stats().ours;
  assert.ok(Math.abs(med - AU_IAU) < 100, `médiane ${med}`); assert.ok(Math.abs(mean - AU_IAU) < 3 * sig + 100);
  assert.ok(rms < 300);
  // les orbites de Newcomb (imprimées) dérivent beaucoup plus : la dispersion venait des orbites
  assert.ok(stats().newcomb[3] > 3 * rms);
});
test("chaque écho seul est à moins de 3 erreurs imprimées de la valeur d'aujourd'hui", () => {
  for (const e of echoes()) assert.ok(Math.abs(e.ours - AU_IAU) < 3 * e.err, `${e.date} ${e.ours}`);
});
test("le coin de table : un angle et une horloge donnent l'unité à quelques % près", () => {
  assert.ok(Math.abs(orbitRatio() - 0.723) < 0.001);
  const b = auBackOfEnvelope(shortest().tau);
  assert.ok(Math.abs(b.d / 1e6 - 42.44) < 0.01); assert.ok(Math.abs(b.au / AU_IAU - 1) < 0.04);
});
test("le cas plat : une Vénus à 5 000 km renverrait l'écho en un trentième de seconde", () => {
  assert.ok(Math.abs(flatEcho(5000) - 0.0334) < 0.0005);
});
test("le tableau III : les cinq équipes de 1961 à moins de 2,2 × 10⁻⁵ de la valeur d’aujourd’hui", () => {
  const T = teams(); assert.equal(T.length, 5);
  for (const t of T) assert.ok(Math.abs(t.au / AU_IAU - 1) < 2.2e-5, t.facility);
});
