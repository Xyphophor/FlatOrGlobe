// Logique pure de l'onglet "azim" (azimut : le relèvement qui oublie la
// distance du Soleil), portée à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L25631-25750 état/tables, ~L26160-26210
// parallaxe comme règle). Voir tasks/epic02/UC06.org.
//
// RÈGLES HÉRITÉES (en-tête legacy de l'onglet) :
//  * UNE SEULE ÉPHÉMÉRIDE : ce module appelle src/core/ephemeris.js (Meeus),
//    pas le jeu NOAA de sun/twi -- celui-ci n'a pas de Lune.
//  * Le tableau de l'éclipse NE SUIT PAS l'horloge : c'est le seul endroit
//    avec une colonne PUBLIÉE (Espenak), valable pour un instant et un corps.
//  * Les sept stations sont toutes calculées à chaque instant ; seules celles
//    qui voient le corps portent un rayon.
//  * PIÈGE DE CHIRALITÉ : la carte AE de dessin (twiAE / seisAE, x = −r sin λ,
//    y = −r cos λ) et celle de flatAzimuth (x = r cos λ, y = r sin λ) ont des
//    chiralités OPPOSÉES. L'est local est (−ny, nx) ici. Vérifié par test, pas
//    argumenté.
import { RAD, DEG } from "../../core/math.js";
import { OBS } from "../../core/ephemeris.js";
import { SEIS_STATIONS } from "../../data/presets/stations.js";
import { twiAE, twiwUnit, TWI_KM_PER_DEG } from "../twi/logic.js";

export const AZIM_CASES = {
  dec: { Y: 2026, M: 12, D: 21, h: 12, mi: 0, s: 0, label: "21 December 2026, 12:00:00 UTC" },
  jun: { Y: 2026, M: 6, D: 21, h: 12, mi: 0, s: 0, label: "21 June 2026, 12:00:00 UTC" },
  ecl: { Y: 2026, M: 8, D: 12, h: 17, mi: 45, s: 53.3, label: "12 August 2026, 17:45:53.3 UTC" },
};
// PUBLIÉ, pas calculé. Espenak, plus grande éclipse du 12 août 2026 [3].
export const AZIM_ECL_PUB = {
  lat: 65 + 13.4 / 60, lon: -(25 + 13.7 / 60),
  alt: 25.8, az: 248.4, sunDec: 14 + 48 / 60 + 4.5 / 3600, moonDec: 15 + 36 / 60 + 58.5 / 3600,
  Y: 2026, M: 8, D: 12, h: 17, mi: 45, s: 53.3, dT: 72.4,
};
export const AZIM_COL = ["#1d4ed8", "#c2410c", "#6d28d9", "#0f766e", "#a16207", "#be185d", "#0369a1"];
export const AZIM_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const AZIM_LAMPS = [3000, 5000, 8000]; // km au-dessus du disque ; balayés, jamais ajustés
export const AZIM_R = 6371;

export const azimWrap180 = (d) => ((d + 540) % 360) - 180;
export const azimLat = (v) => `${Math.abs(v).toFixed(2)}° ${v < 0 ? "S" : "N"}`;
export const azimLon = (v) => `${Math.abs(v).toFixed(2)}° ${v < 0 ? "W" : "E"}`;
export const azimKm = (v) => Math.round(v).toLocaleString("en-US") + " km";

/** JD -> calendrier (Meeus 7). Secondes TRONQUÉES, pas arrondies : c'est une horloge. */
export function azimFromJD(jd) {
  const z = Math.floor(jd + 0.5), f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) { const al = Math.floor((z - 1867216.25) / 36524.25); A = z + 1 + al - Math.floor(al / 4); }
  const B = A + 1524, C = Math.floor((B - 122.1) / 365.25), Dd = Math.floor(365.25 * C), E = Math.floor((B - Dd) / 30.6001);
  const day = B - Dd - Math.floor(30.6001 * E) + f;
  const M = E < 14 ? E - 1 : E - 13, Y = M > 2 ? C - 4716 : C - 4715;
  const d = Math.floor(day), hr = (day - d) * 24, h = Math.floor(hr);
  const mi = Math.floor((hr - h) * 60), s = Math.floor(((hr - h) * 60 - mi) * 60);
  return `${d} ${AZIM_MON[M - 1]} ${Y}, ${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")} UTC`;
}

export const azimDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const azimCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const azimNorm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
/** Angle de grand cercle entre deux points, degrés. */
export const azimDelta = (la1, lo1, la2, lo2) => OBS.greatCircle(la1, lo1, la2, lo2, 180 / Math.PI).d;

/** Direction, sur la carte AE de dessin, d'un relèvement mesuré depuis le nord PROPRE de cette carte. */
export function azimMapDir(lat, lon, azDeg) {
  const P = twiAE(lat, lon), L = Math.hypot(P.x, P.y) || 1;
  const nx = -P.x / L, ny = -P.y / L, ex = -ny, ey = nx;
  const a = RAD(azDeg);
  return { x: nx * Math.cos(a) + ex * Math.sin(a), y: ny * Math.cos(a) + ey * Math.sin(a) };
}

/**
 * Triangle d'erreur de la carte plate : parmi les stations qui voient le
 * corps, le triplet le plus écarté ; ses trois demi-droites (relèvement réel,
 * reporté droit sur la carte) se manquent et laissent un triangle.
 */
export function azimTriangle(rows) {
  const up = rows.filter((r) => r.up);
  if (up.length < 3) return null;
  let best = null;
  for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++) for (let k = j + 1; k < up.length; k++) {
    const s = azimDelta(up[i].lat, up[i].lon, up[j].lat, up[j].lon) + azimDelta(up[j].lat, up[j].lon, up[k].lat, up[k].lon) + azimDelta(up[i].lat, up[i].lon, up[k].lat, up[k].lon);
    if (!best || s > best.s) best = { s, t: [up[i], up[j], up[k]] };
  }
  const T = best.t.map((r) => ({ r, p: twiAE(r.lat, r.lon), d: azimMapDir(r.lat, r.lon, r.az) }));
  const V = [];
  for (let i = 0; i < 3; i++) {
    const A = T[i], B = T[(i + 1) % 3];
    const den = A.d.x * B.d.y - A.d.y * B.d.x;
    if (Math.abs(den) < 1e-9) return null;
    const t = ((B.p.x - A.p.x) * B.d.y - (B.p.y - A.p.y) * B.d.x) / den;
    V.push({ x: A.p.x + t * A.d.x, y: A.p.y + t * A.d.y });
  }
  const sides = V.map((v, i) => { const w = V[(i + 1) % 3]; return Math.hypot(v.x - w.x, v.y - w.y) * TWI_KM_PER_DEG; });
  return { T, V, sides, max: Math.max(...sides), offMap: V.some((v) => Math.hypot(v.x, v.y) > 180) };
}

/**
 * État complet à l'instant (cas + décalage t en heures) pour le corps choisi.
 * Lune topocentrique, Soleil géocentrique (parallaxe solaire 8,8″, sous tout
 * ce que l'onglet imprime ; la lunaire vaut un degré).
 */
export function azimState(caseKey, body, tHours) {
  const C = AZIM_CASES[caseKey];
  const jd = OBS.jdFromUTC(C.Y, C.M, C.D, C.h, C.mi, C.s) + tHours / 24;
  const yr = 2000 + (jd - 2451545.0) / 365.25;
  const jdTT = jd + OBS.deltaT(yr) / 86400;
  const gs = OBS.sun(jdTT), gm = OBS.moon(jdTT);
  const subS = OBS.subPoint(gs.ra, gs.dec, jd);
  const subM = OBS.subPoint(gm.ra, gm.dec, jd);
  const moon = body === "moon";
  const sub = moon ? subM : subS;
  const rows = SEIS_STATIONS.map((st, i) => {
    const mtp = OBS.topocentric(gm.ra, gm.dec, gm.parallax, st.lat, st.lon, jd, 0);
    const mt = OBS.altaz(mtp.ra, mtp.dec, st.lat, st.lon, jd);
    const mg = OBS.altaz(gm.ra, gm.dec, st.lat, st.lon, jd);
    const hz = moon ? mt : OBS.altaz(gs.ra, gs.dec, st.lat, st.lon, jd);
    const r = Object.assign({}, st, {
      col: AZIM_COL[i % AZIM_COL.length],
      alt: hz.alt, az: hz.az, up: hz.alt > 0,
      bearing: OBS.greatCircle(st.lat, st.lon, sub.lat, sub.lon).az,
      flat: OBS.flatAzimuth(st.lat, st.lon, sub.lat, sub.lon),
      mAlt: mt.alt, mDAlt: mt.alt - mg.alt, mDAz: azimWrap180(mt.az - mg.az),
      mBear: OBS.greatCircle(st.lat, st.lon, subM.lat, subM.lon).az, mUp: mt.alt > 0,
    });
    r.diff = azimWrap180(r.flat - r.bearing);
    return r;
  });
  // distance réelle du corps en RAYONS TERRESTRES : rayons, visées et terminateur en découlent (pas d'hypothèse "rayons parallèles")
  const distR = (moon ? gm.distKM : gs.distAU * 149597870.7) / AZIM_R;
  return {
    C, jd, moon, sub, subS, subM, rows, distR, gm, gs, tri: azimTriangle(rows),
    label: azimFromJD(jd), running: Math.abs(tHours) > 1e-9,
    subGap: OBS.greatCircle(subS.lat, subS.lon, subM.lat, subM.lon).d,
  };
}

/** Lignes du tableau de l'éclipse : publié vs cette page. Calculé une fois, jamais lié à l'horloge. */
export function azimEclipseRows() {
  const P = AZIM_ECL_PUB;
  const jd = OBS.jdFromUTC(P.Y, P.M, P.D, P.h, P.mi, P.s);
  const dT = OBS.deltaT(2000 + (jd - 2451545.0) / 365.25);
  const g = OBS.sun(jd + dT / 86400), gm = OBS.moon(jd + dT / 86400);
  const hz = OBS.altaz(g.ra, g.dec, P.lat, P.lon, jd);
  const sub = OBS.subPoint(g.ra, g.dec, jd), subM = OBS.subPoint(gm.ra, gm.dec, jd);
  const bear = OBS.greatCircle(P.lat, P.lon, sub.lat, sub.lon).az;
  return { sunDec: g.dec, moonDec: gm.dec, alt: hz.alt, az: hz.az, bearing: bear, subGapKm: OBS.greatCircle(sub.lat, sub.lon, subM.lat, subM.lon).d, dT, pub: P };
}

// ---- parallaxe comme règle ---------------------------------------------------
const azimRD = (ra, dec) => { const c = Math.cos(RAD(dec)); return [c * Math.cos(RAD(ra)), c * Math.sin(RAD(ra)), Math.sin(RAD(dec))]; };
const azimStVec = (lat, lon, jd) => azimRD(OBS.gmst(jd) + lon, lat);

/**
 * La paire de stations choisie PAR UNE RÈGLE : toutes deux doivent voir le
 * corps, et parmi celles-là on prend celle dont les visées s'ouvrent le plus.
 * Reconstruction d/R = b / (R sin θ). Le Soleil est le témoin négatif.
 */
export function azimPairFor(S, body) {
  const jd = S.jd, g = body === "moon" ? S.gm : S.gs;
  const par = body === "moon" ? g.parallax : DEG(Math.asin(6378.14 / (g.distAU * 149597870.7)));
  const s = azimRD(g.ra, g.dec);
  const V = SEIS_STATIONS.map((st) => {
    const t = OBS.topocentric(g.ra, g.dec, par, st.lat, st.lon, jd, 0);
    return { st, u: azimRD(t.ra, t.dec), P: azimStVec(st.lat, st.lon, jd), alt: OBS.altaz(t.ra, t.dec, st.lat, st.lon, jd).alt };
  });
  let best = null;
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
    const A = V[i], B = V[j];
    if (A.alt <= 0 || B.alt <= 0) continue;
    const th = DEG(Math.acos(Math.min(1, Math.max(-1, azimDot(A.u, B.u)))));
    if (best && th <= best.th) continue;
    const b = [B.P[0] - A.P[0], B.P[1] - A.P[1], B.P[2] - A.P[2]];
    const al = azimDot(b, s);
    best = { A: A.st, B: B.st, th, par, bperp: Math.hypot(b[0] - al * s[0], b[1] - al * s[1], b[2] - al * s[2]), base: OBS.greatCircle(A.st.lat, A.st.lon, B.st.lat, B.st.lon).d };
  }
  if (best) best.dR = best.bperp / Math.sin(RAD(best.th));
  return best;
}

/** Altitude qu'exigerait une lampe à H km au-dessus du disque, pour chaque station, contre la Lune réelle. */
export function azimLampRows(S) {
  return S.rows.map((r) => ({ r, lamps: AZIM_LAMPS.map((H) => OBS.flatAltitude(r.lat, r.lon, S.subM.lat, S.subM.lon, H)) }));
}
/** La plus clémente des hauteurs de lampe à cet instant, et son erreur maximale. */
export function azimKindestLamp(S) {
  return AZIM_LAMPS.map((H) => ({ H, err: S.rows.reduce((a, r) => Math.max(a, Math.abs(OBS.flatAltitude(r.lat, r.lon, S.subM.lat, S.subM.lon, H) - r.mAlt)), 0) }))
    .sort((a, b) => a.err - b.err)[0];
}
