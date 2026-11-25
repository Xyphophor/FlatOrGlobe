import { test } from "node:test";
import assert from "node:assert/strict";
import { ctGamma, ctRate, ctCase, ctSeries, ctStats, ctRanking, ctRadii } from "./logic.js";
import { CT_CASES } from "../../data/presets/ct.js";

test("γ = s/R at 50.7 km is 27.4′ -- cross-checked against the project's own 'globe slant' of 0°27′", () => {
  assert.ok(Math.abs(ctGamma(50.778, 0) - 27.4) < 0.1);
});

test("a star due east at 45° latitude loses altitude at 15.041·cos45° ≈ 10.6″/s", () => {
  assert.ok(Math.abs(ctRate(45, 90) - 10.64) < 0.02);
});

test("the plane predicts exactly 0 for the two-end difference; the globe predicts γ", () => {
  const n = ctCase(CT_CASES[0]);
  assert.ok(Math.abs(n.pairT - n.gam) < Math.abs(n.pairT - 0), "measured difference closer to γ than to 0 for Pikes Peak");
});

test("their sheet's comparison equals the flat residual plus the measured γ (the identity the legacy exposes)", () => {
  const n = ctCase(CT_CASES[0]);
  assert.ok(Math.abs(n.mixed - (n.flatOff + n.pairFlat)) < 1e-9);
});

test("over every case on file the globe with refraction is the closest of the four ways of asking", () => {
  const r = ctRanking();
  assert.equal(r[0][0], "globe, refraction on");
});

test("two-end γ reduction recovers a radius near 6,371 km on the cases beyond 20 km", () => {
  const S = ctRadii(); const s = ctStats(S[0][1]);
  assert.ok(s.n >= 20);
  assert.ok(Math.abs(s.med - 6371) / 6371 < 0.15, `median ${s.med}`);
});

test("series/stats shapes", () => { const S = ctSeries(); assert.equal(S.length, 4); assert.equal(ctStats(S[0][1]).n, CT_CASES.length); });
