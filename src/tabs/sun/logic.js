// Logique pure de l'onglet "sun" (Soleil : distance, mouvement, analemme,
// cadran solaire), portée à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L17170-17220 formules, ~L17378-17392
// directions journalières, ~L17614-17626 sunDialPlate, ~L17703 sunTables).
// Voir tasks/epic02/UC06.org.
//
// RÈGLES HÉRITÉES (en-tête legacy "Tabs 6-7 gotchas") :
//  * formules NOAA solcalc "low accuracy" telles quelles (EoT en minutes,
//    déclinaison en radians) -- ne pas les remplacer par un modèle plus
//    précis sans ticket : la page cite la page de dérivation NOAA.
//  * la hauteur du soleil plat est CALIBRÉE PAR LATITUDE pour que
//    l'altitude de midi à l'équinoxe soit exacte (règle 2, steel-man) ;
//    près de l'équateur (cas dégénéré) on calibre au solstice de juin.
//  * les panneaux de mouvement journalier utilisent l'ÉQUINOXE et le soleil
//    MOYEN (delta = 0 câblé dans sunDirG -- généraliser avant de réutiliser
//    pour d'autres dates).
//  * le cadran : soleil FIXE dans l'espace monde (SUN_AZ), c'est la planète
//    qui tourne (angle `the`). sunDialPlate est LA source unique des lignes
//    d'heure ET de l'ombre vécue des mini-cadrans.
import { RAD, DEG } from "../../core/math.js";
import { magLat2r } from "../mag/shared.js";

export const SUN_C = 299792.458; // km/s
export const SUN_AU = 1.495979e8; // km
export const SUN_OBLIQ = 23.44; // deg, déclinaison max utilisée pour "l'altitude minimale" plate

// ---- NOAA solcalc (low-accuracy) --------------------------------------------
/** Angle fractionnaire de l'année (rad) pour le jour N (0..364). */
export function sunGamma(N) {
  return (2 * Math.PI * N) / 365;
}

/** Équation du temps, minutes (NOAA solcalc). */
export function sunEoT(N) {
  const g = sunGamma(N);
  return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
}

/** Déclinaison solaire, radians (NOAA solcalc). */
export function sunDecl(N) {
  const g = sunGamma(N);
  return 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g)
    + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
}

// ---- petits vecteurs ---------------------------------------------------------
export const sunDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sunNrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
export const sunAng = (a, b) => DEG(Math.acos(Math.max(-1, Math.min(1, sunDot(a, b)))));

// ---- globe / disque à une heure d'horloge -----------------------------------
/**
 * Globe : soleil à une HEURE D'HORLOGE fixe (angle horaire = équation du
 * temps + décalage). Renvoie l'altitude (deg) et le vecteur unitaire ciel
 * (E, N, Up) pour que les panneaux projettent comme une caméra.
 */
export function sunGlobeAt(latDeg, N, hoffDeg) {
  const phi = RAD(latDeg), del = sunDecl(N), H = RAD(sunEoT(N) * 0.25 + hoffDeg);
  const U = Math.sin(phi) * Math.sin(del) + Math.cos(phi) * Math.cos(del) * Math.cos(H);
  const Nc = Math.cos(phi) * Math.sin(del) - Math.sin(phi) * Math.cos(del) * Math.cos(H);
  const E = -Math.cos(del) * Math.sin(H); // après-midi -> ouest
  return { alt: DEG(Math.asin(Math.max(-1, Math.min(1, U)))), p: [E, Nc, U] };
}
export const sunGlobeNoon = (latDeg, N) => sunGlobeAt(latDeg, N, 0);

/**
 * Disque plat : soleil à hauteur h au-dessus du cercle subsolaire ;
 * observateur et soleil sur la carte azimutale équidistante (réutilise
 * magLat2r de l'onglet mag : km depuis le pôle).
 */
export function sunFlatGeom(latDeg, N, h, hoffDeg) {
  const ro = magLat2r(latDeg);
  const del = DEG(sunDecl(N)), rs = magLat2r(del);
  const dA = RAD(sunEoT(N) * 0.25 + (hoffDeg || 0));
  const sx = rs * Math.cos(dA) - ro, sy = rs * Math.sin(dA); // observateur en (ro,0), +x = s'éloigne du centre
  const g = Math.hypot(sx, sy);
  const alt = DEG(Math.atan2(h, g)), ca = Math.cos(RAD(alt));
  // repère local sur le disque : nord = vers le centre (−x), est choisi pour que après-midi -> ouest
  const Nc = (-sx / g) * ca, E = (-sy / g) * ca;
  return { alt, g, slant: Math.hypot(g, h), p: [E, Nc, Math.sin(RAD(alt))] };
}

/**
 * Steel-man : hauteur h telle que l'altitude de midi à l'ÉQUINOXE soit
 * exacte à cette latitude. Près de l'équateur (cas dégénéré : le soleil
 * d'équinoxe est au zénith dans les deux modèles) on calibre au solstice de
 * juin. Dans les deux cas le modèle plat obtient un point exact gratuit.
 */
export function sunFlatH(latDeg) {
  const eqN = 79; // ~20 mars
  const dEq = DEG(sunDecl(eqN));
  const roEq = Math.abs(magLat2r(latDeg) - magLat2r(dEq));
  const altEq = 90 - Math.abs(latDeg - dEq);
  if (roEq > 400 && altEq < 88) return { h: roEq * Math.tan(RAD(altEq)), cal: "equinox" };
  const jN = 172, dJ = DEG(sunDecl(jN));
  const roJ = Math.abs(magLat2r(latDeg) - magLat2r(dJ));
  const altJ = 90 - Math.abs(latDeg - dJ);
  return { h: Math.max(200, roJ * Math.tan(RAD(Math.min(88, altJ)))), cal: "June solstice" };
}

/** Altitude minimale du soleil plat : de l'autre côté du disque, minuit du solstice de décembre. */
export function flatMinAlt(latDeg, h) {
  const ro = magLat2r(latDeg), rs = magLat2r(-SUN_OBLIQ);
  return DEG(Math.atan2(h, ro + rs));
}

// ---- Rømer -------------------------------------------------------------------
export const ROMER = { aJ: 5.2, TE: 365.25, TJ: 4332.6, TSYN: 399 };

/** Distance Terre–Jupiter (au) au jour t, orbites circulaires coplanaires. */
export function romerDistAU(t) {
  const thE = (2 * Math.PI * t) / ROMER.TE, thJ = (2 * Math.PI * t) / ROMER.TJ;
  return Math.sqrt(1 + ROMER.aJ * ROMER.aJ - 2 * ROMER.aJ * Math.cos(thE - thJ));
}

/** Temps-lumière Jupiter -> Terre, minutes, au jour t. */
export function romerLightMin(t) {
  return (romerDistAU(t) * SUN_AU) / SUN_C / 60;
}

/**
 * Courbe modèle sur une période synodique centrée sur `day` (n+1 points),
 * plus le balayage min/max et l'au qui s'en déduit. AUCUN point "observé"
 * n'est fabriqué : courbe de modèle seule, chiffres historiques dans le
 * texte (règle legacy : jamais de données inventées).
 */
export function romerCurve(day, n = 160) {
  const T = ROMER.TSYN, t0 = day - T / 2, pts = [];
  let mMin = Infinity, mMax = -Infinity;
  for (let i = 0; i <= n; i++) {
    const t = t0 + (T * i) / n, m = romerLightMin(t);
    mMin = Math.min(mMin, m); mMax = Math.max(mMax, m);
    pts.push({ t, m });
  }
  const swing = mMax - mMin;
  return { pts, mMin, mMax, swing, auMkm: (SUN_C * swing * 60) / 2 / 1e6 };
}

// ---- analemme : projection ciel caméra de niveau -----------------------------
/**
 * Points de l'analemme d'une année, projetés en degrés-ciel dans le repère
 * d'une caméra DE NIVEAU visant le soleil moyen de l'année : x = horizontal
 * ciel, y = vertical ciel. ÉCHELLE x/y ÉGALE obligatoire à l'affichage,
 * sinon le basculement parallactique est déformé (legacy : ne pas régresser
 * vers un tracé alt/az).
 * @returns {{ pts: {xy:[number,number], alt:number, N:number}[], m:number[], V:number[], Hax:number[], aMin:number, aMax:number, below:number, proj:function }}
 */
export function analemmaPoints(model, latDeg, hourOff, hFlat) {
  const hoff = hourOff * 15;
  const raw = []; let aMin = 90, aMax = -90, below = 0; const mSum = [0, 0, 0];
  for (let N = 0; N < 365; N++) {
    const r = model === "globe" ? sunGlobeAt(latDeg, N, hoff) : sunFlatGeom(latDeg, N, hFlat, hoff);
    raw.push({ p: r.p, alt: r.alt, N });
    aMin = Math.min(aMin, r.alt); aMax = Math.max(aMax, r.alt);
    if (r.alt < 0) below++;
    mSum[0] += r.p[0]; mSum[1] += r.p[1]; mSum[2] += r.p[2];
  }
  const m = sunNrm(mSum);
  let vv = [-m[0] * m[2], -m[1] * m[2], 1 - m[2] * m[2]]; // zénith moins sa composante selon m
  let vl = Math.hypot(vv[0], vv[1], vv[2]);
  if (vl < 1e-6) { vv = [-m[0] * m[1], 1 - m[1] * m[1], -m[2] * m[1]]; vl = Math.hypot(vv[0], vv[1], vv[2]); } // soleil ~ au zénith
  const V = [vv[0] / vl, vv[1] / vl, vv[2] / vl];
  const Hax = sunNrm([V[1] * m[2] - V[2] * m[1], V[2] * m[0] - V[0] * m[2], V[0] * m[1] - V[1] * m[0]]);
  const proj = (p) => [DEG(sunDot(p, Hax)), DEG(sunDot(p, V))];
  const pts = raw.map((o) => ({ xy: proj(o.p), alt: o.alt, N: o.N }));
  return { pts, m, V, Hax, aMin, aMax, below, proj };
}

/**
 * Axes principaux (PCA) du nuage de points projeté : étendue ±2σ
 * (4·sqrt(λ)) des deux axes, en degrés -- la convention du harnais de test
 * legacy, dont l'en-tête cite l'invariant de forme globe ~64.46 × ~8.39
 * quels que soient φ et l'heure.
 */
export function analemmaShape(pts) {
  const n = pts.length; let mx = 0, my = 0;
  for (const p of pts) { mx += p.xy[0]; my += p.xy[1]; }
  mx /= n; my /= n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) { const dx = p.xy[0] - mx, dy = p.xy[1] - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  sxx /= n; sxy /= n; syy /= n;
  const tr = sxx + syy, det = sxx * syy - sxy * sxy;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
  return { major: 4 * Math.sqrt(Math.max(0, l1)), minor: 4 * Math.sqrt(Math.max(0, l2)) };
}

// ---- mouvement journalier (équinoxe, soleil moyen) ---------------------------
/** Globe, delta = 0 câblé : direction (E, N, Up) du soleil à l'angle horaire Hdeg. */
export function sunDirG(lat, Hdeg) {
  const phi = RAD(lat), H = RAD(Hdeg);
  return [-Math.sin(H), -Math.sin(phi) * Math.cos(H), Math.cos(phi) * Math.cos(H)];
}

/** Disque plat : soleil à hauteur h sur l'anneau subsolaire (10 000 km), angle Adeg autour du disque. */
export function sunDirF(lat, h, Adeg) {
  const ro = magLat2r(lat), rs = 10000, A = RAD(Adeg);
  const sx = rs * Math.cos(A) - ro, sy = rs * Math.sin(A);
  const g = Math.hypot(sx, sy), sl = Math.hypot(g, h);
  return [-sy / sl, -sx / sl, h / sl]; // (E, N, Up) ; nord = vers le centre
}

/**
 * Vitesses angulaires apparentes du soleil plat sur une journée : rotation
 * uniforme vue par l'observateur A (lat), et ce que mesure l'observateur B
 * (10°S, JAMAIS sur l'anneau subsolaire lui-même) quand le rythme de la
 * piste est réajusté pour rendre la vitesse de A constante.
 */
export function sunSpeedCurves(lat, hFlat, NG = 720) {
  const latB = -10, dA = 360 / NG;
  const dirsA = [], dirsB = [];
  for (let i = 0; i <= NG; i++) {
    dirsA.push(sunDirF(lat, hFlat, -180 + i * dA));
    dirsB.push(sunDirF(latB, hFlat, -180 + i * dA));
  }
  const stepA = [], stepB = [];
  for (let i = 0; i < NG; i++) { stepA.push(sunAng(dirsA[i], dirsA[i + 1])); stepB.push(sunAng(dirsB[i], dirsB[i + 1])); }
  const totA = stepA.reduce((a, b) => a + b, 0);
  const dtU = 24 / NG;
  const spUA = stepA.map((s) => s / dtU);
  const dtT = stepA.map((s) => (24 * s) / totA);
  const spTB = stepB.map((s, i) => s / Math.max(dtT[i], 1e-6));
  const tU = [], tT = []; let acc = -12;
  for (let i = 0; i < NG; i++) tU.push(-12 + (i + 0.5) * dtU);
  for (let i = 0; i < NG; i++) { tT.push(acc + dtT[i] / 2); acc += dtT[i]; }
  return {
    tU, spUA, tT, spTB, latB,
    uLo: Math.min(...spUA), uHi: Math.max(...spUA), bLo: Math.min(...spTB), bHi: Math.max(...spTB),
  };
}

// ---- cadran solaire ----------------------------------------------------------
/** Yaw caméra par défaut et azimut monde du soleil fixe (legacy SUND). */
export const SUND_YAW = -0.55;
export const SUN_AZ = SUND_YAW + 2.42;
export const SUND_STATIONS = [65, 35, 0, -30];
export const SUN_DIR = [Math.cos(SUN_AZ), 0, Math.sin(SUN_AZ)]; // soleil d'équinoxe fixe, à gauche de l'écran

/** Heure solaire locale (h depuis midi, dans ]-12, 12]) pour l'angle de rotation planétaire `the`. */
export function sunDialHour(the) {
  let hh = (DEG(the - SUN_AZ) / 15) % 24;
  if (hh > 12) hh -= 24; if (hh < -12) hh += 24;
  return hh;
}

/**
 * Ombre d'un gnomon parallèle à l'axe sur la plaque horizontale locale, en
 * composantes (nord, est), longueur de gnomon 1. SOURCE UNIQUE des mini
 * cadrans : lignes d'heure = cette fonction évaluée aux heures rondes, ombre
 * vécue = cette fonction à l'instant courant ; les faces et le globe ne
 * peuvent donc pas se contredire.
 */
export function sunDialPlate(lat, the) {
  const l = RAD(lat), ct = Math.cos(the), st = Math.sin(the);
  const n = [Math.cos(l) * ct, Math.sin(l), Math.cos(l) * st];
  const su = sunDot(SUN_DIR, n);
  if (su <= 0.03) return { lit: false };
  const g = lat >= 0 ? [0, 1, 0] : [0, -1, 0];
  const t = (g[1] * n[1]) / su;
  const d = [g[0] - t * SUN_DIR[0], g[1] - t * SUN_DIR[1], g[2] - t * SUN_DIR[2]];
  const e1 = [-Math.sin(l) * ct, Math.cos(l), -Math.sin(l) * st], e2 = [-st, 0, ct];
  return { lit: true, nc: sunDot(d, e1), ec: sunDot(d, e2) };
}

/** Loi du cadran horizontal : angle de la ligne d'heure (deg) pour l'angle horaire H (deg). */
export function horizontalDialAngle(latDeg, Hdeg) {
  return DEG(Math.atan(Math.sin(RAD(Math.abs(latDeg))) * Math.tan(RAD(Hdeg))));
}

// ---- tableaux ----------------------------------------------------------------
export const SUN_DATES = [["Equinox (Mar 20)", 79], ["June solstice", 172], ["Dec solstice", 355]];

/** Lignes du tableau des altitudes de midi + ratio de distance midi/soir en juin. */
export function sunTableRows(lat) {
  const hf = sunFlatH(lat);
  const rows = SUN_DATES.map(([name, N]) => {
    const g = sunGlobeNoon(lat, N), f = sunFlatGeom(lat, N, hf.h);
    return { name, N, globe: g.alt, flat: f.alt, err: f.alt - g.alt };
  });
  const f6 = sunFlatGeom(lat, 172, hf.h);
  const evenSlant = Math.hypot(Math.hypot(magLat2r(lat), magLat2r(DEG(sunDecl(172)))), hf.h);
  return { hf, rows, ratio: evenSlant / f6.slant, june: { globe: sunGlobeNoon(lat, 172).alt, flat: f6.alt }, minAlt: flatMinAlt(lat, hf.h) };
}
