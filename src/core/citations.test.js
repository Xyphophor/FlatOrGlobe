import { test } from "node:test";
import assert from "node:assert/strict";
import { registerSources, cite, renderSources } from "./citations.js";

test("adding a source to the end of one tab's list does not renumber another tab", () => {
  registerSources("a", [{ id: "x", html: "Source X" }]);
  registerSources("b", [{ id: "y", html: "Source Y" }, { id: "z", html: "Source Z" }]);
  assert.match(cite("a", "x"), /\[1\]/);
  assert.match(cite("b", "y"), /\[1\]/);
  assert.match(cite("b", "z"), /\[2\]/);
});

test("inserting a source in the middle renumbers subsequent anchors in that tab", () => {
  registerSources("c", [{ id: "p", html: "P" }, { id: "q", html: "Q" }]);
  assert.match(cite("c", "q"), /\[2\]/);
  registerSources("c", [{ id: "p", html: "P" }, { id: "new", html: "NEW" }, { id: "q", html: "Q" }]);
  assert.match(cite("c", "q"), /\[3\]/);
  assert.match(cite("c", "new"), /\[2\]/);
});

test("renderSources numbers items in array order and ids are scoped per tab, positionally (matches cite()'s href)", () => {
  registerSources("d", [{ id: "s1", html: "One" }, { id: "s2", html: "Two" }]);
  const html = renderSources("d");
  assert.match(html, /id="s-d-n1"/);
  assert.match(html, /id="s-d-n2"/);
  assert.match(html, /\[1\] One/);
  assert.match(html, /\[2\] Two/);
  assert.equal(cite("d", "s1"), '<sup class="ref"><a href="#s-d-n1">[1]</a></sup>');
});

test("citing an unknown source throws rather than silently mislabeling", () => {
  registerSources("e", [{ id: "only", html: "Only" }]);
  assert.throws(() => cite("e", "missing"));
});
