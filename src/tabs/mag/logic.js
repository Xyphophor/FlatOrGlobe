// Logique pure de l'onglet mag (magnétisme et boussole), portée à
// l'identique du legacy (flat-or-globe-2.20.0.html, ~L16636-17097). Séparée
// de index.js pour rester testable sous node:test sans DOM/canvas (voir
// tasks/epic02/UC05.org).
//
// LE TEST "SANS ÉCHELLE" DE LA PAGE : tan I = 2 tan λ et B_pole = 2·B_eq
// sont des propriétés d'un dipôle centré dans une SPHÈRE, quelle que soit
// sa taille -- ce tab ne dépend d'aucun rayon R, contrairement aux quatre
// autres. Les deux dispositions plates sont steel-mannées PAR
// CALIBRATION, chacune avec son unique paramètre libre. ① : la profondeur
// de l'aimant, choisie pour que le cercle d'inclinaison nulle tombe
// exactement sur l'équateur magnétique observé (10 000 km du pôle, soit
// magLat2r(0)). ② : la profondeur d'enfouissement d2, ajustée par moindres
// carrés sur les inclinaisons mesurées des dix villes (MAGCITIES) --
// aucune profondeur ne peut poser son équateur à 10 000 km (voir
// flat2Zero). Les deux sont normalisées à B = 30 μT à 10 000 km. NE PAS
// CHANGER ces règles de calibration sans revérifier logic.test.js.
//
// 2026-09-30, CHARGE NETTE NULLE (∇·B = 0). Jusqu'ici ② était un puits −1
// au centre et un anneau de force libre alpha2 au bord, alpha2 réglé pour
// poser l'équateur à 10 000 km : alpha2 = 4,18, donc une charge magnétique
// nette de +3,18 -- un monopôle, ce qu'interdit ∇·B = 0 (signalé par un
// physicien, échange sur X). Le récit plat lui-même (« le centre est le
// pôle nord, le bord est le pôle sud ») décrit un aimant, dont les deux
// pôles ont la même force : l'anneau porte donc exactement +1. Il ne reste
// qu'un paramètre libre, d2, et il ne suffit plus à poser l'équateur.
import { RAD, DEG } from "../../core/math.js";
import { MAG_RKM, magLat2r } from "./shared.js";

export { MAG_RKM };

export const MAG_B0 = 30; // μT à l'équateur magnétique (terme dipolaire IGRF, arrondi)
// flat ①: profondeur de l'aimant -- CALIBRÉE : un dipôle vertical inverse B_z à r = √2·profondeur,
// donc profondeur = 10 000/√2 km met ce renversement exactement sur l'équateur magnétique réel.
export const MAG_D1 = 10000 / Math.SQRT2;

// Latitudes magnétiques (repère dipolaire, pôle 80.7°N 72.7°W approx.) et valeurs IGRF arrondies.
export const MAGCITIES = [
  { n: "Resolute (Canada)", lat: 74.7, mlat: 82.5, Io: 88, Bo: 57 },
  { n: "Reykjavík", lat: 64.1, mlat: 68.8, Io: 76, Bo: 52 },
  { n: "Paris", lat: 48.9, mlat: 50.4, Io: 64, Bo: 47 },
  { n: "Mexico City", lat: 19.4, mlat: 27.7, Io: 47, Bo: 40 },
  { n: "Singapore", lat: 1.4, mlat: -7.9, Io: -16, Bo: 41 },
  { n: "São Paulo *", lat: -23.6, mlat: -15.2, Io: -40, Bo: 23 },
  { n: "Cape Town *", lat: -33.9, mlat: -33.6, Io: -66, Bo: 26 },
  { n: "Melbourne", lat: -37.8, mlat: -44.9, Io: -69, Bo: 60 },
  { n: "Dunedin (NZ)", lat: -45.9, mlat: -49.4, Io: -72, Bo: 58 },
  { n: "South magnetic pole", lat: -64.1, mlat: -71.8, Io: -90, Bo: 67 },
];

/** Globe : champ dipolaire centré. tan I = 2 tan λ -- le test sans échelle. */
export function globeMag(lat) {
  const l = RAD(lat);
  const I = DEG(Math.atan2(2 * Math.sin(l), Math.cos(l)));
  const B = MAG_B0 * Math.sqrt(1 + 3 * Math.sin(l) * Math.sin(l));
  return { I, B, H: B * Math.cos(RAD(I)), Zd: B * Math.sin(RAD(I)) };
}

// flat ①: aimant droit sous le centre, moment pointant vers le bas, profondeur MAG_D1.
// Observateur en surface à distance horizontale r ; +z vers le haut ; composantes NON mises à l'échelle.
function flat1Raw(r, d = MAG_D1) {
  const R = Math.hypot(r, d), R3 = R * R * R;
  const rx = r / R, rz = d / R; // vecteur unitaire aimant -> observateur
  const mr = -rz; // m̂·r̂ avec m̂ = (0, -1)
  const Bx = (3 * mr * rx) / R3; // +x = s'éloignant du centre
  const Bz = (3 * mr * rz + 1) / R3; // +z = vers le haut
  return { H: -Bx, Zd: -Bz }; // H > 0 = vers le centre ("nord carte") ; Zd > 0 = vers le bas
}

// flat ②: puits de champ au centre ("pôle nord" : B entre dans le sol là, comme en Arctique)
// et un anneau source au bord, de force totale ÉGALE (+1 : charge nette nulle, ∇·B = 0),
// tous deux enfouis à la profondeur d2.
export function flat2RawZ(r, z, d2) {
  let Bx = 0, Bz = 0;
  { // charge centrale -1 en (0, -d2)
    const dx = r, dz = z + d2, L = Math.hypot(dx, dz), L3 = L * L * L;
    Bx += -dx / L3; Bz += -dz / L3;
  }
  const N = 72, qs = 1 / N;
  for (let i = 0; i < N; i++) {
    const a = (2 * Math.PI * i) / N;
    const sx = MAG_RKM * Math.cos(a), sy = MAG_RKM * Math.sin(a);
    const dx = r - sx, dy = -sy, dz = z + d2;
    const L = Math.hypot(dx, dy, dz), L3 = L * L * L;
    Bx += (qs * dx) / L3; Bz += (qs * dz) / L3; // By s'annule sur le plan méridien par symétrie
  }
  return { Bx, Bz };
}

function flat2Raw(r, d2) {
  const b = flat2RawZ(r, 0, d2);
  return { H: -b.Bx, Zd: -b.Bz };
}

const incl = (b) => DEG(Math.atan2(b.Zd, Math.abs(b.H)));

/** Recherche 1D par section dorée (fonction unimodale sur [a, b]). */
export function golden(f, a, b, tol) {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a), d = a + g * (b - a), fc = f(c), fd = f(d);
  while (b - a > tol) {
    if (fc < fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = f(c); }
    else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = f(d); }
  }
  return (a + b) / 2;
}

/**
 * Meilleure profondeur d2 de ② (km) sur des points { r, I } : moindres
 * carrés sur I, balayage de 100 m à 40 000 km puis section dorée.
 * `cost` optionnel remplace l'erreur quadratique moyenne (epic12 s'en sert
 * pour pondérer les hémisphères).
 */
export function fitFlat2Depth(pts, cost) {
  cost ??= (d2) => Math.sqrt(pts.reduce((s, o) => s + (o.I - incl(flat2Raw(Math.min(o.r, MAG_RKM - 1), d2))) ** 2, 0) / pts.length);
  let best = { d2: 100, e: Infinity };
  for (let d2 = 100; d2 <= 40000; d2 += d2 < 5000 ? 100 : 500) { const e = cost(d2); if (e < best.e) best = { d2, e }; }
  const d2 = golden(cost, Math.max(10, best.d2 - 500), best.d2 + 500, 1);
  return { d2, rms: cost(d2) };
}

/** Rayon (km) du cercle d'inclinaison nulle de ② pour une profondeur d2 (null s'il n'y en a pas sur le disque). */
export function flat2Zero(d2) {
  let lo = null;
  for (let r = 100; r < MAG_RKM - 1; r += 100) if (flat2Raw(r, d2).Zd <= 0) { lo = r; break; }
  if (lo === null) return null;
  let a = lo - 100, b = lo;
  while (b - a > 1) { const m = (a + b) / 2; flat2Raw(m, d2).Zd > 0 ? (a = m) : (b = m); }
  return (a + b) / 2;
}

/**
 * Calibration (magCalibrate() du legacy, IIFE exécutée une fois). ① :
 * profondeur fixée (MAG_D1) par l'équateur. ② : d2 ajusté sur les
 * inclinaisons des dix villes. Puis k1/k2 tels que |B|(10 000 km) = MAG_B0
 * dans les deux dispositions plates. C'est LA calibration steel-man de cet
 * onglet (voir tasks/epic02/UC05.org, tasks/epic12/UC05.org) : chaque
 * modèle plat dépense son unique paramètre libre en sa faveur, tout le
 * reste de la courbe est une prédiction forcée.
 */
function calibrate() {
  const d2 = Math.round(fitFlat2Depth(MAGCITIES.map((c) => ({ r: magLat2r(c.mlat), I: c.Io }))).d2);
  const b1 = flat1Raw(10000);
  const b2 = flat2Raw(10000, d2);
  const k1 = MAG_B0 / Math.hypot(b1.H, b1.Zd);
  const k2 = MAG_B0 / Math.hypot(b2.H, b2.Zd);
  return { d2, k1, k2 };
}

/** Constantes de calibration, calculées une fois au chargement du module (pur, déterministe). */
export const MAG_CAL = calibrate();
/** flat ②: profondeur d'enfouissement du pôle central et de l'anneau du bord, km (calibrée). */
export const MAG_D2 = MAG_CAL.d2;

/** Plat, disposition 1 (aimant sous le centre) ou 2 (pôle centre + anneau au bord). */
export function flatMag(ver, rkm) {
  const r = Math.max(1, Math.min(rkm, MAG_RKM - 1));
  const raw = ver === 1 ? flat1Raw(r) : flat2Raw(r, MAG_D2);
  const k = ver === 1 ? MAG_CAL.k1 : MAG_CAL.k2;
  const H = raw.H * k, Zd = raw.Zd * k;
  // l'inclinaison est l'angle de B sous l'horizontale, dans [-90,+90] ; H garde son signe
  // (juste à l'intérieur de l'anneau du bord en disposition 2, la partie horizontale s'inverse)
  return { H, Zd, I: incl({ H, Zd }), B: Math.hypot(H, Zd) };
}

let _trace2Cache = null;
/**
 * Trace numérique des lignes de champ de flat ② (magTrace2() du legacy),
 * EN ARRIÈRE depuis le puits central jusqu'à l'anneau. Charge nette nulle :
 * tout le flux de l'anneau aboutit au puits. Géométrie fixe (ne dépend que de la calibration) -> mémoïsée.
 */
export function magTrace2() {
  if (_trace2Cache) return _trace2Cache;
  const out = [];
  // Angles de départ (legacy : 18/45/75°). Avec la charge nette nulle, la
  // ligne à 75° monte à ~35 000 km et sortirait du cadre par le haut, où
  // elle se lirait comme une flèche (legacy v76) : on s'arrête à 54° (~10 400 km).
  for (const ang of [20, 38, 54]) {
    const a = RAD(ang);
    let r = 650 * Math.cos(a), z = -MAG_D2 + 650 * Math.sin(a);
    const pts = [[r, z]];
    for (let i = 0; i < 6000; i++) {
      const b = flat2RawZ(r, z, MAG_D2);
      const m = Math.hypot(b.Bx, b.Bz);
      if (m < 1e-15) break;
      r -= (b.Bx / m) * 55;
      z -= (b.Bz / m) * 55; // avance contre B : puits -> source
      pts.push([r, z]);
      const dRing = Math.hypot(r - MAG_RKM, z + MAG_D2);
      if (dRing < 550) break; // atteint l'anneau du bord
      if (r < 0 || r > 60000 || z > 60000 || z < -MAG_D2 - 7000) break;
    }
    out.push(pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1));
  }
  _trace2Cache = out;
  return out;
}

/**
 * Forme du champ d'une disposition plate aux paramètres libres donnés --
 * pour l'ajustement « à armes égales » d'epic12 (obs-logic.js). ver 1 :
 * { d } profondeur de l'aimant ; ver 2 : { d2 } profondeur d'enfouissement.
 * I en degrés ; B en unités brutes (l'échelle k reste libre, elle n'agit pas sur I).
 */
export function flatShape(ver, rkm, p) {
  const r = Math.max(1, Math.min(rkm, MAG_RKM - 1));
  const raw = ver === 1 ? flat1Raw(r, p.d) : flat2Raw(r, p.d2);
  return { I: incl(raw), B: Math.hypot(raw.H, raw.Zd) };
}
