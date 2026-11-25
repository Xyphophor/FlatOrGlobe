// Export des figures pour le partage (epic10, demande du propriétaire
// 2026-09-25) : une image (PNG, ou JPG pour les vues avec photo), une
// animation (MP4, GIF en option -- src/core/export-video.js), une carte de
// panneau (figure + légende -- UC04). Tout est REDESSINÉ en haute définition
// par la page elle-même, jamais capturé à l'écran ; un bandeau de crédit est
// ajouté SOUS le dessin, qui garde ses tampons (règle 1).
import { setRenderScale } from "./canvas.js";
import { figColor } from "./theme.js";

/** Formats proposés : null = la figure elle-même, en haute définition. */
export const FORMATS = {
  native: null,
  square: [1080, 1080],
  landscape: [1200, 675],
  portrait: [1080, 1350],
};

const PAPER = "#fbfaf7", INK = "#151a21", SOFT = "#5b6470";

/** Plus grand rectangle de rapport sw:sh contenu dans (x, y, W, H), centré. */
export function fitRect(sw, sh, x, y, W, H) {
  const k = Math.min(W / sw, H / sh), w = sw * k, h = sh * k;
  return { x: x + (W - w) / 2, y: y + (H - h) / 2, w, h, k };
}

/** Coupe `text` en lignes de largeur ≤ maxW (measure(s) → largeur). Un mot trop long reste seul sur sa ligne. */
export function wrapText(text, maxW, measure) {
  const out = [];
  for (const para of String(text).split(/\n/)) {
    let line = "";
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const t = line ? line + " " + w : w;
      if (line && measure(t) > maxW) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}

/** Date locale AAAA-MM-JJ (toISOString donnerait la date UTC : la veille, le soir en France). */
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Nom de fichier parlant : onglet, figure, format, date (AAAA-MM-JJ). */
export function fileName(tab, fig, format, ext, date = new Date()) {
  const slug = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const d = localDate(date);
  return [ "flat-or-globe", slug(tab), slug(fig), format === "native" || format === "hd" ? "" : format, d ].filter(Boolean).join("_") + "." + ext;
}

/**
 * Géométrie de la sortie : taille totale, zone du dessin, bandeau. Pure (testée).
 * `roH(W, w)` = hauteur à réserver pour les lectures d'une animation (largeur
 * de sortie W, largeur de la bande w) : elles ont leur propre bande, SOUS le
 * dessin et au-dessus du crédit (demande du propriétaire : le texte en bas,
 * avec le reste), jamais peinte sur le dessin (elle en masquait les titres).
 */
export function layout(format, figW, figH, roH = () => 0) {
  const F = FORMATS[format];
  if (!F) {                                              // la figure elle-même, ≥ 1080 px de large
    const W = Math.round(Math.max(1080, figW * 2)), k = W / figW, band = Math.round(W * 0.12);
    const top = Math.round(roH(W, W)), fh = Math.round(figH * k), H = fh + top + band;
    return { W: W + (W % 2), H: H + (H % 2), fig: { x: 0, y: 0, w: W, h: fh, k }, band: { y: H - band, h: band }, ro: { x: 0, y: fh, w: W, h: top } };
  }
  const [W, H] = F, band = Math.round(W * 0.12), pad = Math.round(W * 0.03);
  const top = Math.round(roH(W, W - 2 * pad));
  const fig = fitRect(figW, figH, pad, pad, W - 2 * pad, H - band - 2 * pad - top);
  return { W, H, fig, band: { y: H - band, h: band }, ro: { x: pad, y: fig.y + fig.h, w: W - 2 * pad, h: top } };
}

// ---- rendu ----
let activeRender = null, activeTab = null;
/** main.js enregistre ici l'onglet actif : son render() redessine toutes ses figures. */
export function setActiveTab(tab) { activeTab = tab; activeRender = tab ? () => tab.render() : null; }
/** Redessine l'onglet actif (à l'échelle de rendu courante). */
export function renderActive() { return activeRender?.(); }

/** Les éléments dessinés d'un bloc de figure : un seul canvas s'il est seul, sinon tous (grille). */
export function mediaOf(block) {
  const canvases = [...block.querySelectorAll("canvas")].filter((c) => !c.closest("[hidden]"));
  const videos = [...block.querySelectorAll("video")];
  if (canvases.length === 1 && !videos.length) return canvases;
  if (canvases.length || videos.length) return [...canvases, ...videos];
  const svg = block.querySelector("svg"); return svg ? [svg] : [];
}

/**
 * Un SVG sérialisé seul ne voit plus les variables CSS de la page : chaque var(--x[, repli]) de ses
 * attributs et styles est remplacée par la couleur de la palette CLAIRE des figures (propriétaire,
 * 2026-10-16 : exports clairs quel que soit le thème), sinon par la valeur calculée sur l'original
 * (dans un bloc de figure, donc claire), sinon par le repli ; sans rien de tout cela, l'attribut tombe, comme à l'écran.
 */
export function resolveVars(clone, orig) {
  const cs = orig && typeof getComputedStyle === "function" ? getComputedStyle(orig) : null;
  const val = (name, fb) => figColor(name, null) || cs?.getPropertyValue(name).trim() || (fb || "").trim() || null;
  for (const el of [clone, ...clone.querySelectorAll("*")]) {
    for (const a of [...el.attributes]) {
      if (!a.value.includes("var(")) continue;
      let lost = false;
      const v = a.value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, n, fb) => val(n, fb) ?? ((lost = true), ""));
      // variable inconnue sans repli : le navigateur ignore l'attribut, l'export aussi (--horizon de star, jamais défini)
      if (lost) el.removeAttribute(a.name); else el.setAttribute(a.name, v);
    }
  }
  return clone;
}

// px = pixels de sortie par px CSS : le SVG est rastérisé à SA taille finale (2026-10-07 ; à la taille
// d'écran puis agrandi ×2 ou plus, ses textes sortaient flous)
async function svgImage(svg, r = svg.getBoundingClientRect(), px = 1) {
  const clone = svg.cloneNode(true);
  if (!clone.getAttribute("viewBox") && r.width && r.height) clone.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
  clone.setAttribute("width", Math.round(r.width * px)); clone.setAttribute("height", Math.round(r.height * px));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  resolveVars(clone, svg);
  const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
  st.textContent = "text{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}";
  clone.insertBefore(st, clone.firstChild);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  try {
    const img = new Image(); img.src = url; await img.decode(); return img;
  } finally { URL.revokeObjectURL(url); }
}

/**
 * Dessine le bloc `block` dans ctx, sur le rectangle `dst` (pixels de sortie).
 * Les canvas sont REDESSINÉS à la bonne définition (échelle de rendu + render()
 * de l'onglet), copiés, puis la page revient à l'échelle 1.
 */
export async function drawBlock(ctx, block, dst, redraw = activeRender) {
  return drawMedia(ctx, mediaOf(block), dst, redraw);
}

/** Dessine une liste d'éléments (canvas, SVG, vidéo) dans dst, en gardant leur disposition relative à l'écran. */
// Export vidéo (2026-10-07) : l'échelle de rendu reste montée d'une image à l'autre -- la remettre à 1 après
// chaque image réallouait le canvas de la page deux fois par image (lent, et visible à l'écran)
let holdScale = false;
export function holdRenderScale(v) { holdScale = !!v; if (!holdScale) setRenderScale(1); }

export async function drawMedia(ctx, media, dst, redraw = activeRender, crop = null) {
  if (!media.length) return false;
  // une découpe (px CSS) d'un canvas seul : elle tient lieu de rectangle, et seule cette partie est copiée
  const cut = crop && media.length === 1 ? crop() : null;
  const r0 = media[0].getBoundingClientRect();
  const rects = cut ? [{ left: r0.left + cut.x, top: r0.top + cut.y, right: r0.left + cut.x + cut.w, bottom: r0.top + cut.y + cut.h, width: cut.w, height: cut.h }]
    : media.map((m) => m.getBoundingClientRect());
  const x0 = Math.min(...rects.map((r) => r.left)), y0 = Math.min(...rects.map((r) => r.top));
  const bw = Math.max(...rects.map((r) => r.right)) - x0, bh = Math.max(...rects.map((r) => r.bottom)) - y0;
  const k = dst.w / bw;
  const px = k * Math.abs(ctx.getTransform?.().a || 1);   // pixels réels par px CSS (densité ×2 d'une carte au format réseau)
  // où retrouver chaque élément si le redessin le REMPLACE (les figures SVG de
  // seis sont reconstruites à chaque render()) : son parent et son rang parmi
  // les frères de même balise -- un élément détaché mesure 0 × 0 (image vide)
  const where = media.map((m) => ({ p: m.parentElement, i: m.parentElement ? [...m.parentElement.children].filter((c) => c.tagName === m.tagName).indexOf(m) : -1 }));
  setRenderScale(px / ((window.devicePixelRatio) || 1));
  try {
    await redraw?.();                                    // redessin haute définition (render() de l'onglet, ou l'instant t d'une animation)
    const live = media.map((m, i) => m.isConnected ? m
      : [...(where[i].p?.children || [])].filter((c) => c.tagName === m.tagName)[where[i].i] || m);
    // les SVG sont sérialisés APRÈS le redessin : une animation SVG doit montrer l'instant t
    const svgs = await Promise.all(live.map((m, i) => (m.tagName.toLowerCase() === "svg" ? svgImage(m, rects[i], px) : null)));
    live.forEach((m, i) => {
      const r = rects[i], x = dst.x + (r.left - x0) * k, y = dst.y + (r.top - y0) * k;
      if (cut && m.tagName.toLowerCase() === "canvas") {
        const s = m.width / (r0.width || 1);                // px du canvas redessiné par px CSS
        ctx.drawImage(m, cut.x * s, cut.y * s, cut.w * s, cut.h * s, x, y, r.width * k, r.height * k);
      } else ctx.drawImage(svgs[i] || m, x, y, r.width * k, r.height * k);
    });
  } finally {
    if (!holdScale) setRenderScale(1);
    if (redraw === activeRender && !holdScale) activeRender?.();       // une animation exportée se remet en place elle-même (anim.end)
  }
  return true;
}

/** Animation du bloc (contrat epic10/UC02), s'il y en a une. */
export function blockAnim(block) {
  for (const c of block.querySelectorAll("canvas")) if (c.__anim) return c.__anim;
  return block.__anim || block.querySelector(".figsym")?.__anim || null;
}

/**
 * Lectures d'une animation (anim.readout() → texte), que la page affiche en
 * HTML au-dessus du dessin : redessinées dans un bandeau en haut de l'image
 * exportée, sinon la vidéo perdrait l'heure et les compteurs.
 */
/** Texte du bandeau : readout() de l'animation, sinon les lectures (.reads) du bloc. */
export function readoutOf(block, anim) {
  const t = anim?.readout?.() ?? [...block.querySelectorAll(".reads")].map((r) => r.textContent).join(" · ");
  return String(t || "").replace(/\s+/g, " ").trim();
}

// bandeau des lectures (2026-09-26, « plus joli ») : même famille et même gris que le crédit,
// pas de monospace gras ; séparateurs aérés
const roFont = (W) => Math.max(12, Math.round(W * 0.017));
const RO_FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const roText = (t) => String(t).replace(/\s*·\s*/g, "   ·   ");
function readoutLines(ctx, W, w, text, slack = 1) {
  const f = roFont(W), pad = Math.round(f * 0.9);
  ctx.font = `500 ${f}px ${RO_FONT}`;
  return { f, pad, lines: wrapText(roText(text), w * slack - 2 * pad, (s) => ctx.measureText(s).width) };
}

/** Hauteur de la bande de lectures (0 sans texte) ; 10 % de marge : les chiffres changent d'une image à l'autre, la bande non. */
export function readoutHeight(W, w, text) {
  if (!text) return 0;
  const { f, pad, lines } = readoutLines(document.createElement("canvas").getContext("2d"), W, w, text, 0.9);
  return Math.ceil(lines.length * f * 1.4 + pad * 1.1);
}

/** Lectures dans leur bande `rect` (réservée par layout / planCard), sur fond opaque, jamais au-delà. */
export function drawReadout(ctx, rect, W, text) {
  if (!text || !rect?.h) return;
  const { f, pad, lines } = readoutLines(ctx, W, rect.w, text);
  const max = Math.max(1, Math.floor((rect.h - pad) / (f * 1.4) + 1e-6));
  ctx.fillStyle = PAPER; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = "#e4e0d6"; ctx.fillRect(rect.x + pad, rect.y, rect.w - 2 * pad, Math.max(1, Math.round(f * 0.06)));   // filet fin, comme le crédit
  ctx.fillStyle = SOFT; ctx.textBaseline = "top"; ctx.textAlign = "left";
  lines.slice(0, max).forEach((l, i) => ctx.fillText(l, rect.x + pad, rect.y + pad * 0.55 + i * f * 1.4));
}

/**
 * Bandeau de crédit : site · onglet à gauche, adresse de la SECTION et date dessous, et à
 * droite un QR code de cette adresse (2026-10-04, propriétaire) quand info.qr est prêt.
 */
export function drawCredit(ctx, W, band, info) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, band.y, W, band.h);
  ctx.fillStyle = "#d7d3c8"; ctx.fillRect(0, band.y, W, Math.max(1, band.h * 0.03));
  // bande de 12 % de la largeur : 3 px au moins par module pour un QR de 33 modules à 1 080 px
  const m = Math.round(band.h * 0.08), q = info.qr ? band.h - 2 * m : 0;
  if (info.qr) {
    // le QR et sa marge blanche de 2 modules (la norme en demande 4 ; le fond clair autour fait le reste)
    const n = info.qr.n, cell = Math.floor(q / (n + 4)), size = cell * (n + 4), x0 = W - m - size, y0 = band.y + (band.h - size) / 2;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x0, y0, size, size);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (info.qr.dark[r * n + c]) ctx.fillRect(x0 + (c + 2) * cell, y0 + (r + 2) * cell, cell, cell);
  }
  const f = Math.round(band.h * 0.17), xr = W - m - (q ? q + m : 0);
  ctx.textBaseline = "middle";
  ctx.font = `600 ${f}px ui-sans-serif, system-ui, sans-serif`; ctx.fillStyle = INK; ctx.textAlign = "left";
  ctx.fillText(`${info.site} · ${info.tab}`, m * 4, band.y + band.h * 0.38);
  ctx.font = `${Math.round(f * 0.8)}px ui-monospace, Menlo, monospace`; ctx.fillStyle = SOFT;
  ctx.fillText(`${info.url} · ${info.date}`, m * 4, band.y + band.h * 0.66, Math.max(10, xr - m * 6));
}

/** Crédit d'une exportation : l'adresse est celle de la section (lien profond, src/core/nav.js) quand elle est connue. */
export function creditInfo(tabKey, tabLabel, sec = null) {
  const base = (typeof location !== "undefined" && location.origin !== "null") ? location.origin + location.pathname : "";
  const full = `${base}#tab-${tabKey}${sec ? `/${sec}` : ""}`;
  return { site: document.title || "Flat plane or Globe?", tab: tabLabel, url: full.replace(/^https?:\/\//, ""), link: full, date: localDate() };
}

/** Ajoute à un crédit le QR code de son adresse (bibliothèque chargée à la demande). */
export async function withQr(info) {
  if (!info?.link) return info;
  try {
    const { default: qrcode } = await import("qrcode-generator");
    const q = qrcode(0, "M"); q.addData(info.link); q.make();
    const n = q.getModuleCount(), dark = new Uint8Array(n * n);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dark[r * n + c] = q.isDark(r, c) ? 1 : 0;
    return { ...info, qr: { n, dark } };
  } catch { return info; }
}

/** La section d'un bloc : le dernier titre h2[data-sec] qui le précède dans son panneau. */
export function sectionOfBlock(block) {
  const panel = block.closest(".tabpanel") || document;
  let sec = null;
  for (const h of panel.querySelectorAll("h2[data-sec]")) {
    if (h.compareDocumentPosition(block) & 4) sec = h.dataset.sec; else break;   // 4 = DOCUMENT_POSITION_FOLLOWING
  }
  return sec;
}

/** Image d'un bloc de figure : canvas de sortie prêt à être enregistré. */
export async function renderImage(block, format, info) {
  const media = mediaOf(block); if (!media.length) return null;
  const rects = media.map((m) => m.getBoundingClientRect());
  const bw = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
  const bh = Math.max(...rects.map((r) => r.bottom)) - Math.min(...rects.map((r) => r.top));
  const an = blockAnim(block), ro = an ? readoutOf(block, an) : "";
  const L = layout(format, bw, bh, (W, w) => readoutHeight(W, w, ro));
  const d = FORMATS[format] ? 2 : 1;                 // format réseau : mêmes proportions, densité ×2 (2026-10-07)
  const out = document.createElement("canvas"); out.width = L.W * d; out.height = L.H * d;
  const ctx = out.getContext("2d"); ctx.scale(d, d);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, L.W, L.H);
  await drawBlock(ctx, block, L.fig);
  if (an) drawReadout(ctx, L.ro, L.W, readoutOf(block, an));
  drawCredit(ctx, L.W, L.band, info);
  return out;
}

export function save(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export async function exportImage(block, { format = "native", type = "png", info, figName }) {
  const c = await renderImage(block, format, info); if (!c) return;
  const mime = type === "jpg" ? "image/jpeg" : "image/png";
  const blob = await new Promise((res) => c.toBlob(res, mime, 0.92));
  save(blob, fileName(info.tab, figName, format, type === "jpg" ? "jpg" : "png"));
}
