import { test } from "node:test";
import assert from "node:assert/strict";
import { ringRows, ringRatio, fallRows, fallStats, siderealDay } from "./logic.js";

test("anneau G (Wettzell) : 348,643 Hz -> Ω = 7,292e-5 rad/s, et le disque tournant prédirait 461 Hz", () => {
  const g = ringRows().find((r) => r.id === "G");
  assert.ok(Math.abs(g.omega - 7.2922e-5) < 3e-9, `${g.omega}`);
  assert.ok(Math.abs(g.fDisc - 460.9) < 0.2);
});

test("rapport Wettzell / Christchurch : 1,0977 mesuré, 1,0972 sur le globe, 1 sur un disque", () => {
  const r = ringRatio();
  assert.ok(Math.abs(r.measured - r.globe) < 0.001 && Math.abs(r.measured - 1) > 0.09);
});

test("chutes vers l'est : Guglielmini écarté à 3 σ des autres, médiane des quatre ≈ 7,55e-5", () => {
  const s = fallStats();
  assert.deepEqual(s.kept, ["Benzenberg", "Reich", "Hall", "Bähr et al."]);
  assert.ok(Math.abs(s.q.med - 7.55e-5) < 0.01e-5);
  assert.ok(Math.abs(fallRows()[2].dGlobe - 27.6) < 0.1); // Reich : 27,6 mm prédit contre 28,4 mesuré
});

test("jour sidéral : dix tours en 861 640,9 s -> 3 min 56 s d'avance par nuit, 366,24 tours par an", () => {
  const r = siderealDay(0, 861640.9, 10);
  assert.ok(Math.abs(r.advance - 235.91) < 0.01 && Math.abs(r.turnsPerYear - 366.24) < 0.01);
});
