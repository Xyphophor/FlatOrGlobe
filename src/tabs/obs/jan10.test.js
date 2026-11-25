import { test } from "node:test";
import assert from "node:assert/strict";
import { contactTimes, sunAt, ridgeAt, jan10Radius } from "./jan10.js";
import { GLOBESPOT } from "../../data/dem/globespot.js";
import { refineProfile } from "../../core/horizon.js";
const HP = refineProfile(GLOBESPOT);

// 10 janvier 2026, Globe spot, fenêtre 17:03-17:15 CET (t0 = 17:03:00)
test("le Soleil du globe se couche derrière la crête du globe vers 17:09-17:13", () => {
  const g = contactTimes(HP.globeK);
  assert.ok(g.first > 5 * 60 && g.first < 7 * 60, `premier contact ${g.first} s`);
  assert.ok(g.gone > 9 * 60 && g.gone < 11.5 * 60, `disparition ${g.gone} s`);
});

test("la crête du plan, plus haute ici, le cache plus tôt", () => {
  const g = contactTimes(HP.globeK), f = contactTimes(HP.flat);
  assert.ok(f.gone < g.gone && f.first <= g.first);
  const b = sunAt(g.gone);
  assert.ok(ridgeAt(HP.flat, b.az) > ridgeAt(HP.globeK, b.az));
});

test("le Soleil plat est loin du cadre et ne se couche pas", () => {
  for (const s of [0, 360, 720]) {
    const b = sunAt(s);
    assert.ok(b.flatAz - b.az > 25, `écart d'azimut ${b.flatAz - b.az}`);
    assert.ok(b.flat.alt > 15);
  }
});

// l'observation du 10 janvier 2026 (horloge NTP filmée avec l'écran du P900) :
// à 17:11:06 le bord gauche du disque sur l'épaulement (238,95°) ; disparu à 17:12:37-40
test("disque aplati : premier contact plus tard, dernière lumière plus tôt que pour un disque rond", async () => {
  const { OBS } = await import("../../core/ephemeris.js");
  const b = sunAt(600);
  const lo = OBS.limbAlt(b.altTrue, -b.sd, 0.836), up = OBS.limbAlt(b.altTrue, b.sd, 0.836);
  assert.ok((up - lo) * 60 < 2 * b.sd * 60 - 3, `diamètre vertical ${((up - lo) * 60).toFixed(1)}′`);
  const g = contactTimes(HP.globeK);
  assert.equal(g.first, 374);          // 17:09:14
  assert.equal(g.gone, 610);           // 17:13:10
});

// Ératosthène avec une photo (page obs, 2026-09-27) : à 17:11:06 le bord du Soleil touche
// l'épaulement (238,953°) ; sa hauteur (sans rayon terrestre) mesure l'angle d'élévation de
// l'épaulement, et l'angle donne R. Les chiffres publiés : 15,2′ (plan), ~5 900 km, 5 000-6 500.
test("Ératosthène : le rayon tiré du contact de 17:11:06", async () => {
  const { OBS } = await import("../../core/ephemeris.js");
  const { OBS_REFR_F } = await import("../../data/presets/obs.js");
  const D = Math.PI / 180, az = 238.953, eye = GLOBESPOT.eye;
  const at = (arr) => { const x = (az - HP.az0) / HP.step, i = Math.floor(x), u = x - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
  const d = at(HP.dist) * 1000, h = eye + d * Math.tan(at(HP.flat) / 60 * D);
  assert.ok(Math.abs(Math.atan2(h - eye, d) / D * 60 - 15.15) < 0.05);             // l'angle qu'exigerait un plan
  const b = sunAt(17 * 3600 + 11 * 60 + 6 - (17 * 3600 + 3 * 60));
  const half = Math.sqrt(b.sd ** 2 - ((az - b.az) * Math.cos(b.altTrue * D)) ** 2);
  const eps = [OBS.limbAlt(b.altTrue, -half, OBS_REFR_F), OBS.limbAlt(b.altTrue, half, OBS_REFR_F)];   // le bord à cet azimut
  const Rof = (e, k) => { let lo = 2e6, hi = 4e7; for (let i = 0; i < 80; i++) { const R = (lo + hi) / 2, Re = R / (1 - k), th = d / Re;
    (Math.atan2((Re + h) * Math.cos(th) - (Re + eye), (Re + h) * Math.sin(th)) / D > e ? (hi = R) : (lo = R)); } return (lo + hi) / 2000; };
  const mid = Rof((eps[0] + eps[1]) / 2, 0.13);
  assert.ok(mid > 5800 && mid < 6000, `R central ${mid.toFixed(0)} km`);
  assert.ok(Rof(eps[1], 0.09) > 6371 && Rof(eps[0], 0.17) < 6371);                 // la fourchette contient 6 371 km
});

test("jan10Radius (cumul de l'accueil) redonne le calcul ci-dessus", () => {
  const r = jan10Radius();
  assert.ok(r.mid > 5800 && r.mid < 6000, `${r.mid}`);
  assert.ok(r.lo < 6371 && r.hi > 6371, `${r.lo}-${r.hi}`);
  assert.ok(Math.abs(r.flatArcmin - 15.15) < 0.05);
});

