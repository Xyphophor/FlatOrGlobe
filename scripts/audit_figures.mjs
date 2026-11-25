#!/usr/bin/env node
// Audit visuel (epic07/UC03) : charge chaque onglet dans un navigateur
// headless RÉEL (Playwright) à plusieurs largeurs de test, et signale les
// chevauchements de texte et les scènes exagérées sans étiquette de facteur
// (règle 1). Équivalent de audit-figures.js du legacy.
//
// EN NODE, PAS EN PYTHON, PAR NÉCESSITÉ : le plan initial (epic07/UC03)
// voulait Playwright pour Python, cohérent avec "audits en Python" (voir
// NOTES.md, décision du 2026-09-12). Cette machine n'a ni pip ni le paquet
// python3-venv (les deux demandent `sudo apt install`, jamais fait sans
// demande explicite) -- Playwright existe aussi comme paquet npm, déjà
// dans les devDependencies de ce projet, sans rien installer au niveau du
// système. Même logique, même prudence mémoire que audit_figures.py
// (gardé comme référence/si Python devient un jour disponible) :
//   - PAS de capture d'écran nulle part -- seulement page.evaluate() sur
//     le DOM déjà rendu.
//   - Viewport modeste, hauteur FIXE 900px (jamais les 6000px de
//     l'incident du 2026-09-14).
//   - Un navigateur relancé PAR ONGLET par défaut : mémoire rendue au
//     système entre deux onglets plutôt qu'accumulée.
//   - Vérifie /proc/meminfo (MemAvailable) avant de lancer quoi que ce
//     soit et avant chaque onglet ; s'arrête proprement en dessous de
//     --min-free-mb (800 par défaut).
//   - Se lance idéalement sous `ulimit -v <Kio>` (hérité par Chromium en
//     sous-processus) pour qu'un dérapage plante proprement au lieu de
//     mettre tout le système en swap-thrashing -- voir npm run
//     audit:figures, qui l'enveloppe déjà.
//
// Usage :
//   node scripts/audit_figures.mjs [--base-url http://localhost:5173]
//                                   [--widths 380,480,768,1024,1440]
//                                   [--tabs sim,hh,...]
//                                   [--min-free-mb 800]
//                                   [--no-fresh-browser-per-tab]
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const TABS_ALL = [
  "home", "elev", "hh", "ref", "cnav", "star", "dist", "dip", "grav", "fou",
  "seis", "mag", "sun", "twi", "azim", "surv", "ct", "gps", "obs", "falsify",
];

// une chaîne TeX ne contient jamais de guillemet : capture jusqu'au premier
// caractère de fermeture rencontré, quel que soit l'échappement -- même
// principe que audit_tex.py. Ici : boîtes englobantes de texte visible,
// lues en DOM (pas de pixel/OCR) : <text> SVG (source la plus fiable, une
// vraie boîte de layout) et les annotations .reads/.fcap que les moteurs
// déposent à côté d'un canvas peint.
// fonction réelle, pas une chaîne : page.evaluate() du Playwright JS
// n'appelle pas automatiquement une chaîne de source qui s'évalue en
// fonction (contrairement à l'API Python) -- passer la fonction elle-même
// est à la fois plus sûr et plus simple, maintenant qu'on est déjà en JS.
function collectPageData() {
  const rectsOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  };
  const texts = [];
  document.querySelectorAll("#tabpanels svg text, #tabpanels .reads .r, #tabpanels .fcap").forEach((el) => {
    if (!el.textContent || !el.textContent.trim()) return;
    if (el.closest("[hidden]")) return;
    const r = rectsOf(el);
    if (r.w <= 0 || r.h <= 0) return;
    texts.push({ tag: el.tagName, text: el.textContent.trim().slice(0, 40), ...r });
  });
  // seul <svg> peut être jugé ici : ses <text> sont du vrai DOM (fig.js
  // y timbre systématiquement not-to-scale/true-scale/exaggeration --
  // règle 1). Un <canvas> peint son étiquette en PIXELS (ctx.fillText),
  // illisible sans OCR -- l'inclure ferait planter systématiquement
  // TOUTE scène canvas, règle 1 ou pas (faux positif garanti, pas un
  // vrai signal). Un élément caché (`hidden`, ou un ancêtre `.fig`
  // caché -- ex. le canvas #tan3d neutralisé de sim, epic02/UC11) n'est
  // pas une scène à juger : personne ne la voit.
  const scenes = [];
  document.querySelectorAll("#tabpanels svg").forEach((el) => {
    if (el.closest("[hidden]")) return;
    const host = el.closest(".fig") || el.parentElement;
    const label = (host ? host.textContent : "") + " " + (el.getAttribute("aria-label") || "");
    scenes.push({ tag: el.tagName, id: el.id || null, aria: el.getAttribute("aria-label") || null,
      hasScaleWord: /not to scale|true scale|exaggerat/i.test(label) });
  });
  return { texts, scenes };
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Mémoire DISPONIBLE en Mio (MemAvailable de /proc/meminfo -- compte le
 * cache récupérable, comme le noyau avant de swapper). null hors Linux. */
function freeMb() {
  try {
    const text = readFileSync("/proc/meminfo", "utf8");
    const m = text.match(/^MemAvailable:\s+(\d+)/m);
    return m ? Math.floor(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

async function auditTab(page, baseUrl, tab, width, screenshotPath) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${baseUrl}/#tab-${tab}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(150); // laisse une frame de rAF s'exécuter
  if (screenshotPath) {
    // fullPage: false -- une capture pleine page peut dépasser largement le
    // viewport (certains onglets sont longs) ; on reste sur ce qui tient à
    // l'écran, le coût mémoire réel de l'incident du 2026-09-14 venait d'un
    // viewport ÉNORME (1200x6000) plus que du principe même de capturer.
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }
  const data = await page.evaluate(collectPageData);

  const issues = [];
  const texts = data.texts;
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      if (boxesOverlap(texts[i], texts[j])) {
        issues.push(`${tab}@${width}px: chevauchement "${texts[i].text}" / "${texts[j].text}"`);
      }
    }
  }
  for (const scene of data.scenes) {
    if ((scene.id || scene.aria) && !scene.hasScaleWord) {
      issues.push(`${tab}@${width}px: scène ${scene.tag}#${scene.id || scene.aria} sans étiquette d'échelle (not to scale / true scale / exaggeration) -- règle 1`);
    }
  }
  return issues;
}

function parseArgs(argv) {
  const args = { baseUrl: "http://localhost:5173", widths: "380,480,768,1024,1440", tabs: TABS_ALL.join(","), minFreeMb: 800, freshBrowserPerTab: true, screenshot: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--base-url") args.baseUrl = argv[++i];
    else if (a === "--widths") args.widths = argv[++i];
    else if (a === "--tabs") args.tabs = argv[++i];
    else if (a === "--min-free-mb") args.minFreeMb = Number(argv[++i]);
    else if (a === "--no-fresh-browser-per-tab") args.freshBrowserPerTab = false;
    else if (a === "--screenshot") args.screenshot = argv[++i]; // chemin PNG ; exige un seul onglet x une seule largeur
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const widths = args.widths.split(",").filter(Boolean).map(Number);
  const tabs = args.tabs.split(",").filter(Boolean);

  if (args.screenshot && (tabs.length !== 1 || widths.length !== 1)) {
    console.log("--screenshot exige exactement un onglet (--tabs) et une largeur (--widths) -- pas de rafale de captures.");
    process.exit(2);
  }

  let avail = freeMb();
  if (avail !== null && avail < args.minFreeMb) {
    console.log(`ABANDON avant de lancer quoi que ce soit : ${avail} Mio disponibles < --min-free-mb ${args.minFreeMb}.`);
    process.exit(3);
  }

  const allIssues = [];
  let aborted = false;
  let browser = args.freshBrowserPerTab ? null : await chromium.launch();
  let page = args.freshBrowserPerTab ? null : await browser.newPage();

  for (const tab of tabs) {
    avail = freeMb();
    if (avail !== null && avail < args.minFreeMb) {
      console.log(`ABANDON avant l'onglet '${tab}' : ${avail} Mio disponibles < --min-free-mb ${args.minFreeMb}.`);
      aborted = true;
      break;
    }
    if (args.freshBrowserPerTab) {
      browser = await chromium.launch();
      page = await browser.newPage();
    }
    for (const width of widths) {
      try {
        allIssues.push(...(await auditTab(page, args.baseUrl, tab, width, args.screenshot)));
      } catch (e) {
        allIssues.push(`${tab}@${width}px: exception pendant l'audit -- ${e.message}`);
      }
    }
    if (args.freshBrowserPerTab) await browser.close();
  }
  if (!args.freshBrowserPerTab) await browser.close();

  if (allIssues.length) {
    console.log(`${allIssues.length} problème(s)${aborted ? " (run abandonné en cours de route, voir ci-dessus)" : ""} :`);
    for (const msg of allIssues) console.log(`  - ${msg}`);
    process.exit(1);
  }
  if (aborted) {
    console.log("Run abandonné avant la fin (mémoire) -- aucun problème trouvé sur les onglets traités, mais la liste n'est pas complète.");
    process.exit(3);
  }
  console.log(`audit_figures: OK -- ${tabs.length} onglet(s) x ${widths.length} largeur(s), aucun chevauchement, aucune scène sans étiquette d'échelle.`);
}

main();
