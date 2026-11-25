import { test } from "node:test";
import assert from "node:assert/strict";
import { KRAK_V, KRAK_RIM, krakTheta, krakLaps, krakRadii, krakGapFits, krakResult, looLine0 } from "./krakatoalogic.js";
import { KRAK_VENT, KRAK_STATIONS } from "../../data/presets/seis-krakatoa.js";

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b} (±${tol})`);
const byId = Object.fromEntries(KRAK_STATIONS.map((s) => [s.id, s]));

test("transcription: 47 stations, Krakatoa at 6°9′ S 105°22′ E, spot values of Tables III-IV", () => {
  assert.equal(KRAK_STATIONS.length, 47);
  near(KRAK_VENT[0], -6.15, 1e-9, "lat"); near(KRAK_VENT[1], 105 + 22 / 60, 1e-4, "lon");
  // Glasgow: I 14 h 2, II 27 h 45, III 50 h 38, VII 124 h 20 (pp. 66-67)
  const g = byId.Glasgow.t;
  near(g[0], 14 + 2 / 60, 1e-4, "Glasgow I"); near(g[1], 27.75, 1e-4, "Glasgow II"); near(g[2], 50 + 38 / 60, 1e-4, "Glasgow III"); near(g[6], 124 + 20 / 60, 1e-4, "Glasgow VII");
  assert.equal(byId.Calcutta.q[2], true, "Calcutta III is queried in the print");
  assert.equal(byId.Mexico.t[0], "?", "Mexico: wave not identifiable");
});

test("Strachey's own Table VIII checks: Glasgow's two first laps are 36 h 36 and 34 h 41", () => {
  const L = krakLaps(byId.Glasgow);
  near(L.out[0] * 60, 36 * 60 + 36, 0.5, "III − I"); near(L.back[0] * 60, 34 * 60 + 41, 0.5, "IV − II");
});

test("theta from Table II coordinates agrees with Strachey's printed great-circle degrees", () => {
  // Table II, 'Direct' column: Glasgow 106°2′, Melbourne 47°53′, Washington 147°12′, Calcutta 33°8′
  for (const [id, deg] of [["Glasgow", 106 + 2 / 60], ["Melbourne", 47 + 53 / 60], ["Washington", 147 + 12 / 60], ["Calcutta", 33 + 8 / 60]])
    near(krakTheta(byId[id]), deg, 0.1, id);
});

test("the radius needs no position and no explosion time: one lap each way, v = 310 m/s", () => {
  const r = krakRadii();
  assert.equal(r.rows.length, 29); assert.equal(r.n, 29);
  near(r.med, 6310, 2, "median"); near(r.sd, 48, 2, "spread between stations");
  // the formula itself: Glasgow (36 h 36 + 34 h 41) / 2 at 310 m/s
  const G = r.rows.find((x) => x.id === "Glasgow");
  near(G.R, (KRAK_V * 3600 * ((36 + 36 / 60 + 34 + 41 / 60) / 2)) / (2 * Math.PI), 0.01, "Glasgow R");
});

test("the wind: one direction alone is biased, the two cancel (Strachey's ~0.4°/h difference)", () => {
  const out = krakRadii({ dir: "out" }), back = krakRadii({ dir: "back" }), both = krakRadii();
  assert.ok(out.med > both.med + 100 && back.med < both.med - 100, `out ${out.med}, back ${back.med}`);
  near((out.med + back.med) / 2, both.med, 40, "mean of the two directions");
});

test("result carried to the home page: 6,310 ± 137 km; the 2022 measured speed is quoted, never in the uncertainty", async () => {
  const { lambPair } = await import("./lambsys.js");
  const r = lambPair().krak;
  near(r.med, 6310, 2, "median"); near(r.sigma, 137, 3, "sigma"); near(r.stat, 8, 1, "stat");
  assert.ok(Math.abs(r.z) < 1, `z = ${r.z}`);
  assert.deepEqual(r.alts.map((a) => a.k), ["all-laps", "queried", "gap-fit", "other-event"]);
  assert.ok(r.alts.every((a) => !a.polluted) && r.cited.every((a) => a.polluted));
  // sans l'autre éruption, la même chose moins une alternative
  assert.equal(krakResult().alts.length, 3);
});

test("looLine0 recovers an exact line through the origin and drops one wild point", () => {
  const x = [1, 2, 3, 4, 5, 6, 7], y = x.map((v) => 2 * v); y[3] += 30;
  const f = looLine0(x, y);
  near(f.b, 2, 1e-12, "slope"); assert.equal(f.keep.filter(Boolean).length, 6);
});

test("flat model, tuned in its favour, scatters several times more than the globe on the I → II interval", () => {
  const g = krakGapFits();
  assert.equal(g.rows.length, 40);
  near(g.globe.sd, 0.62, 0.02, "globe, R/v free"); near(g.globe0.sd, 0.83, 0.02, "globe, nothing fitted");
  for (const r of g.rim) assert.ok(r.sd > 5 * g.globe0.sd, `rim ${r.rim}: ${r.sd} h`);
  assert.ok(g.domeBest.sd > 3 * g.globe0.sd, `dome ${g.domeBest.h}: ${g.domeBest.sd} h`);
  near(g.rim[0].rim, KRAK_RIM, 1e-9, "first rim = the map's edge");
  // the dome's best height needs a wave far slower than sound
  assert.ok(g.domeBest.v * 1000 < 150, `dome speed ${g.domeBest.v * 1000} m/s`);
});
