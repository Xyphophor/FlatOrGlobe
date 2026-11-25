import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sunEoT, sunDecl, sunGlobeAt, sunGlobeNoon, sunFlatGeom, sunFlatH, flatMinAlt,
  romerCurve, romerLightMin, analemmaPoints, analemmaShape, sunDirG, sunSpeedCurves,
  sunDialPlate, sunDialHour, horizontalDialAngle, SUN_AZ, sunTableRows,
} from "./logic.js";
import { DEG, RAD } from "../../core/math.js";
import { magLat2r } from "../mag/shared.js";

test("NOAA solcalc: declination hits ~+23.4 at the June solstice, ~-23.4 in December, ~0 at the equinox", () => {
  assert.ok(Math.abs(DEG(sunDecl(172)) - 23.4) < 0.15);
  assert.ok(Math.abs(DEG(sunDecl(355)) + 23.4) < 0.15);
  assert.ok(Math.abs(DEG(sunDecl(79))) < 0.8);
});

test("NOAA solcalc: equation of time stays within +/-16.5 min and crosses zero four times a year", () => {
  let mn = 99, mx = -99, crossings = 0, prev = sunEoT(0);
  for (let N = 0; N < 365; N++) {
    const e = sunEoT(N);
    mn = Math.min(mn, e); mx = Math.max(mx, e);
    if (N > 0 && Math.sign(e) !== Math.sign(prev)) crossings++;
    prev = e;
  }
  assert.ok(mx < 16.6 && mx > 15.5, `max EoT ${mx}`);
  assert.ok(mn > -14.8 && mn < -13.8, `min EoT ${mn}`);
  assert.equal(crossings, 4);
});

test("globe CLOCK-noon altitude sits within the equation-of-time margin of 90 - |phi - delta| (legacy: hour angle = EoT at hoff = 0)", () => {
  for (const lat of [-40, 0, 30, 60]) for (const N of [79, 172, 355]) {
    const want = 90 - Math.abs(lat - DEG(sunDecl(N)));
    const got = sunGlobeNoon(lat, N).alt;
    assert.ok(got <= want + 1e-9, "clock noon is never higher than the true solar-noon altitude");
    assert.ok(Math.abs(got - want) < 4.2, `lat ${lat} N ${N}: ${got} vs ${want}`); // EoT max 16.4 min = 4.1 deg of hour angle
  }
  // exactly on the meridian (hoff cancelling the EoT) the almanac formula is exact
  const N = 172, lat = 30;
  assert.ok(Math.abs(sunGlobeAt(lat, N, -sunEoT(N) * 0.25).alt - (90 - Math.abs(lat - DEG(sunDecl(N))))) < 1e-9);
});

test("steel-man: the flat sun height makes the equinox noon altitude EXACT at mid-latitudes", () => {
  for (const lat of [-55, -30, 25, 45, 60]) {
    const hf = sunFlatH(lat);
    assert.equal(hf.cal, "equinox");
    // calibration is done on the meridian; the table reads clock noon (EoT ~ -7 min at the equinox),
    // so the two geometries agree to well under 0.1 deg there -- the "one free hit" of the legacy note.
    const g = sunGlobeNoon(lat, 79).alt, f = sunFlatGeom(lat, 79, hf.h).alt;
    assert.ok(Math.abs(g - f) < 0.2, `lat ${lat}: ${g} vs ${f}`);
    const altMer = 90 - Math.abs(lat - DEG(sunDecl(79)));
    const roEq = Math.abs(magLat2r(lat) - magLat2r(DEG(sunDecl(79))));
    assert.ok(Math.abs(DEG(Math.atan2(hf.h, roEq)) - altMer) < 1e-9, "on the meridian the calibration is exact");
  }
});

test("steel-man: near the equator the equinox case is degenerate, so calibration falls back to the June solstice", () => {
  const hf = sunFlatH(1);
  assert.equal(hf.cal, "June solstice");
  const g = sunGlobeNoon(1, 172).alt, f = sunFlatGeom(1, 172, hf.h).alt;
  assert.ok(Math.abs(g - f) < 0.5, `${g} vs ${f}`);
});

test("the tuned flat sun still misses the solstices: December error 10-16 deg at phi = 45-60, sign flips between June and December", () => {
  for (const lat of [45, 60]) {
    const { rows } = sunTableRows(lat);
    const june = rows.find((r) => r.N === 172), dec = rows.find((r) => r.N === 355);
    assert.ok(Math.abs(dec.err) >= 10 && Math.abs(dec.err) <= 16.5, `lat ${lat} dec err ${dec.err}`);
    assert.ok(june.err < -3, `lat ${lat} june err ${june.err}`);
    assert.ok(Math.sign(june.err) !== Math.sign(dec.err), "flat sun too low in June, too high in December");
  }
});

test("the flat sun never sets: minimum altitude stays strictly positive at every latitude", () => {
  for (let lat = -85; lat <= 85; lat += 5) {
    const hf = sunFlatH(lat);
    assert.ok(flatMinAlt(lat, hf.h) > 0);
    const a = analemmaPoints("flat", lat, 0, hf.h);
    assert.equal(a.below, 0);
  }
});

test("Roemer: light-time swing over one synodic period is ~16.6 min and yields 1 au ~ 149.6 Mkm", () => {
  const c = romerCurve(0);
  assert.ok(Math.abs(c.swing - 16.6) < 0.15, `swing ${c.swing}`);
  assert.ok(Math.abs(c.auMkm - 149.6) < 1.5, `au ${c.auMkm}`);
  assert.equal(c.pts.length, 161);
  assert.ok(romerLightMin(0) > 33 && romerLightMin(0) < 53);
});

test("analemma INVARIANT: the globe 8 is a rigid celestial curve -- PCA axes constant to 0.01 deg across phi and hour", () => {
  // 64.46 x 8.39 are the figures recorded in the legacy header (its harness used 4*sqrt(lambda), i.e. a +/-2 sigma span).
  const ref = analemmaShape(analemmaPoints("globe", 45, 0).pts);
  assert.ok(Math.abs(ref.major - 64.46) < 0.05, `major ${ref.major}`);
  assert.ok(Math.abs(ref.minor - 8.39) < 0.05, `minor ${ref.minor}`);
  for (const lat of [-70, -30, 0, 20, 45, 66, 85]) for (const hr of [-5, -2, 0, 3, 5]) {
    const s = analemmaShape(analemmaPoints("globe", lat, hr).pts);
    assert.ok(Math.abs(s.major - ref.major) < 0.01, `lat ${lat} h ${hr} major ${s.major}`);
    assert.ok(Math.abs(s.minor - ref.minor) < 0.01, `lat ${lat} h ${hr} minor ${s.minor}`);
  }
});

test("analemma contrast: the flat 8 genuinely morphs (about 65x16 at the equator -> about 29x11 at phi = 60)", () => {
  const eq = analemmaShape(analemmaPoints("flat", 0, 0, sunFlatH(0).h).pts);
  const s60 = analemmaShape(analemmaPoints("flat", 60, 0, sunFlatH(60).h).pts);
  assert.ok(eq.major > s60.major + 20, `${eq.major} vs ${s60.major}`);
  assert.ok(Math.abs(eq.major - 65) < 4 && Math.abs(s60.major - 29) < 4);
});

test("analemma projection is a level camera: sky-vertical axis has no east component, axes are orthonormal", () => {
  const a = analemmaPoints("globe", 40, 2);
  assert.ok(Math.abs(a.V[0] * a.m[0] + a.V[1] * a.m[1] + a.V[2] * a.m[2]) < 1e-9, "V perpendicular to the mean sun");
  assert.ok(Math.abs(a.V[0] * a.Hax[0] + a.V[1] * a.Hax[1] + a.V[2] * a.Hax[2]) < 1e-9);
  assert.ok(Math.abs(a.Hax[2]) < 1e-9, "sky-horizontal axis is level (no Up component)");
});

test("globe polar night: beyond ~68 deg the horizon cuts the 8 (days below zero at noon); not at 45", () => {
  assert.ok(analemmaPoints("globe", 75, 0).below > 0);
  assert.equal(analemmaPoints("globe", 45, 0).below, 0);
});

test("daily motion: the equinox globe sun sweeps exactly 15 deg/h, rises due east and sets due west", () => {
  const lat = 48;
  for (let H = -90; H < 90; H += 15) {
    const a = sunDirG(lat, H), b = sunDirG(lat, H + 1);
    const step = DEG(Math.acos(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    assert.ok(Math.abs(step - 1) < 1e-9);
  }
  const rise = sunDirG(lat, -90);
  assert.ok(Math.abs(rise[2]) < 1e-9 && rise[0] > 0.999);
});

test("daily motion: uniform flat sun surges through the day; retuning for A breaks it for B at 10 S", () => {
  const s = sunSpeedCurves(45, sunFlatH(45).h, 360);
  assert.ok(s.uHi / s.uLo > 1.5, "flat uniform spin is not a constant 15 deg/h");
  assert.ok(s.bHi / s.bLo > 1.3, "tuned schedule is wrong for observer B");
  assert.ok(Math.abs(s.tT[s.tT.length - 1] - 12) < 0.2, "tuned time axis still spans 24 h");
});

test("sundial: the horizontal-dial law tan(theta) = sin(phi) tan(H) is reproduced digit for digit by sunDialPlate", () => {
  for (const lat of [65, 35, 51.5, -30]) for (const k of [-4, -3, -1, 1, 2, 4]) {
    const q = sunDialPlate(lat, SUN_AZ + RAD(k * 15));
    assert.ok(q.lit);
    const theta = DEG(Math.atan2(Math.abs(q.ec), Math.abs(q.nc)));
    assert.ok(Math.abs(theta - Math.abs(horizontalDialAngle(lat, k * 15))) < 1e-9, `lat ${lat} k ${k}: ${theta}`);
    assert.ok(Math.sign(q.ec) === (k > 0 ? 1 : -1), "afternoon shadow points east of the substyle");
  }
});

test("sundial: at local noon the shadow lies exactly along the substyle (no east component) and swings monotonically toward E-W", () => {
  const q = sunDialPlate(48, SUN_AZ);
  assert.ok(Math.abs(q.ec) < 1e-12 && q.nc > 0);
  let prev = 0;
  for (let H = 10; H <= 80; H += 10) {
    const e = sunDialPlate(48, SUN_AZ + RAD(H));
    const th = Math.atan2(e.ec, e.nc);
    assert.ok(th > prev, `hour-line angle must grow with H (H=${H})`);
    prev = th;
  }
  // beyond ~88 deg of hour angle at this latitude the plate is no longer lit (su <= 0.03) -- the legacy draws +/-6 h by hand
  assert.equal(sunDialPlate(48, SUN_AZ + RAD(89.9)).lit, false);
});

test("sundial: night side is unlit, southern dials run anticlockwise (opposite sign of nc)", () => {
  assert.equal(sunDialPlate(48, SUN_AZ + Math.PI).lit, false);
  const n = sunDialPlate(35, SUN_AZ + RAD(30)), s = sunDialPlate(-35, SUN_AZ + RAD(30));
  assert.ok(n.lit && s.lit);
  assert.ok(Math.sign(n.nc) !== Math.sign(s.nc));
  assert.equal(Math.sign(n.ec), Math.sign(s.ec));
});

test("sunDialHour wraps the planet's rotation angle to hours from local noon", () => {
  assert.ok(Math.abs(sunDialHour(SUN_AZ)) < 1e-9);
  assert.ok(Math.abs(sunDialHour(SUN_AZ + RAD(45)) - 3) < 1e-9);
  assert.ok(Math.abs(sunDialHour(SUN_AZ - RAD(15)) + 1) < 1e-9);
});

test("sunGlobeAt afternoon hour offsets put the sun west (negative E) in both models", () => {
  assert.ok(sunGlobeAt(45, 100, 45).p[0] < 0);
  assert.ok(sunFlatGeom(45, 100, sunFlatH(45).h, 45).p[0] < 0);
});
