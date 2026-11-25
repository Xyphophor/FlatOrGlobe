import { test } from "node:test";
import assert from "node:assert/strict";
import { OMEGA_SOURCES, AU_SOURCES, loadMotion, motionSplit } from "./motion.js";

test("Ω : anneaux, chutes et Doppler des satellites, trois mesures pures, médiane proche de 7,29e-5 rad/s", async () => {
  const r = await loadMotion(OMEGA_SOURCES), S = motionSplit(r);
  assert.equal(S.pure.rows.length, 3);
  assert.ok(Math.abs(S.pure.rows[0].med - 7.282e-5) < 0.01e-5, `${S.pure.rows[0].med}`);
  assert.ok(Math.abs(S.pure.rows.find((x) => x.key === "om-sat").med - 7.2921e-5) < 0.0001e-5);
});

test("unité astronomique : 147,5 (Bradley, Delambre) en pur, 148,6, 150,7, 149,6 (radar de Vénus), 153,0, 149,6 et 158,8 (passages de 1761, 1769, 2012) et 149,6 (pulsars) en validation", async () => {
  const S = motionSplit(await loadMotion(AU_SOURCES));
  assert.ok(Math.abs(S.pure.med / 1e6 - 147.5) < 0.05);
  assert.deepEqual(S.check.rows.map((r) => Math.round(r.med / 1e5) / 10), [148.6, 150.7, 149.6, 153, 149.6, 158.8, 149.6]);
});
