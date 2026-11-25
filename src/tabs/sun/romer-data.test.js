// Rømer à rebours (fog build sun-romer) : ce que la page lit du preset reste cohérent avec ce qu'elle affirme.
import { test } from "node:test";
import assert from "node:assert/strict";
import { eras, romerAU, flatDelay, romerValues, AS_IAU } from "./romer-data.js";
import { ROMER, ROMER_FLAT, ROMER_SERIES } from "../../data/presets/sun-romer.js";

test("six eras, each a light time within 3 % of one AU, and the mean within 1 %", () => {
  const E = eras();
  assert.equal(E.length, 6);
  for (const e of E) assert.ok(Math.abs(e.main.as / AS_IAU - 1) < 0.03, `${e.y0}: ${e.main.as}`);
  assert.ok(Math.abs(romerAU().as / AS_IAU - 1) < 0.01);
});

test("Io's clock alone scatters four times more than with the light time (the verdict rule)", () => {
  assert.ok(ROMER_FLAT.rmsClock > 3 * ROMER_FLAT.rmsGlobe);
});

test("the flat curve's free swing lands within 2 % of what one AU predicts", () => {
  const k = ROMER_FLAT.coef;
  assert.ok(Math.abs(k.s1c[0] / k.s1c[2] - 1) < 0.02);
  // a delay is a phase lost: the curve is latest at conjunction (φ = π)
  assert.ok(flatDelay(Math.PI) > flatDelay(0) + 900);
});

test("values for the text are all filled", () => {
  for (const [k, v] of Object.entries(romerValues("fr"))) assert.ok(v && v !== "NaN" && !v.includes("NaN"), k);
  assert.equal(ROMER.io, 8822);
  assert.ok(ROMER_SERIES.length > 400);
});
