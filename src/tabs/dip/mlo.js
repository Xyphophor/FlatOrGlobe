// Le coucher de soleil doublé, enregistré par un instrument (2026-10-03) :
// l'observatoire de Mauna Loa (NOAA GML, 3 397 m) et Keahole Point (NREL
// MIDC NELHA, 4 m), 55 km plus loin dans la direction du coucher, sur la même
// horloge. Pur, testé dans mlo.test.js.
//
// Mauna Loa : MESURÉ -- l'instant où le pyrhéliomètre perd le rayonnement
// direct (`fog build dip-mlo`, ex-scripts/build_mlo_sunset.py, aucun modèle de Terre). Keahole :
// CALCULÉ -- sa station ne mesure que le rayonnement global, qui ne marque pas
// le coucher. Les deux couchers calculés le sont par la même géométrie : le
// dernier rayon rase la mer au point de tangence, puis traverse le reste de
// l'atmosphère. Bord supérieur visible tant que la hauteur VRAIE du centre
// dépasse −(φ + ρ₀ + s) :
//   φ  = arccos(Rₑ/(Rₑ + h)) / (1 − k), Rₑ = R/(1 − k) -- l'arc VRAI jusqu'au point de
//        tangence (le rayon rasant y est à √(2hRₑ) ; l'angle arccos(Rₑ/(Rₑ + h)) est le dip apparent) ;
//   ρ₀ = réfraction horizontale au niveau de la mer (Bennett, 34′) ;
//   s  = demi-diamètre du Soleil.
// Sans réfraction (règle 3, toujours à côté) : k = 0, ρ₀ = 0.
import { jdFromUTC, bodyAt, refrArcmin } from "../../core/ephemeris.js";
import { MLO_SITE, MLO_EVENINGS } from "../../data/presets/dip-mlo.js";
import { MLO_HORIZON } from "../../data/presets/dip-mlo-profile.js";

export const R_KM = 6371, K_STD = 0.13;
/** NREL MIDC, station NELHA (Keahole Point) : 19,728144 N, 156,058936 W, 4 m. */
export const KEAHOLE = { lat: 19.728144, lon: -156.058936, h: 4 };
export const MLO = { lat: MLO_SITE.lat, lon: MLO_SITE.lon, h: MLO_SITE.h };
const D = 180 / Math.PI;

/** Jour julien UT de la minute m (peut dépasser 1 440) après 0 h UTC de la date ISO. */
export function jdAt(date, min) {
  const [y, mo, d] = date.split("-").map(Number);
  return jdFromUTC(y, mo, d, 0, 0, 0) + min / 1440;
}

/** Soleil vu du site : hauteur VRAIE du centre (sans réfraction), azimut, demi-diamètre (°). */
export function sunAt(site, date, min) {
  const b = bodyAt("sun", jdAt(date, min), site.lat, site.lon, site.h, { refraction: false });
  return { alt: b.altTrue, az: b.az, sd: b.sd };
}

/** Dip apparent de l'horizon de mer, en degrés : arccos(Rₑ/(Rₑ + h)), Rₑ = R/(1 − k) (k = 0 : le dip géométrique). */
export function seaDip(h, k = K_STD) {
  const Re = (R_KM * 1000) / (1 - k);
  return Math.acos(Re / (Re + h)) * D;
}

/** Arc vrai jusqu'au point de tangence, en degrés : φ = √(2hRₑ)/R = dip apparent / (1 − k). */
export function tangentArc(h, k = K_STD) { return seaDip(h, k) / (1 - k); }

/** Hauteur vraie du centre quand le bord supérieur disparaît (°). refr = false : ni k ni ρ₀. */
export function lastLimbAlt(h, sd, refr = true) {
  return refr ? -(tangentArc(h, K_STD) + refrArcmin(0) / 60 + sd) : -(tangentArc(h, 0) + sd);
}

/** Minute UTC (après 0 h de la date) où la hauteur vraie du centre passe sous `alt`, entre lo et hi (soir, Soleil descendant). */
export function crossing(site, date, alt, lo = 180, hi = 480) {
  const f = (m) => sunAt(site, date, m).alt - alt;
  if (f(lo) < 0 || f(hi) > 0) return null;
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** Le coucher calculé du bord supérieur au site, avec (refr) ou sans réfraction. */
export function sunsetMin(site, date, refr = true) {
  const sd = sunAt(site, date, 300).sd;
  return crossing(site, date, lastLimbAlt(site.h, sd, refr));
}

/** Distance (km) et azimut (°) de MLO vers Keahole, sur la sphère (pour placer Keahole dans la coupe). */
export function keaholeFromMlo() {
  const p1 = MLO.lat / D, p2 = KEAHOLE.lat / D, dl = (KEAHOLE.lon - MLO.lon) / D;
  const c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  const az = Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) * D;
  return { km: Math.acos(Math.min(1, c)) * R_KM, az: (az + 360) % 360 };
}

/**
 * L'horizon de MLO dans l'azimut az est-il la mer ? (Copernicus GLO-30,
 * `fog build dip-mlo` (ex-build_mlo_horizon.py) ; hors de 230-310°, non.) Les soirées où le
 * Soleil se couche derrière le relief -- l'hiver, derrière le Mauna Loa
 * lui-même -- ne disent rien du dip et sont écartées, selon ce seul critère.
 */
export function seaHorizonAt(az) {
  if (az < MLO_HORIZON[0][0] - 0.25 || az > MLO_HORIZON[MLO_HORIZON.length - 1][0] + 0.25) return false;
  const h = MLO_HORIZON.reduce((a, b) => (Math.abs(b[0] - az) < Math.abs(a[0] - az) ? b : a));
  return h[3] == null;
}

/** Une soirée : la dernière lumière MESURÉE à MLO, la hauteur vraie du Soleil à cet instant, et les couchers calculés. */
export function evening(e) {
  const s = sunAt(MLO, e.date, e.t);
  const kea = sunsetMin(KEAHOLE, e.date, true), kea0 = sunsetMin(KEAHOLE, e.date, false);
  const mlo = sunsetMin(MLO, e.date, true), mlo0 = sunsetMin(MLO, e.date, false);
  return { ...e, alt: s.alt, az: s.az, sea: seaHorizonAt(s.az), kea, kea0, mlo, mlo0, lead: e.t - kea };
}

const med = (v) => { const w = v.slice().sort((a, b) => a - b), n = w.length; return n % 2 ? w[(n - 1) / 2] : (w[n / 2 - 1] + w[n / 2]) / 2; };

/**
 * Toutes les soirées claires de l'année dont l'horizon est la mer : hauteur
 * vraie du centre à la dernière lumière mesurée (médiane, extrêmes), et l'avance
 * de MLO sur le coucher calculé de Keahole (minutes ; positif = MLO voit encore
 * le Soleil après). clear = toutes les soirées claires, horizon compris.
 */
export function mloStats(evs = MLO_EVENINGS) {
  const all = evs.filter((e) => e.clear).map(evening), rows = all.filter((r) => r.sea);
  const alts = rows.map((r) => r.alt), leads = rows.map((r) => r.lead);
  return { rows, n: rows.length, clear: all.length, of: evs.length, altMed: med(alts), altMin: Math.min(...alts), altMax: Math.max(...alts),
    below: rows.filter((r) => r.alt < 0).length, after: rows.filter((r) => r.lead > 0).length, leadMed: med(leads) };
}
