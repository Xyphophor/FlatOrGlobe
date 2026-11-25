import { test } from "node:test";
import assert from "node:assert/strict";
import { equilateralExcessArcsec, sagittaM, zenRow, radiiFromPairs, stats, dms } from "./logic.js";
import { SV_TRI, SV_ZEN, SURV_TRI } from "../../data/presets/surv.js";

test("Gauss's equal-area equilateral (82.2 km) gives 14.86″ against the measured 14.85″ -- the tab's best number", () => {
  const e = equilateralExcessArcsec(SURV_TRI[0].side);
  assert.ok(Math.abs(e - 14.86) < 0.02, `got ${e}`);
});

test("Wallace's Bedford Level middle marker stands d²/8R ≈ 1.85 m proud of the chord", () => {
  assert.ok(Math.abs(sagittaM(9.7) - 1.85) < 0.02);
});

test("NGS 1977 reciprocal zenith pairs: every sum exceeds 180° and the plane needs a negative k, i.e. rays bent upward", () => {
  for (const o of SV_ZEN) {
    const r = zenRow(o);
    assert.ok(r.excessArcmin > 0);
    assert.ok(r.kGlobe > 0 && r.kGlobe < 0.4, `globe k plausible: ${r.kGlobe}`);
    assert.ok(r.kPlane < -0.5, `plane needs strongly negative k (rays bent up): ${r.kPlane}`);
  }
});

test("32 reciprocal pairs return a finite radius clustered near 6,371 km after refraction (a plane requires infinity)", () => {
  const { raw, corrected } = radiiFromPairs(SV_TRI, SV_ZEN);
  assert.equal(raw.length, 32);
  const a = stats(raw), b = stats(corrected);
  assert.ok(Math.abs(a.med - 7150) < 200, `uncorrected median ~7150: ${a.med}`);
  assert.ok(Math.abs(b.med - 6371) / 6371 < 0.05, `corrected median within 5% of 6371: ${b.med}`);
});

test("dms parses sexagesimal strings", () => { assert.ok(Math.abs(dms("91 08 09") - 91.13583) < 1e-4); });

import { apparentRadiusKm, mcdRows, kozRows, fitThroughOrigin } from "./logic.js";
import { MCD, KOZ, BALDY_H_FT, FT } from "../../data/presets/surv-recip.js";

test("apparent radius: a chord of exactly ρε on a sphere of 6,371 km returns 6,371 km", () => {
  const eps = 1e-3, rho = 6371e3, c = 2 * rho * Math.sin(eps / 2);
  assert.ok(Math.abs(apparentRadiusKm(c, eps) - 6371) < 1e-6);
});

test("McDonald 1977, EDM distances: seven apparent radii between 6,950 and 7,200 km, and the EDM is the slope chord, not a sea-level arc", () => {
  const r = mcdRows(MCD, BALDY_H_FT, FT);
  for (const x of r) {
    assert.ok(x.R > 6950 && x.R < 7200, `${x.to} ${x.R}`);
    assert.ok(Math.abs(x.dEdm) < 0.1, `${x.to} EDM − chord ${x.dEdm}`); // une réduction au niveau de la mer ôterait 11 à 35 m
  }
  assert.equal(Math.round(Math.min(...r.map((x) => x.R))), 6953);
});

test("Kozlowski's total-station lines: 38 pairs, every sum above 180°, apparent radius small near the ground", () => {
  const r = kozRows(KOZ);
  assert.equal(r.length, 38);
  assert.ok(r.every((x) => x.epsArcsec > 0));
  assert.equal(Math.round(stats(r.map((x) => x.R)).med), 4419);
  assert.ok(Math.abs(fitThroughOrigin(r) - 4129) < 1);
});
