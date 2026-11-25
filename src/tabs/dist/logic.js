// Logique pure de l'onglet dist (distances), portée à l'identique du
// legacy (flat-or-globe-2.20.0.html, ~L15280-15440 et ~L15890 `updateExp3`).
// Séparée de index.js pour rester testable sous node:test sans DOM/canvas
// (voir tasks/epic02/UC03.org).

export const R3D_KM = 6371;
const D2R = Math.PI / 180;

// Deux paires de segments obliques ; chaque segment sud est le miroir exact
// de son jumeau nord à travers l'équateur, donc les longueurs sur le globe
// sont égales par symétrie. La troisième paire (C) est une route réelle
// (Santiago–Sydney) et son miroir.
export const DSEGS = [
  { key: "A·N", color: "#1d4ed8", p: [[50, -40], [30, 10]] },
  { key: "A·S", color: "#c2410c", p: [[-50, -40], [-30, 10]] },
  { key: "B·N", color: "#0f766e", p: [[10, 60], [35, 100]] },
  { key: "B·S", color: "#6d28d9", p: [[-10, 60], [-35, 100]] },
  { key: "C·N", color: "#0891b2", p: [[33, -71], [34, 151]] },
  { key: "C·S", color: "#be123c", p: [[-33, -71], [-34, 151]] },
];

/* ORIENTATION (2026-09-24). La caméra 2.5D (camera3d.js) est main droite :
   x à droite, y en haut, z vers l'observateur. Le legacy mettait l'est en +z,
   ce qui donne un globe EN MIROIR -- invisible tant qu'il n'y avait pas de
   côtes, et sans effet sur les distances (produits scalaires). L'est est
   donc −z au méridien 0, comme dans src/render3d/shared/scene.js. */
export const llVec = ([phi, lam]) => {
  const p = phi * D2R, l = lam * D2R;
  return [Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l)];
};

/** Globe : arc de grand cercle (loi des cosinus sphérique). */
export function distGC(a, b) {
  const u = llVec(a), v = llVec(b);
  return R3D_KM * Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2])));
}

/** Carte cartésienne (plate carrée) : ligne droite dans (λ, φ). */
export function distCart(a, b) {
  let dl = Math.abs(a[1] - b[1]);
  if (dl > 180) dl = 360 - dl;
  return R3D_KM * Math.hypot((a[0] - b[0]) * D2R, dl * D2R);
}

/** Carte polaire (azimutale équidistante) : corde droite sur le disque. */
export function distAE(a, b) {
  const r1 = (90 - a[0]) * D2R, r2 = (90 - b[0]) * D2R, dl = (a[1] - b[1]) * D2R;
  return R3D_KM * Math.sqrt(r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(dl));
}

/**
 * Coordonnées (r, θ) → point 3D sur le disque AE, échelle S telle que la
 * colatitude π (pôle sud) atteigne le rayon donné. Utilisé par le rendu
 * 3D (index.js) ; pure car il ne touche à aucun canvas.
 */
export function aePoint([phi, lam], S) {
  const r = (90 - phi) * D2R * S, l = lam * D2R;
  // vu d'en haut (+y), l'est tourne dans le sens direct : −sin, cf. llVec
  return [r * Math.cos(l), 0, -r * Math.sin(l)];
}

/**
 * epic18 : la transformation affine qui pose l'image des terres de la carte polaire makeAE() (canvas carré de
 * n pixels, centre au milieu, nord en haut, 360/n degrés par pixel) sur la face du dessus de la dalle 2,5D.
 * aePoint = [r cos λ, 0, −r sin λ] = (X, Z) = (−y, −x)·k, k = S·π/180 ; pixel (i, j) ↔ x = (i − n/2)·360/n,
 * y = −(j − n/2)·360/n ; d'où X = a(j − n/2), Z = −a(i − n/2), a = 360k/n. o, eX, eZ : P([0,0,0]), P([1,0,0]),
 * P([0,0,1]) (caméra orthographique, donc affine). Renvoie [A, B, C, D, E, F] pour ctx.transform.
 */
export function distLandAffine(o, eX, eZ, n, S) {
  const a = (360 / n) * (S * Math.PI / 180), ax = [eX[0] - o[0], eX[1] - o[1]], az = [eZ[0] - o[0], eZ[1] - o[1]];
  return [-a * az[0], -a * az[1], a * ax[0], a * ax[1], o[0] + (n / 2) * a * (az[0] - ax[0]), o[1] + (n / 2) * a * (az[1] - ax[1])];
}

/** Coordonnées (x, z) → point 3D sur la grille cartésienne (plate carrée). */
export function cartPoint([phi, lam], SX, SZ) {
  return [lam * D2R * SX, 0, -phi * D2R * SZ];
}

/**
 * Formatage d'une paire de coordonnées, ex. "60°N 0°" -- identique au
 * `fmt` interne de `fillDistTable` dans le legacy.
 */
export function fmtLL([phi, lam]) {
  return `${Math.abs(phi)}°${phi < 0 ? "S" : "N"} ${Math.abs(lam)}°${lam < 0 ? "W" : "E"}`;
}

/**
 * Calcul pur de l'expérience 3 (trajet est-ouest, nord vs sud) --
 * `updateExp3` dans le legacy, séparé de son rendu HTML.
 */
export function exp3(latDeg, dlDeg) {
  const R = 6371;
  const rad = D2R;
  const globe = R * Math.cos(latDeg * rad) * dlDeg * rad;
  const ae = R * (90 - latDeg) * rad * dlDeg * rad;
  const mirror = R * Math.cos(-latDeg * rad) * dlDeg * rad;
  const aeM = R * (90 + latDeg) * rad * dlDeg * rad;
  return { globe, mirror, ae, aeM, ratio: Math.max(ae, aeM) / Math.min(ae, aeM) };
}
