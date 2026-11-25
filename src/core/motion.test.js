import { test } from "node:test";
import assert from "node:assert/strict";
import { frameStep } from "./motion.js";

test("frameStep : ~30 i/s, vitesse indépendante de la cadence", () => {
  const st = { last: 0 };
  assert.equal(frameStep(st, 1000), 1);          // premier cadre
  assert.equal(frameStep(st, 1016), 0);          // trop tôt (60 Hz) : on saute
  const s2 = { last: 1000 };
  assert.ok(Math.abs(frameStep(s2, 1000 + 2000 / 60) - 2) < 1e-9); // 33 ms = 2 cadres à 60 Hz
  const s3 = { last: 1000 };
  assert.equal(frameStep(s3, 9000), 5);          // retour après une pause : plafonné
});

test("revealAlpha: nothing before, fade to the opacity, then all-or-nothing blinks, then the opacity", async () => {
  const { revealAlpha, REVEAL, REVEAL_T } = await import("./motion.js");
  assert.equal(revealAlpha(-1, 0.6), 0);
  assert.ok(revealAlpha(REVEAL.fade / 2, 0.6) > 0.2 && revealAlpha(REVEAL.fade / 2, 0.6) < 0.4);
  assert.equal(revealAlpha(REVEAL.fade + 0.5, 0.6), 0.6);
  const b0 = REVEAL.fade + REVEAL.hold;
  const seen = new Set();
  for (let u = b0 + 0.01; u < b0 + 2 * REVEAL.blinks * REVEAL.blink; u += 0.05) seen.add(revealAlpha(u, 0.6));
  assert.deepEqual([...seen].sort(), [0, 1]);
  assert.equal(revealAlpha(REVEAL_T - 0.01, 0.6), 0.6);
});
