import test from "node:test";
import assert from "node:assert/strict";
import { dipGlobe, dipPlane, radiusFrom, tangentDist, pointNumbers, sightline, R0 } from "./logic.js";
import { FD_POINTS, FD_FITS, FD_ALTS } from "../../../data/presets/contrib-flightdip.js";

const near = (a, b, tol, m) => assert.ok(Math.abs(a - b) <= tol, `${m ?? ""} ${a} vs ${b}`);

test("dip on a sphere and back; the plane has none", () => {
  near(dipGlobe(8654), 2.986, 0.002, "8.65 km");
  near(radiusFrom(8654, dipGlobe(8654)) / 1000, 6371, 0.5);
  assert.equal(dipPlane(9000), 0);
  near(dipPlane(1000, 100e3), Math.atan(0.01) * 180 / Math.PI, 1e-12);
  near(tangentDist(8654) / 1000, 332, 1);
});

test("the eleven photographs: dips from 1 to 3.5°, heights from the transponder, the phone's GPS frozen on flight 2", () => {
  assert.equal(FD_POINTS.length, 11);
  for (const p of FD_POINTS) {
    assert.ok(p.dip >= 1 && p.dip <= 3.6);
    const n = pointNumbers(p);
    assert.ok(n.he > 0 && n.flatD > 0);
    // the day's air raises the globe's horizon (k between 0.1 and 0.2) and lifts an unbounded plane's above level
    assert.ok(p.globeDipA < p.globeDip && p.kEff > 0.1 && p.kEff < 0.2, p.file);
    assert.ok(p.flatEsc > 0.5 && p.flatEsc < 1.5, p.file);
    if (p.flight === 1) assert.ok(Math.abs(p.gpsLag) < 5 && Math.abs(p.hGps - p.h) < 60, `${p.file}: GPS live, heights agree`);
    else assert.ok(p.gpsLag > 120, `${p.file}: GPS frozen`);
  }
  const p32 = FD_POINTS.find((p) => p.ft === 32173);
  assert.ok(p32.h < 6500 && p32.hGps > 9700, "the 32,173 ft screenshot was taken lower down");
});

test("the fits: below 6,371 km at face value, compatible with it once a constant offset is free; the plane's steel-man fits nearly as well", () => {
  const f = (n) => FD_FITS.find((x) => x.name === n), a = (n) => FD_ALTS.find((x) => x.name === n);
  const face = f("screen, no refraction"), air = f("screen, air of the day"), off = f("screen, air of the day, accelerations removed, constant offset");
  assert.ok(face.hi < 6371, JSON.stringify(face));
  assert.ok(air.R < face.R, "real air makes the readings look deeper still");
  assert.ok(off.lo < 6371 && off.hi > 6371, JSON.stringify(off));
  const plane = a("plane, haze edge, air of the day, accelerations removed, constant offset"), globe = a("globe, R = 6,371 km, air of the day, accelerations removed, constant offset");
  assert.ok(Math.abs(plane.rms - globe.rms) < 0.15, "this data alone does not separate √h from h");
  assert.ok(plane.b > 2 * globe.b, "but the plane needs a much larger zero error");
});

test("sightlines touch the shrunk circle when the dip is the sphere's", () => {
  const ex = 30, h = 5000, s = sightline(h, dipGlobe(h), ex), Rd = R0 / ex;
  // distance from the circle's centre (0, −Rd) to the line y = y0 + slope·x equals Rd to first order
  const dist = Math.abs(s.y0 + Rd) / Math.hypot(1, s.slope);
  near(dist / Rd, 1, 2e-3);
});
