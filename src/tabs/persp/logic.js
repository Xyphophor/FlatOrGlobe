// Onglet "persp" (2026-11-21, demande du propriétaire : « un onglet dédié perspective dans objections ») : ce que la
// perspective fait (un angle qui diminue sans jamais s'annuler), ce qu'elle ne fait pas (coucher un Soleil posé au-dessus
// d'un plan, cacher le bas d'un objet), et les rayons du Soleil (parallèles, vus en perspective). Logique pure, testée ;
// les [n] renvoient à src/data/sources/persp.js. Les scènes 3D (persp3d.js) et les animations lisent leurs nombres ici.

export const DEG = Math.PI / 180;
export const R_EARTH = 6371;           // km, rayon moyen (UGGI)
export const K_REFR = 0.13;            // coefficient de réfraction standard (règle 3)
export const ACUITY = 1 / 60;          // degré : une minute d'arc, l'acuité de l'œil normal (Snellen) [3]
export const SUN_DIAM_DEG = 0.533;     // diamètre apparent moyen du Soleil, 31,6′ à 32,7′ dans l'année [9]

/** Angle sous lequel on voit une taille s à la distance d (mêmes unités), en degrés : θ = 2 arctan(s / 2d). Jamais nul. */
export const angSize = (s, d) => (2 * Math.atan(s / (2 * d))) / DEG;

/** Le carré de cubes de l'animation (mètres) : cubes de 1 m, rangées de 0 à 1 m et de 2 à 3 m, œil à 1,7 m. */
export const CUBES = { side: 1, lowTop: 1, highBottom: 2, eye: 1.7, x: [-1.5, 0.5] };

/** Écart vu entre les deux rangées (bas de la rangée haute, haut de la rangée basse) à la distance d (m), en degrés. */
export function gapAngle(d, c = CUBES) {
  return (Math.atan((c.highBottom - c.eye) / d) + Math.atan((c.eye - c.lowTop) / d)) / DEG;
}
/** Distance où un écart s (m) tombe à l'acuité de l'œil : d = s / tan(1′). */
export const acuityDistance = (s) => s / Math.tan(ACUITY * DEG);

/** Projection d'un sténopé : un point (X, Y, Z) devant l'objectif, focale f -> image (f X/Z, f Y/Z). */
export const pinhole = (X, Y, Z, f) => [(f * X) / Z, (f * Y) / Z];

/** Point de fuite d'une direction (dx, dy, dz) pour un appareil regardant le long de +z : (f dx/dz, f dy/dz) ; null si dz ≤ 0. */
export const vanishing = (dx, dy, dz, f) => (dz > 1e-12 ? [(f * dx) / dz, (f * dy) / dz] : null);

/* ---- le Soleil d'un modèle plat --------------------------------------------------------------------------------------- */
// La hauteur la plus citée est « 3 000 miles » (4 828 km) ; la page prend 5 000 km et montre que toute hauteur h > 0 échoue
// pareil (règle 2 : le paramètre libre est laissé libre, le signe ne dépend pas de lui).
export const FLAT_SUN_H = 5000;        // km
export const FLAT_D_MAX = 20000;       // km, un demi-méridien : le plus loin qu'un lieu du disque soit du point sous le Soleil

/** Hauteur angulaire d'un Soleil à h au-dessus d'un plan, vu à la distance horizontale d : α = arctan(h/d) > 0. */
export const flatElevation = (d, h = FLAT_SUN_H) => Math.atan2(h, d) / DEG;
/** Diamètre réel D qui donne le diamètre apparent mesuré au zénith, puis le diamètre apparent à la distance d. */
export const flatSunDiameter = (h = FLAT_SUN_H) => 2 * h * Math.tan((SUN_DIAM_DEG / 2) * DEG);
export const flatSunAngDiam = (d, h = FLAT_SUN_H) => angSize(flatSunDiameter(h), Math.hypot(h, d));
/** La distance horizontale à laquelle le Soleil plat ne serait plus qu'à α au-dessus de l'horizon. */
export const flatDistanceFor = (alphaDeg, h = FLAT_SUN_H) => h / Math.tan(alphaDeg * DEG);

/* ---- les rayons : la scène des animations (km) -------------------------------------------------------------------------- */
// Un Soleil à 15° de hauteur, droit devant (+x) ; une couche de nuages à 2 km, percée de trous : un groupe vers le Soleil
// (ses rayons descendent vers l'œil : l'éventail), un groupe derrière l'œil (ses rayons s'en vont : les rayons
// anticrépusculaires), et un groupe sur le côté (+z : vus de profil quand l'œil tourne de 90°) ; aucun au-dessus de l'œil. L'œil à 1,7 m. Le Soleil proche est posé sur la MÊME ligne de visée,
// là où le met le « meilleur ajustement » de l'éventail (bestFitSun) : vu de l'œil, il est au même endroit du ciel.
export const RAYS = {
  elev: 15, cloud: 2, eye: 0.0017,
  slab: { x0: -13, x1: 12.5, z0: -11, z1: 11 }, hole: 0.5,
  holes: [[8.2, -3.4], [8.0, 0.6], [8.4, 4.1], [9.6, -1.6], [9.8, 2.4], [11.1, -4.2], [11.0, 0.2], [11.3, 4.6],
    [5.6, 7.6], [3.1, 8.6], [0.6, 7.3], [-2.0, 8.8], [-4.4, 7.4],
    [-5.2, -2.2], [-5.0, 1.8], [-7.4, -4.4], [-7.6, 0.1], [-7.3, 4.0], [-9.9, -2.1], [-10.1, 2.3]],
};
/** Direction du Soleil (vers lui) : x vers son azimut, y vers le haut. */
export const sunDir = (elev = RAYS.elev) => [Math.cos(elev * DEG), Math.sin(elev * DEG), 0];
/**
 * Le « meilleur ajustement » de l'éventail (propriétaire, 2026-11-21) : la triangulation naïve des rayons crépusculaires.
 * On photographie les rayons du Soleil lointain (appareil horizontal, face au Soleil) ; on lit chaque rayon comme une droite
 * de l'image, et on suppose, comme le fait cette lecture, que l'éventail est À PLAT dans le plan des nuages, à la distance
 * Zc des trous côté Soleil (leur profondeur moyenne). Chaque droite de l'image, reportée dans ce plan, est une droite du
 * plan ; leur point commun au sens des moindres carrés (somme des carrés des distances aux droites) est le « Soleil »
 * de cette lecture. Renvoie { P (km, monde), Zc, rms (km, écart moyen des droites au point), n (rayons ajustés) }.
 */
export function bestFitSun(r = RAYS) {
  const s = sunDir(r.elev), ey = r.eye, gaps = r.holes.filter((h) => h[0] > 6);   // les trous côté Soleil, ceux qui font l'éventail de la photo
  const Zc = gaps.reduce((a, h) => a + h[0], 0) / gaps.length;
  // l'image (appareil en (0, ey, 0) regardant +x ; coordonnées image u = z/x, v = (y − ey)/x), reportée au plan x = Zc
  const lines = gaps.map((h) => {
    const A = [h[0], r.cloud, h[1]], t = r.cloud / s[1], B = [A[0] - s[0] * t, 0, A[2] - s[2] * t];
    const im = (P) => [(P[2] / P[0]) * Zc, ((P[1] - ey) / P[0]) * Zc];
    const a = im(A), b = im(B), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    return { a, n: [-dy / L, dx / L] };   // un point et la normale unitaire
  });
  // moindres carrés : Σ (n·(p − a))² minimal -> (Σ n nᵀ) p = Σ n nᵀ a
  let m00 = 0, m01 = 0, m11 = 0, b0 = 0, b1 = 0;
  for (const { a, n } of lines) { const na = n[0] * a[0] + n[1] * a[1]; m00 += n[0] * n[0]; m01 += n[0] * n[1]; m11 += n[1] * n[1]; b0 += n[0] * na; b1 += n[1] * na; }
  const det = m00 * m11 - m01 * m01, pz = (m11 * b0 - m01 * b1) / det, py = (m00 * b1 - m01 * b0) / det;
  const rms = Math.sqrt(lines.reduce((acc, { a, n }) => acc + (n[0] * (pz - a[0]) + n[1] * (py - a[1])) ** 2, 0) / lines.length);
  return { P: [Zc, ey + py, pz], Zc, rms, n: lines.length };
}
let FIT = null;
/** Le Soleil proche : celui du meilleur ajustement (sur la ligne de visée, juste au-dessus des nuages). */
export function nearSun(r = RAYS) { if (r !== RAYS) return bestFitSun(r).P; return (FIT ??= bestFitSun(r)).P; }
/** Où arrive au sol le rayon qui passe par le point c (au niveau du nuage) : Soleil lointain (direction) ou proche (point). */
export function groundHit(c, near = false, r = RAYS) {
  if (!near) { const s = sunDir(r.elev); const t = c[1] / s[1]; return [c[0] - s[0] * t, 0, c[2] - s[2] * t]; }
  const P = nearSun(r), k = P[1] / (P[1] - c[1]);
  return [P[0] + (c[0] - P[0]) * k, 0, P[2] + (c[2] - P[2]) * k];
}
/** Agrandissement des taches de lumière au sol par rapport aux trous : 1 (lointain), H/(H − h) (proche). */
export const patchScale = (near = false, r = RAYS) => { if (!near) return 1; const H = nearSun(r)[1]; return H / (H - r.cloud); };
/** Angle entre deux rayons dont les trous sont à b l'un de l'autre, pour une source à la distance D : b/D (degrés). */
export const raySpread = (b, D) => (Math.atan(b / D) / DEG);

/** Angle (degrés) entre la direction de l'œil vers a et vers b. */
export function angleBetween(a, b) {
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], na = Math.hypot(...a), nb = Math.hypot(...b);
  return Math.acos(Math.max(-1, Math.min(1, d / (na * nb)))) / DEG;
}

/* ---- le zoom ne rend pas ce que cache la courbure ----------------------------------------------------------------------- */
/** Distance de l'horizon et hauteur cachée (km) pour un œil à h (km), avec R effectif R/(1 − k) si k est donné (règle 3). */
export const horizonDist = (h, k = 0, R = R_EARTH) => Math.sqrt(2 * (R / (1 - k)) * h);
export function hiddenHeight(d, h, k = 0, R = R_EARTH) {
  const Re = R / (1 - k), d0 = Math.sqrt(2 * Re * h);
  return d <= d0 ? 0 : ((d - d0) ** 2) / (2 * Re);
}
/** Le bateau de l'animation : 20 m de haut, l'œil à 2 m. */
export const BOAT = { h: 0.02, eye: 0.002 };
/** Distance où tout le bateau passe sous l'horizon : d0 + √(2 R h_bateau). */
export const sinkDistance = (k = 0, b = BOAT) => horizonDist(b.eye, k) + horizonDist(b.h, k);

/* ---- sous la hauteur de l'œil : depuis une montagne ------------------------------------------------------------------------ */
/** Abaissement de l'horizon (degrés) pour un œil à h km : arccos(R/(R + h)) ≈ √(2h/R), avec R/(1 − k) si k est donné. */
export const dipAngle = (h, k = 0, R = R_EARTH) => Math.acos((R / (1 - k)) / (R / (1 - k) + h)) / DEG;
/** Sur un plan, l'horizon au bord du disque (FLAT_D_MAX) est à arctan(h/d) sous l'œil ; un astre à H est à arctan((H − h)/d) au-dessus. */
export const flatDip = (h, d = FLAT_D_MAX) => Math.atan(h / d) / DEG;
/** Les astres de l'animation du globe (hauteur vraie, azimut relatif, degrés) : le Soleil couché et quatre étoiles. */
export const DIP_SKY = { sun: [-0.75, 0], stars: [[-0.35, -1.6], [-1.25, 1.7], [-1.62, -0.7], [0.55, 1.1]] };
/** La hauteur d'œil (km) à partir de laquelle un astre de hauteur vraie a (degrés, négative) passe au-dessus de l'horizon. */
export const riseHeight = (a, R = R_EARTH) => R / Math.cos(-a * DEG) - R;

/* ---- valeurs affichées --------------------------------------------------------------------------------------------------- */
export function perspValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const gap1k = gapAngle(1000) * 60, gap10k = gapAngle(10000) * 60;
  const s = sunDir(), P = nearSun(), D = Math.hypot(P[0], P[1] - RAYS.eye, P[2]);
  return {
    gap10: nf(gapAngle(10), 1), gap1k: nf(gap1k, 1), gap10k: nf(gap10k, 2), gapAcuity: nf(acuityDistance(1) / 1000, 1),
    gap1e6: nf(gapAngle(1e6) * 3600, 2),
    sunH: nf(FLAT_SUN_H), sunHmi: nf(3000), dMax: nf(FLAT_D_MAX), alphaMin: nf(flatElevation(FLAT_D_MAX), 1),
    sunD: nf(flatSunDiameter(), 0), deltaMax: nf(flatSunAngDiam(FLAT_D_MAX) * 60, 1), deltaZen: nf(SUN_DIAM_DEG * 60, 0),
    deltaRatio: nf(SUN_DIAM_DEG / flatSunAngDiam(FLAT_D_MAX), 1),
    dHalfDeg: nf(flatDistanceFor(0.5) / 1000, 0), dHalfDegCirc: nf(flatDistanceFor(0.5) / 40030, 0),
    rayElev: nf(RAYS.elev), cloudH: nf(RAYS.cloud), nearH: nf(P[1], 1), nearD: nf(D, 1), nearAbove: nf(Math.round((P[1] - RAYS.cloud) * 100) * 10), fitZc: nf(bestFitSun().Zc, 1), fitN: nf(bestFitSun().n),
    beamLen: nf(RAYS.cloud / Math.tan(RAYS.elev * DEG), 1), patchK: nf(patchScale(true), 1),
    spreadNear: nf(raySpread(1, D), 1), spreadFlat: nf(raySpread(1, FLAT_SUN_H), 3), spreadGlobe: nf(raySpread(1, 149.6e6) * 3600, 4),
    shadowGlobe: nf((1 / R_EARTH) / DEG, 4),
    d0: nf(horizonDist(BOAT.eye), 1), d0k: nf(horizonDist(BOAT.eye, K_REFR), 1),
    sink: nf(sinkDistance(), 1), sinkK: nf(sinkDistance(K_REFR), 1),
    hid15: nf(hiddenHeight(15, BOAT.eye) * 1000, 1), hid15k: nf(hiddenHeight(15, BOAT.eye, K_REFR) * 1000, 1),
    sunAlongX: nf(s[0], 3),
    dip1: nf(dipAngle(1), 2), dip2: nf(dipAngle(2), 2), dip1k: nf(dipAngle(1, K_REFR), 2), dip2k: nf(dipAngle(2, K_REFR), 2),
    dip1m: nf(dipAngle(1) * 60, 0), flatDip2: nf(flatDip(2) * 3600, 0), flatSun2: nf(flatElevation(FLAT_D_MAX, FLAT_SUN_H - 2), 1),
    sunRise: nf(riseHeight(DIP_SKY.sun[0] - SUN_DIAM_DEG / 2) * 1000, -1 + 1), sunRiseTop: nf(riseHeight(DIP_SKY.sun[0] + SUN_DIAM_DEG / 2) * 1000, 0),
  };
}
