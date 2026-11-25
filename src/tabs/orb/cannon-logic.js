// Le canon de Newton à 400 km (onglet orb, 2026-11-11, demande du propriétaire) : des tirs horizontaux de plus en
// plus forts, chacun réglé pour une PORTÉE au sol donnée (0 m, 100 m, 100 km … ), jusqu'à l'orbite. Fonctions pures.
//
// Hypothèses, dites dans la page : Terre sphérique de rayon moyen R = 6 371 km, attraction GM/r² seule (ni air ni
// rotation de la Terre), canon immobile à h = 400 km. GM est celui que la page tire elle-même de l'orbite des GPS
// (logic.js, gmFromOrbit : 3,986 × 10¹⁴ m³/s², à 0,1 % de la valeur IERS).
//
// Formules (problème à deux corps ; Newton, Principia, livre I, prop. 11-13 ; p. ex. Bate, Mueller & White,
// Fundamentals of Astrodynamics, 1971, § 1.5-1.7) : tiré horizontalement à la vitesse v depuis r0, sous la vitesse
// circulaire, le boulet part de l'APOGÉE d'une ellipse de paramètre p = (r0 v)²/GM et d'excentricité e = 1 − r0 v²/GM ;
// r(θ) = p / (1 − e cos θ), θ compté depuis le canon autour du centre de la Terre. Il touche le sol quand r = R :
// cos θ = (1 − p/R)/e, portée s = R θ. Il ne touche plus dès que le périgée p/(1 + e) dépasse R.
import { EARTH_SATS, gmFromOrbit } from "./logic.js";

export const R_EARTH = 6371e3;               // m, rayon moyen
export const H_CANNON = 400e3;               // m
export const R0 = R_EARTH + H_CANNON;
export const GM = gmFromOrbit(EARTH_SATS[1][1] * 1e6, EARTH_SATS[1][2]);   // orbite des GPS (demi-grand axe en 10⁶ km → km)
export const vCirc = (r0 = R0, gm = GM) => Math.sqrt(gm / r0);
/** Plus petite vitesse qui ne touche plus le sol (périgée = R, aux antipodes). */
export const vMiss = (r0 = R0, R = R_EARTH, gm = GM) => Math.sqrt(2 * gm * R / (r0 * (r0 + R)));
export const period = (r0 = R0, gm = GM) => 2 * Math.PI * Math.sqrt(r0 ** 3 / gm);

/** Portée au sol (m) d'un tir horizontal à v (m/s) ; Infinity s'il ne retombe pas. */
export function rangeOf(v, r0 = R0, R = R_EARTH, gm = GM) {
  if (v <= 0) return 0;
  const p = (r0 * v) ** 2 / gm, e = 1 - r0 * v * v / gm;
  if (e <= 0 || p / (1 + e) >= R) return Infinity;
  return R * Math.acos(Math.max(-1, Math.min(1, (1 - p / R) / e)));
}
/** Vitesse de tir (m/s) qui donne la portée s (m), par dichotomie (la portée croît avec la vitesse). */
export function speedFor(s, r0 = R0, R = R_EARTH, gm = GM) {
  if (s <= 0) return 0;
  let lo = 0, hi = vMiss(r0, R, gm);
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (rangeOf(m, r0, R, gm) < s) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/**
 * Le vol, intégré pas à pas (Runge-Kutta d'ordre 4, pas dt) jusqu'au sol ou pendant tMax : échantillons
 * { t, x, y } dans le plan du tir (centre de la Terre à l'origine, canon en (0, r0), tir vers +x), n points.
 * Renvoie { pts, tFlight, vImpact, landed, range } ; la portée est celle de l'angle au centre à l'impact.
 */
export function fly(v, { r0 = R0, R = R_EARTH, gm = GM, dt = 0.25, tMax = period(r0, gm), n = 360 } = {}) {
  let x = 0, y = r0, vx = v, vy = 0, t = 0; const raw = [[0, x, y, vx, vy]];
  const acc = (X, Y) => { const r3 = Math.hypot(X, Y) ** 3; return [-gm * X / r3, -gm * Y / r3]; };
  let landed = false;
  while (t < tMax) {
    const h = Math.min(dt, tMax - t);
    const [a1x, a1y] = acc(x, y);
    const [a2x, a2y] = acc(x + vx * h / 2, y + vy * h / 2), v2x = vx + a1x * h / 2, v2y = vy + a1y * h / 2;
    const [a3x, a3y] = acc(x + v2x * h / 2, y + v2y * h / 2), v3x = vx + a2x * h / 2, v3y = vy + a2y * h / 2;
    const [a4x, a4y] = acc(x + v3x * h, y + v3y * h), v4x = vx + a3x * h, v4y = vy + a3y * h;
    const nx = x + h * (vx + 2 * v2x + 2 * v3x + v4x) / 6, ny = y + h * (vy + 2 * v2y + 2 * v3y + v4y) / 6;
    const nvx = vx + h * (a1x + 2 * a2x + 2 * a3x + a4x) / 6, nvy = vy + h * (a1y + 2 * a2y + 2 * a3y + a4y) / 6;
    const rOld = Math.hypot(x, y), rNew = Math.hypot(nx, ny);
    if (rNew <= R) {                                   // le sol est franchi dans ce pas : on s'arrête dessus
      const k = (rOld - R) / (rOld - rNew);
      x += (nx - x) * k; y += (ny - y) * k; vx += (nvx - vx) * k; vy += (nvy - vy) * k; t += h * k; landed = true; raw.push([t, x, y, vx, vy]); break;
    }
    x = nx; y = ny; vx = nvx; vy = nvy; t += h; raw.push([t, x, y, vx, vy]);
  }
  const pts = [];
  for (let i = 0; i < n; i++) { const r = raw[Math.round(i * (raw.length - 1) / (n - 1))]; pts.push({ t: r[0], x: r[1], y: r[2], vx: r[3], vy: r[4] }); }
  const last = raw[raw.length - 1];
  let ang = Math.atan2(last[1], last[2]); if (ang < 0) ang += 2 * Math.PI;
  return { pts, tFlight: last[0], vImpact: Math.hypot(last[3], last[4]), landed, range: landed ? R * ang : Infinity };
}
/** Sur un plan à pesanteur uniforme g, tiré de la hauteur h : il retombe toujours, à v·√(2h/g). */
export const flatRange = (v, h = H_CANNON, g = GM / R_EARTH ** 2) => v * Math.sqrt(2 * h / g);
export const flatFall = (h = H_CANNON, g = GM / R_EARTH ** 2) => Math.sqrt(2 * h / g);

/** Les tirs de l'animation : portées demandées (m), puis l'orbite circulaire. */
export const RANGES = [0, 100, 100e3, 500e3, 1000e3, 5000e3, 15000e3];
export function shots() {
  const list = RANGES.map((s) => { const v = speedFor(s), f = fly(v); return { range: s, v, ...f, orbit: false }; });
  const vc = vCirc(), f = fly(vc);
  list.push({ range: Infinity, v: vc, ...f, orbit: true });
  return list;
}
