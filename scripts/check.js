// Filet de vérification minimal (tasks/epic01/UC07.org) : importe chaque
// module d'onglet sous src/tabs/*/index.js via l'API SSR de Vite (elle
// gère les imports CSS colocalisés sans navigateur, contrairement à un
// import() Node nu) et vérifie qu'il respecte le contrat mount/render/
// teardown (tasks/epic01/UC03.org). Ce script n'est PAS un des cinq
// audits legacy réécrits en Python (tasks/epic07/) : il vérifie la forme
// des modules JS au moment où ils s'importent, ce qui se fait
// naturellement ici plutôt qu'en Python.
import { createServer } from "vite";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tabsDir = path.join(root, "src/tabs");

function listTabDirs() {
  return readdirSync(tabsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => existsSync(path.join(tabsDir, name, "index.js")));
}

async function main() {
  const names = listTabDirs();
  if (!names.length) {
    console.error("check: no tab module found under src/tabs/*/index.js");
    process.exit(1);
  }

  const vite = await createServer({ root, server: { middlewareMode: true }, logLevel: "silent" });
  const errors = [];
  const seenKeys = new Set();

  try {
    for (const name of names) {
      const modPath = path.join(tabsDir, name, "index.js");
      let mod;
      try {
        mod = await vite.ssrLoadModule(modPath);
      } catch (e) {
        errors.push(`${name}: failed to import (${e.message})`);
        continue;
      }
      const tab = mod.default;
      if (!tab || typeof tab !== "object") {
        errors.push(`${name}: default export is not an object`);
        continue;
      }
      if (typeof tab.key !== "string" || !tab.key) {
        errors.push(`${name}: missing or invalid "key" (string) on the default export`);
      } else if (seenKeys.has(tab.key)) {
        errors.push(`${name}: duplicate tab key "${tab.key}"`);
      } else {
        seenKeys.add(tab.key);
      }
      if (typeof tab.mount !== "function") errors.push(`${name}: missing "mount(container)" function`);
      if (typeof tab.render !== "function") errors.push(`${name}: missing "render()" function`);
      if (tab.teardown != null && typeof tab.teardown !== "function") {
        errors.push(`${name}: "teardown" is present but is not a function`);
      }
    }
  } finally {
    await vite.close();
  }

  if (errors.length) {
    console.error(`check: ${errors.length} problem(s) found:\n` + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log(`check: ${names.length} tab module(s) OK (${[...seenKeys].join(", ")})`);
}

main();
