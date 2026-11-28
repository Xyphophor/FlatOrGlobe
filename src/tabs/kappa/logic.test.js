// Tests de l'onglet kappa : la courbure d'une courbe et d'une surface, les relevés simulés et l'ajustement naïf.
import { test } from "node:test";
import assert from "node:assert/strict";
import { graphCurvature, mengerCurvature, sampleCurve, atArc, WAVY, SURFACES, gaussK, sphereCircumference, kFromCircle, excessOf,
  METHODS, METHOD_IDS, fitSeries, centralAngle, destination, aeDistance, survey, fitRadius, singleRadius, countAt, summary, kappaValues, rng, R_EARTH, FLAT_SUN_H } from "./logic.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b} (±${tol})`);

test("une droite a une courbure nulle, un cercle 1/R partout (dθ/ds, Menger, graphe)", () => {
  const line = sampleCurve((t) => [-50 + 100 * t, 3 + 0.2 * (-50 + 100 * t)]);
  for (const k of line.k) near(k, 0, 1e-12, "droite");
  const R = 20, circ = sampleCurve((t) => [R * Math.cos(2 * Math.PI * t), R * Math.sin(2 * Math.PI * t)], 2000);
  for (let i = 5; i < 1995; i += 97) near(circ.k[i], 1 / R, 1e-5, "cercle");
  near(circ.L, 2 * Math.PI * R, 1e-3, "périmètre");
  // trois points d'un cercle : 1 / rayon, au signe près (gauche positif)
  const P = (a) => [R * Math.cos(a), R * Math.sin(a)];
  near(mengerCurvature(P(0.1), P(0.9), P(2.2)), 1 / R, 1e-12);
  near(mengerCurvature(P(2.2), P(0.9), P(0.1)), -1 / R, 1e-12);
  near(mengerCurvature([0, 0], [1, 1], [2, 2]), 0, 1e-15);
});

test("la courbe ondulée : κ de l'échantillon = y″/(1+y′²)^{3/2}", () => {
  const c = sampleCurve((t) => { const x = WAVY.x0 + (WAVY.x1 - WAVY.x0) * t; return [x, WAVY.y(x)]; }, 4000);
  for (const s of [10, 40, 77, 101]) {
    const p = atArc(c, s), k = graphCurvature(WAVY.d1(p.x), WAVY.d2(p.x));
    near(p.k, k, 2e-4, `s=${s}`);
    near(p.y, WAVY.y(p.x), 1e-3);
  }
});

test("surfaces : K = κ₁κ₂ ; plan et cylindre 0, sphère 1/R², selle −1/R²", () => {
  const S = SURFACES(R_EARTH);
  assert.equal(gaussK(S.plane.k1, S.plane.k2), 0);
  assert.equal(gaussK(S.cylinder.k1, S.cylinder.k2), 0);
  near(gaussK(S.sphere.k1, S.sphere.k2), 1 / R_EARTH ** 2, 1e-20);
  near(gaussK(S.saddle.k1, S.saddle.k2), -1 / R_EARTH ** 2, 1e-20);
  // un octant de sphère : trois angles droits, excès π/2 = aire/R²
  near(excessOf((4 * Math.PI * R_EARTH ** 2) / 8, 1 / R_EARTH ** 2), Math.PI / 2, 1e-12);
});

test("le cercle mesuré au sol donne K (Bertrand–Diguet–Puiseux), et 0 sur un plan", () => {
  for (const r of [10, 100, 300]) near(kFromCircle(r, sphereCircumference(r, R_EARTH)) * R_EARTH ** 2, 1, 2e-3, `r=${r}`);
  assert.equal(kFromCircle(50, 2 * Math.PI * 50), 0);
  // la forme linéaire de la méthode : 2πr − C ≈ (π r³/3)/R²
  const r = 200; near((2 * Math.PI * r - sphereCircumference(r, R_EARTH)) / ((Math.PI * r ** 3) / 3 / R_EARTH ** 2), 1, 1e-3);
});

test("générateur reproductible ; loi normale centrée réduite", () => {
  const a = rng(5), b = rng(5); for (let i = 0; i < 10; i++) assert.equal(a.u(), b.u());
  const g = rng(9); let s = 0, s2 = 0; const n = 20000; for (let i = 0; i < n; i++) { const x = g.g(); s += x; s2 += x * x; }
  near(s / n, 0, 0.03); near(s2 / n, 1, 0.04);
});

test("sans bruit, chaque méthode rend le rayon exact sur la sphère et aucun sur le plan", () => {
  for (const id of METHOD_IDS) {
    const m = METHODS[id], quiet = Object.create(m, { s1: { value: 0 }, sigma: { value: 0 }, rel: { value: 0 }, abs: { value: 0 } }), rs = rng(1), rp = rng(1);
    for (let i = 0; i < 20; i++) {
      const s = quiet.gen("sphere", rs), p = quiet.gen("plane", rp);
      if (id === "erat" || id === "travel") { near(singleRadius(s, m.power), R_EARTH, 1e-6, id); continue; }   // le plan de ces deux-là a son propre modèle
      const tol = id === "circle" ? 0.01 : id === "dip" ? 0.004 : 1e-9;   // formes au premier ordre : cercle et dip
      near(singleRadius(s, m.power) / R_EARTH, 1, tol, id);
      assert.equal(p.y, 0, `${id} : un plan sans bruit ne courbe rien`);
    }
  }
});

test("Ératosthène sur un plan, Soleil à H : près du point sous le Soleil R ≈ H, loin (H² + r²)/H", () => {
  const m = METHODS.erat;
  const gen = (r1, d) => { const z1 = Math.atan(r1 / FLAT_SUN_H), z2 = Math.atan((r1 + d) / FLAT_SUN_H); return d / (z2 - z1); };
  near(gen(0, 1) / FLAT_SUN_H, 1, 1e-6);
  near(gen(8000, 1) / ((FLAT_SUN_H ** 2 + 8000 ** 2) / FLAT_SUN_H), 1, 1e-3);
  assert.ok(m.power === 1);
});

test("les relevés simulés : la sphère retrouve R, le plan ne donne aucun rayon (sauf Ératosthène, incohérent)", () => {
  const S = summary();
  for (const id of METHOD_IDS) {
    const { plane: p, sphere: s } = S[id];
    assert.ok(Math.abs(s.R / R_EARTH - 1) < 0.01, `${id} sphère ${s.R}`);
    assert.ok(s.r > 0.99, `${id} sphère r ${s.r}`);
    assert.ok(s.chi2nu > 0.7 && s.chi2nu < 1.4, `${id} sphère χ² ${s.chi2nu}`);
    if (id === "erat" || id === "travel") {
      assert.ok(p.chi2nu > 50, `${id} plan χ² ${p.chi2nu}`);      // les relevés ne tiennent sur aucune droite
    } else {
      assert.ok(Math.abs(p.z) < 3, `${id} plan : pente compatible avec zéro (z = ${p.z})`);
      assert.ok(Math.abs(p.r) < 0.3, `${id} plan r ${p.r}`);
      assert.ok(p.Rhi === Infinity, `${id} : l'intervalle du plan va jusqu'à l'infini`);
    }
  }
});

test("deux relevés sont toujours sur une droite (r = ±1), puis la corrélation du plan s'effondre", () => {
  for (const id of METHOD_IDS) {
    const m = METHODS[id];
    near(Math.abs(fitRadius(survey(id, "plane", 2), m).r), 1, 1e-9, id);
    near(fitRadius(survey(id, "sphere", 2), m).r, 1, 1e-9, id);
  }
  // Ératosthène plat : les deux premiers relevés s'accordent à 1 % près, vers H
  const P = survey("erat", "plane", 2), a = singleRadius(P[0]), b = singleRadius(P[1]);
  assert.ok(Math.abs(a / b - 1) < 0.01 && Math.abs(a / FLAT_SUN_H - 1) < 0.1, `${a} ${b}`);
});

test("countAt : 1, puis 2, puis 3, puis jusqu'à n", () => {
  assert.equal(countAt(0, 200), 1); assert.equal(countAt(0.2, 200), 2); assert.equal(countAt(0.3, 200), 3);
  assert.equal(countAt(0.9, 200), 200); assert.equal(countAt(0.99, 300), 300);
  let last = 0; for (let u = 0; u < 1; u += 0.01) { const n = countAt(u, 200); assert.ok(n >= last); last = n; }
});

test("kappaValues : en et fr, rien d'indéfini", () => {
  for (const lang of ["en", "fr"]) for (const [k, v] of Object.entries(kappaValues(lang))) assert.ok(v != null && !/NaN|undefined/.test(v), `${lang} ${k} ${v}`);
  const v = kappaValues("en"); assert.equal(v.excPerArcsec, "197"); assert.equal(v.turn1km, "32.4");
});

test("vitesse × temps : la carte azimutale du pôle garde les méridiens, pas les parallèles", () => {
  const D = Math.PI / 180, R = R_EARTH;
  near(aeDistance([10 * D, 0.3], [50 * D, 0.3]), R * 40 * D, 1e-9, "méridien");
  near(centralAngle([0, 0], [0, 90 * D]), 90 * D, 1e-12);
  const a = [-35 * D, 0], b = [-35 * D, 60 * D];                       // un parallèle du sud : la carte l'allonge
  assert.ok(aeDistance(a, b) > 1.4 * R * centralAngle(a, b));
  const p = destination([20 * D, 1], 0.7, 2.1); near(centralAngle([20 * D, 1], p), 0.7, 1e-12, "destination");
});

test("fitSeries : la même corrélation et le même χ²/ν que fitRadius, à chaque nombre de relevés", () => {
  for (const id of METHOD_IDS) {
    const m = METHODS[id], P = survey(id, "plane"), S = fitSeries(P, m);
    assert.equal(S.length, P.length - 1);
    for (const k of [2, 3, 10, P.length]) {
      const f = fitRadius(P.slice(0, k), m), e = S[k - 2];
      assert.equal(e.n, k); near(e.r, f.r, 1e-6, `${id} r ${k}`); near(e.chi2nu / f.chi2nu, 1, 1e-6, `${id} χ² ${k}`);
    }
  }
});
