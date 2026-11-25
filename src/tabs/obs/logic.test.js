// Le profil du point de vue « Globe spot », recuit au LiDAR HD de l'IGN
// (research/lidar_horizon.py, 2026-09-24), et le croisement des deux crêtes
// que le générateur calcule avec lui. Ces chiffres sont ceux que la prose
// de l'onglet cite (src/data/prose/obs.js) : s'ils bougent, la prose bouge.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GLOBESPOT } from "../../data/dem/globespot.js";

test("globespot profile: 851 samples from 200° to 285° by 0.1°, three curves", () => {
  assert.equal(GLOBESPOT.flat.length, 851);
  assert.equal(GLOBESPOT.globe.length, 851);
  assert.equal(GLOBESPOT.globeK.length, 851);
  assert.equal(GLOBESPOT.az0 + (851 - 1) * GLOBESPOT.step, 285);
});

test("the crossing: near side below the eye, far side above it, both at one angle on the globe", () => {
  const { globeK: k, globe: g, flat: f } = GLOBESPOT.crossing;
  const eye = GLOBESPOT.eye;
  // prose : az 241.29°, about −5′, near 1,683 m at 16.1 km, far 1,809 m at 54.2 km
  assert.ok(Math.abs(k.az - 241.29) < 0.01, `az ${k.az}`);
  assert.ok(Math.abs(k.alt + 5.3) < 0.1, `alt ${k.alt}`);
  assert.ok(k.nearH < eye && eye - k.nearH > 5, `near ${k.nearH} must sit below the eye`);
  assert.ok(k.farH > eye + 100, `far ${k.farH} must sit well above the eye`);
  // un plan exigerait un œil ~60 m plus bas que le vrai
  assert.ok(eye - k.planeEye > 55 && eye - k.planeEye < 70, `plane eye ${k.planeEye}`);
  assert.ok(eye - g.planeEye > 60, "straight rays make it worse, not better");
  // le plan met son propre croisement ailleurs et plus haut
  assert.ok(f.az - k.az > 0.05 && f.alt > k.alt + 5);
});

test("the far ridge window: plane 7–15′ above eye level, globe within a few arcminutes of it", () => {
  const i0 = Math.round((238.1 - 200) / 0.1), i1 = Math.round((241.2 - 200) / 0.1);
  for (let i = i0; i <= i1; i++) {
    assert.ok(GLOBESPOT.dist[i] > 50, `az ${200 + i * 0.1}: far ridge is the skyline`);
    assert.ok(GLOBESPOT.flat[i] > 7, `plane above eye level at ${200 + i * 0.1}`);
    assert.ok(GLOBESPOT.globeK[i] < 2.5 && GLOBESPOT.globe[i] < 0.6, `globe near level at ${200 + i * 0.1}`);
    assert.ok(GLOBESPOT.flat[i] - GLOBESPOT.globeK[i] > 8, "gap of at least 8′ everywhere in the window");
  }
});
