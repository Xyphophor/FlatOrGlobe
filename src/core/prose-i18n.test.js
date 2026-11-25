// Une traduction de prose ne doit jamais changer la structure de la page
// (2026-10-01, epic15/UC06) : même ensemble d'ids en anglais et dans chaque
// langue (tables, tbody, canvas, expériences, commandes) -- les scripts des
// onglets remplissent et dessinent par id. Un bloc traduit en entier
// ({ __html }) qui porterait un id numéroté à la mauvaise position, ou une clé
// partagée par deux blocs, casserait un onglet dans cette langue seulement.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { parseHTML } from "linkedom";

const { window, document, HTMLElement } = parseHTML("<!doctype html><html><body></body></html>");
Object.assign(globalThis, { window, document, HTMLElement });
const { renderProse } = await import("./prose.js");
const ids = (html) => { const { document: D } = parseHTML(`<!doctype html><html><body>${html}</body></html>`); return [...D.querySelectorAll("[id]")].map((e) => `${e.tagName}#${e.id}`).sort(); };

const tabs = readdirSync("src/data/prose").filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));
for (const tab of tabs) {
  test(`prose ${tab} : mêmes ids dans chaque langue, clés uniques`, async () => {
    const { PROSE } = await import(`../data/prose/${tab}.js`);
    const flat = []; const walk = (bs) => bs.forEach((b) => { flat.push(b); if (b.blocks) walk(b.blocks); }); walk(PROSE);
    const keys = flat.map((b) => b.k).filter(Boolean);
    assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), [], "clé k portée par deux blocs");
    const en = ids(renderProse(tab, PROSE, {}));
    for (const lang of readdirSync("src/i18n")) {
      const p = `src/i18n/${lang}/${tab}-prose.json`;
      if (!existsSync(p)) continue;
      assert.deepEqual(ids(renderProse(tab, PROSE, { dict: JSON.parse(readFileSync(p, "utf8")) })), en, `${lang} : ids différents de l'anglais`);
    }
  });
}
