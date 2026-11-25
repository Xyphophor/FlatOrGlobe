// Tests de l'onglet curv (epic13). Les valeurs de contrôle viennent de
// sources publiées (Lynch 2008 ; Bowditch pour le dip) ou de formes closes
// indépendantes de la projection point par point de logic.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./logic.js";
import { LYNCH_PHOTO, LYNCH_REPORTS } from "../../data/presets/curv.js";
import { proseValues } from "./values.js";

const D2R = Math.PI / 180;

test("dip: 1.93'·√h geometric, refraction lowers it (Bowditch, Young)", () => {
  for (const h of [2, 100, 1000]) {
    const g = L.dip(h) / D2R * 60, r = L.dip(h, L.K_STD) / D2R * 60;
    assert.ok(Math.abs(g / Math.sqrt(h) - 1.93) < 0.01, `geo ${g}`);
    assert.ok(r < g && r / Math.sqrt(h) > 1.76 && r / Math.sqrt(h) < 1.82, `refr ${r}`);
  }
});

test("focal <-> field of view round trip; 24 mm on 36 mm = 73.7°", () => {
  assert.ok(Math.abs(L.fovFromFocal(24, 36) - 73.74) < 0.01);
  assert.ok(Math.abs(L.focalFromFov(L.fovFromFocal(50, 36), 36) - 50) < 1e-9);
});

test("project/elevationAt are inverse for both lenses", () => {
  for (const lens of ["rect", "fish"]) {
    const cam = L.makeCamera({ W: 1200, H: 800, fovH: 100, lens, pitch: 0.2 });
    for (const [az, el] of [[0, 0], [30, -5], [-40, 12], [10, -25]]) {
      const d = [Math.sin(az * D2R) * Math.cos(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R)];
      const p = L.project(cam, d);
      assert.ok(Math.abs(L.elevationAt(cam, p[0], p[1]) - el * D2R) < 1e-9, `${lens} ${az} ${el}`);
    }
  }
});

test("level rectilinear camera: point-by-point sagitta = closed form f·tanδ·(sec a − 1)", () => {
  for (const [h, fov] of [[2, 60], [4205, 90], [10668, 62.7], [22066, 120]]) {
    const d = L.dip(h), s = L.sagitta(L.makeCamera({ W: 4000, H: 3000, fovH: fov }), d);
    assert.ok(Math.abs(s.px - L.sagittaLevelRect(fov, 4000, d)) < 1e-6 * Math.max(1, s.px), `${h} ${fov}`);
  }
});

test("a plane's horizon (eye level) is straight in a rectilinear lens at any tilt, bent in a fish-eye off-centre", () => {
  for (const p of [-0.3, 0, 0.25]) {
    assert.ok(Math.abs(L.sagitta(L.makeCamera({ W: 3000, H: 2000, fovH: 80, pitch: p }), 0).px) < 1e-6);
  }
  assert.ok(Math.abs(L.sagitta(L.makeCamera({ W: 3000, H: 2000, fovH: 80, lens: "fish", pitch: 0 }), 0).px) < 1e-6);
  const up = L.sagitta(L.makeCamera({ W: 3000, H: 2000, fovH: 120, lens: "fish", pitch: 0.2 }), 0).px;
  const down = L.sagitta(L.makeCamera({ W: 3000, H: 2000, fovH: 120, lens: "fish", pitch: -0.2 }), 0).px;
  assert.ok(up > 50 && down < -50, `${up} ${down}`);   // Lynch : au-dessus du centre bombé vers le haut, en dessous vers le bas
});

test("rectilinear globe sagitta barely depends on tilt (Lynch case, ±20°)", () => {
  const d = L.dip(LYNCH_PHOTO.h, L.K_STD);
  const v = [-20, 0, 20].map((p) => L.sagitta(L.makeCamera({ W: 4000, H: 2667, fovH: LYNCH_PHOTO.fovH, pitch: p * D2R }), d).px);
  assert.ok(Math.max(...v) - Math.min(...v) < 0.02 * v[1], v.join(" "));
});

test("Lynch 2008: 35,000 ft, 62.7° field, horizon centred -> measured 0.51°; computed 0.53° refracted, 0.57° geometric", () => {
  const g = L.sagittaAt(LYNCH_PHOTO.h, { fovH: LYNCH_PHOTO.fovH }).rad / D2R;
  const r = L.sagittaAt(LYNCH_PHOTO.h, { fovH: LYNCH_PHOTO.fovH, k: L.K_STD }).rad / D2R;
  assert.ok(Math.abs(g - 0.567) < 0.005 && Math.abs(r - 0.529) < 0.005, `${g} ${r}`);
  assert.ok(Math.abs(r - LYNCH_PHOTO.sagDeg) < 0.03);   // le texte dit « 0.02° sous la valeur réfractée »
});

test("heightForSagitta inverts sagittaAt and grows with a narrower field", () => {
  const h = L.heightForSagitta(2, { fovH: 60, W: 4000 });
  assert.ok(Math.abs(L.sagittaAt(h, { fovH: 60, W: 4000 }).px - 2) < 1e-3);
  assert.ok(L.heightForSagitta(2, { fovH: 30, W: 4000 }) > h && L.heightForSagitta(2, { fovH: 90, W: 4000 }) < h);
  assert.ok(L.heightForSagitta(2, { fovH: 60, W: 4000, k: L.K_STD }) > h);    // la réfraction retarde la courbure
  assert.equal(L.heightForSagitta(1e9, { fovH: 60, W: 4000 }), null);
});

test("sagitta grows monotonically with height (the bisection relies on it)", () => {
  let prev = -1;
  for (let e = -2; e <= 6.3; e += 0.05) { const s = L.sagittaAt(10 ** e, { fovH: 60 }); assert.ok(s && s.px >= prev); prev = s.px; }
});

test("Earth's curvature (surface drop) is independent of the observer: 7.85 m at 10 km", () => {
  assert.ok(Math.abs(L.surfaceDrop(10000) - 7.848) < 0.01);
});

test("steel-man haze edge: fitted at 35,000 ft, it matches there and fails at 2 m and 22 km", () => {
  const D = L.flatEdgeFit(LYNCH_PHOTO.h);
  assert.ok(Math.abs(L.flatEdgeDip(LYNCH_PHOTO.h, D) - L.dip(LYNCH_PHOTO.h)) < 1e-12);
  assert.ok(L.flatEdgeDip(2, D) < L.dip(2) / 50);
  assert.ok(L.flatEdgeDip(22066, D) > L.dip(22066) * 1.3);
});

test("reports are ordered by height and every prose number is computed", () => {
  for (let i = 1; i < LYNCH_REPORTS.length; i++) assert.ok(LYNCH_REPORTS[i].h > LYNCH_REPORTS[i - 1].h);
  const v = proseValues();
  for (const [k, x] of Object.entries(v)) assert.ok(typeof x === "string" && x.length && !/NaN|undefined/.test(x), k);
  assert.equal(v.lynchRef, "0.53°"); assert.equal(v.lynchGeo, "0.57°"); assert.equal(v.flatD, "184 km");
});

test("radial maps: a horizon through the centre stays straight with every lens; off-centre only the ordinary law keeps it straight", async () => {
  const { LENSES } = await import("../../core/lenses.js");
  for (const Lk of LENSES.map((L) => L.k)) {
    const c0 = L.makeCamera({ W: 4000, H: 2667, fovH: 100, lens: Lk });
    const s = (v) => L.sagitta(L.makeCamera({ W: 4000, H: 2667, fovH: 100, lens: Lk, pitch: L.pitchForHorizonAt(c0, 0, v) }), 0);
    assert.ok(Math.abs(s(0).px) < 1e-6, `${Lk} centre`);
    const top = s(800).px, bottom = s(-800).px;
    if (Lk === "r35") assert.ok(Math.abs(top) < 1e-6 && Math.abs(bottom) < 1e-6);
    else assert.ok(top > 10 && bottom < -10, `${Lk} ${top} ${bottom}`);   // Lynch : bombé vers le haut en haut, vers le bas en bas
  }
});

test("pitchForHorizonAt puts the middle of the horizon where asked", () => {
  for (const Lk of ["r35", "r14", "eqd", "ort"]) {
    const c0 = L.makeCamera({ W: 3000, H: 2000, fovH: 90, lens: Lk }), d = L.dip(10668, L.K_STD);
    const p = L.pitchForHorizonAt(c0, d, 600);
    const s = L.sagitta(L.makeCamera({ W: 3000, H: 2000, fovH: 90, lens: Lk, pitch: p }), d);
    assert.ok(Math.abs(s.vCentre - 600) < 1e-6, Lk);
  }
});

test("depth animation: Turning Torso shots, timeline, scale model keeps hidden heights", async () => {
  const { DEPTH, TORSO } = await import("../../data/presets/curv.js");
  const S = TORSO.shots, T = L.depthDuration(DEPTH, S);
  // les mètres mesurés de l'auteur = sol + socle + segments cachés × 19,53 m
  for (const s of S) assert.ok(Math.abs(TORSO.ground + TORSO.base + s.seg * TORSO.seg - s.hid) < 0.6, s.id);
  assert.ok(Math.abs(TORSO.height - 192.6) < 1, "sommet ≈ LiDAR 192,6 m");
  const a = L.depthAt(0, DEPTH, S), b = L.depthAt(T, DEPTH, S);
  assert.deepEqual([a.h, a.d, a.phase], [DEPTH.eye, DEPTH.d0, 0]);
  assert.ok(Math.abs(b.h - DEPTH.hMax) < 1e-6 && b.d === S[6].d && b.phase === 1 && b.climb === 1);
  // chaque prise est atteinte et affichée pendant son arrêt
  const K = L.depthKeys(DEPTH, S);
  for (const s of S) { const k = K.filter((q) => q.shot === s); assert.equal(k.length, 2, s.id);
    const m = L.depthAt((k[0].t + k[1].t) / 2, DEPTH, S); assert.equal(m.shot, s); assert.ok(Math.abs(m.h - s.h) < 1e-9 && m.d === s.d); }
  // mesures entre le globe sans réfraction et k ≈ 0,2 ; le plan ne cache rien
  for (const s of S) {
    const H = L.hiddenBoth(s.h, s.d), k = L.kToMatch(s.h, s.d, s.hid);
    assert.ok(s.hid <= H.geo + 0.5 && k > 0.05 && k < 0.2, `${s.id}: ${s.hid} vs ${H.geo}, k = ${k}`);
  }
  // valeurs de l'auteur (k nécessaire, arrondi) : A 0,076, F 0,187
  assert.ok(Math.abs(L.kToMatch(3.7, 25000, 23) - 0.076) < 0.01 && Math.abs(L.kToMatch(2.1, 47900, 114) - 0.187) < 0.01);
  // maquette : Terre R/ex, distance dessinée ≈ d/√ex, hauteur cachée EXACTE ; ex = 1 en haut
  const s0 = L.modelScale(DEPTH.eye, DEPTH);
  assert.equal(s0.ex, DEPTH.ex1);
  for (const [h, d] of [[2.1, 20000], [2.1, 47900], [17.6, 47900], [120, 60000]]) {
    const t = L.hiddenBoth(h, d).geo, sc = L.modelScale(h, DEPTH), dm = L.modelDist(d, h, sc.R);
    assert.ok(Math.abs(L.hiddenBoth(h, dm, sc.R).geo - t) < 1e-6, `${h} ${d}`);
    assert.ok(Math.abs(dm / (d * sc.dist) - 1) < 0.1, `${h} ${d}: ≈ d/√ex`);
  }
  assert.ok(Math.abs(L.modelScale(DEPTH.hMax, DEPTH).ex - 1) < 1e-9);
  // le contraste : à 2,1 m, 143 m cachés à 47,9 km, mais la flèche sur 90° est sous le pixel
  assert.ok(L.hiddenBoth(2.1, 47900).geo > 140 && L.sagittaAt(2.1, { fovH: 90, W: 4000 }).px < 1);
});
