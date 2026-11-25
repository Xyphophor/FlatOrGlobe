// Panneau d'onglet monté (DOM linkedom) -> Markdown, pour le mode IA (scripts/build_ai.mjs,
// 2026-10-06). Le texte vient de la page rendue, pas de la prose brute : les tableaux remplis
// par le code de l'onglet, les lectures (.reads) et les sources numérotées y sont. Les dessins
// (canvas, SVG) ne se traduisent pas : on garde leur légende et leur nom accessible, jamais un
// chiffre lu sur un dessin (règle 1). Les formules gardent leur TeX (data-tex).

const BLOCK = new Set(["div", "p", "section", "nav", "details", "ul", "ol", "table", "h1", "h2", "h3", "h4", "h5", "h6",
  "figure", "figcaption", "blockquote", "header", "footer", "main", "article", "aside", "pre", "hr", "dl", "summary"]);
// commandes de la page (calculateurs, boutons, sélecteurs) : sans objet hors navigateur
const SKIP = new Set(["script", "style", "svg", "button", "select", "option", "input", "textarea", "label", "noscript", "template"]);
const SKIP_CLASS = ["field", "mini-form", "preset-row", "exp-inputs", "swapbtn", "presetbtn", "figkey", "fig-export", "toc-link", "sec-link"];

const ws = (s) => s.replace(/\s+/g, " ");
// TeX du site -> TeX standard : \g{} \f{} \soft{} \bold{} ne font que colorer (src/core/tex-mathml.js),
// \deg \arcmin \arcsec \dprime \percent sont des marques à lui
const STD = { deg: "^\\circ", arcmin: "'", arcsec: "''", dprime: "''", percent: "\\%" };
export const texStd = (t) => t.replace(/\\(g|f|soft|bold)\{/g, "{").replace(/\\(deg|arcmin|arcsec|dprime|percent)(?![a-zA-Z])/g, (_, k) => STD[k]);
const cls = (e) => (typeof e.className === "string" ? e.className : "").split(/\s+/).filter(Boolean);
const hasCls = (e, c) => cls(e).includes(c);

/**
 * @param {Element} root panneau monté
 * @param {object} o
 * @param {(key:string)=>string} o.xrefHref lien d'un renvoi data-xref (vers le .md de l'onglet)
 * @param {(h2:Element)=>string} [o.h2Suffix] texte ajouté au titre (classe de preuve)
 * @param {string} [o.srcPrefix] préfixe des ancres de sources (#s-<tab>-nN)
 */
export function panelToMd(root, o) {
  const out = [];
  const push = (s) => { s = s.replace(/[ \t]+\n/g, "\n").trim(); if (s) out.push(s); };

  function inline(n) {
    if (n.nodeType === 3) return ws(n.textContent);
    if (n.nodeType !== 1) return "";
    const tag = n.tagName.toLowerCase();
    if (SKIP.has(tag) || SKIP_CLASS.some((c) => hasCls(n, c))) return "";
    // badge de classe : dans un titre, h2Suffix le rend ; ailleurs (légende, cartes), entre crochets
    if (hasCls(n, "ev")) return n.closest?.("h2") ? "" : `[${n.textContent.trim()}] `;
    if (hasCls(n, "homego")) return "";                   // « Open the tab → » : le lien suffit
    if (tag === "canvas") return "";
    if (hasCls(n, "tex") && n.getAttribute("data-tex")) return `$${texStd(n.getAttribute("data-tex"))}$`;
    if (tag === "br") return "\n";
    const kids = () => [...n.childNodes].map(inline).join("");
    if (tag === "b" || tag === "strong") { const s = kids().trim(); return s ? `**${s}**` : ""; }
    if (tag === "em" || tag === "i") { const s = kids().trim(); return s ? `*${s}*` : ""; }
    if (tag === "code") return "`" + n.textContent + "`";
    if (tag === "sup" && hasCls(n, "ref")) return n.textContent.trim();     // [n] gardé tel quel
    if (tag === "sup") return `^${kids()}`;
    if (tag === "sub") return `_${kids()}`;
    if (tag === "a") {
      const t = kids().trim(), href = n.getAttribute("href") || "", x = n.getAttribute("data-xref");
      if (!t) return "";                                   // flèche seule (renvoi en icône)
      if (x) return `[${t}](${o.xrefHref(x, n.getAttribute("data-sec"))})`;
      if (/^https?:/.test(href)) return `[${t}](${href})`;
      return t;                                            // ancre interne (#s-…) : le [n] suffit
    }
    if (hasCls(n, "r") && n.closest?.(".reads")) return kids().trim() + "\n";
    if (BLOCK.has(tag)) return " " + kids() + " ";         // bloc dans un inline (rare)
    return kids();
  }
  const para = (nodes) => nodes.map(inline).join("").split("\n").map((l) => ws(l).trim()).filter(Boolean).join("\n");

  function table(t) {
    const cap = t.querySelector("caption");
    if (cap) push(`**${para([...cap.childNodes])}**`);
    const rows = [...t.querySelectorAll("tr")];
    if (!rows.length) return;
    const cell = (c) => para([...c.childNodes]).replace(/\n/g, " · ").replace(/\|/g, "\\|");
    const grid = rows.map((r) => [...r.children].filter((c) => /^t[hd]$/i.test(c.tagName)).map((c) => ({ s: cell(c), span: +(c.getAttribute("colspan") || 1) })));
    const width = Math.max(...grid.map((r) => r.reduce((a, c) => a + c.span, 0)));
    const lines = [];
    let headDone = false;
    for (let i = 0; i < grid.length; i++) {
      const r = grid[i];
      if (r.length === 1 && r[0].span > 1 && headDone) { lines.push(`| **${r[0].s}** |${" |".repeat(width - 1)}`); continue; }  // ligne de groupe
      const cells = r.flatMap((c) => [c.s, ...Array(c.span - 1).fill("")]);
      while (cells.length < width) cells.push("");
      lines.push(`| ${cells.join(" | ")} |`);
      if (!headDone) { lines.push(`|${" --- |".repeat(width)}`); headDone = true; }
    }
    push(lines.join("\n"));
  }

  function list(l, ordered) {
    const items = [...l.children].filter((c) => c.tagName.toLowerCase() === "li");
    push(items.map((li, i) => `${ordered ? `${i + 1}.` : "-"} ${blocksInline(li)}`).join("\n"));
  }
  // un <li> peut contenir des blocs : on l'aplatit en une ligne
  const blocksInline = (e) => para([...e.childNodes]).replace(/\n/g, " ");

  function formula(f) {
    const lines = [...f.querySelectorAll(".ln")].map((ln) => {
      const tex = ln.querySelector(".tex[data-tex]");
      return tex ? `$$${texStd(tex.getAttribute("data-tex"))}$$` : para([...ln.childNodes]);
    }).filter(Boolean);
    if (lines.length) push(lines.join("\n"));
    const g = f.querySelector(".gloss");
    if (g) push(para([...g.childNodes]));
  }

  function walk(e) {
    let buf = [];
    const flush = () => { if (buf.length) { push(para(buf)); buf = []; } };
    for (const n of e.childNodes) {
      if (n.nodeType !== 1) { buf.push(n); continue; }
      const tag = n.tagName.toLowerCase();
      if (SKIP.has(tag) || SKIP_CLASS.some((c) => hasCls(n, c))) continue;
      if (tag === "canvas") {
        flush();
        const name = n.getAttribute("aria-label");
        if (name) push(`*[Figure: ${ws(name).trim()}]*`);
        continue;
      }
      // carte d'onglet (accueil) : une ligne de liste par carte
      if (tag === "a" && hasCls(n, "homecard")) {
        flush();
        const h = n.querySelector(".homeh"), x = n.getAttribute("data-xref");
        const rest = [...n.childNodes].filter((c) => c !== h);
        const name = h ? h.textContent.trim() : "";
        push(`- ${x ? `[${name}](${o.xrefHref(x)})` : name} — ${para(rest).replace(/\n/g, " ")}`);
        continue;
      }
      if (!BLOCK.has(tag)) { buf.push(n); continue; }
      flush();
      block(n, tag);
    }
    flush();
  }

  function block(n, tag) {
    if (/^h[1-6]$/.test(tag)) {
      const lvl = +tag[1];
      const t = para([...n.childNodes]).replace(/\n/g, " ");
      const suf = tag === "h2" && o.h2Suffix ? o.h2Suffix(n) : "";
      push(`${"#".repeat(lvl)} ${t}${suf}`);
      return;
    }
    if (tag === "hr") return;
    if (tag === "table") return table(n);
    if (tag === "ul" || tag === "ol") return list(n, tag === "ol");
    if (hasCls(n, "formula")) return formula(n);
    if (hasCls(n, "eyebrow")) { push(`*${para([...n.childNodes])}*`); return; }
    if (hasCls(n, "fcap") || tag === "figcaption") { push(`*Figure caption:* ${para([...n.childNodes])}`); return; }
    if (hasCls(n, "callout") || tag === "blockquote") {
      const sub = panelToMd(n, o);
      if (sub) push(sub.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n"));
      return;
    }
    if (hasCls(n, "reads")) {
      // une lecture qui dépend d'un élément absent hors navigateur (vidéo, horloge) sort en NaN : on la tait
      const lines = para([...n.childNodes]).split("\n").filter((l) => l && !/\bNaN\b/.test(l));
      if (lines.length) push(lines.map((l) => `- ${l}`).join("\n"));
      return;
    }
    if (tag === "details") {
      const s = n.querySelector("summary");
      if (s) {
        // titre du pli, puis son accroche (.fold-teaser) en paragraphe
        const teaser = [...s.childNodes].filter((c) => c.nodeType === 1 && hasCls(c, "fold-teaser"));
        const head = [...s.childNodes].filter((c) => !teaser.includes(c));
        push(`### ${para(head).replace(/\n/g, " ").replace(/^\*\*(.*)\*\*$/, "$1")}`);
        if (teaser.length) push(para(teaser));
      }
      for (const c of n.children) if (c.tagName.toLowerCase() !== "summary") { if (BLOCK.has(c.tagName.toLowerCase())) block(c, c.tagName.toLowerCase()); else push(para([c])); }
      return;
    }
    if (tag === "summary") return;
    // bloc de sources « lecture » : son titre en gras devient une section
    if (hasCls(n, "srcs") && tag === "div") {
      for (const c of n.children) {
        const ct = c.tagName.toLowerCase();
        if (ct === "b" && hasCls(c, "h")) push(`## ${para([...c.childNodes])}`);
        else if (BLOCK.has(ct)) block(c, ct); else push(para([c]));
      }
      return;
    }
    if (tag === "p" || tag === "figcaption") { push(para([...n.childNodes])); return; }
    walk(n);
  }

  walk(root);
  return out.join("\n\n").replace(/\n{3,}/g, "\n\n");
}
