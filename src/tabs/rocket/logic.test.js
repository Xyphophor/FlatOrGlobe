import { test } from "node:test";
import assert from "node:assert/strict";
import { rs25, RS25, deltaV, massRatio, pellets, thrust, fill, rocketValues, ORBIT_V } from "./logic.js";
import { boxGas, holeGas, rocketGas, freeFlight, P0, P_AIR, RATE, FREE } from "./scenes.js";
import { ROCKET, press2d, flux2d } from "./balls.js";
import { PROSE } from "../../data/prose/rocket.js";
import { SOURCES } from "../../data/sources/rocket.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("RS-25 : la différence vide − sol est pₐ × aire de sortie (à 1,5 %)", () => {
  const r = rs25();
  near(r.fVac / 1e3, 2278.8, 0.5, "vide"); near(r.fSl / 1e3, 1851.8, 0.5, "sol");
  assert.ok(Math.abs(r.paAe / r.diff - 1) < 0.015, `${r.paAe} vs ${r.diff}`);
  near(r.dFromDiff, RS25.exitD, 0.03, "diamètre déduit de la différence");
});

test("RS-25 : poussée = débit × vitesse d'éjection effective, dans le vide et au sol", () => {
  const r = rs25();
  assert.ok(Math.abs(r.mdotIsp / RS25.mdot - 1) < 0.01, `débit ${r.mdotIsp}`);
  assert.ok(Math.abs((RS25.mdot * r.cSl) / r.fSl - 1) < 0.01, "au sol");
  // l'équation de la poussée : seul pₐ Aₑ change entre le vide et le sol
  const base = { mdot: 500, ve: 4000, pe: 8000, Ae: 4 };
  near(thrust({ ...base, pa: 0 }) - thrust({ ...base, pa: 101325 }), 101325 * 4, 1e-6);
});

test("Tsiolkovski : 48 jets exacts approchent u ln(m₀/m₁) ; la limite continue le redonne", () => {
  near(deltaV(1, 4, 1), Math.log(4), 1e-12);
  near(massRatio(deltaV(3, 7, 2), 3), 3.5, 1e-12);
  const fine = pellets(1, 0.75 / 1e5, 1, 1e5);
  near(fine.v, Math.log(4), 3e-5, "limite continue");
  const coarse = pellets(1, 0.75 / 48, 1, 48);
  assert.ok(coarse.v < Math.log(4) && coarse.v > Math.log(4) * 0.97, `48 jets : ${coarse.v}`);
  near(massRatio(ORBIT_V, rs25().cVac), 5.94, 0.01, "orbite basse");
});

test("dans l'espace, le centre de masse de la fusée et des boulettes ne bouge pas", () => {
  const at = freeFlight();
  for (const t of [0, 1.3, 4.5, 8.9, 12]) near(at(t).com, 0, 1e-12, `t = ${t}`);
  near(at(15).v, at(14).v, 0, "vol libre après la poussée");
  assert.equal(at(15).k, FREE.K);
});

test("remplissage : N(t) = Ṅ τ (1 − e^(−t/τ))", () => {
  near(fill(1e9, 60, 5), 300, 1e-9); near(fill(5, 60, 5), 300 * (1 - Math.exp(-1)), 1e-9);
});

test("boîte fermée : chaque paroi reçoit P₀ = N σ², la somme est nulle (moyenne sur 10 s)", () => {
  const g = boxGas().at(12);
  let sx = 0, sy = 0;
  for (const q of ["top", "bottom", "left", "right"]) { const F = g.force(q, 10); sx += F.x; sy += F.y; near(Math.hypot(F.x, F.y) / P0, 1, 0.06, q); }
  assert.ok(Math.hypot(sx, sy) / P0 < 0.06, `somme ${Math.hypot(sx, sy)}`);
});

test("boîte chauffée : vitesses × √2, pression × 2", () => {
  const g = boxGas({ heatAt: 6 }).at(16);
  near(g.force("right", 9).x / P0, 2, 0.12);
});

test("boîte trouée : le coup reçu par la boîte égale l'opposé de ce que portent les billes (exact)", () => {
  const g = holeGas().at(10), L = g.ledger();
  near(L.body.y + L.gas.y + L.gone.y, 0, 1e-8);
  assert.ok(L.body.y > 100, `coup vers le haut ${L.body.y}`);
});

test("fusée dans le vide : bilan exact, poussée = quantité de mouvement du jet (moyenne 18 s)", () => {
  const g = rocketGas({ prefill: true }).at(20), L = g.ledger();
  near(L.body.x + L.gas.x + L.gone.x, 0, 1e-8, "x"); near(L.body.y + L.gas.y + L.gone.y, 0, 1e-8, "y");
  const F = g.bodyForce(18).y, J = -g.flowOut(18);
  assert.ok(F > 50 && Math.abs(F / J - 1) < 0.08, `poussée ${F}, jet ${J}`);
});

test("la chambre se remplit jusqu'à « autant de sorties que d'entrées »", () => {
  const g = rocketGas({ prefill: false }).at(22);
  assert.ok(g.count() > 240 && g.count() < 370, `N = ${g.count()}`);
  near(g.outRate(6) / RATE, 1, 0.2, "sorties / s");
});

test("dans l'air, la fusée pousse moins, de l'ordre de pₐ × largeur de sortie", () => {
  const gv = rocketGas({ prefill: true, seed: 3 }).at(24), ga = rocketGas({ prefill: true, air: true, seed: 3 }).at(24);
  const drop = gv.bodyForce(23).y - ga.bodyForce(23).y, pred = P_AIR * 2 * ROCKET.hE;
  assert.ok(drop > 0.5 * pred && drop < 1.6 * pred, `perte ${drop} pour ${pred}`);
});

test("gaz 2D : pression n σ², flux n σ/√(2π)", () => {
  near(press2d(10, 2), 40, 1e-12); near(flux2d(1, Math.sqrt(2 * Math.PI)), 1, 1e-12);
});

test("prose : chaque valeur et chaque renvoi existent", () => {
  const vals = rocketValues("en"), all = JSON.stringify(PROSE);
  for (const m of all.matchAll(/data-v=\\"(\w+)\\"/g)) assert.ok(vals[m[1]] != null, `valeur ${m[1]}`);
  for (const m of all.matchAll(/s-rocket-n(\d+)/g)) assert.ok(+m[1] >= 1 && +m[1] <= SOURCES.length, `[${m[1]}]`);
  const cited = new Set([...all.matchAll(/s-rocket-n(\d+)/g)].map((m) => +m[1]));
  for (let n = 1; n <= SOURCES.length; n++) assert.ok(cited.has(n), `source ${n} jamais citée`);
});
