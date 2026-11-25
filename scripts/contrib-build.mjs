// Contributions publiées ou non au build (2026-10-15, demande du propriétaire : une contribution désactivée n'est
// pas cachée, elle n'est pas du tout envoyée au client). Voir src/tabs/contrib/registry.js.
//
//  - contribPlugin() : greffon Vite (vite.config.js), au build seulement. Avant que Rollup lise
//    src/tabs/contrib/registry.js, retire les lignes « // contrib:<clé> » des contributions que
//    src/data/contrib/published.json ne publie pas : leur module n'est jamais importé, rien d'elles (prose, textes
//    traduits, sources, carte, données, animation) n'est dans le bundle. Puis retire leurs photos de dist/ (public/
//    est copié tel quel par Vite).
//  - node scripts/contrib-build.mjs check <dist> : refuse (code 1) un build où une contribution non publiée a laissé
//    une trace : un de ses « canaris » (chaînes qui n'appartiennent qu'à elle, contribution.js) dans un fichier, ou
//    une de ses photos. Lancé par le Dockerfile après `vite build`.
import { readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const REGISTRY = "src/tabs/contrib/registry.js";

/** Les contributions publiées : { clé: true|false } (src/data/contrib/published.json). */
export function published(root = ROOT) {
  return JSON.parse(readFileSync(path.join(root, "src/data/contrib/published.json"), "utf8"));
}

/** Le registre sans les lignes des contributions non publiées. Une clé marquée dans le registre mais absente de
 * published.json lève : une contribution doit être publiée ou non, explicitement. */
export function stripUnpublished(code, pub) {
  return code.split("\n").filter((line) => {
    const m = /\/\/ contrib:([a-z0-9-]+)\s*$/.exec(line);
    if (!m) return true;
    if (!(m[1] in pub)) throw new Error(`contrib: « ${m[1]} » n'est pas dans src/data/contrib/published.json`);
    return pub[m[1]] === true;
  }).join("\n");
}

/** Le greffon Vite. */
export function contribPlugin() {
  let outDir = "dist", root = ROOT;
  return {
    name: "flatorglobe-contrib",
    apply: "build",
    enforce: "pre",
    configResolved(c) { root = c.root; outDir = path.resolve(c.root, c.build.outDir); },
    transform(code, id) {
      if (id.replaceAll("\\", "/").endsWith(REGISTRY)) return { code: stripUnpublished(code, published(root)), map: null };
      return null;
    },
    closeBundle() {
      const pub = published(root), dir = path.join(outDir, "photos");
      let names = [];
      try { names = readdirSync(dir); } catch { return; }
      for (const [key, on] of Object.entries(pub)) {
        if (on) continue;
        for (const f of names) if (f.startsWith(`contrib-${key}-`)) rmSync(path.join(dir, f));
      }
    },
  };
}

function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
}

/** Les traces des contributions non publiées dans un dossier construit : [{ key, file, what }]. */
export async function leaks(dist, { root = ROOT, pub = published(root) } = {}) {
  const out = [];
  const files = walk(dist);
  for (const [key, on] of Object.entries(pub)) {
    if (on) continue;
    const { default: c } = await import(path.join(root, "src/tabs/contrib", key, "contribution.js"));
    for (const f of files) {
      const rel = path.relative(dist, f).replaceAll("\\", "/");
      if (c.photos.some((p) => rel.startsWith(p))) { out.push({ key, file: rel, what: "photo" }); continue; }
      if (statSync(f).size > 20e6 || /\.(jpe?g|png|webp|gif|pdf|mp4|woff2?)$/i.test(f)) continue;
      const s = readFileSync(f, "utf8");
      for (const w of c.canaries) if (s.includes(w)) out.push({ key, file: rel, what: w });
    }
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, dist] = process.argv.slice(2);
  if (cmd !== "check" || !dist) { console.error("usage: node scripts/contrib-build.mjs check <dist>"); process.exit(2); }
  const L = await leaks(path.resolve(dist));
  for (const l of L) console.error(`contrib « ${l.key} » non publiée : ${l.what} dans ${l.file}`);
  const pub = published();
  console.log(L.length ? `${L.length} trace(s) de contributions non publiées` : `contributions : ${Object.entries(pub).map(([k, v]) => `${k} ${v ? "publiée" : "retirée"}`).join(", ")} -- aucune trace`);
  process.exit(L.length ? 1 : 0);
}
