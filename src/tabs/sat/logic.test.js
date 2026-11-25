import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./logic.js";
import { SAT_DOPPLER as D } from "../../data/presets/sat-doppler.js";

test("Doppler seul : GM à 10 ppm et Ω à 1 ppm des valeurs adoptées, résidu de quelques mm/s", () => {
  assert.ok(Math.abs(L.dGMppm(D)) < 10, `${L.dGMppm(D)} ppm`);
  assert.ok(Math.abs(L.dOmppb(D)) < 1000, `${L.dOmppb(D)} ppb`);
  assert.ok(D.rms < 5, `${D.rms} mm/s`);
  assert.ok(D.n > 150000);
});

test("les récepteurs gardés sont sur une boule aplatie : 6 350–6 385 km, ellipse proche de WGS84, plan à des milliers de km", () => {
  const K = L.keptStations(D), E = L.ellipse(K);
  for (const s of K) assert.ok(s.r > 6350 && s.r < 6385, `${s.id} ${s.r}`);
  assert.ok(Math.abs(E.a - L.WGS84.a) < 5, `a ${E.a}`);
  assert.ok(E.invF > 250 && E.invF < 350, `1/f ${E.invF}`);
  assert.ok(Math.abs(E.a - D.ellA) < 0.02 && Math.abs(E.f - D.ellF) < 2e-5, "même ajustement que fog");
  assert.ok(D.planeRms > 1000);
});

test("Clairaut : J₂ et q donnent un aplatissement voisin de 1/298", () => {
  const C = L.clairaut(D, L.ellipse(L.keptStations(D)).a);
  assert.ok(Math.abs(C.J2 / 1.0826e-3 - 1) < 0.02, `J2 ${C.J2}`);
  assert.ok(C.invF > 290 && C.invF < 305, `1/f ${C.invF}`);
});

test("Kepler III : un GM par satellite, les trois constellations d'accord à mieux que 20 ppm", () => {
  const k = L.keplerStats(D);
  assert.ok(k.n > 70);
  assert.ok(k.sysPpm < 20, `${k.sysPpm} ppm`);
  assert.ok(k.by.R.a < k.by.G.a && k.by.G.a < k.by.E.a);
});

test("le plat défendu au mieux laisse plus de mille fois le résidu du globe ; les départs convergés retombent au même endroit", () => {
  assert.ok(D.flatRms * 1000 > 1000 * D.rms, `${D.flatRms} m/s`);
  const ok = D.restarts.filter((r) => r.rms * 1000 < 2 * D.rms);
  assert.ok(ok.some((r) => r.name === "catalogue") && ok.some((r) => r.name === "ball3000"));
  for (const r of ok) assert.ok(Math.abs(r.dgm) < 1000 && r.dsta < 100, `${r.name} ${r.dgm} ${r.dsta}`);
});

test("l'exemple chiffré : GPS à 3,87 km/s, 11 h 58 min, GM = v³/n ; Wettzell emporté à ~305 m/s", () => {
  const w = L.worked(D);
  assert.ok(Math.abs(w.v - 3874) < 5, `${w.v}`);
  assert.ok(Math.abs(w.T - 43082) < 60, `${w.T}`);
  assert.ok(Math.abs(w.gmBack / (D.gm * 1e14) - 1) < 1e-12);
  assert.ok(Math.abs(w.vEq - 465) < 2 && Math.abs(w.vW - 305) < 5, `${w.vEq} ${w.vW}`);
});
