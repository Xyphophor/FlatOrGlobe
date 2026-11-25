// Test « WebGL disponible ? » partagé par les onglets à scène Three.js
// (gps, mag, sun). Il vit hors de src/render3d/ pour ne pas tirer
// Three.js dans le bundle principal.
//
// POURQUOI UN SEUL TEST, MÉMORISÉ. Chaque onglet avait son hasWebGL() qui
// créait un canvas et un contexte WebGL à chaque appel, sans le rendre. Les
// navigateurs plafonnent le nombre de contextes vivants (16 dans Chrome) et,
// au-delà, tuent LE PLUS ANCIEN -- c'est-à-dire une scène affichée, qui
// devient un cadre vide sans erreur visible. Ici le contexte de test est
// rendu tout de suite (WEBGL_lose_context) et le résultat est gardé.
//
// WEBGL2 SEULEMENT (2026-09-24). Three.js r163+ ne sait plus faire que du
// WebGL2. L'ancien test acceptait aussi WebGL1 : sur la machine du
// propriétaire (Firefox, « FEATURE_FAILURE_EGL_NO_CONFIG »), il répondait
// oui, Three.js échouait ensuite, et AUCUNE scène -- ni 3D ni repli 2.5D --
// ne s'affichait. Et si Three.js échoue malgré un test positif, l'onglet
// appelle webglFailed() et bascule sur son repli (voir gps/mag/sun).
let ok = null;

export function webglOK() {
  if (ok !== null) return ok;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    ok = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    ok = false;
  }
  return ok;
}

/** Three.js n'a pas pu créer son contexte : tous les onglets passent au repli 2.5D. */
export function webglFailed(err) {
  ok = false;
  console.warn("WebGL2 indisponible, repli 2.5D :", err?.message || err);
}
