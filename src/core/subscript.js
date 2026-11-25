// Indices écrits « x_t » dans un texte qui n'est pas du TeX (2026-10-28, propriétaire : « parfois on a des formules qui
// montrent x_t au lieu de t en indice de x »). Prose, sorties de calculateurs, libellés de figures SVG et textes de canvas
// ne passent pas par tex-mathml.js : ce module y pose le vrai indice. Seule une base d'UNE lettre (accent combinant permis :
// ρ̇_k) précédée d'un non-lettre (ou d'une lettre grecque : ½ρC_D, δṫ_k, 2R_eff, v/ω_s) est prise, pour laisser les identifiants (data_table, rv_raw, research/cop_dem.py) ;
// l'indice est un mot, éventuellement entre accolades, ou deux mots joints par « , » ou « → » (θ_obs,app, F_A→B).
const SUB = /(^|[^\p{L}\p{M}_.\\]|\p{Script=Greek}\p{M}*)(\p{L}\p{M}*)_(\{([^{}]+)\}|[\p{L}\p{N}]+(?:[,→][\p{L}\p{N}]+)*)/gu;
const SKIP = "code, pre, script, style, textarea, math, [data-tex], [data-tex-fallback], a[href], .snippet, [class*=tok-], [data-nosub]";

/** Le texte en morceaux [{t, sub}] ; un seul morceau sans indice si rien ne correspond. */
export function subRuns(s) {
  const str = String(s), out = [];
  let last = 0;
  for (const m of str.matchAll(SUB)) {
    const at = m.index + m[1].length;
    if (at + m[2].length > last) out.push({ t: str.slice(last, at + m[2].length), sub: false });
    out.push({ t: m[4] ?? m[3], sub: true });
    last = m.index + m[0].length;
  }
  if (last < str.length || !out.length) out.push({ t: str.slice(last), sub: false });
  return out;
}
export const hasSub = (s) => { SUB.lastIndex = 0; const r = SUB.test(String(s)); SUB.lastIndex = 0; return r; };

/**
 * fillText avec les indices : même alignement (textAlign) et même ligne de base que ctx.fillText ; l'indice est
 * à 72 % de la taille, abaissé de 0,25 em. Renvoie la largeur dessinée.
 */
export function fillTextSub(ctx, s, x, y) {
  const str = String(s);
  if (!hasSub(str)) { ctx.fillText(str, x, y); return ctx.measureText(str).width; }
  const font = ctx.font, m = /(\d+(?:\.\d+)?)px/.exec(font), fs = m ? +m[1] : 12;
  const small = m ? font.replace(m[0], `${(fs * 0.72).toFixed(2)}px`) : font;
  const runs = subRuns(str).map((r) => { ctx.font = r.sub ? small : font; return { ...r, w: ctx.measureText(r.t).width }; });
  const w = runs.reduce((a, r) => a + r.w, 0), al = ctx.textAlign;
  let x0 = al === "center" ? x - w / 2 : al === "right" || al === "end" ? x - w : x;
  ctx.textAlign = "left";
  for (const r of runs) { ctx.font = r.sub ? small : font; ctx.fillText(r.t, x0, r.sub ? y + fs * 0.25 : y); x0 += r.w; }
  ctx.font = font; ctx.textAlign = al;
  return w;
}

/** Largeur qu'occuperait fillTextSub (pour couper les lignes). */
export function measureSub(ctx, s) {
  const str = String(s);
  if (!hasSub(str)) return ctx.measureText(str).width;
  const font = ctx.font, m = /(\d+(?:\.\d+)?)px/.exec(font), fs = m ? +m[1] : 12;
  const small = m ? font.replace(m[0], `${(fs * 0.72).toFixed(2)}px`) : font;
  let w = 0;
  for (const r of subRuns(str)) { ctx.font = r.sub ? small : font; w += ctx.measureText(r.t).width; }
  ctx.font = font;
  return w;
}

function fixNode(n) {
  const p = n.parentNode;
  if (!p || p.nodeType !== 1 || !hasSub(n.nodeValue) || p.closest(SKIP)) return;
  const doc = n.ownerDocument, svg = p.namespaceURI === "http://www.w3.org/2000/svg";
  if (svg && !/^(text|tspan)$/i.test(p.localName)) return;
  const frag = doc.createDocumentFragment();
  if (!svg) {
    for (const r of subRuns(n.nodeValue)) {
      if (!r.sub) { frag.appendChild(doc.createTextNode(r.t)); continue; }
      const e = doc.createElement("sub"); e.textContent = r.t; frag.appendChild(e);
    }
  } else {
    // SVG : pas de baseline-shift sous Firefox ; des tspan décalés par dy, puis retour à la ligne de base
    const NS = "http://www.w3.org/2000/svg", fs = parseFloat(p.closest("text")?.getAttribute("font-size")) || 12, dy = fs * 0.25;
    for (const r of subRuns(n.nodeValue)) {
      const e = doc.createElementNS(NS, "tspan"); e.textContent = r.t;
      if (r.sub) { e.setAttribute("dy", dy.toFixed(2)); e.setAttribute("font-size", (fs * 0.72).toFixed(2)); }
      else if (frag.lastChild?.getAttribute?.("dy")) e.setAttribute("dy", (-dy).toFixed(2));
      frag.appendChild(e);
    }
    if (frag.lastChild?.getAttribute("dy") === dy.toFixed(2)) { const z = doc.createElementNS(NS, "tspan"); z.setAttribute("dy", (-dy).toFixed(2)); frag.appendChild(z); }
  }
  p.replaceChild(frag, n);
}

/** Pose les indices dans tout le texte visible sous root (texte, libellés SVG). */
export function subscriptsIn(root) {
  if (!root) return;
  if (root.nodeType === 3) { fixNode(root); return; }
  const tw = (root.ownerDocument || root).createTreeWalker(root, 4), list = [];
  for (let n = tw.nextNode(); n; n = tw.nextNode()) if (hasSub(n.nodeValue)) list.push(n);
  list.forEach(fixNode);
}

/** Suit root : ce qu'un calculateur ou render() réécrit plus tard reçoit aussi ses indices. */
export function watchSubscripts(root) {
  subscriptsIn(root);
  if (typeof MutationObserver === "undefined") return;
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "characterData") fixNode(m.target);
      else for (const a of m.addedNodes) if (a.nodeType === 1 || a.nodeType === 3) subscriptsIn(a);
    }
  }).observe(root, { childList: true, characterData: true, subtree: true });
}
