import { test } from "node:test";
import assert from "node:assert/strict";
import { seisDelta, seisFlatKm, seisRows, seisExp, SEIS_EVENTS, SEIS_KM_PER_DEG, SEIS_SHADOW, seisRadiusOf, seisRadiusGroups, ctStats, SEIS_V20, seisPathV, seisRadiusCorrectedGroups, SEIS_V_OCEAN, SEIS_V_CONTINENT, seisRealAnimHits, seisRegressionFit, seisMedianFlatRatio, seisRegressionData, seisLatenessBins } from "./logic.js";
import { SEIS_RADIUS_EVENTS, SEIS_ARRIVALS } from "../../data/presets/seis-radius.js";

const TOTAL_ARRIVALS = SEIS_RADIUS_EVENTS.reduce((n, ev) => n + SEIS_ARRIVALS[ev.key].length, 0);

test("one degree of arc is 111.19 km", () => { assert.ok(Math.abs(SEIS_KM_PER_DEG - 111.19) < 0.01); });
test("the flat map is exact for a path radial from the north pole and badly wrong across the south", () => {
  assert.ok(Math.abs(seisFlatKm(90, 0, 0, 0) - seisDelta(90, 0, 0, 0) * SEIS_KM_PER_DEG) < 1e-6);
  const g = seisDelta(-38.29, -73.05, -77.85, 166.76) * SEIS_KM_PER_DEG, f = seisFlatKm(-38.29, -73.05, -77.85, 166.76);
  assert.ok(f / g > 1.5, `flat/globe = ${f / g}`);
});
test("Sumatra 2004: southern stations disagree by tens of percent, northern ones by little", () => {
  const rows = seisRows(SEIS_EVENTS.sum);
  const bad = rows.filter((r) => Math.abs(r.err) > 0.25), ok = rows.filter((r) => Math.abs(r.err) < 0.08);
  assert.ok(bad.length >= 2 && ok.length >= 1);
});
test("experiment 1e: Sumatra -> Palmer Station is diagnostic (hours apart)", () => {
  const r = seisExp(3.316, 95.854, -64.774, -64.049, 3.8);
  assert.ok(Math.abs(r.tF - r.tG) > 1800, `Δt = ${r.tF - r.tG} s`);
});
test("the shadow zone is a fixed angular band", () => { assert.deepEqual(SEIS_SHADOW, [103, 143]); });

test("seisRadiusOf recovers R exactly when fed the globe's own geometry", () => {
  const dg = 45, R = 6371, t = (R * RadOf(dg)) / SEIS_V20;
  assert.ok(Math.abs(seisRadiusOf(dg, t) - R) < 1e-6);
  function RadOf(d) { return (d * Math.PI) / 180; }
});
test("real Rayleigh arrivals: every documented earthquake reconstructs R within the honestly-reported spread, not a small-scatter fit", () => {
  const groups = seisRadiusGroups();
  assert.equal(groups.length, SEIS_RADIUS_EVENTS.length + 1); // one box per event + the combined group
  assert.equal(groups[groups.length - 1][0], "all");
  const all = groups[groups.length - 1][1];
  assert.equal(all.length, TOTAL_ARRIVALS);
  const s = ctStats(all);
  const pctOff = ((s.med - 6371) / 6371) * 100;
  // Honest result documented in data/seis/README.md: median a few % to ~10% high,
  // real crustal heterogeneity (Rayleigh dispersion), not a bug -- do not tighten
  // this by fitting v to the data, see seisRadiusOf's comment and CLAUDE.md rule 6.
  assert.ok(pctOff > 0 && pctOff < 15, `median off by ${pctOff.toFixed(1)}%`);
  assert.ok(s.q3 - s.q1 > 500, "the spread should stay visibly wide, not collapse to a point");
});

test("seisPathV interpolates between the continental and oceanic endpoints, never fitted to the data", () => {
  assert.equal(seisPathV(1), SEIS_V_OCEAN);
  assert.equal(seisPathV(0), SEIS_V_CONTINENT);
  assert.ok(Math.abs(seisPathV(0.5) - (SEIS_V_OCEAN + SEIS_V_CONTINENT) / 2) < 1e-9);
});
test("the ocean/continent correction narrows the spread and the bias without erasing either", () => {
  const uncorrected = ctStats(seisRadiusGroups().at(-1)[1]);
  const corrected = ctStats(seisRadiusCorrectedGroups().at(-1)[1]);
  assert.equal(corrected.n, TOTAL_ARRIVALS);
  const offU = Math.abs((uncorrected.med - 6371) / 6371) * 100;
  const offC = Math.abs((corrected.med - 6371) / 6371) * 100;
  const iqrU = uncorrected.q3 - uncorrected.q1, iqrC = corrected.q3 - corrected.q1;
  // Honest, not perfect: still real crustal heterogeneity left over (path-average
  // ocean/continent is a coarse two-value model of a continuum) -- see the tab's
  // own callout. A real refinement narrows things, it does not zero them out.
  assert.ok(offC < offU, `median bias should shrink: ${offU.toFixed(1)}% -> ${offC.toFixed(1)}%`);
  assert.ok(iqrC < iqrU, `IQR should narrow: ${iqrU.toFixed(0)} -> ${iqrC.toFixed(0)}`);
  assert.ok(offC > 0.5, "still a real, non-zero residual -- not tuned away");
});

test("seisRegressionFit recovers the exact v when the cloud is noiseless (all points from one true v)", () => {
  const trueV = 3.9;
  const rows = [10, 30, 60, 95, 140].map((d) => [null, null, null, d, (d * SEIS_KM_PER_DEG) / trueV, null]);
  const { vFit } = seisRegressionFit(rows);
  assert.ok(Math.abs(vFit - trueV) < 1e-6, `vFit = ${vFit}`);
});
test("seisMedianFlatRatio is exactly 1 for paths radial from the epicentre's own pole (the AE map is exact there)", () => {
  const ev = { lat: 90, lon: 0 };
  const rows = [[null, 10, 0, 80, null, null], [null, -5, 45, 95, null, null], [null, 30, -90, 60, null, null]];
  assert.ok(Math.abs(seisMedianFlatRatio(ev, rows) - 1) < 1e-9);
});
test("seisRegressionData: per earthquake the fit stays within a physically sane v range, even for a small/noisy sample", () => {
  for (const ev of SEIS_RADIUS_EVENTS) {
    const d = seisRegressionData(ev, SEIS_ARRIVALS[ev.key]);
    assert.ok(d.vFit > 2 && d.vFit < 6, `${ev.key}: vFit = ${d.vFit}`);
    assert.ok(d.medianRatio >= 1, `${ev.key}: the AE flat map never understates a real distance`);
  }
});
test("seisRegressionData: each point carries its own globe AND flat distance for the SAME real time, kmF >= kmG always", () => {
  const ev = SEIS_RADIUS_EVENTS.find((e) => e.key === "sumatra2004"), rows = SEIS_ARRIVALS[ev.key];
  const d = seisRegressionData(ev, rows);
  assert.equal(d.points.length, rows.length);
  for (const p of d.points) assert.ok(p.kmF >= p.kmG - 1e-6, `kmF (${p.kmF}) should never be less than kmG (${p.kmG})`);
  // not every point should coincide (a flat map is not the globe): at least
  // some real stations must show a visible gap between the two positions.
  assert.ok(d.points.some((p) => p.kmF / p.kmG > 1.05), "expected at least one station with a real flat/globe gap");
});
test("seisRegressionData: pooled across all 9 real earthquakes, the fit sits closer to the globe expectation than the flat one", () => {
  // Individual small/biased-azimuth events (e.g. Sumatra, n=19) can land nearer
  // the flat line by chance -- that is real dispersion, not a bug, see the box
  // plot's own callout. Pooling all 479 real rows is the fair, honest test.
  const rows = SEIS_RADIUS_EVENTS.flatMap((e) => SEIS_ARRIVALS[e.key]);
  // seisMedianFlatRatio needs one shared epicentre per call; pool the per-event
  // ratios weighted by each event's row count instead of a single global ratio.
  let totalN = 0, weightedFlatSlope = 0;
  const d = seisRegressionFit(rows);
  for (const e of SEIS_RADIUS_EVENTS) {
    const rr = SEIS_ARRIVALS[e.key];
    weightedFlatSlope += seisMedianFlatRatio(e, rr) * rr.length;
    totalN += rr.length;
  }
  const slopeFlat = (weightedFlatSlope / totalN) / SEIS_V20, slopeGlobe = 1 / SEIS_V20;
  assert.ok(
    Math.abs(d.slope - slopeGlobe) < Math.abs(d.slope - slopeFlat),
    `pooled fit should sit closer to globe: slope=${d.slope}, globe=${slopeGlobe}, flat=${slopeFlat}`
  );
});

test("seisRealAnimHits: at t=0 nothing has arrived, at a huge t everything real has", () => {
  const ev = SEIS_RADIUS_EVENTS[0], rows = SEIS_ARRIVALS[ev.key];
  const start = seisRealAnimHits(ev, rows, 0);
  assert.equal(start.hitG, 0);
  assert.equal(start.total, rows.length);
  const end = seisRealAnimHits(ev, rows, 1e6);
  assert.equal(end.hitG, rows.length);
  assert.equal(end.hitF, rows.length);
});

test("seisLatenessBins: flat lateness grows toward the south pole, globe lateness stays bounded everywhere, pooled over all real arrivals", () => {
  const bins = seisLatenessBins();
  assert.ok(bins.length > 5, "expected several colatitude bands with real data");
  assert.equal(bins.reduce((s, b) => s + b.n, 0), TOTAL_ARRIVALS);
  const first = bins[0], last = bins[bins.length - 1];
  assert.ok(first.lo < 30, `first band should be near the north pole: colat ${first.lo}`);
  assert.ok(last.hi > 150, `last band should be near the south pole: colat ${last.hi}`);
  assert.ok(Math.abs(first.flatMin) < 10, `flat lateness near the north pole should be small: ${first.flatMin} min`);
  assert.ok(last.flatMin > 30, `flat lateness near the south pole should be large: ${last.flatMin} min`);
  // The "fair" test the owner asked for: does the RESIDUAL correlate with map
  // position for one model but not the other? Real dispersion keeps the globe
  // residual non-zero, but it must stay an order of magnitude smaller than
  // the flat one everywhere, with no comparable south-pole blowup.
  for (const b of bins) assert.ok(Math.abs(b.globeMin) < 10, `globe lateness should stay bounded: colat ${b.lo}, ${b.globeMin} min`);
});
