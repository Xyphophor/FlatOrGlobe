// Fumée sans navigateur : un DOM minimal (createElementNS, getElementById)
// suffit pour exécuter chaque générateur de src/core/symbols.js et vérifier
// qu'il monte bien un <svg> tamponné (règle 1) dans chacun de ses hôtes.
import { test } from "node:test";
import assert from "node:assert/strict";

class El {
  constructor(name) { this.name = name; this.attrs = {}; this.children = []; this.textContent = ""; }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k]; }
  appendChild(c) { this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); }
  get lastChild() { return this.children[this.children.length - 1]; }
}
const hosts = new Map();
globalThis.document = {
  createElementNS: (_ns, name) => new El(name),
  createElement: (name) => new El(name),
  getElementById: (id) => { if (!hosts.has(id)) hosts.set(id, new El("div")); return hosts.get(id); },
  querySelectorAll: () => [],
};
const { SYMBOLS_BY_TAB, drawKeySwatches } = await import("./symbols.js");

test("every symbol generator mounts stamped SVGs into its hosts", () => {
  for (const [tab, fns] of Object.entries(SYMBOLS_BY_TAB)) for (const fn of fns) fn();
  drawKeySwatches();
  assert.ok(hosts.size >= 63, `expected >=63 hosts, got ${hosts.size}`);
  for (const [id, host] of hosts) {
    const svg = host.children[0];
    assert.ok(svg && svg.name === "svg", `${id}: no svg mounted`);
    const texts = svg.children.filter((c) => c.name === "text").map((c) => c.textContent);
    assert.ok(texts.some((s) => /not to scale|true scale|exaggeration/.test(s)), `${id}: missing scale stamp`);
  }
});
