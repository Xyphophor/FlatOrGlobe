// Caméras du calculateur (epic13) : des appareils réels plutôt qu'une largeur
// de capteur à inventer. Tout vient de caractéristiques publiées
// (src/data/presets/curv.js) ; la seule chose calculée ici est la loi de
// projection du mode Wide des GoPro, que GoPro ne publie pas : on prend la
// famille r = tan(kθ)/k et k est fixé par les TROIS champs publiés (vertical,
// horizontal, diagonal) du mode photo 4:3. Le mode vidéo 16:9, qui n'a pas
// servi à l'ajustement, sert de contrôle (gopro7Check, testé).
import { tanLaw, registerLens, lens as lensOf, invLens } from "../../core/lenses.js";
import { SENSORS, PHONES, GOPRO7 } from "../../data/presets/curv.js";

const D2R = Math.PI / 180;
export const DIAG35 = Math.hypot(36, 24);          // 43,27 mm : la focale « équivalente 35 mm » se rapporte à cette diagonale

/** k tel que r(D/2)² = r(H/2)² + r(V/2)² pour r = tan(kθ)/k (une équation, une inconnue). */
export function fitTanK({ h, v, d }) {
  const r = (k, t) => Math.tan(k * t) / k;
  const f = (k) => Math.hypot(r(k, (h / 2) * D2R), r(k, (v / 2) * D2R)) - r(k, (d / 2) * D2R);
  let lo = 1e-4, hi = 0.99;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}
export const GOPRO_K = fitTanK(GOPRO7.wide43);
export const GOPRO_WIDE = registerLens(tanLaw("gopro7w", GOPRO_K));

/** Diagonale prédite pour un champ H × V donné par une loi. */
export function diagFor(L, hDeg, vDeg) {
  return (2 * invLens(L, Math.hypot(L.r((hDeg / 2) * D2R), L.r((vDeg / 2) * D2R)))) / D2R;
}
/** Contrôle : le mode 16:9 (non ajusté) prédit par la loi du 4:3. */
export const gopro7Check = () => ({ k: GOPRO_K, d169: diagFor(GOPRO_WIDE, GOPRO7.wide169.h, GOPRO7.wide169.v), d169pub: GOPRO7.wide169.d });

/** Champ horizontal d'un objectif rectilinéaire de focale éq. 35 mm, image d'aspect H/W. */
export function fovFromEq(eq, aspect) { const w = DIAG35 / Math.hypot(1, aspect); return (2 * Math.atan(w / 2 / eq)) / D2R; }
/** Champ horizontal pour une focale réelle, une largeur de capteur et une loi. */
export function fovFromFocalLaw(f, w, law) { const t = invLens(lensOf(law), w / 2 / f); return t == null ? null : (2 * t) / D2R; }
/** Champ diagonal rectilinéaire d'une focale éq. 35 mm (contrôle contre les champs publiés par Apple). */
export const dfovFromEq = (eq) => (2 * Math.atan(DIAG35 / 2 / eq)) / D2R;

/**
 * Liste des caméras, groupées. kind : "sensor" (focale + loi à saisir),
 * "eq" (focale équivalente à saisir), "fov" (champ à saisir), ou fixe
 * (fov, lens, aspect, W donnés). W = largeur d'image proposée, à remplacer
 * par celle du fichier.
 */
export const CAMERAS = [
  ...SENSORS.map((s) => ({ id: `sen-${s.id}`, group: "sensor", kind: "sensor", w: s.w, aspect: s.h / s.w, W: 6000 })),
  ...PHONES.map((p) => ({ id: p.id, group: "phone", eq: p.eq, dfov: p.dfov, src: p.src, lens: "r35", aspect: 3 / 4, W: 4032, fov: fovFromEq(p.eq, 3 / 4) })),
  { id: "phone-eq", group: "phone", kind: "eq", lens: "r35", aspect: 3 / 4, W: 4032 },
  { id: "gp7-w43", group: "action", lens: "gopro7w", aspect: 3 / 4, W: 4000, fov: GOPRO7.wide43.h, src: 8 },
  { id: "gp7-w169", group: "action", lens: "gopro7w", aspect: 9 / 16, W: 3840, fov: GOPRO7.wide169.h, src: 8 },
  { id: "gp7-l43", group: "action", lens: "r35", aspect: 3 / 4, W: 4000, fov: GOPRO7.linear43.h, src: 8 },
  { id: "fov", group: "other", kind: "fov", lens: "r35", aspect: 2 / 3, W: 4000 },
];
export const camera = (id) => CAMERAS.find((c) => c.id === id) || CAMERAS[0];
