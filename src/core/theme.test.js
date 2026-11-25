import test from "node:test";
import assert from "node:assert/strict";

function fakeEnv(stored) {
  const attrs = {}, store = { v: stored };
  globalThis.document = { documentElement: { setAttribute: (k, v) => (attrs[k] = v), removeAttribute: (k) => delete attrs[k] } };
  globalThis.localStorage = { getItem: () => store.v ?? null, setItem: (_, v) => (store.v = v), removeItem: () => (store.v = undefined) };
  return { attrs, store };
}
const { getTheme, setTheme, applyTheme } = await import("./theme.js");

test("no stored choice, or garbage: auto, and no data-theme", () => {
  const e = fakeEnv(undefined); assert.equal(getTheme(), "auto"); applyTheme(getTheme()); assert.deepEqual(e.attrs, {});
  fakeEnv("purple"); assert.equal(getTheme(), "auto");
});
test("light and dark are remembered and applied; auto clears both", () => {
  const e = fakeEnv(undefined);
  setTheme("dark"); assert.equal(e.store.v, "dark"); assert.equal(e.attrs["data-theme"], "dark"); assert.equal(getTheme(), "dark");
  setTheme("light"); assert.equal(e.attrs["data-theme"], "light");
  setTheme("auto"); assert.equal(e.store.v, undefined); assert.equal(e.attrs["data-theme"], undefined); assert.equal(getTheme(), "auto");
});
test("a browser without storage still switches the page", () => {
  const e = fakeEnv(undefined); globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(getTheme(), "auto"); setTheme("dark"); assert.equal(e.attrs["data-theme"], "dark");
});

test("FIG_PALETTE = le bloc « palette des figures » de theme.css (exports clairs quel que soit le thème)", async () => {
  const { FIG_PALETTE, figColor } = await import("./theme.js");
  const css = (await import("node:fs")).readFileSync(new URL("./theme.css", import.meta.url), "utf8");
  const block = css.slice(css.indexOf(".fig, .figopen, .figsym"));
  const body = block.slice(block.indexOf("{") + 1, block.indexOf("}"));
  const vars = Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  assert.deepEqual(vars, FIG_PALETTE);
  assert.equal(figColor("--ink", "x"), "#151a21");
  assert.equal(figColor("--nope", "x"), "x");
});
