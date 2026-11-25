// Onglet orb (epic19) : l'orbite de la Terre. Logique pure, testée.
import { jdFromUTC, deltaT, sun, gmst, flatGeom, subPoint } from "../../core/ephemeris.js";
import { lsq, golden, quartiles } from "../../core/lsq.js";

export const C_KMS = 299792.458;
const D2R = Math.PI / 180, YEAR_S = 365.25 * 86400;
export const AU_REF = 149597870.7; // km, pour COMPARER seulement (IAU 2012)
export const OMEGA_SID = 7.2921150e-5; // rad/s : la rotation mesurée par l'onglet rot (anneaux), à 0,01 %
// TNG, La Palma (HARPS-N) : latitude, longitude est, altitude km (publiées par l'observatoire)
export const TNG = { lat: 28.754, lon: -17.889, h: 2.387 };

/** Aberration : la demi-amplitude κ (″) donne v/c, puis l'unité astronomique a = vT/2π. Temps de lumière t = κT/2π. */
export function fromAberration(kappaArcsec, T = YEAR_S) {
  const k = (kappaArcsec / 3600) * D2R, v = C_KMS * Math.tan(k);
  return { v, a: (v * T) / (2 * Math.PI), lightS: (k * T) / (2 * Math.PI) };
}
/** Temps de lumière Soleil–Terre (s) -> unité astronomique (km) et aberration correspondante (″). */
export function fromLightTime(s, T = YEAR_S) {
  return { a: C_KMS * s, kappa: ((2 * Math.PI * s) / T / D2R) * 3600 };
}

const jdOf = (d) => jdFromUTC(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
const ttOf = (d, jd) => jd + deltaT(d.getUTCFullYear()) / 86400;

/**
 * Un jour de HARPS-N : v(t) = v0 + A cos ωt + B sin ωt, ω = 2π/86 400 s (le Soleil revient au
 * méridien en un jour solaire). L'amplitude √(A²+B²) vaut Ω R cos φ cos δ : la vitesse de
 * l'observateur projetée vers le Soleil. R = amplitude / (Ω cos φ cos δ) ; δ vient d'une
 * éphéméride (validation). v0 garde le mouvement Terre–Soleil du jour.
 */
export function sunDay(day, slope = 0) {
  const t0 = Date.parse(day.t0), w = (2 * Math.PI) / 86400;
  const X = day.pts.map(([s]) => [1, Math.cos(w * s), Math.sin(w * s)]);
  const f = lsq(X, day.pts.map((p) => p[1] - slope * p[0]));
  const mid = new Date(t0 + (day.pts.at(-1)[0] * 1000) / 2), jd = jdOf(mid), s = sun(ttOf(mid, jd));
  const amp = Math.hypot(f.a[1], f.a[2]);
  // la vitesse mesure la distance à l'axe ; divisée par cos φ, un rayon
  const R = amp / (OMEGA_SID * Math.cos(TNG.lat * D2R) * Math.cos(s.dec * D2R)) / 1000 - TNG.h;
  return { date: day.t0.slice(0, 10), jd, v0: f.a[0], amp, R, rms: f.rms, dec: s.dec };
}
/**
 * Les jours, en deux passes. La dérive annuelle (jusqu'à 8,5 m/s par jour) ressemble, sur quelques
 * heures autour de midi, au terme diurne, et un terme linéaire libre s'y confond (dispersion ×10) :
 * on l'estime d'abord sur l'année (sunYear), puis on la retranche de chaque jour. La dérive de la
 * Lune (12,5 m/s sur 27,3 j, au plus 2,9 m/s par jour) n'est pas retirée.
 */
export function sunDays(DAYS, Ta = 365.2596) {
  const first = DAYS.map((d) => sunDay(d)), y = sunYear(first, Ta), w = (2 * Math.PI) / Ta;
  return DAYS.map((d, i) => sunDay(d, (w * (-y.ac * Math.sin(w * first[i].jd) + y.as * Math.cos(w * first[i].jd))) / 86400));
}

/**
 * L'année : v0(t) = m + K sin(2π(t − t_p)/T_a), T_a = 365,2596 j (année anomalistique). K est la
 * vitesse radiale Terre–Soleil maximale, 2πae / (T √(1−e²)). Avec e lu sur le diamètre du Soleil
 * (SDO), a = K T √(1−e²) / (2π e).
 */
export function sunYear(rows, Ta = 365.2596) {
  const w = (2 * Math.PI) / Ta;
  const f = lsq(rows.map((r) => [1, Math.cos(w * r.jd), Math.sin(w * r.jd)]), rows.map((r) => r.v0));
  return { m: f.a[0], ac: f.a[1], as: f.a[2], K: Math.hypot(f.a[1], f.a[2]), rms: f.rms, n: rows.length, Ta };
}
/** SDO : excentricité depuis les rayons apparents extrêmes (ajustement θ = θ0 + Δ cos(2π(t−tp)/T)). */
export function sdoEccentricity(SDO, Ta = 365.2596) {
  const w = (2 * Math.PI) / Ta;
  const rows = SDO.map(([d, r]) => [Date.parse(d + "T00:00:00Z") / 86400000, r]);
  const f = lsq(rows.map(([t]) => [1, Math.cos(w * t), Math.sin(w * t)]), rows.map((r) => r[1]));
  const d = Math.hypot(f.a[1], f.a[2]);
  const vals = SDO.map((x) => x[1]);
  return { theta0: f.a[0], dTheta: d, e: d / f.a[0], min: Math.min(...vals), max: Math.max(...vals), eRaw: (Math.max(...vals) - Math.min(...vals)) / (Math.max(...vals) + Math.min(...vals)) };
}
export const auFromDoppler = (K, e, Ta = 365.2596) => (K / 1000) * Ta * 86400 * Math.sqrt(1 - e * e) / (2 * Math.PI * e);

/**
 * Le Soleil d'un disque plat : une lampe à hauteur H au-dessus du point subsolaire porté sur la
 * carte azimutale équidistante polaire. Sa vitesse radiale vue de La Palma = d(distance)/dt.
 * Paramètre libre : H (steel-man : ajusté au mieux sur les mêmes jours).
 */
export function flatSunRV(d, H) {
  const at = (ms) => { const x = new Date(ms), jd = jdOf(x), s = sun(ttOf(x, jd)), sp = subPoint(s.ra, s.dec, jd); return flatGeom(TNG.lat, TNG.lon, sp.lat, sp.lon, H).slant; };
  return ((at(d.getTime() + 60000) - at(d.getTime() - 60000)) / 120) * 1000; // m/s
}
/** Rms (m/s) du plat sur des jours, avec une constante libre par jour, pour une hauteur H. */
export function flatSunCost(DAYS, H) {
  let s2 = 0, n = 0;
  for (const day of DAYS) {
    const t0 = Date.parse(day.t0);
    const m = day.pts.map(([s, v]) => [v, flatSunRV(new Date(t0 + s * 1000), H)]);
    const off = m.reduce((a, [v, f]) => a + (v - f), 0) / m.length;
    for (const [v, f] of m) { s2 += (v - f - off) ** 2; n++; }
  }
  return Math.sqrt(s2 / n);
}
/** Le globe sur les mêmes jours : rms du modèle v0 + A cos + B sin (deux paramètres de forme libres aussi). */
export const globeSunCost = (DAYS) => Math.sqrt(DAYS.map(sunDay).reduce((a, r, i) => a + r.rms ** 2 * DAYS[i].pts.length, 0) / DAYS.reduce((a, d) => a + d.pts.length, 0));
export const bestFlatH = (DAYS) => golden((H) => flatSunCost(DAYS, H), 500, 50000, 40);

/** τ Ceti : latitude écliptique (°) depuis α, δ (catalogue). */
export function eclipticLat(raDeg, decDeg, eps = 23.4393) {
  const a = raDeg * D2R, d = decDeg * D2R, e = eps * D2R;
  return Math.asin(Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a)) / D2R;
}
/** τ Ceti : v_obs(t) = γ + a cos + b sin (année sidérale) + 2ᵉ harmonique ; K, puis v_orb = K / cos β, a = v T / 2π. */
export function starYear(STAR, P = 365.25636) {
  const w = (2 * Math.PI) / P, N = STAR.nights;
  const f = lsq(N.map(([t]) => [1, Math.cos(w * t), Math.sin(w * t), Math.cos(2 * w * t), Math.sin(2 * w * t)]), N.map((x) => x[1]));
  const K = Math.hypot(f.a[1], f.a[2]), beta = eclipticLat(STAR.ra, STAR.dec);
  const v = K / Math.cos(beta * D2R) / 1000;
  return { n: N.length, K, beta, v, a: (v * P * 86400) / (2 * Math.PI), rms: f.rms, gamma: f.a[0] };
}
/** Parallaxe annuelle : distance de l'étoile en unités astronomiques (1/tan p). */
export const parallaxAU = (pArcsec) => 1 / Math.tan((pArcsec / 3600) * D2R);
export { quartiles };

/** Le globe sans aucun paramètre de forme : v_r = Ω R cos φ cos δ sin H (H angle horaire du Soleil), R = 6 371 km. */
export function globeSunRV(d, R = 6371) {
  const jd = jdOf(d), s = sun(ttOf(d, jd)), H = (gmst(jd) + TNG.lon - s.ra) * D2R;
  return OMEGA_SID * (R + TNG.h) * 1000 * Math.cos(TNG.lat * D2R) * Math.cos(s.dec * D2R) * Math.sin(H);
}
/** Rms (m/s) d'un modèle de vitesse sur des jours, une constante libre par jour (la même liberté pour les deux). */
export function modelCost(DAYS, rv) {
  let s2 = 0, n = 0;
  for (const day of DAYS) {
    const t0 = Date.parse(day.t0);
    const m = day.pts.map(([s, v]) => [v, rv(new Date(t0 + s * 1000))]);
    const off = m.reduce((a, [v, f]) => a + (v - f), 0) / m.length;
    for (const [v, f] of m) { s2 += (v - f - off) ** 2; n++; }
  }
  return Math.sqrt(s2 / n);
}

/** Gnomon : hauteur du Soleil à midi depuis l'ombre ; obliquité et latitude depuis les deux solstices. */
export function gnomon(L, sJune, sDec) {
  const h = (s) => Math.atan2(L, s) / D2R, hj = h(sJune), hd = h(sDec);
  return { hj, hd, eps: (hj - hd) / 2, lat: 90 - (hj + hd) / 2 };
}

/**
 * Vitesse radiale d'une étoile due à la seule orbite de la Terre (km/s, positif = s'éloigne) :
 * v cos β sin(λ⊕ − λ★), λ⊕ = longitude du Soleil + 180° (éphéméride), v = 29,78 km/s. Sert à
 * l'animation de τ Ceti (2026-10-04) ; l'excentricité est négligée (±0,5 km/s).
 */
export function orbitRV(jd, raDeg, decDeg, v = 29.78) {
  const e = 23.4393 * D2R, a = raDeg * D2R, d = decDeg * D2R;
  const lam = Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a));
  const beta = Math.asin(Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a));
  return v * Math.cos(beta) * Math.sin((sun(jd).lon + 180) * D2R - lam);
}

/**
 * Kepler et Newton (2026-10-16) : demi-grands axes (10⁶ km) et périodes SIDÉRALES (jours) des fiches
 * NASA (sources [10]), la Lune, et le GPS (ESA Navipedia, [11]). T² = 4π² a³ / GM.
 */
export const PLANETS = [
  ["Mercury", 57.909, 87.969], ["Venus", 108.21, 224.701], ["Earth", 149.598, 365.256], ["Mars", 227.956, 686.98],
  ["Jupiter", 778.479, 4332.589], ["Saturn", 1432.041, 10755.699], ["Uranus", 2867.043, 30685.4], ["Neptune", 4514.953, 60189.018],
];
export const EARTH_SATS = [["Moon", 0.3844, 27.3217], ["GPS", 0.02656, 43082 / 86400]];
export const MOON_MASS_RATIO = 1 / 81.3; // m/M, onglet moon
/** GM (m³/s²) d'un corps d'après une orbite autour de lui : a en km, T en jours (troisième loi). */
export const gmFromOrbit = (aKm, Tdays) => (4 * Math.PI ** 2 * (aKm * 1e3) ** 3) / (Tdays * 86400) ** 2;
/** T²/a³ de chaque planète en années² par UA³ (1 si la troisième loi tient, l'unité étant la Terre). */
export function keplerRatios(rows = PLANETS) {
  const [, aE, TE] = rows.find((r) => r[0] === "Earth");
  return rows.map(([n, a, T]) => [n, (T / TE) ** 2 / (a / aE) ** 3]);
}
