// Les dips d'avion dans la statistique de l'air de l'onglet ref (2026-11-13).
import { test } from "node:test";
import assert from "node:assert/strict";
import { flightNeye, flightDips, rows, label, notes } from "./air.js";
import { bestOffset, summarize } from "../../../core/air-need.js";

test("equal indices give the geometric dip on the globe; the plane needs a denser eye for any dip", () => {
  const R = 6371e3, p = { nHz: 270, zhA: 0, h: 5000 }, geo = (Math.acos(R / (R + p.h)) * 180) / Math.PI;
  assert.ok(Math.abs(flightNeye("globe", p, geo) - 270) < 1e-6);
  assert.ok(Math.abs(flightNeye("flat", p, 0) - 270) < 1e-9);
  assert.ok(flightNeye("flat", p, 2) > 270 + 500);
  const d = flightDips({ dip: 2, dipExif: 2.2, tilt: 0.1, sigTilt: 0.2 });
  assert.ok(d.lo < d.dip && d.dip < d.hi && Math.abs(d.dip - 2.1) < 1e-12);
});

test("eleven rows; the globe's best offset is a few tenths of a degree and the plane stays beyond 2 σ everywhere", () => {
  const r = rows();
  assert.equal(r.length, 11);
  const at = (b) => rows({ b: { globe: b, flat: b } }), g = bestOffset(at, "globe"), f = bestOffset(at, "flat");
  assert.ok(g.b > 0 && g.b < 0.6, `globe ${g.b}`);
  const sh = rows({ b: { globe: g.b, flat: f.b } });
  assert.ok(sh.every((x) => x.flat.z < -2));
  assert.ok(summarize(sh).flat.chi2 > 3 * summarize(sh).globe.chi2);
  assert.match(label(r[0], "en", String), /^#\d+ flight [12], /);
  const part = { raw: r, shifted: sh, off: { globe: g, flat: f }, sum: summarize(r), sumShifted: summarize(sh) };
  assert.match(notes("fr", part), /onze dips/);
});
