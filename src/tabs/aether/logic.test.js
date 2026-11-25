import { test } from "node:test";
import assert from "node:assert/strict";
import { maxwellC, C_LIGHT, aberrationArcsec, fresnelF, addVel, lightInWater, airy, mmTimes, mmFringe, MM1887, gamma, contraction,
  gpsDrift, sagnacDt, mgpFringe, MGP, MUONS, BOUNDS, R_EARTH, V_ORBIT, aetherValues } from "./logic.js";
import { SOURCES } from "../../data/sources/aether.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("Maxwell : 1/√(μ0 ε0) redonne c", () => near(maxwellC(), C_LIGHT, 1, "c"));

test("Bradley : 20,5″ pour 29,78 km/s", () => near(aberrationArcsec(), 20.49, 0.01));

test("Fresnel : f = 1 − 1/n², 0,437 pour l'eau", () => near(fresnelF(1.333), 0.4372, 1e-4));

test("la composition d'Einstein redonne l'entraînement de Fresnel au premier ordre (von Laue 1907)", () => {
  for (const v of [1, 7.06, 100]) { const w = lightInWater(v); near(w.exact - w.none, w.fresnel - w.none, 1e-6 * v, `v = ${v}`); }
  near(addVel(0.9 * C_LIGHT, 0.9 * C_LIGHT) / C_LIGHT, 1.8 / 1.81, 1e-12, "jamais au-delà de c");
});

test("Airy : avec l'entraînement de Fresnel, le rayon réfracté et l'axe du tube coïncident", () => {
  const a = airy();
  near(a.refracted, a.needed, 1e-15, "α/n des deux côtés");
  assert.ok(a.gapArcsec > 10, "sans entraînement, l'écart se verrait");
});

test("Michelson-Morley : Δt ≈ (L/c)β², 0,4 frange attendue en 1887", () => {
  const t = mmTimes(11, V_ORBIT);
  near(t.dt / t.approx, 1, 1e-6);
  near(mmFringe(MM1887.LoverLambda), 0.395, 0.005);
  // la contraction de FitzGerald-Lorentz annule exactement la différence
  const Lc = 11 / gamma(V_ORBIT), tPar = (Lc / (C_LIGHT - V_ORBIT) + Lc / (C_LIGHT + V_ORBIT));
  near(tPar / t.perp, 1, 1e-12);
});

test("la Terre raccourcie de 6,3 cm vue du Soleil", () => near(contraction(2 * R_EARTH, V_ORBIT) * 100, 6.3, 0.05));

test("GPS : −7,2 + 45,7 = +38,5 µs par jour (Ashby 2003)", () => {
  const g = gpsDrift();
  near(g.vel, -7.2, 0.1); near(g.grav, 45.7, 0.1); near(g.net, 38.5, 0.2);
});

test("Michelson-Gale-Pearson : 0,236 frange avec la rotation sidérale (publié 0,236)", () => {
  near(mgpFringe().fringe, MGP.published, 0.002);
  near(sagnacDt(1, 1) * C_LIGHT ** 2, 4, 1e-12);
});

test("muons du CERN : γ τ0 ≈ la vie mesurée", () => near(MUONS.gamma * MUONS.tau0 / MUONS.measured, 1, 0.002));

test("limites : décroissantes, renvois vers des sources existantes", () => {
  for (let i = 1; i < BOUNDS.length; i++) assert.ok(BOUNDS[i].v < BOUNDS[i - 1].v);
  for (const b of BOUNDS) assert.ok(b.src >= 1 && b.src <= SOURCES.length, b.who);
});

test("valeurs de la page en en et fr", () => {
  const en = aetherValues("en"), fr = aetherValues("fr");
  assert.equal(en.aberr, "20.5"); assert.equal(fr.aberr, "20,5");
  assert.equal(en.mgpN, "0.236"); assert.equal(en.gpsNet, "38.5"); assert.equal(en.gpsVel, "7.2");
  for (const [k, v] of Object.entries(en)) assert.ok(v && !/NaN/.test(v), k);
});
