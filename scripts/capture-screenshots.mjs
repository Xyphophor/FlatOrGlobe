#!/usr/bin/env node
// Outil ponctuel (PAS un audit officiel) : capture une image PLEINE PAGE de
// chaque onglet, et pour quelques onglets pilotés par un menu d'exemples,
// une seconde capture après avoir choisi un autre exemple -- pour que
// l'assistant puisse RELIRE le rendu réel plutôt que deviner depuis le code.
// Mêmes garde-fous mémoire que scripts/audit_figures.mjs (voir ce fichier
// pour le détail) : un navigateur relancé par capture, vérification de
// /proc/meminfo avant chacune, jamais de plein écran géant.
//
// Usage : node scripts/capture-screenshots.mjs <dossier-sortie> [--tabs sim,hh,...] [--min-free-mb 800]
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const TABS_ALL = [
  "home", "elev", "hh", "ref", "cnav", "star", "dist", "dip", "grav", "fou",
  "seis", "mag", "sun", "twi", "azim", "surv", "ct", "gps", "obs", "falsify",
];

// onglets pilotés par un menu d'exemples : {selector, valeur d'un exemple
// différent du défaut d'ouverture} -- une seule capture alternative par
// onglet, pas une combinatoire complète.
const ALT_PRESET = {
  sim: { selector: "#presetSel", value: "shkhara" },
  hh: { selector: "#hhSel", value: "shkhara" },
  dip: { selector: "#dipSel", value: null }, // rempli plus bas si l'id existe vraiment
  ct: { selector: "#ctSel", value: null },
  twi: { selector: null, value: null }, // pas de préréglage simple à sélectionner
  azim: { selector: null, value: null },
};

function freeMb() {
  try {
    const text = readFileSync("/proc/meminfo", "utf8");
    const m = text.match(/^MemAvailable:\s+(\d+)/m);
    return m ? Math.floor(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

async function captureOne(baseUrl, tab, outPath, alt) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto(`${baseUrl}/#tab-${tab}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(200);
    if (alt && alt.selector && alt.value) {
      const el = await page.$(alt.selector);
      if (el) {
        await page.selectOption(alt.selector, alt.value).catch(() => {});
        await page.waitForTimeout(200);
      }
    }
    await page.screenshot({ path: outPath, fullPage: true });
    return true;
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const outDir = args[0];
  if (!outDir || outDir.startsWith("--")) {
    console.log("Usage: node scripts/capture-screenshots.mjs <dossier-sortie> [--tabs a,b,c] [--min-free-mb 800]");
    process.exit(2);
  }
  let tabs = TABS_ALL;
  let minFreeMb = 800;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--tabs") tabs = args[++i].split(",").filter(Boolean);
    else if (args[i] === "--min-free-mb") minFreeMb = Number(args[++i]);
  }
  mkdirSync(outDir, { recursive: true });
  const baseUrl = "http://localhost:5173";

  const done = [];
  for (const tab of tabs) {
    const avail = freeMb();
    if (avail !== null && avail < minFreeMb) {
      console.log(`ABANDON avant '${tab}' : ${avail} Mio disponibles < ${minFreeMb}.`);
      break;
    }
    const outPath = path.join(outDir, `${tab}.png`);
    await captureOne(baseUrl, tab, outPath);
    done.push(outPath);
    console.log(`${tab}: ${outPath} (${freeMb()} Mio disponibles)`);

    const alt = ALT_PRESET[tab];
    if (alt && alt.selector && alt.value) {
      const avail2 = freeMb();
      if (avail2 !== null && avail2 < minFreeMb) {
        console.log(`  (variante sautée : ${avail2} Mio < ${minFreeMb})`);
        continue;
      }
      const altPath = path.join(outDir, `${tab}-alt.png`);
      await captureOne(baseUrl, tab, altPath, alt);
      done.push(altPath);
      console.log(`  variante (${alt.value}): ${altPath} (${freeMb()} Mio disponibles)`);
    }
  }
  console.log(`\n${done.length} capture(s) écrite(s) dans ${outDir}`);
}

main();
