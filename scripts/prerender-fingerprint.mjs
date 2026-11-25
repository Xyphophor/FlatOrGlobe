// Empreinte des vidéos de cartes (epic25/UC03) : de quoi dépend le MP4 d'une carte d'un onglet, haché.
//   - le code de l'onglet ET tout ce qu'il importe (graphe d'imports relatifs, statiques et dynamiques) ;
//   - les cartes de l'onglet (src/data/cards/<onglet>.js) et les textes anglais (src/i18n/en/<onglet>*.json + export…) ;
//   - les photos et cartes (public/photos|maps/…) que ce code nomme ;
//   - le noyau de rendu : export-card.js, ctx-record.js, raster.js (et leurs imports), prerender-env/encode.mjs,
//     le moteur Rust (raster/src, Cargo.lock, polices).
// Changer un octet de ces fichiers change l'empreinte (hors lignes entièrement en commentaire `//` et espaces de
// fin de ligne). src/data/video-cards.json (versionné) garde l'empreinte de chaque onglet rendu ; `make ci` échoue
// si elle ne correspond plus, et la page ne reçoit que les vidéos dont l'empreinte est à jour (prerender-manifest.mjs).
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'](\.{1,2}\/[^"']+)["']/g;
const ASSET = /["'`]\/?((?:photos|maps)\/[\w./-]+\.(?:jpe?g|png|webp))["'`]/g;
const SHARED_I18N = ["export", "evidence", "nav", "landscape", "flatten"];

const sha = (b) => createHash("sha256").update(b).digest("hex");
/** Contenu normalisé : sans les lignes entièrement en commentaire `//` ni les espaces de fin de ligne. */
export function normalize(text) { return text.split("\n").filter((l) => !/^\s*\/\//.test(l)).map((l) => l.replace(/\s+$/, "")).join("\n"); }
const hashFile = (f) => (/\.(m?js|json|rs|toml)$/.test(f) ? sha(normalize(readFileSync(f, "utf8"))) : sha(readFileSync(f)));

function resolve(from, spec) {
  const base = path.resolve(path.dirname(from), spec);
  for (const c of [base, base + ".js", base + ".mjs", path.join(base, "index.js")]) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
}

/** Fichiers atteints depuis `entries` par des imports relatifs (les entrées comprises) ; `assets` = photos/cartes nommées. */
export function reach(entries, root) {
  const seen = new Set(), assets = new Set(), stack = entries.map((e) => path.resolve(root, e)).filter((f) => existsSync(f));
  while (stack.length) {
    const f = stack.pop(); if (seen.has(f)) continue; seen.add(f);
    if (!/\.m?js$/.test(f)) continue;
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(IMPORT)) { const r = resolve(f, m[1]); if (r && !seen.has(r)) stack.push(r); }
    for (const m of src.matchAll(ASSET)) assets.add(path.join(root, "public", m[1]));
  }
  return { files: seen, assets };
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir).sort()) { const f = path.join(dir, n); if (statSync(f).isDirectory()) walk(f, out); else out.push(f); }
  return out;
}

/** Noyau commun à toutes les vidéos : le moteur de rendu et l'encodage. */
function coreFiles(root) {
  const { files } = reach(["src/core/export-card.js", "src/core/ctx-record.js", "src/core/raster.js", "scripts/prerender-env.mjs", "scripts/prerender-encode.mjs"], root);
  for (const f of ["raster/Cargo.toml", "raster/Cargo.lock", ...walk(path.join(root, "raster/src")), ...walk(path.join(root, "raster/fonts")).filter((x) => /\.ttf$/.test(x))]) { const p = path.resolve(root, f); if (existsSync(p)) files.add(p); }
  return files;
}

/** { onglet: empreinte (16 hexa) } */
export function fingerprints(tabs, root = process.cwd()) {
  const core = coreFiles(root), out = {};
  for (const tab of tabs) {
    const { files, assets } = reach([`src/tabs/${tab}/index.js`, `src/data/cards/${tab}.js`], root);
    const i18n = readdirSync(path.join(root, "src/i18n/en")).filter((n) => n.endsWith(".json") && (n === `${tab}.json` || n === `${tab}-cards.json` || SHARED_I18N.includes(n.slice(0, -5)))).map((n) => path.join(root, "src/i18n/en", n));
    const all = new Set([...core, ...files, ...i18n, ...[...assets].filter((a) => existsSync(a))]);
    const lines = [...all].map((f) => `${path.relative(root, f)}\0${hashFile(f)}`).sort();
    out[tab] = sha(lines.join("\n")).slice(0, 16);
  }
  return out;
}

/** Empreinte d'un calque vidéo (src/data/video-layers.js) : son module et ses imports, le noyau de rendu et le script qui
 *  l'encode ; pas de textes (un calque n'en a aucun). 16 hexa. */
// 2026-11-18 : le noyau d'un calque est ce qui fait ses pixels (enregistreur, wasm, environnement), pas le moteur des cartes
// (export-card.js importe le registre des badges, qui ne change aucune image de calque)
export function layerFingerprint(entry, root = process.cwd()) {
  const { files: core } = reach(["src/core/ctx-record.js", "src/core/raster.js", "scripts/prerender-env.mjs"], root);
  for (const f of ["raster/Cargo.toml", "raster/Cargo.lock", ...walk(path.join(root, "raster/src")), ...walk(path.join(root, "raster/fonts")).filter((x) => /\.ttf$/.test(x))]) { const p = path.resolve(root, f); if (existsSync(p)) core.add(p); }
  const { files } = reach([entry, "scripts/prerender-layers.mjs"], root);
  const lines = [...new Set([...core, ...files])].map((f) => `${path.relative(root, f)}\0${hashFile(f)}`).sort();
  return sha(lines.join("\n")).slice(0, 16);
}
