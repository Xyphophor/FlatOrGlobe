// Carte autonome (epic11) : titre, figure(s), texte écrit pour être lu hors de
// la page, verdict (règle 5), sources en toutes lettres (règle 8), crédit.
// Deux longueurs : « mini » (2-3 phrases, sans verdict) et « card » (un
// paragraphe + le verdict). Les textes viennent de src/i18n/<langue>/
// <onglet>-cards.json via core/cards.js -- jamais de la légende de la page,
// qui renvoie à ce qui l'entoure. Une carte d'ensemble compose plusieurs
// figures de blocs différents côte à côte, chacune avec son étiquette.
import { drawMedia, drawCredit, drawReadout, readoutHeight, renderActive, fileName, save, wrapText, mediaOf, FORMATS } from "./export.js";
import { cardText, figRef } from "./cards.js";
import { paragraphs } from "./paragraphs.js";
import { texBox, plainBox } from "./tex-canvas.js";
import { fillTextSub } from "./subscript.js";

// Rythme du texte (2026-10-16, « trop compact ») : interligne 1,55, paragraphes séparés d'une demi-ligne, blocs plus espacés.
const LH = 1.55, PG = 0.75, GAP_V = 0.9, GAP_S = 1.1, SLH = 1.5;
const PAPER = "#fbfaf7", INK = "#151a21", SOFT = "#5b6470", ACCENT = "#9a3412",
  MONO = "ui-monospace, Menlo, monospace",
  SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Référence de figure d'une carte : « id », ou « id@variante » quand la page
 * fait choisir entre deux modèles pour la même figure (twi : plan en 1/r² ou
 * ajusté ; dist : carte plate polaire ou cartésienne). Une vidéo ne laisse pas
 * choisir : la carte montre alors chaque variante, redessinée au même instant.
 * La figure porte le contrat __variant = { get(), set(v) } (set redessine).
 * « id#découpe » : une partie d'un canvas, __crop(nom) → {x, y, w, h} en px CSS.
 */
function cropOf(ref) {
  const { id, crop } = figRef(ref), el = crop && document.getElementById(id);
  return el?.__crop ? () => el.__crop(crop) : null;
}
function variantOf(id) {
  const el = document.getElementById(id); if (!el) return null;
  return el.__variant || mediaOf(el).find((m) => m.__variant)?.__variant || null;
}

/** Les éléments dessinés d'une figure désignée par son id (canvas/svg/vidéo, ou hôte .figsym/.fig). */
function mediaById(ref) {
  const el = document.getElementById(figRef(ref).id); if (!el) return [];
  return el.matches("canvas, svg, video") ? [el] : mediaOf(el);
}
/** Lecture de la page (ex. l'événement choisi) : texte des enfants, séparés par « · ». */
export function readsText(ids = []) {
  return ids.map((id) => {
    const el = document.getElementById(id); if (!el) return "";
    if (el.tagName === "INPUT") return String(el.value || "").trim();   // un champ date/heure de la page
    // du texte courant avec quelques <b> dedans : tout le texte, pas seulement les gras
    if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return el.textContent.replace(/\s+/g, " ").trim();
    if (el.tagName === "SELECT") {                     // un choix de la page : l'option retenue
      const o = el.options?.[el.selectedIndex] || el.querySelector("option[selected]") || el.querySelector("option");
      return (o?.textContent || "").replace(/\s+/g, " ").trim();
    }
    const parts = [...el.children].map((c) => c.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    return parts.length ? parts.join(" · ") : el.textContent.replace(/\s+/g, " ").trim();
  }).filter(Boolean).join(" · ");
}
function boxOf(media, crop) {
  if (crop && media.length === 1) { const c = crop(); return { w: c.w, h: c.h }; }
  const rs = media.map((m) => m.getBoundingClientRect());
  const x0 = Math.min(...rs.map((r) => r.left)), y0 = Math.min(...rs.map((r) => r.top));
  return { w: Math.max(...rs.map((r) => r.right)) - x0, h: Math.max(...rs.map((r) => r.bottom)) - y0 };
}

/**
 * Mise en page pure (testée) des figures d'une carte dans maxW × maxH :
 * en rangée (hauteur commune) ou en colonne (largeur commune), celle qui
 * donne les plus grandes figures ; `lab` = hauteur réservée à l'étiquette
 * au-dessus de chaque figure, `gap` = écart en pixels. maxH = Infinity →
 * rangée. Renvoie { w, h, cells: [{x, y, w, h}] } (cellule = la figure,
 * son étiquette est juste au-dessus). `side` : la première figure à gauche
 * sur toute la hauteur, les autres empilées à droite (twi : un globe, deux plans) ;
 * `col` : toujours en colonne (paysages d'elev : trois vues larges, l'une sous l'autre) ;
 * `rows` : [n1, n2, …] figures par rangée, chaque rangée à hauteur commune sur toute la
 *   largeur, les rangées empilées (mag : les trois cartes, puis les boussoles dessous).
 */
export function arrange(boxes, maxW, maxH, { gap = 0, lab = 0, side = false, col: forceCol = false, rows = null } = {}) {
  if (side && boxes.length > 1) return arrangeSide(boxes, maxW, maxH, { gap, lab });
  if (rows && rows.length > 1) return arrangeRows(boxes, maxW, maxH, { gap, lab, rows });
  const n = boxes.length, ws = boxes.map((b) => b.w / b.h);
  const sumW = ws.reduce((a, b) => a + b, 0), sumInv = ws.reduce((a, b) => a + 1 / b, 0);
  const hRow = Math.max(0, Math.min((maxW - gap * (n - 1)) / sumW, maxH - lab));
  const wCol = Math.max(0, Math.min(maxW, (maxH - n * lab - gap * (n - 1)) / sumInv));
  const wColAny = Number.isFinite(maxH) ? wCol : maxW;   // colonne imposée sans hauteur fixée : pleine largeur
  const col = n > 1 && (forceCol || (Number.isFinite(maxH) && wCol * wCol * sumInv > hRow * hRow * sumW));
  if (col && forceCol && !Number.isFinite(maxH)) {
    const cells = []; let y = 0;
    for (const r of ws) { y += lab; cells.push({ x: 0, y, w: wColAny, h: wColAny / r }); y += wColAny / r + gap; }
    return { w: wColAny, h: y - gap, cells, col: true };
  }
  const cells = []; let x = 0, y = 0;
  if (col) {
    for (const r of ws) { y += lab; cells.push({ x: 0, y, w: wCol, h: wCol / r }); y += wCol / r + gap; }
    return { w: wCol, h: y - gap, cells, col };
  }
  for (const r of ws) { cells.push({ x, y: lab, w: hRow * r, h: hRow }); x += hRow * r + gap; }
  return { w: x - gap, h: hRow + lab, cells, col };
}

/** Disposition « rows » : chaque rangée à hauteur commune sur toute la largeur ; réduite d'un même facteur si maxH l'exige. */
function arrangeRows(boxes, maxW, maxH, { gap, lab, rows }) {
  const groups = []; let i = 0;
  for (const n of rows) { groups.push(boxes.slice(i, i + n).map((b, k) => ({ b, k: i + k }))); i += n; }
  const hs = groups.map((g) => (maxW - gap * (g.length - 1)) / g.reduce((s, x) => s + x.b.w / x.b.h, 0));
  let s = 1;
  if (Number.isFinite(maxH)) s = Math.min(1, (maxH - groups.length * lab - gap * (groups.length - 1)) / hs.reduce((a, b) => a + b, 0));
  const cells = new Array(boxes.length); let y = 0, W = 0;
  const widths = groups.map((g, r) => g.reduce((acc, x) => acc + hs[r] * s * x.b.w / x.b.h, 0) + gap * (g.length - 1));
  W = Math.max(...widths);
  groups.forEach((g, r) => {
    y += lab; let x = (W - widths[r]) / 2; const h = hs[r] * s;
    for (const { b, k } of g) { const w = h * b.w / b.h; cells[k] = { x, y, w, h }; x += w + gap; }
    y += h + gap;
  });
  return { w: W, h: y - gap, cells, col: false };
}

/** Disposition « side » : hauteur commune à gauche = pile de droite ; résolue en largeur de colonne wR. */
function arrangeSide(boxes, maxW, maxH, { gap, lab }) {
  const [b0, ...rest] = boxes, a0 = b0.w / b0.h, n = boxes.length;
  const inv = rest.reduce((s, b) => s + b.h / b.w, 0);          // Σ 1/aᵢ de la pile
  const extra = (n - 2) * (lab + gap);                            // étiquettes et écarts de la pile, moins une étiquette
  let wR = (maxW - gap - a0 * extra) / (a0 * inv + 1);
  if (Number.isFinite(maxH)) wR = Math.min(wR, (maxH - (n - 1) * lab - (n - 2) * gap) / inv);
  wR = Math.max(0, wR);
  const HR = wR * inv + (n - 1) * lab + (n - 2) * gap, h0 = HR - lab, w0 = a0 * h0;
  const cells = [{ x: 0, y: lab, w: w0, h: h0 }];
  let y = 0;
  for (const b of rest) { y += lab; cells.push({ x: w0 + gap, y, w: wR, h: wR * b.h / b.w }); y += wR * b.h / b.w + gap; }
  return { w: w0 + gap + wR, h: HR, cells, col: false, side: true };
}

/** Animation d'une figure (contrat epic10/UC02) : sur un canvas, l'hôte .figsym ou le bloc .fig. */
function animOfMedia(m) { return m.__anim || m.closest?.(".figsym")?.__anim || m.closest?.(".fig, .figopen")?.__anim || null; }

/**
 * Animation d'une carte : celles de ses figures, jouées ensemble (une seule
 * si elles la partagent, comme les deux vues 3D de cnav). null = carte fixe.
 */
export function cardAnim(card) {
  const set = new Set();
  for (const id of card.figs) for (const m of mediaById(id)) { const a = animOfMedia(m); if (a) set.add(a); }
  const all = [...set];
  if (all.length <= 1) return all[0] || null;
  return {
    duration: Math.max(...all.map((a) => a.duration)),
    begin() { all.forEach((a) => a.begin?.()); },
    frameAt(t) { return Promise.all(all.map((a) => a.frameAt(t))); },
    end() { all.forEach((a) => a.end?.()); },
    readout() { return all.map((a) => a.readout?.() || "").filter(Boolean).join(" · "); },
  };
}

/**
 * Mise en page d'une carte : { W, H, anim, paint(ctx, t?) }. paint dessine la
 * carte entière ; t donné = l'instant t de l'animation (export vidéo, epic11),
 * sinon l'état courant de la page. `len` = "mini" | "card". `video` : une
 * bande est réservée entre le titre et les figures pour les lectures de
 * l'animation (peintes là, jamais sur le dessin).
 */
// Netteté (2026-10-07, propriétaire : « sur les grosses images c'est illisible ») : en taille libre, la
// carte s'élargit jusqu'à ce que CHAQUE figure y soit au moins au double de sa taille à l'écran, comme
// l'export d'une figure seule (1200 px fixes réduisaient une carte de 3 à 7 figures sous l'écran, ses
// textes de 10 px tombaient à 5) ; plafond 4800 px et 16 Mpx. Les formats réseau gardent leurs dimensions, l'image
// PNG est alors rendue en densité ×2 (exportCard).
/**
 * Les formules d'une carte (`fx` : clés `k` des blocs formule de la page, ou id de leur figure), lues dans la page : le TeX de
 * chaque ligne (data-tex), ou son texte Unicode. 2026-10-17, propriétaire : une animation qui explique une formule montre
 * cette formule dans sa carte, entre l'animation et l'explication.
 */
export function cardFormulas(card, doc = document) {
  const out = [];
  for (const r of card.fx || []) {
    const [ref, only] = r.split("#");                 // « clé#2 » : la deuxième ligne seulement
    const el = doc.querySelector(`.formula[data-k="${ref}"]`) || doc.getElementById(ref)?.closest(".formula");
    if (!el) continue;
    [...el.querySelectorAll(".big > .ln")].forEach((ln, i) => {
      if (only && i + 1 !== +only) return;
      const sp = ln.querySelector("span[data-tex]"), d = doc.createElement("div");
      d.innerHTML = sp ? (sp.getAttribute("data-tex-fallback") || sp.innerHTML) : ln.innerHTML;
      const text = d.textContent.replace(/\s+/g, " ").trim();
      if (!sp && text.length > 50) return;            // une phrase d'explication sans TeX : elle reste dans la page
      // plusieurs morceaux TeX sur la ligne (sun : « Δt = D/c ⇒ 1 au ≈ … ») : recollés, le texte entre eux traduit
      const spans = [...ln.querySelectorAll("span[data-tex]")];
      let tex = sp?.getAttribute("data-tex") || null;
      if (spans.length > 1) {
        const SEP = { "⇒": "\\;\\Rightarrow\\;", "⇔": "\\;\\Leftrightarrow\\;", "→": "\\;\\to\\;", ",": ",\\quad", "=": "=", "≈": "\\approx" };
        tex = spans.map((x, j) => {
          if (!j) return x.getAttribute("data-tex");
          let between = ""; for (let n = spans[j - 1].nextSibling; n && n !== x; n = n.nextSibling) between += n.textContent;
          between = between.replace(/\s+/g, "").trim();
          return (between in SEP ? SEP[between] : "\\quad") + " " + x.getAttribute("data-tex");
        }).join(" ");
      }
      out.push({ tex, text, flat: el.classList.contains("flat") });
    });
  }
  return out;
}

/**
 * Les illustrations des formules d'une carte (2026-10-19, propriétaire : « en plus des formules brutes, les illustrations
 * associées ») : le SVG de la figure (.figsym) de chaque bloc formule de `fx`, une fois chacune, avec ses proportions.
 */
export function cardFormulaFigs(card, doc = document) {
  const out = [];
  if (card.fxFigs === false) return out;   // 2026-10-25 (phys) : les figures des formules sont déjà les figures de la carte
  for (const r of card.fx || []) {
    const ref = r.split("#")[0];
    const el = doc.querySelector(`.formula[data-k="${ref}"]`) || doc.getElementById(ref)?.closest(".formula");
    const svg = el?.querySelector(".figsym svg");
    if (!svg || out.some((o) => o.svg === svg)) continue;
    const vb = (svg.getAttribute("viewBox") || "").split(/\s+/).map(Number);
    const w = vb[2] || svg.getBoundingClientRect().width || 380, h = vb[3] || svg.getBoundingClientRect().height || 220;
    out.push({ svg, id: el.querySelector(".figsym").id, ar: h / w });
  }
  return out;
}

const CARD_MIN_K = 2, CARD_MAX_W = 4800, CARD_MAX_PX = 16e6;
// Format « hd » (2026-10-23, propriétaire : un format par carte, adapté à ce qu'elle montre, au lieu de quatre) : la carte en
// taille libre à 1080 de large ; si elle sort de 9:16…16:9 (ce que X et les téléphones affichent), elle est recalculée à la
// borne (texte réduit, puis disposition côte à côte pour plusieurs figures), sans dépasser 1:2. X limite les vidéos à
// 1920 px de côté et entre 1:3 et 3:1 (docs.x.com, media best practices) : le grand côté est porté à HD_LONG à l'encodage.
export const HD_LONG = 1920, HD_W = 1080, HD_MIN = 9 / 16, HD_MAX = 16 / 9, HD_HARD = 2;
/**
 * Dimensions de sortie (paires) d'une carte planifiée : dans un cadre 1920 × 1080 (ou 1080 × 1920), grand côté = `long` si
 * le petit le permet. Au-delà, H.264 passe au niveau 5 (adl-mini en 1294 × 1920, 2026-10-24) : le niveau 4.0 est sûr pour X.
 */
export function hdSize(P, long = HD_LONG, short = HD_W) {
  const s = Math.min(long / Math.max(P.W, P.H), short / Math.min(P.W, P.H)), even = (v) => Math.round(v * s / 2) * 2;
  return { W: even(P.W), H: even(P.H) };
}
function planHd(card, opts) {
  const free = planCardAt(card, { ...opts, format: "free" }, HD_W);
  if (!free) return null;
  const r = free.H / free.W;
  if (r >= HD_MIN && r <= HD_MAX) return free;
  const at = (ratio, side) => planCardAt(card, { ...opts, format: "free" }, HD_W, Math.round(HD_W * ratio), side);
  if (r < HD_MIN) return at(HD_MIN);
  let P = at(HD_MAX);
  if (P.H / P.W > HD_MAX && card.figs.length > 1 && card.layout !== "side") { const Q = at(HD_MAX, true); if (Q.H < P.H) P = Q; }
  return P.H / P.W > HD_HARD ? at(HD_HARD) : P;
}
export function planCard(card, opts) {
  if (opts.format === "hd") return planHd(card, opts);
  const P = planCardAt(card, opts);
  if (!P || FORMATS[opts.format] || P.kmin >= CARD_MIN_K) return P;
  const Q = planCardAt(card, opts, Math.min(CARD_MAX_W, Math.ceil(P.W * CARD_MIN_K / P.kmin)));
  // au plus 16 Mpx : au-delà Safari (iPhone) rend un canvas vide ; la mise en page est proportionnelle à W
  return Q.W * Q.H <= CARD_MAX_PX ? Q : planCardAt(card, opts, Math.max(P.W, Math.floor(Q.W * Math.sqrt(CARD_MAX_PX / (Q.W * Q.H)))));
}

function planCardAt(card, { len, format, info, tabKey, lang, video = false }, Wfree = null, Hfixed = null, sideOver = false) {
  const figIds = card.figs.filter((id) => mediaById(id).length);
  const groups = figIds.map(mediaById);             // pour la mise en page ; au dessin, chaque figure est RE-cherchée par son id :
  if (!groups.length) return null;                   // le redessin de l'une peut remplacer le SVG de l'autre (seis)
  const anim = cardAnim(card);
  // en vidéo, une figure sans animation est dessinée UNE fois puis recopiée (2026-10-07 : redessiner et
  // re-sérialiser ses SVG à chaque image rendait l'export d'une carte très lent)
  const still = groups.map((m) => !m.some(animOfMedia)), stillCache = new Map();
  const T = cardText(tabKey, card, lang);
  const mini = len === "mini";
  const body = mini ? T.mini : T.text;
  const verdict = mini ? "" : T.verdict;
  const boxes = groups.map((m, i) => boxOf(m, cropOf(figIds[i])));
  const probe = document.createElement("canvas").getContext("2d");
  const labelled = T.labels.length === groups.length;
  const raw = readsText(card.reads);                // lectures de la page qui disent QUEL cas est montré
  const reads = raw && T.readsLabel ? `${T.readsLabel} ${raw}` : raw;   // « <id>.reads » : libellé d'une lecture nue
  const FX = cardFormulas(card), FXF = cardFormulaFigs(card);

  // largeur : format réseau, sinon 1200 ; hauteur : fixée par le format, sinon ce qu'il faut
  const W = FORMATS[format]?.[0] || Wfree || 1200, pad = Math.round(W * 0.045), band = Math.round(W * 0.12);
  const fixedH = FORMATS[format]?.[1] || Hfixed;
  const lay = (fs) => {
    const wrap = (s, f) => { probe.font = f; return s ? wrapText(s, W - 2 * pad, (x) => probe.measureText(x).width) : []; };
    const titleF = `700 ${Math.round(fs * 1.45)}px ${SANS}`;
    const L = {
      fs, titleF,
      title: wrap(T.title, titleF),
      body: paragraphs(body).flatMap((p, i) => [...(i ? [null] : []), ...wrap(p, `${fs}px ${SANS}`)]),   // null = séparation de paragraphes
      verdict: wrap(verdict, `italic ${fs}px ${SANS}`),
      reads: wrap(reads, `600 ${Math.round(fs * 0.7)}px ${MONO}`),
      src: mini ? wrap(T.sources.join("  "), `${Math.round(fs * 0.62)}px ${SANS}`)
        : T.sources.flatMap((s) => wrap(s, `${Math.round(fs * 0.68)}px ${SANS}`)),
    };
    const sfs = Math.round(fs * (mini ? 0.62 : 0.68));
    L.sfs = sfs; L.lab = labelled ? Math.round(fs * 0.8) : 0;
    L.fig = { gap: Math.round(fs * 0.8), lab: L.lab * 1.4, side: sideOver || card.layout === "side", col: !sideOver && card.layout === "col", rows: card.rows || null };
    L.titleH = L.title.length * fs * 1.45 * 1.2;
    // les formules : une ligne chacune, réduite si elle dépasse la largeur ; leur bande entre les figures et le texte
    const xfs = Math.round(fs * (mini ? 1.05 : 1.3)), maxW = (W - 2 * pad) * 0.92;
    const mk = (f, z) => { try { if (f.tex) return texBox(probe, f.tex, z, f.flat ? ACCENT : INK); } catch { /* repli : le texte de la page */ } return plainBox(probe, f.text, z, f.flat ? ACCENT : INK); };
    L.fx = FX.map((f) => { let b = mk(f, xfs); if (b.w > maxW) b = mk(f, Math.max(8, Math.floor(xfs * maxW / b.w))); return b; });
    L.fxGap = Math.round(fs * 0.55); L.fxPad = Math.round(fs * 0.8);
    // les illustrations, en rangée sous les formules : chacune au plus la moitié de la largeur et deux fois sa taille d'origine
    const fw = W - 2 * pad - 2 * L.fxPad, gapF = Math.round(fs * 0.8);
    L.fxFigW = FXF.length ? Math.min(fw * (FXF.length > 1 ? 1 : 0.6), (fw - gapF * (FXF.length - 1))) / FXF.length : 0;
    L.fxFigW = Math.min(L.fxFigW, 760); L.fxFigGap = gapF;
    // format fixe : l'illustration ne prend pas plus d'un cinquième de la hauteur de la carte (le dessin animé reste le principal)
    if (fixedH && FXF.length) L.fxFigW = Math.min(L.fxFigW, (0.2 * fixedH) / Math.max(...FXF.map((f) => f.ar)));
    L.fxFigH = FXF.length ? Math.max(...FXF.map((f) => f.ar)) * L.fxFigW : 0;
    const linesH = L.fx.reduce((h, b) => h + b.a + b.d, 0) + Math.max(0, L.fx.length - 1) * L.fxGap;
    L.fxH = L.fx.length || FXF.length ? linesH + (FXF.length ? (L.fx.length ? L.fxGap * 1.5 : 0) + L.fxFigH : 0) + 2 * L.fxPad + pad * 0.6 : 0;
    L.rfs = Math.round(fs * 0.7);
    const nGap = L.body.filter((l) => l === null).length;
    L.textH = (L.reads.length ? L.reads.length * L.rfs * 1.35 + fs * 0.5 : 0) + (L.body.length - nGap) * fs * LH + nGap * fs * PG + (L.verdict.length ? fs * GAP_V + L.verdict.length * fs * LH : 0) +
      (L.src.length ? fs * GAP_S + L.src.length * sfs * SLH : 0);
    return L;
  };
  const figW = W - 2 * pad;
  const roH = video && anim?.readout ? readoutHeight(W, figW, anim.readout() || "") : 0;
  let L = lay(Math.round(W * (mini ? 0.03 : 0.021))), H, A;
  // fxAt : la bande des formules entre les figures (avant la figure n° fxAt, ex. animation → formule → graphique des résultats)
  const fxIn = (L) => card.fxAt > 0 && card.fxAt < groups.length && L.fxH > 0;
  const chrome = (L) => pad + L.titleH + pad * 0.6 + (roH ? roH + pad * 0.3 : 0) + (fxIn(L) ? 0 : L.fxH) + pad * 0.8 + L.textH + pad + band;
  if (fixedH) {                                         // format fixe : le texte rétrécit jusqu'à laisser ≥ 35 % au dessin, sans passer sous 1,55 % de la largeur ;
    const minFs = Math.round(W * 0.0155);               // en dessous, c'est la carte qui s'allonge (2026-10-16 : « quitte à avoir des cartes plus grandes »)
    const fxS = (L) => (fxIn(L) ? L.fxH + pad * 0.3 : 0);   // la bande entre les figures prend sa place sur leur hauteur
    while (L.fs > minFs && fixedH - chrome(L) - fxS(L) < 0.35 * fixedH) L = lay(L.fs - 1);
    H = Math.max(fixedH, Math.round(chrome(L) + fxS(L) + 0.35 * fixedH)); A = arrange(boxes, figW, Math.max(0.2 * H, H - chrome(L) - fxS(L)), L.fig);
  } else { A = arrange(boxes, figW, Infinity, L.fig); H = Math.round(chrome(L) + A.h); }
  let fxY = null;                                       // haut de la bande des formules, par rapport au haut des figures
  if (fxIn(L)) {
    const sh = L.fxH + pad * 0.3, cut = Math.min(...A.cells.slice(card.fxAt).map((c) => c.y));
    A.cells.forEach((c, i) => { if (i >= card.fxAt) c.y += sh; });
    A.h += sh; if (!fixedH) H += Math.round(sh); fxY = cut;
  }
  H += H % 2;
  const figH = A.h;

  const paint = async (ctx, t) => {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "top"; ctx.textAlign = "left";
    let y = pad + Math.max(0, (H - chrome(L) - figH) / 2);   // format fixe : le surplus se partage haut/bas
    ctx.fillStyle = INK; ctx.font = L.titleF;
    for (const l of L.title) { ctx.fillText(l, pad, y); y += L.fs * 1.45 * 1.2; }
    y += pad * 0.6;

    const restore = [];
    // figures : rangée ou colonne (arrange), centrées, étiquette au-dessus de chacune
    const x0 = (W - A.w) / 2;
    for (let i = 0; i < groups.length; i++) {
      const c = A.cells[i];
      if (labelled) {
        ctx.fillStyle = SOFT; ctx.font = `600 ${L.lab}px ${SANS}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(T.labels[i], x0 + c.x + c.w / 2, y + c.y - L.lab * 0.25); ctx.textAlign = "left"; ctx.textBaseline = "top";
      }
      const { id, v } = figRef(figIds[i]), V = v != null ? variantOf(id) : null;
      if (t != null && !V && still[i] && anim) {
        let img = stillCache.get(i);
        if (!img) {
          const a = Math.abs(ctx.getTransform().a) || 1;
          img = document.createElement("canvas"); img.width = Math.ceil(c.w * a); img.height = Math.ceil(c.h * a);
          const ic = img.getContext("2d"); ic.scale(a, a);
          await drawMedia(ic, mediaById(figIds[i]), { x: 0, y: 0, w: c.w, h: c.h }, undefined, cropOf(figIds[i]));   // un canvas fixe : render() de l'onglet, une fois
          stillCache.set(i, img);
        }
        ctx.drawImage(img, x0 + c.x, y + c.y, c.w, c.h);
        continue;
      }
      if (V) restore.push(V);
      const redraw = !V ? (t == null ? undefined : () => anim.frameAt(t))
        : async () => { if (t == null) await renderActive(); else await anim.frameAt(t); V.v0 ??= V.get(); V.set(v); };
      await drawMedia(ctx, mediaById(figIds[i]), { x: x0 + c.x, y: y + c.y, w: c.w, h: c.h }, redraw, cropOf(figIds[i]));
    }
    const yFig = y;
    y += figH;
    // lectures de l'animation (vidéo) : leur bande SOUS les figures, avec le reste du texte. Une carte d'UNE variante (« @PA50 ») les
    // lit dans cette variante, avant que la page revienne au modèle choisi (2026-10-19 : omo et pa50 d'avia affichaient le tour
    // sélectionné dans la page) ; une carte de plusieurs variantes côte à côte (gc : trois modèles) garde celles de la page.
    const oneV = new Set(figIds.map((f) => figRef(f).v).filter((v) => v != null)).size === 1;
    const back = () => { for (const V of new Set(restore)) { if (V.v0 != null) V.set(V.v0); delete V.v0; } };   // la page revient au modèle choisi
    if (!oneV) back();
    if (t != null && roH) { drawReadout(ctx, { x: pad, y: y + pad * 0.3, w: figW, h: roH }, W, anim.readout?.() || ""); y += roH + pad * 0.3; }
    if (oneV) back();
    // les formules (animation → formules → explication et résultats), ici ou entre les figures (fxAt)
    if (L.fxH > 0) {
      const h = L.fxH - pad * 0.6, at = fxY == null ? y + pad * 0.6 : yFig + fxY + pad * 0.3, gl = FX.length && FX.every((f) => f.flat) ? ACCENT : "#0f766e";
      ctx.fillStyle = "#fff"; ctx.fillRect(pad, at, figW, h);
      ctx.fillStyle = gl; ctx.fillRect(pad, at, Math.max(2, Math.round(L.fs * 0.22)), h);
      let yy = at + L.fxPad;
      for (const b of L.fx) { b.paint(ctx, pad + (figW - b.w) / 2, yy + b.a); yy += b.a + b.d + L.fxGap; }
      if (FXF.length) {
        if (L.fx.length) yy += L.fxGap * 0.5;
        const rowW = FXF.length * L.fxFigW + (FXF.length - 1) * L.fxFigGap; let xx = pad + (figW - rowW) / 2;
        for (const f of FXF) {
          const hh = f.ar * L.fxFigW, svg = document.getElementById(f.id)?.querySelector("svg") || f.svg;
          await drawMedia(ctx, [svg], { x: xx, y: yy + (L.fxFigH - hh) / 2, w: L.fxFigW, h: hh }, null);
          xx += L.fxFigW + L.fxFigGap;
        }
      }
      if (fxY == null) y += pad * 0.6 + h;
      ctx.textBaseline = "top"; ctx.textAlign = "left";
    }
    y += pad * 0.8;

    ctx.textBaseline = "top"; ctx.textAlign = "left";
    if (L.reads.length) {                             // en vidéo, les lectures animées sont sur le dessin (readout) : pas de ligne figée
      ctx.fillStyle = SOFT; ctx.font = `600 ${L.rfs}px ${MONO}`;
      for (const l of L.reads) { if (t == null || !anim?.readout) ctx.fillText(l, pad, y); y += L.rfs * 1.35; }
      y += L.fs * 0.5;
    }
    ctx.fillStyle = INK; ctx.font = `${L.fs}px ${SANS}`;
    for (const l of L.body) { if (l === null) { y += L.fs * PG; continue; } fillTextSub(ctx, l, pad, y); y += L.fs * LH; }
    if (L.verdict.length) {
      y += L.fs * GAP_V; ctx.fillStyle = ACCENT; ctx.font = `italic ${L.fs}px ${SANS}`;
      for (const l of L.verdict) { ctx.fillText(l, pad, y); y += L.fs * LH; }
    }
    if (L.src.length) {
      y += L.fs * GAP_S; ctx.fillStyle = SOFT; ctx.font = `${L.sfs}px ${SANS}`;
      for (const l of L.src) { ctx.fillText(l, pad, y); y += L.sfs * SLH; }
    }
    drawCredit(ctx, W, { y: H - band, h: band }, info);
    return { W, H, end: y, band: H - band, fs: L.fs, figH, col: A.col };
  };
  const kmin = Math.min(...A.cells.map((c, i) => c.w / (boxes[i].w || 1)));   // px de la carte par px CSS, la figure la plus réduite
  return { W, H, anim, paint, kmin };
}

/** Carte en image PNG (état courant de la page). Renvoie la géométrie (tests). */
export async function exportCard(card, opts) {
  const P = planCard(card, opts); if (!P) return null;
  // « hd » : la vidéo est au plus 1920 × 1080, l'image deux fois plus fine (3840 × 2160 ; X affiche jusqu'à 4096) pour le détail
  const d = FORMATS[opts.format] ? 2 : 1;            // format réseau : mêmes proportions, deux fois plus de pixels
  const S = opts.format === "hd" ? hdSize(P, 2 * HD_LONG, 2 * HD_W) : { W: P.W * d, H: P.H * d };
  const out = document.createElement("canvas"); out.width = S.W; out.height = S.H;
  const ctx = out.getContext("2d"); ctx.scale(S.W / P.W, S.H / P.H);
  const geo = await P.paint(ctx);
  const blob = await new Promise((res) => out.toBlob(res, "image/png"));
  save(blob, fileName(opts.info.tab, opts.name || `${card.id}-${opts.len}`, opts.format, "png"));
  return geo;
}

/** Carte animée (MP4 ou GIF) : texte fixe, figure(s) rejouée(s) sur une boucle. */
export async function exportCardVideo(card, { kind, onProgress, ...opts }) {
  const P = planCard(card, { ...opts, video: true }); if (!P?.anim) return null;
  const { encodeAnim, videoNote } = await import("./export-video.js");
  const s = Math.min(1, (kind === "gif" ? 720 : 1920) / P.W), even = (v) => Math.round(v * s / 2) * 2;
  const L = opts.format === "hd" ? hdSize(P, kind === "gif" ? 720 : HD_LONG, kind === "gif" ? 405 : HD_W) : { W: even(P.W), H: even(P.H) };
  const r = await encodeAnim(kind, P.anim, L, async (ctx, t) => { ctx.scale(L.W / P.W, L.H / P.H); await P.paint(ctx, t); }, onProgress);
  save(r.blob, fileName(opts.info.tab, opts.name || `${card.id}-${opts.len}`, opts.format, r.ext));
  return videoNote(kind, r);
}
