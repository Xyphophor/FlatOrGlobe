import { test } from "node:test";
import assert from "node:assert/strict";
import { renderProse, flatten } from "./prose.js";

test("renderProse falls back to the block's own English html when no dict is given", () => {
  const out = renderProse("t", [{ t: "h2", html: "Hello", k: "h2-1" }]);
  assert.match(out, /<h2 class="cnav-h2" data-sec="h2-1">Hello<\/h2>/);
});

test("renderProse uses the dict translation for a block's key when present (epic04/UC01)", () => {
  const out = renderProse("t", [{ t: "h2", html: "Hello", k: "h2-1" }], { dict: { "h2-1": "Bonjour" } });
  assert.match(out, /<h2 class="cnav-h2" data-sec="h2-1">Bonjour<\/h2>/);
});

test("renderProse falls back to English when the dict has no entry for the block's key", () => {
  const out = renderProse("t", [{ t: "notes", html: "Hello", k: "n-1" }], { dict: { "other-key": "Bonjour" } });
  assert.match(out, /<p class="notes">Hello<\/p>/);
});

test("renderProse falls back to English when a block carries no k at all, even with a dict", () => {
  const out = renderProse("t", [{ t: "notes", html: "Hello" }], { dict: { "n-1": "Bonjour" } });
  assert.match(out, /<p class="notes">Hello<\/p>/);
});

test("renderProse translates notes-block paragraphs only when the array length matches (legacy rule: length mismatch -> English)", () => {
  const block = { t: "notes-block", k: "nb-1", paras: ["One", "Two"] };
  const ok = renderProse("t", [block], { dict: { "nb-1": ["Un", "Deux"] } });
  assert.match(ok, /<p>Un<\/p><p>Deux<\/p>/);
  const mismatched = renderProse("t", [block], { dict: { "nb-1": ["Un"] } });
  assert.match(mismatched, /<p>One<\/p><p>Two<\/p>/);
});

test("renderProse passes the dict through nested sections (sim/hh)", () => {
  const block = { t: "section", id: "s1", blocks: [{ t: "h2", html: "Hello", k: "h2-1" }] };
  const out = renderProse("t", [block], { dict: { "h2-1": "Bonjour" } });
  assert.match(out, /<section id="s1"><h2 class="cnav-h2" data-sec="h2-1">Bonjour<\/h2><\/section>/);
});

test("flatten still descends into sections after the dict plumbing change", () => {
  const block = { t: "section", blocks: [{ t: "h2", html: "x" }] };
  assert.deepEqual(flatten([block]), [{ t: "h2", html: "x" }]);
});
