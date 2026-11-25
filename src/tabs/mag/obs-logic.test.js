import { test } from "node:test";
import assert from "node:assert/strict";
import { dipolePole, magLat, geocentric, boxStats, analyse, fitFlat, eccDipole, eccOffset, dipoleB0, obsFromPreset, igrfAt } from "./obs-logic.js";
import { globeMag, flatShape } from "./logic.js";
import { magLat2r } from "./shared.js";
import { MAG_OBS, MAG_OBS_SOURCES } from "../../data/presets/mag-obs.js";
import { MAG_OBS_FIT } from "../../data/presets/mag-obs-fit.js";

const OBS = obsFromPreset(MAG_OBS);

test("IGRF dipole pole sits near 80.6 N 72.7 W in 2020 and drifts north", () => {
  const p = dipolePole(2020);
  assert.ok(Math.abs(p.lat - 80.6) < 0.1 && Math.abs(p.lon + 72.7) < 0.1, JSON.stringify(p));
  assert.ok(dipolePole(2025).lat > p.lat);
});

test("magnetic latitude: +90 at the dipole pole, 0 on its great circle, Paris ~50", () => {
  const p = dipolePole(2020);
  // magLat takes a GEODETIC latitude; invert the geocentric step for the pole itself
  const back = (lc) => (Math.atan(Math.tan((lc * Math.PI) / 180) / (1 - 0.00669437999014)) * 180) / Math.PI;
  assert.ok(Math.abs(magLat(back(p.lat), p.lon, 2020) - 90) < 1e-6);
  assert.ok(Math.abs(geocentric(45) - 44.81) < 0.01);
  assert.ok(Math.abs(magLat(48.85, 2.35, 2020) - 50.2) < 0.2);
});

test("boxStats: quartiles, Tukey whiskers and outliers on a known sample", () => {
  const s = boxStats([1, 2, 3, 4, 5, 6, 7, 8, 100]);
  assert.equal(s.med, 5);
  assert.equal(s.q1, 3);
  assert.equal(s.q3, 7);
  assert.equal(s.hi, 8);
  assert.deepEqual(s.out, [100]);
});

test("dataset: dozens of measured observatories, both hemispheres, all latitudes", () => {
  assert.ok(OBS.length >= 40, `${OBS.length} observatories`);
  const a = analyse(OBS, MAG_OBS_FIT);
  const ml = a.rows.map((o) => o.mlat);
  assert.ok(ml.filter((x) => x < -30).length >= 5, "southern mid/high magnetic latitudes present");
  assert.ok(Math.max(...ml) > 70 && Math.min(...ml) < -60);
  for (const o of OBS) assert.ok(Math.abs(o.I) <= 90 && (o.src !== "obs" || (o.year >= 2015 && [1, 2, 4].includes(o.q))), o.code);
});

test("the stored flat fits are a local optimum for the stored data (regenerate with fit_mag_obs.mjs if not)", () => {
  // a full refit takes minutes on 2,000+ sites; nudging each parameter by ±1 % is enough to catch stale fits
  const rows = analyse(OBS, MAG_OBS_FIT).rows.map((o) => ({ ...o, r: magLat2r(o.mlat) }));
  const rms = (fn) => Math.sqrt(rows.reduce((s, o) => s + (o.I - fn(o)) ** 2, 0) / rows.length);
  const f1 = (d) => rms((o) => flatShape(1, o.r, { d }).I);
  const f2 = (d2) => rms((o) => flatShape(2, o.r, { d2 }).I);
  const { d } = MAG_OBS_FIT.flat1, { d2 } = MAG_OBS_FIT.flat2;
  const e1 = f1(d), e2 = f2(d2);
  assert.ok(Math.abs(e1 - MAG_OBS_FIT.flat1.rms) < 0.01 && Math.abs(e2 - MAG_OBS_FIT.flat2.rms) < 0.01, "stored rms matches the data");
  for (const k of [0.99, 1.01]) {
    assert.ok(f1(d * k) >= e1 - 1e-3, `flat1 d×${k}`);
    assert.ok(f2(d2 * k) >= e2 - 1e-3, `flat2 d2×${k}`);
  }
});

test("off-centre dipole with zero offset is exactly the centred dipole, with IGRF's B0 at the equator", () => {
  for (const o of OBS.slice(0, 40)) {
    const ml = magLat(o.lat, o.lon, o.year), e = eccDipole(o, [0, 0, 0]);
    assert.ok(Math.abs(e.I - globeMag(ml).I) < 1e-6, o.code);
    assert.ok(Math.abs(e.F - (globeMag(ml).B / 30) * dipoleB0(o.year)) < 1e-6, o.code);
  }
});

test("published eccentric dipole (Schmidt method on IGRF-14): ~590 km towards ~23 N 137 E in 2020, nothing fitted", () => {
  const d = eccOffset(2020), r = Math.hypot(...d);
  const lat = (Math.asin(d[2] / r) * 180) / Math.PI, lon = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
  assert.ok(Math.abs(r - 591) < 2 && Math.abs(lat - 22.7) < 0.2 && Math.abs(lon - 137.0) < 0.2, `${r} ${lat} ${lon}`);
  assert.ok(Math.abs(dipoleB0(2020) - 29805) < 5);
});

test("the globe is never fitted: stored fits are flat-only, globe F keeps IGRF's scale", () => {
  assert.deepEqual(Object.keys(MAG_OBS_FIT).sort(), ["flat1", "flat2", "flat2bal"]);
  const a = analyse(OBS, MAG_OBS_FIT);
  assert.equal(a.scale.globe, 1);
  assert.equal(a.scale.globeEcc, 1);
  for (const m of ["flat1", "flat2", "flat1fit", "flat2fit"]) assert.ok(Math.abs(a.statsF[m].med) < 1e-9, m);
});

test("sources: every row belongs to a manifest source, and the per-source counts match", () => {
  const keys = MAG_OBS_SOURCES.map((s) => s.key);
  for (const o of OBS) assert.ok(keys.includes(o.src), o.src);
  for (const s of MAG_OBS_SOURCES) assert.equal(OBS.filter((o) => o.src === s.key).length, s.n, s.key);
});

test("IGRF table is the generated one: 1900 to 2025 every 5 years, 2020 = DGRF-2020 definitive g10", () => {
  assert.ok(Math.abs(igrfAt(2020)[0] + 29403.41) < 1e-9);
  assert.ok(Math.abs(igrfAt(1900)[0] + 31543) < 1);
});

// ---- Chaque affirmation QUALITATIVE du texte de la section (src/data/prose/mag.js,
// blocs mg-obs-*) est gardée ici. Les chiffres, eux, sont insérés par le code
// (obsValues) ; si de nouvelles données rendent une phrase fausse, c'est ici
// que ça casse -- réécrire la phrase, pas le test.
const hemi = (rows, m, north) => boxStats(rows.filter((o) => (o.mlat > 0) === north).map((o) => o.res[m])).med;
const bySource = () => {
  const out = { all: analyse(OBS, MAG_OBS_FIT) };
  for (const s of MAG_OBS_SOURCES) out[s.key] = analyse(OBS.filter((o) => o.src === s.key), MAG_OBS_FIT);
  return out;
};
const A = bySource();

test("text: the centred dipole is centred on zero in both hemispheres; the best flat disc is too shallow in both (all data and every source)", () => {
  for (const [k, a] of Object.entries(A)) {
    assert.ok(Math.abs(hemi(a.rows, "globe", true)) < 4 && Math.abs(hemi(a.rows, "globe", false)) < 4, k);
    assert.ok(hemi(a.rows, "flat2fit", true) > 5 && hemi(a.rows, "flat2fit", false) < -5, k);
    assert.ok(a.stats.globe.within5 > 4 * a.stats.flat2fit.within5, k);
  }
});

test("text: weighting the hemispheres equally only moves the flat miss around (still + north, − south)", () => {
  const p = MAG_OBS_FIT.flat2bal, rows = A.all.rows;
  const res = (north) => boxStats(rows.filter((o) => (o.mlat > 0) === north).map((o) => o.I - flatShape(2, magLat2r(o.mlat), p).I)).med;
  assert.ok(res(true) > 5 && res(false) < -5);
});

test("text: the globe's four worst misses (all data) lie around the South Atlantic", () => {
  const w = [...A.all.rows].sort((a, c) => Math.abs(c.res.globe) - Math.abs(a.res.globe)).slice(0, 4);
  for (const o of w) assert.ok(o.lat > -40 && o.lat < 20 && o.lon > -40 && o.lon < 30, `${o.code} ${o.lat} ${o.lon}`);
});

test("text: the published off-centre dipole does worse than the centred one on inclination", () => {
  assert.ok(A.all.stats.globeEcc.within5 < A.all.stats.globe.within5);
  assert.ok(Math.abs(A.all.stats.globeEcc.med) > Math.abs(A.all.stats.globe.med));
});

test("text: tan I / tan λm has a median close to 2 on all data", () => {
  const r = boxStats(A.all.rows.filter((o) => Math.abs(o.mlat) > 10).map((o) => Math.tan((o.I * Math.PI) / 180) / Math.tan((o.mlat * Math.PI) / 180)));
  assert.ok(Math.abs(r.med - 2) < 0.15, String(r.med));
});

test("text: field strength -- both globes beat the fitted flat disc on every set of sites, and the off-centre dipole's box is narrower (the flat verdict rule is met nowhere)", () => {
  const F = (a, m) => a.statsF[m];
  for (const [k, a] of Object.entries(A)) {
    assert.ok(F(a, "globe").within10 > F(a, "flat2fit").within10 && F(a, "globeEcc").within10 > F(a, "flat2fit").within10, k);
    const iqr = (m) => F(a, m).q3 - F(a, m).q1;
    assert.ok(iqr("flat2fit") > iqr("globeEcc"), `${k}: the published off-centre dipole's F box is narrower than the fitted flat one`);
  }
});

test("text: box figure -- off-centre dipole a few degrees right of zero, calibrated flats tens of degrees off, fitted flat boxes several times wider than the globe's (every source)", () => {
  for (const [k, a] of Object.entries(A)) {
    assert.ok(a.stats.globeEcc.med > 1 && a.stats.globeEcc.med < 8, k);
    assert.ok(a.stats.flat1.med > 10 && a.stats.flat2.med > 10, k);
    for (const m of ["flat1fit", "flat2fit"]) assert.ok(a.stats[m].iqr > 2.5 * a.stats.globe.iqr && Math.abs(a.stats[m].med) > 5, `${k} ${m}`);
  }
});
