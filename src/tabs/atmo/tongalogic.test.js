import { test } from "node:test";
import assert from "node:assert/strict";
import { TONGA_V, TONGA_V_MEASURED, TONGA_RIM, tongaTheta, looKeep, looLine, tongaRadii, tongaFreeFits, tongaFlatFits, tongaRimPath, tongaDomeFits, tongaResult } from "./tongalogic.js";
import { TONGA_EVENT, TONGA_STATIONS } from "../../data/presets/seis-tonga.js";
import { DEG } from "../../core/math.js";

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b} (±${tol})`);

test("preset: 102 stations, theta recomputed from coordinates matches the build script", () => {
  assert.equal(TONGA_STATIONS.length, 102);
  for (const s of TONGA_STATIONS) near(DEG(tongaTheta(s)), s.theta, 2e-3, s.id);
  const t = TONGA_EVENT.trace, n = Math.round((66 - t.from) / t.step) + 1;
  for (const s of TONGA_STATIONS) assert.equal(s.trace.length, n, s.id);
});

test("picks are model-free: A1 in 2-20 h, A2 at least 6 h after A1 and before 40 h", () => {
  for (const s of TONGA_STATIONS) {
    if (s.a1 != null) assert.ok(s.a1 > 2 && s.a1 < 20, s.id);
    if (s.a2 != null) assert.ok(s.a2 > s.a1 + 6 && s.a2 < 40, s.id);
  }
});

test("pre-event noise is several times smaller than the wave", () => {
  const med = (v) => { const w = v.slice().sort((a, b) => a - b); return w[w.length >> 1]; };
  const noise = med(TONGA_STATIONS.filter((s) => s.noise != null).map((s) => s.noise));
  const amp = med(TONGA_STATIONS.filter((s) => s.amp1 != null).map((s) => s.amp1));
  assert.ok(noise < 0.15 && amp / noise > 5, `noise ${noise} hPa, A1 ${amp} hPa`);
});

test("looKeep drops a value far from the others and keeps an ordinary spread", () => {
  assert.deepEqual(looKeep([10, 11, 9, 10.5, 9.5, 10, 30]), [true, true, true, true, true, true, false]);
  assert.ok(looKeep([1, 2, 3, 4, 5, 6]).every(Boolean));
});

test("looLine recovers an exact line", () => {
  const x = [0, 1, 2, 3, 4], f = looLine(x, x.map((v) => 2 + 3 * v));
  near(f.a, 2, 1e-12, "a"); near(f.b, 3, 1e-12, "b");
});

test("radius with the measured eruption time (t0 = 0) and v = 310 m/s -- same numbers as the Tonga build (fog build seis-tonga)", () => {
  const r = tongaRadii();
  const exp = { a1: [80, 96, 6392, 89], a2: [76, 90, 6380, 21], lap: [64, 90, 6383, 33] };
  for (const [k, [n, of, mean, sd]] of Object.entries(exp)) {
    assert.equal(r[k].n, n, k); assert.equal(r[k].rows.length, of, k);
    near(r[k].mean, mean, 1, `${k} mean`); near(r[k].sd, sd, 1, `${k} sd`);
  }
  // every estimator within 0.5 % of 6371 km -- but R scales with v (rule 6: say it on the page)
  for (const k of ["a1", "a2", "lap"]) near(r[k].mean, 6371, 32, k);
  near(tongaRadii(TONGA_V * 1.03).a2.mean, 1.03 * r.a2.mean, 1e-6, "R proportional to v");
});

// Real, kept, explained on the page (owner: honest imperfection): with one speed
// and t0 = 0 the radius drifts by ~1.3-1.5 km per degree of theta, ~100 km over
// the US. A speed that differs a little from path to path, or an effective start
// slightly off the explosion onset, both show up as this slope; US stations alone
// cannot tell them apart (same cause as tongaFreeFits' instability).
test("t1 + t2 is nearly the same at every station; the residual drift with theta is small and documented", () => {
  const { lap } = tongaRadii(), keep = lap.rows.filter((_, i) => lap.keep[i]);
  const th = keep.map((r) => DEG(tongaTheta(TONGA_STATIONS.find((s) => s.id === r.id))));
  const f = looLine(th, keep.map((r) => r.R)), span = Math.max(...th) - Math.min(...th);
  near(f.b, -1.45, 0.05, "drift km/deg");
  assert.ok(Math.abs(f.b * span) < 0.02 * 6371, `drift over ${span.toFixed(0)}° = ${(f.b * span).toFixed(0)} km`);
});

test("freeing t0 too is ill-conditioned on US-only stations (limitation shown on the page)", () => {
  const f = tongaFreeFits();
  near(f.a1.R, 6193, 1, "A1 R"); near(f.a1.t0, 0.305, 0.001, "A1 t0");
  near(f.a2.R, 6691, 1, "A2 R"); near(f.a2.t0, -1.254, 0.001, "A2 t0");
  near(f.joint.R, 6373, 1, "joint R"); assert.equal(f.joint.n, 157);
  assert.ok(Math.abs(f.a2.R - f.a1.R) > 5 * Math.hypot(f.a1.eR, f.a2.eR), "the two branches disagree beyond their formal errors");
});

test("rim path: never shorter than the direct flat distance, and the rim is the map's 180-degree edge", () => {
  near(TONGA_RIM, 20015.1, 0.1, "rim");
  const s = TONGA_STATIONS[0];
  assert.ok(tongaRimPath(s) > 2 * (TONGA_RIM - 110.5 * 111.19) - 200);
});

test("flat model tuned in its favour (free v, free t0, any rim) still scatters several times more than the globe", () => {
  const g = tongaFreeFits(), f = tongaFlatFits();
  near(f.direct.v * 1000, 427, 1, "flat direct v (m/s)");
  assert.ok(f.direct.sd > 3 * g.a1.sd, `A1 only: flat ${f.direct.sd} h vs globe ${g.a1.sd} h`);
  for (const r of f.rim) assert.ok(r.sd > 10 * g.joint.sd, `rim ${r.rim}: flat ${r.sd} h vs globe ${g.joint.sd} h`);
});

test("second flat model, a bounce off a dome: the echo grows with distance for EVERY height, the real one shrinks (a sign, not a size)", () => {
  const d = tongaDomeFits();
  for (const f of d.fits) assert.ok(f.dLdd > 0, `h = ${f.h} km`);
  assert.ok(d.observed < -0.5, `observed dt2/dd = ${d.observed} h per 1000 km`);
  near(d.best.h, 22111, 50, "best dome height (km)");
  near(d.best.sd, 1.078, 0.005, "best dome scatter (h)");
  assert.ok(d.best.sd > 8 * tongaFreeFits().joint.sd, "the best dome still scatters ~10x the globe");
  assert.ok(d.best.sd < Math.min(...tongaFlatFits().rim.map((r) => r.sd)), "the dome is the flat model's best try, and it is the one shown");
});

test("looLine with running sums gives the same exclusions as a direct refit", () => {
  const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], y = x.map((v) => 1 + 2 * v + (v % 3) * 0.01); y[4] += 5;
  const f = looLine(x, y);
  assert.equal(f.keep.filter((k) => !k).length, 1); assert.equal(f.keep[4], false);
  near(f.b, 2, 0.01, "slope");
});

test("the result: one number with its uncertainty, the same object the home page uses", async () => {
  const { lambPair } = await import("./lambsys.js");
  const r = lambPair().tonga;
  near(r.med, 6382, 1, "median R"); near(r.stat, 4.8, 0.2, "stat"); near(r.sys, 72.6, 1, "sys: the speed the 1883 eruption needs");
  assert.ok(Math.abs(r.z) < 0.3 && r.lo95 < 6371 && r.hi95 > 6371);
  // la vitesse mesurée en 2022 (distances du globe) : citée, jamais dans l'incertitude (règle 10)
  const vm = r.cited.find((a) => a.k === "v-measured");
  assert.ok(vm.polluted); assert.equal(vm.R.toFixed(6), ((r.med * TONGA_V_MEASURED) / TONGA_V).toFixed(6));
  assert.ok(!r.alts.some((a) => a.k === "v-measured"));
  // depuis le 2026-11-21, l'accueil reprend toutes les ondes de Lamb réunies (lambpool.js), Tonga compris
  const home = (await import("../home/radii.js")).RADIUS_SOURCES.find((s) => s.key === "atmo-lamb");
  const h = await home.load(), P = (await import("./lambpool.js")).lambPool();
  assert.equal(h.med, P.med); assert.deepEqual(h.alts, P.alts);
  assert.ok(P.sets[0].R.length === r.n, "Tonga t1 + t2 is one of the pooled sets");
});
