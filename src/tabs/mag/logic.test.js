import { test } from "node:test";
import assert from "node:assert/strict";
import { globeMag, flatMag, flatShape, flat2Zero, fitFlat2Depth, magTrace2, MAG_B0, MAG_CAL, MAG_D1, MAG_D2, MAG_RKM, MAGCITIES } from "./logic.js";
import { magLat2r, magSgn } from "./shared.js";

test("the radius-free test: globe dip follows tan I = 2 tan lambda at every latitude", () => {
  for (const lat of [10, 27, 45, 64, 80]) {
    const g = globeMag(lat);
    const want = 2 * Math.tan((lat * Math.PI) / 180);
    const got = Math.tan((g.I * Math.PI) / 180);
    assert.ok(Math.abs(got - want) < 1e-9, `tan I should be 2 tan lambda at lambda=${lat}`);
  }
});

test("globe dip is exactly zero at the magnetic equator and +90 at the pole (sign flip, not magnitude)", () => {
  assert.ok(Math.abs(globeMag(0).I) < 1e-9);
  assert.ok(Math.abs(globeMag(90).I - 90) < 1e-9);
  assert.ok(Math.abs(globeMag(-45).I + globeMag(45).I) < 1e-9, "dip is antisymmetric across the equator");
});

test("globe field at the pole is exactly twice the field at the equator (B_pole = 2 B_eq)", () => {
  const eq = globeMag(0), pole = globeMag(90);
  assert.ok(Math.abs(eq.B - MAG_B0) < 1e-9);
  assert.ok(Math.abs(pole.B - 2 * MAG_B0) < 1e-9);
});

test("flat (1) is calibrated (steel-manned) to zero dip on the observed magnetic equator circle; both flats to B0 there", () => {
  // magLat2r(0) = 10,000 km from the pole -- the real magnetic equator's map distance.
  const rEq = magLat2r(0);
  assert.equal(rEq, 10000);
  const f1 = flatMag(1, rEq), f2 = flatMag(2, rEq);
  assert.ok(Math.abs(f1.I) < 1e-6, "flat (1) dip must be zero on the calibrated circle");
  assert.ok(Math.abs(f1.B - MAG_B0) < 1e-6, "flat (1) field must equal B0 on the calibrated circle");
  assert.ok(Math.abs(f2.B - MAG_B0) < 1e-6, "flat (2) field must equal B0 on the calibrated circle");
});

test("flat (2) has zero net magnetic charge (div B = 0): its field decays faster than a monopole's with depth", () => {
  // bury the whole layout 1e6 then 2e6 km down: a net charge would leave B ~ q/d^2 (ratio 4); centre -1 + ring +1 falls faster
  const b1 = flatShape(2, MAG_RKM - 1, { d2: 1e6 }).B, b2 = flatShape(2, MAG_RKM - 1, { d2: 2e6 }).B;
  assert.ok(b1 / b2 > 7, `ratio ${b1 / b2} -- a net charge would give 4`);
});

test("flat (2): no burial depth puts its dip-zero circle closer than ~13,200 km (text: 13,200)", () => {
  let min = Infinity;
  for (const d2 of [1, 10, 100, 500, 1000, 2000, 4000, 8000, 12000, 16000]) { const z = flat2Zero(d2); if (z !== null) min = Math.min(min, z); }
  assert.ok(min > 13100 && min < 13300, String(min));
});

test("flat (2) calibration: depth fitted to the ten cities' dips (~4,100 km), dip-zero circle ~13,600 km (text numbers)", () => {
  assert.equal(MAG_D2, MAG_CAL.d2);
  assert.ok(Math.abs(MAG_D1 - 7100) < 50, String(MAG_D1)); // texte mg-curie : « ① at about 7,100 km, ② at about 4,100 km »
  assert.ok(Math.abs(MAG_D2 - 4100) < 100, String(MAG_D2));
  const pts = MAGCITIES.map((c) => ({ r: magLat2r(c.mlat), I: c.Io }));
  const e = (d2) => Math.sqrt(pts.reduce((s, o) => s + (o.I - flatShape(2, o.r, { d2 }).I) ** 2, 0) / pts.length);
  for (const k of [0.95, 1.05]) assert.ok(e(MAG_D2 * k) >= e(MAG_D2) - 1e-6, `local optimum at ×${k}`);
  assert.ok(Math.abs(fitFlat2Depth(pts).d2 - MAG_D2) < 1);
  assert.ok(Math.abs(flat2Zero(MAG_D2) - 13600) < 100, String(flat2Zero(MAG_D2)));
});

test("documented failure: flat (1) can never dip past about -35.3 degrees anywhere on the disc", () => {
  const rim = flatMag(1, MAG_RKM - 1);
  assert.ok(Math.abs(rim.I + 35.26) < 0.05, "the rim of flat (1) is the most extreme dip it can produce");
  // monotonic worsening away from the calibrated circle towards the rim
  const mid = flatMag(1, (magLat2r(0) + MAG_RKM) / 2);
  assert.ok(mid.I < 0 && mid.I > rim.I, "dip should be between zero and the rim extreme, never past it");
});

test("documented failures of flat (2), as the text states them", () => {
  const at = (name) => { const c = MAGCITIES.find((x) => x.n.startsWith(name)); return flatMag(2, magLat2r(c.mlat)); };
  const r0 = (x) => Math.round(x);
  // wrong sign just south of the real magnetic equator
  assert.equal(r0(at("Singapore").I), 13);
  assert.equal(r0(at("São Paulo").I), 9);
  // shallow far south
  assert.equal(r0(at("Cape Town").I), -1);
  assert.equal(r0(at("Melbourne").I), -9);
  assert.equal(r0(at("Dunedin").I), -12);
  // steepest southern dip on the disc is at the rim, about -69
  let min = 0;
  for (let r = 10000; r < MAG_RKM; r += 100) min = Math.min(min, flatMag(2, r).I);
  min = Math.min(min, flatMag(2, MAG_RKM - 1).I);
  assert.equal(r0(min), -69);
  // Arctic ~190 uT, over three times the 57 measured at Resolute
  const res = at("Resolute").B;
  assert.ok(res > 180 && res < 200 && res / 57 > 3, String(res));
});

test("magLat2r maps pole/equator/antipode to the documented map distances", () => {
  assert.equal(magLat2r(90), 0);
  assert.equal(magLat2r(0), 10000);
  assert.equal(magLat2r(-90), MAG_RKM);
});

test("magSgn formats a signed, rounded degree reading with a typographic minus", () => {
  assert.equal(magSgn(63.4), "+63");
  assert.equal(magSgn(-35.26), "−35");
  assert.equal(magSgn(0), "+0");
});

test("magTrace2 is memoized (pure geometry that never changes) and returns three traced field lines", () => {
  const a = magTrace2();
  const b = magTrace2();
  assert.equal(a, b, "second call must return the exact same cached array");
  assert.equal(a.length, 3);
  for (const line of a) assert.ok(line.length > 1);
});

test("MAGCITIES carries ten measured comparison sites with both hemispheres represented", () => {
  assert.equal(MAGCITIES.length, 10);
  assert.ok(MAGCITIES.some((c) => c.Io > 0));
  assert.ok(MAGCITIES.some((c) => c.Io < 0));
  assert.ok(MAG_CAL.k1 > 0 && MAG_CAL.k2 > 0, "both flat scale factors must be positive");
});
