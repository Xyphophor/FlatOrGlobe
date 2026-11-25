import { test } from "node:test";
import assert from "node:assert/strict";
import * as o from "./logic.js";
import { TUNNEL, TUNNEL_SCENES, TUNNEL_DRAW, TUNNEL_EN } from "./tunnel.js";
import { readFileSync as readTun } from "node:fs";
import { SUN_DAYS } from "../../data/presets/orb-sun.js";
import { TAU_CETI } from "../../data/presets/orb-star.js";
import { SDO_RSUN } from "../../data/presets/orb-sdo.js";

test("Bradley et Delambre, 8 min 12 s : 147,5 millions de km, et une aberration de 20,2″", () => {
  const r = o.fromLightTime(492);
  assert.ok(Math.abs(r.a / 1e6 - 147.5) < 0.05 && Math.abs(r.kappa - 20.2) < 0.01);
});

test("HARPS-N : 462 jours, rayon médian tiré de la rotation 6 361,5 km, résidu médian < 1 m/s", () => {
  const rows = o.sunDays(SUN_DAYS), q = o.quartiles(rows.map((r) => r.R));
  assert.equal(rows.length, 462);
  assert.ok(Math.abs(q.med - 6361.5) < 0.5, `${q.med}`);
  assert.ok(o.quartiles(rows.map((r) => r.rms)).med < 1);
});

test("HARPS-N + SDO : K ≈ 494 m/s, e ≈ 0,0167, unité astronomique ≈ 148,6 millions de km", () => {
  const y = o.sunYear(o.sunDays(SUN_DAYS)), e = o.sdoEccentricity(SDO_RSUN);
  assert.ok(Math.abs(y.K - 494.4) < 0.5 && Math.abs(e.e - 0.01671) < 0.0001);
  assert.ok(Math.abs(o.auFromDoppler(y.K, e.e) / 1e6 - 148.55) < 0.05);
});

test("le globe sans paramètre laisse ~1 m/s, le meilleur Soleil plat ~27 m/s", () => {
  const sub = SUN_DAYS.filter((_, i) => i % 10 === 0);
  assert.ok(o.modelCost(sub, (d) => o.globeSunRV(d)) < 1.5);
  const H = o.bestFlatH(sub);
  assert.ok(o.modelCost(sub, (d) => o.flatSunRV(d, H)) > 20);
});

test("τ Ceti : 561 nuits, v ≈ 30,0 km/s, a ≈ 150,7 millions de km", () => {
  const s = o.starYear(TAU_CETI);
  assert.equal(s.n, 561);
  assert.ok(Math.abs(s.v - 30.01) < 0.02 && Math.abs(s.a / 1e6 - 150.74) < 0.05);
});

test("parallaxe de 61 Cygni, 0,314″ : 657 000 unités astronomiques", () => {
  assert.ok(Math.abs(o.parallaxAU(0.314) - 656894) < 1);
});

test("gnomon à Marseille : ombres 0,361 L et 2,326 L -> ε ≈ 23,44°, φ ≈ 43,3°", () => {
  const g = o.gnomon(100, 36.1, 232.6);
  assert.ok(Math.abs(g.eps - 23.44) < 0.05 && Math.abs(g.lat - 43.3) < 0.05, JSON.stringify(g));
});

test("τ Ceti: the Earth's orbit alone, with only the star's mean free, follows the 561 nights", async () => {
  const { orbitRV } = await import("./logic.js");
  const { TAU_CETI } = await import("../../data/presets/orb-star.js");
  const r = TAU_CETI.nights.map(([t, v]) => v / 1000 - orbitRV(t, TAU_CETI.ra, TAU_CETI.dec));
  const m = r.reduce((a, b) => a + b, 0) / r.length, rms = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length);
  assert.ok(rms < 0.3, `rms ${rms} km/s`);                 // 27 km/s d'amplitude, ~0,14 km/s de reste (excentricité négligée)
  assert.ok(Math.abs(m + 16.1) < 0.5, `γ ${m}`);
});

test("Kepler : T²/a³ des huit planètes à 1,5 % près (Saturne et Neptune −1,2 %) ; GM du Soleil 1,327e20, de la Terre ≈ 3,98e14 (Lune et GPS)", () => {
  for (const [n, r] of o.keplerRatios()) assert.ok(Math.abs(r - 1) < 0.015, `${n} ${r}`);
  assert.ok(Math.abs(o.gmFromOrbit(149.598e6, 365.256) / 1.32712e20 - 1) < 2e-4);
  const gps = o.gmFromOrbit(26560, 43082 / 86400), moon = o.gmFromOrbit(384400, 27.3217) / (1 + o.MOON_MASS_RATIO);
  assert.ok(Math.abs(gps / 3.986e14 - 1) < 1e-3, `${gps}`);
  assert.ok(Math.abs(moon / 3.986e14 - 1) < 5e-3, `${moon}`);
});

// la vitrine du tunnel (2026-10-25) : la période et la vitesse au centre sont celles de l'orbite rasante
test("tunnel : 84 min et 7,9 km/s, chaque scène a son dessin et ses textes en/fr", () => {
  assert.ok(Math.abs(TUNNEL.period / 60 - 84.4) < 0.2);
  assert.ok(Math.abs(TUNNEL.vmax / 1000 - 7.91) < 0.02);
  assert.deepEqual(TUNNEL_SCENES.map((s) => s.key).sort(), Object.keys(TUNNEL_DRAW).sort());
  const fr = JSON.parse(readTun(new URL("../../i18n/fr/orb.json", import.meta.url), "utf8"));
  for (const s of TUNNEL_SCENES) for (const k of ["k", "a", "b"]) { assert.ok(TUNNEL_EN[`tun-${s.key}-${k}`]); assert.ok(fr[`tun-${s.key}-${k}`], `fr tun-${s.key}-${k}`); }
});
