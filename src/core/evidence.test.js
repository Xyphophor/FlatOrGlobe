// Classes de preuve (epic17/UC01) : node --test src/core/evidence.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { EVIDENCE, EV_CLASSES, tabClasses } from "../data/evidence.js";
import { evBadge } from "./evidence.js";
import { renderProse } from "./prose.js";
import { _setDicts, dictExtras } from "./i18n.js";

const LANGS = ["en", "fr"];
// evidence.json, plus les textes apportés par les contributions publiées (src/tabs/contrib/<clé>/i18n, addDict)
const ev = Object.fromEntries(LANGS.map((l) => [l, { ...JSON.parse(readFileSync(`src/i18n/${l}/evidence.json`, "utf8")), ...(dictExtras()[l]?.evidence ?? {}) }]));
const REWRITE = { sun: "src/tabs/sun/index.js", twi: "src/tabs/twi/index.js" };

function h2Keys(blocks, out = new Set()) {
  for (const b of blocks) { if (b.t === "h2" && b.k) out.add(b.k); if (b.blocks) h2Keys(b.blocks, out); }
  return out;
}

test("en et fr ont les mêmes textes ; chaque classe et chaque « où le rayon entre » existent", () => {
  assert.deepEqual(Object.keys(ev.fr).sort(), Object.keys(ev.en).sort());
  for (const l of LANGS) for (const c of EV_CLASSES) for (const k of [`cls-${c}`, `def-${c}`, `legend-${c}`]) assert.ok(ev[l][k], `${l} ${k}`);
  for (const [tab, m] of Object.entries(EVIDENCE)) for (const [k, e] of Object.entries(m)) {
    assert.ok(EV_CLASSES.includes(e.cls), `${tab}/${k} : classe ${e.cls}`);
    if (e.cls === "check") assert.ok(e.enters && ev.en[e.enters] && ev.fr[e.enters], `${tab}/${k} : une validation dit où le rayon entre`);
  }
});

test("chaque clé du registre est un vrai titre de section de son onglet", async () => {
  for (const [tab, m] of Object.entries(EVIDENCE)) {
    if (REWRITE[tab]) {
      const src = readFileSync(REWRITE[tab], "utf8");
      for (const k of Object.keys(m)) assert.ok(src.includes(`evBadge("${tab}", "${k}")`), `${tab}/${k} : badge posé dans index.js`);
      continue;
    }
    assert.ok(existsSync(`src/data/prose/${tab}.js`), `${tab} : prose`);
    const keys = h2Keys((await import(`../data/prose/${tab}.js`)).PROSE);
    for (const k of Object.keys(m)) assert.ok(keys.has(k), `${tab}/${k} : pas de titre de section avec cette clé`);
  }
});

test("le badge survit à la traduction : un titre classé traduit en bloc ({__html}) finit par </h2>", () => {
  for (const [tab, m] of Object.entries(EVIDENCE)) {
    const p = `src/i18n/fr/${tab}-prose.json`;
    if (REWRITE[tab] || !existsSync(p)) continue;
    const d = JSON.parse(readFileSync(p, "utf8"));
    for (const k of Object.keys(m)) assert.ok(d[k] === undefined || typeof d[k] === "string" || /<\/h2>\s*$/.test(d[k].__html), `${tab}/${k} : titre traduit en bloc sans </h2> final, le badge serait perdu`);
  }
  _setDicts({ en: { evidence: ev.en }, fr: { evidence: ev.fr } });
  assert.match(renderProse("atmo", [{ t: "h2", k: "kr-h1", html: "Krakatoa" }]), /<h2 class="cnav-h2" data-sec="kr-h1">Krakatoa <span class="ev ev-measure"/);
  assert.match(evBadge("atmo", "kr-h1", "fr"), /ev-measure.*>mesure</);
  assert.match(evBadge("gps", "gps-raw-h2", "en"), /Where the radius enters/);
  assert.equal(evBadge("seis", "sq-h1", "en"), "", "une section d'explication n'a pas de badge");
});

test("tabClasses : l'ordre measure, check, model", () => {
  assert.deepEqual(tabClasses("orb"), ["measure", "check", "model"]);
  assert.deepEqual(tabClasses("seis"), ["check", "model"]);   // 2026-10-19 : ses mesures pures (Tonga, Krakatoa) sont passées dans atmo
  assert.deepEqual(tabClasses("home"), []);
});
