import { test } from "node:test";
import assert from "node:assert/strict";
import { pulsars, distinct, summary, romerDelay, betaShift, shiftFor1000km } from "./pulsar-logic.js";

test("12 pulsars, 20 modèles de chronométrage (EPTA 8, NANOGrav 12), chacun à moins de 3 σ (ou 2 km) de l'unité de DE440", () => {
  const P = pulsars(); assert.equal(P.length, 20); assert.equal(distinct().length, 12);
  assert.equal(P.filter((p) => p.array === "EPTA").length, 8);
  for (const p of P) assert.ok(Math.abs(p.au - summary().de) < Math.max(2, 3 * p.sau), `${p.name} ${p.au}`);
  assert.ok(Math.abs(summary().median - summary().de) < 1);
});
test("les latitudes du chronométrage et du VLBI s'accordent à quelques mas, sauf J0610−2100 et J1730−2304 d'EPTA", () => {
  for (const p of pulsars()) if (!(p.name === "J1730-2304" && p.array === "EPTA") && p.name !== "J0610-2100") assert.ok(Math.abs(p.db) < 7, `${p.name} ${p.array} ${p.db}`);
  assert.ok(Math.abs(pulsars().find((p) => p.name === "J1730-2304" && p.array === "EPTA").db) > 20);
  assert.ok(Math.abs(pulsars().find((p) => p.name === "J1730-2304" && p.array === "NANOGrav").db) < 5);
});
test("le retard de Rømer vaut au plus 499 s, et A·cos β/c pour chaque pulsar", () => {
  assert.ok(Math.abs(romerDelay(149597870.7, 0, 0, 1, Math.PI) - 499.0048) < 1e-3);
  for (const p of pulsars()) assert.ok(Math.abs(p.romer - 499.0048 * Math.cos(p.bv * Math.PI / 180)) < 0.01);
});
test("1 000 km d'erreur sur l'unité déplaceraient les latitudes de plus d'une seconde d'arc", () => {
  for (const p of pulsars()) if (Math.abs(p.bv) > 5) assert.ok(Math.abs(shiftFor1000km(p.bv)) > 1000, `${p.name} ${shiftFor1000km(p.bv)}`);
  assert.ok(Number.isNaN(betaShift(0, 1e-6)));      // une unité plus grande ne s'absorbe pas sur l'écliptique
});
