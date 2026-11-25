import { test } from "node:test";
import assert from "node:assert/strict";
import { loops3D, draw3D } from "./field3d.js";
import { MAG_D1, MAG_D2, flat2RawZ } from "./logic.js";

// champ d'un dipôle de moment −z placé en (0, 0, z0) : B ∝ 3(m·r̂)r̂ − m
const dipole = (z0) => ([x, y, z]) => {
  const r = [x, y, z - z0], L = Math.hypot(...r), u = r.map((c) => c / L), mu = -u[2];
  return u.map((c, i) => (3 * mu * c - (i === 2 ? -1 : 0)) / L ** 3);
};
// ② : champ méridien de logic.js, remis en 3D
const flat2 = ([x, y, z]) => {
  const r = Math.hypot(x, y), b = flat2RawZ(r, z, MAG_D2);
  return r < 1e-9 ? [0, 0, b.Bz] : [(b.Bx * x) / r, (b.Bx * y) / r, b.Bz];
};
const FIELD = { globe: dipole(0), flat1: dipole(-MAG_D1), flat2 };

test("every drawn field line is a closed loop (div B = 0: no line begins or ends)", () => {
  for (const m of ["globe", "flat1", "flat2"]) {
    const loops = loops3D(m);
    assert.ok(loops.length >= 12, m);
    for (const l of loops) {
      const a = l[0], b = l[l.length - 1];
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1e-6, `${m}: loop not closed`);
    }
  }
});

test("each loop runs in the direction of B, checked against the model's own field", () => {
  for (const m of ["globe", "flat1", "flat2"]) {
    let checked = 0;
    for (const l of loops3D(m)) for (let i = 2; i < l.length - 2; i += 7) {
      const p = l[i], q = l[i + 1];
      if (m === "flat2" && p[2] === -MAG_D2 && q[2] === -MAG_D2) continue; // retour DANS le disque aimanté : B = μ0(H + M), pas le champ des pôles
      const t = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], B = FIELD[m](p);
      const cos = (t[0] * B[0] + t[1] * B[1] + t[2] * B[2]) / (Math.hypot(...t) * Math.hypot(...B) || 1);
      if (Math.hypot(...p) < 1500 || Math.hypot(p[0], p[1], p[2] + MAG_D1) < 1500) continue; // près des singularités ponctuelles
      assert.ok(cos > 0.9, `${m} at ${p.map(Math.round)}: cos ${cos.toFixed(3)}`);
      checked++;
    }
    assert.ok(checked > 50, `${m}: ${checked} points checked`);
  }
});

test("flat (2): the return path lies in the buried disc and runs outward, centre -> rim", () => {
  for (const l of loops3D("flat2")) {
    const back = l.filter((p) => p[2] === -MAG_D2);
    const r = back.map((p) => Math.hypot(p[0], p[1]));
    const tail = r.slice(-20);
    for (let i = 1; i < tail.length; i++) assert.ok(tail[i] > tail[i - 1]);
  }
});

test("draw3D draws all three models on a Canvas-2D-like context without throwing", () => {
  const noop = () => {};
  const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : noop), set: (t, k, v) => ((t[k] = v), true) });
  for (const m of ["globe", "flat1", "flat2"]) {
    const { sc } = draw3D(ctx, m, 0, 0, 380, 300, { yaw: 20, pitch: 30, lang: "fr" });
    assert.ok(sc > 0 && Number.isFinite(sc), m);
  }
});
