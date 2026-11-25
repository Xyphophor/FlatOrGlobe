// Audit de contenu (2026-10-01, demande du propriétaire : « les formules
// doivent avoir des figures, les figures des légendes, on évite de trop
// charger le texte ») : à importer APRÈS le montage d'un onglet par
// mount-smoke.mjs (--content). Heuristique DOM, sans mise en page :
//   - formule sans figure : .formula sans svg/canvas/.figsym dedans ni
//     figure juste avant/après ;
//   - figure sans légende : canvas, .figsym hors formule, svg de premier
//     niveau, sans .fcap/figcaption/.figkey/.cap dans son .fig ni juste
//     après (une figure DANS une formule compte la glose comme légende) ;
//   - mots VISIBLES par section h2 (un repli fermé ne compte que son titre) ;
//   - TeX (data-tex, formules ET libellés de schémas) que tex-mathml.js refuse ;
//   - classes de preuve (epic17) : titres h2 avec badge, par classe, et sans badge (à vérifier :
//     explication, histoire, objections ou plat -- sinon une entrée manque dans src/data/evidence.js).
import { hasSub } from "../src/core/subscript.js";
import { texToMathML } from "../src/core/tex-mathml.js";
const FIGSEL = "canvas, .figsym, svg";
const CAPSEL = ".fcap, figcaption, .figkey, .cap, .legend, .caption, .formula .gloss";   // la glose d'une formule qui suit la figure la décrit
const isFig = (e) => e && (e.matches?.(".fig, .figsym, canvas, svg, figure") || !!e.querySelector?.(".figsym svg, canvas"));
const txt = (e) => (e?.textContent || "").replace(/\s+/g, " ").trim();

// un indice ou exposant TeX resté en clair dans le texte visible (« x_t », « d^2 ») : hors formules converties
// (data-tex), code et extraits ; dans les canvas, les textes passés à fillText (2026-10-28)
const RAWSUB = /[\p{L}\p{N})][_^](?:\{|[\p{L}\p{N}\\])/u;   // large : un identifiant (data_table) n'est signalé que si SUB (core/subscript.js) le prendrait
const rawCtx = (t, n = 50) => { const i = t.search(RAWSUB); return t.slice(Math.max(0, i - n), i + 25).replace(/\s+/g, " ").trim(); };
export function contentAudit(c, canvasTexts = []) {
  const out = { formulasNoFig: [], figsNoCap: [], sections: [], nFormulas: c.querySelectorAll(".formula").length };
  for (const f of c.querySelectorAll(".formula")) {
    if (f.querySelector(FIGSEL)) continue;
    // figure voisine : acceptée mais signalée « (voisine) » -- à vérifier à la main qu'elle illustre bien CETTE formule
    const near = [f.previousElementSibling, f.nextElementSibling, f.nextElementSibling?.nextElementSibling].find(isFig);
    out.formulasNoFig.push(`${near ? "(voisine) " : ""}${txt(f.querySelector(".big") || f).slice(0, 70)}`);
  }
  const figs = [...c.querySelectorAll("canvas, .figsym, svg")].filter((e) =>
    !e.closest(".formula") && !e.closest("button, .figkey, .sw, .srcs, .card, nav, .tabbar, .home-card, a") &&
    !(e.tagName.toLowerCase() === "svg" && e.parentElement?.closest(".figsym, svg")));
  for (const e of figs) {
    const box = e.closest(".fig, figure, .panel") || e.closest(".figopen, .figsym") || e;
    let top = box; while (top.parentElement && top.parentElement !== c) top = top.parentElement;   // bloc de premier niveau
    const nx = (e, n) => { const r = []; for (let x = e?.nextElementSibling; x && r.length < n && !x.matches("h2, .fig, .figsym, canvas"); x = x.nextElementSibling) r.push(x); return r; };
    const around = [box, box.nextElementSibling, ...nx(top, 3), box.parentElement?.matches(".figgrid, .figs, .fig-row, .pair") ? box.parentElement.nextElementSibling : null];
    const has = around.some((x) => x && (x.matches?.(CAPSEL) || x.querySelector?.(CAPSEL)));
    if (!has) out.figsNoCap.push(`${e.tagName.toLowerCase()}#${e.id || e.closest("[id]")?.id || "?"}.${String(e.parentElement?.className || "").split(" ")[0]}${e.closest(".legacy3d, .scene") ? " (scène)" : ""} → suivi de: ${txt(box.nextElementSibling).slice(0, 50)}`);
  }
  // TeX que le convertisseur refuse (la page garderait le texte de repli)
  out.texFail = [...new Set([...c.querySelectorAll("[data-tex]")].map((e) => e.getAttribute("data-tex")))]
    .filter((t) => { try { texToMathML(t); return false; } catch { return true; } });
  out.rawSub = [];
  const skip = "[data-tex], math, code, pre, script, style, .snippet, .code, [class*=tok-], a[href]";
  const tw = c.ownerDocument.createTreeWalker(c, 4);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (!RAWSUB.test(n.textContent) || !hasSub(n.textContent) || n.parentElement?.closest(skip)) continue;
    out.rawSub.push(`«${rawCtx(n.textContent)}» (${n.parentElement?.closest("[id]")?.id || "?"})`);
  }
  for (const t of canvasTexts) if (RAWSUB.test(t)) out.rawSub.push(`canvas «${rawCtx(t)}»`);
  out.rawSub = [...new Set(out.rawSub)];
  let cur = { h: "(avant le premier h2)", w: 0 };
  const walk = (n) => {
    for (const ch of n.childNodes) {
      if (ch.nodeType === 1 && ch.tagName.toLowerCase() === "h2") { out.sections.push(cur); cur = { h: txt(ch).slice(0, 60), w: 0 }; continue; }
      if (ch.nodeType === 1 && ch.matches(".srcs, table, .formula, script, style")) continue;
      if (ch.nodeType === 1 && ch.tagName.toLowerCase() === "details") { const sm = ch.querySelector("summary"); if (sm) cur.w += sm.textContent.trim().split(/\s+/).filter(Boolean).length; continue; }   // replié : seul le titre se lit
      if (ch.nodeType === 3) cur.w += ch.textContent.trim().split(/\s+/).filter(Boolean).length;
      else if (ch.nodeType === 1) walk(ch);
    }
  };
  walk(c); out.sections.push(cur);
  out.ev = { measure: 0, check: 0, model: 0, none: [] };
  for (const h of c.querySelectorAll("h2.cnav-h2")) {
    const b = h.querySelector(".ev"); const cls = b && [...b.classList].find((x) => x.startsWith("ev-"))?.slice(3);
    if (cls in out.ev) out.ev[cls]++; else out.ev.none.push(txt(h).slice(0, 40));
  }
  return out;
}
