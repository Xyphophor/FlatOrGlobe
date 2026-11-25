import test from "node:test";
import assert from "node:assert/strict";
import { highlight } from "./highlight.js";
import { SNIPPETS } from "../tabs/rx/snippets.js";

const text = (html) => html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

test("python: keyword, string, comment, number, call", () => {
  const h = highlight('def f(x):  # c\n    return "a<b" + 3.5e2', "py");
  assert.match(h, /<span class="tok-kw">def<\/span> <span class="tok-fn">f<\/span>\(x\):/);
  assert.match(h, /<span class="tok-com"># c<\/span>/);
  assert.match(h, /<span class="tok-str">"a&lt;b"<\/span>/);
  assert.match(h, /<span class="tok-num">3\.5e2<\/span>/);
});
test("c: directive, type, block comment", () => {
  const h = highlight('#include <math.h>\nint main(void) { /* x */ return 0; }', "c");
  assert.match(h, /<span class="tok-type">#include<\/span>/);
  assert.match(h, /<span class="tok-type">int<\/span> <span class="tok-fn">main<\/span>/);
  assert.match(h, /<span class="tok-com">\/\* x \*\/<\/span>/);
});
test("go: raw string, builtin, // in a string is not a comment", () => {
  const h = highlight('s := "http://x" + `a\\nb` // fin\nfmt.Println(len(s))', "go");
  assert.match(h, /<span class="tok-str">"http:\/\/x"<\/span>/);
  assert.match(h, /<span class="tok-str">`a\\nb`<\/span>/);
  assert.match(h, /<span class="tok-com">\/\/ fin<\/span>/);
  assert.match(h, /<span class="tok-builtin">len<\/span>/);
});
test("unknown language: escaped text only", () => assert.equal(highlight("a < b", "brainfuck"), "a &lt; b"));
test("the text of every shipped snippet is unchanged by highlighting (it is only wrapped)", () => {
  for (const [fx, langs] of Object.entries(SNIPPETS)) for (const [l, code] of Object.entries(langs)) assert.equal(text(highlight(code, l)), code, `${fx}/${l}`);
});
