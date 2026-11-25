import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCENES, DRAW, REEL_T, sceneAt } from "./reel.js";

// 2026-10-25 : un commentaire posé au milieu de la ligne des scènes avait retiré hh et avia sans que rien ne casse
test("chaque scène dessinable est dans la vitrine, une seule fois, avec ses textes en/fr", () => {
  assert.deepEqual(SCENES.map((s) => s.key).sort(), Object.keys(DRAW).sort());
  for (const lang of ["en", "fr"]) {
    const t = JSON.parse(readFileSync(new URL(`../../i18n/${lang}/results.json`, import.meta.url), "utf8"));
    for (const s of SCENES) for (const k of ["k", "a", "b"]) assert.ok(t[`reel-${s.key}-${k}`], `${lang} reel-${s.key}-${k}`);
  }
});

test("sceneAt couvre la boucle", () => {
  assert.equal(sceneAt(0).i, 0);
  assert.equal(sceneAt(REEL_T - 0.01).i, SCENES.length - 1);
  assert.equal(sceneAt(REEL_T + 0.1).i, 0);
});
