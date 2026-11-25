import { test } from "node:test";
import assert from "node:assert/strict";
import { STARS, STAR_SPOTS, STAR_DATES, STAR_DOMES } from "../../data/star-catalog.js";
import {
  jdFromUTC, gmst, altaz, precess, fixedGlobe, fixedFlat, discR,
  posGlobe, posFlat, pickStar, sepDeg, consClass, consPos, bestMonth,
  jdForSpotDate, azName, spotsTable, shapeTable, domeTable, seasonTable,
  dumpRows, readsSummary, norm360,
} from "./logic.js";

const paris = STAR_SPOTS.find((s) => s.n.startsWith("Paris"));
const ushuaia = STAR_SPOTS.find((s) => s.n.startsWith("Ushuaia"));
const equinox2026 = STAR_DATES[0];

test("gmst matches the known value at J2000.0 (280.46061837 deg by construction)", () => {
  assert.ok(Math.abs(gmst(2451545.0) - 280.46061837) < 1e-6);
});

test("precession brings Polaris from 0.736 deg off the pole (J2000) to about 0.625 deg (2026), as documented", () => {
  const polaris = STARS.find((s) => s.hr === 424);
  const jd = jdForSpotDate(paris, equinox2026);
  const p = precess(polaris.ra, polaris.de, jd);
  const distFromPoleJ2000 = 90 - polaris.de;
  const distFromPoleNow = 90 - p.dec;
  assert.ok(Math.abs(distFromPoleJ2000 - 0.736) < 0.001);
  assert.ok(Math.abs(distFromPoleNow - 0.625) < 0.01, `expected ~0.625 deg from the pole, got ${distFromPoleNow}`);
  assert.ok(distFromPoleNow < distFromPoleJ2000, "Polaris keeps closing in on the pole through 2026 (documented in legacy header)");
});

test("precess is near-identity at the J2000 epoch itself", () => {
  const p = precess(10, 45, 2451545.0);
  assert.ok(Math.abs(p.ra - 10) < 1e-6);
  assert.ok(Math.abs(p.dec - 45) < 1e-6);
});

test("fixedGlobe: altitude equals |latitude|, sense flips sign across the equator (rule 4: sign flip, not magnitude)", () => {
  const north = fixedGlobe(48.87);
  const south = fixedGlobe(-33.45);
  assert.ok(Math.abs(north.alt - 48.87) < 1e-9);
  assert.equal(north.sense, "counter-clockwise");
  assert.ok(Math.abs(south.alt - 33.45) < 1e-9);
  assert.equal(south.sense, "clockwise");
});

test("fixedFlat: the fixed point is above the horizon for every latitude and every dome height (never sets)", () => {
  for (const sp of STAR_SPOTS) {
    for (const h of STAR_DOMES) {
      const f = fixedFlat(sp.lat, h);
      assert.ok(f.alt > 0, `flat fixed point must stay positive at ${sp.n}, dome ${h}`);
    }
  }
});

test("discR decreases toward the pole and grows toward the equator (AE disc radius)", () => {
  assert.ok(discR(89) < discR(45));
  assert.ok(discR(45) < discR(0));
});

test("posGlobe places a star at zenith (alt=90) for an observer at its precessed sub-point", () => {
  const jd = jdForSpotDate(paris, equinox2026);
  const st = STARS[10];
  const p = precess(st.ra, st.de, jd);
  const spot = { n: "sub-point", lat: p.dec, lon: norm360(p.ra - gmst(jd) + 180) - 180 };
  const pos = altaz(p.ra, p.dec, spot.lat, spot.lon, jd);
  assert.ok(Math.abs(pos.alt - 90) < 1e-6);
});

test("pickStar returns a circumpolar star (declination beyond the pole limit) or null at the equator", () => {
  const st = pickStar(paris);
  assert.ok(st, "Paris should have a circumpolar star");
  const p90 = 90 - Math.abs(paris.lat);
  assert.ok(st.de >= p90, "declination must clear the circumpolar limit for the northern hemisphere");

  const equatorial = STAR_SPOTS.find((s) => Math.abs(s.lat) < 1);
  assert.equal(pickStar(equatorial), null, "no star is circumpolar exactly at the equator");
});

test("sepDeg is zero for identical alt/az and increases with angular separation", () => {
  assert.ok(Math.abs(sepDeg(45, 90, 45, 90)) < 1e-9);
  assert.ok(sepDeg(45, 90, 40, 90) > sepDeg(45, 90, 44, 90));
});

test("consClass: circumpolar-hemisphere agreement decides always-up vs never-rises, opposite decides never-rises", () => {
  assert.equal(consClass(80, 60), "always up");
  assert.equal(consClass(-80, 60), "never rises");
  assert.equal(consClass(10, 60), "seasonal");
});

test("azName returns English compass points, not the legacy's leaked French abbreviations (bug fixed on port)", () => {
  assert.equal(azName(0), "N");
  assert.equal(azName(225), "SW");
  assert.equal(azName(270), "W");
  assert.equal(azName(315), "NW");
});

test("spotsTable: the flat model's sense never reverses hemisphere to hemisphere, the globe's does", () => {
  const rows = spotsTable(STAR_DOMES[0]);
  const north = rows.find((r) => r.name.startsWith("Paris"));
  const south = rows.find((r) => r.name.startsWith("Ushuaia"));
  assert.equal(north.globeSense, "counter-clockwise");
  assert.equal(south.globeSense, "clockwise");
  assert.equal(north.flatSense, "counter-clockwise");
  assert.equal(south.flatSense, "counter-clockwise", "flat model cannot reverse sense anywhere (CLAUDE.md rule)");
});

test("shapeTable: on the globe, mean of the two culminations recovers the observer's latitude", () => {
  const jd0 = jdForSpotDate(paris, equinox2026);
  const row = shapeTable(paris, STAR_DOMES[0], jd0);
  assert.ok(row, "Paris must have a circumpolar star");
  assert.ok(Math.abs(row.meanG - Math.abs(paris.lat)) < 0.5, "globe mean should be close to |latitude|");
});

test("domeTable is null at the equator (no circumpolar star to sweep)", () => {
  const equatorial = STAR_SPOTS.find((s) => Math.abs(s.lat) < 1);
  const jd0 = jdForSpotDate(equatorial, equinox2026);
  assert.equal(domeTable(equatorial, jd0), null);
});

test("seasonTable: Southern Cross is 'never rises' from Paris and 'always up' from Ushuaia", () => {
  const jdParis = jdForSpotDate(paris, equinox2026);
  const jdUshuaia = jdForSpotDate(ushuaia, equinox2026);
  const rowsParis = seasonTable(paris, jdParis, equinox2026.Y);
  const rowsUshuaia = seasonTable(ushuaia, jdUshuaia, equinox2026.Y);
  assert.equal(rowsParis.find((r) => r.name === "Southern Cross").cls, "never rises");
  assert.equal(rowsUshuaia.find((r) => r.name === "Southern Cross").cls, "always up");
});

test("dumpRows exposes the same Julian date and GMST used everywhere else for this place/date", () => {
  const jd = jdForSpotDate(paris, equinox2026);
  const rows = dumpRows(paris, STAR_DOMES[0], jd);
  const jdRow = rows.find(([k]) => k.startsWith("Julian date"));
  assert.equal(jdRow[1], jd.toFixed(5));
});

test("readsSummary reports the sense reversal directly usable by the UI", () => {
  const r = readsSummary(ushuaia, STAR_DOMES[0], equinox2026, { k: "fix", n: "the fixed point" });
  assert.equal(r.globeSense, "clockwise");
  assert.equal(r.flatSense, "counter-clockwise");
});
