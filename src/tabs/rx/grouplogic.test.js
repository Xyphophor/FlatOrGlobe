import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeCode, decodeCode, groupFit, bulge, roundXyz, cleanName } from "./grouplogic.js";
import { ecef } from "./userlogic.js";

test("code: round trip, rounding to the chosen step, checksum catches a typo", () => {
  const x = [4201234.6, 168765.4, 4780123.9];
  const code = encodeCode({ name: "Ana|B<script>", date: "2026-10-02", x, step: 1000, rms: 6.34, n: 25, systems: ["G", "E"] });
  assert.ok(code.startsWith("FOG1|AnaBscript|20261002|1000|4201|169|4780|63|25|GE|"));
  const d = decodeCode(code);
  assert.deepEqual(d.x, roundXyz(x, 1000));
  assert.equal(d.date, "2026-10-02"); assert.equal(d.rms, 6.3); assert.equal(d.n, 25);
  assert.throws(() => decodeCode(code.replace("|4201|", "|4202|")), /checksum/);
  assert.throws(() => decodeCode("hello"), /format/);
  assert.equal(cleanName("  Zoé-12 "), "Zoé-12");
});

// villes à quelques milliers de km les unes des autres, sur l'ellipsoïde (aplatissement compris), altitudes réelles approchées
const CITIES = [[48.86, 2.35, 35], [40.42, -3.70, 650], [52.52, 13.40, 34], [41.90, 12.50, 20], [59.91, 10.75, 10], [38.72, -9.14, 50], [50.08, 14.43, 200], [37.98, 23.73, 70]];

test("group over Europe, positions rounded to 1 km: the local radius of curvature, and the plane far behind", () => {
  const parts = CITIES.map(([la, lo, h]) => ({ x: roundXyz(ecef(la, lo, h), 1000), step: 1000 }));
  const G = groupFit(parts);
  assert.ok(G.R > 6335e3 && G.R < 6420e3, `R ${G.R}`);              // entre rayons de courbure méridien et transverse
  assert.ok(G.sigmaR > 1e3 && G.sigmaR < 60e3, `σ ${G.sigmaR}`);
  assert.ok(G.planeRms > 20 * G.rms, `plane ${G.planeRms} vs sphere ${G.rms}`);
  assert.ok(G.spanKm > 2500 && G.sagKm > 100);
  const B = bulge(parts, G);
  for (const p of B.pts) assert.ok(Math.abs(p.y - B.curve(p.rho)) < 5, `${p.y} vs ${B.curve(p.rho)}`);
});

test("too few or coarse points: no fit below 4, larger uncertainty at 10 km", () => {
  assert.equal(groupFit(CITIES.slice(0, 3).map(([la, lo, h]) => ({ x: ecef(la, lo, h), step: 1 }))), null);
  const fine = groupFit(CITIES.map(([la, lo, h]) => ({ x: roundXyz(ecef(la, lo, h), 1000), step: 1000 })));
  const coarse = groupFit(CITIES.map(([la, lo, h]) => ({ x: roundXyz(ecef(la, lo, h), 10000), step: 10000 })));
  assert.ok(coarse.noise > 5 * fine.noise);
});
