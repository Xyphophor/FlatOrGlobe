// Cumul des rayons de l'accueil : node --test src/tabs/home/radii.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadRadii, RADIUS_SOURCES, quart, globalStats, radiiValueLookup, splitStats } from "./radii.js";

test("le cumul charge chaque mesure depuis son onglet, toutes traitées de la même façon", async () => {
  const R = await loadRadii();
  assert.equal(R.length, RADIUS_SOURCES.length, "aucune entrée perdue (une erreur de chargement serait avalée)");
  for (const r of R) assert.ok(r.n >= 1 && r.q1 <= r.med && r.med <= r.q3 && r.min <= r.q1 && r.q3 <= r.max, r.key);
  assert.equal(new Set(R.map((r) => r.key)).size, R.length, "une entrée par méthode");
  assert.ok(R.every((r) => !("own" in r)), "aucune mesure n'a de traitement à part");
  assert.equal(R.filter((r) => r.quoted).length, 1, "seul al-Bīrūnī est cité et non recalculé");
});

test("statistique globale : moyenne pondérée par l'inverse de la variance, exclusion en écarts-types", async () => {
  const R = await loadRadii();
  for (const r of R) {
    assert.ok(r.sigma > 0 && r.sigma >= r.stat && r.sigma >= r.sys, `${r.key} σ`);
    assert.ok(r.alts.length >= 1, `${r.key} : au moins une alternative mesurée dans l'onglet`);
  }
  const G = globalStats(R);
  assert.equal(G.n + G.excluded.length + G.notCounted.length, R.length);
  assert.ok(Math.abs(G.weights.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  assert.ok(G.seScaled >= G.se && G.birge > 0);
  // une mesure isolée et imprécise pèse moins qu'une mesure précise : le poids suit 1/σ²
  const i = R.findIndex((r) => r.key === "obs-jan10"), j = R.findIndex((r) => r.key === "avia-fl");
  assert.ok(G.weights[i] < G.weights[j]);
  // le critère : une valeur absurde est écartée, et elle seule
  const fake = [...R, { key: "absurde", med: 20000, stat: 0, sys: 100, sigma: 100, alts: [] }];
  assert.deepEqual(globalStats(fake).excluded, [...G.excluded, "absurde"]);
  assert.ok(Math.abs(G.z) < 3, `6 371 km à ${G.z.toFixed(2)} erreurs types de la moyenne`);
});

test("quart : médiane et quartiles", () => {
  const q = quart([1, 2, 3, 4, 5]);
  assert.equal(q.med, 3); assert.equal(q.q1, 2); assert.equal(q.q3, 4);
});

test("carte d'export : les chiffres viennent du dernier cumul chargé", async () => {
  const R = await loadRadii(), S = splitStats(R), v = radiiValueLookup("en", (k) => `<${k}>`);
  assert.equal(v("all"), String(R.length)); assert.equal(v("k"), String(S.pure.rows.length));
  assert.equal(v("mean"), Math.round(S.pure.G.mean).toLocaleString("en"));
  assert.equal(v("cmean"), Math.round(S.check.G.mean).toLocaleString("en"));
  assert.match(v("top"), /^<[\w-]+>$/);
  assert.equal(v("nope"), "?");
  assert.equal(radiiValueLookup("en", undefined, [])("mean"), "?");
});

test("epic17 : deux cumuls jamais mélangés ; chaque mesure a une classe ; les pures n'ont aucune alternative polluée", async () => {
  const R = await loadRadii(), S = splitStats(R);
  assert.ok(R.every((r) => r.purity === "pure" || r.purity === "check"), "purity sur chaque entrée");
  assert.ok(R.filter((r) => r.purity === "check").every((r) => r.enters), "une validation dit où le rayon entre");
  assert.deepEqual(S.pure.rows.map((r) => r.key).sort(), ["atmo-lamb", "avia-fl", "dip", "sat", "surv-tri"]);
  assert.equal(S.pure.rows.length + S.check.rows.length, R.length);
  assert.ok(R.every((r) => r.alts.every((a) => !a.polluted)));
  // le cumul pur ne dépend pas des validations
  assert.equal(S.pure.G.mean, globalStats(R.filter((r) => r.purity === "pure")).mean);
});

test("Eötvös est montrée mais non comptée : poids nul, hors χ² et hors exclusion, distance aux autres toujours donnée", async () => {
  const R = await loadRadii(), G = globalStats(R), i = R.findIndex((r) => r.key === "avia-eot");
  assert.ok(i >= 0, "toujours dans le tableau");
  assert.equal(G.weights[i], 0); assert.deepEqual(G.notCounted, ["avia-eot", "moon-llr", "orb-sun"]); // epic19 : rayons locaux, montrés
  assert.ok(!G.excluded.includes("avia-eot") && Number.isFinite(G.zs[i]));
  assert.equal(G.n + G.excluded.length + G.notCounted.length, R.length);
  const without = globalStats(R.filter((r) => r.key !== "avia-eot"));
  assert.equal(G.mean, without.mean, "la compter ou la retirer de la liste donne la même moyenne");
  assert.equal(radiiValueLookup("en", (k) => `<${k}>`)("nc"), "<avia-eot> ; <moon-llr> ; <orb-sun>");
});
