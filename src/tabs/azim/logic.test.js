import { test } from "node:test";
import assert from "node:assert/strict";
import { azimState, azimEclipseRows, azimPairFor, azimTriangle, azimMapDir, azimFromJD, azimWrap180, azimKindestLamp, AZIM_ECL_PUB } from "./logic.js";
import { OBS } from "../../core/ephemeris.js";
import { jdFromUTC } from "../../core/ephemeris.js";
import { twiAE } from "../twi/logic.js";

test("THE THEOREM: at every instant, for every station, the Sun's azimuth equals the great-circle bearing to the sub-solar point", () => {
  for (const c of ["dec", "jun", "ecl"]) for (const t of [0, 5.5, 17]) {
    const S = azimState(c, "sun", t);
    for (const r of S.rows) assert.ok(Math.abs(azimWrap180(r.az - r.bearing)) < 1e-6, `${c} +${t}h ${r.c}: ${r.az} vs ${r.bearing}`);
  }
});

test("the flat map's bearing has no free parameter and disagrees by sign, then by more than 90 deg (December, Scott Base)", () => {
  const S = azimState("dec", "sun", 0);
  const sba = S.rows.find((r) => r.c === "SBA"), kono = S.rows.find((r) => r.c === "KONO");
  assert.ok(sba.up, "the Sun is up at Scott Base at the December instant");
  assert.ok(Math.abs(sba.diff) > 150, `SBA disagreement ${sba.diff}`);
  assert.ok(Math.abs(kono.diff) < 6, "least wrong near the map's own centre");
  assert.ok(S.rows.some((r) => r.diff > 0) && S.rows.some((r) => r.diff < 0), "the disagreement changes sign");
});

test("all seven stations are computed at every instant; the error triangle needs three that can see the body", () => {
  const S = azimState("dec", "sun", 0);
  assert.equal(S.rows.length, 7);
  assert.ok(S.tri && S.tri.max > 1000, "December: a triangle thousands of km on a side");
  assert.equal(azimTriangle(S.rows.map((r) => ({ ...r, up: false }))), null);
});

test("the eclipse table: this page vs Espenak's published values, and bearing == azimuth to every printed decimal", () => {
  const e = azimEclipseRows();
  assert.ok(Math.abs(e.alt - AZIM_ECL_PUB.alt) < 0.06);
  assert.ok(Math.abs(e.az - AZIM_ECL_PUB.az) < 0.06);
  assert.ok(Math.abs(e.sunDec - AZIM_ECL_PUB.sunDec) * 3600 < 10, "sun dec within 10 arcsec");
  assert.ok(Math.abs(e.moonDec - AZIM_ECL_PUB.moonDec) * 3600 < 10, "moon dec within 10 arcsec");
  assert.ok(Math.abs(e.bearing - e.az) < 1e-4);
  assert.ok(e.subGapKm < 100, "sub-solar and sub-lunar points under 100 km apart at greatest eclipse");
  assert.ok(Math.abs(e.dT - 75.5) < 0.1 && Math.abs(e.dT - AZIM_ECL_PUB.dT) < 4);
});

test("Moon parallax is radial: about a degree of altitude shift, arcseconds of bearing shift", () => {
  const S = azimState("ecl", "moon", 0);
  for (const r of S.rows) {
    assert.ok(r.mDAlt < 0 && r.mDAlt > -1.05, `${r.c} dAlt ${r.mDAlt}`);
    assert.ok(Math.abs(r.mDAz) * 3600 < 30, `${r.c} dAz ${r.mDAz * 3600} arcsec`);
  }
  assert.ok(S.distR > 55 && S.distR < 64);
});

test("parallax as a ruler: d/R from b/(R sin theta) matches the ephemeris to the documented residues (57.60 / 60.65 / 56.98)", () => {
  const want = { ecl: [57.60, 57.602], jun: [60.65, 60.597], dec: [56.98, 57.193] };
  for (const c of ["ecl", "jun", "dec"]) {
    const S = azimState(c, "moon", 0), p = azimPairFor(S, "moon");
    assert.ok(p, `${c}: a pair exists`);
    assert.ok(Math.abs(p.dR - want[c][0]) < 0.02, `${c} dR ${p.dR}`);
    assert.ok(Math.abs(S.gm.distKM / 6371 - want[c][1]) < 0.02);
    assert.ok(p.th > 1.5 && p.th < 2.1, "the Moon shifts by more than a degree over the baseline");
    const sn = azimPairFor(S, "sun");
    assert.ok(sn && sn.th * 3600 < 20, "the Sun shifts by ~16 arcsec: the negative witness");
  }
});

test("rule, not hand: SUR has the Moon 22 deg below the horizon at the eclipse, so KONO<->SUR is never the pair", () => {
  const S = azimState("ecl", "moon", 0), p = azimPairFor(S, "moon");
  const sur = S.rows.find((r) => r.c === "SUR");
  assert.ok(sur.mAlt < -15);
  assert.ok(p.A.c !== "SUR" && p.B.c !== "SUR");
  assert.deepEqual([p.A.c, p.B.c], ["KONO", "PMSA"]);
});

test("a lamp over a plane is above the horizon from everywhere; the Moon is set at several stations, and the kindest lamp still misses by degrees", () => {
  const S = azimState("ecl", "moon", 0);
  const down = S.rows.filter((r) => !r.mUp).length;
  assert.ok(down >= 2);
  for (const r of S.rows) for (const H of [3000, 5000, 8000]) assert.ok(OBS.flatAltitude(r.lat, r.lon, S.subM.lat, S.subM.lon, H) > 0);
  assert.ok(azimKindestLamp(S).err > 5);
});

test("handedness trap, asserted numerically: a bearing of 90 on the drawing map points along local east = (-ny, nx)", () => {
  const lat = 40, lon = 30;
  const P = twiAE(lat, lon), L = Math.hypot(P.x, P.y);
  const n = { x: -P.x / L, y: -P.y / L };
  const dN = azimMapDir(lat, lon, 0), dE = azimMapDir(lat, lon, 90);
  assert.ok(Math.abs(dN.x - n.x) < 1e-12 && Math.abs(dN.y - n.y) < 1e-12);
  assert.ok(Math.abs(dE.x + n.y) < 1e-12 && Math.abs(dE.y - n.x) < 1e-12);
  // and it agrees with the flat-model azimuth's own east: stepping east on the map increases longitude
  const Q = twiAE(lat, lon + 1);
  assert.ok((Q.x - P.x) * dE.x + (Q.y - P.y) * dE.y > 0);
});

test("clock readout floors seconds and never prints :60", () => {
  assert.equal(azimFromJD(jdFromUTC(2026, 12, 21, 12, 0, 0)), "21 Dec 2026, 12:00:00 UTC");
  assert.equal(azimFromJD(jdFromUTC(2026, 8, 12, 17, 45, 59.9)), "12 Aug 2026, 17:45:59 UTC");
});
