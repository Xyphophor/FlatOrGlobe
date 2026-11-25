import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDicts, getDict, makeT, missingKeys } from "./i18n.js";

const dicts = buildDicts({
  "/src/i18n/en/sim.json": { title: "Elevation angles", lead: "Compare two models." },
  "/src/i18n/fr/sim.json": { title: "Angles d'élévation" },
});

test("buildDicts groups by language then tab from glob-style paths", () => {
  assert.deepEqual(Object.keys(dicts).sort(), ["en", "fr"]);
  assert.equal(getDict("en", "sim", dicts).lead, "Compare two models.");
});

test("makeT falls back to English for a key missing in the target language", () => {
  const t = makeT("fr", "sim", dicts);
  assert.equal(t("title"), "Angles d'élévation");
  assert.equal(t("lead"), "Compare two models.");
});

test("makeT falls back to the key itself when absent from every language", () => {
  const t = makeT("fr", "sim", dicts);
  assert.equal(t("nonexistent"), "nonexistent");
});

test("missingKeys lists English keys absent from the target language", () => {
  assert.deepEqual(missingKeys("fr", "sim", dicts), ["lead"]);
  assert.deepEqual(missingKeys("en", "sim", dicts), []);
});

const narrowDicts = buildDicts({
  "/src/i18n/en/sim.json": { "you": "You are here", "you::narrow": "You" },
  "/src/i18n/fr/sim.json": { "you": "Vous êtes ici" },
});

test("makeT with {narrow:true} uses the '::narrow' key when the current language has one (epic04/UC06)", () => {
  const t = makeT("en", "sim", narrowDicts);
  assert.equal(t("you", { narrow: true }), "You");
  assert.equal(t("you"), "You are here");
});

test("makeT with {narrow:true} falls back to the language's normal key, then to English, when no narrow variant exists", () => {
  const t = makeT("fr", "sim", narrowDicts);
  // fr has no "you::narrow" -- falls back to fr's normal "you", not English's narrow variant
  assert.equal(t("you", { narrow: true }), "Vous êtes ici");
});

test("makeT with {narrow:true} on a key with no narrow variant anywhere behaves like the plain lookup", () => {
  const t = makeT("fr", "sim", dicts);
  assert.equal(t("title", { narrow: true }), "Angles d'élévation");
  assert.equal(t("nonexistent", { narrow: true }), "nonexistent");
});
