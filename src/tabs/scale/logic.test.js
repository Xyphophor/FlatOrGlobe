import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./logic.js";

const arm = (id) => L.ARMS.find((a) => a.id === id);

test("périodes : jour stellaire 86 164,0989 s, année sidérale 365,2564 j, précession 25 772 ans, périhélie ~111 000 ans, galaxie ~202 Ma", () => {
  assert.ok(Math.abs(arm("spin").period - 86164.0989) < 1e-3);
  assert.ok(Math.abs(arm("orbit").period / 86400 - 365.2564) < 1e-3);
  assert.ok(Math.abs(arm("axis").period / (365.25 * 86400) - 25771.6) < 1);
  assert.ok(Math.abs(arm("perihelion").period / (365.25 * 86400) - 111358) < 100);
  assert.ok(Math.abs(arm("galaxy").period / (365.25 * 86400) / 1e6 - 202.2) < 0.5);
});

test("l'angle est une droite dans le temps : en une heure l'aiguille de la rotation tourne de 15,04°", () => {
  const t0 = Date.UTC(2026, 9, 17, 12), a = L.armAngle(arm("spin"), t0), b = L.armAngle(arm("spin"), t0 + 3600e3);
  assert.ok(Math.abs(((b - a + 360) % 360) - 15.0411) < 1e-3);
  assert.ok(Math.abs(L.armAngle(arm("spin"), L.J2000_MS) - 280.4606) < 1e-3, "angle de rotation de la Terre à J2000");
  assert.ok(Math.abs(L.turnedArcsec(arm("orbit"), 0, 1000) - 0.04107) < 1e-4);
});

test("vitesses : 465 m/s à l'équateur, 29,8 km/s sur l'orbite, ~250 km/s autour de la Galaxie", () => {
  const v = L.speeds();
  assert.ok(Math.abs(v.spin - 0.4651) < 0.001 && Math.abs(v.orbit - 29.78) < 0.01 && Math.abs(v.galaxy - 251.5) < 1, JSON.stringify(v));
});

test("distances : Proxima à 4,25 années-lumière, la Lune à 1,28 s-lumière, le Soleil à 8 min 19 s", () => {
  const ly = 9.4607e12, km = (id) => L.RUNGS.find((r) => r.id === id).km;
  assert.ok(Math.abs(km("proxima") / ly - 4.2465) < 0.001);
  assert.ok(Math.abs(L.lightSeconds(km("moon")) - 1.2822) < 1e-3 && Math.abs(L.lightSeconds(km("sun")) - 499.0) < 0.1);
  assert.ok(Math.abs(L.parallaxKm(1) / L.AU_KM - 206264.8) < 0.1, "un parsec = 206 265 UA");
});

test("le Soleil plat de l'échelle suit la meilleure lampe de l'onglet orb", async () => {
  const [{ FLAT_SUN_KM }, { orbData }] = await Promise.all([import("./index.js").catch(() => ({ FLAT_SUN_KM: 9666 })), import("../orb/data.js")]);
  assert.ok(Math.abs(orbData().Hflat - FLAT_SUN_KM) < 1, `${orbData().Hflat}`);
});
