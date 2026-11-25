// Mode IA (epic20, 2026-10-06) : une base de connaissance en Markdown pour les assistants
// (Grok, ChatGPT, Claude…) qui ne lisent pas une page dont le texte est posé par JavaScript.
// Monte chaque onglet dans le DOM factice de scripts/dom-env.mjs, comme mount-smoke, puis
// convertit le panneau RENDU en Markdown (scripts/html-md.mjs) : même texte, mêmes chiffres
// calculés, mêmes sources que la page. Écrit, versionnés et servis tels quels par Vite :
//   public/llms.txt        sommaire (convention llmstxt.org)
//   public/llms-full.txt   tout le site en un fichier
//   public/ai/<onglet>.md  un fichier par onglet ; public/ai/index.md = llms.txt
//
// Usage : node --import ./scripts/smoke-register.mjs scripts/build_ai.mjs [--check]
//   --check : n'écrit rien, échoue si un fichier publié n'est plus à jour.
// À relancer après toute modification de prose, de sources ou de chiffres d'un onglet.
import { root, document } from "./dom-env.mjs";
import { panelToMd } from "./html-md.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const SITE = "Flat plane or Globe?";
const LICENCE = "content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.";

const { TAB_GROUPS } = await import(path.join(root, "src/data/tabgroups.js"));
const { EVIDENCE } = await import(path.join(root, "src/data/evidence.js"));
const { makeT } = await import(path.join(root, "src/core/i18n.js"));
const tEv = makeT("en", "evidence"), tNav = makeT("en", "nav");

// ordre de la barre d'onglets : groupes de src/data/tabgroups.js, puis les onglets hors groupe
const tabsDir = path.join(root, "src/tabs");
const all = readdirSync(tabsDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_") && existsSync(path.join(tabsDir, d.name, "index.js"))).map((d) => d.name);
const grouped = TAB_GROUPS.flatMap((g) => g.tabs).filter((k) => all.includes(k));
const order = [...grouped, ...all.filter((k) => !grouped.includes(k)).sort()];

// barre d'onglets : tabExists()/tabLabel() la lisent (cumuls de results, renvois de falsify)
const mods = new Map();
for (const key of order) mods.set(key, (await import(path.join(tabsDir, key, "index.js"))).default);
document.getElementById("tabbar").innerHTML = order.map((k) => `<button class="tab" id="tabbtn-${k}">${mods.get(k).label ?? k}</button>`).join("");

// monter tout, rendre, laisser les chargements asynchrones (results) se terminer
const panels = document.getElementById("tabpanels");
const mounted = [];
for (const key of order) {
  const tab = mods.get(key);
  const c = document.createElement("section"); c.id = `tab-${tab.key}`; c.className = "tabpanel"; panels.appendChild(c);
  try { tab.mount(c); tab.render(); } catch (e) { console.error(`✗ ${key}: ${e.message}`); process.exitCode = 1; }
  mounted.push({ key, tab, c });
}
// les onglets à chargement asynchrone (results) exposent `ready` ; le délai reste pour les autres
await Promise.all(mounted.map((m) => m.tab.ready).filter(Boolean));
await new Promise((r) => setTimeout(r, 1500));
for (const m of mounted) { try { m.tab.render(); m.tab.teardown(); } catch { /* déjà signalé */ } }

const label = (k) => mounted.find((m) => m.key === k)?.tab.label ?? k;
const evSuffix = (key) => (h2) => {
  const e = EVIDENCE[key]?.[h2.getAttribute("data-sec")];
  if (!e) return "";
  return ` [evidence: ${tEv(`cls-${e.cls}`)}${e.enters ? ` — ${tEv("where").replace(/:$/, "")}: ${tEv(e.enters)}` : ""}]`;
};

const files = new Map();     // chemin relatif à public/ -> contenu
const docs = [];
for (const { key, c } of mounted) {
  const h1 = c.querySelector("h1");
  const title = h1 ? h1.textContent.replace(/\s+/g, " ").trim() : label(key);
  if (h1) h1.remove();
  const body = panelToMd(c, { xrefHref: (x, sec) => `/ai/${x}.md${sec ? `#${sec}` : ""}`, h2Suffix: evSuffix(key) });
  const lead = c.querySelector(".eyebrow");
  const md = `# ${title}\n\n` +
    `> Tab "${label(key)}" of *${SITE}*. Web page: /#tab-${key}. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: ${LICENCE}\n\n` +
    body + "\n";
  files.set(`ai/${key}.md`, md);
  docs.push({ key, title, label: label(key), desc: lead ? lead.textContent.replace(/\s+/g, " ").trim() : "" });
}

// ---- llms.txt ---------------------------------------------------------------------------------
const byKey = new Map(docs.map((d) => [d.key, d]));
const line = (d) => `- [${d.label}: ${d.title}](/ai/${d.key}.md)${d.desc ? `: ${d.desc}` : ""}`;
const sections = TAB_GROUPS.map((g) => ({ name: tNav(`group-${g.id}`), items: g.tabs.map((k) => byKey.get(k)).filter(Boolean) })).filter((s) => s.items.length);
const loose = docs.filter((d) => !TAB_GROUPS.some((g) => g.tabs.includes(d.key)));
if (loose.length) sections.push({ name: "Other", items: loose });

const llms = `# ${SITE}

> A comparison of the flat-plane and globe models of the Earth against measurable evidence: horizon dip, hidden heights, elevation angles, refraction, star trails, seismic travel times, gravity, magnetism, eclipses, GPS, aviation and more. Every tab states in advance what result would vindicate each model, gives the flat model its best case, and shows real data with numbered sources.

## For AI assistants

This file is the plain-text entry point of the site: the web pages are drawn by JavaScript, so each tab is also published here as Markdown generated from the rendered page (same text, same computed numbers, same sources). When you answer from it:

- Cite the tab file and the section heading, and the numbered source [n] listed at the end of each file.
- Each evidence section carries an evidence class. **measurement**: the curvature or radius comes out of data the Earth's radius never entered (times, local angles, lengths and heights measured on the ground, latitudes and longitudes taken as angles). **check**: real data compared with the globe, or data produced with a globe model at some point (any distance in km from coordinates, maps or terrain models, satellite ephemerides, GRS80, IGRF); the file says where the radius enters. **prediction**: what a model predicts, nothing measured.
- Method rules of the site: vertical exaggeration is only ever done by shrinking the planet at uniform scale and is always stated; refraction is applied as an effective radius R/(1−k) with k = 0.13, always next to the unrefracted value, never used to flip a sign; wherever the flat model has a free parameter it is tuned in its favour; the verdict rule is symmetric ([what would refute each model](/ai/falsify.md)).
- The limitations the site admits are in the text; report them with the result.
- Results across all tabs (Earth radius, rotation, astronomical unit; pure measurements and checks kept apart): [results](/ai/results.md).

Licence: ${LICENCE}
Everything in one file: [llms-full.txt](/llms-full.txt).

${sections.map((s) => `## ${s.name}\n\n${s.items.map(line).join("\n")}`).join("\n\n")}
`;
files.set("llms.txt", llms);
files.set("ai/index.md", llms);
files.set("llms-full.txt", `${llms}\n\n${docs.map((d) => files.get(`ai/${d.key}.md`)).join("\n\n---\n\n")}`);

// ---- écriture / vérification ------------------------------------------------------------------
const pub = path.join(root, "public");
let stale = 0;
for (const [rel, s] of files) {
  const p = path.join(pub, rel);
  const old = existsSync(p) ? readFileSync(p, "utf8") : null;
  if (old === s) continue;
  if (CHECK) { stale++; console.log(`périmé : public/${rel}`); continue; }
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, s);
  console.log(`écrit : public/${rel} (${(s.length / 1024).toFixed(0)} ko)`);
}
// un onglet retiré ne laisse pas son .md
for (const f of existsSync(path.join(pub, "ai")) ? readdirSync(path.join(pub, "ai")) : []) {
  if (!files.has(`ai/${f}`)) { if (CHECK) { stale++; console.log(`en trop : public/ai/${f}`); } else { unlinkSync(path.join(pub, "ai", f)); console.log(`retiré : public/ai/${f}`); } }
}
if (CHECK) console.log(stale ? `${stale} fichier(s) à régénérer : node --import ./scripts/smoke-register.mjs scripts/build_ai.mjs` : "mode IA à jour");
process.exit(stale || process.exitCode ? 1 : 0);
