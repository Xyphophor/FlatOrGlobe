import { test } from "node:test";
import assert from "node:assert/strict";
import { equirect, mercator, lambertCyl, sinusoidal, eqConic, ortho, aeq, tissot, aeRingScale, flatError, radiusForError,
  capCircumference, eratosthenes, polarStretch, mercScale, utmScale, utmHalfWidth, ptolemyRatios, ptolemyFit, zoneFraction, PTOL_FRAME, aePair, rhumbLine, greatCircle, pathKm } from "./logic.js";

const near = (a, b, e, m) => assert.ok(Math.abs(a - b) <= e, `${m ?? ""} ${a} ≠ ${b} (±${e})`);
const ALL = [equirect(36), mercator(), lambertCyl(), sinusoidal(), eqConic(), ortho(20, 10), aeq(90, 0), aeq(48.85, 2.35)];

test("fwd puis inv rend le point", () => {
  for (const P of ALL) for (const [la, lo] of [[0, 0], [36, 40], [-33.9, 18.4], [60, -100], [10, 15]]) {
    const p = P.fwd(la, lo); if (!p) continue;
    const q = P.inv(p[0], p[1]); assert.ok(q, `${P.id} inv null`);
    near(q[0], la, 1e-6, `${P.id} lat`); near(q[1], lo, 1e-6, `${P.id} lon`);
  }
});

test("Tissot : les valeurs connues de chaque projection", () => {
  for (const la of [0, 30, 60]) {
    const m = tissot(mercator(), la, 20); near(m.h, mercScale(la), 1e-5); near(m.k, mercScale(la), 1e-5); near(m.omega, 0, 1e-3, "Mercator conforme");
    const l = tissot(lambertCyl(), la, 20); near(l.area, 1, 1e-6, "Lambert équivalente");
    const s = tissot(sinusoidal(), la, 20); near(s.area, 1, 1e-6, "sinusoïdale équivalente"); near(s.k, 1, 1e-6);
    const e = tissot(equirect(0), la, 20); near(e.h, 1, 1e-6); near(e.k, 1 / Math.cos(la * Math.PI / 180), 1e-5);
  }
  // azimutale polaire : h = 1, k = c / sin c ; Ptolémée : vraie sur 36° et 63°, et le long des méridiens
  const a = tissot(aeq(90, 0), -34, 151); near(a.h, 1, 1e-5); near(a.k, polarStretch(-34), 1e-5);
  const P = eqConic(36, 63); for (const la of [36, 63]) near(tissot(P, la, 60).k, 1, 1e-6, `Ptolémée k(${la})`); near(tissot(P, 10, 60).h, 1, 1e-6);
});

test("carte plate : erreur c²/6 près du centre, 1 % vers 1 560 km", () => {
  near(flatError(100), (100 / 6371) ** 2 / 6, 1e-8);
  near(flatError(1000), 0.0041, 1e-4);
  near(radiusForError(0.01), 1557, 3);
  near(aeRingScale(Math.PI / 2), Math.PI / 2, 1e-12);
  near(capCircumference(1000) / (2 * Math.PI * 1000), 1 - (1000 / 6371) ** 2 / 6, 1e-5);
});

test("formules de l'histoire", () => {
  assert.equal(eratosthenes(7.2, 5000), 250000);
  const r = ptolemyRatios(); near(r.rhodes.ptolemy, r.rhodes.cos, 0.001); near(r.thule.ptolemy, r.thule.cos, 0.003);
  near(polarStretch(0), Math.PI / 2, 1e-12); near(polarStretch(-33.9), 2.61, 0.01); near(polarStretch(89.999), 1, 1e-4);
  near(utmScale(0), 0.9996, 1e-12); near(utmScale(utmHalfWidth(0)), 1.00097, 2e-5);
  near(utmScale(Math.sqrt(2 * 0.0004 / 0.9996) * 6371), 1, 1e-7);
});

test("AE : vrai depuis le centre, faux ailleurs ; loxodromie plus longue que le grand cercle", () => {
  const syd = [-33.87, 151.21], scl = [-33.45, -70.67];
  const p = aePair([90, 0], syd, scl);
  near(p.truth, 11350, 60); assert.ok(p.map > 2 * p.truth, "la carte polaire plus que double Sydney–Santiago");
  near(aePair([90, 0], [90, 0], syd).map, aePair([90, 0], [90, 0], syd).truth, 1e-6, "depuis le centre : juste");
  const lis = [38.72, -9.14], hav = [23.11, -82.37];
  assert.ok(pathKm(rhumbLine(lis, hav, 400)) > pathKm(greatCircle(lis, hav, 400)));
});

test("Ptolémée : longitudes étirées de 252 000 / 180 000, cadre connu", async () => {
  const { PTOLEMY } = await import("../../data/presets/map-ptolemy.js");
  const f = ptolemyFit(PTOLEMY.towns);
  assert.equal(f.n, 56); near(f.b, 1.403, 0.001); near(f.a, 17.21, 0.01); near(f.b, 252000 / 180000, 0.01);
  near(f.trueSpan, 128.3, 0.1); assert.ok(Math.abs(f.dLatMean) < 0.5 && f.dLatSD < 3, `${f.dLatMean} ${f.dLatSD}`);
  near(zoneFraction(-90, 90, 360), 1, 1e-12);
  near(zoneFraction(PTOL_FRAME.latS, PTOL_FRAME.latN, 180), 0.2934, 0.0005);
  assert.equal((PTOLEMY.eu.length + PTOLEMY.af.length + PTOLEMY.as.length) / 2, 6372);
});
