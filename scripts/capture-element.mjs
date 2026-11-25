#!/usr/bin/env node
// Capture ponctuelle d'UN élément précis (pas la page entière) -- pour
// vérifier de près un chevauchement signalé par audit_figures.mjs sans
// dépendre d'un lecteur d'image qui réduit une capture pleine page à un
// format illisible en détail. Mêmes garde-fous mémoire que les autres
// scripts de ce dossier (voir audit_figures.mjs).
// Usage : node scripts/capture-element.mjs <tab> <selecteur-css> <sortie.png> [--scale N]
import { chromium } from "playwright";

const [tab, selector, outPath, ...rest] = process.argv.slice(2);
const scaleIdx = rest.indexOf("--scale");
const scale = scaleIdx >= 0 ? Number(rest[scaleIdx + 1]) : 1;

if (!tab || !selector || !outPath) {
  console.log("Usage: node scripts/capture-element.mjs <tab> <selecteur-css> <sortie.png> [--scale N]");
  process.exit(2);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: scale });
  await page.goto(`http://localhost:5173/#tab-${tab}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const el = await page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: outPath });
  console.log(`écrit : ${outPath}`);
} finally {
  await browser.close();
}
