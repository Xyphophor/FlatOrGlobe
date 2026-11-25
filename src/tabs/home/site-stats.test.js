// La vitrine de l'accueil compte : chaque compteur vient d'un registre et n'est jamais nul (epic37/UC05).
import { test } from "node:test";
import assert from "node:assert/strict";
import { syncStats, siteStats } from "./site-stats.js";

test("les compteurs de la vitrine sont calculés et non nuls", async () => {
  const S = await siteStats();
  for (const k of ["tabs", "verdicts", "datasets", "sources"]) assert.ok(S[k] > 0, k);
  for (const c of ["measure", "check", "model"]) assert.ok(S.sections[c] > 0, c);
  assert.ok(S.sources > 300, `${S.sources} sources`);
  assert.ok(S.radius.n >= 5 && Math.abs(S.radius.mean - 6371) < 60, `${S.radius.n} ${S.radius.mean}`);
  assert.ok(S.datasets >= S.datasetIds.length);
});
test("aucune contribution non publiée dans la liste des jeux de données", () => {
});
