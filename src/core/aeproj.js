// Projection azimutale équidistante de centre quelconque (epic18/UC01, 2026-10-03).
// J. P. Snyder, Map Projections -- A Working Manual, USGS PP 1395 (1987), §25.
//
// Unités : DEGRÉS d'arc. Une unité de carte = un degré ; aucun rayon terrestre
// n'entre ici (règle 10). Passer en km (× 111,19 pour la carte des platistes) est
// un choix d'affichage de l'appelant.
//
// Sortie en coordonnées « math » : x vers l'est du centre, y vers le nord du centre
// (pour un centre polaire, y vers le méridien λ₀ + 180°, comme sur toute carte du
// pôle Nord), tournées de `rot` degrés dans le sens trigonométrique. L'orientation
// d'écran (y vers le bas, miroir éventuel) appartient à l'appelant : `toScreen`.
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

/** Distance angulaire de grand cercle entre deux points, en degrés (forme stable). */
export function gcDeg(la1, lo1, la2, lo2) {
  const p1 = la1 * D2R, p2 = la2 * D2R, dl = (lo2 - lo1) * D2R;
  const a = Math.cos(p2) * Math.sin(dl), b = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return Math.atan2(Math.hypot(a, b), Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl)) * R2D;
}

/** Longitude ramenée dans [−180, 180). */
const wrap = (lon) => ((((lon + 180) % 360) + 360) % 360) - 180;

/**
 * Une carte AE centrée en (lat0, lon0), tournée de rot degrés.
 * fwd(lat, lon) → [x, y] en degrés (|(x, y)| = distance angulaire au centre, exacte) ;
 * inv(x, y) → [lat, lon], ou null hors du disque (ρ > 180°) ;
 * dist(a, b) → distance EUCLIDIENNE sur la carte entre [lat, lon] a et b (le « plat » de ce centre).
 */
export function makeAE({ lat0 = 90, lon0 = 0, rot = 0 } = {}) {
  const s1 = Math.sin(lat0 * D2R), c1 = Math.cos(lat0 * D2R), cr = Math.cos(rot * D2R), sr = Math.sin(rot * D2R);
  function fwd(lat, lon) {
    const sp = Math.sin(lat * D2R), cp = Math.cos(lat * D2R), dl = (lon - lon0) * D2R;
    const ex = cp * Math.sin(dl), ny = c1 * sp - s1 * cp * Math.cos(dl);   // direction (non normée : |.| = sin c)
    const c = Math.atan2(Math.hypot(ex, ny), s1 * sp + c1 * cp * Math.cos(dl));   // distance angulaire, rad
    const n = Math.hypot(ex, ny);
    let x = 0, y = 0;
    if (n > 1e-15) { x = (c * ex) / n; y = (c * ny) / n; }
    else if (c > 1) { y = -Math.PI; }   // l'antipode exact : direction indéfinie, posé en bas du bord
    x *= R2D; y *= R2D;
    return [x * cr - y * sr, x * sr + y * cr];
  }
  function inv(X, Y) {
    const x = X * cr + Y * sr, y = -X * sr + Y * cr;   // rotation inverse
    const rho = Math.hypot(x, y);
    if (rho > 180 + 1e-9) return null;
    if (rho < 1e-12) return [lat0, wrap(lon0)];
    const c = rho * D2R, sc = Math.sin(c), cc = Math.cos(c);
    const lat = Math.asin(Math.max(-1, Math.min(1, cc * s1 + (y * sc * c1) / rho))) * R2D;
    const lon = lon0 + Math.atan2(x * sc, rho * c1 * cc - y * s1 * sc) * R2D;
    return [lat, wrap(lon)];
  }
  const dist = (a, b) => { const p = fwd(a[0], a[1]), q = fwd(b[0], b[1]); return Math.hypot(p[0] - q[0], p[1] - q[1]); };
  return { lat0, lon0, rot, fwd, inv, dist };
}

/**
 * Passage carte → écran : centre (cx, cy), Rpx pixels pour 180°, y vers le bas,
 * mirror = true pour retourner est/ouest (la convention de seisAE). Renvoie f([x, y]) → [px, py].
 */
export function toScreen({ cx, cy, Rpx, mirror = false }) {
  const s = Rpx / 180, m = mirror ? -1 : 1;
  return ([x, y]) => [cx + m * x * s, cy - y * s];
}

/** L'inverse de toScreen : [px, py] → [x, y] en degrés de carte. */
export function fromScreen({ cx, cy, Rpx, mirror = false }) {
  const s = 180 / Rpx, m = mirror ? -1 : 1;
  return (px, py) => [m * (px - cx) * s, -(py - cy) * s];
}
