// L'air qu'il faut à chaque modèle, photo par photo (2026-11-13) : Bordighera et la statistique.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bordNeed, bordNumbers, refRows, airStats, loadContribAir } from "./air-stats.js";
import { summarize } from "../../core/air-need.js";
import { RB_AIR } from "../../data/presets/ref-bordighera.js";

test("Bordighera: in the day's air the globe hides more than the photograph, the plane nothing", () => {
  assert.ok(RB_AIR.hiddenGlobe > RB_AIR.H, `globe ${RB_AIR.hiddenGlobe}`);
  assert.equal(RB_AIR.hiddenFlat, 0);
});

test("Bordighera: the globe needs air a little warmer than the day's, the plane a few kelvins colder", () => {
  const N = bordNumbers();
  assert.ok(N.globe && N.flat);
  assert.ok(N.globe.dT > N.day.dT && N.globe.dT < N.day.dT + 2, `globe ${N.globe.dT}`);
  assert.ok(N.flat.dT < N.day.dT - 1 && N.flat.dT > -5, `plane ${N.flat.dT}`);
  assert.ok(N.flat.grad < -0.0098 && N.flat.grad > -0.0343, "plane: steeper than dry adiabatic, not autoconvective");
  // the margin on H gives a range around each need
  for (const m of [N.globe, N.flat]) assert.ok(m.gLo <= m.grad && m.grad <= m.gHi);
  // more hidden = colder: the need for H + 1 m is colder than for H
  assert.ok(bordNeed("flat", N.H + 1).dT < N.flat.dT);
});

test("the statistic: this tab's photographs and the published contributions' rows, the globe within 2 σ on the independent ones", async () => {
  for (const r of refRows()) {
    assert.ok(Math.abs(r.globe.z) < 2, `${r.id} globe ${r.globe.z}`);
    assert.ok(r.flat.z < -2, `${r.id} plane ${r.flat.z}`);
  }
  const mods = await loadContribAir(), S = airStats(mods);
  assert.equal(S.rows.length, 2 + mods.reduce((n, { m }) => n + m.rows().length, 0));
  // the independent rows come before the series
  const firstSeries = S.rows.findIndex((r) => r.series);
  if (firstSeries >= 0) assert.ok(S.rows.slice(firstSeries).every((r) => r.series));
  for (const r of S.rows.filter((x) => !x.series)) assert.ok(Math.abs(r.globe.z) < 2 && r.flat.z < -2, r.id);
  assert.ok(S.all.flat.chi2 > 10 * S.all.globe.chi2);
  assert.ok(S.allShifted.flat.chi2 > 10 * S.allShifted.globe.chi2);
  for (const p of S.parts) if (p.off) {   // each model's own best offset lowers its own χ² on its series
    assert.ok(p.sumShifted.globe.chi2 <= p.sum.globe.chi2 && p.sumShifted.flat.chi2 <= p.sum.flat.chi2);
    assert.equal(typeof p.m.notes("en", p), "string");
  }
  const ind = S.rows.filter((r) => !r.series), sm = summarize(ind);
  assert.ok(Math.abs(sm.globe.chi2 - S.indep.globe.chi2) < 1e-9);
});
