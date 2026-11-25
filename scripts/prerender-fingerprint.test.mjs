import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fingerprints, normalize, reach } from "./prerender-fingerprint.mjs";

function tree(over = {}) {
  const r = mkdtempSync(path.join(tmpdir(), "fp-"));
  const put = (f, t) => { mkdirSync(path.dirname(path.join(r, f)), { recursive: true }); writeFileSync(path.join(r, f), t); };
  const files = {
    "src/core/export-card.js": 'import "./cards.js";', "src/core/cards.js": "export const a = 1;", "src/core/ctx-record.js": "", "src/core/raster.js": "",
    "scripts/prerender-env.mjs": "", "scripts/prerender-encode.mjs": "",
    "src/tabs/aa/index.js": 'import { x } from "./logic.js"; const p = "/photos/p.jpg"; export default x;', "src/tabs/aa/logic.js": "export const x = 1;",
    "src/tabs/bb/index.js": "export default 2;", "src/data/cards/aa.js": "export const CARDS = [];", "src/data/cards/bb.js": "export const CARDS = [];",
    "src/i18n/en/aa.json": "{}", "src/i18n/en/aa-cards.json": "{}", "src/i18n/en/bb.json": "{}", "src/i18n/en/export.json": "{}",
    "public/photos/p.jpg": "JPEG1", "raster/src/lib.rs": "fn main() {}", ...over,
  };
  for (const [f, t] of Object.entries(files)) put(f, t);
  return { r, put };
}

test("normalize drops whole-line // comments and trailing spaces only", () => {
  assert.equal(normalize("a  \n  // note\nb // trailing"), "a\nb // trailing");
});
test("imports are followed, assets named in code are included", () => {
  const { r } = tree(); const { files, assets } = reach(["src/tabs/aa/index.js"], r);
  assert.ok([...files].some((f) => f.endsWith("logic.js")));
  assert.ok([...assets].some((f) => f.endsWith("photos/p.jpg"))); rmSync(r, { recursive: true });
});
test("a change in a tab's own code, its text, a photo or the engine moves the right fingerprints", () => {
  const { r, put } = tree(); const f0 = fingerprints(["aa", "bb"], r);
  put("src/tabs/aa/logic.js", "export const x = 2;"); const f1 = fingerprints(["aa", "bb"], r);
  assert.notEqual(f1.aa, f0.aa); assert.equal(f1.bb, f0.bb);
  put("src/i18n/en/bb-cards.json", "{}"); put("src/i18n/en/bb.json", '{"k":"v"}'); const f2 = fingerprints(["aa", "bb"], r);
  assert.equal(f2.aa, f1.aa); assert.notEqual(f2.bb, f1.bb);
  put("public/photos/p.jpg", "JPEG2"); const f3 = fingerprints(["aa", "bb"], r);
  assert.notEqual(f3.aa, f2.aa); assert.equal(f3.bb, f2.bb);
  put("raster/src/lib.rs", "fn main() { 1; }"); const f4 = fingerprints(["aa", "bb"], r);
  assert.notEqual(f4.aa, f3.aa); assert.notEqual(f4.bb, f3.bb);
  put("src/core/cards.js", "export const a = 1;\n// a comment line"); const f5 = fingerprints(["aa", "bb"], r);
  assert.deepEqual(f5, f4);   // a whole-line comment changes nothing
  rmSync(r, { recursive: true });
});

import { currentManifest } from "./prerender-manifest-lib.mjs";
test("currentManifest keeps only videos at today's fingerprint and drops them once the tab changes", () => {
  const { r, put } = tree(); const dir = path.join(r, "prerender");
  const fp = fingerprints(["aa"], r).aa;
  put("prerender/aa/c-card-square-en.mp4", "x");
  put("prerender/manifest-en.json", JSON.stringify({ "aa/c-card-square-en.mp4": { bytes: 1, fp }, "aa/gone.mp4": { bytes: 1, fp } }));
  let m = currentManifest(dir, r); assert.deepEqual(Object.keys(m.out), ["aa/c-card-square-en.mp4"]);   // the missing file is not listed
  put("src/tabs/aa/logic.js", "export const x = 3;");
  m = currentManifest(dir, r); assert.deepEqual(m.out, {}); assert.deepEqual(m.stale.aa, ["aa/c-card-square-en.mp4"]);
  rmSync(r, { recursive: true });
});

test("the published manifest leaves out unpublished contributions, the dev manifest keeps them", () => {
  const { r, put } = tree(); const dir = path.join(r, "prerender"); const fp = fingerprints(["aa"], r).aa;
  put("prerender/aa/c-card-square-en.mp4", "x"); put("prerender/_unpublished/aa/d-card-square-en.mp4", "x");
  put("prerender/manifest-en.json", JSON.stringify({ "aa/c-card-square-en.mp4": { bytes: 1, fp }, "_unpublished/aa/d-card-square-en.mp4": { bytes: 1, fp } }));
  assert.equal(Object.keys(currentManifest(dir, r, { publish: true }).out).length, 1);
  assert.equal(Object.keys(currentManifest(dir, r).out).length, 2);
  rmSync(r, { recursive: true });
});
