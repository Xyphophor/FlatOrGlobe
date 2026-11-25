// Calques vidéo pré-rendus (2026-11-18, propriétaire : « l'animation avec des pics est gourmande ; pour une fois, du
// précalculé ») : une animation trop lourde pour être dessinée à chaque image dans la page fait rendre sa partie coûteuse,
// SANS texte, une fois pour toutes en vidéo (scripts/prerender-layers.mjs, registre src/data/video-layers.js). La page la
// plaque dans son canvas avec drawImage et dessine les textes par-dessus, dans sa langue.
//   const vid = layerVideo(canvas, id, { span });           // span = durée de la boucle (s), celle de la vidéo
//   draw(ctx, W, H, u, playing) { const uu = vid.active(playing, u) ? vid.u() : u; … vid.on ? drawImage(vid.el, …) : dessin }
//   vid.attach(anim2d(…), canvas);  vid.pause() dans stop()
// La vidéo n'est demandée que quand le canvas approche de l'écran, et seulement si le manifeste (layers/manifest.json,
// filtré par empreinte : prerender-manifest-lib.mjs) la déclare à jour. Sans manifeste, sans fichier, erreur de lecture,
// lecture refusée, pendant un export (l'export dessine lui-même, image par image) ou animations réduites (rien ne joue) :
// `on` reste faux et l'appelant dessine comme avant. Rien ne se passe hors navigateur (tests, banc de montage, pré-rendu).
export const LAYER_DIR = "/video/cards/layers/";
let manifest = null;
export function loadLayerManifest(fetchFn = globalThis.fetch) {
  if (import.meta.env?.DEV) manifest = null;    // en dev le serveur recalcule les empreintes à chaque demande
  manifest ??= Promise.resolve().then(() => fetchFn(LAYER_DIR + "manifest.json")).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return manifest;
}

const OFF = { on: false, el: null, active: () => false, u: () => 0, pause() {}, attach() {} };

export function layerVideo(canvas, id, { span }) {
  if (typeof document === "undefined" || typeof IntersectionObserver !== "function" || typeof fetch !== "function" || typeof HTMLVideoElement === "undefined") return { ...OFF };
  const st = { v: null, ready: false, failed: false, started: false, vis: false, loading: false, exporting: false };
  const me = { on: false, el: null };
  const load = async () => {
    const e = (await loadLayerManifest())[id]; if (!e?.file) return;
    const v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
    for (const a of ["muted", "playsinline", "loop"]) v.setAttribute(a, "");
    v.setAttribute("aria-hidden", "true"); v.tabIndex = -1;
    // hors du bloc de la figure (l'export prendrait la vidéo pour un média du bloc), invisible mais dans le document (iOS)
    v.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1";
    v.addEventListener("loadeddata", () => { st.ready = true; }, { once: true });
    v.addEventListener("error", () => { st.failed = true; me.on = false; });
    v.src = LAYER_DIR + e.file; document.body.appendChild(v); st.v = me.el = v;
  };
  new IntersectionObserver((es) => {
    st.vis = es.some((x) => x.isIntersecting);
    if (st.vis && !st.loading) { st.loading = true; load(); }
    if (!st.vis && st.v && !st.v.paused) st.v.pause();
  }, { rootMargin: "400px 0px" }).observe(canvas);
  /** Vrai si l'image de la vidéo doit être dessinée ; met la vidéo en lecture ou en pause selon `playing`. */
  me.active = (playing, u) => {
    const v = st.v;
    if (!v || !st.ready || st.failed || st.exporting || !(v.duration > 0)) return (me.on = false);
    if (playing) {
      if (!st.started) { st.started = true; try { v.currentTime = (u % 1) * v.duration; } catch { /* lecture depuis le début */ } }
      if (v.paused && st.vis) v.play()?.catch?.(() => { st.failed = true; me.on = false; });
      return (me.on = true);
    }
    if (!v.paused) v.pause();
    return (me.on = st.started);      // en pause : l'image arrêtée de la vidéo ; jamais lancée (animations réduites) : le dessin
  };
  me.u = () => (st.v && st.v.duration > 0 ? (st.v.currentTime / st.v.duration) % 1 : 0);
  me.pause = () => { if (st.v && !st.v.paused) st.v.pause(); };
  /** Branche l'export de l'animation (canvas.__anim) : pendant un export, la page redessine tout elle-même, image par image. */
  me.attach = (_anim, cv = canvas) => {
    const A = cv.__anim; if (!A) return;
    const { begin, end } = A;
    A.begin = function () { st.exporting = true; me.on = false; me.pause(); return begin.apply(this, arguments); };
    A.end = function () { st.exporting = false; return end.apply(this, arguments); };
  };
  return me;
}
