// Séismes relocalisés (epic18/UC03-04) : node --test src/tabs/seis/relocate.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { RELOC_QUAKES, RELOC_MAPS, curve, fitCurve, looFixed, globeDist, globeCheck, flatMap, flatDist, fitFlatOnMap, mapSummary, isMonotone, rootsOf } from "./relocate.js";
import { makeAE } from "../../core/aeproj.js";
import { gcDeg } from "../../core/aeproj.js";

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b} (±${tol})`);
const Q = Object.fromEntries(RELOC_QUAKES.map((q) => [q.key, q]));

test("9 séismes ; les stations retenues sont entre 25 et 95° de notre centre (de l'avant-dernière itération : ±0,5°)", () => {
  assert.equal(RELOC_QUAKES.length, 9);
  for (const q of RELOC_QUAKES) for (const d of globeDist(q)) assert.ok(d >= 24.5 && d <= 95.5, `${q.key} ${d}`);
});

test("fitCurve retrouve une cubique exacte", () => {
  const d = [25, 40, 55, 70, 85, 95], c = [100, 900, -300, 40], t = d.map((x) => curve(c, x));
  const f = fitCurve(d, t); c.forEach((v, i) => near(f.coef[i], v, 1e-6, `c${i}`));
});

test("le globe : la dispersion du script se rejoue au centre et avec la courbe publiés", () => {
  for (const q of RELOC_QUAKES) { const g = globeCheck(q); near(g.sd, q.P.sd, 0.05, q.key); assert.equal(g.n, q.P.n, q.key); }
});

test("le globe : l'exclusion refaite d'un coup à centre fixe garde presque les mêmes stations (le script alterne)", () => {
  for (const q of RELOC_QUAKES) {
    const f = looFixed(globeDist(q), q.pP.map((r) => r[2]));
    assert.ok(Math.abs(f.n - q.P.n) <= Math.max(3, 0.05 * q.P.n), `${q.key} ${f.n} vs ${q.P.n}`); near(f.sd, q.P.sd, 0.35, q.key);
  }
});

test("nos centres tombent à moins d'un degré de l'ISC, sans s'en être servis", () => {
  for (const q of RELOC_QUAKES) {
    const off = gcDeg(q.official[0], q.official[1], q.P.lat, q.P.lon);
    near(off, q.P.offset_deg, 0.01, q.key); assert.ok(off < 1, `${q.key} ${off}°`);
  }
});

test("le plat sur la carte polaire, rejoué en JS : même dispersion que le script, et toujours pire que le globe", () => {
  const map = flatMap();
  for (const key of ["maule2010", "kuril2006"]) {   // un séisme du sud, un du nord (le cas le plus favorable au plat)
    const q = Q[key], f = fitFlatOnMap(q, map);
    near(f.sd, q.Pflat.sd, 0.05 * q.Pflat.sd + 0.1, `${key} flat`);
    assert.ok(f.sd > q.P.sd, `${key}: plat ${f.sd} > globe ${q.P.sd}`);
  }
});

test("sur SA carte (centrée sur son épicentre), un séisme est décrit aussi bien que sur le globe", () => {
  const M = RELOC_MAPS;
  RELOC_QUAKES.forEach((q, i) => {
    const own = M.named[i].sd[i];
    assert.ok(Math.abs(own - q.P.sd) < 0.6 + 0.1 * q.P.sd, `${q.key}: sa carte ${own} s, globe ${q.P.sd} s`);
  });
});

test("une seule carte pour les neuf : aucune ne fait aussi bien que le globe (résultat montré tel quel)", () => {
  const S = mapSummary();
  near(S.globe, 1.8, 0.05, "globe"); near(S.pole, 11.99, 0.1, "carte polaire"); near(S.best.rms, 7.25, 0.1, "meilleure carte");
  assert.deepEqual(S.best.c, [58, 141]);
  for (const r of [...RELOC_MAPS.grid, ...RELOC_MAPS.fine, ...RELOC_MAPS.named]) assert.ok(r.rms > S.globe * 2, `carte ${r.c} : ${r.rms} s`);
  // et la carte d'un séisme est mauvaise pour les autres
  for (const rms of S.ownMapAll) assert.ok(rms > S.pole * 0.6, `${rms}`);
});

test("les ondes de surface : un tour du monde de 2 à 3,6 h, sans aucun km", () => {
  for (const q of RELOC_QUAKES) assert.ok(q.LR.lap_h > 2 && q.LR.lap_h < 3.6, `${q.key} ${q.LR.lap_h}`);
});

test("flatDist : sur la carte centrée au centre du séisme, la distance de carte EST la distance de grand cercle", () => {
  const q = Q.tohoku2011, map = flatMap(q.P.lat, q.P.lon), d = flatDist(q, map, 0, 0), g = globeDist(q);
  d.forEach((x, i) => near(x, g[i], 1e-6, "d"));
});

test("une onde ne peut pas arriver plus tôt plus loin : la courbe du globe croît pour les 9 ; celle du plat, non (7 sur 9 au pôle, 4 sur 9 sur la meilleure carte)", () => {
  for (const q of RELOC_QUAKES) assert.ok(isMonotone(q.P.coef, 25, 95), `globe ${q.key}`);
  const count = (row, c) => { const map = makeAE({ lat0: c[0], lon0: c[1] });
    return RELOC_QUAKES.filter((q, i) => { const f = row.fits[i], dd = q.pP.filter((r) => r[3] === 1).map((r) => { const [a, b] = map.fwd(r[0], r[1]); return Math.hypot(a - f[0], b - f[1]); });
      return !isMonotone(f.slice(2, 6), Math.min(...dd), Math.max(...dd)); }).length; };
  assert.equal(count(RELOC_MAPS.named[RELOC_MAPS.named.length - 1], [90, 0]), 7);
  assert.equal(count(RELOC_MAPS.best, RELOC_MAPS.best.c), 4);
  assert.deepEqual(rootsOf([0, 100, 0, 0], 50, 0, 100).map((x) => +x.toFixed(6)), [50]);
});
