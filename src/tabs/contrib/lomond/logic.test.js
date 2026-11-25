import test from "node:test";
import assert from "node:assert/strict";
import { R, K, elevL, horizonL, fraction, cForF, gradFor, airSeaFor, fAtGrad, kFromGrad, gradFromK, lomNumbers, photoToAnglesL, ltimeline, LCYCLE, lPhotoAt, decodeFanL } from "./logic.js";
import { LOM_SITE as S, LOM_PHOTO as PH, LOM_AIR as AIR, LOM_TRACED as TR, LOM_SEAAIR as SA, LOM_TRACED_AS as TAS, LOM_FAN } from "../../../data/presets/contrib-lomond.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("f: half the rock or so on the globe, above the rock on the plane with straight light", () => {
  const f1 = fraction(1, S), f0 = fraction(0, S);
  assert.ok(f1 > 0.45 && f1 < 0.55, `globe straight ${f1}`);
  assert.ok(f0 > 1, `plane straight: the horizon above the summit (${f0})`);
  assert.ok(fraction(1 - K, S) > f1, "refraction raises the horizon on the rock");
  // the closed form of the package doc
  const c = 0.9, e = S.e, H = S.Hw, d = S.rock.d;
  near(fraction(c, S), (d / H) * (e / d + (c * d) / (2 * R) - Math.sqrt((2 * c * e) / R)), 2e-4);
});

test("cForF inverts fraction; same c, same picture for both models", () => {
  for (const c of [0.5, 0.83, 1, 1.3]) near(cForF(fraction(c, S), S), c, 1e-6);
  near(horizonL(1, S.e, S.dMax), -Math.sqrt((2 * S.e) / R), 1e-15);
  assert.equal(horizonL(-0.13, S.e, S.dMax), elevL(-0.13, S.e, S.dMax, 0));
});

test("the photograph: k ≈ 0.18 on the globe, k ≈ −0.82 on the plane", () => {
  const n = lomNumbers(S, PH, AIR, TR, SA);
  near(n.kG, 0.182, 0.02); near(n.kF, -0.818, 0.02);
  near(n.c, S.c, 1e-3, "same as fog's");
  // the plane needs the air to fall by more than the autoconvective lapse rate over the whole column
  assert.ok(n.needF.mid < -0.0343 * 3, `plane ${n.needF.mid}`);
  assert.ok(Math.abs(n.needG.mid) < 0.03, `globe ${n.needG.mid}`);
  // air − sea: the globe needs the sea a little warmer than the air, nearer 0 than the models; nothing saves the plane
  assert.ok(n.saG.mid < 0 && n.saG.mid > AIR.airSeaEra && n.saG.lo < n.saG.mid && n.saG.mid < n.saG.hi, `globe ${JSON.stringify(n.saG)}`);
  assert.equal(n.saF.mid, null);
  assert.equal(airSeaFor(SA, "globe", 0.01), null);
  // the same margin for both: the band covers the GFS value; the plane's best case is still beyond autoconvective
  const m = lomNumbers(S, PH, AIR, TR, SA, TAS);
  for (const [k, need] of [["symG", m.needG], ["symF", m.needF]]) assert.ok(m[k].lo <= need.mid && need.mid <= m[k].hi, k);
  assert.ok(m.symF.best < -0.0343 * 3, `plane best ${m.symF.best}`);
});

test("traced grid interpolation both ways; k <-> dT/dz", () => {
  const g = gradFor(TR, "globe", 0.6);
  near(fAtGrad(TR, "globe", g), 0.6, 1e-9);
  near(kFromGrad(-0.0343, 1013, 288), 0, 1e-12);
  near(gradFromK(kFromGrad(-0.0065, 1013, 288), 1013, 288), -0.0065, 1e-12);
  near(kFromGrad(-0.0065, 1013, 288), 0.17, 0.01, "standard atmosphere");
});

test("the photograph's summit and foot land on the rock's summit and foot", () => {
  const c = S.c, [a0, e0] = photoToAnglesL(S, PH, c, PH.summitX, PH.summitRow);
  near(a0, 0, 1e-12); near(e0, elevL(c, S.e, S.rock.d, S.Hw), 1e-12);
  const [, eb] = photoToAnglesL(S, PH, c, PH.summitX, PH.base);
  near(eb, elevL(c, S.e, S.rock.d, 0), 1e-5);
});

test("timeline and the view", () => {
  const L = ltimeline(lPhotoAt(), 0.83);
  assert.equal(L.phase, "photo"); assert.equal(L.cG, 0.83); assert.equal(L.cF, 0.83);
  assert.equal(ltimeline(0, 0.83).cG, 1); assert.equal(ltimeline(0, 0.83).cF, 0);
  assert.equal(ltimeline(LCYCLE, 0.83).phase, "straight");
  const F = decodeFanL(LOM_FAN);
  assert.equal(F.cols.length, F.nAz);
  // the rock: at its azimuth, a cell at its distance near its surveyed height
  const j = Math.round((S.rock.az - F.az0) / F.azStep), rock = F.cols[j].filter(([d]) => Math.abs(d - S.rock.d) < 600);
  assert.ok(rock.length > 0);
  near(Math.max(...rock.map(([, h]) => h)), S.rock.H, 6);
});
