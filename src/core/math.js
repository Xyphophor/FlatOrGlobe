// Géométrie partagée sphère/plan, portée à l'identique du legacy
// (flat-or-globe-2.20.0.html). Ne pas "corriger" une formule ici sans
// ticket dédié -- ces expressions ont chacune un historique de bug
// documenté dans CLAUDE.md / l'en-tête du fichier legacy.

export const DEG = (r) => (r * 180) / Math.PI;
export const RAD = (d) => (d * Math.PI) / 180;

/** Rayon effectif de réfraction : R_eff = R/(1-k), appliqué au globe seul. */
export function effectiveRadius(R, k) {
  return k > 0 && k < 1 ? R / (1 - k) : R;
}

/** Distance à l'horizon depuis un œil à hauteur e au-dessus d'une sphère de rayon R. */
export function horizonDist(R, e) {
  return R * Math.acos(R / (R + e));
}

/**
 * Hauteur cachée sur la cible lointaine, au-delà de l'horizon de l'œil.
 * H == 0 tant que d <= d0 (horizon depuis l'œil) -- pas de valeur négative.
 * Distincte de la "chute sous la tangente" (voir dropBelowTangent) : les deux
 * ne coïncident que si e == 0. Voir CLAUDE.md "THE THREE QUANTITIES".
 */
export function hiddenHeight(R, e, d) {
  const d0 = horizonDist(R, e);
  if (d <= d0) return 0;
  return R * (1 / Math.cos((d - d0) / R) - 1);
}

/** Chute sous la tangente géométrique aux pieds de l'observateur (~ d²/2R). */
export function dropBelowTangent(R, d) {
  return R * (1 / Math.cos(d / R) - 1);
}

/**
 * Élévation angulaire (radians) d'une cible de hauteur h à distance d,
 * vue depuis un œil à hauteur e, sur une sphère de rayon R.
 */
export function globeElev(R, e, d, h) {
  const t = d / R;
  return Math.atan2((R + h) * Math.cos(t) - (R + e), (R + h) * Math.sin(t));
}

/** Élévation angulaire (radians) sur un plan : simple triangle rectangle. */
export function flatElev(e, d, h) {
  return Math.atan2(h - e, d);
}

/** Angle de dépression (dip) exact pour un observateur à hauteur h. */
export function dipAngle(R, h) {
  return Math.acos(R / (R + h));
}

/**
 * Distance en ligne droite (corde tangente) de l'œil au point d'horizon,
 * exacte par Pythagore : (R+h)² = R² + d². À NE PAS confondre avec
 * `horizonDist` (arc le long de la surface courbe jusqu'au même point) --
 * les deux répondent à "distance de l'horizon" mais ne coïncident pas
 * (l'écart croît avec h). L'onglet dip (UC03) construit sur cet écart :
 * résoudre le triangle plat avec le dip mesuré donne d = h/tan(dip), qui
 * vaut environ la MOITIÉ de cette corde tangente à faible hauteur --
 * jamais l'arc de `horizonDist`. Voir CLAUDE.md / legacy dipDist().
 */
export function tangentDistance(R, h) {
  return Math.sqrt(2 * R * h + h * h);
}

/**
 * Reconstructs the height of a distant target from two elevation-angle
 * readings taken a known baseline `b` apart, by three methods. Ported
 * verbatim from the legacy's updateReverse() (flat-or-globe-2.20.0.html,
 * sim tab, "reverse-engineering the furthest target from two angles",
 * ~L14657-14775) -- NOT from the hh tab, despite hh being the more likely
 * place to look for a "two-station reconstruction": the legacy keeps this
 * exercise in the elevation-angles tab because it operates on two of that
 * tab's own targets (the observer and the nearest target become the two
 * survey stations). See CLAUDE.md "TAN vs LAW OF SINES" (tab 1, section 04).
 *
 * - `tangent`: the flat surveyor's method. Assumes the two stations' "level"
 *   references stay parallel -- true on a plane, false on a sphere.
 * - `sines`: the EXACT method. Intersects the two real sightlines in the
 *   Earth-centred (geocentric) frame, where the baseline's own rotation
 *   b/R is accounted for by construction (both stations are placed on the
 *   circle of radius R+e, b/R apart). This is the one that recovers the
 *   true height.
 * - `naive`: the flat surveyor's ACTUAL sine-rule shortcut -- treats the
 *   apparent angle difference (aNear - aFar) as the triangle's true
 *   divergence, silently dropping b/R. THIS DOES NOT WORK: when both
 *   stations sit near the same eye height the two rays are nearly
 *   parallel, the apparent divergence is wildly overstated, and the
 *   "recovered" height and distance are absurd. This is the regression
 *   documented in the legacy header -- do not replace `sines` with a
 *   b/R-only correction to `naive`, it is not equivalent to the geocentric
 *   ray intersection.
 *
 * @param {number} b baseline: distance from observer O to near station N (m)
 * @param {number} aFar elevation angle from O to the far target (rad)
 * @param {number} aNear elevation angle from N to the far target (rad)
 * @param {number} R radius of the geocentric construction (m)
 * @param {number} e eye height of O and N above the surface (m) -- the
 *   legacy places both stations at the same height
 */
export function reconstructTwoStation(b, aFar, aNear, R, e) {
  const cot = (x) => 1 / Math.tan(x);

  // --- tangent method (flat two-station): parallel horizontals ---
  const Ht = b / (cot(aFar) - cot(aNear));
  const Dt = Ht * cot(aFar);
  const tangent = { H: Ht, D: Dt, h: e + Ht };

  // --- law of sines (spherical): intersect the two real rays in the
  // geocentric frame -- the exact reconstruction ---
  const g = b / R;
  const O = [0, R + e];
  const N = [(R + e) * Math.sin(g), (R + e) * Math.cos(g)];
  const dO = [Math.cos(aFar), Math.sin(aFar)];
  const hN = [Math.cos(g), -Math.sin(g)];
  const uN = [Math.sin(g), Math.cos(g)];
  const dN = [
    hN[0] * Math.cos(aNear) + uN[0] * Math.sin(aNear),
    hN[1] * Math.cos(aNear) + uN[1] * Math.sin(aNear),
  ];
  const det = dO[0] * -dN[1] - -dN[0] * dO[1];
  const illConditioned = Math.abs(det) < 1e-9;
  let sinesH = NaN;
  if (!illConditioned) {
    const s = ((N[0] - O[0]) * -dN[1] - -dN[0] * (N[1] - O[1])) / det;
    const T = [O[0] + s * dO[0], O[1] + s * dO[1]];
    sinesH = Math.hypot(T[0], T[1]) - R;
  }
  const sines = { h: sinesH, illConditioned };

  // --- law of sines WITHOUT the b/R re-referencing (the flat surveyor's
  // actual procedure) ---
  const divNaive = aNear - aFar;
  const slantNo = (b * Math.sin(aNear)) / Math.sin(divNaive);
  const Hno = slantNo * Math.sin(aFar);
  const naive = { h: e + Hno, d: slantNo * Math.cos(aFar) };

  const divTrue = Math.acos(Math.max(-1, Math.min(1, dO[0] * dN[0] + dO[1] * dN[1])));

  return { tangent, sines, naive, divNaive, divTrue, bOverR: g };
}
