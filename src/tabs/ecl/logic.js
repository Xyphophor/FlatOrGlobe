// Onglet "ecl" (éclipses, epic09) -- calculs purs, testés (logic.test.js).
// Tout part des ÉLÉMENTS BESSÉLIENS publiés par la NASA (src/data/presets/
// ecl.js) et de la méthode de Meeus (Elements of Solar Eclipses 1951-2200,
// Willmann-Bell 1989). Le point à retenir pour la page : la méthode ne peut
// pas fonctionner sans un observateur posé sur un ELLIPSOÏDE -- ρ sin φ′ et
// ρ cos φ′ sont ses coordonnées géocentriques, le plan fondamental passe par
// le centre de la Terre.
const R = Math.PI / 180;
const E2 = 0.00669438;          // excentricité² de l'ellipsoïde (IAU 1976, utilisé par Meeus)
const B_A = 0.99664719;         // b/a

/** Polynôme a0 + a1 t + a2 t² + a3 t³ et sa dérivée (par heure). */
const poly = (c, t) => c.reduce((s, a, i) => s + a * t ** i, 0);
const dpoly = (c, t) => c.reduce((s, a, i) => (i ? s + i * a * t ** (i - 1) : s), 0);

/** Éléments besséliens à l'instant UT (heures décimales du jour de l'éclipse). */
export function bessel(E, utH) {
  const t = utH + E.deltaT / 3600 - E.t0TDT, el = E.elements;
  return {
    t, x: poly(el.x, t), y: poly(el.y, t), d: poly(el.d, t) * R, l1: poly(el.l1, t), l2: poly(el.l2, t), mu: poly(el.mu, t),
    dx: dpoly(el.x, t), dy: dpoly(el.y, t), dd: dpoly(el.d, t) * R, dmu: dpoly(el.mu, t) * R,
  };
}

/**
 * Point de la ligne centrale à l'instant UT : latitude géographique,
 * longitude EST positive (°) ; null si l'axe de l'ombre manque la Terre.
 * Le terme 0,00417807·ΔT ramène la rotation terrestre (UT) aux éléments (TDT).
 */
export function centralPoint(E, utH) {
  const b = bessel(E, utH);
  const w = 1 / Math.sqrt(1 - E2 * Math.cos(b.d) ** 2);
  const y1 = w * b.y, b1 = w * Math.sin(b.d), b2 = B_A * w * Math.cos(b.d);
  const B2 = 1 - b.x * b.x - y1 * y1;
  if (B2 < 0) return null;
  const B = Math.sqrt(B2);
  const phi1 = Math.asin(B * b1 + y1 * b2);
  const H = Math.atan2(b.x, B * b2 - y1 * b1) / R;
  const lat = Math.atan(Math.tan(phi1) / B_A) / R;
  let lon = H - b.mu + 0.00417807 * E.deltaT;
  lon = ((lon + 540) % 360) - 180;
  return { lat, lon };
}

/** « 08:26 » → 8.4333 h. */
export const hhmm = (s) => { const [h, m, sec] = s.split(":").map(Number); return h + m / 60 + (sec || 0) / 3600; };

/* ---- UC03 : pourquoi pas une éclipse chaque mois --------------------------
   Éléments MOYENS de Meeus (Astronomical Algorithms, ch. 47) -- élongation D,
   argument de latitude F, nœud ascendant Ω -- et longitude moyenne du Soleil
   (ch. 25). Assez pour placer les nouvelles et pleines lunes d'une année à
   ~un jour près et dire lesquelles tombent près d'un nœud. Critère de Meeus
   (ch. 54) : pas d'éclipse si |sin F| > 0,36 à la syzygie. Ce n'est PAS le
   calcul de l'éclipse (UC05) : c'est la maquette qui dit « pourquoi deux
   saisons par an ». */
export const MOON_INCL = 5.145;          // ° (Meeus ch. 47 ; NASA)
export const ECL_SIN_F = 0.36;           // Meeus ch. 54
const n360 = (a) => ((a % 360) + 360) % 360;
export function meanElements(jd) {
  const T = (jd - 2451545.0) / 36525;
  return {
    sunLon: n360(280.46646 + 36000.76983 * T),
    D: n360(297.8501921 + 445267.1114034 * T),
    F: n360(93.2720950 + 483202.0175233 * T),
    node: n360(125.0445479 - 1934.1362891 * T),
  };
}
/** Syzygies (nouvelles et pleines lunes moyennes) entre jd0 et jd1, avec le verdict « éclipse possible ». */
export function syzygies(jd0, jd1) {
  const out = [];
  const phase = (jd) => meanElements(jd).D;          // 0 = nouvelle lune, 180 = pleine
  for (let jd = jd0; jd < jd1; jd += 0.25) {
    for (const target of [0, 180]) {
      const f = (x) => ((phase(x) - target + 540) % 360) - 180;
      const a = f(jd), b = f(jd + 0.25);
      if (a <= 0 && b > 0) {
        let lo = jd, hi = jd + 0.25;
        for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (f(m) <= 0) lo = m; else hi = m; }
        const F = meanElements(lo).F;
        out.push({ jd: lo, kind: target === 0 ? "new" : "full", F, eclipse: Math.abs(Math.sin(F * R)) < ECL_SIN_F });
      }
    }
  }
  return out.sort((p, q) => p.jd - q.jd);
}
/** JD (0 h UT) d'une date civile grégorienne. */
export function jdOf(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
export function dateOf(jd) {
  const Z = Math.floor(jd + 0.5), F = jd + 0.5 - Z, a = Math.floor((Z - 1867216.25) / 36524.25);
  const A = Z + 1 + a - Math.floor(a / 4), B = A + 1524, C = Math.floor((B - 122.1) / 365.25);
  const Dd = Math.floor(365.25 * C), E = Math.floor((B - Dd) / 30.6001);
  const day = B - Dd - Math.floor(30.6001 * E) + F, m = E < 14 ? E - 1 : E - 13, y = m > 2 ? C - 4716 : C - 4715;
  return { y, m, d: Math.floor(day) };
}

/* ---- UC05 : circonstances locales (Meeus, Elements of Solar Eclipses) -----
   L'observateur est posé sur l'ELLIPSOÏDE : ρ sin φ′ et ρ cos φ′ sont ses
   coordonnées géocentriques (a = 6 378 140 m, b/a = 0,99664719). Sans elles,
   aucune des quantités ξ, η, ζ ci-dessous n'existe -- c'est littéralement
   l'endroit où la prédiction « utilise le globe ». Longitude EST positive.
   Heures en UT décimales. Contacts : racines de √(u²+v²) = |L| autour du
   maximum (bisection), plutôt que les formules fermées à signes piégeux. */
export function observerGeo(latDeg, hMetres = 0) {
  const phi = latDeg * R, u1 = Math.atan(B_A * Math.tan(phi)), k = hMetres / 6378140;
  return { rs: B_A * Math.sin(u1) + k * Math.sin(phi), rc: Math.cos(u1) + k * Math.cos(phi), phi };
}
function shadowAt(E, utH, O, lonE) {
  const b = bessel(E, utH);
  const H = (b.mu + lonE - 0.00417807 * E.deltaT) * R;
  const xi = O.rc * Math.sin(H);
  const eta = O.rs * Math.cos(b.d) - O.rc * Math.cos(H) * Math.sin(b.d);
  const zeta = O.rs * Math.sin(b.d) + O.rc * Math.cos(H) * Math.cos(b.d);
  const dxi = b.dmu * O.rc * Math.cos(H), deta = b.dmu * xi * Math.sin(b.d) - zeta * b.dd;
  const u = b.x - xi, v = b.y - eta, a = b.dx - dxi, bb = b.dy - deta;
  const L1 = b.l1 - zeta * E.tanf1, L2 = b.l2 - zeta * E.tanf2;
  // Soleil au-dessus de l'horizon ? hauteur géocentrique, assez pour un contact
  const alt = Math.asin(Math.sin(b.d) * Math.sin(O.phi) + Math.cos(b.d) * Math.cos(O.phi) * Math.cos(H)) / R;
  let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(O.phi) - Math.tan(b.d) * Math.cos(O.phi)) / R + 180;
  az = ((az % 360) + 360) % 360;
  return { u, v, a, b: bb, L1, L2, m: Math.hypot(u, v), alt, az };
}
export function localCircumstances(E, latDeg, lonE, hMetres = 0) {
  const O = observerGeo(latDeg, hMetres);
  const t0 = E.t0TDT - E.deltaT / 3600;
  let t = t0;
  for (let k = 0; k < 20; k++) {                       // maximum : u·a + v·b = 0
    const s = shadowAt(E, t, O, lonE), tau = -(s.u * s.a + s.v * s.b) / (s.a * s.a + s.b * s.b);
    t += tau; if (Math.abs(tau) < 1e-7) break;
  }
  const S = shadowAt(E, t, O, lonE);
  const mag = (S.L1 - S.m) / (S.L1 + S.L2);
  if (S.m > S.L1) return { eclipse: false, max: t, alt: S.alt, az: S.az };
  const root = (g, dir) => {                           // dir −1 : avant le maximum, +1 : après
    let a = t, b = t, ga = g(a);
    for (let k = 0; k < 400 && ga < 0; k++) { a = b; b = t + dir * (k + 1) / 60; ga = g(b); }
    if (ga < 0) return null;
    let lo = t + dir * Math.abs(a - t), hi = b;         // g < 0 en lo, g > 0 en hi
    for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2; if (g(mid) < 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  const gP = (tt) => { const s = shadowAt(E, tt, O, lonE); return s.m - s.L1; };
  const gU = (tt) => { const s = shadowAt(E, tt, O, lonE); return s.m - Math.abs(s.L2); };
  const out = { eclipse: true, max: t, mag, alt: S.alt, az: S.az, c1: root(gP, -1), c4: root(gP, +1) };
  if (S.m < Math.abs(S.L2)) {
    out.central = S.L2 < 0 ? "total" : "annular";
    out.c2 = root(gU, -1); out.c3 = root(gU, +1);
    out.duration = (out.c3 - out.c2) * 3600;
  }
  for (const c of ["c1", "c2", "c3", "c4"]) if (out[c] != null) out[c + "alt"] = shadowAt(E, out[c], O, lonE).alt;
  return out;
}

/* ---- UC06 : le modèle plat, à son avantage (règle 2) ----------------------
   Disque azimutal équidistant (pôle Nord au centre, r = (90 − φ)·111,195 km).
   Soleil et Lune « locaux » au-dessus de leurs points sous-astraux RÉELS
   (éphémérides du site, même choix qu'azim : le plat reçoit toutes les
   positions vraies). La Lune, disque à la hauteur Hm, est éclairée par la
   lampe solaire à Hs ; son ombre tombe en C = S + (M − S)·f, f = Hs/(Hs − Hm).
   Le TRACÉ ne dépend que de f : f est ajusté par moindres carrés sur la ligne
   centrale publiée. Puis Hs est ajusté, séparément, sur les hauteurs du
   Soleil publiées le long de la bande. Deux paramètres libres, chacun au
   mieux pour le plat. */
import { OBS } from "../../core/ephemeris.js";
import { makeAE } from "../../core/aeproj.js";
export const AE_K = 111.195;
// epic18 : délègue au moteur commun (carte polaire tournée de 90°, en km), même résultat qu'avant (testé)
const ECL_POLAR = makeAE({ rot: 90 });
export const aeXY = (lat, lon) => { const [x, y] = ECL_POLAR.fwd(lat, lon); return [x * AE_K, y * AE_K]; };
export const aeLL = (x, y) => [90 - Math.hypot(x, y) / AE_K, Math.atan2(y, x) / R];
export function subPoints2027(utH) {
  const jd = OBS.jdFromUTC(2027, 8, 2, 0, 0, 0) + utH / 24;
  const S = OBS.bodyAt("sun", jd, 0, 0, 0), M = OBS.bodyAt("moon", jd, 0, 0, 0);
  return { s: aeXY(S.sub.lat, S.sub.lon), m: aeXY(M.sub.lat, M.sub.lon) };
}
export const flatShadow = (g, f) => [g.s[0] + (g.m[0] - g.s[0]) * f, g.s[1] + (g.m[1] - g.s[1]) * f];
export function flatFit(rows) {
  const pts = rows.filter((r) => r.t !== "Limits").map((r) => ({ r, t: hhmm(r.t), c: aeXY(r.c[0], r.c[1]), g: subPoints2027(hhmm(r.t)) }));
  const cost = (f) => pts.reduce((a, p) => { const c = flatShadow(p.g, f); return a + (c[0] - p.c[0]) ** 2 + (c[1] - p.c[1]) ** 2; }, 0);
  let f = 1.05, best = cost(f);
  for (let x = 1.01; x < 400; x *= 1.01) { const c = cost(x); if (c < best) { best = c; f = x; } }
  for (let x = f * 0.99; x < f * 1.01; x += f * 0.0002) { const c = cost(x); if (c < best) { best = c; f = x; } }
  const resid = pts.map((p) => { const c = flatShadow(p.g, f); return Math.hypot(c[0] - p.c[0], c[1] - p.c[1]); });
  // Hs : hauteurs de la lampe au-dessus de chaque point de la bande contre les hauteurs publiées
  const altErr = (Hs) => pts.reduce((a, p) => a + (Math.atan2(Hs, Math.hypot(p.c[0] - p.g.s[0], p.c[1] - p.g.s[1])) / R - p.r.alt) ** 2, 0);
  let Hs = 100, bh = altErr(Hs);
  for (let h = 100; h <= 50000; h += 10) { const e = altErr(h); if (e < bh) { bh = e; Hs = h; } }
  return { f, Hs, Hm: Hs * (1 - 1 / f), rms: Math.sqrt(best / pts.length), worst: Math.max(...resid), altRms: Math.sqrt(bh / pts.length), pts };
}

/* ---- limites nord/sud de la totalité, CALCULÉES --------------------------
   Pour un instant t : point central C(t), direction de la trajectoire (C(t±1
   min)), puis bisection le long de la perpendiculaire (grand cercle) jusqu'au
   point où le lieu cesse d'être en totalité à son propre maximum. Le test
   « total ici ? » ne cherche que le maximum (quelques itérations). */
function isCentralHere(E, lat, lon) {
  const O = observerGeo(lat, 0);
  let t = E.t0TDT - E.deltaT / 3600;
  for (let k = 0; k < 12; k++) { const s = shadowAt(E, t, O, lon), tau = -(s.u * s.a + s.v * s.b) / (s.a * s.a + s.b * s.b); t += tau; if (Math.abs(tau) < 1e-6) break; }
  const s = shadowAt(E, t, O, lon);
  return s.m < Math.abs(s.L2) && s.alt > -1;
}
const dest = (lat, lon, brg, km) => {                   // point à km le long du grand cercle de relèvement brg
  const d = km / 6371, p1 = lat * R, l1 = lon * R, b = brg * R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  return [p2 / R, (l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2))) / R];
};
const brgOf = (a, b) => { const p1 = a[0] * R, p2 = b[0] * R, dl = (b[1] - a[1]) * R;
  return Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / R; };
export function pathLimits(E, utH) {
  const c = centralPoint(E, utH), a = centralPoint(E, utH - 1 / 60), b = centralPoint(E, utH + 1 / 60);
  if (!c || !a || !b) return null;
  const heading = brgOf([a.lat, a.lon], [b.lat, b.lon]);
  const edge = (side) => {                              // side = −90 (gauche = nord ici) ou +90
    let lo = 0, hi = 250;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2, p = dest(c.lat, c.lon, heading + side, m); if (isCentralHere(E, p[0], p[1])) lo = m; else hi = m; }
    return dest(c.lat, c.lon, heading + side, lo);
  };
  return { c: [c.lat, c.lon], left: edge(-90), right: edge(+90) };
}

/* ---- Séléniélie (2026-10-04) : Soleil et Lune éclipsée ensemble dans le ciel ----
   Éphémérides de Meeus (src/core/ephemeris.js) : Soleil, Lune TOPOCENTRIQUE (la
   parallaxe de ~0,9° est tout le sujet), réfraction astronomique standard
   (refrArcmin). Ombre de la Terre au rayon de Danjon : parallaxe de la Lune
   ramenée au rayon moyen (×0,99834) et agrandie de 1/85, + parallaxe du Soleil
   ∓ son demi-diamètre. Le centre de l'ombre vu de l'observateur = point
   antisolaire déplacé par la MÊME parallaxe que la Lune (l'ombre est à sa
   distance). Horizon : mer au niveau 0, ou abaissé de la dépression d'une
   hauteur h (géométrique sans air, R/(1−k) avec air -- règle 3). */
import { sun as sunEph, moon as moonEph, deltaT, jdFromUTC, topocentric, altaz, refrArcmin } from "../../core/ephemeris.js";
// far : un second observateur au MÊME instant, pour qui la Lune est haute et l'ombre
// paraît venir d'en haut (« du mauvais côté »), le Soleil loin sous son horizon.
const ADELAIDE = { place: "Adelaide", lat: -34.93, lon: 138.60 };
export const SELEN_CASES = {
  brest2028: { y: 2028, m: 12, d: 31, lat: 48.39, lon: -4.49, t0: 16.25, t1: 16.75, place: "Brest", far: ADELAIDE },   // 16:15–16:45 UT
  mpls2014: { y: 2014, m: 10, d: 8, lat: 44.98, lon: -93.27, t0: 12.15, t1: 12.65, place: "Minneapolis", far: ADELAIDE },  // 12:09–12:39 UT
};
const sep2 = (ra1, de1, ra2, de2) => Math.acos(Math.min(1, Math.sin(de1 * R) * Math.sin(de2 * R) + Math.cos(de1 * R) * Math.cos(de2 * R) * Math.cos((ra1 - ra2) * R))) / R;
/** Réfraction (°) d'un point d'altitude vraie h, bornée sous l'horizon où la formule diverge. */
export const refrDeg = (h) => refrArcmin(Math.max(h, -1.9)) / 60;
/** Dépression de l'horizon (°) à h mètres ; avec air : rayon effectif R/(1−k). */
export const dipDeg = (hM, air = true, k = 0.13) => { const Re = 6371000 / (air ? 1 - k : 1); return Math.acos(Re / (Re + hM)) / R; };

export function selenAt(c, utH) {
  const jd = jdFromUTC(c.y, c.m, c.d) + utH / 24, jdTT = jd + deltaT(c.y + (c.m - 0.5) / 12) / 86400;
  const S = sunEph(jdTT), M = moonEph(jdTT);
  const sAA = altaz(S.ra, S.dec, c.lat, c.lon, jd);
  const mT = topocentric(M.ra, M.dec, M.parallax, c.lat, c.lon, jd, 0), mAA = altaz(mT.ra, mT.dec, c.lat, c.lon, jd);
  const mGeo = altaz(M.ra, M.dec, c.lat, c.lon, jd).alt;                    // la Lune vue du CENTRE de la Terre
  const aRa = (S.ra + 180) % 360, aDe = -S.dec;
  const aT = topocentric(aRa, aDe, M.parallax, c.lat, c.lon, jd, 0), aAA = altaz(aT.ra, aT.dec, c.lat, c.lon, jd);
  const piS = 8.794 / 3600 / S.distAU, pM = 0.998340 * M.parallax * (1 + 1 / 85);
  const umbra = pM + piS - S.sd, penumbra = pM + piS + S.sd, sep = sep2(M.ra, M.dec, aRa, aDe);
  const phase = sep < umbra - M.sd ? "total" : sep < umbra + M.sd ? "partial" : sep < penumbra + M.sd ? "penumbral" : "none";
  return {
    jd, sun: { alt: sAA.alt, az: sAA.az, sd: S.sd, ra: S.ra, dec: S.dec, distAU: S.distAU },
    moon: { alt: mAA.alt, altGeo: mGeo, az: mAA.az, sd: M.sd, parallax: M.parallax, distKM: M.distKM, ra: M.ra, dec: M.dec, raT: mT.ra, decT: mT.dec },
    shadow: { alt: aAA.alt, az: aAA.az, umbra, penumbra, raT: aT.ra, decT: aT.dec }, sep, phase, umag: (umbra + M.sd - sep) / (2 * M.sd),
  };
}
/**
 * Où est le centre de l'ombre, vu depuis le centre de la Lune (« de quel côté vient l'ombre ») :
 *  - up : angle depuis le ZÉNITH de l'observateur, positif vers la droite (0 = en haut, ±180 = en bas) ;
 *  - pa : angle de position depuis le NORD CÉLESTE, positif vers l'est (le même pour tous, à la
 *    parallaxe près : l'ombre et la Lune sont à la même distance).
 * Les deux diffèrent de l'angle parallactique, propre à chaque lieu et à chaque instant.
 */
export function shadowSide(s) {
  const x = ((((s.shadow.az - s.moon.az) % 360) + 540) % 360 - 180) * Math.cos(s.moon.alt * R), y = s.shadow.alt - s.moon.alt;
  const dA = (s.shadow.raT - s.moon.raT) * R, d1 = s.moon.decT * R, d2 = s.shadow.decT * R;
  const pa = Math.atan2(Math.sin(dA) * Math.cos(d2), Math.cos(d1) * Math.sin(d2) - Math.sin(d1) * Math.cos(d2) * Math.cos(dA)) / R;
  return { up: Math.atan2(x, y) / R, pa: n360(pa) };
}
/** Bords supérieurs au-dessus de l'horizon (vrai ou réfracté), en degrés au-dessus de l'horizon local. */
export function upperLimbs(s, air = true, hM = 0) {
  const lim = (b) => { const h = b.alt + b.sd; return h + (air ? refrDeg(h) : 0); };
  const hz = -dipDeg(hM, air);
  return { sun: lim(s.sun) - hz, moon: lim(s.moon) - hz };
}
/** Minutes (pas de 15 s) où les deux bords supérieurs sont au-dessus de l'horizon, la Lune dans l'ombre (umbra). */
export function selenWindow(c, air = true, hM = 0) {
  let first = null, last = null, best = -Infinity;
  for (let t = c.t0; t <= c.t1 + 1e-9; t += 1 / 240) {
    const s = selenAt(c, t), u = upperLimbs(s, air, hM), m = Math.min(u.sun, u.moon);
    if (s.phase === "total" || s.phase === "partial") best = Math.max(best, m);
    if (m > 0 && (s.phase === "total" || s.phase === "partial")) { first ??= t; last = t; }
  }
  return { first, last, minutes: first == null ? 0 : (last - first) * 60, best };   // best : la meilleure marge (°), négative si jamais
}
/** Plus petite hauteur (m) qui ouvre la fenêtre sans air (bissection). */
export function heightWithoutAir(c) {
  let lo = 0, hi = 2000;
  if (selenWindow(c, false, 0).first != null) return 0;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (selenWindow(c, false, mid).first != null) hi = mid; else lo = mid; }
  return hi;
}
/**
 * Le bilan, en degrés, à l'instant où les bords supérieurs (sans air) sont à égale
 * hauteur -- la somme de leurs hauteurs y décide de tout :
 *   noAir = −π + δ + s☉ + s☾ ; air = noAir + ρ☉ + ρ☾ ; il faut > 0 (+ 2 × dépression si l'on monte).
 * π : parallaxe de la Lune en hauteur ; δ = h☉ + h☾(géocentrique) : écart de la Lune au
 * point antisolaire, compté vers le haut.
 */
export function selenBudget(c) {
  let tc = c.t0, prev = null;
  for (let t = c.t0; t <= c.t1 + 1e-9; t += 1 / 240) {
    const s = selenAt(c, t), d = (s.sun.alt + s.sun.sd) - (s.moon.alt + s.moon.sd);
    if (prev != null && Math.sign(d) !== Math.sign(prev)) { tc = t; break; }
    prev = d;
  }
  const s = selenAt(c, tc), pi = s.moon.altGeo - s.moon.alt, delta = s.sun.alt + s.moon.altGeo;
  const rhoS = refrDeg(s.sun.alt + s.sun.sd), rhoM = refrDeg(s.moon.alt + s.moon.sd);
  const noAir = -pi + delta + s.sun.sd + s.moon.sd;
  return { t: tc, pi, delta, sdS: s.sun.sd, sdM: s.moon.sd, rhoS, rhoM, noAir, air: noAir + rhoS + rhoM, phase: s.phase };
}
