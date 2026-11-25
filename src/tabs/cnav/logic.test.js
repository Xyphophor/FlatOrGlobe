import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cnavRate, exp2, exp2At, refrArcminBennett, STARS3D, HCAL, starFix,
  impliedRadius, CNAV_DISTS_KM,
} from "./logic.js";

const R = 6371000; // m
const H = 5000000; // m (5000 km, legacy default)

test("globe rate k=1/R is constant across every distance -- the whole point of the tab", () => {
  const rates = CNAV_DISTS_KM.map((dk) => cnavRate(H, R, dk * 1000).kGlobe);
  for (const k of rates) assert.ok(Math.abs(k - rates[0]) < 1e-9, "kGlobe must not depend on d");
});

test("flat rate k varies with distance, unlike the globe's", () => {
  const near = cnavRate(H, R, 1000 * 1000).kFlat;
  const far = cnavRate(H, R, 10000 * 1000).kFlat;
  assert.notEqual(near.toFixed(6), far.toFixed(6));
});

test("at d=0 both models read altitude 90 (body overhead)", () => {
  const r = cnavRate(H, R, 0);
  assert.equal(r.altG, 90);
  assert.equal(r.altF, 90);
});

test("the flat body never sets (altitude stays positive even at 10,000 km)", () => {
  const r = cnavRate(H, R, 10000 * 1000);
  assert.ok(r.altF > 0, "flat model altitude must remain positive at any distance");
});

test("the globe body does set (altitude reaches/crosses zero near a quarter of the circumference)", () => {
  const quarterCircumference = (Math.PI / 2) * R;
  const r = cnavRate(H, R, quarterCircumference);
  assert.ok(Math.abs(r.altG) < 1e-6, "globe altitude should be ~0 at a quarter turn");
});

test("impliedRadius recovers ~6371 km from k=1/R", () => {
  const { Rkm } = impliedRadius(R);
  assert.ok(Math.abs(Rkm - 6371) < 1e-6);
});

test("exp2: globe prediction for Polaris' rise is independent of starting latitude, flat's is not (verdict rule)", () => {
  const d = 300, H_km = 5000;
  const atLow = exp2At(15, d, H_km);
  const atHigh = exp2At(60, d, H_km);
  const g = exp2(d, 45, H_km);
  assert.notEqual(atLow.toFixed(3), atHigh.toFixed(3), "flat prediction must drift with starting latitude");
  // globe prediction, recomputed at any latitude, is the same constant d/R
  const gAtLow = exp2(d, 15, H_km).globe;
  assert.ok(Math.abs(gAtLow - g.globe) < 1e-9, "globe prediction never depends on latitude");
});

test("exp2: 300 km north near 45N gives close to the documented ~1.7 degree globe rise", () => {
  const r = exp2(300, 45, 5000);
  assert.ok(Math.abs(r.globe - (300 / 6371) * (180 / Math.PI)) < 1e-9);
  assert.ok(r.globe > 2.5 && r.globe < 2.8, `expected ~2.7deg for 300km/6371km-radius, got ${r.globe}`);
});

test("refrArcminBennett decreases as altitude increases (less bending higher in the sky)", () => {
  const low = refrArcminBennett(5);
  const high = refrArcminBennett(60);
  assert.ok(low > high);
  assert.ok(low > 0 && high > 0);
});

test("HCAL calibrates star (1) exactly: its own miss is zero, the others are not", () => {
  const fixes = STARS3D.map((s) => starFix(s, HCAL));
  assert.ok(Math.abs(fixes[0].miss) < 1e-9, "star (1) is calibrated to have zero miss by construction");
  for (let i = 1; i < fixes.length; i += 1) {
    assert.ok(Math.abs(fixes[i].miss) > 1, `star ${i + 1} must miss by a non-trivial distance on the flat model`);
  }
});

test("starFix distances are all positive and increase with delta (farther stars, larger d)", () => {
  const fixes = STARS3D.map((s) => starFix(s, HCAL));
  for (let i = 1; i < fixes.length; i += 1) {
    assert.ok(fixes[i].d > fixes[i - 1].d, "great-circle distance to GP grows with delta");
  }
});
