// L'exemple de jauge de l'onglet ref (2026-10-14) : l'air qu'il faut à chaque modèle pour le dip de Caussols.
import { test } from "node:test";
import assert from "node:assert/strict";
import { nAir, tFromN, nEyeNeeded, causNumbers, R } from "./caussols-air.js";

test("index <-> temperature round trip; equal indices give the straight-light dips", () => {
  assert.ok(Math.abs(tFromN(nAir(19.1, 887.27), 887.27) - 19.1) < 1e-9);
  const n0 = nAir(21.9, 1020.65), h = 1210;
  // globe, same index at both ends: cos δ = R/(R + h), the geometric dip
  const geo = (Math.acos(R / (R + h)) * 180 * 60) / Math.PI;
  assert.ok(Math.abs(nEyeNeeded("globe", geo, n0, h) - n0) < 1e-12);
  // plane: no dip with equal indices; any dip needs a higher index at the eye
  assert.equal(nEyeNeeded("flat", 0, n0, h), n0);
  assert.ok(nEyeNeeded("flat", 60, n0, h) > n0);
});

test("Caussols: the plane needs about −118 °C at the eye, the globe a few kelvins to tens of kelvins colder than the day", () => {
  const N = causNumbers();
  assert.ok(N.flat.T < -100 && N.flat.T > -130, `plane ${N.flat.T}`);
  assert.ok(N.flat.grad < -0.0343 * 3, "beyond three times the autoconvective lapse rate");
  assert.ok(N.globe.Tlo < N.globe.T && N.globe.T < N.globe.Thi);
  assert.ok(N.globe.T > -30 && N.globe.T < 15, `globe ${N.globe.T}`);
  assert.ok(Math.abs(N.globe.grad - N.day.grad) < Math.abs(N.flat.grad - N.day.grad) / 3, "the globe is several times closer to the day's air");
});
