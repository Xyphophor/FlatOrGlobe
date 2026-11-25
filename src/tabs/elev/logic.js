// Logique pure de l'onglet sim (angles d'élévation), portée à l'identique
// du legacy (flat-or-globe-2.20.0.html, readInputs()/computeAngles()
// ~L14167-14206, updateRecip() ~L14779, updateSizes() ~L14629, and the
// reverse-engineering two-station reconstruction now shared as
// reconstructTwoStation() in src/core/math.js). Séparée de index.js pour
// rester testable sous node:test sans DOM/canvas (voir tasks/epic02/UC01.org).
import { globeElev, flatElev, DEG, reconstructTwoStation } from "../../core/math.js";

export { reconstructTwoStation };

/**
 * Valide et normalise les entrées de l'onglet, à l'identique de readInputs()
 * du legacy -- sauf qu'ici les valeurs arrivent déjà en unités SI (mètres),
 * pas lues depuis le DOM en kilomètres : la conversion km -> m et la lecture
 * des <input> restent la responsabilité d'index.js.
 *
 * @param {object} p
 * @param {number} p.eye hauteur d'œil de l'observateur (m)
 * @param {number} p.R rayon terrestre géométrique (m)
 * @param {boolean} p.refr réfraction activée
 * @param {number} p.k coefficient de réfraction
 * @param {{d:number,h:number,az:number,color?:string,key?:string,name?:string,short?:string}[]} p.objs
 */
export function readInputs({ eye, R, refr, k, objs }) {
  let valid = true;
  let msg = "";
  if (![eye, R, k].every(Number.isFinite) || !objs.every((o) => Number.isFinite(o.d) && Number.isFinite(o.h) && Number.isFinite(o.az))) {
    valid = false;
    msg = "err-need-number";
  } else if (eye < 0 || R <= 0) {
    valid = false;
    msg = "err-eye-radius";
  } else if (objs.some((o) => o.d <= 0 || o.h < 0)) {
    valid = false;
    msg = "err-dist-height";
  } else if (refr && (k < 0 || k >= 1)) {
    valid = false;
    msg = "err-refr-k";
  }
  const Rg = refr && k < 1 ? R / (1 - k) : R;
  return { eye, R, Rg, refr, k, objs, valid, msg };
}

/**
 * Angle d'élévation prédit par chaque modèle pour chaque cible, à
 * l'identique de computeAngles() du legacy.
 */
export function computeAngles(s) {
  return s.objs.map((o) => {
    const flat = flatElev(s.eye, o.d, o.h);
    const globeGeo = globeElev(s.R, s.eye, o.d, o.h); // vacuum / geometric
    const globe = globeElev(s.Rg, s.eye, o.d, o.h); // apparent (refraction if enabled)
    return { ...o, flat, globe, globeGeo, diff: flat - globe };
  });
}

/**
 * Noms des cibles : un span vide tant qu'aucun preset n'est chargé, et qui
 * disparaît dès qu'un champ est modifié à la main -- "stale label" piège
 * documenté dans le legacy (objLabel/objShort ~L14164-14165). `o.name`/
 * `o.short` sont attachés par l'appelant (index.js) depuis TARGET_NAMES au
 * moment de lire les champs, jamais stockés en dur ici.
 */
export const objLabel = (o) => (o.name ? `${o.key} ${o.name}` : `Target ${o.key}`);
export const objShort = (o) => (o.short ? `${o.key} ${o.short}` : o.key);

/**
 * Taille angulaire apparente (base -> sommet) d'une cible, plat vs globe --
 * updateSizes() du legacy (~L14629-14647). Sur le plan c'est la somme des
 * deux angles de part et d'autre du niveau des yeux ; sur le globe c'est la
 * différence des deux élévations calculées avec la formule complète.
 */
export function angularSize(R, eye, d, h) {
  const flat = flatElev(eye, d, h) - flatElev(eye, d, 0);
  const globe = globeElev(R, eye, d, h) - globeElev(R, eye, d, 0);
  return { flat, globe, dSize: flat - globe };
}

/**
 * Angles zénithaux réciproques entre l'observateur et la cible la plus
 * lointaine -- le test "sans paramètre libre" (updateRecip() du legacy,
 * ~L14779-14808). Sur un plan z_A + z_B = 180° exactement, quels que
 * soient d, e ou h ; sur un globe l'excès sur 180° vaut d/R et redonne R.
 */
export function reciprocalZenith(R, e, d, h) {
  const eA = globeElev(R, e, d, h);
  const eB = globeElev(R, h, d, e); // each sights the other
  const zA = 90 - DEG(eA);
  const zB = 90 - DEG(eB);
  const sum = zA + zB;
  const excess = sum - 180;
  const Rrec = d / (excess / (180 / Math.PI));
  return { zA, zB, sum, excess, Rrec };
}
