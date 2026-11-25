import { test } from "node:test";
import assert from "node:assert/strict";
import * as C from "./cannon-logic.js";

const near = (a, b, tol, m = "") => assert.ok(Math.abs(a - b) <= tol, `${m} ${a} vs ${b} (±${tol})`);

test("GM tiré de l'orbite des GPS : à 0,1 % de la valeur IERS ; vitesse circulaire et période à 400 km", () => {
  near(C.GM / 3.986004418e14, 1, 1e-3);
  near(C.vCirc(), 7670, 10); near(C.period() / 60, 92.4, 0.2);
  assert.ok(C.vMiss() < C.vCirc()); near(C.vMiss(), 7555, 10);
});

test("portée : nulle sans vitesse, croissante, un demi-tour au plus, infinie au-delà", () => {
  assert.equal(C.rangeOf(0), 0);
  let prev = 0; for (let v = 100; v < C.vMiss(); v += 100) { const s = C.rangeOf(v); assert.ok(s > prev, `v=${v}`); prev = s; }
  near(C.rangeOf(C.vMiss() - 1e-6), Math.PI * C.R_EARTH, 2e3);
  assert.equal(C.rangeOf(C.vMiss() + 0.01), Infinity); assert.equal(C.rangeOf(C.vCirc()), Infinity);
});

test("la vitesse trouvée redonne la portée demandée, et le vol intégré retombe au même endroit", () => {
  for (const s of C.RANGES.slice(1)) {
    const v = C.speedFor(s); near(C.rangeOf(v), s, Math.max(1e-3, s * 1e-9), `formule ${s}`);
    const f = C.fly(v); assert.ok(f.landed); near(f.range, s, Math.max(5, s * 2e-5), `intégration ${s}`);
  }
});

test("chute sans vitesse : 400 km en un peu moins de cinq minutes, plus lentement qu'à pesanteur constante au sol", () => {
  const f = C.fly(0); assert.ok(f.landed); near(f.range, 0, 1e-6);
  assert.ok(f.tFlight > C.flatFall() && f.tFlight < 1.06 * C.flatFall(), `${f.tFlight} vs ${C.flatFall()}`);
  // conservation de l'énergie : v² = 2 GM (1/R − 1/r0)
  near(f.vImpact, Math.sqrt(2 * C.GM * (1 / C.R_EARTH - 1 / C.R0)), 0.5);
});

test("orbite circulaire : le boulet intégré garde sa hauteur à 1 m près et revient au canon", () => {
  const f = C.fly(C.vCirc()); assert.ok(!f.landed);
  for (const p of f.pts) near(Math.hypot(p.x, p.y), C.R0, 1);
  const l = f.pts[f.pts.length - 1]; near(l.x, 0, 50); near(l.y, C.R0, 1);
});

test("les huit tirs de l'animation ; sur un plan le même boulet retombe toujours", () => {
  const S = C.shots(); assert.equal(S.length, 8); assert.ok(S[7].orbit);
  for (let i = 1; i < S.length; i++) assert.ok(S[i].v > S[i - 1].v);
  near(S[1].v, 100 / S[0].tFlight, 0.01);              // 100 m : presque la chute verticale
  near(C.flatRange(C.vCirc()) / 1e3, 2190, 30);
});
