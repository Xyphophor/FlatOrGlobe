// Logique pure de l'onglet gps, portée à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L18052-18292 : `gpsSat`, `gpsElev`,
// `drawGpsSky`, `drawGpsTri`, `drawGpsRange`). Séparée de index.js pour
// rester testable sous node:test sans DOM/canvas (voir tasks/epic02/UC08.org).
//
// L'onglet le plus technique du groupe 3D legacy : constellation (RAAN
// k×60°, inclinaison 55°), filtre de visibilité el > 5°, boîte de Kepler
// CALCULÉE (jamais citée en dur), et la géométrie exacte de la
// trilatération à trois sphères de portée (y compris son second point,
// rejeté par réflexion à travers le plan des trois satellites -- une
// identité géométrique, pas une approximation : voir `reflectAcrossPlane`).
import { DEG, RAD } from "../../core/math.js";
import { norm3, addS } from "../../core/camera3d.js";
import {
  EARTH_R_KM,
  GPS_A_KM,
  GPS_INCLINATION_DEG,
  GPS_PLANE_COUNT,
  GPS_SLOTS_PER_PLANE,
  GPS_EL_MASK_DEG,
  GPS_TRI_EL_MASK_DEG,
  GM_EARTH_KM3_S2,
  C_KM_S,
} from "../../data/orbits/gps.js";

/** Rayon orbital en rayons terrestres (legacy: `GPS_A = 4.17`, ici calculé). */
export const GPS_A_RE = GPS_A_KM / EARTH_R_KM;

const sub3 = (a, b) => addS(a, b, 1, -1);
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * Position du satellite du plan k (RAAN = k × 360°/GPS_PLANE_COUNT), créneau
 * m, à la phase t (radians) -- identique à `gpsSat` du legacy. Retour en
 * rayons terrestres, y = axe polaire (même convention que le reste de la
 * scène GPS et de `magRot`/`camera3d.js`).
 */
export function satPosition(k, m, t) {
  const O = RAD((k * 360) / GPS_PLANE_COUNT);
  const inc = RAD(GPS_INCLINATION_DEG);
  const a = [Math.cos(O), 0, Math.sin(O)];
  const b = [-Math.sin(O) * Math.cos(inc), Math.sin(inc), Math.cos(O) * Math.cos(inc)];
  const slotStep = (2 * Math.PI) / GPS_SLOTS_PER_PLANE;
  // 0.26 rad : décalage empirique entre plans, porté verbatim du legacy
  // (`gpsSat`) pour éviter que les créneaux de deux plans ne s'alignent.
  const th = t + m * slotStep + k * 0.26;
  return [0, 1, 2].map((i) => GPS_A_RE * (a[i] * Math.cos(th) + b[i] * Math.sin(th)));
}

/** Vecteur unitaire du récepteur à latitude φ (longitude fixe, comme le legacy : pas de contrôle de longitude). */
export function observerVector(latDeg) {
  const l = RAD(latDeg);
  return [Math.cos(l), Math.sin(l), 0];
}

/** Élévation (degrés) et portée (rayons terrestres) du satellite S vu depuis le récepteur P -- identique à `gpsElev`. */
export function elevationAndRange(P, S) {
  const d = sub3(S, P);
  const L = Math.hypot(d[0], d[1], d[2]);
  const elDeg = DEG(Math.asin(dot3(d, P) / L));
  return { elDeg, range: L };
}

export const isVisible = (elDeg, maskDeg = GPS_EL_MASK_DEG) => elDeg > maskDeg;

/** Les 24 satellites (6 plans x 4 créneaux) avec élévation/portée/visibilité pour un récepteur et un instant donnés. */
export function allSatellites(latDeg, t, maskDeg = GPS_EL_MASK_DEG) {
  const P = observerVector(latDeg);
  const sats = [];
  for (let k = 0; k < GPS_PLANE_COUNT; k++) {
    for (let m = 0; m < GPS_SLOTS_PER_PLANE; m++) {
      const S = satPosition(k, m, t);
      const { elDeg, range } = elevationAndRange(P, S);
      sats.push({ k, m, S, elDeg, range, visible: isVisible(elDeg, maskDeg) });
    }
  }
  return sats;
}

/** Résumé "en direct" utilisé par le panneau de la constellation et l'expérience 8 (legacy: `GPS._view`). */
export function visibilitySummary(latDeg, t, maskDeg = GPS_EL_MASK_DEG) {
  const sats = allSatellites(latDeg, t, maskDeg).filter((s) => s.visible);
  const ranges = sats.map((s) => s.range * EARTH_R_KM);
  return {
    count: sats.length,
    rangeMinKm: ranges.length ? Math.min(...ranges) : null,
    rangeMaxKm: ranges.length ? Math.max(...ranges) : null,
  };
}

// ---- Kepler box (T = 2π√(a³/GM)), calculée -- jamais citée en dur ----
export function keplerPeriodSeconds(aKm = GPS_A_KM, GM = GM_EARTH_KM3_S2) {
  return 2 * Math.PI * Math.sqrt(aKm ** 3 / GM);
}

/** Formate une durée en secondes en "H h MM min", comme la boîte de Kepler et les lignes de visibilité du legacy. */
export function formatHoursMinutes(totalSeconds) {
  const totalMin = totalSeconds / 60;
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin - h * 60);
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export function orbitalSpeedKmS(aKm = GPS_A_KM, GM = GM_EARTH_KM3_S2) {
  return Math.sqrt(GM / aKm);
}

/**
 * Angle au centre maximal (degrés) auquel un satellite à distance a reste
 * au-dessus du masque d'élévation elMaskDeg, vu depuis la surface (rayon
 * R) -- géométrie classique de visibilité satellite (angle nadir η puis
 * γ = 90° − el − η). À el = 0 ceci redonne exactement arccos(R/a), la
 * formule citée en toutes lettres dans le texte du legacy (76.12°).
 */
export function maxCentralAngleDeg(elMaskDeg, R = EARTH_R_KM, a = GPS_A_KM) {
  const nadir = Math.asin((R / a) * Math.cos(RAD(elMaskDeg)));
  return 90 - elMaskDeg - DEG(nadir);
}

/** Durée maximale de visibilité continue d'un satellite au-dessus du masque elMaskDeg (secondes). */
export function maxVisibleDurationSeconds(elMaskDeg, R = EARTH_R_KM, a = GPS_A_KM, GM = GM_EARTH_KM3_S2) {
  return ((2 * maxCentralAngleDeg(elMaskDeg, R, a)) / 360) * keplerPeriodSeconds(a, GM);
}

/** Fenêtre de pseudo-distance : recouvrement (satellite au zénith) et à l'horizon vrai (el = 0). */
export function rangeWindowKm(R = EARTH_R_KM, a = GPS_A_KM) {
  return { minKm: a - R, maxKm: Math.sqrt(a * a - R * R) };
}

// ---- Ledger relativiste (+38 µs/jour) : décalage gravitationnel bleu moins dilatation de vitesse ----
export function gravitationalShiftMicrosPerDay(R = EARTH_R_KM, a = GPS_A_KM, GM = GM_EARTH_KM3_S2, c = C_KM_S) {
  const dPhi = GM * (1 / R - 1 / a); // km^2/s^2, potentiel plus haut = horloge plus rapide
  return (dPhi / (c * c)) * 86400 * 1e6; // s/jour -> µs/jour
}
export function velocityDilationMicrosPerDay(v = orbitalSpeedKmS(), c = C_KM_S) {
  return ((v * v) / (2 * c * c)) * 86400 * 1e6;
}
export function netRelativisticOffsetMicrosPerDay(R = EARTH_R_KM, a = GPS_A_KM, GM = GM_EARTH_KM3_S2, c = C_KM_S) {
  return gravitationalShiftMicrosPerDay(R, a, GM, c) - velocityDilationMicrosPerDay(orbitalSpeedKmS(a, GM), c);
}

// ---- Sélection des 3 satellites de la figure de trilatération (drawGpsTri) ----
export function pickTriSatellites(latDeg, t, maskDeg = GPS_TRI_EL_MASK_DEG) {
  const P = observerVector(latDeg);
  const candidates = [];
  for (let k = 0; k < GPS_PLANE_COUNT; k++) {
    for (let m = 0; m < GPS_SLOTS_PER_PLANE; m++) {
      const S = satPosition(k, m, t);
      const { elDeg, range } = elevationAndRange(P, S);
      if (elDeg > maskDeg) candidates.push({ S, r: range, az: Math.atan2(S[2] - P[2], S[1] - P[1]) });
    }
  }
  candidates.sort((x, y) => x.az - y.az);
  if (candidates.length < 3) return [];
  const n = candidates.length;
  return [candidates[0], candidates[Math.floor(n / 3)], candidates[Math.floor((2 * n) / 3)]];
}

/**
 * Réflexion du point P à travers le plan des trois centres S1,S2,S3.
 * Identité géométrique (pas une approximation) : tout point DU plan est
 * fixe par la réflexion, donc S1,S2,S3 gardent leurs distances à P
 * inchangées vers son image -- le miroir satisfait donc EXACTEMENT les
 * trois mêmes équations de portée que P. C'est la 2e solution de
 * trilatération que le legacy rejette ("in deep space, rejected").
 */
export function reflectAcrossPlane(P, S1, S2, S3) {
  const n = norm3(cross3(sub3(S2, S1), sub3(S3, S1)));
  const h = dot3(sub3(P, S1), n);
  return addS(P, n, 1, -2 * h);
}

/** Vérifie qu'un point satisfait les trois équations de portée aux tolérances données (legacy: "verified... to machine precision"). */
export function verifyTriplePoint(point, picks, eps = 1e-9) {
  return picks.every(({ S, r }) => Math.abs(dist3(point, S) - r) < eps);
}

// ---- Cercle d'intersection de deux sphères de portée (drawGpsTri, cercles violets) ----
export function sphereIntersectionCircle(A, ra, B, rb) {
  const d3v = sub3(B, A);
  const d = Math.hypot(d3v[0], d3v[1], d3v[2]);
  const u = d3v.map((v) => v / d);
  const t = (d * d + ra * ra - rb * rb) / (2 * d);
  const rc = Math.sqrt(Math.max(0, ra * ra - t * t));
  const C = addS(A, u, 1, t);
  let v = [-u[1], u[0], 0];
  let vl = Math.hypot(v[0], v[1], v[2]);
  if (vl < 1e-6) {
    v = [0, -u[2], u[1]];
    vl = Math.hypot(v[0], v[1], v[2]);
  }
  v = v.map((x) => x / vl);
  const w = cross3(u, v);
  return { center: C, radius: rc, v, w };
}

/** Point à l'angle theta sur un cercle {center, radius, v, w} (base orthonormée du plan du cercle). */
export function circlePoint({ center, radius, v, w }, theta) {
  return addS(addS(center, v, 1, radius * Math.cos(theta)), w, 1, radius * Math.sin(theta));
}

// ---- Coquille filaire d'une sphère de portée (drawGps.gpsShell) : anneaux de latitude + méridiens ----
// PIÈGE DOCUMENTÉ (legacy header, tasks/epic02/UC08.org) : ne pas remplacer
// par de simples cercles de silhouette -- essayé et rejeté, lu comme des
// arcs égarés. La géométrie brute (ici, pure et testée) reste : anneaux +
// méridiens ; c'est le dessin (alpha par profondeur) qui donne le volume,
// voir index.js.
export function shellRings(center, r, { latStepDeg = 30, segments = 72 } = {}) {
  const rings = [];
  for (let la = -60; la <= 60; la += latStepDeg) {
    const rr = Math.cos(RAD(la));
    const y = Math.sin(RAD(la));
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const th = (2 * Math.PI * i) / segments;
      pts.push([center[0] + r * rr * Math.cos(th), center[1] + r * y, center[2] + r * rr * Math.sin(th)]);
    }
    rings.push(pts);
  }
  return rings;
}
export function shellMeridians(center, r, { lonStepDeg = 45, segments = 72 } = {}) {
  const meridians = [];
  for (let lo = 0; lo < 180; lo += lonStepDeg) {
    const L = RAD(lo);
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const th = (2 * Math.PI * i) / segments;
      pts.push([center[0] + r * Math.cos(th) * Math.cos(L), center[1] + r * Math.sin(th), center[2] + r * Math.cos(th) * Math.sin(L)]);
    }
    meridians.push(pts);
  }
  return meridians;
}
