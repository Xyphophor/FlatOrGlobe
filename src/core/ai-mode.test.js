// Mode IA (epic20) : les fichiers publiés par scripts/build_ai.mjs (public/llms.txt, public/ai/*.md).
// Ce test ne les régénère pas (il faudrait monter les onglets : voir `build_ai.mjs --check`) ;
// il vérifie qu'ils existent pour chaque onglet, qu'ils sont du Markdown propre et qu'aucune
// coordonnée privée du propriétaire n'y figure.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TAB_GROUPS } from "../data/tabgroups.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pub = path.join(root, "public");
const tabs = readdirSync(path.join(root, "src/tabs"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && existsSync(path.join(root, "src/tabs", d.name, "index.js"))).map((d) => d.name);
const md = (k) => readFileSync(path.join(pub, "ai", `${k}.md`), "utf8");

test("un fichier par onglet, tous listés dans llms.txt", () => {
  const llms = readFileSync(path.join(pub, "llms.txt"), "utf8");
  for (const k of tabs) {
    assert.ok(existsSync(path.join(pub, "ai", `${k}.md`)), `public/ai/${k}.md manque`);
    assert.ok(llms.includes(`(/ai/${k}.md)`), `llms.txt ne liste pas ${k}`);
  }
  for (const g of TAB_GROUPS) for (const k of g.tabs) assert.ok(tabs.includes(k), `groupe ${g.id} : onglet ${k} inconnu`);
  assert.equal(readFileSync(path.join(pub, "ai", "index.md"), "utf8"), llms);
});

test("Markdown propre : ni balise HTML, ni NaN, ni lien vide, ni macro TeX du site", () => {
  for (const k of tabs) {
    const s = md(k);
    assert.ok(!/<\/?(div|span|p|table|tr|td|canvas|svg|br|b|em|a)\b[^>]*>/i.test(s), `${k} : balise HTML restée`);
    assert.ok(!/\bNaN\b|\bundefined\b|\[object /.test(s), `${k} : valeur non calculée`);
    assert.ok(!/\[\]\(/.test(s), `${k} : lien sans texte`);
    assert.ok(!/\\(g|f|soft|bold)\{|\\(arcmin|arcsec|dprime|percent)(?![a-zA-Z])/.test(s), `${k} : macro TeX propre au site`);
  }
});

test("chaque renvoi [n] a sa source dans le même fichier", () => {
  for (const k of tabs) {
    const s = md(k);
    const at = s.lastIndexOf("\n## Sources");
    if (at < 0) continue;
    const nSrc = (s.slice(at).match(/^\d+\. /gm) || []).length;
    for (const m of s.slice(0, at).matchAll(/\[(\d+)\](?!\()/g)) assert.ok(+m[1] <= nSrc, `${k} : [${m[1]}] sans source (${nSrc} sources)`);
  }
});

test("les sections de preuve portent leur classe", () => {
  const ev = readFileSync(path.join(pub, "ai", "dip.md"), "utf8");
  assert.match(ev, /^## .*\[evidence: (measurement|check|prediction)/m);
});

test("aucune coordonnée privée (balcon de Bordighera)", { skip: !existsSync(path.join(root, "data/hh/bordighera/raw/eye.json")) }, () => {
  const { lat, lon } = JSON.parse(readFileSync(path.join(root, "data/hh/bordighera/raw/eye.json"), "utf8"));
  const all = [readFileSync(path.join(pub, "llms-full.txt"), "utf8"), ...tabs.map(md)].join("\n");
  for (const v of [lat, lon]) for (const d of [3, 4, 5]) assert.ok(!all.includes(v.toFixed(d)), `coordonnée privée trouvée (${d} décimales)`);
});
