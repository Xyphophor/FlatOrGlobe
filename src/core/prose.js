// Rendu d'un flux de blocs extrait du legacy par research/extract_prose.py
// (src/data/prose/<tab>.js). Chaque bloc a un type ; les canvas, tables
// et cartes d'expérience deviennent des emplacements que le module
// d'onglet remplit ensuite (tables par id de tbody ou par position, canvas
// par id) ; les hôtes .figsym gardent leur id legacy et sont remplis par
// src/core/symbols.js (drawSymbols(key)) ; les blocs "raw" (SVG
// d'ouverture, grilles de figures, boutons, tableaux statiques...) sont
// le HTML du legacy tel quel. Les ancres [n] sont déjà des #s-<tab>-nN,
// compatibles avec src/core/citations.js (SOURCES ids n1..nN).
// Une couche i18n n'est pas branchée ici : le flux est le texte EN
// verbatim ; une traduction se fait bloc par bloc (même index) -- voir
// tasks/epic04/.
import { xref, tabLabel } from "./tabs.js";
import { renderSources } from "./citations.js";
import { evBadge } from "./evidence.js";
import { videoHTML } from "./video.js";
import { peopleHTML } from "./people.js";

const esc = (s) => s.replace(/"/g, "&quot;");
// Expériences regroupées dans falsify (2026-11-26, Xyphophor : « déménager toutes les expériences dans l'onglet dédié
// aux contre-arguments, en les remplaçant par des liens ; ça casse le flot de lecture ; un lecteur pourra faire ses
// courses ») : un bloc marqué `away: "<id>"` n'est plus rendu dans son onglet ; à la place du premier bloc de l'id,
// une ligne de lien vers #tab-falsify/<id>. falsify rend ces blocs avec { only: "<id>" } (src/core/experiments.js).
const EXP_AWAY = {
  en: "to do yourself, with every experiment of the site, in “{tab}”",
  fr: "à faire soi-même, avec toutes les expériences du site, dans « {tab} »",
  es: "para hacer uno mismo, con todos los experimentos del sitio, en «{tab}»",
  pt: "para fazer você mesmo, com todos os experimentos do site, em «{tab}»",
  nl: "om zelf te doen, met alle experimenten van de site, in „{tab}”",
};
/** Le titre d'une expérience : l'en-tête de sa carte (traduite en bloc ou non) ou le titre de sa section. */
function awayTitle(b, html) {
  if (b.t === "exp" && b.h) { const m = /<div class="exp-h">([\s\S]*?)<\/div>/.exec(html || ""); return m ? m[1] : b.h; }
  return (html || b.html || "").replace(/<[^>]+>/g, "").trim();
}
/** La ligne de lien qui remplace une expérience dans son onglet. */
export function expAwayLink(id, title) {
  const lang = (typeof document !== "undefined" && document.documentElement.lang) || "en";
  return `<p class="exp-away"><a class="xref" href="#tab-falsify/${esc(id)}" data-xref="falsify" data-sec="${esc(id)}"><b>${title}</b> — ${(EXP_AWAY[lang] || EXP_AWAY.en).replace("{tab}", tabLabel("falsify"))} →</a></p>`;
}
/** Les blocs d'une expérience (`away === id`), sections comprises, sans leur marque. */
export function awayBlocks(blocks, id) {
  const out = [];
  for (const b of blocks) {
    if (b.t === "section") out.push(...awayBlocks(b.blocks, id));
    else if (b.away === id) { const { away, ...rest } = b; out.push(rest); }
  }
  return out;
}

// « See also » des renvois (epic15/UC06 : restait en anglais dans toutes les langues)
const SEE_ALSO = { en: "See also", fr: "Voir aussi", es: "Ver también", pt: "Ver também", nl: "Zie ook" };

/**
 * @param {string} tab clé de l'onglet (ids de tables, ancres de sources)
 * @param {Array} blocks flux extrait
 * @param {object} [o] o.reading : liste READING de src/data/sources/<tab>.js
 *   (rendue à la position du bloc "srcs reading" du legacy) ; o.formulaClass ;
 *   o.dict : dictionnaire de traduction de CET onglet pour la langue active
 *   (epic04/UC01, src/i18n/<lang>/<tab>-prose.json chargé par l'appelant via
 *   getDict(lang, tab + "-prose") -- réutilise tel quel le mécanisme de
 *   src/core/i18n.js, "-prose" est juste un nom de "tab" de plus pour lui).
 *   Clé = b.k (le data-i18n du legacy, conservé par research/extract_prose.py
 *   sur tout bloc TYPÉ dont l'élément legacy le portait -- jamais les blocs
 *   "raw"). Repli sur l'anglais déjà dans le bloc si la clé est absente, ou
 *   si la traduction n'a pas la même forme (même règle que le legacy :
 *   "length mismatch -> English", pour ne jamais rendre un notes-block à
 *   moitié traduit avec des paragraphes qui ne correspondent plus).
 */
export function renderProse(tab, blocks, { formulaClass = "formula", reading = null, dict = null, only = null, _n = { tables: 0, canvases: 0, exps: 0 }, _away = new Set() } = {}) {
  // compteurs PARTAGÉS avec les sections imbriquées : sinon chaque section
  // repartait de 0 et sim avait quatre tables id="simTab0" (epic06/UC03)
  const n = _n;
  const tr = (b) => (dict && b.k && typeof dict[b.k] === "string") ? dict[b.k] : b.html;
  const trParas = (b) => (dict && b.k && Array.isArray(dict[b.k]) && dict[b.k].length === b.paras.length) ? dict[b.k] : b.paras;
  if (only) blocks = awayBlocks(blocks, only);
  const out = [];
  for (const b of blocks) {
    if (b.away) {   // une expérience partie dans falsify : une ligne de lien, une seule fois par expérience
      if (!_away.has(b.away)) {
        _away.add(b.away);
        const whole = dict && b.k && dict[b.k] && typeof dict[b.k].__html === "string" ? dict[b.k].__html : null;
        out.push(expAwayLink(b.away, awayTitle(b, whole ?? (b.t === "exp" ? "" : tr(b)))));
      }
      continue;
    }
    // epic15/UC06 (2026-10-01) : un bloc traduit EN ENTIER ({ __html }, rendu anglais
    // traduit nœud texte par nœud texte depuis le I18N_BLOCKS du legacy, ou à la main)
    // remplace le rendu ; les compteurs d'ids avancent comme si le bloc était rendu.
    const whole = dict && b.k && dict[b.k] && typeof dict[b.k].__html === "string" ? dict[b.k].__html : null;
    if (whole !== null) {
      if (b.t === "table") n.tables++; else if (b.t === "exp") n.exps++; else if (b.t === "canvas") n.canvases++;
      // un titre traduit en bloc garde son badge de classe (epic17)
      out.push(b.t === "h2" ? whole.replace(/<\/h2>\s*$/, `${evBadge(tab, b.k)}</h2>`).replace(/^<h2(?![^>]*data-sec)/, `<h2 data-sec="${esc(b.k)}"`) : whole);
      continue;
    }
    switch (b.t) {
      case "eyebrow": out.push(`<p class="eyebrow">${tr(b)}</p>`); break;
      case "h1": out.push(`<h1>${tr(b)}</h1>`); break;
      case "h2": out.push(`<h2 class="cnav-h2"${b.k ? ` data-sec="${esc(b.k)}"` : ""}>${tr(b)}${evBadge(tab, b.k)}</h2>`); break;   // epic17 : classe de preuve ; data-sec : lien profond (2026-10-04)
      case "lead": out.push(`<p class="cnav-lead${b.opener ? " opener" : ""}">${tr(b)}</p>`); break;
      case "notes": out.push(`<p class="notes">${tr(b)}</p>`); break;
      case "notes-block": out.push(`<div class="notes">${trParas(b).map((p) => `<p>${p}</p>`).join("")}</div>`); break;
      case "callout": out.push(`<div class="callout${b.flat ? " flatc" : ""}">${tr(b)}</div>`); break;
      case "fcap": out.push(`<div class="fcap">${tr(b)}</div>`); break;
      case "video": out.push(videoHTML(b, tr(b))); break;
      case "people": out.push(peopleHTML(b.ids, (typeof document !== "undefined" && document.documentElement.lang) || "en")); break;   // portraits (core/people.js, 2026-10-26)   // démonstration filmée (core/video.js, 2026-10-06)
      case "figsym": out.push(`<div class="figsym" id="${b.id}"></div>`); break;
      case "figkey": out.push(`<ul class="figkey">${b.items.map((i) => `<li>${i}</li>`).join("")}</ul>`); break;
      // formule : `k` (onglets nouveaux, p. ex. avia) traduit la glose ; les lignes TeX ne se traduisent pas
      case "formula": {
        const style = b.style ? ` style="${esc(b.style)}"` : "";
        const lines = b.lines.map((l) => `<div class="ln">${l.tex ? `<span class="tex" data-tex="${esc(l.tex)}">${l.fallback}</span>` : l.fallback}</div>`).join("");
        out.push(`<div class="${formulaClass}${b.flat ? " flat" : ""}"${style}${b.k ? ` data-k="${esc(b.k)}"` : ""}><div class="big">${lines}</div>` +
          (b.fig ? `<div class="figsym" id="${b.fig}"></div>` : "") +
          (b.gloss ? `<div class="gloss">${b.k ? tr({ ...b, html: b.gloss }) : b.gloss}</div>` : "") + `</div>`);
        break;
      }
      case "canvas": out.push(`<div class="fig"><canvas id="${b.id}" data-idx="${n.canvases++}"></canvas></div>`); break;
      case "table": {
        const tbody = b.tbody || `${tab}Tb${n.tables}`;
        out.push(`<table class="cnav-table" id="${b.id || `${tab}Tab${n.tables}`}"><caption>${b.caption}</caption><thead><tr>${b.head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody id="${tbody}"></tbody></table>`);
        n.tables++;
        break;
      }
      case "fold": {
        // epic15/UC06 (2026-10-01) : un repli traduit est { summary, html } sous sa clé k
        const d = dict && b.k && dict[b.k] && typeof dict[b.k] === "object" && !Array.isArray(dict[b.k]) ? dict[b.k] : null;
        const html = d?.html ?? b.html, summary = d?.summary ?? b.summary;
        const inner = /^\s*</.test(html) ? html : `<p class="cnav-lead">${html}</p>`; // v1 : texte nu ; v2 : intérieur verbatim
        out.push(`<details class="fold${b.q === false ? "" : " q"}"><summary>${summary}</summary>${inner}</details>`);
        break;
      }
      case "exp": {
        const i = n.exps++;
        const input = ([id, lab, attrs]) => {
          // v2 garde les attributs d'origine (value/min/max/step) ; v1 n'avait que [id, label]
          const a = attrs ? attrs.replace(/\s*id="[^"]*"/, "").replace(/\s*type="[^"]*"/, "").trim() : 'step="any"';
          return `<div class="field"><label for="${id}">${lab}</label><input type="number" id="${id}" ${a} /></div>`;
        };
        out.push(`<div class="exp" id="${only ? `${only}-card` : `${tab}Exp${i}`}"><div class="exp-h">${b.h}</div><div class="exp-t">${b.title}</div><p class="exp-lead">${b.lead}</p>` +
          `<div class="exp-grid"><div class="exp-var iv">${b.iv}</div><div class="exp-var dv">${b.dv}</div></div>` +
          b.meta.map((m) => `<p class="exp-meta">${m}</p>`).join("") +
          `<div class="exp-calc">` +
          (b.inputs.length ? `<div class="exp-inputs">${b.inputs.map(input).join("")}</div>` : "") +
          `<div class="exp-out" id="${b.out || `${tab}ExpOut${i}`}"></div><div class="exp-verdict" id="${b.verdict || `${tab}ExpV${i}`}"></div></div></div>`);
        break;
      }
      case "xrefs":
        { const see = SEE_ALSO[(typeof document !== "undefined" && document.documentElement.lang) || "en"] || SEE_ALSO.en;
          out.push(`<nav class="xrefs${b.wide ? " xrefs-wide" : ""}" aria-label="${see}"><b class="xh">${see}</b>${b.keys.map((k) => xref(k)).join("")}</nav>`); }
        break;
      // un bloc brut SANS clé est du HTML legacy (jamais traduit, comme avant) ;
      // un bloc brut AVEC clé (onglets nouveaux, p. ex. ecl) peut être traduit
      // en entier -- le traducteur garde les ids et les balises.
      case "raw": out.push(tr(b)); break;
      case "section":
        out.push(`<section${b.id ? ` id="${b.id}"` : ""}${b.class ? ` class="${b.class}"` : ""}>${renderProse(tab, b.blocks, { formulaClass, reading, dict, _n: n, _away })}</section>`);
        break;
      case "sources": out.push(renderSources(tab)); break;
      case "reading":
        if (reading && reading.length) out.push(`<section class="srcs reading"><h2>Further reading</h2><ul>${reading.map((r) => `<li>${r.html}</li>`).join("")}</ul></section>`);
        break;
      default: break;
    }
  }
  return out.join("\n");
}

/** Aplatit les blocs "section" (sim/hh) en un flux plat, pour filtrer par type. */
export function flatten(blocks) {
  const out = [];
  for (const b of blocks) { if (b.t === "section") out.push(...flatten(b.blocks)); else out.push(b); }
  return out;
}
