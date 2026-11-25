// Onglet "curv" (epic13) -- courbure de la Terre contre courbure de
// l'horizon. Géométrie pure, sans DOM : ce que voit une caméra à hauteur h
// au-dessus d'une sphère de rayon R. L'horizon est un cercle de points tous
// au même dip δ sous l'horizontale ; vu de l'œil c'est un cône d'axe
// vertical, et son image par l'objectif est la courbe que l'onglet dessine.
//
// Repère monde : x vers la droite (est), y devant (nord), z vers le haut.
// Caméra sans roulis, tournée vers y, inclinée VERS LE BAS de `pitch` (rad).
// Image : u vers la droite, v vers le HAUT, en pixels depuis le centre.
// Objectifs : les huit lois de src/core/lenses.js (partagées avec star) --
// rectilinéaire r = f·tan θ (droites -> droites), rectilinéaires à barillet,
// fisheyes (équisolide, équidistant, stéréographique, orthographique) ;
// "rect" et "fish" restent des alias de r35 et eqd. Kannala & Brandt.
import { dipAngle, effectiveRadius, hiddenHeight, horizonDist } from "../../core/math.js";
import { lens as lensOf, invLens } from "../../core/lenses.js";

export const R_EARTH = 6371000;
export const K_STD = 0.13;
const D2R = Math.PI / 180;

/** Dip du globe (rad) à la hauteur h ; k > 0 = réfraction standard R/(1−k). */
export function dip(h, k = 0, R = R_EARTH) {
  return h > 0 ? dipAngle(effectiveRadius(R, k), h) : 0;
}

/** Champ horizontal (degrés) d'un objectif rectilinéaire de focale f sur un capteur de largeur w (mêmes unités). */
export function fovFromFocal(f, w) { return 2 * Math.atan(w / (2 * f)) / D2R; }
export function focalFromFov(fovDeg, w) { return w / (2 * Math.tan((fovDeg * D2R) / 2)); }

/**
 * Caméra : W, H en pixels, fovH en degrés (champ horizontal), lens "rect"|"fish",
 * pitch en radians (positif = vers le bas). f = focale en pixels.
 */
export function makeCamera({ W, H, fovH, lens = "rect", pitch = 0 }) {
  const L = lensOf(lens);
  const a = (fovH * D2R) / 2;
  const f = W / 2 / L.r(a);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return { W, H, fovH, lens, pitch, f, L,
    fwd: [0, cp, -sp], up: [0, sp, cp] };
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Direction monde -> [u, v] pixels depuis le centre (v vers le haut), ou null si hors de l'objectif. */
export function project(cam, d) {
  return projectCam(cam, [d[0], dot(d, cam.up), dot(d, cam.fwd)]);
}

/** Idem pour une direction déjà exprimée dans le repère caméra [droite, haut, avant] (grille tenue devant l'objectif). */
export function projectCam(cam, [cx, cy, cz]) {
  const n = Math.hypot(cx, cy, cz);
  const th = Math.acos(Math.max(-1, Math.min(1, cz / n)));
  if (th >= cam.L.thetaMax - 1e-9) return null;
  const r = cam.f * cam.L.r(th), rho = Math.hypot(cx, cy);
  if (rho < 1e-15) return [0, 0];
  return [(r * cx) / rho, (r * cy) / rho];
}

/** Inclinaison (rad, positive vers le bas) qui place le milieu d'un horizon de dip δ à la hauteur v (px, vers le haut) de l'image. */
export function pitchForHorizonAt(cam, delta, v) {
  const t = invLens(cam.L, Math.abs(v) / cam.f);
  return t == null ? null : delta + Math.sign(v) * t;
}

/** Pixel [u, v] -> élévation (rad) de la direction visée, ou null hors de l'objectif (fisheye au-delà de 180°). */
export function elevationAt(cam, u, v) {
  const r = Math.hypot(u, v), th = invLens(cam.L, r / cam.f);
  if (th == null) return null;
  const s = Math.sin(th), c = Math.cos(th);
  const cx = r > 0 ? (s * u) / r : 0, cy = r > 0 ? (s * v) / r : 0;
  // monde = cx·right + cy·up + c·fwd ; seule la composante z compte
  const z = cy * cam.up[2] + c * cam.fwd[2];
  return Math.asin(Math.max(-1, Math.min(1, z)));
}

/** Point d'horizon à l'azimut az (rad, 0 = devant), dip δ. */
export const horizonDir = (az, delta) => [Math.sin(az) * Math.cos(delta), Math.cos(az) * Math.cos(delta), -Math.sin(delta)];

/** Polyligne de l'horizon dans l'image (points dans le cadre, élargi de `pad` px), en segments continus. */
export function horizonPolyline(cam, delta, pad = 2, step = 0.25) {
  const segs = []; let cur = [];
  for (let a = -180; a <= 180; a += step) {
    const p = project(cam, horizonDir(a * D2R, delta));
    if (p && Math.abs(p[0]) <= cam.W / 2 + pad && Math.abs(p[1]) <= cam.H / 2 + pad) cur.push(p);
    else if (cur.length) { segs.push(cur); cur = []; }
  }
  if (cur.length) segs.push(cur);
  return segs;
}

/**
 * Flèche (sagitta) de l'horizon dans l'image, mesurée comme Lynch (2008) :
 * un point au bord gauche, un au bord droit, un au centre, et l'écart
 * vertical du centre à la corde. Positive = arche (bombé vers le haut).
 * Renvoie { px, frac (de la largeur), rad (px / f, au centre), vCentre, vEdge, inFrame }
 * ou null si l'horizon n'atteint pas les bords latéraux (disque entier dans le cadre).
 */
export function sagitta(cam, delta) {
  const uAt = (az) => { const p = project(cam, horizonDir(az, delta)); return p ? p[0] : NaN; };
  const target = cam.W / 2;
  let lo = 0, hi = null;
  for (let a = 0.25; a <= 180; a += 0.25) {
    const u = uAt(a * D2R);
    if (!(u < target)) { if (Number.isFinite(u)) hi = a * D2R; break; }
    lo = a * D2R;
  }
  if (hi == null) return null;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (uAt(m) < target) lo = m; else hi = m; }
  const pe = project(cam, horizonDir(hi, delta)), pc = project(cam, horizonDir(0, delta));
  if (!pe || !pc) return null;
  const px = pc[1] - pe[1];
  const inFrame = Math.abs(pe[1]) <= cam.H / 2 && Math.abs(pc[1]) <= cam.H / 2;
  return { px, frac: px / cam.W, rad: px / cam.f, vCentre: pc[1], vEdge: pe[1], azEdge: hi, inFrame };
}

/** Forme close, caméra de niveau et objectif rectilinéaire : s = f·tan δ·(sec a − 1), a = demi-champ. */
export function sagittaLevelRect(fovH, W, delta) {
  const a = (fovH * D2R) / 2, f = W / 2 / Math.tan(a);
  return f * Math.tan(delta) * (1 / Math.cos(a) - 1);
}

/**
 * Flèche pour une hauteur donnée, horizon CENTRÉ (caméra inclinée du dip du
 * modèle, ce que Lynch recommande) ou caméra de niveau. k = 0 géométrique,
 * K_STD réfracté. Un plan infini : δ = 0, flèche nulle (rectilinéaire).
 */
export function sagittaAt(h, { fovH, W = 4000, aspect = 2 / 3, lens = "rect", k = 0, mode = "centre", R = R_EARTH }) {
  const delta = dip(h, k, R);
  const cam = makeCamera({ W, H: W * aspect, fovH, lens, pitch: mode === "centre" ? delta : 0 });
  return sagitta(cam, delta);
}

/**
 * Hauteur (m) à partir de laquelle la flèche atteint `target` (en pixels si
 * unit = "px", en fraction de la largeur si unit = "frac"), horizon centré,
 * objectif rectilinéaire par défaut, ou la loi `lens` et le format `aspect` d'une caméra. null si jamais atteinte sous hMax.
 */
export function heightForSagitta(target, { fovH, W = 4000, aspect = 2 / 3, lens = "rect", k = 0, unit = "px", hMax = 2e6, R = R_EARTH }) {
  // null = l'anneau entier tient dans le cadre : ça n'arrive que très haut, où la courbure dépasse tout seuil
  const val = (h) => { const s = sagittaAt(h, { fovH, W, aspect, lens, k, R }); return s ? (unit === "px" ? s.px : s.frac) : Infinity; };
  if (val(hMax) < target) return null;
  let lo = -3, hi = Math.log10(hMax);
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (val(10 ** m) < target) lo = m; else hi = m; }
  return 10 ** hi;
}

/** Chute de la surface sous le plan tangent à distance d (courbure de la TERRE) : R(sec(d/R) − 1) ≈ d²/2R. */
export function surfaceDrop(d, R = R_EARTH) { return R * (1 / Math.cos(d / R) - 1); }

/** Rayon (m, mesuré au sol) du cercle d'horizon vu de h : l'arc R·δ. */
export function horizonRadius(h, k = 0, R = R_EARTH) { return effectiveRadius(R, k) * dip(h, k, R); }

/**
 * Steel-man plat (règle 2) : un plan dont le bord visible s'arrête à D
 * (brume) donne lui aussi un cercle, à la dépression atan(h/D) -- donc une
 * flèche. D ajusté pour égaler le dip du globe à la hauteur h0.
 */
export function flatEdgeFit(h0, R = R_EARTH) { return h0 / Math.tan(dip(h0, 0, R)); }
export function flatEdgeDip(h, D) { return Math.atan(h / D); }

/* ---- Animation « en profondeur / de gauche à droite » (UC05) ----
   Chronologie en images clés (secondes) : départ à d0, les prises documentées
   de la Turning Torso (arrêt sur chacune), la montée de F à F2, puis la
   montée jusqu'à hMax. Hauteur interpolée en logarithme, distance linéaire. */
const ease = (x) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };

/** Images clés { t, h, d, shot } construites depuis les prises. */
export function depthKeys(P, shots) {
  const K = []; let t = 0;
  const add = (dt, h, d, shot = null, hold = 0) => { t += dt; K.push({ t, h, d, shot }); if (hold) { t += hold; K.push({ t, h, d, shot }); } };
  add(0, P.eye, P.d0, null, 1);
  shots.forEach((s, n) => add(n === 0 ? 3 : s.d === shots[n - 1].d ? 2 : 1.1, s.h, s.d, s, n === shots.length - 1 ? 1.8 : 1.3));
  add(12, P.hMax, shots[shots.length - 1].d, null, 2.5);
  return K;
}
export const depthDuration = (P, shots) => { const K = depthKeys(P, shots); return K[K.length - 1].t; };

/** État à l'instant t : { h, d, shot (prise affichée pendant l'arrêt, ou null), climb (0..1 de la dernière montée), phase 0|1 }. */
export function depthAt(t, P, shots) {
  const K = depthKeys(P, shots);
  let i = 0; while (i < K.length - 2 && t > K[i + 1].t) i++;
  const a = K[i], b = K[i + 1], u = ease((t - a.t) / Math.max(1e-9, b.t - a.t));
  const h = a.h * (b.h / a.h) ** u, d = a.d + (b.d - a.d) * u;
  const shot = a.shot && a.shot === b.shot ? a.shot : null;
  const last = K[K.length - 3];                      // départ de la montée finale
  const climb = t <= last.t ? 0 : ease((t - last.t) / (K[K.length - 2].t - last.t));
  const tUp = K.filter((k) => k.shot === shots[shots.length - 2]).pop().t;   // la dernière prise (F2) est prise en montant
  const phase = t > tUp ? 1 : 0;
  return { h, d, shot, climb, phase };
}

/** Hauteur cachée de la cible à la distance d (arc), œil à h : géométrique et réfractée (règle 3). */
export function hiddenBoth(h, d, R = R_EARTH) {
  return { geo: hiddenHeight(R, h, d), refr: hiddenHeight(effectiveRadius(R, K_STD), h, d) };
}

/** Coefficient de réfraction k qui ferait cacher exactement H (m) au globe, depuis h, à la distance d. */
export function kToMatch(h, d, H, R = R_EARTH) {
  let lo = -0.5, hi = 0.9;                           // hauteur cachée décroissante en k
  if (hiddenHeight(effectiveRadius(R, hi), h, d) > H) return null;
  for (let n = 0; n < 60; n++) { const m = (lo + hi) / 2; const Hm = hiddenHeight(R / (1 - m), h, d); if (Hm > H) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/**
 * Maquette du profil (règle 1) : Terre ex fois plus petite, distances au sol
 * √ex fois plus courtes, hauteurs VRAIES, le tout à échelle uniforme. La chute
 * d²/2R est alors inchangée, donc chaque hauteur cachée aussi ; seuls les angles
 * grandissent (×√ex) -- les angles imprimés sont les vrais.
 * ex décroît de ex1 (au sol) à 1 (à hMax), uniformément en logarithme de h.
 */
export function modelScale(h, P) {
  const w = Math.max(0, Math.min(1, 1 - Math.log(h / P.eye) / Math.log(P.hMax / P.eye)));
  const ex = P.ex1 ** w;
  return { ex, R: R_EARTH / ex, dist: 1 / Math.sqrt(ex) };
}

/**
 * Distance au sol DESSINÉE (maquette de rayon Rm) d'une cible à la vraie distance d,
 * œil à h : ≈ d/√ex, mais choisie pour que la hauteur cachée dans la maquette soit
 * EXACTEMENT la vraie (au-delà de l'horizon) ; en deçà, proportionnelle.
 */
export function modelDist(d, h, Rm, R = R_EARTH) {
  const d0 = horizonDist(R, h), d0m = horizonDist(Rm, h);
  if (d <= d0) return d * d0m / d0;
  const H = hiddenHeight(R, h, d);
  return d0m + Rm * Math.acos(Rm / (Rm + H));
}
