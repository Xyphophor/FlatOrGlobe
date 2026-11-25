// Calques vidéo pré-rendus (2026-11-18, core/layer-video.js) : la partie coûteuse d'une animation, sans texte, rendue une fois
// par scripts/prerender-layers.mjs. id (= l'id du canvas) → module qui exporte LAYER = { id, span (s), size (px, carré),
// paint(ctx, size, u) }. L'empreinte d'un calque = ce module et tout ce qu'il importe, plus le noyau de rendu
// (prerender-fingerprint.mjs, layerFingerprint) ; src/data/video-layers.json garde celle du dernier rendu (make videos-check).
export const VIDEO_LAYERS = { gravAnimTideGlobe: "src/tabs/grav/tideglobe.js" };
