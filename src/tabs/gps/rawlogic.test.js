// Tests du panneau « GPS bruts » (epic16/UC03) : node --test src/tabs/gps/rawlogic.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { fitSphere, fitPlane, earthFromStations, crossVisibility, geocentricLat, sharedSky, separationDeg } from "./rawlogic.js";
import { GPS_RAW } from "../../data/presets/gps-raw.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b} (±${tol})`);

// points sur une sphère de centre et de rayon connus (sans bruit)
const sph = (c, R, n = 40) => Array.from({ length: n }, (_, i) => {
  const u = Math.acos(1 - 2 * ((i + 0.5) / n)), v = i * 2.399963;
  return [c[0] + R * Math.sin(u) * Math.cos(v), c[1] + R * Math.sin(u) * Math.sin(v), c[2] + R * Math.cos(u)];
});

test("fitSphere retrouve centre et rayon exacts, rms nul", () => {
  const F = fitSphere(sph([1200, -3400, 560], 6371000));
  near(F.R, 6371000, 1e-3); near(F.c[0], 1200, 1e-3); near(F.c[1], -3400, 1e-3); near(F.c[2], 560, 1e-3); near(F.rms, 0, 1e-3);
});

test("fitPlane : des points d'un plan donnent rms 0 ; une sphère entière laisse ~R/√3", () => {
  const pts = Array.from({ length: 30 }, (_, i) => [i * 1000, (i * 7919) % 5000, 0.3 * i * 1000 + 0.2 * ((i * 7919) % 5000)]);
  near(fitPlane(pts).rms, 0, 1e-3);
  near(fitPlane(sph([0, 0, 0], 6371000)).rms, 6371000 / Math.sqrt(3), 6371000 * 0.02);
});

test("crossVisibility : bins communs, exclusifs, part des bins identiques", () => {
  const A = { seen: { 0: [1, 2, 3], 1: [1, 2] } }, B = { seen: { 0: [2, 3, 4], 1: [1, 2] } };
  const V = crossVisibility(A, B, 4);
  assert.equal(V.n, 2); near(V.same, 0.5, 1e-9); near(V.common, 2, 1e-9); near(V.onlyA, 0.5, 1e-9); near(V.onlyB, 0.5, 1e-9);
  assert.deepEqual(V.rows.find((r) => r.prn === 4).b, [0]);
  assert.deepEqual(V.rows.find((r) => r.prn === 1).both, [1]);
});

test("données cuites : stations résolues seules, ~1 m de résidu, rayon ~6 371 km, plan très loin, ciel différent", () => {
  const S = GPS_RAW.stations;
  assert.ok(S.length >= 20, `${S.length} stations`);
  for (const s of S) { const r = Math.hypot(...s.xyz); assert.ok(r > 6.35e6 && r < 6.40e6, `${s.id} ${r}`); assert.ok(s.n >= 200, `${s.id} fixes ${s.n}`); }
  assert.ok(GPS_RAW.resid.rms < 3 && GPS_RAW.resid.p95 < 6, JSON.stringify(GPS_RAW.resid));
  const E = earthFromStations(S);
  near(E.R / 1000, 6371, 15, "R km"); assert.ok(E.seR > 0 && E.seR < 5000);
  assert.ok(E.centre < 15000, `centre ${E.centre} m`);
  assert.ok(E.plane.rms > 100 * E.rms, "le plan est bien pire que la sphère");
  near(E.delta, 21.4, 6, "aplatissement lu dans les résidus (km)");
  // couverture : les deux hémisphères et tous les méridiens
  const lats = S.map((s) => geocentricLat(s.xyz));
  assert.ok(Math.min(...lats) < -30 && Math.max(...lats) > 50);
});

test("ciel partagé : aucune paire de stations ne partage un satellite au-delà de la limite géométrique 2·acos(R/a) ≈ 152°", () => {
  const S = GPS_RAW.stations, E = earthFromStations(S), X = sharedSky(S, E.R);
  assert.equal(X.pairs.length, S.length * (S.length - 1) / 2);
  near(X.limit, 152, 1);
  assert.ok(X.maxShared < X.limit, `maxShared ${X.maxShared} limit ${X.limit}`);
  assert.ok(X.maxShared > 90, "des paires lointaines partagent bien un satellite");
  assert.ok(X.minDisjoint > 100, `minDisjoint ${X.minDisjoint}`);
  near(separationDeg([1, 0, 0], [0, 1, 0]), 90, 1e-9);
});
