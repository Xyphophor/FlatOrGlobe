// Les contributions publiées ou non (2026-10-15) : le build ne peut pas tourner sur la machine du propriétaire, donc
// ce qui le garantit est testé ici -- le retrait des lignes du registre, l'absence de toute trace d'une contribution
// hors de ses propres fichiers (pour que retirer son module suffise), et le contrôle de dist/ (scripts/contrib-build.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { stripUnpublished, leaks, published, REGISTRY } from "../../../scripts/contrib-build.mjs";
import { ALL, CONTRIBUTIONS, SOURCE_ORDER, resolveCites } from "./registry.js";

const code = readFileSync(REGISTRY, "utf8");

test("published.json names every contribution of the registry, and nothing else", () => {
  const pub = published(), keys = ALL.map((c) => c.key);
  assert.deepEqual(Object.keys(pub).sort(), [...keys].sort());
  for (const v of Object.values(pub)) assert.equal(typeof v, "boolean");
  const all = process.env.CONTRIB_ALL === "1";   // CONTRIB_ALL=1 : toutes, comme au serveur de dev
  assert.deepEqual(CONTRIBUTIONS.map((c) => c.key), keys.filter((k) => all || pub[k]));
});

test("stripping an unpublished contribution removes its import and its entry, and only those", () => {
  for (const off of ALL.map((c) => c.key)) {
    const pub = Object.fromEntries(ALL.map((c) => [c.key, c.key !== off]));
    const s = stripUnpublished(code, pub);
    assert.ok(!s.includes(`./${off}/contribution.js`), `${off}: import left`);
    assert.ok(!new RegExp(`^\\s*${off},`, "m").test(s), `${off}: entry left`);
    for (const c of ALL) if (c.key !== off) assert.ok(s.includes(`./${c.key}/contribution.js`) && new RegExp(`^\\s*${c.key},`, "m").test(s), `${c.key} lost`);
    assert.equal(code.split("\n").length - s.split("\n").length, 2);
  }
  assert.throws(() => stripUnpublished(code, {}), /published\.json/);
});

// les fichiers d'une contribution : son dossier, ses presets, ses photos ; et les sorties générées depuis les
// contributions publiées (mode IA), qui ne la contiennent que si elle l'est
const own = (key, rel) => rel.startsWith(`src/tabs/contrib/${key}/`) || rel.startsWith(`src/data/presets/contrib-${key}`) || rel.startsWith(`public/photos/contrib-${key}-`);
const generated = (rel) => rel.startsWith("public/ai/") || rel.startsWith("public/llms") ;
const files = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(`${d}/${e.name}`) : [`${d}/${e.name}`]));

test("a contribution leaves no trace outside its own files (so that dropping its module drops everything)", () => {
  const all = [...files("src"), ...files("public")].filter((f) => /\.(js|json|css|html|md|txt|svg|tex)$/.test(f) && !f.endsWith(".test.js"));
  const pub = published();
  for (const c of ALL) {
    assert.ok(c.canaries.length >= 3, `${c.key}: canaries`);
    for (const f of all) {
      if (own(c.key, f) || (generated(f) && pub[c.key])) continue;
      const s = readFileSync(f, "utf8");
      for (const w of c.canaries) assert.ok(!s.includes(w), `${c.key}: « ${w} » in ${f}${generated(f) ? " (generated: rerun build_ai after changing published.json)" : ""}`);
    }
  }
});

test("citations are numbered over the published contributions only, and resolve", () => {
  for (const c of CONTRIBUTIONS) for (const id of c.sources) assert.ok(SOURCE_ORDER.includes(id));
  assert.equal(new Set(SOURCE_ORDER).size, SOURCE_ORDER.length);
  if (SOURCE_ORDER.length) assert.match(resolveCites(`x⟦cite:${SOURCE_ORDER[0]}⟧`), /\[1\]/);
  assert.throws(() => resolveCites("⟦cite:nope⟧"), /absente/);
});

test("check dist: an unpublished contribution's text or photo is caught", async () => {
  const d = mkdtempSync(path.join(tmpdir(), "contrib-dist-"));
  try {
    mkdirSync(`${d}/assets`); mkdirSync(`${d}/photos`);
    writeFileSync(`${d}/assets/index-abc.js`, "console.log('nothing to see')");
    const [a, b] = ALL;
    const pub = { [a.key]: false, [b.key]: true };
    assert.deepEqual(await leaks(d, { pub }), []);
    writeFileSync(`${d}/assets/chunk-x.js`, `const t = "${a.canaries[0]}";`);
    writeFileSync(`${d}/${a.photos[0]}2023.jpg`, "jpg");
    writeFileSync(`${d}/${b.photos[0]}2024.jpg`, "jpg");
    const L = await leaks(d, { pub });
    assert.ok(L.some((l) => l.key === a.key && l.what === a.canaries[0]));
    assert.ok(L.some((l) => l.key === a.key && l.what === "photo"));
    assert.ok(!L.some((l) => l.key === b.key), "a published contribution is not a leak");
  } finally { rmSync(d, { recursive: true, force: true }); }
});
