import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./logic.js";

test("table 1976 : 101 325 Pa au sol, 22 632 Pa à 11 km, 996 K et 2,8e-12 kg/m³ à 400 km", () => {
  assert.ok(Math.abs(L.ussa(0).p - 101320) < 10 && Math.abs(L.ussa(11).p / 22632 - 1) < 0.01);
  const z = L.ussa(400); assert.ok(Math.abs(z.T - 995.8) < 0.1 && Math.abs(z.rho / 2.8028e-12 - 1) < 1e-3 && Math.abs(z.n / 1.0563e14 - 1) < 1e-3);
});

test("hauteur d'échelle ≈ 8,4 km à 288 K ; la pression se divise par e tous les H", () => {
  const H = L.scaleHeight(288.15);
  assert.ok(Math.abs(H - 8434) < 10, `${H}`);
  assert.ok(Math.abs(L.barometric(H, 1, H) - 1 / Math.E) < 1e-12);
});

test("à 400 km : moins d'un mW/m² apporté par le gaz à 1 000 K, ~0,6 W/m² par la vitesse, 1 361 W/m² de Soleil", () => {
  const z = L.ussa(400), net = L.netGasHeat(z.n, z.v, z.T, 300), ram = L.ramHeat(z.rho, 7660);
  assert.ok(net > 0 && net < 1e-3, `${net}`);
  assert.ok(ram > 0.4 && ram < 0.8, `${ram}`);
  const sea = L.netGasHeat(L.ussa(0).n, L.ussa(0).v, 1000, 300);
  assert.ok(sea > 1e7, `même écart de température au niveau de la mer : ${sea}`);
  assert.ok(Math.abs(L.equilibriumT() - 278.6) < 0.5, "sphère noire au Soleil, à la distance de la Terre");
});

test("ionosphère : 9 MHz pour 1e12 électrons/m³ ; un bond ne dépasse pas 3 836 km pour une couche à 300 km", () => {
  assert.ok(Math.abs(L.plasmaFreq(1e12) / 1e6 - 8.98) < 1e-9);
  assert.ok(Math.abs(L.maxHopKm(300) - 3836) < 1, `${L.maxHopKm(300)}`);
  assert.ok(Math.abs(L.hopKm(0, 300) - L.maxHopKm(300)) < 1);
  const fo = L.plasmaFreq(1e12);
  assert.ok(L.reflects(14e6, fo, 10, 300) && !L.reflects(14e6, fo, 70, 300) && !L.reflects(144e6, fo, 5, 300));
});

test("animation de la chaleur : trois chocs à 400 km sur 1 µm² en 100 µs, comme le taux vrai (3,03)", async () => {
  const z = L.ussa(400), rate = L.impactFlux(z.n, z.v) * 1e-12;
  assert.ok(Math.abs(rate * 1e-4 - 3.03) < 0.01);
  let seed = 4; const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const t = []; for (let x = -Math.log(1 - r()) / rate; x < 1e-4; x += -Math.log(1 - r()) / rate) t.push(x);
  assert.deepEqual(t.map((x) => Math.round(x * 1e6)), [9, 43, 70]);
});

test("rayonnement -> énergie -> température : plaque d'alu de 1 m² × 2 mm, orbite de 92,4 min dont 36 min d'ombre, équilibre 331 K", () => {
  const o = L.orbitShadow(400);
  assert.ok(Math.abs(o.T / 60 - 92.41) < 0.02 && Math.abs(o.shadow * o.T / 60 - 36.05) < 0.05, `${o.T / 60} ${o.shadow * o.T / 60}`);
  assert.ok(Math.abs(L.plateC() - 4843.8) < 0.1 && Math.abs(L.plateEq() - 331.1) < 0.5, `${L.plateEq()}`);
  const r = L.plateOrbit(), Ts = r.rows.map((x) => x.T), lo = Math.min(...Ts), hi = Math.max(...Ts);
  assert.ok(hi <= L.plateEq() + 0.1 && Math.abs(lo - 177.2) < 1 && hi - lo > 60, `${lo} ${hi}`);
  assert.ok(Math.abs(Ts[0] - r.rows.at(-1).T) < 1, "régime établi : la fin de l'orbite rejoint son début");
});
