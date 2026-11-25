import { test } from "node:test";
import assert from "node:assert/strict";
import { bestFitSun, angSize, gapAngle, acuityDistance, pinhole, vanishing, flatElevation, flatSunAngDiam, flatSunDiameter, flatDistanceFor, SUN_DIAM_DEG,
  FLAT_D_MAX, RAYS, sunDir, nearSun, groundHit, patchScale, angleBetween, hiddenHeight, horizonDist, sinkDistance, perspValues } from "./logic.js";
import { camera } from "./persp3d.js";
import { SOURCES } from "../../data/sources/persp.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("l'angle vu : moitié quand la distance double, jamais nul", () => {
  near(angSize(1, 1000) * 60, 3.4377, 1e-3);
  near(angSize(1, 2000) / angSize(1, 1000), 0.5, 1e-6);
  assert.ok(angSize(1, 1e12) > 0);
  near(acuityDistance(1), 3437.7, 0.1);
  assert.ok(gapAngle(1e6) > 0);
});

test("sténopé et point de fuite : la limite de f (X0 + t a)/(Z0 + t c) ne dépend pas du départ", () => {
  const f = 500, dir = [0.3, -0.2, 1], v = vanishing(...dir, f);
  for (const start of [[0, 0, 1], [5, -3, 2], [-40, 10, 7]]) {
    const t = 1e9, p = pinhole(start[0] + t * dir[0], start[1] + t * dir[1], start[2] + t * dir[2], f);
    near(p[0], v[0], 1e-3); near(p[1], v[1], 1e-3);
  }
  assert.equal(vanishing(1, 0, 0, f), null);   // parallèle au tableau : pas de point de fuite
});

test("le Soleil plat ne descend jamais sous 14° à 20 000 km, et rapetisse", () => {
  near(flatElevation(FLAT_D_MAX), 14.04, 0.01);
  near(flatSunAngDiam(0), SUN_DIAM_DEG, 1e-9);
  near(SUN_DIAM_DEG / flatSunAngDiam(FLAT_D_MAX), 4.12, 0.01);
  near(flatSunDiameter(), 46.5, 0.1);
  near(flatDistanceFor(0.5) / 1000, 572.9, 0.1);
  for (const h of [100, 4828, 5500, 1e5]) assert.ok(flatElevation(1e6, h) > 0, `h = ${h}`);
});

test("rayons lointains : tous parallèles, taches = trous déplacés", () => {
  const s = sunDir(), h = RAYS.holes[0], a = [h[0], RAYS.cloud, h[1]], g = groundHit(a);
  near(g[1], 0, 1e-12);
  const d = [a[0] - g[0], a[1] - g[1], a[2] - g[2]], n = Math.hypot(...d);
  for (let i = 0; i < 3; i++) near(d[i] / n, s[i], 1e-12);
  near(patchScale(false), 1, 0);
  near(patchScale(true), 4.37, 0.01);
});

test("le Soleil proche est sur la même ligne de visée, et chaque rayon reste dans le même plan (œil, trou, Soleil)", () => {
  const P = nearSun(), eye = [0, RAYS.eye, 0], s = sunDir();
  near(angleBetween([P[0], P[1] - RAYS.eye, P[2]], s), 0, 1e-6);
  for (const h of RAYS.holes) {
    const c = [h[0], RAYS.cloud, h[1]], g = groundHit(c, true), gf = groundHit(c, false);
    const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], cr = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const nrm = cr(s, sub(c, eye)), dotp = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], L = Math.hypot(...nrm);
    near(dotp(nrm, sub(g, eye)) / L, 0, 1e-9, "proche");
    near(dotp(nrm, sub(gf, eye)) / L, 0, 1e-9, "lointain");
  }
});

test("de profil, des droites parallèles au tableau restent parallèles à l'image", () => {
  const cam = camera({ pos: [0, RAYS.eye, 0], yaw: Math.PI / 2, f: 400, cx: 0, cy: 0 }), s = sunDir();
  const slopes = RAYS.holes.map((h) => { const a = [h[0], RAYS.cloud, h[1]], b = groundHit(a); const p = cam.pt(a), q = cam.pt(b); return p && q ? (q[1] - p[1]) / (q[0] - p[0]) : null; }).filter((x) => x != null);
  assert.ok(slopes.length >= 3);
  for (const k of slopes) near(k, slopes[0], 1e-9);
  near(Math.abs(Math.atan(slopes[0])) * 180 / Math.PI, RAYS.elev, 1e-6);
  void s;
});

test("hauteur cachée et réfraction (règle 3)", () => {
  near(horizonDist(0.002), 5.048, 0.001);
  near(hiddenHeight(15, 0.002) * 1000, 7.77, 0.01);
  assert.ok(hiddenHeight(15, 0.002, 0.13) < hiddenHeight(15, 0.002));
  assert.equal(hiddenHeight(3, 0.002), 0);
  near(sinkDistance(), 21.01, 0.01);
});

test("valeurs affichées et sources", () => {
  const v = perspValues("en");
  for (const k of ["gap1k", "alphaMin", "deltaRatio", "nearD", "patchK", "sink", "sinkK"]) assert.ok(v[k], k);
  assert.equal(v.alphaMin, "14.0");
  assert.equal(SOURCES.length, 9);
});

test("le meilleur ajustement de l'éventail : un Soleil sur la visée, juste au-dessus des nuages, ajustement parfait", () => {
  const F = bestFitSun();
  assert.equal(F.n, 8);
  assert.ok(F.rms < 1e-9);
  near(F.P[1] - RAYS.cloud, 0.594, 0.001);
  near(Math.hypot(F.P[0], F.P[1] - RAYS.eye, F.P[2]), 10.02, 0.01);
  near(angleBetween([F.P[0], F.P[1] - RAYS.eye, F.P[2]], sunDir()), 0, 1e-6);
  // supposer l'éventail plus loin le met ailleurs sur la même visée : l'ajustement ne mesure aucune distance
  const far = bestFitSun({ ...RAYS, holes: RAYS.holes.map((h) => h[0] > 6 ? [h[0] + 5, h[1]] : h) });
  near(angleBetween([far.P[0], far.P[1] - RAYS.eye, far.P[2]], sunDir()), 0, 1e-6);
  assert.ok(far.P[0] > F.P[0] + 4);
});
