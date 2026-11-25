// Onglet moon (epic19) : la Lune comme règle. Logique pure, testée.
//
// 1. Laser lunaire (UC11) : la distance station–réflecteur ρ(t) = c·τ/2 oscille au
//    cours d'une nuit parce que la station tourne avec la Terre. Avec D(t) la
//    distance du centre de la Terre au réflecteur (lisse : polynôme de degré 3 sur
//    le passage) et cos Z = sin ψ sin δ + cos ψ cos δ cos H (ψ latitude géocentrique
//    de la station, δ et H déclinaison et angle horaire de la Lune, d'une éphéméride),
//    ρ² = D² − 2 D R cos Z + R², soit D ≈ ρ + R cos Z − R² sin² Z / 2ρ. Pour chaque
//    passage, R est la valeur qui rend D le plus lisse. Les temps de vol sont des
//    mesures ; la direction de la Lune vient d'une éphéméride : validation.
// 2. Parallaxe + Kepler + pendule (UC10) : R = g·sin³π·(1 + m/M) / n².
// 3. Ombre d'éclipse (UC12) : π_Lune = σ_ombre/(1 + élargissement) − s_Soleil + π_Soleil.
import { jdFromUTC, deltaT, gmst, moon } from "../../core/ephemeris.js";
import { lsq, golden, quartiles } from "../../core/lsq.js";

export const C_KMS = 299792.458;
const D2R = Math.PI / 180;
// stations : latitude géodésique, longitude est, altitude (km) -- angles et hauteur publiés par l'ILRS
export const LLR_ST = { GRSM: { name: "Grasse (MeO)", lat: 43.7546, lon: 6.9215, h: 1.323 }, APOL: { name: "Apache Point", lat: 32.7803, lon: -105.8203, h: 2.788 },
  MATM: { name: "Matera", lat: 40.6486, lon: 16.7046, h: 0.536 }, WETL: { name: "Wettzell", lat: 49.1444, lon: 12.878, h: 0.66 } };
// latitude géocentrique (direction du rayon vecteur) : aplatissement 1/298,257 -- seule trace de l'ellipsoïde
export const geocentric = (latDeg) => Math.atan(0.99330562 * Math.tan(latDeg * D2R));

/** Points d'un passage : t (h depuis t0), ρ (km, un aller), cos Z. */
export function passPoints(p) {
  const st = LLR_ST[p.st], psi = geocentric(st.lat), t0 = Date.parse(p.t0);
  return p.pts.map(([dt, tof]) => {
    const d = new Date(t0 + dt * 1000);
    const jd = jdFromUTC(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds() + d.getUTCMilliseconds() / 1000);
    const m = moon(jd + deltaT(d.getUTCFullYear()) / 86400);
    const H = (gmst(jd) + st.lon - m.ra) * D2R, de = m.dec * D2R;
    return { t: dt / 3600, rho: (tof * C_KMS) / 2, cz: Math.sin(psi) * Math.sin(de) + Math.cos(psi) * Math.cos(de) * Math.cos(H) };
  });
}
/** Rms (m) des résidus de D(t) à un polynôme de degré deg, pour un rayon R (km). */
export function passCost(pts, R, deg = 3) {
  const y = pts.map((q) => q.rho + R * q.cz - (R * R * (1 - q.cz * q.cz)) / (2 * q.rho));
  return lsq(pts.map((q) => Array.from({ length: deg + 1 }, (_, k) => q.t ** k)), y).rms * 1000;
}
/** Rayon d'un passage : celui qui rend la distance au centre la plus lisse. */
export function passRadius(p, deg = 3) {
  const pts = passPoints(p), R = golden((r) => passCost(pts, r, deg), 3000, 10000);
  return { st: p.st, date: p.t0.slice(0, 10), n: pts.length, span: pts.at(-1).t, R, rms: passCost(pts, R, deg) };
}
/** Tous les passages ; quartiles des rayons. */
export function llrRadii(PASSES, deg = 3) {
  const rows = PASSES.map((p) => passRadius(p, deg));
  return { rows, q: quartiles(rows.map((r) => r.R)) };
}
/** Rayon géocentrique attendu de la station sur l'ellipsoïde de référence (km), pour comparaison seulement. */
export function stationRadius(st) {
  const a = 6378.137, b = 6356.752, f = (LLR_ST[st].lat) * D2R;
  const c = Math.cos(f), s = Math.sin(f);
  return Math.sqrt(((a * a * c) ** 2 + (b * b * s) ** 2) / ((a * c) ** 2 + (b * s) ** 2)) + LLR_ST[st].h;
}

/** Parallaxe + Kepler + pendule : R (km) depuis g (m/s²), la parallaxe horizontale π (°), le mois sidéral (j). */
export function radiusFromParallax(g, piDeg, monthDays, massRatio = 1 / 81.3) {
  const n = (2 * Math.PI) / (monthDays * 86400), s = Math.sin(piDeg * D2R);
  return (g * s ** 3 * (1 + massRatio)) / (n * n) / 1000;
}
/** Parallaxe de la Lune depuis le rayon angulaire de l'ombre σ (′), l'élargissement (fraction), le demi-diamètre du Soleil s (′). */
export function parallaxFromShadow(sigmaArcmin, enlarge, sunSdArcmin, sunParArcsec = 8.794) {
  return sigmaArcmin / (1 + enlarge) + sunSdArcmin - sunParArcsec / 60;
}
