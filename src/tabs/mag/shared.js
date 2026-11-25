// Helpers 3D/format partagés de l'onglet "mag" (magnétisme), portés à
// l'identique du legacy (flat-or-globe-2.20.0.html, ~L16712-16794 et
// ~L16725-16794 pour les helpers de scène).
//
// POINT DE RÉUTILISATION INTENTIONNEL (tasks/epic02/UC05.org) : ce fichier
// existe séparément de index.js/logic.js parce que le legacy documente,
// dans son en-tête (~L454), la règle "keep mag.js ABOVE sun.js/survey.js
// in the build" -- sun/twi/azim (UC06) et surv/ct (UC07) réutilisent ces
// six helpers TELS QUELS plutôt que de les dupliquer. N'ajoute rien ici
// qui soit spécifique à la physique du dipôle magnétique (ça reste dans
// ./logic.js) -- seulement la caméra 3D "mag-style", le format de nombre
// signé, et la projection radiale de latitude utilisées par plusieurs
// onglets.
//
// Adaptation par rapport au legacy (comportement inchangé, signature
// adaptée à l'architecture par module) : magOrbitInit prend directement
// l'élément <canvas> (chaque onglet interroge son propre container avec
// querySelector) plutôt qu'un id résolu par le $() global du legacy.

/** Distance pôle -> bord sur la carte azimutale équidistante = distance
 * pôle -> pôle le long du globe, km. Constante géométrique partagée par
 * toute scène qui projette une latitude magnétique sur ce disque. */
export const MAG_RKM = 20000;

/**
 * Rotation caméra orthographique d'une scène "mag-style" : contrairement à
 * la caméra partagée V3D (src/core/camera3d.js), celle-ci ajoute un angle
 * de spin animé au yaw -- state = { yaw, pitch, spin, spinning, drag, lx, ly }.
 */
export function magRot(C, p) {
  const y = C.yaw + C.spin;
  const cy = Math.cos(y), sy = Math.sin(y), cp = Math.cos(C.pitch), sp = Math.sin(C.pitch);
  const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, y1 = p[1];
  return [x1, y1 * cp - z1 * sp, y1 * sp + z1 * cp];
}

/**
 * Polyligne 3D déjà projetée (P = fonction de projection), avec option de
 * découpe (`cull`) des segments dont le point est au dos de la scène (test
 * sur la composante z projetée, comme path3 dans core/camera3d.js -- mais
 * ce fichier ne dépend pas de camera3d.js pour rester un point de reprise
 * autonome pour sun/surv qui ont leur propre caméra).
 */
export function magPoly(ctx, P, pts, color, w, dash, cull, alpha) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []);
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  let open = false; ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    const a = P(pts[i]), b = P(pts[i + 1]);
    if (cull && (a[2] < 0.02 || b[2] < 0.02)) { open = false; continue; }
    if (!open) { ctx.moveTo(a[0], a[1]); open = true; }
    ctx.lineTo(b[0], b[1]);
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
}

/**
 * Encadré-info (fond papier translucide + bordure) pour des lignes
 * annotées de couleur, ancré en haut à gauche d'une scène -- le "readout"
 * violet/rouge/gris qu'on voit sur les scènes globe/plat de mag, et que
 * sun/surv réutilisent pour leurs propres lectures.
 */
export function magPanelBox(ctx, lines, FS, LH) {
  ctx.font = `600 ${FS}px ui-monospace, Menlo, monospace`;
  let wMax = 0;
  lines.forEach(([, t]) => { if (t) wMax = Math.max(wMax, ctx.measureText(t).width); });
  const bx = 10, by = 8;
  ctx.fillStyle = "rgba(253,253,252,0.88)";
  ctx.fillRect(bx - 4, by - 4, wMax + 16, lines.length * LH + 10);
  ctx.strokeStyle = "#e5e0d6"; ctx.lineWidth = 1;
  ctx.strokeRect(bx - 4, by - 4, wMax + 16, lines.length * LH + 10);
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  lines.forEach(([col, txt], i) => {
    if (!txt) return;
    ctx.fillStyle = col;
    ctx.font = (col === "#7d848f" ? `${FS - 1}px` : `600 ${FS}px`) + " ui-monospace, Menlo, monospace";
    ctx.fillText(txt, bx, by + i * LH);
  });
}

/**
 * Orbite au pointeur d'une scène 3D "mag-style" : drag pour yaw/pitch,
 * relâche le pitch dans [-1.35, 1.45] comme le legacy. `redraw` est
 * rappelée à chaque mouvement en drag -- l'appelant décide quoi redessiner.
 */
export function magOrbitInit(canvas, C, redraw) {
  if (!canvas) return;
  canvas.classList.add("drag");   // glisser pour tourner : seul ce canvas bloque le défilement tactile (core/legacy.css)
  canvas.addEventListener("pointerdown", (e) => {
    C.drag = true; C.lx = e.clientX; C.ly = e.clientY; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!C.drag) return;
    C.yaw += (e.clientX - C.lx) * 0.008;
    C.pitch = Math.max(-1.35, Math.min(1.45, C.pitch + (e.clientY - C.ly) * 0.008));
    C.lx = e.clientX; C.ly = e.clientY;
    redraw();
  });
  ["pointerup", "pointercancel"].forEach((ev) => canvas.addEventListener(ev, () => { C.drag = false; }));
}

/** Distance sur la carte azimutale équidistante depuis le pôle magnétique
 * nord, en km, pour une latitude magnétique donnée (deg). Pure. */
export function magLat2r(lat) {
  return ((90 - lat) * MAG_RKM) / 180;
}

/** Formate un nombre signé "+NN" / "−NN" (signe moins typographique),
 * arrondi à l'entier -- utilisé partout où une latitude ou un angle de
 * dip doit afficher son signe explicitement (jamais implicite via "-0"). */
export function magSgn(v) {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(0);
}
