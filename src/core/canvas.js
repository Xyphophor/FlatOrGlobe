// Helpers canvas partagés, portés à l'identique du legacy (~L14249).
import { fillTextSub, measureSub } from "./subscript.js";

/**
 * Dimensionne un <canvas> à sa taille CSS réelle * devicePixelRatio, et
 * renvoie un contexte 2D déjà mis à l'échelle. `canvas.dataset.drawnW`
 * distingue "jamais dessiné" (garde la taille par défaut 300x150 du HTML)
 * de "dessiné dans un onglet masqué" (largeur CSS nulle) -- les deux sont
 * inutilisables mais pour des raisons différentes ; voir le commentaire
 * d'origine dans CLAUDE.md / le fichier legacy.
 */
// Échelle de rendu supplémentaire, 1 à l'écran ; l'export (src/core/export.js,
// epic10) la monte le temps de redessiner une figure en haute définition.
let renderScale = 1;
export function setRenderScale(s) { renderScale = s > 0 ? s : 1; }
/** Pixels réels par pixel CSS : celui de l'écran (plafonné à `cap`) × l'échelle d'export. */
export function pixelRatio(cap = Infinity) {
  return Math.min(cap, (typeof window !== "undefined" && window.devicePixelRatio) || 1) * renderScale;
}

export function setupCanvas(canvas) {
  const dpr = pixelRatio();
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.dataset.drawnW = String(Math.round(rect.width));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: rect.width, H: rect.height };
}

/** Arrondit `raw` à un pas d'axe "agréable" (1/2/5/10 x une puissance de 10). */
export function niceLen(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * p;
}

/**
 * fillText qui tient dans maxW (2026-10-04, passage téléphone : un canvas ne revient pas à la
 * ligne, et à ~314 px de large les légendes d'une ligne en sortaient). Si le texte est trop large,
 * il est coupé d'abord aux séparateurs « · » et « — », puis aux espaces. dir = -1 : les lignes
 * s'empilent vers le haut à partir de y (légende posée en bas du canvas) ; +1 : vers le bas.
 * Renvoie le nombre de lignes.
 */
export function fillTextFit(ctx, text, x, y, maxW, { lineH = 13, dir = 1 } = {}) {
  const s = String(text), fits = (t) => measureSub(ctx, t) <= maxW;
  if (fits(s)) { fillTextSub(ctx, s, x, y); return 1; }
  const lines = [];
  let cur = "";
  for (const part of s.split(/(?<= [·—]) /)) {          // « a · b — c » → « a · », « b — », « c »
    const t = cur + part;
    if (cur && !fits(t.replace(/ [·—]$/, ""))) { lines.push(cur); cur = part; } else cur = t;
  }
  lines.push(cur);
  const out = [];
  for (const l of lines.map((l) => l.replace(/ [·—]$/, ""))) {   // un morceau encore trop large : coupé aux espaces
    if (fits(l)) { out.push(l); continue; }
    let line = "";
    for (const w of l.split(" ")) { const t = line ? line + " " + w : w; if (line && !fits(t)) { out.push(line); line = w; } else line = t; }
    out.push(line);
  }
  const n = out.length;
  out.forEach((l, i) => fillTextSub(ctx, l, x, dir < 0 ? y - (n - 1 - i) * lineH : y + i * lineH));
  return n;
}
