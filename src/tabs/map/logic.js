// Onglet "map" (2026-10-08) : histoire des cartes et des projections. Calculs purs, testés.
// Projections sur une sphère de rayon 1 (unités : radians d'arc) ; formules de
// J. P. Snyder, Map Projections -- A Working Manual, USGS PP 1395 (1987). L'azimutale
// équidistante vient du moteur commun (src/core/aeproj.js, en degrés), convertie ici.
// Aucun chiffre de cette page n'est une mesure : c'est de la géométrie et de l'histoire.
import { makeAE, gcDeg } from "../../core/aeproj.js";

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
export const R_KM = 6371.0;   // rayon moyen, pour passer des angles aux km dans les exemples (modèle)
const clampLat = (y) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, y));
const wrapLon = (l) => ((((l + 180) % 360) + 360) % 360) - 180;

/**
 * Chaque projection : fwd(lat°, lon°) → [x, y] (y vers le nord, rayon 1), inv(x, y) → [lat°, lon°] | null,
 * box = [xmin, xmax, ymin, ymax] (le cadre à dessiner).
 */
export function equirect(phi1 = 0, lon0 = 0) {
  const c1 = Math.cos(phi1 * D2R);
  return {
    id: "eqr", fwd: (la, lo) => [wrapLon(lo - lon0) * D2R * c1, la * D2R],
    inv: (x, y) => (Math.abs(y) > Math.PI / 2 || Math.abs(x) > Math.PI * c1 ? null : [y * R2D, wrapLon(x / c1 * R2D + lon0)]),
    box: [-Math.PI * c1, Math.PI * c1, -Math.PI / 2, Math.PI / 2],
  };
}
export function mercator(latMax = 80, lon0 = 0) {
  const yM = Math.log(Math.tan(Math.PI / 4 + latMax * D2R / 2));
  return {
    id: "merc", fwd: (la, lo) => [wrapLon(lo - lon0) * D2R, Math.log(Math.tan(Math.PI / 4 + clampLat(la * D2R) / 2))],
    inv: (x, y) => (Math.abs(x) > Math.PI || Math.abs(y) > yM ? null : [(2 * Math.atan(Math.exp(y)) - Math.PI / 2) * R2D, wrapLon(x * R2D + lon0)]),
    box: [-Math.PI, Math.PI, -yM, yM],
  };
}
/** Cylindrique équivalente de Lambert (1772) : y = sin φ. */
export function lambertCyl(lon0 = 0) {
  return {
    id: "lcea", fwd: (la, lo) => [wrapLon(lo - lon0) * D2R, Math.sin(la * D2R)],
    inv: (x, y) => (Math.abs(x) > Math.PI || Math.abs(y) > 1 ? null : [Math.asin(y) * R2D, wrapLon(x * R2D + lon0)]),
    box: [-Math.PI, Math.PI, -1, 1],
  };
}
/** Sinusoïdale (Sanson-Flamsteed) : équivalente, parallèles en vraie grandeur. */
export function sinusoidal(lon0 = 0) {
  return {
    id: "sinu", fwd: (la, lo) => [wrapLon(lo - lon0) * D2R * Math.cos(la * D2R), la * D2R],
    inv: (x, y) => {
      if (Math.abs(y) > Math.PI / 2) return null;
      const c = Math.cos(y); if (c < 1e-9) return Math.abs(x) < 1e-9 ? [y * R2D, lon0] : null;
      const l = x / c; return Math.abs(l) > Math.PI ? null : [y * R2D, wrapLon(l * R2D + lon0)];
    },
    box: [-Math.PI, Math.PI, -Math.PI / 2, Math.PI / 2],
  };
}
/**
 * Conique équidistante à deux parallèles automécoïques (Snyder §16) : la première projection de
 * Ptolémée, vraie le long des méridiens et sur les parallèles de Rhodes (36°) et de Thulé (63°).
 * n = (cos φ1 − cos φ2)/(φ2 − φ1), G = cos φ1 / n + φ1, ρ = G − φ, θ = n (λ − λ0) ; x = ρ sin θ, y = ρ0 − ρ cos θ.
 */
export function eqConic(phi1 = 36, phi2 = 63, lon0 = 60, phi0 = 0) {
  const p1 = phi1 * D2R, p2 = phi2 * D2R;
  const n = (Math.cos(p1) - Math.cos(p2)) / (p2 - p1), G = Math.cos(p1) / n + p1, rho0 = G - phi0 * D2R;
  return {
    id: "eqc", n, G, rho0,
    fwd: (la, lo) => { const r = G - la * D2R, t = n * wrapLon(lo - lon0) * D2R; return [r * Math.sin(t), rho0 - r * Math.cos(t)]; },
    inv: (x, y) => {
      const yy = rho0 - y, r = Math.hypot(x, yy), t = Math.atan2(x, yy), lo = t / n;
      if (Math.abs(lo) > Math.PI) return null;
      const la = G - r; return Math.abs(la) > Math.PI / 2 ? null : [la * R2D, wrapLon(lo * R2D + lon0)];
    },
    box: null,
  };
}
/** Orthographique (le globe vu de loin), centre (lat0, lon0) ; face cachée = null. */
export function ortho(lat0 = 20, lon0 = 0) {
  const s0 = Math.sin(lat0 * D2R), c0 = Math.cos(lat0 * D2R);
  return {
    id: "ortho",
    fwd: (la, lo) => {
      const p = la * D2R, dl = (lo - lon0) * D2R, cosc = s0 * Math.sin(p) + c0 * Math.cos(p) * Math.cos(dl);
      return cosc < 0 ? null : [Math.cos(p) * Math.sin(dl), c0 * Math.sin(p) - s0 * Math.cos(p) * Math.cos(dl)];
    },
    inv: (x, y) => {
      const r = Math.hypot(x, y); if (r > 1) return null; if (r < 1e-12) return [lat0, lon0];
      const c = Math.asin(r), sc = Math.sin(c), cc = Math.cos(c);
      return [Math.asin(cc * s0 + (y * sc * c0) / r) * R2D, wrapLon(lon0 + Math.atan2(x * sc, r * c0 * cc - y * s0 * sc) * R2D)];
    },
    box: [-1, 1, -1, 1],
  };
}
/** Azimutale équidistante du moteur commun, ramenée au rayon 1 (π au bord). */
export function aeq(lat0 = 90, lon0 = 0) {
  const m = makeAE({ lat0, lon0 });
  return {
    id: "ae", lat0, lon0,
    fwd: (la, lo) => { const [x, y] = m.fwd(la, lo); return [x * D2R, y * D2R]; },
    inv: (x, y) => m.inv(x * R2D, y * R2D),
    box: [-Math.PI, Math.PI, -Math.PI, Math.PI],
  };
}

/**
 * Indicatrice de Tissot par différences finies : h = échelle le long du méridien, k = le long du
 * parallèle, a ≥ b les demi-axes de l'ellipse (image d'un petit cercle), aire = a·b, ω = déformation
 * angulaire maximale (°). Sur la sphère, dφ et cos φ dλ sont des longueurs (rayon 1).
 */
export function tissot(P, lat, lon, eps = 1e-4) {
  const d = eps * R2D, f = (la, lo) => P.fwd(la, lo);
  const pN = f(lat + d, lon), pS = f(lat - d, lon), pE = f(lat, lon + d), pW = f(lat, lon - d);
  if (!pN || !pS || !pE || !pW) return null;
  const cp = Math.cos(lat * D2R);
  const a1 = [(pN[0] - pS[0]) / (2 * eps), (pN[1] - pS[1]) / (2 * eps)];             // ∂P/∂φ
  const b1 = [(pE[0] - pW[0]) / (2 * eps * cp), (pE[1] - pW[1]) / (2 * eps * cp)];    // ∂P/(cos φ ∂λ)
  const h = Math.hypot(...a1), k = Math.hypot(...b1);
  const det = Math.abs(a1[0] * b1[1] - a1[1] * b1[0]);
  const s = Math.sqrt(Math.max(0, (h * h + k * k) ** 2 / 4 - det * det));
  const a = Math.sqrt((h * h + k * k) / 2 + s), b = Math.sqrt(Math.max(0, (h * h + k * k) / 2 - s));
  return { h, k, a, b, area: det, omega: 2 * Math.asin(Math.min(1, (a - b) / (a + b))) * R2D, J: [a1, b1] };
}

/* ---- les formules de la page ---------------------------------------------------- */

/** Échelle le long d'un cercle de rayon c (rad) autour du centre d'une carte azimutale équidistante : c / sin c. */
export const aeRingScale = (c) => (c < 1e-9 ? 1 : c / Math.sin(c));
/** Erreur relative d'une carte plate de rayon d km (la meilleure azimutale équidistante) : c/sin c − 1. */
export const flatError = (dKm, R = R_KM) => aeRingScale(dKm / R) - 1;
/** Le rayon de carte (km) où l'erreur atteint e (bissection). */
export function radiusForError(e, R = R_KM) {
  let lo = 0, hi = Math.PI * R * 0.999;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (flatError(m, R) < e) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** Circonférence d'un cercle de rayon d tracé SUR la sphère, contre 2πd sur un plan. */
export const capCircumference = (dKm, R = R_KM) => 2 * Math.PI * R * Math.sin(dKm / R);
/** Ératosthène : C = (360° / α) · s. */
export const eratosthenes = (alphaDeg, s) => (360 / alphaDeg) * s;
/** Carte polaire (Gleason, ONU) : étirement est-ouest à la latitude φ, (π/2 − φ) / cos φ. */
export const polarStretch = (latDeg) => ((90 - latDeg) * D2R) / Math.cos(latDeg * D2R);
/** Mercator : y = ln tan(π/4 + φ/2), échelle sec φ dans toutes les directions. */
export const mercY = (latDeg) => Math.log(Math.tan(Math.PI / 4 + latDeg * D2R / 2));
export const mercScale = (latDeg) => 1 / Math.cos(latDeg * D2R);
/** Mercator transverse (UTM), au premier ordre : k = k0 (1 + x² / 2R²), x en km depuis le méridien central. */
export const utmScale = (xKm, k0 = 0.9996, R = R_KM) => k0 * (1 + (xKm * xKm) / (2 * R * R));
/** Largeur d'une demi-zone UTM (3° de longitude) à la latitude φ, km. */
export const utmHalfWidth = (latDeg, R = R_KM) => R * 3 * D2R * Math.cos(latDeg * D2R);

/** Les rapports de Ptolémée (Géographie I.20-24) : parallèles de Rhodes et de Thulé pour 115 parts d'équateur. */
export function ptolemyRatios() {
  return { rhodes: { ptolemy: 93 / 115, cos: Math.cos(36 * D2R) }, thule: { ptolemy: 52 / 115, cos: Math.cos(63 * D2R) } };
}

/** Le cadre de la première projection (Géographie I.24) : de l'anti-Méroé, 16°25' S, à Thulé, 63° N, sur 180° de longitude. */
export const PTOL_FRAME = { latS: -(16 + 25 / 60), latN: 63, lon0: 0, lon1: 180 };
/** Longitude moderne du méridien 0 de Ptolémée : son île Canaria est à 1°, Grande Canarie à 15,6° W. */
export const PTOL_ZERO = -16.6;
/** Fraction de la sphère entre deux parallèles sur Δλ degrés : (sin φN − sin φS) / 2 × Δλ / 360. */
export const zoneFraction = (latS, latN, dLon) => ((Math.sin(latN * D2R) - Math.sin(latS * D2R)) / 2) * (dLon / 360);
/**
 * Ptolémée contre le globe, sur les villes identifiées ([nom, lonP, latP, lat, lon]) : droite des moindres
 * carrés lonP = a + b·lon (b ≈ 252 000 / 180 000 stades = 1,4), écart des latitudes (moyenne, écart-type).
 */
export function ptolemyFit(towns) {
  const n = towns.length, mx = towns.reduce((s, t) => s + t[4], 0) / n, my = towns.reduce((s, t) => s + t[1], 0) / n;
  let sxy = 0, sxx = 0; for (const t of towns) { sxy += (t[4] - mx) * (t[1] - my); sxx += (t[4] - mx) ** 2; }
  const b = sxy / sxx, a = my - b * mx, d = towns.map((t) => t[2] - t[3]), dm = d.reduce((s, x) => s + x, 0) / n;
  return { n, a, b, dLatMean: dm, dLatSD: Math.sqrt(d.reduce((s, x) => s + (x - dm) ** 2, 0) / (n - 1)), trueSpan: 180 / b };
}

/** Distance vraie (km, grand cercle) et distance lue sur une carte AE de centre donné (km). */
export function aePair(center, a, b, R = R_KM) {
  const m = makeAE({ lat0: center[0], lon0: center[1] });
  return { truth: gcDeg(a[0], a[1], b[0], b[1]) * D2R * R, map: m.dist(a, b) * D2R * R,
    fromCentreA: gcDeg(center[0], center[1], a[0], a[1]) * D2R * R };
}

/** Points (lat, lon) d'une loxodromie de cap constant entre a et b (sur Mercator : une droite). */
export function rhumbLine(a, b, n = 64) {
  const ya = mercY(a[0]), yb = mercY(b[0]);
  let dl = b[1] - a[1]; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, y = ya + (yb - ya) * t; out.push([(2 * Math.atan(Math.exp(y)) - Math.PI / 2) * R2D, wrapLon(a[1] + dl * t)]); }
  return out;
}
/** Points d'un grand cercle entre a et b (interpolation sphérique). */
export function greatCircle(a, b, n = 64) {
  const v = (p) => [Math.cos(p[0] * D2R) * Math.cos(p[1] * D2R), Math.cos(p[0] * D2R) * Math.sin(p[1] * D2R), Math.sin(p[0] * D2R)];
  const A = v(a), B = v(b), om = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))), out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
    const p = [s1 * A[0] + s2 * B[0], s1 * A[1] + s2 * B[1], s1 * A[2] + s2 * B[2]];
    out.push([Math.asin(p[2]) * R2D, Math.atan2(p[1], p[0]) * R2D]);
  }
  return out;
}
/** Longueur (km) d'une suite de points sur la sphère. */
export const pathKm = (pts, R = R_KM) => pts.slice(1).reduce((s, p, i) => s + gcDeg(pts[i][0], pts[i][1], p[0], p[1]) * D2R * R, 0);

/** Point à la fraction t du grand cercle a→b (pour l'animation du centre qui voyage). */
export const slerp = (a, b, t) => greatCircle(a, b, 1000)[Math.round(t * 1000)];
