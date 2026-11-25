import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHash, hashOf, secId } from "./nav.js";

test("adresses : onglet seul, section, ancienne clé renommée, refus du reste", () => {
  assert.deepEqual(parseHash("#tab-surv"), { tab: "surv", sec: null });
  assert.deepEqual(parseHash("#tab-surv/sv-h2rapp"), { tab: "surv", sec: "sv-h2rapp" });
  assert.deepEqual(parseHash("#tab-sim/x:1"), { tab: "elev", sec: "x:1" });
  assert.equal(parseHash("#s-surv-n3"), null);
  assert.equal(hashOf("moon", "moon-h2llr"), "#tab-moon/moon-h2llr");
  assert.equal(secId("moon", "s2"), "sec-moon-s2");
});

test("a section moved to another tab: its old link leads to the new tab", () => {
  assert.deepEqual(parseHash("#tab-seis/tg-h1"), { tab: "atmo", sec: "tg-h1" });
  assert.deepEqual(parseHash("#tab-seis/sq-h2"), { tab: "seis", sec: "sq-h2" });
});
