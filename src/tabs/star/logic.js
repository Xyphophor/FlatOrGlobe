// Logique pure de l'onglet star (traînées d'étoiles), portée à l'identique
// de l'IIFE `STAR` du legacy (flat-or-globe-2.20.0.html, ~L26907-28156).
// Séparée de index.js pour rester testable sous node:test sans DOM/canvas
// (voir tasks/epic02/UC02.org).
//
// ATTENTION NOMMAGE (UC02) : le legacy a un `render()` PRIVÉ à l'IIFE STAR
// (~L28109), sans rapport avec le `render()` exporté par le contrat
// d'onglet (epic01/UC03). Ce module n'exporte AUCUNE fonction nommée
// `render` -- src/tabs/star/index.js appelle la logique ci-dessous depuis
// une méthode interne renommée `drawTrails()`, jamais `render`.
//
// DÉPENDANCE OBS-CORE (legacy ~L26900-26906) : dans le legacy, l'IIFE STAR
// ne redéfinit pas jdFromUTC/gmst/altaz/subPoint/flatGeom/precess -- elle
// les lit depuis le namespace `OBS`, défini par ailleurs dans le fichier
// pour le tab "obs" (pas encore porté dans cette réécriture, cf.
// ARCHITECTURE.md -- "obs" n'est pas dans le périmètre de l'epic02/UC02).
// Le sous-ensemble nécessaire est donc recopié ici verbatim (mêmes
// constantes, mêmes formules) plutôt qu'importé d'un tab qui n'existe pas
// encore -- à réconcilier avec un futur src/core/ephemeris.js si/quand le
// tab "obs" est porté et que la duplication devient un risque de dérive.
import { STARS, STAR_SPOTS, STAR_DATES, STAR_DOMES, STAR_CONS } from "../../data/star-catalog.js";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const sin = (a) => Math.sin(a * D2R);
const cos = (a) => Math.cos(a * D2R);
const tan = (a) => Math.tan(a * D2R);
export const norm360 = (a) => ((a % 360) + 360) % 360;
export const norm180 = (a) => norm360(a + 180) - 180;

/** Jour julien (UT) -- legacy obs-core jdFromUTC(), ~L25231. */
export function jdFromUTC(y, m, d, hh = 0, mm = 0, ss = 0) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
    + d + B - 1524.5 + (hh + mm / 60 + ss / 3600) / 24;
}

/** Temps sidéral moyen de Greenwich, en degrés -- legacy obs-core gmst(), ~L25247. */
export function gmst(jdUT) {
  const T = (jdUT - 2451545.0) / 36525;
  return norm360(280.46061837 + 360.98564736629 * (jdUT - 2451545.0)
    + 0.000387933 * T * T - (T * T * T) / 38710000);
}

/** Coordonnées horizontales (alt/az) -- legacy obs-core altaz(), ~L25385. */
export function altaz(ra, dec, lat, lonE, jdUT) {
  const H = norm180(gmst(jdUT) + lonE - ra);
  const alt = Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)) * R2D;
  const az = norm360(Math.atan2(sin(H), cos(H) * sin(lat) - tan(dec) * cos(lat)) * R2D + 180);
  return { alt, az, ha: H };
}

/** Point sous l'astre (sub-point) -- legacy obs-core subPoint(), ~L25437. */
export function subPoint(ra, dec, jdUT) {
  return { lat: dec, lon: norm180(ra - gmst(jdUT)) };
}

/** Azimut du sub-point sur le disque azimutal équidistant -- flatAzimuth(), ~L25440. */
export function flatAzimuth(obsLat, obsLonE, subLat, subLonE) {
  const ae = (phi, lam) => [(90 - phi) * cos(lam), (90 - phi) * sin(lam)];
  const [ox, oy] = ae(obsLat, obsLonE), [sx, sy] = ae(subLat, subLonE);
  const nl = Math.hypot(ox, oy);
  const nx = -ox / nl, ny = -oy / nl;
  const ex = ny, ey = -nx;
  const vx = sx - ox, vy = sy - oy;
  return norm360(Math.atan2(vx * ex + vy * ey, vx * nx + vy * ny) * R2D);
}

/** Altitude/azimut du modèle plat pour un dôme de hauteur lampKM -- flatGeom(), ~L25462. */
export function flatGeom(obsLat, obsLonE, subLat, subLonE, lampKM) {
  const ae = (phi, lam) => [(90 - phi) * cos(lam), (90 - phi) * sin(lam)];
  const [ox, oy] = ae(obsLat, obsLonE), [sx, sy] = ae(subLat, subLonE);
  const ground = Math.hypot(sx - ox, sy - oy) * 111.19492664;
  return {
    ground, slant: Math.hypot(ground, lampKM),
    alt: Math.atan2(lampKM, ground) * R2D,
    az: flatAzimuth(obsLat, obsLonE, subLat, subLonE),
  };
}

/**
 * Précession des coordonnées équatoriales, IAU 1976 (Lieske) -- legacy
 * obs-core precess(), ~L25500. J2000 -> 2026 vaut environ 0,36°, c'est
 * pourquoi Polaris est à 0,625° du pôle aujourd'hui et non 0,736° (J2000) --
 * voir star/logic.test.js.
 */
export function precess(ra, dec, jdUT) {
  const t = (jdUT - 2451545.0) / 36525;
  const z1 = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) / 3600;
  const z2 = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) / 3600;
  const th = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) / 3600;
  const A = cos(dec) * sin(ra + z1);
  const B = cos(th) * cos(dec) * cos(ra + z1) - sin(th) * sin(dec);
  const C = sin(th) * cos(dec) * cos(ra + z1) + cos(th) * sin(dec);
  return {
    ra: norm360(Math.atan2(A, B) * R2D + z2),
    dec: Math.asin(Math.max(-1, Math.min(1, C))) * R2D,
  };
}

export const STAR_RKM = 6371;
export const KM_PER_DEG = 111.19492664;
export const STAR_SIDEREAL_RATE = 15.041; // deg/h -- legacy Δψ formula, ~L28973

/** Distance de l'observateur au centre du disque AE -- legacy discR(), ~L27079. */
export const discR = (phi) => (90 - phi) * KM_PER_DEG;

/** Point fixe du modèle globe : altitude = |latitude|, sens selon l'hémisphère. */
export function fixedGlobe(phi) {
  return phi >= 0
    ? { alt: phi, az: 0, sense: "counter-clockwise" }
    : { alt: -phi, az: 180, sense: "clockwise" };
}

/** Point fixe du modèle plat : toujours au-dessus de l'horizon, même sens partout. */
export function fixedFlat(phi, h) {
  return { alt: Math.atan2(h, discR(phi)) * R2D, az: 0, sense: "counter-clockwise" };
}

/** Position d'une étoile (globe), précession appliquée -- legacy posGlobe(), ~L27091. */
export function posGlobe(st, spot, jd) {
  const p = precess(st.ra, st.de, jd);
  return altaz(p.ra, p.dec, spot.lat, spot.lon, jd);
}

/** Position d'une étoile (modèle plat, dôme à hauteur h) -- legacy posFlat(), ~L27095. */
export function posFlat(st, spot, jd, h) {
  const p = precess(st.ra, st.de, jd);
  const s = subPoint(p.ra, p.dec, jd);
  return flatGeom(spot.lat, spot.lon, s.lat, s.lon, h);
}

/** Séparation angulaire entre deux positions alt/az -- legacy sepDeg(), ~L27106. */
export const sepDeg = (a1, A1, a2, A2) =>
  Math.acos(Math.max(-1, Math.min(1, sin(a1) * sin(a2) + cos(a1) * cos(a2) * cos(A1 - A2)))) * R2D;

/**
 * Étoile circumpolaire retenue pour un lieu : δ ≥ |φ| ET du même signe (entre
 * le pôle et le zénith), visible à l'œil nu (V ≤ 3,2) si possible, celle avec
 * le plus grand rayon de traînée p = 90° − |δ| -- legacy pickStar(), ~L28013.
 * Choix documenté : PAS la plus brillante (Polaris a un rayon trop petit pour
 * séparer les deux modèles).
 */
export function pickStar(sp) {
  const p = 90 - Math.abs(sp.lat), la = Math.abs(sp.lat);
  const ok = STARS.filter((s) => {
    const d = sp.lat >= 0 ? s.de : -s.de;
    return d > p && d >= la;
  });
  const vis = ok.filter((s) => s.v <= 3.2);
  const p90 = (s) => 90 - Math.abs(s.de);
  const pool = vis.length ? vis : ok;
  return [...pool].sort((a, b) => p90(b) - p90(a) || a.v - b.v)[0] || null;
}

/** Jour julien du minuit moyen local, pour un lieu et une date -- legacy jdOf(), ~L27133. */
export function jdForSpotDate(spot, dateEntry) {
  return jdFromUTC(dateEntry.Y, dateEntry.M, dateEntry.D, 0, 0, 0) - spot.lon / 360;
}

/**
 * Nom du point cardinal le plus proche, 8 directions. CORRIGÉ pendant le
 * portage (UC02) : le legacy renvoyait "SO"/"O"/"NO" (abréviations
 * françaises) dans une table censée rester en anglais dans toutes les
 * langues -- voir CLAUDE.md §i18n "Canvas labels are unlocalized
 * everywhere" et le commentaire legacy juste avant jdOf() (~L27138) qui
 * énonce explicitement cette règle. Bug de la v138 legacy, pas reproduit ici.
 */
export function azName(az) {
  const k = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return k[Math.round(norm360(az) / 45) % 8];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Position moyenne (ra, dec) d'une constellation à un instant -- legacy consPos(), ~L27874. */
export function consPos(cons, jd) {
  let x = 0, y = 0, z = 0, n = 0;
  cons.hr.forEach((hr) => {
    const st = STARS.find((a) => a.hr === hr);
    if (!st) return;
    const p = precess(st.ra, st.de, jd);
    x += cos(p.dec) * cos(p.ra); y += cos(p.dec) * sin(p.ra); z += sin(p.dec); n += 1;
  });
  if (!n) return null;
  const L = Math.hypot(x, y, z) || 1;
  return { ra: norm360(Math.atan2(y, x) * R2D), dec: Math.asin(z / L) * R2D, n };
}

/** Classe d'une constellation : "always up" | "never rises" | "seasonal" -- consClass(), ~L27883. */
export function consClass(dec, lat) {
  const lim = 90 - Math.abs(lat);
  if (Math.abs(dec) > lim) return (dec > 0) === (lat >= 0) ? "always up" : "never rises";
  return "seasonal";
}

/** Mois où la constellation culmine près de minuit -- legacy bestMonth(), ~L27888. */
export function bestMonth(ra, spot, year) {
  let best = 0, bd = 999;
  for (let m = 0; m < 12; m += 1) {
    const jd = jdFromUTC(year, m + 1, 15, 0, 0, 0) - spot.lon / 360;
    const d = Math.abs(norm180(norm360(gmst(jd) + spot.lon) - ra));
    if (d < bd) { bd = d; best = m; }
  }
  return MONTHS[best];
}

/** Tableau 1 : le point fixe, lieu par lieu -- legacy tabSpots(), ~L27987. */
export function spotsTable(domeKm) {
  return STAR_SPOTS.map((sp) => {
    const g = fixedGlobe(sp.lat), f = fixedFlat(sp.lat, domeKm);
    return {
      name: sp.n, latAbs: Math.abs(sp.lat), latDir: sp.lat < 0 ? "S" : "N",
      globeAlt: g.alt, globeAz: azName(g.az), globeSense: g.sense,
      flatAlt: f.alt, flatAz: azName(f.az), flatSense: f.sense,
    };
  });
}

/**
 * Tableau 2 : la forme d'une traînée pour l'étoile circumpolaire retenue --
 * legacy tabShape(), ~L28029. `null` si aucune étoile circumpolaire au lieu
 * choisi (cas équatorial).
 */
export function shapeTable(spot, domeKm, jd0) {
  const st = pickStar(spot);
  if (!st) return null;
  const gfp = fixedGlobe(spot.lat), ffp = fixedFlat(spot.lat, domeKm);
  const gA = [], fA = [], gR = [], fR = [];
  for (let i = 0; i < 240; i += 1) {
    const jd = jd0 + (i / 240) * 0.99727;
    const G = posGlobe(st, spot, jd), F = posFlat(st, spot, jd, domeKm);
    gA.push(G.alt); fA.push(F.alt);
    gR.push(sepDeg(G.alt, G.az, gfp.alt, gfp.az));
    fR.push(sepDeg(F.alt, F.az, ffp.alt, ffp.az));
  }
  const mm = (a) => [Math.min(...a), Math.max(...a)];
  const [gl, gh] = mm(gA), [fl, fh] = mm(fA), [grl, grh] = mm(gR), [frl, frh] = mm(fR);
  const p = 90 - Math.abs(precess(st.ra, st.de, jd0).dec);
  return {
    star: st,
    upperG: gh, upperF: fh, lowerG: gl, lowerF: fl,
    meanG: (gl + gh) / 2, meanF: (fl + fh) / 2,
    fixedG: gfp.alt, fixedF: ffp.alt,
    diffG: (gl + gh) / 2 - gfp.alt, diffF: (fl + fh) / 2 - ffp.alt,
    radiusG: [grl, grh], radiusF: [frl, frh],
    expectedRadius: p,
  };
}

/**
 * Tableau 3 : le dilemme de la hauteur du dôme, balayée sur STAR_DOMES --
 * legacy tabDome(), ~L28058. `null` si pas d'étoile circumpolaire au lieu.
 */
export function domeTable(spot, jd0) {
  const st = pickStar(spot);
  if (!st) return null;
  return STAR_DOMES.map((h) => {
    const f = fixedFlat(spot.lat, h);
    const A = [];
    for (let i = 0; i < 240; i += 1) A.push(posFlat(st, spot, jd0 + (i / 240) * 0.99727, h).alt);
    const mid = (Math.min(...A) + Math.max(...A)) / 2;
    return { domeKm: h, fixedAlt: f.alt, errVsLat: f.alt - Math.abs(spot.lat), asymmetry: mid - f.alt };
  });
}

/** Tableau 4 : permanentes / saisonnières / jamais vues -- legacy tabSeason(), ~L27967. */
export function seasonTable(spot, jd0, year) {
  const rows = STAR_CONS.map((c) => ({ c, p: consPos(c, jd0) }))
    .filter((r) => r.p)
    .sort((a, b) => b.p.dec - a.p.dec);
  return rows.map((r) => {
    const cls = consClass(r.p.dec, spot.lat);
    const alt = 90 - Math.abs(spot.lat - r.p.dec);
    const visible = cls === "never rises" ? null : { month: bestMonth(r.p.ra, spot, year), altAtBest: Math.min(90, alt) };
    return { name: r.c.n, dec: r.p.dec, cls, visible };
  });
}

/** Résumé "reads" (bandeau de lecture) -- legacy reads(), ~L28075. */
export function readsSummary(spot, domeKm, dateEntry, view) {
  const g = fixedGlobe(spot.lat), f = fixedFlat(spot.lat, domeKm);
  return {
    place: spot.n, latAbs: Math.abs(spot.lat), latDir: spot.lat < 0 ? "S" : "N",
    date: dateEntry, view,
    globeAlt: g.alt, globeAz: azName(g.az), globeSense: g.sense,
    flatAlt: f.alt, flatAz: azName(f.az), flatSense: f.sense, domeKm,
  };
}

/** Nombres bruts du cas affiché, pour vérification manuelle -- legacy dump(), ~L28093. */
export function dumpRows(spot, domeKm, jd) {
  const pol0 = STARS.find((x) => x.hr === 424); // Polaris
  const pol = precess(pol0.ra, pol0.de, jd);
  const st = pickStar(spot);
  return [
    ["Julian date, local mean midnight", jd.toFixed(5)],
    ["Greenwich mean sidereal time", `${gmst(jd).toFixed(4)}°`],
    ["Polaris δ, J2000 as published", `${pol0.de.toFixed(4)}° — ${(90 - pol0.de).toFixed(3)}° from the pole`],
    ["Polaris δ, precessed to the date", `${pol.dec.toFixed(4)}° — ${(90 - pol.dec).toFixed(3)}° from the pole`],
    ["r(φ), observer to disc centre on the flat map", `${discR(spot.lat).toFixed(0)} km`],
    ["dome height in use", `${domeKm.toLocaleString("en-US")} km`],
    ["circumpolar star the tables use", st ? `${st.n}  (δ = ${st.de.toFixed(2)}°, p = ${(90 - Math.abs(st.de)).toFixed(2)}°)` : "none at this latitude"],
  ];
}
