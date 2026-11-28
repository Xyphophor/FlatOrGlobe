// L'encadré d'un ajustement de rayon (2026-11-27, propriétaire : « sur chaque animation qui montre un calcul du rayon, un petit
// encadré toujours le même qui donne rayon, corrélation, scatter (+ χ²/ν), aux bords arrondis »). Quatre lignes, toujours les
// mêmes : R (et sa marge), r, la dispersion avec son unité, χ²/ν ou « — » quand aucune erreur de lecture n'est connue à part de
// l'ajustement (règle de l'onglet courbure). Deux versions : canvas (drawFitBox) et figure SVG FIG (figFitBox).
// Textes : src/i18n/<langue>/fitbox.json.
import { makeT } from "./i18n.js";

const lang0 = () => (typeof document !== "undefined" && document.documentElement.lang) || "en";
const T = () => { const t = makeT(lang0(), "fitbox"); return (k, fb) => { const v = t(k); return v && v !== k ? v : fb; }; };
/** r de Pearson de deux séries de même longueur. */
export function pearson(xs, ys) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let a = 0, b = 0, c = 0; for (let i = 0; i < n; i++) { a += (xs[i] - mx) * (ys[i] - my); b += (xs[i] - mx) ** 2; c += (ys[i] - my) ** 2; }
  return b && c ? a / Math.sqrt(b * c) : null;
}
export const fbNum = (x, d = 0) => (x == null ? "—" : !isFinite(x) ? "∞" : x.toLocaleString(lang0(), { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−"));

/**
 * Les quatre lignes de l'encadré.
 *   o.R : texte du rayon déjà formé (« 6 513 km ») ou nombre (km) ; o.range : texte de la marge (facultatif) ;
 *   o.r : corrélation, ou "na" quand le rayon ne sort pas d'une droite (sphère ajustée, maillage) ; o.scatter : texte de la dispersion avec son unité (« 26 min ») ; o.chi2nu : nombre ou null ;
 *   o.title : facultatif (« 90 routes »).
 */
export function fitBoxLines(o) {
  const tr = T();
  const R = typeof o.R === "number" ? `${fbNum(o.R)} km` : o.R ?? "—";
  return {
    title: o.title ?? null,
    big: `R = ${R}`,
    small: [
      o.range ? `${tr("fb-range", "range")} ${o.range}` : null,
      `${tr("fb-r", "correlation")} r${o.rOf ? ` (${o.rOf})` : ""} = ${o.r === "na" ? `— (${tr("fb-nl", "not a line")})` : o.r == null ? "—" : fbNum(o.r, 3)}`,   // "na" : l'ajustement n'est pas une droite
      `${tr("fb-scat", "scatter")} ${o.scatter ?? "—"}`,
      `χ²/ν = ${o.chi2nu == null ? "—" : fbNum(o.chi2nu, o.chi2nu >= 100 ? 0 : 2)}`,   // « — » : aucune erreur de lecture connue (le texte de la page le dit)
    ].filter(Boolean),
  };
}

/** La hauteur de l'encadré canvas (pour réserver sa place avant de le dessiner). */
export function fitBoxHeight(o) { const L = fitBoxLines(o), size = o.size ?? 11; return size * 0.6 * 1.6 + (L.title ? size * 1.3 : 0) + size * 1.45 * 1.15 + L.small.length * size * 1.3; }

function rounded(ctx, x, y, w, h, r) {
  const P = Math.PI;   // arc seulement : l'enregistreur des vidéos ne connaît pas arcTo
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -P / 2, 0); ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, P / 2); ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + h - r, r, P / 2, P); ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, P, 1.5 * P); ctx.closePath();
}

/**
 * L'encadré sur un canvas. (x, y) : coin haut gauche, ou haut droit si o.align === "right" (coin bas si o.valign === "bottom") ; o.col : couleur ; o.size : taille
 * du petit texte (11 par défaut) ; o.maxW : largeur maximale. Renvoie { w, h }.
 */
export function drawFitBox(ctx, x, y, o) {
  const L = fitBoxLines(o), size = o.size ?? 11, big = size * 1.45, pad = size * 0.6, col = o.col ?? "#1d4ed8";
  const font = (s, b) => `${b ? "700 " : ""}${s}px system-ui, sans-serif`;
  let w = 0;
  ctx.font = font(big, true); w = Math.max(w, ctx.measureText(L.big).width);
  ctx.font = font(size, false); for (const s of L.small) w = Math.max(w, ctx.measureText(s).width);
  if (L.title) { ctx.font = font(size, true); w = Math.max(w, ctx.measureText(L.title).width); }
  w = Math.min(o.maxW ?? Infinity, w + 2 * pad);
  const h = pad * 1.6 + (L.title ? size * 1.3 : 0) + big * 1.15 + L.small.length * size * 1.3;
  const x0 = o.align === "right" ? x - w : x;
  if (o.valign === "bottom") y -= h;   // (x, y) = coin bas
  ctx.save();
  rounded(ctx, x0, y, w, h, Math.min(8, h / 4));
  ctx.fillStyle = o.fill ?? "rgba(253,253,252,.94)"; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = col;
  let yy = y + pad;
  if (L.title) { yy += size; ctx.font = font(size, true); ctx.fillText(L.title, x0 + pad, yy); yy += size * 0.3; }
  yy += big; ctx.font = font(big, true); ctx.fillText(L.big, x0 + pad, yy, w - 2 * pad);
  ctx.font = font(size, false);
  for (const s of L.small) { yy += size * 1.3; ctx.fillText(s, x0 + pad, yy, w - 2 * pad); }
  ctx.restore();
  return { w, h };
}

/** L'encadré dans une figure FIG (SVG). (x, y) : coin haut gauche (ou haut droit, o.align = "right"). Largeur estimée. */
export function figFitBox(f, x, y, o) {
  const L = fitBoxLines(o), size = o.size ?? 9.5, big = size * 1.4, pad = size * 0.6, col = o.col ?? "#1d4ed8";
  const est = (s, k) => s.length * k * 0.56;
  const w = Math.max(est(L.big, big), ...L.small.map((s) => est(s, size)), L.title ? est(L.title, size) : 0) + 2 * pad;
  const h = pad * 1.6 + (L.title ? size * 1.3 : 0) + big * 1.15 + L.small.length * size * 1.3;
  const x0 = o.align === "right" ? x - w : x, r = Math.min(7, h / 4);
  if (o.valign === "bottom") y -= h;
  f.path(`M${x0 + r} ${y}H${x0 + w - r}A${r} ${r} 0 0 1 ${x0 + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x0 + w - r} ${y + h}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x0 + r} ${y}Z`,
    { c: col, w: 1.3, fill: o.fill ?? "#fdfdfc" });
  let yy = y + pad;
  if (L.title) { yy += size; f.note(x0 + pad, yy, L.title, { size, c: col }); yy += size * 0.3; }
  yy += big; f.note(x0 + pad, yy, L.big, { size: big, c: col });
  for (const s of L.small) { yy += size * 1.3; f.note(x0 + pad, yy, s, { size, c: col }); }
  return { w, h };
}
