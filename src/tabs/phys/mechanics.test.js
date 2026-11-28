import { test } from "node:test";
import assert from "node:assert/strict";
import { TABLE, tableForces, tableRelax, sumF, G, atwood, tackle, kickResult, billiard, lorentzR, M_P, M_E, Q_E, wireB, compassDeflection,
  ballistic, ballMass, mechValues } from "./mechanics.js";
import { MECH } from "./mech-prose.js";
import { SOURCES } from "../../data/sources/phys.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("table de forces : l'anneau s'arrête là où la somme est nulle ; 3-4-5 fait un angle droit", () => {
  const p = tableRelax().at(-1), S = sumF(tableForces(p));
  near(Math.hypot(...S), 0, 0.01, "somme");
  const F = tableForces(p), dot = F[0][0] * F[1][0] + F[0][1] * F[1][1];
  near(dot, 0, 0.05, "3 et 4 à 90°");
  near(Math.hypot(...F[2]), 5 * G, 1e-9, "chaque corde tire de m g");
});

test("Atwood : a = g/5 et T = 23,5 N pour 3 et 2 kg ; les deux équations de Newton sont vérifiées", () => {
  const A = atwood(3, 2);
  near(A.a, G / 5, 1e-12); near(A.T, 2 * 3 * 2 * G / 5, 1e-12);
  near(3 * A.a, 3 * G - A.T, 1e-12); near(2 * A.a, A.T - 2 * G, 1e-12);
  near(atwood(2, 2).a, 0, 1e-12, "masses égales : à l'équilibre");
});

test("palan : n brins, n fois moins de force ; le travail est le même", () => {
  const K = tackle(40, 4); near(K.F * 4, 40 * G, 1e-9); near(K.F * 4 * 1, 40 * G * 1, 1e-9);
});

test("coup en biais : v′ = v + J/m, par composantes", () => {
  const K = kickResult(); near(K.v1[0], 2 + 1.5 * 0.5, 1e-9); near(K.v1[1], 1.5 * Math.sqrt(3) / 2, 1e-9); near(K.angle, 25.28, 0.01);
});

test("billard : quantité de mouvement et énergie conservées, départs à 90°", () => {
  for (const off of [0.1, 0.5, 0.9]) {
    const b = billiard(2, off);
    near(b.v1[0] + b.v2[0], 2, 1e-12); near(b.v1[1] + b.v2[1], 0, 1e-12);
    near(b.v1[0] ** 2 + b.v1[1] ** 2 + b.v2[0] ** 2 + b.v2[1] ** 2, 4, 1e-12, "énergie");
    near(b.v1[0] * b.v2[0] + b.v1[1] * b.v2[1], 0, 1e-12, "angle droit");
  }
});

test("magnétisme : rayons de Larmor, champ du fil, boussole à 45°", () => {
  near(lorentzR(M_P, 1000, Q_E, 50e-6), 0.2088, 1e-4); near(lorentzR(M_E, 1000, Q_E, 50e-6) * 1000, 0.1137, 1e-4);
  near(wireB(5, 0.05) * 1e6, 20, 0.01); near(compassDeflection(20e-6, 20e-6), 45, 1e-9);
});

test("balistique : la masse, la poussée F + poids, la portée intégrée = la formule fermée", () => {
  const B = ballistic();
  near(ballMass(), 4.11, 0.01);
  near(B.aPushAng, 27.95, 0.05, "la somme F + W n'est plus à 30°");
  near(B.vac.at(-1).x, B.closed.range, 1e-3, "RK4 contre formule");
  near(B.topVac.y, B.closed.hmax, 1e-3, "hauteur");
  assert.ok(B.air.at(-1).x < B.vac.at(-1).x && B.vac.at(-1).x - B.air.at(-1).x < 2, "l'air coûte un peu");
  assert.ok(B.naive.range > B.closed.range + 1.5, "oublier le poids pendant la poussée surestime");
  near(B.dragStart / B.W, 0.032, 0.002, "traînée au départ ≈ 3 % du poids");
});

test("prose de la mécanique : valeurs et renvois existent", () => {
  const vals = mechValues("en"), all = JSON.stringify(MECH);
  for (const m of all.matchAll(/data-v=\\"(\w+)\\"/g)) assert.ok(vals[m[1]] != null, `valeur ${m[1]}`);
  for (const m of all.matchAll(/s-phys-n(\d+)/g)) assert.ok(+m[1] >= 1 && +m[1] <= SOURCES.length, `[${m[1]}]`);
  const cited = new Set([...all.matchAll(/s-phys-n(\d+)/g)].map((m) => +m[1]));
  for (let n = 15; n <= 24; n++) assert.ok(cited.has(n), `source ${n} jamais citée`);
});

test("choc de billes : quantité de mouvement constante, énergie rendue, même accélération dans tout référentiel inertiel", async () => {
  const { collision } = await import("./mechanics.js");
  const { stateIn, blendU, accelReal } = await import("./collanim.js");
  const c = collision(), a0 = c.at(0), a1 = c.at(4);
  for (const t of [0.5, 1.3, 1.45, 1.6, 3]) { const s = c.at(t); near(s.p[0], a0.p[0], 1e-12); near(s.p[1], a0.p[1], 1e-12); }
  near(a1.E, a0.E, 1e-12, "énergie rendue après le contact");
  assert.ok(c.at(1.45).E < a0.E, "l'énergie cinétique baisse pendant l'écrasement");
  near(Math.hypot(...a1.vA) ** 2 + Math.hypot(...a1.vB) ** 2, Math.hypot(...c.C.v) ** 2, 1e-12);
  near(a1.vA[0] * a1.vB[0] + a1.vA[1] * a1.vB[1], 0, 1e-12, "90°");
  near(c.Fmean, c.J / c.C.tauReal, 1e-9); near(c.FmaxReal, (Math.PI / 2) * c.Fmean, 1e-9);
  const u = [1.95, 0.43], s0 = c.at(1.45), s1 = stateIn(1.45, u);
  near(s1.aA[0], s0.aA[0], 1e-12); near(s1.vA[0], s0.vA[0] - u[0], 1e-12);
  near(blendU([0, 0], [2, 0], 0.55, 0.2, 0.9).u[0], 1, 1e-12, "mi-chemin"); near(blendU([0, 0], [2, 0], 5, 0.2, 0.9).u[0], 2, 1e-12);
  for (const u2 of [[0, 0], [1.95, 0], c.C.v]) near(accelReal(stateIn(1.45, u2)), accelReal(c.at(1.45)), 1e-9, "même accélération");
  near(c.aMax, (Math.PI / 2) * c.vn / c.C.tauReal, 1e-6, "a ne dépend pas de la masse");
});
