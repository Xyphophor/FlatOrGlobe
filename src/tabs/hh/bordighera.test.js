// Tests de la géométrie Bordighera (bordighera.js) sur les données cuites.
import { test } from "node:test";
import assert from "node:assert/strict";
import { stateAt, photoAlpha, CYCLE, decodeFan, seaTop, hidden, bordNumbers, hiddenFraction, elev, K, R } from "./bordighera.js";
import { BORD_SITE, BORD_BUILDINGS, BORD_FAN } from "../../data/presets/hh-bordighera.js";

test("cycle: plane, globe, globe with refraction, back", () => {
  assert.equal(stateAt(1).c, 0);
  assert.equal(stateAt(6).c, 1);
  assert.ok(Math.abs(stateAt(11).c - (1 - K)) < 1e-12);
  assert.equal(stateAt(CYCLE - 0.01).c < 0.01, true);
});

test("photo: hidden while the model changes, revealed (and blinked) only on the refracted globe", () => {
  for (let t = 0; t < CYCLE; t += 0.05) if (photoAlpha(t, 0.6) > 0) assert.ok(Math.abs(stateAt(t).c - (1 - K)) < 1e-12, `t=${t}`);
  const vals = new Set(); for (let t = 0; t < CYCLE; t += 0.05) vals.add(photoAlpha(t, 0.6));
  assert.ok(vals.has(1) && vals.has(0.6) && vals.has(0));
});

test("plane hides nothing; globe hides tens of metres at 49 km; refraction hides less", () => {
  const N = bordNumbers(BORD_SITE);
  assert.ok(Math.abs(N.e - 41.6) < 1, "the owner's GPS reading (2026-10-14)");
  for (const r of N.rows) {
    assert.equal(r.plane, 0);
    // x = (d − d₀)²/2R : vérification indépendante de hiddenC
    const d0 = Math.sqrt(2 * R * N.e), x = (r.d - d0) ** 2 / (2 * R);
    assert.ok(Math.abs(r.globe - x) < 0.5, `${r.globe} vs ${x}`);
    assert.ok(r.globe > 50 && r.globe < 65);
    assert.ok(r.refr > 38 && r.refr < r.globe);
  }
});

test("fan decodes; coast near 48–49 km on the aim; sea top = horizon on the globe, coast on the plane", () => {
  const F = decodeFan(BORD_FAN);
  assert.equal(F.g.length, F.nAz * F.nD);
  const jc = Math.round(-F.az0 / F.azStep), dc = F.coast[jc];
  assert.ok(dc > 48000 && dc < 49100, `coast ${dc}`);
  const e = BORD_SITE.eye;
  assert.ok(Math.abs(seaTop(1, e, dc) + Math.sqrt(2 * e / R)) < 2e-5);
  assert.ok(Math.abs(seaTop(0, e, dc) - Math.atan2(-e, dc)) < 1e-12);
});

test("named buildings: visible to the foot on the plane, foot hidden on the globe", () => {
  const e = BORD_SITE.eye;
  const named = BORD_BUILDINGS.filter((b) => b.tag);
  assert.ok(named.length >= 3);
  for (const b of named) {
    assert.equal(hiddenFraction(b, 0, e), 0);
    assert.ok(hiddenFraction(b, 1, e) > 0.5, `${b.id} ${hiddenFraction(b, 1, e)}`);
    // le pied, au-dessus de la mer sur le plan
    const [, d, g] = b.v[0];
    assert.ok(elev(0, e, d, g) > seaTop(0, e, d - 300));
  }
});

test("photo: scale from the EXIF, set on each model's horizon; the buildings match k = 0.13 best, the plane worst", async () => {
  const { photoToAngles, photoState } = await import("./bordighera-anim.js");
  const { BORD_PHOTO: P } = await import("../../data/presets/hh-bordighera-photo.js");
  const F = decodeFan(BORD_FAN), e = BORD_SITE.eye;
  assert.ok(Math.abs(P.fov - 0.354) < 0.005, `field ${P.fov}°`);                 // 999,6 mm sur 6,18 mm
  for (const c of [0, 0.3, 0.87, 1]) {
    const [az, el] = photoToAngles(P.w / 2, P.horizon, c, F);
    assert.equal(az, P.az);
    assert.ok(Math.abs(el - photoState(c, F).elH) < 1e-12, `c=${c}: the photo's sea line is the model's sea top`);
  }
  // le plan : le bord de mer de la photo est sa ligne de côte
  assert.ok(Math.abs(photoState(0, F).elH - Math.atan2(-e, 48600)) < 0.15e-3);
  const sc = Object.fromEntries(P.states.map((x) => [x.c, x.score]));
  // œil au GPS (41,6 m) : la correspondance des bâtiments ne départage plus les réfractions du globe (0,03-0,04),
  // le plan reste le plus bas
  assert.ok(Math.min(sc[0.5], sc[0.75], sc[0.87], sc[1]) > 1.5 * sc[0], JSON.stringify(sc));
  // le toit de la Villa au-dessus de l'eau : ~11 m, k du jour entre 0,05 et 0,13
  assert.ok(P.meas.vrm.m > 8 && P.meas.vrm.m < 14 && P.meas.vrm.k > 0.05 && P.meas.vrm.k < 0.13, JSON.stringify(P.meas.vrm));
});
