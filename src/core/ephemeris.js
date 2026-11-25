// Cœur d'éphémérides partagé (Soleil Meeus 25, Lune Meeus 47 abrégée,
// nutation 22, correction topocentrique 40, précession IAU 1976, réfraction
// Saemundsson/Bennett, grand cercle, azimut plat sur le disque AE), porté à
// l'identique du legacy (flat-or-globe-2.20.0.html, `const OBS = (() => {...})()`
// ~L25221-25519). Le legacy l'expose comme un objet `OBS` ; ici chaque
// fonction est un export nommé et `OBS` reste exporté par compatibilité.
//
// RÈGLE HÉRITÉE ("ONE EPHEMERIS", en-tête legacy de l'onglet azim) : les
// onglets azim et obs appellent CE cœur, pas le jeu NOAA de sun/twi (qui n'a
// pas de Lune). Une page qui soutient que le ciel est prévisible ne peut pas
// porter deux prédictions de celui-ci -- ne pas dupliquer ces formules.
//
// Les commentaires d'origine (pièges : Saemundsson vs Bennett, TT vs UT,
// parallaxe lunaire non négligeable, sphère vs WGS84) sont conservés tels quels.

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const sin = a => Math.sin(a * D2R), cos = a => Math.cos(a * D2R), tan = a => Math.tan(a * D2R);
const norm360 = a => ((a % 360) + 360) % 360;
const norm180 = a => norm360(a + 180) - 180;

/* -- 1. time ------------------------------------------------------------- */

// Calendar (UTC) -> Julian Day. Gregorian only; the page never goes before 1583.
export function jdFromUTC(y, m, d, hh = 0, mm = 0, ss = 0) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
       + d + B - 1524.5 + (hh + mm / 60 + ss / 3600) / 24;
}

// deltaT = TT - UT, seconds. Espenak & Meeus polynomial, 2005-2050 branch.
// A 10 s error moves the Sun by 0.25" — irrelevant here, but TT/UT must not be
// confused, because the SAME 10 s moves the sky by 2.5' in hour angle.
export function deltaT(y) {
  const t = y - 2000;
  return 62.92 + 0.32217 * t + 0.005589 * t * t;
}

// Greenwich mean sidereal time (degrees) from JD(UT).
export function gmst(jdUT) {
  const T = (jdUT - 2451545.0) / 36525;
  return norm360(280.46061837 + 360.98564736629 * (jdUT - 2451545.0)
               + 0.000387933 * T * T - T * T * T / 38710000);
}

// Nutation in longitude (deg) and true obliquity (deg). Meeus 22, short form.
export function nutation(T) {
  const Om = 125.04452 - 1934.136261 * T;
  const L  = 280.4665 + 36000.7698 * T;
  const Lp = 218.3165 + 481267.8813 * T;
  const dPsi = (-17.20 * sin(Om) - 1.32 * sin(2 * L) - 0.23 * sin(2 * Lp) + 0.21 * sin(2 * Om)) / 3600;
  const dEps = (  9.20 * cos(Om) + 0.57 * cos(2 * L) + 0.10 * cos(2 * Lp) - 0.09 * cos(2 * Om)) / 3600;
  const e0 = 23 + 26 / 60 + 21.448 / 3600
           - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  return { dPsi, eps: e0 + dEps };
}

/* -- 2. Sun (Meeus 25, low precision: ~0.01 deg) -------------------------- */

export function sun(jdTT) {
  const T = (jdTT - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M  = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const e  = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M)
           + (0.019993 - 0.000101 * T) * sin(2 * M)
           + 0.000289 * sin(3 * M);
  const trueLon = L0 + C, v = M + C;
  const Rau = (1.000001018 * (1 - e * e)) / (1 + e * cos(v));
  const Om = 125.04 - 1934.136 * T;
  const lam = trueLon - 0.00569 - 0.00478 * sin(Om);          // apparent longitude
  const { eps } = nutation(T);
  const epsC = eps + 0.00256 * cos(Om);
  const ra  = norm360(Math.atan2(cos(epsC) * sin(lam), cos(lam)) * R2D);
  const dec = Math.asin(sin(epsC) * sin(lam)) * R2D;
  return { ra, dec, distAU: Rau, sd: 959.63 / Rau / 3600, lon: norm360(lam) };
}

/* -- 3. Moon (Meeus 47, abridged ELP-2000/82) ----------------------------- */
/* Table 47.A : D, M, M', F, sum-l (1e-6 deg), sum-r (1e-3 km)              */
const M47A = [
[0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],
[0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],[0,0,0,2,-114332,-3149],
[2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],
[2,-1,0,0,45758,-204586],[0,1,-1,0,-40923,-129620],[1,0,0,0,-34720,108743],
[0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],
[0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],[0,0,3,0,10034,-23210],
[4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],[2,1,0,0,-6766,30824],
[1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],[2,-1,1,0,4036,-12831],
[2,0,2,0,3994,-10445],[4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],
[0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],[2,-1,-2,0,2390,10056],
[1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],
[0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],[2,0,1,-2,-1773,4130],
[2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],
[3,0,-1,0,-892,3258],[2,1,1,0,-810,2616],[4,-1,-2,0,759,-1897],
[0,2,-1,0,-713,-2117],[2,2,-1,0,-700,2354],[2,1,-2,0,691,0],
[2,-1,0,-2,596,0],[4,0,1,0,549,-1423],[0,0,4,0,537,-1117],
[4,-1,0,0,520,-1571],[1,0,-2,0,-487,-1739],[2,1,0,-2,-399,0],
[0,0,2,-2,-381,-4421],[1,1,1,0,351,0],[3,0,-2,0,-340,0],
[4,0,-3,0,330,0],[2,-1,2,0,327,0],[0,2,1,0,-323,1165],
[1,1,-1,0,299,0],[2,0,3,0,294,0],[2,0,-1,-2,0,8752]];

/* Table 47.B : D, M, M', F, sum-b (1e-6 deg) */
const M47B = [
[0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],
[2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],
[2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],
[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],
[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
[0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],
[0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],
[4,0,0,-1,1021],[4,0,-1,1,833],[0,0,1,-3,777],[4,0,-2,1,671],
[2,0,0,-3,607],[2,0,2,-1,596],[2,-1,1,-1,491],[2,0,-2,1,-451],
[0,0,3,-1,439],[2,0,2,1,422],[2,0,-3,-1,421],[2,1,-1,1,-366],
[2,1,0,1,-351],[4,0,0,1,331],[2,-1,1,1,315],[2,-2,0,-1,302],
[0,0,1,3,-283],[2,1,1,-1,-229],[1,1,0,-1,223],[1,1,0,1,223],
[0,1,-2,-1,-220],[2,1,-1,-1,-220],[1,0,1,1,-185],[2,-1,-2,-1,181],
[0,1,2,1,-177],[4,0,-2,-1,176],[4,-1,-1,-1,166],[1,0,1,-1,-164],
[4,0,1,-1,132],[1,0,-1,-1,-119],[4,-1,0,-1,115],[2,-2,0,1,107]];

export function moon(jdTT) {
  const T = (jdTT - 2451545.0) / 36525, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const Dd = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
  const F  = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
  const A1 = norm360(119.75 + 131.849 * T);
  const A2 = norm360(53.09 + 479264.290 * T);
  const A3 = norm360(313.45 + 481266.484 * T);
  const E  = 1 - 0.002516 * T - 0.0000074 * T2;

  let sl = 0, sr = 0, sb = 0;
  for (const [d, m, mp, f, cl, cr] of M47A) {
    const arg = d * Dd + m * M + mp * Mp + f * F;
    const ec = Math.abs(m) === 1 ? E : (Math.abs(m) === 2 ? E * E : 1);
    sl += cl * ec * sin(arg); sr += cr * ec * cos(arg);
  }
  for (const [d, m, mp, f, cb] of M47B) {
    const arg = d * Dd + m * M + mp * Mp + f * F;
    const ec = Math.abs(m) === 1 ? E : (Math.abs(m) === 2 ? E * E : 1);
    sb += cb * ec * sin(arg);
  }
  sl += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
  sb += -2235 * sin(Lp) + 382 * sin(A3) + 175 * sin(A1 - F) + 175 * sin(A1 + F)
      + 127 * sin(Lp - Mp) - 115 * sin(Lp + Mp);

  const { dPsi, eps } = nutation(T);
  const lam  = norm360(Lp + sl / 1e6 + dPsi);          // apparent longitude
  const beta = sb / 1e6;
  const dist = 385000.56 + sr / 1000;                  // km, centre to centre
  const ra  = norm360(Math.atan2(sin(lam) * cos(eps) - tan(beta) * sin(eps), cos(lam)) * R2D);
  const dec = Math.asin(sin(beta) * cos(eps) + cos(beta) * sin(eps) * sin(lam)) * R2D;
  const par = Math.asin(6378.14 / dist) * R2D;         // equatorial horizontal parallax
  return { ra, dec, distKM: dist, parallax: par, sd: 358473400 / dist / 3600, lon: lam, lat: beta };
}

/* -- 4. topocentric correction (Meeus 40) --------------------------------
   Deliberately NOT skipped: the Moon's parallax reaches 1 deg, which is
   TWICE its own diameter and 5x the whole flat-vs-globe signal in this tab.
   The page's "sun/moon parallax not modelled" exclusion applied to the
   celestial-navigation tab only; here it would be a first-order error.     */
export function topocentric(ra, dec, parallaxDeg, lat, lonE, jdUT, hMetres) {
  if (!parallaxDeg) return { ra, dec };
  const u = Math.atan(0.99664719 * tan(lat)) * R2D;
  const rhoSin = 0.99664719 * sin(u) + (hMetres / 6378140) * sin(lat);
  const rhoCos = cos(u) + (hMetres / 6378140) * cos(lat);
  const H = norm180(gmst(jdUT) + lonE - ra);
  const sPi = sin(parallaxDeg);
  const dRa = Math.atan2(-rhoCos * sPi * sin(H), cos(dec) - rhoCos * sPi * cos(H)) * R2D;
  const decT = Math.atan2((sin(dec) - rhoSin * sPi) * cos(dRa * D2R),
                          cos(dec) - rhoCos * sPi * cos(H)) * R2D;
  return { ra: norm360(ra + dRa), dec: decT };
}

/* -- 5. horizontal coordinates + refraction ------------------------------- */

export function altaz(ra, dec, lat, lonE, jdUT) {
  const H = norm180(gmst(jdUT) + lonE - ra);
  const alt = Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)) * R2D;
  const az = norm360(Math.atan2(sin(H), cos(H) * sin(lat) - tan(dec) * cos(lat)) * R2D + 180);
  return { alt, az, ha: H };
}

/* THE TWO REFRACTION FORMULAS ARE NOT INTERCHANGEABLE AND WERE ONCE SWAPPED
   HERE. Each takes a different input and they are NOT inverses of one another:

     Saemundsson (1986)  1.02 cot(h + 10.3/(h + 5.11))   h = TRUE altitude
     Bennett     (1982)  1.00 cot(h +  7.31/(h + 4.4))   h = APPARENT altitude

   Feeding a true altitude to Bennett overstates the refraction by 7.7' at the
   horizon -- a quarter of the solar disc, and enough to make a predicted sunset
   disagree visibly with a photograph of it. Checked against libastro: at true
   altitude -26.5' it returns 33.3', Saemundsson gives 33.1', Bennett-misfed
   gives 40.8'. Use refrArcmin to PREDICT (true -> apparent) and refrArcminApp
   to READ AN ANGLE OFF A PHOTOGRAPH (apparent -> true). */
export const refrArcmin    = trueDeg => 1.02 / tan(trueDeg + 10.3 / (trueDeg + 5.11));
export const refrArcminApp = appDeg  => 1    / tan(appDeg  +  7.31 / (appDeg  + 4.4));

/* LE DISQUE APLATI (2026-09-27). Près de l'horizon la réfraction varie vite
   avec la hauteur : le bord inférieur du Soleil est plus relevé que le bord
   supérieur, et le disque apparent est ÉCRASÉ verticalement (le 10 janvier
   2026 au point de vue d'obs, 27,9′ au lieu de 32,5′ au coucher). Traiter le
   Soleil comme un cercle réfracté en bloc décalait les contacts : le premier
   trop tôt, la dernière lumière trop tard (±10 à 20 s). limbAlt : hauteur
   APPARENTE du point du disque situé `off` degrés au-dessus du centre VRAI,
   chaque point réfracté à sa propre hauteur ; f = facteur P/T de Meeus. */
export const limbAlt = (trueCentre, off, f = 1) => { const h = trueCentre + off; return h + refrArcmin(h) * f / 60; };

/* -- 6. terrestrial sight lines ------------------------------------------
   The three predictions the whole tab exists to separate. Small-angle form
   is NOT used: at 54 km it is fine, but the tab must stay honest at 300 km. */
export function targetAngle(obsH, tgtH, dKM, RKM = 6371, k = 0) {
  const Reff = RKM / (1 - k);
  const r1 = Reff + obsH / 1000, r2 = Reff + tgtH / 1000;
  const g = dKM / Reff;                                     // central angle
  // elevation of the target above the observer's horizontal, exact
  return Math.atan2(r2 * Math.cos(g) - r1, r2 * Math.sin(g)) * R2D;
}
export const flatAngle = (obsH, tgtH, dKM) => Math.atan2((tgtH - obsH) / 1000, dKM) * R2D;

/* -- 6b. inverse great circle -------------------------------------------
   Targets should carry only what a source publishes: name, coordinates,
   summit height. Distance and azimuth are DERIVED, so a rounded readout
   copied off an app can never enter the calculation. Sphere, not WGS84:
   the geodesic differs by 0.3 %, which moves the Grand Mourre answer by
   0.08' out of a 12.75' effect. Measured, not assumed -- see the header. */
export function greatCircle(lat1, lon1, lat2, lon2, RKM = 6371) {
  const p1 = lat1 * D2R, p2 = lat2 * D2R, dl = (lon2 - lon1) * D2R;
  const c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return { d: RKM * Math.acos(Math.min(1, Math.max(-1, c))),
           az: norm360(Math.atan2(Math.sin(dl) * Math.cos(p2),
                 Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) * R2D) };
}

/* -- 7. the flat model's own prediction -----------------------------------
   Azimuth of the sub-body point on the north-polar azimuthal-equidistant
   disc (the Gleason map). NOTE, and say so on the page: this has NO free
   parameter. The lamp's height cancels — only the map direction remains.  */
export function subPoint(ra, dec, jdUT) {
  return { lat: dec, lon: norm180(ra - gmst(jdUT)) };
}
export function flatAzimuth(obsLat, obsLonE, subLat, subLonE) {
  const ae = (phi, lam) => [(90 - phi) * cos(lam), (90 - phi) * sin(lam)];
  const [ox, oy] = ae(obsLat, obsLonE), [sx, sy] = ae(subLat, subLonE);
  const nl = Math.hypot(ox, oy);
  const nx = -ox / nl, ny = -oy / nl;                       // local north = toward the pole
  const ex = ny, ey = -nx;                                  // east, so azimuth runs N->E->S->W
  const vx = sx - ox, vy = sy - oy;
  return norm360(Math.atan2(vx * ex + vy * ey, vx * nx + vy * ny) * R2D);
}
// and its elevation, which DOES need the lamp height (the one free parameter)
export function flatAltitude(obsLat, obsLonE, subLat, subLonE, lampKM) {
  const g = flatGeom(obsLat, obsLonE, subLat, subLonE, lampKM);
  return g.alt;
}
/* Ground range across the AE disc, slant range to the lamp, and the lamp's
   apparent diameter. The lamp's PHYSICAL size is not free once you fix its
   height: steel-manning the flat model means letting it choose the diameter
   that makes the disc come out right when the lamp is overhead, which is the
   most favourable calibration available. Everything after that is forced --
   and the disc then has to shrink as the lamp recedes toward the horizon.
   No viewpoint is hard-coded anywhere in here: it is all lat/lon in, angles
   out, so a new site needs no change to this function. */
export function flatGeom(obsLat, obsLonE, subLat, subLonE, lampKM) {
  const ae = (phi, lam) => [(90 - phi) * cos(lam), (90 - phi) * sin(lam)];
  const [ox, oy] = ae(obsLat, obsLonE), [sx, sy] = ae(subLat, subLonE);
  const ground = Math.hypot(sx - ox, sy - oy) * 111.19492664;
  return { ground, slant: Math.hypot(ground, lampKM),
           alt: Math.atan2(lampKM, ground) * R2D,
           az: flatAzimuth(obsLat, obsLonE, subLat, subLonE) };
}

/* -- 8. one call, everything ---------------------------------------------- */
export function bodyAt(body, jdUT, lat, lonE, hMetres, opts = {}) {
  const y = 2000 + (jdUT - 2451545.0) / 365.25;
  const jdTT = jdUT + deltaT(y) / 86400;
  const g = body === 'moon' ? moon(jdTT) : sun(jdTT);
  const t = body === 'moon'
    ? topocentric(g.ra, g.dec, g.parallax, lat, lonE, jdUT, hMetres)
    : { ra: g.ra, dec: g.dec };
  const h = altaz(t.ra, t.dec, lat, lonE, jdUT);
  const refr = opts.refraction === false ? 0 : refrArcmin(h.alt) / 60;
  const sub = subPoint(t.ra, t.dec, jdUT);
  return {
    raGeo: g.ra, decGeo: g.dec, ra: t.ra, dec: t.dec,
    altTrue: h.alt, altApp: h.alt + refr, az: h.az, refrArcmin: refr * 60,
    sd: g.sd, distKM: g.distKM, distAU: g.distAU,
    sub, flatAz: flatAzimuth(lat, lonE, sub.lat, sub.lon),
    flat: flatGeom(lat, lonE, sub.lat, sub.lon, opts.lampKM || 5000),
    lampKM: opts.lampKM || 5000
  };
}

/* -- precession of equatorial coordinates, IAU 1976 ----------------------
   J2000 to date is about 0.36 deg by 2026 -- the same order as the precision
   the star tab claims, so it cannot be skipped, and Polaris's distance from
   the pole must be COMPUTED rather than written down: it was 0.736 deg in
   2000, it is 0.625 deg now, and a hard-coded figure goes stale silently.
   Proper motion is NOT applied: 26 years give at most 30" (alpha Centauri,
   the largest of any bright star), an order of magnitude below anything
   asserted here. Zeta, z and theta are the standard Lieske et al. series. */
export function precess(ra, dec, jdUT){
  const t  = (jdUT - 2451545.0) / 36525;
  const z1 = (2306.2181*t + 0.30188*t*t + 0.017998*t*t*t) / 3600;
  const z2 = (2306.2181*t + 1.09468*t*t + 0.018203*t*t*t) / 3600;
  const th = (2004.3109*t - 0.42665*t*t - 0.041833*t*t*t) / 3600;
  const A = cos(dec) * sin(ra + z1);
  const B = cos(th) * cos(dec) * cos(ra + z1) - sin(th) * sin(dec);
  const C = sin(th) * cos(dec) * cos(ra + z1) + cos(th) * sin(dec);
  return { ra: norm360(Math.atan2(A, B) * R2D + z2),
           dec: Math.asin(Math.max(-1, Math.min(1, C))) * R2D };
}

export const norm360Deg = norm360;
export const norm180Deg = norm180;
/** Objet de compatibilité avec le legacy (`OBS.sun(...)`, etc.). */
export const OBS = { jdFromUTC, deltaT, gmst, nutation, sun, moon, topocentric, altaz, precess,
  refrArcmin, refrArcminApp, limbAlt, targetAngle, flatAngle, greatCircle,
  subPoint, flatAzimuth, flatAltitude, flatGeom, bodyAt };
