// Projection AE (epic18/UC01) : node --test src/core/aeproj.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeAE, gcDeg, toScreen, fromScreen } from "./aeproj.js";
import { seisAE, seisDelta } from "../tabs/seis/logic.js";
import { twiAE } from "../tabs/twi/logic.js";
import { aeXY as eclAE, AE_K } from "../tabs/ecl/logic.js";
import { aeXY as aviaAE } from "../tabs/avia/logic.js";

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b}`);
// points pseudo-aléatoires reproductibles
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pts = Array.from({ length: 1000 }, () => [Math.asin(2 * rnd() - 1) * 180 / Math.PI, 360 * rnd() - 180]);

test("le rayon sur la carte est exactement la distance angulaire au centre, pour tout centre", () => {
  for (const [la0, lo0] of [[90, 0], [-90, 30], [3.3, 96], [-36, -73], [48.85, 2.35]]) {
    const m = makeAE({ lat0: la0, lon0: lo0, rot: 37 });
    for (const [la, lo] of pts) { const [x, y] = m.fwd(la, lo); near(Math.hypot(x, y), gcDeg(la0, lo0, la, lo), 1e-9, "ρ = c"); }
  }
});

test("aller-retour fwd/inv à 1e-9 (loin de l'antipode)", () => {
  for (const [la0, lo0, rot] of [[90, 0, 0], [3.3, 96, 0], [-36, -73, 90], [48.85, 2.35, -20]]) {
    const m = makeAE({ lat0: la0, lon0: lo0, rot });
    for (const [la, lo] of pts) {
      if (gcDeg(la0, lo0, la, lo) > 179 || Math.abs(la) > 89.99) continue;
      const [a, b] = m.inv(...m.fwd(la, lo));
      near(a, la, 1e-9, "lat"); near(((b - lo + 540) % 360) - 180, 0, 1e-9, "lon");
    }
    assert.equal(m.inv(0, 181), null, "hors du disque");
    near(Math.hypot(...m.fwd(-la0, lo0 + 180)), 180, 1e-9, "l'antipode est le bord");
  }
});

test("gcDeg rejoint seisDelta", () => {
  for (let i = 0; i < 999; i += 2) near(gcDeg(...pts[i], ...pts[i + 1]), seisDelta(...pts[i], ...pts[i + 1]), 1e-6, "Δ");
});

// les formules d'origine, écrites en dur : seisAE/twiAE et les aeXY délèguent désormais au moteur (epic18/UC02)
const D = Math.PI / 180;
const OLD = { seisAE: (la, lo) => ({ x: -(90 - la) * Math.sin(lo * D), y: -(90 - la) * Math.cos(lo * D) }),
  eclAE: (la, lo) => [(90 - la) * AE_K * Math.cos(lo * D), (90 - la) * AE_K * Math.sin(lo * D)] };

test("parité : seisAE et twiAE = la carte polaire en miroir est-ouest (formule d'origine et fonctions déléguées)", () => {
  const m = makeAE();
  for (const [la, lo] of pts) {
    const [x, y] = m.fwd(la, lo), o = OLD.seisAE(la, lo), s = seisAE(la, lo), t = twiAE(la, lo);
    near(-x, o.x, 1e-9, "formule x"); near(y, o.y, 1e-9, "formule y");
    near(s.x, o.x, 1e-9, "seis x"); near(s.y, o.y, 1e-9, "seis y"); near(t.x, o.x, 1e-9, "twi x"); near(t.y, o.y, 1e-9, "twi y");
  }
});

test("parité : aeXY d'ecl et d'avia = la carte polaire tournée de 90°, en km", () => {
  const m = makeAE({ rot: 90 }), K = (Math.PI / 180) * 6371;   // km par degré d'avia (R_KM = 6371)
  for (const [la, lo] of pts) {
    const [x, y] = m.fwd(la, lo), e = eclAE(la, lo), a = aviaAE([la, lo]), o = OLD.eclAE(la, lo);
    near(x * AE_K, o[0], 1e-6, "formule 0"); near(y * AE_K, o[1], 1e-6, "formule 1");
    near(e[0], o[0], 1e-6, "ecl 0"); near(e[1], o[1], 1e-6, "ecl 1");
    near(x * K, a[0], 1e-6, "avia 0"); near(y * K, a[1], 1e-6, "avia 1");
  }
});

test("toScreen / fromScreen se défont ; miroir et y vers le bas", () => {
  const o = { cx: 200, cy: 150, Rpx: 120, mirror: true }, S = toScreen(o), F = fromScreen(o);
  for (const [x, y] of [[0, 0], [30, -40], [-179, 2]]) { const [px, py] = S([x, y]); const [a, b] = F(px, py); near(a, x, 1e-12, "x"); near(b, y, 1e-12, "y"); }
  assert.deepEqual(S([0, 90]), [200, 90], "le nord vers le haut");
  assert.deepEqual(S([90, 0]), [140, 150], "miroir : l'est à gauche");
});

test("masque des terres : points connus, et ~29 % de terres pondérées par la surface", async () => {
  const { isLand } = await import("./aemap.js");
  for (const [la, lo, v, w] of [[48.85, 2.35, true, "Paris"], [0, 0, false, "golfe de Guinée"], [23, 10, true, "Sahara"], [0, -150, false, "Pacifique"], [-80, 0, true, "Antarctique"], [40, -100, true, "Kansas"], [35, 18, false, "Méditerranée"]])
    assert.equal(isLand(la, lo), v, w);
  let land = 0, tot = 0;
  for (let la = -89.75; la < 90; la += 0.5) { const w = Math.cos(la * Math.PI / 180); for (let lo = -179.75; lo < 180; lo += 0.5) { tot += w; if (isLand(la, lo)) land += w; } }
  near(land / tot, 0.29, 0.02, "fraction de terres");
});

test("parité d'écran : la carte de l'animation seis (rot 180, sans miroir) tombe exactement sur seisAE", () => {
  const S = 1.7, cx = 200, cy = 180, m = makeAE({ rot: 180 }), T = toScreen({ cx, cy, Rpx: 180 * S });
  for (const [la, lo] of pts) {
    const a = seisAE(la, lo), [px, py] = T(m.fwd(la, lo));
    near(px, cx + a.x * S, 1e-9, "x"); near(py, cy + a.y * S, 1e-9, "y");
  }
});

test("parité d'écran : la carte d'obs (polaire, sans rotation ni miroir) = (cx + r sin λ, cy + r cos λ)", () => {
  const cx = 190, cy = 170, Rpx = 150, T = toScreen({ cx, cy, Rpx }), m = makeAE();
  for (const [la, lo] of pts) {
    const r = ((90 - la) / 180) * Rpx, [px, py] = T(m.fwd(la, lo));
    near(px, cx + r * Math.sin((lo * Math.PI) / 180), 1e-9, "x"); near(py, cy + r * Math.cos((lo * Math.PI) / 180), 1e-9, "y");
  }
});

test("parité d'écran : la carte plate d'ecl, X(aeXY) = makeAE() sans rotation", () => {
  const cx = 200, cy = 160, Rpx = 140, Rkm = 180 * AE_K, T = toScreen({ cx, cy, Rpx }), m = makeAE();
  for (const [la, lo] of pts) {
    const p = OLD.eclAE(la, lo), [px, py] = T(m.fwd(la, lo));
    near(px, cx + (p[1] / Rkm) * Rpx, 1e-9, "x"); near(py, cy + (p[0] / Rkm) * Rpx, 1e-9, "y");
  }
});

test("parité d'écran : aeDisc d'avia (toute rotation) = makeAE({ rot: 90 − rot }) sans miroir", async () => {
  const { aeDisc } = await import("../tabs/avia/draw.js");
  for (const rot of [90, 0, 37, 90 + 140]) {
    const cx = 210, cy = 190, Rpx = 160, D = aeDisc(cx, cy, Rpx, rot), T = toScreen({ cx, cy, Rpx }), m = makeAE({ rot: 90 - rot });
    for (const [la, lo] of pts.slice(0, 200)) { const a = D.xy([la, lo]), b = T(m.fwd(la, lo)); near(b[0], a[0], 1e-6, `x rot ${rot}`); near(b[1], a[1], 1e-6, `y rot ${rot}`); }
  }
});

test("parité 2,5D : l'image des terres posée par distLandAffine tombe sur aePoint projeté (caméra linéaire quelconque)", async () => {
  const { distLandAffine, aePoint } = await import("../tabs/dist/logic.js");
  const P = (q) => [300 + 120 * (0.8 * q[0] - 0.3 * q[2]), 200 - 120 * (0.4 * q[1] - 0.5 * q[0] - 0.6 * q[2])];   // une caméra orthographique arbitraire
  const S = 1.5 / Math.PI, n = 512, m = makeAE(), [A, B, C, D, E, F] = distLandAffine(P([0, 0, 0]), P([1, 0, 0]), P([0, 0, 1]), n, S);
  for (const [la, lo] of pts.slice(0, 300)) {
    const [x, y] = m.fwd(la, lo), i = x / (360 / n) + n / 2, j = -y / (360 / n) + n / 2;
    const scr = [A * i + C * j + E, B * i + D * j + F], ref = P(aePoint([la, lo], S));
    near(scr[0], ref[0], 1e-6, "x"); near(scr[1], ref[1], 1e-6, "y");
  }
});
