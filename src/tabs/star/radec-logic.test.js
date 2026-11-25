// Coordonnées du ciel (sections « sky-* » de l'onglet star) : les nombres que la page et ses cartes citent.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./radec-logic.js";
import { pmRows } from "./radec.js";
import { STARS } from "../../data/star-catalog.js";
import { precess } from "../../core/ephemeris.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b} (±${tol})`);

test("catalogue : 960 étoiles brillantes, 6 rapides, toutes celles qu'on nomme existent", () => {
  assert.equal(L.BRIGHT.length, 960); assert.equal(L.FAST.length, 6);
  for (const [k, hip] of Object.entries(L.NAMED)) assert.ok(L.star(hip), `${k} (HIP ${hip}) absent`);
  for (const segs of Object.values(L.ASTERISMS)) for (const [a, b] of segs) assert.ok(L.star(a) && L.star(b), `astérisme : HIP ${a}/${b}`);
  for (const k of [...L.VIS_STARS, ...L.VIS_SPOTS.flatMap((p) => p.ex)]) assert.ok(L.named(k), k);
});

test("les numéros HIP nommés tombent sur la même étoile du catalogue de Yale de l'onglet (à 0,02°)", () => {
  const yale = { polaris: "Polaris", vega: "Vega", arcturus: "Arcturus", sirius: "Sirius", canopus: "Canopus", acrux: "Acrux", betelgeuse: "Betelgeuse", rigilkent: "Rigil Kentaurus", dubhe: "Dubhe", alkaid: "Alkaid", kochab: "Kochab" };
  for (const [k, n] of Object.entries(yale)) {
    const y = STARS.find((s) => s.n === n); assert.ok(y, n);
    near(L.sepDeg(L.vec(y.ra, y.de), L.moved(L.named(k), 2000)), 0, 0.02, k);
  }
});

test("coordonnées J2000 citées dans la page", () => {
  const c = (k) => { const r = L.radec(L.moved(L.named(k), 2000)); return [L.hm(r.ra), r.dec]; };
  let [h, d] = c("sirius"); assert.deepEqual(h, { h: 6, m: 45 }); near(d, -16.7, 0.05);
  [h, d] = c("vega"); assert.deepEqual(h, { h: 18, m: 37 }); near(d, 38.8, 0.05);
  [h, d] = c("polaris"); assert.deepEqual(h, { h: 2, m: 32 }); near(d, 89.3, 0.05);
  [h, d] = c("acrux"); assert.deepEqual(h, { h: 12, m: 27 }); near(d, -63.1, 0.05);
});

test("précession : la rotation simple rejoint la série de Lieske en 2026 à mieux que 2″", () => {
  const jd = 2451545 + 26 * 365.25; let worst = 0;
  for (const s of L.BRIGHT) { const v = L.moved(s, 2000), c0 = L.radec(v), a = precess(c0.ra, c0.dec, jd), b = L.radec(L.toDate(v, 2026)); worst = Math.max(worst, L.sepDeg(L.vec(a.ra, a.dec), L.vec(b.ra, b.dec)) * 3600); }
  assert.ok(worst < 2, `${worst}″`);
  near(L.PRECESSION_PERIOD, 25772, 1);
});

test("précession : étoiles polaires et Spica, comme la page les cite", () => {
  const sep = (k, y) => L.sepDeg(L.moved(L.named(k), y), L.poleAt(y));
  near(sep("polaris", 2026), 0.63, 0.01); near(sep("polaris", 2102), 0.46, 0.01); near(sep("polaris", -128), 12.4, 0.1);
  assert.ok(sep("thuban", -2800) < 0.5); near(sep("vega", 13700), 4.0, 0.1);
  near(L.coordsAt(L.named("spica"), -128).dec, 0.5, 0.1); near(L.coordsAt(L.named("spica"), 2026).dec, -11.3, 0.05);
  near(L.coordsAt(L.named("sirius"), 1900).dec, -16.58, 0.01); near(L.coordsAt(L.named("sirius"), 2026).dec, -16.75, 0.01);
  // le pôle et l'équinoxe de l'année sont bien l'axe z et l'axe x du repère de l'année
  for (const y of [-3000, 2026, 9000]) { near(L.radec(L.toDate(L.poleAt(y), y)).dec, 90, 1e-6); const e = L.radec(L.toDate(L.equinoxAt(y), y)); near(e.dec, 0, 1e-9); near(Math.min(e.ra, 360 - e.ra), 0, 1e-6); }
  near(L.sepDeg(L.poleAt(5000), L.ECL_POLE), L.OBLIQUITY, 1e-9);
});

test("mouvements propres : Barnard 10,36″/an, table triée, glissement de la grille 5 à 1 000 fois plus rapide", () => {
  near(L.pmTotal(L.named("barnard")), 10.36, 0.01); near(L.pmTotal(L.named("sirius")), 1.34, 0.01); near(L.pmTotal(L.named("rigilkent")), 3.71, 0.01);
  const rows = pmRows(); near(rows[0].yearsHalfDeg, 174, 1); near(rows.find((r) => r.k === "sirius").yearsHalfDeg, 1344, 2);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i].pm < rows[i - 1].pm);
  const ratios = rows.map((r) => L.PRECESSION / r.pm); assert.ok(Math.min(...ratios) > 4.8 && Math.max(...ratios) < 1100, String(ratios));
  // Halley : Sirius et Arcturus à plus d'un demi-degré de la place de Ptolémée (vers 150)
  for (const k of ["sirius", "arcturus"]) assert.ok(L.pmTotal(L.named(k)) * (1718 - 150) / 3600 > 0.5, k);
  // la Grande Ourse : le mouvement propre ne change presque rien en 26 ans, tout en 100 000
  const d = (y) => L.sepDeg(L.moved(L.star(54061), y), L.moved(L.star(53910), y));
  near(d(2026), d(2000), 0.001); assert.ok(Math.abs(d(102000) - d(2000)) > 1);
});

test("visibilité : hauteurs de culmination et calottes", () => {
  const dec = (k) => L.coordsAt(L.named(k), 2026).dec, sp = Object.fromEntries(L.VIS_SPOTS.map((p) => [p.n, p.lat]));
  near(L.maxAlt(sp.Paris, dec("sirius")), 24.4, 0.05); assert.equal(L.cls(sp.Paris, dec("canopus")), "never"); assert.equal(L.cls(sp.Paris, dec("acrux")), "never");
  near(L.maxAlt(sp.Cairo, dec("canopus")), 7.2, 0.05); assert.equal(L.cls(sp.Cairo, dec("acrux")), "never");
  near(L.maxAlt(sp.Melbourne, dec("arcturus")), 33.1, 0.05); near(L.maxAlt(sp.Melbourne, dec("vega")), 13.4, 0.05); assert.equal(L.cls(sp.Melbourne, dec("polaris")), "never");
  assert.equal(L.cls(sp.Melbourne, dec("acrux")), "always"); assert.equal(L.cls(sp.Paris, dec("polaris")), "always"); assert.equal(L.cls(sp.Quito, dec("polaris")), "rises");
  near(L.skyFraction(sp.Paris), 0.829, 0.001); near(L.skyFraction(90), 0.5, 1e-12); near(L.skyFraction(0), 1, 1e-12);
  near(L.decLimit(sp.Paris), -41.1, 0.05); near(L.decLimit(sp.Melbourne), 52.2, 0.05);
  near(L.coordsAt(L.star(25930), 2026).dec, -0.3, 0.05);   // Mintaka, sur l'équateur
});
